/* The Debuggers' Guild: broken programs to investigate. Each case has exactly one place to fix.
   Fields: lang, tier (1 to 3), title, story, code (lines), bug (the line numbers, counted from 0, that count as the culprit),
   type (what kind of mistake), hint, explain, and a way to check the fix:
   HTML and CSS check the corrected line with a pattern (re, tested on the line with spaces removed and lower case);
   JavaScript, Python and C++ run the patched program and compare what it prints with expect. CSS cases also carry page, the HTML they style. */

"use strict";

const GUILD_TYPES = [
  { id:"typo",    n:"Typo",          d:"A word or symbol is spelled wrong." },
  { id:"missing", n:"Missing piece", d:"Something the code needs was left out." },
  { id:"value",   n:"Wrong value",   d:"The right idea, but the wrong word, number or symbol." },
  { id:"logic",   n:"Logic mistake", d:"It looks fine and runs, but does the wrong thing." }
];
const GUILD_RANKS = [[0, "Apprentice Debugger"], [9, "Bug Tracker"], [27, "Inspector"], [54, "Master Debugger"], [80, "Legend of the Guild"]];
const GUILD_LANGS = ["html", "css", "cpp", "js", "py"];

const GUILD_CASES = [
  /* ---------- HTML: the page is the program ---------- */
  { id:"h1", lang:"html", tier:1, title:"The heading that never ends", story:"The bakery's page has a heading so big it swallows the sentence below it.",
    code:['<h1>Welcome to the Bakery', '<p>Fresh bread every morning.</p>'], bug:[0], type:"missing",
    hint:"Look at how the heading starts and how it finishes.", fix:'<h1>Welcome to the Bakery</h1>', re:'^<h1>welcometothebakery</h1>$',
    explain:"A heading needs a closing tag. Without </h1> the browser keeps going, so the next paragraph is treated as part of the heading." },
  { id:"h2", lang:"html", tier:1, title:"The vanishing page", story:"Everything after the shop link has disappeared from the page.",
    code:['<h2>Find us</h2>', '<a href="https://bakery.example>Visit our shop</a>', '<p>We are open every day.</p>'], bug:[1], type:"missing",
    hint:"Count the quote marks in the link.", fix:'<a href="https://bakery.example">Visit our shop</a>', re:'^<ahref="https://bakery\\.example">visitourshop</a>$',
    explain:"An attribute value needs a quote at each end. The missing closing quote made the browser read the rest of the page as part of the link address." },
  { id:"h3", lang:"html", tier:2, title:"Small print", story:"The sale sign should be red and big, but only the colour works.",
    code:['<h2>Today only</h2>', '<p style="color: red; font-size 20px">Fresh loaves half price!</p>', '<p>Come early.</p>'], bug:[1], type:"missing",
    hint:"Every CSS property needs something between its name and its value.", fix:'<p style="color: red; font-size: 20px">Fresh loaves half price!</p>', re:'^<pstyle="color:red;font-size:20px;?">freshloaveshalfprice!</p>$',
    explain:"In CSS each property is written name, colon, value. Without the colon the browser skips that setting, so the size never changed." },
  { id:"h4", lang:"html", tier:2, title:"The tick box that isn't", story:"The sign-up form shows a plain text box where a tick box should be.",
    code:['<form>', '  <label><input type="chekbox"> Remember me</label>', '</form>'], bug:[1], type:"typo",
    hint:"Read the type word out loud, letter by letter.", fix:'  <label><input type="checkbox"> Remember me</label>', re:'^<label><inputtype="checkbox">rememberme</label>$',
    explain:"The browser only knows certain type words. A misspelled one is ignored, so the input falls back to a normal text box." },
  { id:"h5", lang:"html", tier:3, title:"Link, link, link", story:"After the contact link, every line on the page is underlined and clickable.",
    code:['<h2>Our Bakery</h2>', '<p>Fresh bread every morning.</p>', '<a href="contact.html">Contact us<a>', '<p>Open 8am to 5pm.</p>'], bug:[2], type:"typo",
    hint:"Compare how the link opens with how it closes.", fix:'<a href="contact.html">Contact us</a>', re:'^<ahref="contact\\.html">contactus</a>$',
    explain:"A closing tag starts with a slash. Writing <a> a second time opened another link instead of ending the first one." },
  { id:"h6", lang:"html", tier:3, title:"The silent footer", story:"The page ends halfway down. Everything after the comment is gone.",
    code:['<h2>Opening times</h2>', '<p>Monday to Friday, 8am to 5pm.</p>', '<!-- Footer starts here>', '<p>Thank you for visiting!</p>'], bug:[2], type:"missing",
    hint:"A comment has a very particular way to start and to stop.", fix:'<!-- Footer starts here -->', re:'^<!--footerstartshere-->$',
    explain:"A comment must end with -->. Without it, the browser treats everything that follows as part of the comment and hides it." },

  /* ---------- CSS: the page is fixed, the stylesheet is broken ---------- */
  { id:"c1", lang:"css", tier:1, title:"Two rules, no effect", story:"The heading should be big and crimson, but it is plain and small.",
    page:'<h1>Crumbs Bakery</h1><p>Fresh bread daily.</p>', code:['h1 {', '  color: crimson', '  font-size: 40px;', '}', 'p {', '  color: #333;', '}'], bug:[1], type:"missing",
    hint:"Look at the end of each line inside the braces.", fix:'  color: crimson;', re:'^color:crimson;$',
    explain:"Every CSS declaration ends with a semicolon. Without one, the colour and the size ran together into one invalid line, so both were ignored." },
  { id:"c2", lang:"css", tier:1, title:"A very British colour", story:"The menu title should be teal but stays black.",
    page:'<h2 class="title">Today\'s menu</h2>', code:['.title {', '  colour: teal;', '  text-align: center;', '}'], bug:[1], type:"typo",
    hint:"CSS was invented in the United States. How do they spell it?", fix:'  color: teal;', re:'^color:teal;$',
    explain:"CSS property names must be spelled exactly. 'colour' is not a property, so the browser skipped it." },
  { id:"c3", lang:"css", tier:2, title:"The card that is not styled", story:"The golden card is still plain white. The rule exists, but nothing happens.",
    page:'<div class="card">Fresh sourdough</div>', code:['#card {', '  background: gold;', '  padding: 16px;', '  border-radius: 8px;', '}'], bug:[0], type:"logic",
    hint:"Check how the HTML names its card: with a class or an id?", fix:'.card {', re:'^\\.card\\{$',
    explain:"A # selector looks for an id and a dot looks for a class. The HTML uses class=\"card\", so the rule was matching nothing at all." },
  { id:"c4", lang:"css", tier:2, title:"Padding with no size", story:"The blue box is meant to have roomy padding, but the text still touches the edge.",
    page:'<div class="box">Plenty of room, please</div>', code:['.box {', '  background: #cdeaff;', '  padding: 20;', '  border-radius: 8px;', '}'], bug:[2], type:"missing",
    hint:"A number on its own does not say how big it is.", fix:'  padding: 20px;', re:'^padding:\\d+(\\.\\d+)?(px|rem|em|%);$',
    explain:"Most lengths need a unit such as px or rem. Plain 20 has no unit, so the browser threw the whole line away." },
  { id:"c5", lang:"css", tier:3, title:"Three pills in a column", story:"The three pills should sit side by side, but they are stacked on top of each other.",
    page:'<div class="row"><div class="pill">One</div><div class="pill">Two</div><div class="pill">Three</div></div>',
    code:['.row {', '  display: flexbox;', '  gap: 12px;', '}', '.pill {', '  background: #ffd23f;', '  padding: 6px 12px;', '}'], bug:[1], type:"value",
    hint:"The property is right. Check the value, which is one word.", fix:'  display: flex;', re:'^display:flex;$',
    explain:"The value is flex, not flexbox. An unknown value is ignored, so the row stayed a normal stack." },
  { id:"c6", lang:"css", tier:3, title:"The runaway badge", story:"The NEW badge should sit in the card's corner, but it flew off to the corner of the whole page.",
    page:'<div class="card"><span class="badge">NEW</span>Sourdough loaf</div>',
    code:['.card {', '  position: static;', '  width: 220px;', '  background: #fff3d6;', '  padding: 14px;', '}', '.badge {', '  position: absolute;', '  top: 8px;', '  right: 8px;', '}'], bug:[1], type:"logic",
    hint:"An absolute child measures from its nearest positioned parent.", fix:'  position: relative;', re:'^position:relative;$',
    explain:"An absolutely positioned child is placed relative to the closest parent that is itself positioned. A static card does not count, so the badge used the page instead." },

  /* ---------- C++: run the patched program and compare ---------- */
  { id:"p1", lang:"cpp", tier:1, title:"The program that will not build", story:"The compiler refuses to build this greeting and points somewhere near the end.",
    code:['#include <iostream>', 'using namespace std;', '', 'int main() {', '    cout << "Hello, hero!" << endl', '    return 0;', '}'], bug:[4], type:"missing",
    hint:"Every statement in C++ finishes with the same small symbol.", fix:'    cout << "Hello, hero!" << endl;', expect:'Hello, hero!',
    explain:"A C++ statement ends with a semicolon. Without it the compiler cannot tell where one instruction stops and the next begins." },
  { id:"p2", lang:"cpp", tier:1, title:"Arrows the wrong way", story:"The message never prints. The arrows look like they point the wrong way.",
    code:['#include <iostream>', 'using namespace std;', '', 'int main() {', '    cout >> "Ready!" << endl;', '    return 0;', '}'], bug:[4], type:"typo",
    hint:"Think of cout as a funnel that words flow into.", fix:'    cout << "Ready!" << endl;', expect:'Ready!',
    explain:"Output flows out with <<, and input flows in with >>. Using >> with cout mixes them up." },
  { id:"p3", lang:"cpp", tier:2, title:"Half a biscuit short", story:"Sharing 7 biscuits between 2 friends should give 3.5 each. The program says 3.",
    code:['#include <iostream>', 'using namespace std;', '', 'int main() {', '    double each = 7 / 2;', '    cout << each << endl;', '    return 0;', '}'], bug:[4], type:"logic",
    hint:"Whole numbers divided by whole numbers stay whole.", fix:'    double each = 7.0 / 2;', expect:'3.5',
    explain:"When both numbers are whole, C++ divides them as whole numbers and throws the .5 away before storing it. Making one of them a decimal fixes that." },
  { id:"p4", lang:"cpp", tier:2, title:"One lap too many", story:"The program should count three laps, 0, 1 and 2. It prints four numbers.",
    code:['#include <iostream>', 'using namespace std;', '', 'int main() {', '    for (int i = 0; i <= 3; i++) {', '        cout << i << endl;', '    }', '    return 0;', '}'], bug:[4], type:"value",
    hint:"Count how many times the loop body runs.", fix:'    for (int i = 0; i < 3; i++) {', expect:'0\n1\n2',
    explain:"Starting at 0 and using <= 3 runs for 0, 1, 2 and 3. Using < 3 stops before reaching 3, which gives exactly three laps." },
  { id:"p5", lang:"cpp", tier:3, title:"The doorman lets everyone in", story:"Entry needs an adult AND a ticket. A 15 year old with a ticket got in.",
    code:['#include <iostream>', 'using namespace std;', '', 'int main() {', '    int age = 15;', '    bool hasTicket = true;', '    if (age >= 18 || hasTicket) {', '        cout << "Welcome" << endl;', '    } else {', '        cout << "No entry" << endl;', '    }', '    return 0;', '}'], bug:[6], type:"logic",
    hint:"One of the two tests passes. What should have to happen for entry?", fix:'    if (age >= 18 && hasTicket) {', expect:'No entry',
    explain:"|| means OR, so one true side is enough. && means AND, so both sides must be true, which is what the doorman needs." },
  { id:"p6", lang:"cpp", tier:3, title:"The copy that changed nothing", story:"addOne should add one to the number, but the number stays the same.",
    code:['#include <iostream>', 'using namespace std;', '', 'void addOne(int n) {', '    n = n + 1;', '}', '', 'int main() {', '    int x = 1;', '    addOne(x);', '    cout << x << endl;', '    return 0;', '}'], bug:[3], type:"missing",
    hint:"The function is changing its own private copy.", fix:'void addOne(int &n) {', expect:'2',
    explain:"Normally C++ hands a function a copy. Adding & makes n a reference to the original, so changing n changes x too." },

  /* ---------- JavaScript ---------- */
  { id:"j1", lang:"js", tier:1, title:"Console confusion", story:"The greeting crashes with an error before it prints.",
    code:['let hero = "Mira";', 'consol.log("Welcome, " + hero + "!");'], bug:[1], type:"typo",
    hint:"Read the word before the dot very carefully.", fix:'console.log("Welcome, " + hero + "!");', expect:'Welcome, Mira!',
    explain:"JavaScript only knows the object console. A misspelling is a name it has never heard of, so it stops with an error." },
  { id:"j2", lang:"js", tier:1, title:"The unfinished sum", story:"Nothing runs. The browser complains about the very last line.",
    code:['let coins = 5;', 'let bonus = 3;', 'console.log("Total: " + (coins + bonus);'], bug:[2], type:"missing",
    hint:"Count the opening brackets, then count the closing ones.", fix:'console.log("Total: " + (coins + bonus));', expect:'Total: 8',
    explain:"Every opening bracket needs a closing one. This line opened two but only closed one, so the whole program could not even start." },
  { id:"j3", lang:"js", tier:2, title:"The extra undefined", story:"The loop prints each fruit, then a mysterious extra line at the end.",
    code:['let fruits = ["apple", "banana", "cherry"];', 'for (let i = 0; i <= fruits.length; i++) {', '  console.log(fruits[i]);', '}'], bug:[1], type:"value",
    hint:"The last item has position 2, not 3.", fix:'for (let i = 0; i < fruits.length; i++) {', expect:'apple\nbanana\ncherry',
    explain:"List positions start at 0, so three items sit at 0, 1 and 2. With <= the loop also asked for position 3, which does not exist." },
  { id:"j4", lang:"js", tier:2, title:"Always perfect", story:"The score is 7, yet the program always says Perfect.",
    code:['let score = 7;', 'if (score = 10) {', '  console.log("Perfect!");', '} else {', '  console.log("Keep going");', '}'], bug:[1], type:"logic",
    hint:"One equals sign does a job that is not comparing.", fix:'if (score === 10) {', expect:'Keep going',
    explain:"A single = stores a value, so this line quietly set score to 10, which counts as true. Use === to compare." },
  { id:"j5", lang:"js", tier:3, title:"Fruit salad of 53", story:"5 apples and 3 oranges should be 8 fruit. The program says 53.",
    code:['let apples = "5";', 'let oranges = 3;', 'console.log("Fruit: " + (apples + oranges));'], bug:[0, 2], type:"logic",
    hint:"There is more than one way out. Look at what kind of thing apples holds.", fix:'let apples = 5;', expect:'Fruit: 8',
    explain:"Quote marks make \"5\" text, and adding text to a number glues them together. Making it a real number (or converting it with Number) fixes the sum." },
  { id:"j6", lang:"js", tier:3, title:"The silent doubler", story:"double(4) should give 8, but the program prints undefined.",
    code:['function double(n) {', '  n * 2;', '}', 'console.log(double(4));'], bug:[1], type:"missing",
    hint:"The function does the sum, then throws the answer away.", fix:'  return n * 2;', expect:'8',
    explain:"A function only hands back an answer if it uses return. Without it, the result of n * 2 is thrown away and the call gives undefined." },

  /* ---------- Python ---------- */
  { id:"y1", lang:"py", tier:1, title:"The colon that got away", story:"Python refuses to run this and points to the if line.",
    code:['age = 20', 'if age >= 18', '    print("Welcome in!")'], bug:[1], type:"missing",
    hint:"An if line ends with a small punctuation mark.", fix:'if age >= 18:', expect:'Welcome in!',
    explain:"In Python, lines like if, for and def must end with a colon. It tells Python that an indented block comes next." },
  { id:"y2", lang:"py", tier:1, title:"Pritn", story:"The hello never appears. Python says it does not know a name.",
    code:['name = "Mira"', 'pritn("Hello, " + name)'], bug:[1], type:"typo",
    hint:"Say the function name slowly. Are the letters in order?", fix:'print("Hello, " + name)', expect:'Hello, Mira',
    explain:"Python only has a built in function called print. The scrambled spelling is a name it has never seen." },
  { id:"y3", lang:"py", tier:2, title:"Lined up wrongly", story:"Python complains that it expected an indented block under the for line.",
    code:['for step in range(3):', 'print(step)'], bug:[1], type:"missing",
    hint:"Python uses empty space at the start of a line to know what belongs inside the loop.", fix:'    print(step)', expect:'0\n1\n2',
    explain:"Python uses indentation instead of braces. Lines inside a loop must be pushed in, usually by four spaces." },
  { id:"y4", lang:"py", tier:2, title:"Counting to five", story:"The countdown should show 1 to 5 but it stops at 4.",
    code:['for n in range(1, 5):', '    print(n)'], bug:[0], type:"value",
    hint:"range stops just before its second number.", fix:'for n in range(1, 6):', expect:'1\n2\n3\n4\n5',
    explain:"range(1, 5) runs from 1 up to but not including 5. To include 5, the end number has to be 6." },
  { id:"y5", lang:"py", tier:3, title:"Words and numbers do not mix", story:"Python crashes when it tries to print the score with a label.",
    code:['score = 42', 'print("Score: " + score)'], bug:[1], type:"missing",
    hint:"Text can only be joined to other text. How can a number become text?", fix:'print("Score: " + str(score))', expect:'Score: 42',
    explain:"The + sign cannot join text and a number. str() turns the number into text first, so the two can be joined." },
  { id:"y6", lang:"py", tier:3, title:"One seat too far", story:"There are three colours, and the program tries to print the fourth.",
    code:['colors = ["red", "green", "blue"]', 'print(colors[3])'], bug:[1], type:"value",
    hint:"The first colour is at position 0.", fix:'print(colors[2])', expect:'blue',
    explain:"List positions start at 0, so a list of three has positions 0, 1 and 2. Asking for position 3 goes past the end." }
];

const guildCase = id => GUILD_CASES.find(c => c.id === id);
const guildStars = id => (D.guild && D.guild[id]) || 0;
const guildSolved = () => GUILD_CASES.filter(c => guildStars(c.id) > 0).length;
const guildTotalStars = () => GUILD_CASES.reduce((a, c) => a + guildStars(c.id), 0);
const guildRank = () => { const n = guildTotalStars(); let r = GUILD_RANKS[0][1]; GUILD_RANKS.forEach(([min, name]) => { if (n >= min) r = name; }); return r; };
const guildLangOpen = l => !!D.admin || (isCustom() && trackOpen(l)) || (l === "html" ? htmlDone() : l === "css" ? cssDone() : l === "cpp" ? cppDone() : l === "js" ? jsDone() : pyDone());
