import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/dal";
import { dbService } from "@/lib/db";
import PostForm from "@/components/admin/PostForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Post — Desi Hot Pic Admin",
  description: "Edit post details and media links",
};

export default async function EditPostPage(props: PageProps<"/admin/posts/[id]/edit">) {
  const session = await requireAdmin();
  const { id } = await props.params;
  const post = await dbService.getPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <PostForm
      initialData={post}
      adminName={session.user.name || session.user.email}
      isEdit={true}
    />
  );
}
