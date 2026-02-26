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

// ─── DragScroll wrapper ───────────────────────────────────────────────────────
function DragScroll({
  children,
  style,
  className,
  innerRef,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
  innerRef?: React.RefObject<HTMLDivElement>
}) {
  const ref = innerRef ?? useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false })

  const onMouseDown = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    drag.current = { active: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft, moved: false }
    el.style.cursor = "grabbing"
  }
  const onMouseMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!drag.current.active || !el) return
    e.preventDefault()
    const x = e.pageX - el.offsetLeft
    const dist = x - drag.current.startX
    if (Math.abs(dist) > 4) drag.current.moved = true
    el.scrollLeft = drag.current.scrollLeft - dist
  }
  const stop = () => {
    const el = ref.current
    if (!el) return
    drag.current.active = false
    el.style.cursor = "grab"
  }
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.stopPropagation()
      drag.current.moved = false
    }
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        overflowX: "auto",
        overflowY: "hidden",
        cursor: "grab",
        userSelect: "none",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        ...style,
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={stop}
      onMouseLeave={stop}
      onClickCapture={onClickCapture}
    >
      <style>{`.drag-scroll::-webkit-scrollbar { display: none; }`}</style>
      {children}
    </div>
  )
}

// ─── Fade transition hook ────────────────────────────────────────────────────
function useViewTransition(view: LexiconView | null) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!view) return
    setVisible(false)
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [view?.selected.id])
  return visible
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
            
            {/* Title skeleton */}
            <div className="px-6 py-6 md:px-10 md:py-8 border-b border-white/10">
              <div className="h-8 w-32 rounded bg-white/10 animate-pulse" />
            </div>

            <div className="px-6 py-8 md:px-10 md:py-10">
              <div className="flex items-center justify-center mb-8" style={{ height: 24 }}>
                <div className="h-2 w-20 rounded bg-white/10 animate-pulse" />
              </div>
              <div className="h-px bg-white/8 mb-6" />
              <div className="flex items-center justify-center mb-6" style={{ height: 36 }}>
                <div className="flex gap-8">
                  {[80, 120, 96].map((w, i) => (
                    <div key={i} className="h-3 rounded bg-white/10 animate-pulse flex-shrink-0" style={{ width: w }} />
                  ))}
                </div>
              </div>
              <div className="h-px bg-white/8 mb-6" />
              <div className="flex items-center justify-center" style={{ height: 24 }}>
                <div className="flex gap-6">
                  {[64, 96, 80, 72].map((w, i) => (
                    <div key={i} className="h-2 rounded bg-white/10 animate-pulse flex-shrink-0" style={{ width: w }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="h-px bg-white/8" />
            <div className="px-6 py-3 md:px-10">
              <span className="font-sans text-white/15 text-[10px] tracking-[0.3em] uppercase">Lexicon</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Inner (useSearchParams requires Suspense) ────────────────────────────────
function LexiconInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const [view, setView] = useState<LexiconView | null>(null)
  const [ready, setReady] = useState(false)

  // Refs to the two DragScroll containers for scrollIntoView centering
  const siblingsRef = useRef<HTMLDivElement>(null)
  const childrenRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    const termLabel = searchParams.get("term")
    if (!termLabel) return
    const s = getStore()
    if (!s.loaded) return
    const term = findByLabel(termLabel)
    if (term && term.id !== s.selectedId) setSelectedId(term.id)
  }, [searchParams])

  useEffect(() => {
    if (!ready) return
    const termLabel = searchParams.get("term")
    if (!termLabel) {
      const s = getStore()
      if (s.selectedId) {
        const v = computeView(s.selectedId)
        if (v) router.replace(`/lexicon?term=${encodeURIComponent(v.selected.label)}`, { scroll: false })
      }
    }
  }, [ready, searchParams, router])

  // Auto-center selected sibling on selection change
  useEffect(() => {
    if (!view || !siblingsRef.current) return
    const container = siblingsRef.current
    const selected = container.querySelector("[data-selected='true']") as HTMLElement | null
    if (!selected) return
    // Fast, decisive scroll to center
    const containerCenter = container.offsetWidth / 2
    const elCenter = selected.offsetLeft + selected.offsetWidth / 2
    container.scrollTo({ left: elCenter - containerCenter, behavior: "smooth" })
  }, [view?.selected.id])

  const navigateTo = useCallback((label: string) => {
    const term = findByLabel(label)
    if (!term) return
    startTransition(() => {
      setSelectedId(term.id)
      router.push(`/lexicon?term=${encodeURIComponent(label)}`, { scroll: false })
    })
  }, [router])

  const visible = useViewTransition(view)

  const fade = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(4px)",
    transition: "opacity 0.18s ease, transform 0.18s ease",
  }
  const fadeUp = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(-4px)",
    transition: "opacity 0.18s ease, transform 0.18s ease",
  }

  return (
    <div className="bg-[#0a0a0a] min-h-dvh w-full flex flex-col">
      <SimpleHeader />

      <main className="flex-1 flex flex-col items-center justify-center pt-16 px-4">
        <div className="w-full max-w-2xl">
          <div className="bg-[#1c1c1c] rounded-sm shadow-2xl shadow-black/60 overflow-hidden border border-white/5">

            {/* Top accent line */}
            <div className="h-px bg-white/20" />

            {/* Title */}
            <div className="px-6 py-6 md:px-10 md:py-8 border-b border-white/10">
              <h1 className="font-sans text-2xl md:text-3xl font-bold tracking-tight text-white uppercase">
                Lexicon
              </h1>
            </div>

            <div className="px-6 py-8 md:px-10 md:py-10">

              {/* ── ROW 1: Parent — height 24px ── */}
              <div className="flex items-center justify-center mb-8" style={{ height: 24 }}>
                {!ready ? (
                  <div className="h-2 w-20 rounded bg-white/10 animate-pulse" />
                ) : (
                  <div style={fadeUp}>
                    {view?.parent ? (
                      <button
                        onClick={() => navigateTo(view.parent!.label)}
                        className="flex items-center gap-2 group cursor-pointer"
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

              {/* Divider */}
              <div className="h-px bg-white/8 mb-6" />

              {/* ── ROW 2: Siblings — height 36px, drag-to-scroll, auto-center on select ── */}
              <DragScroll
                className="drag-scroll mb-6"
                innerRef={siblingsRef}
                style={{
                  height: 36,
                  lineHeight: "36px",
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "nowrap",
                  whiteSpace: "nowrap",
                }}
              >
                {!ready ? (
                  <div className="flex gap-8 mx-auto" style={{ flexWrap: "nowrap" }}>
                    {[80, 120, 96].map((w, i) => (
                      <div key={i} className="h-3 rounded bg-white/10 animate-pulse flex-shrink-0" style={{ width: w }} />
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      ...fade,
                      display: "inline-flex",
                      flexWrap: "nowrap",
                      whiteSpace: "nowrap",
                      gap: "36px",
                      margin: "0 auto",
                      paddingLeft: "40%",
                      paddingRight: "40%",
                    }}
                  >
                    {view?.siblings.map((sibling) => {
                      const isSelected = sibling.id === view.selected.id
                      return (
                        <button
                          key={sibling.id}
                          data-selected={isSelected ? "true" : "false"}
                          onClick={() => !isSelected && navigateTo(sibling.label)}
                          className={`relative flex-shrink-0 pb-1.5 ${isSelected ? "cursor-default" : "cursor-pointer group"}`}
                        >
                          <span
                            className={`font-sans text-sm tracking-[0.22em] font-normal uppercase transition-colors duration-150 ${
                              isSelected ? "text-white" : "text-white/28 group-hover:text-white/60"
                            }`}
                          >
                            {sibling.label}
                          </span>
                          {/* Animated underline — scaleX from 0→1 on selection */}
                          <span
                            className="absolute bottom-0 left-0 right-0 block"
                            style={{
                              height: 1.5,
                              background: "rgba(255,255,255,0.85)",
                              transformOrigin: "left",
                              transform: isSelected ? "scaleX(1)" : "scaleX(0)",
                              transition: "transform 0.22s cubic-bezier(0.4,0,0.2,1)",
                            }}
                          />
                        </button>
                      )
                    })}
                  </div>
                )}
              </DragScroll>

              {/* Divider */}
              <div className="h-px bg-white/8 mb-6" />

              {/* ── ROW 3: Children — height 24px, drag-to-scroll ── */}
              <DragScroll
                className="drag-scroll"
                innerRef={childrenRef}
                style={{
                  height: 24,
                  lineHeight: "24px",
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "nowrap",
                  whiteSpace: "nowrap",
                }}
              >
                {!ready ? (
                  <div className="flex gap-6 mx-auto" style={{ flexWrap: "nowrap" }}>
                    {[64, 96, 80, 72].map((w, i) => (
                      <div key={i} className="h-2 rounded bg-white/10 animate-pulse flex-shrink-0" style={{ width: w }} />
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      ...fade,
                      display: "inline-flex",
                      flexWrap: "nowrap",
                      whiteSpace: "nowrap",
                      gap: "28px",
                      margin: "0 auto",
                      paddingLeft: "40%",
                      paddingRight: "40%",
                    }}
                  >
                    {view?.children && view.children.length > 0 ? (
                      view.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => navigateTo(child.label)}
                          className="cursor-pointer group flex-shrink-0"
                        >
                          <span className="font-sans text-[11px] tracking-[0.22em] font-light uppercase text-white/28 group-hover:text-white/65 transition-colors duration-150">
                            {child.label}
                          </span>
                        </button>
                      ))
                    ) : (
                      <span className="font-sans text-white/15 text-[10px] tracking-[0.28em] uppercase">
                        leaf node
                      </span>
                    )}
                  </div>
                )}
              </DragScroll>

            </div>

            {/* Bottom bar */}
            <div className="h-px bg-white/8" />
            <div className="px-6 py-3 md:px-10">
              <span className="font-sans text-white/15 text-[10px] tracking-[0.3em] uppercase">Lexicon</span>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
