import { generateText } from "ai"

export async function POST(request: Request) {
  const { newKeyword, existingKeywords } = await request.json()

  if (!newKeyword || !existingKeywords || !Array.isArray(existingKeywords)) {
    return Response.json({ error: "Invalid input" }, { status: 400 })
  }

  try {
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are an expert in cognitive science, complex systems, and knowledge mapping. 

Given a new keyword: "${newKeyword}"
And existing keywords in the map: ${existingKeywords.join(", ")}

Analyze the semantic and conceptual relationships between the new keyword and the existing ones. Select the 2 most semantically related existing keywords that should be connected to "${newKeyword}" in a knowledge graph.

Consider:
- Semantic similarity and conceptual overlap
- Hierarchical relationships (parent-child, broader-narrower)
- Functional relationships (cause-effect, part-whole)
- Domain connections (same field or interdisciplinary links)

Respond ONLY with a JSON object in this exact format:
{"connections": ["keyword1", "keyword2"]}

Use the exact spelling of keywords from the existing list. If fewer than 2 connections make sense, still provide 2 of the most relevant ones.`,
    })

    console.log("[v0] LLM Response:", text)

    // Parse the LLM response
    const parsed = JSON.parse(text)
    
    if (!parsed.connections || !Array.isArray(parsed.connections)) {
      throw new Error("Invalid response format")
    }

    return Response.json({ 
      connections: parsed.connections.slice(0, 2) 
    })
  } catch (error) {
    console.error("[v0] Error suggesting connections:", error)
    return Response.json(
      { error: "Failed to generate connections" },
      { status: 500 }
    )
  }
}
