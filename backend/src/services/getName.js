import supabase from "../utils/supabase/client.js";
import { AppError } from "../middleware/errorHandler.js";
import { retry } from "../utils/retry.js";

export async function getName(userId) {
  try {
    if (!userId) {
      throw new AppError("User ID is required", 400, "USER_ID_ERROR");
    }

    const result = await retry(
      async () => {
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

        return user;
      },
      {
        maxRetries: 3,
        delay: 1000,
        backoff: 2,
        onRetry: (error, attempt) => {
          console.warn(
            `getName: retry attempt ${attempt}/3 for userId: ${userId}, error is: ${error}`
          );
        },
      }
    );

    return { success: true, name: result?.user_metadata?.name || null };
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }

    console.error("Unexpected error in getPfp:", error);
    throw new AppError(
      `Failed to retrieve name: ${error.message || "Unknown error"}`,
      500,
      "GET_NAME_ERROR"
    );
  }
}
