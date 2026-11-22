/* The Forge: a free workshop. Write HTML, CSS, JavaScript, Python or C++, run it, and keep your projects.
   HTML runs live in a protected frame. JavaScript runs in a worker with a time limit. Python and C++ run on the game's own small interpreters. */
"use strict";

const FG_LANGS = [
  { id:"html", name:"HTML", ext:"html", test:() => true },
  { id:"css", name:"CSS", ext:"css", test:() => !!D.admin || vOpenMap().css },
  { id:"js", name:"JavaScript", ext:"js", test:() => !!D.admin || vOpenMap().js },
  { id:"py", name:"Python", ext:"py", test:() => !!D.admin || vOpenMap().py },
  { id:"cpp", name:"C++", ext:"cpp", test:() => !!D.admin || vOpenMap().cpp }
];
const FG_MAX = 12;
const fgLive = l => l === "html" || l === "css";
const FG_CSS_PAGE = '<h1 id="title">Potion Shop</h1><p>Welcome, <strong>hero</strong>! Pick a potion.</p><div class="card"><h2>Pink potion</h2><p>Heals 5 HP.</p><button>Buy</button></div><div class="row"><div class="box">One</div><div class="box">Two</div><div class="box">Three</div></div><ul><li>Red</li><li class="big">Blue</li><li>Green</li></ul>';
const FG_START = {
  html:[
    { n:"My first page", c:'<h1>My page</h1>\n<p>Edit this HTML and watch the result change.</p>\n<ul>\n  <li><a href="#">A link</a></li>\n  <li><strong>Something important</strong></li>\n</ul>' },
    { n:"Potion shop", c:'<h1>The Potion Shop</h1>\n<img src="potion.png" alt="A pink potion" width="64">\n<p>One potion costs <strong>5 coins</strong>.</p>\n<table>\n  <tr><th>Potion</th><th>Price</th></tr>\n  <tr><td>Pink</td><td>5</td></tr>\n  <tr><td>Gold</td><td>12</td></tr>\n</table>' },
    { n:"About me", c:'<h1>About me</h1>\n<p>My name is <em>Hero</em>.</p>\n<h2>My favourite things</h2>\n<ol>\n  <li>Spells</li>\n  <li>Dragons</li>\n  <li>Cake</li>\n</ol>' }
  ],
  css:[
    { n:"Colourful card", c:'h1 { color: crimson; }\n\n.card {\n  background-color: lightyellow;\n  border: 2px solid goldenrod;\n  border-radius: 12px;\n  padding: 12px;\n}' },
    { n:"Flex row", c:'.row {\n  display: flex;\n  gap: 10px;\n  justify-content: space-between;\n}\n\n.box {\n  background: teal;\n  color: white;\n  padding: 10px;\n}' },
    { n:"Hover button", c:'button {\n  background: royalblue;\n  color: white;\n  border: none;\n  padding: 8px 16px;\n  border-radius: 6px;\n}\n\nbutton:hover {\n  background: hotpink;\n}' }
  ],
  js:[
    { n:"Hello, world", c:'const name = "Hero";\nconsole.log("Hello, " + name + "!");\n\nfor (let i = 1; i <= 3; i++) {\n  console.log("Spell number " + i);\n}' },
    { n:"Fighters list", c:'const party = ["Hero", "Mage", "Archer"];\nparty.push("Healer");\n\nparty.forEach((p, i) => {\n  console.log(i + 1, p);\n});\n\nconsole.log(party.length + " fighters");' },
    { n:"Damage calculator", c:'function damage(power, armour) {\n  return Math.max(0, power - armour);\n}\n\nconsole.log(damage(9, 4));\nconsole.log(damage(3, 8));\nconsole.log({ hero:"Hero", hp:damage(20, 5) });' }
  ],
  py:[
    { n:"Hello, world", c:'name = "Hero"\nprint("Hello,", name)\n\nfor i in range(1, 4):\n    print("Spell number", i)' },
    { n:"Fighters list", c:'party = ["Hero", "Mage", "Archer"]\nparty.append("Healer")\n\nfor i, p in enumerate(party, 1):\n    print(i, p)\n\nprint(len(party), "fighters")' },
    { n:"Damage calculator", c:'def damage(power, armour):\n    return max(0, power - armour)\n\nprint(damage(9, 4))\nprint(damage(3, 8))\nprint({"hero": "Hero", "hp": damage(20, 5)})' }
  ],
  cpp:[
    { n:"Hello, world", c:'#include <iostream>\nusing namespace std;\n\nint main() {\n  string name = "Hero";\n  cout << "Hello, " << name << "!" << endl;\n  for (int i = 1; i <= 3; i++) {\n    cout << "Spell number " << i << endl;\n  }\n  return 0;\n}' },
    { n:"Fighters list", c:'#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n  vector<string> party = {"Hero", "Mage", "Archer"};\n  party.push_back("Healer");\n  for (string p : party) {\n    cout << p << endl;\n  }\n  cout << party.size() << " fighters" << endl;\n}' },
    { n:"Hero class", c:'#include <iostream>\nusing namespace std;\n\nclass Hero {\npublic:\n  string name;\n  int hp = 10;\n  Hero(string n) { name = n; }\n  void hurt(int d) { hp -= d; }\n};\n\nint main() {\n  Hero h("Hero");\n  h.hurt(3);\n  cout << h.name << " has " << h.hp << " hp" << endl;\n}' }
  ]
};
const FG_TIPS = {
  html:["HTML shows a live page as you type. Try changing a heading to a list.", "Tags come in pairs: an opening tag and a closing tag with a slash."],
  css:["The preview is a sample page. Change a colour and watch it update.", "Each rule is a selector, then braces with property: value; lines."],
  js:["Press Run to see what console.log prints.", "Use let or const for names. Loops and functions go in curly braces."],
  py:["Python cares about indents. Four spaces after a colon.", "print() shows things. Press Run to see them."],
  cpp:["Every line needs a semicolon. cout << prints things.", "Put your code inside int main() { } like a real C++ program."]
};

/* ---- JavaScript runner: a worker with a time limit ---- */
function fgRunJs(code, done) {
  const src = "const jsInspect = " + jsInspect.toString().replace(/^function jsInspect/, "function") + ";\n"
    + "const send = s => postMessage({ t:'log', s:String(s).slice(0, 4000) });\n"
    + "const con = { log:(...a) => send(a.map(x => jsInspect(x, false)).join(' ')), info:(...a) => send(a.map(x => jsInspect(x, false)).join(' ')), warn:(...a) => send('Warning: ' + a.map(x => jsInspect(x, false)).join(' ')), error:(...a) => send('Error: ' + a.map(x => jsInspect(x, false)).join(' ')) };\n"
    + "onmessage = e => { let f; try { f = new Function('console', 'return (async () => {\\n' + e.data + '\\n})()'); } catch (err) { postMessage({ t:'err', s:err.name + ': ' + err.message }); postMessage({ t:'done' }); return; }\n"
    + " let r; try { r = f(con); } catch (err) { postMessage({ t:'err', s:err.name + ': ' + err.message }); }\n"
    + " Promise.resolve(r).catch(err => postMessage({ t:'err', s:(err && err.name || 'Error') + ': ' + (err && err.message || err) })).then(() => setTimeout(() => postMessage({ t:'done' }), 350)); };";
  let w, url, fin = false, lines = [], err = null, timer;
  const finish = stopped => { if (fin) return; fin = true; clearTimeout(timer); try { w.terminate(); } catch (e) {} try { URL.revokeObjectURL(url); } catch (e) {} done({ out:lines.join("\n"), error:stopped ? "Stopped: the program ran for too long. Is there a loop that never ends?" : err }); };
  try { url = URL.createObjectURL(new Blob([src], { type:"text/javascript" })); w = new Worker(url); } catch (e) { done({ out:"", error:"This browser cannot run JavaScript in the Forge here." }); return; }
  w.onmessage = e => { const m = e.data; if (m.t === "log") { if (lines.length < 400) lines.push(m.s); } else if (m.t === "err") { err = m.s + (/document|window|alert|prompt|localStorage/.test(m.s) ? " (The Forge console has no web page. Use the HTML tab to build a page.)" : ""); } else if (m.t === "done") finish(false); };
  w.onerror = e => { err = e.message || "Error"; e.preventDefault(); finish(false); };
  timer = setTimeout(() => finish(true), 3000);
  w.postMessage(code);
}

/* ---- state ---- */
const FG = { cur:null, t:0, saveT:0, askDel:null, said:"" };
function fgStore() { if (!D.forge || !Array.isArray(D.forge.slots)) D.forge = { slots:[], cur:null }; return D.forge; }
const fgSlot = () => fgStore().slots.find(s => s.id === FG.cur) || null;
const fgLang = id => FG_LANGS.find(l => l.id === id) || FG_LANGS[0];
const fgOpenLangs = () => FG_LANGS.filter(l => l.test());
function fgMake(lang, k) { const st = fgStore(), list = FG_START[lang], pick = list[(k === undefined ? 0 : k) % list.length]; let n = pick.n, i = 2; while (st.slots.some(s => s.name === n)) n = pick.n + " " + i++; const s = { id:"p" + Date.now().toString(36) + Math.floor(Math.random() * 1e4), name:n, lang, code:pick.c, t:Date.now() }; st.slots.push(s); return s; }
function fgOpenSlot(id) { const s = fgStore().slots.find(x => x.id === id); if (!s) return; FG.cur = id; fgStore().cur = id; persist(); fgShow(); }
function fgSay(t) { FG.said = t; const e = $("#fgSay"); if (e) e.textContent = t; }
function fgTip() { const l = fgSlot() ? fgSlot().lang : "html", a = FG_TIPS[l]; fgSay(a[(FG.t++) % a.length]); }

function fgShow() {
  const s = fgSlot(), st = fgStore(); if (!s) return;
  const L = fgLang(s.lang);
  $("#fgTabs").innerHTML = FG_LANGS.map(l => { const ok = l.test(); return '<button type="button" role="tab" class="fgtab" data-lang="' + l.id + '" aria-selected="' + (l.id === s.lang) + '"' + (ok ? "" : " disabled") + ">" + l.name + (ok ? "" : " 🔒") + "</button>"; }).join("");
  $("#fgName").value = s.name; $("#sbxIn").value = s.code;
  $("#fgStart").innerHTML = '<option value="">Start from...</option>' + FG_START[s.lang].map((x, i) => '<option value="' + i + '">' + escH(x.n) + "</option>").join("");
  $("#fgRun").hidden = false;
  $("#fgOutLabel").textContent = fgLive(s.lang) ? "Live preview" : "Output";
  $("#sbxOut").hidden = !fgLive(s.lang); $("#fgCon").hidden = fgLive(s.lang); $("#fgCon").textContent = "Press Run to see what your program does."; $("#fgCon").className = "";
  $("#sbx").dataset.lang = s.lang;
  fgList(); if (fgLive(s.lang)) fgHtml(); fgTip();
}
function fgList() {
  const st = fgStore(); const open = fgOpenLangs().map(l => l.id);
  $("#fgProj").innerHTML = st.slots.slice().sort((a, b) => b.t - a.t).map(s => '<div class="fgp' + (s.id === FG.cur ? " cur" : "") + '"><button type="button" class="fgpo" data-open="' + s.id + '"><span class="fgb fgb-' + s.lang + '">' + fgLang(s.lang).name + "</span> " + escH(s.name) + "</button>"
    + (st.slots.length > 1 ? '<button type="button" class="fgpd" data-del="' + s.id + '" aria-label="Delete ' + escH(s.name) + '">' + (FG.askDel === s.id ? "Delete?" : "✕") + "</button>" : "") + "</div>").join("");
  $("#fgNew").disabled = st.slots.length >= FG_MAX; $("#fgNew").title = st.slots.length >= FG_MAX ? "The shelf is full. Delete a project first." : "";
}
function fgHtml() { if (fgSlot() && fgSlot().lang === "css") { $("#sbxOut").srcdoc = '<!doctype html><meta charset="utf-8"><style>body{margin:12px;font:16px/1.45 system-ui,sans-serif;color:#222;background:#fff}</style><style>' + $("#sbxIn").value.replace(/<\/style/gi, "") + "</style>" + FG_CSS_PAGE; return; } $("#sbxOut").srcdoc = '<!doctype html><meta charset="utf-8"><style>body{font:16px/1.45 Georgia,serif;margin:12px;color:#1b1640}img{max-width:100%}table{border-collapse:collapse}td,th{border:1px solid #8b84b8;padding:2px 8px}</style>' + renderHTML($("#sbxIn").value); }
function fgSaved(now) { const e = $("#fgSave"); if (e) e.textContent = now ? "Saved" : "Saving..."; }
function fgSaveSoon() { const s = fgSlot(); if (!s) return; s.code = $("#sbxIn").value; s.t = Date.now(); fgSaved(false); clearTimeout(FG.saveT); FG.saveT = setTimeout(() => { persist(); fgSaved(true); }, 350); }
function fgSnd(n, a) { try { if (typeof SND !== "undefined") SND.sfx(n, a); } catch (e) {} }

function fgRun() {
  const s = fgSlot(); if (!s) return; s.code = $("#sbxIn").value; s.t = Date.now(); persist(); fgSaved(true);
  if (fgLive(s.lang)) { fgHtml(); fgSnd("ui"); return; }
  const con = $("#fgCon"); con.className = ""; con.textContent = "Running..."; fgSnd("block");
  const show = r => {
    if (fgSlot() !== s) return;
    let h = escH(r.out || ""); if (r.error) h += (h ? "\n" : "") + '<span class="fgerr">' + escH(r.error) + "</span>";
    if (!h) h = '<span class="fgdim">(The program ran and printed nothing. Use ' + (s.lang === "js" ? "console.log" : s.lang === "py" ? "print" : "cout") + " to show something.)</span>";
    con.innerHTML = h; con.className = r.error ? "bad" : "good";
    if (r.error) { fgSnd("typo"); fgSay("Read the red message. It says what went wrong, and usually which line."); } else { fgSnd("cast", { track:s.lang }); fgSay(["It ran! Change one thing and run it again.", "Good work. Try adding another line.", "That is how it is done. What will you build next?"][(FG.t++) % 3]); }
  };
  if (s.lang === "js") fgRunJs(s.code, show);
  else setTimeout(() => { let r; try { r = s.lang === "py" ? pyRun(s.code, {}) : cppRun(s.code, {}); } catch (e) { r = { out:"", error:"The Forge could not run that: " + (e && e.message) }; } show(r); }, 20);
}

function openSbx() {
  if (!forgeOpen()) return;
  const st = fgStore();
  if (!st.slots.length) { const s = fgMake(startTrack(), 0); st.cur = s.id; persist(); }
  FG.cur = st.slots.some(s => s.id === st.cur) ? st.cur : st.slots[0].id; FG.askDel = null;
  fgShow(); $("#fgPic").innerHTML = spriteSVG({ px:SPRITES.vil_smith.px, pal:SPRITES.vil_smith.pal, sc:SPRITES.vil_smith.sc });
  openSheet("#sbx"); fgSay("Welcome to my forge! Build whatever you like. I will keep it safe on the shelf.");
}

$("#sbxIn").addEventListener("input", () => { const s = fgSlot(); if (!s) return; fgSaveSoon(); if (fgLive(s.lang)) { clearTimeout(FG.ht); FG.ht = setTimeout(fgHtml, 120); } });
$("#sbxIn").addEventListener("keydown", e => {
  if (e.key === "Tab" && !e.shiftKey) { e.preventDefault(); const t = e.target, a = t.selectionStart, b = t.selectionEnd; t.value = t.value.slice(0, a) + "  " + t.value.slice(b); t.selectionStart = t.selectionEnd = a + 2; t.dispatchEvent(new Event("input")); }
  else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); fgRun(); }
});
$("#fgRun").addEventListener("click", fgRun);
$("#fgTabs").addEventListener("click", e => {
  const b = e.target.closest("[data-lang]"); if (!b || b.disabled) return; const s = fgSlot(); if (s && b.dataset.lang === s.lang) return;
  fgSnd("ui"); const st = fgStore(); let t = st.slots.filter(x => x.lang === b.dataset.lang).sort((x, y) => y.t - x.t)[0];
  if (!t) { if (st.slots.length >= FG_MAX) { toast("The shelf is full. Delete a project first."); return; } t = fgMake(b.dataset.lang, 0); }
  fgOpenSlot(t.id); const nb = $('#fgTabs [data-lang="' + t.lang + '"]'); if (nb) nb.focus();
});
$("#fgName").addEventListener("input", () => { const s = fgSlot(); if (!s) return; s.name = $("#fgName").value.trim().slice(0, 28) || "Untitled"; s.t = Date.now(); fgSaved(false); clearTimeout(FG.saveT); FG.saveT = setTimeout(() => { persist(); fgSaved(true); fgList(); }, 350); });
$("#fgStart").addEventListener("change", () => {
  const s = fgSlot(), v = $("#fgStart").value; if (!s || v === "") return; const pick = FG_START[s.lang][+v];
  s.code = pick.c; s.t = Date.now(); persist(); $("#sbxIn").value = s.code; $("#fgStart").value = ""; fgSaved(true); if (fgLive(s.lang)) fgHtml(); else { $("#fgCon").textContent = "Press Run to see what your program does."; $("#fgCon").className = ""; }
});
$("#fgNew").addEventListener("click", () => { const s = fgSlot(); if (fgStore().slots.length >= FG_MAX) return; const n = fgMake(s ? s.lang : "html", fgStore().slots.length); fgSnd("ui"); fgOpenSlot(n.id); $("#fgName").focus(); $("#fgName").select(); });
$("#fgDl").addEventListener("click", () => {
  const s = fgSlot(); if (!s) return; const a = document.createElement("a"), u = URL.createObjectURL(new Blob([$("#sbxIn").value], { type:"text/plain" }));
  a.href = u; a.download = (s.name.replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-") || "project") + "." + fgLang(s.lang).ext; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 1000);
});
$("#fgProj").addEventListener("click", e => {
  const o = e.target.closest("[data-open]"); if (o) { FG.askDel = null; fgSnd("ui"); fgOpenSlot(o.dataset.open); return; }
  const d = e.target.closest("[data-del]"); if (!d) return; const st = fgStore();
  if (FG.askDel !== d.dataset.del) { FG.askDel = d.dataset.del; fgList(); clearTimeout(FG.askT); FG.askT = setTimeout(() => { FG.askDel = null; fgList(); }, 3000); return; }
  FG.askDel = null; st.slots = st.slots.filter(x => x.id !== d.dataset.del);
  if (!st.slots.length) fgMake(startTrack(), 0);
  if (!st.slots.some(x => x.id === FG.cur)) { FG.cur = st.slots.slice().sort((a, b) => b.t - a.t)[0].id; st.cur = FG.cur; }
  persist(); fgShow();
});
$("#sClose").addEventListener("click", () => { closeSheets(); if (typeof V !== "undefined" && V.on) { document.body.style.overflow = "hidden"; vRepaint(); } });
