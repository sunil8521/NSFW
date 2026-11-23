"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { formatDate } from "@/lib/utils";
import { FaComment, FaTrash, FaPaperPlane } from "react-icons/fa6";
import { addCommentAction, deleteCommentAction } from "@/actions/comments";
import type { CommentItem } from "@/lib/db";

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

interface CommentSectionProps {
  postId: string;
  initialComments?: CommentItem[];
}

export default function CommentSection({
  postId,
  initialComments = [],
}: CommentSectionProps) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = content.trim();
    if (!text || submitting) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      // Direct Server Action execution (Next.js 16 pattern)
      const res = await addCommentAction(postId, text);

      if (res.success && res.comment) {
        setComments((prev) => [res.comment!, ...prev]);
        setContent("");
      } else {
        setErrorMessage(res.error || "Failed to post comment.");
      }
    } catch (e: any) {
      setErrorMessage(e?.message || "Error posting comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      // Direct Server Action execution (Next.js 16 pattern)
      const res = await deleteCommentAction(commentId, postId);
      if (res.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } else if (res.error) {
        alert(res.error);
      }
    } catch (e: any) {
      console.error("Error deleting comment", e);
    }
  };

  return (
    <div className="space-y-6 pt-6 border-t border-[#262626]">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold uppercase tracking-wider text-white font-display flex items-center gap-2">
          <FaComment className="w-4 h-4 text-accent" />
          <span>Comments ({comments.length})</span>
        </h3>
      </div>

      {/* Comment Input or Simple Login Button */}
      {session?.user ? (
        <form onSubmit={handlePostComment} className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#222] shrink-0 border border-[#333]">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-accent">
                  {(session.user.name || "U")[0].toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Leave a comment..."
                rows={3}
                className="w-full p-3 text-xs bg-[#141414] border border-[#2a2a2a] rounded-xl text-white placeholder:text-[#666] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 resize-none transition-all"
              />
              {errorMessage && (
                <p className="mt-1 text-xs text-rose-400">{errorMessage}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <FaPaperPlane className="w-3 h-3" />
              <span>{submitting ? "Posting..." : "Post Comment"}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-between gap-4">
          <span className="text-xs text-[#a3a3a3]">
            Sign in to join the conversation
          </span>
          <Link
            href={`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-100 text-[#1f1f1f] text-xs font-semibold transition-all shrink-0"
          >
            <GoogleIcon />
            <span>Sign In with Google</span>
          </Link>
        </div>
      )}

      {/* Comment List */}
      <div className="space-y-3">
        {comments.map((comment) => {
          const isAuthor = session?.user?.id === comment.userId;

          return (
            <div
              key={comment.id}
              className="p-3.5 rounded-xl bg-[#141414] border border-[#222] space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-[#222] shrink-0 border border-[#333]">
                    {comment.userImage ? (
                      <Image
                        src={comment.userImage}
                        alt={comment.userName}
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-accent">
                        {(comment.userName || "U")[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-white">
                    {comment.userName}
                  </span>
                  <span className="text-[10px] text-[#666]">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>

                {isAuthor && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="p-1 text-[#666] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    title="Delete comment"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                )}
              </div>

              <p className="text-xs text-[#d4d4d4] leading-relaxed pl-8">
                {comment.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
