/* The Skill Tree: one tree in the middle of the village, with a branch for every language. Each node is a concept from that language's
   campaign: dark until you meet it, lit once you have learned it, golden once the Spellbook says you really know it, and pulsing when a
   review is due. It reads the same progress the Spellbook already keeps and changes nothing. */

"use strict";

const SK = { lang:"html", pick:null };
const SK_LANGS = ["html", "css", "js", "py", "cpp"], SK_NAME = { html:"HTML", css:"CSS", js:"JavaScript", py:"Python", cpp:"C++" };
const SK_COL = { html:"#ff9a5a", css:"#6fb0ff", js:"#ffd23f", py:"#7ae08f", cpp:"#8fd0ff" };

/* every concept of a language, grouped by the level that teaches it, with its state */
function skTree(lang) {
  const T = TRACKS[lang], td = trackData(lang), tiers = {};
  Object.keys(T.CON).filter(id => !T.CON[id].x).forEach(id => {
    const c = T.CON[id], m = td.mast[id], got = !!(m && m.seen), state = !got ? "locked" : m.box >= 5 ? "master" : "learned";
    (tiers[c.L] = tiers[c.L] || []).push({ id, c, state, due: got && D.turn >= m.due, box: got ? m.box : 0 });
  });
  return { tiers: Object.keys(tiers).map(Number).sort((a, b) => a - b).map(L => ({ L, nodes: tiers[L] })), reached: Math.min(td.unlocked || 1, 10), done: !!td.stars[10] };
}
function skCounts(lang) { const t = skTree(lang); let n = 0, got = 0, mas = 0, due = 0; t.tiers.forEach(r => r.nodes.forEach(x => { n++; if (x.state !== "locked") got++; if (x.state === "master") mas++; if (x.due) due++; })); return { n, got, mas, due }; }
/* how many of the 24 lights on the village tree are lit */
function skLit() { let n = 0, got = 0; SK_LANGS.forEach(l => { const k = skCounts(l); n += k.n; got += k.got * .5 + k.mas * .5; }); return n && got > 0 ? Math.min(24, Math.max(1, Math.round(Math.sqrt(got / n) * 24))) : 0; }
function skTotals() { let n = 0, mas = 0; SK_LANGS.forEach(l => { const k = skCounts(l); n += k.n; mas += k.mas; }); return { n, mas }; }

function skSpider() {
  const R = 78, cx = 110, cy = 100, pts = (f) => SK_LANGS.map((l, i) => { const a = -Math.PI / 2 + i * Math.PI * 2 / 5, r = R * f(l); return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
  const ring = k => pts(() => k).map(p => p.join(",")).join(" "), cnt = {}; SK_LANGS.forEach(l => { cnt[l] = skCounts(l); });
  const poly = f => pts(f).map(p => p.map(v => v.toFixed(1)).join(",")).join(" ");
  const labels = SK_LANGS.map((l, i) => { const a = -Math.PI / 2 + i * Math.PI * 2 / 5, x = cx + Math.cos(a) * (R + 22), y = cy + Math.sin(a) * (R + 16) + 4; return '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" text-anchor="middle" fill="' + SK_COL[l] + '" font-size="12">' + SK_NAME[l] + "</text>"; }).join("");
  const axes = SK_LANGS.map((l, i) => { const a = -Math.PI / 2 + i * Math.PI * 2 / 5; return '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + Math.cos(a) * R).toFixed(1) + '" y2="' + (cy + Math.sin(a) * R).toFixed(1) + '" stroke="#3a3170"/>'; }).join("");
  const label = SK_LANGS.map(l => SK_NAME[l] + " " + Math.round(cnt[l].mas / Math.max(1, cnt[l].n) * 100) + "% mastered").join(", ");
  return '<svg viewBox="0 0 220 200" role="img" aria-label="Skills by language: ' + label + '">' + [.25, .5, .75, 1].map(k => '<polygon points="' + ring(k) + '" fill="none" stroke="#3a3170"/>').join("") + axes
    + '<polygon points="' + poly(l => Math.max(.04, cnt[l].got / Math.max(1, cnt[l].n))) + '" fill="rgba(122,224,143,.16)" stroke="#7ae08f" stroke-width="1.5"/>'
    + '<polygon points="' + poly(l => Math.max(.04, cnt[l].mas / Math.max(1, cnt[l].n))) + '" fill="rgba(255,210,63,.28)" stroke="#ffd23f" stroke-width="2"/>' + labels + "</svg>";
}

function skRender() {
  const T = skTotals(); $("#skSub").textContent = T.mas + " of " + T.n + " concepts mastered across all languages. Tap a node to read it, see what it unlocks on your plot, and review it.";
  $("#skSpider").innerHTML = skSpider();
  $("#skTabs").innerHTML = SK_LANGS.map(l => { const k = skCounts(l); return '<button type="button" role="tab" class="fgtab" data-lang="' + l + '" aria-selected="' + (l === SK.lang) + '">' + SK_NAME[l] + "<small> " + k.got + "/" + k.n + (k.due ? " · " + k.due + " due" : "") + "</small></button>"; }).join("");
  const t = skTree(SK.lang), col = SK_COL[SK.lang];
  $("#skTree").style.setProperty("--sk", col);
  $("#skTree").innerHTML = t.tiers.map(r => '<div class="sk-tier' + (r.L === t.reached && !t.done ? " here" : "") + '"><div class="sk-lv"><b>Level ' + r.L + "</b>" + (r.L === t.reached && !t.done ? "<span>You are here</span>" : "") + '</div><div class="sk-nodes">'
    + r.nodes.map(x => '<button type="button" class="sk-node ' + x.state + (x.due ? " due" : "") + (SK.pick === x.id ? " sel" : "") + '" data-id="' + x.id + '" aria-pressed="' + (SK.pick === x.id) + '" aria-label="' + x.c.n + ": " + (x.state === "locked" ? "not learned yet" : x.state === "master" ? "mastered" : "learned") + (x.due ? ", review due" : "") + '"><i aria-hidden="true">' + (x.state === "locked" ? "🔒" : x.state === "master" ? "★" : "●") + "</i><span>" + x.c.n + "</span></button>").join("") + "</div></div>").join("");
  skDetail();
}
function skDetail() {
  const box = $("#skDetail"), L = SK.lang, id = SK.pick, T = TRACKS[L];
  if (!id || !T.CON[id]) { box.innerHTML = "<p class=\"sk-hint\">Pick a node on the tree.</p>"; return; }
  const c = T.CON[id], td = trackData(L), m = td.mast[id], got = !!(m && m.seen), st = !got ? "Not learned yet. It is taught in level " + c.L + "." : m.box >= 5 ? "Mastered." : "Learned. Keep practising to master it.";
  const stars = !got ? 0 : m.box >= 5 ? 3 : m.box >= 3 ? 2 : 1;
  const unl = typeof PL_UNLOCK !== "undefined" && PL_UNLOCK[L] ? Object.keys(PL_UNLOCK[L]).filter(k => PL_UNLOCK[L][k].need === id).map(k => PL_UNLOCK[L][k]) : [];
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  box.innerHTML = "<h2>" + esc(c.n) + '</h2><p class="sk-st"><span class="sk-stars" aria-hidden="true">' + "★".repeat(stars) + "☆".repeat(3 - stars) + "</span> " + st + (got && D.turn >= m.due ? " Review due." : "") + "</p>"
    + '<p class="sk-chips">' + (c.tags || []).map(x => "<code>" + esc(x) + "</code>").join("") + "</p><p>" + esc(c.e) + "</p>"
    + (unl.length ? '<p class="sk-unl"><b>Unlocks on your plot:</b> ' + unl.map(u => esc(u.d)).join("; ") + "</p>" : "")
    + '<button class="hbtn" id="skReview" type="button">Open the Spellbook for ' + SK_NAME[L] + "</button>";
}
function openSkills() { SK.pick = null; skRender(); openSheet("#skl"); }
$("#skTabs").addEventListener("click", e => { const b = e.target.closest("[data-lang]"); if (!b) return; SK.lang = b.dataset.lang; SK.pick = null; skRender(); const nb = $('#skTabs [data-lang="' + SK.lang + '"]'); if (nb) nb.focus(); });
$("#skTree").addEventListener("click", e => { const b = e.target.closest("[data-id]"); if (!b) return; SK.pick = b.dataset.id; skRender(); const nb = $('#skTree [data-id="' + SK.pick + '"]'); if (nb) nb.focus(); });
$("#skDetail").addEventListener("click", e => { if (!e.target.closest("#skReview")) return; closeSheets(); setTrack(SK.lang); openBook("village"); });
$("#skClose").addEventListener("click", () => { closeSheets(); if (typeof V !== "undefined" && V.on) { document.body.style.overflow = "hidden"; vRepaint(); } });
$("#skl").addEventListener("keydown", e => { if (e.key === "Escape" && !$("#skl").hidden) { e.preventDefault(); $("#skClose").click(); } });

/* the tree in the middle of the village: gnarled trunk with bark, roots, glowing runes, a layered leafy crown with branches showing through,
   hanging lanterns, vines, moss and mushrooms. Its 24 lights show how much you know (lit ones glow gold). */
const SK_W = 160, SK_H = 112, SK_BX = 80, SK_BY = 108;
function skLightPts() { const o = []; for (let i = 0; i < 24; i++) { const r = .3 + .62 * Math.sqrt(i / 24), a = i * 2.399963; o.push([Math.round(SK_BX + Math.cos(a) * r * 58), Math.round(31 + Math.sin(a) * r * 24)]); } return o; }
function vSkillTree(S, lit) {
  const k = S.st / 4;
  return vBake(SK_W, SK_H, SK_BX, SK_BY, c => {
    const rnd = vrng(4242), disc = (cx, cy, r, col) => { for (let j = -r; j <= r; j++) { const hw = Math.round(Math.sqrt(Math.max(0, r * r - j * j))); vR(c, cx - hw, cy + j, hw * 2 + 1, 1, col); } };
    const bark = vmix("#4a2e1c", "#8a5a36", k), barkD = vmix("#2c1a10", "#5a3a22", k), barkL = vmix("#6a4426", "#b07a48", k), barkX = vmix("#1c1008", "#3a2414", k);
    const L0 = vmix("#082418", "#1f5a30", k), L1 = vmix("#0f3a28", "#2f8446", k), L2 = vmix("#175034", "#4aae60", k), L3 = vmix("#24704a", "#7ed07a", k), L4 = vmix("#3a9060", "#b4f0a0", k);
    const moss = vmix("#1a4a30", "#5cb060", k), stone = vmix("#2a2650", "#8f89a0", k), stoneL = vmix("#46427a", "#d0cad8", k);
    /* ground shadow and a ring of pebbles */
    c.globalAlpha = .28; for (let j = -8; j <= 8; j++) { const hw = Math.round(54 * Math.sqrt(1 - (j / 9) ** 2)); vR(c, SK_BX - hw, 103 + j, hw * 2, 1, "#05030f"); } c.globalAlpha = 1;
    for (let i = 0; i < 46; i++) { const a = i / 46 * Math.PI * 2, x = SK_BX + Math.round(Math.cos(a) * 40), y = 104 + Math.round(Math.sin(a) * 8); if (Math.sin(a) < -.2) continue; vR(c, x - 1, y, 3, 2, i % 3 ? stone : stoneL); vR(c, x - 1, y + 2, 3, 1, vmix(stone, "#000000", .4)); }
    /* roots flaring out of the ground */
    [[-1, 30, 10], [1, 28, 9], [-1, 18, 6], [1, 16, 6], [-1, 40, 4], [1, 36, 4]].forEach(([d, len, th], n) => { for (let t = 0; t <= len; t++) { const u = t / len, x = SK_BX + d * (4 + t), y = 94 + Math.round(u * 11 + Math.sin(u * 4 + n) * 1.5), w = Math.max(2, Math.round(th * (1 - u * .85))); vR(c, x, y - Math.round(w / 2), 1, w, bark); vR(c, x, y - Math.round(w / 2), 1, 1, barkL); vR(c, x, y + Math.round(w / 2) - 1, 1, 1, barkD); } });
    /* the trunk: twisting, tapering, with bark streaks, a knot and carved runes */
    for (let y = 100; y >= 52; y--) { const u = (100 - y) / 48, w = Math.round(21 - u * 8 + (u < .2 ? (.2 - u) * 18 : 0)), cx = SK_BX + Math.round(Math.sin(y * .13) * 2.2), x0 = cx - (w >> 1);
      vR(c, x0, y, w, 1, bark); vR(c, x0, y, 3, 1, barkD); vR(c, x0 + w - 3, y, 3, 1, barkL); vR(c, x0 + w - 1, y, 1, 1, barkD);
      for (let q = 0; q < 3; q++) if (rnd() < .5) { const sx = x0 + 3 + Math.floor(rnd() * (w - 6)); vR(c, sx, y, 1, 1 + Math.floor(rnd() * 3), rnd() < .6 ? barkD : barkL); } }
    disc(SK_BX - 3, 76, 3, barkX); disc(SK_BX - 3, 76, 2, barkD); vR(c, SK_BX - 4, 74, 2, 1, bark);
    for (let y = 60; y < 98; y += 3) vR(c, SK_BX - 9 + (y % 5), y, 1, 2, moss);
    const glow = lit > 0 ? "#a8ffb8" : "#35584a";
    [[SK_BX + 1, 64, "<>"], [SK_BX - 2, 88, "{}"]].forEach(([gx, gy, g]) => { if (lit > 0) { c.globalAlpha = .22; disc(gx + 1, gy + 2, 6, "#7aff9a"); c.globalAlpha = 1; }
      if (g === "<>") { [[3, 0], [2, 1], [1, 2], [2, 3], [3, 4]].forEach(([a, b]) => vR(c, gx + a - 3, gy + b, 1, 1, glow)); [[4, 0], [5, 1], [6, 2], [5, 3], [4, 4]].forEach(([a, b]) => vR(c, gx + a - 1, gy + b, 1, 1, glow)); }
      else { [[1, 0], [0, 1], [0, 2], [0, 3], [1, 4]].forEach(([a, b]) => vR(c, gx + a - 3, gy + b, 1, 1, glow)); [[5, 0], [6, 1], [6, 2], [6, 3], [5, 4]].forEach(([a, b]) => vR(c, gx + a - 1, gy + b, 1, 1, glow)); } });
    /* back half of the crown */
    const clusters = []; for (let i = 0; i < 70; i++) { const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()), cx = SK_BX + Math.round(Math.cos(a) * r * 56), cy = 31 + Math.round(Math.sin(a) * r * 22), rad = 7 + Math.floor(rnd() * 7); clusters.push({ cx, cy, rad, back: rnd() < .45 }); }
    clusters.sort((p, q) => p.cy - q.cy);
    const leafBall = cl => { const { cx, cy, rad } = cl; disc(cx + 1, cy + 2, rad, L0); disc(cx, cy, rad - 1, L1); disc(cx - 2, cy - 2, Math.max(2, rad - 4), L2); if (rad > 10) disc(cx - 3, cy - 3, rad - 8, L3);
      for (let q = 0; q < 9; q++) { const a = rnd() * Math.PI * 2, rr = rnd() * (rad - 2); vR(c, cx + Math.round(Math.cos(a) * rr) - 1, cy + Math.round(Math.sin(a) * rr) - 1, 2, 1, rnd() < .5 ? L4 : L0); }
      for (let q = 0; q < 8; q++) { const a = q / 8 * Math.PI * 2 + rnd() * .4, ex = cx + Math.round(Math.cos(a) * rad), ey = cy + Math.round(Math.sin(a) * rad); vR(c, ex - 1, ey - 1, 3, 2, a > 3.3 && a < 5.6 ? L2 : L1); vR(c, ex - 1, ey - 1, 2, 1, a > 3.3 && a < 5.6 ? L3 : L2); vR(c, ex, ey + 1, 1, 1, L0); }
      if (rnd() < .3) { const bx = cx + Math.round((rnd() - .5) * rad), by = cy + Math.round((rnd() - .5) * rad); vR(c, bx, by, 2, 2, rnd() < .5 ? "#ffb0d0" : "#fff4f8"); vR(c, bx, by, 1, 1, "#ffd84a"); } };
    clusters.filter(q => q.back).forEach(leafBall);
    /* branches reaching through the crown */
    const tips = [[-44, 14], [-26, 2], [-8, -6], [12, -4], [30, 4], [46, 16]];
    tips.forEach(([dx, dy], n) => { const x1 = SK_BX + dx, y1 = 52 + dy; for (let t = 0; t <= 40; t++) { const u = t / 40, x = Math.round(SK_BX + (x1 - SK_BX) * u), y = Math.round(56 + (y1 - 56) * u - Math.sin(u * Math.PI) * 5), w = Math.max(2, Math.round(6 * (1 - u))); vR(c, x - (w >> 1), y, w + 1, w, bark); vR(c, x - (w >> 1), y, 1, w, barkD); } });
    clusters.filter(q => !q.back).forEach(leafBall);
    /* drooping leaf fringe and vines */
    for (let i = 0; i < 30; i++) { const x = SK_BX - 60 + Math.floor(rnd() * 120), e = (x - SK_BX) / 58, ye = 31 + Math.sqrt(Math.max(0, 1 - e * e)) * 24; if (rnd() < .5) continue; vR(c, x, Math.round(ye) - 2, 2, 2 + Math.floor(rnd() * 3), L1); vR(c, x, Math.round(ye) - 2, 1, 1, L3); }
    [[-44, 8], [-22, 18], [28, 14], [48, 8], [8, 22], [-8, 12]].forEach(([dx, len], n) => { const x = SK_BX + dx, e = dx / 58, y0 = Math.round(31 + Math.sqrt(Math.max(0, 1 - e * e)) * 23); for (let t = 0; t < len; t++) { vR(c, x + Math.round(Math.sin(t * .6 + n) * 1), y0 + t, 1, 1, L1); if (t % 3 === 1) vR(c, x + (t % 2 ? 1 : -1), y0 + t, 2, 1, L3); } });
    /* hanging lanterns */
    [[-34, 40], [30, 42], [4, 50]].forEach(([dx, dy], n) => { const x = SK_BX + dx, y = dy + 6; vR(c, x, y - 8, 1, 8, barkX); vR(c, x - 2, y, 5, 1, "#3a3350"); vR(c, x - 2, y + 1, 5, 4, "#ffd86a"); vR(c, x - 1, y + 2, 3, 2, "#fff6c8"); vR(c, x - 2, y + 5, 5, 1, "#3a3350"); c.globalAlpha = .2; disc(x, y + 3, 6, "#ffd86a"); c.globalAlpha = 1; });
    /* the 24 lights: lit ones glow gold, the rest are dark buds */
    skLightPts().forEach(([x, y], i) => { if (i < lit) { c.globalAlpha = .28; disc(x, y, 5, "#ffe9a8"); c.globalAlpha = .45; disc(x, y, 3, "#ffe9a8"); c.globalAlpha = 1; vR(c, x - 1, y - 1, 3, 3, i < lit * .5 ? "#ffd23f" : "#fff1c0"); vR(c, x, y, 1, 1, "#ffffff"); } else { vR(c, x, y - 1, 1, 3, L0); vR(c, x - 1, y, 3, 1, L0); vR(c, x, y, 1, 1, vmix("#1f5a30", "#4a8a5a", k)); } });
    /* mushrooms, moss and flowers around the roots */
    [[-30, 104, 1], [26, 105, 1], [-14, 107, 0], [38, 104, 0]].forEach(([dx, y, r]) => { const x = SK_BX + dx; vR(c, x, y - 3, 1, 3, "#efe6cf"); vR(c, x - 2, y - 5, 5, 2, r ? "#e0383e" : "#6ad0ff"); vR(c, x - 1, y - 6, 3, 1, r ? "#e0383e" : "#6ad0ff"); if (r) { vR(c, x - 1, y - 5, 1, 1, "#fff"); vR(c, x + 1, y - 4, 1, 1, "#fff"); } else { c.globalAlpha = .3; disc(x, y - 4, 4, "#6ad0ff"); c.globalAlpha = 1; } });
    for (let i = 0; i < 14; i++) { const d = i % 2 ? 1 : -1, x = SK_BX + d * (8 + Math.floor(rnd() * 34)), y = 99 + Math.floor(rnd() * 7); vR(c, x, y, 2, 1, moss); if (i % 3 === 0) { vR(c, x, y - 2, 1, 2, "#3f8a3a"); vR(c, x - 1, y - 3, 3, 1, ["#ff7ab8", "#ffd23f", "#ffffff", "#c58bff"][i % 4]); } }
  });
}
/* falling leaves, twinkling lights and fireflies around the village tree (only drawn when motion is allowed) */
function vSkillAmb(c, t, sc) {
  const K = sc.skTree, ox = 320 - SK_BX, oy = 214 - SK_BY;
  for (let i = 0; i < K.lit; i++) { const p = K.pts[i], ph = Math.sin(t * 2.1 + i * 1.7); if (ph > .86) { c.fillStyle = "#fff"; c.fillRect(p[0] - 2, p[1], 5, 1); c.fillRect(p[0], p[1] - 2, 1, 5); } }
  for (let i = 0; i < 8; i++) { const u = (t * .09 + i / 8) % 1, x = ox + 22 + (i * 53) % 116 + Math.sin(t * .9 + i * 2) * 7 + u * 10, y = oy + 46 + u * 62; c.globalAlpha = u < .1 ? u * 10 : u > .88 ? (1 - u) * 8 : 1; c.fillStyle = i % 3 ? "#5cb060" : "#e0c060"; c.fillRect(Math.round(x), Math.round(y), 2, 1); c.fillRect(Math.round(x) + (i % 2 ? 1 : -1), Math.round(y) + 1, 1, 1); c.globalAlpha = 1; }
  for (let i = 0; i < 6; i++) { const a = t * (.5 + i * .07) + i * 1.9, x = 320 + Math.cos(a) * (28 + i * 6), y = 190 + Math.sin(a * 1.3) * (10 + i * 2) + i * 3, b = .5 + .5 * Math.sin(t * 3 + i); c.globalAlpha = .35 + .5 * b; c.fillStyle = "#ffe98a"; c.fillRect(Math.round(x), Math.round(y), 2, 2); c.globalAlpha = .12; c.fillRect(Math.round(x) - 2, Math.round(y) - 2, 6, 6); c.globalAlpha = 1; }
}
