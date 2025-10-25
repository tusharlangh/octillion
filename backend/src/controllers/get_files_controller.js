import { getFiles } from "../services/getFiles.js";

export async function get_files_controller(req, res) {
  try {
    const { id } = req.query;
    const userId = req.user;

    if (!id) {
      return res.json({ success: false, data: null });
    }

    const files = await getFiles(id, userId);

    console.log("it works perfectly", id);

    return res.json({ success: true, data: files });
  } catch (error) {
    console.error(error);
  }
}
