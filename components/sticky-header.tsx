"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { TransparentLogo } from "./transparent-logo"
import { Menu, X } from "lucide-react"

const navigationItems = [
  { label: "Publications", href: "#publications" },
  { label: "Case Studies", href: "#case-studies" },
  { label: "Methodology", href: "#methodology" },
  { label: "Data", href: "#data" },
  { label: "Map", href: "/map" },
]

export function StickyHeader() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY
      setScrolled(offset > 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{
          backgroundColor: scrolled
            ? "rgba(15, 15, 15, 0.95)"
            : "rgba(15, 15, 15, 0)",
        }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "backdrop-blur-lg border-b border-white/10" : ""
        }`}
      >
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between py-3 md:py-8 lg:py-12">
            {/* Menu Button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors z-50 relative"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
              <span className="text-sm tracking-wide hidden md:inline">
                Menu
              </span>
            </motion.button>

            {/* Logo - centered, no scaling */}
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{ duration: 0.3 }}
              onClick={() => router.push("/")}
              className="absolute left-1/2 -translate-x-1/2 cursor-pointer hover:opacity-80 transition-opacity"
              aria-label="Go to home"
            >
              <TransparentLogo
                src="/images/vector-logo.png"
                alt="VECTÖR Logo"
                className="h-20 md:h-48 lg:h-96 w-auto"
                threshold={40}
              />
            </motion.button>

            {/* Spacer for balance */}
            <div className="w-20" />
          </div>
        </div>
      </motion.header>

      {/* Navigation Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-[#0f0f0f]/98 backdrop-blur-xl z-40"
            onClick={() => setMenuOpen(false)}
          >
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col items-center justify-center h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <ul className="space-y-8 text-center">
                {navigationItems.map((item, index) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                  >
                    <a
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="text-white text-4xl md:text-6xl font-light tracking-tight hover:text-white/60 transition-colors"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </ul>

              {/* Decorative line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                exit={{ scaleX: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-16 w-64 h-px bg-white/20"
              />

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                className="mt-8 text-white/40 text-sm tracking-[0.3em] uppercase"
              >
                Human Cognition & AI Intelligence
              </motion.p>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
