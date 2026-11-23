"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import {
  uploadImageFileAction,
  uploadRemoteImageUrlAction,
} from "@/actions/image-upload";
import {
  UploadCloud,
  Link as LinkIcon,
  ImageIcon,
  Check,
  Copy,
  AlertCircle,
  Sparkles,
  ExternalLink,
  RotateCw,
} from "lucide-react";
import type { UploadedImageItem } from "@/lib/db";

interface AutoImageUploadInputs {
  mode: "file" | "url";
  title: string;
  thumbnailSize: "100x100" | "170x170" | "250x250" | "300x300" | "350x350" | "500x500" | "800x800";
  imageFile?: FileList;
  remoteUrl?: string;
}

export default function AutoImageUploadForm({
  onUploadSuccess,
}: {
  onUploadSuccess?: (newImage: UploadedImageItem) => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<AutoImageUploadInputs>({
    defaultValues: {
      mode: "file",
      title: "",
      thumbnailSize: "500x500",
      remoteUrl: "",
    },
  });

  const selectedMode = watch("mode");
  const selectedFiles = watch("imageFile");

  const [isUploading, setIsUploading] = useState(false);
  const [completedResult, setCompletedResult] = useState<UploadedImageItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const onSubmit = async (data: AutoImageUploadInputs) => {
    setError(null);
    setCompletedResult(null);
    setIsUploading(true);

    try {
      if (data.mode === "url") {
        if (!data.remoteUrl?.trim()) {
          setError("Please enter a valid remote image URL");
          setIsUploading(false);
          return;
        }

        const res = await uploadRemoteImageUrlAction({
          url: data.remoteUrl.trim(),
          title: data.title,
          thumbnailSize: data.thumbnailSize,
        });

        if (res.success && res.image) {
          setCompletedResult(res.image);
          if (onUploadSuccess) onUploadSuccess(res.image);
          reset({ mode: "url", title: "", remoteUrl: "", thumbnailSize: data.thumbnailSize });
        } else {
          setError(res.error || "Failed to upload remote image.");
        }
      } else {
        // Mode: File Upload
        if (!data.imageFile || data.imageFile.length === 0) {
          setError("Please select an image file to upload");
          setIsUploading(false);
          return;
        }

        const file = data.imageFile[0];
        const formData = new FormData();
        formData.append("file", file);
        if (data.title) formData.append("title", data.title);
        formData.append("thumbnailSize", data.thumbnailSize);

        const res = await uploadImageFileAction(formData);

        if (res.success && res.image) {
          setCompletedResult(res.image);
          if (onUploadSuccess) onUploadSuccess(res.image);
          reset({ mode: "file", title: "", thumbnailSize: data.thumbnailSize });
        } else {
          setError(res.error || "Failed to upload image file.");
        }
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <div className="rounded-2xl border border-[#222] bg-[#121212] p-5 sm:p-7 shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-accent" />
            <span>ImageTwist Auto Uploader</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Upload images directly to ImageTwist to get permanent high-speed direct CDN links for your post thumbnails and galleries.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-[#181818] border border-[#222] max-w-xs">
          <label
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
              selectedMode === "file"
                ? "bg-accent text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <input
              type="radio"
              value="file"
              {...register("mode")}
              className="sr-only"
            />
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </label>

          <label
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
              selectedMode === "url"
                ? "bg-accent text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <input
              type="radio"
              value="url"
              {...register("mode")}
              className="sr-only"
            />
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Remote URL</span>
          </label>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {selectedMode === "file" ? (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-300">
                Select Image File (JPG, PNG, WebP, GIF)
              </label>
              <div className="relative border-2 border-dashed border-[#2a2a2a] hover:border-accent/50 rounded-2xl p-6 sm:p-8 text-center transition-colors bg-[#0f0f0f]">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  {...register("imageFile", {
                    required: selectedMode === "file" ? "Image file is required" : false,
                  })}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                <div className="space-y-2 pointer-events-none">
                  <div className="w-12 h-12 rounded-2xl bg-[#1c1c1c] border border-[#262626] flex items-center justify-center mx-auto text-zinc-400">
                    <ImageIcon className="w-6 h-6 text-accent" />
                  </div>
                  {selectedFiles && selectedFiles.length > 0 ? (
                    <div>
                      <p className="text-xs font-bold text-white truncate max-w-xs mx-auto">
                        {selectedFiles[0].name}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {(selectedFiles[0].size / 1024).toFixed(1)} KB &bull; Click to change
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">
                        Click to browse or drag &amp; drop an image here
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        Supports JPEG, PNG, WebP, GIF
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-300">
                Remote Image URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://example.com/images/photo.jpg"
                  {...register("remoteUrl", {
                    required: selectedMode === "url" ? "URL is required" : false,
                  })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#161616] border border-[#2a2a2a] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-accent"
                  disabled={isUploading}
                />
              </div>
              <p className="text-[11px] text-zinc-500">
                The image will be downloaded and transferred into your ImageTwist account.
              </p>
            </div>
          )}

          {/* Title and Thumbnail Size Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                Custom Title (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Model Sunset Photoshoot"
                {...register("title")}
                className="w-full px-4 py-2 rounded-xl bg-[#161616] border border-[#2a2a2a] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-accent"
                disabled={isUploading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                Generated Thumbnail Size
              </label>
              <select
                {...register("thumbnailSize")}
                className="w-full px-3 py-2 rounded-xl bg-[#161616] border border-[#2a2a2a] text-xs text-white focus:outline-none focus:border-accent"
                disabled={isUploading}
              >
                <option value="500x500">500x500 (Recommended for Site Thumbnails)</option>
                <option value="800x800">800x800 (Large HD Thumbnail)</option>
                <option value="300x300">300x300 (Medium Square)</option>
                <option value="170x170">170x170 (Small Compact)</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isUploading}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-md shadow-accent/20 disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading to ImageTwist...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Upload &amp; Generate Links</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Card with Links & Preview */}
      {completedResult && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-5 sm:p-6 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Image Uploaded Successfully!
                </h3>
                <p className="text-xs text-zinc-400">
                  Stored on ImageTwist &bull; Direct links generated and saved to DB
                </p>
              </div>
            </div>

            <button
              onClick={() => setCompletedResult(null)}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            {/* Image Preview */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-black/60 border border-[#2a2a2a] md:col-span-1">
              <Image
                src={completedResult.thumbnailUrl || completedResult.directUrl || completedResult.pageUrl}
                alt={completedResult.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Generated Links */}
            <div className="md:col-span-3 space-y-3 text-xs">
              {/* Direct Thumbnail Link */}
              <div className="space-y-1">
                <label className="font-semibold text-amber-400 flex items-center justify-between">
                  <span>Direct Thumbnail Link (Use for Post Thumbnail)</span>
                  <span className="text-[10px] text-zinc-500 font-normal">Direct image CDN</span>
                </label>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-[#161616] border border-[#262626]">
                  <span className="font-mono text-[11px] text-zinc-200 truncate flex-1">
                    {completedResult.thumbnailUrl}
                  </span>
                  <button
                    onClick={() => copyToClipboard(completedResult.thumbnailUrl, "res_thumb")}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-[11px] font-semibold transition-colors shrink-0"
                  >
                    {copiedKey === "res_thumb" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Thumbnail</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Direct Full Image Link */}
              <div className="space-y-1">
                <label className="font-semibold text-emerald-400 flex items-center justify-between">
                  <span>Direct Full Image Link (Use for Post Gallery Images)</span>
                  <span className="text-[10px] text-zinc-500 font-normal">Full Resolution CDN</span>
                </label>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-[#161616] border border-[#262626]">
                  <span className="font-mono text-[11px] text-zinc-200 truncate flex-1">
                    {completedResult.directUrl}
                  </span>
                  <button
                    onClick={() => copyToClipboard(completedResult.directUrl, "res_direct")}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[11px] font-semibold transition-colors shrink-0"
                  >
                    {copiedKey === "res_direct" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Image</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* ImageTwist Page URL */}
              <div className="flex items-center gap-3 pt-1">
                <a
                  href={completedResult.pageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View on ImageTwist ({completedResult.code})</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
