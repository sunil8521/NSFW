"use client";

import { useState } from "react";
import Image from "next/image";
import type { VideoLink } from "@/types/post";
import HlsCustomPlayer from "./HlsCustomPlayer";
import { getSafeImageUrl } from "@/lib/utils";
import {
  Play,
  Server,
  ExternalLink,
  Sparkles,
  RotateCcw,
  Tv,
} from "lucide-react";

interface VideoPlayerProps {
  videoLinks: VideoLink[];
  title: string;
  poster?: string;
}

function isDirectVideoStream(url: string = ""): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes(".m3u8") ||
    lower.includes(".mp4") ||
    lower.includes(".webm") ||
    lower.includes(".mkv") ||
    lower.includes(".mov") ||
    lower.includes("/hls/")
  );
}

export default function VideoPlayer({
  videoLinks,
  title,
  poster,
}: VideoPlayerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [theaterMode, setTheaterMode] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  if (!videoLinks || videoLinks.length === 0) return null;

  const activeLink = videoLinks[activeIndex] || videoLinks[0];
  const isDirect = isDirectVideoStream(activeLink.url);

  const handleServerChange = (idx: number) => {
    setActiveIndex(idx);
    setHasStarted(true);
    setReloadKey((k) => k + 1);
  };

  const handleReload = () => {
    setReloadKey((k) => k + 1);
  };

  return (
    <section className="space-y-3.5">
      {/* Top Header: Server Switcher & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <h2 className="text-sm font-semibold text-[#f5f5f5] uppercase tracking-wider font-display flex items-center gap-2">
            <span>Streaming Player</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-accent/20 text-accent border border-accent/30 tracking-normal">
              {isDirect ? "HLS Adaptive HD" : "720p HD"}
            </span>
          </h2>
        </div>

        {/* Server Selection & Utility Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
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
                    onClick={() => handleServerChange(idx)}
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

          {/* Theater Mode Toggle */}
          <button
            onClick={() => setTheaterMode(!theaterMode)}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              theaterMode
                ? "bg-accent/20 border-accent/40 text-accent"
                : "bg-[#141414] border-[#262626] text-zinc-400 hover:text-white hover:bg-[#1f1f1f]"
            }`}
            title="Toggle Theater Mode"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Theater</span>
          </button>

          {/* Reload Stream */}
          <button
            onClick={handleReload}
            className="p-2 rounded-xl bg-[#141414] border border-[#262626] text-zinc-400 hover:text-white hover:bg-[#1f1f1f] transition-colors cursor-pointer"
            title="Reload Video Stream"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Video View Area */}
      {isDirect ? (
        /* HLS / Native HTML5 Custom Video Player */
        <HlsCustomPlayer
          key={`${activeLink.url}-${reloadKey}`}
          src={activeLink.url}
          poster={poster}
          title={title}
          theaterMode={theaterMode}
          onToggleTheater={() => setTheaterMode(!theaterMode)}
        />
      ) : (
        /* Third-Party Embed Player with Click-to-Play Poster Guard & Theater Mode */
        <div
          className={`relative w-full rounded-2xl overflow-hidden bg-black border border-[#262626] shadow-2xl transition-all duration-300 ${
            theaterMode
              ? "aspect-video lg:aspect-[21/9]"
              : "aspect-video"
          }`}
        >
          {!hasStarted && poster ? (
            /* Poster & Stream Launch Screen (protects page speed from 3rd party scripts until user plays) */
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center select-none">
              <Image
                src={getSafeImageUrl(poster, true)}
                alt={title}
                fill
                priority
                referrerPolicy="no-referrer"
                className="object-cover blur-xs scale-105 opacity-65"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

              <div className="relative z-10 space-y-4 max-w-md">
                <button
                  onClick={() => setHasStarted(true)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center mx-auto shadow-2xl shadow-accent/50 hover:scale-110 active:scale-95 transition-all cursor-pointer group"
                  aria-label="Start streaming video"
                >
                  <Play className="w-8 h-8 sm:w-9 sm:h-9 ml-1 fill-current group-hover:scale-105 transition-transform" />
                </button>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white drop-shadow truncate">
                    {title}
                  </h3>
                  <p className="text-xs text-zinc-300 mt-1">
                    Click to stream via <strong className="text-accent">{activeLink.label || "HD Server"}</strong>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Active Embed Iframe */
            <iframe
              key={`${activeLink.url}-${reloadKey}`}
              src={activeLink.url}
              title={`${title} - ${activeLink.label}`}
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            />
          )}
        </div>
      )}

      {/* Bottom Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs text-[#737373]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>
            Streaming via <strong className="text-zinc-300 font-medium">{activeLink.label || "HD Stream"}</strong>. If video buffers, switch server above.
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
