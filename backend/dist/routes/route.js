"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _file_parse_controller = require("../controllers/file_parse_controller.js");
var _save_files_controller = require("../controllers/save_files_controller.js");
var _multer = _interopRequireWildcard(require("../middleware/multer.js"));
var _auth = require("../middleware/auth.js");
var _get_files_controller = require("../controllers/get_files_controller.js");
var _get_view_files_controller = require("../controllers/get_view_files_controller.js");
var _get_pfp_controller = require("../controllers/get_pfp_controller.js");
var _get_chat_controller = require("../controllers/get_chat_controller.js");
var _get_name_controller = require("../controllers/get_name_controller.js");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
var router = _express["default"].Router();

// Health check endpoint for Render.com
router.get("/", function (req, res) {
  res.status(200).json({
    status: "ok",
    message: "Octillion Backend API",
    timestamp: new Date().toISOString()
  });
});
router.get("/get-files", _auth.auth, _get_files_controller.get_files_controller);
router.post("/save-files", _multer["default"].array("files", 10), _multer.handleMulterError, _auth.auth, _save_files_controller.save_files_controller);
router.get("/parse-files", _auth.auth, _file_parse_controller.file_parse_controller);
router.get("/get-view-files", _auth.auth, _get_view_files_controller.get_view_files_controller);
router.get("/get-pfp", _auth.auth, _get_pfp_controller.get_pfp_controller);
router.get("/get-name", _auth.auth, _get_name_controller.get_name_controller);
router.get("/get-chats", _auth.auth, _get_chat_controller.get_chat_controller);
var _default = exports["default"] = router;