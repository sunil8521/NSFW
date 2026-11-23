import { requireAdmin } from "@/lib/auth/dal";
import { dbService } from "@/lib/db";
import AutoImageUploadManager from "@/components/admin/AutoImageUploadManager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auto Image Upload (ImageTwist) — Admin Panel",
};

export default async function AutoImageUploadPage() {
  await requireAdmin();
  const initialImages = await dbService.getUploadedImages();

  return (
    <div className="space-y-6">
      <AutoImageUploadManager initialImages={initialImages} />
    </div>
  );
}
