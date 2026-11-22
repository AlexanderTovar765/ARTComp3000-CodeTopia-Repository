/* Sound controls, plus the small hooks that make existing buttons and screens make noise. */

"use strict";

(function () {
  const mk = cls => { const b = document.createElement("button"); b.type = "button"; b.className = "hbtn sndbtn " + (cls || ""); return b; };
  $$(".sheet-top .row").forEach(r => r.prepend(mk()));
  $("#tower").appendChild(mk("sndtower"));
  [$("#cine"), $("#story")].forEach(r => r && r.appendChild(mk("sndfloat")));
  /* one switch for all sound: click the Sound button (or press M) to turn everything off or on */
  let lastFlip = 0;
  const flip = () => { const t = performance.now(); if (t - lastFlip < 250) return; lastFlip = t; SND.init(); SND.setAll(!SND.allOn()); if (SND.allOn()) SND.sfx("ui"); };
  /* react on pointer release as well as click, so a press is never lost if the browser drops the click */
  const hit = e => { const t = e.target, el = t && t.nodeType === 1 ? t : t && t.parentElement; return el && el.closest(".sndbtn"); };
  ["pointerup", "click"].forEach(ev => document.addEventListener(ev, e => { if (hit(e) && (ev === "click" || e.button === 0)) { e.stopPropagation(); flip(); } }, true));
  document.addEventListener("keydown", e => { if ((e.key === "m" || e.key === "M") && !e.ctrlKey && !e.metaKey && !e.altKey && !e.target.closest("textarea,input")) flip(); });
  document.addEventListener("click", e => { if (e.target.closest("button, .vn, .btn, .pick, .act") && !e.target.closest(".sndbtn")) SND.sfx("ui"); });
  SND.sync();

  /* hooks into existing functions */
  const wrap = (name, fn) => { try { const orig = window[name]; if (typeof orig === "function") window[name] = function () { try { fn.apply(null, arguments); } catch (e) {} return orig.apply(this, arguments); }; } catch (e) {} };
  wrap("toast", m => { if (/unlock/i.test(m)) SND.sfx("unlock"); });
  wrap("openSheet", () => SND.sfx("page"));
  wrap("addCoins", n => { if (n > 0) SND.sfx("coin", null, .35); });
  wrap("buySkin", () => SND.sfx("unlock"));
  wrap("vSwitch", () => { if (!V.trans) SND.sfx("travel"); });
  wrap("vEnter", id => { if (id !== "forge" || V.forgeOpen) { if (["lib", "shop", "tower", "forge"].includes(id) || V.open[id]) SND.sfx("door"); } });
  const CFX = { lightning:"thunder", shake:"rumble", flash:"zap", crack:"crack", collapse:"collapse", rumble:"rumble", reveal:"reveal", robe:"robe", dissolve:"dissolve", sunrise:"sunrise" };
  wrap("cineFx", fx => { if (CFX[fx]) SND.sfx(CFX[fx]); });
})();
