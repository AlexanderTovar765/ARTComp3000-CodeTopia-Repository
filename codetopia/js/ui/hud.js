/* Health bars, stats and the foe intent display. */

"use strict";

/* ================= HUD ================= */
function bars(){
  $("#heroFill").style.width = (S.heroHP / S.heroMax * 100) + "%";
  $("#foeFill").style.width = (S.foeHP / S.foeMax * 100) + "%";
  $("#heroHpTxt").textContent = S.heroHP + "/" + S.heroMax;
  $("#foeHpTxt").textContent = S.foeHP + "/" + S.foeMax;
  stats();
}
function stats(){
  $("#stAdmin").hidden = !D.admin;
  $("#stLvl").textContent = S.lvl > NREAL ? "Arena" : S.lvl; $("#stDue").textContent = dueCount(); $("#stCoins").textContent = D.coins || 0; $("#stDiff").textContent = diff();
  $("#stDiffWrap").title = "The game adapts to how many of your last 10 spells had no mistakes.";
}
function rollIntent(){
  const f = FOE(), mult = DMG_MULT[diff()] * (S.phase2 ? 1.3 : 1);
  S.intent = { name:sample(f.moves), base:rnd(f.dmg[0], f.dmg[1]) }; S.intent.dmg = Math.round(S.intent.base * mult); renderIntent();
}
function renderIntent(){ $("#intent").innerHTML = `Next: <b>${S.intent.name}</b>, about ${S.intent.dmg} damage.`; }
function lock(on){
  $$(".act").forEach(b => { const a = b.dataset.a; b.disabled = on || ACTIONS[a].unlock > S.lvl; });
  ta.readOnly = on; $("#bMap").disabled = on; $("#hint").disabled = on || S.hint;
}
function buildActions(){
  $("#actions").innerHTML = Object.entries(ACTIONS).map(([id, a]) =>
    `<button class="act ${id}" type="button" data-a="${id}" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a.icon}</svg><span>${a.label}<small data-sub>${a.sub}</small></span><kbd aria-hidden="true">${a.key}</kbd></button>`).join("");
  $("#actions").addEventListener("click", e => { const b = e.target.closest(".act"); if (b && !b.disabled) selectAction(b.dataset.a); });
}
function refreshActions(){
  $$(".act").forEach(b => { const a = ACTIONS[b.dataset.a]; b.querySelector("[data-sub]").textContent = a.unlock > S.lvl ? "Unlocks at level " + a.unlock : a.sub; });
}
function view(name){ $("#idle").hidden = name !== "idle"; $("#picks").hidden = name !== "picks"; $("#lesson").hidden = name !== "lesson"; }
function showIdle(title, text){ view("idle"); $("#idleTitle").textContent = title; $("#idleText").textContent = text; }
function unpress(){ $$(".act").forEach(b => b.setAttribute("aria-pressed", "false")); }
