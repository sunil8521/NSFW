"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Tag,
  Film,
  Image as ImageIcon,
  Calendar,
  User,
  ArrowLeft,
  Check,
  AlertCircle,
  ExternalLink,
  UploadCloud,
  Sparkles,
} from "lucide-react";
import { createPostAction, updatePostAction, type AdminPostInput } from "@/actions/admin";
import { uploadImageFileAction } from "@/actions/image-upload";
import type { Post } from "@/types/post";

const CATEGORIES = [
  { slug: "desi", name: "Desi" },
  { slug: "babe", name: "Babe" },
  { slug: "couple", name: "Couple" },
  { slug: "solo", name: "Solo" },
  { slug: "webcam", name: "Webcam" },
  { slug: "amateur", name: "Amateur" },
  { slug: "milf", name: "MILF" },
  { slug: "asian", name: "Asian" },
  { slug: "big-boobs", name: "Big Boobs" },
];

const VIDEO_PROVIDERS = [
  "streamtape",
  "vidara",
  "hls",
  "direct",
  "watchadsontape",
  "luluvdo",
  "mixdrop",
  "doodstream",
];

interface PostFormProps {
  initialData?: Post;
  adminName: string;
  isEdit?: boolean;
}

export default function PostForm({
  initialData,
  adminName,
  isEdit = false,
}: PostFormProps) {
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState(initialData?.category || "desi");
  const [description, setDescription] = useState(initialData?.description || "");
  
  // Tags (Strict Max 7)
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [tagError, setTagError] = useState<string | null>(null);

  // Dynamic Image Links
  const [imageLinks, setImageLinks] = useState<string[]>(
    initialData?.images && initialData.images.length > 0
      ? initialData.images
      : [""]
  );

  // Dynamic Video Links
  const [videoLinks, setVideoLinks] = useState<
    { label: string; url: string; provider: string }[]
  >(
    initialData?.videoLinks && initialData.videoLinks.length > 0
      ? initialData.videoLinks
      : [{ label: "Server 1", url: "", provider: "streamtape" }]
  );

  // Defaults
  const [uploader, setUploader] = useState(initialData?.uploader || adminName);
  const [uploadDate] = useState(
    initialData?.uploadDate || new Date().toISOString()
  );

  // Form submission state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Direct ImageTwist upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");

  const handleUploadImageTwistFiles = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setUploadProgressText(
      `Uploading ${files.length} image${files.length > 1 ? "s" : ""} to ImageTwist...`
    );

    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgressText(`Uploading ${i + 1}/${files.length}: ${file.name}...`);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title || file.name);
        formData.append("thumbnailSize", "500x500");

        const res = await uploadImageFileAction(formData);
        if (res.success && res.image) {
          // Use direct URL (or thumbnailUrl)
          const targetUrl =
            res.image.directUrl || res.image.thumbnailUrl || res.image.pageUrl;
          newUrls.push(targetUrl);
        } else {
          setError(res.error || `Failed to upload ${file.name}`);
        }
      } catch (err: any) {
        setError(err?.message || `Failed to upload ${file.name}`);
      }
    }

    if (newUrls.length > 0) {
      setImageLinks((prev) => {
        const cleaned = prev.filter((u) => u.trim().length > 0);
        return cleaned.length === 0 ? newUrls : [...cleaned, ...newUrls];
      });
    }

    setUploadingImage(false);
    setUploadProgressText("");
    e.target.value = "";
  };

  // Tag Handlers
  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/^[#\s]+/, "");
    if (!trimmed) return;

    if (tags.length >= 7) {
      setTagError("Maximum 7 tags allowed!");
      return;
    }

    if (tags.includes(trimmed)) {
      setTagError("Tag already added");
      return;
    }

    setTags([...tags, trimmed]);
    setTagInput("");
    setTagError(null);
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
    setTagError(null);
  };

  // Image Link Handlers (Dynamic with + button)
  const handleAddImageLink = () => {
    setImageLinks([...imageLinks, ""]);
  };

  const handleUpdateImageLink = (index: number, value: string) => {
    const updated = [...imageLinks];
    updated[index] = value;
    setImageLinks(updated);
  };

  const handleRemoveImageLink = (index: number) => {
    if (imageLinks.length <= 1) return;
    setImageLinks(imageLinks.filter((_, i) => i !== index));
  };

  // Video Link Handlers (Dynamic with + button)
  const handleAddVideoLink = () => {
    setVideoLinks([
      ...videoLinks,
      {
        label: `Server ${videoLinks.length + 1}`,
        url: "",
        provider: "streamtape",
      },
    ]);
  };

  const handleUpdateVideoLink = (
    index: number,
    field: "label" | "url" | "provider",
    value: string
  ) => {
    const updated = [...videoLinks];
    updated[index] = { ...updated[index], [field]: value };
    setVideoLinks(updated);
  };

  const handleRemoveVideoLink = (index: number) => {
    setVideoLinks(videoLinks.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }

    const filteredImages = imageLinks.map((s) => s.trim()).filter(Boolean);
    if (filteredImages.length === 0) {
      setError("Please provide at least one valid image URL");
      return;
    }

    if (tags.length > 7) {
      setError("A maximum of 7 tags is permitted");
      return;
    }

    setLoading(true);

    try {
      const payload: AdminPostInput = {
        title,
        category,
        tags,
        imageLinks: filteredImages,
        videoLinks: videoLinks.filter((v) => v.url.trim().length > 0),
        description,
        uploader,
        uploadDate,
      };

      if (isEdit && initialData) {
        await updatePostAction(initialData.id, payload);
      } else {
        await createPostAction(payload);
      }

      router.push("/admin/posts");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Something went wrong while saving the post");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/posts")}
            className="p-2 rounded-lg bg-[#141414] hover:bg-[#1f1f1f] border border-[#282828] text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white font-display">
              {isEdit ? "Edit Post" : "Upload New Post"}
            </h1>
            <p className="text-xs text-zinc-400">
              Paste external image and streaming video URLs to publish.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/posts")}
            className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-[#141414] border border-[#282828] rounded-xl hover:bg-[#1c1c1c] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-accent hover:bg-accent-hover rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>{isEdit ? "Update Post" : "Publish Post"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Details & Links */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Basic Details */}
          <div className="p-5 rounded-2xl bg-[#121212] border border-[#222] space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-display">
              Post Details
            </h2>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Title <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Gorgeous Desi Model Vacation Photoshoot"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2b2b2b] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Category <span className="text-accent">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2b2b2b] text-sm text-white focus:outline-none focus:border-accent transition-colors capitalize"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Brief description or model details..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#2b2b2b] text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-accent transition-colors resize-none"
              />
            </div>
          </div>

          {/* 2. Dynamic Image Links & ImageTwist Upload */}
          <div className="p-5 rounded-2xl bg-[#121212] border border-[#222] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-display">
                  Post Images &amp; Thumbnail
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {/* Direct ImageTwist File Uploader */}
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-accent hover:bg-accent-hover transition-colors cursor-pointer shadow-sm">
                  {uploadingImage ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload to ImageTwist</span>
                    </>
                  )}
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleUploadImageTwistFiles}
                    disabled={uploadingImage}
                    className="sr-only"
                  />
                </label>

                {/* Paste URL Button */}
                <button
                  type="button"
                  onClick={handleAddImageLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Paste URL</span>
                </button>
              </div>
            </div>

            {/* Active upload status */}
            {uploadProgressText && (
              <div className="p-3 rounded-xl bg-accent/10 border border-accent/25 text-accent text-xs flex items-center gap-2.5 animate-pulse">
                <UploadCloud className="w-4 h-4 shrink-0" />
                <span className="font-medium">{uploadProgressText}</span>
              </div>
            )}

            <p className="text-xs text-zinc-400">
              The first image link automatically becomes the main post thumbnail in the database.
            </p>

            <div className="space-y-3">
              {imageLinks.map((link, index) => (
                <div key={index} className="space-y-2 p-3 rounded-xl bg-[#171717] border border-[#272727]">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#202020] text-zinc-400">
                      {index === 0 ? "Thumbnail (1)" : `Image ${index + 1}`}
                    </span>
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => handleUpdateImageLink(index, e.target.value)}
                      placeholder="https://example-image-host.com/photo.jpg"
                      className="flex-1 px-3 py-1.5 rounded-lg bg-[#121212] border border-[#2b2b2b] text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-400"
                    />
                    {imageLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImageLink(index)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Remove link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Thumbnail quick preview */}
                  {link && link.startsWith("http") && (
                    <div className="flex items-center gap-3 pt-1">
                      <div className="relative w-16 h-12 rounded overflow-hidden bg-black/40 border border-[#333]">
                        <Image
                          src={link}
                          alt={`Preview ${index + 1}`}
                          fill
                          unoptimized
                          referrerPolicy="no-referrer"
                          className="object-cover"
                        />
                      </div>
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Preview in new tab</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. Dynamic Video Streaming Links */}
          <div className="p-5 rounded-2xl bg-[#121212] border border-[#222] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-display">
                  Video Streaming Links
                </h2>
              </div>
              <button
                type="button"
                onClick={handleAddVideoLink}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Video Stream</span>
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Add stream/embed links (StreamTape, WatchAdsOnTape, etc.).
            </p>

            <div className="space-y-3">
              {videoLinks.map((video, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-xl bg-[#171717] border border-[#272727] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300">
                      Stream Option #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveVideoLink(index)}
                      className="text-xs text-zinc-500 hover:text-rose-400 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-400 font-medium">Provider</label>
                      <select
                        value={video.provider}
                        onChange={(e) =>
                          handleUpdateVideoLink(index, "provider", e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#121212] border border-[#2b2b2b] text-xs text-white capitalize focus:outline-none focus:border-emerald-400"
                      >
                        {VIDEO_PROVIDERS.map((prov) => (
                          <option key={prov} value={prov}>
                            {prov}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-400 font-medium">Label</label>
                      <input
                        type="text"
                        value={video.label}
                        onChange={(e) =>
                          handleUpdateVideoLink(index, "label", e.target.value)
                        }
                        placeholder="e.g. Server 1 (HD)"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#121212] border border-[#2b2b2b] text-xs text-white focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div className="sm:col-span-1 space-y-1">
                      <label className="text-[11px] text-zinc-400 font-medium">URL</label>
                      <input
                        type="url"
                        value={video.url}
                        onChange={(e) =>
                          handleUpdateVideoLink(index, "url", e.target.value)
                        }
                        placeholder="https://streamtape.com/e/..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#121212] border border-[#2b2b2b] text-xs text-white focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Tags & Metadata */}
        <div className="space-y-6">
          {/* Tags Section (Max 7 Tags Enforced) */}
          <div className="p-5 rounded-2xl bg-[#121212] border border-[#222] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-display">
                  Tags
                </h2>
              </div>
              <span
                className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                  tags.length >= 7
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : "bg-[#1f1f1f] text-zinc-400"
                }`}
              >
                {tags.length}/7 max
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              Add keywords (strictly maximum 7 tags). Press Enter or click Add.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tagInput}
                disabled={tags.length >= 7}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  if (tagError) setTagError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder={tags.length >= 7 ? "Max 7 reached" : "Type a tag..."}
                className="flex-1 px-3 py-2 rounded-xl bg-[#181818] border border-[#2b2b2b] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-accent disabled:opacity-40"
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={tags.length >= 7 || !tagInput.trim()}
                className="px-3 py-2 bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 text-xs font-semibold rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
              >
                + Add
              </button>
            </div>

            {tagError && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{tagError}</span>
              </p>
            )}

            {/* Tag Chips List */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#1e1e1e] text-zinc-300 border border-[#303030]"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    className="text-zinc-500 hover:text-rose-400 transition-colors ml-0.5"
                    title="Remove tag"
                  >
                    &times;
                  </button>
                </span>
              ))}
              {tags.length === 0 && (
                <span className="text-xs text-zinc-500 italic">No tags added yet.</span>
              )}
            </div>
          </div>

          {/* Publishing Info & Default Metadata */}
          <div className="p-5 rounded-2xl bg-[#121212] border border-[#222] space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-display">
              Publishing Details
            </h2>

            <div className="space-y-3 text-xs">
              {/* Uploader (Default from admin session) */}
              <div className="space-y-1">
                <label className="text-zinc-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Uploader Name (Default)</span>
                </label>
                <input
                  type="text"
                  value={uploader}
                  onChange={(e) => setUploader(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181818] border border-[#2b2b2b] text-white focus:outline-none focus:border-accent"
                />
              </div>

              {/* Upload Date (Default to current timestamp) */}
              <div className="space-y-1">
                <label className="text-zinc-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Upload Date (Default)</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={new Date(uploadDate).toLocaleString()}
                  className="w-full px-3 py-2 rounded-xl bg-[#181818] border border-[#2b2b2b] text-zinc-400 cursor-not-allowed font-mono text-[11px]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#171717] border border-[#262626] text-[11px] text-zinc-400 space-y-1">
                <p className="font-semibold text-zinc-300">Security Note:</p>
                <p>
                  Only authorized admin accounts (<span className="text-accent font-mono">u: 1</span>) can publish or edit content.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
