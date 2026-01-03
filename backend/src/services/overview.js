import { callToOverview } from "../utils/callsAi/callToOverview.js";
import { trackRAGRetrieval } from "../utils/processMetrics.js";

export async function overview(hybridSearchResults, search, userId = null) {
  const context = hybridSearchResults
    .map((result, idx) => {
      return `SOURCE [${idx + 1}]: ${result.file_name} (Page ${
        result.page_number
      })
RELEVANCE: ${(result.rrf_score * 100).toFixed(1)}%
TEXT: ${result.text}`;
    })
    .join("\n\n---\n\n");

  const scores = hybridSearchResults.map((r) => r.rrf_score || 0);
  const avgScore =
    scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const topScore = Math.max(...scores);

  trackRAGRetrieval({
    userId,
    parseId: null,
    query: search,
    retrievedChunks: hybridSearchResults.length,
    avgRelevanceScore: avgScore,
    topScore: topScore,
    contextLength: context.length,
    retrievalLatency: 0,
  });

  const prompt = `You are a highly accurate AI assistant powering an enterprise search system. Your role is to generate concise, trustworthy overviews from document search results.
SEARCH RESULTS FOR: "${search}"
${context}
GENERATION GUIDELINES:
**Primary Objective:** Give users the answer they need without requiring them to read full documents.
**Answer Format:**
1. **Opening Statement** (required): Direct answer to the query in 1-2 clear sentences
2. **Supporting Details** (if relevant): Expand on the answer with key facts, context, or explanation
3. **Additional Context** (if helpful): Related information that enhances understanding
**Citation Rules:**
- Every factual claim MUST have a citation: [1], [2], etc.
- Multiple sources for the same point: [1][2]
- Place citation at the end of the sentence or claim
- Example: "The revenue grew 25% year-over-year [1], driven primarily by international expansion [2]."
**Confidence Indicators:**
- High confidence: State facts directly ("The deadline is March 15 [1]")
- Medium confidence: Use qualifiers ("The documents suggest..." or "According to [1]...")
- Low confidence: Be explicit ("The available information doesn't fully address this, but [1] mentions...")
**When Information is Missing:**
"I found information about [what you found], but the documents don't contain details about [what's missing]. Here's what I can tell you: [partial answer with citations]."
**Formatting Best Practices:**
- Use **bold** for critical information (dates, numbers, key decisions)
- Use bullet points when presenting 3+ related items:
  - Item one [1]
  - Item two [2]
  - Item three [3]
- Use short paragraphs (2-4 sentences)
- Add line breaks between distinct topics
**Strict Rules:**
⚠️ NEVER invent information not in the sources
⚠️ NEVER use general knowledge - ONLY use provided context
⚠️ NEVER say "I don't know" - instead say "The documents don't contain information about X"
⚠️ NEVER exceed 250 words
**Tone:** Professional, confident, helpful, and precise.
Generate the AI Overview now:`;

  const messages = [
    {
      role: "system",
      content: prompt,
    },
    {
      role: "user",
      content: `Context:\n${context}\n\nQ: ${search}`,
    },
  ];

  return {
    success: true,
    response: await callToOverview(
      messages,
      "llama-3.3-70b-versatile",
      0.7,
      1000,
      userId
    ),
  };
}
