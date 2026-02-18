import { generateText } from 'ai'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages, sessionId, currentQuestion, questionNumber } = await req.json()

    // Determine which attractor this question should focus on (7 questions total)
    // Questions 1-2: Objective definition
    // Questions 3-4: Qualia analysis (qualitative aspects)
    // Questions 5-6: Quant analysis (quantitative aspects)
    // Question 7: Time to completion analysis
    
    let focusArea = ''
    let questionPrompt = ''

    if (questionNumber <= 2) {
      focusArea = 'objective definition and problem surface'
      questionPrompt = `You are a curious, intelligent observer exploring the user's objective. Ask ONE sharp, insightful question to understand:
- What they're trying to achieve
- Why this matters to them
- The core problem they're solving

Question ${questionNumber}/7 - Focus on clarity and specificity.`
    } else if (questionNumber <= 4) {
      focusArea = 'qualia analysis (qualitative aspects)'
      questionPrompt = `You are exploring the QUALITATIVE dimensions of the user's objective. Ask ONE probing question about:
- Values, principles, or standards involved
- Emotional or psychological factors
- Stakeholder perspectives
- Quality measures or success criteria
- Contextual considerations

Question ${questionNumber}/7 - Focus on the "feel" and quality aspects, not numbers.`
    } else if (questionNumber <= 6) {
      focusArea = 'quant analysis (quantitative aspects)'
      questionPrompt = `You are exploring the QUANTITATIVE dimensions of the user's objective. Ask ONE specific question about:
- Metrics, KPIs, or measurable outcomes
- Budget, resources, or scale
- Specific numbers, percentages, or thresholds
- Concrete data points

Question ${questionNumber}/7 - Focus on measurable, quantifiable aspects.`
    } else {
      focusArea = 'time to completion analysis'
      questionPrompt = `You are exploring the TIMELINE and urgency of the user's objective. Ask ONE clear question about:
- When they need this completed
- Time constraints or deadlines
- Urgency level
- Milestones or phases

Question 7/7 - Final question. Focus on temporal aspects.`
    }

    // Build conversation context
    const conversationHistory = messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    }))

    const systemPrompt = `${questionPrompt}

Return ONLY a JSON object with one field:
{
  "question": "Your question here"
}

Be concise - one sentence. No markdown code blocks. Raw JSON only.`

    const result = await generateText({
      model: 'openai/gpt-4o',
      system: systemPrompt,
      messages: conversationHistory,
      temperature: 0.7,
      maxOutputTokens: 200,
    })

    // Parse response
    let parsedResponse
    try {
      let textToParse = result.text.trim()
      if (textToParse.startsWith('```')) {
        const match = textToParse.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
        if (match) textToParse = match[1].trim()
      }
      parsedResponse = JSON.parse(textToParse)
    } catch {
      const questionMatch = result.text.match(/"question"\s*:\s*"([^"]+)"/)
      parsedResponse = {
        question: questionMatch?.[1] || 'Could you elaborate on that?',
      }
    }

    // Log to database
    if (sessionId && messages.length > 0 && currentQuestion) {
      const lastUserMessage = messages[messages.length - 1]
      
      if (lastUserMessage.role === 'user') {
        try {
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          )

          await supabase.from('metacognition_dialogues').insert({
            session_id: sessionId,
            question: currentQuestion,
            answer: lastUserMessage.content,
            stage: focusArea,
            question_index: questionNumber - 1, // Previous question number
            objective_progress: 0,
            qualitative_progress: 0,
            quantitative_progress: 0,
          })
        } catch (dbError) {
          console.error('[v0] Error logging to database:', dbError)
        }
      }
    }

    return Response.json({
      question: parsedResponse.question?.trim() || 'Could you tell me more?',
    })
  } catch (error) {
    console.error('Error in metacognition API:', error)
    return Response.json({ error: 'Error processing request' }, { status: 500 })
  }
}
