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

interface ProfileData {
  name: string
  skillData: SkillData
  color: string
}

const PROFILE_COLORS = [
  { stroke: "rgba(99, 102, 241, 0.8)", fill: "rgba(99, 102, 241, 0.15)" }, // Indigo
  { stroke: "rgba(236, 72, 153, 0.8)", fill: "rgba(236, 72, 153, 0.15)" }, // Pink
]

export function RadarGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profiles, setProfiles] = useState<ProfileData[]>([])
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
      
      // Draw level number
      if (level % 2 === 0) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
        ctx.font = "10px Inter"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(level.toString(), centerX, centerY - radius - 8)
      }
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

    })

    // Draw all profiles
    profiles.forEach((profile) => {
      // Draw polygon connecting skill nodes
      if (Object.keys(profile.skillData).length > 0) {
        ctx.beginPath()
        ctx.strokeStyle = profile.color.stroke
        ctx.fillStyle = profile.color.fill
        ctx.lineWidth = 2

        let firstPoint = true
        dimensions.forEach((dimension, index) => {
          const skillValue = profile.skillData[dimension]
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

      // Draw nodes for this profile
      dimensions.forEach((dimension, index) => {
        const skillValue = profile.skillData[dimension]
        if (skillValue !== undefined) {
          const angle = (index / numDimensions) * Math.PI * 2 - Math.PI / 2
          const nodeRadius = (maxRadius / levels) * skillValue
          const nodeX = centerX + Math.cos(angle) * nodeRadius
          const nodeY = centerY + Math.sin(angle) * nodeRadius

          console.log(`[v0] ${profile.name} - ${dimension}: ${skillValue}, radius: ${nodeRadius}, maxRadius: ${maxRadius}`)

          // Draw node
          ctx.beginPath()
          ctx.arc(nodeX, nodeY, 5, 0, Math.PI * 2)
          ctx.fillStyle = profile.color.stroke
          ctx.fill()
          ctx.strokeStyle = profile.color.stroke
          ctx.lineWidth = 2
          ctx.stroke()
        }
      })
    })
  }, [profiles])

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fileInputRef.current?.files?.[0] || isProcessing || profiles.length >= 2) return

    const file = fileInputRef.current.files[0]
    
    // Validate file type
    if (!file.type.includes('pdf')) {
      alert('Por favor, selecione um arquivo PDF')
      return
    }

    setIsProcessing(true)

    try {
      console.log("[v0] Processing PDF:", file.name)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('dimensions', JSON.stringify(dimensions))

      const response = await fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to parse PDF")
      }

      const data = await response.json()
      console.log("[v0] Parsed profile from PDF:", data.name, data.skillData)

      // Add new profile with next available color
      const newProfile: ProfileData = {
        name: data.name,
        skillData: data.skillData,
        color: PROFILE_COLORS[profiles.length] || PROFILE_COLORS[0],
      }

      setProfiles((prev) => [...prev, newProfile])
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("[v0] Error processing PDF:", error)
      alert("Erro ao processar PDF. Por favor, tente novamente.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClearProfiles = () => {
    setProfiles([])
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative w-full max-w-6xl mx-auto"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Graph Area */}
        <div className="flex-1 relative bg-black/20 rounded-lg border border-white/10 p-4 md:p-8 backdrop-blur-sm">
          <canvas
            ref={canvasRef}
            width={1200}
            height={1200}
            className="w-full h-auto"
          />
        </div>

        {/* Legend & Controls Sidebar */}
        <div className="lg:w-80 flex flex-col gap-6">
          {/* Legend */}
          {profiles.length > 0 && (
            <div className="bg-black/20 rounded-lg border border-white/10 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">Profiles</h3>
                <button
                  onClick={handleClearProfiles}
                  className="text-white/40 hover:text-white/80 text-xs transition-colors"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-3">
                {profiles.map((profile, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: profile.color.stroke }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">
                        {profile.name}
                      </div>
                      <div className="text-white/40 text-xs">
                        {Object.keys(profile.skillData).length} dimensions
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <div className="bg-black/20 rounded-lg border border-white/10 p-6 backdrop-blur-sm">
            <h3 className="text-white font-semibold text-lg mb-4">
              {profiles.length === 0
                ? "Add First Profile"
                : profiles.length === 1
                ? "Add Second Profile"
                : "Maximum Profiles"}
            </h3>

            {profiles.length < 2 ? (
              <form onSubmit={handleInputSubmit} className="space-y-4">
                <div>
                  <label className="block text-white/60 text-sm mb-2">
                    Upload CV/Resume (PDF)
                  </label>
                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      disabled={isProcessing}
                      className="hidden"
                      onChange={(e) => {
                        // Trigger form submission when file is selected
                        if (e.target.files?.[0]) {
                          const form = e.currentTarget.form
                          if (form) {
                            const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
                            form.dispatchEvent(submitEvent)
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessing}
                      className="w-full px-4 py-8 border-2 border-dashed border-white/20 rounded-lg text-white/60 hover:text-white/80 hover:border-white/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span className="text-sm">Processing PDF...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-sm">Click to upload PDF</span>
                          <span className="text-xs text-white/40">or drag and drop</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <input
                  type="submit"
                  value="Submit"
                  disabled={true}
                  className="hidden"
                />
              </form>
            ) : (
              <div className="text-center text-white/40 text-sm">
                <p className="mb-4">
                  Maximum of 2 profiles reached. Clear profiles to compare new ones.
                </p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-black/20 rounded-lg border border-white/10 p-6 backdrop-blur-sm">
            <h3 className="text-white/60 text-sm font-semibold mb-2">
              How it works
            </h3>
            <ul className="text-white/40 text-xs space-y-2">
              <li>{'• Upload a PDF CV or resume'}</li>
              <li>{'• Name extracted from document'}</li>
              <li>{'• AI analyzes across 12 dimensions'}</li>
              <li>{'• Add up to 2 profiles for comparison'}</li>
              <li>{'• Overlapping profiles show differences'}</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
