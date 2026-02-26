"use client"

import { useState, useEffect, useRef, useCallback, useLayoutEffect, Suspense, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { SimpleHeader } from "@/components/simple-header"
import { ChevronUp } from "lucide-react"
import {
  ensureLoaded, subscribe, computeView, findByLabel, setSelectedId,
  type LexiconView,
} from "@/lib/lexicon-store"

// ─── Fixed row heights (px) ───────────────────────────────────────────────────
const H = { parent: 28, divider: 20, siblings: 40, children: 28 }

// ─── DragScroll ───────────────────────────────────────────────────────────────
function DragScroll({ children, style, innerRef }: {
  children: React.ReactNode
  style?: React.CSSProperties
  innerRef?: React.RefObject<HTMLDivElement | null>
}) {
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef({ on: false, startX: 0, left: 0, moved: false })

  useEffect(() => {
    if (innerRef) (innerRef as React.MutableRefObject<HTMLDivElement | null>).current = ref.current
  })

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
  const clickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) { e.stopPropagation(); drag.current.moved = false }
  }

  return (
    <div ref={ref} style={{ overflowX: "auto", overflowY: "hidden", cursor: "grab",
      userSelect: "none", scrollbarWidth: "none", ...style }}
      onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up} onClickCapture={clickCapture}
    >
      {children}
    </div>
  )
}

// ─── Center helpers ───────────────────────────────────────────────────────────
function centerLeft(container: HTMLDivElement, el: HTMLElement) {
  return el.offsetLeft + el.offsetWidth / 2 - container.offsetWidth / 2
}

function centerWordInstant(container: HTMLDivElement | null, label: string) {
  if (!container) return
  const el = container.querySelector(`[data-label="${CSS.escape(label)}"]`) as HTMLElement | null
  if (!el) return
  container.scrollLeft = centerLeft(container, el)
}

function centerWordAnimated(container: HTMLDivElement | null, label: string, duration = 380): Promise<void> {
  return new Promise<void>((resolve) => {
    if (!container) return resolve()
    const el = container.querySelector(`[data-label="${CSS.escape(label)}"]`) as HTMLElement | null
    if (!el) return resolve()
    const from = container.scrollLeft
    const to = centerLeft(container, el)
    if (!Number.isFinite(to) || Math.abs(to - from) < 0.5) {
      container.scrollLeft = to
      return resolve()
    }
    const start = performance.now()
    const ease = (t: number) => 1 - Math.pow(1 - t, 3)
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      container.scrollLeft = from + (to - from) * ease(t)
      if (t < 1) requestAnimationFrame(tick)
      else resolve()
    }
    requestAnimationFrame(tick)
  })
}

function nextFrame() {
  return new Promise<void>((r) => requestAnimationFrame(() => r()))
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="bg-[#0a0a0a] min-h-dvh flex flex-col font-sans">
      <SimpleHeader />
      <main className="flex-1 flex items-center justify-center pt-16 px-4">
        <div className="w-full max-w-2xl">
          <div className="bg-[#1c1c1c] rounded-sm border border-white/5 shadow-2xl shadow-black/60 overflow-hidden">
            <div className="h-px bg-white/20" />
            <div className="py-6 text-center border-b border-white/10">
              <span className="text-xl font-normal tracking-[0.25em] text-white/20 uppercase">Lexicon</span>
            </div>
            <div className="px-8 py-8 space-y-0">
              <div style={{ height: H.parent }} className="flex items-center justify-center">
                <div className="h-2 w-20 rounded bg-white/8 animate-pulse" />
              </div>
              <div style={{ height: H.divider }} className="flex items-center"><div className="w-full h-px bg-white/8" /></div>
              <div style={{ height: H.siblings }} className="flex items-center justify-center gap-8">
                {[80,120,96].map((w,i) => <div key={i} className="h-3 rounded bg-white/8 animate-pulse flex-shrink-0" style={{ width: w }} />)}
              </div>
              <div style={{ height: H.divider }} className="flex items-center"><div className="w-full h-px bg-white/8" /></div>
              <div style={{ height: H.children }} className="flex items-center justify-center gap-6">
                {[64,96,80].map((w,i) => <div key={i} className="h-2 rounded bg-white/8 animate-pulse flex-shrink-0" style={{ width: w }} />)}
              </div>
            </div>
            <div className="h-px bg-white/8" />
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
  const [view, setView]   = useState<LexiconView | null>(null)
  const [nextView, setNextView] = useState<LexiconView | null>(null)
  const [ready, setReady] = useState(false)
  const [direction, setDirection] = useState<"up" | "down" | "none">("none")

  // Scroll container refs
  const parentRef   = useRef<HTMLDivElement | null>(null)
  const siblingsRef = useRef<HTMLDivElement | null>(null)
  const siblingsInnerRef = useRef<HTMLDivElement | null>(null)
  const childrenRef = useRef<HTMLDivElement | null>(null)

  // Lock to prevent overlapping navigations
  const busy = useRef(false)
  const pendingCenter = useRef<{ label: string; mode: "instant" | "animate" } | null>(null)

  // Memoize current view so DOM doesn't change mid-animation
  const displayView = useMemo(() => view, [view?.selected.id])

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

  // Center siblings on initial load + after vertical animation completes
  useLayoutEffect(() => {
    if (!ready || !displayView) return
    const sc = siblingsRef.current
    const si = siblingsInnerRef.current
    if (!sc || !si) return
    const half = sc.offsetWidth / 2
    si.style.paddingLeft  = `${half}px`
    si.style.paddingRight = `${half}px`
    centerWordInstant(sc, displayView.selected.label)
  }, [ready, displayView?.selected?.id, displayView?.siblings?.length]) // eslint-disable-line

  // Sibling horizontal centering with animation
  useEffect(() => {
    if (!ready || !view) return
    const p = pendingCenter.current
    if (!p || p.mode !== "animate") return
    const sc = siblingsRef.current
    if (!sc) return
    pendingCenter.current = null
    requestAnimationFrame(() => {
      centerWordAnimated(sc, p.label, 260)
    })
  }, [ready, view?.selected?.id, view?.siblings?.length]) // eslint-disable-line

  // ─── Navigate ───────────────────────────────────────────────────────────────
  const navigate = useCallback(async (label: string, from: "parent" | "sibling" | "child") => {
    if (busy.current) return
    const term = findByLabel(label)
    if (!term || term.id === view?.selected.id) return
    busy.current = true

    try {
      // ── Sibling: horizontal only, no vertical animation ─────────────────
      if (from === "sibling") {
        pendingCenter.current = { label, mode: "animate" }
        setSelectedId(term.id)
        router.replace(`/lexicon?term=${encodeURIComponent(label)}`, { scroll: false })
        return
      }

      // ── Parent / Child: center word first, then vertical animation ──────
      const sourceContainer = from === "child" ? childrenRef.current : parentRef.current
      await centerWordAnimated(sourceContainer, label, 360)

      // Prepare next view (don't commit yet)
      setSelectedId(term.id)
      const newV = computeView()
      if (newV) {
        setNextView(newV)
        setDirection(from === "child" ? "up" : "down")
      }
      
      await nextFrame()
    } finally {
      busy.current = false
    }
  }, [view?.selected?.id, router])

  if (!ready || !displayView) return <Skeleton />

  // Determine animation state
  const isAnimating = nextView !== null
  const animView = isAnimating ? nextView : displayView
  const stackVariants = {
    enter: (d: "up" | "down" | "none") => ({
      y: d === "up" ? 20 : d === "down" ? -20 : 0,
      opacity: 0,
    }),
    visible: { y: 0, opacity: 1 },
    exit: (d: "up" | "down" | "none") => ({
      y: d === "up" ? -20 : d === "down" ? 20 : 0,
      opacity: 0,
    }),
  }

  return (
    <div className="bg-[#0a0a0a] min-h-dvh flex flex-col font-sans">
      <SimpleHeader />
      <main className="flex-1 flex items-center justify-center pt-16 px-4">
        <div className="w-full max-w-2xl">
          <div className="bg-[#1c1c1c] rounded-sm border border-white/5 shadow-2xl shadow-black/60">

            <div className="h-px bg-white/20" />

            {/* Title */}
            <div className="py-6 border-b border-white/10 text-center">
              <h1 className="text-xl font-normal tracking-[0.25em] text-white uppercase">Lexicon</h1>
            </div>

            {/* Clip window for vertical slide */}
            <div style={{ overflow: "hidden" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={animView?.selected.id}
                  custom={direction}
                  variants={stackVariants}
                  initial="enter"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.48, ease: [0.33, 1, 0.68, 1] }}
                  onAnimationComplete={() => {
                    if (isAnimating) {
                      setView(nextView)
                      setNextView(null)
                      setDirection("none")
                    }
                    busy.current = false
                  }}
                  className="px-8 py-8"
                >

                  {/* ROW 1 — Parent */}
                  <DragScroll innerRef={parentRef}
                    style={{ height: H.parent, display: "flex", alignItems: "center", whiteSpace: "nowrap" }}
                  >
                    <div data-row="parent"
                      style={{ display: "inline-flex", gap: 24, alignItems: "center", paddingLeft: "50%", paddingRight: "50%" }}
                    >
                      {animView.parent ? (
                        <button
                          data-label={animView.parent.label}
                          onClick={() => navigate(animView.parent!.label, "parent")}
                          className="flex items-center gap-1.5 group cursor-pointer flex-shrink-0"
                        >
                          <ChevronUp className="w-2.5 h-2.5 text-white/25 group-hover:text-white/60 transition-colors" />
                          <span className="text-[11px] tracking-[0.22em] uppercase text-white/35 group-hover:text-white/70 transition-colors">
                            {animView.parent.label}
                          </span>
                        </button>
                      ) : (
                        <span className="text-[11px] tracking-[0.22em] uppercase text-white/15">root</span>
                      )}
                    </div>
                  </DragScroll>

                  {/* Divider */}
                  <div style={{ height: H.divider, display: "flex", alignItems: "center" }}>
                    <div className="w-full h-px bg-white/8" />
                  </div>

                  {/* ROW 2 — Siblings (with layoutId underline) */}
                  <DragScroll innerRef={siblingsRef}
                    style={{ height: H.siblings, display: "flex", alignItems: "center", whiteSpace: "nowrap" }}
                  >
                    <div data-row="siblings" ref={siblingsInnerRef}
                      style={{ display: "inline-flex", gap: 36, alignItems: "center", position: "relative" }}
                    >
                      {animView.siblings.map((s) => {
                        const sel = s.id === animView.selected.id
                        return (
                          <button key={s.id}
                            data-label={s.label}
                            data-selected={sel ? "true" : "false"}
                            onClick={() => !sel && navigate(s.label, "sibling")}
                            className={`relative flex-shrink-0 pb-1.5 ${sel ? "cursor-default" : "cursor-pointer group"}`}
                          >
                            <span className={`text-sm tracking-[0.2em] uppercase font-normal transition-colors duration-200
                              ${sel ? "text-white" : "text-white/30 group-hover:text-white/65"}`}>
                              {s.label}
                            </span>
                            {/* Framer Motion underline with layoutId */}
                            {sel && (
                              <motion.div
                                layoutId="sibling-underline"
                                style={{
                                  position: "absolute", bottom: 0, left: 0, right: 0,
                                  height: 1.5, background: "white",
                                }}
                                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                              />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </DragScroll>

                  {/* Divider */}
                  <div style={{ height: H.divider, display: "flex", alignItems: "center" }}>
                    <div className="w-full h-px bg-white/8" />
                  </div>

                  {/* ROW 3 — Children */}
                  <DragScroll innerRef={childrenRef}
                    style={{ height: H.children, display: "flex", alignItems: "center", whiteSpace: "nowrap" }}
                  >
                    <div data-row="children"
                      style={{ display: "inline-flex", gap: 28, alignItems: "center", paddingLeft: "50%", paddingRight: "50%" }}
                    >
                      {animView.children.length > 0 ? (
                        animView.children.map((c) => (
                          <button key={c.id}
                            data-label={c.label}
                            onClick={() => navigate(c.label, "child")}
                            className="flex-shrink-0 cursor-pointer group"
                          >
                            <span className="text-[11px] tracking-[0.22em] uppercase text-white/30 group-hover:text-white/65 transition-colors">
                              {c.label}
                            </span>
                          </button>
                        ))
                      ) : (
                        <span className="text-[11px] tracking-[0.22em] uppercase text-white/15">leaf node</span>
                      )}
                    </div>
                  </DragScroll>

                </motion.div>
              </AnimatePresence>
            </div>

            <div className="h-px bg-white/8" />
          </div>
        </div>
      </main>
    </div>
  )
}
