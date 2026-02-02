"use client"

import { motion } from "framer-motion"
import { AnimatedLines } from "./animated-lines"
import { InfoCard } from "./info-card"

const categories = [
  {
    title: "Cognitive Architecture",
    description: "Understanding how humans process and structure AI-generated information",
    y: 0.28,
  },
  {
    title: "Decision Frameworks",
    description: "Systematic approaches to AI-assisted decision making",
    y: 0.40,
  },
  {
    title: "Information Synthesis",
    description: "Merging human intuition with machine intelligence",
    y: 0.52,
  },
  {
    title: "Behavioral Patterns",
    description: "Mapping cognitive responses to AI interactions",
    y: 0.64,
  },
  {
    title: "Strategic Orientation",
    description: "Navigating complexity in the evolving AI landscape",
    y: 0.76,
  },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen bg-[#0f0f0f] overflow-hidden">
      {/* Animated background lines */}
      <AnimatedLines
        targets={categories.map((cat) => ({ label: cat.title, y: cat.y }))}
        linesPerTarget={12}
      />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Main headline */}
            <div className="lg:pl-8">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-white/40 text-xs md:text-sm tracking-[0.3em] uppercase mb-4"
              >
                Human Cognition & AI Intelligence
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="text-3xl md:text-5xl lg:text-6xl font-light text-white leading-tight tracking-tight mb-6"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <span className="text-balance">
                  Navigate the AI landscape with{" "}
                  <span className="text-white/80">clarity</span>
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-white/50 text-sm md:text-base leading-relaxed max-w-md"
              >
                We help organizations understand the intersection of human
                decision-making processes and artificial intelligence, creating
                frameworks for cognitive orientation in complex systems.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mt-8 flex items-center gap-6"
              >
                <button className="px-6 py-3 bg-white text-[#0f0f0f] text-sm font-medium tracking-wide hover:bg-white/90 transition-colors">
                  Explore Framework
                </button>
                <button className="text-white/60 text-sm tracking-wide hover:text-white transition-colors flex items-center gap-2">
                  Learn More
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </button>
              </motion.div>
            </div>

            {/* Right side - Info cards aligned with lines */}
            <div className="hidden lg:flex flex-col justify-center space-y-6 pl-12">
              {categories.map((category, index) => (
                <InfoCard
                  key={category.title}
                  title={category.title}
                  description={category.description}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile info cards */}
      <div className="lg:hidden relative z-10 px-6 pb-16">
        <div className="space-y-4">
          {categories.map((category, index) => (
            <InfoCard
              key={category.title}
              title={category.title}
              description={category.description}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0f0f0f] to-transparent z-0" />
    </section>
  )
}
