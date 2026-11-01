# Codetopia

A pixel-art RPG that teaches programming by making you **type the spells**. Every attack, ward and potion is real code. You write it correctly to cast it, and the game shows what the code does. Built for COMP3000 (University of Plymouth).

Currently playable:

| Track | Levels | Final boss | How it unlocks |
|-------|--------|-----------|----------------|
| HTML  | 10 | Markup Titan | Open from the start |
| C++   | 10 | Pointer Wraith | Defeat the Markup Titan (or use Admin mode) |
| JavaScript, Python | not built yet | Callback Hydra, Pythona | Admin mode gives boss-arena test fights |

## Running it

No build step and no dependencies. Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000     # then visit http://localhost:8000
```

It also works on GitHub Pages (Settings > Pages > deploy from the main branch, root folder).

Progress is saved in the browser's `localStorage` under `codetopia.campaign.v1`. The save layer is isolated in `js/engine/save.js` so it can be swapped for accounts later.

## How the game teaches

- **Typing practice with fading help.** New spells show the full code. As a concept is mastered the help fades (full, then tags only, then recall from memory).
- **Spaced repetition.** Each concept has a Leitner-style box; concepts due for review come back as "Review" spells.
- **Adaptive difficulty.** Foe damage adjusts to how many of your last 10 spells had no mistakes.
- **Fix-the-bug spells** appear under Block, where the enemy casts broken code you must repair.
- **Hints** explain the exact mistake you just made.

## Admin mode

On the map, press **Admin**. Every level, every language, every boss arena and every character opens. Nothing from arena fights is saved to your campaign.

## Project layout

```
index.html              markup for every screen (battle, map, spellbook, unlockables, sandbox, story, title)
css/
  base.css              design tokens, page layout, top bar
  battle.css            scene, actors, action buttons, code console
  sheets.css            map, spellbook, sandbox, unlockables
  screens.css           opening story, title and language select
js/                     plain scripts, loaded in this order (see index.html)
  core/                 DOM helpers, sprite-to-SVG renderer
  data/                 content only: sprites, character art, concepts, levels, spells (HTML and C++)
  engine/               code analysis and hints per language, track registry, save layer
  game/                 characters/achievements, mastery scheduling, battle state
  battle/               spell selection, typing editor, effects, combat, level flow
  ui/                   backdrop, HUD, sheets, title and language screens, story
  main.js               boot
tests/smoke_test.py     Playwright smoke test
```

Scripts are classic (non-module) so the game runs from `file://` too. They share one global scope, so keep the load order in `index.html`.

## Adding a language track

1. Add concepts, levels and spells in `js/data/` (copy the C++ files as a model; `cs(level, action, concepts, title, code, goal, out)` defines a C++ spell and `sp(...)` an HTML one).
2. Add a tokenizer and a mistake-hint function in `js/engine/` (see `analysis-cpp.js`).
3. Register it in `js/engine/tracks.js`. Progress for each track is stored separately.
4. Add its card to the language select in `index.html` and `js/ui/title-language.js`.

## Characters

Unlockable characters come from public-domain works, drawn from the source text and no film or game designs. Front-view art is shown in Unlockables and a version turned 45 degrees is shown in battle. Both live in `js/data/skin-art.js`.

Public-domain status here refers to the US. Notes for anyone reusing the art:

- **Winnie the Pooh**: A. A. Milne's 1926 text is public domain in the US; Milne's text enters the UK public domain in 2027 and E. H. Shepard's illustrations in 2047. This sprite is an original drawing, not a copy of Shepard's art.
- **Zorro**: the 1919 story is public domain in the US, but the character's trademarks are actively enforced. Do not publish or sell Zorro commercially.
- **Peter Pan** has special UK protection and is deliberately not included.

## Roadmap

- JavaScript and Python tracks (the Callback Hydra and Pythona already exist as boss arenas)
- Accounts and cloud saves
