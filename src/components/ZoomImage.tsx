"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ZoomImageProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

const ZoomImage: React.FC<ZoomImageProps> = ({ src, alt, isOpen, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsZoomed(false);
      setIsLoaded(false);
      setHasError(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          resetZoom();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * 1.5, 5));
    setIsZoomed(true);
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => {
      const newScale = Math.max(prev / 1.5, 1);
      if (newScale <= 1) {
        setIsZoomed(false);
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsZoomed(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isZoomed || !containerRef.current || scale <= 1) return;

    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const relativeX = (e.clientX - left) / width;
    const relativeY = (e.clientY - top) / height;

    // Calculate movement bounds to prevent image from going off-screen
    const maxX = (width * (scale - 1)) / 2;
    const maxY = (height * (scale - 1)) / 2;

    const x = Math.max(-maxX, Math.min(maxX, width * (0.5 - relativeX) * (scale - 1)));
    const y = Math.max(-maxY, Math.min(maxY, height * (0.5 - relativeY) * (scale - 1)));

    setPosition({ x, y });
  }, [isZoomed, scale]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!isOpen) return;
    e.preventDefault();
    
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  }, [isOpen, handleZoomIn, handleZoomOut]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleImageClick = useCallback(() => {
    if (scale <= 1) {
      handleZoomIn();
    } else {
      resetZoom();
    }
  }, [scale, handleZoomIn, resetZoom]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={handleBackdropClick}
        onWheel={handleWheel}
      >
        {/* Close button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute top-4 right-4 z-10 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-2 rounded-full transition-colors"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>

        {/* Zoom controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/10 backdrop-blur-md rounded-full p-2 flex items-center gap-2"
        >
          <button
            onClick={handleZoomOut}
            disabled={scale <= 1}
            className="text-white hover:text-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Zoom out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          
          <span className="text-white text-sm min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={handleZoomIn}
            disabled={scale >= 5}
            className="text-white hover:text-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Zoom in"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
          
          <button
            onClick={resetZoom}
            className="text-white hover:text-gray-300 p-2 rounded-full hover:bg-white/10 transition-colors ml-2"
            aria-label="Reset zoom"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </motion.div>

        {/* Image container */}
        <motion.div
          ref={containerRef}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative max-w-[90vw] max-h-[90vh] overflow-hidden cursor-pointer"
          style={{
            cursor: scale <= 1 ? 'zoom-in' : isZoomed ? 'grab' : 'zoom-out'
          }}
          onClick={handleImageClick}
          onMouseMove={handleMouseMove}
        >
          {/* Loading placeholder */}
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-lg flex items-center justify-center">
              <div className="text-white/60">
                <svg className="w-8 h-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
          )}

          {/* Error state */}
          {hasError && (
            <div className="bg-gray-800 rounded-lg p-8 flex flex-col items-center justify-center text-white">
              <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-medium mb-1">Failed to load image</p>
              <p className="text-sm text-gray-400">{alt}</p>
            </div>
          )}

          {/* Image */}
          {!hasError && (
            <motion.div
              animate={{
                scale,
                x: position.x,
                y: position.y,
              }}
              transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
              className="relative"
            >
              <Image
                ref={imageRef}
                src={src}
                alt={alt}
                width={800}
                height={600}
                className={`max-w-[90vw] max-h-[90vh] object-contain transition-opacity duration-300 ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setIsLoaded(true)}
                onError={() => setHasError(true)}
                draggable={false}
                priority
              />
            </motion.div>
          )}
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-4 right-4 z-10 bg-white/10 backdrop-blur-md rounded-lg p-3 text-white text-xs max-w-xs"
        >
          <p className="mb-1 font-medium">Controls:</p>
          <p>• Click to zoom in/out</p>
          <p>• Scroll to zoom</p>
          <p>• ESC to close</p>
          <p>• Move mouse to pan when zoomed</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ZoomImage;
