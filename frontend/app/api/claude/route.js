export async function POST(request) {
  const key = process.env.ANTHROPIC_KEY;
  if (!key) {
    return Response.json({ content: [{ type: "text", text: "ERROR: ANTHROPIC_KEY not found in environment" }] });
  }
  try {
    const body = await request.json();
    const { messages, system, fast } = body;
    const model = fast ? "claude-haiku-4-5-20251001" : "claude-haiku-4-5-20251001";
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1000,
        system: system || undefined,
        messages,
      }),
    });
    const data = await response.json();
    if (data.error) {
      return Response.json({ content: [{ type: "text", text: "Claude error: " + data.error.message }] });
    }
    return Response.json(data);
  } catch(e) {
    return Response.json({ content: [{ type: "text", text: "Route error: " + e.message }] });
  }
}
