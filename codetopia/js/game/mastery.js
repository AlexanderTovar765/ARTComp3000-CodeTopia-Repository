/* Spaced repetition, difficulty adaptation and fading help. */

"use strict";

/* ================= mastery, scheduling, adaptivity ================= */
const INTERVALS = [1, 2, 4, 7, 12, 20];
const THRESH = { gentle:[3,5], normal:[2,4], tough:[2,3] };
const DMG_MULT = { gentle:.8, normal:1, tough:1.15 };
const mEntry = id => D.mast[id] || (D.mast[id] = { box:0, seen:0, clean:0, due:0 });
const seen = id => !!(D.mast[id] && D.mast[id].seen);
const isDue = id => seen(id) && D.turn >= D.mast[id].due;
const dueCount = () => CON_IDS.filter(isDue).length;
const starsOf = id => !seen(id) ? 0 : D.mast[id].box >= 5 ? 3 : D.mast[id].box >= 3 ? 2 : 1;
function diff(){
  const h = D.hist.slice(-10);
  if (h.length >= 5) { const r = h.reduce((a, b) => a + b, 0) / h.length; if (r < .5) return "gentle"; if (r > .85 && h.length >= 8) return "tough"; }
  return "normal";
}
function applyMastery(spell, mistakes, hinted){
  D.turn++; D.casts++;
  const clean = mistakes === 0 && !hinted;
  if (clean) D.clean++;
  D.hist.push(clean ? 1 : 0); if (D.hist.length > 20) D.hist.shift();
  spell.c.forEach(id => {
    const e = mEntry(id); e.seen++;
    if (clean) { e.clean++; e.box = Math.min(5, e.box + 1); }
    else if (!hinted && mistakes >= 2) e.box = Math.max(0, e.box - 1);
    e.due = D.turn + INTERVALS[e.box];
  });
  persist();
}
/* How much help each spell gets is set by the level: levels 1-2 always show faded text, levels 3-4 mix faded text with dots,
   and from level 5 each action offers one faded, one dotted and one from-memory spell. */
const MODE_LABEL = { full:"Faded text", tags:"Dots", recall:"From memory" };
function assignModes(n){
  const L = S.lvl, pool = L <= 2 ? ["full"] : L <= 4 ? ["full", "tags"] : ["full", "tags", "recall"], m = pool.length > 1 ? pool.slice() : [];
  while (m.length < n) m.push(sample(pool));
  for (let i = m.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [m[i], m[j]] = [m[j], m[i]]; }
  return m.slice(0, n);
}
