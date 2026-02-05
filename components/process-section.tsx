"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

const processes = [
  {
    number: "01",
    title: "Cognitive Mapping",
    description:
      "We analyze existing decision-making patterns within your organization, identifying cognitive biases and information processing gaps in AI interactions.",
  },
  {
    number: "02",
    title: "Framework Development",
    description:
      "Custom frameworks are designed to align human intuition with AI outputs, creating seamless integration between human judgment and machine intelligence.",
  },
  {
    number: "03",
    title: "Implementation Strategy",
    description:
      "Systematic deployment of cognitive orientation protocols, including training, feedback loops, and continuous optimization mechanisms.",
  },
  {
    number: "04",
    title: "Continuous Evolution",
    description:
      "Ongoing refinement based on behavioral data and emerging AI capabilities, ensuring your organization stays ahead of the cognitive curve.",
  },
]

export function ProcessSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative py-32 bg-[#0a0a0a]" style={{ scrollMarginTop: '64px' }}>
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <p className="text-white/40 text-xs tracking-[0.3em] uppercase mb-4">
            Our Process
          </p>
          <h2
            className="text-2xl md:text-4xl font-light text-white leading-tight tracking-tight max-w-xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <span className="text-balance">
              A systematic approach to cognitive orientation
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {processes.map((process, index) => (
            <motion.div
              key={process.number}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
              className="relative group"
            >
              <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10 group-hover:bg-white/30 transition-colors duration-500" />
              <div className="pl-8">
                <span className="text-white/20 text-xs tracking-widest">
                  {process.number}
                </span>
                <h3
                  className="text-lg md:text-xl text-white mt-2 mb-3"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {process.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {process.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decorative lines */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-px bg-gradient-to-l from-transparent via-white/10 to-transparent" />
    </section>
  )
}
