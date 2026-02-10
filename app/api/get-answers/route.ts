import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function GET() {
  try {
    const answersDir = path.join(process.cwd(), "answers")
    
    // Check if directory exists
    try {
      await fs.access(answersDir)
    } catch {
      return NextResponse.json({ answers: [], message: "No answers directory found" })
    }

    // Read all files in the answers directory
    const files = await fs.readdir(answersDir)
    const txtFiles = files.filter(file => file.endsWith(".txt"))

    // Read content of each file
    const answers = await Promise.all(
      txtFiles.map(async (filename) => {
        const filePath = path.join(answersDir, filename)
        const content = await fs.readFile(filePath, "utf-8")
        const stats = await fs.stat(filePath)
        
        return {
          filename,
          content,
          createdAt: stats.birthtime.toISOString(),
        }
      })
    )

    // Sort by creation date, newest first
    answers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ answers })
  } catch (error) {
    console.error("[v0] Error reading answers:", error)
    return NextResponse.json(
      { error: "Failed to read answers" },
      { status: 500 }
    )
  }
}
