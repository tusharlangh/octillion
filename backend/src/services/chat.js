import { callToChat } from "../utils/callsAi/callToChat.js";
import { AppError, ValidationError } from "../middleware/errorHandler.js";
import { createSystemPrompt } from "./chat/systemPrompt.js";
import { parse_v2 } from "./parse.js";
import { buildContext } from "./chat/contextBuilder.js";

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

    const parsedResult = await parse_v2(id, search, userId);

    if (!parsedResult.success) {
      throw new AppError("failed to generate parsedResult");
    }

    const hybridResults = parsedResult.result;

    if (hybridResults.length === 0) {
      throw new AppError("Hybrid results are empty");
    }

    const context = buildContext(hybridResults);

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
        content: createSystemPrompt(),
      },
      {
        role: "user",
        content: `Context:\n${context}\n\nQ: ${search}`,
      },
    ];

    let aiResponse;
    try {
      aiResponse = await callToChat(messages);
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
