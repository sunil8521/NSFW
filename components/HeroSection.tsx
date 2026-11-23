"use client";

import Link from "next/link";
import {
  Flame,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Film,
  Images,
} from "lucide-react";
import SearchBar from "./SearchBar";

const POPULAR_TAGS = [
  { label: "Desi", href: "/category/desi" },
  { label: "Trending", href: "/category/trending" },
  { label: "Babe", href: "/category/babe" },
  { label: "Couple", href: "/category/couple" },
  { label: "Webcam", href: "/category/webcam" },
  { label: "Amateur", href: "/category/amateur" },
  { label: "MILF", href: "/category/milf" },
  { label: "Big Boobs", href: "/category/big-boobs" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-radial from-[#18100f] via-[#0d0d0d] to-[#080808] border border-[#2a1c1a]/60 p-6 sm:p-10 md:p-12 text-center space-y-6 shadow-2xl">
      {/* Decorative Warm Ambient Glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Retro Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-xs font-semibold text-accent backdrop-blur-xs">
        <Flame className="w-3.5 h-3.5 animate-pulse text-accent" />
        <span className="tracking-wide uppercase font-mono text-[11px] sm:text-xs">
          Vintage Adult Discovery &bull; 100% Free Access
        </span>
      </div>

      {/* Fluid Main Headline */}
      <div className="space-y-3 max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white font-display leading-[1.1]">
          Discover Curated{" "}
          <span className="gradient-text drop-shadow-[0_4px_16px_rgba(229,46,46,0.35)]">
            Desi Hot Pic
          </span>{" "}
          Galleries
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          High-definition adult photo albums, private collections, and instant streaming videos. Handcrafted curation, updated daily with zero paywalls.
        </p>
      </div>

      {/* Prominent Search Bar */}
      <div className="max-w-xl mx-auto pt-1">
        <SearchBar size="lg" placeholder="Search thousands of albums & videos..." />
      </div>

      {/* Popular Tags */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-1 text-xs">
        <span className="text-zinc-500 text-[11px] uppercase font-mono mr-1 flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-accent" /> Trending:
        </span>
        {POPULAR_TAGS.map((tag) => (
          <Link
            key={tag.label}
            href={tag.href}
            className="px-2.5 py-1 rounded-lg bg-[#141414] hover:bg-[#1f1f1f] border border-[#262626] hover:border-accent/40 text-zinc-300 hover:text-white transition-all text-[11px] sm:text-xs font-medium"
          >
            #{tag.label}
          </Link>
        ))}
      </div>

      {/* Value Highlights Pill Bar */}
      <div className="pt-4 border-t border-[#1c1c1c] flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[11px] sm:text-xs text-zinc-400 font-medium">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Strictly 18+ Verified</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Film className="w-4 h-4 text-accent" />
          <span>Multi-Server Streaming</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Images className="w-4 h-4 text-amber-400" />
          <span>Uncompressed HD Galleries</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>No Login Required To Browse</span>
        </div>
      </div>
    </section>
  );
}
