"use client"

import { useState, useEffect } from "react"
import { SimpleHeader } from "@/components/simple-header"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function MetacognitionLoginPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // Check if user is already authenticated and redirect
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.replace('/app/metacognition')
      } else {
        setIsAuthenticated(false)
      }
    })
  }, [router])

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/app/metacognition`,
      },
    })
    if (error) {
      console.error('Google login error:', error.message)
      setIsGoogleLoading(false)
    }
  }

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="h-dvh w-full flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-[#0a0a0a] h-dvh w-full flex flex-col overflow-hidden">
      <SimpleHeader />

      {/* Centered login prompt */}
      <div className="flex-1 flex items-center justify-center px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <Image
              src="/v-logo-large.svg"
              alt="Metacognition"
              width={200}
              height={113}
              className="mx-auto mb-6 opacity-90"
              priority
            />
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 rounded-2xl px-6 py-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 text-white/70 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span className="text-white/80 text-sm font-medium">
              {isGoogleLoading ? 'Redirecting...' : 'Continue with Google'}
            </span>
          </button>
        </motion.div>
      </div>
    </div>
  )
}
