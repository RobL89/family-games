/* Crumble, the Baker fairy: her art, teapot house, teapot kitchen, cake jigsaw picture, pictures, facts,
   puzzles (share the cakes, coins, ice the cake, recipe words, cake jigsaw) and her FAIRIES entry. */
'use strict';
/* her gradients (added to the shared defs; any fairy can use them) */
addDefs(
'<radialGradient id="crApron" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#FFF4F7"/><stop offset="1" stop-color="#E9CCD6"/></radialGradient>' +
'<radialGradient id="teaG" cx=".36" cy=".3" r=".85"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#FBE3EA"/><stop offset="1" stop-color="#D9A3B5"/></radialGradient>' +
'<radialGradient id="cakeG" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#FCE8C4"/><stop offset="1" stop-color="#D9AE6C"/></radialGradient>' +
'<radialGradient id="iceG" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#FFE0EB"/><stop offset="1" stop-color="#F28CB3"/></radialGradient>' +
'<radialGradient id="biscG" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#F7D79A"/><stop offset=".7" stop-color="#E0AE5E"/><stop offset="1" stop-color="#B8823A"/></radialGradient>' +
'<radialGradient id="copperG" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#F3B98A"/><stop offset=".6" stop-color="#C8743E"/><stop offset="1" stop-color="#8A4A22"/></radialGradient>' +
'<radialGradient id="silverG" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#C9CFD8"/><stop offset="1" stop-color="#8C96A6"/></radialGradient>'
);
/* ---------- Crumble, the Baker fairy ---------- */
function crumbleArt(noShadow){
  var skin='url(#skinB)', flat='#EDBB98';
  return (noShadow?'':'<ellipse cx="120" cy="308" rx="44" ry="7" fill="#B8467A" opacity=".2" filter="url(#fshadow)"/>') +
  '<g class="wings">' +
  '<path d="M112 150 C84 100 40 104 42 136 C44 166 88 168 112 158 Z" fill="url(#wingRose)" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '<path d="M112 166 C82 172 60 200 72 220 C86 238 112 204 116 174 Z" fill="url(#wingRose)" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '<path d="M128 150 C156 100 200 104 198 136 C196 166 152 168 128 158 Z" fill="url(#wingRose)" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '<path d="M128 166 C158 172 180 200 168 220 C154 238 128 204 124 174 Z" fill="url(#wingRose)" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '</g>' +
  '<rect x="106" y="226" width="11" height="40" rx="5.5" fill="url(#leggings)"/><rect x="123" y="226" width="11" height="40" rx="5.5" fill="url(#leggings)"/>' +
  '<path d="M101 260 H118 V270 C118 276 112 279 104 279 C97 279 95 271 101 260 Z" fill="url(#slipperPink)"/>' +
  '<path d="M122 260 H139 C145 271 143 279 136 279 C128 279 122 276 122 270 Z" fill="url(#slipperPink)"/>' +
  /* pink dress with a white apron */
  '<path d="M104 152 C100 152 98 160 98 168 C92 188 84 214 82 234 C98 242 142 242 158 234 C156 214 148 188 142 168 C142 160 140 152 136 152 Z" fill="url(#dressRose)"/>' +
  '<path d="M106 168 H134 L140 230 C126 236 114 236 100 230 Z" fill="url(#crApron)" stroke="#E9CCD6" stroke-width="1.2"/>' +
  '<path d="M106 168 C104 160 108 154 112 152 M134 168 C136 160 132 154 128 152" stroke="#fff" stroke-width="3" fill="none"/>' +
  '<path d="M110 196 H130 V210 H110 Z" fill="none" stroke="#E9CCD6" stroke-width="1.5"/>' +
  '<circle cx="114" cy="182" r="2.4" fill="#F28CB3"/><circle cx="126" cy="182" r="2.4" fill="#F28CB3"/><circle cx="120" cy="220" r="2.4" fill="#F28CB3"/>' +
  '<path d="M98 172 Q120 180 142 172" stroke="#F28CB3" stroke-width="4" fill="none"/>' +
  '<path d="M104 164 C94 176 90 188 88 198" stroke="'+flat+'" stroke-width="10" fill="none" stroke-linecap="round"/>' +
  '<circle cx="88" cy="200" r="6" fill="'+skin+'"/>' +
  /* raised arm with a wooden spoon */
  '<g class="arm"><path d="M136 164 C150 158 158 148 162 138" stroke="'+flat+'" stroke-width="10" fill="none" stroke-linecap="round"/>' +
  '<path d="M164 138 L180 108" stroke="url(#gwood)" stroke-width="4" stroke-linecap="round"/><ellipse cx="183" cy="100" rx="7" ry="11" transform="rotate(28 183 100)" fill="#C79A66" stroke="#8A5A30" stroke-width="1.5"/>' +
  '<circle cx="163" cy="136" r="6" fill="'+skin+'"/></g>' +
  '<rect x="114" y="138" width="12" height="16" rx="4" fill="#D9A47F"/>' +
  '<circle cx="120" cy="108" r="40" fill="'+skin+'"/>' +
  '<path d="M80 108 C76 72 98 58 120 58 C142 58 164 72 160 108 C154 94 144 88 134 92 C126 82 112 82 106 92 C96 86 86 92 80 108 Z" fill="url(#hairChestnut)"/>' +
  '<circle cx="80" cy="112" r="9" fill="url(#hairChestnut)"/><circle cx="160" cy="112" r="9" fill="url(#hairChestnut)"/>' +
  /* chef hat */
  '<path d="M86 74 C76 54 92 38 104 44 C106 28 134 28 136 44 C148 38 164 54 154 74 Z" fill="#fff" stroke="#E4DAF0" stroke-width="2"/><rect x="88" y="68" width="64" height="14" rx="6" fill="#fff" stroke="#E4DAF0" stroke-width="2"/>' +
  '<path d="M99 102 Q105 98 111 101 M129 101 Q135 98 141 102" stroke="#5E3520" stroke-width="2" fill="none" stroke-linecap="round"/>' +
  '<ellipse cx="106" cy="115" rx="5.5" ry="7" fill="#3B2410"/><ellipse cx="134" cy="115" rx="5.5" ry="7" fill="#3B2410"/>' +
  '<circle cx="108" cy="112" r="2" fill="#fff"/><circle cx="136" cy="112" r="2" fill="#fff"/>' +
  '<ellipse cx="95" cy="127" rx="7" ry="4.5" fill="#F28CB3" opacity=".45"/><ellipse cx="145" cy="127" rx="7" ry="4.5" fill="#F28CB3" opacity=".45"/>' +
  '<circle cx="132" cy="124" r="2.2" fill="#fff" opacity=".8"/>' +
  '<path d="M112 127 Q120 136 128 127" stroke="#7A3428" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
}
function teapotBody(){
  var s='';
  /* steam from the spout */
  s+='<g class="steam"><circle cx="18" cy="56" r="7" fill="#fff"/><circle cx="12" cy="42" r="9" fill="#fff"/><circle cx="20" cy="26" r="7" fill="#fff"/></g>';
  /* spout and handle */
  s+='<path d="M58 132 C40 128 30 108 22 76 L12 70 L28 64 C40 96 52 104 66 108 Z" fill="url(#teaG)" stroke="#C88A9E" stroke-width="2" stroke-linejoin="round"/>';
  s+='<path d="M166 98 C204 92 212 150 168 156" stroke="#C88A9E" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M166 98 C204 92 212 150 168 156" stroke="#FBE3EA" stroke-width="10" fill="none" stroke-linecap="round"/>';
  /* cupcake that pops out of the lid */
  s+='<g class="cup"><path d="M98 66 L102 82 H118 L122 66 Z" fill="#F7A055" stroke="#B8661E" stroke-width="1.5"/><path d="M96 66 C94 54 104 50 110 52 C116 50 126 54 124 66 Z" fill="url(#iceG)" stroke="#C24C7E" stroke-width="1.5"/><circle cx="110" cy="48" r="4" fill="#E8574C"/></g>';
  /* body */
  s+='<ellipse cx="110" cy="128" rx="66" ry="56" fill="url(#teaG)" stroke="#C88A9E" stroke-width="2"/>';
  [[76,104],[146,108],[90,152],[134,156],[110,94],[66,136],[156,140]].forEach(function(d){s+='<circle cx="'+d[0]+'" cy="'+d[1]+'" r="5" fill="#F28CB3" opacity=".75"/>';});
  s+='<path d="M48 120 C66 128 154 128 172 120" stroke="#F28CB3" stroke-width="5" fill="none" opacity=".6"/>';
  s+='<ellipse cx="80" cy="102" rx="10" ry="18" transform="rotate(-30 80 102)" fill="#fff" opacity=".5" filter="url(#fsoft)"/>';
  /* lid and knob */
  s+='<path d="M72 78 C72 62 148 62 148 78 Z" fill="url(#teaG)" stroke="#C88A9E" stroke-width="2"/><ellipse cx="110" cy="78" rx="42" ry="8" fill="#F6CBD8" stroke="#C88A9E" stroke-width="2"/><circle cx="110" cy="62" r="7" fill="url(#ggold)"/>';
  /* windows and door */
  s+='<circle cx="82" cy="132" r="9" fill="#C88A9E"/><circle cx="82" cy="132" r="6.5" fill="url(#gglass)"/><circle cx="138" cy="132" r="9" fill="#C88A9E"/><circle cx="138" cy="132" r="6.5" fill="url(#gglass)"/>';
  s+='<path d="M98 182 V160 A12 12 0 0 1 122 160 V182 Z" fill="#8A3F5E"/><path d="M101 182 V161 A9 9 0 0 1 119 161 V182 Z" fill="url(#gdoorgold)"/><circle cx="115" cy="173" r="1.8" fill="#8A3F5E"/>';
  return s;
}
/* ---------- Crumble's world: the teapot kitchen ---------- */
function kitchenScene(){
  var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMax slice"><defs>' +
  '<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF4EC"/><stop offset="1" stop-color="#FCE3E3"/></linearGradient>' +
  '<linearGradient id="win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE3F5"/><stop offset="1" stop-color="#DDF0D0"/></linearGradient>' +
  '<linearGradient id="bench" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9C8A0"/><stop offset="1" stop-color="#C79A66"/></linearGradient>' +
  '<linearGradient id="cup" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#E9CCD6"/></linearGradient>' +
  '<radialGradient id="cakeG" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#FCE8C4"/><stop offset="1" stop-color="#D9AE6C"/></radialGradient>' +
  '<radialGradient id="iceG" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#FFE0EB"/><stop offset="1" stop-color="#F28CB3"/></radialGradient>' +
  '</defs>';
  s+='<rect width="1200" height="900" fill="url(#wall)"/>';
  /* curved teapot-wall stripes */
  for(var i=0;i<9;i++){s+='<path d="M'+(i*150-30)+' 0 C'+(i*150+20)+' 300 '+(i*150+20)+' 500 '+(i*150-30)+' 700" stroke="#F6D2DC" stroke-width="10" fill="none" opacity=".6"/>';}
  /* bunting */
  s+='<path d="M0 40 Q300 110 600 50 Q900 110 1200 40" stroke="#C88A9E" stroke-width="3" fill="none"/>';
  var cols=['#F28CB3','#F8CF5A','#7FD3B5','#7DBDE6','#B3A4F0'];
  for(var b=0;b<16;b++){var t=b/15, x=t*1200, y=40+Math.sin(t*Math.PI*2)*-30+30; s+='<path d="M'+f2(x-18)+' '+f2(y)+' L'+f2(x+18)+' '+f2(y)+' L'+f2(x)+' '+f2(y+34)+' Z" fill="'+cols[b%5]+'"/>';}
  /* round window */
  s+='<circle cx="600" cy="240" r="130" fill="#C88A9E"/><circle cx="600" cy="240" r="114" fill="url(#win)"/><path d="M600 126 V354 M486 240 H714" stroke="#C88A9E" stroke-width="10"/>';
  s+='<g opacity=".7"><circle cx="540" cy="300" r="34" fill="#9FD283"/><circle cx="660" cy="290" r="40" fill="#86C462"/></g>';
  /* shelves with teacups and jars */
  function cup(x,y,c){return '<path d="M'+(x-18)+' '+(y-26)+' H'+(x+18)+' L'+(x+14)+' '+y+' H'+(x-14)+' Z" fill="url(#cup)" stroke="#C88A9E" stroke-width="2"/><path d="M'+(x+18)+' '+(y-20)+' C'+(x+30)+' '+(y-20)+' '+(x+30)+' '+(y-6)+' '+(x+16)+' '+(y-6)+'" stroke="#C88A9E" stroke-width="3" fill="none"/><circle cx="'+x+'" cy="'+(y-14)+'" r="4" fill="'+c+'"/>';}
  s+='<rect x="40" y="250" width="320" height="16" rx="6" fill="#C79A66"/><rect x="840" y="250" width="320" height="16" rx="6" fill="#C79A66"/>';
  s+=cup(90,250,'#F28CB3')+cup(150,250,'#7DBDE6')+cup(210,250,'#F8CF5A')+cup(270,250,'#7FD3B5')+cup(330,250,'#B3A4F0');
  [[880,'#E8574C'],[940,'#F8CF5A'],[1000,'#F7A055'],[1060,'#B3A4F0'],[1120,'#7FD3B5']].forEach(function(j){s+='<rect x="'+(j[0]-18)+'" y="186" width="36" height="64" rx="8" fill="'+j[1]+'" opacity=".85" stroke="#fff" stroke-width="2"/><rect x="'+(j[0]-14)+'" y="176" width="28" height="12" rx="4" fill="#fff" stroke="#C88A9E" stroke-width="2"/>';});
  /* hanging utensils */
  s+='<path d="M60 360 H340" stroke="#C88A9E" stroke-width="4"/>';
  [[100,'whisk'],[170,'spoon'],[240,'whisk'],[300,'spoon']].forEach(function(u){s+='<path d="M'+u[0]+' 360 V380" stroke="#8A5A30" stroke-width="3"/>'+(u[1]==='whisk'?'<path d="M'+u[0]+' 380 V410 M'+u[0]+' 410 C'+(u[0]-14)+' 430 '+(u[0]-10)+' 460 '+u[0]+' 462 C'+(u[0]+10)+' 460 '+(u[0]+14)+' 430 '+u[0]+' 410" stroke="#8C96A6" stroke-width="3" fill="none"/>':'<path d="M'+u[0]+' 380 V430" stroke="#C79A66" stroke-width="6"/><ellipse cx="'+u[0]+'" cy="446" rx="10" ry="16" fill="#C79A66"/>');});
  /* oven on the right */
  s+='<rect x="880" y="380" width="260" height="280" rx="20" fill="#F6CBD8" stroke="#C88A9E" stroke-width="4"/><rect x="910" y="460" width="200" height="140" rx="14" fill="#5E3A4A"/><rect x="926" y="476" width="168" height="108" rx="10" fill="#F7A055" opacity=".7"/><path d="M930 540 H1090" stroke="#3B2A4A" stroke-width="3"/>' +
    '<g transform="translate(980 532)"><path d="M-30 0 C-30 -20 30 -20 30 0 Z" fill="#E8B06A"/></g><g transform="translate(1046 532)"><path d="M-24 0 C-24 -16 24 -16 24 0 Z" fill="#E8B06A"/></g>' +
    '<circle cx="940" cy="420" r="12" fill="#fff" stroke="#C88A9E" stroke-width="3"/><circle cx="980" cy="420" r="12" fill="#fff" stroke="#C88A9E" stroke-width="3"/><rect x="1020" y="410" width="90" height="20" rx="6" fill="#fff" opacity=".8"/>';
  /* counter with cakes along the bottom */
  s+='<rect x="0" y="660" width="1200" height="240" fill="url(#bench)"/><rect x="0" y="652" width="1200" height="20" rx="6" fill="#F3DCB8"/>';
  s+='<g transform="translate(150 660)"><ellipse cx="0" cy="0" rx="90" ry="14" fill="#fff" stroke="#E4DAF0" stroke-width="3"/><path d="M-70 -4 V-60 C-70 -76 70 -76 70 -60 V-4 Z" fill="url(#cakeG)"/><path d="M-70 -60 C-70 -76 70 -76 70 -60 C70 -44 50 -40 40 -46 C30 -38 10 -38 0 -46 C-10 -38 -30 -38 -40 -46 C-50 -40 -70 -44 -70 -60 Z" fill="url(#iceG)"/><circle cx="0" cy="-78" r="8" fill="#E8574C"/></g>';
  s+='<g transform="translate(1050 660)"><rect x="-80" y="-40" width="160" height="40" rx="14" fill="#E8B06A" stroke="#9A6234" stroke-width="3"/><path d="M-60 -40 C-50 -60 -30 -60 -20 -40 M-10 -40 C0 -60 20 -60 30 -40" stroke="#9A6234" stroke-width="3" fill="#F3D199"/></g>';
  [[360,700],[420,730],[780,710],[840,740]].forEach(function(c,i){s+='<g transform="translate('+c[0]+' '+c[1]+') scale(1.4)"><path d="M-14 0 L-10 22 H10 L14 0 Z" fill="'+cols[i]+'"/><path d="M-16 0 C-18 -14 -6 -18 0 -16 C6 -18 18 -14 16 0 Z" fill="#FFF4F7" stroke="#E9CCD6" stroke-width="1.5"/><circle cx="0" cy="-18" r="4" fill="#E8574C"/></g>';});
  s+='</svg>';
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
}
function cakePicture(){
  var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">'+allDefs() +
    '<rect width="600" height="600" fill="#FFF0F3"/>';
  for(var i=0;i<7;i++){s+='<rect x="'+(i*90)+'" y="0" width="45" height="600" fill="#FCE3EA"/>';}
  s+='<rect x="0" y="470" width="600" height="130" fill="#C79A66"/><rect x="0" y="462" width="600" height="18" fill="#F3DCB8"/>';
  /* three-layer cake */
  s+='<g transform="translate(300 470)"><ellipse cx="0" cy="0" rx="200" ry="22" fill="#fff" stroke="#E4DAF0" stroke-width="4"/>' +
    '<rect x="-160" y="-110" width="320" height="104" rx="14" fill="url(#cakeG)"/><rect x="-160" y="-66" width="320" height="16" fill="#E8574C" opacity=".85"/>' +
    '<rect x="-120" y="-200" width="240" height="92" rx="14" fill="url(#cakeG)"/><rect x="-120" y="-160" width="240" height="14" fill="#E8574C" opacity=".85"/>' +
    '<rect x="-80" y="-270" width="160" height="72" rx="14" fill="url(#cakeG)"/>';
  [[-160,-110,320],[-120,-200,240],[-80,-270,160]].forEach(function(l){var x=l[0],y=l[1],w=l[2],d='M'+x+' '+(y+6)+' Q'+x+' '+y+' '+(x+10)+' '+y+' H'+(x+w-10)+' Q'+(x+w)+' '+y+' '+(x+w)+' '+(y+6);for(var k=w;k>=0;k-=20){d+=' Q'+(x+k-10)+' '+(y+30)+' '+(x+k-20)+' '+(y+6);}s+='<path d="'+d+' Z" fill="url(#iceG)"/>';});
  [[-60,-290],[0,-300],[60,-290]].forEach(function(c){s+='<circle cx="'+c[0]+'" cy="'+c[1]+'" r="14" fill="#E8574C" stroke="#9C241C" stroke-width="2"/><path d="M'+c[0]+' '+(c[1]-14)+' q6 -16 18 -18" stroke="#3F8A3A" stroke-width="3" fill="none"/>';});
  var sp=['#7DBDE6','#F8CF5A','#7FD3B5','#B3A4F0']; for(var j=0;j<40;j++){var x=-150+(j*37)%300, y=-100+((j*23)%90); if(j%2)y-=95; s+='<rect x="'+x+'" y="'+y+'" width="8" height="3" rx="1.5" fill="'+sp[j%4]+'" transform="rotate('+(j*40)+' '+x+' '+y+')"/>';}
  s+='</g>';
  s+='<g transform="translate(70 70) scale(.6)">'+teapotBody()+'</g>';
  [[80,440,'#F7A055'],[520,440,'#7FD3B5']].forEach(function(c){s+='<g transform="translate('+c[0]+' '+c[1]+') scale(1.6)"><path d="M-14 0 L-10 22 H10 L14 0 Z" fill="'+c[2]+'"/><path d="M-16 0 C-18 -14 -6 -18 0 -16 C6 -18 18 -14 16 0 Z" fill="url(#iceG)"/><circle cx="0" cy="-18" r="4" fill="#E8574C"/></g>';});
  s+='<path d="M420 120 Q480 160 560 120" stroke="#C88A9E" stroke-width="3" fill="none"/>';
  [[440,'#F28CB3'],[480,'#F8CF5A'],[520,'#7FD3B5']].forEach(function(f){s+='<path d="M'+(f[0]-14)+' 132 L'+(f[0]+14)+' 132 L'+f[0]+' 162 Z" fill="'+f[1]+'"/>';});
  s+='</svg>';
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
}
/* ================= Crumble's teapot-kitchen puzzles ================= */
/* cake seen from above, cut into n equal slices (or uneven when uneven is set), with some iced */
function cakeTop(n,iced,uneven,label){
  var s='<svg viewBox="0 0 100 100" '+(label?'role="img" aria-label="'+esc(label)+'"':'aria-hidden="true"')+'><circle cx="50" cy="52" r="44" fill="#B8823A" opacity=".3"/><circle cx="50" cy="50" r="44" fill="url(#cakeG)" stroke="#B8823A" stroke-width="3"/>';
  if(uneven){
    s+='<path d="M50 50 L50 6 A44 44 0 0 1 94 50 Z" fill="url(#iceG)" opacity="'+(iced?1:0)+'"/><path d="M50 6 V94 M6 66 H94" stroke="#8A5A30" stroke-width="2.5"/>';
    return s+'</svg>';
  }
  for(var i=0;i<n;i++){
    var a0=-90+i*360/n, a1=a0+360/n, r=44;
    var x0=50+r*Math.cos(a0*Math.PI/180), y0=50+r*Math.sin(a0*Math.PI/180), x1=50+r*Math.cos(a1*Math.PI/180), y1=50+r*Math.sin(a1*Math.PI/180);
    if(i<iced)s+='<path d="M50 50 L'+f2(x0)+' '+f2(y0)+' A44 44 0 '+(360/n>180?1:0)+' 1 '+f2(x1)+' '+f2(y1)+' Z" fill="url(#iceG)"/><circle cx="'+f2(50+26*Math.cos((a0+a1)/2*Math.PI/180))+'" cy="'+f2(50+26*Math.sin((a0+a1)/2*Math.PI/180))+'" r="3.5" fill="#E8574C"/>';
  }
  if(n>1)for(i=0;i<n;i++){var a=-90+i*360/n;s+='<path d="M50 50 L'+f2(50+44*Math.cos(a*Math.PI/180))+' '+f2(50+44*Math.sin(a*Math.PI/180))+'" stroke="#8A5A30" stroke-width="2.5"/>';}
  return s+'</svg>';
}
function frac(a,b){return '<span class="frac"><span>'+a+'</span><span>'+b+'</span></span>';}
function fracOpts(box,list,ans,done){
  shuffle(list).forEach(function(f){var b=optBtn(frac(f[0],f[1]),f[0]+' out of '+f[1],'word fracbtn');b.addEventListener('click',function(){done(f[0]===ans[0]&&f[1]===ans[1]);});box.appendChild(b);});
}
/* 1. share the cakes */
/* a whole cake from above with only 'left' of its n slices still on it */
function cakeLeft(n,left,label){
  var s='<svg viewBox="0 0 100 100" '+(label?'role="img" aria-label="'+esc(label)+'"':'aria-hidden="true"')+'><circle cx="50" cy="50" r="46" fill="#F3EEF8" stroke="#D9CDE8" stroke-width="3"/>';
  for(var i=0;i<left;i++){
    var a0=-90+i*360/n, a1=a0+360/n, r=40, mid=(a0+a1)/2;
    var x0=50+r*Math.cos(a0*Math.PI/180), y0=50+r*Math.sin(a0*Math.PI/180), x1=50+r*Math.cos(a1*Math.PI/180), y1=50+r*Math.sin(a1*Math.PI/180);
    s+='<path d="M50 50 L'+f2(x0)+' '+f2(y0)+' A40 40 0 0 1 '+f2(x1)+' '+f2(y1)+' Z" fill="url(#iceG)" stroke="#B8823A" stroke-width="2" stroke-linejoin="round"/><circle cx="'+f2(50+27*Math.cos(mid*Math.PI/180))+'" cy="'+f2(50+27*Math.sin(mid*Math.PI/180))+'" r="4" fill="#E8574C"/>';
  }
  return s+'</svg>';
}
function sliceIcon(){return '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 94 L4 20 A86 86 0 0 1 96 20 Z" fill="url(#iceG)" stroke="#B8823A" stroke-width="5" stroke-linejoin="round"/><path d="M4 20 A86 86 0 0 1 96 20 L91 30 A78 78 0 0 0 9 30 Z" fill="url(#cakeG)"/><circle cx="50" cy="44" r="11" fill="#E8574C"/></svg>';}
function pzShare(area,L){
  if(L===1){
    var kinds=shuffle(['cupcakes','cake',pick(['cupcakes','cake'])]);
    multi(area,L,3,function(R){pzShare1(area,R,kinds[R.k]);});
    return;
  }
  pzShare23(area,L);
}
function pzShare1(area,R,kind){
  var cake=kind==='cake', n=cake?pick([4,6,8]):pick([4,6,8,10]), plates=[0,0], what=cake?'slices':'cupcakes';
  var icon=cake?sliceIcon():picSVG2('cupcake');
  setSay(cake?'Crumble baked a big cake. Share the slices fairly between Crumble and her friend. Tap a plate to give it a slice. Tap Done when the cake is all shared.':'Share the cupcakes fairly between Crumble and her friend. Tap a plate to put a cupcake on it. Tap Done when all the cupcakes are shared.');
  area.innerHTML='<div class="tray" id="sh-tray"></div><div class="plates"><button type="button" class="plate" id="sh-p0" aria-label="Crumble’s plate"><span class="plabel">Crumble</span><span class="pin"></span></button><button type="button" class="plate" id="sh-p1" aria-label="Her friend’s plate"><span class="plabel">Friend</span><span class="pin"></span></button></div><button class="btn" id="sh-done">Done</button>';
  function draw(){
    var left=n-plates[0]-plates[1];
    if(cake)$('#sh-tray').innerHTML=left?'<span class="wholecake">'+cakeLeft(n,left,'A cake with '+left+' slice'+(left===1?'':'s')+' left')+'</span>':'<span class="tray-empty">All the slices are on plates.</span>';
    else $('#sh-tray').innerHTML=left?Array(left+1).join('<span class="cakeic">'+icon+'</span>'):'<span class="tray-empty">All the cupcakes are on plates.</span>';
    [0,1].forEach(function(p){var el=$('#sh-p'+p+' .pin');el.innerHTML='';for(var i=0;i<plates[p];i++){var c=document.createElement('span');c.className='cakeic small';c.innerHTML=icon;el.appendChild(c);}
      $('#sh-p'+p).setAttribute('aria-label',(p?'Her friend’s plate':'Crumble’s plate')+', '+plates[p]+' '+(plates[p]===1?what.slice(0,-1):what));});
  }
  [0,1].forEach(function(p){$('#sh-p'+p).addEventListener('click',function(e){
    if(e.target.closest('.cakeic')){if(plates[p]>0){plates[p]--;tick();draw();}return;}
    if(n-plates[0]-plates[1]>0){plates[p]++;tick();draw();}
  });});
  $('#sh-done').addEventListener('click',function(){finish(plates[0]+plates[1]===n&&plates[0]===plates[1]);});
  draw();
}
function cupcakeRow(n,marked,label){
  var h='<div class="cuprow" role="img" aria-label="'+esc(label)+'">';
  for(var i=0;i<n;i++)h+='<span class="cakeic small'+(i<marked?' cherry':'')+'">'+picSVG2('cupcake')+'</span>';
  return h+'</div>';
}
function pzShare23(area,L){
  if(L===2){
    setSay('Crumble is cutting cakes and sharing cupcakes. Look carefully.');
    rounds(3,function(k,next){
      if(k===2){
        var g=pick([4,8,12]), f=pick([2,4]), ans=g/f, q='Crumble has '+g+' cupcakes. She gives '+(f===2?'half':'a quarter')+' of them to her friend. How many does her friend get?';
        area.innerHTML=roundNote(2,3)+cupcakeRow(g,0,g+' cupcakes')+'<p class="say-small">'+esc(q)+'</p><div class="opts" id="fr-opts"></div>';
        speak(q); numOpts($('#fr-opts'),ans,[ans+1,ans-1,ans*2,g/(f===2?4:2),ans+2],next); return;
      }
      if(k===0){
        var want=pick([2,4]), word=want===2?'halves':'quarters';
        var opts=[{h:cakeTop(want,0,false),ok:true},{h:cakeTop(4,0,true),ok:false},{h:cakeTop(want===2?3:2,0,false),ok:false}];
        area.innerHTML=roundNote(0,3)+'<p class="say-small">Which cake is cut into '+word+'? The pieces must all be the same size.</p><div class="opts" id="fr-opts"></div>';
        speak('Which cake is cut into '+word+'?');
        shuffle(opts).forEach(function(o){var b=optBtn(o.h,'A cake');b.classList.add('cakeopt');b.addEventListener('click',function(){next(o.ok);});$('#fr-opts').appendChild(b);});
      } else {
        var c=pick([[2,1],[4,1],[4,3]]), ans=c[0]===2?[1,2]:[c[1],4];
        area.innerHTML=roundNote(1,3)+'<div class="pic cakepic">'+cakeTop(c[0],c[1],false,'A cake with some pink icing')+'</div><p class="say-small">What fraction of the cake has pink icing?</p><div class="opts" id="fr-opts"></div>';
        speak('What fraction of the cake has pink icing?');
        fracOpts($('#fr-opts'),[[1,2],[1,4],[3,4]],ans,next);
      }
    });
    return;
  }
  setSay('Crumble is cutting cakes into thirds and eighths and sharing cupcakes. Look carefully.');
  rounds(3,function(k,next){
    if(k===2){
      var g=pick([6,9,12,8,16]), d=g%3===0?3:pick([4,8]), m=rnd(2,d-1), ans3=g/d*m, q3=m+'/'+d+' of Crumble’s '+g+' cupcakes have a cherry on top. How many cupcakes have a cherry?';
      area.innerHTML=roundNote(2,3)+cupcakeRow(g,0,g+' cupcakes')+'<p class="say-small">'+frac(m,d)+' of Crumble’s '+g+' cupcakes have a cherry on top. How many cupcakes have a cherry?</p><div class="opts" id="fr-opts"></div>';
      speak(m+' '+(d===3?'thirds':d===4?'quarters':'eighths')+' of Crumble’s '+g+' cupcakes have a cherry on top. How many cupcakes have a cherry?');
      numOpts($('#fr-opts'),ans3,[ans3+1,ans3-1,g/d,g-ans3,ans3+2],next); return;
    }
    if(k===0){
      var n2=pick([3,8]), iced=rnd(1,n2-1), ans=[iced,n2];
      /* wrong answers: real fractions only (never more pieces than the cake has), and no repeats */
      var other=n2===3?8:3, cands=[];
      [[n2-iced,n2],[iced,other],[iced+1,n2],[iced-1,n2],[iced,n2===3?6:4],[iced+2,n2],[1,other]].forEach(function(f){
        if(f[0]>0&&f[0]<f[1]&&!(f[0]===ans[0]&&f[1]===ans[1])&&!cands.some(function(c){return c[0]===f[0]&&c[1]===f[1];}))cands.push(f);
      });
      area.innerHTML=roundNote(0,3)+'<div class="pic cakepic">'+cakeTop(n2,iced,false,'A cake with some pink icing')+'</div><p class="say-small">What fraction of the cake has pink icing?</p><div class="opts" id="fr-opts"></div>';
      fracOpts($('#fr-opts'),[ans].concat(cands.slice(0,3)),ans,next);
    } else {
      var pairs=[[[4,8],[1,2]],[[2,8],[1,4]],[[6,8],[3,4]],[[2,6],[1,3]],[[4,6],[2,3]]], pr=pick(pairs), shown=pr[0], ans2=pr[1];
      var wrong=[[1,2],[1,4],[3,4],[1,3],[2,3],[1,8],[3,8]].filter(function(f){return !(f[0]===ans2[0]&&f[1]===ans2[1])&&f[0]*shown[1]!==f[1]*shown[0];});
      area.innerHTML=roundNote(1,3)+'<div class="pic cakepic">'+cakeTop(shown[1],shown[0],false,shown[0]+' out of '+shown[1]+' pieces have icing')+'</div><p class="say-small">'+shown[0]+' out of '+shown[1]+' pieces have icing. Which fraction is the same?</p><div class="opts" id="fr-opts"></div>';
      fracOpts($('#fr-opts'),[ans2].concat(shuffle(wrong).slice(0,2)),ans2,next);
    }
  });
}
/* 2. pay with coins */
var COIN={1:{t:'1p',r:19,g:'copperG'},2:{t:'2p',r:24,g:'copperG'},5:{t:'5p',r:16,g:'silverG'},10:{t:'10p',r:23,g:'silverG'},20:{t:'20p',r:20,g:'silverG',sides:7},50:{t:'50p',r:26,g:'silverG',sides:7},100:{t:'£1',r:22,g:'ggold',sides:12},200:{t:'£2',r:26,g:'ggold'}};
function coinSVG(v){
  var c=COIN[v], sh;
  if(c.sides){var p=regPts(30,30,c.r,c.sides);sh='<path d="'+ptsPath(p)+'" fill="url(#'+c.g+')" stroke="#5E6878" stroke-width="2" stroke-linejoin="round"/>';}
  else sh='<circle cx="30" cy="30" r="'+c.r+'" fill="url(#'+c.g+')" stroke="'+(c.g==='copperG'?'#8A4A22':c.g==='ggold'?'#9A6A16':'#5E6878')+'" stroke-width="2"/>';
  if(v===200)sh+='<circle cx="30" cy="30" r="17" fill="url(#silverG)" stroke="#5E6878" stroke-width="1.5"/>';
  return '<svg viewBox="0 0 60 60" aria-hidden="true">'+sh+'<text x="30" y="'+(c.r<18?35:36)+'" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="'+(c.r<18?12:15)+'" font-weight="600" fill="#3B2A4A">'+c.t+'</text></svg>';
}
function money(p){return p>=100?'£'+Math.floor(p/100)+'.'+('0'+(p%100)).slice(-2):p+'p';}
function moneyOpts(box,ans,cands,done){
  var set=[ans]; cands.forEach(function(x){if(x>0&&set.indexOf(x)<0&&set.length<4)set.push(x);});
  var g=0; while(set.length<4&&g<40){var x=ans+pick([-1,1])*pick([1,5,10,20]);if(x>0&&set.indexOf(x)<0)set.push(x);g++;}
  shuffle(set).forEach(function(v){var b=optBtn(money(v),null,'num');b.addEventListener('click',function(){done(v===ans);});box.appendChild(b);});
}
var BAKE=[['bun','a bun'],['cupcake','a cupcake'],['biscuit','a biscuit'],['loaf','a loaf of bread'],['cakeslice','a slice of cake'],['honey','a jar of honey'],['jam','a jar of jam'],['milk','a bottle of milk'],['lemon','a lemon'],['cherry','a bag of cherries']];
function payBox(box,price,coins,done){
  var paid=[];
  box.insertAdjacentHTML('beforeend','<div class="purse" id="py-purse"><span class="tray-empty">Tap coins to pay</span></div><div class="coinrow" id="py-coins"></div><button class="btn" id="py-done">Pay</button>');
  function draw(){
    var p=$('#py-purse'); p.innerHTML='';
    if(!paid.length)p.innerHTML='<span class="tray-empty">Tap coins to pay</span>';
    paid.forEach(function(v,i){var b=document.createElement('button');b.type='button';b.className='coin';b.innerHTML=coinSVG(v);b.setAttribute('aria-label',COIN[v].t+' coin, tap to take it back');b.addEventListener('click',function(){paid.splice(i,1);tick();draw();});p.appendChild(b);});
  }
  coins.forEach(function(v){var b=document.createElement('button');b.type='button';b.className='coin big';b.innerHTML=coinSVG(v);b.setAttribute('aria-label','Add a '+COIN[v].t+' coin');b.addEventListener('click',function(){if(paid.length<20){paid.push(v);tick();draw();}});$('#py-coins').appendChild(b);});
  $('#py-done').addEventListener('click',function(){done(paid.reduce(function(a,b){return a+b;},0)===price);});
  draw();
}
function pzCoins(area,L){
  if(L===1){multi(area,L,3,function(R){pzCoins1(area,R);});return;}
  pzCoins23(area,L);
}
function pzCoins1(area,R){
  {
    var it=R.fresh(BAKE), price=rnd(3,10);
    setSay('Pay for '+it[1]+'. It costs '+price+'p. Tap the coins to pay exactly '+price+'p, then tap Pay.');
    area.innerHTML='<div class="shopitem"><div class="pic">'+picSVG2(it[0])+'</div><span class="pricetag">'+price+'p</span></div>';
    payBox(area,price,[1,2],function(ok){finish(ok);});
  }
}
function pzCoins23(area,L){
  setSay(L===2?'Crumble’s bakery is open. Pay for the cakes and work out the change.':'Crumble’s bakery is open. Add up the prices and work out the change.');
  rounds(3,function(k,next){
    if(L===2&&k===2){
      var tw=shuffle(BAKE).slice(0,2), x=rnd(12,45), y=rnd(12,45), tt=x+y, qq='How much do '+tw[0][1]+' and '+tw[1][1]+' cost altogether?';
      area.innerHTML=roundNote(2,3)+'<div class="shopitem"><div class="pic">'+picSVG2(tw[0][0])+'</div><span class="pricetag">'+x+'p</span><div class="pic">'+picSVG2(tw[1][0])+'</div><span class="pricetag">'+y+'p</span></div><p class="say-small">'+esc(qq)+'</p><div class="opts" id="py-opts"></div>';
      speak(qq); moneyOpts($('#py-opts'),tt,[tt+10,tt-10,tt+1,tt-1],next);
    } else if(L===3&&k===2){
      var it4=pick(BAKE), a4=rnd(6,40)*5, nn=pick([3,4]), t4=a4*nn, q4='One costs '+money(a4)+'. How much do '+nn+' cost?';
      area.innerHTML=roundNote(2,3)+'<div class="shopitem">'+Array(nn+1).join('<div class="pic small">'+picSVG2(it4[0])+'</div>')+'<span class="pricetag">'+money(a4)+' each</span></div><p class="say-small">'+esc(q4)+'</p><div class="opts" id="py-opts"></div>';
      speak(q4); moneyOpts($('#py-opts'),t4,[t4+a4,t4-a4,t4+10,t4-5],next);
    } else if(L===2&&k===0){
      var it=pick(BAKE), price=rnd(21,99);
      area.innerHTML=roundNote(0,3)+'<p class="say-small">Pay exactly '+price+'p for '+it[1]+'.</p><div class="shopitem"><div class="pic">'+picSVG2(it[0])+'</div><span class="pricetag">'+price+'p</span></div>';
      payBox(area,price,[1,2,5,10,20,50],next);
    } else if(L===2){
      var it2=pick(BAKE), p2=rnd(5,45), ch=50-p2, q='You buy '+it2[1]+' for '+p2+'p and pay with a 50p coin. How much change do you get?';
      area.innerHTML=roundNote(1,3)+'<div class="shopitem"><div class="pic">'+picSVG2(it2[0])+'</div><span class="pricetag">'+p2+'p</span><span class="coinpay">'+coinSVG(50)+'</span></div><p class="say-small">'+esc(q)+'</p><div class="opts" id="py-opts"></div>';
      speak(q); moneyOpts($('#py-opts'),ch,[ch+10,ch-10,p2,ch+5],next);
    } else if(k===0){
      var two=shuffle(BAKE).slice(0,2), a=rnd(10,29)*5, b=rnd(10,29)*5, tot=a+b, q2='How much do '+two[0][1]+' and '+two[1][1]+' cost altogether?';
      area.innerHTML=roundNote(0,3)+'<div class="shopitem"><div class="pic">'+picSVG2(two[0][0])+'</div><span class="pricetag">'+money(a)+'</span><div class="pic">'+picSVG2(two[1][0])+'</div><span class="pricetag">'+money(b)+'</span></div><p class="say-small">'+esc(q2)+'</p><div class="opts" id="py-opts"></div>';
      speak(q2); moneyOpts($('#py-opts'),tot,[tot+100,tot-10,tot+10,tot-100],next);
    } else {
      var it3=pick(BAKE), p3=rnd(30,98)*5, ch3=500-p3, q3='You buy '+it3[1]+' for '+money(p3)+' and pay with a £5 note. How much change do you get?';
      area.innerHTML=roundNote(1,3)+'<div class="shopitem"><div class="pic">'+picSVG2(it3[0])+'</div><span class="pricetag">'+money(p3)+'</span><span class="note5">£5</span></div><p class="say-small">'+esc(q3)+'</p><div class="opts" id="py-opts"></div>';
      speak(q3); moneyOpts($('#py-opts'),ch3,[ch3+100,ch3-10,ch3+10,ch3-100],next);
    }
  });
}
/* biscuit art (used by the kitchen picture and icons) */
var ICECOL={pink:'#F28CB3',blue:'#7DBDE6',yellow:'#F8CF5A',green:'#7FD3B5',purple:'#B3A4F0'};
function biscuitSVG(b,label){
  var p=shapePoints(b.s), d='M'+p.map(function(q){return f2(25+q[0]*.5)+' '+f2(25+q[1]*.5);}).join(' L')+' Z';
  return '<svg viewBox="0 0 100 100" '+(label?'role="img" aria-label="'+esc(label)+'"':'aria-hidden="true"')+'><circle cx="50" cy="52" r="44" fill="#9A6234" opacity=".25"/><circle cx="50" cy="50" r="44" fill="url(#biscG)" stroke="#9A6234" stroke-width="3"/><g fill="#B8823A"><circle cx="20" cy="40" r="2.5"/><circle cx="80" cy="60" r="2.5"/><circle cx="32" cy="80" r="2.5"/><circle cx="72" cy="24" r="2.5"/></g>'+(b.s?'<path d="'+d+'" fill="'+ICECOL[b.c]+'" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>':'')+'</svg>';
}
function bLabel(b){return b.c+' '+b.s+' biscuit';}
/* 3. ice the cake: put the right number of cherries or chocolate chips on top */
var TOPPING={
  cherry:{one:'cherry',many:'cherries',art:function(x,y){return '<g transform="translate('+f2(x)+' '+f2(y)+')"><path d="M0 -6 C2 -14 6 -18 10 -20" stroke="#3F8A3A" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle r="8" fill="#E8574C" stroke="#9C241C" stroke-width="2"/><circle cx="-3" cy="-3" r="2.4" fill="#fff" opacity=".7"/></g>';}},
  chip:{one:'chocolate chip',many:'chocolate chips',art:function(x,y){return '<g transform="translate('+f2(x)+' '+f2(y)+')"><path d="M0 -9 C4 -4 9 2 8 5 C7 9 -7 9 -8 5 C-9 2 -4 -4 0 -9 Z" fill="#6A3F26" stroke="#3E2414" stroke-width="1.5"/><path d="M-3 0 C-2 -3 0 -5 1 -6" stroke="#9A6A4A" stroke-width="1.5" fill="none" stroke-linecap="round"/></g>';}}
};
/* spots spread evenly over the top of the cake, centre 160,120 */
var TOPSPOT=(function(){
  /* a staggered grid of spots inside the icing, used from the middle outwards so toppings never overlap */
  var out=[],row=0;
  for(var y=84;y<=152;y+=17,row++){var hw=104*Math.sqrt(Math.max(0,1-Math.pow((y-118)/40,2)));for(var x=160-Math.floor(hw/28)*28+(row%2?14:0);x<=160+hw;x+=28){if(Math.abs(x-160)<=hw-6)out.push([x,y+8]);}}
  out.sort(function(a,b){return Math.hypot((a[0]-160)/2.6,a[1]-126)-Math.hypot((b[0]-160)/2.6,b[1]-126);});
  return out;
})();
function iceCakeSVG(list,label){
  var s='<svg class="icecake" viewBox="20 56 280 190" role="img" aria-label="'+esc(label)+'">';
  s+='<ellipse cx="160" cy="226" rx="148" ry="20" fill="#D9CDE8"/><ellipse cx="160" cy="220" rx="140" ry="16" fill="#fff" stroke="#D9CDE8" stroke-width="3"/>';
  s+='<path d="M40 118 V196 C40 222 280 222 280 196 V118 Z" fill="url(#cakeG)" stroke="#B8823A" stroke-width="3"/>';
  s+='<path d="M40 150 C80 164 240 164 280 150" stroke="#F3DCB8" stroke-width="8" fill="none"/>';
  s+='<ellipse cx="160" cy="118" rx="120" ry="50" fill="url(#iceG)" stroke="#D86A98" stroke-width="3"/>';
  s+='<path d="M42 124 C46 140 54 136 58 128 C64 144 76 140 78 132 C86 148 98 144 100 136" stroke="#F7B6CF" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M220 136 C224 144 236 148 242 132 C246 140 258 144 262 128 C266 136 274 140 278 124" stroke="#F7B6CF" stroke-width="7" fill="none" stroke-linecap="round"/>';
  list.forEach(function(t,i){var p=TOPSPOT[i];s+=TOPPING[t].art(p[0],p[1]);});
  return s+'</svg>';
}
var NUMWORD=['zero','one','two','three','four','five','six','seven','eight','nine','ten'];
function pzIceCake(area,L){
  var kinds=shuffle(['cherry','chip']); kinds.push(pick(kinds));
  multi(area,L,3,function(R){
    var k=kinds[R.k], T=TOPPING[k], given=[], want, q, say;
    if(L===1){
      want=R.fresh([3,4,5,6,7,8]);
      q='Put '+want+' '+T.many+' on the cake.';
      say=q+' Tap Add '+(k==='cherry'?'a cherry':'a chip')+'. Then tap Done.';
    } else if(L===2){
      var other=k==='cherry'?'chip':'cherry', total=pick([10,10,12,20]), have=rnd(3,total-3);
      for(var i=0;i<have;i++)given.push(other);
      want=total-have;
      q='The cake needs '+total+' toppings altogether. It has '+have+' '+TOPPING[other].many+'. Add '+T.many+' to make '+total+'.';
      say=q+' Then tap Done.';
    } else {
      var t=pick(['double','half','slices']);
      if(t==='double'){var d=rnd(4,9);want=d*2;q='Put double '+d+' '+T.many+' on the cake.';}
      else if(t==='half'){var h=pick([8,10,12,14,16,18,20]);want=h/2;q='Crumble had '+h+' '+T.many+'. Put half of them on the cake.';}
      else {var sl=pick([3,4,5]), each=pick([2,3,4]);want=sl*each;q='The cake will be cut into '+sl+' slices. Put '+each+' '+T.many+' on every slice. How many is that? Put them all on.';}
      say=q+' Then tap Done.';
    }
    var placed=0, max=Math.min(TOPSPOT.length-given.length,want+8);
    setSay(say);
    area.innerHTML='<p class="say-small">'+esc(q)+'</p><div class="panel cake-wrap" id="ic-cake"></div>'+(L>1?'<p class="count-note" id="ic-note"></p>':'')+'<div class="row-btns"><button class="btn soft" id="ic-off">Take one off</button><button class="btn leaf" id="ic-on">'+(k==='cherry'?'Add a cherry':'Add a chip')+'</button></div><button class="btn" id="ic-done">Done</button>';
    function draw(){
      var list=given.slice(); for(var i=0;i<placed;i++)list.push(k);
      $('#ic-cake').innerHTML=iceCakeSVG(list,'A cake with '+(given.length?given.length+' '+TOPPING[given[0]].many+' and ':'')+placed+' '+(placed===1?T.one:T.many)+' on top');
      if(L>1)$('#ic-note').textContent=placed+' '+(placed===1?T.one:T.many)+' added';
      $('#ic-off').disabled=placed===0; $('#ic-on').disabled=placed>=max;
    }
    $('#ic-on').addEventListener('click',function(){if(placed<max){placed++;if(mem.sound)tone(500+placed*30,0,.12,'sine',.07);draw();}});
    $('#ic-off').addEventListener('click',function(){if(placed>0){placed--;tick();draw();}});
    $('#ic-done').addEventListener('click',function(){finish(placed===want);});
    draw();
  });
}
/* 4. recipe words */
var RECIPE_STEPS=[
  ['Crack two eggs into a bowl and mix them with a fork.','How many eggs do you need?',['two','one','three']],
  ['Melt the butter in a pan, then stir in the sugar.','What do you melt?',['the butter','the sugar','the eggs']],
  ['Spread jam on the bread, then cut it into squares.','What shape do you cut?',['squares','circles','triangles']],
  ['Pour the milk into a jug and add a spoon of honey.','What goes into the jug?',['milk and honey','jam and butter','flour and eggs']],
  ['Bake the buns in the oven for ten minutes.','How long do the buns bake for?',['ten minutes','one hour','two minutes']],
  ['Put a cherry on top of each cupcake.','What goes on top of each cupcake?',['a cherry','a lemon','a biscuit']],
  ['Sift the flour into the bowl, then add a pinch of salt.','What do you add after the flour?',['a pinch of salt','a cup of milk','some honey']],
  ['Squeeze the lemon and pour the juice over the cake.','What do you squeeze?',['the lemon','the cake','the orange']],
  ['Roll the dough flat and cut out six star shapes.','How many stars do you cut out?',['six','five','seven']],
  ['Leave the biscuits to cool for five minutes before you eat them.','What must you do before eating the biscuits?',['let them cool','put jam on them','bake them again']],
  ['Whisk the cream until it is thick, then spoon it onto the scones.','Where does the cream go?',['on the scones','in the oven','in the teapot']],
  ['Grease the tin with butter so the cake does not stick.','Why do you grease the tin?',['so the cake does not stick','to make it taste sweet','so it bakes faster']],
  ['Stir in three spoons of cocoa to make the cake chocolate.','How many spoons of cocoa?',['three','two','four']],
  ['Ask a grown-up to take the hot tray out of the oven.','Who takes the tray out?',['a grown-up','the baker’s cat','you, on your own']]
];
function pzRecipe(area,L){
  if(L===2){pzRecipe2(area);return;}
  multi(area,L,3,function(R){pzRecipe1(area,L,R);});
}
function pzRecipe1(area,L,R){
  if(L===3){
    var w=R.fresh(['flour','sugar','butter','cherry','lemon','honey','biscuit','cupcake','milk','loaf']), all=[];for(var i=0;i<w.length;i++)all.push(i);
    setSay('Spell the ingredient in this picture. Tap the letters in order.');
    area.innerHTML='<div class="pic">'+picSVG2(w)+'</div>';
    speller(area,w,all,extraLetters(w,2),function(ok){finish(ok);});
    return;
  }
  if(L===1){
    var all4=['egg','jam','milk','bun','loaf','honey','lemon','cake'], target=R.fresh(all4), pool=[target].concat(shuffle(all4.filter(function(x){return x!==target;})).slice(0,2));
    setSay('Which picture goes with this word? Tap the word to hear it.');
    area.innerHTML='<button class="bigword wordbtn" id="rc-word" aria-label="The word '+target+'. Tap to hear it.">'+target+'</button><div class="opts" id="rc-opts"></div>';
    $('#rc-word').addEventListener('click',function(){speak(target,true);});
    picOpts($('#rc-opts'),pool,target,function(ok){finish(ok);},function(k){return 'Picture: '+k;});
  }
}
function pzRecipe2(area){
  var steps=shuffle(RECIPE_STEPS).slice(0,3);
  setSay('Read Crumble’s recipe card. Then answer the question.');
  rounds(3,function(k,next){
    var st=steps[k];
    area.innerHTML=roundNote(k,3)+'<div class="recipe"><span class="rlab">Recipe step</span><p>'+esc(st[0])+'</p></div><p class="say-small">'+esc(st[1])+'</p><div class="opts col" id="rc-opts"></div>';
    shuffle(st[2]).forEach(function(a){var b=optBtn(esc(a),null,'txt');b.addEventListener('click',function(){next(a===st[2][0]);});$('#rc-opts').appendChild(b);});
  });
}
/* 5. cake jigsaw */
function pzCakeJig(area,L){ jigsawSet(area,L,'crumble',[{key:'cake',fn:cakePicture,what:'the cake'}]); }
/* her puzzle pictures (100 x 100), added to the shared picture list; any fairy can use them by name */
Object.assign(PICS2,{
  egg:'<path d="M50 10 C70 10 82 40 82 60 C82 80 68 92 50 92 C32 92 18 80 18 60 C18 40 30 10 50 10 Z" fill="#FFF8EE" stroke="#C9A77A" stroke-width="3"/><ellipse cx="38" cy="40" rx="6" ry="12" fill="#fff"/>',
  jam:'<rect x="26" y="34" width="48" height="56" rx="10" fill="#E8574C" stroke="#9C241C" stroke-width="3"/><rect x="22" y="20" width="56" height="16" rx="4" fill="#fff" stroke="#C88A9E" stroke-width="3"/><path d="M22 28 h56" stroke="#F28CB3" stroke-width="5" stroke-dasharray="6 5"/><rect x="34" y="52" width="32" height="22" rx="4" fill="#FFF8EE"/><circle cx="50" cy="63" r="6" fill="#E8574C"/>',
  milk:'<path d="M32 30 L40 12 H60 L68 30 V88 H32 Z" fill="#fff" stroke="#7DBDE6" stroke-width="3" stroke-linejoin="round"/><path d="M32 48 H68 V72 H32 Z" fill="#7DBDE6"/><path d="M40 12 H60" stroke="#3E7FB0" stroke-width="5"/><ellipse cx="50" cy="60" rx="9" ry="6" fill="#fff"/>',
  butter:'<path d="M14 54 L40 40 L88 50 L62 66 Z" fill="#FFF0A8" stroke="#C9A64A" stroke-width="3" stroke-linejoin="round"/><path d="M14 54 V70 L62 84 V66 Z" fill="#FBE38A" stroke="#C9A64A" stroke-width="3" stroke-linejoin="round"/><path d="M62 66 L88 50 V66 L62 84 Z" fill="#E9C85A" stroke="#C9A64A" stroke-width="3" stroke-linejoin="round"/><path d="M30 44 C40 32 50 34 54 40" stroke="#8C96A6" stroke-width="4" fill="none"/>',
  cherry:'<path d="M50 14 C46 30 38 44 34 58 M50 14 C56 30 62 44 68 58" stroke="#3F8A3A" stroke-width="4" fill="none"/><path d="M50 14 C60 6 76 8 80 14 C70 22 58 20 50 14 Z" fill="#6DBE5A"/><circle cx="32" cy="70" r="18" fill="#E8574C" stroke="#9C241C" stroke-width="3"/><circle cx="70" cy="70" r="18" fill="#E8574C" stroke="#9C241C" stroke-width="3"/><circle cx="26" cy="64" r="4" fill="#fff" opacity=".7"/><circle cx="64" cy="64" r="4" fill="#fff" opacity=".7"/>',
  lemon:'<path d="M12 52 C12 30 34 18 52 20 C74 22 90 36 90 52 C90 70 70 84 50 84 C30 84 12 72 12 52 Z" fill="#F8E15A" stroke="#C9A61E" stroke-width="3"/><path d="M8 52 L14 52 M90 50 L96 48" stroke="#C9A61E" stroke-width="4" stroke-linecap="round"/><ellipse cx="36" cy="40" rx="10" ry="5" fill="#fff" opacity=".6"/>',
  honey:'<path d="M24 36 H76 V82 C76 90 70 92 64 92 H36 C30 92 24 90 24 82 Z" fill="#F5B642" stroke="#B8761E" stroke-width="3"/><rect x="20" y="22" width="60" height="16" rx="5" fill="#C79A66" stroke="#8A5A30" stroke-width="3"/><path d="M30 38 C30 50 36 50 36 44 C36 54 44 54 44 46" stroke="#F5B642" stroke-width="8" fill="none" stroke-linecap="round"/><ellipse cx="50" cy="66" rx="12" ry="9" fill="#FFF0B8"/><path d="M44 66 h12 M46 62 h8 M46 70 h8" stroke="#3B2A4A" stroke-width="2"/>',
  flour:'<path d="M24 30 C22 24 28 18 34 22 C40 14 60 14 66 22 C72 18 78 24 76 30 L80 86 C80 92 20 92 20 86 Z" fill="#F4EEE4" stroke="#B8A27A" stroke-width="3"/><path d="M50 40 V78 M50 48 l-8 -6 M50 48 l8 -6 M50 58 l-8 -6 M50 58 l8 -6 M50 68 l-8 -6 M50 68 l8 -6" stroke="#D9A52E" stroke-width="3" stroke-linecap="round"/>',
  sugar:'<g stroke="#C9C3D6" stroke-width="2.5" stroke-linejoin="round"><path d="M18 56 L40 46 L62 56 L40 66 Z" fill="#fff"/><path d="M18 56 V78 L40 88 V66 Z" fill="#F4F2F8"/><path d="M40 66 L62 56 V78 L40 88 Z" fill="#E4E0EE"/><path d="M44 30 L64 22 L84 30 L64 38 Z" fill="#fff"/><path d="M44 30 V50 L64 58 V38 Z" fill="#F4F2F8"/><path d="M64 38 L84 30 V50 L64 58 Z" fill="#E4E0EE"/></g>',
  cupcake:'<path d="M28 52 L34 88 H66 L72 52 Z" fill="#F7A055" stroke="#B8661E" stroke-width="3"/><path d="M38 52 L40 88 M50 52 V88 M62 52 L60 88" stroke="#B8661E" stroke-width="2"/><path d="M24 52 C20 34 38 28 44 32 C46 20 60 20 62 30 C72 28 82 38 76 52 Z" fill="url(#iceG)" stroke="#C24C7E" stroke-width="3"/><circle cx="52" cy="20" r="7" fill="#E8574C"/>',
  biscuit:'<circle cx="50" cy="50" r="38" fill="url(#biscG)" stroke="#9A6234" stroke-width="3"/><g fill="#6E4626"><circle cx="36" cy="38" r="4"/><circle cx="62" cy="34" r="4"/><circle cx="54" cy="58" r="4"/><circle cx="32" cy="62" r="4"/><circle cx="68" cy="66" r="4"/></g>',
  loaf:'<path d="M14 66 V50 C14 30 30 24 50 24 C70 24 86 30 86 50 V66 C86 74 14 74 14 66 Z" fill="#E8B06A" stroke="#9A6234" stroke-width="3"/><path d="M32 36 L38 52 M50 32 L54 50 M66 36 L68 52" stroke="#9A6234" stroke-width="3" stroke-linecap="round"/>',
  cakeslice:'<path d="M14 70 L80 40 V72 L14 86 Z" fill="url(#cakeG)" stroke="#B8823A" stroke-width="3" stroke-linejoin="round"/><path d="M14 70 L80 40" stroke="#F28CB3" stroke-width="8" stroke-linecap="round"/><path d="M16 78 L80 54" stroke="#E8574C" stroke-width="4"/><circle cx="66" cy="36" r="6" fill="#E8574C"/>'
});
/* petal icons for her flower (72 x 72) */
Object.assign(PZICON,{
  share:'<g transform="translate(6 6) scale(.6)">'+'<circle cx="50" cy="50" r="44" fill="url(#cakeG)" stroke="#B8823A" stroke-width="4"/><path d="M50 50 L50 6 A44 44 0 0 1 94 50 Z" fill="url(#iceG)"/><path d="M50 6 V94 M6 50 H94" stroke="#8A5A30" stroke-width="4"/></g>',
  coins:'<g transform="translate(4 14) scale(.8)">'+coinSVG(10).replace(/<\/?svg[^>]*>/g,'')+'</g><g transform="translate(26 24) scale(.8)">'+coinSVG(2).replace(/<\/?svg[^>]*>/g,'')+'</g>',
  biscuits:'<g transform="translate(2 8) scale(.214)">'+iceCakeSVG(['cherry','cherry','cherry','chip','chip'],'').replace(/<\/?svg[^>]*>/g,'')+'</g>',
  recipe:'<rect x="10" y="8" width="52" height="58" rx="6" fill="#fff" stroke="#C88A9E" stroke-width="3"/><path d="M18 22 H54 M18 32 H50 M18 42 H54 M18 52 H40" stroke="#E9CCD6" stroke-width="3"/><circle cx="52" cy="54" r="7" fill="#E8574C"/>',
  cakejig:'<path d="M12 22 h14 a6 6 0 1 1 12 0 h14 v14 a6 6 0 1 0 0 12 v14 h-14 a6 6 0 1 1 -12 0 h-14 Z" fill="#F28CB3" stroke="#B8467A" stroke-width="3" stroke-linejoin="round"/><circle cx="32" cy="36" r="6" fill="#E8574C"/>'
});
/* ---------- Crumble ---------- */
FAIRIES.crumble={id:'crumble',name:'Crumble',kind:'Baker fairy',place:"Crumble's teapot kitchen",art:crumbleArt,body:teapotBody,houseLabel:"Crumble's teapot house",tapClass:'brewing',tapMs:2400,
  onTap:function(){if(!mem.sound)return;noiseHit(0,'highpass',3000,.9,.12);bellTone(1046.5,.7,.5,.12);bellTone(1318.5,.85,.6,.12);},
  facts:[
    'Bread rises because yeast makes tiny bubbles of gas in the dough.',
    'Butter is made by shaking or churning cream until it goes thick.',
    'Honey is made by bees from the sweet nectar in flowers.',
    'Flour is made by grinding grains of wheat into a fine powder.',
    'An oven gets much hotter than boiling water, which is why bakers wear thick gloves.'
  ],
  scene:kitchenScene,base:'#FCE3E3',foundBg:'#FDEFF2',
  foundGround:'<ellipse cx="170" cy="340" rx="150" ry="20" fill="#fff" stroke="#E9CCD6" stroke-width="4"/><ellipse cx="170" cy="338" rx="110" ry="12" fill="#FCE3EA"/>',
  thanks:'Thank you for helping me bake for the village.',jigThings:['cupcake','cherry','honey','loaf','biscuit','cakeslice'],
  /* a cupcake like the one in Bake and merge: blue striped case, pink swirl, a cherry */
  icon:'<path d="M26 54 L33 86 H67 L74 54 Z" fill="#6FBDE0" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="M37 55 L41 85 M50 55 V85 M63 55 L59 85" stroke="#E9F7FD" stroke-width="3"/><path d="M22 56 C16 44 26 36 33 38 C31 28 41 22 48 26 C52 18 64 20 66 28 C76 26 84 36 80 44 C88 48 86 58 78 58 Z" fill="#F7A3C4" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="M32 48 C42 44 58 44 70 48" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/><path d="M54 16 C56 10 60 7 65 6" stroke="#3F8A3A" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="52" cy="20" r="7.5" fill="#E8443A" stroke="#fff" stroke-width="2"/><circle cx="49.5" cy="17.5" r="2" fill="#fff" opacity=".8"/>',
  flowerBase:function(){
    return '<ellipse cx="340" cy="668" rx="200" ry="30" fill="#fff" stroke="#E9CCD6" stroke-width="4"/><ellipse cx="340" cy="664" rx="140" ry="18" fill="#FCE3EA"/>' +
      '<path d="M340 380 C330 460 352 540 340 610" stroke="#2F6B2C" stroke-width="18" fill="none" stroke-linecap="round"/>' +
      '<path d="M340 380 C330 460 352 540 340 610" stroke="#4E9F45" stroke-width="11" fill="none" stroke-linecap="round"/>' +
      '<path d="M342 556 C382 520 432 524 452 542 C420 578 372 580 342 556 Z" fill="url(#ptleaf)" stroke="#2F6B2C" stroke-width="2.5"/>' +
      '<path d="M266 600 H414 C410 640 380 660 340 660 C300 660 270 640 266 600 Z" fill="url(#teaG)" stroke="#C88A9E" stroke-width="3"/><path d="M412 612 C444 610 444 644 404 646" stroke="#C88A9E" stroke-width="8" fill="none"/><ellipse cx="340" cy="600" rx="74" ry="10" fill="#F6CBD8" stroke="#C88A9E" stroke-width="3"/>' +
      '<g fill="#F28CB3"><circle cx="300" cy="628" r="5"/><circle cx="340" cy="638" r="5"/><circle cx="380" cy="628" r="5"/></g>';
  },
  puz:[
    {id:'share',titles:['Share the cakes','Halves and quarters','Cake fractions'],run:pzShare},
    {id:'coins',titles:['Pay with coins','Coins and change','Pounds and pence'],run:pzCoins},
    {id:'biscuits',titles:['Ice the cake','Make the total','Topping sums'],run:pzIceCake},
    {id:'recipe',titles:['Recipe words','Read the recipe','Spell it'],run:pzRecipe},
    {id:'cakejig',titles:['Cake jigsaw','Cake jigsaw','Cake jigsaw'],run:pzCakeJig}
  ]};
FAIRY_ORDER.push('crumble');
