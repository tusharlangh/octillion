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

    // Validate that keys is an array
    if (!Array.isArray(keys)) {
      throw new ValidationError("Keys must be an array");
    }

    // Validate that all keys are strings
    const invalidKeys = keys.filter(key => typeof key !== 'string');
    if (invalidKeys.length > 0) {
      console.error('Invalid keys received:', { 
        invalidKeys, 
        allKeys: keys,
        parseId: id,
        userId 
      });
      throw new ValidationError(
        `Keys array contains ${invalidKeys.length} non-string value(s)`
      );
    }

    // Validate that keys array is not empty
    if (keys.length === 0) {
      throw new ValidationError("Keys array cannot be empty");
    }

    const uploadedUrls = await saveFiles(id, keys, userId);

    return res.status(200).json({
      success: true,
      message: "Files queued for processing",
    });
  } catch (error) {
    next(error);
  }
}
