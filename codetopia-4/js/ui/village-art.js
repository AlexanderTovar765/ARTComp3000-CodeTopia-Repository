/* Village art: the detailed look for the square and the Guild: textured stone, shingled roofs, shaded trees, a basin fountain.
   Every painter keeps the same name and size as before, so the scenes, doors and clicks work unchanged.
   Colours are written for night and warmed up as the guardians fall (k = 0 storm night, 1 sunrise). */

"use strict";

const vh = (x, y, s = 0) => { let n = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 982451653)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
const vA = h => vhex(h);
const vM = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
let VT = [1, 1, 1];
const vSetLight = S => { const k = Math.min(4, Math.max(0, (S && S.st) || 0)) / 4; VT = [.86 + .62 * k, .88 + .56 * k, 1.08 + .1 * k]; return k; };
const vTc = h => "#" + vhex(h).map((v, i) => Math.min(255, Math.round(v * VT[i])).toString(16).padStart(2, "0")).join("");

/* paint a w by h patch where fn(i, j) gives an [r, g, b] (or nothing to leave it clear), lit by the current light */
function vPix(c, x, y, w, h, fn) {
  const t = vCanvas(w, h), im = t.c.createImageData(w, h), d = im.data;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const p = fn(i, j); if (p) { const o = (j * w + i) * 4; d[o] = p[0] * VT[0]; d[o + 1] = p[1] * VT[1]; d[o + 2] = p[2] * VT[2]; d[o + 3] = 255; } }
  t.c.putImageData(im, 0, 0); c.drawImage(t.cv, Math.round(x), Math.round(y));
}
const vDk = vA("#0a0620"), vHi = vA("#b8b0f0");

function vStone(c, x, y, w, h, base, mortar) {
  const B = vA(base), Mo = vA(mortar), lite = vA("#8a82c4"), lo = vA("#1c1640");
  vPix(c, x, y, w, h, (i, j) => { const row = (j / 6) | 0, off = row % 2 ? 5 : 0, u = (i + off) % 12;
    if (j % 6 === 5 || u === 11) return Mo;
    let p = vM(B, lite, vh(((i + off) / 12) | 0, row, 3) * .25 - .05); if (j % 6 === 0) p = vM(p, vHi, .15); if (vh(x + i, y + j, 9) > .94) p = vM(p, lo, .25);
    if (i < 2) p = vM(p, vHi, .18); if (i > w - 3) p = vM(p, vDk, .4); return p; });
}
function vWood(c, x, y, w, h, base) {
  const B = vA(base), lite = vA("#8a5a36"), dk = vA("#2a1810");
  vPix(c, x, y, w, h, (i, j) => { let p = vM(B, lite, vh((i / 8) | 0, (j / 6) | 0, 1) * .4); if (i % 8 === 0) p = vM(p, dk, .55); else if ((i + j * 2) % 23 === 0) p = vM(p, dk, .3); else if (i % 8 === 1) p = vM(p, vA("#c89a6a"), .15); if (i > w - 3) p = vM(p, dk, .4); return p; });
}
function vGable(c, cx, ytop, w, h, c1, c2, over = 5) {
  const A = vA(c1), B = vA(c2), R = Math.ceil(w / 2 + over) + 1, W = R * 2 + 1;
  vPix(c, cx - R, ytop, W, h, (i, j) => { const xi = i - R, half = Math.round((j + 1) / h * (w / 2 + over)); if (Math.abs(xi) > half) return null;
    const off = (j / 3 | 0) % 2 ? 3 : 0, edge = ((xi + off) % 6 + 6) % 6 === 0;
    let p = vM(A, B, j / h * .7 + vh(Math.floor((xi + off) / 6), (j / 3) | 0, 2) * .25); if (edge) p = vM(p, vDk, .45); if (j % 3 === 2) p = vM(p, vDk, .35);
    if (xi < -half + 1) p = vM(p, vHi, .3); if (xi > half - 2) p = vM(p, vDk, .4); return p; });
  vR(c, cx - 2, ytop - 1, 5, 2, vTc("#2a1d48"));
}
function vWin(c, x, y, w, h, lit, k, tint) {
  vR(c, x - 1, y - 1, w + 2, h + 2, "#1a1030");
  const day = k > .55, top = lit ? (day ? vA("#e6f4ff") : vA(tint || "#fff0b0")) : vA("#2a3a6a"), bot = lit ? (day ? vA("#8ab8e8") : vA("#ff9f3a")) : vA("#14204a");
  const g = vCanvas(w, h); const im = g.c.createImageData(w, h), d = im.data;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { let p = vM(top, bot, j / h * .8); if (lit && vh(x + i, y + j, 11) > .92) p = vM(p, [255, 255, 255], .5); const o = (j * w + i) * 4; d[o] = p[0]; d[o + 1] = p[1]; d[o + 2] = p[2]; d[o + 3] = 255; }
  g.c.putImageData(im, 0, 0); c.drawImage(g.cv, x, y);
  vR(c, x + (w >> 1), y, 1, h, "#2a1810"); vR(c, x, y + (h >> 1), w, 1, "#2a1810");
  vR(c, x - 2, y + h + 1, w + 4, 2, vTc("#8a82c4")); vR(c, x - 2, y + h + 1, w + 4, 1, vTc("#b8b0f0"));
}
function vBeam(c, x, y, w) { vR(c, x, y, w, 3, vTc("#26204a")); vR(c, x, y, w, 1, vTc("#6a66a8")); }

/* ---------- the four buildings of the square ---------- */
function bLIB(c, cx, by, S) {
  const k = vSetLight(S), w = 88, wallH = 56, x0 = cx - w / 2, y0 = by - wallH;
  vStone(c, x0, y0, w, wallH, "#4d4a86", "#1c1640");
  vGable(c, cx, y0 - 34, w, 36, "#2e5aa0", "#1c3a70", 5);
  vBeam(c, x0 - 6, y0 + 1, w + 12);
  vR(c, cx + 20, y0 - 38, 8, 18, vTc("#3a3470")); vR(c, cx + 19, y0 - 40, 10, 3, vTc("#2a2450"));
  vR(c, cx, y0 - 46, 1, 12, "#2a2548"); vR(c, cx - 5, y0 - 50, 11, 5, vTc("#e8d8a8")); vR(c, cx - 5, y0 - 50, 11, 1, "#fff6d8"); vR(c, cx, y0 - 50, 1, 5, "#8a6a3a");   /* weathervane: an open book */
  const rw = k > .55 ? "#9ccbea" : "#ffd86a"; for (let j = -7; j <= 7; j++) { const hw = Math.round(Math.sqrt(49 - j * j)); vR(c, cx - hw - 1, y0 - 16 + j, hw * 2 + 2, 1, "#1a1030"); vR(c, cx - hw, y0 - 16 + j, hw * 2, 1, rw); }
  vR(c, cx, y0 - 23, 1, 14, "#2a1810"); vR(c, cx - 7, y0 - 16, 14, 1, "#2a1810");
  vWin(c, x0 + 8, y0 + 10, 12, 16, true, k); vWin(c, x0 + w - 20, y0 + 10, 12, 16, true, k);
  vWin(c, x0 + 28, y0 + 14, 9, 14, false, k); vWin(c, x0 + w - 37, y0 + 14, 9, 14, false, k);
  for (let i = 0; i < 6; i++) vR(c, x0 + 6 + i * 3, by - 18, 2, 8, ["#c94a4a", "#4aa0c9", "#e0a83a", "#6fd08c"][i % 4]);
  vDoor(c, cx, by, 16, 32, "open");
  for (let i = 0; i < 3; i++) vR(c, cx - 12 - i * 2, by - 3 + i, 24 + i * 4, 1, vTc(i ? "#56528a" : "#7a76b8"));
  vSign(c, cx, y0 + 2, "LIBRARY", "#cfe0ff", "#1c2a58");
  for (const fx of [x0 + 7, x0 + w - 19]) { vR(c, fx, y0 + 28, 14, 4, "#4a2f22"); vR(c, fx, y0 + 28, 14, 1, "#8a5a36"); for (let i = 0; i < 7; i++) { vR(c, fx + 1 + i * 2, y0 + 26, 1, 2, "#2f6a4a"); vR(c, fx + 1 + i * 2, y0 + 25, 1, 1, ["#ff7ab8", "#ffd23f", "#ffffff", "#c9a0ff"][i % 4]); } }
}
function bFORGE(c, cx, by, S) {
  const k = vSetLight(S), w = 90, wallH = 46, x0 = cx - w / 2, y0 = by - wallH, lit = S.open;
  vStone(c, x0, y0, w, wallH, "#5a4a5a", "#201428");
  vGable(c, cx, y0 - 28, w, 30, "#7a3a2a", "#4a2018", 5);
  vR(c, x0 - 5, y0 + 1, w + 10, 3, vTc("#2a1418"));
  vStone(c, x0 + 8, y0 - 44, 14, 46, "#4a3a4a", "#2a1a2a"); vR(c, x0 + 6, y0 - 47, 18, 4, vTc("#3a2a3a")); vR(c, x0 + 6, y0 - 47, 18, 1, vTc("#7a6a7a"));
  const fx = x0 + 28, fy = y0 + 14;   /* the open forge */
  vR(c, fx - 2, fy - 2, 26, 34, "#120a12");
  vArch(c, fx + 11, fy + 32, 22, 32, "#1a0a10");
  if (lit) { const F = vCanvas(22, 30), im = F.c.createImageData(22, 30), d = im.data;
    for (let j = 0; j < 30; j++) for (let i = 0; i < 22; i++) { const dx = i - 10.5; if (j < 10 && Math.abs(dx) > 10 - (10 - j) * .9) continue; const t = Math.min(1, (1 - j / 30) * 1.1 + vh(i, j, 14) * .25 - .1), p = vM(vA("#8a1a08"), vA("#ffe27a"), Math.max(0, t)); if (j > 6) { const o = (j * 22 + i) * 4; d[o] = p[0]; d[o + 1] = p[1]; d[o + 2] = p[2]; d[o + 3] = 255; } }
    F.c.putImageData(im, 0, 0); c.drawImage(F.cv, fx, fy + 2); }
  vR(c, fx - 4, fy - 4, 30, 2, vTc("#3a2a3a")); vR(c, fx - 4, fy - 4, 2, 36, vTc("#3a2a3a")); vR(c, fx + 24, fy - 4, 2, 36, vTc("#3a2a3a")); vR(c, fx - 4, fy + 32, 30, 3, vTc("#3a3040"));
  vWin(c, x0 + w - 24, y0 + 12, 11, 12, lit, k);
  vDoor(c, cx + 2, by, 14, 32, lit ? "open" : "locked");
  vR(c, x0 + w - 10, by - 14, 7, 14, vTc("#3a6aa0")); vR(c, x0 + w - 10, by - 14, 7, 2, "#6fb0ff"); vR(c, x0 + w - 10, by - 9, 7, 1, "#1a3a60");
  vSign(c, cx + 2, y0 + 2 - 12, "FORGE", lit ? "#ffb24a" : "#9a8a82", "#4a1a00");
  const ex = cx + 28, ey = by - 59;   /* a cat on the roof */
  for (let i = 0; i < 9; i++) vR(c, ex + i - 4, ey - (i > 5 ? 2 : 0) - (i < 3 ? 1 : 0), 1, 4, "#0a0620");
  vR(c, ex + 4, ey - 6, 1, 2, "#0a0620"); vR(c, ex + 6, ey - 6, 1, 2, "#0a0620"); vR(c, ex + 4, ey - 3, 1, 1, "#ffd23f"); vR(c, ex + 6, ey - 3, 1, 1, "#ffd23f"); for (let i = 0; i < 6; i++) vR(c, ex - 5 - i, ey + 2 - (i >> 1), 1, 1, "#0a0620");
}
function bSHOP(c, cx, by, S) {
  const k = vSetLight(S), w = 84, x0 = cx - w / 2, wallH = 54;
  vWood(c, x0 + 2, by - wallH, w - 4, wallH, "#6a4528");
  vGable(c, cx, by - wallH - 24, w - 8, 26, "#2a8a7a", "#1a5a5a", 6);
  vBeam(c, x0 - 2, by - wallH + 1, w + 4);
  vR(c, x0 + 2, by - 50, 3, 50, vTc("#4a2f22")); vR(c, x0 + w - 5, by - 50, 3, 50, vTc("#4a2f22"));
  const sh = (i, j) => { const pal = ["#e0453f", "#ffd23f", "#6fd08c", "#6fb0ff", "#c9a0ff", "#35d0b8"]; return pal[(i * 2 + j) % 6]; };
  for (let r = 0; r < 3; r++) { vR(c, x0 + 8, by - 38 + r * 12, w - 16, 2, vTc("#3a261c")); for (let i = 0; i < 6; i++) { const col = sh(i, r); vR(c, x0 + 12 + i * 11, by - 44 + r * 12, 6, 6, vTc(col)); vR(c, x0 + 12 + i * 11, by - 44 + r * 12, 6, 1, vTc(vmix(col, "#ffffff", .45))); } }
  for (let i = 0; i < w + 8; i++) { const a = ((i / 6) | 0) % 2 === 0, col = a ? "#e8e8f0" : "#3a6ad0", dip = (i % 6) === 2 || (i % 6) === 3 ? 2 : 0;
    for (let j = 0; j < 12 + dip; j++) vR(c, x0 - 4 + i, by - 56 + j, 1, 1, vTc(j >= 9 ? vmix(col, "#0a0620", .35) : col)); vR(c, x0 - 4 + i, by - 57, 1, 1, vTc(vmix(col, "#ffffff", .3))); }
  vR(c, x0 - 4, by - 58, w + 8, 2, vTc("#6a4528"));
  vR(c, x0, by - 14, w, 14, vTc("#8a5a36")); vR(c, x0, by - 14, w, 2, vTc("#c89a6a")); vR(c, x0, by - 3, w, 3, vTc("#3a261c"));
  for (let i = 0; i < 5; i++) vR(c, x0 + 6 + i * 16, by - 11, 1, 8, vTc("#6a4528"));
  vR(c, x0 + 6, by - 20, 8, 6, "#ffd23f"); vR(c, x0 + 7, by - 21, 6, 1, "#ffe88a"); vR(c, x0 + w - 16, by - 22, 8, 8, "#c58bff"); vR(c, x0 + w - 14, by - 24, 4, 2, "#e5c8ff");
  vSign(c, cx, by - 70, "SHOP", "#ffe9a8", "#8a2a1a");
}
function bTOWER(c, cx, by, S) {
  const k = vSetLight(S), w = 52, x0 = cx - w / 2, wallH = 92, st = S.st;
  const B = vA("#4a4478"), lite = vA("#8a82c4");
  vPix(c, x0, by - wallH, w, wallH, (i, j) => { const t = i / (w - 1) * 2 - 1, row = (j / 7) | 0, off = row % 2 ? 6 : 0, u = (i + off) % 13;
    let p = vM(B, lite, vh(((i + off) / 13) | 0, row, 3) * .25 - .05); if (j % 7 === 6 || u === 12) p = vA("#1c1640"); else if (j % 7 === 0) p = vM(p, vHi, .12);
    const sh = t > -.35 ? (t + .35) ** 2 * .45 * 1.1 : (-.35 - t) * .6 * .6; p = vM(p, vDk, Math.min(.7, Math.max(0, sh))); if (t < -.7) p = vM(p, vA("#c8d4ff"), .12); return p; });
  vR(c, x0 - 6, by - wallH, w + 12, 5, vTc("#2a2450")); vR(c, x0 - 6, by - wallH, w + 12, 1, vTc("#8a82c4"));
  for (let i = 0; i < 7; i++) { vR(c, x0 - 4 + i * 9, by - wallH - 9, 6, 9, vTc("#4a4478")); vR(c, x0 - 4 + i * 9, by - wallH - 9, 6, 1, vTc("#8a82c4")); vR(c, x0 - 4 + i * 9 + 5, by - wallH - 9, 1, 9, vTc("#1c1640")); }
  /* the upper floor: two windows side by side, well clear of the door */
  vWin(c, cx - 17, by - 76, 10, 15, true, k); vWin(c, cx + 7, by - 76, 10, 15, true, k);
  vR(c, cx - 1, by - 82, 2, 28, vTc("#1c1640"));                                  /* a slim pillar between them */
  /* a stone ledge splits the upper floor from the entrance */
  vR(c, x0 - 2, by - 53, w + 4, 4, vTc("#2a2450")); vR(c, x0 - 2, by - 53, w + 4, 1, vTc("#a89ee0")); vR(c, x0 - 2, by - 50, w + 4, 1, vTc("#120d30"));
  /* the entrance: a stone arch surround, a keystone and two steps */
  const dh = 30, fr = vTc("#6a62a4"), frd = vTc("#2a2450");
  vR(c, cx - 13, by - dh - 6, 26, dh + 6, frd); vR(c, cx - 12, by - dh - 5, 24, dh + 5, fr); vR(c, cx - 12, by - dh - 5, 24, 1, vTc("#b4aae8"));
  vR(c, cx - 3, by - dh - 8, 6, 5, vTc("#8a82c4")); vR(c, cx - 3, by - dh - 8, 6, 1, vTc("#c8c0f0")); vR(c, cx - 3, by - dh - 4, 6, 1, frd);
  vDoor(c, cx, by - 2, 16, dh, "open");
  vR(c, cx - 15, by - 2, 30, 2, vTc("#8a82c4")); vR(c, cx - 15, by - 2, 30, 1, vTc("#c8c0f0")); vR(c, cx - 18, by - 0.5, 36, 1, vTc("#2a2450"));
  /* wall torches either side of the door */
  for (const tx of [cx - 21, cx + 21]) { vR(c, tx - 1, by - 22, 2, 8, "#1a1330"); vR(c, tx - 2, by - 24, 4, 3, "#3d2713"); vR(c, tx - 1, by - 28, 2, 4, "#ff9f2a"); vR(c, tx, by - 30, 1, 3, "#ffd86a"); vR(c, tx - 1, by - 26, 2, 1, "#fff2b0"); }
  /* the sign hangs between the ledge and the arch */
  vSign(c, cx, by - 49, "TOWER", "#2a2650", "#ffcf5a", "#0e0b22");
  vR(c, cx - 1, by - wallH - 24, 2, 16, "#3d2713"); vR(c, cx + 1, by - wallH - 24, 9, 6, st >= 4 ? "#ffd23f" : "#ff6b81");
}
function bGuild(c, cx, by, S) {
  const k = vSetLight(S), w = 84, x0 = cx - w / 2, wallH = 46, lit = S.open;
  vStone(c, x0, by - wallH, w, wallH, "#3e5a62", "#142428");
  vGable(c, cx, by - wallH - 28, w, 30, "#4a5a6a", "#2a3646", 6);
  vBeam(c, x0 - 4, by - wallH + 1, w + 8);
  vR(c, x0 + w - 20, by - wallH - 22, 8, 22, vTc("#3e5a62")); vR(c, x0 + w - 21, by - wallH - 23, 10, 3, vTc("#1a2a32"));
  vWin(c, x0 + 8, by - 36, 12, 14, lit, k, "#bfffe0"); vWin(c, x0 + w - 20, by - 36, 12, 14, lit, k, "#bfffe0");
  vDoor(c, cx, by, 14, 30, lit ? "open" : "locked");
  /* ladybug emblem on the gable */
  const ex = cx, ey = by - wallH - 14;
  for (let j = -6; j <= 6; j++) { const hw = Math.round(8 * Math.sqrt(1 - (j / 7) ** 2)); vR(c, ex - hw - 1, ey + j, hw * 2 + 2, 1, "#1a1330"); vR(c, ex - hw, ey + j, hw * 2, 1, "#e0453f"); }
  vR(c, ex, ey - 6, 1, 12, "#1a1330"); vR(c, ex - 4, ey - 9, 9, 3, "#1a1330"); vR(c, ex - 3, ey - 2, 2, 2, "#1a1330"); vR(c, ex + 2, ey - 2, 2, 2, "#1a1330"); vR(c, ex - 4, ey + 2, 2, 2, "#1a1330"); vR(c, ex + 3, ey + 2, 2, 2, "#1a1330");
  vR(c, ex - 4, ey - 12, 1, 3, "#1a1330"); vR(c, ex + 4, ey - 12, 1, 3, "#1a1330");
  for (const lx of [cx - 20, cx + 19]) { vR(c, lx, by - 34, 1, 4, "#1a1330"); vR(c, lx - 2, by - 30, 5, 7, "#1a1330"); vR(c, lx - 1, by - 29, 3, 5, lit ? (k > .55 ? "#d8fff0" : "#7affb0") : "#3a3a50"); }
  vR(c, x0 - 8, by - 34, 2, 30, "#5a3a22"); vR(c, x0 - 8, by - 34, 12, 2, "#5a3a22");
  for (let j = -4; j <= 4; j++) { const hw = Math.round(Math.sqrt(25 - j * j)); vR(c, x0 - 8 - hw, by - 22 + j, hw * 2 + 1, 1, "#1a1330"); if (Math.abs(j) < 4) vR(c, x0 - 8 - hw + 1, by - 22 + j, hw * 2 - 1, 1, "#cfe8f4"); }
  vR(c, x0 - 11, by - 24, 2, 2, "#ffffff"); vR(c, x0 - 4, by - 18, 3, 4, "#5a3a22");
  vSign(c, cx, by - wallH - 6 + 2, "GUILD", "#bfe8d8", "#12303a");
}

/* ---------- props ---------- */
function vRoundTree(c, x, by, r, col, col2, trunk = "#4a2f22") {
  VT = [1, 1, 1];
  vR(c, x - 2, by - r - 4, 4, r + 4, vmix(trunk, "#000000", .1)); vR(c, x - 2, by - r - 4, 1, r + 4, vmix(trunk, "#c89a6a", .35)); vR(c, x + 1, by - r - 4, 1, r + 4, vmix(trunk, "#000000", .45));
  const L = vA(col), D = vA(col2), W = r * 2 + 10, H = r * 2 + 14, cy = by - r - 6;
  const blobs = [[0, 0, r], [-r * .55, r * .25, r * .72], [r * .6, r * .3, r * .66], [0, -r * .55, r * .72]];
  vPix(c, x - r - 5, by - H + 4, W, H, (i, j) => { const px = i - r - 5 + .5, py = j + (by - H + 4) - cy + .5; let hit = -1, rr = 1;
    for (let b = 0; b < blobs.length; b++) { const dx = px - blobs[b][0], dy = py - blobs[b][1]; if (dx * dx + dy * dy <= blobs[b][2] ** 2) { hit = b; rr = Math.sqrt(dx * dx + dy * dy) / blobs[b][2]; } }
    if (hit < 0) return null; const t = Math.max(0, Math.min(1, ((px + py * 1.2) / (r * 2)) + .5)), n = vh(i + (x | 0), j + (by | 0), 8);
    let p = vM(L, D, t); if (n > .86) p = vM(p, vA("#5fa56a"), .35); else if (n < .1) p = vM(p, [10, 22, 38], .5); if (rr > .86 && px + py < 0) p = vM(p, vA("#c8d4ff"), .3); return p; });
}
function vLamp(c, x, by, S) {
  const day = S.st >= 4;
  vR(c, x - 1, by - 3, 4, 3, "#2a2548"); vR(c, x, by - 30, 2, 28, "#2e2e44"); vR(c, x, by - 30, 1, 28, "#3a3466");
  vR(c, x - 3, by - 36, 8, 7, "#1a1630"); vR(c, x - 2, by - 35, 6, 5, day ? "#ffe9a8" : "#ffd86a"); vR(c, x - 1, by - 34, 3, 3, "#fff6c0"); vR(c, x - 4, by - 38, 10, 2, "#2a2548"); vR(c, x, by - 39, 2, 1, "#2a2548");
  vR(c, x - 2, by - 29, 6, 1, "#2a2548");
}
function vBench(c, x, by) {
  vR(c, x + 1, by - 1, 17, 2, "rgba(5,3,15,.4)");
  vR(c, x, by - 8, 18, 2, "#6a4528"); vR(c, x, by - 8, 18, 1, "#8a5a36"); vR(c, x, by - 12, 18, 2, "#6a4528"); vR(c, x, by - 12, 18, 1, "#8a5a36");
  vR(c, x + 1, by - 6, 2, 6, "#3a261c"); vR(c, x + 15, by - 6, 2, 6, "#3a261c"); vR(c, x + 1, by - 12, 2, 6, "#4a3020"); vR(c, x + 15, by - 12, 2, 6, "#4a3020");
}
function vBarrel(c, x, by) {
  for (let j = 0; j < 11; j++) { const half = Math.round(3.6 + Math.sin(j / 10 * Math.PI) * 1.4);
    for (let i = -half; i <= half; i++) vR(c, x + 4 + i, by - 11 + j, 1, 1, i < -half + 1 ? "#a8744a" : i > half - 1 ? "#3a261c" : "#6a4528"); }
  vR(c, x, by - 8, 9, 1, "#9a9ab8"); vR(c, x, by - 3, 9, 1, "#9a9ab8"); vR(c, x + 1, by - 12, 7, 2, "#3a261c");
}
function vBush(c, x, by, col, col2, w = 12) {
  VT = [1, 1, 1];
  const L = vA(col), D = vA(col2);
  vPix(c, x - (w >> 1) - 1, by - 8, w + 2, 9, (i, j) => { const px = (i - (w + 2) / 2 + .5) / (w / 2 + .5), py = (j - 4) / 4; if (px * px + py * py > 1) return null;
    let p = vM(L, D, j / 8); const n = vh(i + x, j + by, 21); if (n > .85) p = vM(p, vA("#6fd08c"), .3); else if (n < .1) p = vM(p, [10, 22, 38], .4); return p; });
}
/* a stone drum seen from above at an angle: lit rim, a recess inside and a bricked wall below */
function vDrum(c, cx, cy, rx, ry, h, st) {
  const ox = rx + 1, oy = ry + 1, W = rx * 2 + 3, Hh = ry * 2 + h + 3, tl = vA(st.topL), td = vA(st.topD), inn = vA(st.inn), wl = vA(st.wallL), wd = vA(st.wallD);
  vPix(c, cx - ox, cy - oy, W, Hh, (i, j) => {
    const dx = (i + .5 - ox) / rx, dy = (j + .5 - oy) / ry, e = dx * dx + dy * dy, e2 = dx * dx + ((j + .5 - oy - h) / ry) ** 2;
    if (e <= 1) {
      if (e > st.hole) { let p = vM(td, tl, Math.max(0, Math.min(1, .55 - (dx + dy) * .5))); if (e > .93) p = vM(p, vDk, .3); else if (e < st.hole + .08) p = vM(p, vDk, .4); else if (e > .8 && e <= .86) p = vM(p, [255, 255, 255], .1); if (vh(i + cx, j + cy, 51) > .94) p = vM(p, vHi, .15); return p; }
      return inn; }
    if (e2 <= 1 && j + .5 >= oy) {
      let p = vM(wl, wd, Math.max(0, Math.min(1, (dx + 1) / 2 * .95))); const r = j - oy - ((h / 2) | 0), row = Math.floor((j - oy) / 4), jx = (i + (row % 2 ? 3 : 0)) % 8;
      if (jx === 0 || (j - oy) % 4 === 3) p = vM(p, vDk, .3); else if ((j - oy) % 4 === 0) p = vM(p, [255, 255, 255], .1);
      if (e2 > .9) p = vM(p, vDk, .35); if (j + .5 - oy - h > -1.5 && e2 > .6) p = vM(p, vDk, .25); return p; }
    return null; });
}
function vFountain(c, cx, by, S) {
  const k = vSetLight(S), day = k > .55, cw = day ? ["#8ad0f4", "#4aa8e8"] : ["#3a7ae0", "#1d4aa0"], dw = day ? "#2c6aa8" : "#18265a";
  const WA = vA(cw[0]), WB = vA(cw[1]), WD = vA(dw);
  /* contact shadow on the cobbles so the fountain sits on the ground instead of floating in it */
  for (const [rx, ry, a] of [[34, 10, .2], [31, 8.5, .22], [29, 7.5, .26]]) for (let j = -ry; j <= ry; j++) { const hw = Math.round(rx * Math.sqrt(1 - (j / ry) ** 2)); vR(c, cx - hw, by - 6 + Math.round(j) + 1, hw * 2, 1, `rgba(5,3,15,${a})`); }
  const stone = { topL: "#cfc8f6", topD: "#8a82c8", wallL: "#8f88cc", wallD: "#3a3470", inn: "#4a4488", hole: .99 };
  vDrum(c, cx, by - 11, 28, 7.5, 3, { ...stone, hole: 2 });                                   /* lower step: solid stone */
  vDrum(c, cx, by - 19, 22, 6, 7, { ...stone, topL: "#e0daff", topD: "#9a92d8", hole: .72, inn: "#2e2a68" });   /* the basin */
  /* the water in the basin with ripples, a darker band under the back rim and glints */
  vPix(c, cx - 19, by - 25, 39, 11, (i, j) => { const dx = (i + .5 - 19.5) / 18.5, dy = (j + .5 - 5.8) / 4.5, e = dx * dx + dy * dy; if (e > 1) return null;
    if (dy < -.45) return vM(WD, vA("#0e0c34"), .3 + (-dy - .45) * .6);
    let p = vM(WA, WB, Math.min(1, (dy + 1) / 2 + vh(i >> 1, j, 13) * .15)); const ring = (dx * dx / 3.2 + dy * dy), rr = (Math.sqrt(dx * dx + dy * dy * 1.0) % .24);
    if (rr < .035 && e > .1) p = vM(p, [255, 255, 255], .22); if (vh(i, j, 17) > .965) p = vM(p, [255, 255, 255], .6); if (e > .8) p = vM(p, vDk, .12); return p; });
  /* pedestal rising out of the water */
  vR(c, cx - 7, by - 24, 14, 5, vTc("#6a64a8")); vR(c, cx - 7, by - 24, 14, 1, vTc("#d8d2ff")); vR(c, cx - 7, by - 20, 14, 1, vTc("#2e2a68"));
  vR(c, cx - 4, by - 38, 8, 14, vTc("#8a82c8")); vR(c, cx - 4, by - 38, 2, 14, vTc("#d8d2ff")); vR(c, cx + 2, by - 38, 2, 14, vTc("#4a4488")); vR(c, cx - 1, by - 38, 1, 14, vTc("#6a64a8"));
  vR(c, cx - 6, by - 41, 12, 3, vTc("#b8b0f0")); vR(c, cx - 6, by - 41, 12, 1, vTc("#ece8ff")); vR(c, cx - 6, by - 39, 12, 1, vTc("#3a3470"));
  /* upper bowl */
  vDrum(c, cx, by - 43, 13, 3.6, 3, { ...stone, topL: "#e8e2ff", topD: "#a49cdc", hole: .62, inn: "#2e2a68" });
  vPix(c, cx - 10, by - 46, 21, 6, (i, j) => { const dx = (i + .5 - 10.5) / 9.6, dy = (j + .5 - 3.2) / 2.2; if (dx * dx + dy * dy > 1) return null; return vM(WA, WB, (dy + 1) / 2); });
  vR(c, cx - 1, by - 48, 2, 6, vTc("#8a82c8")); vR(c, cx - 2, by - 51, 4, 3, vTc("#c8c0f4")); vR(c, cx - 1, by - 52, 2, 1, vTc("#ece8ff")); vR(c, cx - 2, by - 51, 1, 1, "#ffffff");
  /* water spilling from the bowl and splashing in the basin */
  for (const sx of [-12, 12]) { for (let j = by - 40; j < by - 21; j += 1) if ((j + (sx > 0 ? 1 : 0)) % 3 !== 0) vR(c, cx + sx, j, 1, 1, day ? "#e8f6ff" : "#bfeaff"); vR(c, cx + sx - 1, by - 22, 3, 1, "#e8f6ff");
    for (const [rr, a] of [[3, .7], [5, .35]]) for (let q = -rr; q <= rr; q++) { const yy = by - 21 + Math.round(Math.sqrt(Math.max(0, 1 - (q / rr) ** 2)) * rr * .32); vR(c, cx + sx + q, yy, 1, 1, `rgba(232,246,255,${a})`); } }
}

/* the dark spire of Pythona's tower, rising behind the north road */
function vFarTower(c, cx, base, k) {
  VT = [1, 1, 1];
  const L = vA(vmix("#4a3a8a", "#9aa4d4", k)), D = vA(vmix("#1e1448", "#5a6a9e", k)), top = base - 64, SP = 34;
  vPix(c, cx - 28, top - SP, 57, 64 + SP + 2, (i, j) => { const y = j - SP, xi = i - 28;
    if (y >= 0) { const wid = y > 14 ? 54 * (.55 + .45 * (1 - y / 64) ** .5) : 33; if (Math.abs(xi) > wid / 2) return null; const t = xi / (wid / 2); let p = vM(L, D, (t + 1) / 2 * .9); if ((((y / 6) | 0) + (((xi + 40) / 9) | 0)) % 2 === 0 && vh(xi, y, 3) > .25) p = vM(p, vA("#6a58b8"), .3); if (y % 6 === 5) p = vM(p, vDk, .4); return p; }
    const half = Math.max(0, Math.floor((1 - (-y) / SP) * 17)); if (Math.abs(xi) > half) return null; return vM(vA(vmix("#5a44a8", "#a8b0e0", k)), vA(vmix("#1a1040", "#6a76b0", k)), (xi + half) / Math.max(1, 2 * half)); });
  const ey = top + 18, col = k < .5 ? "#c06aff" : "#e8d8ff";
  for (let j = -6; j <= 6; j++) { const hw = Math.round(4 * Math.sqrt(1 - (j / 6.5) ** 2)); vR(c, cx - hw - 1, ey + j, hw * 2 + 2, 1, "#1a0a30"); vR(c, cx - hw, ey + j, hw * 2, 1, col); }
  vR(c, cx - 1, ey - 2, 2, 5, "#f0d8ff"); vR(c, cx - 10, top + 4, 3, 5, vmix("#8a4ad8", "#6a76b0", k)); vR(c, cx + 8, top + 34, 3, 5, vmix("#8a4ad8", "#6a76b0", k));
}

/* ---------- the language districts ---------- */
function vPlaster(c, x, y, w, h, base) {
  const B = vA(base);
  vPix(c, x, y, w, h, (i, j) => { let p = B; const n = vh(x + i, y + j, 31);
    if (n > .93) p = vM(p, [255, 255, 255], .12); else if (n < .07) p = vM(p, vDk, .12);
    if ((((j / 5) | 0) + ((i / 9) | 0)) % 7 === 0 && n > .5) p = vM(p, vDk, .06);
    p = vM(p, vDk, Math.max(0, (j - h * .7) / (h * .3)) * .22); if (i > w - 3) p = vM(p, vDk, .3); if (i < 2) p = vM(p, [255, 255, 255], .1); return p; });
}
function vTimber(c, x, y, w, h, col = "#5a3a22") { vR(c, x, y, w, h, vTc(col)); vR(c, x, y, w > h ? w : 1, w > h ? 1 : h, vTc(vmix(col, "#c89a6a", .35))); vR(c, w > h ? x : x + w - 1, w > h ? y + h - 1 : y, w > h ? w : 1, w > h ? 1 : h, vTc(vmix(col, "#000000", .45))); }
function vBrace(c, x0, y0, x1, y1, col) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) { const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n); vR(c, x, y, 2, 2, vTc(col)); } }
function vShutter(c, x, y, h, col) { vR(c, x, y, 3, h, vTc(col)); vR(c, x, y, 1, h, vTc(vmix(col, "#ffffff", .3))); for (let j = 2; j < h - 1; j += 3) vR(c, x + 1, y + j, 1, 1, vTc(vmix(col, "#000000", .4))); }
function vFlowerBox(c, x, y, w, cols) { vR(c, x, y, w, 4, vTc("#4a2f22")); vR(c, x, y, w, 1, vTc("#8a5a36")); for (let i = 0; i < w - 1; i += 2) { vR(c, x + 1 + i, y - 2, 1, 2, "#2f6a4a"); vR(c, x + 1 + i, y - 3, 1, 1, cols[(i >> 1) % cols.length]); } }
function vTier(c, cx, y, hw, h, c1, c2) {
  const A = vA(c1), B = vA(c2);
  vPix(c, cx - hw - 4, y, hw * 2 + 8, h, (i, j) => { const xi = i - hw - 4, half = hw + 3 - Math.round((h - j - 1) * .12); if (Math.abs(xi) > half) return null;
    let p = vM(A, B, j / h * .8 + vh((xi / 5) | 0, j, 4) * .2); if (j % 3 === 2) p = vM(p, vDk, .3); if (((xi + (((j / 3) | 0) % 2) * 3) % 6 + 6) % 6 === 0) p = vM(p, vDk, .3); if (j === 0) p = vM(p, [255, 255, 255], .25); if (xi < -half + 1) p = vM(p, vHi, .25); return p; });
}

function bHTML(c, cx, by, S) {
  const k = vSetLight(S), w = 78, x = cx - w / 2, wallH = 44, lit = S.open;
  vPlaster(c, x, by - wallH, w, wallH, "#e9d5a8");
  vTimber(c, x, by - wallH, 4, wallH); vTimber(c, x + w - 4, by - wallH, 4, wallH); vTimber(c, x, by - wallH, w, 3); vTimber(c, x, by - 23, w, 3); vTimber(c, cx - 14, by - wallH, 3, 21); vTimber(c, cx + 11, by - wallH, 3, 21);
  vBrace(c, x + 4, by - wallH + 3, cx - 14, by - 24, "#5a3a22"); vBrace(c, x + w - 4, by - wallH + 3, cx + 12, by - 24, "#5a3a22");
  vGable(c, cx, by - wallH - 30, w, 32, "#e0556a", "#a73a52", 7);
  vR(c, x - 7, by - wallH + 1, w + 14, 3, vTc("#5a3a22")); vR(c, x - 7, by - wallH + 1, w + 14, 1, vTc("#a8744a"));
  vStone(c, x + w - 20, by - wallH - 22, 9, 24, "#8a5a46", "#5a3a2a"); vR(c, x + w - 22, by - wallH - 25, 13, 3, vTc("#5a3a2a")); vR(c, x + w - 22, by - wallH - 25, 13, 1, vTc("#a87a62"));
  vPlaster(c, cx - 7, by - wallH - 21, 14, 14, "#e9d5a8"); vGable(c, cx, by - wallH - 29, 14, 9, "#e0556a", "#a73a52", 2); vWin(c, cx - 4, by - wallH - 18, 8, 8, lit, k);
  vShutter(c, x + 5, by - 37, 14, "#2f8a7a"); vShutter(c, x + 20, by - 37, 14, "#2f8a7a"); vWin(c, x + 8, by - 36, 11, 12, lit, k);
  vShutter(c, x + w - 20, by - 37, 14, "#2f8a7a"); vShutter(c, x + w - 5, by - 37, 14, "#2f8a7a"); vWin(c, x + w - 19, by - 36, 11, 12, lit, k);
  vFlowerBox(c, x + 6, by - 22, 16, ["#ff7ab8", "#ffd23f", "#9be07a"]); vFlowerBox(c, x + w - 22, by - 22, 16, ["#ffd23f", "#ff7ab8", "#c58bff"]);
  vDoor(c, cx, by, 14, 34, lit ? "open" : "locked");
  vSign(c, cx, by - 46, "HTML", "#fff0c0", "#b02a45");
}
function bCSS(c, cx, by, S) {
  const k = vSetLight(S), w = 80, x = cx - w / 2, wallH = 44, lit = S.open;
  vPlaster(c, x, by - wallH, w, wallH, "#f4e3f0");
  vTimber(c, x, by - wallH, 4, wallH, "#8a5a7a"); vTimber(c, x + w - 4, by - wallH, 4, wallH, "#8a5a7a"); vTimber(c, x, by - wallH, w, 3, "#8a5a7a");
  vGable(c, cx, by - wallH - 28, w, 30, "#2fb5a8", "#1f8a82", 7);
  vR(c, x - 6, by - wallH + 1, w + 12, 3, vTc("#6a4560"));
  vStone(c, x + w - 20, by - wallH - 18, 9, 20, "#9a6a86", "#6a4560"); vR(c, x + w - 22, by - wallH - 21, 13, 3, vTc("#6a4560"));
  vPlaster(c, cx - 6, by - wallH - 19, 12, 12, "#f4e3f0"); vWin(c, cx - 3, by - wallH - 17, 6, 8, lit, k);
  vR(c, cx - 1, by - wallH - 40, 1, 14, "#6a4560"); for (let i = 0; i < 6; i++) vR(c, cx + i - 3, by - wallH - 44 + (i < 2 || i > 3 ? 1 : 0), 1, 4, ["#ff6b81", "#ffa94d", "#ffd23f", "#9be07a", "#4dabf7", "#b197fc"][i]);   /* a paintbrush weathervane */
  const rb = ["#ff6b81", "#ffa94d", "#ffd23f", "#9be07a", "#4dabf7", "#b197fc"];
  for (let i = 0; i < 80; i += 1) { const col = rb[((i / 6) | 0) % 6], dip = (i % 6) === 2 || (i % 6) === 3 ? 2 : 0; for (let j = 0; j < 7 + dip; j++) vR(c, x + i, by - 27 + j, 1, 1, vTc(j > 5 ? vmix(col, "#0a0620", .3) : col)); vR(c, x + i, by - 28, 1, 1, vTc(vmix(col, "#ffffff", .35))); }
  vDoor(c, cx, by, 14, 28, lit ? "open" : "locked");
  vShutter(c, x + 5, by - 15, 12, "#4dabf7"); vWin(c, x + 8, by - 14, 10, 10, lit, k); vShutter(c, x + 19, by - 15, 12, "#4dabf7");
  vShutter(c, x + w - 21, by - 15, 12, "#ff6b81"); vWin(c, x + w - 18, by - 14, 10, 10, lit, k); vShutter(c, x + w - 7, by - 15, 12, "#ff6b81");
  [[x + 8, by - 38, "#ff6b81"], [x + 62, by - 36, "#4dabf7"], [x + 20, by - 34, "#ffd23f"], [x + 70, by - 40, "#9be07a"], [x + 40, by - 40, "#b197fc"]].forEach(([a, b, col]) => { vR(c, a, b, 4, 4, vTc(col)); vR(c, a + 1, b + 4, 2, 3, vTc(col)); vR(c, a + 1, b + 1, 1, 1, "#ffffff"); });
  vR(c, x - 8, by - 6, 7, 6, vTc("#8a5a36")); vR(c, x - 7, by - 12, 5, 6, "#ff6b81"); vR(c, x - 7, by - 14, 5, 2, "#ffd23f"); vR(c, x - 8, by - 6, 7, 1, vTc("#c89a6a"));
  vSign(c, cx, by - 52, "CSS", "#ffe6f7", "#7a2a8a");
}
function bCPP(c, cx, by, S) {
  const k = vSetLight(S), w = 82, x = cx - w / 2, wallH = 48, lit = S.open;
  vStone(c, x, by - wallH, w, wallH, "#546e82", "#2f4558");
  vGable(c, cx, by - wallH - 28, w, 30, "#4a8fd8", "#2c5a96", 6);
  vBeam(c, x - 5, by - wallH + 1, w + 10);
  vStone(c, x + 8, by - wallH - 26, 9, 28, "#3f5568", "#2e4252"); vR(c, x + 6, by - wallH - 29, 13, 3, vTc("#2e4252")); vR(c, x + 6, by - wallH - 29, 13, 1, vTc("#6a8aa0"));
  vShutter(c, x + 5, by - 39, 16, "#2c5a96"); vWin(c, x + 8, by - 38, 12, 14, lit, k); vShutter(c, x + 21, by - 39, 16, "#2c5a96");
  vShutter(c, x + w - 22, by - 39, 16, "#2c5a96"); vWin(c, x + w - 19, by - 38, 12, 14, lit, k); vShutter(c, x + w - 6, by - 39, 16, "#2c5a96");
  for (const [mx, my] of [[x + 3, by - 12], [x + w - 12, by - 8], [x + 30, by - 4]]) { vR(c, mx, my, 5, 2, "#2f6a4a"); vR(c, mx + 1, my - 1, 3, 1, "#3f8a5a"); }
  vDoor(c, cx, by, 14, 34, lit ? "open" : "locked");
  for (const lx of [cx - 17, cx + 15]) { vR(c, lx + 1, by - 36, 1, 5, "#1a1330"); vR(c, lx - 1, by - 31, 5, 7, "#1a1330"); vR(c, lx, by - 30, 3, 5, lit ? (k > .55 ? "#fff0c0" : "#ffd86a") : "#3a3a50"); }
  vSign(c, cx, by - 54, "C++", "#9fd0ff", "#17306a");
}
function bJS(c, cx, by, S) {
  const k = vSetLight(S), w = 92, x = cx - w / 2, wallH = 60, lit = S.open;
  vStone(c, x, by - wallH, w, wallH, "#b9a26a", "#7a6638");
  for (let i = 0; i < 9; i++) { vR(c, x + 14 + i * 7, by - wallH - 6, 5, 6, vTc("#c7b078")); vR(c, x + 14 + i * 7, by - wallH - 6, 5, 1, vTc("#e8d8a0")); }
  for (const dx of [-4, w - 12]) { vStone(c, x + dx, by - wallH - 14, 16, wallH + 14, "#c7b078", "#7a6638"); for (let i = 0; i < 4; i++) { vR(c, x + dx + i * 4, by - wallH - 19, 3, 5, vTc("#c7b078")); vR(c, x + dx + i * 4, by - wallH - 19, 3, 1, vTc("#e8d8a0")); } vR(c, x + dx + 7, by - wallH - 4, 2, 7, "#0a0620"); vR(c, x + dx + 7, by - wallH + 14, 2, 7, "#0a0620"); }
  vWin(c, cx - 22, by - 44, 8, 10, lit, k); vWin(c, cx + 14, by - 44, 8, 10, lit, k);
  vStone(c, cx - 14, by - 40, 28, 40, "#8f7a48", "#5a4a28");
  vDoor(c, cx, by, 18, 34, lit ? "open" : "locked");
  for (let i = -8; i <= 8; i += 4) vR(c, cx + i, by - 35, 1, 3, "#2a2a3c");
  vR(c, cx - 15, by - 41, 30, 2, vTc("#5a4a28")); vSign(c, cx, by - 54, "JS", "#ffe08a", "#6a4400");
}
function bPY(c, cx, by, S) {
  const k = vSetLight(S), w = 56, x = cx - w / 2, wallH = 66, lit = S.open;
  vStone(c, x - 18, by - 30, 18, 30, "#8a96a8", "#4a566e"); for (let i = 0; i < 3; i++) { vR(c, x - 18 + i * 7, by - 34, 5, 4, vTc("#8a96a8")); vR(c, x - 18 + i * 7, by - 34, 5, 1, vTc("#c3cddc")); }
  vStone(c, x, by - wallH, w, wallH, "#9aa6b8", "#4a566e");
  vR(c, x - 3, by - wallH, w + 6, 4, vTc("#4a566e")); vR(c, x - 3, by - wallH, w + 6, 1, vTc("#c3cddc")); vR(c, x - 4, by - 40, w + 8, 2, vTc("#4a566e"));
  for (let t = 0; t < 3; t++) { const hw = 30 - t * 8; vTier(c, cx, by - wallH - 10 - t * 8, hw, 9, "#3f9a52", "#1f6a34"); }
  vR(c, cx - 2, by - wallH - 36, 4, 8, vTc("#3f9a52")); vR(c, cx - 1, by - wallH - 42, 2, 6, "#ffd23f"); vR(c, cx - 3, by - wallH - 44, 6, 2, "#ffe88a");
  vWin(c, cx - 5, by - wallH + 8, 10, 14, lit, k); vWin(c, cx - 5, by - wallH + 30, 10, 12, false, k);
  vDoor(c, cx, by, 14, 34, lit ? "open" : "locked");
  for (const dx of [-26, 20]) { vR(c, cx + dx, by - 28, 5, 14, vTc("#4aa05a")); vR(c, cx + dx, by - 28, 1, 14, vTc("#8fe098")); vR(c, cx + dx + 1, by - 26, 3, 2, "#1f6a34"); vR(c, cx + dx + 1, by - 22, 3, 2, "#1f6a34"); }
  vSign(c, cx, by - 40, "PY", "#d8f5a0", "#1f5a24");
}
function vHouseSm(c, cx, by, wall, roof, k) {
  vSetLight({ st: k * 4 });
  const w = 52, x = cx - w / 2;
  vPlaster(c, x, by - 28, w, 28, wall); vTimber(c, x, by - 28, 3, 28); vTimber(c, x + w - 3, by - 28, 3, 28); vTimber(c, x, by - 28, w, 2);
  vGable(c, cx, by - 28 - 22, w, 24, roof, vmix(roof, "#000000", .35), 5); vBeam(c, x - 4, by - 27, w + 8);
  vStone(c, x + w - 14, by - 46, 7, 20, "#7a5a4a", "#4a3226");
  vWin(c, x + 6, by - 21, 9, 9, true, k); vWin(c, x + w - 15, by - 21, 9, 9, true, k);
  vR(c, cx - 4, by - 18, 8, 18, vTc("#5a3a22")); vR(c, cx - 4, by - 18, 8, 1, vTc("#3d2713")); vR(c, cx - 4, by - 18, 1, 18, vTc("#8a5a36")); vR(c, cx + 2, by - 9, 1, 1, "#ffd23f");
  vFlowerBox(c, x + 5, by - 10, 11, ["#ff7ab8", "#ffd23f", "#ffffff"]);
}
function vPine(c, x, by, h, col, col2) {
  VT = [1, 1, 1]; const L = vA(col), D = vA(col2), W = Math.ceil(h * .45) + 2, th = h / 3, step = h / 4.2;
  vR(c, x - 1, by - 5, 3, 5, "#3a261c");
  vPix(c, x - W, by - 4 - h, W * 2 + 1, Math.ceil(h * .8) + th, (i, j) => { const xi = i - W;
    for (let t = 3; t >= 0; t--) { const jj = j - Math.round(t * step); if (jj < 0 || jj >= th) continue; const hw = h * .22 * (t + 1.5) / 2.2, w2 = Math.round(hw * (jj + 1) / th); if (Math.abs(xi) > w2) continue;
      let p = vM(L, D, jj % 3 === 2 ? .85 : jj / th * .5); if (xi < -w2 * .35) p = vM(p, [255, 255, 255], .12); else if (xi > w2 * .45) p = vM(p, vDk, .25);
      const n = vh(x + xi, by + j, 41); if (n > .9) p = vM(p, [255, 255, 255], .1); else if (n < .08) p = vM(p, vDk, .25); if (jj === th - 1 || Math.abs(xi) === w2) p = vM(p, vDk, .18); return p; }
    return null; });
}
