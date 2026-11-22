/* The village: the walkable home screen between the title and the level maps.
   A town square with a road to each language's district (HTML south, C++ west, JavaScript east, Python north). */

"use strict";

const vil = $("#village"), vcv = $("#vcv"), vctx = vcv.getContext("2d"), vStage = $("#vStage"), vBub = $("#vBub"), vPrompt = $("#vPrompt");
const pyDone = () => !!trackData("py").stars[10];
const V = { on:false, scene:"sq", sc:null, x:280, y:262, cam:{ x:0, y:0 }, forgeOpen:false, dir:1, face:"down", wp:0, path:[], after:null, keys:{}, raf:0, last:0, s:3, near:null, nearNpc:null, bubNpc:null, bubUntil:0, talk:{}, st:0, trans:null, fast:false, cache:{}, hint:null, moving:false, open:{}, done:{} };
const VBOSS = { guild:"the Markup Titan, the boss of HTML level 10", css:"the Markup Titan, the boss of HTML level 10", cpp:"Cascade the Chameleon, the boss of CSS level 10", js:"the Pointer Wraith, the boss of C++ level 10", py:"the Callback Hydra, the boss of JavaScript level 10" };
const VNAME = { forge:"The Forge", lib:"Spellbook Library", shop:"Unlockables Shop", html:"HTML Gate", css:"CSS Gate", cpp:"C++ Gate", js:"JavaScript Gate", py:"Python Gate", tower:"Challenge Tower", guild:"Debuggers' Guild", plot:"Builders' Plot", skills:"Skill Tree", manor:"The Mansion", hall:"The Hall" };
const VICON = { forge:"🔨", lib:"📖", shop:"🛍", html:"&lt;/&gt;", css:"🎨", cpp:"{ }", js:"JS", py:"Py", tower:"🏰", guild:"🐞", plot:"🏡", skills:"🌳", manor:"🕯", hall:"🚪" };
const VORDER = ["lib", "skills", "forge", "shop", "html", "css", "cpp", "js", "py", "guild", "plot", "tower", "manor"];
const VWHERE = { forge:"sq", lib:"sq", shop:"sq", tower:"sq", html:"html", css:"css", cpp:"cpp", js:"js", py:"py", guild:"guild", plot:"plot", skills:"sq", manor:"manor", hall:"manor" };
const VDOOR = { lib:[110, 113], forge:[232, 113], shop:[350, 113], tower:[540, 113], guild:[160, 113], plot:[36, 172], skills:[320, 226], manor:[160, 190], hall:[160, 116], html:[160, 113], css:[160, 113], cpp:[238, 114], js:[160, 113], py:[160, 113] };
const VENTRY = { sq:[320, 262], guild:[160, 186], plot:[160, 186], manor:[150, 188], html:[160, 186], css:[160, 186], cpp:[130, 188], js:[160, 186], py:[160, 186] };
const VMOOD = ["A storm still hangs over Pythona's tower. Take the south road to the HTML quarter.", "One guardian down, and the storm is already thinning. A sunlit road to the CSS forest has opened.", "Two guardians down. Beyond the sunny forest, the Dark Forest waits.", "Three guardians down. The sky is turning.", "Only Pythona is left. Her tower waits beyond the roof.", "The curse is lifted. Morning has come to Codetopia."];

const vOpenMap = () => ({ html:trackOpen("html"), css:trackOpen("css"), cpp:trackOpen("cpp"), js:trackOpen("js"), py:trackOpen("py"), guild:guildOpen() });
/* the village mood line: the story order only makes sense when every language is taken in turn */
const vMoodLine = () => V.scene === "manor" ? "The rain has not stopped since the scream. Speak to everyone." : isCustom() && V.cnt < 5 ? (V.cnt ? V.cnt + " of 5 guardians down, and the sky is brightening. Pick a gate and keep learning." : "A storm still hangs over Pythona's tower. Pick a gate and begin your lessons.") : VMOOD[V.cnt];
const vDoneMap = () => ({ html:htmlDone(), css:cssDone(), cpp:cppDone(), js:jsDone(), py:pyDone() });
const vDoneCount = d => (d.html ? 1 : 0) + (d.css ? 1 : 0) + (d.cpp ? 1 : 0) + (d.js ? 1 : 0) + (d.py ? 1 : 0);
const vStageNo = d => [0, 1, 1, 2, 3, 4][vDoneCount(d)];   /* the sky stage: the full sunrise only comes once Pythona has fallen */

function vStatus(id) {
  if (id === "lib") { const due = typeof dueCount === "function" ? dueCount() : 0; return due ? due + " due for review" : "Your learned pages"; }
  if (id === "forge") return V.forgeOpen ? "Build your own work" : "Cold. Clear " + forgeNeed() + " level 3";
  if (id === "shop") return D.coins + " coin" + (D.coins === 1 ? "" : "s");
  if (id === "tower") return D.tower && D.tower.best ? "Best: floor " + D.tower.best : "Endless floors";
  if (id === "plot") return "Code builds your village";
  if (id === "manor") return "Murder at SQLeviathan Mansion";
  if (id === "skills") { const t = skTotals(); return t.mas + "/" + t.n + " mastered"; }
  if (id === "guild") return V.open.guild ? guildSolved() + "/" + GUILD_CASES.length + " cases solved" : "Locked. Clear " + (isCustom() ? "a language" : "HTML");
  const td = trackData(id);
  if (V.done[id]) return "Cleared ★";
  if (!V.open[id]) return "Boss test open";
  return Object.keys(td.stars).length || td.unlocked > 1 ? "Level " + td.unlocked : "10 levels";
}

function vLine(n) {
  if (n.mys) return mysLine(n);
  if (n.plot) return (plStore().helper.acts || []).length ? "Hi, builder! Talk to me and I will act out my routine. (Press E or tap.)" : "Hello! Write some JavaScript at the desk and I will act it out.";
  if (n.giver) { const st = missionState(n.giver), g = st.g; return st.s === "locked" ? g.locked : st.s === "done" ? g.done : st.s === "wait" ? "I will have another job when you have learned a bit more " + TRACKS[g.track].lang + ". Keep going on the levels!" : g.hello + " (Press E or tap the button.)"; }
  if (n.guild) { const k = (V.talk.guild = (V.talk.guild || 0) + 1), L = ["Bzzzt! Welcome to the Debuggers' Guild. I am D-Bug, and no bug escapes me. Not even the ones in my own shell.", "Step through the door to see the case board. Every case is a broken program with exactly one bug. Bzzzt.", "A good debugger reads before typing. Find the line that is wrong, name the kind of bug, then fix it.", "Syntax bugs break the rules. Logic bugs follow the rules but do the wrong thing. Both leave clues. I should know. I am one.", "Do not squash the bugs, hero. Study them. Bzzzt."]; return L[(k - 1) % L.length]; }
  if (n.id === "lib") {
    const ids = CON_IDS, mastered = ids.filter(id => seen(id) && D.mast[id].box >= 5).length, k = (V.talk.lib = (V.talk.lib || 0) + 1);
    return k % 3 === 2 ? LIBRARIAN.extras[(k >> 1) % LIBRARIAN.extras.length] : LIBRARIAN.line({ due:dueCount(), mastered, total:ids.length });
  }
  if (n.id === "forge") {
    const k = (V.talk.forge = (V.talk.forge || 0) + 1);
    if (!V.forgeOpen) return "The fire is out for now. Clear level 3 in " + forgeNeed() + " and I will light it. Then you can write your own code here in any language you have unlocked.";
    const L = ["The fire is lit! Walk through the Forge door and build anything you like. Your projects are saved for you.", "HTML shows a live page as you type. JavaScript, Python and C++ run when you press Run.", "Clear more levels and new tabs open: JavaScript, then Python, then C++. Each language gets its own bench.", "Stuck? Start from a starter, change one thing, run it, and see what happens. That is how every smith learns.", "Make as many projects as you like. I keep them safe on the shelf until you come back."];
    return L[(k - 1) % L.length];
  }
  if (n.id === "shop") {
    const k = (V.talk.shop = (V.talk.shop || 0) + 1), L = ["Welcome! New looks for brave coders. Step up to the counter.", "Coins come from winning fights. Skins are only for show, never for power.", "Some outfits cannot be bought at all. They have to be earned.", "Take your time, hero. The shelves are not going anywhere."];
    return L[(k - 1) % L.length];
  }
  const m = MENTORS[n.track], k = (V.talk[n.id] = (V.talk[n.id] || 0) + 1);
  return k === 1 && V.done[n.track] ? "You cleared my whole path. Well done. Come back any time to practise." : m.tips[(k - 1) % m.tips.length];
}

/* ---------- scenes, collision and paths ---------- */
function vScene(id) {
  const key = id + (id === "plot" ? "#" + PLREV : id === "sq" ? "#" + skLit() : "") + ":" + V.st + ":" + (V.forgeOpen ? 1 : 0) + ":" + (V.open.guild ? 1 : 0) + ":" + ["html", "css", "cpp", "js", "py"].map(t => (V.open[t] ? 1 : 0) + "" + (V.done[t] ? 1 : 0)).join("");
  if ((id === "plot" || id === "sq") && !V.cache[key]) Object.keys(V.cache).forEach(q => { if (q.startsWith(id + "#")) delete V.cache[q]; });
  return V.cache[key] || (V.cache[key] = vBuildScene(id, { st:V.st }));
}
const vBlocked = (x, y) => x < V.sc.walk.x0 || x > V.sc.walk.x1 || y < V.sc.walk.y0 || y > V.sc.walk.y1 || V.sc.obs.some(o => x > o[0] - 5 && x < o[2] + 5 && y > o[1] - 3 && y < o[3] + 3);
function vClear(ax, ay, bx, by) { const n = Math.ceil(Math.hypot(bx - ax, by - ay) / 3); for (let i = 1; i <= n; i++) if (vBlocked(ax + (bx - ax) * i / n, ay + (by - ay) * i / n)) return false; return true; }
function vPlan(tx, ty) {
  const W = V.sc.walk; tx = Math.max(W.x0, Math.min(W.x1, tx)); ty = Math.max(W.y0, Math.min(W.y1, ty));
  if (vBlocked(tx, ty)) { let best = null; for (let r = 4; r < 60 && !best; r += 4) for (let a = 0; a < 16; a++) { const x = tx + Math.cos(a * .3927) * r, y = ty + Math.sin(a * .3927) * r; if (!vBlocked(x, y)) { best = [x, y]; break; } } if (best) [tx, ty] = best; }
  if (vClear(V.x, V.y, tx, ty)) return [[tx, ty]];
  let bestP = null, bestL = 1e9;
  const pts = []; V.sc.obs.forEach(o => { [[o[0] - 8, o[1] - 5], [o[2] + 8, o[1] - 5], [o[0] - 8, o[3] + 5], [o[2] + 8, o[3] + 5]].forEach(p => { if (!vBlocked(p[0], p[1])) pts.push(p); }); });
  pts.forEach(p => { if (vClear(V.x, V.y, p[0], p[1]) && vClear(p[0], p[1], tx, ty)) { const L = Math.hypot(p[0] - V.x, p[1] - V.y) + Math.hypot(tx - p[0], ty - p[1]); if (L < bestL) { bestL = L; bestP = [p]; } } });
  if (!bestP) pts.forEach(p => pts.forEach(q => { if (vClear(V.x, V.y, p[0], p[1]) && vClear(p[0], p[1], q[0], q[1]) && vClear(q[0], q[1], tx, ty)) { const L = Math.hypot(p[0] - V.x, p[1] - V.y) + Math.hypot(q[0] - p[0], q[1] - p[1]) + Math.hypot(tx - q[0], ty - q[1]); if (L < bestL) { bestL = L; bestP = [p, q]; } } }));
  return (bestP || []).concat([[tx, ty]]);
}
function vGoto(x, y, after) { V.path = vPlan(x, y); V.after = after || null; }

function vCamTarget() { const sc = V.sc; return { x:Math.max(0, Math.min(sc.w - VSW, V.x - VSW / 2)), y:Math.max(0, Math.min(sc.h - VSH, V.y - VSH * .62)) }; }
function vCamSnap() { const t = vCamTarget(); V.cam.x = t.x; V.cam.y = t.y; }
function vSize() {
  const W = Math.max(280, vStage.clientWidth || innerWidth), top = $(".vtop").offsetHeight + $("#vNav").offsetHeight + $(".vhelp").offsetHeight + 30;
  let s = Math.min(W / VSW, (innerHeight - top) / VSH); s = Math.max(1, Math.floor(s * 20) / 20);
  V.s = s; vcv.width = VSW; vcv.height = VSH; vcv.style.width = VSW * s + "px"; vcv.style.height = VSH * s + "px"; vctx.imageSmoothingEnabled = false;
}

function vRepaint() {
  V.open = vOpenMap(); V.done = vDoneMap(); V.st = vStageNo(V.done); V.cnt = vDoneCount(V.done); V.forgeOpen = forgeOpen();
  if (V.scene !== "sq" && V.open[V.scene] === false) { V.scene = "sq"; V.x = VENTRY.sq[0]; V.y = VENTRY.sq[1]; V.path = []; }
  V.sc = vScene(V.scene); $("#vAdmin").textContent = D.admin ? "Admin: on" : "Admin"; $("#vAdmin").setAttribute("aria-pressed", D.admin ? "true" : "false");
  $("#vMood").textContent = V.sc.name + ". " + vMoodLine(); if (typeof missionDoneCount === "function") $("#vMis").textContent = "Missions " + missionDoneCount() + "/" + MISSIONS.length; $("#vCoins").textContent = D.coins + (D.coins === 1 ? " coin" : " coins");
  $("#vNav").innerHTML = VORDER.filter(id => id !== "manor" || mysteryGone()).map(id => `<button class="vn ${V.open[id] === false ? "locked" : ""} ${V.done[id] ? "done" : ""}" type="button" data-p="${id}" aria-label="${VNAME[id]}: ${vStatus(id)}"><span class="vi" aria-hidden="true">${VICON[id]}</span><b>${VNAME[id]}</b><small>${vStatus(id)}</small></button>`).join("");
}

function openVillage() {
  if (typeof S !== "undefined" && S.place) S.place = null; if (!D.admin && !trackOpen(D.track)) setTrack(startTrack());
  closeSheets(); intro.hidden = true; if (typeof stopIntro === "function") stopIntro();
  vil.hidden = false; V.on = true; $(".app").inert = true; document.body.style.overflow = "hidden";
  vRepaint(); vSize(); vCamSnap(); V.path = []; V.after = null; V.keys = {}; V.trans = null; vBub.hidden = true; V.bubNpc = null; V.hint = null;
  if (vBlocked(V.x, V.y)) { const e = VENTRY[V.scene]; V.x = e[0]; V.y = e[1]; }
  cancelAnimationFrame(V.raf); V.last = performance.now(); V.raf = requestAnimationFrame(vLoop);
  if (V.st === 4 && !D.vdawn) { D.vdawn = true; persist(); setTimeout(() => toast("The curse is lifted. Morning has come to Codetopia."), 500); }
  vil.focus({ preventScroll:true });
}
function closeVillage() { V.on = false; vil.hidden = true; cancelAnimationFrame(V.raf); $(".app").inert = false; V.keys = {}; }
function villageBlocked() { return $$(".sheet").some(s => !s.hidden) || !$("#tower").hidden || !$("#cine").hidden || !$("#story").hidden || !$("#overlay").hidden; }

/* changing scene fades out, swaps, and fades in */
function vSwitch(to, x, y, then) { if (V.trans) return; V.trans = { t:0, to, x, y, then, done:false }; V.path = []; V.after = null; V.keys = {}; vBub.hidden = true; V.bubNpc = null; V.hint = null; }

function vEnter(id) {
  if (id === "lib") { openBook("village"); return; }
  if (id === "shop") { window.unlTab = "shop"; openUnl(); return; }
  if (id === "tower") { openTower(); return; }
  if (id === "guild") { openGuild(); return; }
  if (id === "plot") { openPlot(); return; }
  if (id === "skills") { openSkills(); return; }
  if (id === "hall") { mansionDoor(); return; }
  if (id === "forge") { if (forgeOpen()) openSbx(); else vSay({ id:"forge", name:"The Forge", role:"" }, "The fire is out. Clear level 3 in " + forgeNeed() + " and the Forge will light up. Then you can write your own code here and watch it come alive.", { x:V.x, y:V.y }); return; }
  if (!V.open[id]) return;
  setTrack(id); closeVillage(); openMap();
}
function vSay(n, text, anchor) {
  V.bubNpc = anchor ? { ...n, x:anchor.x, y:anchor.y, temp:true } : n; V.bubUntil = performance.now() + 6500;
  vBub.querySelector("b").textContent = n.name; vBub.querySelector("span").textContent = text; vBub.hidden = false;
}
function vTalk(n) { if (n.plot) { plTalk(n); return; } if (n.coach) { coachTalk(n); return; } if (n.mys === "duke") { V.dir = n.x > V.x ? 1 : -1; mcoAsk("home"); return; } vSay(n, vLine(n)); }
function vGoNpc(n) { vGoto(n.x + (V.x < n.x ? -22 : 22), n.y + 2, () => { V.dir = n.x > V.x ? 1 : -1; V.face = "side"; vTalk(n); }); }

/* the destination buttons: fast travel to the right district, then a short walk to the door */
function vGoPlace(id) {
  const to = VWHERE[id], d = VDOOR[id], go = () => vGoto(d[0], d[1], () => vEnter(id));
  if (["html", "css", "cpp", "js", "py", "guild"].includes(id) && !V.open[id]) {
    const ex = vScene("sq").exits.find(e => e.to === id), h = ex.hint, walk = () => vGoto(h[0] + (h[0] < 20 ? 22 : h[0] > 300 ? -22 : 0), h[1] + (h[1] < 120 ? 14 : 0), id === "guild" ? null : () => vPlaceAsk(id));
    if (V.scene === "sq") walk(); else vSwitch("sq", VENTRY.sq[0], VENTRY.sq[1], walk);
    return;
  }
  if (V.scene === to) go(); else vSwitch(to, VENTRY[to][0], VENTRY[to][1], go);
}

function vInteract() {
  const nn = V.nearNpc, nd = V.near;
  if (!nn && !nd && V.hint && V.hint.lock !== "guild" && Math.hypot(V.hint.hint[0] - V.x, V.hint.hint[1] - V.y) < 50) { vPlaceAsk(V.hint.lock); return; }
  if (!nn && !nd) return;
  if (nn && nn.giver && (!nd || Math.hypot(nn.x - V.x, nn.y - V.y) < Math.hypot(nd.x - V.x, nd.y - V.y))) { V.dir = nn.x > V.x ? 1 : -1; V.face = "side"; vGiverTalk(nn); return; }
  if (nn && nn.still) { vEnter(nn.id); return; }
  if (nn && (!nd || Math.hypot(nn.x - V.x, nn.y - V.y) < Math.hypot(nd.x - V.x, nd.y - V.y))) { V.dir = nn.x > V.x ? 1 : -1; V.face = "side"; vTalk(nn); } else vEnter(nd.id);
}

function vLoop(now) {
  V.raf = requestAnimationFrame(vLoop); const dt = Math.min(.05, (now - V.last) / 1000); V.last = now;
  const blocked = villageBlocked();
  if (!blocked) { vUpdate(dt, now); vNpcUpdate(dt); if (typeof plTick === "function") plTick(dt); SND.walk(V.x, V.y, V.moving && !V.trans, V.scene); } else vPrompt.hidden = true;
  vDraw(now / 1000);
}

function vStep(dx, dy) { if (!vBlocked(V.x + dx, V.y)) V.x += dx; if (!vBlocked(V.x, V.y + dy)) V.y += dy; }
function vUpdate(dt, now) {
  if (V.trans) {
    const T = V.trans; T.t += dt;
    if (!T.done && T.t >= .2) { T.done = true; V.scene = T.to; V.sc = vScene(T.to); V.x = T.x; V.y = T.y; V.path = []; vCamSnap(); $("#vMood").textContent = V.sc.name + ". " + vMoodLine(); if (T.then) { const f = T.then; T.then = null; f(); } }
    if (T.t >= .4) V.trans = null; V.moving = false; vPrompt.hidden = true; return;
  }
  const k = V.keys, kx = (k.ArrowRight || k.d || k.D ? 1 : 0) - (k.ArrowLeft || k.a || k.A ? 1 : 0), ky = (k.ArrowDown || k.s || k.S ? 1 : 0) - (k.ArrowUp || k.w || k.W ? 1 : 0), fm = V.fast ? 60 : 1;
  V.moving = false; const wx0 = V.x, wy0 = V.y;
  if (kx || ky) { V.path = []; V.after = null; const sp = (k.Shift ? 120 : 76) * dt / Math.hypot(kx, ky) * fm; vStep(kx * sp, ky * sp); if (kx) { V.dir = kx; V.face = "side"; } else V.face = ky > 0 ? "down" : "up"; V.moving = true; }
  else if (V.path.length) {
    const p = V.path[0], d = Math.hypot(p[0] - V.x, p[1] - V.y), step = 110 * dt * fm;
    if (d <= step) { V.x = p[0]; V.y = p[1]; V.path.shift(); if (!V.path.length) { const f = V.after; V.after = null; if (f) f(); } }
    else { const dx = (p[0] - V.x) / d * step, dy = (p[1] - V.y) / d * step, ox = V.x, oy = V.y; vStep(dx, dy); if (Math.abs(dx) > .01) V.dir = dx > 0 ? 1 : -1; V.face = Math.abs(dy) > Math.abs(dx) * 1.3 ? (dy > 0 ? "down" : "up") : "side"; V.moving = true; if (Math.hypot(V.x - ox, V.y - oy) < step * .2) { V.path = []; V.after = null; } }
  }
  const W = V.sc.walk; V.x = Math.max(W.x0, Math.min(W.x1, V.x)); V.y = Math.max(W.y0, Math.min(W.y1, V.y));
  if (V.moving) V.wp += Math.min(8, Math.hypot(V.x - wx0, V.y - wy0));
  const ct = vCamTarget(); V.cam.x += (ct.x - V.cam.x) * Math.min(1, dt * 7); V.cam.y += (ct.y - V.cam.y) * Math.min(1, dt * 7);
  const sc = V.sc;
  if (V.trans) return;
  for (const e of sc.exits) { if (e.lock) continue; if (V.x >= e.r[0] - 2 && V.x <= e.r[2] + 2 && V.y >= e.r[1] - 2 && V.y <= e.r[3] + 2) { vSwitch(e.to, e.enter[0], e.enter[1]); return; } }
  /* closed roads speak for their mentor */
  let hint = null; for (const e of sc.exits) if (e.lock && Math.hypot(e.hint[0] - V.x, e.hint[1] - V.y) < 36) hint = e;
  if (hint && hint !== V.hint) { V.hint = hint; const m = hint.lock === "guild" ? { name:"D-Bug" } : MENTORS[hint.lock]; vSay({ id:hint.lock, name:m.name, track:hint.lock }, hint.lock !== "guild" ? "This road is closed. Already know it? Face the boss of level 10 once (press E or tap) and the whole language opens." : isCustom() ? "This road is closed for now. Finish the languages you chose and it will open." : `This road is closed. Defeat ${VBOSS[hint.lock]}, then come and see me.`, { x:V.x, y:V.y }); }
  if (!hint && V.hint && Math.hypot(V.hint.hint[0] - V.x, V.hint.hint[1] - V.y) > 60) V.hint = null;
  let near = null, nn = null;
  sc.doors.forEach(d => { if (Math.abs(d.x - V.x) < (d.id === "shop" ? 34 : 16) && Math.abs(d.y - V.y) < 12) near = d; });
  sc.npcs.forEach(n => { if (n.coach && !coachReady()) return; const dd = Math.hypot(n.x - V.x, n.y - V.y); if (dd < 30 && (!nn || dd < Math.hypot(nn.x - V.x, nn.y - V.y))) nn = n; });
  if (nn && !near && nn !== V.nearNpc && !(V.bubNpc === nn && now < V.bubUntil)) vSay(nn, nn.coach ? "Psst. Apprentice. A word? (Press E or tap.)" : vLine(nn));
  V.near = near; V.nearNpc = nn;
  if (V.bubNpc && (now > V.bubUntil || (!V.bubNpc.temp && Math.hypot(V.bubNpc.x - V.x, V.bubNpc.y - V.y) > 70) || (V.bubNpc.temp && Math.hypot(V.bubNpc.x - V.x, V.bubNpc.y - V.y) > 70))) { vBub.hidden = true; V.bubNpc = null; }
  if (near && !V.path.length) { vPrompt.textContent = (V.open[near.id] === false ? "Locked · " : "Enter · ") + VNAME[near.id]; vPrompt.hidden = false; }
  else if (nn && nn.giver && !V.path.length) { const ms = missionState(nn.giver).s; vPrompt.textContent = (ms === "avail" ? "Help · " : "Talk · ") + nn.name; vPrompt.hidden = false; }
  else if (V.hint && V.hint.lock !== "guild" && !V.path.length && Math.hypot(V.hint.hint[0] - V.x, V.hint.hint[1] - V.y) < 50) { vPrompt.textContent = "Boss test · " + VNAME[V.hint.lock]; vPrompt.hidden = false; }
  else vPrompt.hidden = true;
}

function vPlaceDom(el, wx, wy) {
  const s = V.s, w = vStage.clientWidth, half = (el.offsetWidth || 160) / 2, off = (w - VSW * s) / 2;
  el.style.left = Math.max(half + 4, Math.min(w - half - 4, (wx - Math.round(V.cam.x)) * s + off)) + "px"; el.style.top = Math.max(4, (wy - Math.round(V.cam.y)) * s) + "px";
}

function vDraw(t) {
  const c = vctx, sc = V.sc, st = sc.st, mv = reduce ? 0 : 1;   /* the scene's own sky: the sunlit forest is always morning, so no rain or bats fall on it */
  const cx0 = Math.round(V.cam.x), cy0 = Math.round(V.cam.y), VW2 = sc.w;
  c.clearRect(0, 0, VSW, VSH); c.save(); c.translate(-cx0, -cy0); c.drawImage(sc.bg, 0, 0);
  const cc = vmix(["#1b1540", "#3a2a66", "#c07aa0", "#ffc0a0", "#ffffff"][st], ["#2a1f58", "#5a4090", "#e098b0", "#ffe0c0", "#f4f8ff"][st], .5), sp0 = sc.fast ? 3 : 1;
  if (sc.id !== "js") for (let i = 0; i < 5; i++) { const x = ((i * 77 - t * (2 + i * .7) * sp0 * mv + 5000 * 77) % (VW2 + 120)) - 40, y = sc.cloudY[0] + (i * 29) % Math.max(10, sc.cloudY[1] - sc.cloudY[0]), wd = 24 + (i * 13) % 18;
    c.fillStyle = vmix(cc, "#000000", st < 2 ? .1 : 0); for (let j = 0; j < 5; j++) { const hw = Math.round(wd / 2 * Math.sqrt(1 - ((j - 2) / 2.8) ** 2)); c.fillRect(Math.round(x - hw), y + j, hw * 2, 1); }
    c.fillStyle = vmix(cc, "#ffffff", .22); c.fillRect(Math.round(x - wd / 4), y, Math.round(wd / 2), 1); }
  if (mv) vAmbSky(c, t, sc, st); else if (sc.plot) plSkyStill(c);
  if (st === 0 && mv && Math.sin(t * .9) > .985) { c.fillStyle = "rgba(255,255,255,.2)"; c.fillRect(0, 0, VW2, 100); c.fillStyle = "#fff"; for (let j = 0; j < 44; j += 4) c.fillRect(Math.round(VW2 * .78) + ((j / 4) % 2) * 3, j, 2, 4); }
  const nf = st + 2; (sc.flowers || []).forEach(([x, y], i) => { for (let j = 0; j < nf; j++) { const fx = x + ((j * 7 + i * 3) % 17) - 8, fy = y + ((j * 5 + i) % 7) - 3; c.fillStyle = "#3f8a3a"; c.fillRect(fx, fy, 1, 2); c.fillStyle = ["#ff7ab8", "#ffd23f", "#ffffff", "#c58bff"][(i + j) % 4]; c.fillRect(fx + (mv ? Math.round(Math.sin(t * 1.5 + i * 2 + j) * .55) : 0), fy - 1, 1, 1); } });

  const hid = D.skin && SKIN_ART[D.skin] ? D.skin : "hero", walking = V.moving && mv, hb = walking ? 0 : (mv && Math.sin(t * 2) > .5 ? -1 : 0);
  const ents = sc.props.map(p => ({ y:p.y, p })).concat(sc.npcs.filter(n => !n.still).map((n, i) => ({ y:n.y, n, i })), [{ y:V.y, hero:true }], mv ? vAmbEnts(sc, t) : []).sort((a, b) => a.y - b.y);
  const drawSp = (def, x, fy, flip, bob, pre) => { const s = pre || vSprite(def); c.fillStyle = "rgba(10,6,30,.35)"; c.fillRect(Math.round(x - 8), Math.round(fy) - 1, 16, 2); c.fillRect(Math.round(x - 6), Math.round(fy) - 2, 12, 1);
    c.save(); if (flip) { c.translate(Math.round(x), 0); c.scale(-1, 1); c.drawImage(s.cv, -Math.round(s.w / 2), Math.round(fy - s.h + bob)); } else c.drawImage(s.cv, Math.round(x - s.w / 2), Math.round(fy - s.h + bob)); c.restore(); };
  for (const e of ents) {
    if (e.p) c.drawImage(e.p.cv, Math.round(e.p.x - e.p.ax), Math.round(e.p.y - e.p.ay));
    else if (e.amb) e.amb(c);
    else if (e.n) { vNpcDraw(c, e.n, e.i, t, mv, drawSp);
      if (e.n.giver && missionState(e.n.giver).s === "avail") { const by = Math.round(e.n.y - 44 + (mv ? Math.sin(t * 4) * 2 : 0)), bx = Math.round(e.n.x); c.fillStyle = "#2a1a1a"; c.fillRect(bx - 3, by - 11, 6, 13); c.fillRect(bx - 3, by + 4, 6, 5); c.fillStyle = "#ffd23f"; c.fillRect(bx - 2, by - 10, 4, 10); c.fillRect(bx - 2, by + 5, 4, 3); c.fillStyle = "#fff3a0"; c.fillRect(bx - 2, by - 10, 1, 8); } }
    else drawSp(null, V.x, V.y, V.face === "side" && V.dir < 0, hb, WALK.sprite(hid, V.face, walking ? Math.floor(V.wp / 6) % 4 : 4));
  }
  const fl = Math.floor(t * 3); sc.flags.forEach(f => vFlag(c, f.x, f.y, f.c, fl));
  if (mv) {
    vAmbSmoke(c, t, sc, st); if (sc.skTree) vSkillAmb(c, t, sc);
    if (sc.spray) { c.fillStyle = "#bfeaff"; for (let i = 0; i < 12; i++) { const ph = (t * 1.3 + i / 12) % 1, dir = (i % 3) - 1; c.fillRect(Math.round(sc.spray.x + dir * ph * 11), Math.round(sc.spray.y + 12 - Math.sin(ph * Math.PI) * 14 + ph * ph * 6), 1, 1); } }
  }
  (sc.fires || []).forEach(f => { const fl2 = mv ? Math.sin(t * 11) * .03 + Math.sin(t * 17) * .02 : 0; c.fillStyle = "#ff8a2a"; c.globalAlpha = .13 + fl2; [[26, 16], [16, 10], [9, 6]].forEach(([rx, ry]) => { for (let j = -ry; j <= ry; j++) { const hw = Math.round(rx * Math.sqrt(1 - (j / ry) ** 2)); c.fillRect(f.x - hw, f.y + j, hw * 2, 1); } }); c.globalAlpha = 1;
    if (mv) for (let i = 0; i < 7; i++) { const ph = (t * .9 + i * .31) % 1; c.fillStyle = i % 2 ? "#ffd23f" : "#ff9a3a"; c.fillRect(Math.round(f.x - 4 + Math.sin(i * 5 + t * 3) * 6 + i), Math.round(f.y + 6 - ph * 26), 1, 1); } });
  if (st < 4 || sc.dark) sc.halos.forEach(l => { c.fillStyle = "#ffd86a"; c.globalAlpha = .07 + (mv ? .02 * Math.sin(t * 5 + l.x) : 0); [[24, 18], [16, 12], [9, 7]].forEach(([rx, ry]) => { for (let j = -ry; j <= ry; j++) { const hw = Math.round(rx * Math.sqrt(1 - (j / ry) ** 2)); c.fillRect(l.x - hw, l.y + j, hw * 2, 1); } }); c.globalAlpha = 1; });
  c.restore();
  if (mv) vAmbScreen(c, t, sc, st);
  if (mv) {
    if (st === 4) {
      for (let i = 0; i < 22; i++) { const ph = (t * .12 + i * .137) % 1; c.fillStyle = ["#ff7ab8", "#ffd23f", "#6fb0ff", "#b9e769"][i % 4]; c.fillRect(Math.round((i * 37 + Math.sin(t + i) * 4) % VSW), Math.round(ph * (VSH - 6)), 2, 1); } }
    else { const nfy = st === 0 && !sc.dark ? 0 : (sc.fireflies || 14); c.fillStyle = "#e9ff9a"; for (let i = 0; i < nfy; i++) { const x = (i * 83 + 30 + Math.sin(t * .5 + i) * 14) % VSW, y = 110 + ((i * 37) % 80) + Math.sin(t * .8 + i * 2) * 5; c.globalAlpha = .35 + .6 * Math.max(0, Math.sin(t * 2.2 + i * 1.9)); c.fillRect(Math.round(x), Math.round(y), 1, 1); c.globalAlpha = .18; c.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 3); } c.globalAlpha = 1; }
    if (sc.dark) { c.fillStyle = "rgba(190,210,230,.05)"; for (let i = 0; i < 5; i++) c.fillRect(Math.round(((t * 4 + i * 80) % (VSW + 120)) - 60), 130 + i * 12, 120, 5); }
  }
  if (st === 0) { c.fillStyle = "rgba(10,6,30,.14)"; c.fillRect(0, 0, VSW, VSH); }
  if (sc.dark) { c.fillStyle = "rgba(6,10,30,.22)"; c.fillRect(0, 0, VSW, VSH); }
  if (V.trans) { const T = V.trans, a = T.t < .2 ? T.t / .2 : Math.max(0, 1 - (T.t - .2) / .2); c.fillStyle = `rgba(8,5,26,${Math.min(1, a)})`; c.fillRect(0, 0, VSW, VSH); }

  if (!vBub.hidden && V.bubNpc) vPlaceDom(vBub, V.bubNpc.x, V.bubNpc.y - 46);
  if (!vPrompt.hidden) vPlaceDom(vPrompt, V.x, V.y - 48);
}

/* ---------- input ---------- */
document.addEventListener("keydown", e => {
  if (!V.on || villageBlocked() || e.ctrlKey || e.metaKey || e.altKey) return;
  const tg = e.target; if (tg && /^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName)) return;
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "a", "A", "d", "D", "w", "W", "s", "S"].includes(e.key)) { V.keys[e.key] = true; e.preventDefault(); }
  else if (e.key === "Shift") V.keys.Shift = true;
  else if ((e.key === "e" || e.key === "E") || ((e.key === "Enter" || e.key === " ") && !(tg && tg.tagName === "BUTTON"))) { vInteract(); e.preventDefault(); }
});
document.addEventListener("keyup", e => { delete V.keys[e.key]; });
addEventListener("blur", () => { V.keys = {}; });
addEventListener("resize", () => { if (V.on) vSize(); });
vcv.addEventListener("click", e => {
  if (V.trans) return;
  const r = vcv.getBoundingClientRect(), k = r.width / VSW, wx = (e.clientX - r.left) / k + Math.round(V.cam.x), wy = (e.clientY - r.top) / k + Math.round(V.cam.y), sc = V.sc;
  const n = sc.npcs.find(q => Math.abs(q.x - wx) < 15 && wy > q.y - 46 && wy < q.y + 6);
  if (n) { vGoNpc(n); return; }
  const b = sc.clicks.find(q => wx > q.r[0] && wx < q.r[2] && wy > q.r[1] && wy < q.r[3]);
  if (b) { const d = sc.doors.find(q => q.id === b.id); vGoto(d.x, d.y, () => vEnter(b.id)); return; }
  vGoto(wx, wy);
});
$("#vNav").addEventListener("click", e => { const b = e.target.closest(".vn"); if (b) { vGoPlace(b.dataset.p); if (e.detail) b.blur(); vil.focus({ preventScroll:true }); } });
vPrompt.addEventListener("click", () => vInteract());
$("#vAdmin").addEventListener("click", e => { $("#mAdmin").click(); vRepaint(); e.currentTarget.blur(); vil.focus({ preventScroll:true }); });
$("#vTitle").addEventListener("click", () => showIntro("title"));

/* ---------- the boss test: prove you already know a language you have not unlocked ---------- */
function vPlaceAsk(lang) {
  if (!lang || !TRACKS[lang] || trackOpen(lang)) return;
  V.placeLang = lang; const T = TRACKS[lang], boss = T.LEVELS.filter(l => !l.arena).slice(-1)[0].foe.name;
  $("#plcTitle").textContent = "Boss test: " + T.lang;
  $("#plcBody").innerHTML = "<p>Already know " + T.lang + "? Skip the lessons and face <b>" + boss + "</b>, the boss of level 10, once.</p><p><b>Pass</b> and all ten levels of " + T.lang + " open and it counts as complete.</p><p><b>Not yet?</b> You can try again any time, nothing is lost, or play the levels from the start instead.</p>";
  openSheet("#plc"); $("#plcGo").focus();
}
function vPlaceStart() {
  const lang = V.placeLang; if (!lang || trackOpen(lang)) { closeSheets(); return; }
  closeSheets(); setTrack(lang); closeVillage(); document.body.style.overflow = ""; startLevel(NREAL); S.place = lang;
}
/* leaving a boss test you have not passed returns you to your own language and the village */
function placeLeave() {
  if (!S.place || trackOpen(D.track)) return false;
  S.place = null; setTrack(startTrack()); $("#overlay").hidden = true; openVillage(); return true;
}
$("#plcGo").addEventListener("click", vPlaceStart);
$("#plcNo").addEventListener("click", () => { closeSheets(); if (V.on) document.body.style.overflow = "hidden"; });
$("#plc").addEventListener("keydown", e => { if (e.key === "Escape" && !$("#plc").hidden) { e.preventDefault(); $("#plcNo").click(); } });
