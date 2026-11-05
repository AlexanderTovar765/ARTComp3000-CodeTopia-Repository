/* Starting a level and resetting the scene. */

"use strict";

/* ================= levels ================= */
function setFoe(){
  const f = FOE(); S.foeMax = S.foeHP = f.hp; $("#foeName").textContent = f.name; foe.setAttribute("aria-label", f.name);
  $("#foeBody").innerHTML = foeSVG(f); foe.style.setProperty("--k", (f.k || 1) * (SPRITES[f.spr].sc || 1));
  foe.getAnimations().forEach(a => a.cancel()); foe.style.opacity = "";
  const wk = f.weak ? CON[f.weak] : null;
  $("#weak").innerHTML = wk ? `Weak to: <b>${escH(wk.n)}</b>` : "";
}
let started = false;
function resetScene(){
  started = false; S.busy = true; S.lesson = null; S.action = null; S.lvl = Math.max(1, Math.min(D.unlocked, NREAL));
  hero.style.transition = ""; hero.style.transform = "";
  setFoe(); drawBackdrop(); rollIntent(); bars(); refreshActions(); lock(true); unpress();
  showIdle("Welcome to Codetopia", "Open the map and choose a level to begin.");
}
function startLevel(n){
  started = true; closeSheets(); S.lvl = n; const lv = LV();
  S.heroMax = 100 + 8 * (Math.min(n, NREAL) - 1); S.heroHP = S.heroMax; S.phase2 = false; S.shield = 0; S.skip = false;
  S.lvCasts = 0; S.lvClean = 0; S.recent = []; S.action = null; S.lesson = null; S.busy = true;
  hero.style.transition = ""; hero.style.transform = "";
  setFoe(); drawBackdrop(); rollIntent(); bars(); refreshActions(); lock(true); unpress();
  showIdle("Get ready", lv.blurb); say(lv.arena ? lv.n : "Level " + n + ": " + lv.n);
  if (lv.arena) { overlay(`<h2>${escH(lv.n)}</h2><p>${escH(lv.blurb)}</p><p>Boss: ${escH(lv.foe.name)}. Every HTML spell you have unlocked in admin mode can appear.</p>`,
    [{ label:"Fight", fn:() => { S.busy = false; lock(false); showIdle("Pick an action", "Choose an action, then choose a spell and type its " + TRK.lang + "."); } }, { label:"Map", alt:true, fn:openMap }]); return; }
  const fresh = CON_IDS.filter(id => CON[id].L === n).map(id => `<code>${escH(CON[id].tags[0])}</code>`).join("");
  const unlockNote = Object.values(ACTIONS).filter(a => a.unlock === n && n > 1).map(a => a.label);
  overlay(`<h2>Level ${n}: ${escH(lv.n)}</h2><p>${escH(lv.blurb)}</p>
    <p>New this level:</p><div class="chips">${fresh}</div>
    ${unlockNote.length ? `<p><b>New action unlocked: ${unlockNote.join(", ")}.</b></p>` : ""}
    <p>${lv.foe.boss ? "Boss: " : "Foe: "}${escH(lv.foe.name)}. Weak to ${escH(CON[lv.foe.weak].n)}.</p>
    ${n === 1 ? "<p>Faded code is your guide. Type it exactly. As you get better, the help fades away.</p>" : ""}`,
    [{ label:"Fight", fn:() => { S.busy = false; lock(false); showIdle("Pick an action", "Choose an action, then choose a spell and type its " + TRK.lang + "."); } },
     { label:"Map", alt:true, fn:openMap }]);
}
