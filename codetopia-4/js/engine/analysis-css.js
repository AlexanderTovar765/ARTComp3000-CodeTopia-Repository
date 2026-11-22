/* Colours CSS code as it is typed and explains mistakes. */

"use strict";

function classifyCss(code){
  const out = new Array(code.length).fill("c-text"), n = code.length; let i = 0, depth = 0, paren = 0;
  const isNameCh = c => /[A-Za-z0-9_\-]/.test(c);
  const mark = (a, b, c) => { for (let k = a; k < b; k++) out[k] = c; };
  while (i < n) {
    const ch = code[i];
    if (code.startsWith("/*", i)) { const e = code.indexOf("*/", i), end = e < 0 ? n : e + 2; mark(i, end, "c-comment"); i = end; continue; }
    if (ch === " " || ch === "\n") { out[i++] = "c-punct"; continue; }
    if (ch === "{") { out[i++] = "c-punct"; depth++; continue; }
    if (ch === "}") { out[i++] = "c-punct"; depth = Math.max(0, depth - 1); continue; }
    if (ch === "@") { let j = i + 1; while (j < n && isNameCh(code[j])) j++; mark(i, j, "c-ent"); i = j; continue; }
    /* at the start of a statement, decide whether it is a selector (a "{" comes before the next ";" or "}") or a declaration */
    let j = i; while (j < n && code[j] !== "{" && code[j] !== ";" && code[j] !== "}") j++;
    const selector = depth === 0 || code[j] === "{";
    if (selector) {
      let k = i;
      while (k < j) {
        const c = code[k];
        if (c === " " || c === "\n") out[k++] = "c-punct";
        else if (c === "." || c === "#") { out[k++] = "c-punct"; const s = k; while (k < j && isNameCh(code[k])) k++; mark(s, k, "c-attr"); }
        else if (c === ":") { out[k++] = "c-punct"; if (code[k] === ":") out[k++] = "c-punct"; const s = k; while (k < j && isNameCh(code[k])) k++; mark(s, k, "c-ent"); }
        else if (c === "," || c === ">" || c === "+" || c === "~" || c === "*" || c === "[" || c === "]" || c === "=" || c === '"') out[k++] = "c-punct";
        else if (c === "(") { out[k++] = "c-punct"; }
        else if (c === ")") { out[k++] = "c-punct"; }
        else if (isNameCh(c)) { const s = k; while (k < j && isNameCh(code[k])) k++; const w = code.slice(s, k); mark(s, k, /^(\d|min-|max-|width|height|screen|and)/.test(w) || /^\d/.test(w) ? "c-val" : "c-tag"); }
        else out[k++] = "c-punct";
      }
      i = j; continue;
    }
    /* a declaration: property : value ; */
    let k = i; const colon = code.indexOf(":", i); const pe = colon >= 0 && colon < j ? colon : j;
    while (k < pe) { const c = code[k]; if (c === " " || c === "\n") out[k++] = "c-punct"; else { out[k++] = "c-attr"; } }
    if (code[pe] === ":") { out[pe] = "c-punct"; k = pe + 1; }
    while (k < j) {
      const c = code[k];
      if (c === " " || c === "\n") out[k++] = "c-punct";
      else if (c === "," || c === "(" || c === ")" || c === "/") out[k++] = "c-punct";
      else if (c === "!") { const s = k; k++; while (k < j && isNameCh(code[k])) k++; mark(s, k, "c-ent"); }
      else if (c === "#") { const s = k; k++; while (k < j && /[0-9a-fA-F]/.test(code[k])) k++; mark(s, k, "c-ent"); }
      else if (/[0-9.\-]/.test(c) && (/[0-9]/.test(c) || /[0-9.]/.test(code[k + 1] || ""))) { const s = k; k++; while (k < j && /[0-9.]/.test(code[k])) k++; while (k < j && /[A-Za-z%]/.test(code[k])) k++; mark(s, k, "c-ent"); }
      else if (c === "-" && code[k + 1] === "-") { const s = k; k += 2; while (k < j && isNameCh(code[k])) k++; mark(s, k, "c-attr"); }
      else if (isNameCh(c)) { const s = k; while (k < j && isNameCh(code[k])) k++; mark(s, k, "c-val"); }
      else out[k++] = "c-punct";
    }
    if (code[j] === ";") { out[j] = "c-punct"; i = j + 1; } else i = j;
  }
  return out;
}
function hintCss(les, idx){
  const t = les.code, cls = les.cls, exp = t[idx], c = cls[idx];
  if (exp === "\n") return "Press Enter here to start a new line.";
  if (c === "c-punct") {
    if (exp === "{") return "Open the rule with a curly brace.";
    if (exp === "}") return "Close the rule with a curly brace.";
    if (exp === ":") return "A property and its value are separated by a colon.";
    if (exp === ";") return "End each declaration with a semicolon.";
    if (exp === ",") return "Separate the items with a comma.";
    if (exp === " ") return "Check the spacing here.";
    if (exp === "." ) return "A dot picks a class.";
    if (exp === "#") return "A hash picks an id.";
    if (exp === "(" || exp === ")") return "Check the brackets.";
  }
  const [a, b] = runAt(cls, idx), word = t.slice(a, b + 1);
  if (c === "c-tag") return "The selector here should be " + word + ".";
  if (c === "c-attr") return t[a - 1] === "." ? "The class name here should be " + word + "." : t[a - 1] === "#" ? "The id name here should be " + word + "." : "The property name here should be " + word + ".";
  if (c === "c-val") return "The value here should be " + word + ".";
  if (c === "c-ent") return /^[0-9.\-]/.test(word) ? "The number and unit here should be " + word + ". Write the unit straight after the number." : word[0] === "!" ? "That should be " + word + "." : word[0] === "@" ? "The at-rule here should be " + word + "." : word[0] === "#" ? "The hex color here should be " + word + "." : "This part should be " + word + ".";
  if (c === "c-comment") return "Comments start with /* and end with */.";
  return "Check that character.";
}

/* ----- the Result panel: a small page wearing the player's CSS, in a frame so the style cannot leak into the game ----- */
const CSS_BASE = "body{margin:8px;font:15px/1.4 system-ui,sans-serif;color:#222;background:#fff}body *{outline:1px dashed rgba(90,70,150,.4)}h1{font-size:22px;margin:0 0 6px}h2{font-size:18px;margin:0 0 6px}p{margin:6px 0}";
function cssPageDoc(les){ return "<!doctype html><meta charset=utf-8><style>" + CSS_BASE + "</style><style>" + les.code.replace(/<\/style/gi, "") + "</style>" + (les.pg || ""); }
const cssPageFrame = les => '<iframe class="cssframe" sandbox="" tabindex="-1" srcdoc="' + escH(cssPageDoc(les)) + '"></iframe>';
