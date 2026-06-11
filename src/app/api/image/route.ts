import { NextRequest, NextResponse } from "next/server";

// Generate an image for a carousel slide.
// Requires OPENAI_API_KEY in .env.local (uses the gpt-image-1 model).
// Returns a base64 data URL the browser can drop straight into an <img> / image slide.

export async function POST(req: NextRequest) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not set. Add it to .env.local and restart the dev server to use AI images." },
      { status: 500 }
    );
  }

  let prompt = "";
  try { prompt = String((await req.json()).prompt || "").trim(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

  // Nudge toward a clean, brand-consistent illustration look
  const styled = `${prompt}. Flat modern vector illustration, soft pastel lavender palette, minimal, lots of negative space, no text in the image.`;

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: styled,
      n: 1,
      size: "1024x1024",
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: `OpenAI Images ${res.status}`, detail: await res.text() }, { status: 502 });
  }

  const data = await res.json();
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) {
    const url = data?.data?.[0]?.url;
    if (url) return NextResponse.json({ dataUrl: url });
    return NextResponse.json({ error: "No image returned", raw: data }, { status: 502 });
  }
  return NextResponse.json({ dataUrl: `data:image/png;base64,${b64}` });
}
