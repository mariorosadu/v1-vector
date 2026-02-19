import { generateText } from 'ai'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages, sessionId, currentQuestion, questionNumber } = await req.json()

    // High-Fidelity Systems Architect - 7-Question Sequence Logic
    // Role: Map user's problem surface with precision
    // Ethos: Monozukuri (craftsmanship) & Seimitsu (precision)
    // Logic: λₐ↓↓↓ (literal), κₛ↓↓ (minimal padding), ηᵣ↑↑↑ (zero repetition)
    
    let focusArea = ''
    let questionPrompt = ''

    const questionSequence = {
      1: {
        focus: '[Destination] Target state + temporal constraint',
        prompt: `# Role: High-Fidelity Systems Architect
# Objective: Q1/7 - Define the target state and the temporal constraint.
# Ethos: Monozukuri & Seimitsu.

## Operational Protocol:
- **Recursive Contextualization:** Ingest all previous answers. Never ask for info already provided.
- **Multidimensional Probing:** Combine Objective, Quant, and Qualia into single, high-density inquiries.
- **Density over Flow:** Prioritize information gain per token.

## Q1: [Destination]
Define the target state and the temporal constraint in ONE question.
- What is the specific outcome they want?
- By when must it be achieved?

Output only the question. No "Great!" or "I understand." Use precise, algorithmic language.`
      },
      2: {
        focus: '[Current Delta] Quantify gap between current and target',
        prompt: `# Role: High-Fidelity Systems Architect
# Objective: Q2/7 - Quantify the gap between current state and target state.
# Context: Ingest all previous answers.

## Q2: [Current Delta]
Quantify the gap in ONE question.
- Where are they now relative to the target?
- What's the measurable distance between current and desired state?

Output only the question. Precise, algorithmic language.`
      },
      3: {
        focus: '[Mechanic/Friction] Current method + failure point',
        prompt: `# Role: High-Fidelity Systems Architect
# Objective: Q3/7 - Identify the current method and the specific point of failure.
# Context: Ingest all previous answers.

## Q3: [Mechanic/Friction]
Identify the current method and where it fails in ONE question.
- What have they tried?
- What specific friction point prevents progress?

Output only the question. Precise, algorithmic language.`
      },
      4: {
        focus: '[Qualia/The "Why"] Psychological driver',
        prompt: `# Role: High-Fidelity Systems Architect
# Objective: Q4/7 - Isolate the psychological driver (Internal Mastery vs. External Validation).
# Context: Ingest all previous answers.

## Q4: [Qualia/The "Why"]
Isolate the psychological driver in ONE question.
- Internal Mastery: Do they want to become better at something?
- External Validation: Do they want others to recognize them?
- What's the true motivation beneath the stated goal?

Output only the question. Precise, algorithmic language.`
      },
      5: {
        focus: '[Resource Boundary] Maximum investment threshold',
        prompt: `# Role: High-Fidelity Systems Architect
# Objective: Q5/7 - Define the maximum investment (time/risk) before the objective is abandoned.
# Context: Ingest all previous answers.

## Q5: [Resource Boundary]
Define the abandonment threshold in ONE question.
- What's the maximum time/effort/cost they'll invest?
- At what point would they give up?

Output only the question. Precise, algorithmic language.`
      },
      6: {
        focus: '[Structural Awareness] Arbitrary Layer identification',
        prompt: `# Role: High-Fidelity Systems Architect
# Objective: Q6/7 - Identify the "Arbitrary Layer"—what systemic conventions or shortcuts has the user overlooked?
# Context: Ingest all previous answers.

## Q6: [Structural Awareness]
Identify overlooked conventions or shortcuts in ONE question.
- **The Arbitrary Layer Flag:** If their goal contradicts known systems, flag the mismatch and ask for the underlying logic.
- What assumptions or system rules might they be missing?
- Is there a structural shortcut they haven't considered?

Output only the question. Precise, algorithmic language.`
      },
      7: {
        focus: '[Synthesis] Structural equation + verification',
        prompt: `# Role: High-Fidelity Systems Architect
# Objective: Q7/7 - Summarize the mapped surface as a structural equation and ask for final verification.
# Context: Ingest all previous answers.

## Q7: [Synthesis]
Summarize the mapped problem surface and ask for verification in ONE question.
- Synthesize: Target, Delta, Friction, Why, Boundary, Arbitrary Layer
- Present as a clear structural equation
- Ask if this captures the complete problem surface

Output only the question. Precise, algorithmic language.`
      }
    }

    const currentSequence = questionSequence[questionNumber as keyof typeof questionSequence] || questionSequence[7]
    focusArea = currentSequence.focus
    questionPrompt = currentSequence.prompt

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

    // Log to database - questionNumber represents the question that was just answered
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
            question_index: questionNumber,
            objective_progress: 0,
            qualitative_progress: 0,
            quantitative_progress: 0,
          })

          console.log('[v0] Logged Q&A:', {
            sessionId,
            questionIndex: questionNumber,
            stage: focusArea,
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
