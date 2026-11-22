/* The JavaScript map: a spiral staircase inside the keep. Level 1 is by the door and each level winds closer to the centre,
   where level 10 stands on the top of the tower. */

"use strict";

const KEEP = {
  wide:{ cx:.5, cy:.48, rx:.30, ry:.34, wx:.41, wy:.47, tower:11 },
  tall:{ cx:.5, cy:.5, rx:.36, ry:.30, wx:.47, wy:.40, tower:12 }
};
/* a point on the spiral, u from 0 (level 1) to 9 (level 10, the middle of the tower top) */
function keepPos(orient, u){
  const k = KEEP[orient], t = Math.min(u, 8) / 8, s = Math.max(0, u - 8);
  const a = (90 - t * 630 - s * 78.75) * Math.PI / 180, f = (1 - .56 * t) * (1 - s * (1 - 0.001));
  return [+(100 * (k.cx + k.rx * f * Math.cos(a))).toFixed(2), +(100 * (k.cy + k.ry * f * Math.sin(a))).toFixed(2)];
}
const keepNodes = orient => Array.from({ length:10 }, (_, i) => keepPos(orient, i));
/* the stretch of path leading up to level i+1 (i = 0 is the walk from the door to level 1) */
function keepSegPts(orient, i){
  if (i === 0) return [KEEP_START, keepPos(orient, 0)];
  const out = []; for (let j = 0; j <= 10; j++) out.push(keepPos(orient, i - 1 + j / 10)); return out;
}
const KEEP_START = [50, 94];
const keepDense = orient => { let out = [KEEP_START]; for (let i = 1; i <= 9; i++) out = out.concat(keepSegPts(orient, i).slice(i === 1 ? 0 : 1)); return out; };
WM.js = { wide:{ L:keepNodes("wide"), start:KEEP_START }, tall:{ L:keepNodes("tall"), start:KEEP_START } };

function wmPaintKeep(cv, orient, pts){
  const { w, h } = WM_SIZE[orient], k = KEEP[orient]; cv.width = w; cv.height = h;
  const ctx = cv.getContext("2d"), img = ctx.createImageData(w, h), px = img.data;
  const set = (x, y, c) => { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= w || y >= h) return; const i = (y * w + x) * 4; px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; px[i + 3] = 255; };
  const cx = k.cx * w, cy = k.cy * h, Rx = k.wx * w, Ry = k.wy * h, near = pts.map(p => [p[0] * w / 100, p[1] * h / 100]);
  const pathDist = (x, y) => { let m = 1e9; for (let i = 0; i < near.length - 1; i++) { const [ax, ay] = near[i], [bx, by] = near[i + 1], dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy))); m = Math.min(m, Math.hypot(x - ax - dx * t, y - ay - dy * t)); } return m; };
  const GRASS = [[18, 42, 30], [26, 58, 38], [36, 76, 46]], FLOOR = [[70, 64, 92], [84, 78, 108], [98, 92, 124]], WALL = [[60, 60, 76], [98, 98, 118], [140, 140, 160]];
  const T = k.tower;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const ex = (x - cx) / Rx, ey = (y - cy) / Ry, e = Math.hypot(ex, ey), ang = Math.atan2(ey, ex), dth = (BAYER[(y & 3) * 4 + (x & 3)] + .5) / 16, n = wmFbm(x / 9, y / 9, 41);
    let col;
    if (e > 1.14) col = GRASS[Math.max(0, Math.min(2, Math.floor((n - .3) * 6 + dth)))];
    else if (e > 1) col = ((x + y + (y >> 2)) & 3) === 0 ? [112, 176, 230] : [56, 112, 184];
    else if (e > .93) { const merlon = Math.floor((ang + Math.PI) * 15 / (2 * Math.PI)) % 2 === 0; col = e > .975 && !merlon ? [44, 44, 56] : WALL[e > .975 ? 2 : ((x >> 2) + (y >> 2)) & 1 ? 1 : 0]; }
    else {
      const row = Math.floor(y / 5), u = x + (row & 1) * 6, mortar = (u % 12) < 1 || (y % 5) === 0;
      col = FLOOR[mortar ? 0 : 1 + (wmH(Math.floor(u / 12), row, 3) > .6 ? 1 : 0)];
      if (e > .86) col = col.map(v => v * .8);
      const pd = pathDist(x, y); if (pd < 4.2) col = pd < 3 ? ((x + y) & 7 ? [156, 36, 56] : [176, 52, 72]) : [214, 170, 70];
      const tr = Math.hypot((x - cx) / T, (y - cy) / (T * (k === KEEP.tall ? 1 : 1)));
      if (tr < 2.1 && tr >= 1.0) col = col.map(v => v * .55);
    }
    set(x, y, col);
  }
  /* torches on the wall */
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6 + .26, tx = cx + Math.cos(a) * Rx * .955, ty = cy + Math.sin(a) * Ry * .955; if (Math.abs(tx - cx) < 9 && ty > cy) continue; set(tx, ty, [255, 200, 90]); set(tx, ty - 1, [255, 130, 50]); set(tx, ty + 1, [90, 56, 36]); }
  /* the door and a plank bridge over the moat */
  for (let y = Math.floor(cy + Ry * .86); y < h; y++) for (let x = Math.floor(cx - 8); x <= cx + 8; x++) { const ey2 = (y - cy) / Ry; if (ey2 > 1.2 && y > cy + Ry * 1.2 + 2) continue; set(x, y, (y % 3 === 0) ? [86, 56, 36] : [120, 80, 50]); }
  for (let x = Math.floor(cx - 7); x <= cx + 7; x++) for (let y = Math.floor(cy + Ry * .86); y < Math.floor(cy + Ry * .96); y++) set(x, y, [20, 14, 28]);
  /* the top of the tower in the middle: a round parapet with merlons, a slate floor and a stair hole */
  for (let y = -T - 3; y <= T + 3; y++) for (let x = -T - 3; x <= T + 3; x++) {
    const d = Math.hypot(x, y), a = Math.atan2(y, x), px2 = cx + x, py2 = cy + y;
    if (d <= T + 2.5 && d > T - 1.5) { const m = Math.floor((a + Math.PI) * 12 / (2 * Math.PI)) % 2 === 0; if (d > T + .5 && !m) continue; set(px2, py2, d > T + .5 ? [168, 168, 188] : d > T - .5 ? [128, 128, 148] : [96, 96, 116]); }
    else if (d <= T - 1.5) set(px2, py2, (d < 3 ? [10, 8, 18] : d < T * .62 && (Math.floor(d) % 3 === 0) ? [86, 82, 112] : [58, 56, 84]));
  }
  ctx.putImageData(img, 0, 0);
}
