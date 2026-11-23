import Link from "next/link";
import { FaShieldHalved, FaEnvelope, FaChevronRight, FaHouse } from "react-icons/fa6";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DMCA Notice — Desi Hot Pic",
  description:
    "Digital Millennium Copyright Act (DMCA) notice and designated agent information for Desi Hot Pic.",
};

export default function DmcaPage() {
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
        <span className="text-white font-medium">DMCA Notice</span>
      </nav>

      <div className="p-6 sm:p-10 rounded-2xl bg-[#121212] border border-[#222] space-y-6 shadow-xl text-zinc-300">
        <div className="space-y-2 border-b border-[#222] pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent border border-accent/25 text-xs font-semibold">
            <FaShieldHalved className="w-3.5 h-3.5" />
            <span>Copyright Policy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            DMCA Notice
          </h1>
          <p className="text-xs text-zinc-400">
            Last updated: November 2026 &bull; Digital Millennium Copyright Act Compliance
          </p>
        </div>

        <p className="text-sm sm:text-base leading-relaxed">
          If you believe that your copyrighted work has been used on this website
          without authorization, please send a written DMCA notice to our
          designated agent including the following information:
        </p>

        <ol className="space-y-3.5 list-decimal list-inside text-sm sm:text-base text-zinc-300">
          <li className="pl-1">
            <span className="font-semibold text-white">Signature:</span> A physical
            or electronic signature of the copyright owner or authorized person.
          </li>
          <li className="pl-1">
            <span className="font-semibold text-white">Work Identification:</span>{" "}
            Identification of the copyrighted work claimed to have been infringed.
          </li>
          <li className="pl-1">
            <span className="font-semibold text-white">Material Location:</span>{" "}
            Identification of the material that is claimed to be infringing and
            information reasonably sufficient to locate the material (direct URL).
          </li>
          <li className="pl-1">
            <span className="font-semibold text-white">Contact Info:</span> Your
            contact information (full name, address, telephone number, and valid email).
          </li>
          <li className="pl-1">
            <span className="font-semibold text-white">Good Faith Statement:</span>{" "}
            A statement that you have a good faith belief that the use is not
            authorized by the copyright owner, its agent, or the law.
          </li>
          <li className="pl-1">
            <span className="font-semibold text-white">Penalty of Perjury:</span> A
            statement that the information in the notice is accurate, and under
            penalty of perjury, that you are authorized to act on behalf of the
            copyright owner.
          </li>
        </ol>

        {/* Contact Agent Box */}
        <div className="p-5 rounded-xl bg-[#181818] border border-[#2c2c2c] space-y-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FaEnvelope className="w-4 h-4 text-accent" /> Designated DMCA Agent
          </h2>
          <p className="text-xs text-zinc-400">
            Please submit your detailed notice directly to our designated agent:
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
          We will respond promptly to valid DMCA notices. Upon receipt of a valid
          notice conforming with 17 U.S.C. § 512, we will take appropriate actions,
          including expeditious removal or disabling of access to the infringing material.
        </p>
      </div>
    </div>
  );
}
