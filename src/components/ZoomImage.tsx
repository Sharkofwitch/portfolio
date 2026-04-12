"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { formatImagePath } from "@/lib/utils";

interface ZoomImageProps {
  src: string;
  alt: string;
}

const ZoomImage: React.FC<ZoomImageProps> = ({ src, alt }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update on resize
  useEffect(() => {
    const handleResize = () => {
      // Handle resize without dimensions
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleZoomToggle = () => {
    if (isZoomed) {
      // Reset zoom
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsZoomed(false);
    } else {
      // Zoom in
      setScale(2);
      setIsZoomed(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isZoomed || !containerRef.current) return;

    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect();

    // Calculate relative position in the image (0 to 1)
    const relativeX = (e.clientX - left) / width;
    const relativeY = (e.clientY - top) / height;

    // Calculate how much we need to move the image to keep the mouse position at the same spot
    const x = width * (scale - 1) * 0.5 - relativeX * width * (scale - 1);
    const y = height * (scale - 1) * 0.5 - relativeY * height * (scale - 1);

    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    // Optional: reset zoom on mouse leave
    // setScale(1);
    // setPosition({ x: 0, y: 0 });
    // setIsZoomed(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden w-full h-full cursor-${isZoomed ? "zoom-out" : "zoom-in"}`}
      onClick={handleZoomToggle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.img
        src={formatImagePath(src)}
        alt={alt}
        className="w-full h-full object-cover"
        animate={{
          scale,
          x: position.x,
          y: position.y,
        }}
        transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
        draggable={false}
        onError={(e) => {
          // Fallback to placeholder if image fails to load
          const target = e.target as HTMLImageElement;
          console.log(`Image failed to load: ${target.src}`);
          target.src = "/placeholder-image.svg";
        }}
      />

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs">
        {isZoomed ? "Click to zoom out" : "Click to zoom in"}
      </div>
    </div>
  );
};

export default ZoomImage;
