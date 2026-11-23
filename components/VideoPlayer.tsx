"use client";

import { useState } from "react";
import type { VideoLink } from "@/types/post";
import { Play, Server, ExternalLink, Sparkles } from "lucide-react";

interface VideoPlayerProps {
  videoLinks: VideoLink[];
  title: string;
  poster?: string;
}

export default function VideoPlayer({
  videoLinks,
  title,
  poster,
}: VideoPlayerProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!videoLinks || videoLinks.length === 0) return null;

  const activeLink = videoLinks[activeIndex] || videoLinks[0];

  return (
    <section className="space-y-3.5">
      {/* Top Header: Server Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <h2 className="text-sm font-semibold text-[#f5f5f5] uppercase tracking-wider font-display flex items-center gap-2">
            <span>Streaming Player</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-accent/20 text-accent border border-accent/30 tracking-normal">
              720p HD
            </span>
          </h2>
        </div>

        {/* Server Selection Buttons */}
        {videoLinks.length > 1 && (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#141414] border border-[#262626]">
            <span className="text-[11px] font-medium text-zinc-400 px-2 flex items-center gap-1 hidden sm:inline-flex">
              <Server className="w-3 h-3 text-zinc-500" />
              <span>Source:</span>
            </span>
            {videoLinks.map((link, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-accent text-white shadow-md shadow-accent/25"
                      : "text-zinc-400 hover:text-white hover:bg-[#1f1f1f]"
                  }`}
                  aria-label={`Switch to ${link.label || `Server ${idx + 1}`}`}
                >
                  <Play className={`w-3 h-3 ${isActive ? "fill-current" : ""}`} />
                  <span>{link.label || `Server ${idx + 1}`}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Responsive 16:9 Video Embed Player */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-[#262626] shadow-2xl">
        <iframe
          key={activeLink.url}
          src={activeLink.url}
          title={`${title} - ${activeLink.label}`}
          className="absolute inset-0 w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        />
      </div>

      {/* Bottom Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs text-[#737373]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>
            Playing via <strong className="text-zinc-300 font-medium">{activeLink.label || "HD Stream"}</strong>. If video buffers, switch server above.
          </span>
        </div>

        {activeLink.url && (
          <a
            href={activeLink.url.replace("/e/", "/v/")}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition-colors inline-flex items-center gap-1 text-[11px]"
          >
            <span>Open external host</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </section>
  );
}
