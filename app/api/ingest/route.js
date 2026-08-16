import { NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getSupabaseAdmin } from "@/lib/supabase";
import { embedQuery } from "@/lib/embeddings";
import { extractText } from "unpdf";

async function parsePdf(arrayBuffer) {
  const uint8 = new Uint8Array(arrayBuffer);
  const result = await extractText(uint8);
  if (typeof result === "string") return result;
  if (result?.text) return result.text;
  if (Array.isArray(result?.pages)) {
    return result.pages.map((p) => p.text || "").join("\n");
  }
  return "";
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const text = formData.get("text");
    const metadata = formData.get("metadata")
      ? JSON.parse(formData.get("metadata"))
      : {};

    let content = "";

    if (file) {
      const ext = "." + file.name.split(".").pop().toLowerCase();
      const arrayBuffer = await file.arrayBuffer();

      if (ext === ".pdf") {
        content = await parsePdf(arrayBuffer);
      } else {
        content = await file.text();
      }
    } else if (text) {
      content = text;
    } else {
      return NextResponse.json(
        { error: "No file or text content provided" },
        { status: 400 }
      );
    }

    if (typeof content !== "string") {
      content = String(content || "");
    }

    content = content
      .replace(/\0/g, "")
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (content.length < 10) {
      return NextResponse.json(
        { error: "Content too short to process. The PDF may be image-based or corrupted." },
        { status: 400 }
      );
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ["\n\n", "\n", ". ", " ", ""],
    });

    const docs = await splitter.createDocuments([content], [metadata]);

    const supabaseAdmin = getSupabaseAdmin();
    let inserted = 0;

    for (const doc of docs) {
      const embedding = await embedQuery(doc.pageContent);
      const embeddingStr = `[${embedding.join(",")}]`;

      const { error } = await supabaseAdmin.rpc("insert_document", {
        p_content: doc.pageContent,
        p_metadata: doc.metadata,
        p_embedding: embeddingStr,
      });

      if (error) {
        console.error("Insert error:", error);
        continue;
      }
      inserted++;
    }

    if (inserted === 0) {
      return NextResponse.json(
        { error: "Failed to insert any chunks" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      chunksInserted: inserted,
      message: `Successfully ingested ${inserted} chunks`,
    });
  } catch (err) {
    console.error("Ingestion error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
