"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MinHeap = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var MinHeap = exports.MinHeap = /*#__PURE__*/function () {
  function MinHeap(maxSize) {
    _classCallCheck(this, MinHeap);
    this.heap = [];
    this.maxSize = maxSize;
  }
  return _createClass(MinHeap, [{
    key: "compare",
    value: function compare(a, b) {
      return a.score - b.score;
    }
  }, {
    key: "parent",
    value: function parent(i) {
      return Math.floor((i - 1) / 2);
    }
  }, {
    key: "leftChild",
    value: function leftChild(i) {
      return 2 * i + 1;
    }
  }, {
    key: "rightChild",
    value: function rightChild(i) {
      return 2 * i + 2;
    }
  }, {
    key: "swap",
    value: function swap(i, j) {
      var _ref = [this.heap[j], this.heap[i]];
      this.heap[i] = _ref[0];
      this.heap[j] = _ref[1];
    }
  }, {
    key: "heapifyUp",
    value: function heapifyUp(i) {
      while (i > 0 && this.compare(this.heap[this.parent(i)], this.heap[i]) > 0) {
        this.swap(i, this.parent(i));
        i = this.parent(i);
      }
    }
  }, {
    key: "heapifyDown",
    value: function heapifyDown(i) {
      var min = i;
      var left = this.leftChild(i);
      var right = this.rightChild(i);
      if (left < this.heap.length && this.compare(this.heap[left], this.heap[min]) < 0) {
        min = left;
      }
      if (right < this.heap.length && this.compare(this.heap[right], this.heap[min]) < 0) {
        min = right;
      }
      if (min !== i) {
        this.swap(i, min);
        this.heapifyDown(min);
      }
    }
  }, {
    key: "push",
    value: function push(item) {
      if (this.heap.length < this.maxSize) {
        this.heap.push(item);
        this.heapifyUp(this.heap.length - 1);
      } else if (this.heap.length > 0 && item.score > this.heap[0].score) {
        this.heap[0] = item;
        this.heapifyDown(0);
      }
    }
  }, {
    key: "peek",
    value: function peek() {
      return this.heap[0];
    }
  }, {
    key: "toArray",
    value: function toArray() {
      var result = _toConsumableArray(this.heap);
      return result.sort(function (a, b) {
        return b.score - a.score;
      });
    }
  }, {
    key: "size",
    value: function size() {
      return this.heap.length;
    }
  }]);
}();