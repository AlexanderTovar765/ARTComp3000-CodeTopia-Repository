/* Registry of the language tracks (HTML, C++). Everything language specific hangs off TRK. */

"use strict";

const classify = code => TRK.classify(code);
const mistakeHint = (les, idx) => TRK.hint(les, idx);
const TRACKS = {
  html:{ id:"html", lang:"HTML", CON, LEVELS, SP, classify:classifyHtml, hint:hintHtml, fill:/\{(\w)\}/g,
    subs:{ attack:"Text and content", heavy:"Attributes, lists, tables", block:"Structure and fixes", item:"Media and form controls" },
    mapSub:"Ten levels teach the fundamentals of HTML. Clear a level to unlock the next. Spells you have already learned come back for review, and the game adapts to how you are doing.",
    winTitle:"The Markup Titan falls",
    winText:() => "The first seal on Pythona's curse breaks and the HTML lands are free. You wrote " + D.casts + " spells. The road to C++ is now open: pick it from the language select." },
  cpp:{ id:"cpp", lang:"C++", CON:CPP_CON, LEVELS:CPP_LEVELS, SP:CPP_SP, classify:classifyCpp, hint:hintCpp, fill:/\$([a-z])/g,
    subs:{ attack:"Statements and output", heavy:"Variables, loops, functions", block:"Decisions and fixes", item:"Arrays and objects" },
    mapSub:"Ten levels teach the fundamentals of C++: printing, variables, decisions, loops, functions, arrays, strings, pointers and classes. Spells are real C++, and the console shows what each one prints. Every spell assumes #include <iostream> and using namespace std; at the top.",
    winTitle:"The Pointer Wraith falls",
    winText:() => "The second seal on Pythona's curse breaks and the C++ lands are free. You wrote " + D.casts + " spells in total. JavaScript and Python are still being built." }
};
let TRK = TRACKS.html;
