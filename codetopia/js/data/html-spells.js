/* HTML track: every spell the player can type, grouped by level. */

"use strict";

/* ================= curriculum: spells ================= */
/* sp(level, action, concepts, title, code, goal, extra). Placeholders: {w} {x} {y} words, {k} class, {i} id, {t} tag name.
   extra.bug = broken code the enemy casts (a fix spell). extra.fx = item effects. */
let SP = []; let spId = 0;
const sp = (L, a, c, t, code, goal, o) => SP.push(Object.assign({ id:++spId, L, a, c:[].concat(c), t, code, goal }, o || {}));
const FIX = "Fix the enemy's broken spell so it works.";

/* level 1: tags and text */
sp(1,"attack",["tagpair","p"],"Paragraph",'<p>{w}!</p>',"Write a paragraph that says “{w}!”");
sp(1,"attack",["tagpair","head"],"Heading",'<h1>{w}!</h1>',"Write a main heading that says “{w}!”");
sp(1,"attack","emph","Strong",'<strong>{w}!</strong>',"Make “{w}!” important, so it shows in bold");
sp(1,"attack","emph","Emphasis",'<em>{w}</em>',"Stress the word “{w}”, so it shows in italics");
sp(1,"attack","emph","Highlight",'<mark>{w}!</mark>',"Highlight “{w}!”");
sp(1,"attack","head","Sub-heading",'<h2>{w} {x}</h2>',"Write a second-level heading that says “{w} {x}”");
sp(1,"attack",["tagpair","p"],"Two words",'<p>{w} {x}</p>',"Write a paragraph that says “{w} {x}”");
/* level 2: attributes and links */
sp(2,"heavy",["attr","link"],"Link",'<a href="#">{w}</a>',"Make a link that says “{w}” and goes to #");
sp(2,"heavy",["attr","clsid"],"Class",'<h1 class="{k}">{w}</h1>',"Write a heading that says “{w}” and has the class “{k}”");
sp(2,"heavy",["attr","clsid"],"Id",'<p id="{i}">{w}</p>',"Write a paragraph that says “{w}” and has the id “{i}”");
sp(2,"heavy",["attr","link"],"Web link",'<a href="https://example.com">{w}</a>',"Make a link that says “{w}” and goes to https://example.com");
sp(2,"heavy","attr","Tooltip",'<p title="{w}">{x}</p>',"Write a paragraph that says “{x}” and has the title “{w}”");
sp(2,"heavy",["attr","clsid"],"Classed strong",'<strong class="{k}">{w}</strong>',"Make “{w}” strong, with the class “{k}”");
/* level 3: void elements and lists */
sp(3,"attack","void","Line break",'<p>{w}<br>{x}</p>',"Write a paragraph with “{w}” and “{x}” on separate lines");
sp(3,"attack","void","Divider",'<p>{w}</p><hr><p>{x}</p>',"Write two paragraphs, “{w}” and “{x}”, with a line between them");
sp(3,"heavy","ul","Bullet list",'<ul><li>{w}</li><li>{x}</li></ul>',"Make a bullet list with “{w}” and “{x}”");
sp(3,"heavy","ol","Numbered list",'<ol><li>{w}</li><li>{x}</li></ol>',"Make a numbered list with “{w}” and “{x}”");
sp(3,"heavy",["ul","lnest"],"Sub-list",'<ul><li>{w}<ul><li>{x}</li></ul></li></ul>',"Make a bullet list with “{w}” that has a sub-list holding “{x}”");
sp(3,"heavy",["ul","link"],"Link list",'<ul><li><a href="#">{w}</a></li></ul>',"Make a bullet list with one linked item, “{w}”");
sp(3,"heavy",["ol","clsid"],"Classed list",'<ol class="{k}"><li>{w}</li></ol>',"Make a numbered list with the class “{k}” and one item, “{w}”");
/* level 4: containers, nesting, comments, entities */
sp(4,"block","div","Div box",'<div>{w}</div>',"Wrap “{w}” in a div");
sp(4,"block",["div","nest"],"Div and paragraph",'<div><p>{w}</p></div>',"Put a paragraph that says “{w}” inside a div");
sp(4,"block",["div","clsid"],"Classed div",'<div class="{k}"><p>{w}</p></div>',"Put a paragraph that says “{w}” inside a div with the class “{k}”");
sp(4,"block","div","Span",'<p>{w} <span>{x}</span></p>',"Write a paragraph “{w} {x}” where “{x}” is inside a span");
sp(4,"block","cmt","Comment",'<!-- {w} --><p>{x}</p>',"Add a comment saying “{w}”, then a paragraph that says “{x}”");
sp(4,"block",["div","nest"],"Two children",'<div><h2>{w}</h2><p>{x}</p></div>',"Put a heading “{w}” and a paragraph “{x}” inside one div");
sp(4,"attack","ent","Angle brackets",'<p>&lt;{t}&gt;</p>',"Show the text <{t}> in a paragraph, using entities for the angle brackets");
sp(4,"attack","ent","Ampersand",'<p>{w} &amp; {x}</p>',"Write a paragraph “{w} & {x}”, using an entity for the ampersand");
sp(4,"block",["tagpair","p"],"Fix: missing slash",'<p>{w}</p>',FIX,{bug:'<p>{w}<p>'});
sp(4,"block","nest","Fix: crossed tags",'<div><p>{w}</p></div>',FIX,{bug:'<div><p>{w}</div></p>'});
sp(4,"block",["attr","link"],"Fix: missing quotes",'<a href="#">{w}</a>',FIX,{bug:'<a href=#>{w}</a>'});
/* level 5: page skeleton */
sp(5,"block",["doctype","htmllang"],"Page shell",'<!DOCTYPE html>\n<html lang="en">\n</html>',"Write the start of a page: the doctype, then an empty html element in English");
sp(5,"block",["headmeta","title"],"Head",'<head>\n  <meta charset="utf-8">\n  <title>{w}</title>\n</head>',"Write a head that sets UTF-8 characters and the page title “{w}”");
sp(5,"block","body","Body",'<body>\n  <h1>{w}</h1>\n  <p>{x}</p>\n</body>',"Write a body with a heading “{w}” and a paragraph “{x}”");
sp(5,"attack","title","Title tag",'<title>{w}</title>',"Write the page title “{w}”");
sp(5,"attack","headmeta","Charset",'<meta charset="utf-8">',"Tell the browser to use UTF-8 characters");
sp(5,"heavy",["doctype","htmllang","headmeta","title","body"],"Whole page",'<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <title>{w}</title>\n  </head>\n  <body>\n    <h1>{x}</h1>\n  </body>\n</html>',"Write a complete page with the title “{w}” and a heading “{x}”");
sp(5,"block","htmllang","Fix: no language",'<html lang="en">',FIX,{bug:'<html>'});
sp(5,"block",["headmeta","title"],"Fix: title in the wrong place",'<head>\n  <title>{w}</title>\n</head>',FIX,{bug:'<title>{w}</title>\n<head>\n</head>'});
/* level 6: semantic layout */
sp(6,"block","hf","Header",'<header><h1>{w}</h1></header>',"Write a header that holds a heading “{w}”");
sp(6,"block","nav","Navigation",'<nav><a href="#">{w}</a></nav>',"Write a nav that holds a link “{w}”");
sp(6,"block","msec","Main",'<main><section><h2>{w}</h2></section></main>',"Write main content with a section holding a heading “{w}”");
sp(6,"block","hf","Footer",'<footer><p>{w}</p></footer>',"Write a footer holding a paragraph “{w}”");
sp(6,"block","art","Article",'<article><h2>{w}</h2><p>{x}</p></article>',"Write an article with a heading “{w}” and a paragraph “{x}”");
sp(6,"block","art","Aside",'<aside><p>{w}</p></aside>',"Write an aside holding a paragraph “{w}”");
sp(6,"heavy",["hf","nav"],"Header with nav",'<header>\n  <nav>\n    <a href="#">{w}</a>\n  </nav>\n</header>',"Write a header that holds a nav with one link, “{w}”");
sp(6,"heavy",["msec","art"],"Main layout",'<main>\n  <article>\n    <h2>{w}</h2>\n  </article>\n  <aside>{x}</aside>\n</main>',"Write main content with an article heading “{w}” and an aside saying “{x}”");
sp(6,"block","nav","Fix: use nav",'<nav><a href="#">{w}</a></nav>',"Swap the plain div for the right semantic tag.",{bug:'<div id="nav"><a href="#">{w}</a></div>'});
sp(6,"block","hf","Fix: use header",'<header><h1>{w}</h1></header>',"Swap the plain div for the right semantic tag.",{bug:'<div class="header"><h1>{w}</h1></div>'});
/* level 7: images and media */
sp(7,"item",["img","alt"],"Image",'<img src="potion.png" alt="{w}">',"Show the picture potion.png with the alt text “{w}”",{name:"Potion"});
sp(7,"item",["img","alt"],"Sized image",'<img src="potion.png" alt="{w}" width="48">',"Show potion.png with the alt text “{w}”, 48 pixels wide",{name:"Big potion"});
sp(7,"item",["fig","img"],"Figure",'<figure><img src="potion.png" alt="{w}"><figcaption>{x}</figcaption></figure>',"Show potion.png with the alt text “{w}” and a caption saying “{x}”",{name:"Scroll",fx:{heal:18,shield:.5}});
sp(7,"item","media","Audio",'<audio controls></audio>',"Add an audio player that shows its controls",{name:"Lullaby",fx:{heal:14,skip:true}});
sp(7,"item","media","Video",'<video controls width="120"></video>',"Add a video player with controls, 120 pixels wide",{name:"Mirror",fx:{heal:14,skip:true}});
sp(7,"heavy",["link","img","alt"],"Image link",'<a href="#"><img src="potion.png" alt="{w}"></a>',"Make the picture potion.png, with the alt text “{w}”, a link to #");
sp(7,"block","alt","Fix: missing alt",'<img src="potion.png" alt="{w}">',FIX,{bug:'<img src="potion.png">'});
/* level 8: tables */
sp(8,"heavy","table","Table",'<table><tr><td>{w}</td><td>{x}</td></tr></table>',"Make a table with one row of two cells, “{w}” and “{x}”");
sp(8,"heavy",["table","th"],"Header row",'<table><tr><th>{w}</th><th>{x}</th></tr></table>',"Make a table with one row of header cells, “{w}” and “{x}”");
sp(8,"heavy",["table","cspan"],"Caption",'<table><caption>{w}</caption><tr><td>{x}</td></tr></table>',"Make a table with the caption “{w}” and one cell, “{x}”");
sp(8,"heavy",["table","cspan"],"Spanning cell",'<table><tr><td colspan="2">{w}</td></tr></table>',"Make a table with one cell that spans two columns and says “{w}”");
sp(8,"heavy",["table","th","tsec"],"Table sections",'<table>\n  <thead>\n    <tr><th>{w}</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>{x}</td></tr>\n  </tbody>\n</table>',"Make a table with a head row “{w}” and a body row “{x}”");
sp(8,"heavy",["table","th"],"Grid",'<table>\n  <tr>\n    <th>{w}</th>\n    <th>{x}</th>\n  </tr>\n  <tr>\n    <td>1</td>\n    <td>2</td>\n  </tr>\n</table>',"Make a table with a header row “{w}”, “{x}” and a row of 1 and 2");
sp(8,"block","table","Fix: missing row",'<table><tr><td>{w}</td></tr></table>',FIX,{bug:'<table><td>{w}</td></table>'});
/* level 9: forms */
sp(9,"item","button","Button",'<button>{w}</button>',"Make a button that says “{w}”",{name:"Elixir"});
sp(9,"item",["button","attr"],"Button type",'<button type="button">{w}</button>',"Make a button of type “button” that says “{w}”",{name:"Tonic"});
sp(9,"item",["input","req"],"Text box",'<input type="text" placeholder="{w}">',"Make a text box with the placeholder “{w}”",{name:"Charm"});
sp(9,"item","input","Checkbox",'<input type="checkbox" checked>',"Make a checkbox that starts ticked",{name:"Rune",fx:{heal:18,shield:.5}});
sp(9,"item",["label","input"],"Labelled box",'<label for="{i}">{w}</label><input id="{i}">',"Make a label “{w}” connected to an input with the id “{i}”",{name:"Herb"});
sp(9,"item","select","Dropdown",'<select><option>{w}</option><option>{x}</option></select>',"Make a dropdown with the options “{w}” and “{x}”",{name:"Brew"});
sp(9,"item","select","Text area",'<textarea rows="2">{w}</textarea>',"Make a text area, 2 rows tall, that starts with “{w}”",{name:"Journal"});
sp(9,"item","req","Required",'<input type="email" required>',"Make an email box that must be filled in",{name:"Pledge"});
sp(9,"attack","form","Form",'<form><input type="text"><button>{w}</button></form>',"Wrap a text box and a button that says “{w}” in a form");
sp(9,"heavy",["form","label","input","button"],"Whole form",'<form>\n  <label for="{i}">{w}</label>\n  <input id="{i}" type="text">\n  <button>{x}</button>\n</form>',"Make a form: a label “{w}” for an input with the id “{i}”, then a button “{x}”");
sp(9,"block","label","Fix: label not connected",'<label for="{i}">{w}</label><input id="{i}">',FIX,{bug:'<label>{w}</label><input id="{i}">'});
sp(9,"block","button","Fix: open button",'<button>{w}</button>',FIX,{bug:'<button>{w}'});
/* level 10: build pages */
sp(10,"heavy",["doctype","htmllang","headmeta","title","body","hf","msec","nest"],"Build a hall",'<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8">\n    <title>{w}</title>\n  </head>\n  <body>\n    <header>\n      <h1>{x}</h1>\n    </header>\n    <main>\n      <p>{y}</p>\n    </main>\n  </body>\n</html>',"Build a page titled “{w}”, with a header holding the heading “{x}” and a main area holding the paragraph “{y}”");
sp(10,"heavy",["body","nav","ul","link","nest"],"Build a menu",'<body>\n  <nav>\n    <ul>\n      <li><a href="#">{w}</a></li>\n      <li><a href="#">{x}</a></li>\n    </ul>\n  </nav>\n</body>',"Build a body with a nav holding a bullet list of two links, “{w}” and “{x}”");
sp(10,"item",["form","label","input","req","button"],"Build a sign-up",'<form>\n  <label for="{i}">{w}</label>\n  <input id="{i}" type="email" required>\n  <button>{x}</button>\n</form>',"Build a form: a label “{w}” for a required email input with the id “{i}”, then a button “{x}”",{name:"Banner",fx:{heal:26,shield:.5}});
sp(10,"block",["body","hf","head","tagpair","img","alt"],"Fix a broken page",'<body>\n  <header>\n    <h1>{w}</h1>\n  </header>\n  <img src="potion.png" alt="{x}">\n</body>',"This page has two bugs. Type the fixed version.",{bug:'<body>\n  <header>\n    <h1>{w}\n  </header>\n  <img src="potion.png">\n</body>'});
sp(10,"attack",["body","head","p"],"Quick body",'<body>\n  <h1>{w}</h1>\n  <p>{x}</p>\n</body>',"Write a body with a heading “{w}” and a paragraph “{x}”");
sp(10,"attack",["table","th","cspan"],"Build a table",'<table>\n  <caption>{w}</caption>\n  <tr>\n    <th>{x}</th>\n    <td>{y}</td>\n  </tr>\n</table>',"Build a table with the caption “{w}” and one row: a header cell “{x}” and a cell “{y}”");
