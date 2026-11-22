/* The four language mentors and the spellbook librarian: who they are, what they say when you first meet them, and one tip for each level. */

"use strict";

const MENTORS = {
  html:{ sprite:"mentor_html", name:"Elder Tagwyn", role:"Keeper of the Tags", bg:"html",
    intro:[
      "Welcome, young apprentice. I am Elder Tagwyn. I have tended these plains since before the first page was written.",
      "Everything here is built from tags. A tag opens, holds something, and closes again. Keep them matched and the world stays standing.",
      "Learn this before you fight. Every attack offers three spells. One shows the tags for you to copy. One hides the words and leaves the dots. One is blank, so you write it from memory. The harder the style, the harder it hits.",
      "The Markup Titan waits at the end of the road. Cast carefully, and come to me if you get lost."],
    tips:[
      "Tags come in pairs. What you open, you must close, and the closing tag has a slash: </p>.",
      "Attributes live inside the opening tag, as name=\"value\". A link needs href to know where it goes.",
      "Some tags, like <br> and <img>, hold nothing, so they have no closing tag. We call them void elements.",
      "Elements can sit inside other elements. Close the inner one before the outer one, like boxes in boxes.",
      "Every page has the same skeleton: <html>, then <head> for the page's details, and <body> for what people see.",
      "Use tags that say what the content is: <header>, <nav>, <main> and <footer>. Readers and search engines both thank you.",
      "An image needs src to say which picture, and alt to describe it for those who cannot see it.",
      "A table is rows, and rows are cells. <tr> makes a row, <th> a heading cell and <td> an ordinary one.",
      "A form collects what people type. Each <input> needs a name, and each box deserves a <label>.",
      "The Markup Titan is built of everything you have learned. Take your time and keep every tag matched."] },
  css:{ sprite:"mentor_css", name:"Brush the Painter", role:"Guardian of the Sunlit Forest", bg:"css",
    intro:[
      "Well met, traveller! I am Brush, and I keep the sunlit forest looking its best. Nothing here stays dull for long.",
      "HTML builds the page, and CSS makes it beautiful. A rule picks something with a selector, then says how it should look inside curly braces.",
      "A painter's tip. Every attack offers three spells. One shows the rule to copy, one leaves dots for you to fill in, and one is a blank canvas, painted from memory. The less you copy, the harder the strike.",
      "Cascade the Chameleon lurks at the far end, changing colors faster than anyone can follow. Cast neatly and you will see right through it."],
    tips:[
      "A CSS rule is a selector, then braces holding declarations. Each declaration is a property, a colon, a value and a semicolon.",
      "Never forget the semicolon after each value. Without it, the next property gets swallowed up by the last.",
      "font-size, font-weight and text-align change how words look. Numbers need a unit written straight after them, like 24px.",
      "A dot picks a class and a hash picks an id. Use classes for many things and an id for just one.",
      "Every element is a box: content, then padding, then border, then margin. Padding is inside the border, margin is outside.",
      "Set box-sizing: border-box so that width means the whole box, padding and border included. Most designers do it for everything.",
      "Hex colors like #ff6b81 mix red, green and blue. Gradients go in background, not background-color.",
      "display: flex lines children up in a row. justify-content spaces them along the row and align-items lines them up across it.",
      "Grid is for rows and columns together. repeat(3, 1fr) makes three equal columns, and gap spaces the cells.",
      "position: relative lets you nudge an element, and z-index decides who sits on top. A transition makes changes glide.",
      "When rules clash, the more specific selector wins, and if they tie, the later rule wins. !important beats both, so use it sparingly.",
      "Custom properties like --main: teal; let you change a color in one place and see it update everywhere."] },
  cpp:{ sprite:"mentor_cpp", name:"Ranger Ampersand", role:"Warden of the Dark Forest", bg:"cpp",
    intro:[
      "Quiet now. The forest listens. I am Ranger Ampersand, and I keep the paths between the trees.",
      "C++ is strict, and it never forgets. Every statement ends with a semicolon, and every name must be declared before you use it.",
      "Remember this. Each attack offers three spells. One shows the code, one hides its words behind dots, and one is blank, to be written from memory. The less you can see, the harder you hit.",
      "Follow my lantern and watch your step. The Pointer Wraith waits deep in the woods, and it hides in the places you cannot see."],
    tips:[
      "Print with cout and the << arrows. Every statement ends with a semicolon.",
      "Declare a variable with its type first: int for whole numbers, double for decimals, string for text.",
      "Remember that / between two ints throws the decimal away. 7 / 2 is 3, not 3.5.",
      "if and else choose a path. Use == to compare, because a single = stores a value instead.",
      "A loop repeats a block. for is best when you know how many times, while when you do not.",
      "A function is a named spell. Give it a return type, then parameters, then the body in braces.",
      "Arrays count from zero, so the last of five items is at index 4. A vector can grow when you need it to.",
      "A string is a row of characters. .size() counts them, and each one can be read by its index.",
      "A reference is another name for the same variable. A pointer holds an address, and * follows it.",
      "The Pointer Wraith loves bad addresses. Know what each pointer points at before you follow it."] },
  js:{ sprite:"mentor_js", name:"Dame Arrow", role:"Steward of the Keep", bg:"js",
    intro:[
      "Halt, and be welcome. I am Dame Arrow, steward of this keep. Few reach these halls with their sanity intact.",
      "JavaScript is quick and forgiving, and it will let you make mistakes without complaint. Do not mistake that for kindness.",
      "A steward's rule. Each attack offers three spells. One shows the code, one leaves dots to fill, and one is blank, written from memory. Every blow that costs you more memory lands harder.",
      "The Callback Hydra waits upstairs. Cut one problem and two more appear, so keep your functions small and your wits sharp."],
    tips:[
      "console.log is how you speak to the console. Strings go in quotes, and semicolons end your statements.",
      "Use const for values that never change and let for values that do. Avoid var.",
      "Use === to compare. The double == will quietly change types and surprise you.",
      "if, else if and else choose a path. && means both, || means either, and ! flips the answer.",
      "A for loop has three parts: where to start, when to stop and how to step. Check each one.",
      "Functions can be written as arrow functions: (a, b) => a + b. They are short, and they are everywhere.",
      "An array is a list in square brackets. Count from zero, and use .push() to add to the end.",
      "An object groups values under names. Reach in with a dot, such as hero.name.",
      "map, filter and reduce take a function and do the looping for you. This is what callbacks are for.",
      "The page itself is made of objects too. Find an element, then change what it shows, and watch it respond."] },
  py:{ sprite:"mentor_py", name:"Master Zen", role:"Hermit of the Castle Roof", bg:"rampart",
    intro:[
      "Ah. You have climbed far, apprentice. I am Master Zen, and I have meditated up here a long time.",
      "Python values clear, simple code. There are no braces and no semicolons. The shape of your lines is the shape of your thoughts.",
      "Hold this in mind. Each attack offers three spells. One shows the lines, one hides them behind dots, and one is empty, written from memory. The less you copy, the stronger the strike.",
      "Pythona waits in the tower ahead. Her coils are tight, but her spells are only code. Breathe, and write one clean line at a time."],
    tips:[
      "print() shows a result. A new line ends a statement, so there are no semicolons to worry about.",
      "A variable is just a name for a value: x = 5. Python works out the type for you.",
      "A / always gives a decimal, // throws it away, and % gives the remainder. f-strings tuck values into text.",
      "Indentation is the block. Four spaces under an if or else, and keep them the same.",
      "for i in range(5) runs five times, starting from zero. A while loop needs something inside it to change.",
      "def names a function, and return hands back a value. Without return you get None.",
      "Lists use square brackets and count from zero. A negative index counts from the end.",
      "A dictionary stores values under keys. d.get(key, 0) is a safe way to look one up.",
      "A comprehension builds a list in one line: [x * 2 for x in nums]. Sorting takes a key if you need one.",
      "In the tower the page will vanish. Remember what you have learned, in every language, and cast from memory."] }
};

const LIBRARIAN = {
  sprite:"librarian", name:"Librarian Quill",
  intro:"Shh, this is a library. I am Librarian Quill, and I keep every page you have learned. I will tell you which ones need a second reading.",
  line(st){
    const L = TRK.lang;
    if (st.due) return `${st.due} page${st.due === 1 ? " is" : "s are"} due for review. Spells slip away when they are left alone, so read those first.`;
    if (st.mastered >= st.total && st.total) return `Every ${L} page is mastered. I have never seen a tidier shelf. Well done.`;
    if (st.mastered >= st.total * .6) return `You have mastered most of the ${L} pages. Only a few remain, and I am sure you will find them.`;
    if (st.mastered >= 1) return `${st.mastered} ${L} page${st.mastered === 1 ? " is" : "s are"} mastered. A page counts once you write it cleanly several times, spread over days.`;
    return `Nothing mastered yet in ${L}, and that is quite all right. Every shelf starts empty. Read a page, then cast it.`;
  },
  extras:[
    "A locked page is simply one you have not reached yet. I will keep it warm for you.",
    "The stars beside each page show how well you cast it. Three stars means a clean cast.",
    "Reading a page is not the same as knowing it. Cast it a few times, a few days apart.",
    "Do not hurry. Pages that are reviewed on a spread-out schedule stay with you much longer."]
};
