/* Ripple, the Water fairy: her art, shell house, lily pond, pictures, facts, puzzles
   (pipe route, float or sink, fill the jugs, stepping stones, missing letters) and her FAIRIES entry. */
'use strict';
/* her gradients (added to the shared defs; any fairy can use them) */
addDefs(
'<radialGradient id="shellG" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#FFF8F2"/><stop offset=".55" stop-color="#F8D6C6"/><stop offset="1" stop-color="#DE9A84"/></radialGradient>' +
'<linearGradient id="waterG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A8DCF3"/><stop offset="1" stop-color="#4E9BC9"/></linearGradient>' +
'<radialGradient id="rpDress" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#E2F8FA"/><stop offset=".55" stop-color="#5CC4D6"/><stop offset="1" stop-color="#2A8199"/></radialGradient>' +
'<linearGradient id="rpHair" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A8EEF0"/><stop offset="1" stop-color="#2A7F96"/></linearGradient>' +
'<radialGradient id="rpWing" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".6" stop-color="#BDEFF2" stop-opacity=".7"/><stop offset="1" stop-color="#3FAFC4" stop-opacity=".9"/></radialGradient>' +
'<linearGradient id="rpLegs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7FD6E2"/><stop offset="1" stop-color="#2A8199"/></linearGradient>' +
'<radialGradient id="frogG" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#B6EA8E"/><stop offset="1" stop-color="#4E9F45"/></radialGradient>' +
'<linearGradient id="pipeG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E6EBF1"/><stop offset="1" stop-color="#A9B3C1"/></linearGradient>' +
'<radialGradient id="stoneG" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#D8D4DF"/><stop offset=".6" stop-color="#ABA6B8"/><stop offset="1" stop-color="#7C768C"/></radialGradient>'
);
/* ---------- Ripple, the Water fairy (240 x 320 box) ---------- */
function rippleArt(noShadow){
  var skin='url(#skinB)', flat='#EDBB98';
  return (noShadow?'':'<ellipse cx="120" cy="308" rx="44" ry="7" fill="#2A8199" opacity=".22" filter="url(#fshadow)"/>') +
  '<g class="wings">' +
  '<path d="M112 150 C78 112 28 104 28 126 C28 148 80 156 112 158 Z" fill="url(#rpWing)" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '<path d="M112 164 C82 170 46 188 52 206 C60 222 100 196 116 172 Z" fill="url(#rpWing)" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '<path d="M128 150 C162 112 212 104 212 126 C212 148 160 156 128 158 Z" fill="url(#rpWing)" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '<path d="M128 164 C158 170 194 188 188 206 C180 222 140 196 124 172 Z" fill="url(#rpWing)" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '<path d="M112 152 C88 132 60 122 38 124 M112 156 C86 152 62 146 40 136 M114 170 C96 184 74 196 60 204 M128 152 C152 132 180 122 202 124 M128 156 C154 152 178 146 200 136 M126 170 C144 184 166 196 180 204" stroke="#fff" stroke-width="1" fill="none" opacity=".6"/>' +
  '</g>' +
  /* long wavy hair behind */
  '<path d="M74 108 C70 60 98 50 120 50 C142 50 170 60 166 108 C168 136 178 164 184 196 C176 206 164 204 158 196 C162 210 150 218 142 208 L98 208 C90 218 78 210 82 196 C76 204 64 206 56 196 C62 164 72 136 74 108 Z" fill="url(#rpHair)"/>' +
  '<path d="M68 150 C66 170 62 182 60 192 M172 150 C174 170 178 182 180 192" stroke="#fff" stroke-width="3" opacity=".3" fill="none" stroke-linecap="round"/>' +
  '<rect x="106" y="228" width="11" height="38" rx="5.5" fill="url(#rpLegs)"/><rect x="123" y="228" width="11" height="38" rx="5.5" fill="url(#rpLegs)"/>' +
  '<path d="M100 262 H118 V269 C118 275 112 278 104 278 C96 278 94 272 100 262 Z" fill="url(#shellG)" stroke="#C9826E" stroke-width="1.2"/>' +
  '<path d="M122 262 H140 C146 272 144 278 136 278 C128 278 122 275 122 269 Z" fill="url(#shellG)" stroke="#C9826E" stroke-width="1.2"/>' +
  /* dress with a wavy hem */
  '<path d="M104 152 C100 152 98 160 98 168 C92 188 84 214 80 232 Q90 244 100 234 Q110 246 120 236 Q130 246 140 234 Q150 244 160 232 C156 214 148 188 142 168 C142 160 140 152 136 152 Z" fill="url(#rpDress)"/>' +
  '<path d="M90 214 Q98 207 106 214 T122 214 T138 214 T154 214" stroke="#fff" stroke-width="2.5" fill="none" opacity=".6" stroke-linecap="round"/>' +
  '<path d="M94 226 Q102 219 110 226 T126 226 T142 226" stroke="#fff" stroke-width="2" fill="none" opacity=".45" stroke-linecap="round"/>' +
  '<ellipse cx="102" cy="200" rx="7" ry="22" fill="#fff" opacity=".22" filter="url(#fsoft)"/>' +
  '<path d="M99 174 Q120 182 141 174 L142 181 Q120 189 98 181 Z" fill="url(#shellG)"/>' +
  '<path d="M114 186 L120 176 L126 186 Z" fill="#F8D6C6" stroke="#C9826E" stroke-width="1.2" stroke-linejoin="round"/>' +
  /* left arm down */
  '<path d="M104 164 C94 176 90 188 88 198" stroke="'+flat+'" stroke-width="10" fill="none" stroke-linecap="round"/>' +
  '<circle cx="88" cy="200" r="6" fill="'+skin+'"/>' +
  /* right arm raised with a water-drop wand */
  '<g class="arm"><path d="M136 164 C150 158 158 148 162 138" stroke="'+flat+'" stroke-width="10" fill="none" stroke-linecap="round"/>' +
  '<path d="M164 136 L178 112" stroke="#C9826E" stroke-width="3" stroke-linecap="round"/>' +
  '<circle cx="163" cy="136" r="6" fill="'+skin+'"/>' +
  '<circle cx="181" cy="104" r="14" fill="#BFEAF8" opacity=".5" filter="url(#fsoft)"/>' +
  '<path d="M181 88 C187 98 191 104 191 109 A10 10 0 0 1 171 109 C171 104 175 98 181 88 Z" fill="url(#waterG)" stroke="#fff" stroke-width="1.5"/>' +
  '<path d="M176 108 A5 5 0 0 0 179 113" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></g>' +
  '<rect x="114" y="138" width="12" height="16" rx="4" fill="#D9A47F"/>' +
  '<circle cx="120" cy="108" r="40" fill="'+skin+'"/>' +
  /* fringe with a wave */
  '<path d="M80 104 C78 70 100 58 120 58 C140 58 162 70 160 104 C156 92 148 86 140 92 C134 80 120 80 114 90 C106 82 90 86 80 104 Z" fill="url(#rpHair)"/>' +
  '<path d="M98 70 C108 64 124 63 136 68" stroke="#fff" stroke-width="4" opacity=".3" stroke-linecap="round" fill="none"/>' +
  /* shell hair clip */
  '<g transform="translate(150 80) rotate(20)"><path d="M0 8 L-9 -2 C-9 -10 9 -10 9 -2 Z" fill="url(#shellG)" stroke="#C9826E" stroke-width="1.2" stroke-linejoin="round"/><path d="M0 8 L-5 -6 M0 8 L0 -8 M0 8 L5 -6" stroke="#C9826E" stroke-width="1" opacity=".7"/></g>' +
  '<path d="M99 102 Q105 98 111 101 M129 101 Q135 98 141 102" stroke="#3E2A20" stroke-width="2" fill="none" stroke-linecap="round"/>' +
  '<ellipse cx="106" cy="115" rx="5.5" ry="7" fill="#1F3A4A"/><ellipse cx="134" cy="115" rx="5.5" ry="7" fill="#1F3A4A"/>' +
  '<circle cx="108" cy="112" r="2" fill="#fff"/><circle cx="136" cy="112" r="2" fill="#fff"/>' +
  '<ellipse cx="95" cy="127" rx="7" ry="4.5" fill="#F28CB3" opacity=".4"/><ellipse cx="145" cy="127" rx="7" ry="4.5" fill="#F28CB3" opacity=".4"/>' +
  '<path d="M112 128 Q120 135 128 128" stroke="#7A3428" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
}
/* ---------- houses (220 x 200 box, lawn at y 178) ---------- */
function shellBody(){
  var s='';
  /* little pond on the left, with a lily pad and a frog */
  s+='<ellipse cx="44" cy="181" rx="38" ry="10" fill="#3E7FB0"/><ellipse cx="44" cy="180" rx="35" ry="8.5" fill="url(#waterG)"/>' +
    '<ellipse class="ring" cx="34" cy="180" rx="10" ry="3" fill="none" stroke="#fff" stroke-width="1.6"/>' +
    '<path d="M18 181 C18 176 30 175 34 177 L28 181 L34 184 C30 186 18 186 18 181 Z" fill="#6DBE5A" stroke="#357A31" stroke-width="1"/>' +
    '<path d="M56 182 C56 177 70 176 74 179 C74 184 62 186 56 182 Z" fill="#6DBE5A" stroke="#357A31" stroke-width="1"/>' +
    '<g class="frog"><ellipse cx="65" cy="177" rx="7" ry="5" fill="url(#frogG)"/><circle cx="61.5" cy="172.5" r="2.6" fill="url(#frogG)"/><circle cx="68.5" cy="172.5" r="2.6" fill="url(#frogG)"/><circle cx="61.5" cy="172.3" r="1.1" fill="#2A1E1A"/><circle cx="68.5" cy="172.3" r="1.1" fill="#2A1E1A"/></g>';
  /* the shell */
  s+='<path d="M104 180 L90 170 L98 162 C58 148 46 104 62 72 C78 40 162 40 178 72 C194 104 182 148 142 162 L150 170 L136 180 Z" fill="url(#shellG)" stroke="#C9826E" stroke-width="2"/>';
  var ends=[[64,104],[70,74],[88,54],[120,46],[152,54],[170,74],[176,104]];
  ends.forEach(function(e){s+='<path d="M120 172 Q'+f2((120+e[0])/2+(e[0]-120)*.08)+' '+f2((172+e[1])/2)+' '+e[0]+' '+e[1]+'" stroke="#D99A84" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"/>';});
  s+='<path d="M62 72 C78 40 162 40 178 72" stroke="#fff" stroke-width="3" fill="none" opacity=".5"/>' +
    '<ellipse cx="84" cy="80" rx="12" ry="22" transform="rotate(-24 84 80)" fill="#fff" opacity=".35" filter="url(#fsoft)"/>' +
    /* porthole window */
    '<circle cx="120" cy="104" r="14" fill="#C9826E"/><circle cx="120" cy="104" r="10.5" fill="url(#gglass)"/>' +
    '<path d="M114 100 A7 7 0 0 1 120 96.5" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
    /* door */
    '<path d="M106 181 V162 A14 14 0 0 1 134 162 V181 Z" fill="#2E6E8E"/>' +
    '<path d="M109 181 V163 A11 11 0 0 1 131 163 V181 Z" fill="url(#waterG)"/>' +
    '<path d="M120 152 V181" stroke="#2E6E8E" stroke-width="1.5" opacity=".6"/><circle cx="126" cy="171" r="2" fill="url(#ggold)"/>' +
    /* starfish by the door */
    '<path d="M162 168 L164.5 173.5 L170.5 174 L166 178 L167.5 184 L162 181 L156.5 184 L158 178 L153.5 174 L159.5 173.5 Z" fill="#F7A055" stroke="#B8661E" stroke-width="1"/>';
  return s;
}
/* ---------- Ripple's world: a lily pond (an image used behind her garden and puzzles) ---------- */
function pondScene(){
  function ri(i,a){var x=Math.sin(i*12.9898+a*78.233)*43758.5453;return x-Math.floor(x);}
  var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMax slice"><defs>' +
  '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE4F5"/><stop offset=".6" stop-color="#E9F7F6"/><stop offset="1" stop-color="#E1F3E2"/></linearGradient>' +
  '<linearGradient id="pond" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ED6EE"/><stop offset=".5" stop-color="#6DB6DF"/><stop offset="1" stop-color="#3D86B8"/></linearGradient>' +
  '<radialGradient id="willow" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#C6E8A0"/><stop offset="1" stop-color="#6FAE55"/></radialGradient>' +
  '<radialGradient id="pad" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#9AD97A"/><stop offset="1" stop-color="#3E8A3A"/></radialGradient>' +
  '<radialGradient id="hill" cx=".5" cy=".2" r=".9"><stop offset="0" stop-color="#C8E8B0"/><stop offset="1" stop-color="#93C97E"/></radialGradient>' +
  '<linearGradient id="trunk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B17E55"/><stop offset=".45" stop-color="#8A5A34"/><stop offset="1" stop-color="#55331B"/></linearGradient>' +
  '<linearGradient id="bank" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B5DE96"/><stop offset="1" stop-color="#7CB863"/></linearGradient>' +
  '<filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>' +
  '</defs>';
  s+='<rect width="1200" height="900" fill="url(#sky)"/>';
  s+='<g fill="#fff" opacity=".9"><ellipse cx="300" cy="120" rx="80" ry="26"/><ellipse cx="350" cy="102" rx="50" ry="30"/><ellipse cx="860" cy="90" rx="70" ry="22"/><ellipse cx="900" cy="76" rx="40" ry="24"/></g>';
  s+='<path d="M0 470 C200 400 380 420 560 450 C760 400 980 410 1200 460 V620 H0 Z" fill="url(#hill)"/>';
  /* far willows */
  [[260,430,.7],[520,420,.55],[700,425,.6],[960,430,.72]].forEach(function(t,k){
    var x=t[0],y=t[1],q=t[2];
    s+='<rect x="'+f2(x-8*q)+'" y="'+f2(y-40*q)+'" width="'+f2(16*q)+'" height="'+f2(140*q)+'" fill="#9C7A58"/>';
    s+='<ellipse cx="'+x+'" cy="'+f2(y-70*q)+'" rx="'+f2(110*q)+'" ry="'+f2(80*q)+'" fill="url(#willow)" opacity=".85"/>';
    for(var d=-5;d<=5;d++){s+='<path d="M'+f2(x+d*18*q)+' '+f2(y-60*q)+' q'+f2(6*q)+' '+f2(70*q)+' '+f2(d*4*q)+' '+f2(130*q)+'" stroke="#7FBE5E" stroke-width="'+f2(10*q)+'" fill="none" stroke-linecap="round" opacity=".8"/>';}
  });
  /* bank and pond */
  s+='<path d="M0 560 C220 530 980 530 1200 560 V900 H0 Z" fill="url(#bank)"/>';
  s+='<path d="M60 900 C30 760 160 640 600 630 C1040 640 1170 760 1140 900 Z" fill="url(#pond)"/>';
  s+='<path d="M60 900 C30 760 160 640 600 630 C1040 640 1170 760 1140 900" stroke="#D9C79A" stroke-width="10" fill="none"/>';
  for(var w=0;w<12;w++){var wx=180+ri(w,1)*840, wy=680+ri(w,2)*200; s+='<path d="M'+f2(wx)+' '+f2(wy)+' h'+f2(40+ri(w,3)*60)+'" stroke="#fff" stroke-width="4" opacity=".45" stroke-linecap="round"/>';}
  /* lily pads with pink water lilies */
  [[220,780,52],[330,860,40],[880,770,56],[990,860,44],[760,850,34],[420,720,30],[800,700,28]].forEach(function(p,i){
    var x=p[0],y=p[1],r=p[2];
    s+='<path d="M'+x+' '+y+' L'+f2(x+r)+' '+f2(y-r*.12)+' A'+r+' '+f2(r*.4)+' 0 1 1 '+f2(x+r*.9)+' '+f2(y-r*.32)+' Z" fill="url(#pad)" stroke="#2F6B2C" stroke-width="2"/>';
    if(i%2===0){
      for(var k=0;k<6;k++){s+='<ellipse cx="'+x+'" cy="'+f2(y-r*.5)+'" rx="'+f2(r*.14)+'" ry="'+f2(r*.34)+'" fill="#FBD3E2" stroke="#E07AA4" stroke-width="1.5" transform="rotate('+(k*30-75)+' '+x+' '+f2(y-r*.2)+')"/>';}
      s+='<circle cx="'+x+'" cy="'+f2(y-r*.25)+'" r="'+f2(r*.12)+'" fill="#F5C842"/>';
    }
  });
  /* reeds and bulrushes at the sides */
  function reeds(x0,dir){
    var t='';
    for(var i=0;i<11;i++){
      var x=x0+dir*i*14+ri(i+x0,4)*8, h=180+ri(i+x0,5)*140;
      t+='<path d="M'+f2(x)+' 900 Q'+f2(x+dir*10)+' '+f2(900-h/2)+' '+f2(x+dir*ri(i,6)*20)+' '+f2(900-h)+'" stroke="#4E9140" stroke-width="5" fill="none" stroke-linecap="round"/>';
      if(i%3===0)t+='<rect x="'+f2(x+dir*ri(i,6)*20-6)+'" y="'+f2(900-h-8)+'" width="12" height="40" rx="6" fill="#8A5530"/>';
      t+='<path d="M'+f2(x)+' 900 C'+f2(x-dir*16)+' '+f2(860-h*.3)+' '+f2(x-dir*26)+' '+f2(840-h*.4)+' '+f2(x-dir*34)+' '+f2(820-h*.5)+'" stroke="#6DBE5A" stroke-width="7" fill="none" stroke-linecap="round" opacity=".9"/>';
    }
    return t;
  }
  s+=reeds(10,1)+reeds(1190,-1);
  /* big willow framing left and right */
  function bigWillow(flip){
    var t='<g'+(flip?' transform="translate(1200 0) scale(-1 1)"':'')+'>';
    t+='<path d="M10 640 C50 600 70 520 74 420 C78 300 70 160 90 0 H210 C220 160 214 300 210 420 C206 520 230 600 280 640 Z" fill="url(#trunk)"/>';
    t+='<circle cx="140" cy="20" r="170" fill="url(#willow)"/><circle cx="300" cy="60" r="120" fill="url(#willow)"/><circle cx="20" cy="120" r="120" fill="url(#willow)"/>';
    for(var d=0;d<16;d++){var x=-20+d*26, len=280+ri(d+(flip?50:0),7)*260; t+='<path d="M'+x+' 80 q'+f2(10+ri(d,8)*14)+' '+f2(len/2)+' '+f2(ri(d,9)*30-10)+' '+f2(len)+'" stroke="'+(d%2?'#88C766':'#6FAE55')+'" stroke-width="12" fill="none" stroke-linecap="round"/>';}
    return t+'</g>';
  }
  s+=bigWillow(false)+bigWillow(true);
  /* dragonflies and sparkles on the water */
  [[470,560,1],[760,600,.8]].forEach(function(b){s+='<g transform="translate('+b[0]+' '+b[1]+') scale('+b[2]+') rotate(-10)"><ellipse cx="-14" cy="-6" rx="18" ry="6" fill="#DDF4FB" stroke="#3FAFC4" stroke-width="1.5" transform="rotate(-15 -14 -6)"/><ellipse cx="14" cy="-6" rx="18" ry="6" fill="#DDF4FB" stroke="#3FAFC4" stroke-width="1.5" transform="rotate(15 14 -6)"/><ellipse cx="-12" cy="4" rx="15" ry="5" fill="#DDF4FB" stroke="#3FAFC4" stroke-width="1.5" transform="rotate(15 -12 4)"/><ellipse cx="12" cy="4" rx="15" ry="5" fill="#DDF4FB" stroke="#3FAFC4" stroke-width="1.5" transform="rotate(-15 12 4)"/><rect x="-3" y="-14" width="6" height="40" rx="3" fill="#2A8199"/><circle cx="0" cy="-16" r="5" fill="#2A8199"/></g>';});
  [[520,700],[680,760],[880,700],[360,800],[600,840],[1000,720]].forEach(function(f,i){s+='<circle cx="'+f[0]+'" cy="'+f[1]+'" r="10" fill="#fff" opacity=".45" filter="url(#bl)"/><circle cx="'+f[0]+'" cy="'+f[1]+'" r="'+(3+i%2)+'" fill="#fff" opacity=".9"/>';});
  s+='</svg>';
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
}
/* ================= Ripple's pond puzzles ================= */

/* 1. pipe route to the lily: tap pipes to turn them, then turn on the water */
var N_=1,E_=2,S_=4,W_=8;
function rotMask(m,r){for(var i=0;i<(r%4);i++){m=((m<<1)|(m>>3))&15;}return m;}
var DIRS=[[N_,-1,0,S_],[E_,0,1,W_],[S_,1,0,N_],[W_,0,-1,E_]];
function pipeArt(mask,wet){
  var s='', ends={1:[50,0],2:[100,50],4:[50,100],8:[0,50]}, k;
  var d=''; for(k in ends){if(mask&k)d+='M50 50 L'+ends[k][0]+' '+ends[k][1]+' ';}
  if(!d)return '';
  s+='<path d="'+d+'" stroke="#5E6878" stroke-width="30" stroke-linecap="butt" fill="none"/>';
  s+='<path d="'+d+'" stroke="'+(wet?'#4FA9DE':'#D6DCE4')+'" stroke-width="20" stroke-linecap="butt" fill="none" class="pipe-in"/>';
  s+='<circle cx="50" cy="50" r="15" fill="#5E6878"/><circle cx="50" cy="50" r="10" fill="'+(wet?'#4FA9DE':'#D6DCE4')+'" class="pipe-in"/>';
  if(!(mask&(mask-1))){s+='<circle cx="50" cy="50" r="17" fill="#7E8798"/><circle cx="50" cy="50" r="9" fill="#5E6878"/>';}
  return s;
}
function pzPipes(area,L){ multi(area,L,3,function(R){pzPipes1(area,L);}); }
function pzPipes1(area,L){
  var n=[3,4,5][L-1], minLen=[3,6,9][L-1], grid, path, r0, r1, tries=0;
  function walk(){
    r0=rnd(0,n-1); var seen={}, p=[];
    function dfs(r,c){
      seen[r+','+c]=true; p.push([r,c]);
      if(c===n-1&&p.length>=minLen)return true;
      var opts=shuffle(DIRS);
      for(var i=0;i<4;i++){var d=opts[i], rr=r+d[1], cc=c+d[2];
        if(rr<0||rr>=n||cc<0||cc>=n||seen[rr+','+cc])continue;
        if(dfs(rr,cc))return true;}
      p.pop(); return false;
    }
    return dfs(r0,0)?p:null;
  }
  do{path=walk();tries++;}while(!path&&tries<50);
  if(!path){path=[];for(var c0=0;c0<n;c0++)path.push([r0,c0]);}
  r1=path[path.length-1][0];
  grid=[]; for(var r=0;r<n;r++){grid.push([]);for(var c=0;c<n;c++)grid[r].push(null);}
  path.forEach(function(pc,i){
    var m=0, prev=i>0?path[i-1]:[pc[0],-1], next=i<path.length-1?path[i+1]:[pc[0],n];
    [prev,next].forEach(function(q){var dr=q[0]-pc[0], dc=q[1]-pc[1];DIRS.forEach(function(d){if(d[1]===dr&&d[2]===dc)m|=d[0];});});
    grid[pc[0]][pc[1]]={base:m,rot:0,turn:true};
  });
  var FILL=L===2?[5,3]:[5,3,7,1];
  for(r=0;r<n;r++)for(c=0;c<n;c++){
    if(grid[r][c])continue;
    grid[r][c]= L===1 ? {base:0,rot:0,turn:false} : {base:pick(FILL),rot:0,turn:true};
  }
  function mask(r,c){var g=grid[r][c];return rotMask(g.base,g.rot);}
  function flow(){
    var reached={}, order=[];
    if(!(mask(r0,0)&W_))return {reached:reached,order:order,ok:false};
    var q=[[r0,0]]; reached[r0+',0']=true;
    while(q.length){
      var cur=q.shift(); order.push(cur); var m=mask(cur[0],cur[1]);
      DIRS.forEach(function(d){
        if(!(m&d[0]))return; var rr=cur[0]+d[1], cc=cur[1]+d[2];
        if(rr<0||rr>=n||cc<0||cc>=n)return;
        if(reached[rr+','+cc])return;
        if(mask(rr,cc)&d[3]){reached[rr+','+cc]=true;q.push([rr,cc]);}
      });
    }
    return {reached:reached,order:order,ok:!!reached[r1+','+(n-1)]&&!!(mask(r1,n-1)&E_)};
  }
  /* scramble every pipe that can turn, so the water can't already reach the lily */
  var guard=0;
  do{for(r=0;r<n;r++)for(c=0;c<n;c++){if(grid[r][c].turn)grid[r][c].rot=rnd(0,3);} guard++;}while(flow().ok&&guard<30);
  setSay(L===1?'Tap the pipes to turn them. Join the water to the lily. Then tap Turn on the water.':L===2?'Turn the pipes so the water can flow all the way to the lily. Then tap Turn on the water.':'Some pipes lead nowhere. Turn the pipes to make a path from the water to the lily. Then tap Turn on the water.');
  var W=n*100+140, H=n*100;
  var s='<svg class="pipes" viewBox="-8 -8 '+(W+16)+' '+(H+16)+'" role="group" aria-label="Pipes on a '+n+' by '+n+' grid">';
  s+='<rect x="66" y="-4" width="'+(n*100+8)+'" height="'+(H+8)+'" rx="14" fill="#C9B48E"/>';
  /* the spring on the left and the lily on the right */
  var sy=r0*100+50, ly=r1*100+50;
  s+='<g aria-hidden="true"><rect x="0" y="'+(sy-22)+'" width="74" height="44" rx="10" fill="#5E6878"/><rect x="6" y="'+(sy-15)+'" width="68" height="30" rx="6" fill="#4FA9DE"/><circle cx="24" cy="'+sy+'" r="8" fill="#fff" opacity=".6"/>' +
    '<path d="M'+(W-70)+' '+(ly-12)+' H'+(W-60)+' V'+(ly+12)+' H'+(W-70)+' Z" fill="#5E6878"/>' +
    '<ellipse cx="'+(W-30)+'" cy="'+(ly+18)+'" rx="32" ry="12" fill="#6DBE5A" stroke="#357A31" stroke-width="2"/>';
  for(var k=0;k<6;k++){s+='<ellipse cx="'+(W-30)+'" cy="'+(ly-4)+'" rx="7" ry="17" fill="#FBD3E2" stroke="#E07AA4" stroke-width="1.5" transform="rotate('+(k*30-75)+' '+(W-30)+' '+(ly+12)+')"/>';}
  s+='<circle cx="'+(W-30)+'" cy="'+(ly+4)+'" r="6" fill="#F5C842"/></g>';
  for(r=0;r<n;r++)for(c=0;c<n;c++){
    var g=grid[r][c], x=70+c*100, y=r*100;
    s+='<svg x="'+x+'" y="'+y+'" width="100" height="100" viewBox="0 0 100 100" overflow="visible">';
    s+='<rect x="3" y="3" width="94" height="94" rx="12" fill="#EFE3C8" stroke="#B8A27A" stroke-width="2"/>';
    if(g.turn){
      s+='<g class="cellbtn" data-r="'+r+'" data-c="'+c+'" tabindex="0" role="button" aria-label="Pipe, row '+(r+1)+', column '+(c+1)+'. Tap to turn it."><rect x="3" y="3" width="94" height="94" fill="#fff" fill-opacity="0"/><g class="pc" id="pc-'+r+'-'+c+'" style="transform:rotate('+(g.rot*90)+'deg)">'+pipeArt(g.base,false)+'</g></g>';
    } else {
      s+='<ellipse cx="50" cy="56" rx="30" ry="18" fill="#9AD97A" stroke="#3E8A3A" stroke-width="2"/><path d="M50 56 L78 50" stroke="#3E8A3A" stroke-width="2"/>';
    }
    s+='</svg>';
  }
  s+='</svg>';
  area.innerHTML='<div class="panel pipes-wrap">'+s+'</div><button class="btn" id="pp-go">Turn on the water</button>';
  var busy=false;
  area.querySelectorAll('.cellbtn').forEach(function(el){
    function turn(){
      if(busy)return;
      var r=+el.getAttribute('data-r'), c=+el.getAttribute('data-c'), g=grid[r][c];
      g.rot++; $('#pc-'+r+'-'+c).style.transform='rotate('+(g.rot*90)+'deg)'; tick();
    }
    el.addEventListener('click',turn);
    el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();turn();}});
  });
  $('#pp-go').addEventListener('click',function(){
    if(busy)return; busy=true; this.disabled=true;
    var f=flow();
    f.order.forEach(function(pc,i){
      setTimeout(function(){
        var el=$('#pc-'+pc[0]+'-'+pc[1]); if(!el)return;
        el.querySelectorAll('.pipe-in').forEach(function(p){if(p.tagName==='path')p.setAttribute('stroke','#4FA9DE');else p.setAttribute('fill','#4FA9DE');});
        if(mem.sound)tone(520+i*30,0,.12,'sine',.06);
      },i*180);
    });
    setTimeout(function(){finish(f.ok);},f.order.length*180+700);
  });
}
/* 2. floats or sinks */
var FLOATERS={
  duck:{label:'rubber duck',f:true,why:'air',mat:'Rubber'},
  cork:{label:'cork',f:true,why:'mat',mat:'Cork'},
  block:{label:'wooden block',f:true,why:'mat',mat:'Wood'},
  feather:{label:'feather',f:true},
  bottle:{label:'empty bottle with its lid on',f:true,why:'air',mat:'Plastic'},
  leaf:{label:'leaf',f:true},
  apple:{label:'apple',f:true},
  sponge:{label:'dry sponge',f:true},
  coin:{label:'coin',f:false,why:'mat',mat:'Metal'},
  key:{label:'key',f:false,why:'mat',mat:'Metal'},
  stone:{label:'stone',f:false,why:'mat',mat:'Stone'},
  marble:{label:'glass marble',f:false,why:'mat',mat:'Glass'},
  spoon:{label:'metal spoon',f:false,why:'mat',mat:'Metal'},
  clayball:{label:'ball of clay',f:false,why:'mat',mat:'Clay'},
  boat:{label:'metal boat',f:true,why:'shape',mat:'Metal'},
  clayboat:{label:'clay boat',f:true,why:'shape',mat:'Clay'}
};
/* one true reason and three tempting wrong ones, all about this object's own material */
function floatReasons(it){
  var M=it.mat, light='It floats. '+M+' is light for its size.', heavy='It sinks. '+M+' is heavy for its size.';
  var air='It floats. It is hollow and full of air.', shape='It floats. Its wide, hollow shape sits on top of the water.';
  if(it.why==='shape')return {right:shape,wrong:[heavy,light,'It floats because it is small.']};
  if(it.why==='air')return {right:air,wrong:[heavy,'It sinks. The air inside makes it heavy.','It floats because it is small.']};
  if(it.f)return {right:light,wrong:[heavy,air,'It floats because it is small.']};
  return {right:heavy,wrong:[light,air,'It sinks because it is small.']};
}
function tankSVG(key){
  return '<svg class="tank" viewBox="0 0 300 230" role="img" aria-label="A tank of water">' +
    '<rect x="20" y="40" width="260" height="180" rx="16" fill="#EAF6FC" stroke="#9CC3E6" stroke-width="4"/>' +
    '<rect x="24" y="100" width="252" height="116" rx="12" fill="url(#waterG)" opacity=".85"/>' +
    '<path d="M24 100 Q60 92 96 100 T168 100 T240 100 T276 100" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>' +
    '<rect x="24" y="200" width="252" height="16" rx="8" fill="#C9B48E" opacity=".8"/>' +
    '<g class="tk-drop" id="tk-obj" style="transform:translate(0,0)"><svg x="115" y="0" width="70" height="70" viewBox="0 0 100 100" overflow="visible">'+pic2(key)+'</svg></g>' +
    '<rect x="24" y="100" width="252" height="116" rx="12" fill="#4E9BC9" opacity=".18" pointer-events="none"/>' +
    '</svg>';
}
function pzFloats(area,L){
  var keys=Object.keys(FLOATERS);
  if(L===1){
    var simple=keys.filter(function(k){return k!=='boat'&&k!=='clayboat'&&k!=='clayball';});
    var fl=shuffle(simple.filter(function(k){return FLOATERS[k].f;})), sk=shuffle(simple.filter(function(k){return !FLOATERS[k].f;}));
    var list=shuffle([fl[0],sk[0],pick([fl[1],sk[1]])]);
    setSay('Will it float or sink? Make a guess. Then watch it drop into the water.');
    rounds(3,function(k,next){
      var key=list[k], it=FLOATERS[key];
      area.innerHTML=roundNote(k,3)+'<div class="panel tank-wrap">'+tankSVG(key)+'</div><p class="say-small">Will the '+esc(it.label)+' float or sink?</p><div class="opts"><button class="btn leaf" id="fs-f">It will float</button><button class="btn" id="fs-s">It will sink</button></div>';
      function guess(g){
        $('#fs-f').disabled=true; $('#fs-s').disabled=true; tick();
        var o=$('#tk-obj'); o.style.transform='translate(0,'+(it.f?'70px':'138px')+')';
        setTimeout(function(){next(g===it.f);},1700);
      }
      $('#fs-f').addEventListener('click',function(){guess(true);});
      $('#fs-s').addEventListener('click',function(){guess(false);});
    });
    return;
  }
  if(L===2){
    var simple2=keys.filter(function(k){return k!=='boat'&&k!=='clayboat';});
    var f2l=shuffle(simple2.filter(function(k){return FLOATERS[k].f;})).slice(0,4), s2l=shuffle(simple2.filter(function(k){return !FLOATERS[k].f;})).slice(0,4);
    var items=shuffle(f2l.concat(s2l)).map(function(k,i){return {id:i,html:picSVG2(k),label:FLOATERS[k].label,want:FLOATERS[k].f?'float':'sink'};});
    setSay('Which things float and which sink? Tap a thing, then tap Floats or Sinks. Tap Check when they are all sorted.');
    sorter(area,items,[{id:'float',label:'Floats',cls:'water-top',icon:'<path d="M10 60 Q30 50 50 60 T90 60" stroke="#3E7FB0" stroke-width="6" fill="none"/><circle cx="50" cy="44" r="14" fill="#F8CF5A" stroke="#B8861E" stroke-width="3"/>'},{id:'sink',label:'Sinks',cls:'water-bottom',icon:'<path d="M10 30 Q30 20 50 30 T90 30" stroke="#fff" stroke-width="6" fill="none"/><rect x="10" y="74" width="80" height="10" rx="5" fill="#C9B48E"/><circle cx="50" cy="62" r="12" fill="#ABA6B8" stroke="#6E6A7E" stroke-width="3"/>'}],{zoneWord:'Put it in'});
    return;
  }
  var l3=shuffle(['block','cork','bottle','duck','boat','clayboat','coin','key','marble','stone','clayball']);
  var chosen=[pick(['boat','clayboat'])]; l3.forEach(function(k){if(chosen.length<3&&chosen.indexOf(k)<0&&!(chosen[0].indexOf('boat')>=0&&k.indexOf('boat')>=0))chosen.push(k);});
  chosen=shuffle(chosen);
  setSay('Will it float or sink, and why? Pick the best answer.');
  rounds(3,function(k,next){
    var key=chosen[k], it=FLOATERS[key], rs=floatReasons(it), right=rs.right, wrong=rs.wrong;
    area.innerHTML=roundNote(k,3)+'<div class="pic">'+picSVG2(key,it.label)+'</div><p class="say-small">The '+esc(it.label)+'</p><div class="opts col" id="fs-opts"></div>';
    shuffle([right].concat(wrong)).forEach(function(t){
      var b=optBtn(esc(t),null,'txt'); b.addEventListener('click',function(){next(t===right);}); $('#fs-opts').appendChild(b);
    });
  });
}
/* 3. fill jugs to the line */
function jugSVG(id,label,max,step,labelEvery,unit,level,colour){
  var top=36, bot=206, h=bot-top;
  var s='<svg class="jug" viewBox="0 0 186 236" role="img" id="'+id+'-svg" aria-label="'+esc(label)+'">';
  s+='<path d="M34 20 H136 V200 A14 14 0 0 1 122 214 H48 A14 14 0 0 1 34 200 Z" fill="#F4FAFD" stroke="#9CC3E6" stroke-width="4"/>';
  s+='<path d="M34 20 L22 10 H40" stroke="#9CC3E6" stroke-width="4" fill="none" stroke-linejoin="round"/>';
  s+='<rect class="wfill" id="'+id+'-w" x="37" y="'+top+'" width="96" height="'+h+'" rx="4" fill="'+(colour||'url(#waterG)')+'" opacity=".9" style="transform:scaleY('+(level/max)+')"/>';
  if(step){
    for(var v=0;v<=max;v+=step){
      var y=bot-h*v/max, lab=(v%labelEvery===0);
      s+='<path d="M136 '+f2(y)+' H'+(lab?120:126)+'" stroke="#3B4A6C" stroke-width="'+(lab?3:2)+'"/>';
      if(lab)s+='<text x="141" y="'+f2(y+6)+'" font-family="Nunito, sans-serif" font-size="16" font-weight="800" fill="#3B4A6C">'+v+'</text>';
    }
    s+='<text x="85" y="232" text-anchor="middle" font-family="Nunito, sans-serif" font-size="13" font-weight="800" fill="#3B4A6C">'+unit+'</text>';
  } else {
    /* Little Sprite's jug has no numbers, but lines at each pour (a quarter at a time), with a longer line at half, help to see half full */
    for(var q=1;q<max;q++){
      var yq=bot-h*q/max, half=(q*2===max);
      s+='<path d="M136 '+f2(yq)+' H'+(half?108:124)+'" stroke="#3B4A6C" stroke-width="'+(half?3.5:2.2)+'" stroke-linecap="round"/>';
    }
  }
  s+='<path d="M46 40 V194" stroke="#fff" stroke-width="6" opacity=".6" stroke-linecap="round"/>';
  return s+'</svg>';
}
function pzJugs(area,L){ multi(area,L,3,function(R){pzJugs1(area,L,R);}); }
function pzJugs1(area,L,R){
  var max,step,labelEvery,unit,target,start,lvl;
  if(L===1){
    var words=[['empty',0],['half full',2],['full',4],['nearly full',3],['nearly empty',1]], t=R.fresh(words);
    target=t[1]; start=pick([0,1,2,3,4].filter(function(x){return x!==target;}));
    max=4; lvl=start;
    setSay('Make the jug '+t[0]+'. Tap Pour in or Pour out. Then tap Done.');
    area.innerHTML='<div class="bigword small-word">'+t[0]+'</div><div class="jugs">'+jugSVG('jA','A jug',4,0,0,'',start)+'</div>';
  } else if(L===2){
    max=100; step=10; labelEvery=20; unit='ml'; target=R.fresh([10,20,30,40,50,60,70,80,90,100]); lvl=0;
    setSay('Fill the jug to '+target+' millilitres. Each pour adds 10. Then tap Done.');
    area.innerHTML='<div class="big-target">'+target+' ml</div><div class="jugs">'+jugSVG('jA','A measuring jug from 0 to 100 millilitres',100,10,20,'ml',0)+'</div>';
  } else {
    max=1000; step=100; labelEvery=200; unit='ml';
    var a=rnd(2,9)*100, rel=pick(['same','more','less']), d=rnd(1,3)*100;
    if(rel==='more'&&a+d>1000)rel='less';
    if(rel==='less'&&a-d<100)rel='more';
    target= rel==='same'?a : rel==='more'?a+d : a-d; lvl=0;
    setSay('Jug A has some water. Fill jug B so it has '+(rel==='same'?'the same amount as jug A':d+' millilitres '+rel+' than jug A')+'. Each pour adds 100. Then tap Done.');
    area.innerHTML='<div class="jugs"><figure class="jugbox"><figcaption>Jug A</figcaption>'+jugSVG('jZ','Jug A, a measuring jug from 0 to 1000 millilitres with water in it',1000,100,200,'ml',a,'#7FC6A4')+'</figure><figure class="jugbox"><figcaption>Jug B</figcaption>'+jugSVG('jA','Jug B, a measuring jug from 0 to 1000 millilitres',1000,100,200,'ml',0)+'</figure></div>';
  }
  var inc = L===1?1:step;
  area.insertAdjacentHTML('beforeend','<div class="row-btns"><button class="btn soft" id="jg-out">Pour out</button><button class="btn leaf" id="jg-in">Pour in</button></div><button class="btn" id="jg-done">Done</button>');
  function draw(){
    $('#jA-w').style.transform='scaleY('+(lvl/max)+')';
    $('#jg-in').disabled=lvl>=max; $('#jg-out').disabled=lvl<=0;
  }
  $('#jg-in').addEventListener('click',function(){if(lvl<max){lvl+=inc;if(mem.sound)tone(300+lvl/max*500,0,.18,'sine',.08);draw();}});
  $('#jg-out').addEventListener('click',function(){if(lvl>0){lvl-=inc;if(mem.sound)tone(300+lvl/max*500,0,.18,'triangle',.07);draw();}});
  $('#jg-done').addEventListener('click',function(){finish(lvl===target);});
  draw();
}
/* 4. shape stepping stones */
var SHP={
  circle:{d:'M50 14 A36 36 0 1 1 49.9 14 Z',sides:'no straight sides and no corners'},
  square:{d:'M20 20 H80 V80 H20 Z',sides:'4 sides that are all the same length, and 4 corners'},
  triangle:{d:ptsPath(regPts(50,56,40,3)),sides:'3 sides and 3 corners'},
  rectangle:{d:'M10 30 H90 V70 H10 Z',sides:'4 sides, two long and two short, and 4 corners'},
  pentagon:{d:ptsPath(regPts(50,53,40,5)),sides:'5 sides and 5 corners'},
  hexagon:{d:ptsPath(regPts(50,50,40,6,0)),sides:'6 sides and 6 corners'},
  octagon:{d:ptsPath(regPts(50,50,40,8,22.5)),sides:'8 sides and 8 corners'},
  semicircle:{d:'M12 66 A38 38 0 0 1 88 66 Z',sides:'one curved side, one straight side and 2 corners'},
  rtriangle:{d:'M20 82 V18 L82 82 Z',name:'right-angled triangle',sym:4},
  trapezium:{d:'M32 28 H68 L88 74 H12 Z',sym:4},
  rectangleT:{d:'M30 12 H70 V88 H30 Z',name:'rectangle',sym:2},
  arrow:{d:'M14 38 H56 V20 L88 50 L56 80 V62 H14 Z',sym:4}
};
function shpName(k){return SHP[k].name||k;}
var SHCOL={circle:'#F28CB3',square:'#F8CF5A',triangle:'#7DBDE6',rectangle:'#B3A4F0',pentagon:'#F7A055',hexagon:'#7FD3B5',octagon:'#E8574C',semicircle:'#B3A4F0',rtriangle:'#7DBDE6',trapezium:'#F7A055',rectangleT:'#B3A4F0',arrow:'#F28CB3'};
function stoneSVG(k,rot,label){
  return '<svg viewBox="0 0 100 100" '+(label?'role="img" aria-label="'+esc(label)+'"':'aria-hidden="true"')+'><ellipse cx="50" cy="56" rx="47" ry="41" fill="#6E6A7E" opacity=".35"/><ellipse cx="50" cy="50" rx="47" ry="43" fill="url(#stoneG)"/>' +
    '<g transform="rotate('+((rot||0)*90)+' 50 50) translate(50 50) scale(.62) translate(-50 -50)"><path d="'+SHP[k].d+'" fill="'+SHCOL[k]+'" stroke="#3B2A4A" stroke-width="4" stroke-linejoin="round"/></g></svg>';
}
function pzStones(area,L){
  var basic=['circle','square','triangle'], more=['circle','square','triangle','rectangle','pentagon','hexagon'];
  var turnable=['rtriangle','trapezium','rectangleT','arrow','semicircle'];
  var gaps=[], filled=[];
  if(L===1){var b=shuffle(basic); gaps=[{k:b[0]},{k:b[1]},{k:b[2]}];}
  else if(L===2){gaps=shuffle(more).slice(0,3).map(function(k){return {k:k};});}
  else {
    var tk=shuffle(turnable), dk=pick(['pentagon','hexagon','octagon','triangle','semicircle','rectangle']);
    gaps=[{k:tk[0],turn:true},{k:dk,describe:true},{k:tk[1],turn:true}];
    gaps.forEach(function(g){if(g.turn){var sym=SHP[g.k].sym||4;g.rot=rnd(1,sym-1);}});
  }
  setSay(L===1?'Help Ripple cross the pond. Tap the stone that fits the gap.':L===2?'Help Ripple cross the pond. Read the shape name, then tap the right stone.':'Help Ripple cross the pond. Some stones must be turned to fit.');
  var X=[170,300,430];
  function scene(k){
    var s='<svg class="stones" viewBox="0 0 600 200" role="img" aria-label="Stepping stones across the pond">';
    s+='<rect x="0" y="20" width="600" height="170" rx="22" fill="url(#waterG)"/>';
    s+='<path d="M20 70 h60 M380 160 h80 M200 170 h60" stroke="#fff" stroke-width="4" opacity=".45" stroke-linecap="round"/>';
    s+='<path d="M0 42 A22 22 0 0 1 22 20 H96 C110 60 110 150 96 190 H22 A22 22 0 0 1 0 168 Z" fill="#9FD283"/>';
    s+='<path d="M600 42 A22 22 0 0 0 578 20 H504 C490 60 490 150 504 190 H578 A22 22 0 0 0 600 168 Z" fill="#9FD283"/>';
    s+='<ellipse cx="552" cy="128" rx="30" ry="11" fill="#6DBE5A" stroke="#357A31" stroke-width="2"/>';
    for(var q=0;q<6;q++){s+='<ellipse cx="552" cy="108" rx="7" ry="17" fill="#FBD3E2" stroke="#E07AA4" stroke-width="1.5" transform="rotate('+(q*30-75)+' 552 124)"/>';}
    s+='<circle cx="552" cy="114" r="6" fill="#F5C842"/>';
    gaps.forEach(function(g,i){
      var x=X[i];
      if(filled[i]){s+='<svg x="'+(x-55)+'" y="50" width="110" height="110" viewBox="0 0 100 100">'+stoneSVG(g.k,g.rot||0)+'</svg>';return;}
      s+='<ellipse cx="'+x+'" cy="105" rx="50" ry="46" fill="#fff" opacity="'+(i===k?.28:.12)+'" stroke="#fff" stroke-width="3" stroke-dasharray="9 8"/>';
      if(i!==k)return;
      if(L===1||g.turn){s+='<g transform="translate('+(x-37)+' 68) scale(.74) rotate('+((g.rot||0)*90)+' 50 50)"><path d="'+SHP[g.k].d+'" fill="#fff" fill-opacity=".45" stroke="#1F5A7A" stroke-width="9" stroke-linejoin="round"/><path d="'+SHP[g.k].d+'" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="10 7" stroke-linejoin="round"/></g>';}
      else if(L===2){s+='<rect x="'+(x-76)+'" y="78" width="152" height="54" rx="27" fill="#fff"/><text x="'+x+'" y="116" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="'+(g.k.length>8?26:30)+'" font-weight="600" fill="#3B2A4A">'+g.k+'</text>';}
      else {s+='<text x="'+x+'" y="120" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="46" font-weight="600" fill="#fff">?</text>';}
    });
    var fx= k===0?52: X[k-1];
    s+='<g transform="translate('+(fx-28)+' 52)"><svg width="56" height="74" viewBox="0 0 240 320">'+rippleArt(true)+'</svg></g>';
    return s+'</svg>';
  }
  rounds(3,function(k,next){
    var g=gaps[k], pool, say;
    if(L===1){pool=shuffle(basic);}
    else if(L===2){pool=shuffle([g.k].concat(shuffle(more.filter(function(x){return x!==g.k;})).slice(0,3)));}
    else if(g.describe){pool=shuffle([g.k].concat(shuffle(['pentagon','hexagon','octagon','triangle','semicircle','rectangle','square','circle'].filter(function(x){return x!==g.k;})).slice(0,3)));}
    else {pool=shuffle([g.k].concat(shuffle(turnable.filter(function(x){return x!==g.k;})).slice(0,2)));}
    say = L===3 ? (g.describe?'This stone has '+SHP[g.k].sides+'. Tap the right stone.':'Pick the stone that fits. Tap Turn until it matches the gap, then tap Fit it in.') : null;
    area.innerHTML=roundNote(k,3)+'<div class="panel">'+scene(k)+'</div>'+(say?'<p class="say-small">'+esc(say)+'</p>':'')+'<div class="opts" id="st-opts"></div>'+(L===3&&g.turn?'<div class="row-btns"><button class="btn soft" id="st-turn" disabled>Turn</button><button class="btn" id="st-fit" disabled>Fit it in</button></div>':'');
    if(L===3&&g.turn){
      var rots={}, sel=null; pool.forEach(function(p){rots[p]=0;});
      function drawOpts(){
        var box=$('#st-opts'); box.innerHTML='';
        pool.forEach(function(p){
          var b=optBtn(stoneSVG(p,rots[p]),'Stone with '+aOrAn(shpName(p))+' '+shpName(p)+(sel===p?', chosen':''),'stone');
          b.setAttribute('aria-pressed',String(sel===p));
          b.addEventListener('click',function(){sel=p;tick();drawOpts();$('#st-turn').disabled=false;$('#st-fit').disabled=false;});
          box.appendChild(b);
        });
      }
      drawOpts();
      $('#st-turn').addEventListener('click',function(){if(sel===null)return;rots[sel]=(rots[sel]+1)%4;tick();drawOpts();});
      $('#st-fit').addEventListener('click',function(){
        if(sel===null)return; var sym=SHP[g.k].sym||4;
        var ok= sel===g.k && (rots[sel]%sym)===(g.rot%sym);
        if(ok){filled[k]=true;$('.panel').innerHTML=scene(k+1);}
        next(ok);
      });
      return;
    }
    pool.forEach(function(p){
      var b=optBtn(stoneSVG(p,0),L===1?'Stone with '+aOrAn(shpName(p))+' '+shpName(p):'A stone','stone');
      b.addEventListener('click',function(){var ok=p===g.k;if(ok){filled[k]=true;}next(ok);});
      $('#st-opts').appendChild(b);
    });
  });
}
/* 5. missing letters */
var POND_WORDS1=['fish','frog','duck','crab','net','log','boat','shell','snail','stone'];
var POND_WORDS2=['frog','duck','crab','snail','shell','fish','boat','stone','sponge','net','log'];
var POND_WORDS3=['splash','ripple','pebble','bubble','tadpole','puddle','stream','otter','heron','river','water','dragonfly','minnow','paddle','island','pondweed','beaver','kingfisher','swan','reeds'];
function pzLetters(area,L){ multi(area,L,3,function(R){pzLetters1(area,L,R);}); }
function pzLetters1(area,L,R){
  var canSpeak='speechSynthesis' in window;
  if(L===3&&canSpeak){
    var w3=R.fresh(POND_WORDS3), all=[];for(var i=0;i<w3.length;i++)all.push(i);
    setSay('Listen to the word, then spell it. Tap Hear the word to hear it again.');
    area.innerHTML='<button class="btn leaf" id="lt-hear">'+IC.speak+' Hear the word</button>';
    $('#lt-hear').addEventListener('click',function(){speak(w3,true);});
    speller(area,w3,all,extraLetters(w3,2),function(ok){finish(ok);});
    var exr=cur();
    later(function(){if(!$('#s-puzzle').hidden&&$('#lt-hear'))speak(w3,true);},exr&&exr.read?5200:700);
    return;
  }
  var word=L===1?R.fresh(POND_WORDS1):R.fresh(POND_WORDS2), blanks;
  if(L===3){blanks=[];for(var j=0;j<word.length;j++)blanks.push(j);}
  else if(L===1){blanks=[rnd(0,word.length-1)];}
  else {var idx=shuffle(word.split('').map(function(c,i){return i;})).slice(0,2).sort(function(a,b){return a-b;});blanks=idx;}
  setSay(L===1?'Which letter is missing? Tap it.':L===2?'Two letters are missing. Tap them in order.':'Spell the word for this picture.');
  var label={sailboat:'boat'}[word]||word;
  area.innerHTML='<div class="pic">'+picSVG2(word)+'</div>';
  var extras=extraLetters(word,L===1?2:L===2?3:2);
  speller(area,word,blanks,extras,function(ok){finish(ok);});
}
/* ---------- the fairies ---------- */
var FACTS_RIPPLE=[
  'Frogs can breathe through their skin as well as with their lungs.',
  'A tadpole starts with a tail and no legs. Its legs grow as it turns into a frog.',
  'Water lilies close their flowers in the evening and open them again in the morning.',
  'Dragonflies start life under the water. Then they climb up a reed and grow wings.',
  'Ducks have oily feathers, so the water runs off and they stay dry.'
];
/* her puzzle pictures (100 x 100), added to the shared picture list; any fairy can use them by name */
Object.assign(PICS2,{
  duck:'<ellipse cx="46" cy="64" rx="34" ry="20" fill="#F8CF5A" stroke="#B8861E" stroke-width="3"/><path d="M14 60 C8 48 18 44 26 52" fill="#F8CF5A" stroke="#B8861E" stroke-width="3"/><circle cx="66" cy="38" r="16" fill="#F8CF5A" stroke="#B8861E" stroke-width="3"/><path d="M80 37 L95 42 L80 47 Z" fill="#F7A055" stroke="#B8661E" stroke-width="2" stroke-linejoin="round"/><circle cx="70" cy="34" r="2.8" fill="#3B2A4A"/><path d="M32 60 C40 70 56 70 60 60" stroke="#E0A42A" stroke-width="3" fill="none" stroke-linecap="round"/>',
  cork:'<path d="M30 32 H70 L64 84 H36 Z" fill="#D9A86A" stroke="#8A5A2A" stroke-width="3" stroke-linejoin="round"/><ellipse cx="50" cy="32" rx="20" ry="7" fill="#EAC690" stroke="#8A5A2A" stroke-width="3"/><g fill="#9A6A3A"><circle cx="42" cy="50" r="2"/><circle cx="56" cy="58" r="2.4"/><circle cx="46" cy="70" r="2"/><circle cx="58" cy="42" r="1.6"/></g>',
  block:'<path d="M18 40 L50 26 L82 40 L50 54 Z" fill="#E8BE84" stroke="#8A5A2A" stroke-width="3" stroke-linejoin="round"/><path d="M18 40 V72 L50 88 V54 Z" fill="#CC9656" stroke="#8A5A2A" stroke-width="3" stroke-linejoin="round"/><path d="M82 40 V72 L50 88 V54 Z" fill="#A9733A" stroke="#8A5A2A" stroke-width="3" stroke-linejoin="round"/><path d="M26 56 C32 60 38 62 44 70 M60 64 C66 60 72 58 76 52" stroke="#8A5A2A" stroke-width="1.6" fill="none" opacity=".6"/>',
  feather:'<path d="M80 12 C42 20 22 52 22 86 C50 80 78 54 80 12 Z" fill="#EDF3FB" stroke="#7E92B8" stroke-width="3"/><path d="M80 12 C62 40 40 64 16 92" stroke="#7E92B8" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M62 34 L72 40 M52 46 L64 52 M42 58 L54 64 M54 30 L58 22 M44 42 L46 32 M34 56 L34 46" stroke="#9FB0D0" stroke-width="2" stroke-linecap="round"/>',
  bottle:'<rect x="40" y="8" width="20" height="11" rx="3" fill="#3E7FB0"/><path d="M42 19 H58 V30 C70 36 72 44 72 52 V84 A6 6 0 0 1 66 90 H34 A6 6 0 0 1 28 84 V52 C28 44 30 36 42 30 Z" fill="#E4F4FC" stroke="#6FB3DE" stroke-width="3"/><rect x="29.5" y="56" width="41" height="16" fill="#9AD0F0" opacity=".7"/><path d="M36 42 V82" stroke="#fff" stroke-width="5" opacity=".8" stroke-linecap="round"/>',
  sponge:'<rect x="14" y="30" width="72" height="44" rx="10" fill="#F8D96A" stroke="#C9961E" stroke-width="3"/><g fill="#E0B43A"><circle cx="28" cy="44" r="4"/><circle cx="44" cy="58" r="5"/><circle cx="62" cy="42" r="4"/><circle cx="72" cy="60" r="3.5"/><circle cx="30" cy="64" r="3"/><circle cx="54" cy="66" r="2.5"/></g>',
  coin:'<circle cx="50" cy="50" r="32" fill="url(#ggold)" stroke="#B8861E" stroke-width="3"/><circle cx="50" cy="50" r="24" fill="none" stroke="#B8861E" stroke-width="2"/><text x="50" y="60" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="26" font-weight="600" fill="#8A6216">£1</text>',
  key:'<circle cx="30" cy="50" r="16" fill="none" stroke="#6E7888" stroke-width="11"/><circle cx="30" cy="50" r="16" fill="none" stroke="#C3CAD5" stroke-width="6"/><path d="M46 50 H88 M74 50 V64 M85 50 V61" stroke="#6E7888" stroke-width="11" stroke-linecap="round"/><path d="M46 50 H88 M74 50 V64 M85 50 V61" stroke="#C3CAD5" stroke-width="6" stroke-linecap="round"/>',
  stone:'<path d="M12 66 C10 44 34 28 54 30 C78 32 92 50 88 66 C84 82 60 86 44 84 C24 82 14 78 12 66 Z" fill="url(#stoneG)" stroke="#6E6A7E" stroke-width="3"/><g fill="#8C879A"><circle cx="36" cy="54" r="2.5"/><circle cx="62" cy="46" r="2"/><circle cx="56" cy="70" r="3"/></g><ellipse cx="38" cy="42" rx="10" ry="4" fill="#fff" opacity=".4"/>',
  marble:'<circle cx="50" cy="50" r="30" fill="#7DBDE6" stroke="#3E7FB0" stroke-width="3"/><path d="M28 58 C40 40 56 64 72 42" stroke="#F28CB3" stroke-width="6" fill="none" stroke-linecap="round"/><ellipse cx="40" cy="36" rx="8" ry="5" fill="#fff" opacity=".85"/>',
  spoon:'<ellipse cx="32" cy="38" rx="15" ry="22" fill="#DCE2EA" stroke="#6E7888" stroke-width="3" transform="rotate(-40 32 38)"/><ellipse cx="28" cy="34" rx="5" ry="10" fill="#fff" opacity=".7" transform="rotate(-40 28 34)"/><path d="M44 52 L86 88" stroke="#6E7888" stroke-width="11" stroke-linecap="round"/><path d="M44 52 L86 88" stroke="#C3CAD5" stroke-width="6" stroke-linecap="round"/>',
  boat:'<path d="M50 54 V14" stroke="#5E6878" stroke-width="3"/><path d="M53 16 L78 50 H53 Z" fill="#fff" stroke="#8C96A6" stroke-width="2" stroke-linejoin="round"/><path d="M8 56 H92 L78 82 H22 Z" fill="#A9B3C1" stroke="#5E6878" stroke-width="3" stroke-linejoin="round"/><g fill="#5E6878"><circle cx="24" cy="64" r="2"/><circle cx="38" cy="64" r="2"/><circle cx="52" cy="64" r="2"/><circle cx="66" cy="64" r="2"/><circle cx="80" cy="64" r="2"/></g>',
  clayball:'<circle cx="50" cy="54" r="28" fill="#D98A5E" stroke="#9A4E2A" stroke-width="3"/><path d="M36 44 C40 40 46 40 48 44 M56 62 C60 58 66 60 66 64" stroke="#B5663E" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="40" cy="40" rx="7" ry="4" fill="#fff" opacity=".35"/>',
  clayboat:'<path d="M8 46 C18 82 82 82 92 46 C72 56 28 56 8 46 Z" fill="#D98A5E" stroke="#9A4E2A" stroke-width="3" stroke-linejoin="round"/><path d="M8 46 C28 56 72 56 92 46 C72 38 28 38 8 46 Z" fill="#B5663E" stroke="#9A4E2A" stroke-width="3"/>',
  fish:'<path d="M14 50 C28 28 62 26 76 50 C62 74 28 72 14 50 Z" fill="#F7A055" stroke="#B8661E" stroke-width="3"/><path d="M76 50 L94 34 V66 Z" fill="#F7A055" stroke="#B8661E" stroke-width="3" stroke-linejoin="round"/><circle cx="30" cy="46" r="3.2" fill="#3B2A4A"/><path d="M48 34 C55 44 55 56 48 66" stroke="#B8661E" stroke-width="2.5" fill="none"/><path d="M42 26 C50 18 60 20 62 30" fill="#F8CF5A" stroke="#B8661E" stroke-width="2"/>',
  frog:'<ellipse cx="50" cy="62" rx="32" ry="22" fill="url(#frogG)" stroke="#357A31" stroke-width="3"/><circle cx="34" cy="36" r="12" fill="url(#frogG)" stroke="#357A31" stroke-width="3"/><circle cx="66" cy="36" r="12" fill="url(#frogG)" stroke="#357A31" stroke-width="3"/><circle cx="34" cy="35" r="5.5" fill="#fff"/><circle cx="66" cy="35" r="5.5" fill="#fff"/><circle cx="35" cy="36" r="3" fill="#2A1E1A"/><circle cx="67" cy="36" r="3" fill="#2A1E1A"/><path d="M34 64 Q50 74 66 64" stroke="#245521" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M22 80 L10 90 M78 80 L90 90" stroke="#357A31" stroke-width="6" stroke-linecap="round"/>',
  crab:'<path d="M22 56 L8 48 M22 64 L6 66 M24 72 L10 82 M78 56 L92 48 M78 64 L94 66 M76 72 L90 82" stroke="#C2412E" stroke-width="5" stroke-linecap="round"/><ellipse cx="50" cy="62" rx="30" ry="20" fill="#E8574C" stroke="#9C241C" stroke-width="3"/><path d="M30 46 C20 36 18 24 26 18 C30 26 34 30 38 32 C36 24 40 16 46 18 C44 30 40 40 34 48 Z" fill="#E8574C" stroke="#9C241C" stroke-width="2.5" stroke-linejoin="round"/><path d="M70 46 C80 36 82 24 74 18 C70 26 66 30 62 32 C64 24 60 16 54 18 C56 30 60 40 66 48 Z" fill="#E8574C" stroke="#9C241C" stroke-width="2.5" stroke-linejoin="round"/><circle cx="42" cy="56" r="4" fill="#fff"/><circle cx="58" cy="56" r="4" fill="#fff"/><circle cx="42" cy="57" r="2" fill="#2A1E1A"/><circle cx="58" cy="57" r="2" fill="#2A1E1A"/><path d="M44 68 Q50 72 56 68" stroke="#9C241C" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
  snail:'<path d="M10 80 C10 72 20 70 30 70 H82 C90 70 92 62 88 56 C96 58 98 70 92 78 C88 82 80 82 72 82 H14 Z" fill="#F5D7A8" stroke="#B8925C" stroke-width="2.5"/><path d="M84 58 L80 40 M90 58 L92 42" stroke="#B8925C" stroke-width="2.5" stroke-linecap="round"/><circle cx="80" cy="38" r="3" fill="#3B2A4A"/><circle cx="92" cy="40" r="3" fill="#3B2A4A"/><circle cx="46" cy="50" r="26" fill="#C98A4B" stroke="#7A4E2A" stroke-width="3"/><path d="M46 50 m0 -4 a4 4 0 1 1 -4 4 a8 8 0 1 1 8 8 a12 12 0 1 1 -12 -12 a16 16 0 1 1 16 16" stroke="#7A4E2A" stroke-width="3" fill="none" stroke-linecap="round"/>',
  sailboat:'<path d="M50 60 V14" stroke="#6A3F26" stroke-width="3"/><path d="M53 16 L80 56 H53 Z" fill="#fff" stroke="#8C96A6" stroke-width="2" stroke-linejoin="round"/><path d="M47 22 L26 56 H47 Z" fill="#F28CB3" stroke="#B8467A" stroke-width="2" stroke-linejoin="round"/><path d="M10 62 H90 L78 84 H22 Z" fill="url(#gwood)" stroke="#4E2E1B" stroke-width="3" stroke-linejoin="round"/><path d="M4 90 Q16 84 28 90 T52 90 T76 90 T100 90" stroke="#4E9BC9" stroke-width="4" fill="none" stroke-linecap="round"/>',
  shell:'<path d="M42 86 L30 78 L36 72 C10 62 6 34 18 20 C30 6 70 6 82 20 C94 34 90 62 64 72 L70 78 L58 86 Z" fill="url(#shellG)" stroke="#C9826E" stroke-width="3" stroke-linejoin="round"/><path d="M50 80 L20 40 M50 80 L32 18 M50 80 L50 12 M50 80 L68 18 M50 80 L80 40" stroke="#D99A84" stroke-width="3" opacity=".7" stroke-linecap="round"/>',
  net:'<path d="M58 54 L92 92" stroke="#8A5A30" stroke-width="7" stroke-linecap="round"/><circle cx="38" cy="36" r="26" fill="#E9F5FB" stroke="#6E7888" stroke-width="4"/><path d="M20 22 L56 54 M30 14 L62 44 M14 34 L46 62 M56 18 L20 54 M62 30 L30 62 M46 12 L14 44" stroke="#9AA4B2" stroke-width="2"/>',
  log:'<rect x="14" y="36" width="72" height="34" rx="6" fill="url(#gwood)" stroke="#4E2E1B" stroke-width="3"/><ellipse cx="86" cy="53" rx="10" ry="17" fill="#E1B479" stroke="#4E2E1B" stroke-width="3"/><ellipse cx="86" cy="53" rx="5" ry="9" fill="none" stroke="#A9733A" stroke-width="2"/><path d="M24 46 H60 M30 60 H70" stroke="#4E2E1B" stroke-width="2" opacity=".5"/><path d="M40 36 C40 26 50 24 52 30" stroke="#5FA34D" stroke-width="3" fill="#7CCB6A"/>'
});
/* petal icons for her flower (72 x 72) */
Object.assign(PZICON,{
  /* ---------- puzzle icons for the flower petals (72 x 72) ---------- */
  pipes:'<path d="M8 26 H34 V54 H64" stroke="#5E6878" stroke-width="16" fill="none" stroke-linejoin="round"/><path d="M8 26 H34 V54 H64" stroke="#4FA9DE" stroke-width="9" fill="none" stroke-linejoin="round"/>',
  floats:'<rect x="6" y="30" width="60" height="34" rx="8" fill="url(#waterG)"/><circle cx="26" cy="30" r="9" fill="#F8CF5A" stroke="#B8861E" stroke-width="2.5"/><circle cx="50" cy="56" r="7" fill="#ABA6B8" stroke="#6E6A7E" stroke-width="2.5"/>',
  jugs:'<path d="M18 10 H54 V60 A6 6 0 0 1 48 66 H24 A6 6 0 0 1 18 60 Z" fill="#F4FAFD" stroke="#6FB3DE" stroke-width="3"/><rect x="20" y="36" width="32" height="28" rx="3" fill="url(#waterG)"/><path d="M54 22 H46 M54 36 H46 M54 50 H46" stroke="#3B4A6C" stroke-width="2.5"/>',
  stones:'<rect x="2" y="40" width="68" height="26" rx="10" fill="url(#waterG)"/><ellipse cx="18" cy="48" rx="13" ry="9" fill="url(#stoneG)"/><ellipse cx="50" cy="48" rx="13" ry="9" fill="url(#stoneG)"/><path d="M50 18 L62 36 H38 Z" fill="#7DBDE6" stroke="#3B2A4A" stroke-width="2.5" stroke-linejoin="round"/><rect x="11" y="22" width="14" height="14" fill="#F8CF5A" stroke="#3B2A4A" stroke-width="2.5"/>',
  letters:'<rect x="6" y="16" width="60" height="40" rx="12" fill="#fff" stroke="#2A8199" stroke-width="3"/><text x="36" y="45" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="22" font-weight="600" fill="#2A8199">f_sh</text>'
});
/* ---------- Ripple ---------- */
FAIRIES.ripple={id:'ripple',name:'Ripple',kind:'Water fairy',place:"Ripple's pond",art:rippleArt,body:shellBody,houseLabel:"Ripple's shell house by the pond",tapClass:'splash',tapMs:2600,
  facts:FACTS_RIPPLE,scene:pondScene,base:'#CFE9F4',foundBg:'#DDF0F8',
  foundGround:'<ellipse cx="170" cy="340" rx="150" ry="20" fill="url(#waterG)"/><ellipse cx="170" cy="334" rx="80" ry="12" fill="#6DBE5A" stroke="#357A31" stroke-width="2"/>',
  thanks:'Thank you for helping at my pond.',
  icon:'<path d="M50 14 C62 34 72 46 72 60 A22 22 0 0 1 28 60 C28 46 38 34 50 14 Z" fill="#fff" stroke="#2E6E8E" stroke-width="3"/><path d="M40 60 A10 10 0 0 0 48 72" stroke="#7DBDE6" stroke-width="4" fill="none" stroke-linecap="round"/>',
  flowerBase:function(){
    return '<ellipse cx="340" cy="650" rx="300" ry="54" fill="#5FA8D6" opacity=".55"/>' +
      '<ellipse cx="340" cy="646" rx="250" ry="40" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/>' +
      '<path d="M340 380 C334 470 346 560 340 626" stroke="#2F6B2C" stroke-width="18" fill="none" stroke-linecap="round"/>' +
      '<path d="M340 380 C334 470 346 560 340 626" stroke="#4E9F45" stroke-width="11" fill="none" stroke-linecap="round"/>' +
      '<path d="M340 632 L470 616 A170 40 0 1 1 452 600 Z" fill="url(#ptleaf)" stroke="#2F6B2C" stroke-width="3"/>' +
      '<path d="M340 632 L200 624 M340 632 L260 662 M340 632 L400 664 M340 632 L480 640" stroke="#2F6B2C" stroke-width="2" opacity=".35"/>' +
      '<ellipse cx="270" cy="616" rx="40" ry="8" fill="#fff" opacity=".3"/>';
  },
  puz:[
    {id:'pipes',titles:['Pipe to the lily','Pipe to the lily','Pipe maze'],run:pzPipes},
    {id:'floats',titles:['Float or sink?','Float or sink?','Why does it float?'],run:pzFloats},
    {id:'jugs',titles:['Fill the jug','Read the jug','Two jugs'],run:pzJugs},
    {id:'stones',titles:['Stepping stones','Stepping stones','Turn the stones'],run:pzStones},
    {id:'letters',titles:['Missing letter','Missing letters','Listen and spell'],run:pzLetters}
  ]};
FAIRY_ORDER.push('ripple');
