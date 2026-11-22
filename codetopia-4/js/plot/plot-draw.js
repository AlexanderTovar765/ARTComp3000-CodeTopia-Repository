/* The Builders' Plot: drawing. The house is painted from what your HTML and CSS said, the garden from your Python, the fireworks
   from your C++, and the helper villager acts out your JavaScript. Everything is drawn with plain pixel rectangles. */

"use strict";

function plRgb(col) {
  if (!col) return [128, 128, 128, 1]; let m = String(col).match(/rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+))?/);
  if (m) return [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]];
  m = String(col).match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i); if (m) { let h = m[1]; if (h.length === 3) h = h.replace(/./g, "$&$&"); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4), 16), 1]; }
  return [128, 128, 128, 1];
}
const plCol = (col, f) => { const [r, g, b] = plRgb(col), k = f < 0 ? 0 : 255, a = Math.abs(f); return "rgb(" + Math.round(r + (k - r) * a) + "," + Math.round(g + (k - g) * a) + "," + Math.round(b + (k - b) * a) + ")"; };
const plRect = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

/* a part's box, with the CSS look: colour or gradient, border, rounded corners, opacity, glow */
function plBox(c, x, y, w, h, s, fallback) {
  s = s || {}; x = Math.round(x); y = Math.round(y); w = Math.max(1, Math.round(w)); h = Math.max(1, Math.round(h));
  const r = Math.min(Math.round((s.r || 0) * Math.min(w, h) / 2), Math.min(w, h) >> 1), col = s.c || fallback;
  c.save(); if (s.o !== undefined) c.globalAlpha = s.o; if (s.glow) { c.shadowColor = s.glow; c.shadowBlur = 8; }
  let fill = col; if (s.c2) { const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, col); g.addColorStop(1, s.c2); fill = g; }
  const path = (px, py, pw, ph, pr) => { c.beginPath(); if (pr > 0) { c.moveTo(px + pr, py); c.arcTo(px + pw, py, px + pw, py + ph, pr); c.arcTo(px + pw, py + ph, px, py + ph, pr); c.arcTo(px, py + ph, px, py, pr); c.arcTo(px, py, px + pw, py, pr); c.closePath(); } else c.rect(px, py, pw, ph); };
  c.fillStyle = fill; path(x, y, w, h, r); c.fill(); c.shadowBlur = 0;
  if (s.bw) { c.strokeStyle = s.bc || "#000"; c.lineWidth = s.bw; path(x + s.bw / 2, y + s.bw / 2, w - s.bw, h - s.bw, Math.max(0, r - s.bw / 2)); c.stroke(); }
  c.restore();
}
const plSz = (s, w, h) => [w * ((s && s.sx) || 1), h * ((s && s.sy) || 1)];

/* ---------- the house ---------- */
function plHouseCanvas(H) {
  const W = 190, HT = 170, ax = 95, ay = 134, cv = vCanvas(W, HT), c = cv.c, S = H.st, cx = ax;
  const hid = p => S[p] && S[p].hide, bw0 = plSz(S.wall, 70, 44), ww = Math.max(30, Math.round(bw0[0])), wh = Math.max(24, Math.round(bw0[1])), x0 = cx - (ww >> 1), y0 = ay - wh;
  /* the ground shadow and the path */
  c.fillStyle = "rgba(10,6,30,.28)"; c.fillRect(x0 - 4, ay - 2, ww + 8, 4);
  if (!hid("path")) { const pw = plSz(S.path, 16, 1)[0]; plBox(c, cx - pw / 2, ay + 1, pw, 12, S.path, "#8f89a0"); }
  /* annexes: smaller rooms beside the house */
  for (let i = 0; i < H.annex; i++) { const aw = Math.round(ww * .36), ah = Math.round(wh * .66), ax2 = i % 2 ? x0 + ww - 2 : x0 - aw + 2, st2 = Object.assign({}, S.annex); if (!hid("annex")) { plBox(c, ax2, ay - ah, aw, ah, st2, "#c9b48c"); plBox(c, ax2 - 3, ay - ah - 8, aw + 6, 9, S.roof, "#b8554a"); plRect(c, ax2 + aw / 2 - 3, ay - ah + 6, 6, 6, "#ffe08a"); } }
  /* posts and rope (nav) */
  if (H.posts) { [x0 - 16, x0 + ww + 12].forEach(px => { plRect(c, px, ay - 14, 3, 14, "#6a4a2a"); plRect(c, px, ay - 14, 3, 2, "#8a6a3a"); }); c.fillStyle = "#d9c9a0"; for (let i = 0; i < ww + 28; i += 2) c.fillRect(x0 - 14 + i, ay - 10 + Math.round(Math.sin(i / (ww + 28) * Math.PI) * 4), 2, 1); }
  /* chimney, behind the roof */
  const rs = plSz(S.roof, 1, 26), rh = Math.max(10, Math.round(rs[1])), rw = ww + 12, rx = x0 - 6, ry = y0 - rh;
  if (!hid("chimney")) { const cz = plSz(S.chimney, 9, 18); plBox(c, x0 + ww - 18, ry - 4, cz[0], cz[1] + 6, S.chimney, "#8a8498"); plRect(c, x0 + ww - 20, ry - 6, cz[0] + 4, 3, plCol(S.chimney.c || "#8a8498", -.25)); }
  /* the wall */
  if (!hid("wall")) { plBox(c, x0, y0, ww, wh, S.wall, "#d8c29a"); c.fillStyle = "rgba(0,0,0,.08)"; for (let y = y0 + 4; y < ay - 2; y += 6) c.fillRect(x0 + 2, y, ww - 4, 1); }
  /* the roof: a triangle-ish shape with layered rows */
  if (!hid("roof")) {
    c.save(); const rs2 = S.roof || {}; if (rs2.o !== undefined) c.globalAlpha = rs2.o; if (rs2.glow) { c.shadowColor = rs2.glow; c.shadowBlur = 8; }
    let fill = rs2.c || "#b8554a"; if (rs2.c2) { const g = c.createLinearGradient(0, ry, 0, y0); g.addColorStop(0, fill); g.addColorStop(1, rs2.c2); fill = g; }
    c.fillStyle = fill; c.beginPath(); c.moveTo(rx - 2, y0 + 2); c.lineTo(cx, ry); c.lineTo(rx + rw + 2, y0 + 2); c.closePath(); c.fill(); c.shadowBlur = 0;
    if (rs2.bw) { c.strokeStyle = rs2.bc || "#000"; c.lineWidth = rs2.bw; c.stroke(); } c.restore();
    c.fillStyle = "rgba(0,0,0,.12)"; for (let i = 1; i < 4; i++) c.fillRect(rx + 4 + i * 2, y0 - i * (rh / 4), rw - 8 - i * 4, 1);
  }
  /* banner (header) across the roof edge */
  if (H.banner) { c.fillStyle = "#ff5a7a"; c.fillRect(x0 + 6, y0 - 1, ww - 12, 5); for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? "#ffd23f" : "#ff5a7a"; c.fillRect(x0 + 6 + i * ((ww - 12) / 5 | 0), y0 + 4, ((ww - 12) / 5 | 0) - 1, 3); } }
  /* flags on the roof */
  if (!hid("flag")) for (let i = 0; i < H.flags; i++) { const fx = cx - 16 + i * 16 + (H.flags === 1 ? 16 : 0), fy = ry - 14 + (i === 1 ? -4 : 0), rot = S.flag && S.flag.rot || 0; plRect(c, fx, fy, 1, 18, "#5a3a22"); c.save(); c.translate(fx + 1, fy + 1); c.rotate(rot); const fz = plSz(S.flag, 10, 6); plBox(c, 0, 0, fz[0], fz[1], S.flag, "#ff5a7a"); c.restore(); }
  /* windows */
  if (!hid("window")) { const wz = plSz(S.window, 11, 11), n = H.windows, door = plSz(S.door, 14, 22), cap = Math.max(0, Math.floor((ww - door[0] - 6) / (wz[0] + 5)));
    const slots = [], half = (ww - door[0]) / 2; for (let i = 0; i < Math.min(n, 4); i++) { const side = i % 2 ? 1 : -1, k = Math.floor(i / 2); slots.push(side < 0 ? x0 + half / 2 - wz[0] / 2 - k * (wz[0] + 3) : x0 + ww - half / 2 - wz[0] / 2 + k * (wz[0] + 3)); }
    slots.forEach(sx => { const wx = Math.max(x0 + 2, Math.min(x0 + ww - wz[0] - 2, sx)); plBox(c, wx, y0 + 7, wz[0], wz[1], S.window, "#ffe08a"); c.fillStyle = "rgba(60,40,20,.55)"; c.fillRect(Math.round(wx + wz[0] / 2), Math.round(y0 + 7), 1, Math.round(wz[1])); c.fillRect(Math.round(wx), Math.round(y0 + 7 + wz[1] / 2), Math.round(wz[0]), 1); }); void cap; }
  /* door and steps */
  const dz = plSz(S.door, 14, 22), dw = Math.max(8, Math.round(dz[0])), dh = Math.max(10, Math.round(dz[1])), dx = cx - (dw >> 1);
  for (let i = 0; i < H.steps; i++) if (!hid("step")) { const sz = plSz(S.step, 1, 3); plBox(c, dx - 3 - i * 2, ay - (H.steps - i) * 0 + i * 3 - 0, dw + 6 + i * 4, Math.max(2, sz[1]), S.step, "#9a96a8"); }
  if (!hid("door")) { plBox(c, dx, ay - dh - (H.steps ? 0 : 0), dw, dh, S.door, "#6a4a2a"); plRect(c, dx + dw - 4, ay - dh / 2 - 1, 2, 2, "#ffd23f"); }
  /* picture, bell, mail box, flower box, stall */
  if (H.picture) { plRect(c, x0 + 4, y0 + 22, 14, 11, "#5a3a22"); plRect(c, x0 + 5, y0 + 23, 12, 9, "#7ec8ff"); plRect(c, x0 + 5, y0 + 28, 12, 4, "#5cf08c"); plRect(c, x0 + 12, y0 + 25, 3, 3, "#ffd23f"); }
  if (H.bell) { plRect(c, dx + dw + 3, y0 + 14, 1, 5, "#5a3a22"); plRect(c, dx + dw + 1, y0 + 19, 5, 4, "#ffd23f"); plRect(c, dx + dw, y0 + 22, 7, 1, "#c9a020"); plRect(c, dx + dw + 3, y0 + 23, 1, 1, "#5a3a22"); }
  if (H.mail) { const mx = x0 + ww + 8; plRect(c, mx + 3, ay - 16, 2, 16, "#5a3a22"); plRect(c, mx - 1, ay - 24, 10, 8, "#3b8fd8"); plRect(c, mx - 1, ay - 24, 10, 2, "#6fb0ff"); plRect(c, mx + 6, ay - 26, 2, 4, "#ff5a5a"); plRect(c, mx + 1, ay - 21, 4, 1, "#12306a"); }
  if (H.flowerbox) { const fy = y0 + 20, fx = x0 + ww - 20; plRect(c, fx, fy, 16, 5, "#6a4a2a"); ["#ff7ab8", "#ffd23f", "#ffffff", "#c58bff"].forEach((fc, i) => { plRect(c, fx + 1 + i * 4, fy - 4, 1, 4, "#3f8a3a"); plRect(c, fx + i * 4, fy - 6, 3, 3, fc); }); }
  if (H.stall) { const sx = x0 - 34, sy = ay; plRect(c, sx, sy - 22, 2, 22, "#5a3a22"); plRect(c, sx + 24, sy - 22, 2, 22, "#5a3a22"); for (let i = 0; i < 26; i += 4) { plRect(c, sx + i, sy - 28, 4, 8, (i / 4) % 2 ? "#f4f1e6" : "#e0525e"); } plRect(c, sx - 1, sy - 10, 28, 5, "#8a5a36"); plRect(c, sx + 3, sy - 14, 5, 4, "#ff6b81"); plRect(c, sx + 11, sy - 14, 5, 4, "#ffd23f"); plRect(c, sx + 18, sy - 14, 5, 4, "#b9e769"); }
  /* the house sign above the door */
  if (!hid("sign")) {
    const name = H.name || "MY HOUSE", tw = plTextW(name, 1), bwd = Math.min(W - 8, tw + 10), bx = cx - (bwd >> 1), by = y0 - 4 + 22 > ay - dh - 8 ? ay - dh - 14 : y0 + 16;
    plRect(c, bx + 2, by - 6, 1, 6, "#5a3a22"); plRect(c, bx + bwd - 3, by - 6, 1, 6, "#5a3a22");
    plBox(c, bx, by, bwd, 11, S.sign, "#7a5a38");
    const tc = (S.sign && S.sign.t) || "#fff4d6", tx = cx - (tw >> 1), ty = by + 3;
    if (H.sign === "mark") plRect(c, tx - 2, ty - 1, tw + 3, 7, "#ffe66a");
    plText(c, name, tx, ty, H.sign === "mark" ? "#3a2a10" : tc, 1); if (H.sign === "strong") plText(c, name, tx + 1, ty, H.sign === "mark" ? "#3a2a10" : tc, 1);
    if (H.sign === "em") plRect(c, tx, ty + 6, tw, 1, tc);
  }
  /* the note, on a little ground plaque */
  if (H.note) { const nt = H.note.toUpperCase(), nw = plTextW(nt, 1) + 8, nx = cx - (nw >> 1), ny = ay + 14; plRect(c, nx, ny, nw, 9, "#4a3a2a"); plRect(c, nx + 1, ny + 1, nw - 2, 7, "#e8dcc0"); plText(c, nt, nx + 4, ny + 2, "#3a2a1a", 1); }
  return { cv:cv.cv, x:ax, y:ay, ax:cx, ay:ay, w:W, h:HT, ww, wh, chim:{ dx:ww / 2 - 14, dy:-(wh + rh + 6) } };
}

/* ---------- the garden ---------- */
const PL_CELL = { w:14, h:11 };
function plPlantDraw(c, kind, x, y, big) {
  const g = "#3f8a3a", g2 = "#5cb85a";
  if (!big) { plRect(c, x, y - 4, 1, 4, g); plRect(c, x - 2, y - 5, 2, 2, g2); plRect(c, x + 1, y - 6, 2, 2, g2); return; }
  if (kind === "rose") { plRect(c, x, y - 9, 1, 9, g); plRect(c, x - 2, y - 4, 2, 1, g2); plRect(c, x - 2, y - 14, 5, 5, "#ff4d5e"); plRect(c, x - 1, y - 13, 3, 3, "#c0283a"); plRect(c, x, y - 12, 1, 1, "#ff9aa6"); }
  else if (kind === "tulip") { plRect(c, x, y - 9, 1, 9, g); plRect(c, x + 1, y - 5, 2, 1, g2); plRect(c, x - 2, y - 14, 5, 6, "#ff8ad0"); plRect(c, x - 2, y - 15, 1, 2, "#ff8ad0"); plRect(c, x + 2, y - 15, 1, 2, "#ff8ad0"); plRect(c, x - 1, y - 12, 3, 3, "#d94fa0"); }
  else if (kind === "daisy") { plRect(c, x, y - 8, 1, 8, g); [[-3, -13], [3, -13], [0, -16], [0, -10], [-2, -15], [2, -15], [-2, -11], [2, -11]].forEach(([a, b]) => plRect(c, x + a - 1, y + b, 2, 2, "#ffffff")); plRect(c, x - 1, y - 14, 3, 3, "#ffd23f"); }
  else if (kind === "sunflower") { plRect(c, x, y - 12, 1, 12, g); plRect(c, x - 3, y - 6, 3, 2, g2); plRect(c, x + 1, y - 8, 3, 2, g2); for (let a = 0; a < 8; a++) plRect(c, x + Math.round(Math.cos(a * .785) * 5) - 1, y - 18 + Math.round(Math.sin(a * .785) * 5), 3, 3, "#ffd23f"); plRect(c, x - 2, y - 20, 5, 5, "#6a3a14"); }
  else if (kind === "mushroom") { plRect(c, x - 1, y - 6, 3, 6, "#f4ecd8"); plRect(c, x - 4, y - 10, 9, 5, "#e0383e"); plRect(c, x - 3, y - 11, 7, 1, "#e0383e"); plRect(c, x - 2, y - 9, 2, 2, "#fff"); plRect(c, x + 2, y - 8, 2, 2, "#fff"); }
  else if (kind === "tree") { plRect(c, x - 1, y - 8, 3, 8, "#6a4a2a"); plRect(c, x - 5, y - 16, 11, 9, "#3f8a3a"); plRect(c, x - 3, y - 20, 7, 5, "#3f8a3a"); plRect(c, x - 3, y - 15, 3, 3, "#5cb85a"); plRect(c, x + 2, y - 11, 2, 2, "#ff5a5a"); }
  else if (kind === "lily") { plRect(c, x, y - 7, 1, 7, g); plRect(c, x - 3, y - 2, 3, 1, g2); plRect(c, x + 1, y - 2, 3, 1, g2); [[-3, -12], [3, -12], [0, -14], [-2, -10], [2, -10]].forEach(([a, b]) => plRect(c, x + a - 1, y + b, 3, 3, "#d9c8ff")); plRect(c, x, y - 11, 1, 2, "#ffd23f"); }
  else if (kind === "pumpkin") { plRect(c, x - 5, y - 8, 11, 8, "#ff8a2a"); plRect(c, x - 3, y - 9, 7, 1, "#ff8a2a"); plRect(c, x - 1, y - 8, 1, 8, "#c85a12"); plRect(c, x + 2, y - 8, 1, 8, "#c85a12"); plRect(c, x, y - 11, 2, 3, "#3f8a3a"); }
  else { plRect(c, x, y - 8, 1, 8, g); plRect(c, x - 2, y - 11, 5, 4, g2); }
}
function plGardenCanvas(G, S) {
  const cols = PL_GARDEN.cols, rows = PL_GARDEN.rows, W = cols * PL_CELL.w + 8, H = rows * PL_CELL.h + 30, cv = vCanvas(W, H), c = cv.c;
  const soil = S && S.garden && S.garden.c || "#6a4a32";
  plRect(c, 0, 24, W, rows * PL_CELL.h + 6, "#5a3a22"); plRect(c, 0, 24, W, 1, "#8a6a3a");
  const wet = {}; (G.water || []).forEach(w => { wet[w.col + "," + w.row] = 1; });
  for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) { const x = 4 + q * PL_CELL.w, y = 28 + r * PL_CELL.h, w = wet[q + "," + r]; plRect(c, x, y, PL_CELL.w - 1, PL_CELL.h - 1, w ? plCol(soil, -.35) : soil); if (w) { plRect(c, x + 3, y + 7, 1, 1, "#7ec8ff"); plRect(c, x + 9, y + 3, 1, 1, "#7ec8ff"); } else plRect(c, x + 2, y + 2, 1, 1, plCol(soil, .18)); }
  const order = (G.plants || []).slice().sort((a, b) => a.row - b.row);
  order.forEach(p => plPlantDraw(c, p.kind, 4 + p.col * PL_CELL.w + 6, 28 + p.row * PL_CELL.h + 9, !!wet[p.col + "," + p.row] || p.kind === "tree"));
  return { cv:cv.cv, x:0, y:0, ax:W >> 1, ay:H - 2, w:W, h:H };
}

/* ---------- fireworks ---------- */
const plFw = { steps:[], i:0, wait:0, rockets:[], parts:[], on:false, w:320, left:40, span:240, top:20, ground:96, done:false };
function plFwStart(steps, geo) {
  Object.assign(plFw, { steps:(steps || []).slice(), i:0, wait:0, rockets:[], parts:[], on:true, done:false }, geo || {}); plFwStep(0);
}
function plFwStop() { plFw.on = false; plFw.rockets = []; plFw.parts = []; plFw.done = true; }
function plFwStep() {
  while (plFw.i < plFw.steps.length && plFw.wait <= 0) {
    const s = plFw.steps[plFw.i++];
    if (s.k === "pause") plFw.wait = s.ms / 1000;
    else { const x = plFw.left + (s.x / 9) * plFw.span; plFw.rockets.push({ x, y:plFw.ground, vy:-(70 + Math.random() * 20), tx:x, color:PL_COLORS[s.color] || "#fff", name:s.color, burst:plFw.top + 14 + Math.random() * 30 }); if (typeof SND !== "undefined" && SND.sfx && !(typeof reduce !== "undefined" && reduce)) { try { SND.sfx("swoosh"); } catch (e) {} } }
  }
}
function plFwBurst(r) {
  const n = 34; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + Math.random() * .2, sp = 22 + Math.random() * 20; plFw.parts.push({ x:r.x, y:r.y, vx:Math.cos(a) * sp, vy:Math.sin(a) * sp, l:1.1 + Math.random() * .5, t:0, c:r.name === "white" && i % 3 === 0 ? "#ffd23f" : r.color }); }
  for (let i = 0; i < 6; i++) plFw.parts.push({ x:r.x, y:r.y, vx:(Math.random() - .5) * 8, vy:(Math.random() - .5) * 8, l:.5, t:0, c:"#ffffff" });
  if (typeof SND !== "undefined" && SND.sfx) { try { SND.sfx("cast"); } catch (e) {} }
}
function plFwUpdate(dt) {
  if (!plFw.on) return; dt = Math.min(.06, dt);
  if (plFw.wait > 0) { plFw.wait -= dt; if (plFw.wait <= 0) { plFw.wait = 0; plFwStep(); } } else plFwStep();
  plFw.rockets = plFw.rockets.filter(r => { r.y += r.vy * dt; r.vy *= .985; if (r.y <= r.burst || r.vy > -20) { plFwBurst(r); return false; } return true; });
  plFw.parts = plFw.parts.filter(p => { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 38 * dt; p.vx *= .985; return p.t < p.l; });
  if (plFw.i >= plFw.steps.length && !plFw.rockets.length && !plFw.parts.length && plFw.wait <= 0) { plFw.on = false; plFw.done = true; }
}
function plFwDraw(c) {
  plFw.rockets.forEach(r => { c.fillStyle = r.color; c.fillRect(Math.round(r.x), Math.round(r.y), 2, 3); c.fillStyle = "#ffe9a8"; c.fillRect(Math.round(r.x), Math.round(r.y) + 3, 1, 2); });
  plFw.parts.forEach(p => { const a = 1 - p.t / p.l; c.globalAlpha = Math.max(0, a); c.fillStyle = p.c; c.fillRect(Math.round(p.x), Math.round(p.y), a > .5 ? 2 : 1, a > .5 ? 2 : 1); }); c.globalAlpha = 1;
}
/* the still version for reduced motion: one finished starburst for each launch */
function plFwStill(c, steps, geo) {
  const g = Object.assign({}, plFw, geo || {}); (steps || []).filter(s => s.k === "launch").forEach((s, i) => { const x = g.left + (s.x / 9) * g.span, y = g.top + 22 + (i * 17) % 30, col = PL_COLORS[s.color];
    c.fillStyle = col; for (let a = 0; a < 12; a++) { const an = a / 12 * Math.PI * 2; for (let r = 5; r <= 11; r += 3) c.fillRect(Math.round(x + Math.cos(an) * r), Math.round(y + Math.sin(an) * r), 2, 2); } c.fillStyle = "#fff"; c.fillRect(Math.round(x) - 1, y - 1, 3, 3); });
}

/* ---------- the helper villager: acts out the JavaScript routine ---------- */
const plH = { acts:[], i:-1, t:0, off:{ x:0, y:0 }, bub:"", bt:0, hearts:[], flip:false, bob:0, ph:4, wp:0, walking:false, face:"down", wv:null, ox:0, oy:0 };
function plHelperPlay(n) {
  const P = plStore(); plH.acts = (P.helper.acts || []).slice(); plH.i = -1; plH.t = 0; plH.bub = ""; plH.hearts = [];
  const scn = plH.prev ? "prev" : V.scene; if (n && (plH.hx === undefined || plH.sc !== scn)) { plH.hx = n.x; plH.hy = n.y; plH.sc = scn; }
  plHelperNext(n);
}
const PL_DIRS = { left:[-1, 0], west:[-1, 0], right:[1, 0], east:[1, 0], up:[0, -1], north:[0, -1], forward:[0, -1], down:[0, 1], south:[0, 1], back:[0, 1], backward:[0, 1] };
function plHelperNext(n) {
  plH.i++; plH.t = 0; plH.walking = false; plH.bub = "";
  if (plH.i >= plH.acts.length) { plH.i = -1; plH.acts = []; plH.bob = 0; plH.ph = 4; if (n) { n.x = plH.hx; n.y = plH.hy; } return; }
  const a = plH.acts[plH.i]; plH.cur = a;
  if (a.k === "say") plH.bub = a.t;
  if (a.k === "walk") { const d = PL_DIRS[a.d] || [0, 0]; plH.dir = d; plH.left = (a.n || 0) * 12; }
}
function plHelperUpdate(n, dt) {
  const scn = plH.prev ? "prev" : V.scene; if (plH.hx === undefined || plH.sc !== scn) { plH.hx = n.x; plH.hy = n.y; plH.sc = scn; plH.ox = n.x; plH.oy = n.y; }
  if (plH.i < 0) return; dt = Math.min(.06, dt); plH.t += dt; const a = plH.cur;
  plH.bob = 0; plH.ph = 4;
  if (a.k === "say") { if (plH.t > 1.5 + Math.min(1.5, (a.t || "").length * .03)) plHelperNext(n); }
  else if (a.k === "wait") { if (plH.t >= a.s) plHelperNext(n); }
  else if (a.k === "wave") { plH.bob = Math.floor(plH.t * 8) % 2 ? -1 : 0; if (plH.t > 1.1) plHelperNext(n); }
  else if (a.k === "jump") { plH.bob = -Math.round(Math.abs(Math.sin(Math.min(1, plH.t / .6) * Math.PI)) * 9); if (plH.t > .65) plHelperNext(n); }
  else if (a.k === "spin") { plH.flip = Math.floor(plH.t * 12) % 2 === 0; plH.face = ["down", "up"][Math.floor(plH.t * 6) % 2]; if (plH.t > .9) plHelperNext(n); }
  else if (a.k === "dance") { plH.flip = Math.floor(plH.t * 6) % 2 === 0; plH.bob = Math.floor(plH.t * 10) % 2 ? -3 : 0; plH.ph = Math.floor(plH.t * 8) % 2 ? 1 : 3; if (plH.t > 2) plHelperNext(n); }
  else if (a.k === "heart") { if (plH.t < .1 && !plH.hearts.length) for (let i = 0; i < 5; i++) plH.hearts.push({ x:(i - 2) * 5, y:-30, vy:-14 - i * 2, l:1.2 - i * .05, t:-i * .12 }); if (plH.t > 1.4) plHelperNext(n); }
  else if (a.k === "walk") {
    const d = plH.dir || [0, 0], step = 40 * dt; if (plH.left <= 0 || (!d[0] && !d[1])) { plHelperNext(n); return; }
    const nx = n.x + d[0] * step, ny = n.y + d[1] * step; if (plH.prev ? (nx < 12 || nx > 308 || ny < 104 || ny > 166) : vBlocked(nx, ny)) { plHelperNext(n); return; }
    n.x = nx; n.y = ny; plH.left -= step; plH.wp += step; plH.walking = true; if (d[0]) plH.flip = d[0] < 0; plH.face = d[1] < 0 ? "up" : "down"; plH.ph = Math.floor(plH.wp / 5) % 4;
  }
  plH.hearts = plH.hearts.filter(h => { h.t += dt; if (h.t > 0) h.y += h.vy * dt; return h.t < h.l; });
}
function plHelperDraw(c, n, t, mv, drawSp) {
  const s = vNpcFrames(n.def), act = mv && plH.i >= 0, flip = act ? plH.flip : V.x < n.x, ph = act ? plH.ph : 4, f = act && plH.face === "up" && plH.walking ? vNpcUp(s, ph) : s.down[ph];
  drawSp(null, n.x, n.y, flip, act ? plH.bob : (mv && Math.sin(t * 2.2) > .3 ? -1 : 0), f);
  if (act && plH.bub) { const w = plTextW(plH.bub.toUpperCase(), 1) + 8, bx = Math.round(n.x - w / 2), by = Math.round(n.y - 52); c.fillStyle = "#fff8e8"; c.fillRect(bx, by, w, 11); c.fillRect(Math.round(n.x) - 2, by + 11, 4, 2); c.fillRect(Math.round(n.x) - 1, by + 13, 2, 1); c.fillStyle = "#2a1a3a"; c.fillRect(bx, by, w, 1); c.fillRect(bx, by + 10, w, 1); c.fillRect(bx, by, 1, 11); c.fillRect(bx + w - 1, by, 1, 11); plText(c, plH.bub.toUpperCase(), bx + 4, by + 3, "#2a1a3a", 1); }
  if (act) plH.hearts.forEach(h => { if (h.t < 0) return; const hx = Math.round(n.x + h.x), hy = Math.round(n.y + h.y); c.globalAlpha = Math.max(0, 1 - h.t / h.l); c.fillStyle = "#ff4d7a"; c.fillRect(hx, hy, 2, 2); c.fillRect(hx + 3, hy, 2, 2); c.fillRect(hx - 1, hy + 1, 6, 2); c.fillRect(hx, hy + 3, 4, 1); c.fillRect(hx + 1, hy + 4, 2, 1); c.globalAlpha = 1; });
}
/* a plain sentence for people who cannot or do not want to watch the animation */
const plHelperSummary = acts => (acts || []).map(a => a.k === "say" ? "says “" + a.t + "”" : a.k === "walk" ? "walks " + a.d + " " + a.n : a.k === "wait" ? "waits " + a.s + "s" : a.k === "wave" ? "waves" : a.k === "jump" ? "jumps" : a.k === "spin" ? "spins" : a.k === "dance" ? "dances" : "makes a heart").join(", then ");
