"use client"

import { useState, useEffect, useCallback, useTransition, Suspense, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SimpleHeader } from "@/components/simple-header"
import { ChevronUp } from "lucide-react"
import {
  ensureLoaded,
  subscribe,
  getStore,
  computeView,
  findByLabel,
  setSelectedId,
  type LexiconView,
} from "@/lib/lexicon-store"

// ─── CSS keyframes ───────────────────────────────────────────────────────────
const KEYFRAMES = `
  @keyframes slide-in-from-below  { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
  @keyframes slide-in-from-above  { from { opacity:0; transform:translateY(-16px) } to { opacity:1; transform:translateY(0) } }
  @keyframes fade-in              { from { opacity:0 } to { opacity:1 } }
  .drag-scroll::-webkit-scrollbar { display:none; }
`

// ─── DragScroll ──────────────────────────────────────────────────────────────
function DragScroll({
  children,
  style,
  className,
  innerRef,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
  innerRef?: React.RefObject<HTMLDivElement | null>
}) {
  const ownRef = useRef<HTMLDivElement>(null)
  const ref = (innerRef ?? ownRef) as React.RefObject<HTMLDivElement>
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false })

  const onMouseDown = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return
    drag.current = { active: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft, moved: false }
    el.style.cursor = "grabbing"
  }
  const onMouseMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!drag.current.active || !el) return
    e.preventDefault()
    const dist = (e.pageX - el.offsetLeft) - drag.current.startX
    if (Math.abs(dist) > 4) drag.current.moved = true
    el.scrollLeft = drag.current.scrollLeft - dist
  }
  const stop = () => { const el = ref.current; if (!el) return; drag.current.active = false; el.style.cursor = "grab" }
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) { e.stopPropagation(); drag.current.moved = false }
  }

  return (
    <div ref={ref} className={className}
      style={{ overflowX:"auto", overflowY:"hidden", cursor:"grab", userSelect:"none", scrollbarWidth:"none", ...style }}
      onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={stop} onMouseLeave={stop} onClickCapture={onClickCapture}
    >
      {children}
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
type Direction = "down" | "up" | "lateral" | "none"

/** Scroll a container so the element with data-label=label is centered */
function scrollToLabel(container: HTMLDivElement | null, label: string, behavior: ScrollBehavior) {
  if (!container) return
  const el = container.querySelector(`[data-label="${CSS.escape(label)}"]`) as HTMLElement | null
  if (!el) return
  const containerCenter = container.offsetWidth / 2
  const elCenter = el.offsetLeft + el.offsetWidth / 2
  container.scrollTo({ left: elCenter - containerCenter, behavior })
}

/** Ensure a DragScroll inner wrapper has enough padding for edge-words to center */
function ensureCenterPadding(container: HTMLDivElement | null, inner: HTMLDivElement | null) {
  if (!container || !inner) return
  const half = container.offsetWidth / 2
  inner.style.paddingLeft = `${half}px`
  inner.style.paddingRight = `${half}px`
}

// ─── Page shell ──────────────────────────────────────────────────────────────
export default function LexiconPage() {
  return (
    <Suspense fallback={<LexiconSkeleton />}>
      <LexiconInner />
    </Suspense>
  )
}

function LexiconSkeleton() {
  return (
    <div className="bg-[#0a0a0a] min-h-dvh w-full flex flex-col">
      <SimpleHeader />
      <main className="flex-1 flex flex-col items-center justify-center pt-16 px-4">
        <div className="w-full max-w-2xl">
          <div className="bg-[#1c1c1c] rounded-sm shadow-2xl shadow-black/60 overflow-hidden border border-white/5">
            <div className="h-px bg-white/20" />
            <div className="px-6 py-6 md:px-10 md:py-8 border-b border-white/10 text-center">
              <div className="h-6 w-36 mx-auto rounded bg-white/10 animate-pulse" />
            </div>
            <div className="px-6 py-8 md:px-10 md:py-10">
              <div className="flex items-center justify-center mb-8" style={{ height: 24 }}>
                <div className="h-2 w-20 rounded bg-white/10 animate-pulse" />
              </div>
              <div className="h-px bg-white/8 mb-6" />
              <div className="flex items-center justify-center mb-6" style={{ height: 36 }}>
                {[80,120,96].map((w,i) => <div key={i} className="h-3 rounded bg-white/10 animate-pulse mx-4" style={{ width:w }} />)}
              </div>
              <div className="h-px bg-white/8 mb-6" />
              <div className="flex items-center justify-center" style={{ height: 24 }}>
                {[64,96,80,72].map((w,i) => <div key={i} className="h-2 rounded bg-white/10 animate-pulse mx-3" style={{ width:w }} />)}
              </div>
            </div>
            <div className="h-px bg-white/8" />
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Inner ───────────────────────────────────────────────────────────────────
function LexiconInner() {
  const router   = useRouter()
  const params   = useSearchParams()
  const [, startT] = useTransition()

  const [view, setView]       = useState<LexiconView | null>(null)
  const [ready, setReady]     = useState(false)
  const [direction, setDirection] = useState<Direction>("none")
  const [animEpoch, setAnimEpoch] = useState(0)

  // Refs for scroll containers and inner wrappers
  const siblingsRef   = useRef<HTMLDivElement>(null)
  const siblingsInner = useRef<HTMLDivElement>(null)
  const childrenRef   = useRef<HTMLDivElement>(null)
  const childrenInner = useRef<HTMLDivElement>(null)

  // Track whether we're mid-transition (to block rapid clicks)
  const transitioning = useRef(false)

  const recompute = useCallback(() => {
    const s = getStore()
    if (!s.loaded || !s.selectedId) return
    const v = computeView(s.selectedId)
    if (v) { setView(v); setReady(true) }
  }, [])

  useEffect(() => {
    const unsub = subscribe(recompute)
    ensureLoaded().then(recompute)
    return unsub
  }, [recompute])

  // URL sync: read term from URL on load
  useEffect(() => {
    const termLabel = params.get("term")
    if (!termLabel) return
    const s = getStore()
    if (!s.loaded) return
    const term = findByLabel(termLabel)
    if (term && term.id !== s.selectedId) setSelectedId(term.id)
  }, [params])

  // URL sync: set URL from selection on first load
  useEffect(() => {
    if (!ready) return
    const termLabel = params.get("term")
    if (!termLabel) {
      const s = getStore()
      if (s.selectedId) {
        const v = computeView(s.selectedId)
        if (v) router.replace(`/lexicon?term=${encodeURIComponent(v.selected.label)}`, { scroll: false })
      }
    }
  }, [ready, params, router])

  // ── Center the selected word in siblings row ──
  const centerSiblings = useCallback((behavior: ScrollBehavior) => {
    const container = siblingsRef.current
    const inner = siblingsInner.current
    if (!container || !inner) return
    ensureCenterPadding(container, inner)
    const selected = container.querySelector("[data-selected='true']") as HTMLElement | null
    if (!selected) return
    const containerCenter = container.offsetWidth / 2
    const elCenter = selected.offsetLeft + selected.offsetWidth / 2
    container.scrollTo({ left: elCenter - containerCenter, behavior })
  }, [])

  // Center on initial load (instant)
  useEffect(() => {
    if (!ready) return
    // Give DOM time to render, then center
    requestAnimationFrame(() => {
      centerSiblings("instant")
    })
  }, [ready, centerSiblings])

  // Center after each navigation (smooth)
  useEffect(() => {
    if (!ready || animEpoch === 0) return
    // Wait for new content to render + animation to start
    const t = setTimeout(() => centerSiblings("smooth"), 60)
    return () => clearTimeout(t)
  }, [animEpoch, ready, centerSiblings])

  // ── Two-phase navigation ──
  // Phase 1: Scroll clicked word to center in its CURRENT row
  // Phase 2: Swap the data (new view) + trigger vertical CSS animations
  const navigateTo = useCallback((label: string, dir: Direction) => {
    if (transitioning.current) return
    const term = findByLabel(label)
    if (!term) return

    transitioning.current = true

    // Phase 1: horizontally center the clicked word in its row
    const sourceContainer = dir === "down" ? childrenRef.current : dir === "up" ? null : siblingsRef.current
    if (sourceContainer) {
      scrollToLabel(sourceContainer, label, "smooth")
    }

    // Phase 2: after horizontal scroll completes, swap data
    const delay = sourceContainer ? 280 : 0
    setTimeout(() => {
      setDirection(dir)
      setAnimEpoch(k => k + 1)
      startT(() => {
        setSelectedId(term.id)
        router.push(`/lexicon?term=${encodeURIComponent(label)}`, { scroll: false })
      })
      // Allow clicks again after vertical animation finishes
      setTimeout(() => { transitioning.current = false }, 250)
    }, delay)
  }, [router])

  // ── Animation style per row ──
  function animStyle(row: "parent"|"siblings"|"children"): React.CSSProperties {
    if (direction === "none" || !ready) return { opacity: 1 }
    const dur = "0.24s"
    const ease = "cubic-bezier(0.25,0.1,0.25,1)"
    const map: Record<Direction, Record<"parent"|"siblings"|"children", string>> = {
      down: {
        parent:   "fade-in",
        siblings: "slide-in-from-below",
        children: "slide-in-from-below",
      },
      up: {
        parent:   "slide-in-from-above",
        siblings: "slide-in-from-above",
        children: "fade-in",
      },
      lateral: {
        parent:   "fade-in",
        siblings: "fade-in",
        children: "fade-in",
      },
      none: { parent:"", siblings:"", children:"" },
    }
    const name = map[direction][row]
    if (!name) return { opacity: 1 }
    return { animation: `${name} ${dur} ${ease} both` }
  }

  return (
    <div className="bg-[#0a0a0a] min-h-dvh w-full flex flex-col">
      <style>{KEYFRAMES}</style>
      <SimpleHeader />

      <main className="flex-1 flex flex-col items-center justify-center pt-16 px-4">
        <div className="w-full max-w-2xl">
          <div className="bg-[#1c1c1c] rounded-sm shadow-2xl shadow-black/60 overflow-hidden border border-white/5">

            <div className="h-px bg-white/20" />

            {/* Title */}
            <div className="px-6 py-6 md:px-10 md:py-8 border-b border-white/10 text-center">
              <h1 className="font-sans text-xl md:text-2xl font-normal tracking-[0.2em] text-white uppercase">
                Lexicon
              </h1>
            </div>

            <div className="px-6 py-8 md:px-10 md:py-10">

              {/* ── ROW 1: Parent ── */}
              <div style={{ height: 24, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:32, overflow:"hidden" }}>
                {!ready ? (
                  <div className="h-2 w-20 rounded bg-white/10 animate-pulse" />
                ) : (
                  <div key={`p-${animEpoch}`} style={animStyle("parent")}>
                    {view?.parent ? (
                      <button
                        onClick={() => navigateTo(view.parent!.label, "up")}
                        className="flex items-center gap-2 group cursor-pointer"
                        data-label={view.parent.label}
                      >
                        <ChevronUp className="w-3 h-3 text-white/25 group-hover:text-white/60 transition-colors" />
                        <span className="font-sans text-white/35 text-[10px] tracking-[0.28em] uppercase group-hover:text-white/70 transition-colors duration-150">
                          {view.parent.label}
                        </span>
                      </button>
                    ) : (
                      <span className="invisible text-[10px]">ROOT</span>
                    )}
                  </div>
                )}
              </div>

              <div className="h-px bg-white/8 mb-6" />

              {/* ── ROW 2: Siblings (selected word always centered) ── */}
              <DragScroll
                className="drag-scroll mb-6"
                innerRef={siblingsRef}
                style={{ height:36, lineHeight:"36px", display:"flex", alignItems:"center", flexWrap:"nowrap", whiteSpace:"nowrap" }}
              >
                {!ready ? (
                  <div className="flex gap-8 mx-auto">
                    {[80,120,96].map((w,i) => <div key={i} className="h-3 rounded bg-white/10 animate-pulse flex-shrink-0" style={{ width:w }} />)}
                  </div>
                ) : (
                  <div
                    key={`s-${animEpoch}`}
                    ref={siblingsInner}
                    style={{
                      ...animStyle("siblings"),
                      display:"inline-flex", flexWrap:"nowrap", whiteSpace:"nowrap", gap:36,
                    }}
                  >
                    {view?.siblings.map((sibling) => {
                      const isSel = sibling.id === view.selected.id
                      return (
                        <button
                          key={sibling.id}
                          data-selected={isSel ? "true" : "false"}
                          data-label={sibling.label}
                          onClick={() => !isSel && navigateTo(sibling.label, "lateral")}
                          className={`relative flex-shrink-0 pb-1.5 ${isSel ? "cursor-default" : "cursor-pointer group"}`}
                        >
                          <span className={`font-sans text-sm tracking-[0.22em] font-normal uppercase transition-colors duration-150 ${
                            isSel ? "text-white" : "text-white/30 group-hover:text-white/60"
                          }`}>
                            {sibling.label}
                          </span>
                          {/* Animated underline */}
                          <span className="absolute bottom-0 left-0 right-0 block" style={{
                            height:1.5, background:"rgba(255,255,255,0.85)", transformOrigin:"left",
                            transform: isSel ? "scaleX(1)" : "scaleX(0)",
                            transition:"transform 0.22s cubic-bezier(0.4,0,0.2,1)",
                          }} />
                        </button>
                      )
                    })}
                  </div>
                )}
              </DragScroll>

              <div className="h-px bg-white/8 mb-6" />

              {/* ── ROW 3: Children ── */}
              <DragScroll
                className="drag-scroll"
                innerRef={childrenRef}
                style={{ height:24, lineHeight:"24px", display:"flex", alignItems:"center", flexWrap:"nowrap", whiteSpace:"nowrap" }}
              >
                {!ready ? (
                  <div className="flex gap-6 mx-auto">
                    {[64,96,80,72].map((w,i) => <div key={i} className="h-2 rounded bg-white/10 animate-pulse flex-shrink-0" style={{ width:w }} />)}
                  </div>
                ) : (
                  <div
                    key={`c-${animEpoch}`}
                    ref={childrenInner}
                    style={{
                      ...animStyle("children"),
                      display:"inline-flex", flexWrap:"nowrap", whiteSpace:"nowrap", gap:28, margin:"0 auto",
                    }}
                  >
                    {view?.children && view.children.length > 0 ? (
                      view.children.map((child) => (
                        <button
                          key={child.id}
                          data-label={child.label}
                          onClick={() => navigateTo(child.label, "down")}
                          className="cursor-pointer group flex-shrink-0"
                        >
                          <span className="font-sans text-[11px] tracking-[0.22em] font-light uppercase text-white/30 group-hover:text-white/65 transition-colors duration-150">
                            {child.label}
                          </span>
                        </button>
                      ))
                    ) : (
                      <span className="font-sans text-white/15 text-[10px] tracking-[0.28em] uppercase mx-auto">leaf node</span>
                    )}
                  </div>
                )}
              </DragScroll>

            </div>

            {/* Bottom bar */}
            <div className="h-px bg-white/8" />
          </div>
        </div>
      </main>
    </div>
  )
}
