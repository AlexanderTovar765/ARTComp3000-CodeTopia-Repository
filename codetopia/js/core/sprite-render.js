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
