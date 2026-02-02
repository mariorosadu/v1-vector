"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import TransparentLogo from "./TransparentLogo" // Import the TransparentLogo component

export function Footer() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <footer ref={ref} className="relative py-24 bg-[#0f0f0f] border-t border-white/5">
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
              alt="VECTÖR Logo"
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
              {["Publications", "Case Studies", "Methodology", "Data"].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-white/60 text-sm hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h4 className="text-white/40 text-xs tracking-[0.2em] uppercase mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {["About", "Team", "Careers", "Contact"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-white/60 text-sm hover:text-white transition-colors"
                  >
                    {item}
                  </a>
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
            {new Date().getFullYear()} VECTÖR. All rights reserved.
          </p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <a
              href="#"
              className="text-white/30 text-xs hover:text-white/60 transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-white/30 text-xs hover:text-white/60 transition-colors"
            >
              Terms
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
