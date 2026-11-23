import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/dal";
import {
  uploadImageBufferToImageTwist,
  uploadRemoteImageUrlToImageTwist,
} from "@/lib/imagetwist";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Compatible with Vercel Hobby plan

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const remoteUrl = (formData.get("remoteUrl") as string | null)?.trim() || "";
    const customTitle = (formData.get("title") as string | null)?.trim() || "";
    const thumbnailSize =
      (formData.get("thumbnailSize") as any) || "500x500";

    if (!file && !remoteUrl) {
      return new Response(
        JSON.stringify({ error: "Please provide either an image file or a remote URL" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (remoteUrl) {
      const image = await uploadRemoteImageUrlToImageTwist({
        url: remoteUrl,
        title: customTitle,
        thumbnailSize,
      });

      return new Response(JSON.stringify({ success: true, image }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const image = await uploadImageBufferToImageTwist({
        buffer,
        filename: file.name,
        title: customTitle || file.name,
        thumbnailSize,
      });

      return new Response(JSON.stringify({ success: true, image }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid upload request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("API /api/admin/auto-upload-image error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Failed to upload image to ImageTwist" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
