"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { dbService } from "@/lib/db";

export async function likePostAction(postId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      success: false,
      error: "UNAUTHORIZED",
      message: "Please sign in with Google to like this post.",
      likes: 0,
      alreadyLiked: false,
    };
  }

  const result = await dbService.likePost(session.user.id, postId);

  if (result.success) {
    revalidatePath(`/post/${postId}`);
  }

  return result;
}

export async function checkUserLikedAction(postId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { liked: false };
  }

  const liked = await dbService.hasUserLiked(session.user.id, postId);
  return { liked };
}
