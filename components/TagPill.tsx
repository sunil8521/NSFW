import Link from "next/link";
import { slugify } from "@/lib/utils";

export function TagPill({
  tag,
  active = false,
}: {
  tag: string;
  active?: boolean;
}) {
  return (
    <Link
      href={`/tags/${slugify(tag)}`}
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors duration-200 ${
        active
          ? "bg-accent text-white"
          : "bg-[#1a1a1a] text-[#a3a3a3] hover:bg-[#262626] hover:text-white border border-[#262626]"
      }`}
    >
      # {tag}
    </Link>
  );
}
