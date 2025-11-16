import { callToChat } from "../../utils/openAi/callToChat.js";
import { AppError, ValidationError } from "../../middleware/errorHandler.js";

export async function classifyQuery(query) {
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
    console.log(classification === "direct" ? "direct" : "search");
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


