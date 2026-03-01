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
  // Viewbox: 1200 x 820 (taller to accommodate bottom module)
  const W = 1200
  const H = 820
  const CX = W / 2   // 600
  const CY = 340     // slightly above center to leave room at bottom

  // ---- Central Hex ----
  const hexR = 68
  const hexRI = 52
  const makeHexPoints = (cx: number, cy: number, r: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const angle = (Math.PI / 180) * (60 * i - 30)
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
    }).join(" ")

  const hexPoints = makeHexPoints(CX, CY, hexR)
  const hexPointsInner = makeHexPoints(CX, CY, hexRI)

  // ---- Defensive nodes (left) — new order: COMPLIANCE, ETHICS, DATA SECURITY, BIAS ----
  const defNodes = [
    { x: CX - 330, y: CY - 155, label: "COMPLIANCE",    sub: "(Regulatory Gavel)",  icon: "gavel" },
    { x: CX - 370, y: CY - 40,  label: "ETHICS",        sub: "(Scales of Equity)",  icon: "scales" },
    { x: CX - 370, y: CY + 80,  label: "DATA SECURITY", sub: "(Perimeter Lock)",    icon: "lock" },
    { x: CX - 315, y: CY + 190, label: "BIAS",          sub: "(Fairness Engine)",   icon: "bias" },
  ]

  // Lines from center hex to each defensive node
  const centerConnectLeft = (i: number) => ({
    x: CX - hexR * 0.85,
    y: CY - 90 + i * 65,
  })

  // ---- Offensive horizontal timeline (right) ----
  // Track Y level
  const trackY = CY
  const trackX1 = CX + 90
  const trackX2 = CX + 530

  // Three timeline points
  const timelinePoints = [
    { x: CX + 135, y: trackY, label: "UNSTABLE TECH",     sub: "(Discard)",               isPinger: false },
    { x: CX + 310, y: trackY, label: "MATURITY SIGNAL",   sub: "(Threshold Evaluation)",  isPinger: true  },
    { x: CX + 490, y: trackY, label: "STANDARDIZED VALUE", sub: "(Execute)",              isPinger: false },
  ]

  // ---- Bottom Add-on module ----
  const modW = 460
  const modH = 78
  const modX = CX - modW / 2
  const modY = H - 145

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-5xl mx-auto block px-2"
      aria-label="VEKTHÖS Dual Instance Framework Diagram"
      role="img"
    >
      <defs>
        {/* Glow filters */}
        <filter id="amber-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="cyan-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="sentinel-glow" x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="module-glow" x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="pinger-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>

        {/* Gradients */}
        <radialGradient id="center-radial" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.13" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="amber-radial" cx="25%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#ffb300" stopOpacity="0.08" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cyan-radial" cx="75%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="amber-line" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#ffb300" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffb300" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="cyan-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="unify-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#ffb300" stopOpacity="0.5" />
          <stop offset="50%"  stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="module-border" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#ffb300" stopOpacity="0.7" />
          <stop offset="50%"  stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="module-bg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#ffb300" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="track-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#00e5ff" stopOpacity="0.2" />
          <stop offset="50%"  stopColor="#00e5ff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      {/* ── Background glow pools ── */}
      <rect x="0" y="0" width={W} height={H} fill="url(#amber-radial)" />
      <rect x="0" y="0" width={W} height={H} fill="url(#cyan-radial)" />
      <ellipse cx={CX} cy={CY} rx={180} ry={180} fill="url(#center-radial)" />

      {/* ── Subtle grid ── */}
      {Array.from({ length: 13 }, (_, i) => (
        <line key={`vg${i}`} x1={i * 100} y1={0} x2={i * 100} y2={H}
          stroke="white" strokeOpacity="0.022" strokeWidth="1" />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <line key={`hg${i}`} x1={0} y1={i * 100} x2={W} y2={i * 100}
          stroke="white" strokeOpacity="0.022" strokeWidth="1" />
      ))}

      {/* ══════════════════════════════════════════
          LEFT — DEFENSIVE AI GOVERNANCE
      ══════════════════════════════════════════ */}

      {/* Section titles */}
      <text x={50} y={54} fill="#ffb300" fontSize="13" fontFamily="var(--font-mono,monospace)"
        fontWeight="700" letterSpacing="0.2em" opacity="0.95">
        DEFENSIVE AI GOVERNANCE
      </text>
      <text x={50} y={74} fill="#ffb300" fontSize="10" fontFamily="var(--font-mono,monospace)"
        letterSpacing="0.1em" opacity="0.45">
        (The Regulatory Perimeter — Risk Mitigation)
      </text>

      {/* Shield arc */}
      <path
        d={`M ${CX - 50},${CY - 210} A 240 210 0 0 0 ${CX - 50},${CY + 230}`}
        fill="none" stroke="url(#amber-line)" strokeWidth="1.5"
        strokeDasharray="6 5" filter="url(#amber-glow)" opacity="0.6"
      />

      {/* Connection lines from center to each defensive node */}
      {defNodes.map((n, i) => {
        const cx0 = centerConnectLeft(i)
        return (
          <line key={`def-line-${i}`}
            x1={cx0.x} y1={cx0.y}
            x2={n.x + 26} y2={n.y}
            stroke="#ffb300" strokeWidth="1"
            strokeOpacity="0.3" strokeDasharray="4 5"
          />
        )
      })}

      {/* Defensive node modules */}
      {defNodes.map((n, i) => {
        const bw = 148, bh = 60
        const bx = n.x - bw / 2
        const by = n.y - bh / 2
        return (
          <g key={`def-node-${i}`}>
            {/* Node box */}
            <rect x={bx} y={by} width={bw} height={bh} rx={4}
              fill="#0a0a0a" stroke="#ffb300" strokeWidth="1.2" strokeOpacity="0.45"
              filter="url(#amber-glow)"
            />
            {/* Top accent bar */}
            <rect x={bx} y={by} width={bw} height={2} rx={1}
              fill="#ffb300" opacity="0.55"
            />
            {/* Deflect arrows on left side */}
            <polygon
              points={`${bx - 20},${n.y - 6} ${bx - 6},${n.y} ${bx - 20},${n.y + 6}`}
              fill="#ffb300" opacity="0.0"
            />
            {/* Icon area — small amber glyph */}
            <rect x={bx + 10} y={by + 10} width={22} height={22} rx={3}
              fill="#ffb300" fillOpacity="0.08" stroke="#ffb300" strokeWidth="0.8" strokeOpacity="0.4"
            />
            {/* Icon symbol */}
            {n.icon === "gavel" && (
              <>
                <line x1={bx + 15} y1={by + 28} x2={bx + 27} y2={by + 16}
                  stroke="#ffb300" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
                <rect x={bx + 23} y={by + 11} width={8} height={5} rx={1}
                  fill="#ffb300" opacity="0.7" transform={`rotate(-45,${bx + 27},${bx + 16})`}/>
              </>
            )}
            {n.icon === "scales" && (
              <>
                <line x1={bx + 21} y1={by + 12} x2={bx + 21} y2={by + 30}
                  stroke="#ffb300" strokeWidth="1.5" opacity="0.75"/>
                <line x1={bx + 13} y1={by + 15} x2={bx + 29} y2={by + 15}
                  stroke="#ffb300" strokeWidth="1.5" opacity="0.75"/>
                <line x1={bx + 13} y1={by + 15} x2={bx + 13} y2={by + 22}
                  stroke="#ffb300" strokeWidth="1" opacity="0.6"/>
                <line x1={bx + 29} y1={by + 15} x2={bx + 29} y2={by + 20}
                  stroke="#ffb300" strokeWidth="1" opacity="0.6"/>
              </>
            )}
            {n.icon === "lock" && (
              <>
                <rect x={bx + 14} y={by + 19} width={14} height={11} rx={2}
                  fill="none" stroke="#ffb300" strokeWidth="1.5" opacity="0.75"/>
                <path d={`M ${bx + 17},${by + 19} a 4 4 0 0 1 8 0`}
                  fill="none" stroke="#ffb300" strokeWidth="1.5" opacity="0.75"/>
              </>
            )}
            {n.icon === "bias" && (
              <>
                <circle cx={bx + 21} cy={by + 21} r={7}
                  fill="none" stroke="#ffb300" strokeWidth="1.5" opacity="0.75"/>
                <line x1={bx + 21} y1={by + 14} x2={bx + 21} y2={by + 28}
                  stroke="#ffb300" strokeWidth="1" opacity="0.5"/>
                <line x1={bx + 14} y1={by + 21} x2={bx + 28} y2={by + 21}
                  stroke="#ffb300" strokeWidth="1" opacity="0.5"/>
              </>
            )}
            {/* Label text */}
            <text x={bx + 40} y={by + 23} fill="#ffb300" fontSize="10.5"
              fontFamily="var(--font-mono,monospace)" fontWeight="700"
              letterSpacing="0.18em" opacity="0.95">
              {n.label}
            </text>
            <text x={bx + 40} y={by + 38} fill="#ffb300" fontSize="8.5"
              fontFamily="var(--font-mono,monospace)"
              letterSpacing="0.06em" opacity="0.45">
              {n.sub}
            </text>
          </g>
        )
      })}

      {/* ══════════════════════════════════════════
          RIGHT — OFFENSIVE DECISION INTELLIGENCE
      ══════════════════════════════════════════ */}

      {/* Section titles */}
      <text x={W - 50} y={54} textAnchor="end" fill="#00e5ff" fontSize="13"
        fontFamily="var(--font-mono,monospace)" fontWeight="700"
        letterSpacing="0.2em" opacity="0.95">
        OFFENSIVE DECISION INTELLIGENCE
      </text>
      <text x={W - 50} y={74} textAnchor="end" fill="#00e5ff" fontSize="10"
        fontFamily="var(--font-mono,monospace)" letterSpacing="0.1em" opacity="0.45">
        (The S-Curve Jumpcut — Value Capture)
      </text>

      {/* Horizontal timeline track */}
      <line x1={trackX1} y1={trackY} x2={trackX2} y2={trackY}
        stroke="url(#track-line)" strokeWidth="2" filter="url(#cyan-glow)"
      />
      {/* Track end arrow */}
      <polygon
        points={`${trackX2 + 10},${trackY} ${trackX2 - 2},${trackY - 6} ${trackX2 - 2},${trackY + 6}`}
        fill="#00e5ff" opacity="0.7" filter="url(#cyan-glow)"
      />

      {/* Connection line from center to track start */}
      <line
        x1={CX + hexR * 0.85} y1={CY}
        x2={trackX1} y2={trackY}
        stroke="#00e5ff" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 5"
      />

      {/* Timeline nodes */}
      {timelinePoints.map((pt, i) => {
        const labelY = trackY - 65
        const isPinger = pt.isPinger
        return (
          <g key={`tp-${i}`}>
            {/* Vertical tick from track to label */}
            <line x1={pt.x} y1={trackY - 8} x2={pt.x} y2={labelY + 28}
              stroke="#00e5ff" strokeWidth="1" strokeOpacity="0.25" />

            {/* Pinger rings (animated via CSS would need a class; static rings here) */}
            {isPinger && (
              <>
                <circle cx={pt.x} cy={pt.y} r={32} fill="none"
                  stroke="#00e5ff" strokeWidth="0.8" strokeOpacity="0.12" />
                <circle cx={pt.x} cy={pt.y} r={22} fill="none"
                  stroke="#00e5ff" strokeWidth="1" strokeOpacity="0.25" />
                <circle cx={pt.x} cy={pt.y} r={14} fill="none"
                  stroke="#00e5ff" strokeWidth="1.5" strokeOpacity="0.55"
                  filter="url(#pinger-glow)" />
                {/* Radar crosshairs */}
                <line x1={pt.x - 20} y1={pt.y} x2={pt.x + 20} y2={pt.y}
                  stroke="#00e5ff" strokeWidth="0.8" strokeOpacity="0.3" />
                <line x1={pt.x} y1={pt.y - 20} x2={pt.x} y2={pt.y + 20}
                  stroke="#00e5ff" strokeWidth="0.8" strokeOpacity="0.3" />
              </>
            )}

            {/* Main dot */}
            <circle cx={pt.x} cy={pt.y} r={isPinger ? 7 : 5}
              fill="#0a0a0a" stroke="#00e5ff"
              strokeWidth={isPinger ? 2 : 1.5}
              filter="url(#cyan-glow)"
              strokeOpacity={isPinger ? 1 : 0.75}
            />
            <circle cx={pt.x} cy={pt.y} r={isPinger ? 3 : 2.5}
              fill="#00e5ff" opacity={isPinger ? 1 : 0.75}
            />

            {/* Label box */}
            <rect
              x={pt.x - (isPinger ? 90 : 75)} y={labelY - 22}
              width={isPinger ? 180 : 150} height={isPinger ? 52 : 46}
              rx={3}
              fill="#0a0a0a" stroke="#00e5ff"
              strokeWidth={isPinger ? 1.2 : 0.8}
              strokeOpacity={isPinger ? 0.7 : 0.35}
              filter={isPinger ? "url(#cyan-glow)" : undefined}
            />
            {/* Top accent bar */}
            <rect
              x={pt.x - (isPinger ? 90 : 75)} y={labelY - 22}
              width={isPinger ? 180 : 150} height={2} rx={1}
              fill="#00e5ff" opacity={isPinger ? 0.8 : 0.4}
            />

            {/* If pinger: radar icon */}
            {isPinger && (
              <>
                <circle cx={pt.x - 68} cy={labelY + 3} r={9}
                  fill="none" stroke="#00e5ff" strokeWidth="1" strokeOpacity="0.5" />
                <circle cx={pt.x - 68} cy={labelY + 3} r={4}
                  fill="none" stroke="#00e5ff" strokeWidth="1" strokeOpacity="0.7" />
                <circle cx={pt.x - 68} cy={labelY + 3} r={1.5}
                  fill="#00e5ff" opacity="0.9" />
              </>
            )}

            <text
              x={isPinger ? pt.x + (isPinger ? -50 : 0) : pt.x - (i === 0 ? 0 : -0)}
              y={labelY - 4}
              textAnchor="middle"
              fill="#00e5ff" fontSize={isPinger ? 11 : 10}
              fontFamily="var(--font-mono,monospace)" fontWeight="700"
              letterSpacing="0.16em" opacity="0.95"
            >
              {pt.label}
            </text>
            <text
              x={isPinger ? pt.x - 50 : pt.x}
              y={labelY + 12}
              textAnchor="middle"
              fill="#00e5ff" fontSize="9"
              fontFamily="var(--font-mono,monospace)"
              letterSpacing="0.07em" opacity="0.5"
            >
              {pt.sub}
            </text>
          </g>
        )
      })}

      {/* ══════════════════════════════════════════
          CENTER — VEKTHÖS HUB
      ══════════════════════════════════════════ */}

      {/* Outer pulse ring */}
      <polygon points={makeHexPoints(CX, CY, hexR + 14)}
        fill="none" stroke="white" strokeWidth="0.8" strokeOpacity="0.06" />
      {/* Main hex */}
      <polygon points={hexPoints}
        fill="#0a0a0a" stroke="white" strokeWidth="1.3" strokeOpacity="0.3"
        filter="url(#sentinel-glow)" />
      {/* Inner hex */}
      <polygon points={hexPointsInner}
        fill="none" stroke="white" strokeWidth="0.8" strokeOpacity="0.15" />

      {/* Eye icon */}
      <ellipse cx={CX} cy={CY - 12} rx={23} ry={13}
        fill="none" stroke="white" strokeWidth="1.3" strokeOpacity="0.75" />
      <circle cx={CX} cy={CY - 12} r={8}
        fill="none" stroke="white" strokeWidth="1.2" strokeOpacity="0.55" />
      <circle cx={CX} cy={CY - 12} r={3.5}
        fill="white" opacity="0.9" />
      {/* Eye crosshairs */}
      <line x1={CX - 28} y1={CY - 12} x2={CX - 16} y2={CY - 12}
        stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />
      <line x1={CX + 16} y1={CY - 12} x2={CX + 28} y2={CY - 12}
        stroke="white" strokeWidth="0.8" strokeOpacity="0.3" />

      {/* VEKTHÖS label (replaces SENTINEL NODE) */}
      <text x={CX} y={CY + 16} textAnchor="middle"
        fill="white" fontSize="12" fontFamily="var(--font-mono,monospace)"
        fontWeight="700" letterSpacing="0.28em" opacity="0.85">
        VEKTHÖS
      </text>

      {/* ══════════════════════════════════════════
          BOTTOM — TAGLINE + ADD-ON MODULE
      ══════════════════════════════════════════ */}

      {/* Unifying line */}
      <line x1={80} y1={modY - 42} x2={W - 80} y2={modY - 42}
        stroke="url(#unify-line)" strokeWidth="1" opacity="0.6" />
      <circle cx={80} cy={modY - 42} r={2.5} fill="#ffb300" opacity="0.5" />
      <circle cx={W - 80} cy={modY - 42} r={2.5} fill="#00e5ff" opacity="0.5" />

      {/* Tagline */}
      <text x={CX} y={modY - 18} textAnchor="middle"
        fill="white" fontSize="12" fontFamily="var(--font-mono,monospace)"
        fontWeight="700" letterSpacing="0.3em" opacity="0.55">
        ONE PLATFORM. SYSTEMS-LEVEL DECISION INTELLIGENCE.
      </text>

      {/* Add-on module box */}
      <rect x={modX} y={modY} width={modW} height={modH} rx={5}
        fill="url(#module-bg)" filter="url(#module-glow)"
      />
      <rect x={modX} y={modY} width={modW} height={modH} rx={5}
        fill="none" stroke="url(#module-border)" strokeWidth="1.4"
      />
      {/* Corner accents */}
      <rect x={modX} y={modY} width={16} height={2} fill="#ffb300" opacity="0.7" />
      <rect x={modX} y={modY} width={2} height={16} fill="#ffb300" opacity="0.7" />
      <rect x={modX + modW - 16} y={modY} width={16} height={2} fill="#00e5ff" opacity="0.7" />
      <rect x={modX + modW - 2} y={modY} width={2} height={16} fill="#00e5ff" opacity="0.7" />
      <rect x={modX} y={modY + modH - 2} width={16} height={2} fill="#ffb300" opacity="0.5" />
      <rect x={modX + modW - 16} y={modY + modH - 2} width={16} height={2} fill="#00e5ff" opacity="0.5" />

      {/* Module icon — combined glyph */}
      <circle cx={modX + 36} cy={modY + modH / 2} r={18}
        fill="none" stroke="url(#module-border)" strokeWidth="1" opacity="0.6" />
      <circle cx={modX + 36} cy={modY + modH / 2} r={10}
        fill="none" stroke="url(#module-border)" strokeWidth="1.2" opacity="0.5" />
      <circle cx={modX + 36} cy={modY + modH / 2} r={3}
        fill="white" opacity="0.55" />
      {/* Plus cross inside icon */}
      <line x1={modX + 29} y1={modY + modH / 2} x2={modX + 43} y2={modY + modH / 2}
        stroke="white" strokeWidth="1.2" strokeOpacity="0.35" />
      <line x1={modX + 36} y1={modY + modH / 2 - 7} x2={modX + 36} y2={modY + modH / 2 + 7}
        stroke="white" strokeWidth="1.2" strokeOpacity="0.35" />

      {/* Module text */}
      <text x={modX + 64} y={modY + 31} fill="white" fontSize="13"
        fontFamily="var(--font-mono,monospace)" fontWeight="700"
        letterSpacing="0.2em" opacity="0.9">
        RISK ASSESSMENT FOR FULL MIGRATION
      </text>
      <text x={modX + 64} y={modY + 50} fill="white" fontSize="10"
        fontFamily="var(--font-mono,monospace)"
        letterSpacing="0.1em" opacity="0.4">
        (Add-on)
      </text>
    </svg>
  )
}

// Helper exposed outside function for reuse (hex points calculation)
function makeHexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30)
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  }).join(" ")
}
