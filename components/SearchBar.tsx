"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function SearchBar({
  defaultValue = "",
  placeholder = "Search posts, models, categories, tags...",
  size = "md",
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const sizeClasses = {
    sm: "py-2 pl-9 pr-8 text-xs",
    md: "py-2.5 pl-10 pr-9 text-xs sm:text-sm",
    lg: "py-3 sm:py-3.5 pl-11 sm:pl-12 pr-10 text-sm sm:text-base",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5 left-3",
    md: "w-4 h-4 left-3.5",
    lg: "w-4 sm:w-5 h-4 sm:h-5 left-3.5 sm:left-4",
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative w-full ${className}`}
      role="search"
    >
      <Search
        className={`absolute top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none transition-colors ${iconSizes[size]}`}
      />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl sm:rounded-2xl bg-[#141414] border border-[#262626] text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all ${sizeClasses[size]}`}
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white rounded-md transition-colors"
          aria-label="Clear search input"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      )}
    </form>
  );
}
