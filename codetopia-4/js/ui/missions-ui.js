/* The mission sheet: a villager's request, a place to type, and the coins when it is right. */

"use strict";

const msEl = $("#mission"), msIn = $("#msIn");
let msCur = null, msHinted = false;
const missionDone = m => !!(D.missions && D.missions[m.id]);
const missionDoneCount = () => MISSIONS.filter(missionDone).length;
const msTrackOpen = g => trackOpen(g.track);

/* where a villager stands: "locked" (language not open), "wait" (next job needs a higher level), "avail", or "done" */
function missionState(gid) {
  const g = GIVERS[gid], list = MISSIONS.filter(m => m.giver === gid), next = list.find(m => !missionDone(m));
  if (!msTrackOpen(g)) return { s:"locked", g };
  if (!next) return { s:"done", g };
  if (!D.admin && trackData(g.track).unlocked < next.lv) return { s:"wait", g, m:next };
  return { s:"avail", g, m:next };
}

function openMission(gid) {
  const st = missionState(gid); if (st.s !== "avail") return;
  const m = st.m, g = st.g; msCur = m; msHinted = false;
  $("#msTitle").textContent = m.title; $("#msPic").innerHTML = spriteSVG(SPRITES[g.sprite]); $("#msWho").textContent = g.name; $("#msAsk").textContent = m.ask;
  $("#msGoal").textContent = m.mode === "copy" ? "Type the code below exactly." : m.goal;
  const show = $("#msShow"); show.hidden = m.mode === "recall"; show.textContent = m.code || ""; show.dataset.lang = g.track;
  $("#msLang").textContent = TRACKS[g.track].lang; msIn.value = ""; $("#msFb").textContent = ""; $("#msFb").className = "ms-fb";
  $("#msHint").hidden = false; $("#msHint").textContent = "Show the answer (half pay)"; $("#msHintBox").hidden = true; $("#msDone").hidden = true; $("#msWork").hidden = false;
  $("#msPay").textContent = m.reward + " coins";
  $("#msOut").hidden = g.track !== "html"; msPreview(); msIn.setAttribute("aria-label", "Type your " + TRACKS[g.track].lang + " here");
  openSheet("#mission"); msIn.focus();
}
function msPreview() { if (!$("#msOut").hidden) $("#msOut").srcdoc = '<!doctype html><meta charset="utf-8"><style>body{font:18px/1.4 Georgia,serif;margin:14px;color:#2a1d3d;background:#fff8ec}</style>' + msIn.value; }
function msCheck(final) {
  if (!msCur) return; const m = msCur, typed = msIn.value, fb = $("#msFb");
  if (missionOk(m, typed)) { msWin(); return; }
  const g = GIVERS[m.giver], t = missionNorm(g.track, typed);
  if (!t) { fb.textContent = ""; fb.className = "ms-fb"; return; }
  const near = m.answers.some(a => missionNorm(g.track, a).startsWith(t));
  fb.className = "ms-fb " + (near ? "ok" : "bad");
  fb.textContent = near ? "Looking good. Keep going." : final ? "Not quite right yet. Read it again carefully, or ask for the answer." : "Something is different. Check what you have typed so far.";
}
function msWin() {
  const m = msCur, g = GIVERS[m.giver], pay = msHinted ? Math.round(m.reward / 2) : m.reward;
  D.missions = D.missions || {}; D.missions[m.id] = 1; D.coins += pay; persist(); if (typeof stats === "function") stats();
  $("#msWork").hidden = true; $("#msDone").hidden = false; $("#msThanks").textContent = m.thanks; $("#msGot").textContent = "+" + pay + " coins" + (msHinted ? " (half pay, you used the answer)" : "");
  const left = MISSIONS.filter(x => x.giver === m.giver && !missionDone(x)).length; $("#msMore").textContent = left ? g.name + " has " + left + " more job" + (left === 1 ? "" : "s") + ", when you are ready." : g.name + " has no more jobs. You finished them all!";
  SND.sfx("quest"); msCur = null; vRepaint();
}
msIn.addEventListener("input", () => { msPreview(); msCheck(false); });
$("#msHandIn").addEventListener("click", () => msCheck(true));
$("#msHint").addEventListener("click", () => { if (!msCur) return; msHinted = true; $("#msHintBox").hidden = false; $("#msHintBox").textContent = (msCur.hint ? msCur.hint + "\n\n" : "") + "Answer:\n" + msCur.answers[0]; $("#msHint").hidden = true; $("#msPay").textContent = Math.round(msCur.reward / 2) + " coins"; });
function msBack() { msCur = null; closeSheets(); if (V.on) { document.body.style.overflow = "hidden"; vRepaint(); vil.focus({ preventScroll:true }); } }
$("#msBack").addEventListener("click", msBack); $("#msBack2").addEventListener("click", msBack);

/* talking to a villager in the village */
function vGiverTalk(n) {
  const st = missionState(n.giver);
  if (st.s === "avail") openMission(n.giver); else vSay(n, vLine(n));
}
