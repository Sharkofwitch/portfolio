"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export default function AnimatedHeading({
  children,
  className = "",
  glowColor = "rgba(255, 255, 255, 0.2)",
}: {
  children: string;
  className?: string;
  glowColor?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [textArray, setTextArray] = useState<string[]>([]);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const y = useSpring(scrollYProgress, springConfig);
  const opacity = useTransform(y, [0, 0.5, 1], [0.3, 1, 0.3]);
  const filter = useTransform(
    y,
    [0, 0.5, 1],
    ["blur(5px)", "blur(0px)", "blur(5px)"],
  );

  useEffect(() => {
    if (children) {
      setTextArray(children.split(" "));
    }
  }, [children]);

  return (
    <motion.h1
      ref={ref}
      style={{ opacity, filter }}
      className={`relative inline-block ${className}`}
    >
      {textArray.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mx-1 relative"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: i * 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <motion.span
            className="absolute -inset-x-2 -inset-y-1 hidden md:block"
            initial={false}
            animate={{
              background: [
                `radial-gradient(circle at 50% 50%, ${glowColor} 0%, transparent 100%)`,
                `radial-gradient(circle at 50% 50%, ${glowColor} 50%, transparent 100%)`,
                `radial-gradient(circle at 50% 50%, ${glowColor} 0%, transparent 100%)`,
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: i * 0.1,
            }}
          />
          {word}
        </motion.span>
      ))}
    </motion.h1>
  );
}
