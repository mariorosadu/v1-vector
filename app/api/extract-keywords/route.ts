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

Extract exactly 4 keywords that represent the core concepts, challenges, stakeholders, or aspects of this problem. These keywords will be used to create nodes in a problem surface map.

Requirements:
- Extract 4 distinct, meaningful keywords or short phrases (1-3 words each)
- Keywords should be substantive concepts, not articles or conjunctions
- Focus on actionable concepts, stakeholders, challenges, or key themes
- Use title case for keywords
- Make them specific enough to be meaningful but general enough to be relatable

Respond ONLY with a JSON object in this exact format:
{"keywords": ["Keyword1", "Keyword2", "Keyword3", "Keyword4"]}`,
    })

    console.log("[v0] LLM Response:", text)

    // Parse the LLM response
    const parsed = JSON.parse(text)
    
    if (!parsed.keywords || !Array.isArray(parsed.keywords) || parsed.keywords.length !== 4) {
      throw new Error("Invalid response format")
    }

    return Response.json({ 
      keywords: parsed.keywords 
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
      .slice(0, 4)
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))

    return Response.json({ 
      keywords: allWords.length === 4 ? allWords : ["Challenge", "Problem", "Solution", "Impact"]
    })
  }
}
