import { FaEye, FaHeart, FaImages, FaFilm, FaComment } from "react-icons/fa6";
import { formatViews } from "@/lib/utils";
import type { IconType } from "react-icons";

type BadgeVariant = "views" | "likes" | "photos" | "videos" | "comments";

const config: Record<
  BadgeVariant,
  { icon: IconType; color: string }
> = {
  views: { icon: FaEye, color: "text-white/90" },
  likes: { icon: FaHeart, color: "text-rose-400" },
  photos: { icon: FaImages, color: "text-blue-400" },
  videos: { icon: FaFilm, color: "text-green-400" },
  comments: { icon: FaComment, color: "text-yellow-400" },
};

export function Badge({
  variant,
  count,
  size = "sm",
}: {
  variant: BadgeVariant;
  count: number;
  size?: "sm" | "md";
}) {
  const { icon: Icon, color } = config[variant];
  const sizeClasses = size === "sm" ? "text-[11px] gap-1" : "text-xs gap-1.5";

  return (
    <span
      className={`inline-flex items-center ${sizeClasses} ${color} font-medium`}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      {formatViews(count)}
    </span>
  );
}
