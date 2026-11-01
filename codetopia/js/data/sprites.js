/* Pixel sprites for the hero, foes and bosses, as palette plus row strings. */

"use strict";

/* ================= pixel sprites ================= */
const SPRITES = {
  hero: { pal:{k:"#1a1330",t:"#2fb5a3",T:"#1d8085",g:"#f2b84b",s:"#f6cba3",e:"#1a1330",n:"#9a6a3a",o:"#ff7ab8"}, px:[
    "......kk......",".....kttk.....","....kttttk....","....kttTtk....","...kttttTtk...",".kkkkgggkkkk..",
    "....kssssk..oo","....ksssek..oo","....kssssk..n.",".....kkkk...n.","...kttttttk.n.","..kttTttTtk.n.",
    "..kttttttttkn.","..kTttttTtk.n.","...kttttttk.n.","...kkkkkkkk.n."]},
  slime: { pal:{k:"#12231f",l:"#7be08a",L:"#3fae5c",h:"#d6ffd9",w:"#ffffff",e:"#12231f"}, px:[
    "....kkkkkk....","..kkllllllkk..",".kllhhllllllk.",".klllllllllLk.","kllwwlllwwlLLk","kllewlllewlLLk",
    "kllllkkkklllLk","kLLllllllllLLk",".kLLLLLLLLLLk.","..kkkkkkkkkk.."]},
  bat: { pal:{k:"#1c1233",b:"#8e63e8",B:"#5a3aa8",y:"#ffd23f",w:"#ffffff"}, px:[
    "....k....k....","....kbbbbk....","....kybbyk....","kk..kbwwbk..kk","kBk.kbbbbk.kBk","kBBkkbbbbkkBBk",
    "kBBBkkbbkkBBBk",".kBkBkkkkBkBk.","..k.k....k.k.."]},
  ghost: { pal:{k:"#1b1640",w:"#eaf1ff",G:"#a8b9ea",e:"#1b1640",m:"#5b3b8c"}, px:[
    "...kkkkkk...","..kwwwwwwk..",".kwwwwwwwwk.",".kweewweewk.",".kweewweewk.",".kwwwwwwwwk.",
    ".kwwwmmwwwk.",".kwwwmmwwwk.",".kwwwwwwwwk.",".kGwwwwwwGk.",".kGGwwwwGGk.",".kGGGGGGGGk.",".kk.kGGk.kk."]},
  golem: { pal:{k:"#2a1f4d",w:"#f4f1ff",g:"#b9b2e0",e:"#ff4d6d"}, px:[
    "..kkkkkkkkkk..","..kwwwwwwwwk..","..kwwwwwwwwk..","..kweewweewk..","..kwwwwwwwwk..","..kwwkkkkwwk..",
    "..kwwwwwwwwk..","..kwggggggwk..","..kwwwwwwwwk..","..kwggggggwk..","..kwwwwwwwwk..","..kwggggwwwk..",
    "..kwwwwwwwwk..","..kkkkkkkkkk..","...kk....kk..."]},
  titan: { pal:{k:"#24103a",r:"#ff6b81",R:"#b83a55",y:"#ffc857",w:"#ffffff"}, px:["..kk........kk..",".kyyk......kyyk.",".kyykkkkkkkkyyk.","..kkkrrrrrrkkk..","...krwrrrrwrk...","...krrrrrrrrk...","...krrkkkkrrk...",".kkkkrrrrrrkkkk.","kyykrrrrrrrrkyyk","kyykrryrryrrkyyk","kyykryrrrryrkyyk","kyykrryrryrrkyyk",".kkkrrrrrrrrkkk.","....kRRkkRRk....","...kRRRkkRRRk...","...kkkkkkkkkk..."] },
  wraith: { pal:{k:"#0e1a3a",b:"#4f8cff",B:"#2a56b8",w:"#e6f0ff"}, px:[".......kk.......","......kwwk......",".....kwwwwk.....","....kkkwwkkk....","......kwwk......","....kkbbbbkk....","...kbbbbbbbbk...","..kbbkkkkkkbbk..","..kbkkwkkwkkbk..","..kbkkkkkkkkbk..","..kbbkkwwkkbbk..","..kbbbkkkkbbbk..",".kbbBbbbbbbBbbk.",".kbbBbbBBbbBbbk.",".kbbbbbBBbbbbbk.",".kbBbbbbbbbbBbk.",".kbk.kbbbbk.kbk.",".k...k.kk.k...k."] },
  hydra: { pal:{k:"#2a2200",y:"#ffd23f",Y:"#c99a10",w:"#ffffff",r:"#ff4d6d"}, px:[".kkk...kkk...kkk.","kyyyk.kyyyk.kyyyk","kwkyk.kwkyk.kwkyk","kyyrk.kyyrk.kyyrk",".kyk...kyk...kyk.",".kyk...kyk...kyk.",".kyk...kyk...kyk.",".kyyk..kyk..kyyk.","..kyyyykykyyyyk..","kkyyyyyyyyyyyyykk","kyyyyyyyyyyyyyyyk","kyYyyyyyyyyyyyYyk","kyyyyyyyyyyyyyyyk",".kyyyyyyyyyyyyyk.",".kkyyykkkkkyyykk.","..kkk.......kkk.."] },
  pythona: { pal:{k:"#0c1840",b:"#3776ab",B:"#234e7a",y:"#ffd43b",e:"#ff3b5c",w:"#ffffff"}, px:["......y..y..y.......",".....kyyyyyyyyyk....","....kbbbbbbbbbbbk...","...kbbbbbbbbbbbbbk..","...kbbeebbbbbbeebk..","...kbBbbbbbbbbBbk...","...kbbbbbbbbbbbbbk..","....kbbbwbbbbbwbbk..",".....kbbwbbbbbwbk...","......kkbbbbbbbkk...",".......kbbyyybbk....",".......kbyyyyybk....","......kbbyyyyybbk...",".....kbbbyyyyybbbk..","....kbbbbbyyybbbbbk.",".kbBbbbyyyybbbbBbk..","kbBbbbyyyyyybbbbBbk.","kbBbbbbyyyyyybbbbBbk","kbBbbbyyyyyyyybbbBbk","kbBbbbyyyyyyyybbbBbk",".kbBbbbyyyyyybbbBbk.","...kbBbbyyyybbBbk...","...kkkkkkkkkkkkkk..."] },
  beetle: { pal:{k:"#2b0f2b",b:"#d94b6a",B:"#9a2c52",y:"#ffe066"}, px:[
    "...k........k...","....k......k....","....kkkkkkkk....","...kbbbbbbbbk...","..kbyybbbbyybk..","..kbyybbbbyybk..",
    "..kbbbbbbbbbbk..",".kbbBBbbbbBBbbk.",".kbbBBbbbbBBbbk.","..kbbbbbbbbbbk..","..kkkkkkkkkkkk..",".kk.k..kk..k.kk."]}
};
