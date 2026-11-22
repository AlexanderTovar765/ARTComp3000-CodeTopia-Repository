/* The Python map: a straight walk along the roof of the castle. Level 1 is by the stair door and level 10 is the tower, seen from above,
   where Pythona waits. From the roof you look down on the kingdom far below. */

"use strict";

const ROOF = { startAlong:.07, first:.19, last:.88, wb:{ wide:15, tall:14 } };
const roofPos = (orient, i) => { const a = ROOF.first + i * (ROOF.last - ROOF.first) / 9; return orient === "tall" ? [50, +(100 * (1 - a)).toFixed(2)] : [+(100 * a).toFixed(2), 50]; };
const roofStart = orient => orient === "tall" ? [50, 97] : [7.5, 50];
WM.py = { wide:{ L:Array.from({ length:10 }, (_, i) => roofPos("wide", i)), start:roofStart("wide") }, tall:{ L:Array.from({ length:10 }, (_, i) => roofPos("tall", i)), start:roofStart("tall") } };

function wmPaintRoof(cv, orient){
  const { w, h } = WM_SIZE[orient], tall = orient === "tall"; cv.width = w; cv.height = h;
  const ctx = cv.getContext("2d"), img = ctx.createImageData(w, h), px = img.data, wb = ROOF.wb[orient], L = tall ? h : w;
  const set = (x, y, c) => { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= w || y >= h) return; const i = (y * w + x) * 4; px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; px[i + 3] = 255; };
  const SKY = [[10, 12, 34], [18, 20, 52], [28, 30, 70], [40, 40, 88]].map(c => c.map(v => v)), TOWER = ROOF.last;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const a = tall ? 1 - (y + .5) / h : (x + .5) / w, c = tall ? x + .5 - w / 2 : y + .5 - h / 2, ac = Math.abs(c), al = a * L, dth = (BAYER[(y & 3) * 4 + (x & 3)] + .5) / 16;
    const ds = Math.hypot((a - TOWER) * L, c), ang = Math.atan2(c, (a - TOWER) * L);
    let col;
    if (ac > wb + 5) {   /* far below: the kingdom in the dark, with clouds and a few lit windows */
      const n = wmFbm(x / 10, y / 10, 77), k = Math.max(0, Math.min(3, Math.floor(((ac - wb - 5) / (L * .3)) * 1.5 + n * 2.2 + dth * .6)));
      col = SKY[Math.min(3, k)];
      if (n > .62 && dth < .6) col = [70, 70, 110];
      if (wmH(x, y, 5) > .995) col = [255, 214, 120];
    } else if (ac > wb) {   /* parapet with merlons */
      const merlon = Math.floor(al / 5) % 2 === 0, outer = ac > wb + 2.5; col = outer ? (merlon ? [150, 150, 172] : [38, 36, 56]) : [110, 108, 134];
      if (!outer || merlon) col = ((x + y) & 3) === 0 ? col.map(v => v * .88) : col;
    } else {
      const row = Math.floor(al / 6), cc = Math.floor((c + wb) / 7), mortar = (al % 6) < 1 || ((c + wb + (row & 1) * 3.5) % 7) < 1;
      col = mortar ? [44, 42, 64] : ((cc + row) & 1 ? [92, 88, 120] : [84, 80, 110]);
      if (wmH(cc, row, 9) > .85) col = col.map(v => v * .86);
      if (ac < 3.6 && a > ROOF.startAlong && a < TOWER) col = ac < 2.2 ? ((x + y) & 7 ? [140, 34, 54] : [160, 48, 70]) : [206, 164, 66];
    }
    set(x, y, col);
  }
  /* torches along both walls */
  for (let i = 1; i < 9; i++) { const a = ROOF.first + (i - .5) * (ROOF.last - ROOF.first) / 9; [-1, 1].forEach(sd => { const x = tall ? w / 2 + sd * (wb - 1) : a * w, y = tall ? (1 - a) * h : h / 2 + sd * (wb - 1);
    set(x, y, [255, 214, 110]); set(x + (tall ? 0 : 0), y - 1, [255, 140, 50]); set(x, y + 1, [255, 140, 50]); }); }
  /* the stair door where you came up */
  { const a0 = ROOF.startAlong, cx = tall ? w / 2 : a0 * w, cy = tall ? (1 - a0) * h : h / 2;
    for (let dy = -7; dy <= 7; dy++) for (let dx = -7; dx <= 7; dx++) if (Math.abs(dx) <= 6 && Math.abs(dy) <= 6) set(cx + dx, cy + dy, (Math.abs(dx) === 6 || Math.abs(dy) === 6) ? [150, 150, 172] : [18, 12, 28]); }
  /* the tower seen from above: a round parapet with merlons around a dark slate roof and a faint red glow in the middle */
  { const cx = tall ? w / 2 : TOWER * w, cy = tall ? (1 - TOWER) * h : h / 2, R = tall ? 14 : 17;
    for (let dy = -R - 7; dy <= R + 7; dy++) for (let dx = -R - 7; dx <= R + 7; dx++) { const d = Math.hypot(dx, dy), a2 = Math.atan2(dy, dx);
      if (d <= R + 6.5 && d > R + 3) { const m = Math.floor((a2 + Math.PI) * 14 / (2 * Math.PI)) % 2 === 0; if (d > R + 4.8 && !m) set(cx + dx, cy + dy, [30, 28, 46]); else set(cx + dx, cy + dy, d > R + 4.8 ? [168, 168, 190] : [124, 122, 148]); }
      else if (d <= R + 3 && d > R) set(cx + dx, cy + dy, [96, 94, 120]);
      else if (d <= R) { const ring = Math.floor((R - d) / 3) & 1; let c2 = ring ? [58, 52, 90] : [46, 42, 76]; if (d < 7) c2 = [86, 24, 52]; if (d < 4) c2 = [150, 40, 70]; if (d < 2) c2 = [255, 120, 140]; set(cx + dx, cy + dy, c2); } }
    for (let k = 0; k < 6; k++) { const a2 = k * Math.PI / 3 + .3; for (let r = 7; r < R; r++) set(cx + Math.cos(a2) * r, cy + Math.sin(a2) * r, [30, 26, 56]); } }
  ctx.putImageData(img, 0, 0);
}
