export async function POST(request: Request) {
  try {
    const response = await fetch("https://hook.us2.make.com/p2ay4jxea3uvuckvaogpjh3ry63bqcmf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify("sayonara"),
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return Response.json({ success: false, error: error }, { status: 500 })
  }
}
