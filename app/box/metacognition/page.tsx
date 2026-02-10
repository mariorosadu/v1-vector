"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function MetacognitionBoxPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/metacognition")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60 text-sm">Redirecting to MetaCognition...</p>
      </div>
    </div>
  )
}
