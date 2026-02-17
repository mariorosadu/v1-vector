"use client"

import { useState, useRef, useEffect } from "react"
import { SimpleHeader } from "@/components/simple-header"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Loader2, ArrowUp } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useChat } from "@ai-sdk/react"

interface ClarifyMessage {
  role: 'user' | 'assistant'
  content: string
}

export default function MetacognitionPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // Clarification state
  const [clarifyingQuestion, setClarifyingQuestion] = useState("Which objective do you want to achieve?")
  const [craftedPrompt, setCraftedPrompt] = useState("")
  const [clarifyMessages, setClarifyMessages] = useState<ClarifyMessage[]>([])
  const [input, setInput] = useState("")
  const [isClarifying, setIsClarifying] = useState(false)
  const [isBouncing, setIsBouncing] = useState(false)

  // Chat state (after "Send" on crafted prompt)
  const {
    messages: chatMessages,
    append: appendChat,
    isLoading: isChatLoading,
  } = useChat({
    api: '/api/chat',
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Check if user is already authenticated and redirect
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.replace('/app/metacognition')
      } else {
        setIsAuthenticated(false)
      }
    })
  }, [router])

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/app/metacognition`,
      },
    })
    if (error) {
      console.error('Google login error:', error.message)
      setIsGoogleLoading(false)
    }
  }

  // Auto-focus input
  useEffect(() => {
    if (inputRef.current && !isClarifying && isAuthenticated === false) {
      inputRef.current.focus()
    }
  }, [isClarifying, isAuthenticated])

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Handle user input -> send to clarification API
  const handleSend = async () => {
    if (!input.trim() || isClarifying) return

    const userMessage: ClarifyMessage = { role: 'user', content: input.trim() }
    const newMessages = [...clarifyMessages, userMessage]

    setIsBouncing(true)
    setClarifyMessages(newMessages)
    setInput("")
    setTimeout(() => setIsBouncing(false), 600)

    setIsClarifying(true)
    try {
      const response = await fetch('/api/metacognition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          craftedPrompt,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')
      const data = await response.json()

      if (data.question) {
        setClarifyingQuestion(data.question.trim())
      }
      if (data.craftedPrompt) {
        setCraftedPrompt(data.craftedPrompt.trim())
      }
    } catch (error) {
      console.error('Error in clarification:', error)
    } finally {
      setIsClarifying(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  // Handle "Send" on crafted prompt -> send to chat API
  const handleSendCraftedPrompt = async () => {
    if (!craftedPrompt.trim() || isChatLoading) return

    console.log('[v0] Sending crafted prompt to chat:', craftedPrompt)

    // appendChat expects just the message content
    await appendChat({
      role: 'user',
      content: craftedPrompt,
    })

    console.log('[v0] Crafted prompt sent successfully')

    // Reset clarification state for a new cycle
    setCraftedPrompt("")
    setClarifyMessages([])
    setClarifyingQuestion("What else would you like to explore?")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="h-dvh w-full flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-[#0a0a0a] h-dvh w-full flex flex-col overflow-hidden">
      <SimpleHeader />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden pt-16">
        {/* Chat area - scrollable, takes all available space at top */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          <div className="max-w-2xl mx-auto">
            {chatMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[200px] opacity-30">
                <p className="text-white/40 text-sm text-center">
                  Clarify your intent below, then send the crafted prompt.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mt-1">
                        <Image
                          src="/v-logo-white.svg"
                          alt="V"
                          width={16}
                          height={16}
                          className="opacity-70"
                        />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-white/10 text-white/90'
                          : 'bg-white/[0.04] text-white/80 border border-white/5'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mt-1">
                      <Image
                        src="/v-logo-white.svg"
                        alt="V"
                        width={16}
                        height={16}
                        className="opacity-70"
                      />
                    </div>
                    <div className="bg-white/[0.04] border border-white/5 rounded-2xl px-4 py-3">
                      <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Bottom section - pinned boxes */}
        <div className="flex-shrink-0 px-4 md:px-8 pb-4 pt-2">
          <div className="max-w-2xl mx-auto flex flex-col gap-3">

            {/* Grey Box - Crafted Prompt */}
            <AnimatePresence>
              {craftedPrompt && (
                <motion.div
                  initial={{ opacity: 0, y: 20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: 20, height: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="bg-white/[0.06] border border-white/10 rounded-2xl px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-white/30 text-[10px] font-medium tracking-wider uppercase mb-2">
                          Crafted Prompt
                        </p>
                        <p className="text-white/80 text-sm leading-relaxed">
                          {craftedPrompt}
                        </p>
                      </div>
                      <button
                        onClick={handleSendCraftedPrompt}
                        disabled={isChatLoading}
                        className="flex-shrink-0 flex items-center gap-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed border border-white/15 hover:border-white/25 rounded-xl px-4 py-2.5 transition-all duration-200"
                        aria-label="Send crafted prompt"
                      >
                        {isChatLoading ? (
                          <Loader2 className="w-4 h-4 text-white/60 animate-spin" />
                        ) : (
                          <>
                            <span className="text-white/70 text-xs font-medium">Send</span>
                            <ArrowUp className="w-3.5 h-3.5 text-white/60" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Black Box - Clarifying Question */}
            <motion.div
              key={clarifyingQuestion}
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: isBouncing ? [0, -6, 0] : 0,
              }}
              transition={{
                scale: { type: "spring", stiffness: 200, damping: 20 },
                opacity: { duration: 0.3 },
                y: { duration: 0.5, ease: "easeInOut" },
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
                      key={clarifyingQuestion}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-white text-sm md:text-base font-light leading-relaxed"
                    >
                      {clarifyingQuestion}
                    </motion.p>
                  </AnimatePresence>
                </div>
                {isClarifying && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-px flex-1 bg-white/5" />
                    <Loader2 className="w-3 h-3 text-white/30 animate-spin" />
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                )}
              </div>

              {/* Continue with Google button */}
              {isAuthenticated === false && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="mt-3"
                >
                  <button
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading}
                    className="w-full flex items-center justify-center gap-3 bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 rounded-2xl px-6 py-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="w-5 h-5 text-white/70 animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    )}
                    <span className="text-white/80 text-sm font-medium">
                      {isGoogleLoading ? 'Redirecting...' : 'Continue with Google'}
                    </span>
                  </button>
                </motion.div>
              )}
            </motion.div>

            {/* Input Bar - hidden when not authenticated */}
            {isAuthenticated !== false && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 md:p-4">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isClarifying ? "Thinking..." : "Type your response..."}
                    enterKeyHint="send"
                    className="flex-1 min-w-0 bg-transparent text-white placeholder:text-white/30 text-sm md:text-base outline-none h-[44px]"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isClarifying}
                    className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed transition-colors flex items-center justify-center border border-white/10"
                  >
                    {isClarifying ? (
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
    </div>
  )
}
