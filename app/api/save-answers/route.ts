import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function POST(request: Request) {
  try {
    const { answers, questions } = await request.json()

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid answers data" }, { status: 400 })
    }

    // Create backend folder if it doesn't exist
    const backendDir = path.join(process.cwd(), "backend")
    
    try {
      await fs.access(backendDir)
    } catch {
      await fs.mkdir(backendDir, { recursive: true })
    }

    // Generate timestamp for unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `problem-surface-${timestamp}.txt`
    const filePath = path.join(backendDir, filename)

    // Format the content
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

    // Write to file
    await fs.writeFile(filePath, content, "utf-8")

    return NextResponse.json({ 
      success: true, 
      filename,
      path: filePath 
    })
  } catch (error) {
    console.error("[v0] Error saving answers:", error)
    return NextResponse.json(
      { error: "Failed to save answers" },
      { status: 500 }
    )
  }
}
