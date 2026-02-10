import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function POST(request: Request) {
  try {
    const { answers, questions } = await request.json()

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid answers data" }, { status: 400 })
    }

    // Create answers folder if it doesn't exist
    const answersDir = path.join(process.cwd(), "answers")
    
    try {
      await fs.access(answersDir)
    } catch {
      await fs.mkdir(answersDir, { recursive: true })
    }

    // Generate timestamp for unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `problem-surface-${timestamp}.txt`
    const filePath = path.join(answersDir, filename)

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
    
    console.log("[v0] File written successfully to:", filePath)
    console.log("[v0] File content length:", content.length)

    // Verify the file was written
    try {
      await fs.access(filePath)
      console.log("[v0] File verified to exist")
    } catch (verifyError) {
      console.error("[v0] File verification failed:", verifyError)
    }

    return NextResponse.json({ 
      success: true, 
      filename,
      path: filePath,
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
