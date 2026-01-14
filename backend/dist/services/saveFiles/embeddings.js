"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateAndUploadEmbeddings_v2 = generateAndUploadEmbeddings_v2;
var _errorHandler = require("../../middleware/errorHandler.js");
var _callToEmbed = require("../../utils/callsAi/callToEmbed.js");
var _client = _interopRequireDefault(require("../../utils/qdrant/client.js"));
var _pRetry = _interopRequireDefault(require("p-retry"));
var _crypto = _interopRequireDefault(require("crypto"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _regeneratorValues(e) { if (null != e) { var t = e["function" == typeof Symbol && Symbol.iterator || "@@iterator"], r = 0; if (t) return t.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) return { next: function next() { return e && r >= e.length && (e = void 0), { value: e && e[r++], done: !e }; } }; } throw new TypeError(_typeof(e) + " is not iterable"); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function getCollectionName(parseId, userId) {
  if (!parseId || !userId) {
    throw new _errorHandler.ValidationError("Parse ID and User ID are required");
  }
  return "parse_".concat(parseId, "_").concat(userId);
}
function ensureCollection(_x) {
  return _ensureCollection.apply(this, arguments);
}
function _ensureCollection() {
  _ensureCollection = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(collectionName) {
    var vectorSize,
      collections,
      exists,
      _args = arguments,
      _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          vectorSize = _args.length > 1 && _args[1] !== undefined ? _args[1] : 1536;
          _context.p = 1;
          _context.n = 2;
          return _client["default"].getCollections();
        case 2:
          collections = _context.v;
          exists = collections.collections.some(function (c) {
            return c.name === collectionName;
          });
          if (!exists) {
            _context.n = 3;
            break;
          }
          console.log("Collection ".concat(collectionName, " already exists"));
          return _context.a(2);
        case 3:
          _context.n = 4;
          return _client["default"].createCollection(collectionName, {
            vectors: {
              size: vectorSize,
              distance: "Cosine"
            },
            strict_mode_config: {
              enabled: false
            },
            optimizers_config: {
              indexing_threshold: 20000
            }
          });
        case 4:
          _context.n = 6;
          break;
        case 5:
          _context.p = 5;
          _t = _context.v;
          console.error("Failed to ensure collection:", _t);
          throw new _errorHandler.AppError("Failed to create collection: ".concat(_t.message), 500, "COLLECTION_CREATION_FAILED");
        case 6:
          return _context.a(2);
      }
    }, _callee, null, [[1, 5]]);
  }));
  return _ensureCollection.apply(this, arguments);
}
function callToEmbedWithRetry(_x2, _x3, _x4) {
  return _callToEmbedWithRetry.apply(this, arguments);
}
function _callToEmbedWithRetry() {
  _callToEmbedWithRetry = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(text, MAX_RETRIES, RETRY_DELAY) {
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          return _context3.a(2, (0, _pRetry["default"])(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
            var embedding;
            return _regenerator().w(function (_context2) {
              while (1) switch (_context2.n) {
                case 0:
                  _context2.n = 1;
                  return (0, _callToEmbed.callToEmbed)(text, "text-embedding-3-small", true);
                case 1:
                  embedding = _context2.v;
                  if (!(!Array.isArray(embedding) || embedding.length === 0)) {
                    _context2.n = 2;
                    break;
                  }
                  throw new Error("Invalid embedding response");
                case 2:
                  return _context2.a(2, embedding);
              }
            }, _callee2);
          })), {
            retries: MAX_RETRIES,
            minTimeout: RETRY_DELAY,
            onFailedAttempt: function onFailedAttempt(error) {
              console.warn("Embedding attempt ".concat(error.attemptNumber, " failed. ").concat(error.retriesLeft, " retries left."));
            }
          }));
      }
    }, _callee3);
  }));
  return _callToEmbedWithRetry.apply(this, arguments);
}
function batchEmbed(_x5, _x6, _x7) {
  return _batchEmbed.apply(this, arguments);
}
function _batchEmbed() {
  _batchEmbed = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(texts, MAX_RETRIES, RETRY_DELAY) {
    var embeddings, errors, results;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          embeddings = [];
          errors = [];
          _context4.n = 1;
          return Promise.allSettled(texts.map(function (text, idx) {
            return callToEmbedWithRetry(text, MAX_RETRIES, RETRY_DELAY)["catch"](function (err) {
              errors.push({
                index: idx,
                error: err
              });
              return null;
            });
          }));
        case 1:
          results = _context4.v;
          results.forEach(function (result, idx) {
            if (result.status === "fulfilled" && result.value) {
              embeddings.push(result.value);
            } else {
              embeddings.push(null);
              if (result.status === "rejected") {
                errors.push({
                  index: idx,
                  error: result.reason
                });
              }
            }
          });
          return _context4.a(2, embeddings);
      }
    }, _callee4);
  }));
  return _batchEmbed.apply(this, arguments);
}
function generateAndUploadEmbeddings_v2(_x8, _x9, _x0) {
  return _generateAndUploadEmbeddings_v.apply(this, arguments);
}
function _generateAndUploadEmbeddings_v() {
  _generateAndUploadEmbeddings_v = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(id, userId, chunks) {
    var options,
      _options$EMBEDDING_BA,
      EMBEDDING_BATCH_SIZE,
      _options$QDRANT_BATCH,
      QDRANT_BATCH_SIZE,
      _options$MAX_RETRIES,
      MAX_RETRIES,
      _options$RETRY_DELAY,
      RETRY_DELAY,
      collectionName,
      successCount,
      failureCount,
      totalPointsUploaded,
      i,
      batch,
      batchEmbeddings,
      points,
      j,
      _chunk$stats$chunk_in,
      _chunk$stats,
      embedding,
      chunk,
      _loop,
      k,
      _args7 = arguments,
      _t3,
      _t4;
    return _regenerator().w(function (_context7) {
      while (1) switch (_context7.p = _context7.n) {
        case 0:
          options = _args7.length > 3 && _args7[3] !== undefined ? _args7[3] : {};
          _context7.p = 1;
          if (!(!id || !userId)) {
            _context7.n = 2;
            break;
          }
          throw new _errorHandler.ValidationError("Document ID and User ID are required");
        case 2:
          _options$EMBEDDING_BA = options.EMBEDDING_BATCH_SIZE, EMBEDDING_BATCH_SIZE = _options$EMBEDDING_BA === void 0 ? 128 : _options$EMBEDDING_BA, _options$QDRANT_BATCH = options.QDRANT_BATCH_SIZE, QDRANT_BATCH_SIZE = _options$QDRANT_BATCH === void 0 ? 100 : _options$QDRANT_BATCH, _options$MAX_RETRIES = options.MAX_RETRIES, MAX_RETRIES = _options$MAX_RETRIES === void 0 ? 3 : _options$MAX_RETRIES, _options$RETRY_DELAY = options.RETRY_DELAY, RETRY_DELAY = _options$RETRY_DELAY === void 0 ? 1000 : _options$RETRY_DELAY;
          collectionName = getCollectionName(id, userId);
          _context7.n = 3;
          return ensureCollection(collectionName);
        case 3:
          successCount = 0;
          failureCount = 0;
          totalPointsUploaded = 0;
          i = 0;
        case 4:
          if (!(i < chunks.length)) {
            _context7.n = 17;
            break;
          }
          batch = chunks.slice(i, i + EMBEDDING_BATCH_SIZE);
          _context7.p = 5;
          _context7.n = 6;
          return batchEmbed(batch.map(function (c) {
            return c.text;
          }), MAX_RETRIES, RETRY_DELAY);
        case 6:
          batchEmbeddings = _context7.v;
          points = [];
          j = 0;
        case 7:
          if (!(j < batch.length)) {
            _context7.n = 10;
            break;
          }
          embedding = batchEmbeddings[j];
          if (embedding) {
            _context7.n = 8;
            break;
          }
          failureCount++;
          return _context7.a(3, 9);
        case 8:
          chunk = batch[j];
          points.push({
            id: _crypto["default"].randomUUID(),
            vector: embedding,
            payload: {
              text: chunk.text,
              chunk_id: chunk.id,
              chunk_index: (_chunk$stats$chunk_in = (_chunk$stats = chunk.stats) === null || _chunk$stats === void 0 ? void 0 : _chunk$stats.chunk_index) !== null && _chunk$stats$chunk_in !== void 0 ? _chunk$stats$chunk_in : j,
              source: chunk.source,
              stats: chunk.stats,
              structure: chunk.structure,
              user_id: userId,
              doc_id: id,
              created_at: new Date().toISOString()
            }
          });
          successCount++;
        case 9:
          j++;
          _context7.n = 7;
          break;
        case 10:
          if (!(points.length === 0)) {
            _context7.n = 11;
            break;
          }
          return _context7.a(3, 16);
        case 11:
          _loop = /*#__PURE__*/_regenerator().m(function _loop() {
            var qdrantBatch;
            return _regenerator().w(function (_context6) {
              while (1) switch (_context6.n) {
                case 0:
                  qdrantBatch = points.slice(k, k + QDRANT_BATCH_SIZE);
                  _context6.n = 1;
                  return (0, _pRetry["default"])(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
                    var _t2;
                    return _regenerator().w(function (_context5) {
                      while (1) switch (_context5.p = _context5.n) {
                        case 0:
                          _context5.p = 0;
                          _context5.n = 1;
                          return _client["default"].upsert(collectionName, {
                            wait: true,
                            points: qdrantBatch
                          });
                        case 1:
                          totalPointsUploaded += qdrantBatch.length;
                          _context5.n = 3;
                          break;
                        case 2:
                          _context5.p = 2;
                          _t2 = _context5.v;
                          console.error("\u274C Qdrant upsert error:", _t2.message);
                          throw _t2;
                        case 3:
                          return _context5.a(2);
                      }
                    }, _callee5, null, [[0, 2]]);
                  })), {
                    retries: MAX_RETRIES,
                    minTimeout: RETRY_DELAY,
                    onFailedAttempt: function onFailedAttempt(error) {
                      console.warn("Retry ".concat(error.attemptNumber, "/").concat(MAX_RETRIES + 1, " - ").concat(error.retriesLeft, " left"));
                    }
                  });
                case 1:
                  return _context6.a(2);
              }
            }, _loop);
          });
          k = 0;
        case 12:
          if (!(k < points.length)) {
            _context7.n = 14;
            break;
          }
          return _context7.d(_regeneratorValues(_loop()), 13);
        case 13:
          k += QDRANT_BATCH_SIZE;
          _context7.n = 12;
          break;
        case 14:
          _context7.n = 16;
          break;
        case 15:
          _context7.p = 15;
          _t3 = _context7.v;
          console.error("Batch error:", _t3.message);
          failureCount += batch.length;
          return _context7.a(3, 16);
        case 16:
          i += EMBEDDING_BATCH_SIZE;
          _context7.n = 4;
          break;
        case 17:
          return _context7.a(2, {
            success: true,
            total: chunks.length,
            successful: successCount,
            failed: failureCount,
            collectionName: collectionName
          });
        case 18:
          _context7.p = 18;
          _t4 = _context7.v;
          if (!_t4.isOperational) {
            _context7.n = 19;
            break;
          }
          throw _t4;
        case 19:
          throw new _errorHandler.AppError("Failed to generate and upload embeddings: ".concat(_t4.message), 500, "EMBEDDING_PROCESS_FAILED", {
            originalError: _t4.message
          });
        case 20:
          return _context7.a(2);
      }
    }, _callee6, null, [[5, 15], [1, 18]]);
  }));
  return _generateAndUploadEmbeddings_v.apply(this, arguments);
}