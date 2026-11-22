/* Village painter: draws the whole street, hills and sky in pixel art onto small off-screen canvases (one pixel here = one pixel of art).
   The look changes with how many guardians you have beaten (0 to 4): storm night, dusk, twilight, dawn, sunrise. */

"use strict";

const VSW = 320, VSH = 200;
const VSKY = [
  ["#0b0822", "#150f3a", "#241752", "#35226b"],
  ["#150f45", "#2d1f66", "#5d3480", "#9a4f88"],
  ["#232272", "#4c4296", "#b25c96", "#ff9677"],
  ["#4056a0", "#8a74bc", "#ff9f86", "#ffd28a"],
  ["#4aa6ee", "#82c6f4", "#ffd7a0", "#fff1c0"]
];

const vhex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const vmix = (a, b, t) => { const A = vhex(a), B = vhex(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); };
const vrng = seed => () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;

const VFONT = {
  A:[".#.", "#.#", "###", "#.#", "#.#"], B:["##.", "#.#", "##.", "#.#", "##."], C:[".##", "#..", "#..", "#..", ".##"],
  D:["##.", "#.#", "#.#", "#.#", "##."], N:["#...#", "##..#", "#.#.#", "#..##", "#...#"], U:["#.#", "#.#", "#.#", "#.#", "###"],
  E:["###", "#..", "##.", "#..", "###"], F:["###", "#..", "##.", "#..", "#.."], G:[".##", "#..", "#.#", "#.#", ".##"], H:["#.#", "#.#", "###", "#.#", "#.#"], I:["###", ".#.", ".#.", ".#.", "###"],
  J:["..#", "..#", "..#", "#.#", ".#."], K:["#.#", "#.#", "##.", "#.#", "#.#"], L:["#..", "#..", "#..", "#..", "###"],
  M:["#...#", "##.##", "#.#.#", "#...#", "#...#"], O:[".#.", "#.#", "#.#", "#.#", ".#."], P:["##.", "#.#", "##.", "#..", "#.."],
  R:["##.", "#.#", "##.", "#.#", "#.#"], S:[".##", "#..", ".#.", "..#", "##."], T:["###", ".#.", ".#.", ".#.", ".#."],
  W:["#...#", "#...#", "#.#.#", "##.##", "#...#"], Y:["#.#", "#.#", ".#.", ".#.", ".#."], "+":["...", ".#.", "###", ".#.", "..."], " ":["..", "..", "..", "..", ".."]
};
const vTextW = t => t.split("").reduce((a, ch) => a + VFONT[ch][0].length + 1, -1);
function vText(c, t, cx, y, col) {
  let x = Math.round(cx - vTextW(t) / 2); c.fillStyle = col;
  for (const ch of t) { const g = VFONT[ch]; g.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] === "#") c.fillRect(x + i, y + j, 1, 1); }); x += g[0].length + 1; }
}

function vCanvas(w, h) { const cv = document.createElement("canvas"); cv.width = w; cv.height = h; const c = cv.getContext("2d"); c.imageSmoothingEnabled = false; return { cv, c }; }

/* Cache of sprites turned into little canvases, so each frame is just a drawImage. */
const vSprites = new WeakMap();
function vSprite(def) {
  let s = vSprites.get(def); if (s) return s;
  const h = def.px.length, w = def.px[0].length, o = vCanvas(w, h);
  def.px.forEach((row, y) => { for (let x = 0; x < w; x++) { const ch = row[x]; if (ch !== "." && def.pal[ch]) { o.c.fillStyle = def.pal[ch]; o.c.fillRect(x, y, 1, 1); } } });
  s = { cv:o.cv, w, h }; vSprites.set(def, s); return s;
}

/* ---------- little building blocks ---------- */
const vR = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };

function vBricks(c, x, y, w, h, c1, c2, seed, rowH = 4, bw = 8) {
  vR(c, x, y, w, h, c1); const rnd = vrng(seed);
  for (let j = 0, r = 0; j < h; j += rowH, r++) {
    vR(c, x, y + j, w, 1, c2);
    for (let i = (r % 2) * (bw / 2); i < w; i += bw) { vR(c, x + i, y + j, 1, rowH, c2); if (rnd() < .22) vR(c, x + i + 1, y + j + 1, bw - 2, 1, vmix(c1, "#ffffff", .1)); }
  }
}
function vPlanks(c, x, y, w, h, c1, c2) { vR(c, x, y, w, h, c1); for (let i = 0; i < w; i += 5) vR(c, x + i, y, 1, h, c2); vR(c, x, y + h - 1, w, 1, c2); }

function vWindow(c, x, y, w, h, lit, day) {
  vR(c, x - 1, y - 1, w + 2, h + 2, "#2a1a1a"); vR(c, x, y, w, h, lit ? (day ? "#c9ecff" : "#ffd86a") : "#1b2347");
  if (lit) { vR(c, x, y + h - 2, w, 2, day ? "#9ccbea" : "#f0a830"); vR(c, x + (w >> 1), y, 1, h, "#5a3a22"); vR(c, x, y + (h >> 1) - 1, w, 1, "#5a3a22"); }
  else { vR(c, x + 1, y + 1, 2, 1, "#4a5a9a"); vR(c, x + 1, y + 2, 1, 1, "#4a5a9a"); }
  vR(c, x - 2, y + h + 1, w + 4, 2, "#5a3a22");
}
function vArch(c, cx, by, w, h, col) {   /* an arched doorway shape: rectangle with a rounded top */
  const x0 = cx - (w >> 1), r = w / 2;
  vR(c, x0, by - h + r, w, h - r, col);
  for (let j = 0; j < r; j++) { const dx = Math.round(Math.sqrt(r * r - (r - j - .5) ** 2)); vR(c, cx - dx, by - h + j, dx * 2, 1, col); }
}
function vSign(c, cx, y, text, bg, fg, rim = "#2a1a1a") {
  const w = vTextW(text) + 6;
  vR(c, cx - (w >> 1) - 1, y - 1, w + 2, 11, rim); vR(c, cx - (w >> 1), y, w, 9, bg); vR(c, cx - (w >> 1), y, w, 1, vmix(bg, "#ffffff", .25));
  vText(c, text, cx + 0.5, y + 2, fg);
  vR(c, cx - (w >> 1) + 1, y + 9, 1, 2, rim); vR(c, cx + (w >> 1) - 2, y + 9, 1, 2, rim);
}

function vDoor(c, cx, by, w, h, st) {   /* st: "open" (warm light inside), "locked" (barred), */
  vR(c, cx - (w >> 1) - 2, by - h - 2, w + 4, h + 2, "#2a1a1a"); vArch(c, cx, by, w + 2, h + 1, "#3a2414");
  if (st === "locked") {
    vArch(c, cx, by, w, h, "#5a3a22");
    for (let i = -(w >> 1) + 2; i < (w >> 1); i += 4) vR(c, cx + i, by - h + 4, 1, h - 4, "#3d2713");
    vR(c, cx - (w >> 1), by - h * .62, w, 2, "#3a3a4c"); vR(c, cx - (w >> 1), by - h * .3, w, 2, "#3a3a4c");
    for (let i = 0; i < w; i++) { vR(c, cx - (w >> 1) + i, by - h * .85 + i * .9, 1, 2, "#7a7a92"); vR(c, cx + (w >> 1) - 1 - i, by - h * .85 + i * .9, 1, 2, "#6a6a82"); }
    vR(c, cx - 3, by - h * .5, 6, 5, "#ffd23f"); vR(c, cx - 2, by - h * .5 - 2, 4, 2, "#c99a10"); vR(c, cx - 2, by - h * .5 - 1, 1, 2, "#c99a10"); vR(c, cx + 1, by - h * .5 - 1, 1, 2, "#c99a10"); vR(c, cx - 1, by - h * .5 + 2, 2, 1, "#6a4a10");
  } else {
    vArch(c, cx, by, w, h, "#ffe9a8");
    for (let j = 0; j < h; j += 2) vR(c, cx - (w >> 1) + 1, by - j - 1, w - 2, 1, j % 4 ? "#fff3c8" : "#ffd86a");
    vR(c, cx - (w >> 1), by - 2, w, 2, "#c99a10");
    vR(c, cx - (w >> 1) - 1, by - h + 3, 3, h - 3, "#5a3a22"); vR(c, cx + (w >> 1) - 1, by - h + 3, 3, h - 3, "#5a3a22");
  }
  vR(c, cx - (w >> 1) - 3, by - 2, w + 6, 2, "#8a8aa0"); vR(c, cx - (w >> 1) - 3, by - 2, w + 6, 1, "#b8b8cc");
}

function vTriRoof(c, cx, by, w, h, c1, c2, over = 6) {
  for (let i = 0; i < h; i++) {
    const half = Math.round((w / 2 + over) * (i + 1) / h);
    vR(c, cx - half, by - h + i, half * 2, 1, i % 4 === 3 ? c2 : c1);
    if (i % 4 === 3) for (let k = -half; k < half; k += 4) vR(c, cx + k + ((i >> 2) % 2) * 2, by - h + i - 2, 1, 3, c2);
  }
  vR(c, cx - (w >> 1) - over, by - 2, w + over * 2, 2, vmix(c2, "#000000", .3));
  for (let i = 0; i < h; i++) { const half = Math.round((w / 2 + over) * (i + 1) / h); vR(c, cx - half, by - h + i, 1, 1, vmix(c1, "#ffffff", .3)); }
}

function vFlag(c, x, y, col, f) {
  vR(c, x, y, 1, 14, "#3d2713"); vR(c, x - 1, y - 1, 3, 2, "#ffd23f");
  const w = [6, 7, 7, 6][f & 3];
  for (let i = 0; i < w; i++) vR(c, x + 1 + i, y + 1 + Math.round(Math.sin(i * .9 + f * 1.4)), 1, 5 - (i > w - 3 ? 1 : 0), i < 2 ? vmix(col, "#ffffff", .15) : col);
}

/* ---------- the buildings ---------- */
/* ---------- decorations ---------- */
function vCrate(c, x, by, w = 10) { vR(c, x, by - w, w, w, "#a8744a"); vR(c, x, by - w, w, 1, "#c99a66"); vR(c, x, by - 1, w, 1, "#6a4528"); vR(c, x, by - w, 1, w, "#6a4528"); vR(c, x + w - 1, by - w, 1, w, "#6a4528"); for (let i = 0; i < w - 2; i++) vR(c, x + 1 + i, by - w + 1 + i, 1, 1, "#7a5230"); }
function vFlowers(c, x, by, rnd, n, st) {
  for (let i = 0; i < n; i++) { const fx = x + Math.round(rnd() * 24) - 12, fy = by - 1 - Math.round(rnd() * 2); vR(c, fx, fy, 1, 3, "#3f8a3a"); vR(c, fx, fy - 1, 1, 1, ["#ff7ab8", "#ffd23f", "#ffffff", "#c58bff"][Math.floor(rnd() * 4)]); }
}
function vAnvil(c) { vR(c, 2, 8, 14, 4, "#4a4458"); vR(c, 0, 5, 18, 4, "#6a6478"); vR(c, 0, 5, 18, 1, "#a8a2bc"); vR(c, 14, 6, 6, 2, "#6a6478"); vR(c, 5, 12, 8, 4, "#3a3448"); vR(c, 3, 16, 12, 2, "#2a2438"); }
