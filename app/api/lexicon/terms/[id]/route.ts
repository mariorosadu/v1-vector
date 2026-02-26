import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return Response.json({ error: 'ID is required' }, { status: 400 })
    }

    // Delete the term (cascade will handle edges and relations)
    const { error } = await supabase
      .from('lexicon_terms')
      .delete()
      .eq('id', id)

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    console.error('Lexicon term DELETE error:', error)
    return Response.json({ error: 'Failed to delete term' }, { status: 500 })
  }
}
