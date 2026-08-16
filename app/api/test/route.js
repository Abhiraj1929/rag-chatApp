import OpenAI from "openai";

export async function GET() {
  try {
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "RAG Chat Platform",
      },
    });

    const completion = await openai.chat.completions.create({
      model: process.env.CHAT_MODEL || "nvidia/nemotron-3-ultra-550b-a55b:free",
      messages: [{ role: "user", content: "Say hello in one word." }],
      max_tokens: 10,
    });

    return Response.json({
      success: true,
      model: process.env.CHAT_MODEL,
      response: completion.choices[0].message.content,
    });
  } catch (err) {
    return Response.json({
      success: false,
      error: err.message,
      status: err.status,
    }, { status: 500 });
  }
}
