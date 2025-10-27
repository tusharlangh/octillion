import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import supabase from "../utils/supabase/client.js";
import dotenv from "dotenv";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../utils/aws/s3Client.js";
dotenv.config();

export async function getFiles(id, userId) {
  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("user_id", userId)
    .eq("parse_id", id);

  if (error) {
    console.error(error);
    return;
  }

  let links = data.map((row) => row.files);
  links = links[0];

  const urls = [];

  for (let i = 0; i < links.length; i++) {
    const link = links[i];

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
  }

  console.log(urls);

  return urls;
}
