import { getViewFiles } from "../services/getViewFiles.js";

export async function get_view_files_controller(req, res) {
  try {
    const userId = req.user;

    if (!userId) {
      return res.json({ success: false, data: [] });
    }

    const data = await getViewFiles(userId);

    return res.json({ success: true, data: data });
  } catch (error) {
    console.error(error);
  }
}
