"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

const navigationItems = [
  { label: "Publications", href: "/publications" },
  { 
    label: "Toy Box", 
    href: "/box",
    submenu: [
      { label: "Voice Flux", href: "/box/voiceflux" },
      { label: "Profile Analysis", href: "/box/profile-analysis" },
      { label: "Cognitive Map", href: "/box/map" },
      { label: "Metacognition", href: "/box/metacognition" },
    ]
  },
]

export function NewHeader() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const [typingComplete, setTypingComplete] = useState(false)
  const [showButtonCursor, setShowButtonCursor] = useState(false)

  const finalText = "We prime human cognition to [unlock] artificial intelligence's full potential."
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let step = 0
    
    const animationSequence = async () => {
      const wait = (ms: number) => new Promise(resolve => timeoutId = setTimeout(resolve, ms))
      
      // Step 1: Type "We prime humans"
      const text1 = "We prime humans"
      for (let i = 0; i <= text1.length; i++) {
        setTypedText(text1.substring(0, i))
        await wait(50)
      }
      
      // Step 2: Delete the "s"
      await wait(400)
      setTypedText("We prime human")
      
      // Step 3: Pause as if in doubt
      await wait(800)
      
      // Step 4: Keep typing until "to"
      const text2 = "We prime human cognition to "
      for (let i = "We prime human".length; i <= text2.length; i++) {
        setTypedText(text2.substring(0, i))
        await wait(50)
      }
      
      // Step 5: Write "reach"
      const text3 = "We prime human cognition to reach"
      for (let i = text2.length; i <= text3.length; i++) {
        setTypedText(text3.substring(0, i))
        await wait(60)
      }
      
      // Step 6: Delete "reach"
      await wait(500)
      for (let i = text3.length; i >= text2.length; i--) {
        setTypedText(text3.substring(0, i))
        await wait(40)
      }
      
      // Step 7: Write "[unlock]" with pause
      await wait(400)
      const text4 = "We prime human cognition to [unlock]"
      for (let i = text2.length; i <= text4.length; i++) {
        setTypedText(text4.substring(0, i))
        const char = text4[i - 1]
        if (char === '[' || char === ']') {
          await wait(150)
        } else {
          await wait(60)
        }
      }
      
      // Step 8: Continue to "full"
      await wait(300)
      const text5 = "We prime human cognition to [unlock] artificial intelligence's full "
      for (let i = text4.length; i <= text5.length; i++) {
        setTypedText(text5.substring(0, i))
        await wait(50)
      }
      
      // Step 9: Slowly type "potential."
      for (let i = text5.length; i <= finalText.length; i++) {
        setTypedText(finalText.substring(0, i))
        await wait(120)
      }
      
      // Complete
      setTypingComplete(true)
      await wait(300)
      setShowCursor(false)
      await wait(200)
      setShowButtonCursor(true)
      await wait(500)
      setShowButtonCursor(false)
    }
    
    timeoutId = setTimeout(() => animationSequence(), 1000)
    
    return () => clearTimeout(timeoutId)
  }, [])
  
  // Cursor blink effect
  useEffect(() => {
    if (!typingComplete) {
      const interval = setInterval(() => {
        setShowCursor(prev => !prev)
      }, 530)
      return () => clearInterval(interval)
    }
  }, [typingComplete])

  useEffect(() => {
    const handleScroll = () => {
      // Show navbar logo after scrolling 400px (when hero logo is mostly out of view)
      setScrolled(window.scrollY > 400)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f]/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Left - Empty spacer for logo centering */}
            <div className="flex items-center">
              <div className="lg:hidden w-6" />
            </div>

            <AnimatePresence>
              {scrolled && (
                <motion.button
                  onClick={() => router.push("/")}
                  className="absolute left-1/2 -translate-x-1/2 hover:opacity-80 transition-opacity cursor-pointer logo"
                  initial={{ 
                    opacity: 0,
                    y: 40,
                    scale: 1.3,
                    filter: "blur(8px)"
                  }}
                  animate={{ 
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter: "blur(0px)"
                  }}
                  exit={{ 
                    opacity: 0,
                    y: -20,
                    scale: 0.9,
                    filter: "blur(4px)"
                  }}
                  transition={{ 
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for smooth easing
                  }}
                >
                  <motion.div
                    className="relative"
                    initial={{ rotateX: 15 }}
                    animate={{ rotateX: 0 }}
                    transition={{
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  >
                    {/* Chromatic aberration effect layers */}
                    <motion.img
                      src="/images/vector-logo.svg"
                      alt=""
                      className="h-6 sm:h-8 w-auto absolute inset-0 opacity-30"
                      initial={{ x: -2, filter: "hue-rotate(0deg)" }}
                      animate={{ x: 0, filter: "hue-rotate(0deg)" }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      style={{ mixBlendMode: 'screen' }}
                      aria-hidden="true"
                    />
                    <motion.img
                      src="/images/vector-logo.svg"
                      alt=""
                      className="h-6 sm:h-8 w-auto absolute inset-0 opacity-30"
                      initial={{ x: 2, filter: "hue-rotate(180deg)" }}
                      animate={{ x: 0, filter: "hue-rotate(0deg)" }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      style={{ mixBlendMode: 'screen' }}
                      aria-hidden="true"
                    />
                    {/* Main logo */}
                    <img
                      src="/images/vector-logo.svg"
                      alt="VECTÖR"
                      className="h-6 sm:h-8 w-auto relative"
                    />
                  </motion.div>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Right - All Navigation Links (Desktop) / Menu Button (Mobile) */}
            <div className="flex items-center gap-8">
              <div className="hidden lg:flex items-center gap-8">
                {navigationItems.map((item) => (
                  item.submenu ? (
                    <div 
                      key={item.label}
                      className="relative"
                      onMouseEnter={() => setDropdownOpen(true)}
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          router.push(item.href)
                        }}
                        className="text-white/60 text-sm tracking-wide hover:text-white transition-colors flex items-center gap-1"
                      >
                        {item.label}
                        <svg className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <AnimatePresence>
                        {dropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full right-0 mt-2 w-48 bg-[#0f0f0f] border border-white/10 rounded-lg overflow-hidden"
                          >
                            {item.submenu.map((subItem) => (
                              <a
                                key={subItem.label}
                                href={subItem.href}
                                onClick={(e) => {
                                  e.preventDefault()
                                  router.push(subItem.href)
                                  setDropdownOpen(false)
                                }}
                                className="block px-4 py-3 text-white/60 text-sm hover:bg-white/5 hover:text-white transition-colors"
                              >
                                {subItem.label}
                              </a>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={(e) => {
                        if (item.href.startsWith('/')) {
                          e.preventDefault()
                          router.push(item.href)
                        }
                      }}
                      className="text-white/60 text-sm tracking-wide hover:text-white transition-colors"
                    >
                      {item.label}
                    </a>
                  )
                ))}
              </div>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden text-white/60 hover:text-white transition-colors"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {menuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#0f0f0f] z-[60] lg:hidden flex flex-col"
          >
            {/* Header with close button */}
            <div 
              className="flex items-center justify-between px-6 border-b border-white/10"
              style={{ 
                paddingTop: 'max(env(safe-area-inset-top), 16px)',
                minHeight: '64px',
              }}
            >
              <img
                src="/images/vector-logo-full.svg"
                alt="VECTÖR"
                className="h-5 w-auto"
              />
              <button
                onClick={() => setMenuOpen(false)}
                className="text-white/60 hover:text-white transition-colors p-2 -mr-2"
                aria-label="Close menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            
            {/* Navigation links */}
            <nav 
              className="flex-1 overflow-y-auto px-6 py-8"
              style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 32px)' }}
            >
              <ul className="space-y-1">
                {navigationItems.map((item) => (
                  <li key={item.label}>
                    {item.submenu ? (
                      <div>
                        <a
                          href={item.href}
                          onClick={(e) => {
                            setMenuOpen(false)
                            if (item.href.startsWith('/')) {
                              e.preventDefault()
                              router.push(item.href)
                            }
                          }}
                          className="block text-white text-lg font-light tracking-wide hover:text-white/60 transition-colors py-4 border-b border-white/5"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          {item.label}
                        </a>
                        <ul className="pl-4 space-y-1">
                          {item.submenu.map((subItem) => (
                            <li key={subItem.label}>
                              <a
                                href={subItem.href}
                                onClick={(e) => {
                                  setMenuOpen(false)
                                  if (subItem.href.startsWith('/')) {
                                    e.preventDefault()
                                    router.push(subItem.href)
                                  }
                                }}
                                className="block text-white/60 text-base font-light tracking-wide hover:text-white transition-colors py-3 border-b border-white/5"
                              >
                                {subItem.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <a
                        href={item.href}
                        onClick={(e) => {
                          setMenuOpen(false)
                          if (item.href.startsWith('/')) {
                            e.preventDefault()
                            router.push(item.href)
                          }
                        }}
                        className="block text-white text-lg font-light tracking-wide hover:text-white/60 transition-colors py-4 border-b border-white/5"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section with Large Logo */}
      <section className="relative min-h-[85vh] bg-[#0f0f0f] flex items-center justify-center pt-32 pb-16 md:pb-32">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="text-center relative z-10">
            {/* Large Central Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="mb-12 flex justify-center"
              style={{
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
                WebkitTransform: 'translateZ(0)',
                transform: 'translateZ(0)',
                willChange: 'transform, opacity',
              }}
            >
              <img
                src="/images/vector-logo-full.svg"
                alt="VECTÖR"
                className="w-full max-w-3xl h-auto"
                style={{
                  WebkitBackfaceVisibility: 'hidden',
                  backfaceVisibility: 'hidden',
                }}
              />
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-white/40 text-xs md:text-sm tracking-[0.3em] uppercase mb-8"
            >
              Decision Intelligence
            </motion.p>

            {/* Description with Typing Animation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-white/70 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-12 min-h-[4rem] flex items-center justify-center"
            >
              <p className="relative inline-block">
                {typedText.split('').map((char, index) => {
                  const beforeBracket = typedText.substring(0, index)
                  const isInsideBrackets = beforeBracket.includes('[') && !beforeBracket.includes(']')
                  const isBracket = char === '[' || char === ']'
                  
                  if (isBracket) {
                    // Animate brackets with unfold effect
                    return (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scaleX: 0.3, scaleY: 0.8 }}
                        animate={{ opacity: 1, scaleX: 1, scaleY: 1 }}
                        transition={{ 
                          duration: 0.4, 
                          ease: [0.22, 1, 0.36, 1],
                          delay: 0.05 
                        }}
                        className="inline-block"
                        style={{ 
                          transformOrigin: char === '[' ? 'right' : 'left'
                        }}
                      >
                        {char}
                      </motion.span>
                    )
                  }
                  
                  if (isInsideBrackets) {
                    // Text inside brackets appears smoothly
                    return (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="inline-block"
                      >
                        {char}
                      </motion.span>
                    )
                  }
                  
                  return <span key={index}>{char}</span>
                })}
                {showCursor && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: showCursor ? 1 : 0 }}
                    className="inline-block ml-0.5 text-white/70"
                  >
                    _
                  </motion.span>
                )}
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 relative z-10"
            >
              <div className="relative w-full sm:w-auto">
                <a 
                  href="/box/metacognition" 
                  className="w-full sm:w-auto min-h-[48px] flex items-center justify-center px-8 py-3 bg-white text-[#0f0f0f] text-sm font-medium tracking-wide hover:bg-white/90 transition-colors touch-manipulation"
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  Try Prototype
                </a>
                {showButtonCursor && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm"
                  >
                    _
                  </motion.span>
                )}
              </div>
              <a 
                href="/publications" 
                className="w-full sm:w-auto min-h-[48px] flex items-center justify-center px-8 py-3 border border-white/20 text-white text-sm tracking-wide hover:bg-white/5 transition-colors touch-manipulation"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                Publications
              </a>
              <a 
                href="/box" 
                className="w-full sm:w-auto min-h-[48px] flex items-center justify-center px-8 py-3 border border-white/20 text-white text-sm tracking-wide hover:bg-white/5 transition-colors touch-manipulation"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                Explore Toy Box
              </a>
            </motion.div>
          </div>
        </div>

        {/* Subtle gradient at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0f0f0f] to-transparent" />
      </section>
    </>
  )
}
