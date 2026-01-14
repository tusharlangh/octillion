"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.processFiles = processFiles;
var _dotenv = _interopRequireDefault(require("dotenv"));
var _errorHandler = require("../middleware/errorHandler.js");
var _upload = require("./saveFiles/upload.js");
var _indexing = require("./saveFiles/indexing.js");
var _embeddings = require("./saveFiles/embeddings.js");
var _persist = require("./saveFiles/persist.js");
var _chunks = require("./parse/chunks.js");
var _processMetrics = require("../utils/processMetrics.js");
var _clientS = require("@aws-sdk/client-s3");
var _s3Client = require("../utils/aws/s3Client.js");
var _pRetry = _interopRequireDefault(require("p-retry"));
var _geometryClient = require("../utils/geometryClient.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
_dotenv["default"].config();
function getFileSize(_x) {
  return _getFileSize.apply(this, arguments);
}
function _getFileSize() {
  _getFileSize = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(key) {
    var command, response, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          _context.p = 0;
          command = new _clientS.HeadObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key
          });
          _context.n = 1;
          return _s3Client.s3.send(command);
        case 1:
          response = _context.v;
          return _context.a(2, response.ContentLength || 0);
        case 2:
          _context.p = 2;
          _t = _context.v;
          console.warn("Failed to get file size for ".concat(key, ":"), _t.message);
          return _context.a(2, 0);
      }
    }, _callee, null, [[0, 2]]);
  }));
  return _getFileSize.apply(this, arguments);
}
function calculateJsonSizeMb(data) {
  var jsonString = JSON.stringify(data);
  var sizeBytes = new Blob([jsonString]).size;
  return (sizeBytes / (1024 * 1024)).toFixed(2);
}
function processFiles(_x2, _x3, _x4) {
  return _processFiles.apply(this, arguments);
}
function _processFiles() {
  _processFiles = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(id, keys, userId) {
    var batchStartTime, totalSizeBytes, invalidKeys, validKeys, fileSizes, fileObjects, presignedLatency, urls, presignedDuration, links, canonicalDataLatency, canonicalData, canonicalDuration, invertedIndex_v2, invertedIndexLatency, _canonicalData$0$page, invertedDuration, chunksTimer, chunks, chunksLatency, embeddingsTimer, embeddingsLatency, uploadJsonTimer, _yield$Promise$all$th, _yield$Promise$all$th2, pagesContentRef, invertedIndexRef, chunksRef, uploadJsonLatency, pagesContentSizeMb, invertedIndexSizeMb, chunksSizeMb, totalStorageMb, data, totalDuration, _t2;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          batchStartTime = Date.now();
          totalSizeBytes = 0;
          if (Array.isArray(keys)) {
            _context2.n = 1;
            break;
          }
          console.error('❌ processFiles: keys is not an array', {
            type: _typeof(keys),
            value: keys,
            parseId: id,
            userId: userId
          });
          throw new _errorHandler.AppError('Invalid keys parameter: expected array', 400, 'INVALID_KEYS_TYPE');
        case 1:
          // Filter out non-string keys and log them
          invalidKeys = keys.filter(function (key) {
            return typeof key !== 'string';
          });
          if (invalidKeys.length > 0) {
            console.error('❌ processFiles: found non-string keys', {
              invalidKeys: invalidKeys,
              invalidCount: invalidKeys.length,
              totalCount: keys.length,
              parseId: id,
              userId: userId
            });
          }

          // Use only valid string keys
          validKeys = keys.filter(function (key) {
            return typeof key === 'string' && key.trim().length > 0;
          });
          if (!(validKeys.length === 0)) {
            _context2.n = 2;
            break;
          }
          console.error('❌ processFiles: no valid keys found', {
            originalKeys: keys,
            parseId: id,
            userId: userId
          });
          throw new _errorHandler.AppError('No valid file keys provided', 400, 'NO_VALID_KEYS');
        case 2:
          if (validKeys.length !== keys.length) {
            console.warn('⚠️ processFiles: filtered out invalid keys', {
              originalCount: keys.length,
              validCount: validKeys.length,
              removedCount: keys.length - validKeys.length,
              parseId: id
            });
          }

          // Replace keys with validKeys for the rest of the function
          keys = validKeys;
          _context2.n = 3;
          return Promise.all(keys.map(function (key) {
            return getFileSize(key);
          }));
        case 3:
          fileSizes = _context2.v;
          totalSizeBytes = fileSizes.reduce(function (sum, size) {
            return sum + size;
          }, 0);
          fileObjects = keys.map(function (key, index) {
            var parts = key.split("-");
            var originalname = parts.slice(6).join("-") || key;
            return {
              key: key,
              file_name: originalname,
              file_type: "PDF",
              status: "PROCESSED",
              size_bytes: fileSizes[index]
            };
          });
          presignedLatency = new _processMetrics.SearchTimer("Presignedurl");
          _context2.n = 4;
          return (0, _upload.createPresignedUrls)(fileObjects);
        case 4:
          urls = _context2.v;
          presignedDuration = presignedLatency.stop();
          (0, _processMetrics.trackProcessingStage)({
            parseId: id,
            userId: userId,
            stageName: "presigned_urls",
            durationMs: presignedDuration,
            itemCount: fileObjects.length,
            metadata: {}
          });
          links = urls.map(function (url) {
            return url.presignedUrl;
          });
          if (!(!links || links.length === 0)) {
            _context2.n = 5;
            break;
          }
          throw new _errorHandler.AppError("No valid file URLs generated", 500, "NO_URLS_GENERATED_ERROR");
        case 5:
          canonicalDataLatency = new _processMetrics.SearchTimer("Canonical Data");
          _context2.n = 6;
          return Promise.all(links.map(function (link, index) {
            return callMain(link, fileObjects[index].file_name, fileObjects[index], id, userId);
          })).then(function (result) {
            return result;
          });
        case 6:
          canonicalData = _context2.v;
          canonicalDuration = canonicalDataLatency.stop();
          (0, _processMetrics.trackProcessingStage)({
            parseId: id,
            userId: userId,
            stageName: "canonical_data_extraction",
            durationMs: canonicalDuration,
            itemCount: canonicalData.length,
            metadata: {
              avg_duration_per_file: (canonicalDuration / canonicalData.length).toFixed(2)
            }
          });
          invertedIndexLatency = new _processMetrics.SearchTimer("Inverted Index");
          _context2.p = 7;
          console.log("Canonical data structure:", {
            type: _typeof(canonicalData),
            isArray: Array.isArray(canonicalData),
            length: canonicalData === null || canonicalData === void 0 ? void 0 : canonicalData.length,
            firstDocSample: canonicalData !== null && canonicalData !== void 0 && canonicalData[0] ? {
              hasPages: !!canonicalData[0].pages,
              pagesType: _typeof(canonicalData[0].pages),
              pagesLength: (_canonicalData$0$page = canonicalData[0].pages) === null || _canonicalData$0$page === void 0 ? void 0 : _canonicalData$0$page.length
            } : null
          });
          invertedIndex_v2 = (0, _indexing.createInvertedSearch_V2_1)(canonicalData);
          console.log("Inverted index created successfully with", Object.keys(invertedIndex_v2).length, "keys");
          invertedDuration = invertedIndexLatency.stop();
          (0, _processMetrics.trackProcessingStage)({
            parseId: id,
            userId: userId,
            stageName: "inverted_index",
            durationMs: invertedDuration,
            itemCount: Object.keys(invertedIndex_v2).length,
            metadata: {}
          });
          _context2.n = 9;
          break;
        case 8:
          _context2.p = 8;
          _t2 = _context2.v;
          console.error("Failed to create inverted index:", {
            errorMessage: _t2.message,
            errorCode: _t2.code,
            errorStack: _t2.stack
          });
          throw new _errorHandler.AppError("Failed to get inverted index: ".concat(_t2.message), 500, "FAILED_INVERTED_INDEX_ERROR");
        case 9:
          chunksTimer = new _processMetrics.SearchTimer("Chunks");
          chunks = (0, _chunks.createContextualChunks_v2)(canonicalData);
          chunksLatency = chunksTimer.stop();
          (0, _processMetrics.trackProcessingStage)({
            parseId: id,
            userId: userId,
            stageName: "chunking",
            durationMs: chunksLatency,
            itemCount: chunks.length,
            metadata: {
              avg_chunk_size: chunks.length > 0 ? (chunks.reduce(function (sum, c) {
                var _c$text;
                return sum + (((_c$text = c.text) === null || _c$text === void 0 ? void 0 : _c$text.length) || 0);
              }, 0) / chunks.length).toFixed(2) : 0
            }
          });
          embeddingsTimer = new _processMetrics.SearchTimer("Embeddings");
          _context2.n = 10;
          return (0, _embeddings.generateAndUploadEmbeddings_v2)(id, userId, chunks);
        case 10:
          embeddingsLatency = embeddingsTimer.stop();
          (0, _processMetrics.trackProcessingStage)({
            parseId: id,
            userId: userId,
            stageName: "embeddings",
            durationMs: embeddingsLatency,
            itemCount: chunks.length,
            metadata: {
              avg_duration_per_chunk: chunks.length > 0 ? (embeddingsLatency / chunks.length).toFixed(2) : 0
            }
          });
          uploadJsonTimer = new _processMetrics.SearchTimer("Upload JSON");
          _context2.n = 11;
          return Promise.all([(0, _upload.uploadJsonToS3)(id, "pages_content", canonicalData), (0, _upload.uploadJsonToS3)(id, "inverted_index", invertedIndex_v2), (0, _upload.uploadJsonToS3)(id, "chunks", chunks)]).then(function (result) {
            uploadJsonTimer.stop();
            return result;
          });
        case 11:
          _yield$Promise$all$th = _context2.v;
          _yield$Promise$all$th2 = _slicedToArray(_yield$Promise$all$th, 3);
          pagesContentRef = _yield$Promise$all$th2[0];
          invertedIndexRef = _yield$Promise$all$th2[1];
          chunksRef = _yield$Promise$all$th2[2];
          uploadJsonLatency = uploadJsonTimer.stop();
          pagesContentSizeMb = parseFloat(calculateJsonSizeMb(canonicalData));
          invertedIndexSizeMb = parseFloat(calculateJsonSizeMb(invertedIndex_v2));
          chunksSizeMb = parseFloat(calculateJsonSizeMb(chunks));
          totalStorageMb = pagesContentSizeMb + invertedIndexSizeMb + chunksSizeMb;
          (0, _processMetrics.trackProcessingStage)({
            parseId: id,
            userId: userId,
            stageName: "upload_json",
            durationMs: uploadJsonLatency,
            itemCount: 3,
            metadata: {
              pages_content_mb: pagesContentSizeMb,
              inverted_index_mb: invertedIndexSizeMb,
              chunks_mb: chunksSizeMb,
              total_storage_mb: totalStorageMb
            }
          });
          _context2.n = 12;
          return (0, _persist.saveFilesRecord)(id, userId, fileObjects, invertedIndexRef, pagesContentRef, chunksRef);
        case 12:
          data = _context2.v;
          totalDuration = Date.now() - batchStartTime;
          (0, _processMetrics.trackBatchProcessing)({
            parseId: id,
            userId: userId,
            fileCount: keys.length,
            totalSizeBytes: totalSizeBytes,
            totalDurationMs: totalDuration,
            totalStorageMb: totalStorageMb,
            successCount: keys.length,
            failureCount: 0,
            stageLatencies: {
              presigned_urls_ms: presignedDuration,
              canonical_data_ms: canonicalDuration,
              inverted_index_ms: invertedIndexLatency.stop(),
              chunking_ms: chunksLatency,
              embeddings_ms: embeddingsLatency,
              upload_json_ms: uploadJsonLatency
            }
          });
          console.log("\uD83C\uDF89 Lambda processing completed successfully for parse_id: ".concat(id, " - All files processed, indexed, and saved to database"));
          return _context2.a(2, data);
      }
    }, _callee2, null, [[7, 8]]);
  }));
  return _processFiles.apply(this, arguments);
}
function callMain(_x5, _x6, _x7, _x8, _x9) {
  return _callMain.apply(this, arguments);
}
function _callMain() {
  _callMain = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(presignedUrl, fileName, fileObject, parseId, userId) {
    var fileStartTime, data, fileDuration, storageMb, _fileDuration, _t3;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.p = _context3.n) {
        case 0:
          fileStartTime = Date.now();
          _context3.p = 1;
          _context3.n = 2;
          return (0, _pRetry["default"])(function () {
            return (0, _geometryClient.invokeGeometry)("/parse_to_json", {
              url: presignedUrl,
              file_name: fileName
            });
          }, {
            retries: 3,
            minTimeout: 2000,
            onFailedAttempt: function onFailedAttempt(error) {
              console.warn("Python parser call attempt ".concat(error.attemptNumber, " failed for ").concat(fileName, ". ").concat(error.retriesLeft, " retries left."));
            }
          });
        case 2:
          data = _context3.v;
          (0, _geometryClient.invokeGeometry)("/precompute_geometry", {
            url: presignedUrl
          }, true)["catch"](function (err) {
            return console.warn("Geometry precompute failed for ".concat(fileName, ":"), err.message);
          });
          fileDuration = Date.now() - fileStartTime;
          storageMb = parseFloat(calculateJsonSizeMb(data));
          (0, _processMetrics.trackFileProcessing)({
            parseId: parseId,
            userId: userId,
            fileName: fileName,
            fileSizeBytes: fileObject.size_bytes,
            durationMs: fileDuration,
            storageMb: storageMb,
            status: "success",
            errorMessage: null
          });
          return _context3.a(2, data);
        case 3:
          _context3.p = 3;
          _t3 = _context3.v;
          _fileDuration = Date.now() - fileStartTime;
          (0, _processMetrics.trackFileProcessing)({
            parseId: parseId,
            userId: userId,
            fileName: fileName,
            fileSizeBytes: fileObject.size_bytes,
            durationMs: _fileDuration,
            storageMb: 0,
            status: "failed",
            errorMessage: _t3.message
          });
          throw _t3;
        case 4:
          return _context3.a(2);
      }
    }, _callee3, null, [[1, 3]]);
  }));
  return _callMain.apply(this, arguments);
}