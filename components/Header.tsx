"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Menu,
  Bookmark,
  Compass,
  TrendingUp,
  Search,
  LogIn,
  LogOut,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import MobileNavigation from "./MobileNavigation";
import SearchBar from "./SearchBar";

const NAV_LINKS = [
  { label: "Home", href: "/", icon: Compass },
  { label: "Trending", href: "/category/trending", icon: TrendingUp },
  { label: "Desi", href: "/category/desi" },
  { label: "Babe", href: "/category/babe" },
  { label: "Couple", href: "/category/couple" },
  { label: "Webcam", href: "/category/webcam" },
  { label: "Amateur", href: "/category/amateur" },
];

export default function Header() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
    setUserDropdownOpen(false);
    window.location.href = "/";
  };

  const safeCallback =
    pathname && !pathname.startsWith("/sign-in") && !pathname.startsWith("/sign-up")
      ? pathname
      : "/";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-[#090909]/95 backdrop-blur-xl border-b border-[#222]/80 shadow-[0_4px_30px_rgba(0,0,0,0.6)] py-2"
            : "bg-gradient-to-b from-[#090909]/95 via-[#090909]/75 to-transparent backdrop-blur-sm border-b border-transparent py-2.5 sm:py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* 1. Left: Brand Logo */}
            <Link
              href="/"
              className="group flex items-center shrink-0 focus:outline-none"
              aria-label="DesiHotPic Home"
            >
              <div className="relative h-10 w-32 sm:h-12 sm:w-44 md:h-14 md:w-52 transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_2px_12px_rgba(229,46,46,0.22)]">
                <Image
                  src="/logo.png"
                  alt="DesiHotPic"
                  fill
                  priority
                  className="object-contain object-left"
                />
              </div>
            </Link>

            {/* 2. Center: Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-3 py-1">
              {NAV_LINKS.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-3 py-2 text-xs xl:text-sm font-semibold transition-colors duration-200 ${
                      isActive
                        ? "text-accent"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <motion.span
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-2 right-2 h-[2px] bg-accent rounded-full shadow-[0_0_10px_rgba(229,46,46,0.85)]"
                        transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 32,
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* 3. Right: Search, Bookmarks, Auth, Mobile Toggle */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Desktop quick search */}
              <div className="hidden md:block w-44 lg:w-56 xl:w-72">
                <SearchBar size="sm" placeholder="Quick search..." />
              </div>

              {/* Mobile search toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden shrink-0 p-2 rounded-xl bg-[#141414] hover:bg-[#1c1c1c] border border-[#262626] text-zinc-400 hover:text-white transition-colors"
                aria-label="Toggle search bar"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Saved bookmarks (desktop & tablet, hidden on tiny mobile) */}
              <Link
                href="/saved"
                className="hidden sm:flex shrink-0 whitespace-nowrap px-3 py-2 rounded-xl bg-[#141414] hover:bg-[#1c1c1c] border border-[#262626] text-zinc-400 hover:text-white transition-colors items-center gap-1.5 text-xs font-semibold"
                title="Saved Bookmarks"
              >
                <Bookmark className="w-4 h-4 text-accent" />
                <span className="hidden xl:inline">Saved</span>
              </Link>

              {/* User Dropdown / Sign-In */}
              {isPending ? (
                <div className="w-18 sm:w-20 h-7 sm:h-8 rounded-xl bg-zinc-800/40 animate-pulse shrink-0" />
              ) : session?.user ? (
                <div className="relative shrink-0" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="shrink-0 flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full bg-[#141414] border border-[#262626] hover:border-accent/40 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
                      {session.user.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || "User"}
                          width={28}
                          height={28}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-accent">
                          {(session.user.name || "U")[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="hidden sm:inline text-xs font-semibold text-zinc-200 max-w-[100px] truncate">
                      {session.user.name?.split(" ")[0]}
                    </span>
                    <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-zinc-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#121212] border border-[#262626] shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2 border-b border-[#222]">
                        <p className="font-semibold text-white truncate">
                          {session.user.name}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate">
                          {session.user.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/saved"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-[#1a1a1a] transition-colors"
                        >
                          <Bookmark className="w-3.5 h-3.5 text-accent" />
                          <span>My Bookmarks</span>
                        </Link>

                        {((session.user as any).u === 1 ||
                          session.user.email === "sunilmaharana.0x@gmail.com") && (
                          <Link
                            href="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-accent hover:text-white hover:bg-accent/15 transition-colors font-semibold"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                            <span>Admin Panel</span>
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-[#222]">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors text-left font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={`/sign-in?callbackUrl=${encodeURIComponent(safeCallback)}`}
                  className="shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold transition-all shadow-md"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden shrink-0 p-2 rounded-xl bg-[#141414] hover:bg-[#1c1c1c] border border-[#262626] text-zinc-300 hover:text-white transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Mobile search drop down */}
          {searchOpen && (
            <div className="md:hidden pt-3 pb-1 border-t border-[#1f1f1f] mt-2 animate-in fade-in slide-in-from-top-2 duration-150">
              <SearchBar size="sm" placeholder="Search DesiHotPic..." />
            </div>
          )}
        </div>
      </header>

      {/* Slide-over Mobile Navigation */}
      <MobileNavigation isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
