/* JavaScript track: colours code as it is typed, explains mistakes, runs spells to get their console output and builds the level 10 live page. */

"use strict";

const JS_WORDS = new Set("let const var function return if else for while do break continue of in new this typeof delete true false null undefined class document console".split(" "));
function classifyJs(code){
  const out = new Array(code.length).fill("c-punct"); let i = 0;
  while (i < code.length) {
    const ch = code[i];
    if (code.startsWith("//", i)) { let e = code.indexOf("\n", i); if (e < 0) e = code.length; for (; i < e; i++) out[i] = "c-comment"; continue; }
    if (code.startsWith("/*", i)) { let e = code.indexOf("*/", i + 2); e = e < 0 ? code.length : e + 2; for (; i < e; i++) out[i] = "c-comment"; continue; }
    if (ch === '"' || ch === "'" || ch === "`") { out[i++] = "c-val"; while (i < code.length && code[i] !== ch) { if (code[i] === "\\" && i + 1 < code.length) out[i++] = "c-val"; out[i++] = "c-val"; } if (i < code.length) out[i++] = "c-val"; continue; }
    if (/[0-9]/.test(ch)) { while (i < code.length && /[0-9.]/.test(code[i])) out[i++] = "c-val"; continue; }
    if (/[A-Za-z_$]/.test(ch)) { const s = i; while (i < code.length && /[\w$]/.test(code[i])) i++; const k = JS_WORDS.has(code.slice(s, i)) ? "c-tag" : "c-attr"; for (let j = s; j < i; j++) out[j] = k; continue; }
    i++;
  }
  return out;
}
function hintJs(les, idx){
  const t = les.code, cls = les.cls, exp = t[idx], c = cls[idx];
  if (exp === "\n") return "Press Enter here to start a new line.";
  if (c === "c-punct") {
    const two = t.slice(idx, idx + 2), three = t.slice(idx, idx + 3);
    if (exp === ";") return "A statement ends with a semicolon.";
    if (exp === "=" && three === "===") return "=== checks that two values are equal and the same type.";
    if (exp === "=" && two === "=>") return "=> is the arrow of an arrow function.";
    if (exp === "=" && t[idx - 1] === "=") return "Check the equals signs: = stores, === compares.";
    if (exp === ">" && t[idx - 1] === "=") return "=> is the arrow of an arrow function.";
    if (exp === "=") return "A single = stores a value. === compares two values.";
    if (exp === "{" || exp === "}") return "Curly braces { } wrap a block of code, or an object. Every { needs a matching }.";
    if (exp === "(" || exp === ")") return "Brackets ( ) hold a condition, parameters or arguments.";
    if (exp === "[" || exp === "]") return "Square brackets [ ] make an array or pick an item by its index.";
    if (exp === ",") return "Separate items with a comma.";
    if (exp === ".") return "A dot reaches inside something, like console.log or hero.name.";
    if (exp === ":") return "A colon goes between a property name and its value, or in a ternary.";
    if (exp === "?") return "? starts a ternary: condition ? ifTrue : ifFalse.";
    if (exp === "&" || exp === "|") return "&& means both, || means either.";
    if (exp === "!") return "! flips true and false, and !== means not equal.";
    if (exp === "+" || exp === "-" || exp === "*" || exp === "/" || exp === "%") return "The maths symbol here should be " + exp + ".";
    if (exp === "<" || exp === ">") return exp === "<" ? "Here you need a less-than sign <." : "Here you need a greater-than sign >.";
    if (exp === "$") return "${ } puts a value inside a template literal.";
    if (exp === " ") return "Check the spacing here.";
    return "The symbol here should be " + exp + ".";
  }
  if (c === "c-tag") { const [a, b] = runAt(cls, idx); return "The keyword here should be " + t.slice(a, b + 1) + "."; }
  if (c === "c-attr") { const [a, b] = runAt(cls, idx); return "The name here should be " + t.slice(a, b + 1) + ". Capital letters matter."; }
  if (c === "c-val") {
    if (exp === '"') return "Text goes inside quotes.";
    if (exp === "'") return "Single quotes also make a string.";
    if (exp === "`") return "Backticks make a template literal.";
    const [a, b] = runAt(cls, idx), run = t.slice(a, b + 1);
    if (/^[0-9.]+$/.test(run)) return "The number here should be " + run + ".";
    return "The text here should read “" + run.replace(/^["'`]|["'`]$/g, "") + "”.";
  }
  if (c === "c-comment") return "// starts a comment that runs to the end of the line.";
  return "Check that character.";
}

/* ----- run a spell and print what node would print ----- */
function jsInspect(v, nested){
  if (typeof v === "string") return nested ? (v.includes("'") ? '"' + v + '"' : "'" + v + "'") : v;
  if (v === null || v === undefined || typeof v === "number" || typeof v === "boolean") return String(v);
  if (typeof v === "function") return "[Function: " + (v.name || "(anonymous)") + "]";
  if (Array.isArray(v)) {
    if (!v.length) return "[]";
    const parts = v.map(x => jsInspect(x, true)), one = "[ " + parts.join(", ") + " ]";
    return one.length <= 72 ? one : "[\n" + parts.map(p => "  " + p).join(",\n") + "\n]";
  }
  const keys = Object.keys(v);
  if (!keys.length) return "{}";
  const parts = keys.map(k => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : "'" + k + "'") + ": " + jsInspect(v[k], true)), one = "{ " + parts.join(", ") + " }";
  return one.length <= 72 ? one : "{\n" + parts.map(p => "  " + p).join(",\n") + "\n}";
}
function runJs(code){
  const lines = [], con = { log:(...a) => lines.push(a.map(x => jsInspect(x, false)).join(" ")) };
  try { new Function("console", code)(con); } catch (e) { lines.push(e.name + ": " + e.message); }
  return lines.join("\n");
}

/* ----- level 10 live page: the spell runs in a sandboxed frame, so the player sees the real page change ----- */
const JS_PAGE_CSS = "body{font:15px/1.4 system-ui,sans-serif;margin:10px;color:#222;background:#fff}h1{font-size:20px;margin:0 0 6px}button{font:inherit;padding:3px 10px}li{margin:2px 0}.glow{background:#fff3b0;box-shadow:0 0 6px #ffd54a}.big{font-size:22px}.hide{opacity:.3}.bold{font-weight:700}.fancy{color:#7a3fd1;font-style:italic}input{font:inherit;width:90%}.fire{color:#d9480f;font-weight:700}.ice{color:#1c7ed6;font-weight:700}.gold{color:#b8860b;font-weight:700}.boom{color:#c2255c;font-weight:700;letter-spacing:2px}";
function jsPageDoc(les){
  const page = les.sp.page || "", clicks = les.sp.click || 0;
  const runner = "try{" + les.code.replace(/<\/script/gi, "<\\/script") + "}catch(e){document.body.append(Object.assign(document.createElement('pre'),{textContent:e.name+': '+e.message}))}"
    + (clicks ? ";setTimeout(function(){var b=document.querySelector('#btn');for(var i=0;i<" + clicks + ";i++){b&&b.click()}},20)" : "");
  return "<!doctype html><meta charset=utf-8><style>" + JS_PAGE_CSS + "</style>" + page + "<script>" + runner + "<\/script>";
}
const jsPageFrame = les => '<iframe class="jsframe" sandbox="allow-scripts" srcdoc="' + escH(jsPageDoc(les)).replace(/"/g, "&quot;") + '"></iframe>';
