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

// ─── CSS ─────────────────────────────────────────────────────────────────────
const STYLES = `
  .drag-scroll::-webkit-scrollbar { display:none; }
`

// ─── DragScroll ──────────────────────────────────────────────────────────────
function DragScroll({
  children, style, className, innerRef,
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
  const stop = () => { const el = ref.current; if (el) { drag.current.active = false; el.style.cursor = "grab" } }
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

function scrollToLabel(container: HTMLDivElement | null, label: string, behavior: ScrollBehavior) {
  if (!container) return
  const el = container.querySelector(`[data-label="${CSS.escape(label)}"]`) as HTMLElement | null
  if (!el) return
  const containerCenter = container.offsetWidth / 2
  const elCenter = el.offsetLeft + el.offsetWidth / 2
  container.scrollTo({ left: elCenter - containerCenter, behavior })
}

function ensureCenterPadding(container: HTMLDivElement | null, inner: HTMLDivElement | null) {
  if (!container || !inner) return
  const half = container.offsetWidth / 2
  inner.style.paddingLeft = `${half}px`
  inner.style.paddingRight = `${half}px`
}

// ─── Layout constants ────────────────────────────────────────────────────────
// Parent row: 24px, gap: 8px divider + 24px margin = 32px, Siblings row: 36px, gap: same 32px, Children: 24px
// Row step (center-to-center): parentHeight/2 + gap + siblingsHeight/2 = 12 + 32 + 18 = 62
// We use the distance from one row container top to the next
const PARENT_H = 24
const SIBLINGS_H = 36
const CHILDREN_H = 24
const GAP = 32 // divider height + margin
const ROW_STEP = PARENT_H + GAP // distance from parent top to siblings top = 56

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
              <div className="flex items-center justify-center" style={{ height: PARENT_H }}>
                <div className="h-2 w-20 rounded bg-white/10 animate-pulse" />
              </div>
              <div className="h-px bg-white/8 my-4" />
              <div className="flex items-center justify-center" style={{ height: SIBLINGS_H }}>
                {[80,120,96].map((w,i) => <div key={i} className="h-3 rounded bg-white/10 animate-pulse mx-4" style={{ width:w }} />)}
              </div>
              <div className="h-px bg-white/8 my-4" />
              <div className="flex items-center justify-center" style={{ height: CHILDREN_H }}>
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
  const router = useRouter()
  const params = useSearchParams()
  const [, startT] = useTransition()

  const [view, setView] = useState<LexiconView | null>(null)
  const [ready, setReady] = useState(false)

  // Refs for scroll containers + inner wrappers
  const siblingsRef    = useRef<HTMLDivElement>(null)
  const siblingsInner  = useRef<HTMLDivElement>(null)
  const childrenRef    = useRef<HTMLDivElement>(null)
  const childrenInner  = useRef<HTMLDivElement>(null)
  const parentRef      = useRef<HTMLDivElement>(null)

  // Vertical slide state
  const rowsWrapperRef = useRef<HTMLDivElement>(null)
  const [slideY, setSlideY] = useState(0)
  const [sliding, setSliding] = useState(false)
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

  // URL sync on load
  useEffect(() => {
    const termLabel = params.get("term")
    if (!termLabel) return
    const s = getStore()
    if (!s.loaded) return
    const term = findByLabel(termLabel)
    if (term && term.id !== s.selectedId) setSelectedId(term.id)
  }, [params])

  // Set URL if missing
  useEffect(() => {
    if (!ready) return
    const termLabel = params.get("term")
    if (!termLabel && view) {
      router.replace(`/lexicon?term=${encodeURIComponent(view.selected.label)}`, { scroll: false })
    }
  }, [ready, params, router, view])

  // ── Center selected sibling ──
  const centerSiblings = useCallback((behavior: ScrollBehavior) => {
    ensureCenterPadding(siblingsRef.current, siblingsInner.current)
    const container = siblingsRef.current
    if (!container) return
    const selected = container.querySelector("[data-selected='true']") as HTMLElement | null
    if (!selected) return
    const containerCenter = container.offsetWidth / 2
    const elCenter = selected.offsetLeft + selected.offsetWidth / 2
    container.scrollTo({ left: elCenter - containerCenter, behavior })
  }, [])

  // Center on initial load
  useEffect(() => {
    if (!ready) return
    requestAnimationFrame(() => centerSiblings("instant"))
  }, [ready, centerSiblings])

  // ── Two-phase navigation ──
  const navigateTo = useCallback((label: string, dir: Direction) => {
    if (transitioning.current) return
    const term = findByLabel(label)
    if (!term) return
    transitioning.current = true

    if (dir === "lateral") {
      // Lateral: just swap data, center the new selected word
      startT(() => {
        setSelectedId(term.id)
        router.push(`/lexicon?term=${encodeURIComponent(label)}`, { scroll: false })
      })
      // Center after data swap
      setTimeout(() => {
        centerSiblings("smooth")
        transitioning.current = false
      }, 30)
      return
    }

    // ── Phase 1: Scroll clicked word to center in its current row ──
    const sourceContainer = dir === "down" ? childrenRef.current : parentRef.current
    if (sourceContainer) {
      scrollToLabel(sourceContainer, label, "smooth")
    }

    // Wait for horizontal scroll to complete
    setTimeout(() => {
      // ── Phase 2: Slide entire rows wrapper vertically ──
      // Measure the actual distance between the source row and the siblings row
      const wrapper = rowsWrapperRef.current
      if (!wrapper) { transitioning.current = false; return }

      const sourceRow = dir === "down"
        ? wrapper.querySelector("[data-row='children']") as HTMLElement
        : wrapper.querySelector("[data-row='parent']") as HTMLElement
      const middleRow = wrapper.querySelector("[data-row='siblings']") as HTMLElement

      if (!sourceRow || !middleRow) { transitioning.current = false; return }

      const sourceTop = sourceRow.getBoundingClientRect().top
      const middleTop = middleRow.getBoundingClientRect().top
      const distance = sourceTop - middleTop // positive if source is below, negative if above

      // Apply translateY to move the source row to where the middle row is
      setSliding(true)
      setSlideY(-distance) // negate: if child is 60px below, we slide wrapper up by 60px

      // After the vertical slide transition ends, swap data and reset
      setTimeout(() => {
        // Disable transition, reset position, swap data
        setSliding(false)
        setSlideY(0)

        startT(() => {
          setSelectedId(term.id)
          router.push(`/lexicon?term=${encodeURIComponent(label)}`, { scroll: false })
        })

        // Center the new selected word after data swap
        setTimeout(() => {
          centerSiblings("instant")
          transitioning.current = false
        }, 30)
      }, 420) // matches transition duration

    }, 350) // wait for Phase 1 horizontal scroll

  }, [router, centerSiblings])

  // Wrapper style for vertical sliding
  const wrapperStyle: React.CSSProperties = {
    transform: `translateY(${slideY}px)`,
    transition: sliding ? "transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)" : "none",
  }

  return (
    <div className="bg-[#0a0a0a] min-h-dvh w-full flex flex-col">
      <style>{STYLES}</style>
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

            {/* Clip container — hides rows sliding out */}
            <div className="overflow-hidden">
              <div ref={rowsWrapperRef} className="px-6 py-8 md:px-10 md:py-10" style={wrapperStyle}>

                {/* ── ROW 1: Parent ── */}
                <div
                  data-row="parent"
                  ref={parentRef}
                  style={{ height: PARENT_H, display:"flex", alignItems:"center", justifyContent:"center", marginBottom: GAP/2 }}
                >
                  {!ready ? (
                    <div className="h-2 w-20 rounded bg-white/10 animate-pulse" />
                  ) : view?.parent ? (
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

                <div className="h-px bg-white/8" style={{ marginBottom: GAP/2 }} />

                {/* ── ROW 2: Siblings ── */}
                <DragScroll
                  data-row="siblings"
                  className="drag-scroll"
                  innerRef={siblingsRef}
                  style={{ height: SIBLINGS_H, lineHeight:`${SIBLINGS_H}px`, display:"flex", alignItems:"center", flexWrap:"nowrap", whiteSpace:"nowrap", marginBottom: GAP/2 }}
                >
                  {!ready ? (
                    <div className="flex gap-8 mx-auto">
                      {[80,120,96].map((w,i) => <div key={i} className="h-3 rounded bg-white/10 animate-pulse flex-shrink-0" style={{ width:w }} />)}
                    </div>
                  ) : (
                    <div
                      ref={siblingsInner}
                      style={{ display:"inline-flex", flexWrap:"nowrap", whiteSpace:"nowrap", gap:36 }}
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
                              height: 1.5, background:"rgba(255,255,255,0.85)", transformOrigin:"left",
                              transform: isSel ? "scaleX(1)" : "scaleX(0)",
                              transition:"transform 0.22s cubic-bezier(0.4,0,0.2,1)",
                            }} />
                          </button>
                        )
                      })}
                    </div>
                  )}
                </DragScroll>

                <div className="h-px bg-white/8" style={{ marginBottom: GAP/2 }} />

                {/* ── ROW 3: Children ── */}
                <DragScroll
                  data-row="children"
                  className="drag-scroll"
                  innerRef={childrenRef}
                  style={{ height: CHILDREN_H, lineHeight:`${CHILDREN_H}px`, display:"flex", alignItems:"center", flexWrap:"nowrap", whiteSpace:"nowrap" }}
                >
                  {!ready ? (
                    <div className="flex gap-6 mx-auto">
                      {[64,96,80,72].map((w,i) => <div key={i} className="h-2 rounded bg-white/10 animate-pulse flex-shrink-0" style={{ width:w }} />)}
                    </div>
                  ) : (
                    <div
                      ref={childrenInner}
                      style={{ display:"inline-flex", flexWrap:"nowrap", whiteSpace:"nowrap", gap:28, margin:"0 auto" }}
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
            </div>

            <div className="h-px bg-white/8" />
          </div>
        </div>
      </main>
    </div>
  )
}
