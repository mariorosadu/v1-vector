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

interface MetacognitionSession {
  session_id: string
  dialogues: MetacognitionDialogue[]
  created_at: string
}

export default function AnswersAdminPage() {
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const [metacognitionSessions, setMetacognitionSessions] = useState<MetacognitionSession[]>([])
  const [activeTab, setActiveTab] = useState<'prototype' | 'metacognition'>('prototype')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [prototypeRes, metacognitionRes] = await Promise.all([
        fetch("/api/get-answers"),
        fetch("/api/get-metacognition")
      ])

      const prototypeData = await prototypeRes.json()
      const metacognitionData = await metacognitionRes.json()

      if (prototypeRes.ok) {
        setAnswers(prototypeData.answers || [])
      }

      if (metacognitionRes.ok && metacognitionData.sessions) {
        const sessions: MetacognitionSession[] = Object.entries(metacognitionData.sessions).map(
          ([session_id, dialogues]: [string, any]) => ({
            session_id,
            dialogues,
            created_at: dialogues[0]?.created_at || new Date().toISOString()
          })
        )
        sessions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setMetacognitionSessions(sessions)
      }
    } catch (err) {
      console.error('[v0] Error fetching data:', err)
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

  const formatMetacognitionAsText = (session: MetacognitionSession) => {
    const date = new Date(session.created_at).toLocaleString()
    let content = "=".repeat(60) + "\n"
    content += "METACOGNITION SESSION\n"
    content += "=".repeat(60) + "\n"
    content += `Date: ${date}\n`
    content += `Session ID: ${session.session_id}\n`
    content += `Total Questions: ${session.dialogues.length}\n\n`
    
    session.dialogues.forEach((dialogue, index) => {
      content += `Q${index + 1} [${dialogue.stage.toUpperCase()}]:\n`
      content += `${dialogue.question}\n`
      content += "-".repeat(40) + "\n"
      content += `${dialogue.answer}\n`
      content += `Progress - Objective: ${Math.round(dialogue.objective_progress)}%, `
      content += `Qualitative: ${Math.round(dialogue.qualitative_progress)}%, `
      content += `Quantitative: ${Math.round(dialogue.quantitative_progress)}%\n\n`
    })
    
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

  const downloadMetacognition = (session: MetacognitionSession) => {
    const content = formatMetacognitionAsText(session)
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const timestamp = new Date(session.created_at).toISOString().replace(/[:.]/g, "-")
    a.download = `metacognition-${session.session_id}-${timestamp}.txt`
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
            Conversation Logs
          </h1>
          <p className="text-white/60 text-lg mb-8">
            All collected responses from both conversation flows.
          </p>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8 border-b border-white/10">
            <button
              onClick={() => setActiveTab('prototype')}
              className={`px-6 py-3 text-sm font-medium transition-all relative ${
                activeTab === 'prototype'
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              Prototype Flow
              {activeTab === 'prototype' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('metacognition')}
              className={`px-6 py-3 text-sm font-medium transition-all relative ${
                activeTab === 'metacognition'
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              Metacognition Flow
              {activeTab === 'metacognition' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
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

          {/* Prototype Flow Content */}
          {activeTab === 'prototype' && !loading && !error && answers.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white/40 text-lg">No prototype answers saved yet</p>
              <p className="text-white/30 text-sm mt-2">
                Complete a problem surface mapping session to see answers here.
              </p>
            </div>
          )}

          {activeTab === 'prototype' && !loading && answers.length > 0 && (
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

          {/* Metacognition Flow Content */}
          {activeTab === 'metacognition' && !loading && !error && metacognitionSessions.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white/40 text-lg">No metacognition sessions saved yet</p>
              <p className="text-white/30 text-sm mt-2">
                Complete a metacognition flow to see session dialogues here.
              </p>
            </div>
          )}

          {activeTab === 'metacognition' && !loading && metacognitionSessions.length > 0 && (
            <div className="space-y-6">
              {metacognitionSessions.map((session) => (
                <div
                  key={session.session_id}
                  className="p-6 bg-white/5 border border-white/10 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <p className="text-white font-mono text-sm mb-1">
                        Session: {session.session_id}
                      </p>
                      <p className="text-white/40 text-sm">
                        {new Date(session.created_at).toLocaleString()} • {session.dialogues.length} interactions
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => downloadMetacognition(session)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
                      >
                        <Download className="w-4 h-4 text-white" />
                        <span className="text-sm text-white">Download .txt</span>
                      </button>
                    </div>
                  </div>

                  {/* Progress Summary */}
                  {session.dialogues.length > 0 && (
                    <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Progress Overview</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-white/40 text-xs mb-1">Objective</p>
                          <p className="text-white font-mono text-sm">
                            {Math.round(session.dialogues[session.dialogues.length - 1].objective_progress)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-white/40 text-xs mb-1">Qualitative</p>
                          <p className="text-white font-mono text-sm">
                            {Math.round(session.dialogues[session.dialogues.length - 1].qualitative_progress)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-white/40 text-xs mb-1">Quantitative</p>
                          <p className="text-white font-mono text-sm">
                            {Math.round(session.dialogues[session.dialogues.length - 1].quantitative_progress)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dialogue History */}
                  <div className="space-y-4">
                    {session.dialogues.map((dialogue, index) => (
                      <div key={dialogue.id} className="border-l-2 border-white/20 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white/30 text-xs font-mono">#{index + 1}</span>
                          <span className="px-2 py-0.5 bg-white/10 text-white/50 text-[10px] uppercase tracking-wider rounded">
                            {dialogue.stage}
                          </span>
                        </div>
                        <p className="text-white/50 text-sm mb-1.5">{dialogue.question}</p>
                        <p className="text-white/90 text-sm">{dialogue.answer}</p>
                      </div>
                    ))}
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
