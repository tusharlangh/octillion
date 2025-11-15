import supabase from "../../utils/supabase/client.js";
import { AppError } from "../../middleware/errorHandler.js";

export async function saveFilesRecord({
  id,
  userId,
  keys,
  buildIndex,
  invertedIndex,
  pagesContent,
}) {
  const { data, error } = await supabase.from("files").insert([
    {
      user_id: userId,
      parse_id: id,
      files: keys,
      build_index: buildIndex,
      inverted_index: invertedIndex,
      pages_metadata: pagesContent,
    },
  ]);

  if (error) {
    throw new AppError(
      `Failed to save files: ${error.message}`,
      500,
      "SUPABASE_ERROR"
    );
  }

  return data;
}
