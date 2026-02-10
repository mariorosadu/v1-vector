import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Missing answer ID" }, { status: 400 })
    }

    const { error } = await supabase
      .from("problem_surface_answers")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Supabase delete error:", error)
      return NextResponse.json({ error: "Failed to delete answer" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting answer:", error)
    return NextResponse.json(
      { error: "Failed to delete answer" },
      { status: 500 }
    )
  }
}
