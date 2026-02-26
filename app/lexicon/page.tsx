"use client"

import { useState, useEffect, useCallback, useRef, useTransition, Suspense } from "react"
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

const ROW_H = {
  parent:   28,
  siblings: 40,
  children: 28,
  divider:  20,
}
const TOTAL_H = ROW_H.parent + ROW_H.divider + ROW_H.siblings + ROW_H.divider + ROW_H.children

// ─── DragScroll ──────────────────────────────────────────────────────────────
function DragScroll({ children, style, className, scrollRef }: {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
  scrollRef: React.RefObject<HTMLDivElement | null>
}) {
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false })

  const down  = (e: React.MouseEvent) => {
    const el = scrollRef.current; if (!el) return
    drag.current = { active: true, startX: e.pageX, scrollLeft: el.scrollLeft, moved: false }
    el.style.cursor = "grabbing"
  }
  const move  = (e: React.MouseEvent) => {
    const el = scrollRef.current; if (!drag.current.active || !el) return
    e.preventDefault()
    const d = e.pageX - drag.current.startX
    if (Math.abs(d) > 4) drag.current.moved = true
    el.scrollLeft = drag.current.scrollLeft - d
  }
  const up    = () => { const el = scrollRef.current; if (el) { drag.current.active = false; el.style.cursor = "grab" } }
  const click = (e: React.MouseEvent) => { if (drag.current.moved) { e.stopPropagation(); drag.current.moved = false } }

  return (
    <div
      ref={scrollRef as React.RefObject<HTMLDivElement>}
      className={className}
      style={{ overflowX: "auto", overflowY: "hidden", cursor: "grab", userSelect: "none", scrollbarWidth: "none", ...style }}
      onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up} onClickCapture={click}
    >
      <style>{`.drag-scroll::-webkit-scrollbar{display:none}`}</style>
      {children}
    </div>
  )
}

// ─── Center a labelled element inside a scroll container ─────────────────────
function scrollLabelToCenter(container: HTMLDivElement | null, label: string, behavior: ScrollBehavior) {
  if (!container) return 0
  const el = container.querySelector(`[data-label="${CSS.escape(label)}"]`) as HTMLElement | null
  if (!el) return 0
  const to = el.offsetLeft + el.offsetWidth / 2 - container.offsetWidth / 2
  container.scrollTo({ left: to, behavior })
  return to
}

// Ensure edge-words can reach center by padding inner flex wrapper
function applyHalfPad(container: HTMLDivElement | null, inner: HTMLDivElement | null) {
  if (!container || !inner) return
  const half = container.offsetWidth / 2
  inner.style.paddingLeft  = `${half}px`
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
    <div className="bg-[#0a0a0a] min-h-dvh flex flex-col">
      <SimpleHeader />
      <main className="flex-1 flex items-center justify-center pt-16 px-4">
        <div className="w-full max-w-2xl">
          <div className="bg-[#1c1c1c] rounded-sm border border-white/5 overflow-hidden">
            <div className="h-px bg-white/20" />
            <div className="px-10 py-6 border-b border-white/10 text-center">
              <div className="h-6 w-32 mx-auto rounded bg-white/10 animate-pulse" />
            </div>
            <div className="px-10 py-10" style={{ height: TOTAL_H + 80 }}>
              <div className="flex items-center justify-center" style={{ height: ROW_H.parent }}>
                <div className="h-2 w-20 rounded bg-white/10 animate-pulse" />
              </div>
              <div className="my-5 h-px bg-white/8" />
              <div className="flex items-center justify-center gap-8" style={{ height: ROW_H.siblings }}>
                {[80,120,96].map((w,i) => <div key={i} className="h-3 rounded bg-white/10 animate-pulse" style={{ width: w }} />)}
              </div>
              <div className="my-5 h-px bg-white/8" />
              <div className="flex items-center justify-center gap-6" style={{ height: ROW_H.children }}>
                {[64,96,80,72].map((w,i) => <div key={i} className="h-2 rounded bg-white/10 animate-pulse" style={{ width: w }} />)}
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
type Phase = "idle" | "phase1" | "phase2"

function LexiconInner() {
  const router  = useRouter()
  const params  = useSearchParams()
  const [, startT] = useTransition()

  const [view,  setView]  = useState<LexiconView | null>(null)
  const [ready, setReady] = useState(false)

  // Refs
  const siblingsScroll = useRef<HTMLDivElement>(null)
  const siblingsInner  = useRef<HTMLDivElement>(null)
  const childrenScroll = useRef<HTMLDivElement>(null)
  const childrenInner  = useRef<HTMLDivElement>(null)
  const parentScroll   = useRef<HTMLDivElement>(null)

  // Vertical slide: we animate a single wrapper div
  const wrapperRef = useRef<HTMLDivElement>(null)
  const phase      = useRef<Phase>("idle")

  // ── Store subscription ──────────────────────────────────────────────────────
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

  // URL sync
  useEffect(() => {
    const label = params.get("term")
    if (!label) return
    const s = getStore()
    if (!s.loaded) return
    const t = findByLabel(label)
    if (t && t.id !== s.selectedId) setSelectedId(t.id)
  }, [params])

  useEffect(() => {
    if (!ready || params.get("term") || !view) return
    router.replace(`/lexicon?term=${encodeURIComponent(view.selected.label)}`, { scroll: false })
  }, [ready, view, params, router])

  // Center siblings on first load
  useEffect(() => {
    if (!ready) return
    requestAnimationFrame(() => {
      applyHalfPad(siblingsScroll.current, siblingsInner.current)
      const container = siblingsScroll.current
      if (!container) return
      const sel = container.querySelector("[data-selected='true']") as HTMLElement | null
      if (sel) {
        container.scrollLeft = sel.offsetLeft + sel.offsetWidth / 2 - container.offsetWidth / 2
      }
    })
  }, [ready])

  // ── Navigate ──────────────────────────────────────────────────────────────
  const navigateTo = useCallback((label: string, from: "parent" | "children" | "siblings") => {
    if (phase.current !== "idle") return
    const term = findByLabel(label)
    if (!term) return
    phase.current = "phase1"

    if (from === "siblings") {
      // Lateral: just swap + re-center immediately
      startT(() => {
        setSelectedId(term.id)
        router.push(`/lexicon?term=${encodeURIComponent(label)}`, { scroll: false })
      })
      setTimeout(() => {
        applyHalfPad(siblingsScroll.current, siblingsInner.current)
        const container = siblingsScroll.current
        if (container) {
          const sel = container.querySelector("[data-selected='true']") as HTMLElement | null
          if (sel) container.scrollTo({ left: sel.offsetLeft + sel.offsetWidth / 2 - container.offsetWidth / 2, behavior: "smooth" })
        }
        phase.current = "idle"
      }, 50)
      return
    }

    // ── PHASE 1: scroll clicked word to center of its row ──────────────────
    const sourceRef = from === "children" ? childrenScroll.current : parentScroll.current
    scrollLabelToCenter(sourceRef, label, "smooth")

    // ── PHASE 2 (after 400ms): slide rows wrapper ───────────────────────────
    setTimeout(() => {
      phase.current = "phase2"
      const wrapper = wrapperRef.current
      if (!wrapper) { phase.current = "idle"; return }

      // Measure the pixel distance from the source row to the siblings row
      const sourceRowEl = wrapper.querySelector(`[data-row="${from}"]`) as HTMLElement | null
      const middleRowEl = wrapper.querySelector(`[data-row="siblings"]`) as HTMLElement | null
      if (!sourceRowEl || !middleRowEl) { phase.current = "idle"; return }

      const srcMid    = sourceRowEl.getBoundingClientRect().top + sourceRowEl.offsetHeight / 2
      const midMid    = middleRowEl.getBoundingClientRect().top + middleRowEl.offsetHeight / 2
      const distance  = srcMid - midMid  // + = source is below, - = source is above

      // Slide wrapper so source row aligns with where siblings row was
      wrapper.style.transition = "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)"
      wrapper.style.transform  = `translateY(${-distance}px)`

      // After slide finishes, snap new data and reset
      setTimeout(() => {
        // Disable transition, reset
        wrapper.style.transition = "none"
        wrapper.style.transform  = "translateY(0)"

        // Swap data
        startT(() => {
          setSelectedId(term.id)
          router.push(`/lexicon?term=${encodeURIComponent(label)}`, { scroll: false })
        })

        // Center the newly selected word after data swap
        setTimeout(() => {
          applyHalfPad(siblingsScroll.current, siblingsInner.current)
          const container = siblingsScroll.current
          if (container) {
            const sel = container.querySelector("[data-selected='true']") as HTMLElement | null
            if (sel) container.scrollLeft = sel.offsetLeft + sel.offsetWidth / 2 - container.offsetWidth / 2
          }
          phase.current = "idle"
        }, 50)
      }, 480)
    }, 400)

  }, [router])

  return (
    <div className="bg-[#0a0a0a] min-h-dvh flex flex-col">
      <SimpleHeader />
      <main className="flex-1 flex items-center justify-center pt-16 px-4">
        <div className="w-full max-w-2xl">
          <div className="bg-[#1c1c1c] rounded-sm shadow-2xl shadow-black/60 border border-white/5 overflow-hidden">
            <div className="h-px bg-white/20" />

            {/* Title */}
            <div className="px-6 py-6 md:px-10 md:py-8 border-b border-white/10 text-center">
              <h1 className="font-sans text-xl md:text-2xl font-normal tracking-[0.2em] text-white uppercase">
                Lexicon
              </h1>
            </div>

            {/* Row clip window — keeps sliding rows from overflowing */}
            <div style={{ overflow: "hidden" }}>
              <div ref={wrapperRef} className="px-6 py-8 md:px-10 md:py-10">

                {/* ROW 1 — Parent */}
                <div
                  data-row="parent"
                  style={{ height: ROW_H.parent, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {ready && view?.parent ? (
                    <DragScroll scrollRef={parentScroll} style={{ maxWidth: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ display: "inline-flex", gap: 32, padding: "0 50%", alignItems: "center", height: "100%" }}>
                        <button
                          onClick={() => navigateTo(view.parent!.label, "parent")}
                          className="flex items-center gap-2 group cursor-pointer flex-shrink-0"
                          data-label={view.parent.label}
                        >
                          <ChevronUp className="w-3 h-3 text-white/25 group-hover:text-white/60 transition-colors" />
                          <span className="font-sans text-white/35 text-[10px] tracking-[0.28em] uppercase group-hover:text-white/70 transition-colors">
                            {view.parent.label}
                          </span>
                        </button>
                      </div>
                    </DragScroll>
                  ) : ready ? (
                    <span className="font-sans text-white/15 text-[10px] tracking-[0.28em] uppercase">root</span>
                  ) : (
                    <div className="h-2 w-20 rounded bg-white/10 animate-pulse" />
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-white/8" style={{ margin: `${ROW_H.divider / 2}px 0` }} />

                {/* ROW 2 — Siblings (selected word always centered) */}
                <div
                  data-row="siblings"
                  style={{ height: ROW_H.siblings }}
                >
                  {!ready ? (
                    <div className="flex items-center justify-center gap-8 h-full">
                      {[80,120,96].map((w,i) => <div key={i} className="h-3 rounded bg-white/10 animate-pulse flex-shrink-0" style={{ width: w }} />)}
                    </div>
                  ) : (
                    <DragScroll
                      scrollRef={siblingsScroll}
                      className="drag-scroll"
                      style={{ height: "100%", display: "flex", alignItems: "center", whiteSpace: "nowrap" }}
                    >
                      <div
                        ref={siblingsInner}
                        style={{ display: "inline-flex", gap: 36, alignItems: "center" }}
                      >
                        {view?.siblings.map((s) => {
                          const isSel = s.id === view.selected.id
                          return (
                            <button
                              key={s.id}
                              data-selected={isSel ? "true" : "false"}
                              data-label={s.label}
                              onClick={() => !isSel && navigateTo(s.label, "siblings")}
                              className={`relative flex-shrink-0 pb-2 ${isSel ? "cursor-default" : "cursor-pointer group"}`}
                            >
                              <span className={`font-sans text-sm tracking-[0.22em] uppercase font-normal transition-colors duration-200 ${
                                isSel ? "text-white" : "text-white/30 group-hover:text-white/60"
                              }`}>
                                {s.label}
                              </span>
                              <span style={{
                                position: "absolute", bottom: 0, left: 0, right: 0, height: 1.5,
                                background: "rgba(255,255,255,0.8)", transformOrigin: "left",
                                transform: isSel ? "scaleX(1)" : "scaleX(0)",
                                transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
                              }} />
                            </button>
                          )
                        })}
                      </div>
                    </DragScroll>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-white/8" style={{ margin: `${ROW_H.divider / 2}px 0` }} />

                {/* ROW 3 — Children */}
                <div
                  data-row="children"
                  style={{ height: ROW_H.children }}
                >
                  {!ready ? (
                    <div className="flex items-center justify-center gap-6 h-full">
                      {[64,96,80,72].map((w,i) => <div key={i} className="h-2 rounded bg-white/10 animate-pulse flex-shrink-0" style={{ width: w }} />)}
                    </div>
                  ) : (
                    <DragScroll
                      scrollRef={childrenScroll}
                      className="drag-scroll"
                      style={{ height: "100%", display: "flex", alignItems: "center", whiteSpace: "nowrap" }}
                    >
                      <div
                        ref={childrenInner}
                        style={{ display: "inline-flex", gap: 28, alignItems: "center", paddingLeft: "50%", paddingRight: "50%" }}
                      >
                        {view?.children && view.children.length > 0 ? (
                          view.children.map((c) => (
                            <button
                              key={c.id}
                              data-label={c.label}
                              onClick={() => navigateTo(c.label, "children")}
                              className="cursor-pointer group flex-shrink-0"
                            >
                              <span className="font-sans text-[11px] tracking-[0.22em] uppercase font-light text-white/30 group-hover:text-white/65 transition-colors">
                                {c.label}
                              </span>
                            </button>
                          ))
                        ) : (
                          <span className="font-sans text-white/15 text-[10px] tracking-[0.28em] uppercase">leaf node</span>
                        )}
                      </div>
                    </DragScroll>
                  )}
                </div>

              </div>
            </div>

            <div className="h-px bg-white/8" />
          </div>
        </div>
      </main>
    </div>
  )
}
