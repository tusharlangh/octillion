import supabase from "../../utils/supabase/client.js";
import { AppError } from "../../middleware/errorHandler.js";

export async function saveFilesRecord(
  id,
  userId,
  keys,
  invertedIndex,
  pagesContent,
  chunks
) {
  const { data, error } = await supabase
    .from("files")
    .update({
      files: keys,
      inverted_index: invertedIndex,
      pages_metadata: pagesContent,
      chunks_metadata: chunks,
    })
    .eq("parse_id", id)
    .eq("user_id", userId);

  const { data1, error1 } = await supabase
    .from("files_job")
    .update({
      file_jobs: [
        {
          status: "PROCESSED",
          keys: keys,
        },
      ],
    })
    .eq("parse_id", id)
    .eq("user_id", userId);

  if (error || error1) {
    throw new AppError(
      `Failed to save files: ${error.message}`,
      500,
      "SUPABASE_ERROR"
    );
  }

  if (error) {
    throw new AppError(
      `Failed to save files: ${error.message}`,
      500,
      "SUPABASE_ERROR"
    );
  }

  return data;
}
