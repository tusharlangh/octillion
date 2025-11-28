import { saveFiles } from "../services/saveFiles.js";
import {
  ValidationError,
  UnauthorizedError,
} from "../middleware/errorHandler.js";

export async function save_files_controller(req, res, next) {
  try {
    const { id, keys } = req.body;
    const userId = req.user;

    if (!userId) {
      throw new UnauthorizedError("Authorization required");
    }

    if (!keys) {
      throw new ValidationError("Keys are required");
    }

    if (!id) {
      throw new ValidationError("Id is required");
    }

    const uploadedUrls = await saveFiles(id, keys, userId);

    return res.status(201).json({
      success: true,
      message: "Files uploaded successfully",
    });
  } catch (error) {
    next(error);
  }
}
