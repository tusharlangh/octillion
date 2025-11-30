import { AppError } from "../middleware/errorHandler.js";
import supabase from "../utils/supabase/client.js";

export async function parseStatus(parseId, userId) {
  try {
    const { data, error } = await supabase
      .from("files_job")
      .select("file_jobs")
      .eq("parse_id", parseId)
      .eq("user_id", userId)
      .single();

    if (error) {
      throw new AppError(
        `Failed to get parse status: ${error.message}`,
        500,
        "SUPABASE_ERROR"
      );
    }

    if (!data) {
      throw new AppError("Parse job not found", 404, "JOB_NOT_FOUND");
    }

    const status = data.file_jobs[0]?.status || "PROCESSING";

    return {
      success: true,
      data: {
        status: status,
        parseId: parseId,
      },
    };
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }

    throw new AppError(
      `Failed to get parse status: ${error.message}`,
      500,
      "PARSE_STATUS_FAILED"
    );
  }
}
