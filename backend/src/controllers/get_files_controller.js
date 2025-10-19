import { getFiles } from "../services/getFiles.js";

export async function get_files_controller(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.json({ success: false, data: null });
    }

    const files = await getFiles(id);

    console.log("it works perfectly", id);

    return res.json({ success: true, data: files });
  } catch (error) {
    console.error(error);
  }
}
