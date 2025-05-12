'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll position for header appearance
  const { scrollY } = useScroll();
  const headerBackgroundOpacity = useTransform(scrollY, [0, 50], [0.5, 0.9]);
  const headerBorderOpacity = useTransform(scrollY, [0, 50], [0, 1]);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
          backgroundColor: scrolled ? 'rgba(0, 0, 0, 0.6)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
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
                <span className="font-mono text-xs md:text-sm align-top ml-0.5 opacity-70">.org</span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8 font-mono text-sm tracking-wider">
              {[
                { path: '/gallery', label: 'GALLERY' },
                { path: '/about', label: 'ABOUT' },
                { path: '/contact', label: 'CONTACT' }
              ].map((item) => (
                <Link
                  key={item.path}
                  href={item.path as any}
                  className="group relative px-1 py-2"
                >
                  <span className={`relative z-10 ${
                    isActive(item.path)
                      ? 'text-white'
                      : 'text-gray-300 group-hover:text-white'
                  } transition-colors duration-300`}>
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
              onClick={() => setMobileMenuOpen(prev => !prev)}
            >
              <span className="sr-only">Open main menu</span>
              <div className="relative w-6 h-6">
                <span 
                  className={`absolute block h-0.5 bg-white transform transition-all duration-300 ease-in-out rounded-full ${
                    mobileMenuOpen ? 'rotate-45 top-3' : 'top-2'
                  }`} 
                  style={{ width: '24px' }}
                />
                <span 
                  className={`absolute block h-0.5 bg-white transform transition-all duration-300 ease-in-out rounded-full ${
                    mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`} 
                  style={{ width: '24px', top: '12px' }}
                />
                <span 
                  className={`absolute block h-0.5 bg-white transform transition-all duration-300 ease-in-out rounded-full ${
                    mobileMenuOpen ? '-rotate-45 top-3' : 'top-4'
                  }`} 
                  style={{ width: '24px' }}
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
            <div className="flex flex-col items-center space-y-6 pt-8 px-6">
              {[
                { path: '/gallery', label: 'GALLERY' },
                { path: '/about', label: 'ABOUT' },
                { path: '/contact', label: 'CONTACT' }
              ].map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Link 
                    href={item.path as any}
                    className={`text-2xl font-mono ${
                      isActive(item.path) 
                        ? 'text-white border-b border-white' 
                        : 'text-gray-400'
                    } hover:text-white transition-colors`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
