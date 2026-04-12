"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";

/**
 * ScrollProgress – two combined features:
 *
 * 1. A thin gradient progress bar pinned to the very top of the page that
 *    fills as the user scrolls (similar to YouTube / Medium reading progress).
 *
 * 2. A floating "back to top" button that fades in after 40 % scroll depth
 *    and smoothly scrolls back to the top of the page when clicked.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  const [showBtn, setShowBtn] = useState(false);

  useEffect(() => {
    const unsub = scrollYProgress.onChange((v) => setShowBtn(v > 0.35));
    return unsub;
  }, [scrollYProgress]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      {/* ── Scroll progress bar ─────────────────────────────────── */}
      <motion.div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 z-[9995] h-[3px] origin-left pointer-events-none"
        style={{
          scaleX,
          background:
            "linear-gradient(90deg, #a78bfa 0%, #60a5fa 40%, #34d399 80%, #fbbf24 100%)",
        }}
      />

      {/* ── Back-to-top button ────────────────────────────────────── */}
      <AnimatePresence>
        {showBtn && (
          <motion.button
            key="back-to-top"
            initial={{ opacity: 0, y: 16, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.85 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            aria-label="Back to top"
            className="fixed bottom-20 right-6 z-[9990] w-10 h-10 rounded-full bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:border-white/30 transition-colors duration-200 shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 15.75l7.5-7.5 7.5 7.5"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
