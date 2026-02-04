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
  "Aderência ATS genérico",
  "MLOps",
  "Lakehouse Engineering",
  "Modelagem estatística aplicada",
]

interface SkillData {
  [key: string]: number // dimension: value (0-10)
}

interface ProfileData {
  name: string
  skillData: SkillData
  color: { stroke: string; fill: string }
}

type AnimationPhase = "idle" | "loading" | "report"

const PROFILE_COLORS = [
  { stroke: "rgba(30, 58, 138, 0.9)", fill: "rgba(30, 58, 138, 0.2)" }, // Dark Blue
  { stroke: "rgba(20, 83, 45, 0.9)", fill: "rgba(20, 83, 45, 0.2)" }, // Dark Green
]

// Calculate compatibility score (skewed toward higher values)
function calculateCompatibility(profile1: ProfileData, profile2: ProfileData): number {
  let totalSimilarity = 0
  let dimensionCount = 0
  
  dimensions.forEach(dim => {
    const val1 = profile1.skillData[dim] || 0
    const val2 = profile2.skillData[dim] || 0
    
    if (val1 > 0 && val2 > 0) {
      // Calculate similarity (inverse of difference, normalized)
      const diff = Math.abs(val1 - val2)
      const similarity = (10 - diff) / 10 // 1.0 = identical, 0.0 = max difference
      totalSimilarity += similarity
      dimensionCount++
    }
  })
  
  const baseCompatibility = dimensionCount > 0 ? (totalSimilarity / dimensionCount) * 100 : 50
  
  // Skew toward higher numbers: add bonus for shared strengths
  let bonus = 0
  dimensions.forEach(dim => {
    const val1 = profile1.skillData[dim] || 0
    const val2 = profile2.skillData[dim] || 0
    if (val1 > 6 && val2 > 6) bonus += 2 // Both strong
    if ((val1 > 7 && val2 < 5) || (val2 > 7 && val1 < 5)) bonus += 1 // Complementary
  })
  
  return Math.min(Math.round(baseCompatibility + bonus), 99)
}

// Generate alignment report based on two profiles
function generateAlignmentReport(profile1: ProfileData, profile2: ProfileData): { paragraph1: string; paragraph2: string; compatibility: number } {
  const commonStrengths: string[] = []
  const complementaryAreas: string[] = []
  
  // Find common high-value dimensions (both > 6)
  dimensions.forEach(dim => {
    const val1 = profile1.skillData[dim] || 0
    const val2 = profile2.skillData[dim] || 0
    
    if (val1 > 6 && val2 > 6) {
      commonStrengths.push(dim)
    } else if ((val1 > 7 && val2 < 5) || (val2 > 7 && val1 < 5)) {
      complementaryAreas.push(dim)
    }
  })
  
  const compatibility = calculateCompatibility(profile1, profile2)
  
  const paragraph1 = `The convergence of ${profile1.name} and ${profile2.name} reveals a powerful alignment in ${commonStrengths.length} critical dimensions. Their shared mastery in ${commonStrengths.slice(0, 3).join(", ")} forms a foundation of exceptional collaborative potential. This symmetry of expertise creates a multiplier effect, where combined capabilities exceed the sum of individual contributions—a vector pointing toward transformative innovation and sustained competitive advantage.`
  
  const paragraph2 = `Beyond parallel strengths, their complementary expertise in ${complementaryAreas.slice(0, 2).join(" and ")} presents opportunities for knowledge synthesis and mutual elevation. This configuration—where one's depth compensates for the other's developing areas—cultivates an environment of continuous learning and exponential growth. Together, they embody the blueprint for next-generation collaboration: resilient, adaptive, and primed to navigate complexity with precision and vision.`
  
  return { paragraph1, paragraph2, compatibility }
}

export function RadarGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [inputName, setInputName] = useState("")
  const [inputText, setInputText] = useState("")
  const [profiles, setProfiles] = useState<ProfileData[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>("idle")
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [graphOpacity, setGraphOpacity] = useState(1)
  const [report, setReport] = useState<{ paragraph1: string; paragraph2: string; compatibility: number } | null>(null)

  // Trigger analysis when 2 profiles are added
  useEffect(() => {
    if (profiles.length === 2 && animationPhase === "idle") {
      setAnimationPhase("loading")
      setLoadingProgress(20)
      
      let counter = 20
      
      // 20 second countdown timer
      const timerInterval = setInterval(() => {
        counter--
        setLoadingProgress(counter)
        
        if (counter <= 0) {
          clearInterval(timerInterval)
          
          // Fade graph
          let fadeFrame = 0
          const fadeFrames = 60
          
          const fadeInterval = setInterval(() => {
            fadeFrame++
            setGraphOpacity(1 - fadeFrame / fadeFrames)
            
            if (fadeFrame >= fadeFrames) {
              clearInterval(fadeInterval)
              // Generate and show report
              const alignmentReport = generateAlignmentReport(profiles[0], profiles[1])
              setReport(alignmentReport)
              setAnimationPhase("report")
            }
          }, 16)
        }
      }, 1000)
      
      return () => {
        clearInterval(timerInterval)
      }
    }
  }, [profiles.length])



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
    ctx.font = "bold 16px Inter"

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
      const labelDistance = maxRadius + 40
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
        ctx.fillText(line1, labelX, labelY - 12)
        ctx.fillText(line2, labelX, labelY + 12)
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
    
    if (!inputName.trim() || !inputText.trim() || isProcessing || profiles.length >= 2) return

    setIsProcessing(true)

    try {
      const response = await fetch("/api/parse-skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skillsText: inputText,
          dimensions: dimensions,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to parse skills")
      }

      const data = await response.json()

      // Add new profile with next available color
      const newProfile: ProfileData = {
        name: inputName,
        skillData: data.skillData,
        color: PROFILE_COLORS[profiles.length] || PROFILE_COLORS[0],
      }

      setProfiles((prev) => [...prev, newProfile])
      setInputName("")
      setInputText("")
    } catch (error) {
      console.error("[v0] Error parsing skills:", error)
      alert("Erro ao processar perfil. Por favor, tente novamente.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClearProfiles = () => {
    setProfiles([])
    setAnimationPhase("idle")
    setLoadingProgress(0)
    setGraphOpacity(1)
    setReport(null)
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
        <div className="flex-1 relative bg-black/20 rounded-lg border border-white/10 p-4 md:p-8 backdrop-blur-sm overflow-hidden">
          {/* Radar canvas */}
          <canvas
            ref={canvasRef}
            width={1200}
            height={1200}
            className="w-full h-auto transition-opacity duration-500"
            style={{ opacity: graphOpacity }}
          />
          
          {/* Timer */}
          {animationPhase === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-white text-6xl font-bold mb-2 tabular-nums">
                  {loadingProgress}
                </div>
                <div className="text-white/60 text-sm uppercase tracking-widest">
                  Analyzing vectors...
                </div>
              </div>
            </div>
          )}
          
          {/* Report */}
          {animationPhase === "report" && report && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 flex items-center justify-center p-8"
            >
              <div className="max-w-3xl space-y-8">
                {/* Header with subtle animation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="text-center space-y-2 border-b border-white/10 pb-6"
                >
                  <div className="text-white/40 text-xs uppercase tracking-[0.3em] font-mono">
                    Vector Analysis Complete
                  </div>
                  <h2 className="text-white text-2xl font-light tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                    Professional Alignment Report
                  </h2>
                </motion.div>
                
                {/* Profile Names - larger font with heading font */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="flex items-center justify-center gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PROFILE_COLORS[0].stroke }} />
                    <span className="text-white text-xl tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>
                      {profiles[0].name}
                    </span>
                  </div>
                  <div className="text-white/30 text-2xl">×</div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PROFILE_COLORS[1].stroke }} />
                    <span className="text-white text-xl tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>
                      {profiles[1].name}
                    </span>
                  </div>
                </motion.div>
                
                {/* Paragraphs */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 1 }}
                  className="space-y-6"
                >
                  <p className="text-white/70 text-base leading-relaxed font-light text-justify">
                    {report.paragraph1}
                  </p>
                  <p className="text-white/70 text-base leading-relaxed font-light text-justify">
                    {report.paragraph2}
                  </p>
                </motion.div>
                
                {/* Compatibility Score - creative addition */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.8, duration: 0.8, type: "spring" }}
                  className="relative pt-6 border-t border-white/10"
                >
                  <div className="text-center space-y-3">
                    <div className="text-white/40 text-xs uppercase tracking-[0.25em]">
                      Collaborative Compatibility Index
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      {/* Animated compatibility bar */}
                      <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${report.compatibility}%` }}
                          transition={{ delay: 2, duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-blue-900 via-teal-700 to-green-800"
                        />
                      </div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.5, duration: 0.5 }}
                        className="text-white text-3xl font-bold tabular-nums"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {report.compatibility}%
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Footer accent with pulse animation */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.8, duration: 1 }}
                  className="flex items-center justify-center gap-2 pt-4"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1 h-1 rounded-full bg-white/20"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, delay: 0.3, repeat: Infinity }}
                    className="w-1 h-1 rounded-full bg-white/20"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, delay: 0.6, repeat: Infinity }}
                    className="w-1 h-1 rounded-full bg-white/20"
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
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
                    Nome
                  </label>
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="Ex: João Silva"
                    disabled={isProcessing}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  />
                </div>

                <div>
                  <label className="block text-white/60 text-sm mb-2">
                    Competências (copie os valores ou descreva)
                  </label>
                  <div className="relative">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Ex: Senioridade real 5.0; Escopo de impacto 6.0; Arquitetura de sistemas 6.5; Produto & negócio 5.5; Growth / métricas / ROI 6.0; Cloud & infra 8.0; Data engineering 8.5; ML / AI aplicado 8.5; Pesquisa acadêmica 6.0; Liderança / ownership 5.0; Comunicação executiva 6.0; Raridade de perfil 6.0; Aderência ATS genérico 7.0; MLOps 7.5; Lakehouse Engineering 8.0; Modelagem estatística aplicada 7.5"
                      disabled={isProcessing}
                      rows={8}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none text-sm"
                    />
                    {isProcessing && (
                      <div className="absolute right-3 top-3">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !inputName.trim() || !inputText.trim()}
                  className="w-full px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm tracking-wide hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Analisando..." : "Adicionar Perfil"}
                </button>
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
              Como funciona
            </h3>
            <ul className="text-white/40 text-xs space-y-2">
              <li>{'• Digite o nome do profissional'}</li>
              <li>{'• Cole os valores das 16 dimensões'}</li>
              <li>{'• Ou descreva habilidades em texto livre'}</li>
              <li>{'• Compare até 2 perfis simultaneamente'}</li>
              <li>{'• Gráficos sobrepostos mostram diferenças'}</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
