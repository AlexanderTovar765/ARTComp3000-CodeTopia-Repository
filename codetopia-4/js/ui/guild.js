/* The Debuggers' Guild: a case board, and a three step investigation for each case.
   Step 1: tap the line with the bug. Step 2: name the kind of mistake. Step 3: fix the line and test it.
   HTML and CSS cases show a live page. JavaScript, Python and C++ cases really run, so the player sees the symptom and the cure. */

"use strict";

const GD = { lang:"html", c:null, step:1, sel:-1, wl:0, wt:0, tries:0, hinted:false, shown:false, done:false, tok:0, badTypes:[] };
const gdNorm = s => s.replace(/\s+/g, "").toLowerCase();
const GD_BASE = '<!doctype html><meta charset="utf-8"><style>body{font:17px/1.4 Georgia,serif;margin:12px;color:#2a1d3d;background:#fff8ec}</style>';
const gdLangName = l => TRACKS[l].lang;
const gdPips = n => `<span class="gd-pips" aria-hidden="true">${[1, 2, 3].map(i => gdIco(i < n ? "check" : i === n ? "bug" : "bugOff", 18)).join("")}</span>`;

function openGuild() {
  if (!V.open || !V.open.guild) return;
  gdInitArt();
  const first = GUILD_LANGS.find(guildLangOpen); if (!guildLangOpen(GD.lang)) GD.lang = first || "html";
  gdBoard(); openSheet("#guild");
}
function gdBoard() {
  GD.tok++; GD.c = null;
  $("#gdBoard").hidden = false; $("#gdCase").hidden = true; $("#gdCoins").textContent = D.coins + " coins";
  const n = guildSolved(), total = GUILD_CASES.length;
  $("#gdPic").innerHTML = spriteSVG(SPRITES.vil_dbug);
  $("#gdSay").textContent = n === 0 ? "Bzzzt! Welcome, recruit. Every case file holds one broken program with one bug in it. Find the line, name the mistake, fix it. More files open as you clear each language."
    : n === total ? "Every case closed. You are a legend of the Guild. Bzzzt! Come back any time to chase more stars."
    : "Rank: " + guildRank() + ". Pick a case file. Three stars means you found the line, named the mistake and fixed it first time with no hints.";
  $("#gdStats").innerHTML = `<span class="stat">Rank<b>${guildRank()}</b></span><span class="stat">Cases solved<b>${n}/${total}</b></span><span class="stat">Stars<b>${guildTotalStars()}/${total * 3}</b></span>`;
  $("#gdTabs").innerHTML = GUILD_LANGS.map(l => { const open = guildLangOpen(l), cs = GUILD_CASES.filter(c => c.lang === l), done = cs.filter(c => guildStars(c.id) > 0).length;
    return `<button class="hbtn gd-tab" type="button" data-l="${l}" style="--lc:${GD_LANG_COL[l]}" aria-pressed="${l === GD.lang}" ${open ? "" : "disabled"}>${open ? "" : gdIco("lock", 14, "gd-lk")}${gdLangName(l)}<small>${open ? done + "/" + cs.length + " solved" : "Clear " + gdLangName(l) + " to open"}</small></button>`; }).join("");
  $("#gdGrid").innerHTML = GUILD_CASES.filter(c => c.lang === GD.lang).map(c => { const st = guildStars(c.id);
    return `<button class="gd-card ${st ? "solved" : ""}" type="button" data-id="${c.id}" style="--lc:${GD_LANG_COL[c.lang]}">${gdIco("pin", 14, "gd-pin")}<b>${escH(c.title)}</b><span class="gd-sty">${escH(c.story)}</span>${st ? `<img class="gd-ico gd-seal" src="${gdURI("stamp")}" width="${GDART.stamp.width * 2}" alt="Case closed" draggable="false">` : ""}<span class="gd-meta">${gdStars(st, 18)}<span class="gd-tier">${gdBugs(c.tier, 18)}</span></span></button>`; }).join("");
  if (typeof gaBoard === "function") gaBoard();
}

function openCase(id) {
  const c = guildCase(id); if (!c) return;
  Object.assign(GD, { c, lang:c.lang, step:1, sel:-1, wl:0, wt:0, tries:0, hinted:false, shown:false, done:false, badTypes:[] }); GD.tok++;
  $("#gdBoard").hidden = true; $("#gdCase").hidden = false;
  $("#gdCTitle").textContent = c.title; $("#gdCMeta").textContent = gdLangName(c.lang) + " · Tier " + c.tier; $("#gdStory").textContent = c.story;
  gdRender(); gdShow(c.code, "What happens now"); $("#guild").scrollTop = 0; if (typeof gaCase === "function") gaCase();
}

/* what the program does: a page for HTML and CSS, real output for the rest */
function gdPage(c, lines) { return c.lang === "html" ? GD_BASE + lines.join("\n") : GD_BASE + "<style>" + lines.join("\n") + "</style>" + c.page; }
function gdRun(lang, code) { return lang === "js" ? new Promise(r => fgRunJs(code, r)) : Promise.resolve(lang === "py" ? pyRun(code, {}) : cppRun(code, {})); }
async function gdShow(lines, label) {
  const c = GD.c, tok = ++GD.tok; $("#gdOutLbl").textContent = label;
  if (c.lang === "html" || c.lang === "css") { $("#gdFrame").hidden = false; $("#gdOut").hidden = true; $("#gdFrame").srcdoc = gdPage(c, lines); return; }
  $("#gdFrame").hidden = true; $("#gdOut").hidden = false; $("#gdOut").className = "gd-out"; $("#gdOut").textContent = "Running the program…";
  const r = await gdRun(c.lang, lines.join("\n")); if (tok !== GD.tok) return;
  gdPrint(r);
}
function gdPrint(r) {
  const out = $("#gdOut"), text = (r.out || "").trim(); out.hidden = false;
  out.className = "gd-out" + (r.error ? " err" : ""); out.textContent = (text ? text + "\n" : "") + (r.error ? "Error: " + r.error : text ? "" : "(The program printed nothing.)");
}
const gdPatched = text => GD.c.code.map((l, i) => i === GD.sel ? text : l);

function gdRender() {
  const c = GD.c, st = GD.step;
  $("#gdCode").innerHTML = c.code.map((l, i) => { const cls = GD.done && i === GD.sel ? "fixed" : i === GD.sel ? "pick" : "";
    return `<button class="gd-line ${cls}" type="button" data-i="${i}" ${st === 1 && !GD.done ? "" : "disabled"}><span class="gd-n">${i + 1}</span><span>${escH(GD.done && i === GD.sel ? GD.fixed : l) || " "}</span></button>`; }).join("");
  const P = $("#gdPanel"), hintBtn = `<button class="hbtn" type="button" data-a="hint">Hint</button>`, hintBox = `<p class="gd-hint" id="gdHint" ${GD.hinted ? "" : "hidden"}>${escH(c.hint)}</p>`;
  if (GD.done) { P.innerHTML = GD.winHtml; return; }
  if (st === 1) P.innerHTML = `<h2>${gdPips(1)}Step 1 of 3: Find the bug</h2><p>Tap the line you think is wrong. Compare the program with what it does on the right.</p><p class="gd-fb" id="gdFb" role="status"></p>${hintBox}<div class="row">${hintBtn}</div>`;
  else if (st === 2) P.innerHTML = `<h2>${gdPips(2)}Step 2 of 3: Name the mistake</h2><p>Line ${GD.sel + 1} is the culprit. What kind of mistake is it?</p><div class="gd-opts">${GUILD_TYPES.map(t => `<button class="gd-opt" type="button" data-t="${t.id}" ${GD.badTypes.includes(t.id) ? "disabled" : ""}>${gdIco(t.id, 26, "gd-oi")}<b>${t.n}</b><span>${t.d}</span></button>`).join("")}</div><p class="gd-fb" id="gdFb" role="status"></p>${hintBox}<div class="row">${hintBtn}</div>`;
  else P.innerHTML = `<h2>${gdPips(3)}Step 3 of 3: Fix line ${GD.sel + 1}</h2><p>Rewrite the line so the program works, then test it.</p><textarea class="gd-in" id="gdIn" rows="2" spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off" aria-label="Your corrected line"></textarea><p class="gd-fb" id="gdFb" role="status"></p>${hintBox}<div class="row"><button class="btn" type="button" data-a="test">Test my fix</button>${hintBtn}<button class="hbtn" type="button" data-a="show">Show the answer (1 star)</button></div>`;
  if (st === 3) { const t = $("#gdIn"); t.value = c.code[GD.sel]; t.focus(); t.setSelectionRange(t.value.length, t.value.length);
    if (c.lang === "html" || c.lang === "css") t.addEventListener("input", () => { gdShow(gdPatched(t.value), "Your page so far"); }); }
}
function gdFb(msg, cls) { const f = $("#gdFb"); if (f) { f.textContent = msg; f.className = "gd-fb " + (cls || ""); } }

function gdPick(i) {
  const c = GD.c;
  if (c.bug.includes(i)) { GD.sel = i; GD.step = 2; SND.sfx("ui"); if (typeof gaBugOut === "function") { gaBugOut(document.querySelector(`.gd-line[data-i="${i}"]`)); gaMood("nod"); } gdRender(); return; }
  GD.wl++; SND.sfx("typo"); if (typeof gaMood === "function") gaMood("no");
  document.querySelectorAll(".gd-line").forEach(b => b.classList.remove("wrong")); const b = document.querySelector(`.gd-line[data-i="${i}"]`); if (b) b.classList.add("wrong");
  gdFb("Not that one. Line " + (i + 1) + " is fine. Compare the program with what it does on the right, then try another line.", "bad");
}
function gdType(t) {
  if (t === GD.c.type) { GD.step = 3; SND.sfx("ui"); if (typeof gaMood === "function") gaMood("nod"); gdRender(); return; }
  if (typeof gaMood === "function") gaMood("no"); GD.wt++; GD.badTypes.push(t); SND.sfx("typo"); gdRender(); gdFb("Not quite. Read the descriptions again and think about what went wrong with the line.", "bad");
}
async function gdTest() {
  const c = GD.c, txt = $("#gdIn").value, lines = gdPatched(txt); GD.tries++;
  if (c.lang === "py" ? txt.trimEnd() === c.code[GD.sel].trimEnd() : gdNorm(txt) === gdNorm(c.code[GD.sel])) { gdFb("That is still the original line. Change something.", "bad"); return; }
  let ok;
  if (c.re) { ok = new RegExp(c.re).test(gdNorm(txt)); gdShow(lines, ok ? "After your fix" : "Your attempt"); }
  else { const tok = ++GD.tok; $("#gdOutLbl").textContent = "Your attempt ran"; $("#gdFrame").hidden = true; $("#gdOut").hidden = false; $("#gdOut").className = "gd-out"; $("#gdOut").textContent = "Running the program…";
    const r = await gdRun(c.lang, lines.join("\n")); if (tok !== GD.tok) return; gdPrint(r); ok = !r.error && (r.out || "").trim() === c.expect; if (ok) $("#gdOutLbl").textContent = "After your fix"; }
  if (!ok) { SND.sfx("typo"); if (typeof gaMood === "function") gaMood("no"); gdFb(c.re ? "Not quite yet. The page on the right shows what your line does. Check it against the hint." : "Not quite yet. Look at what it printed on the right and compare it with the story.", "bad"); return; }
  gdWin(txt);
}
function gdWin(txt) {
  const c = GD.c, prev = guildStars(c.id), clean = GD.wl + GD.wt === 0, flawless = GD.tries === 1 && !GD.hinted && !GD.shown;
  const stars = 1 + (clean ? 1 : 0) + (flawless ? 1 : 0), pay = (prev ? 0 : 10 * c.tier) + 5 * Math.max(0, stars - prev);
  D.guild = D.guild || {}; D.guild[c.id] = Math.max(prev, stars); D.coins += pay; persist(); if (typeof stats === "function") stats();
  GD.done = true; GD.fixed = txt; SND.sfx("quest");
  const left = GUILD_CASES.filter(x => x.lang === c.lang && guildStars(x.id) === 0).length, idx = GUILD_CASES.findIndex(x => x.id === c.id), next = GUILD_CASES.slice(idx + 1).find(x => x.lang === c.lang);
  GD.winHtml = `<div class="gd-win"><img class="gd-ico gd-stamp" src="${gdURI("stamp")}" width="${GDART.stamp.width * 4}" alt="Case closed" draggable="false"><div class="gd-big">${gdStars(stars, 36)}</div><p>${escH(c.explain)}</p><p class="ms-got">${pay ? "+" + pay + " coins" : "No new coins this time"}</p>`
    + `<p class="sub">${clean ? "Clean investigation. " : "Wrong guesses cost a star. "}${flawless ? "Fixed first time with no hints." : "Fix it first time with no hints for the third star."} ${left ? left + " more case" + (left === 1 ? "" : "s") + " in the " + gdLangName(c.lang) + " file." : "You have closed the whole " + gdLangName(c.lang) + " file!"}</p>`
    + `<div class="row" style="justify-content:center">${next ? `<button class="btn" type="button" data-next="${next.id}">Next case</button>` : ""}<button class="hbtn" type="button" data-a="again">Try for more stars</button><button class="hbtn" type="button" data-a="board">All cases</button></div></div>`;
  $("#gdCoins").textContent = D.coins + " coins"; gdRender();
  if (typeof gaMood === "function") { gaMood("cheer"); setTimeout(gaWinBurst, 380); }
}

$("#gdTabs").addEventListener("click", e => { const b = e.target.closest("button[data-l]"); if (!b || b.disabled) return; GD.lang = b.dataset.l; gdBoard(); });
$("#gdGrid").addEventListener("click", e => { const b = e.target.closest("button[data-id]"); if (b) openCase(b.dataset.id); });
$("#gdCase").addEventListener("click", e => {
  const ln = e.target.closest(".gd-line"), op = e.target.closest(".gd-opt"), ac = e.target.closest("[data-a]"), nx = e.target.closest("[data-next]");
  if (ln && !ln.disabled) gdPick(+ln.dataset.i);
  else if (op && !op.disabled) gdType(op.dataset.t);
  else if (nx) openCase(nx.dataset.next);
  else if (ac) { const a = ac.dataset.a;
    if (a === "hint") { GD.hinted = true; if (typeof gaMood === "function") gaMood("think"); const h = $("#gdHint"); if (h) h.hidden = false; }
    else if (a === "test") gdTest();
    else if (a === "show") { GD.shown = true; $("#gdIn").value = GD.c.fix; gdFb("That is the answer. Press Test my fix to see it work.", "ok"); }
    else if (a === "again") openCase(GD.c.id);
    else if (a === "board") gdBoard(); }
});
$("#gdCase").addEventListener("keydown", e => { if (e.target.id === "gdIn" && e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); gdTest(); } });
$("#gdToBoard").addEventListener("click", gdBoard);
$("#gdBack").addEventListener("click", msBack);
