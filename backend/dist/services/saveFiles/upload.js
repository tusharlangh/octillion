"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPresignedUrl = createPresignedUrl;
exports.createPresignedUrls = createPresignedUrls;
exports.getJsonFromS3 = getJsonFromS3;
exports.uploadFilesToS3 = uploadFilesToS3;
exports.uploadJsonToS3 = uploadJsonToS3;
exports.uploadToS3 = uploadToS3;
var _clientS = require("@aws-sdk/client-s3");
var _s3RequestPresigner = require("@aws-sdk/s3-request-presigner");
var _s3Client = require("../../utils/aws/s3Client.js");
var _errorHandler = require("../../middleware/errorHandler.js");
var _pRetry = _interopRequireDefault(require("p-retry"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function uploadToS3(_x, _x2, _x3) {
  return _uploadToS.apply(this, arguments);
}
function _uploadToS() {
  _uploadToS = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(id, index, file) {
    var key, command, _error$$metadata, errorCode, _error$$metadata2, _t;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          _context2.p = 0;
          if (!(!file || !file.buffer || !file.originalname)) {
            _context2.n = 1;
            break;
          }
          throw new _errorHandler.AppError("Invalid file at index ".concat(index), 400, "INVALID_FILE");
        case 1:
          key = "".concat(id, "-").concat(index, "-").concat(file.originalname);
          command = new _clientS.PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
          });
          _context2.n = 2;
          return (0, _pRetry["default"])(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
            return _regenerator().w(function (_context) {
              while (1) switch (_context.n) {
                case 0:
                  _context.n = 1;
                  return _s3Client.s3.send(command);
                case 1:
                  return _context.a(2);
              }
            }, _callee);
          })), {
            retries: 3,
            minTimeout: 1000,
            onFailedAttempt: function onFailedAttempt(error) {
              console.warn("S3 upload attempt ".concat(error.attemptNumber, " failed for ").concat(key, ". ").concat(error.retriesLeft, " retries left."));
            }
          });
        case 2:
          return _context2.a(2, {
            key: key,
            file_name: file.originalname,
            file_type: file.mimetype
          });
        case 3:
          _context2.p = 3;
          _t = _context2.v;
          if (!_t.isOperational) {
            _context2.n = 4;
            break;
          }
          throw _t;
        case 4:
          errorCode = (_t === null || _t === void 0 || (_error$$metadata = _t.$metadata) === null || _error$$metadata === void 0 ? void 0 : _error$$metadata.httpStatusCode) || (_t === null || _t === void 0 ? void 0 : _t.name);
          if (!(errorCode === "NoSuchBucket")) {
            _context2.n = 5;
            break;
          }
          throw new _errorHandler.AppError("S3 bucket does not exist", 500, "S3_BUCKET_NOT_FOUND");
        case 5:
          if (!(errorCode === 403 || errorCode === "AccessDenied")) {
            _context2.n = 6;
            break;
          }
          throw new _errorHandler.AppError("Access denied to S3 bucket", 403, "S3_ACCESS_DENIED", {
            key: "".concat(id, "-").concat(index, "-").concat(file.originalname),
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            bucket: process.env.S3_BUCKET_NAME,
            errorMessage: _t.message,
            errorCode: _t.code,
            requestId: (_error$$metadata2 = _t.$metadata) === null || _error$$metadata2 === void 0 ? void 0 : _error$$metadata2.requestId
          });
        case 6:
          throw new _errorHandler.AppError("Failed to upload file: ".concat((file === null || file === void 0 ? void 0 : file.originalname) || "index ".concat(index)), 500, "S3_UPLOAD_FAILED");
        case 7:
          return _context2.a(2);
      }
    }, _callee2, null, [[0, 3]]);
  }));
  return _uploadToS.apply(this, arguments);
}
function uploadFilesToS3(_x4, _x5) {
  return _uploadFilesToS.apply(this, arguments);
}
function _uploadFilesToS() {
  _uploadFilesToS = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(id, files) {
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          return _context3.a(2, Promise.all(files.map(function (file, index) {
            return uploadToS3(id, index, file);
          })));
      }
    }, _callee3);
  }));
  return _uploadFilesToS.apply(this, arguments);
}
function createPresignedUrls(_x6) {
  return _createPresignedUrls.apply(this, arguments);
}
function _createPresignedUrls() {
  _createPresignedUrls = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(keys) {
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          return _context4.a(2, Promise.all(keys.map(function (key, index) {
            return createPresignedUrl(key);
          })));
      }
    }, _callee4);
  }));
  return _createPresignedUrls.apply(this, arguments);
}
function createPresignedUrl(_x7) {
  return _createPresignedUrl.apply(this, arguments);
}
function _createPresignedUrl() {
  _createPresignedUrl = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(link) {
    var command, url, _error$$metadata3, errorCode, _t2;
    return _regenerator().w(function (_context6) {
      while (1) switch (_context6.p = _context6.n) {
        case 0:
          _context6.p = 0;
          command = new _clientS.GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: link.key
          });
          _context6.n = 1;
          return (0, _pRetry["default"])(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
            return _regenerator().w(function (_context5) {
              while (1) switch (_context5.n) {
                case 0:
                  _context5.n = 1;
                  return (0, _s3RequestPresigner.getSignedUrl)(_s3Client.s3, command, {
                    expiresIn: 60 * 60 * 24
                  });
                case 1:
                  return _context5.a(2, _context5.v);
              }
            }, _callee5);
          })), {
            retries: 3,
            minTimeout: 500,
            onFailedAttempt: function onFailedAttempt(error) {
              console.warn("Presigned URL generation attempt ".concat(error.attemptNumber, " failed for ").concat(link.key, ". ").concat(error.retriesLeft, " retries left."));
            }
          });
        case 1:
          url = _context6.v;
          return _context6.a(2, {
            file_name: link.file_name || link.originalname,
            file_type: link.file_type,
            presignedUrl: url
          });
        case 2:
          _context6.p = 2;
          _t2 = _context6.v;
          errorCode = (_t2 === null || _t2 === void 0 || (_error$$metadata3 = _t2.$metadata) === null || _error$$metadata3 === void 0 ? void 0 : _error$$metadata3.httpStatusCode) || (_t2 === null || _t2 === void 0 ? void 0 : _t2.code);
          if (!(errorCode === 404 || errorCode === "NoSuchKey")) {
            _context6.n = 3;
            break;
          }
          throw new _errorHandler.NotFoundError("S3 object not found: ".concat(link.key));
        case 3:
          if (!(errorCode === 403 || errorCode === "AccessDenied")) {
            _context6.n = 4;
            break;
          }
          throw new _errorHandler.AppError("Access denied to file: ".concat(link.file_name || link.key), 403, "S3_ACCESS_DENIED");
        case 4:
          throw new _errorHandler.AppError("Failed to generate presigned URL for file: ".concat(link.file_name || link.key, ". ").concat(_t2.message), 500, "S3_ERROR");
        case 5:
          return _context6.a(2);
      }
    }, _callee6, null, [[0, 2]]);
  }));
  return _createPresignedUrl.apply(this, arguments);
}
function uploadJsonToS3(_x8, _x9, _x0) {
  return _uploadJsonToS.apply(this, arguments);
}
function _uploadJsonToS() {
  _uploadJsonToS = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(id, name, data) {
    var key, command, _t3;
    return _regenerator().w(function (_context8) {
      while (1) switch (_context8.p = _context8.n) {
        case 0:
          _context8.p = 0;
          key = "".concat(id, "-").concat(name, ".json");
          command = new _clientS.PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Body: JSON.stringify(data),
            ContentType: "application/json"
          });
          _context8.n = 1;
          return (0, _pRetry["default"])(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7() {
            return _regenerator().w(function (_context7) {
              while (1) switch (_context7.n) {
                case 0:
                  _context7.n = 1;
                  return _s3Client.s3.send(command);
                case 1:
                  return _context7.a(2);
              }
            }, _callee7);
          })), {
            retries: 3,
            minTimeout: 1000,
            onFailedAttempt: function onFailedAttempt(error) {
              console.warn("S3 JSON upload attempt ".concat(error.attemptNumber, " failed for ").concat(key, ". ").concat(error.retriesLeft, " retries left."));
            }
          });
        case 1:
          return _context8.a(2, {
            s3Key: key
          });
        case 2:
          _context8.p = 2;
          _t3 = _context8.v;
          throw new _errorHandler.AppError("Failed to upload JSON to S3: ".concat(name), 500, "S3_JSON_UPLOAD_FAILED");
        case 3:
          return _context8.a(2);
      }
    }, _callee8, null, [[0, 2]]);
  }));
  return _uploadJsonToS.apply(this, arguments);
}
function getJsonFromS3(_x1) {
  return _getJsonFromS.apply(this, arguments);
}
function _getJsonFromS() {
  _getJsonFromS = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0(key) {
    var data, _t4;
    return _regenerator().w(function (_context0) {
      while (1) switch (_context0.p = _context0.n) {
        case 0:
          _context0.p = 0;
          _context0.n = 1;
          return (0, _pRetry["default"])(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9() {
            var command, response, str;
            return _regenerator().w(function (_context9) {
              while (1) switch (_context9.n) {
                case 0:
                  command = new _clientS.GetObjectCommand({
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: key
                  });
                  _context9.n = 1;
                  return _s3Client.s3.send(command);
                case 1:
                  response = _context9.v;
                  _context9.n = 2;
                  return response.Body.transformToString();
                case 2:
                  str = _context9.v;
                  return _context9.a(2, JSON.parse(str));
              }
            }, _callee9);
          })), {
            retries: 3,
            minTimeout: 1000,
            onFailedAttempt: function onFailedAttempt(error) {
              console.warn("S3 JSON download attempt ".concat(error.attemptNumber, " failed for ").concat(key, ". ").concat(error.retriesLeft, " retries left."));
            }
          });
        case 1:
          data = _context0.v;
          return _context0.a(2, data);
        case 2:
          _context0.p = 2;
          _t4 = _context0.v;
          throw new _errorHandler.AppError("Failed to get JSON from S3: ".concat(key), 500, "S3_JSON_DOWNLOAD_FAILED");
        case 3:
          return _context0.a(2);
      }
    }, _callee0, null, [[0, 2]]);
  }));
  return _getJsonFromS.apply(this, arguments);
}