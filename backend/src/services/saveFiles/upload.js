import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../../utils/aws/s3Client.js";
import { AppError, NotFoundError } from "../../middleware/errorHandler.js";

export async function uploadToS3(id, index, file) {
  try {
    if (!file || !file.buffer || !file.originalname) {
      throw new AppError(`Invalid file at index ${index}`, 400, "INVALID_FILE");
    }

    const key = `${id}-${index}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3.send(command);

    return { key, file_name: file.originalname, file_type: file.mimetype };
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
      throw new AppError("Access denied to S3 bucket", 403, "S3_ACCESS_DENIED");
    }

    throw new AppError(
      `Failed to upload file: ${file?.originalname || `index ${index}`}`,
      500,
      "S3_UPLOAD_FAILED"
    );
  }
}

export async function uploadFilesToS3(id, files) {
  return Promise.all(files.map((file, index) => uploadToS3(id, index, file)));
}

export async function createPresignedUrls(keys) {
  const urls = [];

  for (const link of keys) {
    if (!link) {
      continue;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: link.key,
      });

      const url = await getSignedUrl(s3, command, {
        expiresIn: 60 * 60 * 24,
      });

      urls.push({
        file_name: link.file_name,
        file_type: link.file_type,
        presignedUrl: url,
      });
    } catch (error) {
      const errorCode = error?.$metadata?.httpStatusCode || error?.code;

      if (errorCode === 404 || errorCode === "NoSuchKey") {
        throw new NotFoundError(`S3 object not found: ${link.key}`);
      }

      if (errorCode === 403 || errorCode === "AccessDenied") {
        throw new AppError(
          `Access denied to file: ${link.file_name || link.key}`,
          403,
          "S3_ACCESS_DENIED"
        );
      }

      throw new AppError(
        `Failed to generate presigned URL for file: ${
          link.file_name || link.key
        }. ${error.message}`,
        500,
        "S3_ERROR"
      );
    }
  }

  return urls;
}
