/* FAIRY VILLAGE core: everything the fairies share. Loaded first, then one file per fairy
   (fairies/*.js, in FAIRY_ORDER order), then index.html calls startGame().
   Here: shared gradients, explorer options and helpers, your fairy and toadstool, flowers, saves,
   Read to me, sounds (including the bell, drum, clap, shaker and heartbeat sounds the puzzles use),
   screens and pop-ups, Who's playing, the fairy maker, the village and its layout, the worlds map,
   a fairy's flower, the puzzle runner and results, the shared puzzle types and helpers,
   the "fairy is found" scene and startGame(). */
'use strict';
/* ---------------- art: shared gradients ---------------- */
var DEFS = '<defs>' +
'<radialGradient id="ground" cx=".45" cy=".35" r=".7"><stop offset="0" stop-color="#B9E49C"/><stop offset="1" stop-color="#84BD66"/></radialGradient>' +
'<filter id="fblur" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="4"/></filter>' +
'<filter id="fsoft" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="2"/></filter>' +
'<filter id="fshadow" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="5"/></filter>' +
'<radialGradient id="gglass" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#E4F5FD"/><stop offset="1" stop-color="#86C3E6"/></radialGradient>' +
'<radialGradient id="gspot" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E2DACE"/></radialGradient>' +
'<linearGradient id="gwood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A26D4B"/><stop offset="1" stop-color="#6A3F26"/></linearGradient>' +
'<radialGradient id="ggold" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FFF1A8"/><stop offset=".5" stop-color="#F5C842"/><stop offset="1" stop-color="#C9961E"/></radialGradient>' +
'<linearGradient id="gdoorgold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FBE38A"/><stop offset="1" stop-color="#D9A52E"/></linearGradient>' +
'<radialGradient id="tdcap" cx=".35" cy=".25" r=".85"><stop offset="0" stop-color="#FF8F7A"/><stop offset=".45" stop-color="#E2463C"/><stop offset="1" stop-color="#9C241C"/></radialGradient>' +
'<linearGradient id="tdstem" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFCF4"/><stop offset=".45" stop-color="#F3E1C2"/><stop offset="1" stop-color="#BE9C6C"/></linearGradient>' +
'<linearGradient id="ptleaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8FD67A"/><stop offset="1" stop-color="#3F8A3A"/></linearGradient>' +
'<linearGradient id="ptback" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E37BA3"/><stop offset="1" stop-color="#A93C6A"/></linearGradient>' +
'<linearGradient id="ptleft" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFC9DC"/><stop offset="1" stop-color="#E06A98"/></linearGradient>' +
'<linearGradient id="ptright" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E5709D"/><stop offset="1" stop-color="#A93C6A"/></linearGradient>' +
'<linearGradient id="potclay" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E58A5C"/><stop offset=".45" stop-color="#D2704A"/><stop offset="1" stop-color="#A65233"/></linearGradient>' +
'<radialGradient id="ptfront" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#FFD6E5"/><stop offset=".5" stop-color="#F28CB3"/><stop offset="1" stop-color="#C24C7E"/></radialGradient>' +
'<radialGradient id="skinA" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#FFF1E6"/><stop offset=".7" stop-color="#FBDCC6"/><stop offset="1" stop-color="#E8BDA0"/></radialGradient>' +
'<radialGradient id="skinB" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#FFE9DA"/><stop offset=".7" stop-color="#F5CDB0"/><stop offset="1" stop-color="#DFA885"/></radialGradient>' +
'<radialGradient id="skinC" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#EDC0A0"/><stop offset=".7" stop-color="#D9A27C"/><stop offset="1" stop-color="#B88360"/></radialGradient>' +
'<radialGradient id="skinD" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#D9A27C"/><stop offset=".7" stop-color="#B57650"/><stop offset="1" stop-color="#8E5636"/></radialGradient>' +
'<radialGradient id="skinE" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#B07A58"/><stop offset=".7" stop-color="#8E5636"/><stop offset="1" stop-color="#6A3E24"/></radialGradient>' +
'<radialGradient id="skinF" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#7E553C"/><stop offset=".7" stop-color="#5E3A26"/><stop offset="1" stop-color="#3E2416"/></radialGradient>' +
'<linearGradient id="hairChestnut" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A9714A"/><stop offset="1" stop-color="#5E3520"/></linearGradient>' +
'<linearGradient id="hairBlack" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4A3A34"/><stop offset="1" stop-color="#141010"/></linearGradient>' +
'<linearGradient id="hairBlonde" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FCE6A4"/><stop offset="1" stop-color="#C99A3E"/></linearGradient>' +
'<linearGradient id="hairRed" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E8844E"/><stop offset="1" stop-color="#9A3A18"/></linearGradient>' +
'<linearGradient id="hairPink" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFC2DA"/><stop offset="1" stop-color="#D45E96"/></linearGradient>' +
'<linearGradient id="hairLilac" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D6C8F7"/><stop offset="1" stop-color="#7A62C8"/></linearGradient>' +
'<radialGradient id="hairDark" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#5A3D2E"/><stop offset="1" stop-color="#21140E"/></radialGradient>' +
'<radialGradient id="dressLilac" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#E4DDFC"/><stop offset=".55" stop-color="#A897EC"/><stop offset="1" stop-color="#6C5BC4"/></radialGradient>' +
'<radialGradient id="dressSky" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#DDF1FC"/><stop offset=".55" stop-color="#6FB3DE"/><stop offset="1" stop-color="#3E7FB0"/></radialGradient>' +
'<radialGradient id="dressMint" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#E0F8EF"/><stop offset=".55" stop-color="#7FD3B5"/><stop offset="1" stop-color="#3E9E7E"/></radialGradient>' +
'<radialGradient id="dressSun" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#FFF5D4"/><stop offset=".55" stop-color="#F8CF5A"/><stop offset="1" stop-color="#D99A26"/></radialGradient>' +
'<radialGradient id="dressRose" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#FFE6EF"/><stop offset=".55" stop-color="#F28CB3"/><stop offset="1" stop-color="#C24C7E"/></radialGradient>' +
'<radialGradient id="dressBerry" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#F7B9CA"/><stop offset=".55" stop-color="#C2416A"/><stop offset="1" stop-color="#7E1F42"/></radialGradient>' +
'<linearGradient id="leggings" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7C6CA4"/><stop offset="1" stop-color="#3E3260"/></linearGradient>' +
'<linearGradient id="leafLegs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8FD67A"/><stop offset="1" stop-color="#3F8A3A"/></linearGradient>' +
'<radialGradient id="bootRed" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FF8F7A"/><stop offset=".5" stop-color="#E2463C"/><stop offset="1" stop-color="#9C241C"/></radialGradient>' +
'<radialGradient id="slipperPink" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FFD6E5"/><stop offset="1" stop-color="#C24C7E"/></radialGradient>' +
'<linearGradient id="canBlue" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D3EEFA"/><stop offset="1" stop-color="#4E86B0"/></linearGradient>' +
'<radialGradient id="wingLilac" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".6" stop-color="#C9B8F5" stop-opacity=".7"/><stop offset="1" stop-color="#8E78DE" stop-opacity=".9"/></radialGradient>' +
'<radialGradient id="wingSky" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".6" stop-color="#A9D8F5" stop-opacity=".7"/><stop offset="1" stop-color="#4E9FCB" stop-opacity=".9"/></radialGradient>' +
'<radialGradient id="wingMint" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".6" stop-color="#B5EBD9" stop-opacity=".7"/><stop offset="1" stop-color="#4AB394" stop-opacity=".9"/></radialGradient>' +
'<radialGradient id="wingSun" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".6" stop-color="#FFE38A" stop-opacity=".75"/><stop offset="1" stop-color="#F0A23A" stop-opacity=".9"/></radialGradient>' +
'<radialGradient id="wingRose" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".6" stop-color="#FFC2D8" stop-opacity=".7"/><stop offset="1" stop-color="#E06A98" stop-opacity=".9"/></radialGradient>' +
'<radialGradient id="wingSilver" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".6" stop-color="#E1E6EC" stop-opacity=".75"/><stop offset="1" stop-color="#9AA4B2" stop-opacity=".9"/></radialGradient>' +
'<radialGradient id="wingPetal" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".55" stop-color="#FFD6E5" stop-opacity=".75"/><stop offset="1" stop-color="#F5B74A" stop-opacity=".85"/></radialGradient>' +
'<linearGradient id="vsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFE8F8"/><stop offset="1" stop-color="#EAF5FC"/></linearGradient>' +
'<linearGradient id="vmeadow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CDEBB0"/><stop offset="1" stop-color="#A6D688"/></linearGradient>' +
'<radialGradient id="vtree" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#A9DE8C"/><stop offset="1" stop-color="#4E9F45"/></radialGradient>' +
'<linearGradient id="signwood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D99C5E"/><stop offset="1" stop-color="#9A6234"/></linearGradient>' +
'<linearGradient id="terracotta" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E9926A"/><stop offset="1" stop-color="#A9533A"/></linearGradient>' +
'<radialGradient id="halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset=".65" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
'<linearGradient id="wickerA" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E8C38A"/><stop offset=".55" stop-color="#D3A363"/><stop offset="1" stop-color="#9E6B36"/></linearGradient>' +
'<linearGradient id="wickerB" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D6A867"/><stop offset=".55" stop-color="#BE8A4C"/><stop offset="1" stop-color="#875628"/></linearGradient>' +
'<linearGradient id="packetG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFF6DC"/><stop offset=".6" stop-color="#F7E2AE"/><stop offset="1" stop-color="#D9B672"/></linearGradient>' +
'<clipPath id="bkclip"><path d="M12 104 C14 150 34 182 62 186 H138 C166 182 186 150 188 104 A88 20 0 0 1 12 104 Z"/></clipPath>' +
'<linearGradient id="bkshade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#3B2410" stop-opacity=".32"/></linearGradient>' +
'<radialGradient id="soilG" cx=".45" cy=".35" r=".75"><stop offset="0" stop-color="#8A5C36"/><stop offset="1" stop-color="#4E3018"/></radialGradient>' +
'</defs>';
/* shared lists each fairy file fills: her FAIRIES entry, her place in FAIRY_ORDER, petal icons,
   pictures and gradients */
var FAIRIES={};
/* each fairy's mini-game (games/<name>.js adds GAMES[fairy id]); the shared helper is games/kit.js */
var GAMES={};
var FAIRY_ORDER=[];
var PZICON={};
var PICS={};
var PICS2={};
var DEFS_MORE='';
function addDefs(s){DEFS_MORE+=s;}
/* every gradient (shared and every fairy's), for pictures drawn as separate images such as the jigsaws */
function allDefs(){return DEFS+'<defs>'+DEFS_MORE+'</defs>';}
/* ---------------- options ---------------- */
var HAIR = [
  {id:'chestnut',label:'Chestnut',css:'#8A5634',fill:'url(#hairChestnut)'},
  {id:'black',label:'Black',css:'#2A1E1A',fill:'url(#hairBlack)'},
  {id:'blonde',label:'Blonde',css:'#E8C36A',fill:'url(#hairBlonde)'},
  {id:'red',label:'Red',css:'#C2562A',fill:'url(#hairRed)'},
  {id:'pink',label:'Pink',css:'#F08CB8',fill:'url(#hairPink)'},
  {id:'lilac',label:'Lilac',css:'#A48BE0',fill:'url(#hairLilac)'}
];
var SKIN = [
  {id:'s1',label:'Skin tone 1, lightest',css:'#FBDCC6',fill:'url(#skinA)',flat:'#F3CBB0',neck:'#E6B494'},
  {id:'s2',label:'Skin tone 2',css:'#F5CDB0',fill:'url(#skinB)',flat:'#EDBB98',neck:'#D9A47F'},
  {id:'s3',label:'Skin tone 3',css:'#D9A27C',fill:'url(#skinC)',flat:'#CF9670',neck:'#BC8260'},
  {id:'s4',label:'Skin tone 4',css:'#B57650',fill:'url(#skinD)',flat:'#AD6E4A',neck:'#985C3C'},
  {id:'s5',label:'Skin tone 5',css:'#8E5636',fill:'url(#skinE)',flat:'#86502F',neck:'#714226'},
  {id:'s6',label:'Skin tone 6, deepest',css:'#5E3A26',fill:'url(#skinF)',flat:'#583522',neck:'#47291A'}
];
var DRESS = [
  {id:'lilac',label:'Lilac',css:'#A897EC',fill:'url(#dressLilac)'},
  {id:'sky',label:'Sky',css:'#6FB3DE',fill:'url(#dressSky)'},
  {id:'mint',label:'Mint',css:'#7FD3B5',fill:'url(#dressMint)'},
  {id:'sun',label:'Sunshine',css:'#F8CF5A',fill:'url(#dressSun)'},
  {id:'rose',label:'Rose',css:'#F28CB3',fill:'url(#dressRose)'},
  {id:'berry',label:'Berry',css:'#C2416A',fill:'url(#dressBerry)'}
];
var WING = [
  {id:'lilac',label:'Lilac',css:'#C9B8F5',fill:'url(#wingLilac)'},
  {id:'sky',label:'Sky',css:'#A9D8F5',fill:'url(#wingSky)'},
  {id:'mint',label:'Mint',css:'#B5EBD9',fill:'url(#wingMint)'},
  {id:'sun',label:'Sunshine',css:'#FFE38A',fill:'url(#wingSun)'},
  {id:'rose',label:'Rose',css:'#FFC2D8',fill:'url(#wingRose)'},
  {id:'silver',label:'Silver',css:'#E1E6EC',fill:'url(#wingSilver)'}
];
var LEVELS = [
  {n:1,name:'Little Sprite',age:'Age 5',desc:'Pictures, counting to 10, first sounds'},
  {n:2,name:'Clever Pixie',age:'Age 7',desc:'Numbers to 100, reading short words'},
  {n:3,name:'Nimble Nymph',age:'Age 9',desc:'Times tables, spelling, harder puzzles'}
];
function find(list,id){for(var i=0;i<list.length;i++){if(list[i].id===id)return list[i];}return list[0];}
function levelOf(n){return LEVELS[(n||1)-1]||LEVELS[0];}
/* ---------------- tiny helpers ---------------- */
function $(s){return document.querySelector(s);}
function rnd(a,b){return a+Math.floor(Math.random()*(b-a+1));}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function aOrAn(w){return /^[aeiou]/i.test(String(w))?'an':'a';}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function f2(n){return Math.round(n*100)/100;}
/* ---------------- icons ---------------- */
var IC = {
  back:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  speak:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
  speakOff:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5"/></svg>',
  note:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2.6" fill="currentColor"/><circle cx="17" cy="16" r="2.6" fill="currentColor"/></svg>',
  noteOff:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2.6" fill="currentColor"/><circle cx="17" cy="16" r="2.6" fill="currentColor"/><path d="M3 3l18 18"/></svg>',
  lock:'<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  petal:'<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><ellipse cx="10" cy="10" rx="6" ry="9" fill="#E06A98"/></svg>',
  full:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>',
  fullOff:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5"/></svg>'
};
/* ---------------- art: houses ---------------- */
function toadstoolArt(){
  return '<ellipse cx="110" cy="178" rx="102" ry="20" fill="url(#ground)"/>' +
  '<ellipse cx="126" cy="181" rx="68" ry="11" fill="#2F4A2A" opacity=".32" filter="url(#fblur)"/>' +
  '<path d="M80 176 L86 104 L134 104 L140 176 A30 8 0 0 1 80 176 Z" fill="url(#tdstem)"/>' +
  '<ellipse cx="110" cy="116" rx="27" ry="8" fill="#7E5E36" opacity=".4" filter="url(#fsoft)"/>' +
  '<circle cx="110" cy="132" r="12.5" fill="#A8854F"/><circle cx="110" cy="132" r="9.5" fill="url(#gglass)"/>' +
  '<path d="M104 128 A7 7 0 0 1 110 124.5" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
  '<path d="M93 181 V162 A17 17 0 0 1 127 162 V181 A17 4 0 0 1 93 181 Z" fill="#4E2E1B"/>' +
  '<path d="M97 181 V163 A13 13 0 0 1 123 163 V181 A13 3 0 0 1 97 181 Z" fill="#FBD96A"/>' +
  '<g class="door"><path d="M97 181 V163 A13 13 0 0 1 123 163 V181 A13 3 0 0 1 97 181 Z" fill="url(#gwood)"/><circle cx="118" cy="171" r="2.4" fill="url(#ggold)"/></g>' +
  '<path d="M24 104 C24 54 62 24 110 24 C158 24 196 54 196 104 A86 16 0 0 1 24 104 Z" fill="url(#tdcap)"/>' +
  '<path d="M196 104 A86 16 0 0 1 24 104" stroke="#86201A" stroke-width="3" fill="none"/>' +
  '<ellipse cx="80" cy="48" rx="24" ry="10" transform="rotate(-28 80 48)" fill="#fff" opacity=".32" filter="url(#fsoft)"/>' +
  '<ellipse cx="70" cy="66" rx="12" ry="9" transform="rotate(-30 70 66)" fill="url(#gspot)"/>' +
  '<ellipse cx="112" cy="44" rx="10" ry="7" fill="url(#gspot)"/>' +
  '<ellipse cx="152" cy="70" rx="12" ry="8.5" transform="rotate(26 152 70)" fill="url(#gspot)"/>' +
  '<ellipse cx="106" cy="88" rx="8" ry="5.5" fill="url(#gspot)"/>' +
  '<ellipse cx="44" cy="94" rx="6" ry="3.5" transform="rotate(-40 44 94)" fill="url(#gspot)"/>' +
  '<ellipse cx="178" cy="96" rx="5" ry="3" transform="rotate(40 178 96)" fill="url(#gspot)"/>' +
  '<path d="M58 182 Q54 168 58 160 Q62 168 58 182 Z" fill="#5FA34D"/><path d="M64 183 Q62 172 67 166 Q67 175 64 183 Z" fill="#4E9140"/>' +
  '<path d="M160 184 Q156 170 160 162 Q164 170 160 184 Z" fill="#5FA34D"/><path d="M166 185 Q165 175 170 170 Q170 178 166 185 Z" fill="#4E9140"/>';
}
/* a house's lawn on its own, so village paths can run over the lawn up to the door */
function houseGround(){
  return '<ellipse cx="110" cy="178" rx="102" ry="20" fill="url(#ground)"/>' +
  '<ellipse cx="126" cy="181" rx="68" ry="11" fill="#2F4A2A" opacity=".32" filter="url(#fblur)"/>';
}
/* ---------------- art: fairies (drawn on a 240 x 320 box) ---------------- */
var STAR = 'M182 136 L184.5 142.6 L191.5 142.9 L186 147.3 L187.9 154.1 L182 150.2 L176.1 154.1 L178 147.3 L172.5 142.9 L179.5 142.6 Z';
function fairyArt(look, noShadow){
  var h=find(HAIR,look.hair), k=find(SKIN,look.skin), d=find(DRESS,look.dress), w=find(WING,look.wing);
  return (noShadow?'':'<ellipse cx="120" cy="308" rx="44" ry="7" fill="#6C5BC4" opacity=".25" filter="url(#fshadow)"/>') +
  '<g class="wings">' +
  '<path d="M112 150 C70 90 30 96 34 132 C38 166 84 172 112 160 Z" fill="'+w.fill+'" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '<path d="M112 166 C80 176 58 206 76 222 C94 236 112 200 116 174 Z" fill="'+w.fill+'" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '<path d="M128 150 C170 90 210 96 206 132 C202 166 156 172 128 160 Z" fill="'+w.fill+'" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '<path d="M128 166 C160 176 182 206 164 222 C146 236 128 200 124 174 Z" fill="'+w.fill+'" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '<path d="M112 152 C90 130 66 118 48 120 M112 156 C90 152 68 150 50 146 M114 172 C100 186 88 200 80 214 M128 152 C150 130 174 118 192 120 M128 156 C150 152 172 150 190 146 M126 172 C140 186 152 200 160 214" stroke="#fff" stroke-width="1" fill="none" opacity=".6"/>' +
  '</g>' +
  '<rect x="106" y="226" width="11" height="40" rx="5.5" fill="url(#leggings)"/><rect x="123" y="226" width="11" height="40" rx="5.5" fill="url(#leggings)"/>' +
  '<path d="M101 260 H118 V270 C118 276 112 279 104 279 C97 279 95 271 101 260 Z" fill="url(#bootRed)"/>' +
  '<path d="M122 260 H139 C145 271 143 279 136 279 C128 279 122 276 122 270 Z" fill="url(#bootRed)"/>' +
  '<circle cx="106" cy="268" r="2" fill="#fff"/><circle cx="112" cy="273" r="1.5" fill="#fff"/><circle cx="132" cy="268" r="2" fill="#fff"/><circle cx="137" cy="273" r="1.5" fill="#fff"/>' +
  '<path d="M104 152 C100 152 98 160 98 168 C92 188 84 214 82 234 C98 242 142 242 158 234 C156 214 148 188 142 168 C142 160 140 152 136 152 Z" fill="'+d.fill+'"/>' +
  '<path d="M82 234 Q92 240 102 236 Q112 242 122 236 Q132 242 142 236 Q150 240 158 234" stroke="#fff" stroke-width="2" fill="none" opacity=".5"/>' +
  '<ellipse cx="102" cy="204" rx="7" ry="24" fill="#fff" opacity=".22" filter="url(#fsoft)"/>' +
  '<path d="M99 174 Q120 182 141 174 L142 182 Q120 190 98 182 Z" fill="url(#ggold)"/>' +
  '<path d="M104 164 C94 176 90 188 88 198" stroke="'+k.flat+'" stroke-width="10" fill="none" stroke-linecap="round"/>' +
  '<circle cx="88" cy="200" r="6" fill="'+k.fill+'"/>' +
  '<g class="arm"><path d="M136 164 C148 170 156 176 160 184" stroke="'+k.flat+'" stroke-width="10" fill="none" stroke-linecap="round"/>' +
  '<path d="M162 188 L180 152" stroke="#B8861E" stroke-width="3" stroke-linecap="round"/>' +
  '<circle cx="161" cy="187" r="6" fill="'+k.fill+'"/>' +
  '<circle cx="182" cy="146" r="13" fill="#FBD96A" opacity=".5" filter="url(#fsoft)"/>' +
  '<path d="'+STAR+'" fill="url(#ggold)"/></g>' +
  '<rect x="114" y="138" width="12" height="16" rx="4" fill="'+k.neck+'"/>' +
  '<path d="M74 110 C70 62 98 52 120 52 C142 52 170 62 166 110 C168 140 160 152 150 150 L90 150 C80 152 72 140 74 110 Z" fill="'+h.fill+'"/>' +
  '<circle cx="120" cy="108" r="40" fill="'+k.fill+'"/>' +
  '<path d="M80 104 C78 70 100 58 120 58 C140 58 162 70 160 104 C154 92 144 88 136 94 C130 84 118 82 110 92 C102 86 88 90 80 104 Z" fill="'+h.fill+'"/>' +
  '<path d="M98 70 C108 64 124 63 136 68" stroke="#fff" stroke-width="4" opacity=".3" stroke-linecap="round" fill="none"/>' +
  '<path d="'+STAR+'" transform="translate(150 82) scale(.6) translate(-182 -146)" fill="url(#ggold)"/>' +
  '<path d="M99 102 Q105 98 111 101 M129 101 Q135 98 141 102" stroke="#3E2A20" stroke-width="2" fill="none" stroke-linecap="round"/>' +
  '<ellipse cx="106" cy="115" rx="5.5" ry="7" fill="#2A1E1A"/><ellipse cx="134" cy="115" rx="5.5" ry="7" fill="#2A1E1A"/>' +
  '<circle cx="108" cy="112" r="2" fill="#fff"/><circle cx="136" cy="112" r="2" fill="#fff"/>' +
  '<ellipse cx="95" cy="127" rx="7" ry="4.5" fill="#F28CB3" opacity=".4"/><ellipse cx="145" cy="127" rx="7" ry="4.5" fill="#F28CB3" opacity=".4"/>' +
  '<path d="M112 128 Q120 135 128 128" stroke="#7A3428" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
}
function faceSVG(look, label){
  return '<svg viewBox="66 46 108 108" '+(label?'role="img" aria-label="'+esc(label)+'"':'aria-hidden="true"')+'>'+fairyArt(look,true)+'</svg>';
}
/* ---------------- art: flowers and puzzle pictures ---------------- */
var FC = {
  pink:{fill:'#F28CB3',stroke:'#B8467A',name:'pink'},
  yellow:{fill:'#F8CF5A',stroke:'#B8861E',name:'yellow'},
  blue:{fill:'#7DBDE6',stroke:'#3E7FB0',name:'blue'},
  purple:{fill:'#B3A4F0',stroke:'#6C5BC4',name:'purple'},
  red:{fill:'#E8574C',stroke:'#9C241C',name:'red'},
  orange:{fill:'#F7A055',stroke:'#B8661E',name:'orange'}
};
var FCOL = ['pink','yellow','blue','purple','red','orange'];
function flowerG(cx,cy,r,col,n){
  var c=FC[col], s='', rx=r*Math.min(0.42,2.3/n), ry=r*0.5;
  for(var i=0;i<n;i++){
    var a=360/n*i;
    s+='<ellipse cx="'+cx+'" cy="'+f2(cy-r*0.52)+'" rx="'+f2(rx)+'" ry="'+f2(ry)+'" fill="'+c.fill+'" stroke="'+c.stroke+'" stroke-width="'+f2(r*0.06)+'" transform="rotate('+f2(a)+' '+cx+' '+cy+')"/>';
  }
  return s+'<circle cx="'+cx+'" cy="'+cy+'" r="'+f2(r*0.27)+'" fill="#F5C842" stroke="#B8861E" stroke-width="'+f2(r*0.05)+'"/>';
}
function flowerLabel(f){return FC[f.c].name+' flower with '+f.n+' petal'+(f.n===1?'':'s');}
function flowerSVG(f){return '<svg viewBox="0 0 100 100" role="img" aria-label="'+esc(flowerLabel(f))+'">'+flowerG(50,50,44,f.c,f.n)+'</svg>';}
/* ---------------- saves ---------------- */
var KEY='fairy-village-v1';
var mem={explorers:[],current:null,sound:true};
function load(){try{var t=localStorage.getItem(KEY);if(t){var d=JSON.parse(t);if(d&&Array.isArray(d.explorers)){mem=d;if(typeof mem.sound!=='boolean')mem.sound=true;}}}catch(e){}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(mem));}catch(e){}}
function cur(){for(var i=0;i<mem.explorers.length;i++){if(mem.explorers[i].id===mem.current)return mem.explorers[i];}return null;}
function petalsOf(ex,w){w=w||'petal';if(!ex.petals)ex.petals={};if(!ex.petals[w])ex.petals[w]=[false,false,false,false,false];return ex.petals[w];}
function petalCount(ex,w){return petalsOf(ex,w).filter(Boolean).length;}
function homeCount(ex){return FAIRY_ORDER.filter(function(id){return movedIn(ex,id);}).length;}
var curW='petal';
function movedIn(ex,f){return !!(ex.moved&&ex.moved[f]);}
/* Petal pots (phase 9). A fairy moves in with the five petals that brought her home in her pot (older saves
   get those five the first time her pot is looked at). After that her flower restarts grey: ex.replay[w]
   holds the pink petals, and picking a full flower puts all five in ex.pots[w]. One petal buys one go of her game.
   ex.best[w] is the explorer's best score in her game. */
function potOf(ex,w){if(!ex.pots)ex.pots={};if(ex.pots[w]==null){if(!movedIn(ex,w))return 0;ex.pots[w]=5;save();}return ex.pots[w];}
function replayOf(ex,w){if(!ex.replay)ex.replay={};if(!ex.replay[w])ex.replay[w]=[false,false,false,false,false];return ex.replay[w];}
function bestOf(ex,w){return (ex.best&&ex.best[w])||0;}
function petalWord(n){return n+' petal'+(n===1?'':'s');}
/* a little clay pot of petals with a number on it, drawn in a 0 0 64 64 box */
function potArt(n,big){
  var s='<ellipse cx="32" cy="59" rx="22" ry="4" fill="#2F4A2A" opacity=".2"/>';
  if(n>0){
    var heap=[[24,20,-25],[40,20,25],[32,16,0],[18,25,-50],[46,25,50]];
    heap.slice(0,Math.min(5,Math.max(1,Math.ceil(n/2)))).forEach(function(h){s+='<ellipse cx="'+h[0]+'" cy="'+h[1]+'" rx="6" ry="10" transform="rotate('+h[2]+' '+h[0]+' '+h[1]+')" fill="url(#ptfront)" stroke="#B8467A" stroke-width="1.5"/>';});
  }
  s+='<path d="M14 30 H50 L45 57 Q32 61 19 57 Z" fill="url(#potclay)" stroke="#8E4A2C" stroke-width="2"/>' +
    '<rect x="11" y="25" width="42" height="9" rx="4" fill="url(#potclay)" stroke="#8E4A2C" stroke-width="2"/>' +
    '<path d="M20 36 L23 53" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".3"/>';
  if(!big) s+='<circle cx="49" cy="47" r="12" fill="#fff" stroke="#B8467A" stroke-width="2.5"/><text x="49" y="52.5" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="'+(n>99?10:14)+'" font-weight="600" fill="#86304F">'+n+'</text>';
  return s;
}
/* ---------------- read to me ---------------- */
var voice=null;
function pickVoice(){try{var vs=window.speechSynthesis.getVoices();voice=vs.filter(function(v){return /en[-_]GB/i.test(v.lang);})[0]||vs.filter(function(v){return /^en/i.test(v.lang);})[0]||null;}catch(e){}}
if('speechSynthesis' in window){pickVoice();try{window.speechSynthesis.onvoiceschanged=pickVoice;}catch(e){}}
function stopTalk(){try{if('speechSynthesis' in window)window.speechSynthesis.cancel();}catch(e){}}
function speak(text,force){
  var ex=cur(); if(!force&&!(ex&&ex.read))return;
  if(!('speechSynthesis' in window))return;
  try{stopTalk();var u=new SpeechSynthesisUtterance(text);if(voice)u.voice=voice;u.lang=voice?voice.lang:'en-GB';u.rate=.92;u.pitch=1.1;window.speechSynthesis.speak(u);}catch(e){}
}
/* ---------------- sounds ---------------- */
var actx=null;
function ctx(){if(!actx){try{var C=window.AudioContext||window.webkitAudioContext;if(C)actx=new C();}catch(e){}}if(actx&&actx.state==='suspended'){try{actx.resume();}catch(e){}}return actx;}
function tone(f,t0,dur,type,vol){var c=ctx();if(!c)return;var o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.value=f;var t=c.currentTime+t0;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||.15,t+.02);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur+.05);}
function chime(){if(!mem.sound)return;[523.25,659.25,783.99,1046.5].forEach(function(f,i){tone(f,i*.09,.45,'sine',.16);});}
function softTone(){if(!mem.sound)return;tone(392,0,.35,'triangle',.1);tone(349.23,.18,.45,'triangle',.09);}
function tick(){if(!mem.sound)return;tone(880,0,.12,'sine',.08);}
function fanfare(){if(!mem.sound)return;[523.25,659.25,783.99,1046.5,1318.5,1567.98].forEach(function(f,i){tone(f,i*.12,.6,'sine',.14);});}
/* ---------------- screens ---------------- */
var SCREENS=['s-who','s-make','s-village','s-worlds','s-garden','s-puzzle','s-found','s-game'];
function show(id){stopTalk();SCREENS.forEach(function(s){document.getElementById(s).hidden=(s!==id);});var el=document.getElementById(id);el.scrollTop=0;}
var toastTimer=null;
function toast(msg){var t=$('#toast');t.textContent=msg;t.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(function(){t.hidden=true;},4200);}
/* overlay */
var ovClose=null;
function openOv(html,onReady){var o=$('#ov');$('#ov-card').innerHTML=html;o.hidden=false;if(onReady)onReady($('#ov-card'));var f=$('#ov-card').querySelector('button');if(f)f.focus();}
function closeOv(){$('#ov').hidden=true;$('#ov-card').innerHTML='';}
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!$('#ov').hidden&&ovClose){ovClose();}});
/* glow on focused houses, fairies and petals only when someone is using the keyboard */
document.addEventListener('keydown',function(e){if(e.key==='Tab')document.body.classList.add('kbd');});
document.addEventListener('pointerdown',function(){document.body.classList.remove('kbd');});
/* ---------------- picture cues for children who can't read yet ----------------
   Every word button gets a small picture in front of its words: a tick for Done and Check, a play arrow for
   Go and Start, a jigsaw piece for puzzles, a house for the village, a speaker for Read to me, and so on.
   It is done in one place: whenever buttons appear, any .btn without a picture is matched by its words
   against BTN_ICONS. Instruction cards can also be tapped to hear them again (see the puzzle screen). */
function bi(d,extra){return '<svg class="bi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+d+(extra||'')+'</svg>';}
var BI={
  tick:bi('<path d="M4 12.5l5 5L20 6.5"/>'),
  play:bi('<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>'),
  stop:bi('<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>'),
  undo:bi('<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>'),
  turn:bi('<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 3v5h-5"/>'),
  plus:bi('<path d="M12 5v14M5 12h14"/>'),
  minus:bi('<path d="M5 12h14"/>'),
  pourIn:bi('<path d="M6 10h12l-1.5 10h-9z"/><path d="M12 2v6M9.5 5.5L12 8l2.5-2.5"/>'),
  pourOut:bi('<path d="M6 10h12l-1.5 10h-9z"/><path d="M12 8V2M9.5 4.5L12 2l2.5 2.5"/>'),
  float:bi('<path d="M2 15c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0"/><circle cx="12" cy="9" r="3.5" fill="currentColor"/>'),
  sink:bi('<path d="M2 6c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0"/><circle cx="12" cy="17" r="3.5" fill="currentColor"/><path d="M4 21h16"/>'),
  stick:bi('<path d="M5 3v8a7 7 0 0 0 14 0V3h-4v8a3 3 0 0 1-6 0V3z"/><path d="M5 6.5h4M15 6.5h4"/>'),
  nostick:bi('<path d="M5 3v8a7 7 0 0 0 14 0V3h-4v8a3 3 0 0 1-6 0V3z"/><path d="M3 22L21 2" stroke-width="2.8"/>'),
  jigsaw:bi('<path d="M4 7h4a2 2 0 1 1 4 0h4v4a2 2 0 1 1 0 4v4h-4a2 2 0 1 0-4 0H4v-4a2 2 0 1 0 0-4z" fill="currentColor" fill-opacity=".25"/>'),
  house:bi('<path d="M3 11l9-7 9 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"/>'),
  back:bi('<path d="M15 5l-7 7 7 7"/>'),
  speak:bi('<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>'),
  wings:bi('<path d="M12 12C9 5 3 4 3 8.5S8 14 12 12zM12 12c3-7 9-8 9-3.5S16 14 12 12zM12 12c-2 3-5 6-7 5s2-4 7-5zM12 12c2 3 5 6 7 5s-2-4-7-5z" fill="currentColor" fill-opacity=".25"/>'),
  flower:bi('<circle cx="12" cy="8" r="2.4"/><path d="M12 5.6a2.6 2.6 0 1 1 2.3-1.2M14.3 9.2a2.6 2.6 0 1 1-.4 2.6M9.7 9.2a2.6 2.6 0 1 0 .4 2.6M9.7 4.4a2.6 2.6 0 1 0 2.3 1.2"/><path d="M12 10.5V22M12 17c-2-2-4-2-5.5-1.5M12 15c2-2 4-2 5.5-1.5"/>'),
  star:bi('<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" fill="currentColor" fill-opacity=".3"/>'),
  pencil:bi('<path d="M4 20l1-5L16 4l4 4L9 19z"/><path d="M13.5 6.5l4 4"/>'),
  people:bi('<circle cx="8" cy="8" r="3"/><circle cx="16.5" cy="9" r="2.5"/><path d="M2.5 20c.5-4 3-6 5.5-6s5 2 5.5 6M13.5 15.5c1-1.3 2-1.7 3-1.7 2 0 4 1.6 4.5 5"/>'),
  bin:bi('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
  heart:bi('<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z" fill="currentColor" fill-opacity=".25"/>'),
  fairy:bi('<circle cx="12" cy="7" r="3" fill="currentColor"/><path d="M12 10.5c-1.5 0-2.5 1-3 3l-1 6h8l-1-6c-.5-2-1.5-3-3-3z" fill="currentColor"/><path d="M11 12C8 8 3 8 3 11.5S8 15 11 13.5M13 12c3-4 8-4 8-.5S16 15 13 13.5" fill="currentColor" fill-opacity=".3"/>'),
  coin:bi('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9M9.5 10a2.5 2 0 0 1 5 0c0 2.5-5 1.5-5 4a2.5 2 0 0 0 5 0"/>')
};
/* checked in order; the first match wins */
var BTN_ICONS=[
  [/puzzles$/i,'jigsaw'],
  [/^(done|check|fit it in|check the gears|save my fairy)$/i,'tick'],
  [/^pay$/i,'coin'],
  [/^(go|start|keep playing|play again|play .*|turn on the water|turn the handle|roll the cart|test the bridge|test the circuit|let's go!)$/i,'play'],
  [/^stop/i,'stop'],
  [/^take (one|back)|^take one off/i,'undo'],
  [/^turn$/i,'turn'],
  [/^pour in/i,'pourIn'],[/^pour out/i,'pourOut'],
  [/^add /i,'plus'],
  [/will float/i,'float'],[/will sink/i,'sink'],
  [/won.t stick/i,'nostick'],[/will stick/i,'stick'],
  [/^read to me/i,'speak'],
  [/back to the village|^take .* home$/i,'house'],
  [/^back to /i,'back'],
  [/^fly to|^find a fairy/i,'fairy'],
  [/^pick the flower/i,'flower'],
  [/^see what happens/i,'star'],
  [/^change my fairy/i,'pencil'],
  [/^who.s playing/i,'people'],
  [/^remove/i,'bin'],
  [/^keep /i,'heart']
];
function iconButtons(root){
  (root||document).querySelectorAll('.btn').forEach(function(b){
    var first=b.firstElementChild;
    if(first&&first.tagName.toLowerCase()==='svg')return;              /* it already has a picture (Play the tune...) */
    var host=b.querySelector(':scope > span')||b;                       /* two-line buttons: the picture goes with the big words */
    if(host.querySelector(':scope > .bi'))return;
    var t=(host.textContent||'').trim(); if(!t)return;
    for(var i=0;i<BTN_ICONS.length;i++){if(BTN_ICONS[i][0].test(t)){host.insertAdjacentHTML('afterbegin',BI[BTN_ICONS[i][1]]);b.classList.add('hasbi');return;}}
  });
}
(function(){
  var pending=false;
  try{new MutationObserver(function(){if(pending)return;pending=true;(window.requestAnimationFrame||setTimeout)(function(){pending=false;iconButtons();});}).observe(document.body,{childList:true,subtree:true,characterData:true});}catch(e){}
})();
/* ---------------- who's playing ---------------- */
function renderWho(){
  $('#who-hero').innerHTML='<svg x="20" y="10" width="200" height="182" viewBox="0 0 220 200">'+toadstoolArt()+'</svg><g class="bob"><svg x="190" y="40" width="120" height="160" viewBox="0 0 240 320">'+fairyArt({hair:'chestnut',skin:'s2',dress:'lilac',wing:'lilac'})+'</svg></g>';
  var list=$('#who-list'); list.innerHTML='';
  mem.explorers.forEach(function(ex){
    var b=document.createElement('button'); b.className='who-card'; b.type='button';
    b.innerHTML=faceSVG(ex.look,ex.name+"'s fairy")+'<span class="who-name"></span><span class="who-level"></span>';
    b.querySelector('.who-name').textContent=ex.name;
    b.querySelector('.who-level').textContent=levelOf(ex.level).name;
    b.addEventListener('click',function(){ctx();mem.current=ex.id;save();enterVillage();});
    list.appendChild(b);
  });
  if(mem.explorers.length<8){
    var n=document.createElement('button'); n.className='who-card who-new'; n.type='button';
    n.innerHTML='<span class="plus" aria-hidden="true">+</span><span class="who-name">New explorer</span><span class="who-level">Make a fairy</span>';
    n.addEventListener('click',function(){ctx();openMaker(null);});
    list.appendChild(n);
  }
}
/* ---------------- fairy maker ---------------- */
var draft=null, editingId=null;
function openMaker(ex){
  editingId = ex?ex.id:null;
  draft = ex ? {name:ex.name,level:ex.level,look:Object.assign({},ex.look)} : {name:'',level:1,look:{hair:pick(HAIR).id,skin:pick(SKIN).id,dress:pick(DRESS).id,wing:pick(WING).id}};
  $('#make-title').textContent = ex?'Change your fairy':'Make your fairy';
  $('#make-go').textContent = ex?'Save my fairy':"Let's go!";
  $('#make-remove').hidden = !ex;
  $('#f-name').value = draft.name;
  $('#f-name-err').textContent='';
  renderMaker();
  show('s-make');
  speak(ex?'Change your fairy, then save.':'Make your fairy. Choose a name, a level, and your colours.');
}
function swatchRow(el,list,key,suffix){
  el.innerHTML='';
  list.forEach(function(o){
    var b=document.createElement('button'); b.type='button'; b.className='sw';
    b.style.background=o.css; b.setAttribute('aria-label',o.label+(suffix||''));
    b.setAttribute('aria-pressed',String(draft.look[key]===o.id));
    b.addEventListener('click',function(){draft.look[key]=o.id;tick();renderMaker();});
    el.appendChild(b);
  });
}
function renderMaker(){
  $('#make-fairy').innerHTML='<g class="bob">'+fairyArt(draft.look)+'</g>';
  var lv=$('#f-levels'); lv.innerHTML='';
  LEVELS.forEach(function(L){
    var b=document.createElement('button'); b.type='button'; b.className='lvl';
    b.setAttribute('aria-pressed',String(draft.level===L.n));
    b.innerHTML='<b></b><span></span><span></span>';
    b.children[0].textContent=L.name; b.children[1].textContent=L.age; b.children[2].textContent=L.desc;
    b.addEventListener('click',function(){draft.level=L.n;tick();renderMaker();});
    lv.appendChild(b);
  });
  swatchRow($('#f-hair'),HAIR,'hair',' hair');
  swatchRow($('#f-skin'),SKIN,'skin','');
  swatchRow($('#f-dress'),DRESS,'dress',' dress');
  swatchRow($('#f-wing'),WING,'wing',' wings');
}
$('#f-name').addEventListener('input',function(){draft.name=this.value;if(this.value.trim())$('#f-name-err').textContent='';});
$('#make-go').addEventListener('click',function(){
  var name=$('#f-name').value.trim();
  if(!name){$('#f-name-err').textContent='Type a name for your fairy.';$('#f-name').focus();return;}
  if(editingId){
    var ex=cur(); if(ex){ex.name=name;ex.level=draft.level;ex.look=Object.assign({},draft.look);}
  } else {
    var nex={id:'e'+Date.now().toString(36)+rnd(10,99),name:name,level:draft.level,look:Object.assign({},draft.look),read:draft.level===1,petals:{petal:[false,false,false,false,false]},moved:{}};
    mem.explorers.push(nex); mem.current=nex.id;
  }
  save(); chime(); enterVillage();
});
$('#make-back').addEventListener('click',function(){ if(editingId) enterVillage(); else {renderWho();show('s-who');} });
$('#make-remove').addEventListener('click',function(){
  var ex=cur(); if(!ex)return;
  ovClose=closeOv;
  openOv('<h3 id="ov-h">Remove '+esc(ex.name)+'?</h3><p>Their fairy, petals and village will be gone from this device.</p><div class="ov-actions"><button class="btn soft" id="rm-keep">Keep '+esc(ex.name)+'</button><button class="btn" id="rm-go">Remove</button></div>',function(c){
    c.querySelector('#rm-keep').addEventListener('click',closeOv);
    c.querySelector('#rm-go').addEventListener('click',function(){
      mem.explorers=mem.explorers.filter(function(e){return e.id!==ex.id;}); mem.current=null; save(); closeOv(); renderWho(); show('s-who');
    });
  });
});
/* ---------------- village ---------------- */
var LAYOUTS = {
  land:{w:900,h:820,toad:{x:450,y:565,s:1.18},me:[572,412,112,150],plaza:[450,592,132],sign:[75,584],
    fairies:{petal:[241,392,112,150],ripple:[197,586,112,150],breeze:[232,150,112,150],jingle:[543,134,112,150],ginger:[379,624,112,150],twinkle:[330,100,112,150],crumble:[808,360,112,150],rivet:[601,626,112,150],gizmo:[798,556,112,150]},
    paths:{petal:'M450 598 C350 612 172 602 165 537',ripple:'M392 614 C320 660 176 676 149 766',breeze:'M368 580 C336 512 318 380 182 286',jingle:'M532 580 C564 512 582 380 718 286',ginger:'M420 620 C404 676 366 724 345 784',twinkle:'M450 560 C450 470 452 360 450 258',crumble:'M450 598 C550 612 728 602 735 537',rivet:'M482 618 C500 676 540 724 560 784',gizmo:'M520 606 C620 640 740 680 766 766'},
    trees:[[42,236,1],[862,244,.9]],hills:'M0 205 C150 140 330 160 450 186 C600 150 760 140 900 196 V260 H0 Z',meadow:'M0 214 C250 192 520 226 900 208 V820 H0 Z',
    clouds:[[150,70],[640,52]],
    plots:[{id:'breeze',x:180,y:290,s:.78},{id:'twinkle',x:450,y:262,s:.78},{id:'jingle',x:720,y:290,s:.78},{id:'petal',x:165,y:540,s:.95},{id:'crumble',x:735,y:540,s:.95},{id:'ripple',x:140,y:772,s:.92},{id:'ginger',x:345,y:790,s:.92},{id:'rivet',x:560,y:790,s:.92},{id:'gizmo',x:765,y:772,s:.92}]},
  port:{w:600,h:900,toad:{x:300,y:560,s:1.05},me:[358,546,72,96],plaza:[300,590,112],sign:[300,672],
    fairies:{petal:[170,546,72,96],ripple:[173,628,72,96],breeze:[150,212,72,96],jingle:[368,204,72,96],ginger:[266,754,72,96],twinkle:[264,296,72,96],crumble:[408,510,72,96],rivet:[440,768,72,96],gizmo:[520,618,72,96]},
    paths:{petal:'M300 598 C228 612 102 594 95 523',ripple:'M246 614 C186 648 122 672 112 730',breeze:'M244 574 C206 500 196 380 107 296',jingle:'M356 574 C394 500 404 380 493 296',ginger:'M262 618 C240 700 202 790 190 874',twinkle:'M300 560 C300 470 302 380 300 276',crumble:'M300 598 C372 612 498 594 505 523',rivet:'M338 618 C362 700 398 790 410 874',gizmo:'M352 612 C420 640 480 680 495 730'},
    trees:[[34,252,.85],[566,258,.8]],hills:'M0 205 C100 150 220 165 300 186 C400 160 500 150 600 196 V260 H0 Z',meadow:'M0 214 C170 196 350 226 600 210 V900 H0 Z',
    clouds:[[110,70],[440,54]],
    plots:[{id:'breeze',x:105,y:300,s:.68},{id:'twinkle',x:300,y:280,s:.68},{id:'jingle',x:495,y:300,s:.68},{id:'petal',x:95,y:526,s:.8},{id:'crumble',x:505,y:526,s:.8},{id:'ripple',x:105,y:735,s:.74},{id:'gizmo',x:495,y:735,s:.74},{id:'ginger',x:190,y:880,s:.74},{id:'rivet',x:410,y:880,s:.74}]}
};
var vmode='land';
function nested(x,y,w,h,vb,inner,extra){return '<svg x="'+f2(x)+'" y="'+f2(y)+'" width="'+f2(w)+'" height="'+f2(h)+'" viewBox="'+vb+'" overflow="visible"'+(extra||'')+'>'+inner+'</svg>';}
function houseAt(p,inner){return nested(p.x-110*p.s,p.y-186*p.s,220*p.s,200*p.s,'0 0 220 200',inner);}
function villageBase(V){
  var s='<rect width="'+V.w+'" height="240" fill="url(#vsky)"/><g fill="#fff">';
  V.clouds.forEach(function(c){s+='<ellipse cx="'+c[0]+'" cy="'+c[1]+'" rx="46" ry="17"/><ellipse cx="'+(c[0]+34)+'" cy="'+(c[1]-12)+'" rx="28" ry="19"/><ellipse cx="'+(c[0]-28)+'" cy="'+(c[1]-6)+'" rx="22" ry="13"/>';});
  s+='</g><path d="'+V.hills+'" fill="#9FD283"/><path d="'+V.meadow+'" fill="url(#vmeadow)"/>';
  [[.1,.5,'#F07FA9'],[.29,.48,'#F5C842'],[.7,.5,'#fff'],[.91,.51,'#F07FA9'],[.33,.8,'#F5C842'],[.69,.8,'#fff'],[.51,.88,'#F07FA9'],[.95,.79,'#F5C842'],[.04,.85,'#fff'],[.62,.3,'#F07FA9'],[.37,.3,'#F5C842']].forEach(function(d){s+='<circle cx="'+f2(d[0]*V.w)+'" cy="'+f2(d[1]*V.h)+'" r="4" fill="'+d[2]+'"/>';});
  V.trees.forEach(function(t){s+=tree(t[0],t[1],t[2]);});
  var sx=V.sign[0], sy=V.sign[1];
  s+='<g><ellipse cx="'+(sx-3)+'" cy="'+(sy+68)+'" rx="28" ry="6" fill="#2F4A2A" opacity=".22" filter="url(#fsoft)"/><rect x="'+(sx-5)+'" y="'+(sy+20)+'" width="10" height="48" fill="url(#gwood)"/><rect x="'+(sx-61)+'" y="'+sy+'" width="122" height="40" rx="10" fill="url(#signwood)" stroke="#7A4E2A" stroke-width="3"/><text x="'+sx+'" y="'+(sy+27)+'" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="18" font-weight="600" fill="#FFF8E8">Fairy Village</text></g>';
  return s;
}
function tree(x,y,k){return '<g transform="translate('+x+' '+y+') scale('+k+')"><ellipse cx="10" cy="56" rx="26" ry="6" fill="#2F4A2A" opacity=".22" filter="url(#fsoft)"/><rect x="-5" y="20" width="10" height="34" fill="#8A5A30"/><circle cx="0" cy="8" r="30" fill="url(#vtree)"/><circle cx="-14" cy="20" r="18" fill="url(#vtree)"/></g>';}
function plotMarker(p){
  return '<g class="tap plot" data-plot="'+p.id+'" tabindex="0" role="button" aria-label="Empty plot waiting for a fairy">' +
  '<ellipse cx="'+p.x+'" cy="'+p.y+'" rx="'+f2(66*p.s)+'" ry="13" fill="#B5DD98" stroke="#8CC46E" stroke-width="3" stroke-dasharray="8 7"/>' +
  '<path d="M'+p.x+' '+(p.y-2)+' V'+(p.y-42)+'" stroke="#8A5A30" stroke-width="4"/>' +
  '<circle cx="'+p.x+'" cy="'+(p.y-52)+'" r="15" fill="url(#signwood)" stroke="#7A4E2A" stroke-width="2.5"/>' +
  '<text x="'+p.x+'" y="'+(p.y-45)+'" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="19" font-weight="600" fill="#FFF8E8">?</text></g>';
}
function pickMode(){var sc=$('#s-village .scene');if(!sc||!sc.clientHeight)return vmode;return (sc.clientWidth/sc.clientHeight<.85)?'port':'land';}
function renderVillage(moveIn){
  var ex=cur(); if(!ex)return;
  vmode=pickMode(); var V=LAYOUTS[vmode];
  var s=villageBase(V);
  V.plots.forEach(function(p){ if(!(FAIRIES[p.id]&&movedIn(ex,p.id))) s+=plotMarker(p); });
  /* Homes of fairies who have moved in. Paths are drawn in layers (all edges, then the plaza ring,
     then all path middles, then the plaza middle) so every path and the plaza read as one paved surface. */
  var homes=[];
  FAIRY_ORDER.forEach(function(id){
    if(!movedIn(ex,id))return;
    var F=FAIRIES[id], plot=V.plots.filter(function(p){return p.id===id;})[0];
    homes.push({id:id,plot:plot,path:V.paths[id],body:F.body(),label:F.houseLabel,F:F,grow:moveIn===id});
  });
  var dcls=function(h){return h.grow?'drawpath':'';}, gcls=function(h){return h.grow?'grow':'';}, P=V.plaza;
  homes.forEach(function(h){ s+='<g class="'+gcls(h)+'">'+houseAt(h.plot,houseGround())+'</g>'; });
  s+='<ellipse cx="'+(P[0]+4)+'" cy="'+(P[1]+6)+'" rx="'+(P[2]+2)+'" ry="34" fill="#C9AE7A" opacity=".45" filter="url(#fsoft)"/>';
  homes.forEach(function(h){ s+='<path d="'+h.path+'" stroke="#E6CC98" stroke-width="24" fill="none" stroke-linecap="round" pathLength="1" stroke-dasharray="1" class="'+dcls(h)+'"/>'; });
  s+='<ellipse cx="'+P[0]+'" cy="'+P[1]+'" rx="'+P[2]+'" ry="32" fill="#E6CC98"/>';
  homes.forEach(function(h){ s+='<path d="'+h.path+'" stroke="#F3E2BC" stroke-width="14" fill="none" stroke-linecap="round" pathLength="1" stroke-dasharray="1" class="'+dcls(h)+'"/>'; });
  s+='<ellipse cx="'+P[0]+'" cy="'+(P[1]-3)+'" rx="'+(P[2]-14)+'" ry="24" fill="#F3E2BC"/>';
  /* houses further down the screen are drawn over the ones behind them */
  var draw=homes.map(function(h){return {y:h.plot.y,html:'<g class="tap house" id="h-'+h.id+'" tabindex="0" role="button" aria-label="'+esc(h.label)+'"><g class="'+gcls(h)+'">'+houseAt(h.plot,h.body)+'</g></g>'};});
  /* each fairy's petal pot sits at the front corner of her house, on the side away from the plaza */
  homes.forEach(function(h){
    var p=h.plot, side=p.x<V.w/2?-1:1, k=(vmode==='port'?1.2:1)*Math.max(.85,p.s), n=potOf(ex,h.id);
    var px=Math.max(31*k,Math.min(V.w-31*k,p.x+side*(vmode==='port'?92:84)*p.s)), py=p.y+4;
    if(V.potAt&&V.potAt[h.id]){px=V.potAt[h.id][0];py=V.potAt[h.id][1];}   /* a pot moved so it isn't hidden behind its fairy */
    draw.push({y:py+.5,html:'<g class="tap pot'+(h.grow?' grow':'')+'" id="pot-'+h.id+'" tabindex="0" role="button" aria-label="'+esc(h.F.name+"'s petal pot, "+petalWord(n))+'">'+nested(px-30*k,py-58*k,60*k,60*k,'0 0 64 64',potArt(n))+'</g>'});
  });
  draw.push({y:V.toad.y,html:'<g class="tap house" id="h-toad" tabindex="0" role="button" aria-label="Your red toadstool house">'+houseAt(V.toad,'<g id="tfx-back"></g>'+toadstoolArt()+'<g id="tfx-front"></g>')+'</g>'});
  draw.sort(function(a,b){return a.y-b.y;}).forEach(function(d){s+=d.html;});
  var me=V.me;
  s+='<g class="tap" id="f-me" tabindex="0" role="button" aria-label="'+esc(ex.name)+', your fairy"><g class="bob">'+nested(me[0],me[1],me[2],me[3],'0 0 240 320',fairyArt(ex.look))+'</g></g>';
  homes.forEach(function(h){
    var pf=V.fairies[h.id];
    s+='<g class="tap" id="f-'+h.id+'" tabindex="0" role="button" aria-label="'+esc(h.F.name+' the '+h.F.kind+'. Tap to visit her.')+'"><g class="'+(h.grow?'flyin':'')+'"><g class="bob">'+nested(pf[0],pf[1],pf[2],pf[3],'0 0 240 320',h.F.art())+'</g></g></g>';
  });
  var v=$('#village');
  v.setAttribute('viewBox','0 0 '+V.w+' '+V.h);
  v.innerHTML='<clipPath id="vclip"><rect width="'+V.w+'" height="'+V.h+'" rx="30"/></clipPath><g clip-path="url(#vclip)">'+s+'</g>';
  /* a tap or click shouldn't leave the house or fairy focused (that is what drew a box round it) */
  v.addEventListener('mousedown',function(e){if(e.target.closest&&e.target.closest('.tap'))e.preventDefault();});
  function on(id,fn){var el=document.getElementById(id);if(!el)return;el.addEventListener('click',fn);el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();fn();}});}
  on('h-toad',toadSurprise);
  on('f-me',function(){var f=$('#f-me');f.classList.remove('waving');void f.getBoundingClientRect();f.classList.add('waving');chime();setTimeout(function(){f.classList.remove('waving');},2200);});
  homes.forEach(function(h){
    on('h-'+h.id,function(){
      var g=document.getElementById('h-'+h.id);g.classList.remove(h.F.tapClass);void g.getBoundingClientRect();g.classList.add(h.F.tapClass);if(h.F.onTap)h.F.onTap();else chime();
      setTimeout(function(){g.classList.remove(h.F.tapClass);},h.F.tapMs);
      /* let the house come alive for a moment, then offer her puzzles and her game */
      clearTimeout(menuT); menuT=setTimeout(function(){if(!$('#s-village').hidden&&$('#ov').hidden)openVisit(h.id,true);},1500);
    });
    on('f-'+h.id,function(){clearTimeout(menuT);openVisit(h.id);});
    on('pot-'+h.id,function(){clearTimeout(menuT);openVisit(h.id,true);});
  });
  v.querySelectorAll('.plot').forEach(function(pl){
    function hit(){toast('A fairy will live here one day. Tap Find a fairy to look for her.');speak('A fairy will live here one day. Tap Find a fairy to look for her.');}
    pl.addEventListener('click',hit);
    pl.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();hit();}});
  });
}
/* Tapping your toadstool brings a different surprise each time, in turn: a ladybird peeps out of the door,
   a bird flies round the cap, a fox peeks out from behind, a frog jumps out of the window, butterflies flutter up.
   Each is drawn in the toadstool's own 220 by 200 box, into #tfx-back (behind the house) or #tfx-front. */
var toadN=-1, toadT=null;
var TOAD_FX=[
  {say:'A ladybird lives by your door!',door:true,ms:2600,front:'<g class="tfx-lady"><ellipse cx="0" cy="0" rx="8" ry="6.5" fill="#E8443A" stroke="#7A1614" stroke-width="1.2"/><path d="M0 -6.5 V6.5" stroke="#2A1E1A" stroke-width="1.2"/><circle cx="-3.5" cy="-1" r="1.6" fill="#2A1E1A"/><circle cx="3.5" cy="2" r="1.6" fill="#2A1E1A"/><circle cx="-8" cy="0" r="4" fill="#2A1E1A"/><circle cx="-9.3" cy="-1.3" r="1" fill="#fff"/><path d="M-10 -3 L-14 -8 M-8 -3.5 L-10 -9" stroke="#2A1E1A" stroke-width="1" stroke-linecap="round"/></g>'},
  {say:'Tweet tweet! A bird is flying round your house.',ms:3000,front:'<g class="tfx-bird"><g class="tfx-birdin"><path d="M10 0 L20 -6 L19 4 Z" fill="#6E4626"/><ellipse cx="0" cy="0" rx="11" ry="8" fill="#A0704A"/><circle cx="-9" cy="-5" r="6" fill="#A0704A"/><path d="M-9 -1 C-10 5 -5 8 1 8 C-4 5 -6 2 -5 -2 Z" fill="#E8743A"/><path d="M-15 -5 L-20 -3 L-15 -2 Z" fill="#F5B83A"/><circle cx="-10" cy="-6" r="1.4" fill="#2A1E1A"/><path class="tfx-wing" d="M-2 -3 C2 -16 10 -16 12 -12 C8 -8 4 -4 -2 -3 Z" fill="#8A5A30"/></g></g>'},
  {say:'Peekaboo! A fox is hiding behind your toadstool.',ms:3000,back:'<g class="tfx-fox"><path d="M-16 -8 L-12 -26 L-3 -12 Z M16 -8 L12 -26 L3 -12 Z" fill="#E8743A" stroke="#9A4A1A" stroke-width="1.5" stroke-linejoin="round"/><path d="M-12 -12 L-11 -21 L-6 -13 Z M12 -12 L11 -21 L6 -13 Z" fill="#3B2A2A"/><path d="M-18 -10 C-18 -18 18 -18 18 -10 C18 0 8 12 0 14 C-8 12 -18 0 -18 -10 Z" fill="#F08A44" stroke="#9A4A1A" stroke-width="1.5"/><path d="M-17 -4 C-10 -2 -6 4 0 14 C-8 12 -16 4 -17 -4 Z M17 -4 C10 -2 6 4 0 14 C8 12 16 4 17 -4 Z" fill="#fff"/><circle cx="-6" cy="-6" r="2.2" fill="#2A1E1A"/><circle cx="6" cy="-6" r="2.2" fill="#2A1E1A"/><circle cx="-5.4" cy="-6.7" r=".7" fill="#fff"/><circle cx="6.6" cy="-6.7" r=".7" fill="#fff"/><ellipse cx="0" cy="11" rx="3" ry="2.2" fill="#2A1E1A"/></g>'},
  {say:'Ribbit! A frog jumped out of your window.',ms:2900,front:'<g class="tfx-shut"><circle cx="110" cy="132" r="10" fill="#4E2E1B"/><g class="tfx-shutter"><circle cx="110" cy="132" r="10" fill="url(#gwood)" stroke="#7A4E2A" stroke-width="1.2"/><path d="M101 132 H119" stroke="#7A4E2A" stroke-width="1.2"/></g></g><g class="tfx-frog"><g class="tfx-frogin"><ellipse cx="0" cy="2" rx="9" ry="7" fill="#6DBE5A" stroke="#357A31" stroke-width="1.3"/><circle cx="-4.5" cy="-5" r="3.6" fill="#6DBE5A" stroke="#357A31" stroke-width="1.2"/><circle cx="4.5" cy="-5" r="3.6" fill="#6DBE5A" stroke="#357A31" stroke-width="1.2"/><circle cx="-4.5" cy="-5.3" r="1.7" fill="#2A1E1A"/><circle cx="4.5" cy="-5.3" r="1.7" fill="#2A1E1A"/><path d="M-4 3 Q0 6 4 3" stroke="#2F6B2C" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M-9 7 l-4 3 M9 7 l4 3" stroke="#357A31" stroke-width="2.4" stroke-linecap="round"/></g></g>'},
  {say:'Look, butterflies in your garden!',ms:3000,front:[['#F28CB3',40,176,0],['#7DBDE6',172,178,.35],['#F8CF5A',64,180,.7]].map(function(b){return '<g class="tfx-fly" style="animation-delay:'+b[3]+'s;--fx:'+(b[1]<110?'-':'')+'30px" transform="translate('+b[1]+' '+b[2]+')"><g class="tfx-flyin"><g class="tfx-flap"><path d="M0 0 C-10 -12 -16 -4 -10 2 C-14 8 -6 10 0 2 C6 10 14 8 10 2 C16 -4 10 -12 0 0 Z" fill="'+b[0]+'" stroke="#3B2A4A" stroke-width="1"/></g><path d="M0 -4 V5" stroke="#3B2A4A" stroke-width="2" stroke-linecap="round"/></g></g>';}).join('')}
];
function toadSurprise(){
  var g=$('#h-toad'), f=$('#f-me'), bk=$('#tfx-back'), fr=$('#tfx-front'); if(!g||!bk)return;
  clearTimeout(toadT); g.classList.remove('open'); bk.innerHTML=''; fr.innerHTML=''; void g.getBoundingClientRect();
  toadN=(toadN+1)%TOAD_FX.length; var fx=TOAD_FX[toadN];
  if(fx.door)g.classList.add('open');
  bk.innerHTML=fx.back||''; fr.innerHTML=fx.front||'';
  f.classList.remove('waving'); void f.getBoundingClientRect(); f.classList.add('waving'); tick();
  toadT=setTimeout(function(){g.classList.remove('open');f.classList.remove('waving');bk.innerHTML='';fr.innerHTML='';},fx.ms);
  speak(fx.say);
}
var rzT=null, menuT=null;
window.addEventListener('resize',function(){clearTimeout(rzT);rzT=setTimeout(function(){if(!$('#s-village').hidden&&pickMode()!==vmode)renderVillage(false);},200);});
function renderBar(){
  var ex=cur(); if(!ex)return;
  $('#v-chip').innerHTML=faceSVG(ex.look,'')+'<span></span>';
  $('#v-chip').querySelector('span').textContent=ex.name;
  $('#v-chip').setAttribute('aria-label',ex.name+', '+levelOf(ex.level).name+'. Open the explorer menu');
  var r=$('#v-read'); r.setAttribute('aria-pressed',String(!!ex.read)); r.innerHTML=ex.read?IC.speak:IC.speakOff; r.setAttribute('aria-label','Read to me '+(ex.read?'on':'off'));
  /* Find a fairy shows a little picture of the player's own fairy */
  $('#v-fly').innerHTML='<svg class="bi flyfairy" viewBox="60 40 120 250" aria-hidden="true">'+fairyArt(ex.look,true)+'</svg><span>Find a fairy</span>';
  var sn=$('#v-sound'); sn.setAttribute('aria-pressed',String(!!mem.sound)); sn.innerHTML=mem.sound?IC.note:IC.noteOff; sn.setAttribute('aria-label','Sounds '+(mem.sound?'on':'off'));
}
function enterVillage(opts){
  var ex=cur(); if(!ex){renderWho();show('s-who');return;}
  renderBar(); show('s-village'); renderVillage(opts&&opts.moveIn);
  if(opts&&opts.moveIn){
    var nm=FAIRIES[opts.moveIn].name;
    fanfare();
    var gm=GAMES[opts.moveIn], msg=gm?nm+' has moved in, with five petals in her pot! Tap her house to play '+gm.name+'.':nm+' has moved in! Tap her house or tap '+nm+' to visit.';
    setTimeout(function(){toast(msg);speak(msg);},2600);
  } else {
    speak('Welcome home, '+ex.name+'. Tap Find a fairy to go and look for one.');
  }
}
$('#v-read').addEventListener('click',function(){var ex=cur();if(!ex)return;ex.read=!ex.read;save();renderBar();if(ex.read)speak('Read to me is on.',true);else stopTalk();});
$('#v-sound').addEventListener('click',function(){mem.sound=!mem.sound;save();renderBar();if(mem.sound)chime();});
$('#v-fly').addEventListener('click',function(){renderWorlds();show('s-worlds');speak('Which fairy shall we find? Tap a fairy.');});
$('#v-chip').addEventListener('click',function(){
  var ex=cur(); if(!ex)return;
  ovClose=closeOv;
  openOv('<svg class="art" viewBox="0 0 240 320" aria-hidden="true">'+fairyArt(ex.look)+'</svg><h3 id="ov-h"></h3><p></p><div class="ov-actions"><button class="btn" id="m-edit">Change my fairy</button><button class="btn soft" id="m-who">Who\'s playing?</button><button class="btn soft" id="m-close">Back to the village</button></div>',function(c){
    c.querySelector('h3').textContent=ex.name; var hc=homeCount(ex); c.querySelector('p').textContent=levelOf(ex.level).name+' · '+hc+' fair'+(hc===1?'y':'ies')+' in your village';
    c.querySelector('#m-edit').addEventListener('click',function(){closeOv();openMaker(ex);});
    c.querySelector('#m-who').addEventListener('click',function(){closeOv();renderWho();show('s-who');});
    c.querySelector('#m-close').addEventListener('click',closeOv);
  });
});
/* The house menu: tapping a fairy, her house or her petal pot. Tapping the fairy also tells a fact about her world. */
function openVisit(id,fromHouse){
  var ex=cur(), F=FAIRIES[id], G=GAMES[id], fact=pick(F.facts), n=potOf(ex,id);
  var gameNote = !G ? 'My game is coming soon' : (n>0 ? G.name+' · uses 1 petal' : 'My petal pot is empty');
  ovClose=closeOv;
  openOv('<svg class="art" viewBox="0 0 240 320" aria-hidden="true">'+F.art()+'</svg><h3 id="ov-h"></h3><p class="vis-fact"></p>' +
    '<div class="potline"><svg viewBox="0 0 64 64" aria-hidden="true">'+potArt(n,true)+'</svg><span></span></div>' +
    '<div class="ov-actions"><button class="btn twoline'+(G&&n>0?'':' empty')+'" id="vis-game"'+(G&&n>0?'':' aria-disabled="true"')+'><span>Play my game</span><small></small></button>' +
    '<button class="btn leaf" id="vis-play">Play my puzzles</button><button class="btn soft" id="vis-read">Read to me</button><button class="btn soft" id="vis-close">Back to the village</button></div>',function(c){
    c.querySelector('h3').textContent=fromHouse?F.name+"'s house":F.name+' says';
    var fp=c.querySelector('.vis-fact');
    if(fromHouse) fp.textContent='Would you like to play my puzzles or my game?'; else fp.textContent=fact;
    c.querySelector('.potline span').textContent=petalWord(n)+' in '+F.name+"'s pot";
    c.querySelector('#vis-game small').textContent=gameNote;
    c.querySelector('#vis-game').addEventListener('click',function(){
      if(!G){toast(F.name+"'s game is coming soon.");speak(F.name+"'s game is coming soon.");return;}
      if(potOf(ex,id)<1){var m=F.name+"'s petal pot is empty. Play her puzzles to grow five pink petals for it.";toast(m);speak(m);return;}
      closeOv();playGame(id);
    });
    c.querySelector('#vis-play').addEventListener('click',function(){closeOv();openGarden(id);});
    c.querySelector('#vis-read').addEventListener('click',function(){speak(fp.textContent+' '+petalWord(potOf(ex,id))+' in my pot.',true);});
    c.querySelector('#vis-close').addEventListener('click',function(){stopTalk();closeOv();});
  });
  speak(fromHouse?F.name+"'s house. Play my puzzles, or play my game? "+petalWord(n)+' in my pot.':F.name+' says: '+fact);
}
/* ---------------- worlds ---------------- */
var WORLDS=[
  {id:'petal',name:"Bloom's garden",who:'Flower fairy',color:'#F28CB3'},
  {id:'ripple',name:"Ripple's pond",who:'Water fairy',color:'#7DBDE6'},
  {id:'breeze',name:"Breeze's cloud tops",who:'Weather fairy',color:'#BFD3EA'},
  {id:'jingle',name:"Jingle's bluebell hill",who:'Music fairy',color:'#9AA3EA'},
  {id:'ginger',name:"Ginger's clinic",who:'Doctor fairy',color:'#C98A4B'},
  {id:'twinkle',name:"Twinkle's observatory",who:'Star fairy',color:'#3E4A98'},
  {id:'crumble',name:"Crumble's kitchen",who:'Baker fairy',color:'#8ED3C8'},
  {id:'rivet',name:"Rivet's cog mill",who:'Engineer fairy',color:'#D4825A'},
  {id:'gizmo',name:"Gizmo's lab",who:'Inventor fairy',color:'#A9B3C1'}
];
/* Each world card shows the fairy herself with her type symbol in a coloured badge (flower, water drop, cloud...),
   so children who can't read yet can find a fairy by her picture. Progress is drawn too: five petals (pink when
   grown), or her little house once she lives in the village. The words stay underneath for readers and screen readers. */
function petalStrip(n){
  var s='<svg class="wpetals" viewBox="0 0 110 26" aria-hidden="true">';
  for(var i=0;i<5;i++){var x=11+i*22; s+=i<n?'<ellipse cx="'+x+'" cy="13" rx="7" ry="11" fill="url(#ptfront)" stroke="#B8467A" stroke-width="2"/>':'<ellipse cx="'+x+'" cy="13" rx="7" ry="11" fill="#fff" stroke="#D9C9E6" stroke-width="2" stroke-dasharray="4 3"/>';}
  return s+'</svg>';
}
function renderWorlds(){
  var ex=cur(), box=$('#worlds'); box.innerHTML='';
  WORLDS.forEach(function(w){
    var F=FAIRIES[w.id], open=!!F;
    var b=document.createElement('button'); b.type='button'; b.className='world'+(open?'':' locked');
    var home=open&&movedIn(ex,w.id), n=open?petalCount(ex,w.id):0;
    var status = open ? (home?F.name+' lives in your village':n+' of 5 petals') : 'Coming soon';
    var pic = open ? '<span class="wpic" style="background:radial-gradient(circle at 50% 42%,#fff 0,#fff 30%,'+w.color+'55 72%,'+w.color+'99 100%)"><svg class="wfairy" viewBox="18 26 204 266" aria-hidden="true">'+F.art(true)+'</svg>' +
        '<span class="wbadge" style="background:'+w.color+'"><svg viewBox="0 0 100 100" aria-hidden="true">'+F.icon+'</svg></span>' +
        (home?'<span class="whome"><svg viewBox="0 0 220 200" aria-hidden="true">'+F.body()+'</svg></span>':'')+'</span>'
      : '<span class="wpic" style="background:#E2DAEC"><span class="wbadge" style="background:'+w.color+';color:#fff">'+IC.lock+'</span></span>';
    b.innerHTML=pic+(open&&!home?petalStrip(n):'')+'<b></b><span></span><span></span>';
    var sp=b.querySelectorAll(':scope > span:not(.wpic)'); b.querySelector('b').textContent=w.name; sp[0].textContent=w.who; sp[1].textContent=status;
    b.setAttribute('aria-label',w.name+', '+w.who+'. '+status);
    if(open){ b.addEventListener('click',function(){openGarden(w.id);}); }
    else { b.setAttribute('aria-disabled','true'); b.addEventListener('click',function(){toast(w.name+' is coming soon.');}); }
    box.appendChild(b);
  });
}
$('#w-back').addEventListener('click',function(){enterVillage();});
function twoLines(t){
  if(t.length<=9||t.indexOf(' ')<0)return [t];
  var mid=t.length/2, best=-1;
  for(var i=0;i<t.length;i++){if(t[i]===' '&&(best<0||Math.abs(i-mid)<=Math.abs(best-mid)))best=i;}
  return [t.slice(0,best),t.slice(best+1)];
}
/* what the big flower grows out of: each fairy draws her own (flowerBase in her FAIRIES entry):
   Bloom's on a stem with leaves, Ripple's on a lily pad, Breeze's on a cloud, and so on */
function flowerBase(w){ var F=FAIRIES[w]; return F&&F.flowerBase?F.flowerBase():''; }
/* a soft cloud made of puffs, centred on x,y (about 220 by 90 at scale 1) */
function cloudPuffs(x,y,k,fill){
  var c=[[-80,10,40],[-40,-14,50],[10,-28,56],[60,-10,46],[96,12,34],[-10,18,48],[44,20,40]];
  var s='<g transform="translate('+x+' '+y+') scale('+k+')"><ellipse cx="6" cy="44" rx="112" ry="10" fill="#6C7FA8" opacity=".18"/>';
  c.forEach(function(p){s+='<circle cx="'+p[0]+'" cy="'+(p[1]+4)+'" r="'+p[2]+'" fill="#C3D2EA"/>';});
  c.forEach(function(p){s+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+p[2]+'" fill="'+fill+'"/>';});
  return s+'<ellipse cx="-20" cy="-30" rx="34" ry="12" fill="#fff" opacity=".7"/></g>';
}
function flowerPicker(ex,popIdx,w){
  var F=FAIRIES[w], home=movedIn(ex,w), p=home?replayOf(ex,w):petalsOf(ex,w), L=ex.level, cx=340, cy=318, D=140;
  var s='<ellipse cx="340" cy="330" rx="330" ry="330" fill="url(#halo)"/>'+flowerBase(w);
  F.puz.forEach(function(pz,i){
    var deg=-90+i*72, rad=deg*Math.PI/180, done=!!p[i], title=pz.titles[L-1];
    var bx=cx+118*Math.cos(rad), by=cy+118*Math.sin(rad), tx=cx+198*Math.cos(rad), ty=cy+198*Math.sin(rad);
    var lines=twoLines(title);
    s+='<g class="tap pp" data-i="'+i+'" tabindex="0" role="button" aria-label="'+esc(title)+(done?(home?', pink petal':', petal grown'):', not done yet')+'">';
    s+='<g class="pbody" transform="rotate('+(deg+90)+' '+cx+' '+cy+')">' +
      (done
        ? '<ellipse class="'+(i===popIdx?'pop':'')+'" cx="'+cx+'" cy="'+(cy-D)+'" rx="84" ry="116" fill="url(#ptfront)" stroke="#B8467A" stroke-width="3"/>' +
          '<ellipse cx="'+(cx-34)+'" cy="'+(cy-D-30)+'" rx="14" ry="44" fill="#fff" opacity=".3"/>'
        : '<ellipse cx="'+cx+'" cy="'+(cy-D)+'" rx="84" ry="116" fill="#fff" fill-opacity=".9" stroke="#E08AB0" stroke-width="4" stroke-dasharray="11 9"/>') +
      '</g>';
    s+='<circle cx="'+f2(bx)+'" cy="'+f2(by+3)+'" r="39" fill="#3B2A4A" opacity=".12"/><circle cx="'+f2(bx)+'" cy="'+f2(by)+'" r="38" fill="#fff" stroke="'+(done?'#F4B9D2':'#EFE6F6')+'" stroke-width="3"/>' +
      '<svg x="'+f2(bx-29)+'" y="'+f2(by-29)+'" width="58" height="58" viewBox="0 0 72 72" aria-hidden="true">'+PZICON[pz.id]+'</svg>';
    if(done) s+='<path d="'+STAR+'" transform="translate('+f2(bx+30)+' '+f2(by-28)+') scale(1.05) translate(-182 -146)" fill="url(#ggold)" stroke="#B8861E" stroke-width="1.2"/>';
    var y0=ty-(lines.length-1)*13+9;
    s+='<text text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="25" font-weight="600" fill="#3B2A4A" stroke="#fff" stroke-width="7" stroke-linejoin="round" paint-order="stroke" aria-hidden="true">';
    lines.forEach(function(ln,k){s+='<tspan x="'+f2(tx)+'" y="'+f2(y0+k*26)+'">'+esc(ln)+'</tspan>';});
    s+='</text></g>';
  });
  s+='<circle cx="'+cx+'" cy="'+(cy+4)+'" r="62" fill="#B8861E" opacity=".35"/><circle cx="'+cx+'" cy="'+cy+'" r="60" fill="url(#ggold)" stroke="#C9961E" stroke-width="3"/>' +
    '<ellipse cx="'+(cx-20)+'" cy="'+(cy-24)+'" rx="18" ry="10" fill="#fff" opacity=".35" transform="rotate(-25 '+(cx-20)+' '+(cy-24)+')"/>';
  if(home){
    s+='<ellipse cx="322" cy="314" rx="6" ry="8" fill="#5A3A12"/><ellipse cx="358" cy="314" rx="6" ry="8" fill="#5A3A12"/><circle cx="324" cy="311" r="2.2" fill="#fff"/><circle cx="360" cy="311" r="2.2" fill="#fff"/>';
  } else {
    s+='<path d="M314 314 Q322 322 330 314 M350 314 Q358 322 366 314" stroke="#5A3A12" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
      '<text x="388" y="262" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="26" font-weight="600" fill="#6C5BC4" stroke="#fff" stroke-width="5" paint-order="stroke" aria-hidden="true">z<tspan font-size="20" dy="-14">z</tspan></text>';
  }
  s+='<ellipse cx="312" cy="334" rx="8" ry="5" fill="#E8708F" opacity=".45"/><ellipse cx="368" cy="334" rx="8" ry="5" fill="#E8708F" opacity=".45"/>' +
    '<path d="M330 338 Q340 347 350 338" stroke="#5A3A12" stroke-width="3" fill="none" stroke-linecap="round"/>';
  return s;
}
var lastNewPetal=-1;
var SCENES={};
function sceneFor(world){ if(!SCENES[world])SCENES[world]=FAIRIES[world].scene(); return SCENES[world]; }
function openGarden(w){
  var ex=cur(); if(!ex)return;
  if(w)curW=w;
  var F=FAIRIES[curW], home=movedIn(ex,curW), n=home?replayOf(ex,curW).filter(Boolean).length:petalCount(ex,curW), full=home&&n===5;
  $('#garden-title').textContent=F.place;
  $('#g-back').setAttribute('aria-label','Back to the village');
  $('#s-garden').style.backgroundImage='url("'+sceneFor(curW)+'")';
  $('#s-garden').style.backgroundColor=F.base;
  var pot=home?potOf(ex,curW):0;
  $('#meter-title').textContent = full ? 'All five petals are pink!' : home ? n+' of 5 pink petals' : n+' of 5 petals';
  $('#meter-text').textContent = full ? 'Pick the flower to put them in '+F.name+"'s petal pot." : home ? 'Five pink petals fill '+F.name+"'s pot. Her pot has "+petalWord(pot)+'.' : (n===0?'Tap a petal to play its puzzle. Five petals will wake '+F.name+'.':'Keep going! Five petals will wake '+F.name+'.');
  $('#g-pick').hidden=!full;
  var fl=$('#g-flower');
  fl.setAttribute('aria-label',F.name+"'s flower. Each petal is a puzzle.");
  fl.innerHTML=flowerPicker(ex,lastNewPetal,curW); lastNewPetal=-1;
  fl.querySelectorAll('.pp').forEach(function(g){
    var i=+g.getAttribute('data-i');
    g.addEventListener('click',function(){startPuzzle(i);});
    g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();startPuzzle(i);}});
  });
  show('s-garden');
  speak(full?'All five petals are pink! Tap Pick the flower to put them in '+F.name+"'s petal pot.":home?'Welcome back to '+F.place+'. Each puzzle you solve turns a petal pink. Five pink petals fill '+F.name+"'s petal pot.":F.place+'. Each petal is a puzzle. Tap a petal to play. Each puzzle you solve makes a petal grow.');
}
$('#g-flower').addEventListener('mousedown',function(e){if(e.target.closest&&e.target.closest('.tap'))e.preventDefault();});
$('#g-back').addEventListener('click',function(){enterVillage();});
/* five pink petals go into the fairy's pot and her flower starts again */
function pickFlower(){
  var ex=cur(), w=curW, F=FAIRIES[w], G=GAMES[w], r=replayOf(ex,w);
  if(!movedIn(ex,w)||r.filter(Boolean).length<5)return;
  ex.pots[w]=potOf(ex,w)+5; ex.replay[w]=[false,false,false,false,false]; save();
  fanfare();
  var n=ex.pots[w], art='<svg class="art" viewBox="0 0 64 64" aria-hidden="true">'+potArt(n,true);
  for(var i=0;i<5;i++) art+='<ellipse class="drop" style="animation-delay:'+(i*.14)+'s" cx="'+(20+i*6)+'" cy="18" rx="5" ry="8" fill="url(#ptfront)" stroke="#B8467A" stroke-width="1.2"/>';
  art+='</svg>';
  ovClose=null;
  openOv(art+'<h3 id="ov-h"></h3><p></p><div class="ov-actions">'+(G?'<button class="btn" id="pk-game"></button>':'')+'<button class="btn soft" id="pk-back"></button></div>',function(c){
    c.querySelector('h3').textContent='Five petals for '+F.name+'!';
    c.querySelector('p').textContent=potSay(F,G,n);
    if(G){var b=c.querySelector('#pk-game');b.textContent='Play '+G.name;b.addEventListener('click',function(){closeOv();playGame(w);});}
    var bk=c.querySelector('#pk-back');bk.textContent='Back to '+F.place;bk.addEventListener('click',function(){closeOv();openGarden();});
  });
  speak('Five petals for '+F.name+'! '+potSay(F,G,n));
}
function potSay(F,G,n){return F.name+"'s pot has "+petalWord(n)+' now. '+(G?'Each petal is one go of '+G.name+'.':'Her game is coming soon.');}
$('#g-pick').addEventListener('click',pickFlower);
$('#g-read').addEventListener('click',function(){var ex=cur(),F=FAIRIES[curW];speak(movedIn(ex,curW)?'Tap a petal to play a puzzle.':'Each petal is a puzzle. Tap a petal to play. Each puzzle you solve makes a petal grow. Five petals will wake '+F.name+'.',true);});
/* ---------------- puzzles ---------------- */
var pzIndex=0, sayText='', cleanup=null;
function setSay(t){sayText=t;$('#pz-say').textContent=t;}
function startPuzzle(i){
  var ex=cur(); pzIndex=i;
  var F=FAIRIES[curW], pz=F.puz[i], L=ex.level;
  $('#pz-title').textContent=pz.titles[L-1];
  $('#p-back').setAttribute('aria-label','Back to '+F.place);
  $('#s-puzzle').style.backgroundImage='linear-gradient(rgba(255,255,255,.3),rgba(255,255,255,.3)),url("'+sceneFor(curW)+'")';
  $('#s-puzzle').style.backgroundColor=F.base;
  var area=$('#pz-area'); area.innerHTML='';
  if(cleanup){cleanup();cleanup=null;}
  clearLater(); MR=null;
  show('s-puzzle');
  pz.run(area,L);
  speak(sayText);
}
$('#p-back').addEventListener('click',function(){if(cleanup){cleanup();cleanup=null;}clearLater();MR=null;openGarden();});
$('#p-read').addEventListener('click',function(){speak(sayText,true);});
/* tap the instruction card, or a question card, to hear it again */
$('#pz-say').addEventListener('click',function(){if(sayText)speak(sayText,true);});
$('#pz-area').addEventListener('click',function(e){var q=e.target.closest&&e.target.closest('.say-small');if(q&&q.textContent.trim())speak(q.textContent.trim(),true);});
$('#s-garden .g-status').addEventListener('click',function(e){if(e.target.closest&&e.target.closest('button'))return;speak($('#meter-title').textContent+'. '+$('#meter-text').textContent,true);});
var finishing=false;
function finish(ok){
  /* a timer can fire after the player has left the puzzle; ignore it then */
  if(finishing||$('#s-puzzle').hidden||!$('#ov').hidden)return;
  if(ok&&MR&&MR.k<MR.n-1){nextRound();return;}
  MR=null; finishing=true; clearLater();
  setTimeout(function(){finishing=false;},400);
  var ex=cur(), F=FAIRIES[curW], w=curW; if(cleanup){cleanup();cleanup=null;}
  var p=petalsOf(ex,w), backTo='Back to '+F.place;
  if(ok){
    var home=movedIn(ex,w), rp=home?replayOf(ex,w):p;
    var isNew=!rp[pzIndex];
    if(isNew){rp[pzIndex]=true;save();lastNewPetal=pzIndex;}
    chime();
    var all=!home && petalCount(ex,w)===5;
    var pink=home ? rp.filter(Boolean).length : 0;
    var head=pick(['Well done!','Brilliant!','You did it!','Wonderful!']);
    var body= home ? (isNew ? (pink===5?'All five petals are pink! Pick the flower to put them in '+F.name+'\'s petal pot.':'A petal turned pink. '+pink+' of 5 for '+F.name+'\'s petal pot.') : 'You solved it again. Great practice!')
      : isNew ? (all?'That is the fifth petal. Something magical is happening!':'You grew a petal for '+F.name+'\'s flower.') : 'You solved it again. Great practice!';
    ovClose=null;
    openOv('<svg class="art" viewBox="0 0 120 120" aria-hidden="true"><g class="sparkle"><circle cx="20" cy="22" r="3" fill="#F5C842"/><circle cx="100" cy="30" r="4" fill="#F5C842"/><circle cx="96" cy="96" r="3" fill="#F5C842"/><circle cx="18" cy="92" r="3.5" fill="#F5C842"/></g><ellipse class="pop" cx="60" cy="62" rx="26" ry="40" fill="url(#ptfront)" stroke="#B8467A" stroke-width="3"/></svg><h3 id="ov-h"></h3><p></p><div class="ov-actions"><button class="btn" id="res-go"></button></div>',function(c){
      c.querySelector('h3').textContent=head; c.querySelector('p').textContent=body; c.querySelector('#res-go').textContent=all?'See what happens':backTo;
      c.querySelector('#res-go').addEventListener('click',function(){closeOv(); if(all){showFound(w);} else openGarden();});
    });
    speak(head+' '+body);
  } else {
    softTone();
    var msgs=[['Nearly!','That wasn\'t quite right this time. Have another go, or pick a different puzzle.'],['Good try!','Not quite. Every fairy needs practice. You can try again.'],['Not this time','Keep going! You can have another go whenever you like.']];
    var m=pick(msgs);
    ovClose=null;
    openOv('<svg class="art" viewBox="66 40 108 150" aria-hidden="true">'+fairyArt(ex.look,true)+'</svg><h3 id="ov-h"></h3><p></p><div class="ov-actions"><button class="btn" id="res-go"></button></div>',function(c){
      c.querySelector('h3').textContent=m[0]; c.querySelector('p').textContent=m[1]; c.querySelector('#res-go').textContent=backTo;
      c.querySelector('#res-go').addEventListener('click',function(){closeOv();openGarden();});
    });
    speak(m[0]+' '+m[1]);
  }
}
/* 1. jigsaw */
var JIG_PICS={};
function pzJigsaw(area,L,key,picFn,what){
  /* key names the picture (drawn once by picFn and kept in JIG_PICS); what is said in the instructions */
  var cols=[3,4,6][L-1], rows=[3,5,6][L-1], total=cols*rows;
  setSay(L===1?'Drag the pieces onto the picture to finish '+what+'.':'Drag the '+total+' pieces into place to finish '+what+'.');
  if(!JIG_PICS[key])JIG_PICS[key]=picFn();
  var PIC_URL=JIG_PICS[key];
  /* Nimble Nymph's board is blank, so a small copy of the finished picture sits beside it to work from */
  var guide=L===3;
  area.innerHTML='<p class="count-note" id="jig-note" aria-live="polite"></p><div class="jig" id="jig"><div class="jig-board" id="jig-board"></div>'+(guide?'<div class="jig-guide" id="jig-guide"><img alt="The picture to copy" src="'+PIC_URL+'"></div>':'')+'</div>';
  var jig=$('#jig'), board=$('#jig-board'), note=$('#jig-note'), gd=$('#jig-guide');
  var placed=0, z=10, pieces=[], geo=null;
  function setNote(){note.textContent=placed+' of '+total+' pieces in place';}
  function layout(first){
    var W=jig.clientWidth, H=jig.clientHeight, B, bx, by, tray, G=0, gx=0, gy=0;
    if(W>H*1.25){ B=Math.min(H-16,W*.56,560); bx=8; by=Math.max(8,(H-B)/2); tray={x0:B+28,x1:W,y0:8,y1:H};
      if(guide){G=Math.round(Math.min(B*.36,(W-B-28)*.5,200));gx=W-G-6;gy=8;} }
    else { B=Math.min(W-8,H*.56,520); bx=(W-B)/2; by=4; tray={x0:0,x1:W,y0:B+22,y1:H};
      if(guide){G=Math.round(Math.min(B*.3,(H-B-22)*.7,170));gx=W-G-4;gy=B+16;} }
    var pw=B/cols, ph=B/rows; geo={B:B,bx:bx,by:by,pw:pw,ph:ph};
    if(gd){gd.style.cssText='left:'+gx+'px;top:'+gy+'px;width:'+G+'px;height:'+G+'px;';}
    /* a loose piece shouldn't start on top of the picture to copy */
    function onGuide(x,y){return guide&&x+pw>gx-6&&x<gx+G+6&&y+ph>gy-6&&y<gy+G+6;}
    board.style.cssText='left:'+bx+'px;top:'+by+'px;width:'+B+'px;height:'+B+'px;'+(L===1?'background-image:linear-gradient(rgba(255,255,255,.62),rgba(255,255,255,.62)),url("'+PIC_URL+'");background-size:'+B+'px '+B+'px;':L===2?'background-image:linear-gradient(#E4DAF0 2px,transparent 2px),linear-gradient(90deg,#E4DAF0 2px,transparent 2px);background-size:'+pw+'px '+ph+'px;':'');
    pieces.forEach(function(pc){
      pc.el.style.width=pw+'px'; pc.el.style.height=ph+'px';
      pc.el.style.backgroundSize=B+'px '+B+'px';
      pc.el.style.backgroundPosition=(-pc.c*pw)+'px '+(-pc.r*ph)+'px';
      if(pc.done){ pc.el.style.left=(bx+pc.c*pw)+'px'; pc.el.style.top=(by+pc.r*ph)+'px'; }
      else if(first||pc.fx===undefined){
        var x0=tray.x0, x1=Math.max(tray.x0+1,tray.x1-pw), y0=tray.y0, y1=Math.max(tray.y0+1,tray.y1-ph), px, py, tries=0;
        do{px=x0+Math.random()*(x1-x0);py=y0+Math.random()*(y1-y0);tries++;}while(onGuide(px,py)&&tries<40);
        pc.fx=px/W; pc.fy=py/H;
        pc.el.style.left=(pc.fx*W)+'px'; pc.el.style.top=(pc.fy*H)+'px';
      } else { pc.el.style.left=Math.min(pc.fx*W,W-pw)+'px'; pc.el.style.top=Math.min(pc.fy*H,H-ph)+'px'; }
    });
  }
  for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){
    var el=document.createElement('div'); el.className='jp';
    el.style.backgroundImage='url("'+PIC_URL+'")';
    jig.appendChild(el);
    pieces.push({el:el,r:r,c:c,done:false});
  }
  pieces.forEach(function(pc){
    var drag=null;
    pc.el.addEventListener('pointerdown',function(e){
      if(pc.done)return; e.preventDefault();
      try{pc.el.setPointerCapture(e.pointerId);}catch(_){}
      var rect=jig.getBoundingClientRect();
      drag={dx:e.clientX-rect.left-parseFloat(pc.el.style.left),dy:e.clientY-rect.top-parseFloat(pc.el.style.top)};
      pc.el.style.zIndex=++z; pc.el.classList.add('drag');
    });
    pc.el.addEventListener('pointermove',function(e){
      if(!drag)return;
      var rect=jig.getBoundingClientRect(), W=jig.clientWidth, H=jig.clientHeight;
      var x=Math.max(0,Math.min(W-geo.pw,e.clientX-rect.left-drag.dx)), y=Math.max(0,Math.min(H-geo.ph,e.clientY-rect.top-drag.dy));
      pc.el.style.left=x+'px'; pc.el.style.top=y+'px';
    });
    function drop(){
      if(!drag)return; drag=null; pc.el.classList.remove('drag');
      var x=parseFloat(pc.el.style.left), y=parseFloat(pc.el.style.top);
      var tx=geo.bx+pc.c*geo.pw, ty=geo.by+pc.r*geo.ph;
      if(Math.hypot(x-tx,y-ty)<Math.max(geo.pw,geo.ph)*.38){
        pc.done=true; pc.el.classList.add('set'); pc.el.style.left=tx+'px'; pc.el.style.top=ty+'px'; pc.el.style.zIndex=1;
        placed++; setNote(); tick();
        if(placed===total){ setTimeout(function(){finish(true);},700); }
      } else {
        pc.fx=x/jig.clientWidth; pc.fy=y/jig.clientHeight;
      }
    }
    pc.el.addEventListener('pointerup',drop);
    pc.el.addEventListener('pointercancel',drop);
  });
  setNote();
  requestAnimationFrame(function(){layout(true);});
  var onResize=function(){layout(false);};
  window.addEventListener('resize',onResize);
  cleanup=function(){window.removeEventListener('resize',onResize);};
}
/* More jigsaw pictures, so a replayed jigsaw isn't always the same one. Each fairy's jigsaw petal now has
   three pictures: her own picture (garden, rainbow, band...), her house in her world, and a poster of her with
   her things. They take turns: all three come up before one repeats, and never the same one twice in a row. */
var JIG_Q={}, JIG_LAST={};
function jigsawSet(area,L,id,own){
  var F=FAIRIES[id], set=own.concat([{key:id+'-home',fn:homeJig(id),what:F.name+'’s house'},{key:id+'-poster',fn:posterJig(id),what:'the picture of '+F.name}]);
  if(!JIG_Q[id]||!JIG_Q[id].length){var q=shuffle(set.map(function(p,i){return i;}));if(q.length>1&&set[q[0]].key===JIG_LAST[id])q.push(q.shift());JIG_Q[id]=q;}
  var p=set[JIG_Q[id].shift()]; JIG_LAST[id]=p.key;
  pzJigsaw(area,L,p.key,p.fn,p.what);
}
/* an SVG picture as base64, so it can sit inside another picture without its own encoding getting in the way */
function svgB64(url){var raw=decodeURIComponent(url.slice(url.indexOf(',')+1));return 'data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(raw)));}
function jigWrap(inner){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">'+allDefs()+inner+'</svg>');}
function thingArt(k){return k==='flower'?PICS.flower+flowerG(50,36,30,'pink',6):pic2(k);}
/* her house standing in her world, with her beside it */
function homeJig(id){return function(){
  var F=FAIRIES[id];
  var s='<image href="'+svgB64(sceneFor(id))+'" x="0" y="0" width="600" height="600" preserveAspectRatio="xMidYMid slice"/>';
  s+='<ellipse cx="270" cy="560" rx="250" ry="40" fill="#fff" opacity=".25"/>';
  s+='<g transform="translate(18 150) scale(2.1)">'+houseGround()+F.body()+'</g>';
  s+='<g transform="translate(400 250) scale(.74)">'+F.art()+'</g>';
  return jigWrap(s);
};}
/* a bright poster: the fairy in the middle, her type badge, and her things round the edge */
function posterJig(id){return function(){
  var F=FAIRIES[id], w=WORLDS.filter(function(x){return x.id===id;})[0], col=w?w.color:'#F28CB3', things=(F.jigThings||[]).slice(0,6);
  var s='<radialGradient id="jgp-bg" cx=".5" cy=".46" r=".72"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="'+col+'" stop-opacity=".35"/><stop offset="1" stop-color="'+col+'"/></radialGradient>';
  s+='<rect width="600" height="600" fill="url(#jgp-bg)"/>';
  for(var i=0;i<16;i++){var a=i*Math.PI/8;s+='<path d="M300 280 L'+f2(300+520*Math.cos(a-.09))+' '+f2(280+520*Math.sin(a-.09))+' L'+f2(300+520*Math.cos(a+.09))+' '+f2(280+520*Math.sin(a+.09))+' Z" fill="#fff" opacity="'+(i%2?.12:.22)+'"/>';}
  [[40,40],[560,48],[300,24],[26,250],[574,250],[300,584],[40,584],[560,584]].forEach(function(p,i){s+='<path d="'+STAR+'" transform="translate('+p[0]+' '+p[1]+') scale('+(i%2?.9:1.3)+') translate(-182 -146)" fill="url(#ggold)" opacity=".9"/>';});
  var spots=[[96,118],[504,118],[78,322],[522,322],[112,500],[488,500]];
  things.forEach(function(k,i){var p=spots[i];
    s+='<circle cx="'+p[0]+'" cy="'+(p[1]+5)+'" r="64" fill="#3B2A4A" opacity=".14"/><circle cx="'+p[0]+'" cy="'+p[1]+'" r="64" fill="#fff" stroke="'+col+'" stroke-width="6"/>';
    s+='<svg x="'+(p[0]-46)+'" y="'+(p[1]-46)+'" width="92" height="92" viewBox="0 0 100 100" overflow="visible">'+thingArt(k)+'</svg>';});
  s+='<ellipse cx="300" cy="520" rx="110" ry="18" fill="#3B2A4A" opacity=".16"/>';
  s+='<g transform="translate(156 128) scale(1.2)">'+F.art(true)+'</g>';
  s+='<circle cx="300" cy="72" r="46" fill="'+col+'" stroke="#fff" stroke-width="6"/><svg x="264" y="36" width="72" height="72" viewBox="0 0 100 100">'+F.icon+'</svg>';
  return jigWrap(s);
};}
function numberOptions(ans,cands){
  var set=[ans];
  cands.forEach(function(x){if(x>0&&set.indexOf(x)<0&&set.length<4)set.push(x);});
  var guard=0; while(set.length<4&&guard<50){var x=ans+rnd(-6,6);if(x>0&&set.indexOf(x)<0)set.push(x);guard++;}
  return shuffle(set);
}
function pic2(key){ return PICS2[key]||PICS[key]||''; }
function picSVG2(key,label){
  var inner = key==='flower' ? PICS.flower + flowerG(50,36,30,'pink',6) : pic2(key);
  return '<svg viewBox="0 0 100 100" '+(label?'role="img" aria-label="'+esc(label)+'"':'aria-hidden="true"')+'>'+inner+'</svg>';
}
/* ---------- shared puzzle helpers ---------- */
/* run n rounds in a row; a wrong round ends the puzzle with no petal */
function rounds(n,make){
  var k=0;
  function next(ok){
    if(!ok){finish(false);return;}
    k++;
    if(k>=n){setTimeout(function(){finish(true);},350);return;}
    tick(); make(k,next);
  }
  make(0,next);
}
function roundNote(k,n){return n>1?'<p class="count-note">'+(k+1)+' of '+n+'</p>':'';}
/* play a one-round puzzle n times in a row with "1 of 3" at the top. The puzzle calls finish(ok) as usual:
   a right answer moves on to the next round, a wrong one ends the puzzle with no petal.
   R.k is the round (0 based); R.fresh(list) picks something not used in an earlier round. */
var MR=null;
function multi(area,L,n,run){
  var R={n:n,k:0,used:[],L:L};
  R.fresh=function(list){var l=list.filter(function(x){return R.used.indexOf(x)<0;});if(!l.length)l=list;var x=pick(l);R.used.push(x);return x;};
  R.go=function(){area.innerHTML='';run(R);area.insertAdjacentHTML('afterbegin',roundNote(R.k,n));};
  MR=R; R.go();
}
function nextRound(){
  var R=MR; finishing=true; setTimeout(function(){finishing=false;},400);
  clearLater(); if(cleanup){cleanup();cleanup=null;} stopTalk(); tick(); R.k++;
  setTimeout(function(){if($('#s-puzzle').hidden||MR!==R)return;R.go();$('#s-puzzle').scrollTop=0;speak(sayText);},350);
}
function optBtn(html,label,cls){
  var b=document.createElement('button'); b.type='button'; b.className='opt'+(cls?' '+cls:''); b.innerHTML=html;
  if(label)b.setAttribute('aria-label',label);
  return b;
}
function wordOpts(box,words,ans,done){
  shuffle(words).forEach(function(w){var b=optBtn(esc(w),null,'word');b.addEventListener('click',function(){done(w===ans);});box.appendChild(b);});
}
function numOpts(box,ans,cands,done){
  numberOptions(ans,cands).forEach(function(v){var b=optBtn(String(v),null,'num');b.addEventListener('click',function(){done(v===ans);});box.appendChild(b);});
}
function picOpts(box,keys,ans,done,labels){
  shuffle(keys).forEach(function(k){var b=optBtn(picSVG2(k),labels?labels(k):'A picture');b.addEventListener('click',function(){done(k===ans);});box.appendChild(b);});
}
/* sort things into groups: tap a thing, then tap its group, then Check */
function sorter(area,items,zones,opts){
  opts=opts||{};
  var sel=null;
  area.innerHTML='<div class="tray" id="st-tray" aria-label="Things to sort"></div><div class="szones" id="st-zones"></div><button class="btn" id="st-check" disabled>Check</button>';
  function itBtn(it,placed){
    var b=document.createElement('button'); b.type='button'; b.className='it'+(it.text?' tx':''); b.innerHTML=it.text?esc(it.text):it.html;
    b.setAttribute('aria-label',it.label+(placed?', tap to take it out':''));
    if(!placed)b.setAttribute('aria-pressed',String(sel===it.id));
    return b;
  }
  function render(){
    var tray=$('#st-tray'); tray.innerHTML='';
    var left=items.filter(function(it){return it.zone==null;});
    if(!left.length)tray.innerHTML='<span class="tray-empty">All sorted. Tap Check.</span>';
    left.forEach(function(it){var b=itBtn(it,false);b.addEventListener('click',function(){sel=(sel===it.id?null:it.id);tick();render();});tray.appendChild(b);});
    $('#st-check').disabled=left.length>0;
    var zb=$('#st-zones'); zb.innerHTML='';
    zones.forEach(function(z){
      var d=document.createElement('div'); d.className='szone'+(z.cls?' '+z.cls:''); d.setAttribute('role','button'); d.tabIndex=0;
      d.setAttribute('aria-label',(opts.zoneWord||'Group')+': '+z.label);
      d.innerHTML='<h4>'+(z.icon?'<svg viewBox="0 0 100 100" aria-hidden="true">'+z.icon+'</svg>':'')+'<span></span></h4><div class="szin"></div>';
      d.querySelector('h4 span').textContent=z.label;
      items.filter(function(it){return it.zone===z.id;}).forEach(function(it){
        var b=itBtn(it,true); b.addEventListener('click',function(e){if(sel!==null)return;e.stopPropagation();it.zone=null;tick();render();}); d.querySelector('.szin').appendChild(b);
      });
      function go(){if(sel===null)return;items.filter(function(it){return it.id===sel;})[0].zone=z.id;sel=null;tick();render();}
      d.addEventListener('click',go);
      d.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}});
      zb.appendChild(d);
    });
  }
  items.forEach(function(it){it.zone=null;});
  $('#st-check').addEventListener('click',function(){finish(items.every(function(it){return it.zone===it.want;}));});
  render();
}
/* put things in order: tap them one by one into the empty spaces */
function orderer(box,cfg,done){
  /* cfg: {answer:[keys], fixed:number of answer keys already in place at the start, show(key)->html, label(key), text:bool} */
  var fixed=cfg.fixed||0, built=[], n=cfg.answer.length;
  box.innerHTML='<div class="oslots" id="or-slots" aria-live="polite"></div><div class="tiles" id="or-tiles"></div><div class="row-btns"><button class="btn soft" id="or-undo">Take one back</button></div>';
  var tiles=cfg.choices?cfg.choices.slice():shuffle(cfg.answer.slice(fixed));
  function drawSlots(){
    var s='';
    for(var i=0;i<n;i++){
      var k = i<fixed ? cfg.answer[i] : built[i-fixed] ? built[i-fixed].k : null;
      s+='<div class="oslot'+(k?' fill':'')+(cfg.text?' tx':'')+(i<fixed?' given':'')+'" role="listitem" aria-label="'+(k?esc(cfg.label(k)):'Empty space')+'">'+(k?cfg.show(k):'')+'</div>';
    }
    $('#or-slots').innerHTML=s;
  }
  tiles.forEach(function(k){
    var t=document.createElement('button'); t.type='button'; t.className='it'+(cfg.text?' tx':''); t.innerHTML=cfg.show(k); t.setAttribute('aria-label',cfg.label(k));
    t.addEventListener('click',function(){
      if(built.length>=n-fixed)return;
      built.push({k:k,el:t}); if(!cfg.choices){t.disabled=true; t.style.visibility='hidden';} if(cfg.onPick)cfg.onPick(k); else tick(); drawSlots();
      if(built.length===n-fixed){
        var ok=built.every(function(b,i){return b.k===cfg.answer[i+fixed];});
        setTimeout(function(){done(ok);},450);
      }
    });
    $('#or-tiles').appendChild(t);
  });
  $('#or-undo').addEventListener('click',function(){var b=built.pop();if(b){b.el.disabled=false;b.el.style.visibility='';drawSlots();}});
  drawSlots();
}
/* spell a word with letter tiles; 'blanks' lists the letters to fill (the rest are shown) */
function speller(box,word,blanks,extras,done){
  var built=[], need=blanks.length;
  box.insertAdjacentHTML('beforeend','<div class="slots" id="sp-slots" aria-live="polite"></div><div class="tiles" id="sp-tiles"></div>'+(need>1?'<div class="row-btns"><button class="btn soft" id="sp-undo">Take back a letter</button></div>':''));
  function drawSlots(){
    var s='', b=0;
    for(var i=0;i<word.length;i++){
      if(blanks.indexOf(i)<0){s+='<span class="slot given">'+word[i]+'</span>';}
      else {var ch=built[blanks.indexOf(i)]; s+='<span class="slot">'+(ch?ch.ch:'')+'</span>';}
    }
    $('#sp-slots').innerHTML=s;
    var said=''; for(var j=0;j<word.length;j++){var bi=blanks.indexOf(j);said+=(bi<0?word[j]:(built[bi]?built[bi].ch:'gap'))+' ';}
    $('#sp-slots').setAttribute('aria-label','The word so far: '+said);
  }
  var letters=shuffle(blanks.map(function(i){return word[i];}).concat(extras));
  letters.forEach(function(ch){
    var t=document.createElement('button'); t.type='button'; t.className='tile'; t.textContent=ch; t.setAttribute('aria-label','Letter '+ch);
    t.addEventListener('click',function(){
      if(built.length>=need)return;
      built.push({ch:ch,el:t}); t.disabled=true; tick(); drawSlots();
      if(built.length===need){var ok=built.every(function(b,i){return b.ch===word[blanks[i]];});setTimeout(function(){done(ok);},450);}
    });
    $('#sp-tiles').appendChild(t);
  });
  var u=$('#sp-undo'); if(u)u.addEventListener('click',function(){var b=built.pop();if(b){b.el.disabled=false;drawSlots();}});
  drawSlots();
}
function extraLetters(word,n){
  return shuffle('abcdefghijklmnoprstuwy'.split('').filter(function(ch){return word.indexOf(ch)<0;})).slice(0,n);
}
function regPts(cx,cy,r,n,rot){var p=[];for(var i=0;i<n;i++){var a=((rot==null?-90:rot)+i*360/n)*Math.PI/180;p.push([f2(cx+r*Math.cos(a)),f2(cy+r*Math.sin(a))]);}return p;}
function ptsPath(p){return 'M'+p.map(function(q){return q[0]+' '+q[1];}).join(' L')+' Z';}
function cap(w){return w.charAt(0).toUpperCase()+w.slice(1);}
function shapePoints(k){
  var p=[],i,t;
  if(k==='circle'){for(i=0;i<40;i++){t=i/40*Math.PI*2;p.push([50+36*Math.cos(t),50+36*Math.sin(t)]);}return p;}
  if(k==='oval'){for(i=0;i<44;i++){t=i/44*Math.PI*2;p.push([50+44*Math.cos(t),50+26*Math.sin(t)]);}return p;}
  if(k==='heart'){for(i=0;i<48;i++){t=i/48*Math.PI*2;p.push([50+2.4*16*Math.pow(Math.sin(t),3),46-2.4*(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))]);}return p;}
  if(k==='star'){for(i=0;i<10;i++){t=(-90+i*36)*Math.PI/180;var r=i%2?18:42;p.push([50+r*Math.cos(t),54+r*Math.sin(t)]);}return p;}
  if(k==='semicircle'){for(i=0;i<=20;i++){t=Math.PI+i/20*Math.PI;p.push([50+40*Math.cos(t),68+40*Math.sin(t)]);}return p;}
  var poly={square:[[18,18],[82,18],[82,82],[18,82]],triangle:regPts(50,56,42,3),rectangle:[[6,28],[94,28],[94,72],[6,72]],pentagon:regPts(50,54,42,5),hexagon:regPts(50,50,42,6,0),octagon:regPts(50,50,42,8,22.5)}[k];
  return poly.map(function(q){return [+q[0],+q[1]];});
}
function iconShape(k){
  var p=shapePoints(k);
  return '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M'+p.map(function(q){return f2(q[0])+' '+f2(q[1]);}).join(' L')+' Z" fill="'+({circle:'#F28CB3',square:'#F8CF5A',triangle:'#7DBDE6',heart:'#E8574C',star:'#F7A055'}[k]||'#B3A4F0')+'" stroke="#3B2A4A" stroke-width="4" stroke-linejoin="round"/></svg>';
}
/* ---------- sounds for the music and clinic puzzles (these play even when other sounds are off, because they are the puzzle) ---------- */
var NOISE=null;
function noiseBuf(c){if(!NOISE){NOISE=c.createBuffer(1,c.sampleRate*.5,c.sampleRate);var d=NOISE.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1;}return NOISE;}
function bellTone(f,t0,dur,vol){
  var c=ctx(); if(!c)return; var t=c.currentTime+(t0||0); dur=dur||1.2; vol=vol||.18;
  [[1,1],[2,.25],[3,.08]].forEach(function(h){
    var o=c.createOscillator(), g=c.createGain(); o.type='sine'; o.frequency.value=f*h[0];
    g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol*h[1],t+.01); g.gain.exponentialRampToValueAtTime(0.0001,t+dur/h[0]);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+dur+.05);
  });
}
function holdTone(f,t0,dur,vol){
  var c=ctx(); if(!c)return; var t=c.currentTime+(t0||0), o=c.createOscillator(), g=c.createGain(); o.type='triangle'; o.frequency.value=f;
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol||.2,t+.02); g.gain.setValueAtTime(vol||.2,t+Math.max(.03,dur-.06)); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+dur+.05);
}
function drumHit(t0){
  var c=ctx(); if(!c)return; var t=c.currentTime+(t0||0), o=c.createOscillator(), g=c.createGain();
  o.type='sine'; o.frequency.setValueAtTime(170,t); o.frequency.exponentialRampToValueAtTime(55,t+.25);
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(.6,t+.005); g.gain.exponentialRampToValueAtTime(0.0001,t+.35);
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+.4);
}
function noiseHit(t0,type,freq,dur,vol){
  var c=ctx(); if(!c)return; var t=c.currentTime+(t0||0), src=c.createBufferSource(), f=c.createBiquadFilter(), g=c.createGain();
  src.buffer=noiseBuf(c); f.type=type; f.frequency.value=freq;
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.004); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  src.connect(f); f.connect(g); g.connect(c.destination); src.start(t); src.stop(t+dur+.02);
}
function clapHit(t0){noiseHit(t0,'bandpass',1400,.14,.7);noiseHit((t0||0)+.012,'bandpass',1100,.12,.5);}
function shakeHit(t0){noiseHit(t0,'highpass',5200,.11,.35);noiseHit((t0||0)+.06,'highpass',6000,.07,.2);}
function thump(t0,soft){
  var c=ctx(); if(!c)return; var t=c.currentTime+(t0||0), o=c.createOscillator(), g=c.createGain();
  o.type='sine'; o.frequency.setValueAtTime(soft?70:85,t); o.frequency.exponentialRampToValueAtTime(40,t+.16);
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(soft?.45:.7,t+.008); g.gain.exponentialRampToValueAtTime(0.0001,t+.2);
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+.25);
}
/* ---------- timers that stop when the player leaves a puzzle ---------- */
var PZT=[];
function later(fn,ms){var id=setTimeout(fn,ms);PZT.push(id);return id;}
function clearLater(){PZT.forEach(function(id){clearTimeout(id);});PZT=[];}
function gearD(z,r,ph,add,ded){
  add=add==null?4.4:add; ded=ded==null?5.2:ded;
  var p=360/z, ro=r+add, rr=r-ded, d='';
  function pt(rad,a){a=a*Math.PI/180;return f2(rad*Math.cos(a))+' '+f2(rad*Math.sin(a));}
  for(var k=0;k<z;k++){
    var a=(ph||0)+k*p;
    d+=(k?' L':'M')+pt(rr,a-.32*p)+' L'+pt(ro,a-.15*p)+' A'+f2(ro)+' '+f2(ro)+' 0 0 1 '+pt(ro,a+.15*p)+' L'+pt(rr,a+.32*p)+' A'+f2(rr)+' '+f2(rr)+' 0 0 1 '+pt(rr,a+.68*p);
  }
  return d+' Z';
}
/* a curved arrow around x,y from angle a0 to a1 (clockwise when cw) */
function turnArrow(x,y,R,a0,a1,cw,col,w){
  if(!cw){var t=a0;a0=a1;a1=t;}
  function P(a){a=a*Math.PI/180;return [x+R*Math.cos(a),y+R*Math.sin(a)];}
  var p0=P(a0),p1=P(a1),span=Math.abs(a1-a0);
  var d='M'+f2(p0[0])+' '+f2(p0[1])+' A'+f2(R)+' '+f2(R)+' 0 '+(span>180?1:0)+' '+(cw?1:0)+' '+f2(p1[0])+' '+f2(p1[1]);
  var ta=(a1+(cw?90:-90))*Math.PI/180, tx=Math.cos(ta), ty=Math.sin(ta), hw=w*1.6, hl=w*2.2;
  var tip=[p1[0]+tx*hl,p1[1]+ty*hl], b1=[p1[0]-ty*hw,p1[1]+tx*hw], b2=[p1[0]+ty*hw,p1[1]-tx*hw];
  return '<path d="'+d+'" stroke="'+col+'" stroke-width="'+w+'" fill="none" stroke-linecap="round"/><path d="M'+f2(tip[0])+' '+f2(tip[1])+' L'+f2(b1[0])+' '+f2(b1[1])+' L'+f2(b2[0])+' '+f2(b2[1])+' Z" fill="'+col+'" stroke="'+col+'" stroke-width="'+f2(w*.5)+'" stroke-linejoin="round"/>';
}
/* ---------------- a fairy is found ---------------- */
var foundW='petal';
function showFound(w){
  foundW=w; var F=FAIRIES[w];
  var art=F.foundGround +
    '<path d="M170 330 C166 290 174 260 170 230" stroke="#3F8A3A" stroke-width="8" fill="none" stroke-linecap="round"/>' +
    '<path d="M168 300 C140 284 116 290 108 300 C128 314 152 312 168 300 Z" fill="url(#ptleaf)"/>';
  for(var i=0;i<5;i++){art+='<g transform="rotate('+(i*72)+' 170 200)"><ellipse class="pop" style="animation-delay:'+(i*.12)+'s" cx="170" cy="150" rx="34" ry="52" fill="url(#ptfront)" stroke="#B8467A" stroke-width="3"/></g>';}
  art+='<circle cx="170" cy="200" r="26" fill="url(#ggold)"/>';
  art+='<g class="rise"><g class="bob">'+nested(98,16,144,192,'0 0 240 320',F.art(true))+'</g></g>';
  art+='<g class="sparkle"><circle cx="40" cy="60" r="5" fill="#F5C842"/><circle cx="300" cy="80" r="6" fill="#F5C842"/><circle cx="292" cy="250" r="4" fill="#F5C842"/><circle cx="52" cy="240" r="5" fill="#F5C842"/></g>';
  $('#found-art').innerHTML=art;
  $('#found-art').setAttribute('aria-label',F.name+' the '+F.kind+' rising out of a big flower');
  $('#s-found .found').style.background=F.foundBg;
  $('#found-go').textContent='Take '+F.name+' home';
  var ex=cur();
  var text='Hello '+ex.name+'! I\'m '+F.name+', the '+F.kind+'. '+F.thanks+' May I come and live in your village?';
  $('#found-text').textContent=text;
  show('s-found');
  fanfare();
  setTimeout(function(){speak(text);},1500);
}
$('#found-go').addEventListener('click',function(){
  var ex=cur(); if(!ex.moved)ex.moved={}; ex.moved[foundW]=true;
  if(!ex.pots)ex.pots={}; ex.pots[foundW]=5; replayOf(ex,foundW); ex.replay[foundW]=[false,false,false,false,false]; save();
  enterVillage({moveIn:foundW});
});
[['#make-back',IC.back],['#w-back',IC.back],['#g-back',IC.back],['#p-back',IC.back],['#g-read',IC.speak],['#p-read',IC.speak]].forEach(function(x){$(x[0]).innerHTML=x[1];});
/* Full screen: a button in each top bar. Shown only where the browser allows it (iPhones only allow full screen for videos). */
(function(){
  var root=document.documentElement;
  var canFS=!!(document.fullscreenEnabled||document.webkitFullscreenEnabled);
  var btns=[].slice.call(document.querySelectorAll('.fsbtn'));
  function isFS(){return !!(document.fullscreenElement||document.webkitFullscreenElement);}
  function sync(){
    var on=isFS();
    btns.forEach(function(b){b.hidden=!canFS;b.innerHTML=on?IC.fullOff:IC.full;b.setAttribute('aria-label',on?'Leave full screen':'Full screen');});
  }
  function go(){
    var p;
    try{
      if(isFS()){p=document.exitFullscreen?document.exitFullscreen():document.webkitExitFullscreen&&document.webkitExitFullscreen();}
      else{p=root.requestFullscreen?root.requestFullscreen({navigationUI:'hide'}):root.webkitRequestFullscreen&&root.webkitRequestFullscreen();}
    }catch(e){p=Promise.reject(e);}
    if(p&&p.catch)p.catch(function(){toast('Full screen isn’t available on this device.');});
  }
  btns.forEach(function(b){b.addEventListener('click',go);});
  document.addEventListener('fullscreenchange',sync);
  document.addEventListener('webkitfullscreenchange',sync);
  sync();
})();

/* called by index.html once core.js and every fairy file have loaded */
function startGame(){
  document.getElementById('defs-host').innerHTML=DEFS.replace('</defs>',DEFS_MORE+'</defs>');
  load();
  renderWho();
  show('s-who');
  iconButtons();
}
