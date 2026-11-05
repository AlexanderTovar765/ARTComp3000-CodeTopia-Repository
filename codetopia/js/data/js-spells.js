/* JavaScript track: every spell the player can type. The console output is worked out by running the code, so it is always right. */

"use strict";

const JS_SP = [];
/* j(level, action, concepts, title, code, goal, extra). Code is a string or an array of lines. $w $x $y words, $n $m numbers (n > m), $c a capital letter.
   extra.bug = the enemy's broken version (a fix spell). extra.fx = item effects. extra.page = the HTML that the level 10 spells work on. extra.click = how many times to click the button. */
const j = (L, a, c, t, code, goal, o) => JS_SP.push(Object.assign({ id:++spId, L, a, c:[].concat(c), t, code:[].concat(code).join("\n"), goal }, o || {}));
const jb = (bug, o) => Object.assign({ bug:[].concat(bug).join("\n") }, o || {});
const JFIX = "Fix the enemy's broken spell so it runs and does the right thing.";

/* ---------- level 1: printing ---------- */
j(1,"attack",["log","str","semi"],"Print",'console.log("$w!");',"Print “$w!” to the console");
j(1,"attack",["log","str"],"Two words",'console.log("$w $x");',"Print $w, a space, then $x, all in one string");
j(1,"attack",["log","order"],"Two statements",['console.log("$w");','console.log("$x");'],"Print $w on one line and $x on the next, using two console.log statements");
j(1,"attack",["log","args"],"Two values",'console.log("$w", "$x");',"Print $w and $x with one console.log, separating the two values with a comma");
j(1,"attack",["log","num"],"A number",'console.log($n);',"Print the number $n, with no quotes");
j(1,"attack",["log","num"],"Sum",'console.log($n + $m);',"Print the sum of $n and $m");
j(1,"attack",["str","esc"],"New line",'console.log("$w\\n$x");',"Print $w and $x on two lines, using \\n inside the quotes");
j(1,"attack",["cmt","log"],"Comment",['// $w','console.log("$x");'],"Write a comment that says $w, then print “$x”");
j(1,"attack","cmt","Block comment",['/* $w */','console.log("$x");'],"Write a block comment that says $w, then print “$x”");
j(1,"attack",["str","semi"],"Single quotes","console.log('$w!');","Print “$w!” using single quotes instead of double quotes");

/* ---------- level 2: variables and types ---------- */
j(2,"attack",["let","num"],"A variable",['let score = $n;','console.log(score);'],"Make a variable called score equal to $n with let, then print it");
j(2,"attack",["const","str"],"A constant",['const hero = "$w";','console.log(hero);'],"Make a constant called hero holding “$w” with const, then print it");
j(2,"attack",["let","types"],"A boolean",['let ready = true;','console.log(ready);'],"Make a variable called ready equal to true, then print it");
j(2,"attack","let","Two variables",['let a = $n;','let b = $m;','console.log(a, b);'],"Make a equal to $n and b equal to $m, then print both with one console.log");
j(2,"attack","assign","Change it",['let hp = $n;','hp = $m;','console.log(hp);'],"Make hp equal to $n, change it to $m, then print it");
j(2,"heavy",["typeof","types"],"Type of a number",['let hp = $n;','console.log(typeof hp);'],"Make hp equal to $n, then print its type with typeof");
j(2,"heavy",["typeof","types"],"Type of text",['let name = "$w";','console.log(typeof name);'],"Make name hold “$w”, then print its type with typeof");
j(2,"heavy",["typeof","types"],"Type of a boolean",['let alive = true;','console.log(typeof alive);'],"Make alive equal to true, then print its type with typeof");
j(2,"heavy","const","Constant sum",['const price = $n;','const tax = $m;','console.log(price + tax);'],"Make constants price and tax equal to $n and $m, then print their sum");
j(2,"heavy","naming","Camel case",['let heroName = "$w";','console.log(heroName);'],"Make a variable called heroName holding “$w” (camelCase), then print it");
j(2,"heavy","assign","Add to a value",['let gold = $n;','gold = gold + $m;','console.log(gold);'],"Make gold equal to $n, set it to gold + $m, then print it");
j(2,"heavy",["let","types"],"No value yet",['let loot;','console.log(loot);'],"Make a variable loot with no value, then print it");
j(2,"heavy",["types","let"],"Nothing on purpose",['let shield = null;','console.log(shield);'],"Make shield equal to null, then print it");

/* ---------- level 3: operators and strings ---------- */
j(3,"attack","arith","Multiply",'console.log($n * $m);',"Print $n multiplied by $m");
j(3,"attack","arith","Subtract",'console.log($n - $m);',"Print $m taken away from $n");
j(3,"attack","arith","Brackets first",'console.log(($n * $m) / $m);',"Multiply $n by $m in brackets, divide the result by $m, and print it");
j(3,"attack","divmod","Remainder",'console.log($n % $m);',"Print the remainder of $n divided by $m, using %");
j(3,"attack","concat","Join words",'console.log("$w" + "$x");',"Join “$w” and “$x” with +, with no space, and print it");
j(3,"attack","concat","Join with a space",'console.log("$w" + " " + "$x");',"Join “$w”, a space and “$x” with +, and print it");
j(3,"heavy","pow","Power",'console.log($m ** 2);',"Print $m squared, using **");
j(3,"heavy","compound","Add and store",['let gold = $n;','gold += $m;','console.log(gold);'],"Make gold equal to $n, add $m with +=, then print it");
j(3,"heavy","compound","Level up",['let level = $n;','level++;','console.log(level);'],"Make level equal to $n, add one with ++, then print it");
j(3,"heavy","tpl","Template text",['const name = "$w";','console.log(`Hello ${name}!`);'],"Make a constant name holding “$w”, then print Hello, the name and ! with a template literal");
j(3,"heavy",["tpl","arith"],"Template sum",['let hp = $n;','console.log(`HP: ${hp + $m}`);'],"Make hp equal to $n, then print HP: and hp plus $m with a template literal");
j(3,"heavy","strlen","How long",'console.log("$w".length);',"Print the length of the string “$w”");
j(3,"heavy","strmeth","Shout",'console.log("$w".toUpperCase());',"Print “$w” in capital letters, using toUpperCase");
j(3,"heavy","strmeth","Whisper",'console.log("$w".toLowerCase());',"Print “$w” in small letters, using toLowerCase");
j(3,"heavy","strmeth","First letters",'console.log("$w".slice(0, 3));',"Print the first 3 letters of “$w”, using slice(0, 3)");
j(3,"heavy",["coerce","concat"],"Text plus number",'console.log("$n" + $m);',"Print the text “$n” plus the number $m, and see that + joins them");
j(3,"heavy","coerce","Turn text into a number",'console.log(Number("$n") + $m);',"Turn the text “$n” into a number with Number(), add $m, and print it");
j(3,"heavy","coerce","Not a number",'console.log("$w" * 2);',"Multiply the word “$w” by 2 and print what you get");

/* ---------- level 4: decisions ---------- */
j(4,"attack",["if","cmp"],"If",['if ($n > $m) {','  console.log("$w");','}'],"If $n is greater than $m, print “$w”");
j(4,"attack",["if","else"],"If and else",['if ($m > $n) {','  console.log("$w");','} else {','  console.log("$x");','}'],"If $m is greater than $n print “$w”, otherwise print “$x”");
j(4,"attack","strict","Strictly equal",['let hp = $n;','console.log(hp === $n);'],"Make hp equal to $n, then print whether hp === $n");
j(4,"attack","cmp","Not equal",'console.log($n !== $m);',"Print whether $n !== $m");
j(4,"heavy","else","Else if",['let hp = $m;','if (hp > $n) {','  console.log("high");','} else if (hp > 0) {','  console.log("$w");','} else {','  console.log("low");','}'],"Make hp equal to $m, then use if, else if and else to print high when hp is over $n, “$w” when it is over 0, and low otherwise");
j(4,"heavy","logic","Both",['let hp = $n;','if (hp > $m && hp < 10) {','  console.log("$w");','}'],"Make hp equal to $n, then if hp is over $m and under 10, print “$w”");
j(4,"heavy","logic","Either",['let hp = $n;','if (hp < 0 || hp > $m) {','  console.log("$w");','}'],"Make hp equal to $n, then if hp is under 0 or over $m, print “$w”");
j(4,"heavy",["logic","truthy"],"Not",['let dead = false;','if (!dead) {','  console.log("$w");','}'],"Make dead equal to false, then if not dead, print “$w”");
j(4,"heavy","ternary","Ternary",['let hp = $n;','console.log(hp > $m ? "$w" : "$x");'],"Make hp equal to $n, then print “$w” if hp is over $m and “$x” if not, using ? and :");
j(4,"heavy","truthy","Truthy text",['if ("$w") {','  console.log("$x");','}'],"If the text “$w” is truthy, print “$x”");
j(4,"heavy",["loose","strict"],"Loose and strict",['console.log("$n" == $n);','console.log("$n" === $n);'],"Print “$n” == $n and then “$n” === $n, to see the difference");
j(4,"block",["if","cmp"],"Guard",['let hp = $n;','if (hp > $m) {','  console.log("$w");','}'],"Make hp equal to $n, then if hp is over $m, print “$w”");
j(4,"block",["if","else"],"Choice",['let hp = $m;','if (hp > $n) {','  console.log("$w");','} else {','  console.log("$x");','}'],"Make hp equal to $m, then print “$w” if it is over $n, otherwise print “$x”");
j(4,"block","strict","Fix: one equals",['let hp = $n;','if (hp === $n) {','  console.log("$w");','}'],JFIX,jb(['let hp = $n;','if (hp = $n) {','  console.log("$w");','}']));
j(4,"block","if","Fix: no brackets",['let hp = $n;','if (hp > $m) {','  console.log("$w");','}'],JFIX,jb(['let hp = $n;','if hp > $m {','  console.log("$w");','}']));
j(4,"block","log","Fix: missing bracket",['if ($n > $m) {','  console.log("$w");','}'],JFIX,jb(['if ($n > $m) {','  console.log("$w";','}']));
j(4,"block","str","Fix: mixed quotes",['if ($n > $m) {','  console.log("$w");','}'],JFIX,jb(['if ($n > $m) {',"  console.log(\"$w');",'}']));
j(4,"block","else","Fix: typo in else",['if ($m > $n) {','  console.log("$w");','} else {','  console.log("$x");','}'],JFIX,jb(['if ($m > $n) {','  console.log("$w");','} esle {','  console.log("$x");','}']));
j(4,"block","if","Fix: capital letter",['let hp = $n;','if (hp > $m) {','  console.log("$w");','}'],JFIX,jb(['let hp = $n;','If (hp > $m) {','  console.log("$w");','}']));

/* ---------- level 5: loops ---------- */
j(5,"attack","while","Count with while",['let i = 1;','while (i <= 3) {','  console.log(i);','  i++;','}'],"Make i equal to 1, then use while to print i and add one to it, as long as i is 3 or less");
j(5,"attack","for","Count with for",['for (let i = 1; i <= 3; i++) {','  console.log(i);','}'],"Use a for loop to print the numbers 1 to 3");
j(5,"attack","for","Repeat a word",['for (let i = 0; i < 3; i++) {','  console.log("$w");','}'],"Use a for loop that starts at 0 to print “$w” 3 times");
j(5,"heavy","for","Count down",['for (let i = 3; i > 0; i--) {','  console.log(i);','}'],"Use a for loop to count down from 3 to 1");
j(5,"heavy",["accum","for"],"Add them up",['let total = 0;','for (let i = 1; i <= 4; i++) {','  total += i;','}','console.log(total);'],"Make total equal to 0, add 1 to 4 to it in a for loop, then print total");
j(5,"heavy","brk","Break",['for (let i = 1; i <= 10; i++) {','  if (i === $m) {','    break;','  }','  console.log(i);','}'],"Loop i from 1 to 10 and print it, but break when i is $m");
j(5,"heavy","brk","Continue",['for (let i = 1; i <= 4; i++) {','  if (i === 2) {','    continue;','  }','  console.log(i);','}'],"Loop i from 1 to 4 and print it, but skip 2 with continue");
j(5,"heavy","forof","Letters",['for (const ch of "$w") {','  console.log(ch);','}'],"Use for...of to print every letter of “$w” on its own line");
j(5,"heavy","for","Count by two",['for (let i = 0; i <= 6; i += 2) {','  console.log(i);','}'],"Use a for loop that goes up by 2 to print 0, 2, 4 and 6");
j(5,"heavy",["while","accum"],"Doubling",['let power = 1;','while (power < 20) {','  power *= 2;','}','console.log(power);'],"Make power equal to 1, double it with *= while it is under 20, then print it");
j(5,"heavy","for","Times table",['for (let i = 1; i <= 3; i++) {','  console.log(i * $m);','}'],"Use a for loop from 1 to 3 to print i multiplied by $m");
j(5,"heavy","accum","Build a string",['let line = "";','for (let i = 0; i < 3; i++) {','  line += "$c";','}','console.log(line);'],"Make line an empty string, add “$c” to it 3 times in a for loop, then print it");
j(5,"block","while","Guard: count to a limit",['let tries = 0;','while (tries < $m) {','  tries++;','}','console.log(tries);'],"Make tries equal to 0, add one while tries is under $m, then print tries");
j(5,"block","while","Fix: never stops",['let i = 1;','while (i <= 3) {','  console.log(i);','  i++;','}'],JFIX,jb(['let i = 1;','while (i <= 3) {','  console.log(i);','}']));
j(5,"block","for","Fix: commas",['for (let i = 1; i <= 3; i++) {','  console.log(i);','}'],JFIX,jb(['for (let i = 1, i <= 3, i++) {','  console.log(i);','}']));
j(5,"block","for","Fix: an equals in the test",['for (let i = 1; i <= 3; i++) {','  console.log(i);','}'],JFIX,jb(['for (let i = 1; i = 3; i++) {','  console.log(i);','}']));
j(5,"block","for","Fix: missing brace",['for (let i = 0; i < 3; i++) {','  console.log("$w");','}'],JFIX,jb(['for (let i = 0; i < 3; i++) {','  console.log("$w");']));
j(5,"block","forof","Fix: of is spelled wrong",['for (const ch of "$w") {','  console.log(ch);','}'],JFIX,jb(['for (const ch off "$w") {','  console.log(ch);','}']));

/* ---------- level 6: functions ---------- */
j(6,"attack","fn","A function",['function greet() {','  console.log("$w");','}','greet();'],"Write a function greet that prints “$w”, then call it");
j(6,"attack","params","A parameter",['function shout(word) {','  console.log(word);','}','shout("$w");'],"Write a function shout with a parameter word that prints it, then call shout with “$w”");
j(6,"attack","ret","Return a value",['function double(n) {','  return n * 2;','}','console.log(double($n));'],"Write a function double that returns n times 2, then print double($n)");
j(6,"attack","fn","Call it twice",['function cheer() {','  console.log("$w!");','}','cheer();','cheer();'],"Write a function cheer that prints “$w!”, then call it twice");
j(6,"heavy",["params","ret"],"Two parameters",['function add(a, b) {','  return a + b;','}','console.log(add($n, $m));'],"Write a function add that returns a + b, then print add($n, $m)");
j(6,"heavy","arrow","Arrow function",['const square = (n) => n * n;','console.log(square($m));'],"Write an arrow function square that returns n times n, then print square($m)");
j(6,"heavy",["arrow","ret"],"Arrow with a body",['const add = (a, b) => {','  return a + b;','};','console.log(add($n, $m));'],"Write an arrow function add with a { } body that returns a + b, then print add($n, $m)");
j(6,"heavy","dflt","Default value",['function hello(name = "$w") {','  return "Hi " + name;','}','console.log(hello());'],"Write a function hello whose parameter name defaults to “$w” and returns Hi and the name, then print hello()");
j(6,"heavy",["ret","tpl"],"Return a template",['function intro(name) {','  return `I am ${name}`;','}','console.log(intro("$w"));'],"Write a function intro that returns I am and the name with a template literal, then print intro(“$w”)");
j(6,"heavy","scope","Two variables, same name",['let x = "$w";','function show() {','  let x = "$x";','  console.log(x);','}','show();','console.log(x);'],"Make x hold “$w”, write a function show with its own x holding “$x” that prints it, then call show and print the outer x");
j(6,"heavy",["ret","cmp"],"Return a test",['function isBig(n) {','  return n > $m;','}','console.log(isBig($n));'],"Write a function isBig that returns whether n is over $m, then print isBig($n)");
j(6,"heavy","fn","Store a function",['const hi = function() {','  return "$w";','};','console.log(hi());'],"Store a function in a constant hi that returns “$w”, then print hi()");
j(6,"block","ret","Guard: clamp",['function clamp(n) {','  if (n > $m) {','    return $m;','  }','  return n;','}','console.log(clamp($n));'],"Write a function clamp that returns $m when n is over $m and n otherwise, then print clamp($n)");
j(6,"block","ret","Fix: no return",['function double(n) {','  return n * 2;','}','console.log(double($n));'],JFIX,jb(['function double(n) {','  n * 2;','}','console.log(double($n));']));
j(6,"block","fn","Fix: forgot the brackets",['function greet() {','  console.log("$w");','}','greet();'],JFIX,jb(['function greet() {','  console.log("$w");','}','greet;']));
j(6,"block","arrow","Fix: arrow needs >",['const square = (n) => n * n;','console.log(square($m));'],JFIX,jb(['const square = (n) = n * n;','console.log(square($m));']));
j(6,"block","params","Fix: missing parameter",['function add(a, b) {','  return a + b;','}','console.log(add($n, $m));'],JFIX,jb(['function add(a) {','  return a + b;','}','console.log(add($n, $m));']));
j(6,"block","fn","Fix: wrong keyword",['function greet() {','  console.log("$w");','}','greet();'],JFIX,jb(['func greet() {','  console.log("$w");','}','greet();']));

/* ---------- level 7: arrays ---------- */
j(7,"attack","arr","An array",['let bag = ["$w", "$x"];','console.log(bag);'],"Make an array bag holding “$w” and “$x”, then print it");
j(7,"attack","idx","First item",['let bag = ["$w", "$x"];','console.log(bag[0]);'],"Make an array bag holding “$w” and “$x”, then print the first item");
j(7,"attack","len","How many",['let bag = ["$w", "$x", "$y"];','console.log(bag.length);'],"Make an array bag holding “$w”, “$x” and “$y”, then print how many items it has");
j(7,"heavy","push","Add one",['let bag = ["$w"];','bag.push("$x");','console.log(bag.length);'],"Make an array bag holding “$w”, push “$x” onto it, then print its length");
j(7,"heavy","push","Take one off",['let bag = ["$w", "$x"];','bag.pop();','console.log(bag);'],"Make an array bag holding “$w” and “$x”, pop the last item off, then print bag");
j(7,["heavy"][0],["idx","len"],"Last item",['let bag = ["$w", "$x", "$y"];','console.log(bag[bag.length - 1]);'],"Make an array bag holding “$w”, “$x” and “$y”, then print the last item using bag.length - 1");
j(7,"heavy","arrloop","Loop the bag",['let bag = ["$w", "$x"];','for (const item of bag) {','  console.log(item);','}'],"Make an array bag holding “$w” and “$x”, then print each item with for...of");
j(7,"heavy","incl","Is it there",['let bag = ["$w", "$x"];','console.log(bag.includes("$w"));'],"Make an array bag holding “$w” and “$x”, then print whether it includes “$w”");
j(7,"heavy","incl","Where is it",['let bag = ["$w", "$x"];','console.log(bag.indexOf("$x"));'],"Make an array bag holding “$w” and “$x”, then print the index of “$x”");
j(7,"heavy","join","Join them up",['let bag = ["$w", "$x", "$y"];','console.log(bag.join(", "));'],"Make an array bag holding “$w”, “$x” and “$y”, then print them joined with a comma and a space");
j(7,"heavy","idx","Swap an item",['let bag = ["$w", "$x"];','bag[0] = "$y";','console.log(bag);'],"Make an array bag holding “$w” and “$x”, replace the first item with “$y”, then print bag");
j(7,"heavy",["arrloop","accum"],"Add up the list",['let nums = [$n, $m, 1];','let total = 0;','for (const x of nums) {','  total += x;','}','console.log(total);'],"Make an array nums holding $n, $m and 1, add them all into total with for...of, then print total");
j(7,"heavy",["arrloop","idx"],"Loop with an index",['let bag = ["$w", "$x"];','for (let i = 0; i < bag.length; i++) {','  console.log(i, bag[i]);','}'],"Make an array bag holding “$w” and “$x”, then print the index and item of each with a for loop");
j(7,"item","arr","Potion bag",['let bag = ["potion", "$w"];','console.log(bag[0]);'],"Make an array bag holding “potion” and “$w”, then print the first item",{ name:"Potion" });
j(7,"item","push","Pack a potion",['let bag = [];','bag.push("potion");','console.log(bag);'],"Make an empty array bag, push “potion” onto it, then print bag",{ name:"Big potion" });
j(7,"item","arrloop","Check the bag",['let bag = ["potion", "$w"];','for (const item of bag) {','  console.log(item);','}'],"Make an array bag holding “potion” and “$w”, then print each item with for...of",{ name:"Scroll", fx:{ heal:18, shield:.5 } });
j(7,"item","len","Count the potions",['let bag = ["potion", "$w", "$x"];','console.log(bag.length);'],"Make an array bag holding “potion”, “$w” and “$x”, then print its length",{ name:"Potion" });
j(7,"block","idx","Guard: last item",['let bag = ["$w", "$x"];','if (bag.length > 0) {','  console.log(bag[0]);','}'],"Make an array bag holding “$w” and “$x”, then if it is not empty, print its first item");
j(7,"block","idx","Fix: wrong index",['let bag = ["$w", "$x"];','console.log(bag[1]);'],JFIX,jb(['let bag = ["$w", "$x"];','console.log(bag[2]);']));
j(7,"block","len","Fix: length is not a function",['let bag = ["$w", "$x"];','console.log(bag.length);'],JFIX,jb(['let bag = ["$w", "$x"];','console.log(bag.length());']));
j(7,"block","arr","Fix: missing bracket",['let bag = ["$w", "$x"];','console.log(bag);'],JFIX,jb(['let bag = ["$w", "$x";','console.log(bag);']));
j(7,"block","push","Fix: wrong method name",['let bag = ["$w"];','bag.push("$x");','console.log(bag.length);'],JFIX,jb(['let bag = ["$w"];','bag.add("$x");','console.log(bag.length);']));

/* ---------- level 8: objects ---------- */
j(8,"attack",["obj","dot"],"An object",['const hero = { name: "$w", hp: $n };','console.log(hero.name);'],"Make an object hero with name “$w” and hp $n, then print its name");
j(8,"attack","dot","Read a number",['const hero = { name: "$w", hp: $n };','console.log(hero.hp);'],"Make an object hero with name “$w” and hp $n, then print its hp");
j(8,"attack","bracket","Square brackets",['const hero = { name: "$w", hp: $n };','console.log(hero["name"]);'],"Make an object hero with name “$w” and hp $n, then print its name using square brackets");
j(8,"heavy","objadd","Add a property",['const hero = { name: "$w" };','hero.gold = $m;','console.log(hero.gold);'],"Make an object hero with name “$w”, add a gold property of $m, then print it");
j(8,"heavy","dot","Change a property",['const hero = { name: "$w", hp: $n };','hero.hp = $m;','console.log(hero.hp);'],"Make an object hero with name “$w” and hp $n, change hp to $m, then print it");
j(8,"heavy",["objmeth","obj"],"A method",['const hero = {','  name: "$w",','  shout() {','    return "I am " + this.name;','  }','};','console.log(hero.shout());'],"Make an object hero with name “$w” and a method shout that returns I am and this.name, then print hero.shout()");
j(8,"heavy","nest","Nested object",['const hero = {','  name: "$w",','  bag: { potions: $n }','};','console.log(hero.bag.potions);'],"Make an object hero with name “$w” and a bag object holding potions of $n, then print hero.bag.potions");
j(8,"heavy","keys","List the keys",['const hero = { name: "$w", hp: $n };','console.log(Object.keys(hero));'],"Make an object hero with name “$w” and hp $n, then print its keys with Object.keys");
j(8,"heavy","keys","Loop the keys",['const hero = { name: "$w", hp: $n };','for (const key in hero) {','  console.log(key);','}'],"Make an object hero with name “$w” and hp $n, then print each key with for...in");
j(8,"heavy",["tpl","dot"],"Template with properties",['const hero = { name: "$w", hp: $n };','console.log(`${hero.name} has ${hero.hp} HP`);'],"Make an object hero with name “$w” and hp $n, then print name has hp HP with a template literal");
j(8,"heavy",["nest","idx"],"List of objects",['const party = [{ name: "$w" }, { name: "$x" }];','console.log(party[1].name);'],"Make an array party of two objects with the names “$w” and “$x”, then print the second name");
j(8,"heavy","objadd","Remove a property",['const hero = { name: "$w", hp: $n };','delete hero.hp;','console.log(hero.hp);'],"Make an object hero with name “$w” and hp $n, delete hp, then print hero.hp");
j(8,"heavy","obj","Is it there",['const hero = { name: "$w", hp: $n };','console.log("hp" in hero);'],"Make an object hero with name “$w” and hp $n, then print whether “hp” is in hero");
j(8,"item","obj","Potion object",['const potion = { name: "Elixir", heal: $n };','console.log(potion.heal);'],"Make an object potion with name “Elixir” and heal $n, then print its heal",{ name:"Elixir", fx:{ heal:24, shield:.5 } });
j(8,"item","dot","Read the label",['const potion = { name: "$w", heal: $n };','console.log(potion.name);'],"Make an object potion with name “$w” and heal $n, then print its name",{ name:"Potion" });
j(8,"item","objadd","Label a potion",['const potion = { heal: $n };','potion.name = "$w";','console.log(potion.name);'],"Make an object potion with heal $n, add a name of “$w”, then print the name",{ name:"Big potion" });
j(8,"block","dot","Guard: alive",['const hero = { name: "$w", hp: $n };','if (hero.hp > 0) {','  console.log(hero.name);','}'],"Make an object hero with name “$w” and hp $n, then if hp is over 0, print the name");
j(8,"block","obj","Fix: missing comma",['const hero = { name: "$w", hp: $n };','console.log(hero.name);'],JFIX,jb(['const hero = { name: "$w" hp: $n };','console.log(hero.name);']));
j(8,"block","dot","Fix: typo in the name",['const hero = { name: "$w", hp: $n };','console.log(hero.name);'],JFIX,jb(['const hero = { name: "$w", hp: $n };','console.log(hero.nmae);']));
j(8,"block","dot","Fix: quotes after the dot",['const hero = { name: "$w", hp: $n };','console.log(hero.name);'],JFIX,jb(['const hero = { name: "$w", hp: $n };','console.log(hero."name");']));
j(8,"block","bracket","Fix: no quotes in brackets",['const hero = { name: "$w", hp: $n };','console.log(hero["name"]);'],JFIX,jb(['const hero = { name: "$w", hp: $n };','console.log(hero[name]);']));
j(8,"block","objmeth","Fix: method without this",['const hero = {','  name: "$w",','  shout() {','    return "I am " + this.name;','  }','};','console.log(hero.shout());'],JFIX,jb(['const hero = {','  name: "$w",','  shout() {','    return "I am " + this.name;','  }','};','console.log(hero.shout);']));

/* ---------- level 9: array methods and callbacks ---------- */
j(9,"attack","foreach","forEach",['["$w", "$x"].forEach((item) => {','  console.log(item);','});'],"Use forEach on an array of “$w” and “$x” to print each item");
j(9,"attack","map","map",['const doubled = [$m, $n].map((n) => n * 2);','console.log(doubled);'],"Use map to double every number in [$m, $n] into doubled, then print it");
j(9,"attack","filter","filter",['const big = [$m, $n].filter((n) => n > $m);','console.log(big);'],"Use filter to keep only the numbers over $m from [$m, $n] into big, then print it");
j(9,"heavy","find","find",['const found = [$m, $n].find((n) => n > $m);','console.log(found);'],"Use find to get the first number over $m in [$m, $n], then print it");
j(9,"heavy","reduce","reduce",['const total = [$m, $n, 1].reduce((sum, n) => sum + n, 0);','console.log(total);'],"Use reduce to add up [$m, $n, 1], starting from 0, then print the total");
j(9,"heavy","map","Shout them all",['const loud = ["$w", "$x"].map((s) => s.toUpperCase());','console.log(loud);'],"Use map to make “$w” and “$x” capital letters into loud, then print it");
j(9,"heavy","filter","Long words only",['const long = ["$w", "$x"].filter((s) => s.length > 3);','console.log(long);'],"Use filter to keep the words longer than 3 letters from “$w” and “$x” into long, then print it");
j(9,"heavy","cb","Pass a callback",['function run(cb) {','  cb();','}','run(() => console.log("$w"));'],"Write a function run that calls its parameter cb, then run it with an arrow function that prints “$w”");
j(9,"heavy","cb","Callback with a value",['function twice(fn, n) {','  return fn(fn(n));','}','console.log(twice((x) => x * 2, $m));'],"Write a function twice that calls fn on n and then on the result, then print twice with an arrow function that doubles, and $m");
j(9,"heavy",["cb","map"],"A named callback",['const shout = (s) => s + "!";','console.log(["$w", "$x"].map(shout));'],"Write an arrow function shout that adds ! to a string, then map it over “$w” and “$x” and print the result");
j(9,"heavy",["foreach","accum"],"Add up with forEach",['let total = 0;','[$m, $n].forEach((n) => {','  total += n;','});','console.log(total);'],"Make total equal to 0, add $m and $n into it with forEach, then print total");
j(9,"heavy",["filter","map"],"Chain them",['console.log([$m, $n, 1].filter((n) => n > 1).map((n) => n * 2));'],"Print [$m, $n, 1] with filter keeping numbers over 1 and then map doubling them");
j(9,"heavy","every","Every one",['console.log([$m, $n].every((n) => n > 0));'],"Print whether every number in [$m, $n] is over 0, using every");
j(9,"item","map","Boost the potions",['const boosted = [$m, $n].map((n) => n + 5);','console.log(boosted);'],"Use map to add 5 to every number in [$m, $n] into boosted, then print it",{ name:"Elixir", fx:{ heal:24, shield:.5 } });
j(9,"item","reduce","Count the potions",['const total = [$m, $n].reduce((sum, n) => sum + n, 0);','console.log(total);'],"Use reduce to add up [$m, $n], starting from 0, then print the total",{ name:"Big potion" });
j(9,"item","find","Find a potion",['const potion = ["$w", "potion"].find((s) => s === "potion");','console.log(potion);'],"Use find to get “potion” out of [“$w”, “potion”], then print it",{ name:"Scroll", fx:{ heal:18, shield:.5 } });
j(9,"block","map","Guard: empty list",['const list = [$m, $n];','if (list.length > 0) {','  console.log(list.map((n) => n * 2));','}'],"Make a list of $m and $n, then if it is not empty, print it with every number doubled using map");
j(9,"block","map","Fix: map returns nothing",['const doubled = [$m, $n].map((n) => n * 2);','console.log(doubled);'],JFIX,jb(['const doubled = [$m, $n].map((n) => { n * 2 });','console.log(doubled);']));
j(9,"block","cb","Fix: called too soon",['["$w", "$x"].forEach((item) => {','  console.log(item);','});'],JFIX,jb(['["$w", "$x"].forEach(console.log(item));']));
j(9,"block","filter","Fix: filter needs a test",['const big = [$m, $n].filter((n) => n > $m);','console.log(big);'],JFIX,jb(['const big = [$m, $n].filter((n) => n + $m);','console.log(big);']));
j(9,"block","reduce","Fix: missing arrow",['const total = [$m, $n].reduce((sum, n) => sum + n, 0);','console.log(total);'],JFIX,jb(['const total = [$m, $n].reduce((sum, n) sum + n, 0);','console.log(total);']));
j(9,"block","map","Fix: wrong method name",['const doubled = [$m, $n].map((n) => n * 2);','console.log(doubled);'],JFIX,jb(['const doubled = [$m, $n].mapp((n) => n * 2);','console.log(doubled);']));

/* ---------- level 10: the page comes alive. These spells work on a small page and show the page, not the console. ---------- */
const PAGE = '<h1>Codetopia</h1><p id="msg">Hello</p><button id="btn">Click me</button><ul id="list"></ul>';
const PAGEBOX = PAGE + '<input id="box">';
j(10,"attack",["dom","text"],"Change some text",'document.querySelector("#msg").textContent = "$w";',"Find the element with the id msg and change its text to “$w”",{ page:PAGE });
j(10,"attack",["dom","text"],"By id",'document.getElementById("msg").textContent = "$w";',"Find the element with the id msg using getElementById and change its text to “$w”",{ page:PAGE });
j(10,"attack",["dom","text"],"The heading",'document.querySelector("h1").textContent = "$w!";',"Find the h1 and change its text to “$w!”",{ page:PAGE });
j(10,"heavy",["dom","clsl"],"Colour it",'document.querySelector("#msg").style.color = "red";',"Find the element with the id msg and make its text red with style.color",{ page:PAGE });
j(10,"heavy","clsl","Add a class",'document.querySelector("#msg").classList.add("$k");',"Find the element with the id msg and add the class “$k” to it with classList.add",{ page:PAGE });
j(10,"heavy",["ev","dom"],"Click",['const btn = document.querySelector("#btn");','btn.addEventListener("click", () => {','  document.querySelector("#msg").textContent = "$w";','});'],"Find the button, and on click change the text of #msg to “$w”",{ page:PAGE, click:1 });
j(10,"heavy",["create","text"],"Make a list item",['const li = document.createElement("li");','li.textContent = "$w";','document.querySelector("#list").append(li);'],"Create a li, set its text to “$w”, then append it to the list with the id list",{ page:PAGE });
j(10,"heavy",["create","for"],"Make a list",['for (let i = 1; i <= 3; i++) {','  const li = document.createElement("li");','  li.textContent = "$w " + i;','  document.querySelector("#list").append(li);','}'],"Use a for loop from 1 to 3 to create a li with the text “$w” and the number, and append each to the list",{ page:PAGE });
j(10,"heavy","timer","After a moment",['setTimeout(() => {','  document.querySelector("#msg").textContent = "$w";','}, 300);'],"After 300 milliseconds, change the text of #msg to “$w”, using setTimeout",{ page:PAGE });
j(10,"heavy",["ev","clsl"],"Toggle a class",['const btn = document.querySelector("#btn");','btn.addEventListener("click", () => {','  document.querySelector("#msg").classList.toggle("$k");','});'],"On a click of the button, toggle the class “$k” on #msg with classList.toggle",{ page:PAGE, click:1 });
j(10,"heavy",["ev","accum"],"A click counter",['let count = 0;','document.querySelector("#btn").addEventListener("click", () => {','  count++;','  document.querySelector("#msg").textContent = count;','});'],"Make count equal to 0, and on each click of the button add one and show it in #msg",{ page:PAGE, click:3 });
j(10,"heavy",["dom","text"],"Fill a box",'document.querySelector("#box").value = "$w";',"Find the input with the id box and set its value to “$w”",{ page:PAGEBOX });
j(10,"heavy",["timer","ev"],"Click then wait",['document.querySelector("#btn").addEventListener("click", () => {','  setTimeout(() => {','    document.querySelector("#msg").textContent = "$w";','  }, 200);','});'],"On a click of the button, wait 200 milliseconds and then change the text of #msg to “$w”",{ page:PAGE, click:1 });
j(10,"item",["dom","text"],"Heal the heading",'document.querySelector("h1").textContent = "$w";',"Find the h1 and change its text to “$w”",{ page:PAGE, name:"Potion" });
j(10,"item","clsl","Glow",'document.querySelector("#msg").classList.add("$k");',"Find the element with the id msg and add the class “$k” to it",{ page:PAGE, name:"Big potion" });
j(10,"item","create","Add a note",['const li = document.createElement("li");','li.textContent = "$w";','document.querySelector("#list").append(li);'],"Create a li with the text “$w” and append it to the list with the id list",{ page:PAGE, name:"Elixir", fx:{ heal:24, shield:.5 } });
j(10,"item","ev","Button heal",['document.querySelector("#btn").addEventListener("click", () => {','  document.querySelector("#msg").textContent = "$w";','});'],"On a click of the button, change the text of #msg to “$w”",{ page:PAGE, click:1, name:"Scroll", fx:{ heal:18, shield:.5 } });
j(10,"block",["dom","text"],"Guard: is it there",['const msg = document.querySelector("#msg");','if (msg) {','  msg.textContent = "$w";','}'],"Find #msg into a constant msg, then if it exists, change its text to “$w”",{ page:PAGE });
j(10,"block","dom","Fix: missing hash",['document.querySelector("#msg").textContent = "$w";'],JFIX,jb('document.querySelector("msg").textContent = "$w";',{ page:PAGE }));
j(10,"block","text","Fix: wrong capital letters",['document.querySelector("#msg").textContent = "$w";'],JFIX,jb('document.querySelector("#msg").textcontent = "$w";',{ page:PAGE }));
j(10,"block","ev","Fix: wrong event name",['const btn = document.querySelector("#btn");','btn.addEventListener("click", () => {','  document.querySelector("#msg").textContent = "$w";','});'],JFIX,jb(['const btn = document.querySelector("#btn");','btn.addEventListener("onclick", () => {','  document.querySelector("#msg").textContent = "$w";','});'],{ page:PAGE, click:1 }));
j(10,"block","ev","Fix: called straight away",['const btn = document.querySelector("#btn");','btn.addEventListener("click", () => {','  document.querySelector("#msg").textContent = "$w";','});'],JFIX,jb(['const btn = document.querySelector("#btn");','btn.addEventListener("click", greet());'],{ page:PAGE, click:1 }));
j(10,"block","timer","Fix: no function",['setTimeout(() => {','  document.querySelector("#msg").textContent = "$w";','}, 300);'],JFIX,jb(['setTimeout(document.querySelector("#msg").textContent = "$w", 300);'],{ page:PAGE }));
j(10,"block","create","Fix: forgot to add it",['const li = document.createElement("li");','li.textContent = "$w";','document.querySelector("#list").append(li);'],JFIX,jb(['const li = document.createElement("li");','li.textContent = "$w";'],{ page:PAGE }));
