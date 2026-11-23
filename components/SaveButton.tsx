"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { FaHeart, FaBookmark } from "react-icons/fa6";
import { motion } from "framer-motion";
import { toggleSavePostAction, checkIsSavedAction } from "@/actions/bookmarks";

interface SaveButtonProps {
  postId: string;
  variant?: "icon" | "button";
  className?: string;
}

export default function SaveButton({
  postId,
  variant = "icon",
  className = "",
}: SaveButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (session?.user) {
      checkIsSavedAction(postId)
        .then((res) => {
          if (isMounted && typeof res?.saved === "boolean") {
            setSaved(res.saved);
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [postId, session]);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If not logged in, redirect to sign-in
    if (!session?.user) {
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      // Server Action invocation (Next.js 16 best practice)
      const res = await toggleSavePostAction(postId);

      if (res.success) {
        setSaved(res.saved);
      }
    } catch (e) {
      console.error("Failed to toggle save", e);
    } finally {
      setLoading(false);
    }
  };

  if (variant === "button") {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleToggleSave}
        className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
          saved
            ? "bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/25"
            : "bg-[#141414] border-[#262626] text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a]"
        } ${className}`}
      >
        <FaBookmark className={`w-3.5 h-3.5 ${saved ? "text-rose-400" : ""}`} />
        <span>{saved ? "Saved in Collection" : "Save to Favorites"}</span>
      </motion.button>
    );
  }

  // Variant: icon overlay
  return (
    <motion.button
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleToggleSave}
      aria-label={saved ? "Unsave" : "Save"}
      className={`p-1.5 rounded-md transition-colors cursor-pointer ${
        saved
          ? "bg-rose-500/90 text-white shadow-md shadow-rose-500/30"
          : "bg-black/60 text-white/70 hover:text-rose-400"
      } ${className}`}
    >
      <FaHeart className="w-3 h-3" />
    </motion.button>
  );
}
