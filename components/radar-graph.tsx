"use client"

import React from "react"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

const dimensions = [
  "Senioridade real",
  "Escopo de impacto",
  "Arquitetura de sistemas",
  "Produto & negócio",
  "Growth / métricas / ROI",
  "Cloud & infra",
  "Data engineering",
  "ML / AI aplicado",
  "Pesquisa acadêmica",
  "Liderança / ownership",
  "Comunicação executiva",
  "Raridade de perfil",
]

interface SkillData {
  [key: string]: number // dimension: value (0-10)
}

export function RadarGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [inputValue, setInputValue] = useState("")
  const [skillData, setSkillData] = useState<SkillData>({})
  const [isProcessing, setIsProcessing] = useState(false)

  // Draw the radar graph
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.35
    const numDimensions = dimensions.length
    const levels = 10 // 0-10 scale

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw concentric circles (levels)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = 1
    for (let level = 1; level <= levels; level++) {
      const radius = (maxRadius / levels) * level
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Draw axes and labels
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
    ctx.lineWidth = 1
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
    ctx.font = "12px Inter"

    dimensions.forEach((dimension, index) => {
      const angle = (index / numDimensions) * Math.PI * 2 - Math.PI / 2
      const x = centerX + Math.cos(angle) * maxRadius
      const y = centerY + Math.sin(angle) * maxRadius

      // Draw axis line
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.stroke()

      // Draw label
      const labelDistance = maxRadius + 30
      const labelX = centerX + Math.cos(angle) * labelDistance
      const labelY = centerY + Math.sin(angle) * labelDistance

      ctx.save()
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Multi-line text for longer labels
      const words = dimension.split(" ")
      if (words.length > 2) {
        const line1 = words.slice(0, Math.ceil(words.length / 2)).join(" ")
        const line2 = words.slice(Math.ceil(words.length / 2)).join(" ")
        ctx.fillText(line1, labelX, labelY - 8)
        ctx.fillText(line2, labelX, labelY + 8)
      } else {
        ctx.fillText(dimension, labelX, labelY)
      }

      ctx.restore()

      // Draw node if skill data exists for this dimension
      const skillValue = skillData[dimension]
      if (skillValue !== undefined) {
        const nodeRadius = (maxRadius / levels) * skillValue
        const nodeX = centerX + Math.cos(angle) * nodeRadius
        const nodeY = centerY + Math.sin(angle) * nodeRadius

        // Draw node
        ctx.beginPath()
        ctx.arc(nodeX, nodeY, 6, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
        ctx.fill()
        ctx.strokeStyle = "rgba(255, 255, 255, 1)"
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })

    // Draw polygon connecting skill nodes
    if (Object.keys(skillData).length > 0) {
      ctx.beginPath()
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)"
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)"
      ctx.lineWidth = 2

      let firstPoint = true
      dimensions.forEach((dimension, index) => {
        const skillValue = skillData[dimension]
        if (skillValue !== undefined) {
          const angle = (index / numDimensions) * Math.PI * 2 - Math.PI / 2
          const nodeRadius = (maxRadius / levels) * skillValue
          const nodeX = centerX + Math.cos(angle) * nodeRadius
          const nodeY = centerY + Math.sin(angle) * nodeRadius

          if (firstPoint) {
            ctx.moveTo(nodeX, nodeY)
            firstPoint = false
          } else {
            ctx.lineTo(nodeX, nodeY)
          }
        }
      })

      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }
  }, [skillData])

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedValue = inputValue.trim()
    
    if (!trimmedValue || isProcessing) return

    setIsProcessing(true)

    try {
      // Call LLM to parse skills and assign values
      console.log("[v0] Parsing skills:", trimmedValue)
      const response = await fetch("/api/parse-skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skillsText: trimmedValue,
          dimensions: dimensions,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to parse skills")
      }

      const data = await response.json()
      console.log("[v0] Parsed skill data:", data.skillData)

      setSkillData(data.skillData)
      setInputValue("")
    } catch (error) {
      console.error("[v0] Error parsing skills:", error)
      // Handle error - could show a message to user
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative w-full max-w-5xl mx-auto"
    >
      <div className="relative bg-black/20 rounded-lg border border-white/10 p-4 md:p-8 backdrop-blur-sm">
        <canvas
          ref={canvasRef}
          width={1200}
          height={1200}
          className="w-full h-auto"
        />
        
        {/* Legend */}
        <div className="mt-6 text-center text-white/40 text-sm">
          <p>Enter your professional skills and experience below to visualize your competence profile</p>
        </div>

        {/* Input field for skills */}
        <div className="mt-6 flex justify-center">
          <form onSubmit={handleInputSubmit} className="w-full max-w-2xl">
            <div className="relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Describe your professional experience, skills, and competencies. The AI will analyze and map them to the dimensions above."
                disabled={isProcessing}
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              />
              {isProcessing && (
                <div className="absolute right-3 top-3">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={isProcessing || !inputValue.trim()}
              className="mt-3 w-full px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm tracking-wide hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Analyzing..." : "Analyze Profile"}
            </button>
          </form>
        </div>

        {/* Display current skill values */}
        {Object.keys(skillData).length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
            {dimensions.map((dimension) => {
              const value = skillData[dimension]
              return value !== undefined ? (
                <div
                  key={dimension}
                  className="bg-white/5 rounded-lg p-3 border border-white/10"
                >
                  <div className="text-white/60 text-xs mb-1">{dimension}</div>
                  <div className="text-white text-lg font-semibold">
                    {value.toFixed(1)}/10
                  </div>
                </div>
              ) : null
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}
