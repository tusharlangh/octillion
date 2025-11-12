import { saveFiles } from "../services/saveFiles.js";
import {
  ValidationError,
  UnauthorizedError,
  AppError,
} from "../middleware/errorHandler.js";

export async function save_files_controller(req, res, next) {
  try {
    const id = req.body.id;
    const files = req.files;
    const userId = req.user;

    if (!userId) {
      throw new UnauthorizedError("Authorization required");
    }

    if (!id) {
      throw new ValidationError("Id is required");
    }

    if (!files) {
      throw new ValidationError("No files uploaded");
    }

    if (files.length > 10) {
      throw new ValidationError("Too many files uploaded", {
        maxFiles: 10,
        uploadedFiles: files.length,
      });
    }

    const uploadedUrls = await saveFiles(id, files, userId);

    if (!uploadedUrls) {
      throw new AppError("Failed to save files", 500, "SAVE_FILES_ERROR");
    }

    return res.status(201).json({
      success: true,
      data: null,
      message: "Files uploaded successfully",
    });
  } catch (error) {
    next(error);
  }
}
