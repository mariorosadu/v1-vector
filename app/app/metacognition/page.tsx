"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Loader2, LogOut } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ProtectedMetacognitionPage() {
  const router = useRouter()
  const [userName, setUserName] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string>('')

  // Question flow state
  const [currentQuestion, setCurrentQuestion] = useState("What objective would you like to achieve?")
  const [questionNumber, setQuestionNumber] = useState(1)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  // Generate session ID on mount
  useEffect(() => {
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`)
  }, [])

  // Check auth and get user info
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace('/box/metacognition')
      } else {
        setUserName(user.user_metadata?.full_name || user.email || 'User')
      }
    })
  }, [router])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/box/metacognition')
  }

  // Auto-focus input
  useEffect(() => {
    if (inputRef.current && !isLoading && !isComplete) {
      inputRef.current.focus()
    }
  }, [isLoading, isComplete])

  // Handle user input
  const handleSend = async () => {
    if (!input.trim() || isLoading || isComplete) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMessage]

    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    // Log to database immediately
    if (sessionId && currentQuestion) {
      try {
        const supabase = createClient()
        await supabase.from('metacognition_dialogues').insert({
          session_id: sessionId,
          question: currentQuestion,
          answer: userMessage.content,
          stage: 'objective mapping',
          question_index: questionNumber,
          objective_progress: 0,
          qualitative_progress: 0,
          quantitative_progress: 0,
        })
      } catch (dbError) {
        console.error('[v0] Error logging to database:', dbError)
      }
    }

    // Check if this was the 7th answer
    if (questionNumber >= 7) {
      setIsComplete(true)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/metacognition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          sessionId,
          currentQuestion,
          questionNumber,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')
      const data = await response.json()

      if (data.question) {
        setCurrentQuestion(data.question.trim())
        setQuestionNumber(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error in question flow:', error)
    } finally {
      setIsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  if (!userName) {
    return (
      <div className="bg-[#0a0a0a] h-dvh w-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
      </div>
    )
  }

  const progressPercentage = (questionNumber / 7) * 100

  return (
    <div className="bg-[#0a0a0a] h-dvh w-full flex flex-col overflow-hidden">
      {/* Header with sign out */}
      <nav className="flex-shrink-0 flex items-center justify-between px-6 py-4 md:px-8 z-30 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Image
            src="/v-logo-white.svg"
            alt="V Logo"
            width={24}
            height={24}
            className="opacity-70"
          />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/50 text-sm hidden sm:block">{userName}</span>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </nav>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 py-6">
        <div className="max-w-2xl w-full flex flex-col gap-4">

          {/* Progress Bar */}
          {!isComplete && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-2"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/40 text-xs font-medium tracking-wider uppercase">
                  Objective Mapping
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          )}

          {/* Question Box or Completion Message */}
          {!isComplete ? (
            <motion.div
              key={currentQuestion}
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                scale: { type: "spring", stiffness: 200, damping: 20 },
                opacity: { duration: 0.3 },
              }}
            >
              <div className="bg-black rounded-2xl px-5 py-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Image
                      src="/v-logo-white.svg"
                      alt="V Logo"
                      width={16}
                      height={16}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentQuestion}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-white text-sm md:text-base font-light leading-relaxed"
                    >
                      {currentQuestion}
                    </motion.p>
                  </AnimatePresence>
                </div>
                {isLoading && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-px flex-1 bg-white/5" />
                    <Loader2 className="w-3 h-3 text-white/30 animate-spin" />
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-green-500"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-white text-xl md:text-2xl font-light mb-2">
                  Flow Completed
                </h2>
                <p className="text-white/60 text-sm md:text-base">
                  Thank you for mapping your objective. We will get back to you soon.
                </p>
              </div>
            </motion.div>
          )}

          {/* Input Bar */}
          {!isComplete && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 md:p-4">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isLoading ? "Thinking..." : "Type your response..."}
                  enterKeyHint="send"
                  disabled={isLoading}
                  className="flex-1 min-w-0 bg-transparent text-white placeholder:text-white/30 text-sm md:text-base outline-none h-[44px] disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed transition-colors flex items-center justify-center border border-white/10"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 text-white/60 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-white/60" />
                  )}
                </button>
              </div>
              <div className="mt-2 pt-2 border-t border-white/5 hidden md:block">
                <p className="text-white/30 text-xs">Press Enter to send</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
