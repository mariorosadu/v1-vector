import { generateText } from 'ai'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages, craftedPrompt, sessionId, currentQuestion } = await req.json()

    // Build conversation context for the AI
    const conversationHistory = messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    }))

    const systemPrompt = `You are a metacognition assistant that helps users clarify their intent. You have TWO jobs on every response:

1. **Clarifying Question**: Ask ONE short, incisive question to better understand what the user truly wants. Focus on uncovering implicit assumptions, constraints, desired tone, audience, scope, or success criteria. Be concise - one sentence max.

2. **Crafted Prompt**: Based on everything the user has said so far, write a SHORT, refined prompt that captures their true intent. This prompt will later be sent to an AI to generate a response. It should be clear, specific, and well-structured. Incorporate any new information from the latest answer.

${craftedPrompt ? `The current crafted prompt is: "${craftedPrompt}". Refine it based on the user's latest response.` : 'This is the first message. Create an initial crafted prompt from what the user described.'}

IMPORTANT: Return ONLY a JSON object with exactly these two fields:
{
  "question": "Your clarifying question here",
  "craftedPrompt": "The refined prompt here"
}

Do NOT wrap in markdown code blocks. Return raw JSON only.`

    const result = await generateText({
      model: 'openai/gpt-4o',
      system: systemPrompt,
      messages: conversationHistory,
      temperature: 0.7,
      maxOutputTokens: 500,
    })

    // Parse the AI response
    let parsedResponse
    try {
      let textToParse = result.text.trim()

      // Remove markdown code block wrappers if present
      if (textToParse.startsWith('```')) {
        const codeBlockMatch = textToParse.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
        if (codeBlockMatch) {
          textToParse = codeBlockMatch[1].trim()
        }
      }

      parsedResponse = JSON.parse(textToParse)
    } catch {
      console.error('Failed to parse AI response:', result.text)
      // Fallback: try to extract fields from malformed response
      const questionMatch = result.text.match(/"question"\s*:\s*"([^"]+)"/)
      const promptMatch = result.text.match(/"craftedPrompt"\s*:\s*"([^"]+)"/)
      parsedResponse = {
        question: questionMatch?.[1] || 'Could you tell me more about what you need?',
        craftedPrompt: promptMatch?.[1] || craftedPrompt || '',
      }
    }

    const responseData = {
      question: parsedResponse.question?.trim() || 'Could you tell me more?',
      craftedPrompt: parsedResponse.craftedPrompt?.trim() || craftedPrompt || '',
    }

    // Log to database if sessionId provided and we have a user response
    if (sessionId && messages.length > 0 && currentQuestion) {
      const lastUserMessage = messages[messages.length - 1]
      
      // Only log if the last message is from the user
      if (lastUserMessage.role === 'user') {
        try {
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          )

          const questionIndex = messages.filter((m: any) => m.role === 'user').length

          await supabase.from('metacognition_dialogues').insert({
            session_id: sessionId,
            question: currentQuestion, // The question that was displayed before this answer
            answer: lastUserMessage.content,
            stage: 'clarification',
            question_index: questionIndex,
            objective_progress: 0,
            qualitative_progress: 0,
            quantitative_progress: 0,
          })

          console.log('[v0] Logged Q&A to database:', {
            sessionId,
            questionIndex,
            question: currentQuestion,
            answer: lastUserMessage.content.substring(0, 50) + '...',
          })
        } catch (dbError) {
          console.error('[v0] Error logging to database:', dbError)
          // Don't fail the request if logging fails
        }
      }
    }

    return Response.json(responseData)
  } catch (error) {
    console.error('Error in metacognition API:', error)
    return Response.json({ error: 'Error processing request' }, { status: 500 })
  }
}
