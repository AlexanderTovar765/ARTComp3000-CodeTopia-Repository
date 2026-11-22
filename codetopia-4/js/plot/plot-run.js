/* The Builders' Plot: turning your code into the things on your plot. HTML and CSS are read (never run as a page); JavaScript runs in
   a worker with a time limit; Python and C++ run on the Forge's own interpreters with a few plot commands added in front. */

"use strict";

const PL_PARTS = ["house", "roof", "wall", "door", "window", "sign", "chimney", "flag", "step", "annex", "path", "garden"];
const PL_GARDEN = { cols:8, rows:3 };
const plDefaultHouse = () => ({ name:"MY HOUSE", sign:"plain", note:"", windows:2, steps:0, flags:0, annex:0, picture:false, banner:false, flowerbox:false, bell:false, mail:false, stall:false, posts:0,
  st:{ house:{}, roof:{ c:"#b8554a" }, wall:{ c:"#d8c29a" }, door:{ c:"#6a4a2a" }, window:{ c:"#ffe08a" }, sign:{ c:"#7a5a38", t:"#fff4d6" }, chimney:{ c:"#8a8498" }, flag:{ c:"#ff5a7a" }, step:{ c:"#9a96a8" }, annex:{ c:"#c9b48c" }, path:{ c:"#8f89a0" }, garden:{ c:"#6a4a32" } } });
function plStore() {
  if (!D.plot || !D.plot.code) D.plot = { code:{ html:PL_START.html, css:PL_START.css, js:PL_START.js, py:PL_START.py, cpp:PL_START.cpp }, htmlM:null, cssM:null, garden:{ plants:[], water:[] }, helper:{ acts:[] }, show:{ steps:[] }, house:null };
  const p = D.plot; PL_LANGS.forEach(l => { if (typeof p.code[l.id] !== "string") p.code[l.id] = PL_START[l.id]; });
  if (!p.garden) p.garden = { plants:[], water:[] }; if (!p.helper) p.helper = { acts:[] }; if (!p.show) p.show = { steps:[] }; if (!p.house) p.house = plDefaultHouse();
  return p;
}
const plClamp = (v, a, b) => Math.max(a, Math.min(b, v));
const plStr = (s, n) => String(s || "").replace(/\s+/g, " ").trim().slice(0, n);

/* ---------- HTML: the structure of the house ---------- */
function plReadHtml(code) {
  const msgs = [], used = k => { if (!plOpen("html", k)) { if (!msgs.some(m => m.k === k)) msgs.push({ k, s:plLockMsg("html", k) }); return false; } return true; };
  let doc; try { doc = new DOMParser().parseFromString(code, "text/html"); } catch (e) { return { m:null, msgs:[{ k:"err", s:"That HTML could not be read." }] }; }
  const q = sel => Array.from(doc.body.querySelectorAll(sel)), m = {};
  const h = doc.body.querySelector("h1,h2,h3"); m.name = h ? plStr(h.textContent, 14).toUpperCase() : "MY HOUSE";
  const p = doc.body.querySelector("p"); m.note = p && used("p") ? plStr(p.textContent, 26) : "";
  const em = h && h.querySelector("strong,em,mark") || null, emTag = em ? em.tagName.toLowerCase() : (doc.body.querySelector("strong,em,mark") ? doc.body.querySelector("strong,em,mark").tagName.toLowerCase() : "");
  m.sign = emTag && used("strong") ? emTag : "plain";
  m.windows = q("ul > li").length ? (used("ul") ? plClamp(q("ul > li").length, 0, 4) : 1) : 1; if (!q("ul > li").length && !doc.body.textContent.trim()) m.windows = 0;
  m.steps = q("ol > li").length && used("ol") ? plClamp(q("ol > li").length, 0, 4) : 0;
  m.flags = q("a").length && used("a") ? plClamp(q("a").length, 0, 3) : 0;
  m.annex = q("div").length && used("div") ? plClamp(q("div").length, 0, 2) : 0;
  m.picture = !!q("img").length && used("img"); m.banner = !!q("header").length && used("header"); m.flowerbox = !!q("footer").length && used("header");
  m.posts = q("nav").length && used("nav") ? 1 : 0; m.bell = !!q("button").length && used("button"); m.mail = !!q("form").length && used("form"); m.stall = !!q("table").length && used("table");
  if (!h) msgs.push({ k:"h1", s:"Add an <h1> and its text will hang above your door as the house sign.", soft:true });
  return { m, msgs };
}

/* ---------- CSS: the paint, read from a real (sandboxed, invisible) page so every selector and unit works ---------- */
function plCssKey(prop, val) {
  if (prop === "color") return "color"; if (prop === "background-color") return "background-color";
  if (prop === "background" || prop === "background-image") return /gradient/.test(val) ? "gradient" : "background-color";
  if (/^border-(top|right|bottom|left)?-?(color|width|style)?$/.test(prop) && !/radius/.test(prop)) return "border"; if (/radius/.test(prop)) return "border-radius";
  if (/^(min-|max-)?(width|height)$/.test(prop)) return "width"; if (prop === "display") return "display"; if (prop === "opacity") return "opacity";
  if (prop === "box-shadow") return "box-shadow"; if (prop === "transform") return "transform"; return null;
}
function plCleanCss(code) {
  const msgs = [], seen = {}; let out = "";
  code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/@[^{;]*[;{]/g, " ").replace(/([^{}]+)\{([^{}]*)\}/g, (all, sel, body) => {
    const keep = []; body.split(";").forEach(d => { const i = d.indexOf(":"); if (i < 0) return; const prop = d.slice(0, i).trim().toLowerCase(), val = d.slice(i + 1).trim();
      if (!prop || /url\s*\(|expression|javascript:|@import/i.test(val)) return; const k = plCssKey(prop, val);
      if (k && !plOpen("css", k)) { if (!seen[k]) { seen[k] = 1; msgs.push({ k, s:plLockMsg("css", k) }); } return; } keep.push(prop + ":" + val); });
    out += sel.trim() + "{" + keep.join(";") + "}\n"; return all; });
  return { css:out, msgs };
}
const PL_CSS_BASE = PL_PARTS.map(p => "." + p).join(",") + "{display:block;box-sizing:border-box;width:100px;height:100px;color:rgb(1,2,3);background:none;opacity:1;border:0 solid transparent;box-shadow:none;transform:none}";
function plReadCss(code) {
  return new Promise(res => {
    const { css, msgs } = plCleanCss(code), f = document.createElement("iframe");
    f.setAttribute("sandbox", "allow-same-origin"); f.setAttribute("aria-hidden", "true"); f.style.cssText = "position:fixed;left:-9999px;top:0;width:400px;height:400px;visibility:hidden;border:0";
    let done = false; const finish = r => { if (done) return; done = true; clearTimeout(tm); f.remove(); res(r); };
    const tm = setTimeout(() => finish({ m:{}, msgs:msgs.concat([{ k:"err", s:"The paint took too long to read." }]) }), 2500);
    f.onload = () => { try {
      const d = f.contentDocument, m = {};
      PL_PARTS.forEach(part => { const el = d.querySelector("." + part); if (!el) return; const cs = d.defaultView.getComputedStyle(el), o = {};
        if (cs.display === "none") o.hide = true;
        const bg = cs.backgroundColor; if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) o.c = bg;
        const gi = cs.backgroundImage; if (gi && /gradient/.test(gi)) { const cols = gi.match(/rgba?\([^)]*\)/g); if (cols && cols.length > 1) { o.c = cols[0]; o.c2 = cols[cols.length - 1]; } else if (cols) o.c = cols[0]; }
        if (cs.color !== "rgb(1, 2, 3)") o.t = cs.color;
        const bw = parseFloat(cs.borderTopWidth) || 0; if (bw > 0 && cs.borderTopStyle !== "none") { o.bw = plClamp(Math.round(bw), 1, 4); o.bc = cs.borderTopColor; }
        const r = parseFloat(cs.borderTopLeftRadius) || 0; if (r > 0) o.r = plClamp(r / 50, 0, 1);
        const op = parseFloat(cs.opacity); if (op < 1) o.o = plClamp(op, 0, 1);
        const sh = cs.boxShadow; if (sh && sh !== "none") { const c = sh.match(/rgba?\([^)]*\)/); if (c) o.glow = c[0]; }
        const w = parseFloat(cs.width) / 100, h = parseFloat(cs.height) / 100; if (isFinite(w) && Math.abs(w - 1) > .01) o.sx = plClamp(w, .3, 2); if (isFinite(h) && Math.abs(h - 1) > .01) o.sy = plClamp(h, .3, 2);
        const tf = cs.transform; if (tf && tf !== "none") { const mm = tf.match(/matrix\(([^)]*)\)/); if (mm) { const [a, b2] = mm[1].split(",").map(Number); const sc = Math.hypot(a, b2); if (isFinite(sc) && Math.abs(sc - 1) > .01) { o.sx = (o.sx || 1) * plClamp(sc, .4, 1.8); o.sy = (o.sy || 1) * plClamp(sc, .4, 1.8); } const rot = Math.atan2(b2, a); if (isFinite(rot) && Math.abs(rot) > .01) o.rot = plClamp(rot, -.7, .7); } }
        if (Object.keys(o).length) m[part] = o; });
      finish({ m, msgs }); } catch (e) { finish({ m:{}, msgs:msgs.concat([{ k:"err", s:"The paint could not be read." }]) }); } };
    f.srcdoc = '<!doctype html><meta charset="utf-8"><style>*{margin:0}' + PL_CSS_BASE + "</style><style>" + css.replace(/<\/?style/gi, "") + "</style><body>" + PL_PARTS.map(p => '<div class="' + p + '"></div>').join("") + "</body>";
    document.body.appendChild(f);
  });
}
/* combine the HTML and CSS reads into the house the plot draws */
function plBuildHouse() {
  const P = plStore(), H = plDefaultHouse(), hm = P.htmlM || {}, cm = P.cssM || {};
  Object.keys(hm).forEach(k => { H[k] = hm[k]; }); PL_PARTS.forEach(p => { H.st[p] = Object.assign({}, H.st[p] || {}, cm[p] || {}); });
  P.house = H; return H;
}

/* ---------- JavaScript: the helper's routine ---------- */
function plRunJsHelper(code, done) {
  const names = ["say", "wait", "wave", "walk", "jump", "spin", "dance", "heart"];
  const src = "const out=[];const post=o=>{if(out.length<160){out.push(o);postMessage({t:'act',o});}};"
    + "const say=t=>post({k:'say',t:String(t).slice(0,48)}),wait=s=>post({k:'wait',s:Math.min(8,Math.max(0,+s||0))}),wave=()=>post({k:'wave'}),walk=(d,n)=>post({k:'walk',d:String(d).toLowerCase(),n:Math.min(24,Math.max(0,n===undefined?1:+n||0))}),jump=()=>post({k:'jump'}),spin=()=>post({k:'spin'}),dance=()=>post({k:'dance'}),heart=()=>post({k:'heart'});"
    + "const console={log:(...a)=>postMessage({t:'log',s:a.map(x=>typeof x==='object'?JSON.stringify(x):String(x)).join(' ').slice(0,300)})};"
    + "onmessage=e=>{try{new Function('say','wait','wave','walk','jump','spin','dance','heart','console',e.data)(say,wait,wave,walk,jump,spin,dance,heart,console);}catch(err){postMessage({t:'err',s:err.name+': '+err.message});}postMessage({t:'done'});};";
  let w, url, fin = false; const acts = [], lines = [], msgs = []; let err = null;
  const finish = timeout => { if (fin) return; fin = true; clearTimeout(tm); try { w.terminate(); } catch (e) {} try { URL.revokeObjectURL(url); } catch (e) {}
    if (timeout) err = "Your code ran for too long, so it was stopped. Check for a loop that never ends."; done({ acts, out:lines.join("\n"), msgs, error:err }); };
  try { url = URL.createObjectURL(new Blob([src], { type:"text/javascript" })); w = new Worker(url); } catch (e) { done({ acts:[], out:"", msgs:[], error:"This browser cannot run JavaScript here." }); return; }
  const tm = setTimeout(() => finish(true), 2500);
  w.onmessage = e => { const m = e.data;
    if (m.t === "act") { if (!plOpen("js", m.o.k)) { if (!msgs.some(x => x.k === m.o.k)) msgs.push({ k:m.o.k, s:plLockMsg("js", m.o.k) }); } else acts.push(m.o); }
    else if (m.t === "log") { if (lines.length < 100) lines.push(m.s); } else if (m.t === "err") err = m.s; else if (m.t === "done") finish(false); };
  w.onerror = e => { err = e.message || "Error"; e.preventDefault(); finish(false); };
  w.postMessage(code);
}

/* ---------- Python and C++: run the interpreter with plot commands defined first, then read the @@ lines ---------- */
const PL_PY_PRE = 'def plant(kind, col, row): print("@@plant", kind, col, row)\ndef water(col, row): print("@@water", col, row)\n';
const PL_CPP_PRE = '#include <iostream>\n#include <string>\nusing namespace std;\nvoid launch(string color, int x) { cout << "@@launch " << color << " " << x << endl; }\nvoid pause(int ms) { cout << "@@pause " << ms << endl; }\n';
const plPre = s => (s.match(/\n/g) || []).length;
function plRunInterp(lang, code) {
  const pre = lang === "py" ? PL_PY_PRE : PL_CPP_PRE; let r; try { r = lang === "py" ? pyRun(pre + code, {}) : cppRun(pre + code, {}); } catch (e) { r = { out:"", error:"Could not run that: " + (e && e.message) }; }
  const off = plPre(pre), lines = String(r.out || "").split("\n"), plain = [], cmds = [];
  lines.forEach(l => { if (l.startsWith("@@")) cmds.push(l.slice(2).trim().split(/\s+/)); else plain.push(l); });
  const error = r.error ? String(r.error).replace(/line (\d+)/gi, (a, n) => "line " + Math.max(1, +n - off)) : null;
  return { cmds, out:plain.join("\n").replace(/\n+$/, ""), error };
}
function plReadGarden(cmds) {
  const plants = [], wat = [], msgs = [], note = (k, s) => { if (!msgs.some(m => m.k === k)) msgs.push({ k, s }); };
  cmds.forEach(c => {
    if (c[0] === "plant") { const kind = String(c[1] || "").toLowerCase(), col = parseInt(c[2], 10), row = parseInt(c[3], 10);
      if (!PL_UNLOCK.py[kind] || kind === "water") { note("kind" + kind, "There is no plant called “" + kind + "”. Try " + Object.keys(PL_UNLOCK.py).filter(k => k !== "water").join(", ") + "."); return; }
      if (!plOpen("py", kind)) { note(kind, plLockMsg("py", kind)); return; }
      if (!(col >= 0 && col < PL_GARDEN.cols && row >= 0 && row < PL_GARDEN.rows)) { note("range", "The garden has columns 0 to " + (PL_GARDEN.cols - 1) + " and rows 0 to " + (PL_GARDEN.rows - 1) + "."); return; }
      const at = plants.findIndex(p => p.col === col && p.row === row); if (at >= 0) plants.splice(at, 1); if (plants.length < 24) plants.push({ kind, col, row }); }
    else if (c[0] === "water") { if (!plOpen("py", "water")) { note("water", plLockMsg("py", "water")); return; } const col = parseInt(c[1], 10), row = parseInt(c[2], 10); if (col >= 0 && col < PL_GARDEN.cols && row >= 0 && row < PL_GARDEN.rows && wat.length < 24) wat.push({ col, row }); }
  });
  return { plants, water:wat, msgs };
}
const PL_COLORS = { red:"#ff4d5e", gold:"#ffd23f", blue:"#4da3ff", green:"#5cf08c", violet:"#b57bff", pink:"#ff8ad0", white:"#ffffff" };
function plReadShow(cmds) {
  const steps = [], msgs = [], note = (k, s) => { if (!msgs.some(m => m.k === k)) msgs.push({ k, s }); };
  cmds.forEach(c => {
    if (c[0] === "launch") { const col = String(c[1] || "").toLowerCase(), x = parseInt(c[2], 10);
      if (!PL_COLORS[col]) { note("c" + col, "There is no firework colour “" + col + "”. Try " + Object.keys(PL_COLORS).join(", ") + "."); return; }
      if (!plOpen("cpp", col)) { note(col, plLockMsg("cpp", col)); return; }
      if (steps.length < 80) steps.push({ k:"launch", color:col, x:plClamp(isFinite(x) ? x : 4, 0, 9) }); }
    else if (c[0] === "pause") { if (!plOpen("cpp", "pause")) { note("pause", plLockMsg("cpp", "pause")); return; } if (steps.length < 80) steps.push({ k:"pause", ms:plClamp(parseInt(c[1], 10) || 0, 0, 5000) }); }
  });
  return { steps, msgs };
}

/* run one language and store what it made; resolves { out, msgs, error } */
function plRunLang(lang) {
  const P = plStore(), code = P.code[lang];
  return new Promise(res => {
    const fin = (r) => { persist(); if (typeof plChanged === "function") plChanged(lang); res(r); };
    if (lang === "html") { const r = plReadHtml(code); P.htmlM = r.m; plBuildHouse(); fin({ out:"", msgs:r.msgs, error:null }); }
    else if (lang === "css") plReadCss(code).then(r => { P.cssM = r.m; plBuildHouse(); fin({ out:"", msgs:r.msgs, error:null }); });
    else if (lang === "js") plRunJsHelper(code, r => { P.helper = { acts:r.acts }; fin({ out:r.out, msgs:r.msgs, error:r.error }); });
    else if (lang === "py") { const r = plRunInterp("py", code), g = plReadGarden(r.cmds); if (!r.error) P.garden = { plants:g.plants, water:g.water }; fin({ out:r.out, msgs:g.msgs, error:r.error }); }
    else { const r = plRunInterp("cpp", code), s = plReadShow(r.cmds); if (!r.error) P.show = { steps:s.steps }; fin({ out:r.out, msgs:s.msgs, error:r.error }); }
  });
}
