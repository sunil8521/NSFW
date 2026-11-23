import Link from "next/link";
import { FaShieldHalved, FaChevronRight, FaHouse } from "react-icons/fa6";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Desi Hot Pic",
  description: "User agreement and terms of service for Desi Hot Pic.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#737373]">
        <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
          <FaHouse className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <FaChevronRight className="w-2.5 h-2.5 text-[#525252]" />
        <span className="text-[#a3a3a3]">Legal</span>
        <FaChevronRight className="w-2.5 h-2.5 text-[#525252]" />
        <span className="text-white font-medium">Terms of Service</span>
      </nav>

      <div className="p-6 sm:p-10 rounded-2xl bg-[#121212] border border-[#222] space-y-6 shadow-xl text-zinc-300">
        <div className="space-y-2 border-b border-[#222] pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent border border-accent/25 text-xs font-semibold">
            <FaShieldHalved className="w-3.5 h-3.5" />
            <span>User Agreement</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Terms of Service
          </h1>
          <p className="text-xs text-zinc-400">
            Last updated: November 2026 &bull; Mandatory Agreement for All Visitors
          </p>
        </div>

        <p className="text-sm sm:text-base leading-relaxed font-medium text-white">
          By accessing this website, you agree to the following terms:
        </p>

        <ol className="space-y-3.5 list-decimal list-inside text-sm sm:text-base text-zinc-300">
          <li className="pl-1">
            <span className="font-semibold text-white">Age Requirement:</span> You
            must be at least 18 years old to enter this website.
          </li>
          <li className="pl-1">
            <span className="font-semibold text-white">Adults Only:</span> All content
            is intended for adults only.
          </li>
          <li className="pl-1">
            <span className="font-semibold text-white">Lawful Use:</span> You will not
            use this website for any illegal purpose.
          </li>
          <li className="pl-1">
            <span className="font-semibold text-white">External Content:</span> We are
            not responsible for external links or third-party content.
          </li>
          <li className="pl-1">
            <span className="font-semibold text-white">Discretionary Removal:</span>{" "}
            We reserve the right to remove any content or ban users at our
            discretion.
          </li>
          <li className="pl-1">
            <span className="font-semibold text-white">No Warranties:</span> All content
            is provided &ldquo;as is&rdquo; without any warranties.
          </li>
        </ol>

        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm font-medium">
          If you do not agree with these terms, please leave the website immediately.
        </div>
      </div>
    </div>
  );
}
