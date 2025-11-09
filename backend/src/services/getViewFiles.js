import supabase from "../utils/supabase/client.js";
import dotenv from "dotenv";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../utils/aws/s3Client.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

export async function getViewFiles(userId) {
  const { data, error } = await supabase
    .from("files")
    .select("id, user_id, created_at, parse_id, files")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  for (let i = 0; i < data.length; i++) {
    const links = data[i].files;
    const urls = [];

    for (let j = 0; j < links.length; j++) {
      const link = links[j];

      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: link.key,
      });

      const url = await getSignedUrl(s3, command, {
        expiresIn: 60 * 60 * 24 * 1, // 1 day
      });

      urls.push({
        name: link.file_name,
        type: "file",
        file_type: link.mimetype || "PDF",
        presignedUrl: url,
      });
    }

    data[i].files = urls;
    data[i].type = "folder";
    data[i].name = `Documents ${data.length - i}`;
  }

  return data;
}
