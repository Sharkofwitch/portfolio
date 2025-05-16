"use client";

import React from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SocialActions } from "@/components/SocialInteractions";
import { PhotoMetadata } from "@/lib/photo-types";
import PhotoPageErrorBoundary from "@/components/PhotoPageErrorBoundary";
import { usePhotoViewStats } from "@/lib/photo-view-stats";
import { formatImagePath } from "@/lib/utils";
import ZoomImage from "@/components/ZoomImage";

interface PhotoContentProps {
  photoId: string;
}

// This component gets params from the parent component before React.use() is called
const PhotoContent = ({ photoId }: PhotoContentProps) => {
  const [photo, setPhoto] = React.useState<PhotoMetadata | null>(null);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-32 h-32 bg-gray-300 dark:bg-gray-700 rounded-md mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-2.5"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (error || !photo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-4 max-w-md">
          <h1 className="text-2xl font-bold mb-2">Unable to load photo</h1>
          <p className="mb-4 text-gray-500">
            We couldn&apos;t load this photo. It may have been removed or there
            might be a temporary issue.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-black text-white rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <h1 className="text-3xl font-bold mb-4">{photo.title}</h1>

          <div className="mb-6 rounded-lg overflow-hidden shadow-lg">
            <ZoomImage src={photo.src} alt={photo.alt} />
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:items-start">
            <div className="flex-1">
              {photo.description && (
                <p className="text-lg mb-4">{photo.description}</p>
              )}

              <div className="space-y-2 mb-6">
                {photo.year && (
                  <p>
                    <span className="font-semibold">Year:</span> {photo.year}
                  </p>
                )}
                {photo.location && (
                  <p>
                    <span className="font-semibold">Location:</span>{" "}
                    {photo.location}
                  </p>
                )}
                {photo.camera && (
                  <p>
                    <span className="font-semibold">Camera:</span>{" "}
                    {photo.camera}
                  </p>
                )}
              </div>
            </div>

            <div className="md:w-64">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-3">Share & Interact</h3>
                <SocialActions photoId={photo.id} photoTitle={photo.title} />
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </>
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
