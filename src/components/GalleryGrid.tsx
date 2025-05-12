"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { PhotoMetadata } from "@/lib/photo-types";

interface GalleryGridProps {
  photos: PhotoMetadata[];
}

export default function GalleryGrid({ photos }: GalleryGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMetadata | null>(
    null,
  );

  // When a photo is selected, prevent body scrolling
  useEffect(() => {
    if (selectedPhoto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedPhoto]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 relative">
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            index={index}
            onClick={() => setSelectedPhoto(photo)}
          />
        ))}
      </div>

      {/* Full-screen image modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <PhotoModal
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function PhotoCard({
  photo,
  index,
  onClick,
}: {
  photo: PhotoMetadata;
  index: number;
  onClick: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Validate the photo object has required properties
  useEffect(() => {
    if (!photo || !photo.src) {
      console.error("Invalid photo data:", photo);
      setError(true);
    }
  }, [photo]);

  // Subtle parallax effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: Math.min(index * 0.1, 1),
        duration: 0.6,
        ease: [0.43, 0.13, 0.23, 0.96],
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
      className="group relative aspect-[4/3] overflow-hidden rounded-2xl vintage-border hover-lift bg-gray-100 dark:bg-gray-900 cursor-pointer"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      style={{
        transform: `perspective(1000px) rotateX(${mousePosition.y * 3}deg) rotateY(${-mousePosition.x * 3}deg)`,
        transition: "transform 0.1s ease",
      }}
    >
      {/* Loading placeholder */}
      {isLoading && <div className="absolute inset-0 image-loading-pulse" />}

      {/* Error placeholder */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
          <svg
            className="w-12 h-12 text-gray-400"
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
        </div>
      )}

      {/* Image */}
      <div className="absolute inset-0 overflow-hidden">
        {photo.src && (
          <Image
            src={(() => {
              // Extract filename from photo src path
              let imageSrc = "";
              if (photo.src.startsWith("/photos/")) {
                // For paths like /photos/image.jpg
                imageSrc = `/api/photos/${photo.src.split("/").pop()}`;
                console.log(`Converting ${photo.src} to ${imageSrc}`);
              } else if (photo.src.startsWith("/api/photos/")) {
                // Already in the right format
                imageSrc = photo.src;
              } else {
                // For other formats, try to extract filename or use as is
                const parts = photo.src.split("/").filter(Boolean);
                const filename =
                  parts.length > 0 ? parts[parts.length - 1] : photo.src;
                imageSrc = `/api/photos/${filename}`;
                console.log(
                  `Using extracted filename ${filename} from ${photo.src}`,
                );
              }
              return imageSrc;
            })()}
            alt={photo.alt || "Gallery image"}
            fill
            className={`object-cover transition-all duration-500 group-hover:scale-105 vintage-filter ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={index < 6}
            onLoadingComplete={() => setIsLoading(false)}
            onError={(e) => {
              console.error("Error loading image:", photo.src, e);
              setIsLoading(false);
              setError(true);
            }}
            style={{
              transform: `scale(1.1) translateX(${mousePosition.x * -10}px) translateY(${mousePosition.y * -10}px)`,
            }}
          />
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
        <motion.div
          className="absolute bottom-4 left-4 right-4 text-white"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-serif mb-2 text-shadow leading-tight">
            {photo.title}
          </h3>
          <div className="space-y-1 text-sm opacity-90">
            {photo.year && (
              <p className="font-mono text-shadow text-xs">{photo.year}</p>
            )}
            {photo.camera && (
              <p className="text-gray-200 text-shadow text-xs">
                {photo.camera}
              </p>
            )}
            {photo.location && (
              <p className="text-gray-200 text-shadow text-xs">
                {photo.location}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function PhotoModal({
  photo,
  onClose,
}: {
  photo: PhotoMetadata;
  onClose: () => void;
}) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Handle zooming
  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!imageRef.current) return;

    if (isZoomed) {
      setIsZoomed(false);
    } else {
      const rect = imageRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPosition({ x, y });
      setIsZoomed(true);
    }
  };

  // Handle mouse move for zoomed view
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isZoomed || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  // Handle background click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 backdrop-blur-md bg-black/90"
      />

      {/* Modal Content */}
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="relative z-10 w-full max-w-5xl p-2 sm:p-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/80 backdrop-blur-sm text-white hover:bg-black/95 transition-colors duration-200 border border-white/20"
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
        </button>

        {/* Image container */}
        <div
          ref={imageRef}
          className={`relative w-full aspect-auto overflow-hidden bg-gray-900 rounded-xl shadow-lg border border-white/10 ${
            isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
          }`}
          onClick={handleImageClick}
          onMouseMove={handleMouseMove}
        >
          <div className="relative w-full h-[70vh] overflow-hidden">
            <Image
              src={
                photo.src.startsWith("/photos/")
                  ? photo.src.replace("/photos/", "/api/photos/")
                  : photo.src
              }
              alt={photo.alt}
              fill
              className={`
                object-contain transition-all duration-300 vintage-filter
                ${isZoomed ? "scale-150" : "scale-100"}
              `}
              sizes="(max-width: 1400px) 100vw, 1400px"
              priority
              style={
                isZoomed
                  ? {
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }
                  : {}
              }
            />
          </div>
        </div>

        {/* Photo info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-white flex items-start justify-between p-2"
        >
          <div>
            <h3 className="text-2xl font-serif">{photo.title}</h3>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-white">
              {photo.year && (
                <span className="rounded-full px-3 py-1 bg-white/10 backdrop-blur-md">
                  {photo.year}
                </span>
              )}
              {photo.location && (
                <span className="rounded-full px-3 py-1 bg-white/10 backdrop-blur-md">
                  {photo.location}
                </span>
              )}
              {photo.camera && (
                <span className="rounded-full px-3 py-1 bg-white/10 backdrop-blur-md">
                  {photo.camera}
                </span>
              )}
            </div>
            {photo.description && (
              <p className="mt-3 text-white/90 max-w-2xl">
                {photo.description}
              </p>
            )}
          </div>

          <div className="text-xs text-white/70 flex items-center gap-1">
            <span className="font-mono bg-white/10 rounded px-2 py-1 backdrop-blur-md">
              {photo.width} × {photo.height}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
