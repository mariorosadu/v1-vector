"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

const navigationItems = [
  { label: "Publications", href: "/publications" },
  { label: "Map", href: "/map" },
  { label: "Profile Analysis", href: "/profile-analysis" },
]

export function NewHeader() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show navbar logo after scrolling 400px (when hero logo is mostly out of view)
      setScrolled(window.scrollY > 400)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      {/* Top Navigation Bar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f]/80 backdrop-blur-md border-b border-white/5"
      >
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Left - Navigation Links (Desktop) / Logo (Mobile) */}
            <div className="flex items-center">
              <img
                src="/images/vector-logo.svg"
                alt="VECTÖR"
                className="h-5 w-auto lg:hidden cursor-pointer"
                onClick={() => router.push("/")}
              />
              <div className="hidden lg:flex items-center gap-8">
                {navigationItems.slice(0, 1).map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => {
                      if (item.href.startsWith('/')) {
                        e.preventDefault()
                        router.push(item.href)
                      }
                    }}
                    className="text-white/60 text-sm tracking-wide hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {scrolled && (
                <motion.button
                  onClick={() => router.push("/")}
                  className="absolute left-1/2 -translate-x-1/2 hover:opacity-80 transition-opacity logo"
                  initial={{ 
                    opacity: 0,
                    y: 40,
                    scale: 1.3,
                    filter: "blur(8px)"
                  }}
                  animate={{ 
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter: "blur(0px)"
                  }}
                  exit={{ 
                    opacity: 0,
                    y: -20,
                    scale: 0.9,
                    filter: "blur(4px)"
                  }}
                  transition={{ 
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for smooth easing
                  }}
                >
                  <motion.div
                    className="relative"
                    initial={{ rotateX: 15 }}
                    animate={{ rotateX: 0 }}
                    transition={{
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  >
                    {/* Chromatic aberration effect layers */}
                    <motion.img
                      src="/images/vector-logo.svg"
                      alt=""
                      className="h-6 sm:h-8 w-auto absolute inset-0 opacity-30"
                      initial={{ x: -2, filter: "hue-rotate(0deg)" }}
                      animate={{ x: 0, filter: "hue-rotate(0deg)" }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      style={{ mixBlendMode: 'screen' }}
                      aria-hidden="true"
                    />
                    <motion.img
                      src="/images/vector-logo.svg"
                      alt=""
                      className="h-6 sm:h-8 w-auto absolute inset-0 opacity-30"
                      initial={{ x: 2, filter: "hue-rotate(180deg)" }}
                      animate={{ x: 0, filter: "hue-rotate(0deg)" }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      style={{ mixBlendMode: 'screen' }}
                      aria-hidden="true"
                    />
                    {/* Main logo */}
                    <img
                      src="/images/vector-logo.svg"
                      alt="VECTÖR"
                      className="h-6 sm:h-8 w-auto relative"
                    />
                  </motion.div>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Right - Navigation Links (Desktop) / Menu Button (Mobile) */}
            <div className="flex items-center gap-8">
              <div className="hidden lg:flex items-center gap-8">
                {navigationItems.slice(1).map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => {
                      if (item.href.startsWith('/')) {
                        e.preventDefault()
                        router.push(item.href)
                      }
                    }}
                    className="text-white/60 text-sm tracking-wide hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden text-white/60 hover:text-white transition-colors"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {menuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#0f0f0f] z-[60] lg:hidden flex flex-col"
          >
            {/* Header with close button */}
            <div 
              className="flex items-center justify-between px-6 border-b border-white/10"
              style={{ 
                paddingTop: 'max(env(safe-area-inset-top), 16px)',
                minHeight: '64px',
              }}
            >
              <img
                src="/images/vector-logo.svg"
                alt="VECTÖR"
                className="h-5 w-auto"
              />
              <button
                onClick={() => setMenuOpen(false)}
                className="text-white/60 hover:text-white transition-colors p-2 -mr-2"
                aria-label="Close menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            
            {/* Navigation links */}
            <nav 
              className="flex-1 overflow-y-auto px-6 py-8"
              style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 32px)' }}
            >
              <ul className="space-y-1">
                {navigationItems.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      onClick={(e) => {
                        setMenuOpen(false)
                        if (item.href.startsWith('/')) {
                          e.preventDefault()
                          router.push(item.href)
                        }
                      }}
                      className="block text-white text-lg font-light tracking-wide hover:text-white/60 transition-colors py-4 border-b border-white/5"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section with Large Logo */}
      <section className="relative min-h-[80vh] bg-[#0f0f0f] flex items-center justify-center pt-16">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center">
            {/* Large Central Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="mb-12 flex justify-center"
            >
              <img
                src="/images/vector-logo.svg"
                alt="VECTÖR"
                className="w-full max-w-3xl h-auto"
              />
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-white/40 text-xs md:text-sm tracking-[0.3em] uppercase mb-8"
            >
              Human Cognition & AI Decision Intelligence
            </motion.p>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-white/70 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-12"
            >
              Navigate the AI landscape with clarity. We help organizations
              understand human cognition and decision-making processes in the
              age of artificial intelligence.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <a href="/map" className="px-8 py-3 bg-white text-[#0f0f0f] text-sm font-medium tracking-wide hover:bg-white/90 transition-colors inline-block">
                Cognitive Map
              </a>
              <a href="/profile-analysis" className="px-8 py-3 border border-white/20 text-white text-sm tracking-wide hover:bg-white/5 transition-colors inline-block">
                Profile Analysis
              </a>
              <a href="/publications" className="px-8 py-3 border border-white/20 text-white text-sm tracking-wide hover:bg-white/5 transition-colors inline-block">
                Publications
              </a>
            </motion.div>
          </div>
        </div>

        {/* Subtle gradient at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0f0f0f] to-transparent" />
      </section>
    </>
  )
}
