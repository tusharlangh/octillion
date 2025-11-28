import { AppError } from "../middleware/errorHandler.js";
import { processFiles } from "../services/processFiles.js";
import supabase from "../utils/supabase/client.js";

export const handler = async (event) => {
  const { id, keys, userId } = event;

  try {
    try {
      await processFiles(id, keys, userId);
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }

      throw new AppError(
        `Something went wrong in the function processFiles`,
        500,
        "FN_PROCESSFILES_FAILED"
      );
    }

    await supabase
      .from("files")
      .update({ status: "COMPLETED" })
      .eq("parse_id", id);

    return { success: true };
  } catch (error) {
    await supabase
      .from("files")
      .update({
        status: "FAILED",
        error_message: error.message,
      })
      .eq("parse_id", id);

    if (error.isOperational) {
      throw error;
    }

    throw new AppError(
      `Processing of the file failed`,
      500,
      "PROCESS_FILES_FAILED"
    );
  }
};
