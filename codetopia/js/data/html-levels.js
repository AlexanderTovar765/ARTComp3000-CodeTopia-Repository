/* HTML track: levels, foes, bosses and backdrop themes. */

"use strict";

/* ================= curriculum: levels and foes ================= */
let LEVELS = [
  { n:"Tags and text", blurb:"Learn how tags wrap text. Only Attack is ready, so every spell is a single element.",
    foe:{ name:"Syntax Slime", spr:"slime", hp:90, dmg:[7,9], moves:["Missing Bracket","Stray Semicolon"], weak:"emph", k:1.15 } },
  { n:"Attributes and links", blurb:"Attributes add detail to a tag. Heavy attack is unlocked. It hits hard and uses longer code.",
    foe:{ name:"Broken Link Bat", spr:"bat", hp:110, dmg:[8,10], moves:["Dead Link","Wrong Href"], weak:"link", k:1.25 } },
  { n:"Lists and void elements", blurb:"Some tags stand alone, and lists group items. Practise both with Attack and Heavy attack.",
    foe:{ name:"Stray Tag Ghost", spr:"ghost", hp:120, dmg:[9,11], moves:["Unclosed Tag","Phantom Break"], weak:"ul", k:1.1 } },
  { n:"Containers and nesting", blurb:"Containers group content, and order matters when tags sit inside each other. Block is unlocked, and some blocks mean fixing broken code.",
    foe:{ name:"Div Slime", spr:"slime", pal:{l:"#7bb8ff",L:"#3f78d6",h:"#d6e8ff",k:"#10203a",e:"#10203a"}, hp:130, dmg:[10,12], moves:["Div Soup","Crossed Tags"], weak:"ent", k:1.2 } },
  { n:"The page skeleton", blurb:"Boss fight. Every page needs a skeleton, and this boss has none. Spells now run over several lines: press Enter at the end of each line.",
    foe:{ name:"The Blank Page", spr:"golem", hp:220, dmg:[12,15], moves:["Empty Head","No Doctype"], weak:"doctype", boss:true, k:1.2 } },
  { n:"Semantic layout", blurb:"Semantic tags say what each part of a page is for. Use them instead of plain divs.",
    foe:{ name:"Div-itis Bat", spr:"bat", pal:{b:"#ff9f5a",B:"#c46a2c"}, hp:140, dmg:[11,13], moves:["Div Overload","Meaningless Markup"], weak:"hf", k:1.25 } },
  { n:"Images and media", blurb:"Pictures and media. Item is unlocked: items heal you, and some have extra effects.",
    foe:{ name:"Missing Alt Ghost", spr:"ghost", pal:{w:"#bff5ea",G:"#7fd1c2"}, hp:150, dmg:[12,14], moves:["Blank Alt","Broken Image"], weak:"alt", k:1.1 } },
  { n:"Tables", blurb:"Tables arrange data in rows and columns.",
    foe:{ name:"Table Slime", spr:"slime", pal:{l:"#ff8a8a",L:"#d64a4a",h:"#ffd6d6",k:"#3a1010",e:"#3a1010"}, hp:160, dmg:[13,15], moves:["Orphan Cell","Row Crash"], weak:"table", k:1.2 } },
  { n:"Forms", blurb:"Forms collect input from visitors. Labels, boxes and buttons all work together.",
    foe:{ name:"Spam Bat", spr:"bat", pal:{b:"#ff6b81",B:"#b83a55"}, hp:170, dmg:[14,16], moves:["Empty Field","Submit Flood"], weak:"label", k:1.25 } },
  { n:"Build a page", blurb:"Section boss: the Markup Titan, champion of HTML. Build whole pages and fix a broken one. Spells from every level can come back.",
    foe:{ name:"Markup Titan", spr:"titan", hp:300, dmg:[15,19], moves:["Tag Storm","Unclosed Tag","Bracket Slam"], weak:"nest", boss:true, k:1.2 } },
  /* admin-mode boss arenas: the JavaScript and Python lessons are not built yet, so these bosses fight with HTML spells. They are reached from the language select. */
  { arena:true, lang:"py", tag:"Python", n:"Python boss arena", blurb:"Admin test fight. The Python lessons are not built yet, so Pythona fights with HTML spells.",
    foe:{ name:"Pythona", spr:"pythona", spr2:"pythona2", hp:600, dmg:[18,23], moves:["Indentation Error","Import Curse","Slither Strike"], weak:"nest", boss:true, k:1.1 } }
];
let NREAL = LEVELS.filter(l => !l.arena).length;
const THEMES = [
  { sky:["#1a1545","#241d5a","#312670","#4b2f7c","#7a4380","#b25d7a","#e0856e","#f2a672"], far:"#2f2766", farE:"#3d3380", near:"#251d54", nearE:"#31286b", tree:"#1b1542", trunk:"#15103a" },
  { sky:["#070a1f","#0b1230","#101a45","#17285e","#20407a","#2f5d93","#4a85a8","#78b2bd"], far:"#16305a", farE:"#1f4373", near:"#102445", nearE:"#183559", tree:"#0a1a33", trunk:"#071326" },
  { sky:["#2b2a6b","#42418c","#6a5ba8","#9b73b5","#d08cae","#f0a0a0","#ffc08a","#ffe0a0"], far:"#5b4a8f", farE:"#7a62a8", near:"#3d3270", nearE:"#54448a", tree:"#2a2158", trunk:"#1d1642" },
  { sky:["#12060f","#240a1b","#3a0f26","#561434","#7d1c3f","#a52a4a","#cf4a55","#e8744f"], far:"#3a1530", farE:"#5a2045", near:"#2a0f25", nearE:"#401a38", tree:"#18091a", trunk:"#10050f" }
];
const themeFor = n => n > NREAL ? 3 : n <= 3 ? 0 : n <= 6 ? 1 : n <= 9 ? 2 : 3;
