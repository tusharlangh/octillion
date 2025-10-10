import { uploadToS3 } from "../services/uploadToS3.js";

export async function save_files_controller(req, res) {
  try {
    const id = req.body.id;
    const files = req.files;

    const uploadedUrls = await Promise.all(
      files.map((file, index) => uploadToS3(id, index, file))
    );

    return res.json({ urls: uploadedUrls });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Failed to parse PDFs", detail: error?.message });
  }
}
