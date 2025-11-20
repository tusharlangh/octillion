"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OptimizedKeywordIndex = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
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
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var OptimizedKeywordIndex = exports.OptimizedKeywordIndex = /*#__PURE__*/function () {
  function OptimizedKeywordIndex() {
    _classCallCheck(this, OptimizedKeywordIndex);
    this.prefixIndex = {};
    this.suffixIndex = {};
    this.ngramIndex = new Map();
    this.wordPositions = new Map();
    this.seen = new Set();
  }
  return _createClass(OptimizedKeywordIndex, [{
    key: "add",
    value: function add(word, pageId, y) {
      if (!word || word.length === 0) return;
      var normalizedWord = word.toLowerCase().replace(/[^a-z]/g, "");
      if (normalizedWord.length === 0) return;
      var uniqueKey = "".concat(normalizedWord, ":").concat(pageId, ":").concat(y);
      if (this.seen.has(uniqueKey)) return;
      this.seen.add(uniqueKey);
      var firstChar = normalizedWord[0];
      if (firstChar && /[a-z]/.test(firstChar)) {
        if (!this.prefixIndex[firstChar]) {
          this.prefixIndex[firstChar] = [];
        }
        this.prefixIndex[firstChar].push([normalizedWord, pageId, y]);
      }
      var lastChar = normalizedWord[normalizedWord.length - 1];
      if (lastChar && /[a-z]/.test(lastChar)) {
        if (!this.suffixIndex[lastChar]) {
          this.suffixIndex[lastChar] = [];
        }
        this.suffixIndex[lastChar].push([normalizedWord, pageId, y]);
      }
      if (normalizedWord.length >= 3) {
        for (var i = 0; i <= normalizedWord.length - 3; i++) {
          var ngram = normalizedWord.substring(i, i + 3);
          if (!this.ngramIndex.has(ngram)) {
            this.ngramIndex.set(ngram, new Set());
          }
          this.ngramIndex.get(ngram).add(uniqueKey);
        }
      } else {
        if (!this.wordPositions.has(normalizedWord)) {
          this.wordPositions.set(normalizedWord, new Set());
        }
        this.wordPositions.get(normalizedWord).add("".concat(pageId, ":").concat(y));
      }
    }
  }, {
    key: "finalize",
    value: function finalize() {
      for (var _char in this.prefixIndex) {
        this.prefixIndex[_char].sort(function (a, b) {
          return a[0].localeCompare(b[0]);
        });
      }
      for (var _char2 in this.suffixIndex) {
        this.suffixIndex[_char2].sort(function (a, b) {
          return a[0].localeCompare(b[0]);
        });
      }
    }
  }, {
    key: "search",
    value: function search(pattern) {
      var matchType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "all";
      if (!pattern || pattern.length === 0) return [];
      var normalizedPattern = pattern.toLowerCase().replace(/[^a-z]/g, "");
      if (normalizedPattern.length === 0) return [];
      var results = new Map();
      if (matchType === "all" || matchType === "prefix") {
        var prefixResults = this._searchPrefix(normalizedPattern);
        var _iterator = _createForOfIteratorHelper(prefixResults),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var result = _step.value;
            var key = "".concat(result[0], ":").concat(result[1], ":").concat(result[2]);
            results.set(key, result);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
      if (matchType === "all" || matchType === "suffix") {
        var suffixResults = this._searchSuffix(normalizedPattern);
        var _iterator2 = _createForOfIteratorHelper(suffixResults),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var _result = _step2.value;
            var _key = "".concat(_result[0], ":").concat(_result[1], ":").concat(_result[2]);
            results.set(_key, _result);
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }
      if (matchType === "all" || matchType === "infix") {
        var infixResults = this._searchInfix(normalizedPattern);
        var _iterator3 = _createForOfIteratorHelper(infixResults),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var _result2 = _step3.value;
            var _key2 = "".concat(_result2[0], ":").concat(_result2[1], ":").concat(_result2[2]);
            results.set(_key2, _result2);
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
      }
      return Array.from(results.values());
    }
  }, {
    key: "_searchPrefix",
    value: function _searchPrefix(prefix) {
      var firstChar = prefix[0];
      if (!firstChar || !this.prefixIndex[firstChar]) {
        return [];
      }
      var array = this.prefixIndex[firstChar];
      var results = [];
      var left = 0;
      var right = array.length - 1;
      var startIdx = -1;
      while (left <= right) {
        var mid = Math.floor((left + right) / 2);
        var word = array[mid][0];
        if (word.startsWith(prefix)) {
          startIdx = mid;
          right = mid - 1;
        } else if (word < prefix) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }
      if (startIdx === -1) return [];
      for (var i = startIdx; i < array.length; i++) {
        var _word = array[i][0];
        if (_word.startsWith(prefix)) {
          results.push(array[i]);
        } else {
          break;
        }
      }
      return results;
    }
  }, {
    key: "_searchSuffix",
    value: function _searchSuffix(suffix) {
      var lastChar = suffix[suffix.length - 1];
      if (!lastChar || !this.suffixIndex[lastChar]) {
        return [];
      }
      var array = this.suffixIndex[lastChar];
      var results = [];

      // Linear scan (could be optimized with reverse trie, but this is simpler)
      var _iterator4 = _createForOfIteratorHelper(array),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var entry = _step4.value;
          if (entry[0].endsWith(suffix)) {
            results.push(entry);
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
      return results;
    }
  }, {
    key: "_searchInfix",
    value: function _searchInfix(pattern) {
      var _this = this;
      if (pattern.length < 3) {
        // For short patterns, check word positions directly
        var _results = [];
        var _iterator5 = _createForOfIteratorHelper(this.wordPositions.entries()),
          _step5;
        try {
          for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
            var _step5$value = _slicedToArray(_step5.value, 2),
              word = _step5$value[0],
              positions = _step5$value[1];
            if (word.includes(pattern)) {
              var _iterator6 = _createForOfIteratorHelper(positions),
                _step6;
              try {
                for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                  var pos = _step6.value;
                  var _pos$split = pos.split(":"),
                    _pos$split2 = _slicedToArray(_pos$split, 2),
                    pageId = _pos$split2[0],
                    y = _pos$split2[1];
                  _results.push([word, pageId, parseInt(y, 10)]);
                }
              } catch (err) {
                _iterator6.e(err);
              } finally {
                _iterator6.f();
              }
            }
          }
        } catch (err) {
          _iterator5.e(err);
        } finally {
          _iterator5.f();
        }
        return _results;
      }

      // Extract 3-grams from pattern
      var patternNGrams = [];
      for (var i = 0; i <= pattern.length - 3; i++) {
        patternNGrams.push(pattern.substring(i, i + 3));
      }
      if (patternNGrams.length === 0) return [];

      // Find intersection of n-gram sets
      var candidateKeys = null;
      var _loop = function _loop() {
          var ngram = _patternNGrams[_i];
          if (!_this.ngramIndex.has(ngram)) {
            return {
              v: []
            }; // Pattern doesn't exist
          }
          var ngramSet = _this.ngramIndex.get(ngram);
          if (candidateKeys === null) {
            candidateKeys = new Set(ngramSet);
          } else {
            // Intersection
            candidateKeys = new Set(_toConsumableArray(candidateKeys).filter(function (x) {
              return ngramSet.has(x);
            }));
          }
          if (candidateKeys.size === 0) {
            return {
              v: []
            };
          }
        },
        _ret;
      for (var _i = 0, _patternNGrams = patternNGrams; _i < _patternNGrams.length; _i++) {
        _ret = _loop();
        if (_ret) return _ret.v;
      }

      // Convert keys back to [word, pageId, y] format
      var results = [];
      var _iterator7 = _createForOfIteratorHelper(candidateKeys),
        _step7;
      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var key = _step7.value;
          var _key$split = key.split(":"),
            _key$split2 = _slicedToArray(_key$split, 3),
            _word2 = _key$split2[0],
            _pageId = _key$split2[1],
            _y = _key$split2[2];
          // Verify word actually contains pattern (n-gram intersection might have false positives)
          if (_word2.includes(pattern)) {
            results.push([_word2, _pageId, parseInt(_y, 10)]);
          }
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }
      return results;
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      var ngramIndexSerialized = {};
      var _iterator8 = _createForOfIteratorHelper(this.ngramIndex.entries()),
        _step8;
      try {
        for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
          var _step8$value = _slicedToArray(_step8.value, 2),
            ngram = _step8$value[0],
            set = _step8$value[1];
          ngramIndexSerialized[ngram] = Array.from(set);
        }
      } catch (err) {
        _iterator8.e(err);
      } finally {
        _iterator8.f();
      }
      var wordPositionsSerialized = {};
      var _iterator9 = _createForOfIteratorHelper(this.wordPositions.entries()),
        _step9;
      try {
        for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
          var _step9$value = _slicedToArray(_step9.value, 2),
            word = _step9$value[0],
            _set = _step9$value[1];
          wordPositionsSerialized[word] = Array.from(_set);
        }
      } catch (err) {
        _iterator9.e(err);
      } finally {
        _iterator9.f();
      }
      return {
        prefixIndex: this.prefixIndex,
        suffixIndex: this.suffixIndex,
        ngramIndex: ngramIndexSerialized,
        wordPositions: wordPositionsSerialized
      };
    }
  }, {
    key: "getStorageSize",
    value: function getStorageSize() {
      var size = 0;
      for (var _char3 in this.prefixIndex) {
        size += this.prefixIndex[_char3].length;
      }
      for (var _char4 in this.suffixIndex) {
        size += this.suffixIndex[_char4].length;
      }
      var _iterator0 = _createForOfIteratorHelper(this.ngramIndex.values()),
        _step0;
      try {
        for (_iterator0.s(); !(_step0 = _iterator0.n()).done;) {
          var set = _step0.value;
          size += set.size;
        }
      } catch (err) {
        _iterator0.e(err);
      } finally {
        _iterator0.f();
      }
      return size;
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(data) {
      var index = new OptimizedKeywordIndex();
      index.prefixIndex = data.prefixIndex || {};
      index.suffixIndex = data.suffixIndex || {};
      for (var _char5 in index.prefixIndex) {
        index.prefixIndex[_char5].sort(function (a, b) {
          return a[0].localeCompare(b[0]);
        });
      }
      for (var _char6 in index.suffixIndex) {
        index.suffixIndex[_char6].sort(function (a, b) {
          return a[0].localeCompare(b[0]);
        });
      }
      index.ngramIndex = new Map();
      if (data.ngramIndex) {
        for (var _i2 = 0, _Object$entries = Object.entries(data.ngramIndex); _i2 < _Object$entries.length; _i2++) {
          var _Object$entries$_i = _slicedToArray(_Object$entries[_i2], 2),
            ngram = _Object$entries$_i[0],
            array = _Object$entries$_i[1];
          index.ngramIndex.set(ngram, new Set(array));
        }
      }
      index.wordPositions = new Map();
      if (data.wordPositions) {
        for (var _i3 = 0, _Object$entries2 = Object.entries(data.wordPositions); _i3 < _Object$entries2.length; _i3++) {
          var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i3], 2),
            word = _Object$entries2$_i[0],
            _array = _Object$entries2$_i[1];
          index.wordPositions.set(word, new Set(_array));
        }
      }
      for (var _char7 in index.prefixIndex) {
        var _iterator1 = _createForOfIteratorHelper(index.prefixIndex[_char7]),
          _step1;
        try {
          for (_iterator1.s(); !(_step1 = _iterator1.n()).done;) {
            var entry = _step1.value;
            index.seen.add("".concat(entry[0], ":").concat(entry[1], ":").concat(entry[2]));
          }
        } catch (err) {
          _iterator1.e(err);
        } finally {
          _iterator1.f();
        }
      }
      return index;
    }
  }]);
}();