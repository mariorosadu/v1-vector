"use client"

import { motion } from "framer-motion"

export function BrutalistLines() {
  // Generate array of lines with varying positions and heights
  const lines = Array.from({ length: 40 }, (_, i) => {
    const totalLines = 40
    const centerIndex = totalLines / 2
    
    // Calculate horizontal position - spread from left to right
    const xPosition = (i / totalLines) * 100
    
    // Calculate convergence angle - lines converge toward center bottom
    const distanceFromCenter = Math.abs(i - centerIndex)
    const convergenceOffset = distanceFromCenter * 2.5 // Angle of convergence
    
    return {
      id: i,
      left: `${xPosition}%`,
      height: `${60 + Math.random() * 40}%`, // Varying heights
      delay: i * 0.03, // Stagger animation
      rotate: i < centerIndex ? convergenceOffset : -convergenceOffset,
      opacity: 0.3 + Math.random() * 0.4,
    }
  })

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {lines.map((line) => (
        <motion.div
          key={line.id}
          className="absolute top-0 w-[1px] bg-white origin-top"
          style={{
            left: line.left,
            height: line.height,
            opacity: line.opacity,
          }}
          initial={{
            scaleY: 0,
            opacity: 0,
          }}
          animate={{
            scaleY: 1,
            opacity: line.opacity,
          }}
          transition={{
            duration: 1.5,
            delay: line.delay,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      ))}
    </div>
  )
}
