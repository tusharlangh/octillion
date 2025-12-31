import supabase from "../utils/supabase/client.js";
import dotenv from "dotenv";
import { searchQdrant } from "./qdrantService.js";
import { getJsonFromS3 } from "./saveFiles/upload.js";
import { AppError } from "../middleware/errorHandler.js";
import { searchBuildIndex_v2, searchContent_v2 } from "./parse/searchIndex.js";
import { createPresignedUrl } from "./saveFiles/upload.js";
import { callToEmbed } from "../utils/openAi/callToEmbed.js";
import {
  normalizeKeywordResults,
  normalizeSemanticResults,
} from "./parse/resultNormalizer.js";
import { analyzeQuery } from "../utils/stopwords.js";
import { createContextualChunks_v2 } from "./parse/chunks.js";
import { callToOverview } from "../utils/openAi/callToOverview.js";

dotenv.config();

async function getFileMapping(files) {
  const mapping = {};
  if (!files || !Array.isArray(files)) return mapping;

  const results = await Promise.all(
    files.map(async (file) => {
      try {
        const res = await createPresignedUrl(file);
        return res;
      } catch (err) {
        console.error(
          `Failed to create presigned URL for ${file.file_name}:`,
          err
        );
        return null;
      }
    })
  );

  results.filter(Boolean).forEach((res, index) => {
    mapping[res.file_name] = res.presignedUrl;
    mapping[`Document ${index + 1}`] = res.presignedUrl;
  });
  return mapping;
}

export async function parse_v2(id, search, userId, options = {}) {
  try {
    if (!search || search.length === 0) {
      throw new AppError(
        "Rewriting search came out empty",
        500,
        "REWRITE_SEARCH_ERROR"
      );
    }

    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("user_id", userId)
      .eq("parse_id", id);

    if (error) {
      throw new AppError(
        `Failed to fetch files: ${error.message}`,
        500,
        "SUPABASE_ERROR"
      );
    }

    if (!data || data.length === 0) {
      return {
        success: true,
        searchResults: [],
      };
    }

    const d = data[0];

    if (!d || !d.pages_metadata || !d.inverted_index) {
      throw new AppError(
        "Invalid or incomplete data row",
        500,
        "INVALID_DATA_ROW"
      );
    }

    const fileMapping = await getFileMapping(d.files);

    let pagesContent = d.pages_metadata;
    let inverted = d.inverted_index;
    let chunks = d.chunks_metadata;

    if (pagesContent && pagesContent.s3Key) {
      pagesContent = await getJsonFromS3(pagesContent.s3Key);
    }

    if (inverted && inverted.s3Key) {
      inverted = await getJsonFromS3(inverted.s3Key);
    }

    if (chunks && chunks.s3Key) {
      chunks = await getJsonFromS3(chunks.s3Key);
    }

    if (!pagesContent || pagesContent.length === 0) {
      throw new AppError("Pages content is empty", 500, "EMPTY_PAGES_CONTENT");
    }

    if (
      !inverted ||
      typeof inverted !== "object" ||
      Object.keys(inverted).length === 0
    ) {
      throw new AppError(
        "Inverted index is empty or invalid",
        500,
        "EMPTY_INVERTED_INDEX"
      );
    }

    const [hybridSearchResults, type] = await hybridSearch(
      id,
      userId,
      search,
      pagesContent,
      inverted,
      fileMapping,
      chunks
    );

    let raw = "";
    if (type === "semantic" || type === "both") {
      raw = await callOverview(hybridSearchResults, search);
    }

    return {
      success: true,
      result: hybridSearchResults,
      overview: raw,
      fileMapping,
    };
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError(`System error: ${error.message}`, 500, "SYSTEM_ERROR");
  }
}

async function semanticSearch(search, id, userId, options = {}) {
  const { topK } = options;
  const embeddings = await callToEmbed(search);
  const result = await searchQdrant(id, userId, embeddings, { topK });

  return result;
}

async function keywordSearch(
  search,
  pagesContent,
  inverted,
  fileMapping,
  options = {}
) {
  const { topK } = options;
  const scores = await searchContent_v2(pagesContent, inverted, search);
  const result = await searchBuildIndex_v2(scores, fileMapping);

  return result;
}

async function hybridSearch(
  parseId,
  userId,
  query,
  pagesContent,
  inverted,
  fileMapping,
  chunks,
  options = {}
) {
  const { topK = 10, k = 60 } = options;

  const analysis = analyzeQuery(query);

  console.log("\n🔍 QUERY ANALYSIS:");
  console.log(`  Original: "${query}"`);
  console.log(`  Content words: ${analysis.contentWords.join(", ")}`);
  console.log(`  Type: ${analysis.queryType.toUpperCase()}`);
  console.log(
    `  Weights: ${(analysis.semanticWeight * 100).toFixed(0)}% semantic, ${(
      analysis.keywordWeight * 100
    ).toFixed(0)}% keyword`
  );

  const keywordQuery = analysis.contentWords.join(" ") || query;

  const [keywordResultsRaw, semanticResultsRaw] = await Promise.all([
    keywordSearch(keywordQuery, pagesContent, inverted, fileMapping, {
      topK: topK * 2,
    }),
    semanticSearch(query, parseId, userId, { topK: topK * 2 }),
  ]);

  const keywordResults = await normalizeKeywordResults(
    keywordResultsRaw,
    chunks
  );
  const semanticResults = await normalizeSemanticResults(
    semanticResultsRaw,
    chunks
  );

  const keywordRanked = keywordResults
    .sort((a, b) => b.score - a.score)
    .map((result, index) => ({ ...result, rank: index }));

  const semanticRanked = semanticResults
    .sort((a, b) => b.score - a.score)
    .map((result, index) => ({ ...result, rank: index }));

  const rrfScores = new Map();

  if (analysis.queryType === "keyword" || analysis.queryType === "hybrid") {
    keywordRanked.forEach((result) => {
      const key = `${result.chunk_id}`;
      const rrfScore = analysis.keywordWeight * (1 / (k + result.rank));

      if (!rrfScores.has(key)) {
        rrfScores.set(key, {
          ...result,
          rrf_score: 0,
          keyword_rank: null,
          semantic_rank: null,
          keyword_score: null,
          semantic_score: null,
        });
      }

      const entry = rrfScores.get(key);
      entry.rrf_score += rrfScore;
      entry.keyword_rank = result.rank;
      entry.keyword_score = result.score;
      entry.keyword_weight = analysis.keywordWeight;
      entry.match_count = result.match_count;
      entry.rects = result.rects;
    });
  }

  if (analysis.queryType === "semantic" || analysis.queryType === "hybrid") {
    semanticRanked.forEach((result) => {
      const key = `${result.chunk_id}`;
      const rrfScore = analysis.semanticWeight * (1 / (k + result.rank));

      if (!rrfScores.has(key)) {
        rrfScores.set(key, {
          ...result,
          rrf_score: 0,
          keyword_rank: null,
          semantic_rank: null,
          keyword_score: null,
          semantic_score: null,
        });
      }

      const entry = rrfScores.get(key);
      entry.rrf_score += rrfScore;
      entry.semantic_rank = result.rank;
      entry.semantic_score = result.score;
      entry.semantic_weight = analysis.semanticWeight;
      entry.text = result.text;
    });
  }

  const mergedResults = Array.from(rrfScores.values())
    .sort((a, b) => b.rrf_score - a.rrf_score)
    .slice(0, topK);

  return [mergedResults, analysis.queryType];
}

async function callOverview(hybridSearchResults, search) {
  const context = hybridSearchResults
    .map((result, idx) => {
      return `SOURCE [${idx + 1}]: ${result.file_name} (Page ${
        result.page_number
      })
RELEVANCE: ${(result.rrf_score * 100).toFixed(1)}%
TEXT: ${result.text}`;
    })
    .join("\n\n---\n\n");

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

  return await callToOverview(messages);
}
