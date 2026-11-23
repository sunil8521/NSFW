"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Post } from "@/types/post";
import PostCard from "./PostCard";

export default function Carousel({
  title,
  posts,
}: {
  title: string;
  posts?: Post[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const safePosts = Array.isArray(posts) ? posts : [];
  if (safePosts.length === 0) return null;

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <h2 className="text-base sm:text-lg md:text-xl font-extrabold uppercase tracking-wider text-white font-display whitespace-nowrap">
            {title}
          </h2>
          <div className="h-[2px] flex-1 bg-gradient-to-r from-accent/60 to-transparent rounded-full hidden sm:block" />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => scroll("left")}
            className="p-1.5 sm:p-2 rounded-xl bg-[#141414] border border-[#262626] text-zinc-400 hover:text-white hover:bg-[#1a1a1a] transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1.5 sm:p-2 rounded-xl bg-[#141414] border border-[#262626] text-zinc-400 hover:text-white hover:bg-[#1a1a1a] transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Row */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory py-1 items-stretch"
      >
        {safePosts.map((post) => (
          <div
            key={post.id}
            className="shrink-0 w-[180px] sm:w-[200px] snap-start flex flex-col"
          >
            <PostCard post={post} />
          </div>
        ))}
      </div>
    </section>
  );
}
