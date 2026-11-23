import { Suspense } from "react";
import { getPaginatedPostsByTag } from "@/lib/data";
import ContentGrid from "@/components/ContentGrid";
import SectionTitle from "@/components/SectionTitle";
import Pagination from "@/components/Pagination";
import { GridSkeleton } from "@/components/ui/Skeleton";
import type { Metadata } from "next";

export async function generateMetadata(
  props: PageProps<"/tags/[tag]">
): Promise<Metadata> {
  const { tag } = await props.params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `#${decoded} — Desi Hot Pic`,
    description: `Browse all posts and streaming videos tagged with #${decoded} on Desi Hot Pic`,
  };
}

export default async function TagPage(props: PageProps<"/tags/[tag]">) {
  const { tag } = await props.params;
  const decoded = decodeURIComponent(tag);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      <Suspense
        fallback={
          <section className="space-y-6 min-w-0">
            <SectionTitle>#{decoded.replace(/-/g, " ").toUpperCase()}</SectionTitle>
            <GridSkeleton count={12} />
          </section>
        }
      >
        <TagContent tag={decoded} searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function TagContent({
  tag,
  searchParams,
}: {
  tag: string;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const pageParam =
    typeof resolvedParams?.page === "string" ? resolvedParams.page : "1";
  const currentPage = Math.max(1, parseInt(pageParam, 10) || 1);
  const pageSize = 12;

  // Server-side query directly to MongoDB
  const { posts, totalPages, total } = await getPaginatedPostsByTag(
    tag,
    currentPage,
    pageSize
  );

  return (
    <section className="space-y-6 min-w-0">
      <div className="flex items-center justify-between gap-4">
        <SectionTitle>#{tag.replace(/-/g, " ").toUpperCase()}</SectionTitle>
        <span className="text-xs text-zinc-500 font-mono hidden sm:inline">
          {total} posts &bull; Page {currentPage} of {totalPages}
        </span>
      </div>

      <ContentGrid
        posts={posts}
        emptyMessage={`No content found tagged with #${tag}. Try browsing categories.`}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/tags/${encodeURIComponent(tag)}`}
      />
    </section>
  );
}
