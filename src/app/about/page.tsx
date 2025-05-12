"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [0.95, 1.05]);
  const imageOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.8, 1, 1, 0.8],
  );
  const textY = useTransform(scrollYProgress, [0, 0.5], [50, 0]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black" ref={containerRef}>
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-24 safe-top">
        {/* Glass Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 sm:mb-16 p-4 sm:p-6 rounded-xl sm:rounded-2xl backdrop-blur-md bg-white/5 dark:bg-black/10 border border-gray-200/10 dark:border-gray-800/20 shadow-apple dark:shadow-apple-dark"
        >
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-xs md:text-sm text-gray-500 dark:text-gray-400 uppercase tracking-[2px] sm:tracking-[3px] mb-2"
            >
              Photography Portfolio
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-2xl md:text-3xl font-serif font-light text-gray-900 dark:text-white"
            >
              About My Journey
            </motion.h1>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <motion.div
            style={{
              scale: imageScale,
              opacity: imageOpacity,
            }}
            className="relative aspect-[4/5] rounded-2xl overflow-hidden vintage-filter group"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Image
              src="/api/photos/profile.jpg"
              alt="Jakob Szarkowicz"
              fill
              className="object-cover transition-transform duration-700 ease-out"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <motion.div
              className="absolute bottom-0 left-0 right-0 p-6 z-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="w-12 h-1 bg-white/50 rounded-full mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.div>
          </motion.div>

          <motion.div
            style={{ y: textY }}
            className="space-y-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div
              variants={item}
              className="inline-block font-mono text-sm bg-gray-100 dark:bg-gray-800/50 px-3 py-1 rounded-full text-gray-600 dark:text-gray-400"
            >
              EST. 2024
            </motion.div>

            <motion.h1
              variants={item}
              className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white tracking-tight leading-tight"
            >
              Capturing Modern Nostalgia
            </motion.h1>

            <motion.div
              variants={container}
              className="space-y-6 text-gray-600 dark:text-gray-300 font-light"
            >
              <motion.p variants={item}>
                My journey in photography began in October 2024, exploring the
                world through the lens of my iPhone 16 Pro. This modern tool
                became my gateway into the art of visual storytelling, teaching
                me the fundamentals of composition and light.
              </motion.p>

              <motion.p variants={item}>
                In January 2025, I took a step into analog photography with my
                Yashica FX1. The mechanical process of film photography has
                given me a deeper appreciation for each frame and the
                thoughtfulness required in capturing moments.
              </motion.p>

              <motion.p variants={item}>
                As I continue to evolve as a photographer, I&apos;m excited
                about my upcoming transition to the Fujifilm X-S20, which will
                become my primary camera. This fusion of digital precision and
                classic aesthetic represents my approach to photography -
                bridging contemporary technology with timeless technique.
              </motion.p>
            </motion.div>

            <motion.div variants={item} className="pt-6 space-y-4">
              <h2 className="font-serif text-xl text-gray-900 dark:text-white">
                Equipment & Timeline
              </h2>
              <ul className="space-y-4">
                {[
                  "2024: iPhone 16 Pro",
                  "2025: Yashica FX1",
                  "Coming Soon: Fujifilm X-S20",
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="font-mono text-sm text-gray-600 dark:text-gray-400 flex items-center"
                  >
                    <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 mr-3"></span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
