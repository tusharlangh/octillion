import supabase from "../utils/supabase/client.js";
import { AppError } from "../middleware/errorHandler.js";

export async function getPfp(userId) {
  try {
    if (!userId) {
      throw new AppError("User ID is required", 400, "USER_ID_ERROR");
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.admin.getUserById(userId);

    if (error) {
      throw new AppError(
        `Failed to fetch files: ${error.message}`,
        500,
        "SUPABASE_ERROR"
      );
    }

    if (!data || data.length === 0) {
      return { pfp: null, success: true };
    }

    return { success: true, pfp: user?.user_metadata?.picture || null };
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }

    console.error("Unexpected error in getViewFiles:", error);
    throw new AppError(
      `Failed to retrieve view files: ${error.message || "Unknown error"}`,
      500,
      "GET_VIEW_FILES_ERROR"
    );
  }
}
