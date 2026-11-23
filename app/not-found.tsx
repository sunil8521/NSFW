import Link from "next/link";
import { FaFire, FaHouse } from "react-icons/fa6";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <FaFire className="w-16 h-16 text-accent mb-6 opacity-50" />
      <h1 className="text-6xl font-extrabold gradient-text mb-3 font-display">404</h1>
      <p className="text-xl font-semibold text-[#a3a3a3] mb-2 font-display">
        Page Not Found
      </p>
      <p className="text-sm text-[#737373] mb-8 max-w-md">
        The content you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/"
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold text-sm transition-colors"
      >
        <FaHouse className="w-4 h-4" />
        Back to Home
      </Link>
    </div>
  );
}
