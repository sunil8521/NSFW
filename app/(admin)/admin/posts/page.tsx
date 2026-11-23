import { requireAdmin } from "@/lib/auth/dal";
import { dbService } from "@/lib/db";
import PostsTable from "@/components/admin/PostsTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Posts — Desi Hot Pic Admin",
  description: "Manage and curate posts on Desi Hot Pic",
};

export default async function AdminPostsPage() {
  await requireAdmin();
  const posts = await dbService.getAllPosts();

  return <PostsTable initialPosts={posts} />;
}
