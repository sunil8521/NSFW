"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { dbService, type UploadedImageItem } from "@/lib/db";
import {
  uploadImageBufferToImageTwist,
  uploadRemoteImageUrlToImageTwist,
} from "@/lib/imagetwist";

export interface UploadImageActionResult {
  success: boolean;
  image?: UploadedImageItem;
  error?: string;
}

/**
 * Server Action: Upload an image file to ImageTwist and save record to DB
 */
export async function uploadImageFileAction(
  formData: FormData
): Promise<UploadImageActionResult> {
  await requireAdmin();

  try {
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string | null)?.trim() || "";
    const thumbnailSize = (formData.get("thumbnailSize") as any) || "500x500";

    if (!file || file.size === 0) {
      return { success: false, error: "Please select an image file to upload." };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const image = await uploadImageBufferToImageTwist({
      buffer,
      filename: file.name,
      title: title || file.name,
      thumbnailSize,
    });

    revalidatePath("/admin/auto-upload-image");
    revalidatePath("/admin/posts");
    revalidatePath("/admin/posts/new");

    return { success: true, image };
  } catch (err: any) {
    console.error("uploadImageFileAction error:", err);
    return {
      success: false,
      error: err?.message || "Failed to upload image to ImageTwist.",
    };
  }
}

/**
 * Server Action: Upload an image from a remote URL to ImageTwist
 */
export async function uploadRemoteImageUrlAction(input: {
  url: string;
  title?: string;
  thumbnailSize?: "100x100" | "170x170" | "250x250" | "300x300" | "350x350" | "500x500" | "800x800";
}): Promise<UploadImageActionResult> {
  await requireAdmin();

  try {
    const url = (input.url || "").trim();
    if (!url) {
      return { success: false, error: "Remote image URL is required." };
    }

    const image = await uploadRemoteImageUrlToImageTwist({
      url,
      title: input.title,
      thumbnailSize: input.thumbnailSize || "500x500",
    });

    revalidatePath("/admin/auto-upload-image");
    revalidatePath("/admin/posts");
    revalidatePath("/admin/posts/new");

    return { success: true, image };
  } catch (err: any) {
    console.error("uploadRemoteImageUrlAction error:", err);
    return {
      success: false,
      error: err?.message || "Failed to fetch and upload remote image.",
    };
  }
}

/**
 * Server Action: Delete an uploaded image from DB
 */
export async function deleteUploadedImageAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  if (!id) {
    return { success: false, error: "Missing image id" };
  }

  try {
    const deleted = await dbService.deleteUploadedImage(id);
    revalidatePath("/admin/auto-upload-image");
    return { success: deleted };
  } catch (err: any) {
    console.error("deleteUploadedImageAction error:", err);
    return {
      success: false,
      error: err?.message || "Failed to delete image record.",
    };
  }
}
