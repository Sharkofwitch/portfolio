'use client';

import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}

interface SkeletonProps {
  className?: string;
  count?: number;
  height?: number | string;
  width?: number | string;
}

interface PulseProps {
  children?: React.ReactNode;
  className?: string;
  duration?: number;
}

// Optimized size mapping with memoization
const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
} as const;

// Spinner component optimized for performance
const LoadingSpinner = memo<LoadingSpinnerProps>(({ 
  size = 'md', 
  color = 'text-blue-500', 
  className = '' 
}) => {
  const sizeClass = sizeClasses[size];
  
  const spinVariants = useMemo(() => ({
    animate: {
      rotate: 360,
    },
  }), []);

  return (
    <motion.div
      className={`${sizeClass} ${color} ${className}`}
      variants={spinVariants}
      animate="animate"
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
        repeatType: "loop" as const,
      }}
    >
      <svg
        className="w-full h-full"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  );
});
LoadingSpinner.displayName = 'LoadingSpinner';

// Skeleton loading component with optimized animations
const Skeleton = memo<SkeletonProps>(({ 
  className = '', 
  count = 1, 
  height = '1rem', 
  width = '100%' 
}) => {
  const skeletonVariants = useMemo(() => ({
    animate: {
      opacity: [0.4, 0.8, 0.4],
    },
  }), []);

  const skeletonStyle = useMemo(() => ({
    height: typeof height === 'number' ? `${height}px` : height,
    width: typeof width === 'number' ? `${width}px` : width,
  }), [height, width]);

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className="bg-gray-200 dark:bg-gray-700 rounded-md"
          style={skeletonStyle}
          variants={skeletonVariants}
          animate="animate"
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.1,
          }}
        />
      ))}
    </div>
  );
});
Skeleton.displayName = 'Skeleton';

// Pulse animation wrapper optimized for performance
const Pulse = memo<PulseProps>(({ children, className = '', duration = 2 }) => {
  const pulseVariants = useMemo(() => ({
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
    },
  }), []);

  return (
    <motion.div
      className={className}
      variants={pulseVariants}
      animate="animate"
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
});
Pulse.displayName = 'Pulse';

// Dots loading indicator with staggered animation
const LoadingDots = memo<{ size?: 'sm' | 'md' | 'lg'; className?: string }>(({ 
  size = 'md', 
  className = '' 
}) => {
  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const dotVariants = useMemo(() => ({
    animate: {
      y: [0, -10, 0],
      opacity: [0.4, 1, 0.4],
    },
  }), []);

  return (
    <div className={`flex space-x-1 items-center justify-center ${className}`}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`${dotSizes[size]} bg-current rounded-full`}
          variants={dotVariants}
          animate="animate"
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.1,
          }}
        />
      ))}
    </div>
  );
});
LoadingDots.displayName = 'LoadingDots';

// Progress bar component with smooth animation
const ProgressBar = memo<{ 
  progress?: number; 
  className?: string; 
  animated?: boolean;
  color?: string;
}>(({ 
  progress = 0, 
  className = '', 
  animated = true,
  color = 'bg-blue-500'
}) => {
  const progressVariants = useMemo(() => ({
    animate: animated ? {
      backgroundPosition: ['0% 0%', '100% 0%'],
    } : {},
  }), [animated]);

  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden ${className}`}>
      <motion.div
        className={`h-full ${color} ${animated ? 'bg-gradient-to-r from-current via-current to-transparent bg-[length:200%_100%]' : ''}`}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        variants={progressVariants}
        animate={animated ? "animate" : undefined}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
});
ProgressBar.displayName = 'ProgressBar';

// Image skeleton with aspect ratio preservation
const ImageSkeleton = memo<{
  aspectRatio?: string;
  className?: string;
}>(({ aspectRatio = 'aspect-square', className = '' }) => {
  return (
    <Skeleton
      className={`${aspectRatio} ${className}`}
      height="100%"
      width="100%"
      count={1}
    />
  );
});
ImageSkeleton.displayName = 'ImageSkeleton';

// Card skeleton for content loading
const CardSkeleton = memo<{
  showAvatar?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  className?: string;
}>(({ 
  showAvatar = true, 
  showTitle = true, 
  showDescription = true, 
  className = '' 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {showAvatar && (
        <div className="flex items-center space-x-3">
          <Skeleton height={40} width={40} className="rounded-full" />
          <div className="flex-1">
            <Skeleton height={16} width="60%" />
          </div>
        </div>
      )}
      {showTitle && <Skeleton height={20} width="80%" />}
      {showDescription && (
        <div className="space-y-2">
          <Skeleton height={14} width="100%" />
          <Skeleton height={14} width="90%" />
          <Skeleton height={14} width="70%" />
        </div>
      )}
    </div>
  );
});
CardSkeleton.displayName = 'CardSkeleton';

// Export all components
export {
  LoadingSpinner,
  Skeleton,
  Pulse,
  LoadingDots,
  ProgressBar,
  ImageSkeleton,
  CardSkeleton,
};

// Default export for backward compatibility
export default LoadingSpinner;