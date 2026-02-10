"use client"

import { SimpleHeader } from "@/components/simple-header"
import { Footer } from "@/components/footer"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function BoxPage() {
  const router = useRouter()

  const tools = [
    {
      title: "Profile Analysis",
      description: "Multi-dimensional radar analysis of professional profiles across technical, strategic, and leadership capabilities.",
      href: "/box/profile-analysis",
      gradient: "from-blue-600/20 to-purple-600/20",
    },
    {
      title: "Cognitive Map",
      description: "Interactive network visualization exploring the interconnected landscape of human cognition and decision-making.",
      href: "/box/map",
      gradient: "from-purple-600/20 to-pink-600/20",
    },
    {
      title: "Metacognition",
      description: "Analytical framework for exploring and understanding objective functions in cognitive systems and artificial intelligence.",
      href: "/box/metacognition",
      gradient: "from-pink-600/20 to-orange-600/20",
    },
  ]

  return (
    <main className="bg-[#0f0f0f] min-h-screen">
      <SimpleHeader />
      
      <div className="pt-40 md:pt-52 pb-20 px-6 md:px-12">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-6 tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              The Box
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/60 text-lg md:text-xl max-w-3xl mx-auto"
            >
              Advanced analysis tools for exploring cognitive systems and professional capabilities
            </motion.p>
          </div>

          {/* Tool Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {tools.map((tool, index) => (
              <motion.button
                key={tool.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                onClick={() => router.push(tool.href)}
                className="group relative p-8 bg-white/5 border border-white/10 rounded-lg hover:bg-white/[0.07] transition-all text-left overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <h3 className="text-2xl font-light text-white mb-3 group-hover:text-white transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed group-hover:text-white/70 transition-colors">
                    {tool.description}
                  </p>
                  <div className="mt-6 flex items-center text-white/40 group-hover:text-white/60 transition-colors">
                    <span className="text-xs tracking-wide">Explore</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
