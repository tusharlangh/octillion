"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _file_parse_controller = require("../controllers/file_parse_controller.js");
var _save_files_controller = require("../controllers/save_files_controller.js");
var _auth = require("../middleware/auth.js");
var _get_files_controller = require("../controllers/get_files_controller.js");
var _get_view_files_controller = require("../controllers/get_view_files_controller.js");
var _get_pfp_controller = require("../controllers/get_pfp_controller.js");
var _get_chat_controller = require("../controllers/get_chat_controller.js");
var _get_name_controller = require("../controllers/get_name_controller.js");
var _get_upload_urls_controller = require("../controllers/get_upload_urls_controller.js");
var _get_parse_status_controller = require("../controllers/get_parse_status_controller.js");
var _get_ai_overview_controller = require("../controllers/get_ai_overview_controller.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var router = _express["default"].Router();
router.get("/", function (req, res) {
  res.status(200).json({
    status: "ok",
    message: "Octillion Backend API",
    timestamp: new Date().toISOString()
  });
});
router.get("/get-files", _auth.auth, _get_files_controller.get_files_controller);
router.post("/save-files", _auth.auth, _save_files_controller.save_files_controller);
router.get("/parse-files", _auth.auth, _file_parse_controller.file_parse_controller);
router.get("/get-view-files", _auth.auth, _get_view_files_controller.get_view_files_controller);
router.get("/get-pfp", _auth.auth, _get_pfp_controller.get_pfp_controller);
router.get("/get-name", _auth.auth, _get_name_controller.get_name_controller);
router.get("/get-chats", _auth.auth, _get_chat_controller.get_chat_controller);
router.post("/get-upload-urls", _auth.auth, _get_upload_urls_controller.get_upload_urls_controller);
router.get("/parse-status", _auth.auth, _get_parse_status_controller.get_parse_status_controller);
router.post("/get-ai-overview", _auth.auth, _get_ai_overview_controller.get_ai_overview_controller);
var _default = exports["default"] = router;