import { generateText } from "ai"

export async function POST(request: Request) {
  const { answers } = await request.json()

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return Response.json({ error: "Invalid input" }, { status: 400 })
  }

  try {
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are an expert in problem analysis and knowledge mapping. 

A user has answered three questions about their problem:

1. What problem are you trying to solve?
   "${answers[0]}"

2. Who is affected by this problem?
   "${answers[1]}"

3. What are the main challenges or obstacles?
   "${answers[2]}"

Extract exactly 6 keywords that represent the core concepts, challenges, stakeholders, or aspects of this problem. These keywords will be displayed as floating nodes in a problem surface map.

Requirements:
- Extract 6 distinct, meaningful keywords or short phrases (1-3 words each)
- Keywords should be substantive concepts, not articles or conjunctions
- Focus on actionable concepts, stakeholders, challenges, or key themes
- Use title case for keywords
- Make them specific enough to be meaningful but general enough to be relatable

For each keyword, provide a brief description (max 2 lines, ~80 characters) that explains its role in the problem.

Respond ONLY with a JSON object in this exact format:
{
  "nodes": [
    {
      "keyword": "Keyword1",
      "description": "Brief description explaining its role in the problem"
    },
    {
      "keyword": "Keyword2",
      "description": "Brief description explaining its role in the problem"
    },
    {
      "keyword": "Keyword3",
      "description": "Brief description explaining its role in the problem"
    },
    {
      "keyword": "Keyword4",
      "description": "Brief description explaining its role in the problem"
    },
    {
      "keyword": "Keyword5",
      "description": "Brief description explaining its role in the problem"
    },
    {
      "keyword": "Keyword6",
      "description": "Brief description explaining its role in the problem"
    }
  ]
}`,
    })

    // Parse the LLM response
    const parsed = JSON.parse(text)
    
    if (!parsed.nodes || !Array.isArray(parsed.nodes) || parsed.nodes.length !== 6) {
      throw new Error("Invalid response format")
    }

    return Response.json({ 
      nodes: parsed.nodes,
      connections: []
    })
  } catch (error) {
    console.error("[v0] Error extracting keywords:", error)
    
    // Fallback: extract simple keywords from answers
    const allWords = answers
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .split(" ")
      .filter((word: string) => word.length > 4)
      .slice(0, 6)
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))

    const fallbackKeywords = allWords.length === 6 ? allWords : ["Challenge", "Stakeholder", "Solution", "Impact", "Resources", "Goals"]
    
    return Response.json({ 
      nodes: fallbackKeywords.map(keyword => ({
        keyword,
        description: `Key aspect of the problem`
      })),
      connections: []
    })
  }
}
