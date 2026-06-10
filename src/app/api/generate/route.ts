import { NextRequest, NextResponse } from "next/server";

// Server-side Claude call — API key never reaches the browser.
// Set ANTHROPIC_API_KEY in .env.local

const BRAND_GUIDE = `
Brand: @quad_star — TikTok channel for AI tools and prompts that save time.
Voice: direct, actionable. No fluff. Specific outcomes. Numbers where possible.
No em dashes. No buzzwords (streamline/unleash/supercharge/transform/leverage/game-changer).
Audience: AI-curious general users discovered via TikTok algo, not engineers.
`;

const SYSTEM = `You are a TikTok carousel content writer for @quad_star.

${BRAND_GUIDE}

Generate exactly 7 slides as VALID JSON matching this schema:

[
  {
    "type": "hook",
    "text": "Catchy headline\\nwith line breaks",
    "highlight": "key phrase",
    "highlightStyle": "italic-box"
  },
  {
    "type": "body",
    "title": "1. SHORT TITLE",
    "text": "Body copy with\\nline breaks.\\n\\nMax 5 lines.",
    "highlight": "key phrase"
  },
  ... 4 more body slides (titles numbered 2-5) ...
  {
    "type": "cta",
    "text": "Reveal or close.\\nAction line.\\n\\nFollow ↓",
    "highlight": "key word",
    "highlightStyle": "italic-box",
    "handle": "@quad_star"
  }
]

Rules:
- Hook: max 30 words, 3 short lines, payoff first, number where possible
- Body slides: one idea each, max 40 words, max 5 lines
- highlight must appear VERBATIM inside that slide's text or title
- Use \\n for line breaks
- If the topic implies a reveal (tool/repo name), keep the name out of slides 1-6 and reveal in the CTA
- Only claim facts present in the topic brief; do not invent stats
- Return JSON ONLY. No markdown fences. No commentary.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not set. Add it to .env.local and restart the dev server." },
      { status: 500 }
    );
  }

  let topic: string;
  try {
    const body = await req.json();
    topic = String(body.topic || "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!topic) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM,
      messages: [{ role: "user", content: `Topic: ${topic}\n\nGenerate the 7-slide carousel JSON.` }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json({ error: `Anthropic API ${res.status}`, detail }, { status: 502 });
  }

  const data = (await res.json()) as { content: { text: string }[] };
  let raw = (data.content?.[0]?.text || "").trim();
  raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();

  try {
    const slides = JSON.parse(raw);
    if (!Array.isArray(slides) || slides.length < 3) {
      return NextResponse.json({ error: "Model returned unexpected shape", raw }, { status: 502 });
    }
    return NextResponse.json({ slides });
  } catch {
    return NextResponse.json({ error: "Failed to parse model JSON", raw }, { status: 502 });
  }
}
