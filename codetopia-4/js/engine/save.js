/* Save and load layer, plus per-language progress and switching tracks. */

"use strict";

/* ================= save / load layer ================= */
/* One save slot per account. Until somebody signs in there is no slot, so nothing is written to the browser:
   the guest slot is the original single save, so players from before the accounts update keep their progress. */
const Store = (() => {
  const GUEST = "codetopia.campaign.v1"; let key = null, mem = null;
  return {
    GUEST,
    use(k){ key = k; mem = null; },
    key:() => key,
    peek(k){ try { const s = localStorage.getItem(k); if (s) return JSON.parse(s); } catch (e) {} return null; },
    load(){ if (key) { try { const s = localStorage.getItem(key); if (s) return JSON.parse(s); } catch (e) {} } return mem; },
    save(d){ mem = d; if (!key) return; try { localStorage.setItem(key, JSON.stringify(d)); } catch (e) {} },
    clear(){ mem = null; if (!key) return; try { localStorage.removeItem(key); } catch (e) {} }
  };
})();
/* mode "story" opens the languages in order. Mode "custom" opens only the ones in picks, and the rest open once every pick is cleared.
   setup is true once the player has answered the curriculum question. */
const fresh = () => ({ v:1, unlocked:1, stars:{}, mast:{}, turn:0, hist:[], casts:0, clean:0, skins:{}, coins:0, skin:"hero", admin:false, track:"html", tracks:{}, mode:"story", picks:[], setup:false });
let D = Object.assign(fresh(), Store.load() || {});
if (!D.tracks) D.tracks = {};
if (typeof D.coins !== "number") D.coins = 0;
if (!D.track) D.track = "html";
if (!Array.isArray(D.picks)) D.picks = [];
if (D.mode !== "custom") D.mode = "story";
const persist = () => { D.tracks[D.track] = { unlocked:D.unlocked, stars:D.stars, mast:D.mast }; Store.save(D); };
const blankTrack = () => ({ unlocked:1, stars:{}, mast:{} });
const trackData = id => id === D.track ? { unlocked:D.unlocked, stars:D.stars, mast:D.mast } : (D.tracks[id] || blankTrack());
/* ---- which languages are open ---- */
const TRACK_ORDER = ["html", "css", "cpp", "js", "py"];
const trackDoneId = id => !!trackData(id).stars[10];
const isCustom = () => D.mode === "custom" && D.picks.length > 0;
const picksDone = () => D.picks.every(trackDoneId);
const trackOpen = id => {
  if (D.admin) return true;
  if (trackDoneId(id)) return true;   /* finished, or passed its boss test */
  if (isCustom()) return D.picks.includes(id) || picksDone();
  const i = TRACK_ORDER.indexOf(id); return i <= 0 || trackDoneId(TRACK_ORDER[i - 1]);
};
/* the Forge, the Challenge Tower and the Debuggers' Guild are open from the start when a curriculum is chosen, since the player may only be learning one language */
const guildOpen = () => !!D.admin || isCustom() || trackDoneId("html");
const startTrack = () => isCustom() ? (TRACK_ORDER.find(id => D.picks.includes(id)) || "html") : "html";
const htmlDone = () => !!trackData("html").stars[10];
const cssDone = () => !!trackData("css").stars[10];
const cppDone = () => !!trackData("cpp").stars[10];
const jsDone = () => !!trackData("js").stars[10];
let uiReady = false;
function applyTrack(){
  TRK = TRACKS[D.track] || TRACKS.html; D.track = TRK.id;
  CON = TRK.CON; CON_IDS = Object.keys(CON).filter(id => !CON[id].x); LEVELS = TRK.LEVELS; NREAL = LEVELS.filter(l => !l.arena).length; SP = TRK.SP;
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
