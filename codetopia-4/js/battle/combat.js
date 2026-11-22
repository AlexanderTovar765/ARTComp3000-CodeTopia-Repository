/* Resolving spells, foe turns, victory and defeat. */

"use strict";

/* ================= combat ================= */
function complete(){
  SND.sfx("cast", { track:S.lesson.track || TRK.id, act:S.lesson.sp.a });
  const les = S.lesson, mistakes = S.mistakes, hinted = S.hint, clean = mistakes === 0 && !hinted;
  S.busy = true; $("#editor").classList.add("done"); $("#result").classList.add("live"); lock(true);
  S.lvCasts++; if (clean) S.lvClean++; S.recent = S.recent.concat(les.sp.id).slice(-4);
  const reminders = mistakes > 0 || hinted ? les.sp.c.slice(0, 1).map(id => CON[id].n + ": " + CON[id].e).join(" ") : "";
  applyMastery(les.sp, mistakes, hinted);
  fb(clean ? "No mistakes. Well done." : "Done. Keep an eye on the details.", "good");
  const last = $("#idleLast"); last.hidden = false;
  last.innerHTML = "Last spell: <code>" + escH(les.code.replace(/\n\s*/g, " ")) + "</code>" + (clean ? " (no mistakes)" : "") + (reminders ? "<br>Remember: " + escH(reminders) : "");
  stats(); unpress(); S.action = null;
  setTimeout(() => { showIdle("Casting...", les.sp.t + " is in the air."); resolve(les, clean); }, reduce ? 0 : 350);
}
async function resolve(les, clean){
  const sp = les.sp, a = sp.a, f = FOE();
  const spell = makeSpell(a, les), hc = center(hero), fc = center(foe);
  const from = { x:hc.x + hc.w * .45, y:hc.y - hc.h * .1 };
  let guard = 0, ward = null;
  if (a === "attack" || a === "heavy") {
    const heavy = a === "heavy", mb = modeBonus(a, S.mode); let dmg = Math.round((DMG[a][0] + (clean ? DMG[a][1] : 0)) * mb); const notes = []; if (mb > 1) notes.push((S.mode === "tags" ? "dots" : "from memory") + " " + MODE_NOTE[S.mode]);
    const m = /class="(\w+)"/.exec(les.code); if (m && CLASSES[m[1]]) { dmg += 5; notes.push(CLASSES[m[1]] + " enchantment +5"); }
    const weak = weakHit(sp); if (weak) { dmg = Math.round(dmg * 1.5); notes.push("weak point ×1.5"); }
    if (clean) notes.push("no mistakes bonus");
    say(sp.t + "! " + dmg + " damage" + (notes.length ? " (" + notes.join(", ") + ")" : ""));
    await heroCast(a, from); heroLunge(heavy);
    await fly(spell, from, { x:fc.x, y:fc.y }, heavy ? 650 : 420, heavy ? 1.3 : 1);
    spell.remove(); if (heavy) hurt(scene); hurt(foe); pop(foe, "-" + dmg, "dmg");
    if (weak) pop(foe, "Weak point!", "weak", 34);
    S.foeHP = Math.max(0, S.foeHP - dmg); bars(); await wait(650);
    if (S.foeHP <= 0) { await foeDown(); return; }
    if (f.boss && !S.phase2 && (f.finale ? S.foeHP <= FINALE_TRIGGER : S.foeHP <= S.foeMax / 2)) { S.phase2 = true;
      if (f.finale) { await finalePhase(f); await wait(500); }
      else if (f.spr2) { $("#foeBody").innerHTML = foeSVG(Object.assign({}, f, { spr:f.spr2 })); foe.style.setProperty("--k", (f.k || 1) * (SPRITES[f.spr2].sc || 1)); hurt(foe); say(f.name + " sheds her disguise and strikes harder!"); }
      else say(f.name + " enters phase 2 and hits harder!"); rollIntent(); await wait(900); }
  } else if (a === "block") {
    guard = clean ? 1 : .75; ward = spell; SND.sfx("ward");
    say(clean ? "Perfect ward! The next hit is fully blocked." : "Ward raised. The next hit is cut by 75%.");
    heroBrace(); await fly(spell, from, { x:hc.x + hc.w * .95, y:hc.y }, 380, 1.1); await wait(350);
  } else {
    const fxs = sp.fx || {}, heal = Math.min(S.heroMax - S.heroHP, (fxs.heal || 22) + (clean ? 8 : 0));
    say((sp.name || sp.t) + " restores " + heal + " HP" + (fxs.skip ? " and the foe falls asleep" : "") + (clean ? ", no mistakes bonus" : ""));
    SND.sfx("heal"); heroHeal();
    await fly(spell, { x:hc.x, y:hc.y - hc.h * .6 }, { x:hc.x, y:hc.y - hc.h * .95 }, 520, 1.05);
    spell.remove(); S.heroHP += heal; if (fxs.shield) S.shield = fxs.shield; if (fxs.skip) S.skip = true; bars(); pop(hero, "+" + heal, "heal"); await wait(650);
  }
  await foeTurn(guard, ward);
}
async function foeTurn(guard, ward){
  const it = S.intent, f = FOE();
  if (S.skip) { S.skip = false; say(f.name + " is asleep and skips its turn."); await wait(900); return endTurn(ward); }
  say(f.name + " uses " + it.name + "!"); await wait(650);
  const hc = center(hero), fc = center(foe), reach = ward ? center(ward).x + 36 : hc.x + hc.w * .35;
  SND.sfx("swoosh"); const run = foeStrike(reach - fc.x, 620); await wait(280);
  let dmg = it.dmg;
  if (guard >= 1) dmg = 0; else if (guard > 0) dmg = Math.max(1, Math.round(dmg * (1 - guard)));
  if (S.shield && dmg > 0) { dmg = Math.max(1, Math.round(dmg * (1 - S.shield))); }
  S.shield = 0;
  if (ward) hurt(ward);
  if (dmg > 0) { S.heroHP = Math.max(0, S.heroHP - dmg); hurt(hero); pop(hero, "-" + dmg, "dmg"); if (ward || guard) say("The ward absorbed most of it."); }
  else { pop(hero, "Blocked", "block"); say("Blocked! You took no damage."); }
  bars(); await run; await endTurn(ward);
}
async function endTurn(ward){
  if (ward) { await anim(ward, [{ opacity:1 }, { opacity:0 }], { duration:300 }); ward.remove(); }
  if (S.heroHP <= 0) { defeat(); return; }
  rollIntent(); S.busy = false; lock(false); stats();
  showIdle("Your turn", dueCount() ? dueCount() + " concept" + (dueCount() === 1 ? " is" : "s are") + " due for review. Review spells in the choices bring them back." : "Choose your next action.");
}
/* Pythona: the tower collapses once she drops to FINALE_TRIGGER, and she returns at full health in her final form. */
const FINALE_TRIGGER = 600, FINALE_HP = 600;
async function finalePhase(f){
  try { await playCine(cineMid()); } catch (e) {} S.robe = cineDefaultSkin(); S.ruin = true; S.blind = true; applyHeroSkin(); drawBackdrop();
  S.foeMax = FINALE_HP; S.foeHP = FINALE_HP; S.heroHP = Math.min(S.heroMax, S.heroHP + Math.round(S.heroMax * .3)); bars();
  foe.getAnimations().forEach(a => a.cancel()); foe.style.opacity = "";
  $("#foeBody").innerHTML = foeSVG(Object.assign({}, f, { spr:f.spr2 })); foe.style.setProperty("--k", (f.k || 1) * (SPRITES[f.spr2].sc || 1));
  say("The code has vanished. Cast from memory!"); rollIntent();
}
async function foeDown(){
  const f = FOE();
  if (f.finale && !S.phase2 && S.lvl <= NREAL) { S.phase2 = true; S.busy = true; await finalePhase(f); S.busy = false; lock(false); back(); return; } say(f.name + " is debugged!"); SND.sfx(f.boss ? "fanfare" : "win");
  await foeDissolve(f);
  foe.style.opacity = "0"; heroCheer(); if (!reduce) await wait(1000);
  const ratio = S.lvCasts ? S.lvClean / S.lvCasts : 0, st = ratio >= .8 ? 3 : ratio >= .5 ? 2 : 1;
  const arena = S.lvl > NREAL, place = !arena && !D.admin && S.place === TRK.id && S.lvl === NREAL && !trackOpen(TRK.id), record = (!arena && S.lvl <= D.unlocked) || place;
  const boss = !!f.boss, first = record && !D.stars[S.lvl], earned = arena ? 0 : first ? (boss ? COINS.bossClear : COINS.clear) : COINS.replay;
  if (record) { D.stars[S.lvl] = Math.max(D.stars[S.lvl] || 0, st); D.unlocked = Math.max(D.unlocked, Math.min(NREAL, S.lvl + 1)); } if (place) { S.place = null; (D.placed = D.placed || {})[TRK.id] = st; } persist(); if (earned) addCoins(earned); stats();
  const concepts = CON_IDS.filter(id => CON[id].L === S.lvl);
  const rows = concepts.map(id => `<code>${escH(CON[id].tags[0])}</code>`).join("");
  const last = S.lvl >= NREAL;
  if (f.finale && !arena) { S.busy = true; await playCine(CINE_END); if (!D.skins.pythona_robe) { D.skins.pythona_robe = true; persist(); toast("New character unlocked: Pythona's Robe. Find it in Unlockables."); } S.robe = false; applyHeroSkin(); S.ruin = false; S.blind = false; drawBackdrop(); }
  const btns = []; if (!last) btns.push({ label:"Next level", fn:() => startLevel(S.lvl + 1) });
  if (place) btns.push({ label:"Back to the village", fn:openVillage });
  btns.push({ label:"Back to map", alt:!last || place, fn:openMap });
  if (arena) { overlay(`<h2>${escH(f.name)} is defeated</h2><p>Admin arena cleared. Nothing from this fight is saved to your campaign progress.</p>`, [{ label:"Back to map", fn:openMap }]); return; }
  overlay(`<div class="stars" aria-label="${st} out of 3 stars">${"★".repeat(st)}${"☆".repeat(3 - st)}</div><h2>${place ? "Boss test passed" : last ? TRK.winTitle : "Level " + S.lvl + " cleared"}</h2>
    <p>${place ? escH(TRK.lang) + " is open. You proved you know it, so all 10 levels are yours to play and it counts as complete. You wrote " + S.lvCasts + " spells and " + S.lvClean + " had no mistakes." : last ? TRK.winText() : "You cast " + S.lvCasts + " spells and " + S.lvClean + " had no mistakes."}</p>
    ${rows ? `<p>You practised:</p><div class="chips">${rows}</div>` : ""}<p>Reviews due: ${dueCount()}. Difficulty: ${diff()}.</p>
    <p class="unl"><b>+${earned} coins</b> (${D.coins} in total). ${first ? (boss ? "Boss bonus for your first win." : "First win bonus.") : "Replay reward."}</p>`, btns);
}
async function defeat(){
  await heroKO();
  hero.style.transition = "transform .5s"; hero.style.transform = "rotate(80deg) translateY(14px)"; say("Your code crashed."); SND.sfx("lose");
  overlay(`<h2>Your code crashed</h2><p>${FOE().name} found a bug you could not patch. Your mastery is kept, so the spells you learned will come back for review.</p>`, [
    { label:"Try again", fn:() => { const p = S.place; startLevel(S.lvl); S.place = p; } }, { label:"Back to map", alt:true, fn:openMap }]);
}
function overlay(html, buttons){
  $("#card").innerHTML = html + `<div class="btns">${buttons.map((b, i) => `<button class="btn ${b.alt ? "alt" : ""}" data-i="${i}" type="button">${b.label}</button>`).join("")}</div>`;
  $("#overlay").hidden = false; if (typeof vicCard === "function") vicCard();
  $$("#card .btn").forEach(el => el.addEventListener("click", () => { $("#overlay").hidden = true; buttons[+el.dataset.i].fn(); }));
  const b = $("#card .btn"); if (b) b.focus();
}
