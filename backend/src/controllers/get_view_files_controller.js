import { getViewFiles } from "../services/getViewFiles.js";
import { UnauthorizedError, AppError } from "../middleware/errorHandler.js";

export async function get_view_files_controller(req, res, next) {
  try {
    const userId = req.user;

    if (!userId) {
      throw new UnauthorizedError("Authorization required");
    }

    const data = await getViewFiles(userId);

    if (!data.success) {
      throw new AppError(
        data.error || "Failed getting viewing files",
        500,
        "VIEW_FILES_ERROR"
      );
    }

    return res.status(200).json({
      success: true,
      data: data.data,
      message: "Received files",
    });
  } catch (error) {
    next(error);
  }
}
