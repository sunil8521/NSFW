"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath = "/",
}: PaginationProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    if (page === 1) return basePath;
    const separator = basePath.includes("?") ? "&" : "?";
    return `${basePath}${separator}page=${page}`;
  };

  const handlePageClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetPage: number
  ) => {
    if (
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      e.button !== 0
    ) {
      return;
    }

    e.preventDefault();
    if (targetPage === currentPage) return;

    const section = document.getElementById("latest-posts-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    startTransition(() => {
      router.push(createPageUrl(targetPage), { scroll: false });
    });
  };

  // Generate page numbers for desktop
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav
      aria-label="Pagination Navigation"
      className={`flex items-center justify-center gap-1.5 sm:gap-2 pt-6 pb-2 transition-opacity duration-200 ${
        isPending ? "opacity-60 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          onClick={(e) => handlePageClick(e, currentPage - 1)}
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#141414] hover:bg-[#1f1f1f] text-zinc-300 hover:text-white border border-[#262626] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          aria-label="Go to previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </Link>
      ) : (
        <span
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#101010] text-zinc-600 border border-[#1c1c1c] text-xs font-semibold flex items-center gap-1.5 cursor-not-allowed"
          aria-disabled="true"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </span>
      )}

      {/* Mobile-Only Simple Counter (320px - 640px) */}
      <div className="sm:hidden px-3 py-1.5 rounded-xl bg-[#141414] border border-[#262626] text-xs font-mono font-medium text-zinc-300">
        Page <span className="text-accent font-bold">{currentPage}</span> of{" "}
        <span>{totalPages}</span>
      </div>

      {/* Desktop/Tablet Page Numbers (>= 640px) */}
      <div className="hidden sm:flex items-center gap-1">
        {getPageNumbers().map((page, idx) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-8 h-8 flex items-center justify-center text-xs text-zinc-500 font-mono"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isCurrent = pageNum === currentPage;

          return isCurrent ? (
            <span
              key={pageNum}
              aria-current="page"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-accent text-white text-xs font-bold flex items-center justify-center shadow-md shadow-accent/30"
            >
              {pageNum}
            </span>
          ) : (
            <Link
              key={pageNum}
              href={createPageUrl(pageNum)}
              onClick={(e) => handlePageClick(e, pageNum)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#141414] hover:bg-[#1f1f1f] text-zinc-400 hover:text-white border border-[#262626] text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
            >
              {pageNum}
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          onClick={(e) => handlePageClick(e, currentPage + 1)}
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#141414] hover:bg-[#1f1f1f] text-zinc-300 hover:text-white border border-[#262626] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          aria-label="Go to next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#101010] text-zinc-600 border border-[#1c1c1c] text-xs font-semibold flex items-center gap-1.5 cursor-not-allowed"
          aria-disabled="true"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </nav>
  );
}
