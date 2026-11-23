import https from "node:https";
import http from "node:http";
import crypto from "node:crypto";
import { URL } from "node:url";
import { dbService, type UploadedImageItem } from "./db";

const IMAGETWIST_API_KEY = process.env.IMAGETWIST_API_KEY!;

function httpsRequest(
  options: https.RequestOptions,
  bodyData?: Buffer | string
): Promise<{ status: number; headers: http.IncomingHttpHeaders; data: string }> {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () =>
        resolve({
          status: res.statusCode || 0,
          headers: res.headers,
          data,
        })
      );
    });
    req.on("error", reject);
    req.setTimeout(45000, () => {
      req.destroy(new Error("Request timed out to ImageTwist"));
    });
    if (bodyData) {
      req.write(bodyData);
    }
    req.end();
  });
}

export interface UploadImageOptions {
  buffer: Buffer;
  filename?: string;
  title?: string;
  thumbnailSize?: "100x100" | "170x170" | "250x250" | "300x300" | "350x350" | "500x500" | "800x800";
}

export interface UploadRemoteImageOptions {
  url: string;
  title?: string;
  thumbnailSize?: "100x100" | "170x170" | "250x250" | "300x300" | "350x350" | "500x500" | "800x800";
}

/**
 * Clean & sanitize filename to meet ImageTwist API requirements:
 * ASCII alphanumeric, underscore, hyphen, max 120 chars, ending in valid extension.
 */
function sanitizeFilename(rawName: string = "image.jpg"): string {
  const extMatch = rawName.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const ext = extMatch ? extMatch[1].toLowerCase() : "jpg";
  const base = rawName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^A-Za-z0-9_-]/g, "_")
    .replace(/^_+/, "")
    .slice(0, 80);

  const cleanBase = base || `img_${Date.now()}`;
  return `${cleanBase}.${ext === "jpeg" ? "jpg" : ext}`;
}

/**
 * Upload an image buffer to ImageTwist via the official v1 API
 */
export async function uploadImageBufferToImageTwist({
  buffer,
  filename = "upload.jpg",
  title,
  thumbnailSize = "500x500",
}: UploadImageOptions): Promise<UploadedImageItem> {
  if (!IMAGETWIST_API_KEY) {
    throw new Error("IMAGETWIST_API_KEY is not configured in environment variables.");
  }

  if (!buffer || buffer.length === 0) {
    throw new Error("Empty image buffer provided for upload.");
  }

  const cleanFilename = sanitizeFilename(filename);
  const sizeBytes = buffer.length;
  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
  const idempotencyKey = crypto.randomBytes(16).toString("hex");

  // Step 1: Request upload ticket
  const ticketRes = await httpsRequest(
    {
      hostname: "imagetwist.com",
      path: "/api/v1/uploads",
      method: "POST",
      headers: {
        Authorization: `Bearer ${IMAGETWIST_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    },
    JSON.stringify({
      filename: cleanFilename,
      size_bytes: sizeBytes,
      sha256,
      thumbnail_size: thumbnailSize,
      gallery_id: 0,
    })
  );

  if (ticketRes.status !== 200 && ticketRes.status !== 201) {
    let errMsg = `Failed to get upload ticket: HTTP ${ticketRes.status}`;
    try {
      const errJson = JSON.parse(ticketRes.data);
      if (errJson.error?.message) errMsg += ` - ${errJson.error.message}`;
    } catch {}
    throw new Error(errMsg);
  }

  const receipt = JSON.parse(ticketRes.data);
  const transfer = receipt.transfer;
  if (!transfer || !transfer.batch_url || !transfer.upload_url || !transfer.fields) {
    throw new Error("Invalid transfer receipt received from ImageTwist.");
  }

  const fields = { ...transfer.fields };

  // Step 2: Request batch ticket from storage worker
  const batchUrl = new URL(transfer.batch_url);
  const batchForm = `count=1&sess_id=${encodeURIComponent(fields.sess_id)}`;

  const batchRes = await httpsRequest(
    {
      hostname: batchUrl.hostname,
      path: batchUrl.pathname + batchUrl.search,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(batchForm),
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    },
    batchForm
  );

  const batchMatch = batchRes.data.match(/BATCH:([a-f0-9.]{50,180})/);
  if (!batchMatch) {
    throw new Error(`Storage server did not return batch ticket: ${batchRes.data.slice(0, 100)}`);
  }

  const batchTicket = batchMatch[1];
  fields.it_batch = batchTicket;

  // Step 3: Stream multipart form-data to upload_url
  const uploadUrl = new URL(transfer.upload_url);
  const boundary = `----WebKitFormBoundary${crypto.randomBytes(12).toString("hex")}`;

  const parts: Buffer[] = [];
  for (const name of ["sess_id", "filesCount", "fileName", "fld_id", "thumb_size", "it_batch"]) {
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${fields[name]}\r\n`
      )
    );
  }

  parts.push(
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="Filedata"; filename="${cleanFilename}"\r\nContent-Type: application/octet-stream\r\n\r\n`
    )
  );
  parts.push(buffer);
  parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));
  const fullMultipart = Buffer.concat(parts);

  const uploadRes = await httpsRequest(
    {
      hostname: uploadUrl.hostname,
      path: uploadUrl.pathname + (uploadUrl.search || ""),
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": fullMultipart.length,
        "X-ImageTwist-Batch": batchTicket,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    },
    fullMultipart
  );

  if (uploadRes.status !== 200) {
    throw new Error(`Upload to storage server failed with HTTP ${uploadRes.status}`);
  }

  // Step 4: Poll receipt until complete
  let fileData: { code: string; page_url: string; alternate_page_urls?: Record<string, string> } | null = null;

  for (let attempt = 0; attempt < 10; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const pollRes = await httpsRequest({
      hostname: "imagetwist.com",
      path: `/api/v1/uploads/${receipt.id}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${IMAGETWIST_API_KEY}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    try {
      const pollJson = JSON.parse(pollRes.data);
      if (pollJson.status === "complete" && pollJson.file) {
        fileData = pollJson.file;
        break;
      }
      if (pollJson.status === "expired") {
        throw new Error("Upload receipt expired on ImageTwist.");
      }
    } catch (e: any) {
      if (e.message?.includes("expired")) throw e;
    }
  }

  if (!fileData) {
    throw new Error("Timed out waiting for ImageTwist upload confirmation.");
  }

  // Step 5: Extract direct image CDN URL & thumbnail CDN URL from the published page
  let directUrl = fileData.page_url;
  let thumbnailUrl = fileData.page_url;

  try {
    const pageRes = await httpsRequest({
      hostname: "imagetwist.com",
      path: `/${fileData.code}`,
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const directImgMatch = pageRes.data.match(
      /https:\/\/[a-z0-9.-]+\.imagetwist\.com\/i\/[0-9]+\/[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+(?:\/[^"'\s<]+)?/
    );
    const directThumbMatch = pageRes.data.match(
      /https:\/\/[a-z0-9.-]+\.imagetwist\.com\/th\/[0-9]+\/[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+/
    );

    if (directImgMatch) directUrl = directImgMatch[0];
    if (directThumbMatch) thumbnailUrl = directThumbMatch[0];
  } catch (err) {
    console.warn("Could not scrape direct CDN URLs from ImageTwist page; using pageUrl fallback", err);
  }

  // Fallback: If no direct thumbnail was scraped, generate from directUrl
  if (!thumbnailUrl || thumbnailUrl === fileData.page_url) {
    if (directUrl && directUrl.includes("/i/")) {
      thumbnailUrl = directUrl.replace(/\/i\/(\d+\/[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+).*/, "/th/$1");
    } else {
      thumbnailUrl = directUrl;
    }
  }

  const finalTitle =
    (title || "").trim() ||
    cleanFilename.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ");

  // Persist record to MongoDB
  const savedImage = await dbService.createUploadedImage({
    title: finalTitle,
    originalName: filename,
    size: sizeBytes,
    code: fileData.code,
    pageUrl: fileData.page_url,
    directUrl,
    thumbnailUrl,
    alternateUrls: fileData.alternate_page_urls || {},
  });

  return savedImage;
}

/**
 * Upload a remote image URL to ImageTwist
 */
export async function uploadRemoteImageUrlToImageTwist({
  url,
  title,
  thumbnailSize = "500x500",
}: UploadRemoteImageOptions): Promise<UploadedImageItem> {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    throw new Error("Remote image URL is required");
  }

  // Fetch remote image
  const response = await fetch(trimmedUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download remote image: HTTP ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Derive filename from URL or header
  const urlPath = new URL(trimmedUrl).pathname;
  let filename = urlPath.split("/").pop() || "image.jpg";
  if (!filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("png")) filename += ".png";
    else if (contentType.includes("webp")) filename += ".webp";
    else if (contentType.includes("gif")) filename += ".gif";
    else filename += ".jpg";
  }

  return uploadImageBufferToImageTwist({
    buffer,
    filename,
    title,
    thumbnailSize,
  });
}
