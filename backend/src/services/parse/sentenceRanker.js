import { callToEmbed } from "../../utils/callsAi/callToEmbed.js";

export class SentenceRanker {
  splitIntoSentences(text) {
    const sentences = [];
    const sentencePattern = /[^.!?]+[.!?]+/g;
    let match;
    let lastIndex = 0;

    while ((match = sentencePattern.exec(text)) !== null) {
      sentences.push({
        text: match[0].trim(),
        startChar: match.index,
        endChar: match.index + match[0].length,
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      const remaining = text.substring(lastIndex).trim();
      if (remaining) {
        sentences.push({
          text: remaining,
          startChar: lastIndex,
          endChar: text.length,
        });
      }
    }

    return sentences;
  }

  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async findBestSentences(chunkText, query, topK = 2) {
    const sentences = this.splitIntoSentences(chunkText);

    if (sentences.length === 0) {
      return {
        text: chunkText,
        startChar: 0,
        endChar: chunkText.length,
        score: 0,
      };
    }

    if (sentences.length === 1) {
      return {
        ...sentences[0],
        score: 1.0,
      };
    }

    const queryEmbedding = await callToEmbed(query);

    const sentenceEmbeddings = await Promise.all(
      sentences.map((s) => callToEmbed(s.text))
    );

    const scored = sentences.map((sentence, idx) => ({
      ...sentence,
      similarity: this.cosineSimilarity(
        queryEmbedding,
        sentenceEmbeddings[idx]
      ),
    }));

    scored.sort((a, b) => b.similarity - a.similarity);

    const topSentences = scored.slice(0, topK);
    topSentences.sort((a, b) => a.startChar - b.startChar);

    return {
      text: chunkText.substring(
        topSentences[0].startChar,
        topSentences[topSentences.length - 1].endChar
      ),
      startChar: topSentences[0].startChar,
      endChar: topSentences[topSentences.length - 1].endChar,
      score: topSentences[0].similarity,
    };
  }
}
