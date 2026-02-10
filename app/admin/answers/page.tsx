"use client"

import { useEffect, useState } from "react"
import { Download } from "lucide-react"
import { SimpleHeader } from "@/components/simple-header"
import { Footer } from "@/components/footer"

interface AnswerRecord {
  id: string
  session_id: string
  question_1: string
  answer_1: string
  question_2: string
  answer_2: string
  question_3: string
  answer_3: string
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
    } catch {
      setError("Failed to load answers")
    } finally {
      setLoading(false)
    }
  }

  const formatAsText = (record: AnswerRecord) => {
    const date = new Date(record.created_at).toLocaleString()
    let content = "=".repeat(60) + "\n"
    content += "PROBLEM SURFACE MAPPING SESSION\n"
    content += "=".repeat(60) + "\n"
    content += `Date: ${date}\n`
    content += `Session: ${record.session_id}\n\n`
    content += `Q1: ${record.question_1}\n`
    content += "-".repeat(40) + "\n"
    content += `${record.answer_1}\n\n`
    content += `Q2: ${record.question_2}\n`
    content += "-".repeat(40) + "\n"
    content += `${record.answer_2}\n\n`
    content += `Q3: ${record.question_3}\n`
    content += "-".repeat(40) + "\n"
    content += `${record.answer_3}\n\n`
    content += "=".repeat(60) + "\n"
    return content
  }

  const downloadAnswer = (record: AnswerRecord) => {
    const content = formatAsText(record)
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const timestamp = new Date(record.created_at).toISOString().replace(/[:.]/g, "-")
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
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-light text-white mb-3 text-balance">
            Problem Surface Answers
          </h1>
          <p className="text-white/60 text-lg mb-12">
            All collected answers from the mapping sessions.
          </p>

          {loading && (
            <div className="text-center py-20">
              <p className="text-white/50">Loading answers...</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-600/10 border border-red-600/20 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {!loading && !error && answers.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white/40 text-lg">No answers saved yet</p>
              <p className="text-white/30 text-sm mt-2">
                Complete a problem surface mapping session to see answers here.
              </p>
            </div>
          )}

          {!loading && answers.length > 0 && (
            <div className="space-y-6">
              {answers.map((record) => (
                <div
                  key={record.id}
                  className="p-6 bg-white/5 border border-white/10 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <p className="text-white/40 text-sm">
                        {new Date(record.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => downloadAnswer(record)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 flex-shrink-0"
                    >
                      <Download className="w-4 h-4 text-white" />
                      <span className="text-sm text-white">Download .txt</span>
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <p className="text-white/50 text-sm mb-1">{record.question_1}</p>
                      <p className="text-white/90">{record.answer_1}</p>
                    </div>
                    <div>
                      <p className="text-white/50 text-sm mb-1">{record.question_2}</p>
                      <p className="text-white/90">{record.answer_2}</p>
                    </div>
                    <div>
                      <p className="text-white/50 text-sm mb-1">{record.question_3}</p>
                      <p className="text-white/90">{record.answer_3}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
