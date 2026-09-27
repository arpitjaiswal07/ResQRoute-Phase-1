import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = String(body.message || "").trim();
    const messages = Array.isArray(body.history) ? body.history : [];
    if (!message)
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    if (!process.env.GROQ_API_KEY)
      return NextResponse.json(
        { error: "AI service is not configured" },
        { status: 503 },
      );
    const history = messages
      .slice(-6)
      .filter(
        (m: any) =>
          ["user", "assistant"].includes(m?.role) &&
          typeof m?.content === "string",
      )
      .map((m: any) => ({ role: m.role, content: m.content }));
    const prompt = `You are ResQRoute, a roadside emergency assistant for India. Give concise, safety-first guidance in the user's language. If there is injury, fire, collision, immediate danger, or an unsafe isolated situation, tell them to call 112. Do not claim a certain diagnosis; provide probable causes and whether they should call a mechanic or tow truck.`;
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        temperature: 0.2,
        messages: [
          { role: "system", content: prompt },
          ...history,
          { role: "user", content: message },
        ],
      }),
      cache: "no-store",
    });
    const data = await r.json();
    if (!r.ok)
      return NextResponse.json({ error: "AI provider error" }, { status: 502 });
    return NextResponse.json({
      reply:
        data.choices?.[0]?.message?.content ||
        "Please call 112 if you are in immediate danger.",
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to process diagnosis" },
      { status: 500 },
    );
  }
}
