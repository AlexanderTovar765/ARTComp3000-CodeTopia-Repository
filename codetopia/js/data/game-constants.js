/* Spell words, actions, damage values and result rendering. */

"use strict";

const WORDS = ["Slash","Strike","Zap","Jab","Bolt","Spark","Smash","Gale","Ember","Frost","Quake","Flare","Gust","Thorn"];
const CLASSES = { fire:"Fire", ice:"Ice", gold:"Gold", boom:"Boom" };
const IDS = ["ward","gate","tower","altar","bridge"];
const TAGS = ["p","div","h1","em"];

const ACTIONS = {
  attack:{ label:"Attack", sub:"Text and content", key:"1", unlock:1,
    icon:'<path d="M5 19L19 5M15 5h4v4M7 14l3 3M4 20l3-3"/>' },
  heavy:{ label:"Heavy attack", sub:"Attributes, lists, tables", key:"2", unlock:2,
    icon:'<path d="M12 2l2.5 6.5L21 9l-5 4.5L17.5 21 12 17l-5.5 4L8 13.5 3 9l6.5-.5z"/>' },
  block:{ label:"Block", sub:"Structure and fixes", key:"3", unlock:4,
    icon:'<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/>' },
  item:{ label:"Item", sub:"Media and form controls", key:"4", unlock:7,
    icon:'<path d="M9 3h6M10 3v5l-5 9a3 3 0 002.6 4.5h8.8A3 3 0 0019 17l-5-9V3M8 15h8"/>' }
};
const DMG = { attack:[14,6], heavy:[30,10] };
const POTION = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges"><rect x="6" y="1" width="4" height="2" fill="#7a5a3a"/><rect x="7" y="3" width="2" height="3" fill="#cfe"/><rect x="4" y="6" width="8" height="8" fill="#ff7ab8"/><rect x="5" y="14" width="6" height="1" fill="#ff7ab8"/><rect x="5" y="7" width="2" height="3" fill="#ffc2e0"/></svg>');
const renderHTML = code => code.replace(/src="potion\.png"/g, 'src="' + POTION + '"');
const renderRes = les => TRK.id === "js" && les.sp.page ? jsPageFrame(les) : TRK.id === "cpp" || TRK.id === "js" ? '<pre class="con">' + escH(les.out.replace(/\s+$/, "")) + '</pre>' : renderHTML(les.code);
