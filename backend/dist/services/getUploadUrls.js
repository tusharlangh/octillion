"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUploadUrls = getUploadUrls;
var _clientS = require("@aws-sdk/client-s3");
var _s3Client = require("../utils/aws/s3Client.js");
var _s3RequestPresigner = require("@aws-sdk/s3-request-presigner");
var _errorHandler = require("../middleware/errorHandler.js");
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function getUploadUrl(_x, _x2, _x3, _x4) {
  return _getUploadUrl.apply(this, arguments);
}
function _getUploadUrl() {
  _getUploadUrl = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(filename, filetype, id, index) {
    var key, command, uploadUrl, _error$$metadata, errorCode, _error$$metadata2, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          _context.p = 0;
          if (!(!filename || !filetype)) {
            _context.n = 1;
            break;
          }
          throw new _errorHandler.AppError("Invalid file at index ".concat(index), 400, "INVALID_FILE");
        case 1:
          key = "".concat(id, "-").concat(index, "-").concat(filename);
          command = new _clientS.PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            ContentType: filetype
          });
          _context.n = 2;
          return (0, _s3RequestPresigner.getSignedUrl)(_s3Client.s3, command, {
            expiresIn: 300
          });
        case 2:
          uploadUrl = _context.v;
          return _context.a(2, {
            uploadUrl: uploadUrl,
            key: key
          });
        case 3:
          _context.p = 3;
          _t = _context.v;
          if (!_t.isOperational) {
            _context.n = 4;
            break;
          }
          throw _t;
        case 4:
          errorCode = (_t === null || _t === void 0 || (_error$$metadata = _t.$metadata) === null || _error$$metadata === void 0 ? void 0 : _error$$metadata.httpStatusCode) || (_t === null || _t === void 0 ? void 0 : _t.name);
          if (!(errorCode === "NoSuchBucket")) {
            _context.n = 5;
            break;
          }
          throw new _errorHandler.AppError("S3 bucket does not exist", 500, "S3_BUCKET_NOT_FOUND");
        case 5:
          if (!(errorCode === 403 || errorCode === "AccessDenied")) {
            _context.n = 6;
            break;
          }
          throw new _errorHandler.AppError("Access denied to S3 bucket", 403, "S3_ACCESS_DENIED", {
            key: "".concat(id, "-").concat(index, "-").concat(filename),
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            bucket: process.env.S3_BUCKET_NAME,
            errorMessage: _t.message,
            errorCode: _t.code,
            requestId: (_error$$metadata2 = _t.$metadata) === null || _error$$metadata2 === void 0 ? void 0 : _error$$metadata2.requestId
          });
        case 6:
          throw new _errorHandler.AppError("Failed to get url for the file: ".concat(filename || "index ".concat(index)), 500, "S3_URL_FAILED");
        case 7:
          return _context.a(2);
      }
    }, _callee, null, [[0, 3]]);
  }));
  return _getUploadUrl.apply(this, arguments);
}
function getUploadUrls(_x5, _x6) {
  return _getUploadUrls.apply(this, arguments);
}
function _getUploadUrls() {
  _getUploadUrls = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(files, id) {
    var urls;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          _context2.n = 1;
          return Promise.all(files.map(function (file, index) {
            return getUploadUrl(file.name, file.type, id, index);
          }));
        case 1:
          urls = _context2.v;
          return _context2.a(2, {
            success: true,
            data: urls
          });
      }
    }, _callee2);
  }));
  return _getUploadUrls.apply(this, arguments);
}