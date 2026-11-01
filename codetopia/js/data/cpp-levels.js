/* C++ track: levels, foes and the Pointer Wraith boss. */

"use strict";

const CPP_LEVELS = [
  { n:"Printing text", blurb:"Learn how a C++ program prints to the console. Only Attack is ready, so each spell is a short statement. Every spell assumes #include <iostream> and using namespace std; sit at the top of the file.",
    foe:{ name:"Semicolon Slime", spr:"slime", pal:{l:"#8fd0ff",L:"#4a8fd6",h:"#dff1ff",k:"#10203a",e:"#10203a"}, hp:90, dmg:[7,9], moves:["Missing Semicolon","Unmatched Brace"], weak:"semi", k:1.15 } },
  { n:"Variables and types", blurb:"Variables store values, and every one has a type. Heavy attack is unlocked. It hits hard and uses two lines of code.",
    foe:{ name:"Type Mismatch Bat", spr:"bat", pal:{b:"#4fd1c5",B:"#2a8a82"}, hp:110, dmg:[8,10], moves:["Type Mismatch","Uninitialised Variable"], weak:"types", k:1.25 } },
  { n:"Operators and input", blurb:"Do maths with operators, and read what the player types with cin. Watch out for integer division.",
    foe:{ name:"Overflow Ghost", spr:"ghost", pal:{w:"#ffe6b3",G:"#e0b45a"}, hp:120, dmg:[9,11], moves:["Integer Overflow","Divide By Zero"], weak:"divmod", k:1.1 } },
  { n:"Making decisions", blurb:"if, else and logic let a program choose. Block is unlocked, and some blocks mean fixing broken code.",
    foe:{ name:"Branch Slime", spr:"slime", pal:{l:"#ffb26b",L:"#d6762a",h:"#ffe4c7",k:"#3a1c08",e:"#3a1c08"}, hp:130, dmg:[10,12], moves:["Dangling Else","Assignment In Condition"], weak:"cmp", k:1.2 } },
  { n:"Loops", blurb:"Boss fight. Loops repeat code, and this boss never stops repeating. Count with while and for, and use break and continue.",
    foe:{ name:"The Infinite Loop", spr:"golem", pal:{g:"#9fe0b4",e:"#ffd23f"}, hp:220, dmg:[12,15], moves:["Endless Loop","Off By One"], weak:"for", boss:true, k:1.2 } },
  { n:"Functions", blurb:"Functions package code so you can call it again. Pass values in with parameters and get one back with return.",
    foe:{ name:"Undefined Reference Bat", spr:"bat", pal:{b:"#ff9f5a",B:"#c46a2c"}, hp:140, dmg:[11,13], moves:["Undefined Reference","Missing Return"], weak:"ret", k:1.25 } },
  { n:"Arrays and vectors", blurb:"Store many values in one place. Item is unlocked: items heal you, and some have extra effects.",
    foe:{ name:"Out Of Bounds Ghost", spr:"ghost", pal:{w:"#d8c8ff",G:"#9a7fe0"}, hp:150, dmg:[12,14], moves:["Index Out Of Bounds","Empty Vector"], weak:"vec", k:1.1 } },
  { n:"Strings", blurb:"Strings are lists of characters. Measure them, join them, and cut pieces out of them.",
    foe:{ name:"Buffer Slime", spr:"slime", pal:{l:"#ff8a8a",L:"#d64a4a",h:"#ffd6d6",k:"#3a1010",e:"#3a1010"}, hp:160, dmg:[13,15], moves:["Buffer Overrun","Null Terminator"], weak:"slen", k:1.2 } },
  { n:"References and pointers", blurb:"Meet memory itself. References are second names, and pointers hold addresses. This is where C++ gets its reputation.",
    foe:{ name:"Memory Leak Bat", spr:"bat", pal:{b:"#6bd36b",B:"#2f8a2f"}, hp:170, dmg:[14,16], moves:["Memory Leak","Double Free"], weak:"new", k:1.25 } },
  { n:"Structs and classes", blurb:"Section boss: the Pointer Wraith, champion of C++. Build small structs and classes, and fix broken ones. Spells from every level can come back.",
    foe:{ name:"Pointer Wraith", spr:"wraith", hp:340, dmg:[16,20], moves:["Null Dereference","Dangling Pointer","Segfault"], weak:"ptr", boss:true, k:1.25 } }
];
