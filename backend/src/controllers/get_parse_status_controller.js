import {
  ValidationError,
  UnauthorizedError,
  AppError,
} from "../middleware/errorHandler.js";
import { parseStatus } from "../services/parseStatus.js";

export async function get_parse_status_controller(req, res, next) {
  try {
    const { id } = req.query;
    const userId = req.user;

    if (!userId) {
      throw new UnauthorizedError("Authorization required");
    }

    if (!id) {
      throw new ValidationError("Id is required");
    }

    const data = await parseStatus(id, userId);

    if (!data.success) {
      throw new AppError(
        files.error || "Failed to get parse status",
        500,
        "GET_PARSE_STATUS_ERROR"
      );
    }

    return res.status(200).json({
      success: true,
      data: data.data,
      message: "Received parse status",
    });
  } catch (error) {
    next(error);
  }
}
