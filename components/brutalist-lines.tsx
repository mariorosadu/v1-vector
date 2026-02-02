"use client"

import { motion } from "framer-motion"

export function BrutalistLines() {
  // Generate sophisticated particle field with depth and movement
  const particles = Array.from({ length: 80 }, (_, i) => {
    const size = Math.random() * 3 + 1 // 1-4px
    const depth = Math.random() // 0-1 for layering
    
    return {
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size,
      depth,
      delay: Math.random() * 2,
      duration: 15 + Math.random() * 10, // 15-25s slow drift
      opacity: 0.1 + depth * 0.4, // Closer particles are brighter
      blur: (1 - depth) * 2, // Further particles are blurrier
    }
  })

  // Generate floating geometric wireframes
  const geometries = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: 20 + i * 15,
    y: 20 + (i % 2) * 40,
    size: 60 + Math.random() * 100,
    rotation: Math.random() * 360,
    delay: i * 0.5,
    duration: 20 + Math.random() * 10,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.opacity,
            filter: `blur(${particle.blur}px)`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating geometric wireframes */}
      {geometries.map((geo) => (
        <motion.div
          key={`geo-${geo.id}`}
          className="absolute border border-white/10"
          style={{
            left: `${geo.x}%`,
            top: `${geo.y}%`,
            width: geo.size,
            height: geo.size,
          }}
          animate={{
            rotate: [geo.rotation, geo.rotation + 360],
            y: [0, -20, 0],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: geo.duration,
            delay: geo.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Radial gradient glow emanating from center */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}
