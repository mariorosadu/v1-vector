import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('metacognition_dialogues')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return Response.json({ dialogues: data })
  } catch (error) {
    console.error('Error fetching metacognition dialogues:', error)
    return Response.json({ error: 'Failed to fetch dialogues' }, { status: 500 })
  }
}
