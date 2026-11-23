"use client";

import { useState } from "react";
import AutoUploadForm from "./AutoUploadForm";
import UploadedVideosTable from "./UploadedVideosTable";
import type { UploadedVideoItem } from "@/lib/db";

export default function AutoUploadManager({
  initialVideos,
}: {
  initialVideos: UploadedVideoItem[];
}) {
  const [videos, setVideos] = useState<UploadedVideoItem[]>(initialVideos);

  const handleUploadSuccess = (newVideo: UploadedVideoItem) => {
    setVideos((prev) => [newVideo, ...prev.filter((v) => v.id !== newVideo.id)]);
  };

  const handleDeleted = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <div className="space-y-10">
      {/* 1. Upload Form with SSE Progress Bar & react-hook-form */}
      <AutoUploadForm onUploadSuccess={handleUploadSuccess} />

      {/* 2. Table of Stored Uploaded Videos with Copy Links & Delete */}
      <UploadedVideosTable
        key={videos.length}
        initialVideos={videos}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
