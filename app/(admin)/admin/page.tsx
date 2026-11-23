import Link from "next/link";
import Image from "next/image";
import { getSafeImageUrl } from "@/lib/utils";
import {
  Film,
  Eye,
  Heart,
  MessageSquare,
  Users,
  Plus,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { dbService } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/dal";
import { formatViews, formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();
  const stats = await dbService.getAdminStats();
  const recentPosts = (await dbService.getAllPosts()).slice(0, 6);

  const statCards = [
    {
      label: "Total Posts",
      value: stats.totalPosts.toLocaleString(),
      icon: Film,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      label: "Total Views",
      value: formatViews(stats.totalViews),
      icon: Eye,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
    },
    {
      label: "Total Likes",
      value: stats.totalLikes.toLocaleString(),
      icon: Heart,
      color: "text-rose-400",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/20",
    },
    {
      label: "Total Comments",
      value: stats.totalComments.toLocaleString(),
      icon: MessageSquare,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      label: "Active Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="p-6 rounded-2xl bg-linear-to-r from-[#141414] via-[#111] to-[#141414] border border-[#222] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30 font-semibold">
              Admin Panel
            </span>
            <span className="text-xs text-zinc-500">Live MongoDB Atlas</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-display">
            Welcome back, {session.user.name || "Administrator"}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage links, monitor real-time post views, one-way likes, and bookmarks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/posts/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Post</span>
          </Link>
          <Link
            href="/admin/posts"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] hover:bg-[#222] border border-[#2e2e2e] text-zinc-300 text-xs font-semibold rounded-xl transition-colors"
          >
            <span>Manage All Posts</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`p-4 rounded-2xl bg-[#111] border ${card.borderColor} space-y-3`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium truncate">
                  {card.label}
                </span>
                <div
                  className={`w-7 h-7 rounded-lg ${card.bgColor} flex items-center justify-center shrink-0`}
                >
                  <Icon className={`w-3.5 h-3.5 ${card.color}`} />
                </div>
              </div>
              <div className="text-xl font-bold text-white font-display tracking-tight">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Posts Section */}
      <div className="p-6 rounded-2xl bg-[#111] border border-[#222] space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-display">
              Recently Added Posts
            </h2>
          </div>
          <Link
            href="/admin/posts"
            className="text-xs text-accent hover:underline flex items-center gap-1 font-medium"
          >
            <span>View All Posts</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#222] text-zinc-500 uppercase tracking-wider font-mono text-[10px]">
                <th className="pb-3 pl-2">Post</th>
                <th className="pb-3 px-3">Category</th>
                <th className="pb-3 px-3">Views</th>
                <th className="pb-3 px-3">Likes</th>
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 pr-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c1c1c]">
              {recentPosts.map((post) => (
                <tr key={post.id} className="hover:bg-[#161616] transition-colors group">
                  <td className="py-3 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-9 rounded-lg overflow-hidden bg-black/40 border border-[#282828] shrink-0">
                        <Image
                          src={getSafeImageUrl(post.thumbnailUrl, true)}
                          alt={post.title}
                          fill
                          unoptimized
                          referrerPolicy="no-referrer"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <Link
                          href={`/post/${post.id}`}
                          target="_blank"
                          className="font-medium text-white hover:text-accent truncate block group-hover:underline"
                        >
                          {post.title}
                        </Link>
                        <span className="text-[10px] text-zinc-500 block truncate">
                          by {post.uploader}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 capitalize">
                    <span className="px-2 py-0.5 rounded-md bg-[#1c1c1c] text-zinc-300 border border-[#2b2b2b] text-[11px]">
                      {post.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-zinc-300">
                    {formatViews(post.stats.views)}
                  </td>
                  <td className="py-3 px-3 font-mono text-rose-400">
                    {post.stats.likes}
                  </td>
                  <td className="py-3 px-3 text-zinc-400 text-[11px]">
                    {formatDate(post.uploadDate)}
                  </td>
                  <td className="py-3 pr-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="px-2.5 py-1 rounded-lg bg-[#1f1f1f] hover:bg-[#282828] text-zinc-300 text-[11px] font-medium transition-colors"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/post/${post.id}`}
                        target="_blank"
                        className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-[#1f1f1f] transition-colors"
                        title="View Live"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
