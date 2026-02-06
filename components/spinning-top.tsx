"use client"

import { motion } from "framer-motion"
import Image from "next/image"

interface SpinningTopProps {
  size?: number
  isActive?: boolean
  className?: string
}

export function SpinningTop({ size = 160, isActive = false, className = "" }: SpinningTopProps) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer glow pulse when active */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Spinning top image with 3D rotation */}
      <motion.div
        className="relative"
        style={{ width: size * 0.85, height: size * 0.85 }}
        animate={
          isActive
            ? {
                rotateY: [0, 360],
                rotateZ: [-3, 3, -3],
              }
            : {
                rotateY: [0, 360],
                rotateZ: [-1, 1, -1],
              }
        }
        transition={
          isActive
            ? {
                rotateY: {
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "linear",
                },
                rotateZ: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }
            : {
                rotateY: {
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                },
                rotateZ: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }
        }
      >
        <Image
          src="/images/spinning-top.png"
          alt="Spinning top"
          width={Math.round(size * 0.85)}
          height={Math.round(size * 0.85)}
          className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]"
          priority
        />
      </motion.div>

      {/* Active listening ring */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full border border-white/20"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      )}
    </div>
  )
}
