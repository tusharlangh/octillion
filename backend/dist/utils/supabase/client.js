"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _supabaseJs = require("@supabase/supabase-js");
var _dotenv = _interopRequireDefault(require("dotenv"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
_dotenv["default"].config();
var supabase = (0, _supabaseJs.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
var _default = exports["default"] = supabase;