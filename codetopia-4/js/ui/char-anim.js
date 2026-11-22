/* Character animation for the Owned tab and the Character info page. Every frame comes from the walk cycles in walk.js:
   idle, walking in four directions, a turnaround, and a cheer. */

"use strict";

const CA = {
  /* draw one frame standing on (cx, by), optionally mirrored or squashed from its feet */
  blit(c, f, cx, by, flip, sx = 1, sy = 1) {
    c.save(); c.translate(Math.round(cx), Math.round(by)); c.scale((flip ? -1 : 1) * sx, sy); c.drawImage(f.cv, -Math.round(f.w / 2), -f.h); c.restore();
  },
  /* what the character is doing: kind, seconds since the start (for foot timing), progress through the move 0..1 */
  pose(kind, t, u) {
    const ph = Math.floor(t * 9) % 4;
    switch (kind) {
      case "down": case "up": return { face:kind, ph };
      case "right": return { face:"side", ph };
      case "left": return { face:"side", ph, flip:true };
      case "turn": { const seg = Math.max(0, Math.min(3, Math.floor(u * 4))), v = u * 4 - seg, m = Math.min(v, 1 - v), fc = [["down"], ["side"], ["up"], ["side", true]][seg];
        return { face:fc[0], flip:!!fc[1], ph:4, sx:m < .12 ? .25 + .75 * (m / .12) : 1, dy:Math.sin(t * 2) > .35 ? -1 : 0 }; }
      case "cheer": { const a = Math.abs(Math.sin(u * Math.PI * 3)), air = a > .12;
        return { face:"down", ph:air ? 1 : 4, dy:-Math.round(a * 10), flip:air && Math.floor(u * 6) % 2 === 1, sy:a < .08 ? .92 : 1 }; }
      default: return { face:"down", ph:4, dy:Math.sin(t * 2) > .35 ? -1 : 0 };
    }
  }
};

/* ---------- Owned tab: every owned card comes alive ---------- */
let caOwnRaf = 0, caOwnList = [], caJust = { id:null, at:0 };
function ownAnimate() {
  caOwnList = [];
  $$("#owngrid .uc.on").forEach((card, i) => {
    const eb = card.querySelector("[data-equip]"), pt = card.querySelector(".pt"); if (!eb || !pt || typeof WALK === "undefined") return;
    const id = eb.dataset.equip, set = WALK.set(id), sizes = ["down", "up", "side"].map(k => set[k][4]), W = Math.max(...sizes.map(s => s.w)) + 2, H = Math.max(...sizes.map(s => s.h)) + 12;
    pt.innerHTML = `<canvas class="wk" width="${W}" height="${H}" style="width:calc(${W} * var(--wkpx,3px));height:calc(${H} * var(--wkpx,3px))" aria-hidden="true"></canvas>`;
    caOwnList.push({ id, card, cv:pt.firstChild, W, H, seed:i * 1.7 + (id.length % 5) * .9 });
  });
  caOwnPaint(performance.now() / 1000, true);
  ownStart();
}
function caOwnPaint(t, still) {
  caOwnList.forEach(o => {
    const c = o.cv.getContext("2d"); c.imageSmoothingEnabled = false; c.clearRect(0, 0, o.W, o.H);
    const worn = o.card.classList.contains("worn"), hot = !still && !reduce && o.card.matches(":hover, :focus-within"), cheer = !still && !reduce && o.id === caJust.id && t - caJust.at < 1.3;
    let p = { face:"down", ph:4, dy:0 }, tt = t + o.seed;
    if (still || reduce) p = { face:"down", ph:4 };
    else if (cheer) p = CA.pose("cheer", tt, (t - caJust.at) / 1.3);
    else if (hot) { const k = Math.floor(tt / 1.1) % 4; p = CA.pose(["down", "right", "up", "left"][k], tt, 0); }
    else {
      const cyc = (tt % 7) , look = cyc > 4.6 && cyc < 5.2 ? "right" : cyc > 5.5 && cyc < 6.1 ? "left" : null;
      p = look ? { face:"side", ph:4, flip:look === "left" } : CA.pose("idle", tt, 0);
      if (worn) { const h = tt % 3.4; if (h < .7) { const a = Math.abs(Math.sin(h / .7 * Math.PI * 2)); p = { face:"down", ph:a > .1 ? 1 : 4, dy:-Math.round(a * 4) }; } }
    }
    const f = WALK.sprite(o.id, p.face, p.ph), by = o.H - 1 + (p.dy || 0);
    c.fillStyle = "rgba(10,6,30,.3)"; c.fillRect(Math.round(o.W / 2 - 7), o.H - 1, 14, 1);
    CA.blit(c, f, o.W / 2, by + 1, p.flip, p.sx || 1, p.sy || 1);
  });
}
function ownStart() {
  cancelAnimationFrame(caOwnRaf); if (reduce) return;
  const step = now => { if ($("#unl").hidden || $("#ownView").hidden || !caOwnList.length || !document.body.contains(caOwnList[0].cv)) return; caOwnPaint(now / 1000, false); caOwnRaf = requestAnimationFrame(step); };
  caOwnRaf = requestAnimationFrame(step);
}
/* a freshly equipped character celebrates */
document.addEventListener("click", e => { const b = e.target.closest("#owngrid [data-equip]"); if (b) caJust = { id:b.dataset.equip, at:performance.now() / 1000 }; });

/* ---------- Character info: a little stage with a reel of moves ---------- */
const CHR_MOVES = {
  idle:[["idle", 4, "Idle"]],
  walk:[["down", 1.8, "Walking toward you"], ["right", 1.8, "Walking right"], ["up", 1.8, "Walking away"], ["left", 1.8, "Walking left"]],
  turn:[["turn", 4, "Turnaround"]],
  cheer:[["cheer", 2.2, "Cheer!"]],
};
CHR_MOVES.all = [CHR_MOVES.idle[0].slice(), ...CHR_MOVES.walk, ["turn", 3.6, "Turnaround"], ["cheer", 2.2, "Cheer!"]]; CHR_MOVES.all[0][1] = 2.2;
const CHRS = { mode:"all", t0:0, raf:0, last:"" };
function chrSync(owned, reward) { const cv = $("#chrCv"); if (!cv) return; cv.classList.toggle("locked", !owned); cv.classList.toggle("reward", !!reward); }
function chrMode(m) {
  CHRS.mode = m; CHRS.t0 = performance.now() / 1000;
  $$("#chrModes [data-mode]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.mode === m)));
  const spin = m === "spin"; $("#chrSpin").hidden = !spin; $("#chrFloor").hidden = !spin; $("#chrCv").hidden = spin; $("#chrCap").hidden = spin;
  if (!spin) chrStart(); else { cancelAnimationFrame(CHRS.raf); }
}
function chrStart() {
  cancelAnimationFrame(CHRS.raf); if (!chrId || typeof WALK === "undefined") return;
  const draw = now => {
    if ($("#chr").hidden) return;
    const t = now / 1000, list = CHR_MOVES[CHRS.mode] || CHR_MOVES.all, total = list.reduce((a, m) => a + m[1], 0);
    let el = reduce ? 0 : (((t - CHRS.t0) % total) + total) % total, mv = list[0], base = 0;
    for (const m of list) { if (el < base + m[1]) { mv = m; break; } base += m[1]; }
    chrPaint(mv, t, (el - base) / mv[1]);
    if (!reduce && !$("#chrCv").hidden) CHRS.raf = requestAnimationFrame(draw);
  };
  draw(performance.now());
}
function chrPaint(mv, t, u) {
  const cv = $("#chrCv"), c = cv.getContext("2d"), W = cv.width, H = cv.height, [kind, , cap] = mv; c.imageSmoothingEnabled = false; c.clearRect(0, 0, W, H);
  if (CHRS.last !== cap) { CHRS.last = cap; $("#chrCap").textContent = cap; }
  const reel = reduce ? (kind === "turn" || kind === "cheer" ? "idle" : kind) : kind, p = CA.pose(reel, t, u), by = 55, gy = 52;
  // floor, sliding the other way to the walk
  const sp = 34, vy = kind === "down" ? -1 : kind === "up" ? 1 : 0, vx = kind === "right" ? -1 : kind === "left" ? 1 : 0, oy = reduce ? 0 : t * sp * vy, ox = reduce ? 0 : t * sp * vx;
  c.fillStyle = "#241c4a"; c.fillRect(0, gy, W, H - gy); c.fillStyle = "#34296a"; c.fillRect(0, gy, W, 1);
  for (let k = 0; k < 4; k++) { const y = gy + 2 + (((k * 4 + oy) % 12) + 12) % 12; if (y < H) c.fillRect(0, Math.round(y), W, 1); }
  for (let r = 0; r < 3; r++) for (let k = 0; k < 9; k++) { const x = (((k * 9 + r * 4 + ox) % 81) + 81) % 81 - 8, y = gy + 2 + r * 4; c.fillRect(Math.round(x), y, 1, 4); }
  const f = WALK.sprite(chrId, p.face, p.ph), dy = p.dy || 0;
  c.fillStyle = "rgba(0,0,0,.35)"; const sw = Math.max(8, 22 + dy); c.fillRect(Math.round(W / 2 - sw / 2), by, sw, 2); c.fillRect(Math.round(W / 2 - sw / 2 + 2), by + 2, sw - 4, 1);
  if (cv.classList.contains("locked")) {   /* not owned yet: a shadow of the character */
    const tmp = CA.tmp || (CA.tmp = document.createElement("canvas")); tmp.width = W; tmp.height = H; const tc = tmp.getContext("2d"); tc.imageSmoothingEnabled = false;
    CA.blit(tc, f, W / 2, by + 1 + dy, p.flip, p.sx || 1, p.sy || 1); tc.globalCompositeOperation = "source-in"; tc.fillStyle = "#000"; tc.fillRect(0, 0, W, H); c.globalAlpha = .5; c.drawImage(tmp, 0, 0); c.globalAlpha = 1;
  } else CA.blit(c, f, W / 2, by + 1 + dy, p.flip, p.sx || 1, p.sy || 1);
  if (kind === "cheer" && !reduce && typeof AMB_HASH === "function") for (let i = 0; i < 14; i++) {
    const ph = (u * 3 + i / 14) % 1, x = W / 2 + (AMB_HASH(i, 3) - .5) * 44 * (.3 + ph), y = by - 26 - ph * 24 + AMB_HASH(i, 4) * 10;
    c.globalAlpha = 1 - ph; c.fillStyle = ["#ffd43b", "#ffffff", "#ff7ab8", "#6fb0ff"][i % 4]; c.fillRect(Math.round(x), Math.round(y), 2, 2); c.fillRect(Math.round(x) - 1, Math.round(y) + (i % 2), 4, 1);
  }
  c.globalAlpha = 1;
}
$("#chrModes").addEventListener("click", e => { const b = e.target.closest("[data-mode]"); if (b) chrMode(b.dataset.mode); });
