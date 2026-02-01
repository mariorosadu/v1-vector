"use client"

import { StickyHeader } from "@/components/sticky-header"
import { NetworkGraph } from "@/components/network-graph"
import { Footer } from "@/components/footer"

export default function MapPage() {
  return (
    <main className="bg-[#0f0f0f] min-h-screen">
      <StickyHeader />
      
      {/* Main Content */}
      <div className="pt-64 md:pt-80 pb-20 px-6 md:px-12">
        <div className="container mx-auto">
          {/* Page Title */}
          <div className="text-center mb-16">
            <h1 
              className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-6 tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Cognitive Map
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto">
              {'Explore the interconnected landscape of human cognition, decision-making, and complex systems in the AI era.'}
            </p>
          </div>

          {/* Network Graph */}
          <NetworkGraph />
        </div>
      </div>

      <Footer />
    </main>
  )
}
