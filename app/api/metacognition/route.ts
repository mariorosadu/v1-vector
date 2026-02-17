import { generateText } from 'ai'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 30

type Stage = 'problem_surface' | 'qualitative' | 'quantitative' | 'complete'

interface ProgressState {
  overallProgress: number
  currentStage: Stage
  questionCount: number
}

export async function POST(req: Request) {
  try {
    const { messages, currentQuestion, progress, sessionId } = await req.json()

    const currentProgress: ProgressState = progress || {
      overallProgress: 0,
      currentStage: 'problem_surface' as Stage,
      questionCount: 0
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Determine system prompt based on current stage
    let systemPrompt = ''
    const questionsAsked = currentProgress.questionCount
    
    if (currentProgress.currentStage === 'problem_surface') {
      systemPrompt = `You are a metacognition guide helping map the PROBLEM SURFACE.

Total questions in this phase: 4
Current question: ${questionsAsked + 1}/4

Ask ONE concise, insightful question to understand:
1. WHAT they want to achieve (objective definition)
2. WHY this objective matters (motivation)
3. Key constraints or requirements
4. Success criteria and implicit assumptions

After 4 questions, transition to qualitative analysis.

Return a JSON object:
{
  "question": "Your next question here",
  "reasoning": "Brief reasoning for this question"
}`
    } else if (currentProgress.currentStage === 'qualitative') {
      systemPrompt = `You are a metacognition guide in QUALITATIVE (QUALIA) ANALYSIS.

Total questions in this phase: 3
Current question: ${questionsAsked - 4 + 1}/3

The problem surface is mapped. Now explore QUALITATIVE aspects:
- Values and principles involved
- Emotional/psychological factors
- Stakeholder perspectives and quality standards
- Contextual considerations

Ask ONE question that deepens qualitative understanding.

Return a JSON object:
{
  "question": "Your next question here",
  "reasoning": "Brief reasoning"
}`
    } else if (currentProgress.currentStage === 'quantitative') {
      systemPrompt = `You are a metacognition guide in QUANTITATIVE (QUANTA) ANALYSIS.

Total questions in this phase: 3
Current question: ${questionsAsked - 7 + 1}/3

Now gather QUANTITATIVE information:
- Specific metrics and KPIs
- Timelines and deadlines
- Budget/resource constraints
- Scale, scope, and measurable success thresholds

Ask ONE question that captures measurable data.

Return a JSON object:
{
  "question": "Your next question here",
  "reasoning": "Brief reasoning"
}`
    } else {
      systemPrompt = `The analysis is complete. Provide a brief summary question asking if they'd like to explore any aspect further.`
    }

    const result = await generateText({
      model: 'openai/gpt-4o',
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxOutputTokens: 300,
    })

    // Parse the AI response with robust handling for markdown-wrapped JSON
    let parsedResponse
    try {
      let textToParse = result.text.trim()
      
      // Remove markdown code block wrappers if present (```json ... ``` or ``` ... ```)
      if (textToParse.startsWith('```')) {
        // Extract content between ``` markers
        const codeBlockMatch = textToParse.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
        if (codeBlockMatch) {
          textToParse = codeBlockMatch[1].trim()
        }
      }
      
      parsedResponse = JSON.parse(textToParse)
      
      // Ensure question field is clean text without any JSON artifacts
      if (parsedResponse.question) {
        parsedResponse.question = parsedResponse.question.trim()
      }
    } catch (error) {
      console.error('[v0] Failed to parse AI response:', result.text)
      // Fallback if AI doesn't return valid JSON
      parsedResponse = {
        question: result.text.replace(/```json|```/g, '').trim(),
        clarityGain: 10,
        progressGain: 20,
        reasoning: 'Continuing analysis'
      }
    }

    // Update progress based on response
    const newProgress = { ...currentProgress }
    newProgress.questionCount += 1

    // Total of 10 questions: 4 problem surface + 3 qualitative + 3 quantitative
    // Each question = 10% progress
    newProgress.overallProgress = Math.min(100, (newProgress.questionCount / 10) * 100)

    // Stage transitions based on question count
    if (currentProgress.currentStage === 'problem_surface' && newProgress.questionCount >= 4) {
      newProgress.currentStage = 'qualitative'
    } else if (currentProgress.currentStage === 'qualitative' && newProgress.questionCount >= 7) {
      newProgress.currentStage = 'quantitative'
    } else if (currentProgress.currentStage === 'quantitative' && newProgress.questionCount >= 10) {
      newProgress.currentStage = 'complete'
      newProgress.overallProgress = 100
    }

    // Save the current question-answer pair to database
    if (sessionId && messages.length > 0) {
      const lastUserMessage = messages[messages.length - 1]
      
      await supabase.from('metacognition_dialogues').insert({
        session_id: sessionId,
        question: currentQuestion,
        answer: lastUserMessage.content,
        stage: currentProgress.currentStage,
        question_index: newProgress.questionCount,
        overall_progress: newProgress.overallProgress
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
