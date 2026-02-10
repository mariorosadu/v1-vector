import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { answers, questions } = await request.json()

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid answers data" }, { status: 400 })
    }

    const supabase = await createClient()

    const sessionId = crypto.randomUUID()

    const { data, error } = await supabase
      .from("problem_surface_answers")
      .insert({
        session_id: sessionId,
        question_1: questions?.[0] || "What problem are you trying to solve?",
        answer_1: answers[0] || "",
        question_2: questions?.[1] || "Who is affected by this problem?",
        answer_2: answers[1] || "",
        question_3: questions?.[2] || "What are the main challenges or obstacles?",
        answer_3: answers[2] || "",
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase insert error:", error)
      return NextResponse.json({ error: "Failed to save answers" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      session_id: sessionId,
    })
  } catch (error) {
    console.error("Error saving answers:", error)
    return NextResponse.json(
      { error: "Failed to save answers" },
      { status: 500 }
    )
  }
}
