'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import GalleryGrid from '@/components/GalleryGrid';
import { PhotoMetadata } from '@/lib/photo-types';
import Image from 'next/image';

type SortOrder = 'newest' | 'oldest';

export default function GalleryPage() {
  const [photos, setPhotos] = useState<PhotoMetadata[]>([]);
  const [sortedPhotos, setSortedPhotos] = useState<PhotoMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
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
        const response = await fetch('/api/photos');
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch photos');
        }
        
        setPhotos(data.photos);
      } catch (err) {
        console.error('Error fetching photos:', err);
        setError('Failed to load photos. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchPhotos();
  }, []);

  // Handle sorting logic
  useEffect(() => {
    if (photos.length > 0) {
      // Create a copy to avoid modifying the original array
      const sorted = [...photos];
      
      if (sortOrder === 'newest') {
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else {
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
      
      setSortedPhotos(sorted);
    }
  }, [photos, sortOrder]);

  // Handle sort change
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(event.target.value as SortOrder);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero header with parallax effect */}
      <div 
        ref={headerRef} 
        className="relative h-[50vh] overflow-hidden"
      >
        {photos.length > 0 && (
          <motion.div 
            className="absolute inset-0 w-full h-full"
            style={{ 
              y: headerY,
              scale 
            }}
          >
            <Image
              src={photos[0]?.src 
                ? (photos[0].src.startsWith('/photos/') 
                    ? photos[0].src.replace('/photos/', '/api/photos/') 
                    : photos[0].src) 
                : '/api/photos/image_1.jpg'}
              alt="Gallery Header"
              fill
              className="object-cover"
              priority
            />
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
              A journey through decades of photography, from film to digital, capturing moments that whisper stories of yesteryear
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
              {loading ? 'Loading gallery...' : `${photos.length} images`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span>Sorted by</span>
              <select 
                className="bg-black/50 rounded py-1 px-2 border border-gray-700 text-white"
                value={sortOrder}
                onChange={handleSortChange}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
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
              <svg 
                className="w-16 h-16 text-gray-500 mb-4 mx-auto" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
              <p className="text-gray-300 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="p-6 backdrop-blur-xl bg-black/70 rounded-2xl border border-white/10">
              <p className="text-gray-300">No photos found in the gallery.</p>
            </div>
          </div>
        ) : (
          <GalleryGrid 
            photos={sortedPhotos} 
            sortOrder={sortOrder}
            onSortChange={(sort) => setSortOrder(sort)} 
          />
        )}
      </motion.div>
    </div>
  );
}
