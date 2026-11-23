"use client";

import { useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa6";
import { likePostAction, checkUserLikedAction } from "@/actions/likes";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LikeButton({
  postId,
  initialLikes,
}: {
  postId: string;
  initialLikes: number;
}) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check if current user already liked
  useEffect(() => {
    if (session?.user) {
      checkUserLikedAction(postId).then((res) => {
        if (res.liked) setHasLiked(true);
      });
    }
  }, [session, postId]);

  const handleLike = async () => {
    if (!session?.user) {
      router.push("/sign-in");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const res = await likePostAction(postId);
      if (res.alreadyLiked) {
        setHasLiked(true);
        showToast("You already liked this post");
      } else if (res.success) {
        setHasLiked(true);
        setLikes(res.likes);
        showToast("Post liked!");
      } else if (res.message) {
        showToast(res.message);
      }
    } catch {
      showToast("Could not like post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleLike}
        disabled={loading}
        title={hasLiked ? "You already liked this post" : "Like this post"}
        className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-200 cursor-pointer ${
          hasLiked
            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20"
            : "bg-[#1c1c1c] text-[#d4d4d4] border border-[#2e2e2e] hover:bg-[#252525] hover:text-white"
        }`}
      >
        <FaHeart
          className={`w-4 h-4 transition-transform ${
            hasLiked ? "text-rose-500 scale-110" : "text-rose-400"
          }`}
        />
        <span>{hasLiked ? "Liked" : "Like"}</span>
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-black/40 text-[#a3a3a3]">
          {likes}
        </span>
      </button>

      {/* Pop-up toast feedback */}
      {toastMessage && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-zinc-900 border border-zinc-700 text-white text-xs font-medium rounded-full shadow-lg whitespace-nowrap animate-in fade-in zoom-in-95 duration-200 z-30">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
