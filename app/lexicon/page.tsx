"use client"

import { useState, useEffect, useRef, useCallback, useLayoutEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { SimpleHeader } from "@/components/simple-header"
import { ChevronUp } from "lucide-react"
import {
  ensureLoaded, subscribe, computeView, findByLabel, setSelectedId,
  type LexiconView,
} from "@/lib/lexicon-store"

// ─── Row heights ──────────────────────────────────────────────────────────────
const H = { parent: 28, divider: 20, siblings: 40, children: 28 }

// ─── DragScroll ───────────────────────────────────────────────────────────────
function DragScroll({ children, style, scrollRef }: {
  children: React.ReactNode
  style?: React.CSSProperties
  scrollRef?: React.RefObject<HTMLDivElement | null>
}) {
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef({ on: false, startX: 0, left: 0, moved: false })

  useEffect(() => {
    if (scrollRef) (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = ref.current
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
    <div ref={ref}
      style={{ overflowX: "auto", overflowY: "hidden", cursor: "grab", userSelect: "none", scrollbarWidth: "none", ...style }}
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

function centerWordAnimated(container: HTMLDivElement | null, label: string, duration = 320): Promise<void> {
  return new Promise<void>((resolve) => {
    if (!container) return resolve()
    const el = container.querySelector(`[data-label="${CSS.escape(label)}"]`) as HTMLElement | null
    if (!el) return resolve()
    const from = container.scrollLeft
    const to = centerLeft(container, el)
    if (!Number.isFinite(to) || Math.abs(to - from) < 1) { container.scrollLeft = to; return resolve() }
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="bg-[#0a0a0a] min-h-dvh flex flex-col font-sans">
      <SimpleHeader />
      <main className="flex-1 flex items-center justify-center pt-16 px-4">
        <div className="w-full max-w-2xl">
          <div className="bg-[#1c1c1c] rounded-sm border border-white/5 shadow-2xl shadow-black/60">
            <div className="h-px bg-white/20" />
            <div className="py-6 border-b border-white/10 text-center">
              <span className="text-xl font-normal tracking-[0.25em] text-white/20 uppercase">Lexicon</span>
            </div>
            <div className="px-8 py-8">
              <div style={{ height: H.parent }} className="flex items-center justify-center">
                <div className="h-2 w-20 rounded bg-white/8 animate-pulse" />
              </div>
              <div style={{ height: H.divider }} className="flex items-center"><div className="w-full h-px bg-white/8" /></div>
              <div style={{ height: H.siblings }} className="flex items-center justify-center gap-8">
                {[80, 120, 96].map((w, i) => <div key={i} className="h-3 rounded bg-white/8 animate-pulse" style={{ width: w }} />)}
              </div>
              <div style={{ height: H.divider }} className="flex items-center"><div className="w-full h-px bg-white/8" /></div>
              <div style={{ height: H.children }} className="flex items-center justify-center gap-6">
                {[64, 96, 80].map((w, i) => <div key={i} className="h-2 rounded bg-white/8 animate-pulse" style={{ width: w }} />)}
              </div>
            </div>
            <div className="h-px bg-white/8" />
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Three-row view ───────────────────────────────────────────────────────────
// Rendered once per AnimatePresence entry; siblingsScrollRef comes from parent
function ViewRows({
  view,
  onNavigate,
  siblingsScrollRef,
  siblingsInnerRef,
}: {
  view: LexiconView
  onNavigate: (label: string, from: "parent" | "sibling" | "child") => void
  siblingsScrollRef: React.RefObject<HTMLDivElement | null>
  siblingsInnerRef: React.RefObject<HTMLDivElement | null>
}) {
  const parentScrollRef = useRef<HTMLDivElement | null>(null)
  const childrenScrollRef = useRef<HTMLDivElement | null>(null)

  // Set half-padding so edge words can reach center, then center selected word
  useLayoutEffect(() => {
    const sc = siblingsScrollRef.current
    const si = siblingsInnerRef.current
    if (!sc || !si) return
    const half = sc.offsetWidth / 2
    si.style.paddingLeft  = `${half}px`
    si.style.paddingRight = `${half}px`
    centerWordInstant(sc, view.selected.label)
  }, [view.selected.id]) // eslint-disable-line

  return (
    <div className="px-8 py-8">

      {/* ROW 1 — Parent */}
      <DragScroll scrollRef={parentScrollRef}
        style={{ height: H.parent, display: "flex", alignItems: "center", whiteSpace: "nowrap" }}
      >
        <div style={{ display: "inline-flex", gap: 24, alignItems: "center", paddingLeft: "50%", paddingRight: "50%" }}>
          {view.parent ? (
            <button
              data-label={view.parent.label}
              onClick={() => onNavigate(view.parent!.label, "parent")}
              className="flex items-center gap-1.5 group cursor-pointer flex-shrink-0"
            >
              <ChevronUp className="w-2.5 h-2.5 text-white/25 group-hover:text-white/60 transition-colors duration-150" />
              <span className="text-[11px] tracking-[0.22em] uppercase text-white/35 group-hover:text-white/70 transition-colors duration-150">
                {view.parent.label}
              </span>
            </button>
          ) : (
            <span className="text-[11px] tracking-[0.22em] uppercase text-white/15 select-none">root</span>
          )}
        </div>
      </DragScroll>

      {/* Divider */}
      <div style={{ height: H.divider, display: "flex", alignItems: "center" }}>
        <div className="w-full h-px bg-white/8" />
      </div>

      {/* ROW 2 — Siblings */}
      <DragScroll scrollRef={siblingsScrollRef}
        style={{ height: H.siblings, display: "flex", alignItems: "center", whiteSpace: "nowrap" }}
      >
        <div ref={siblingsInnerRef}
          style={{ display: "inline-flex", gap: 36, alignItems: "center", position: "relative" }}
        >
          {view.siblings.map((s) => {
            const sel = s.id === view.selected.id
            return (
              <button key={s.id}
                data-label={s.label}
                data-selected={sel ? "true" : "false"}
                onClick={() => !sel && onNavigate(s.label, "sibling")}
                className={`relative flex-shrink-0 pb-1.5 ${sel ? "cursor-default" : "cursor-pointer group"}`}
              >
                <span className={`text-sm tracking-[0.2em] uppercase font-normal transition-colors duration-200
                  ${sel ? "text-white" : "text-white/30 group-hover:text-white/60"}`}>
                  {s.label}
                </span>
                {sel && (
                  <motion.span
                    layoutId="underline"
                    style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1.5, background: "white" }}
                    transition={{ type: "spring", damping: 26, stiffness: 380 }}
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
      <DragScroll scrollRef={childrenScrollRef}
        style={{ height: H.children, display: "flex", alignItems: "center", whiteSpace: "nowrap" }}
      >
        <div style={{ display: "inline-flex", gap: 28, alignItems: "center", paddingLeft: "50%", paddingRight: "50%" }}>
          {view.children.length > 0 ? (
            view.children.map((c) => (
              <button key={c.id}
                data-label={c.label}
                onClick={() => onNavigate(c.label, "child")}
                className="flex-shrink-0 cursor-pointer group"
              >
                <span className="text-[11px] tracking-[0.22em] uppercase text-white/30 group-hover:text-white/65 transition-colors duration-150">
                  {c.label}
                </span>
              </button>
            ))
          ) : (
            <span className="text-[11px] tracking-[0.22em] uppercase text-white/15 select-none">leaf node</span>
          )}
        </div>
      </DragScroll>

    </div>
  )
}

// ─── Page shell ───────────────────────────────────────────────────────────────
export default function LexiconPage() {
  return <Suspense fallback={<Skeleton />}><LexiconInner /></Suspense>
}

// ─── Inner ────────────────────────────────────────────────────────────────────
function LexiconInner() {
  const router  = useRouter()
  const params  = useSearchParams()

  const [view, setView]         = useState<LexiconView | null>(null)
  const [ready, setReady]       = useState(false)
  const [direction, setDirection] = useState<"up" | "down">("up")

  const siblingsScrollRef = useRef<HTMLDivElement | null>(null)
  const siblingsInnerRef  = useRef<HTMLDivElement | null>(null)
  const busy = useRef(false)

  // Load graph + subscribe to store
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

  // Navigate handler
  const navigate = useCallback(async (label: string, from: "parent" | "sibling" | "child") => {
    if (busy.current) return
    const term = findByLabel(label)
    if (!term || term.id === view?.selected.id) return
    busy.current = true

    if (from === "sibling") {
      // Horizontal only — update store which triggers subscribe → setView
      setSelectedId(term.id)
      router.replace(`/lexicon?term=${encodeURIComponent(label)}`, { scroll: false })
      // Center animated: wait one frame for React to commit new view
      requestAnimationFrame(() => {
        centerWordAnimated(siblingsScrollRef.current, label, 300).then(() => {
          busy.current = false
        })
      })
      return
    }

    // Parent / Child: vertical AnimatePresence swap
    setDirection(from === "child" ? "up" : "down")
    // Phase 1: center clicked word in its source row first
    // (we read the current DOM before state changes)
    const sourceSelector = `[data-label="${CSS.escape(label)}"]`
    const sourceEl = document.querySelector(sourceSelector) as HTMLElement | null
    const sourceContainer = sourceEl?.closest("[style*='overflow']") as HTMLDivElement | null
    if (sourceEl && sourceContainer) {
      const to = centerLeft(sourceContainer, sourceEl)
      await centerWordAnimated(sourceContainer, label, 320)
      void to // suppress lint
    }

    // Phase 2: commit new view — AnimatePresence handles the vertical slide
    setSelectedId(term.id)
    router.replace(`/lexicon?term=${encodeURIComponent(label)}`, { scroll: false })
    busy.current = false

  }, [view?.selected?.id, router])

  if (!ready || !view) return <Skeleton />

  const variants = {
    enter: (d: "up" | "down") => ({ y: d === "up" ? 18 : -18, opacity: 0 }),
    center: { y: 0, opacity: 1 },
    exit:   (d: "up" | "down") => ({ y: d === "up" ? -18 : 18, opacity: 0 }),
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

            {/* Clip window */}
            <div style={{ overflow: "hidden" }}>
              <LayoutGroup>
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={view.selected.id}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.42, ease: [0.33, 1, 0.68, 1] }}
                  >
                    <ViewRows
                      view={view}
                      onNavigate={navigate}
                      siblingsScrollRef={siblingsScrollRef}
                      siblingsInnerRef={siblingsInnerRef}
                    />
                  </motion.div>
                </AnimatePresence>
              </LayoutGroup>
            </div>

            <div className="h-px bg-white/8" />
          </div>
        </div>
      </main>
    </div>
  )
}
