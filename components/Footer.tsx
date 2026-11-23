"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FaFire,
  FaHeart,
  FaShieldHalved,
  FaPaperPlane,
  FaEnvelope,
  FaCircleCheck,
} from "react-icons/fa6";

const CATEGORY_LINKS = [
  { label: "Trending", href: "/category/trending" },
  { label: "Desi", href: "/category/desi" },
  { label: "Babe", href: "/category/babe" },
  { label: "Couple", href: "/category/couple" },
  { label: "Solo", href: "/category/solo" },
  { label: "Webcam", href: "/category/webcam" },
  { label: "Amateur", href: "/category/amateur" },
];

const LEGAL_LINKS = [
  { label: "DMCA Notice", href: "/dmca" },
  { label: "18 U.S.C. 2257 Record-Keeping", href: "/2257" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Content Removal / Takedown", href: "/takedown" },
  { label: "Age Verification & Consent", href: "/age-verification" },
];

const COMMUNITY_LINKS = [
  { label: "Telegram Channel", href: "#", icon: FaPaperPlane },
  { label: "Support & Contact", href: "mailto:support@desihotpic.local", icon: FaEnvelope },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#262626] bg-[#070707] text-[#a3a3a3] pt-14 pb-8 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top Section: Brand + Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-block group">
              <div className="relative h-20 w-64 sm:h-24 sm:w-76 md:h-28 md:w-88 transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_4px_20px_rgba(229,46,46,0.25)]">
                <Image
                  src="/logo.png"
                  alt="Desi Hot Pic"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>

            <p className="text-xs text-[#737373] leading-relaxed max-w-sm">
              Modern high-speed media discovery portal with responsive layout,
              cloud-accelerated galleries, and clean curation.
            </p>

            {/* Status indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141414] border border-[#262626] text-[11px] text-[#888]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Cloud Streaming: </span>
              <span className="text-emerald-400 font-medium">Online</span>
            </div>
          </div>

          {/* Column 1: Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Categories
            </h4>
            <ul className="space-y-2 text-xs">
              {CATEGORY_LINKS.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="hover:text-white transition-colors duration-200 inline-block py-0.5"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Legal & Safety */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FaShieldHalved className="w-3 h-3 text-accent" /> Compliance
            </h4>
            <ul className="space-y-2 text-xs">
              {LEGAL_LINKS.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="hover:text-white transition-colors duration-200 inline-block py-0.5 text-[#888]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Community & Connect */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Community
            </h4>
            <ul className="space-y-2 text-xs">
              {COMMUNITY_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <motion.a
                      href={item.href}
                      whileHover={{ x: 3 }}
                      className="hover:text-white transition-colors duration-200 inline-flex items-center gap-2 py-0.5 text-[#888]"
                    >
                      <Icon className="w-3.5 h-3.5 text-accent" />
                      {item.label}
                    </motion.a>
                  </li>
                );
              })}
            </ul>

            <div className="pt-2">
              <div className="p-3 rounded-xl bg-[#141414] border border-[#262626] space-y-1">
                <span className="text-[11px] font-semibold text-white flex items-center gap-1.5">
                  <FaCircleCheck className="w-3 h-3 text-emerald-400" /> 100% Free Access
                </span>
                <p className="text-[10px] text-[#737373]">
                  No subscriptions or paywalls. Updated hourly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 18+ Warning Banner */}
        <div className="p-4 rounded-xl bg-[#101010] border border-[#262626] flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 text-accent flex items-center justify-center shrink-0 font-black text-xs">
            18+
          </div>
          <p className="text-[11px] text-[#666] leading-relaxed">
            <strong className="text-[#a3a3a3] font-semibold">
              Adult Content Advisory:
            </strong>{" "}
            This service contains sexually explicit material intended solely for
            legal consenting adults (18+). All records required by{" "}
            <Link href="/2257" className="underline hover:text-white">
              18 U.S.C. 2257
            </Link>{" "}
            and relevant statutory compliance are retained by respective original
            content custodians. By entering, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-white">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/age-verification" className="underline hover:text-white">
              Age Verification &amp; Consent
            </Link>.
          </p>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="pt-6 border-t border-[#1c1c1c] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#666]">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} Desi Hot Pic. Crafted with Next.js &{" "}
            <FaHeart className="inline-block w-3 h-3 text-rose-500 align-middle mb-0.5" />
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px]">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>·</span>
            <Link href="/dmca" className="hover:text-white transition-colors">
              DMCA
            </Link>
            <span>·</span>
            <Link href="/2257" className="hover:text-white transition-colors">
              2257
            </Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <span>·</span>
            <Link href="/takedown" className="hover:text-white transition-colors">
              Removal
            </Link>
            <span>·</span>
            <Link href="/age-verification" className="hover:text-white transition-colors">
              18+ Consent
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
