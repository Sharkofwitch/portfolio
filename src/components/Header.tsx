"use client";

import { motion, useScroll, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll position for header appearance
  const {} = useScroll();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: scrolled ? "rgba(0, 0, 0, 0.6)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(255, 255, 255, 0.1)"
            : "none",
        }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 safe-top"
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/"
                className="font-serif text-2xl md:text-3xl text-white hover:text-gray-300 transition-colors tracking-wide flex items-center"
              >
                <span className="relative">
                  szark
                  <motion.span
                    className="absolute left-0 bottom-0 w-full h-px bg-white/40"
                    initial={{ scaleX: 0, originX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </span>
                <span className="font-mono text-xs md:text-sm align-top ml-0.5 opacity-70">
                  .org
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8 font-mono text-sm tracking-wider">
              {(
                [
                  { path: "/gallery" as const, label: "GALLERY" },
                  { path: "/about" as const, label: "ABOUT" },
                  { path: "/contact" as const, label: "CONTACT" },
                ] as const
              ).map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className="group relative px-1 py-2"
                >
                  <span
                    className={`relative z-10 ${
                      isActive(item.path)
                        ? "text-white"
                        : "text-gray-300 group-hover:text-white"
                    } transition-colors duration-300`}
                  >
                    {item.label}
                  </span>
                  <motion.span
                    className="absolute inset-x-0 bottom-0 h-px bg-white"
                    initial={{ scaleX: isActive(item.path) ? 1 : 0 }}
                    animate={{ scaleX: isActive(item.path) ? 1 : 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white p-2 focus:outline-none"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              <span className="sr-only">Open main menu</span>
              <div className="relative w-6 h-6">
                <span
                  className={`absolute block h-0.5 bg-white transform transition-all duration-300 ease-in-out rounded-full ${
                    mobileMenuOpen ? "rotate-45 top-3" : "top-2"
                  }`}
                  style={{ width: "24px" }}
                />
                <span
                  className={`absolute block h-0.5 bg-white transform transition-all duration-300 ease-in-out rounded-full ${
                    mobileMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                  style={{ width: "24px", top: "12px" }}
                />
                <span
                  className={`absolute block h-0.5 bg-white transform transition-all duration-300 ease-in-out rounded-full ${
                    mobileMenuOpen ? "-rotate-45 top-3" : "top-4"
                  }`}
                  style={{ width: "24px" }}
                />
              </div>
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/90 backdrop-blur-lg pt-20 flex flex-col"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="flex flex-col items-center space-y-8 pt-12 px-6">
              {(
                [
                  { path: "/gallery" as const, label: "GALLERY" },
                  { path: "/about" as const, label: "ABOUT" },
                  { path: "/contact" as const, label: "CONTACT" },
                ] as const
              ).map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Link
                    href={item.path}
                    className={`text-2xl font-mono py-3 px-6 ${
                      isActive(item.path)
                        ? "text-white border-b-2 border-white"
                        : "text-gray-300"
                    } hover:text-white transition-colors active:scale-95 touch-manipulation`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Social links in mobile menu */}
            <motion.div
              className="mt-auto mb-12 flex justify-center space-x-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.4 }}
            >
              <a href="#" className="text-white/80 hover:text-white p-3">
                <span className="sr-only">Instagram</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="#" className="text-white/80 hover:text-white p-3">
                <span className="sr-only">Twitter</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
