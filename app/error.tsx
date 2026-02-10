"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Root error boundary caught:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h2 className="text-white text-xl mb-4">Something went wrong</h2>
        <p className="text-white/60 text-sm mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
