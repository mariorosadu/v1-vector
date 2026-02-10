"use client"

// INTERNAL PHASE IDENTIFIER: CB1 (Context Building Phase 1)
// This component handles the collection of user context through voice-based Q&A

import { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, CheckCircle2, Loader2, Chrome } from "lucide-react"

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

type SpeechRecognitionInstance = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: ((event: Event & { error: string }) => void) | null
}

interface KeywordNode {
  keyword: string
  description: string
}

interface Connection {
  source: string
  target: string
}

interface VoiceQuestionFlowProps {
  onComplete: (data: { nodes: KeywordNode[]; connections: Connection[] }) => void
}

// CB1: Discovery Questions - Core context collection prompts
const questions = [
  "What problem are you trying to solve?",
  "Who is affected by this problem?",
  "What are the main challenges or obstacles?",
]

export function VoiceQuestionFlow({ onComplete }: VoiceQuestionFlowProps) {
  // CB1: Context Building Phase - User voice input for problem discovery
  const [currentStep, setCurrentStep] = useState<"start" | "questions" | "review" | "editing" | "saving" | "thankyou">("start")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [editingAnswers, setEditingAnswers] = useState<string[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState("")
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const transcriptRef = useRef("")
  const currentQuestionIndexRef = useRef(0)
  const answersRef = useRef<string[]>([])
  const isProcessingRef = useRef(false)

  // Detect if user is on a mobile device
  const isMobileRef = useRef(false)
  // Track whether we should auto-restart recognition on end
  const shouldRestartRef = useRef(false)

  useEffect(() => {
    isMobileRef.current = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  }, [])

  const getSpeechRecognition = useCallback((): SpeechRecognitionInstance | null => {
    if (typeof window === "undefined") return null
    const SpeechRecognition =
      (window as unknown as Record<string, unknown>).SpeechRecognition ??
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition
    if (!SpeechRecognition) return null
    return new (SpeechRecognition as new () => SpeechRecognitionInstance)()
  }, [])

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false
    recognitionRef.current?.stop()
    setIsListening(false)
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
  }, [])

  const handleAnswerComplete = useCallback((answer: string) => {
    // Prevent double processing
    if (isProcessingRef.current) return
    
    const trimmedAnswer = answer.trim()
    if (!trimmedAnswer) return

    isProcessingRef.current = true
    shouldRestartRef.current = false
    const newAnswers = [...answersRef.current, trimmedAnswer]
    answersRef.current = newAnswers
    setAnswers(newAnswers)
    setCurrentTranscript("")
    transcriptRef.current = ""
    stopListening()

    if (currentQuestionIndexRef.current < questions.length - 1) {
      setTimeout(() => {
        const nextIndex = currentQuestionIndexRef.current + 1
        currentQuestionIndexRef.current = nextIndex
        setCurrentQuestionIndex(nextIndex)
        
        setTimeout(() => {
          isProcessingRef.current = false
          startListening()
        }, 600)
      }, 1000)
    } else {
      setTimeout(() => {
        setCurrentStep("review")
        setEditingAnswers([...newAnswers])
      }, 1000)
    }
  }, [stopListening])

  const startListening = useCallback(() => {
    // Abort any existing instance first
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch {}
      recognitionRef.current = null
    }

    const recognition = getSpeechRecognition()
    if (!recognition) {
      alert("Speech recognition is not supported in this browser. Please try Chrome or Edge.")
      return
    }

    // On mobile, use non-continuous mode to avoid stuttering.
    // We auto-restart on end to simulate continuous listening.
    const isMobile = isMobileRef.current
    recognition.continuous = !isMobile
    recognition.interimResults = true
    recognition.lang = "en-US"
    shouldRestartRef.current = true

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      // Show interim results for live feedback
      if (interimTranscript) {
        const displayTranscript = transcriptRef.current + " " + interimTranscript
        setCurrentTranscript(displayTranscript.trim())
      }

      // When we get final results, accumulate and reset silence timer
      if (finalTranscript) {
        const newTranscript = (transcriptRef.current + " " + finalTranscript).trim()
        transcriptRef.current = newTranscript
        setCurrentTranscript(newTranscript)

        // Reset silence timer - longer timeout on mobile (3s) vs desktop (2s) for slower speech
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current)
        }
        const silenceTimeout = isMobile ? 3000 : 2000
        silenceTimerRef.current = setTimeout(() => {
          handleAnswerComplete(transcriptRef.current)
        }, silenceTimeout)
      }
    }

    recognition.onend = () => {
      // On mobile, the browser frequently auto-stops recognition sessions.
      // If we should still be listening (user hasn't finished), restart it.
      if (shouldRestartRef.current && !isProcessingRef.current) {
        try {
          const newRecognition = getSpeechRecognition()
          if (newRecognition) {
            newRecognition.continuous = !isMobile
            newRecognition.interimResults = true
            newRecognition.lang = "en-US"
            newRecognition.onstart = recognition.onstart
            newRecognition.onresult = recognition.onresult
            newRecognition.onend = recognition.onend
            newRecognition.onerror = recognition.onerror
            recognitionRef.current = newRecognition
            // Small delay before restarting to avoid rapid restart loops
            setTimeout(() => {
              if (shouldRestartRef.current && !isProcessingRef.current) {
                try { newRecognition.start() } catch {}
              }
            }, 150)
            return
          }
        } catch {}
      }
      setIsListening(false)
      recognitionRef.current = null
    }

    recognition.onerror = (event: Event & { error: string }) => {
      // "no-speech" and "aborted" are normal on mobile, not real errors
      if (event.error === "no-speech" || event.error === "aborted") {
        return
      }
      console.error("Speech recognition error:", event.error)
      shouldRestartRef.current = false
      setIsListening(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
    } catch {
      // If start fails (e.g. mic busy), retry after a short delay
      setTimeout(() => {
        if (shouldRestartRef.current) {
          try { recognition.start() } catch {}
        }
      }, 300)
    }
  }, [getSpeechRecognition, handleAnswerComplete])

  const handleConfirm = async () => {
    setCurrentStep("saving")
    
    try {
      // Save answers to Supabase database
      const saveResponse = await fetch("/api/save-answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers: editingAnswers, questions }),
      })

      if (!saveResponse.ok) {
        console.error("Failed to save answers to database")
      }

      // Show thank you message
      setTimeout(() => {
        setCurrentStep("thankyou")
      }, 1500)
    } catch (error) {
      console.error("[v0] Error saving answers:", error)
      setTimeout(() => {
        setCurrentStep("thankyou")
      }, 1500)
    }
  }

  const handleEditAnswer = (index: number) => {
    setEditingIndex(index)
    setCurrentStep("editing")
  }

  const handleSaveEdit = (newAnswer: string) => {
    if (editingIndex !== null && newAnswer.trim()) {
      const updated = [...editingAnswers]
      updated[editingIndex] = newAnswer.trim()
      setEditingAnswers(updated)
      setAnswers(updated)
      answersRef.current = updated
    }
    setEditingIndex(null)
    setCurrentStep("review")
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setCurrentStep("review")
  }

  const handleStart = () => {
    setCurrentStep("questions")
    currentQuestionIndexRef.current = 0
    answersRef.current = []
    isProcessingRef.current = false
    setTimeout(() => {
      startListening()
    }, 500)
  }

  const handleCancel = () => {
    shouldRestartRef.current = false
    stopListening()
    setCurrentStep("start")
    setCurrentQuestionIndex(0)
    setAnswers([])
    setCurrentTranscript("")
    currentQuestionIndexRef.current = 0
    answersRef.current = []
    transcriptRef.current = ""
    isProcessingRef.current = false
  }

  // Keep refs in sync with state
  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex
  }, [currentQuestionIndex])

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  useEffect(() => {
    return () => {
      shouldRestartRef.current = false
      recognitionRef.current?.abort()
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <AnimatePresence mode="wait">
        {currentStep === "start" && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-20"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.375 }}
              className="mb-8"
            >
              <div className="w-24 h-24 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Mic className="w-12 h-12 text-white/60" />
              </div>
              
              {/* Chrome Browser Notice */}
              <div className="flex items-center justify-center gap-2 mt-6 px-4 py-3 bg-white/5 border border-white/10 rounded-lg max-w-md mx-auto">
                <Chrome className="w-5 h-5 text-white/60 flex-shrink-0" />
                <p className="text-white/60 text-sm">
                  Works best on Google Chrome
                </p>
              </div>
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-light text-white mb-4 text-balance">
              Map Your Problem Surface
            </h2>
            <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto text-pretty">
              Answer three questions using your voice to help us understand your problem and generate a personalized map.
            </p>

            <button
              onClick={handleStart}
              className="px-8 py-4 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              Begin Mapping
            </button>
          </motion.div>
        )}

        {currentStep === "questions" && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="py-12"
          >
            {/* Progress Indicator */}
            <div className="flex justify-center gap-2 mb-12">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 rounded-full transition-all duration-[375ms] ${
                    index < currentQuestionIndex
                      ? "w-12 bg-white"
                      : index === currentQuestionIndex
                      ? "w-16 bg-white"
                      : "w-12 bg-white/20"
                  }`}
                />
              ))}
            </div>

            {/* Question */}
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
              }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="text-center mb-12"
            >
              <motion.div 
                className="text-white/40 text-sm mb-4 uppercase tracking-wider"
                animate={isListening ? { opacity: [0.4, 0.7, 0.4] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Question {currentQuestionIndex + 1} of {questions.length}
              </motion.div>
              <motion.div
                animate={isListening ? { 
                  boxShadow: [
                    "0 0 0px rgba(220, 38, 38, 0)",
                    "0 0 30px rgba(220, 38, 38, 0.3)",
                    "0 0 0px rgba(220, 38, 38, 0)"
                  ]
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-block px-8 py-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <h3 className="text-2xl md:text-4xl font-light text-white text-balance leading-relaxed">
                  {questions[currentQuestionIndex]}
                </h3>
                {isListening && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.375 }}
                    className="text-red-400/80 text-sm mt-4 font-medium"
                  >
                    Recording your response...
                  </motion.p>
                )}
              </motion.div>

              {/* Listening Indicator - Full Width Red Line */}
              <div className="flex flex-col items-center justify-center min-h-[180px] w-full relative">
                {isListening && (
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.375 }}
                    className="absolute left-0 right-0 top-0 mb-8"
                  >
                    <motion.div
                      className="h-0.5 bg-red-600 w-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.div>
                )}

                {/* Transcript Display */}
                {currentTranscript && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-6 py-4 bg-white/5 border border-white/10 rounded-lg max-w-2xl mb-6"
                  >
                    <p className="text-white/80 text-lg text-pretty">{currentTranscript}</p>
                  </motion.div>
                )}

                {!currentTranscript && isListening && (
                  <p className="text-white/40 text-sm mb-6">Listening... Start speaking</p>
                )}

                {/* Cancel Button */}
                {isListening && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleCancel}
                    className="px-6 py-2 bg-white/10 border border-white/20 text-white/70 rounded-lg hover:bg-white/15 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    Cancel
                  </motion.button>
                )}
              </div>
            </motion.div>

            {/* Previous Answers */}
            {answers.length > 0 && (
              <div className="mt-12 space-y-3">
                {answers.map((answer, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.075 }}
                    className="flex items-start gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-lg"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-white/40 text-xs mb-1">Q{index + 1}</div>
                      <p className="text-white/70 text-sm">{answer}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {currentStep === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="py-12 max-w-3xl mx-auto"
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.45 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-600/20 flex items-center justify-center"
              >
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </motion.div>
              <h3 className="text-3xl md:text-4xl font-light text-white mb-4">
                Review Your Answers
              </h3>
              <p className="text-white/60 text-lg">
                Please review your responses below. You can edit any answer before confirming.
              </p>
            </div>

            {/* Answers Review */}
            <div className="space-y-6 mb-12">
              {editingAnswers.map((answer, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-white/5 border border-white/10 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="text-white/40 text-sm font-medium">
                      Question {index + 1}
                    </div>
                    <button
                      onClick={() => handleEditAnswer(index)}
                      className="px-3 py-1 text-xs bg-white/10 hover:bg-white/15 border border-white/20 text-white/70 hover:text-white rounded transition-all"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-white/60 text-sm mb-3">{questions[index]}</p>
                  <p className="text-white text-base">{answer}</p>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleCancel}
                className="px-8 py-4 bg-white/5 border border-white/10 text-white/70 rounded-lg hover:bg-white/10 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                Start Over
              </button>
              <button
                onClick={handleConfirm}
                className="px-8 py-4 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                Confirm & Submit
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === "editing" && editingIndex !== null && (
          <motion.div
            key="editing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="py-12 max-w-3xl mx-auto"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-light text-white mb-2">
                Edit Your Answer
              </h3>
              <p className="text-white/60">Question {editingIndex + 1}</p>
            </div>

            <div className="mb-8">
              <p className="text-white/70 text-lg mb-6 text-center">{questions[editingIndex]}</p>
              <textarea
                defaultValue={editingAnswers[editingIndex]}
                className="w-full h-40 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
                placeholder="Type your answer here..."
                id="edit-textarea"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleCancelEdit}
                className="px-8 py-3 bg-white/5 border border-white/10 text-white/70 rounded-lg hover:bg-white/10 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const textarea = document.getElementById("edit-textarea") as HTMLTextAreaElement
                  if (textarea) handleSaveEdit(textarea.value)
                }}
                className="px-8 py-3 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === "saving" && (
          <motion.div
            key="saving"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mx-auto mb-8"
            >
              <Loader2 className="w-full h-full text-white/60" />
            </motion.div>
            <h3 className="text-2xl md:text-3xl font-light text-white mb-4">
              Saving Your Answers
            </h3>
            <p className="text-white/60 text-lg">
              Please wait while we save your responses...
            </p>
          </motion.div>
        )}

        {currentStep === "thankyou" && (
          <motion.div
            key="thankyou"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative py-20 overflow-hidden"
          >
            {/* Blurred report background image */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="relative w-full max-w-3xl scale-95">
                <img
                  src="/images/report-preview.png"
                  alt=""
                  className="w-full opacity-30 rounded-lg border border-white/20"
                  style={{ filter: 'blur(2px)' }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/50 to-[#0f0f0f]" />
            </motion.div>

            {/* Content */}
            <div className="relative z-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.45 }}
                className="w-24 h-24 mx-auto mb-8 rounded-full bg-green-600/20 flex items-center justify-center"
              >
                <CheckCircle2 className="w-16 h-16 text-green-400" />
              </motion.div>
              <h3 className="text-3xl md:text-4xl font-light text-white mb-4">
                Thank You!
              </h3>
              <p className="text-white/60 text-lg mb-4 max-w-xl mx-auto leading-relaxed">
                Your responses have been saved successfully. We appreciate you taking the time to map your problem surface.
              </p>
              <p className="text-white/40 text-base mb-10 max-w-lg mx-auto leading-relaxed">
                Your personalised Vector Alignment Report will appear here once the prototype is fully operational. Stay tuned.
              </p>
              <button
                onClick={handleCancel}
                className="px-8 py-4 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                Start New Session
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
