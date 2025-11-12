import { parse } from "../services/parse.js";
import {
  ValidationError,
  UnauthorizedError,
  AppError,
} from "../middleware/errorHandler.js";

export async function file_parse_controller(req, res, next) {
  try {
    const { id, searchType, search, topK } = req.query;
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

    if (!searchType || !searchType.trim()) {
      throw ValidationError("SearchType not found");
    }

    const topKNum = topK ? parseInt(topK, 10) : undefined;

    const parsed = await parse(id, search, userId, {
      searchMode:
        searchType === "enhanced"
          ? "semantic"
          : searchType === "hybrid"
          ? "hybrid"
          : "tfidf",
      topK: topKNum,
    });

    if (!parsed.success) {
      throw new AppError(
        parsed.error || "Failed to process parsing",
        500,
        "PARSE_ERROR"
      );
    }

    return res.status(200).json({
      success: true,
      data: {
        searchResults: parsed.searchResults,
        metadata: parsed.metadata,
      },
      message: "Successfully parsed results",
    });
  } catch (error) {
    next(error);
  }
}
