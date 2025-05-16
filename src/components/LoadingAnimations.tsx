"use client";

import React from "react";
import { motion } from "framer-motion";

interface LoadingAnimationProps {
  size?: "small" | "medium" | "large";
  color?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingAnimationProps> = ({
  size = "medium",
  color = "currentColor",
  className = "",
}) => {
  const sizeMap = {
    small: 24,
    medium: 36,
    large: 48,
  };

  const circleSize = sizeMap[size];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className="relative"
        style={{ width: circleSize, height: circleSize }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        <motion.span
          className="block absolute"
          style={{
            width: circleSize,
            height: circleSize,
            border: `3px solid ${color}`,
            borderTopColor: "transparent",
            borderRadius: "50%",
          }}
        />
      </motion.div>
    </div>
  );
};

export const PulseLoader: React.FC<LoadingAnimationProps> = ({
  size = "medium",
  color = "currentColor",
  className = "",
}) => {
  const sizeMap = {
    small: "w-1.5 h-1.5",
    medium: "w-2.5 h-2.5",
    large: "w-3.5 h-3.5",
  };

  const dotSize = sizeMap[size];

  const pulseVariants = {
    initial: { scale: 1 },
    animate: { scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] },
  };

  return (
    <div className={`flex gap-1.5 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={`${dotSize} rounded-full`}
          style={{ backgroundColor: color }}
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export const ShimmerEffect: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return (
    <div
      className={`relative overflow-hidden bg-gray-200 dark:bg-gray-800 ${className}`}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full"
        animate={{
          x: ["0%", "100%"],
        }}
        transition={{
          duration: 1.5,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
        }}
      />
    </div>
  );
};

// Image loading animation
export const ImageLoadingAnimation: React.FC<{
  isLoading: boolean;
  className?: string;
}> = ({ isLoading, className = "" }) => {
  return (
    <motion.div
      className={`absolute inset-0 bg-gray-200 dark:bg-gray-800 flex items-center justify-center ${className}`}
      initial={{ opacity: 1 }}
      animate={{ opacity: isLoading ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-16 h-16 relative"
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        <motion.span
          className="block absolute w-full h-full rounded-full"
          style={{
            border: "3px solid rgba(255,255,255,0.2)",
            borderTopColor: "white",
          }}
        />
      </motion.div>
    </motion.div>
  );
};
