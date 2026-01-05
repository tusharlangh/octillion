import supabase from "../../utils/supabase/client.js";
import { AppError } from "../../middleware/errorHandler.js";
import pRetry from "p-retry";

export async function saveFilesRecord(
  id,
  userId,
  keys,
  invertedIndex,
  pagesContent,
  chunks
) {
  const data = await pRetry(
    async () => {
      const { data: filesData, error: filesError } = await supabase
        .from("files")
        .update({
          files: keys,
          inverted_index: invertedIndex,
          pages_metadata: pagesContent,
          chunks_metadata: chunks,
        })
        .eq("parse_id", id)
        .eq("user_id", userId);

      if (filesError) {
        throw filesError;
      }

      const { data: jobData, error: jobError } = await supabase
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

      if (jobError) {
        throw jobError;
      }

      return filesData;
    },
    {
      retries: 3,
      minTimeout: 1000,
      onFailedAttempt: (error) => {
        console.warn(
          `Supabase operation attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`
        );
      },
    }
  );

  return data;
}
