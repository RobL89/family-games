/* Jingle, the Music fairy: her art, bluebell house, bluebell hill, band jigsaw picture, pictures, facts,
   puzzles (copy the bells, rhythm, high or low, rhymes, band jigsaw) and her FAIRIES entry.
   The bell, drum, clap and shaker sounds themselves are in core.js. */
'use strict';
/* her gradients (added to the shared defs; any fairy can use them) */
addDefs(
'<radialGradient id="jgDress" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#E6E4FF"/><stop offset=".55" stop-color="#8E97EC"/><stop offset="1" stop-color="#4F57B8"/></radialGradient>' +
'<radialGradient id="jgWing" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".6" stop-color="#D5D2FA" stop-opacity=".75"/><stop offset="1" stop-color="#8E8AE0" stop-opacity=".9"/></radialGradient>' +
'<linearGradient id="jgLegs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9AA0EC"/><stop offset="1" stop-color="#4F57B8"/></linearGradient>' +
'<radialGradient id="bbG" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#D8DCFF"/><stop offset=".5" stop-color="#8790E6"/><stop offset="1" stop-color="#4B52AE"/></radialGradient>' +
'<linearGradient id="bbRim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9AFF5"/><stop offset="1" stop-color="#5E66C6"/></linearGradient>'
);
/* ---------- Jingle, the Music fairy ---------- */
function jingleArt(noShadow){
  var skin='url(#skinC)', flat='#CF9670';
  return (noShadow?'':'<ellipse cx="120" cy="308" rx="44" ry="7" fill="#4F57B8" opacity=".22" filter="url(#fshadow)"/>') +
  '<g class="wings">' +
  '<path d="M112 150 C86 96 36 98 38 132 C40 164 88 168 112 158 Z" fill="url(#jgWing)" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '<path d="M112 166 C84 172 60 198 72 218 C86 236 112 202 116 174 Z" fill="url(#jgWing)" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '<path d="M128 150 C154 96 204 98 202 132 C200 164 152 168 128 158 Z" fill="url(#jgWing)" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '<path d="M128 166 C156 172 180 198 168 218 C154 236 128 202 124 174 Z" fill="url(#jgWing)" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '<path d="M112 152 C92 130 68 120 50 124 M112 156 C92 152 70 150 52 146 M114 172 C100 186 88 200 80 212 M128 152 C148 130 172 120 190 124 M128 156 C148 152 170 150 188 146 M126 172 C140 186 152 200 160 212" stroke="#fff" stroke-width="1" fill="none" opacity=".6"/>' +
  '</g>' +
  '<rect x="106" y="228" width="11" height="38" rx="5.5" fill="url(#jgLegs)"/><rect x="123" y="228" width="11" height="38" rx="5.5" fill="url(#jgLegs)"/>' +
  '<path d="M101 260 H118 V270 C118 276 112 279 104 279 C97 279 95 271 101 260 Z" fill="url(#ggold)"/>' +
  '<path d="M122 260 H139 C145 271 143 279 136 279 C128 279 122 276 122 270 Z" fill="url(#ggold)"/>' +
  /* bluebell skirt with curled petal tips */
  '<path d="M104 152 C100 152 98 160 98 170 C88 186 80 210 76 232 L86 226 L92 238 L102 230 L110 242 L120 232 L130 242 L138 230 L148 238 L154 226 L164 232 C160 210 152 186 142 170 C142 160 140 152 136 152 Z" fill="url(#jgDress)"/>' +
  '<path d="M104 182 C100 200 98 214 98 228 M120 184 V232 M136 182 C140 200 142 214 142 228" stroke="#fff" stroke-width="1.6" fill="none" opacity=".35"/>' +
  '<ellipse cx="102" cy="202" rx="7" ry="22" fill="#fff" opacity=".22" filter="url(#fsoft)"/>' +
  '<path d="M99 172 Q120 180 141 172 L142 180 Q120 188 98 180 Z" fill="url(#ptleaf)"/>' +
  '<path d="M104 164 C94 176 90 188 88 198" stroke="'+flat+'" stroke-width="10" fill="none" stroke-linecap="round"/>' +
  '<circle cx="88" cy="200" r="6" fill="'+skin+'"/>' +
  /* raised arm with a little hand bell */
  '<g class="arm"><path d="M136 164 C150 158 158 148 162 138" stroke="'+flat+'" stroke-width="10" fill="none" stroke-linecap="round"/>' +
  '<path d="M164 136 L172 120" stroke="#7A4E2A" stroke-width="4" stroke-linecap="round"/>' +
  '<circle cx="163" cy="136" r="6" fill="'+skin+'"/>' +
  '<path d="M164 118 C164 104 170 96 178 96 C186 96 192 104 192 118 L196 122 H160 Z" fill="url(#ggold)" stroke="#B8861E" stroke-width="1.5" stroke-linejoin="round"/>' +
  '<circle cx="178" cy="125" r="3" fill="#B8861E"/></g>' +
  '<rect x="114" y="138" width="12" height="16" rx="4" fill="#BC8260"/>' +
  /* blonde hair in two buns */
  '<g fill="url(#hairBlonde)"><circle cx="82" cy="70" r="17"/><circle cx="158" cy="70" r="17"/></g>' +
  '<path d="M74 110 C70 64 98 54 120 54 C142 54 170 64 166 110 C166 128 160 138 152 140 L88 140 C80 138 74 128 74 110 Z" fill="url(#hairBlonde)"/>' +
  '<circle cx="120" cy="108" r="40" fill="'+skin+'"/>' +
  '<path d="M80 104 C78 70 100 58 120 58 C140 58 162 70 160 104 C152 90 140 84 132 92 C126 82 112 82 108 92 C100 84 88 88 80 104 Z" fill="url(#hairBlonde)"/>' +
  '<path d="M98 70 C108 64 124 63 136 68" stroke="#fff" stroke-width="4" opacity=".35" stroke-linecap="round" fill="none"/>' +
  /* music note clip */
  '<g transform="translate(148 76) rotate(14)"><ellipse cx="0" cy="8" rx="5" ry="4" fill="#4F57B8"/><path d="M4 8 V-8 L12 -5" stroke="#4F57B8" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>' +
  '<path d="M99 102 Q105 98 111 101 M129 101 Q135 98 141 102" stroke="#5E3A22" stroke-width="2" fill="none" stroke-linecap="round"/>' +
  '<ellipse cx="106" cy="115" rx="5.5" ry="7" fill="#2A1E1A"/><ellipse cx="134" cy="115" rx="5.5" ry="7" fill="#2A1E1A"/>' +
  '<circle cx="108" cy="112" r="2" fill="#fff"/><circle cx="136" cy="112" r="2" fill="#fff"/>' +
  '<ellipse cx="95" cy="127" rx="7" ry="4.5" fill="#F28CB3" opacity=".4"/><ellipse cx="145" cy="127" rx="7" ry="4.5" fill="#F28CB3" opacity=".4"/>' +
  '<path d="M112 127 Q120 136 128 127 Q120 131 112 127 Z" fill="#7A3428" stroke="#7A3428" stroke-width="2" stroke-linejoin="round"/>';
}
/* ---------- houses ---------- */
function smallBell(x,y,k){
  return '<g class="hb" style="transform-origin:'+x+'px '+y+'px"><path d="M'+x+' '+y+' V'+(y+8*k)+'" stroke="#4E9F45" stroke-width="2"/>' +
    '<path d="M'+(x-8*k)+' '+(y+24*k)+' C'+(x-8*k)+' '+(y+12*k)+' '+(x-5*k)+' '+(y+8*k)+' '+x+' '+(y+8*k)+' C'+(x+5*k)+' '+(y+8*k)+' '+(x+8*k)+' '+(y+12*k)+' '+(x+8*k)+' '+(y+24*k)+' L'+(x+11*k)+' '+(y+28*k)+' L'+(x+5*k)+' '+(y+26*k)+' L'+x+' '+(y+29*k)+' L'+(x-5*k)+' '+(y+26*k)+' L'+(x-11*k)+' '+(y+28*k)+' Z" fill="url(#bbG)" stroke="#4B52AE" stroke-width="1"/></g>';
}
function bluebellBody(){
  var s='';
  s+='<path d="M24 182 C30 150 40 130 56 118 C50 140 44 160 40 182 Z M196 182 C192 156 184 138 170 128 C176 148 180 164 182 182 Z" fill="url(#ptleaf)"/>';
  /* arching stem over the house with two little bells */
  s+='<path d="M184 182 C200 120 192 40 152 20 C132 10 112 18 110 52" stroke="#2F6B2C" stroke-width="9" fill="none" stroke-linecap="round"/>' +
    '<path d="M184 182 C200 120 192 40 152 20 C132 10 112 18 110 52" stroke="#5FA34D" stroke-width="5" fill="none" stroke-linecap="round"/>';
  s+=smallBell(176,46,1)+smallBell(190,84,.9);
  /* the big bell */
  s+='<path d="M70 166 C68 122 72 82 88 64 C98 52 122 52 132 64 C148 82 152 122 150 166 Z" fill="url(#bbG)"/>' +
    '<path d="M110 56 V164 M92 68 C82 96 80 130 82 164 M128 68 C138 96 140 130 138 164" stroke="#4B52AE" stroke-width="1.5" fill="none" opacity=".35"/>' +
    '<ellipse cx="88" cy="96" rx="7" ry="24" fill="#fff" opacity=".3" filter="url(#fsoft)"/>' +
    '<path d="M44 178 L58 156 L70 166 L82 152 L96 166 L110 150 L124 166 L138 152 L150 166 L162 156 L176 178 C150 188 70 188 44 178 Z" fill="url(#bbRim)" stroke="#4B52AE" stroke-width="1.5" stroke-linejoin="round"/>' +
    /* windows and door */
    '<circle cx="96" cy="104" r="9" fill="#4B52AE"/><circle cx="96" cy="104" r="6.5" fill="url(#gglass)"/>' +
    '<circle cx="124" cy="104" r="9" fill="#4B52AE"/><circle cx="124" cy="104" r="6.5" fill="url(#gglass)"/>' +
    '<path d="M98 182 V158 A12 12 0 0 1 122 158 V182 Z" fill="#3A2A5A"/><path d="M101 182 V159 A9 9 0 0 1 119 159 V182 Z" fill="url(#gdoorgold)"/><circle cx="115" cy="172" r="1.8" fill="#4B52AE"/>' +
    /* notes painted on the bell */
    '<g fill="#fff" opacity=".8"><ellipse cx="104" cy="134" rx="4" ry="3"/><path d="M107 134 V122" stroke="#fff" stroke-width="2"/><ellipse cx="120" cy="138" rx="4" ry="3"/><path d="M123 138 V126 L107 122" stroke="#fff" stroke-width="2" fill="none"/></g>';
  return s;
}
/* ---------- Jingle's world: bluebell hill ---------- */
function bluebellStem(x,y,k,flip){
  var d=flip?-1:1, s='<g transform="translate('+x+' '+y+') scale('+(k*d)+' '+k+')">';
  s+='<path d="M0 0 C0 -60 10 -110 40 -130" stroke="#4E9140" stroke-width="5" fill="none" stroke-linecap="round"/>';
  [[8,-50],[16,-80],[28,-108],[42,-128]].forEach(function(p,i){
    s+='<path d="M'+p[0]+' '+p[1]+' q8 2 10 12" stroke="#4E9140" stroke-width="2.5" fill="none"/>';
    s+='<path d="M'+(p[0]+2)+' '+(p[1]+28)+' C'+(p[0]+2)+' '+(p[1]+16)+' '+(p[0]+6)+' '+(p[1]+12)+' '+(p[0]+10)+' '+(p[1]+12)+' C'+(p[0]+14)+' '+(p[1]+12)+' '+(p[0]+18)+' '+(p[1]+16)+' '+(p[0]+18)+' '+(p[1]+28)+' L'+(p[0]+21)+' '+(p[1]+32)+' L'+(p[0]+14)+' '+(p[1]+30)+' L'+(p[0]+10)+' '+(p[1]+33)+' L'+(p[0]+6)+' '+(p[1]+30)+' L'+(p[0]-1)+' '+(p[1]+32)+' Z" fill="'+(i%2?'#7E86E0':'#6A72D2')+'"/>';
  });
  return s+'<path d="M-4 0 C-10 -30 -24 -50 -34 -60 C-20 -46 -10 -26 4 0 Z" fill="#6DBE5A"/></g>';
}
function bluebellScene(){
  function ri(i,a){var x=Math.sin(i*12.9898+a*78.233)*43758.5453;return x-Math.floor(x);}
  var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMax slice"><defs>' +
  '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9C6F2"/><stop offset=".55" stop-color="#F4E3F0"/><stop offset="1" stop-color="#FCEFD9"/></linearGradient>' +
  '<linearGradient id="h1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9D8A6"/><stop offset="1" stop-color="#9CC48A"/></linearGradient>' +
  '<linearGradient id="h2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9DCB7E"/><stop offset="1" stop-color="#6FAA5A"/></linearGradient>' +
  '<linearGradient id="carpet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9AA0E8"/><stop offset="1" stop-color="#6E76D6"/></linearGradient>' +
  '<linearGradient id="beech" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D9D5DE"/><stop offset=".5" stop-color="#B3ADBC"/><stop offset="1" stop-color="#857E92"/></linearGradient>' +
  '<radialGradient id="leafy" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#D5F0A8"/><stop offset="1" stop-color="#86C462"/></radialGradient>' +
  '<filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>' +
  '</defs>';
  s+='<rect width="1200" height="900" fill="url(#sky)"/><circle cx="300" cy="180" r="70" fill="#FFF3D6" opacity=".9"/>';
  s+='<path d="M0 500 C200 420 420 440 600 470 C800 420 1000 430 1200 480 V700 H0 Z" fill="url(#h1)"/>';
  s+='<path d="M0 560 C260 500 520 520 760 540 C960 520 1100 530 1200 550 V900 H0 Z" fill="url(#h2)"/>';
  s+='<path d="M0 640 C300 580 700 600 1200 620 V900 H0 Z" fill="url(#carpet)" opacity=".85"/>';
  for(var i=0;i<420;i++){var x=ri(i,1)*1200, y=600+ri(i,2)*300; if(y<640-(x/1200)*20)continue; s+='<ellipse cx="'+f2(x)+'" cy="'+f2(y)+'" rx="'+f2(2+ri(i,3)*3*(y-560)/200)+'" ry="'+f2(3+ri(i,4)*3*(y-560)/200)+'" fill="'+(ri(i,5)<.5?'#5960C4':'#A6ACF0')+'" opacity=".85"/>';}
  /* slim beech trees */
  [[180,.9],[330,.6],[860,.65],[1030,.95]].forEach(function(t){
    var x=t[0],q=t[1];
    s+='<path d="M'+f2(x-14*q)+' 660 C'+f2(x-12*q)+' 460 '+f2(x-8*q)+' 300 '+f2(x-6*q)+' 120 H'+f2(x+6*q)+' C'+f2(x+8*q)+' 300 '+f2(x+12*q)+' 460 '+f2(x+14*q)+' 660 Z" fill="url(#beech)"/>';
    [[0,120,110],[-80,170,80],[80,160,90],[-40,60,70],[50,70,70]].forEach(function(c){s+='<circle cx="'+f2(x+c[0]*q)+'" cy="'+f2(c[1]*q+40)+'" r="'+f2(c[2]*q)+'" fill="url(#leafy)" opacity=".92"/>';});
  });
  /* big bluebells framing the sides */
  for(var j=0;j<8;j++){s+=bluebellStem(30+j*36+ri(j,6)*10,900,1.4+ri(j,7)*.5,false);}
  for(var k=0;k<8;k++){s+=bluebellStem(1170-k*36-ri(k,8)*10,900,1.4+ri(k,9)*.5,true);}
  /* floating music notes */
  [[420,300,1],[760,260,.8],[960,360,.9],[260,420,.7],[640,400,.7]].forEach(function(n,i){
    var x=n[0],y=n[1],q=n[2];
    s+='<g transform="translate('+x+' '+y+') scale('+q+') rotate('+(i%2?12:-10)+')" opacity=".75"><ellipse cx="0" cy="0" rx="12" ry="9" fill="#fff"/><path d="M10 0 V-40 '+(i%2?'L34 -32 V8':'')+'" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>'+(i%2?'<ellipse cx="24" cy="8" rx="12" ry="9" fill="#fff"/>':'')+'</g>';
  });
  [[520,560],[700,620],[880,580],[380,620],[600,700],[1000,700]].forEach(function(f,i){s+='<circle cx="'+f[0]+'" cy="'+f[1]+'" r="10" fill="#fff" opacity=".5" filter="url(#bl)"/><circle cx="'+f[0]+'" cy="'+f[1]+'" r="'+(3+i%2)+'" fill="#fff"/>';});
  s+='</svg>';
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
}
/* the bluebell band jigsaw picture */
function bandPicture(){
  var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">'+allDefs() +
    '<linearGradient id="bsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9B4EE"/><stop offset="1" stop-color="#F8E6EE"/></linearGradient>' +
    '<rect width="600" height="600" fill="url(#bsky)"/><circle cx="500" cy="90" r="44" fill="#FFF3D6"/>' +
    '<path d="M0 360 C150 300 300 320 420 340 C500 320 560 330 600 340 V600 H0 Z" fill="#9DCB7E"/>' +
    '<path d="M0 430 C200 400 400 410 600 430 V600 H0 Z" fill="#7E86E0"/>';
  for(var i=0;i<120;i++){var x=(i*53)%600, y=440+((i*37)%150); s+='<ellipse cx="'+x+'" cy="'+y+'" rx="4" ry="5" fill="'+(i%2?'#5960C4':'#A6ACF0')+'"/>';}
  s+='<g transform="translate(40 150) scale(1.3)">'+houseGround()+bluebellBody()+'</g>';
  /* a frog with a drum */
  s+='<g transform="translate(400 420)"><ellipse cx="0" cy="40" rx="40" ry="12" fill="#2F4A2A" opacity=".2"/><rect x="-36" y="0" width="72" height="40" rx="8" fill="#E8574C" stroke="#9C241C" stroke-width="3"/><ellipse cx="0" cy="0" rx="36" ry="10" fill="#FFF8EE" stroke="#9C241C" stroke-width="3"/><path d="M-30 6 L-10 36 L10 6 L30 36" stroke="#F8CF5A" stroke-width="3" fill="none"/>' +
    '<g transform="translate(-60 -40) scale(.7)">'+PICS2.frog+'</g><path d="M-14 -24 L6 -6" stroke="#8A5A30" stroke-width="4" stroke-linecap="round"/><circle cx="6" cy="-6" r="4" fill="#F5C842"/></g>';
  /* a singing bird on a stalk */
  s+='<g transform="translate(320 250)"><path d="M0 120 V20" stroke="#4E9140" stroke-width="4"/><ellipse cx="0" cy="10" rx="22" ry="16" fill="#F7A055" stroke="#B8661E" stroke-width="2.5"/><circle cx="16" cy="-4" r="11" fill="#F7A055" stroke="#B8661E" stroke-width="2.5"/><path d="M26 -6 L36 -2 L26 1 Z" fill="#F5C842"/><circle cx="19" cy="-7" r="2" fill="#3B2A4A"/><path d="M-20 6 L-34 0 L-26 14 Z" fill="#B8661E"/></g>';
  [[380,180],[430,150],[470,190]].forEach(function(n,i){s+='<g transform="translate('+n[0]+' '+n[1]+') rotate('+(i%2?10:-10)+')"><ellipse cx="0" cy="0" rx="10" ry="7" fill="#4F57B8"/><path d="M8 0 V-30" stroke="#4F57B8" stroke-width="4" stroke-linecap="round"/></g>';});
  s+=bluebellStem(560,600,1.2,true)+bluebellStem(520,600,1,true);
  s+='</svg>';
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
}
var BELL_NOTES=[523.25,587.33,659.25,783.99,880];
function houseTune(){ if(!mem.sound)return; [0,2,4,3,4].forEach(function(n,i){bellTone(BELL_NOTES[n],i*.22,.9,.14);}); }
/* ================= Jingle's bluebell-hill puzzles ================= */
var BELLC=[{c:'#F28CB3',s:'#B8467A',n:'pink'},{c:'#F8CF5A',s:'#B8861E',n:'yellow'},{c:'#7DBDE6',s:'#3E7FB0',n:'blue'},{c:'#B3A4F0',s:'#6C5BC4',n:'purple'},{c:'#7FD3B5',s:'#357A31',n:'green'}];
function bellsSVG(list){
  /* list: [{c,s,label,letter}] */
  var n=list.length, gap=600/(n+1), k=Math.min(1,gap/104);
  var s='<svg class="bellrow" viewBox="0 0 600 230" role="group" aria-label="Bells hanging from a branch">';
  s+='<path d="M0 34 C150 22 450 22 600 36" stroke="#6A3F20" stroke-width="12" fill="none" stroke-linecap="round"/>';
  s+='<path d="M80 30 C70 14 54 14 48 20 C56 30 70 32 80 30 Z M330 26 C340 10 356 10 362 16 C354 26 340 28 330 26 Z M520 30 C530 14 546 14 552 20 C544 30 530 32 520 30 Z" fill="url(#ptleaf)"/>';
  list.forEach(function(b,i){
    var x=gap*(i+1);
    s+='<g class="bbell" id="bb-'+i+'" data-i="'+i+'" tabindex="0" role="button" aria-label="'+esc(b.label)+'">';
    s+='<circle class="bglow" cx="'+f2(x)+'" cy="130" r="'+f2(70*k)+'" fill="url(#lampG)"/>';
    s+='<path d="M'+f2(x)+' 36 V60" stroke="#5E4E6C" stroke-width="3"/>';
    s+='<g transform="translate('+f2(x)+' 60) scale('+f2(k)+')"><g class="sw"><rect x="-56" y="0" width="112" height="140" fill="#fff" fill-opacity="0"/>' +
      '<path d="M-40 100 C-40 50 -30 18 0 14 C30 18 40 50 40 100 L50 112 L32 106 L20 116 L8 106 L0 118 L-8 106 L-20 116 L-32 106 L-50 112 Z" fill="'+b.c+'" stroke="'+b.s+'" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M-24 40 C-28 56 -28 74 -26 90" stroke="#fff" stroke-width="6" opacity=".45" fill="none" stroke-linecap="round"/>' +
      '<circle cx="0" cy="124" r="8" fill="'+b.s+'"/><circle cx="0" cy="10" r="6" fill="'+b.s+'"/>' +
      (b.letter?'<text x="0" y="78" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="34" font-weight="600" fill="#fff" stroke="'+b.s+'" stroke-width="3" paint-order="stroke">'+b.letter+'</text>':'') +
      '</g></g></g>';
  });
  return s+'</svg>';
}
function flashBell(i,ms){var el=document.getElementById('bb-'+i);if(!el)return;el.classList.remove('lit');void el.getBoundingClientRect();el.classList.add('lit');later(function(){el.classList.remove('lit');},ms||420);}
function onBells(area,fn){
  area.querySelectorAll('.bbell').forEach(function(g){
    var i=+g.getAttribute('data-i');
    g.addEventListener('click',function(){fn(i);});
    g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();fn(i);}});
  });
}
/* 1. copy a bell tune */
function pzBells(area,L){ multi(area,L,3,function(R){pzBells1(area,L);}); }
function pzBells1(area,L){
  var n=[3,4,5][L-1], len=[3,5,7][L-1];
  var noteIdx=n===3?[0,2,4]:n===4?[0,1,2,4]:[0,1,2,3,4];
  var bells=BELLC.slice(0,n).map(function(b){return {c:b.c,s:b.s,label:cap(b.n)+' bell'};});
  var tune=[]; while(tune.length<len){var x=rnd(0,n-1); if(tune.length>=2&&tune[tune.length-1]===x&&tune[tune.length-2]===x)continue; tune.push(x);}
  if(tune.every(function(t){return t===tune[0];}))tune[len-1]=(tune[0]+1)%n;
  setSay(L===1?'Tap Play the tune. Watch and listen. Then tap the bells in the same order.':'Tap Play the tune. Then tap the bells in the same order. You can play it again before you start.');
  area.innerHTML='<div class="panel">'+bellsSVG(bells)+'</div><p class="count-note" id="bt-note">'+len+' notes to copy</p><button class="btn leaf" id="bt-play">'+IC.speak+' Play the tune</button>';
  var busy=false, played=false, pos=0;
  function ring(i){bellTone(BELL_NOTES[noteIdx[i]],0,1.1,.2);flashBell(i);}
  function note(){$('#bt-note').textContent=played?(pos+' of '+len+' notes'):(len+' notes to copy');}
  $('#bt-play').addEventListener('click',function(){
    if(busy)return; busy=true; pos=0; this.disabled=true; note();
    tune.forEach(function(t,i){later(function(){ring(t);},300+i*700);});
    later(function(){busy=false;played=true;note();var b=$('#bt-play');b.disabled=false;b.innerHTML=IC.speak+' Play it again';},300+len*700);
  });
  onBells(area,function(i){
    if(busy)return;
    ring(i);
    if(!played)return;
    if(i!==tune[pos]){busy=true;later(function(){finish(false);},700);return;}
    pos++; note();
    if(pos===len){busy=true;later(function(){finish(true);},800);}
  });
}
/* 2. finish the rhythm */
var INSTR={drum:{label:'drum',play:drumHit},clap:{label:'clap',play:clapHit},shaker:{label:'shaker',play:shakeHit}};
function pzRhythm(area,L){ multi(area,L,3,function(R){pzRhythm1(area,L,R);}); }
function pzRhythm1(area,L,R){
  if(L===3){
    /* Build the rhythm: listen to drum, clap and shaker sounds, then play the same sounds in the same order */
    var len=[4,5,6][R.k], keys=Object.keys(INSTR), r=[], guard=0;
    do{r=[];for(var i=0;i<len;i++)r.push(pick(keys));guard++;}while((new Set(r).size<2||/(\w+),\1,\1/.test(r.join(',')))&&guard<100);
    setSay('Tap Play the rhythm and listen carefully. Then tap the drum, clap and shaker to play the same sounds in the same order, and tap Check.');
    area.innerHTML='<div class="panel lamp-wrap"><svg class="lamp" id="rh-lamp" viewBox="0 0 200 170" role="img" aria-label="A bluebell lantern that glows with each sound"><circle class="lampglow" cx="100" cy="92" r="80" fill="url(#lampG)"/><path d="M100 4 V30" stroke="#5E4E6C" stroke-width="3"/><path d="M60 120 C60 70 72 36 100 32 C128 36 140 70 140 120 L150 132 L132 126 L120 136 L108 126 L100 138 L92 126 L80 136 L68 126 L50 132 Z" fill="url(#bbG)" stroke="#4B52AE" stroke-width="3" stroke-linejoin="round"/><circle class="lampglow" cx="100" cy="100" r="18" fill="#FFE07A"/></svg></div>' +
      '<p class="count-note" id="rh-note">'+len+' sounds to copy</p><button class="btn leaf" id="rh-play">'+IC.speak+' Play the rhythm</button>' +
      '<div class="lsrow" id="rh-row" aria-live="polite"><span class="tray-empty">Your rhythm</span></div>' +
      '<div class="opts" id="rh-pick"></div>' +
      '<div class="row-btns"><button class="btn soft" id="rh-undo">Take one back</button><button class="btn" id="rh-check" disabled>Check</button></div>';
    var built=[], busy=false, lamp=$('#rh-lamp');
    function glow(t){later(function(){lamp.classList.add('on');},t);later(function(){lamp.classList.remove('on');},t+260);}
    function drawRow(){
      var row=$('#rh-row');
      row.innerHTML=built.length?built.map(function(x){return '<span class="rhpic">'+picSVG2(x,INSTR[x].label)+'</span>';}).join(''):'<span class="tray-empty">Your rhythm</span>';
      row.setAttribute('aria-label','Your rhythm: '+(built.length?built.map(function(x){return INSTR[x].label;}).join(', '):'empty'));
      $('#rh-check').disabled=built.length!==len;
    }
    $('#rh-play').addEventListener('click',function(){
      if(busy)return; busy=true; var b=this; b.disabled=true;
      r.forEach(function(x,i){later(function(){INSTR[x].play(0);},300+i*650);glow(300+i*650);});
      later(function(){busy=false;b.disabled=false;b.innerHTML=IC.speak+' Play it again';},300+len*650);
    });
    keys.forEach(function(k){
      var b=optBtn(picSVG2(k)+'<span class="optlab">'+INSTR[k].label+'</span>',INSTR[k].label,'picword');
      b.addEventListener('click',function(){if(busy)return;INSTR[k].play(0);glow(0);if(built.length<len){built.push(k);drawRow();}});
      $('#rh-pick').appendChild(b);
    });
    $('#rh-undo').addEventListener('click',function(){built.pop();drawRow();});
    $('#rh-check').addEventListener('click',function(){finish(built.join()===r.join());});
    drawRow();
    return;
  }
  var ins=shuffle(Object.keys(INSTR)), unit, seq=[], miss;
  if(L===1){unit=[ins[0],ins[1]];for(var j=0;j<8;j++)seq.push(unit[j%2]);miss=7;}
  else {
    var t=pick(['AAB','ABB','ABC','AABC','ABAC']), map={A:ins[0],B:ins[1],C:ins[2]};
    unit=t.split('').map(function(c){return map[c];});
    var total=t.length*3; for(var m=0;m<total;m++)seq.push(unit[m%t.length]);
    miss=rnd(t.length,total-1);
  }
  var ans=seq[miss];
  setSay(L===1?'Tap Hear the rhythm. What comes next?':'Tap Hear the rhythm. Which sound is missing?');
  var h='<div class="seq" role="list" aria-label="Rhythm pattern">';
  seq.forEach(function(x,i){h+= i===miss?'<div class="cell q" role="listitem" id="rc-'+i+'" aria-label="Missing sound">?</div>':'<div class="cell" role="listitem" id="rc-'+i+'">'+picSVG2(x,INSTR[x].label)+'</div>';});
  h+='</div><button class="btn leaf" id="rh-hear">'+IC.speak+' Hear the rhythm</button><div class="opts" id="rh-opts"></div>';
  area.innerHTML=h;
  var busy2=false;
  $('#rh-hear').addEventListener('click',function(){
    if(busy2)return; busy2=true; var b=this; b.disabled=true;
    seq.forEach(function(x,i){later(function(){var c=$('#rc-'+i);if(c){c.classList.add('on');later(function(){c.classList.remove('on');},300);} if(i!==miss)INSTR[x].play(0);},300+i*520);});
    later(function(){busy2=false;b.disabled=false;},300+seq.length*520);
  });
  Object.keys(INSTR).forEach(function(k){
    var b=optBtn(picSVG2(k)+'<span class="optlab">'+INSTR[k].label+'</span>','Choose the '+INSTR[k].label,'picword');
    b.addEventListener('click',function(){finish(k===ans);});
    $('#rh-opts').appendChild(b);
  });
}
/* 3. high or low */
function semiFreq(n){return 261.63*Math.pow(2,n/12);}
function pickNotes(count,minGap,top){
  for(var tries=0;tries<500;tries++){
    var a=[];for(var i=0;i<count;i++)a.push(rnd(0,top));
    var srt=a.slice().sort(function(x,y){return x-y;}), ok=true;
    for(var j=1;j<srt.length;j++){if(srt[j]-srt[j-1]<minGap)ok=false;}
    if(ok)return a;
  }
  return [0,5,10,15,20].slice(0,count);
}
function pzPitch(area,L){ multi(area,L,3,function(R){pzPitch1(area,L);}); }
function pzPitch1(area,L){
  var n=[2,3,5][L-1], notes=pickNotes(n,[5,3,2][L-1],[19,20,24][L-1]), letters='ABCDE'.split('').slice(0,n);
  var bells=letters.map(function(l){return {c:'#C9C3F2',s:'#6C5BC4',label:'Bell '+l+'. Tap to hear it.',letter:l};});
  function ring(i){bellTone(semiFreq(notes[i]),0,1,.22);flashBell(i,500);}
  var busy=false;
  function playAll(btn){
    if(busy)return; busy=true; btn.disabled=true;
    notes.forEach(function(x,i){later(function(){ring(i);},300+i*900);});
    later(function(){busy=false;btn.disabled=false;},300+n*900);
  }
  if(L===1){
    var askHigh=Math.random()<.5, ans=askHigh?(notes[0]>notes[1]?'A':'B'):(notes[0]<notes[1]?'A':'B');
    setSay('Tap Play both and listen. Then tap the bell that sounds '+(askHigh?'higher':'lower')+'.');
    bells.forEach(function(b){b.label='Bell '+b.letter+'. Tap it if it sounds '+(askHigh?'higher':'lower')+'.';});
    area.innerHTML='<p class="say-small">Which bell is '+(askHigh?'higher':'lower')+'? Tap it.</p><div class="panel">'+bellsSVG(bells)+'</div><button class="btn leaf" id="pt-play">'+IC.speak+' Play both</button>';
    $('#pt-play').addEventListener('click',function(){playAll(this);});
    var chosen=false;
    onBells(area,function(i){if(busy||chosen)return;chosen=true;ring(i);later(function(){finish(letters[i]===ans);},700);});
    return;
  }
  var order=letters.map(function(l,i){return {l:l,v:notes[i]};}).sort(function(a,b){return a.v-b.v;}).map(function(o){return o.l;});
  setSay('Tap a bell to hear it, or tap Play all. Then tap the letters in order, from the lowest sound to the highest.');
  area.innerHTML='<div class="panel">'+bellsSVG(bells)+'</div><button class="btn leaf" id="pt-play">'+IC.speak+' Play all</button><p class="say-small">Lowest first, highest last</p><div id="pt-order" class="or-box"></div>';
  $('#pt-play').addEventListener('click',function(){playAll(this);});
  onBells(area,function(i){if(!busy)ring(i);});
  orderer($('#pt-order'),{answer:order,text:true,show:function(l){return l;},label:function(l){return 'Bell '+l;},onPick:function(l){ring(letters.indexOf(l));}},function(ok){finish(ok);});
}
/* 4. find the rhyme */
var RHYME_PAIRS=[['cat','hat'],['dog','log'],['bee','tree'],['bell','shell'],['sun','bun'],['star','car'],['fish','dish']];
var RHYME_FAM=[['cat','hat','mat','bat','sat'],['dog','log','frog','fog'],['ring','king','sing','wing'],['bell','well','shell','tell'],['cake','lake','snake','make'],['bug','rug','hug','mug'],['ship','lip','dip','zip'],['sun','bun','run','fun'],['bee','tree','see','free'],['night','light','bright','might']];
var VERSES=[
  ['The bluebells ring at break of day','and call the sleepy bees to','play',['tray','sing']],
  ['A little frog sat on a log','and croaked a song into the','fog',['dog','night']],
  ['Jingle shook her silver bell,','and every flower heard it','well',['shell','clearly']],
  ['The wind went whistling up the hill,','then stopped, and all the grass was','still',['pill','quiet']],
  ['We tapped the drum and clapped our hands','and marched along like fairy','bands',['sands','soldiers']],
  ['The moon came up so round and bright','and Jingle sang a song of','night',['kite','stars']],
  ['A snail went sliding down the lane','and hid beneath a leaf from','rain',['train','wind']]
];
function pzRhyme(area,L){
  if(L===1){
    var pairs=shuffle(RHYME_PAIRS).slice(0,3);
    setSay('Which picture rhymes with the word? Tap it.');
    rounds(3,function(k,next){
      var p=pairs[k], tgt=p[0], ans=p[1];
      var others=shuffle(RHYME_PAIRS.filter(function(q){return q!==p;})).slice(0,2).map(function(q){return pick(q);});
      var q='Which picture rhymes with '+tgt+'?';
      area.innerHTML=roundNote(k,3)+'<div class="pic">'+picSVG2(tgt,tgt)+'</div><div class="bigword small-word">'+tgt+'</div><p class="say-small">'+esc(q)+'</p><div class="opts" id="ry-opts"></div>';
      if(k>0)speak(q);
      picOpts($('#ry-opts'),[ans].concat(others),ans,next,function(w){return 'Picture: '+w;});
    });
    return;
  }
  if(L===2){
    var fams=shuffle(RHYME_FAM).slice(0,3);
    setSay('Read the word. Then tap the word that rhymes with it.');
    rounds(3,function(k,next){
      var f=fams[k], ws=shuffle(f), tgt=ws[0], ans=ws[1];
      var pool=[]; RHYME_FAM.forEach(function(g){if(g!==f)g.forEach(function(w){pool.push(w);});});
      var same=shuffle(pool.filter(function(w){return w[0]===tgt[0]||w[0]===ans[0];})), rest=shuffle(pool.filter(function(w){return same.indexOf(w)<0;}));
      var dis=same.slice(0,2).concat(rest).slice(0,3);
      area.innerHTML=roundNote(k,3)+'<div class="bigword">'+tgt+'</div><div class="opts" id="ry-opts"></div>';
      wordOpts($('#ry-opts'),[ans].concat(dis),ans,next);
    });
    return;
  }
  var vs=shuffle(VERSES).slice(0,3);
  setSay('Finish the verse. Pick the word that rhymes and makes sense.');
  rounds(3,function(k,next){
    var v=vs[k];
    area.innerHTML=roundNote(k,3)+'<div class="verse"><p>'+esc(v[0])+'</p><p>'+esc(v[1])+' <span class="gap" aria-label="missing word"></span></p></div><div class="opts" id="ry-opts"></div>';
    wordOpts($('#ry-opts'),[v[2]].concat(v[3]),v[2],next);
  });
}
/* 5. bluebell band jigsaw */
function pzBand(area,L){ pzJigsaw(area,L,'band',bandPicture,'the bluebell band'); }
/* her puzzle pictures (100 x 100), added to the shared picture list; any fairy can use them by name */
Object.assign(PICS2,{
  /* ---------- puzzle pictures (100 x 100) ---------- */
  cat:'<path d="M26 40 L22 12 L42 28 M74 40 L78 12 L58 28" fill="#F7A055" stroke="#B8661E" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="50" r="28" fill="#F7A055" stroke="#B8661E" stroke-width="3"/><path d="M26 18 L36 26 M74 18 L64 26" stroke="#F49DBE" stroke-width="4"/><circle cx="40" cy="46" r="3.5" fill="#2A1E1A"/><circle cx="60" cy="46" r="3.5" fill="#2A1E1A"/><path d="M46 56 L50 60 L54 56 Z" fill="#E06A98"/><path d="M50 60 Q44 66 40 62 M50 60 Q56 66 60 62 M14 54 H36 M14 62 L36 58 M86 54 H64 M86 62 L64 58" stroke="#8A4A1E" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="50" cy="88" rx="22" ry="8" fill="#F7A055" stroke="#B8661E" stroke-width="3"/>',
  hat:'<ellipse cx="50" cy="72" rx="42" ry="12" fill="#6C5BC4" stroke="#3B2A6A" stroke-width="3"/><path d="M28 70 V34 C28 24 72 24 72 34 V70 Z" fill="#8A78E0" stroke="#3B2A6A" stroke-width="3"/><rect x="28" y="56" width="44" height="9" fill="#F28CB3"/>',
  dog:'<ellipse cx="50" cy="54" rx="26" ry="24" fill="#E1B479" stroke="#8A5A2A" stroke-width="3"/><path d="M26 40 C10 40 10 70 22 74 C30 70 30 52 28 44 Z M74 40 C90 40 90 70 78 74 C70 70 70 52 72 44 Z" fill="#8A5A2A"/><circle cx="41" cy="48" r="3.5" fill="#2A1E1A"/><circle cx="59" cy="48" r="3.5" fill="#2A1E1A"/><ellipse cx="50" cy="62" rx="10" ry="8" fill="#F3DCB8"/><ellipse cx="50" cy="58" rx="5" ry="4" fill="#2A1E1A"/><path d="M50 62 V68 M44 70 Q50 74 56 70" stroke="#2A1E1A" stroke-width="2" fill="none"/><path d="M48 74 Q50 84 54 74" fill="#E06A98"/>',
  bell:'<path d="M50 10 V18" stroke="#8A6216" stroke-width="5" stroke-linecap="round"/><path d="M22 74 C22 40 32 20 50 20 C68 20 78 40 78 74 L86 82 H14 Z" fill="url(#ggold)" stroke="#B8861E" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="86" r="7" fill="#B8861E"/><path d="M34 40 C32 50 32 60 33 70" stroke="#fff" stroke-width="4" opacity=".5" fill="none" stroke-linecap="round"/>',
  bun:'<path d="M14 60 C14 34 30 22 50 22 C70 22 86 34 86 60 Z" fill="#E8B06A" stroke="#9A6234" stroke-width="3"/><rect x="14" y="58" width="72" height="18" rx="9" fill="#F3D199" stroke="#9A6234" stroke-width="3"/><ellipse cx="50" cy="26" rx="14" ry="6" fill="#fff"/><circle cx="50" cy="20" r="6" fill="#E8574C"/>',
  star:'<path d="M50 8 L61 36 L91 37 L67 56 L76 86 L50 69 L24 86 L33 56 L9 37 L39 36 Z" fill="url(#ggold)" stroke="#B8861E" stroke-width="3" stroke-linejoin="round"/>',
  car:'<path d="M10 66 V52 L24 50 L34 32 H66 L78 50 L90 54 V66 Z" fill="#E8574C" stroke="#9C241C" stroke-width="3" stroke-linejoin="round"/><path d="M38 36 H50 V50 H30 Z M54 36 H64 L72 50 H54 Z" fill="#DDF1FC"/><circle cx="30" cy="68" r="10" fill="#3B2A4A"/><circle cx="72" cy="68" r="10" fill="#3B2A4A"/><circle cx="30" cy="68" r="4" fill="#C3CAD5"/><circle cx="72" cy="68" r="4" fill="#C3CAD5"/>',
  dish:'<ellipse cx="50" cy="58" rx="42" ry="16" fill="#fff" stroke="#7DBDE6" stroke-width="3"/><ellipse cx="50" cy="54" rx="30" ry="9" fill="#EAF6FC" stroke="#7DBDE6" stroke-width="2"/><path d="M14 62 Q50 82 86 62" stroke="#7DBDE6" stroke-width="3" fill="none"/>',
  drum:'<ellipse cx="50" cy="38" rx="34" ry="11" fill="#FFF8EE" stroke="#9C241C" stroke-width="3"/><path d="M16 38 V74 C16 86 84 86 84 74 V38" fill="#E8574C" stroke="#9C241C" stroke-width="3"/><path d="M18 44 L34 80 L50 46 L66 82 L82 44" stroke="#F8CF5A" stroke-width="3" fill="none"/><path d="M30 10 L46 32 M74 10 L58 32" stroke="#8A5A30" stroke-width="4" stroke-linecap="round"/><circle cx="30" cy="10" r="4" fill="#F5C842"/><circle cx="74" cy="10" r="4" fill="#F5C842"/>',
  clap:'<g transform="rotate(-18 50 50)"><path d="M28 88 C20 70 20 50 26 30 C28 24 36 24 36 30 V48 V22 C36 16 44 16 44 22 V48 V18 C44 12 52 12 52 18 V48 V24 C52 18 60 18 60 24 V58 C60 76 52 88 44 92 Z" fill="#F3CBB0" stroke="#B57650" stroke-width="2.5" stroke-linejoin="round"/></g><g transform="translate(100 0) scale(-1 1) rotate(-18 50 50)" opacity=".9"><path d="M28 88 C20 70 20 50 26 30 C28 24 36 24 36 30 V48 V22 C36 16 44 16 44 22 V48 V18 C44 12 52 12 52 18 V48 V24 C52 18 60 18 60 24 V58 C60 76 52 88 44 92 Z" fill="#E8B898" stroke="#B57650" stroke-width="2.5" stroke-linejoin="round"/></g><path d="M50 6 V14 M38 10 L42 16 M62 10 L58 16" stroke="#F5C842" stroke-width="3" stroke-linecap="round"/>',
  shaker:'<path d="M58 54 L90 90" stroke="#8A5A30" stroke-width="9" stroke-linecap="round"/><ellipse cx="40" cy="38" rx="28" ry="24" fill="#7FD3B5" stroke="#357A31" stroke-width="3"/><path d="M18 30 C28 40 52 40 62 30 M16 44 C28 54 52 54 64 44" stroke="#F8CF5A" stroke-width="4" fill="none"/><circle cx="30" cy="22" r="4" fill="#fff" opacity=".6"/>'
});
/* petal icons for her flower (72 x 72) */
Object.assign(PZICON,{
  /* ---------- petal icons ---------- */
  bells:'<path d="M4 12 C24 6 48 6 68 12" stroke="#6A3F20" stroke-width="4" fill="none"/><g transform="translate(18 14) scale(.3)"><path d="M-40 100 C-40 50 -30 18 0 14 C30 18 40 50 40 100 L50 112 L-50 112 Z" fill="#F28CB3" stroke="#B8467A" stroke-width="6"/></g><g transform="translate(36 14) scale(.3)"><path d="M-40 100 C-40 50 -30 18 0 14 C30 18 40 50 40 100 L50 112 L-50 112 Z" fill="#F8CF5A" stroke="#B8861E" stroke-width="6"/></g><g transform="translate(54 14) scale(.3)"><path d="M-40 100 C-40 50 -30 18 0 14 C30 18 40 50 40 100 L50 112 L-50 112 Z" fill="#7DBDE6" stroke="#3E7FB0" stroke-width="6"/></g>',
  rhythm:'<g transform="translate(2 10) scale(.5)">'+PICS2.drum+'</g><g transform="translate(36 22) scale(.36)">'+PICS2.clap+'</g>',
  pitch:'<path d="M10 58 H62" stroke="#5E4E6C" stroke-width="3"/><rect x="12" y="44" width="10" height="14" rx="3" fill="#B3A4F0"/><rect x="26" y="34" width="10" height="24" rx="3" fill="#9AA0EC"/><rect x="40" y="24" width="10" height="34" rx="3" fill="#7E86E0"/><rect x="54" y="12" width="10" height="46" rx="3" fill="#4F57B8"/>',
  rhyme:'<rect x="4" y="18" width="30" height="36" rx="8" fill="#fff" stroke="#4F57B8" stroke-width="3"/><rect x="38" y="18" width="30" height="36" rx="8" fill="#fff" stroke="#4F57B8" stroke-width="3"/><text x="19" y="42" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="13" font-weight="600" fill="#4F57B8">cat</text><text x="53" y="42" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="13" font-weight="600" fill="#4F57B8">hat</text>',
  bandjig:'<path d="M12 22 h14 a6 6 0 1 1 12 0 h14 v14 a6 6 0 1 0 0 12 v14 h-14 a6 6 0 1 1 -12 0 h-14 Z" fill="#9AA0EC" stroke="#4F57B8" stroke-width="3" stroke-linejoin="round"/><g transform="translate(26 30)"><ellipse cx="0" cy="12" rx="5" ry="4" fill="#fff"/><path d="M4 12 V-4" stroke="#fff" stroke-width="3"/></g>'
});
/* ---------- Jingle ---------- */
FAIRIES.jingle={id:'jingle',name:'Jingle',kind:'Music fairy',place:"Jingle's bluebell hill",art:jingleArt,body:bluebellBody,houseLabel:"Jingle's bluebell house",tapClass:'jingling',tapMs:2400,onTap:houseTune,
  facts:[
    'All the flowers on a bluebell stem hang down on one side, so the stem bends over like a shepherd’s crook.',
    'Sound is made when something shakes very fast. That shaking is called a vibration.',
    'A big bell makes a low sound, and a small bell makes a high sound.',
    'Birds sing to talk to each other. Many sing most in the early morning.',
    'Some bluebell woods in Britain are hundreds of years old.'
  ],
  scene:bluebellScene,base:'#E4E0F7',foundBg:'#ECEAFB',
  foundGround:'<ellipse cx="170" cy="340" rx="150" ry="20" fill="#8790E6"/><g fill="#5960C4"><ellipse cx="80" cy="336" rx="4" ry="5"/><ellipse cx="110" cy="344" rx="4" ry="5"/><ellipse cx="230" cy="340" rx="4" ry="5"/><ellipse cx="262" cy="334" rx="4" ry="5"/></g>',
  thanks:'Thank you for helping me find my music.',
  icon:'<path d="M50 14 V22" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M28 68 C28 40 36 24 50 22 C64 24 72 40 72 68 L78 74 L64 70 L58 78 L50 70 L42 78 L36 70 L22 74 Z" fill="#fff" stroke="#4F57B8" stroke-width="3" stroke-linejoin="round"/>',
  flowerBase:function(){
    return '<ellipse cx="340" cy="668" rx="290" ry="44" fill="#8790E6" opacity=".55"/>' +
      '<path d="M340 380 C330 470 352 580 340 676" stroke="#2F6B2C" stroke-width="18" fill="none" stroke-linecap="round"/>' +
      '<path d="M340 380 C330 470 352 580 340 676" stroke="#4E9F45" stroke-width="11" fill="none" stroke-linecap="round"/>' +
      bluebellStem(352,690,1.5,false)+bluebellStem(330,690,1.3,true) +
      '<path d="M340 650 C300 610 250 610 226 630 C258 668 306 670 340 650 Z" fill="url(#ptleaf)" stroke="#2F6B2C" stroke-width="2.5"/>';
  },
  puz:[
    {id:'bells',titles:['Copy the bells','Copy the tune','Long tune'],run:pzBells},
    {id:'rhythm',titles:['Finish the beat','Finish the rhythm','Build the rhythm'],run:pzRhythm},
    {id:'pitch',titles:['High or low?','Low to high','Five bells'],run:pzPitch},
    {id:'rhyme',titles:['Find the rhyme','Rhyming words','Finish the verse'],run:pzRhyme},
    {id:'bandjig',titles:['Band jigsaw','Band jigsaw','Band jigsaw'],run:pzBand}
  ]};
FAIRY_ORDER.push('jingle');
