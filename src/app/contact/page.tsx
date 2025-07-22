"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useRef } from "react";

export default function ContactPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const formScale = useTransform(scrollYProgress, [0, 0.5], [0.98, 1]);
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.5], [0.5, 0.7]);

  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // Form submitted successfully
      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
      setIsSubmitting(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div
      className="min-h-screen bg-white dark:bg-black overflow-hidden"
      ref={containerRef}
    >
      {/* Decorative elements */}
      <motion.div
        className="fixed top-[20%] left-[10%] w-32 h-32 rounded-full bg-blue-400/10 dark:bg-blue-400/5 blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="fixed top-[30%] right-[15%] w-48 h-48 rounded-full bg-purple-400/10 dark:bg-purple-400/5 blur-3xl"
        animate={{
          x: [0, -20, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 relative">
        <motion.div
          style={{
            scale: formScale,
            backgroundColor: `rgba(0, 0, 0, ${backgroundOpacity})`,
          }}
          className="bg-white/80 dark:bg-black/30 backdrop-blur-xl rounded-2xl p-8 md:p-12 shadow-apple dark:shadow-apple-dark border border-gray-200/20 dark:border-gray-800/20"
        >
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-xl mx-auto"
          >
            <motion.div variants={item} className="text-center">
              <span className="inline-block font-mono text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800/40 text-gray-600 dark:text-gray-400 mb-4">
                GET IN TOUCH
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-3xl md:text-4xl font-serif mb-4 text-gray-900 dark:text-white text-center tracking-tight"
            >
              Let&apos;s Connect
            </motion.h1>

            <motion.p
              variants={item}
              className="text-center text-gray-600 dark:text-gray-300 mb-10 font-light"
            >
              Whether you&apos;re interested in prints, collaborations, or just
              want to share your thoughts about photography, I&apos;d love to
              hear from you.
            </motion.p>

            {!isSubmitted ? (
              <motion.form
                variants={container}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <motion.div
                  variants={item}
                  className="grid md:grid-cols-2 gap-6"
                >
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="block font-mono text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formState.name}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                      className="w-full px-4 py-3 bg-white/80 dark:bg-black/50 border border-gray-200/30 dark:border-gray-700/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/20 dark:focus:ring-gray-600/30 text-gray-900 dark:text-white transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block font-mono text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formState.email}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                      className="w-full px-4 py-3 bg-white/80 dark:bg-black/50 border border-gray-200/30 dark:border-gray-700/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/20 dark:focus:ring-gray-600/30 text-gray-900 dark:text-white transition-all duration-300"
                    />
                  </div>
                </motion.div>

                <motion.div variants={item} className="space-y-2">
                  <label
                    htmlFor="subject"
                    className="block font-mono text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formState.subject}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-4 py-3 bg-white/80 dark:bg-black/50 border border-gray-200/30 dark:border-gray-700/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/20 dark:focus:ring-gray-600/30 text-gray-900 dark:text-white transition-all duration-300"
                  />
                </motion.div>

                <motion.div variants={item} className="space-y-2">
                  <label
                    htmlFor="message"
                    className="block font-mono text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formState.message}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-white/80 dark:bg-black/50 border border-gray-200/30 dark:border-gray-700/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/20 dark:focus:ring-gray-600/30 text-gray-900 dark:text-white resize-none transition-all duration-300"
                  ></textarea>
                </motion.div>

                {error && (
                  <motion.div
                    variants={item}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.div
                  variants={item}
                  className="text-center pt-4"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white dark:text-black dark:from-blue-200 dark:to-emerald-200 hover:from-blue-600 hover:to-emerald-600 dark:hover:from-blue-300 dark:hover:to-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 rounded-xl font-mono text-sm tracking-wider shadow-lg hover:shadow-2xl relative overflow-hidden group focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {isSubmitting && (
                        <svg
                          className="animate-spin h-4 w-4 text-white dark:text-black"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          ></path>
                        </svg>
                      )}
                      {isSubmitting ? "SENDING..." : "SEND MESSAGE"}
                    </span>
                    <motion.span className="absolute inset-0 bg-gradient-to-r from-blue-700/20 to-emerald-700/20 dark:from-blue-200/20 dark:to-emerald-200/20 opacity-0 group-hover:opacity-100 duration-300 transition-opacity"></motion.span>
                  </button>
                </motion.div>
                {/* Floating mail icon for detail */}
                <motion.div
                  className="fixed bottom-8 right-8 z-20 pointer-events-none select-none"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 0.18, y: 0 }}
                  transition={{ duration: 1.2, delay: 1 }}
                  whileHover={{ opacity: 0.3, scale: 1.05 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 48 48"
                    className="w-16 h-16 text-blue-400 dark:text-blue-200 animate-float"
                  >
                    <rect
                      x="6"
                      y="14"
                      width="36"
                      height="20"
                      rx="5"
                      fill="currentColor"
                      opacity="0.2"
                    />
                    <path
                      d="M8 16l16 12L40 16"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      opacity="0.5"
                    />
                  </svg>
                </motion.div>
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="text-center py-10"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 10, stiffness: 100 }}
                  className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <svg
                    className="w-8 h-8 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>
                <h2 className="text-2xl font-serif text-gray-900 dark:text-white mb-3">
                  Message Sent!
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Thank you for reaching out. I&apos;ll get back to you as soon
                  as possible.
                </p>
                <button
                  onClick={() => {
                    setFormState({
                      name: "",
                      email: "",
                      subject: "",
                      message: "",
                    });
                    setIsSubmitted(false);
                  }}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline"
                >
                  Send another message
                </button>
              </motion.div>
            )}

            <motion.div
              variants={item}
              className="mt-12 text-center font-mono text-sm text-gray-600 dark:text-gray-400"
            >
              <div className="flex items-center justify-center gap-4">
                <div className="w-8 h-px bg-gray-300 dark:bg-gray-700"></div>
                <span>Alternatively</span>
                <div className="w-8 h-px bg-gray-300 dark:bg-gray-700"></div>
              </div>
              <motion.div className="mt-4" whileHover={{ scale: 1.05 }}>
                <a
                  href="mailto:contact@szark.org"
                  className="inline-block hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
                >
                  contact@szark.org
                </a>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
