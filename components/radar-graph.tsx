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

interface KeywordNode {
  id: string
  keyword: string
  color: string
  x: number
  y: number
  vx: number
  vy: number
  profileIndex: number
}

type AnimationPhase = "idle" | "loading" | "keywords-enter" | "graph-fade" | "floating" | "playing"

const PROFILE_COLORS = [
  { stroke: "rgba(99, 102, 241, 0.8)", fill: "rgba(99, 102, 241, 0.15)" }, // Indigo
  { stroke: "rgba(236, 72, 153, 0.8)", fill: "rgba(236, 72, 153, 0.15)" }, // Pink
]

// Get top 7 strengths for a profile
function getTopStrengths(skillData: SkillData): string[] {
  return Object.entries(skillData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([key]) => key)
}

export function RadarGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationCanvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>(0)
  const [inputName, setInputName] = useState("")
  const [inputText, setInputText] = useState("")
  const [profiles, setProfiles] = useState<ProfileData[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>("idle")
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [keywordNodes, setKeywordNodes] = useState<KeywordNode[]>([])
  const [graphOpacity, setGraphOpacity] = useState(1)
  const [playingPair, setPlayingPair] = useState<[KeywordNode | null, KeywordNode | null]>([null, null])

  // Trigger animation sequence when 2 profiles are added
  useEffect(() => {
    if (profiles.length === 2 && animationPhase === "idle") {
      // Start the loading phase
      setAnimationPhase("loading")
      setLoadingProgress(20) // Start at 20 seconds
      
      // 20 second countdown timer
      const timerInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          const newValue = prev - 1
          if (newValue <= 0) {
            clearInterval(timerInterval)
            setAnimationPhase("keywords-enter")
            return 0
          }
          return newValue
        })
      }, 1000)
      
      return () => {
        clearInterval(timerInterval)
      }
    }
  }, [profiles.length, animationPhase])

  // Initialize keyword nodes from both profiles
  const initializeKeywordNodes = () => {
    const canvas = animationCanvasRef.current
    if (!canvas) return
    
    const nodes: KeywordNode[] = []
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    
    profiles.forEach((profile, profileIndex) => {
      const strengths = getTopStrengths(profile.skillData)
      const color = PROFILE_COLORS[profileIndex].stroke
      
      strengths.forEach((keyword, i) => {
        // Start from outside the canvas
        const angle = ((profileIndex * 7 + i) / 14) * Math.PI * 2
        const startDistance = Math.max(canvas.width, canvas.height) * 0.8
        
        nodes.push({
          id: `${profileIndex}-${i}`,
          keyword,
          color,
          x: centerX + Math.cos(angle) * startDistance,
          y: centerY + Math.sin(angle) * startDistance,
          vx: 0,
          vy: 0,
          profileIndex,
        })
      })
    })
    
    setKeywordNodes(nodes)
  }

  // Keywords enter animation
  useEffect(() => {
    if (animationPhase !== "keywords-enter") return
    
    console.log("[v0] Entering keywords-enter phase")
    
    // Initialize nodes when entering this phase
    initializeKeywordNodes()
    
    const canvas = animationCanvasRef.current
    if (!canvas) {
      console.log("[v0] Canvas not ready")
      return
    }
    
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const targetRadius = Math.min(canvas.width, canvas.height) * 0.35
    
    let frame = 0
    const totalFrames = 120 // 2 seconds at 60fps
    
    const animate = () => {
      frame++
      const progress = Math.min(frame / totalFrames, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease out cubic
      
      setKeywordNodes(prev => prev.map((node, i) => {
        const angle = ((node.profileIndex * 7 + (i % 7)) / 14) * Math.PI * 2
        const targetX = centerX + Math.cos(angle) * targetRadius * (0.6 + Math.random() * 0.4)
        const targetY = centerY + Math.sin(angle) * targetRadius * (0.6 + Math.random() * 0.4)
        const startDistance = Math.max(canvas.width, canvas.height) * 0.8
        const startX = centerX + Math.cos(angle) * startDistance
        const startY = centerY + Math.sin(angle) * startDistance
        
        return {
          ...node,
          x: startX + (targetX - startX) * eased,
          y: startY + (targetY - startY) * eased,
        }
      }))
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        // Start fading the graph
        setAnimationPhase("graph-fade")
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrameRef.current)
  }, [animationPhase])

  // Graph fade animation
  useEffect(() => {
    if (animationPhase !== "graph-fade") return
    
    let frame = 0
    const totalFrames = 60 // 1 second
    
    const animate = () => {
      frame++
      const progress = Math.min(frame / totalFrames, 1)
      setGraphOpacity(1 - progress)
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        setAnimationPhase("floating")
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrameRef.current)
  }, [animationPhase])

  // Floating animation
  useEffect(() => {
    if (animationPhase !== "floating" && animationPhase !== "playing") return
    
    const canvas = animationCanvasRef.current
    if (!canvas) return
    
    // Start playing after 3 seconds of floating
    let floatingTime = 0
    const playStartTime = 3000
    let hasStartedPlaying = false
    
    const animate = () => {
      floatingTime += 16 // roughly 60fps
      
      setKeywordNodes(prev => {
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        
        return prev.map(node => {
          // Add gentle floating motion
          const time = Date.now() / 1000
          const floatX = Math.sin(time * 0.5 + parseFloat(node.id) * 1.5) * 2
          const floatY = Math.cos(time * 0.7 + parseFloat(node.id) * 1.3) * 2
          
          // Soft boundary bounce
          let newX = node.x + node.vx + floatX
          let newY = node.y + node.vy + floatY
          let newVx = node.vx * 0.98
          let newVy = node.vy * 0.98
          
          const padding = 100
          if (newX < padding || newX > canvas.width - padding) {
            newVx = -newVx * 0.5
            newX = Math.max(padding, Math.min(canvas.width - padding, newX))
          }
          if (newY < padding || newY > canvas.height - padding) {
            newVy = -newVy * 0.5
            newY = Math.max(padding, Math.min(canvas.height - padding, newY))
          }
          
          return { ...node, x: newX, y: newY, vx: newVx, vy: newVy }
        })
      })
      
      // Start playing phase
      if (!hasStartedPlaying && floatingTime > playStartTime && animationPhase === "floating") {
        hasStartedPlaying = true
        setAnimationPhase("playing")
        selectPlayingPair()
      }
      
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    
    animationFrameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrameRef.current)
  }, [animationPhase])

  // Select a pair to play
  const selectPlayingPair = () => {
    setKeywordNodes(prev => {
      const profile0Nodes = prev.filter(n => n.profileIndex === 0)
      const profile1Nodes = prev.filter(n => n.profileIndex === 1)
      
      if (profile0Nodes.length > 0 && profile1Nodes.length > 0) {
        const node0 = profile0Nodes[Math.floor(Math.random() * profile0Nodes.length)]
        const node1 = profile1Nodes[Math.floor(Math.random() * profile1Nodes.length)]
        setPlayingPair([node0, node1])
        
        // Give them velocities toward center
        const canvas = animationCanvasRef.current
        if (canvas) {
          const centerX = canvas.width / 2
          const centerY = canvas.height / 2
          
          return prev.map(n => {
            if (n.id === node0.id || n.id === node1.id) {
              const dx = centerX - n.x
              const dy = centerY - n.y
              const dist = Math.sqrt(dx * dx + dy * dy)
              return {
                ...n,
                vx: (dx / dist) * 8,
                vy: (dy / dist) * 8,
              }
            }
            return n
          })
        }
      }
      return prev
    })
    
    // Select new pair every 4 seconds
    setTimeout(selectPlayingPair, 4000)
  }

  // Draw animation canvas
  useEffect(() => {
    if (animationPhase === "idle" || animationPhase === "loading") return
    
    const canvas = animationCanvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw connecting lines between playing pair
      if (playingPair[0] && playingPair[1]) {
        const [node0, node1] = playingPair
        const actualNode0 = keywordNodes.find(n => n.id === node0.id)
        const actualNode1 = keywordNodes.find(n => n.id === node1.id)
        
        if (actualNode0 && actualNode1) {
          ctx.beginPath()
          ctx.moveTo(actualNode0.x, actualNode0.y)
          ctx.lineTo(actualNode1.x, actualNode1.y)
          ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
          ctx.lineWidth = 2
          ctx.stroke()
          
          // Draw sparks at midpoint
          const midX = (actualNode0.x + actualNode1.x) / 2
          const midY = (actualNode0.y + actualNode1.y) / 2
          const time = Date.now() / 100
          
          for (let i = 0; i < 5; i++) {
            const sparkAngle = time + (i * Math.PI * 2 / 5)
            const sparkDist = 10 + Math.sin(time * 2 + i) * 5
            ctx.beginPath()
            ctx.arc(
              midX + Math.cos(sparkAngle) * sparkDist,
              midY + Math.sin(sparkAngle) * sparkDist,
              2,
              0,
              Math.PI * 2
            )
            ctx.fillStyle = "rgba(255, 255, 255, 0.6)"
            ctx.fill()
          }
        }
      }
      
      // Draw keyword nodes
      keywordNodes.forEach(node => {
        // Draw glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 40)
        gradient.addColorStop(0, node.color.replace("0.8", "0.3"))
        gradient.addColorStop(1, "transparent")
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(node.x, node.y, 40, 0, Math.PI * 2)
        ctx.fill()
        
        // Draw node circle
        ctx.beginPath()
        ctx.arc(node.x, node.y, 20, 0, Math.PI * 2)
        ctx.fillStyle = node.color.replace("0.8", "0.9")
        ctx.fill()
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
        ctx.lineWidth = 2
        ctx.stroke()
        
        // Draw keyword text
        ctx.fillStyle = "white"
        ctx.font = "bold 11px Inter"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        
        // Truncate and wrap text
        const maxWidth = 80
        const words = node.keyword.split(" ")
        if (words.length > 2) {
          ctx.fillText(words.slice(0, 2).join(" "), node.x, node.y - 30)
          ctx.fillText(words.slice(2).join(" "), node.x, node.y - 18)
        } else {
          ctx.fillText(node.keyword, node.x, node.y - 25)
        }
      })
      
      animationFrameRef.current = requestAnimationFrame(draw)
    }
    
    draw()
    return () => cancelAnimationFrame(animationFrameRef.current)
  }, [animationPhase, keywordNodes, playingPair])

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
    
    if (!inputName.trim() || !inputText.trim() || isProcessing || profiles.length >= 2) return

    setIsProcessing(true)

    try {
      console.log("[v0] Processing profile:", inputName)
      
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
      console.log("[v0] Parsed skill data:", data.skillData)

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
    setKeywordNodes([])
    setGraphOpacity(1)
    setPlayingPair([null, null])
    cancelAnimationFrame(animationFrameRef.current)
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
          
          {/* Animation canvas overlay */}
          <canvas
            ref={animationCanvasRef}
            width={1200}
            height={1200}
            className="absolute w-full h-auto pointer-events-none"
            style={{ 
              top: "1rem", 
              left: "1rem", 
              right: "1rem", 
              bottom: "1rem",
              opacity: animationPhase !== "idle" && animationPhase !== "loading" ? 1 : 0
            }}
          />
          
          {/* Timer */}
          {animationPhase === "loading" && (
            <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8">
              <div className="text-center">
                <div className="text-white text-6xl font-bold mb-2 tabular-nums">
                  {loadingProgress}
                </div>
                <div className="text-white/60 text-sm">
                  Analyzing profiles...
                </div>
              </div>
            </div>
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
