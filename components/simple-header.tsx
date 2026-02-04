"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

const navigationItems = [
  { label: "Publications", href: "#publications" },
  { label: "Case Studies", href: "#case-studies" },
  { label: "Methodology", href: "#methodology" },
  { label: "Data", href: "#data" },
  { label: "Map", href: "/map" },
  { label: "Profile Analysis", href: "/profile-analysis" },
]

export function SimpleHeader() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

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
            {/* Left - Navigation Links (Desktop) */}
            <div className="hidden lg:flex items-center gap-8">
              {navigationItems.slice(0, 3).map((item) => (
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

            {/* Center - Logo */}
            <motion.button
              onClick={() => router.push("/")}
              className="hover:opacity-80 transition-opacity"
              whileHover={{ scale: 1.05 }}
            >
              <img
                src="/images/vector-logo.svg"
                alt="VECTÖR"
                className="h-8 w-auto"
              />
            </motion.button>

            {/* Mobile - Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-white/60 hover:text-white transition-colors"
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

            {/* Right - Navigation Links (Desktop) */}
            <div className="hidden lg:flex items-center gap-8">
              {navigationItems.slice(3).map((item) => (
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

            {/* Mobile - Empty spacer for balance */}
            <div className="lg:hidden w-6" />
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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-[#0f0f0f]/98 backdrop-blur-xl z-40 lg:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <nav className="space-y-8">
                {navigationItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <a
                      href={item.href}
                      onClick={(e) => {
                        setMenuOpen(false)
                        if (item.href.startsWith('/')) {
                          e.preventDefault()
                          router.push(item.href)
                        }
                      }}
                      className="block text-white text-4xl font-light tracking-tight hover:text-white/60 transition-colors text-center"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {item.label}
                    </a>
                  </motion.div>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
