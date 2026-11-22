/* Debuggers' Guild animation: D-Bug is alive (bobs, twitches, talks while he speaks, shakes his head at a wrong guess, nods at a
   right one, cheers when a case closes), real bugs crawl over the cork board and scurry from your cursor, and when you find the
   bug it runs out of its line. Reduced motion keeps everything still. */

"use strict";

const GA = { raf:0, last:0, mood:{ k:"idle", t0:0, d:1 }, talk:0, crawl:null, mx:-99, my:-99 };
const gaDef = () => SPRITES.vil_dbug;
/* a mood lasts d seconds then falls back to idle */
function gaMood(k, d) { GA.mood = { k, t0:performance.now() / 1000, d:d || ({ cheer:1.4, no:.6, think:1.1, nod:.55 }[k] || 1) }; }

function gaPose(t) {
  const m = GA.mood, u = (t - m.t0) / m.d; let p = { dx:0, dy:0, rot:0, sx:1, sy:1 };
  if (u >= 0 && u < 1) {
    if (m.k === "cheer") { const a = Math.abs(Math.sin(u * Math.PI * 3)); p.dy = -Math.round(a * 12); if (a > .1) p.sx = Math.cos(u * Math.PI * 6); else p.sy = .9; p.rot = Math.sin(u * Math.PI * 6) * .08; return p; }
    if (m.k === "no") { p.dx = Math.round(Math.sin(u * Math.PI * 8) * 3 * (1 - u)); p.rot = Math.sin(u * Math.PI * 8) * .1 * (1 - u); return p; }
    if (m.k === "think") { p.rot = Math.sin(u * Math.PI) * .16; p.dy = -1; return p; }
    if (m.k === "nod") { p.dy = Math.round(Math.sin(u * Math.PI * 2) * 3); p.sy = 1 - Math.abs(Math.sin(u * Math.PI * 2)) * .06; return p; }
  }
  if (GA.talk > t) { p.dy = Math.sin(t * 22) > 0 ? -1 : 0; p.sy = 1 + Math.sin(t * 22) * .02; return p; }
  p.dy = Math.sin(t * 3) > .4 ? -1 : 0; const c = t % 4.7; if (c < .45) p.rot = Math.sin(c * 40) * .07;
  return p;
}
function gaPaintPic(cv, t, still) {
  const c = cv.getContext("2d"), s = vSprite(gaDef()), W = cv.width, H = cv.height, p = still ? { dx:0, dy:0, rot:0, sx:1, sy:1 } : gaPose(t);
  c.imageSmoothingEnabled = false; c.clearRect(0, 0, W, H);
  c.fillStyle = "rgba(10,6,30,.35)"; c.fillRect(Math.round(W / 2 - s.w * .32), H - 3, Math.round(s.w * .64), 2);
  c.save(); c.translate(Math.round(W / 2 + p.dx), H - 3 + p.dy); c.rotate(p.rot); c.scale(p.sx, p.sy); c.drawImage(s.cv, -Math.round(s.w / 2), -s.h); c.restore();
}
/* canvases that show D-Bug */
function gaMount(host, scale) {
  const s = vSprite(gaDef()), cv = document.createElement("canvas"); cv.width = s.w + 6; cv.height = s.h + 12; cv.className = "ga-dbug"; cv.setAttribute("aria-hidden", "true");
  cv.style.width = cv.width * scale + "px"; cv.style.height = cv.height * scale + "px"; host.replaceChildren(cv); gaPaintPic(cv, 0, true); return cv;
}
function gaPics() { return $$("#guild canvas.ga-dbug"); }

/* ---------- bugs crawling over the board ---------- */
function gaCrawlInit() {
  const g = $("#gdGrid"); if (!g || reduce) return; let cv = g.querySelector(".ga-crawl");
  if (!cv) { cv = document.createElement("canvas"); cv.className = "ga-crawl"; cv.setAttribute("aria-hidden", "true"); g.appendChild(cv); }
  const n = Math.min(7, GUILD_CASES.filter(c => c.lang === GD.lang && guildStars(c.id) === 0).length), col = (typeof GD_LANG_COL !== "undefined" && GD_LANG_COL[GD.lang]) || "#ffb74d";
  GA.crawl = { cv, S:3, col, bugs:Array.from({ length:n }, (_, i) => ({ x:30 + Math.random() * 200, y:30 + Math.random() * 160, th:Math.random() * 6.28, v:12 + Math.random() * 8, turn:Math.random() * 2, pause:0, ph:Math.random() * 9, type:i % 3 })) };
}
function gaCrawlStep(dt) {
  const C = GA.crawl, g = $("#gdGrid"); if (!C || !g.isConnected || !g.clientWidth) return;
  const W = Math.ceil(g.clientWidth / C.S), H = Math.ceil(g.clientHeight / C.S); if (C.cv.width !== W || C.cv.height !== H) { C.cv.width = W; C.cv.height = H; }
  const c = C.cv.getContext("2d"); c.clearRect(0, 0, W, H); c.imageSmoothingEnabled = false;
  C.bugs.forEach(b => {
    const dm = Math.hypot(b.x - GA.mx, b.y - GA.my), flee = dm < 44;
    if (flee) { b.th = Math.atan2(b.y - GA.my, b.x - GA.mx); b.pause = 0; }
    b.turn -= dt; if (b.turn <= 0 && !flee) { b.turn = .8 + Math.random() * 2.2; b.th += (Math.random() - .5) * 2; if (Math.random() < .25) b.pause = .4 + Math.random() * .9; }
    if (b.pause > 0) b.pause -= dt;
    else { const v = flee ? 62 : b.v; b.x += Math.cos(b.th) * v * dt; b.y += Math.sin(b.th) * v * dt; b.ph += dt * (flee ? 26 : 12); }
    if (b.x < 6) { b.x = 6; b.th = Math.PI - b.th; } if (b.x > W - 6) { b.x = W - 6; b.th = Math.PI - b.th; } if (b.y < 6) { b.y = 6; b.th = -b.th; } if (b.y > H - 6) { b.y = H - 6; b.th = -b.th; }
    gaDrawBug(c, b.x, b.y, b.th, b.ph, C.col, b.type);
  });
}
/* a small beetle: shell, head, three legs a side that alternate, drawn facing right then rotated */
function gaDrawBug(c, x, y, th, ph, col, type, sc) {
  c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(th); if (sc) c.scale(sc, sc);
  const f = Math.floor(ph) % 2; c.fillStyle = "#1a1230";
  for (let i = 0; i < 3; i++) { const lx = -2 + i * 2 + ((i + f) % 2 ? 1 : 0); c.fillRect(lx, -4, 1, 2); c.fillRect(lx, 2, 1, 2); }
  c.fillStyle = "#1a1230"; c.fillRect(-4, -2, 8, 5); c.fillRect(4, -1, 2, 3); c.fillRect(5, -3, 1, 1); c.fillRect(5, 3, 1, 1);
  c.fillStyle = type === 1 ? "#6fd08a" : type === 2 ? "#ff7ab8" : col; c.fillRect(-3, -1, 6, 3); c.fillStyle = "#ffffff"; c.fillRect(-2, -1, 2, 1);
  if (type === 2) { c.fillStyle = "#1a1230"; c.fillRect(0, 0, 1, 1); c.fillRect(2, 1, 1, 1); } c.restore();
}
/* the bug you found runs out of its line and off the screen */
function gaBugOut(el) {
  if (reduce || !el) return; const host = $("#gdCase"), r = el.getBoundingClientRect(), h = host.getBoundingClientRect(), cv = document.createElement("canvas"); cv.width = 14; cv.height = 14;
  cv.style.cssText = `position:absolute;left:${r.right - h.left - 40}px;top:${r.top - h.top + r.height / 2 - 28}px;width:56px;height:56px;image-rendering:pixelated;pointer-events:none;z-index:5`; host.appendChild(cv);
  const c = cv.getContext("2d"); let n = 0; const iv = setInterval(() => { c.clearRect(0, 0, 14, 14); gaDrawBug(c, 7, 7, 0, n++, "#ffb74d", 0, 1); }, 70);
  const dist = Math.max(260, host.clientWidth - (r.right - h.left)); 
  cv.animate([{ transform:"translate(0,0) scale(.6)" }, { transform:"translate(10px,-34px) scale(1.5) rotate(-12deg)", offset:.22 }, { transform:"translate(40px,-4px) scale(1.2)", offset:.4 }, { transform:`translate(${dist}px,6px) scale(1.1)`, opacity:1, offset:.92 }, { transform:`translate(${dist + 20}px,6px)`, opacity:0 }],
    { duration:1500, easing:"ease-in" }).finished.then(() => { clearInterval(iv); cv.remove(); }, () => { clearInterval(iv); cv.remove(); });
}
/* stars and sparks over the case-closed stamp */
function gaWinBurst() {
  if (reduce) return; const st = $("#gdPanel .gd-stamp"); if (!st) return; const r = st.getBoundingClientRect(), cols = ["#ffd43b", "#fff3b0", "#7bbf3e", "#ffffff", "#ff7ab8"];
  for (let i = 0; i < 34; i++) {
    const p = document.createElement("i"), a = Math.random() * 6.283, d = 60 + Math.random() * 110, s = 4 + (i % 3) * 2;
    p.style.cssText = `position:fixed;left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;width:${s}px;height:${s}px;background:${cols[i % 5]};pointer-events:none;z-index:99;image-rendering:pixelated`; document.body.appendChild(p);
    p.animate([{ transform:"translate(0,0)", opacity:1 }, { transform:`translate(${Math.cos(a) * d}px,${Math.sin(a) * d - 30}px)`, opacity:1, offset:.5 }, { transform:`translate(${Math.cos(a) * d * 1.2}px,${Math.sin(a) * d + 50}px) rotate(300deg)`, opacity:0 }], { duration:1000 + Math.random() * 500, easing:"cubic-bezier(.2,.7,.4,1)" }).finished.then(() => p.remove(), () => p.remove());
  }
}
/* D-Bug types out what he says */
function gaType(el) {
  if (!el) return; const full = el.textContent; if (reduce || !full) return; el.textContent = ""; let i = 0; const tok = el._tok = (el._tok || 0) + 1;
  GA.talk = performance.now() / 1000 + full.length * .018 + .1;
  const step = () => { if (el._tok !== tok) return; i = Math.min(full.length, i + 2); el.textContent = full.slice(0, i); if (i < full.length) setTimeout(step, 18); }; step();
}

function gaLoop(now) {
  if ($("#guild").hidden) { GA.raf = 0; return; }
  const t = now / 1000, dt = Math.min(.05, Math.max(0, (now - GA.last) / 1000)); GA.last = now;
  gaPics().forEach(cv => { if (cv.offsetParent) gaPaintPic(cv, t); });
  if (!$("#gdBoard").hidden) gaCrawlStep(dt);
  GA.raf = requestAnimationFrame(gaLoop);
}
function gaStart() { if (reduce || GA.raf) return; GA.last = performance.now(); GA.raf = requestAnimationFrame(gaLoop); }
function gaBoard() {
  gaMount($("#gdPic"), 2.7); const m = $("#gdMini"); if (m && !m.firstChild) gaMount(m, 2);
  gaCrawlInit(); gaType($("#gdSay")); gaStart(); gaMood("idle", 1);
}
function gaCase() { const m = $("#gdMini"); if (m && !m.firstChild) gaMount(m, 2); gaMood("think"); gaStart(); }
$("#gdGrid").addEventListener("mousemove", e => { const C = GA.crawl; if (!C) return; const r = $("#gdGrid").getBoundingClientRect(); GA.mx = (e.clientX - r.left) / C.S; GA.my = (e.clientY - r.top) / C.S; });
$("#gdGrid").addEventListener("mouseleave", () => { GA.mx = GA.my = -99; });
