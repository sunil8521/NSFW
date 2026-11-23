"use client";

import { useState } from "react";
import AutoImageUploadForm from "./AutoImageUploadForm";
import UploadedImagesTable from "./UploadedImagesTable";
import type { UploadedImageItem } from "@/lib/db";

export default function AutoImageUploadManager({
  initialImages,
}: {
  initialImages: UploadedImageItem[];
}) {
  const [images, setImages] = useState<UploadedImageItem[]>(initialImages);

  const handleUploadSuccess = (newImage: UploadedImageItem) => {
    setImages((prev) => [newImage, ...prev.filter((img) => img.id !== newImage.id)]);
  };

  const handleDeleted = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <div className="space-y-10">
      {/* 1. Upload Form */}
      <AutoImageUploadForm onUploadSuccess={handleUploadSuccess} />

      {/* 2. Table of Stored Uploaded Images with Copy Links & Delete */}
      <UploadedImagesTable
        key={images.length}
        initialImages={images}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
