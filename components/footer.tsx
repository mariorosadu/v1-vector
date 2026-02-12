"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { useRouter } from "next/navigation"

export function Footer() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const router = useRouter()

  const handleNavigation = (href: string) => {
    if (href.startsWith('#')) {
      // For anchor links, scroll to section
      const element = document.getElementById(href.slice(1))
      element?.scrollIntoView({ behavior: 'smooth' })
    } else {
      // For page navigation
      router.push(href)
    }
  }

  return (
    <footer ref={ref} className="relative py-12 md:py-24 bg-[#0f0f0f] border-t border-white/5">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="md:col-span-2"
          >
            <img
              src="/images/vector-logo.svg"
              alt="VEKTHÖS Logo"
              className="h-8 w-auto mb-6"
            />
            <p className="text-white/50 text-sm leading-relaxed max-w-sm">
              Navigating the intersection of human cognition and artificial
              intelligence. Building frameworks for the future of decision-making.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <h4 className="text-white/40 text-xs tracking-[0.2em] uppercase mb-4">
              Research
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Publications", href: "/publications" }
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className="text-white/60 text-sm hover:text-white transition-colors text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h4 className="text-white/40 text-xs tracking-[0.2em] uppercase mb-4">
              Tools
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Cognitive Map", href: "/box/map" },
                { label: "Voice Flux", href: "/box/voiceflux" },
                { label: "Profile Analysis", href: "/box/profile-analysis" },
                { label: "Metacognition", href: "/box/metacognition" }
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className="text-white/60 text-sm hover:text-white transition-colors text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h4 className="text-white/40 text-xs tracking-[0.2em] uppercase mb-4">
              Connect
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Contact", href: "/contact" }
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className="text-white/60 text-sm hover:text-white transition-colors text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5"
        >
          <p className="text-white/30 text-xs">
            {new Date().getFullYear()} VEKTHÖS. All rights reserved.
          </p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <button
              onClick={() => handleNavigation("/privacy")}
              className="text-white/30 text-xs hover:text-white/60 transition-colors"
            >
              Privacy
            </button>
            <button
              onClick={() => handleNavigation("/terms")}
              className="text-white/30 text-xs hover:text-white/60 transition-colors"
            >
              Terms
            </button>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
