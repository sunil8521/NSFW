"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  X,
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
  Bookmark,
  ShieldCheck,
  LogIn,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import SearchBar from "./SearchBar";

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
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

export default function MobileNavigation({
  isOpen,
  onClose,
}: MobileNavigationProps) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  // Prevent background body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    await authClient.signOut();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#0d0d0d] border-l border-[#222] shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Top Bar */}
        <div className="p-4 border-b border-[#1c1c1c] flex items-center justify-between gap-3">
          <Link href="/" onClick={onClose} className="inline-block">
            <div className="relative h-10 w-32">
              <Image
                src="/logo.png"
                alt="DesiHotPic"
                fill
                priority
                className="object-contain object-left"
              />
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#141414] hover:bg-[#1f1f1f] border border-[#262626] text-zinc-400 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[#1c1c1c]">
          <SearchBar size="sm" placeholder="Search DesiHotPic..." />
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Main Links */}
          <div className="space-y-1">
            <Link
              href="/"
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                pathname === "/"
                  ? "bg-accent text-white"
                  : "text-zinc-300 hover:bg-[#161616] hover:text-white"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explore Home</span>
            </Link>

            <Link
              href="/saved"
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                pathname === "/saved"
                  ? "bg-accent text-white"
                  : "text-zinc-300 hover:bg-[#161616] hover:text-white"
              }`}
            >
              <Bookmark className="w-4 h-4 text-accent" />
              <span>Saved Bookmarks</span>
            </Link>

            {/* Admin Link if authorized */}
            {((session?.user as any)?.u === 1 ||
              session?.user?.email === "sunilmaharana.0x@gmail.com") && (
              <Link
                href="/admin"
                onClick={onClose}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-accent bg-accent/15 border border-accent/25 hover:bg-accent/25 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span>Admin Dashboard</span>
              </Link>
            )}
          </div>

          {/* Categories Section */}
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500 px-3">
              Categories
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = pathname === cat.href;
                return (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    onClick={onClose}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-accent text-white shadow-sm font-semibold"
                        : "bg-[#141414] hover:bg-[#1c1c1c] text-zinc-300 hover:text-white border border-[#222]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                    <span className="truncate">{cat.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Compliance & Safety Links */}
          <div className="space-y-2 pt-2 border-t border-[#1c1c1c]">
            <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-500 px-3 flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3 text-accent" />
              <span>Compliance &amp; 18+</span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-zinc-400 px-3">
              <Link href="/dmca" onClick={onClose} className="hover:text-white py-1">
                DMCA Notice
              </Link>
              <Link href="/2257" onClick={onClose} className="hover:text-white py-1">
                18 U.S.C. 2257
              </Link>
              <Link href="/terms" onClick={onClose} className="hover:text-white py-1">
                Terms of Service
              </Link>
              <Link href="/privacy" onClick={onClose} className="hover:text-white py-1">
                Privacy Policy
              </Link>
              <Link href="/takedown" onClick={onClose} className="hover:text-white py-1">
                Content Removal
              </Link>
              <Link href="/age-verification" onClick={onClose} className="hover:text-white py-1">
                Age Verification
              </Link>
            </div>
          </div>
        </div>

        {/* Footer User Info / Sign-In */}
        <div className="p-4 border-t border-[#1c1c1c] bg-[#090909]">
          {session?.user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-accent/20 border border-accent/40 flex items-center justify-center shrink-0">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-accent">
                      {(session.user.name || "U")[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <p className="font-semibold text-white truncate">
                    {session.user.name}
                  </p>
                  <p className="text-[10px] text-zinc-500 truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/15 border border-rose-500/25 text-rose-400 hover:bg-rose-500/25 text-xs font-semibold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              href={`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`}
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition-colors shadow-md"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In with Google</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
