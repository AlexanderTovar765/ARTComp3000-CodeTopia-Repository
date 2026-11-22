# Codetopia

A pixel-art RPG that teaches programming by making you **type the spells**. Every attack, ward and potion is real code. You write it correctly to cast it, and the game shows what the code does. Built for COMP3000 (University of Plymouth).

Currently playable:

| Track | Levels | Final boss | How it unlocks |
|-------|--------|-----------|----------------|
| HTML  | 10 | Markup Titan | Open from the start |
| CSS   | 10 | Cascade the Chameleon (mini boss: Overflow Ogre) | Defeat the Markup Titan (or use Admin mode). Guardian: Brush the Painter. Levels run through a sunny forest that darkens toward the C++ lands |

The village square is 640 by 420 and has a road on every side: west (C++), east (JavaScript), north (Python), and three south roads (CSS, HTML and the Debuggers' Guild). The Guild is a side district, not a language: it opens once HTML is cleared (or in admin mode) and is run by D-Bug, a giant beetle. Code: `bGuild` in `js/ui/village-art.js` and the `guild` scene in `js/ui/village-scenes.js`.

**Village art** (`js/ui/village-art.js`) holds the detailed painters for the square's Library, Forge, Shop and Tower, the Guild and every language district (HTML, CSS, C++, JS and Python houses, the small houses, the fir trees) (textured stone and wood, shingled roofs, window light), plus trees, lamps, benches, barrels, bushes, the basin fountain and the far spire of Pythona's tower. The cobbles get a lit top edge, glints and soft shadows where they meet grass. All of it warms from storm night to sunrise as guardians fall.

**The Debuggers' Guild** (`js/ui/guild.js`, cases in `js/data/guild-cases.js`) holds 30 case files, six per language. Each case is a short broken program with exactly one faulty line. The player does three steps: tap the line with the bug, name the kind of mistake (typo, missing piece, wrong value or logic mistake) and rewrite the line. HTML and CSS cases show a live page and check the new line against a pattern. JavaScript, Python and C++ cases really run on the Forge interpreters, so the player sees the symptom (an error or wrong output) and then the cure, and any fix that prints the right output is accepted. Stars: one for solving, one for a clean investigation (no wrong guesses) and one for fixing it first time with no hint. A language's file opens when that language is cleared (all open in admin mode). Progress is saved in `D.guild`.
| C++   | 10 | Pointer Wraith | Defeat Cascade the Chameleon (or use Admin mode) |
| JavaScript | 10 | Callback Hydra | Defeat the Pointer Wraith (or use Admin mode). Levels climb a spiral inside the keep, and level 10 shows a live page |
| Python | 10 | Pythona | Defeat the Callback Hydra (or use Admin mode). Levels run along a straight line across the castle roof. Level 10 has cutscenes, a collapsing tower and a blind final form where spells from all five languages can appear |

Each language has a mentor on its map (Elder Tagwyn for HTML, Ranger Ampersand for C++, Dame Arrow for JavaScript, Master Zen for Python) who introduces themselves in a short cutscene on the first visit and gives one tip per level. In the Pythona finale the apprentice finds her old robe and wears it for the rest of the fight. Completing the campaign unlocks it as the campaign-only skin Pythona's Robe, which cannot be bought with coins. Librarian Quill sits at the top of the spellbook, comments on your review state and can filter the book to pages due for review.

## Running it

No build step and no dependencies. Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000     # then visit http://localhost:8000
```

It also works on GitHub Pages (Settings > Pages > deploy from the main branch, root folder).

Progress is saved in the browser's `localStorage` under `codetopia.campaign.v1`. The save layer is isolated in `js/engine/save.js` so it can be swapped for accounts later.

## How the game teaches

- **Three casting styles, risk and reward.** Attack and Heavy attack (both available from level 1 in every language) always offer three spells in a fixed order: *Faded text* (the code is shown, normal damage), *Dots* (words hidden, the shape stays, 25% more damage) and *From memory* (blank, 50% more damage). A hint shows the code again and drops the bonus. Pythona's second phase keeps the older random mix. Block and Item keep the older mix that grows with the level. Code: `assignModes` and `MODE_DMG` in `js/game/mastery.js`.
- **Spaced repetition.** Each concept has a Leitner-style box; concepts due for review come back as "Review" spells.
- **Adaptive difficulty.** Foe damage adjusts to how many of your last 10 spells had no mistakes.
- **Fix-the-bug spells** appear under Block, where the enemy casts broken code you must repair.
- **Hints** explain the exact mistake you just made.

## Admin mode

On the map, press **Admin**. Every level, every language, every boss arena and every character opens. Nothing from arena fights is saved to your campaign.

## Project layout

```
index.html              markup for every screen (battle, map, spellbook, unlockables, Forge, story, title)
css/
  base.css              design tokens, page layout, top bar
  battle.css            scene, actors, action buttons, code console
  sheets.css            map, spellbook, Forge, unlockables
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

The Apprentice collection has two free looks that need no unlocking: the original teal and a red one (`hero_red`, the default apprentice art recoloured by `recolour()` in `js/game/skins.js`, front and battle views together). Both count as the default apprentice in the cutscenes. A third apprentice, the Detective Apprentice suit (`hero_detective`), is a reward from the Murder at SQLeviathan Mansion opening (below) and shows as a silhouette until it is earned.

Public-domain status here refers to the US. Notes for anyone reusing the art:

- **Winnie the Pooh**: A. A. Milne's 1926 text is public domain in the US; Milne's text enters the UK public domain in 2027 and E. H. Shepard's illustrations in 2047. This sprite is an original drawing, not a copy of Shepard's art.
- **Zorro**: the 1919 story is public domain in the US, but the character's trademarks are actively enforced. Do not publish or sell Zorro commercially.
- **Peter Pan** has special UK protection and is deliberately not included.

## Roadmap

- Accounts and cloud saves

## Sound

All audio is synthesised in the browser with the Web Audio API, so there are no audio files. `js/audio/sound.js` is the engine and sound effects (typing ticks, typo thud, a cast chime per language, hits, coins, footsteps, doors, thunder, cutscene effects, ambience). `js/audio/music.js` is a small step sequencer: each theme is a chord progression plus a seeded melody, and a director picks the theme from what is on screen (opening story, title, cutscenes, village districts, level select, battles per language, bosses, the Pythona finale, the Challenge Tower, unlockables, the library and the Forge). The Sound button (or the M key) turns all sound off and on, and the choice is saved in the save file. Browsers only allow audio after a first click or key press, so music starts then.

## The village

Four villagers (Rosa the baker, Ned the night watchman, Pip the courier and Mimi the kid) hand out 12 one-off typing missions for coins. A yellow ! floats over anyone with a job ready. Missions copy, fix or recall code in their district's language, pay 15/30/45 coins once each (half if you peek at the answer), and open as you clear levels. Data is in `js/data/missions.js`.

Play opens a walkable pixel-art village. Walk with the arrow keys or WASD (hold Shift to run), press E to talk or go in, or tap anywhere (every place is also a button under the scene and fast-travels you there). The town square is a large scrolling plaza holding the Spellbook Library (Librarian Quill), the Forge (a free workshop run by Brynn the Smith, lit once you clear HTML level 3), the Unlockables shop and the Challenge Tower. The level maps no longer have doorways between languages: travel between zones is through the village. A road leaves each side of the square: south to the HTML Markup Quarter, west into the C++ Dark Forest, east to the JavaScript Keep and north up to the Python Castle Roof. Each district has its own scenery, its mentor and its language gate at the far end. Roads to languages you have not unlocked are barred, and walking up to one makes that mentor tell you which boss to beat. The sky is painted from how many guardians you have beaten: storm night, dusk, twilight, dawn, and a full sunrise with birds and confetti once Pythona has fallen. Code: `js/ui/village-paint.js` (buildings), `js/ui/village-scenes.js` (the five scenes) and `js/ui/village.js` (walking, people, doors).

## The Forge

The Forge is a free workshop for writing your own code with no goals or marks. HTML shows a live page as you type (in a frame with scripts switched off). CSS styles a small sample page live as you type. JavaScript runs in a Web Worker with a 3 second limit, so an endless loop cannot freeze the game. Python and C++ run on two small interpreters written for the game (`js/forge/py-run.js`, `js/forge/cpp-run.js`) that cover everything the levels teach (variables, maths, strings, if, loops, functions, lists and vectors, references and pointers, structs and classes) and print friendly messages with line numbers, including for things they cannot run yet (for example `cin`). Each language tab opens as you unlock that language (an admin save opens all of them). Projects are saved automatically in the save file (up to 12), can be renamed, deleted and downloaded, and each language has starter examples. Code: `js/forge/forge.js`.

## Accounts and curriculum

The game opens on a sign up / log in screen (`js/ui/auth.js`, `css/auth.css`) before the opening story. Accounts are stored only in the browser (`js/engine/accounts.js`): a salted PBKDF2 password hash per user and one save slot per account (`codetopia.save.v1.<name>`). There is no server, so an account does not follow the player to another device. "Continue as guest" uses the original single save slot, and the first account made on a browser adopts that older save.

After signing up the player ticks the languages they want, or picks Story mode. Story mode keeps the original order (HTML, CSS, C++, JavaScript, Python). A ticked list opens only those languages, and once every ticked language is cleared the rest open too. `trackOpen()` and `guildOpen()` in `js/engine/save.js` decide this for the village, missions, Forge, Guild and Challenge Tower. The curriculum can be changed from the title screen at any time without losing progress. Tests log in with "Continue as guest" (`#aGuest`).


## Walking animation
`js/game/walk.js` gives every skin a four-direction walk cycle built from its existing art: front art for walking down, the same art with the face painted over for walking up (a few skins list their face box in `FACE`), and the battle 3/4 art with a stride for left and right (mirrored for left). The step advances with distance walked, so running and click-to-walk both look right.

## Village ambience
`js/ui/village-ambient.js` adds the living details to the village, following how far the curse has lifted: rain and splashes in the storm, bats after dark, flocks of birds, sparrows that peck, hop and flee when you walk close, butterflies, drifting leaves and pollen by day, and chimney smoke that drifts with the wind (with sparks after dark). It is all drawn on the village canvas and switched off for reduced-motion users.

## Character animation
`js/ui/char-anim.js` animates the Owned tab and the Character info page from the walk frames in `walk.js`. Owned cards idle, glance left and right, walk through all four directions when hovered or focused, and hop when equipped. The Info page has a small stage with All moves, Idle, Walk, Turnaround, Cheer and the original 3D spin. Characters you do not own yet appear as a shadow. Reduced-motion users get still poses.

## Battle animation
`js/battle/battle-anim.js` adds the fight choreography: a charge-up and dash (walking frames) before attacks, hit sparks and squash on impact, a crouch-and-lunge foe strike with dust, ward brace, heal hop and sparkles, the foe bursting into pixels of its own palette (bigger for bosses), victory hops with confetti, a dizzy knock-out, and a walk-in / drop-in entrance when a fight starts. Everything is skipped for users who prefer reduced motion.

## Village people
`js/ui/village-npc.js` gives every villager a life: they wander a short way from their spot on walking frames (never into walls or you), turn to look at you, and hop to greet you when you walk up. A few have a job: the smith hammers and throws sparks, the mentors and librarian shed little motes of light, Rosa puffs flour, Mimi bounces. Everything stands still for users who prefer reduced motion.

## Victory and defeat screens
`js/battle/victory-anim.js` animates the level-complete and "code crashed" cards: the card bounces in, the title pops, the stars land one by one with a spark ring and a chime, the coin reward counts up, and the buttons slide in last. Your hero cheers on a little stage (grey and dizzy on defeat). Three-star wins rain confetti and boss wins add a golden glow, shimmering title and a bigger shower. Reduced-motion users get the final card straight away.

## Debuggers' Guild animation
`js/ui/guild-anim.js` brings the Guild to life. D-Bug bobs, twitches and talks while his message types out; he shakes his head at a wrong guess, nods at a right one, thinks when you ask for a hint and cheers when a case closes. A little D-Bug sits in each case file too. Real bugs (one per unsolved case) crawl over the cork board and scurry away from your cursor. When you tap the buggy line, the bug runs out of it and off the screen, and closing a case bursts stars over the stamp. Reduced motion keeps all of it still.

## Cinematic opening
`js/ui/story-cine.js` turns the opening story into a grander piece without changing the painted scenes: widescreen bars that open like curtains, a slow camera per scene (push-ins, pans, a pull-back that reveals the champions), god rays in the bright scenes, drifting dust and embers (green sparks once the curse spreads), lightning bloom with thunder and screen shake, film grain and a vignette, dips to black between scenes, a serif caption over a soft scrim, and a closing "Your quest begins" card. Clicking during the title card jumps to the story; Skip still leaves immediately. With reduced motion you get the bars and the new caption, with no movement.

## The Builders' Plot (code changes the village)
A new place in the village (the "Builders' Plot" button, or the left edge of the Square) where your own code builds things you can walk around. Write code at the studio desk (Plot Studio sheet) and watch the plot change live in the preview; press "Visit your plot" to see it in the village. Files: `js/plot/plot-data.js` (unlock tables, starter code, pixel font), `plot-run.js` (reads or runs each language), `plot-draw.js` (house, garden, fireworks, helper), `plot-studio.js` (the sheet and the village scene), `css/plot.css`.
- **HTML builds the house.** The `<h1>` is the sign (`<strong>`, `<em>`, `<mark>` style it), `<p>` a plaque, each `<li>` in a `<ul>` a window, `<ol>` items steps, `<a>` roof flags, `<div>` side rooms, plus `<img>`, `<header>`, `<footer>`, `<nav>`, `<button>`, `<form>` and `<table>`. The HTML is only parsed with `DOMParser`; it is never shown as a live page.
- **CSS paints it.** Style `.house .roof .wall .door .window .sign .chimney .flag .step .annex .path .garden`. The CSS is read by a hidden, sandboxed iframe (`sandbox="allow-same-origin"`, no scripts, `url()` and `@import` stripped), so real selectors and units work. Colours, gradients, borders, radius, size, opacity, box-shadow, transform and `display:none` are used.
- **JavaScript scripts a helper.** `say wait wave walk jump spin dance heart` in a Web Worker with a 2.5 s limit; the routine is played by Pip the Helper (talk to Pip to replay it).
- **Python grows a garden.** `plant("rose", col, row)` and `water(col, row)` on the Forge's Python interpreter (the commands are a short prelude; error line numbers are corrected for it).
- **C++ lights fireworks.** `launch("red", 4);` and `pause(500);` on the Forge's C++ interpreter, shown as a firework show over the plot.
- **Progression.** Every tag, command, plant and colour is unlocked by the matching concept in that language's campaign (a few basics are free); locked ones tell you what to learn. Admin mode unlocks everything. Nothing here changes win recording.
- **Saved on this device only** in `D.plot`. Reduced motion: the preview and village show still pictures (finished starbursts, no helper routine; talking to Pip describes the routine in words).

## The Skill Tree
A big tree now stands in the middle of the Village Square (where the fountain was), with a "Skill Tree" button in the village bar. `js/ui/skills.js` and `css/skills.css`. It opens a sheet with one tree per language (HTML, CSS, JavaScript, Python, C++): the concepts are grouped by the level that teaches them, and each node is locked (not learned), learned, golden (mastered, the Spellbook's box 5) or pulsing (review due). Tap a node to read its lesson, see its stars, see what it unlocks on the Builders' Plot, and open the Spellbook for that language. A spider chart at the top compares the languages. The 24 lights in the village tree's leaves light up as you learn and master concepts. It only reads the Spellbook's progress (no new save data). Reduced motion: nodes do not pulse.

## Boss test (skip ahead in a language)
Any language that is still closed can be opened by beating its level 10 boss once, whether the player picked specific languages or is following the full story order. Walk to the closed road in the Square (or press that language's button in the village bar), press E or tap, and choose "Take the boss test". Passing opens all 10 levels of that language and counts it as complete (the same as finishing level 10: later gates open, missions and the Skill Tree treat it as done), and pays the first boss bonus. Failing costs nothing: retry as often as you like, or leave and play the levels from level 1. Leaving without a pass puts the player back on their own language. The test win is recorded by its own rule in `foeDown` (`place`), so normal and admin-mode win recording (wins saved only for levels up to the unlocked level) is unchanged. Code: `vPlaceAsk`, `vPlaceStart`, `placeLeave` in `js/ui/village.js`; `trackOpen` in `js/engine/save.js`.

## Murder at SQLeviathan Mansion (opening)

A spooky murder-mystery section reached from the village. This first part is the opening; the SQL case itself follows.

- **The coachman.** A coachman waits by the road in the village square. He says nothing until two languages are cleared (admin mode skips the wait). After that he offers a ride up the hill to a new set of levels with a boss called Mr. SQLeviathan.
- **The ride.** Saying yes plays a short cutscene in which the apprentice is given the Detective Apprentice suit, then an animated pixel-art film (`js/ui/mansion-ride.js`): the camera follows the coach through the woods and past the gate, then watches it climb from behind until the crest drops away and the mansion rises on its hill. The film is skippable (click, Space or Escape) and is skipped under reduced motion. The pixel-art title card then fades in over the last frame, then arrival at the mansion grounds, where Inspector Tovar explains why the visit is not what it seemed.
- **The grounds.** A stormy-night scene with six people to talk to (Inspector Tovar, the Lady of Brown, Duchess King, Madame Thapa, Wain and the Duke of Aston, who drives the carriage and takes you back). The hall door opens when the case files arrive in the next phase. After the first visit "The Mansion" appears in the village travel buttons.
- **Code.** `js/ui/mansion.js` (offer, ride, title card, grounds, guest lines), `css/mansion.css` (title card), cinematic backdrops `road` and `manor` in `js/ui/backdrop.js`, art in `js/data/mystery-art.js`, progress in `D.mystery` (`gone`, `seen`). The manor is always a stormy night whatever the village sky is doing. Reduced motion removes the rain, bats and lightning from the title card.
