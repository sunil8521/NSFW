"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Category } from "@/types/post";
import type { IconType } from "react-icons";
import {
  FaHouse,
  FaFire,
  FaHeart,
  FaUserGroup,
  FaUser,
  FaVideo,
  FaStar,
  FaCrown,
  FaGlobe,
  FaVenusDouble,
  FaCompass,
} from "react-icons/fa6";

const categoryIconMap: Record<string, IconType> = {
  trending: FaFire,
  babe: FaHeart,
  couple: FaUserGroup,
  solo: FaUser,
  webcam: FaVideo,
  "big-boobs": FaStar,
  amateur: FaHouse,
  milf: FaCrown,
  asian: FaGlobe,
  lesbian: FaVenusDouble,
};

export default function CategoryBar({
  categories,
}: {
  categories: Category[];
}) {
  const pathname = usePathname();

  return (
    <div className="overflow-x-auto hide-scrollbar">
      <div className="flex items-center gap-2 pb-1">
        {/* All */}
        <Link
          href="/"
          className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 border ${
            pathname === "/"
              ? "bg-accent text-white border-accent"
              : "bg-[#141414] text-[#a3a3a3] border-[#262626] hover:bg-[#1a1a1a] hover:text-white"
          }`}
        >
          <FaHouse className="w-3.5 h-3.5" /> All
        </Link>

        {categories.map((cat) => {
          const isActive = pathname === `/category/${cat.slug}`;
          const Icon = categoryIconMap[cat.slug] || FaCompass;
          return (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 border ${
                isActive
                  ? "bg-accent text-white border-accent"
                  : "bg-[#141414] text-[#a3a3a3] border-[#262626] hover:bg-[#1a1a1a] hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {cat.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
