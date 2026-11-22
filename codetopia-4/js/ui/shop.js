/* The shop: an 8-bit shop interior painted on a small canvas, plus the Shop / Owned tabs. */

"use strict";

window.unlTab = "shop";
function showUnlTab(which){
  window.unlTab = which;
  const shop = which === "shop";
  $("#shopView").hidden = !shop; $("#ownView").hidden = shop;
  $("#tabShop").setAttribute("aria-selected", String(shop)); $("#tabOwn").setAttribute("aria-selected", String(!shop));
  $("#tabShop").tabIndex = shop ? 0 : -1; $("#tabOwn").tabIndex = shop ? -1 : 0;
  if (shop) paintShop(performance.now() / 1000); else if (typeof ownStart === "function") ownStart();
}
$("#tabShop").addEventListener("click", () => showUnlTab("shop"));
$("#tabOwn").addEventListener("click", () => showUnlTab("own"));
$(".utabs").addEventListener("keydown", e => {
  if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return; e.preventDefault();
  const to = window.unlTab === "shop" ? "own" : "shop"; showUnlTab(to); $(to === "shop" ? "#tabShop" : "#tabOwn").focus();
});

const SH = { W:176, H:84 };
const SHC = { wA:"#4a3020", wB:"#3f2a1a", wL:"#2a1a10", wH:"#5e4030", beam:"#2a1a10", beamH:"#3e2818", plank:"#8a5a30", plankH:"#b07a44", plankD:"#5e3a1c", floor:"#6a4a2c", floorD:"#4e341c", floorH:"#7e5a38",
  gold:"#ffd43b", goldD:"#c99a10", glass:"#bfe8ff", red:"#ff6b6b", blue:"#4aa0e8", green:"#6bd36b", purple:"#b794ff", paper:"#f4f1e6", paperD:"#c8c4b4", ink:"#1a1330", iron:"#5a5a6a", ironD:"#34343e" };
const FONT3 = { S:["111","100","111","001","111"], H:["101","101","111","101","101"], O:["111","101","101","101","111"], P:["111","101","111","100","100"] };

/* The merchant's dance. Sixteen beats of 0.4s: 0-3 hop and sway, 4-7 arms pump, 8-11 shimmy, 12-13 a full spin with a jump, 14-15 a big finale.
   Returns the keeper's lean (pixels at the top), hop, arm offsets and a horizontal scale (negative while turned round). */
function shopDance(t){
  if (reduce) return { s:1, hop:Math.sin(t * 2.2) > .2 ? -1 : 0, sway:0, armL:0, armR:0 };
  const b = (t / .4) % 16, f = b % 1, bump = Math.sin(Math.PI * f), PI = Math.PI;
  let s = 1, hop = -Math.round(2 * bump), sway = 0, armL = 0, armR = 0;
  if (b < 4) { sway = Math.sin(PI * b) * 3; armL = Math.round(Math.sin(PI * b + PI)); armR = -armL; }
  else if (b < 8) { const w = Math.round(2.5 * Math.sin(PI * b)); armL = -w; armR = w; sway = Math.sin(PI * b) * 1.5; hop = -Math.round(2.5 * bump); }
  else if (b < 12) { sway = Math.sin(4 * PI * b) * 2; hop = -Math.round(bump); armL = armR = -2 + Math.round(Math.sin(8 * PI * b)); }
  else if (b < 14) { const u = (b - 12) / 2; s = Math.cos(2 * PI * u); hop = -Math.round(4 * Math.sin(PI * u)); armL = armR = -Math.round(2 * Math.sin(PI * u)); }
  else { sway = Math.sin(PI * b) * 3.5; hop = -Math.round(3 * bump); armL = armR = -3; }
  return { s, hop, sway, armL, armR };
}

function paintShop(t){
  const cv = $("#shopCv"); if (!cv || !cv.offsetParent) return;
  const c = cv.getContext("2d"), C = SHC; c.imageSmoothingEnabled = false;
  const R = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  const P = (x, y, col) => R(x, y, 1, 1, col);
  const hash = (a, b) => ((a * 73856093) ^ (b * 19349663)) >>> 0;
  // back wall: vertical planks with grain and nails
  for (let x = 0; x < SH.W; x += 8) { const odd = (x / 8) & 1; R(x, 0, 8, 70, odd ? C.wA : C.wB); R(x, 0, 1, 70, C.wL); R(x + 1, 0, 1, 70, C.wH);
    for (let y = 4; y < 70; y += 7) if (hash(x, y) % 3 === 0) R(x + 3 + hash(y, x) % 3, y, 1, 2, C.wL); P(x + 4, 18, C.wL); P(x + 4, 52, C.wL); }
  // ceiling beam with brackets
  R(0, 0, SH.W, 5, C.beam); R(0, 0, SH.W, 1, C.beamH); for (let x = 12; x < SH.W; x += 36) { R(x, 5, 3, 3, C.beam); R(x + 3, 5, 2, 2, C.beam); }
  // shelves left and right: boards, brackets, wares
  const board = (x, y, w) => { R(x, y, w, 2, C.plankH); R(x, y + 2, w, 2, C.plank); R(x, y + 4, w, 1, C.plankD); R(x + 3, y + 5, 2, 4, C.plankD); R(x + w - 5, y + 5, 2, 4, C.plankD); };
  const jar = (x, y, col) => { R(x + 1, y, 3, 1, C.paperD); R(x, y + 1, 5, 6, C.glass); R(x + 1, y + 3, 3, 3, col); P(x + 1, y + 2, "#ffffff"); };
  const flask = (x, y, col) => { R(x + 2, y, 2, 2, C.glass); R(x, y + 2, 6, 5, col); R(x + 1, y + 1, 4, 1, col); P(x + 1, y + 3, "#ffffff"); };
  const books = (x, y) => { R(x, y + 5, 10, 2, C.red); R(x + 1, y + 3, 9, 2, C.blue); R(x, y + 1, 8, 2, C.green); P(x + 8, y + 6, C.gold); };
  const scroll = (x, y) => { R(x, y + 1, 4, 6, C.paper); R(x - 1, y, 6, 1, C.plank); R(x - 1, y + 7, 6, 1, C.plank); R(x + 1, y + 3, 2, 1, C.ink); };
  const chest = (x, y) => { R(x, y + 2, 10, 5, C.plankD); R(x, y, 10, 3, C.plank); R(x, y + 3, 10, 1, C.gold); R(x + 4, y + 3, 2, 3, C.gold); };
  const sack = (x, y) => { R(x + 1, y + 2, 8, 6, C.paperD); R(x + 2, y, 6, 3, C.paperD); R(x + 3, y + 2, 4, 1, C.plankD); P(x + 5, y + 5, C.goldD); };
  board(6, 28, 52); jar(10, 21, C.purple); flask(18, 22, C.red); books(27, 22); jar(40, 21, C.green); scroll(50, 21);
  board(6, 48, 52); chest(9, 41); flask(24, 42, C.blue); jar(33, 41, C.gold); sack(42, 40);
  board(118, 28, 52); flask(122, 22, C.green); jar(131, 21, C.red); books(140, 22); flask(154, 22, C.purple); scroll(163, 21);
  board(118, 48, 52); jar(123, 41, C.blue); chest(131, 41); sack(147, 40); flask(160, 42, C.red);
  // hanging sign
  R(70, 5, 1, 4, C.iron); R(105, 5, 1, 4, C.iron); R(62, 9, 52, 18, C.plankD); R(63, 10, 50, 16, C.plank); R(63, 10, 50, 2, C.plankH); R(64, 14, 48, 1, C.plankD);
  P(65, 12, C.ironD); P(110, 12, C.ironD); P(65, 24, C.ironD); P(110, 24, C.ironD);
  "SHOP".split("").forEach((ch, i) => { const g = FONT3[ch], x0 = 74 + i * 8; g.forEach((row, ry) => { for (let rx = 0; rx < 3; rx++) if (row[rx] === "1") { R(x0 + rx * 2, 14 + ry * 2 + 0, 2, 2, C.goldD); R(x0 + rx * 2, 13 + ry * 2, 2, 2, C.gold); } }); });
  // lanterns with flicker
  [[28, 8], [148, 8]].forEach(([lx, ly], i) => { const f = Math.sin(t * 7 + i * 2) * .5 + Math.sin(t * 13 + i) * .3, r = 11 + Math.round(f * 2);
    c.globalAlpha = .13 + f * .03; c.fillStyle = "#ffcf6a"; for (let k = r; k > 2; k -= 3) { c.beginPath(); c.arc(lx + 3, ly + 12, k, 0, 7); c.fill(); } c.globalAlpha = 1;
    R(lx + 2, ly - 3, 2, 5, C.iron); R(lx, ly + 2, 6, 2, C.ironD); R(lx, ly + 4, 6, 8, "#ffe9a8"); R(lx + 1, ly + 5, 4, 6, f > 0 ? "#ffd266" : "#ffc24a"); R(lx + 2, ly + 6, 2, 3, "#fff6cf"); R(lx, ly + 12, 6, 2, C.ironD); R(lx + 3, ly + 4, 0, 0, C.ink); R(lx + 2, ly + 4, 2, 8, "rgba(0,0,0,0)"); R(lx, ly + 4, 1, 8, C.ironD); R(lx + 5, ly + 4, 1, 8, C.ironD); });
  // floor boards
  R(0, 70, SH.W, SH.H - 70, C.floor); for (let y = 70; y < SH.H; y += 5) R(0, y, SH.W, 1, C.floorD); for (let y = 70, r = 0; y < SH.H; y += 5, r++) for (let x = (r & 1) * 9; x < SH.W; x += 18) R(x, y, 1, 5, C.floorD); R(0, 70, SH.W, 1, C.floorH);
  // barrel (left) and crates (right)
  R(8, 58, 18, 20, C.plank); R(9, 56, 16, 3, C.plankH); R(8, 60, 18, 2, C.plankD); R(8, 68, 18, 2, C.plankD); R(8, 58, 2, 20, C.plankD); R(24, 58, 2, 20, C.plankD); R(12, 58, 1, 20, C.plankD); R(20, 58, 1, 20, C.plankD); R(8, 77, 18, 1, C.floorD);
  R(150, 62, 18, 16, C.plank); R(150, 62, 18, 2, C.plankH); R(150, 62, 2, 16, C.plankD); R(166, 62, 2, 16, C.plankD); R(150, 69, 18, 2, C.plankD); R(152, 64, 14, 1, C.plankD); P(158, 57, C.gold); R(154, 52, 11, 10, C.plankD); R(154, 52, 11, 2, C.plank); R(155, 54, 9, 1, C.plankD);
  // the keeper, behind the counter: a sixteen-beat dance (hop and sway, arm pumps, shimmy, spin and finale)
  const kp = SPRITES.shopkeeper, kh = kp.px.length, kw = kp.px[0].length, kx = Math.round(SH.W / 2 - kw / 2), kc = (kw - 1) / 2, dn = shopDance(t);
  const sgn = dn.s < 0 ? -1 : 1, sc = Math.abs(dn.s) < .12 ? .12 * sgn : dn.s, baseY = 66 - kh;
  for (let tx = -kw; tx < kw * 2; tx++) {
    const sx = Math.round(kc + (tx - kc) / sc); if (sx < 0 || sx >= kw) continue;
    const dy = baseY + dn.hop + (sx < 10 ? dn.armL : sx > 28 ? dn.armR : 0);
    for (let y = 0; y < kh; y++) { const ch = kp.px[y][sx]; if (ch !== ".") P(kx + tx + Math.round(dn.sway * (1 - y / kh)), dy + y, kp.pal[ch]); }
  }
  // music notes drifting up from the dance
  if (!reduce) for (let i = 0; i < 4; i++) {
    const ph = ((t * .7 + i * .25) % 1), nx = (i % 2 ? 112 : 58) + Math.round(Math.sin(t * 3 + i * 2) * 4) + (i > 1 ? (i % 2 ? 6 : -6) : 0), ny = 56 - Math.round(ph * 28), col = [C.gold, "#ffffff", C.blue, C.purple][i];
    c.globalAlpha = ph < .15 ? ph / .15 : ph > .75 ? (1 - ph) / .25 : 1; R(nx, ny + 3, 2, 2, col); R(nx + 1, ny, 1, 4, col); R(nx + 2, ny, 2, 1, col); R(nx + 2, ny + 1, 1, 1, col); c.globalAlpha = 1;
  }
  // counter
  R(38, 62, 100, 3, C.plankH); R(38, 65, 100, 2, C.plank); R(36, 67, 104, 12, C.plank); R(36, 67, 104, 1, C.plankH); R(36, 78, 104, 2, C.plankD);
  for (let x = 36; x < 140; x += 26) { R(x, 67, 1, 13, C.plankD); R(x + 1, 69, 24, 8, C.plankD); R(x + 2, 70, 22, 6, C.plank); R(x + 2, 70, 22, 1, C.plankH); }
  R(36, 67, 2, 13, C.plankD); R(138, 67, 2, 13, C.plankD);
  // on the counter: coin stacks, ledger, bell, potion
  const stack = (x, n) => { for (let i = 0; i < n; i++) { R(x, 60 - i * 2, 6, 2, C.gold); R(x, 61 - i * 2, 6, 1, C.goldD); } };
  stack(44, 3); stack(51, 2); stack(58, 4);
  R(112, 59, 12, 3, C.paper); R(112, 61, 12, 1, C.paperD); R(118, 59, 1, 3, C.plankD); R(114, 60, 3, 1, C.ink); R(120, 60, 3, 1, C.ink);
  R(128, 57, 5, 4, C.gold); R(127, 61, 7, 1, C.goldD); P(130, 56, C.goldD);
  flask(100, 55, C.green);
}
let shopTimer = 0;
function shopLoop(){ clearInterval(shopTimer); shopTimer = setInterval(() => { if ($("#unl").hidden || $("#shopView").hidden || document.hidden) return; paintShop(performance.now() / 1000); }, reduce ? 1500 : 70); }
shopLoop();
