import { chat } from "../services/chat.js";
import {
  ValidationError,
  UnauthorizedError,
  AppError,
} from "../middleware/errorHandler.js";

export async function get_chat_controller(req, res, next) {
  try {
    const { id, search } = req.query;
    const userId = req.user;

    if (!userId) {
      throw UnauthorizedError("Authorization required");
    }

    if (!id) {
      throw ValidationError("Id is required");
    }

    if (!search || !search.trim()) {
      throw ValidationError("Search not found");
    }

    const chatResult = await chat(id, search, userId);

    if (!chatResult.success) {
      throw new AppError(
        chatResult.error || "Failed to process chat request",
        500,
        "CHAT_ERROR"
      );
    }

    return res.status(200).json({
      success: true,
      data: {
        response: chatResult.response,
        metadata: chatResult.metadata,
      },
      message: "Received chat response",
    });
  } catch (error) {
    next(error);
  }
}
