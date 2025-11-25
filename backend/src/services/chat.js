import supabase from "../utils/supabase/client.js";
import { parse } from "./parse.js";
import { callToChat } from "../utils/openAi/callToChat.js";
import { AppError, ValidationError } from "../middleware/errorHandler.js";
import { classifyQuery } from "./chat/queryClassifier.js";
import { buildContext, buildFullContext } from "./chat/contextBuilder.js";
import { createSystemPrompt } from "./chat/systemPrompt.js";
import { getJsonFromS3 } from "./saveFiles/upload.js";

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

    let pagesContent = fileData.pages_metadata;

    if (pagesContent && pagesContent.s3Key) {
      pagesContent = await getJsonFromS3(pagesContent.s3Key);
    }

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

    console.log("here is the ai response: ", aiResponse);

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
