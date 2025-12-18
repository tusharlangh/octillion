import { processFiles } from "../services/processFiles.js";
import supabase from "../utils/supabase/client.js";

export const handler = async (event) => {
  const { id, keys, userId } = event;
  const startTime = Date.now();

  console.log(`🚀 Lambda processor started for parse_id: ${id}`, {
    userId,
    fileCount: keys?.length || 0,
    keys: keys?.slice(0, 3),
    timestamp: new Date().toISOString(),
  });

  try {
    await processFiles(id, keys, userId);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Lambda processor succeeded for parse_id: ${id}`, {
      duration: `${duration}s`,
      fileCount: keys?.length || 0,
    });

    return {
      success: true,
      parse_id: id,
      duration: `${duration}s`,
    };
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.error(`❌ Lambda processor failed for parse_id: ${id}`, {
      error: error.message,
      errorCode: error.code || error.name,
      errorType: error.isOperational ? "Operational" : "Unexpected",
      duration: `${duration}s`,
      fileCount: keys?.length || 0,
      stack: error.stack,
    });

    try {
      const { error: updateError } = await supabase
        .from("files_job")
        .update({
          file_jobs: [
            {
              status: "FAILED",
              keys: keys,
              error_message: error.message || "Unknown error",
              error_code: error.code || error.name || "UNKNOWN_ERROR",
              failed_at: new Date().toISOString(),
            },
          ],
        })
        .eq("parse_id", id)
        .eq("user_id", userId);

      if (updateError) {
        console.error(
          `⚠️ Failed to update database with error status for parse_id: ${id}`,
          {
            updateError: updateError.message,
          }
        );
      } else {
        console.log(
          `📝 Database updated with FAILED status for parse_id: ${id}`
        );
      }
    } catch (dbError) {
      console.error(
        `⚠️ Exception while updating database for parse_id: ${id}`,
        {
          dbError: dbError.message,
        }
      );
    }

    return {
      success: false,
      parse_id: id,
      error: error.message,
      errorCode: error.code || error.name,
      duration: `${duration}s`,
    };
  }
};
