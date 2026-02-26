import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const termLabel = req.nextUrl.searchParams.get('term')

  try {
    // If no term, default to root (KNOWLEDGE)
    const label = termLabel || 'KNOWLEDGE'

    // Get the selected term
    const { data: selectedTerm, error: termError } = await supabase
      .from('lexicon_terms')
      .select('id, label')
      .eq('label', label.toUpperCase())
      .single()

    if (termError || !selectedTerm) {
      return Response.json({ error: 'Term not found' }, { status: 404 })
    }

    // Get parent (term that has this as a child)
    const { data: parentEdge } = await supabase
      .from('lexicon_taxon_edges')
      .select('parent_id')
      .eq('child_id', selectedTerm.id)
      .single()

    let parent = null
    if (parentEdge) {
      const { data: parentTerm } = await supabase
        .from('lexicon_terms')
        .select('id, label')
        .eq('id', parentEdge.parent_id)
        .single()
      parent = parentTerm
    }

    // Get siblings (other children of the same parent, including self)
    let siblings: { id: string; label: string }[] = []
    if (parentEdge) {
      const { data: siblingEdges } = await supabase
        .from('lexicon_taxon_edges')
        .select('child_id, sort_order')
        .eq('parent_id', parentEdge.parent_id)
        .order('sort_order', { ascending: true })

      if (siblingEdges && siblingEdges.length > 0) {
        const siblingIds = siblingEdges.map(e => e.child_id)
        const { data: siblingTerms } = await supabase
          .from('lexicon_terms')
          .select('id, label')
          .in('id', siblingIds)

        if (siblingTerms) {
          // Preserve sort order from edges
          const idToOrder = Object.fromEntries(
            siblingEdges.map(e => [e.child_id, e.sort_order])
          )
          siblings = siblingTerms.sort((a, b) =>
            (idToOrder[a.id] ?? 0) - (idToOrder[b.id] ?? 0)
          )
        }
      }
    } else {
      // Root term has no parent, siblings are just itself
      siblings = [selectedTerm]
    }

    // Get children
    const { data: childEdges } = await supabase
      .from('lexicon_taxon_edges')
      .select('child_id, sort_order')
      .eq('parent_id', selectedTerm.id)
      .order('sort_order', { ascending: true })

    let children: { id: string; label: string }[] = []
    if (childEdges && childEdges.length > 0) {
      const childIds = childEdges.map(e => e.child_id)
      const { data: childTerms } = await supabase
        .from('lexicon_terms')
        .select('id, label')
        .in('id', childIds)

      if (childTerms) {
        const idToOrder = Object.fromEntries(
          childEdges.map(e => [e.child_id, e.sort_order])
        )
        children = childTerms.sort((a, b) =>
          (idToOrder[a.id] ?? 0) - (idToOrder[b.id] ?? 0)
        )
      }
    }

    return Response.json({
      selected: selectedTerm,
      parent,
      siblings,
      children,
    })
  } catch (error) {
    console.error('Lexicon navigate error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
