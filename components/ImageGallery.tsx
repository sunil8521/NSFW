"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

export default function ImageGallery({ images }: { images: string[] }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const goNext = () =>
    setActiveIndex((prev) => (prev + 1) % images.length);
  const goPrev = () =>
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => openLightbox(i)}
            className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-[#181818] border border-[#262626] cursor-pointer"
            aria-label={`View photo ${i + 1}`}
          >
            <Image
              src={src}
              alt={`Photo ${i + 1}`}
              fill
              referrerPolicy="no-referrer"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-20 cursor-pointer"
            aria-label="Close lightbox"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 text-xs sm:text-sm text-white/80 font-mono z-20 bg-black/60 px-3 py-1 rounded-full border border-white/10">
            {activeIndex + 1} / {images.length}
          </div>

          {/* Prev */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/60 text-white hover:bg-black/90 border border-white/10 transition-colors z-20 cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Image */}
          <div
            className="relative max-w-[92vw] max-h-[85vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[activeIndex]}
              alt={`Photo ${activeIndex + 1}`}
              fill
              referrerPolicy="no-referrer"
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>

          {/* Next */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/60 text-white hover:bg-black/90 border border-white/10 transition-colors z-20 cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </>
  );
}
