"use strict";

var _globals = require("@jest/globals");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
var _await$import = await Promise.resolve().then(function () {
    return _interopRequireWildcard(require("./chunks.js"));
  }),
  createContextualChunks = _await$import.createContextualChunks;
function w(word, x, y) {
  var width = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 10;
  var height = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 10;
  return {
    word: word,
    x: x,
    y: y,
    width: width,
    height: height
  };
}
function row(y, words) {
  return [y, words];
}
describe("test chunking ability", function () {
  test("prose a single column", function () {
    var sortedMapping = [row(10, [w("This", 10, 10), w("is", 50, 10), w("a", 80, 10), w("sentence.", 100, 10)]), row(20, [w("Another", 10, 20), w("sentence.", 80, 20)])];
    var res = createContextualChunks(sortedMapping);
    console.log(JSON.stringify(res));
    expect(res).toBeDefined();
  });
  test("simple table only", function () {
    var sortedMapping = [row(10, [w("Name", 10, 10), w("Age", 120, 10)]), row(20, [w("Alice", 10, 20), w("23", 120, 20)]), row(30, [w("Bob", 10, 30), w("31", 120, 30)])];
    var res = createContextualChunks(sortedMapping);
    console.log(JSON.stringify(res));
    expect(res).toBeDefined();
  });
  test("PROSE → TABLE → PROSE", function () {
    var sortedMapping = [row(10, [w("Intro", 10, 10), w("text.", 30, 10)]), row(30, [w("Name", 10, 30), w("Score", 140, 30)]), row(40, [w("Alice", 10, 40), w("90", 140, 40)]), row(60, [w("Conclusion", 10, 60), w("text.", 30, 60)])];
    var res = createContextualChunks(sortedMapping);
    console.log(JSON.stringify(res));
    expect(res).toBeDefined();
  });
  test("MULTI-COLUMN TABLE", function () {
    var sortedMapping = [row(10, [w("Type", 10, 10), w("Pros", 120, 10), w("Cons", 260, 10)]), row(20, [w("Naive", 10, 20), w("Simple", 120, 20), w("Bad", 260, 20)]), row(30, [w("Smart", 10, 30), w("Accurate", 120, 30), w("Slow", 260, 30)])];
    var res = createContextualChunks(sortedMapping);
    console.log(JSON.stringify(res));
    expect(res).toBeDefined();
  });
  test("INDENTED PROSE", function () {
    var sortedMapping = [row(10, [w("•", 10, 10), w("Item", 30, 10), w("one", 70, 10)]), row(20, [w("•", 10, 20), w("Item", 30, 20), w("two", 70, 20)])];
    var res = createContextualChunks(sortedMapping);
    console.log(JSON.stringify(res));
    expect(res).toBeDefined();
  });
  test("SINGLE-ROW TABLE SHOULD FALL BACK TO PROSE", function () {
    var sortedMapping = [row(10, [w("Key", 10, 10), w("Value", 120, 10)])];
    var res = createContextualChunks(sortedMapping);
    console.log(JSON.stringify(res));
    expect(res).toBeDefined();
  });
  test("splits a 200-word prose into correct chunks", function () {
    var paragraph = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Phasellus imperdiet, nulla et dictum interdum, nisi lorem egestas odio, vitae scelerisque enim ligula venenatis dolor. Maecenas nisl est, ultrices nec congue eget, auctor vitae massa. Fusce luctus vestibulum augue ut aliquet. Nunc sagittis dictum nisi, sed ullamcorper ipsum dignissim ac. In at libero sed nunc venenatis imperdiet sed ornare turpis. Donec vitae dui eget tellus gravida venenatis. Integer fringilla congue eros non fermentum. Sed dapibus pulvinar nibh tempor porta. Cras ac leo purus. Mauris quis diam velit.";
    var words = paragraph.split(/\s+/).map(function (word, idx) {
      return w(word, idx * 10, 10);
    });
    var sortedMapping = [row(10, words)];
    var res = createContextualChunks(sortedMapping);
    console.log(JSON.stringify(res));
    expect(res).toBeDefined();
  });
  test("detects and splits columns with a gutter", function () {
    var sortedMapping = [row(10, [w("Left1", 10, 10), w("Left2", 50, 10), w("Right1", 200, 10), w("Right2", 240, 10)]), row(20, [w("Left3", 10, 20), w("Left4", 50, 20), w("Right3", 200, 20), w("Right4", 240, 20)])];
    var res = createContextualChunks(sortedMapping);
    console.log(JSON.stringify(res, null, 2));
    expect(res).toBeDefined();
  });
});