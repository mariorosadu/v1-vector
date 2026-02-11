"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export default function ContactPage() {
  const links = [
    {
      icon: "/v-logo.svg",
      href: "/",
      label: "Back to Home"
    },
    {
      icon: "/whatsapp-logo.svg",
      href: "whatsapp://send?phone=5531936183384&text=Hi",
      label: "WhatsApp"
    }
  ]

  return (
    <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-6"
        >
          {links.map((link, index) => (
            <motion.a
              key={link.href}
              href={link.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative flex items-center justify-center h-20 border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 transition-all duration-300"
              style={{
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div className="relative h-10 w-24">
                <Image
                  src={link.icon}
                  alt={link.label}
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              
              <span className="sr-only">{link.label}</span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </main>
  )
}
