/* The typing editor: checks each key and shows hints. */

"use strict";

/* ================= the code editor ================= */
function vis(c){ return c === "\n" ? "↵" : c; }
function drawCode(){
  const les = S.lesson; if (!les) return;
  const t = les.code, v = ta.value, mode = S.mode; let h = "";
  for (let i = 0; i < t.length; i++) {
    if (i === v.length) h += '<i class="caret"></i>';
    const ch = t[i], cls = les.cls[i], st = i < v.length ? (v[i] === ch ? "ok" : "bad") : "todo";
    const shown = (st === "bad" && mode !== "full") ? v[i] : ch;
    if (ch === "\n") { h += `<span class="nl ${st}">${st === "bad" ? esc(vis(shown)) : "↵"}</span><br>`; continue; }
    const cl = [cls, st];
    if (st === "todo") {
      if (mode === "recall") cl.push("hid");
      else if (mode === "tags" && (cls === "c-text" || cls === "c-val" || cls === "c-ent" || cls === "c-comment")) cl.push(ch === " " ? "hid" : "dot");
    }
    h += `<span class="${cl.join(" ")}">${esc(vis(shown))}</span>`;
  }
  if (v.length >= t.length) h += '<i class="caret"></i>';
  for (let i = t.length; i < v.length; i++) h += `<span class="bad">${esc(vis(v[i]))}</span>`;
  if (mode === "recall" && !v) h += '<span class="ph">Type it from memory</span>';
  $("#code").innerHTML = h;
}
const endCaret = () => { const n = ta.value.length; try { ta.setSelectionRange(n, n); } catch (e) {} };
function onChange(){
  const les = S.lesson; if (!les || S.busy) return;
  const v = ta.value, t = les.code; let firstBad = -1;
  if (v.length < S.prevLen) S.prevLen = v.length;
  for (let i = S.prevLen; i < v.length; i++) if (v[i] !== t[i]) { S.mistakes++; if (firstBad < 0) firstBad = i; }
  S.prevLen = v.length; drawCode();
  if (firstBad >= 0) fb(firstBad < t.length ? mistakeHint(les, firstBad) : "That is more than the spell needs. Press Backspace.");
  else if (t.startsWith(v)) fb("");
  if (v === t) complete();
}
function append(s){ ta.value += s; endCaret(); onChange(); }
ta.addEventListener("input", onChange);
ta.addEventListener("click", endCaret);
ta.addEventListener("paste", e => e.preventDefault());
ta.addEventListener("drop", e => e.preventDefault());
ta.addEventListener("keydown", e => {
  if (S.busy || !S.lesson) return;
  if (e.key === "Escape") { back(); return; }
  if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"].includes(e.key)) { e.preventDefault(); return; }
  if (e.key === "Enter") {
    e.preventDefault(); const v = ta.value, t = S.lesson.code;
    if (t[v.length] === "\n") append("\n" + /^ */.exec(t.slice(v.length + 1))[0]); else append("\n");
    return;
  }
  if (e.key === "Backspace" && /\n +$/.test(ta.value)) { e.preventDefault(); ta.value = ta.value.replace(/\n +$/, ""); endCaret(); onChange(); }
});
document.addEventListener("keydown", e => {
  if (e.target === ta || e.ctrlKey || e.metaKey || e.altKey || e.target.closest("textarea,input")) return;
  if (!$("#intro").hidden || !$("#story").hidden || $$(".sheet").some(s => !s.hidden) || !$("#overlay").hidden || S.busy) return;
  const k = e.key.toLowerCase();
  const act = Object.entries(ACTIONS).find(([, a]) => a.key === k);
  if (act && ACTIONS[act[0]].unlock <= S.lvl) { selectAction(act[0]); return; }
  const pi = "asd".indexOf(k);
  if (pi >= 0 && !$("#picks").hidden && S.offers[pi]) chooseSpell(pi);
});
