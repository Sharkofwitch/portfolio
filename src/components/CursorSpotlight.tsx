"use client";

import { useEffect, useRef, useState } from "react";

/**
 * CursorSpotlight – cinematic flashlight / darkroom-torch cursor effect.
 * A glowing radial spotlight follows the mouse cursor on desktop,
 * giving the dark pages a dramatic, cinematic feel.
 * Only rendered on pointer devices (hidden on touch-only screens).
 */
export default function CursorSpotlight() {
  const spotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const pos = useRef({ x: -200, y: -200 });
  const ringPos = useRef({ x: -200, y: -200 });
  const rafId = useRef<number>(0);

  useEffect(() => {
    // Only enable on pointer (mouse) capable devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    // Smooth ring lerp animation
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const animate = () => {
      ringPos.current.x = lerp(ringPos.current.x, pos.current.x, 0.12);
      ringPos.current.y = lerp(ringPos.current.y, pos.current.y, 0.12);

      if (spotRef.current) {
        spotRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%, -50%)`;
      }
      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(rafId.current);
    };
  }, [visible]);

  return (
    <>
      {/* Inner glow dot */}
      <div
        ref={spotRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9999] mix-blend-screen transition-opacity duration-300"
        style={{
          opacity: visible ? 1 : 0,
          width: 12,
          height: 12,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,240,200,0.95) 0%, rgba(255,220,140,0.6) 40%, transparent 70%)",
          filter: "blur(2px)",
          willChange: "transform",
        }}
      />
      {/* Outer spotlight ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[9998] mix-blend-screen transition-opacity duration-500"
        style={{
          opacity: visible ? 1 : 0,
          width: 340,
          height: 340,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,240,200,0.06) 0%, rgba(255,220,120,0.04) 35%, rgba(255,180,80,0.02) 55%, transparent 70%)",
          willChange: "transform",
        }}
      />
    </>
  );
}
