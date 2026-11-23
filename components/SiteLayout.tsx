"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthOrAdmin =
    pathname?.startsWith("/admin") ||
    pathname === "/sign-in" ||
    pathname === "/sign-up";

  if (isAuthOrAdmin) {
    return <main className="min-h-screen bg-[#0a0a0a]">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-18 sm:pt-20 md:pt-24">{children}</main>
      <Footer />
    </>
  );
}
