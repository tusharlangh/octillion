import multer from "multer";
import { AppError } from "../middleware/errorHandler.js";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["application/pdf"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Invalid file type: ${file.mimetype}. Only PDFs are allowed.`,
        400,
        "INVALID_FILE_TYPE"
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 10,
  },
});

export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(
        new AppError(
          "File size exceeds the limit of 100MB",
          400,
          "FILE_TOO_LARGE"
        )
      );
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return next(
        new AppError(
          "Too many files. Maximum 10 files allowed",
          400,
          "TOO_MANY_FILES"
        )
      );
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return next(
        new AppError("Unexpected field name", 400, "UNEXPECTED_FIELD")
      );
    }
    return next(
      new AppError(`Upload error: ${err.message}`, 400, "UPLOAD_ERROR")
    );
  }

  next(err);
};

export const validateTotalFileSize = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  const totalSize = req.files.reduce((acc, file) => acc + file.size, 0);
  const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB

  if (totalSize > MAX_TOTAL_SIZE) {
    return next(
      new AppError(
        "Total file size exceeds the limit of 100MB",
        400,
        "TOTAL_SIZE_TOO_LARGE"
      )
    );
  }

  next();
};

export default upload;
