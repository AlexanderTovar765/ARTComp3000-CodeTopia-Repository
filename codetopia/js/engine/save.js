/* Save and load layer, plus per-language progress and switching tracks. */

"use strict";

/* ================= save / load layer (swap for accounts later) ================= */
const Store = (() => {
  const KEY = "codetopia.campaign.v1"; let mem = null;
  return {
    load(){ try { const s = localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch (e) {} return mem; },
    save(d){ mem = d; try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} },
    clear(){ mem = null; try { localStorage.removeItem(KEY); } catch (e) {} }
  };
})();
const fresh = () => ({ v:1, unlocked:1, stars:{}, mast:{}, turn:0, hist:[], casts:0, clean:0, skins:{}, coins:0, skin:"hero", admin:false, track:"html", tracks:{} });
let D = Object.assign(fresh(), Store.load() || {});
if (!D.tracks) D.tracks = {};
if (typeof D.coins !== "number") D.coins = 0;
if (!D.track) D.track = "html";
const persist = () => { D.tracks[D.track] = { unlocked:D.unlocked, stars:D.stars, mast:D.mast }; Store.save(D); };
const blankTrack = () => ({ unlocked:1, stars:{}, mast:{} });
const trackData = id => id === D.track ? { unlocked:D.unlocked, stars:D.stars, mast:D.mast } : (D.tracks[id] || blankTrack());
const htmlDone = () => !!trackData("html").stars[10];
const cppDone = () => !!trackData("cpp").stars[10];
let uiReady = false;
function applyTrack(){
  TRK = TRACKS[D.track] || TRACKS.html; D.track = TRK.id;
  CON = TRK.CON; CON_IDS = Object.keys(CON); LEVELS = TRK.LEVELS; NREAL = LEVELS.filter(l => !l.arena).length; SP = TRK.SP;
  Object.keys(TRK.subs).forEach(k => { ACTIONS[k].sub = TRK.subs[k]; });
}
function setTrack(id){
  if (id === D.track) return;
  D.tracks[D.track] = { unlocked:D.unlocked, stars:D.stars, mast:D.mast };
  const t = D.tracks[id] || blankTrack();
  D.unlocked = t.unlocked; D.stars = t.stars; D.mast = t.mast; D.track = id;
  applyTrack(); persist();
  if (uiReady) resetScene();
}
