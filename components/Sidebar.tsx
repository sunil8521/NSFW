"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  TrendingUp,
  Heart,
  Users,
  Video,
  Camera,
  Crown,
  Globe,
  Sparkles,
  ShieldCheck,
  Bookmark,
  ExternalLink,
  Tag,
} from "lucide-react";

const CATEGORIES = [
  { name: "Desi", href: "/category/desi", icon: Flame, count: "48+" },
  { name: "Trending", href: "/category/trending", icon: TrendingUp, count: "Hot" },
  { name: "Babe", href: "/category/babe", icon: Heart, count: "HD" },
  { name: "Couple", href: "/category/couple", icon: Users, count: "Top" },
  { name: "Webcam", href: "/category/webcam", icon: Video, count: "Live" },
  { name: "Amateur", href: "/category/amateur", icon: Camera, count: "New" },
  { name: "MILF", href: "/category/milf", icon: Crown, count: "Exclusive" },
  { name: "Big Boobs", href: "/category/big-boobs", icon: Sparkles, count: "Popular" },
];

const TRENDING_TAGS = [
  "desi",
  "viral",
  "babe",
  "couple",
  "photoshoot",
  "webcam",
  "amateur",
  "milf",
  "hd",
  "selfie",
  "bedroom",
  "outdoor",
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="space-y-6 sticky top-24">
      {/* 1. Category Quick Browser */}
      <div className="p-5 rounded-2xl bg-[#121212] border border-[#222] space-y-4">
        <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-accent" />
            <span>Popular Categories</span>
          </h3>
          <span className="text-[10px] text-zinc-500 font-mono">18+</span>
        </div>

        <div className="space-y-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = pathname === cat.href;
            return (
              <Link
                key={cat.href}
                href={cat.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-accent text-white font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-[#181818]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? "text-white" : "text-zinc-500 group-hover:text-accent"
                    }`}
                  />
                  <span>{cat.name}</span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive
                      ? "bg-black/30 text-white"
                      : "bg-[#1c1c1c] text-zinc-500"
                  }`}
                >
                  {cat.count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 2. Trending Tags Cloud */}
      <div className="p-5 rounded-2xl bg-[#121212] border border-[#222] space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-[#1c1c1c] pb-3">
          <Tag className="w-3.5 h-3.5 text-accent" />
          <span>Trending Tags</span>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {TRENDING_TAGS.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#181818] hover:bg-[#202020] text-zinc-300 hover:text-white border border-[#282828] hover:border-accent/30 transition-all"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      {/* 3. Bookmarks & Quick Actions */}
      <div className="p-4 rounded-2xl bg-linear-to-b from-[#181211] to-[#121212] border border-accent/20 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent">
            <Bookmark className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Your Saved Favorites</h4>
            <p className="text-[10px] text-zinc-400">1-click access anytime</p>
          </div>
        </div>

        <Link
          href="/saved"
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-md transition-colors"
        >
          <span>Open Bookmarks</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* 4. Safety & Compliance Badge */}
      <div className="p-4 rounded-2xl bg-[#101010] border border-[#222] space-y-2 text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Statutory Compliance Verified</span>
        </div>
        <p className="text-[10px] text-zinc-500 leading-relaxed">
          Records pursuant to 18 U.S.C. 2257 on file. All subjects are consenting adults 18+.
        </p>
        <div className="flex items-center gap-2 text-[10px] pt-1">
          <Link href="/2257" className="text-accent hover:underline">
            2257 Notice
          </Link>
          <span className="text-zinc-600">&bull;</span>
          <Link href="/dmca" className="text-zinc-400 hover:text-white">
            DMCA
          </Link>
          <span className="text-zinc-600">&bull;</span>
          <Link href="/age-verification" className="text-zinc-400 hover:text-white">
            18+ Policy
          </Link>
        </div>
      </div>
    </aside>
  );
}
