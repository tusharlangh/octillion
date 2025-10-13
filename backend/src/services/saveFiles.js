import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { s3 } from "../utils/aws/s3Client.js";
import dotenv from "dotenv";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import supabase from "../utils/supabase/client.js";

dotenv.config();

async function uploadToS3(id, index, file) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${id}-${index}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3.send(command);
}

async function getPresignedUrls(id) {
  const command = new ListObjectsV2Command({
    Bucket: process.env.S3_BUCKET_NAME,
    Prefix: id,
  });

  const response = await s3.send(command);

  const urls = [];

  for (let obj of response.Contents) {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: obj.Key,
    });

    const file = await getSignedUrl(s3, command, {
      expiresIn: 60 * 60 * 24 * 4, //4 days
    });

    urls.push({
      key: obj.Key,
      presignedUrl: file,
      date: new Date().toISOString(),
    });
  }

  return urls;
}

export async function saveFiles(id, files) {
  await Promise.all(files.map((file, i) => uploadToS3(id, i, file)));

  const urls = await getPresignedUrls(id);

  const { data, error } = await supabase.from("files").insert([
    {
      parse_id: id,
      files: urls,
    },
  ]);

  if (error) {
    console.error("error occured");
  } else {
    console.log("everything worked and the data is saved. Check db");
  }

  return data;
}
