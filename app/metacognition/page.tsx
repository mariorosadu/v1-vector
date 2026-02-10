"use client"

import { useState, useEffect } from "react"
import { Copy, Check, Share2, Edit3, Plus, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type QuestionClass = "Decide" | "Debug" | "Design" | "Plan" | "Explain"

type Spec = {
  questionClass?: QuestionClass
  solved?: {
    value?: string
    unit?: string
    qualTag?: "simpler" | "faster" | "safer" | "clearer" | "prettier"
  }
  timebox?: {
    type?: "duration" | "date"
    value?: string
  }
  constraints?: {
    time?: string
    budget?: string
    risk?: string
    scope?: string
    tools?: string
  }
  baseline?: string
  options?: string[]
  reproSteps?: string[]
  nextAction?: string
}

type Message = {
  role: "user" | "assistant"
  content: string
}

type LLMResponse = {
  next_question: string
  why_one_line: string
  active_slot: string
  suggested_answers: { label: string; value: string }[]
  input_mode: "chips" | "short_text" | "long_text" | "number_unit" | "date" | "duration" | "list"
  spec_patch: Partial<Spec>
  compiled_question: string
  score: number
}

export default function MetaCognitionPage() {
  const [spec, setSpec] = useState<Spec>({})
  const [conversation, setConversation] = useState<Message[]>([])
  const [ui, setUi] = useState({ activeSlot: "", score: 0 })
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [whyOneLine, setWhyOneLine] = useState("")
  const [suggestedAnswers, setSuggestedAnswers] = useState<{ label: string; value: string }[]>([])
  const [inputMode, setInputMode] = useState<LLMResponse["input_mode"]>("chips")
  const [compiledQuestion, setCompiledQuestion] = useState("How can I...?")
  const [userInput, setUserInput] = useState("")
  const [listItems, setListItems] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showBottomSheet, setShowBottomSheet] = useState(true)

  // Initialize with first question
  useEffect(() => {
    loadNextQuestion()
  }, [])

  async function loadNextQuestion() {
    setIsLoading(true)
    try {
      const response = await fetch("/api/metacognition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec, conversation, ui }),
      })

      if (!response.ok) throw new Error("Failed to fetch")

      const data: LLMResponse = await response.json()
      
      setCurrentQuestion(data.next_question)
      setWhyOneLine(data.why_one_line)
      setSuggestedAnswers(data.suggested_answers)
      setInputMode(data.input_mode)
      setCompiledQuestion(data.compiled_question)
      setUi({ activeSlot: data.active_slot, score: data.score })
      
      // Add assistant message
      if (conversation.length > 0) {
        setConversation([...conversation, { role: "assistant", content: data.next_question }])
      }
    } catch (error) {
      console.error("Error loading question:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmitAnswer(answer: string) {
    if (!answer.trim()) return

    // Add user message to conversation
    const newConversation = [...conversation, { role: "user" as const, content: answer }]
    setConversation(newConversation)
    setUserInput("")
    setListItems([])
    setShowBottomSheet(false)

    setIsLoading(true)
    try {
      const response = await fetch("/api/metacognition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec, conversation: newConversation, ui }),
      })

      if (!response.ok) throw new Error("Failed to fetch")

      const data: LLMResponse = await response.json()
      
      // Update spec with patch
      setSpec({ ...spec, ...data.spec_patch })
      
      setCurrentQuestion(data.next_question)
      setWhyOneLine(data.why_one_line)
      setSuggestedAnswers(data.suggested_answers)
      setInputMode(data.input_mode)
      setCompiledQuestion(data.compiled_question)
      setUi({ activeSlot: data.active_slot, score: data.score })
      
      // Add assistant message
      setConversation([...newConversation, { role: "assistant", content: data.next_question }])
      setShowBottomSheet(true)
    } catch (error) {
      console.error("Error submitting answer:", error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(compiledQuestion)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: "My Question",
        text: compiledQuestion,
      })
    }
  }

  function handleAddListItem() {
    if (userInput.trim()) {
      setListItems([...listItems, userInput.trim()])
      setUserInput("")
    }
  }

  function handleSubmitList() {
    if (listItems.length > 0) {
      handleSubmitAnswer(listItems.join(", "))
    }
  }

  const score = ui.score || 0
  const maxScore = 25

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* TOP STICKY BAR */}
      <div className="sticky top-0 z-50 bg-[#0f0f0f] border-b border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-sm font-medium text-white/80">Optimizing</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">Score</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-mono text-white">{score}</span>
                <span className="text-xs text-white/40">/{maxScore}</span>
              </div>
            </div>
          </div>
          
          {/* North Star */}
          {spec.solved?.value && (
            <div 
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full mb-2 cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => setUi({ ...ui, activeSlot: "solved" })}
            >
              <span className="text-xs text-white/60">Solved =</span>
              <span className="text-xs text-white">{spec.solved.value}</span>
              {spec.solved.qualTag && (
                <span className="text-xs text-white/40">({spec.solved.qualTag})</span>
              )}
            </div>
          )}
          
          {/* Constraints */}
          <div className="flex flex-wrap gap-2">
            {spec.constraints?.time && (
              <div className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400">
                Time: {spec.constraints.time}
              </div>
            )}
            {spec.constraints?.budget && (
              <div className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-400">
                Budget: {spec.constraints.budget}
              </div>
            )}
            {spec.constraints?.risk && (
              <div className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
                Risk: {spec.constraints.risk}
              </div>
            )}
            {spec.constraints?.scope && (
              <div className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded text-xs text-purple-400">
                Scope: {spec.constraints.scope}
              </div>
            )}
            {spec.constraints?.tools && (
              <div className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-400">
                Tools: {spec.constraints.tools}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MIDDLE CARD */}
      <div className="flex-1 overflow-y-auto pb-80">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm text-white/40 uppercase tracking-wider">Next Question</h2>
              {ui.activeSlot && (
                <span className="text-xs px-2 py-0.5 bg-white/5 border border-white/10 rounded text-white/40">
                  {ui.activeSlot}
                </span>
              )}
            </div>
            
            <p className="text-2xl md:text-3xl font-light text-white mb-3 leading-relaxed">
              {currentQuestion || "Starting..."}
            </p>
            
            {whyOneLine && (
              <p className="text-sm text-white/40 italic mb-6">{whyOneLine}</p>
            )}

            {/* Compiled Question Draft */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3">
                Compiled Question Draft
              </h3>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
                <p className="text-base text-white/90 leading-relaxed">{compiledQuestion}</p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-sm transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy draft"}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-sm transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={() => handleSubmitAnswer("refine wording")}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-sm transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Refine wording
                </button>
              </div>
            </div>
          </motion.div>

          {/* Conversation History */}
          {conversation.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm text-white/40 uppercase tracking-wider">History</h3>
              {conversation.map((msg, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg ${
                    msg.role === "user"
                      ? "bg-white/5 border border-white/10 ml-8"
                      : "bg-white/[0.02] border border-white/5 mr-8"
                  }`}
                >
                  <p className="text-xs text-white/40 mb-1 uppercase">{msg.role}</p>
                  <p className="text-sm text-white/80">{msg.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM SHEET */}
      <AnimatePresence>
        {showBottomSheet && !isLoading && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-white/10 backdrop-blur-sm"
          >
            <div className="container mx-auto px-4 py-6 max-w-2xl">
              {/* Chips */}
              {inputMode === "chips" && suggestedAnswers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {suggestedAnswers.map((answer, i) => (
                    <button
                      key={i}
                      onClick={() => handleSubmitAnswer(answer.value)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-full text-sm transition-colors"
                    >
                      {answer.label}
                    </button>
                  ))}
                </div>
              )}

              {/* List input */}
              {inputMode === "list" && (
                <div className="mb-4">
                  {listItems.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {listItems.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-sm"
                        >
                          <span>{item}</span>
                          <button
                            onClick={() => setListItems(listItems.filter((_, idx) => idx !== i))}
                            className="hover:text-red-400 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddListItem()}
                      placeholder="Add item..."
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/20"
                    />
                    <button
                      onClick={handleAddListItem}
                      className="px-4 py-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  {listItems.length > 0 && (
                    <button
                      onClick={handleSubmitList}
                      className="w-full mt-3 px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors"
                    >
                      Submit list
                    </button>
                  )}
                </div>
              )}

              {/* Short text / long text / other modes */}
              {(inputMode === "short_text" || inputMode === "long_text" || inputMode === "number_unit" || inputMode === "duration") && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer(userInput)}
                    placeholder="Type your answer..."
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/20"
                  />
                  <button
                    onClick={() => handleSubmitAnswer(userInput)}
                    disabled={!userInput.trim()}
                    className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit
                  </button>
                </div>
              )}

              {/* Other input button */}
              {inputMode === "chips" && (
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer(userInput)}
                    placeholder="Other..."
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/20"
                  />
                  <button
                    onClick={() => handleSubmitAnswer(userInput)}
                    disabled={!userInput.trim()}
                    className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    Submit
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-sm text-white">Thinking...</span>
          </div>
        </div>
      )}
    </div>
  )
}
