"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{
          opacity: 0,
          y: 20,
          filter: "blur(10px)",
        }}
        animate={{
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
        }}
        exit={{
          opacity: 0,
          y: -20,
          filter: "blur(10px)",
        }}
        transition={{
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <motion.div
          initial={{ scaleY: 0, originY: 0 }}
          animate={{
            scaleY: [0, 1, 1, 0],
            originY: [0, 0, 1, 1],
          }}
          transition={{
            duration: 1.2,
            times: [0, 0.4, 0.6, 1],
            ease: [0.22, 1, 0.36, 1],
          }}
          className="fixed inset-0 bg-black z-50 pointer-events-none"
        />
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
