"use client"

import { useState, useEffect, useRef, useCallback, useLayoutEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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

function waitTransitionEnd(el: HTMLElement, prop = "transform", timeoutMs = 800): Promise<void> {
  return new Promise<void>((resolve) => {
    let done = false
    const cleanup = () => {
      if (done) return
      done = true
      el.removeEventListener("transitionend", onEnd)
      clearTimeout(t)
      resolve()
    }
    const onEnd = (e: TransitionEvent) => {
      if (e.target === el && e.propertyName === prop) cleanup()
    }
    const t = window.setTimeout(cleanup, timeoutMs)
    el.addEventListener("transitionend", onEnd)
  })
}

async function animateWrapperShift(wrapper: HTMLDivElement | null, deltaY: number, duration = 480) {
  if (!wrapper) return
  wrapper.style.willChange = "transform"
  wrapper.style.transition = "none"
  wrapper.style.transform = "translateY(0px)"
  wrapper.getBoundingClientRect() // force reflow
  wrapper.style.transition = `transform ${duration}ms cubic-bezier(0.33, 1, 0.68, 1)`
  wrapper.style.transform = `translateY(${deltaY}px)`
  await waitTransitionEnd(wrapper, "transform", duration + 250)
  // keep shifted — useLayoutEffect will snap pre-paint
  wrapper.style.transition = "none"
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

// ─── Inner ────────────────────────────────────────────────────────��───────────
function LexiconInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [view, setView]   = useState<LexiconView | null>(null)
  const [ready, setReady] = useState(false)

  // Scroll container refs
  const parentRef   = useRef<HTMLDivElement | null>(null)
  const siblingsRef = useRef<HTMLDivElement | null>(null)
  const siblingsInnerRef = useRef<HTMLDivElement | null>(null)
  const childrenRef = useRef<HTMLDivElement | null>(null)

  // The wrapper that slides vertically
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  // Lock to prevent overlapping navigations
  const busy = useRef(false)
  // Pre-paint finalization refs
  const pendingCenter = useRef<{ label: string; mode: "instant" | "animate" } | null>(null)
  const pendingWrapperReset = useRef(false)

  // Load graph + subscribe
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

  // Pre-paint: snap wrapper + center selected word (no blink)
  // IMPORTANT: skip centering when mode === "animate" (useEffect handles that)
  useLayoutEffect(() => {
    if (!ready || !view) return
    const sc = siblingsRef.current
    const si = siblingsInnerRef.current
    if (!sc || !si) return

    const half = sc.offsetWidth / 2
    si.style.paddingLeft  = `${half}px`
    si.style.paddingRight = `${half}px`

    if (pendingWrapperReset.current) {
      const w = wrapperRef.current
      if (w) {
        w.style.transition = "none"
        w.style.transform  = "translateY(0px)"
      }
      pendingWrapperReset.current = false
    }

    const p = pendingCenter.current
    if (!p || p.mode === "instant") {
      centerWordInstant(sc, p?.label ?? view.selected.label)
      pendingCenter.current = null
    }
  }, [ready, view?.selected?.id, view?.siblings?.length]) // eslint-disable-line

  // Post-commit: animated centering for sibling clicks
  useEffect(() => {
    if (!ready || !view) return
    const p = pendingCenter.current
    if (!p || p.mode !== "animate") return
    const sc = siblingsRef.current
    if (!sc) return
    const label = p.label
    pendingCenter.current = null
    requestAnimationFrame(() => {
      centerWordAnimated(sc, label, 260)
    })
  }, [ready, view?.selected?.id, view?.siblings?.length]) // eslint-disable-line

  // ─── Navigate ───────────────────────────────────────────────────────────────
  const navigate = useCallback(async (label: string, from: "parent" | "sibling" | "child") => {
    if (busy.current) return
    const term = findByLabel(label)
    if (!term || term.id === view?.selected.id) return
    busy.current = true

    try {
      // ── Sibling: horizontal only ─────────────────────────────────────────
      if (from === "sibling") {
        pendingCenter.current = { label, mode: "animate" }
        setSelectedId(term.id) // subscribe() → setView
        router.replace(`/lexicon?term=${encodeURIComponent(label)}`, { scroll: false })
        return
      }

      // ── Parent / Child: two-phase ─────────────────────────────────────────
      // PHASE 1 — center clicked word in its row
      const sourceContainer = from === "child" ? childrenRef.current : parentRef.current
      await centerWordAnimated(sourceContainer, label, 360)

      // PHASE 2 — slide wrapper by fixed height constants
      const delta = from === "child"
        ? -(H.divider + (H.siblings + H.children) / 2)
        :   H.divider + (H.parent  + H.siblings) / 2

      await animateWrapperShift(wrapperRef.current, delta, 480)

      // Single render: useLayoutEffect will snap + center pre-paint
      pendingCenter.current = { label, mode: "instant" }
      pendingWrapperReset.current = true
      setSelectedId(term.id) // subscribe() → setView
      router.replace(`/lexicon?term=${encodeURIComponent(label)}`, { scroll: false })

      await nextFrame()
    } finally {
      busy.current = false
    }
  }, [view?.selected?.id, router])

  if (!ready || !view) return <Skeleton />

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

            {/* Clip window — hides rows that slide out of view */}
            <div style={{ overflow: "hidden" }}>
              <div ref={wrapperRef} className="px-8 py-8">

                {/* ROW 1 — Parent */}
                <DragScroll innerRef={parentRef}
                  style={{ height: H.parent, display: "flex", alignItems: "center", whiteSpace: "nowrap" }}
                >
                  <div data-row="parent"
                    style={{ display: "inline-flex", gap: 24, alignItems: "center", paddingLeft: "50%", paddingRight: "50%" }}
                  >
                    {view.parent ? (
                      <button
                        data-label={view.parent.label}
                        onClick={() => navigate(view.parent!.label, "parent")}
                        className="flex items-center gap-1.5 group cursor-pointer flex-shrink-0"
                      >
                        <ChevronUp className="w-2.5 h-2.5 text-white/25 group-hover:text-white/60 transition-colors" />
                        <span className="text-[11px] tracking-[0.22em] uppercase text-white/35 group-hover:text-white/70 transition-colors">
                          {view.parent.label}
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

                {/* ROW 2 — Siblings */}
                <DragScroll innerRef={siblingsRef}
                  style={{ height: H.siblings, display: "flex", alignItems: "center", whiteSpace: "nowrap" }}
                >
                  <div data-row="siblings" ref={siblingsInnerRef}
                    style={{ display: "inline-flex", gap: 36, alignItems: "center" }}
                  >
                    {view.siblings.map((s) => {
                      const sel = s.id === view.selected.id
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
                          {/* Animated underline for selected */}
                          <span style={{
                            position: "absolute", bottom: 0, left: 0, right: 0, height: 1.5,
                            background: "white", transformOrigin: "left center",
                            transform: sel ? "scaleX(1)" : "scaleX(0)",
                            transition: "transform 320ms cubic-bezier(0.4, 0, 0.2, 1)",
                          }} />
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
                    {view.children.length > 0 ? (
                      view.children.map((c) => (
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

              </div>
            </div>

            <div className="h-px bg-white/8" />
          </div>
        </div>
      </main>
    </div>
  )
}


