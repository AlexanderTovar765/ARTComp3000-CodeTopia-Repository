/* Background music: a small step sequencer plays themes written as chord progressions plus a seeded melody. A director picks the theme from whatever is on screen. */

"use strict";

const MUSIC = (() => {
  const SC = { major:[0,2,4,5,7,9,11], minor:[0,2,3,5,7,8,10], dorian:[0,2,3,5,7,9,10], mixo:[0,2,4,5,7,9,10], phryg:[0,1,3,5,7,8,10], lydian:[0,2,4,6,7,9,11], harm:[0,2,3,5,7,8,11], pent:[0,2,4,7,9], mpent:[0,3,5,7,10] };
  const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const DR = {
    heart:{ k:[0, 3], kv:.1 }, soft:{ k:[0, 8], kv:.12, h:[4, 12] }, folk:{ k:[0, 8], kv:.14, s:[4, 12], sv:.035, h:[2, 6, 10, 14] },
    march:{ k:[0, 6, 8], kv:.18, s:[4, 12], sv:.06, h:[2, 6, 10, 14] }, drive:{ k:[0, 4, 8, 12], kv:.2, s:[4, 12], sv:.08, h:[2, 6, 10, 14], hv:.025 },
    boss:{ k:[0, 3, 4, 8, 10, 12], kv:.22, s:[4, 12, 15], sv:.09, h:[0, 2, 4, 6, 8, 10, 12, 14], hv:.025, t:[14, 15], tv:.1 }, taiko:{ t:[0, 6, 8, 11], tv:.16, k:[0], kv:.1 },
    forge:{ k:[0, 8], kv:.16, c:[4, 6, 12, 14], cv:.05 },
    creep:{ k:[0, 6, 10], kv:.15, s:[12], sv:.05, h:[2, 6, 10, 14], hv:.02, t:[14, 15], tv:.07 },
    epic:{ k:[0, 8, 10], kv:.3, s:[4, 12], sv:.1, t:[0, 3, 6, 8, 11, 14], tv:.2, h:[2, 6, 10, 14], hv:.02 }
  };
  const T = {
    title:{ bpm:88, root:62, mode:"lydian", prog:[0,4,5,1,0,4,1,4], seed:11, dens:.42, lead:"bell", pad:1, bass:"root", arp:{ inst:"pluck", rate:2, vol:.022 } },
    "story-peace":{ bpm:76, root:60, mode:"major", prog:[0,5,3,4,0,5,3,4], seed:5, dens:.38, lead:"flute", pad:1, bass:"root", arp:{ inst:"pluck", rate:4, vol:.02 } },
    "story-dread":{ bpm:66, root:55, mode:"minor", prog:[0,0,5,4,0,0,5,6], seed:21, dens:.2, lead:"bell", loct:-12, pad:1.3, bass:"drone", drums:"heart" },
    "story-war":{ bpm:104, root:52, mode:"minor", prog:[0,5,6,4,0,5,6,4], seed:33, dens:.5, lead:"brass", pad:1, bass:"drive", drums:"taiko" },
    "story-hope":{ bpm:84, root:57, mode:"major", prog:[0,4,5,3,0,4,3,4], seed:8, dens:.5, lead:"flute", pad:1.2, bass:"root", arp:{ inst:"pluck", rate:2, vol:.03 }, drums:"soft" },
    epic:{ bpm:112, root:45, mode:"harm", prog:[0,5,6,4,0,5,3,4], seed:77, dens:.58, lead:"brass", pad:1.5, bass:"drive", drums:"epic", arp:{ inst:"bell", rate:4, vol:.04 }, epic:true },
    dread:{ bpm:56, root:45, mode:"phryg", prog:[0,0,1,0,0,5,1,0], seed:3, dens:.16, lead:"bell", pad:1.4, bass:"drone", drums:"heart" },
    dawn:{ bpm:66, root:55, mode:"major", prog:[0,4,5,3,0,4,3,4], seed:14, dens:.4, lead:"flute", pad:1.3, bass:"root", arp:{ inst:"pluck", rate:4, vol:.025 } },
    mentor:{ bpm:80, root:57, mode:"dorian", prog:[0,3,0,4,0,3,6,4], seed:17, dens:.4, lead:"pluck", pad:1, bass:"root" },
    mansion:{ bpm:128, root:40, mode:"phryg", prog:[0,0,1,0,5,0,1,6], seed:88, dens:.45, lead:"square", pad:.7, bass:"pulse", drums:"drive", arp:{ inst:"square", rate:2, vol:.03, dir:"updown" } },
    "mansion-title":{ bpm:112, root:40, mode:"harm", prog:[0,5,6,4,0,5,1,4], seed:91, dens:.5, lead:"brass", pad:.9, bass:"drive", drums:"boss", arp:{ inst:"square", rate:2, vol:.03, dir:"updown" } },
    storm:{ bpm:58, root:43, mode:"minor", prog:[0,0,5,0,0,0,6,5], seed:9, dens:.12, lead:"bell", loct:12, pad:1.4, bass:"drone" },
    sq:{ bpm:104, root:60, mode:"major", mel:"pent", prog:[0,3,4,0,5,3,4,4], seed:4, dens:.5, lead:"pluck", pad:.8, bass:"bounce", drums:"folk" },
    css:{ bpm:108, root:64, mode:"major", mel:"pent", prog:[0,5,3,4,0,5,4,0], seed:7, dens:.5, lead:"marimba", pad:.8, bass:"bounce", drums:"folk" },
    html:{ bpm:112, root:62, mode:"major", mel:"pent", prog:[0,4,5,3,0,4,3,4], seed:6, dens:.55, lead:"marimba", pad:.7, bass:"bounce", drums:"folk" },
    cpp:{ bpm:76, root:50, mode:"minor", mel:"mpent", prog:[0,5,2,6,0,5,3,4], seed:12, dens:.3, lead:"bell", pad:1.2, bass:"root", drums:"heart" },
    js:{ bpm:122, root:59, mode:"mixo", mel:"pent", prog:[0,6,3,0,0,6,3,4], seed:15, dens:.55, lead:"square", pad:.7, bass:"pulse", drums:"march" },
    py:{ bpm:94, root:57, mode:"dorian", prog:[0,3,6,4,0,3,6,4], seed:19, dens:.4, lead:"bell", pad:1, bass:"root", arp:{ inst:"bell", rate:2, vol:.026, dir:"updown" } },
    map:{ bpm:112, root:60, mode:"mixo", mel:"pent", prog:[0,6,3,0,0,6,3,4], seed:23, dens:.55, lead:"pluck", pad:.8, bass:"walk", drums:"folk" },
    "battle-html":{ bpm:132, root:62, mode:"mixo", prog:[0,6,3,4,0,6,3,5], seed:31, dens:.6, lead:"square", pad:.6, bass:"pulse", drums:"drive" },
    "battle-css":{ bpm:130, root:64, mode:"mixo", prog:[0,3,6,4,0,3,6,5], seed:33, dens:.58, lead:"pluck", pad:.6, bass:"pulse", drums:"drive", arp:{ inst:"marimba", rate:2, vol:.024 } },
    "battle-cpp":{ bpm:126, root:52, mode:"minor", prog:[0,0,5,6,0,0,3,4], seed:32, dens:.45, lead:"brass", pad:.7, bass:"drive", drums:"drive" },
    "battle-js":{ bpm:140, root:59, mode:"dorian", prog:[0,3,0,6,0,3,4,6], seed:34, dens:.6, lead:"pluck", pad:.6, bass:"pulse", drums:"drive", arp:{ inst:"square", rate:2, vol:.025 } },
    "battle-py":{ bpm:128, root:57, mode:"dorian", prog:[0,6,3,4,0,6,5,4], seed:35, dens:.55, lead:"bell", pad:.7, bass:"pulse", drums:"drive", arp:{ inst:"pluck", rate:2, vol:.03 } },
    boss:{ bpm:148, root:50, mode:"harm", prog:[0,0,5,4,0,0,5,6], seed:40, dens:.6, lead:"brass", pad:.9, bass:"drive", drums:"boss" },
    finale1:{ bpm:138, root:45, mode:"harm", prog:[0,5,3,4,0,5,6,4], seed:41, dens:.6, lead:"brass", pad:1.1, bass:"drive", drums:"boss", arp:{ inst:"bell", rate:4, vol:.03 } },
    finale2:{ bpm:160, root:45, mode:"harm", prog:[0,0,5,4,0,6,5,4], seed:42, dens:.7, lead:"brass", pad:1.2, bass:"drive", drums:"boss", arp:{ inst:"square", rate:2, vol:.03 } },
    victory:{ bpm:100, root:60, mode:"major", prog:[0,3,4,0], seed:50, dens:.55, lead:"pluck", pad:1, bass:"root" },
    defeat:{ bpm:52, root:48, mode:"minor", prog:[0,5,3,4], seed:51, dens:.14, lead:"bell", pad:1.3, bass:"drone" },
    tower:{ bpm:138, root:55, mode:"minor", prog:[0,0,5,6,0,0,3,4], seed:60, dens:.4, lead:"brass", pad:.6, bass:"drive", drums:"drive", arp:{ inst:"square", rate:2, vol:.03 } },
    "tower-urgent":{ bpm:162, root:55, mode:"harm", prog:[0,0,5,6,0,0,3,4], seed:61, dens:.5, lead:"brass", pad:.6, bass:"drive", drums:"boss", arp:{ inst:"square", rate:2, vol:.035 } },
    shop:{ bpm:116, root:60, mode:"major", mel:"pent", prog:[0,3,5,4,0,3,4,0], seed:70, dens:.6, lead:"marimba", pad:.6, bass:"bounce", drums:"folk" },
    library:{ bpm:62, root:57, mode:"dorian", prog:[0,3,0,4,0,3,6,4], seed:71, dens:.35, lead:"piano", pad:.7, bass:"drone", arp:{ inst:"piano", rate:4, vol:.03 } },
    forge:{ bpm:92, root:48, mode:"minor", prog:[0,0,5,6,0,0,3,4], seed:72, dens:.25, lead:"brass", loct:-12, pad:.7, bass:"pulse", drums:"forge" }
  };
  const semi = (sc, d) => sc[((d % sc.length) + sc.length) % sc.length] + 12 * Math.floor(d / sc.length);

  function melody(th) {
    const r = rng(th.seed), scale = SC[th.mel || th.mode], parent = SC[th.mode], bars = th.prog.length, L = bars * 16, out = new Array(L).fill(null);
    const pool = []; for (let o = 0; o < 3; o++) scale.forEach(x => pool.push(x + 12 * o));
    let idx = Math.floor(pool.length * .45);
    const gen = (b0, b1) => { for (let b = b0; b < b1; b++) {
      const rt = th.prog[b], ch = [0, 2, 4].map(i => semi(parent, rt + i) % 12);
      for (let s = 0; s < 16; s++) { const strong = s % 4 === 0, p = strong ? Math.min(1, th.dens + .3) : s % 2 === 0 ? th.dens : th.dens * .4; if (b === b1 - 1 && s > 12) continue; if (r() > p) continue;
        if (strong) { let best = idx, bd = 99; for (let j = Math.max(0, idx - 4); j <= Math.min(pool.length - 1, idx + 4); j++) if (ch.includes(pool[j] % 12)) { const d = Math.abs(j - idx) + r() * 1.5; if (d < bd) { bd = d; best = j; } } idx = best; }
        else { const st = r() < .55 ? 1 : r() < .7 ? 2 : 0; idx = Math.max(2, Math.min(pool.length - 3, idx + (r() < .5 ? -1 : 1) * st)); if (r() < .06) idx += r() < .5 ? 3 : -3; idx = Math.max(2, Math.min(pool.length - 3, idx)); }
        out[b * 16 + s] = { m:pool[idx], len:strong ? (r() < .4 ? 6 : 3) : 2 }; } } };
    if (bars >= 8) { gen(0, bars / 2); for (let i = 0; i < L / 2; i++) out[L / 2 + i] = out[i]; gen(bars - 2, bars); idx = Math.floor(pool.length * .45); }
    else gen(0, bars);
    return out;
  }

  /* instruments */
  const ST = SND;
  function inst(name, f, t, d, v, bus) {
    const o = { f, t, dur:d, vol:v, bus };
    if (name === "bell") ST.bellAt(f, t, v * 1.4, Math.max(1, d), bus);
    else if (name === "pluck") ST.tone({ ...o, dur:Math.min(d, .5), type:"sawtooth", lp:Math.min(8000, f * 7), lp2:f * 1.4, vol:v * 1.1 });
    else if (name === "square") ST.tone({ ...o, dur:Math.min(d, .4), type:"square", lp:2400, lp2:900, vol:v * .8 });
    else if (name === "flute") { ST.tone({ ...o, dur:Math.max(.4, d), a:.07, vol:v * 1.5 }); ST.tone({ f:f * 2, t, dur:Math.max(.3, d * .7), a:.09, vol:v * .25, bus }); }
    else if (name === "marimba") { ST.tone({ ...o, dur:.35, vol:v * 1.6 }); ST.tone({ f:f * 4, t, dur:.08, vol:v * .6, bus }); }
    else if (name === "piano") { ST.tone({ ...o, dur:Math.max(1, d), type:"triangle", vol:v * 1.5 }); ST.tone({ f:f * 2, t, dur:.5, vol:v * .5, bus }); ST.tone({ f:f * 3, t, dur:.2, vol:v * .25, bus }); }
    else if (name === "brass") ST.tone({ ...o, dur:Math.max(.25, d), a:.05, type:"sawtooth", lp:900, lp2:2600, vol:v * .9 });
  }
  function pad(chord, t, d, v, bus) { chord.forEach(f => { ST.tone({ f, t, dur:d, a:Math.min(.9, d * .4), type:"triangle", vol:v, bus, det:-6 }); ST.tone({ f, t, dur:d, a:Math.min(.9, d * .4), type:"sawtooth", vol:v * .35, bus, det:7, lp:700 }); }); }
  function drum(kind, t, v, bus) {
    if (kind === "k") { ST.tone({ f:140, slide:42, t, dur:.18, vol:v, bus }); }
    else if (kind === "s") { ST.noise({ type:"bandpass", f:1800, q:.8, t, dur:.14, vol:v * 2, bus }); ST.tone({ f:190, slide:120, t, dur:.09, vol:v, type:"triangle", bus }); }
    else if (kind === "h") ST.noise({ type:"highpass", f:7000, t, dur:.04, vol:v, bus });
    else if (kind === "t") ST.tone({ f:105, slide:62, t, dur:.3, vol:v, bus });
    else if (kind === "c") { ST.tone({ f:1700, t, dur:.2, type:"triangle", vol:v, bus }); ST.tone({ f:2650, t, dur:.1, type:"square", vol:v * .4, bus, lp:5000 }); ST.noise({ type:"highpass", f:4000, t, dur:.03, vol:v * .6, bus }); }
  }

  /* playing */
  let P = null, timer = 0;
  function build(name, tr, tm) {
    const th = Object.assign({}, T[name]); th.root += tr || 0; th.bpm = Math.round(th.bpm * (tm || 1)); th.mdl = melody(th); th.name = name; return th;
  }
  function step(p, n, t) {
    const th = p.th, L = th.prog.length * 16, i = n % L, bar = Math.floor(i / 16), s = i % 16, rt = th.prog[bar], sd = 60 / th.bpm / 4, bus = p.out, parent = SC[th.mode];
    const chord = [0, 2, 4].map(k => th.root - 12 + semi(parent, rt + k)), mm = x => ST.hz(x);
    if (s === 0 && th.pad) pad(chord.map(mm), t, sd * 16 * .98, .034 * th.pad, bus);
    const rootM = th.root - 24 + semi(parent, rt), bv = .1;
    switch (th.bass) {
      case "root": if (s === 0 || s === 10) inst("pluck", mm(rootM), t, sd * 6, bv * .7, bus); break;
      case "drone": if (s === 0) ST.tone({ f:mm(rootM), t, dur:sd * 16, a:.6, vol:bv * .9, bus }); break;
      case "pulse": if (s % 2 === 0) inst("pluck", mm(rootM + (s % 8 === 6 ? 12 : 0)), t, sd * 2, bv * .75, bus); break;
      case "walk": if (s % 4 === 0) inst("pluck", mm(rootM + [0, 7, 4, 7][s / 4]), t, sd * 3, bv * .8, bus); break;
      case "bounce": if (s === 0 || s === 8) inst("pluck", mm(rootM), t, sd * 3, bv * .8, bus); else if (s === 6 || s === 14) inst("pluck", mm(rootM + 7), t, sd * 2, bv * .6, bus); break;
      case "drive": if (s % 2 === 0) inst("pluck", mm(rootM + (s === 6 || s === 14 ? 7 : 0)), t, sd * 1.6, bv * (s % 4 === 0 ? .85 : .6), bus); break;
    }
    if (th.arp && s % th.arp.rate === 0) { const k = s / th.arp.rate, seq = th.arp.dir === "updown" ? [0, 1, 2, 3, 2, 1] : [0, 1, 2, 3], j = seq[k % seq.length], tone = j === 3 ? semi(parent, rt) + 12 : semi(parent, rt + j * 2);
      inst(th.arp.inst, mm(th.root + 12 + tone), t, sd * 2, th.arp.vol, bus); }
    if (th.epic) {
      if (s === 0 && bar % 4 === 0) { ST.noise({ type:"highpass", f:5500, t, dur:1.5, vol:.07, bus }); ST.tone({ f:58, slide:34, t, dur:.9, vol:.28, bus }); }
      if (s === 0) pad(chord.map(x => mm(x + 12)), t, sd * 16 * .98, .02, bus);
      if (bar % 4 === 3 && s >= 8) drum("s", t, .03 + (s - 8) * .014, bus);
      if (th.mdl[i]) { const q = th.mdl[i]; inst("brass", mm(th.root + (th.loct || 0) + q.m), t, sd * q.len, .05, bus); inst("brass", mm(th.root + 19 + q.m), t, sd * q.len, .025, bus); }
    }
    const nt = th.mdl[i]; if (nt) inst(th.lead, mm(th.root + 12 + (th.loct || 0) + nt.m), t, sd * nt.len, .07, bus);
    const dr = th.drums && DR[th.drums]; if (dr) { ["k", "s", "h", "t", "c"].forEach(k => { if (dr[k] && dr[k].includes(s)) drum(k, t, dr[k + "v"] || (k === "h" ? .02 : .08), bus); }); }
  }
  function tick() {
    const c = ST.ctx; if (!c || !P || c.state !== "running" || !ST.allOn()) return;
    if (P.next < c.currentTime - .3) P.next = c.currentTime + .05;
    for (let k = 0; k < 24 && P.next < c.currentTime + .2; k++) { step(P, P.n, P.next); P.n++; P.next += 60 / P.th.bpm / 4; }
  }
  function play(name, tr, tm) {
    const c = ST.init(); if (!c) return; const t = c.currentTime;
    if (P) { const old = P; old.out.gain.cancelScheduledValues(t); old.out.gain.setValueAtTime(old.out.gain.value, t); old.out.gain.linearRampToValueAtTime(0, t + 1); setTimeout(() => { try { old.out.disconnect(); } catch (e) {} }, 1300); }
    P = null; if (!name || !T[name]) return;
    const out = c.createGain(); out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(.8, t + 1.2); out.connect(ST.musicBus);
    P = { th:build(name, tr, tm), out, n:0, next:t + .12 }; if (!timer) timer = setInterval(tick, 40);
  }

  /* the director: which theme fits what is on screen */
  const $id = id => document.getElementById(id);
  const vis = e => !!e && !e.hidden && e.getClientRects().length > 0;
  const TRKSHIFT = { html:0, css:1, cpp:-3, js:2, py:-2 };
  function mood() {
    const cine = $id("cine"), tw = $id("tower");
    if (vis($id("mTitle"))) return ["mansion-title"]; if (vis($id("mRide"))) return ["mansion"];
    if (vis(cine)) { const bg = $id("cineBg").dataset.bg || ""; if (bg === "road" || bg === "manor") return ["mansion"]; return cine.classList.contains("dread") || bg === "tower" || bg === "ruins" ? ["epic"] : bg === "dawn" || bg === "black" ? ["dawn"] : ["mentor"]; }
    const sty = $id("story"); if (vis(sty) && typeof st !== "undefined") { const i = st.i; return i <= 1 ? ["story-peace"] : i === 2 ? ["story-dread"] : i <= 4 ? ["story-war"] : ["story-hope"]; }
    if (vis($id("intro"))) return ["title"];
    if (vis(tw)) return [tw.classList.contains("urgent") ? "tower-urgent" : "tower"];
    const sheetOf = id => vis($id(id));
    if (sheetOf("unl") || sheetOf("chr")) return ["shop"];
    if (sheetOf("book")) return ["library"];
    if (sheetOf("sbx")) return ["forge"];
    if (sheetOf("map")) return ["map", typeof TRK !== "undefined" ? TRKSHIFT[TRK.id] || 0 : 0];
    if (typeof V !== "undefined" && V.on) { if (V.scene === "manor") return ["mansion"]; const vst = V.scene === "css" ? 4 : V.st; if (vst === 0) return ["storm"]; const sc = V.scene || "sq", bright = vst >= 4; return [T[sc] ? sc : "sq", bright ? 2 : 0, bright ? 1.06 : 1]; }
    if (typeof started !== "undefined" && started && typeof S !== "undefined") {
      const ov = $id("overlay"); if (vis(ov)) { const h = ov.textContent; if ($id("card").querySelector(".stars")) return ["victory"]; if (/crashed/i.test(h)) return ["defeat"]; }
      const f = FOE(), lv = LV();
      if (f.finale) return [S.ruin ? "finale2" : "finale1"];
      if (f.boss || lv.arena) return ["boss"];
      return ["battle-" + TRK.id];
    }
    return ["map"];
  }
  function ambience() {
    if (typeof V === "undefined" || !V.on || vis($id("cine"))) return null;
    if (vis($id("map")) || vis($id("unl")) || vis($id("book")) || vis($id("sbx")) || vis($id("tower"))) return null;
    if (V.scene === "manor") return "storm"; if (V.scene === "css") return "day"; if (V.st === 0) return "storm"; if (V.scene === "cpp") return "forest";
    return V.scene === "sq" ? (V.st >= 4 ? "square-day" : "square") : V.st >= 4 ? "day" : "night";
  }
  let cur = "";
  function direct() {
    if (!ST.ready) return;
    const m = mood(), key = m ? m.join("|") : ""; if (key !== cur) { cur = key; play(m && m[0], m && m[1], m && m[2]); }
    const a = ambience(); ST.setAmb(a);
    if (a && a.startsWith("square") && typeof V !== "undefined" && V.sc) ST.fountain(Math.hypot(V.x - 280, V.y - 214)); else ST.fountain(999);
    const talking = (vis($id("vBub")) && V.on) || vis($id("mission")); ST.setDuck(talking ? .55 : 1);
  }
  setInterval(direct, 250);
  return { play, direct, mood, T, get now() { return cur; } };
})();

/* the browser only lets audio start after a tap or key press */
(function () {
  const hint = document.createElement("div"); hint.className = "sndhint"; hint.hidden = true; hint.setAttribute("role", "status");
  hint.innerHTML = 'Click or press any key to turn the sound on.'; document.body.appendChild(hint);
  const wantSound = () => { const p = typeof D !== "undefined" && D.audio ? D.audio : { m:1, s:1 }; return !!(p.m || p.s); };
  const check = () => { const c = SND.ctx; hint.hidden = !(c && c.state !== "running" && wantSound() && !document.hidden); };
  const go = () => { SND.init(); SND.sync(); MUSIC.direct(); check(); };
  /* start the audio engine as the game loads; browsers keep it paused until the first click or key press, which then starts the music at once */
  const boot = () => { const c = SND.init(); if (c) { c.addEventListener("statechange", () => { check(); MUSIC.direct(); }); try { if (SND.allOn()) c.resume(); } catch (e) {} } check(); };
  if (document.readyState === "complete") boot(); else addEventListener("load", boot);
  setInterval(check, 500);
  ["pointerdown", "mousedown", "click", "keydown", "touchstart", "touchend"].forEach(ev => addEventListener(ev, go, { passive:true, capture:true }));
  document.addEventListener("visibilitychange", () => { const c = SND.ctx; if (!c) return; if (document.hidden) c.suspend(); else if (SND.allOn()) c.resume(); });
})();
