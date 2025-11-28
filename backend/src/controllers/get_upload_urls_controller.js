import { UnauthorizedError, AppError } from "../middleware/errorHandler.js";
import { getUploadUrls } from "../services/getUploadUrls.js";

export async function get_upload_urls_controller(req, res, next) {
  try {
    const { id, files } = req.body;
    const userId = req.user;

    if (!userId) {
      throw new UnauthorizedError("Authorization required");
    }

    const data = await getUploadUrls(files, id);

    if (!data.success) {
      throw new AppError(
        data.error || "Failed getting upload urls",
        500,
        "UPLOAD_URLS_ERROR"
      );
    }

    return res.status(200).json({
      success: true,
      data: data.data,
      message: "Received upload urls",
    });
  } catch (error) {
    next(error);
  }
}
