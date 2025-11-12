import supabase from "../utils/supabase/client.js";
import { parse } from "./parse.js";
import { callToChat } from "../utils/openAi/callToChat.js";

function extractPageNumber(pageId) {
  const parts = pageId.split(".");
  return parts[1];
}

async function classifyQuery(query) {
  try {
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

    const response = await callToChat(messages, "gpt-4o-mini", 0.1, 10);
    const classification = response.trim().toLowerCase();

    return classification === "direct" ? "direct" : "search";
  } catch (error) {
    console.error("Error classifying query, defaulting to search:", error);
    return "search";
  }
}

function buildContext(searchResults, pagesContent) {
  if (!searchResults || searchResults.length === 0) {
    return "No relevant content found.";
  }

  const pageMap = new Map();

  for (const result of searchResults) {
    if (!pageMap.has(result.pageId)) {
      pageMap.set(result.pageId, {
        pageId: result.pageId,
        fileName: result.file_name,
        pageNumber: extractPageNumber(result.pageId),
        sentences: [],
      });
    }

    if (!pageMap.get(result.pageId).sentences.includes(result.sentence)) {
      pageMap.get(result.pageId).sentences.push(result.sentence);
    }
  }

  const contextParts = [];

  for (const [pageId, pageData] of pageMap) {
    const page = pagesContent.find((p) => p.id === pageId);
    const pageRef = `[${pageData.fileName}, Page ${pageData.pageNumber}]`;

    if (page) {
      const content = page.site_content;
      contextParts.push(`${pageRef}\n${content}`);
    } else {
      contextParts.push(`${pageRef}\n${pageData.sentences.join(" ")}`);
    }
  }

  return contextParts.join("\n\n");
}

function buildFullContext(pagesContent) {
  if (!pagesContent || pagesContent.length === 0) {
    return "No document content found.";
  }

  const contextParts = [];

  for (const page of pagesContent) {
    const fileName = page.file_name || "Document";
    const pageNumber = extractPageNumber(page.id);
    const pageRef = `[${fileName}, Page ${pageNumber}]`;

    if (page.site_content) {
      contextParts.push(`${pageRef}\n${page.site_content}`);
    }
  }

  return contextParts.join("\n\n");
}

function createSystemPrompt(queryType = "search") {
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
}

export async function chat(id, search, userId) {
  try {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("user_id", userId)
      .eq("parse_id", id);

    if (error) {
      return {
        success: false,
        response: null,
        error: `Failed to extract files: ${error.message}`,
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        response: null,
        error: "No files found for the given ID",
      };
    }

    const fileData = data[0];
    const pagesContent = fileData.pages_metadata;

    if (!pagesContent || pagesContent.length === 0) {
      return {
        success: false,
        response: null,
        error: "No pages found in the document",
      };
    }

    const queryType = await classifyQuery(search);
    let context;
    let sources = [];
    let searchResultsCount = 0;
    let pagesUsed = 0;

    if (queryType === "direct") {
      context = buildFullContext(pagesContent);
      pagesUsed = pagesContent.length;

      const sourcesMap = new Map();
      for (const page of pagesContent) {
        const fileName = page.file_name || "Document";
        if (!sourcesMap.has(fileName)) {
          sourcesMap.set(fileName, {
            id: page.id,
            name: fileName,
            pageId: page.id,
          });
        }
      }
      sources = Array.from(sourcesMap.values());
    } else {
      const searchResults = await parse(id, search, userId, {
        searchMode: "hybrid",
        topK: 7,
      });

      if (
        !searchResults.success ||
        !searchResults.searchResults ||
        searchResults.searchResults.length === 0
      ) {
        return {
          success: false,
          response: null,
          error: searchResults.error || "No search results found",
        };
      }

      const uniquePageIds = new Set();
      for (const result of searchResults.searchResults) {
        uniquePageIds.add(result.pageId);
      }

      const matchedPages = pagesContent.filter((page) =>
        uniquePageIds.has(page.id)
      );

      context = buildContext(searchResults.searchResults, matchedPages);
      pagesUsed = matchedPages.length;
      searchResultsCount = searchResults.searchResults.length;

      const sourcesMap = new Map();
      for (const result of searchResults.searchResults) {
        if (!sourcesMap.has(result.file_name)) {
          sourcesMap.set(result.file_name, {
            id: result.pageId,
            name: result.file_name,
            pageId: result.pageId,
          });
        }
      }
      sources = Array.from(sourcesMap.values());
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

    const aiResponse = await callToChat(
      messages,
      "gpt-4o-mini",
      temperature,
      maxTokens
    );

    return {
      success: true,
      response: aiResponse,
      error: null,
      metadata: {
        sources: sources,
        searchResultsCount: searchResultsCount,
        pagesUsed: pagesUsed,
        queryType: queryType,
      },
    };
  } catch (error) {
    console.error("Error in chat function:", error);
    return {
      success: false,
      response: null,
      error: error.message || "An unexpected error occurred",
    };
  }
}
