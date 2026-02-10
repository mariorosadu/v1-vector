import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      session_id,
      question,
      answer,
      stage,
      question_index,
      objective_progress,
      qualitative_progress,
      quantitative_progress
    } = body

    // Validate required fields
    if (!session_id || !question || !answer || !stage || question_index === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert the dialogue entry
    const { data, error } = await supabase
      .from('metacognition_dialogues')
      .insert({
        session_id,
        question,
        answer,
        stage,
        question_index,
        objective_progress: objective_progress || 0,
        qualitative_progress: qualitative_progress || 0,
        quantitative_progress: quantitative_progress || 0
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save dialogue' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
