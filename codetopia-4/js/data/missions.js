/* Village missions: one-off typing jobs from villagers, paid in coins. Each giver lives in one district (or the square) and teaches that language.
   mode "copy" shows the code to type, "fix" shows broken code to correct, "recall" gives only a description. `lv` is the track level you must have reached. */

"use strict";

const GIVERS = {
  baker:  { sprite:"vil_baker",   name:"Rosa the Baker",    role:"Runs the bakery",        track:"html", scene:"html", x:228, y:132, hello:"Mind the flour! I could use a hand with my shop's web page.", locked:"Come back after you have started the HTML levels, and I will have some jobs.", done:"My bakery has never looked better. Thank you, hero!" },
  watch:  { sprite:"vil_watch",   name:"Ned the Watchman",  role:"Keeps the forest lamps", track:"cpp",  scene:"cpp",  x:112, y:176, hello:"Dark nights out here. Could you help me with some C++ for my lamps?", locked:"The forest road is quiet until you have started C++. Come back then.", done:"Every lamp is lit and the paths are safe. You have my thanks." },
  courier:{ sprite:"vil_courier", name:"Pip the Courier",   role:"Carries news and parcels", track:"js", scene:"sq",   x:524, y:238, hello:"Parcels to deliver and no time! Can you help me with some JavaScript?", locked:"I only carry JavaScript jobs. Come back once you have reached the Keep.", done:"Every letter delivered, thanks to you. Best courier's helper ever!" },
  kid:    { sprite:"vil_kid",     name:"Mimi",              role:"Flies kites on the roof", track:"py",  scene:"py",   x:226, y:146, hello:"Hi! My kite code is all muddled. Will you help me fix it?", locked:"Come back when you have started Python. I will be right here!", done:"My kite is the best in Codetopia now. You are so clever!" }
};

const MISSIONS = [
  { id:"bake1", giver:"baker", lv:1, mode:"copy", reward:15, title:"The bakery sign", ask:"My shop has no sign! Type this heading and everyone will see it.", code:'<h1>Rosa\'s Bakery</h1>', answers:['<h1>Rosa\'s Bakery</h1>'], thanks:"Look at that big, bold sign. Lovely!" },
  { id:"bake2", giver:"baker", lv:2, mode:"fix",  reward:30, title:"Mixed-up tags", ask:"I wrote my daily special but the paragraph never ends. Can you fix the closing tag?", code:'<p>Fresh loaves daily<p>', goal:"Fix the paragraph so it closes properly.", answers:['<p>Fresh loaves daily</p>'], thanks:"The special is showing at last. Crusty!" },
  { id:"bake3", giver:"baker", lv:3, mode:"recall", reward:45, title:"Order online", ask:"Customers want to order online. Make a link for them.", goal:'Write a link with the text Order here that goes to /order.', answers:['<a href="/order">Order here</a>'], hint:'A link is an a tag with an href attribute.', thanks:"Orders are rolling in. You are a star baker's helper!" },

  { id:"watch1", giver:"watch", lv:1, mode:"copy", reward:15, title:"Light the lantern", ask:"The first lantern needs a message. Type this line and it will glow.", code:'cout << "Lantern lit!";', answers:['cout << "Lantern lit!";'], thanks:"It glows! Wonderful." },
  { id:"watch2", giver:"watch", lv:3, mode:"fix", reward:30, title:"Counting lanterns", ask:"My lantern count will not compile. Something is missing at the end.", code:'int lanterns = 5', goal:"Fix the line so it is a complete statement.", answers:['int lanterns = 5;'], thanks:"Five lanterns, counted. Splendid." },
  { id:"watch3", giver:"watch", lv:6, mode:"recall", reward:45, title:"Three blinks", ask:"The signal lamp should blink three times. I need a loop.", goal:"Write a for loop that prints i for i = 0, 1 and 2.", answers:['for (int i = 0; i < 3; i++) { cout << i; }', 'for (int i = 0; i < 3; i++) { cout << i << endl; }'], hint:"for (start; keep going while; step) { body }", thanks:"Blink, blink, blink. Perfect." },

  { id:"cour1", giver:"courier", lv:1, mode:"copy", reward:15, title:"Delivery note", ask:"Type this to log a delivery. It is my favourite line.", code:'console.log("Letter delivered!");', answers:['console.log("Letter delivered!");'], thanks:"Logged! One more happy customer." },
  { id:"cour2", giver:"courier", lv:2, mode:"fix", reward:30, title:"A typo in the log", ask:"My logging line will not run. I think I typed something wrong.", code:'consol.log("Parcel sent");', goal:"Fix the typo so it prints.", answers:['console.log("Parcel sent");'], thanks:"Parcel sent, and logged properly this time." },
  { id:"cour3", giver:"courier", lv:7, mode:"recall", reward:45, title:"Greeting machine", ask:"I want a machine that greets whoever I deliver to.", goal:'Write a function called greet that takes name and returns "Hello, " plus the name.', answers:['function greet(name) { return "Hello, " + name; }'], hint:"function name(parameter) { return something; }", thanks:"Hello, everyone! What a clever machine." },

  { id:"kid1", giver:"kid", lv:1, mode:"copy", reward:15, title:"Kite goes up", ask:"Type this and my kite will fly!", code:'print("Kite up!")', answers:['print("Kite up!")'], thanks:"Up, up and away!" },
  { id:"kid2", giver:"kid", lv:6, mode:"fix", reward:30, title:"The wobbly loop", ask:"My loop to count the tail ribbons will not run. Something is missing.", code:'for i in range(3)\n    print(i)', goal:"Fix the first line of the loop.", answers:['for i in range(3):\n    print(i)'], thanks:"One, two, three ribbons. Yay!" },
  { id:"kid3", giver:"kid", lv:8, mode:"recall", reward:45, title:"Kite collection", ask:"I want to keep track of my kites.", goal:"Make a list called kites that holds 1, 2 and 3.", answers:['kites = [1, 2, 3]'], hint:"A list uses square brackets with commas between the items.", thanks:"All my kites in one tidy list. Thank you!" }
];

/* Make typed code comparable: ignore spacing, quote style and (in JavaScript) a trailing semicolon, but keep the words and symbols. Python keeps its line breaks and indents. */
function missionNorm(lang, src) {
  const parts = String(src).replace(/\r/g, "").replace(/\t/g, "    ").split(/("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/);
  const q = lang === "html" || lang === "js" || lang === "py";
  const outside = t => lang === "py" ? t.replace(/[ ]*([=+\-*\/,()\[\]{}:<>])[ ]*/g, "$1").replace(/[ ]{2,}/g, m => m) : t.replace(/\s+/g, " ").replace(/\s*([=+\-*\/,()\[\]{};:<>&|!.#])\s*/g, "$1");
  let out = parts.map((t, i) => i % 2 ? (q && t[0] === "'" && !t.includes('"') ? '"' + t.slice(1, -1) + '"' : t) : outside(t)).join("");
  if (lang === "py") out = out.split("\n").map(l => { const ind = l.match(/^ */)[0]; return ind + l.slice(ind.length).trimEnd(); }).filter(l => l.trim()).join("\n");
  else if (lang === "js") out = out.replace(/;(?=\s*(\}|$))/g, "");
  return out.trim();
}
const missionOk = (m, typed) => { const L = GIVERS[m.giver].track, t = missionNorm(L, typed); return m.answers.some(a => missionNorm(L, a) === t); };
