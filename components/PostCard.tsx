import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/types/post";
import { formatViews, formatDate, getSafeImageUrl } from "@/lib/utils";
import { FaEye, FaImages, FaFilm } from "react-icons/fa6";
import SaveButton from "@/components/SaveButton";

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/post/${post.id}`}
      className="group flex flex-col h-full rounded-xl overflow-hidden bg-[#141414] hover:bg-[#1a1a1a] transition-colors duration-200"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden">
        <Image
          src={getSafeImageUrl(post.thumbnailUrl, true)}
          alt={post.title}
          fill
          referrerPolicy="no-referrer"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />

        {/* View count overlay */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/70 text-[11px] font-medium text-white/90">
          <FaEye className="w-3 h-3 text-white/80" />
          <span>{formatViews(post.stats.views)}</span>
        </div>

        {/* Save / Bookmark overlay */}
        <div className="absolute top-2 left-2">
          <SaveButton postId={post.id} variant="icon" />
        </div>

        {/* Media count overlay */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
          {post.stats.photoCount > 0 && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-medium text-white/80">
              <FaImages className="w-2.5 h-2.5" />
              <span>{post.stats.photoCount}</span>
            </span>
          )}
          {post.stats.videoCount > 0 && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-medium text-white/80">
              <FaFilm className="w-2.5 h-2.5" />
              <span>{post.stats.videoCount}</span>
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 justify-between gap-1.5">
        <div>
          <h3 className="text-sm font-semibold text-[#f5f5f5] line-clamp-2 leading-5 h-10 group-hover:text-accent transition-colors font-display">
            {post.title}
          </h3>

          <div className="flex items-center gap-2 text-[11px] text-[#737373] mt-1.5">
            <span className="text-[#a3a3a3] truncate max-w-[100px]">{post.uploader}</span>
            <span>·</span>
            <span className="shrink-0">{formatDate(post.uploadDate)}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1 overflow-hidden h-5 pt-0.5">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#1a1a1a] text-[#737373] border border-[#262626] whitespace-nowrap shrink-0"
            >
              {tag}
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-[#525252] whitespace-nowrap shrink-0">
              +{post.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
