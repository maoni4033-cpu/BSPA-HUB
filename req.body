// Vercel serverless function (Node runtime).
// Keeps the Anthropic API key on the server only — never sent to the browser.
// Deployed automatically by Vercel because it lives in /api.

const SYSTEM_PROMPT =
  "You are the AI assistant for the Bicol Society of Public Administration – NCF Chapter (BSPA-NCF), " +
  "a student organization at Naga College Foundation, Inc. Help members with public administration " +
  "concepts, Philippine governance, the Local Government Code, the Constitution, Civil Service " +
  "Commission processes, reviewers, and general chapter questions. Be concise, clear, and encouraging.";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY" });
    return;
  }

  const { messages } = req.body || {};
  if (!Array.isArray(messages)) {
    res.status(400).json({ error: "Missing messages array" });
    return;
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to reach AI service" });
  }
}
