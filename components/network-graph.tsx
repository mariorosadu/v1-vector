"use client"

import React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Mic } from "lucide-react"

// Extend Window for webkit prefix support
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

type SpeechRecognitionInstance = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: ((event: Event & { error: string }) => void) | null
}

interface Node {
  id: string
  label: string
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

interface Edge {
  source: string
  target: string
}

const keywords = [
  "Emergent",
  "Decision",
  "Complex Systems",
  "Cognition",
  "Adaptation",
  "Uncertainty",
  "Heuristics",
  "Pattern Recognition",
  "Feedback Loops",
  "Network Effects",
  "Behavioral Economics",
  "Information Processing",
]

const initialConnections: Edge[] = [
  { source: "Emergent", target: "Complex Systems" },
  { source: "Emergent", target: "Pattern Recognition" },
  { source: "Decision", target: "Cognition" },
  { source: "Decision", target: "Heuristics" },
  { source: "Decision", target: "Behavioral Economics" },
  { source: "Complex Systems", target: "Network Effects" },
  { source: "Complex Systems", target: "Feedback Loops" },
  { source: "Cognition", target: "Information Processing" },
  { source: "Cognition", target: "Pattern Recognition" },
  { source: "Adaptation", target: "Uncertainty" },
  { source: "Adaptation", target: "Feedback Loops" },
  { source: "Uncertainty", target: "Heuristics" },
  { source: "Heuristics", target: "Behavioral Economics" },
  { source: "Pattern Recognition", target: "Information Processing" },
  { source: "Feedback Loops", target: "Network Effects" },
]

interface NetworkGraphProps {
  showStartButton?: boolean
}

export function NetworkGraph({ showStartButton = false }: NetworkGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<Node[]>([])
  const hoveredNodeRef = useRef<string | null>(null)
  const animationFrameRef = useRef<number>()
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [activeKeywords, setActiveKeywords] = useState<string[]>(keywords)
  const [connections, setConnections] = useState<Edge[]>(initialConnections)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize SpeechRecognition
  const getSpeechRecognition = useCallback((): SpeechRecognitionInstance | null => {
    if (typeof window === "undefined") return null
    const SpeechRecognition =
      (window as unknown as Record<string, unknown>).SpeechRecognition ??
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition
    if (!SpeechRecognition) return null
    return new (SpeechRecognition as new () => SpeechRecognitionInstance)()
  }, [])

  const toggleListening = useCallback(() => {
    if (isListening) {
      // Stop recognition
      recognitionRef.current?.stop()
      return
    }

    const recognition = getSpeechRecognition()
    if (!recognition) {
      alert("Speech recognition is not supported in this browser. Please try Chrome or Edge.")
      return
    }

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = ""
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setInputValue(transcript)
    }

    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
    }

    recognition.onerror = (event: Event & { error: string }) => {
      console.error("[v0] Speech recognition error:", event.error)
      setIsListening(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [isListening, getSpeechRecognition])

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
    }
  }, [])

  // Initialize nodes with random positions
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(canvas.width, canvas.height) * 0.35

    const initialNodes: Node[] = activeKeywords.map((keyword, index) => {
      const angle = (index / activeKeywords.length) * Math.PI * 2
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      return {
        id: keyword,
        label: keyword,
        x,
        y,
        vx: 0,
        vy: 0,
        radius: 8,
      }
    })

    nodesRef.current = initialNodes
  }, [activeKeywords])

  // Physics simulation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const animate = () => {
      const newNodes = nodesRef.current.map((node) => ({ ...node }))

      // If a node is selected, apply special positioning
      if (selectedNode) {
        const selectedNodeObj = newNodes.find((n) => n.id === selectedNode)
        const otherNodes = newNodes.filter((n) => n.id !== selectedNode)

        if (selectedNodeObj) {
          // Move selected node to the left side and center vertically
          const targetX = canvas.width * 0.25
          const targetY = canvas.height * 0.5
          const dx = targetX - selectedNodeObj.x
          const dy = targetY - selectedNodeObj.y
          selectedNodeObj.vx += dx * 0.05
          selectedNodeObj.vy += dy * 0.05

          // Position other nodes on the right side in a circular pattern
          otherNodes.forEach((node, index) => {
            const rightCenterX = canvas.width * 0.7
            const rightCenterY = canvas.height * 0.5
            const radius = Math.min(canvas.width, canvas.height) * 0.25
            const angle = (index / otherNodes.length) * Math.PI * 2
            const targetNodeX = rightCenterX + Math.cos(angle) * radius
            const targetNodeY = rightCenterY + Math.sin(angle) * radius

            const nodeDx = targetNodeX - node.x
            const nodeDy = targetNodeY - node.y
            node.vx += nodeDx * 0.05
            node.vy += nodeDy * 0.05
          })
        }
      } else {
        // Normal physics when no node is selected
        // Repulsion between nodes
        for (let i = 0; i < newNodes.length; i++) {
          for (let j = i + 1; j < newNodes.length; j++) {
            const dx = newNodes[j].x - newNodes[i].x
            const dy = newNodes[j].y - newNodes[i].y
            const distance = Math.sqrt(dx * dx + dy * dy)
            const minDistance = 120

            if (distance < minDistance && distance > 0) {
              const force = (minDistance - distance) * 0.01
              const angle = Math.atan2(dy, dx)
              newNodes[i].vx -= Math.cos(angle) * force
              newNodes[i].vy -= Math.sin(angle) * force
              newNodes[j].vx += Math.cos(angle) * force
              newNodes[j].vy += Math.sin(angle) * force
            }
          }
        }

        // Attraction along edges
        connections.forEach((edge) => {
          const sourceNode = newNodes.find((n) => n.id === edge.source)
          const targetNode = newNodes.find((n) => n.id === edge.target)
          if (!sourceNode || !targetNode) return

          const dx = targetNode.x - sourceNode.x
          const dy = targetNode.y - sourceNode.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const targetDistance = 150

          if (distance > 0) {
            const force = (distance - targetDistance) * 0.005
            const angle = Math.atan2(dy, dx)
            sourceNode.vx += Math.cos(angle) * force
            sourceNode.vy += Math.sin(angle) * force
            targetNode.vx -= Math.cos(angle) * force
            targetNode.vy -= Math.sin(angle) * force
          }
        })
      }

      // Update positions and apply damping
      newNodes.forEach((node) => {
        node.vx *= 0.85
        node.vy *= 0.85
        node.x += node.vx
        node.y += node.vy

        // Keep within bounds
        const margin = 100
        node.x = Math.max(margin, Math.min(canvas.width - margin, node.x))
        node.y = Math.max(margin, Math.min(canvas.height - margin, node.y))
      })

      nodesRef.current = newNodes

      // Draw
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw edges
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
      ctx.lineWidth = 1
      connections.forEach((edge) => {
        const sourceNode = newNodes.find((n) => n.id === edge.source)
        const targetNode = newNodes.find((n) => n.id === edge.target)
        if (!sourceNode || !targetNode) return

        ctx.beginPath()
        ctx.moveTo(sourceNode.x, sourceNode.y)
        ctx.lineTo(targetNode.x, targetNode.y)
        ctx.stroke()
      })

      // Draw nodes
      newNodes.forEach((node) => {
        const isHovered = hoveredNodeRef.current === node.id
        const isSelected = selectedNode === node.id

        // Node circle - larger if selected
        const nodeRadius = isSelected ? node.radius * 2.5 : node.radius
        ctx.beginPath()
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2)
        
        if (isSelected) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
        } else if (isHovered) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
        }
        ctx.fill()

        // Node label - larger if selected
        if (isSelected) {
          ctx.font = "bold 20px Inter"
          ctx.fillStyle = "#fff"
        } else if (isHovered) {
          ctx.font = "14px Inter"
          ctx.fillStyle = "#fff"
        } else {
          ctx.font = "12px Inter"
          ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
        }
        
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        const labelOffset = isSelected ? -35 : -20
        ctx.fillText(node.label, node.x, node.y + labelOffset)
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [selectedNode])

  // Mouse interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    // Scale mouse coordinates to match canvas internal dimensions
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const mouseX = (e.clientX - rect.left) * scaleX
    const mouseY = (e.clientY - rect.top) * scaleY

    let foundNode: string | null = null
    for (const node of nodesRef.current) {
      const distance = Math.sqrt(
        (mouseX - node.x) ** 2 + (mouseY - node.y) ** 2
      )
      if (distance < node.radius + 20) {
        foundNode = node.id
        break
      }
    }

    hoveredNodeRef.current = foundNode
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    // Scale mouse coordinates to match canvas internal dimensions
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const mouseX = (e.clientX - rect.left) * scaleX
    const mouseY = (e.clientY - rect.top) * scaleY

    let clickedNode: string | null = null
    for (const node of nodesRef.current) {
      const distance = Math.sqrt(
        (mouseX - node.x) ** 2 + (mouseY - node.y) ** 2
      )
      if (distance < node.radius + 20) {
        clickedNode = node.id
        break
      }
    }

    if (clickedNode) {
      setSelectedNode(clickedNode === selectedNode ? null : clickedNode)
    } else {
      setSelectedNode(null)
    }
  }

  const processWord = useCallback(async (keyword: string) => {
    if (!keyword || isProcessing) return

    const existsOnMap = activeKeywords.some(
      (k) => k.toLowerCase() === keyword.toLowerCase()
    )

    if (existsOnMap) {
      // Word exists -- remove it from the map
      const matchedKeyword = activeKeywords.find(
        (k) => k.toLowerCase() === keyword.toLowerCase()
      )!
      setActiveKeywords(activeKeywords.filter((k) => k !== matchedKeyword))
      setConnections(
        connections.filter(
          (edge) => edge.source !== matchedKeyword && edge.target !== matchedKeyword
        )
      )
      if (selectedNode === matchedKeyword) {
        setSelectedNode(null)
      }
      setInputValue("")
    } else {
      // Word does not exist -- add it to the map
      setIsProcessing(true)
      setInputValue("")

      try {
        const response = await fetch("/api/suggest-connections", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newKeyword: keyword,
            existingKeywords: activeKeywords,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to get suggestions")
        }

        const data = await response.json()

        setActiveKeywords([...activeKeywords, keyword])

        const newConnections: Edge[] = data.connections
          .filter((target: string) => activeKeywords.includes(target))
          .map((target: string) => ({
            source: keyword,
            target: target,
          }))

        setConnections([...connections, ...newConnections])
        setSelectedNode(null)
      } catch (error) {
        console.error("Error getting suggestions:", error)
        setActiveKeywords([...activeKeywords, keyword])
        setSelectedNode(null)
      } finally {
        setIsProcessing(false)
      }
    }
  }, [activeKeywords, connections, selectedNode, isProcessing])

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const keyword = inputValue.trim()
    if (keyword) {
      // Clear debounce timer if form is submitted manually
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
      await processWord(keyword)
    }
  }

  // Auto-submit after user stops typing
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    const trimmedValue = inputValue.trim()
    if (trimmedValue && !isProcessing) {
      debounceTimerRef.current = setTimeout(() => {
        processWord(trimmedValue)
      }, 800) // Wait 800ms after user stops typing
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [inputValue, processWord, isProcessing])

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
          height={800}
          className="w-full h-auto cursor-pointer"
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          onMouseLeave={() => {
            hoveredNodeRef.current = null
          }}
        />
        
        {/* Legend */}
        <div className="mt-6 text-center text-white/40 text-sm">
          <p>Click on nodes to focus and explore connections between cognitive concepts</p>
        </div>

        {/* Input field for adding/removing keywords */}
        <div className="mt-6 flex justify-center">
          <form onSubmit={handleInputSubmit} className="w-full max-w-md">
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a word to add or remove it from the map"
                disabled={isProcessing}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {isProcessing && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>
            {showStartButton && (
              <button
                type="button"
                onClick={toggleListening}
                className={`mt-4 w-full flex items-center justify-center gap-3 px-4 py-3 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                  isListening
                    ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/50"
                    : "bg-white text-black hover:bg-white/90 focus:ring-white/50"
                }`}
              >
                <span className="relative flex items-center justify-center">
                  <Mic
                    className={`w-5 h-5 ${isListening ? "text-white" : "text-black"}`}
                  />
                  {isListening && (
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                  )}
                </span>
                {isListening ? "Listening..." : "Start now"}
              </button>
            )}
          </form>
        </div>
      </div>
    </motion.div>
  )
}
