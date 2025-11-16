import { UnauthorizedError, AppError } from "../middleware/errorHandler.js";
import { getName } from "../services/getName.js";

export async function get_name_controller(req, res, next) {
  try {
    const userId = req.user;

    if (!userId) {
      throw new UnauthorizedError("Authorization required");
    }

    const data = await getName(userId);

    if (!data.success) {
      throw new AppError(
        data.error || "Failed getting name",
        500,
        "NAME_ERROR"
      );
    }

    return res.status(200).json({
      success: true,
      data: data.name,
      message: "Received name",
    });
  } catch (error) {
    next(error);
  }
}
