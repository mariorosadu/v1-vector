"use client"

import { motion } from "framer-motion"

interface InfoCardProps {
  title: string
  description: string
  index: number
}

export function InfoCard({ title, description, index }: InfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.8,
        delay: 0.5 + index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="relative pl-4 border-l border-white/30 py-2"
    >
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          duration: 0.6,
          delay: 0.3 + index * 0.15,
          ease: "easeOut",
        }}
        className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-white/60 via-white/30 to-transparent origin-top"
      />
      <h3 className="text-white text-sm md:text-base font-medium tracking-wide mb-1">
        {title}
      </h3>
      <p className="text-white/50 text-xs md:text-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}
