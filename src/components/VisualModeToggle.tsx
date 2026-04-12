"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type VisualMode = "classic" | "grain" | "bw";

const MODES: { id: VisualMode; label: string; icon: string }[] = [
  { id: "classic", label: "Classic", icon: "◉" },
  { id: "grain", label: "Film Grain", icon: "▣" },
  { id: "bw", label: "B&W", icon: "◐" },
];

const STORAGE_KEY = "szark-visual-mode";

/**
 * VisualModeToggle – floating camera-icon button in the bottom-left corner.
 * Cycles through three visual modes:
 *  • classic  – default (no filter)
 *  • grain    – film-grain noise overlay with subtle sepia warmth
 *  • bw       – greyscale page via CSS filter
 *
 * The chosen mode is persisted to localStorage.
 */
export default function VisualModeToggle() {
  const [mode, setMode] = useState<VisualMode>("classic");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as VisualMode | null;
    if (saved && MODES.some((m) => m.id === saved)) {
      setMode(saved);
      applyMode(saved);
    }
    setMounted(true);
  }, []);

  const applyMode = (m: VisualMode) => {
    const root = document.documentElement;
    root.classList.remove("mode-grain", "mode-bw");
    if (m === "grain") root.classList.add("mode-grain");
    if (m === "bw") root.classList.add("mode-bw");
  };

  const selectMode = (m: VisualMode) => {
    setMode(m);
    applyMode(m);
    localStorage.setItem(STORAGE_KEY, m);
    setOpen(false);
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[9990] flex flex-col items-start gap-2">
      {/* Mode picker popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.92 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex flex-col gap-1.5 mb-1"
          >
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => selectMode(m.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono backdrop-blur-md border transition-all duration-200 ${
                  mode === m.id
                    ? "bg-white/90 text-black border-white/60 shadow-md"
                    : "bg-black/60 text-white/80 border-white/10 hover:bg-white/10"
                }`}
              >
                <span className="text-sm leading-none">{m.icon}</span>
                {m.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen((p) => !p)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        title="Visual mode"
        className="w-10 h-10 rounded-full bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:border-white/30 transition-all duration-200 shadow-lg"
        aria-label="Toggle visual mode"
      >
        {/* Camera icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
          />
        </svg>
      </motion.button>
    </div>
  );
}
