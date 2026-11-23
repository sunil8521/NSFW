import Link from "next/link";
import { FaShieldHalved, FaChevronRight, FaHouse } from "react-icons/fa6";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Age Verification & Consent — Desi Hot Pic",
  description:
    "Age verification, legal consent, and mandatory 18+ policy for accessing Desi Hot Pic.",
};

export default function AgeVerificationPage() {
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
        <span className="text-white font-medium">Age Verification &amp; Consent</span>
      </nav>

      <div className="p-6 sm:p-10 rounded-2xl bg-[#121212] border border-[#222] space-y-6 shadow-xl text-zinc-300">
        <div className="space-y-2 border-b border-[#222] pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent border border-accent/25 text-xs font-semibold">
            <FaShieldHalved className="w-3.5 h-3.5" />
            <span>18+ Strict Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Age Verification &amp; Consent
          </h1>
          <p className="text-xs text-zinc-400">
            Last updated: November 2026 &bull; Mandatory Adult Gateway Notice
          </p>
        </div>

        <p className="text-sm sm:text-base leading-relaxed font-medium text-white">
          This website contains adult material and is intended only for individuals
          who are 18 years of age or older (or the age of legal majority in your
          jurisdiction).
        </p>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-zinc-200">
            By entering and browsing this website, you confirm that:
          </p>
          <ul className="space-y-2.5 list-disc list-inside text-sm sm:text-base text-zinc-300">
            <li className="pl-1">
              You are at least 18 years old.
            </li>
            <li className="pl-1">
              You are not accessing this website from a location where adult content is prohibited.
            </li>
            <li className="pl-1">
              You consent to viewing adult material.
            </li>
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm font-medium">
          If you are under 18 or do not wish to view adult content, please leave this
          website immediately.
        </div>
      </div>
    </div>
  );
}
