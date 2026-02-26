// Module-level singleton — survives React re-renders, shared across the whole tab session.
// No Zustand, no Context: just a plain JS store with subscribers.

export interface LexiconTerm {
  id: string
  label: string
}

export interface LexiconEdge {
  parent_id: string
  child_id: string
  sort_order: number
}

export interface LexiconView {
  selected: LexiconTerm
  parent: LexiconTerm | null
  siblings: LexiconTerm[]
  children: LexiconTerm[]
}

interface Store {
  terms: LexiconTerm[]
  edges: LexiconEdge[]
  loaded: boolean
  selectedId: string | null
}

const STORAGE_KEY = 'vekthos_lexicon_graph'

const store: Store = {
  terms: [],
  edges: [],
  loaded: false,
  selectedId: null,
}

const subscribers = new Set<() => void>()

function notify() {
  subscribers.forEach(fn => fn())
}

export function subscribe(fn: () => void) {
  subscribers.add(fn)
  return () => subscribers.delete(fn)
}

export function getStore() {
  return store
}

export function setSelectedId(id: string) {
  store.selectedId = id
  notify()
}

/** Load graph from API once, fall back to localStorage, then re-fetch to refresh cache. */
export async function ensureLoaded(): Promise<void> {
  if (store.loaded) return

  // Try localStorage first for instant render
  try {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (parsed.terms?.length) {
        store.terms = parsed.terms
        store.edges = parsed.edges
        store.loaded = true
        if (!store.selectedId) {
          const root = parsed.terms.find((t: LexiconTerm) => t.label === 'KNOWLEDGE')
          store.selectedId = root?.id ?? parsed.terms[0]?.id ?? null
        }
        notify()
      }
    }
  } catch { /* ignore */ }

  // Always fetch fresh from API (updates localStorage cache)
  try {
    const res = await fetch('/api/lexicon/graph')
    if (!res.ok) throw new Error('Graph fetch failed')
    const { terms, edges } = await res.json()
    store.terms = terms
    store.edges = edges
    store.loaded = true
    if (!store.selectedId) {
      const root = terms.find((t: LexiconTerm) => t.label === 'KNOWLEDGE')
      store.selectedId = root?.id ?? terms[0]?.id ?? null
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ terms, edges }))
    notify()
  } catch (err) {
    console.error('Lexicon graph fetch failed:', err)
  }
}

/** Compute parent / siblings / children purely from in-memory graph. Zero API calls. */
export function computeView(termId?: string): LexiconView | null {
  const id = termId ?? store.selectedId
  if (!id) return null
  const termMap = new Map(store.terms.map(t => [t.id, t]))
  const selected = termMap.get(id)
  if (!selected) return null

  // Parent edge
  const parentEdge = store.edges.find(e => e.child_id === id)
  const parent = parentEdge ? (termMap.get(parentEdge.parent_id) ?? null) : null

  // Siblings: all children of the same parent, sorted
  let siblings: LexiconTerm[]
  if (parentEdge) {
    siblings = store.edges
      .filter(e => e.parent_id === parentEdge.parent_id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(e => termMap.get(e.child_id))
      .filter(Boolean) as LexiconTerm[]
  } else {
    siblings = [selected] // root has no siblings, only itself
  }

  // Children: direct children of selected
  const children = store.edges
    .filter(e => e.parent_id === id)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(e => termMap.get(e.child_id))
    .filter(Boolean) as LexiconTerm[]

  return { selected, parent, siblings, children }
}

/** Find a term by label (case-insensitive). */
export function findByLabel(label: string): LexiconTerm | undefined {
  return store.terms.find(t => t.label === label.toUpperCase())
}

/** Invalidate the in-memory cache so next ensureLoaded() re-fetches. */
export function invalidate() {
  store.loaded = false
  store.terms = []
  store.edges = []
  store.selectedId = null
  try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
}
