"use client"

import { motion } from "framer-motion"

export function BrutalistLines() {
  // Dramatic light beams radiating from center
  const beams = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * 360
    return {
      id: i,
      angle,
      delay: i * 0.05,
      length: 100 + Math.random() * 50,
    }
  })

  // Large explosive particles
  const explosiveParticles = Array.from({ length: 50 }, (_, i) => {
    const angle = (i / 50) * Math.PI * 2
    const distance = 200 + Math.random() * 400
    
    return {
      id: i,
      angle,
      distance,
      size: 4 + Math.random() * 12,
      delay: Math.random() * 0.5,
    }
  })

  // Distorted grid
  const gridLines = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    position: (i / 20) * 100,
    delay: i * 0.02,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Dramatic light beams */}
      {beams.map((beam) => (
        <motion.div
          key={`beam-${beam.id}`}
          className="absolute top-1/2 left-1/2 origin-left"
          style={{
            transform: `rotate(${beam.angle}deg)`,
            width: `${beam.length}%`,
            height: '2px',
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ 
            scaleX: [0, 1, 0.8, 1],
            opacity: [0, 0.3, 0.1, 0.2],
          }}
          transition={{
            duration: 3,
            delay: beam.delay,
            repeat: Infinity,
            repeatDelay: 2,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent" 
               style={{ filter: 'blur(1px)' }} />
        </motion.div>
      ))}

      {/* Explosive particle burst */}
      {explosiveParticles.map((particle) => (
        <motion.div
          key={`particle-${particle.id}`}
          className="absolute top-1/2 left-1/2 rounded-full bg-white"
          style={{
            width: particle.size,
            height: particle.size,
          }}
          initial={{ 
            x: 0, 
            y: 0,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            x: Math.cos(particle.angle) * particle.distance,
            y: Math.sin(particle.angle) * particle.distance,
            opacity: [0, 1, 0.5, 0],
            scale: [0, 1.5, 1, 0.5],
          }}
          transition={{
            duration: 4,
            delay: particle.delay,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Distorted perspective grid - vertical */}
      {gridLines.map((line) => (
        <motion.div
          key={`v-grid-${line.id}`}
          className="absolute top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent"
          style={{ left: `${line.position}%` }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{
            scaleY: [0, 1, 0.95, 1],
            opacity: [0, 0.3, 0.15, 0.2],
            x: [0, -10, 5, 0],
          }}
          transition={{
            duration: 2.5,
            delay: line.delay,
            repeat: Infinity,
            repeatDelay: 4,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Distorted perspective grid - horizontal */}
      {gridLines.map((line) => (
        <motion.div
          key={`h-grid-${line.id}`}
          className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{ top: `${line.position}%` }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{
            scaleX: [0, 1, 0.95, 1],
            opacity: [0, 0.3, 0.15, 0.2],
            y: [0, -10, 5, 0],
          }}
          transition={{
            duration: 2.5,
            delay: line.delay + 0.1,
            repeat: Infinity,
            repeatDelay: 4,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Massive pulsing aura */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 30%, transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}
