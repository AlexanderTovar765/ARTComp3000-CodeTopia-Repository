/* Title screen and language select. */

"use strict";

/* ================= title and language screens ================= */
const intro = $("#intro"), icv = $("#icv");
const ic = { W:0, H:0, GT:0, sky:null, stars:[], trees:[], u:null, img:null, ctx:null };
let introOn = false, introRAF = 0, introLast = 0, introStart = 0;
const hexU = (() => { const m = {}; return h => m[h] ?? (m[h] = (() => { const n = parseInt(h.slice(1), 16); return ((255 << 24) | ((n & 255) << 16) | (n & 0xff00) | (n >> 16)) >>> 0; })()); })();
const wv = (x, ph) => { const k = 2 * Math.PI / ic.W; return .55 * Math.sin(k * 3 * x + ph) + .3 * Math.sin(k * 7 * x + ph * 2) + .15 * Math.sin(k * 15 * x + ph * 3); };
const hsh = (a, b) => ((a * 73856093) ^ (b * 19349663)) >>> 0;
function introSize(){
  const cell = innerWidth < 600 ? 3 : 4, W = Math.ceil(innerWidth / cell), H = Math.ceil(innerHeight / cell);
  icv.width = W; icv.height = H; ic.W = W; ic.H = H; ic.GT = H - Math.round(H * .24);
  ic.ctx = icv.getContext("2d"); ic.img = ic.ctx.createImageData(W, H); ic.u = new Uint32Array(ic.img.data.buffer);
  const GT = ic.GT, SKY = THEMES[0].sky, BAY = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5], sky = new Uint32Array(W * H);
  for (let y = 0; y < H; y++) { const f = Math.pow(Math.min(y, GT - 1) / (GT - 1), 1.1) * (SKY.length - 1), i = Math.min(SKY.length - 2, Math.floor(f)), fr = f - i;
    for (let x = 0; x < W; x++) sky[y * W + x] = hexU(fr > (BAY[(y & 3) * 4 + (x & 3)] + .5) / 16 ? SKY[i + 1] : SKY[i]); }
  const put = (x, y, c) => { if (x >= 0 && y >= 0 && x < W && y < H) sky[y * W + x] = hexU(c); };
  const mx = Math.round(W * .74), my = Math.round(GT * .3), R = Math.max(7, Math.round(GT * .12));
  for (let dy = -R - 4; dy <= R + 4; dy++) for (let dx = -R - 4; dx <= R + 4; dx++) { const d2 = dx * dx + dy * dy;
    if (d2 <= R * R) put(mx + dx, my + dy, ((dx + R * .35) ** 2 + (dy - R * .2) ** 2 > (R * .9) ** 2) ? "#e6cf9f" : "#fff1cf");
    else if (d2 <= (R + 3) * (R + 3) && ((mx + dx + my + dy) & 1) === 0) put(mx + dx, my + dy, "#5a4690"); }
  [[-2,-2],[1,1],[-1,3]].forEach(([dx, dy]) => { put(mx + dx, my + dy, "#d9bf8a"); put(mx + dx + 1, my + dy, "#d9bf8a"); });
  ic.sky = sky;
  let seed = 77; const rand = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  ic.stars = []; for (let k = 0, n = Math.round(W * GT / 450); k < n; k++) ic.stars.push({ x:Math.floor(rand() * W), y:Math.floor(rand() * GT * .65), p:Math.floor(rand() * 6), big:rand() < .15 });
  ic.trees = []; for (let x = 4; x < W - 4; x += 7 + Math.floor(rand() * 9)) ic.trees.push({ x, h:5 + Math.floor(rand() * 4) });
}
function paintIntro(t){
  const { W, H, GT, u } = ic, T = THEMES[0]; u.set(ic.sky);
  const set = (x, y, c) => { if (x >= 0 && y >= 0 && x < W && y < H) u[y * W + x] = c; };
  const fr = Math.floor(t * 10), wc = hexU("#ffffff"), dc = hexU("#8f8fd0");
  ic.stars.forEach(s => { const on = ((fr + s.p) % 6) < 4; set(s.x, s.y, on ? wc : dc); if (s.big && on) [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dx, dy]) => set(s.x + dx, s.y + dy, dc)); });
  [[.1,.34,22,1.6],[.5,.22,28,1.1],[.82,.46,18,2.2],[.3,.58,14,1.9]].forEach(([bx, by, w, sp]) => {
    const span = W + w * 2, cx = Math.floor((((bx * W + t * sp) % span) + span) % span) - w;
    [[.45,"#7a55a8"],[.9,"#5d3f8f"],[1,"#4f3580"],[.7,"#4f3580"]].forEach(([f, c], j) => { const rw = Math.round(w * f), x0 = Math.round(cx - rw / 2), cc = hexU(c); for (let x = 0; x < rw; x++) set(x0 + x, Math.round(GT * by) + j, cc); }); });
  const ridge = (hgt, amp, ph, off, fill, edge) => { const tops = new Array(W), o = Math.floor(off), cf = hexU(fill), ce = hexU(edge);
    for (let x = 0; x < W; x++) { const top = GT - Math.round(hgt + amp * wv(x + o, ph)); tops[x] = top; for (let y = Math.max(0, top); y < GT; y++) u[y * W + x] = cf; set(x, top, ce); if ((x & 1) === 0) set(x, top + 1, ce); }
    return { tops, o }; };
  ridge(GT * .3, GT * .1, 1.3, t * 1.5, T.far, T.farE);
  const nr = ridge(GT * .16, GT * .07, 4.1, t * 4, T.near, T.nearE), tc = hexU(T.tree), tk = hexU(T.trunk);
  ic.trees.forEach(tr => { const sx = (((tr.x - nr.o) % W) + W) % W, top = nr.tops[sx];
    for (let rr = 0; rr < tr.h; rr++) { const hw = Math.floor(rr / 2); for (let dx = -hw; dx <= hw; dx++) set(sx + dx, top - tr.h + rr, tc); }
    set(sx, top, tk); set(sx, top + 1, tk); });
  const o3 = Math.floor(t * 12), g1 = hexU("#5fb36e"), gA = hexU("#8bd993"), gB = hexU("#4a9b62"), gC = hexU("#2f6650"), gD = hexU("#3d7d5d");
  const dark = hexU("#1a3032"), lite = hexU("#34605f"), bricks = ["#27494a","#2a4f4f","#244344"].map(hexU);
  for (let x = 0; x < W; x++) { const wx = x + o3; if (hsh(wx, 7) % 7 === 0) { set(x, GT - 1, g1); if (hsh(wx, 9) % 3 === 0) set(x, GT - 2, g1); } }
  for (let y = GT; y < H; y++) { const row = y - GT;
    for (let x = 0; x < W; x++) { const wx = x + o3; let c;
      if (row === 0) c = gA; else if (row === 1) c = g1;
      else if (row < 4) { const q = hsh(wx, row) % 10; c = q < 1 ? gB : q < 2 ? gC : gD; }
      else { const br = Math.floor((row - 4) / 5), iy = (row - 4) % 5, ox = (br & 1) * 5, bx = Math.floor((wx + ox) / 10), ix = (wx + ox) % 10;
        c = (iy === 4 || ix === 9) ? dark : iy === 0 ? lite : bricks[hsh(bx, br) % 3]; }
      u[y * W + x] = c; } }
  ic.ctx.putImageData(ic.img, 0, 0);
}
function introLoop(now){ if (!introOn) return; introRAF = requestAnimationFrame(introLoop); if (now - introLast < 80) return; introLast = now; paintIntro((now - introStart) / 1000); }
function startIntro(){ introOn = true; introSize(); introStart = performance.now(); if (reduce) paintIntro(0); else introRAF = requestAnimationFrame(introLoop); }
function stopIntro(){ introOn = false; cancelAnimationFrame(introRAF); }
addEventListener("resize", () => { if (introOn) { introSize(); if (reduce) paintIntro(0); } });
function setPanel(p){
  $("#pTitle").hidden = p !== "title"; $("#pLang").hidden = p !== "lang"; $("#langNote").textContent = "";
  if (p === "lang") {
    const hd = trackData("html"), cd = trackData("cpp"), hc = TRACKS.html.CON;
    $$(".lang[data-lang]").forEach(b => { const l = b.dataset.lang; if (l === "html") return;
      if (b.dataset.ls === undefined) { b.dataset.ls = b.querySelector(".ls").textContent; b.dataset.go = b.querySelector(".go").textContent; }
      const open = l === "cpp" ? (!!D.admin || htmlDone()) : !!D.admin, ls = b.querySelector(".ls"), go = b.querySelector(".go");
      b.setAttribute("aria-disabled", open ? "false" : "true"); b.classList.toggle("adm-open", open);
      if (l === "cpp") { ls.textContent = open ? (Object.keys(cd.stars).length ? "Level " + cd.unlocked + " unlocked" : "10 levels · variables, loops, pointers") : "Locked. Defeat the Markup Titan to open."; go.textContent = open ? "Play" : "Locked"; }
      else { ls.textContent = open ? "Boss arena. Admin mode." : b.dataset.ls; go.textContent = open ? "Fight (admin)" : b.dataset.go; }
      go.classList.toggle("soon", !open); });
    const mastered = Object.keys(hc).filter(id => hd.mast[id] && hd.mast[id].seen && hd.mast[id].box >= 5).length;
    $("#langHtmlSub").textContent = Object.keys(hd.stars).length || hd.unlocked > 1 ? "Level " + hd.unlocked + " unlocked · " + mastered + "/" + Object.keys(hc).length + " concepts mastered" : "10 levels · tags, pages and forms";
  }
  intro.scrollTop = 0; const b = p === "title" ? $("#play") : $(".lang[data-lang=html]"); if (b) b.focus({ preventScroll:true });
}
function showIntro(p){ closeSheets(); intro.hidden = false; document.body.style.overflow = "hidden"; $(".app").inert = true; startIntro(); setPanel(p); }
function leaveIntro(){ intro.hidden = true; stopIntro(); $(".app").inert = false; openMap(); }
$("#play").addEventListener("click", () => setPanel("lang"));
$("#langBack").addEventListener("click", () => setPanel("title"));
$("#langs").addEventListener("click", e => {
  const b = e.target.closest(".lang"); if (!b) return;
  const l = b.dataset.lang;
  if (l === "html" || (l === "cpp" && b.getAttribute("aria-disabled") !== "true")) { setTrack(l); leaveIntro(); return; }
  if (l !== "cpp" && D.admin) { const n = TRACKS.html.LEVELS.findIndex(x => x.lang === l) + 1; if (n) { setTrack("html"); leaveIntro(); startLevel(n); return; } }
  $("#langNote").textContent = l === "cpp" ? "C++ opens when you defeat the Markup Titan, the boss of HTML level 10." : b.dataset.name + " is locked for now. HTML comes first.";
  anim(b, [{ transform:"translateX(0)" }, { transform:"translateX(-6px)" }, { transform:"translateX(6px)" }, { transform:"translateX(-3px)" }, { transform:"translateX(0)" }], { duration:300 });
});
$("#mLang").addEventListener("click", () => showIntro("lang"));
$("#bLang").addEventListener("click", () => { if (S.busy && started && $("#overlay").hidden) return; showIntro("lang"); });
document.addEventListener("keydown", e => { if (!intro.hidden && e.key === "Escape" && !$("#pLang").hidden) setPanel("title"); });
{ const L = $("#logo"); "CODETOPIA".split("").forEach((c, i) => { const sp = document.createElement("span"); sp.textContent = c; sp.style.setProperty("--i", i); sp.setAttribute("aria-hidden", "true"); L.appendChild(sp); });
  const G = ["<", ">", "/>", "{ }", "</p>", "<br>", "<h1>", "=\"\"", "&", "</a>"], gl = $("#glyphs");
  for (let i = 0; i < 14; i++) { const sp = document.createElement("span"); sp.textContent = G[i % G.length]; sp.style.left = (4 + Math.random() * 90) + "%"; sp.style.setProperty("--d", (10 + Math.random() * 10) + "s"); sp.style.animationDelay = -(Math.random() * 20) + "s"; gl.appendChild(sp); }
  $("#tHeroB").innerHTML = spriteSVG(SPRITES.hero); $("#tSlimeB").innerHTML = spriteSVG(SPRITES.slime); $("#tBatB").innerHTML = spriteSVG(SPRITES.bat); }
