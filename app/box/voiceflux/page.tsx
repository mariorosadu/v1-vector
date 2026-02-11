"use client"

// INTERNAL PHASE ARCHITECTURE
// CB1: Context Building Phase 1 - VoiceQuestionFlow component

import { SimpleHeader } from "@/components/simple-header"
import { VoiceQuestionFlow } from "@/components/voice-question-flow"
import { Footer } from "@/components/footer"

export default function PrototypePage() {
  // Dummy handler since we no longer transition to map
  const handleQuestionsComplete = () => {
    // Flow is now self-contained within VoiceQuestionFlow
  }

  return (
    <main className="bg-[#0f0f0f] min-h-screen">
      <SimpleHeader />
      
      {/* Main Content */}
      <div className="pt-28 md:pt-36 pb-12 px-6 md:px-12">
        <div className="container mx-auto">
          {/* CB1: Context Building Phase - Voice Q&A Flow */}
          <VoiceQuestionFlow onComplete={handleQuestionsComplete} />
        </div>
      </div>

      <Footer />
    </main>
  )
}
