/* Small DOM, timing and random helpers used everywhere. */

"use strict";

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = ms => new Promise(r => setTimeout(r, reduce ? Math.min(ms, 120) : ms));
const anim = (el, k, o) => (reduce || !el.animate) ? Promise.resolve() : el.animate(k, o).finished.catch(() => {});
const esc = c => c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c;
const escH = s => String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const sample = a => a[Math.floor(Math.random() * a.length)];
