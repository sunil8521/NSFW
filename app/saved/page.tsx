import { verifySession } from "@/lib/auth/dal";
import { dbService } from "@/lib/db";
import PostGrid from "@/components/PostGrid";
import SectionTitle from "@/components/SectionTitle";
import Link from "next/link";
import { FaBookmark, FaFire } from "react-icons/fa6";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Saved Collection — Desi Hot Pic",
  description: "View and manage your saved bookmarks",
};

export default async function SavedPostsPage() {
  // Edge boundary is already guarded by proxy.ts, DAL guarantees user session
  const session = await verifySession();
  const posts = await dbService.getSavedPostsForUser(session.user.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <SectionTitle>MY SAVED COLLECTION</SectionTitle>
        <p className="text-xs text-[#737373]">
          {posts.length} saved {posts.length === 1 ? "post" : "posts"} in your
          private collection
        </p>
      </div>

      {/* Grid or Empty */}
      {posts.length > 0 ? (
        <PostGrid posts={posts} />
      ) : (
        <div className="text-center py-20 rounded-2xl bg-[#121212] border border-[#222] space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#1c1c1c] text-[#555] flex items-center justify-center mx-auto">
            <FaBookmark className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white font-display">
              No saved posts yet
            </h3>
            <p className="text-xs text-[#666]">
              Browse galleries and tap the heart icon to save posts here.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-colors"
          >
            <FaFire className="w-3.5 h-3.5" />
            <span>Discover Trending Posts</span>
          </Link>
        </div>
      )}
    </div>
  );
}
