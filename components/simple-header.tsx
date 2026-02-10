"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

const navigationItems = [
  { label: "Prototype", href: "/prototype" },
  { label: "Publications", href: "/publications" },
  { 
    label: "Toy Box", 
    href: "/box",
    submenu: [
      { label: "Profile Analysis", href: "/box/profile-analysis" },
      { label: "Cognitive Map", href: "/box/map" },
      { label: "Metacognition", href: "/box/metacognition" },
    ]
  },
]

export function SimpleHeader() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f]/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Left - Logo (Mobile only, desktop logo is centered) */}
            <div className="flex items-center">
              <img
                src="/images/vector-logo-full.svg"
                alt="VECTÖR"
                className="h-5 w-auto lg:hidden cursor-pointer"
                onClick={() => router.push("/")}
              />
            </div>

            {/* Center - Logo (Desktop only) */}
            <motion.button
              onClick={() => router.push("/")}
              className="hidden lg:block hover:opacity-80 transition-opacity cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <img
                src="/images/vector-logo.svg"
                alt="VECTÖR"
                className="h-8 w-auto"
              />
            </motion.button>

            {/* Right - All Navigation Links (Desktop) / Menu Button (Mobile) */}
            <div className="flex items-center gap-8">
              <div className="hidden lg:flex items-center gap-8">
                {navigationItems.map((item) => (
                  item.submenu ? (
                    <div 
                      key={item.label}
                      className="relative"
                      onMouseEnter={() => setDropdownOpen(true)}
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          router.push(item.href)
                        }}
                        className="text-white/60 text-sm tracking-wide hover:text-white transition-colors flex items-center gap-1"
                      >
                        {item.label}
                        <svg className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <AnimatePresence>
                        {dropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full right-0 mt-2 w-48 bg-[#0f0f0f] border border-white/10 rounded-lg shadow-xl overflow-hidden"
                          >
                            {item.submenu.map((subItem) => (
                              <a
                                key={subItem.label}
                                href={subItem.href}
                                onClick={(e) => {
                                  e.preventDefault()
                                  router.push(subItem.href)
                                  setDropdownOpen(false)
                                }}
                                className="block px-4 py-3 text-white/60 text-sm hover:bg-white/5 hover:text-white transition-colors"
                              >
                                {subItem.label}
                              </a>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
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
                  )
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
                    {item.submenu ? (
                      <div>
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
                        <ul className="pl-4 space-y-1">
                          {item.submenu.map((subItem) => (
                            <li key={subItem.label}>
                              <a
                                href={subItem.href}
                                onClick={(e) => {
                                  setMenuOpen(false)
                                  if (subItem.href.startsWith('/')) {
                                    e.preventDefault()
                                    router.push(subItem.href)
                                  }
                                }}
                                className="block text-white/60 text-base font-light tracking-wide hover:text-white transition-colors py-3 border-b border-white/5"
                              >
                                {subItem.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
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
                    )}
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
