import { callToChat } from "../utils/callsAi/callToChat.js";
import { AppError, ValidationError } from "../middleware/errorHandler.js";
import { createSystemPrompt } from "./chat/systemPrompt.js";
import { parse_v2 } from "./parse.js";
import { buildContext } from "./chat/contextBuilder.js";
import {
  trackChatMetrics,
  trackRAGRetrieval,
} from "../utils/processMetrics.js";

export async function chat(id, search, userId) {
  const chatStartTime = Date.now();
  let searchLatency = 0;
  let contextBuildLatency = 0;
  let llmLatency = 0;

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

    const searchStartTime = Date.now();
    const parsedResult = await parse_v2(id, search, userId);
    searchLatency = Date.now() - searchStartTime;

    if (!parsedResult.success) {
      throw new AppError("failed to generate parsedResult");
    }

    const hybridResults = parsedResult.result;

    if (hybridResults.length === 0) {
      throw new AppError("Hybrid results are empty");
    }

    const scores = hybridResults.map((r) => r.rrf_score || 0);
    const avgScore =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const topScore = Math.max(...scores);

    const contextBuildStartTime = Date.now();
    const context = buildContext(hybridResults);
    contextBuildLatency = Date.now() - contextBuildStartTime;

    if (!context || typeof context !== "string" || !context.trim()) {
      throw new AppError(
        "Failed to generate context",
        500,
        "CONTEXT_GENERATION_ERROR"
      );
    }

    trackRAGRetrieval({
      userId,
      parseId: id,
      query: search,
      retrievedChunks: hybridResults.length,
      avgRelevanceScore: avgScore,
      topScore: topScore,
      contextLength: context.length,
      retrievalLatency: searchLatency + contextBuildLatency,
    });

    const messages = [
      {
        role: "system",
        content: createSystemPrompt(),
      },
      {
        role: "user",
        content: `Context:\n${context}\n\nQ: ${search}`,
      },
    ];

    let aiResponse;
    const llmStartTime = Date.now();
    try {
      aiResponse = await callToChat(
        messages,
        "llama-3.3-70b-versatile",
        0.7,
        1000,
        userId
      );
      llmLatency = Date.now() - llmStartTime;
    } catch (error) {
      llmLatency = Date.now() - llmStartTime;
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

    const totalLatency = Date.now() - chatStartTime;

    trackChatMetrics({
      userId,
      parseId: id,
      query: search,
      queryLength: search.length,
      totalLatency,
      searchLatency,
      contextBuildLatency,
      llmLatency,
      contextLength: context.length,
      contextChunkCount: hybridResults.length,
      responseLength: aiResponse.length,
      modelUsed: "llama-3.3-70b-versatile",
      success: true,
      errorMessage: null,
    });

    return {
      success: true,
      response: aiResponse,
    };
  } catch (error) {
    const totalLatency = Date.now() - chatStartTime;

    trackChatMetrics({
      userId,
      parseId: id,
      query: search,
      queryLength: search.length,
      totalLatency,
      searchLatency,
      contextBuildLatency,
      llmLatency,
      contextLength: 0,
      contextChunkCount: 0,
      responseLength: 0,
      modelUsed: "llama-3.3-70b-versatile",
      success: false,
      errorMessage: error.message,
    });

    if (error.isOperational) {
      throw error;
    }
    throw new AppError(`Chat error: ${error.message}`, 500, "CHAT_ERROR");
  }
}
