import dotenv from "dotenv";
import { AppError } from "../middleware/errorHandler.js";
import supabase from "../utils/supabase/client.js";

dotenv.config();

export async function saveFiles(id, keys, userId) {
  try {
    const { data, error } = await supabase.from("files_job").insert([
      {
        user_id: userId,
        parse_id: id,
        file_jobs: [
          {
            status: "processing",
            keys: keys,
          },
        ],
      },
    ]);

    if (error) {
      throw new AppError(
        `Failed to save files: ${error.message}`,
        500,
        "SUPABASE_ERROR"
      );
    }

    return { success: true };
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }

    throw new AppError(
      `Failed to save files: ${error.message}`,
      500,
      "SAVE_FILES_ERROR"
    );
  }
}
