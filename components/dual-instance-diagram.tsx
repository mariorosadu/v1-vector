"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import {
  Shield,
  Scale,
  Lock,
  Zap,
  Fingerprint,
  Target,
  ChevronDown,
  AlertCircle,
  LockKeyhole,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const DEFENSIVE_STACK = [
  {
    id: "compliance",
    label: "Compliance",
    icon: Shield,
    explanation:
      "A ceremonial performance of safety. We check boxes in a spreadsheet to ensure that when the system fails, the liability is legally transferred to a third-party contractor who no longer exists.",
  },
  {
    id: "ethics",
    label: "Ethics",
    icon: Scale,
    explanation:
      "The department we 'restructure' first during a recession. Its primary function is to generate high-fidelity PDF reports that explain why our most profitable features are technically 'gray areas'.",
  },
  {
    id: "bias",
    label: "Bias",
    icon: Zap,
    explanation:
      "Statistically significant prejudice automated for maximum efficiency. It turns out that 'optimizing for engagement' is just a fancy way of saying we've taught the machine to amplify our worst human impulses.",
  },
  {
    id: "security",
    label: "Data Security",
    icon: Lock,
    explanation:
      "A shell game played with AWS configurations. We spend millions on encryption only to have the entire database leaked because a senior architect used 'Password123' for the staging environment.",
  },
]

const TOTAL_STEPS = DEFENSIVE_STACK.length + 2

export function DualInstanceDiagram() {
  const [activeStep, setActiveStep] = useState(0)
  const [stepProgress, setStepProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastTouchY = useRef(0)

  const SENSITIVITY = 0.002
  const PROGRESS_GATE = 0.99

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setStepProgress((prevProgress) => {
      const delta = e.deltaY * SENSITIVITY
      const nextProgress = Math.max(0, Math.min(1.1, prevProgress + delta))

      if (prevProgress >= 1 && delta > 0) {
        setActiveStep((s) => {
          if (s < TOTAL_STEPS - 1) {
            setStepProgress(0.01)
            return s + 1
          }
          return s
        })
        return 1
      }

      if (prevProgress <= 0 && delta < 0) {
        setActiveStep((s) => {
          if (s > 0) {
            setStepProgress(0.99)
            return s - 1
          }
          return s
        })
        return 0
      }

      return nextProgress
    })
  }, [])

  const handleTouchStart = (e: TouchEvent) => {
    lastTouchY.current = e.touches[0].clientY
  }

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      const deltaY = lastTouchY.current - e.touches[0].clientY
      handleWheel({ deltaY, preventDefault: () => {} } as unknown as WheelEvent)
      lastTouchY.current = e.touches[0].clientY
    },
    [handleWheel]
  )

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener("wheel", handleWheel, { passive: false })
    el.addEventListener("touchstart", handleTouchStart, { passive: false })
    el.addEventListener("touchmove", handleTouchMove, { passive: false })
    return () => {
      el.removeEventListener("wheel", handleWheel)
      el.removeEventListener("touchstart", handleTouchStart)
      el.removeEventListener("touchmove", handleTouchMove)
    }
  }, [handleWheel, handleTouchMove])

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen bg-[#020202] text-white font-sans antialiased overflow-hidden select-none"
      aria-label="Truth Matrix — Defensive AI Governance Framework"
    >
      {/* Background HUD Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000000_90%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.01),rgba(0,255,0,0.005),rgba(0,0,255,0.01))] [background-size:100%_4px,4px_100%]" />

        {/* Corner Brackets */}
        <div className="absolute inset-8 border border-white/5 opacity-20">
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/40" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/40" />
        </div>
      </div>

      {/* Status HUD — top left */}
      <div className="absolute top-10 left-10 z-50 flex flex-col gap-1 opacity-40">
        <div className="flex items-center gap-3">
          <Target size={12} className="animate-pulse text-cyan-500" />
          <span className="text-[9px] uppercase tracking-[0.5em] font-mono">
            Archive_Oversight_Protocol
          </span>
        </div>
        <div className="text-[7px] font-mono text-white/40">
          AUTH_STATUS: ENFORCED_READ
        </div>
      </div>

      {/* Input pressure HUD — bottom right */}
      <div className="absolute bottom-10 right-10 z-50 flex flex-col items-end gap-3">
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[8px] uppercase tracking-[0.4em] text-white/20 mb-1">
              Input_Pressure
            </div>
            <div className="w-32 h-[2px] bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-cyan-500"
                animate={{ width: `${Math.min(100, stepProgress * 100)}%` }}
              />
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[14px] font-black text-white/10">
              {activeStep + 1}
            </span>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-[10px] font-bold text-cyan-500/40">
              {TOTAL_STEPS}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Gutter — left */}
      <div className="absolute left-10 top-1/2 -translate-y-1/2 flex flex-col gap-10 opacity-20 z-50">
        {[...Array(TOTAL_STEPS)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: activeStep === i ? 1.5 : 1,
              opacity: activeStep === i ? 1 : 0.3,
              backgroundColor: activeStep === i ? "#22d3ee" : "#ffffff",
            }}
            className="w-1 h-1 rounded-full"
          />
        ))}
      </div>

      {/* Content Area */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <AnimatePresence mode="wait">

          {/* STEP 0: INTRO */}
          {activeStep === 0 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center text-center px-10"
            >
              <Fingerprint
                size={64}
                strokeWidth={0.5}
                className="text-white/20 mb-10"
              />
              <h1 className="text-[36px] md:text-[42px] font-black uppercase tracking-[1.2em] mb-4 text-white text-balance">
                Truth Matrix
              </h1>
              <p className="text-[11px] font-mono text-white/30 uppercase tracking-[0.5em] max-w-lg leading-loose">
                Manual scroll intercept active.
                <br />
                You are required to decrypt every defensive vector before the
                arena is unlocked.
              </p>

              <div className="mt-20 flex flex-col items-center gap-4 opacity-40">
                <span className="text-[9px] uppercase tracking-[0.6em] animate-bounce">
                  Apply Scroll Pressure
                </span>
                <ChevronDown size={16} />
              </div>
            </motion.div>
          )}

          {/* STEPS 1–4: THE STACK */}
          {activeStep > 0 && activeStep <= DEFENSIVE_STACK.length && (
            <motion.div
              key={DEFENSIVE_STACK[activeStep - 1].id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center px-10 md:px-16"
            >
              {/* Visual Asset */}
              <div className="flex flex-col items-center md:items-end">
                <div
                  className={`relative p-12 rounded-[2.5rem] border backdrop-blur-3xl transition-all duration-700 ${
                    stepProgress > 0.1
                      ? "border-cyan-500/40 bg-cyan-500/5 shadow-[0_0_50px_rgba(6,182,212,0.1)]"
                      : "border-white/5 bg-white/[0.02]"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[2.5rem] pointer-events-none" />
                  {React.createElement(DEFENSIVE_STACK[activeStep - 1].icon, {
                    size: 64,
                    strokeWidth: 1,
                    className:
                      stepProgress > 0.1 ? "text-cyan-400" : "text-white/10",
                  })}
                </div>
                <h3
                  className={`mt-8 text-[22px] md:text-[28px] font-black uppercase tracking-[0.8em] transition-all duration-500 ${
                    stepProgress > 0.1
                      ? "text-white translate-x-0"
                      : "text-white/10 translate-x-4"
                  }`}
                >
                  {DEFENSIVE_STACK[activeStep - 1].label}
                </h3>
              </div>

              {/* Decrypting Text */}
              <div className="flex flex-col justify-center min-h-[200px] border-l border-white/5 pl-8 md:pl-12">
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-500 ${
                      stepProgress >= 1 ? "bg-cyan-500" : "bg-white/10"
                    }`}
                  />
                  <p className="text-[13px] md:text-[15px] font-mono leading-relaxed tracking-[0.05em] text-white/90 uppercase text-justify">
                    {DEFENSIVE_STACK[activeStep - 1].explanation.substring(
                      0,
                      Math.floor(
                        stepProgress *
                          DEFENSIVE_STACK[activeStep - 1].explanation.length
                      )
                    )}
                    {stepProgress < 1 && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.4 }}
                        className="inline-block w-2 h-5 bg-cyan-500 ml-1 align-middle"
                      />
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-6">
                  <div className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em]">
                    Vector_Status:
                  </div>
                  <span
                    className={`text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 rounded border ${
                      stepProgress >= 1
                        ? "border-cyan-500 text-cyan-400 bg-cyan-500/10"
                        : "border-white/10 text-white/20"
                    }`}
                  >
                    {stepProgress >= 1
                      ? "Decrypted"
                      : `Processing_${Math.floor(stepProgress * 100)}%`}
                  </span>
                  {stepProgress >= 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 text-[8px] text-white/40 uppercase tracking-[0.3em]"
                    >
                      <LockKeyhole size={10} />
                      Continue Scrolling
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: FINAL VOID */}
          {activeStep === TOTAL_STEPS - 1 && (
            <motion.div
              key="outro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center px-8"
            >
              <AlertCircle
                size={48}
                strokeWidth={1}
                className="text-cyan-500/40 mb-8 animate-pulse"
              />
              <h2 className="text-[16px] md:text-[18px] font-black uppercase tracking-[1em] mb-4 text-balance">
                Indoctrination Complete
              </h2>
              <div className="w-24 h-px bg-white/20 mb-8" />
              <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] max-w-sm">
                You have acknowledged the systemic flaws.
                <br />
                The board is now authorized for kinetic testing.
              </p>

              <button
                onClick={() => {
                  setActiveStep(0)
                  setStepProgress(0)
                }}
                className="mt-16 px-8 py-3 border border-white/10 text-[10px] uppercase tracking-[0.5em] hover:bg-white/5 transition-colors cursor-pointer"
              >
                Reset_Sequence
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Liquid depth vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.9)]" />
    </section>
  )
}
