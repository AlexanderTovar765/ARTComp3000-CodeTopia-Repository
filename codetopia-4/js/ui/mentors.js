/* Mentor strip on each language map, the first-meeting cutscene, and the librarian at the top of the spellbook. */

"use strict";

const portrait = id => spriteSVG({ px:SPRITES[id].px, pal:SPRITES[id].pal, sc:SPRITES[id].sc });
let tipShown = -1, libShown = -1, bookDueOnly = false;

function mentorLevel(){ return Math.max(1, Math.min(lvUnlocked(), NREAL)); }
function renderMentor(){
  const m = MENTORS[TRK.id], el = $("#mentor"); if (!m) { el.hidden = true; return; }
  el.hidden = false; const lv = mentorLevel(); if (tipShown < 0 || tipShown >= lv) tipShown = lv - 1;
  el.innerHTML = `<div class="portrait">${portrait(m.sprite)}</div>
    <div class="say"><b>${escH(m.name)}</b> <small>${escH(m.role)}</small><p>${escH(m.tips[tipShown])}</p>
    <div class="row"><button class="hbtn" id="mTip" type="button">Another tip</button><button class="hbtn" id="mMeet" type="button">Hear my story</button></div></div>`;
  $("#mTip").onclick = () => { const pool = []; for (let i = 0; i < lv; i++) if (i !== tipShown) pool.push(i); if (pool.length) tipShown = pool[Math.floor(Math.random() * pool.length)]; renderMentor(); $("#mTip").focus(); };
  $("#mMeet").onclick = () => mentorIntro(true);
}
function mentorIntro(force){
  const m = MENTORS[TRK.id]; if (!m) return Promise.resolve();
  if (!force) { if (!D.met) D.met = {}; if (D.met[TRK.id]) return Promise.resolve(); D.met[TRK.id] = 1; persist(); }
  const beats = m.intro.map(t => ({ bg:m.bg, who:m.name, l:"hero", r:m.sprite, text:t, zoom:"in" }));
  beats.push({ who:"hero", l:"hero", r:m.sprite, text:"Thank you. I will do my best.", zoom:"in" });
  return playCine(beats);
}

function renderLibrarian(){
  const el = $("#librarian"), lib = LIBRARIAN;
  const mastered = CON_IDS.filter(id => seen(id) && D.mast[id].box >= 5).length, st = { mastered, total:CON_IDS.length, due:dueCount() };
  const text = libShown < 0 ? lib.line(st) : lib.extras[libShown];
  el.innerHTML = `<div class="portrait">${portrait(lib.sprite)}</div>
    <div class="say"><b>${escH(lib.name)}</b> <small>Keeper of the spell pages</small><p>${escH(text)}</p>
    <div class="row"><button class="hbtn" id="lWord" type="button">Another word</button><button class="hbtn" id="lDue" type="button" aria-pressed="${bookDueOnly}">${bookDueOnly ? "Show every page" : "Only pages due for review"}</button></div></div>`;
  $("#lWord").onclick = () => { libShown = libShown < 0 ? 0 : (libShown + 1) % lib.extras.length; if (libShown === 0 && Math.random() < .4) libShown = -1; renderLibrarian(); $("#lWord").focus(); };
  $("#lDue").onclick = () => { bookDueOnly = !bookDueOnly; renderBookGrid(); renderLibrarian(); $("#lDue").focus(); };
}
