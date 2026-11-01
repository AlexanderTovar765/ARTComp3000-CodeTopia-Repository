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
  stone:"#d8d2e8", stoneD:"#a9a2c4", roof:"#d65a7a", cloud0:"#ffffff", cloud1:"#e6f2ff", cloud2:"#cfe3f8", sun:"#fff2a8", house:"#f0e0c0", houseR:"#c0583a", door:"#6a4a32" };
const PS = { sky:["#0f0c24","#17122f","#221a3c","#2c2348","#382d55","#463a63","#554a70","#655b7d"], far:"#2a2250", farE:"#383064", near:"#1e1840", nearE:"#2a2358", tree:"#120e2b", trunk:"#0c0920",
  g0:"#4a8a58", g1:"#3a7048", g2:"#2f5e3e", g3:"#2a5238", g4:"#1f3f30", bl:"#34605f", bd:"#1a3032", b0:"#27494a", b1:"#2a4f4f", b2:"#244344",
  stone:"#6a6490", stoneD:"#4a4472", roof:"#7a3552", cloud0:"#4a3f70", cloud1:"#3a3060", cloud2:"#2a2248", sun:"#c4624a", house:"#8a7a8a", houseR:"#5a2a3a", door:"#2a1c28" };
const rgbOf = (() => { const c = {}; return h => c[h] || (c[h] = [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]); })();
const pk = (r, g, b) => ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;
function mixU(a, b, m){ const A = rgbOf(a), B = rgbOf(b); return pk(Math.round(A[0] + (B[0] - A[0]) * m), Math.round(A[1] + (B[1] - A[1]) * m), Math.round(A[2] + (B[2] - A[2]) * m)); }
function palAt(m){ const o = {}; for (const k in PD) o[k] = k === "sky" ? PD.sky.map((c, i) => mixU(c, PS.sky[i], m)) : mixU(PD[k], PS[k], m); return o; }
const clamp01 = v => Math.max(0, Math.min(1, v));
function moodAt(si, lt){ if (si === 2) return .3 + .7 * clamp01(lt / 3.5); const s = STORY[si]; return s.m[0] + (s.m[1] - s.m[0]) * clamp01(lt / s.dur); }
const VILLAGERS = [
  { t:"#e0647c", T:"#a8344c", g:"#ffd166", n:null, o:null }, { t:"#6a8dff", T:"#3a56c4", g:"#e8e8f4", n:null, o:null }, { t:"#f2a541", T:"#b36d12", g:"#7a4a2a", n:null, o:null }
];

function storySize(){
  const cell = innerWidth < 600 ? 3 : 4, W = Math.ceil(innerWidth / cell), H = Math.ceil(innerHeight / cell);
  scv.width = W; scv.height = H; SC.W = W; SC.H = H; SC.cell = cell; SC.GT = H - Math.round(H * (innerWidth < 600 ? .4 : .34));
  SC.ctx = scv.getContext("2d"); SC.img = SC.ctx.createImageData(W, H); SC.u = new Uint32Array(SC.img.data.buffer);
  let seed = 11; const rand = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  SC.houses = [.06, .22, .38, .54, .92].map(f => ({ x:Math.round(f * W) }));
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
  ridge(GT * .3, GT * .1, 1.3, t * 1.2, P.far, P.farE);
  // castle on its own mound
  const q = Math.max(2, Math.round(GT / 38)), cx = Math.round(W * .72), baseY = GT - Math.round(GT * .2);
  for (let dx = -10 * q; dx <= 10 * q; dx++) { const top = baseY + Math.round(3 * q * Math.pow(dx / (10 * q), 2)); for (let y = top; y < GT; y++) set(cx + dx, y, P.far); set(cx + dx, top, P.farE); }
  const cursedAmt = si < 3 ? 0 : si === 3 ? clamp01((lt - 1.5) / 4) : 1;
  const winC = cursedAmt > 0 ? (Math.floor(t * 6 + 3) % 5 === 0 ? mixU("#1a1030", "#5cff9a", .4) : mixU("#ffe08a", "#5cff9a", cursedAmt)) : hexU("#ffe08a");
  const kw = 12 * q, kh = 11 * q;
  rect(cx - kw / 2, baseY - kh, kw, kh, P.stone);
  for (let i = 0; i < 6; i += 2) rect(cx - kw / 2 + i * 2 * q, baseY - kh - q, 2 * q, q, P.stone);
  rect(cx - q, baseY - 4 * q, 2 * q, 4 * q, hexU("#1a1030")); rect(cx - 3 * q, baseY - 8 * q, q, 2 * q, winC); rect(cx + 2 * q, baseY - 8 * q, q, 2 * q, winC);
  [-1, 1].forEach(sg => { const tx = Math.round(cx + sg * (kw / 2 + q) - 3 * q), tw = 6 * q, th = 17 * q;
    rect(tx, baseY - th, tw, th, P.stoneD); rect(tx + 2 * q, baseY - th + 4 * q, q, 2 * q, winC);
    for (let r = 0; r < 4 * q; r++) rect(tx - q + Math.floor(r * .75), baseY - th - 1 - r, tw + 2 * q - Math.floor(r * 1.5), 1, P.roof);
    if (sg > 0) { const px = tx + 3 * q, py = baseY - th - 4 * q - 1; rect(px, py - 3 * q, 1, 3 * q + 4 * q, P.stoneD); const fl = Math.round(Math.sin(t * 5) * 1.2); rect(px + 1, py - 3 * q, 3 * q, 2 * q, cursedAmt > .5 ? hexU("#7a2fb0") : hexU("#ff5a7a")); set(px + 3 * q + 1, py - 3 * q + fl + q, cursedAmt > .5 ? hexU("#7a2fb0") : hexU("#ff5a7a")); } });
  // near hills, houses and trees
  const nr = ridge(GT * .16, GT * .07, 4.1, t * 3, P.near, P.nearE);
  const lit = cursedAmt > 0 ? winC : hexU("#ffe08a");
  SC.houses.forEach(hs => { const sx = (((hs.x - nr.o) % W) + W) % W, by = nr.tops[sx] + 2, hw = 9, hh = 6;
    rect(sx, by - hh, hw, hh, P.house); for (let r = 0; r < 4; r++) rect(sx - 1 + r, by - hh - 1 - r, hw + 2 - 2 * r, 1, P.houseR);
    rect(sx + 1, by - hh + 1, 2, 2, lit); rect(sx + 5, by - hh + 1, 2, 2, lit); rect(sx + 4, by - 3, 2, 3, P.door); rect(sx + hw - 2, by - hh - 4, 1, 3, P.stoneD); });
  SC.trees.forEach(tr => { const sx = (((tr.x - nr.o) % W) + W) % W, top = nr.tops[sx];
    for (let rr = 0; rr < tr.h; rr++) { const hw = Math.floor(rr / 2); for (let dx = -hw; dx <= hw; dx++) set(sx + dx, top - tr.h + rr, P.tree); } set(sx, top, P.trunk); set(sx, top + 1, P.trunk); });
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
  const hero = SPRITES.hero, ground = GT + 3;
  if (si <= 1) {
    const fr = Math.floor(t * 6);
    VILLAGERS.forEach((pal, i) => { const x = (((W * (.12 + i * .22) + t * (3 + i)) % (W + 30)) + W + 30) % (W + 30) - 15, bob = ((fr + i) & 1) ? 0 : -1; blit(hero, x, ground - 16 + bob, 1, { pal }); });
    for (let i = 0; i < 3; i++) { const bx = (((W * (.2 + .25 * i) + t * 6) % (W + 20)) + W + 20) % (W + 20) - 10, by = GT * (.18 + .06 * i) + Math.sin(t * 2 + i) * 2, w = (Math.floor(t * 5 + i) & 1), c = hexU("#27334f");
      set(bx, by + (w ? 0 : 1), c); set(bx + 1, by + 1, c); set(bx + 2, by + (w ? 1 : 0), c); set(bx + 3, by + 1, c); set(bx + 4, by + (w ? 0 : 1), c); }
  }
  const ps = Math.max(2, Math.min(4, Math.floor(W * .6 / 20))), py = SPRITES.pythona;
  if (!SC.eyes) { SC.eyes = []; py.px.forEach((r, ry) => { for (let rx = 0; rx < r.length; rx++) if (r[rx] === "e") SC.eyes.push([rx, ry]); }); }
  const eyeGlow = (px0, py0, a) => { const pulse = .8 + .2 * Math.sin(t * 4); SC.eyes.forEach(([ex, ey]) => glow(px0 + ex * ps + ps / 2, py0 + ey * ps + ps / 2, 4, hexU("#ff3b5c"), a * pulse)); };
  if (si === 2) { const a = clamp01((lt - 1) / 2.5) * .85, px0 = Math.round(W / 2 - 10 * ps), py0 = Math.round(H * .08); blit(py, px0, py0, ps, { a, dark:.8, keep:"e" }); eyeGlow(px0, py0, a); }
  if (si === 3) {
    const mons = [[.22, "slime", 2, 0], [.46, "ghost", 2, 1], [.64, "bat", 2, 2], [.84, "slime", 2, 3]];
    mons.forEach(([f, name, s, i]) => { const mx = W * f, d = front - mx; if (d < 0) return; const a = clamp01(d / 14), def = SPRITES[name], h = def.px.length, w = def.px[0].length;
      let y = ground - h * s + Math.round(Math.sin(t * 3 + i) * (name === "slime" ? -2 : 2)); if (name === "ghost") y -= 8 + Math.round(Math.sin(t * 2) * 3); if (name === "bat") y = GT * .5 + Math.sin(t * 2.5) * 6;
      blit(def, mx - w * s / 2, y, s, { a, flip:i % 2 === 1 }); });
  }
  if (si === 4) {
    const a = .5 * clamp01(lt / 1.5), px0 = Math.round(W / 2 - 10 * ps), py0 = Math.round(H * .06); blit(py, px0, py0, ps, { a, dark:.85, keep:"e" }); eyeGlow(px0, py0, a);
    [[.2, "titan", 1.2], [.5, "wraith", 3.8], [.8, "hydra", 6.4]].forEach(([f, name, at], i) => { const a2 = clamp01((lt - at) / .9); if (a2 <= 0) return; const def = SPRITES[name], h = def.px.length, w = def.px[0].length;
      blit(def, W * f - w, ground - h * 2 + (Math.floor(t * 2.5 + i) & 1 ? -1 : 0) + (name === "wraith" ? -6 - Math.round(Math.sin(t * 2) * 2) : 0), 2, { a:a2 }); });
  }
  if (si === 5) {
    const hx = Math.round(W * .42 - 14), hy = ground - 32 + ((Math.floor(t * 2) & 1) ? -1 : 0), pul = .5 + .5 * Math.sin(t * 3);
    glow(hx + 26, hy + 14, 10 + Math.round(pul * 4), hexU("#ffb3dd"), .55); glow(hx + 26, hy + 14, 20, hexU("#ff7ab8"), .25 * clamp01(lt / 2));
    blit(hero, hx, hy, 2);
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
