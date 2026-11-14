/* Gizmo, the Inventor fairy: her art, glass-jar workshop, glass-jar lab, inventions jigsaw picture, pictures,
   facts, puzzles (circuits, magnets, robot ladybird, potion colours, inventions jigsaw) and her FAIRIES entry. */
'use strict';
/* her gradients (added to the shared defs; any fairy can use them) */
addDefs(
'<radialGradient id="gzDress" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#D8F6F2"/><stop offset=".55" stop-color="#4FC1B4"/><stop offset="1" stop-color="#23857C"/></radialGradient>' +
'<linearGradient id="gzLegs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8E78DE"/><stop offset="1" stop-color="#4E3E9A"/></linearGradient>' +
'<linearGradient id="jarG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E6F6FC" stop-opacity=".75"/><stop offset=".45" stop-color="#BFE3F5" stop-opacity=".45"/><stop offset="1" stop-color="#7DB3D6" stop-opacity=".7"/></linearGradient>' +
'<radialGradient id="bulbGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF6B0"/><stop offset=".45" stop-color="#FFE45A" stop-opacity=".8"/><stop offset="1" stop-color="#FFE45A" stop-opacity="0"/></radialGradient>'
);
function mixHex(a,b,t){
  function h(c,i){return parseInt(c.substr(i,2),16);}
  var o='#';[1,3,5].forEach(function(i){var v=Math.round(h(a,i)*(1-t)+h(b,i)*t);o+=('0'+v.toString(16)).slice(-2);});
  return o.toUpperCase();
}
/* ---------- Gizmo, the Inventor fairy ---------- */
function gizmoArt(noShadow){
  var skin='url(#skinC)', flat='#CF9670';
  return (noShadow?'':'<ellipse cx="120" cy="308" rx="44" ry="7" fill="#23857C" opacity=".22" filter="url(#fshadow)"/>') +
  '<g class="wings">' +
  '<path d="M112 150 C84 100 40 104 42 136 C44 166 88 168 112 158 Z" fill="url(#wingSilver)" stroke="#fff" stroke-opacity=".9" stroke-width="1.5"/>' +
  '<path d="M112 166 C82 172 60 200 72 220 C86 238 112 204 116 174 Z" fill="url(#wingSilver)" stroke="#fff" stroke-opacity=".9" stroke-width="1.5"/>' +
  '<path d="M128 150 C156 100 200 104 198 136 C196 166 152 168 128 158 Z" fill="url(#wingSilver)" stroke="#fff" stroke-opacity=".9" stroke-width="1.5"/>' +
  '<path d="M128 166 C158 172 180 200 168 220 C154 238 128 204 124 174 Z" fill="url(#wingSilver)" stroke="#fff" stroke-opacity=".9" stroke-width="1.5"/>' +
  '<g fill="#fff"><circle cx="64" cy="124" r="2"/><circle cx="178" cy="124" r="2"/></g>' +
  '</g>' +
  /* short pink bob behind */
  '<path d="M74 110 C70 62 98 52 120 52 C142 52 170 62 166 110 C168 132 162 146 152 148 L88 148 C78 146 72 132 74 110 Z" fill="url(#hairPink)"/>' +
  '<rect x="106" y="226" width="11" height="40" rx="5.5" fill="url(#gzLegs)"/><rect x="123" y="226" width="11" height="40" rx="5.5" fill="url(#gzLegs)"/>' +
  '<path d="M101 260 H118 V270 C118 276 112 279 104 279 C97 279 95 271 101 260 Z" fill="url(#silverG)"/>' +
  '<path d="M122 260 H139 C145 271 143 279 136 279 C128 279 122 276 122 270 Z" fill="url(#silverG)"/>' +
  /* teal dress under a white lab coat */
  '<path d="M90 214 C88 222 86 230 84 236 C100 244 140 244 156 236 C154 230 152 222 150 214 Z" fill="url(#gzDress)"/>' +
  '<path d="M104 152 C100 152 98 160 98 168 C94 186 90 206 88 228 C100 234 140 234 152 228 C150 206 146 186 142 168 C142 160 140 152 136 152 Z" fill="url(#gnCoat)" stroke="#B9C6C0" stroke-width="1.2"/>' +
  '<path d="M110 152 L120 176 L130 152" stroke="#B9C6C0" stroke-width="2" fill="url(#gzDress)"/>' +
  '<path d="M120 176 V228" stroke="#B9C6C0" stroke-width="1.5"/>' +
  '<rect x="128" y="190" width="14" height="14" rx="2" fill="none" stroke="#B9C6C0" stroke-width="1.5"/><path d="M132 186 V196 M137 184 V196" stroke="#E8574C" stroke-width="2.5" stroke-linecap="round"/><path d="M137 184 V196" stroke="#7DBDE6" stroke-width="2.5" stroke-linecap="round"/>' +
  '<path d="M104 164 C94 176 90 188 88 198" stroke="#F4F6F5" stroke-width="12" fill="none" stroke-linecap="round"/>' +
  '<circle cx="88" cy="200" r="6" fill="'+skin+'"/>' +
  /* raised arm holding a glowing light bulb */
  '<g class="arm"><path d="M136 164 C150 158 158 148 162 138" stroke="#F4F6F5" stroke-width="12" fill="none" stroke-linecap="round"/>' +
  '<circle cx="182" cy="108" r="22" fill="url(#bulbGlow)"/>' +
  '<path d="M174 122 C164 110 170 92 182 92 C194 92 200 110 190 122 Z" fill="#FFF3A0" stroke="#C9961E" stroke-width="1.5"/>' +
  '<path d="M178 116 L180 106 L184 112 L186 104" stroke="#E0A42A" stroke-width="1.6" fill="none"/>' +
  '<rect x="175" y="121" width="14" height="10" rx="2" fill="url(#silverG)" stroke="#6E7888" stroke-width="1"/>' +
  '<circle cx="164" cy="134" r="6" fill="'+skin+'"/></g>' +
  '<rect x="114" y="138" width="12" height="16" rx="4" fill="#BC8260"/>' +
  '<circle cx="120" cy="108" r="40" fill="'+skin+'"/>' +
  '<path d="M80 104 C78 70 100 58 120 58 C140 58 162 70 160 104 C156 90 148 84 138 86 C130 78 112 78 106 86 C96 82 84 90 80 104 Z" fill="url(#hairPink)"/>' +
  '<path d="M98 70 C108 64 124 63 136 68" stroke="#fff" stroke-width="4" opacity=".35" stroke-linecap="round" fill="none"/>' +
  /* pencil tucked in her hair */
  '<g transform="translate(150 70) rotate(40)"><rect x="-3" y="-18" width="6" height="30" fill="#F8CF5A" stroke="#B8861E" stroke-width="1"/><path d="M-3 12 L0 20 L3 12 Z" fill="#F3DCB8"/><rect x="-3" y="-22" width="6" height="5" fill="#F28CB3"/></g>' +
  /* magnifying goggle over one eye */
  '<path d="M99 102 Q105 98 111 101" stroke="#5E3A22" stroke-width="2" fill="none" stroke-linecap="round"/>' +
  '<ellipse cx="106" cy="115" rx="5.5" ry="7" fill="#2A1E1A"/><circle cx="108" cy="112" r="2" fill="#fff"/>' +
  '<path d="M80 108 C90 104 120 104 148 108" stroke="#5E4E6C" stroke-width="3" fill="none"/>' +
  '<circle cx="135" cy="114" r="13" fill="#DDF4FB" fill-opacity=".55" stroke="url(#brassG)" stroke-width="4"/>' +
  '<ellipse cx="135" cy="115" rx="7" ry="9" fill="#2A1E1A"/><circle cx="138" cy="111" r="3" fill="#fff"/>' +
  '<ellipse cx="95" cy="127" rx="7" ry="4.5" fill="#F28CB3" opacity=".4"/>' +
  '<path d="M112 128 Q120 135 128 128" stroke="#7A3428" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
}
/* ---------- house: a glass-jar workshop with a propeller ---------- */
function jarBody(){
  var s='<g class="gzhop">';
  /* what is inside the jar: a bench, a glowing bulb and a cog */
  s+='<path d="M110 72 V96" stroke="#5E4E6C" stroke-width="2"/><circle cx="110" cy="104" r="16" fill="url(#bulbGlow)"/><path d="M104 108 C98 100 102 92 110 92 C118 92 122 100 116 108 Z" fill="#FFF3A0" stroke="#C9961E" stroke-width="1.2"/>';
  s+='<rect x="70" y="140" width="80" height="8" rx="2" fill="url(#gwood)"/><rect x="74" y="148" width="5" height="22" fill="#6A3F26"/><rect x="141" y="148" width="5" height="22" fill="#6A3F26"/>';
  s+='<path transform="translate(84 130)" d="'+gearD(8,8,0,3,2)+'" fill="url(#cogBrass)" stroke="#8A5E14" stroke-width="1"/>';
  s+='<path d="M120 140 L124 124 H132 L136 140 Z" fill="#7FD3B5" stroke="#3E9E7E" stroke-width="1.2"/>';
  /* the glass jar */
  s+='<path d="M58 78 C58 70 64 66 72 66 H148 C156 66 162 70 162 78 V170 C162 178 156 182 148 182 H72 C64 182 58 178 58 170 Z" fill="url(#jarG)" stroke="#7DB3D6" stroke-width="2.5"/>';
  s+='<path d="M68 80 V164" stroke="#fff" stroke-width="7" opacity=".55" stroke-linecap="round"/><path d="M152 86 V150" stroke="#fff" stroke-width="3" opacity=".4" stroke-linecap="round"/>';
  /* round window and copper door */
  s+='<circle cx="140" cy="112" r="10" fill="none" stroke="#C8743E" stroke-width="3"/><path d="M130 112 H150 M140 102 V122" stroke="#C8743E" stroke-width="1.5"/>';
  s+='<path d="M97 182 V160 A13 13 0 0 1 123 160 V182 Z" fill="#C8743E"/><path d="M100 182 V161 A10 10 0 0 1 120 161 V182 Z" fill="url(#copperG)"/><circle cx="116" cy="172" r="1.8" fill="url(#ggold)"/>';
  /* screw-top lid */
  s+='<rect x="52" y="52" width="116" height="18" rx="5" fill="url(#silverG)" stroke="#6E7888" stroke-width="1.5"/>';
  for(var x=60;x<168;x+=8)s+='<path d="M'+x+' 54 V68" stroke="#8C96A6" stroke-width="1.5" opacity=".7"/>';
  /* propeller on a little mast */
  s+='<rect x="107" y="28" width="6" height="26" fill="url(#brassG)"/><circle cx="110" cy="28" r="4" fill="#E8574C"/>';
  s+='<g class="gzprop"><ellipse cx="88" cy="26" rx="22" ry="5" fill="#7DBDE6" stroke="#3E7FB0" stroke-width="1.5"/><ellipse cx="132" cy="26" rx="22" ry="5" fill="#F28CB3" stroke="#B8467A" stroke-width="1.5"/></g>';
  s+='<circle cx="110" cy="26" r="4" fill="url(#ggold)"/>';
  return s+'</g>';
}
function houseWhizz(){
  if(!mem.sound)return;
  for(var i=0;i<10;i++)tone(380+i*70,i*.06,.08,'triangle',.05);
  [0,.8,1.6].forEach(function(t){tone(330,.7+t,.12,'sine',.1);tone(500,.78+t,.14,'sine',.08);});
}
/* ---------- Gizmo's world: the glass-jar lab ---------- */
function labScene(){
  var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMax slice"><defs>' +
  '<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E6EEF8"/><stop offset="1" stop-color="#D2DEEC"/></linearGradient>' +
  '<linearGradient id="bench" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9D2DE"/><stop offset="1" stop-color="#8C96A6"/></linearGradient>' +
  '<radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF6B0" stop-opacity=".95"/><stop offset="1" stop-color="#FFF6B0" stop-opacity="0"/></radialGradient>' +
  '<linearGradient id="glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F2FAFE"/><stop offset="1" stop-color="#BFDCEE"/></linearGradient>' +
  '</defs>';
  s+='<rect width="1200" height="900" fill="url(#wall)"/>';
  for(var x=0;x<1200;x+=80)s+='<path d="M'+x+' 0 V660" stroke="#DCE5F0" stroke-width="3"/>';
  /* blackboard with chalk drawings */
  s+='<rect x="420" y="80" width="360" height="200" rx="10" fill="#2E4A44" stroke="#8A5A30" stroke-width="12"/>';
  s+='<g stroke="#F4F6F5" stroke-width="3" fill="none" opacity=".85"><rect x="460" y="120" width="110" height="70"/><circle cx="515" cy="120" r="10"/><path d="M460 150 h-12 M448 142 v16 M440 146 v8"/><path transform="translate(670 170)" d="'+gearD(9,30,0,8,4)+'"/><path d="M620 240 l20 -20 l20 20 l20 -20 l20 20 l20 -20"/></g>';
  /* hanging bulbs */
  [[200,170],[1000,150]].forEach(function(b){s+='<path d="M'+b[0]+' 0 V'+(b[1]-20)+'" stroke="#5E4E6C" stroke-width="3"/><circle cx="'+b[0]+'" cy="'+b[1]+'" r="80" fill="url(#glow)"/><path d="M'+(b[0]-14)+' '+(b[1]+12)+' C'+(b[0]-28)+' '+(b[1]-6)+' '+(b[0]-16)+' '+(b[1]-28)+' '+b[0]+' '+(b[1]-28)+' C'+(b[0]+16)+' '+(b[1]-28)+' '+(b[0]+28)+' '+(b[1]-6)+' '+(b[0]+14)+' '+(b[1]+12)+' Z" fill="#FFF3A0" stroke="#C9961E" stroke-width="3"/>';});
  /* shelves of potion jars */
  var pc=['#E8574C','#F8CF5A','#3E8FD8','#5DBB4C','#8E5CC8','#F7943A'];
  [[40,330],[860,330]].forEach(function(sh,si){
    s+='<rect x="'+sh[0]+'" y="'+sh[1]+'" width="300" height="16" rx="5" fill="#9A6234"/>';
    for(var j=0;j<5;j++){var jx=sh[0]+30+j*58, h=40+((j+si)%3)*16, c=pc[(j+si*2)%6];
      s+='<rect x="'+(jx-18)+'" y="'+(sh[1]-h)+'" width="36" height="'+h+'" rx="8" fill="url(#glass)" stroke="#8FB8D6" stroke-width="3"/><rect x="'+(jx-15)+'" y="'+(sh[1]-h*.6)+'" width="30" height="'+(h*.6-3)+'" rx="5" fill="'+c+'" opacity=".85"/><rect x="'+(jx-12)+'" y="'+(sh[1]-h-8)+'" width="24" height="10" rx="3" fill="#AEB7C4"/>';}
  });
  /* big flask with bubbles on the right */
  s+='<g transform="translate(1040 560)"><path d="M-22 -140 H22 V-80 L80 40 C86 54 76 62 62 62 H-62 C-76 62 -86 54 -80 40 L-22 -80 Z" fill="url(#glass)" stroke="#8FB8D6" stroke-width="5"/><path d="M-50 -10 H50 L76 42 C80 52 72 56 62 56 H-62 C-72 56 -80 52 -76 42 Z" fill="#8E5CC8" opacity=".8"/><g fill="#fff" opacity=".7"><circle cx="-10" cy="10" r="8"/><circle cx="20" cy="-30" r="6"/><circle cx="0" cy="-70" r="5"/><circle cx="8" cy="-120" r="7"/></g></g>';
  /* bench along the bottom */
  s+='<rect x="0" y="650" width="1200" height="30" rx="6" fill="url(#bench)"/><rect x="0" y="680" width="1200" height="220" fill="#6E7888"/>';
  for(var t=0;t<1200;t+=60)s+='<rect x="'+t+'" y="'+(700+(t/60%2)*60)+'" width="60" height="60" fill="#7E8898"/>';
  /* robot ladybird and a magnet on the bench */
  s+='<g transform="translate(180 620) scale(2)">'+ladybirdArt()+'</g>';
  s+='<g transform="translate(880 600)"><path d="M-40 40 V0 A40 40 0 0 1 40 0 V40 H20 V0 A20 20 0 0 0 -20 0 V40 Z" fill="#E8574C" stroke="#9C241C" stroke-width="4"/><rect x="-40" y="30" width="20" height="14" fill="#C9CFD8"/><rect x="20" y="30" width="20" height="14" fill="#C9CFD8"/></g>';
  s+='</svg>';
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
}
/* the robot ladybird, centred on 0,0 and facing up */
function ladybirdArt(){
  return '<ellipse cx="0" cy="3" rx="16" ry="18" fill="#9C241C" opacity=".25"/>' +
    '<circle cx="0" cy="-16" r="8.5" fill="#2A1E1A"/><path d="M-4 -23 L-8 -30 M4 -23 L8 -30" stroke="#2A1E1A" stroke-width="2" stroke-linecap="round"/><circle cx="-8" cy="-31" r="2" fill="#F8CF5A"/><circle cx="8" cy="-31" r="2" fill="#F8CF5A"/>' +
    '<ellipse cx="0" cy="2" rx="16" ry="18" fill="#E8574C" stroke="#9C241C" stroke-width="2"/>' +
    '<path d="M0 -16 V20" stroke="#2A1E1A" stroke-width="2"/>' +
    '<g fill="#2A1E1A"><circle cx="-8" cy="-4" r="3.2"/><circle cx="8" cy="-4" r="3.2"/><circle cx="-9" cy="9" r="3"/><circle cx="9" cy="9" r="3"/></g>' +
    '<circle cx="-3" cy="-17" r="2" fill="#fff"/><circle cx="3" cy="-17" r="2" fill="#fff"/>' +
    '<ellipse cx="-7" cy="-9" rx="4" ry="2.5" fill="#fff" opacity=".45" transform="rotate(-30 -7 -9)"/>';
}
/* jigsaw picture: Gizmo's inventions */
function inventPicture(){
  var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">'+allDefs() +
    '<linearGradient id="iwall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9DFF8"/><stop offset="1" stop-color="#D3E6F2"/></linearGradient>' +
    '<rect width="600" height="600" fill="url(#iwall)"/>';
  /* blueprint pinned to the wall */
  s+='<rect x="330" y="40" width="230" height="160" rx="6" fill="#3E7FB0"/><g stroke="#fff" stroke-width="2" fill="none" opacity=".8"><circle cx="400" cy="110" r="34"/><path d="M366 110 H434 M400 76 V144"/><rect x="460" y="70" width="70" height="50"/><path d="M460 150 l30 -20 l40 20"/></g><circle cx="345" cy="52" r="6" fill="#E8574C"/><circle cx="545" cy="52" r="6" fill="#E8574C"/>';
  /* hanging bulb */
  s+='<path d="M180 0 V70" stroke="#5E4E6C" stroke-width="3"/><circle cx="180" cy="96" r="60" fill="url(#bulbGlow)"/><path d="M166 108 C152 92 162 66 180 66 C198 66 208 92 194 108 Z" fill="#FFF3A0" stroke="#C9961E" stroke-width="3"/>';
  /* bench */
  s+='<rect x="0" y="400" width="600" height="26" fill="#9A6234"/><rect x="0" y="426" width="600" height="174" fill="#6E7888"/>';
  for(var t=0;t<600;t+=50)s+='<rect x="'+t+'" y="'+(440+(t/50%2)*50)+'" width="50" height="50" fill="#7E8898"/>';
  /* jar house, flasks, magnet with clips and the ladybird */
  s+='<g transform="translate(-20 190) scale(1.05)">'+houseGround()+jarBody()+'</g>';
  [[300,'#E8574C'],[360,'#5DBB4C'],[420,'#3E8FD8']].forEach(function(f,i){s+='<g transform="translate('+f[0]+' 400)"><path d="M-10 -80 H10 V-50 L34 -6 C38 2 32 6 26 6 H-26 C-32 6 -38 2 -34 -6 L-10 -50 Z" fill="#F2FAFE" stroke="#8FB8D6" stroke-width="3"/><path d="M-22 -24 H22 L32 -4 C34 2 30 4 26 4 H-26 C-30 4 -34 2 -32 -4 Z" fill="'+f[1]+'"/><circle cx="'+(i*3-4)+'" cy="-36" r="4" fill="#fff" opacity=".7"/></g>';});
  s+='<g transform="translate(510 370)"><path d="M-36 36 V0 A36 36 0 0 1 36 0 V36 H18 V0 A18 18 0 0 0 -18 0 V36 Z" fill="#E8574C" stroke="#9C241C" stroke-width="3"/><rect x="-36" y="26" width="18" height="12" fill="#C9CFD8"/><rect x="18" y="26" width="18" height="12" fill="#C9CFD8"/></g>';
  s+='<g transform="translate(470 418) rotate(-20)">'+PICS2.clip.replace(/stroke-width="5"/g,'stroke-width="4"')+'</g>';
  s+='<g transform="translate(260 500) scale(2.2) rotate(70)">'+ladybirdArt()+'</g>';
  s+='<g transform="translate(470 500) rotate(-30)"><rect x="-6" y="-40" width="12" height="60" rx="4" fill="url(#steelG)"/><rect x="-10" y="16" width="20" height="30" rx="6" fill="#F8CF5A" stroke="#B8861E" stroke-width="2"/></g>';
  s+='</svg>';
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
}
/* ================= Gizmo's glass-jar lab puzzles ================= */

/* ---------- 1. circuits ---------- */
/* a loop: battery on the left, bulb on top, a switch (or plain wire) on the right.
   c: {gap:'tl'|'tr'|'b'|null, filled:{}, sw:null|'open'|'closed', one:bool, broken:bool, lit:bool, decoy:bool, targets:[ids], swTap:bool, small:bool} */
var GAPS={tl:[60,60,180,60],tr:[220,60,340,60],b:[340,200,60,200]};
function cWire(x1,y1,x2,y2){var d='M'+x1+' '+y1+' L'+x2+' '+y2;return '<path d="'+d+'" stroke="#3B2A4A" stroke-width="9" stroke-linecap="round"/><path d="'+d+'" stroke="#E8574C" stroke-width="4.5" stroke-linecap="round"/>';}
function cClip(x,y,dir){return '<rect x="'+(dir>0?x-2:x-12)+'" y="'+(y-6)+'" width="14" height="12" rx="3" fill="url(#silverG)" stroke="#5E6878" stroke-width="1.5"/>';}
function circuitSVG(c){
  c.filled=c.filled||{};
  var s='<svg class="cirsvg" viewBox="0 0 400 260" '+(c.small?'aria-hidden="true"':'role="group" aria-label="'+esc(c.aria||'A circuit with a battery and a bulb')+'"')+'><rect width="400" height="260" rx="18" fill="#F2F6FB"/>';
  /* wires on the three long runs, each may have a gap in the middle */
  Object.keys(GAPS).forEach(function(id){
    var g=GAPS[id], x1=g[0], x2=g[2], y=g[1], mx=(x1+x2)/2;
    if(c.gap===id&&!c.filled[id]){var d=x2>x1?1:-1;s+=cWire(x1,y,mx-d*22,y)+cWire(mx+d*22,y,x2,y)+cClip(mx-d*22,y,d)+cClip(mx+d*22,y,-d);}
    else s+=cWire(x1,y,x2,y);
  });
  s+=c.nobat?cWire(60,60,60,200):cWire(60,60,60,110)+cWire(60,152,60,200);
  if(c.sw){
    s+=cWire(340,60,340,108)+cWire(340,152,340,200);
    s+='<g class="'+(c.swTap?'ctap swtap':'')+'"'+(c.swTap?' data-t="sw" tabindex="0" role="button" aria-label="Switch, '+(c.sw==='open'?'open':'closed')+'. Tap to change it."':'')+'><rect x="316" y="100" width="48" height="60" fill="#fff" fill-opacity="0"/>';
    s+='<rect x="324" y="104" width="32" height="54" rx="6" fill="#E4E8EE" stroke="#8C96A6" stroke-width="2"/>';
    s+=c.sw==='closed'?'<path d="M340 110 L340 150" stroke="#3B2A4A" stroke-width="5" stroke-linecap="round"/>':'<path d="M340 150 L360 116" stroke="#3B2A4A" stroke-width="5" stroke-linecap="round"/>';
    s+='<circle cx="340" cy="110" r="5" fill="url(#ggold)" stroke="#8A6216" stroke-width="1.5"/><circle cx="340" cy="150" r="5" fill="url(#ggold)" stroke="#8A6216" stroke-width="1.5"/></g>';
  } else s+=cWire(340,60,340,200);
  /* battery */
  if(!c.nobat)s+='<rect x="54" y="104" width="12" height="8" rx="2" fill="#AEB7C4"/><rect x="42" y="110" width="36" height="44" rx="6" fill="#3E4656"/><rect x="42" y="110" width="36" height="15" rx="5" fill="#E8A23A"/>';
  s+='<text x="60" y="122" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="12" font-weight="600" fill="#3B2A4A">+</text>';
  /* bulb */
  s+='<rect x="180" y="52" width="40" height="16" rx="4" fill="url(#silverG)" stroke="#5E6878" stroke-width="1.5"/>';
  if(c.lit)s+='<circle cx="200" cy="28" r="44" fill="url(#bulbGlow)"/>';
  s+='<path d="M190 52 C176 40 182 10 200 10 C218 10 224 40 210 52 Z" fill="'+(c.lit?'#FFF3A0':'#F4F8FC')+'" stroke="'+(c.lit?'#C9961E':'#9AA4B2')+'" stroke-width="2"/>';
  s+=c.broken?'<path d="M193 50 L195 32 L197 30 M203 38 L205 40 L207 50" stroke="#5E4E6C" stroke-width="2.2" fill="none"/><path d="M186 20 L192 24 M214 22 L208 26" stroke="#9AA4B2" stroke-width="1.5"/>':'<path d="M193 50 L195 32 L200 26 L205 32 L207 50" stroke="'+(c.lit?'#E0A42A':'#5E4E6C')+'" stroke-width="1.8" fill="none"/>';
  /* a spare wire that is not part of the loop */
  if(c.decoy){
    s+=cWire(340,200,340,236)+cWire(340,236,292,236);
    if(c.filled.decoy)s+=cWire(292,236,210,236); else s+=cClip(292,236,-1)+cWire(248,236,210,236)+cClip(248,236,1);
  }
  /* places the player can tap to add a wire */
  (c.targets||[]).forEach(function(t){
    var x,y;
    if(t==='decoy'){x=270;y=236;}else{var g=GAPS[t];x=(g[0]+g[2])/2;y=g[1];}
    var done=c.filled[t];
    s+='<g class="ctap" data-t="'+t+'" tabindex="0" role="button" aria-label="'+(t==='decoy'?'Gap between two loose wires':'Gap in the wire')+(done?', joined':'. Tap to add a wire.')+'"><rect x="'+(x-30)+'" y="'+(y-20)+'" width="60" height="40" rx="10" fill="#FFE07A" fill-opacity="'+(done?0:.25)+'" stroke="'+(done?'none':'#B8861E')+'" stroke-width="2.5" stroke-dasharray="6 5"/></g>';
  });
  return s+'</svg>';
}
function onTaps(box,fn){
  box.querySelectorAll('.ctap').forEach(function(el){
    el.addEventListener('click',function(){fn(el.getAttribute('data-t'));});
    el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();fn(el.getAttribute('data-t'));}});
  });
}
var FAULTS={
  switch:'The switch is open, so the loop has a gap.',
  gap:'There is a gap in the wire.',
  nobat:'There is no battery to push the electricity round.',
  broken:'The bulb is broken. The thin wire inside it has snapped.'
};
function pzCircuit(area,L){
  if(L===1){
    /* one wire and one gap: put the wire in the gap to complete the circuit */
    var gaps=shuffle(['tl','tr','b']);
    setSay('Complete the circuit to light the bulb. Tap the wire, then tap the gap.');
    rounds(3,function(k,next){
      var c={gap:gaps[k],filled:{}}, busy=false, held=false; c.targets=[c.gap];
      function draw(){$('#ci-box').innerHTML=circuitSVG(c);onTaps($('#ci-box'),hit);}
      function hit(t){
        if(busy)return; busy=true; c.filled[t]=true; c.targets=[]; c.lit=true; draw(); chime();
        $('#ci-wire').style.visibility='hidden';
        later(function(){next(true);},1300);
      }
      area.innerHTML=roundNote(k,3)+'<div class="panel cir-wrap" id="ci-box"></div><button type="button" class="opt wirebtn" id="ci-wire" aria-pressed="false" aria-label="A wire. Tap it, then tap the gap."><svg viewBox="0 0 120 40" aria-hidden="true"><path d="M14 20 H106" stroke="#3B2A4A" stroke-width="9" stroke-linecap="round"/><path d="M14 20 H106" stroke="#E8574C" stroke-width="4.5" stroke-linecap="round"/><rect x="4" y="14" width="14" height="12" rx="3" fill="url(#silverG)" stroke="#5E6878" stroke-width="1.5"/><rect x="102" y="14" width="14" height="12" rx="3" fill="url(#silverG)" stroke="#5E6878" stroke-width="1.5"/></svg><span class="optlab">Wire</span></button>';
      $('#ci-wire').addEventListener('click',function(){if(busy)return;held=!held;this.setAttribute('aria-pressed',String(held));tick();});
      draw();
    });
    return;
  }
  if(L===2){
    setSay('Electricity needs a loop with no gaps. Make the bulb light up.');
    rounds(3,function(k,next){
      if(k===0){
        var c={gap:pick(['tl','b']),filled:{},decoy:true,sw:'open',swTap:true}, busy=false; c.targets=[c.gap,'decoy'];
        var q='Tap the gaps to add wires, and tap the switch to turn it on or off. Then tap Test the circuit.';
        area.innerHTML=roundNote(0,3)+'<div class="panel cir-wrap" id="ci-box"></div><p class="say-small">'+esc(q)+'</p><button class="btn" id="ci-go">Test the circuit</button>';
        speak(q);
        var draw=function(){$('#ci-box').innerHTML=circuitSVG(c);onTaps($('#ci-box'),function(t){if(busy)return;if(t==='sw')c.sw=c.sw==='open'?'closed':'open';else c.filled[t]=!c.filled[t];tick();draw();});};
        draw();
        $('#ci-go').addEventListener('click',function(){
          if(busy)return; busy=true; this.disabled=true;
          var ok=!!c.filled[c.gap]&&c.sw==='closed'; c.lit=ok; c.swTap=false; c.targets=[]; draw(); if(ok)chime(); else softTone();
          later(function(){next(ok);},1200);
        });
        return;
      }
      var q2='Which circuit will light the bulb?';
      var opts=k===1?shuffle([{c:{sw:'closed'},ok:true},{c:{sw:'open'},ok:false},{c:{sw:'closed',gap:pick(['tl','tr','b'])},ok:false}])
                    :shuffle([{c:{sw:'closed'},ok:true},{c:{sw:'closed',nobat:true},ok:false},{c:{sw:'closed',broken:true},ok:false}]);
      area.innerHTML=roundNote(k,3)+'<p class="say-small">'+q2+'</p><div class="opts" id="ci-opts"></div>';
      speak(q2);
      opts.forEach(function(o,i){o.c.small=true;var b=optBtn(circuitSVG(o.c),'Circuit '+(i+1)+(o.c.sw==='open'?', with the switch open':'')+(o.c.gap?', with a gap in the wire':'')+(o.c.nobat?', with no battery':'')+(o.c.broken?', with a broken bulb':''),'ciropt');b.addEventListener('click',function(){$('#ci-opts').querySelectorAll('button').forEach(function(x){x.disabled=true;});next(o.ok);});$('#ci-opts').appendChild(b);});
    });
    return;
  }
  var faults=shuffle(Object.keys(FAULTS)).slice(0,3);
  setSay('Each of these circuits doesn’t work. Look carefully and find out why.');
  rounds(3,function(k,next){
    var f=faults[k], c={sw:f==='switch'?'open':'closed',gap:f==='gap'?pick(['tl','tr','b']):null,nobat:f==='nobat',broken:f==='broken'};
    area.innerHTML=roundNote(k,3)+'<div class="panel cir-wrap">'+circuitSVG(c)+'</div><p class="say-small">Why doesn’t the bulb light up?</p><div class="opts col" id="ci-opts"></div>';
    if(k>0)speak('Why doesn’t the bulb light up?');
    shuffle(Object.keys(FAULTS)).forEach(function(x){var b=optBtn(esc(FAULTS[x]),null,'txt');b.addEventListener('click',function(){next(x===f);});$('#ci-opts').appendChild(b);});
  });
}
/* ---------- 2. magnets ---------- */
var MAGS={
  nail:{n:'iron nail',m:true,s:true}, clip:{n:'steel paperclip',m:true,s:true}, screw:{n:'steel screw',m:true,s:true}, nut:{n:'steel nut',m:true,s:true}, bolt:{n:'iron bolt',m:true,s:true},
  can:{n:'aluminium can',m:true,s:false}, ring:{n:'gold ring',m:true,s:false}, foil:{n:'ball of aluminium foil',m:true,s:false}, pipe:{n:'copper pipe',m:true,s:false},
  block:{n:'wooden block',m:false,s:false}, cork:{n:'cork',m:false,s:false}, marble:{n:'glass marble',m:false,s:false}, feather:{n:'feather',m:false,s:false}, ball:{n:'rubber ball',m:false,s:false}, leaf:{n:'leaf',m:false,s:false}, sponge:{n:'sponge',m:false,s:false}
};
function magKeys(f){return Object.keys(MAGS).filter(function(k){return f(MAGS[k]);});}
function pzMagnets(area,L){
  if(L===1){
    var st=shuffle(magKeys(function(m){return m.s;})), no=shuffle(magKeys(function(m){return !m.m;}));
    var list=shuffle([st[0],no[0],pick([st[1],no[1]])]);
    setSay('Will it stick to the magnet? Make a guess. Then watch what happens.');
    rounds(3,function(k,next){
      var key=list[k], it=MAGS[key];
      area.innerHTML=roundNote(k,3)+'<div class="panel mag-wrap"><svg class="magsvg" viewBox="0 0 400 180" role="img" aria-label="A magnet and '+aOrAn(it.n)+' '+esc(it.n)+'"><rect width="400" height="180" rx="18" fill="#F2F6FB"/><g transform="translate(84 90) rotate(-90)"><svg x="-60" y="-60" width="120" height="120" viewBox="0 0 100 100">'+PICS2.magnet+'</svg></g><g class="magobj" id="mg-obj"><svg x="250" y="40" width="100" height="100" viewBox="0 0 100 100">'+pic2(key)+'</svg></g></svg></div><p class="say-small">Will the '+esc(it.n)+' stick to the magnet?</p><div class="opts"><button class="btn leaf" id="mg-y">It will stick</button><button class="btn" id="mg-n">It won’t stick</button></div>';
      speak('Will the '+it.n+' stick to the magnet?');
      function guess(g){
        $('#mg-y').disabled=true;$('#mg-n').disabled=true;tick();
        var o=$('#mg-obj'); o.classList.add(it.s?'pulled':'stays');
        if(it.s&&mem.sound)tone(1200,.55,.08,'square',.05);
        later(function(){next(g===it.s);},1600);
      }
      $('#mg-y').addEventListener('click',function(){guess(true);});
      $('#mg-n').addEventListener('click',function(){guess(false);});
    });
    return;
  }
  var mag='<svg viewBox="0 0 100 100">'+PICS2.magnet+'</svg>';
  if(L===2){
    var met=shuffle(magKeys(function(m){return m.m;})).slice(0,4), non=shuffle(magKeys(function(m){return !m.m;})).slice(0,4);
    var items=shuffle(met.concat(non)).map(function(k,i){return {id:i,html:picSVG2(k),label:MAGS[k].n,want:MAGS[k].m?'metal':'not'};});
    setSay('Gizmo is tidying her lab. Which things are made of metal? Tap a thing, then tap Metal or Not metal. Tap Check when they are all sorted.');
    sorter(area,items,[{id:'metal',label:'Metal',icon:PICS2.nut},{id:'not',label:'Not metal',icon:PICS2.block}],{zoneWord:'Put it in'});
    return;
  }
  var yes=shuffle(magKeys(function(m){return m.s;})).slice(0,3), nope=shuffle(magKeys(function(m){return m.m&&!m.s;})).slice(0,3);
  var items3=shuffle(yes.concat(nope)).map(function(k,i){return {id:i,text:MAGS[k].n,label:MAGS[k].n,want:MAGS[k].s?'sticks':'not'};});
  setSay('Everything here is metal, but magnets only pull on some metals. Sort them. Tap a thing, then tap where it goes, then tap Check.');
  sorter(area,items3,[{id:'sticks',label:'Sticks to a magnet',icon:PICS2.magnet},{id:'not',label:'Does not stick',icon:PICS2.can}],{zoneWord:'Put it in'});
}
/* ---------- 3. program the robot ladybird ---------- */
var DXY=[[0,-1],[1,0],[0,1],[-1,0]], DNAME=['up','right','down','left'];
function cmdIcon(c){
  var a={F:'<path d="M30 48 V14 M18 26 L30 12 L42 26" stroke="#3B2A4A" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    R:turnArrow(28,34,16,140,380,true,'#3B2A4A',5)}; a.L='<g transform="translate(60 0) scale(-1 1)">'+a.R+'</g>';
  if(c.length===1&&a[c])return '<svg viewBox="0 0 60 60" aria-hidden="true">'+a[c]+'</svg>';
  var d=DNAME.indexOf(c);
  return '<svg viewBox="0 0 60 60" aria-hidden="true"><g transform="rotate('+(d*90)+' 30 30)"><path d="M30 50 V12 M16 26 L30 10 L44 26" stroke="#3B2A4A" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></svg>';
}
var CMDNAME={F:'forward',L:'turn left',R:'turn right',up:'up',down:'down',left:'left',right:'right'};
function gridSVG(n,o){
  var C=56, s='<svg class="lbsvg" viewBox="0 0 '+(n*C+8)+' '+(n*C+8)+'" role="img" aria-label="'+esc(o.aria)+'"><rect width="'+(n*C+8)+'" height="'+(n*C+8)+'" rx="14" fill="#B9E49C"/>';
  for(var r=0;r<n;r++)for(var c=0;c<n;c++)s+='<rect x="'+(4+c*C+2)+'" y="'+(4+r*C+2)+'" width="'+(C-4)+'" height="'+(C-4)+'" rx="8" fill="'+((r+c)%2?'#CFEDB5':'#DDF3C8')+'"/>';
  function at(p){return [4+p[0]*C+C/2,4+p[1]*C+C/2];}
  (o.stones||[]).forEach(function(p){var q=at(p);s+='<ellipse cx="'+q[0]+'" cy="'+(q[1]+4)+'" rx="20" ry="15" fill="url(#stoneG)" stroke="#6E6A7E" stroke-width="2"/>';});
  if(o.goal){var g=at(o.goal);s+=flowerG(g[0],g[1],20,'pink',6);}
  (o.letters||[]).forEach(function(l){var q=at(l.p);s+='<circle cx="'+q[0]+'" cy="'+q[1]+'" r="15" fill="#fff" stroke="#6C5BC4" stroke-width="2.5"/><text x="'+q[0]+'" y="'+(q[1]+6)+'" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="17" font-weight="600" fill="#6C5BC4">'+l.t+'</text>';});
  var p=at(o.start);
  s+='<g class="lbug" id="lb-bug" style="transform:translate('+p[0]+'px,'+p[1]+'px) rotate('+(o.dir*90)+'deg)">'+ladybirdArt()+'</g>';
  return s+'</svg>';
}
function runProgram(prog,start,dir,n,stones){
  /* returns the list of states and whether it crashed */
  var x=start[0],y=start[1],d=dir,deg=dir*90,steps=[],bad=false;
  for(var i=0;i<prog.length&&!bad;i++){
    var c=prog[i];
    if(c==='L'){d=(d+3)%4;deg-=90;}
    else if(c==='R'){d=(d+1)%4;deg+=90;}
    else {
      if(c!=='F'){var nd=DNAME.indexOf(c), turn=(nd-d+4)%4; deg+=turn===3?-90:turn*90; d=nd;}
      x+=DXY[d][0];y+=DXY[d][1];
      if(x<0||y<0||x>=n||y>=n||(stones||[]).some(function(s){return s[0]===x&&s[1]===y;}))bad=true;
    }
    steps.push({x:x,y:y,d:d,deg:deg,bad:bad});
  }
  return {steps:steps,end:[x,y],bad:bad};
}
function animateBug(steps,n,done){
  var C=56;
  steps.forEach(function(st,i){later(function(){var b=$('#lb-bug');if(!b)return;var px=Math.max(-.4,Math.min(n-.6,st.x)),py=Math.max(-.4,Math.min(n-.6,st.y));b.style.transform='translate('+(4+px*C+C/2)+'px,'+(4+py*C+C/2)+'px) rotate('+st.deg+'deg)';if(st.bad)b.classList.add('bump');tick();},300+i*600);});
  later(done,300+steps.length*600+400);
}
function expand(rep,body){var out=[];for(var i=0;i<rep;i++)out=out.concat(body);return out;}
function progText(rep,body){return 'Repeat '+rep+' times: '+body.map(function(c){return CMDNAME[c];}).join(', ');}
function pzRobot(area,L){
  if(L===3){
    setSay('A loop repeats the same steps. Read Gizmo’s program carefully.');
    var bodies=[['F','F','R'],['F','R'],['F','L'],['F','F','L'],['F','R','F'],['F','L','F'],['F','F']];
    function gen(){
      for(var t=0;t<300;t++){
        var n=6, start=[rnd(0,5),rnd(0,5)], dir=rnd(0,3), body=pick(bodies), rep=rnd(2,4);
        var r=runProgram(expand(rep,body),start,dir,n,[]);
        if(r.bad||(r.end[0]===start[0]&&r.end[1]===start[1]))continue;
        if(expand(rep,body).filter(function(c){return c==='F';}).length<3)continue;
        return {n:n,start:start,dir:dir,body:body,rep:rep,end:r.end};
      }
    }
    rounds(3,function(k,next){
      var g=gen(), same=function(a,b){return a[0]===b[0]&&a[1]===b[1];};
      if(k!==1){
        var cands=[];
        [g.rep-1,g.rep+1].forEach(function(r2){if(r2<1)return;var r=runProgram(expand(r2,g.body),g.start,g.dir,g.n,[]);if(!r.bad)cands.push(r.end);});
        var mir=g.body.map(function(c){return c==='L'?'R':c==='R'?'L':c;}), rm=runProgram(expand(g.rep,mir),g.start,g.dir,g.n,[]);if(!rm.bad)cands.push(rm.end);
        var cells=[g.end];
        cands.concat(shuffle([[0,0],[5,5],[0,5],[5,0],[2,3],[3,2],[1,4],[4,1]])).forEach(function(p){if(cells.length<4&&!same(p,g.start)&&!cells.some(function(q){return same(q,p);}))cells.push(p);});
        cells=shuffle(cells);
        var letters=cells.map(function(p,i){return {p:p,t:'ABCD'[i]};}), ans='';cells.forEach(function(p,i){if(same(p,g.end))ans='ABCD'[i];});
        var q='Where will the ladybird stop?';
        area.innerHTML=roundNote(k,3)+'<div class="panel lb-wrap">'+gridSVG(g.n,{start:g.start,dir:g.dir,letters:letters,aria:'The ladybird on a grid, with four places marked A, B, C and D'})+'</div><div class="prog"><span class="rlab">Gizmo’s program</span><p>'+esc(progText(g.rep,g.body))+'</p></div><p class="say-small">'+q+'</p><div class="opts" id="lb-opts"></div>';
        speak(progText(g.rep,g.body)+'. '+q);
        var pickL=function(ok){
          $('#lb-opts').querySelectorAll('button').forEach(function(x){x.disabled=true;});
          if(!ok){next(false);return;}
          animateBug(runProgram(expand(g.rep,g.body),g.start,g.dir,g.n,[]).steps,g.n,function(){next(true);});
        };
        ['A','B','C','D'].forEach(function(w){var b=optBtn(w,'Place '+w,'word');b.addEventListener('click',function(){pickL(w===ans);});$('#lb-opts').appendChild(b);});
        return;
      }
      var progs=[{rep:g.rep,body:g.body,ok:true}], tries=[{rep:g.rep+1,body:g.body},{rep:g.rep-1,body:g.body},{rep:g.rep,body:g.body.map(function(c){return c==='L'?'R':c==='R'?'L':c;})},{rep:g.rep,body:g.body.concat(['F'])}];
      shuffle(tries).forEach(function(p){if(progs.length>=3||p.rep<1)return;var r=runProgram(expand(p.rep,p.body),g.start,g.dir,g.n,[]);if(r.bad||same(r.end,g.end))return;if(progs.some(function(o){return progText(o.rep,o.body)===progText(p.rep,p.body);}))return;p.ok=false;progs.push(p);});
      var q2='Which program takes the ladybird to the flower?';
      area.innerHTML=roundNote(1,3)+'<div class="panel lb-wrap">'+gridSVG(g.n,{start:g.start,dir:g.dir,goal:g.end,aria:'The ladybird on a grid and a flower to reach'})+'</div><p class="say-small">'+q2+'</p><div class="opts col" id="lb-opts"></div>';
      speak(q2);
      shuffle(progs).forEach(function(p){var b=optBtn(esc(progText(p.rep,p.body)),null,'txt');b.addEventListener('click',function(){
        $('#lb-opts').querySelectorAll('button').forEach(function(x){x.disabled=true;});
        if(!p.ok){next(false);return;}
        animateBug(runProgram(expand(g.rep,g.body),g.start,g.dir,g.n,[]).steps,g.n,function(){next(true);});
      });$('#lb-opts').appendChild(b);});
    });
    return;
  }
  multi(area,L,3,function(R){pzRobot12(area,L);});
}
function pzRobot12(area,L){
  var n=L===1?4:5, start, goal, dir, stones=[], maxLen=L===1?3:10, cmds=L===1?['up','right','down','left']:['L','F','R'];
  for(var t=0;t<500;t++){
    start=[rnd(0,n-1),rnd(0,n-1)]; goal=[rnd(0,n-1),rnd(0,n-1)]; dir=L===1?0:rnd(0,3); stones=[];
    var md=Math.abs(goal[0]-start[0])+Math.abs(goal[1]-start[1]);
    if(L===1){if(md===3)break;continue;}
    if(md<3)continue;
    for(var s2=0;s2<3;s2++){var p=[rnd(0,n-1),rnd(0,n-1)];if((p[0]!==start[0]||p[1]!==start[1])&&(p[0]!==goal[0]||p[1]!==goal[1]))stones.push(p);}
    /* make sure the flower can be reached around the stones */
    var seen={}, qq=[start], ok2=false; seen[start]=1;
    while(qq.length){var cu=qq.shift();if(cu[0]===goal[0]&&cu[1]===goal[1]){ok2=true;break;}DXY.forEach(function(dd){var nx=[cu[0]+dd[0],cu[1]+dd[1]];if(nx[0]<0||nx[1]<0||nx[0]>=n||nx[1]>=n||seen[nx]||stones.some(function(s){return s[0]===nx[0]&&s[1]===nx[1];}))return;seen[nx]=1;qq.push(nx);});}
    if(ok2)break;
  }
  var prog=[], busy=false;
  setSay(L===1?'Help the robot ladybird reach the flower. Tap 3 arrows to make her program, then tap Go.':'Program the ladybird to reach the flower without bumping into a stone. Forward moves one square the way she is facing. Then tap Go.');
  area.innerHTML='<div class="panel lb-wrap" id="lb-box">'+gridSVG(n,{start:start,dir:dir,goal:goal,stones:stones,aria:'The ladybird on a grid'+(stones.length?' with stones':'')+', and a flower to reach'})+'</div><div class="pslots" id="lb-prog" aria-live="polite"></div><div class="opts" id="lb-cmds"></div><div class="row-btns"><button class="btn soft" id="lb-undo">Take one back</button><button class="btn" id="lb-go" disabled>Go</button></div>';
  function drawProg(){
    var h='';for(var i=0;i<Math.max(maxLen===3?3:prog.length+1,1)&&i<maxLen;i++){h+='<span class="pslot'+(prog[i]?' fill':'')+'">'+(prog[i]?cmdIcon(prog[i]):'')+'</span>';}
    $('#lb-prog').innerHTML=h; $('#lb-prog').setAttribute('aria-label','Program: '+(prog.length?prog.map(function(c){return CMDNAME[c];}).join(', '):'empty'));
    $('#lb-go').disabled=L===1?prog.length!==3:!prog.length;
  }
  cmds.forEach(function(c){var b=optBtn(cmdIcon(c)+'<span class="optlab">'+cap(CMDNAME[c])+'</span>',null,'picword cmdbtn');b.addEventListener('click',function(){if(busy||prog.length>=maxLen)return;prog.push(c);tick();drawProg();});$('#lb-cmds').appendChild(b);});
  $('#lb-undo').addEventListener('click',function(){if(busy)return;prog.pop();drawProg();});
  $('#lb-go').addEventListener('click',function(){
    if(busy)return; busy=true; this.disabled=true; $('#lb-undo').disabled=true;
    var r=runProgram(prog,start,dir,n,stones);
    animateBug(r.steps,n,function(){finish(!r.bad&&r.end[0]===goal[0]&&r.end[1]===goal[1]);});
  });
  drawProg();
}
/* ---------- 4. mix potion colours ---------- */
var PCOL={red:'#E8574C',yellow:'#F8CF5A',blue:'#3E8FD8',orange:'#F7943A',green:'#5DBB4C',purple:'#8E5CC8'};
var PMIX=[['red','yellow','orange'],['blue','yellow','green'],['red','blue','purple']];
function flaskSVG(col,label){
  return '<svg viewBox="0 0 100 100" '+(label?'role="img" aria-label="'+esc(label)+'"':'aria-hidden="true"')+'><path d="M40 8 H60 V36 L84 80 C88 88 84 94 76 94 H24 C16 94 12 88 16 80 L40 36 Z" fill="#F2FAFE" stroke="#8FB8D6" stroke-width="4" stroke-linejoin="round"/><path d="M29 58 H71 L82 80 C85 86 82 90 76 90 H24 C18 90 15 86 18 80 Z" fill="'+col+'"/><circle cx="44" cy="70" r="4" fill="#fff" opacity=".55"/><circle cx="56" cy="78" r="3" fill="#fff" opacity=".45"/><rect x="36" y="4" width="28" height="8" rx="3" fill="#AEB7C4"/></svg>';
}
function pzPotions(area,L){
  if(L<3){
    var mixes=shuffle(PMIX);
    setSay(L===1?'Gizmo is mixing potions. What colour will the two potions make together?':'Gizmo needs some new potions. Which two colours should she mix?');
    rounds(3,function(k,next){
      var m=mixes[k];
      if(L===1){
        var q='What colour do '+m[0]+' and '+m[1]+' make?';
        area.innerHTML=roundNote(k,3)+'<div class="mixrow"><div class="pic">'+flaskSVG(PCOL[m[0]],m[0]+' potion')+'</div><span class="mixop">+</span><div class="pic">'+flaskSVG(PCOL[m[1]],m[1]+' potion')+'</div><span class="mixop">=</span><div class="pic qpic">?</div></div><p class="say-small">'+esc(q)+'</p><div class="opts" id="pt-opts"></div>';
        if(k>0)speak(q);
        shuffle(['orange','green','purple']).forEach(function(c){var b=optBtn(flaskSVG(PCOL[c])+'<span class="optlab">'+c+'</span>',c+' potion','picword');b.addEventListener('click',function(){next(c===m[2]);});$('#pt-opts').appendChild(b);});
      } else {
        var q2='Gizmo wants '+aOrAn(m[2])+' '+m[2]+' potion. Which two should she mix?';
        area.innerHTML=roundNote(k,3)+'<div class="pic">'+flaskSVG(PCOL[m[2]],m[2]+' potion')+'</div><p class="say-small">'+esc(q2)+'</p><div class="opts" id="pt-opts"></div>';
        if(k>0)speak(q2);
        shuffle(PMIX).forEach(function(p){var b=optBtn('<span class="pair">'+flaskSVG(PCOL[p[0]])+flaskSVG(PCOL[p[1]])+'</span><span class="optlab">'+p[0]+' and '+p[1]+'</span>',p[0]+' and '+p[1],'picword');b.addEventListener('click',function(){next(p[2]===m[2]);});$('#pt-opts').appendChild(b);});
      }
    });
    return;
  }
  setSay('Adding white makes a colour lighter. Adding black makes it darker.');
  var base=pick(['red','blue','green','purple','orange']), bc=PCOL[base];
  rounds(3,function(k,next){
    if(k===2){
      var mx=pick(PMIX), wh=Math.random()<.5, mc=PCOL[mx[2]], other=PMIX.filter(function(x){return x!==mx;})[0][2];
      var o3=[{c:mixHex(mc,'#FFFFFF',.55),ok:wh,l:'lighter '+mx[2]},{c:mixHex(mc,'#000000',.45),ok:!wh,l:'darker '+mx[2]},{c:mixHex(PCOL[other],wh?'#FFFFFF':'#000000',wh?.55:.45),ok:false,l:(wh?'lighter ':'darker ')+other}];
      var q3='Gizmo mixes '+mx[0]+' and '+mx[1]+', then adds some '+(wh?'white':'black')+'. Which potion does she get?';
      area.innerHTML=roundNote(2,3)+'<div class="mixrow"><div class="pic">'+flaskSVG(PCOL[mx[0]],mx[0]+' potion')+'</div><span class="mixop">+</span><div class="pic">'+flaskSVG(PCOL[mx[1]],mx[1]+' potion')+'</div><span class="mixop">+</span><div class="pic">'+flaskSVG(wh?'#FFFFFF':'#2A1E1A',(wh?'white':'black')+' paint')+'</div></div><p class="say-small">'+esc(q3)+'</p><div class="opts" id="pt-opts"></div>';
      speak(q3);
      shuffle(o3).forEach(function(o){var b=optBtn(flaskSVG(o.c),o.l);b.addEventListener('click',function(){next(o.ok);});$('#pt-opts').appendChild(b);});
      return;
    }
    if(k===0){
      var white=Math.random()<.5, ans=white?mixHex(bc,'#FFFFFF',.55):mixHex(bc,'#000000',.45);
      var opts=[{c:mixHex(bc,'#FFFFFF',.55),ok:white,l:'lighter '+base},{c:mixHex(bc,'#000000',.45),ok:!white,l:'darker '+base},{c:PCOL[base==='green'?'blue':base==='blue'?'purple':'green'],ok:false,l:'a different colour'}];
      var q='Gizmo adds some '+(white?'white':'black')+' to this '+base+' potion. Which potion does she get?';
      area.innerHTML=roundNote(0,3)+'<div class="mixrow"><div class="pic">'+flaskSVG(bc,base+' potion')+'</div><span class="mixop">+</span><div class="pic">'+flaskSVG(white?'#FFFFFF':'#2A1E1A',(white?'white':'black')+' paint')+'</div></div><p class="say-small">'+esc(q)+'</p><div class="opts" id="pt-opts"></div>';
      speak(q);
      shuffle(opts).forEach(function(o){var b=optBtn(flaskSVG(o.c),o.l);b.addEventListener('click',function(){next(o.ok);});$('#pt-opts').appendChild(b);});
      return;
    }
    var tints=[mixHex(bc,'#FFFFFF',.7),mixHex(bc,'#FFFFFF',.35),bc,mixHex(bc,'#000000',.4)];
    area.innerHTML=roundNote(1,3)+'<p class="say-small">Put the '+base+' potions in order, from the lightest to the darkest.</p><div id="pt-order" class="or-box"></div>';
    speak('Put the '+base+' potions in order, from the lightest to the darkest.');
    orderer($('#pt-order'),{answer:['0','1','2','3'],show:function(i){return flaskSVG(tints[+i]);},label:function(){return 'A '+base+' potion';}},next);
  });
}
/* ---------- 5. invention jigsaw ---------- */
function pzInventJig(area,L){ pzJigsaw(area,L,'invent',inventPicture,'Gizmo’s inventions'); }
/* her puzzle pictures (100 x 100), added to the shared picture list; any fairy can use them by name */
Object.assign(PICS2,{
  /* ---------- puzzle pictures (100 x 100) ---------- */
  clip:'<path d="M34 80 V26 C34 14 54 14 54 26 V70 C54 78 44 78 44 70 V34" stroke="#6E7888" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M34 80 C34 90 64 90 64 80 V20" stroke="#6E7888" stroke-width="5" fill="none" stroke-linecap="round"/>',
  can:'<rect x="28" y="16" width="44" height="72" rx="8" fill="url(#silverG)" stroke="#6E7888" stroke-width="3"/><rect x="28" y="38" width="44" height="28" fill="#E8574C"/><ellipse cx="50" cy="18" rx="20" ry="5" fill="#E4E8EE" stroke="#6E7888" stroke-width="2"/><path d="M50 14 h8" stroke="#6E7888" stroke-width="3" stroke-linecap="round"/><path d="M36 44 V60" stroke="#fff" stroke-width="4" opacity=".6"/>',
  ring:'<ellipse cx="50" cy="58" rx="28" ry="24" fill="none" stroke="#C9961E" stroke-width="10"/><ellipse cx="50" cy="58" rx="28" ry="24" fill="none" stroke="#F8D96A" stroke-width="5"/><path d="M50 32 L40 22 L50 12 L60 22 Z" fill="#9FD3EE" stroke="#3E7FB0" stroke-width="2.5" stroke-linejoin="round"/>',
  foil:'<path d="M24 56 L30 30 L52 22 L72 32 L80 54 L70 76 L46 82 L28 72 Z" fill="url(#silverG)" stroke="#8C96A6" stroke-width="3" stroke-linejoin="round"/><path d="M30 30 L46 50 L72 32 M46 50 L46 82 M28 72 L46 50 L80 54" stroke="#AEB7C4" stroke-width="2" fill="none"/>',
  pipe:'<g transform="rotate(-25 50 50)"><rect x="12" y="38" width="76" height="24" rx="4" fill="url(#copperG)" stroke="#8A4A22" stroke-width="3"/><ellipse cx="88" cy="50" rx="6" ry="12" fill="#5E2E14" stroke="#8A4A22" stroke-width="2"/><path d="M20 44 H80" stroke="#fff" stroke-width="3" opacity=".45"/></g>',
  magnet:'<path d="M18 86 V44 A32 32 0 0 1 82 44 V86 H62 V44 A12 12 0 0 0 38 44 V86 Z" fill="#E8574C" stroke="#9C241C" stroke-width="3" stroke-linejoin="round"/><rect x="18" y="72" width="20" height="14" fill="#C9CFD8" stroke="#6E7888" stroke-width="2"/><rect x="62" y="72" width="20" height="14" fill="#C9CFD8" stroke="#6E7888" stroke-width="2"/>'
});
/* petal icons for her flower (72 x 72) */
Object.assign(PZICON,{
  /* ---------- petal icons ---------- */
  circuit:'<path d="M14 50 V22 H58 V50 H14" stroke="#3B2A4A" stroke-width="4" fill="none"/><rect x="6" y="30" width="16" height="22" rx="3" fill="#3E4656"/><rect x="6" y="30" width="16" height="8" rx="2" fill="#E8A23A"/><circle cx="36" cy="14" r="12" fill="url(#bulbGlow)"/><path d="M31 22 C24 16 28 4 36 4 C44 4 48 16 41 22 Z" fill="#FFF3A0" stroke="#C9961E" stroke-width="1.5"/>',
  magnets:'<g transform="translate(-4 2) scale(.66)">'+PICS2.magnet+'</g><g transform="translate(34 30) scale(.4) rotate(20 50 50)">'+PICS2.clip+'</g>',
  robot:'<g transform="translate(36 38) scale(1.2) rotate(30)">'+ladybirdArt()+'</g>',
  potions:'<g transform="translate(0 8) scale(.5)">'+flaskSVG('#F8CF5A').replace(/<\/?svg[^>]*>/g,'')+'</g><g transform="translate(34 8) scale(.5)">'+flaskSVG('#3E8FD8').replace(/<\/?svg[^>]*>/g,'')+'</g>',
  inventjig:'<path d="M12 22 h14 a6 6 0 1 1 12 0 h14 v14 a6 6 0 1 0 0 12 v14 h-14 a6 6 0 1 1 -12 0 h-14 Z" fill="#4FC1B4" stroke="#23857C" stroke-width="3" stroke-linejoin="round"/><path d="M27 46 C21 40 24 30 32 30 C40 30 43 40 37 46 Z" fill="#FFF3A0" stroke="#C9961E" stroke-width="1.5"/>'
});
/* ---------- Gizmo ---------- */
FAIRIES.gizmo={id:'gizmo',name:'Gizmo',kind:'Inventor fairy',place:"Gizmo's glass-jar lab",art:gizmoArt,body:jarBody,houseLabel:"Gizmo's glass-jar workshop",tapClass:'whizzing',tapMs:2500,onTap:houseWhizz,
  facts:[
    'A circuit is a loop. Electricity can only flow round it when there are no gaps.',
    'A switch makes a gap in a circuit. Turning the switch off opens the gap, and the light goes out.',
    'Magnets pull on iron and steel, but not on wood, plastic, glass or most other metals.',
    'Mixing red and yellow paint makes orange. Mixing blue and yellow makes green.',
    'A robot follows a list of instructions called a program. It does exactly what each step says.'
  ],
  scene:labScene,base:'#D2DEEC',foundBg:'#E6F2F4',
  foundGround:'<ellipse cx="170" cy="340" rx="150" ry="20" fill="#C9D2DE"/><g transform="translate(70 318) scale(.25)">'+flaskSVG('#8E5CC8').replace(/<\/?svg[^>]*>/g,'')+'</g><g transform="translate(246 318) scale(.25)">'+flaskSVG('#5DBB4C').replace(/<\/?svg[^>]*>/g,'')+'</g>',
  thanks:'Thank you for helping me finish my inventions.',
  icon:'<path d="M40 70 C26 58 30 26 50 26 C70 26 74 58 60 70 Z" fill="#fff" stroke="#5E6878" stroke-width="3"/><rect x="40" y="70" width="20" height="12" rx="3" fill="#fff" stroke="#5E6878" stroke-width="3"/><path d="M44 62 L47 46 L53 54 L56 44" stroke="#5E6878" stroke-width="2.5" fill="none"/>',
  flowerBase:function(){
    return '<rect x="96" y="652" width="488" height="22" rx="8" fill="#8C96A6"/><rect x="96" y="652" width="488" height="7" rx="3" fill="#C9CFD8"/>' +
      '<path d="M340 380 C330 460 352 540 340 606" stroke="#2F6B2C" stroke-width="18" fill="none" stroke-linecap="round"/>' +
      '<path d="M340 380 C330 460 352 540 340 606" stroke="#4E9F45" stroke-width="11" fill="none" stroke-linecap="round"/>' +
      '<path d="M342 560 C382 524 432 528 452 546 C420 582 372 584 342 560 Z" fill="url(#ptleaf)" stroke="#2F6B2C" stroke-width="2.5"/>' +
      '<path d="M290 600 H390 L384 652 H296 Z" fill="url(#jarG)" stroke="#8FB8D6" stroke-width="3"/><rect x="282" y="590" width="116" height="16" rx="6" fill="url(#silverG)" stroke="#5E6878" stroke-width="2.5"/>' +
      '<g transform="translate(176 562) scale(.9)">'+flaskSVG('#8E5CC8').replace(/<\/?svg[^>]*>/g,'')+'</g><g transform="translate(424 576) scale(.75)">'+flaskSVG('#5DBB4C').replace(/<\/?svg[^>]*>/g,'')+'</g>';
  },
  puz:[
    {id:'circuit',titles:['Light the bulb','Switch it on','Fix the circuit'],run:pzCircuit},
    {id:'magnets',titles:['Magnet test','Metal or not?','Which metals stick?'],run:pzMagnets},
    {id:'robot',titles:['Ladybird steps','Turn and go','Loop the ladybird'],run:pzRobot},
    {id:'potions',titles:['Mix the potions','Potion recipes','Light and dark'],run:pzPotions},
    {id:'inventjig',titles:['Invention jigsaw','Invention jigsaw','Invention jigsaw'],run:pzInventJig}
  ]};
FAIRY_ORDER.push('gizmo');
