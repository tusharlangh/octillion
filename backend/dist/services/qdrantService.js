"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deleteCollection = deleteCollection;
exports.ensureCollection = ensureCollection;
exports.getCollectionInfo = getCollectionInfo;
exports.searchQdrant = searchQdrant;
exports.uploadChunksToQdrant = uploadChunksToQdrant;
var _client = _interopRequireDefault(require("../utils/qdrant/client.js"));
var _errorHandler = require("../middleware/errorHandler.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function getCollectionName(parseId, userId) {
  try {
    if (!parseId) {
      throw new _errorHandler.ValidationError("Parse ID is required");
    }
    if (!userId) {
      throw new _errorHandler.ValidationError("User ID is required");
    }
    return "parse_".concat(parseId, "_").concat(userId);
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new _errorHandler.AppError("Failed to get collection name: ".concat(error.message), 500, "GET_COLLECTION_NAME_ERROR");
  }
}
var VECTOR_DIMENSION = 384;
function isNotFoundError(error) {
  var _error$message, _error$message2;
  return (error === null || error === void 0 ? void 0 : error.status) === 404 || (error === null || error === void 0 ? void 0 : error.statusCode) === 404 || (error === null || error === void 0 || (_error$message = error.message) === null || _error$message === void 0 ? void 0 : _error$message.includes("404")) || (error === null || error === void 0 || (_error$message2 = error.message) === null || _error$message2 === void 0 ? void 0 : _error$message2.toLowerCase().includes("not found"));
}
function ensureCollection(_x, _x2) {
  return _ensureCollection.apply(this, arguments);
}
function _ensureCollection() {
  _ensureCollection = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(parseId, userId) {
    var collectionName, _t, _t2, _t3;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          _context.p = 0;
          if (parseId) {
            _context.n = 1;
            break;
          }
          throw new _errorHandler.ValidationError("Parse ID is required");
        case 1:
          if (userId) {
            _context.n = 2;
            break;
          }
          throw new _errorHandler.ValidationError("User ID is required");
        case 2:
          collectionName = getCollectionName(parseId, userId);
          _context.p = 3;
          _context.n = 4;
          return _client["default"].getCollection(collectionName);
        case 4:
          return _context.a(2, collectionName);
        case 5:
          _context.p = 5;
          _t = _context.v;
          if (!_t.isOperational) {
            _context.n = 6;
            break;
          }
          throw _t;
        case 6:
          if (!isNotFoundError(_t)) {
            _context.n = 11;
            break;
          }
          _context.p = 7;
          _context.n = 8;
          return _client["default"].createCollection(collectionName, {
            vectors: {
              size: VECTOR_DIMENSION,
              distance: "Cosine"
            },
            optimizers_config: {
              default_segment_number: 2
            },
            replication_factor: 1
          });
        case 8:
          return _context.a(2, collectionName);
        case 9:
          _context.p = 9;
          _t2 = _context.v;
          if (!_t2.isOperational) {
            _context.n = 10;
            break;
          }
          throw _t2;
        case 10:
          throw new _errorHandler.AppError("Failed to create collection: ".concat(_t2.message), 500, "CREATE_COLLECTION_ERROR");
        case 11:
          throw new _errorHandler.AppError("Failed to get collection: ".concat(_t.message), 500, "GET_COLLECTION_ERROR");
        case 12:
          _context.p = 12;
          _t3 = _context.v;
          if (!_t3.isOperational) {
            _context.n = 13;
            break;
          }
          throw _t3;
        case 13:
          throw new _errorHandler.AppError("Failed to ensure collection: ".concat(_t3.message), 500, "ENSURE_COLLECTION_ERROR");
        case 14:
          return _context.a(2);
      }
    }, _callee, null, [[7, 9], [3, 5], [0, 12]]);
  }));
  return _ensureCollection.apply(this, arguments);
}
function uploadChunksToQdrant(_x3, _x4, _x5) {
  return _uploadChunksToQdrant.apply(this, arguments);
}
function _uploadChunksToQdrant() {
  _uploadChunksToQdrant = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(parseId, userId, chunksData) {
    var collectionName, points, i, chunkData, embedding, pageId, file_name, startY, endY, text, wordCount, BATCH_SIZE, batches, _i, CONCURRENT_BATCHES, _i2, batchGroup, _t4, _t5, _t6;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          _context2.p = 0;
          if (parseId) {
            _context2.n = 1;
            break;
          }
          throw new _errorHandler.ValidationError("Parse ID is required");
        case 1:
          if (userId) {
            _context2.n = 2;
            break;
          }
          throw new _errorHandler.ValidationError("User ID is required");
        case 2:
          if (!(!chunksData || chunksData.length === 0)) {
            _context2.n = 3;
            break;
          }
          throw new _errorHandler.ValidationError("Chunks data is required and must be a non-empty array");
        case 3:
          _context2.p = 3;
          _context2.n = 4;
          return ensureCollection(parseId, userId);
        case 4:
          collectionName = _context2.v;
          _context2.n = 7;
          break;
        case 5:
          _context2.p = 5;
          _t4 = _context2.v;
          if (!_t4.isOperational) {
            _context2.n = 6;
            break;
          }
          throw _t4;
        case 6:
          throw new _errorHandler.AppError("Failed to ensure collection: ".concat(_t4.message), 500, "ENSURE_COLLECTION_ERROR");
        case 7:
          if (collectionName) {
            _context2.n = 8;
            break;
          }
          throw new _errorHandler.AppError("Invalid collection name", 500, "INVALID_COLLECTION_NAME");
        case 8:
          points = [];
          i = 0;
        case 9:
          if (!(i < chunksData.length)) {
            _context2.n = 14;
            break;
          }
          chunkData = chunksData[i];
          if (chunkData) {
            _context2.n = 10;
            break;
          }
          return _context2.a(3, 13);
        case 10:
          embedding = chunkData.embedding, pageId = chunkData.pageId, file_name = chunkData.file_name, startY = chunkData.startY, endY = chunkData.endY, text = chunkData.text, wordCount = chunkData.wordCount;
          if (!(!embedding || embedding.length !== VECTOR_DIMENSION)) {
            _context2.n = 11;
            break;
          }
          return _context2.a(3, 13);
        case 11:
          if (pageId) {
            _context2.n = 12;
            break;
          }
          return _context2.a(3, 13);
        case 12:
          points.push({
            id: i + 1,
            vector: embedding,
            payload: {
              pageId: pageId,
              file_name: file_name || "Unknown",
              startY: startY || 0,
              endY: endY || 0,
              text: text || "",
              wordCount: wordCount || 0,
              parseId: parseId,
              userId: userId
            }
          });
        case 13:
          i++;
          _context2.n = 9;
          break;
        case 14:
          if (!(points.length === 0)) {
            _context2.n = 15;
            break;
          }
          throw new _errorHandler.AppError("No valid chunks to upload", 400, "NO_VALID_CHUNKS");
        case 15:
          BATCH_SIZE = 100;
          batches = [];
          for (_i = 0; _i < points.length; _i += BATCH_SIZE) {
            batches.push(points.slice(_i, _i + BATCH_SIZE));
          }
          CONCURRENT_BATCHES = 3;
          _i2 = 0;
        case 16:
          if (!(_i2 < batches.length)) {
            _context2.n = 22;
            break;
          }
          batchGroup = batches.slice(_i2, _i2 + CONCURRENT_BATCHES);
          _context2.p = 17;
          _context2.n = 18;
          return Promise.all(batchGroup.map(function (batch) {
            return _client["default"].upsert(collectionName, {
              wait: true,
              points: batch
            });
          }));
        case 18:
          _context2.n = 21;
          break;
        case 19:
          _context2.p = 19;
          _t5 = _context2.v;
          if (!_t5.isOperational) {
            _context2.n = 20;
            break;
          }
          throw _t5;
        case 20:
          throw new _errorHandler.AppError("Failed to upload batch: ".concat(_t5.message), 500, "UPLOAD_BATCH_ERROR");
        case 21:
          _i2 += CONCURRENT_BATCHES;
          _context2.n = 16;
          break;
        case 22:
          return _context2.a(2, {
            success: true,
            collectionName: collectionName,
            totalPoints: points.length
          });
        case 23:
          _context2.p = 23;
          _t6 = _context2.v;
          if (!_t6.isOperational) {
            _context2.n = 24;
            break;
          }
          throw _t6;
        case 24:
          throw new _errorHandler.AppError("Failed to upload chunks to Qdrant: ".concat(_t6.message), 500, "UPLOAD_CHUNKS_ERROR");
        case 25:
          return _context2.a(2);
      }
    }, _callee2, null, [[17, 19], [3, 5], [0, 23]]);
  }));
  return _uploadChunksToQdrant.apply(this, arguments);
}
function searchQdrant(_x6, _x7, _x8) {
  return _searchQdrant.apply(this, arguments);
}
function _searchQdrant() {
  _searchQdrant = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(parseId, userId, queryEmbedding) {
    var options,
      _options$topK,
      topK,
      _options$scoreThresho,
      scoreThreshold,
      _options$filter,
      filter,
      collectionName,
      searchResults,
      results,
      _iterator,
      _step,
      result,
      _args3 = arguments,
      _t7,
      _t8,
      _t9,
      _t0,
      _t1;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.p = _context3.n) {
        case 0:
          options = _args3.length > 3 && _args3[3] !== undefined ? _args3[3] : {};
          _context3.p = 1;
          if (parseId) {
            _context3.n = 2;
            break;
          }
          throw new _errorHandler.ValidationError("Parse ID is required");
        case 2:
          if (userId) {
            _context3.n = 3;
            break;
          }
          throw new _errorHandler.ValidationError("User ID is required");
        case 3:
          if (!(!queryEmbedding || queryEmbedding.length !== VECTOR_DIMENSION)) {
            _context3.n = 4;
            break;
          }
          throw new _errorHandler.ValidationError("Query embedding is required and must be an array of length ".concat(VECTOR_DIMENSION));
        case 4:
          _options$topK = options.topK, topK = _options$topK === void 0 ? 10 : _options$topK, _options$scoreThresho = options.scoreThreshold, scoreThreshold = _options$scoreThresho === void 0 ? 0.0 : _options$scoreThresho, _options$filter = options.filter, filter = _options$filter === void 0 ? null : _options$filter;
          if (!(topK <= 0 || topK > 1000)) {
            _context3.n = 5;
            break;
          }
          throw new _errorHandler.ValidationError("topK must be a number between 1 and 1000");
        case 5:
          if (!(scoreThreshold < 0 || scoreThreshold > 1)) {
            _context3.n = 6;
            break;
          }
          throw new _errorHandler.ValidationError("scoreThreshold must be a number between 0 and 1");
        case 6:
          _context3.p = 6;
          collectionName = getCollectionName(parseId, userId);
          _context3.n = 9;
          break;
        case 7:
          _context3.p = 7;
          _t7 = _context3.v;
          if (!_t7.isOperational) {
            _context3.n = 8;
            break;
          }
          throw _t7;
        case 8:
          throw new _errorHandler.AppError("Failed to get collection name: ".concat(_t7.message), 500, "GET_COLLECTION_NAME_ERROR");
        case 9:
          _context3.p = 9;
          _context3.n = 10;
          return _client["default"].getCollection(collectionName);
        case 10:
          _context3.n = 14;
          break;
        case 11:
          _context3.p = 11;
          _t8 = _context3.v;
          if (!_t8.isOperational) {
            _context3.n = 12;
            break;
          }
          throw _t8;
        case 12:
          if (!isNotFoundError(_t8)) {
            _context3.n = 13;
            break;
          }
          return _context3.a(2, []);
        case 13:
          throw new _errorHandler.AppError("Failed to get collection: ".concat(_t8.message), 500, "GET_COLLECTION_ERROR");
        case 14:
          _context3.p = 14;
          _context3.n = 15;
          return _client["default"].search(collectionName, {
            vector: queryEmbedding,
            limit: topK,
            score_threshold: scoreThreshold,
            filter: filter,
            with_payload: true,
            with_vector: false
          });
        case 15:
          searchResults = _context3.v;
          _context3.n = 18;
          break;
        case 16:
          _context3.p = 16;
          _t9 = _context3.v;
          if (!_t9.isOperational) {
            _context3.n = 17;
            break;
          }
          throw _t9;
        case 17:
          throw new _errorHandler.AppError("Failed to search Qdrant: ".concat(_t9.message), 500, "SEARCH_QDRANT_ERROR");
        case 18:
          if (searchResults) {
            _context3.n = 19;
            break;
          }
          return _context3.a(2, []);
        case 19:
          results = [];
          _iterator = _createForOfIteratorHelper(searchResults);
          _context3.p = 20;
          _iterator.s();
        case 21:
          if ((_step = _iterator.n()).done) {
            _context3.n = 24;
            break;
          }
          result = _step.value;
          if (!(!result || !result.payload)) {
            _context3.n = 22;
            break;
          }
          return _context3.a(3, 23);
        case 22:
          results.push({
            file_name: result.payload.file_name || "Unknown",
            pageId: result.payload.pageId || "",
            startY: result.payload.startY || 0,
            endY: result.payload.endY || 0,
            sentence: result.payload.text || "",
            score: result.score || 0,
            wordCount: result.payload.wordCount || 0
          });
        case 23:
          _context3.n = 21;
          break;
        case 24:
          _context3.n = 26;
          break;
        case 25:
          _context3.p = 25;
          _t0 = _context3.v;
          _iterator.e(_t0);
        case 26:
          _context3.p = 26;
          _iterator.f();
          return _context3.f(26);
        case 27:
          return _context3.a(2, results);
        case 28:
          _context3.p = 28;
          _t1 = _context3.v;
          if (!_t1.isOperational) {
            _context3.n = 29;
            break;
          }
          throw _t1;
        case 29:
          throw new _errorHandler.AppError("Failed to search Qdrant: ".concat(_t1.message), 500, "SEARCH_QDRANT_ERROR");
        case 30:
          return _context3.a(2);
      }
    }, _callee3, null, [[20, 25, 26, 27], [14, 16], [9, 11], [6, 7], [1, 28]]);
  }));
  return _searchQdrant.apply(this, arguments);
}
function deleteCollection(_x9, _x0) {
  return _deleteCollection.apply(this, arguments);
}
function _deleteCollection() {
  _deleteCollection = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(parseId, userId) {
    var collectionName, _t10, _t11, _t12;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.p = _context4.n) {
        case 0:
          _context4.p = 0;
          if (parseId) {
            _context4.n = 1;
            break;
          }
          throw new _errorHandler.ValidationError("Parse ID is required");
        case 1:
          if (userId) {
            _context4.n = 2;
            break;
          }
          throw new _errorHandler.ValidationError("User ID is required");
        case 2:
          _context4.p = 2;
          collectionName = getCollectionName(parseId, userId);
          _context4.n = 5;
          break;
        case 3:
          _context4.p = 3;
          _t10 = _context4.v;
          if (!_t10.isOperational) {
            _context4.n = 4;
            break;
          }
          throw _t10;
        case 4:
          throw new _errorHandler.AppError("Failed to get collection name: ".concat(_t10.message), 500, "GET_COLLECTION_NAME_ERROR");
        case 5:
          _context4.p = 5;
          _context4.n = 6;
          return _client["default"].deleteCollection(collectionName);
        case 6:
          return _context4.a(2, {
            success: true
          });
        case 7:
          _context4.p = 7;
          _t11 = _context4.v;
          if (!_t11.isOperational) {
            _context4.n = 8;
            break;
          }
          throw _t11;
        case 8:
          if (!isNotFoundError(_t11)) {
            _context4.n = 9;
            break;
          }
          return _context4.a(2, {
            success: true
          });
        case 9:
          throw new _errorHandler.AppError("Failed to delete collection: ".concat(_t11.message), 500, "DELETE_COLLECTION_ERROR");
        case 10:
          _context4.p = 10;
          _t12 = _context4.v;
          if (!_t12.isOperational) {
            _context4.n = 11;
            break;
          }
          throw _t12;
        case 11:
          throw new _errorHandler.AppError("Failed to delete collection: ".concat(_t12.message), 500, "DELETE_COLLECTION_ERROR");
        case 12:
          return _context4.a(2);
      }
    }, _callee4, null, [[5, 7], [2, 3], [0, 10]]);
  }));
  return _deleteCollection.apply(this, arguments);
}
function getCollectionInfo(_x1, _x10) {
  return _getCollectionInfo.apply(this, arguments);
}
function _getCollectionInfo() {
  _getCollectionInfo = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(parseId, userId) {
    var collectionName, info, _t13, _t14, _t15;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.p = _context5.n) {
        case 0:
          _context5.p = 0;
          if (parseId) {
            _context5.n = 1;
            break;
          }
          throw new _errorHandler.ValidationError("Parse ID is required");
        case 1:
          if (userId) {
            _context5.n = 2;
            break;
          }
          throw new _errorHandler.ValidationError("User ID is required");
        case 2:
          _context5.p = 2;
          collectionName = getCollectionName(parseId, userId);
          _context5.n = 5;
          break;
        case 3:
          _context5.p = 3;
          _t13 = _context5.v;
          if (!_t13.isOperational) {
            _context5.n = 4;
            break;
          }
          throw _t13;
        case 4:
          throw new _errorHandler.AppError("Failed to get collection name: ".concat(_t13.message), 500, "GET_COLLECTION_NAME_ERROR");
        case 5:
          _context5.p = 5;
          _context5.n = 6;
          return _client["default"].getCollection(collectionName);
        case 6:
          info = _context5.v;
          return _context5.a(2, info);
        case 7:
          _context5.p = 7;
          _t14 = _context5.v;
          if (!_t14.isOperational) {
            _context5.n = 8;
            break;
          }
          throw _t14;
        case 8:
          if (!isNotFoundError(_t14)) {
            _context5.n = 9;
            break;
          }
          return _context5.a(2, null);
        case 9:
          throw new _errorHandler.AppError("Failed to get collection info: ".concat(_t14.message), 500, "GET_COLLECTION_INFO_ERROR");
        case 10:
          _context5.p = 10;
          _t15 = _context5.v;
          if (!_t15.isOperational) {
            _context5.n = 11;
            break;
          }
          throw _t15;
        case 11:
          throw new _errorHandler.AppError("Failed to get collection info: ".concat(_t15.message), 500, "GET_COLLECTION_INFO_ERROR");
        case 12:
          return _context5.a(2);
      }
    }, _callee5, null, [[5, 7], [2, 3], [0, 10]]);
  }));
  return _getCollectionInfo.apply(this, arguments);
}