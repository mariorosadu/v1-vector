"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] pt-32 pb-16">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-5xl font-light text-white mb-6 tracking-tight">
            Get in Touch
          </h1>
          
          <p className="text-white/60 text-lg mb-12 leading-relaxed">
            We'd love to hear from you. Reach out to us on WhatsApp to discuss how we can help.
          </p>

          <motion.a
            href="whatsapp://send?phone=5531936183384&text=Hi"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-block min-h-[48px] px-8 py-3 border border-white/20 text-white text-sm tracking-wide hover:bg-white/5 transition-colors"
            style={{
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Contact via WhatsApp
          </motion.a>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16"
          >
            <Link
              href="/"
              className="text-white/40 hover:text-white/60 transition-colors text-sm"
            >
              ← Back to home
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}
