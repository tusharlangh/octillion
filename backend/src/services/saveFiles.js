import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../utils/aws/s3Client.js";
import dotenv from "dotenv";
import supabase from "../utils/supabase/client.js";

dotenv.config();

async function uploadToS3(id, index, file) {
  const key = `${id}-${index}-${file.originalname}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3.send(command);

  return { key: key, file_name: file.originalname, file_type: file.mimetype };
}

export async function saveFiles(id, files) {
  const keys = await Promise.all(
    files.map((file, i) => uploadToS3(id, i, file))
  );

  const { data, error } = await supabase.from("files").insert([
    {
      parse_id: id,
      files: keys,
    },
  ]);

  if (error) {
    console.error("error occured");
  } else {
    console.log("everything worked and the data is saved. Check db");
  }

  return data;
}
