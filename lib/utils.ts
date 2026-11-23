export function formatViews(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "k";
  return num.toString();
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return "Just now";
  if (hours < 24) return hours + "h ago";
  if (days < 7) return days + "d ago";
  if (days < 30) return Math.floor(days / 7) + "w ago";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Resolves an image URL safely:
 * - ImageTwist /th/ URLs are explicitly permitted for hotlinking on all websites
 * - If preferThumbnail is true, converts /i/ URLs to /th/ URLs
 * - Otherwise routes direct /i/ URLs through /api/image-proxy?url=...
 */
export function getSafeImageUrl(
  url: string | undefined | null,
  preferThumbnail = false
): string {
  if (!url) return "/logo.png";
  if (!url.startsWith("http")) return url;

  if (url.includes("imagetwist.com")) {
    if (url.includes("/th/")) {
      return url;
    }
    if (preferThumbnail && url.includes("/i/")) {
      return url.replace(/\/i\/(\d+\/[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+).*/, "/th/$1");
    }
    // Route full direct image through proxy to bypass hotlink referer checks
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }

  return url;
}

