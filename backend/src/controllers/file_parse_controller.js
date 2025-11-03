import { parse } from "../services/parse.js";

export async function file_parse_controller(req, res) {
  try {
    const { id, searchType, search } = req.query;
    const userId = req.user;

    console.log(searchType);

    const parsed = await parse(id, search, userId, {
      searchMode: searchType === "enhanced" ? "semantic" : "tfidf",
    });

    return res.json({
      success: parsed.success,
      searchResults: parsed.searchResults,
      error: parsed.error,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Failed to parse PDFs", detail: error?.message });
  }
}
