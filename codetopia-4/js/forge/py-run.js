/* The Forge: a small Python interpreter for the things the game teaches (printing, variables, maths, strings, if, loops, functions, lists, dictionaries,
   tuples, sets, comprehensions, lambda). It runs on the page with a step limit, so an endless loop stops by itself. Not supported: classes, try, imports other than math. */

"use strict";

function pyRun(src, opt) {
  opt = opt || {};
  let out = "", steps = 0, curLine = 0, depth = 0; const MAXSTEPS = opt.steps || 3e6, MAXOUT = 40000;
  class PyErr extends Error { constructor(n, m, line) { super(m); this.n = n; this.line = line; } }
  const E = (n, m) => new PyErr(n, m, curLine);
  const BRK = { b:1 }, CNT = { c:1 };
  class Ret { constructor(v) { this.v = v; } }
  class Tup { constructor(a) { this.a = a; } }
  class Bi { constructor(n, f) { this.n = n; this.f = f; } }
  class Fn { constructor(n, params, body, env, expr) { this.n = n; this.params = params; this.body = body; this.env = env; this.expr = expr; } }
  class Env { constructor(p) { this.v = new Map(); this.p = p; this.g = null; } }
  class Dict { constructor() { this.m = new Map(); } }
  class PSet { constructor() { this.m = new Map(); } }

  /* ---------------- lexer ---------------- */
  const KW = new Set("if elif else while for in not and or is def return break continue pass import from as global nonlocal del lambda None True False class try except finally with raise assert yield async await".split(" "));
  function unesc(s, raw) {
    if (raw) return s;
    return s.replace(/\\(n|t|r|\\|'|"|0|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|\n)/g, (m, c) => c === "n" ? "\n" : c === "t" ? "\t" : c === "r" ? "\r" : c === "0" ? "\0" : c === "\n" ? "" : c[0] === "x" || c[0] === "u" ? String.fromCharCode(parseInt(c.slice(1), 16)) : c);
  }
  function lex(s) {
    const toks = []; let i = 0, line = 1, depthB = 0, atStart = true; const ind = [0];
    const push = (t, v) => toks.push({ t, v, line });
    const fail = m => { curLine = line; throw new PyErr("SyntaxError", m, line); };
    while (i < s.length) {
      if (atStart && depthB === 0) {
        let j = i, col = 0; while (j < s.length && (s[j] === " " || s[j] === "\t")) { col += s[j] === "\t" ? 8 - col % 8 : 1; j++; }
        if (j >= s.length) { i = j; break; }
        if (s[j] === "\n" || s[j] === "#" || s[j] === "\r") { while (j < s.length && s[j] !== "\n") j++; i = j + 1; line++; continue; }
        if (col > ind[ind.length - 1]) { ind.push(col); push("INDENT"); }
        else while (col < ind[ind.length - 1]) { ind.pop(); push("DEDENT"); if (col > ind[ind.length - 1]) fail("unindent does not match any outer indentation level"); }
        i = j; atStart = false;
      }
      const c = s[i];
      if (c === "\n") { i++; if (depthB > 0) { line++; continue; } push("NEWLINE"); line++; atStart = true; continue; }
      if (c === " " || c === "\t" || c === "\r") { i++; continue; }
      if (c === "#") { while (i < s.length && s[i] !== "\n") i++; continue; }
      if (c === "\\" && s[i + 1] === "\n") { i += 2; line++; continue; }
      const sm = /^([rRfFbB]{0,2})("""|'''|"|')/.exec(s.slice(i, i + 5));
      if (sm && (sm[1] === "" ? (c === '"' || c === "'") : /[rRfFbB]/.test(c))) {
        const pre = sm[1].toLowerCase(), q = sm[2]; let j = i + sm[0].length, body = "";
        for (;;) {
          if (j >= s.length) fail("unterminated string");
          if (s.startsWith(q, j)) { j += q.length; break; }
          if (s[j] === "\\") { body += s[j] + (s[j + 1] || ""); if (s[j + 1] === "\n") line++; j += 2; continue; }
          if (s[j] === "\n") { if (q.length === 1) fail("unterminated string"); line++; }
          body += s[j++];
        }
        if (pre.includes("f")) push("FSTR", { raw:body, rawMode:pre.includes("r") }); else push("STR", unesc(body, pre.includes("r")));
        i = j; continue;
      }
      let m;
      if ((m = /^(0[xX][0-9a-fA-F_]+|\d[\d_]*\.?[\d_]*(?:[eE][+-]?\d+)?|\.\d[\d_]*(?:[eE][+-]?\d+)?)/.exec(s.slice(i, i + 40)))) {
        const t = m[0].replace(/_/g, ""); i += m[0].length;
        if (/^0[xX]/.test(t)) push("NUM", BigInt(t)); else if (/[.eE]/.test(t)) push("NUM", parseFloat(t)); else push("NUM", BigInt(t));
        continue;
      }
      if ((m = /^[A-Za-z_]\w*/.exec(s.slice(i, i + 80)))) { i += m[0].length; push(KW.has(m[0]) ? "KW" : "NAME", m[0]); continue; }
      if ((m = /^(\*\*=|\/\/=|\*\*|\/\/|==|!=|<=|>=|\+=|-=|\*=|\/=|%=|->|[-+*\/%<>=()\[\]{},:.;@~&|^])/.exec(s.slice(i, i + 3)))) {
        const o = m[0]; i += o.length; if ("([{".includes(o)) depthB++; if (")]}".includes(o)) depthB = Math.max(0, depthB - 1); push("OP", o); continue;
      }
      fail("invalid character " + JSON.stringify(c));
    }
    push("NEWLINE"); while (ind.length > 1) { ind.pop(); push("DEDENT"); } push("EOF"); return toks;
  }

  /* ---------------- parser ---------------- */
  function parse(toks) {
    let p = 0;
    const peek = () => toks[p], nxt = () => toks[p++];
    const isOp = (v, t) => { t = toks[p + (t || 0)]; return t.t === "OP" && t.v === v; };
    const isKw = (v, k) => { k = toks[p + (k || 0)]; return k.t === "KW" && k.v === v; };
    const fail = (m, t) => { t = t || peek(); curLine = t.line; throw new PyErr("SyntaxError", m, t.line); };
    const eatOp = v => { if (isOp(v)) { p++; return true; } return false; };
    const eatKw = v => { if (isKw(v)) { p++; return true; } return false; };
    const needOp = v => { if (!eatOp(v)) fail("expected '" + v + "'" + (peek().t === "NEWLINE" ? " at the end of the line" : " but found '" + (peek().v === undefined ? peek().t.toLowerCase() : peek().v) + "'")); };
    const needKw = v => { if (!eatKw(v)) fail("expected '" + v + "'"); };
    const node = (k, o, line) => Object.assign({ k, line: line || toks[Math.max(0, p - 1)].line }, o);

    function block() {
      needOp(":");
      if (peek().t === "NEWLINE") {
        p++; if (peek().t !== "INDENT") fail("expected an indented block");
        p++; const body = []; while (peek().t !== "DEDENT" && peek().t !== "EOF") { if (peek().t === "NEWLINE") { p++; continue; } body.push(stmt()); }
        if (peek().t === "DEDENT") p++; return body;
      }
      const body = []; for (;;) { body.push(simple()); if (!eatOp(";")) break; if (peek().t === "NEWLINE") break; } if (peek().t === "NEWLINE") p++; return body;
    }
    function stmt() {
      const t = peek(), line = t.line;
      if (t.t === "KW") {
        switch (t.v) {
          case "if": { p++; const test = expr(); const body = block(); let orelse = []; if (isKw("elif")) { toks[p] = { t:"KW", v:"if", line:toks[p].line }; orelse = [stmt()]; } else if (eatKw("else")) orelse = block(); return node("if", { test, body, orelse }, line); }
          case "while": { p++; const test = expr(); const body = block(); return node("while", { test, body }, line); }
          case "for": { p++; const target = targetList(); needKw("in"); const iter = exprList(); const body = block(); return node("for", { target, iter, body }, line); }
          case "def": { p++; const nm = nxt(); if (nm.t !== "NAME") fail("expected a function name", nm); needOp("("); const params = parseParams(")"); needOp(")"); const body = block(); return node("def", { name:nm.v, params, body }, line); }
          case "class": fail("The Forge cannot run Python classes yet"); break;
          case "try": case "with": case "raise": case "yield": case "async": case "await": fail("The Forge cannot run '" + t.v + "' yet"); break;
        }
      }
      const s = simple(); if (!eatOp(";")) { if (peek().t === "NEWLINE") p++; else if (peek().t !== "EOF" && peek().t !== "DEDENT") fail("unexpected '" + (peek().v === undefined ? peek().t.toLowerCase() : peek().v) + "'"); } else { const more = [s]; while (peek().t !== "NEWLINE" && peek().t !== "EOF") { more.push(simple()); if (!eatOp(";")) break; } if (peek().t === "NEWLINE") p++; return more.length === 1 ? s : node("seq", { body:more }, line); }
      return s;
    }
    function parseParams(end) {
      const ps = [];
      while (!isOp(end)) {
        if (eatOp("*")) { const n = nxt(); ps.push({ n:n.v, star:true }); }
        else if (eatOp("**")) { const n = nxt(); ps.push({ n:n.v, kw:true }); }
        else { const n = nxt(); if (n.t !== "NAME") fail("expected a parameter name", n); let d = null; if (end === ")" && eatOp(":")) test(); if (eatOp("=")) d = test(); ps.push({ n:n.v, d }); }
        if (!eatOp(",")) break;
      }
      return ps;
    }
    function simple() {
      const t = peek(), line = t.line;
      if (t.t === "KW") {
        switch (t.v) {
          case "pass": p++; return node("pass", {}, line);
          case "break": p++; return node("break", {}, line);
          case "continue": p++; return node("continue", {}, line);
          case "return": { p++; let v = null; if (peek().t !== "NEWLINE" && !isOp(";") && peek().t !== "EOF") v = exprList(); return node("return", { v }, line); }
          case "global": case "nonlocal": { p++; const names = [nxt().v]; while (eatOp(",")) names.push(nxt().v); return node("global", { names }, line); }
          case "import": { p++; const names = []; do { const n = nxt(); let as = n.v; if (eatKw("as")) as = nxt().v; names.push([n.v, as]); } while (eatOp(",")); return node("import", { names }, line); }
          case "from": { p++; const m = nxt().v; needKw("import"); const names = []; if (eatOp("*")) names.push(["*", "*"]); else do { const n = nxt(); let as = n.v; if (eatKw("as")) as = nxt().v; names.push([n.v, as]); } while (eatOp(",")); return node("from", { m, names }, line); }
          case "del": { p++; const ts = [postfix()]; while (eatOp(",")) ts.push(postfix()); return node("del", { ts }, line); }
          case "assert": { p++; const e = test(); let msg = null; if (eatOp(",")) msg = test(); return node("assert", { e, msg }, line); }
        }
      }
      const first = exprList();
      if (peek().t === "OP") {
        const o = peek().v;
        if (o === "=") { const targets = [first]; let val; while (eatOp("=")) { val = exprList(); if (isOp("=")) targets.push(val); } return node("assign", { targets, val }, line); }
        if (/^(\+|-|\*|\/|\/\/|%|\*\*)=$/.test(o)) { p++; const val = exprList(); return node("aug", { op:o.slice(0, -1), target:first, val }, line); }
        if (o === ":" && first.k === "name") { p++; test(); let val = null; if (eatOp("=")) val = exprList(); return val ? node("assign", { targets:[first], val }, line) : node("pass", {}, line); }
      }
      return node("expr", { e:first }, line);
    }
    function targetList() { const t = [postfix()]; let tup = false; while (eatOp(",")) { tup = true; if (isKw("in")) break; t.push(postfix()); } return tup ? node("tuple", { items:t }) : t[0]; }
    function exprList() { const first = test(); if (!isOp(",")) return first; const items = [first]; while (eatOp(",")) { if (peek().t === "NEWLINE" || isOp("=") || isOp(")") || isOp(";") || peek().t === "EOF") break; items.push(test()); } return node("tuple", { items }); }
    const expr = () => test();
    function test() {
      if (isKw("lambda")) { p++; const params = parseParams(":"); needOp(":"); const body = test(); return node("lambda", { params, body }); }
      const e = orT();
      if (isKw("if")) { p++; const c = orT(); needKw("else"); const o = test(); return node("cond", { c, a:e, b:o }); }
      return e;
    }
    function orT() { let l = andT(); while (isKw("or")) { p++; l = node("or", { l, r:andT() }); } return l; }
    function andT() { let l = notT(); while (isKw("and")) { p++; l = node("and", { l, r:notT() }); } return l; }
    function notT() { if (isKw("not")) { p++; return node("not", { e:notT() }); } return cmp(); }
    function cmp() {
      const first = arith(); const ops = [], rest = [];
      for (;;) {
        let o = null; const t = peek();
        if (t.t === "OP" && ["<", ">", "==", "!=", "<=", ">="].includes(t.v)) { o = t.v; p++; }
        else if (isKw("in")) { o = "in"; p++; } else if (isKw("not") && isKw("in", 1)) { o = "not in"; p += 2; }
        else if (isKw("is")) { p++; o = eatKw("not") ? "is not" : "is"; } else break;
        ops.push(o); rest.push(arith());
      }
      return ops.length ? node("cmp", { first, ops, rest }) : first;
    }
    function arith() { let l = term(); while (isOp("+") || isOp("-")) { const o = nxt().v; l = node("bin", { op:o, l, r:term() }); } return l; }
    function term() { let l = unary(); while (isOp("*") || isOp("/") || isOp("//") || isOp("%")) { const o = nxt().v; l = node("bin", { op:o, l, r:unary() }); } return l; }
    function unary() { if (isOp("-") || isOp("+") || isOp("~")) { const o = nxt().v; return node("un", { op:o, e:unary() }); } return power(); }
    function power() { const b = postfix(); if (eatOp("**")) return node("bin", { op:"**", l:b, r:unary() }); return b; }
    function postfix() {
      let e = atom();
      for (;;) {
        if (isOp("(")) { p++; const args = [], kw = []; while (!isOp(")")) { if (eatOp("*")) args.push({ star:test() }); else if (eatOp("**")) kw.push({ star:test() }); else if (peek().t === "NAME" && isOp("=", 1)) { const n = nxt().v; p++; kw.push({ n, v:test() }); } else { const a = test(); if (isKw("for")) args.push(comp("gen", a)); else args.push(a); } if (!eatOp(",")) break; } needOp(")"); e = node("call", { f:e, args, kw }); }
        else if (isOp("[")) { p++; const idx = subscript(); needOp("]"); e = node("index", { e, idx }); }
        else if (isOp(".")) { p++; const n = nxt(); if (n.t !== "NAME" && n.t !== "KW") fail("expected a name after '.'", n); e = node("attr", { e, n:n.v }); }
        else break;
      }
      return e;
    }
    function subscript() {
      const part = () => { let a = null; if (!isOp(":")) a = test(); if (!isOp(":")) return a; p++; let b = null, c = null; if (!isOp(":") && !isOp("]") && !isOp(",")) b = test(); if (eatOp(":")) { if (!isOp("]") && !isOp(",")) c = test(); } return node("slice", { a, b, c }); };
      const first = part(); if (!isOp(",")) return first; const items = [first]; while (eatOp(",")) { if (isOp("]")) break; items.push(part()); } return node("tuple", { items });
    }
    function comp(kind, elt, val) {
      const clauses = []; while (isKw("for") || isKw("if")) { if (eatKw("for")) { const target = targetList(); needKw("in"); const it = orT(); clauses.push({ for:{ target, it } }); } else { p++; clauses.push({ if:orT() }); } }
      return node("comp", { kind, elt, val, clauses });
    }
    function atom() {
      const t = nxt(), line = t.line;
      if (t.t === "NUM") return node("num", { v:t.v }, line);
      if (t.t === "STR") { let s = t.v; while (peek().t === "STR") s += nxt().v; return node("str", { v:s }, line); }
      if (t.t === "FSTR") { const parts = fparts(t.v, line); while (peek().t === "FSTR" || peek().t === "STR") { const n = nxt(); if (n.t === "STR") parts.push(n.v); else parts.push(...fparts(n.v, line)); } return node("fstr", { parts }, line); }
      if (t.t === "NAME") return node("name", { n:t.v }, line);
      if (t.t === "KW") { if (t.v === "True") return node("const", { v:true }, line); if (t.v === "False") return node("const", { v:false }, line); if (t.v === "None") return node("const", { v:null }, line); }
      if (t.t === "OP") {
        if (t.v === "(") {
          if (eatOp(")")) return node("tuple", { items:[] }, line);
          const first = test(); if (isKw("for")) { const c = comp("gen", first); needOp(")"); return c; }
          if (isOp(",")) { const items = [first]; while (eatOp(",")) { if (isOp(")")) break; items.push(test()); } needOp(")"); return node("tuple", { items }, line); }
          needOp(")"); return first;
        }
        if (t.v === "[") {
          if (eatOp("]")) return node("list", { items:[] }, line);
          const first = test(); if (isKw("for")) { const c = comp("list", first); needOp("]"); return c; }
          const items = [first]; while (eatOp(",")) { if (isOp("]")) break; items.push(test()); } needOp("]"); return node("list", { items }, line);
        }
        if (t.v === "{") {
          if (eatOp("}")) return node("dict", { items:[] }, line);
          const first = test();
          if (eatOp(":")) { const v = test(); if (isKw("for")) { const c = comp("dict", first, v); needOp("}"); return c; } const items = [[first, v]]; while (eatOp(",")) { if (isOp("}")) break; const k = test(); needOp(":"); items.push([k, test()]); } needOp("}"); return node("dict", { items }, line); }
          if (isKw("for")) { const c = comp("set", first); needOp("}"); return c; }
          const items = [first]; while (eatOp(",")) { if (isOp("}")) break; items.push(test()); } needOp("}"); return node("setlit", { items }, line);
        }
      }
      fail("invalid syntax" + (t.t === "NEWLINE" ? " (the line ended too early)" : t.v !== undefined ? " near '" + t.v + "'" : ""), t);
    }
    function fparts(f, line) {
      const raw = f.raw, parts = []; let lit = "", i = 0;
      const flush = () => { if (lit) { parts.push(unesc(lit, f.rawMode)); lit = ""; } };
      while (i < raw.length) {
        const c = raw[i];
        if (c === "{" && raw[i + 1] === "{") { lit += "{"; i += 2; continue; }
        if (c === "}" && raw[i + 1] === "}") { lit += "}"; i += 2; continue; }
        if (c === "{") {
          let j = i + 1, d = 0, q = null, split = -1;
          for (; j < raw.length; j++) { const ch = raw[j]; if (q) { if (ch === q) q = null; continue; } if (ch === "'" || ch === '"') { q = ch; continue; } if ("([{".includes(ch)) d++; else if (")]".includes(ch)) d--; else if (ch === "}") { if (d === 0) break; d--; } else if (ch === ":" && d === 0 && split < 0) split = j; }
          if (j >= raw.length) fail("f-string: expecting '}'");
          let ex = raw.slice(i + 1, split < 0 ? j : split), spec = split < 0 ? "" : raw.slice(split + 1, j), conv = null;
          const cm = /!([rs])$/.exec(ex); if (cm) { conv = cm[1]; ex = ex.slice(0, -2); }
          const eq = /=\s*$/.test(ex) && !/[=!<>]=\s*$/.test(ex); let label = ""; if (eq) { label = ex; ex = ex.replace(/=\s*$/, ""); }
          flush(); const sub = lex(ex.trim()); const save = { toks, p }; const subp = parseSub(sub); parts.push({ e:subp, spec, conv, label }); i = j + 1; continue;
        }
        lit += c; i++;
      }
      flush(); return parts;
    }
    function parseSub(subToks) {
      const sv = [toks, p]; toks = subToks; p = 0;
      try { const e = exprList(); return e; } finally { toks = sv[0]; p = sv[1]; }
    }
    const prog = []; while (peek().t !== "EOF") { if (peek().t === "NEWLINE") { p++; continue; } if (peek().t === "INDENT") fail("unexpected indent"); prog.push(stmt()); }
    return prog;
  }

  /* ---------------- values ---------------- */
  const isInt = v => typeof v === "bigint", isNum = v => typeof v === "bigint" || typeof v === "number" || typeof v === "boolean";
  const tname = v => v === null ? "NoneType" : typeof v === "bigint" ? "int" : typeof v === "number" ? "float" : typeof v === "string" ? "str" : typeof v === "boolean" ? "bool" : Array.isArray(v) ? "list" : v instanceof Tup ? "tuple" : v instanceof Dict ? "dict" : v instanceof PSet ? "set" : v instanceof Fn || v instanceof Bi ? "function" : "object";
  const num = v => typeof v === "bigint" ? Number(v) : typeof v === "boolean" ? (v ? 1 : 0) : v;
  const big = v => typeof v === "boolean" ? (v ? 1n : 0n) : v;
  function fstr(x) {
    if (Number.isNaN(x)) return "nan"; if (x === Infinity) return "inf"; if (x === -Infinity) return "-inf";
    if (Number.isInteger(x) && Math.abs(x) < 1e16) return (Object.is(x, -0) ? "-0" : String(x)) + ".0";
    const a = Math.abs(x);
    if (a >= 1e16 || a < 1e-4) { const m = x.toExponential().split("e"); const ex = parseInt(m[1]); return m[0] + "e" + (ex < 0 ? "-" : "+") + String(Math.abs(ex)).padStart(2, "0"); }
    return String(x);
  }
  function repr(v) {
    if (typeof v === "string") { const q = v.includes("'") && !v.includes('"') ? '"' : "'"; return q + v.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/\t/g, "\\t").replace(/\r/g, "\\r").replace(q === "'" ? /'/g : /"/g, "\\" + q) + q; }
    return str(v, true);
  }
  function str(v, inner) {
    if (v === null) return "None"; if (v === true) return "True"; if (v === false) return "False";
    if (typeof v === "bigint") return v.toString(); if (typeof v === "number") return fstr(v);
    if (typeof v === "string") return inner ? repr(v) : v;
    if (Array.isArray(v)) return "[" + v.map(repr).join(", ") + "]";
    if (v instanceof Tup) return v.a.length === 1 ? "(" + repr(v.a[0]) + ",)" : "(" + v.a.map(repr).join(", ") + ")";
    if (v instanceof Dict) return "{" + [...v.m.values()].map(([k, x]) => repr(k) + ": " + repr(x)).join(", ") + "}";
    if (v instanceof PSet) return v.m.size ? "{" + [...v.m.values()].map(repr).join(", ") + "}" : "set()";
    if (v instanceof Fn) return "<function " + v.n + ">"; if (v instanceof Bi) return "<built-in function " + v.n + ">";
    return String(v);
  }
  const hkey = v => v === null ? "N" : typeof v === "string" ? "s" + v : isNum(v) ? "n" + num(v) : v instanceof Tup ? "t(" + v.a.map(hkey).join(",") + ")" : Array.isArray(v) || v instanceof Dict || v instanceof PSet ? (() => { throw E("TypeError", "unhashable type: '" + tname(v) + "'"); })() : "o" + str(v);
  const truthy = v => v === null || v === undefined ? false : typeof v === "boolean" ? v : typeof v === "bigint" ? v !== 0n : typeof v === "number" ? v !== 0 : typeof v === "string" ? v.length > 0 : Array.isArray(v) ? v.length > 0 : v instanceof Tup ? v.a.length > 0 : v instanceof Dict || v instanceof PSet ? v.m.size > 0 : true;
  function eq(a, b) {
    if (isNum(a) && isNum(b)) return num(a) === num(b);
    if (a === b) return true; if (typeof a !== typeof b && !(a instanceof Object && b instanceof Object)) return false;
    if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => eq(x, b[i]));
    if (a instanceof Tup && b instanceof Tup) return a.a.length === b.a.length && a.a.every((x, i) => eq(x, b.a[i]));
    if (a instanceof Dict && b instanceof Dict) return a.m.size === b.m.size && [...a.m].every(([k, [, x]]) => b.m.has(k) && eq(x, b.m.get(k)[1]));
    if (a instanceof PSet && b instanceof PSet) return a.m.size === b.m.size && [...a.m.keys()].every(k => b.m.has(k));
    return false;
  }
  function lt(a, b) {
    if (isNum(a) && isNum(b)) return num(a) < num(b);
    if (typeof a === "string" && typeof b === "string") return a < b;
    const sa = Array.isArray(a) ? a : a instanceof Tup ? a.a : null, sb = Array.isArray(b) ? b : b instanceof Tup ? b.a : null;
    if (sa && sb) { for (let i = 0; i < Math.min(sa.length, sb.length); i++) { if (!eq(sa[i], sb[i])) return lt(sa[i], sb[i]); } return sa.length < sb.length; }
    throw E("TypeError", "'<' not supported between instances of '" + tname(a) + "' and '" + tname(b) + "'");
  }
  const cmpv = (a, b) => lt(a, b) ? -1 : lt(b, a) ? 1 : 0;
  function iter(v) {
    if (Array.isArray(v)) return v; if (v instanceof Tup) return v.a; if (typeof v === "string") return [...v];
    if (v instanceof Dict) return [...v.m.values()].map(x => x[0]); if (v instanceof PSet) return [...v.m.values()];
    throw E("TypeError", "'" + tname(v) + "' object is not iterable");
  }
  const idx = (i, n, what) => { if (typeof i !== "bigint" && typeof i !== "boolean") throw E("TypeError", what + " indices must be integers, not " + tname(i)); let k = Number(big(i)); if (k < 0) k += n; if (k < 0 || k >= n) throw E("IndexError", what + " index out of range"); return k; };
  function sliceIdx(sl, n) {
    const st = sl.c === null ? 1 : Number(sl.c); if (st === 0) throw E("ValueError", "slice step cannot be zero");
    const cl = (v, d) => v === null ? d : (v = Number(v), v < 0 ? Math.max(st < 0 ? -1 : 0, v + n) : Math.min(v, st < 0 ? n - 1 : n));
    let a = cl(sl.a, st < 0 ? n - 1 : 0), b = cl(sl.b, st < 0 ? -1 : n); const r = []; for (let i = a; st > 0 ? i < b : i > b; i += st) r.push(i); return r;
  }
  function fmtSpec(v, spec) {
    const m = /^(?:(.)?([<>^=]))?([+\- ])?(#)?(0)?(\d+)?(,)?(?:\.(\d+))?([bcdeEfFgGnosxX%])?$/.exec(spec);
    if (!m) throw E("ValueError", "Invalid format specifier '" + spec + "'");
    let [, fill, align, sign, , zero, width, comma, prec, type] = m; width = width ? +width : 0; let s;
    if (type === "d" || (type === undefined && isInt(v) && prec === undefined)) { if (!isNum(v)) throw E("ValueError", "Unknown format code 'd' for object of type '" + tname(v) + "'"); s = big(v).toString(); if (type === "d" && typeof v === "number") throw E("ValueError", "Unknown format code 'd' for object of type 'float'"); }
    else if (type === "f" || type === "F") { if (!isNum(v)) throw E("ValueError", "Unknown format code 'f' for object of type '" + tname(v) + "'"); s = num(v).toFixed(prec === undefined ? 6 : +prec); }
    else if (type === "e" || type === "E") { s = num(v).toExponential(prec === undefined ? 6 : +prec).replace(/e([+-])(\d)$/, "e$10$2"); if (type === "E") s = s.toUpperCase(); }
    else if (type === "%") s = (num(v) * 100).toFixed(prec === undefined ? 6 : +prec) + "%";
    else if (type === "x") s = big(v).toString(16); else if (type === "X") s = big(v).toString(16).toUpperCase(); else if (type === "b") s = big(v).toString(2); else if (type === "o") s = big(v).toString(8);
    else if (type === "g" || (type === undefined && typeof v === "number" && prec !== undefined)) s = String(Number(num(v).toPrecision(prec === undefined ? 6 : +prec || 1)));
    else { s = str(v); if (prec !== undefined && typeof v === "string") s = s.slice(0, +prec); }
    if (comma && isNum(v)) { const parts = s.split("."); parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); s = parts.join("."); }
    if (sign === "+" && isNum(v) && num(v) >= 0) s = "+" + s; else if (sign === " " && isNum(v) && num(v) >= 0) s = " " + s;
    if (width > s.length) {
      const al = align || (isNum(v) ? ">" : "<");
      if (zero && !align) { const neg = /^[+-]/.test(s) ? s[0] : ""; s = neg + s.slice(neg.length).padStart(width - neg.length, "0"); }
      else { const f = fill || " "; s = al === "<" ? s.padEnd(width, f) : al === "^" ? s.padStart(Math.floor((width + s.length) / 2), f).padEnd(width, f) : s.padStart(width, f); }
    }
    return s;
  }
  function fmtPct(f, args) {
    let k = 0; const single = args instanceof Tup ? args.a : [args];
    return f.replace(/%([-+ 0]*)(\d+)?(?:\.(\d+))?([sdfir%])/g, (m, fl, w, pr, t) => {
      if (t === "%") return "%"; if (k >= single.length) throw E("TypeError", "not enough arguments for format string"); const v = single[k++]; let s;
      if (t === "d" || t === "i") s = String(Math.trunc(num(v))); else if (t === "f") s = num(v).toFixed(pr === undefined ? 6 : +pr); else if (t === "r") s = repr(v); else s = str(v);
      if (w) s = fl.includes("-") ? s.padEnd(+w) : s.padStart(+w, fl.includes("0") && t !== "s" ? "0" : " "); return s;
    });
  }

  /* ---------------- arithmetic ---------------- */
  function arith(op, a, b) {
    if (op === "+") {
      if (typeof a === "string" && typeof b === "string") return a + b;
      if (isNum(a) && isNum(b)) return isInt(big(a)) && isInt(big(b)) && typeof a !== "number" && typeof b !== "number" ? big(a) + big(b) : num(a) + num(b);
      if (Array.isArray(a) && Array.isArray(b)) return a.concat(b);
      if (a instanceof Tup && b instanceof Tup) return new Tup(a.a.concat(b.a));
      throw E("TypeError", "unsupported operand type(s) for +: '" + tname(a) + "' and '" + tname(b) + "'" + (typeof a === "string" || typeof b === "string" ? ". You can only join text to text; try str() to turn a number into text" : ""));
    }
    if (op === "*") {
      if (isNum(a) && isNum(b)) return typeof a !== "number" && typeof b !== "number" ? big(a) * big(b) : num(a) * num(b);
      const rep = (s, n) => { n = Number(big(n)); if (n < 0) n = 0; if (typeof s === "string") { if (s.length * n > 1e6) throw E("MemoryError", "that string would be too big"); return s.repeat(n); } if (Array.isArray(s)) { const r = []; for (let i = 0; i < n; i++) r.push(...s); return r; } return new Tup(rep(s.a, n)); };
      if ((typeof a === "string" || Array.isArray(a) || a instanceof Tup) && (isInt(b) || typeof b === "boolean")) return rep(a, b);
      if ((typeof b === "string" || Array.isArray(b) || b instanceof Tup) && (isInt(a) || typeof a === "boolean")) return rep(b, a);
      throw E("TypeError", "unsupported operand type(s) for *: '" + tname(a) + "' and '" + tname(b) + "'");
    }
    if (op === "%" && typeof a === "string") return fmtPct(a, b);
    if (!isNum(a) || !isNum(b)) throw E("TypeError", "unsupported operand type(s) for " + op + ": '" + tname(a) + "' and '" + tname(b) + "'");
    const ints = typeof a !== "number" && typeof b !== "number";
    switch (op) {
      case "-": return ints ? big(a) - big(b) : num(a) - num(b);
      case "/": if (num(b) === 0) throw E("ZeroDivisionError", "division by zero"); return num(a) / num(b);
      case "//": { if (num(b) === 0) throw E("ZeroDivisionError", "integer division or modulo by zero"); if (ints) { const x = big(a), y = big(b); let q = x / y; if ((x % y !== 0n) && ((x < 0n) !== (y < 0n))) q -= 1n; return q; } return Math.floor(num(a) / num(b)); }
      case "%": { if (num(b) === 0) throw E("ZeroDivisionError", "integer division or modulo by zero"); if (ints) { const x = big(a), y = big(b); return ((x % y) + y) % y; } const x = num(a), y = num(b); return ((x % y) + y) % y; }
      case "**": { if (ints) { const y = big(b); if (y >= 0n) { if (y > 5000n) throw E("OverflowError", "that power is too large"); return big(a) ** y; } return Math.pow(num(a), num(b)); } return Math.pow(num(a), num(b)); }
    }
    throw E("TypeError", "bad operator " + op);
  }
  function contains(c, v) {
    if (typeof c === "string") { if (typeof v !== "string") throw E("TypeError", "'in <string>' requires string as left operand, not " + tname(v)); return c.includes(v); }
    if (Array.isArray(c)) return c.some(x => eq(x, v)); if (c instanceof Tup) return c.a.some(x => eq(x, v));
    if (c instanceof Dict || c instanceof PSet) return c.m.has(hkey(v));
    throw E("TypeError", "argument of type '" + tname(c) + "' is not iterable");
  }

  /* ---------------- builtins ---------------- */
  const toInt = (v, base) => {
    if (typeof v === "string") { const t = v.trim().replace(/_/g, ""); if (!/^[+-]?\d+$/.test(t) && !(base && /^[0-9a-z]+$/i.test(t))) throw E("ValueError", "invalid literal for int() with base " + (base || 10) + ": " + repr(v)); return base ? BigInt(parseInt(t, Number(base))) : BigInt(t); }
    if (typeof v === "number") { if (!Number.isFinite(v)) throw E("OverflowError", "cannot convert float infinity or NaN to integer"); return BigInt(Math.trunc(v)); }
    if (isInt(v)) return v; if (typeof v === "boolean") return v ? 1n : 0n;
    throw E("TypeError", "int() argument must be a string or a number, not '" + tname(v) + "'");
  };
  const toFloat = v => { if (typeof v === "string") { const t = v.trim().toLowerCase(); if (t === "inf" || t === "infinity") return Infinity; if (t === "-inf") return -Infinity; if (t === "nan") return NaN; if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/.test(t)) throw E("ValueError", "could not convert string to float: " + repr(v)); return parseFloat(t); } if (isNum(v)) return num(v); throw E("TypeError", "float() argument must be a string or a number, not '" + tname(v) + "'"); };
  const mk = (n, f) => new Bi(n, f);
  const tupleOf = a => new Tup(a);
  function newDict(pairs) { const d = new Dict(); for (const [k, v] of pairs) d.m.set(hkey(k), [k, v]); return d; }
  function newSet(items) { const s = new PSet(); for (const x of items) s.m.set(hkey(x), x); return s; }
  function pyround(x, nd) {
    const half = y => { const f = Math.floor(y), d = y - f; return d < .5 ? f : d > .5 ? f + 1 : (f % 2 === 0 ? f : f + 1); };
    if (nd === undefined || nd === null) return BigInt(half(num(x)));
    const k = Number(nd), m = Math.pow(10, k); const y = num(x) * m; return isInt(x) && k >= 0 ? x : half(y) / m;
  }
  const math = { pi:Math.PI, e:Math.E, tau:2 * Math.PI, inf:Infinity, nan:NaN };
  ["sqrt", "sin", "cos", "tan", "log10", "log2", "exp", "atan", "asin", "acos"].forEach(n => { math[n] = mk(n, a => { const x = num(a[0]); if (n === "sqrt" && x < 0) throw E("ValueError", "math domain error"); return Math[n](x); }); });
  math.floor = mk("floor", a => BigInt(Math.floor(num(a[0])))); math.ceil = mk("ceil", a => BigInt(Math.ceil(num(a[0])))); math.fabs = mk("fabs", a => Math.abs(num(a[0])));
  math.log = mk("log", a => { const x = num(a[0]); if (x <= 0) throw E("ValueError", "math domain error"); return a.length > 1 ? Math.log(x) / Math.log(num(a[1])) : Math.log(x); }); math.pow = mk("pow", a => Math.pow(num(a[0]), num(a[1])));
  math.factorial = mk("factorial", a => { let r = 1n; for (let i = 2n; i <= big(a[0]); i++) r *= i; return r; }); math.gcd = mk("gcd", a => { let x = big(a[0]), y = big(a[1]); if (x < 0n) x = -x; if (y < 0n) y = -y; while (y) [x, y] = [y, x % y]; return x; });
  math.hypot = mk("hypot", a => Math.hypot(...a.map(num))); math.isqrt = mk("isqrt", a => BigInt(Math.floor(Math.sqrt(num(a[0])))));
  const modules = { math:{ m:math } };
  const B = new Map();
  const def = (n, f) => B.set(n, mk(n, f));
  def("print", (a, k) => { const sep = k.sep === undefined || k.sep === null ? " " : k.sep, end = k.end === undefined || k.end === null ? "\n" : k.end; emit(a.map(x => str(x)).join(sep) + end); return null; });
  def("len", a => { const v = a[0]; if (typeof v === "string") return BigInt(v.length); if (Array.isArray(v)) return BigInt(v.length); if (v instanceof Tup) return BigInt(v.a.length); if (v instanceof Dict || v instanceof PSet) return BigInt(v.m.size); throw E("TypeError", "object of type '" + tname(v) + "' has no len()"); });
  def("range", a => { let s = 0n, e, st = 1n; const n = a.map(x => { if (!isInt(x) && typeof x !== "boolean") throw E("TypeError", "'" + tname(x) + "' object cannot be interpreted as an integer"); return big(x); }); if (n.length === 1) e = n[0]; else { s = n[0]; e = n[1]; if (n.length > 2) st = n[2]; } if (st === 0n) throw E("ValueError", "range() arg 3 must not be zero"); const r = []; for (let i = s; st > 0n ? i < e : i > e; i += st) { r.push(i); if (r.length > 3e6) throw E("MemoryError", "that range is too large"); } return r; });
  def("str", a => a.length ? str(a[0]) : ""); def("repr", a => repr(a[0]));
  def("int", (a, k) => a.length ? toInt(a[0], a[1] || k.base) : 0n); def("float", a => a.length ? toFloat(a[0]) : 0); def("bool", a => a.length ? truthy(a[0]) : false);
  def("type", a => "<class '" + tname(a[0]) + "'>");
  def("abs", a => typeof a[0] === "number" ? Math.abs(a[0]) : isInt(big(a[0])) ? (big(a[0]) < 0n ? -big(a[0]) : big(a[0])) : 0);
  def("round", a => pyround(a[0], a[1])); def("pow", a => arith("**", a[0], a[1])); def("divmod", a => tupleOf([arith("//", a[0], a[1]), arith("%", a[0], a[1])]));
  def("chr", a => String.fromCodePoint(Number(a[0]))); def("ord", a => BigInt(a[0].codePointAt(0)));
  def("list", a => a.length ? [...iter(a[0])] : []); def("tuple", a => tupleOf(a.length ? [...iter(a[0])] : []));
  def("set", a => newSet(a.length ? iter(a[0]) : [])); def("dict", (a, k) => { const d = new Dict(); if (a.length) { const s = a[0]; if (s instanceof Dict) s.m.forEach((v, kk) => d.m.set(kk, v)); else for (const p of iter(s)) { const q = iter(p); d.m.set(hkey(q[0]), [q[0], q[1]]); } } for (const kk in k) d.m.set("s" + kk, [kk, k[kk]]); return d; });
  const key = k => k ? (x => call(k, [x], {})) : (x => x);
  const minmax = (n, sign) => (a, k) => { const items = a.length === 1 ? iter(a[0]) : a; if (!items.length) { if (k.default !== undefined) return k.default; throw E("ValueError", n + "() arg is an empty sequence"); } const f = key(k.key); let best = items[0], bk = f(best); for (let i = 1; i < items.length; i++) { const kk = f(items[i]); if (sign * cmpv(kk, bk) > 0) { best = items[i]; bk = kk; } } return best; };
  def("min", minmax("min", -1)); def("max", minmax("max", 1));
  def("sum", a => { let t = a[1] === undefined ? 0n : a[1]; for (const x of iter(a[0])) t = arith("+", t, x); return t; });
  def("sorted", (a, k) => { const f = key(k.key), items = iter(a[0]).map(x => [f(x), x]); items.sort((p, q) => cmpv(p[0], q[0])); if (truthy(k.reverse)) items.reverse(); return items.map(x => x[1]); });
  def("reversed", a => [...iter(a[0])].reverse());
  def("enumerate", (a, k) => { let s = a[1] !== undefined ? a[1] : k.start !== undefined ? k.start : 0n; return iter(a[0]).map((x, i) => tupleOf([big(s) + BigInt(i), x])); });
  def("zip", a => { const ls = a.map(iter), n = ls.length ? Math.min(...ls.map(l => l.length)) : 0, r = []; for (let i = 0; i < n; i++) r.push(tupleOf(ls.map(l => l[i]))); return r; });
  def("map", a => iter(a[1]).map(x => call(a[0], [x], {}))); def("filter", a => iter(a[1]).filter(x => a[0] === null ? truthy(x) : truthy(call(a[0], [x], {}))));
  def("any", a => iter(a[0]).some(truthy)); def("all", a => iter(a[0]).every(truthy));
  def("isinstance", a => { const t = a[1], names = t instanceof Tup ? t.a : [t]; return names.some(n => n instanceof Bi && (n.n === tname(a[0]) || (n.n === "int" && typeof a[0] === "boolean"))); });
  def("input", () => { throw E("EOFError", "input() cannot read from the keyboard in the Forge. Put the value in your code instead, for example name = \"Sam\""); });
  def("id", () => 1n); def("callable", a => a[0] instanceof Fn || a[0] instanceof Bi);

  /* ---------------- methods ---------------- */
  function method(o, n) {
    const bi = f => mk(n, f);
    if (typeof o === "string") {
      const s = o;
      const M = {
        upper:() => s.toUpperCase(), lower:() => s.toLowerCase(), title:() => s.toLowerCase().replace(/(^|[^a-z])([a-z])/g, (m, a, b) => a + b.toUpperCase()), capitalize:() => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(), swapcase:() => [...s].map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(""),
        strip:a => a[0] === undefined ? s.trim() : s.replace(new RegExp("^[" + a[0].replace(/[\]\\^-]/g, "\\$&") + "]+|[" + a[0].replace(/[\]\\^-]/g, "\\$&") + "]+$", "g"), ""), lstrip:() => s.trimStart(), rstrip:() => s.trimEnd(),
        split:a => { if (a[0] === undefined || a[0] === null) return s.trim().split(/\s+/).filter(x => x !== ""); if (a[0] === "") throw E("ValueError", "empty separator"); let p = s.split(a[0]); if (a[1] !== undefined) { const m = Number(a[1]); if (p.length > m + 1) p = p.slice(0, m).concat(p.slice(m).join(a[0])); } return p; },
        join:a => { const it = iter(a[0]); it.forEach(x => { if (typeof x !== "string") throw E("TypeError", "sequence item: expected str instance, " + tname(x) + " found"); }); return it.join(s); },
        replace:a => s.split(a[0]).join(a[1]), startswith:a => (a[0] instanceof Tup ? a[0].a : [a[0]]).some(p => s.startsWith(p)), endswith:a => (a[0] instanceof Tup ? a[0].a : [a[0]]).some(p => s.endsWith(p)),
        find:a => BigInt(s.indexOf(a[0])), index:a => { const i = s.indexOf(a[0]); if (i < 0) throw E("ValueError", "substring not found"); return BigInt(i); }, rfind:a => BigInt(s.lastIndexOf(a[0])),
        count:a => BigInt(a[0] === "" ? s.length + 1 : s.split(a[0]).length - 1), isdigit:() => /^\d+$/.test(s), isalpha:() => /^[A-Za-z]+$/.test(s), isalnum:() => /^[A-Za-z0-9]+$/.test(s), isupper:() => /[A-Z]/.test(s) && s === s.toUpperCase(), islower:() => /[a-z]/.test(s) && s === s.toLowerCase(), isspace:() => /^\s+$/.test(s),
        zfill:a => { const w = Number(a[0]), neg = /^[+-]/.test(s) ? s[0] : ""; return neg + s.slice(neg.length).padStart(w - neg.length, "0"); }, center:a => { const w = Number(a[0]), f = a[1] || " ", t = w - s.length; return t <= 0 ? s : f.repeat(Math.floor(t / 2)) + s + f.repeat(Math.ceil(t / 2)); }, ljust:a => s.padEnd(Number(a[0]), a[1] || " "), rjust:a => s.padStart(Number(a[0]), a[1] || " "),
        format:(a, k) => { let i = 0; return s.replace(/\{\{|\}\}|\{([^{}:!]*)(?:!([rs]))?(?::([^{}]*))?\}/g, (m, nm, cv, sp) => { if (m === "{{") return "{"; if (m === "}}") return "}"; let v; if (nm === "" || nm === undefined) { if (i >= a.length) throw E("IndexError", "Replacement index " + i + " out of range for positional args tuple"); v = a[i++]; } else if (/^\d+$/.test(nm)) v = a[+nm]; else { if (!(nm in k)) throw E("KeyError", repr(nm)); v = k[nm]; } if (cv === "r") v = repr(v); return fmtSpec(v, sp || ""); }); }
      };
      if (M[n]) return bi(a => M[n](a)); return null;
    }
    if (Array.isArray(o)) {
      const L = o, M = {
        append:a => { L.push(a[0]); return null; }, extend:a => { L.push(...iter(a[0])); return null; }, insert:a => { let i = Number(a[0]); if (i < 0) i = Math.max(0, L.length + i); L.splice(Math.min(i, L.length), 0, a[1]); return null; },
        pop:a => { if (!L.length) throw E("IndexError", "pop from empty list"); return a.length ? L.splice(idx(a[0], L.length, "pop"), 1)[0] : L.pop(); }, remove:a => { const i = L.findIndex(x => eq(x, a[0])); if (i < 0) throw E("ValueError", "list.remove(x): x not in list"); L.splice(i, 1); return null; },
        index:a => { const i = L.findIndex(x => eq(x, a[0])); if (i < 0) throw E("ValueError", str(a[0], true) + " is not in list"); return BigInt(i); }, count:a => BigInt(L.filter(x => eq(x, a[0])).length),
        sort:(a, k) => { const f = key(k.key), items = L.map(x => [f(x), x]); items.sort((p, q) => cmpv(p[0], q[0])); if (truthy(k.reverse)) items.reverse(); items.forEach((x, i) => { L[i] = x[1]; }); return null; },
        reverse:() => { L.reverse(); return null; }, copy:() => L.slice(), clear:() => { L.length = 0; return null; }
      };
      return M[n] ? bi((a, k) => M[n](a, k)) : null;
    }
    if (o instanceof Dict) {
      const D = o, M = {
        get:a => { const e = D.m.get(hkey(a[0])); return e ? e[1] : (a.length > 1 ? a[1] : null); }, keys:() => [...D.m.values()].map(e => e[0]), values:() => [...D.m.values()].map(e => e[1]), items:() => [...D.m.values()].map(e => tupleOf([e[0], e[1]])),
        pop:a => { const h = hkey(a[0]), e = D.m.get(h); if (!e) { if (a.length > 1) return a[1]; throw E("KeyError", repr(a[0])); } D.m.delete(h); return e[1]; }, update:(a, k) => { if (a[0] instanceof Dict) a[0].m.forEach((v, kk) => D.m.set(kk, v)); else if (a.length) for (const p of iter(a[0])) { const q = iter(p); D.m.set(hkey(q[0]), [q[0], q[1]]); } for (const kk in k) D.m.set("s" + kk, [kk, k[kk]]); return null; },
        setdefault:a => { const h = hkey(a[0]); if (!D.m.has(h)) D.m.set(h, [a[0], a.length > 1 ? a[1] : null]); return D.m.get(h)[1]; }, copy:() => { const d = new Dict(); D.m.forEach((v, kk) => d.m.set(kk, [v[0], v[1]])); return d; }, clear:() => { D.m.clear(); return null; }
      };
      return M[n] ? bi((a, k) => M[n](a, k)) : null;
    }
    if (o instanceof PSet) {
      const S = o, M = {
        add:a => { S.m.set(hkey(a[0]), a[0]); return null; }, remove:a => { if (!S.m.delete(hkey(a[0]))) throw E("KeyError", repr(a[0])); return null; }, discard:a => { S.m.delete(hkey(a[0])); return null; },
        union:a => newSet([...S.m.values(), ...iter(a[0])]), intersection:a => { const t = newSet(iter(a[0])); return newSet([...S.m.values()].filter(x => t.m.has(hkey(x)))); }, difference:a => { const t = newSet(iter(a[0])); return newSet([...S.m.values()].filter(x => !t.m.has(hkey(x)))); }, clear:() => { S.m.clear(); return null; }, copy:() => newSet(S.m.values())
      };
      return M[n] ? bi(a => M[n](a)) : null;
    }
    if (o instanceof Tup) { const M = { count:a => BigInt(o.a.filter(x => eq(x, a[0])).length), index:a => { const i = o.a.findIndex(x => eq(x, a[0])); if (i < 0) throw E("ValueError", "tuple.index(x): x not in tuple"); return BigInt(i); } }; return M[n] ? bi(a => M[n](a)) : null; }
    return null;
  }

  function getAttr(o, name) {
    if (o && o.mod) { if (name in o.m) return o.m[name]; throw E("AttributeError", "module '" + o.mod + "' has no attribute '" + name + "'"); }
    const m = method(o, name); if (m) return m; throw E("AttributeError", "'" + tname(o) + "' object has no attribute '" + name + "'");
  }
  /* ---------------- evaluator ---------------- */
  function emit(s) { out += s; if (out.length > MAXOUT) { out = out.slice(0, MAXOUT) + "\n... (output cut: too long)"; throw new PyErr("Stopped", "the program printed too much", curLine); } }
  function lookup(env, n) { for (let e = env; e; e = e.p) { if (e.v.has(n)) return e.v.get(n); } if (B.has(n)) return B.get(n); throw E("NameError", "name '" + n + "' is not defined"); }
  function setVar(env, n, v) { let e = env; if (env.g && env.g.has(n)) { e = genv; } e.v.set(n, v); }
  function call(f, args, kw) {
    if (f instanceof Bi) return f.f(args, kw);
    if (!(f instanceof Fn)) throw E("TypeError", "'" + tname(f) + "' object is not callable");
    if (++depth > 180) { depth = 0; throw E("RecursionError", "maximum recursion depth exceeded (does the function ever stop calling itself?)"); }
    const env = new Env(f.env), ps = f.params; let ai = 0; const used = new Set();
    try {
      for (const p of ps) {
        if (p.star) { env.v.set(p.n, tupleOf(args.slice(ai))); ai = args.length; continue; }
        if (p.kw) { const d = new Dict(); for (const k in kw) if (!used.has(k)) d.m.set("s" + k, [k, kw[k]]); env.v.set(p.n, d); Object.keys(kw).forEach(k => used.add(k)); continue; }
        if (ai < args.length) { env.v.set(p.n, args[ai++]); if (p.n in kw) throw E("TypeError", f.n + "() got multiple values for argument '" + p.n + "'"); }
        else if (p.n in kw) { env.v.set(p.n, kw[p.n]); used.add(p.n); }
        else if (p.dv !== undefined) env.v.set(p.n, p.dv);
        else throw E("TypeError", f.n + "() missing 1 required positional argument: '" + p.n + "'");
      }
      if (ai < args.length) throw E("TypeError", f.n + "() takes " + ps.filter(p => !p.star).length + " positional argument" + (ps.length === 1 ? "" : "s") + " but " + args.length + " " + (args.length === 1 ? "was" : "were") + " given");
      for (const k in kw) if (!used.has(k) && !ps.some(p => p.n === k) && !ps.some(p => p.kw)) throw E("TypeError", f.n + "() got an unexpected keyword argument '" + k + "'");
      if (f.expr) return ev(f.body, env);
      try { execBlock(f.body, env); } catch (r) { if (r instanceof Ret) return r.v; throw r; }
      return null;
    } finally { depth--; }
  }
  function assign(t, v, env) {
    if (t.k === "name") { setVar(env, t.n, v); return; }
    if (t.k === "tuple" || t.k === "list") { const vs = iter(v); if (vs.length !== t.items.length) throw E("ValueError", vs.length > t.items.length ? "too many values to unpack (expected " + t.items.length + ")" : "not enough values to unpack (expected " + t.items.length + ", got " + vs.length + ")"); t.items.forEach((x, i) => assign(x, vs[i], env)); return; }
    if (t.k === "index") {
      const o = ev(t.e, env), i = ev(t.idx, env);
      if (Array.isArray(o)) { if (t.idx.k === "slice") { const r = sliceIdx(i, o.length); if (i.c === null) { o.splice(r[0] === undefined ? Number(i.a === null ? 0 : i.a) : r[0], r.length, ...iter(v)); } else throw E("TypeError", "extended slice assignment is not supported in the Forge"); } else o[idx(i, o.length, "list assignment")] = v; return; }
      if (o instanceof Dict) { o.m.set(hkey(i), [i, v]); return; }
      throw E("TypeError", "'" + tname(o) + "' object does not support item assignment" + (typeof o === "string" ? " (strings cannot be changed; build a new one instead)" : ""));
    }
    throw E("SyntaxError", "cannot assign to this");
  }
  function evComp(n, env) {
    const res = []; const outv = n.kind === "dict" ? new Dict() : n.kind === "set" ? new PSet() : null; const scope = new Env(env);
    const run = (ci) => {
      if (ci >= n.clauses.length) { if (n.kind === "dict") { const k = ev(n.elt, scope), v = ev(n.val, scope); outv.m.set(hkey(k), [k, v]); } else if (n.kind === "set") { const x = ev(n.elt, scope); outv.m.set(hkey(x), x); } else res.push(ev(n.elt, scope)); return; }
      const c = n.clauses[ci];
      if (c.if) { if (truthy(ev(c.if, scope))) run(ci + 1); return; }
      for (const x of iter(ev(c.for.it, ci === 0 ? env : scope))) { if (++steps > MAXSTEPS) throw tooLong(); assign(c.for.target, x, scope); run(ci + 1); }
    };
    run(0); return outv || res;
  }
  const tooLong = () => new PyErr("Stopped", "the program ran for too long. Is there a loop that never ends?", curLine);
  function ev(n, env) {
    if (++steps > MAXSTEPS) throw tooLong();
    switch (n.k) {
      case "num": return n.v; case "str": return n.v; case "const": return n.v;
      case "name": curLine = n.line; return lookup(env, n.n);
      case "fstr": return n.parts.map(p => { if (typeof p === "string") return p; let v = ev(p.e, env); curLine = n.line; if (p.conv === "r") v = repr(v); const s = p.spec ? fmtSpec(v, p.spec.replace(/\{([^}]*)\}/g, (m, e) => str(ev(parse(lex(e))[0].e, env)))) : (p.label ? str(v, true) : str(v)); return (p.label ? p.label + "=" : "") + s; }).join("");
      case "tuple": return tupleOf(n.items.map(x => ev(x, env))); case "list": return n.items.map(x => ev(x, env));
      case "dict": { const d = new Dict(); for (const [k, v] of n.items) { const kk = ev(k, env); d.m.set(hkey(kk), [kk, ev(v, env)]); } return d; }
      case "setlit": return newSet(n.items.map(x => ev(x, env)));
      case "comp": { if (n.kind === "gen") return evComp(Object.assign({}, n, { kind:"list" }), env); return evComp(n, env); }
      case "bin": { const a = ev(n.l, env), b = ev(n.r, env); curLine = n.line; return arith(n.op, a, b); }
      case "un": { const v = ev(n.e, env); curLine = n.line; if (n.op === "-") { if (!isNum(v)) throw E("TypeError", "bad operand type for unary -: '" + tname(v) + "'"); return typeof v === "number" ? -v : -big(v); } if (n.op === "+") return v; return ~big(v); }
      case "not": return !truthy(ev(n.e, env));
      case "and": { const a = ev(n.l, env); return truthy(a) ? ev(n.r, env) : a; } case "or": { const a = ev(n.l, env); return truthy(a) ? a : ev(n.r, env); }
      case "cond": return truthy(ev(n.c, env)) ? ev(n.a, env) : ev(n.b, env);
      case "cmp": {
        let a = ev(n.first, env); curLine = n.line;
        for (let i = 0; i < n.ops.length; i++) {
          const b = ev(n.rest[i], env), o = n.ops[i]; let r;
          switch (o) { case "==": r = eq(a, b); break; case "!=": r = !eq(a, b); break; case "<": r = lt(a, b); break; case ">": r = lt(b, a); break; case "<=": r = lt(a, b) || eq(a, b); break; case ">=": r = lt(b, a) || eq(a, b); break; case "in": r = contains(b, a); break; case "not in": r = !contains(b, a); break; case "is": r = a === b || (isNum(a) && isNum(b) && num(a) === num(b) && typeof a === typeof b); break; case "is not": r = !(a === b); break; }
          if (!r) return false; a = b;
        }
        return true;
      }
      case "lambda": { const ps = n.params.map(p => ({ n:p.n, star:p.star, kw:p.kw, dv:p.d ? ev(p.d, env) : undefined })); return new Fn("<lambda>", ps, n.body, env, true); }
      case "call": {
        let fn, selfObj = null;
        if (n.f.k === "attr") { const o = ev(n.f.e, env); curLine = n.line; fn = getAttr(o, n.f.n); }
        else fn = ev(n.f, env);
        const args = [], kw = {};
        for (const a of n.args) { if (a && a.star) args.push(...iter(ev(a.star, env))); else args.push(ev(a, env)); }
        for (const k of n.kw) { if (k.star) { const d = ev(k.star, env); d.m.forEach(([kk, v]) => { kw[kk] = v; }); } else kw[k.n] = ev(k.v, env); }
        curLine = n.line; return call(fn, args, kw);
      }
      case "attr": { const o = ev(n.e, env); curLine = n.line; return getAttr(o, n.n); }
      case "index": {
        const o = ev(n.e, env), i = ev(n.idx, env); curLine = n.line;
        if (n.idx.k === "slice") { if (typeof o === "string") return sliceIdx(i, o.length).map(x => o[x]).join(""); if (Array.isArray(o)) return sliceIdx(i, o.length).map(x => o[x]); if (o instanceof Tup) return tupleOf(sliceIdx(i, o.a.length).map(x => o.a[x])); }
        if (typeof o === "string") return o[idx(i, o.length, "string")]; if (Array.isArray(o)) return o[idx(i, o.length, "list")]; if (o instanceof Tup) return o.a[idx(i, o.a.length, "tuple")];
        if (o instanceof Dict) { const e = o.m.get(hkey(i)); if (!e) throw E("KeyError", repr(i)); return e[1]; }
        throw E("TypeError", "'" + tname(o) + "' object is not subscriptable");
      }
      case "slice": return { a:n.a ? ev(n.a, env) : null, b:n.b ? ev(n.b, env) : null, c:n.c ? ev(n.c, env) : null };
    }
    throw E("SyntaxError", "cannot run " + n.k);
  }
  function exec(s, env) {
    if (++steps > MAXSTEPS) throw tooLong(); curLine = s.line;
    switch (s.k) {
      case "expr": ev(s.e, env); return;
      case "assign": { const v = ev(s.val, env); curLine = s.line; for (const t of s.targets) assign(t, v, env); return; }
      case "aug": {
        const cur = ev(s.target, env); const v = ev(s.val, env); curLine = s.line;
        if (Array.isArray(cur) && s.op === "+") { cur.push(...iter(v)); return; }
        assign(s.target, arith(s.op, cur, v), env); return;
      }
      case "if": execBlock(truthy(ev(s.test, env)) ? s.body : s.orelse, env); return;
      case "while": { while (truthy(ev(s.test, env))) { try { execBlock(s.body, env); } catch (r) { if (r === BRK) break; if (r === CNT) continue; throw r; } } return; }
      case "for": { const items = iter(ev(s.iter, env)); curLine = s.line; for (const x of Array.isArray(items) ? items.slice() : items) { assign(s.target, x, env); try { execBlock(s.body, env); } catch (r) { if (r === BRK) break; if (r === CNT) continue; throw r; } } return; }
      case "def": { const ps = s.params.map(p => ({ n:p.n, star:p.star, kw:p.kw, dv:p.d ? ev(p.d, env) : undefined })); setVar(env, s.name, new Fn(s.name, ps, s.body, env, false)); return; }
      case "return": throw new Ret(s.v ? ev(s.v, env) : null);
      case "break": throw BRK; case "continue": throw CNT; case "pass": return;
      case "seq": s.body.forEach(x => exec(x, env)); return;
      case "global": { if (!env.g) env.g = new Set(); s.names.forEach(n => env.g.add(n)); return; }
      case "import": for (const [m, as] of s.names) { if (!modules[m]) throw E("ModuleNotFoundError", "the Forge only has the math module for now (no module named '" + m + "')"); env.v.set(as, { m:modules[m].m, mod:m }); } return;
      case "from": { if (!modules[s.m]) throw E("ModuleNotFoundError", "the Forge only has the math module for now (no module named '" + s.m + "')"); for (const [n, as] of s.names) { if (n === "*") Object.keys(modules[s.m].m).forEach(k => env.v.set(k, modules[s.m].m[k])); else { if (!(n in modules[s.m].m)) throw E("ImportError", "cannot import name '" + n + "'"); env.v.set(as, modules[s.m].m[n]); } } return; }
      case "del": for (const t of s.ts) { if (t.k === "index") { const o = ev(t.e, env), i = ev(t.idx, env); if (Array.isArray(o)) o.splice(idx(i, o.length, "list assignment"), 1); else if (o instanceof Dict) { if (!o.m.delete(hkey(i))) throw E("KeyError", repr(i)); } } else if (t.k === "name") env.v.delete(t.n); } return;
      case "assert": if (!truthy(ev(s.e, env))) throw E("AssertionError", s.msg ? str(ev(s.msg, env)) : ""); return;
    }
    throw E("SyntaxError", "cannot run " + s.k);
  }
  function execBlock(b, env) { for (const s of b) exec(s, env); }
  const genv = new Env(null);
  const result = { out:"", error:null };
  try { execBlock(parse(lex(src)), genv); }
  catch (e) {
    if (e instanceof PyErr) result.error = (e.n === "Stopped" ? "Stopped: " + e.message : e.n + ": " + e.message) + (e.line ? " (line " + e.line + ")" : "");
    else if (e instanceof RangeError) result.error = "RecursionError: maximum recursion depth exceeded (line " + curLine + ")";
    else if (e === BRK || e === CNT) result.error = "SyntaxError: 'break' or 'continue' outside a loop (line " + curLine + ")";
    else if (e instanceof Ret) result.error = "SyntaxError: 'return' outside a function (line " + curLine + ")";
    else result.error = "Error: " + (e && e.message ? e.message : e);
  }
  result.out = out; return result;
}
