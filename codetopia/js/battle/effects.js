/* Spell and hit visual effects. */

"use strict";

/* ================= effects ================= */
function makeSpell(a, les){
  const s = document.createElement("div"); s.className = "spell paper " + (TRK.id === "cpp" ? "cppfx " : "") + a;
  s.innerHTML = renderRes(les); s.inert = true; s.setAttribute("aria-hidden", "true"); fx.appendChild(s); return s;
}
const at = (el, p) => { el.style.left = p.x + "px"; el.style.top = p.y + "px"; };
async function fly(el, from, to, dur, scale){
  at(el, from);
  if (reduce) { at(el, to); await wait(250); return; }
  const dx = to.x - from.x, dy = to.y - from.y;
  await anim(el, [
    { transform:"translate(-50%,-50%) scale(.4)", opacity:0 },
    { transform:`translate(-50%,-50%) scale(${scale})`, opacity:1, offset:.18 },
    { transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(${scale})`, opacity:1 }
  ], { duration:dur, easing:"cubic-bezier(.45,0,.8,.45)", fill:"forwards" });
}
function pop(target, text, kind, dy){
  const c = center(target), n = document.createElement("div"); n.className = "num " + kind; n.textContent = text; at(n, { x:c.x, y:c.y - c.h * .3 + (dy || 0) });
  fx.appendChild(n);
  anim(n, [{ transform:"translate(-50%,-50%)", opacity:1 }, { transform:"translate(-50%,-190%)", opacity:1, offset:.7 }, { transform:"translate(-50%,-240%)", opacity:0 }], { duration:1000, easing:"ease-out" });
  setTimeout(() => n.remove(), reduce ? 900 : 1000);
}
function hurt(el){
  anim(el, [{ transform:"translateX(0)" }, { transform:"translateX(-9px)" }, { transform:"translateX(9px)" }, { transform:"translateX(-5px)" }, { transform:"translateX(0)" }], { duration:340 });
  anim(el, [{ filter:"brightness(1)" }, { filter:"brightness(2.4) saturate(.2)" }, { filter:"brightness(1)" }], { duration:340 });
}
const lunge = (el, dx, dur) => anim(el, [{ transform:"translateX(0)" }, { transform:`translateX(${dx}px)`, offset:.45 }, { transform:"translateX(0)" }], { duration:dur, easing:"ease-in-out" });
