"use client";

import { motion, useMotionTemplate, useSpring } from "framer-motion";
import { MouseEvent, ReactNode } from "react";

export default function HoverCard({
  children,
  className = "",
  spotlightSize = 200,
}: {
  children: ReactNode;
  className?: string;
  spotlightSize?: number;
}) {
  const mouseX = useSpring(0, { stiffness: 500, damping: 50 });
  const mouseY = useSpring(0, { stiffness: 500, damping: 50 });

  function onMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const backgroundImage = useMotionTemplate`
    radial-gradient(
      ${spotlightSize}px circle at ${mouseX}px ${mouseY}px,
      rgba(255,255,255,0.1),
      transparent 80%
    )
  `;

  return (
    <motion.div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-b from-neutral-800/80 to-neutral-900/80 p-px before:pointer-events-none before:absolute before:-left-40 before:-top-40 before:z-10 before:h-80 before:w-80 before:translate-x-[var(--mouse-x)] before:translate-y-[var(--mouse-y)] before:rounded-full before:bg-gray-500 before:opacity-0 before:blur-[100px] before:transition-opacity after:pointer-events-none after:absolute after:-left-48 after:-top-48 after:z-30 after:h-96 after:w-96 after:translate-x-[var(--mouse-x)] after:translate-y-[var(--mouse-y)] after:rounded-full after:bg-indigo-500 after:opacity-0 after:blur-[100px] after:transition-opacity hover:before:opacity-20 hover:after:opacity-10 ${className}`}
      onMouseMove={onMouseMove}
    >
      <div className="relative z-20 h-full w-full rounded-3xl bg-gradient-to-b from-neutral-800/80 to-neutral-900/80 p-8">
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: backgroundImage,
          }}
        />
        {children}
      </div>
    </motion.div>
  );
}
