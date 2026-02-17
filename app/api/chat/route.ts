import { streamText } from 'ai'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const result = streamText({
      model: 'openai/gpt-4o',
      system: `You are a helpful, knowledgeable AI assistant. Respond clearly and concisely to the user's request. Be direct, well-structured, and informative. Use markdown formatting when appropriate for readability.`,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.7,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Error in chat API:', error)
    return Response.json({ error: 'Error processing request' }, { status: 500 })
  }
}
