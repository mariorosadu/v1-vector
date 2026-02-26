import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const revalidate = 60 // ISR: revalidate every 60s

export async function GET() {
  try {
    const [{ data: terms, error: termsError }, { data: edges, error: edgesError }] =
      await Promise.all([
        supabase.from('lexicon_terms').select('id, label').order('label', { ascending: true }),
        supabase.from('lexicon_taxon_edges').select('parent_id, child_id, sort_order').order('sort_order', { ascending: true }),
      ])

    if (termsError) throw termsError
    if (edgesError) throw edgesError

    return Response.json(
      { terms: terms ?? [], edges: edges ?? [] },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    )
  } catch (error) {
    console.error('Lexicon graph error:', error)
    return Response.json({ error: 'Failed to fetch graph' }, { status: 500 })
  }
}
