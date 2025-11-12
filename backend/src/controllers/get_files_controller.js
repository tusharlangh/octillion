import { getFiles } from "../services/getFiles.js";
import {
  ValidationError,
  UnauthorizedError,
  AppError,
} from "../middleware/errorHandler.js";

export async function get_files_controller(req, res, next) {
  try {
    const { id } = req.query;
    const userId = req.user;

    if (!userId) {
      throw UnauthorizedError("Authorization required");
    }

    if (!id) {
      throw ValidationError("Id is required");
    }

    const files = await getFiles(id, userId);

    if (!files.success) {
      throw new AppError(
        files.error || "Failed to get files",
        500,
        "GET_FILES_ERROR"
      );
    }

    return res.status(200).json({
      success: true,
      data: files.data,
      message: "Received files",
    });
  } catch (error) {
    next(error);
  }
}
