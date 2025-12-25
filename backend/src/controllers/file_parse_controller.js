import { parse, parse_v2 } from "../services/parse.js";
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
      throw new UnauthorizedError("Authorization required");
    }

    if (!id) {
      throw new ValidationError("Id is required");
    }

    if (!search || !search.trim()) {
      throw new ValidationError("Search not found");
    }

    if (!searchType || !searchType.trim()) {
      throw new ValidationError("SearchType not found");
    }

    const topKNum = topK ? parseInt(topK, 10) : undefined;

    const parsed = await parse_v2(id, search, userId, {
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
      result: parsed.result,
      fileMapping: parsed.fileMapping,
      message: "Successfully parsed results",
    });
  } catch (error) {
    next(error);
  }
}
