import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("problem_surface_answers")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase select error:", error)
      return NextResponse.json({ error: "Failed to read answers" }, { status: 500 })
    }

    return NextResponse.json({ answers: data || [] })
  } catch (error) {
    console.error("Error reading answers:", error)
    return NextResponse.json(
      { error: "Failed to read answers" },
      { status: 500 }
    )
  }
}
