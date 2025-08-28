"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { PhotoMetadata } from "@/lib/photo-types";
import { useRouter } from "next/navigation";

interface GalleryGridProps {
  photos: PhotoMetadata[];
}

export default function GalleryGrid({ photos }: GalleryGridProps) {
  const router = useRouter();
  const [visiblePhotos, setVisiblePhotos] = useState<PhotoMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
              onClick={(e) => handleNavigateToPhotoPage(e, photo)}
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
    </>
  );
}

import { Variants } from "framer-motion";

interface PhotoCardProps {
  photo: PhotoMetadata;
  onClick: (e: React.MouseEvent) => void;
  variants?: Variants;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick, variants }) => {
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

          <div className="flex justify-end">
            <motion.button
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 0.25)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={onClick}
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
