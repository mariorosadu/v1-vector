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

// ─── CSS keyframes injected once ─────────────────────────────────────────────
const KEYFRAMES = `
  /* Navigating DOWN (clicked child): rows slide up */
  @keyframes row-enter-from-below   { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }
  @keyframes row-exit-to-above      { from { opacity:1; transform:translateY(0)    } to { opacity:0; transform:translateY(-18px) } }
  @keyframes row-rise               { from { opacity:1; transform:translateY(0)    } to { opacity:1; transform:translateY(0) } }

  /* Navigating UP (clicked parent): rows slide down */
  @keyframes row-enter-from-above   { from { opacity:0; transform:translateY(-18px) } to { opacity:1; transform:translateY(0) } }
  @keyframes row-exit-to-below      { from { opacity:1; transform:translateY(0)     } to { opacity:0; transform:translateY(18px) } }

  /* Lateral (sibling click): cross-fade only */
  @keyframes row-fade-in            { from { opacity:0 } to { opacity:1 } }
  @keyframes row-fade-out           { from { opacity:1 } to { opacity:0 } }

  .drag-scroll::-webkit-scrollbar { display:none; }
`

// ─── DragScroll ───────────────────────────────────────────────────────────────
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

// ─── Animation helpers ────────────────────────────────────────────────────────
type Direction = "down" | "up" | "lateral" | "none"

function rowAnim(
  row: "parent" | "siblings" | "children",
  dir: Direction,
  phase: "enter" | "exit"
): React.CSSProperties {
  const dur = "0.22s"
  const ease = "cubic-bezier(0.4,0,0.2,1)"

  if (dir === "none") return { opacity: 1 }

  // Map: which animation name for each row/dir/phase combo
  const map: Record<Direction, Record<"parent"|"siblings"|"children", [string, string]>> = {
    // [enterAnim, exitAnim]
    down: {
      parent:   ["row-rise",            "row-exit-to-above"],
      siblings: ["row-enter-from-below","row-exit-to-above"],
      children: ["row-enter-from-below","row-fade-out"],
    },
    up: {
      parent:   ["row-fade-in",         "row-exit-to-below"],
      siblings: ["row-enter-from-above","row-exit-to-below"],
      children: ["row-rise",            "row-exit-to-below"],
    },
    lateral: {
      parent:   ["row-fade-in","row-fade-out"],
      siblings: ["row-fade-in","row-fade-out"],
      children: ["row-fade-in","row-fade-out"],
    },
    none: { parent:["",""], siblings:["",""], children:["",""] },
  }

  const [enterName, exitName] = map[dir][row]
  const name = phase === "enter" ? enterName : exitName
  if (!name) return { opacity: phase === "enter" ? 1 : 0 }
  return { animation: `${name} ${dur} ${ease} both` }
}

// ─── Page shell ───────────────────────────────────────────────────────────────
export default function LexiconPage() {
  return (
    <Suspense fallback={<LexiconSkeleton />}>
      <LexiconInner />
    </Suspense>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
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

// ─── Inner (requires Suspense for useSearchParams) ────────────────────────────
function LexiconInner() {
  const router   = useRouter()
  const params   = useSearchParams()
  const [, startT] = useTransition()

  const [view, setView]     = useState<LexiconView | null>(null)
  const [ready, setReady]   = useState(false)

  // Navigation direction state
  const [direction, setDirection] = useState<Direction>("none")
  const [animKey, setAnimKey]     = useState(0)   // bumped on every navigation to re-trigger animations

  // Stable key per navigation — used to re-trigger CSS animations
  const [parentKey,   setParentKey]   = useState("pk0")
  const [siblingsKey, setSiblingsKey] = useState("sk0")
  const [childrenKey, setChildrenKey] = useState("ck0")

  const siblingsRef   = useRef<HTMLDivElement>(null)
  const siblingsInner = useRef<HTMLDivElement>(null)

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
    const termLabel = params.get("term")
    if (!termLabel) return
    const s = getStore()
    if (!s.loaded) return
    const term = findByLabel(termLabel)
    if (term && term.id !== s.selectedId) setSelectedId(term.id)
  }, [params])

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

  // Center selected sibling — runs after every navigation AND on initial load
  const centerSelected = useCallback((instant: boolean) => {
    const container = siblingsRef.current
    const inner = siblingsInner.current
    if (!container || !inner) return

    // Set padding so edge words can reach the center
    const half = container.offsetWidth / 2
    inner.style.paddingLeft  = `${half}px`
    inner.style.paddingRight = `${half}px`

    const selected = container.querySelector("[data-selected='true']") as HTMLElement | null
    if (!selected) return

    const containerCenter = container.offsetWidth / 2
    const elCenter = selected.offsetLeft + selected.offsetWidth / 2
    container.scrollTo({ left: elCenter - containerCenter, behavior: instant ? "instant" : "smooth" })
  }, [])

  // After navigation: wait for enter-animation to begin, then center
  useEffect(() => {
    if (!ready) return
    const t = setTimeout(() => centerSelected(false), 40)
    return () => clearTimeout(t)
  }, [animKey, ready, centerSelected])

  // On initial load: center immediately with no animation
  useEffect(() => {
    if (!ready) return
    centerSelected(true)
  }, [ready, centerSelected])

  const navigateTo = useCallback((label: string, dir: Direction) => {
    const term = findByLabel(label)
    if (!term) return
    const n = Date.now()
    setDirection(dir)
    setAnimKey(k => k + 1)
    setParentKey(`p${n}`)
    setSiblingsKey(`s${n}`)
    setChildrenKey(`c${n}`)
    startT(() => {
      setSelectedId(term.id)
      router.push(`/lexicon?term=${encodeURIComponent(label)}`, { scroll: false })
    })
  }, [router])

  // ── Computed animation styles per row ────────────────────────────────────
  const DUR = "0.22s"
  const EASE = "cubic-bezier(0.4,0,0.2,1)"

  function anim(row: "parent"|"siblings"|"children"): React.CSSProperties {
    if (direction === "none" || !ready) return { opacity: 1 }

    // All rows show NEW content, so all use ENTER animations.
    // Direction determines WHERE the new content slides in FROM:
    //   down (clicked child)  = hierarchy moved up   → new parent fades in, new siblings rise from below, new children rise from below
    //   up   (clicked parent) = hierarchy moved down  → new parent drops from above, new siblings drop from above, new children fade in
    //   lateral (clicked sibling) = pure cross-fade, no vertical movement
    const table: Record<Direction, Record<"parent"|"siblings"|"children", string>> = {
      down: {
        parent:   "row-fade-in",             // parent quietly fades in
        siblings: "row-enter-from-below",    // new siblings rise up (the child that was clicked is now here)
        children: "row-enter-from-below",    // new children appear from below
      },
      up: {
        parent:   "row-enter-from-above",    // new parent drops down from above
        siblings: "row-enter-from-above",    // new siblings drop down (parent that was clicked is now here)
        children: "row-fade-in",             // children quietly fade in
      },
      lateral: {
        parent:   "row-fade-in",
        siblings: "row-fade-in",
        children: "row-fade-in",
      },
      none: { parent:"", siblings:"", children:"" },
    }
    const name = table[direction][row]
    if (!name) return { opacity: 1 }
    return { animation: `${name} ${DUR} ${EASE} both` }
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
                  <div key={parentKey} style={anim("parent")}>
                    {view?.parent ? (
                      <button
                        onClick={() => navigateTo(view.parent!.label, "up")}
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

              <div className="h-px bg-white/8 mb-6" />

              {/* ── ROW 2: Siblings ── */}
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
                    key={siblingsKey}
                    ref={siblingsInner}
                    style={{
                      ...anim("siblings"),
                      display:"inline-flex", flexWrap:"nowrap", whiteSpace:"nowrap",
                      gap:36,
                    }}
                  >
                    {view?.siblings.map((sibling) => {
                      const isSel = sibling.id === view.selected.id
                      return (
                        <button
                          key={sibling.id}
                          data-selected={isSel ? "true" : "false"}
                          onClick={() => !isSel && navigateTo(sibling.label, "lateral")}
                          className={`relative flex-shrink-0 pb-1.5 ${isSel ? "cursor-default" : "cursor-pointer group"}`}
                        >
                          <span className={`font-sans text-sm tracking-[0.22em] font-normal uppercase transition-colors duration-150 ${
                            isSel ? "text-white" : "text-white/30 group-hover:text-white/60"
                          }`}>
                            {sibling.label}
                          </span>
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
                style={{ height:24, lineHeight:"24px", display:"flex", alignItems:"center", flexWrap:"nowrap", whiteSpace:"nowrap" }}
              >
                {!ready ? (
                  <div className="flex gap-6 mx-auto">
                    {[64,96,80,72].map((w,i) => <div key={i} className="h-2 rounded bg-white/10 animate-pulse flex-shrink-0" style={{ width:w }} />)}
                  </div>
                ) : (
                  <div
                    key={childrenKey}
                    style={{
                      ...anim("children"),
                      display:"inline-flex", flexWrap:"nowrap", whiteSpace:"nowrap",
                      gap:28, margin:"0 auto", paddingLeft:"40%", paddingRight:"40%",
                    }}
                  >
                    {view?.children && view.children.length > 0 ? (
                      view.children.map((child) => (
                        <button key={child.id} onClick={() => navigateTo(child.label, "down")} className="cursor-pointer group flex-shrink-0">
                          <span className="font-sans text-[11px] tracking-[0.22em] font-light uppercase text-white/30 group-hover:text-white/65 transition-colors duration-150">
                            {child.label}
                          </span>
                        </button>
                      ))
                    ) : (
                      <span className="font-sans text-white/15 text-[10px] tracking-[0.28em] uppercase">leaf node</span>
                    )}
                  </div>
                )}
              </DragScroll>

            </div>

            <div className="h-px bg-white/8" />
          </div>
        </div>
      </main>
    </div>
  )
}
