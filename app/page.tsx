import { Suspense } from "react";
import {
  getTrendingPosts,
  getMostViewedPosts,
  getPaginatedPosts,
} from "@/lib/data";
import Carousel from "@/components/Carousel";
import ContentGrid from "@/components/ContentGrid";
import SectionTitle from "@/components/SectionTitle";
import Pagination from "@/components/Pagination";
import { GridSkeleton, CarouselSkeleton } from "@/components/ui/Skeleton";

export default function Home(props: PageProps<"/">) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      <Suspense fallback={<HomeContentSkeleton />}>
        <HomeContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

function HomeContentSkeleton() {
  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Carousels Skeleton */}
      <CarouselSkeleton title="TRENDING POSTS" />
      <div className="h-px bg-gradient-to-r from-transparent via-[#262626] to-transparent" />
      <CarouselSkeleton title="MOST VIEWED POSTS" />
      <div className="h-px bg-gradient-to-r from-transparent via-[#262626] to-transparent" />

      {/* Grid Skeleton */}
      <section className="space-y-6 pt-2">
        <SectionTitle>LATEST POSTS</SectionTitle>
        <GridSkeleton count={12} />
      </section>
    </div>
  );
}

async function HomeContent({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const pageParam =
    typeof resolvedParams?.page === "string" ? resolvedParams.page : "1";
  const currentPage = Math.max(1, parseInt(pageParam, 10) || 1);
  const pageSize = 12;

  // Send 3 database queries in parallel using Promise.all
  // 1. Latest paginated posts (uploadDate: -1)
  // 2. Trending posts (stats.likes: -1)
  // 3. Most viewed posts (stats.views: -1)
  const [paginatedData, trendingPosts, mostViewedPosts] = await Promise.all([
    getPaginatedPosts(currentPage, pageSize),
    getTrendingPosts(10),
    getMostViewedPosts(10),
  ]);

  const { posts: latestPosts, totalPages } = paginatedData;
  const isFirstPage = currentPage === 1;

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* 1st Page Only: Carousels */}
      {isFirstPage && (
        <div className="space-y-8 sm:space-y-10">
          {/* Trending Posts */}
          <Carousel title="TRENDING POSTS" posts={trendingPosts} />

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#262626] to-transparent" />

          {/* Most Viewed Posts */}
          <Carousel title="MOST VIEWED POSTS" posts={mostViewedPosts} />

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#262626] to-transparent" />
        </div>
      )}

      {/* Main Content Area - Full Width */}
      <section
        id="latest-posts-section"
        className="space-y-6 scroll-mt-24 min-w-0"
      >
        <div className="flex items-center justify-between gap-4">
          <SectionTitle>LATEST POSTS</SectionTitle>
          <span className="text-xs text-zinc-500 font-mono hidden sm:inline">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <ContentGrid posts={latestPosts} />

        {/* Server-synced pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath="/"
        />
      </section>
    </div>
  );
}
