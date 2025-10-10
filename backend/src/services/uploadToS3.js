import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../utils/aws/s3Client.js";
import dotenv from "dotenv";

dotenv.config();

export async function uploadToS3(id, index, file) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${id}-${index}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3.send(command);

  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${command.input.Key}`;
}
