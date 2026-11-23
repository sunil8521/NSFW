import { requireAdmin } from "@/lib/auth/dal";
import { dbService } from "@/lib/db";
import AutoUploadManager from "@/components/admin/AutoUploadManager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auto Video Upload — Admin Panel",
};

export default async function AutoUploadPage() {
  await requireAdmin();
  const initialVideos = await dbService.getUploadedVideos();

  return (
    <div className="space-y-6">
      <AutoUploadManager initialVideos={initialVideos} />
    </div>
  );
}
