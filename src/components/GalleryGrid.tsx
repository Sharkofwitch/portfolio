"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { PhotoMetadata } from "@/lib/photo-types";
import { useRouter } from "next/navigation";
import { SocialActions } from "@/components/SocialInteractions";

interface GalleryGridProps {
  photos: PhotoMetadata[];
}

export default function GalleryGrid({ photos }: GalleryGridProps) {
  const router = useRouter();
  const [visiblePhotos, setVisiblePhotos] = useState<PhotoMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMetadata | null>(
    null,
  );

  // Lazy load photos for better performance
  useEffect(() => {
    setIsLoading(true);

    // Load first batch immediately
    const initialBatch = photos.slice(0, 8);
    setVisiblePhotos(initialBatch);

    // Load the rest with a small delay for better initial load performance
    const timer = setTimeout(() => {
      setVisiblePhotos(photos);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [photos]);

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

  // Function to navigate to individual photo page
  const handleNavigateToPhotoPage = (
    e: React.MouseEvent,
    photo: PhotoMetadata,
  ) => {
    e.stopPropagation(); // Prevent modal from opening
    const slug = `${photo.title?.toLowerCase().replace(/\s+/g, "-") || "photo"}-${
      photo.id
    }`;
    router.push(`/gallery/${slug}`);
  };

  // Container variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  // Item variants for staggered animations
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      rotateX: 5,
      scale: 0.95,
    },
    show: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        mass: 0.5,
      },
    },
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {isLoading && photos.length > 0 && (
          <div className="flex justify-center mb-8">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-gray-500 dark:text-gray-400"
            >
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </motion.div>
          </div>
        )}

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-4 sm:px-6 md:px-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{
            perspective: "1000px",
            perspectiveOrigin: "center",
          }}
        >
          {visiblePhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onClick={() => setSelectedPhoto(photo)}
              onNavigate={(e) => handleNavigateToPhotoPage(e, photo)}
              variants={itemVariants}
            />
          ))}
        </motion.div>

        {visiblePhotos.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No photos found.</p>
          </div>
        )}
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

import { Variants } from "framer-motion";

interface PhotoCardProps {
  photo: PhotoMetadata;
  onClick: () => void;
  onNavigate: (e: React.MouseEvent) => void;
  variants?: Variants;
}

const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  onClick,
  onNavigate,
  variants,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Format the image URL
  const getImageUrl = () => {
    if (photo.src.startsWith("/photos/")) {
      return `/api/photos/${photo.src.split("/").pop()}`;
    } else if (photo.src.startsWith("/api/photos/")) {
      return photo.src;
    } else {
      const parts = photo.src.split("/").filter(Boolean);
      const filename = parts.length > 0 ? parts[parts.length - 1] : photo.src;
      return `/api/photos/${filename}`;
    }
  };

  return (
    <motion.div
      variants={variants}
      className="relative rounded-2xl overflow-hidden aspect-square shadow-lg hover:shadow-2xl transition-all duration-500"
      style={{
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{
        scale: 1.03,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      whileTap={{ scale: 0.97 }}
    >
      <div className="relative w-full h-full">
        {/* Image placeholder before loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-gray-400 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        <Image
          src={getImageUrl()}
          alt={photo.alt || photo.title || "Photography"}
          fill
          className={`object-cover transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoadingComplete={() => setImageLoaded(true)}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Overlay with info and actions */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-between p-6 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <h3
              className="text-xl font-medium tracking-tight truncate"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              {photo.title}
            </h3>
            {photo.description && (
              <p
                className="text-sm leading-relaxed line-clamp-2 text-white/90 mt-2"
                style={{
                  fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                {photo.description}
              </p>
            )}
          </div>

          <div className="flex justify-between items-end">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <SocialActions
                photoId={photo.id}
                photoTitle={photo.title || "Photo"}
                size={22}
                className="text-white opacity-90 hover:opacity-100"
              />
            </motion.div>

            <motion.button
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 0.25)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={onNavigate}
              className="bg-white/15 backdrop-blur-md text-white py-2.5 px-4 rounded-full 
                         transition-all duration-300 text-sm font-medium tracking-wide
                         border border-white/10 shadow-lg"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              View Photo
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

function PhotoModal({
  photo,
  onClose,
}: {
  photo: PhotoMetadata;
  onClose: () => void;
}) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const imageRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
      className="fixed inset-0 z-50 flex items-center justify-center safe-top safe-bottom"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 backdrop-blur-md bg-black/95"
      />

      {/* Modal Content */}
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="relative z-10 w-full max-w-5xl p-2 sm:p-4 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/80 backdrop-blur-sm text-white hover:bg-black/95 transition-colors duration-200 border border-white/20 touch-manipulation no-tap-highlight"
          aria-label="Close image viewer"
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
          className={`relative w-full aspect-auto overflow-hidden bg-gray-900 rounded-lg sm:rounded-xl shadow-lg border border-white/10 ${
            isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
          } touch-manipulation`}
          onClick={handleImageClick}
          onMouseMove={handleMouseMove}
        >
          {/* Loading indicator */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center z-10"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 relative">
                    <motion.span
                      className="block absolute w-full h-full rounded-full"
                      style={{
                        border: "3px solid rgba(255,255,255,0.2)",
                        borderTopColor: "white",
                      }}
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1.5,
                        ease: "linear",
                        repeat: Infinity,
                      }}
                    />
                  </div>
                  <p className="text-white/70 text-sm mt-3">Loading image...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative w-full h-[60vh] sm:h-[70vh] overflow-hidden">
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
              onLoadingComplete={() => setIsLoading(false)}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }
                  : {}
              }
            />

            {/* Zoom indicator */}
            <motion.div
              className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 text-xs text-white font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: isZoomed ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isZoomed ? "150%" : "100%"}
            </motion.div>
          </div>
        </div>

        {/* Photo info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-white flex flex-col md:flex-row md:items-start md:justify-between p-2 safe-bottom"
        >
          <div className="mb-3 md:mb-0">
            <h3 className="text-xl sm:text-2xl font-serif">{photo.title}</h3>
            <div className="flex flex-wrap gap-2 md:gap-3 mt-2 text-xs sm:text-sm text-white">
              {photo.year && (
                <span className="rounded-full px-2 sm:px-3 py-1 bg-white/10 backdrop-blur-md">
                  {photo.year}
                </span>
              )}
              {photo.location && (
                <span className="rounded-full px-2 sm:px-3 py-1 bg-white/10 backdrop-blur-md">
                  {photo.location}
                </span>
              )}
              {photo.camera && (
                <span className="rounded-full px-2 sm:px-3 py-1 bg-white/10 backdrop-blur-md">
                  {photo.camera}
                </span>
              )}
            </div>
            {photo.description && (
              <p className="mt-2 sm:mt-3 text-sm sm:text-base text-white/90 max-w-2xl line-clamp-3 sm:line-clamp-none">
                {photo.description}
              </p>
            )}

            {/* Social actions and permalink button */}
            <div className="mt-4 flex flex-col space-y-3">
              <button
                onClick={() => {
                  const slug = `${
                    photo.title?.toLowerCase().replace(/\s+/g, "-") || "photo"
                  }-${photo.id}`;
                  router.push(`/gallery/${slug}`);
                }}
                className="bg-white/20 backdrop-blur-sm text-white py-2 px-4 rounded-md hover:bg-white/30 transition-all duration-300 text-sm font-medium flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101"
                  />
                </svg>
                View Full Page
              </button>

              <SocialActions
                photoId={photo.id || ""}
                photoTitle={photo.title || "Untitled"}
                className="text-white"
                size={28}
              />
            </div>
          </div>

          <div className="text-xs text-white/70 flex items-center gap-1 self-start md:self-auto">
            <span className="font-mono bg-white/10 rounded px-2 py-1 backdrop-blur-md">
              {photo.width} × {photo.height}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
