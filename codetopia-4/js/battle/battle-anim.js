/* Battle animation: the wind-up and cast, the hero's dash with walking frames, hit recoil and sparks, the foe's strike and
   dissolve, cheering, knock-out, and the entrance. It sits on top of the existing effects (anim, fly, hurt) and is skipped
   when the player prefers reduced motion. */

"use strict";

/* ---------- little pixel particles and sparks, drawn in the effects layer ---------- */
function pixBurst(x, y, cols, n, o = {}) {
  if (reduce) return;
  const { spread = 60, up = 40, grav = 60, size = 5, life = 700, area = null } = o;
  for (let i = 0; i < n; i++) {
    const p = document.createElement("i"), s = Math.max(2, Math.round(size * (.6 + Math.random() * .8))), px = x + (area ? (Math.random() - .5) * area[0] : 0), py = y + (area ? (Math.random() - .5) * area[1] : 0);
    p.className = "bp"; p.style.cssText = `left:${px}px;top:${py}px;width:${s}px;height:${s}px;background:${cols[i % cols.length]}`; fx.appendChild(p);
    const a = Math.random() * Math.PI * 2, sp = spread * (.4 + Math.random() * .6), dx = Math.cos(a) * sp, dy = Math.sin(a) * sp - up;
    p.animate([{ transform:"translate(0,0)", opacity:1 }, { transform:`translate(${dx}px,${dy}px)`, opacity:1, offset:.45 }, { transform:`translate(${dx * 1.25}px,${dy + grav}px)`, opacity:0 }],
      { duration:life * (.7 + Math.random() * .6), easing:"cubic-bezier(.2,.7,.4,1)" }).finished.then(() => p.remove(), () => p.remove());
  }
}
function sparkStar(x, y, col, big) {
  if (reduce) return;
  const len = big ? 24 : 15;
  for (let k = 0; k < 8; k++) {
    const r = document.createElement("i"), rot = k * 45 + 11; r.className = "bp ray"; r.style.cssText = `left:${x - 2}px;top:${y}px;width:4px;height:${len}px;background:${k % 2 ? "#ffffff" : col}`; fx.appendChild(r);
    r.animate([{ transform:`rotate(${rot}deg) translateY(2px) scaleY(.2)`, opacity:1 }, { transform:`rotate(${rot}deg) translateY(${len * .8}px) scaleY(1)`, opacity:1, offset:.4 }, { transform:`rotate(${rot}deg) translateY(${len * 1.5}px) scaleY(.15)`, opacity:0 }],
      { duration:big ? 380 : 300, easing:"ease-out" }).finished.then(() => r.remove(), () => r.remove());
  }
}
function dustPuff(el) {
  if (reduce) return; const c = center(el);
  pixBurst(c.x, c.y + c.h * .45, ["#d8d2ee", "#b8b0d8", "#ffffff"], 8, { spread:34, up:6, grav:-6, size:6, life:480 });
}

/* ---------- the hero's body can swap to walking frames for a moment ---------- */
const HB = {
  id() { return S.robe ? "pythona_robe" : (D.skin && SKIN_ART[D.skin] ? D.skin : "hero"); },
  /* walk in place on the 3/4 frames; call .stop() to put the normal sprite back */
  walk() {
    const none = { stop() {} }; if (reduce || typeof WALK === "undefined") return none;
    const body = $("#heroBody"), saved = body.firstElementChild; if (!saved || saved.tagName === "CANVAS") return none;
    let set; try { set = WALK.set(HB.id()); } catch (e) { return none; }
    const cv = document.createElement("canvas"), c = cv.getContext("2d"); let ph = 0, dead = false;
    cv.className = "sprite skin"; const draw = () => { const f = set.side[ph]; cv.width = f.w; cv.height = f.h; cv.style.setProperty("--cols", f.w); cv.style.setProperty("--rows", f.h); c.imageSmoothingEnabled = false; c.drawImage(f.cv, 0, 0); };
    draw(); body.replaceChildren(cv);
    const iv = setInterval(() => { ph = (ph + 1) % 4; draw(); }, 75);
    return { stop() { if (dead) return; dead = true; clearInterval(iv); if (body.firstElementChild === cv) body.replaceChildren(saved); } };
  }
};

/* ---------- the hero ---------- */
const BCOL = { attack:["#ffd43b", "#fff3b0"], heavy:["#ff6b81", "#ffd0d0"], block:["#6fb0ff", "#d8ecff"], item:["#b9e769", "#eaffc0"] };
/* wind-up: crouch back while light gathers at the hands, then the spell is released */
async function heroCast(a, from) {
  if (reduce) return;
  const col = BCOL[a] || BCOL.item;
  anim(hero, [{ transform:"translateX(0) scale(1,1)" }, { transform:"translateX(-8px) scale(1.07,.88)", offset:.65 }, { transform:"translateX(-3px) scale(.97,1.05)" }], { duration:230, easing:"ease-out" });
  for (let i = 0; i < 10; i++) {
    const o = document.createElement("i"), ang = Math.random() * 6.28, r = 38 + Math.random() * 26, s = 3 + (i % 3);
    o.className = "bp"; o.style.cssText = `left:${from.x}px;top:${from.y}px;width:${s}px;height:${s}px;background:${col[i % 2]}`; fx.appendChild(o);
    o.animate([{ transform:`translate(${Math.cos(ang) * r}px,${Math.sin(ang) * r}px)`, opacity:0 }, { opacity:1, offset:.3 }, { transform:"translate(0,0)", opacity:1 }], { duration:230, easing:"ease-in" }).finished.then(() => o.remove(), () => o.remove());
  }
  await wait(235);
  sparkStar(from.x, from.y, col[0], false);
}
/* the dash forward: walking frames, a lean into the strike, then back */
function heroLunge(heavy) {
  if (reduce) return lunge(hero, 34, 480);
  const dx = heavy ? 46 : 34, dur = heavy ? 760 : 480, w = HB.walk(); setTimeout(() => w.stop(), dur * .5);
  return anim(hero, [
    { transform:"translateX(-3px) rotate(0deg)" },
    { transform:`translateX(${dx * .8}px) rotate(2deg)`, offset:.3 },
    { transform:`translateX(${dx}px) rotate(${heavy ? 9 : 6}deg) scale(1.04,.97)`, offset:.42 },
    { transform:`translateX(${dx}px) rotate(${heavy ? 7 : 4}deg)`, offset:.58 },
    { transform:"translateX(0) rotate(0deg)" }
  ], { duration:dur, easing:"ease-in-out" });
}
function heroHop(n) {
  if (reduce) return Promise.resolve();
  return anim(hero, [
    { transform:"translateY(0) scale(1,1)" }, { transform:"translateY(0) scale(1.08,.88)", offset:.14 }, { transform:"translateY(-28px) scale(.95,1.07)", offset:.5 },
    { transform:"translateY(0) scale(1.07,.9)", offset:.86 }, { transform:"translateY(0) scale(1,1)" }
  ], { duration:430, iterations:n || 1, easing:"ease-out" });
}
function heroBrace() {
  if (reduce) return;
  anim(hero, [{ transform:"scale(1,1)" }, { transform:"translateX(-5px) scale(1.07,.9)", offset:.3 }, { transform:"translateX(-3px) scale(1.05,.93)", offset:.7 }, { transform:"scale(1,1)" }], { duration:520, easing:"ease-out" });
  const c = center(hero); pixBurst(c.x + c.w * .55, c.y, ["#6fb0ff", "#d8ecff", "#ffffff"], 10, { spread:30, up:10, grav:10, size:5, life:520 });
}
function heroHeal() {
  heroHop(1); if (reduce) return; const c = center(hero);
  pixBurst(c.x, c.y - c.h * .1, ["#b9e769", "#eaffc0", "#ffffff"], 18, { spread:42, up:48, grav:-20, size:5, life:900, area:[c.w * .7, c.h * .5] });
}

/* ---------- the foe ---------- */
/* a strike: crouch and lean back, dash with a stretch (the hit lands at 45% of the time), hold, return */
function foeStrike(dx, dur) {
  if (reduce) return lunge(foe, dx, dur);
  setTimeout(() => dustPuff(foe), dur * .2);
  return anim(foe, [
    { transform:"translateX(0) scale(1,1)" },
    { transform:"translateX(14px) scale(1.12,.84)", offset:.22 },
    { transform:`translateX(${dx}px) scale(.9,1.12)`, offset:.45 },
    { transform:`translateX(${dx}px) scale(1,1)`, offset:.58 },
    { transform:"translateX(0) scale(1,1)" }
  ], { duration:dur, easing:"ease-in-out" });
}
/* defeat: a white flash, then it bursts into the pieces it was made of */
async function foeDissolve(f) {
  if (reduce) { await anim(foe, [{ opacity:1 }, { opacity:0 }], { duration:300 }); return; }
  const c = center(foe), pal = Object.assign({}, SPRITES[f.spr].pal, f.pal || {}), cols = Object.values(pal).filter(Boolean), big = !!f.boss;
  anim(foe, [{ transform:"translateX(0)" }, { transform:"translateX(-6px)" }, { transform:"translateX(6px)" }, { transform:"translateX(-4px)" }, { transform:"translateX(0)" }], { duration:260 });
  await anim(foe, [{ filter:"brightness(1)" }, { filter:"brightness(3.2) saturate(.1)", offset:.5 }, { filter:"brightness(1)" }], { duration:260 });
  pixBurst(c.x, c.y, cols, big ? 70 : 38, { spread:big ? 120 : 84, up:48, grav:90, size:big ? 8 : 7, life:900, area:[c.w * .8, c.h * .8] });
  if (big) hurt(scene);
  await anim(foe, [{ opacity:1 }, { opacity:0 }], { duration:140, fill:"forwards" });
}
/* victory: confetti and a few happy hops */
function heroCheer() {
  if (reduce) return Promise.resolve();
  const w = scene.clientWidth, h = scene.clientHeight, cols = ["#ffd43b", "#ff7ab8", "#6fb0ff", "#b9e769", "#ffffff", "#c58bff"];
  for (let i = 0; i < 46; i++) {
    const p = document.createElement("i"), s = 4 + (i % 3) * 2, x = Math.random() * w, sway = (Math.random() - .5) * 90;
    p.className = "bp"; p.style.cssText = `left:${x}px;top:-12px;width:${s}px;height:${s}px;background:${cols[i % 6]}`; fx.appendChild(p);
    p.animate([{ transform:"translate(0,0) rotate(0deg)", opacity:1 }, { transform:`translate(${sway}px,${h * .55}px) rotate(${180 + i * 20}deg)`, opacity:1, offset:.6 }, { transform:`translate(${sway * 1.4}px,${h + 20}px) rotate(${360 + i * 20}deg)`, opacity:.9 }],
      { duration:1300 + Math.random() * 900, delay:Math.random() * 350, easing:"ease-in" }).finished.then(() => p.remove(), () => p.remove());
  }
  return heroHop(3);
}
/* knock-out: dizzy stars circle the head, the colour drains, then the fall */
async function heroKO() {
  if (reduce) return;
  const c = center(hero), body = $("#heroBody"); body.style.transition = "filter .9s"; body.style.filter = "grayscale(.85) brightness(.75)";
  for (let k = 0; k < 3; k++) {
    const s = document.createElement("i"), kf = []; s.className = "bp"; s.style.cssText = `left:${c.x - 3}px;top:${c.y - c.h * .55}px;width:7px;height:7px;background:#ffd43b;box-shadow:0 0 0 2px #fff3b0`; fx.appendChild(s);
    for (let j = 0; j <= 16; j++) { const a = j / 16 * 6.283 + k * 2.094; kf.push({ transform:`translate(${Math.cos(a) * 22}px,${Math.sin(a) * 7}px)`, opacity:j > 14 ? 0 : 1 }); }
    s.animate(kf, { duration:1100, easing:"linear" }).finished.then(() => s.remove(), () => s.remove());
  }
  await anim(hero, [{ transform:"translateX(0)" }, { transform:"translateX(-6px)" }, { transform:"translateX(6px)" }, { transform:"translateX(-4px)" }, { transform:"translateX(3px)" }, { transform:"translateX(0)" }], { duration:520 });
  await wait(450);
}
/* a fresh fight: the hero walks in, the foe drops in and lands with a thud */
async function battleIntro() {
  if (reduce) return;
  foe.style.opacity = "0"; const w = HB.walk();
  const pa = anim(hero, [{ transform:"translateX(-170px)", opacity:0 }, { transform:"translateX(-170px)", opacity:0, offset:.02 }, { transform:"translateX(0)", opacity:1 }], { duration:760, easing:"cubic-bezier(.25,.7,.3,1)" });
  await wait(260); foe.style.opacity = "";
  const fa = anim(foe, [{ transform:"translateY(-150px) scale(.92,1.1)", opacity:0 }, { transform:"translateY(0) scale(1.16,.8)", opacity:1, offset:.6 }, { transform:"translateY(-12px) scale(.96,1.05)", offset:.78 }, { transform:"translateY(0) scale(1,1)" }], { duration:520, easing:"ease-in" });
  await wait(330); dustPuff(foe); anim(scene, [{ transform:"translateY(0)" }, { transform:"translateY(3px)" }, { transform:"translateY(-2px)" }, { transform:"translateY(0)" }], { duration:240 });
  await Promise.all([pa, fa]); w.stop();
}
/* back to normal for a new fight */
function battleReset() {
  const body = $("#heroBody"); body.style.transition = ""; body.style.filter = "";
  [hero, foe].forEach(el => el.getAnimations().forEach(a => a.cancel())); fx.querySelectorAll(".bp").forEach(e => e.remove());
}
