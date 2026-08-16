import { pipeline } from "@huggingface/transformers";

let embedder = null;

export async function getLocalEmbeddings() {
  if (!embedder) {
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2",
      { dtype: "fp32" }
    );
  }
  return embedder;
}

export async function embedQuery(text) {
  const pipe = await getLocalEmbeddings();
  const output = await pipe(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

export async function embedDocuments(texts) {
  const pipe = await getLocalEmbeddings();
  const results = [];
  for (const text of texts) {
    const output = await pipe(text, { pooling: "mean", normalize: true });
    results.push(Array.from(output.data));
  }
  return results;
}
