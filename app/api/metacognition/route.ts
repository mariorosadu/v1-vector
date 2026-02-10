import { generateText } from 'ai'
import { createClient } from '@supabase/supabase-js'
import { createOpenAI } from '@ai-sdk/openai'

export const maxDuration = 30

type Stage = 'objective' | 'qualitative' | 'quantitative' | 'complete'

interface ProgressState {
  objectiveProgress: number
  qualitativeProgress: number
  quantitativeProgress: number
  currentStage: Stage
  objectiveClarity: number
}

export async function POST(req: Request) {
  try {
    const { messages, currentQuestion, progress, sessionId } = await req.json()

    const currentProgress: ProgressState = progress || {
      objectiveProgress: 0,
      qualitativeProgress: 0,
      quantitativeProgress: 0,
      currentStage: 'objective' as Stage,
      objectiveClarity: 0
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Determine system prompt based on current stage
    let systemPrompt = ''
    
    if (currentProgress.currentStage === 'objective') {
      systemPrompt = `You are a metacognition guide in the OBJECTIVE DEFINITION phase.

Your goal: Help the user clearly define their objective through ${5 - messages.length} more targeted questions.

Current objective clarity: ${currentProgress.objectiveClarity}/100

Ask ONE concise question that:
1. Clarifies WHAT they want to achieve specifically
2. Explores WHY this objective matters to them
3. Identifies key constraints or requirements
4. Reveals implicit assumptions about success

Progress heuristics:
- Strong specificity in answer = +20 clarity
- Clear motivation stated = +15 clarity
- Constraints identified = +10 clarity
- Vague or general answers = +5 clarity

Once clarity reaches 100, move to qualitative phase.

Return a JSON object with:
{
  "question": "Your next question here",
  "clarityGain": <number 5-20>,
  "reasoning": "Brief reasoning for this question"
}`
    } else if (currentProgress.currentStage === 'qualitative') {
      systemPrompt = `You are a metacognition guide in the QUALITATIVE ANALYSIS phase.

The user's objective is now clear. Ask questions to understand the QUALITATIVE aspects:
- Values and principles involved
- Emotional/psychological factors
- Stakeholder perspectives
- Quality measures and standards
- Contextual considerations

Ask ONE question that deepens qualitative understanding.

Return a JSON object with:
{
  "question": "Your next question here",
  "progressGain": <number 15-25>,
  "reasoning": "Brief reasoning"
}`
    } else if (currentProgress.currentStage === 'quantitative') {
      systemPrompt = `You are a metacognition guide in the QUANTITATIVE ANALYSIS phase.

Ask questions to gather QUANTITATIVE information:
- Specific metrics and KPIs
- Timelines and deadlines
- Budget/resource constraints
- Scale and scope numbers
- Success thresholds

Ask ONE question that captures measurable data.

Return a JSON object with:
{
  "question": "Your next question here",
  "progressGain": <number 15-25>,
  "reasoning": "Brief reasoning"
}`
    } else {
      systemPrompt = `The analysis is complete. Provide a brief summary question asking if they'd like to explore any aspect further.`
    }

    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    console.log("[v0] ===== API Request =====")
    console.log("[v0] Current stage:", currentProgress.currentStage)
    console.log("[v0] Messages count:", messages.length)
    console.log("[v0] API Key loaded:", process.env.OPENAI_API_KEY ? "Yes" : "MISSING")
    
    const result = await generateText({
      model: openai('gpt-5-mini'),
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxOutputTokens: 300,
    })

    console.log("[v0] ===== API Response =====")
    console.log("[v0] Raw response:", result.text)
    console.log("[v0] Response length:", result.text.length, "chars")

    // Parse the AI response
    let parsedResponse
    try {
      parsedResponse = JSON.parse(result.text)
      console.log("[v0] ✓ JSON parsed successfully")
      console.log("[v0] New question:", parsedResponse.question)
    } catch (parseError) {
      console.log("[v0] ✗ JSON parse failed, using fallback")
      console.log("[v0] Parse error:", parseError)
      // Fallback if AI doesn't return JSON
      parsedResponse = {
        question: result.text,
        clarityGain: 10,
        progressGain: 20,
        reasoning: 'Continuing analysis'
      }
    }

    // Update progress based on response
    const newProgress = { ...currentProgress }

    if (currentProgress.currentStage === 'objective') {
      newProgress.objectiveClarity += parsedResponse.clarityGain || 10
      newProgress.objectiveProgress = Math.min(100, (newProgress.objectiveClarity / 100) * 100)
      
      // Transition to qualitative when objective is clear
      if (newProgress.objectiveClarity >= 100) {
        newProgress.currentStage = 'qualitative'
        newProgress.objectiveProgress = 100
      }
    } else if (currentProgress.currentStage === 'qualitative') {
      newProgress.qualitativeProgress = Math.min(100, newProgress.qualitativeProgress + (parsedResponse.progressGain || 20))
      
      // Transition to quantitative after ~5 qualitative questions
      if (newProgress.qualitativeProgress >= 100) {
        newProgress.currentStage = 'quantitative'
        newProgress.qualitativeProgress = 100
      }
    } else if (currentProgress.currentStage === 'quantitative') {
      newProgress.quantitativeProgress = Math.min(100, newProgress.quantitativeProgress + (parsedResponse.progressGain || 20))
      
      // Complete after quantitative is done
      if (newProgress.quantitativeProgress >= 100) {
        newProgress.currentStage = 'complete'
        newProgress.quantitativeProgress = 100
      }
    }

    // Save the current question-answer pair to database
    if (sessionId && messages.length > 0) {
      const lastUserMessage = messages[messages.length - 1]
      
      await supabase.from('metacognition_dialogues').insert({
        session_id: sessionId,
        question: currentQuestion,
        answer: lastUserMessage.content,
        stage: currentProgress.currentStage,
        question_index: messages.filter((m: any) => m.role === 'user').length,
        objective_progress: newProgress.objectiveProgress,
        qualitative_progress: newProgress.qualitativeProgress,
        quantitative_progress: newProgress.quantitativeProgress
      })
    }

    return Response.json({
      question: parsedResponse.question,
      progress: newProgress,
      reasoning: parsedResponse.reasoning
    })
  } catch (error) {
    console.error('Error in metacognition API:', error)
    return Response.json({ error: 'Error processing request' }, { status: 500 })
  }
}
