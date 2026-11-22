/* Village ambience. Small living details that follow how far the curse has lifted (V.st: 0 storm night, 1 night, 2 dusk, 3 dawn, 4 morning):
   rain and splashes in the storm, bats at night and dusk, flocks of birds, sparrows that peck and flee, butterflies, drifting leaves
   and pollen in the day, and richer chimney smoke with sparks after dark. Everything is drawn straight onto the village canvas. */

"use strict";

const AMB_HASH = (a, b = 0) => { let h = (Math.imul(a + 1, 374761393) + Math.imul(b + 7, 668265263)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
const AMB_DRAW = (c, rows, pal, x, y, flip) => { const w = rows[0].length; rows.forEach((r, j) => { for (let i = 0; i < w; i++) { const ch = r[flip ? w - 1 - i : i]; if (ch !== ".") { c.fillStyle = pal[ch]; c.fillRect(Math.round(x) + i, Math.round(y) + j, 1, 1); } } }); };

/* sparrow art, facing right (8 wide, 7 high) */
const AMB_SPARROW = {
  pal:{ d:"#5a3a22", b:"#8a5a30", t:"#b98a52", w:"#f0e0c0", k:"#1a1330", y:"#ffb030", l:"#c98a50", f:"#6a4424" },
  stand:["....dd..", "...dbkby", ".dbbbbb.", "dbbbwww.", ".bbwww..", "..l.l..."],
  peck: [".......", ".d.....", "dbbbb...", ".bbbbdd.", ".bwwbkby", "..l.l..."].map(r => r.padEnd(8, ".")),
  up:   ["d....dd.", ".d..dbkb", "..bbbbby", ".bbbwww.", "..bwww..", "........"].map(r => r.padEnd(8, ".")),
  down: ["....dd..", "...dbkby", "dbbbbb..", "dbbwww..", ".d..d...", "........"]
};

function ambSpot(sc, avoidX, avoidY) {
  for (let k = 0; k < 24; k++) {
    const x = sc.walk.x0 + 20 + Math.random() * (sc.walk.x1 - sc.walk.x0 - 40), y = sc.walk.y0 + 10 + Math.random() * (sc.walk.y1 - sc.walk.y0 - 20);
    if (vBlocked(x, y) || vBlocked(x - 6, y) || vBlocked(x + 6, y)) continue;
    if (Math.hypot(x - avoidX, y - avoidY) < 70) continue;
    if (sc.npcs.some(n => Math.hypot(n.x - x, n.y - y) < 26)) continue;
    return [x, y];
  }
  return null;
}

/* Sparrows and butterflies live in the scene, so they are sorted in with the props and people. */
function vAmbEnts(sc, t) {
  const A = sc.amb || (sc.amb = { t, birds:null }), dt = Math.min(.1, Math.max(0, t - A.t)); A.t = t;
  const out = [], day = sc.st >= 3 && !sc.dark;
  if (!A.birds) A.birds = Array.from({ length:sc.id === "sq" ? 6 : 3 }, (_, i) => ({ i, mode:"gone", tm:1 + i * 1.3 + Math.random() * 3, x:0, y:0, z:0, dir:1, vx:0, vz:0, a:0, n:0 }));
  A.birds.forEach(b => {
    const dh = Math.hypot(V.x - b.x, (V.y - b.y) * 1.4);
    if (b.mode === "gone") { b.tm -= dt; if (b.tm <= 0 && day) { const p = ambSpot(sc, V.x, V.y); if (p) { b.x = p[0]; b.y = p[1]; b.z = 70; b.mode = "land"; b.dir = Math.random() < .5 ? -1 : 1; b.vx = b.dir * 18; } else b.tm = 3; } return; }
    if (!day && b.mode !== "fly") { b.mode = "fly"; b.vx = (b.x < V.x ? -1 : 1) * 50; b.vz = 45; }
    if (b.mode === "peck" || b.mode === "hop") { if (dh < 38) { b.mode = "fly"; b.dir = b.x < V.x ? -1 : 1; b.vx = b.dir * (45 + Math.random() * 20); b.vz = 40 + Math.random() * 20; } }
    b.a += dt;
    if (b.mode === "land") { b.z -= 55 * dt; b.x += b.vx * dt; if (b.z <= 0) { b.z = 0; b.mode = "peck"; b.a = 0; b.tm = 1 + Math.random() * 2; b.n = 0; } }
    else if (b.mode === "peck") {
      b.tm -= dt;
      if (b.tm <= 0) { b.a = 0; if (Math.random() < .5) { const nx = b.x + (Math.random() < .5 ? -1 : 1) * (6 + Math.random() * 10), ny = b.y + (Math.random() - .5) * 6; if (!vBlocked(nx, ny) && !vBlocked(nx + (nx > b.x ? 6 : -6), ny)) { b.dir = nx > b.x ? 1 : -1; b.hx = nx; b.hy = ny; b.hx0 = b.x; b.hy0 = b.y; b.mode = "hop"; } } else b.tm = .8 + Math.random() * 2; if (Math.random() < .12) { b.mode = "fly"; b.dir = Math.random() < .5 ? -1 : 1; b.vx = b.dir * 40; b.vz = 45; } }
    } else if (b.mode === "hop") { const u = Math.min(1, b.a / .28); b.x = b.hx0 + (b.hx - b.hx0) * u; b.y = b.hy0 + (b.hy - b.hy0) * u; b.z = 5 * Math.sin(u * Math.PI); if (u >= 1) { b.z = 0; b.mode = "peck"; b.a = 0; b.tm = .6 + Math.random() * 1.5; } }
    else if (b.mode === "fly") { b.x += b.vx * dt; b.z += b.vz * dt; b.vz += 12 * dt; b.vx *= 1 + .1 * dt; if (b.z > 120 || b.x < -20 || b.x > sc.w + 20) { b.mode = "gone"; b.tm = 8 + Math.random() * 14; } }
    const bb = b;
    out.push({ y:bb.y, amb:c => {
      const S = AMB_SPARROW, air = bb.z > 1.5, fr = bb.mode === "fly" || bb.mode === "land" ? (Math.floor(t * 14 + bb.i) % 2 ? S.up : S.down) : bb.mode === "peck" && Math.floor(bb.a * 6) % 2 && bb.n < 9 ? S.peck : S.stand;
      c.fillStyle = "rgba(10,6,30,.28)"; if (air) c.fillRect(Math.round(bb.x - 2), Math.round(bb.y), 4, 1); else c.fillRect(Math.round(bb.x - 3), Math.round(bb.y), 7, 1);
      AMB_DRAW(c, fr, S.pal, bb.x - 4, bb.y - 6 - bb.z, bb.dir < 0);
    } });
  });
  if (day && t > 0) { const n = sc.id === "sq" ? 4 : 2, cols = [["#ffd23f", "#b88a10"], ["#ff7ab8", "#b83a70"], ["#9fd0ff", "#4a7ab8"], ["#ffffff", "#b0b8d0"]];
    for (let i = 0; i < n; i++) {
      const cx = 60 + AMB_HASH(i, sc.id.length) * (sc.w - 120), cy = sc.walk.y0 + 24 + AMB_HASH(i, 9) * (sc.h - sc.walk.y0 - 60), ph = i * 2.3;
      const x = cx + Math.sin(t * .27 + ph) * 44 + Math.sin(t * 1.1 + ph) * 5, y = cy + Math.sin(t * .35 + ph * 1.7) * 18 + Math.sin(t * 2.3 + ph) * 3 - 14, open = Math.floor(t * 7 + i) % 3 !== 0, col = cols[i % 4];
      out.push({ y:y + 40, amb:c => { c.fillStyle = "rgba(10,6,30,.18)"; c.fillRect(Math.round(x), Math.round(y + 14 + Math.sin(t * 2.3 + ph) * 2), 2, 1); const X = Math.round(x), Y = Math.round(y);
        c.fillStyle = col[0]; if (open) { c.fillRect(X - 2, Y - 1, 2, 2); c.fillRect(X + 1, Y - 1, 2, 2); c.fillStyle = col[1]; c.fillRect(X - 2, Y + 1, 1, 1); c.fillRect(X + 2, Y + 1, 1, 1); } else c.fillRect(X - 1, Y - 1, 1, 2); c.fillStyle = "#2a2240"; c.fillRect(X, Y - 1, 1, 2); } });
    } }
  return out;
}

/* High in the sky, behind the buildings: flocks of birds by day, bats after dark. */
function vAmbSky(c, t, sc, st) {
  if (sc.plot) plFwDraw(c);
  const W = sc.w, y0 = sc.cloudY[0] + 2, span = Math.max(14, sc.cloudY[1] - sc.cloudY[0]);
  if (st >= 3 && !sc.dark) {
    for (let k = 0; k < 2; k++) {
      const T = 38 + k * 11, u = ((t + k * 17) / T) % 1, act = .55; if (u > act) continue;
      const p = u / act, dir = k % 2 ? -1 : 1, x0 = dir > 0 ? -24 + p * (W + 60) : W + 24 - p * (W + 60), yb = y0 + 6 + k * 16 + Math.sin(p * 6 + k) * 3, n = 3 + k * 2;
      c.fillStyle = st === 3 ? "#4a2a50" : "#2a2650";
      for (let i = 0; i < n; i++) { const side = i ? (i % 2 ? 1 : -1) : 0, rank = Math.ceil(i / 2), bx = Math.round(x0 - dir * rank * 6), by = Math.round(yb + rank * 3 + side * 2 + Math.sin(t * 2 + i) * 1), up = Math.floor(t * 7 + i * .6 + k) % 2;
        if (up) { c.fillRect(bx, by, 1, 1); c.fillRect(bx + 1, by + 1, 3, 1); c.fillRect(bx + 4, by, 1, 1); } else { c.fillRect(bx, by + 1, 1, 1); c.fillRect(bx + 1, by, 3, 1); c.fillRect(bx + 4, by + 1, 1, 1); } }
    }
  }
  if (st >= 1 && st <= 2 || (sc.dark && st < 4)) {
    const n = st === 2 ? 4 : 3; c.fillStyle = st === 2 ? "#1c1238" : "#07050f";
    for (let i = 0; i < n; i++) {
      const sp = 22 + AMB_HASH(i, 3) * 14, dir = i % 2 ? -1 : 1, x = dir > 0 ? ((t * sp + i * 131) % (W + 80)) - 40 : W + 40 - ((t * sp + i * 131) % (W + 80)),
        y = y0 + 8 + (i * 17) % span + Math.sin(t * 1.9 + i * 2) * 8 + Math.sin(t * .6 + i) * 6, X = Math.round(x), Y = Math.round(y), up = Math.floor(t * 9 + i) % 2;
      c.fillRect(X, Y, 1, 2); c.fillRect(X - 1, Y - 1, 1, 1); c.fillRect(X + 1, Y - 1, 1, 1);
      if (up) { c.fillRect(X - 2, Y - 1, 1, 1); c.fillRect(X - 3, Y - 2, 1, 1); c.fillRect(X - 4, Y - 3, 1, 1); c.fillRect(X + 2, Y - 1, 1, 1); c.fillRect(X + 3, Y - 2, 1, 1); c.fillRect(X + 4, Y - 3, 1, 1); }
      else { c.fillRect(X - 2, Y, 1, 1); c.fillRect(X - 3, Y + 1, 1, 1); c.fillRect(X - 4, Y + 1, 1, 1); c.fillRect(X + 2, Y, 1, 1); c.fillRect(X + 3, Y + 1, 1, 1); c.fillRect(X + 4, Y + 1, 1, 1); }
    }
  }
}

/* Chimney smoke that drifts with the wind, and sparks from the chimneys after dark. */
function vAmbSmoke(c, t, sc, st) {
  const wind = st === 0 ? 16 : 8, tint = st >= 3 ? "#d8d2ee" : "#9088b8", thin = st === 0 ? .65 : 1;
  sc.smoke.forEach((s, k) => {
    for (let i = 0; i < 9; i++) {
      const ph = (t * .32 + i / 9 + k * .13) % 1, r = 1 + Math.floor(ph * 3.2), x = Math.round(s.x + wind * ph * ph + Math.sin(ph * 5 + i * 1.7 + k) * (1 + ph * 2)), y = Math.round(s.y - ph * 30);
      c.globalAlpha = Math.min(1, ph * 9) * (1 - ph) * .6 * thin; c.fillStyle = tint;
      c.fillRect(x - r + 1, y - r, 2 * r - 1, 1); c.fillRect(x - r, y - r + 1, 2 * r + 1, 2 * r - 1); c.fillRect(x - r + 1, y + r, 2 * r - 1, 1);
      c.globalAlpha = Math.min(1, ph * 9) * (1 - ph) * .3 * thin; c.fillStyle = "#ffffff"; c.fillRect(x - r + 1, y - r + 1, Math.max(1, r - 1), 1);
    }
    c.globalAlpha = 1;
    if (st < 4) for (let j = 0; j < 2; j++) { const ph = (t * .6 + j * .5 + k * .31) % 1; c.globalAlpha = (1 - ph) * .9; c.fillStyle = ph < .4 ? "#ffd86a" : "#ff8a2a"; c.fillRect(Math.round(s.x + Math.sin(ph * 9 + j * 3 + k) * 3 + ph * 4), Math.round(s.y - 1 - ph * 18), 1, 1); }
    c.globalAlpha = 1;
  });
}

/* In front of the camera: rain in the storm, drifting leaves and pollen by day. Drawn in screen space, after the world. */
function vAmbScreen(c, t, sc, st) {
  if (st === 0) {
    const gust = .7 + .3 * Math.sin(t * .4);
    for (let i = 0; i < 170; i++) {
      const near = i % 4 === 0, sp = near ? 210 + AMB_HASH(i) * 60 : 150 + AMB_HASH(i) * 50, len = near ? 5 : 3, y = (t * sp + AMB_HASH(i, 2) * 400) % (VSH + 12) - 6, x = Math.round(((AMB_HASH(i, 1) * (VSW + 60) + y * .28 * gust + t * 12 * gust) % (VSW + 60)) - 20);
      c.globalAlpha = near ? .75 : .45; c.fillStyle = near ? "#e4ecff" : "#a8bcf0"; for (let j = 0; j < len; j++) c.fillRect(x - Math.round(j * .28 * gust), Math.round(y) + j, 1, 1);
    }
    for (let i = 0; i < 16; i++) { const cyc = Math.floor(t * 2.2 + i * .7), ph = (t * 2.2 + i * .7) % 1, x = AMB_HASH(i, cyc) * VSW, y = 118 + AMB_HASH(i, cyc + 50) * (VSH - 128), r = 1 + Math.floor(ph * 3);
      c.globalAlpha = (1 - ph) * .55; c.fillStyle = "#cfe0ff"; c.fillRect(Math.round(x) - r, Math.round(y), 1, 1); c.fillRect(Math.round(x) + r, Math.round(y), 1, 1); c.fillRect(Math.round(x), Math.round(y) - Math.max(1, r - 1), 1, 1); }
    c.globalAlpha = 1;
  }
  if (st >= 3 && !sc.dark && sc.id !== "js") {
    const cols = ["#d9a03a", "#c4622a", "#8aa83a", "#b8482a", "#e6b84a"];
    for (let i = 0; i < 9; i++) {
      const P = 9 + AMB_HASH(i) * 6, u = (t / P + AMB_HASH(i, 4)) % 1, x = Math.round(((AMB_HASH(i, 1) * (VSW + 80) + u * 70 + Math.sin(u * 14 + i * 2) * 9) % (VSW + 80)) - 30), y = Math.round(-6 + u * (VSH + 12)), flip = Math.floor(t * 3 + i) % 2;
      c.globalAlpha = u > .92 ? (1 - u) / .08 : 1; c.fillStyle = cols[i % 5]; if (flip) { c.fillRect(x, y, 2, 1); } else { c.fillRect(x, y, 1, 2); }
    }
    c.globalAlpha = 1;
    for (let i = 0; i < 20; i++) { const x = ((AMB_HASH(i, 7) * VSW + t * (3 + AMB_HASH(i, 8) * 4)) % VSW), y = (AMB_HASH(i, 9) * (VSH - 20) + Math.sin(t * .5 + i * 3) * 8 + 10), tw = Math.max(0, Math.sin(t * 1.6 + i * 2.1));
      c.globalAlpha = .15 + tw * .6; c.fillStyle = st === 3 ? "#ffd6c0" : "#fffbe0"; c.fillRect(Math.round(x), Math.round(y), 1, 1); }
    c.globalAlpha = 1;
  }
}
