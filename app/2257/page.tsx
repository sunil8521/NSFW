import Link from "next/link";
import { FaShieldHalved, FaEnvelope, FaChevronRight, FaHouse } from "react-icons/fa6";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "18 U.S.C. 2257 Compliance — Desi Hot Pic",
  description:
    "18 U.S.C. 2257 record-keeping requirements compliance statement and custodian of records for Desi Hot Pic.",
};

export default function RecordKeepingPage() {
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
        <span className="text-white font-medium">18 U.S.C. § 2257</span>
      </nav>

      <div className="p-6 sm:p-10 rounded-2xl bg-[#121212] border border-[#222] space-y-6 shadow-xl text-zinc-300">
        <div className="space-y-2 border-b border-[#222] pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent border border-accent/25 text-xs font-semibold">
            <FaShieldHalved className="w-3.5 h-3.5" />
            <span>Federal Record-Keeping Statement</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white font-display leading-snug">
            18 U.S.C. 2257 Record-Keeping Requirements Compliance Statement
          </h1>
          <p className="text-xs text-zinc-400">
            Last updated: November 2026 &bull; Mandatory Statutory Disclosure
          </p>
        </div>

        <div className="space-y-4 text-sm sm:text-base leading-relaxed">
          <p>
            All models, actors, actresses and other persons that appear in any
            visual depiction of actual or simulated sexually explicit conduct
            appearing or otherwise contained in or at this website were over the
            age of eighteen (18) years at the time of the creation of such
            depictions.
          </p>

          <p>
            All other visual depictions displayed on this website are exempt from
            the provision of 18 U.S.C. §2257 because they do not portray conduct as
            specifically listed in 18 U.S.C. §2256 (2) (A) through (D), but are
            merely depictions of non-sexually explicit nudity, or are otherwise
            exempt because the visual depictions were created prior to July 3, 1995.
          </p>
        </div>

        {/* Custodian Box */}
        <div className="p-5 rounded-xl bg-[#181818] border border-[#2c2c2c] space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FaEnvelope className="w-4 h-4 text-accent" /> Custodian of Records
          </h2>
          <p className="text-xs text-zinc-400">
            Records required pursuant to 18 U.S.C. §2257 and 28 C.F.R. 75 are
            maintained and kept by the Custodian of Records:
          </p>
          <div className="p-3.5 rounded-lg bg-[#111] border border-[#222] text-xs space-y-1 font-mono text-zinc-300">
            <p className="font-bold text-white">Desi Hot Pic Compliance Department</p>
            <p>Records Custodian Office</p>
            <p>
              Email:{" "}
              <a
                href="mailto:contact@desihotpic.com"
                className="text-accent hover:underline font-semibold"
              >
                contact@desihotpic.com
              </a>
            </p>
          </div>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed italic border-t border-[#1f1f1f] pt-4">
          All content hosted or embedded is strictly audited for 18+ legal age
          compliance. Any third-party uploaded content is subject to instantaneous
          removal upon notification.
        </p>
      </div>
    </div>
  );
}
