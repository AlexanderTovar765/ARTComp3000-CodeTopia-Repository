/* Choosing an action and a spell. */

"use strict";

/* ================= choosing a spell ================= */
function selectAction(a){
  if (S.busy) return;
  S.action = a; S.offers = offers(a); S.offerModes = assignModes(S.offers.length, a);
  $$(".act").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.a === a)));
  if (S.offers.length === 1) { chooseSpell(0); return; }
  view("picks");
  $("#picksTitle").textContent = ACTIONS[a].label + ": choose a spell";
  $("#picksSub").textContent = "New spells teach something new. Review spells bring back something you have met before.";
  $("#pickrow").innerHTML = S.offers.map((s, i) => {
    const weak = weakHit(s) && (a === "attack" || a === "heavy");
    const st = Math.min(...s.c.map(starsOf));
    return `<button class="pick ${a}" type="button" data-i="${i}"><kbd aria-hidden="true">${"ASD"[i]}</kbd>
      <span class="badge">${S.blind ? "Unknown spell" : badgeFor(s) + (s.bug ? " · fix the bug" : "") + (" · " + MODE_LABEL[S.offerModes[i]] + (modeBonus(S.action, S.offerModes[i]) > 1 ? " · " + MODE_NOTE[S.offerModes[i]] : ""))}</span><span class="pt">${S.blind ? "? ? ?" : escH(s.t)}</span>
      <span class="tg">${S.blind ? "" : s.c.map(id => `<code>${escH(CON[id].tags[0])}</code>`).join("")}</span>
      <span class="mt"><span>${"★".repeat(st)}${"☆".repeat(3 - st)}</span>${weak ? '<span class="wk">Weak point</span>' : ""}</span></button>`;
  }).join("");
  $("#console").scrollIntoView({ block:"nearest", behavior:reduce ? "auto" : "smooth" });
  const first = $(".pick"); if (first) first.focus({ preventScroll:true });
}
$("#pickrow").addEventListener("click", e => { const b = e.target.closest(".pick"); if (b) chooseSpell(+b.dataset.i); });

function chooseSpell(i){
  const sp = S.offers[i]; if (!sp) return;
  const les = instantiate(sp); les.badge = badgeFor(sp);
  S.lesson = les; S.hint = false; S.mistakes = 0; S.prevLen = 0; ta.value = ""; ta.maxLength = les.code.length + 6;
  S.mode = S.blind ? "blind" : (S.offerModes[i] || "full");
  renderLesson(); drawCode(); ta.focus({ preventScroll:true });
  $("#console").scrollIntoView({ block:"nearest", behavior:reduce ? "auto" : "smooth" });
}
function effectText(les){
  const a = les.sp.a, weak = weakHit(les.sp) && (a === "attack" || a === "heavy") ? " It hits a weak point for <b>×1.5</b>." : "";
  if (a === "attack" || a === "heavy") return `Deals <b>${DMG[a][0]}</b> damage. No mistakes adds <b>+${DMG[a][1]}</b>.${weak}`;
  if (a === "block") return "Cuts the next hit by <b>75%</b>. No mistakes blocks <b>all</b> of it.";
  const fx = les.sp.fx || {}; let t = `Heals <b>${fx.heal || 22}</b> HP. No mistakes adds <b>+8</b>.`;
  if (fx.shield) t += " It also shields you from half of the next hit."; if (fx.skip) t += " The foe falls asleep and skips its next turn.";
  return t;
}
function renderLesson(){
  const les = S.lesson, sp = les.sp, a = sp.a, L = $("#lesson");
  L.className = "lesson " + a; view("lesson");
  $("#lMeta").textContent = ACTIONS[a].label + " · " + les.badge + (S.mode === "blind" ? " · from memory" : S.mode === "recall" ? " · from memory" : S.mode === "tags" ? " · dots" : "") + (modeBonus(a, S.mode) > 1 ? " · " + MODE_NOTE[S.mode] : "");
  $("#lTitle").textContent = S.blind ? "Unknown spell" : sp.t;
  $("#lGoal").textContent = "Goal: " + les.goal;
  const bug = $("#lBug"); if (les.bug) { bug.hidden = false; bug.innerHTML = "<span>The enemy cast this broken spell</span>" + escH(les.bug); } else bug.hidden = true;
  $("#lConcept").innerHTML = S.mode === "blind" ? "<b>The page is gone.</b> Nothing to read. Cast it from memory. A hint explains the idea, but never shows the code."
    : S.mode === "recall"
    ? "<b>From memory.</b> Write it from memory. The result below shows what it should look like. Press Hint if you need help."
    : sp.c.slice(0, 2).map(id => `<b>${escH(CON[id].n)}.</b> ${escH(CON[id].e)}`).join(" ");
  $("#lEffect").innerHTML = effectText(les);
  const pv = $("#preview"); pv.innerHTML = S.blind ? "" : renderRes(les); pv.inert = true;
  const visible = pv.innerText.trim().length > 0 || pv.querySelector("img,input,button,video,audio,hr,select,textarea,table,iframe");
  if (S.blind) pv.innerHTML = '<span class="none">Hidden in the rubble.</span>'; else if (!visible) pv.innerHTML = '<span class="none">Nothing visible. This part works behind the scenes.</span>';
  $("#result").classList.remove("live"); $("#editor").classList.remove("done");
  const con = ["cpp", "js", "py"].includes(les.track) && !les.sp.page; $("#result").classList.toggle("cpp", con); $("#result").classList.toggle("jspage", !!les.sp.page && les.track === "js"); $("#result .lab").textContent = con ? "Console" : "Result";
  ta.setAttribute("aria-label", S.blind ? "Type the spell from memory" : S.mode === "full" ? "Type this " + trkOf(les).lang + ": " + les.code : "Type the " + trkOf(les).lang + " described by the goal");
  fb("");
  $("#hint").disabled = S.hint; ta.readOnly = false;
}
function fb(msg, kind){ const f = $("#feedback"); f.textContent = msg; f.className = "feedback" + (kind === "good" ? " good" : ""); }
$("#hint").addEventListener("click", () => {
  if (S.busy || !S.lesson) return; S.hint = true; if (!S.blind) S.mode = "full"; $("#hint").disabled = true;
  $("#lConcept").innerHTML = S.lesson.sp.c.slice(0, 2).map(id => `<b>${escH(CON[id].n)}.</b> ${escH(CON[id].e)}`).join(" ");
  if (!S.blind) ta.setAttribute("aria-label", "Type this " + trkOf(S.lesson).lang + ": " + S.lesson.code);
  fb("Hint used. This spell will not earn the no-mistakes bonus.");
  drawCode(); ta.focus({ preventScroll:true });
});
function back(){
  if (S.busy || !S.lesson) return;
  S.lesson = null; ta.blur();
  if (S.offers.length > 1) selectAction(S.action); else { S.action = null; unpress(); showIdle("Pick an action", "Choose an action to cast a spell."); }
}
$("#back").addEventListener("click", back);
