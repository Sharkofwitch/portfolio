"use client";

import React from "react";
import { notFound, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SocialActions } from "@/components/SocialInteractions";
import { PhotoMetadata } from "@/lib/photo-types";
import PhotoPageErrorBoundary from "@/components/PhotoPageErrorBoundary";
import { usePhotoViewStats } from "@/lib/photo-view-stats";
import { formatImagePath, getPhotoSlug } from "@/lib/utils";
import ZoomImage from "@/components/ZoomImage";
import ScrollProgress from "@/components/ScrollProgress";

interface PhotoContentProps {
  photoId: string;
}

// This component gets params from the parent component before React.use() is called
const PhotoContent = ({ photoId }: PhotoContentProps) => {
  const router = useRouter();
  const [photo, setPhoto] = React.useState<PhotoMetadata | null>(null);
  const [allPhotos, setAllPhotos] = React.useState<PhotoMetadata[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const { recordView } = usePhotoViewStats();

  // Keep track of view recording to avoid duplicate views
  const viewRecorded = React.useRef(false);

  React.useEffect(() => {
    async function loadPhoto() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/photos");
        const data = await res.json();

        if (!data.photos) {
          throw new Error("Invalid photo data received");
        }

        setAllPhotos(data.photos);

        const foundPhoto = data.photos.find(
          (p: PhotoMetadata) => p.id === photoId,
        );
        if (!foundPhoto) {
          notFound();
        }

        // Ensure the photo src path is properly formatted
        setPhoto({
          ...foundPhoto,
          src: formatImagePath(foundPhoto.src),
        });

        // Record view once we've loaded the photo successfully
        if (!viewRecorded.current && foundPhoto) {
          viewRecorded.current = true;
          // Small delay to ensure we don't impact initial render performance
          setTimeout(() => {
            try {
              // Check if we're in the browser environment before accessing document
              const referrer =
                typeof document !== "undefined"
                  ? document.referrer || "direct"
                  : "direct";
              recordView(foundPhoto.id, referrer);
            } catch (err) {
              console.error("Error recording view:", err);
            }
          }, 1500);
        }
      } catch (err) {
        console.error("Error loading photo:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to load photo"),
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadPhoto();

    // Cleanup function
    return () => {
      viewRecorded.current = false;
    };
  }, [photoId, recordView]);

  // Keyboard navigation between photos
  React.useEffect(() => {
    if (!photo || allPhotos.length === 0) return;

    const currentIdx = allPhotos.findIndex((p) => p.id === photo.id);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentIdx > 0) {
        const prev = allPhotos[currentIdx - 1];
        router.push(`/gallery/${getPhotoSlug(prev)}`);
      }
      if (e.key === "ArrowRight" && currentIdx < allPhotos.length - 1) {
        const next = allPhotos[currentIdx + 1];
        router.push(`/gallery/${getPhotoSlug(next)}`);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [photo, allPhotos, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-32 h-32 bg-gray-800 rounded-md"></div>
          <div className="h-4 bg-gray-800 rounded w-48"></div>
          <div className="h-3 bg-gray-800 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (error || !photo) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center p-4 max-w-md">
          <h1 className="text-2xl font-bold mb-2 text-white">
            Unable to load photo
          </h1>
          <p className="mb-4 text-gray-400">
            We couldn&apos;t load this photo. It may have been removed or there
            might be a temporary issue.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="apple-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentIdx = allPhotos.findIndex((p) => p.id === photo.id);
  const prevPhoto = currentIdx > 0 ? allPhotos[currentIdx - 1] : null;
  const nextPhoto =
    currentIdx < allPhotos.length - 1 ? allPhotos[currentIdx + 1] : null;

  return (
    <div className="min-h-screen bg-black text-white">
      <ScrollProgress />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Back button + navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => router.push("/gallery")}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-mono group"
          >
            <motion.svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ x: 0 }}
              whileHover={{ x: -3 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </motion.svg>
            <span>Back to Gallery</span>
          </button>

          {/* Prev / Next navigation */}
          <div className="flex items-center gap-2">
            {prevPhoto ? (
              <motion.button
                onClick={() =>
                  router.push(`/gallery/${getPhotoSlug(prevPhoto)}`)
                }
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                title="Previous photo (←)"
              >
                <svg
                  className="w-3 h-3"
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
                PREV
              </motion.button>
            ) : (
              <span className="px-3 py-1.5 text-xs font-mono text-white/20 border border-white/5 rounded-full">
                PREV
              </span>
            )}

            <span className="text-xs font-mono text-white/30">
              {currentIdx + 1} / {allPhotos.length}
            </span>

            {nextPhoto ? (
              <motion.button
                onClick={() =>
                  router.push(`/gallery/${getPhotoSlug(nextPhoto)}`)
                }
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                title="Next photo (→)"
              >
                NEXT
                <svg
                  className="w-3 h-3"
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
            ) : (
              <span className="px-3 py-1.5 text-xs font-mono text-white/20 border border-white/5 rounded-full">
                NEXT
              </span>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid md:grid-cols-3 gap-8"
        >
          {/* Image — takes up 2/3 on desktop */}
          <div className="md:col-span-2">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl md:text-3xl font-serif mb-4 text-white"
            >
              {photo.title}
            </motion.h1>

            <motion.div
              className="rounded-2xl overflow-hidden shadow-2xl"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <ZoomImage src={photo.src} alt={photo.alt || photo.title} />
            </motion.div>

            {/* Keyboard hint */}
            <p className="mt-3 text-center text-xs text-white/25 font-mono">
              ← → arrow keys to navigate between photos
            </p>
          </div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-6"
          >
            {photo.description && (
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5">
                <span className="font-mono text-xs text-white/40 uppercase tracking-wider block mb-2">
                  About
                </span>
                <p className="text-white/80 leading-relaxed font-light">
                  {photo.description}
                </p>
              </div>
            )}

            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <span className="font-mono text-xs text-white/40 uppercase tracking-wider block">
                Details
              </span>
              {photo.year && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 font-mono">Year</span>
                  <span className="text-white/80">{photo.year}</span>
                </div>
              )}
              {photo.location && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 font-mono">Location</span>
                  <span className="text-white/80 text-right max-w-[60%]">
                    {photo.location}
                  </span>
                </div>
              )}
              {photo.camera && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 font-mono">Camera</span>
                  <span className="text-white/80 text-right max-w-[60%]">
                    {photo.camera}
                  </span>
                </div>
              )}
            </div>

            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-mono text-xs text-white/40 uppercase tracking-wider mb-4">
                Share & Interact
              </h3>
              <SocialActions photoId={photo.id} photoTitle={photo.title} />
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

import { useParams } from "next/navigation";

// This is our main page component that properly handles params
export default function PhotoPage() {
  // Use the useParams hook to get the params client-side
  const params = useParams();
  const slug = Array.isArray(params.slug)
    ? params.slug[0]
    : (params.slug as string);
  const slugParts = slug.split("-");
  const photoId = slugParts[slugParts.length - 1];

  return (
    <PhotoPageErrorBoundary>
      <PhotoContent photoId={photoId} />
    </PhotoPageErrorBoundary>
  );
}
