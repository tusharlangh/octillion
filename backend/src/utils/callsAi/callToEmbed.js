import dotenv from "dotenv";
import {
  getEmbedding,
  setEmbedding,
} from "../callsCache/upstashEmbeddingCache.js";

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

export async function callToEmbed(text, model = "text-embedding-3-small") {
  try {
    const cachedEmbedding = await getEmbedding(text);
    if (cachedEmbedding) {
      return cachedEmbedding;
    }

    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API error: ${response.status} - ${
          errorData.error?.message || response.statusText
        }`
      );
    }

    const data = await response.json();

    let embedding;
    if (Array.isArray(text)) {
      embedding = data.data.map((item) => item.embedding);
    } else {
      embedding = data.data[0].embedding;
    }

    setEmbedding(text, embedding).catch((err) =>
      console.error("Failed to cache embedding:", err)
    );

    return embedding;
  } catch (error) {
    console.error("Error creating embedding:", error);
    throw error;
  }
}
