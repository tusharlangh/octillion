import { getPfp } from "../services/getPfp.js";

export async function get_pfp_controller(req, res) {
  try {
    const userId = req.user;

    if (!userId) {
      return res.json({ success: false, data: null });
    }

    const pfp = await getPfp(userId);

    return res.json({ success: pfp.success, data: pfp.pfp });
  } catch (error) {
    console.error(error);
  }
}
