"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

const navigationItems = [
  { label: "Publications", href: "/publications" },
  { label: "Map", href: "/map" },
  { label: "Profile Analysis", href: "/profile-analysis" },
]

export function SimpleHeader() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f]/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Left - Logo (Mobile) / Navigation Links (Desktop) */}
            <div className="flex items-center">
              <img
                src="/images/vector-logo-full.svg"
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

            {/* Center - Logo (Desktop only) */}
            <motion.button
              onClick={() => router.push("/")}
              className="hidden lg:block hover:opacity-80 transition-opacity"
              whileHover={{ scale: 1.05 }}
            >
              <img
                src="/images/vector-logo.svg"
                alt="VECTÖR"
                className="h-8 w-auto"
              />
            </motion.button>

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
      </nav>

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
                src="/images/vector-logo-full.svg"
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
    </>
  )
}
