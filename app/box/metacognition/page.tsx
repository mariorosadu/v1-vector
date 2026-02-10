"use client"

import { SimpleHeader } from "@/components/simple-header"
import { Footer } from "@/components/footer"
import { motion } from "framer-motion"

export default function MetacognitionPage() {
  return (
    <main className="bg-[#0f0f0f] min-h-screen">
      <SimpleHeader />
      
      {/* Main Content */}
      <div className="pt-32 md:pt-40 pb-20 px-6 md:px-12">
        <div className="container mx-auto max-w-5xl">
          {/* Page Title */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 
              className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-6 tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Metacognition
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              A tool for exploring and understanding objective functions
            </p>
          </motion.div>

          {/* Main Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-lg p-8 md:p-12"
          >
            {/* Overview Section */}
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-light text-white mb-4">
                Purpose
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Metacognition is designed as an analytical framework for examining and understanding objective functions—the mathematical representations that guide decision-making processes in both human cognition and artificial intelligence systems.
              </p>
              <p className="text-white/70 leading-relaxed">
                This tool serves as an interface for analyzing how different objectives shape outcomes, enabling users to explore the relationship between defined goals, constraints, and optimal solutions.
              </p>
            </div>

            {/* Key Features */}
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-light text-white mb-6">
                Key Capabilities
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/[0.03] border border-white/5 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-light text-white mb-2">
                        Objective Analysis
                      </h3>
                      <p className="text-white/60 text-sm leading-relaxed">
                        Deep exploration of objective function structures and their influence on optimization landscapes
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.03] border border-white/5 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-light text-white mb-2">
                        Decision Mapping
                      </h3>
                      <p className="text-white/60 text-sm leading-relaxed">
                        Visualization of how objectives translate into decision pathways and behavioral patterns
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.03] border border-white/5 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-light text-white mb-2">
                        Learning Framework
                      </h3>
                      <p className="text-white/60 text-sm leading-relaxed">
                        Educational interface for understanding the principles of optimization and goal-directed behavior
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.03] border border-white/5 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-light text-white mb-2">
                        Comparative Analysis
                      </h3>
                      <p className="text-white/60 text-sm leading-relaxed">
                        Tools for comparing different objective formulations and their resulting solution spaces
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Use Cases */}
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-light text-white mb-6">
                Applications
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white/[0.02] rounded-lg border border-white/5">
                  <div className="flex-shrink-0 w-1 h-full bg-gradient-to-b from-white/40 to-white/10 rounded-full" />
                  <div>
                    <h4 className="text-white/90 font-light mb-1">AI System Design</h4>
                    <p className="text-white/60 text-sm">
                      Understanding how reward functions and loss functions shape AI behavior and model optimization
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/[0.02] rounded-lg border border-white/5">
                  <div className="flex-shrink-0 w-1 h-full bg-gradient-to-b from-white/40 to-white/10 rounded-full" />
                  <div>
                    <h4 className="text-white/90 font-light mb-1">Decision Science</h4>
                    <p className="text-white/60 text-sm">
                      Analyzing human decision-making through the lens of implicit objective functions
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/[0.02] rounded-lg border border-white/5">
                  <div className="flex-shrink-0 w-1 h-full bg-gradient-to-b from-white/40 to-white/10 rounded-full" />
                  <div>
                    <h4 className="text-white/90 font-light mb-1">Alignment Research</h4>
                    <p className="text-white/60 text-sm">
                      Exploring the challenges of aligning artificial objectives with human values and intentions
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Coming Soon Notice */}
            <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.03] border border-white/10 rounded-lg p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 border border-white/20 mb-4">
                <svg className="w-8 h-8 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-light text-white mb-2">
                Interactive Tool In Development
              </h3>
              <p className="text-white/60 text-sm max-w-2xl mx-auto">
                The full interactive Metacognition analysis tool is currently under development. This page will be updated with comprehensive functionality for exploring objective functions in cognitive and AI systems.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
