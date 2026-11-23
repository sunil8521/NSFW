import { requireAdmin } from "@/lib/auth/dal";
import AdminShell from "@/components/admin/AdminShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel — Desi Hot Pic",
  description: "Desi Hot Pic Content & Site Management",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return <AdminShell session={session}>{children}</AdminShell>;
}
