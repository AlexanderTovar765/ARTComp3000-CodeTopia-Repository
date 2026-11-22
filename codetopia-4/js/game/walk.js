/* Walk cycles. Every skin walks in four directions, made from the art it already has:
   - down  : its front art, legs alternating and a little bounce
   - up    : the same art seen from behind (the face is painted over with hair or hood)
   - side  : its battle (3/4) art with a stride; the left-facing version is just mirrored
   A frame is a grid of colours with one spare row on top so the bounce never clips the hat.
   Phases: 0 = left foot up, 1 = passing, 2 = right foot up, 3 = passing, 4 = standing. */
const WALK = (() => {
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const lum = h => { const [r, g, b] = hex(h); return .3 * r + .59 * g + .11 * b; };
  const skinLike = h => {
    const [r, g, b] = hex(h), mx = Math.max(r, g, b), mn = Math.min(r, g, b); if (mx < 150 || mx === mn) return false;
    const s = (mx - mn) / mx; let hu = mx === r ? 60 * (((g - b) / (mx - mn) + 6) % 6) : mx === g ? 60 * ((b - r) / (mx - mn) + 2) : 60 * ((r - g) / (mx - mn) + 4);
    return hu >= 8 && hu <= 48 && s >= .12 && s <= .62;
  };
  const grid = def => def.px.map(r => Array.from(r, ch => (ch !== "." && def.pal[ch]) ? def.pal[ch] : null));
  const blank = (w, h) => Array.from({ length:h }, () => Array(w).fill(null));
  const lastRow = g => { for (let y = g.length - 1; y >= 0; y--) if (g[y].some(Boolean)) return y; return g.length - 1; };
  const bandBox = (g, bot, n) => { let a = 99, b = -1; for (let y = Math.max(0, bot - n + 1); y <= bot; y++) g[y].forEach((c, x) => { if (c) { a = Math.min(a, x); b = Math.max(b, x); } }); return [a, b]; };

  /* Where the face is, for skins the detector cannot work out: boxes [x0, y0, x1, y1, colour painted over it]. */
  const FACE = {
    tin_woodman:[[10, 9, 19, 16, "#8795b5"]], the_creature:[[14, 3, 23, 11, "#c4b45c"]], mina_harker:[[5, 4, 14, 14, "#3a2230"]],
    jekyll_and_hyde:[[9, 9, 22, 20, "#1a1620"]], dr_moreau:[[11, 8, 20, 17, "#eceaf4"]], wicked_witch:[[8, 12, 19, 20, "#16121e"]],
    baba_yaga:[[10, 12, 21, 20, "#c8c8d4"]], zorro:[[9, 11, 21, 19, "#14141c"]], cthulhu:[[9, 3, 20, 19, "#4f7a58"]],
    medusa:[[10, 11, 20, 20, "#4a9a38"]], carmilla:[[11, 10, 20, 17, "#0e0a14"]], beowulf:[[8, 6, 17, 11, "#c8a040"]],
    phantom_of_the_opera:[[10, 11, 21, 20, "#0a0a12"]], nosferatu:[[10, 5, 21, 15, "#fafaf2"]], green_knight:[[10, 8, 21, 15, "#16361a"]],
    hero:[[8, 17, 18, 19, "#8a5a30"], [8, 20, 18, 21, "#6a4424"]], hero_red:[[8, 17, 18, 19, "#8a5a30"], [8, 20, 18, 21, "#6a4424"]], hero_detective:[[8, 17, 18, 19, "#8a5a30"], [8, 20, 18, 21, "#6a4424"]], pythona_robe:[[8, 17, 18, 19, "#8a5a30"], [8, 20, 18, 21, "#6a4424"]],
    robin_hood:[[10, 11, 20, 18, "#6b4a2a"]],
    kaa:[[9, 2, 21, 10, "#5c9a3c"]], the_raven:[[18, 2, 21, 4, "#2c2c44"]], rur_soldier:[[7, 11, 18, 19, "#5e6b7c"]], count_dracula:[[6, 8, 19, 16, "#3a3560"]], captain_hook:[[11, 10, 20, 19, "#1a1218"]],
    ebenezer_scrooge:[[7, 11, 18, 20, "#e8e4e0"]]
  };

  /* The face is the patch of one colour in the head that has the most little things inside it (eyes, mouth, nose). */
  function findFace(g, head) {
    const h = head, w = g[0].length, lab = blank(w, h), comps = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const c = g[y][x]; if (!c || lab[y][x] !== null || lum(c) < 28) continue;
      const cells = [], st = [[x, y]]; lab[y][x] = comps.length;
      while (st.length) { const [px, py] = st.pop(); cells.push([px, py]); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = px + dx, ny = py + dy; if (nx >= 0 && ny >= 0 && nx < w && ny < h && g[ny][nx] === c && lab[ny][nx] === null) { lab[ny][nx] = comps.length; st.push([nx, ny]); } }); }
      comps.push(cells);
    }
    let best = null, bestN = 1;
    comps.forEach((cells, id) => {
      if (cells.length < 6) return;
      let x0 = 99, y0 = 99, x1 = -1, y1 = -1; cells.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); });
      const bw = x1 - x0 + 3, bh = y1 - y0 + 3, out = blank(bw, bh), mine = blank(bw, bh);
      cells.forEach(([x, y]) => { mine[y - y0 + 1][x - x0 + 1] = true; });
      const st = [[0, 0]]; out[0][0] = true;
      while (st.length) { const [px, py] = st.pop(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = px + dx, ny = py + dy; if (nx >= 0 && ny >= 0 && nx < bw && ny < bh && !out[ny][nx] && !mine[ny][nx]) { out[ny][nx] = true; st.push([nx, ny]); } }); }
      const holes = []; for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) if (!out[y][x] && !mine[y][x]) { const gx = x + x0 - 1, gy = y + y0 - 1; if (gy < h && g[gy][gx]) holes.push([gx, gy]); }
      if (holes.length > bestN && holes.length < cells.length) { bestN = holes.length; best = cells.concat(holes); }
    });
    return best;
  }

  const dist = (p, q) => { const a = hex(p), b = hex(q); return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); };
  /* Skins whose body is a pattern or a creature, so flattening the chest would only make it dull. */
  /* Long hair that hangs down the back: [rows painted, colour]. */
  const HAIR_DOWN = { carmilla:[8, "#0e0a14"] };
  const KEEP_BODY = { kaa:1, cthulhu:1, medusa:1, the_raven:1, cheshire_cat:1, winnie_the_pooh:1 };

  /* Seen from behind there is no shirt front, cravat, cross, buttons or sash: anything in the middle of the body that is not the
     main cloth colour is painted over with it. A band that runs right across (a belt) stays, because belts wrap round. */
  function bodyBack(g, out, top, bot, id) {
    if (HAIR_DOWN[id]) { const [n, col] = HAIR_DOWN[id]; for (let y = top; y < top + n; y++) for (let x = 0; x < g[0].length; x++) if (g[y][x] && lum(g[y][x]) > 28 && dist(g[y][x], col) > 30 && x > 4 && x < 25) out[y][x] = col; return; }
    let a = 99, b = -1;
    for (let y = top; y <= bot; y++) g[y].forEach((c, x) => { if (c) { a = Math.min(a, x); b = Math.max(b, x); } });
    if (b < 0) return;
    const cx = (a + b + 1) / 2, hw = Math.max(4, Math.round((b - a + 1) * .28)), x0 = Math.floor(cx - hw), x1 = Math.ceil(cx + hw) - 1, cnt = {};
    for (let y = top; y <= bot; y++) for (let x = x0; x <= x1; x++) { const c = g[y][x]; if (c && lum(c) > 28) cnt[c] = (cnt[c] || 0) + 1; }
    const dom = Object.keys(cnt).sort((p, q) => cnt[q] - cnt[p])[0]; if (!dom) return;
    for (let y = top; y <= bot; y++) {
      const odd = []; for (let x = x0; x <= x1; x++) { const c = g[y][x]; if (c && lum(c) > 28 && dist(c, dom) > 48) odd.push(x); }
      if (odd.length >= (x1 - x0 + 1) * .8) continue;
      odd.forEach(x => { out[y][x] = dom; });
    }
  }

  /* The same figure from behind: the face is painted over with whatever sits above it (hair, hat, hood), and the front of the body is plain. */
  function backOf(g, id) {
    const h = g.length, w = g[0].length, bot = lastRow(g), head = Math.floor((bot + 1) * .6), out = g.map(r => r.slice()), face = blank(w, h);
    if (FACE[id]) FACE[id].forEach(([x0, y0, x1, y1, col]) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (g[y][x] && lum(g[y][x]) > 28 || (g[y][x] && col && lum(g[y][x]) <= 28 && x > x0 && x < x1 && y > y0 && y < y1)) { face[y][x] = col || true; } });
    else {
      const f = findFace(g, head);
      if (f) f.forEach(([x, y]) => { face[y][x] = true; });
      else for (let y = 0; y < head; y++) { let a = -1, b = -1, n = 0; g[y].forEach((c, x) => { if (c && skinLike(c)) { if (a < 0) a = x; b = x; n++; } }); if (n >= 2) for (let x = a; x <= b; x++) if (g[y][x]) face[y][x] = true; }
    }
    const cnt = {}; for (let y = 0; y < head; y++) g[y].forEach((c, x) => { if (c && !face[y][x] && lum(c) > 28) cnt[c] = (cnt[c] || 0) + 1; });
    const hair = Object.keys(cnt).sort((p, q) => cnt[q] - cnt[p])[0] || "#3a2a1a";
    for (let y = 0; y < head; y++) for (let x = 0; x < w; x++) if (face[y][x]) {
      let col = null; for (let k = y - 1; k >= 0; k--) { const c = g[k][x]; if (c && !face[k][x] && lum(c) > 28) { col = c; break; } if (!c) break; }
      out[y][x] = typeof face[y][x] === "string" ? face[y][x] : (col || hair);
    }
    let fb = -1; face.forEach((r, y) => { if (r.some(Boolean)) fb = y; });
    if (!KEEP_BODY[id]) bodyBack(g, out, (fb >= 0 ? fb : Math.floor(bot * .4)) + 1, bot - 4, id);
    return out;
  }

  /* One frame. kind "fb" = front or back, "s" = side. Returns a grid one row taller than the art. */
  function frame(g, kind, ph) {
    const h = g.length, w = g[0].length, o = blank(w, h + 1), bot = lastRow(g), n = kind === "s" ? 4 : 3, top = bot - n + 1, [a, b] = bandBox(g, bot, 4), cx = (a + b + 1) / 2;
    const put = (y, x, c) => { if (c && x >= 0 && x < w && y >= 0) o[y][x] = c; };
    const body = (up) => { for (let y = 0; y < top; y++) for (let x = 0; x < w; x++) o[y + (up ? 0 : 1)][x] = g[y][x]; };
    if (ph === 4) { for (let y = 0; y <= bot; y++) for (let x = 0; x < w; x++) o[y + 1][x] = g[y][x]; return o; }
    if (ph === 1 || ph === 3) {                       /* passing: body rises, feet stay, one row stretched to close the gap */
      body(true); for (let x = 0; x < w; x++) o[top][x] = o[top - 1][x] || g[top][x] ? (o[top - 1][x] || g[top][x]) : null;
      for (let y = top; y <= bot; y++) for (let x = 0; x < w; x++) if (g[y][x]) o[y + 1][x] = g[y][x];
      return o;
    }
    body(false);
    if (kind === "fb") {
      const left = ph === 0;
      for (let y = top; y <= bot; y++) for (let x = 0; x < w; x++) { const lift = left ? x < cx : x >= cx; if (g[y][x]) put(lift ? y : y + 1, x, g[y][x]); }
    } else {
      /* side: one leg reaches forward and plants, the other trails and lifts. */
      const frontPlant = ph === 0;
      for (let y = top; y <= bot; y++) for (let x = 0; x < w; x++) if (g[y][x]) {
        const isFront = x >= cx;
        if (frontPlant) { if (isFront) put(y + 1, x + 1, g[y][x]); else put(y, x, g[y][x]); }
        else { if (isFront) put(y, x, g[y][x]); else put(y + 1, x + 1, g[y][x]); }
      }
    }
    return o;
  }

  const cache = new Map();
  const raster = g => { const h = g.length, w = g[0].length, o = vCanvas(w, h); g.forEach((r, y) => r.forEach((c, x) => { if (c) { o.c.fillStyle = c; o.c.fillRect(x, y, 1, 1); } })); return { cv:o.cv, w, h }; };
  function set(id) {
    let s = cache.get(id); if (s) return s;
    const front = grid(skinDef(id)), side = grid(battleDef(id)), back = backOf(front, id);
    const mk = (g, kind) => [0, 1, 2, 3, 4].map(ph => raster(frame(g, kind, ph)));
    s = { down:mk(front, "fb"), up:mk(back, "fb"), side:mk(side, "s") }; cache.set(id, s); return s;
  }
  /* face: "down" | "up" | "side"; ph: 0-3 while walking, 4 standing. */
  return { set, frame, backOf, grid, sprite:(id, face, ph) => set(id)[face][ph] };
})();
