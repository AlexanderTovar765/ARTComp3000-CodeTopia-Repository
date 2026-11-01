/* Battle state and choosing which spells to offer. */

"use strict";

/* ================= game state ================= */
const S = { lvl:1, heroMax:100, heroHP:100, foeMax:90, foeHP:90, intent:null, phase2:false, shield:0, skip:false,
  busy:true, action:null, offers:[], lesson:null, mode:"full", hint:false, mistakes:0, prevLen:0, recent:[], lastWords:[], lvCasts:0, lvClean:0 };
const LV = () => LEVELS[S.lvl - 1], FOE = () => LEVELS[S.lvl - 1].foe;
const scene = $("#scene"), fx = $("#fx"), hero = $("#hero"), foe = $("#foe"), ta = $("#codeIn");
const say = t => { $("#ticker").textContent = t; };
function center(el){ const r = el.getBoundingClientRect(), s = scene.getBoundingClientRect(); return { x:r.left - s.left + r.width / 2, y:r.top - s.top + r.height / 2, w:r.width, h:r.height }; }
const weakHit = sp => !!FOE().weak && sp.c.includes(FOE().weak);

/* choose which spells to offer for an action: new concepts first, then reviews that are due, then the weakest */
function score(sp){
  let unseen = 0, due = 0, minBox = 5;
  sp.c.forEach(id => { if (!seen(id)) unseen++; else { if (isDue(id)) due++; minBox = Math.min(minBox, D.mast[id].box); } });
  let sc = 0; if (sp.L === S.lvl) sc += 20;
  sc += unseen * (sp.L === S.lvl ? 100 : 30) + due * 40 + (5 - minBox) * 6;
  if (weakHit(sp) && (sp.a === "attack" || sp.a === "heavy")) sc += 25;
  if (S.recent.includes(sp.id)) sc -= 60;
  return sc + Math.random() * 10;
}
function offers(action){
  const ranked = SP.filter(s => s.a === action && s.L <= S.lvl).map(s => ({ s, v:score(s) })).sort((a, b) => b.v - a.v);
  const out = [], titles = new Set();
  for (const r of ranked) { if (titles.has(r.s.t)) continue; titles.add(r.s.t); out.push(r.s); if (out.length === 3) break; }
  return out;
}
function badgeFor(sp){
  if (sp.c.every(id => !seen(id))) return "New";
  if (sp.c.some(isDue)) return "Review";
  return sp.L < S.lvl ? "Review" : "Practice";
}
function pickWords(){
  const pool = WORDS.filter(w => !S.lastWords.includes(w)), out = [];
  while (out.length < 3) { const w = sample(pool.filter(x => !out.includes(x))); out.push(w); }
  S.lastWords = S.lastWords.concat(out).slice(-8); return out;
}
function instantiate(sp){
  const [w, x, y] = pickWords(), k = sample(Object.keys(CLASSES)), i = sample(IDS), t = sample(TAGS);
  let n, m; do { n = rnd(4, 9); m = rnd(2, n - 1); } while (n % m === 0);
  const map = { w, x, y, k, i, t, n, m, c:sample("ABCDS".split("")) }, fill = s => s && s.replace(TRK.fill, (m0, c) => map[c]);
  const code = fill(sp.code);
  const out = TRK.id === "cpp" ? String(typeof sp.out === "function" ? sp.out(map) : fill(sp.out || "")) : "";
  return { sp, code, out, goal:fill(sp.goal), bug:fill(sp.bug), cls:classify(code), multi:code.includes("\n") };
}
