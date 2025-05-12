"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import GalleryGrid from "@/components/GalleryGrid";
import { PhotoMetadata } from "@/lib/photo-types";
import Image from "next/image";

export default function GalleryPage() {
  const [photos, setPhotos] = useState<PhotoMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Parallax scrolling effect
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 400], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.1]);

  // Fetch photos
  useEffect(() => {
    async function fetchPhotos() {
      try {
        const response = await fetch("/api/photos");
        const data = await response.json();

        // Check if the response has a photos property (the expected format)
        const photosData = data.photos || data;

        console.log("Photos data received:", photosData);

        if (!Array.isArray(photosData)) {
          console.error("Received invalid data format:", photosData);
          setError("Invalid data format received from server");
          setLoading(false);
          return;
        }

        const sortedData = [...photosData].sort((a, b) => {
          const dateA = new Date(a.createdAt || Date.now());
          const dateB = new Date(b.createdAt || Date.now());
          return dateB.getTime() - dateA.getTime();
        });

        setPhotos(sortedData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching photos:", err);
        setError("Failed to load photos");
        setLoading(false);
      }
    }

    fetchPhotos();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero header with parallax effect */}
      <div ref={headerRef} className="relative h-[50vh] overflow-hidden">
        {photos.length > 0 && (
          <motion.div
            className="absolute inset-0 w-full h-full"
            style={{
              y: headerY,
              scale,
            }}
          >
            {photos[0]?.src ? (
              <Image
                src={
                  photos[0]?.src?.startsWith("/photos/")
                    ? `/api/photos/${photos[0].src.split("/").pop()}`
                    : photos[0]?.src?.startsWith("/api/photos/")
                      ? photos[0].src
                      : `/api/photos/${photos[0].src}`
                }
                alt="Gallery Header"
                fill
                className="object-cover"
                priority
                onError={() => {
                  console.error("Failed to load header image:", photos[0].src);
                }}
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
          </motion.div>
        )}

        <motion.div
          className="absolute inset-0 flex items-center justify-center text-center z-10"
          style={{ opacity }}
        >
          <div className="max-w-4xl px-4">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold mb-6 text-white font-serif"
            >
              Through Time&apos;s Lens
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto"
            >
              A journey through decades of photography, from film to digital,
              capturing moments that whisper stories of yesteryear
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* Floating info bar - Apple style */}
      <div className="sticky top-4 z-20 mx-auto max-w-4xl px-4 -mt-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="backdrop-blur-xl bg-black/70 rounded-xl px-6 py-4 flex items-center justify-between shadow-xl border border-white/10"
        >
          <div>
            <h2 className="text-lg font-medium text-white">Photo Collection</h2>
            <p className="text-sm text-gray-400">
              {loading ? "Loading gallery..." : `${photos.length} images`}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Gallery content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-7xl mx-auto px-4 py-12"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 border-4 border-gray-800 border-t-gray-300 rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Loading your gallery...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="p-6 backdrop-blur-xl bg-black/70 rounded-2xl border border-white/10">
              <p className="text-gray-300">{error}</p>
            </div>
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="p-6 backdrop-blur-xl bg-black/70 rounded-2xl border border-white/10">
              <p className="text-gray-300">No photos found in the gallery.</p>
            </div>
          </div>
        ) : (
          <GalleryGrid photos={photos} />
        )}
      </motion.div>
    </div>
  );
}
