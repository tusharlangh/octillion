import { saveFiles } from "../services/saveFiles.js";

export async function save_files_controller(req, res) {
  try {
    const id = req.body.id;
    const files = req.files;
    const userId = req.user;

    const uploadedUrls = await saveFiles(id, files, userId);

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.json({ success: false });
  }
}
