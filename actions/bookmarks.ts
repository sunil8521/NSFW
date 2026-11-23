"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { dbService } from "@/lib/db";

export interface ToggleSaveResult {
  success: boolean;
  saved: boolean;
  error?: string;
}

export async function toggleSavePostAction(
  postId: string
): Promise<ToggleSaveResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      success: false,
      saved: false,
      error: "Unauthorized. Please sign in with Google to save posts.",
    };
  }

  if (!postId) {
    return {
      success: false,
      saved: false,
      error: "Post ID is required.",
    };
  }

  try {
    const result = await dbService.toggleSavePost(session.user.id, postId);

    revalidatePath("/saved");
    revalidatePath(`/post/${postId}`);

    return {
      success: true,
      saved: result.saved,
    };
  } catch (err: any) {
    console.error("toggleSavePostAction error:", err);
    return {
      success: false,
      saved: false,
      error: err?.message || "Failed to update saved post.",
    };
  }
}

export async function checkIsSavedAction(postId: string): Promise<{ saved: boolean }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || !postId) {
    return { saved: false };
  }

  const saved = await dbService.isPostSaved(session.user.id, postId);
  return { saved };
}
