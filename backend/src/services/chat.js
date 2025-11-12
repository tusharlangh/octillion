import supabase from "../utils/supabase/client.js";
import { parse } from "./parse.js";
import { callToChat } from "../utils/openAi/callToChat.js";
import { AppError, ValidationError } from "../middleware/errorHandler.js";

function extractPageNumber(pageId) {
  try {
    const parts = pageId.split(".");
    if (parts.length < 2 || !parts[1]) {
      throw new AppError(
        "Invalid pageId format",
        500,
        "INVALID_PAGE_ID_FORMAT"
      );
    }

    return parts[1];
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError(
      `Failed to extract page number: ${error.message}`,
      500,
      "EXTRACT_PAGE_NUMBER_ERROR"
    );
  }
}

async function classifyQuery(query) {
  try {
    if (!query || typeof query !== "string" || !query.trim()) {
      throw new ValidationError("Query is required");
    }

    const directQueryPatterns = [
      /^(give me|provide|show me|tell me).*(summary|summarize|overview|overview of|summary of)/i,
      /^(what is|what's).*(this document|this file|this).*(about|contain)/i,
      /^(summarize|summary|overview|explain this document|what are the key takeaways)/i,
      /^(can you|could you).*(summarize|give.*summary|provide.*summary)/i,
      /^(what does|what do).*(this|the document).*(contain|cover|discuss)/i,
    ];

    for (const pattern of directQueryPatterns) {
      if (pattern.test(query)) {
        return "direct";
      }
    }

    const classificationPrompt = `Classify the following user query into one of two categories:

1. "search" - The query requires searching through specific documents to find information (e.g., "What is the budget for Q3?", "Find mentions of marketing strategy", "What does the document say about X?", "When was project Y completed?")

2. "direct" - The query is a general question, request for summary/overview, or can be answered using the full document context without targeted search (e.g., "Give me a summary", "What is this document about?", "Summarize the main points", "Explain this document", "What are the key takeaways?", "What topics are covered?")

User query: "${query}"

Respond with ONLY one word: either "search" or "direct".`;

    const messages = [
      {
        role: "system",
        content:
          "You are a query classification assistant. Respond with only one word: 'search' or 'direct'.",
      },
      {
        role: "user",
        content: classificationPrompt,
      },
    ];

    let response;
    try {
      response = await callToChat(messages, "gpt-4o-mini", 0.1, 10);
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw new AppError(
        `Failed to classify query: ${error.message}`,
        500,
        "CLASSIFY_QUERY_ERROR"
      );
    }

    if (!response) {
      throw new AppError(
        "Invalid classification response",
        500,
        "INVALID_CLASSIFICATION_RESPONSE"
      );
    }

    const classification = response.trim().toLowerCase();
    return classification === "direct" ? "direct" : "search";
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError(
      `Failed to classify query: ${error.message}`,
      500,
      "CLASSIFY_QUERY_ERROR"
    );
  }
}

function buildContext(searchResults, pagesContent) {
  try {
    if (!searchResults || searchResults.length === 0) {
      throw new AppError(
        "Search results are empty",
        500,
        "EMPTY_SEARCH_RESULTS"
      );
    }

    if (!pagesContent) {
      throw new AppError(
        "Pages content is invalid",
        500,
        "INVALID_PAGES_CONTENT"
      );
    }

    const pageMap = new Map();

    for (const result of searchResults) {
      if (!result || !result.pageId) {
        continue;
      }

      if (!pageMap.has(result.pageId)) {
        try {
          pageMap.set(result.pageId, {
            pageId: result.pageId,
            fileName: result.file_name || "Unknown",
            pageNumber: extractPageNumber(result.pageId),
            sentences: [],
          });
        } catch (error) {
          continue;
        }
      }

      if (
        result.sentence &&
        !pageMap.get(result.pageId).sentences.includes(result.sentence)
      ) {
        pageMap.get(result.pageId).sentences.push(result.sentence);
      }
    }

    if (pageMap.size === 0) {
      throw new AppError(
        "No valid pages found in search results",
        500,
        "NO_VALID_PAGES"
      );
    }

    const contextParts = [];

    for (const [pageId, pageData] of pageMap) {
      const page = pagesContent.find((p) => p && p.id === pageId);
      const pageRef = `[${pageData.fileName}, Page ${pageData.pageNumber}]`;

      if (page && page.site_content) {
        contextParts.push(`${pageRef}\n${page.site_content}`);
      } else if (pageData.sentences.length > 0) {
        contextParts.push(`${pageRef}\n${pageData.sentences.join(" ")}`);
      }
    }

    if (contextParts.length === 0) {
      throw new AppError(
        "No context content available",
        500,
        "NO_CONTEXT_CONTENT"
      );
    }

    return contextParts.join("\n\n");
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError(
      `Failed to build context: ${error.message}`,
      500,
      "BUILD_CONTEXT_ERROR"
    );
  }
}

function buildFullContext(pagesContent) {
  try {
    if (!pagesContent || pagesContent.length === 0) {
      throw new AppError("Pages content is empty", 500, "EMPTY_PAGES_CONTENT");
    }

    const contextParts = [];

    for (const page of pagesContent) {
      if (!page || !page.id) {
        continue;
      }

      try {
        const fileName = page.file_name || "Document";
        const pageNumber = extractPageNumber(page.id);
        const pageRef = `[${fileName}, Page ${pageNumber}]`;

        if (page.site_content) {
          contextParts.push(`${pageRef}\n${page.site_content}`);
        }
      } catch (error) {
        continue;
      }
    }

    if (contextParts.length === 0) {
      throw new AppError(
        "No document content found",
        500,
        "NO_DOCUMENT_CONTENT"
      );
    }

    return contextParts.join("\n\n");
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError(
      `Failed to build full context: ${error.message}`,
      500,
      "BUILD_FULL_CONTEXT_ERROR"
    );
  }
}

function createSystemPrompt(queryType = "search") {
  try {
    if (!queryType || typeof queryType !== "string") {
      throw new AppError("Invalid query type", 500, "INVALID_QUERY_TYPE");
    }

    if (queryType === "direct") {
      return `You are a helpful document assistant that provides comprehensive answers based on the full document context.

Core Rules:
- Provide thorough, well-structured answers based on all provided document content
- For summaries, include key points, main themes, and important details
- Cite sources when providing specific information: [Document Name, Page X]
- Organize information clearly and logically
- If the document doesn't contain relevant information, state that clearly

Response Quality:
- For summaries: Provide a comprehensive overview covering main topics and key insights
- For general questions: Answer based on the document content in a clear, informative manner
- Match the level of detail to the question asked
- Use proper formatting (bullets, paragraphs) for readability

**Formatting Requirements:**
- Use **bold** for emphasis on key terms or important concepts
- Use bullet points (-) for lists
- Use ## for section headers when appropriate
- Use \`code\` for technical terms, file paths, or specific values
- Use > for block quotes when citing longer passages
- Format numbers and data clearly

Example response:
"## Summary
Based on the document [Document.pdf, Page 1-5], the main topics covered are:
- **Topic 1**: Description with key details
- **Topic 2**: Another important point
- **Topic 3**: Additional information

The document emphasizes **key concept** and provides data showing \`42% increase\`."`;
    }

    return `You are a precise document assistant. Answer questions using only the provided context.

Core Rules:
- Give direct answers without preamble
- Cite every factual claim: [Document Name, Page X]
- If information is missing or unclear, say "Not found in provided documents" and explain what's missing
- For ambiguous questions, briefly clarify what you're interpreting before answering

Response Quality:
- Match detail level to question complexity (brief for simple, thorough for complex)
- Quote key phrases when exact wording matters
- If multiple documents conflict, note the discrepancy and cite both
- For numerical data, include units and context

**Formatting Requirements:**
- Use **bold** for emphasis on key findings, numbers, or critical terms
- Use bullet points (-) for multiple items or comparisons
- Use \`backticks\` for specific values, amounts, or technical terms
- Use ## for headers only when answering complex multi-part questions
- Keep formatting clean and purposeful - don't over-format

Avoid:
- Speculation beyond the documents
- Combining information to create new claims
- Apologetic language ("unfortunately," "I'm afraid")

Example response:
"The Q3 budget allocated **$50K** to marketing [Budget-2024.pdf, Page 5], representing a **15% increase** from Q2 [Financial-Summary.xlsx, Sheet 2].

Key changes:
- Marketing: \`$50K\` (+15%)
- Operations: \`$120K\` (+5%)
- R&D: \`$80K\` (unchanged)"`;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError(
      `Failed to create system prompt: ${error.message}`,
      500,
      "CREATE_SYSTEM_PROMPT_ERROR"
    );
  }
}

export async function chat(id, search, userId) {
  try {
    if (!id || typeof id !== "string") {
      throw new ValidationError("Parse ID is required");
    }

    if (!search || typeof search !== "string" || !search.trim()) {
      throw new ValidationError("Search query is required");
    }

    if (!userId || typeof userId !== "string") {
      throw new ValidationError("User ID is required");
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
      throw new AppError(
        "No files found for the given parse ID",
        404,
        "NO_FILES_FOUND"
      );
    }

    const fileData = data[0];

    if (!fileData) {
      throw new AppError("Invalid file data", 500, "INVALID_FILE_DATA");
    }

    const pagesContent = fileData.pages_metadata;

    if (!pagesContent || pagesContent.length === 0) {
      throw new AppError(
        "Pages metadata is empty",
        500,
        "EMPTY_PAGES_METADATA"
      );
    }

    let queryType;
    try {
      queryType = await classifyQuery(search);
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw new AppError(
        `Failed to classify query: ${error.message}`,
        500,
        "CLASSIFY_QUERY_ERROR"
      );
    }

    if (!queryType || (queryType !== "direct" && queryType !== "search")) {
      throw new AppError("Invalid query type", 500, "INVALID_QUERY_TYPE");
    }

    let context;

    if (queryType === "direct") {
      try {
        context = buildFullContext(pagesContent);
      } catch (error) {
        if (error.isOperational) {
          throw error;
        }
        throw new AppError(
          `Failed to build full context: ${error.message}`,
          500,
          "BUILD_FULL_CONTEXT_ERROR"
        );
      }
    } else {
      let searchResults;
      try {
        searchResults = await parse(id, search, userId, {
          searchMode: "hybrid",
          topK: 7,
        });
      } catch (error) {
        if (error.isOperational) {
          throw error;
        }
        throw new AppError(
          `Failed to parse search: ${error.message}`,
          500,
          "PARSE_SEARCH_ERROR"
        );
      }

      if (
        !searchResults ||
        !searchResults.success ||
        !searchResults.searchResults ||
        searchResults.searchResults.length === 0
      ) {
        throw new AppError("No search results found", 404, "NO_SEARCH_RESULTS");
      }

      const uniquePageIds = new Set();
      for (const result of searchResults.searchResults) {
        if (result && result.pageId) {
          uniquePageIds.add(result.pageId);
        }
      }

      if (uniquePageIds.size === 0) {
        throw new AppError(
          "No valid page IDs in search results",
          500,
          "NO_VALID_PAGE_IDS"
        );
      }

      const matchedPages = pagesContent.filter(
        (page) => page && page.id && uniquePageIds.has(page.id)
      );

      if (matchedPages.length === 0) {
        throw new AppError("No matching pages found", 404, "NO_MATCHING_PAGES");
      }

      try {
        context = buildContext(searchResults.searchResults, matchedPages);
      } catch (error) {
        if (error.isOperational) {
          throw error;
        }
        throw new AppError(
          `Failed to build context: ${error.message}`,
          500,
          "BUILD_CONTEXT_ERROR"
        );
      }
    }

    if (!context || typeof context !== "string" || !context.trim()) {
      throw new AppError(
        "Failed to generate context",
        500,
        "CONTEXT_GENERATION_ERROR"
      );
    }

    const messages = [
      {
        role: "system",
        content: createSystemPrompt(queryType),
      },
      {
        role: "user",
        content: `Context:\n${context}\n\nQ: ${search}`,
      },
    ];

    const temperature = queryType === "direct" ? 0.4 : 0.3;
    const maxTokens = queryType === "direct" ? 1200 : 800;

    let aiResponse;
    try {
      aiResponse = await callToChat(
        messages,
        "gpt-4o-mini",
        temperature,
        maxTokens
      );
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw new AppError(
        `Failed to get AI response: ${error.message}`,
        500,
        "AI_RESPONSE_ERROR"
      );
    }

    if (!aiResponse || typeof aiResponse !== "string") {
      throw new AppError("Invalid AI response", 500, "INVALID_AI_RESPONSE");
    }

    return {
      success: true,
      response: aiResponse,
    };
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError(`Chat error: ${error.message}`, 500, "CHAT_ERROR");
  }
}
