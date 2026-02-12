"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

export function AboutSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative py-16 md:py-32 bg-[#0f0f0f]" style={{ scrollMarginTop: '64px' }}>
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-white/40 text-xs tracking-[0.3em] uppercase mb-4"
            >
              About VEKTHÖS
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-2xl md:text-4xl font-light text-white leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <span className="text-balance">
                Bridging human intuition and machine intelligence
              </span>
            </motion.h2>
          </div>

          <div className="space-y-6">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-white/60 text-sm md:text-base leading-relaxed"
            >
              In an era where artificial intelligence shapes every decision, understanding how humans process, interpret, and act on AI-generated information has become paramount. VEKTHÖS provides the cognitive frameworks necessary for organizations to navigate this complexity.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-white/60 text-sm md:text-base leading-relaxed"
            >
              Our approach synthesizes behavioral science, cognitive psychology, and systems thinking to create actionable strategies that align human decision-making with AI capabilities.
            </motion.p>
          </div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 border-t border-white/10 pt-12"
        >
          {[
            { value: "47", label: "Research Papers" },
            { value: "12k+", label: "Decisions Analyzed" },
            { value: "89%", label: "Accuracy Improvement" },
            { value: "15+", label: "Organizations" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
            >
              <p
                className="text-3xl md:text-4xl font-light text-white mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {stat.value}
              </p>
              <p className="text-white/40 text-xs tracking-wide uppercase">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
