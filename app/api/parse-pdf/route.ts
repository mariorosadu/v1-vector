import { NextRequest, NextResponse } from 'next/server'

// Dynamic import to avoid issues with node-only packages
let pdfParse: any

async function getPdfParse() {
  if (!pdfParse) {
    pdfParse = (await import('pdf-parse')).default
  }
  return pdfParse
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const dimensions = JSON.parse(formData.get('dimensions') as string || '[]')

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parse PDF
    const pdfParseFn = await getPdfParse()
    const pdfData = await pdfParseFn(buffer)
    const text = pdfData.text

    console.log('[v0] Extracted PDF text:', text.substring(0, 200))

    // Extract name from first line or look for common patterns
    const lines = text.split('\n').filter((line: string) => line.trim().length > 0)
    let name = lines[0]?.trim() || 'Profile'

    // If first line looks like a title/header, use it; otherwise use filename without extension
    if (name.length > 100 || name.toLowerCase().includes('resumé') || name.toLowerCase().includes('cv')) {
      name = file.name.replace(/\.[^/.]+$/, '')
    }

    // Clean up the name
    name = name.substring(0, 100)

    console.log('[v0] Extracted name:', name)

    // Send text to skill parser
    const parseResponse = await fetch(new URL('/api/parse-skills', request.url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        skillsText: text,
        dimensions: dimensions,
      }),
    })

    if (!parseResponse.ok) {
      throw new Error('Failed to parse skills from PDF')
    }

    const skillData = await parseResponse.json()

    return NextResponse.json({
      name,
      skillData: skillData.skillData,
    })
  } catch (error) {
    console.error('[v0] PDF parsing error:', error)
    return NextResponse.json(
      { error: 'Failed to process PDF' },
      { status: 500 }
    )
  }
}
