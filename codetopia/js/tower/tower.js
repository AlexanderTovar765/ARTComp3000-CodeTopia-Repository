/* Challenge Tower: an endless first-person gauntlet. Each floor has one enemy; type its code within 30 seconds or the run ends.
   Draws on every spell in both language tracks (HTML and C++) without touching the campaign state. */

"use strict";

/* ================= Challenge Tower ================= */
const TOWER_SECONDS = 30;
/* TEST BUILD ONLY: typing HACK beats the current enemy. Set to false (or delete this line and its check in onTower) before release. */
const TOWER_HACK = true;
const TOWER_NAMES = { skeleton:"Skeleton Scribe", ghost:"Syntax Ghost", gargoyle:"Gargoyle", mimic:"Mimic Chest", armor:"Hollow Knight", watcher:"The Watcher", rat:"Tower Rat", golem:"Moss Golem" };
const T = { earned:0, on:false, lang:"mixed", floor:1, state:"idle", les:null, mode:"full", deadline:0, walkStart:0, walkFrom:0, off:0, raf:0, prevLen:0, last:[], foeKey:"" };
const tw = $("#tower"), twCv = $("#twCv"), twIn = $("#twIn");
const twCtx = twCv.getContext("2d"), TW_W = 192, TW_H = 108;
twCv.width = TW_W; twCv.height = TW_H;
const twImg = twCtx.createImageData(TW_W, TW_H), twPx = new Uint32Array(twImg.data.buffer);
D.tower = D.tower || { best:0 };

/* the corridor: a classic tunnel drawn per pixel, with brick walls, a tiled floor and an arch at the far end */
const twRGB = (r, g, b) => ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;
const twHash = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function paintTower(t){
  const cx = TW_W / 2, cy = TW_H / 2 - 2, flick = 0.92 + 0.08 * Math.sin(t * 9) * Math.sin(t * 5.3), off = T.off;
  for (let y = 0; y < TW_H; y++) {
    const sy = (y + .5 - cy) / (TW_H / 2);
    for (let x = 0; x < TW_W; x++) {
      const sx = (x + .5 - cx) / (TW_W / 2), dx = Math.abs(sx) * .95, dy = Math.abs(sy) * 1.25, d = Math.max(dx, dy);
      let r, g, b;
      if (d < .13) { // doorway at the end of the hall
        const k = Math.max(0, 1 - d / .13); r = 40 + 120 * k * flick; g = 24 + 60 * k * flick; b = 70 + 40 * k;
        if (Math.abs(sx) < .04 && sy > -.05) { r *= .5; g *= .5; b *= .6; }
      } else {
        const z = 1 / d; let u, v, base;
        if (dx >= dy) { u = z * 2.4 + off; v = sy * z * 1.1; base = [78, 62, 112]; }
        else { u = sx * z * 1.3; v = z * 2.4 + off; base = sy > 0 ? [64, 52, 92] : [48, 40, 76]; }
        let row, col, mortar;
        if (dx >= dy) { row = Math.floor(v * 3); const uu = u * 1.2 + (row & 1) * .5; col = Math.floor(uu); mortar = (uu - col) < .08 || (v * 3 - row) < .12; }
        else if (sy > 0) { row = Math.floor(v * 1.2); col = Math.floor(u * 1.2); mortar = ((v * 1.2 - row) < .06) || ((u * 1.2 - col) < .06); }
        else { row = Math.floor(v * 1.4); const uu = u * 1.2 + (row & 1) * .5; col = Math.floor(uu); mortar = (uu - col) < .08 || (v * 1.4 - row) < .1; }
        const n = twHash(col, row + (dx >= dy ? 11 : sy > 0 ? 29 : 47)), tone = .8 + n * .35;
        let sh = Math.min(1, .1 + d * 1.15) * flick;
        r = base[0] * tone; g = base[1] * tone; b = base[2] * tone;
        if (mortar) { r *= .45; g *= .45; b *= .55; }
        if (dx >= dy) { const tp = ((u / 9) % 1 + 1) % 1; // wall torches glow
          if (tp > .46 && tp < .54 && Math.abs(v) < .16) { r = 255; g = 190 + 50 * flick; b = 90; sh = 1; }
          else if (tp > .38 && tp < .62 && Math.abs(v) < .5) { r += 70 * flick; g += 30 * flick; sh = Math.min(1, sh + .25); } }
        r *= sh; g *= sh; b *= sh * 1.05;
      }
      twPx[y * TW_W + x] = twRGB(Math.min(255, r) | 0, Math.min(255, g) | 0, Math.min(255, b) | 0);
    }
  }
  twCtx.putImageData(twImg, 0, 0);
}

/* choosing the enemy's spell: the pool grows as the floors rise */
const twTracks = () => T.lang === "mixed" ? ["html", "cpp", "js"] : [T.lang];
function twPick(){
  const id = sample(twTracks()), pool = TRACKS[id].SP.filter(s => !s.bug), maxL = Math.min(10, 1 + Math.floor(T.floor / 2));
  let c = pool.filter(s => s.L <= maxL && s.L >= maxL - 2 && !T.last.includes(s.id + id));
  if (!c.length) c = pool.filter(s => s.L <= maxL);
  const sp = sample(c); T.last.push(sp.id + id); if (T.last.length > 12) T.last.shift();
  const keep = TRK; TRK = TRACKS[id];
  try { const les = instantiate(sp); les.track = id; return les; } finally { TRK = keep; }
}
const twHint = (les, i) => { const keep = TRK; TRK = TRACKS[les.track]; try { return TRK.hint(les, i); } finally { TRK = keep; } };

const twLayout = () => tw.style.setProperty("--twp", $("#twPanel").offsetHeight + "px");
addEventListener("resize", () => { if (T.on) twLayout(); });
function twDraw(){
  const les = T.les; if (!les) return;
  const t = les.code, v = twIn.value, recall = T.mode === "recall"; let h = "";
  for (let i = 0; i < t.length; i++) {
    if (i === v.length) h += '<i class="caret"></i>';
    const ch = t[i], cls = les.cls[i], st = i < v.length ? (v[i] === ch ? "ok" : "bad") : "todo", shown = st === "bad" ? v[i] : ch;
    if (ch === "\n") { h += `<span class="nl ${st}">${st === "bad" ? esc(vis(shown)) : "↵"}</span><br>`; continue; }
    h += `<span class="${cls} ${st}${st === "todo" && recall ? " hid" : ""}">${esc(vis(shown))}</span>`;
  }
  if (v.length >= t.length) h += '<i class="caret"></i>';
  for (let i = t.length; i < v.length; i++) h += `<span class="bad">${esc(vis(v[i]))}</span>`;
  if (recall && !v) h += '<span class="ph">Type it from memory</span>';
  $("#twCode").innerHTML = h; twLayout();
}
const twFb = s => { $("#twFb").textContent = s; };
const twCoins = () => { const e = $("#twCoins"); if (e) e.textContent = "Coins " + (D.coins || 0); };
function twFloat(txt){ const f = document.createElement("div"); f.className = "tw-plus"; f.textContent = txt; tw.appendChild(f); setTimeout(() => f.remove(), 1200); }
function twShowFoe(on){ $("#twFoe").classList.toggle("in", on); }

function twNext(){
  T.les = twPick(); T.foeKey = sample(Object.keys(TOWER_FOES));
  T.mode = (T.floor > 10 || (T.floor > 5 && T.floor % 2 === 0)) ? "recall" : "full";
  $("#twFoe").innerHTML = spriteSVG(TOWER_FOES[T.foeKey]); $("#twFoe").classList.remove("dead", "in");
  $("#twName").textContent = TOWER_NAMES[T.foeKey]; $("#twFloor").textContent = "Floor " + T.floor;
  $("#twBest").textContent = "Best " + D.tower.best;
  $("#twGoal").textContent = "Goal: " + T.les.goal; $("#twLang").textContent = TRACKS[T.les.track].lang + (T.mode === "recall" ? " · from memory" : "");
  twIn.value = ""; T.prevLen = 0; twFb(""); twDraw();
  twIn.setAttribute("aria-label", T.mode === "full" ? "Type this " + TRACKS[T.les.track].lang + ": " + T.les.code : "Type the " + TRACKS[T.les.track].lang + " described by the goal");
  T.state = "walk"; T.walkStart = performance.now(); T.walkFrom = T.off; T.deadline = 0;
  $("#twBar i").style.width = "100%"; $("#twTime").textContent = TOWER_SECONDS + ".0s";
}
function twArrive(){
  T.state = "fight"; twShowFoe(true); T.deadline = performance.now() + TOWER_SECONDS * 1000; twIn.disabled = false; twIn.focus({ preventScroll:true });
}
function twWin(){
  if (T.state !== "fight") return;
  T.state = "win"; const cleared = T.floor; if (cleared > D.tower.best) { D.tower.best = cleared; persist(); }
  const gain = cleared % 10 === 0 ? COINS.towerTenth : COINS.towerFloor; T.earned += gain; addCoins(gain); twFloat("+" + gain + " coins");
  $("#twFoe").classList.add("dead"); twFb(""); twIn.disabled = true;
  setTimeout(() => { if (!T.on || T.state !== "win") return; T.floor++; twNext(); }, reduce ? 150 : 650);
}
function twLose(){
  T.state = "over"; twIn.disabled = true; const cleared = T.floor - 1;
  $("#twOverMsg").textContent = cleared === 0 ? "The first enemy was too quick. You cleared no floors." : "You cleared " + cleared + (cleared === 1 ? " floor." : " floors.");
  $("#twOverMsg").textContent += " You earned " + T.earned + " coins."; $("#twOverBest").textContent = "Best: " + D.tower.best + (cleared > 0 && cleared >= D.tower.best ? " (new record!)" : "");
  $("#twOver").hidden = false; $("#twAgain").focus();
}
function twOnInput(){
  if (T.state !== "fight") return;
  const v = twIn.value, t = T.les.code;
  if (TOWER_HACK && v === "HACK") { twWin(); return; }
  let bad = -1; if (v.length < T.prevLen) T.prevLen = v.length;
  for (let i = T.prevLen; i < v.length; i++) if (v[i] !== t[i] && bad < 0) bad = i;
  T.prevLen = v.length; twDraw();
  if (bad >= 0) twFb(bad < t.length ? twHint(T.les, bad) : "That is more than the spell needs. Press Backspace."); else twFb("");
  if (v === t) twWin();
}
function twLoop(now){
  if (!T.on) return; T.raf = requestAnimationFrame(twLoop);
  if (T.state === "walk") {
    const k = Math.min(1, (now - T.walkStart) / (reduce ? 1 : 900)); T.off = T.walkFrom + (1 - Math.pow(1 - k, 2)) * 5;
    if (k >= 1) twArrive();
  } else if (T.state === "fight") {
    const left = Math.max(0, T.deadline - now); $("#twBar i").style.width = (100 * left / (TOWER_SECONDS * 1000)) + "%";
    $("#twTime").textContent = (left / 1000).toFixed(1) + "s"; tw.classList.toggle("urgent", left < 8000);
    if (left <= 0) twLose();
  }
  paintTower(now / 1000);
}
function twStartRun(){
  T.floor = 1; T.earned = 0; T.last = []; $("#twStart").hidden = true; $("#twOver").hidden = true; tw.classList.remove("urgent"); T.off = 0; twNext();
}
function openTower(){
  T.on = true; tw.hidden = false; document.body.style.overflow = "hidden"; T.state = "idle"; T.les = null;
  $("#twStart").hidden = false; $("#twOver").hidden = true; $("#twFoe").classList.remove("in"); $("#twBest").textContent = "Best " + D.tower.best;
  $("#twStartBest").textContent = D.tower.best ? "Your best: " + D.tower.best + (D.tower.best === 1 ? " floor" : " floors") : "No record yet.";
  $("#twFloor").textContent = "Floor 1"; $("#twName").textContent = ""; $("#twGoal").textContent = ""; $("#twLang").textContent = ""; $("#twCode").innerHTML = ""; twFb("");
  twCoins(); twSetLang(T.lang); cancelAnimationFrame(T.raf); T.raf = requestAnimationFrame(twLoop); $("#twGo").focus();
}
function closeTower(){ T.on = false; T.state = "idle"; cancelAnimationFrame(T.raf); tw.hidden = true; document.body.style.overflow = "hidden"; const b = $("#tower-btn"); if (b) b.focus({ preventScroll:true }); }
function twSetLang(l){ T.lang = l; $$("#twLangs [data-l]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.l === l))); }

$("#tower-btn").addEventListener("click", openTower);
$("#twGo").addEventListener("click", twStartRun);
$("#twAgain").addEventListener("click", twStartRun);
$("#twExit").addEventListener("click", closeTower);
$("#twExit2").addEventListener("click", closeTower);
$("#twExit3").addEventListener("click", closeTower);
$("#twLangs").addEventListener("click", e => { const b = e.target.closest("[data-l]"); if (b) twSetLang(b.dataset.l); });
$("#twPanel").addEventListener("click", () => { if (T.state === "fight") twIn.focus(); });
twIn.addEventListener("input", twOnInput);
twIn.addEventListener("paste", e => e.preventDefault());
twIn.addEventListener("drop", e => e.preventDefault());
twIn.addEventListener("keydown", e => {
  if (T.state !== "fight") return;
  if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"].includes(e.key)) { e.preventDefault(); return; }
  if (e.key === "Enter") {
    e.preventDefault(); const v = twIn.value, t = T.les.code;
    twIn.value += (t[v.length] === "\n") ? "\n" + /^ */.exec(t.slice(v.length + 1))[0] : "\n"; twOnInput(); return;
  }
  if (e.key === "Backspace" && /\n +$/.test(twIn.value)) { e.preventDefault(); twIn.value = twIn.value.replace(/\n +$/, ""); twOnInput(); }
});
document.addEventListener("keydown", e => { if (e.key === "Escape" && T.on) closeTower(); });
