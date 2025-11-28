import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../utils/aws/s3Client.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AppError } from "../middleware/errorHandler.js";

async function getUploadUrl(filename, filetype, id, index) {
  try {
    if (!filename || !filetype) {
      throw new AppError(`Invalid file at index ${index}`, 400, "INVALID_FILE");
    }

    const key = `${id}-${index}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: filetype,
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 300,
    });

    return { uploadUrl, key };
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }

    const errorCode = error?.$metadata?.httpStatusCode || error?.name;

    if (errorCode === "NoSuchBucket") {
      throw new AppError(
        "S3 bucket does not exist",
        500,
        "S3_BUCKET_NOT_FOUND"
      );
    }

    if (errorCode === 403 || errorCode === "AccessDenied") {
      throw new AppError(
        "Access denied to S3 bucket",
        403,
        "S3_ACCESS_DENIED",
        {
          key: `${id}-${index}-${filename}`,
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          bucket: process.env.S3_BUCKET_NAME,
          errorMessage: error.message,
          errorCode: error.code,
          requestId: error.$metadata?.requestId,
        }
      );
    }

    throw new AppError(
      `Failed to get url for the file: ${filename || `index ${index}`}`,
      500,
      "S3_URL_FAILED"
    );
  }
}

export async function getUploadUrls(files, id) {
  const urls = await Promise.all(
    files.map((file, index) => getUploadUrl(file.name, file.type, id, index))
  );

  return {
    success: true,
    data: urls,
  };
}
