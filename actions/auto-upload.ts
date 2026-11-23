"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { dbService, type UploadedVideoItem } from "@/lib/db";
import { spawn } from "child_process";

const STREAMTAPE_LOGIN = process.env.STREAMTAPE_LOGIN!;
const STREAMTAPE_KEY = process.env.STREAMTAPE_KEY!;
const VIDARA_API_KEY = process.env.VIDARA_API_KEY!;

function execCurl(args: string[]): Promise<any> {
  return new Promise((resolve) => {
    const p = spawn("curl", ["-s", "--ipv4", ...args]);
    let stdout = "";
    p.stdout.on("data", (d) => (stdout += d));
    p.on("close", () => {
      try {
        resolve(JSON.parse(stdout));
      } catch {
        resolve(stdout);
      }
    });
  });
}

export interface RemoteUrlUploadInput {
  title?: string;
  url: string;
}

export interface RemoteUrlUploadResult {
  success: boolean;
  video?: UploadedVideoItem;
  error?: string;
}

/**
 * Server Action: Upload / Register a remote video URL
 * Next.js 16 mutation pattern
 */
export async function uploadRemoteVideoUrlAction(
  input: RemoteUrlUploadInput
): Promise<RemoteUrlUploadResult> {
  await requireAdmin();

  const url = (input.url || "").trim();
  if (!url) {
    return { success: false, error: "Remote video URL is required." };
  }

  const title = (input.title || "").trim() || "Remote Video " + new Date().toISOString().slice(0, 10);
  const id = `vid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

  // Determine host from URL
  let streamtapeData: any = undefined;
  let vidaraData: any = undefined;

  if (url.includes("streamtape.com")) {
    const fileIdMatch = url.match(/(?:v|e)\/([a-zA-Z0-9_-]+)/);
    const fileId = fileIdMatch ? fileIdMatch[1] : "";
    streamtapeData = {
      fileId,
      watchUrl: `https://streamtape.com/v/${fileId}`,
      embedUrl: `https://streamtape.com/e/${fileId}`,
    };
  } else if (url.includes("vidara.") || url.includes("vidara.to") || url.includes("vidara.so")) {
    const codeMatch = url.match(/(?:e|v|d)\/([a-zA-Z0-9_-]+)/);
    const code = codeMatch ? codeMatch[1] : "";
    vidaraData = {
      filecode: code,
      watchUrl: `https://vidara.to/v/${code}`,
      embedUrl: `https://vidara.to/e/${code}`,
    };
  } else {
    // Generic direct remote URL: available on both or direct
    streamtapeData = {
      fileId: "direct",
      watchUrl: url,
      embedUrl: url,
    };
  }

  try {
    const videoItem: Omit<UploadedVideoItem, "id" | "createdAt"> & { id?: string } = {
      id,
      title,
      originalName: title,
      size: 0,
      streamtape: streamtapeData || {
        fileId: "",
        watchUrl: "",
        embedUrl: "",
      },
      vidara: vidaraData || {
        filecode: "",
        watchUrl: "",
        embedUrl: "",
      },
    };

    const saved = await dbService.createUploadedVideo(videoItem);

    revalidatePath("/admin/auto-upload");
    revalidatePath("/admin/posts");

    return { success: true, video: saved };
  } catch (err: any) {
    console.error("uploadRemoteVideoUrlAction error:", err);
    return {
      success: false,
      error: err?.message || "Failed to save remote video URL.",
    };
  }
}

/**
 * Server Action: Delete an uploaded video record (and optionally from remote hosts)
 * Next.js 16 mutation pattern
 */
export async function deleteUploadedVideoAction(
  id: string,
  deleteFromHosts = false
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  if (!id) {
    return { success: false, error: "Missing video id" };
  }

  try {
    const video = await dbService.getUploadedVideoById(id);

    // If requested, also delete video files from Streamtape & Vidara hosting servers
    if (deleteFromHosts && video) {
      if (video.streamtape?.fileId && video.streamtape.fileId !== "direct") {
        const stDelUrl = `https://api.streamtape.com/file/delete?login=${STREAMTAPE_LOGIN}&key=${STREAMTAPE_KEY}&file=${video.streamtape.fileId}`;
        await execCurl([stDelUrl]).catch(() => null);
      }

      if (video.vidara?.filecode) {
        const vdDelUrl = `https://api.vidara.so/v1/video/delete?api_key=${VIDARA_API_KEY}&filecode=${video.vidara.filecode}`;
        await execCurl([vdDelUrl]).catch(() => null);
      }
    }

    const deleted = await dbService.deleteUploadedVideo(id);

    revalidatePath("/admin/auto-upload");

    return { success: deleted };
  } catch (err: any) {
    console.error("deleteUploadedVideoAction error:", err);
    return {
      success: false,
      error: err?.message || "Failed to delete video.",
    };
  }
}
