"use client";

import Link from "next/link";
import { Menu, Plus, ExternalLink } from "lucide-react";

export default function AdminHeader({
  userName,
  onOpenMobileMenu,
}: {
  userName: string;
  onOpenMobileMenu: () => void;
}) {
  return (
    <header className="h-16 bg-[#0d0d0d] border-b border-[#222] px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="hidden sm:inline-block text-xs font-semibold text-zinc-400 font-mono tracking-wider">
          DesiHotPic Admin Panel
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-[#141414] border border-[#262626] hover:bg-[#1f1f1f] transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>View Site</span>
        </Link>

        <Link
          href="/admin/posts/new"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-accent hover:bg-accent-hover transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Post</span>
        </Link>

        <div className="flex items-center gap-2 pl-2 border-l border-[#222]">
          <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-xs font-bold">
            {userName ? userName[0].toUpperCase() : "A"}
          </div>
          <span className="hidden sm:block text-xs font-semibold text-zinc-200">
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
}
