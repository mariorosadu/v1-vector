import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { answers, questions } = await request.json()

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid answers data" }, { status: 400 })
    }

    const supabase = await createClient()

    // Format the content for text format
    let content = "=".repeat(60) + "\n"
    content += "PROBLEM SURFACE MAPPING SESSION\n"
    content += "=".repeat(60) + "\n"
    content += `Date: ${new Date().toLocaleString()}\n\n`

    answers.forEach((answer: string, index: number) => {
      content += `Question ${index + 1}: ${questions?.[index] || `Question ${index + 1}`}\n`
      content += "-".repeat(60) + "\n"
      content += `${answer}\n\n`
    })

    content += "=".repeat(60) + "\n"
    content += "END OF SESSION\n"
    content += "=".repeat(60) + "\n"

    // Insert into Supabase
    const { data, error } = await supabase
      .from("problem_surface_answers")
      .insert({
        questions: questions || [],
        answers,
        formatted_text: content,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase error:", error)
      throw error
    }

    console.log("[v0] Answer saved to Supabase successfully:", data.id)

    return NextResponse.json({ 
      success: true, 
      id: data.id,
      contentPreview: content.substring(0, 200) 
    })
  } catch (error) {
    console.error("[v0] Error saving answers:", error)
    return NextResponse.json(
      { error: "Failed to save answers" },
      { status: 500 }
    )
  }
}
