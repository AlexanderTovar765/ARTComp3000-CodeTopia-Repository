/* Village people come alive: they wander a little around their spot on walking frames, turn to look at you, hop to greet you
   when you arrive, and a few have a job (the smith hammers, the mentors sparkle, Mimi bounces). The art is the same sprites as
   before; walking frames are made by walk.js. Nothing moves for users who prefer reduced motion. */

"use strict";

const NPC_CFG = {
  lib:{ r:14, sp:16, mote:"#fff6d8" }, forge:{ r:0, act:"hammer" }, g_courier:{ r:50, sp:40 }, g_kid:{ r:24, sp:30, act:"bounce" }, g_baker:{ r:18, sp:18, act:"flour" },
  g_watch:{ r:26, sp:20 }, dbug:{ r:34, sp:24 }, glasses:{ r:0 },
  html:{ r:10, sp:14, mote:"#ff9a5a" }, css:{ r:10, sp:14, mote:"#6fb0ff" }, cpp:{ r:10, sp:14, mote:"#8fd0ff" }, js:{ r:10, sp:14, mote:"#ffd23f" }, py:{ r:10, sp:14, mote:"#7ae08f" }
};
const vNpcCache = new Map();
/* walking frames (down) and the view from behind (up) for any sprite def */
function vNpcFrames(def) {
  let s = vNpcCache.get(def); if (s) return s;
  const g = WALK.grid(def), mk = (gr, ph) => { const f = WALK.frame(gr, "fb", ph), h = f.length, w = f[0].length, o = vCanvas(w, h);
    f.forEach((r, y) => r.forEach((c, x) => { if (c) { o.c.fillStyle = c; o.c.fillRect(x, y, 1, 1); } })); return { cv:o.cv, w, h }; };
  s = { g, down:[0, 1, 2, 3, 4].map(p => mk(g, p)), up:null, mk };
  vNpcCache.set(def, s); return s;
}
function vNpcUp(s, ph) { if (!s.up) { let b = null; try { b = WALK.backOf(s.g, "npc"); } catch (e) { b = null; } s.up = [0, 1, 2, 3, 4].map(p => s.mk(b || s.g, p)); } return s.up[ph]; }

function vNpcAI(n) {
  if (n.ai) return n.ai;
  const cfg = NPC_CFG[n.id] || { r:12, sp:18 };
  return n.ai = { cfg, hx:n.x, hy:n.y, st:"idle", tm:.5 + Math.random() * 3, tx:n.x, ty:n.y, wp:0, face:"down", flip:Math.random() < .5, hop:0, cool:0, near:false, p:[], beat:Math.random() * 3 };
}
function vNpcUpdate(dt) {
  const sc = V.sc; if (!sc || reduce || V.trans) return; dt = Math.min(.08, dt);
  sc.npcs.forEach(n => {
    if (n.plot) { plHelperUpdate(n, dt); return; }
    if (n.still) return; const a = vNpcAI(n), cfg = a.cfg, dh = Math.hypot(V.x - n.x, V.y - n.y), talking = V.bubNpc === n;
    a.cool -= dt; a.beat += dt;
    /* greet: you walk up, they hop */
    const close = dh < 46; if (close && !a.near && a.cool <= 0 && !n.cine) { a.hop = .62; a.cool = 9; } a.near = close;
    if (a.hop > 0) a.hop -= dt;
    a.p = a.p.filter(q => (q.l -= dt) > 0); a.p.forEach(q => { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += (q.g || 0) * dt; });
    if (cfg.act === "hammer" && a.beat % 1.5 < dt) for (let i = 0; i < 7; i++) a.p.push({ x:n.x + 13, y:n.y - 8, vx:(Math.random() - .2) * 34, vy:-18 - Math.random() * 26, g:90, l:.35 + Math.random() * .25, c:i % 2 ? "#ffd23f" : "#ff9a3a" });
    if (cfg.act === "flour" && !close && Math.random() < dt * .9) a.p.push({ x:n.x + (Math.random() - .5) * 14, y:n.y - 20, vx:(Math.random() - .5) * 8, vy:-6 - Math.random() * 6, g:6, l:.8, c:"#fff8ec" });
    if (cfg.mote && Math.random() < dt * 2.2) a.p.push({ x:n.x + (Math.random() - .5) * 22, y:n.y - 8 - Math.random() * 28, vx:(Math.random() - .5) * 6, vy:-8 - Math.random() * 8, g:0, l:.9, c:cfg.mote });
    if (cfg.act === "bounce" && a.st === "idle" && !close && a.hop <= 0 && a.beat % 2.6 < dt) a.hop = .62;
    if (a.st === "walk") {
      if (talking || dh < 30) { a.st = "idle"; a.tm = 1.2; return; }
      const dx = a.tx - n.x, dy = a.ty - n.y, d = Math.hypot(dx, dy), step = cfg.sp * dt;
      if (d <= step) { n.x = a.tx; n.y = a.ty; a.st = "idle"; a.tm = 1.5 + Math.random() * 3.5; return; }
      const nx = n.x + dx / d * step, ny = n.y + dy / d * step;
      if (vBlocked(nx, ny) || Math.hypot(V.x - nx, V.y - ny) < 22) { a.st = "idle"; a.tm = 1 + Math.random() * 2; return; }
      n.x = nx; n.y = ny; a.wp += step; a.face = Math.abs(dy) > Math.abs(dx) * 1.3 ? (dy > 0 ? "down" : "up") : "down"; if (Math.abs(dx) > .01) a.flip = dx < 0;
    } else {
      a.tm -= dt; if (a.tm > 0 || talking || close) return;
      if (cfg.r > 0 && Math.random() < .65) {
        const ang = Math.random() * 6.283, rr = 8 + Math.random() * cfg.r, tx = a.hx + Math.cos(ang) * rr, ty = a.hy + Math.sin(ang) * rr * .6;
        if (!vBlocked(tx, ty)) { a.tx = tx; a.ty = ty; a.st = "walk"; return; }
      }
      a.flip = !a.flip; a.face = "down"; a.tm = 1.5 + Math.random() * 3;
    }
  });
}
/* draw one person (the canvas is already in world coordinates); drawSp is the village sprite helper */
function vNpcDraw(c, n, i, t, mv, drawSp) {
  if (n.plot) { plHelperDraw(c, n, t, mv, drawSp); return; }
  const a = vNpcAI(n), s = vNpcFrames(n.def), walking = mv && a.st === "walk", dh = Math.hypot(V.x - n.x, V.y - n.y);
  let ph = walking ? Math.floor(a.wp / 5) % 4 : 4, bob = 0, flip;
  if (!mv) flip = V.x < n.x;
  else if (walking) flip = a.flip;
  else if (dh < 90 || V.bubNpc === n) flip = V.x < n.x;
  else flip = a.flip;
  if (mv && a.hop > 0) { const u = 1 - a.hop / .62; bob = -Math.round(Math.abs(Math.sin(u * Math.PI * 2)) * 5); ph = Math.abs(Math.sin(u * Math.PI * 2)) > .1 ? 1 : 4; }
  else if (mv && a.cfg.act === "hammer") { const u = (a.beat % 1.5) / 1.5; bob = u < .5 ? -Math.round(Math.sin(u * Math.PI * 2) * 3) : u > .8 && u < .9 ? 1 : 0; }
  else if (mv && !walking) bob = Math.sin(t * 2.2 + i * 1.7) > .3 ? -1 : 0;
  const f = a.face === "up" && walking ? vNpcUp(s, ph) : s.down[ph];
  drawSp(null, n.x, n.y, flip, bob, f);
  if (mv) a.p.forEach(q => { c.globalAlpha = Math.min(1, q.l * 2.2); c.fillStyle = q.c; c.fillRect(Math.round(q.x), Math.round(q.y), 1, 1); if (q.c === a.cfg.mote) c.fillRect(Math.round(q.x) - 1, Math.round(q.y), 3, 1); c.globalAlpha = 1; });
}
