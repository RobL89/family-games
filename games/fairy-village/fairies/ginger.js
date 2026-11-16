/* Ginger, the Doctor fairy: her art, acorn cottage, hollow-tree clinic, pictures, facts,
   puzzles (plaster it, senses, heartbeats, doctor's bag, body words) and her FAIRIES entry. */
'use strict';
/* her gradients (added to the shared defs; any fairy can use them) */
addDefs(
'<radialGradient id="gnCoat" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#F1F4F2"/><stop offset="1" stop-color="#C9D3CE"/></radialGradient>' +
'<linearGradient id="gnLegs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9FE0C8"/><stop offset="1" stop-color="#3E9E7E"/></linearGradient>' +
'<radialGradient id="acornG" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#E9B57A"/><stop offset=".55" stop-color="#C47E40"/><stop offset="1" stop-color="#8A4E22"/></radialGradient>' +
'<radialGradient id="capG" cx=".4" cy=".25" r=".9"><stop offset="0" stop-color="#C9A06A"/><stop offset=".6" stop-color="#8E6A3A"/><stop offset="1" stop-color="#5E4220"/></radialGradient>' +
'<radialGradient id="heartG" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#FFB3B0"/><stop offset=".5" stop-color="#E8574C"/><stop offset="1" stop-color="#A3261E"/></radialGradient>' +
'<radialGradient id="lampG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF6C8"/><stop offset=".5" stop-color="#FFE07A" stop-opacity=".8"/><stop offset="1" stop-color="#FFE07A" stop-opacity="0"/></radialGradient>'
);
/* ---------- Ginger, the Doctor fairy ---------- */
function gingerArt(noShadow){
  var skin='url(#skinA)', flat='#F3CBB0';
  return (noShadow?'':'<ellipse cx="120" cy="308" rx="44" ry="7" fill="#3E9E7E" opacity=".22" filter="url(#fshadow)"/>') +
  '<g class="wings">' +
  '<path d="M112 150 C76 104 34 106 38 136 C42 166 88 166 112 158 Z" fill="url(#wingMint)" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '<path d="M112 166 C84 172 60 198 72 218 C86 236 112 202 116 174 Z" fill="url(#wingMint)" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '<path d="M128 150 C164 104 206 106 202 136 C198 166 152 166 128 158 Z" fill="url(#wingMint)" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '<path d="M128 166 C156 172 180 198 168 218 C154 236 128 202 124 174 Z" fill="url(#wingMint)" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '</g>' +
  /* plait behind */
  '<path d="M150 112 C166 130 168 150 160 172" stroke="#9A3A18" stroke-width="15" fill="none" stroke-linecap="round"/>' +
  '<path d="M150 112 C166 130 168 150 160 172" stroke="url(#hairRed)" stroke-width="11" fill="none" stroke-linecap="round" stroke-dasharray="9 3"/>' +
  '<path d="M156 174 L164 186 L152 184 Z" fill="#7FD3B5"/>' +
  '<rect x="106" y="226" width="11" height="40" rx="5.5" fill="url(#gnLegs)"/><rect x="123" y="226" width="11" height="40" rx="5.5" fill="url(#gnLegs)"/>' +
  '<path d="M101 260 H118 V270 C118 276 112 279 104 279 C97 279 95 271 101 260 Z" fill="url(#bootRed)"/>' +
  '<path d="M122 260 H139 C145 271 143 279 136 279 C128 279 122 276 122 270 Z" fill="url(#bootRed)"/>' +
  /* mint dress under a white coat */
  '<path d="M90 214 C88 222 86 230 84 236 C100 244 140 244 156 236 C154 230 152 222 150 214 Z" fill="url(#dressMint)"/>' +
  '<path d="M104 152 C100 152 98 160 98 168 C94 186 90 206 88 228 C100 234 140 234 152 228 C150 206 146 186 142 168 C142 160 140 152 136 152 Z" fill="url(#gnCoat)" stroke="#B9C6C0" stroke-width="1.2"/>' +
  '<path d="M110 152 L120 178 L130 152" stroke="#B9C6C0" stroke-width="2" fill="#7FD3B5"/>' +
  '<path d="M120 178 V228" stroke="#B9C6C0" stroke-width="1.5"/><circle cx="124" cy="190" r="2" fill="#B9C6C0"/><circle cx="124" cy="206" r="2" fill="#B9C6C0"/>' +
  '<path d="M98 200 H112 V214 H98 Z" fill="none" stroke="#B9C6C0" stroke-width="1.5"/><path d="M101 206 C103 199 109 199 110 203 C106 205 103 207 101 206 Z" fill="#6DBE5A"/>' +
  /* stethoscope */
  '<path d="M108 154 C106 172 112 184 120 184 C128 184 134 172 132 154" stroke="#6E7888" stroke-width="3" fill="none"/>' +
  '<path d="M120 184 C122 196 132 198 136 192" stroke="#6E7888" stroke-width="3" fill="none"/><circle cx="137" cy="190" r="5" fill="#C3CAD5" stroke="#6E7888" stroke-width="2"/>' +
  '<path d="M104 164 C94 176 90 188 88 198" stroke="'+flat+'" stroke-width="10" fill="none" stroke-linecap="round"/>' +
  '<path d="M104 164 C96 174 93 182 91 188" stroke="#fff" stroke-width="11" fill="none" stroke-linecap="round"/>' +
  /* her wand, in her lower hand */
  '<path d="M87 197 L66 160" stroke="#C9A77A" stroke-width="3.5" stroke-linecap="round"/><circle cx="63" cy="154" r="14" fill="#FFF3B0" opacity=".55" filter="url(#fsoft)"/><path d="M63 166 C52 158 47 153 47 147 C47 143 50 140 54 140 C58 140 61 143 63 146 C65 143 68 140 72 140 C76 140 79 143 79 147 C79 153 74 158 63 166 Z" fill="#E8574C" stroke="#9C241C" stroke-width="1.5"/><ellipse cx="55" cy="146" rx="2.5" ry="1.6" fill="#fff" opacity=".7"/>' +
  '<circle cx="88" cy="200" r="6" fill="'+skin+'"/>' +
  /* raised arm with a leaf plaster */
  '<g class="arm"><path d="M136 164 C150 158 158 148 162 138" stroke="'+flat+'" stroke-width="10" fill="none" stroke-linecap="round"/>' +
  '<path d="M136 164 C146 160 151 155 154 150" stroke="#fff" stroke-width="11" fill="none" stroke-linecap="round"/>' +
  '<circle cx="163" cy="136" r="6" fill="'+skin+'"/>' +
  '<g transform="translate(176 118) rotate(-30)"><rect x="-16" y="-6" width="32" height="12" rx="6" fill="#F3DCB8" stroke="#C9A77A" stroke-width="1.2"/><rect x="-6" y="-4" width="12" height="8" rx="2" fill="#fff"/><path d="M-2 0 C-1 -3 2 -3 3 0" stroke="#6DBE5A" stroke-width="1.6" fill="none"/></g></g>' +
  '<rect x="114" y="138" width="12" height="16" rx="4" fill="#E6B494"/>' +
  '<path d="M76 110 C72 64 98 54 120 54 C142 54 168 64 164 110 C164 124 158 132 152 132 L88 132 C82 132 76 124 76 110 Z" fill="url(#hairRed)"/>' +
  '<circle cx="120" cy="108" r="40" fill="'+skin+'"/>' +
  '<path d="M80 102 C78 70 100 58 120 58 C140 58 162 70 160 102 C150 86 134 80 122 86 C108 78 90 84 80 102 Z" fill="url(#hairRed)"/>' +
  '<path d="M98 70 C108 64 124 63 136 68" stroke="#fff" stroke-width="4" opacity=".3" stroke-linecap="round" fill="none"/>' +
  '<path d="M99 102 Q105 98 111 101 M129 101 Q135 98 141 102" stroke="#9A3A18" stroke-width="2" fill="none" stroke-linecap="round"/>' +
  '<ellipse cx="106" cy="115" rx="5.5" ry="7" fill="#2E4A3A"/><ellipse cx="134" cy="115" rx="5.5" ry="7" fill="#2E4A3A"/>' +
  '<circle cx="108" cy="112" r="2" fill="#fff"/><circle cx="136" cy="112" r="2" fill="#fff"/>' +
  '<g fill="#C9784A" opacity=".55"><circle cx="96" cy="124" r="1.4"/><circle cx="100" cy="128" r="1.4"/><circle cx="92" cy="128" r="1.2"/><circle cx="144" cy="124" r="1.4"/><circle cx="140" cy="128" r="1.4"/><circle cx="148" cy="128" r="1.2"/></g>' +
  '<path d="M112 128 Q120 135 128 128" stroke="#7A3428" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
}
function acornBody(){
  var s='';
  /* leaf sign with a plaster across it */
  s+='<path d="M186 182 V138" stroke="url(#gwood)" stroke-width="5"/>' +
    '<g transform="translate(186 128)"><path d="M-22 4 C-20 -14 -2 -20 20 -14 C22 4 6 18 -22 4 Z" fill="url(#ptleaf)" stroke="#2F6B2C" stroke-width="1.5"/><path d="M-18 2 L16 -10" stroke="#2F6B2C" stroke-width="1" opacity=".5"/>' +
    '<g transform="rotate(-24)"><rect x="-12" y="-4" width="24" height="9" rx="4.5" fill="#F3DCB8" stroke="#C9A77A" stroke-width="1"/><rect x="-4" y="-2.5" width="8" height="6" rx="1.5" fill="#fff"/></g>' +
    '<g transform="translate(-10 8) scale(.7)"><path class="signheart" d="M0 -3 C-3 -7 -9 -5 -7 0 L0 6 L7 0 C9 -5 3 -7 0 -3 Z" fill="#E8574C"/></g></g>';
  /* acorn body */
  s+='<path d="M54 110 H166 C168 146 150 174 110 184 C70 174 52 146 54 110 Z" fill="url(#acornG)" stroke="#7A4420" stroke-width="1.5"/>' +
    '<ellipse cx="80" cy="140" rx="8" ry="22" fill="#fff" opacity=".22" filter="url(#fsoft)"/>' +
    /* windows that glow */
    '<circle cx="84" cy="134" r="10" fill="#7A4420"/><circle cx="84" cy="134" r="7.5" fill="url(#gglass)"/><circle class="gwin" cx="84" cy="134" r="7.5" fill="#FFD86A"/>' +
    '<circle cx="136" cy="134" r="10" fill="#7A4420"/><circle cx="136" cy="134" r="7.5" fill="url(#gglass)"/><circle class="gwin" cx="136" cy="134" r="7.5" fill="#FFD86A"/>' +
    '<path d="M98 180 V156 A12 12 0 0 1 122 156 V180 Z" fill="#5A3416"/><path d="M101 180 V157 A9 9 0 0 1 119 157 V180 Z" fill="#7FD3B5"/><circle cx="115" cy="170" r="1.8" fill="url(#ggold)"/>' +
    '<path d="M105 162 C106 158 110 158 110 161 C110 158 114 158 115 162 L110 167 Z" fill="#E8574C"/>';
  /* cap */
  s+='<path d="M40 114 C40 70 70 44 110 44 C150 44 180 70 180 114 C150 124 70 124 40 114 Z" fill="url(#capG)" stroke="#5E4220" stroke-width="1.5"/>';
  for(var r=0;r<4;r++){for(var i=0;i<8;i++){var cx=58+i*15+(r%2)*7, cy=66+r*13; if(cx>168-(r===0?20:0)||cx<52+(r===0?18:0))continue; s+='<path d="M'+(cx-6)+' '+cy+' Q'+cx+' '+(cy+7)+' '+(cx+6)+' '+cy+'" stroke="#5E4220" stroke-width="1.4" fill="none" opacity=".55"/>';}}
  s+='<path d="M110 44 C110 34 116 26 124 24" stroke="#5E4220" stroke-width="6" fill="none" stroke-linecap="round"/>' +
    '<path d="M124 24 C134 14 150 16 154 22 C146 32 132 32 124 24 Z" fill="url(#ptleaf)" stroke="#2F6B2C" stroke-width="1.2"/>' +
    '<ellipse cx="82" cy="70" rx="20" ry="8" transform="rotate(-24 82 70)" fill="#fff" opacity=".22" filter="url(#fsoft)"/>';
  return s;
}
/* ---------- Ginger's world: inside the hollow-tree clinic ---------- */
function clinicScene(){
  var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMax slice"><defs>' +
  '<radialGradient id="wall" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="#F3D2A2"/><stop offset=".6" stop-color="#D8A46A"/><stop offset="1" stop-color="#A86E3C"/></radialGradient>' +
  '<linearGradient id="win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE3F5"/><stop offset=".6" stop-color="#DDF0D0"/><stop offset="1" stop-color="#9FD283"/></linearGradient>' +
  '<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C08850"/><stop offset="1" stop-color="#8A5A30"/></linearGradient>' +
  '<linearGradient id="shelf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9A6234"/><stop offset="1" stop-color="#6A3F20"/></linearGradient>' +
  '<radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF2B0" stop-opacity=".9"/><stop offset="1" stop-color="#FFF2B0" stop-opacity="0"/></radialGradient>' +
  '<radialGradient id="leafb" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#A9DE8C"/><stop offset="1" stop-color="#4E9F45"/></radialGradient>' +
  '</defs>';
  s+='<rect width="1200" height="900" fill="url(#wall)"/>';
  /* tree rings in the wall */
  for(var r=1;r<9;r++){s+='<ellipse cx="600" cy="380" rx="'+(r*80)+'" ry="'+(r*62)+'" fill="none" stroke="#B57A44" stroke-width="3" opacity="'+(0.28-r*0.02)+'"/>';}
  /* round window with the forest outside */
  s+='<circle cx="600" cy="250" r="150" fill="#7A4E2A"/><circle cx="600" cy="250" r="132" fill="url(#win)"/>' +
    '<g opacity=".8"><circle cx="540" cy="300" r="40" fill="#86C462"/><circle cx="660" cy="290" r="50" fill="#6FAE55"/><rect x="536" y="300" width="8" height="60" fill="#8A5A30"/><rect x="656" y="300" width="8" height="60" fill="#8A5A30"/></g>' +
    '<path d="M600 118 V382 M468 250 H732" stroke="#7A4E2A" stroke-width="10"/>' +
    '<circle cx="600" cy="250" r="132" fill="none" stroke="#5A3416" stroke-width="6"/>';
  /* shelves with jars on the left, rolled bandages and books on the right */
  function jar(x,y,c,h){return '<rect x="'+(x-14)+'" y="'+(y-h)+'" width="28" height="'+h+'" rx="8" fill="'+c+'" opacity=".85" stroke="#fff" stroke-width="2"/><rect x="'+(x-10)+'" y="'+(y-h-8)+'" width="20" height="9" rx="3" fill="#8A5A30"/><rect x="'+(x-10)+'" y="'+(y-h/2-6)+'" width="20" height="12" rx="2" fill="#FFF8EE"/>';}
  s+='<rect x="40" y="250" width="300" height="18" rx="6" fill="url(#shelf)"/><rect x="40" y="420" width="300" height="18" rx="6" fill="url(#shelf)"/>';
  s+=jar(80,250,'#7FD3B5',60)+jar(130,250,'#F7A055',44)+jar(180,250,'#B3A4F0',70)+jar(232,250,'#F28CB3',50)+jar(290,250,'#7DBDE6',62);
  s+=jar(90,420,'#F8CF5A',50)+jar(150,420,'#7FD3B5',66)+'<path d="M200 420 v-40 h80 v40 Z" fill="#E8574C" opacity=".85"/><path d="M220 400 h40 M240 384 v32" stroke="#fff" stroke-width="0"/><ellipse cx="300" cy="404" rx="16" ry="16" fill="#fff" stroke="#E4D6C2" stroke-width="3"/>';
  s+='<rect x="860" y="250" width="300" height="18" rx="6" fill="url(#shelf)"/><rect x="860" y="420" width="300" height="18" rx="6" fill="url(#shelf)"/>';
  [[890,'#E8574C'],[912,'#6FB3DE'],[934,'#F8CF5A'],[956,'#7FD3B5'],[978,'#B3A4F0']].forEach(function(b,i){s+='<rect x="'+b[0]+'" y="'+(170+i%2*10)+'" width="20" height="'+(80-i%2*10)+'" rx="3" fill="'+b[1]+'"/>';});
  [[1040,236],[1090,236],[1065,206]].forEach(function(b){s+='<ellipse cx="'+b[0]+'" cy="'+b[1]+'" rx="24" ry="14" fill="#fff" stroke="#E4D6C2" stroke-width="3"/><ellipse cx="'+(b[0]-18)+'" cy="'+b[1]+'" rx="6" ry="14" fill="#F4EEE4" stroke="#E4D6C2" stroke-width="2"/>';});
  s+=jar(900,420,'#F28CB3',56)+jar(960,420,'#F7A055',40)+jar(1020,420,'#7DBDE6',66)+jar(1080,420,'#7FD3B5',48)+jar(1130,420,'#B3A4F0',58);
  /* hanging lanterns */
  [[420,0,160],[780,0,140]].forEach(function(l){s+='<path d="M'+l[0]+' 0 V'+l[2]+'" stroke="#5A3416" stroke-width="3"/><circle cx="'+l[0]+'" cy="'+(l[2]+30)+'" r="70" fill="url(#glow)"/><path d="M'+(l[0]-18)+' '+(l[2]+10)+' H'+(l[0]+18)+' L'+(l[0]+22)+' '+(l[2]+50)+' H'+(l[0]-22)+' Z" fill="#FFE28A" stroke="#8A5A30" stroke-width="3"/>';});
  /* floor */
  s+='<path d="M0 640 C300 620 900 620 1200 640 V900 H0 Z" fill="url(#floor)"/>';
  for(var p=0;p<7;p++){s+='<path d="M'+(p*200-60)+' 900 L'+(p*170+90)+' 636" stroke="#6E4626" stroke-width="3" opacity=".4"/>';}
  /* a little bed with a leaf blanket, left */
  s+='<g transform="translate(40 560)"><rect x="0" y="40" width="280" height="90" rx="14" fill="#8A5A30"/><rect x="10" y="20" width="260" height="60" rx="20" fill="#FFF8EE"/><ellipse cx="60" cy="34" rx="44" ry="20" fill="#fff" stroke="#E4D6C2" stroke-width="3"/>' +
    '<path d="M100 30 C160 0 260 10 274 40 C260 80 160 90 100 70 Z" fill="url(#leafb)" stroke="#2F6B2C" stroke-width="3"/><path d="M110 50 C160 40 220 40 268 40" stroke="#2F6B2C" stroke-width="2" opacity=".5"/>' +
    '<rect x="0" y="120" width="16" height="70" fill="#6A3F20"/><rect x="264" y="120" width="16" height="70" fill="#6A3F20"/></g>';
  /* mushroom stool and potted fern, right */
  s+='<g transform="translate(980 700)"><rect x="-18" y="0" width="36" height="80" rx="10" fill="#FFF8EE"/><ellipse cx="0" cy="0" rx="70" ry="30" fill="#E2463C"/><circle cx="-30" cy="-6" r="8" fill="#fff"/><circle cx="18" cy="-12" r="6" fill="#fff"/><circle cx="40" cy="2" r="5" fill="#fff"/></g>';
  s+='<g transform="translate(1110 690)"><path d="M-40 0 H40 L30 90 H-30 Z" fill="#E9926A" stroke="#A9533A" stroke-width="3"/>';
  for(var f=0;f<7;f++){var a=-80+f*27; s+='<path d="M0 0 Q'+f2(Math.cos(a*Math.PI/180)*50)+' '+f2(-60+Math.sin(a*Math.PI/180)*20)+' '+f2(Math.cos((a-90)*Math.PI/180)*-80)+' '+f2(-100-Math.abs(f-3)*-10)+'" stroke="#4E9F45" stroke-width="8" fill="none" stroke-linecap="round"/>';}
  s+='</g>';
  s+='</svg>';
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
}
function houseBeat(){ if(!mem.sound)return; [0,.8,1.6].forEach(function(t){thump(t);thump(t+.22,true);}); }
/* ================= Ginger's clinic puzzles ================= */
/* 1. bandage the right body part */
/* three different patients for Plaster it and Find the joint */
var PATIENTS=[
  {skin:'#F3CBB0',line:'#B57650',hair:'#6A3F26',pj:'#B9DCF2',pjl:'#7FA9CB',style:'short'},
  {skin:'#B9805A',line:'#7A4A2C',hair:'#2A1E1A',pj:'#F6C1D6',pjl:'#C98AA6',style:'bunches'},
  {skin:'#F0C29A',line:'#B07A4E',hair:'#D9822B',pj:'#BFE3B5',pjl:'#7FB074',style:'long'}
];
function patientSVG(L,marks,who){
  var s='<svg class="patient" id="pa-svg" viewBox="0 0 240 '+(L===3?400:340)+'" role="img" aria-label="'+(L===3?'A skeleton':'A patient in pyjamas')+'">';
  s+='<rect data-part="none" x="0" y="0" width="240" height="'+(L===3?400:340)+'" rx="20" fill="#EAF7F1"/>';
  if(L<3){
    who=who||PATIENTS[0];
    var skin=who.skin, line=who.line, pj=who.pj;
    s+='<path d="M104 196 L98 262 L96 304 M136 196 L142 262 L144 304" stroke="'+pj+'" stroke-width="28" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    s+='<path d="M96 300 V310 M144 300 V310" stroke="'+skin+'" stroke-width="16" stroke-linecap="round"/>';
    s+='<ellipse cx="88" cy="318" rx="18" ry="9" fill="'+skin+'" stroke="'+line+'" stroke-width="2"/><ellipse cx="152" cy="318" rx="18" ry="9" fill="'+skin+'" stroke="'+line+'" stroke-width="2"/>';
    s+='<path d="M92 112 L62 160 L52 198 M148 112 L178 160 L188 198" stroke="'+pj+'" stroke-width="24" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    s+='<path d="M52 200 L49 210 M188 200 L191 210" stroke="'+skin+'" stroke-width="16" stroke-linecap="round"/>';
    s+='<circle cx="48" cy="220" r="12" fill="'+skin+'" stroke="'+line+'" stroke-width="2"/><circle cx="192" cy="220" r="12" fill="'+skin+'" stroke="'+line+'" stroke-width="2"/>';
    s+='<path d="M86 100 Q120 92 154 100 L160 206 H80 Z" fill="'+pj+'" stroke="'+who.pjl+'" stroke-width="2"/>';
    s+='<path d="M98 102 V204 M120 96 V206 M142 102 V204" stroke="#fff" stroke-width="5" opacity=".7"/>';
    s+='<path d="M80 108 L66 132 M160 108 L174 132" stroke="#fff" stroke-width="4" opacity=".6"/>';
    if(who.style==='long')s+='<path d="M86 52 C82 18 158 18 154 52 L162 112 C150 120 132 110 128 100 H112 C108 110 90 120 78 112 Z" fill="'+who.hair+'"/>';
    if(who.style==='bunches')s+='<circle cx="82" cy="50" r="15" fill="'+who.hair+'"/><circle cx="158" cy="50" r="15" fill="'+who.hair+'"/><circle cx="92" cy="44" r="4" fill="#F5C842"/><circle cx="148" cy="44" r="4" fill="#F5C842"/>';
    s+='<rect x="112" y="84" width="16" height="16" rx="5" fill="'+skin+'" opacity=".85"/>';
    s+='<circle cx="120" cy="56" r="34" fill="'+skin+'" stroke="'+line+'" stroke-width="2"/>';
    s+='<path d="M86 52 C86 22 154 22 154 52 C146 38 132 32 120 36 C108 32 94 38 86 52 Z" fill="'+who.hair+'"/>';
    s+='<circle cx="108" cy="58" r="3.5" fill="#2A1E1A"/><circle cx="132" cy="58" r="3.5" fill="#2A1E1A"/><path d="M110 72 Q120 78 130 72" stroke="#7A3428" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="100" cy="68" rx="5" ry="3" fill="#F28CB3" opacity=".45"/><ellipse cx="140" cy="68" rx="5" ry="3" fill="#F28CB3" opacity=".45"/>';
    var zf='fill="#fff" fill-opacity="0"', zs='stroke="#fff" stroke-opacity="0" fill="none" stroke-linecap="round" stroke-linejoin="round"';
    if(L===1){
      s+='<path data-part="arm" d="M92 112 L62 160 L52 202 M148 112 L178 160 L188 202" '+zs+' stroke-width="38"/>';
      s+='<path data-part="leg" d="M104 196 L98 262 L96 300 M136 196 L142 262 L144 300" '+zs+' stroke-width="40"/>';
      s+='<circle data-part="hand" cx="48" cy="221" r="17" '+zf+'/><circle data-part="hand" cx="192" cy="221" r="17" '+zf+'/>';
      s+='<ellipse data-part="foot" cx="88" cy="317" rx="23" ry="15" '+zf+'/><ellipse data-part="foot" cx="152" cy="317" rx="23" ry="15" '+zf+'/>';
      s+='<ellipse data-part="tummy" cx="120" cy="168" rx="28" ry="26" '+zf+'/>';
      s+='<circle data-part="head" cx="120" cy="56" r="40" '+zf+'/>';
    } else {
      s+='<circle data-part="elbow" cx="62" cy="160" r="18" '+zf+'/><circle data-part="elbow" cx="178" cy="160" r="18" '+zf+'/>';
      s+='<circle data-part="wrist" cx="51" cy="206" r="14" '+zf+'/><circle data-part="wrist" cx="189" cy="206" r="14" '+zf+'/>';
      s+='<circle data-part="knee" cx="98" cy="262" r="20" '+zf+'/><circle data-part="knee" cx="142" cy="262" r="20" '+zf+'/>';
      s+='<circle data-part="ankle" cx="96" cy="306" r="14" '+zf+'/><circle data-part="ankle" cx="144" cy="306" r="14" '+zf+'/>';
      s+='<circle data-part="shoulder" cx="92" cy="112" r="16" '+zf+'/><circle data-part="shoulder" cx="148" cy="112" r="16" '+zf+'/>';
      s+='<circle data-part="hip" cx="104" cy="198" r="15" '+zf+'/><circle data-part="hip" cx="136" cy="198" r="15" '+zf+'/>';
    }
  } else {
    var bone='#FFF8EE', bl='#9A8C78';
    function b(x1,y1,x2,y2,w){return '<path d="M'+x1+' '+y1+' L'+x2+' '+y2+'" stroke="'+bl+'" stroke-width="'+(w+4)+'" stroke-linecap="round"/><path d="M'+x1+' '+y1+' L'+x2+' '+y2+'" stroke="'+bone+'" stroke-width="'+w+'" stroke-linecap="round"/><circle cx="'+x1+'" cy="'+y1+'" r="'+(w*.8)+'" fill="'+bone+'" stroke="'+bl+'" stroke-width="2"/><circle cx="'+x2+'" cy="'+y2+'" r="'+(w*.8)+'" fill="'+bone+'" stroke="'+bl+'" stroke-width="2"/>';}
    s+=b(88,100,66,150,9)+b(64,156,54,204,7)+b(152,100,174,150,9)+b(176,156,186,204,7);
    s+='<circle cx="52" cy="216" r="9" fill="'+bone+'" stroke="'+bl+'" stroke-width="2"/><circle cx="188" cy="216" r="9" fill="'+bone+'" stroke="'+bl+'" stroke-width="2"/>';
    for(var v=0;v<15;v++){var vy=86+v*9; s+='<rect x="113" y="'+vy+'" width="14" height="7" rx="3" fill="'+bone+'" stroke="'+bl+'" stroke-width="1.5"/>';}
    for(var r=0;r<6;r++){var ry=106+r*12, w=40-Math.abs(r-2)*4; s+='<path d="M114 '+ry+' C'+(114-w)+' '+(ry-6)+' '+(118-w-8)+' '+(ry+10)+' '+(118-w)+' '+(ry+16)+' M126 '+ry+' C'+(126+w)+' '+(ry-6)+' '+(122+w+8)+' '+(ry+10)+' '+(122+w)+' '+(ry+16)+'" stroke="'+bl+'" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M114 '+ry+' C'+(114-w)+' '+(ry-6)+' '+(118-w-8)+' '+(ry+10)+' '+(118-w)+' '+(ry+16)+' M126 '+ry+' C'+(126+w)+' '+(ry-6)+' '+(122+w+8)+' '+(ry+10)+' '+(122+w)+' '+(ry+16)+'" stroke="'+bone+'" stroke-width="3" fill="none" stroke-linecap="round"/>';}
    s+='<rect x="115" y="100" width="10" height="62" rx="4" fill="'+bone+'" stroke="'+bl+'" stroke-width="1.5"/>';
    s+='<path d="M84 222 C82 204 104 206 120 218 C136 206 158 204 156 222 C156 240 140 250 120 246 C100 250 84 240 84 222 Z" fill="'+bone+'" stroke="'+bl+'" stroke-width="2"/><circle cx="104" cy="228" r="6" fill="#EAF7F1" stroke="'+bl+'" stroke-width="1.5"/><circle cx="136" cy="228" r="6" fill="#EAF7F1" stroke="'+bl+'" stroke-width="1.5"/>';
    s+=b(102,246,96,306,11)+b(138,246,144,306,11)+b(96,314,94,366,8)+b(144,314,146,366,8);
    s+='<ellipse cx="86" cy="378" rx="16" ry="7" fill="'+bone+'" stroke="'+bl+'" stroke-width="2"/><ellipse cx="154" cy="378" rx="16" ry="7" fill="'+bone+'" stroke="'+bl+'" stroke-width="2"/>';
    s+='<circle cx="120" cy="50" r="30" fill="'+bone+'" stroke="'+bl+'" stroke-width="2"/><path d="M104 72 H136 V84 C136 90 104 90 104 84 Z" fill="'+bone+'" stroke="'+bl+'" stroke-width="2"/><ellipse cx="108" cy="50" rx="7" ry="8" fill="#5E4E6C"/><ellipse cx="132" cy="50" rx="7" ry="8" fill="#5E4E6C"/><path d="M120 58 L116 66 H124 Z" fill="#5E4E6C"/><path d="M110 78 V86 M116 78 V87 M122 78 V87 M128 78 V86" stroke="'+bl+'" stroke-width="1.5"/>';
    var zf3='fill="#fff" fill-opacity="0"';
    s+='<ellipse data-part="ribs" cx="120" cy="134" rx="48" ry="38" '+zf3+'/>';
    s+='<rect data-part="spine" x="108" y="168" width="24" height="42" '+zf3+'/><rect data-part="spine" x="108" y="84" width="24" height="18" '+zf3+'/>';
    s+='<ellipse data-part="pelvis" cx="120" cy="228" rx="42" ry="22" '+zf3+'/>';
    s+='<path data-part="femur" d="M102 252 L96 304 M138 252 L144 304" stroke="#fff" stroke-opacity="0" stroke-width="30" stroke-linecap="round"/>';
    s+='<circle data-part="skull" cx="120" cy="56" r="38" '+zf3+'/>';
    s+='<path data-part="humerus" d="M86 104 L67 146 M154 104 L173 146" stroke="#fff" stroke-opacity="0" stroke-width="22" stroke-linecap="round"/>';
    s+='<path data-part="tibia" d="M96 318 L94 362 M144 318 L146 362" stroke="#fff" stroke-opacity="0" stroke-width="24" stroke-linecap="round"/>';
  }
  (marks||[]).forEach(function(m){
    s+= L===3 ? '<path d="'+STAR+'" transform="translate('+f2(m[0])+' '+f2(m[1])+') scale(1.4) translate(-182 -146)" fill="url(#ggold)" stroke="#B8861E" stroke-width="1" pointer-events="none"/>'
             : '<g transform="translate('+f2(m[0])+' '+f2(m[1])+') rotate(-24)" pointer-events="none"><rect x="-17" y="-7" width="34" height="14" rx="7" fill="#F3DCB8" stroke="#C9A77A" stroke-width="1.5"/><rect x="-6" y="-5" width="12" height="10" rx="2" fill="#fff"/><g fill="#C9A77A"><circle cx="-12" cy="-2" r="1"/><circle cx="-11" cy="3" r="1"/><circle cx="12" cy="-2" r="1"/><circle cx="11" cy="3" r="1"/></g></g>';
  });
  return s+'</svg>';
}
function pzBandage(area,L){
  var targets = L===1 ? shuffle(['head','arm','leg','hand','foot','tummy']).slice(0,3) : L===2 ? shuffle(['elbow','knee','wrist','ankle','shoulder','hip']).slice(0,3) : shuffle(['skull','ribs','spine','pelvis','femur','humerus','tibia']).slice(0,3);
  var marks=[], whos=shuffle(PATIENTS);
  setSay(L===3?'Ginger is teaching about bones. Tap the bone she names to put a gold star on it.':'Three patients need your help. Tap the sore part of each patient to put a plaster on it.');
  rounds(3,function(k,next){
    var t=targets[k], who=whos[k];
    if(L<3)marks=[];
    var q = L===3 ? 'Tap the '+(t==='ribs'?'ribs':t==='spine'?'spine':'bone called the '+t)+'.' : (k===0?'This':'Here is a new')+' patient'+(k===0?' has':'. They have')+' hurt their '+t+'. Tap the '+t+'.';
    area.innerHTML=roundNote(k,3)+'<p class="say-small">'+esc(q)+'</p><div class="panel patient-wrap">'+patientSVG(L,marks,who)+'</div>';
    if(k>0)speak(q);
    var sv=$('#pa-svg'), done=false;
    sv.addEventListener('click',function(e){
      if(done)return;
      var el=e.target.closest?e.target.closest('[data-part]'):null; if(!el)return;
      var part=el.getAttribute('data-part'); done=true;
      var pt=sv.createSVGPoint(); pt.x=e.clientX; pt.y=e.clientY; var m=sv.getScreenCTM(); var q2=m?pt.matrixTransform(m.inverse()):{x:120,y:150};
      if(part===t){marks.push([q2.x,q2.y]);sv.outerHTML=patientSVG(L,marks,who);tick();later(function(){next(true);},L<3?900:500);}
      else next(false);
    });
  });
}
/* 2. which part helps you */
var SENSES={see:{pic:'eye',name:'sight'},hear:{pic:'ear',name:'hearing'},smell:{pic:'nose',name:'smell'},taste:{pic:'tongue',name:'taste'},touch:{pic:'hand',name:'touch'}};
var SENSE_FACTS=[
  ['You can tell the bath water is too hot before you get in.','touch'],
  ['You know the toast is burning before you can see it.','smell'],
  ['You can tell a lemon is sour.','taste'],
  ['You know someone is calling your name from the next room.','hear'],
  ['You can tell red from green at the traffic lights.','see'],
  ['You can find the light switch in the dark.','touch'],
  ['You know the milk has gone off without tasting it.','smell'],
  ['You notice the soup needs a little more salt.','taste'],
  ['You can read the words in a book.','see'],
  ['You can tell a storm is far away because the thunder is quiet.','hear'],
  ['You know there are biscuits baking in the kitchen.','smell'],
  ['You can feel that the cat’s fur is soft.','touch'],
  ['You spot a rainbow in the sky.','see'],
  ['You know your friend is at the door when the bell rings.','hear'],
  ['You can tell your toothpaste is minty.','taste'],
  ['You notice your feet are cold.','touch'],
  ['You know the flowers in the garden smell sweet.','smell'],
  ['You can tell which ice cream is strawberry with your eyes shut.','taste'],
  ['You find your friend in a crowd by the colour of their coat.','see'],
  ['You know a bee is close because you hear it buzz.','hear']
];
function pzSenses(area,L){
  if(L===3){
    var fs=shuffle(SENSE_FACTS).slice(0,3);
    setSay('Which sense helps you most? Read each one and pick the sense.');
    rounds(3,function(k,next){
      var f=fs[k], ans=f[1], opts=[ans].concat(shuffle(Object.keys(SENSES).filter(function(x){return x!==ans;})).slice(0,3));
      area.innerHTML=roundNote(k,3)+'<p class="say-small">'+esc(f[0])+'</p><div class="opts" id="se2-opts"></div>';
      if(k>0)speak(f[0]);
      shuffle(opts).forEach(function(x){var b=optBtn(picSVG2(SENSES[x].pic)+'<span class="optlab">'+SENSES[x].name+'</span>',SENSES[x].name,'picword');b.addEventListener('click',function(){next(x===ans);});$('#se2-opts').appendChild(b);});
    });
    return;
  }
  var list = L===1 ? shuffle(['see','hear','smell']) : shuffle(Object.keys(SENSES)).slice(0,3);
  setSay('Which part of your body helps you? Tap the picture.');
  rounds(3,function(k,next){
    var ans=list[k], opts = L===1 ? ['see','hear','smell'] : [ans].concat(shuffle(Object.keys(SENSES).filter(function(x){return x!==ans;})).slice(0,3));
    var q='Which part helps you '+ans+'?';
    area.innerHTML=roundNote(k,3)+'<p class="say-small">'+esc(q)+'</p><div class="opts" id="se2-opts"></div>';
    if(k>0)speak(q);
    picOpts($('#se2-opts'),opts.map(function(x){return SENSES[x].pic;}),SENSES[ans].pic,next,L===1?function(p){return 'Picture: '+({eye:'eye',ear:'ear',nose:'nose'}[p]);}:null);
  });
}
/* 3. count the heartbeats */
function heartSVG(){return '<svg class="bigheart" viewBox="0 0 200 180" role="img" aria-label="A beating heart"><path class="heart" id="hb-heart" d="M100 168 C40 124 8 92 8 56 C8 26 32 8 58 8 C78 8 92 20 100 34 C108 20 122 8 142 8 C168 8 192 26 192 56 C192 92 160 124 100 168 Z" fill="url(#heartG)" stroke="#A3261E" stroke-width="4"/><ellipse cx="56" cy="46" rx="20" ry="12" fill="#fff" opacity=".35" transform="rotate(-30 56 46)"/></svg>';}
function beatHeart(){var h=$('#hb-heart');if(!h)return;h.classList.remove('beat');void h.getBoundingClientRect();h.classList.add('beat');}
function smallHeart(){return '<svg viewBox="0 0 20 18" aria-hidden="true"><path d="M10 17 C4 12 1 9 1 5.5 C1 2.5 3.5 1 6 1 C8 1 9.3 2.2 10 3.5 C10.7 2.2 12 1 14 1 C16.5 1 19 2.5 19 5.5 C19 9 16 12 10 17 Z" fill="#E8574C"/></svg>';}
function stopwatch(label){return '<svg viewBox="0 0 100 110" aria-hidden="true"><rect x="42" y="2" width="16" height="10" rx="3" fill="#6E7888"/><circle cx="50" cy="62" r="42" fill="#fff" stroke="#6E7888" stroke-width="6"/><path d="M50 62 L50 30" stroke="#E8574C" stroke-width="4" stroke-linecap="round"/><path d="M50 62 L'+(label==='15'?'78 62':'50 30')+'" stroke="#3B2A4A" stroke-width="4" stroke-linecap="round"/>'+(label==='15'?'<path d="M50 62 L50 26 A36 36 0 0 1 86 62 Z" fill="#E8574C" opacity=".2"/>':'<circle cx="50" cy="62" r="36" fill="#E8574C" opacity=".2"/>')+'<circle cx="50" cy="62" r="4" fill="#3B2A4A"/></svg>';}
function pzHeart(area,L){
  if(L===3){
    var who=shuffle([['a person',15,25],['a cat',30,45],['a rabbit',35,55],['a puppy',22,35]]), dogs=shuffle([['a dog',18,30],['a person',16,24],['a horse',8,11],['a pony',8,12]]);
    setSay('Doctors count heartbeats for 15 seconds, then work out the beats in a whole minute.');
    rounds(2,function(k,next){
      var q, ans, cands, card;
      if(k===0){
        var a=who[0], n=rnd(a[1],a[2]); ans=n*4; cands=[n*2,n+60,ans+4,ans-4];
        q='The heart of '+a[0]+' beat '+n+' times in 15 seconds. How many times would it beat in one minute?';
        card='<div class="stat">'+stopwatch('15')+'<span>15 seconds</span></div><div class="stat">'+smallHeart().replace('<svg','<svg style="width:70px;height:70px"')+'<span>'+n+' beats</span></div>';
      } else {
        var d=dogs[0], kq=rnd(d[1],d[2]), m=kq*4; ans=kq; cands=[kq*2,m/2,kq+4,kq-1];
        q='In one minute, the heart of '+d[0]+' beat '+m+' times. How many beats is that in 15 seconds?';
        card='<div class="stat">'+stopwatch('60')+'<span>1 minute</span></div><div class="stat">'+smallHeart().replace('<svg','<svg style="width:70px;height:70px"')+'<span>'+m+' beats</span></div>';
      }
      area.innerHTML=roundNote(k,2)+'<div class="panel statcard">'+card+'</div><p class="say-small">'+esc(q)+'</p><div class="opts" id="hb-opts"></div>';
      speak(q);
      numOpts($('#hb-opts'),ans,cands,next);
    });
    return;
  }
  var n = L===1 ? rnd(3,10) : rnd(3,10), total = L===1 ? n : n*2;
  setSay(L===1?'Tap Listen. Watch the heart and count each beat.':'Tap Listen. The heart goes lub-dub, two beats at a time. Count in 2s.');
  area.innerHTML='<div class="panel heart-wrap">'+heartSVG()+'</div>'+(L===2?'<div class="hstrip" id="hb-strip" aria-label="Beats heard so far"></div>':'')+'<button class="btn leaf" id="hb-go">'+IC.speak+' Listen</button><p class="say-small" id="hb-q" hidden>How many beats did you count?</p><div class="opts" id="hb-opts" hidden></div>';
  var busy=false;
  numOpts($('#hb-opts'),total,L===1?[n+1,n-1,n+2]:[total+2,total-2,n],function(ok){finish(ok);});
  $('#hb-go').addEventListener('click',function(){
    if(busy)return; busy=true; var b=this; b.disabled=true;
    if(L===2)$('#hb-strip').innerHTML='';
    for(var i=0;i<n;i++){(function(i){
      if(L===1){later(function(){thump(0);beatHeart();},500+i*800);}
      else {
        later(function(){thump(0);beatHeart();var p=document.createElement('span');p.className='hpair';p.innerHTML=smallHeart();$('#hb-strip').appendChild(p);},500+i*1000);
        later(function(){thump(0,true);beatHeart();var ps=$('#hb-strip').lastChild;if(ps)ps.insertAdjacentHTML('beforeend',smallHeart());},760+i*1000);
      }
    })(i);}
    var end=L===1?500+n*800:500+n*1000;
    later(function(){busy=false;b.disabled=false;b.innerHTML=IC.speak+' Listen again';$('#hb-q').hidden=false;$('#hb-opts').hidden=false;},end);
  });
}
/* 4. pack the first-aid kit by shape */
function solidIcon(k){
  if(k==='cylinder')return '<path d="M26 26 V74 C26 84 74 84 74 74 V26" fill="#F7A055" stroke="#3B2A4A" stroke-width="4"/><ellipse cx="50" cy="26" rx="24" ry="9" fill="#FBC28E" stroke="#3B2A4A" stroke-width="4"/>';
  if(k==='cuboid')return '<path d="M14 36 L44 22 L86 32 L56 48 Z" fill="#B9DCF2" stroke="#3B2A4A" stroke-width="4" stroke-linejoin="round"/><path d="M14 36 V70 L56 84 V48 Z" fill="#7DBDE6" stroke="#3B2A4A" stroke-width="4" stroke-linejoin="round"/><path d="M56 48 L86 32 V66 L56 84 Z" fill="#3E7FB0" stroke="#3B2A4A" stroke-width="4" stroke-linejoin="round"/>';
  return '<circle cx="50" cy="50" r="34" fill="#F28CB3" stroke="#3B2A4A" stroke-width="4"/><ellipse cx="50" cy="50" rx="34" ry="11" fill="none" stroke="#3B2A4A" stroke-width="2" stroke-dasharray="5 4"/><ellipse cx="38" cy="36" rx="9" ry="5" fill="#fff" opacity=".6"/>';
}
/* Pack the kit (Little Sprite and Clever Pixie): each piece of doctor's kit is a shape, and it fits the space of the same shape in the bag.
   Tap a piece, then tap a space. Tap a packed piece to take it out. Check when every space is filled. */
var BAGKIT={
  stethoscope:{name:'stethoscope',shape:'long thin rectangle',w:210,h:50,fill:'#B3A4F0',edge:'#6C5BC4'},
  thermometer:{name:'thermometer',shape:'small rectangle',w:100,h:40,fill:'#F8CF5A',edge:'#B8861E'},
  bandage:{name:'bandage roll',shape:'big circle',w:88,h:88,fill:'#F28CB3',edge:'#B8467A'},
  cotton:{name:'cotton wool ball',shape:'small circle',w:48,h:48,fill:'#7DBDE6',edge:'#3E7FB0'},
  plasters:{name:'box of plasters',shape:'square',w:84,h:84,fill:'#F7A055',edge:'#B8661E'},
  sling:{name:'sling',shape:'triangle',w:104,h:86,fill:'#7FD3B5',edge:'#2E8A68'},
  icepack:{name:'ice pack',shape:'oval',w:118,h:66,fill:'#C9B8F5',edge:'#6C5BC4'}
};
function kitOutline(k){
  var t=BAGKIT[k], w=t.w, h=t.h;
  if(t.shape.indexOf('circle')>=0)return '<circle cx="0" cy="0" r="'+(w/2)+'"';
  if(t.shape==='oval')return '<ellipse cx="0" cy="0" rx="'+(w/2)+'" ry="'+(h/2)+'"';
  if(t.shape==='triangle')return '<path d="M0 '+(-h/2)+' L'+(w/2)+' '+(h/2)+' L'+(-w/2)+' '+(h/2)+' Z" stroke-linejoin="round"';
  return '<rect x="'+(-w/2)+'" y="'+(-h/2)+'" width="'+w+'" height="'+h+'" rx="'+(t.shape==='square'?10:12)+'"';
}
function kitPicture(k){
  if(k==='stethoscope')return '<path d="M-86 -14 C-92 8 -76 16 -62 6 M-62 -14 C-56 6 -66 14 -62 6 L-50 4 C-20 -2 10 10 44 2" stroke="#3B2A4A" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="-86" cy="-15" r="5" fill="#5E6878"/><circle cx="-62" cy="-15" r="5" fill="#5E6878"/><circle cx="66" cy="0" r="19" fill="#D7DEE8" stroke="#3B2A4A" stroke-width="6"/><circle cx="66" cy="0" r="8" fill="#9AA6B8"/>';
  if(k==='thermometer')return '<rect x="-34" y="-7" width="62" height="14" rx="7" fill="#fff" stroke="#3B2A4A" stroke-width="3"/><rect x="-28" y="-3" width="34" height="6" rx="3" fill="#E8574C"/><circle cx="34" cy="0" r="10" fill="#E8574C" stroke="#3B2A4A" stroke-width="3"/><path d="M-20 -7 V-2 M-10 -7 V-2 M0 -7 V-2 M10 -7 V-2" stroke="#3B2A4A" stroke-width="2"/>';
  if(k==='bandage')return '<circle r="30" fill="#FFF8EE" stroke="#C9B49A" stroke-width="3"/><circle r="20" fill="none" stroke="#E4D6C2" stroke-width="2"/><circle r="11" fill="#E4D6C2" stroke="#C9B49A" stroke-width="2"/><path d="M28 10 L44 18 L40 26 L22 18" fill="#FFF8EE" stroke="#C9B49A" stroke-width="2"/>';
  if(k==='cotton')return '<g fill="#fff" stroke="#C9D4E2" stroke-width="1.5"><circle cx="-7" cy="2" r="9"/><circle cx="7" cy="2" r="9"/><circle cx="0" cy="-7" r="9"/><circle cx="0" cy="6" r="8" stroke="none"/></g>';
  if(k==='plasters')return '<rect x="-30" y="-24" width="60" height="48" rx="6" fill="#fff" stroke="#3B2A4A" stroke-width="3"/><g transform="rotate(-20)"><rect x="-22" y="-8" width="44" height="16" rx="8" fill="#F3DCB8" stroke="#C9A77A" stroke-width="2"/><rect x="-7" y="-6" width="14" height="12" rx="2" fill="#fff"/></g>';
  if(k==='sling')return '<path d="M0 -22 L30 28 L-30 28 Z" fill="#fff" fill-opacity=".85" stroke="#2E8A68" stroke-width="3" stroke-linejoin="round"/><path d="M-12 8 L12 8 M-20 20 L20 20" stroke="#2E8A68" stroke-width="2" stroke-dasharray="4 3"/><circle cx="0" cy="-8" r="4" fill="#2E8A68"/>';
  return '<rect x="-38" y="-18" width="76" height="36" rx="16" fill="#E6F2FC" stroke="#3E7FB0" stroke-width="3"/><g stroke="#3E7FB0" stroke-width="3" stroke-linecap="round"><path d="M0 -11 V11 M-10 -6 L10 6 M-10 6 L10 -6"/></g>';
}
function kitPiece(k){
  var t=BAGKIT[k];
  return '<g class="kitp">'+kitOutline(k)+' fill="'+t.fill+'" stroke="'+t.edge+'" stroke-width="4"/>'+kitPicture(k)+'</g>';
}
function kitPieceSVG(k,sc){
  var t=BAGKIT[k]; sc=sc||.62;
  return '<svg viewBox="'+(-t.w/2-6)+' '+(-t.h/2-6)+' '+(t.w+12)+' '+(t.h+12)+'" width="'+Math.round((t.w+12)*sc)+'" height="'+Math.round((t.h+12)*sc)+'" aria-hidden="true">'+kitPiece(k)+'</svg>';
}
var BAG_LAYOUT={
  1:[['stethoscope',190,150],['thermometer',440,150],['bandage',190,272],['plasters',440,272]],
  2:[['stethoscope',180,148],['thermometer',382,148],['cotton',500,148],['bandage',120,270],['icepack',258,270],['plasters',394,270],['sling',515,272]]
};
function pzKit(area,L){
  if(L===3){pzSolids(area,L);return;}
  var flip=Math.random()<.5, W=620;
  var holes=BAG_LAYOUT[L].map(function(h,i){return {i:i,k:h[0],x:flip?W-h[1]:h[1],y:h[2],got:null};});
  var pieces=shuffle(holes.map(function(h){return h.k;})).map(function(k,i){return {id:i,k:k,hole:null};});
  setSay(L===1?'Pack Ginger’s doctor’s bag. Each thing fits the space with the same shape. Tap a thing, then tap its space. Then tap Check.':'Pack the doctor’s bag. Look carefully at the shapes and sizes. Tap a thing, then tap the space it fits. Then tap Check.');
  area.innerHTML='<div class="panel bag-wrap"><svg class="bagsvg" id="kb-bag" viewBox="0 0 '+W+' 360" role="group" aria-label="An open doctor’s bag with shaped spaces"></svg></div><div class="tray" id="kb-tray" aria-label="Things to pack"></div><button class="btn" id="kb-check" disabled>Check</button>';
  var sel=null;
  function draw(){
    var b='<path d="M232 44 C232 6 388 6 388 44" stroke="#5A3418" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M232 44 C232 6 388 6 388 44" stroke="#8A5A30" stroke-width="8" fill="none" stroke-linecap="round"/>';
    b+='<rect x="14" y="40" width="'+(W-28)+'" height="312" rx="34" fill="#7A4322" stroke="#4E2812" stroke-width="4"/>';
    b+='<rect x="34" y="88" width="'+(W-68)+'" height="246" rx="22" fill="#F6E7CF" stroke="#4E2812" stroke-width="3"/>';
    b+='<path d="M14 76 H'+(W-14)+'" stroke="#4E2812" stroke-width="4"/><rect x="'+(W/2-26)+'" y="56" width="52" height="24" rx="6" fill="#F5C842" stroke="#B8861E" stroke-width="3"/>';
    b+='<path d="M'+(W/2)+' 60 C'+(W/2-6)+' 54 '+(W/2-14)+' 60 '+(W/2)+' 74 C'+(W/2+14)+' 60 '+(W/2+6)+' 54 '+(W/2)+' 60 Z" fill="#E06A98"/>';
    holes.forEach(function(h){
      var lab='Space shaped like a '+BAGKIT[h.k].shape+(h.got!=null?', with the '+BAGKIT[pieces[h.got].k].name+' in it. Tap to take it out':'');
      b+='<g class="kbhole" data-i="'+h.i+'" tabindex="0" role="button" aria-label="'+esc(lab)+'" transform="translate('+h.x+' '+h.y+')">';
      b+=kitOutline(h.k)+' fill="#D9C2A0" stroke="#8A6A44" stroke-width="3" stroke-dasharray="8 6"/>';
      if(h.got!=null)b+=kitPiece(pieces[h.got].k);
      b+='</g>';
    });
    $('#kb-bag').innerHTML=b;
    var tray=$('#kb-tray'); tray.innerHTML='';
    var bw=$('#kb-bag').getBoundingClientRect().width, sc=bw?Math.max(.45,Math.min(1,bw/W)):.62;
    var left=pieces.filter(function(p){return p.hole==null;});
    if(!left.length)tray.innerHTML='<span class="tray-empty">All packed. Tap Check.</span>';
    left.forEach(function(p){
      var bt=optBtn(kitPieceSVG(p.k,sc),'The '+BAGKIT[p.k].name+', shaped like a '+BAGKIT[p.k].shape,'kitbtn');
      bt.setAttribute('aria-pressed',String(sel===p.id));
      bt.addEventListener('click',function(){sel=(sel===p.id?null:p.id);tick();draw();});
      tray.appendChild(bt);
    });
    $('#kb-check').disabled=left.length>0;
    $('#kb-bag').querySelectorAll('.kbhole').forEach(function(g){
      function go(){
        var h=holes[+g.getAttribute('data-i')];
        if(sel!=null){
          if(h.got!=null)pieces[h.got].hole=null;
          var p=pieces[sel]; h.got=p.id; p.hole=h.i; sel=null; tick(); draw();
        } else if(h.got!=null){pieces[h.got].hole=null; h.got=null; tick(); draw();}
      }
      g.addEventListener('click',go);
      g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}});
    });
  }
  $('#kb-check').addEventListener('click',function(){finish(holes.every(function(h){return h.got!=null&&pieces[h.got].k===h.k;}));});
  draw();
}
function pzSolids(area,L){
  var items=[], zones;
  var LAB={kcircle:'round plaster',pill:'round tablet',ksquare:'square gauze pad',ktriangle:'triangle bandage',krectangle:'long plaster',koval:'oval ice pad',roll:'roll of bandage',pillpot:'pot of tablets',tube:'tube of cream',box:'box of plasters',icepack:'ice pack',cotton:'cotton wool ball',ball:'squeezy ball',marble:'glass marble'};
  var groups;
  if(L===3){
    groups={cylinder:['roll','pillpot','tube'],cuboid:['box','icepack','box'],sphere:['cotton','ball','marble']};
    zones=[{id:'cylinder',label:'Cylinders',icon:solidIcon('cylinder')},{id:'cuboid',label:'Cuboids',icon:solidIcon('cuboid')},{id:'sphere',label:'Spheres',icon:solidIcon('sphere')}];
  } else {
    groups={circle:['kcircle','pill'],square:['ksquare','ksquare'],triangle:['ktriangle','ktriangle']};
    if(L===2){groups.rectangle=['krectangle','krectangle'];groups.oval=['koval','koval'];}
    var names={circle:'Circles',square:'Squares',triangle:'Triangles',rectangle:'Rectangles',oval:'Ovals'};
    zones=Object.keys(groups).map(function(g){return {id:g,label:names[g],icon:iconShape(g).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')};});
  }
  var id=0; Object.keys(groups).forEach(function(g){groups[g].forEach(function(k){items.push({id:id++,html:picSVG2(k),label:LAB[k],want:g});});});
  items=shuffle(items); items.forEach(function(it,i){it.id=i;});
  setSay(L===3?'Pack the first-aid kit. Put each thing with its solid shape. Tap a thing, then tap its shape. Tap Check when they are all packed.':'Pack the first-aid kit. Put each thing with its shape. Tap a thing, then tap its shape. Tap Check when they are all packed.');
  sorter(area,items,zones,{zoneWord:'Shape'});
}
/* 5. body words */
function pzBodyWords(area,L){ multi(area,L,3,function(R){pzBodyWords1(area,L,R);}); }
function pzBodyWords1(area,L,R){
  if(L===3){
    var w=R.fresh(['thumb','tooth','mouth','tongue','elbow','finger','heart','bone','knee']), all=[];for(var i=0;i<w.length;i++)all.push(i);
    setSay('Spell the word for this picture. Tap the letters in order.');
    area.innerHTML='<div class="pic">'+picSVG2(w)+'</div>';
    speller(area,w,all,extraLetters(w,2),function(ok){finish(ok);});
    return;
  }
  var pool = L===1 ? ['hand','foot','eye','ear','nose','arm','leg','mouth'] : ['hand','foot','eye','ear','nose','mouth','tooth','arm','leg','thumb','tongue','heart','bone'];
  var target=R.fresh(pool), opts=[target].concat(shuffle(pool.filter(function(x){return x!==target;})).slice(0,L===1?2:3));
  setSay(L===1?'Which picture goes with this word? Tap the word to hear it.':'Read the word. Then tap its picture.');
  area.innerHTML=(L===1?'<button class="bigword wordbtn" id="bw-word" aria-label="The word '+target+'. Tap to hear it.">'+target+'</button>':'<div class="bigword">'+target+'</div>')+'<div class="opts" id="bw-opts"></div>';
  if(L===1)$('#bw-word').addEventListener('click',function(){speak(target,true);});
  picOpts($('#bw-opts'),opts,target,function(ok){finish(ok);},L===1?function(k){return 'Picture: '+k;}:null);
}
/* her puzzle pictures (100 x 100), added to the shared picture list; any fairy can use them by name */
Object.assign(PICS2,{
  heart:'<path d="M50 88 C20 66 8 52 8 34 C8 20 20 10 32 10 C40 10 46 16 50 22 C54 16 60 10 68 10 C80 10 92 20 92 34 C92 52 80 66 50 88 Z" fill="#E8574C" stroke="#9C241C" stroke-width="3"/><path d="M24 26 C20 30 18 36 20 42" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/>',
  bone:'<g transform="rotate(-35 50 50)"><g fill="#FFF8EE" stroke="#9A8C78" stroke-width="3"><circle cx="20" cy="41" r="11"/><circle cx="20" cy="59" r="11"/><circle cx="80" cy="41" r="11"/><circle cx="80" cy="59" r="11"/></g><rect x="20" y="43" width="60" height="14" fill="#FFF8EE"/><path d="M27 43 H73 M27 57 H73" stroke="#9A8C78" stroke-width="3"/></g>',
  knee:'<path d="M4 26 H56 C70 26 80 36 80 50 V84 C80 86 82 88 86 88 H94 V96 H62 C60 96 58 94 58 92 V58 C58 55 56 54 53 54 H4 Z" fill="#F3CBB0" stroke="#B57650" stroke-width="3" stroke-linejoin="round"/><path d="M4 26 H50 V54 H4 Z" fill="#7DBDE6" stroke="#2E6290" stroke-width="3" stroke-linejoin="round"/><circle cx="68" cy="40" r="10" fill="#E8A888" opacity=".6"/><path d="M60 32 C66 28 74 30 76 36" stroke="#B57650" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
  eye:'<path d="M8 50 C26 24 74 24 92 50 C74 76 26 76 8 50 Z" fill="#fff" stroke="#3B2A4A" stroke-width="3"/><circle cx="50" cy="50" r="17" fill="#7DBDE6" stroke="#3E7FB0" stroke-width="2"/><circle cx="50" cy="50" r="8" fill="#2A1E1A"/><circle cx="55" cy="44" r="4" fill="#fff"/><path d="M18 34 L12 26 M34 26 L32 16 M50 24 V14 M66 26 L68 16 M82 34 L88 26" stroke="#3B2A4A" stroke-width="3" stroke-linecap="round"/>',
  ear:'<path d="M60 12 C34 12 26 34 28 50 C30 62 40 64 40 76 C40 88 52 92 60 84 C80 66 84 46 80 30 C76 18 70 12 60 12 Z" fill="#F3CBB0" stroke="#B57650" stroke-width="3"/><path d="M62 28 C50 26 44 36 46 46 C48 52 56 50 58 56 C60 62 54 68 50 66" stroke="#B57650" stroke-width="3" fill="none" stroke-linecap="round"/>',
  nose:'<path d="M50 10 C46 30 34 52 28 62 C22 72 30 82 42 80 C46 86 54 86 58 80 C70 82 78 72 72 62 C66 52 54 30 50 10 Z" fill="#F3CBB0" stroke="#B57650" stroke-width="3" stroke-linejoin="round"/><ellipse cx="40" cy="72" rx="5" ry="3.5" fill="#B57650"/><ellipse cx="60" cy="72" rx="5" ry="3.5" fill="#B57650"/>',
  tongue:'<path d="M12 40 C30 30 70 30 88 40 C80 60 64 66 50 66 C36 66 20 60 12 40 Z" fill="#B8467A" stroke="#7A2A4A" stroke-width="3"/><path d="M30 46 C30 80 40 92 50 92 C60 92 70 80 70 46 Z" fill="#F49DBE" stroke="#B8467A" stroke-width="3"/><path d="M50 52 V78" stroke="#B8467A" stroke-width="2.5"/><path d="M14 40 C30 46 70 46 86 40" stroke="#fff" stroke-width="5"/>',
  mouth:'<path d="M10 46 C30 34 70 34 90 46 C80 72 64 80 50 80 C36 80 20 72 10 46 Z" fill="#E8708F" stroke="#9C2A4A" stroke-width="3"/><path d="M18 48 C34 56 66 56 82 48 L80 54 C66 60 34 60 20 54 Z" fill="#fff"/><path d="M10 46 C30 52 70 52 90 46" stroke="#9C2A4A" stroke-width="3" fill="none"/>',
  tooth:'<path d="M24 22 C34 12 44 18 50 20 C56 18 66 12 76 22 C86 34 80 50 76 62 C72 76 70 90 62 90 C54 90 56 68 50 68 C44 68 46 90 38 90 C30 90 28 76 24 62 C20 50 14 34 24 22 Z" fill="#fff" stroke="#7E92B8" stroke-width="3" stroke-linejoin="round"/><path d="M34 30 C32 36 32 42 34 48" stroke="#DCE6F5" stroke-width="5" fill="none" stroke-linecap="round"/>',
  hand:'<path d="M34 92 C24 80 20 66 22 52 C22 46 30 44 32 50 L34 60 V20 C34 14 42 14 42 20 V48 V14 C42 8 50 8 50 14 V48 V18 C50 12 58 12 58 18 V50 V28 C58 22 66 22 66 28 V62 C66 80 60 90 54 94 Z" fill="#F3CBB0" stroke="#B57650" stroke-width="3" stroke-linejoin="round"/>',
  foot:'<path d="M26 6 H48 C47 22 48 34 54 44 C62 54 74 58 84 62 C92 65 96 70 94 77 C92 83 86 85 78 85 H32 C22 85 15 80 15 70 C15 60 22 52 24 42 C26 30 26 18 26 6 Z" fill="#F3CBB0" stroke="#B57650" stroke-width="3" stroke-linejoin="round"/><path d="M75 60 C77 63 78 66 77 69 M68 57 C70 60 71 63 70 66" stroke="#B57650" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/><path d="M84 65 C89 65 92 68 92 72 C88 73 85 71 84 65 Z" fill="#FBE6DA" stroke="#B57650" stroke-width="1.8" stroke-linejoin="round"/><path d="M30 60 C28 66 30 72 34 76" stroke="#B57650" stroke-width="2" fill="none" stroke-linecap="round" opacity=".55"/><path d="M33 12 V36" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".5"/>',
  arm:'<path d="M10 40 H50 C60 40 66 46 68 56 L76 80" stroke="#B57650" stroke-width="22" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 40 H50 C60 40 66 46 68 56 L76 80" stroke="#F3CBB0" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="78" cy="86" r="10" fill="#F3CBB0" stroke="#B57650" stroke-width="3"/>',
  leg:'<path d="M42 8 V54 L40 84" stroke="#B57650" stroke-width="24" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M42 8 V54 L40 84" stroke="#F3CBB0" stroke-width="18" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 82 H66 C74 82 76 94 66 94 H30 Z" fill="#F3CBB0" stroke="#B57650" stroke-width="3"/>',
  thumb:'<path d="M30 52 H70 C78 52 78 62 70 62 C78 62 78 72 70 72 C76 72 76 82 68 82 H34 C24 82 20 76 20 66 V60 C20 54 24 52 30 52 Z" fill="#F3CBB0" stroke="#B57650" stroke-width="3" stroke-linejoin="round"/><path d="M34 52 C34 40 38 26 44 16 C48 10 58 12 56 22 C54 32 50 42 54 52" fill="#F3CBB0" stroke="#B57650" stroke-width="3" stroke-linejoin="round"/>',
  elbow:'<path d="M14 72 L46 30 L86 64" stroke="#B57650" stroke-width="22" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 72 L46 30 L86 64" stroke="#F3CBB0" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="46" cy="30" r="12" fill="none" stroke="#E8574C" stroke-width="3" stroke-dasharray="4 3"/>',
  finger:'<path d="M40 92 C30 80 28 66 30 56 C32 50 38 50 40 56 V18 C40 10 52 10 52 18 V54 C60 52 70 54 72 62 V80 C70 88 62 94 54 94 Z" fill="#F3CBB0" stroke="#B57650" stroke-width="3" stroke-linejoin="round"/><path d="M42 20 H50" stroke="#fff" stroke-width="3" stroke-linecap="round"/>',
  /* first-aid kit things: flat shapes */
  kcircle:'<circle cx="50" cy="50" r="34" fill="#F3DCB8" stroke="#C9A77A" stroke-width="3"/><circle cx="50" cy="50" r="16" fill="#fff"/><g fill="#C9A77A"><circle cx="30" cy="40" r="2"/><circle cx="70" cy="60" r="2"/><circle cx="36" cy="66" r="2"/><circle cx="64" cy="34" r="2"/></g>',
  ksquare:'<rect x="16" y="16" width="68" height="68" rx="6" fill="#fff" stroke="#9AB0D6" stroke-width="3"/><path d="M16 38 H84 M16 62 H84 M38 16 V84 M62 16 V84" stroke="#DCE6F5" stroke-width="3"/>',
  ktriangle:'<path d="M50 12 L90 84 H10 Z" fill="#7FD3B5" stroke="#357A31" stroke-width="3" stroke-linejoin="round"/><path d="M50 30 L76 76 H24 Z" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="5 4"/>',
  krectangle:'<rect x="6" y="34" width="88" height="32" rx="6" fill="#F3DCB8" stroke="#C9A77A" stroke-width="3"/><rect x="36" y="38" width="28" height="24" rx="3" fill="#fff"/><g fill="#C9A77A"><circle cx="16" cy="44" r="2"/><circle cx="24" cy="56" r="2"/><circle cx="78" cy="44" r="2"/><circle cx="86" cy="56" r="2"/></g>',
  koval:'<ellipse cx="50" cy="50" rx="40" ry="24" fill="#7DBDE6" stroke="#3E7FB0" stroke-width="3"/><path d="M50 26 V74" stroke="#fff" stroke-width="3"/><ellipse cx="36" cy="44" rx="8" ry="4" fill="#fff" opacity=".6"/>',
  /* first-aid kit things: solid shapes */
  roll:'<path d="M20 30 V70 C20 80 80 80 80 70 V30" fill="#fff" stroke="#9AB0D6" stroke-width="3"/><ellipse cx="50" cy="30" rx="30" ry="10" fill="#F4F8FE" stroke="#9AB0D6" stroke-width="3"/><ellipse cx="50" cy="30" rx="10" ry="3.5" fill="#DCE6F5"/><path d="M80 60 C88 64 92 74 88 84" stroke="#9AB0D6" stroke-width="3" fill="none"/>',
  pillpot:'<path d="M26 34 V78 C26 88 74 88 74 78 V34" fill="#F7A055" stroke="#B8661E" stroke-width="3"/><ellipse cx="50" cy="34" rx="24" ry="8" fill="#FFF8EE" stroke="#B8661E" stroke-width="3"/><rect x="26" y="48" width="48" height="18" fill="#fff"/><path d="M44 57 H56" stroke="#B8661E" stroke-width="3"/>',
  tube:'<path d="M34 16 V84 C34 90 66 90 66 84 V16" fill="#B3A4F0" stroke="#6C5BC4" stroke-width="3"/><ellipse cx="50" cy="16" rx="16" ry="5.5" fill="#E4DDFC" stroke="#6C5BC4" stroke-width="3"/><rect x="34" y="40" width="32" height="20" fill="#fff"/>',
  box:'<path d="M14 40 L42 26 L86 36 L58 52 Z" fill="#E4F2FB" stroke="#3E7FB0" stroke-width="3" stroke-linejoin="round"/><path d="M14 40 V70 L58 82 V52 Z" fill="#fff" stroke="#3E7FB0" stroke-width="3" stroke-linejoin="round"/><path d="M58 52 L86 36 V66 L58 82 Z" fill="#B9DCF2" stroke="#3E7FB0" stroke-width="3" stroke-linejoin="round"/><path d="M28 62 C30 56 38 56 40 62" stroke="#E8574C" stroke-width="3" fill="none"/>',
  icepack:'<path d="M10 46 L50 30 L90 42 L50 58 Z" fill="#DDF4FB" stroke="#3FAFC4" stroke-width="3" stroke-linejoin="round"/><path d="M10 46 V60 L50 74 V58 Z" fill="#BDEFF2" stroke="#3FAFC4" stroke-width="3" stroke-linejoin="round"/><path d="M50 58 L90 42 V56 L50 74 Z" fill="#8FDCE8" stroke="#3FAFC4" stroke-width="3" stroke-linejoin="round"/><path d="M40 40 l6 -3 M56 40 l6 2" stroke="#3FAFC4" stroke-width="2"/>',
  cotton:'<circle cx="50" cy="52" r="30" fill="#fff" stroke="#C9C3D6" stroke-width="3"/><path d="M30 46 C36 40 44 44 46 38 M56 66 C62 62 68 66 72 60 M40 64 C44 60 50 62 52 58" stroke="#DCD6E6" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="40" cy="38" rx="8" ry="5" fill="#fff"/>',
  ball:'<circle cx="50" cy="50" r="32" fill="#F28CB3" stroke="#B8467A" stroke-width="3"/><path d="M22 36 C40 46 60 46 78 36 M22 64 C40 54 60 54 78 64" stroke="#fff" stroke-width="4" fill="none"/><ellipse cx="38" cy="32" rx="8" ry="5" fill="#fff" opacity=".6"/>',
  pill:'<circle cx="50" cy="50" r="28" fill="#FFF3B0" stroke="#C9961E" stroke-width="3"/><ellipse cx="50" cy="50" rx="28" ry="10" fill="none" stroke="#E0B43A" stroke-width="2"/><ellipse cx="40" cy="38" rx="8" ry="5" fill="#fff" opacity=".7"/>'
});
/* petal icons for her flower (72 x 72) */
Object.assign(PZICON,{
  bandage:'<rect x="6" y="26" width="60" height="22" rx="11" fill="#F3DCB8" stroke="#C9A77A" stroke-width="3" transform="rotate(-24 36 37)"/><rect x="26" y="29" width="20" height="16" rx="3" fill="#fff" transform="rotate(-24 36 37)"/>',
  senses:'<g transform="translate(0 6) scale(.4)">'+PICS2.eye+'</g><g transform="translate(36 6) scale(.36)">'+PICS2.ear+'</g><g transform="translate(18 38) scale(.36)">'+PICS2.nose+'</g>',
  heartbeat:'<path d="M36 64 C14 48 4 36 4 22 C4 10 14 4 23 4 C30 4 34 9 36 14 C38 9 42 4 49 4 C58 4 68 10 68 22 C68 36 58 48 36 64 Z" fill="url(#heartG)" stroke="#A3261E" stroke-width="3"/><path d="M8 34 H24 L30 22 L38 46 L44 34 H64" stroke="#fff" stroke-width="3.5" fill="none" stroke-linejoin="round"/>',
  kit:'<rect x="6" y="20" width="60" height="42" rx="8" fill="#7FD3B5" stroke="#357A31" stroke-width="3"/><path d="M26 20 V12 H46 V20" stroke="#357A31" stroke-width="3" fill="none"/><path d="M36 30 C33 25 26 27 28 33 L36 41 L44 33 C46 27 39 25 36 30 Z" fill="#fff"/>',
  bwords:'<rect x="6" y="16" width="60" height="40" rx="12" fill="#fff" stroke="#3E9E7E" stroke-width="3"/><text x="36" y="45" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="21" font-weight="600" fill="#3E9E7E">hand</text>'
});
/* ---------- Ginger ---------- */
FAIRIES.ginger={id:'ginger',name:'Ginger',kind:'Doctor fairy',place:"Ginger's clinic",art:gingerArt,body:acornBody,houseLabel:"Ginger's acorn cottage",tapClass:'beat',tapMs:2600,onTap:houseBeat,
  facts:[
    'Your heart is about the size of your fist, and it beats about 100,000 times every day.',
    'A baby has about 300 bones. Some join together as you grow, so a grown-up has 206.',
    'The femur, in your thigh, is the longest bone in your body.',
    'Your skin is the biggest part of your body. It keeps germs out and lets you feel things.',
    'When you cut yourself, tiny bits of your blood called platelets stick together to make a scab.'
  ],
  scene:clinicScene,base:'#E9C9A0',foundBg:'#F6EBDD',
  foundGround:'<ellipse cx="170" cy="340" rx="150" ry="20" fill="#C08850"/><path d="M40 340 H300" stroke="#8A5A30" stroke-width="2" opacity=".5"/>',
  thanks:'Thank you for helping me look after my patients.',
  icon:'<path d="M50 84 C24 64 12 52 12 36 C12 24 22 16 32 16 C40 16 46 22 50 28 C54 22 60 16 68 16 C78 16 88 24 88 36 C88 52 76 64 50 84 Z" fill="#fff" stroke="#A3261E" stroke-width="3"/>',
  flowerBase:function(){
    return '<rect x="96" y="652" width="488" height="22" rx="8" fill="#8A5A30"/><rect x="96" y="652" width="488" height="7" rx="3" fill="#B07A48"/>' +
      '<path d="M340 380 C330 460 352 540 340 606" stroke="#2F6B2C" stroke-width="18" fill="none" stroke-linecap="round"/>' +
      '<path d="M340 380 C330 460 352 540 340 606" stroke="#4E9F45" stroke-width="11" fill="none" stroke-linecap="round"/>' +
      '<path d="M342 560 C382 524 432 528 452 546 C420 582 372 584 342 560 Z" fill="url(#ptleaf)" stroke="#2F6B2C" stroke-width="2.5"/>' +
      '<path d="M286 600 H394 L382 654 H298 Z" fill="url(#terracotta)" stroke="#8A3F22" stroke-width="3"/><rect x="278" y="590" width="124" height="18" rx="6" fill="#E9926A" stroke="#8A3F22" stroke-width="3"/>' +
      '<path d="M340 618 C336 612 328 614 330 621 L340 630 L350 621 C352 614 344 612 340 618 Z" fill="#fff"/>';
  },
  puz:[
    {id:'bandage',titles:['Plaster it','Find the joint','Name the bone'],run:pzBandage},
    {id:'senses',titles:['Which part?','Five senses','Which sense?'],run:pzSenses},
    {id:'heartbeat',titles:['Count the beats','Beats in 2s','Beats a minute'],run:pzHeart},
    {id:'kit',titles:['Pack the kit','Pack the kit','Solid shapes'],run:pzKit},
    {id:'bwords',titles:['Body words','Read the word','Spell it'],run:pzBodyWords}
  ]};
FAIRY_ORDER.push('ginger');
