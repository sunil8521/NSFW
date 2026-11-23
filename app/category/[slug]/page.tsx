import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  getPaginatedPostsByCategory,
  getCategoryBySlug,
} from "@/lib/data";
import ContentGrid from "@/components/ContentGrid";
import SectionTitle from "@/components/SectionTitle";
import Pagination from "@/components/Pagination";
import { GridSkeleton } from "@/components/ui/Skeleton";
import type { Metadata } from "next";

export async function generateMetadata(
  props: PageProps<"/category/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const category = getCategoryBySlug(slug);
  return {
    title: category
      ? `${category.name} — Desi Hot Pic`
      : `${slug.toUpperCase()} — Desi Hot Pic`,
    description: category?.description ?? "Browse content by category on Desi Hot Pic",
  };
}

export default async function CategoryPage(
  props: PageProps<"/category/[slug]">
) {
  const { slug } = await props.params;
  const category = getCategoryBySlug(slug);

  if (!category && slug !== "trending") {
    notFound();
  }

  const headingText =
    slug === "trending"
      ? "TRENDING POSTS"
      : (category?.name ?? slug).toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      <Suspense
        fallback={
          <section className="space-y-6 min-w-0">
            <SectionTitle>{headingText}</SectionTitle>
            <GridSkeleton count={12} />
          </section>
        }
      >
        <CategoryContent
          slug={slug}
          headingText={headingText}
          searchParams={props.searchParams}
        />
      </Suspense>
    </div>
  );
}

async function CategoryContent({
  slug,
  headingText,
  searchParams,
}: {
  slug: string;
  headingText: string;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const pageParam =
    typeof resolvedParams?.page === "string" ? resolvedParams.page : "1";
  const currentPage = Math.max(1, parseInt(pageParam, 10) || 1);
  const pageSize = 12;

  // Server-side database pagination & filtering (MongoDB query)
  const { posts, totalPages, total } = await getPaginatedPostsByCategory(
    slug,
    currentPage,
    pageSize
  );

  return (
    <section id="category-posts-section" className="space-y-6 scroll-mt-24 min-w-0">
      <div className="flex items-center justify-between gap-4">
        <SectionTitle>{headingText}</SectionTitle>
        <span className="text-xs text-zinc-500 font-mono hidden sm:inline">
          {total} posts &bull; Page {currentPage} of {totalPages}
        </span>
      </div>

      <ContentGrid
        posts={posts}
        emptyMessage={`No posts found in ${headingText.toLowerCase()}.`}
      />

      {/* Server-side driven pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/category/${slug}`}
      />
    </section>
  );
}
