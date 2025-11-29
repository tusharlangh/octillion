import dotenv from "dotenv";
import { AppError } from "../middleware/errorHandler.js";
import supabase from "../utils/supabase/client.js";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

dotenv.config();

const lambda = new LambdaClient({ region: process.env.AWS_REGION });

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

    await triggerAsyncProcessing(id, keys, userId);

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

async function triggerAsyncProcessing(id, keys, userId) {
  const params = {
    FunctionName: process.env.WORKER_FUNCTION_NAME,
    InvocationType: "Event",
    Payload: JSON.stringify({ id, keys, userId }),
  };
  const command = new InvokeCommand(params);

  await lambda.send(command);

  return { status: "queued" };
}
