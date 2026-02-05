"use client"

import { useEffect, useRef, useState } from "react"

export function MobileScrollReveal() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
        const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0
        setScrollProgress(Math.min(Math.max(progress, 0), 1))
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // The scanline mask: a narrow band that reveals a slice of the image
  // as the user scrolls, the band moves down the viewport
  const bandHeight = 35 // percentage of viewport the visible band covers
  const maskTop = scrollProgress * (100 - bandHeight)

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[1] lg:hidden"
      aria-hidden="true"
    >
      {/* Background image with mask */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/images/michelangelo-bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.15,
          WebkitMaskImage: `linear-gradient(
            to bottom,
            transparent ${maskTop}%,
            rgba(0,0,0,0.3) ${maskTop + 2}%,
            rgba(0,0,0,1) ${maskTop + 8}%,
            rgba(0,0,0,1) ${maskTop + bandHeight - 8}%,
            rgba(0,0,0,0.3) ${maskTop + bandHeight - 2}%,
            transparent ${maskTop + bandHeight}%
          )`,
          maskImage: `linear-gradient(
            to bottom,
            transparent ${maskTop}%,
            rgba(0,0,0,0.3) ${maskTop + 2}%,
            rgba(0,0,0,1) ${maskTop + 8}%,
            rgba(0,0,0,1) ${maskTop + bandHeight - 8}%,
            rgba(0,0,0,0.3) ${maskTop + bandHeight - 2}%,
            transparent ${maskTop + bandHeight}%
          )`,
          willChange: "mask-image, -webkit-mask-image",
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
          transform: "translateZ(0)",
        }}
      />
    </div>
  )
}
