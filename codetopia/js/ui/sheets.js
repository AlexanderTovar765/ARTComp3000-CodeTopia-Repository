/* Map, spellbook, unlockables and sandbox sheets, plus Admin and Reset. */

"use strict";

/* ================= sheets: map, spellbook, sandbox ================= */
function closeSheets(){ $$(".sheet").forEach(s => s.hidden = true); document.body.style.overflow = ""; }
function openSheet(id){ closeSheets(); $(id).hidden = false; document.body.style.overflow = "hidden"; const b = $(id + " button:not(:disabled)"); if (b) b.focus(); $(id).scrollTop = 0; }
function openMap(){ renderMap(); openSheet("#map"); }
function renderMap(){
  const mastered = CON_IDS.filter(id => seen(id) && D.mast[id].box >= 5).length;
  $("#mapTitle").textContent = "Codetopia: " + TRK.lang; $("#mapSub").textContent = TRK.mapSub;
  $("#mapinfo").innerHTML = `<span class="stat">Concepts mastered<b>${mastered}/${CON_IDS.length}</b></span><span class="stat">Reviews due<b>${dueCount()}</b></span><span class="stat">Difficulty<b>${diff()}</b></span><span class="stat">Spells cast<b>${D.casts}</b></span>`;
  $("#trail").innerHTML = LEVELS.slice(0, NREAL).map((lv, i) => {
    const n = i + 1, locked = n > lvUnlocked(), st = D.stars[n] || 0;
    return `<li><button class="node ${lv.foe.boss ? "boss" : ""}" type="button" data-l="${n}" ${locked ? "disabled" : ""}>
      <span class="nn">Level ${n}${lv.foe.boss ? " · boss" : ""}</span><span class="nm">${escH(lv.n)}</span>
      <span class="thumb">${foeSVG(lv.foe)}</span>
      <span class="st" aria-label="${st} stars">${"★".repeat(st)}${"☆".repeat(3 - st)}</span>
      <span class="ft">${locked ? "Locked" : escH(lv.foe.name)}</span></button></li>`;
  }).join("");
  $("#mSbx").hidden = TRK.id !== "html"; $("#mSbx").disabled = lvUnlocked() < 4; $("#mSbx").textContent = lvUnlocked() < 4 ? "Sandbox (clear level 3)" : "Sandbox";
  $("#mAdmin").textContent = D.admin ? "Admin: on" : "Admin"; $("#mAdmin").setAttribute("aria-pressed", D.admin ? "true" : "false");
  $("#stAdmin").hidden = !D.admin;
  $("#mClose").hidden = !started || (S.busy && !$("#overlay").hidden);
  $("#mReset").textContent = "Reset progress"; $("#mReset").dataset.armed = "";
}
$("#trail").addEventListener("click", e => { const b = e.target.closest(".node"); if (b && !b.disabled) startLevel(+b.dataset.l); });
$("#mClose").addEventListener("click", () => { closeSheets(); });
$("#mBook").addEventListener("click", () => openBook("map"));
$("#mSbx").addEventListener("click", openSbx);
$("#mUnl").addEventListener("click", openUnl);
$("#mAdmin").addEventListener("click", () => {
  D.admin = !D.admin;
  if (!D.admin && D.track === "cpp" && !htmlDone()) { setTrack("html"); toast("Admin mode off. C++ is locked until you defeat the Markup Titan, so you are back in HTML."); }
  else toast(D.admin ? "Admin mode on: every level, every language and every character is open." : "Admin mode off.");
  persist(); applyHeroSkin(); renderMap();
});
$("#mReset").addEventListener("click", e => {
  const b = e.currentTarget;
  if (b.dataset.armed) { Store.clear(); D = fresh(); applyTrack(); resetScene(); persist(); renderMap(); stats(); refreshActions(); applyHeroSkin(); return; }
  b.dataset.armed = "1"; b.textContent = "Press again to erase all progress";
});
$("#bMap").addEventListener("click", () => { if (!S.busy) openMap(); });
$("#bBook").addEventListener("click", () => openBook("battle"));

let bookFrom = "battle";
function closeBook(){ if (bookFrom === "map") openMap(); else closeSheets(); }
function openBook(from){
  bookFrom = from === "map" ? "map" : "battle"; $("#bClose").textContent = bookFrom === "map" ? "Back to map" : "Close";
  const mastered = CON_IDS.filter(id => seen(id) && D.mast[id].box >= 5).length;
  $("#bookSub").textContent = mastered + " of " + CON_IDS.length + " concepts mastered. " + dueCount() + " due for review. A concept is mastered after you write it with no mistakes several times, spread over time.";
  $("#bookgrid").innerHTML = CON_IDS.map(id => {
    const c = CON[id], locked = c.L > lvUnlocked(), st = starsOf(id), e = D.mast[id];
    const status = locked ? "Locked" : !seen(id) ? "Not met yet" : e.box >= 5 ? "Mastered" : "Learning";
    return `<div class="bk ${locked ? "locked" : ""}"><h3>${escH(c.n)}</h3><div class="tg">${c.tags.map(t => `<code>${escH(t)}</code>`).join("")}</div>
      <p>${locked ? "Reach level " + c.L + " to meet this." : escH(c.e)}</p>
      <div class="ms"><span aria-label="${st} stars">${"★".repeat(st)}${"☆".repeat(3 - st)}</span><span>${status}${isDue(id) ? ' · <span class="due">due</span>' : ""}</span></div></div>`;
  }).join("");
  openSheet("#book");
}
$("#bClose").addEventListener("click", closeBook);

function renderUnl(){
  const open = SKINS.filter(isReal).length;
  $("#unlSub").textContent = open + " of " + SKINS.length + " characters unlocked. Finish each achievement to play as that character, then press Equip to wear them in battle." + (D.admin ? " Admin mode is on, so every character can be equipped." : "");
  $("#unlgrid").innerHTML = SKINS.map(s => {
    const o = isOpen(s), real = isReal(s), eq = D.skin === s.id, [c0, m] = s.prog(), c = real ? m : c0, pct = Math.round(100 * Math.min(c, m) / m);
    return `<div class="uc ${o ? "on" : "locked"} ${s.id === "hero" ? "starter" : ""}"><div class="pt">${spriteSVG(skinDef(s.id))}</div>
      <h3>${escH(s.n)}</h3><p class="src">${escH(s.from)}${o && !real ? " · admin" : ""}</p><p class="ach">${escH(s.ach)}</p>
      ${s.id === "hero" ? "" : `<div class="pg" role="progressbar" aria-label="Progress for ${escH(s.n)}" aria-valuemin="0" aria-valuemax="${m}" aria-valuenow="${c}"><i style="width:${pct}%"></i></div><div class="pgt">${c} / ${m}</div>`}
      ${o ? `<button class="sbtn" type="button" data-skin="${s.id}" aria-pressed="${eq}">${eq ? "Equipped" : "Equip"}</button>` : `<span class="lk">Locked</span>`}</div>`;
  }).join("");
}
function openUnl(){ checkUnlocks(); renderUnl(); openSheet("#unl"); }
$("#unlgrid").addEventListener("click", e => { const b = e.target.closest("[data-skin]"); if (!b || b.getAttribute("aria-pressed") === "true") return; D.skin = b.dataset.skin; persist(); applyHeroSkin(); renderUnl(); const nb = $('#unlgrid [data-skin="' + D.skin + '"]'); if (nb) nb.focus(); });
$("#uClose").addEventListener("click", openMap);

const SAMPLE = '<h1>My page</h1>\n<p>Edit this HTML and watch the result change.</p>\n<ul>\n  <li><a href="#">A link</a></li>\n  <li><strong>Something important</strong></li>\n</ul>';
function renderSbx(){ $("#sbxOut").srcdoc = '<!doctype html><meta charset="utf-8"><style>body{font:16px/1.45 Georgia,serif;margin:12px;color:#1b1640}img{max-width:100%}table{border-collapse:collapse}td,th{border:1px solid #8b84b8;padding:2px 8px}</style>' + $("#sbxIn").value.replace(/src="potion\.png"/g, 'src="' + POTION + '"'); }
function openSbx(){ if (lvUnlocked() < 4) return; if (!$("#sbxIn").value) $("#sbxIn").value = SAMPLE; renderSbx(); openSheet("#sbx"); }
$("#sbxIn").addEventListener("input", renderSbx);
$("#sSample").addEventListener("click", () => { $("#sbxIn").value = SAMPLE; renderSbx(); });
$("#sClose").addEventListener("click", openMap);
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#book").hidden) closeBook(); else if (e.key === "Escape" && !$("#unl").hidden) openMap(); });
