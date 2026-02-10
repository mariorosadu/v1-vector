"use client"

import { useEffect, useState } from "react"
import { Download } from "lucide-react"
import { SimpleHeader } from "@/components/simple-header"
import { Footer } from "@/components/footer"

interface AnswerRecord {
  id: string
  questions: string[]
  answers: string[]
  formatted_text: string
  created_at: string
}

export default function AnswersAdminPage() {
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnswers()
  }, [])

  const fetchAnswers = async () => {
    try {
      const response = await fetch("/api/get-answers")
      const data = await response.json()
      
      if (response.ok) {
        setAnswers(data.answers || [])
      } else {
        setError(data.error || "Failed to load answers")
      }
    } catch (err) {
      setError("Failed to load answers")
      console.error("[v0] Error fetching answers:", err)
    } finally {
      setLoading(false)
    }
  }

  const downloadAnswer = (answer: AnswerRecord) => {
    const blob = new Blob([answer.formatted_text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const timestamp = new Date(answer.created_at).toISOString().replace(/[:.]/g, "-")
    a.download = `problem-surface-${timestamp}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <main className="bg-[#0f0f0f] min-h-screen">
      <SimpleHeader />
      
      <div className="pt-40 md:pt-52 pb-20 px-6 md:px-12">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-light text-white mb-3">
            Problem Surface Answers
          </h1>
          <p className="text-white/60 text-lg mb-12">
            View and download all collected answers from the mapping sessions
          </p>

          {loading ? (
            <div className="text-center py-20">
              <p className="text-white/60">Loading answers...</p>
            </div>
          ) : error ? (
            <div className="mb-6 p-4 bg-red-600/10 border border-red-600/20 rounded-lg text-red-400">
              {error}
            </div>
          ) : answers.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/40 text-lg">No answers saved yet</p>
              <p className="text-white/30 text-sm mt-2">
                Complete a problem surface mapping session to see answers here
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {answers.map((answer) => (
                  <div
                    key={answer.id}
                    className="p-6 bg-white/5 border border-white/10 rounded-lg hover:bg-white/[0.07] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-medium mb-1 text-white">
                          Session {answer.id.substring(0, 8)}
                        </h3>
                        <p className="text-white/40 text-sm">
                          {new Date(answer.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => downloadAnswer(answer)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 flex-shrink-0"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-sm">Download</span>
                      </button>
                    </div>
                    <pre className="text-white/70 text-sm whitespace-pre-wrap font-mono bg-black/30 p-4 rounded border border-white/5 overflow-x-auto">
                      {answer.formatted_text}
                    </pre>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-4 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-white/40 text-sm leading-relaxed">
                  <strong className="text-white/60">Database Storage:</strong> All answers are stored in Supabase 
                  and will persist across deployments. You can download any session as a text file.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
