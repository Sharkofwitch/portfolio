"use client";

import { motion } from "framer-motion";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-auto py-8 sm:py-16 bg-gradient-to-b from-gray-900/0 to-gray-900/10 dark:from-black/0 dark:to-black/80 border-t border-gray-200/10 dark:border-gray-800/20 safe-bottom"
    >
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.8 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10 pb-8 sm:pb-12 border-b border-white/5 dark:border-white/5">
          {/* Brand */}
          <motion.div variants={item} className="flex flex-col space-y-4">
            <h3 className="font-serif text-3xl text-gray-900 dark:text-white">
              szark
              <span className="font-mono text-xs align-top opacity-70">
                .org
              </span>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 font-light max-w-xs">
              Capturing modern nostalgia through digital and analog photography
              since 2024.
            </p>
          </motion.div>

          {/* Links */}
          <motion.div variants={item} className="flex flex-col space-y-4">
            <h4 className="font-mono text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/gallery", label: "Gallery" },
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 relative group inline-block py-1 touch-manipulation no-tap-highlight"
                  >
                    {link.label}
                    <span className="absolute left-0 bottom-0 w-full h-px bg-gray-900/0 dark:bg-white/0 group-hover:bg-gray-900/40 dark:group-hover:bg-white/40 transition-all duration-300 transform origin-left scale-x-0 group-hover:scale-x-100"></span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social */}
          <motion.div variants={item} className="flex flex-col space-y-4">
            <h4 className="font-mono text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Connect
            </h4>
            <div className="flex flex-col space-y-2">
              <a
                href="https://instagram.com/jakob.szrk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors inline-flex items-center group touch-manipulation no-tap-highlight py-1"
              >
                <span className="w-8 h-8 sm:w-6 sm:h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-3 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 2.163c-3.151 0-3.5.014-4.735.07-2.275.105-3.325 1.196-3.429 3.429-.057 1.234-.07 1.583-.07 4.735s.014 3.5.07 4.735c.104 2.229 1.15 3.325 3.429 3.429 1.234.057 1.583.07 4.735.07s3.5-.014 4.736-.07c2.271-.104 3.325-1.196 3.428-3.429.057-1.235.07-1.584.07-4.735s-.014-3.5-.07-4.735c-.104-2.229-1.153-3.325-3.428-3.429-1.236-.057-1.585-.07-4.736-.07zm0 13.737a5.737 5.737 0 110-11.474 5.737 5.737 0 010 11.474zm0-9.557a3.82 3.82 0 100 7.64 3.82 3.82 0 000-7.64zm6.105-1.789a1.341 1.341 0 110 2.682 1.341 1.341 0 010-2.682z" />
                  </svg>
                </span>
                Instagram
              </a>
            </div>
          </motion.div>
        </div>

        <div className="pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center">
          <motion.p
            variants={item}
            className="text-gray-500 dark:text-gray-500 text-xs sm:text-sm mb-4 md:mb-0"
          >
            © {currentYear} szark.org. All rights reserved.
          </motion.p>

          <motion.div
            variants={item}
            className="flex space-x-6 text-xs sm:text-sm text-gray-500 dark:text-gray-500"
          >
            <a
              href="#"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors touch-manipulation mobile-touch-target flex items-center justify-center"
            >
              Privacy
            </a>
            <a
              href="#"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors touch-manipulation mobile-touch-target flex items-center justify-center"
            >
              Terms
            </a>
          </motion.div>
        </div>
      </motion.div>
    </motion.footer>
  );
}
