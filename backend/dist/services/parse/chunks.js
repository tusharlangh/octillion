"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createContextualChunks = createContextualChunks;
var _errorHandler = require("../../middleware/errorHandler.js");
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function createContextualChunks(sortedMapping) {
  var chunkSizeInWords = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 80;
  var overlapWords = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 20;
  if (!sortedMapping || sortedMapping.length === 0) {
    return "";
  }
  try {
    var chunks = [];
    var currentWords = [];
    var currentYRange = [];
    var _iterator = _createForOfIteratorHelper(sortedMapping),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var _currentWords;
        var _step$value = _slicedToArray(_step.value, 2),
          y = _step$value[0],
          row = _step$value[1];
        var words = row.map(function (w) {
          return w.word;
        });
        if (!words || words.length === 0) continue;
        (_currentWords = currentWords).push.apply(_currentWords, _toConsumableArray(words));
        currentYRange.push(y);
        if (currentWords.length >= chunkSizeInWords) {
          var chunkText = currentWords.join(" ");
          chunks.push({
            text: chunkText,
            startY: currentYRange[0],
            endY: currentYRange[currentYRange.length - 1],
            wordCount: currentWords.length
          });
          currentWords = currentWords.slice(-overlapWords);
          currentYRange = currentYRange.slice(-overlapWords);
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    if (currentWords.length > 30) {
      chunks.push({
        text: currentWords.join(" "),
        startY: currentYRange[0],
        endY: currentYRange[currentYRange.length - 1],
        wordCount: currentWords.length
      });
    }
    return chunks;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new _errorHandler.AppError("Failed building chunks", 500, "BUILDING_CHUNKS_ERROR");
  }
}