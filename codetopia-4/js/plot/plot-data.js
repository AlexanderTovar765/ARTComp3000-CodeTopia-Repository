/* The Builders' Plot: the tables behind it. Every command or tag you can use is unlocked by a concept you have practised in that
   language's campaign (a few basics are free so you can always start). */

"use strict";

/* what each language can do on the plot; need = the concept id that unlocks it, nm = its name for the player */
const PL_UNLOCK = {
  html:{
    h1:{ need:null, nm:"Headings", d:"<h1> or <h2>: your house sign" },
    p:{ need:"p", nm:"Paragraphs", d:"<p>: a notice by the door" },
    strong:{ need:"emph", nm:"Strong, em and mark", d:"<strong> <em> <mark>: style the sign" },
    ul:{ need:"ul", nm:"Bullet lists", d:"<ul><li>: each item is a window" },
    ol:{ need:"ol", nm:"Numbered lists", d:"<ol><li>: each item is a step to the door" },
    a:{ need:"link", nm:"Links", d:"<a>: each link flies a flag" },
    div:{ need:"div", nm:"div and span", d:"<div>: each one adds a tower" },
    img:{ need:"img", nm:"Images", d:"<img>: a painting by the door" },
    header:{ need:"hf", nm:"header and footer", d:"<header> a banner, <footer> a flower box" },
    nav:{ need:"nav", nm:"Navigation", d:"<nav>: a signpost" },
    button:{ need:"button", nm:"Buttons", d:"<button>: a doorbell" },
    form:{ need:"form", nm:"Forms", d:"<form>: a mailbox" },
    table:{ need:"table", nm:"Tables", d:"<table>: a market stall" }
  },
  css:{
    color:{ need:null, nm:"Text color", d:"color: the sign's lettering" },
    "background-color":{ need:"bgc", nm:"Background color", d:"background-color: paint parts" },
    border:{ need:"bord", nm:"Borders", d:"border: outline a part" },
    "border-radius":{ need:"rad", nm:"Rounded corners", d:"border-radius: round doors and windows" },
    width:{ need:"size", nm:"Width and height", d:"width / height: resize parts" },
    display:{ need:"disp", nm:"Display", d:"display: none hides a part" },
    opacity:{ need:"opac", nm:"Opacity", d:"opacity: fade a part" },
    "box-shadow":{ need:"shadow", nm:"Shadows", d:"box-shadow: a glow" },
    gradient:{ need:"grad", nm:"Gradients", d:"linear-gradient: shaded roofs and walls" },
    transform:{ need:"xform", nm:"Transform", d:"transform: tilt and scale" }
  },
  js:{
    say:{ need:null, nm:"Printing with console.log", d:'say("Hello!")' },
    wait:{ need:"order", nm:"Running in order", d:"wait(1)  seconds" },
    wave:{ need:"str", nm:"Text in quotes", d:"wave()" },
    walk:{ need:"args", nm:"Several values", d:'walk("right", 3)  left, right, up, down' },
    jump:{ need:"let", nm:"let", d:"jump()" },
    spin:{ need:"const", nm:"const", d:"spin()" },
    dance:{ need:"for", nm:"for loops", d:"dance()" },
    heart:{ need:"fn", nm:"Functions", d:"heart()" }
  },
  py:{
    rose:{ need:null, nm:"Free", d:'plant("rose", 0, 0)' },
    tulip:{ need:"var", nm:"Variables", d:'plant("tulip", 1, 0)' },
    daisy:{ need:"arith", nm:"Arithmetic", d:'plant("daisy", 2, 0)' },
    sunflower:{ need:"if", nm:"if", d:'plant("sunflower", 3, 0)' },
    mushroom:{ need:"for", nm:"for and range", d:'plant("mushroom", 4, 0)' },
    tree:{ need:"def", nm:"Functions", d:'plant("tree", 5, 0)' },
    lily:{ need:"lst", nm:"Lists", d:'plant("lily", 6, 0)' },
    pumpkin:{ need:"dct", nm:"Dictionaries", d:'plant("pumpkin", 7, 0)' },
    water:{ need:"elif", nm:"elif", d:"water(col, row)" }
  },
  cpp:{
    red:{ need:null, nm:"Free", d:'launch("red", 4);' },
    gold:{ need:"var", nm:"Variables", d:'launch("gold", 4);' },
    blue:{ need:"if", nm:"if", d:'launch("blue", 4);' },
    green:{ need:"for", nm:"for loops", d:'launch("green", 4);' },
    violet:{ need:"func", nm:"Functions", d:'launch("violet", 4);' },
    pink:{ need:"vec", nm:"Vectors", d:'launch("pink", 4);' },
    white:{ need:"class", nm:"Classes", d:'launch("white", 4);' },
    pause:{ need:"endl", nm:"New lines", d:"pause(500);  milliseconds" }
  }
};
const PL_LANGS = [{ id:"html", name:"HTML", ext:"html" }, { id:"css", name:"CSS", ext:"css" }, { id:"js", name:"JavaScript", ext:"js" }, { id:"py", name:"Python", ext:"py" }, { id:"cpp", name:"C++", ext:"cpp" }];
const PL_WHAT = { html:"Builds the house", css:"Paints it", js:"Scripts your helper", py:"Grows the garden", cpp:"Lights the fireworks" };
const PL_NAMES = { html:"HTML", css:"CSS", js:"JavaScript", py:"Python", cpp:"C++" };

/* has the player practised this concept in that language? (admin mode unlocks everything) */
function plKnown(lang, need) {
  if (!need || D.admin) return true;
  const m = lang === D.track ? D.mast : (D.tracks && D.tracks[lang] && D.tracks[lang].mast);
  return !!(m && m[need] && m[need].seen);
}
const plOpen = (lang, key) => { const u = PL_UNLOCK[lang][key]; return !u || plKnown(lang, u.need); };
const plLockMsg = (lang, key) => { const u = PL_UNLOCK[lang][key]; return u ? (key + " unlocks when you learn “" + u.nm + "” in " + PL_NAMES[lang] + ".") : ""; };

const PL_START = {
  html:'<h1>My House</h1>\n<p>Welcome in!</p>\n<ul>\n  <li>Window one</li>\n  <li>Window two</li>\n</ul>\n',
  css:'.roof {\n  background-color: crimson;\n}\n\n.wall {\n  background-color: #f2d7a0;\n}\n\n.sign {\n  color: white;\n}\n',
  js:'say("Hello, I am your helper!");\nfor (let i = 0; i < 2; i++) {\n  walk("right", 2);\n  wave();\n  walk("left", 2);\n}\n',
  py:'for col in range(0, 8):\n    plant("rose", col, 0)\n',
  cpp:'int main() {\n  launch("red", 2);\n  launch("red", 6);\n  return 0;\n}\n'
};

/* tiny 3x5 pixel letters, used for the sign on your house */
const PL_FONT = (() => {
  const g = {
    A:"010101111101101", B:"110101110101110", C:"011100100100011", D:"110101101101110", E:"111100110100111", F:"111100110100100", G:"011100101101011", H:"101101111101101",
    I:"111010010010111", J:"001001001101010", K:"101101110101101", L:"100100100100111", M:"101111111101101", N:"110101101101101", O:"010101101101010", P:"110101110100100",
    Q:"010101101110011", R:"110101110101101", S:"011100010001110", T:"111010010010010", U:"101101101101111", V:"101101101101010", W:"101101111111101", X:"101101010101101",
    Y:"101101010010010", Z:"111001010100111", 0:"111101101101111", 1:"010110010010111", 2:"110001010100111", 3:"110001010001110", 4:"101101111001001", 5:"111100110001110",
    6:"011100111101111", 7:"111001010010010", 8:"111101111101111", 9:"111101111001110", "!":"010010010000010", ".":"000000000000010", "?":"110001010000010", "-":"000000111000000",
    "'":"010010000000000", ",":"000000000010100", ":":"000010000010000", " ":"000000000000000"
  };
  return g;
})();
function plText(c, text, x, y, col, scale) {
  const s = scale || 1; c.fillStyle = col; let cx = x;
  for (const ch of String(text).toUpperCase()) { const gl = PL_FONT[ch] || PL_FONT["?"];
    for (let i = 0; i < 15; i++) if (gl[i] === "1") c.fillRect(cx + (i % 3) * s, y + Math.floor(i / 3) * s, s, s);
    cx += 4 * s; }
  return cx - x - s;
}
const plTextW = (t, s) => Math.max(0, String(t).length * 4 * (s || 1) - (s || 1));
