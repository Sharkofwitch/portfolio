"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PhotoMetadata } from "@/lib/photo-types";
import { formatImagePath } from "@/lib/utils";

interface FilmStripProps {
  currentPhotoId: string;
}

/**
 * FilmStrip – a cinematic, horizontally-scrolling contact-sheet navigator
 * shown at the bottom of photo detail pages. Displays all gallery photos
 * as small thumbnails; clicking a thumbnail navigates to that photo.
 * Arrow-key navigation is also supported.
 */
export default function FilmStrip({ currentPhotoId }: FilmStripProps) {
  const [photos, setPhotos] = useState<PhotoMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const stripRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/photos")
      .then((r) => r.json())
      .then((data) => {
        const list: PhotoMetadata[] = Array.isArray(data)
          ? data
          : (data.photos ?? []);
        setPhotos(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Scroll the active thumbnail into view
  useEffect(() => {
    if (!stripRef.current || photos.length === 0) return;
    const idx = photos.findIndex((p) => p.id === currentPhotoId);
    if (idx < 0) return;
    const el = stripRef.current.children[idx] as HTMLElement | undefined;
    el?.scrollIntoView({
      block: "nearest",
      inline: "center",
      behavior: "smooth",
    });
  }, [photos, currentPhotoId]);

  const navigateTo = useCallback(
    (photo: PhotoMetadata) => {
      const slug = `${photo.title?.toLowerCase().replace(/\s+/g, "-") || "photo"}-${photo.id}`;
      router.push(`/gallery/${slug}`);
    },
    [router],
  );

  // Arrow-key navigation
  useEffect(() => {
    if (photos.length === 0) return;
    const handleKey = (e: KeyboardEvent) => {
      const idx = photos.findIndex((p) => p.id === currentPhotoId);
      if (idx < 0) return;
      if (e.key === "ArrowRight" && idx < photos.length - 1) {
        navigateTo(photos[idx + 1]);
      } else if (e.key === "ArrowLeft" && idx > 0) {
        navigateTo(photos[idx - 1]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [photos, currentPhotoId, navigateTo]);

  if (loading || photos.length === 0) return null;

  const currentIdx = photos.findIndex((p) => p.id === currentPhotoId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-12 mb-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3 px-1">
        <div className="flex gap-0.5 items-center">
          {/* film sprocket holes decoration */}
          {[...Array(4)].map((_, i) => (
            <span
              key={i}
              className="block w-2 h-3 rounded-sm border border-white/20 bg-white/5"
            />
          ))}
        </div>
        <span className="font-mono text-xs text-white/40 uppercase tracking-widest">
          Contact Sheet
        </span>
        <span className="font-mono text-xs text-white/30 ml-auto">
          {currentIdx + 1} / {photos.length}
        </span>
        <div className="flex gap-0.5 items-center">
          {[...Array(4)].map((_, i) => (
            <span
              key={i}
              className="block w-2 h-3 rounded-sm border border-white/20 bg-white/5"
            />
          ))}
        </div>
      </div>

      {/* Film strip scroll area */}
      <div className="relative">
        {/* Left / right gradient fade */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black to-transparent z-10" />

        <div
          ref={stripRef}
          className="flex gap-1.5 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pb-2 px-4"
          style={{ scrollbarWidth: "thin" }}
        >
          {photos.map((photo, i) => {
            const isActive = photo.id === currentPhotoId;
            const imgSrc = formatImagePath(photo.src);

            return (
              <motion.button
                key={photo.id}
                onClick={() => !isActive && navigateTo(photo)}
                whileHover={{ scale: isActive ? 1 : 1.06 }}
                whileTap={{ scale: 0.96 }}
                className={`relative flex-shrink-0 rounded overflow-hidden transition-all duration-200 ${
                  isActive
                    ? "ring-2 ring-white ring-offset-1 ring-offset-black opacity-100 cursor-default"
                    : "opacity-50 hover:opacity-80"
                }`}
                style={{ width: 64, height: 80 }}
                title={photo.title}
                aria-label={`View: ${photo.title}`}
                aria-current={isActive ? "page" : undefined}
              >
                <Image
                  src={imgSrc}
                  alt={photo.alt || photo.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
                {/* Frame number */}
                <span className="absolute bottom-0.5 right-1 font-mono text-[8px] text-white/40 leading-none">
                  {i + 1}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Keyboard hint */}
      <p className="text-center font-mono text-[10px] text-white/20 mt-2">
        ← → arrow keys to navigate
      </p>
    </motion.div>
  );
}
