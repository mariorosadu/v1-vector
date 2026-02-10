import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get all metacognition dialogues grouped by session
    const { data, error } = await supabase
      .from('metacognition_dialogues')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch dialogues' },
        { status: 500 }
      )
    }

    // Group by session_id
    const groupedBySession: Record<string, any[]> = {}
    data.forEach((dialogue) => {
      if (!groupedBySession[dialogue.session_id]) {
        groupedBySession[dialogue.session_id] = []
      }
      groupedBySession[dialogue.session_id].push(dialogue)
    })

    // Sort each session's dialogues by question_index
    Object.keys(groupedBySession).forEach((sessionId) => {
      groupedBySession[sessionId].sort((a, b) => a.question_index - b.question_index)
    })

    return NextResponse.json({
      success: true,
      sessions: groupedBySession,
      totalSessions: Object.keys(groupedBySession).length,
      totalDialogues: data.length
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
