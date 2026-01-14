"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.invokeGeometry = invokeGeometry;
var _clientLambda = require("@aws-sdk/client-lambda");
var _dotenv = _interopRequireDefault(require("dotenv"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
_dotenv["default"].config();
var lambdaClient = new _clientLambda.LambdaClient({
  region: process.env.AWS_REGION || "us-east-1"
});
function invokeGeometry(_x, _x2) {
  return _invokeGeometry.apply(this, arguments);
}
function _invokeGeometry() {
  _invokeGeometry = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(path, payload) {
    var isAsync,
      isProd,
      baseUrl,
      fetchPromise,
      _response,
      functionName,
      command,
      response,
      payloadString,
      result,
      _args = arguments,
      _t,
      _t2;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          isAsync = _args.length > 2 && _args[2] !== undefined ? _args[2] : false;
          isProd = process.env.NODE_ENV === "production";
          if (isProd) {
            _context.n = 5;
            break;
          }
          baseUrl = process.env.GEOMETRY_SERVICE_URL || "http://localhost:8000";
          fetchPromise = fetch("".concat(baseUrl).concat(path), {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          });
          if (!isAsync) {
            _context.n = 1;
            break;
          }
          return _context.a(2, {
            status: "queued"
          });
        case 1:
          _context.n = 2;
          return fetchPromise;
        case 2:
          _response = _context.v;
          if (_response.ok) {
            _context.n = 3;
            break;
          }
          throw new Error("HTTP ".concat(_response.status, ": ").concat(_response.statusText));
        case 3:
          _context.n = 4;
          return _response.json();
        case 4:
          return _context.a(2, _context.v);
        case 5:
          functionName = process.env.GEOMETRY_LAMBDA_NAME;
          command = new _clientLambda.InvokeCommand({
            FunctionName: functionName,
            InvocationType: isAsync ? "Event" : "RequestResponse",
            Payload: JSON.stringify({
              path: path,
              httpMethod: "POST",
              body: JSON.stringify(payload)
            })
          });
          _context.n = 6;
          return lambdaClient.send(command);
        case 6:
          response = _context.v;
          if (!isAsync) {
            _context.n = 7;
            break;
          }
          return _context.a(2, {
            status: "queued"
          });
        case 7:
          payloadString = Buffer.from(response.Payload).toString();
          _context.p = 8;
          result = JSON.parse(payloadString);
          _context.n = 10;
          break;
        case 9:
          _context.p = 9;
          _t = _context.v;
          console.error("Failed to parse Lambda payload:", {
            error: _t.message,
            payload: payloadString.substring(0, 1000),
            path: path,
            functionName: functionName
          });
          throw new Error("Failed to parse Lambda response: ".concat(_t.message));
        case 10:
          if (!(result.statusCode && result.statusCode >= 400)) {
            _context.n = 11;
            break;
          }
          throw new Error("Lambda Error ".concat(result.statusCode, ": ").concat(result.body));
        case 11:
          if (result.body) {
            _context.n = 12;
            break;
          }
          console.error("Lambda returned no body:", {
            result: result,
            path: path,
            functionName: functionName
          });
          throw new Error("Lambda returned empty body");
        case 12:
          _context.p = 12;
          return _context.a(2, JSON.parse(result.body));
        case 13:
          _context.p = 13;
          _t2 = _context.v;
          console.error("Failed to parse result.body:", {
            error: _t2.message,
            body: typeof result.body === "string" ? result.body.substring(0, 1000) : result.body,
            bodyType: _typeof(result.body),
            path: path,
            functionName: functionName
          });
          throw new Error("Failed to parse Lambda body: ".concat(_t2.message));
        case 14:
          return _context.a(2);
      }
    }, _callee, null, [[12, 13], [8, 9]]);
  }));
  return _invokeGeometry.apply(this, arguments);
}