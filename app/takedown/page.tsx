import Link from "next/link";
import { FaShieldHalved, FaEnvelope, FaChevronRight, FaHouse } from "react-icons/fa6";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content Removal / Takedown Request — Desi Hot Pic",
  description:
    "Fast content removal and takedown request submission form and guidelines for Desi Hot Pic.",
};

export default function TakedownPage() {
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
        <span className="text-white font-medium">Content Removal</span>
      </nav>

      <div className="p-6 sm:p-10 rounded-2xl bg-[#121212] border border-[#222] space-y-6 shadow-xl text-zinc-300">
        <div className="space-y-2 border-b border-[#222] pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent border border-accent/25 text-xs font-semibold">
            <FaShieldHalved className="w-3.5 h-3.5" />
            <span>Takedown Procedure</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Content Removal / Takedown Request
          </h1>
          <p className="text-xs text-zinc-400">
            Last updated: November 2026 &bull; Fast-Track Model & Rights Holder Support
          </p>
        </div>

        <p className="text-sm sm:text-base leading-relaxed">
          If you are the subject of any content on this website and wish to have it
          removed, please contact us with the following details:
        </p>

        <ul className="space-y-3 list-disc list-inside text-sm sm:text-base text-zinc-300">
          <li className="pl-1">
            <span className="font-semibold text-white">Full name</span>
          </li>
          <li className="pl-1">
            <span className="font-semibold text-white">Direct link(s) to the content</span> (URL on our site)
          </li>
          <li className="pl-1">
            <span className="font-semibold text-white">Proof of identity</span> (optional but strongly recommended for faster verification)
          </li>
          <li className="pl-1">
            <span className="font-semibold text-white">Reason for removal request</span>
          </li>
        </ul>

        {/* Email Box */}
        <div className="p-5 rounded-xl bg-[#181818] border border-[#2c2c2c] space-y-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FaEnvelope className="w-4 h-4 text-accent" /> Submit Takedown Request
          </h2>
          <p className="text-xs text-zinc-400">
            Email your removal request with links directly to:
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pt-1 font-mono text-xs">
            <a
              href="mailto:contact@desihotpic.com"
              className="text-accent hover:underline font-semibold"
            >
              contact@desihotpic.com
            </a>
            <span className="text-zinc-600 hidden sm:inline">&bull;</span>
            <a
              href="mailto:sunilmaharana.0x@gmail.com"
              className="text-zinc-400 hover:text-white"
            >
              sunilmaharana.0x@gmail.com
            </a>
          </div>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed italic border-t border-[#1f1f1f] pt-4">
          We will review valid requests and respond within a reasonable time. We take
          personal privacy and rights violations with highest urgency and prioritize
          removal of unauthorized personal depictions.
        </p>
      </div>
    </div>
  );
}
