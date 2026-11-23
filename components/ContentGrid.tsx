import type { Post } from "@/types/post";
import PostCard from "./PostCard";

export default function ContentGrid({
  posts,
  emptyMessage = "No posts found",
}: {
  posts?: Post[];
  emptyMessage?: string;
}) {
  const safePosts = Array.isArray(posts) ? posts : [];

  if (safePosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold text-[#a3a3a3]">{emptyMessage}</p>
        <p className="text-sm text-[#737373] mt-1">
          Try a different category or search term
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
      {safePosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
