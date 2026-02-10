"use client"

import { useEffect, useState } from "react"
import { Download } from "lucide-react"

interface AnswerFile {
  filename: string
  content: string
  createdAt: string
}

export default function AnswersAdminPage() {
  const [answers, setAnswers] = useState<AnswerFile[]>([])
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

  const downloadAnswer = (answer: AnswerFile) => {
    const blob = new Blob([answer.content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = answer.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/60">Loading answers...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-light mb-2">Problem Surface Answers</h1>
          <p className="text-white/60">
            View and download all collected answers from the mapping sessions
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-600/10 border border-red-600/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {answers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg">No answers saved yet</p>
            <p className="text-white/30 text-sm mt-2">
              Complete a problem surface mapping session to see answers here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {answers.map((answer, index) => (
              <div
                key={index}
                className="p-6 bg-white/5 border border-white/10 rounded-lg hover:bg-white/[0.07] transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-medium mb-1">{answer.filename}</h3>
                    <p className="text-white/40 text-sm">
                      {new Date(answer.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => downloadAnswer(answer)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Download</span>
                  </button>
                </div>
                <pre className="text-white/70 text-sm whitespace-pre-wrap font-mono bg-black/30 p-4 rounded border border-white/5 overflow-x-auto">
                  {answer.content}
                </pre>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg">
          <p className="text-white/40 text-sm">
            <strong className="text-white/60">Note:</strong> In the Vercel preview environment, files are stored temporarily. 
            Once deployed to production, files will persist in your server's file system or you can integrate with a database 
            or cloud storage solution for permanent storage.
          </p>
        </div>
      </div>
    </div>
  )
}
