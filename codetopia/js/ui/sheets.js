/* Map, spellbook, unlockables and sandbox sheets, plus Admin and Reset. */

"use strict";

/* ================= sheets: map, spellbook, sandbox ================= */
function closeSheets(){ $$(".sheet").forEach(s => s.hidden = true); document.body.style.overflow = ""; }
function openSheet(id){ closeSheets(); $(id).hidden = false; document.body.style.overflow = "hidden"; const b = $(id + " button:not(:disabled)"); if (b) b.focus(); $(id).scrollTop = 0; }
function openMap(){ renderMap(); openSheet("#map"); }
function renderMap(){
  const mastered = CON_IDS.filter(id => seen(id) && D.mast[id].box >= 5).length;
  $("#mapTitle").textContent = "Codetopia: " + TRK.lang; $("#mapSub").textContent = TRK.mapSub;
  $("#mapinfo").innerHTML = `<span class="stat">Concepts mastered<b>${mastered}/${CON_IDS.length}</b></span><span class="stat">Reviews due<b>${dueCount()}</b></span><span class="stat">Difficulty<b>${diff()}</b></span><span class="stat">Spells cast<b>${D.casts}</b></span><span class="stat coin">Coins<b>${D.coins || 0}</b></span>`;
  renderTrail();
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
  else if (!D.admin && D.track === "js" && !cppDone()) { setTrack("cpp"); toast("Admin mode off. JavaScript is locked until you defeat the Pointer Wraith, so you are back in C++."); }
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

const coinTxt = n => n + (n === 1 ? " coin" : " coins");
let shown = { coins:0, owned:0 };
function animNums(root){
  $$("#unlStats [data-to]").forEach(el => {
    const to = +el.dataset.to, from = +el.dataset.from, t0 = performance.now();
    const fmt = v => el.dataset.of ? v + " / " + el.dataset.of : String(v);
    if (reduce || from === to) { el.textContent = fmt(to); return; }
    (function step(now){ const k = Math.min(1, (now - t0) / 800), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(Math.round(from + (to - from) * e)); if (k < 1) requestAnimationFrame(step); })(t0);
  });
}
let ownCol = null;
function renderUnl(fresh){
  const coins = D.coins || 0, owned = ownedN(), total = SKINS.length, next = SKINS.filter(s => !isReal(s)).sort((a, b) => a.price - b.price)[0];
  const pctOwn = Math.round(100 * owned / total), pctNext = next ? Math.min(100, Math.round(100 * coins / next.price)) : 100;
  const from = fresh ? { coins:0, owned:0 } : shown;
  $("#unlStats").innerHTML = `
    <div class="us"><span class="ul">Coins</span><b class="un"><i class="coin-i" aria-hidden="true"></i><span data-from="${from.coins}" data-to="${coins}">${coins}</span></b><span class="uh">Earned in levels and the Challenge Tower</span></div>
    <div class="us"><span class="ul">Characters owned</span><b class="un"><span data-from="${from.owned}" data-to="${owned}" data-of="${total}">${owned} / ${total}</span></b><span class="ubar" role="progressbar" aria-label="Characters owned" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${owned}"><i style="width:${fresh ? 0 : pctOwn}%" data-w="${pctOwn}"></i></span></div>
    <div class="us"><span class="ul">${next ? "Cheapest to unlock" : "Collection"}</span><b class="un uname">${next ? escH(next.n) : "Complete!"}</b>${next ? `<span class="ubar" role="progressbar" aria-label="Coins towards ${escH(next.n)}" aria-valuemin="0" aria-valuemax="${next.price}" aria-valuenow="${Math.min(coins, next.price)}"><i style="width:${fresh ? 0 : pctNext}%" data-w="${pctNext}"></i></span><span class="uh">${coins >= next.price ? "You can afford this now" : (next.price - coins) + " coins to go"}</span>` : ""}</div>
    ${D.admin ? '<div class="us adm"><span class="ul">Admin mode</span><b class="un uname">Every character is open</b></div>' : ""}`;
  requestAnimationFrame(() => $$("#unlStats .ubar i").forEach(i => { i.style.width = i.dataset.w + "%"; }));
  animNums(); shown = { coins, owned };
  const forSale = SKINS.filter(s => !isOpen(s)), mine = SKINS.filter(isOpen);
  $("#ownCount").textContent = "(" + mine.length + ")";
  $("#unlgrid").innerHTML = forSale.length ? forSale.map(s => `<div class="uc locked"><span class="tag" aria-label="${s.price} coins"><i class="coin-i" aria-hidden="true"></i>${s.price}</span><div class="pt">${spriteSVG(skinDef(s.id))}</div><h3>${escH(s.n)}</h3>
      <p class="src">${escH(s.from)}</p>
      <div class="btns"><button class="sbtn buy" type="button" data-buy="${s.id}" ${coins >= s.price ? "" : "disabled"}>${coins >= s.price ? "Buy" : "Need " + (s.price - coins)}</button><button class="sbtn" type="button" data-info="${s.id}">Info</button></div></div>`).join("")
    : `<p class="soldout">${D.admin ? "Admin mode: everything is open. Look in the Owned tab." : "Sold out! You own every character I carry."}</p>`;
  const cols = collectionList(), cur = cols.find(c => c.id === ownCol);
  const card = s => { const eq = D.skin === s.id, real = isReal(s);
    if (!isOpen(s)) return `<div class="uc locked"><div class="pt">${spriteSVG(skinDef(s.id))}</div><h3>${escH(s.n)}</h3><p class="src">${escH(s.from)}</p><p class="price">${s.price} coins, in the shop</p><div class="btns"><button class="sbtn" type="button" data-info="${s.id}">Info</button></div></div>`;
    return `<div class="uc on ${eq ? "worn" : ""}"><div class="pt">${spriteSVG(skinDef(s.id))}</div><h3>${escH(s.n)}</h3><p class="src">${escH(s.from)}</p>
      <p class="price own">${eq ? "Equipped" : s.id === "hero" ? "Starter" : real ? "Owned" : "Admin"}</p>
      <div class="btns"><button class="sbtn" type="button" data-equip="${s.id}" aria-pressed="${eq}">${eq ? "Equipped" : "Equip"}</button><button class="sbtn" type="button" data-info="${s.id}">Info</button></div></div>`; };
  if (cur) {
    const n = cur.members.filter(isOpen).length;
    $("#owngrid").innerHTML = `<div class="colhead"><button class="sbtn" type="button" data-colback>&larr; All collections</button><h2>${escH(cur.n)}</h2><span class="col-n">${n} / ${cur.members.length} owned</span></div><div class="unlgrid">${cur.members.map(card).join("")}</div>`;
  } else {
    $("#owngrid").innerHTML = `<div class="colgrid">${cols.map(c => { const n = c.members.filter(isOpen).length, m = c.members.length, pct = Math.round(100 * n / m);
      return `<button class="col ${n === m ? "done" : ""}" type="button" data-col="${c.id}" aria-label="${escH(c.n)}, ${n} of ${m} owned"><span class="col-pics" aria-hidden="true">${c.members.map(s => `<span class="cp ${isOpen(s) ? "" : "lock"}">${spriteSVG(skinDef(s.id))}</span>`).join("")}</span><h3>${escH(c.n)}</h3><span class="col-n">${n === m ? "Complete" : n + " / " + m}</span><span class="ubar" aria-hidden="true"><i style="width:${pct}%"></i></span></button>`; }).join("")}</div>`;
  }
  if (fresh || shopMsg) { const m2 = (shopMsg || "greet").split(":"); shopSay(m2[0], m2[1]); shopMsg = null; }
}
/* the shopkeeper: a few lines for each situation */
let shopMsg = null, shopTip = 0;
const pick = a => a[Math.floor(Math.random() * a.length)];
function shopSay(kind, name){
  const coins = D.coins || 0, left = SKINS.filter(s => !isReal(s)), aff = left.filter(s => s.price <= coins).sort((a, b) => b.price - a.price)[0], next = left.sort((a, b) => a.price - b.price)[0];
  let t;
  if (kind === "bought") t = pick(["A fine choice! Pleasure doing business.", "Sold! They will serve you well.", "Ha! You have a good eye for a bargain."]) + (name ? " " + name + " is yours." : "");
  else if (D.admin) t = "Admin mode? Everything is free today, apprentice. Take what you like.";
  else if (!left.length) t = "You own every character I carry! Come back when I have new stock.";
  else if (kind === "tip") { const tips = ["Clear a level for 25 coins, a boss for 60.", "Every floor of the Challenge Tower pays 5 coins, and every tenth floor pays 10.", "Replaying a level still pays 5 coins.", "The grander the design, the higher the price.", "Press Info on any character to see how they spin."]; t = tips[shopTip++ % tips.length]; }
  else if (aff) t = pick(["Ah, I can sell you " + aff.n + " right now. Interested?", "Your purse is heavy enough for " + aff.n + ". Just say the word.", "Looking at " + aff.n + "? That will be " + coinTxt(aff.price) + "."]);
  else if (coins === 0) t = "Empty pockets? Clear some levels or climb the Challenge Tower, then come back.";
  else t = "Not quite enough yet. " + next.n + " is the cheapest at " + coinTxt(next.price) + ". Keep earning!";
  const el = $("#shopSay"); el.textContent = t; el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
}
$("#shopKeeper").addEventListener("click", () => shopSay("tip"));
let chrId = null;
function renderChr(){
  const s = SKINS.find(k => k.id === chrId); if (!s) return;
  const o = isOpen(s), real = isReal(s), eq = D.skin === s.id, coins = D.coins || 0;
  $("#chrSpin").classList.toggle("locked", !o);
  $("#chrName").textContent = s.n; $("#chrFrom").textContent = s.from + (o && !real ? " · admin" : "");
  $("#chrBio").textContent = s.bio || "";
  $("#chrAch").textContent = s.id === "hero" ? "Free. Every player starts as the apprentice." : real ? "Owned. You bought this character for " + coinTxt(s.price) + "." : coinTxt(s.price);
  $("#chrWallet").textContent = real ? "" : "You have " + coinTxt(coins) + (coins < s.price ? ", so you need " + (s.price - coins) + " more." : ".");
  const b = $("#chrEq"); b.dataset.act = real || D.admin ? "equip" : "buy";
  b.disabled = !real && !D.admin && coins < s.price;
  b.textContent = real || D.admin ? (eq ? "Equipped" : "Equip") + (!real ? " (admin)" : "") : coins >= s.price ? "Buy for " + coinTxt(s.price) : "Not enough coins";
  b.setAttribute("aria-pressed", String(eq));
}
function openChr(id){
  chrId = id;
  const svg = spriteSVG(skinDef(id)); let layers = ""; const N = 7;
  for (let i = 0; i < N; i++) layers += `<div class="chr-l" style="transform:translateZ(${(i - (N - 1) / 2) * 3}px)">${svg}</div>`;
  $("#chrSpin").innerHTML = layers;
  renderChr(); openSheet("#chr");
}
$("#chrEq").addEventListener("click", () => {
  if (!chrId) return; const b = $("#chrEq");
  if (b.dataset.act === "buy") { if (!buySkin(chrId)) return; toast("You bought " + skinMeta(chrId).n + ". Press Equip to wear them in battle."); shopMsg = "bought:" + skinMeta(chrId).n; renderChr(); renderUnl(); return; }
  D.skin = chrId; persist(); applyHeroSkin(); renderChr(); renderUnl();
});
$("#chrBack").addEventListener("click", () => { renderUnl(); openSheet("#unl"); const b = $('#unl [data-info="' + chrId + '"]'); if (b) b.focus(); });
function openUnl(){ renderUnl(true); openSheet("#unl"); if (typeof showUnlTab === "function") showUnlTab(window.unlTab || "shop"); }
$("#unl").addEventListener("click", e => {
  const by = e.target.closest("[data-buy]");
  if (by && !by.disabled) { const id = by.dataset.buy, nm = skinMeta(id).n; if (buySkin(id)) { toast("You bought " + nm + ". Find them in the Owned tab to equip."); shopMsg = "bought:" + nm; renderUnl(); const nb = $('#unlgrid [data-info]'); if (nb) nb.focus(); } return; }
  const co = e.target.closest("[data-col]"); if (co) { ownCol = co.dataset.col; renderUnl(); const bb = $("#owngrid [data-colback]"); if (bb) bb.focus(); return; }
  if (e.target.closest("[data-colback]")) { const was = ownCol; ownCol = null; renderUnl(); const bb = $('#owngrid [data-col="' + was + '"]'); if (bb) bb.focus(); return; }
  const inf = e.target.closest("[data-info]"); if (inf) { openChr(inf.dataset.info); return; }
  const eqb = e.target.closest("[data-equip]"); if (!eqb || eqb.getAttribute("aria-pressed") === "true") return;
  D.skin = eqb.dataset.equip; persist(); applyHeroSkin(); renderUnl(); const nb = $('#owngrid [data-equip="' + D.skin + '"]'); if (nb) nb.focus();
});
$("#uClose").addEventListener("click", openMap);

const SAMPLE = '<h1>My page</h1>\n<p>Edit this HTML and watch the result change.</p>\n<ul>\n  <li><a href="#">A link</a></li>\n  <li><strong>Something important</strong></li>\n</ul>';
function renderSbx(){ $("#sbxOut").srcdoc = '<!doctype html><meta charset="utf-8"><style>body{font:16px/1.45 Georgia,serif;margin:12px;color:#1b1640}img{max-width:100%}table{border-collapse:collapse}td,th{border:1px solid #8b84b8;padding:2px 8px}</style>' + $("#sbxIn").value.replace(/src="potion\.png"/g, 'src="' + POTION + '"'); }
function openSbx(){ if (lvUnlocked() < 4) return; if (!$("#sbxIn").value) $("#sbxIn").value = SAMPLE; renderSbx(); openSheet("#sbx"); }
$("#sbxIn").addEventListener("input", renderSbx);
$("#sSample").addEventListener("click", () => { $("#sbxIn").value = SAMPLE; renderSbx(); });
$("#sClose").addEventListener("click", openMap);
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#book").hidden) closeBook(); else if (e.key === "Escape" && !$("#chr").hidden) $("#chrBack").click(); else if (e.key === "Escape" && !$("#unl").hidden) openMap(); });
