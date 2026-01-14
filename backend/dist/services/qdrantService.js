"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.searchQdrant = searchQdrant;
var _client = _interopRequireDefault(require("../utils/qdrant/client.js"));
var _errorHandler = require("../middleware/errorHandler.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function getCollectionName(parseId, userId) {
  if (!parseId || !userId) {
    throw new _errorHandler.ValidationError("Parse ID and User ID are required");
  }
  return "parse_".concat(parseId, "_").concat(userId);
}
function isNotFoundError(error) {
  var _error$message, _error$message2;
  return (error === null || error === void 0 ? void 0 : error.status) === 404 || (error === null || error === void 0 ? void 0 : error.statusCode) === 404 || (error === null || error === void 0 || (_error$message = error.message) === null || _error$message === void 0 ? void 0 : _error$message.includes("404")) || (error === null || error === void 0 || (_error$message2 = error.message) === null || _error$message2 === void 0 ? void 0 : _error$message2.toLowerCase().includes("not found"));
}
function searchQdrant(_x, _x2, _x3) {
  return _searchQdrant.apply(this, arguments);
}
function _searchQdrant() {
  _searchQdrant = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(parseId, userId, queryEmbedding) {
    var options,
      _options$topK,
      topK,
      collectionName,
      searchResults,
      results,
      _iterator,
      _step,
      result,
      _args = arguments,
      _t,
      _t2,
      _t3,
      _t4;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          options = _args.length > 3 && _args[3] !== undefined ? _args[3] : {};
          _context.p = 1;
          if (parseId) {
            _context.n = 2;
            break;
          }
          throw new _errorHandler.ValidationError("Parse ID is required");
        case 2:
          if (userId) {
            _context.n = 3;
            break;
          }
          throw new _errorHandler.ValidationError("User ID is required");
        case 3:
          _options$topK = options.topK, topK = _options$topK === void 0 ? 10 : _options$topK;
          /*
          const cached = await getCachedQdrant(parseId, userId, queryEmbedding);
          if (cached) {
            return cached;
          }
          */
          _context.p = 4;
          collectionName = getCollectionName(parseId, userId);
          _context.n = 7;
          break;
        case 5:
          _context.p = 5;
          _t = _context.v;
          if (!_t.isOperational) {
            _context.n = 6;
            break;
          }
          throw _t;
        case 6:
          throw new _errorHandler.AppError("Failed to get collection name: ".concat(_t.message), 500, "GET_COLLECTION_NAME_ERROR");
        case 7:
          _context.p = 7;
          _context.n = 8;
          return _client["default"].search(collectionName, {
            vector: queryEmbedding,
            limit: topK,
            with_payload: {
              include: ["chunk_id", "stats"]
            },
            with_vector: false
          });
        case 8:
          searchResults = _context.v;
          _context.n = 12;
          break;
        case 9:
          _context.p = 9;
          _t2 = _context.v;
          if (!_t2.isOperational) {
            _context.n = 10;
            break;
          }
          throw _t2;
        case 10:
          if (!isNotFoundError(_t2)) {
            _context.n = 11;
            break;
          }
          return _context.a(2, []);
        case 11:
          throw new _errorHandler.AppError("Failed to search Qdrant: ".concat(_t2.message), 500, "SEARCH_QDRANT_ERROR");
        case 12:
          if (searchResults) {
            _context.n = 13;
            break;
          }
          return _context.a(2, []);
        case 13:
          results = [];
          _iterator = _createForOfIteratorHelper(searchResults);
          _context.p = 14;
          _iterator.s();
        case 15:
          if ((_step = _iterator.n()).done) {
            _context.n = 18;
            break;
          }
          result = _step.value;
          if (!(!result || !result.payload)) {
            _context.n = 16;
            break;
          }
          return _context.a(3, 17);
        case 16:
          results.push({
            chunk_id: result.payload.chunk_id,
            chunk_index: result.payload.stats.chunk_index,
            score: result.score
          });
        case 17:
          _context.n = 15;
          break;
        case 18:
          _context.n = 20;
          break;
        case 19:
          _context.p = 19;
          _t3 = _context.v;
          _iterator.e(_t3);
        case 20:
          _context.p = 20;
          _iterator.f();
          return _context.f(20);
        case 21:
          return _context.a(2, results);
        case 22:
          _context.p = 22;
          _t4 = _context.v;
          if (!_t4.isOperational) {
            _context.n = 23;
            break;
          }
          throw _t4;
        case 23:
          throw new _errorHandler.AppError("Failed to search global Qdrant: ".concat(_t4.message), 500, "SEARCH_QDRANT_ERROR");
        case 24:
          return _context.a(2);
      }
    }, _callee, null, [[14, 19, 20, 21], [7, 9], [4, 5], [1, 22]]);
  }));
  return _searchQdrant.apply(this, arguments);
}