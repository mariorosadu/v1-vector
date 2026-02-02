"use client"

import { motion } from "framer-motion"

export function BrutalistLines() {
  // Generate array of horizontal lines with varying positions and widths
  const lines = Array.from({ length: 30 }, (_, i) => {
    const totalLines = 30
    const centerIndex = totalLines / 2
    
    // Calculate vertical position - spread from top to bottom
    const yPosition = (i / totalLines) * 100
    
    // Calculate width variation - lines converge toward center
    const distanceFromCenter = Math.abs(i - centerIndex)
    const widthReduction = distanceFromCenter * 1.5
    const width = Math.max(40, 90 - widthReduction)
    
    return {
      id: i,
      top: `${yPosition}%`,
      width: `${width}%`, // Varying widths
      delay: i * 0.08, // Slower stagger for comfort
      opacity: 0.15 + Math.random() * 0.2, // Softer opacity
    }
  })

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {lines.map((line) => (
        <motion.div
          key={line.id}
          className="absolute left-0 h-[1px] bg-white origin-left"
          style={{
            top: line.top,
            width: line.width,
            opacity: line.opacity,
          }}
          initial={{
            scaleX: 0,
            x: -100,
            opacity: 0,
          }}
          animate={{
            scaleX: 1,
            x: 0,
            opacity: line.opacity,
          }}
          transition={{
            duration: 3.5,
            delay: line.delay,
            ease: [0.25, 0.1, 0.25, 1], // Smooth, comforting easing
          }}
        />
      ))}
    </div>
  )
}
