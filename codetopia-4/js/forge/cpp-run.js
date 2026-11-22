/* The Forge: a small C++ interpreter for what the game teaches (cout, variables, arithmetic, strings, if, loops, functions, arrays, vectors, references,
   pointers, new and delete, structs and classes with constructors and methods). It runs on the page with a step limit. Not supported: templates, lambdas, STL beyond
   vector and string, cin, switch, inheritance. */

"use strict";

function cppRun(src, opt) {
  opt = opt || {};
  let out = "", steps = 0, curLine = 0, depth = 0, nid = 0; const MAXSTEPS = opt.steps || 3e6, MAXOUT = 40000;
  class CErr extends Error { constructor(kind, m, line) { super(m); this.kind = kind; this.line = line; } }
  const E = m => new CErr("Runtime error", m, curLine);
  class Cell { constructor(v, t) { this.v = v; this.t = t; } }
  class Dbl { constructor(v) { this.v = v; } }
  class Chr { constructor(c) { this.c = c; } }
  class Vec { constructor(a, et) { this.a = a; this.et = et; } }
  class Obj { constructor(cls) { this.cls = cls; this.f = new Map(); } }
  class Ptr { constructor(cell, a, i) { this.cell = cell; this.a = a; this.i = i; this.id = ++nid; } }
  class Cout { }
  const COUT = new Cout(); let fixed = false, prec = 6;
  class Ret { constructor(v) { this.v = v; } }
  const BRK = { b:1 }, CNT = { c:1 };

  /* ---------------- lexer ---------------- */
  const TYPES = new Set(["int", "double", "float", "long", "short", "unsigned", "signed", "char", "bool", "string", "void", "auto", "vector", "const", "static", "size_t"]);
  function lex(s) {
    const toks = []; let i = 0, line = 1; const push = (t, v) => toks.push({ t, v, line });
    const fail = m => { curLine = line; throw new CErr("error", m, line); };
    const esc = c => ({ n:"\n", t:"\t", r:"\r", "0":"\0", "\\":"\\", "'":"'", '"':'"' })[c] !== undefined ? ({ n:"\n", t:"\t", r:"\r", "0":"\0", "\\":"\\", "'":"'", '"':'"' })[c] : c;
    while (i < s.length) {
      const c = s[i];
      if (c === "\n") { line++; i++; continue; }
      if (/\s/.test(c)) { i++; continue; }
      if (c === "#") { while (i < s.length && s[i] !== "\n") i++; continue; }
      if (c === "/" && s[i + 1] === "/") { while (i < s.length && s[i] !== "\n") i++; continue; }
      if (c === "/" && s[i + 1] === "*") { i += 2; while (i < s.length && !(s[i] === "*" && s[i + 1] === "/")) { if (s[i] === "\n") line++; i++; } i += 2; continue; }
      if (c === '"') { let j = i + 1, b = ""; while (j < s.length && s[j] !== '"') { if (s[j] === "\n") fail("missing terminating \" character"); if (s[j] === "\\") { b += esc(s[j + 1]); j += 2; } else b += s[j++]; } if (j >= s.length) fail("missing terminating \" character"); push("STR", b); i = j + 1; continue; }
      if (c === "'") { let j = i + 1, b = ""; if (s[j] === "\\") { b = esc(s[j + 1]); j += 2; } else b = s[j++]; if (s[j] !== "'") fail("character constant too long or missing '"); push("CHR", b); i = j + 1; continue; }
      let m;
      if ((m = /^(\d+\.\d*|\.\d+|\d+)([eE][+-]?\d+)?[fFlLuU]*/.exec(s.slice(i, i + 40)))) { i += m[0].length; const isD = /[.eE]/.test(m[0].replace(/[fFlLuU]+$/, "")) || /[fF]$/.test(m[0]) && /[.]/.test(m[0]); push(isD ? "DBL" : "INT", parseFloat(m[0])); continue; }
      if ((m = /^[A-Za-z_]\w*/.exec(s.slice(i, i + 80)))) { i += m[0].length; if (m[0] === "std" && s[i] === ":" && s[i + 1] === ":") { i += 2; continue; } push("ID", m[0]); continue; }
      if ((m = /^(<<=|>>=|->|\+\+|--|\+=|-=|\*=|\/=|%=|&&|\|\||==|!=|<=|>=|<<|>>|::|[-+*\/%<>=!&|^~?:;,.(){}\[\]])/.exec(s.slice(i, i + 3)))) { i += m[0].length; push("OP", m[0]); continue; }
      fail("stray '" + c + "' in program");
    }
    push("EOF"); return toks;
  }

  /* ---------------- parser ---------------- */
  const structs = new Map(), funcs = new Map();
  function parse(toks) {
    let p = 0; const peek = (k = 0) => toks[p + k], nxt = () => toks[p++];
    const isOp = (v, k = 0) => { const t = toks[p + k]; return t.t === "OP" && t.v === v; };
    const isId = (v, k = 0) => { const t = toks[p + k]; return t.t === "ID" && t.v === v; };
    const near = () => { const t = peek(); return t.t === "EOF" ? "end of the program" : "'" + (t.v === undefined ? "" : t.v) + "'"; };
    const fail = (m, t) => { t = t || peek(); curLine = t.line; throw new CErr("error", m, t.line); };
    const need = v => { if (!isOp(v)) { const prev = toks[p - 1]; fail("expected '" + v + "' before " + near(), v === ";" && prev && peek().line > prev.line ? prev : peek()); } p++; };
    const eat = v => { if (isOp(v)) { p++; return true; } return false; };
    const N = (k, o, line) => Object.assign({ k, line:line || toks[Math.max(0, p - 1)].line }, o);
    const typeStart = (k = 0) => { const t = peek(k); if (t.t !== "ID") return false; if (TYPES.has(t.v)) return true; if (structs.has(t.v)) { const n = peek(k + 1); return n.t === "ID" || (n.t === "OP" && (n.v === "*" || n.v === "&") && peek(k + 2).t === "ID"); } return false; };
    function parseType() {
      const t = { b:null, n:0, ref:false }; let words = [];
      while (peek().t === "ID" && (TYPES.has(peek().v) || (structs.has(peek().v) && !words.length))) {
        const w = nxt().v;
        if (w === "const" || w === "static") continue;
        if (w === "vector") { need("<"); t.elem = parseType(); if (isOp(">>")) { toks[p] = { t:"OP", v:">", line:toks[p].line }; } else need(">"); words.push("vector"); break; }
        words.push(w); if (structs.has(w)) break;
      }
      if (!words.length) fail("expected a type before " + near());
      const w = words.join(" ");
      t.b = words.includes("vector") ? "vector" : structs.has(w) ? w : words.includes("double") || words.includes("float") ? "double" : words.includes("char") ? "char" : words.includes("bool") ? "bool" : words.includes("string") ? "string" : words.includes("void") ? "void" : words.includes("auto") ? "auto" : words.includes("long") && words.filter(x => x === "long").length > 1 ? "long long" : words.includes("long") ? "long" : "int";
      while (peek().t === "OP" && (peek().v === "*" || peek().v === "&" || (peek().v === "&&"))) { const o = nxt().v; if (o === "*") t.n++; else t.ref = true; if (isId("const")) p++; }
      return t;
    }
    function params() {
      const ps = []; need("(");
      if (isId("void") && isOp(")", 1)) { p += 1; }
      while (!isOp(")")) { const t = parseType(); let name = ""; if (peek().t === "ID") name = nxt().v; let dims = 0; while (eat("[")) { if (!isOp("]")) assign(); need("]"); dims++; } if (dims) t.n++; let d = null; if (eat("=")) d = assign(); ps.push({ t, name, d }); if (!eat(",")) break; }
      need(")"); return ps;
    }
    function block() { need("{"); const b = []; while (!isOp("}")) { if (peek().t === "EOF") fail("expected '}' at the end of the program"); b.push(stmt()); } p++; return N("block", { b }); }
    function initList() { need("{"); const items = []; while (!isOp("}")) { items.push(isOp("{") ? initList() : assign()); if (!eat(",")) break; } need("}"); return N("init", { items }); }
    function declarators(t, line) {
      const ds = [];
      do {
        let tt = Object.assign({}, t); while (eat("*")) tt.n++; if (eat("&")) tt.ref = true;
        const nm = nxt(); if (nm.t !== "ID") fail("expected a name before " + near(), nm); const dims = [];
        while (eat("[")) { dims.push(isOp("]") ? null : assign()); need("]"); }
        let init = null, args = null;
        if (eat("=")) init = isOp("{") ? initList() : assign();
        else if (isOp("(")) { p++; args = []; while (!isOp(")")) { args.push(assign()); if (!eat(",")) break; } need(")"); }
        else if (isOp("{")) init = initList();
        ds.push({ t:tt, name:nm.v, dims, init, args, line:nm.line });
      } while (eat(","));
      return N("decl", { ds }, line);
    }
    function classBody(name, isClass) {
      const cls = { name, fields:[], methods:new Map(), ctors:[], dtor:null }; need("{");
      let access = isClass ? "private" : "public";
      while (!isOp("}")) {
        if ((isId("public") || isId("private") || isId("protected")) && isOp(":", 1)) { access = nxt().v; p++; continue; }
        if (isOp("~")) { p++; nxt(); const ps = params(); cls.dtor = block(); continue; }
        if (peek().t === "ID" && peek().v === name && isOp("(", 1)) {
          p++; const ps = params(); const inits = []; if (eat(":")) { do { const f = nxt().v; need("("); const a = []; while (!isOp(")")) { a.push(assign()); if (!eat(",")) break; } need(")"); inits.push([f, a]); } while (eat(",")); }
          const body = block(); cls.ctors.push({ ps, inits, body }); continue;
        }
        const t = parseType();
        if (peek().t === "ID" && isOp("(", 1)) { const nm = nxt().v; const ps = params(); if (isId("const")) p++; const body = block(); (cls.methods.get(nm) || cls.methods.set(nm, []).get(nm)).push({ name:nm, ret:t, ps, body, cls }); continue; }
        const d = declarators(t); need(";"); d.ds.forEach(x => cls.fields.push(x));
      }
      p++; return cls;
    }
    function stmt() {
      const t = peek(), line = t.line;
      if (isOp("{")) return block();
      if (isOp(";")) { p++; return N("empty", {}, line); }
      if (t.t === "ID") {
        switch (t.v) {
          case "if": { p++; need("("); const c = expr(); need(")"); const a = stmt(); let b = null; if (isId("else")) { p++; b = stmt(); } return N("if", { c, a, b }, line); }
          case "while": { p++; need("("); const c = expr(); need(")"); return N("while", { c, body:stmt() }, line); }
          case "do": { p++; const body = stmt(); if (!isId("while")) fail("expected 'while' before " + near()); p++; need("("); const c = expr(); need(")"); need(";"); return N("do", { c, body }, line); }
          case "for": {
            p++; need("(");
            if (typeStart()) {
              const save = p; const ty = parseType(); if (peek().t === "ID" && isOp(":", 1)) { const v = nxt().v; p++; const coll = expr(); need(")"); return N("foreach", { t:ty, v, coll, body:stmt() }, line); }
              p = save;
            }
            let init = null; if (!isOp(";")) init = typeStart() ? (() => { const ty = parseType(); return declarators(ty, line); })() : N("expr", { e:expr() }, line); need(";");
            const c = isOp(";") ? null : expr(); need(";"); const step = isOp(")") ? null : expr(); need(")"); return N("for", { init, c, step, body:stmt() }, line);
          }
          case "return": { p++; let e = null; if (!isOp(";")) e = isOp("{") ? initList() : expr(); need(";"); return N("return", { e }, line); }
          case "break": p++; need(";"); return N("break", {}, line);
          case "continue": p++; need(";"); return N("continue", {}, line);
          case "using": while (!isOp(";")) p++; p++; return N("empty", {}, line);
          case "switch": case "try": case "goto": fail("The Forge cannot run '" + t.v + "' yet", t); break;
          case "struct": case "class": if (peek(1).t === "ID" && (isOp("{", 2) || isOp(":", 2))) { const isC = t.v === "class"; p++; const name = nxt().v; if (isOp(":")) fail("inheritance is not supported in the Forge yet"); structs.set(name, null); const cls = classBody(name, isC); structs.set(name, cls); need(";"); return N("empty", {}, line); } break;
          case "cin": fail("cin cannot read from the keyboard in the Forge. Put the value in your code instead, for example: int age = 12;", t); break;
        }
        if (typeStart()) { const ty = parseType(); if (peek().t === "ID" && isOp("(", 1) && !structs.has(ty.b + "")) { /* function definition or prototype */ const name = nxt().v; const ps = params(); if (isOp(";")) { p++; return N("empty", {}, line); } const body = block(); (funcs.get(name) || funcs.set(name, []).get(name)).push({ name, ret:ty, ps, body }); return N("empty", {}, line); } const d = declarators(ty, line); need(";"); return d; }
      }
      const e = expr(); need(";"); return N("expr", { e }, line);
    }
    const expr = () => assign();
    function assign() {
      const l = ternary();
      if (peek().t === "OP" && ["=", "+=", "-=", "*=", "/=", "%="].includes(peek().v)) { const o = nxt().v; const r = isOp("{") ? initList() : assign(); return N("assign", { op:o, l, r }); }
      return l;
    }
    function ternary() { const c = lor(); if (eat("?")) { const a = assign(); need(":"); const b = assign(); return N("cond", { c, a, b }); } return c; }
    const bin = (sub, ops) => () => { let l = sub(); while (peek().t === "OP" && ops.includes(peek().v)) { const o = nxt().v; l = N("bin", { op:o, l, r:sub() }); } return l; };
    const unaryP = () => unary();
    const mul = bin(unaryP, ["*", "/", "%"]), add = bin(mul, ["+", "-"]), shift = bin(add, ["<<", ">>"]), rel = bin(shift, ["<", ">", "<=", ">="]), eqt = bin(rel, ["==", "!="]), land = bin(eqt, ["&&"]);
    function lor() { let l = land(); while (isOp("||")) { p++; l = N("bin", { op:"||", l, r:land() }); } return l; }
    function unary() {
      const t = peek();
      if (t.t === "OP") {
        if (["!", "-", "+", "~"].includes(t.v)) { p++; return N("un", { op:t.v, e:unary() }); }
        if (t.v === "++" || t.v === "--") { p++; return N("pre", { op:t.v, e:unary() }); }
        if (t.v === "*") { p++; return N("deref", { e:unary() }); }
        if (t.v === "&") { p++; return N("addr", { e:unary() }); }
        if (t.v === "(" && typeStart(1)) { const save = p; p++; const ty = parseType(); if (eat(")")) return N("cast", { t:ty, e:unary() }); p = save; }
      }
      if (t.t === "ID") {
        if (t.v === "new") { p++; const ty = parseType(); if (eat("[")) { const n = expr(); need("]"); return N("newarr", { t:ty, n }); } let args = []; if (eat("(")) { while (!isOp(")")) { args.push(assign()); if (!eat(",")) break; } need(")"); } else if (isOp("{")) args = initList().items; return N("new", { t:ty, args }); }
        if (t.v === "delete") { p++; const arr = eat("[") && (need("]"), true); return N("delete", { e:unary(), arr }); }
        if (t.v === "sizeof") { p++; need("("); let r; if (typeStart()) { const ty = parseType(); r = N("sizeof", { t:ty }); } else r = N("sizeof", { e:expr() }); need(")"); return r; }
      }
      return postfix();
    }
    function postfix() {
      let e = primary();
      for (;;) {
        if (isOp("(")) { p++; const args = []; while (!isOp(")")) { args.push(assign()); if (!eat(",")) break; } need(")"); e = N("call", { f:e, args }); }
        else if (isOp("[")) { p++; const i = expr(); need("]"); e = N("index", { e, i }); }
        else if (isOp(".") || isOp("->")) { const arrow = nxt().v === "->"; const n = nxt(); if (n.t !== "ID") fail("expected a member name", n); e = N("member", { e, n:n.v, arrow }); }
        else if (isOp("++") || isOp("--")) { const o = nxt().v; e = N("post", { op:o, e }); }
        else break;
      }
      return e;
    }
    function primary() {
      const t = nxt(), line = t.line;
      if (t.t === "INT") return N("num", { v:t.v }, line); if (t.t === "DBL") return N("dbl", { v:t.v }, line);
      if (t.t === "STR") { let s = t.v; while (peek().t === "STR") s += nxt().v; return N("str", { v:s }, line); }
      if (t.t === "CHR") return N("chr", { v:t.v }, line);
      if (t.t === "ID") {
        if (t.v === "true" || t.v === "false") return N("bool", { v:t.v === "true" }, line); if (t.v === "nullptr" || t.v === "NULL") return N("null", {}, line);
        if (TYPES.has(t.v) && isOp("(")) { p--; const ty = parseType(); need("("); const e = isOp(")") ? null : expr(); need(")"); return N("cast", { t:ty, e }, line); }
        if (structs.has(t.v) && isOp("(")) { p++; const args = []; while (!isOp(")")) { args.push(assign()); if (!eat(",")) break; } need(")"); return N("construct", { name:t.v, args }, line); }
        return N("name", { n:t.v }, line);
      }
      if (t.t === "OP" && t.v === "(") { const e = expr(); need(")"); return e; }
      if (t.t === "OP" && t.v === "{") { p--; return initList(); }
      p--; fail("expected an expression before " + near(), t);
    }
    const prog = []; while (peek().t !== "EOF") prog.push(stmt()); return prog;
  }

  /* ---------------- values ---------------- */
  const isDbl = v => v instanceof Dbl, isChr = v => v instanceof Chr;
  const toNum = v => typeof v === "number" ? v : v instanceof Dbl ? v.v : v instanceof Chr ? v.c : typeof v === "boolean" ? (v ? 1 : 0) : (() => { throw E("that value cannot be used in arithmetic"); })();
  const tn = v => typeof v === "number" ? "int" : v instanceof Dbl ? "double" : v instanceof Chr ? "char" : typeof v === "boolean" ? "bool" : typeof v === "string" ? "string" : v === null ? "nullptr" : v instanceof Ptr ? "pointer" : v instanceof Vec ? "vector" : v instanceof Obj ? v.cls.name : "value";
  const wrap32 = x => x | 0;
  function fmtD(x) {
    if (Number.isNaN(x)) return "nan"; if (!Number.isFinite(x)) return x < 0 ? "-inf" : "inf";
    if (fixed) return x.toFixed(prec);
    const P = prec || 1; if (x === 0) return Object.is(x, -0) ? "-0" : "0";
    const ex = Number(x.toExponential(P - 1).split("e")[1]);
    if (ex < -4 || ex >= P) { let [m, e] = x.toExponential(P - 1).split("e"); if (m.includes(".")) m = m.replace(/\.?0+$/, ""); const n = Number(e); return m + "e" + (n < 0 ? "-" : "+") + String(Math.abs(n)).padStart(2, "0"); }
    let s = x.toFixed(Math.max(0, P - 1 - ex)); if (s.includes(".")) s = s.replace(/\.?0+$/, ""); return s;
  }
  function show(v) {
    if (typeof v === "string") return v; if (typeof v === "number") return String(v); if (v instanceof Dbl) return fmtD(v.v); if (v instanceof Chr) return String.fromCharCode(v.c);
    if (typeof v === "boolean") return v ? "1" : "0"; if (v === null) return "0"; if (v instanceof Ptr) return "0x" + (0x7ffe0000 + v.id * 16).toString(16);
    throw E("cannot print a value of type " + tn(v));
  }
  const defVal = t => {
    if (t.n > 0) return null; if (t.ref) return null;
    switch (t.b) { case "int": case "long": case "long long": return 0; case "double": return new Dbl(0); case "bool": return false; case "char": return new Chr(0); case "string": return ""; case "vector": return new Vec([], t.elem); case "auto": return 0; }
    if (structs.get(t.b)) return newObj(structs.get(t.b)); return 0;
  };
  function coerce(t, v) {
    if (t && t.n > 0 && v instanceof Vec) { const q = new Ptr(null, v.a, 0); q.et = v.et; return q; }
    if (!t || t.n > 0 || t.ref) return v;
    switch (t.b) {
      case "int": case "long": case "long long":
        if (typeof v === "string" || v instanceof Obj || v instanceof Vec || v instanceof Ptr || v === null) throw new CErr("error", "invalid conversion from '" + (typeof v === "string" ? "const char*" : tn(v)) + "' to '" + t.b + "'", curLine);
        { const x = Math.trunc(toNum(v)); return t.b === "int" ? wrap32(x) : x; }
      case "double": if (typeof v === "string" || v instanceof Obj) throw new CErr("error", "cannot convert '" + tn(v) + "' to 'double'", curLine); return v instanceof Dbl ? v : new Dbl(toNum(v));
      case "bool": return typeof v === "boolean" ? v : toNum(v) !== 0;
      case "char": if (typeof v === "string") throw new CErr("error", "invalid conversion from 'const char*' to 'char' (use single quotes for one character)", curLine); return v instanceof Chr ? v : new Chr(Math.trunc(toNum(v)) & 255);
      case "string": if (typeof v !== "string") throw new CErr("error", "conversion from '" + tn(v) + "' to non-scalar type 'std::string' requested", curLine); return v;
    }
    return v;
  }
  const copyVal = v => { if (v instanceof Obj) { const o = new Obj(v.cls); v.f.forEach((c, k) => o.f.set(k, new Cell(copyVal(c.v), c.t))); return o; } if (v instanceof Vec) return new Vec(v.a.map(copyVal), v.et); return v; };
  function newObj(cls) { const o = new Obj(cls); cls.fields.forEach(d => { const t = Object.assign({}, d.t); const v = initFor(d, G); o.f.set(d.name, new Cell(v, d.dims.length ? null : d.t)); }); return o; }
  function makeArr(t, dims, vals) { const n = dims[0]; const et = Object.assign({}, t); const a = []; for (let i = 0; i < n; i++) a.push(dims.length > 1 ? makeArr(t, dims.slice(1)) : defVal(et)); return new Vec(a, dims.length > 1 ? null : et); }
  const truthy = v => v === null ? false : typeof v === "boolean" ? v : v instanceof Ptr ? true : toNum(v) !== 0;

  /* ---------------- environment ---------------- */
  class Env { constructor(p, thisObj) { this.v = new Map(); this.p = p; this.thisObj = thisObj || (p ? p.thisObj : null); } }
  const G = new Env(null);
  function findCell(env, n) {
    for (let e = env; e; e = e.p) { if (e.v.has(n)) return e.v.get(n); }
    if (env.thisObj && env.thisObj.f.has(n)) return env.thisObj.f.get(n);
    return null;
  }
  const lookupCell = (env, n) => { const c = findCell(env, n); if (!c) throw new CErr("error", "'" + n + "' was not declared in this scope", curLine); return c; };

  /* ---------------- lvalues, pointers ---------------- */
  const elemProxy = (a, i, et) => ({ get v() { return a[i]; }, set v(x) { a[i] = et ? coerce(et, x) : x; } });
  function ptrGet(p) { if (p === null) throw E("you used a pointer that points to nothing (nullptr)"); if (!(p instanceof Ptr)) throw E("that is not a pointer"); if (p.cell) { if (p.cell.freed) throw E("you used memory after it was deleted"); return p.cell; } if (p.i < 0 || p.i >= p.a.length) throw E("the pointer points outside its array"); return elemProxy(p.a, p.i, p.et); }
  function lv(n, env) {
    curLine = n.line || curLine;
    switch (n.k) {
      case "name": return lookupCell(env, n.n);
      case "index": {
        const o = ev(n.e, env), i = toNum(ev(n.i, env));
        if (o instanceof Vec) { if (i < 0 || i >= o.a.length) throw E("index " + i + " is outside the array (it has " + o.a.length + " items). C++ would read garbage or crash here"); return elemProxy(o.a, i, o.et); }
        if (o instanceof Ptr) { if (o.cell) { if (i !== 0) throw E("pointer index out of range"); return ptrGet(o); } const ix = o.i + i; if (ix < 0 || ix >= o.a.length) throw E("the pointer points outside its array"); return elemProxy(o.a, ix, o.et); }
        if (typeof o === "string") { const par = lv(n.e, env); if (i < 0 || i >= o.length) throw E("index " + i + " is outside the string (length " + o.length + ")"); return { get v() { return new Chr(par.v.charCodeAt(i)); }, set v(x) { par.v = par.v.slice(0, i) + String.fromCharCode(toNum(x)) + par.v.slice(i + 1); } }; }
        throw E("this value cannot be indexed with []");
      }
      case "member": { let o = ev(n.e, env); if (n.arrow) o = ptrGet(o).v; if (!(o instanceof Obj)) throw E("'" + n.n + "' is not a member of " + tn(o)); const c = o.f.get(n.n); if (!c) throw new CErr("error", "'" + o.cls.name + "' has no member named '" + n.n + "'", curLine); return c; }
      case "deref": return ptrGet(ev(n.e, env));
      default: return new Cell(ev(n, env));
    }
  }

  /* ---------------- arithmetic ---------------- */
  function arith(op, a, b) {
    if (op === "==" || op === "!=") { let r; if (typeof a === "string" && typeof b === "string") r = a === b; else if (a === null || b === null || a instanceof Ptr || b instanceof Ptr) r = ptrEq(a, b); else r = toNum(a) === toNum(b); return op === "==" ? r : !r; }
    if (typeof a === "string" || typeof b === "string") {
      if (op === "+") { const s = x => typeof x === "string" ? x : x instanceof Chr ? String.fromCharCode(x.c) : (() => { throw new CErr("error", "no match for 'operator+' (a string and " + tn(x) + "); use to_string() to turn a number into text", curLine); })(); return s(a) + s(b); }
      if (typeof a === "string" && typeof b === "string" && ["<", ">", "<=", ">="].includes(op)) return op === "<" ? a < b : op === ">" ? a > b : op === "<=" ? a <= b : a >= b;
      throw new CErr("error", "no match for 'operator" + op + "' with a string", curLine);
    }
    if (a instanceof Ptr || b instanceof Ptr) {
      if (op === "+" || op === "-") { const pp = a instanceof Ptr ? a : b, k = toNum(a instanceof Ptr ? b : a); if (!pp.a) throw E("pointer arithmetic only works inside an array"); const q = new Ptr(null, pp.a, pp.i + (op === "+" ? k : -k)); q.et = pp.et; return q; }
      if (["<", ">", "<=", ">="].includes(op) && a.a === b.a) return op === "<" ? a.i < b.i : op === ">" ? a.i > b.i : op === "<=" ? a.i <= b.i : a.i >= b.i;
      throw E("that pointer operation is not supported");
    }
    const dbl = a instanceof Dbl || b instanceof Dbl, x = toNum(a), y = toNum(b); let r;
    switch (op) {
      case "+": r = x + y; break; case "-": r = x - y; break; case "*": r = dbl ? x * y : Math.imul(x, y) === x * y || Math.abs(x * y) > 2147483647 ? x * y : x * y; break;
      case "/": if (!dbl) { if (y === 0) throw E("division by zero (the program would crash with 'Floating point exception')"); r = Math.trunc(x / y); } else r = x / y; break;
      case "%": if (dbl) throw new CErr("error", "invalid operands of types 'double' and 'double' to binary 'operator%'", curLine); if (y === 0) throw E("remainder by zero (the program would crash with 'Floating point exception')"); r = x % y; break;
      case "<": return x < y; case ">": return x > y; case "<=": return x <= y; case ">=": return x >= y;
      case "<<": return x << y; case ">>": return x >> y;
      default: throw E("unknown operator " + op);
    }
    return dbl ? new Dbl(r) : (Number.isSafeInteger(r) ? r : r);
  }
  function ptrEq(a, b) { if (a === null || b === null) return a === b; if (typeof a === "number" && a === 0) return b === null; if (typeof b === "number" && b === 0) return a === null; return a.cell ? a.cell === b.cell : a.a === b.a && a.i === b.i; }

  /* ---------------- functions and classes ---------------- */
  function argMatch(t, v) {
    if (t.n > 0) return v === null || v instanceof Ptr || v instanceof Vec ? 2 : 0;
    switch (t.b) { case "int": case "long": case "long long": return typeof v === "number" ? 3 : v instanceof Chr || typeof v === "boolean" ? 2 : v instanceof Dbl ? 1 : 0; case "double": return v instanceof Dbl ? 3 : typeof v === "number" ? 2 : 0; case "string": return typeof v === "string" ? 3 : 0; case "char": return v instanceof Chr ? 3 : 0; case "bool": return typeof v === "boolean" ? 3 : 1; case "vector": return v instanceof Vec ? 3 : 0; case "auto": return 1; }
    return v instanceof Obj && v.cls.name === t.b ? 3 : 0;
  }
  function pick(cands, args, what) {
    const ok = cands.filter(c => args.length <= c.ps.length && args.length >= c.ps.filter(p => !p.d).length);
    if (!ok.length) throw new CErr("error", "no matching function for call to '" + what + "' (" + cands.map(c => c.ps.length).join(" or ") + " argument(s) expected, " + args.length + " given)", curLine);
    if (ok.length === 1) return ok[0];
    let best = null, bs = -1; for (const c of ok) { let s = 0; args.forEach((a, i) => { s += argMatch(c.ps[i].t, a); }); if (s > bs) { bs = s; best = c; } } return best;
  }
  function callFn(fn, argNodes, argVals, env, thisObj, curEnv) {
    if (++depth > 200) { depth = 0; throw E("the function called itself too many times (stack overflow). Does it ever stop?"); }
    try {
      const fenv = new Env(G, thisObj); const ps = fn.ps;
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i]; let cell;
        if (i < argVals.length) {
          if (p.t.ref && argNodes && argNodes[i]) { cell = lv(argNodes[i], env); }
          else cell = new Cell(copyArg(p.t, argVals[i]), p.t);
        } else cell = new Cell(coerce(p.t, ev(p.d, fenv)), p.t);
        fenv.v.set(p.name, cell);
      }
      try { run(fn.body, fenv); } catch (r) { if (r instanceof Ret) return fn.ret && fn.ret.b !== "void" && fn.ret.b !== "auto" && !fn.ret.ref ? coerce(fn.ret, r.v) : r.v; throw r; }
      return null;
    } finally { depth--; }
  }
  const copyArg = (t, v) => { if (t.n > 0 && v instanceof Vec) { const p = new Ptr(null, v.a, 0); p.et = v.et; return p; } return coerce(t, copyVal(v)); };
  function construct(cls, args, argNodes, env) {
    const o = newObj(cls);
    if (cls.ctors.length) {
      const vals = args.map(a => ev(a, env)); const c = pick(cls.ctors.map(c => ({ ps:c.ps, c })), vals, cls.name).c;
      const fenv = new Env(G, o); c.ps.forEach((p, i) => { fenv.v.set(p.name, i < vals.length ? new Cell(copyArg(p.t, vals[i]), p.t) : new Cell(coerce(p.t, ev(p.d, fenv)), p.t)); });
      for (const [f, a] of c.inits) { const cell = o.f.get(f); if (!cell) throw new CErr("error", "'" + cls.name + "' has no member named '" + f + "'", curLine); const av = a.map(x => ev(x, fenv)); cell.v = cell.t && cell.t.b !== "vector" && !structs.has(cell.t.b) ? coerce(cell.t, av[0]) : (av.length ? av[0] : cell.v); }
      try { run(c.body, fenv); } catch (r) { if (!(r instanceof Ret)) throw r; }
    } else if (args.length) {
      const vals = args.map(a => ev(a, env)); if (vals.length > cls.fields.length) throw new CErr("error", "too many initializers for '" + cls.name + "'", curLine);
      cls.fields.forEach((d, i) => { if (i < vals.length) o.f.get(d.name).v = coerce(d.t, copyVal(vals[i])); });
    }
    return o;
  }
  function initFor(d, env) {
    const t = d.t;
    if (d.dims.length) {
      const dims = d.dims.map(x => x ? toNum(ev(x, env)) : null); const items = d.init ? d.init.items : [];
      if (dims[0] === null) dims[0] = items.length;
      const arr = makeArr(t, dims); const fill = (a, it, depthI) => { it.forEach((x, i) => { if (i >= a.a.length) throw new CErr("error", "too many initializers for the array", curLine); if (x.k === "init") fill(a.a[i], x.items, depthI + 1); else a.a[i] = coerce(arr.et || t, ev(x, env)); }); };
      if (d.init) fill(arr, items, 0); return arr;
    }
    if (t.b === "auto") { if (!d.init) throw new CErr("error", "declaration of 'auto " + d.name + "' has no initializer", curLine); return copyVal(ev(d.init, env)); }
    if (structs.has(t.b) && t.n === 0) {
      const cls = structs.get(t.b);
      if (d.args) return construct(cls, d.args, null, env);
      if (d.init && d.init.k === "init") return construct(cls, d.init.items, null, env);
      if (d.init) { const v = ev(d.init, env); return copyVal(v); }
      return construct(cls, [], null, env);
    }
    if (t.b === "vector" && t.n === 0) {
      if (d.init && d.init.k === "init") { const v = new Vec(d.init.items.map(x => coerce(t.elem, ev(x, env))), t.elem); return v; }
      if (d.args) { const n = toNum(ev(d.args[0], env)); return new Vec(Array.from({ length:n }, () => d.args[1] ? coerce(t.elem, ev(d.args[1], env)) : defVal(t.elem)), t.elem); }
      if (d.init) return copyVal(ev(d.init, env)); return new Vec([], t.elem);
    }
    if (d.args && t.b === "string") { const a = d.args.map(x => ev(x, env)); return a.length === 2 ? show(a[1]).repeat(toNum(a[0])) : coerce(t, a[0]); }
    if (d.args) return coerce(t, ev(d.args[0], env));
    if (d.init) { if (d.init.k === "init") return coerce(t, d.init.items.length ? ev(d.init.items[0], env) : defVal(t)); return coerce(t, copyVal(ev(d.init, env))); }
    return defVal(t);
  }

  /* ---------------- builtin members ---------------- */
  function memberCall(o, name, args, env, n) {
    if (typeof o === "string") {
      const s = o; const ix = a => toNum(a);
      switch (name) {
        case "length": case "size": return s.length; case "empty": return s.length === 0;
        case "substr": { const st = args.length ? ix(args[0]) : 0; if (st > s.length) throw E("substr: start position " + st + " is past the end of the string"); return args.length > 1 ? s.substr(st, ix(args[1])) : s.slice(st); }
        case "at": { const i = ix(args[0]); if (i < 0 || i >= s.length) throw E("at(" + i + ") is outside the string (length " + s.length + ")"); return new Chr(s.charCodeAt(i)); }
        case "find": { const r = s.indexOf(typeof args[0] === "string" ? args[0] : String.fromCharCode(toNum(args[0]))); return r < 0 ? 4294967295 : r; }
        case "back": return new Chr(s.charCodeAt(s.length - 1)); case "front": return new Chr(s.charCodeAt(0)); case "c_str": return s;
        case "push_back": case "append": case "pop_back": case "clear": case "insert": case "erase": case "replace": {
          const cell = lv(n.f.e, env); const cur = cell.v;
          if (name === "push_back") cell.v = cur + String.fromCharCode(toNum(args[0])); else if (name === "append") cell.v = cur + show(args[0]); else if (name === "pop_back") cell.v = cur.slice(0, -1); else if (name === "clear") cell.v = ""; else if (name === "insert") cell.v = cur.slice(0, ix(args[0])) + show(args[1]) + cur.slice(ix(args[0])); else if (name === "erase") cell.v = cur.slice(0, ix(args[0])) + (args.length > 1 ? cur.slice(ix(args[0]) + ix(args[1])) : ""); else cell.v = cur.slice(0, ix(args[0])) + show(args[2]) + cur.slice(ix(args[0]) + ix(args[1])); return null;
        }
      }
    }
    if (o instanceof Vec) {
      const a = o.a;
      switch (name) {
        case "size": return a.length; case "empty": return a.length === 0; case "push_back": a.push(coerce(o.et, copyVal(args[0]))); return null;
        case "pop_back": if (!a.length) throw E("pop_back() on an empty vector"); a.pop(); return null; case "clear": a.length = 0; return null;
        case "at": { const i = toNum(args[0]); if (i < 0 || i >= a.length) throw E("at(" + i + ") is outside the vector (size " + a.length + ")"); return a[i]; }
        case "back": if (!a.length) throw E("back() on an empty vector"); return a[a.length - 1]; case "front": if (!a.length) throw E("front() on an empty vector"); return a[0];
        case "begin": { const p = new Ptr(null, a, 0); p.et = o.et; return p; } case "end": { const p = new Ptr(null, a, a.length); p.et = o.et; return p; }
        case "resize": { const k = toNum(args[0]); while (a.length > k) a.pop(); while (a.length < k) a.push(defVal(o.et || { b:"int", n:0 })); return null; }
      }
    }
    return undefined;
  }
  const mathFns = { sqrt:Math.sqrt, sin:Math.sin, cos:Math.cos, tan:Math.tan, floor:Math.floor, ceil:Math.ceil, round:x => Math.sign(x) * Math.round(Math.abs(x)), fabs:Math.abs, log:Math.log, log10:Math.log10, exp:Math.exp };
  function builtin(name, args, env) {
    if (mathFns[name]) return new Dbl(mathFns[name](toNum(args[0])));
    switch (name) {
      case "pow": return new Dbl(Math.pow(toNum(args[0]), toNum(args[1])));
      case "abs": return args[0] instanceof Dbl ? new Dbl(Math.abs(args[0].v)) : Math.abs(toNum(args[0]));
      case "max": return toNum(args[0]) >= toNum(args[1]) ? args[0] : args[1]; case "min": return toNum(args[0]) <= toNum(args[1]) ? args[0] : args[1];
      case "to_string": return args[0] instanceof Dbl ? args[0].v.toFixed(6) : show(args[0]);
      case "stoi": { const v = parseInt(args[0], 10); if (Number.isNaN(v)) throw E("stoi: no conversion could be made"); return v; } case "stod": return new Dbl(parseFloat(args[0]));
      case "setprecision": prec = toNum(args[0]); return COUT; case "swap": { const a = args[0], b = args[1]; return null; }
      case "sort": { const [b, e] = args; const seg = b.a.slice(b.i, e.i); seg.sort((x, y) => (typeof x === "string" ? (x < y ? -1 : x > y ? 1 : 0) : toNum(x) - toNum(y))); seg.forEach((x, i) => { b.a[b.i + i] = x; }); return null; }
      case "reverse": { const [b, e] = args; const seg = b.a.slice(b.i, e.i).reverse(); seg.forEach((x, i) => { b.a[b.i + i] = x; }); return null; }
      case "rand": return 4; case "srand": return null; case "time": return 0;
    }
    return undefined;
  }

  /* ---------------- evaluator ---------------- */
  function emit(s) { out += s; if (out.length > MAXOUT) { out = out.slice(0, MAXOUT) + "\n... (output cut: too long)"; throw new CErr("Stopped", "the program printed too much", curLine); } }
  const tooLong = () => new CErr("Stopped", "the program ran for too long. Is there a loop that never ends?", curLine);
  function ev(n, env) {
    if (++steps > MAXSTEPS) throw tooLong(); if (n.line) curLine = n.line;
    switch (n.k) {
      case "num": return n.v; case "dbl": return new Dbl(n.v); case "str": return n.v; case "chr": return new Chr(n.v.charCodeAt(0)); case "bool": return n.v; case "null": return null;
      case "name": {
        if (n.n === "cout") return COUT; if (n.n === "endl") return "\n"; if (n.n === "fixed") { fixed = true; return COUT; } if (n.n === "npos") return 4294967295;
        if (n.n === "this") { const o = env.thisObj; const c = new Cell(o); return new Ptr(c); }
        const c = findCell(env, n.n); if (c) return c.v;
        if (n.n === "cin") throw new CErr("error", "cin cannot read from the keyboard in the Forge. Put the value in your code instead", curLine);
        throw new CErr("error", "'" + n.n + "' was not declared in this scope", n.line);
      }
      case "init": throw new CErr("error", "a { } list cannot be used here", n.line);
      case "bin": {
        if (n.op === "&&") return truthy(ev(n.l, env)) && truthy(ev(n.r, env)); if (n.op === "||") return truthy(ev(n.l, env)) || truthy(ev(n.r, env));
        const a = ev(n.l, env);
        if (n.op === "<<" && a instanceof Cout) { const b = ev(n.r, env); if (b instanceof Cout) return a; emit(show(b)); return a; }
        if (n.op === ">>" && n.l.k === "name" && n.l.n === "cin") throw new CErr("error", "cin cannot read from the keyboard in the Forge. Put the value in your code instead", curLine);
        const b = ev(n.r, env); curLine = n.line; return arith(n.op, a, b);
      }
      case "un": { const v = ev(n.e, env); if (n.op === "!") return !truthy(v); if (n.op === "-") return v instanceof Dbl ? new Dbl(-v.v) : -toNum(v); if (n.op === "~") return ~toNum(v); return v; }
      case "cond": return truthy(ev(n.c, env)) ? ev(n.a, env) : ev(n.b, env);
      case "cast": return n.e === null ? defVal(n.t) : (n.t.b === "string" && n.t.n === 0 ? coerce(n.t, ev(n.e, env)) : coerce(n.t, ev(n.e, env)));
      case "assign": {
        const cell = lv(n.l, env); curLine = n.line;
        let v; if (n.op === "=") { v = n.r.k === "init" && cell.t && structs.has(cell.t.b) ? construct(structs.get(cell.t.b), n.r.items, null, env) : copyVal(ev(n.r, env)); }
        else { const r = ev(n.r, env); v = arith(n.op.slice(0, -1), cell.v, r); }
        if (cell.t && cell.t.n === 0 && !cell.t.ref) v = coerce(cell.t, v); else if (cell.t === undefined && !(cell instanceof Cell)) { /* element proxy coerces itself */ }
        cell.v = v; return cell.v;
      }
      case "pre": case "post": { const cell = lv(n.e, env); const old = cell.v; let nv; if (old instanceof Ptr) nv = arith(n.op === "++" ? "+" : "-", old, 1); else nv = old instanceof Dbl ? new Dbl(old.v + (n.op === "++" ? 1 : -1)) : old instanceof Chr ? new Chr(old.c + (n.op === "++" ? 1 : -1)) : toNum(old) + (n.op === "++" ? 1 : -1); cell.v = cell.t ? coerce(cell.t, nv) : nv; return n.k === "pre" ? cell.v : old; }
      case "index": { const c = lv(n, env); return c.v; }
      case "member": {
        if (n.e.k === "name" && !findCell(env, n.e.n) && n.e.n === "string" && n.n === "npos") return 4294967295;
        return lv(n, env).v;
      }
      case "deref": return ptrGet(ev(n.e, env)).v;
      case "addr": { const t = n.e; if (t.k === "name") { const c = lookupCell(env, t.n); return new Ptr(c); } if (t.k === "index") { const o = ev(t.e, env), i = toNum(ev(t.i, env)); if (o instanceof Vec) { const p = new Ptr(null, o.a, i); p.et = o.et; return p; } if (o instanceof Ptr && o.a) { const p = new Ptr(null, o.a, o.i + i); p.et = o.et; return p; } } const c = lv(t, env); return new Ptr(c); }
      case "new": { const t = n.t; if (structs.has(t.b)) { const o = construct(structs.get(t.b), n.args, null, env); return new Ptr(new Cell(o, t)); } const c = new Cell(n.args.length ? coerce(t, ev(n.args[0], env)) : defVal(t), t); return new Ptr(c); }
      case "newarr": { const k = toNum(ev(n.n, env)); const arr = makeArr(n.t, [k]); const p = new Ptr(null, arr.a, 0); p.et = arr.et; return p; }
      case "delete": { const p = ev(n.e, env); if (p instanceof Ptr && p.cell) { if (p.cell.freed) throw E("the same memory was deleted twice"); p.cell.freed = true; if (p.cell.v instanceof Obj && p.cell.v.cls.dtor) { try { run(p.cell.v.cls.dtor, new Env(G, p.cell.v)); } catch (r) { if (!(r instanceof Ret)) throw r; } } } return null; }
      case "sizeof": { if (n.t) return n.t.n > 0 ? 8 : ({ int:4, double:8, char:1, bool:1, long:8, "long long":8, string:32 })[n.t.b] || 4; const v = ev(n.e, env); return v instanceof Dbl ? 8 : v instanceof Chr || typeof v === "boolean" ? 1 : v instanceof Vec ? v.a.length * 4 : 4; }
      case "construct": return construct(structs.get(n.name), n.args, null, env);
      case "call": {
        const f = n.f;
        if (f.k === "member") {
          let o = ev(f.e, env); if (f.arrow) o = ptrGet(o).v;
          if (o instanceof Obj) {
            const cands = o.cls.methods.get(f.n); if (!cands) throw new CErr("error", "'" + o.cls.name + "' has no member function named '" + f.n + "'", curLine);
            const vals = n.args.map(a => ev(a, env)); const fn = pick(cands, vals, f.n); return callFn(fn, n.args, vals, env, o);
          }
          const vals = n.args.map(a => a.k === "init" && o instanceof Vec && o.et && structs.has(o.et.b) ? construct(structs.get(o.et.b), a.items, null, env) : ev(a, env)); curLine = n.line; const r = memberCall(o, f.n, vals, env, n); if (r !== undefined) return r;
          throw new CErr("error", "'" + tn(o) + "' has no member named '" + f.n + "'", curLine);
        }
        if (f.k !== "name") throw E("this kind of call is not supported");
        const cands = funcs.get(f.n);
        if (cands) { const vals = n.args.map(a => ev(a, env)); curLine = n.line; return callFn(pick(cands, vals, f.n), n.args, vals, env, null); }
        if (env.thisObj && env.thisObj.cls.methods.has(f.n)) { const vals = n.args.map(a => ev(a, env)); return callFn(pick(env.thisObj.cls.methods.get(f.n), vals, f.n), n.args, vals, env, env.thisObj); }
        const vals = n.args.map(a => ev(a, env)); curLine = n.line; const r = builtin(f.n, vals, env); if (r !== undefined) return r;
        throw new CErr("error", "'" + f.n + "' was not declared in this scope", n.line);
      }
    }
    throw E("cannot run " + n.k);
  }
  function run(s, env) {
    if (++steps > MAXSTEPS) throw tooLong(); if (s.line) curLine = s.line;
    switch (s.k) {
      case "empty": return;
      case "block": { const e = new Env(env); for (const x of s.b) run(x, e); return; }
      case "expr": ev(s.e, env); return;
      case "decl": for (const d of s.ds) { curLine = d.line; const t = d.t; let cell; if (t.ref) { if (!d.init) throw new CErr("error", "'" + d.name + "' declared as a reference but not initialized", d.line); cell = lv(d.init, env); } else { cell = new Cell(initFor(d, env), d.dims.length ? null : t.b === "auto" ? null : t); } env.v.set(d.name, cell); } return;
      case "if": if (truthy(ev(s.c, env))) run(s.a, env); else if (s.b) run(s.b, env); return;
      case "while": while (truthy(ev(s.c, env))) { try { run(s.body, env); } catch (r) { if (r === BRK) break; if (r === CNT) continue; throw r; } } return;
      case "do": do { try { run(s.body, env); } catch (r) { if (r === BRK) break; if (r === CNT) continue; throw r; } } while (truthy(ev(s.c, env))); return;
      case "for": { const e = new Env(env); if (s.init) run(s.init, e); while (!s.c || truthy(ev(s.c, e))) { try { run(s.body, e); } catch (r) { if (r === BRK) break; if (r !== CNT) throw r; } if (s.step) ev(s.step, e); } return; }
      case "foreach": {
        const coll = ev(s.coll, env); let items; if (coll instanceof Vec) items = coll.a; else if (typeof coll === "string") items = [...coll].map(c => new Chr(c.charCodeAt(0))); else throw E("a range-based for needs an array, vector or string");
        for (let i = 0; i < items.length; i++) { const e = new Env(env); const cell = s.t.ref && coll instanceof Vec ? elemProxy(items, i, coll.et) : new Cell(s.t.b === "auto" ? items[i] : coerce(s.t, copyVal(items[i])), s.t); e.v.set(s.v, cell); try { run(s.body, e); } catch (r) { if (r === BRK) break; if (r === CNT) continue; throw r; } }
        return;
      }
      case "return": throw new Ret(s.e ? (s.e.k === "init" ? null : copyVal(ev(s.e, env))) : null);
      case "break": throw BRK; case "continue": throw CNT;
    }
    throw E("cannot run " + s.k);
  }

  const result = { out:"", error:null };
  try {
    const prog = parse(lex(src));
    for (const s of prog) run(s, G);
    if (funcs.has("main")) { const m = funcs.get("main")[0]; callFn(m, [], [], G, null); }
  } catch (e) {
    if (e instanceof CErr) result.error = (e.kind === "Stopped" ? "Stopped: " + e.message : e.kind + ": " + e.message) + (e.line ? " (line " + e.line + ")" : "");
    else if (e instanceof RangeError) result.error = "Runtime error: stack overflow, a function kept calling itself (line " + curLine + ")";
    else if (e === BRK || e === CNT) result.error = "error: 'break' or 'continue' outside a loop (line " + curLine + ")";
    else if (e instanceof Ret) { /* return at top level: stop quietly */ }
    else result.error = "Error: " + (e && e.message ? e.message : e);
  }
  result.out = out; return result;
}
