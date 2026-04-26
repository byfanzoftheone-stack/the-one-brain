export async function POST(request) {
  const { messages, system, fast } = await request.json();
  const model = fast ? "claude-haiku-4-5-20251001" : "claude-sonnet-4-6";
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_KEY || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model, max_tokens: 1000, system: system || undefined, messages }),
  });
  const data = await response.json();
  return Response.json(data);
}
