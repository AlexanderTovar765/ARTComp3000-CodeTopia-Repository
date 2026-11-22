/* CSS track: levels, foes, the Overflow Ogre and Cascade the Chameleon. */

"use strict";

const CSS_LEVELS = [
  { n:"Rules and color", blurb:"Learn the shape of a CSS rule: a selector, braces and declarations. Attack spells are one short rule that styles the sample page, and Heavy attack spells use two rules.",
    foe:{ name:"Stray Brace Slime", spr:"slime", pal:{l:"#9be7a4",L:"#3fae5c",h:"#e0ffe4",k:"#12231f",e:"#12231f"}, hp:90, dmg:[7,9], moves:["Missing Semicolon","Unclosed Brace"], weak:"rule", k:1.15 } },
  { n:"Fonts and text", blurb:"Change how text looks: its size, typeface, weight and alignment. Heavy attack spells now use longer rules.",
    foe:{ name:"Comic Sans Bat", spr:"bat", pal:{b:"#ffd23f",B:"#c99a10"}, hp:110, dmg:[8,10], moves:["Font Fiasco","Wrong Unit"], weak:"fsize", k:1.25 } },
  { n:"Classes, ids and units", blurb:"Pick exactly the elements you want with classes and ids, and size things with units.",
    foe:{ name:"Selector Ghost", spr:"ghost", pal:{w:"#dff5d0",G:"#9ccf86"}, hp:120, dmg:[9,11], moves:["Wrong Selector","Typo In Property"], weak:"cls", k:1.1 } },
  { n:"The box model", blurb:"Every element is a box: content, padding, border and margin. Block is unlocked, and some blocks mean fixing broken CSS.",
    foe:{ name:"Padding Slime", spr:"slime", pal:{l:"#ffb26b",L:"#d6762a",h:"#ffe4c7",k:"#3a1c08",e:"#3a1c08"}, hp:130, dmg:[10,12], moves:["Padding Squeeze","Margin Mix-up"], weak:"pad", k:1.2 } },
  { n:"Boxes that behave", blurb:"Mini boss: the Overflow Ogre. Control box-sizing, overflow and display, and center a box. Spells now run over several lines: press Enter at the end of each line.",
    foe:{ name:"Overflow Ogre", spr:"ogre", hp:230, dmg:[12,15], moves:["Content Spill","Scrollbar Smash","Hidden Hit"], weak:"bsz", boss:true, k:1.2 } },
  { n:"Colors, shadows and hover", blurb:"Mix colors with hex and rgb, fade things, cast shadows and blend gradients. Make elements react when the mouse touches them.",
    foe:{ name:"Washed Out Bat", spr:"bat", pal:{b:"#ff9f5a",B:"#c46a2c"}, hp:140, dmg:[11,13], moves:["Low Contrast","Faded Text"], weak:"hex", k:1.25 } },
  { n:"Flexbox", blurb:"Flexbox lays children out along a line. Item is unlocked: items heal you, and some have extra effects.",
    foe:{ name:"Squished Ghost", spr:"ghost", pal:{w:"#cfeaff",G:"#7fb4e6"}, hp:150, dmg:[12,14], moves:["Squashed Items","Row Overflow"], weak:"flex", k:1.1 } },
  { n:"Grid", blurb:"Grid gives you rows and columns to place things in.",
    foe:{ name:"Collapsed Track Slime", spr:"slime", pal:{l:"#c2a3ff",L:"#7a52d6",h:"#efe6ff",k:"#1d1038",e:"#1d1038"}, hp:160, dmg:[13,15], moves:["Collapsed Column","Gap Trouble"], weak:"gtc", k:1.2 } },
  { n:"Position and motion", blurb:"Place elements exactly, stack them in layers, and animate changes with transitions and transforms.",
    foe:{ name:"Z-Index Bat", spr:"bat", pal:{b:"#ff6b81",B:"#b83a55"}, hp:170, dmg:[14,16], moves:["Hidden Behind","Stacking Mess"], weak:"zi", k:1.25 } },
  { n:"The cascade", blurb:"Section boss: Cascade the Chameleon, champion of CSS. Specificity, !important, variables and media queries decide who wins. Spells from every level can come back.",
    foe:{ name:"Cascade the Chameleon", spr:"chameleon", hp:320, dmg:[15,19], moves:["Color Clash","Important Override","Specificity Strike","Z-Index Slam"], weak:"spec", boss:true, k:1.2 } }
];
