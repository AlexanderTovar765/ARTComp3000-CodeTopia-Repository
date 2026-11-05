/* The level map: a painted pixel-art landscape with a dashed trail between level nodes.
   HTML runs through meadows and ends at the edge of the Dark Forest. C++ starts in the forest and ends at the castle gates. */

"use strict";

/* ================= world map ================= */
/* node positions in percent of the map: [x, y]. "from" is the doorway back to the other language, "to" the doorway onward. */
const WM = {
  html:{ wide:{ L:[[8,80],[20,66],[13,46],[26,30],[39,44],[36,68],[50,80],[60,58],[68,34],[78,20]], end:[92,46] },
         tall:{ L:[[25,90],[68,82],[30,74],[68,66],[30,58],[68,50],[30,42],[68,34],[30,26],[66,18]], end:[50,7] } },
  cpp: { wide:{ L:[[14,72],[24,52],[18,30],[32,22],[42,40],[38,66],[52,78],[62,56],[68,34],[76,62]], start:[10,50], end:[87,62] },
         tall:{ L:[[28,88],[68,82],[30,76],[68,70],[30,64],[68,58],[30,52],[68,46],[30,40],[62,34]], start:[50,96], end:[50,21] } }
};
const WM_SIZE = { wide:{ w:200, h:125, vb:[1000, 625] }, tall:{ w:120, h:192, vb:[600, 960] } };
const wmTall = () => matchMedia("(max-width:760px)").matches;

/* seeded noise helpers */
function wmRand(seed){ let s = seed | 0; return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const wmH = (x, y, s) => { let h = (x * 374761393 + y * 668265263 + s * 1442695041) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function wmNoise(x, y, s){ const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = wmH(xi, yi, s), b = wmH(xi + 1, yi, s), c = wmH(xi, yi + 1, s), d = wmH(xi + 1, yi + 1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
const wmFbm = (x, y, s) => (wmNoise(x, y, s) * .55 + wmNoise(x * 2, y * 2, s + 7) * .3 + wmNoise(x * 4, y * 4, s + 13) * .15);
const BAYER = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
const hexRGB = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };

function wmPaint(cv, track, orient, pts, extra){
  if (track === "js") return wmPaintKeep(cv, orient, pts);
  const { w, h } = WM_SIZE[orient], tall = orient === "tall"; cv.width = w; cv.height = h;
  const ctx = cv.getContext("2d"), img = ctx.createImageData(w, h), px = img.data, html = track === "html";
  const P = a => a.map(hexRGB);
  const MEAD = P(["#2f6b3a", "#3b8244", "#4a9a50", "#5cb460", "#74c872"]), FOREST = P(["#0e1d1a", "#14291f", "#1a3524", "#22432b", "#2c5233"]),
        DARK = P(["#0b1417", "#101f1d", "#162a22", "#1c3427", "#23402e"]), STONE = P(["#4a4a5a", "#5a5a6c", "#6b6b7c", "#7d7d8c", "#8d8d9a"]);
  const set = (x, y, c) => { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= w || y >= h) return; const i = (y * w + x) * 4; px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; px[i + 3] = 255; };
  const get = (x, y) => { const i = (y * w + x) * 4; return [px[i], px[i + 1], px[i + 2]]; };
  const near = pts.map(p => [p[0] * w / 100, p[1] * h / 100]);
  /* how deep into the forest (0 clear .. 1 darkest) and how close to the castle (0..1) */
  const forest = (x, y) => { const nx = x / w, ny = y / h; if (html) return Math.max(0, Math.min(1, tall ? (.22 - ny) / .16 : (nx - .78) / .17)); return Math.max(0, Math.min(1, tall ? (ny - .78) / .16 : (.26 - nx) / .2)); };
  const castle = (x, y) => { if (html) return 0; const nx = x / w, ny = y / h; return Math.max(0, Math.min(1, tall ? (.34 - ny) / .12 : (nx - .72) / .12)); };
  const riverAt = (x, y) => { if (!html) return 99; const nx = x / w, ny = y / h;
    return tall ? Math.abs(ny * h - (h * .61 + 6 * Math.sin(nx * 9))) : Math.abs(nx * w - (w * .31 + 7 * Math.sin(ny * 8))); };
  const rw = 3.2, dists = (x, y) => { let m = 1e9; for (let i = 0; i < near.length - 1; i++) { const [ax, ay] = near[i], [bx, by] = near[i + 1], dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy))); m = Math.min(m, Math.hypot(x - ax - dx * t, y - ay - dy * t)); } return m; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const f = forest(x, y), c = castle(x, y), n = wmFbm(x / 11, y / 11, html ? 3 : 9), dth = (BAYER[(y & 3) * 4 + (x & 3)] + .5) / 16;
    let pal = MEAD; if (!html) pal = FOREST;
    const k = (n - .25) * 4.2, lvl = Math.max(0, Math.min(pal.length - 1.001, k));
    let col = pal[Math.floor(lvl + (lvl % 1 > dth ? 1 : 0))] || pal[pal.length - 1];
    if (html && f > 0) { const dl = DARK[Math.min(4, Math.floor(Math.max(0, Math.min(3.99, (n - .2) * 5))))]; col = f > dth * .9 ? dl : col; }
    if (!html) { if (f < 1) { const open = MEAD.map(m => m.map(v => v * .72)), oc = open[Math.max(0, Math.min(4, Math.floor(k)))]; if (1 - f > dth + .08) col = oc; } if (c > 0) { const sc = STONE[Math.max(0, Math.min(4, Math.floor(k)))]; if (c > dth) col = sc; } }
    const rv = riverAt(x, y); if (rv < rw) col = rv < rw - 1.2 ? (((x + y + (y >> 2)) & 3) === 0 ? [112, 176, 230] : [64, 130, 200]) : [214, 196, 140];
    set(x, y, col);
  }
  const R = wmRand(html ? 11 : 29);
  const clearOf = (x, y, r) => dists(x, y) > r && !near.some(p => Math.hypot(p[0] - x, p[1] - y) < r + 4) && riverAt(x, y) > rw + 1.5;
  const tree = (x, y, dark, dead) => { x |= 0; y |= 0;
    if (dead) { const tr = [60, 44, 36]; for (let i = 0; i < 6; i++) set(x, y - i, tr); set(x - 1, y - 4, tr); set(x - 2, y - 5, tr); set(x + 1, y - 3, tr); set(x + 2, y - 4, tr); return; }
    const cs = dark ? [[14, 40, 30], [22, 62, 44], [34, 90, 58]] : [[30, 108, 56], [52, 156, 78], [112, 210, 104]], tk = dark ? [40, 28, 24] : [96, 62, 36];
    set(x, y, tk); set(x, y - 1, tk);
    for (let r = 0; r < 5; r++) { const hw = Math.floor((r + 1) / 1.6) + (r > 1 ? 1 : 0), yy = y - 2 - (4 - r); for (let dx = -hw; dx <= hw; dx++) set(x + dx, yy, dx < 0 ? cs[2] : dx === 0 ? cs[1] : cs[0]); } };
  /* scatter trees: dense in the forest, light over the meadows */
  const step = 5;
  for (let gy = 3; gy < h + 4; gy += step) for (let gx = 2; gx < w + 3; gx += step) {
    const x = gx + (R() - .5) * 4, y = gy + (R() - .5) * 4, f = forest(x, y), c = castle(x, y);
    const dens = html ? .1 + f * .95 : .12 + f * .95 - c * 1; if (R() > dens || c > .5) continue;
    if (!clearOf(x, y, f > .3 ? 3.2 : 5.2)) continue;
    tree(x, y, f > .25 || !html, !html && f < .55 && R() < .35);
  }
  /* landmarks */
  const house = (x, y, wall, roof) => { x |= 0; y |= 0; for (let dx = 0; dx < 7; dx++) for (let dy = 0; dy < 4; dy++) set(x + dx, y + dy, wall); for (let r = 0; r < 4; r++) for (let dx = r; dx < 7 - r; dx++) set(x + dx, y - 1 - r, roof); set(x + 3, y + 2, [60, 38, 26]); set(x + 3, y + 3, [60, 38, 26]); set(x + 1, y + 1, [250, 226, 140]); set(x + 5, y + 1, [250, 226, 140]); };
  if (html) { [[0, 11, -9], [3, -10, 7], [6, 11, 7]].forEach(([i, dx, dy]) => { const p = near[i]; if (p) house(p[0] + dx, p[1] + dy, [226, 206, 170], [190, 70, 58]); }); }
  else {
    for (let k = 0; k < 7; k++) { const p = near[2 + (k % 6)]; const bx = p[0] + (k % 2 ? 9 : -10) + (R() - .5) * 4, by = p[1] + (k % 3 - 1) * 5;
      for (let dy = 0; dy < 5; dy++) for (let dx = 0; dx < 4; dx++) if (R() < .75) set(bx + dx, by + dy - (dy > 2 ? 0 : 1) , STONE[1 + ((dx + dy) & 1)]); }
    const sw = [[.16, .62], [.1, .3], [.3, .86]]; (tall ? [[.3, .9], [.7, .93], [.5, .84]] : sw).forEach(([a, b]) => { const cx = a * w, cy = b * h; for (let y = -3; y <= 3; y++) for (let x = -6; x <= 6; x++) if ((x / 6) ** 2 + (y / 3) ** 2 < 1) set(cx + x, cy + y, ((x + y) & 3) === 0 ? [74, 120, 118] : [36, 72, 76]); });
    const g = near[near.length - 1], gx = (extra.end[0] * w / 100) | 0, gy = (extra.end[1] * h / 100) | 0, W2 = tall ? 20 : 17, ST = [[110, 110, 128], [140, 140, 158], [86, 86, 104], [60, 60, 76]];
    const rect = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, c); };
    rect(gx - W2, gy - 22, gx + W2, gy + 2, ST[0]); for (let y = gy - 22; y <= gy + 2; y += 4) for (let x = gx - W2; x <= gx + W2; x++) if ((x + (y & 4 ? 2 : 0)) % 6 === 0) set(x, y, ST[2]);
    rect(gx - W2, gy - 22, gx + W2, gy - 21, ST[1]);
    [gx - W2 - 3, gx + W2 - 3].forEach(tx => { rect(tx, gy - 34, tx + 6, gy + 2, ST[1]); rect(tx, gy - 34, tx + 6, gy - 33, ST[3]); for (let x = tx; x <= tx + 6; x += 2) rect(x, gy - 37, x, gy - 35, ST[1]); rect(tx + 3, gy - 20, tx + 3, gy - 17, [20, 14, 28]); });
    for (let x = gx - W2; x <= gx + W2; x += 2) rect(x, gy - 25, x, gy - 23, ST[0]);
    rect(gx - 5, gy - 12, gx + 5, gy + 2, [20, 14, 28]); for (let r = 0; r < 4; r++) rect(gx - 5 + r, gy - 15 + r, gx + 5 - r, gy - 15 + r, [20, 14, 28]);
    for (let y = gy - 15; y <= gy + 2; y += 3) for (let x = gx - 4; x <= gx + 4; x += 2) set(x, y, [70, 50, 40]);
    rect(gx, gy - 46, gx, gy - 35, [90, 90, 108]); rect(gx + 1, gy - 46, gx + 5, gy - 43, [200, 40, 70]);
    rect(gx - 8, gy + 3, gx + 8, gy + 5, [150, 120, 84]);
  }
  /* mist across the forest */
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const f = forest(x, y); if (f > .4 && ((x * 7 + y * 3 + (wmH(x >> 2, y >> 2, 5) * 8 | 0)) & 7) === 0) { const [r, g, b] = get(x | 0, y | 0); set(x, y, [r * .85 + 30, g * .85 + 38, b * .85 + 44]); } }
  ctx.putImageData(img, 0, 0);
}

/* the dashed trail, as one smooth curve through the nodes */
function wmCurve(pts, vb){
  const P = pts.map(p => [p[0] * vb[0] / 100, p[1] * vb[1] / 100]); let d = "M" + P[0][0].toFixed(1) + " " + P[0][1].toFixed(1);
  for (let i = 0; i < P.length - 1; i++) { const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || P[i + 1];
    d += " C" + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + " " + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + " " + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + " " + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + " " + p2[0].toFixed(1) + " " + p2[1].toFixed(1); }
  return d;
}
const wmStars = n => "★".repeat(n) + "☆".repeat(3 - n);

function renderTrail(){
  const orient = wmTall() ? "tall" : "wide", cfg = WM[TRK.id][orient], vb = WM_SIZE[orient].vb, L = cfg.L.slice(0, NREAL), isHtml = TRK.id === "html";
  let cur = 0; for (let n = 1; n <= Math.min(lvUnlocked(), NREAL); n++) if (!D.stars[n]) { cur = n; break; }
  /* the full route including the doorways at either end */
  const route = (cfg.start ? [cfg.start] : []).concat(L, cfg.end ? [cfg.end] : []), off = cfg.start ? 1 : 0;
  const segs = route.slice(0, -1).map((p, i) => {
    const done = i < off ? true : (i - off + 1 <= NREAL ? !!D.stars[i - off + 1] : !!D.stars[NREAL]);
    return `<path d="${wmCurve(TRK.id === "js" ? keepSegPts(orient, i) : [route[i], route[i + 1]], vb)}" class="${done ? "wm-done" : "wm-next"}"/>`; }).join("");
  const el = $("#trail"); el.className = "wm-nodes";
  const nodes = L.map((p, i) => {
    const n = i + 1, lv = LEVELS[i], locked = n > lvUnlocked(), st = D.stars[n] || 0, here = !locked && n === cur && !D.stars[n];
    return `<li style="left:${p[0]}%;top:${p[1]}%"><button class="node ${lv.foe.boss ? "boss" : ""} ${here ? "here" : ""} ${st ? "won" : ""}" type="button" data-l="${n}" ${locked ? "disabled" : ""}
      aria-label="Level ${n}, ${escH(lv.n)}${lv.foe.boss ? ", boss" : ""}. ${locked ? "Locked." : st + " of 3 stars."}"><span class="stars" aria-hidden="true">${wmStars(st)}</span><span class="hex"><b>${n}</b></span></button></li>`;
  }).join("");
  const door = (p, cls, label, act, sub) => `<li style="left:${p[0]}%;top:${p[1]}%"><button class="gate ${cls}" type="button" data-go="${act}"><span class="gi" aria-hidden="true"></span><span class="gl">${label}</span><span class="gs">${sub}</span></button></li>`;
  let extra = "";
  if (isHtml) { const open = D.admin || htmlDone(); extra = door(cfg.end, "forest" + (open ? "" : " shut"), "The Dark Forest", "cpp", open ? "Enter. C++ begins here" : "Locked. Beat the Markup Titan"); }
  else if (TRK.id === "js") { extra = door(cfg.start, "castle", "Back to the castle", "cpp", "C++ levels"); }
  else { const open = D.admin || cppDone(); extra = door(cfg.start, "meadow", "Back to the meadows", "html", "HTML levels") + (open ? door([cfg.end[0], cfg.end[1] + (orient === "tall" ? 8 : 12)], "castle", "The keep", "js", "Enter. JavaScript begins here") : door([cfg.end[0], cfg.end[1] + (orient === "tall" ? 8 : 12)], "castle shut", "The keep", "js", "Locked. Beat the Pointer Wraith")); }
  el.innerHTML = nodes + extra;
  const map = $("#wmap"); map.className = "wmap " + orient + " " + TRK.id; map.style.aspectRatio = vb[0] + " / " + vb[1];
  $("#wmPath").setAttribute("viewBox", "0 0 " + vb[0] + " " + vb[1]); $("#wmPath").innerHTML = segs;
  wmPaint($("#wmBg"), TRK.id, orient, TRK.id === "js" ? keepDense(orient) : route, cfg);
  wmPreview(cur || 1);
}
function wmPreview(n){
  const lv = LEVELS[n - 1]; if (!lv) return; const locked = n > lvUnlocked(), st = D.stars[n] || 0;
  $("#wmCard").innerHTML = `<div class="wmc-art">${locked ? '<span class="wmc-q">?</span>' : foeSVG(lv.foe)}</div><div class="wmc-t"><span class="wmc-n">Level ${n}${lv.foe.boss ? " · boss" : ""} · <span class="wmc-s">${wmStars(st)}</span></span><b>${escH(lv.n)}</b><span class="wmc-f">${locked ? "Clear the level before to unlock." : "Enemy: " + escH(lv.foe.name)}</span></div>`;
}
$("#trail").addEventListener("pointerover", e => { const b = e.target.closest(".node"); if (b) wmPreview(+b.dataset.l); });
$("#trail").addEventListener("focusin", e => { const b = e.target.closest(".node"); if (b) wmPreview(+b.dataset.l); });
$("#trail").addEventListener("click", e => {
  const g = e.target.closest("[data-go]"); if (!g) return;
  if (g.classList.contains("shut")) { toast(g.dataset.go === "js" ? "The keep is sealed. Defeat the Pointer Wraith, the boss of C++ level 10, to open it." : "The Dark Forest is sealed. Defeat the Markup Titan, the boss of HTML level 10, to open it."); anim(g, [{ transform:"translate(-50%,-50%) translateX(0)" }, { transform:"translate(-50%,-50%) translateX(-6px)" }, { transform:"translate(-50%,-50%) translateX(6px)" }, { transform:"translate(-50%,-50%) translateX(0)" }], { duration:260 }); return; }
  setTrack(g.dataset.go); renderMap(); const b = $("#trail .node.here") || $("#trail .node:not(:disabled)"); if (b) b.focus({ preventScroll:true });
});
{ let tall = wmTall(); addEventListener("resize", () => { const t = wmTall(); if (t !== tall) { tall = t; if (!$("#map").hidden) renderMap(); } }); }
