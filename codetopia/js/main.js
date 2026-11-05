/* Boot: applies the saved state and starts the game. */

"use strict";

/* ================= boot ================= */
if (D.track !== "html") setTrack("html"); else applyTrack();
applyHeroSkin();
buildActions(); S.lvl = Math.min(D.unlocked, LEVELS.length); setFoe(); rollIntent(); bars(); refreshActions(); lock(true);
showIdle("Welcome to Codetopia", "Open the map and choose a level to begin.");
drawBackdrop();
let bgFrame = 0;
new ResizeObserver(() => { cancelAnimationFrame(bgFrame); bgFrame = requestAnimationFrame(drawBackdrop); }).observe(scene);
uiReady = true;
showStory();
