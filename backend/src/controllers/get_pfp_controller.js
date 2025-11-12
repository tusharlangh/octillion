import { getPfp } from "../services/getPfp.js";
import {
  ValidationError,
  UnauthorizedError,
  AppError,
} from "../middleware/errorHandler.js";

export async function get_pfp_controller(req, res, next) {
  try {
    const userId = req.user;

    if (!userId) {
      throw UnauthorizedError("Authorization required");
    }

    const pfp = await getPfp(userId);

    if (!pfp.success) {
      throw new AppError(pfp.error || "Failed to get pfp", 500, "PFP_ERROR");
    }

    return res.status(200).json({
      success: true,
      data: pfp.pfp,
      message: "Received profile picture",
    });
  } catch (error) {
    next(error);
  }
}
