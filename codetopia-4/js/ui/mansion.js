/* Murder at SQLeviathan Mansion, the opening: the coachman's offer, the detective suit, the carriage ride, the title card and the mansion grounds.
   The coachman stays silent until two languages are cleared. The case itself (the SQL chapters) comes after this opening. */

"use strict";

const mt = { on:false, raf:0, res:null, busy:false };
const myst = () => D.mystery || (D.mystery = {});
const coachReady = () => !!D.admin || (V.cnt || 0) >= 2;
const mysteryGone = () => !!myst().gone;
const mysSpr = id => { const k = "_v" + id; return SPRITES[k] || (SPRITES[k] = { ...SPRITES[id], sc:.6 }); };

/* ---------- the guests and what they say ---------- */
const MYS_LINES = {
  tovar:["Mr. SQLeviathan was found in the cellar at midnight. Six of us were under this roof. One of us is lying.", "Lies leave gaps. Records do not forget. That is where you come in.", "Speak to the guests. Then we begin."],
  lady:["I only came for the tea. He kept a ledger of everyone's secrets, you know, all in neat little tables.", "The candles went low before the scream. I noticed. I notice most things."],
  duchess:["Do not look at me like that. A duchess is never late, and never present when things go wrong.", "Ask what you like. I shall answer exactly what I choose."],
  madame:["The cold came first. Then the dark. Then the scream. Or did the scream come first? Time is strange in this house.", "The cards were never kind to him. Not once, all week."],
  wain:["I only carry the bags, miss. Nobody ever asks the staff. I see everything, though.", "Floorboards creak in this house. Always in the same order. Tonight they did not."],
  duke:["The rain is worsening. The carriage waits as long as you need. Say the word and I'll take you back to the village."]
};
let mysTalk = 0;
function mysLine(n) { const L = MYS_LINES[n.mys] || ["..."]; return L[(mysTalk++) % L.length]; }

/* ---------- the coachman ---------- */
function coachTalk(n) { if (!coachReady()) return; V.dir = n.x > V.x ? 1 : -1; V.face = "side"; if (V.trans) return; if (myst().intro) mcoAsk("go"); else mysteryRide(true); }
/* later trips are short conversations too, no yes/no box */
const GO_AGAIN = [
  { bg:"road", who:"Coachman", r:"vil_glasses", l:"hero", text:"The mansion again, detective? The rain has not stopped, and neither has the house." },
  { who:"hero", r:"vil_glasses", l:"hero", text:"Take me there." }
];
const GO_HOME = [
  { bg:"manor", who:"The Duke of Aston", r:"vil_glasses", l:"hero", text:"Had enough of the dark for tonight? The carriage is yours." },
  { who:"hero", r:"vil_glasses", l:"hero", text:"Back to the village, please." }
];
async function mcoAsk(kind) {
  if (V.trans || mt.busy) return; mt.busy = true;
  try { await playCine(kind === "home" ? GO_HOME : GO_AGAIN).catch(() => {}); } finally { mt.busy = false; }
  if (kind === "home") vSwitch("sq", 430, 184); else mysteryRide(false);
}
function giveSuit() {
  const m = myst(); D.skins.hero_detective = true; D.skin = "hero_detective"; m.gone = true; persist();
  if (typeof applyHeroSkin === "function") applyHeroSkin();
}
const RIDE_FIRST = [
  { bg:"road", who:"Coachman", r:"vil_glasses", l:"hero", text:"Psst. Apprentice. You have been clearing languages like a seasoned spellcaster." },
  { who:"Coachman", r:"vil_glasses", l:"hero", text:"Up the hill there is a new set of levels, and at the end of them a boss: Mr. SQLeviathan. My carriage is ready, if you are." },
  { who:"hero", r:"vil_glasses", l:"hero", text:"A new boss? Then take me there." },
  { who:"Coachman", r:"vil_glasses", l:"hero", fx:"suit", text:"Splendid. Climb aboard... no, wait. Hold still. You can't go wearing that. The mansion has standards." },
  { who:"Coachman", r:"vil_glasses", l:"hero", text:"Much better. A proper dark suit for a proper dark house. Mind your head on the door." }
];
const ARRIVE = [
  { bg:"manor", who:"Inspector Tovar", r:"mys_tovar", l:"hero", text:"You are the apprentice the coachman brought. Good. Mr. SQLeviathan has been expecting you." },
  { who:"Inspector Tovar", r:"mys_tovar", l:"hero", text:"He is in the cellar. He has been there since midnight, and he will not be getting up." },
  { who:"Inspector Tovar", r:"mys_tovar", l:"hero", zoom:"punch", fx:"lightning", text:"Mr. SQLeviathan is dead, apprentice. Murdered under his own roof, in the middle of the storm." },
  { who:"hero", r:"mys_tovar", l:"hero", text:"Dead? But the coachman said he was the boss of a new set of levels..." },
  { who:"Inspector Tovar", r:"mys_tovar", l:"hero", text:"A boss, yes. Of a business that kept every secret in this county in neat little tables. Now someone has torn a row out of it." },
  { who:"Inspector Tovar", r:"mys_tovar", l:"hero", text:"Six of us were under this roof tonight, myself included. One of us is a liar. They do not know yet that you are good with queries." },
  { narr:true, l:"hero", zoom:"out", fx:"rumble", text:"Somewhere below, something drips. The guests are waiting in the grounds. Speak to them all." }
];
async function mysteryRide(first) {
  if (mt.busy) return; mt.busy = true;
  try {
    if (first) await playCine(RIDE_FIRST).catch(() => {});
    /* the suit is always on for the mansion: given the first time, put back on later if an apprentice look was chosen */
    if (first || !D.skins.hero_detective) giveSuit(); else if (APPRENTICES.includes(D.skin) && D.skin !== "hero_detective") { D.skin = "hero_detective"; persist(); if (typeof applyHeroSkin === "function") applyHeroSkin(); }
    myst().gone = true; persist();
    await mansionRide();
    if (first) await mansionTitle();
    mansionRideClose(); vRepaint();
    vSwitch("manor", 150, 188, () => { vRepaint(); if (first) playCine(ARRIVE).catch(() => {}).then(() => { myst().intro = true; myst().seen = true; persist(); }); });
  } finally { mt.busy = false; }
}

/* ---------- the door of the hall (the case files open here next) ---------- */
function mansionDoor() { vSay({ id:"hall", name:"The great door", role:"" }, "Locked. Inspector Tovar has the key, and nobody goes inside until the guests have been spoken to.", { x:V.x, y:V.y }); }

/* ---------- the title card ---------- */
function mansionTitle() {
  return new Promise(res => {
    const el = $("#mTitle"), cv = $("#mtCv"); mt.res = res; mt.on = true; el.hidden = false; document.body.style.overflow = "hidden"; $(".app").inert = true;
    const cell = innerWidth < 600 ? 3 : 4, W = Math.ceil(innerWidth / cell), H = Math.ceil(innerHeight / cell); cv.width = W; cv.height = H; const g = cv.getContext("2d"); g.imageSmoothingEnabled = false;
    const r = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
    let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const GT = Math.round(H * .78), SKY = ["#05040c", "#0b0818", "#150f26", "#221734", "#33213c", "#47303f"], BAY = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
    for (let y = 0; y < GT; y++) { const f = y / GT * (SKY.length - 1), i = Math.min(SKY.length - 2, Math.floor(f)), fr = f - i; for (let x = 0; x < W; x++) r(x, y, 1, 1, fr > (BAY[(y & 3) * 4 + (x & 3)] + .5) / 16 ? SKY[i + 1] : SKY[i]); }
    for (let i = 0; i < 60; i++) { const sx = rnd() * W, sy = rnd() * GT * .5; r(sx, sy, 1, 1, rnd() < .3 ? "#9fe0a8" : "#6a5a90"); }
    const mx = Math.round(W * .78), my = Math.round(GT * .22), R = Math.max(7, Math.round(GT * .1));
    for (let dy = -R - 5; dy <= R + 5; dy++) for (let dx = -R - 5; dx <= R + 5; dx++) { const d2 = dx * dx + dy * dy; if (d2 <= R * R) r(mx + dx, my + dy, 1, 1, ((dx + R * .35) ** 2 + (dy - R * .2) ** 2 > (R * .9) ** 2) ? "#8fd9a0" : "#d6ffd8"); else if (d2 <= (R + 4) * (R + 4) && ((dx + dy) & 1) === 0) r(mx + dx, my + dy, 1, 1, "#1f3a36"); }
    for (let i = 0; i < 7; i++) { const cx = rnd() * W, cy = GT * (.12 + rnd() * .3), cw = 30 + rnd() * 50; for (let q = 0; q < 5; q++) r(cx + q * cw * .15, cy - Math.sin(q / 4 * Math.PI) * 4, cw * .3, 5, "#0d0a1a"); }
    /* the hill and the house */
    for (let y = GT; y < H; y++) r(0, y, W, 1, ((y - GT) & 1) ? "#07050e" : "#0a0712");
    for (let x = 0; x < W; x++) { const h = Math.round(Math.sin(x * .02) * 3 + Math.sin(x * .07) * 1.5); r(x, GT - 3 + h, 1, 6, "#0a0712"); }
    const hx = Math.round(W * .5), hw = Math.min(W * .5, 190), bx = hx - hw / 2, by = GT - 2, bh = Math.round(GT * .26), HC = "#07050e";
    r(bx, by - bh, hw, bh, HC); r(bx - 4, by - bh - 2, hw + 8, 3, HC);
    const tw = Math.round(hw * .26), tx = hx - tw / 2, th = Math.round(bh * 1.05);
    r(tx, by - bh - th, tw, th + 2, HC); for (let q = 0; q < tw / 2 + 3; q++) r(tx - 3 + q, by - bh - th - q * 1.3 + 0, tw + 6 - q * 2, 2, HC);
    [[bx, 1], [bx + hw - tw * .6, 1]].forEach(([sx]) => { const sw = Math.round(tw * .6), sh = Math.round(bh * .7); r(sx, by - bh - sh, sw, sh + 2, HC); for (let q = 0; q < sw / 2 + 2; q++) r(sx - 2 + q, by - bh - sh - q * 1.5, sw + 4 - q * 2, 2, HC); });
    for (let q = 0; q < hw / 2; q++) r(bx + q, by - bh - q * .12 - 2, 2, 3, HC);
    const win = (wx, wy, c) => { r(wx, wy, 5, 8, c); r(wx + 2, wy, 1, 8, "#07050e"); r(wx, wy + 3, 5, 1, "#07050e"); };
    for (let i = 0; i < 6; i++) win(bx + 10 + i * (hw - 24) / 5, by - bh * .62, [0, 2, 3, 5].includes(i) ? "#ffcf5a" : "#2a2036");
    for (let i = 0; i < 3; i++) win(hx - 12 + i * 10, by - bh - th * .55, i === 1 ? "#9bff9b" : "#ffcf5a");
    win(tx + tw / 2 - 2, by - bh - th * .9, "#ffcf5a");
    r(hx - 6, by - 14, 12, 16, "#1a1020"); r(hx - 4, by - 18, 8, 6, "#1a1020"); r(hx - 4, by - 12, 8, 12, "#ffcf5a"); r(hx - 4, by - 18, 8, 6, "#ffcf5a"); r(hx - 4, by - 8, 8, 1, "#07050e");
    for (let x = Math.round(bx - 40); x < bx + hw + 40; x += 6) { r(x, by - 6, 1, 10, "#05030a"); r(x - 1, by - 8, 3, 2, "#05030a"); } r(bx - 40, by - 3, hw + 80, 1, "#05030a");
    /* dead trees */
    const branch = (x, y, a, len, d) => { if (d > 5 || len < 3) return; for (let q = 0; q < len; q++) r(x + Math.cos(a) * q, y + Math.sin(a) * q, d < 2 ? 2 : 1, d < 2 ? 2 : 1, "#05030a"); const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len; branch(ex, ey, a - .5 - rnd() * .3, len * .72, d + 1); branch(ex, ey, a + .5 + rnd() * .3, len * .7, d + 1); };
    branch(W * .12, GT + 6, -Math.PI / 2 + .1, GT * .16, 0); branch(W * .91, GT + 8, -Math.PI / 2 - .12, GT * .2, 0); branch(W * .3, GT + 10, -Math.PI / 2, GT * .08, 1);
    const base = g.getImageData(0, 0, W, H);
    /* the letters */
    const L2 = $("#mtL2"); L2.innerHTML = "SQLeviathan".split("").map((ch, i) => `<span class="${i < 3 ? "sq" : ""}" style="--i:${i}">${ch}</span>`).join("");
    const bats = Array.from({ length:6 }, (_, i) => ({ x:rnd() * W, y:GT * (.1 + rnd() * .4), s:.4 + rnd() * .7, p:rnd() * 6 })), drops = Array.from({ length:Math.round(W / 3) }, () => ({ x:rnd() * W, y:rnd() * H, v:3 + rnd() * 3 }));
    let flash = 0, last = 0, tL = 0;
    const draw = now => {
      if (!mt.on) return; mt.raf = requestAnimationFrame(draw); if (now - last < 70) return; const dt = now - last; last = now; tL += dt;
      g.putImageData(base, 0, 0);
      if (!reduce) {
        if (flash > 0) { flash--; g.fillStyle = flash > 1 ? "rgba(210,255,220,.28)" : "rgba(210,255,220,.1)"; g.fillRect(0, 0, W, H); } else if (Math.random() < .03) flash = 4;
        bats.forEach(b => { b.x -= b.s * 3; if (b.x < -6) { b.x = W + 6; b.y = GT * (.1 + Math.random() * .4); } const up = Math.sin(now / 90 + b.p) > 0; g.fillStyle = "#030208"; g.fillRect(Math.round(b.x), Math.round(b.y), 2, 1); g.fillRect(Math.round(b.x) - 2, Math.round(b.y) - (up ? 1 : 0), 2, 1); g.fillRect(Math.round(b.x) + 2, Math.round(b.y) - (up ? 1 : 0), 2, 1); });
        g.fillStyle = "rgba(160,180,210,.35)"; drops.forEach(d => { d.y += d.v; d.x -= d.v * .3; if (d.y > H) { d.y = -4; d.x = Math.random() * W; } g.fillRect(Math.round(d.x), Math.round(d.y), 1, 3); });
      }
      g.fillStyle = "rgba(120,100,150,.10)"; g.fillRect(0, GT - 4, W, 10);
    };
    mt.raf = requestAnimationFrame(draw);
    const go = $("#mtGo"); go.focus();
    const done = () => { if (!mt.on) return; mt.on = false; cancelAnimationFrame(mt.raf); go.removeEventListener("click", done); removeEventListener("keydown", key); el.classList.add("out");
      setTimeout(() => { el.hidden = true; el.classList.remove("out"); $(".app").inert = false; document.body.style.overflow = V.on ? "hidden" : ""; res(); }, reduce ? 0 : 600); };
    const key = e => { if (e.key === "Escape") done(); };
    go.addEventListener("click", done); addEventListener("keydown", key);
    if (!reduce) { const s = SND; try { s.sfx("thunder"); } catch (e) {} }
  });
}

/* ---------- the mansion grounds ---------- */
function manorSceneFill(o, X) {
  const { c, add, st, k, M, rnd, doors, clicks, exits, npcs, obs } = X;
  VSKYY(0, c, 96, 262);
  vGroundPaint(c, (x, y) => { if (y < 96) return null; if ((x >= 134 && x <= 186) || (y >= 134 && y <= 150 && x >= 40 && x <= 280)) return "c"; return "g"; }, M);
  const HC = "#0a0716", HC2 = "#140d26", WIN = "#ffcf5a";
  const house = vBake(240, 110, 120, 106, cc => {
    vR(cc, 20, 36, 200, 70, HC); vR(cc, 16, 33, 208, 4, HC2);
    for (let q = 0; q < 52; q++) vR(cc, 16 + q * 4, 32 - Math.min(q, 52 - q) * .5, 4, 2, HC);
    vR(cc, 96, 8, 48, 98, HC); for (let q = 0; q < 28; q++) vR(cc, 94 + q, 8 - q * 1.1, 52 - q * 2, 2, HC);
    vR(cc, 20, 22, 30, 84, HC2); for (let q = 0; q < 16; q++) vR(cc, 18 + q, 22 - q * 1.2, 34 - q * 2, 2, HC2);
    vR(cc, 190, 22, 30, 84, HC2); for (let q = 0; q < 16; q++) vR(cc, 188 + q, 22 - q * 1.2, 34 - q * 2, 2, HC2);
    const w = (x, y, col) => { vR(cc, x, y, 7, 11, col); vR(cc, x + 3, y, 1, 11, HC); vR(cc, x, y + 4, 7, 1, HC); };
    [[30, 50], [30, 74], [200, 50], [200, 74], [60, 56], [76, 56], [152, 56], [168, 56], [60, 80], [76, 80], [152, 80], [168, 80]].forEach(([x, y], i) => w(x, y, [0, 3, 4, 8, 11].includes(i) ? WIN : "#2a2036"));
    [[110, 24], [124, 24], [110, 46], [124, 46]].forEach(([x, y], i) => w(x, y, i === 1 ? "#9bff9b" : WIN)); w(117, 70, WIN);
    vR(cc, 108, 88, 24, 18, "#1a1020"); vR(cc, 111, 84, 18, 6, "#1a1020"); vR(cc, 112, 90, 16, 16, "#4a3320"); vR(cc, 114, 86, 12, 6, "#4a3320"); vR(cc, 119, 90, 2, 16, "#1a1020"); vR(cc, 122, 98, 2, 2, "#ffcf5a");
    for (let x = 0; x < 240; x += 5) vR(cc, x, 100, 1, 6, "#05030c");
  });
  add(house, 160, 100); doors.push({ id:"hall", x:160, y:113 }); clicks.push({ id:"hall", r:[130, 82, 190, 104] });
  /* iron fence along the lawn */
  const fence = vBake(300, 16, 150, 15, cc => { for (let x = 0; x < 300; x += 5) { vR(cc, x, 4, 1, 11, "#04030a"); vR(cc, x - 1, 2, 3, 2, "#04030a"); } vR(cc, 0, 9, 300, 1, "#04030a"); });
  add(fence, 160, 108);
  /* dead trees */
  const dead = (x, y, h) => add(vBake(60, h + 10, 30, h + 8, cc => { const br = (bx, by, a, l, d) => { if (d > 4 || l < 3) return; for (let q = 0; q < l; q++) vR(cc, bx + Math.cos(a) * q, by + Math.sin(a) * q, 1 + (d < 1), 1 + (d < 1), "#05030a"); const ex = bx + Math.cos(a) * l, ey = by + Math.sin(a) * l; br(ex, ey, a - .55, l * .74, d + 1); br(ex, ey, a + .5, l * .7, d + 1); }; br(30, h + 6, -Math.PI / 2, h * .5, 0); }), x, y);
  dead(24, 150, 50); dead(298, 158, 56); dead(60, 118, 36);
  [[100, 130], [222, 130]].forEach(([x, y]) => add(vPropBush(k, x, y), x, y));
  [[110, 124], [210, 124], [60, 160], [260, 160]].forEach(([x, y]) => add(vPropLamp({ st, open:true }, x, y), x, y));
  /* the carriage */
  const cart = vBake(60, 40, 30, 38, cc => { vR(cc, 10, 8, 34, 18, "#0e0a1c"); vR(cc, 8, 6, 38, 3, "#1c1432"); vR(cc, 14, 12, 7, 8, "#ffcf5a"); vR(cc, 33, 12, 7, 8, "#ffcf5a"); vR(cc, 22, 12, 10, 8, "#241a3c");
    [14, 40].forEach(x => { vR(cc, x - 5, 24, 11, 11, "#06040e"); vR(cc, x - 3, 26, 7, 7, "#241a3c"); vR(cc, x, 24, 1, 11, "#06040e"); vR(cc, x - 5, 29, 11, 1, "#06040e"); });
    vR(cc, 46, 18, 12, 2, "#0e0a1c"); vR(cc, 52, 8, 7, 12, "#0a0716"); vR(cc, 56, 4, 3, 5, "#0a0716"); vR(cc, 54, 12, 1, 1, "#ff4a4a"); });
  add(cart, 36, 188); obs.push([8, 182, 50, 188]);
  exits.push({ r:[8, 197, 70, 200], to:"sq", enter:[430, 184] });
  const mk = (id, spr, x, y, name, role, key) => npcs.push({ id, mys:key, def:mysSpr(spr), x, y, name, role });
  mk("m_duke", "vil_glasses", 88, 170, "The Duke of Aston", "Your coachman", "duke"); npcs[npcs.length - 1].def = SPRITES.vil_glasses; 
  mk("m_tovar", "mys_tovar", 160, 132, "Inspector Tovar", "Leads the inquiry", "tovar");
  mk("m_lady", "mys_lady", 112, 152, "The Lady of Brown", "Guest", "lady");
  mk("m_duchess", "mys_duchess", 214, 150, "Duchess King", "Guest", "duchess");
  mk("m_madame", "mys_madame", 252, 176, "Madame Thapa", "Guest", "madame");
  mk("m_wain", "mys_wain", 188, 176, "Wain", "Guest", "wain");
  o.name = "SQLeviathan Mansion"; o.spawn = [150, 188]; o.cloudY = [6, 40]; o.dark = true; o.flowers = [];
}
