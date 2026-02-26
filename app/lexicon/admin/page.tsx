"use client"

import { useState, useEffect } from "react"
import { SimpleHeader } from "@/components/simple-header"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Plus, Trash2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface Term {
  id: string
  label: string
  created_at: string
  parent_id: string | null
  parent_label: string | null
}

export default function LexiconAdminPage() {
  const router = useRouter()
  const [terms, setTerms] = useState<Term[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newLabel, setNewLabel] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchTerms = async () => {
    try {
      const res = await fetch('/api/lexicon/terms')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setTerms(data.terms || [])
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTerms()
  }, [])

  const handleAdd = async () => {
    if (!newLabel.trim() || isAdding) return

    setIsAdding(true)
    setFeedback(null)

    try {
      const res = await fetch('/api/lexicon/terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newLabel.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setFeedback({ type: 'error', message: data.error || 'Failed to add term' })
        return
      }

      setFeedback({
        type: 'success',
        message: `"${data.term.label}" added under "${data.parent}" (${data.provenance})`,
      })
      setNewLabel("")
      await fetchTerms()
    } catch (error) {
      setFeedback({ type: 'error', message: 'Network error' })
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = async (id: string, label: string) => {
    if (label === 'KNOWLEDGE') {
      setFeedback({ type: 'error', message: 'Cannot delete the root term' })
      return
    }

    setDeletingId(id)
    setFeedback(null)

    try {
      const res = await fetch(`/api/lexicon/terms/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')

      setFeedback({ type: 'success', message: `"${label}" deleted` })
      await fetchTerms()
    } catch (error) {
      setFeedback({ type: 'error', message: 'Failed to delete term' })
    } finally {
      setDeletingId(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div className="bg-[#0a0a0a] min-h-dvh w-full flex flex-col">
      <SimpleHeader />

      <main className="flex-1 pt-20 pb-10 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push('/lexicon')}
              className="text-white/30 hover:text-white/70 transition-colors"
              aria-label="Back to lexicon"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-white text-xl font-light tracking-wide">Lexicon Admin</h1>
              <p className="text-white/30 text-sm mt-1">Add and manage taxonomy terms</p>
            </div>
          </div>

          {/* Add Term */}
          <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter new term (e.g. NEUROSCIENCE)"
                className="flex-1 bg-transparent text-white placeholder:text-white/25 text-sm outline-none h-10"
              />
              <button
                onClick={handleAdd}
                disabled={!newLabel.trim() || isAdding}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 disabled:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 rounded-lg px-4 py-2.5 transition-colors"
              >
                {isAdding ? (
                  <Loader2 className="w-4 h-4 text-white/60 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 text-white/60" />
                )}
                <span className="text-white/70 text-xs font-medium">
                  {isAdding ? 'Wiring...' : 'Add'}
                </span>
              </button>
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3"
                >
                  <p className={`text-xs ${
                    feedback.type === 'success' ? 'text-green-400/70' : 'text-red-400/70'
                  }`}>
                    {feedback.message}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Terms List */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_1fr_auto] gap-4 px-5 py-3 border-b border-white/5">
              <span className="text-white/30 text-[10px] tracking-[0.2em] uppercase font-medium">Term</span>
              <span className="text-white/30 text-[10px] tracking-[0.2em] uppercase font-medium">Parent</span>
              <span className="text-white/30 text-[10px] tracking-[0.2em] uppercase font-medium w-10" />
            </div>

            {/* Rows */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
              </div>
            ) : terms.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-white/20 text-sm">No terms yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {terms.map((term) => (
                  <motion.div
                    key={term.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-[1fr_1fr_auto] gap-4 px-5 py-3 items-center hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-white/80 text-sm tracking-wide uppercase font-light">
                      {term.label}
                    </span>
                    <span className="text-white/30 text-xs tracking-wide uppercase">
                      {term.parent_label || '(root)'}
                    </span>
                    <button
                      onClick={() => handleDelete(term.id, term.label)}
                      disabled={deletingId === term.id || term.label === 'KNOWLEDGE'}
                      className="w-10 flex items-center justify-center text-white/20 hover:text-red-400/70 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      aria-label={`Delete ${term.label}`}
                    >
                      {deletingId === term.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/5">
              <span className="text-white/15 text-[10px] tracking-[0.2em] uppercase">
                {terms.length} terms
              </span>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
