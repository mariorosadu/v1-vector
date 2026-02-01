"use client"

import React from "react"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

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

const connections: Edge[] = [
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

export function NetworkGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<Node[]>([])
  const hoveredNodeRef = useRef<string | null>(null)
  const animationFrameRef = useRef<number>()
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  // Initialize nodes with random positions
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(canvas.width, canvas.height) * 0.35

    const initialNodes: Node[] = keywords.map((keyword, index) => {
      const angle = (index / keywords.length) * Math.PI * 2
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
  }, [])

  // Physics simulation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const animate = () => {
      const newNodes = nodesRef.current.map((node) => ({ ...node }))

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

        // Node circle
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = isHovered
          ? "rgba(255, 255, 255, 0.8)"
          : "rgba(255, 255, 255, 0.3)"
        ctx.fill()

        // Node label
        ctx.font = isHovered ? "14px Inter" : "12px Inter"
        ctx.fillStyle = isHovered ? "#fff" : "rgba(255, 255, 255, 0.7)"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(node.label, node.x, node.y - 20)
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Mouse interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

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
          className="w-full h-auto"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            hoveredNodeRef.current = null
          }}
        />
        
        {/* Legend */}
        <div className="mt-6 text-center text-white/40 text-sm">
          <p>Hover over nodes to explore connections between cognitive concepts</p>
        </div>
      </div>
    </motion.div>
  )
}
