/* The five village scenes: the square and one district per language. Each is painted once into a small canvas (one pixel = one art pixel),
   with props, walls, exits, doors and people listed beside it. The look follows how many guardians you have beaten (st, 0 to 4). */

"use strict";

let VCW = 320, VCH = 200;
const VSKYY = (st, c, hz, moonX) => {
  const sky = VSKY[st], rnd = vrng(7 + st);
  [[0, .3], [.3, .58], [.58, .82], [.82, 1.05]].forEach(([a, b], i) => { vR(c, 0, Math.round(a * hz), VCW, Math.round((b - a) * hz) + 1, sky[i]);
    if (i) { const y0 = Math.round(a * hz); for (let x = 0; x < VCW; x += 2) { vR(c, x + (x / 2 % 2), y0 - 2, 1, 1, sky[i]); vR(c, x + ((x / 2 + 1) % 2), y0 - 1, 1, 1, sky[i]); vR(c, x + (x / 2 % 2), y0 - 3, 1, 1, sky[i - 1]); } } });
  const stars = Math.round(60 * (1 - st / 4) ** 1.2); for (let i = 0; i < stars; i++) { const sx = Math.floor(rnd() * VCW), sy = Math.floor(rnd() * hz * .7); vR(c, sx, sy, 1, 1, rnd() < .2 ? "#ffffff" : "#b9b2ff"); }
  if (st < 3) { const my = 22 - st * 3; for (let j = -8; j <= 8; j++) { const w = Math.round(Math.sqrt(64 - j * j)); vR(c, moonX - w, my + j, w * 2, 1, "#e8e4ff"); }
    for (let j = -8; j <= 8; j++) { const w = Math.round(Math.sqrt(64 - j * j)), w2 = Math.round(Math.sqrt(49 - (j + 1) ** 2)); vR(c, moonX - w + 4, my + j, Math.max(0, w - 4 + w2 - 4), 1, sky[0]); } }
  else { const sx = moonX - 60, sy = st === 4 ? hz - 34 : hz - 10, rr = st === 4 ? 10 : 8; for (let r = rr + 10; r > rr; r -= 3) { c.globalAlpha = .1; for (let j = -r; j <= r; j++) { const w = Math.round(Math.sqrt(r * r - j * j)); vR(c, sx - w, sy + j, w * 2, 1, "#fff0a8"); } } c.globalAlpha = 1;
    for (let j = -rr; j <= rr; j++) { const w = Math.round(Math.sqrt(rr * rr - j * j)); vR(c, sx - w, sy + j, w * 2, 1, st === 4 ? "#fff5b0" : "#ffe0a0"); } }
};
function vMount(c, st, base, amp, col, seed, ph = 0) { for (let x = 0; x < VCW; x++) { const h = amp * (.55 + .3 * Math.sin(x * .021 + seed + ph) + .2 * Math.sin(x * .057 + seed * 2) + .08 * Math.sin(x * .13)); vR(c, x, base - h, 1, h + 2, col); if (x % 3 === 0) vR(c, x, base - h, 1, 1, vmix(col, "#ffffff", .22)); } }
function vTreeLine(c, st, base, rnd, col1, col2, hmin, hmax, step) { for (let x = -4; x < VCW + 6; x += step + Math.floor(rnd() * step * .6)) vPine(c, x, base + Math.floor(rnd() * 4), hmin + Math.floor(rnd() * (hmax - hmin)), rnd() < .5 ? col1 : col2, vmix(col1, "#000000", .25)); }

const vHash = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
/* cobble rows get taller toward the viewer; past y 360 they keep that last size so long south roads stay cobbled */
const VROWS = (() => { const r = [98]; let h = 4; while (r[r.length - 1] < 480) { r.push(r[r.length - 1] + Math.round(h)); if (r[r.length - 1] < 360) h += .38; } return r; })();
const VRCAP = VROWS.findIndex(y => y >= 360);
function vGroundPaint(c, inFn, mats) {
  const img = c.createImageData(VCW, VCH), d = img.data, put = (i, hex) => { const v = vhex(hex); d[i] = v[0]; d[i + 1] = v[1]; d[i + 2] = v[2]; d[i + 3] = 255; };
  for (let y = 0; y < VCH; y++) { let r = 0; while (VROWS[r + 1] <= y && r < VROWS.length - 2) r++;
    for (let x = 0; x < VCW; x++) { const m = y < 90 ? null : inFn(x, y); if (!m) continue; const i = (y * VCW + x) * 4, M = mats[m];
      if (m === "c") { const sw = 7 + Math.min(r, VRCAP) * .55, off = (r % 2) * sw / 2, col = Math.floor((x + off) / sw), edge = y === VROWS[r] || Math.floor(x + off) % Math.round(sw) === 0, tone = vHash(r, col);
        let hex = edge ? M.mortar : tone < .2 ? M.light : tone > .86 ? M.dark : vmix(M.base, M.light, tone * .35);
        if (!edge) { if (y === VROWS[r] + 1) hex = vmix(hex, "#c8c0f4", .16); const n = vHash(x, y + 977); if (n > .968) hex = vmix(hex, "#c8c0f4", .22); else if (n < .03) hex = vmix(hex, "#120c30", .28); }
        const near = inFn(x - 1, y) !== "c" || inFn(x + 1, y) !== "c" || inFn(x, y - 1) !== "c" || inFn(x, y + 1) !== "c" ? 1 : inFn(x - 2, y) !== "c" || inFn(x + 2, y) !== "c" || inFn(x, y + 2) !== "c" ? 2 : 0;
        if (near === 1) hex = vmix(hex, "#07051a", .5); else if (near === 2) hex = vmix(hex, "#07051a", .2);
        put(i, hex); }
      else if (m === "g") { const n = vHash(x, y), patch = vHash(x >> 3, y >> 3) * .5 - .1; put(i, n < .1 ? M.dark : n > .93 ? vmix(M.light, "#9fe8a8", .25) : vmix(M.base, patch > 0 ? M.light : M.dark, Math.abs(patch))); }
      else if (m === "d") { const n = vHash(x * 3, y), rut = (Math.abs(((x + (y >> 3) * 3) % 18) - 9) < 1) && vHash(x >> 2, y >> 2) > .5, peb = vHash(x, y * 7) > .985; put(i, peb ? vmix(M.light, "#d0c8b8", .5) : rut ? vmix(M.dark, "#000000", .25) : n < .12 ? M.dark : n > .94 ? M.light : vmix(M.base, M.light, vHash(x >> 3, y >> 3) * .25)); }
      else if (m === "p") { const sw = 14 + r, off = (r % 2) * sw / 2, edge = y === VROWS[r] || Math.floor(x + off) % Math.round(sw) === 0, tn = vHash(r, Math.floor((x + off) / sw)); let hex = edge ? M.mortar : vmix((r + Math.floor((x + off) / sw)) % 2 ? M.base : M.light, tn > .5 ? M.light : M.base, tn * .35); if (!edge && y === VROWS[r] + 1) hex = vmix(hex, "#ffffff", .14); if (!edge && vHash(x, y + 311) > .97) hex = vmix(hex, "#ffffff", .15); else if (!edge && vHash(x, y + 311) < .03) hex = vmix(hex, "#000000", .2); put(i, hex); }
      else if (m === "t") { const rr = y % 6, edge = rr === 0 || (x + (Math.floor(y / 6) % 2) * 5) % 10 === 0; let hex = edge ? M.mortar : vHash(x >> 3, y >> 2) < .3 ? M.light : M.base; if (!edge && rr === 1) hex = vmix(hex, "#ffffff", .12); else if (!edge && vHash(x, y + 5) > .975) hex = vmix(hex, "#ffffff", .15); put(i, hex); }
      else if (m === "r") { const b2 = inFn(x - 2, y) !== "r" || inFn(x + 2, y) !== "r"; put(i, b2 ? vmix("#e8c060", "#c8a040", vHash(x, y) * .6) : (x + y) % 9 === 0 ? M.light : (x - y) % 9 === 0 ? vmix(M.base, M.light, .5) : M.base); }
      else if (m === "s") put(i, y % 4 < 2 ? M.base : M.light); } }
  const tmp = vCanvas(VCW, VCH); tmp.c.putImageData(img, 0, 0); c.drawImage(tmp.cv, 0, 0);
}
const vMatSet = k => ({
  c:{ base:vmix("#4a3f78", "#c4a984", k), light:vmix("#5a4f90", "#dcc4a0", k), dark:vmix("#3a3066", "#a88e6a", k), mortar:vmix("#322a5c", "#9a8260", k) },
  g:{ base:vmix("#1a2c4a", "#6fc060", k), light:vmix("#243c5a", "#86d478", k), dark:vmix("#142238", "#559a4c", k) },
  d:{ base:vmix("#3a2a3a", "#a08058", k), light:vmix("#4a3848", "#b89a70", k), dark:vmix("#2c2030", "#86683f", k) },
  p:{ base:vmix("#3c3a5e", "#a8a4b4", k), light:vmix("#48466c", "#bdb9c8", k), mortar:vmix("#2a2848", "#8a869a", k) },
  t:{ base:vmix("#28344e", "#5a7488", k), light:vmix("#34445e", "#6c88a0", k), mortar:vmix("#1a2238", "#445a6c", k) },
  r:{ base:"#b02a45", light:"#c43a58" }, s:{ base:vmix("#4a4468", "#b0aabe", k), light:vmix("#5a547a", "#c8c2d4", k) }
});

const vBake = (w, h, ax, ay, fn) => { const o = vCanvas(w, h); fn(o.c); return { cv:o.cv, ax, ay }; };
const vBld = (fn, S) => vBake(150, 140, 75, 134, c => fn(c, 75, 134, S));
const vP = (cv, ax, ay) => ({ cv, ax, ay });
function vPropTree(st, k, x, y, r) { const k2 = vmix("#25584f", "#4fb05c", k), k3 = vmix("#143a3c", "#2c7a3a", k); return { ...vBake(r * 2 + 10, r * 2 + 14, r + 5, r * 2 + 10, c => vRoundTree(c, r + 5, r * 2 + 10, r, k2, k3)), x, y, obs:[x - 3, y - 3, x + 3, y + 1] }; }
function vPropPine(k, x, y, h, dark) { const a = vmix(dark ? "#0f2a34" : "#14344a", dark ? "#2a7a46" : "#2f8a4c", k), b = vmix("#0c2236", "#216a3a", k); return { ...vBake(h * .9 + 8, h + 12, h * .45 + 4, h + 8, c => vPine(c, h * .45 + 4, h + 8, h, a, b)), x, y, obs:[x - 3, y - 3, x + 3, y + 1] }; }
const vPropLamp = (S, x, y) => ({ ...vBake(20, 44, 10, 42, c => vLamp(c, 8, 42, S)), x, y, halo:{ x, y:y - 34 } });
const vPropBush = (k, x, y, w = 14) => ({ ...vBake(w + 4, 12, (w + 4) / 2, 10, c => vBush(c, (w + 4) / 2, 10, vmix("#1c3a40", "#3f9a4c", k), vmix("#12282e", "#2c7a3a", k), w)), x, y });
const vPropBench = (x, y) => ({ ...vBake(22, 16, 11, 15, c => vBench(c, 2, 15)), x, y });
const vPropBarrel = (x, y) => ({ ...vBake(14, 14, 7, 13, c => vBarrel(c, 2, 13)), x, y, obs:[x - 5, y - 3, x + 5, y + 1] });
const vPropCrate = (x, y, w = 10) => ({ ...vBake(w + 4, w + 4, (w + 4) / 2, w + 2, c => vCrate(c, 2, w + 2, w)), x, y, obs:[x - w / 2, y - 3, x + w / 2, y + 1] });
const vPropPost = (x, y, text) => ({ ...vBake(44, 48, 22, 46, c => { vR(c, 21, 20, 3, 26, "#5a3a22"); vR(c, 21, 20, 1, 26, "#7a5230"); vSign(c, 22, 6, text, "#ffe9a8", "#5a2a10"); }), x, y });
function vPropFlag(x, y, col) { return { x, y, flag:col, ...vBake(4, 20, 2, 19, c => vR(c, 1, 5, 1, 14, "#3d2713")) }; }
const vPropBarrier = (x, y, w, tag) => ({ ...vBake(w + 12, 40, (w + 12) / 2, 38, c => {
  for (const dx of [2, w + 6]) { vR(c, dx, 10, 4, 28, "#4a2f1a"); vR(c, dx, 10, 1, 28, "#6a4528"); vR(c, dx - 1, 8, 6, 3, "#2e2e44"); }
  for (let i = 0; i < w - 4; i += 3) { vR(c, 8 + i, 22 + Math.round(Math.sin(i * .5) * 1.5), 2, 2, "#8a8aa2"); vR(c, 8 + i, 29 - Math.round(Math.sin(i * .5) * 1.5), 2, 2, "#7a7a92"); }
  const m = (w + 12) >> 1; vR(c, m - 4, 16, 8, 8, "#ffd23f"); vR(c, m - 3, 13, 6, 3, "#c99a10"); vR(c, m - 3, 14, 1, 3, "#c99a10"); vR(c, m + 2, 14, 1, 3, "#c99a10"); vR(c, m - 1, 19, 2, 2, "#6a4a10");
  vSign(c, m, 0, tag, "#ffe9a8", "#5a2a10"); }), x, y });
const vPropBarrierV = (x, y, len, tag) => ({ ...vBake(30, len + 24, 15, len + 14, c => {
  for (const dy of [4, len + 4]) { vR(c, 12, dy, 5, 12, "#4a2f1a"); vR(c, 12, dy, 1, 12, "#6a4528"); vR(c, 11, dy - 2, 7, 3, "#2e2e44"); }
  for (let j = 16; j < len + 4; j += 3) { vR(c, 14 + Math.round(Math.sin(j * .5) * 1.5), j, 2, 2, "#8a8aa2"); }
  const m = len >> 1; vR(c, 11, m - 2, 8, 8, "#ffd23f"); vR(c, 12, m - 5, 6, 3, "#c99a10"); vSign(c, 15, m + 8, tag, "#ffe9a8", "#5a2a10"); }), x, y });

function vPropFountain(S) { return vBake(80, 56, 40, 52, c => vFountain(c, 40, 52, S)); }
function vShopWithKeeper(S) {
  const A = vBld(bSHOP, S), B = vBake(150, 140, 75, 134, c => { c.drawImage(A.cv, 0, 0); const sp = vSprite(SPRITES.shopkeeper); c.drawImage(sp.cv, 75 - (sp.w >> 1), 134 - 2 - sp.h); c.drawImage(A.cv, 75 - 44, 134 - 16, 88, 16, 75 - 44, 134 - 16, 88, 16); });
  return B;
}

/* ---------- scenes ---------- */
function vBuildScene(id, S) {
  const st = id === "css" ? 4 : id === "manor" ? 0 : S.st, k = st / 4, P = [], obs = [], exits = [], doors = [], npcs = [], halos = [], flags = [], smoke = [], clicks = [], M = vMatSet(k), bs = { st, open:true };
  VCW = id === "sq" ? 640 : 320; VCH = id === "sq" ? 420 : 200;
  const bg = vCanvas(VCW, VCH), c = bg.c, rnd = vrng(id.length * 31 + 5), o = { id, w:VCW, h:VCH, walk:{ x0:8, x1:VCW - 8, y0:108, y1:VCH - 2 }, props:P, obs, exits, doors, npcs, halos, flags, smoke, clicks, st, cloudY:[8, 50] };
  const add = (p, x, y) => { p.x = x; p.y = y; P.push(p); if (p.obs) obs.push(p.obs); if (p.halo) halos.push(p.halo); if (p.flag) flags.push({ x:x, y:y - 19, c:p.flag }); return p; };
  const giverNpc = gid => { const g = GIVERS[gid]; return { id:"g_" + gid, giver:gid, def:SPRITES[g.sprite], name:g.name, role:g.role, x:g.x, y:g.y }; };
  const mentor = t => { const m = MENTORS[t]; return { id:t, def:SPRITES[m.sprite], name:m.name, role:m.role, track:t }; };
  const lampsAt = L => L.forEach(([x, y]) => add(vPropLamp(bs, x, y), x, y));
  const treeCol = vmix("#14344a", "#2f8a4c", k), treeCol2 = vmix("#0c2236", "#216a3a", k);

  if (id === "sq") {
    o.name = "Village Square"; o.spawn = [320, 262]; o.cloudY = [6, 46];
    VSKYY(st, c, 96, 500); vMount(c, st, 94, 40, vmix("#1a1240", "#6f8ec0", k), 1); vMount(c, st, 96, 22, vmix("#241a52", "#8fb0d6", k), 3, 2);
    vTreeLine(c, st, 100, rnd, vmix("#120d33", "#3f7a52", k), vmix("#1c1448", "#5ea36a", k), 22, 40, 12);
    vGroundPaint(c, (x, y) => {
      if (y >= 98 && y <= 126 && x >= 4 && x <= VCW - 4) return "c";
      if (((x - 320) / 255) ** 2 + ((y - 228) / 122) ** 2 <= 1) return "c";
      if (((x < 90 || x > VCW - 90) && y >= 220 && y <= 280) || (x >= 266 && x <= 374 && y >= 290) || (x >= 124 && x <= 176 && y >= 300) || (x >= 464 && x <= 516 && y >= 300) || (x >= 412 && x <= 490 && y >= 98 && y <= 135) || (x >= 100 && x <= 150 && y >= 290 && y <= 392) || (x <= 150 && y >= 346 && y <= 392)) return "c";
      return y >= 96 ? "g" : null; }, M);
    for (let y = 98; y < 118; y += 4) for (let x = 414; x < 488; x++) vR(c, x, y, 1, 2, y % 8 ? vmix("#7a7690", "#d8d0e0", k) : vmix("#4a4668", "#a09aae", k));
    for (let a2 = 0; a2 < 40; a2++) { const an = a2 / 40 * Math.PI * 2; vR(c, 320 + Math.round(Math.cos(an) * 46), 215 + Math.round(Math.sin(an) * 20), 2, 1, vmix("#322a5c", "#9a8260", k)); }
    const fo = !!V.forgeOpen;
    add(vBld(bLIB, bs), 110, 100); add(vBake(150, 140, 75, 134, cc => bFORGE(cc, 75, 134, { st, open:fo })), 230, 100); add(vShopWithKeeper(bs), 350, 100); add(vBld(bTOWER, bs), 540, 100);
    add(vBake(60, 104, 30, 100, cc => vFarTower(cc, 30, 100, k)), 451, 98);   /* a prop, not part of the ground, so the clouds drift behind it */
    doors.push({ id:"lib", x:110, y:113 }, { id:"forge", x:232, y:113 }, { id:"shop", x:350, y:113 }, { id:"tower", x:540, y:113 });
    clicks.push({ id:"lib", r:[60, 40, 160, 104] }, { id:"forge", r:[185, 30, 278, 104] }, { id:"shop", r:[308, 40, 392, 104] }, { id:"tower", r:[517, 0, 563, 104] });
    smoke.push({ x:549, y:12 }); smoke.push({ x:194, y:8 });
    if (fo) o.fires = [{ x:210, y:90 }];
    add(Object.assign(vBake(22, 20, 11, 19, cc => vAnvil(cc)), { obs:[174, 108, 190, 112] }), 182, 112);
    { const sk = skLit(); add(vSkillTree(bs, sk), 320, 214); o.skTree = { lit:sk, pts:skLightPts().map(([x, y]) => [320 - SK_BX + x, 214 - SK_BY + y]) }; } obs.push([304, 200, 336, 214]); doors.push({ id:"skills", x:320, y:216 }); clicks.push({ id:"skills", r:[276, 126, 364, 216] });
    lampsAt([[80, 124], [174, 124], [290, 124], [410, 124], [496, 124], [580, 124], [230, 186], [410, 186], [190, 270], [450, 270], [256, 372], [384, 372], [454, 372], [526, 372], [114, 372], [186, 372]]);
    [[262, 196], [378, 196], [230, 238], [410, 238], [320, 262], [300, 330], [340, 330]].forEach(([x, y]) => add(vPropBench(x, y), x, y));
    add(vPropBarrel(290, 106), 290, 106); add(vPropCrate(302, 105, 9), 302, 105); add(vPropBarrel(168, 106), 168, 106); add(vPropBarrel(400, 106), 400, 106);
    [[156, 214], [486, 214]].forEach(([x, y]) => add(Object.assign(vBake(48, 44, 24, 42, cc => { vR(cc, 3, 14, 3, 28, "#5a3a22"); vR(cc, 42, 14, 3, 28, "#5a3a22"); for (let i = 0; i < 48; i += 6) { vR(cc, i, 6, 6, 10, (i / 6) % 2 ? "#f4f1e6" : "#3b8fd8"); vR(cc, i, 14, 6, 3, (i / 6) % 2 ? "#d8d3c2" : "#2a6aa8"); } vR(cc, 4, 30, 40, 12, "#8a5a36"); vR(cc, 4, 30, 40, 2, "#b27a4a"); vR(cc, 10, 24, 6, 6, "#ff6b81"); vR(cc, 20, 25, 6, 5, "#ffd23f"); vR(cc, 31, 24, 6, 6, "#b9e769"); }), { obs:[x - 22, y - 12, x + 22, y + 1] }), x, y));
    [[34, 416, 11], [76, 414, 12], [214, 418, 12], [420, 418, 12], [566, 416, 12], [610, 414, 11], [30, 330, 10], [610, 330, 10], [570, 372, 11]].forEach(([x, y, r]) => add(vPropTree(st, k, x, y, r), x, y));
    [[140, 140], [290, 140], [370, 140], [510, 140], [64, 140], [576, 140], [100, 340], [220, 376], [420, 376], [560, 340], [596, 392]].forEach(([x, y]) => add(vPropBush(k, x, y), x, y));
    add(vPropPost(258, 402, "HTML"), 258, 402); add(vPropPost(184, 402, "CSS"), 184, 402); add(vPropPost(114, 204, "C++"), 114, 204); add(vPropPost(526, 204, "JS"), 526, 204); add(vPropPost(498, 130, "PY"), 498, 130); add(vPropPost(444, 402, "BUGS"), 444, 402); add(vPropPost(82, 346, "PLOT"), 82, 346);
    const LH = !V.open.html, LC = !V.open.css, L = !V.open.cpp, LJ = !V.open.js, LP = !V.open.py, LG = !V.open.guild;
    if (LH) { add(vPropBarrier(320, 414, 100, "HTML"), 320, 414); obs.push([270, 402, 370, 416]); }
    if (LC) { add(vPropBarrier(150, 414, 56, "CSS"), 150, 414); obs.push([124, 402, 176, 416]); }
    if (LG) { add(vPropBarrier(490, 414, 56, "GUILD"), 490, 414); obs.push([464, 402, 516, 416]); }
    if (L) { add(vPropBarrierV(8, 282, 62, "C++"), 8, 282); obs.push([0, 218, 20, 284]); }
    if (LJ) { add(vPropBarrierV(632, 282, 62, "JS"), 632, 282); obs.push([620, 218, 640, 284]); }
    if (LP) { add(vPropBarrier(451, 114, 68, "PY"), 451, 114); obs.push([406, 98, 496, 118]); }
    exits.push({ r:[0, 220, 11, 282], to:"cpp", enter:[130, 188], lock:L && "cpp", hint:[10, 252] }, { r:[629, 220, 640, 282], to:"js", enter:[160, 188], lock:LJ && "js", hint:[630, 252] },
      { r:[266, 410, 374, 420], to:"html", enter:[160, 186], lock:LH && "html", hint:[320, 402] }, { r:[124, 410, 176, 420], to:"css", enter:[160, 186], lock:LC && "css", hint:[150, 402] },
      { r:[464, 410, 516, 420], to:"guild", enter:[160, 186], lock:LG && "guild", hint:[490, 402] }, { r:[412, 98, 490, 111], to:"py", enter:[160, 186], lock:LP && "py", hint:[451, 112] }, { r:[0, 340, 11, 400], to:"plot", enter:[160, 186] });
    npcs.push({ id:"lib", def:SPRITES.librarian, x:144, y:130, name:"Librarian Quill", role:"Keeper of the Spellbook" }, { id:"shop", def:SPRITES.shopkeeper, x:350, y:108, name:"The Wandering Trader", role:"Shopkeeper", still:true });
    npcs.push(giverNpc("courier"), { id:"glasses", coach:true, def:SPRITES.vil_glasses, x:444, y:170, name:"Coachman", role:"Waits by the road" });
    npcs.push({ id:"forge", def:SPRITES.vil_smith, x:262, y:128, name:"Brynn the Smith", role:"Keeper of the Forge" });
    o.flowers = [[90, 160], [100, 250], [200, 380], [240, 400], [400, 400], [430, 380], [540, 250], [550, 160], [60, 128], [580, 128], [320, 150], [220, 200], [420, 200], [60, 330], [590, 330], [300, 350], [346, 352]];
  }

  else if (id === "html") {
    o.name = "The Markup Quarter"; o.spawn = [160, 186];
    VSKYY(st, c, 96, 262); vMount(c, st, 94, 36, vmix("#1a1240", "#6f8ec0", k), 4); vTreeLine(c, st, 100, rnd, vmix("#120d33", "#3f7a52", k), vmix("#1c1448", "#5ea36a", k), 20, 34, 11);
    for (const hx of [20, 300]) vHouseSm(c, hx, 100, "#d8c29a", "#b8554a", k);
    vGroundPaint(c, (x, y) => { if (y < 96) return null; if ((y >= 98 && y <= 124 && x >= 60 && x <= 262) || (x >= 124 && x <= 196)) return "c"; return "g"; }, M);
    add(vBld(bHTML, { st, open:true }), 160, 100); add(Object.assign(vBake(80, 60, 40, 56, cc => vHouseSm(cc, 40, 56, "#e9d5a8", "#5a8fe0", k)), {}), 70, 100); add(vBake(80, 60, 40, 56, cc => vHouseSm(cc, 40, 56, "#f0d8c0", "#ffc857", k)), 250, 100);
    doors.push({ id:"html", x:160, y:113 }); clicks.push({ id:"html", r:[120, 20, 200, 104] }); smoke.push({ x:185, y:36 });
    lampsAt([[126, 126], [194, 126], [126, 172], [194, 172]]);
    [[28, 150, 13], [292, 156, 13], [40, 192, 12], [280, 192, 12]].forEach(([x, y, r]) => add(vPropTree(st, k, x, y, r), x, y));
    [[100, 130], [222, 130], [96, 176], [226, 176], [60, 126], [264, 126]].forEach(([x, y]) => add(vPropBush(k, x, y), x, y));
    add(vPropBench(150, 140), 150, 140); add(vPropBarrel(108, 106), 108, 106); add(vPropCrate(214, 105, 9), 214, 105);
    add(vPropPost(104, 192, "BACK"), 104, 192);
    exits.push({ r:[100, 196, 230, 200], to:"sq", enter:[320, 380] });
    npcs.push({ ...mentor("html"), x:96, y:124 }, giverNpc("baker")); o.flowers = [[90, 112], [230, 112], [60, 160], [260, 160], [100, 150], [220, 150]];
  }

  else if (id === "css") {
    o.name = "The Sunlit Forest"; o.spawn = [160, 186]; o.cloudY = [6, 36];
    VSKYY(st, c, 96, 262); vMount(c, st, 94, 34, vmix("#1a1240", "#7fb8e8", k), 5); vTreeLine(c, st, 100, rnd, vmix("#120d33", "#3f9a52", k), vmix("#1c1448", "#6fc27a", k), 22, 38, 12);
    vGroundPaint(c, (x, y) => { if (y < 96) return null; if ((y >= 98 && y <= 124 && x >= 96 && x <= 228) || (x >= 124 && x <= 196)) return "c"; return "g"; }, M);
    add(vBld(bCSS, { st, open:true }), 160, 100); doors.push({ id:"css", x:160, y:113 }); clicks.push({ id:"css", r:[118, 20, 202, 104] }); smoke.push({ x:187, y:34 });
    lampsAt([[126, 126], [194, 126], [126, 172]]);
    const lt = vrng(41), tk = [];
    for (let i = 0; i < 26; i++) { const x = Math.floor(lt() * 300) + 6, y = 112 + Math.floor(lt() * 88); if ((x > 108 && x < 212 && y < 130) || (x > 118 && x < 202) || (x > 180 && y > 142 && y < 184) || tk.some(([a, b]) => Math.abs(a - x) < 22 && Math.abs(b - y) < 14)) continue; tk.push([x, y]); add(vPropTree(st, k, x, y, 12 + Math.floor(lt() * 3)), x, y); }
    [[100, 130], [222, 130], [100, 176], [226, 188]].forEach(([x, y]) => add(vPropBush(k, x, y), x, y));
    add(vPropBench(150, 140), 150, 140); add(vPropBarrel(108, 106), 108, 106); add(vPropCrate(214, 105, 9), 214, 105);
    add(vPropPost(104, 192, "BACK"), 104, 192);
    exits.push({ r:[90, 196, 230, 200], to:"sq", enter:[150, 380] });
    npcs.push({ ...mentor("css"), x:96, y:124 }); o.flowers = [[90, 112], [230, 112], [60, 160], [260, 150], [100, 150], [220, 170], [40, 190], [250, 190]];
  }

  else if (id === "guild") {
    o.name = "The Debuggers' Guild"; o.spawn = [160, 186]; o.cloudY = [6, 36];
    VSKYY(st, c, 96, 262); vMount(c, st, 94, 36, vmix("#1a1240", "#6f8ec0", k), 6); vTreeLine(c, st, 100, rnd, vmix("#120d33", "#3f7a52", k), vmix("#1c1448", "#5ea36a", k), 20, 34, 11);
    vGroundPaint(c, (x, y) => { if (y < 96) return null; if ((y >= 98 && y <= 150 && x >= 44 && x <= 276) || (x >= 124 && x <= 196)) return "c"; return "g"; }, M);
    add(vBld(bGuild, { st, open:true }), 160, 100); doors.push({ id:"guild", x:160, y:113 }); clicks.push({ id:"guild", r:[112, 14, 208, 104] }); smoke.push({ x:182, y:30 });
    lampsAt([[126, 126], [194, 126], [126, 172], [194, 172], [60, 150], [260, 150]]);
    [[28, 150, 13], [292, 156, 13], [40, 192, 12], [280, 192, 12]].forEach(([x, y, r]) => add(vPropTree(st, k, x, y, r), x, y));
    [[100, 130], [222, 130], [96, 176], [226, 176]].forEach(([x, y]) => add(vPropBush(k, x, y), x, y));
    /* case boards beside the hall */
    [[84, 118], [236, 118]].forEach(([x, y]) => add(Object.assign(vBake(30, 28, 15, 27, cc => { vR(cc, 3, 24, 3, 4, "#5a3a22"); vR(cc, 24, 24, 3, 4, "#5a3a22"); vR(cc, 0, 2, 30, 22, "#5a3a22"); vR(cc, 2, 4, 26, 18, "#b98a52"); [[4, 6, "#fff8e8"], [14, 5, "#ffe9a8"], [21, 9, "#fff8e8"], [6, 13, "#cfe8f4"], [16, 13, "#fff8e8"]].forEach(([a, b, col]) => { vR(cc, a, b, 6, 6, col); vR(cc, a + 2, b - 1, 2, 1, "#d83a3a"); vR(cc, a + 1, b + 2, 4, 1, "#9a8a70"); vR(cc, a + 1, b + 4, 3, 1, "#9a8a70"); }); }), { obs:[x - 14, y - 8, x + 14, y + 1] }), x, y));
    add(vPropBench(150, 140), 150, 140); add(vPropBarrel(108, 106), 108, 106); add(vPropCrate(214, 105, 9), 214, 105);
    add(vPropPost(104, 192, "BACK"), 104, 192);
    exits.push({ r:[90, 196, 230, 200], to:"sq", enter:[490, 380] });
    npcs.push({ id:"dbug", def:SPRITES.vil_dbug, x:222, y:156, name:"D-Bug", role:"Head of the Debuggers' Guild", guild:true }); o.flowers = [[90, 112], [230, 112], [60, 160], [260, 150], [100, 190], [220, 170], [40, 190], [250, 190]];
  }

  else if (id === "manor") manorSceneFill(o, { c, add, st, k, M, rnd, doors, clicks, exits, npcs, obs, smoke, halos });

  else if (id === "plot") plSceneFill(o, { c, add, st, k, M, rnd, doors, clicks, exits, npcs, obs, smoke, lampsAt });

  else if (id === "cpp") {
    o.name = "The Dark Forest"; o.spawn = [130, 188]; o.dark = true; o.cloudY = [4, 22];
    const cx = y => 130 + (196 - y) / 86 * 100;
    VSKYY(st, c, 80, 250); vMount(c, st, 84, 30, vmix("#10102c", "#587aa0", k), 9);
    vR(c, 0, 78, VCW, 34, vmix("#0c1e2a", "#256a3c", k));
    for (let x = -4; x < VCW + 6; x += 9) vPine(c, x, 108 + (x * 7 % 5), 44 + (x * 13 % 22), vmix("#0c1e2a", "#256a3c", k), vmix("#08141e", "#195030", k));
    vGroundPaint(c, (x, y) => { if (y < 96) return null; return Math.abs(x - cx(Math.max(108, y))) < 26 || (y >= 98 && y <= 124 && x > 190 && x < 276) ? "d" : "g"; }, M);
    add(vBld(bCPP, { st, open:true }), 238, 102); doors.push({ id:"cpp", x:238, y:114 }); clicks.push({ id:"cpp", r:[196, 30, 282, 104] }); smoke.push({ x:210, y:30 });
    const tr = vrng(77), taken = [[112, 176], [112, 168], [100, 176], [124, 176]];
    for (let i = 0; i < 90; i++) { const x = Math.floor(tr() * 330) - 6, y = 110 + Math.floor(tr() * 92); if (Math.abs(x - cx(y)) < 40 || (x > 186 && x < 286 && y < 134) || taken.some(([a, b]) => Math.abs(a - x) < 15 && Math.abs(b - y) < 9)) continue; taken.push([x, y]); add(vPropPine(k, x, y, 40 + Math.floor(tr() * 22), true), x, y); }
    lampsAt([[cx(150) + 32, 150], [cx(120) - 32, 124], [cx(176) - 32, 176]]);
    [[cx(160) + 40, 168], [cx(128) - 38, 134]].forEach(([x, y]) => add(vPropBush(k, x, y, 12), x, y));
    add(vPropPost(cx(194) - 34, 192, "BACK"), cx(194) - 34, 192);
    exits.push({ r:[cx(198) - 30, 196, cx(198) + 30, 200], to:"sq", enter:[32, 250] });
    npcs.push({ ...mentor("cpp"), x:cx(140) - 36, y:140 }, giverNpc("watch")); o.flowers = []; o.fireflies = 26;
  }

  else if (id === "js") {
    o.name = "The Keep"; o.spawn = [160, 186];
    VSKYY(st, c, 60, 262); vMount(c, st, 62, 22, vmix("#1a1240", "#6f8ec0", k), 6);
    VT = [1, 1, 1]; vStone(c, 0, 40, VCW, 60, vmix("#2c2850", "#9a92a4", k), vmix("#18142e", "#6a627a", k));
    for (let x = 0; x < VCW; x += 14) vR(c, x, 34, 8, 7, vmix("#2c2850", "#9a92a4", k));
    for (const tx of [0, 292]) { vStone(c, tx, 20, 28, 82, vmix("#34305a", "#aaa2b4", k), vmix("#18142e", "#6a627a", k)); for (let i = 0; i < 4; i++) vR(c, tx + i * 8 - 2, 14, 6, 7, vmix("#34305a", "#aaa2b4", k)); vR(c, tx + 12, 42, 3, 9, "#1b2347"); }
    vGroundPaint(c, (x, y) => { if (y < 96) return null; if (x >= 146 && x <= 174 && y >= 104) return "r"; return "p"; }, M);
    for (let y = 98; y < VCH; y += 1) { vR(c, 0, y, 8, 1, vmix("#2c2850", "#9a92a4", k)); vR(c, 312, y, 8, 1, vmix("#2c2850", "#9a92a4", k)); }
    vStone(c, 0, 98, 8, 102, vmix("#2c2850", "#8f869a", k), vmix("#18142e", "#5a526a")); vStone(c, 312, 98, 8, 102, vmix("#2c2850", "#8f869a", k), vmix("#18142e", "#5a526a"));
    add(vBld(bJS, { st, open:true }), 160, 100); doors.push({ id:"js", x:160, y:113 }); clicks.push({ id:"js", r:[110, 20, 210, 104] });
    add(vPropFlag(96, 112, "#ffc857"), 96, 112); add(vPropFlag(224, 112, "#ffc857"), 224, 112);
    lampsAt([[118, 130], [202, 130], [60, 176], [260, 176]]);
    for (const [x, y] of [[54, 150], [270, 156]]) add(vBake(26, 40, 13, 38, cc => { vR(cc, 12, 14, 3, 24, "#5a3a22"); vR(cc, 5, 18, 17, 3, "#5a3a22"); vR(cc, 8, 4, 10, 12, "#c9a86a"); vR(cc, 8, 4, 10, 2, "#e0c488"); vR(cc, 10, 8, 6, 2, "#8a6a3a"); vR(cc, 9, 36, 9, 2, "#3d2713"); }), x, y);
    add(vBake(30, 30, 15, 28, cc => { vR(cc, 2, 8, 26, 3, "#5a3a22"); for (let i = 0; i < 4; i++) { vR(cc, 5 + i * 6, 0, 1, 20, "#aab6cc"); vR(cc, 4 + i * 6, 0, 3, 3, "#d4dcea"); } vR(cc, 2, 20, 26, 3, "#5a3a22"); vR(cc, 3, 8, 2, 20, "#4a2f1a"); vR(cc, 25, 8, 2, 20, "#4a2f1a"); }), 34, 126);
    add(vPropBarrel(44, 188), 44, 188); add(vPropCrate(56, 188, 9), 56, 188); add(vPropBarrel(274, 188), 274, 188);
    add(vPropPost(108, 192, "BACK"), 108, 192);
    exits.push({ r:[100, 196, 230, 200], to:"sq", enter:[608, 250] });
    npcs.push({ ...mentor("js"), x:122, y:134 }); o.flowers = [];
  }

  else if (id === "py") {
    o.name = "The Castle Roof"; o.spawn = [160, 186]; o.cloudY = [6, 80];
    VSKYY(st, c, 100, 130); vMount(c, st, 100, 30, vmix("#1a1240", "#6f8ec0", k), 11);
    /* Pythona's tower looms behind */
    const tc = vmix("#2a1a46", "#8a7aa8", k), tc2 = vmix("#1a1030", "#6e5e90", k), tx = 262, by = 164;
    VT = [1, 1, 1]; vStone(c, tx - 16, by - 70, 32, 70, tc, tc2); vStone(c, tx - 22, by - 78, 44, 8, tc, tc2); vStone(c, tx - 10, by - 118, 20, 42, tc, tc2); vStone(c, tx - 16, by - 126, 32, 8, tc, tc2);
    for (let i = 0; i < 4; i++) vR(c, tx - 16 + i * 10, by - 134, 6, 8, tc); vR(c, tx - 3, by - 164, 6, 32, tc2); vR(c, tx + 3, by - 164, 12, 6, tc2);
    const gl = st < 4 ? (st < 2 ? "#ff3d5a" : "#ff9a5a") : "#ffe27a"; vR(c, tx - 5, by - 108, 10, 12, gl); vR(c, tx - 8, by - 92, 5, 10, st < 4 ? "#a02a4a" : "#ffe27a"); vR(c, tx + 4, by - 92, 5, 10, st < 4 ? "#a02a4a" : "#ffe27a");
    vStone(c, tx - 36, by - 76, 12, 76, tc2, vmix(tc2, "#000000", .4)); vStone(c, tx + 22, by - 90, 12, 90, tc2, vmix(tc2, "#000000", .4));
    vGroundPaint(c, (x, y) => (y < 96 ? null : "t"), M);
    for (let x = 0; x < VCW; x += 12) { vR(c, x, 92, 8, 8, vmix("#34305a", "#aaa2b4", k)); vR(c, x, 92, 8, 1, vmix("#46427a", "#d0cad8", k)); }
    vR(c, 0, 99, VCW, 4, vmix("#2a2650", "#8f89a0", k));
    for (const sx of [0, 308]) for (let y = 104; y < VCH; y += 20) { vR(c, sx, y, 12, 10, vmix("#34305a", "#aaa2b4", k)); vR(c, sx, y, 12, 1, vmix("#46427a", "#d0cad8", k)); vR(c, sx + 1, y + 10, 10, 8, vmix("#2a2650", "#8f89a0", k)); }
    vR(c, 112, 134, 22, 8, vmix("#7a2a3a", "#c0506a", k)); vR(c, 112, 134, 22, 1, vmix("#a04058", "#e07088", k));
    add(vBld(bPY, { st, open:true }), 160, 100); doors.push({ id:"py", x:160, y:113 }); clicks.push({ id:"py", r:[128, 0, 192, 104] });
    for (const [x, y] of [[60, 134], [250, 156]]) { add(vBake(24, 40, 12, 38, cc => { vR(cc, 2, 6, 20, 32, "#6a728a"); vR(cc, 2, 6, 20, 2, "#9aa4bc"); vR(cc, 0, 2, 24, 5, "#4a526a"); vR(cc, 4, 10, 4, 3, "#3a425a"); }), x, y); obs.push([x - 11, y - 4, x + 11, y + 1]); smoke.push({ x, y:y - 36 }); }
    [[104, 118], [216, 118], [88, 178], [232, 178]].forEach(([x, y]) => add(Object.assign(vBake(20, 44, 10, 42, cc => { vR(cc, 9, 14, 2, 28, "#2e2e44"); vR(cc, 3, 2, 14, 14, "#ff6b81"); vR(cc, 4, 3, 12, 12, "#ffd86a"); vR(cc, 3, 2, 14, 2, "#c0392b"); vR(cc, 3, 14, 14, 2, "#c0392b"); }), { halo:{ x, y:y - 32 } }), x, y));
    add(vPropPost(104, 192, "BACK"), 104, 192);
    exits.push({ r:[110, 196, 220, 200], to:"sq", enter:[451, 124] });
    npcs.push({ ...mentor("py"), x:122, y:140 }, giverNpc("kid")); o.flowers = []; o.fast = true;
  }
  o.bg = bg.cv; o.groundFlowers = o.flowers || [];
  return o;
}
