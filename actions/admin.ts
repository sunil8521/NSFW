"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { dbService } from "@/lib/db";
import type { Post, VideoLink } from "@/types/post";

export interface AdminPostInput {
  title: string;
  category: string;
  tags: string[];
  imageLinks: string[];
  videoLinks: {
    label: string;
    url: string;
    provider: string;
  }[];
  description?: string;
  uploader?: string;
  uploadDate?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
}

export async function createPostAction(input: AdminPostInput) {
  const session = await requireAdmin();

  // Validate title
  const title = input.title?.trim();
  if (!title) {
    throw new Error("Title is required");
  }

  // Validate category
  const category = input.category?.trim();
  if (!category) {
    throw new Error("Category is required");
  }

  // Validate tags (max 7)
  const validTags = (input.tags || [])
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  if (validTags.length > 7) {
    throw new Error("Maximum 7 tags are allowed");
  }

  // Validate image links
  const imageLinks = (input.imageLinks || [])
    .map((url) => url.trim())
    .filter((url) => url.length > 0);
  if (imageLinks.length === 0) {
    throw new Error("At least one image link is required");
  }

  // Video links
  const validVideoLinks: VideoLink[] = (input.videoLinks || [])
    .filter((v) => v.url && v.url.trim().length > 0)
    .map((v, i) => ({
      label: v.label?.trim() || `Server ${i + 1}`,
      url: v.url.trim(),
      provider: v.provider?.trim() || "streamtape",
    }));

  // Auto defaults
  const uploader =
    input.uploader?.trim() ||
    session.user.name ||
    session.user.email.split("@")[0];
  const uploadDate = input.uploadDate?.trim() || new Date().toISOString();
  const baseSlug = slugify(title);
  const id = `post_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

  const newPostData = {
    id,
    title,
    slug: baseSlug,
    description: input.description?.trim() || "",
    category,
    tags: validTags,
    uploader,
    uploadDate,
    thumbnailUrl: imageLinks[0],
    images: imageLinks,
    videoLinks: validVideoLinks,
    stats: {
      views: 0,
      likes: 0,
      comments: 0,
      photoCount: imageLinks.length,
      videoCount: validVideoLinks.length,
    },
  };

  const created = await dbService.createPost(newPostData);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  revalidatePath(`/category/${category}`);

  return { success: true, post: created };
}

export async function updatePostAction(id: string, input: AdminPostInput) {
  const session = await requireAdmin();

  const title = input.title?.trim();
  if (!title) {
    throw new Error("Title is required");
  }

  const category = input.category?.trim();
  if (!category) {
    throw new Error("Category is required");
  }

  const validTags = (input.tags || [])
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  if (validTags.length > 7) {
    throw new Error("Maximum 7 tags are allowed");
  }

  const imageLinks = (input.imageLinks || [])
    .map((url) => url.trim())
    .filter((url) => url.length > 0);
  if (imageLinks.length === 0) {
    throw new Error("At least one image link is required");
  }

  const validVideoLinks: VideoLink[] = (input.videoLinks || [])
    .filter((v) => v.url && v.url.trim().length > 0)
    .map((v, i) => ({
      label: v.label?.trim() || `Server ${i + 1}`,
      url: v.url.trim(),
      provider: v.provider?.trim() || "streamtape",
    }));

  const updated = await dbService.updatePost(id, {
    title,
    slug: slugify(title),
    description: input.description?.trim() || "",
    category,
    tags: validTags,
    thumbnailUrl: imageLinks[0],
    images: imageLinks,
    videoLinks: validVideoLinks,
  });

  if (!updated) {
    throw new Error("Post not found");
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  revalidatePath(`/post/${id}`);
  revalidatePath(`/category/${category}`);

  return { success: true, post: updated };
}

export async function deletePostAction(id: string) {
  await requireAdmin();

  const success = await dbService.deletePost(id);
  if (!success) {
    throw new Error("Post could not be deleted or does not exist");
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/posts");

  return { success: true };
}
