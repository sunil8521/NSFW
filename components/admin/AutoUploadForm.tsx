"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { uploadRemoteVideoUrlAction } from "@/actions/auto-upload";
import {
  UploadCloud,
  Link as LinkIcon,
  FileVideo,
  Check,
  Copy,
  AlertCircle,
  Sparkles,
  Server,
  ExternalLink,
} from "lucide-react";
import type { UploadedVideoItem } from "@/lib/db";

interface AutoUploadInputs {
  title: string;
  mode: "file" | "url";
  videoFile?: FileList;
  remoteUrl?: string;
}

interface SSEProgressEvent {
  stage: string;
  percent: number;
  message: string;
  streamtapePercent?: number;
  vidaraPercent?: number;
  streamtape?: {
    fileId: string;
    watchUrl: string;
    embedUrl: string;
  };
  vidara?: {
    filecode: string;
    watchUrl: string;
    embedUrl: string;
  };
  result?: UploadedVideoItem;
}

export default function AutoUploadForm({
  onUploadSuccess,
}: {
  onUploadSuccess?: (newVideo: UploadedVideoItem) => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AutoUploadInputs>({
    defaultValues: {
      mode: "file",
      title: "",
      remoteUrl: "",
    },
  });

  const selectedMode = watch("mode");
  const selectedFiles = watch("videoFile");

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<SSEProgressEvent | null>(null);
  const [completedResult, setCompletedResult] = useState<UploadedVideoItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(key);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const onSubmit = async (data: AutoUploadInputs) => {
    setError(null);
    setCompletedResult(null);

    // MODE: Remote URL — Handled via Next.js 16 Server Action
    if (data.mode === "url") {
      if (!data.remoteUrl?.trim()) {
        setError("Please enter a valid remote video URL");
        return;
      }
      setIsUploading(true);
      setProgress({
        stage: "processing",
        percent: 60,
        message: "Storing remote video URL via Server Action...",
      });

      try {
        const res = await uploadRemoteVideoUrlAction({
          title: data.title,
          url: data.remoteUrl.trim(),
        });

        if (res.success && res.video) {
          setProgress({
            stage: "completed",
            percent: 100,
            message: "Remote video successfully saved in database!",
            result: res.video,
          });
          setCompletedResult(res.video);
          if (onUploadSuccess) onUploadSuccess(res.video);
        } else {
          setError(res.error || "Failed to save remote video URL");
        }
      } catch (err: any) {
        setError(err?.message || "Server action failed to save video URL");
      } finally {
        setIsUploading(false);
      }
      return;
    }

    // MODE: Direct File Binary Upload — Handled via SSE Streaming Route
    setProgress({
      stage: "init",
      percent: 2,
      message: "Starting upload session...",
    });

    if (!data.videoFile || data.videoFile.length === 0) {
      setError("Please choose a video file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("title", data.title || "");
    formData.append("file", data.videoFile[0]);

    setIsUploading(true);

    try {
      const response = await fetch("/api/admin/auto-upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.error || `Upload failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No readable stream response received");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data:")) {
            try {
              const eventData: SSEProgressEvent = JSON.parse(
                trimmed.replace(/^data:\s*/, "")
              );
              setProgress(eventData);

              if (eventData.stage === "error") {
                setError(eventData.message);
                setIsUploading(false);
                return;
              }

              if (eventData.stage === "completed" && eventData.result) {
                setCompletedResult(eventData.result);
                if (onUploadSuccess) {
                  onUploadSuccess(eventData.result);
                }
              }
            } catch (parseErr) {
              // Ignore partial chunks
            }
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || "Failed to process video upload");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-5 sm:p-6 rounded-2xl bg-[#121212] border border-[#222] space-y-6 shadow-xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#222]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white font-display">
                Dual Auto Uploader
              </h1>
              <p className="text-xs text-zinc-400">
                Uploads simultaneously to Streamtape & Vidara with live SSE progress.
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#181818] border border-[#2b2b2b] text-xs">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all has-[:checked]:bg-accent has-[:checked]:text-white text-zinc-400">
              <input
                type="radio"
                value="file"
                disabled={isUploading}
                {...register("mode")}
                className="hidden"
              />
              <FileVideo className="w-3.5 h-3.5" />
              <span>Direct File</span>
            </label>
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all has-[:checked]:bg-accent has-[:checked]:text-white text-zinc-400">
              <input
                type="radio"
                value="url"
                disabled={isUploading}
                {...register("mode")}
                className="hidden"
              />
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Remote URL</span>
            </label>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Inputs */}
        <div className="grid grid-cols-1 gap-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Video Title (Optional &bull; Defaults to filename)
            </label>
            <input
              type="text"
              disabled={isUploading}
              placeholder="e.g. Desi College Tour Episode 1 (720p)"
              {...register("title")}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2b2b2b] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-accent disabled:opacity-40"
            />
          </div>

          {/* Mode 1: File Input */}
          {selectedMode === "file" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Choose Video File <span className="text-accent">*</span>
              </label>
              <div className="p-4 rounded-xl bg-[#171717] border border-dashed border-[#333] hover:border-accent/40 transition-colors">
                <input
                  type="file"
                  accept="video/mp4,video/mkv,video/webm,video/quicktime"
                  disabled={isUploading}
                  {...register("videoFile")}
                  className="w-full text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-accent file:text-white hover:file:bg-accent-hover cursor-pointer disabled:opacity-40"
                />
                {selectedFiles && selectedFiles.length > 0 && (
                  <p className="mt-2 text-[11px] text-zinc-400 font-mono">
                    Selected: {selectedFiles[0].name} (
                    {(selectedFiles[0].size / (1024 * 1024)).toFixed(1)} MB)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Mode 2: Remote URL Input */}
          {selectedMode === "url" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Direct Video Download URL <span className="text-accent">*</span>
              </label>
              <input
                type="url"
                disabled={isUploading}
                placeholder="https://example-server.com/videos/episode1.mp4"
                {...register("remoteUrl")}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2b2b2b] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-accent disabled:opacity-40"
              />
              <p className="text-[11px] text-zinc-500">
                Streamtape and Vidara will download the video server-to-server instantly.
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-zinc-500 hidden sm:inline">
            Streams live progress via SSE &bull; Stores in DB at 100%
          </span>
          <button
            type="submit"
            disabled={isUploading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-accent hover:bg-accent-hover shadow-lg shadow-accent/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Uploading... ({progress?.percent || 0}%)</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Start Dual Auto Upload</span>
              </>
            )}
          </button>
        </div>

        {/* Live SSE Progress Display */}
        {isUploading && progress && (
          <div className="p-4 rounded-xl bg-[#171717] border border-[#282828] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-medium text-zinc-300">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span>{progress.message}</span>
              </div>
              <span className="font-mono font-bold text-accent">
                {progress.percent}%
              </span>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full h-2 rounded-full bg-[#242424] overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300 rounded-full"
                style={{ width: `${progress.percent}%` }}
              />
            </div>

            {/* Server breakdown */}
            <div className="grid grid-cols-2 gap-3 pt-1 text-[11px]">
              <div className="p-2 rounded-lg bg-[#111] border border-[#222] flex items-center justify-between">
                <span className="text-zinc-400">Streamtape:</span>
                <span className="font-mono text-white">
                  {progress.percent >= 50 ? "✓ 100%" : `${progress.streamtapePercent || 0}%`}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[#111] border border-[#222] flex items-center justify-between">
                <span className="text-zinc-400">Vidara:</span>
                <span className="font-mono text-white">
                  {progress.percent >= 95 ? "✓ 100%" : `${progress.vidaraPercent || 0}%`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 100% Completion & Link Generation Box */}
        {completedResult && (
          <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-5 h-5" />
                <h3 className="text-sm font-bold font-display">
                  Upload 100% Completed & Saved to DB!
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                Dual Servers Ready
              </span>
            </div>

            <p className="text-xs text-zinc-300">
              The video is successfully hosted and ready to be embedded. You can copy the links below:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Streamtape Card */}
              <div className="p-3.5 rounded-xl bg-[#141414] border border-[#262626] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-200">
                    Server 1 (Streamtape HD)
                  </span>
                  <a
                    href={completedResult.streamtape.watchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-zinc-400 hover:text-accent flex items-center gap-1"
                  >
                    <span>Watch</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={completedResult.streamtape.embedUrl}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#0d0d0d] border border-[#2a2a2a] text-xs text-zinc-300 select-all"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        completedResult.streamtape.embedUrl,
                        "streamtape"
                      )
                    }
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {copiedLink === "streamtape" ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Vidara Card */}
              <div className="p-3.5 rounded-xl bg-[#141414] border border-[#262626] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-200">
                    Server 2 (Vidara HD)
                  </span>
                  <a
                    href={completedResult.vidara.watchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-zinc-400 hover:text-accent flex items-center gap-1"
                  >
                    <span>Watch</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={completedResult.vidara.embedUrl}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#0d0d0d] border border-[#2a2a2a] text-xs text-zinc-300 select-all"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(completedResult.vidara.embedUrl, "vidara")
                    }
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {copiedLink === "vidara" ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  const json = JSON.stringify(
                    [
                      {
                        label: "Server 1 (Streamtape HD)",
                        url: completedResult.streamtape.embedUrl,
                        provider: "streamtape",
                      },
                      {
                        label: "Server 2 (Vidara HD)",
                        url: completedResult.vidara.embedUrl,
                        provider: "vidara",
                      },
                    ],
                    null,
                    2
                  );
                  copyToClipboard(json, "json");
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1b1b1b] hover:bg-[#252525] border border-[#333] text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                {copiedLink === "json" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied Post JSON!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    <span>Copy Post Links JSON</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  reset();
                  setCompletedResult(null);
                  setProgress(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white text-xs transition-colors"
              >
                Upload Another Video
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
