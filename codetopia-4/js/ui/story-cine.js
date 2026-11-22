/* A grander opening. This layer sits on top of the painted story scenes: a slow camera (push-ins, pans and a
   pull-back reveal), widescreen bars that open like curtains, god rays, drifting dust and embers, lightning bloom
   with thunder and shake, film grain, fades between scenes and a closing card. Reduced motion keeps the bars and drops the movement. */

"use strict";

const CN = { pre:false, ending:false, fired:{}, shake:0, parts:[], tm:[], dip:null, last:0, grainT:0, built:false };
const CN_LB = "11vh";
/* camera for each scene: zoom from, zoom to, transform origin, pan from %, pan to % */
const CN_CAM = [[1, 1.11, "28% 64%", -1.2, 1.2], [1.09, 1.09, "50% 60%", -2.4, 2.4], [1.04, 1.18, "50% 16%", 0, 0], [1.04, 1.14, "50% 55%", 1.4, -1.4], [1.17, 1.02, "50% 72%", 0, 0], [1, 1.16, "42% 80%", 0, 0]];
const cnEase = u => u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
const cnLater = (fn, ms) => { CN.tm.push(setTimeout(fn, ms)); };
const cnSnd = n => { try { if (SND.ready) SND.sfx(n); } catch (e) {} };

function cnBuild() {
  if (CN.built) return; CN.built = true; const s = $("#story"), mk = (tag, cls, html) => { const e = document.createElement(tag); e.className = cls; if (html) e.innerHTML = html; e.setAttribute("aria-hidden", "true"); return e; };
  CN.fx = mk("canvas", "cn-fx"); CN.rays = mk("div", "cn-rays"); CN.vig = mk("div", "cn-vig"); CN.grain = mk("canvas", "cn-grain"); CN.flash = mk("div", "cn-flash"); CN.streak = mk("div", "cn-streak");
  CN.dip = mk("div", "cn-dip"); CN.card = mk("div", "cn-card"); CN.card.hidden = true;
  const cv = $("#scv"); cv.after(CN.fx, CN.rays, CN.vig, CN.grain, CN.flash, CN.streak, CN.dip, CN.card); CN.grain.width = 160; CN.grain.height = 90;
}
function cnSize() { CN.fx.width = innerWidth; CN.fx.height = innerHeight; const n = innerWidth < 600 ? 34 : 70; CN.parts = Array.from({ length:n }, () => cnPart(true)); }
function cnPart(init) { return { x:Math.random() * innerWidth, y:init ? Math.random() * innerHeight : innerHeight + 10, z:.25 + Math.random() * .75, ph:Math.random() * 6.28, hot:Math.random(), vx:(Math.random() - .3) * 10, vy:-(6 + Math.random() * 14) }; }

/* ----- start: no title card, the painted story begins straight away under the widescreen bars ----- */
function cineStart() {
  cnBuild(); cnSize(); CN.fired = {}; CN.shake = 0; CN.ending = false; CN.pre = false; CN.tm.forEach(clearTimeout); CN.tm = []; CN.last = 0; story.classList.remove("cn-end", "cn-intro");
  CN.dip.style.opacity = 0; CN.card.hidden = true; story.style.setProperty("--lb", CN_LB);
}
/* kept so the Next button code stays the same: there is no title card to skip any more */
function cineSkipTitle() { return false; }

/* ----- scenes ----- */
function cineScene(i) {
  CN.fired[i] = {};
  if (!reduce) CN.dip.animate([{ opacity:1 }, { opacity:1, offset:.18 }, { opacity:0 }], { duration:1100 });
}
function cineFrame(now, lt, si) {
  if (!CN.built) return; const t = now / 1000, dt = Math.min(.05, Math.max(0, (now - CN.last) / 1000)); CN.last = now;
  const m = moodAt(si, Math.max(0, lt)), W = innerWidth, H = innerHeight, f = CN.fired[si] || (CN.fired[si] = {});
  CN.vig.style.opacity = (.55 + .45 * m).toFixed(2);
  if (reduce) return;
  /* camera */
  const cam = CN_CAM[si] || CN_CAM[0], u = cnEase(Math.max(0, Math.min(1, lt / STORY[si].dur))), z = cam[0] + (cam[1] - cam[0]) * u, px = cam[3] + (cam[4] - cam[3]) * u;
  CN.shake *= .9; const sx = (Math.random() - .5) * CN.shake, sy = (Math.random() - .5) * CN.shake;
  const cv = $("#scv"); cv.style.transformOrigin = cam[2]; cv.style.transform = `translate(${px + sx / 8}%,${sy / 8}%) scale(${z.toFixed(4)})`;
  CN.fx.style.transformOrigin = cam[2]; CN.fx.style.transform = `translate(${px * 1.7 + sx / 5}%,${sy / 5}%) scale(${(1 + (z - 1) * 2.3).toFixed(4)})`;
  /* light: god rays in the bright scenes, a vignette that tightens as the mood darkens */
  CN.rays.style.opacity = (Math.max(0, 1 - m / .65) * .9).toFixed(2);
  /* lightning bloom, thunder and shake */
  let fl = 0; (STRIKES[si] || []).forEach((ts, j) => { const d = lt - ts;
    if (d >= 0 && d < .45) { fl = Math.max(fl, 1 - d / .45); if (!f["s" + j]) { f["s" + j] = 1; CN.shake = 18; cnLater(() => cnSnd("thunder"), 220); } } });
  CN.flash.style.opacity = (fl * .6).toFixed(3); CN.streak.style.opacity = Math.min(1, fl * 1.4).toFixed(3); CN.streak.style.transform = `scaleX(${(.6 + fl * .6).toFixed(2)})`;
  if (si === 2 && lt > 1 && !f.r) { f.r = 1; cnSnd("reveal"); CN.shake = 8; }
  if (si === 3 && lt > 1.6 && !f.r) { f.r = 1; cnSnd("rumble"); CN.shake = 10; }
  if (si === 4 && lt > 1 && !f.r) { f.r = 1; cnSnd("reveal"); }
  /* dust and motes in the light, embers and green sparks in the dark */
  const c = CN.fx.getContext("2d"); c.clearRect(0, 0, W, H); c.globalCompositeOperation = "lighter";
  CN.parts.forEach((p, i) => {
    p.x += (p.vx + Math.sin(t * .7 + p.ph) * 8) * p.z * dt * (m > .5 ? 2.2 : 1); p.y += p.vy * p.z * dt * (m > .5 ? 2.6 : 1);
    if (p.y < -12 || p.x < -12 || p.x > W + 12) CN.parts[i] = cnPart(false);
    const dark = m > .5, cursed = si >= 3 && p.hot > .5, col = !dark ? "255,236,170" : cursed ? "124,255,154" : "255,150,60", s = Math.max(1, Math.round(p.z * (dark ? 3 : 4))), a = (.25 + .5 * Math.max(0, Math.sin(t * 2.2 + p.ph))) * (dark ? .9 : .6) * p.z;
    c.fillStyle = `rgba(${col},${a.toFixed(3)})`; c.fillRect(Math.round(p.x), Math.round(p.y), s, s); if (s > 2) { c.fillStyle = `rgba(${col},${(a * .25).toFixed(3)})`; c.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, s + 2, s + 2); }
  });
  c.globalCompositeOperation = "source-over";
  /* film grain */
  if (now - CN.grainT > 80) { CN.grainT = now; const g = CN.grain.getContext("2d"), im = g.createImageData(160, 90), d = im.data; for (let k = 0; k < d.length; k += 4) { const v = Math.random() * 255; d[k] = d[k + 1] = d[k + 2] = v; d[k + 3] = 255; } g.putImageData(im, 0, 0); }
}

/* ----- the closing card ----- */
function cineEnd(done) {
  CN.card.hidden = false; CN.card.style.opacity = 1; story.classList.add("cn-end");
  CN.card.innerHTML = `<div class="cn-burst small"></div><div class="cn-t2"><small>The curse is spreading</small><b class="sm">Your quest begins</b></div>`;
  const t2 = CN.card.querySelector(".cn-t2"); CN.card.animate([{ opacity:0 }, { opacity:1 }], { duration:900, fill:"both" });
  t2.animate([{ opacity:0, transform:"scale(1.2)" }, { opacity:1, transform:"scale(1)", offset:.5 }, { opacity:1, transform:"scale(1.03)" }], { duration:2400, fill:"both", easing:"ease-out" });
  cnSnd("boom"); cnLater(done, 2600);
}
function cineStop() {
  CN.tm.forEach(clearTimeout); CN.tm = []; CN.pre = false; CN.ending = false; if (!CN.built) return; story.classList.remove("cn-intro", "cn-end"); CN.card.hidden = true; CN.dip.style.opacity = 0;
  const cv = $("#scv"); cv.style.transform = ""; CN.fx.style.transform = ""; story.style.removeProperty("--lb");
}
addEventListener("resize", () => { if (CN.built && !story.hidden) cnSize(); });
