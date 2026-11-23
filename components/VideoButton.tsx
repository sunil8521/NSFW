import { Play, ExternalLink } from "lucide-react";
import type { VideoLink } from "@/types/post";

export default function VideoButton({ link }: { link: VideoLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
    >
      <Play className="w-3.5 h-3.5 fill-current" />
      <span>{link.label}</span>
      <ExternalLink className="w-3.5 h-3.5 opacity-75" />
    </a>
  );
}
