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

    return { success: true };
  } catch (error) {
    await supabase
      .from("files_job")
      .update({
        file_jobs: [
          {
            status: "failed",
            keys: keys,
          },
        ],
      })
      .eq("parse_id", id)
      .eq("user_id", userId);

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
