"use client"

import { SimpleHeader } from "@/components/simple-header"
import { Footer } from "@/components/footer"
import { motion } from "framer-motion"

export default function MetacognitionPage() {
  return (
    <main className="bg-[#0f0f0f] min-h-screen">
      <SimpleHeader />
      
      {/* Main Content */}
      <div className="pt-32 md:pt-40 pb-12 px-6 md:px-12">
        <div className="container mx-auto max-w-3xl">
          {/* Page Title */}
          <div className="text-center mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl lg:text-6xl font-light text-white mb-4 tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Metacognition
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/60 text-base md:text-lg"
            >
              Asking the right questions will take you to Rome.
            </motion.p>
          </div>

          {/* Coming Soon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16"
          >
            <div className="inline-block px-6 py-4 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-white/60 text-sm">
                This tool is coming soon. Check back for an interactive experience exploring metacognitive frameworks.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
