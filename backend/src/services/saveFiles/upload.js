import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../../utils/aws/s3Client.js";
import { AppError, NotFoundError } from "../../middleware/errorHandler.js";
import pRetry from "p-retry";

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

    await pRetry(
      async () => {
        await s3.send(command);
      },
      {
        retries: 3,
        minTimeout: 1000,
        onFailedAttempt: (error) => {
          console.warn(
            `S3 upload attempt ${error.attemptNumber} failed for ${key}. ${error.retriesLeft} retries left.`
          );
        },
      }
    );

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
      throw new AppError(
        "Access denied to S3 bucket",
        403,
        "S3_ACCESS_DENIED",
        {
          key: `${id}-${index}-${file.originalname}`,
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          bucket: process.env.S3_BUCKET_NAME,
          errorMessage: error.message,
          errorCode: error.code,
          requestId: error.$metadata?.requestId,
        }
      );
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
  return Promise.all(keys.map((key, index) => createPresignedUrl(key)));
}

export async function createPresignedUrl(link) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: link.key,
    });

    const url = await pRetry(
      async () => {
        return await getSignedUrl(s3, command, {
          expiresIn: 60 * 60 * 24,
        });
      },
      {
        retries: 3,
        minTimeout: 500,
        onFailedAttempt: (error) => {
          console.warn(
            `Presigned URL generation attempt ${error.attemptNumber} failed for ${link.key}. ${error.retriesLeft} retries left.`
          );
        },
      }
    );

    return {
      file_name: link.file_name || link.originalname,
      file_type: link.file_type,
      presignedUrl: url,
    };
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

export async function uploadJsonToS3(id, name, data) {
  try {
    const key = `${id}-${name}.json`;
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: "application/json",
    });

    await pRetry(
      async () => {
        await s3.send(command);
      },
      {
        retries: 3,
        minTimeout: 1000,
        onFailedAttempt: (error) => {
          console.warn(
            `S3 JSON upload attempt ${error.attemptNumber} failed for ${key}. ${error.retriesLeft} retries left.`
          );
        },
      }
    );

    return { s3Key: key };
  } catch (error) {
    throw new AppError(
      `Failed to upload JSON to S3: ${name}`,
      500,
      "S3_JSON_UPLOAD_FAILED"
    );
  }
}

export async function getJsonFromS3(key) {
  try {
    const data = await pRetry(
      async () => {
        const command = new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
        });

        const response = await s3.send(command);
        const str = await response.Body.transformToString();

        return JSON.parse(str);
      },
      {
        retries: 3,
        minTimeout: 1000,
        onFailedAttempt: (error) => {
          console.warn(
            `S3 JSON download attempt ${error.attemptNumber} failed for ${key}. ${error.retriesLeft} retries left.`
          );
        },
      }
    );

    return data;
  } catch (error) {
    throw new AppError(
      `Failed to get JSON from S3: ${key}`,
      500,
      "S3_JSON_DOWNLOAD_FAILED"
    );
  }
}
