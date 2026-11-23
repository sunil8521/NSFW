import Link from "next/link";
import { FaShieldHalved, FaEnvelope, FaChevronRight, FaHouse } from "react-icons/fa6";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Desi Hot Pic",
  description: "Privacy policy and cookies usage for Desi Hot Pic.",
};

export default function PrivacyPage() {
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
        <span className="text-white font-medium">Privacy Policy</span>
      </nav>

      <div className="p-6 sm:p-10 rounded-2xl bg-[#121212] border border-[#222] space-y-6 shadow-xl text-zinc-300">
        <div className="space-y-2 border-b border-[#222] pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent border border-accent/25 text-xs font-semibold">
            <FaShieldHalved className="w-3.5 h-3.5" />
            <span>Data & Privacy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Privacy Policy
          </h1>
          <p className="text-xs text-zinc-400">
            Last updated: November 2026 &bull; Transparent User Privacy Standards
          </p>
        </div>

        <div className="space-y-4 text-sm sm:text-base leading-relaxed">
          <p>
            We collect limited information when you visit this website, such as IP
            address, browser type, and pages visited, through standard analytics and
            cookies.
          </p>

          <p>
            We do not sell your personal data. Information may be shared with
            advertising partners (e.g. ad networks) in anonymous form for
            advertising purposes.
          </p>

          <p>
            We use cookies to improve user experience and show relevant ads.
          </p>
        </div>

        {/* Contact box */}
        <div className="p-5 rounded-xl bg-[#181818] border border-[#2c2c2c] space-y-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FaEnvelope className="w-4 h-4 text-accent" /> Privacy Inquiries
          </h2>
          <p className="text-xs text-zinc-400">
            You can contact us for any privacy-related requests or data disclosures:
          </p>
          <div className="pt-1 font-mono text-xs">
            <a
              href="mailto:contact@desihotpic.com"
              className="text-accent hover:underline font-semibold"
            >
              contact@desihotpic.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
