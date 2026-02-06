"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, CheckCircle2, Loader2 } from "lucide-react"

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

const questions = [
  "What problem are you trying to solve?",
  "Who is affected by this problem?",
  "What are the main challenges or obstacles?",
]

export function VoiceQuestionFlow({ onComplete }: VoiceQuestionFlowProps) {
  const [currentStep, setCurrentStep] = useState<"start" | "questions" | "analyzing" | "complete">("start")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [isListening, setIsListening] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState("")
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const transcriptRef = useRef("")
  const currentQuestionIndexRef = useRef(0)
  const answersRef = useRef<string[]>([])
  const isProcessingRef = useRef(false)

  const getSpeechRecognition = useCallback((): SpeechRecognitionInstance | null => {
    if (typeof window === "undefined") return null
    const SpeechRecognition =
      (window as unknown as Record<string, unknown>).SpeechRecognition ??
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition
    if (!SpeechRecognition) return null
    return new (SpeechRecognition as new () => SpeechRecognitionInstance)()
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
  }, [])

  const handleAnswerComplete = useCallback((answer: string) => {
    console.log("[v0] Answer complete:", answer)
    
    // Prevent double processing
    if (isProcessingRef.current) {
      console.log("[v0] Already processing, skipping")
      return
    }
    
    const trimmedAnswer = answer.trim()
    if (!trimmedAnswer) return

    isProcessingRef.current = true
    const newAnswers = [...answersRef.current, trimmedAnswer]
    answersRef.current = newAnswers
    setAnswers(newAnswers)
    setCurrentTranscript("")
    transcriptRef.current = ""
    stopListening()

    console.log("[v0] Current question index:", currentQuestionIndexRef.current, "Total questions:", questions.length)
    console.log("[v0] Current answers:", newAnswers)

    if (currentQuestionIndexRef.current < questions.length - 1) {
      // Move to next question after a brief pause
      console.log("[v0] Moving to next question")
      setTimeout(() => {
        const nextIndex = currentQuestionIndexRef.current + 1
        currentQuestionIndexRef.current = nextIndex
        setCurrentQuestionIndex(nextIndex)
        console.log("[v0] Set question index to:", nextIndex)
        
        setTimeout(() => {
          isProcessingRef.current = false
          startListening()
        }, 500)
      }, 1000)
    } else {
      // All questions answered, analyze responses
      console.log("[v0] All questions answered, analyzing")
      setTimeout(() => {
        setCurrentStep("analyzing")
        analyzeAnswers(newAnswers)
      }, 1000)
    }
  }, [stopListening])

  const startListening = useCallback(() => {
    const recognition = getSpeechRecognition()
    if (!recognition) {
      alert("Speech recognition is not supported in this browser. Please try Chrome or Edge.")
      return
    }

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

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

      // Update current transcript with interim results
      if (interimTranscript) {
        const displayTranscript = transcriptRef.current + " " + interimTranscript
        setCurrentTranscript(displayTranscript.trim())
      }

      // When we get final results, add to transcript and reset silence timer
      if (finalTranscript) {
        const newTranscript = (transcriptRef.current + " " + finalTranscript).trim()
        transcriptRef.current = newTranscript
        setCurrentTranscript(newTranscript)

        console.log("[v0] Final transcript updated:", newTranscript)

        // Reset silence timer - if user stops speaking for 2 seconds, complete answer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current)
        }
        silenceTimerRef.current = setTimeout(() => {
          console.log("[v0] Silence detected, completing answer with:", transcriptRef.current)
          handleAnswerComplete(transcriptRef.current)
        }, 2000)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
    }

    recognition.onerror = (event: Event & { error: string }) => {
      console.error("[v0] Speech recognition error:", event.error)
      setIsListening(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [getSpeechRecognition, handleAnswerComplete])

  const analyzeAnswers = async (answers: string[]) => {
    try {
      const response = await fetch("/api/extract-keywords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      })

      if (!response.ok) {
        throw new Error("Failed to extract keywords")
      }

      const data = await response.json()

      setCurrentStep("complete")

      // Wait a moment before adding to map
      setTimeout(() => {
        onComplete({ nodes: data.nodes, connections: data.connections })
      }, 1500)
    } catch (error) {
      console.error("[v0] Error analyzing answers:", error)
      // Fallback: extract simple keywords from answers
      const simpleKeywords = answers
        .join(" ")
        .toLowerCase()
        .replace(/[^a-z\s]/g, "")
        .split(" ")
        .filter((word) => word.length > 4)
        .slice(0, 3)

      const fallbackNodes = simpleKeywords.map(keyword => ({
        keyword: keyword.charAt(0).toUpperCase() + keyword.slice(1),
        description: "Key aspect of the problem"
      }))

      const fallbackConnections = [
        { source: fallbackNodes[0].keyword, target: fallbackNodes[1].keyword },
        { source: fallbackNodes[1].keyword, target: fallbackNodes[2].keyword },
        { source: fallbackNodes[0].keyword, target: fallbackNodes[2].keyword }
      ]

      setCurrentStep("complete")
      setTimeout(() => {
        onComplete({ nodes: fallbackNodes, connections: fallbackConnections })
      }, 1500)
    }
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

  // Keep refs in sync with state
  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex
  }, [currentQuestionIndex])

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  useEffect(() => {
    return () => {
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
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="w-24 h-24 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Mic className="w-12 h-12 text-white/60" />
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
                  className={`h-1 rounded-full transition-all duration-500 ${
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <div className="text-white/40 text-sm mb-4 uppercase tracking-wider">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <h3 className="text-2xl md:text-3xl font-light text-white mb-8 text-balance">
                {questions[currentQuestionIndex]}
              </h3>

              {/* Listening Indicator */}
              <div className="flex flex-col items-center justify-center min-h-[120px]">
                {isListening && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="relative mb-6"
                  >
                    <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center">
                      <Mic className="w-10 h-10 text-white" />
                    </div>
                    <span className="absolute inset-0 rounded-full bg-red-600 opacity-75 animate-ping" />
                  </motion.div>
                )}

                {/* Transcript Display */}
                {currentTranscript && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-6 py-4 bg-white/5 border border-white/10 rounded-lg max-w-2xl"
                  >
                    <p className="text-white/80 text-lg text-pretty">{currentTranscript}</p>
                  </motion.div>
                )}

                {!currentTranscript && isListening && (
                  <p className="text-white/40 text-sm">Listening... Start speaking</p>
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
                    transition={{ delay: index * 0.1 }}
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

        {currentStep === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mx-auto mb-8"
            >
              <Loader2 className="w-full h-full text-white/60" />
            </motion.div>
            <h3 className="text-2xl md:text-3xl font-light text-white mb-4">
              Analyzing Your Responses
            </h3>
            <p className="text-white/60 text-lg">
              Extracting key concepts and generating your problem map...
            </p>
          </motion.div>
        )}

        {currentStep === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="w-20 h-20 mx-auto mb-8 rounded-full bg-green-600/20 flex items-center justify-center"
            >
              <CheckCircle2 className="w-12 h-12 text-green-400" />
            </motion.div>
            <h3 className="text-2xl md:text-3xl font-light text-white mb-4">
              Map Generated
            </h3>
            <p className="text-white/60 text-lg">
              Adding keywords to your problem surface map...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
