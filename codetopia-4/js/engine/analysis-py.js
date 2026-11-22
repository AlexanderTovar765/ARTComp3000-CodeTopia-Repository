/* Python track: colours code as it is typed and explains mistakes. */

"use strict";

const PY_WORDS = new Set("def return if elif else for while in not and or is None True False lambda pass break continue import from as class del print len range str int float bool type sorted sum min max enumerate zip list dict set tuple abs round input open".split(" "));
function classifyPy(code){
  const out = new Array(code.length).fill("c-punct"); let i = 0;
  while (i < code.length) {
    const ch = code[i];
    if (ch === "#") { let e = code.indexOf("\n", i); if (e < 0) e = code.length; for (; i < e; i++) out[i] = "c-comment"; continue; }
    if (ch === '"' || ch === "'") { out[i++] = "c-val"; while (i < code.length && code[i] !== ch) { if (code[i] === "\\" && i + 1 < code.length) out[i++] = "c-val"; out[i++] = "c-val"; } if (i < code.length) out[i++] = "c-val"; continue; }
    if (/[0-9]/.test(ch)) { while (i < code.length && /[0-9.]/.test(code[i])) out[i++] = "c-val"; continue; }
    if (/[A-Za-z_]/.test(ch)) { const s = i; while (i < code.length && /\w/.test(code[i])) i++; const w = code.slice(s, i), prev = code[s - 1], k = PY_WORDS.has(w) ? "c-tag" : "c-attr"; for (let j = s; j < i; j++) out[j] = k;
      if ((w === "f") && (code[i] === '"' || code[i] === "'")) for (let j = s; j < i; j++) out[j] = "c-val"; continue; }
    i++;
  }
  return out;
}
function hintPy(les, idx){
  const t = les.code, cls = les.cls, exp = t[idx], c = cls[idx];
  if (exp === "\n") return "Press Enter here to start a new line.";
  if (c === "c-punct") {
    const lineStart = idx === 0 || t[idx - 1] === " " && /^ *$/.test(t.slice(t.lastIndexOf("\n", idx - 1) + 1, idx));
    if (exp === " " && /^ *$/.test(t.slice(t.lastIndexOf("\n", idx) + 1, idx + 1)) && t.lastIndexOf("\n", idx) >= 0) return "Python blocks are marked by indentation. Use 4 spaces for each level.";
    if (exp === ":") return "A colon ends the line before an indented block, after if, elif, else, for, while and def.";
    if (exp === "=" && t[idx + 1] === "=") return "== compares two values. A single = stores a value.";
    if (exp === "=" && t[idx - 1] === "=") return "== compares two values.";
    if (exp === "=") return "A single = stores a value. Two == compare two values.";
    if (exp === "(" || exp === ")") return "Brackets ( ) hold the values you give to a function or a condition.";
    if (exp === "[" || exp === "]") return "Square brackets [ ] make a list or pick an item by its index.";
    if (exp === "{" || exp === "}") return "Curly braces { } make a dictionary, or hold a value inside an f-string.";
    if (exp === ",") return "Separate items with a comma.";
    if (exp === ".") return "A dot reaches inside something, like bag.append or text.upper.";
    if (exp === "#") return "# starts a comment that runs to the end of the line.";
    if (exp === "!") return "!= means not equal.";
    if (exp === "*") return "* multiplies, and ** raises to a power.";
    if (exp === "/") return "/ divides and always gives a decimal, and // throws the decimal part away.";
    if (exp === "+" || exp === "-" || exp === "%" || exp === "<" || exp === ">") return "The symbol here should be " + exp + ".";
    if (exp === " ") return "Check the spacing here.";
    return "The symbol here should be " + exp + ".";
  }
  if (c === "c-tag") { const [a, b] = runAt(cls, idx); return "The keyword here should be " + t.slice(a, b + 1) + ". Python keywords are all small letters, except True, False and None."; }
  if (c === "c-attr") { const [a, b] = runAt(cls, idx); return "The name here should be " + t.slice(a, b + 1) + ". Capital letters matter."; }
  if (c === "c-val") {
    if (exp === '"') return "Text goes inside quotes.";
    if (exp === "'") return "Single quotes also make a string.";
    const [a, b] = runAt(cls, idx), run = t.slice(a, b + 1);
    if (/^[0-9.]+$/.test(run)) return "The number here should be " + run + ".";
    return "The text here should read “" + run.replace(/^f?["']|["']$/g, "") + "”.";
  }
  if (c === "c-comment") return "A comment starts with # and runs to the end of the line.";
  return "Check that character.";
}
