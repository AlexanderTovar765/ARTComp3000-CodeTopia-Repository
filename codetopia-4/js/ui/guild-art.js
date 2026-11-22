/* Pixel art for the Debuggers' Guild: small icons, a cork board, a brick wall and a CASE CLOSED stamp.
   Everything is drawn from code onto tiny canvases and handed to the stylesheet as images, so it stays crisp at any size. */

"use strict";

const GDART = {};
const GD_LANG_COL = { html:"#ff8a4c", css:"#ff7ab8", cpp:"#6fb0ff", js:"#f7df1e", py:"#6fd08c" };

/* a little pixel canvas with the drawing helpers the icons need */
function gdPix(w, h, draw) {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h; const c = cv.getContext("2d");
  const api = {
    c, w, h,
    p:(x, y, col) => { c.fillStyle = col; c.fillRect(x, y, 1, 1); },
    r:(x, y, ww, hh, col) => { c.fillStyle = col; c.fillRect(x, y, ww, hh); },
    e:(cx, cy, rx, ry, col) => { c.fillStyle = col; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1) c.fillRect(x, y, 1, 1); },
    line:(x0, y0, x1, y1, col) => { c.fillStyle = col; const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2 + 1; for (let i = 0; i <= n; i++) c.fillRect(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), 1, 1); },
    rows:(x0, y0, rows, pal) => rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== "." && pal[ch]) { c.fillStyle = pal[ch]; c.fillRect(x0 + x, y0 + y, 1, 1); } }))
  };
  draw(api); return cv;
}
const gdHash = (x, y, s = 0) => { let n = (x * 374761393 + y * 668265263 + s * 982451653) | 0; n = (n ^ (n >> 13)) * 1274126177; return ((n ^ (n >> 16)) >>> 0) / 4294967295; };

function gdBuildArt() {
  const O = "#1a1330";
  GDART.star = gdPix(9, 9, g => g.rows(0, 0, ["....o....", "...oyo...", "...oyo...", "oooyyyooo", "oyyywyyyo", ".oyyyyyo.", "..oyyyo..", ".oyyoyyo.", ".ooo.ooo."], { o:"#a8660f", y:"#ffd23f", w:"#fff6c0" }));
  GDART.starOff = gdPix(9, 9, g => g.rows(0, 0, ["....o....", "...ofo...", "...ofo...", "ooofffooo", "offfffffo", ".offfffo.", "..offfo..", ".offoffo.", ".ooo.ooo."], { o:"#7a6ec4", f:"#3a3278" }));
  GDART.bug = gdPix(9, 9, g => g.rows(0, 0, ["..k...k..", "...k.k...", "..kkkkk..", ".krrkrrk.", "krrrkrrrk", "krkrkrkrk", "krrrkrrrk", ".krrkrrk.", "..kkkkk.."], { k:O, r:"#e0453f" }));
  GDART.bugGold = gdPix(9, 9, g => g.rows(0, 0, ["..k...k..", "...k.k...", "..kkkkk..", ".kyykyyk.", "kyyykyyyk", "kykykykyk", "kyyykyyyk", ".kyykyyk.", "..kkkkk.."], { k:"#5a3a22", y:"#ffd23f" }));
  GDART.bugOff = gdPix(9, 9, g => g.rows(0, 0, ["..k...k..", "...k.k...", "..kkkkk..", ".kffkffk.", "kfffkfffk", "kfkfkfkfk", "kfffkfffk", ".kffkffk.", "..kkkkk.."], { k:"#463b85", f:"#2c2459" }));
  GDART.pin = gdPix(7, 9, g => g.rows(0, 0, ["..kkk..", ".krrrk.", "krwrrrk", "krrrrrk", ".krrrk.", "..kgk..", "...g...", "...g...", "...k..."], { k:O, r:"#e0453f", w:"#ffb0a8", g:"#a8a8bc" }));
  GDART.glass = gdPix(14, 14, g => { g.e(5.5, 5.5, 5.5, 5.5, O); g.e(5.5, 5.5, 4.2, 4.2, "#cfe8f4"); g.r(3, 3, 2, 2, "#ffffff"); g.line(9, 9, 13, 13, "#5a3a22"); g.line(10, 9, 13, 12, "#8a5a36"); g.line(9, 10, 12, 13, "#8a5a36"); });
  GDART.x = gdPix(9, 9, g => { g.line(1, 1, 7, 7, "#ff6b81"); g.line(7, 1, 1, 7, "#ff6b81"); g.line(2, 1, 7, 6, "#ff6b81"); g.line(6, 1, 1, 6, "#ff6b81"); });
  GDART.check = gdPix(9, 9, g => { g.line(1, 4, 3, 6, "#b9e769"); g.line(3, 6, 8, 1, "#b9e769"); g.line(1, 5, 3, 7, "#b9e769"); g.line(3, 7, 8, 2, "#b9e769"); });
  GDART.lock = gdPix(9, 10, g => { g.r(1, 4, 7, 6, O); g.r(2, 5, 5, 4, "#ffc857"); g.r(3, 0, 3, 5, O); g.r(4, 1, 1, 3, "#463b85"); g.p(4, 6, O); g.r(4, 7, 1, 1, O); });
  /* the four kinds of mistake */
  GDART.typo = gdPix(13, 13, g => { g.r(0, 0, 13, 13, O); g.r(1, 1, 11, 11, "#ffd23f"); g.rows(3, 3, ["###.#", "#.#.#", "###.#", "#.#.#", "#.#.#"].map(r => r.replace(/#/g, "k")), { k:O }); g.r(10, 3, 1, 5, "#d83a3a"); g.r(9, 9, 3, 1, "#d83a3a"); });
  GDART.missing = gdPix(13, 13, g => { g.r(1, 1, 3, 11, "#6fb0ff"); g.r(1, 1, 5, 2, "#6fb0ff"); g.r(1, 10, 5, 2, "#6fb0ff"); g.r(9, 1, 3, 11, "#6fb0ff"); g.r(7, 1, 5, 2, "#6fb0ff"); g.r(7, 10, 5, 2, "#6fb0ff"); g.r(6, 5, 1, 3, "#ff6b81"); g.p(6, 4, "#ff6b81"); });
  GDART.value = gdPix(13, 13, g => { g.r(2, 6, 9, 1, "#b9e769"); g.rows(2, 1, ["..#..", ".###.", "#.#.#", "..#.."].map(r => r.replace(/#/g, "k")), { k:"#b9e769" }); g.rows(2, 8, ["..#..", "#.#.#", ".###.", "..#.."].map(r => r.replace(/#/g, "k")), { k:"#ff9f2a" }); });
  GDART.logic = gdPix(13, 13, g => { const cx = 6.5, cy = 6.5; for (let a = 0; a < 8; a++) { const an = a * Math.PI / 4, x = Math.round(cx + Math.cos(an) * 5.2 - .5), y = Math.round(cy + Math.sin(an) * 5.2 - .5); g.r(x - 1, y - 1, 3, 3, "#c9a0ff"); } g.e(cx, cy, 4.2, 4.2, "#c9a0ff"); g.e(cx, cy, 1.8, 1.8, "#17132e"); });
  /* the cursor a detective would use */
  GDART.cursor = gdPix(16, 16, g => { g.e(5.5, 5.5, 5.5, 5.5, O); g.e(5.5, 5.5, 4.2, 4.2, "rgba(207,232,244,.85)"); g.r(3, 3, 2, 2, "#ffffff"); g.line(9, 9, 15, 15, "#5a3a22"); g.line(10, 9, 15, 14, "#8a5a36"); g.line(9, 10, 14, 15, "#8a5a36"); });
  /* background tiles */
  GDART.wall = gdPix(32, 32, g => { const base = ["#1b1640", "#221c4c", "#19143a"]; for (let row = 0; row < 4; row++) { const y0 = row * 8, off = row % 2 ? 8 : 0; g.r(0, y0, 32, 8, "#100c28");
    for (let b = -1; b < 3; b++) { const x0 = b * 16 + off; g.r(x0 + 1, y0 + 1, 15, 7, base[Math.floor(gdHash(b + 9, row, 3) * 3)]); g.r(x0 + 1, y0 + 1, 15, 1, "#2a2358"); } } });
  GDART.cork = gdPix(16, 16, g => { for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const n = gdHash(x, y, 7); g.p(x, y, n < .12 ? "#8f622f" : n < .3 ? "#a77740" : n > .93 ? "#d2a46c" : n > .8 ? "#c39158" : "#b5834c"); } });
  /* the CASE CLOSED stamp, with a few chips out of the ink so it looks pressed on */
  const word = "CASE CLOSED", tw = typeof vTextW === "function" ? vTextW(word) : 40, W = tw + 14, H = 19;
  GDART.stamp = gdPix(W, H, g => { const R = "#d83a3a"; g.r(0, 0, W, H, R); g.r(2, 2, W - 4, H - 4, "rgba(0,0,0,0)"); g.c.clearRect(1, 1, W - 2, H - 2); g.r(5, 5, W - 10, H - 10, R); g.c.clearRect(6, 6, W - 12, H - 12);
    if (typeof vText === "function") vText(g.c, word, Math.round(W / 2), 7, R);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (gdHash(x, y, 11) < .035) g.c.clearRect(x, y, 1, 1); });
}
const gdURI = name => GDART[name].toDataURL();
const gdIco = (name, w, cls = "") => `<img class="gd-ico ${cls}" src="${gdURI(name)}" width="${w}" alt="" draggable="false">`;
const gdStars = (n, w = 18) => `<span class="gd-stars" role="img" aria-label="${n} of 3 stars">${[0, 1, 2].map(i => gdIco(i < n ? "star" : "starOff", w)).join("")}</span>`;
const gdBugs = (n, w = 14) => `<span class="gd-bugs" role="img" aria-label="Tier ${n} of 3">${[0, 1, 2].map(i => gdIco(i < n ? "bugGold" : "bugOff", w)).join("")}</span>`;

let gdArtReady = false;
function gdInitArt() {
  if (gdArtReady) return; gdArtReady = true; gdBuildArt();
  const el = document.getElementById("guild"), set = (k, v) => el.style.setProperty(k, v);
  set("--gd-wall", `url(${gdURI("wall")})`); set("--gd-cork", `url(${gdURI("cork")})`);
  set("--gd-cursor", `url(${gdURI("cursor")}) 4 4, pointer`); set("--gd-stamp", `url(${gdURI("stamp")})`);
  set("--gd-x", `url(${gdURI("x")})`); set("--gd-bug", `url(${gdURI("bug")})`); set("--gd-check", `url(${gdURI("check")})`);
}
