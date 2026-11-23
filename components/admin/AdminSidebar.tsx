"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Film,
  PlusCircle,
  UploadCloud,
  ExternalLink,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "All Posts", href: "/admin/posts", icon: Film },
  { name: "Auto Upload", href: "/admin/auto-upload", icon: UploadCloud },
  { name: "Upload Post", href: "/admin/posts/new", icon: PlusCircle },
];

export default function AdminSidebar({
  isOpen,
  setIsOpen,
  userName,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  userName: string;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0d0d0d] border-r border-[#222] text-[#a3a3a3] flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Brand Header with Desi Hot Pic Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1c1c1c]">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="relative h-11 w-36">
            <Image
              src="/logo.png"
              alt="Desi Hot Pic"
              fill
              priority
              className="object-contain object-left"
            />
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent/20 text-accent border border-accent/30 tracking-wider shrink-0">
            ADMIN
          </span>
        </Link>
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider font-mono">
          Administration
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-accent/15 text-accent border border-accent/30 font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-[#161616]"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-accent" : "text-zinc-500"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider font-mono">
          Public Site
        </div>
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-[#161616] transition-colors group"
        >
          <span className="flex items-center gap-3">
            <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-accent transition-colors" />
            <span>Open Public Site</span>
          </span>
        </Link>
      </nav>

      {/* Footer User Info - No u: 1 */}
      <div className="p-4 border-t border-[#1c1c1c] bg-[#090909]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-sm font-bold">
            {userName ? userName[0].toUpperCase() : "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{userName}</p>
            <p className="text-[10px] text-zinc-400">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
