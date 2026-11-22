/* Turns a sprite definition into an SVG. */

"use strict";

function spriteSVG(def){
  const rows = def.px, h = rows.length, w = rows[0].length; let r = "";
  rows.forEach((row, y) => { let x = 0;
    while (x < w) { const c = row[x]; if (c === ".") { x++; continue; }
      let x2 = x; while (x2 < w && row[x2] === c) x2++;
      r += `<rect x="${x}" y="${y}" width="${x2 - x}" height="1" fill="${def.pal[c]}"/>`; x = x2; } });
  return `<svg class="sprite" viewBox="0 0 ${w} ${h}" style="--cols:${w};--rows:${h}${def.sc ? ";--sc:" + def.sc : ""}" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
}
const foeSVG = f => spriteSVG({ px:SPRITES[f.spr].px, sc:SPRITES[f.spr].sc, pal:Object.assign({}, SPRITES[f.spr].pal, f.pal || {}) });

/* The beaten-up version of a foe, used on the level map once the level is cleared: faded colours, a bandage, a plaster, bruises and dizzy stars. */
function beatenDef(def){
  const rows = def.px.map(r => r.split("")), h = rows.length, w = rows[0].length, pal = {};
  Object.keys(def.pal).forEach(k => { const n = parseInt(def.pal[k].slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255], g = .3 * c[0] + .59 * c[1] + .11 * c[2];
    pal[k] = "#" + c.map(v => Math.round((v * .5 + g * .5) * .82).toString(16).padStart(2, "0")).join(""); });
  Object.assign(pal, { "~":"#f3ead6", "`":"#b8ad92", "!":"#4e3560", "+":"#ffd23f" });
  let x0 = w, x1 = 0, y0 = h, y1 = 0;
  rows.forEach((r, y) => r.forEach((c, x) => { if (c !== ".") { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }));
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1, put = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (rows[y] && rows[y][x] && rows[y][x] !== ".") rows[y][x] = c; };
  const ya = y0 + bh * .38, yb = y0 + bh * .66;
  for (let y = Math.round(ya); y <= Math.round(yb); y++) { const x = x0 + bw * .12 + (y - ya) * (bw * .62 / (yb - ya)); for (let d = 0; d < 3; d++) put(x + d, y, (y + d) % 3 === 0 ? "`" : "~"); }
  const px = x0 + bw * .7, py = y0 + bh * .22; [[0,0],[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx, dy]) => put(px + dx, py + dy, "~"));
  [[.28,.74],[.66,.58],[.42,.32]].forEach(([fx, fy]) => { const bx = x0 + bw * fx, by = y0 + bh * fy; [[0,0],[1,0],[0,1],[1,1]].forEach(([dx, dy]) => put(bx + dx, by + dy, "!")); });
  const pad = 6, out = []; for (let i = 0; i < pad; i++) out.push(new Array(w).fill("."));
  rows.forEach(r => out.push(r));
  const cx = Math.round((x0 + x1) / 2); [[-7,2],[0,0],[7,2]].forEach(([dx, dy]) => { const sx = cx + dx, sy = pad + y0 - 4 + dy - 1; [[0,0],[1,0],[-1,0],[0,1],[0,-1]].forEach(([ax, ay]) => { if (out[sy + ay] && sx + ax >= 0 && sx + ax < w) out[sy + ay][sx + ax] = "+"; }); });
  return { px:out.map(r => r.join("")), pal, sc:def.sc };
}
const foeBeatenSVG = f => spriteSVG(beatenDef({ px:SPRITES[f.spr].px, sc:SPRITES[f.spr].sc, pal:Object.assign({}, SPRITES[f.spr].pal, f.pal || {}) }));
