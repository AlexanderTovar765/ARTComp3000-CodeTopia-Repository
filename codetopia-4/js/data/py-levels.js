/* Python track: levels, foes, Indent the Cobra half boss and Pythona, the Serpent Queen. */

"use strict";

const PY_LEVELS = [
  { n:"Hello, print", blurb:"Learn how a Python program prints to the console. Attack spells are one short line, and Heavy attack spells use two or three lines. There are no semicolons or braces in Python: each line is a statement.",
    foe:{ name:"Colon Slime", spr:"slime", pal:{l:"#6fb0ff",L:"#2f6fc4",h:"#d3e8ff",k:"#0f2347",e:"#0f2347"}, hp:95, dmg:[7,9], moves:["Unexpected Indent","Invalid Syntax"], weak:"print", k:1.15 } },
  { n:"Variables and types", blurb:"Variables store values, and you do not need a keyword to make one. Heavy attack spells now use two lines of code.",
    foe:{ name:"Type Bat", spr:"bat", pal:{b:"#ffd23f",B:"#c99a10"}, hp:115, dmg:[8,10], moves:["Type Error","Name Error"], weak:"types", k:1.25 } },
  { n:"Operators and strings", blurb:"Do maths, join text and build messages with f-strings. Python gives you // and ** for the jobs other languages need functions for.",
    foe:{ name:"F-String Ghost", spr:"ghost", pal:{w:"#d7eaff",G:"#7fb0e8"}, hp:125, dmg:[9,11], moves:["Unterminated String","Format Error"], weak:"fstr", k:1.1 } },
  { n:"Making decisions", blurb:"if, elif and else let a program choose, and indentation shows which lines belong to which choice. Block is unlocked, and some blocks mean fixing broken code.",
    foe:{ name:"Elif Slime", spr:"slime", pal:{l:"#ffe266",L:"#c9a417",h:"#fff6bf",k:"#2e2606",e:"#2e2606"}, hp:135, dmg:[10,12], moves:["Indentation Error","Missing Colon"], weak:"elif", k:1.2 } },
  { n:"Loops", blurb:"Half boss. Indent the Cobra rises and sways, and she decides what is inside the block. Repeat with for and range, keep going with while, and use break and continue.",
    foe:{ name:"Indent the Cobra", spr:"cobra", hp:230, dmg:[12,15], moves:["Tab Strike","Space Spit","Unindent Slam"], weak:"for", boss:true, k:1.2 } },
  { n:"Functions", blurb:"Functions package code so you can run it again. Pass values in with parameters and get one back with return. A lambda is a tiny function in one line.",
    foe:{ name:"Lambda Bat", spr:"bat", pal:{b:"#6fb0ff",B:"#2f6fc4"}, hp:145, dmg:[11,13], moves:["Anonymous Strike","Missing Return"], weak:"ret", k:1.25 } },
  { n:"Lists", blurb:"Store many values in one list. Counting starts at 0, and negative numbers count from the end. Item is unlocked: items heal you, and some have extra effects.",
    foe:{ name:"Slice Ghost", spr:"ghost", pal:{w:"#fff2c0",G:"#d9b44a"}, hp:155, dmg:[12,14], moves:["Index Error","Out Of Range"], weak:"append", k:1.1 } },
  { n:"Dictionaries", blurb:"Dictionaries group related values under names. Read them with brackets or get, add to them, loop over their pairs and put them inside lists.",
    foe:{ name:"Key Slime", spr:"slime", pal:{l:"#9be7a4",L:"#3fae5c",h:"#e0ffe4",k:"#12231f",e:"#12231f"}, hp:165, dmg:[13,15], moves:["Key Error","Missing Key"], weak:"dget", k:1.2 } },
  { n:"Comprehensions and tools", blurb:"Build whole lists in one line with comprehensions, then use enumerate, zip, sum, sorted and sets to do the loops for you. This is the Python way.",
    foe:{ name:"Comprehension Bat", spr:"bat", pal:{b:"#c2a3ff",B:"#7a52d6"}, hp:175, dmg:[14,16], moves:["Nested Loop","Generator Gas"], weak:"comp", k:1.25 } },
  { n:"The tower", blurb:"Pythona, the Serpent Queen, waits at the top of the tower. Every language you learned is in her hands now: HTML, CSS, C++, JavaScript and Python. Spells from all five can come back.",
    foe:{ name:"Pythona", spr:"pythona", spr2:"pythona2", hp:640, dmg:[18,23], moves:["Indentation Error","Import Curse","Slither Strike","Syntax Storm"], weak:"def", boss:true, finale:true, k:1.1 } }
];
