/* Colours HTML code as it is typed and explains mistakes. */

"use strict";

/* ================= code analysis ================= */
function classifyHtml(code){
  const out = new Array(code.length).fill("c-text"); let i = 0;
  while (i < code.length) {
    if (code.startsWith("<!--", i)) { const e = code.indexOf("-->", i), end = e < 0 ? code.length : e + 3; for (; i < end; i++) out[i] = "c-comment"; continue; }
    if (code[i] === "<") {
      out[i++] = "c-punct"; if (code[i] === "/" || code[i] === "!") out[i++] = "c-punct";
      while (i < code.length && /[A-Za-z0-9]/.test(code[i])) out[i++] = "c-tag";
      while (i < code.length && code[i] !== ">") {
        const d = code[i];
        if (d === " " || d === "=" || d === "\n") out[i++] = "c-punct";
        else if (d === '"') { out[i++] = "c-val"; while (i < code.length && code[i] !== '"') out[i++] = "c-val"; if (i < code.length) out[i++] = "c-val"; }
        else out[i++] = "c-attr";
      }
      if (code[i] === ">") out[i++] = "c-punct";
    } else if (code[i] === "&") {
      const m = /^&[a-z]+;/.exec(code.slice(i)); if (m) { for (let k = 0; k < m[0].length; k++) out[i + k] = "c-ent"; i += m[0].length; } else i++;
    } else i++;
  }
  return out;
}
function runAt(cls, idx){ let a = idx, b = idx; while (a > 0 && cls[a - 1] === cls[idx]) a--; while (b < cls.length - 1 && cls[b + 1] === cls[idx]) b++; return [a, b]; }
function hintHtml(les, idx){
  const t = les.code, cls = les.cls, exp = t[idx], c = cls[idx];
  if (exp === "\n") return "Press Enter here to start a new line.";
  if (c === "c-punct") {
    if (exp === "<") return "Every tag starts with <.";
    if (exp === ">") return "Every tag ends with >.";
    if (exp === "/") return "A slash makes it a closing tag, like </p>.";
    if (exp === "=") return "An attribute name and its value are joined by =.";
    if (exp === " ") return "Put a space between the tag name and the attribute.";
  }
  if (c === "c-tag") { const [a, b] = runAt(cls, idx); return "The tag name here should be " + t.slice(a, b + 1) + "."; }
  if (c === "c-attr") { const [a, b] = runAt(cls, idx); return "The attribute here should be " + t.slice(a, b + 1) + "."; }
  if (c === "c-val") { if (exp === '"') return "Attribute values go inside double quotes."; const [a, b] = runAt(cls, idx); return "The value here should be " + t.slice(a, b + 1).replace(/"/g, "") + "."; }
  if (c === "c-ent") return "Write the entity exactly, including the & and the ;.";
  if (c === "c-comment") return "Comments start with <!-- and end with -->.";
  if (c === "c-text") { const [a, b] = runAt(cls, idx); const run = t.slice(a, b + 1).trim(); return run ? "The text here should read “" + run + "”." : "Check the spacing."; }
  return "Check that character.";
}
