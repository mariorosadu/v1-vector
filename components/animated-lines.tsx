"use client"

import { useEffect, useRef, useState } from "react"

interface LineTarget {
  label: string
  y: number
}

interface AnimatedLinesProps {
  targets: LineTarget[]
  linesPerTarget?: number
}

export function AnimatedLines({ targets, linesPerTarget = 8 }: AnimatedLinesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const animationRef = useRef<number>(0)
  const progressRef = useRef(0)

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || dimensions.width === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas DPI for sharp lines
    const dpr = window.devicePixelRatio || 1
    canvas.width = dimensions.width * dpr
    canvas.height = dimensions.height * dpr
    ctx.scale(dpr, dpr)

    // Generate lines for each target
    const lines: Array<{
      startX: number
      startY: number
      endX: number
      endY: number
      controlX1: number
      controlY1: number
      controlX2: number
      controlY2: number
      opacity: number
      delay: number
    }> = []

    const endX = dimensions.width * 0.65 // Where lines converge

    targets.forEach((target, targetIndex) => {
      const targetY = target.y * dimensions.height
      
      for (let i = 0; i < linesPerTarget; i++) {
        // Scatter starting points on the left
        const startX = -20 + Math.random() * 40
        const startY = Math.random() * dimensions.height

        // Create curved path control points
        const midX = dimensions.width * (0.2 + Math.random() * 0.2)
        const controlX1 = midX
        const controlY1 = startY + (targetY - startY) * 0.3
        const controlX2 = endX - dimensions.width * 0.15
        const controlY2 = targetY + (Math.random() - 0.5) * 30

        lines.push({
          startX,
          startY,
          endX,
          endY: targetY,
          controlX1,
          controlY1,
          controlX2,
          controlY2,
          opacity: 0.15 + Math.random() * 0.25,
          delay: targetIndex * 0.1 + i * 0.02,
        })
      }
    })

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height)

      progressRef.current += 0.008
      if (progressRef.current > 2) progressRef.current = 2 // Cap at full

      lines.forEach((line) => {
        const lineProgress = Math.max(0, Math.min(1, progressRef.current - line.delay))
        
        if (lineProgress <= 0) return

        ctx.beginPath()
        ctx.strokeStyle = `rgba(255, 255, 255, ${line.opacity * lineProgress})`
        ctx.lineWidth = 0.5

        // Draw partial bezier curve based on progress
        const steps = 100
        const maxStep = Math.floor(steps * lineProgress)
        
        for (let t = 0; t <= maxStep; t++) {
          const progress = t / steps
          const x = bezierPoint(
            line.startX,
            line.controlX1,
            line.controlX2,
            line.endX,
            progress
          )
          const y = bezierPoint(
            line.startY,
            line.controlY1,
            line.controlY2,
            line.endY,
            progress
          )

          if (t === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }

        ctx.stroke()
      })

      if (progressRef.current < 2) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    progressRef.current = 0
    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [dimensions, targets, linesPerTarget])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: dimensions.width, height: dimensions.height }}
      />
    </div>
  )
}

// Cubic bezier calculation
function bezierPoint(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const oneMinusT = 1 - t
  return (
    oneMinusT * oneMinusT * oneMinusT * p0 +
    3 * oneMinusT * oneMinusT * t * p1 +
    3 * oneMinusT * t * t * p2 +
    t * t * t * p3
  )
}
