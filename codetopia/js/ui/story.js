/* Opening story cutscene. */

"use strict";

/* ================= opening story ================= */
const story = $("#story"), scv = $("#scv");
const BAYS = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
const SC = { W:0, H:0, GT:0, cell:4, u:null, img:null, ctx:null, houses:[], trees:[], eyes:null };
const STORY = [
  { dur:6.5, m:[0,0],   text:"In the kingdom of Codetopia, everyone spoke to the world in code. A tag here, a line there, and gardens bloomed, bridges rose and the whole realm glowed with life." },
  { dur:6.5, m:[0,.3],  text:"The Apprentices taught every child to write spells in HTML, C++, JavaScript and Python. For a hundred years the kingdom prospered, and not one bug dared cross the border." },
  { dur:6.5, m:[.3,1],  text:"But in the far mountains lived Pythona, the Serpent Queen. She had ruled her own language for so long that she wanted every language to answer to her." },
  { dur:6.5, m:[1,1],   text:"So one stormy night she cast a curse. Spells twisted, tags snapped shut, and monsters crawled out of every broken line of code." },
  { dur:7,   m:[1,1],   text:"Pythona lent her power to three champions: the Markup Titan, the Pointer Wraith and the Callback Hydra. Each guards one language, and each serves her." },
  { dur:7,   m:[1,.85], text:"Only one Apprentice still remembers how to write real code. Learn each language, defeat each champion, and break the curse before it reaches the castle." }
];
const STRIKES = { 2:[1.2, 4.5, 8], 3:[.5, 5.5], 4:[3.5, 8] };
const TYPE_CPS = 28, HOLD = 5;
const st = { on:false, i:0, t0:0, sT:0, last:0, raf:0, typed:0 };
const PD = { sky:["#3b7fd6","#4f95e6","#68abf0","#82bff5","#9dd0f8","#b6dffa","#d2edfb","#eaf7ff"], far:"#6aa879", farE:"#86c48e", near:"#4f9468", nearE:"#67ad7c", tree:"#2f6f4e", trunk:"#234f38",
  g0:"#8bd993", g1:"#5fb36e", g2:"#4a9b62", g3:"#3d7d5d", g4:"#2f6650", bl:"#c9b895", bd:"#6e5f48", b0:"#a89574", b1:"#b4a07e", b2:"#9c8968",
  mtn:"#8fa9d6", mtnD:"#6f88bb", snow:"#f4f9ff", treeL:"#3f8a62", wood:"#8a6a4a", woodD:"#6a4e34", glass:"#ffe9a8", smoke:"#e8eef8", stone:"#d8d2e8", stoneD:"#a9a2c4", roof:"#d65a7a", cloud0:"#ffffff", cloud1:"#e6f2ff", cloud2:"#cfe3f8", sun:"#fff2a8", house:"#f0e0c0", houseR:"#c0583a", door:"#6a4a32" };
const PS = { sky:["#0f0c24","#17122f","#221a3c","#2c2348","#382d55","#463a63","#554a70","#655b7d"], far:"#2a2250", farE:"#383064", near:"#1e1840", nearE:"#2a2358", tree:"#120e2b", trunk:"#0c0920",
  g0:"#4a8a58", g1:"#3a7048", g2:"#2f5e3e", g3:"#2a5238", g4:"#1f3f30", bl:"#34605f", bd:"#1a3032", b0:"#27494a", b1:"#2a4f4f", b2:"#244344",
  mtn:"#2c2858", mtnD:"#201c44", snow:"#6c6a9c", treeL:"#1c1844", wood:"#3a3048", woodD:"#2a2034", glass:"#c4a050", smoke:"#4a4468", stone:"#6a6490", stoneD:"#4a4472", roof:"#7a3552", cloud0:"#4a3f70", cloud1:"#3a3060", cloud2:"#2a2248", sun:"#c4624a", house:"#8a7a8a", houseR:"#5a2a3a", door:"#2a1c28" };
const rgbOf = (() => { const c = {}; return h => c[h] || (c[h] = [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]); })();
const pk = (r, g, b) => ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;
function mixU(a, b, m){ const A = rgbOf(a), B = rgbOf(b); return pk(Math.round(A[0] + (B[0] - A[0]) * m), Math.round(A[1] + (B[1] - A[1]) * m), Math.round(A[2] + (B[2] - A[2]) * m)); }
function palAt(m){ const o = {}; for (const k in PD) o[k] = k === "sky" ? PD.sky.map((c, i) => mixU(c, PS.sky[i], m)) : mixU(PD[k], PS[k], m); return o; }
const clamp01 = v => Math.max(0, Math.min(1, v));
function moodAt(si, lt){ if (si === 2) return .3 + .7 * clamp01(lt / 3.5); const s = STORY[si]; return s.m[0] + (s.m[1] - s.m[0]) * clamp01(lt / s.dur); }
const VILLAGERS = [
  { b:"#e0647c", c:"#a8344c", n:"#f08ca0", o:"#c04058", d:"#ffd166" }, { b:"#6a8dff", c:"#3a56c4", n:"#94afff", o:"#4a68d8", d:"#8affd8" }, { b:"#f2a541", c:"#b36d12", n:"#ffc474", o:"#d48a28", d:"#ff8a5c" }
];

function storySize(){
  const cell = innerWidth < 600 ? 3 : 4, W = Math.ceil(innerWidth / cell), H = Math.ceil(innerHeight / cell);
  scv.width = W; scv.height = H; SC.W = W; SC.H = H; SC.cell = cell; SC.GT = H - Math.round(H * (innerWidth < 600 ? .4 : .34));
  SC.ctx = scv.getContext("2d"); SC.img = SC.ctx.createImageData(W, H); SC.u = new Uint32Array(SC.img.data.buffer);
  let seed = 11; const rand = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  SC.hq = Math.max(2, Math.min(3, Math.round(SC.GT / 40))); SC.houses = [.04, .2, .36, .52, .9].filter((f, i) => W > 220 || i % 2 === 0).map((f, i) => ({ x:Math.round(f * W), v:i % 3 }));
  SC.trees = []; for (let x = 3; x < W - 3; x += 6 + Math.floor(rand() * 8)) if (!SC.houses.some(h => Math.abs(h.x - x) < 11)) SC.trees.push({ x, h:5 + Math.floor(rand() * 4) });
}

function paintStory(t, si, lt){
  const { W, H, GT, u } = SC, m = moodAt(si, lt), P = palAt(m);
  const set = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < W && y < H) u[y * W + x] = c; };
  const rect = (x, y, w, h, c) => { for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) set(x + xx, y + yy, c); };
  const thr = (x, y) => (BAYS[(y & 3) * 4 + (x & 3)] + .5) / 16;
  const glow = (cx, cy, r, col, a) => { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const d = Math.hypot(dx, dy); if (d > r) continue;
    const X = Math.round(cx + dx), Y = Math.round(cy + dy); if (thr(X & 255, Y & 255) < a * Math.pow(1 - d / r, 1.4)) set(X, Y, col); } };
  const blit = (def, x, y, s, o) => { o = o || {}; const rows = def.px, w = rows[0].length, X0 = Math.round(x), Y0 = Math.round(y);
    if (s % 1) { const dh = Math.round(rows.length * s), dw = Math.round(w * s); for (let dy = 0; dy < dh; dy++) for (let dx = 0; dx < dw; dx++) { const sx = Math.min(w - 1, Math.floor(dx / s)), sy = Math.min(rows.length - 1, Math.floor(dy / s)), ch = rows[sy][o.flip ? w - 1 - sx : sx]; if (ch === ".") continue;
      const hx = (o.pal && ch in o.pal) ? o.pal[ch] : def.pal[ch]; if (!hx) continue; const X = X0 + dx, Y = Y0 + dy; if (o.a === undefined || o.a >= 1 || thr(X & 255, Y & 255) < o.a) set(X, Y, o.dark && !(o.keep && o.keep.includes(ch)) ? mixU(hx, "#0a0620", o.dark) : hexU(hx)); } return; }
    for (let ry = 0; ry < rows.length; ry++) for (let rx = 0; rx < w; rx++) {
      const ch = rows[ry][o.flip ? w - 1 - rx : rx]; if (ch === ".") continue;
      const hx = (o.pal && ch in o.pal) ? o.pal[ch] : def.pal[ch]; if (!hx) continue;
      const c = o.dark && !(o.keep && o.keep.includes(ch)) ? mixU(hx, "#0a0620", o.dark) : hexU(hx);
      for (let yy = 0; yy < s; yy++) for (let xx = 0; xx < s; xx++) { const X = X0 + rx * s + xx, Y = Y0 + ry * s + yy; if (o.a === undefined || o.a >= 1 || thr(X & 255, Y & 255) < o.a) set(X, Y, c); } } };
  const k2 = 2 * Math.PI / W, wave = (x, ph) => .55 * Math.sin(k2 * 3 * x + ph) + .3 * Math.sin(k2 * 7 * x + ph * 2) + .15 * Math.sin(k2 * 15 * x + ph * 3);
  const hash = (a, b) => ((a * 73856093) ^ (b * 19349663)) >>> 0;
  // sky
  for (let y = 0; y < GT; y++) { const f = Math.pow(y / (GT - 1), 1.1) * 7, i = Math.min(6, Math.floor(f)), fr = f - i;
    for (let x = 0; x < W; x++) u[y * W + x] = fr > (BAYS[(y & 3) * 4 + (x & 3)] + .5) / 16 ? P.sky[i + 1] : P.sky[i]; }
  // sun
  if (m < .85) { const R = Math.max(6, Math.round(GT * .09)), sx = Math.round(W * .2), sy = Math.round(GT * (.26 + .5 * m)), a = 1 - m / .85;
    glow(sx, sy, R + 7, P.sun, .35 * a); for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) if (dx * dx + dy * dy <= R * R && thr(sx + dx & 255, sy + dy & 255) < a + .05) set(sx + dx, sy + dy, P.sun); }
  // clouds
  [[.1, .3, 26, 1.2], [.5, .2, 32, .8], [.85, .42, 22, 1.6], [.3, .55, 16, 1.4]].forEach(([bx, by, w, sp]) => { const span = W + w * 2, cx = Math.floor((((bx * W + t * sp) % span) + span) % span) - w;
    [[.45, P.cloud0], [.9, P.cloud1], [1, P.cloud2], [.7, P.cloud2]].forEach(([f, c], j) => { const rw = Math.round(w * f), x0 = Math.round(cx - rw / 2); for (let x = 0; x < rw; x++) set(x0 + x, Math.round(GT * by) + j, c); }); });
  // far hills
  const ridge = (hgt, amp, ph, off, fill, edge) => { const tops = new Array(W), o = Math.floor(off);
    for (let x = 0; x < W; x++) { const top = GT - Math.round(hgt + amp * wave(x + o, ph)); tops[x] = top; for (let y = Math.max(0, top); y < GT; y++) u[y * W + x] = fill; set(x, top, edge); if ((x & 1) === 0) set(x, top + 1, edge); }
    return { tops, o }; };
  if (m > .25) { const sa = clamp01((m - .25) / .5), sc2 = hexU("#dfe6ff"); for (let k = 0, n = Math.round(W / 5); k < n; k++) { const x = hash(k, 31) % W, y = hash(k, 32) % Math.round(GT * .55); if ((hash(k, 33) + Math.floor(t * 2 + k)) % 5 && thr(x & 255, y & 255) < sa) set(x, y, sc2); } }
  { const o = Math.floor(t * .5); for (let x = 0; x < W; x++) { const wx = x + o, pk1 = Math.abs(Math.sin(wx * .045 + 1.1)) * .6 + Math.abs(Math.sin(wx * .11 + 2)) * .4, top = GT - Math.round(GT * .26 + GT * .2 * pk1), snowL = Math.round(GT * .07);
    for (let y = Math.max(0, top); y < GT; y++) u[y * W + x] = ((x + y) & 7) < 3 && y > top + snowL ? P.mtnD : P.mtn;
    for (let y = Math.max(0, top); y < top + snowL && y < GT; y++) if (y - top < 2 || (hash(wx, y) % 3)) u[y * W + x] = P.snow; } }
  ridge(GT * .3, GT * .1, 1.3, t * 1.2, P.far, P.farE);
  // castle on its own mound
  const q = Math.max(2, Math.round(GT / 38)), cx = Math.round(W * .72), baseY = GT - Math.round(GT * .2);
  for (let dx = -10 * q; dx <= 10 * q; dx++) { const top = baseY + Math.round(3 * q * Math.pow(dx / (10 * q), 2)); for (let y = top; y < GT; y++) set(cx + dx, y, P.far); set(cx + dx, top, P.farE); }
  const cursedAmt = si < 3 ? 0 : si === 3 ? clamp01((lt - 1.5) / 4) : 1;
  const winC = cursedAmt > 0 ? (Math.floor(t * 6 + 3) % 5 === 0 ? mixU("#1a1030", "#5cff9a", .4) : mixU("#ffe08a", "#5cff9a", cursedAmt)) : hexU("#ffe08a");
  const kw = 12 * q, kh = 11 * q;
  const dark = hexU("#1a1030"), wood = P.wood, flameC = hexU(cursedAmt > .5 ? "#7cff9a" : "#ffb347");
  const bricks2 = (x0, y0, w, h, base, shade) => { rect(x0, y0, w, h, base); for (let y = 0; y < h; y += 3) { rect(x0, y0 + y, w, 1, shade); const off = (y / 3 & 1) * 3; for (let x = off; x < w; x += 6) set(x0 + x, y0 + y + 1, shade); set(x0 + x0 * 0, 0, shade); } rect(x0 + w - 1, y0, 1, h, shade); };
  const crenel = (x0, y0, w, step, c) => { for (let x = 0; x < w; x += step * 2) rect(x0 + x, y0 - step, Math.min(step, w - x), step, c); };
  // curtain walls on both sides of the keep
  [-1, 1].forEach(sg => { const wx = sg < 0 ? cx - kw / 2 - 9 * q : cx + kw / 2, ww = 9 * q, wh = 7 * q; bricks2(wx, baseY - wh, ww, wh, P.stone, P.stoneD); crenel(wx, baseY - wh, ww, q, P.stone); rect(wx, baseY - wh, ww, 1, P.stoneD);
    rect(wx + Math.round(ww / 2) - 1, baseY - 4 * q, 2, 2 * q, dark); });
  // main keep: raised upper block behind, lit windows, brick walls
  bricks2(cx - kw / 3, baseY - kh - 5 * q, 2 * kw / 3, 5 * q + 1, P.stone, P.stoneD); crenel(cx - kw / 3, baseY - kh - 5 * q, 2 * kw / 3, q, P.stone);
  rect(cx - q, baseY - kh - 4 * q, 2 * q, 3 * q, winC); rect(cx - q, baseY - kh - 4 * q, 2 * q, 1, P.stoneD); rect(cx, baseY - kh - 4 * q, 1, 3 * q, P.stoneD);
  bricks2(cx - kw / 2, baseY - kh, kw, kh, P.stone, P.stoneD); crenel(cx - kw / 2, baseY - kh, kw, q, P.stone); rect(cx - kw / 2, baseY - kh, kw, 1, P.stoneD);
  // gate: stone arch, dark opening, portcullis, door planks
  const gw = 4 * q, gh = 6 * q, gx = cx - gw / 2; rect(gx - 1, baseY - gh - 1, gw + 2, gh + 1, P.stoneD);
  for (let r = 0; r < gw / 2; r++) { const hw2 = Math.round(Math.sqrt((gw / 2) * (gw / 2) - (gw / 2 - r) * (gw / 2 - r))); rect(cx - hw2, baseY - gh - gw / 2 + r, hw2 * 2, 1, dark); }
  rect(gx, baseY - gh, gw, gh, dark); for (let x = 1; x < gw; x += 2) rect(gx + x, baseY - gh, 1, gh, wood); for (let y = 1; y < gh; y += 3) rect(gx, baseY - gh + y, gw, 1, wood);
  [gx - 3, gx + gw + 2].forEach((tx, i) => { rect(tx, baseY - gh, 1, 3, P.woodD); const f = (Math.floor(t * 8 + i * 3) & 1); set(tx, baseY - gh - 1, flameC); if (f) set(tx, baseY - gh - 2, flameC); glow(tx, baseY - gh - 1, 4, flameC, .25); });
  rect(gx + 1, baseY, gw - 2, 1, P.woodD);
  // arrow slits and a banner over the gate
  [-5, 5].forEach(o => { rect(cx + o * q - 1, baseY - 8 * q, 2, 3 * q, dark); rect(cx + o * q - 2, baseY - 7 * q, 4, 1, dark); });
  rect(cx - q, baseY - 10 * q, 2 * q, 3 * q, cursedAmt > .5 ? hexU("#5a2090") : hexU("#d64560")); for (let k = 0; k < q; k++) set(cx - q + k * 2, baseY - 7 * q + (k & 1), cursedAmt > .5 ? hexU("#5a2090") : hexU("#d64560")); set(cx, baseY - 9 * q, hexU("#ffc857"));
  // side towers: brick, machicolation ring, crenellations, arched window, conical roof
  [-1, 1].forEach(sg => { const tx = Math.round(cx + sg * (kw / 2 + q) - 3 * q), tw = 6 * q, th = 17 * q;
    bricks2(tx, baseY - th, tw, th, P.stoneD, mixU("#a9a2c4", "#2a2358", .35 + .35 * m)); rect(tx, baseY - th, 1, th, P.stone);
    rect(tx - 1, baseY - th, tw + 2, 2, P.stone); crenel(tx - 1, baseY - th, tw + 2, 2, P.stone); rect(tx - 1, baseY - th + 2, tw + 2, 1, P.stoneD);
    rect(tx + 2 * q, baseY - th + 5 * q, 2 * q, 3 * q, winC); rect(tx + 2 * q + q - 1, baseY - th + 5 * q - 1, 2, 1, winC); rect(tx + 2 * q - 1, baseY - th + 8 * q, 2 * q + 2, 1, P.stone); rect(tx + 3 * q - 1, baseY - th + 5 * q, 1, 3 * q, P.stoneD);
    rect(tx + 2 * q, baseY - th + 11 * q, q, 2 * q, dark); rect(tx + 4 * q - 1, baseY - th + 11 * q, q, 2 * q, dark);
    rect(tx - 1, baseY - 2, tw + 2, 2, P.stone);
    const rt = 5 * q; for (let r = 0; r < rt; r++) { const inset = Math.floor(r * (tw / 2 + q) / rt); rect(tx - q + inset, baseY - th - 3 - r, tw + 2 * q - 2 * inset, 1, (r & 1) ? P.roof : mixU("#d65a7a", "#5a2438", .25 + .25 * m)); }
    if (sg > 0) { const px = tx + 3 * q, py = baseY - th - 3 - rt; rect(px, py - 3 * q, 1, 3 * q + 2, P.stoneD); const fl = Math.round(Math.sin(t * 5) * 1.2), fc = cursedAmt > .5 ? hexU("#7a2fb0") : hexU("#ff5a7a"); rect(px + 1, py - 3 * q, 3 * q, 2 * q, fc); set(px + 3 * q + 1, py - 3 * q + fl + q, fc); set(px + 3 * q + 2, py - 3 * q + fl + q, fc); }
    else { const px = tx + 3 * q, py = baseY - th - 3 - rt; rect(px, py - 2 * q, 1, 2 * q + 2, P.stoneD); set(px + 1, py - 2 * q, hexU("#ffc857")); } });
  // near hills, houses and trees
  const nr = ridge(GT * .16, GT * .07, 4.1, t * 3, P.near, P.nearE);
  const lit = cursedAmt > 0 ? winC : hexU("#ffe08a");
  SC.houses.forEach(hs => { const q2 = SC.hq, sx = (((hs.x - nr.o) % W) + W) % W, by = nr.tops[sx] + 2, hw = 9 * q2, hh = 6 * q2, rh = 4 * q2;
    const wall = hs.v === 1 ? P.stone : P.house, roof = hs.v === 2 ? P.stoneD : P.houseR;
    rect(sx, by - hh, hw, hh, wall); for (let y = by - hh + q2; y < by; y += q2 * 2) rect(sx, y, hw, 1, P.woodD);   // plank lines
    rect(sx, by - hh, 1, hh, P.woodD); rect(sx + hw - 1, by - hh, 1, hh, P.woodD);
    for (let r = 0; r < rh; r++) { rect(sx - q2 + r, by - hh - 1 - r, hw + 2 * q2 - 2 * r, 1, (r & 1) ? roof : mixU("#c0583a", "#7a3552", m)); }
    rect(sx - q2, by - hh, hw + 2 * q2, 1, P.woodD);
    const ch = sx + hw - 3 * q2; rect(ch, by - hh - rh - q2, q2 + 1, q2 + rh - 1, P.stoneD); rect(ch - 1, by - hh - rh - q2, q2 + 3, 1, P.stone);
    for (let k = 0; k < 4; k++) { const sy = by - hh - rh - q2 - 2 - k * 3 - Math.floor((t * 4 + hs.x) % 3), sxx = ch + Math.round(Math.sin(t * 1.5 + k + hs.x) * (1 + k * .7)); set(sxx, sy, P.smoke); if (k < 3) set(sxx + 1, sy, P.smoke); }
    [[1, 1], [hw - 1 - 2 * q2 - 1, 1]].forEach(([wx, wy]) => { const wxp = sx + wx + (wx === 1 ? q2 - 1 : 0), wyp = by - hh + q2 + wy; rect(wxp - 1, wyp - 1, 2 * q2 + 2, 2 * q2 + 2, P.wood); rect(wxp, wyp, 2 * q2, 2 * q2, lit); rect(wxp + q2 - 1, wyp, 1, 2 * q2, P.wood); rect(wxp, wyp + q2 - 1, 2 * q2, 1, P.wood); });
    const dx2 = sx + Math.round(hw / 2) - q2; rect(dx2 - 1, by - 4 * q2 - 1, 2 * q2 + 2, 4 * q2 + 1, P.wood); rect(dx2, by - 4 * q2, 2 * q2, 4 * q2, P.door); set(dx2 + 2 * q2 - 2, by - 2 * q2, hexU("#ffd166"));
    if (hs.v !== 1) { const fl = sx - 3 * q2, fr2 = sx + hw + 3 * q2; for (let fx = fl; fx <= fr2; fx += 3) { if (fx > sx - 2 && fx < sx + hw + 1) continue; rect(fx, by - q2 - 1, 1, q2 + 1, P.wood); set(fx, by - q2 - 2, P.wood); }
      rect(fl, by - q2 + 1, 3 * q2 - 1, 1, P.wood); rect(sx + hw + 1, by - q2 + 1, 3 * q2 - 1, 1, P.wood); }
    [[sx + 2, "#ff7aa8"], [sx + 4, "#ffd166"], [sx + hw - 3, "#b794ff"]].forEach(([fx, fc]) => { set(fx, by - 1, mixU("#4f9468", "#1e1840", m)); set(fx, by - 2, mixU(fc, "#2a2358", m * .6)); }); });
  SC.trees.forEach(tr => { const sx = (((tr.x - nr.o) % W) + W) % W, top = nr.tops[sx];
    for (let rr = 0; rr < tr.h; rr++) { const hw = Math.floor(rr / 2); for (let dx = -hw; dx <= hw; dx++) set(sx + dx, top - tr.h + rr, dx === -hw && rr > 1 ? P.treeL : P.tree); } set(sx, top, P.trunk); set(sx, top + 1, P.trunk); });
  // ground
  const o3 = Math.floor(t * 6);
  for (let x = 0; x < W; x++) { const wx = x + o3; if (hash(wx, 7) % 7 === 0) { set(x, GT - 1, P.g1); if (hash(wx, 9) % 3 === 0) set(x, GT - 2, P.g1); } }
  const bricks = [P.b0, P.b1, P.b2];
  for (let y = GT; y < H; y++) { const row = y - GT;
    for (let x = 0; x < W; x++) { const wx = x + o3; let c;
      if (row === 0) c = P.g0; else if (row === 1) c = P.g1;
      else if (row < 4) { const r = hash(wx, row) % 10; c = r < 1 ? P.g2 : r < 2 ? P.g4 : P.g3; }
      else { const br = Math.floor((row - 4) / 5), iy = (row - 4) % 5, ox = (br & 1) * 5, bx = Math.floor((wx + ox) / 10), ix = (wx + ox) % 10; c = (iy === 4 || ix === 9) ? P.bd : iy === 0 ? P.bl : bricks[hash(bx, br) % 3]; }
      u[y * W + x] = c; } }
  // rain
  const rain = clamp01((m - .4) / .6);
  if (rain > 0) { const rc = hexU("#9fb4e8"); for (let k = 0, n = Math.round(W * rain / 2.2); k < n; k++) { const x = (hash(k, 1) % W + Math.floor(t * 18) * 1) % W, y = (hash(k, 2) % GT + Math.floor(t * 70 * (.7 + (k % 3) * .2))) % GT; set(x, y, rc); set(x - 1, y + 1, rc); } }
  // curse tint
  const tint = (x0, x1, hex, amt) => { const [tr, tg, tb] = rgbOf(hex), ai = Math.round(amt * 256), xa = Math.max(0, Math.floor(x0)), xb = Math.min(W, Math.floor(x1));
    for (let y = 0; y < H; y++) { const row = y * W; for (let x = xa; x < xb; x++) { const p = u[row + x], r = p & 255, g = (p >>> 8) & 255, b = (p >>> 16) & 255;
      u[row + x] = ((255 << 24) | ((b + (((tb - b) * ai) >> 8)) << 16) | ((g + (((tg - g) * ai) >> 8)) << 8) | (r + (((tr - r) * ai) >> 8))) >>> 0; } } };
  const front = si < 3 ? -1 : si === 3 ? W * clamp01((lt - .5) / 5) : W + 8;
  if (front > 0) { const base = si === 5 ? .5 - .18 * clamp01(lt / 5) : .5; tint(0, front, "#4a1a78", base); if (si === 3 && front < W) tint(front - 7, front, "#5cff9a", .55); }
  // lightning
  let fa = 0; const ks = STRIKES[si] || [];
  ks.forEach((ts, j) => { const d = lt - ts; if (d >= 0 && d < .35) { fa = Math.max(fa, 1 - d / .35); let bx = Math.round(W * (.25 + .22 * j + (si % 3) * .1)); const wc = hexU("#ffffff");
    if (d < .2) for (let y = 0; y < GT; y++) { bx += (hash(y, j + si) % 3) - 1; set(bx, y, wc); set(bx + 1, y, wc); } } });
  if (fa > 0) tint(0, W, "#e8efff", fa * .5);
  // sprites
  const hero = SKIN_ART.hero, hh = hero.px.length, hw0 = hero.px[0].length, ground = GT + 3, vs = .6, vh = Math.round(hh * vs), vw = Math.round(hw0 * vs);
  if (si <= 1) {
    const fr = Math.floor(t * 6);
    VILLAGERS.forEach((pal, i) => { const x = (((W * (.12 + i * .22) + t * (3 + i)) % (W + 30)) + W + 30) % (W + 30) - 15, bob = ((fr + i) & 1) ? 0 : -1; blit(hero, x - vw / 2, ground - vh + bob, vs, { pal }); });
    for (let i = 0; i < 3; i++) { const bx = (((W * (.2 + .25 * i) + t * 6) % (W + 20)) + W + 20) % (W + 20) - 10, by = GT * (.18 + .06 * i) + Math.sin(t * 2 + i) * 2, w = (Math.floor(t * 5 + i) & 1), c = hexU("#27334f");
      set(bx, by + (w ? 0 : 1), c); set(bx + 1, by + 1, c); set(bx + 2, by + (w ? 1 : 0), c); set(bx + 3, by + 1, c); set(bx + 4, by + (w ? 0 : 1), c); }
  }
  const py = SPRITES.pythona, py2 = SPRITES.pythona2, pw = py.px[0].length, ph = py.px.length, ps = Math.max(2, Math.min(4, Math.floor(W * .6 / pw), Math.floor(H * .5 / ph))), RED = "#ff3b5c", redKeys = d => Object.keys(d.pal).filter(k => d.pal[k] === RED).join("");
  const eyesOf = d => { const k = redKeys(d), o = []; d.px.forEach((r, ry) => { for (let rx = 0; rx < r.length; rx++) if (k.includes(r[rx])) o.push([rx, ry]); }); return o; };
  if (!SC.eyes) { SC.eyes = eyesOf(py); SC.eyes2 = eyesOf(py2); }
  const eyeGlow = (px0, py0, a, list) => { const pulse = .8 + .2 * Math.sin(t * 4); (list || SC.eyes).forEach(([ex, ey]) => glow(px0 + ex * ps + ps / 2, py0 + ey * ps + ps / 2, 4, hexU("#ff3b5c"), a * pulse)); };
  if (si === 2) { const a = clamp01((lt - 1) / 2.5) * .85, px0 = Math.round(W / 2 - pw * ps / 2), py0 = Math.round(H * .14); blit(py, px0, py0, ps, { a, dark:.8, keep:redKeys(py) }); eyeGlow(px0, py0, a); }
  if (si === 3) {
    const mons = [[.22, "slime", 2, 0], [.46, "ghost", 2, 1], [.64, "bat", 2, 2], [.84, "slime", 2, 3]];
    mons.forEach(([f, name, s, i]) => { const mx = W * f, d = front - mx; if (d < 0) return; const a = clamp01(d / 14), def = SPRITES[name], h = def.px.length, w = def.px[0].length;
      let y = ground - h * s + Math.round(Math.sin(t * 3 + i) * (name === "slime" ? -2 : 2)); if (name === "ghost") y -= 8 + Math.round(Math.sin(t * 2) * 3); if (name === "bat") y = GT * .5 + Math.sin(t * 2.5) * 6;
      blit(def, mx - w * s / 2, y, s, { a, flip:i % 2 === 1 }); });
  }
  if (si === 4) {
    const a = .5 * clamp01(lt / 1.5), p2w = py2.px[0].length, px0 = Math.round(W / 2 - p2w * ps / 2), py0 = Math.round(H * .12); blit(py2, px0, py0, ps, { a, dark:.85, keep:redKeys(py2) }); eyeGlow(px0, py0, a, SC.eyes2);
    [[.2, "titan", 1.2], [.5, "wraith", 3.8], [.8, "hydra", 6.4]].forEach(([f, name, at], i) => { const a2 = clamp01((lt - at) / .9); if (a2 <= 0) return; const def = SPRITES[name], h = def.px.length, w = def.px[0].length;
      blit(def, W * f - w / 2, ground - h + (Math.floor(t * 2.5 + i) & 1 ? -1 : 0) + (name === "wraith" ? -6 - Math.round(Math.sin(t * 2) * 2) : 0), 1, { a:a2 }); });
  }
  if (si === 5) {
    const hs2 = H > 150 && W > 200 ? 1.2 : .9, hx = Math.round(W * .42 - hw0 * hs2 / 2), hy = ground - Math.round(hh * hs2) + ((Math.floor(t * 2) & 1) ? -1 : 0), pul = .5 + .5 * Math.sin(t * 3);
    if (!SC.orb) { let sx = 0, sy = 0, n = 0; hero.px.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === "d") { sx += x; sy += y; n++; } }); SC.orb = n ? [sx / n, sy / n] : [hw0 - 3, 3]; }
    const ox = hx + SC.orb[0] * hs2, oy = hy + SC.orb[1] * hs2;
    glow(ox, oy, 10 + Math.round(pul * 4), hexU("#ffb3dd"), .55); glow(ox, oy, 20, hexU("#ff7ab8"), .25 * clamp01(lt / 2));
    blit(hero, hx, hy, hs2);
  }
  SC.ctx.putImageData(SC.img, 0, 0);
}

function setScene(i){
  st.i = i; st.sT = performance.now(); const sc = STORY[i]; $("#capSR").textContent = sc.text; st.typed = reduce ? sc.text.length : 0;
  $("#capText").textContent = reduce ? sc.text : "";
  $("#dots").innerHTML = STORY.map((_, j) => `<i class="${j === i ? "on" : ""}"></i>`).join("");
  $("#sNext").textContent = i === STORY.length - 1 ? "Play" : "Next";
  if (reduce) paintStory(12, i, sc.dur * .75);
}
function storyLoop(now){
  if (!st.on) return; st.raf = requestAnimationFrame(storyLoop);
  const sc = STORY[st.i], lt = (now - st.sT) / 1000, want = Math.min(sc.text.length, Math.max(0, Math.floor((lt - .4) * TYPE_CPS)));
  if (want > st.typed) { st.typed = want; $("#capText").textContent = sc.text.slice(0, want); }
  if (now - st.last >= 66) { st.last = now; paintStory((now - st.t0) / 1000, st.i, lt); }
  if (st.typed >= sc.text.length && lt >= Math.max(sc.dur, .4 + sc.text.length / TYPE_CPS + HOLD)) nextScene();
}
function nextScene(){ if (st.i >= STORY.length - 1) endStory(); else setScene(st.i + 1); }
function userNext(){ const sc = STORY[st.i]; if (st.typed < sc.text.length) { st.typed = sc.text.length; $("#capText").textContent = sc.text; } else nextScene(); }
function showStory(){
  closeSheets(); intro.hidden = true; stopIntro(); story.hidden = false; story.classList.remove("fade"); document.body.style.overflow = "hidden"; $(".app").inert = true;
  storySize(); st.on = true; st.t0 = performance.now(); st.last = 0; setScene(0); if (!reduce) st.raf = requestAnimationFrame(storyLoop); $("#sNext").focus({ preventScroll:true });
}
function endStory(){
  if (!st.on) return; st.on = false; cancelAnimationFrame(st.raf); showIntro("title"); story.classList.add("fade");
  setTimeout(() => { story.hidden = true; story.classList.remove("fade"); }, reduce ? 0 : 750);
}
$("#sNext").addEventListener("click", userNext);
$("#sSkip").addEventListener("click", endStory);
story.addEventListener("click", e => { if (!e.target.closest("button")) userNext(); });
document.addEventListener("keydown", e => {
  if (story.hidden || !st.on) return;
  if (e.key === "Escape") { endStory(); return; }
  if (e.target.closest("button")) return;
  if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") { e.preventDefault(); userNext(); }
});
addEventListener("resize", () => { if (!story.hidden && st.on) { storySize(); if (reduce) paintStory(12, st.i, STORY[st.i].dur * .75); } });
$("#replay").addEventListener("click", showStory);
$$(".bossimg").forEach(el => { el.innerHTML = spriteSVG(SPRITES[el.dataset.boss]); });
