"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.s3 = void 0;
var _clientS = require("@aws-sdk/client-s3");
var _dotenv = _interopRequireDefault(require("dotenv"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
_dotenv["default"].config();
var s3 = exports.s3 = new _clientS.S3Client({
  region: "us-east-1"
});