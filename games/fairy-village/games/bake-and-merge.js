/* ================================================================
   BAKE AND MERGE - Crumble's game (phase 10)
   A calm puzzle with no timer. Crumble's baking tray has squares (5 by 4 for Little Sprite, 4 by 4
   for Clever Pixie and Nimble Nymph). Drag a bake onto a matching bake it is touching (beside it,
   above, below or corner to corner) and the two bake into the next one up:
   flour, dough, bun, cupcake, layer cake, then a giant celebration cake.
   Drag a bake onto an empty square to move it there. After every move or bake a new bag of flour
   lands on a free square (for Nimble Nymph, one go in four it is a bowl of dough instead).
   A celebration cake is carried off the tray to Crumble's party table beside it, freeing its square;
   the table counts the cakes made (just for fun: the score is still bakes made).
   Tap a bake, then tap where it should go, works too. Keyboard: arrow keys move a frame,
   Space or Enter picks a bake up and puts it down.
   Ends when the tray is full and no two touching bakes match. Score: bakes made.
   Touching includes corners because a simulation showed sides-only trays fill up in about
   40 bakes with no celebration cake; with corners (and cakes still on the tray) a simple player made
   about 200 bakes on Little Sprite's tray and 145 on the 4 by 4 tray. Cakes now leave the tray, so games run longer.
   Names in this file start with bm or BM so they don't clash with other files.
   ================================================================ */
var BM_SET={
  tray:[[4,5],[4,4],[4,4]],   /* rows and columns of the tray (turned round on a tall phone) */
  dough:[0,0,.25],            /* chance the new bag is a bowl of dough instead of flour */
  start:4                     /* bags of flour on the tray at the start */
};
var BM_NAMES=['flour','dough','bun','cupcake','layer cake','celebration cake'];
var BM_TOP=5;
/* the six bakes, each in a 0 0 100 100 box, lit from the top left */
var BM_ART=[
  /* flour: a tied sack with a wheat ear */
  '<defs><radialGradient id="bm0a" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#FFFDF8"/><stop offset=".6" stop-color="#F1E7D6"/><stop offset="1" stop-color="#CDB894"/></radialGradient></defs>'+
  '<ellipse cx="50" cy="91" rx="32" ry="5" fill="#3B2A4A" opacity=".18"/>'+
  '<path d="M30 34 C22 46 18 66 22 82 C24 90 76 90 78 82 C82 66 78 46 70 34 Z" fill="url(#bm0a)" stroke="#A68A5E" stroke-width="3" stroke-linejoin="round"/>'+
  '<path d="M33 34 C30 26 32 18 38 14 C42 20 46 22 50 22 C54 22 58 20 62 14 C68 18 70 26 67 34 Z" fill="#F6EFE2" stroke="#A68A5E" stroke-width="3" stroke-linejoin="round"/>'+
  '<path d="M31 35 C44 39 56 39 69 35" stroke="#C2563C" stroke-width="5" fill="none" stroke-linecap="round"/>'+
  '<path d="M50 50 V78" stroke="#C9922A" stroke-width="3" stroke-linecap="round"/>'+
  '<g fill="#E8B442" stroke="#B07E1C" stroke-width="1.5"><ellipse cx="44" cy="56" rx="4" ry="7" transform="rotate(-30 44 56)"/><ellipse cx="56" cy="56" rx="4" ry="7" transform="rotate(30 56 56)"/><ellipse cx="44" cy="66" rx="4" ry="7" transform="rotate(-30 44 66)"/><ellipse cx="56" cy="66" rx="4" ry="7" transform="rotate(30 56 66)"/><ellipse cx="50" cy="48" rx="3.5" ry="6"/></g>'+
  '<ellipse cx="33" cy="54" rx="4" ry="12" fill="#fff" opacity=".7"/>',
  /* dough: a soft ball of dough in a blue mixing bowl */
  '<defs><radialGradient id="bm1a" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#FFFBEF"/><stop offset=".65" stop-color="#F6E6C4"/><stop offset="1" stop-color="#D9BE8A"/></radialGradient>'+
  '<linearGradient id="bm1b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8FCBF0"/><stop offset=".45" stop-color="#5BA8DE"/><stop offset="1" stop-color="#2F72A8"/></linearGradient></defs>'+
  '<ellipse cx="50" cy="91" rx="34" ry="5" fill="#3B2A4A" opacity=".18"/>'+
  /* the inside of the bowl and its back rim first, so the dough sits down inside it */
  '<ellipse cx="50" cy="48" rx="38" ry="9" fill="#2B6496" stroke="#245E8E" stroke-width="3"/>'+
  '<path d="M16 48 A34 6.5 0 0 1 84 48" stroke="#8FCBF0" stroke-width="2.5" fill="none" opacity=".7"/>'+
  '<path d="M20 52 C17 32 33 22 50 22 C67 22 83 32 80 52 Z" fill="url(#bm1a)" stroke="#B89A62" stroke-width="3"/>'+
  '<path d="M35 31 C39 27 45 26 50 27" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".85"/>'+
  '<path d="M60 36 C62 40 60 44 56 45" stroke="#C9AC74" stroke-width="2.5" fill="none" stroke-linecap="round"/>'+
  /* the front of the bowl, its top edge following the front of the rim, drawn over the bottom of the dough */
  '<path d="M12 48 A38 9 0 0 0 88 48 C88 72 72 88 50 88 C28 88 12 72 12 48 Z" fill="url(#bm1b)" stroke="#245E8E" stroke-width="3" stroke-linejoin="round"/>'+
  '<path d="M13 49 A37 8.5 0 0 0 87 49" stroke="#BFE3F8" stroke-width="3.5" fill="none" stroke-linecap="round"/>'+
  '<path d="M20 62 C22 71 28 78 36 82" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".55"/>'+
  '<g fill="#fff" opacity=".9"><circle cx="40" cy="71" r="3"/><circle cx="50" cy="74" r="3"/><circle cx="60" cy="71" r="3"/></g>',
  /* bun: a golden round bun with a criss-cross top and seeds */
  '<defs><radialGradient id="bm2a" cx=".36" cy=".28" r=".85"><stop offset="0" stop-color="#FFE3A0"/><stop offset=".5" stop-color="#E9A54A"/><stop offset="1" stop-color="#A9601E"/></radialGradient></defs>'+
  '<ellipse cx="50" cy="88" rx="38" ry="6" fill="#3B2A4A" opacity=".2"/>'+
  '<path d="M12 72 C10 40 30 22 50 22 C70 22 90 40 88 72 C88 84 12 84 12 72 Z" fill="url(#bm2a)" stroke="#8A4A18" stroke-width="3"/>'+
  '<path d="M14 74 C30 82 70 82 86 74" stroke="#8A4A18" stroke-width="2.5" fill="none" opacity=".5"/>'+
  '<g stroke="#9A5A20" stroke-width="3" stroke-linecap="round" opacity=".75" fill="none"><path d="M32 38 L62 66"/><path d="M48 30 L76 58"/><path d="M68 36 L38 66"/><path d="M52 28 L24 56"/></g>'+
  '<g fill="#FFF6DC" stroke="#C9A060" stroke-width="1"><ellipse cx="40" cy="32" rx="2.4" ry="1.4" transform="rotate(-20 40 32)"/><ellipse cx="60" cy="30" rx="2.4" ry="1.4" transform="rotate(25 60 30)"/><ellipse cx="72" cy="46" rx="2.4" ry="1.4" transform="rotate(60 72 46)"/><ellipse cx="28" cy="48" rx="2.4" ry="1.4" transform="rotate(-60 28 48)"/><ellipse cx="50" cy="48" rx="2.4" ry="1.4"/></g>'+
  '<ellipse cx="34" cy="38" rx="7" ry="4" fill="#fff" opacity=".45" transform="rotate(-35 34 38)"/>',
  /* cupcake: a striped case, a pink swirl and a cherry */
  '<defs><radialGradient id="bm3a" cx=".36" cy=".3" r=".85"><stop offset="0" stop-color="#FFE6F0"/><stop offset=".55" stop-color="#F7A3C4"/><stop offset="1" stop-color="#D9668F"/></radialGradient>'+
  '<linearGradient id="bm3b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9FD9F0"/><stop offset=".5" stop-color="#6FBDE0"/><stop offset="1" stop-color="#3E8DB8"/></linearGradient>'+
  '<radialGradient id="bm3c" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FF9A8A"/><stop offset=".6" stop-color="#E8443A"/><stop offset="1" stop-color="#9C1E1A"/></radialGradient></defs>'+
  '<ellipse cx="50" cy="92" rx="26" ry="4.5" fill="#3B2A4A" opacity=".2"/>'+
  '<path d="M24 56 L32 90 H68 L76 56 Z" fill="url(#bm3b)" stroke="#2A6E96" stroke-width="3" stroke-linejoin="round"/>'+
  '<path d="M36 57 L40 89 M50 57 V89 M64 57 L60 89" stroke="#E9F7FD" stroke-width="3" opacity=".8"/>'+
  '<path d="M20 58 C14 46 24 38 32 40 C30 30 40 24 48 28 C52 20 64 22 66 30 C76 28 84 38 80 46 C88 50 86 60 78 60 Z" fill="url(#bm3a)" stroke="#B8467A" stroke-width="3" stroke-linejoin="round"/>'+
  '<path d="M30 50 C40 46 58 46 70 50 M38 38 C46 35 56 36 62 39" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>'+
  '<path d="M54 18 C56 12 60 8 66 6" stroke="#3F8A3A" stroke-width="3" fill="none" stroke-linecap="round"/>'+
  '<circle cx="52" cy="22" r="8" fill="url(#bm3c)" stroke="#7A1614" stroke-width="2"/><circle cx="49" cy="19" r="2.2" fill="#fff" opacity=".8"/>',
  /* layer cake: two sponge layers with jam and cream, pink icing drips and strawberries */
  '<defs><linearGradient id="bm4a" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFF0D2"/><stop offset=".5" stop-color="#F3D29A"/><stop offset="1" stop-color="#C99A58"/></linearGradient>'+
  '<radialGradient id="bm4b" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#FFE9F2"/><stop offset=".6" stop-color="#F59AC0"/><stop offset="1" stop-color="#D2628C"/></radialGradient>'+
  '<radialGradient id="bm4c" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FF9A8A"/><stop offset=".6" stop-color="#E8443A"/><stop offset="1" stop-color="#9C1E1A"/></radialGradient></defs>'+
  '<ellipse cx="50" cy="88" rx="44" ry="7" fill="#fff" stroke="#C9A8B8" stroke-width="2.5"/>'+
  '<path d="M14 44 V78 C14 86 86 86 86 78 V44 Z" fill="url(#bm4a)" stroke="#9A6A34" stroke-width="3"/>'+
  '<path d="M14 62 C14 68 86 68 86 62" stroke="#E8574C" stroke-width="5" fill="none"/>'+
  '<path d="M14 59 C14 65 86 65 86 59" stroke="#FFF8F0" stroke-width="4" fill="none"/>'+
  '<path d="M14 44 C14 34 86 34 86 44 V48 C82 48 82 56 78 56 C74 56 74 48 68 48 C64 48 64 60 58 60 C52 60 54 48 48 48 C42 48 42 56 36 56 C30 56 32 48 26 48 C22 48 22 58 18 58 C14 58 14 50 14 48 Z" fill="url(#bm4b)" stroke="#B8467A" stroke-width="3" stroke-linejoin="round"/>'+
  '<ellipse cx="38" cy="40" rx="14" ry="3" fill="#fff" opacity=".5"/>'+
  '<g stroke="#7A1614" stroke-width="2"><path d="M28 40 C24 30 32 24 36 30 C40 24 46 32 40 40 Z" fill="url(#bm4c)"/><path d="M46 36 C42 24 52 20 55 26 C58 20 66 26 60 36 Z" fill="url(#bm4c)"/><path d="M64 40 C60 30 68 24 72 30 C76 24 82 32 76 40 Z" fill="url(#bm4c)"/></g>'+
  '<g fill="#5DB04E"><path d="M32 29 l-4 -4 h8 Z"/><path d="M51 25 l-4 -4 h8 Z"/><path d="M68 29 l-4 -4 h8 Z"/></g>',
  /* celebration cake: three tiers on a gold stand, candles and stars */
  '<defs><linearGradient id="bm5a" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFE9F2"/><stop offset=".5" stop-color="#F7A8C8"/><stop offset="1" stop-color="#D2628C"/></linearGradient>'+
  '<linearGradient id="bm5b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#F6EEF8"/><stop offset="1" stop-color="#CFC0DC"/></linearGradient>'+
  '<linearGradient id="bm5c" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E9E0FF"/><stop offset=".5" stop-color="#BBA6F2"/><stop offset="1" stop-color="#8A70CC"/></linearGradient>'+
  '<linearGradient id="bm5d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9A0"/><stop offset=".5" stop-color="#F2C24A"/><stop offset="1" stop-color="#B8861E"/></linearGradient></defs>'+
  '<path d="M18 90 H82 L76 84 H24 Z" fill="url(#bm5d)" stroke="#8A6414" stroke-width="2.5" stroke-linejoin="round"/>'+
  '<rect x="14" y="62" width="72" height="22" rx="6" fill="url(#bm5a)" stroke="#B8467A" stroke-width="2.5"/>'+
  '<rect x="24" y="42" width="52" height="21" rx="6" fill="url(#bm5b)" stroke="#9C88B8" stroke-width="2.5"/>'+
  '<rect x="33" y="24" width="34" height="19" rx="6" fill="url(#bm5c)" stroke="#6A52AC" stroke-width="2.5"/>'+
  '<g fill="#fff"><circle cx="22" cy="72" r="2.6"/><circle cx="36" cy="74" r="2.6"/><circle cx="50" cy="72" r="2.6"/><circle cx="64" cy="74" r="2.6"/><circle cx="78" cy="72" r="2.6"/></g>'+
  '<g fill="#F28CB3"><circle cx="32" cy="52" r="2.4"/><circle cx="44" cy="54" r="2.4"/><circle cx="56" cy="52" r="2.4"/><circle cx="68" cy="54" r="2.4"/></g>'+
  '<g fill="#F8CF4A" stroke="#B8861E" stroke-width="1"><path d="M42 33 l1.6 3.4 3.6 .4 -2.7 2.4 .8 3.6 -3.3 -1.9 -3.3 1.9 .8 -3.6 -2.7 -2.4 3.6 -.4 Z"/><path d="M58 33 l1.6 3.4 3.6 .4 -2.7 2.4 .8 3.6 -3.3 -1.9 -3.3 1.9 .8 -3.6 -2.7 -2.4 3.6 -.4 Z"/></g>'+
  '<g stroke-width="1.5"><rect x="38" y="10" width="5" height="14" rx="2" fill="#7FD3B5" stroke="#3E9A7A"/><rect x="48" y="7" width="5" height="17" rx="2" fill="#F8CF4A" stroke="#B8861E"/><rect x="58" y="10" width="5" height="14" rx="2" fill="#6FB3DE" stroke="#2F72A8"/></g>'+
  '<g fill="#FFB43A" stroke="#E8743A" stroke-width="1"><path d="M40.5 2 C43 5 43 8 40.5 9 C38 8 38 5 40.5 2 Z"/><path d="M50.5 -1 C53 2 53 5 50.5 6 C48 5 48 2 50.5 -1 Z"/><path d="M60.5 2 C63 5 63 8 60.5 9 C58 8 58 5 60.5 2 Z"/></g>'+
  '<rect x="17" y="64" width="20" height="4" rx="2" fill="#fff" opacity=".55"/><rect x="27" y="44" width="14" height="3.5" rx="1.75" fill="#fff" opacity=".7"/>'
];
function bmHowArt(k){
  var mini=function(n,x,y,s){return '<g transform="translate('+x+' '+y+') scale('+s+')">'+BM_ART[n].replace(/id="bm(\d)(\w)"/g,'id="bh'+k+'$1$2"').replace(/url\(#bm(\d)(\w)\)/g,'url(#bh'+k+'$1$2)')+'</g>';};
  var tray='<rect x="2" y="6" width="60" height="52" rx="8" fill="#E9EEF4" stroke="#8C98A8" stroke-width="2.5"/>';
  if(k==='mix') return tray+mini(0,4,16,.26)+mini(0,22,16,.26)+'<path d="M44 26 H50 M47 23 L50 26 L47 29" stroke="#B8467A" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'+mini(1,40,34,.22);
  if(k==='land') return tray+mini(0,18,24,.3)+'<path d="M22 10 V20 M32 8 V18 M42 10 V20" stroke="#B8A27A" stroke-width="2.5" stroke-linecap="round"/><g fill="#fff" stroke="#D9C9A8" stroke-width="1"><circle cx="14" cy="52" r="3.5"/><circle cx="50" cy="52" r="3.5"/><circle cx="20" cy="55" r="2.5"/></g>';
  return tray+mini(5,14,10,.38);
}
/* a little five-point star for sparkles */
function bmStar(c,x,y,r,rot){c.beginPath();for(var k=0;k<10;k++){var a=rot-Math.PI/2+k*Math.PI/5, rr=k%2?r*.45:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.closePath();}
function bmSfx(name,lv){
  if(!mem.sound)return;
  if(name==='lift'){tone(587.33,0,.08,'sine',.07);}
  else if(name==='put'){tone(392,0,.1,'triangle',.06);tone(523.25,.05,.1,'sine',.05);}
  else if(name==='bake'){var f=[523.25,587.33,659.25,783.99,880,1046.5][lv]||1046.5;tone(f,0,.18,'sine',.12);tone(f*1.5,.08,.26,'sine',.08);}
  else if(name==='land'){noiseHit(0,'lowpass',600,.18,.16);tone(196,0,.12,'triangle',.05);}
  else if(name==='no'){tone(247,0,.14,'triangle',.06);}
}
GAMES.crumble={
  name:'Bake and merge',
  intro:function(L){return 'Help Crumble bake for the village party! Drag a bake onto the same bake next to it, and the two bake into the next one up, all the way to a giant celebration cake. After every go, a new bag of flour lands on the tray. Take your time. When the tray is full and nothing can mix, the game ends.';},
  how:[{art:bmHowArt('mix'),text:'Two the same'},{art:bmHowArt('land'),text:'Flour lands'},{art:bmHowArt('big'),text:'Bake big!'}],
  lives:0,
  keys:{ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',' ':'act',Enter:'act'},
  hud:function(n){return String(n);},
  unit:function(n){return n+' bake'+(n===1?'':'s');},
  said:function(n){return n===0?'No bakes made this time.':'You made '+n+' bake'+(n===1?'':'s')+'!';},
  make:function(K){
    var i=K.L-1, RW=BM_SET.tray[i][0], CL=BM_SET.tray[i][1], grid=[], made=0, dead=false, t2=0, endWait=-1;
    var held=null, sel=null, kb=false, cur={r:0,c:0}, sparks=[], ghosts=[], msg=null, cakes=0, cjump=-1;
    var imgs=BM_ART.map(function(a,k){return K.img('bm-'+k,a,'0 0 100 100',120,120);});
    var cr=K.img('bm-crumble',K.F.art(),'0 0 240 320',96,128), bg=gmScene('crumble');
    var flyers=[];   /* celebration cakes on their way to the party table */
    for(var r=0;r<RW;r++){grid.push([]);for(var c=0;c<CL;c++)grid[r].push({k:-1,pop:-1,land:-1,sx:0,sy:0,shake:-1,leave:-1});}
    function cells(){var a=[];for(var r=0;r<RW;r++)for(var c=0;c<CL;c++)a.push({r:r,c:c});return a;}
    function empties(){return cells().filter(function(p){return grid[p.r][p.c].k<0;});}
    function touching(a,b){return !(a.r===b.r&&a.c===b.c)&&Math.abs(a.r-b.r)<=1&&Math.abs(a.c-b.c)<=1;}
    function anyPair(){
      for(var r=0;r<RW;r++)for(var c=0;c<CL;c++){var k=grid[r][c].k;if(k<0||k>=BM_TOP)continue;
        for(var dr=-1;dr<=1;dr++)for(var dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;var o=grid[r+dr]&&grid[r+dr][c+dc];if(o&&o.k===k)return true;}}
      return false;
    }
    /* the start: two touching bags, then two more anywhere */
    (function(){var r0=Math.floor(Math.random()*RW), c0=Math.floor(Math.random()*(CL-1));grid[r0][c0].k=0;grid[r0][c0+1].k=0;
      for(var n=2;n<BM_SET.start;n++){var e=empties();var p=e[Math.floor(Math.random()*e.length)];grid[p.r][p.c].k=0;}})();
    /* ---- layout: wide (bake ladder | tray | Crumble) or tall (tray, then the ladder underneath) ---- */
    function lay(){
      var W=K.W, H=K.H;
      var csA=Math.min(116,(H-56)/RW,(W-40)/(CL+2.3)), csB=Math.min(116,(W-28)/RW,(H-40)/(CL+1.25+1.15));
      var tall=csB>csA*1.08, cs=tall?csB:csA, g={W:W,H:H,cs:cs,tall:tall};
      var tw=(tall?RW:CL)*cs, th=(tall?CL:RW)*cs;
      if(!tall){var tot=cs*.85+18+tw+18+cs*1.2; g.gx=(W-tot)/2+cs*.85+18; g.gy=(H-th)/2+8; g.lx=g.gx-18-cs*.85; g.ly=g.gy; g.lw=cs*.85; g.lh=th; g.crx=g.gx+tw+18; }
      else {g.gx=(W-tw)/2; var tot2=th+16+cs*.95+12+cs; g.gy=Math.max(18,(H-tot2)/2); g.lx=10; g.lw=W-20; g.ly=g.gy+th+16; g.lh=cs*.95;}
      g.tw=tw; g.th=th;
      /* the party table: under Crumble beside the tray, or a long table under the bake ladder on a tall phone */
      if(!tall){g.tbw=cs*1.25; g.tbx=g.crx; g.tby=g.gy+th-cs*.5; g.tbh=cs*.5;}
      else {g.tbx=14; g.tbw=W-28; g.tby=g.ly+g.lh+12+cs*.5; g.tbh=cs*.5;}
      g.cakeS=tall?cs*.62:cs*.56;
      /* where cake number k (0 first) sits on the table: in a row, overlapping when there are lots */
      g.spot=function(k,n){var maxShow=tall?6:3, m=Math.min(Math.max(n,k+1),maxShow), slot=Math.min(k,maxShow-1), usable=tall?g.tbw*.62:g.tbw*.8, step=m>1?Math.min(g.cakeS*(tall?1.05:.6),usable/(m-1)):0, x0=tall?g.tbx+g.cakeS*.7:g.tbx+g.tbw*.1;
        if(!tall)x0=g.tbx+g.tbw/2-step*(m-1)/2; return {x:x0+slot*step,y:g.tby-g.cakeS*.42};};
      g.at=function(r,c){return tall?{x:g.gx+r*cs,y:g.gy+c*cs}:{x:g.gx+c*cs,y:g.gy+r*cs};};
      g.cell=function(x,y){var a=Math.floor((x-g.gx)/cs), b=Math.floor((y-g.gy)/cs), r=tall?a:b, c=tall?b:a;
        return (r>=0&&r<RW&&c>=0&&c<CL)?{r:r,c:c}:null;};
      return g;
    }
    function say(t){msg={text:t,t:0};}
    function landNew(avoid){
      /* not on the square just emptied, unless it's the only one, so a move never looks undone */
      var e=empties(), e2=e.filter(function(p){return !(avoid&&p.r===avoid.r&&p.c===avoid.c);}); if(e2.length)e=e2; if(!e.length)return;
      var p=e[Math.floor(Math.random()*e.length)], o=grid[p.r][p.c];
      o.k=Math.random()<BM_SET.dough[i]?1:0; o.land=0; o.pop=-1; o.sx=0; o.sy=0;
    }
    function checkEnd(){
      if(dead)return;
      if(flyers.length||cells().some(function(p){return grid[p.r][p.c].leave>=0;}))return;   /* a cake is leaving, so a square is about to free up */
      if(!empties().length&&!anyPair()){dead=true;endWait=.9;held=null;sel=null;say('The tray is full!');if(mem.sound)tone(330,0,.3,'triangle',.07);}
    }
    /* move or bake the bake at a onto square b; ox/oy is where it was let go, for a smooth slide */
    function act(a,b,ox,oy){
      var A=grid[a.r][a.c], B=grid[b.r][b.c], g=lay(), pa=g.at(a.r,a.c), pb=g.at(b.r,b.c);
      if(a.r===b.r&&a.c===b.c)return false;
      if(B.k<0){
        B.k=A.k; A.k=-1; B.sx=(ox!=null?ox:pa.x)-pb.x; B.sy=(oy!=null?oy:pa.y)-pb.y; B.pop=-1; B.land=-1;
        bmSfx('put'); landNew(a); checkEnd(); return true;
      }
      if(B.k===A.k&&A.k<BM_TOP&&touching(a,b)){
        ghosts.push({k:A.k,x:ox!=null?ox:pa.x,y:oy!=null?oy:pa.y,tx:pb.x,ty:pb.y,t:0});
        A.k=-1; B.k++; B.pop=0; B.land=-1; made++; K.score(made); bmSfx('bake',B.k);
        var n=B.k===BM_TOP?28:12;
        for(var s=0;s<n;s++){var an=Math.random()*Math.PI*2, v=60+Math.random()*(B.k===BM_TOP?220:120);
          sparks.push({x:pb.x+g.cs/2,y:pb.y+g.cs/2,vx:Math.cos(an)*v,vy:Math.sin(an)*v-40,t:0,c:pick(['#F8CF4A','#F28CB3','#FFFFFF','#A9D8F5','#B5EBD9']),s:2+Math.random()*3});}
        if(B.k===BM_TOP){B.leave=0;fanfare();say(pick(['A celebration cake!','Hooray, a giant cake!','Party time!']));}
        landNew(a); checkEnd(); return true;
      }
      B.shake=0; bmSfx('no');
      if(B.k===A.k&&A.k<BM_TOP)say('Bakes need to touch to mix.');
      else if(B.k===BM_TOP)say('That cake is for the party!');
      else say('Only two the same can mix.');
      return false;
    }
    function movable(p){var k=grid[p.r][p.c].k;return k>=0&&k<BM_TOP;}
    /* ---- drawing ---- */
    function drawBake(c,k,x,y,s,a){
      var im=imgs[k]; if(!gmReady(im))return;
      if(a!=null){c.save();c.globalAlpha=a;}
      c.drawImage(im,x-s/2,y-s/2,s,s);
      if(a!=null)c.restore();
    }
    function drawLadder(c,g){
      var cs=g.cs, n=6;
      c.save(); c.fillStyle='rgba(255,255,255,.82)'; gmRound(c,g.lx,g.ly,g.lw,g.lh,cs*.2); c.fill(); c.strokeStyle='#E9CCD6'; c.lineWidth=2; c.stroke(); c.restore();
      var best=-1; for(var r=0;r<RW;r++)for(var cc=0;cc<CL;cc++)best=Math.max(best,grid[r][cc].k);
      for(var k=0;k<n;k++){
        var s, x, y;
        if(!g.tall){s=Math.min(g.lw*.78,(g.lh-10)/n*.8); x=g.lx+g.lw/2; y=g.ly+(g.lh/n)*(k+.5);}
        else {s=Math.min(g.lh*.72,(g.lw-10)/n*.78); x=g.lx+(g.lw/n)*(k+.5); y=g.ly+g.lh/2;}
        if(k<=best){c.save();c.globalAlpha=.55;c.fillStyle='#FFF2C4';c.beginPath();c.arc(x,y,s*.62,0,Math.PI*2);c.fill();c.restore();}
        drawBake(c,k,x,y,s,k<=best?1:.75);
        if(k<n-1){
          c.save(); c.strokeStyle='#C88A9E'; c.lineWidth=2.5; c.lineCap='round'; c.lineJoin='round'; c.beginPath();
          if(!g.tall){var yy=g.ly+(g.lh/n)*(k+1); c.moveTo(x,yy-4); c.lineTo(x,yy+4); c.moveTo(x-4,yy+1); c.lineTo(x,yy+5); c.lineTo(x+4,yy+1);}
          else {var xx=g.lx+(g.lw/n)*(k+1); c.moveTo(xx-4,y); c.lineTo(xx+4,y); c.moveTo(xx+1,y-4); c.lineTo(xx+5,y); c.lineTo(xx+1,y+4);}
          c.stroke(); c.restore();
        }
      }
    }
    /* the party table: a pink cloth with a scalloped edge, the cakes on top and how many there are */
    function drawTable(c,g){
      var x=g.tbx, y=g.tby, w=g.tbw, h=g.tbh, legH=g.tall?0:g.cs*.2;
      if(!g.tall&&x+w>g.W+2)return;
      gmShadow(c,x+w/2,y+h+legH+4,w*.46,6,.18);
      if(legH){c.fillStyle='#A8763E';c.fillRect(x+w*.14,y+h-4,6,legH+4);c.fillRect(x+w*.86-6,y+h-4,6,legH+4);}
      var cl=c.createLinearGradient(0,y,0,y+h); cl.addColorStop(0,'#FFE3EE'); cl.addColorStop(1,'#F4A9C6');
      c.fillStyle=cl; c.beginPath(); c.moveTo(x,y);c.lineTo(x+w,y);c.lineTo(x+w,y+h*.8);
      var sc=Math.max(4,Math.round(w/26)); for(var q=sc;q>0;q--){var x1=x+w*q/sc, x0=x+w*(q-1)/sc;c.quadraticCurveTo((x0+x1)/2,y+h*1.15,x0,y+h*.8);}
      c.closePath(); c.fill(); c.strokeStyle='#C8628E'; c.lineWidth=2; c.stroke();
      c.fillStyle='#FFF6FA'; gmRound(c,x-4,y-7,w+8,10,5); c.fill(); c.strokeStyle='#E9B3C9'; c.lineWidth=1.5; c.stroke();
      var show=Math.min(cakes,g.tall?6:3);
      for(var k=0;k<show;k++){var sp=g.spot(k,cakes);drawBake(c,BM_TOP,sp.x,sp.y,g.cakeS);}
      if(!cakes){c.save();c.globalAlpha=.55;c.font='600 '+Math.round(Math.max(13,g.cs*.16))+'px Fredoka, Trebuchet MS, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#B8467A';c.fillText(g.tall?'Party table: celebration cakes go here':'Party table',x+w/2,y-g.cs*.2);c.restore();}
      else {var big=Math.max(18,Math.min(30,g.cs*.3));
        if(g.tall)gmText(c,'× '+cakes,x+w-big*1.6,y-g.cakeS*.42,big,'#B8467A');
        else gmText(c,'× '+cakes,x+w/2,y+h*.45,big,'#B8467A');}
    }
    return {
      peek:function(){return {grid:grid,made:made,dead:dead,held:held,sel:sel,lay:lay(),RW:RW,CL:CL,act:act,cakes:cakes,flyers:flyers};},   /* for testing */
      input:function(n,down){
        if(!down||dead)return; kb=true;
        var g=lay(), dr=0, dc=0;
        if(n==='left'){if(g.tall)dr=-1;else dc=-1;} if(n==='right'){if(g.tall)dr=1;else dc=1;}
        if(n==='up'){if(g.tall)dc=-1;else dr=-1;} if(n==='down'){if(g.tall)dc=1;else dr=1;}
        cur.r=Math.max(0,Math.min(RW-1,cur.r+dr)); cur.c=Math.max(0,Math.min(CL-1,cur.c+dc));
        if(n==='act'){
          if(sel&&sel.r===cur.r&&sel.c===cur.c){sel=null;return;}
          /* with a bake picked up: an empty square or a matching bake gets it; another bake is picked instead */
          if(sel&&(!movable(cur)||grid[cur.r][cur.c].k===grid[sel.r][sel.c].k)){if(act(sel,cur))sel=null;return;}
          if(movable(cur)){sel={r:cur.r,c:cur.c};bmSfx('lift');}
        }
      },
      pointer:function(t,x,y){
        if(dead)return;
        var g=lay(), cell=g.cell(x,y);
        if(t==='down'){
          kb=false;
          if(cell&&movable(cell)){var p=g.at(cell.r,cell.c);held={from:cell,ox:x-p.x,oy:y-p.y,x:x,y:y,sx:x,sy:y,drag:false};}
          else if(sel&&cell){if(act(sel,cell))sel=null;}
          else sel=null;
          return;
        }
        if(!held)return;
        if(t==='move'){held.x=x;held.y=y;if(!held.drag&&Math.hypot(x-held.sx,y-held.sy)>g.cs*.12){held.drag=true;bmSfx('lift');}return;}
        if(t==='up'){
          var h=held; held=null;
          if(!h.drag){
            /* a tap: pick this bake, or use it as the place for the one already picked */
            if(sel&&sel.r===h.from.r&&sel.c===h.from.c){sel=null;return;}
            if(sel&&grid[h.from.r][h.from.c].k===grid[sel.r][sel.c].k){if(act(sel,h.from))sel=null;return;}
            sel=h.from; bmSfx('lift'); return;
          }
          sel=null;
          var to=g.cell(x,y);
          if(to&&!(to.r===h.from.r&&to.c===h.from.c)){act(h.from,to,x-h.ox,y-h.oy);}
          else {var o=grid[h.from.r][h.from.c], p0=g.at(h.from.r,h.from.c); o.sx=(x-h.ox)-p0.x; o.sy=(y-h.oy)-p0.y;}
        }
      },
      update:function(dt){
        t2+=dt;
        for(var r=0;r<RW;r++)for(var c=0;c<CL;c++){var o=grid[r][c];
          if(o.pop>=0){o.pop+=dt;if(o.pop>.45)o.pop=-1;}
          if(o.land>=0){var was=o.land;o.land+=dt;if(was<.32&&o.land>=.32)bmSfx('land');if(o.land>.5)o.land=-1;}
          if(o.shake>=0){o.shake+=dt;if(o.shake>.4)o.shake=-1;}
          /* a new celebration cake shows off for a moment, then is carried to the party table */
          if(o.leave>=0){o.leave+=dt;if(o.leave>.8){var gl=lay(), pl=gl.at(r,c);flyers.push({x:pl.x+gl.cs/2,y:pl.y+gl.cs/2,t:0});o.k=-1;o.leave=-1;o.pop=-1;}}
          var f=Math.pow(.0005,dt); o.sx*=f; o.sy*=f; if(Math.abs(o.sx)<.3)o.sx=0; if(Math.abs(o.sy)<.3)o.sy=0;}
        for(var g1=ghosts.length-1;g1>=0;g1--){ghosts[g1].t+=dt;if(ghosts[g1].t>.16)ghosts.splice(g1,1);}
        for(var s=sparks.length-1;s>=0;s--){var p=sparks[s];p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=260*dt;if(p.t>1)sparks.splice(s,1);}
        if(msg){msg.t+=dt;if(msg.t>2.2)msg=null;}
        if(cjump>=0){cjump+=dt;if(cjump>1.4)cjump=-1;}
        for(var f1=flyers.length-1;f1>=0;f1--){flyers[f1].t+=dt;if(flyers[f1].t>=.75){flyers.splice(f1,1);cakes++;cjump=0;bmSfx('put');
          var gs=lay(), sp=gs.spot(cakes-1,cakes);for(var s2=0;s2<14;s2++){var an2=Math.random()*Math.PI*2,v2=50+Math.random()*110;sparks.push({x:sp.x,y:sp.y,vx:Math.cos(an2)*v2,vy:Math.sin(an2)*v2-50,t:0,c:pick(['#F8CF4A','#F28CB3','#FFFFFF','#B5EBD9']),s:2+Math.random()*2.5});}
          checkEnd();}}
        if(dead&&endWait>0){endWait-=dt;if(endWait<=0)K.end();}
      },
      draw:function(c){
        var g=lay(), W=g.W, H=g.H, cs=g.cs;
        if(!gmCover(c,bg,W,H)){c.fillStyle='#FCE3E3';c.fillRect(0,0,W,H);}
        c.fillStyle='rgba(255,255,255,.4)'; c.fillRect(0,0,W,H);
        /* the baking tray: a silver rim and a soft pink lining */
        c.save(); c.shadowColor='rgba(59,42,74,.28)'; c.shadowOffsetY=6; c.shadowBlur=10;
        var rim=c.createLinearGradient(g.gx,g.gy-12,g.gx,g.gy+g.th+12); rim.addColorStop(0,'#F4F7FA'); rim.addColorStop(.5,'#C9D2DC'); rim.addColorStop(1,'#8C98A8');
        c.fillStyle=rim; gmRound(c,g.gx-12,g.gy-12,g.tw+24,g.th+24,cs*.22); c.fill(); c.restore();
        c.strokeStyle='#6E7A8A'; c.lineWidth=2.5; gmRound(c,g.gx-12,g.gy-12,g.tw+24,g.th+24,cs*.22); c.stroke();
        c.fillStyle='#E4E9F0'; gmRound(c,g.gx-3,g.gy-3,g.tw+6,g.th+6,cs*.15); c.fill();
        var holdingK=held&&held.drag?grid[held.from.r][held.from.c].k:sel?grid[sel.r][sel.c].k:-1, from=held&&held.drag?held.from:sel;
        for(var r=0;r<RW;r++)for(var cc=0;cc<CL;cc++){
          var p=g.at(r,cc);
          c.fillStyle=(r+cc)%2?'#FFF6F8':'#FFFFFF'; gmRound(c,p.x+3,p.y+3,cs-6,cs-6,cs*.16); c.fill();
          c.strokeStyle='#F0D4DE'; c.lineWidth=1.5; c.stroke();
          /* while a bake is held, the matching bakes it can mix with glow softly */
          var o=grid[r][cc];
          if(holdingK>=0&&holdingK<BM_TOP&&o.k===holdingK&&from&&touching(from,{r:r,c:cc})){
            c.save(); c.globalAlpha=.55+Math.sin(t2*6)*.2; c.fillStyle='#FFE58A'; gmRound(c,p.x+4,p.y+4,cs-8,cs-8,cs*.16); c.fill(); c.restore();
          }
        }
        /* the bakes */
        for(var r2=0;r2<RW;r2++)for(var c2=0;c2<CL;c2++){
          var o2=grid[r2][c2]; if(o2.k<0)continue;
          if(held&&held.drag&&held.from.r===r2&&held.from.c===c2)continue;
          var p2=g.at(r2,c2), x=p2.x+cs/2+o2.sx, y=p2.y+cs/2+o2.sy, s=cs*(o2.k===BM_TOP?.94:.82);
          if(o2.shake>=0)x+=Math.sin(o2.shake*40)*4*(1-o2.shake/.4);
          if(o2.pop>=0){var k1=o2.pop/.45; s*=1+.35*Math.sin(k1*Math.PI)*(1-k1*.4);}
          if(o2.land>=0){var k2=Math.min(1,o2.land/.32); y-=(1-k2)*(1-k2)*cs*1.2; if(k2>=1){var b=(o2.land-.32)/.18; s*=1+.08*Math.sin(b*Math.PI);}
            if(k2>=1&&o2.land<.5){c.save();c.globalAlpha=.5*(1-(o2.land-.32)/.18);c.fillStyle='#FFFFFF';c.beginPath();c.ellipse(p2.x+cs/2,p2.y+cs*.86,cs*.42,cs*.1,0,0,Math.PI*2);c.fill();c.restore();}}
          if(sel&&sel.r===r2&&sel.c===c2){s*=1.06+Math.sin(t2*5)*.03; c.save(); c.strokeStyle='#B8467A'; c.lineWidth=4; gmRound(c,p2.x+5,p2.y+5,cs-10,cs-10,cs*.15); c.stroke(); c.restore();}
          if(o2.k===BM_TOP){c.save();c.globalAlpha=.5+Math.sin(t2*3+r2+c2)*.3;c.fillStyle='#F8CF4A';var tx=p2.x+cs*.86,ty=p2.y+cs*.16;bmStar(c,tx,ty,cs*.08,t2);c.fill();c.restore();}
          drawBake(c,o2.k,x,y,s);
        }
        ghosts.forEach(function(o){var k=o.t/.16, x=o.x+(o.tx-o.x)*k+cs/2, y=o.y+(o.ty-o.y)*k+cs/2;drawBake(c,o.k,x,y,cs*.82*(1-k*.5),1-k*.6);});
        if(kb&&!dead){var q=g.at(cur.r,cur.c);c.save();c.strokeStyle=sel?'#3E7FB0':'#B8467A';c.lineWidth=4;c.setLineDash([10,6]);c.lineDashOffset=-t2*20;gmRound(c,q.x+4,q.y+4,cs-8,cs-8,cs*.14);c.stroke();c.restore();}
        /* a bake being dragged floats a little above the tray */
        if(held&&held.drag){var hk=grid[held.from.r][held.from.c].k;gmShadow(c,held.x-held.ox+cs/2,held.y-held.oy+cs*.92,cs*.3,cs*.07,.25);drawBake(c,hk,held.x-held.ox+cs/2,held.y-held.oy+cs/2-6,cs*.92);}
        sparks.forEach(function(p){c.save();c.globalAlpha=Math.max(0,1-p.t);c.fillStyle=p.c;bmStar(c,p.x,p.y,p.s*1.6,p.t*4);c.fill();c.restore();});
        drawLadder(c,g);
        /* Crumble floats above her party table beside the tray (wide screens) */
        if(!g.tall&&gmReady(cr)){var cw=Math.min(cs*1.15,110), ch=cw*4/3, bob=Math.sin(t2*2)*3, jump=cjump>=0?Math.abs(Math.sin(cjump*9))*16*(1-cjump/1.4):0;
          if(g.crx+cw<W+4)c.drawImage(cr,g.crx+(g.tbw-cw)/2,g.tby-g.cakeS*.9-ch+bob-jump,cw,ch);}
        drawTable(c,g);
        /* cakes flying from the tray to the table in a little arc */
        flyers.forEach(function(f){var k=Math.min(1,f.t/.75), e=k*k*(3-2*k), to=g.spot(cakes,cakes+1), x=f.x+(to.x-f.x)*e, y=f.y+(to.y-f.y)*e-Math.sin(k*Math.PI)*cs*.9, sz=cs*.94+(g.cakeS-cs*.94)*e;drawBake(c,BM_TOP,x,y,sz);});
        if(msg){var a=msg.t<.2?msg.t/.2:msg.t>1.8?Math.max(0,(2.2-msg.t)/.4):1, fs=Math.max(18,Math.min(28,cs*.28)), my=g.gy-24;
          if(my<18)my=g.gy+g.th/2;
          c.save(); c.globalAlpha=a; c.font='600 '+fs+'px Fredoka, Trebuchet MS, sans-serif'; var tw=c.measureText(msg.text).width+fs*1.4, mx=g.gx+g.tw/2;
          c.fillStyle='rgba(255,255,255,.96)'; gmRound(c,mx-tw/2,my-fs*.85,tw,fs*1.7,fs*.85); c.fill(); c.strokeStyle='#E9CCD6'; c.lineWidth=2; c.stroke();
          c.fillStyle='#B8467A'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(msg.text,mx,my+1); c.restore();}
      }
    };
  }
};
