"use client"

import { useEffect, useState } from "react"
import { Download, Trash2 } from "lucide-react"
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

interface MetacognitionDialogue {
  id: string
  session_id: string
  question: string
  answer: string
  stage: string
  question_index: number
  objective_progress: number
  qualitative_progress: number
  quantitative_progress: number
  created_at: string
}

export default function AnswersAdminPage() {
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const [metacognitionDialogues, setMetacognitionDialogues] = useState<MetacognitionDialogue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'problem-surface' | 'metacognition'>('problem-surface')

  useEffect(() => {
    fetchAnswers()
    fetchMetacognition()
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

  const fetchMetacognition = async () => {
    try {
      const response = await fetch("/api/get-metacognition")
      const data = await response.json()

      if (response.ok) {
        setMetacognitionDialogues(data.dialogues || [])
      } else {
        console.error("Failed to load metacognition dialogues")
      }
    } catch (err) {
      console.error("Failed to load metacognition dialogues:", err)
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

  const deleteAnswer = async (id: string) => {
    setDeleting(id)
    try {
      const response = await fetch("/api/delete-answer", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        setAnswers(answers.filter((record) => record.id !== id))
        setConfirmDelete(null)
      } else {
        setError("Failed to delete answer")
      }
    } catch (err) {
      setError("Failed to delete answer")
      console.error("Error deleting answer:", err)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <main className="bg-[#0f0f0f] min-h-screen">
      <SimpleHeader />

      <div className="pt-40 md:pt-52 pb-20 px-6 md:px-12">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-light text-white mb-3 text-balance">
            Collected Answers
          </h1>
          <p className="text-white/60 text-lg mb-8">
            All collected answers from both mapping sessions.
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mb-12 border-b border-white/10">
            <button
              onClick={() => setActiveTab('problem-surface')}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'problem-surface'
                  ? 'text-white border-white'
                  : 'text-white/50 border-transparent hover:text-white/70'
              }`}
            >
              Problem Surface ({answers.length})
            </button>
            <button
              onClick={() => setActiveTab('metacognition')}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'metacognition'
                  ? 'text-white border-white'
                  : 'text-white/50 border-transparent hover:text-white/70'
              }`}
            >
              Metacognition ({[...new Set(metacognitionDialogues.map(d => d.session_id))].length} sessions)
            </button>
          </div>

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

          {!loading && !error && activeTab === 'problem-surface' && answers.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white/40 text-lg">No answers saved yet</p>
              <p className="text-white/30 text-sm mt-2">
                Complete a problem surface mapping session to see answers here.
              </p>
            </div>
          )}

          {!loading && !error && activeTab === 'metacognition' && metacognitionDialogues.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white/40 text-lg">No metacognition dialogues saved yet</p>
              <p className="text-white/30 text-sm mt-2">
                Complete a metacognition flow session to see dialogues here.
              </p>
            </div>
          )}

          {!loading && activeTab === 'problem-surface' && answers.length > 0 && (
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
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => downloadAnswer(record)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
                      >
                        <Download className="w-4 h-4 text-white" />
                        <span className="text-sm text-white">Download .txt</span>
                      </button>
                      {confirmDelete === record.id ? (
                        <div className="flex items-center gap-2 bg-red-600/20 border border-red-600/50 rounded-lg px-3 py-2">
                          <span className="text-sm text-red-400">Delete?</span>
                          <button
                            onClick={() => deleteAnswer(record.id)}
                            disabled={deleting === record.id}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white text-xs rounded transition-colors"
                          >
                            {deleting === record.id ? "..." : "Yes"}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            disabled={deleting === record.id}
                            className="px-3 py-1 bg-white/10 hover:bg-white/15 disabled:bg-white/5 text-white text-xs rounded transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(record.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-600/30"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-red-400">Delete</span>
                        </button>
                      )}
                    </div>
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

          {!loading && activeTab === 'metacognition' && metacognitionDialogues.length > 0 && (
            <div className="space-y-8">
              {/* Group dialogues by session_id */}
              {[...new Set(metacognitionDialogues.map(d => d.session_id))].map(sessionId => {
                const sessionDialogues = metacognitionDialogues
                  .filter(d => d.session_id === sessionId)
                  .sort((a, b) => a.question_index - b.question_index)
                const firstDialogue = sessionDialogues[0]

                return (
                  <div
                    key={sessionId}
                    className="p-6 bg-white/5 border border-white/10 rounded-lg"
                  >
                    <div className="mb-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-white/40 text-sm mb-1">
                            {new Date(firstDialogue.created_at).toLocaleString()}
                          </p>
                          <p className="text-white/30 text-xs">
                            Session: {sessionId}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {/* Progress indicators */}
                          <div className="flex flex-col gap-1 text-xs">
                            <span className="text-white/50">
                              Objective: {Math.round(sessionDialogues[sessionDialogues.length - 1].objective_progress)}%
                            </span>
                            <span className="text-white/50">
                              Qualitative: {Math.round(sessionDialogues[sessionDialogues.length - 1].qualitative_progress)}%
                            </span>
                            <span className="text-white/50">
                              Quantitative: {Math.round(sessionDialogues[sessionDialogues.length - 1].quantitative_progress)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Display each Q&A */}
                    <div className="space-y-4">
                      {sessionDialogues.map((dialogue, idx) => (
                        <div key={dialogue.id} className="border-l-2 border-white/10 pl-4">
                          <div className="flex items-start gap-2 mb-1">
                            <span className="text-white/30 text-xs font-mono">Q{idx + 1}</span>
                            <span className="text-white/40 text-xs px-2 py-0.5 bg-white/5 rounded">
                              {dialogue.stage}
                            </span>
                          </div>
                          <p className="text-white/50 text-sm mb-2">{dialogue.question}</p>
                          <p className="text-white/90 text-sm">{dialogue.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
