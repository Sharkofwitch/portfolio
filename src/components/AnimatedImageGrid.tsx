'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

interface AnimatedImageGridProps {
  images: {
    src: string;
    alt: string;
    caption?: string;
    aspectRatio?: string; // e.g. "1/1", "4/3", "16/9"
  }[];
  columns?: number;
  hoverEffect?: "zoom" | "lift" | "tilt" | "fade" | "none";
  gap?: number; // in pixels
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  enableParallax?: boolean;
  gridLayout?: "uniform" | "masonry";
  className?: string;
}

export default function AnimatedImageGrid({
  images,
  columns = 3,
  hoverEffect = "zoom",
  gap = 16,
  rounded = "lg",
  enableParallax = false,
  gridLayout = "uniform",
  className = "",
}: AnimatedImageGridProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Define animations for grid container
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  // Define animations for grid items
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Helper to get appropriate hover effect classes
  const getHoverEffectClasses = (effect: string) => {
    switch (effect) {
      case "zoom":
        return "group-hover:scale-105 transition-transform duration-500 ease-out";
      case "lift":
        return "";
      case "tilt":
        return "";
      case "fade":
        return "group-hover:opacity-80 transition-opacity duration-300";
      default:
        return "";
    }
  };

  // Helper to get appropriate rounded classes
  const getRoundedClasses = (size: string) => {
    switch (size) {
      case "none": return "rounded-none";
      case "sm": return "rounded-sm";
      case "md": return "rounded";
      case "lg": return "rounded-lg";
      case "xl": return "rounded-xl";
      case "2xl": return "rounded-2xl";
      case "full": return "rounded-full";
      default: return "rounded-lg";
    }
  };

  // Calculate grid column classes based on the columns prop
  const getGridColumnsClass = () => {
    const baseClasses = 'grid grid-cols-1 sm:grid-cols-2';
    switch (columns) {
      case 3: return `${baseClasses} lg:grid-cols-3`;
      case 4: return `${baseClasses} lg:grid-cols-4`;
      case 5: return `${baseClasses} lg:grid-cols-5`;
      case 6: return `${baseClasses} lg:grid-cols-6`;
      default: return baseClasses;
    }
  };

  return (
    <motion.div 
      className={`${getGridColumnsClass()} ${className}`}
      style={{ gap: `${gap}px` }}
      variants={container}
      initial="hidden"
      animate={isLoaded ? "show" : "hidden"}
    >
      {images.map((image, index) => (
        <motion.div
          key={index}
          variants={item}
          className={`group overflow-hidden ${getRoundedClasses(rounded)} ${hoverEffect === 'lift' ? 'hover:-translate-y-2 transition-transform duration-300' : ''} relative shadow-apple dark:shadow-apple-dark`}
          style={{ 
            aspectRatio: gridLayout === "uniform" ? (image.aspectRatio || "1/1") : "auto" 
          }}
        >
          {enableParallax && (
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              whileHover={{ opacity: 0.7 }}
            />
          )}
          
          <Image
            src={image.src.startsWith('/photos/') 
              ? image.src.replace('/photos/', '/api/photos/') 
              : image.src}
            alt={image.alt}
            fill
            className={`object-cover ${getHoverEffectClasses(hoverEffect)}`}
            sizes={`(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${100 / columns}vw`}
          />
          
          {image.caption && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-sm font-light">{image.caption}</p>
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
