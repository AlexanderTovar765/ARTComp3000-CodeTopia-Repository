/* Level-complete and defeat cards: the card bounces in, the stars land one by one with a flash, the coins count up, the hero
   cheers (or slumps) on a little stage, and a boss or three-star win rains confetti. Reduced motion shows the final card at once. */

"use strict";

let vicRaf = 0, vicTimers = [];
function vicClear() { cancelAnimationFrame(vicRaf); vicTimers.forEach(clearTimeout); vicTimers = []; $$("#overlay .vic-conf").forEach(e => e.remove()); }
const vicLater = (fn, ms) => { vicTimers.push(setTimeout(fn, ms)); };

function vicConfetti(n, big) {
  if (reduce) return; const ov = $("#overlay"), w = ov.clientWidth, cols = ["#ffd43b", "#ff7ab8", "#6fb0ff", "#b9e769", "#ffffff", "#c58bff"];
  for (let i = 0; i < n; i++) {
    const p = document.createElement("i"), s = 4 + (i % 3) * 2, x = Math.random() * w, sway = (Math.random() - .5) * 120;
    p.className = "vic-conf"; p.style.cssText = `position:absolute;left:${x}px;top:-14px;width:${s}px;height:${s}px;background:${cols[i % 6]};pointer-events:none;z-index:11;image-rendering:pixelated`; ov.appendChild(p);
    p.animate([{ transform:"translate(0,0) rotate(0deg)", opacity:1 }, { transform:`translate(${sway}px,${ov.clientHeight * .6}px) rotate(${200 + i * 17}deg)`, opacity:1, offset:.6 }, { transform:`translate(${sway * 1.5}px,${ov.clientHeight + 20}px) rotate(${400 + i * 17}deg)`, opacity:.9 }],
      { duration:(big ? 1700 : 1300) + Math.random() * 1000, delay:Math.random() * (big ? 1400 : 500), easing:"ease-in" }).finished.then(() => p.remove(), () => p.remove());
  }
}
/* a small stage with the hero: cheering when you win, slumped and grey when you lose */
function vicHero(win) {
  if (typeof WALK === "undefined" || typeof CA === "undefined") return;
  const id = typeof HB !== "undefined" ? HB.id() : "hero", set = WALK.set(id), f0 = set.down[4], W = f0.w + 8, H = f0.h + 14;
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H; cv.className = "vic-hero" + (win ? "" : " sad"); cv.setAttribute("aria-hidden", "true");
  cv.style.width = W * 3 + "px"; cv.style.height = H * 3 + "px"; $("#card").insertBefore(cv, $("#card").firstChild);
  const c = cv.getContext("2d"), t0 = performance.now();
  const paint = now => {
    if ($("#overlay").hidden || !cv.isConnected) return; const t = (now - t0) / 1000; c.imageSmoothingEnabled = false; c.clearRect(0, 0, W, H);
    let p;
    if (reduce) p = { face:"down", ph:4 };
    else if (win) { const u = (t % 1.8) / 1.8; p = t < 5 ? CA.pose("cheer", t, u) : CA.pose("idle", t, 0); }
    else p = { face:"down", ph:4, dy:Math.sin(t * 1.6) > 0 ? 0 : 1, sy:.96 };
    c.fillStyle = "rgba(0,0,0,.35)"; c.fillRect(Math.round(W / 2 - 9), H - 3, 18, 2);
    CA.blit(c, WALK.sprite(id, p.face, p.ph), W / 2, H - 3 + (p.dy || 0), p.flip, 1, p.sy || 1);
    if (win && !reduce) for (let i = 0; i < 6; i++) { const ph = (t * .8 + i / 6) % 1; c.globalAlpha = 1 - ph; c.fillStyle = ["#ffd43b", "#fff", "#ff7ab8"][i % 3]; const x = W / 2 + Math.sin(i * 2.3 + t) * 16, y = H - 16 - ph * 22; c.fillRect(Math.round(x), Math.round(y), 2, 2); c.globalAlpha = 1; }
    if (!win && !reduce) { for (let i = 0; i < 3; i++) { const a = t * 3 + i * 2.1; c.fillStyle = "#ffd43b"; c.fillRect(Math.round(W / 2 + Math.cos(a) * 9), Math.round(H - f0.h - 1 + Math.sin(a) * 3), 2, 2); } }
    if (!reduce) vicRaf = requestAnimationFrame(paint);
  };
  vicRaf = requestAnimationFrame(paint);
}
/* called by overlay() after it fills the card */
function vicCard() {
  vicClear(); const card = $("#card"), h2 = card.querySelector("h2"), st = card.querySelector(".stars"), win = !!st || /defeated|cleared/i.test(h2 ? h2.textContent : ""), lose = /crashed/i.test(h2 ? h2.textContent : "");
  if (!win && !lose) return;
  const total = st ? (st.textContent.match(/★/g) || []).length : 0, boss = !!(typeof FOE === "function" && FOE().boss);
  card.classList.toggle("vic-win", win); card.classList.toggle("vic-lose", lose); card.classList.toggle("vic-boss", win && boss);
  vicHero(win);
  const coin = card.querySelector(".unl b"), m = coin ? /\+(\d+)/.exec(coin.textContent) : null;
  if (st) st.innerHTML = [0, 1, 2].map(i => `<span class="vs ${i < total ? "on" : "off"}">${i < total ? "★" : "☆"}</span>`).join("");
  if (reduce) return;
  card.animate([{ transform:"scale(.6) translateY(30px)", opacity:0 }, { transform:"scale(1.05) translateY(-4px)", opacity:1, offset:.6 }, { transform:"scale(1)", opacity:1 }], { duration:win ? 520 : 420, easing:"ease-out" });
  if (lose) { vicLater(() => card.animate([{ transform:"translateX(0)" }, { transform:"translateX(-7px)" }, { transform:"translateX(6px)" }, { transform:"translateX(-3px)" }, { transform:"translateX(0)" }], { duration:300 }), 450); return; }
  if (h2) h2.animate([{ transform:"scale(.7)", opacity:0 }, { transform:"scale(1.18)", opacity:1, offset:.6 }, { transform:"scale(1)" }], { duration:520, delay:250, easing:"ease-out", fill:"backwards" });
  card.querySelectorAll(".vs").forEach((s, i) => {
    const on = s.classList.contains("on"), d = 650 + i * 360;
    s.animate(on ? [{ transform:"scale(0) rotate(-200deg)", opacity:0 }, { transform:"scale(1.9) rotate(15deg)", opacity:1, offset:.55 }, { transform:"scale(1) rotate(0)" }] : [{ transform:"scale(1.5)", opacity:0 }, { transform:"scale(1)", opacity:1 }], { duration:on ? 460 : 260, delay:d, easing:"ease-out", fill:"backwards" });
    if (on) { vicLater(() => { try { SND.sfx("coin"); } catch (e) {} const r = s.getBoundingClientRect(), o = $("#overlay").getBoundingClientRect(); vicBurst(r.left - o.left + r.width / 2, r.top - o.top + r.height / 2); }, d + 230); }
  });
  const after = 650 + Math.max(total, 1) * 360;
  if (total === 3 || boss) vicLater(() => vicConfetti(boss ? 70 : 44, boss), after);
  if (coin && m) {
    const n = +m[1], base = coin.textContent; coin.textContent = "+0 coins"; const t0 = performance.now() + after + 100;
    const tick = now => { const u = Math.max(0, Math.min(1, (now - t0) / 800)); coin.textContent = base.replace(/\+\d+/, "+" + Math.round(n * (1 - (1 - u) * (1 - u)))); if (u < 1 && coin.isConnected) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    if (n) vicLater(() => { try { SND.sfx("coin"); } catch (e) {} coin.animate([{ transform:"scale(1)" }, { transform:"scale(1.35)" }, { transform:"scale(1)" }], { duration:360 }); }, after + 900);
  }
  card.querySelectorAll(".btns .btn").forEach((b, i) => b.animate([{ opacity:0, transform:"translateY(10px)" }, { opacity:1, transform:"translateY(0)" }], { duration:300, delay:after + 900 + i * 90, easing:"ease-out", fill:"backwards" }));
}
/* a ring of sparks where a star lands */
function vicBurst(x, y) {
  const ov = $("#overlay"), cols = ["#ffd43b", "#fff3b0", "#ffffff"];
  for (let i = 0; i < 12; i++) {
    const p = document.createElement("i"), a = i / 12 * 6.283, d = 26 + Math.random() * 16;
    p.className = "vic-conf"; p.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:4px;height:4px;background:${cols[i % 3]};pointer-events:none;z-index:12;image-rendering:pixelated`; ov.appendChild(p);
    p.animate([{ transform:"translate(0,0)", opacity:1 }, { transform:`translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px)`, opacity:0 }], { duration:520, easing:"ease-out" }).finished.then(() => p.remove(), () => p.remove());
  }
}
