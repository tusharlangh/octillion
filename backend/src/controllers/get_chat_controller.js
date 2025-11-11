import { chat } from "../services/chat.js";

export async function get_chat_controller(req, res) {
  try {
    const { id, search } = req.query;
    const userId = req.user;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "parse_id (id) is required",
      });
    }

    if (!search || !search.trim()) {
      return res.status(400).json({
        success: false,
        error: "search query is required",
      });
    }

    const chatResult = await chat(id, search, userId);

    if (!chatResult.success) {
      return res.status(500).json({
        success: false,
        response: null,
        error: chatResult.error,
      });
    }

    return res.json({
      success: chatResult.success,
      response: chatResult.response,
      metadata: chatResult.metadata,
      error: null,
    });
  } catch (error) {
    console.error("Error in get_chat_controller:", error);
    return res.status(500).json({
      success: false,
      response: null,
      error: "Failed to process chat request",
    });
  }
}
