"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeartParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  tx: number; // target x
  ty: number; // target y
}

interface LikeAnimationProps {
  isActive: boolean;
  size?: number;
}

export const LikeAnimation: React.FC<LikeAnimationProps> = ({ isActive }) => {
  const [particles, setParticles] = useState<HeartParticle[]>([]);

  // Generate particles when isActive changes to true
  useEffect(() => {
    if (isActive) {
      const newParticles: HeartParticle[] = [];
      const numParticles = Math.floor(Math.random() * 5) + 5; // 5-10 particles

      for (let i = 0; i < numParticles; i++) {
        const angle = Math.random() * Math.PI * 2; // Random angle in radians
        const distance = Math.random() * 30 + 20; // Random distance between 20-50px

        newParticles.push({
          id: Date.now() + i,
          x: 0,
          y: 0,
          size: Math.random() * 8 + 4, // Random size 4-12px
          color: getRandomHeartColor(),
          tx: Math.cos(angle) * distance, // target x based on angle
          ty: Math.sin(angle) * distance, // target y based on angle
        });
      }

      setParticles(newParticles);

      // Clean up particles after animation
      setTimeout(() => {
        setParticles([]);
      }, 700);
    }
  }, [isActive]);

  const getRandomHeartColor = () => {
    const colors = [
      "#ff3b30", // Red
      "#ff9500", // Orange
      "#ff2d55", // Pink
      "#ff375f", // Rose
      "#ff7eb9", // Light pink
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              opacity: 1,
              scale: 0.5,
              x: 0,
              y: 0,
            }}
            animate={{
              opacity: 0,
              scale: 0,
              x: particle.tx,
              y: particle.ty,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: particle.size,
              height: particle.size,
              marginLeft: -particle.size / 2,
              marginTop: -particle.size / 2,
              backgroundColor: particle.color,
              borderRadius: "50%",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default LikeAnimation;
