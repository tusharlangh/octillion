import { parse } from "../services/parse.js";

export async function file_parse_controller(req, res) {
  try {
    const { id, searchType, search, topK } = req.query;
    const userId = req.user;

    // Parse topK if provided, otherwise use default
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

    return res.json({
      success: parsed.success,
      searchResults: parsed.searchResults,
      error: parsed.error,
      metadata: parsed.metadata,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Failed to parse PDFs", detail: error?.message });
  }
}
