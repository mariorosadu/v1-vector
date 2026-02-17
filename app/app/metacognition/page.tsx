"use client"

import { useState, useRef, useEffect } from "react"
import { SimpleHeader } from "@/components/simple-header"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Loader2, LogOut } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

type Stage = 'objective' | 'qualitative' | 'quantitative' | 'complete'

interface ProgressState {
  objectiveProgress: number
  qualitativeProgress: number
  quantitativeProgress: number
  currentStage: Stage
  objectiveClarity: number
}

export default function ProtectedMetacognitionPage() {
  const router = useRouter()
  const [userName, setUserName] = useState<string | null>(null)
  const [question, setQuestion] = useState("Which objective do you want to achieve?")
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isBouncing, setIsBouncing] = useState(false)
  const [viewportTop, setViewportTop] = useState(0)
  const [progress, setProgress] = useState<ProgressState>({
    objectiveProgress: 0,
    qualitativeProgress: 0,
    quantitativeProgress: 0,
    currentStage: 'objective',
    objectiveClarity: 0
  })
  const [queuedInput, setQueuedInput] = useState<string>("")
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const inputBarRef = useRef<HTMLDivElement>(null)

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

  // iOS Safari fix
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const update = () => {
      setViewportTop(vv.offsetTop + vv.height)
    }

    vv.addEventListener("resize", update)
    vv.addEventListener("scroll", update)
    update()

    return () => {
      vv.removeEventListener("resize", update)
      vv.removeEventListener("scroll", update)
    }
  }, [])

  // Auto-focus input on mount and maintain focus
  useEffect(() => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus()
    }
  }, [isLoading])

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
          ],
          progress: progress,
          sessionId: sessionId
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      
      if (data.question) {
        let cleanQuestion = data.question.trim()
        cleanQuestion = cleanQuestion.replace(/```json|```/g, '').trim()
        if (cleanQuestion.startsWith('{') && cleanQuestion.includes('"question"')) {
          try {
            const parsed = JSON.parse(cleanQuestion)
            cleanQuestion = parsed.question || cleanQuestion
          } catch {
            const questionMatch = cleanQuestion.match(/"question":\s*"([^"]+)"/)
            if (questionMatch) {
              cleanQuestion = questionMatch[1]
            }
          }
        }
        setQuestion(cleanQuestion)
      }
      
      if (data.progress) {
        setProgress(data.progress)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }

  // Process queued input when loading completes
  useEffect(() => {
    if (!isLoading && queuedInput.trim()) {
      setInput(queuedInput)
      setQueuedInput("")
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isLoading, queuedInput])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (isLoading) {
        setQueuedInput(input)
        setInput("")
      } else {
        handleSend()
      }
    }
  }

  if (!userName) {
    return (
      <div className="bg-[#0f0f0f] h-dvh w-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-[#0f0f0f] h-dvh w-full overflow-hidden">
      {/* Custom header with sign out */}
      <nav className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4 md:px-8">
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

      {/* Question bar with integrated status bar - vertically centered */}
      <div className="fixed inset-0 flex items-center justify-center z-10 px-4 md:px-8 pointer-events-none">
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
          className="max-w-2xl w-full pointer-events-auto"
        >
          <div className="bg-black rounded-3xl px-6 py-5 md:px-8 md:py-6 border border-white/10">
            {/* Completion state */}
            {progress.objectiveProgress === 100 && 
             progress.qualitativeProgress === 100 && 
             progress.quantitativeProgress === 100 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 md:w-10 md:h-10 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-light text-white mb-3 text-balance">
                  Analysis Complete
                </h2>
                <p className="text-white/60 text-sm md:text-base max-w-md mx-auto text-pretty">
                  Thank you for completing the metacognitive journey. Your insights have been captured and will guide your next steps.
                </p>
              </motion.div>
            ) : (
              <>
                {/* Question Content */}
                <div className="flex items-center gap-4 mb-6">
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

                {/* Divider */}
                <div className="h-px bg-white/10 mb-5" />

                {/* Dynamic Status Bar */}
                <AnimatePresence mode="wait">
                  {progress.objectiveProgress < 100 ? (
                    <motion.div
                      key="objective"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/50 text-[11px] font-medium tracking-wider uppercase">
                          Objective Definition
                        </span>
                        <span className="text-white/30 text-[11px] font-mono">
                          {Math.round(progress.objectiveProgress)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress.objectiveProgress}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="analysis"
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/50 text-[11px] font-medium tracking-wider uppercase">
                          Qualitative & Quantitative Analysis
                        </span>
                        <span className="text-white/30 text-[11px] font-mono">
                          {Math.round((progress.qualitativeProgress + progress.quantitativeProgress) / 2)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                        <div className="flex h-full">
                          <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress.qualitativeProgress / 2}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                          />
                          <motion.div
                            className="h-full bg-gradient-to-r from-pink-500 to-orange-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress.quantitativeProgress / 2}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/20 text-[10px] font-mono">
                          Qualitative: {Math.round(progress.qualitativeProgress)}%
                        </span>
                        <span className="text-white/20 text-[10px] font-mono">
                          Quantitative: {Math.round(progress.quantitativeProgress)}%
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Input area */}
      {!(progress.objectiveProgress === 100 && 
         progress.qualitativeProgress === 100 && 
         progress.quantitativeProgress === 100) && (
        <div
          ref={inputBarRef}
          className="fixed left-0 right-0 z-20 px-4 py-3 md:px-8 md:py-4 bg-[#0f0f0f]"
          style={{
            top: `${viewportTop}px`,
            transform: 'translateY(-100%)',
          }}
        >
          <div className="max-w-2xl mx-auto w-full">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 md:p-5">
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <input
                    ref={inputRef as unknown as React.RefObject<HTMLInputElement>}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isLoading ? "Processing... (your next input will be queued)" : "Type your response..."}
                    disabled={false}
                    enterKeyHint="send"
                    className="w-full bg-transparent text-white placeholder:text-white/30 text-sm md:text-base outline-none h-[44px]"
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
                  Press Enter to send
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
