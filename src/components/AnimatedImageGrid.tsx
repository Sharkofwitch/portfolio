'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface Photo {
  id: string;
  src: string;
  alt: string;
  title?: string;
}

interface AnimatedImageGridProps {
  photos: Photo[];
  onImageClick?: (photo: Photo) => void;
}

const ImageWithErrorHandling = ({ photo, onClick }: { photo: Photo; onClick?: () => void }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
    console.warn(`Failed to load image: ${photo.src}`);
  }, [photo.src]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoaded(false);
  }, []);

  if (hasError) {
    return (
      <motion.div
        className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center cursor-pointer group"
        onClick={handleRetry}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <div className="text-gray-400 dark:text-gray-500 text-center p-4">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xs mb-1">Image failed to load</p>
          <p className="text-xs opacity-75 group-hover:opacity-100">Click to retry</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative aspect-square overflow-hidden rounded-lg cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      layout
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
      )}
      
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        className={`object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        loading="lazy"
      />
      
      <AnimatePresence>
        {isHovered && photo.title && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3"
          >
            <p className="text-white text-sm font-medium truncate">{photo.title}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function AnimatedImageGrid({ photos, onImageClick }: AnimatedImageGridProps) {
  const [filter, setFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'default' | 'title'>('default');
  
  const filteredPhotos = photos.filter(photo => 
    photo.alt.toLowerCase().includes(filter.toLowerCase()) ||
    (photo.title?.toLowerCase().includes(filter.toLowerCase()) ?? false)
  );
  
  const sortedPhotos = [...filteredPhotos].sort((a, b) => {
    if (sortBy === 'title') {
      return (a.title || a.alt).localeCompare(b.title || b.alt);
    }
    return 0;
  });

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search images..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'default' | 'title')}
          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="default">Default Order</option>
          <option value="title">Sort by Title</option>
        </select>
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {sortedPhotos.length > 0 ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            layout
          >
            {sortedPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  transition: { 
                    delay: index * 0.05,
                    duration: 0.5,
                    ease: "easeOut"
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.8,
                  transition: { duration: 0.3 }
                }}
              >
                <ImageWithErrorHandling
                  photo={photo}
                  onClick={() => onImageClick?.(photo)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 dark:text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-medium mb-1">No images found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}