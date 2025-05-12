'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Slide {
  imageSrc: string;
  title: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  alignment?: 'left' | 'center' | 'right';
}

interface FullscreenPresentationProps {
  slides: Slide[];
  autoplayInterval?: number; // in milliseconds
  showControls?: boolean;
  height?: string;
  darkOverlay?: boolean;
  animationType?: 'fade' | 'slide' | 'zoom';
  className?: string;
}

export default function FullscreenPresentation({
  slides,
  autoplayInterval = 6000,
  showControls = true,
  height = 'h-screen',
  darkOverlay = true,
  animationType = 'fade',
  className = '',
}: FullscreenPresentationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (autoplayInterval && slides.length > 1 && !isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
      }, autoplayInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoplayInterval, slides.length, isPaused]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Animation variants based on animation type
  const getVariants = () => {
    switch (animationType) {
      case 'slide':
        return {
          enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0,
          }),
          center: {
            x: 0,
            opacity: 1,
            transition: {
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.5 }
            }
          },
          exit: (direction: number) => ({
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0,
            transition: {
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.5 }
            }
          }),
        };
      case 'zoom':
        return {
          enter: {
            scale: 1.2,
            opacity: 0,
          },
          center: {
            scale: 1,
            opacity: 1,
            transition: {
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }
          },
          exit: {
            scale: 0.9,
            opacity: 0,
            transition: {
              duration: 0.5
            }
          },
        };
      case 'fade':
      default:
        return {
          enter: { opacity: 0 },
          center: { 
            opacity: 1,
            transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
          },
          exit: { 
            opacity: 0,
            transition: { duration: 0.8 } 
          },
        };
    }
  };

  const getTextAlignmentClass = (alignment?: 'left' | 'center' | 'right') => {
    switch (alignment) {
      case 'left': return 'text-left items-start';
      case 'right': return 'text-right items-end';
      case 'center':
      default: return 'text-center items-center';
    }
  };

  const currentSlide = slides[currentIndex];
  const variants = getVariants();
  const textAlignment = getTextAlignmentClass(currentSlide.alignment);

  return (
    <div 
      className={`relative overflow-hidden ${height} ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          className="absolute inset-0"
          custom={1}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {/* Image Background */}
          <div className="absolute inset-0">
            <Image 
              src={currentSlide.imageSrc.startsWith('/photos/') 
                ? currentSlide.imageSrc.replace('/photos/', '/api/photos/') 
                : currentSlide.imageSrc} 
              alt={currentSlide.title}
              fill
              className="object-cover"
              priority
            />
            
            {darkOverlay && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
            )}
          </div>
          
          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`container mx-auto px-6 flex flex-col ${textAlignment} space-y-4 z-10`}>
              <motion.h2 
                className="text-white text-3xl md:text-5xl lg:text-7xl font-serif tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                {currentSlide.title}
              </motion.h2>
              
              {currentSlide.description && (
                <motion.p 
                  className="text-white/80 text-base md:text-lg lg:text-xl max-w-2xl mx-auto font-light"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  {currentSlide.description}
                </motion.p>
              )}
              
              {currentSlide.ctaText && currentSlide.ctaLink && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="mt-6"
                >
                  <a 
                    href={currentSlide.ctaLink} 
                    className="apple-button-secondary inline-block"
                  >
                    {currentSlide.ctaText}
                  </a>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation Controls */}
      {showControls && slides.length > 1 && (
        <>
          <button 
            className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 transition-colors"
            onClick={handlePrev}
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 transition-colors"
            onClick={handleNext}
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Slide Indicators */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-white w-6' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
