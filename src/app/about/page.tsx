"use client";

import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  animate,
  useInView,
  type Variants,
} from "framer-motion";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";

// Stagger container / item presets
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const quoteInView = useInView(quoteRef, { once: true, margin: "-80px" });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [0.97, 1.03]);
  const imageOpacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.85, 1],
    [0.8, 1, 1, 0.8],
  );

  // Mouse-tracking tilt for profile image
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), {
    stiffness: 200,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), {
    stiffness: 200,
    damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const timeline = [
    {
      period: "Oct 2024",
      label: "iPhone 16 Pro",
      color: "bg-blue-400",
      desc: "First steps — learning to see light, shadow, and geometry through a pocket-sized lens.",
    },
    {
      period: "Jan 2025",
      label: "Yashica FX-1",
      color: "bg-emerald-400",
      desc: "Film slowed everything down. Each frame became a deliberate choice, each roll a finite resource.",
    },
    {
      period: "2025",
      label: "Leica T (Typ 701)",
      color: "bg-amber-400",
      desc: "Primary camera. Stripped-back design that rewards intention over impulse.",
    },
  ];

  const skills = [
    "Composition",
    "Film",
    "Street",
    "Portraits",
    "Natural Light",
    "Urban",
  ];

  return (
    <div
      className="min-h-screen bg-white dark:bg-black relative overflow-hidden"
      ref={containerRef}
    >
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-32 w-[560px] h-[560px] rounded-full bg-gradient-to-br from-blue-50 to-emerald-50 opacity-50 blur-3xl dark:from-blue-950/20 dark:to-emerald-950/20 dark:opacity-30" />
        <div className="absolute right-0 bottom-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-amber-50 to-rose-50 opacity-30 blur-2xl dark:from-amber-950/10 dark:to-rose-950/10 dark:opacity-20" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-24 safe-top">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 sm:mb-20 p-5 sm:p-8 rounded-2xl backdrop-blur-md bg-white/5 dark:bg-black/10 border border-gray-200/10 dark:border-gray-800/20 shadow-apple dark:shadow-apple-dark"
        >
          <div className="text-center space-y-2">
            <motion.div
              initial={{ opacity: 0, letterSpacing: "0.5em" }}
              animate={{ opacity: 1, letterSpacing: "0.2em" }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-xs md:text-sm text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] font-mono"
            >
              Photography Portfolio
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2,
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-2xl md:text-4xl font-serif font-light text-gray-900 dark:text-white"
            >
              About My Journey
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-sm text-gray-400 dark:text-gray-500 font-light max-w-xs mx-auto"
            >
              Light, patience, and the spaces between moments
            </motion.p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-start">
          {/* Left: Image with tilt */}
          <motion.figure
            ref={imageRef}
            style={{
              scale: imageScale,
              opacity: imageOpacity,
              rotateX,
              rotateY,
              transformPerspective: 1000,
            }}
            className="relative w-full rounded-2xl overflow-hidden vintage-filter group cursor-default"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative aspect-[4/5] w-full">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <Image
                src="/api/photos/profile.jpg"
                alt="Jakob Szarkowicz — photographer"
                fill
                loading="lazy"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 100vw, 50vw"
                quality={80}
              />
            </div>
            <figcaption className="sr-only">
              Portrait of Jakob Szarkowicz with Leica T (Typ 701)
            </figcaption>

            {/* Camera badge */}
            <motion.div
              className="absolute bottom-4 left-4 z-20 font-mono text-xs text-white/70 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              viewport={{ once: true }}
            >
              Leica T · Typ 701
            </motion.div>
          </motion.figure>

          {/* Right: Text */}
          <motion.div
            className="space-y-8"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            <motion.div
              variants={staggerItem}
              className="inline-block font-mono text-xs bg-gray-100 dark:bg-gray-800/60 px-3 py-1 rounded-full text-gray-500 dark:text-gray-400 tracking-widest uppercase"
            >
              Est. 2024
            </motion.div>

            <motion.h2
              variants={staggerItem}
              className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white tracking-tight leading-tight"
            >
              Capturing Modern Nostalgia
            </motion.h2>

            <motion.div
              variants={staggerContainer}
              className="space-y-5 text-gray-600 dark:text-gray-300"
            >
              <motion.p variants={staggerItem} className="leading-relaxed">
                Photography found me before I sought it — a spontaneous pursuit
                that began in autumn 2024. Armed with an iPhone 16 Pro, I
                discovered that every camera is simply a tool to make the
                invisible visible: the quality of afternoon light, the geometry
                of forgotten corners, the brief unguarded expressions that make
                up a life.
              </motion.p>

              <motion.p variants={staggerItem} className="leading-relaxed">
                Film changed everything. The Yashica FX-1 demanded patience —
                each frame a deliberate choice, each roll a finite resource.
                Analog photography taught me to see first, then shoot: to wait
                for the right light rather than chase it in post.
              </motion.p>

              <motion.p variants={staggerItem} className="leading-relaxed">
                The Leica T sits at the intersection of heritage and restraint.
                Its stripped-back interface encourages intention over impulse.
                Now my primary companion, it reminds me daily that the best
                image is rarely the quickest — it&apos;s the one you waited for.
              </motion.p>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={staggerItem}
              className="flex flex-wrap gap-3 items-center"
            >
              <Counter label="Photos" value={1248} />
              <Counter
                label="Years"
                value={Math.max(1, new Date().getFullYear() - 2023)}
                suffix="+"
              />
              <Counter label="Cameras" value={3} />
            </motion.div>

            {/* Skill chips */}
            <motion.div variants={staggerItem} className="flex flex-wrap gap-2">
              {skills.map((s, i) => (
                <motion.span
                  key={s}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.3 + i * 0.07,
                    duration: 0.4,
                    ease: "easeOut",
                  }}
                  className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border border-gray-200/40 dark:border-gray-700/40"
                >
                  {s}
                </motion.span>
              ))}
            </motion.div>

            {/* Philosophy quote */}
            <motion.div
              ref={quoteRef}
              className="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700"
            >
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={quoteInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="text-sm italic text-gray-500 dark:text-gray-400 leading-relaxed"
              >
                &ldquo;The camera is an instrument that teaches people how to
                see without a camera.&rdquo;
              </motion.p>
              <motion.span
                initial={{ opacity: 0 }}
                animate={quoteInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="block mt-2 text-xs font-mono text-gray-400 dark:text-gray-500"
              >
                — Dorothea Lange
              </motion.span>
            </motion.div>

            {/* Equipment timeline */}
            <motion.div
              variants={staggerItem}
              className="pt-4 space-y-4 relative"
            >
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="origin-left absolute left-0 top-0 h-px w-28 bg-gradient-to-r from-blue-400 via-emerald-400 to-transparent"
                aria-hidden="true"
              />

              <h3 className="font-serif text-lg text-gray-900 dark:text-white pt-3">
                Equipment &amp; Timeline
              </h3>

              <ul className="space-y-1">
                {timeline.map((it, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.4 + i * 0.1,
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    viewport={{ once: true, amount: 0.3 }}
                  >
                    <button
                      type="button"
                      className="w-full text-left flex items-start gap-3 rounded-xl p-3 group hover:bg-gray-50 dark:hover:bg-gray-900/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                      aria-label={it.label}
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${it.color} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-black ring-transparent group-hover:ring-current transition-all duration-300`}
                        aria-hidden="true"
                      />
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-xs text-gray-400 dark:text-gray-500">
                            {it.period}
                          </span>
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {it.label}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-h-0 overflow-hidden group-hover:max-h-10 transition-all duration-300 ease-out">
                          {it.desc}
                        </div>
                      </div>
                    </button>
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
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, { duration: 1.4, ease: "easeOut" });
    const unsubscribe = mv.on("change", (v) => setDisplay(Math.round(v)));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [mv, value, inView]);

  return (
    <div
      ref={ref}
      className="rounded-2xl bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200/30 dark:border-white/5 p-3 px-4 flex flex-col items-start"
    >
      <div className="text-2xl font-semibold text-gray-900 dark:text-white tabular-nums">
        {display}
        {suffix ?? ""}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        {label}
      </div>
    </div>
  );
}
