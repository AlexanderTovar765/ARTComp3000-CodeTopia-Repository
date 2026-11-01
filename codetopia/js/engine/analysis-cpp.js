/* Colours C++ code as it is typed and explains mistakes. */

"use strict";

const CPP_WORDS = new Set("int double float char bool string void if else for while do return class struct public private new delete const auto true false nullptr using namespace cout cin endl vector break continue main include size_t std".split(" "));
function classifyCpp(code){
  const out = new Array(code.length).fill("c-punct"); let i = 0;
  while (i < code.length) {
    const ch = code[i];
    if (code.startsWith("//", i)) { let e = code.indexOf("\n", i); if (e < 0) e = code.length; for (; i < e; i++) out[i] = "c-comment"; continue; }
    if (ch === '"' || ch === "'") { out[i++] = "c-val"; while (i < code.length && code[i] !== ch) { if (code[i] === "\\" && i + 1 < code.length) out[i++] = "c-val"; out[i++] = "c-val"; } if (i < code.length) out[i++] = "c-val"; continue; }
    if (/[0-9]/.test(ch)) { while (i < code.length && /[0-9.]/.test(code[i])) out[i++] = "c-val"; continue; }
    if (/[A-Za-z_]/.test(ch)) { const s = i; while (i < code.length && /\w/.test(code[i])) i++; const k = CPP_WORDS.has(code.slice(s, i)) ? "c-tag" : "c-attr"; for (let j = s; j < i; j++) out[j] = k; continue; }
    i++;
  }
  return out;
}
function hintCpp(les, idx){
  const t = les.code, cls = les.cls, exp = t[idx], c = cls[idx];
  if (exp === "\n") return "Press Enter here to start a new line.";
  if (c === "c-punct") {
    const two = t.slice(idx, idx + 2), prev = t.slice(idx - 1, idx + 1);
    if (exp === ";") return "Every statement ends with a semicolon.";
    if (exp === "<" || exp === ">") {
      if (two === "<<" || prev === "<<") return "cout sends things out with << arrows.";
      if (two === ">>" || prev === ">>") return "cin reads input with >> arrows.";
      return exp === "<" ? "Here you need a less-than sign <." : "Here you need a greater-than sign >.";
    }
    if (exp === "{" || exp === "}") return "Curly braces { } wrap a block of code. Every { needs a matching }.";
    if (exp === "(" || exp === ")") return "Brackets ( ) hold a condition, parameters or arguments.";
    if (exp === "[" || exp === "]") return "Square brackets [ ] pick an item by its index.";
    if (exp === "=") return "A single = stores a value. Two == compare two values.";
    if (exp === ",") return "Separate items with a comma.";
    if (exp === ":") return "A colon goes here, like public: or the one in a range-based for.";
    if (exp === "&") return "& is an address-of or a reference, or && when it is doubled.";
    if (exp === "*") return "* is multiply, or marks a pointer, or follows a pointer.";
    if (exp === "!") return "! flips true and false, and != means not equal.";
    if (exp === "/") return "// starts a comment, and / on its own divides.";
    if (exp === " ") return "Check the spacing here.";
    if (exp === "-" && t[idx + 1] === ">") return "-> reaches a member through a pointer.";
    return "The symbol here should be " + exp + ".";
  }
  if (c === "c-tag") { const [a, b] = runAt(cls, idx); return "The keyword here should be " + t.slice(a, b + 1) + "."; }
  if (c === "c-attr") { const [a, b] = runAt(cls, idx); return "The name here should be " + t.slice(a, b + 1) + "."; }
  if (c === "c-val") {
    if (exp === '"') return "Text goes inside double quotes.";
    if (exp === "'") return "A single character goes inside single quotes.";
    const [a, b] = runAt(cls, idx), run = t.slice(a, b + 1);
    if (/^[0-9.]+$/.test(run)) return "The number here should be " + run + ".";
    return "The text here should read “" + run.replace(/^["']|["']$/g, "") + "”.";
  }
  if (c === "c-comment") return "A comment starts with // and runs to the end of the line.";
  return "Check that character.";
}
