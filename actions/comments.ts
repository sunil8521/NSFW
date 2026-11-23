"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { dbService } from "@/lib/db";
import type { CommentItem } from "@/lib/db";

export interface CommentActionResult {
  success: boolean;
  comment?: CommentItem;
  error?: string;
}

export async function addCommentAction(
  postId: string,
  content: string
): Promise<CommentActionResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      success: false,
      error: "Unauthorized. Please sign in with Google to comment.",
    };
  }

  const trimmed = (content || "").trim();
  if (!postId || !trimmed) {
    return {
      success: false,
      error: "Post ID and comment content are required.",
    };
  }

  try {
    const comment = await dbService.addComment(
      postId,
      session.user.id,
      session.user.name || "Anonymous",
      session.user.image || null,
      trimmed
    );

    revalidatePath(`/post/${postId}`);

    return { success: true, comment };
  } catch (err: any) {
    console.error("addCommentAction error:", err);
    return {
      success: false,
      error: err?.message || "Failed to add comment.",
    };
  }
}

export async function deleteCommentAction(
  commentId: string,
  postId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  if (!commentId) {
    return { success: false, error: "Comment ID is required." };
  }

  try {
    const deleted = await dbService.deleteComment(commentId, session.user.id);
    if (!deleted) {
      return {
        success: false,
        error: "Comment not found or unauthorized to delete.",
      };
    }

    if (postId) {
      revalidatePath(`/post/${postId}`);
    }

    return { success: true };
  } catch (err: any) {
    console.error("deleteCommentAction error:", err);
    return {
      success: false,
      error: err?.message || "Failed to delete comment.",
    };
  }
}
