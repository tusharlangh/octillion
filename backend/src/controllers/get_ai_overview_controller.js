import { overview } from "../services/overview.js";
import {
  ValidationError,
  UnauthorizedError,
  AppError,
} from "../middleware/errorHandler.js";

export async function get_ai_overview_controller(req, res, next) {
  try {
    const { hybridSearchResults, search } = req.body;
    const userId = req.user;

    if (!userId) {
      throw new UnauthorizedError("Authorization required");
    }

    if (hybridSearchResults.length === 0) {
      throw new ValidationError("hybridSearchResults is required");
    }

    if (!search || !search.trim()) {
      throw new ValidationError("Search not found");
    }

    const overviewResult = await overview(hybridSearchResults, search, userId);

    if (!overviewResult.success) {
      throw new AppError(
        overviewResult.error || "Failed to process ai overview request",
        500,
        "AI_OVERVIEW_ERROR"
      );
    }

    return res.status(200).json({
      success: true,
      response: overviewResult.response,
      message: "Received ai overview response",
    });
  } catch (error) {
    next(error);
  }
}
