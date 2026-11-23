import { Suspense } from "react";
import { getPaginatedSearchPosts } from "@/lib/data";
import ContentGrid from "@/components/ContentGrid";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import { GridSkeleton } from "@/components/ui/Skeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search — Desi Hot Pic",
  description: "Search for albums, models, and streaming videos on Desi Hot Pic",
};

export default async function SearchPage(props: PageProps<"/search">) {
  const searchParams = await props.searchParams;
  const query = (searchParams?.q as string) ?? "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* Search Input Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#121212] border border-[#222] space-y-4 max-w-2xl mx-auto text-center">
        <h1 className="text-xl sm:text-2xl font-black text-white font-display">
          Search Desi Hot Pic
        </h1>
        <SearchBar defaultValue={query} size="lg" />
      </div>

      {/* Results with Suspense Skeleton */}
      <Suspense fallback={<GridSkeleton count={12} />}>
        <SearchResults query={query} searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function SearchResults({
  query,
  searchParams,
}: {
  query: string;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (!query.trim()) {
    return (
      <div className="text-center py-16 text-zinc-500 space-y-2">
        <p className="text-sm">Type a search term above to find albums and videos.</p>
      </div>
    );
  }

  const resolvedParams = await searchParams;
  const pageParam =
    typeof resolvedParams?.page === "string" ? resolvedParams.page : "1";
  const currentPage = Math.max(1, parseInt(pageParam, 10) || 1);
  const pageSize = 12;

  // Server-side MongoDB query
  const { posts, totalPages, total } = await getPaginatedSearchPosts(
    query,
    currentPage,
    pageSize
  );

  return (
    <section className="space-y-6 min-w-0">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-white font-display">
          Results for &ldquo;{query}&rdquo;
        </h2>
        <span className="text-xs text-zinc-400 font-mono">
          {total} result{total !== 1 ? "s" : ""} &bull; Page {currentPage} of {totalPages}
        </span>
      </div>

      <ContentGrid
        posts={posts}
        emptyMessage={`No albums matched "${query}". Try searching another keyword or browsing categories.`}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/search?q=${encodeURIComponent(query)}`}
      />
    </section>
  );
}
