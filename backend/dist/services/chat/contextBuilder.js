"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildContext = buildContext;
exports.buildFullContext = buildFullContext;
var _errorHandler = require("../../middleware/errorHandler.js");
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function extractPageNumber(pageId) {
  try {
    var parts = pageId.split(".");
    if (parts.length < 2 || !parts[1]) {
      throw new _errorHandler.AppError("Invalid pageId format", 500, "INVALID_PAGE_ID_FORMAT");
    }
    return parts[1];
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new _errorHandler.AppError("Failed to extract page number: ".concat(error.message), 500, "EXTRACT_PAGE_NUMBER_ERROR");
  }
}
function buildContext(searchResults, pagesContent) {
  try {
    if (!searchResults || searchResults.length === 0) {
      throw new _errorHandler.AppError("Search results are empty", 500, "EMPTY_SEARCH_RESULTS");
    }
    if (!pagesContent) {
      throw new _errorHandler.AppError("Pages content is invalid", 500, "INVALID_PAGES_CONTENT");
    }
    var pageMap = new Map();
    var _iterator = _createForOfIteratorHelper(searchResults),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var result = _step.value;
        if (!result || !result.pageId) {
          continue;
        }
        if (!pageMap.has(result.pageId)) {
          try {
            pageMap.set(result.pageId, {
              pageId: result.pageId,
              fileName: result.file_name || "Unknown",
              pageNumber: extractPageNumber(result.pageId),
              sentences: []
            });
          } catch (error) {
            continue;
          }
        }
        if (result.sentence && !pageMap.get(result.pageId).sentences.includes(result.sentence)) {
          pageMap.get(result.pageId).sentences.push(result.sentence);
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    if (pageMap.size === 0) {
      throw new _errorHandler.AppError("No valid pages found in search results", 500, "NO_VALID_PAGES");
    }
    var contextParts = [];
    var _iterator2 = _createForOfIteratorHelper(pageMap),
      _step2;
    try {
      var _loop = function _loop() {
        var _step2$value = _slicedToArray(_step2.value, 2),
          pageId = _step2$value[0],
          pageData = _step2$value[1];
        var page = pagesContent.find(function (p) {
          return p && p.id === pageId;
        });
        var pageRef = "[".concat(pageData.fileName, ", Page ").concat(pageData.pageNumber, "]");
        if (page && page.site_content) {
          contextParts.push("".concat(pageRef, "\n").concat(page.site_content));
        } else if (pageData.sentences.length > 0) {
          contextParts.push("".concat(pageRef, "\n").concat(pageData.sentences.join(" ")));
        }
      };
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        _loop();
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
    if (contextParts.length === 0) {
      throw new _errorHandler.AppError("No context content available", 500, "NO_CONTEXT_CONTENT");
    }
    return contextParts.join("\n\n");
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new _errorHandler.AppError("Failed to build context: ".concat(error.message), 500, "BUILD_CONTEXT_ERROR");
  }
}
function buildFullContext(pagesContent) {
  try {
    if (!pagesContent || pagesContent.length === 0) {
      throw new _errorHandler.AppError("Pages content is empty", 500, "EMPTY_PAGES_CONTENT");
    }
    var contextParts = [];
    var _iterator3 = _createForOfIteratorHelper(pagesContent),
      _step3;
    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var page = _step3.value;
        if (!page || !page.id) {
          continue;
        }
        try {
          var fileName = page.file_name || "Document";
          var pageNumber = extractPageNumber(page.id);
          var pageRef = "[".concat(fileName, ", Page ").concat(pageNumber, "]");
          if (page.site_content) {
            contextParts.push("".concat(pageRef, "\n").concat(page.site_content));
          }
        } catch (error) {
          continue;
        }
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
    if (contextParts.length === 0) {
      throw new _errorHandler.AppError("No document content found", 500, "NO_DOCUMENT_CONTENT");
    }
    return contextParts.join("\n\n");
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new _errorHandler.AppError("Failed to build full context: ".concat(error.message), 500, "BUILD_FULL_CONTEXT_ERROR");
  }
}