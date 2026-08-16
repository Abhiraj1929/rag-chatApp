import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "RAG Chat Platform",
  },
});

const SYSTEM_PROMPT = `You are a helpful AI assistant for a RAG (Retrieval-Augmented Generation) chat platform.
Answer the user's question based on the provided context documents.
If the context doesn't contain enough information to answer, say so honestly.
Always cite which document(s) you used when possible.
Be concise and accurate.`;

function extractTextFromMessage(message) {
  if (message.content) return message.content;
  if (message.parts && Array.isArray(message.parts)) {
    return message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("");
  }
  return "";
}

async function getContext(query) {
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase");
    const { embedQuery } = await import("@/lib/embeddings");

    const queryEmbedding = await embedQuery(query);
    const supabaseAdmin = getSupabaseAdmin();

    const { count } = await supabaseAdmin.from("documents").select("*", { count: "exact", head: true });
    console.log("Total docs in table:", count, "| Query embedding dim:", queryEmbedding.length);

    const { data: matches, error } = await supabaseAdmin.rpc("match_documents", {
      query_embedding: JSON.stringify(queryEmbedding),
      match_count: 5,
      match_threshold: 0.1,
    });

    if (error) {
      console.error("RPC match_documents error:", error);
      return "No relevant documents found.";
    }

    if (matches && matches.length > 0) {
      return matches
        .map(
          (m, i) =>
            `[Document ${i + 1}] (similarity: ${m.similarity.toFixed(2)})\n${m.content}`
        )
        .join("\n\n---\n\n");
    }

    return "No relevant documents found.";
  } catch (err) {
    console.error("Context retrieval error:", err);
    return "No relevant documents found.";
  }
}

export async function POST(request) {
  try {
    const { messages } = await request.json();

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return new Response("No user message found", { status: 400 });
    }

    const query = extractTextFromMessage(lastMessage);
    if (!query) {
      return new Response("Empty user message", { status: 400 });
    }

    const context = await getContext(query);

    const chatMessages = messages.map((msg) => ({
      role: msg.role,
      content: extractTextFromMessage(msg),
    }));

    const stream = await openai.chat.completions.create({
      model: process.env.CHAT_MODEL || "nvidia/nemotron-3-ultra-550b-a55b:free",
      messages: [
        { role: "system", content: `${SYSTEM_PROMPT}\n\n## Retrieved Context\n${context}` },
        ...chatMessages,
      ],
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices?.[0]?.delta?.content;
            if (text) {
              controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
            }
          }
          controller.enqueue(encoder.encode("e: {}\n"));
          controller.enqueue(
            encoder.encode('d: {"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n')
          );
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.enqueue(encoder.encode(`3: ${JSON.stringify(err.message)}\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Vercel-AI-Data-Stream": "v1",
      },
    });
  } catch (err) {
    console.error("Chat error:", err);
    return new Response("Internal server error: " + err.message, {
      status: 500,
    });
  }
}
