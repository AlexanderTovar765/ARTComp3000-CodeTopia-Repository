/* Pixel backdrops for the battle scene: a sunny plain for HTML, a dark forest at night for C++, and the inside of the kingdom
   (an armoury and a throne room) for JavaScript. The hero stands on the left and the foe on the right, so the middle and the edges stay calm. */

"use strict";

/* ================= backdrop ================= */
/* opts is only used by cutscenes: { cv, w, h, mode, dawn } paints a backdrop onto another canvas. */
function drawBackdrop(opts){
  opts = opts || {}; const cv = opts.cv || $("#bg"), r = opts.cv ? { width:opts.w, height:opts.h } : scene.getBoundingClientRect(); if (!r.width || !r.height) return;
  const hp = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--px-hero")) || 8;
  const cell = opts.cv ? Math.max(3, Math.round(Math.max(r.width / 230, 3))) : Math.max(3, Math.round(hp / 2));
  const W = Math.ceil(r.width / cell), H = Math.ceil(r.height / cell);
  cv.width = W; cv.height = H;
  const ctx = cv.getContext("2d"), img = ctx.createImageData(W, H), u = new Uint32Array(img.data.buffer), cache = {};
  const col = h => cache[h] ?? (cache[h] = (() => { const n = parseInt(h.slice(1), 16); return ((255 << 24) | ((n & 255) << 16) | (n & 0xff00) | (n >> 16)) >>> 0; })());
  const set = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < W && y < H) u[y * W + x] = col(c); };
  let seed = 20261018 + S.lvl * 7 + (TRK.id === "js" ? 99 : TRK.id === "cpp" ? 33 : TRK.id === "css" ? 55 : 0);
  const rand = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const GT = H - Math.round(H * 0.24), s = Math.max(.6, GT / 90), BAY = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
  const hash = (a, b) => ((a * 73856093) ^ (b * 19349663)) >>> 0;
  const rect = (x0, y0, x1, y1, c) => { for (let y = Math.round(y0); y <= Math.round(y1); y++) for (let x = Math.round(x0); x <= Math.round(x1); x++) set(x, y, c); };
  const circ = (cx, cy, rad, c) => { const R = Math.ceil(rad); for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) if (dx * dx + dy * dy <= rad * rad) set(cx + dx, cy + dy, c); };
  const grad = (y0, y1, pal) => { for (let y = y0; y < y1; y++) { const f = ((y - y0) / Math.max(1, y1 - y0 - 1)) * (pal.length - 1), i = Math.min(pal.length - 2, Math.floor(f)), fr = f - i;
    for (let x = 0; x < W; x++) set(x, y, fr > (BAY[(y & 3) * 4 + (x & 3)] + .5) / 16 ? pal[i + 1] : pal[i]); } };
  const wave = (x, ph) => .55 * Math.sin(x * .045 + ph) + .3 * Math.sin(x * .11 + ph * 2) + .15 * Math.sin(x * .23 + ph * 3);
  const ridge = (hgt, amp, ph, fill, edge) => { const tops = [];
    for (let x = 0; x < W; x++) { const top = GT - Math.round(hgt + amp * wave(x, ph)); tops.push(top);
      for (let y = top; y < GT; y++) set(x, y, fill); set(x, top, edge); if ((x & 1) === 0) set(x, top + 1, edge); }
    return tops; };
  const floorStones = (y0, base, mortar, hi, shades) => { for (let y = y0; y < H; y++) { const row = y - y0, br = Math.floor(row / 5), iy = row % 5, ox = (br & 1) * 5;
    for (let x = 0; x < W; x++) { const bx = Math.floor((x + ox) / 10), ix = (x + ox) % 10;
      set(x, y, (iy === 4 || ix === 9) ? mortar : iy === 0 ? hi : shades[hash(bx, br) % shades.length]); } } };

  const arena = S.lvl > NREAL, mode = opts.mode || (arena ? "cpp" : TRK.id === "py" ? (S.ruin ? "ruins" : S.lvl >= NREAL ? "tower" : "rampart") : TRK.id);
  if (mode === "html") {
    /* ---- sunny plains ---- */
    grad(0, GT, ["#2f86d8", "#4a9ce6", "#68b1ee", "#86c4f4", "#a6d6f8", "#c4e6fb", "#ddf3fd", "#f3fbff"]);
    const sx = Math.round(W * (.2 + .6 * rand())), sy = Math.round(GT * .24), SR = Math.max(5, Math.round(GT * .09));
    for (let dy = -SR * 2; dy <= SR * 2; dy++) for (let dx = -SR * 2; dx <= SR * 2; dx++) { const d = Math.hypot(dx, dy);
      if (d <= SR) set(sx + dx, sy + dy, d > SR - 1.5 ? "#ffd23f" : "#fff3a0"); else if (d <= SR * 1.7 && ((dx + dy) & 1) === 0) set(sx + dx, sy + dy, "#fff6c0"); else if (d <= SR * 2 && ((dx + dy) & 3) === 0 && d > SR * 1.4 && (Math.round(Math.atan2(dy, dx) * 4) % 2 === 0)) set(sx + dx, sy + dy, "#fff6c0"); }
    const puff = (cx, cy, w) => { const parts = [[0, 0, .3], [-.26, .06, .22], [.26, .06, .24], [.05, -.1, .24], [-.1, .05, .22]];
      parts.forEach(([ox, oy, rr]) => circ(Math.round(cx + ox * w), Math.round(cy + oy * w * .5), Math.max(2, Math.round(rr * w * .6)), "#ffffff"));
      for (let x = -w * .5; x <= w * .5; x++) { set(cx + x, cy + w * .13, "#dbe9f7"); if (((x | 0) & 1) === 0) set(cx + x, cy + w * .13 + 1, "#c8dcf0"); } };
    puff(W * .16, GT * .3, 22 * s + 8); puff(W * .8, GT * .22, 26 * s + 8); puff(W * .42, GT * .48, 16 * s + 6); puff(W * .66, GT * .52, 18 * s + 6);
    ridge(GT * .36, GT * .08, 2.2, "#a9c7e6", "#bcd6ef");
    ridge(GT * .26, GT * .09, 1.3, "#86c76e", "#a3dc87");
    const near = ridge(GT * .14, GT * .06, 4.1, "#5fae52", "#7fcb68");
    for (let x = 5; x < W - 5; x += 9 + Math.floor(rand() * 10)) {
      const top = near[x], cr = 3 + Math.floor(rand() * 2) + (s > 1 ? 1 : 0);
      rect(x, top - cr, x, top + 1, "#7a5430"); circ(x, top - cr * 2 + 1, cr + 1, "#2f8a3c"); circ(x - 1, top - cr * 2, cr - 1, "#4fb04e"); }
    for (let x = 0; x < W; x++) if (rand() < .2) { set(x, GT - 1, "#8ee06a"); if (rand() < .4) set(x, GT - 2, "#8ee06a"); }
    for (let y = GT; y < H; y++) { const row = y - GT; if (row > 3) break;
      for (let x = 0; x < W; x++) { let c = row === 0 ? "#a6ec70" : row === 1 ? "#72cc52" : (rand() < .15 ? "#4f9f3e" : rand() < .2 ? "#6ab94c" : "#5cae45");
        if (row >= 1 && row < 3 && rand() < .035) c = ["#ff7aa8", "#ffe14d", "#ffffff", "#b58cff"][Math.floor(rand() * 4)];
        set(x, y, c); } }
    floorStones(GT + 4, "", "#7a5a38", "#dcbc8c", ["#c9a273", "#c09a6b", "#b8925f"]);
  } else if (mode === "css") {
    /* ---- the sunlit forest: bright and green at the start, darker with every level as the C++ woods get closer ---- */
    const dk = opts.mode ? 0 : Math.max(0, Math.min(1, (S.lvl - 1) / 10));
    const mixc = (a, b, t) => { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16), m = sh => Math.round(((A >> sh) & 255) * (1 - t) + ((B >> sh) & 255) * t); return "#" + [16, 8, 0].map(sh => m(sh).toString(16).padStart(2, "0")).join(""); };
    const Dk = c => mixc(c, "#0a1c22", dk * .74);
    grad(0, GT, ["#3a9be0", "#5eb4ec", "#86c9f1", "#abdcf5", "#cdeefa", "#e8f8e0", "#f4f9c8", "#fff4b0"].map(c => mixc(c, "#2a2c64", dk * .6)));
    const sx = Math.round(W * (.2 + .6 * rand())), sy = Math.round(GT * .22), SR = Math.max(5, Math.round(GT * .08));
    for (let dy = -SR * 2; dy <= SR * 2; dy++) for (let dx = -SR * 2; dx <= SR * 2; dx++) { const d = Math.hypot(dx, dy);
      if (d <= SR) set(sx + dx, sy + dy, mixc(d > SR - 1.5 ? "#ffd23f" : "#fff3a0", "#ff9d4a", dk * .6)); else if (d <= SR * 1.6 && ((dx + dy) & 1) === 0) set(sx + dx, sy + dy, mixc("#fff6c0", "#ffb26b", dk * .6)); }
    const puff = (cx, cy, w) => { [[0, 0, .3], [-.26, .06, .22], [.26, .06, .24], [.05, -.1, .24]].forEach(([ox, oy, rr]) => circ(Math.round(cx + ox * w), Math.round(cy + oy * w * .5), Math.max(2, Math.round(rr * w * .6)), mixc("#ffffff", "#8a7aa8", dk * .6))); };
    puff(W * .14, GT * .3, 20 * s + 8); puff(W * .78, GT * .2, 24 * s + 8); puff(W * .5, GT * .42, 14 * s + 6);
    ridge(GT * .38, GT * .08, 2.2, Dk("#93c8b4"), Dk("#aadbc4"));
    const treeAt = (x, base, h, c1, c2, c3, trunk) => { const cr = Math.max(3, Math.round(h * .36)); rect(x - 1, base - Math.round(h * .5), x + 1, base, trunk);
      circ(x, base - Math.round(h * .68), cr, c1); circ(x - cr * .55, base - Math.round(h * .58), cr * .75, c1); circ(x + cr * .55, base - Math.round(h * .58), cr * .75, c1); circ(x - cr * .2, base - Math.round(h * .78), cr * .6, c2); circ(x + cr * .3, base - Math.round(h * .84), cr * .36, c3); };
    const far = ridge(GT * .26, GT * .07, 1.4, Dk("#6fb48a"), Dk("#88cca0"));
    for (let x = 4; x < W - 3; x += 6 + Math.floor(rand() * 6)) treeAt(x, far[x] + 2, Math.round((9 + rand() * 6) * s), Dk("#4a9a62"), Dk("#62b878"), Dk("#86d28e"), Dk("#5a4a34"));
    /* shafts of light: wide, soft and dithered */
    for (let k = 0; k < 4; k++) { const x0 = Math.floor(rand() * W * 1.1) - W * .1, wd = 5 + Math.floor(rand() * 6); for (let y = 0; y < GT; y++) for (let w = 0; w < wd; w++) { const x = Math.round(x0 + y * .4 + w); if (((x + y * 2) & 3) === 0) set(x, y, mixc("#fff6c0", "#6a6a88", dk * .5)); } }
    const near = ridge(GT * .12, GT * .05, 4.1, Dk("#4f9e4c"), Dk("#6cba5e"));
    for (let x = 6; x < W - 5; x += 9 + Math.floor(rand() * 9)) treeAt(x, near[x] + 2, Math.round((13 + rand() * 7) * s), Dk("#2f8a3c"), Dk("#4fb04e"), Dk("#7ed46a"), Dk("#6b4a2a"));
    [.05, .95].forEach(f => { const x = Math.round(W * f), h = Math.round(34 * s); treeAt(x, GT + 2, h, Dk("#25742f"), Dk("#3f9c44"), Dk("#6cc45a"), Dk("#5a3c20")); rect(x - 2, GT - Math.round(h * .5), x + 2, GT + 2, Dk("#5a3c20")); });
    for (let x = 0; x < W; x++) if (rand() < .22) { set(x, GT - 1, Dk("#8ee06a")); if (rand() < .4) set(x, GT - 2, Dk("#8ee06a")); }
    for (let y = GT; y < H; y++) { const row = y - GT; if (row > 3) break;
      for (let x = 0; x < W; x++) { let c = row === 0 ? "#a6ec70" : row === 1 ? "#72cc52" : (rand() < .15 ? "#4f9f3e" : rand() < .2 ? "#6ab94c" : "#5cae45");
        if (row >= 1 && row < 3 && rand() < .04) c = ["#ff7aa8", "#ffe14d", "#ffffff", "#b58cff"][Math.floor(rand() * 4)];
        set(x, y, Dk(c)); } }
    for (let y = GT + 4; y < H; y++) for (let x = 0; x < W; x++) { const n = hash(x >> 1, y >> 1) % 11; set(x, y, Dk(n === 0 ? "#6a4a2c" : n < 3 ? "#b8946a" : n < 6 ? "#a98560" : "#9c7a54")); }
    for (let k = 0; k < W / 5; k++) { const x = Math.floor(rand() * W), y = GT + 5 + Math.floor(rand() * Math.max(1, H - GT - 6)); rect(x, y, x + 1, y, Dk("#7a5a3a")); }
  } else if (mode === "rampart") {
    /* ---- the castle roof at dusk: battlements in front, the kingdom and the mountains behind ---- */
    grad(0, GT, ["#1a1545", "#2c2262", "#4b2f7c", "#7a4380", "#b25d7a", "#e0856e", "#f2a672", "#ffd08a"]);
    for (let k = 0, n = Math.round(W * GT / 900); k < n; k++) set(Math.floor(rand() * W), Math.floor(rand() * GT * .4), "#ffffff");
    const sx = Math.round(W * (.55 + .2 * rand())), sy = GT - Math.round(GT * .2);
    for (let dy = -22; dy <= 6; dy++) for (let dx = -26; dx <= 26; dx++) { const d = Math.hypot(dx, dy * 1.6); if (d <= 8 * s + 2 && sy + dy < GT) set(sx + dx, sy + dy, d > 8 * s ? "#ffb26b" : "#fff0b8"); else if (d <= 18 * s && ((dx + dy) & 1) === 0 && sy + dy < GT) set(sx + dx, sy + dy, "#f6a066"); }
    ridge(GT * .3, GT * .09, 2.4, "#4a2f78", "#5e3f90");
    const tops = ridge(GT * .2, GT * .06, 1.2, "#2b1d56", "#3b2a70");
    for (let x = 6; x < W - 6; x += 10 + Math.floor(rand() * 12)) { const top = tops[x], tw = 3 + Math.floor(rand() * 2), th = Math.round((14 + rand() * 14) * s);
      rect(x - tw, top - th, x + tw, top + 1, "#1c1340"); for (let r = 0; r < 6; r++) rect(x - tw - 1 + r, top - th - 1 - r, x + tw + 1 - r, top - th - 1 - r, "#2a1c58");
      set(x, top - th - 8, "#c9a23a"); rect(x, top - th - 8, x, top - th - 3, "#3a2a60"); set(x, top - Math.round(th * .6), "#ffd878"); set(x - 1, top - Math.round(th * .35), "#ffd878"); }
    for (let k = 0; k < W / 3; k++) { const x = Math.floor(rand() * W), y = GT - Math.floor(rand() * GT * .12); set(x, y, rand() < .5 ? "#ffd878" : "#ffb04a"); }
    for (let x = 0; x < W; x += 12) { rect(x, GT - Math.round(9 * s), x + 7, GT, "#6a6590"); rect(x, GT - Math.round(9 * s), x + 7, GT - Math.round(9 * s), "#9a95c0"); rect(x + 7, GT - Math.round(9 * s), x + 7, GT, "#4a4670"); }
    rect(0, GT - 1, W, GT, "#2a2748");
    for (let y = GT; y < H; y++) { const row = y - GT, br = Math.floor(row / 6), iy = row % 6;
      for (let x = 0; x < W; x++) { const bx = Math.floor((x + (br & 1) * 8) / 16), ix = (x + (br & 1) * 8) % 16; set(x, y, (iy === 5 || ix === 15) ? "#27233f" : iy === 0 ? "#8a85ac" : ((bx + br) & 1) ? "#625d85" : "#58537a"); } }
    [.05, .95].forEach(f => { const x = Math.round(W * f), y = GT - Math.round(14 * s); rect(x, y, x, y + 6 * s, "#4a3020"); circ(x, y - 2, 2 * s, "#ff9d2e"); circ(x, y - 2.5, s + .5, "#ffe27a"); });
  } else if (mode === "tower") {
    /* ---- the top of the tower in a storm ---- */
    grad(0, GT, ["#07060f", "#0d0a1e", "#181030", "#271642", "#3b1d52", "#56245e", "#7a2a62", "#a23a62"]);
    for (let b = 0; b < 5; b++) { const cy = Math.round(GT * (.08 + b * .1)), off = Math.floor(rand() * W);
      for (let x = 0; x < W; x++) { const hh = Math.round(3 * s + 4 * s * Math.abs(Math.sin((x + off) * .05 + b))); for (let y = 0; y < hh; y++) if (((x + y) & 1) === 0 || y < hh - 2) set(x, cy + y, y < 2 ? "#3a2a58" : "#150f28"); } }
    const bx = Math.round(W * (S.lvl % 2 ? .58 : .42)); let lx = bx, ly = Math.round(GT * .18);
    while (ly < GT - Math.round(GT * .12)) { const nx = lx + Math.round((rand() - .5) * 6 * s); for (let t = 0; t < 3 * s; t++) { set(Math.round(lx + (nx - lx) * t / (3 * s)), ly + t, "#fff7c2"); set(Math.round(lx + (nx - lx) * t / (3 * s)) + 1, ly + t, "#ffd96a"); } lx = nx; ly += Math.round(3 * s); if (rand() < .12) { for (let q = 0; q < 6 * s; q++) set(lx + q * .8, ly + q, "#ffd96a"); } }
    for (let dy = -10; dy <= 10; dy++) for (let dx = -16; dx <= 16; dx++) if (Math.hypot(dx / 1.6, dy) < 9 && ((bx + dx + ly + dy) & 3) === 0) set(bx + dx, Math.round(GT * .2) + dy, "#6a4a9a");
    for (let k = 0, n = Math.round(W * GT / 260); k < n; k++) { const x = Math.floor(rand() * W), y = Math.floor(rand() * GT); for (let q = 0; q < 3; q++) set(x - q, y + q * 2, "#5a6aa8"); }
    ridge(GT * .18, GT * .05, 3.3, "#120c24", "#1d1438");
    for (let x = 0; x < W; x += 12) { rect(x, GT - Math.round(10 * s), x + 7, GT, "#3a3454"); rect(x, GT - Math.round(10 * s), x + 7, GT - Math.round(10 * s), "#5a5478"); rect(x + 7, GT - Math.round(10 * s), x + 7, GT, "#26223a"); }
    rect(0, GT - 1, W, GT, "#1a1730");
    for (let y = GT; y < H; y++) { const row = y - GT, br = Math.floor(row / 6), iy = row % 6;
      for (let x = 0; x < W; x++) { const bx2 = Math.floor((x + (br & 1) * 8) / 16), ix = (x + (br & 1) * 8) % 16; set(x, y, (iy === 5 || ix === 15) ? "#14112a" : iy === 0 ? "#5a5478" : ((bx2 + br) & 1) ? "#3b3558" : "#342f50"); } }
    [.04, .96].forEach(f => { const x = Math.round(W * f), y = GT - Math.round(12 * s); rect(x - 2, y, x + 2, y + 5 * s, "#2a2438"); circ(x, y - 2, 3 * s, "#7a3bd6"); circ(x, y - 3, 1.6 * s, "#d8b0ff"); });
  } else if (mode === "ruins") {
    /* ---- the wrecked throne room: holes in the walls, rubble, a fallen pillar and a broken throne ---- */
    const wall = ["#3c3550", "#463d5c", "#342d48"], mort = "#201b32", hi = "#524868";
    for (let y = 0; y < GT; y++) { const row = Math.floor(y / 6), iy = y % 6, ox = (row & 1) * 7;
      for (let x = 0; x < W; x++) { const bx = Math.floor((x + ox) / 14), ix = (x + ox) % 14; set(x, y, (iy === 5 || ix === 13) ? mort : iy === 0 ? hi : wall[hash(bx, row) % 3]); } }
    const hole = (cx, cy, rx, ry) => { for (let y = -ry - 3; y <= ry + 3; y++) for (let x = -rx - 3; x <= rx + 3; x++) { const e = (x / rx) ** 2 + (y / ry) ** 2, j = (hash(cx + x, cy + y) % 7) / 7; if (e + j * .35 <= 1) { const yy = cy + y, f = Math.max(0, Math.min(1, yy / GT)); set(cx + x, yy, opts.dawn ? (f < .35 ? "#6aa6e0" : f < .6 ? "#a8cdf0" : f < .8 ? "#ffd9a0" : "#ffb26b") : f < .35 ? "#240f2e" : f < .6 ? "#4a1c44" : f < .8 ? "#7a2a4a" : "#c8504a"); } else if (e + j * .35 <= 1.35) set(cx + x, cy + y, "#1a1426"); } };
    hole(Math.round(W * .3), Math.round(GT * .3), Math.round(11 * s), Math.round(18 * s)); hole(Math.round(W * .74), Math.round(GT * .22), Math.round(9 * s), Math.round(14 * s));
    for (let k = 0, n = Math.round(W / 4); k < n; k++) { const x = Math.floor(rand() * W), y = Math.floor(rand() * GT * .85); set(x, y, opts.dawn ? "#fff3c8" : rand() < .5 ? "#ff9d4a" : "#ffd96a"); }
    /* the pillars: one standing and snapped, one fallen across the back */
    { const cx = Math.round(W * .06), pw = Math.round(4 * s) + 2; rect(cx - pw, Math.round(GT * .3), cx + pw, GT, "#5a5274"); rect(cx - pw, Math.round(GT * .3), cx - pw + 1, GT, "#7a7096"); rect(cx + pw - 1, Math.round(GT * .3), cx + pw, GT, "#3a3452");
      for (let q = -pw; q <= pw; q++) set(cx + q, Math.round(GT * .3) - ((hash(q + 9, 3) % 4)), "#5a5274"); }
    { const y0 = GT - Math.round(10 * s), x0 = Math.round(W * .38), x1 = Math.round(W * .66); for (let x = x0; x <= x1; x++) { const dy = Math.round((x - x0) * .08); rect(x, y0 + dy - 3 * s, x, y0 + dy + 3 * s, (x % 14 < 2) ? "#3a3452" : "#6a6288"); rect(x, y0 + dy - 3 * s, x, y0 + dy - 3 * s, "#8a82aa"); } }
    /* the broken throne */
    { const cx = Math.round(W * .52), by = GT - Math.round(4 * s), tw = Math.round(7 * s);
      rect(cx - tw, by - 5 * s, cx + tw, by, "#6a2030"); rect(cx - tw - 2, by - 5 * s, cx - tw, by, "#c9a23a"); rect(cx + tw, by - 3 * s, cx + tw + 2, by, "#c9a23a");
      for (let y = 0; y < 22 * s; y++) { const half = tw - Math.floor(y / (6 * s)) * 2 + (hash(y, 4) % 3 - 1); rect(cx - tw, by - 5 * s - y, cx - tw + 3 + (y > 14 * s ? 0 : 2 * s), by - 5 * s - y, "#8a1f32"); if (y < 14 * s) rect(cx - tw + 3, by - 5 * s - y, cx - 1, by - 5 * s - y, "#8a1f32"); }
      rect(cx - tw - 1, by - 5 * s - 22 * s, cx - tw + 1, by - 5 * s - 14 * s, "#c9a23a"); }
    /* torn banners */
    [.18, .84].forEach((f, k) => { const bx2 = Math.round(W * f), len = Math.round((k ? 20 : 26) * s); for (let y = 2; y < len; y++) { const half = Math.round(3 * s) + 1 - (y > len - 6 ? y - (len - 6) : 0) + (hash(y, k) % 2); for (let x = -half; x <= half; x++) if (!(y > len * .5 && (x + y + k) % 5 === 0)) set(bx2 + x, y, Math.abs(x) === half ? "#c9a23a" : "#7a1a2a"); } });
    /* the floor: cracked flagstones, a torn carpet, rubble and dust */
    for (let y = GT; y < H; y++) { const row = y - GT, br = Math.floor(row / 6), iy = row % 6;
      for (let x = 0; x < W; x++) { const bx2 = Math.floor((x + (br & 1) * 8) / 16), ix = (x + (br & 1) * 8) % 16; let c = (iy === 5 || ix === 15) ? "#150f26" : iy === 0 ? "#5c5278" : ((bx2 + br) & 1) ? "#40385a" : "#383250";
        if (row >= 4 && row <= Math.round((H - GT) * .62)) { c = (row === 4 || row === Math.round((H - GT) * .62)) ? "#a8842a" : ((x + row) & 7) === 0 ? "#8a2438" : "#6e1a2c"; if (hash(x >> 3, row >> 2) % 5 === 0) c = "#40385a"; }
        set(x, y, c); } }
    for (let k = 0; k < 7; k++) { const x0 = Math.floor(rand() * W), y0 = GT + 2 + Math.floor(rand() * (H - GT - 6)); let x = x0, y = y0; for (let t = 0; t < 10 * s; t++) { set(x, y, "#0e0a1c"); x += rand() < .5 ? 1 : 0; y += Math.floor(rand() * 3) - 1; } }
    const rubble = (cx, cy, n) => { for (let k = 0; k < n; k++) { const rx = cx + Math.round((rand() - .5) * 16 * s), ry = cy + Math.round((rand() - .5) * 5 * s), sz = 2 + Math.floor(rand() * 4 * s / 2); rect(rx, ry, rx + sz, ry + sz - 1, "#6a6288"); rect(rx, ry, rx + sz, ry, "#948cb4"); rect(rx + sz, ry, rx + sz, ry + sz - 1, "#3a3452"); rect(rx, ry + sz - 1, rx + sz, ry + sz - 1, "#2a2440"); } };
    rubble(Math.round(W * .12), GT + 6, 9); rubble(Math.round(W * .5), GT - 2, 8); rubble(Math.round(W * .9), GT + 8, 10); rubble(Math.round(W * .3), GT + Math.round((H - GT) * .75), 6); rubble(Math.round(W * .74), GT + Math.round((H - GT) * .8), 6);
    for (let k = 0; k < W; k++) if (rand() < .25) { const y = GT - 4 + Math.floor(rand() * 8); set(k, y, "#8a8aa8"); }

  } else if (mode === "road") {
    /* ---- the carriage road on a stormy night, under a sickly green moon ---- */
    grad(0, GT, ["#03050a", "#07101a", "#0e1c26", "#16303a", "#1f4448", "#2c5a58"]);
    const mx = Math.round(W * .76), my = Math.round(GT * .2), MR = Math.max(6, Math.round(GT * .1));
    circ(mx, my, MR + 5, "#1c3a3c"); circ(mx, my, MR + 2, "#2a4e4e"); circ(mx, my, MR, "#cfe8d2"); circ(mx - 2, my - 1, Math.max(2, MR - 3), "#eaf8e6"); circ(mx + 3, my + 2, 2, "#b0ccb4");
    for (let b = 0; b < 6; b++) { const cy = Math.round(GT * (.05 + b * .09)), off = Math.floor(rand() * W);
      for (let x = 0; x < W; x++) { const hh = Math.round(2 * s + 3 * s * Math.abs(Math.sin((x + off) * .045 + b))); for (let y = 0; y < hh; y++) if (((x + y) & 1) === 0 || y < hh - 1) set(x, cy + y, y < 1 ? "#2c4a4e" : "#0a1218"); } }
    ridge(GT * .22, GT * .07, 2.1, "#0a141a", "#122028"); ridge(GT * .12, GT * .05, 5.2, "#060c10", "#0c161c");
    [.05, .15, .87, .96].forEach((f, i) => { const x0 = Math.round(W * f), base = GT - 1, h = Math.round((24 + (i % 2) * 12) * s / 1.2);
      rect(x0, base - h, x0 + 1, base, "#04080c");
      for (let b = 0; b < 6; b++) { const by = base - h + Math.round(b * h / 7), dir = (b + i) % 2 ? 1 : -1, len = Math.round((5 + (b % 3) * 3) * s / 1.2);
        for (let k = 0; k < len; k++) { set(x0 + dir * k, by - Math.round(k * .6), "#04080c"); if (k > len * .55) set(x0 + dir * k, by - Math.round(k * .6) - 2, "#04080c"); } } });
    for (let y = GT; y < H; y++) { const t = (y - GT) / Math.max(1, H - GT - 1), half = Math.round(W * (.08 + .42 * t)), c0 = Math.round(W * .5 + W * .07 * Math.sin(t * 3));
      for (let x = 0; x < W; x++) { const n = hash(x, y) % 11, inRoad = Math.abs(x - c0) < half; set(x, y, inRoad ? (n < 1 ? "#3e5054" : n < 3 ? "#2a3a40" : "#1c2a30") : (n < 2 ? "#10201a" : "#0a1510")); } }
    for (let k = 0; k < 5; k++) { const y = GT + Math.round((H - GT) * (.25 + .15 * k)), x = Math.round(W * (.35 + .1 * k)), wd = Math.round(8 + 3 * k); rect(x, y, x + wd, y, "#3a5a62"); rect(x + 2, y + 1, x + wd - 2, y + 1, "#26424a"); }
    for (let k = 0, n = Math.round(W * H / 90); k < n; k++) { const x = Math.floor(rand() * W), y = Math.floor(rand() * H); for (let q = 0; q < 3; q++) set(x - q, y + q * 2, "#7a9aa8"); }
  } else if (mode === "manor") {
    /* ---- the mansion at night: towers, one lit window, iron fence, mist ---- */
    grad(0, GT, ["#04030a", "#0a0716", "#140c24", "#221238", "#321a48", "#44225a"]);
    const mox = Math.round(W * .14), moy = Math.round(GT * .2), MR = Math.max(6, Math.round(GT * .11));
    circ(mox, moy, MR + 5, "#2a1c46"); circ(mox, moy, MR + 2, "#3a2a5e"); circ(mox, moy, MR, "#e6def2"); circ(mox - 2, moy - 1, Math.max(2, MR - 3), "#f6f2fc"); circ(mox + 3, moy + 3, 2, "#c8bedc");
    for (let b = 0; b < 5; b++) { const cy = Math.round(GT * (.06 + b * .1)), off = Math.floor(rand() * W);
      for (let x = 0; x < W; x++) { const hh = Math.round(2 * s + 3 * s * Math.abs(Math.sin((x + off) * .05 + b))); for (let y = 0; y < hh; y++) if (((x + y) & 1) === 0 || y < hh - 1) set(x, cy + y, y < 1 ? "#3a2a58" : "#120c22"); } }
    { let lx = Math.round(W * .86), ly = 0; while (ly < GT * .42) { const nx = lx + Math.round((rand() - .5) * 6); for (let t = 0; t < 4; t++) { set(Math.round(lx + (nx - lx) * t / 4), ly + t, "#f4f0ff"); set(Math.round(lx + (nx - lx) * t / 4) + 1, ly + t, "#a898d8"); } lx = nx; ly += 4; } }
    const mx0 = Math.round(W * .24), mw = Math.round(W * .52), top = Math.round(GT * .34), cxm = mx0 + Math.round(mw / 2), stone = "#1a1428", edge = "#2c2244", roof = "#0e0a1a";
    const tower = (x0, w, t0) => { rect(x0, t0, x0 + w, GT, stone); rect(x0, t0, x0, GT, edge); rect(x0 + w, t0, x0 + w, GT, "#10101e");
      for (let k = 0; k < w + 6; k++) { const rr = Math.round(k * (w * .9) / (w + 6)); rect(x0 - 3 + k, t0 - Math.round(w * 1.4) + Math.abs(k - (w + 6) / 2) * 1.3, x0 - 3 + k, t0, roof); }
      rect(x0 + Math.round(w / 2), t0 - Math.round(w * 1.4) - 4, x0 + Math.round(w / 2), t0 - Math.round(w * 1.4), "#2a2040"); };
    rect(mx0, top, mx0 + mw, GT, stone); rect(mx0, top, mx0 + mw, top, edge); rect(mx0, top + 1, mx0 + mw, top + 1, "#221a38");
    for (let k = 0; k < mw / 2 + 6; k++) rect(mx0 - 3 + k * 2, top - Math.round(18 * s / 1.3) + Math.abs(k * 2 - mw / 2 - 3) * .5, mx0 - 2 + k * 2, top - 1, roof);
    tower(mx0 - Math.round(12 * s), Math.round(16 * s), top - Math.round(8 * s)); tower(mx0 + mw - Math.round(4 * s), Math.round(16 * s), top - Math.round(8 * s));
    const wins = []; for (let row = 0; row < 3; row++) for (let col = 0; col < 7; col++) { const wx = mx0 + 8 + Math.round(col * (mw - 18) / 6), wy = top + 8 + row * Math.round(12 * s / 1.2); if (Math.abs(wx - cxm) < Math.round(10 * s) && row === 2) continue; wins.push([wx, wy, col, row]); }
    wins.forEach(([wx, wy, col, row]) => { const lit = (col === 2 && row === 0) || (col === 5 && row === 1); const ww = Math.max(3, Math.round(3 * s / 1.2)), wh = Math.max(5, Math.round(6 * s / 1.2));
      rect(wx, wy, wx + ww, wy + wh, lit ? "#e8c860" : "#07050e"); rect(wx - 1, wy + wh + 1, wx + ww + 1, wy + wh + 1, edge); if (lit) { rect(wx + Math.round(ww / 2), wy, wx + Math.round(ww / 2), wy + wh, "#5a4018"); rect(wx, wy + Math.round(wh / 2), wx + ww, wy + Math.round(wh / 2), "#5a4018"); } else rect(wx, wy, wx, wy + wh, "#1c1830"); });
    const dw = Math.round(7 * s / 1.2), dh = Math.round(18 * s / 1.2);
    rect(cxm - dw - 2, GT - dh - 2, cxm + dw + 2, GT, "#10101e"); rect(cxm - dw, GT - dh, cxm + dw, GT, "#0a0610"); for (let dx = -dw; dx <= dw; dx++) { const aa = Math.round(Math.sqrt(Math.max(0, dw * dw - dx * dx)) * .7); rect(cxm + dx, GT - dh - aa, cxm + dx, GT - dh, "#0a0610"); }
    for (let y = GT - dh; y < GT; y++) for (let dx = -dw + 2; dx <= dw - 2; dx++) if (((cxm + dx + y) & 1) === 0) set(cxm + dx, y, "#7a5a20");
    rect(cxm, GT - dh - 3, cxm, GT, "#0a0610"); circ(cxm - 2, GT - Math.round(dh / 2), 1, "#d8b050"); circ(cxm + 2, GT - Math.round(dh / 2), 1, "#d8b050");
    for (let k = 0; k < 5; k++) rect(cxm - dw - 3 - k, GT - 4 + Math.min(4, k), cxm + dw + 3 + k, GT, "#241c38");
    for (let x = 0; x < W; x += 4) { rect(x, GT - Math.round(9 * s / 1.2), x, GT, "#0a0812"); set(x, GT - Math.round(9 * s / 1.2) - 1, "#0a0812"); set(x - 1, GT - Math.round(9 * s / 1.2), "#0a0812"); set(x + 1, GT - Math.round(9 * s / 1.2), "#0a0812"); }
    rect(0, GT - Math.round(7 * s / 1.2), W, GT - Math.round(7 * s / 1.2), "#14101e"); rect(0, GT - 3, W, GT - 3, "#14101e");
    floorStones(GT, "#0e0a18", "#1e1830", "#3a3256", ["#241e3a", "#2a2342", "#201a34"]);
    for (let y = GT - 14; y < GT + 5; y++) for (let x = 0; x < W; x++) if (((x * 3 + y * 7 + hash(x >> 2, y)) % 9) === 0) set(x, y, "#4a4a6a");
    for (let k = 0; k < 5; k++) { const bx = Math.round(W * (.55 + k * .08)), by = Math.round(GT * (.12 + (k % 3) * .06)); set(bx, by, "#04030a"); set(bx - 1, by - 1, "#04030a"); set(bx + 1, by - 1, "#04030a"); set(bx - 2, by - 2, "#04030a"); set(bx + 2, by - 2, "#04030a"); }
  } else if (mode === "cpp") {
    /* ---- dark forest at night ---- */
    grad(0, GT, ["#03060d", "#050c16", "#08131f", "#0c1b28", "#102535", "#163246", "#1d4056", "#27526a"]);
    for (let k = 0, n = Math.round(W * GT / 600); k < n; k++) { const x = Math.floor(rand() * W), y = Math.floor(rand() * GT * .55); set(x, y, rand() < .3 ? "#cfe0ff" : "#ffffff"); }
    const mx = Math.round(W * (.3 + .4 * rand())), my = Math.round(GT * .22), MR = Math.max(4, Math.round(GT * .075));
    for (let dy = -MR - 4; dy <= MR + 4; dy++) for (let dx = -MR - 4; dx <= MR + 4; dx++) { const d2 = dx * dx + dy * dy;
      if (d2 <= MR * MR) set(mx + dx, my + dy, ((dx + MR * .4) ** 2 + (dy - MR * .1) ** 2 > (MR * .92) ** 2) ? "#b9cbe0" : "#eef4ff");
      else if (d2 <= (MR + 3) ** 2 && ((mx + dx + my + dy) & 1) === 0) set(mx + dx, my + dy, "#2a4766"); }
    [[-2, -1], [1, 2]].forEach(([dx, dy]) => { set(mx + dx, my + dy, "#a2b6cc"); set(mx + dx + 1, my + dy, "#a2b6cc"); });
    const pines = (hgt, amp, ph, fill, edge, gap, minH, maxH) => { const tops = ridge(hgt * .6, amp, ph, fill, edge);
      for (let x = 1; x < W; x += gap + Math.floor(rand() * gap)) { const top = tops[Math.min(W - 1, x)], h = minH + Math.floor(rand() * (maxH - minH));
        for (let rr = 0; rr < h; rr++) { const hw = Math.floor(rr * .38) + ((rr % 4 === 3) ? 1 : 0); for (let dx = -hw; dx <= hw; dx++) set(x + dx, top - h + rr + 2, fill); }
        set(x, top - h + 1, edge); }
      return tops; };
    const fog = (y0, c) => { for (let y = y0; y < y0 + 4; y++) for (let x = 0; x < W; x++) if (((x + y * 2) & 3) < (y - y0 < 2 ? 2 : 1)) set(x, y, c); };
    pines(GT * .5, GT * .08, 1.1, "#0d2230", "#16384a", 5, 9 * s, 16 * s);
    fog(GT - Math.round(GT * .3), "#1f4256");
    pines(GT * .34, GT * .08, 2.7, "#0a1a26", "#122e3d", 6, 12 * s, 22 * s);
    fog(GT - Math.round(GT * .17), "#173549");
    const nearT = pines(GT * .2, GT * .06, 4.4, "#06121b", "#0d2432", 8, 18 * s, 30 * s);
    if (S.lvl >= 5) for (let k = 0; k < 2; k++) { const x = Math.floor(W * (.1 + .8 * rand())), y = nearT[Math.min(W - 1, x)] - Math.round(10 * s); set(x, y, "#ff4a3a"); set(x + 3, y, "#ff4a3a"); }
    for (let k = 0; k < 10; k++) { const x = Math.floor(rand() * W), y = Math.floor(GT * (.55 + .4 * rand())); set(x, y, "#d4ff7a"); set(x + 1, y, "#6f9a3a"); set(x, y + 1, "#3d5c24"); }
    for (let y = GT; y < H; y++) { const row = y - GT; if (row > 3) break;
      for (let x = 0; x < W; x++) set(x, y, row === 0 ? "#3a6b49" : row === 1 ? "#2b5238" : (rand() < .15 ? "#1d3f2c" : rand() < .1 ? "#4a3a24" : "#183626")); }
    for (let x = 0; x < W; x++) if (rand() < .16) { set(x, GT - 1, "#2e5a3e"); }
    floorStones(GT + 4, "", "#0c1514", "#3d5250", ["#25312f", "#2a3836", "#202b29"]);
  } else {
    /* ---- inside the kingdom: an armoury or a throne room ---- */
    const throne = [4, 5, 8, 9, 10].includes(S.lvl);
    const wall = ["#4a4160", "#554b6c", "#40385a"], mort = "#2a2440", hi = "#62577e";
    for (let y = 0; y < GT; y++) { const row = Math.floor(y / 6), iy = y % 6, ox = (row & 1) * 7, dark = Math.max(0, 1 - y / (GT * .8));
      for (let x = 0; x < W; x++) { const bx = Math.floor((x + ox) / 14), ix = (x + ox) % 14;
        let c = (iy === 5 || ix === 13) ? mort : iy === 0 ? hi : wall[hash(bx, row) % 3];
        if (dark > 0 && ((x + y) & 1) === 0 && dark * 3 > 1.2 + (BAY[(y & 3) * 4 + (x & 3)] / 16)) c = mort; set(x, y, c); } }
    const torch = (x, y) => { rect(x, y, x, y + 5 * s, "#4a3020"); rect(x - 1, y - 1, x + 1, y, "#6a6a7a"); circ(x, y - 3 * s, 2 * s, "#ff9d2e"); circ(x, y - 3.5 * s, 1 * s + .5, "#ffe27a");
      for (let dy = -12 * s; dy <= 10 * s; dy++) for (let dx = -12 * s; dx <= 12 * s; dx++) if (Math.hypot(dx, dy) < 11 * s && Math.hypot(dx, dy) > 3 * s && ((x + dx + y + dy) & 3) === 0) set(x + dx, y - 3 * s + dy, "#6a5a6c"); };
    const arch = (cx, top, wd, ht, fillTop, fillBot) => { const hw = wd / 2; for (let y = 0; y < ht; y++) { const half = y < hw ? Math.sqrt(Math.max(0, hw * hw - (hw - y) ** 2)) : hw;
      for (let x = -Math.round(half); x <= Math.round(half); x++) set(cx + x, top + y, (y / ht) < .5 ? fillTop : fillBot); }
      for (let y = 0; y < ht; y++) { const half = y < hw ? Math.sqrt(Math.max(0, hw * hw - (hw - y) ** 2)) : hw; set(cx - Math.round(half) - 1, top + y, "#8a7fa8"); set(cx + Math.round(half) + 1, top + y, "#8a7fa8"); }
      rect(cx, top + 2, cx, top + ht - 1, mort); rect(cx - hw, top + Math.round(ht * .45), cx + hw, top + Math.round(ht * .45), mort); };
    const pillar = (cx) => { const pw = Math.round(4 * s) + 2; rect(cx - pw, 0, cx + pw, GT, "#6c6486"); rect(cx - pw, 0, cx - pw + 1, GT, "#8b82a8"); rect(cx + pw - 1, 0, cx + pw, GT, "#4b4562");
      for (let y = 0; y < GT; y += 4) set(cx, y, "#7b7298"); rect(cx - pw - 2, 0, cx + pw + 2, 3 * s, "#80779c"); rect(cx - pw - 2, GT - 4 * s, cx + pw + 2, GT, "#80779c"); };
    const banner = (cx, len, c1, c2) => { const bw = Math.round(5 * s) + 1; rect(cx - bw - 1, 2, cx + bw + 1, 3, "#c9a23a");
      for (let y = 4; y < len; y++) { const half = y > len - bw ? Math.max(0, bw - (y - (len - bw))) : bw; for (let x = -half; x <= half; x++) set(cx + x, y, Math.abs(x) === half ? c2 : c1); }
      const my = Math.round(len * .4); rect(cx - 1, my - 3, cx + 1, my + 3, "#e0b040"); rect(cx - 3, my, cx + 3, my, "#e0b040"); };
    if (throne) {
      pillar(Math.round(W * .06)); pillar(Math.round(W * .94));
      [.24, .76].forEach(f => { const cx = Math.round(W * f), wd = Math.round(10 * s) + 2, ht = Math.round(GT * .52); arch(cx, Math.round(GT * .12), wd, ht, "#9fd4ff", "#d6efff"); });
      torch(Math.round(W * .13), Math.round(GT * .42)); torch(Math.round(W * .87), Math.round(GT * .42));
      banner(Math.round(W * .39), Math.round(GT * .46), "#9c2a3c", "#e0b040"); banner(Math.round(W * .61), Math.round(GT * .46), "#9c2a3c", "#e0b040");
      /* the throne on its dais */
      const cx = Math.round(W * .5), dw = Math.round(14 * s) + 4;
      for (let st = 0; st < 3; st++) rect(cx - dw - st * 3 * s, GT - (3 - st) * 3 * s, cx + dw + st * 3 * s, GT, st % 2 ? "#6a4a6a" : "#7b5a7b");
      rect(cx - 3 * s - 1, GT - 9 * s, cx + 3 * s + 1, GT, "#9c2a3c");
      const th = Math.round(26 * s), tw = Math.round(7 * s) + 1, ty = GT - 9 * s - th;
      rect(cx - tw, ty, cx + tw, GT - 9 * s, "#8a1f32"); rect(cx - tw - 1, ty - 1, cx + tw + 1, ty, "#e0b040"); rect(cx - tw - 1, ty, cx - tw - 1, GT - 9 * s, "#e0b040"); rect(cx + tw + 1, ty, cx + tw + 1, GT - 9 * s, "#e0b040");
      rect(cx - tw - 3, GT - 9 * s - 7 * s, cx - tw - 1, GT - 9 * s, "#c9a23a"); rect(cx + tw + 1, GT - 9 * s - 7 * s, cx + tw + 3, GT - 9 * s, "#c9a23a");
      rect(cx - tw + 1, GT - 9 * s - 6 * s, cx + tw - 1, GT - 9 * s, "#b02a40"); circ(cx, ty - 2, 2, "#ffd23f");
      for (let k = 0; k < 3; k++) { set(cx - 4 + k * 4, ty - 3, "#ffd23f"); set(cx - 4 + k * 4, ty - 4, "#ffd23f"); }
    } else {
      /* armoury */
      rect(0, Math.round(GT * .16), W, Math.round(GT * .16) + 3, "#5a3a22"); rect(0, Math.round(GT * .16), W, Math.round(GT * .16), "#7a5232");
      [.12, .5, .88].forEach(f => rect(Math.round(W * f) - 2, 0, Math.round(W * f) + 2, Math.round(GT * .16), "#4a2e1a"));
      const sword = (x, y, len, tilt) => { for (let i = 0; i < len; i++) { const px2 = x + Math.round(i * tilt); set(px2, y + i, i < 4 ? "#c0a040" : "#d4dae8"); if (i >= 4) set(px2 + 1, y + i, "#8d96aa"); } rect(x - 2, y + 3, x + 2 + Math.round(3 * tilt), y + 3, "#c0a040"); };
      const shield = (cx, cy, rr, c1, c2) => { circ(cx, cy, rr, "#7a7a8a"); circ(cx, cy, rr - 1, c1); rect(cx - rr + 1, cy, cx + rr - 1, cy, c2); rect(cx, cy - rr + 1, cx, cy + rr - 1, c2); circ(cx, cy, 1.5, "#e8e8f0"); };
      const rack = (cx) => { const rw = Math.round(12 * s) + 3, ry = Math.round(GT * .3); rect(cx - rw, ry, cx + rw, ry + 3, "#5a3a22"); rect(cx - rw, ry + Math.round(26 * s), cx + rw, ry + Math.round(26 * s) + 3, "#5a3a22");
        for (let k = -2; k <= 2; k++) sword(cx + k * Math.round(4.5 * s), ry - Math.round(4 * s) + (k & 1 ? 3 : 0), Math.round(24 * s) + 4, 0); };
      rack(Math.round(W * .3)); rack(Math.round(W * .72));
      shield(Math.round(W * .5), Math.round(GT * .36), Math.round(8 * s) + 2, "#9c2a3c", "#e0b040");
      for (let i = 0; i < 2; i++) { const cx = Math.round(W * .5); for (let k = 0; k < Math.round(16 * s); k++) set(cx + (i ? 1 : -1) * (k - 8 * s) * .7, Math.round(GT * .12) + k, "#d4dae8"); }
      shield(Math.round(W * .12), Math.round(GT * .42), Math.round(6 * s) + 2, "#2f5fa8", "#d4dae8"); shield(Math.round(W * .88), Math.round(GT * .42), Math.round(6 * s) + 2, "#2f8a4c", "#e0b040");
      torch(Math.round(W * .21), Math.round(GT * .56)); torch(Math.round(W * .79), Math.round(GT * .56));
      [.045, .955].forEach(f => { const cx = Math.round(W * f), by = GT; const kw = Math.round(5 * s) + 1;
        rect(cx - kw, by - 22 * s, cx + kw, by - 8 * s, "#8a93a8"); rect(cx - kw, by - 22 * s, cx - kw + 1, by - 8 * s, "#b4bccd"); rect(cx - kw + 2, by - 29 * s, cx + kw - 2, by - 22 * s, "#9aa3b8"); rect(cx - 1, by - 27 * s, cx + 1, by - 25 * s, "#1c1830"); rect(cx - 1, by - 8 * s, cx + 1, by, "#5a3a22"); });
    }
    /* flagstone floor with a red runner */
    for (let y = GT; y < H; y++) { const row = y - GT, br = Math.floor(row / 6), iy = row % 6;
      for (let x = 0; x < W; x++) { const bx = Math.floor((x + (br & 1) * 8) / 16), ix = (x + (br & 1) * 8) % 16; let c = (iy === 5 || ix === 15) ? "#241f38" : iy === 0 ? "#7a7096" : ((bx + br) & 1) ? "#5b5470" : "#4f4866";
        if (row >= 4 && row <= Math.round((H - GT) * .62)) { c = (row === 4 || row === Math.round((H - GT) * .62)) ? "#e0b040" : (row === 5 || row === Math.round((H - GT) * .62) - 1) ? "#6e1624" : ((x + row) & 7) === 0 ? "#b8344a" : "#9c2a3c"; }
        set(x, y, c); } }
    rect(0, GT - 1, W, GT - 1, "#2a2440");
  }
  ctx.putImageData(img, 0, 0);
}
