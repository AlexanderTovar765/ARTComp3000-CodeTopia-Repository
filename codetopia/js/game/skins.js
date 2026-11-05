/* Unlockable characters, their achievements and equipping them. */

"use strict";

/* ================= unlockable characters ================= */
const SKINS = [
  { id:"hero", n:"Apprentice", from:"Codetopia", price:0,
    bio:"The apprentice mage of Codetopia, who casts spells by typing real code. Everyone starts as the apprentice." },
  { id:"invisible_man", n:"The Invisible Man", from:"H. G. Wells, 1897", price:100,
    bio:"In H. G. Wells's novel, the scientist Griffin discovers how to make himself invisible, then finds he cannot undo it. To be seen at all he wraps himself in bandages, gloves and dark glasses." },
  { id:"sherlock_holmes", n:"Sherlock Holmes", from:"Arthur Conan Doyle", price:300,
    bio:"Arthur Conan Doyle's consulting detective of Baker Street, who solves cases by noticing small details others miss. He first appeared in A Study in Scarlet (1887)." },
  { id:"alice", n:"Alice", from:"Lewis Carroll, 1865", price:100,
    bio:"A curious girl who falls down a rabbit hole into Wonderland in Lewis Carroll's Alice's Adventures in Wonderland, where logic and language never behave as expected." },
  { id:"robin_hood", n:"Robin Hood", from:"English folklore", price:300,
    bio:"The outlaw archer of Sherwood Forest from English folk ballads, said to rob the rich to help the poor. He is famous for never missing his shot." },
  { id:"tin_woodman", n:"Tin Man", from:"L. Frank Baum, 1900", price:100,
    bio:"A woodcutter whose body was replaced piece by piece with tin, in L. Frank Baum's The Wonderful Wizard of Oz. He travels to ask the Wizard for a heart." },
  { id:"long_john_silver", n:"Long John Silver", from:"R. L. Stevenson, 1883", price:450,
    bio:"The charming one-legged pirate cook of Stevenson's Treasure Island, loyal only to himself. He is as clever as he is dangerous." },
  { id:"captain_nemo", n:"Captain Nemo", from:"Jules Verne, 1870", price:200,
    bio:"The brooding commander of the submarine Nautilus in Jules Verne's Twenty Thousand Leagues Under the Sea. He roams the oceans cut off from the world above." },
  { id:"mina_harker", n:"Mina Harker", from:"Bram Stoker, 1897", price:100,
    bio:"The resourceful schoolmistress of Bram Stoker's Dracula. She keeps the group's records in order and helps track the Count across Europe." },
  { id:"count_dracula", n:"Count Dracula", from:"Bram Stoker, 1897", price:300,
    bio:"The ancient vampire noble of Transylvania in Bram Stoker's Dracula, who travels to England in search of new victims." },
  { id:"the_creature", n:"The Creature", from:"Mary Shelley, 1818", price:300,
    bio:"The being assembled and brought to life by Victor Frankenstein in Mary Shelley's novel. He is thoughtful and articulate, and desperately lonely." },
  { id:"jekyll_and_hyde", n:"Jekyll and Hyde", from:"R. L. Stevenson, 1886", price:450,
    bio:"In Stevenson's novella, respected Dr. Jekyll drinks a potion that unleashes his darker self, Mr. Hyde, and gradually loses control of which one he is." },
  { id:"dr_moreau", n:"Doctor Moreau", from:"H. G. Wells, 1896", price:200,
    bio:"The exiled scientist of H. G. Wells's The Island of Doctor Moreau, who surgically reshapes animals into human-like creatures on a remote island." },
  { id:"winnie_the_pooh", n:"Winnie the Pooh", from:"A. A. Milne, 1926", price:100,
    bio:"A gentle bear of very little brain who loves honey, from A. A. Milne's 1926 stories set in the Hundred Acre Wood. Note: the 1926 original is public domain in the US only." },
  { id:"cheshire_cat", n:"The Cheshire Cat", from:"Lewis Carroll, 1865", price:100,
    bio:"The grinning cat of Carroll's Wonderland who can vanish until only his smile remains. He gives Alice puzzling advice." },
  { id:"wicked_witch", n:"The Wicked Witch of the West", from:"L. Frank Baum, 1900", price:200,
    bio:"The one-eyed ruler of the Winkie Country in Baum's Oz books, who sends wolves and crows against Dorothy and covets the Silver Shoes." },
  { id:"jo_march", n:"Jo March", from:"Louisa May Alcott, 1868", price:200,
    bio:"The headstrong, ink-stained writer of Louisa May Alcott's Little Women, who dreams of becoming an author and values her independence." },
  { id:"baba_yaga", n:"Baba Yaga", from:"Slavic folklore", price:600,
    bio:"The witch of Slavic folklore who lives in a hut that stands on chicken legs. She may help or devour travellers who come to her door." },
  { id:"zorro", n:"Zorro", from:"Johnston McCulley, 1919", price:300,
    bio:"The masked swordsman of Johnston McCulley's 1919 The Curse of Capistrano, who defends the poor of old California under the cover of a fop, Don Diego. (Zorro is also a trademark, so this is a student-project tribute.)" },
  { id:"cthulhu", n:"Cthulhu", from:"H. P. Lovecraft, 1928", price:600,
    bio:"The vast, tentacled being that sleeps beneath the sea in H. P. Lovecraft's 1928 story The Call of Cthulhu. Even a glimpse of it can unsettle the mind." },
  { id:"don_quixote", n:"Don Quixote", from:"Miguel de Cervantes, 1605", price:300,
    bio:"Alonso Quijano, a gentleman who reads so many tales of chivalry that he sets out as the knight Don Quixote. With his squire Sancho Panza he charges at windmills he mistakes for giants." },
  { id:"medusa", n:"Medusa", from:"Greek mythology", price:450,
    bio:"One of the three Gorgons of Greek myth, with living snakes for hair. Anyone who met her gaze turned to stone, until the hero Perseus defeated her by watching her only in the reflection of a mirrored shield." },
  { id:"headless_horseman", n:"The Headless Horseman", from:"Washington Irving, 1820", price:450,
    bio:"The ghostly rider of Washington Irving's The Legend of Sleepy Hollow, said to be a soldier who lost his head to a cannonball and now rides every night to look for it. Schoolmaster Ichabod Crane meets him on a lonely road." },
  { id:"jabberwock", n:"The Jabberwock", from:"Lewis Carroll, 1871", price:750,
    bio:"The monster of Lewis Carroll's nonsense poem Jabberwocky, from Through the Looking-Glass: jaws that bite, claws that catch, and eyes of flame. A boy slays it with his vorpal sword, and the poem ends in celebration." },
  { id:"ebenezer_scrooge", n:"Ebenezer Scrooge", from:"Charles Dickens, 1843", price:350,
    bio:"The cold-hearted money-lender of A Christmas Carol, visited on Christmas Eve by the ghost of his old partner Jacob Marley and three spirits. He wakes a changed man. Here he still wears his scowl, his snowy top hat and his lantern." },
  { id:"quasimodo", n:"Quasimodo", from:"Victor Hugo, 1831", price:400,
    bio:"The bell-ringer of Notre-Dame in Hugo's The Hunchback of Notre-Dame. Raised in the cathedral tower and made deaf by its great bells, he is gentle beneath his rough looks and fiercely loyal to those who show him kindness." },
  { id:"sun_wukong", n:"Sun Wukong", from:"Wu Cheng'en, 1592", price:700,
    bio:"The Monkey King of Journey to the West. Born from a stone, he masters 72 transformations, rides a somersault cloud 108,000 li in one leap, and wields a golden staff that can shrink to a needle. Cheeky, powerful and very hard to catch." },
  { id:"sinbad", n:"Sinbad the Sailor", from:"The Arabian Nights, medieval", price:450,
    bio:"The merchant-adventurer of the Arabian Nights who tells of seven voyages: giant birds, whirlpools, sea monsters and valleys of diamonds. Each time he comes home rich, and each time the sea calls him back." },
  { id:"beowulf", n:"Beowulf", from:"Anonymous Old English poem, c. 1000", price:500,
    bio:"The Geatish hero of the oldest great poem in English. He tears off the arm of the monster Grendel with his bare hands, then dies as an old king fighting a dragon. Here he carries the arm home." },
  { id:"carmilla", n:"Carmilla", from:"J. Sheridan Le Fanu, 1872", price:550,
    bio:"The vampire of Le Fanu's novella, written a quarter of a century before Dracula. Charming and pale, she befriends a lonely girl in a Styrian castle while something drains the countryside. Here she rises from her coffin." },
  { id:"captain_hook", n:"Captain Hook", from:"J. M. Barrie, 1904", price:450,
    bio:"The pirate captain of Peter Pan, feared on the Jolly Roger and haunted by the crocodile that took his hand and swallowed a ticking clock. Dashing, vain and dangerous, with a hook for a right hand." },
  { id:"phantom_of_the_opera", n:"The Phantom of the Opera", from:"Gaston Leroux, 1910", price:500,
    bio:"The masked genius who haunts the Paris Opera House in Leroux's novel. He lives in the cellars beneath the stage, plays the organ, and hides a ruined face behind a white mask while he guides the career of a young singer." },
  { id:"nosferatu", n:"Nosferatu", from:"Prana Film, 1922 (after Bram Stoker)", price:600,
    bio:"Count Orlok, the pale, rat-toothed vampire of the 1922 silent horror film Nosferatu. Bald, with pointed ears and long clawed fingers, he travels by ship to a new town carrying coffins of earth, and he cannot stand the light of the sun." }
];
/* collections shown in the Owned tab */
const COLLECTIONS = [
  { id:"starter", n:"Apprentice", ids:["hero"] },
  { id:"vampires", n:"Vampires", ids:["count_dracula","carmilla","mina_harker","nosferatu"] },
  { id:"adventurists", n:"Adventurists", ids:["sherlock_holmes","jo_march","alice","sun_wukong"] },
  { id:"strange_science", n:"Strange Science", ids:["the_creature","jekyll_and_hyde","dr_moreau","invisible_man"] },
  { id:"scallywags", n:"Scallywags", ids:["long_john_silver","captain_hook","captain_nemo","sinbad"] },
  { id:"heroics", n:"Heroics", ids:["robin_hood","zorro","don_quixote","beowulf"] },
  { id:"spookys", n:"Spookys", ids:["phantom_of_the_opera","quasimodo","headless_horseman","ebenezer_scrooge"] },
  { id:"monsters", n:"Monsters", ids:["medusa","jabberwock","cthulhu","baba_yaga"] },
  { id:"fairytales", n:"Fairytales", ids:["wicked_witch","cheshire_cat","tin_woodman","winnie_the_pooh"] }
];
/* every character belongs to a collection; anything left over lands in "More" */
function collectionList(){
  const used = new Set(COLLECTIONS.flatMap(c => c.ids)), rest = SKINS.filter(s => !used.has(s.id)).map(s => s.id);
  return COLLECTIONS.concat(rest.length ? [{ id:"more", n:"More", ids:rest }] : [])
    .map(c => ({ id:c.id, n:c.n, members:c.ids.map(id => SKINS.find(s => s.id === id)).filter(Boolean) })).filter(c => c.members.length);
}
const skinMeta = id => SKINS.find(s => s.id === id) || SKINS[0];
const skinDef = id => SKIN_ART[id] || SPRITES.hero;
const battleDef = id => SKIN_TURN[id] || SKIN_ART[id] || SPRITES.hero;
const isReal = s => s.id === "hero" || !!D.skins[s.id];
const isOpen = s => isReal(s) || !!D.admin;
const ownedN = () => SKINS.filter(isReal).length;
const lvUnlocked = () => D.admin ? NREAL : D.unlocked;
/* Coins: earned by clearing levels and by climbing the Challenge Tower, spent on characters. */
const COINS = { clear:25, bossClear:60, replay:5, towerFloor:5, towerTenth:10 };
function addCoins(n){ D.coins = (D.coins || 0) + n; persist(); stats(); if (typeof twCoins === "function") twCoins(); }
function buySkin(id){
  const s = skinMeta(id); if (isReal(s) || (D.coins || 0) < s.price) return false;
  D.coins -= s.price; D.skins[id] = true; persist(); stats(); return true;
}
let toastT = 0;
function toast(msg){ const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 5000); }
function setSkinPx(){
  const hp = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--px-hero")) || 8;
  document.documentElement.style.setProperty("--px-skin", Math.max(2, Math.round(hp * .45)) + "px");
}
function applyHeroSkin(){
  const id = (D.skin !== "hero" && (D.admin || D.skins[D.skin]) && SKIN_ART[D.skin]) ? D.skin : "hero"; D.skin = id;
  const m = skinMeta(id);
  $("#heroBody").innerHTML = spriteSVG(battleDef(id));
  const sv = $("#heroBody").firstElementChild; setSkinPx(); sv.classList.add("skin"); if (id === "cheshire_cat") sv.classList.add("float");
  $("#heroName").textContent = m.n; $("#hero").setAttribute("aria-label", "Your character, " + m.n);
}
addEventListener("resize", setSkinPx);
