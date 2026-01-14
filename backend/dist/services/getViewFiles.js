"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getViewFiles = getViewFiles;
var _client = _interopRequireDefault(require("../utils/supabase/client.js"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _clientS = require("@aws-sdk/client-s3");
var _s3Client = require("../utils/aws/s3Client.js");
var _s3RequestPresigner = require("@aws-sdk/s3-request-presigner");
var _errorHandler = require("../middleware/errorHandler.js");
var _pRetry = _interopRequireDefault(require("p-retry"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _regeneratorValues(e) { if (null != e) { var t = e["function" == typeof Symbol && Symbol.iterator || "@@iterator"], r = 0; if (t) return t.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) return { next: function next() { return e && r >= e.length && (e = void 0), { value: e && e[r++], done: !e }; } }; } throw new TypeError(_typeof(e) + " is not iterable"); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
_dotenv["default"].config();
function getViewFiles(_x) {
  return _getViewFiles.apply(this, arguments);
}
function _getViewFiles() {
  _getViewFiles = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(userId) {
    var result, data, i, links, urls, processing, _loop, j, folderName, firstFileName, _t2;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.p = _context4.n) {
        case 0:
          _context4.p = 0;
          if (userId) {
            _context4.n = 1;
            break;
          }
          throw new _errorHandler.AppError("User ID is required", 400, "USER_ID_ERROR");
        case 1:
          _context4.n = 2;
          return (0, _pRetry["default"])(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
            var _yield$supabase$from$, data, error;
            return _regenerator().w(function (_context) {
              while (1) switch (_context.n) {
                case 0:
                  _context.n = 1;
                  return _client["default"].from("files").select("id, user_id, created_at, parse_id, files").eq("user_id", userId).order("created_at", {
                    ascending: false
                  });
                case 1:
                  _yield$supabase$from$ = _context.v;
                  data = _yield$supabase$from$.data;
                  error = _yield$supabase$from$.error;
                  if (!error) {
                    _context.n = 2;
                    break;
                  }
                  throw new _errorHandler.AppError("Failed to fetch files: ".concat(error.message), 500, "SUPABASE_ERROR");
                case 2:
                  return _context.a(2, data);
              }
            }, _callee);
          })), {
            retries: 3,
            onFailedAttempt: function onFailedAttempt(error) {
              console.warn("getViewFiles: retry attempt ".concat(error.attemptNumber, "/3 for userId: ").concat(userId, ", error is: ").concat(error));
            }
          });
        case 2:
          result = _context4.v;
          data = result;
          if (!(!data || data.length === 0)) {
            _context4.n = 3;
            break;
          }
          return _context4.a(2, {
            data: [],
            success: true
          });
        case 3:
          i = 0;
        case 4:
          if (!(i < data.length)) {
            _context4.n = 11;
            break;
          }
          links = data[i].files;
          if (!(!links || !Array.isArray(links) || links.length === 0)) {
            _context4.n = 5;
            break;
          }
          data[i].files = [];
          data[i].type = "folder";
          data[i].name = "Documents ".concat(data.length - i);
          return _context4.a(3, 10);
        case 5:
          urls = [];
          processing = false;
          _loop = /*#__PURE__*/_regenerator().m(function _loop() {
            var link, urlData, _s3Error$$metadata, errorCode, _t;
            return _regenerator().w(function (_context3) {
              while (1) switch (_context3.p = _context3.n) {
                case 0:
                  link = links[j];
                  if (!(!link || !link.key)) {
                    _context3.n = 1;
                    break;
                  }
                  console.warn("Skipping invalid link ".concat(link, " for file ").concat(links));
                  return _context3.a(2, 1);
                case 1:
                  if (link.status === "PROCESSING") {
                    processing = true;
                  }
                  _context3.p = 2;
                  _context3.n = 3;
                  return (0, _pRetry["default"])(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
                    var command, url;
                    return _regenerator().w(function (_context2) {
                      while (1) switch (_context2.n) {
                        case 0:
                          command = new _clientS.GetObjectCommand({
                            Bucket: process.env.S3_BUCKET_NAME,
                            Key: link.key
                          });
                          _context2.n = 1;
                          return (0, _s3RequestPresigner.getSignedUrl)(_s3Client.s3, command, {
                            expiresIn: 60 * 60 * 24 * 1
                          });
                        case 1:
                          url = _context2.v;
                          return _context2.a(2, {
                            name: link.file_name,
                            type: "file",
                            file_type: "PDF",
                            presignedUrl: url,
                            status: link.status
                          });
                      }
                    }, _callee2);
                  })), {
                    retries: 3,
                    onFailedAttempt: function onFailedAttempt(error) {
                      console.warn("getViewFiles: retry attempt ".concat(error.attemptNumber, "/3 for userId: ").concat(userId, ", error is: ").concat(error));
                    }
                  });
                case 3:
                  urlData = _context3.v;
                  urls.push(urlData);
                  _context3.n = 7;
                  break;
                case 4:
                  _context3.p = 4;
                  _t = _context3.v;
                  errorCode = (_t === null || _t === void 0 || (_s3Error$$metadata = _t.$metadata) === null || _s3Error$$metadata === void 0 ? void 0 : _s3Error$$metadata.httpStatusCode) || (_t === null || _t === void 0 ? void 0 : _t.code);
                  if (!(errorCode === 404 || errorCode === "NoSuchKey")) {
                    _context3.n = 5;
                    break;
                  }
                  throw new _errorHandler.NotFoundError("S3 object not found: ".concat(link.key));
                case 5:
                  if (!(errorCode === 403 || errorCode === "AccessDenied")) {
                    _context3.n = 6;
                    break;
                  }
                  throw new _errorHandler.AppError("Access denied to file: ".concat(link.file_name || link.key), 403, "S3_ACCESS_DENIED");
                case 6:
                  throw new _errorHandler.AppError("Failed to generate presigned URL for file: ".concat(link.file_name || link.key, ". ").concat(_t.message), 500, "S3_ERROR");
                case 7:
                  return _context3.a(2);
              }
            }, _loop, null, [[2, 4]]);
          });
          j = 0;
        case 6:
          if (!(j < links.length)) {
            _context4.n = 9;
            break;
          }
          return _context4.d(_regeneratorValues(_loop()), 7);
        case 7:
          if (!_context4.v) {
            _context4.n = 8;
            break;
          }
          return _context4.a(3, 8);
        case 8:
          j++;
          _context4.n = 6;
          break;
        case 9:
          data[i].files = urls;
          data[i].type = "folder";
          folderName = "Documents ".concat(data.length - i);
          if (urls.length > 0) {
            firstFileName = urls[0].name;
            if (urls.length === 1) {
              folderName = firstFileName;
            } else {
              folderName = "".concat(firstFileName, " + ").concat(urls.length - 1);
            }
          }
          data[i].name = folderName;
          data[i].status = processing ? "PROCESSING" : "PROCESSED";
        case 10:
          i++;
          _context4.n = 4;
          break;
        case 11:
          return _context4.a(2, {
            data: data,
            success: true
          });
        case 12:
          _context4.p = 12;
          _t2 = _context4.v;
          if (!_t2.isOperational) {
            _context4.n = 13;
            break;
          }
          throw _t2;
        case 13:
          console.error("Unexpected error in getViewFiles:", _t2);
          throw new _errorHandler.AppError("Failed to retrieve view files: ".concat(_t2.message || "Unknown error"), 500, "GET_VIEW_FILES_ERROR");
        case 14:
          return _context4.a(2);
      }
    }, _callee3, null, [[0, 12]]);
  }));
  return _getViewFiles.apply(this, arguments);
}