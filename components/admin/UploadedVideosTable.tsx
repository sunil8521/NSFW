"use client";

import { useState } from "react";
import type { UploadedVideoItem } from "@/lib/db";
import { deleteUploadedVideoAction } from "@/actions/auto-upload";
import {
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Film,
  Server,
  Sparkles,
  AlertTriangle,
  X,
} from "lucide-react";

export default function UploadedVideosTable({
  initialVideos,
  onDeleted,
}: {
  initialVideos: UploadedVideoItem[];
  onDeleted?: (id: string) => void;
}) {
  const [videos, setVideos] = useState<UploadedVideoItem[]>(initialVideos);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<UploadedVideoItem | null>(null);
  const [deleteFromHosts, setDeleteFromHosts] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const id = deleteTarget.id;
    setDeletingId(id);

    try {
      // Server Action (Next.js 16 best practice)
      const res = await deleteUploadedVideoAction(id, deleteFromHosts);
      if (res.success) {
        setVideos((prev) => prev.filter((v) => v.id !== id));
        if (onDeleted) onDeleted(id);
        setDeleteTarget(null);
      } else {
        alert(res.error || "Failed to delete");
      }
    } catch (err: any) {
      alert(err.message || "Error deleting video");
    } finally {
      setDeletingId(null);
    }
  };

  if (videos.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-[#121212] border border-[#222] space-y-2">
        <Film className="w-8 h-8 text-zinc-600 mx-auto" />
        <p className="text-sm font-semibold text-zinc-300">No uploaded videos yet</p>
        <p className="text-xs text-zinc-500">
          Upload your first video above to generate and store Streamtape & Vidara links.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-display">
            Stored Uploaded Videos ({videos.length})
          </h2>
        </div>
        <span className="text-xs text-zinc-500">
          Saved in DB &bull; Ready to paste into posts
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#222] bg-[#121212]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#222] bg-[#181818] text-zinc-400 font-semibold">
              <th className="py-3 px-4">Title & Details</th>
              <th className="py-3 px-4">Streamtape Embed</th>
              <th className="py-3 px-4">Vidara Embed</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]">
            {videos.map((video) => {
              const streamtapeEmbed = video.streamtape?.embedUrl || "";
              const vidaraEmbed = video.vidara?.embedUrl || "";
              const postJson = JSON.stringify(
                [
                  {
                    label: "Server 1 (Streamtape HD)",
                    url: streamtapeEmbed,
                    provider: "streamtape",
                  },
                  {
                    label: "Server 2 (Vidara HD)",
                    url: vidaraEmbed,
                    provider: "vidara",
                  },
                ],
                null,
                2
              );

              return (
                <tr
                  key={video.id}
                  className="hover:bg-[#161616] transition-colors"
                >
                  {/* Title & Metadata */}
                  <td className="py-3.5 px-4 min-w-[220px]">
                    <div className="space-y-1">
                      <p className="font-semibold text-zinc-200 line-clamp-1">
                        {video.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                        <span>
                          {new Date(video.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {video.size && (
                          <>
                            <span>&bull;</span>
                            <span>{(video.size / (1024 * 1024)).toFixed(1)} MB</span>
                          </>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Streamtape Link */}
                  <td className="py-3.5 px-4 min-w-[220px]">
                    {streamtapeEmbed ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={streamtapeEmbed}
                          className="px-2 py-1 rounded-lg bg-[#0e0e0e] border border-[#2b2b2b] text-[11px] text-zinc-300 w-44 truncate select-all"
                        />
                        <button
                          onClick={() =>
                            copyToClipboard(streamtapeEmbed, `st-${video.id}`)
                          }
                          className="p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          title="Copy Streamtape Embed"
                        >
                          {copiedId === `st-${video.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href={video.streamtape.watchUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-zinc-500 hover:text-accent transition-colors"
                          title="Preview on Streamtape"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-zinc-600 italic">Not available</span>
                    )}
                  </td>

                  {/* Vidara Link */}
                  <td className="py-3.5 px-4 min-w-[220px]">
                    {vidaraEmbed ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={vidaraEmbed}
                          className="px-2 py-1 rounded-lg bg-[#0e0e0e] border border-[#2b2b2b] text-[11px] text-zinc-300 w-44 truncate select-all"
                        />
                        <button
                          onClick={() =>
                            copyToClipboard(vidaraEmbed, `vd-${video.id}`)
                          }
                          className="p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          title="Copy Vidara Embed"
                        >
                          {copiedId === `vd-${video.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href={video.vidara.watchUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-zinc-500 hover:text-accent transition-colors"
                          title="Preview on Vidara"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ) : (
                      <span className="text-zinc-600 italic">Not available</span>
                    )}
                  </td>

                  {/* Actions: Copy JSON & Delete */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(postJson, `json-${video.id}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#1a1a1a] hover:bg-[#252525] border border-[#2e2e2e] text-zinc-300 transition-colors cursor-pointer"
                        title="Copy full JSON payload for post"
                      >
                        {copiedId === `json-${video.id}` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-accent" />
                            <span>Copy JSON</span>
                          </>
                        )}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => {
                          setDeleteTarget(video);
                          setDeleteFromHosts(false);
                        }}
                        disabled={deletingId === video.id}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-40 cursor-pointer"
                        title="Delete video record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#141414] border border-[#2a2a2a] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white font-display">
                  Delete Video Record
                </h3>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-[#202020]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300">
              Are you sure you want to remove <strong className="text-white">&ldquo;{deleteTarget.title}&rdquo;</strong>?
            </p>

            {/* Checkbox: Also Delete from Remote Hosts */}
            <div className="p-3 rounded-xl bg-[#1a1a1a] border border-[#2c2c2c] space-y-1.5">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteFromHosts}
                  onChange={(e) => setDeleteFromHosts(e.target.checked)}
                  className="mt-0.5 rounded border-zinc-700 text-accent focus:ring-accent"
                />
                <div className="text-xs">
                  <span className="font-semibold text-white block">
                    Also delete file permanently from Streamtape & Vidara servers
                  </span>
                  <span className="text-[11px] text-zinc-400 block mt-0.5">
                    Calls both hosting APIs to remove the video file so it no longer streams anywhere.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-[#1e1e1e] hover:bg-[#282828] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deletingId === deleteTarget.id}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-md disabled:opacity-50 cursor-pointer"
              >
                {deletingId === deleteTarget.id ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Record</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
