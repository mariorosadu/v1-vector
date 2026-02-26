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
// Hides the scrollbar, enables mouse-drag + touch-drag horizontal scroll.
// Fires onDragEnd(true) if the pointer moved < 6px (i.e. a click), false if a drag.
function DragScroll({
  children,
  style,
  className,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
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
  const onMouseUp = () => {
    const el = ref.current
    if (!el) return
    drag.current.active = false
    el.style.cursor = "grab"
  }
  const onMouseLeave = () => {
    const el = ref.current
    if (!el) return
    drag.current.active = false
    el.style.cursor = "grab"
  }

  // Prevent click-firing on children when the pointer moved (it was a drag)
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
        // Hide scrollbar cross-browser
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        ...style,
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onClickCapture={onClickCapture}
    >
      {/* Hide webkit scrollbar */}
      <style>{`.drag-scroll::-webkit-scrollbar { display: none; }`}</style>
      {children}
    </div>
  )
}

// ─── Tiny fade+slide hook ────────────────────────────────────────────────────
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

// ─── Page shell (Suspense boundary required for useSearchParams) ─────────────
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
          <div className="bg-[#f5f0e8] rounded-sm shadow-2xl shadow-black/40 overflow-hidden">
            <div className="h-1 bg-[#1a1a1a]" />
            <div className="px-6 py-10 md:px-10 md:py-14">
              <div className="flex items-center justify-center mb-10" style={{ height: 32 }}>
                <div className="h-3 w-24 rounded bg-[#1a1a1a]/10 animate-pulse" />
              </div>
              <div className="h-px bg-[#1a1a1a]/10 mb-8" />
              <div className="flex items-center justify-center mb-8" style={{ minHeight: 48 }}>
                <div className="flex gap-8">
                  {[80, 120, 96].map((w, i) => (
                    <div key={i} className="h-4 rounded bg-[#1a1a1a]/10 animate-pulse" style={{ width: w }} />
                  ))}
                </div>
              </div>
              <div className="h-px bg-[#1a1a1a]/10 mb-10" />
              <div className="flex items-center justify-center" style={{ minHeight: 32 }}>
                <div className="flex gap-6">
                  {[64, 96, 80, 72].map((w, i) => (
                    <div key={i} className="h-3 rounded bg-[#1a1a1a]/10 animate-pulse" style={{ width: w }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="h-px bg-[#1a1a1a]/10" />
            <div className="px-6 py-3 md:px-10 flex items-center justify-between">
              <span className="text-[#1a1a1a]/20 text-[10px] tracking-[0.3em] uppercase" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>Lexicon</span>
              <span className="text-[#1a1a1a]/20 text-[10px] tracking-[0.3em] uppercase" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>—</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Inner component (uses useSearchParams — must be inside Suspense) ─────────
function LexiconInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const [view, setView] = useState<LexiconView | null>(null)
  const [ready, setReady] = useState(false) // true once graph is in memory

  // Recompute view whenever the store emits
  const recompute = useCallback(() => {
    const s = getStore()
    if (!s.loaded || !s.selectedId) return
    const v = computeView(s.selectedId)
    if (v) {
      setView(v)
      setReady(true)
    }
  }, [])

  // Bootstrap: load graph once, subscribe to store changes
  useEffect(() => {
    const unsub = subscribe(recompute)
    ensureLoaded().then(recompute)
    return unsub
  }, [recompute])

  // Sync selectedId with URL param on mount + URL changes
  useEffect(() => {
    const termLabel = searchParams.get("term")
    if (!termLabel) return
    const s = getStore()
    if (!s.loaded) return
    const term = findByLabel(termLabel)
    if (term && term.id !== s.selectedId) {
      setSelectedId(term.id)
    }
  }, [searchParams])

  // On initial load, if URL has no ?term, set it to KNOWLEDGE after graph loads
  useEffect(() => {
    if (!ready) return
    const termLabel = searchParams.get("term")
    if (!termLabel) {
      const s = getStore()
      if (s.selectedId) {
        const v = computeView(s.selectedId)
        if (v) {
          router.replace(`/lexicon?term=${encodeURIComponent(v.selected.label)}`, { scroll: false })
        }
      }
    }
  }, [ready, searchParams, router])

  const navigateTo = useCallback((label: string) => {
    const term = findByLabel(label)
    if (!term) return
    startTransition(() => {
      setSelectedId(term.id)
      router.push(`/lexicon?term=${encodeURIComponent(label)}`, { scroll: false })
    })
  }, [router])

  const visible = useViewTransition(view)

  // ─── Transition style helper ────────────────────────────────────────────
  const fade = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(6px)",
    transition: "opacity 0.22s ease, transform 0.22s ease",
  }
  const fadeUp = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(-6px)",
    transition: "opacity 0.22s ease, transform 0.22s ease",
  }

  return (
    <div className="bg-[#0a0a0a] min-h-dvh w-full flex flex-col">
      <SimpleHeader />

      <main className="flex-1 flex flex-col items-center justify-center pt-16 px-4">
        {/* Card — dimensions are FIXED. No reflow ever. */}
        <div
          className="w-full max-w-2xl"
          style={{ opacity: 1, transform: "translateY(0)", transition: "opacity 0.4s ease" }}
        >
          <div className="bg-[#f5f0e8] rounded-sm shadow-2xl shadow-black/40 overflow-hidden">
            {/* Top accent bar */}
            <div className="h-1 bg-[#1a1a1a]" />

            <div className="px-6 py-10 md:px-10 md:py-14">

              {/* ── ROW 1: Parent ── fixed height 32px, no reflow */}
              <div className="flex items-center justify-center mb-10" style={{ height: 32 }}>
                {!ready ? (
                  // Skeleton — same height as real content
                  <div className="h-3 w-24 rounded bg-[#1a1a1a]/10 animate-pulse" />
                ) : (
                  <div style={fadeUp}>
                    {view?.parent ? (
                      <button
                        onClick={() => navigateTo(view.parent!.label)}
                        className="flex items-center gap-2 group cursor-pointer"
                      >
                        <ChevronUp className="w-3.5 h-3.5 text-[#1a1a1a]/30 group-hover:text-[#1a1a1a]/70 transition-colors" />
                        <span
                          className="text-[#1a1a1a]/40 text-xs tracking-[0.25em] font-light uppercase group-hover:text-[#1a1a1a]/70 transition-colors"
                          style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                        >
                          {view.parent.label}
                        </span>
                      </button>
                    ) : (
                      // Root node — keep height occupied with invisible spacer
                      <span className="invisible text-xs">ROOT</span>
                    )}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-[#1a1a1a]/10 mb-8" />

              {/* ── ROW 2: Siblings ── fixed height 48px, drag-scrollable */}
              <DragScroll
                className="drag-scroll mb-8"
                style={{
                  height: 48,
                  lineHeight: "48px",
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "nowrap",
                  whiteSpace: "nowrap",
                }}
              >
                {!ready ? (
                  <div className="flex gap-8 mx-auto" style={{ flexWrap: "nowrap" }}>
                    {[80, 120, 96].map((w, i) => (
                      <div key={i} className="h-4 rounded bg-[#1a1a1a]/10 animate-pulse flex-shrink-0" style={{ width: w }} />
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      ...fade,
                      display: "inline-flex",
                      flexWrap: "nowrap",
                      whiteSpace: "nowrap",
                      gap: "40px",
                      margin: "0 auto",
                    }}
                  >
                    {view?.siblings.map((sibling) => {
                      const isSelected = sibling.id === view.selected.id
                      return (
                        <button
                          key={sibling.id}
                          onClick={() => !isSelected && navigateTo(sibling.label)}
                          className={`relative pb-2 flex-shrink-0 ${isSelected ? "cursor-default" : "cursor-pointer group"}`}
                          style={{ flexShrink: 0 }}
                        >
                          <span
                            className={`text-sm md:text-base tracking-[0.2em] font-normal uppercase transition-colors duration-200 ${
                              isSelected ? "text-[#1a1a1a]" : "text-[#1a1a1a]/30 group-hover:text-[#1a1a1a]/70"
                            }`}
                            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                          >
                            {sibling.label}
                          </span>
                          {isSelected && (
                            <span
                              className="absolute bottom-0 left-0 right-0 block"
                              style={{
                                height: 2,
                                background: "#1a1a1a",
                                // CSS-only underline slide — no layout change
                                animation: "underline-in 0.25s ease forwards",
                              }}
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </DragScroll>

              {/* Divider */}
              <div className="h-px bg-[#1a1a1a]/10 mb-10" />

              {/* ── ROW 3: Children ── fixed height 32px, drag-scrollable */}
              <DragScroll
                className="drag-scroll"
                style={{
                  height: 32,
                  lineHeight: "32px",
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "nowrap",
                  whiteSpace: "nowrap",
                }}
              >
                {!ready ? (
                  <div className="flex gap-6 mx-auto" style={{ flexWrap: "nowrap" }}>
                    {[64, 96, 80, 72].map((w, i) => (
                      <div key={i} className="h-3 rounded bg-[#1a1a1a]/10 animate-pulse flex-shrink-0" style={{ width: w }} />
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      ...fade,
                      display: "inline-flex",
                      flexWrap: "nowrap",
                      whiteSpace: "nowrap",
                      gap: "32px",
                      margin: "0 auto",
                    }}
                  >
                    {view?.children && view.children.length > 0 ? (
                      view.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => navigateTo(child.label)}
                          className="cursor-pointer group"
                          style={{ flexShrink: 0 }}
                        >
                          <span
                            className="text-xs md:text-sm tracking-[0.2em] font-light uppercase text-[#1a1a1a]/30 group-hover:text-[#1a1a1a]/70 transition-colors duration-200"
                            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                          >
                            {child.label}
                          </span>
                        </button>
                      ))
                    ) : (
                      <span
                        className="text-[#1a1a1a]/15 text-xs tracking-[0.3em] uppercase italic"
                        style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                      >
                        leaf node
                      </span>
                    )}
                  </div>
                )}
              </DragScroll>

            </div>

            {/* Bottom bar */}
            <div className="h-px bg-[#1a1a1a]/10" />
            <div className="px-6 py-3 md:px-10 flex items-center justify-between">
              <span className="text-[#1a1a1a]/20 text-[10px] tracking-[0.3em] uppercase"
                style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                Lexicon
              </span>
              <span className="text-[#1a1a1a]/20 text-[10px] tracking-[0.3em] uppercase"
                style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                {view?.selected.label ?? "—"}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* CSS-only keyframe — no JS animation library needed for the underline */}
      <style>{`
        @keyframes underline-in {
          from { transform: scaleX(0); transform-origin: left; }
          to   { transform: scaleX(1); transform-origin: left; }
        }
      `}</style>
    </div>
  )
}
