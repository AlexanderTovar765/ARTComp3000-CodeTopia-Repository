/* Sound effects and the audio engine. Everything is synthesised with the Web Audio API, so the game ships no audio files. */

"use strict";

const SND = (() => {
  let ctx = null, master, musicBus, sfxBus, verb, noiseBuf, lastKey = 0, lastStep = 0;
  const pref = () => { if (typeof D === "undefined") return { m:1, s:1, v:.7 }; const a = D.audio || (D.audio = { m:1, s:1, v:.7 }); return a; };
  const now = () => ctx.currentTime;
  const allOn = () => { const p = pref(); return !!(p.m || p.s); };
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  function init() {
    if (ctx) { if (ctx.state === "suspended" && allOn()) { try { ctx.resume(); } catch (e) {} } return ctx; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    try { ctx = new AC(); } catch (e) { return null; }
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 5; comp.attack.value = .01; comp.release.value = .25;
    master = ctx.createGain(); musicBus = ctx.createGain(); sfxBus = ctx.createGain(); verb = ctx.createConvolver();
    const wet = ctx.createGain(); wet.gain.value = .32;
    musicBus.connect(master); sfxBus.connect(master); musicBus.connect(verb); sfxBus.connect(verb); verb.connect(wet); wet.connect(master); master.connect(comp); comp.connect(ctx.destination);
    const len = ctx.sampleRate * 2.1, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    verb.buffer = ir;
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    apply(); if (!allOn()) { try { ctx.suspend(); } catch (e) {} } return ctx;
  }
  function apply() {
    if (!ctx) return; const p = pref(), t = now();
    master.gain.setTargetAtTime(.9 * p.v, t, .05); sfxBus.gain.setTargetAtTime(p.s ? 1 : 0, t, .03); musicBus.gain.setTargetAtTime(p.m ? duck : 0, t, p.m ? .15 : .03);
  }
  let duck = 1;
  function setDuck(v) { duck = v; if (ctx && pref().m) musicBus.gain.setTargetAtTime(v, now(), .25); }

  /* ----- building blocks ----- */
  function tone(o) {
    const t = o.t || now(), dur = o.dur || .2, g = ctx.createGain(), osc = ctx.createOscillator(), a = o.a === undefined ? .004 : o.a;
    osc.type = o.type || "sine"; osc.frequency.setValueAtTime(o.f, t); if (o.slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.slide), t + dur);
    if (o.det) osc.detune.value = o.det;
    let node = osc; if (o.lp) { const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.setValueAtTime(o.lp, t); if (o.lp2) f.frequency.exponentialRampToValueAtTime(o.lp2, t + dur); osc.connect(f); node = f; }
    node.connect(g); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(o.vol || .15, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    g.connect(o.bus || sfxBus); osc.start(t); osc.stop(t + dur + .05); return g;
  }
  function noise(o) {
    const t = o.t || now(), dur = o.dur || .2, src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuf; src.loop = true; f.type = o.type || "lowpass"; f.frequency.setValueAtTime(o.f || 1000, t); if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + dur); f.Q.value = o.q || .7;
    src.connect(f); f.connect(g); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(o.vol || .2, t + (o.a || .005)); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    g.connect(o.bus || sfxBus); src.start(t, Math.random() * 1.5); src.stop(t + dur + .05); return g;
  }
  const bellAt = (f, t, vol, dur, bus) => { tone({ f, t, dur:dur || 1.1, vol:vol || .1, bus }); tone({ f:f * 2.76, t, dur:(dur || 1.1) * .4, vol:(vol || .1) * .35, bus }); tone({ f:f * 5.4, t, dur:(dur || 1.1) * .15, vol:(vol || .1) * .15, bus }); };
  const arp = (notes, gap, mk) => { const t = now(); notes.forEach((m, i) => mk(m, t + i * gap, i)); };
  const PENT = [0, 2, 4, 7, 9];

  /* ----- one-shot effects ----- */
  const FX = {
    key(p) { const i = Math.min(14, Math.floor((p || 0) * 15)), m = 72 + PENT[i % 5] + 12 * Math.floor(i / 5) - 12; tone({ f:hz(m), dur:.07, vol:.05, type:"triangle" }); noise({ type:"highpass", f:4200, dur:.02, vol:.018 }); },
    typo() { tone({ f:150, slide:70, dur:.16, type:"sawtooth", vol:.09, lp:600 }); noise({ f:500, dur:.07, vol:.06 }); },
    ui() { tone({ f:640, slide:900, dur:.05, vol:.045, type:"triangle" }); },
    page() { noise({ type:"bandpass", f:1800, f2:5200, q:.8, dur:.16, vol:.05 }); },
    step(kind) { const grass = kind === "grass", t = now(); noise({ type:grass ? "lowpass" : "bandpass", f:grass ? 500 + Math.random() * 150 : 1000 + Math.random() * 350, q:grass ? .5 : 1.3, dur:.055, vol:grass ? .05 : .045 }); if (!grass) tone({ f:90 + Math.random() * 25, dur:.05, vol:.03 }); },
    travel() { noise({ type:"bandpass", f:300, f2:1400, q:.6, dur:.45, vol:.06, a:.15 }); },
    door() { tone({ f:80, slide:130, dur:.35, type:"sawtooth", vol:.06, lp:300 }); noise({ f:260, dur:.28, vol:.08 }); tone({ f:210, t:now() + .3, dur:.05, type:"square", vol:.03, lp:900 }); noise({ type:"highpass", f:2500, t:now() + .3, dur:.04, vol:.04 }); },
    cast(a) { const trk = a.track || "html", t = now();
      if (trk === "html") arp([79, 84, 88, 91], .045, (m, tt) => bellAt(hz(m), tt, .07, .7));
      else if (trk === "css") arp([76, 81, 85, 88, 93], .05, (m, tt) => bellAt(hz(m), tt, .06, .9));
      else if (trk === "cpp") { tone({ f:hz(43), dur:.5, type:"sawtooth", vol:.08, lp:900, lp2:200 }); tone({ f:hz(50), dur:.5, type:"sawtooth", vol:.06, lp:800, lp2:200 }); noise({ f:900, f2:200, dur:.35, vol:.06 }); }
      else if (trk === "js") arp([72, 76, 79, 84, 88], .035, (m, tt) => tone({ f:hz(m), t:tt, dur:.14, type:"square", vol:.05, lp:3000 }));
      else arp([64, 71, 76, 83], .06, (m, tt) => { tone({ f:hz(m), t:tt, dur:.5, type:"sine", vol:.09 }); tone({ f:hz(m) * 2, t:tt, dur:.3, type:"triangle", vol:.03 }); });
      const act = a.act; if (act === "heavy") noise({ type:"bandpass", f:200, f2:1800, q:.8, dur:.5, vol:.09, a:.2 }); else noise({ type:"bandpass", f:700, f2:3200, q:.9, dur:.28, vol:.05, a:.1 }); },
    hit() { noise({ type:"bandpass", f:1800, f2:300, q:.9, dur:.2, vol:.2 }); tone({ f:170, slide:55, dur:.22, vol:.28 }); },
    hurt() { tone({ f:260, slide:80, dur:.32, type:"sawtooth", vol:.12, lp:1200, lp2:300 }); noise({ f:900, f2:200, dur:.2, vol:.15 }); },
    boom() { tone({ f:90, slide:30, dur:.8, vol:.4 }); noise({ f:600, f2:60, dur:.9, vol:.25 }); },
    swoosh() { noise({ type:"bandpass", f:300, f2:2500, q:.7, dur:.3, vol:.08, a:.12 }); },
    block() { tone({ f:1500, dur:.25, type:"triangle", vol:.09 }); tone({ f:2300, dur:.18, type:"square", vol:.04, lp:5000 }); noise({ type:"highpass", f:3000, dur:.1, vol:.08 }); },
    ward() { arp([67, 72, 76, 79], .06, (m, t) => tone({ f:hz(m), t, dur:.5, vol:.07, type:"triangle" })); },
    heal() { arp([72, 76, 79, 84, 88], .07, (m, t) => { tone({ f:hz(m), t, dur:.55, vol:.07 }); tone({ f:hz(m) * 2, t, dur:.3, vol:.025, type:"triangle" }); }); },
    coin() { const t = now(); tone({ f:hz(83), t, dur:.1, type:"square", vol:.045, lp:4000 }); tone({ f:hz(88), t:t + .07, dur:.35, type:"square", vol:.05, lp:4500 }); tone({ f:hz(95), t:t + .07, dur:.3, vol:.03 }); },
    win() { const t = now(); [72, 76, 79, 84].forEach((m, i) => { tone({ f:hz(m), t:t + i * .1, dur:.3, type:"square", vol:.06, lp:2600 }); tone({ f:hz(m - 12), t:t + i * .1, dur:.3, type:"triangle", vol:.08 }); });
      [72, 79, 84, 88].forEach(m => tone({ f:hz(m), t:t + .45, dur:1.1, type:"triangle", vol:.07 })); },
    fanfare() { const t = now(), seq = [[67, 0, .12], [67, .14, .12], [67, .28, .12], [72, .42, .5], [70, .95, .22], [72, 1.2, .22], [76, 1.45, .8]];
      seq.forEach(([m, d, l]) => { tone({ f:hz(m), t:t + d, dur:l, type:"sawtooth", vol:.06, lp:2200 }); tone({ f:hz(m - 12), t:t + d, dur:l, type:"square", vol:.05, lp:900 }); });
      [60, 64, 67, 72].forEach(m => tone({ f:hz(m), t:t + 1.45, dur:1.3, type:"triangle", vol:.07 })); },
    lose() { const t = now(); [67, 63, 60, 55].forEach((m, i) => tone({ f:hz(m), t:t + i * .28, dur:.7, type:"sawtooth", vol:.07, lp:900, lp2:300 })); },
    quest() { const t = now(); [72, 76, 79, 84, 79, 84, 88].forEach((m, i) => tone({ f:hz(m), t:t + i * .09, dur:.4, type:"triangle", vol:.08 })); [76, 79, 84, 91].forEach(m => bellAt(hz(m), t + .65, .06, 1.2)); },
    unlock() { arp([76, 79, 83, 88, 91, 95, 100], .06, (m, t) => bellAt(hz(m), t, .06, .8)); },
    floor() { tone({ f:660, dur:.08, type:"square", vol:.04, lp:3000 }); tone({ f:990, t:now() + .08, dur:.15, type:"square", vol:.04, lp:3000 }); },
    appear() { noise({ type:"bandpass", f:200, f2:900, q:.8, dur:.35, vol:.08, a:.2 }); },
    tick(urgent) { tone({ f:urgent ? 1100 : 880, dur:.05, type:"square", vol:.04, lp:3000 }); },
    thunder() { const t = now(); noise({ type:"bandpass", f:3000, f2:400, dur:.14, vol:.18 }); noise({ f:350, f2:50, t:t + .06, dur:2.4, vol:.34, a:.05, q:.4 }); tone({ f:60, slide:30, t:t + .1, dur:1.8, vol:.18 }); },
    zap() { noise({ type:"highpass", f:2000, dur:.12, vol:.1 }); tone({ f:1500, slide:200, dur:.14, type:"sawtooth", vol:.05, lp:4000 }); },
    rumble(d) { noise({ f:140, f2:60, dur:d || 1, vol:.3, a:.2, q:.5 }); tone({ f:48, dur:d || 1, vol:.2, a:.2 }); },
    crack() { FX.rumble(1.7); noise({ type:"bandpass", f:1800, f2:300, dur:.25, vol:.22 }); noise({ type:"bandpass", f:2400, t:now() + .6, f2:400, dur:.2, vol:.16 }); noise({ type:"bandpass", f:2000, t:now() + 1.1, f2:300, dur:.25, vol:.2 }); },
    collapse() { const t = now(); FX.rumble(2.8); FX.boom(); for (let i = 0; i < 10; i++) noise({ type:"bandpass", f:700 + Math.random() * 1500, f2:200, t:t + .2 + Math.random() * 2, dur:.3, vol:.1 + Math.random() * .1 }); tone({ f:55, slide:25, t:t + 1.2, dur:1.8, vol:.3 }); },
    reveal() { const t = now(); tone({ f:110, slide:55, dur:1.4, type:"sawtooth", vol:.12, lp:700, lp2:150 }); tone({ f:116, slide:58, dur:1.4, type:"sawtooth", vol:.1, lp:700, lp2:150 }); noise({ type:"bandpass", f:300, f2:2500, q:.7, dur:1, vol:.12, a:.7 }); },
    robe() { arp([72, 76, 79, 84, 88, 91, 96], .12, (m, t) => { bellAt(hz(m), t, .07, 1.4); }); },
    dissolve() { arp([96, 91, 88, 84, 79, 76, 72, 67], .16, (m, t) => bellAt(hz(m), t, .05, 1.2)); },
    sunrise() { const t = now(); [60, 67, 72, 76, 79].forEach((m, i) => { tone({ f:hz(m), t:t + i * .25, dur:2.8, a:1, type:"triangle", vol:.08 }); tone({ f:hz(m + 12), t:t + i * .25, dur:2.4, a:1.2, vol:.03 }); }); },
    blip(who) { const base = who === "hero" ? 600 : who === "Pythona" ? 150 : 330; tone({ f:base * (.9 + Math.random() * .25), dur:.045, type:who === "Pythona" ? "sawtooth" : "square", vol:.022, lp:1800 }); }
  };

  /* ----- ambience: wind, birds, crickets, fountain, storm ----- */
  const amb = { kind:null, nodes:[], timer:0, vol:0, fountain:null };
  function ambNoise(f, vol, lfoHz, lfoDepth) {
    const src = ctx.createBufferSource(), flt = ctx.createBiquadFilter(), g = ctx.createGain(), lfo = ctx.createOscillator(), ld = ctx.createGain();
    src.buffer = noiseBuf; src.loop = true; flt.type = "bandpass"; flt.frequency.value = f; flt.Q.value = .5; g.gain.value = 0;
    lfo.frequency.value = lfoHz; ld.gain.value = lfoDepth; lfo.connect(ld); ld.connect(g.gain); src.connect(flt); flt.connect(g); g.connect(sfxBus); src.start(0, Math.random()); lfo.start();
    g.gain.setTargetAtTime(vol, now(), 1.5); return { stop() { g.gain.setTargetAtTime(0, now(), .6); setTimeout(() => { try { src.stop(); lfo.stop(); g.disconnect(); } catch (e) {} }, 2500); }, g };
  }
  const chirp = () => { const f = 2400 + Math.random() * 1800, t = now(), n = 2 + Math.floor(Math.random() * 3); for (let i = 0; i < n; i++) tone({ f:f * (1 + (i % 2) * .22), slide:f * (1.1 + Math.random() * .3), t:t + i * .09, dur:.07, vol:.018, bus:sfxBus }); };
  const cricket = () => { const t = now(), f = 4300 + Math.random() * 300; for (let i = 0; i < 3; i++) tone({ f, t:t + i * .07, dur:.04, vol:.012, type:"square", lp:6000 }); };
  const owl = () => { const t = now(); tone({ f:330, t, dur:.4, a:.08, vol:.03 }); tone({ f:290, t:t + .55, dur:.7, a:.08, vol:.03 }); };
  function setAmb(kind) {
    if (!ctx || kind === amb.kind) return; amb.kind = kind; amb.nodes.forEach(n => n.stop()); amb.nodes = []; clearInterval(amb.timer); clearInterval(amb.drops); amb.prox = 0; amb.fountain = null; if (!kind) return;
    const storm = kind === "storm", forest = kind === "forest", day = kind === "day" || kind === "square-day";
    let n = 0; amb.timer = setInterval(() => { n++;
      if (storm && n % 9 === 0 && Math.random() < .8) FX.thunder();
      else if (day && Math.random() < .5) chirp();
      else if (!day && !storm && Math.random() < .55) cricket();
      if (forest && Math.random() < .08) owl();
    }, 1600);
    if (kind.startsWith("square")) amb.drops = setInterval(() => { if (amb.prox > .02 && Math.random() < .25 + amb.prox * .5) drop(amb.prox); }, 110);
  }
  /* a fountain: a soft rushing wash that wobbles, plus little droplets, and only close to the basin */
  function waterNode() {
    const src = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), lp = ctx.createBiquadFilter(), mod = ctx.createGain(), g = ctx.createGain(), lfo = ctx.createOscillator(), ld = ctx.createGain();
    src.buffer = noiseBuf; src.loop = true; hp.type = "highpass"; hp.frequency.value = 700; lp.type = "lowpass"; lp.frequency.value = 3600; mod.gain.value = .7; g.gain.value = 0;
    lfo.frequency.value = 8; ld.gain.value = .3; lfo.connect(ld); ld.connect(mod.gain); src.connect(hp); hp.connect(lp); lp.connect(mod); mod.connect(g); g.connect(sfxBus); src.start(0, Math.random()); lfo.start();
    return { g, stop() { g.gain.setTargetAtTime(0, now(), .2); setTimeout(() => { try { src.stop(); lfo.stop(); g.disconnect(); } catch (e) {} }, 1200); } };
  }
  function drop(prox) { const f = 700 + Math.random() * 1700, t = now(); tone({ f, slide:f * (1.5 + Math.random() * .6), t, dur:.06 + Math.random() * .05, vol:.014 * prox, a:.003 }); if (Math.random() < .3) tone({ f:f * 1.3, slide:f * 2.1, t:t + .05, dur:.05, vol:.008 * prox, a:.003 }); }
  function fountain(dist) { amb.prox = dist < 85 ? Math.pow(1 - dist / 85, 1.5) : 0; }

  /* ----- public ----- */
  let on = true;
  const api = {
    init, apply, setDuck, setAmb, fountain, tone, noise, hz, bellAt, FX,
    get ctx() { return ctx; }, get musicBus() { return musicBus; }, get ready() { return !!ctx && ctx.state === "running"; },
    nodeBus() { return { ctx, musicBus, sfxBus }; },
    sfx(name, arg, delay) {
      if (!ctx || !pref().s || ctx.state !== "running" || !FX[name]) return;
      if (delay) { setTimeout(() => api.sfx(name, arg), delay * 1000); return; }
      try { FX[name](arg); } catch (e) {}
    },
    key(p) { const t = performance.now(); if (t - lastKey < 22) return; lastKey = t; api.sfx("key", p); },
    walk(x, y, moving, scene) {
      if (api._lx === undefined || scene !== api._ls || Math.hypot(x - api._lx, y - api._ly) > 40) { api._lx = x; api._ly = y; api._ls = scene; api._acc = 0; return; }
      if (moving) { api._acc += Math.hypot(x - api._lx, y - api._ly); if (api._acc > 15) { api._acc = 0; api.sfx("step", scene === "html" || scene === "css" || scene === "cpp" || scene === "guild" ? "grass" : "stone"); } } else api._acc = 0;
      api._lx = x; api._ly = y;
    },
    /* the one switch for every sound: gains go to zero and the audio clock is paused, so nothing can leak through */
    setAll(on) {
      const p = pref(); p.m = p.s = on ? 1 : 0; try { persist(); } catch (e) {}
      if (ctx) { try { if (on) ctx.resume(); } catch (e) {} apply(); if (!on) setTimeout(() => { try { if (!allOn()) ctx.suspend(); } catch (e) {} }, 150); }
      sync(); if (typeof toast === "function") toast(on ? "Sound on" : "Sound off");
    },
    allOn,
    toggle(which) { const p = pref(); p[which] = p[which] ? 0 : 1; if (typeof persist === "function") persist(); apply(); sync(); },
    setVol(v) { pref().v = v; apply(); if (typeof persist === "function") persist(); }
  };
  function sync() { const p = pref(), off = !p.m && !p.s, txt = off ? "Sound: off" : "Sound: on";
    document.querySelectorAll(".sndbtn").forEach(b => { if (b.textContent !== txt) b.textContent = txt; const o = off ? "1" : ""; if (b.dataset.off !== o) b.dataset.off = o; b.setAttribute("aria-pressed", String(!off)); }); }
  api.sync = sync;
  return api;
})();
