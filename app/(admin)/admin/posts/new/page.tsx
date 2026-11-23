import { requireAdmin } from "@/lib/auth/dal";
import PostForm from "@/components/admin/PostForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload Post — Desi Hot Pic Admin",
  description: "Upload and publish new media links",
};

export default async function NewPostPage() {
  const session = await requireAdmin();

  return (
    <PostForm
      adminName={session.user.name || session.user.email}
      isEdit={false}
    />
  );
}
