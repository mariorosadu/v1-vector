import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const SpecSchema = z.object({
  questionClass: z.enum(["Decide", "Debug", "Design", "Plan", "Explain"]).optional(),
  solved: z.object({
    value: z.string().optional(),
    unit: z.string().optional(),
    qualTag: z.enum(["simpler", "faster", "safer", "clearer", "prettier"]).optional(),
  }).optional(),
  timebox: z.object({
    type: z.enum(["duration", "date"]).optional(),
    value: z.string().optional(),
  }).optional(),
  constraints: z.object({
    time: z.string().optional(),
    budget: z.string().optional(),
    risk: z.string().optional(),
    scope: z.string().optional(),
    tools: z.string().optional(),
  }).optional(),
  baseline: z.string().optional(),
  options: z.array(z.string()).optional(),
  reproSteps: z.array(z.string()).optional(),
  nextAction: z.string().optional(),
})

const ConversationSchema = z.array(
  z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })
)

const RequestSchema = z.object({
  spec: SpecSchema,
  conversation: ConversationSchema,
  ui: z.object({
    activeSlot: z.string().optional(),
    score: z.number().optional(),
  }),
})

const ResponseSchema = z.object({
  next_question: z.string(),
  why_one_line: z.string(),
  active_slot: z.string(),
  suggested_answers: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    })
  ),
  input_mode: z.enum(["chips", "short_text", "long_text", "number_unit", "date", "duration", "list"]),
  spec_patch: SpecSchema.partial(),
  compiled_question: z.string(),
  score: z.number(),
})

function calculateScore(spec: z.infer<typeof SpecSchema>): number {
  let score = 0
  if (spec.solved) score += 5
  if (spec.questionClass) score += 4
  if (spec.baseline) score += 4
  if (spec.nextAction) score += 4
  if (spec.constraints && Object.keys(spec.constraints).length > 0) score += 3
  if (spec.timebox?.value) score += 3
  // Class-specific extras
  if (spec.questionClass === "Decide" && spec.options?.length) score += 2
  if (spec.questionClass === "Debug" && spec.reproSteps?.length) score += 2
  return Math.min(score, 25)
}

function generateMockResponse(
  spec: z.infer<typeof SpecSchema>,
  conversation: z.infer<typeof ConversationSchema>
): z.infer<typeof ResponseSchema> {
  // Determine what to ask next based on what's missing
  let next_question = ""
  let why_one_line = ""
  let active_slot = "questionClass"
  let suggested_answers: { label: string; value: string }[] = []
  let input_mode: "chips" | "short_text" | "long_text" | "number_unit" | "date" | "duration" | "list" = "chips"
  const spec_patch: Partial<z.infer<typeof SpecSchema>> = {}

  // Priority: questionClass -> solved -> baseline -> nextAction -> timebox -> constraints
  if (!spec.questionClass) {
    next_question = "What type of question are you working on?"
    why_one_line = "Knowing the question type helps me optimize the structure"
    active_slot = "questionClass"
    suggested_answers = [
      { label: "Make a decision", value: "Decide" },
      { label: "Fix a problem", value: "Debug" },
      { label: "Create something", value: "Design" },
      { label: "Plan approach", value: "Plan" },
      { label: "Understand topic", value: "Explain" },
    ]
    input_mode = "chips"
  } else if (!spec.solved) {
    next_question = "What specific outcome are you optimizing for?"
    why_one_line = "A clear success metric makes your question actionable"
    active_slot = "solved"
    suggested_answers = [
      { label: "Increase revenue", value: "revenue" },
      { label: "Reduce costs", value: "costs" },
      { label: "Save time", value: "time" },
      { label: "Improve quality", value: "quality" },
    ]
    input_mode = "short_text"
  } else if (!spec.baseline) {
    next_question = "What's your current baseline or starting point?"
    why_one_line = "Understanding where you are helps frame the gap"
    active_slot = "baseline"
    suggested_answers = []
    input_mode = "short_text"
  } else if (!spec.nextAction) {
    next_question = "What's your immediate next action after getting an answer?"
    why_one_line = "Knowing next steps helps focus the question on what matters"
    active_slot = "nextAction"
    suggested_answers = [
      { label: "Present to team", value: "present" },
      { label: "Make decision", value: "decide" },
      { label: "Start building", value: "build" },
      { label: "Research more", value: "research" },
    ]
    input_mode = "short_text"
  } else if (!spec.timebox?.value) {
    next_question = "What's your time constraint for this?"
    why_one_line = "Time constraints shape the depth and approach"
    active_slot = "timebox"
    suggested_answers = [
      { label: "Today", value: "1 day" },
      { label: "This week", value: "1 week" },
      { label: "This month", value: "1 month" },
      { label: "This quarter", value: "3 months" },
    ]
    input_mode = "duration"
  } else if (spec.questionClass === "Decide" && !spec.options?.length) {
    next_question = "What options are you deciding between?"
    why_one_line = "Clear options help structure the decision criteria"
    active_slot = "options"
    suggested_answers = []
    input_mode = "list"
  } else {
    next_question = "Would you like to refine the wording of your question?"
    why_one_line = "Polish the language for clarity and impact"
    active_slot = "refineWording"
    suggested_answers = [
      { label: "Looks good", value: "done" },
      { label: "Make it simpler", value: "simpler" },
      { label: "Add more context", value: "context" },
    ]
    input_mode = "chips"
  }

  // Generate compiled question
  let compiled_question = "How can I"
  if (spec.solved?.value) {
    compiled_question += ` ${spec.solved.value}`
    if (spec.solved.qualTag) {
      compiled_question += ` in a ${spec.solved.qualTag} way`
    }
  }
  if (spec.baseline) {
    compiled_question += ` (currently: ${spec.baseline})`
  }
  if (spec.nextAction) {
    compiled_question += ` so that I can ${spec.nextAction}`
  }
  if (spec.timebox?.value) {
    compiled_question += ` within ${spec.timebox.value}`
  }
  if (spec.constraints) {
    const constraints = Object.entries(spec.constraints)
      .filter(([_, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
    if (constraints.length > 0) {
      compiled_question += ` (constraints: ${constraints.join(", ")})`
    }
  }
  compiled_question += "?"

  const score = calculateScore(spec)

  return {
    next_question,
    why_one_line,
    active_slot,
    suggested_answers,
    input_mode,
    spec_patch,
    compiled_question,
    score,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = RequestSchema.parse(body)

    // TODO: Replace with actual LLM call
    // const response = await callBestLLM(validated)
    
    // For now, use mock response
    const response = generateMockResponse(validated.spec, validated.conversation)

    // Validate response
    const validatedResponse = ResponseSchema.parse(response)

    return NextResponse.json(validatedResponse)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
