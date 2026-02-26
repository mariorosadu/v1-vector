import { createClient } from '@supabase/supabase-js'
import { generateText } from 'ai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const maxDuration = 30

// GET: list all terms with their parent
export async function GET() {
  try {
    const { data: terms, error } = await supabase
      .from('lexicon_terms')
      .select('id, label, created_at')
      .order('label', { ascending: true })

    if (error) throw error

    // Get parent info for each term
    const { data: edges } = await supabase
      .from('lexicon_taxon_edges')
      .select('parent_id, child_id')

    const childToParent: Record<string, string> = {}
    if (edges) {
      for (const edge of edges) {
        childToParent[edge.child_id] = edge.parent_id
      }
    }

    const termsWithParent = terms?.map(t => ({
      ...t,
      parent_id: childToParent[t.id] || null,
      parent_label: terms?.find(p => p.id === childToParent[t.id])?.label || null,
    }))

    return Response.json({ terms: termsWithParent })
  } catch (error) {
    console.error('Lexicon terms GET error:', error)
    return Response.json({ error: 'Failed to fetch terms' }, { status: 500 })
  }
}

// POST: add a new term with LLM auto-wire
export async function POST(req: Request) {
  try {
    const { label } = await req.json()

    if (!label || typeof label !== 'string') {
      return Response.json({ error: 'Label is required' }, { status: 400 })
    }

    const normalizedLabel = label.trim().toUpperCase()

    // Check if term already exists
    const { data: existing } = await supabase
      .from('lexicon_terms')
      .select('id')
      .eq('label', normalizedLabel)
      .single()

    if (existing) {
      return Response.json({ error: 'Term already exists' }, { status: 409 })
    }

    // Get all existing terms for LLM context
    const { data: allTerms } = await supabase
      .from('lexicon_terms')
      .select('id, label')

    const { data: allEdges } = await supabase
      .from('lexicon_taxon_edges')
      .select('parent_id, child_id')

    // Build tree description for LLM
    const termMap = new Map(allTerms?.map(t => [t.id, t.label]) || [])
    const treeDesc = allEdges?.map(e =>
      `${termMap.get(e.parent_id)} -> ${termMap.get(e.child_id)}`
    ).join('\n') || 'KNOWLEDGE (root, no children yet)'

    // Ask LLM where to place the new term
    const result = await generateText({
      model: 'openai/gpt-4o-mini',
      system: `You are a taxonomy architect. Given an existing tree of terms and a new term, determine the best parent for the new term.

Existing taxonomy edges (PARENT -> CHILD):
${treeDesc}

Available parent terms: ${allTerms?.map(t => t.label).join(', ')}

Rules:
- Pick exactly ONE existing term as the parent
- If the new term is a broad category, place it under KNOWLEDGE
- If it's a specific topic, find the most fitting branch
- Return ONLY valid JSON, no markdown

Return: {"parent_label": "EXACT_PARENT_LABEL"}`,
      prompt: `Where should "${normalizedLabel}" be placed in this taxonomy?`,
      temperature: 0.3,
      maxOutputTokens: 100,
    })

    let parentLabel = 'KNOWLEDGE'
    try {
      const cleaned = result.text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
      const parsed = JSON.parse(cleaned)
      if (parsed.parent_label && termMap.size > 0) {
        // Verify the parent exists
        const parentExists = allTerms?.find(t => t.label === parsed.parent_label.toUpperCase())
        if (parentExists) {
          parentLabel = parsed.parent_label.toUpperCase()
        }
      }
    } catch {
      // Fallback to KNOWLEDGE root
      parentLabel = 'KNOWLEDGE'
    }

    // Insert the new term
    const { data: newTerm, error: insertError } = await supabase
      .from('lexicon_terms')
      .insert({ label: normalizedLabel })
      .select('id, label')
      .single()

    if (insertError) throw insertError

    // Get the parent term id
    const { data: parentTerm } = await supabase
      .from('lexicon_terms')
      .select('id')
      .eq('label', parentLabel)
      .single()

    if (parentTerm && newTerm) {
      // Get max sort_order for siblings
      const { data: siblingEdges } = await supabase
        .from('lexicon_taxon_edges')
        .select('sort_order')
        .eq('parent_id', parentTerm.id)
        .order('sort_order', { ascending: false })
        .limit(1)

      const nextSort = (siblingEdges?.[0]?.sort_order ?? -1) + 1

      await supabase
        .from('lexicon_taxon_edges')
        .insert({
          parent_id: parentTerm.id,
          child_id: newTerm.id,
          sort_order: nextSort,
          provenance: 'llm',
        })
    }

    return Response.json({
      term: newTerm,
      parent: parentLabel,
      provenance: 'llm',
    })
  } catch (error) {
    console.error('Lexicon terms POST error:', error)
    return Response.json({ error: 'Failed to add term' }, { status: 500 })
  }
}
