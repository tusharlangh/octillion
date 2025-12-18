import dotenv from "dotenv";
import { AppError } from "../middleware/errorHandler.js";
import supabase from "../utils/supabase/client.js";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { processFiles } from "./processFiles.js";

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
            status: "PROCESSING",
            keys: keys,
          },
        ],
      },
    ]);

    const { data1, error1 } = await supabase.from("files").insert([
      {
        user_id: userId,
        parse_id: id,
        files: [
          {
            key: "testing",
            file_name: "Untitled",
            file_type: "PDF",
            status: "PROCESSING",
          },
        ],
      },
    ]);

    if (error || error1) {
      throw new AppError(
        `Failed to save files: ${error.message}`,
        500,
        "SUPABASE_ERROR"
      );
    }
    console.log(process.env.NODE_ENV);

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
  if (process.env.NODE_ENV === "development") {
    setImmediate(async () => {
      try {
        await processFiles(id, keys, userId);
      } catch (error) {
        console.error("Background processing error:", error);
      }
    });

    return { status: "queued" };
  }

  const params = {
    FunctionName: process.env.WORKER_FUNCTION_NAME,
    InvocationType: "Event",
    Payload: JSON.stringify({ id, keys, userId }),
  };
  const command = new InvokeCommand(params);

  await lambda.send(command);
  
  console.log(`✅ Lambda worker invoked successfully for parse_id: ${id} - Processing ${keys.length} files`);

  return { status: "queued" };
}
