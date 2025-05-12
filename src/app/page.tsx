'use client';

import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { PhotoMetadata } from '@/lib/photo-types';
import FullscreenPresentation from '@/components/FullscreenPresentation';
import AnimatedImageGrid from '@/components/AnimatedImageGrid';

export default function Home() {
  const [featuredPhotos, setFeaturedPhotos] = useState<PhotoMetadata[]>([]);
  const [recentPhotos, setRecentPhotos] = useState<PhotoMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Refs for scroll animations
  const contentRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: contentRef,
    offset: ["start end", "end start"]
  });
  
  // Parallax effects
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -50]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch('/api/photos');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.photos.length > 0) {
            // Get the first 3 photos for the slider
            setFeaturedPhotos(data.photos.slice(0, 3));
            // Get the next 6 photos for the recent works grid
            setRecentPhotos(data.photos.slice(3, 9));
          }
        }
      } catch (error) {
        console.error('Failed to fetch photos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  // Prepare slides for FullscreenPresentation
  const heroSlides = featuredPhotos.map(photo => ({
    imageSrc: photo.src.startsWith('/photos/')
      ? photo.src.replace('/photos/', '/api/photos/')
      : photo.src,
    title: photo.title || 'Capturing Modern Nostalgia',
    description: photo.description || 'A photographic journey through moments of stillness and motion',
    ctaText: 'Explore Gallery',
    ctaLink: '/gallery',
    alignment: 'center' as 'center'
  }));

  // For AnimatedImageGrid
  const gridImages = recentPhotos.map(photo => ({
    src: photo.src.startsWith('/photos/')
      ? photo.src.replace('/photos/', '/api/photos/')
      : photo.src,
    alt: photo.alt || photo.title || 'Gallery photo',
    caption: new Date(photo.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short'
    }),
    aspectRatio: '3/4'
  }));

  return (
    <main className="min-h-screen" ref={contentRef}>
      {/* Hero Section with Fullscreen Presentation */}
      <section className="relative h-screen">
        {loading ? (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <p className="text-white/60 font-light">Loading gallery...</p>
            </div>
          </div>
        ) : (
          heroSlides.length > 0 && (
            <FullscreenPresentation 
              slides={heroSlides}
              autoplayInterval={7000}
              showControls={true}
              animationType="zoom"
            />
          )
        )}
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-10 left-0 right-0 flex justify-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <div className="w-9 h-14 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <motion.div 
              className="w-1 h-2 bg-white rounded-full"
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.2 }}
            />
          </div>
        </motion.div>
      </section>

      {/* Introduction Section */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-black/90 to-black">
        <motion.div 
          className="max-w-6xl mx-auto px-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-16">
            <motion.div 
              className="md:w-1/2 space-y-6"
              style={{ y: y1 }}
            >
              <span className="inline-block font-mono text-xs px-3 py-1 rounded-full bg-white/10 text-white/60 mb-4">
                ABOUT THE GALLERY
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-tight">
                Exploring Visual Stories
              </h2>
              <p className="text-white/70 text-lg leading-relaxed">
                From iPhone captures to analog film, this gallery represents a journey through different mediums, each bringing its own character and soul to the moments preserved.
              </p>
              <div className="pt-6">
                <Link 
                  href="/about" 
                  className="apple-button inline-flex items-center group"
                >
                  <span>Learn More</span>
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              className="md:w-1/2"
              style={{ y: y2 }}
            >
              <div className="relative h-[600px] rounded-2xl overflow-hidden shadow-apple-dark">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                {featuredPhotos[0] && (
                  <Image
                    src={featuredPhotos[0].src.startsWith('/photos/')
                      ? featuredPhotos[0].src.replace('/photos/', '/api/photos/')
                      : featuredPhotos[0].src}
                    alt="Gallery showcase"
                    fill
                    className="object-cover"
                    onError={(e) => console.error('Error loading featured image:', featuredPhotos[0].src)}
                  />
                )}
                <div className="absolute bottom-6 left-6 right-6 z-20">
                  <span className="inline-block text-xs font-mono text-white/60 mb-2">FEATURED</span>
                  <h3 className="text-2xl font-serif text-white mb-2">
                    {featuredPhotos[0]?.title || 'Modern Nostalgia'}
                  </h3>
                  <p className="text-white/70">
                    {featuredPhotos[0]?.description || 'Capturing stillness in motion with modern tools and classic techniques'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Recent Works Section */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.2 }}
            className="mb-16 text-center"
          >
            <span className="font-mono text-xs text-white/50 uppercase tracking-wider mb-4 block">Portfolio</span>
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">Recent Works</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              A collection of moments frozen in time, showcasing a blend of digital precision and analog character.
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div 
                  key={n}
                  className="aspect-[3/4] bg-gray-800 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <AnimatedImageGrid 
              images={gridImages}
              columns={3}
              hoverEffect="zoom"
              rounded="xl"
              enableParallax={true}
              className="mb-16"
            />
          )}

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <Link 
              href="/gallery"
              className="apple-button-secondary group inline-flex items-center"
            >
              <span>View Full Gallery</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* Call to Action Section */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0">
          {featuredPhotos[1] && (
            <Image
              src={featuredPhotos[1].src.startsWith('/photos/') 
                ? featuredPhotos[1].src.replace('/photos/', '/api/photos/') 
                : featuredPhotos[1].src}
              alt="Contact background"
              fill
              className="object-cover opacity-20"
            />
          )}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
        
        <motion.div 
          className="max-w-4xl mx-auto px-6 relative z-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <span className="font-mono text-xs text-white/50 uppercase tracking-wider mb-4 block">Get in Touch</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-8 leading-tight">
            Interested in Collaborations or Prints?
          </h2>
          <p className="text-white/70 text-lg mb-12 max-w-2xl mx-auto">
            Whether you're interested in discussing a potential project, purchasing prints, or simply sharing your thoughts about photography, I'd love to hear from you.
          </p>
          <Link 
            href="/contact"
            className="apple-button text-base py-3 px-8"
          >
            Contact Me
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
