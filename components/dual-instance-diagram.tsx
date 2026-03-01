"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

export function DualInstanceDiagram() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section
      ref={ref}
      className="relative py-16 md:py-28 bg-[#0a0a0a] overflow-hidden"
      style={{ scrollMarginTop: "64px" }}
    >
      {/* Section label */}
      <div className="container mx-auto px-6 md:px-12 mb-10">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-white/40 text-xs tracking-[0.3em] uppercase mb-3"
        >
          The Dual Instance Framework
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-2xl md:text-4xl font-light text-white leading-tight tracking-tight max-w-2xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span className="text-balance">
            One platform. Systems-level decision intelligence.
          </span>
        </motion.h2>
      </div>

      {/* Diagram */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1, delay: 0.25 }}
        className="w-full"
      >
        <DiagramSVG />
      </motion.div>
    </section>
  )
}

function DiagramSVG() {
  // Viewbox: 1200 x 660
  const W = 1200
  const H = 660
  const CX = W / 2   // 600
  const CY = H / 2   // 330

  // ---- Sentinel Node (center) ----
  // Hexagon vertices for a flat-top hex of radius 62
  const hexR = 62
  const hexPoints = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30)
    return `${CX + hexR * Math.cos(angle)},${CY + hexR * Math.sin(angle)}`
  }).join(" ")

  // Inner hexagon (slightly smaller)
  const hexRI = 48
  const hexPointsInner = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30)
    return `${CX + hexRI * Math.cos(angle)},${CY + hexRI * Math.sin(angle)}`
  }).join(" ")

  // ---- Defensive shield arc (left) ----
  // Semi-circle arc from top-left to bottom-left, curving outward
  const shieldRX = 220
  const shieldRY = 200
  // Arc path: from (CX - 30, CY - 200) curving left to (CX - 30, CY + 200)
  const shieldPath = `M ${CX - 40},${CY - 195} A ${shieldRX} ${shieldRY} 0 0 0 ${CX - 40},${CY + 195}`

  // Defensive node positions (left side)
  const defNodes = [
    { x: CX - 310, y: CY - 145, label: "ETHICS",       sub: "Scales of Equity" },
    { x: CX - 350, y: CY - 45,  label: "BIAS",         sub: "Fairness Engine" },
    { x: CX - 350, y: CY + 65,  label: "COMPLIANCE",   sub: "Regulatory Gavel" },
    { x: CX - 295, y: CY + 160, label: "DATA SECURITY", sub: "Perimeter Lock" },
  ]

  // ---- Offensive S-curve (right) ----
  // Cubic bezier S-curve going bottom-right to top-right
  const sStart = { x: CX + 80, y: CY + 180 }
  const sEnd   = { x: CX + 460, y: CY - 195 }
  const sCurve = `M ${sStart.x},${sStart.y} C ${sStart.x + 60},${sStart.y - 50} ${sStart.x + 100},${sStart.y - 120} ${CX + 260},${CY + 10} S ${sEnd.x - 80},${sEnd.y + 120} ${sEnd.x},${sEnd.y}`

  // Milestones along the S-curve (approximate positions)
  const milestones = [
    { x: CX + 115,  y: CY + 155,  label: "LAYER 1",          sub: "Brittle Tech — DEFER",           align: "start" },
    { x: CX + 265,  y: CY + 10,   label: "MATURITY SIGNAL",  sub: "Radar Tracker Active",           align: "middle" },
    { x: CX + 430,  y: CY - 175,  label: "LAYER 2",          sub: "Standardized Value — EXECUTE",   align: "end" },
  ]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-5xl mx-auto block px-2"
      aria-label="VEKTHÖS Dual Instance Framework Diagram"
      role="img"
    >
      <defs>
        {/* Amber glow filter */}
        <filter id="amber-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Cyan glow filter */}
        <filter id="cyan-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Sentinel glow */}
        <filter id="sentinel-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Soft radial for center */}
        <radialGradient id="center-radial" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.12" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        {/* Amber radial for left */}
        <radialGradient id="amber-radial" cx="30%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb300" stopOpacity="0.07" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        {/* Cyan radial for right */}
        <radialGradient id="cyan-radial" cx="70%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.07" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        {/* Amber line gradient */}
        <linearGradient id="amber-line" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#ffb300" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffb300" stopOpacity="0.2" />
        </linearGradient>
        {/* Cyan line gradient */}
        <linearGradient id="cyan-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.9" />
        </linearGradient>
        {/* Unifying line gradient */}
        <linearGradient id="unify-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffb300" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* ── Background glow pools ── */}
      <rect x="0" y="0" width={W} height={H} fill="url(#amber-radial)" />
      <rect x="0" y="0" width={W} height={H} fill="url(#cyan-radial)" />
      <ellipse cx={CX} cy={CY} rx={160} ry={160} fill="url(#center-radial)" />

      {/* ── Subtle grid lines ── */}
      {Array.from({ length: 13 }, (_, i) => (
        <line
          key={`vg${i}`}
          x1={i * 100} y1={0} x2={i * 100} y2={H}
          stroke="white" strokeOpacity="0.025" strokeWidth="1"
        />
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <line
          key={`hg${i}`}
          x1={0} y1={i * 110} x2={W} y2={i * 110}
          stroke="white" strokeOpacity="0.025" strokeWidth="1"
        />
      ))}

      {/* ══════════════════════════════════════════
          LEFT — DEFENSIVE AI GOVERNANCE
      ══════════════════════════════════════════ */}

      {/* Shield arc */}
      <path
        d={shieldPath}
        fill="none"
        stroke="url(#amber-line)"
        strokeWidth="1.5"
        strokeDasharray="6 4"
        filter="url(#amber-glow)"
        opacity="0.7"
      />

      {/* Connection lines: center → each defensive node */}
      {defNodes.map((n, i) => (
        <g key={`def-line-${i}`}>
          <line
            x1={CX - 55} y1={CY + (i - 1.5) * 35}
            x2={n.x + 18} y2={n.y}
            stroke="#ffb300"
            strokeWidth="1"
            strokeOpacity="0.35"
            strokeDasharray="4 4"
          />
          {/* Deflect arrow (pointing away from center) */}
          <polygon
            points={`${n.x - 14},${n.y - 5} ${n.x - 24},${n.y} ${n.x - 14},${n.y + 5}`}
            fill="#ffb300"
            opacity="0.7"
            filter="url(#amber-glow)"
          />
        </g>
      ))}

      {/* Defensive node circles */}
      {defNodes.map((n, i) => (
        <g key={`def-node-${i}`}>
          {/* Outer ring */}
          <circle cx={n.x} cy={n.y} r={26} fill="none" stroke="#ffb300" strokeWidth="1" strokeOpacity="0.35" />
          {/* Inner fill */}
          <circle cx={n.x} cy={n.y} r={18} fill="#0a0a0a" stroke="#ffb300" strokeWidth="1.5" filter="url(#amber-glow)" strokeOpacity="0.8" />
          {/* Icon placeholder — amber dot */}
          <circle cx={n.x} cy={n.y} r={4} fill="#ffb300" opacity="0.9" />
          {/* Label */}
          <text
            x={n.x - 36}
            y={n.y + 40}
            textAnchor="middle"
            fill="#ffb300"
            fontSize="9"
            fontFamily="var(--font-mono, monospace)"
            letterSpacing="0.18em"
            opacity="0.9"
          >
            {n.label}
          </text>
          <text
            x={n.x - 36}
            y={n.y + 52}
            textAnchor="middle"
            fill="#ffb300"
            fontSize="7.5"
            fontFamily="var(--font-mono, monospace)"
            letterSpacing="0.08em"
            opacity="0.45"
          >
            {n.sub}
          </text>
        </g>
      ))}

      {/* Left section title */}
      <text
        x={120}
        y={48}
        fill="#ffb300"
        fontSize="11"
        fontFamily="var(--font-mono, monospace)"
        fontWeight="700"
        letterSpacing="0.22em"
        opacity="0.95"
      >
        DEFENSIVE AI GOVERNANCE
      </text>
      <text
        x={120}
        y={64}
        fill="#ffb300"
        fontSize="8.5"
        fontFamily="var(--font-mono, monospace)"
        letterSpacing="0.12em"
        opacity="0.45"
      >
        The Regulatory Perimeter (Risk Mitigation)
      </text>

      {/* ══════════════════════════════════════════
          RIGHT — OFFENSIVE DECISION INTELLIGENCE
      ══════════════════════════════════════════ */}

      {/* S-Curve trajectory */}
      <path
        d={sCurve}
        fill="none"
        stroke="url(#cyan-line)"
        strokeWidth="2"
        filter="url(#cyan-glow)"
        opacity="0.85"
      />

      {/* Barrier line being broken through */}
      <line
        x1={CX + 340} y1={CY - 230}
        x2={CX + 340} y2={CY + 50}
        stroke="#00e5ff"
        strokeWidth="1"
        strokeOpacity="0.2"
        strokeDasharray="3 6"
      />
      {/* Break marker */}
      <rect x={CX + 331} y={CY - 100} width={18} height={8} fill="#0a0a0a" />
      <line x1={CX + 332} y1={CY - 96} x2={CX + 348} y2={CY - 96} stroke="#00e5ff" strokeWidth="1.5" strokeOpacity="0.7" />

      {/* Milestone dots + labels */}
      {milestones.map((m, i) => {
        const isPinger = i === 1
        return (
          <g key={`mil-${i}`}>
            {/* Connection tick */}
            <line
              x1={m.x} y1={m.y}
              x2={m.x + (isPinger ? 0 : i === 0 ? -30 : 30)} y2={m.y - 38}
              stroke="#00e5ff"
              strokeWidth="1"
              strokeOpacity="0.3"
            />
            {/* Pinger ring for milestone 2 */}
            {isPinger && (
              <>
                <circle cx={m.x} cy={m.y} r={22} fill="none" stroke="#00e5ff" strokeWidth="1" strokeOpacity="0.2" />
                <circle cx={m.x} cy={m.y} r={14} fill="none" stroke="#00e5ff" strokeWidth="1.5" strokeOpacity="0.5" filter="url(#cyan-glow)" />
              </>
            )}
            {/* Main dot */}
            <circle cx={m.x} cy={m.y} r={isPinger ? 6 : 5} fill="#00e5ff" opacity={isPinger ? 1 : 0.7} filter="url(#cyan-glow)" />
            {/* Upward arrow on milestone 3 */}
            {i === 2 && (
              <polygon
                points={`${m.x},${m.y - 34} ${m.x - 5},${m.y - 24} ${m.x + 5},${m.y - 24}`}
                fill="#00e5ff"
                opacity="0.8"
                filter="url(#cyan-glow)"
              />
            )}
            {/* Label box */}
            <text
              x={m.x + (i === 0 ? -32 : i === 2 ? 32 : 0)}
              y={m.y - 48}
              textAnchor={m.align}
              fill="#00e5ff"
              fontSize="9"
              fontFamily="var(--font-mono, monospace)"
              fontWeight="700"
              letterSpacing="0.18em"
              opacity="0.95"
            >
              {m.label}
            </text>
            <text
              x={m.x + (i === 0 ? -32 : i === 2 ? 32 : 0)}
              y={m.y - 36}
              textAnchor={m.align}
              fill="#00e5ff"
              fontSize="7.5"
              fontFamily="var(--font-mono, monospace)"
              letterSpacing="0.08em"
              opacity="0.5"
            >
              {m.sub}
            </text>
          </g>
        )
      })}

      {/* Right section title */}
      <text
        x={W - 120}
        y={48}
        textAnchor="end"
        fill="#00e5ff"
        fontSize="11"
        fontFamily="var(--font-mono, monospace)"
        fontWeight="700"
        letterSpacing="0.22em"
        opacity="0.95"
      >
        OFFENSIVE DECISION INTELLIGENCE
      </text>
      <text
        x={W - 120}
        y={64}
        textAnchor="end"
        fill="#00e5ff"
        fontSize="8.5"
        fontFamily="var(--font-mono, monospace)"
        letterSpacing="0.12em"
        opacity="0.45"
      >
        The S-Curve Radar (Value Capture)
      </text>

      {/* ══════════════════════════════════════════
          CENTER — SENTINEL NODE
      ══════════════════════════════════════════ */}

      {/* Outer pulse ring */}
      <polygon
        points={hexPoints}
        fill="none"
        stroke="white"
        strokeWidth="1"
        strokeOpacity="0.08"
      />
      {/* Main hex */}
      <polygon
        points={hexPoints}
        fill="#0a0a0a"
        stroke="white"
        strokeWidth="1.2"
        strokeOpacity="0.35"
        filter="url(#sentinel-glow)"
      />
      {/* Inner hex */}
      <polygon
        points={hexPointsInner}
        fill="none"
        stroke="white"
        strokeWidth="0.8"
        strokeOpacity="0.18"
      />
      {/* Eye shape — outer ellipse */}
      <ellipse cx={CX} cy={CY} rx={22} ry={13} fill="none" stroke="white" strokeWidth="1.2" strokeOpacity="0.7" />
      {/* Iris */}
      <circle cx={CX} cy={CY} r={8} fill="none" stroke="white" strokeWidth="1.2" strokeOpacity="0.55" />
      {/* Pupil */}
      <circle cx={CX} cy={CY} r={3.5} fill="white" opacity="0.9" />
      {/* Cross-hairs on eye */}
      <line x1={CX - 26} y1={CY} x2={CX - 14} y2={CY} stroke="white" strokeWidth="0.8" strokeOpacity="0.35" />
      <line x1={CX + 14} y1={CY} x2={CX + 26} y2={CY} stroke="white" strokeWidth="0.8" strokeOpacity="0.35" />
      <line x1={CX} y1={CY - 18} x2={CX} y2={CY - 10} stroke="white" strokeWidth="0.8" strokeOpacity="0.35" />
      <line x1={CX} y1={CY + 10} x2={CX} y2={CY + 18} stroke="white" strokeWidth="0.8" strokeOpacity="0.35" />

      {/* Sentinel label */}
      <text
        x={CX}
        y={CY + hexR + 20}
        textAnchor="middle"
        fill="white"
        fontSize="8"
        fontFamily="var(--font-mono, monospace)"
        letterSpacing="0.25em"
        opacity="0.4"
      >
        SENTINEL NODE
      </text>

      {/* ══════════════════════════════════════════
          BOTTOM — UNIFYING LINE + MESSAGE
      ══════════════════════════════════════════ */}
      <line
        x1={80} y1={H - 52}
        x2={W - 80} y2={H - 52}
        stroke="url(#unify-line)"
        strokeWidth="1"
        opacity="0.6"
      />
      {/* Dots at ends */}
      <circle cx={80} cy={H - 52} r={2.5} fill="#ffb300" opacity="0.5" />
      <circle cx={W - 80} cy={H - 52} r={2.5} fill="#00e5ff" opacity="0.5" />

      <text
        x={CX}
        y={H - 28}
        textAnchor="middle"
        fill="white"
        fontSize="10"
        fontFamily="var(--font-mono, monospace)"
        fontWeight="700"
        letterSpacing="0.3em"
        opacity="0.55"
      >
        ONE PLATFORM. SYSTEMS-LEVEL DECISION INTELLIGENCE.
      </text>
    </svg>
  )
}
