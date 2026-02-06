"use client"

// INTERNAL PHASE ARCHITECTURE
// CB1: Context Building Phase 1 - VoiceQuestionFlow component
// MP2: Map Phase 2 - NetworkGraph component (after initial keyword extraction)

import { useState } from "react"
import { SimpleHeader } from "@/components/simple-header"
import { NetworkGraph } from "@/components/network-graph"
import { VoiceQuestionFlow } from "@/components/voice-question-flow"
import { Footer } from "@/components/footer"

interface KeywordNode {
  keyword: string
  description: string
}

interface Connection {
  source: string
  target: string
}

export default function PrototypePage() {
  // CB1: Context Building Phase State
  const [showQuestionFlow, setShowQuestionFlow] = useState(true)
  const [extractedData, setExtractedData] = useState<{
    nodes: KeywordNode[]
    connections: Connection[]
  } | null>(null)

  // CB1 → MP2: Transition handler - Move from context building to map phase
  const handleQuestionsComplete = (data: { nodes: KeywordNode[]; connections: Connection[] }) => {
    setExtractedData(data)
    setShowQuestionFlow(false)
  }

  const handleReset = () => {
    setShowQuestionFlow(true)
    setExtractedData(null)
  }

  return (
    <main className="bg-[#0f0f0f] min-h-screen">
      <SimpleHeader />
      
      {/* Main Content */}
      <div className="pt-40 md:pt-52 pb-20 px-6 md:px-12">
        <div className="container mx-auto">
          {/* CB1: Context Building Phase - Voice Q&A Flow */}
          {showQuestionFlow ? (
            <VoiceQuestionFlow onComplete={handleQuestionsComplete} />
          ) : (
            {/* MP2: Map Phase - Interactive problem surface visualization */}
            <>
              <NetworkGraph 
                showStartButton={false} 
                initialNodes={extractedData?.nodes || []}
                initialConnections={extractedData?.connections || []}
              />
              
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
