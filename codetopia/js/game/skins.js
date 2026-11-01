/* Unlockable characters, their achievements and equipping them. */

"use strict";

/* ================= unlockable characters ================= */
const starTotal = () => Object.values(trackData("html").stars).reduce((a, b) => a + b, 0);
const threeStars = () => Object.values(trackData("html").stars).filter(v => v >= 3).length;
const masteredN = () => CON_IDS.filter(id => seen(id) && D.mast[id].box >= 5).length;
const streak = () => { let n = 0; for (let i = D.hist.length - 1; i >= 0 && D.hist[i] === 1; i--) n++; return n; };
const cleared = n => [trackData("html").stars[n] ? 1 : 0, 1];
const upTo = (v, m) => [Math.min(v, m), m];
const SKINS = [
  { id:"hero", n:"Apprentice", from:"Codetopia", ach:"The starting mage. Always available.", prog:() => [1, 1] },
  { id:"invisible_man", n:"The Invisible Man", from:"H. G. Wells, 1897", ach:"Clear level 1.", prog:() => cleared(1) },
  { id:"sherlock_holmes", n:"Sherlock Holmes", from:"Arthur Conan Doyle", ach:"Clear level 3.", prog:() => cleared(3) },
  { id:"alice", n:"Alice", from:"Lewis Carroll, 1865", ach:"Cast 30 spells.", prog:() => upTo(D.casts, 30) },
  { id:"robin_hood", n:"Robin Hood", from:"English folklore", ach:"Cast 8 spells in a row with no mistakes.", prog:() => upTo(streak(), 8) },
  { id:"tin_woodman", n:"Tin Man", from:"L. Frank Baum, 1900", ach:"Earn 3 stars on 3 different levels.", prog:() => upTo(threeStars(), 3) },
  { id:"long_john_silver", n:"Long John Silver", from:"R. L. Stevenson, 1883", ach:"Collect 15 stars in total.", prog:() => upTo(starTotal(), 15) },
  { id:"captain_nemo", n:"Captain Nemo", from:"Jules Verne, 1870", ach:"Clear level 6.", prog:() => cleared(6) },
  { id:"mina_harker", n:"Mina Harker", from:"Bram Stoker, 1897", ach:"Master 6 concepts.", prog:() => upTo(masteredN(), 6) },
  { id:"count_dracula", n:"Count Dracula", from:"Bram Stoker, 1897", ach:"Clear level 8.", prog:() => cleared(8) },
  { id:"the_creature", n:"The Creature", from:"Mary Shelley, 1818", ach:"Cast 100 spells.", prog:() => upTo(D.casts, 100) },
  { id:"jekyll_and_hyde", n:"Jekyll and Hyde", from:"R. L. Stevenson, 1886", ach:"Earn 3 stars on 7 different levels.", prog:() => upTo(threeStars(), 7) },
  { id:"dr_moreau", n:"Doctor Moreau", from:"H. G. Wells, 1896", ach:"Defeat the Markup Titan (clear level 10).", prog:() => cleared(10) },
  { id:"winnie_the_pooh", n:"Winnie the Pooh", from:"A. A. Milne, 1926", ach:"Cast 100 spells.", prog:() => upTo(D.casts, 100) },
  { id:"cheshire_cat", n:"The Cheshire Cat", from:"Lewis Carroll, 1865", ach:"Clear HTML level 5 (the page skeleton boss).", prog:() => cleared(5) },
  { id:"wicked_witch", n:"The Wicked Witch of the West", from:"L. Frank Baum, 1900", ach:"Clear HTML level 7.", prog:() => cleared(7) },
  { id:"jo_march", n:"Jo March", from:"Louisa May Alcott, 1868", ach:"Earn 3 stars on 5 different levels.", prog:() => upTo(threeStars(), 5) },
  { id:"baba_yaga", n:"Baba Yaga", from:"Slavic folklore", ach:"Defeat the Markup Titan with 3 stars.", prog:() => [(trackData("html").stars[10] || 0) >= 3 ? 1 : 0, 1] },
  { id:"zorro", n:"Zorro", from:"Johnston McCulley, 1919", ach:"Clear C++ level 1.", prog:() => [trackData("cpp").stars[1] ? 1 : 0, 1] },
  { id:"cthulhu", n:"Cthulhu", from:"H. P. Lovecraft, 1928", ach:"Defeat the Pointer Wraith (clear C++ level 10).", prog:() => [trackData("cpp").stars[10] ? 1 : 0, 1] }
];
const skinMeta = id => SKINS.find(s => s.id === id) || SKINS[0];
const skinDef = id => id === "hero" ? SPRITES.hero : SKIN_ART[id];
const battleDef = id => id === "hero" ? SPRITES.hero : (SKIN_TURN[id] || SKIN_ART[id]);
const isReal = s => s.id === "hero" || !!D.skins[s.id];
const isOpen = s => isReal(s) || !!D.admin;
const lvUnlocked = () => D.admin ? NREAL : D.unlocked;
function checkUnlocks(){
  const got = [];
  SKINS.forEach(s => { if (isReal(s)) return; const [c, m] = s.prog(); if (c >= m) { D.skins[s.id] = true; got.push(s); } });
  if (got.length) persist();
  return got;
}
let toastT = 0;
function toast(msg){ const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 5000); }
function setSkinPx(){
  const hp = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--px-hero")) || 8;
  document.documentElement.style.setProperty("--px-skin", Math.max(2, Math.round(hp * .45)) + "px");
}
function applyHeroSkin(){
  const id = (D.skin !== "hero" && (D.admin || D.skins[D.skin]) && SKIN_ART[D.skin]) ? D.skin : "hero"; D.skin = id;
  const m = skinMeta(id);
  $("#heroBody").innerHTML = spriteSVG(battleDef(id));
  const sv = $("#heroBody").firstElementChild; if (id !== "hero") { setSkinPx(); sv.classList.add("skin"); if (id === "cheshire_cat") sv.classList.add("float"); }
  $("#heroName").textContent = m.n; $("#hero").setAttribute("aria-label", "Your character, " + m.n);
}
addEventListener("resize", setSkinPx);
