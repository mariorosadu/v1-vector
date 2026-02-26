"use client"

import { useState, useEffect, useCallback } from "react"
import { SimpleHeader } from "@/components/simple-header"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronUp } from "lucide-react"

interface Term {
  id: string
  label: string
}

interface NavigationData {
  selected: Term
  parent: Term | null
  siblings: Term[]
  children: Term[]
}

export default function LexiconPage() {
  const [navData, setNavData] = useState<NavigationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTerm, setCurrentTerm] = useState("KNOWLEDGE")

  const fetchNavigation = useCallback(async (term: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/lexicon/navigate?term=${encodeURIComponent(term)}`)
      if (!res.ok) throw new Error('Navigation failed')
      const data = await res.json()
      setNavData(data)
      setCurrentTerm(term)
    } catch (error) {
      console.error('Navigation error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Read term from URL hash or default to KNOWLEDGE
    const urlParams = new URLSearchParams(window.location.search)
    const term = urlParams.get('term') || 'KNOWLEDGE'
    fetchNavigation(term)
  }, [fetchNavigation])

  const navigateTo = (label: string) => {
    window.history.pushState({}, '', `/lexicon?term=${encodeURIComponent(label)}`)
    fetchNavigation(label)
  }

  const navigateUp = () => {
    if (navData?.parent) {
      navigateTo(navData.parent.label)
    }
  }

  return (
    <div className="bg-[#0a0a0a] min-h-dvh w-full flex flex-col">
      <SimpleHeader />

      <main className="flex-1 flex flex-col items-center justify-center pt-16 px-4">
        {/* Paper card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-2xl"
        >
          <div className="bg-[#f5f0e8] rounded-sm shadow-2xl shadow-black/40 overflow-hidden">
            {/* Top bar */}
            <div className="h-1 bg-[#1a1a1a]" />

            <div className="px-6 py-10 md:px-10 md:py-14">

              {/* Row 1: Parent */}
              <div className="flex items-center justify-center mb-10 min-h-[32px]">
                <AnimatePresence mode="wait">
                  {navData?.parent ? (
                    <motion.button
                      key={navData.parent.label}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      onClick={navigateUp}
                      className="flex items-center gap-2 group cursor-pointer"
                    >
                      <ChevronUp className="w-3.5 h-3.5 text-[#1a1a1a]/30 group-hover:text-[#1a1a1a]/70 transition-colors" />
                      <span className="text-[#1a1a1a]/40 text-xs tracking-[0.25em] font-light uppercase group-hover:text-[#1a1a1a]/70 transition-colors">
                        {navData.parent.label}
                      </span>
                    </motion.button>
                  ) : (
                    <motion.div
                      key="root"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-4"
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#1a1a1a]/10 mb-8" />

              {/* Row 2: Siblings with selected centered + underlined */}
              <div className="flex items-center justify-center gap-6 md:gap-10 mb-8 flex-wrap min-h-[48px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={navData?.selected?.label || 'loading'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-center gap-6 md:gap-10 flex-wrap"
                  >
                    {isLoading ? (
                      <div className="text-[#1a1a1a]/20 text-sm tracking-[0.2em]">...</div>
                    ) : (
                      navData?.siblings.map((sibling) => {
                        const isSelected = sibling.id === navData.selected.id
                        return (
                          <button
                            key={sibling.id}
                            onClick={() => !isSelected && navigateTo(sibling.label)}
                            className={`relative pb-2 transition-all duration-200 ${
                              isSelected
                                ? 'cursor-default'
                                : 'cursor-pointer group'
                            }`}
                          >
                            <span
                              className={`text-sm md:text-base tracking-[0.2em] font-normal uppercase transition-colors duration-200 ${
                                isSelected
                                  ? 'text-[#1a1a1a]'
                                  : 'text-[#1a1a1a]/30 group-hover:text-[#1a1a1a]/70'
                              }`}
                              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                            >
                              {sibling.label}
                            </span>
                            {isSelected && (
                              <motion.div
                                layoutId="underline"
                                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1a1a1a]"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              />
                            )}
                          </button>
                        )
                      })
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#1a1a1a]/10 mb-10" />

              {/* Row 3: Children */}
              <div className="flex items-center justify-center gap-5 md:gap-8 flex-wrap min-h-[32px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={navData?.selected?.label || 'loading-children'}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="flex items-center justify-center gap-5 md:gap-8 flex-wrap"
                  >
                    {navData?.children && navData.children.length > 0 ? (
                      navData.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => navigateTo(child.label)}
                          className="cursor-pointer group"
                        >
                          <span
                            className="text-xs md:text-sm tracking-[0.2em] font-light uppercase text-[#1a1a1a]/30 group-hover:text-[#1a1a1a]/70 transition-colors duration-200"
                            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                          >
                            {child.label}
                          </span>
                        </button>
                      ))
                    ) : !isLoading ? (
                      <span className="text-[#1a1a1a]/15 text-xs tracking-[0.3em] uppercase italic">
                        leaf node
                      </span>
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>

            {/* Bottom bar */}
            <div className="h-px bg-[#1a1a1a]/10" />
            <div className="px-6 py-3 md:px-10 flex items-center justify-between">
              <span className="text-[#1a1a1a]/20 text-[10px] tracking-[0.3em] uppercase">
                Lexicon
              </span>
              <span className="text-[#1a1a1a]/20 text-[10px] tracking-[0.3em] uppercase">
                {currentTerm}
              </span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
