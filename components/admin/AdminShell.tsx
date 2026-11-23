"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import type { AuthSession } from "@/lib/auth/dal";
import { Menu } from "lucide-react";

export default function AdminShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: AuthSession;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userName = session.user.name || session.user.email;

  return (
    <div className="flex h-screen w-full bg-[#080808] text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar - Kept as requested */}
      <AdminSidebar
        isOpen={mobileMenuOpen}
        setIsOpen={setMobileMenuOpen}
        userName={userName}
      />

      {/* Main Content Area - Header removed completely */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Floating Mobile Toggle Button (Only on small screens) */}
        <div className="lg:hidden p-3 flex items-center justify-between border-b border-[#1c1c1c] bg-[#0c0c0c] shrink-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg bg-[#181818] border border-[#262626] text-zinc-300 hover:text-white"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold text-zinc-300">
            Admin Panel
          </span>
          <div className="w-8" />
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto space-y-6 pb-12">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-30 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
