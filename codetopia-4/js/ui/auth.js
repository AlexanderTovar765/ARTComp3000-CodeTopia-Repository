/* Sign up, log in and the curriculum picker. They sit in front of the opening story, and the picker can be opened again from the title screen. */

"use strict";

const PICK_LANGS = [
  { id:"html", name:"HTML", sub:"Build web pages", col:"#ff8a4c" },
  { id:"css", name:"CSS", sub:"Style them with colour and layout", col:"#ff7ab8" },
  { id:"cpp", name:"C++", sub:"Fast, powerful programs", col:"#6fb0ff" },
  { id:"js", name:"JavaScript", sub:"Make the web move", col:"#f7df1e" },
  { id:"py", name:"Python", sub:"Clear, friendly and popular", col:"#6fd08c" }
];
const langName = id => PICK_LANGS.find(l => l.id === id).name;
const joinList = a => a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1];
const authState = { mode:"in", who:"", guest:false, fromTitle:false, picks:new Set(), story:false };
const aPanel = id => { ["pTitle", "pAuth", "pPick"].forEach(p => { $("#" + p).hidden = p !== id; }); intro.scrollTop = 0; };
const aErr = t => { $("#aErr").textContent = t || ""; };

/* put the slot of whoever just signed in into the game */
function loadSlot(key){
  Store.use(key); D = Object.assign(fresh(), Store.load() || {});
  if (!D.tracks) D.tracks = {}; if (typeof D.coins !== "number") D.coins = 0; if (!D.track) D.track = "html";
  if (!Array.isArray(D.picks)) D.picks = []; if (D.mode !== "custom") D.mode = "story";
  D.tower = D.tower || { best:0 };   /* tower.js only sets this up once at load, before anybody has signed in */
}
function acctLine(){
  $("#acct").hidden = false;
  $("#acName").textContent = authState.guest ? "Playing as a guest" : "Signed in as " + authState.who;
  $("#acOut").textContent = authState.guest ? "Sign up or log in" : "Log out";
}
function gameStart(){
  intro.classList.remove("authing"); aPanel("pTitle"); acctLine();
  const t = startTrack(); if (D.track !== t) setTrack(t); else applyTrack();
  applyHeroSkin(); resetScene(); stats(); showStory();
}
function enterAccount(id, fresh_, adopted){
  authState.who = Accounts.nameOf(id); authState.guest = false; loadSlot(Accounts.saveKey(id));
  if (!D.setup) pickOpen(false, adopted ? "We found the progress already saved on this browser and moved it into your account, so nothing is lost." : ""); else gameStart();
}
function enterGuest(){ authState.who = ""; authState.guest = true; loadSlot(Store.GUEST); D.setup = true; gameStart(); }

/* ---- the sign up / log in form ---- */
function authOpen(){
  closeSheets(); intro.classList.add("authing"); if (!introOn) showIntro("auth"); aPanel("pAuth"); authTab("in"); $("#aPass").value = ""; $("#aConf").value = ""; $("#aUser").focus({ preventScroll:true });
}
function authTab(m){
  authState.mode = m; const up = m === "up"; aErr("");
  $("#aTabIn").setAttribute("aria-selected", String(!up)); $("#aTabUp").setAttribute("aria-selected", String(up));
  $("#aConfWrap").hidden = !up; $("#aGo").textContent = up ? "Create account" : "Log in";
  $("#aPass").autocomplete = up ? "new-password" : "current-password";
}
$("#aTabIn").addEventListener("click", () => authTab("in"));
$("#aTabUp").addEventListener("click", () => authTab("up"));
$("#aShow").addEventListener("change", e => { $("#aPass").type = $("#aConf").type = e.target.checked ? "text" : "password"; });
$("#aGuest").addEventListener("click", () => { Accounts.forget(); enterGuest(); });
$("#aForm").addEventListener("submit", async e => {
  e.preventDefault(); const up = authState.mode === "up", u = $("#aUser").value, p = $("#aPass").value, go = $("#aGo");
  if (!u.trim()) { aErr("Type your username."); $("#aUser").focus(); return; }
  if (!p) { aErr("Type your password."); $("#aPass").focus(); return; }
  if (up && p !== $("#aConf").value) { aErr("The two passwords do not match."); $("#aConf").focus(); return; }
  go.disabled = true; aErr("");
  try {
    const r = up ? await Accounts.signUp(u, p) : await Accounts.logIn(u, p);
    if (r.error) { aErr(r.error); $("#aPass").select(); return; }
    if ($("#aKeep").checked) Accounts.remember({ u:r.id }); else Accounts.forget();
    $("#aPass").value = ""; $("#aConf").value = ""; enterAccount(r.id, up, r.adopted);
  } finally { go.disabled = false; }
});

/* ---- the curriculum picker ---- */
$("#pkGrid").innerHTML = PICK_LANGS.map(l => `<button class="pk" type="button" role="checkbox" aria-checked="false" data-l="${l.id}" style="--lc:${l.col}"><i class="pkbox" aria-hidden="true"></i><span class="pkt"><b>${l.name}</b><small>${l.sub}</small></span></button>`).join("");
function pickDraw(){
  const a = authState, ids = TRACK_ORDER.filter(id => a.picks.has(id));
  $$("#pkGrid .pk").forEach(b => b.setAttribute("aria-checked", String(a.picks.has(b.dataset.l))));
  $("#pkStory").setAttribute("aria-checked", String(a.story)); $("#pkGo").disabled = !a.story && !ids.length;
  const names = ids.map(langName);
  $("#pkNote").textContent = a.story ? "You will meet the languages in order: HTML, CSS, C++, JavaScript, then Python." :
    ids.length ? "You will study " + joinList(names) + ". Once you finish " + (ids.length > 1 ? "them" : "it") + ", the other languages open for you too." + (ids.includes("css") && !ids.includes("html") ? " CSS styles web pages, but its levels explain what you need, so you can start there." : "") :
    "Tick at least one language, or choose Story mode.";
}
function pickOpen(fromTitle, msg){
  const a = authState; a.fromTitle = fromTitle; a.story = D.setup ? !isCustom() : false; a.picks = new Set(D.setup && isCustom() ? D.picks : []);
  $("#pkKick").textContent = fromTitle ? "</> change your curriculum" : "</> your curriculum"; $("#pkCancel").hidden = !fromTitle;
  $("#pkSub").textContent = (msg ? msg + " " : "") + "Tick the languages you want to study, or take the full story and learn them all in order. You can change this later from the title screen.";
  intro.classList.add("authing"); if (!introOn) showIntro("pick"); aPanel("pPick"); pickDraw(); $("#pkGrid .pk").focus({ preventScroll:true });
}
$("#pkGrid").addEventListener("click", e => { const b = e.target.closest(".pk"); if (!b) return; const s = authState.picks, id = b.dataset.l; s.has(id) ? s.delete(id) : s.add(id); authState.story = false; pickDraw(); });
$("#pkStory").addEventListener("click", () => { authState.story = !authState.story; if (authState.story) authState.picks.clear(); pickDraw(); });
$("#pkGo").addEventListener("click", () => {
  const a = authState; D.mode = a.story ? "story" : "custom"; D.picks = a.story ? [] : TRACK_ORDER.filter(id => a.picks.has(id)); D.setup = true;
  if (!a.fromTitle) { persist(); gameStart(); return; }
  if (!trackOpen(D.track)) setTrack(startTrack()); else persist();
  intro.classList.remove("authing"); aPanel("pTitle"); acctLine(); toast(a.story ? "Curriculum: the full story." : "Curriculum: " + joinList(D.picks.map(langName)) + ".");
});
$("#pkCancel").addEventListener("click", () => { intro.classList.remove("authing"); aPanel("pTitle"); });
$("#acCur").addEventListener("click", () => pickOpen(true));
$("#acOut").addEventListener("click", () => { persist(); Accounts.forget(); location.reload(); });

/* called once from main.js: a remembered session skips the form */
function authBoot(){
  const s = Accounts.session();
  if (s && s.guest) { enterGuest(); return; }
  if (s && s.u && Accounts.exists(s.u)) { enterAccount(s.u, false, false); return; }
  authOpen();
}
