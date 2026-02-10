import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all answers from Supabase, ordered by creation date
    const { data: answers, error } = await supabase
      .from("problem_surface_answers")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Supabase error:", error)
      throw error
    }

    return NextResponse.json({ answers: answers || [] })
  } catch (error) {
    console.error("[v0] Error reading answers:", error)
    return NextResponse.json(
      { error: "Failed to read answers" },
      { status: 500 }
    )
  }
}
