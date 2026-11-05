/* JavaScript track: levels, foes, the Index the Hamster half boss and the Callback Hydra. */

"use strict";

const JS_LEVELS = [
  { n:"Hello, console", blurb:"Learn how a JavaScript program prints to the console. Only Attack is ready, so each spell is a short statement. Strings go in quotes and statements end in semicolons.",
    foe:{ name:"Undefined Slime", spr:"slime", pal:{l:"#ffe266",L:"#c9a417",h:"#fff6bf",k:"#2e2606",e:"#2e2606"}, hp:90, dmg:[7,9], moves:["Unexpected Token","Missing Semicolon"], weak:"log", k:1.15 } },
  { n:"Variables and types", blurb:"Variables store values. Use let for values that change and const for values that never do. Heavy attack is unlocked. It hits hard and uses two lines of code.",
    foe:{ name:"Const Bat", spr:"bat", pal:{b:"#ffbf3f",B:"#c78a14"}, hp:110, dmg:[8,10], moves:["Assignment To Constant","Not Defined"], weak:"const", k:1.25 } },
  { n:"Operators and strings", blurb:"Do maths, join strings and build text with template literals. Watch out for what happens when text and numbers meet.",
    foe:{ name:"NaN Ghost", spr:"ghost", pal:{w:"#fff1b8",G:"#e0b94a"}, hp:120, dmg:[9,11], moves:["Not A Number","Stringly Typed"], weak:"coerce", k:1.1 } },
  { n:"Making decisions", blurb:"if, else and logic let a program choose. Block is unlocked, and some blocks mean fixing broken code.",
    foe:{ name:"Loose Equality Slime", spr:"slime", pal:{l:"#ffb26b",L:"#d6762a",h:"#ffe4c7",k:"#3a1c08",e:"#3a1c08"}, hp:130, dmg:[10,12], moves:["Truthy Trick","Type Coercion"], weak:"strict", k:1.2 } },
  { n:"Loops", blurb:"Half boss. Index the Hamster runs on a wheel that never stops turning. Count with while and for, skip turns with continue, leave with break, and visit things with for...of.",
    foe:{ name:"Index the Hamster", spr:"hamster", hp:220, dmg:[12,15], moves:["Wheel Spin","Off By One","Index Overrun"], weak:"for", boss:true, k:1.2 } },
  { n:"Functions", blurb:"Functions package code so you can run it again. Pass values in with parameters and get one back with return. Arrow functions are a short way to write them.",
    foe:{ name:"Hoisting Bat", spr:"bat", pal:{b:"#ff9f5a",B:"#c46a2c"}, hp:140, dmg:[11,13], moves:["Hoisted Declaration","Missing Return"], weak:"ret", k:1.25 } },
  { n:"Arrays", blurb:"Store many values in one list. Counting starts at 0. Item is unlocked: items heal you, and some have extra effects.",
    foe:{ name:"Index Ghost", spr:"ghost", pal:{w:"#e6d8ff",G:"#a58be0"}, hp:150, dmg:[12,14], moves:["Out Of Range","Undefined Element"], weak:"push", k:1.1 } },
  { n:"Objects", blurb:"Objects group related values under names. Read them with a dot, add to them, and put functions inside them as methods.",
    foe:{ name:"Property Slime", spr:"slime", pal:{l:"#ff8a8a",L:"#d64a4a",h:"#ffd6d6",k:"#3a1010",e:"#3a1010"}, hp:160, dmg:[13,15], moves:["Cannot Read Properties","Missing Key"], weak:"dot", k:1.2 } },
  { n:"Array methods and callbacks", blurb:"Pass a function to map, filter, find, forEach and reduce, and let the array do the looping. A function passed to another function is a callback.",
    foe:{ name:"Callback Bat", spr:"bat", pal:{b:"#6bd36b",B:"#2f8a2f"}, hp:170, dmg:[14,16], moves:["Callback Hell","Lost Context"], weak:"map", k:1.25 } },
  { n:"The page comes alive", blurb:"Section boss: the Callback Hydra, champion of JavaScript. Here your code changes a real page. Find elements, change them, react to clicks and run timers. Spells from every level can come back.",
    foe:{ name:"Callback Hydra", spr:"hydra", hp:360, dmg:[17,21], moves:["Callback Hell","Undefined Is Not A Function","Promise Rejection"], weak:"ev", boss:true, k:1.2 } }
];
