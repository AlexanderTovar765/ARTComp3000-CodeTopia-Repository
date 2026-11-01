/* Choosing an action and a spell. */

"use strict";

/* ================= choosing a spell ================= */
function selectAction(a){
  if (S.busy) return;
  S.action = a; S.offers = offers(a);
  $$(".act").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.a === a)));
  if (S.offers.length === 1) { chooseSpell(0); return; }
  view("picks");
  $("#picksTitle").textContent = ACTIONS[a].label + ": choose a spell";
  $("#picksSub").textContent = "New spells teach something new. Review spells bring back something you have met before.";
  $("#pickrow").innerHTML = S.offers.map((s, i) => {
    const weak = weakHit(s) && (a === "attack" || a === "heavy");
    const st = Math.min(...s.c.map(starsOf));
    return `<button class="pick ${a}" type="button" data-i="${i}"><kbd aria-hidden="true">${"ASD"[i]}</kbd>
      <span class="badge">${badgeFor(s)}${s.bug ? " · fix the bug" : ""}</span><span class="pt">${escH(s.t)}</span>
      <span class="tg">${s.c.map(id => `<code>${escH(CON[id].tags[0])}</code>`).join("")}</span>
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
  S.mode = fadeMode(sp);
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
  $("#lMeta").textContent = ACTIONS[a].label + " · " + les.badge + (S.mode === "recall" ? " · recall round" : S.mode === "tags" ? " · fading help" : "");
  $("#lTitle").textContent = sp.t;
  $("#lGoal").textContent = "Goal: " + les.goal;
  const bug = $("#lBug"); if (les.bug) { bug.hidden = false; bug.innerHTML = "<span>The enemy cast this broken spell</span>" + escH(les.bug); } else bug.hidden = true;
  $("#lConcept").innerHTML = S.mode === "recall"
    ? "<b>Recall round.</b> Write it from memory. The result below shows what it should look like. Press Hint if you need help."
    : sp.c.slice(0, 2).map(id => `<b>${escH(CON[id].n)}.</b> ${escH(CON[id].e)}`).join(" ");
  $("#lEffect").innerHTML = effectText(les);
  const pv = $("#preview"); pv.innerHTML = renderRes(les); pv.inert = true;
  const visible = pv.innerText.trim().length > 0 || pv.querySelector("img,input,button,video,audio,hr,select,textarea,table");
  if (!visible) pv.innerHTML = '<span class="none">Nothing visible. This part works behind the scenes.</span>';
  $("#result").classList.remove("live"); $("#editor").classList.remove("done");
  $("#result").classList.toggle("cpp", TRK.id === "cpp"); $("#result .lab").textContent = TRK.id === "cpp" ? "Console" : "Result";
  ta.setAttribute("aria-label", S.mode === "full" ? "Type this " + TRK.lang + ": " + les.code : "Type the " + TRK.lang + " described by the goal");
  fb("");
  $("#hint").disabled = S.hint; ta.readOnly = false;
}
function fb(msg, kind){ const f = $("#feedback"); f.textContent = msg; f.className = "feedback" + (kind === "good" ? " good" : ""); }
$("#hint").addEventListener("click", () => {
  if (S.busy || !S.lesson) return; S.hint = true; S.mode = "full"; $("#hint").disabled = true;
  $("#lConcept").innerHTML = S.lesson.sp.c.slice(0, 2).map(id => `<b>${escH(CON[id].n)}.</b> ${escH(CON[id].e)}`).join(" ");
  ta.setAttribute("aria-label", "Type this " + TRK.lang + ": " + S.lesson.code);
  fb("Hint used. This spell will not earn the no-mistakes bonus.");
  drawCode(); ta.focus({ preventScroll:true });
});
function back(){
  if (S.busy || !S.lesson) return;
  S.lesson = null; ta.blur();
  if (S.offers.length > 1) selectAction(S.action); else { S.action = null; unpress(); showIdle("Pick an action", "Choose an action to cast a spell."); }
}
$("#back").addEventListener("click", back);
