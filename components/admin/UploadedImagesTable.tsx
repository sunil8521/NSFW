"use client";

import { useState } from "react";
import Image from "next/image";
import type { UploadedImageItem } from "@/lib/db";
import { deleteUploadedImageAction } from "@/actions/image-upload";
import {
  Copy,
  Check,
  Trash2,
  ExternalLink,
  ImageIcon,
  Sparkles,
  AlertTriangle,
  X,
} from "lucide-react";

export default function UploadedImagesTable({
  initialImages,
  onDeleted,
}: {
  initialImages: UploadedImageItem[];
  onDeleted?: (id: string) => void;
}) {
  const [images, setImages] = useState<UploadedImageItem[]>(initialImages);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UploadedImageItem | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const id = deleteTarget.id;
    setDeletingId(id);

    try {
      const res = await deleteUploadedImageAction(id);
      if (res.success) {
        setImages((prev) => prev.filter((img) => img.id !== id));
        if (onDeleted) onDeleted(id);
        setDeleteTarget(null);
      } else {
        alert(res.error || "Failed to delete image record");
      }
    } catch (err: any) {
      alert(err.message || "Error deleting image record");
    } finally {
      setDeletingId(null);
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  if (images.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-[#121212] border border-[#222] space-y-2">
        <ImageIcon className="w-8 h-8 text-zinc-600 mx-auto" />
        <p className="text-sm font-semibold text-zinc-300">No uploaded images yet</p>
        <p className="text-xs text-zinc-500">
          Upload your first image above to store it on ImageTwist and generate direct thumbnail &amp; full links.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-display">
            Stored ImageTwist Images ({images.length})
          </h2>
        </div>
        <span className="text-xs text-zinc-500">
          Saved in DB &bull; Direct CDN links ready for post thumbnails &amp; galleries
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#222] bg-[#121212]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#222] bg-[#181818] text-zinc-400 font-semibold">
              <th className="py-3 px-4">Preview</th>
              <th className="py-3 px-4">Title &amp; Filename</th>
              <th className="py-3 px-4">Direct Thumbnail URL</th>
              <th className="py-3 px-4">Direct Full Image URL</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]">
            {images.map((img) => {
              const thumbCopyKey = `thumb_${img.id}`;
              const directCopyKey = `direct_${img.id}`;
              const pageCopyKey = `page_${img.id}`;

              return (
                <tr key={img.id} className="hover:bg-[#161616] transition-colors">
                  {/* Thumbnail Preview */}
                  <td className="py-3 px-4">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-black/60 border border-[#2a2a2a] shrink-0">
                      <Image
                        src={img.thumbnailUrl || img.directUrl || img.pageUrl}
                        alt={img.title || "Image"}
                        fill
                        className="object-cover"
                        sizes="56px"
                        unoptimized
                      />
                    </div>
                  </td>

                  {/* Title & Info */}
                  <td className="py-3 px-4 max-w-[220px]">
                    <p className="font-semibold text-zinc-200 truncate" title={img.title}>
                      {img.title || "Untitled Image"}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate" title={img.originalName}>
                      {img.originalName}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500">
                      <span>{formatBytes(img.size)}</span>
                      <span>&bull;</span>
                      <span className="font-mono text-zinc-400">{img.code}</span>
                    </div>
                  </td>

                  {/* Direct Thumbnail Link (Ideal for Post Thumbnail) */}
                  <td className="py-3 px-4 max-w-[240px]">
                    {img.thumbnailUrl ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#181818] border border-[#262626]">
                          <span className="font-mono text-[11px] text-amber-400 truncate flex-1">
                            {img.thumbnailUrl}
                          </span>
                          <button
                            onClick={() => copyToClipboard(img.thumbnailUrl, thumbCopyKey)}
                            className="p-1 rounded bg-[#242424] hover:bg-amber-500/20 text-zinc-300 hover:text-amber-400 transition-colors shrink-0"
                            title="Copy Thumbnail URL"
                          >
                            {copiedKey === thumbCopyKey ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] text-zinc-500">
                          Recommended for Post Thumbnail
                        </span>
                      </div>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>

                  {/* Direct Full Image Link (Ideal for Gallery) */}
                  <td className="py-3 px-4 max-w-[240px]">
                    {img.directUrl ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#181818] border border-[#262626]">
                          <span className="font-mono text-[11px] text-emerald-400 truncate flex-1">
                            {img.directUrl}
                          </span>
                          <button
                            onClick={() => copyToClipboard(img.directUrl, directCopyKey)}
                            className="p-1 rounded bg-[#242424] hover:bg-emerald-500/20 text-zinc-300 hover:text-emerald-400 transition-colors shrink-0"
                            title="Copy Full Image URL"
                          >
                            {copiedKey === directCopyKey ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] text-zinc-500">
                          Recommended for Post Images
                        </span>
                      </div>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={img.pageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-[#181818] hover:bg-[#222] border border-[#2a2a2a] text-zinc-400 hover:text-white transition-colors"
                        title="Open on ImageTwist"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => setDeleteTarget(img)}
                        className="p-1.5 rounded-lg bg-[#181818] hover:bg-rose-500/20 border border-[#2a2a2a] hover:border-rose-500/30 text-zinc-400 hover:text-rose-400 transition-colors"
                        title="Delete from Database"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#141414] border border-[#2a2a2a] p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Delete Uploaded Image</h3>
                  <p className="text-xs text-zinc-400">This will remove the image record from your DB.</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#1a1a1a] border border-[#242424] text-xs space-y-1">
              <p className="font-semibold text-white truncate">{deleteTarget.title}</p>
              <p className="text-zinc-500 text-[11px] truncate">{deleteTarget.originalName}</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-[#1f1f1f] hover:bg-[#282828] text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingId === deleteTarget.id}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-colors disabled:opacity-50"
              >
                {deletingId === deleteTarget.id ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
