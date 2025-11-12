import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import supabase from "../utils/supabase/client.js";
import dotenv from "dotenv";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../utils/aws/s3Client.js";
import { AppError, NotFoundError } from "../middleware/errorHandler.js";

dotenv.config();

export async function getFiles(id, userId) {
  try {
    if (!userId) {
      throw new AppError("User ID is required", 400, "USER_ID_ERROR");
    }

    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("user_id", userId)
      .eq("parse_id", id);

    if (error) {
      throw new AppError(
        `Failed to fetch files: ${error.message}`,
        500,
        "SUPABASE_ERROR"
      );
    }

    if (!data || data.length === 0) {
      return { data: [], success: true };
    }

    let links = data.map((row) => row.files);

    links = links[0];

    const urls = [];

    for (let i = 0; i < links.length; i++) {
      const link = links[i];

      if (!link) {
        console.warn(`Skipping invalid link ${link} for file ${links}`);
        continue;
      }
      try {
        const command = new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: link.key,
        });

        const url = await getSignedUrl(s3, command, {
          expiresIn: 60 * 60 * 24 * 1, //1 day
        });

        urls.push({
          file_name: link.file_name,
          file_type: link.mimetype,
          presignedUrl: url,
        });
      } catch (s3Error) {
        const errorCode = s3Error?.$metadata?.httpStatusCode || s3Error?.code;

        if (errorCode === 404 || errorCode === "NoSuchKey") {
          throw new NotFoundError(`S3 object not found: ${link.key}`);
        } else if (errorCode === 403 || errorCode === "AccessDenied") {
          throw new AppError(
            `Access denied to file: ${link.file_name || link.key}`,
            403,
            "S3_ACCESS_DENIED"
          );
        } else {
          throw new AppError(
            `Failed to generate presigned URL for file: ${
              link.file_name || link.key
            }. ${s3Error.message}`,
            500,
            "S3_ERROR"
          );
        }
      }
    }

    return { data: urls, success: true };
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }

    console.error("Unexpected error in getFiles:", error);
    throw new AppError(
      `Failed to retrieve files: ${error.message || "Unknown error"}`,
      500,
      "GET_FILES_ERROR"
    );
  }
}
