"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  TrendingUp,
  Flame,
  Heart,
  Users,
  User,
  Video,
  Camera,
  Crown,
  Globe,
  Sparkles,
} from "lucide-react";

const CATEGORIES = [
  { label: "All Posts", href: "/", icon: Compass },
  { label: "Trending", href: "/category/trending", icon: TrendingUp },
  { label: "Desi", href: "/category/desi", icon: Flame },
  { label: "Babe", href: "/category/babe", icon: Heart },
  { label: "Couple", href: "/category/couple", icon: Users },
  { label: "Solo", href: "/category/solo", icon: User },
  { label: "Webcam", href: "/category/webcam", icon: Video },
  { label: "Amateur", href: "/category/amateur", icon: Camera },
  { label: "MILF", href: "/category/milf", icon: Crown },
  { label: "Asian", href: "/category/asian", icon: Globe },
  { label: "Big Boobs", href: "/category/big-boobs", icon: Sparkles },
];

export default function CategoryNavigation() {
  const pathname = usePathname();

  return (
    <div className="w-full overflow-x-auto hide-scrollbar py-2">
      <div className="flex items-center gap-2 min-w-max px-1">
        {CATEGORIES.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                isActive
                  ? "bg-accent text-white shadow-md shadow-accent/25 border border-accent"
                  : "bg-[#141414] hover:bg-[#1a1a1a] text-zinc-400 hover:text-white border border-[#262626]"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-zinc-500"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
