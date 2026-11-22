/* HTML track: the concepts the player learns (CON). */

"use strict";

/* ================= curriculum: concepts ================= */
/* n = name, L = level it is taught at, tags = chips shown on cards, e = explanation */
let CON = {
  tagpair:{n:"Opening and closing tags",L:1,tags:["<p>","</p>"],e:"Most HTML is a pair of tags around some content. The opening tag starts it and the closing tag ends it. The slash is what makes a tag a closing tag."},
  p:{n:"Paragraphs",L:1,tags:["<p>"],e:"p holds a paragraph of text."},
  head:{n:"Headings",L:1,tags:["<h1>","<h2>"],e:"Headings title a section. h1 is the biggest and most important, and the numbers go down to h6."},
  emph:{n:"Strong, em and mark",L:1,tags:["<strong>","<em>","<mark>"],e:"strong marks important text and shows bold. em stresses a word and shows italics. mark highlights text."},
  attr:{n:"Attributes",L:2,tags:['name="value"'],e:"Attributes sit inside the opening tag as name=\"value\" pairs. Put a space between the tag name and each attribute, and put values in double quotes."},
  link:{n:"Links",L:2,tags:["<a href>"],e:"a makes a link. Its href attribute says where the link goes. A # means this same page."},
  clsid:{n:"Class and id",L:2,tags:["class","id"],e:"class labels any number of elements. id names exactly one element. CSS and links use these names later."},
  void:{n:"Void elements",L:3,tags:["<br>","<hr>"],e:"Some tags have no content, so they have no closing tag. br breaks a line and hr draws a line."},
  ul:{n:"Bullet lists",L:3,tags:["<ul>","<li>"],e:"ul is a bulleted list. Each item inside it is an li."},
  ol:{n:"Numbered lists",L:3,tags:["<ol>","<li>"],e:"ol is a numbered list and works like ul. The browser does the counting."},
  lnest:{n:"Nested lists",L:3,tags:["<ul><li><ul>"],e:"A list can sit inside a list item to make a sub-list."},
  div:{n:"div and span",L:4,tags:["<div>","<span>"],e:"div is a box that groups content on its own lines. span groups a few words inside a line."},
  nest:{n:"Nesting order",L:4,tags:["<div><p>"],e:"Tags can sit inside other tags. Close them in reverse order: the last tag you opened is the first one you close."},
  cmt:{n:"Comments",L:4,tags:["<!-- -->"],e:"Comments are notes for people. The browser does not show them."},
  ent:{n:"Entities",L:4,tags:["&lt;","&amp;"],e:"To show a < or & as text, write &lt; or &amp; so the browser does not mistake it for code."},
  doctype:{n:"Doctype",L:5,tags:["<!DOCTYPE html>"],e:"<!DOCTYPE html> goes first and tells the browser this is modern HTML."},
  htmllang:{n:"html and lang",L:5,tags:["<html lang>"],e:"html wraps the whole page. lang says which language the page is in, which helps screen readers."},
  headmeta:{n:"head and meta",L:5,tags:["<head>","<meta>"],e:"head holds information about the page. meta charset=\"utf-8\" makes letters and symbols display correctly. meta is a void element."},
  title:{n:"Page title",L:5,tags:["<title>"],e:"title sets the text on the browser tab. It lives inside head."},
  body:{n:"body",L:5,tags:["<body>"],e:"Everything the visitor sees lives inside body."},
  hf:{n:"header and footer",L:6,tags:["<header>","<footer>"],e:"header holds the top of a page or section, and footer holds the bottom."},
  nav:{n:"Navigation",L:6,tags:["<nav>"],e:"nav wraps the main links of a page."},
  msec:{n:"main and section",L:6,tags:["<main>","<section>"],e:"main wraps the central content of a page, and section groups related content inside it."},
  art:{n:"article and aside",L:6,tags:["<article>","<aside>"],e:"article is content that stands on its own. aside is side content that is related but not essential."},
  img:{n:"Images",L:7,tags:["<img>"],e:"img shows a picture. src says where the file is. It is a void element, so it has no closing tag."},
  alt:{n:"Alt text",L:7,tags:["alt"],e:"alt describes an image for people who cannot see it, and shows if the image fails to load."},
  fig:{n:"figure and figcaption",L:7,tags:["<figure>","<figcaption>"],e:"figure groups a picture with its caption, written in figcaption."},
  media:{n:"Audio and video",L:7,tags:["<audio>","<video>"],e:"audio and video play media. The controls attribute shows play buttons. It needs no value, writing it is enough."},
  table:{n:"Tables",L:8,tags:["<table>","<tr>","<td>"],e:"table holds data in rows (tr) made of cells (td)."},
  th:{n:"Header cells",L:8,tags:["<th>"],e:"th is a heading cell. Use it for column or row titles."},
  tsec:{n:"thead and tbody",L:8,tags:["<thead>","<tbody>"],e:"thead holds the header rows and tbody holds the main rows."},
  cspan:{n:"caption and colspan",L:8,tags:["<caption>","colspan"],e:"caption titles a table. colspan makes a cell stretch across several columns."},
  form:{n:"Forms",L:9,tags:["<form>"],e:"form wraps the controls a visitor fills in."},
  label:{n:"Labels",L:9,tags:["<label for>"],e:"label names a control. Its for attribute matches the id of the input it belongs to."},
  input:{n:"Input types",L:9,tags:["<input>","type"],e:"input makes a control. The type attribute picks what kind: text, email, checkbox and more. It is a void element."},
  select:{n:"Dropdowns and text areas",L:9,tags:["<select>","<option>","<textarea>"],e:"select makes a dropdown made of option elements. textarea is a larger box for typing."},
  button:{n:"Buttons",L:9,tags:["<button>"],e:"button makes something clickable. The text between the tags is the label."},
  req:{n:"Required and placeholder",L:9,tags:["required","placeholder"],e:"required means the box must be filled in. placeholder shows a faint hint inside an empty box."}
};
let CON_IDS = Object.keys(CON);
