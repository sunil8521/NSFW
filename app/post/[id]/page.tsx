import { notFound } from "next/navigation";
import { getPostById, getRelatedPosts } from "@/lib/data";
import { dbService } from "@/lib/db";
import ImageGallery from "@/components/ImageGallery";
import VideoPlayer from "@/components/VideoPlayer";
import PostSidebar from "@/components/PostSidebar";
import CommentSection from "@/components/CommentSection";
import Carousel from "@/components/Carousel";
import Link from "next/link";
import { FaChevronRight, FaHouse } from "react-icons/fa6";
import type { Metadata } from "next";

export async function generateMetadata(
  props: PageProps<"/post/[id]">
): Promise<Metadata> {
  const { id } = await props.params;
  const post = await getPostById(id);
  return {
    title: post ? `${post.title} — Desi Hot Pic` : "Post — Desi Hot Pic",
    description: post?.description ?? "View this post on Desi Hot Pic",
  };
}

export default async function PostPage(props: PageProps<"/post/[id]">) {
  const { id } = await props.params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  // Increment views automatically when post is viewed
  await dbService.incrementPostViews(post.id);

  const relatedPosts = await getRelatedPosts(post, 8);
  const initialComments = await dbService.getCommentsForPost(post.id);

  return (
    <div className="max-w-7xl 2xl:max-w-[1680px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#737373]">
        <Link href="/" className="hover:text-white transition-colors">
          <FaHouse className="w-3.5 h-3.5" />
        </Link>
        <FaChevronRight className="w-2.5 h-2.5 text-[#525252]" />
        <Link
          href={`/category/${post.category}`}
          className="hover:text-white transition-colors capitalize"
        >
          {post.category}
        </Link>
        <FaChevronRight className="w-2.5 h-2.5 text-[#525252]" />
        <span className="text-[#a3a3a3] truncate max-w-[200px]">
          {post.title}
        </span>
      </nav>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left — content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Title (mobile) */}
          <h1 className="lg:hidden text-xl font-bold text-white font-display">
            {post.title}
          </h1>

          {/* Embedded Video Player (Direct On-Site Play) */}
          {post.videoLinks && post.videoLinks.length > 0 && (
            <VideoPlayer
              videoLinks={post.videoLinks}
              title={post.title}
              poster={post.thumbnailUrl}
            />
          )}

          {/* Image gallery */}
          {post.images && post.images.length > 0 && (
            <ImageGallery images={post.images} />
          )}

          {/* Description */}
          {post.description && (
            <div className="rounded-xl bg-[#141414] border border-[#262626] p-4">
              <p className="text-sm text-[#a3a3a3] leading-relaxed">
                {post.description}
              </p>
            </div>
          )}

          {/* Comments Section */}
          <CommentSection postId={post.id} initialComments={initialComments} />
        </div>

        {/* Right — sidebar */}
        <div className="w-full lg:w-80 shrink-0">
          <PostSidebar post={post} />
        </div>
      </div>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <>
          <div className="h-px bg-[#262626]" />
          <Carousel title="RELATED POSTS" posts={relatedPosts} />
        </>
      )}
    </div>
  );
}
