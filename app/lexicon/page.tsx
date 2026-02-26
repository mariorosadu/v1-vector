"use client"

import { useState, useEffect, useRef, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion, LayoutGroup } from "framer-motion"
import { SimpleHeader } from "@/components/simple-header"
import { ChevronUp } from "lucide-react"
import {
  ensureLoaded, subscribe, computeView, findByLabel, setSelectedId,
  type LexiconView,
} from "@/lib/lexicon-store"

// ─── Constants ────────────────────────────────────────────────────────────────
const ROW_H = { parent: 28, siblings: 40, children: 28 }
const DIVIDER_H = 20
const SLIDE_Y = 48  // px to slide rows up/down between levels

// ─── Spring configs ───────────────────────────────────────────────────────────
const spring = { type: "spring", stiffness: 380, damping: 36, mass: 0.8 } as const
const underlineSpring = { type: "spring", stiffness: 500, damping: 40, mass: 0.6 } as const

// ─── DragScroll ───────────────────────────────────────────────────────────────
function DragScroll({ children, height }: { children: React.ReactNode; height: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef({ on: false, startX: 0, left: 0, moved: false })

  const down = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return
    drag.current = { on: true, startX: e.pageX, left: el.scrollLeft, moved: false }
    el.style.cursor = "grabbing"
  }
  const move = (e: React.MouseEvent) => {
    const el = ref.current; if (!drag.current.on || !el) return
    e.preventDefault()
    const d = e.pageX - drag.current.startX
    if (Math.abs(d) > 4) drag.current.moved = true
    el.scrollLeft = drag.current.left - d
  }
  const up = () => { if (ref.current) { drag.current.on = false; ref.current.style.cursor = "grab" } }
  const cap = (e: React.MouseEvent) => {
    if (drag.current.moved) { e.stopPropagation(); drag.current.moved = false }
  }

  return (
    <div
      ref={ref}
      style={{
        height, overflow: "hidden", cursor: "grab",
        userSelect: "none", scrollbarWidth: "none",
        display: "flex", alignItems: "center",
      }}
      onMouseDown={down} onMouseMove={move} onMouseUp={up}
      onMouseLeave={up} onClickCapture={cap}
    >
      {children}
    </div>
  )
}

// ─── Siblings row — centered on selected via CSS scroll into view ─────────────
function SiblingsRow({
  siblings,
  selectedId,
  onSelect,
}: {
  siblings: LexiconView["siblings"]
  selectedId: string
  onSelect: (label: string) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedRef  = useRef<HTMLButtonElement | null>(null)

  // Center selected whenever it changes or siblings list changes
  useEffect(() => {
    const container = containerRef.current
    const el = selectedRef.current
    if (!container || !el) return

    // Pad inner so edge words can reach center
    const pad = container.offsetWidth / 2
    const inner = container.firstElementChild as HTMLElement
    if (inner) {
      inner.style.paddingLeft  = `${pad}px`
      inner.style.paddingRight = `${pad}px`
    }

    const target = el.offsetLeft + el.offsetWidth / 2 - container.offsetWidth / 2
    container.scrollTo({ left: target, behavior: "smooth" })
  }, [selectedId, siblings.length])

  // On first mount — instant (no smooth)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const pad = container.offsetWidth / 2
    const inner = container.firstElementChild as HTMLElement
    if (inner) {
      inner.style.paddingLeft  = `${pad}px`
      inner.style.paddingRight = `${pad}px`
    }
    const sel = container.querySelector("[data-selected='true']") as HTMLElement | null
    if (sel) container.scrollLeft = sel.offsetLeft + sel.offsetWidth / 2 - container.offsetWidth / 2
  }, []) // eslint-disable-line

  return (
    <div
      ref={containerRef}
      style={{
        height: ROW_H.siblings, overflow: "hidden", cursor: "grab",
        userSelect: "none", scrollbarWidth: "none",
        display: "flex", alignItems: "center",
        position: "relative",
      }}
    >
      <LayoutGroup id="lexicon-siblings">
        <div style={{ display: "inline-flex", gap: 36, alignItems: "center", position: "relative" }}>
          {siblings.map((s) => {
            const sel = s.id === selectedId
            return (
              <button
                key={s.id}
                ref={sel ? selectedRef : null}
                data-selected={sel ? "true" : "false"}
                onClick={() => !sel && onSelect(s.label)}
                style={{ flexShrink: 0, position: "relative", paddingBottom: 6, cursor: sel ? "default" : "pointer", border: "none", background: "none" }}
              >
                <span style={{
                  fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase",
                  fontWeight: 400, transition: "color 200ms",
                  color: sel ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.28)",
                  display: "block",
                }}>
                  {s.label}
                </span>
                {sel && (
                  <motion.div
                    layoutId="underline"
                    transition={underlineSpring}
                    style={{
                      position: "absolute", bottom: 0, left: 0, right: 0,
                      height: 1.5, background: "white",
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </LayoutGroup>
    </div>
  )
}

// ─── The three rows as a single animated unit ─────────────────────────────────
const rowVariants = {
  enterFromBelow: { y: SLIDE_Y, opacity: 0 },
  enterFromAbove: { y: -SLIDE_Y, opacity: 0 },
  center:         { y: 0, opacity: 1 },
  exitToAbove:    { y: -SLIDE_Y, opacity: 0 },
  exitToBelow:    { y: SLIDE_Y, opacity: 0 },
}

function RowsBlock({
  view,
  direction,
  onNavigate,
}: {
  view: LexiconView
  direction: "up" | "down" | "lateral"
  onNavigate: (label: string, from: "parent" | "sibling" | "child") => void
}) {
  const enterVariant = direction === "down" ? "enterFromBelow" : direction === "up" ? "enterFromAbove" : "center"
  const exitVariant  = direction === "down" ? "exitToAbove"    : direction === "up" ? "exitToBelow"    : "center"

  return (
    <motion.div
      key={view.selected.id}
      custom={direction}
      variants={rowVariants}
      initial={enterVariant}
      animate="center"
      exit={exitVariant}
      transition={spring}
      style={{ padding: "28px 32px" }}
    >
      {/* ROW 1 — Parent */}
      <DragScroll height={ROW_H.parent}>
        <div style={{ display: "inline-flex", gap: 24, alignItems: "center", paddingLeft: "50%", paddingRight: "50%" }}>
          {view.parent ? (
            <button
              onClick={() => onNavigate(view.parent!.label, "parent")}
              style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", background: "none", border: "none", flexShrink: 0 }}
              className="group"
            >
              <ChevronUp style={{ width: 10, height: 10, color: "rgba(255,255,255,0.25)", transition: "color 200ms" }} className="group-hover:!text-white/60" />
              <span style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.32)", transition: "color 200ms" }} className="group-hover:!text-white/70">
                {view.parent.label}
              </span>
            </button>
          ) : (
            <span style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.14)" }}>root</span>
          )}
        </div>
      </DragScroll>

      {/* Divider */}
      <div style={{ height: DIVIDER_H, display: "flex", alignItems: "center" }}>
        <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.07)" }} />
      </div>

      {/* ROW 2 — Siblings */}
      <SiblingsRow
        siblings={view.siblings}
        selectedId={view.selected.id}
        onSelect={(label) => onNavigate(label, "sibling")}
      />

      {/* Divider */}
      <div style={{ height: DIVIDER_H, display: "flex", alignItems: "center" }}>
        <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.07)" }} />
      </div>

      {/* ROW 3 — Children */}
      <DragScroll height={ROW_H.children}>
        <div style={{ display: "inline-flex", gap: 28, alignItems: "center", paddingLeft: "50%", paddingRight: "50%" }}>
          {view.children.length > 0 ? (
            view.children.map((c) => (
              <button
                key={c.id}
                onClick={() => onNavigate(c.label, "child")}
                style={{ flexShrink: 0, cursor: "pointer", background: "none", border: "none" }}
                className="group"
              >
                <span style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", transition: "color 200ms" }} className="group-hover:!text-white/65">
                  {c.label}
                </span>
              </button>
            ))
          ) : (
            <span style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.13)" }}>leaf</span>
          )}
        </div>
      </DragScroll>
    </motion.div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ background: "#0a0a0a", minHeight: "100dvh", display: "flex", flexDirection: "column" }} className="font-sans">
      <SimpleHeader />
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 64, padding: "64px 16px 16px" }}>
        <div style={{ width: "100%", maxWidth: 640 }}>
          <div style={{ background: "#1c1c1c", borderRadius: 2, border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6)" }}>
            <div style={{ height: 1, background: "rgba(255,255,255,0.18)" }} />
            <div style={{ padding: "20px 0", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ fontSize: 18, fontWeight: 400, letterSpacing: "0.25em", color: "rgba(255,255,255,0.15)", textTransform: "uppercase" }}>Lexicon</span>
            </div>
            <div style={{ padding: "28px 32px" }}>
              {[20, 28, 40, 28].map((h, i) => (
                i === 1 || i === 3
                  ? <div key={i} style={{ height: DIVIDER_H, display: "flex", alignItems: "center" }}><div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.06)" }} /></div>
                  : <div key={i} style={{ height: h, display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
                      {[80, 120, 96].slice(0, i === 0 ? 1 : 3).map((w, j) => (
                        <div key={j} style={{ height: 8, width: w, borderRadius: 2, background: "rgba(255,255,255,0.06)", animation: "pulse 2s infinite" }} />
                      ))}
                    </div>
              ))}
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Page shell ───────────────────────────────────────────────────────────────
export default function LexiconPage() {
  return <Suspense fallback={<Skeleton />}><LexiconInner /></Suspense>
}

// ─── Inner ────────────────────────────────────────────────────────────────────
function LexiconInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [view, setView] = useState<LexiconView | null>(null)
  const [direction, setDirection] = useState<"up" | "down" | "lateral">("lateral")
  const [ready, setReady] = useState(false)

  useEffect(() => {
    ensureLoaded().then(() => {
      const label = params.get("term") ?? "KNOWLEDGE"
      const t = findByLabel(label) ?? findByLabel("KNOWLEDGE")
      if (t) setSelectedId(t.id)
      const v = computeView()
      setView(v)
      setReady(true)
    })
    return subscribe(() => {
      const v = computeView()
      if (v) setView(v)
    })
  }, []) // eslint-disable-line

  const navigate = useCallback((label: string, from: "parent" | "sibling" | "child") => {
    const term = findByLabel(label)
    if (!term || term.id === view?.selected.id) return
    setDirection(from === "child" ? "down" : from === "parent" ? "up" : "lateral")
    setSelectedId(term.id)
    router.replace(`/lexicon?term=${encodeURIComponent(label)}`, { scroll: false })
  }, [view?.selected.id, router])

  if (!ready || !view) return <Skeleton />

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100dvh", display: "flex", flexDirection: "column" }} className="font-sans">
      <SimpleHeader />
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 16px 16px" }}>
        <div style={{ width: "100%", maxWidth: 640 }}>
          <div style={{
            background: "#1c1c1c", borderRadius: 2,
            border: "1px solid rgba(255,255,255,0.05)",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6)",
            overflow: "hidden",
          }}>
            <div style={{ height: 1, background: "rgba(255,255,255,0.18)" }} />

            {/* Title */}
            <div style={{ padding: "20px 0", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <h1 style={{ fontSize: 18, fontWeight: 400, letterSpacing: "0.25em", color: "white", textTransform: "uppercase", margin: 0 }}>
                Lexicon
              </h1>
            </div>

            {/* Animated rows */}
            <div style={{ overflow: "hidden", position: "relative" }}>
              <AnimatePresence mode="wait" initial={false}>
                <RowsBlock
                  key={view.selected.id}
                  view={view}
                  direction={direction}
                  onNavigate={navigate}
                />
              </AnimatePresence>
            </div>

            <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
          </div>
        </div>
      </main>
    </div>
  )
}
