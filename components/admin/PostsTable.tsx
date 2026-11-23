"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getSafeImageUrl } from "@/lib/utils";
import {
  Search,
  Filter,
  Trash2,
  Edit3,
  ExternalLink,
  Plus,
  Eye,
  Heart,
  Images,
  Film,
  AlertTriangle,
} from "lucide-react";
import { deletePostAction } from "@/actions/admin";
import { formatViews, formatDate } from "@/lib/utils";
import type { Post } from "@/types/post";

export default function PostsTable({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filtered posts
  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      categoryFilter === "all" || post.category === categoryFilter;
    const q = query.toLowerCase().trim();
    const matchesQuery =
      !q ||
      post.title.toLowerCase().includes(q) ||
      post.uploader.toLowerCase().includes(q) ||
      post.tags.some((t) => t.toLowerCase().includes(q));

    return matchesCategory && matchesQuery;
  });

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);

    try {
      await deletePostAction(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setConfirmDeleteId(null);
    } catch (err: any) {
      setError(err?.message || "Failed to delete post");
    } finally {
      setDeletingId(null);
    }
  };

  const categories = Array.from(new Set(posts.map((p) => p.category)));

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-display">Manage Posts</h1>
          <p className="text-xs text-zinc-400">
            {posts.length} total posts in database
          </p>
        </div>

        <Link
          href="/admin/posts/new"
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-xl shadow-md transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Post</span>
        </Link>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
          {error}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#121212] border border-[#222] flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, tag, or uploader..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#181818] border border-[#2b2b2b] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-44 px-3 py-2 rounded-xl bg-[#181818] border border-[#2b2b2b] text-xs text-white capitalize focus:outline-none focus:border-accent"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="p-5 rounded-2xl bg-[#121212] border border-[#222] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#222] text-zinc-500 uppercase tracking-wider font-mono text-[10px]">
                <th className="pb-3 pl-2">Post</th>
                <th className="pb-3 px-3">Category</th>
                <th className="pb-3 px-3">Stats</th>
                <th className="pb-3 px-3">Media</th>
                <th className="pb-3 px-3">Uploader</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c1c1c]">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-[#161616] transition-colors group">
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-10 rounded-lg overflow-hidden bg-black/40 border border-[#282828] shrink-0">
                        <Image
                          src={getSafeImageUrl(post.thumbnailUrl, true)}
                          alt={post.title}
                          fill
                          unoptimized
                          referrerPolicy="no-referrer"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 max-w-xs sm:max-w-md">
                        <Link
                          href={`/post/${post.id}`}
                          target="_blank"
                          className="font-medium text-white hover:text-accent truncate block group-hover:underline"
                        >
                          {post.title}
                        </Link>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-0.5">
                          <span>{formatDate(post.uploadDate)}</span>
                          <span>&bull;</span>
                          <span>{post.tags.slice(0, 3).map((t) => `#${t}`).join(" ")}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 capitalize">
                    <span className="px-2 py-0.5 rounded-md bg-[#1c1c1c] text-zinc-300 border border-[#2b2b2b] text-[11px]">
                      {post.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3 text-zinc-400 font-mono text-[11px]">
                      <span className="flex items-center gap-1" title="Views">
                        <Eye className="w-3 h-3 text-indigo-400" />
                        {formatViews(post.stats.views)}
                      </span>
                      <span className="flex items-center gap-1" title="Likes">
                        <Heart className="w-3 h-3 text-rose-400" />
                        {post.stats.likes}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2 text-zinc-400 font-mono text-[11px]">
                      <span className="flex items-center gap-1" title="Photos">
                        <Images className="w-3 h-3 text-blue-400" />
                        {post.stats.photoCount}
                      </span>
                      <span className="flex items-center gap-1" title="Videos">
                        <Film className="w-3 h-3 text-emerald-400" />
                        {post.stats.videoCount}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-zinc-300 text-[11px]">
                    {post.uploader}
                  </td>
                  <td className="py-3.5 pr-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/post/${post.id}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#202020] transition-colors"
                        title="View Live"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#202020] transition-colors"
                        title="Edit Post"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Link>

                      {confirmDeleteId === post.id ? (
                        <div className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/30 rounded-lg p-1">
                          <button
                            type="button"
                            onClick={() => handleDelete(post.id)}
                            disabled={deletingId === post.id}
                            className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-semibold"
                          >
                            {deletingId === post.id ? "..." : "Confirm"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-1.5 py-0.5 text-zinc-400 hover:text-white text-[10px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(post.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredPosts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    No posts matched your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
