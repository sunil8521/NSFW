import type { Post } from "@/types/post";
import { formatViews, formatDate } from "@/lib/utils";
import {
  FaEye,
  FaHeart,
  FaImages,
  FaFilm,
  FaComment,
  FaShareNodes,
  FaFlag,
  FaCalendarDays,
  FaUser,
} from "react-icons/fa6";
import { TagPill } from "./TagPill";
import SaveButton from "./SaveButton";
import LikeButton from "./LikeButton";

export default function PostSidebar({ post }: { post: Post }) {
  return (
    <div className="rounded-xl bg-[#141414] border border-[#262626] p-5 space-y-5 sticky top-20">
      {/* Title */}
      <h1 className="text-lg font-bold text-[#f5f5f5] leading-snug font-display">
        {post.title}
      </h1>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {post.tags.map((tag) => (
          <TagPill key={tag} tag={tag} />
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-[#a3a3a3]">
          <FaEye className="w-3.5 h-3.5 text-[#737373]" />
          <span>{formatViews(post.stats.views)} Views</span>
        </div>
        <div className="flex items-center gap-2 text-[#a3a3a3]">
          <FaHeart className="w-3.5 h-3.5 text-rose-400" />
          <span>{post.stats.likes} Likes</span>
        </div>
        <div className="flex items-center gap-2 text-[#a3a3a3]">
          <FaImages className="w-3.5 h-3.5 text-blue-400" />
          <span>{post.stats.photoCount} Photos</span>
        </div>
        <div className="flex items-center gap-2 text-[#a3a3a3]">
          <FaFilm className="w-3.5 h-3.5 text-green-400" />
          <span>{post.stats.videoCount} Videos</span>
        </div>
        <div className="flex items-center gap-2 text-[#a3a3a3]">
          <FaComment className="w-3.5 h-3.5 text-yellow-400" />
          <span>{post.stats.comments} Comments</span>
        </div>
      </div>

      {/* Action Buttons: Like & Save */}
      <div className="grid grid-cols-2 gap-2.5">
        <LikeButton postId={post.id} initialLikes={post.stats.likes} />
        <SaveButton postId={post.id} variant="button" />
      </div>

      {/* Divider */}
      <div className="h-px bg-[#262626]" />

      {/* Uploader & Date */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-[#a3a3a3]">
          <FaUser className="w-3.5 h-3.5 text-[#737373]" />
          <span>
            Uploaded by{" "}
            <span className="text-accent font-medium">{post.uploader}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-[#737373]">
          <FaCalendarDays className="w-3.5 h-3.5" />
          <span>{formatDate(post.uploadDate)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#1a1a1a] text-[#a3a3a3] text-sm font-medium hover:bg-[#262626] transition-colors"
          aria-label="Share"
        >
          <FaShareNodes className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
        <button
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#1a1a1a] text-[#a3a3a3] text-sm font-medium hover:bg-[#262626] transition-colors"
          aria-label="Report"
        >
          <FaFlag className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
