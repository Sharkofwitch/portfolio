"use client";

import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  animate,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [0.97, 1.03]);
  const imageOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.85, 1, 1, 0.85],
  );
  const textY = useTransform(scrollYProgress, [0, 0.5], [40, 0]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } },
  };

  return (
    <div
      className="min-h-screen bg-white dark:bg-black relative overflow-hidden"
      ref={containerRef}
    >
      {/* decorative radial background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 -top-28 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-blue-50 to-emerald-50 opacity-40 blur-3xl dark:from-transparent dark:to-transparent" />
        <div className="absolute right-0 bottom-0 w-[360px] h-[360px] rounded-full bg-gradient-to-tr from-yellow-50 to-pink-50 opacity-30 blur-2xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-24 safe-top">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-16 p-4 sm:p-6 rounded-xl sm:rounded-2xl backdrop-blur-md bg-white/5 dark:bg-black/10 border border-gray-200/10 dark:border-gray-800/20 shadow-apple dark:shadow-apple-dark"
        >
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, filter: "blur(6px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8 }}
              className="text-xs md:text-sm text-gray-500 dark:text-gray-400 uppercase tracking-[2px] sm:tracking-[3px] mb-2"
            >
              Photography Portfolio
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-2xl md:text-3xl font-serif font-light text-gray-900 dark:text-white"
            >
              About My Journey
            </motion.h1>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Left: Image */}
          <motion.figure
            style={{ scale: imageScale, opacity: imageOpacity }}
            className="relative w-full rounded-2xl overflow-hidden vintage-filter group"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="relative aspect-[4/5] w-full">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/18 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Image
                src="/api/photos/profile.jpg"
                alt="Jakob Szarkowicz portrait with Leica T"
                fill
                loading="lazy"
                className="object-cover transition-transform duration-700 ease-out"
                sizes="(max-width: 640px) 100vw, 50vw"
                quality={80}
              />
            </div>
            <figcaption className="sr-only">
              Portrait of Jakob Szarkowicz with Leica T (Typ 701)
            </figcaption>
            <motion.div
              className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-20"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-1 bg-white/40 rounded-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          </motion.figure>

          {/* Right: Text + Timeline */}
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
              viewport={{ once: true, amount: 0.2 }}
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
                about my newest transition to the Leica T (Typ 701), which is
                now my primary camera. This fusion of digital precision and
                classic aesthetic represents my approach to photography—
                bridging contemporary technology with timeless technique.
              </motion.p>
            </motion.div>

            {/* Stats / Counters */}
            <motion.div
              variants={item}
              className="flex flex-wrap gap-4 items-center"
            >
              <Counter label="Photos" value={1248} />
              <Counter label="Projects" value={32} />
              <Counter
                label="Years"
                value={Math.max(1, new Date().getFullYear() - 2023)}
                suffix="+"
              />
            </motion.div>

            {/* Skills / chips */}
            <motion.div variants={item} className="flex flex-wrap gap-2">
              {[
                "Composition",
                "Film",
                "Color Grading",
                "Portraits",
                "Street",
              ].map((s, i) => (
                <motion.span
                  key={s}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.06 }}
                  className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border border-gray-200/30"
                >
                  {s}
                </motion.span>
              ))}
            </motion.div>

            <motion.div
              variants={item}
              className="pt-6 space-y-4 relative"
              viewport={{ once: true }}
            >
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="origin-left absolute left-0 top-0 h-1 w-32 bg-gradient-to-r from-blue-400 via-emerald-400 to-transparent rounded-full opacity-40"
                aria-hidden="true"
              />

              <h2 className="font-serif text-xl text-gray-900 dark:text-white flex items-center gap-2">
                Equipment & Timeline
                <span className="inline-block animate-bounce text-blue-400">
                  •
                </span>
              </h2>

              <ul className="space-y-3">
                {[
                  {
                    label: "2024: iPhone 16 Pro",
                    color: "bg-blue-400",
                    desc: "Learned composition and mobile workflows.",
                  },
                  {
                    label: "2025: Yashica FX1",
                    color: "bg-emerald-400",
                    desc: "Explored film and manual exposure.",
                  },
                  {
                    label: "2026: Leica T (Typ 701)",
                    color: "bg-yellow-400",
                    desc: "Primary digital camera — refined color and workflow.",
                  },
                ].map((it, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    viewport={{ once: true, amount: 0.2 }}
                    className="font-mono text-sm text-gray-600 dark:text-gray-400"
                  >
                    <button
                      type="button"
                      className="w-full text-left flex items-start gap-3 rounded-md p-2 group hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                      aria-label={it.label}
                    >
                      <span
                        className={`w-3 h-3 rounded-full flex-shrink-0 ${it.color} transition-transform duration-200 mt-1`}
                        aria-hidden="true"
                      />
                      <div>
                        <div className="transition-colors duration-300 font-medium">
                          {it.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {it.desc}
                        </div>
                      </div>
                    </button>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 0.14, y: 0 }}
                transition={{ duration: 1.2, delay: 0.5 }}
                className="absolute -right-8 -top-8 text-6xl text-yellow-300 pointer-events-none select-none"
                aria-hidden="true"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 48 48"
                  className="w-16 h-16 animate-float"
                >
                  <circle
                    cx="24"
                    cy="24"
                    r="22"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="currentColor"
                    opacity="0.2"
                  />
                  <rect
                    x="12"
                    y="18"
                    width="24"
                    height="16"
                    rx="4"
                    fill="currentColor"
                    opacity="0.5"
                  />
                  <circle cx="24" cy="26" r="5" fill="#fffde4" />
                </svg>
              </motion.div>
            </motion.div>

            <motion.div variants={item} className="pt-4 flex gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                Contact
              </Link>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                View Gallery
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Counter({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.2, ease: "easeOut" });
    const unsubscribe = mv.onChange((v) => setDisplay(Math.round(v)));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [mv, value]);

  return (
    <div className="rounded-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200/20 p-3 px-4 flex flex-col items-start">
      <div className="text-2xl font-semibold">
        {display}
        {suffix ?? ""}
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
        {label}
      </div>
    </div>
  );
}
