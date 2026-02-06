"use client"

import { useState } from "react"
import { SimpleHeader } from "@/components/simple-header"
import { NetworkGraph } from "@/components/network-graph"
import { VoiceQuestionFlow } from "@/components/voice-question-flow"
import { Footer } from "@/components/footer"

export default function PrototypePage() {
  const [showQuestionFlow, setShowQuestionFlow] = useState(true)
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>([])

  const handleQuestionsComplete = (keywords: string[]) => {
    console.log("[v0] Questions complete, keywords:", keywords)
    setExtractedKeywords(keywords)
    setShowQuestionFlow(false)
  }

  const handleReset = () => {
    setShowQuestionFlow(true)
    setExtractedKeywords([])
  }

  return (
    <main className="bg-[#0f0f0f] min-h-screen">
      <SimpleHeader />
      
      {/* Main Content */}
      <div className="pt-64 md:pt-80 pb-20 px-6 md:px-12">
        <div className="container mx-auto">
          {/* Page Title */}
          <div className="text-center mb-16">
            <h1 
              className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-6 tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Prototype
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto">
              {'Explore experimental frameworks and emerging concepts in cognitive systems and AI decision-making.'}
            </p>
          </div>

          {/* Voice Question Flow or Network Graph */}
          {showQuestionFlow ? (
            <VoiceQuestionFlow onComplete={handleQuestionsComplete} />
          ) : (
            <>
              <NetworkGraph showStartButton initialKeywords={extractedKeywords} />
              
              {/* Reset Button */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-white/5 border border-white/10 text-white/70 rounded-lg hover:bg-white/10 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  Start New Mapping Session
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
