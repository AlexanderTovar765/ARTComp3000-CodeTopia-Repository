/* Registry of the language tracks (HTML, C++). Everything language specific hangs off TRK. */

"use strict";

/* the road to the next language, only mentioned when it is open; and a note when a chosen curriculum has just been completed */
const roadTo = (id, text) => trackOpen(id) ? " " + text : "";
const pickNote = () => isCustom() && picksDone() && TRACK_ORDER.some(id => !D.picks.includes(id)) ? " You have finished everything you picked, so the rest of Codetopia is open if you want to keep going." : "";
const classify = code => TRK.classify(code);
const trkOf = les => TRACKS[les.track] || TRK;
const mistakeHint = (les, idx) => trkOf(les).hint(les, idx);
const TRACKS = {
  html:{ id:"html", lang:"HTML", CON, LEVELS, SP, classify:classifyHtml, hint:hintHtml, fill:/\{(\w)\}/g,
    subs:{ attack:"Text and content", heavy:"Attributes, lists, tables", block:"Structure and fixes", item:"Media and form controls" },
    mapSub:"Ten levels teach the fundamentals of HTML. Clear a level to unlock the next. Spells you have already learned come back for review, and the game adapts to how you are doing.",
    winTitle:"The Markup Titan falls",
    winText:() => "The first seal on Pythona's curse breaks and the HTML lands are free. You wrote " + D.casts + " spells." + roadTo("css", "The road to the CSS forest is now open: pick it from the village.") + pickNote() },
  css:{ id:"css", lang:"CSS", CON:CSS_CON, LEVELS:CSS_LEVELS, SP:CSS_SP, classify:classifyCss, hint:hintCss, fill:/\$([a-z])/g,
    subs:{ attack:"Colors and text", heavy:"Fonts, boxes, layout", block:"Spacing and fixes", item:"Flex, grid and motion" },
    mapSub:"Ten levels teach the fundamentals of CSS, through a sunny forest: colors, fonts, selectors, the box model, effects, flexbox, grid, position and the cascade. Each spell is a real CSS rule, and the Result panel shows a small page wearing your style. The forest grows darker towards the end, where the C++ lands begin.",
    winTitle:"Cascade the Chameleon falls",
    winText:() => "The second seal on Pythona's curse breaks and the forest is bright again. You wrote " + D.casts + " spells in total." + roadTo("cpp", "The road to the Dark Forest is now open: pick C++ from the village.") + pickNote() },
  cpp:{ id:"cpp", lang:"C++", CON:CPP_CON, LEVELS:CPP_LEVELS, SP:CPP_SP, classify:classifyCpp, hint:hintCpp, fill:/\$([a-z])/g,
    subs:{ attack:"Statements and output", heavy:"Variables, loops, functions", block:"Decisions and fixes", item:"Arrays and objects" },
    mapSub:"Ten levels teach the fundamentals of C++: printing, variables, decisions, loops, functions, arrays, strings, pointers and classes. Spells are real C++, and the console shows what each one prints. Every spell assumes #include <iostream> and using namespace std; at the top.",
    winTitle:"The Pointer Wraith falls",
    winText:() => "The third seal on Pythona's curse breaks and the C++ lands are free. You wrote " + D.casts + " spells in total." + roadTo("js", "The road to the JavaScript keep is now open: pick it from the language select.") + pickNote() },
  js:{ id:"js", lang:"JavaScript", CON:JS_CON, LEVELS:JS_LEVELS, SP:JS_SP, classify:classifyJs, hint:hintJs, fill:/\$([a-z])/g,
    subs:{ attack:"Statements and output", heavy:"Variables, strings, loops", block:"Decisions and fixes", item:"Arrays and the page" },
    mapSub:"Ten levels teach the fundamentals of JavaScript, climbing a spiral up the keep: printing, variables, decisions, loops, functions, arrays, objects, callbacks and the page itself. Spells are real JavaScript, and the console shows what each one prints. Level 10 shows a live page.",
    winTitle:"The Callback Hydra falls",
    winText:() => "The fourth seal on Pythona's curse breaks and the JavaScript lands are free. You wrote " + D.casts + " spells in total." + roadTo("py", "The road up to the castle roof is now open: pick Python from the language select.") + pickNote() },
  py:{ id:"py", lang:"Python", CON:PY_CON, LEVELS:PY_LEVELS, SP:PY_SP, classify:classifyPy, hint:hintPy, fill:/\$([a-z])/g,
    subs:{ attack:"Statements and output", heavy:"Variables, strings, loops", block:"Decisions and fixes", item:"Lists and tools" },
    mapSub:"Ten levels teach the fundamentals of Python, along the castle roof: printing, variables, decisions, loops, functions, lists, dictionaries and comprehensions. Spells are real Python, and the console shows what each one prints. At the end of the roof, Pythona waits in her tower.",
    winTitle:"Pythona falls",
    winText:() => "The curse is broken." + pickNote() }
};
let TRK = TRACKS.html;
