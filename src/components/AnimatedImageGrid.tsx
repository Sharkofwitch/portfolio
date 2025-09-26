'use client';
import { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import ZoomImage from './ZoomImage';

interface GridImage {
  src: string;
  alt: string;
  caption?: string;
  aspectRatio?: string;
}

interface AnimatedImageGridProps {
  images: GridImage[];
  columns?: number;
  hoverEffect?: 'zoom' | 'fade';
  rounded?: string;
  className?: string;
}

const ImageWithErrorHandling = ({ 
  image, 
  onClick, 
  hoverEffect = 'zoom',
  rounded = 'lg'
}: { 
  image: GridImage; 
  onClick?: () => void;
  hoverEffect?: 'zoom' | 'fade';
  rounded?: string;
}) => {
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
    console.warn(`Failed to load image: ${image.src}`);
  }, [image.src]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoaded(false);
  }, []);

  if (hasError) {
    return (
      <motion.div
        className={`aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-${rounded} flex flex-col items-center justify-center cursor-pointer group`}
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
      className={`relative overflow-hidden rounded-${rounded} cursor-pointer group`}
      style={{ aspectRatio: image.aspectRatio || '3/4' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ 
        scale: hoverEffect === 'zoom' ? 1.02 : 1,
        opacity: hoverEffect === 'fade' ? 0.9 : 1
      }}
      transition={{ duration: 0.3 }}
      layout
    >
      {!isLoaded && (
        <div className={`absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-${rounded}`}></div>
      )}
      
      <Image
        src={image.src}
        alt={image.alt}
        fill
        className={`object-cover transition-all duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${hoverEffect === 'zoom' ? 'group-hover:scale-110' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        loading="lazy"
      />
      
      <AnimatePresence>
        {isHovered && image.caption && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3"
          >
            <p className="text-white text-sm font-medium truncate">{image.caption}</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Click to enlarge indicator */}
      <motion.div
        className="absolute top-2 right-2 bg-black/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      </motion.div>
    </motion.div>
  );
};

export default function AnimatedImageGrid({ 
  images, 
  columns = 3,
  hoverEffect = 'zoom',
  rounded = 'lg',
  className = ''
}: AnimatedImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<GridImage | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'default' | 'caption'>('default');
  
  const filteredImages = images.filter(image => 
    image.alt.toLowerCase().includes(filter.toLowerCase()) ||
    (image.caption?.toLowerCase().includes(filter.toLowerCase()) ?? false)
  );
  
  const sortedImages = [...filteredImages].sort((a, b) => {
    if (sortBy === 'caption') {
      return (a.caption || a.alt).localeCompare(b.caption || b.alt);
    }
    return 0;
  });

  const getGridCols = () => {
    switch (columns) {
      case 2: return 'grid-cols-1 sm:grid-cols-2';
      case 3: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
      case 4: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      default: return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Controls - only show if there are multiple images */}
      {images.length > 6 && (
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search images..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md text-white placeholder-white/60 focus:ring-2 focus:ring-white/30 focus:border-transparent"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'default' | 'caption')}
            className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 backdrop-blur-md text-white focus:ring-2 focus:ring-white/30 focus:border-transparent"
          >
            <option value="default" className="bg-gray-800">Default Order</option>
            <option value="caption" className="bg-gray-800">Sort by Date</option>
          </select>
        </div>
      )}
      
      {/* Grid */}
      <AnimatePresence mode="wait">
        {sortedImages.length > 0 ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`grid ${getGridCols()} gap-4`}
            layout
          >
            {sortedImages.map((image, index) => (
              <motion.div
                key={`${image.src}-${index}`}
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
                  image={image}
                  hoverEffect={hoverEffect}
                  rounded={rounded}
                  onClick={() => setSelectedImage(image)}
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
      
      {/* Zoom Modal */}
      {selectedImage && (
        <ZoomImage
          src={selectedImage.src}
          alt={selectedImage.alt}
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
