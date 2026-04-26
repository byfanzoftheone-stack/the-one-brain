export async function POST(request) {
  const { messages, system, fast } = await request.json();
  const model = fast ? "claude-haiku-4-5-20251001" : "claude-sonnet-4-6";
  const key = process.env.ANTHROPIC_KEY;
  if (!key) return Response.json({ error: "No API key", content: [{ type: "text", text: "No Claude API key configured. Add ANTHROPIC_KEY in Vercel environment variables." }] });
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model, max_tokens: 1000, system: system || undefined, messages }),
    });
    const data = await response.json();
    return Response.json(data);
  } catch(e) {
    return Response.json({ content: [{ type: "text", text: "API error: " + e.message }] });
  }
}
