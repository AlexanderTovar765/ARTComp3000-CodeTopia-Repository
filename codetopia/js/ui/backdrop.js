/* Pixel night-sky backdrop for the battle scene. */

"use strict";

/* ================= backdrop ================= */
function drawBackdrop(){
  const cv = $("#bg"), r = scene.getBoundingClientRect(); if (!r.width || !r.height) return;
  const T = THEMES[themeFor(S.lvl)];
  const hp = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--px-hero")) || 8;
  const cell = Math.max(3, Math.round(hp / 2));
  const W = Math.ceil(r.width / cell), H = Math.ceil(r.height / cell);
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d"), img = ctx.createImageData(W, H), u = new Uint32Array(img.data.buffer), cache = {};
  const col = h => cache[h] ?? (cache[h] = (() => { const n = parseInt(h.slice(1), 16); return ((255 << 24) | ((n & 255) << 16) | (n & 0xff00) | (n >> 16)) >>> 0; })());
  const set = (x, y, c) => { if (x >= 0 && y >= 0 && x < W && y < H) u[y * W + x] = col(c); };
  let seed = 20261018 + S.lvl * 7;
  const rand = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const GT = H - Math.round(H * 0.24);
  const SKY = T.sky, BAY = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
  for (let y = 0; y < GT; y++) {
    const f = Math.pow(y / (GT - 1), 1.1) * (SKY.length - 1), i = Math.min(SKY.length - 2, Math.floor(f)), fr = f - i;
    for (let x = 0; x < W; x++) set(x, y, fr > (BAY[(y & 3) * 4 + (x & 3)] + .5) / 16 ? SKY[i + 1] : SKY[i]);
  }
  for (let k = 0, n = Math.round(W * GT / 700); k < n; k++) {
    const x = Math.floor(rand() * W), y = Math.floor(rand() * GT * .6);
    set(x, y, rand() < .3 ? "#cdd7ff" : "#ffffff");
    if (rand() < .15) [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dx, dy]) => set(x + dx, y + dy, "#8f8fd0"));
  }
  const mx = Math.round(W * .5), my = Math.round(GT * (r.width < 700 ? .5 : .32)), R = Math.max(5, Math.round(GT * .1));
  for (let dy = -R - 4; dy <= R + 4; dy++) for (let dx = -R - 4; dx <= R + 4; dx++) {
    const d2 = dx * dx + dy * dy;
    if (d2 <= R * R) set(mx + dx, my + dy, ((dx + R * .35) ** 2 + (dy - R * .2) ** 2 > (R * .9) ** 2) ? "#e6cf9f" : "#fff1cf");
    else if (d2 <= (R + 3) * (R + 3) && ((mx + dx + my + dy) & 1) === 0) set(mx + dx, my + dy, "#5a4690");
  }
  [[-2,-2],[1,1],[-1,3]].forEach(([dx, dy]) => { set(mx + dx, my + dy, "#d9bf8a"); set(mx + dx + 1, my + dy, "#d9bf8a"); });
  const cloud = (cx, cy, w) => [[.45,"#7a55a8"],[.9,"#5d3f8f"],[1,"#4f3580"],[.7,"#4f3580"]].forEach(([f, c], j) => {
    const rw = Math.round(w * f), x0 = Math.round(cx - rw / 2); for (let x = 0; x < rw; x++) set(x0 + x, Math.round(cy) + j, c); });
  cloud(W * .2, GT * .36, 20); cloud(W * .78, GT * .28, 24); cloud(W * .36, GT * .58, 14); cloud(W * .64, GT * .6, 16);
  const wave = (x, ph) => .55 * Math.sin(x * .045 + ph) + .3 * Math.sin(x * .11 + ph * 2) + .15 * Math.sin(x * .23 + ph * 3);
  const ridge = (hgt, amp, ph, fill, edge) => { const tops = [];
    for (let x = 0; x < W; x++) { const top = GT - Math.round(hgt + amp * wave(x, ph)); tops.push(top);
      for (let y = top; y < GT; y++) set(x, y, fill); set(x, top, edge); if ((x & 1) === 0) set(x, top + 1, edge); }
    return tops; };
  ridge(GT * .3, GT * .1, 1.3, T.far, T.farE);
  const near = ridge(GT * .16, GT * .07, 4.1, T.near, T.nearE);
  for (let x = 4; x < W - 4; x += 7 + Math.floor(rand() * 9)) {
    const top = near[x], h = 5 + Math.floor(rand() * 4);
    for (let rr = 0; rr < h; rr++) { const hw = Math.floor(rr / 2); for (let dx = -hw; dx <= hw; dx++) set(x + dx, top - h + rr, T.tree); }
    set(x, top, T.trunk); set(x, top + 1, T.trunk);
  }
  const hash = (a, b) => ((a * 73856093) ^ (b * 19349663)) >>> 0;
  for (let x = 0; x < W; x++) if (rand() < .14) { set(x, GT - 1, "#5fb36e"); if (rand() < .35) set(x, GT - 2, "#5fb36e"); }
  for (let y = GT; y < H; y++) { const row = y - GT;
    for (let x = 0; x < W; x++) { let c;
      if (row === 0) c = "#8bd993"; else if (row === 1) c = "#5fb36e";
      else if (row < 4) { const q = rand(); c = q < .12 ? "#4a9b62" : q < .2 ? "#2f6650" : "#3d7d5d"; }
      else { const br = Math.floor((row - 4) / 5), iy = (row - 4) % 5, ox = (br & 1) * 5, bx = Math.floor((x + ox) / 10), ix = (x + ox) % 10;
        c = (iy === 4 || ix === 9) ? "#1a3032" : iy === 0 ? "#34605f" : ["#27494a","#2a4f4f","#244344"][hash(bx, br) % 3]; }
      set(x, y, c); } }
  ctx.putImageData(img, 0, 0);
}
