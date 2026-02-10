"use client"

import { useState, useRef, useEffect } from "react"
import { SimpleHeader } from "@/components/simple-header"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Loader2 } from "lucide-react"
import Image from "next/image"

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export default function MetacognitionPage() {
  const [question, setQuestion] = useState("Which objective do you want to achieve?")
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isBouncing, setIsBouncing] = useState(false)
  const [bottomOffset, setBottomOffset] = useState(0)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Track visual viewport to position input above keyboard
  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return

    const handleViewportChange = () => {
      // Calculate how much the keyboard is covering
      const keyboardHeight = window.innerHeight - viewport.height
      // Also account for any scroll offset Safari applies
      const offset = keyboardHeight + viewport.offsetTop
      setBottomOffset(Math.max(0, offset))
    }

    viewport.addEventListener("resize", handleViewportChange)
    viewport.addEventListener("scroll", handleViewportChange)
    handleViewportChange()

    return () => {
      viewport.removeEventListener("resize", handleViewportChange)
      viewport.removeEventListener("scroll", handleViewportChange)
    }
  }, [])

  // Prevent iOS from scrolling the page when keyboard opens
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      // Only prevent default if the target is not within a scrollable area
      const target = e.target as HTMLElement
      if (!target.closest('[data-scrollable]')) {
        // Don't prevent on the textarea itself
        if (target.tagName !== 'TEXTAREA') {
          e.preventDefault()
        }
      }
    }

    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    document.body.style.height = '100%'
    document.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
      document.body.style.height = ''
      document.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    }

    setIsBouncing(true)
    setMessages(prev => [...prev, userMessage])
    setInput("")
    
    setTimeout(() => setIsBouncing(false), 600)
    
    setIsLoading(true)

    try {
      const response = await fetch('/api/metacognition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentQuestion: question,
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage.content }
          ]
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let newQuestion = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          newQuestion += decoder.decode(value, { stream: true })
        }
      }

      if (newQuestion.trim()) {
        setQuestion(newQuestion.trim())
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      <SimpleHeader />

      {/* Full-screen fixed background */}
      <div className="fixed inset-0 bg-[#0f0f0f]" />

      {/* Question bar - centered in the space between header and input */}
      <div
        className="fixed left-0 right-0 z-10 px-4 md:px-8 flex items-center justify-center"
        style={{
          top: '96px',
          bottom: `${bottomOffset + 80}px`,
        }}
      >
        <motion.div
          key={question}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            y: isBouncing ? [0, -10, 0] : 0,
          }}
          transition={{
            scale: { type: "spring", stiffness: 200, damping: 20 },
            opacity: { duration: 0.3 },
            y: { duration: 0.6, ease: "easeInOut" },
          }}
          className="max-w-2xl w-full"
        >
          <div className="bg-black rounded-3xl px-6 py-5 md:px-8 md:py-6 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center p-2">
                  <Image
                    src="/v-logo-white.svg"
                    alt="V Logo"
                    width={24}
                    height={24}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={question}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-white text-base md:text-lg font-light leading-relaxed"
                  >
                    {question}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Input area - pinned to bottom, moves up with keyboard */}
      <div
        className="fixed left-0 right-0 z-20 px-4 py-3 md:px-8 md:py-4 bg-[#0f0f0f]"
        style={{
          bottom: `${bottomOffset}px`,
        }}
      >
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 md:p-5">
            <div className="flex items-end gap-2">
              <div className="flex-1 min-w-0">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your response..."
                  disabled={isLoading}
                  className="w-full bg-transparent text-white placeholder:text-white/30 text-sm md:text-base resize-none outline-none h-[44px] leading-tight py-2"
                  rows={1}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed transition-colors flex items-center justify-center border border-white/10"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-white/60 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 md:w-5 md:h-5 text-white/60" />
                )}
              </button>
            </div>

            <div className="mt-2 pt-2 border-t border-white/5 hidden md:block">
              <p className="text-white/30 text-xs">
                Press Enter to send • Shift + Enter for new line
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
