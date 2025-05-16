"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";

interface HoverEffectImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onClick?: () => void;
}

export const HoverEffectImage: React.FC<HoverEffectImageProps> = ({
  src,
  alt,
  className = "",
  width,
  height,
  priority = false,
  onClick,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const springConfig = { damping: 15, stiffness: 150 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      mouseX.set(x);
      mouseY.set(y);
    }
  }

  function onMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div
      ref={(el) => {
        // Combine refs - using type assertion to avoid type errors
        containerRef.current = el as HTMLDivElement;
        ref(el);
      }}
      className={`relative overflow-hidden rounded-xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
        rotateX: springRotateX,
        rotateY: springRotateY,
      }}
    >
      {/* Loading effect */}
      <motion.div
        className="absolute inset-0 bg-gray-200 dark:bg-gray-800"
        initial={{ opacity: 1 }}
        animate={{ opacity: isLoaded ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent"
          animate={{
            x: ["0%", "100%"],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>

      <div className="relative">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setIsLoaded(true)}
          priority={priority}
          onClick={onClick}
          style={{
            transformStyle: "preserve-3d",
            transform: "translateZ(80px)",
            filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.2))",
          }}
        />

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 pointer-events-none"
          style={{
            opacity: useTransform(mouseX, [-300, 0, 300], [0.15, 0, 0.15]),
            rotate: useTransform(mouseX, [-300, 300], [-10, 10]),
          }}
        />
      </div>
    </motion.div>
  );
};

export const FancyHoverCard: React.FC<{
  title: string;
  description?: string;
  imageSrc: string;
  onClick?: () => void;
  className?: string;
}> = ({ title, description, imageSrc, onClick, className = "" }) => {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl shadow-lg cursor-pointer ${className}`}
      onClick={onClick}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative h-64 overflow-hidden">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className="text-xl font-semibold mb-1">{title}</h3>
        {description && <p className="text-sm opacity-90">{description}</p>}
      </div>

      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};
