"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateTotalFileSize = exports.handleMulterError = exports["default"] = void 0;
var _multer = _interopRequireDefault(require("multer"));
var _errorHandler = require("../middleware/errorHandler.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var storage = _multer["default"].memoryStorage();
var fileFilter = function fileFilter(req, file, cb) {
  var allowedMimeTypes = ["application/pdf"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new _errorHandler.AppError("Invalid file type: ".concat(file.mimetype, ". Only PDFs are allowed."), 400, "INVALID_FILE_TYPE"), false);
  }
};
var upload = (0, _multer["default"])({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 10
  }
});
var handleMulterError = exports.handleMulterError = function handleMulterError(err, req, res, next) {
  if (err instanceof _multer["default"].MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(new _errorHandler.AppError("File size exceeds the limit of 100MB", 400, "FILE_TOO_LARGE"));
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return next(new _errorHandler.AppError("Too many files. Maximum 10 files allowed", 400, "TOO_MANY_FILES"));
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return next(new _errorHandler.AppError("Unexpected field name", 400, "UNEXPECTED_FIELD"));
    }
    return next(new _errorHandler.AppError("Upload error: ".concat(err.message), 400, "UPLOAD_ERROR"));
  }
  next(err);
};
var validateTotalFileSize = exports.validateTotalFileSize = function validateTotalFileSize(req, res, next) {
  if (!req.files || req.files.length === 0) {
    return next();
  }
  var totalSize = req.files.reduce(function (acc, file) {
    return acc + file.size;
  }, 0);
  var MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB

  if (totalSize > MAX_TOTAL_SIZE) {
    return next(new _errorHandler.AppError("Total file size exceeds the limit of 100MB", 400, "TOTAL_SIZE_TOO_LARGE"));
  }
  next();
};
var _default = exports["default"] = upload;