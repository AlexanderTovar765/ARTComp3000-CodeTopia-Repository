/* The Builders' Plot: the Plot Studio sheet (editor, run, live preview, what you can use) and the glue to the village. */

"use strict";

let PLREV = 0;
const PLS = { lang:"html", raf:0, last:0, house:null, hrev:-1, garden:null, grev:-1, saveT:0, htmlT:0, res:{}, n:null };
const PL_HELPER = () => SPRITES.vil_baker;
const plGeoPrev = { left:20, span:280, top:6, ground:104 }, plGeoVil = { left:24, span:272, top:6, ground:116 };

function plChanged(lang) { PLREV++; PLS.res.rev = PLREV; if (lang === "js") plH.pending = true; if (lang === "cpp") plFw.pending = true; }

/* ---------- the sheet ---------- */
function plRenderTabs() {
  $("#plTabs").innerHTML = PL_LANGS.map(l => '<button type="button" role="tab" class="fgtab" data-lang="' + l.id + '" aria-selected="' + (l.id === PLS.lang) + '">' + l.name + "<small> " + PL_WHAT[l.id] + "</small></button>").join("");
}
function plRenderTools() {
  const L = PLS.lang, t = PL_UNLOCK[L];
  $("#plTools").innerHTML = Object.keys(t).map(k => { const ok = plOpen(L, k); return '<li class="' + (ok ? "ok" : "no") + '"><span aria-hidden="true">' + (ok ? "✓" : "🔒") + "</span><div><b>" + t[k].nm + "</b><code>" + t[k].d.replace(/</g, "&lt;") + "</code>" + (ok ? "" : "<em>" + plLockMsg(L, k) + "</em>") + "</div></li>"; }).join("");
}
function plRenderMsgs() {
  const r = PLS.res[PLS.lang] || { msgs:[], out:"", error:null }, ul = $("#plMsgs"), pre = $("#plOut");
  ul.innerHTML = (r.msgs || []).map(m => "<li" + (m.soft ? ' class="soft"' : "") + ">" + String(m.s).replace(/</g, "&lt;") + "</li>").join("");
  const txt = (r.error ? "Error: " + r.error + (r.out ? "\n" : "") : "") + (r.out || ""); pre.hidden = !txt; pre.textContent = txt; pre.classList.toggle("err", !!r.error);
}
function plShowLang() {
  const L = PLS.lang, P = plStore(); $("#plIn").value = P.code[L]; $("#plIntro").textContent = PL_INTRO[L];
  $("#plWatch").hidden = !(L === "js" || L === "cpp"); $("#plWatch").textContent = L === "js" ? "Watch your helper" : "Launch the show";
  $("#plRun").hidden = L === "html" || L === "css"; $("#plLive").hidden = !(L === "html" || L === "css");
  plRenderTabs(); plRenderTools(); plRenderMsgs();
}
const PL_INTRO = {
  html:"HTML builds your house. Your <h1> becomes the sign above the door. As you learn more tags, the house gets more rooms and details. It updates as you type.",
  css:"CSS paints the house. Style the parts by class name: .house .roof .wall .door .window .sign .chimney .flag .step .annex .path .garden. It updates as you type.",
  js:"JavaScript writes your helper villager's routine. Use say(\"Hi!\") and, as you learn more, wait(), wave(), walk(), jump(), spin(), dance() and heart(). Press Run, then watch.",
  py:"Python grows your garden. Call plant(\"rose\", 0, 0) with a flower name, a column (0 to 7) and a row (0 to 2). Water a plant with water(col, row) to make it bloom.",
  cpp:"C++ lights the fireworks. Call launch(\"red\", 4); with a colour and a spot across the sky (0 to 9). Learn pause(ms) to time your show. Press Run, then launch."
};
function plRunNow() {
  const L = PLS.lang, P = plStore(); P.code[L] = $("#plIn").value; clearTimeout(PLS.saveT);
  return plRunLang(L).then(r => { PLS.res[L] = r; if (PLS.lang === L) plRenderMsgs(); plRenderTools(); $("#plLive").textContent = "Updated"; plPreviewKick(L); });
}
function plSaveSoon() { const P = plStore(); P.code[PLS.lang] = $("#plIn").value; clearTimeout(PLS.saveT); PLS.saveT = setTimeout(persist, 400); $("#plLive").textContent = "Typing…"; }

function openPlot() {
  plStore(); PLS.lang = PLS.lang || "html"; plShowLang();
  /* the first time through, make the house from the starter code so there is something to look at */
  const P = plStore(); if (!P.house || !P.house.st || !P.htmlM) { plRunLang("html").then(() => plRunLang("css")).then(() => { PLS.hrev = -1; }); }
  PLS.n = { x:150, y:158, def:PL_HELPER() }; plH.prev = true; plH.i = -1; plH.hx = undefined; plH.hearts = [];
  openSheet("#plot"); PLS.last = performance.now(); cancelAnimationFrame(PLS.raf); PLS.raf = requestAnimationFrame(plPreviewLoop);
}
function plCloseSheet(visit) {
  cancelAnimationFrame(PLS.raf); PLS.raf = 0; plH.prev = false; plH.i = -1; plH.hx = undefined; plFwStop(); plFw.pending = false; clearTimeout(PLS.saveT); persist();
  closeSheets(); if (typeof V !== "undefined" && V.on) { document.body.style.overflow = "hidden"; vRepaint(); if (visit) { plH.pending = (plStore().helper.acts || []).length > 0; plFw.pending = (plStore().show.steps || []).length > 0; if (V.scene !== "plot") vSwitch("plot", VENTRY.plot[0], VENTRY.plot[1]); } }
}

/* ---------- the live preview ---------- */
function plPreviewKick(lang) {
  if (lang === "js") { plHelperPlay(PLS.n); } else if (lang === "cpp") plFwStart(plStore().show.steps, plGeoPrev);
  if (reduce) plPaint(0);
}
function plPaint(dt) {
  const cv = $("#plView"), c = cv.getContext("2d"), P = plStore(), mv = !reduce;
  c.imageSmoothingEnabled = false;
  const g = c.createLinearGradient(0, 0, 0, 100); g.addColorStop(0, "#150f3a"); g.addColorStop(.7, "#3a2a66"); g.addColorStop(1, "#c07aa0"); c.fillStyle = g; c.fillRect(0, 0, 320, 100);
  c.fillStyle = "#fff"; for (let i = 0; i < 24; i++) c.fillRect((i * 97) % 320, (i * 53) % 60, 1, 1);
  c.fillStyle = "#2c6a40"; c.fillRect(0, 96, 320, 74); c.fillStyle = "#3f8a52"; c.fillRect(0, 96, 320, 2);
  if (PLS.hrev !== PLREV || !PLS.house) { PLS.house = plHouseCanvas(P.house || plBuildHouse()); PLS.garden = plGardenCanvas(P.garden, (P.house || {}).st); PLS.hrev = PLREV; }
  if (mv) { plFwUpdate(dt); plFwDraw(c); } else plFwStill(c, P.show.steps, plGeoPrev);
  const h = PLS.house; c.drawImage(h.cv, 88 - h.ax, 128 - h.ay); const gd = PLS.garden; c.drawImage(gd.cv, 236 - gd.ax, 160 - gd.ay);
  if (mv) plHelperUpdate(PLS.n, dt);
  const drawSp = (def, x, fy, flip, bob, pre) => { const s = pre; c.fillStyle = "rgba(10,6,30,.35)"; c.fillRect(Math.round(x - 8), Math.round(fy) - 1, 16, 2); c.save(); if (flip) { c.translate(Math.round(x), 0); c.scale(-1, 1); c.drawImage(s.cv, -Math.round(s.w / 2), Math.round(fy - s.h + bob)); } else c.drawImage(s.cv, Math.round(x - s.w / 2), Math.round(fy - s.h + bob)); c.restore(); };
  plHelperDraw(c, PLS.n, performance.now() / 1000, mv, drawSp);
}
function plPreviewLoop(now) {
  PLS.raf = requestAnimationFrame(plPreviewLoop); const dt = Math.min(.05, (now - PLS.last) / 1000); PLS.last = now;
  if (reduce && PLS.hrev === PLREV) return; plPaint(dt);
}

/* ---------- events ---------- */
$("#plTabs").addEventListener("click", e => { const b = e.target.closest("[data-lang]"); if (!b) return; PLS.lang = b.dataset.lang; plShowLang(); const nb = $('#plTabs [data-lang="' + PLS.lang + '"]'); if (nb) nb.focus(); });
$("#plIn").addEventListener("input", () => { plSaveSoon(); if (PLS.lang === "html" || PLS.lang === "css") { clearTimeout(PLS.htmlT); PLS.htmlT = setTimeout(plRunNow, 260); } });
$("#plIn").addEventListener("keydown", e => {
  if (e.key === "Tab" && !e.shiftKey) { e.preventDefault(); const t = e.target, a = t.selectionStart, b = t.selectionEnd; t.value = t.value.slice(0, a) + "  " + t.value.slice(b); t.selectionStart = t.selectionEnd = a + 2; plSaveSoon(); }
  else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); plRunNow(); }
});
$("#plRun").addEventListener("click", plRunNow);
$("#plWatch").addEventListener("click", () => plPreviewKick(PLS.lang));
$("#plReset").addEventListener("click", () => { $("#plIn").value = PL_START[PLS.lang]; plRunNow(); });
$("#plClose").addEventListener("click", () => plCloseSheet(false));
$("#plVisit").addEventListener("click", () => plCloseSheet(true));
$("#plot").addEventListener("keydown", e => { if (e.key === "Escape" && !$("#plot").hidden) { e.preventDefault(); plCloseSheet(false); } });

/* ---------- the village scene ---------- */
function plSceneFill(o, K) {
  const { c, add, st, k, M, rnd, doors, clicks, exits, npcs, obs, smoke, lampsAt } = K, P = plStore(), H = P.house && P.house.st ? P.house : plBuildHouse();
  o.name = "The Builders' Plot"; o.spawn = [160, 186]; o.cloudY = [6, 40]; o.plot = true;
  VSKYY(st, c, 96, 262); vMount(c, st, 94, 36, vmix("#1a1240", "#6f8ec0", k), 8); vTreeLine(c, st, 100, rnd, vmix("#120d33", "#3f7a52", k), vmix("#1c1448", "#5ea36a", k), 20, 34, 11);
  vGroundPaint(c, (x, y) => (y < 96 ? null : x >= 80 && x <= 104 && y >= 134 ? "c" : "g"), M);
  const h = plHouseCanvas(H), hx = 92, hy = 134;
  add({ cv:h.cv, ax:h.ax, ay:h.ay, obs:[hx - h.ww / 2 - 2, hy - 8, hx + h.ww / 2 + 2, hy] }, hx, hy); smoke.push({ x:hx + h.chim.dx, y:hy + h.chim.dy });
  const gd = plGardenCanvas(P.garden, H.st); add({ cv:gd.cv, ax:gd.ax, ay:gd.ay, obs:[196, 140, 302, 166] }, 250, 168);
  /* the studio desk, where the code is written */
  add(Object.assign(vBake(40, 34, 20, 32, cc => { vR(cc, 3, 10, 34, 5, "#8a5a36"); vR(cc, 3, 10, 34, 1, "#b27a4a"); vR(cc, 5, 15, 3, 16, "#5a3a22"); vR(cc, 32, 15, 3, 16, "#5a3a22"); vR(cc, 9, 5, 14, 6, "#cfe8f4"); vR(cc, 11, 7, 10, 1, "#3b8fd8"); vR(cc, 11, 9, 7, 1, "#3b8fd8"); vR(cc, 27, 2, 2, 9, "#3a3350"); vR(cc, 24, 0, 8, 3, "#ffd23f"); vR(cc, 26, 3, 4, 1, "#fff2b0"); }), { halo:{ x:36, y:150 }, obs:[18, 164, 54, 171] }), 36, 172);
  doors.push({ id:"plot", x:36, y:172 }); clicks.push({ id:"plot", r:[16, 136, 56, 172] });
  lampsAt([[124, 180], [196, 186]]);
  [[12, 130, 12], [308, 130, 11], [14, 190, 11]].forEach(([x, y, r]) => add(vPropTree(st, k, x, y, r), x, y));
  [[150, 176], [270, 186], [60, 150]].forEach(([x, y]) => add(vPropBush(k, x, y), x, y));
  add(vPropPost(150, 196, "BACK"), 150, 196);
  exits.push({ r:[90, 196, 230, 200], to:"sq", enter:[40, 366] });
  npcs.push({ id:"plhelper", plot:true, def:PL_HELPER(), x:224, y:186, name:"Pip the Helper", role:"Your helper villager" });
  o.flowers = [[40, 120], [60, 196], [180, 150], [300, 190], [120, 150]];
}
function plTalk(n) {
  const acts = plStore().helper.acts || [];
  if (!acts.length) { vSay(n, "Hello, builder! Go to the desk and write some JavaScript. I will do whatever your code says. Try say(\"Hello!\")."); return; }
  if (reduce) { vSay(n, "My routine: " + plHelperSummary(acts) + "."); return; }
  vBub.hidden = true; V.bubNpc = null; plHelperPlay(n);
}
function plTick(dt) {
  if (V.scene !== "plot" || V.trans) return;
  if (!reduce) {
    if (plH.pending) { plH.pending = false; const n = V.sc.npcs.find(q => q.plot); if (n && (plStore().helper.acts || []).length) { plH.prev = false; plH.hx = undefined; plHelperPlay(n); } }
    if (plFw.pending) { plFw.pending = false; if ((plStore().show.steps || []).length) plFwStart(plStore().show.steps, plGeoVil); }
    plFwUpdate(dt);
  }
}
function plSkyStill(c) { const st = plStore().show.steps; if (st && st.length) plFwStill(c, st, plGeoVil); }
function plVillageStatus() { const P = plStore(); return "House, garden, helper and fireworks"; }
