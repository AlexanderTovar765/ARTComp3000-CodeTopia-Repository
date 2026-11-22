/* Cutscenes for the finale: a backdrop, one or two characters, a speaker and typed-out text, with camera pushes, entrances, lightning, cracks, collapse, dissolve and sunrise effects.
   Click, Space or Enter moves on; Escape or Skip ends the scene. */

"use strict";

const cine = $("#cine"), cineBg = $("#cineBg"), cineTxt = $("#cineTxt"), cineWho = $("#cineWho"), cineWorld = $("#cineWorld");
const cineL = $("#cineL"), cineR = $("#cineR"), cineStage = $("#cineStage"), cineFlash = $("#cineFlash"), cineBlack = $("#cineBlack"), cineDust = $("#cineDust"), cineCracks = $("#cineCracks");
function cineSprite(id){
  if (id === "hero") return spriteSVG(battleDef(S.robe ? "pythona_robe" : D.skin));
  const s = SPRITES[id]; return spriteSVG({ px:s.px, pal:s.pal, sc:s.sc });
}
function cinePaint(bg){
  const w = innerWidth, h = innerHeight; cineBg.dataset.bg = bg;
  if (bg === "black") { const c = cineBg.getContext("2d"); cineBg.width = 2; cineBg.height = 2; c.fillStyle = "#000"; c.fillRect(0, 0, 2, 2); return; }
  drawBackdrop({ cv:cineBg, w, h: h * .76, mode:bg === "dawn" ? "ruins" : bg, dawn:bg === "dawn" });
}
const cineWait = ms => new Promise(r => setTimeout(r, reduce ? Math.min(ms, 250) : ms));
const cineRe = el => void el.offsetWidth;
const cineCls = (el, c, on) => { el.classList.toggle(c, !!on); };
function cineZoom(kind){
  cineWorld.style.animation = "none"; cineRe(cineWorld);
  if (reduce || !kind) return;
  cineWorld.style.animation = kind === "punch" ? "czpunch .5s ease-out forwards" : kind === "out" ? "czout 9s ease-out forwards" : "czin 9s ease-out forwards";
}
function cineParticles(n, o){
  const r = o.from.getBoundingClientRect(), w = cineWorld.getBoundingClientRect();
  for (let i = 0; i < n; i++) {
    const e = document.createElement("i"); e.className = "p " + (o.cls || "");
    const x = r.left - w.left + Math.random() * r.width, y = r.top - w.top + Math.random() * r.height, sz = 3 + Math.random() * (o.size || 7);
    e.style.cssText = `left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;background:${o.colors[i % o.colors.length]};--dx:${(Math.random() - .5) * (o.spread || 120)}px;--dy:${o.rise || -260}px;animation-delay:${Math.random() * (o.delay || 1.4)}s;animation-duration:${1.4 + Math.random() * 1.6}s`;
    cineDust.appendChild(e);
  }
}
function cineCrackLines(){
  const w = 100, h = 100; let d = "";
  for (let k = 0; k < 7; k++) { let x = 10 + Math.random() * 80, y = Math.random() * 12; d += `M${x},${y}`; for (let s = 0; s < 9; s++) { x += (Math.random() - .5) * 18; y += 9 + Math.random() * 6; d += ` L${x.toFixed(1)},${y.toFixed(1)}`; } }
  cineCracks.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><path d="${d}" pathLength="100"/></svg>`;
}
async function cineFx(fx){
  if (fx === "suit") { cineCls(cineFlash, "on", 1); await cineWait(220); giveSuit(); cineL.innerHTML = cineSprite("hero"); cineCls(cineFlash, "on", 0); cineCls(cineL, "robe", 1); await cineWait(1300); cineCls(cineL, "robe", 0); return; }
  if (fx === "shake") { cineCls(cineStage, "shake", 1); await cineWait(900); cineCls(cineStage, "shake", 0); }
  else if (fx === "flash") { cineCls(cineFlash, "on", 1); await cineWait(180); cineCls(cineFlash, "on", 0); }
  else if (fx === "lightning") {
    for (const gap of [90, 120, 60]) { cineCls(cineFlash, "on", 1); cineCls(cineFlash, "bolt", 1); await cineWait(gap); cineCls(cineFlash, "on", 0); await cineWait(110); }
    cineCls(cineFlash, "bolt", 0); cineCls(cineStage, "shake", 1); await cineWait(500); cineCls(cineStage, "shake", 0);
  }
  else if (fx === "rumble") { cineCls(cineStage, "shake", 1); cineParticles(26, { from:cineStage, colors:["#6a6288", "#8a82aa", "#3a3452"], rise:90, spread:60, size:5 }); await cineWait(1300); cineCls(cineStage, "shake", 0); }
  else if (fx === "crack") {
    cineCrackLines(); cineCls(cineCracks, "on", 1); cineCls(cineStage, "shake", 1); cineCls(cine, "dread", 1);
    cineParticles(40, { from:cineStage, colors:["#6a6288", "#8a82aa", "#3a3452", "#c9c2e8"], rise:140, spread:90, size:6 });
    await cineWait(1700); cineCls(cineStage, "shake", 0);
  }
  else if (fx === "collapse") {
    cineCls(cineStage, "shake", 1); cineCls(cineStage, "hard", 1); cineCls(cineCracks, "on", 1);
    const deb = $("#cineDebris"); deb.innerHTML = "";
    for (let i = 0; i < 70; i++) { const d = document.createElement("i"); const sz = 8 + Math.random() * 34; d.style.cssText = `left:${Math.random() * 100}%;width:${sz}px;height:${sz * (.6 + Math.random() * .6)}px;animation-delay:${Math.random() * 1.6}s;animation-duration:${.8 + Math.random() * .9}s;background:${["#6a6288", "#52496e", "#3a3452", "#8a82aa"][i % 4]}`; deb.appendChild(d); }
    cineParticles(60, { from:cineStage, colors:["#b9b2d6", "#8a82aa", "#e5e0f7"], rise:-60, spread:200, size:10, delay:2 });
    await cineWait(700); cineCls(cineL, "fall", 1); cineCls(cineR, "fall", 1);
    for (let k = 0; k < 4; k++) { cineCls(cineFlash, "on", 1); cineCls(cineFlash, "red", 1); await cineWait(120); cineCls(cineFlash, "on", 0); cineCls(cineFlash, "red", 0); await cineWait(380); }
    cineCls(cineFlash, "on", 1); await cineWait(420); cineCls(cineBlack, "on", 1); cineCls(cineFlash, "on", 0); await cineWait(500);
    cineCls(cineStage, "shake", 0); cineCls(cineStage, "hard", 0); cineCls(cineCracks, "on", 0); cineCls(cine, "dread", 0); deb.innerHTML = ""; cineDust.innerHTML = ""; await cineWait(700);
  }
  else if (fx === "reveal") {
    cineCls(cine, "dread", 1); cineCls(cineFlash, "on", 1); cineCls(cineFlash, "red", 1); await cineWait(160); cineCls(cineFlash, "on", 0); cineCls(cineFlash, "red", 0);
    cineCls(cineR, "reveal", 1); cineCls(cineStage, "shake", 1); cineParticles(20, { from:cineR, colors:["#ff4a5a", "#ff9d4a", "#2d1b4e"], rise:-150, spread:140, size:6, delay:.6 });
    await cineWait(1100); cineCls(cineStage, "shake", 0); cineCls(cineR, "reveal", 0);
  }
  else if (fx === "robe") {
    cineCls(cineFlash, "on", 1); cineCls(cineFlash, "gold", 1); await cineWait(200); S.robe = true; cineL.innerHTML = cineSprite("hero"); cineCls(cineFlash, "on", 0); cineCls(cineFlash, "gold", 0);
    cineCls(cineL, "robe", 1); cineParticles(46, { from:cineL, colors:["#ffd96a", "#fff3c8", "#7be08a", "#ffffff"], rise:-200, spread:140, size:6, delay:1.2 }); await cineWait(1500); cineCls(cineL, "robe", 0);
  }
  else if (fx === "dissolve") {
    cineCls(cineR, "dissolve", 1);
    cineParticles(70, { from:cineR, colors:["#ffd96a", "#ff9d4a", "#7fe3d0", "#ffffff"], rise:-340, spread:180, size:7, delay:1.6 });
    cineCls(cineStage, "shake", 1); await cineWait(500); cineCls(cineStage, "shake", 0); await cineWait(2000);
  }
  else if (fx === "sunrise") {
    cineCls(cineFlash, "on", 1); await cineWait(260); cineCls(cineFlash, "on", 0);
    cineCls(cineWorld, "sunrise", 1);
    cineParticles(36, { from:cineStage, colors:["#fff3c8", "#ffd96a", "#ffffff"], rise:-200, spread:100, size:5, delay:3 });
    await cineWait(2600);
  }
}
function cineReset(){
  [cineL, cineR].forEach(e => { e.className = e === cineL ? "cine-l" : "cine-r"; e.innerHTML = ""; });
  cineStage.className = "cine-stage"; cineFlash.className = "cine-flash"; cineBlack.classList.remove("on"); cineCracks.className = "cine-cracks"; cineCracks.innerHTML = "";
  cineWorld.classList.remove("sunrise"); cine.classList.remove("dread", "title"); cineDust.innerHTML = ""; $("#cineDebris").innerHTML = ""; cineWorld.style.animation = "none";
}
/* beats: { bg, who, text, l, r, fx, narr, zoom, shout } where l and r are sprite ids shown on the left and the right; zoom is "in" (default), "out" or "punch" */
function playCine(beats){
  return new Promise(resolve => {
    cineReset(); cine.hidden = false; document.body.style.overflow = "hidden"; $(".app").inert = true; cineCls(cine, "open", 0); cineRe(cine); cineCls(cine, "open", 1);
    let i = -1, typing = null, canGo = false, ended = false, prevL = null, prevR = null;
    const finish = () => { if (ended) return; ended = true; clearInterval(typing); removeEventListener("keydown", key); cine.removeEventListener("click", tap); cineCls(cineBlack, "on", 1);
      setTimeout(() => { cine.hidden = true; cineCls(cine, "open", 0); $(".app").inert = false; document.body.style.overflow = ""; cineReset(); resolve(); }, reduce ? 0 : 450); };
    const talk = (who, on) => { cineCls(cineL, "talk", on && who === "hero"); cineCls(cineR, "talk", on && who && who !== "hero"); };
    const say2 = (text, b) => { clearInterval(typing); cineTxt.textContent = ""; cineTxt.className = (b.narr ? "narr" : "") + (b.shout ? " shout" : ""); cineRe(cineTxt); let n = 0; canGo = false; cineTxt.dataset.full = text;
      const done = () => { clearInterval(typing); typing = null; cineTxt.textContent = text; canGo = true; talk(b.who, 0); };
      if (reduce) { done(); return; }
      talk(b.who, !b.narr);
      typing = setInterval(() => { n += 2; if (!b.narr && n % 6 === 2) SND.sfx("blip", b.who); cineTxt.textContent = text.slice(0, n); if (n >= text.length) done(); }, b.shout ? 20 : 30); };
    const next = async () => {
      i++; if (i >= beats.length) { finish(); return; }
      const b = beats[i]; canGo = false; talk(null, 0);
      if (b.bg && b.bg !== cineBg.dataset.bg) { cineCls(cineBlack, "on", 1); await cineWait(350); cinePaint(b.bg); cineReset(); prevL = prevR = null; cineCls(cine, "title", b.bg === "black"); await cineWait(80); cineCls(cineBlack, "on", 0); }
      ["fall", "dissolve", "reveal"].forEach(c => { cineCls(cineL, c, 0); cineCls(cineR, c, 0); });
      if (b.l !== prevL) { cineL.innerHTML = b.l ? cineSprite(b.l) : ""; cineCls(cineL, "in", 0); cineRe(cineL); cineCls(cineL, "in", !!b.l); prevL = b.l; }
      if (b.r !== prevR) { cineR.innerHTML = b.r ? cineSprite(b.r) : ""; cineCls(cineR, "in", 0); cineRe(cineR); cineCls(cineR, "in", !!b.r); prevR = b.r; }
      cineCls(cineL, "dim", b.who && b.who !== "hero" && !b.narr); cineCls(cineR, "dim", b.who === "hero");
      cineWho.textContent = b.narr ? "" : b.who === "hero" ? "You" : b.who || ""; cineWho.className = b.who === "hero" ? "me" : "";
      cineZoom(b.zoom === undefined ? "in" : b.zoom); say2(b.text, b);
      if (b.fx) { const t = cineFx(b.fx); canGo = false; await t; canGo = !typing; }
    };
    const advance = () => { if (typing) { clearInterval(typing); typing = null; cineTxt.textContent = cineTxt.dataset.full; canGo = true; talk(null, 0); return; } if (canGo) next(); };
    const tap = e => { if (e.target.closest("#cineSkip")) return; advance(); };
    const key = e => { if (cine.hidden) return; if (e.key === " " || e.key === "Enter") { e.preventDefault(); advance(); } else if (e.key === "Escape") finish(); };
    cine.addEventListener("click", tap); addEventListener("keydown", key); $("#cineSkip").onclick = finish;
    cinePaint(beats[0].bg || "tower"); cineCls(cine, "title", beats[0].bg === "black"); next();
  });
}

/* ---------- the scenes ---------- */
const CINE_PRE = [
  { bg:"tower", who:"Pythona", r:"pythona", l:"hero", fx:"lightning", text:"So. The little apprentice climbs my castle one line at a time, and thinks the curse is only a bug that can be fixed." },
  { who:"Pythona", r:"pythona", l:"hero", text:"I was writing spells before your kingdom had a name. HTML bowed to me. C++ trembled. JavaScript still calls itself my cousin." },
  { who:"Pythona", r:"pythona", l:"hero", zoom:"punch", fx:"lightning", text:"Every language you learned is a thread in my web. Pull one and you only pull the rest tighter around you." },
  { who:"Pythona", r:"pythona", l:"hero", shout:true, text:"Come, then. Show me what you remember. I will be gentle, for as long as I wear this face." }
];
const CINE_MID = [
  { bg:"tower", who:"Pythona", r:"pythona", l:"hero", zoom:"punch", fx:"shake", text:"Impossible... A child, cracking my syntax? Every line you type, I feel it in my scales!" },
  { who:"Pythona", r:"pythona", l:"hero", shout:true, zoom:"punch", fx:"lightning", text:"ENOUGH! If I cannot rule this tower, then NOBODY will!" },
  { narr:true, r:"pythona", l:"hero", fx:"crack", text:"A crack runs up the wall. The stones begin to groan..." },
  { narr:true, r:"pythona", l:"hero", zoom:"punch", fx:"collapse", text:"The tower gives way. Banners tear, the roof falls in, and the floor drops out from beneath you both!" },
  { bg:"ruins", narr:true, l:"hero", zoom:"out", fx:"rumble", text:"You wake in the wreck of the throne room. Dust hangs in the air, and the spell book lies buried under the rubble." },
  { narr:true, l:"hero", zoom:"in", fx:"robe", text:"Something glints in the dust: a purple robe embroidered with gold, the one Pythona wore before the curse. It hums as you pull it on, and it fits as if it was made for you." },
  { who:"Pythona", r:"pythona2", l:"hero", fx:"reveal", zoom:"punch", text:"Do you like my true form? It has no use for a disguise... and neither will you have a page to read." },
  { who:"Pythona", r:"pythona2", l:"hero", shout:true, text:"You cannot see the code now, apprentice. Cast from memory, in any language I choose, or not at all." }
];
const cineDefaultSkin = () => !D.skin || APPRENTICES.includes(D.skin) || !SKIN_ART[D.skin] || (!D.admin && !D.skins[D.skin]);
/* the robe beat only plays for the default apprentice; any other skin keeps its own look and the rest of the cutscene plays as normal */
const cineMid = () => cineDefaultSkin() ? CINE_MID : CINE_MID.filter(b => b.fx !== "robe");
const CINE_END = [
  { bg:"ruins", who:"Pythona", r:"pythona2", l:"hero", fx:"shake", zoom:"punch", text:"No... You wrote it all without a page to follow. Every language, from memory. How?" },
  { who:"hero", r:"pythona2", l:"hero", text:"You were never ruling the languages. You were only borrowing them. They belong to everyone who speaks them." },
  { who:"Pythona", r:"pythona2", l:"hero", text:"Then perhaps... a language is only ever as strong as the people who use it. Write well, apprentice." },
  { narr:true, r:"pythona2", l:"hero", zoom:"out", fx:"dissolve", text:"Pythona coils into the dust. Her scales crumble to embers, and the curse unravels thread by thread." },
  { bg:"dawn", narr:true, l:"hero", zoom:"out", fx:"sunrise", text:"Light pours through the broken roof, and the first sunrise in a hundred nights climbs over Codetopia." },
  { narr:true, l:"hero", zoom:"out", text:"Tags close, braces match and the monsters fade back into the code they came from. In the village below, a child types a single word and watches it print: Hello." },
  { bg:"black", narr:true, zoom:null, text:"Codetopia is free. Thank you for playing." }
];
