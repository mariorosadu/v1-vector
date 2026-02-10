import { streamText } from 'ai'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages, currentQuestion } = await req.json()

    const result = streamText({
      model: 'openai/gpt-4o',
      system: `You are a metacognition guide helping users explore and understand their objective functions. 
      
Your role is to ask ONE thoughtful, concise question at a time to help users deeply understand what they want to achieve and why.

Current question context: "${currentQuestion}"

Based on the user's response, generate the NEXT question that helps them:
1. Clarify their objectives
2. Understand the underlying motivations
3. Identify constraints and trade-offs
4. Explore alternative perspectives
5. Define success criteria

Keep questions:
- Short and focused (one question at a time)
- Thought-provoking
- Building on previous answers
- Aimed at revealing implicit assumptions

Return ONLY the next question text, nothing else.`,
      messages,
      temperature: 0.7,
      maxOutputTokens: 150,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('[v0] Error in metacognition API:', error)
    return new Response('Error processing request', { status: 500 })
  }
}
