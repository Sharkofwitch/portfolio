"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { PhotoMetadata } from "@/lib/photo-types";

interface PhotoLightboxProps {
  photos: PhotoMetadata[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

function getImageUrl(src: string): string {
  if (src.startsWith("/photos/")) {
    return `/api/photos/${src.split("/").pop()}`;
  } else if (src.startsWith("/api/photos/")) {
    return src;
  }
  const parts = src.split("/").filter(Boolean);
  const filename = parts.length > 0 ? parts[parts.length - 1] : src;
  return `/api/photos/${filename}`;
}

function getPhotoSlug(photo: PhotoMetadata): string {
  return `${photo.title?.toLowerCase().replace(/\s+/g, "-") || "photo"}-${photo.id}`;
}

export default function PhotoLightbox({
  photos,
  currentIndex,
  onClose,
  onNavigate,
}: PhotoLightboxProps) {
  const photo = photos[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  const handlePrev = useCallback(() => {
    if (hasPrev) onNavigate(currentIndex - 1);
  }, [hasPrev, currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (hasNext) onNavigate(currentIndex + 1);
  }, [hasNext, currentIndex, onNavigate]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKey);
    // Prevent body scroll while lightbox is open
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, handlePrev, handleNext]);

  if (!photo) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      >
        {/* Main content — stop click propagation so overlay-click closes only when clicking backdrop */}
        <motion.div
          className="relative flex flex-col md:flex-row w-full h-full max-w-7xl mx-auto"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Image area */}
          <div className="relative flex-1 flex items-center justify-center p-4 md:p-8 min-h-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                className="relative w-full h-full flex items-center justify-center"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="relative w-full h-full max-h-[80vh] md:max-h-[90vh]">
                  <Image
                    src={getImageUrl(photo.src)}
                    alt={photo.alt || photo.title || "Photo"}
                    fill
                    className="object-contain select-none"
                    sizes="(max-width: 768px) 100vw, 70vw"
                    priority
                    draggable={false}
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Prev / Next buttons */}
            {hasPrev && (
              <motion.button
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white hover:bg-black/80 transition-colors z-10"
                onClick={handlePrev}
                aria-label="Previous photo"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </motion.button>
            )}
            {hasNext && (
              <motion.button
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white hover:bg-black/80 transition-colors z-10"
                onClick={handleNext}
                aria-label="Next photo"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.button>
            )}

            {/* Photo counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-xs text-white/50 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
              {currentIndex + 1} / {photos.length}
            </div>
          </div>

          {/* Details panel */}
          <motion.div
            className="md:w-72 lg:w-80 bg-black/80 border-t md:border-t-0 md:border-l border-white/10 flex flex-col p-6 gap-4 overflow-y-auto max-h-[40vh] md:max-h-full"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <div className="space-y-1">
              <span className="font-mono text-xs text-white/40 uppercase tracking-wider">
                Photo
              </span>
              <h2 className="text-xl font-serif text-white leading-tight">
                {photo.title || "Untitled"}
              </h2>
            </div>

            {photo.description && (
              <p className="text-sm text-white/70 leading-relaxed font-light">
                {photo.description}
              </p>
            )}

            <div className="space-y-2 text-sm font-mono text-white/60">
              {photo.year && (
                <div className="flex items-center gap-2">
                  <span className="text-white/30">YEAR</span>
                  <span className="text-white/80">{photo.year}</span>
                </div>
              )}
              {photo.camera && (
                <div className="flex items-center gap-2">
                  <span className="text-white/30">CAMERA</span>
                  <span className="text-white/80">{photo.camera}</span>
                </div>
              )}
              {photo.location && (
                <div className="flex items-center gap-2">
                  <span className="text-white/30">LOCATION</span>
                  <span className="text-white/80">{photo.location}</span>
                </div>
              )}
            </div>

            <div className="mt-auto pt-4 flex flex-col gap-2">
              <Link
                href={`/gallery/${getPhotoSlug(photo)}`}
                className="apple-button text-center text-sm py-2.5"
                onClick={onClose}
              >
                View Full Details
              </Link>
              <button
                onClick={onClose}
                className="apple-button-secondary text-center text-sm py-2.5"
              >
                Close
              </button>
            </div>

            {/* Keyboard hint */}
            <p className="text-xs text-white/25 font-mono text-center">
              ← → to navigate · Esc to close
            </p>
          </motion.div>
        </motion.div>

        {/* Close button */}
        <motion.button
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white hover:bg-black/80 transition-colors z-20"
          onClick={onClose}
          aria-label="Close lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}
