/* Rivet, the Engineer fairy: her art, cog-wheel cottage, cog mill, building site jigsaw picture, gears,
   pictures, facts, puzzles (gears, seesaw, bridge, tools, building site jigsaw) and her FAIRIES entry.
   The basic gear shape (gearD) and turning arrow (turnArrow) are in core.js because Gizmo uses them too. */
'use strict';
/* her gradients (added to the shared defs; any fairy can use them) */
addDefs(
'<radialGradient id="rvOver" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#FFC48E"/><stop offset=".55" stop-color="#E07A3A"/><stop offset="1" stop-color="#A84E1C"/></radialGradient>' +
'<radialGradient id="rvWing" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".6" stop-color="#FFD9A8" stop-opacity=".75"/><stop offset="1" stop-color="#D98A3A" stop-opacity=".9"/></radialGradient>' +
'<linearGradient id="rvLegs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7A9AB8"/><stop offset="1" stop-color="#3E5A78"/></linearGradient>' +
'<radialGradient id="rvBoot" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#C98A5A"/><stop offset="1" stop-color="#6A3F22"/></radialGradient>' +
'<radialGradient id="rvCream" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#FFFBF2"/><stop offset=".7" stop-color="#F7E6CC"/><stop offset="1" stop-color="#E4C9A2"/></radialGradient>' +
'<radialGradient id="steelG" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#F4F6F9"/><stop offset=".55" stop-color="#AEB7C4"/><stop offset="1" stop-color="#6E7888"/></radialGradient>' +
'<radialGradient id="cogBrass" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#FFEBA8"/><stop offset=".55" stop-color="#E0AE3E"/><stop offset="1" stop-color="#9A6A16"/></radialGradient>' +
'<radialGradient id="cogCopper" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#FFC9A0"/><stop offset=".55" stop-color="#D4825A"/><stop offset="1" stop-color="#8A4A22"/></radialGradient>' +
'<radialGradient id="cogWood" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#D9A16A"/><stop offset=".6" stop-color="#A86A3A"/><stop offset="1" stop-color="#6A3F22"/></radialGradient>' +
'<linearGradient id="ironG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8C96A6"/><stop offset=".6" stop-color="#5E6878"/><stop offset="1" stop-color="#3E4656"/></linearGradient>' +
'<linearGradient id="plankG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E2B47E"/><stop offset="1" stop-color="#B07A48"/></linearGradient>' +
'<linearGradient id="brickG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E07A5A"/><stop offset="1" stop-color="#A9432C"/></linearGradient>'
);
/* ---------- gears: every gear has the same size teeth, so any two can mesh. Pitch radius = 2.4 x teeth ---------- */
var GR=2.4;
function gr(z){return GR*z;}
/* the tooth phase gear B needs so that it meshes with gear A (A and B have x, y, z and A has ph) */
function meshPh(A,B,rA,rB){
  var th=Math.atan2(B.y-A.y,B.x-A.x)*180/Math.PI, pA=360/A.z, pB=360/B.z;
  var d=((th-A.ph)%pA+pA)%pA; if(d>pA/2)d-=pA;
  return th+180+d*rA/rB+pB/2;
}
function meshChain(list){ if(list[0].ph==null)list[0].ph=0; for(var i=1;i<list.length;i++)list[i].ph=meshPh(list[i-1],list[i],gr(list[i-1].z),gr(list[i].z)); }
/* a wooden paddle wheel, centred on cx,cy */
function wheelArt(cx,cy,R){
  var s='<g transform="translate('+cx+' '+cy+')">';
  for(var i=0;i<12;i++)s+='<rect x="-4" y="'+(-R-10)+'" width="8" height="15" rx="2" fill="url(#plankG)" stroke="#6A3F22" stroke-width="1.2" transform="rotate('+(i*30)+')"/>';
  s+='<circle r="'+R+'" fill="none" stroke="#6A3F22" stroke-width="8"/><circle r="'+R+'" fill="none" stroke="#B07A48" stroke-width="4"/>';
  for(i=0;i<6;i++)s+='<path d="M0 0 L0 '+(-R+2)+'" stroke="#8A5A30" stroke-width="4" transform="rotate('+(i*60)+')"/>';
  return s+'<circle r="7" fill="#6A3F22"/><circle r="3" fill="url(#ggold)"/></g>';
}
/* ---------- Rivet, the Engineer fairy ---------- */
function rivetArt(noShadow){
  var skin='url(#skinD)', flat='#AD6E4A', shirt='#FFF4DE';
  var curls=''; [[80,92,14],[160,92,14],[84,66,14],[156,66,14],[104,50,15],[136,50,15],[120,44,15]].forEach(function(c){curls+='<circle cx="'+c[0]+'" cy="'+c[1]+'" r="'+c[2]+'" fill="url(#hairDark)"/>';});
  return (noShadow?'':'<ellipse cx="120" cy="308" rx="44" ry="7" fill="#7A3E1A" opacity=".22" filter="url(#fshadow)"/>') +
  '<g class="wings">' +
  '<path d="M112 150 C84 100 40 104 42 136 C44 166 88 168 112 158 Z" fill="url(#rvWing)" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '<path d="M112 166 C82 172 60 200 72 220 C86 238 112 204 116 174 Z" fill="url(#rvWing)" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '<path d="M128 150 C156 100 200 104 198 136 C196 166 152 168 128 158 Z" fill="url(#rvWing)" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '<path d="M128 166 C158 172 180 200 168 220 C154 238 128 204 124 174 Z" fill="url(#rvWing)" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '<path d="M112 152 C92 132 70 122 52 124 M128 152 C148 132 170 122 188 124" stroke="#fff" stroke-width="1" fill="none" opacity=".6"/>' +
  '</g>' +
  /* big curly hair behind the head */
  '<circle cx="120" cy="98" r="46" fill="url(#hairDark)"/>' + curls +
  '<rect x="106" y="226" width="11" height="34" rx="5.5" fill="url(#rvLegs)"/><rect x="123" y="226" width="11" height="34" rx="5.5" fill="url(#rvLegs)"/>' +
  /* chunky work boots */
  '<path d="M99 256 H119 V270 C119 278 112 281 103 281 C95 281 93 272 99 256 Z" fill="url(#rvBoot)"/>' +
  '<path d="M121 256 H141 C147 272 145 281 137 281 C128 281 121 278 121 270 Z" fill="url(#rvBoot)"/>' +
  '<path d="M97 276 H119 M121 276 H143" stroke="#4E2E16" stroke-width="3"/>' +
  /* shirt, then orange dungarees with a bib, straps and a tool belt */
  '<path d="M104 152 C100 152 98 160 98 168 C92 188 84 214 82 234 C98 242 142 242 158 234 C156 214 148 188 142 168 C142 160 140 152 136 152 Z" fill="'+shirt+'"/>' +
  '<path d="M100 186 C94 204 86 220 84 234 C98 242 142 242 156 234 C154 220 146 204 140 186 Z" fill="url(#rvOver)"/>' +
  '<path d="M106 164 H134 L138 190 H102 Z" fill="url(#rvOver)"/>' +
  '<path d="M106 166 L104 152 M134 166 L136 152" stroke="#C25E22" stroke-width="5" stroke-linecap="round"/>' +
  '<circle cx="107" cy="168" r="3" fill="url(#ggold)"/><circle cx="133" cy="168" r="3" fill="url(#ggold)"/>' +
  '<rect x="112" y="172" width="16" height="12" rx="3" fill="#F7A055" stroke="#C25E22" stroke-width="1.5"/>' +
  '<path d="M120 174.5 L121.2 176.4 L123.4 175.9 L122.9 178.1 L124.8 179.3 L122.9 180.5 L123.4 182.7 L121.2 182.2 L120 184 L118.8 182.2 L116.6 182.7 L117.1 180.5 L115.2 179.3 L117.1 178.1 L116.6 175.9 L118.8 176.4 Z" transform="translate(0 -1.5) scale(1) " fill="#FFF4DE" opacity=".9"/>' +
  '<path d="M98 194 Q120 200 142 194 L143 202 Q120 208 97 202 Z" fill="#7A4E2A"/>' +
  '<rect x="134" y="196" width="14" height="16" rx="3" fill="#8A5A30" stroke="#5E3A1E" stroke-width="1.5"/><rect x="138" y="186" width="5" height="14" fill="#F8CF5A" stroke="#B8861E" stroke-width="1"/>' +
  '<rect x="112" y="196" width="8" height="7" rx="1.5" fill="url(#ggold)"/>' +
  /* hanging arm: short sleeve then forearm */
  '<path d="M104 160 C100 166 98 172 97 177" stroke="'+shirt+'" stroke-width="12" fill="none" stroke-linecap="round"/>' +
  '<path d="M97 178 C93 186 90 192 88 198" stroke="'+flat+'" stroke-width="10" fill="none" stroke-linecap="round"/>' +
  '<circle cx="88" cy="200" r="6" fill="'+skin+'"/>' +
  /* raised arm with a spanner */
  '<g class="arm"><path d="M136 162 C142 160 146 156 149 152" stroke="'+shirt+'" stroke-width="12" fill="none" stroke-linecap="round"/>' +
  '<path d="M150 151 C155 147 159 142 162 138" stroke="'+flat+'" stroke-width="10" fill="none" stroke-linecap="round"/>' +
  '<path d="M164 136 L180 108" stroke="url(#steelG)" stroke-width="6" stroke-linecap="round"/><path d="M164 136 L180 108" stroke="#6E7888" stroke-width="1.5" stroke-linecap="round" opacity=".6"/>' +
  '<g transform="translate(183 102) rotate(30)"><path d="M-9 5 C-12 -5 -7 -14 0 -14 C7 -14 12 -5 9 5 L4 5 L4 -7 L-4 -7 L-4 5 Z" fill="url(#steelG)" stroke="#4E5868" stroke-width="1.5" stroke-linejoin="round"/></g>' +
  '<circle cx="163" cy="136" r="6" fill="'+skin+'"/></g>' +
  '<rect x="114" y="138" width="12" height="16" rx="4" fill="#985C3C"/>' +
  '<circle cx="120" cy="108" r="40" fill="'+skin+'"/>' +
  /* curly fringe, red spotted headscarf and goggles */
  '<path d="M82 104 C78 76 98 62 120 62 C142 62 162 76 158 104 C154 92 146 86 138 90 C132 82 120 80 114 88 C104 82 90 88 82 104 Z" fill="url(#hairDark)"/>' +
  '<path d="M80 86 C94 62 146 62 160 86 L158 96 C144 78 96 78 82 96 Z" fill="#E8574C" stroke="#A3261E" stroke-width="1.5"/>' +
  '<g fill="#fff"><circle cx="96" cy="78" r="2.2"/><circle cx="112" cy="72" r="2.2"/><circle cx="130" cy="72" r="2.2"/><circle cx="146" cy="78" r="2.2"/></g>' +
  '<path d="M158 88 C168 80 176 84 172 92 C178 96 172 104 164 98 Z" fill="#E8574C" stroke="#A3261E" stroke-width="1.5"/>' +
  '<path d="M84 86 C100 80 140 80 156 86" stroke="#5E3A1E" stroke-width="4" fill="none"/>' +
  '<circle cx="106" cy="84" r="9.5" fill="url(#cogBrass)" stroke="#8A5E14" stroke-width="1.5"/><circle cx="106" cy="84" r="6" fill="#9FD3EE"/><circle cx="104" cy="82" r="2" fill="#fff" opacity=".8"/>' +
  '<circle cx="134" cy="84" r="9.5" fill="url(#cogBrass)" stroke="#8A5E14" stroke-width="1.5"/><circle cx="134" cy="84" r="6" fill="#9FD3EE"/><circle cx="132" cy="82" r="2" fill="#fff" opacity=".8"/>' +
  '<path d="M115.5 84 H124.5" stroke="#8A5E14" stroke-width="3"/>' +
  '<path d="M99 102 Q105 98 111 101 M129 101 Q135 98 141 102" stroke="#1E120C" stroke-width="2" fill="none" stroke-linecap="round"/>' +
  '<ellipse cx="106" cy="115" rx="5.5" ry="7" fill="#1E120C"/><ellipse cx="134" cy="115" rx="5.5" ry="7" fill="#1E120C"/>' +
  '<circle cx="108" cy="112" r="2" fill="#fff"/><circle cx="136" cy="112" r="2" fill="#fff"/>' +
  '<ellipse cx="95" cy="127" rx="7" ry="4.5" fill="#E8708F" opacity=".35"/><ellipse cx="145" cy="127" rx="7" ry="4.5" fill="#E8708F" opacity=".35"/>' +
  '<ellipse cx="146" cy="120" rx="5" ry="2.5" fill="#3B2410" opacity=".25" transform="rotate(-20 146 120)"/>' +
  '<path d="M112 127 Q120 136 128 127" stroke="#3A120C" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
}
/* ---------- house: a cog-wheel cottage with a waterwheel ---------- */
function cogBody(){
  var s='';
  /* a little pond under the waterwheel at the side */
  s+='<ellipse cx="38" cy="174" rx="44" ry="11" fill="#7DBDE6" stroke="#5FA0CC" stroke-width="1.5"/><path d="M10 174 q8 -4 16 0 t16 0 M46 177 q8 -4 16 0" stroke="#fff" stroke-width="2" opacity=".6" fill="none"/>';
  s+='<g class="rvwheelfast"><g class="rvwheel">'+wheelArt(40,128,34)+'</g></g>';
  /* two little cogs on the roof that whirr when the house is tapped */
  var A={x:98,y:50,z:8,ph:8}, B={x:98-22.75*Math.cos(Math.PI/6),y:50-22.75*Math.sin(Math.PI/6),z:6};
  B.ph=meshPh(A,B,13,9.75);
  s+='<g class="rvcogB"><path transform="translate('+f2(B.x)+' '+f2(B.y)+')" d="'+gearD(6,9.75,B.ph,4,3)+'" fill="url(#cogBrass)" stroke="#8A5E14" stroke-width="1.5" stroke-linejoin="round"/><circle cx="'+f2(B.x)+'" cy="'+f2(B.y)+'" r="3" fill="#8A5E14"/></g>';
  s+='<g class="rvcogA"><path transform="translate(98 50)" d="'+gearD(8,13,A.ph,4,3)+'" fill="url(#steelG)" stroke="#4E5868" stroke-width="1.5" stroke-linejoin="round"/><circle cx="98" cy="50" r="4" fill="#4E5868"/></g>';
  /* chimney pipe with steam */
  s+='<g class="rvsteam"><circle cx="160" cy="18" r="7" fill="#fff"/><circle cx="152" cy="6" r="8" fill="#fff"/><circle cx="162" cy="-6" r="6" fill="#fff"/></g>';
  s+='<rect x="153" y="30" width="14" height="46" fill="url(#cogBrass)" stroke="#8A5E14" stroke-width="1.5"/><rect x="149" y="24" width="22" height="9" rx="3" fill="url(#cogBrass)" stroke="#8A5E14" stroke-width="1.5"/>';
  /* the big cog that is the house */
  s+='<path transform="translate(128 118)" d="'+gearD(12,52,15,10,2)+'" fill="url(#cogCopper)" stroke="#7A3E1A" stroke-width="2.5" stroke-linejoin="round"/>';
  s+='<circle cx="128" cy="118" r="44" fill="url(#rvCream)" stroke="#B8662E" stroke-width="2"/>';
  for(var i=0;i<10;i++){var a=(i*36+18)*Math.PI/180;s+='<circle cx="'+f2(128+47*Math.cos(a))+'" cy="'+f2(118+47*Math.sin(a))+'" r="2.2" fill="#FFD9B8" stroke="#7A3E1A" stroke-width="1"/>';}
  s+='<ellipse cx="102" cy="84" rx="18" ry="8" transform="rotate(-35 102 84)" fill="#fff" opacity=".28" filter="url(#fsoft)"/>';
  /* porthole windows */
  [[106,106],[150,106]].forEach(function(w){s+='<circle cx="'+w[0]+'" cy="'+w[1]+'" r="11" fill="url(#cogBrass)" stroke="#8A5E14" stroke-width="1.5"/><circle cx="'+w[0]+'" cy="'+w[1]+'" r="7.5" fill="url(#gglass)"/><path d="M'+(w[0]-4)+' '+(w[1]-3)+' A5 5 0 0 1 '+w[0]+' '+(w[1]-5)+'" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>';});
  /* door */
  s+='<path d="M113 180 V156 A15 15 0 0 1 143 156 V180 Z" fill="#7A3E1A"/><path d="M116 180 V157 A12 12 0 0 1 140 157 V180 Z" fill="url(#gwood)"/><circle cx="135" cy="169" r="2" fill="url(#ggold)"/>';
  s+='<path d="M120 150 h16" stroke="#7A3E1A" stroke-width="1.5" opacity=".6"/>';
  return s;
}
function houseWhirr(){
  if(!mem.sound)return;
  for(var i=0;i<5;i++)noiseHit(i*.42,'bandpass',420+i*30,.45,.06);
  for(var j=0;j<14;j++)tone(j%2?1320:990,.05+j*.15,.04,'square',.025);
  bellTone(1046.5,2.2,.6,.1);
}
/* ---------- Rivet's world: the cog mill by the stream ---------- */
function millScene(){
  var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMax slice"><defs>' +
  '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE0F5"/><stop offset="1" stop-color="#FFF1DC"/></linearGradient>' +
  '<linearGradient id="wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D19A64"/><stop offset="1" stop-color="#9A6234"/></linearGradient>' +
  '<linearGradient id="roof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9603E"/><stop offset="1" stop-color="#8A3424"/></linearGradient>' +
  '<linearGradient id="stone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D3CDC0"/><stop offset="1" stop-color="#A39C8E"/></linearGradient>' +
  '<linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9AD3F2"/><stop offset="1" stop-color="#5AA6D6"/></linearGradient>' +
  '<radialGradient id="brass" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#FFEBA8"/><stop offset=".55" stop-color="#E0AE3E"/><stop offset="1" stop-color="#9A6A16"/></radialGradient>' +
  '<radialGradient id="copper" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#FFC9A0"/><stop offset=".55" stop-color="#D4825A"/><stop offset="1" stop-color="#8A4A22"/></radialGradient>' +
  '<radialGradient id="steel" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#F4F6F9"/><stop offset=".55" stop-color="#AEB7C4"/><stop offset="1" stop-color="#6E7888"/></radialGradient>' +
  '</defs>';
  s+='<rect width="1200" height="900" fill="url(#sky)"/>';
  [[260,90],[780,70],[1080,130]].forEach(function(c){s+='<g fill="#fff" opacity=".9"><ellipse cx="'+c[0]+'" cy="'+c[1]+'" rx="70" ry="24"/><ellipse cx="'+(c[0]+44)+'" cy="'+(c[1]-16)+'" rx="40" ry="26"/><ellipse cx="'+(c[0]-40)+'" cy="'+(c[1]-6)+'" rx="32" ry="18"/></g>';});
  s+='<path d="M0 470 C200 400 420 420 600 450 C800 410 1000 400 1200 450 V900 H0 Z" fill="#B3DE96"/>';
  s+='<path d="M0 560 C300 520 700 540 1200 530 V900 H0 Z" fill="#94CC76"/>';
  /* the mill: stone base, wooden top, roof and a big cog on the wall */
  s+='<path d="M10 270 L180 130 L350 270 Z" fill="url(#roof)" stroke="#6A2A1C" stroke-width="4" stroke-linejoin="round"/>';
  for(var r=0;r<4;r++){var ry=244-r*26,rh=(ry-130)*170/140-14;s+='<path d="M'+f2(180-rh)+' '+ry+' H'+f2(180+rh)+'" stroke="#6A2A1C" stroke-width="3" opacity=".35"/>';}
  s+='<rect x="40" y="262" width="280" height="190" fill="url(#wood)" stroke="#6A3F22" stroke-width="4"/>';
  for(var x=64;x<320;x+=24)s+='<path d="M'+x+' 262 V452" stroke="#7A4E2A" stroke-width="2" opacity=".45"/>';
  s+='<rect x="30" y="448" width="300" height="270" fill="url(#stone)" stroke="#7E776A" stroke-width="4"/>';
  for(var y=480;y<718;y+=34){for(var bx=30+((y/34)%2)*30;bx<330;bx+=60)s+='<rect x="'+bx+'" y="'+(y-32)+'" width="58" height="32" rx="4" fill="none" stroke="#8C8578" stroke-width="2" opacity=".55"/>';}
  s+='<path d="M140 718 V630 A40 40 0 0 1 220 630 V718 Z" fill="#5E3A1E"/><path d="M148 718 V632 A32 32 0 0 1 212 632 V718 Z" fill="url(#wood)"/>';
  s+='<rect x="70" y="300" width="56" height="56" rx="6" fill="#9FD3EE" stroke="#6A3F22" stroke-width="5"/><path d="M98 300 V356 M70 328 H126" stroke="#6A3F22" stroke-width="4"/>';
  s+='<g transform="translate(240 350)"><path d="'+gearD(14,52,0,12,3)+'" fill="url(#brass)" stroke="#8A5E14" stroke-width="3" stroke-linejoin="round"/><circle r="36" fill="none" stroke="#8A5E14" stroke-width="3" opacity=".5"/>';
  for(var h=0;h<5;h++){var ha=h*72*Math.PI/180;s+='<circle cx="'+f2(26*Math.cos(ha))+'" cy="'+f2(26*Math.sin(ha))+'" r="9" fill="#8A5E14" opacity=".55"/>';}
  s+='<circle r="10" fill="url(#steel)" stroke="#4E5868" stroke-width="2"/></g>';
  /* the waterwheel beside the mill */
  s+='<g transform="translate(420 600)">';
  for(var p=0;p<16;p++)s+='<rect x="-10" y="-176" width="20" height="40" rx="4" fill="url(#wood)" stroke="#6A3F22" stroke-width="3" transform="rotate('+(p*22.5)+')"/>';
  s+='<circle r="150" fill="none" stroke="#6A3F22" stroke-width="18"/><circle r="150" fill="none" stroke="#C98E5A" stroke-width="9"/><circle r="104" fill="none" stroke="#8A5A30" stroke-width="6"/>';
  for(var k=0;k<8;k++)s+='<path d="M0 0 L0 -146" stroke="#8A5A30" stroke-width="10" transform="rotate('+(k*45)+')"/>';
  s+='<circle r="22" fill="#6A3F22"/><circle r="10" fill="url(#brass)"/></g>';
  /* water chute pouring onto the wheel */
  s+='<path d="M330 410 L470 438" stroke="#6A3F22" stroke-width="22" stroke-linecap="round"/><path d="M330 404 L470 432" stroke="#7DBDE6" stroke-width="10" stroke-linecap="round"/>';
  s+='<path d="M470 436 C486 456 490 480 486 500" stroke="#9AD3F2" stroke-width="10" fill="none" stroke-linecap="round" opacity=".85"/>';
  /* the stream */
  s+='<path d="M0 720 C200 700 400 730 600 718 C800 706 1000 732 1200 718 V820 C1000 836 800 810 600 824 C400 836 200 810 0 826 Z" fill="url(#water)"/>';
  [[90,752],[300,770],[560,748],[760,778],[980,754],[1120,780]].forEach(function(w){s+='<path d="M'+w[0]+' '+w[1]+' q22 -10 44 0 t44 0" stroke="#fff" stroke-width="4" fill="none" opacity=".55" stroke-linecap="round"/>';});
  /* a little truss footbridge on the right */
  s+='<path d="M840 724 H1140" stroke="#6A3F22" stroke-width="16" stroke-linecap="round"/><path d="M840 724 H1140" stroke="#D19A64" stroke-width="8" stroke-linecap="round"/>';
  for(var t=0;t<6;t++){var x0=850+t*48;s+='<path d="M'+x0+' 718 L'+(x0+24)+' 676 L'+(x0+48)+' 718" stroke="#8A5A30" stroke-width="7" fill="none" stroke-linejoin="round"/>';}
  s+='<path d="M874 676 H1114" stroke="#8A5A30" stroke-width="7" stroke-linecap="round"/>';
  /* workbench with a pegboard of tools */
  s+='<rect x="900" y="330" width="260" height="170" rx="10" fill="#E9C894" stroke="#9A6234" stroke-width="5"/>';
  for(var py=350;py<500;py+=22){for(var px=920;px<1160;px+=22)s+='<circle cx="'+px+'" cy="'+py+'" r="3" fill="#B8925C"/>';}
  s+='<g transform="translate(950 420) rotate(-20)"><rect x="-6" y="-10" width="12" height="70" rx="5" fill="#C98E5A" stroke="#6A3F22" stroke-width="3"/><rect x="-30" y="-36" width="60" height="26" rx="5" fill="url(#steel)" stroke="#4E5868" stroke-width="3"/></g>';
  s+='<g transform="translate(1040 410)"><path d="M-40 -10 L40 -30 L40 6 L-40 10 Z" fill="url(#steel)" stroke="#4E5868" stroke-width="3"/><rect x="36" y="-40" width="34" height="50" rx="10" fill="#C98E5A" stroke="#6A3F22" stroke-width="3"/></g>';
  s+='<g transform="translate(1120 440) rotate(30)"><rect x="-6" y="-40" width="12" height="70" rx="4" fill="url(#steel)" stroke="#4E5868" stroke-width="3"/><circle cy="-46" r="16" fill="url(#steel)" stroke="#4E5868" stroke-width="3"/><rect x="-6" y="-66" width="12" height="20" fill="#E9C894"/></g>';
  s+='<rect x="880" y="530" width="300" height="26" rx="6" fill="url(#wood)" stroke="#6A3F22" stroke-width="4"/><rect x="900" y="556" width="18" height="110" fill="#9A6234"/><rect x="1142" y="556" width="18" height="110" fill="#9A6234"/>';
  [[940,512,26,'url(#copper)'],[990,506,32,'url(#brass)'],[1040,516,22,'url(#steel)']].forEach(function(c){s+='<g transform="translate('+c[0]+' '+c[1]+')"><path d="'+gearD(10,c[2],0,c[2]*.28,c[2]*.12)+'" fill="'+c[3]+'" stroke="#5E4E3C" stroke-width="2.5" stroke-linejoin="round"/><circle r="'+f2(c[2]*.3)+'" fill="#5E4E3C" opacity=".6"/></g>';});
  /* grass in front */
  s+='<path d="M0 826 C300 812 900 840 1200 820 V900 H0 Z" fill="#7FBE62"/>';
  for(var g=0;g<34;g++){var gx=(g*37)%1200, gh=24+(g*13)%30; s+='<path d="M'+gx+' 900 q4 -'+(gh/2)+' '+(g%2?8:-6)+' -'+gh+'" stroke="#5FA34D" stroke-width="5" fill="none" stroke-linecap="round"/>';}
  s+='</svg>';
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
}
/* jigsaw picture: a fairy house building site */
function buildPicture(){
  var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">'+allDefs() +
    '<linearGradient id="bsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FD3F2"/><stop offset="1" stop-color="#E6F4FC"/></linearGradient>' +
    '<rect width="600" height="600" fill="url(#bsky)"/>';
  s+='<circle cx="520" cy="80" r="40" fill="#F8D96A"/><circle cx="520" cy="80" r="54" fill="#F8D96A" opacity=".3"/>';
  s+='<g fill="#fff"><ellipse cx="120" cy="80" rx="50" ry="18"/><ellipse cx="150" cy="66" rx="30" ry="20"/><ellipse cx="330" cy="120" rx="40" ry="14"/></g>';
  s+='<path d="M0 400 C150 370 420 380 600 396 V600 H0 Z" fill="#9FD283"/><path d="M0 470 C200 450 400 470 600 460 V600 H0 Z" fill="#86C462"/>';
  /* crane made of triangles, lifting a cog */
  s+='<path d="M470 470 V160" stroke="#E8A23A" stroke-width="12"/><path d="M500 470 V160" stroke="#E8A23A" stroke-width="12"/>';
  for(var c=0;c<6;c++)s+='<path d="M470 '+(470-c*52)+' L500 '+(444-c*52)+' L470 '+(418-c*52)+'" stroke="#E8A23A" stroke-width="6" fill="none"/>';
  s+='<path d="M300 160 H560" stroke="#E8A23A" stroke-width="12" stroke-linecap="round"/><path d="M300 186 H470" stroke="#E8A23A" stroke-width="8"/>';
  for(var j=0;j<6;j++)s+='<path d="M'+(300+j*28)+' 186 L'+(314+j*28)+' 160 L'+(328+j*28)+' 186" stroke="#E8A23A" stroke-width="5" fill="none"/>';
  s+='<rect x="540" y="164" width="30" height="40" fill="#6E7888"/><path d="M330 160 V300" stroke="#3B2A4A" stroke-width="3"/>';
  s+='<g transform="translate(330 320)"><path d="'+gearD(10,22,0,6,3)+'" fill="url(#cogBrass)" stroke="#8A5E14" stroke-width="2" stroke-linejoin="round"/><circle r="7" fill="#8A5E14"/></g>';
  /* a half-built house: wooden frame, roof triangles and a ladder */
  s+='<rect x="160" y="300" width="200" height="160" fill="#F7E6CC" opacity=".5"/>';
  s+='<rect x="160" y="380" width="200" height="80" fill="url(#plankG)" stroke="#8A5A30" stroke-width="3"/>';
  for(var q=180;q<360;q+=20)s+='<path d="M'+q+' 380 V460" stroke="#8A5A30" stroke-width="2" opacity=".5"/>';
  s+='<path d="M160 460 V300 H360 V460 M220 300 V380 M290 300 V380 M160 340 H360" stroke="#8A5A30" stroke-width="8" fill="none"/>';
  s+='<path d="M150 302 L260 220 L370 302 Z" fill="none" stroke="#B07A48" stroke-width="8" stroke-linejoin="round"/><path d="M205 262 L260 302 L315 262" stroke="#B07A48" stroke-width="6" fill="none"/>';
  s+='<path d="M120 470 L170 290 M150 470 L200 290" stroke="#C98E5A" stroke-width="6"/>';
  for(var l=0;l<8;l++){var ly=455-l*22;s+='<path d="M'+(124+l*6.1)+' '+ly+' H'+(154+l*6.1)+'" stroke="#C98E5A" stroke-width="5"/>';}
  /* Rivet's cog cottage in the corner */
  s+='<g transform="translate(2 304) scale(.62)">'+houseGround()+cogBody()+'</g>';
  /* toolbox, planks, bucket and a cone */
  s+='<rect x="380" y="500" width="110" height="56" rx="8" fill="#E8574C" stroke="#9C241C" stroke-width="3"/><path d="M410 500 V486 H460 V500" stroke="#9C241C" stroke-width="6" fill="none"/><rect x="380" y="518" width="110" height="8" fill="#9C241C"/>';
  s+='<g transform="translate(420 486) rotate(-30)"><rect x="-4" y="-40" width="8" height="40" fill="#C98E5A"/><rect x="-16" y="-48" width="32" height="12" rx="3" fill="url(#steelG)"/></g>';
  [0,1,2].forEach(function(i){s+='<rect x="'+(60+i*8)+'" y="'+(520-i*16)+'" width="150" height="16" rx="4" fill="url(#plankG)" stroke="#8A5A30" stroke-width="2"/>';});
  s+='<path d="M520 560 L540 470 L560 560 Z" fill="#F7A055" stroke="#B8661E" stroke-width="3" stroke-linejoin="round"/><path d="M528 528 H552" stroke="#fff" stroke-width="8"/><rect x="510" y="556" width="60" height="10" rx="3" fill="#B8661E"/>';
  s+='<path d="M250 520 L256 572 H304 L310 520 Z" fill="#7DBDE6" stroke="#3E7FB0" stroke-width="3"/><path d="M250 520 C250 500 310 500 310 520" stroke="#3E7FB0" stroke-width="3" fill="none"/>';
  s+='</svg>';
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
}
/* ================= Rivet's cog-mill puzzles ================= */

/* ---------- gear helpers ---------- */
var GFILL=[['url(#steelG)','#4E5868'],['url(#cogBrass)','#8A5E14'],['url(#cogCopper)','#7A3E1A']];
function styleGears(list){list.forEach(function(g,i){g.id='gr-'+i;if(g.kind!=='wheel'){var f=i===0?GFILL[2]:GFILL[i%2];g.fill=f[0];g.edge=f[1];}});}
function gearG(g){
  var r=gr(g.z), edge=g.edge||'#4E5868', s='<g id="'+g.id+'" transform="translate('+f2(g.x)+' '+f2(g.y)+')"><g class="gspin">';
  s+='<path d="'+gearD(g.z,r,g.ph)+'" fill="'+(g.fill||'url(#steelG)')+'" stroke="'+edge+'" stroke-width="2" stroke-linejoin="round"/>';
  s+='<circle r="'+f2(r-9)+'" fill="none" stroke="'+edge+'" stroke-width="1.5" opacity=".45"/>';
  if(r>26){var nh=r>50?6:4;for(var i=0;i<nh;i++){var a=(i*360/nh+(g.ph||0))*Math.PI/180;s+='<circle cx="'+f2(r*.52*Math.cos(a))+'" cy="'+f2(r*.52*Math.sin(a))+'" r="'+f2(r*.17)+'" fill="'+edge+'" opacity=".5"/>';}}
  s+='<circle r="'+f2(Math.max(6,r*.2))+'" fill="'+edge+'" opacity=".45"/><circle r="'+f2(Math.max(3.5,r*.11))+'" fill="url(#ggold)" stroke="#9A6A16" stroke-width="1"/>';
  if(g.kind==='handle')s+='<path d="M0 0 L'+f2(r*.72)+' 0" stroke="#6A3F22" stroke-width="7" stroke-linecap="round"/><circle cx="'+f2(r*.72)+'" r="7.5" fill="#E8574C" stroke="#9C241C" stroke-width="2"/>';
  return s+'</g></g>';
}
/* the waterwheel: a big wooden gear with paddles inside its rim */
function wheelG(g){
  var r=gr(g.z), s='<g id="'+g.id+'" transform="translate('+f2(g.x)+' '+f2(g.y)+')"><g class="gspin">';
  s+='<path d="'+gearD(g.z,r,g.ph)+'" fill="url(#cogWood)" stroke="#5A3416" stroke-width="2" stroke-linejoin="round"/>';
  s+='<circle r="'+f2(r-10)+'" fill="#EAD5AE" stroke="#5A3416" stroke-width="2"/>';
  for(var i=0;i<8;i++){var a=i*45;s+='<path d="M0 0 L0 '+f2(-(r-12))+'" stroke="#8A5A30" stroke-width="6" transform="rotate('+a+')"/><rect x="-9" y="'+f2(-(r-11))+'" width="18" height="14" rx="2" fill="url(#plankG)" stroke="#6A3F22" stroke-width="1.5" transform="rotate('+(a+22.5)+')"/>';}
  return s+'<circle r="13" fill="#6A3F22"/><circle r="6" fill="url(#ggold)"/></g></g>';
}
function gearSVG(list,o){
  o=o||{};
  var ext=list.map(function(g){return {x:g.x,y:g.y,r:gr(g.z)+6+(g.kind==='handle'&&o.arrow?26:0)};}).concat(o.extent||[]);
  var minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9;
  ext.forEach(function(e){minX=Math.min(minX,e.x-e.r);maxX=Math.max(maxX,e.x+e.r);minY=Math.min(minY,e.y-e.r);maxY=Math.max(maxY,e.y+e.r);});
  if(o.labels)o.labels.forEach(function(l){var g=list[l.i];minY=Math.min(minY,g.y-gr(g.z)-40);});
  minX-=14;maxX+=14;minY-=12;maxY+=12;
  var W=maxX-minX,H=maxY-minY;
  var s='<svg class="gearsvg" viewBox="'+[minX,minY,W,H].map(f2).join(' ')+'" role="img" aria-label="'+esc(o.aria||'Gears')+'"><defs><clipPath id="gr-clip"><rect x="'+f2(minX)+'" y="'+f2(minY)+'" width="'+f2(W)+'" height="'+f2(H)+'" rx="18"/></clipPath></defs><g clip-path="url(#gr-clip)">';
  s+='<rect x="'+f2(minX)+'" y="'+f2(minY)+'" width="'+f2(W)+'" height="'+f2(H)+'" fill="#F6E7CB"/>';
  for(var py=minY+30;py<maxY;py+=30)s+='<path d="M'+f2(minX)+' '+f2(py)+' H'+f2(maxX)+'" stroke="#E6CFA4" stroke-width="2"/>';
  if(o.pegs)o.pegs.forEach(function(p){s+='<circle cx="'+f2(p.x)+'" cy="'+f2(p.y)+'" r="9" fill="#5E4E6C"/><circle cx="'+f2(p.x-2.5)+'" cy="'+f2(p.y-2.5)+'" r="3" fill="#fff" opacity=".45"/>';});
  list.forEach(function(g){s+=g.kind==='wheel'?wheelG(g):gearG(g);});
  var wh=list.filter(function(g){return g.kind==='wheel';})[0];
  if(wh){
    var sy=wh.y+gr(wh.z)*.5;
    s+='<rect x="'+f2(minX)+'" y="'+f2(sy)+'" width="'+f2(W)+'" height="'+f2(maxY-sy)+'" fill="#4FA9DE" opacity=".82"/>';
    var wv='M'+f2(minX)+' '+f2(sy+5);for(var wx=minX;wx<maxX;wx+=28)wv+=' q7 -6 14 0 t14 0';
    s+='<path d="'+wv+'" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>';
  }
  if(o.arrow){var h=list[0];s+=turnArrow(h.x,h.y,gr(h.z)+17,-150,-30,o.arrow>0,'#E8574C',6);}
  if(o.labels)o.labels.forEach(function(l){var g=list[l.i],ly=g.y-gr(g.z)-22,w=l.text.length*9+22;s+='<rect x="'+f2(g.x-w/2)+'" y="'+f2(ly-15)+'" width="'+f2(w)+'" height="28" rx="14" fill="#fff" stroke="#E4DAF0" stroke-width="2"/><text x="'+f2(g.x)+'" y="'+f2(ly+5)+'" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="17" font-weight="600" fill="#3B2A4A">'+esc(l.text)+'</text>';});
  return s+'</g></svg>';
}
/* turn the gears: the first one turns deg degrees, each one after it the other way, faster or slower by its teeth */
function spinGears(list,o,done){
  var els=list.map(function(g){var e=document.getElementById(g.id);return e?e.querySelector('.gspin'):null;}), t0=null, sg=o.dir||1, signs=[];
  list.forEach(function(){signs.push(sg);sg=-sg;});
  if(o.click&&mem.sound){var n=Math.round(o.dur/120);for(var i=0;i<n;i++)tone(i%2?1500:1200,i*.12,.03,'square',.02);}
  function frame(ts){
    if(!els[0]||!els[0].isConnected||$('#s-puzzle').hidden)return;
    if(t0===null)t0=ts;
    var k=Math.min(1,(ts-t0)/o.dur), e=.5-.5*Math.cos(Math.PI*k);
    list.forEach(function(g,i){
      if(!els[i])return;
      var a=o.jam?(i===0?Math.sin(k*Math.PI*8)*7*(1-k):0):signs[i]*o.deg*e*list[0].z/g.z;
      els[i].setAttribute('transform','rotate('+f2(a)+')');
    });
    if(k<1)requestAnimationFrame(frame); else if(done)done();
  }
  requestAnimationFrame(frame);
}
/* lay out a row of meshing gears that zigzags left to right; with a waterwheel last, the others stay above its stream */
function chainLayout(zs,wheel){
  for(var t=0;t<400;t++){
    var g=[{x:0,y:0,z:zs[0]}], ok=true;
    for(var i=1;i<zs.length&&ok;i++){
      var last=i===zs.length-1, a=(last&&wheel?rnd(10,45):rnd(-42,42))*Math.PI/180, d=gr(zs[i-1])+gr(zs[i]);
      var nb={x:g[i-1].x+d*Math.cos(a),y:g[i-1].y+d*Math.sin(a),z:zs[i]};
      for(var j=0;j<i-1;j++){if(Math.hypot(nb.x-g[j].x,nb.y-g[j].y)<gr(g[j].z)+gr(nb.z)+16){ok=false;break;}}
      g.push(nb);
    }
    if(!ok)continue;
    var top=1e9,bot=-1e9,right=-1e9;g.forEach(function(q){top=Math.min(top,q.y-gr(q.z));bot=Math.max(bot,q.y+gr(q.z));right=Math.max(right,q.x+gr(q.z));});
    if(bot-top>(wheel?260:230)||right>600)continue;
    if(wheel){var w=g[g.length-1],sy=w.y+gr(w.z)*.5;if(g.slice(0,-1).some(function(q){return q.y+gr(q.z)+8>sy;}))continue;}
    return g;
  }
  /* fallback: a straight row, with the waterwheel stepping down */
  var f=[{x:0,y:0,z:zs[0]}];
  for(var k=1;k<zs.length;k++){var aa=(wheel&&k===zs.length-1?40:0)*Math.PI/180,dd=gr(zs[k-1])+gr(zs[k]);f.push({x:f[k-1].x+dd*Math.cos(aa),y:f[k-1].y+dd*Math.sin(aa),z:zs[k]});}
  return f;
}
function dirIcon(cw){return '<svg viewBox="0 0 60 60" aria-hidden="true">'+turnArrow(30,30,18,-200,50,cw,'#3B2A4A',5)+'</svg>';}
function dirOpts(box,ans,done){
  [1,-1].forEach(function(d){
    var b=optBtn(dirIcon(d>0)+'<span>'+(d>0?'Clockwise':'Anticlockwise')+'</span>',null,'dirbtn');
    b.addEventListener('click',function(){box.querySelectorAll('button').forEach(function(x){x.disabled=true;});done(d===ans);});
    box.appendChild(b);
  });
}
function gearIcon(z){return '<svg viewBox="-64 -64 128 128" aria-hidden="true">'+gearG({x:0,y:0,z:z,ph:0,id:'gi-'+z,fill:GFILL[1][0],edge:GFILL[1][1]}).replace(' id="gi-'+z+'"','')+'</svg>';}
/* 1. turn the gears to spin the waterwheel */
function pzGears(area,L){
  if(L===1){
    var sizes=[8,16,24], want=pick(sizes), D=gr(12)+2*gr(8)+gr(30);
    var H={x:0,y:0,z:12,kind:'handle',ph:rnd(0,29)}, M={z:want}, Wh={x:D,y:0,z:30,kind:'wheel'};
    var d1=gr(12)+gr(want), d2=gr(30)+gr(want), px=(d1*d1-d2*d2+D*D)/(2*D);
    M.x=px; M.y=-Math.sqrt(Math.max(0,d1*d1-px*px));
    var chain=[H,M,Wh]; meshChain(chain); styleGears(chain);
    var placed=null, busy=false, shown=[H,Wh];
    setSay('Rivet’s waterwheel won’t turn. Pick a gear to put on the empty peg, so the handle can turn the waterwheel. Then tap Turn the handle.');
    area.innerHTML='<div class="panel gear-wrap" id="gr-box"></div><div class="opts" id="gr-opts"></div><button class="btn" id="gr-go" disabled>Turn the handle</button>';
    function draw(){
      shown=[H,Wh];
      if(placed){var g={x:M.x,y:M.y,z:placed,id:'gr-1',fill:GFILL[1][0],edge:GFILL[1][1]};g.ph=placed===want?M.ph:meshPh(H,g,gr(H.z),gr(placed));shown=[H,g,Wh];}
      $('#gr-box').innerHTML=gearSVG(shown,{pegs:[M],extent:[{x:M.x,y:M.y,r:gr(want)+8}],aria:'A handle gear on the left, a waterwheel on the right and an empty peg between them'+(placed?', now holding a gear':'')});
    }
    sizes.forEach(function(z){
      var b=optBtn(gearIcon(z),z===8?'Small gear':z===16?'Middle-sized gear':'Big gear','gopt'); b.setAttribute('aria-pressed','false');
      b.addEventListener('click',function(){if(busy)return;placed=z;$('#gr-opts').querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed',String(x===b));});tick();draw();$('#gr-go').disabled=false;});
      $('#gr-opts').appendChild(b);
    });
    $('#gr-go').addEventListener('click',function(){
      if(busy||!placed)return; busy=true; this.disabled=true;
      if(placed===want)spinGears(shown,{deg:540,dir:1,dur:2800,click:true},function(){finish(true);});
      else if(placed<want)spinGears([H],{deg:360,dir:1,dur:1800,click:true},function(){finish(false);});
      else spinGears([H],{jam:true,dur:1200},function(){finish(false);});
    });
    draw();
    return;
  }
  if(L===3){pzGearOrder(area);return;}
  setSay('Each gear pushes the next one round the other way. Look at which way the handle turns, then work out which way the waterwheel will turn.');
  rounds(2,function(k,next){
    if(L===3&&k===1){
      var P=pick([[24,8],[24,6],[30,10],[30,6],[36,12],[36,9],[32,8],[20,10],[28,7],[20,5]]), zA=P[0], zB=P[1], ans=zA/zB;
      var list2=chainLayout([zA,pick([12,14,16]),zB],false); list2[0].kind='handle'; list2[0].ph=rnd(0,9); meshChain(list2); styleGears(list2);
      var q2='Rivet turns the handle gear round once. How many times does the little gear at the end turn round?';
      area.innerHTML=roundNote(1,2)+'<div class="panel gear-wrap">'+gearSVG(list2,{aria:'A handle gear with '+zA+' teeth turns a middle gear, which turns a little gear with '+zB+' teeth'})+'</div><div class="gkey" aria-hidden="true"><span><i style="background:#D4825A"></i>Handle gear: '+zA+' teeth</span><span><i style="background:#AEB7C4"></i>Little gear: '+zB+' teeth</span></div><p class="say-small">'+esc(q2)+'</p><div class="opts" id="gr-opts"></div>';
      speak(q2);
      numOpts($('#gr-opts'),ans,[ans+1,ans-1,ans*2,ans+2],function(ok){
        $('#gr-opts').querySelectorAll('button').forEach(function(x){x.disabled=true;});
        if(!ok){next(false);return;}
        spinGears(list2,{deg:360,dir:1,dur:2200+ans*300,click:true},function(){next(true);});
      });
      return;
    }
    var n=L===2?(k===0?3:4):pick([5,6]), zs=[pick([10,12,14])];
    for(var i=1;i<n-1;i++)zs.push(pick([8,10,12,14,16,18]));
    zs.push(30);
    var list=chainLayout(zs,true); list[0].kind='handle'; list[0].ph=rnd(0,29); list[n-1].kind='wheel'; meshChain(list); styleGears(list);
    var dir=pick([1,-1]), want=n%2===1?dir:-dir, q='The handle turns this way. Which way will the waterwheel turn?';
    area.innerHTML=roundNote(k,2)+'<div class="panel gear-wrap">'+gearSVG(list,{arrow:dir,aria:n+' gears in a row. The handle on the left turns '+(dir>0?'clockwise':'anticlockwise')+'. The waterwheel is at the other end.'})+'</div><p class="say-small">'+esc(q)+'</p><div class="opts" id="gr-opts"></div>';
    speak(q);
    dirOpts($('#gr-opts'),want,function(ok){
      if(!ok){next(false);return;}
      spinGears(list,{deg:300,dir:dir,dur:1800,click:true},function(){next(true);});
    });
  });
}
/* Gear chains (Nimble Nymph): first put the gears on the pegs so each one meshes with the next,
   then say which way the waterwheel turns with those gears */
function pzGearOrder(area){
  var m=pick([2,3]), sizes=m===3?shuffle([8,14,20]):shuffle(pick([[8,18],[10,20],[8,16]]));
  var list=chainLayout([12].concat(sizes).concat([30]),true), n=list.length;
  list[0].kind='handle'; list[0].ph=rnd(0,29); list[n-1].kind='wheel'; meshChain(list); styleGears(list);
  var placed=[], sel=null, busy=false; for(var i=0;i<n;i++)placed.push(null);
  var ext=list.map(function(g){return {x:g.x,y:g.y,r:gr(g.z)+6};});
  setSay('Rivet’s gears have fallen off their pegs. Put each gear on a peg so it fits snugly against the gears next to it: no gaps and no squashing. Then tap Check the gears.');
  rounds(2,function(k,next){
    if(k===0){
      area.innerHTML=roundNote(0,2)+'<div class="panel gear-wrap" id="go-box"></div><div class="opts" id="go-tray" aria-label="Gears to put on"></div><button class="btn" id="go-check" disabled>Check the gears</button>';
      function draw(){
        var shown=[list[0]], empty=[];
        for(var p=1;p<n-1;p++){
          if(placed[p]==null){empty.push(list[p]);continue;}
          var g={x:list[p].x,y:list[p].y,z:placed[p],id:'gp-'+p,fill:GFILL[p%2][0],edge:GFILL[p%2][1]};
          var prev=shown[shown.length-1]; g.ph=placed[p]===list[p].z?list[p].ph:meshPh(prev,g,gr(prev.z),gr(g.z));
          shown.push(g);
        }
        shown.push(list[n-1]);
        var svg=gearSVG(shown,{pegs:empty,extent:ext,aria:'A handle gear, '+(n-2)+' pegs and a waterwheel'});
        var taps='';
        for(p=1;p<n-1;p++)taps+='<g class="gpeg" data-p="'+p+'" tabindex="0" role="button" aria-label="Peg '+p+(placed[p]!=null?', with a gear of '+placed[p]+' teeth. Tap to take it off':', empty')+'"><circle cx="'+f2(list[p].x)+'" cy="'+f2(list[p].y)+'" r="'+f2(Math.max(34,gr(placed[p]||8)))+'" fill="#fff" fill-opacity="0"/></g>';
        $('#go-box').innerHTML=svg.replace(/<\/g><\/svg>$/,taps+'</g></svg>');
        $('#go-box').querySelectorAll('.gpeg').forEach(function(el){
          function hit(){
            if(busy)return; var pp=+el.getAttribute('data-p');
            if(sel!=null){var was=placed.indexOf(sel);if(was>=0)placed[was]=null;placed[pp]=sel;sel=null;}
            else if(placed[pp]!=null)placed[pp]=null;
            else return;
            tick(); draw();
          }
          el.addEventListener('click',hit);
          el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();hit();}});
        });
        var tray=$('#go-tray'); tray.innerHTML='';
        var left=sizes.filter(function(z){return placed.indexOf(z)<0;});
        if(!left.length)tray.innerHTML='<span class="tray-empty">All the gears are on. Tap Check the gears.</span>';
        left.forEach(function(z){
          var b=optBtn(gearIcon(z),'Gear with '+z+' teeth','gopt'); b.setAttribute('aria-pressed',String(sel===z));
          b.addEventListener('click',function(){if(busy)return;sel=sel===z?null:z;tick();draw();});
          tray.appendChild(b);
        });
        $('#go-check').disabled=left.length>0;
      }
      $('#go-check').addEventListener('click',function(){
        if(busy)return; busy=true; this.disabled=true;
        var ok=true; for(var p=1;p<n-1;p++)if(placed[p]!==list[p].z)ok=false;
        if(ok)chime(); else if(mem.sound)tone(160,0,.4,'triangle',.08);
        later(function(){next(ok);},ok?700:500);
      });
      draw();
      return;
    }
    var dir=pick([1,-1]), want=n%2===1?dir:-dir, q='Your gears fit! Now the handle turns this way. Which way will the waterwheel turn?';
    area.innerHTML=roundNote(1,2)+'<div class="panel gear-wrap">'+gearSVG(list,{arrow:dir,aria:n+' gears in a row. The handle on the left turns '+(dir>0?'clockwise':'anticlockwise')+'. The waterwheel is at the other end.'})+'</div><p class="say-small">'+esc(q)+'</p><div class="opts" id="gr-opts"></div>';
    speak(q);
    dirOpts($('#gr-opts'),want,function(ok){
      if(!ok){next(false);return;}
      spinGears(list,{deg:300,dir:dir,dur:1800,click:true},function(){next(true);});
    });
  });
}
/* 2. balance the seesaw */
var HEFT={feather:1,leaf:1,cotton:1,cork:2,sponge:2,apple:3,ball:3,block:4,key:4,hammer:6,stone:7,brick:8,anvil:10};
var HEFT_NAME={feather:'feather',leaf:'leaf',cotton:'cotton wool ball',cork:'cork',sponge:'sponge',apple:'apple',ball:'ball',block:'wooden block',key:'key',hammer:'hammer',stone:'stone',brick:'brick',anvil:'anvil'};
function weightPic(v){return '<path d="M26 38 H74 L86 92 H14 Z" fill="url(#ironG)" stroke="#2E3440" stroke-width="3" stroke-linejoin="round"/><path d="M38 38 C38 14 62 14 62 38" stroke="#3E4656" stroke-width="9" fill="none"/><ellipse cx="34" cy="58" rx="5" ry="13" fill="#fff" opacity=".18"/><text x="50" y="80" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="'+(String(v).length>2?24:30)+'" font-weight="600" fill="#fff">'+v+'</text>';}
function blankWeight(){return '<path d="M26 38 H74 L86 92 H14 Z" fill="#fff" fill-opacity=".7" stroke="#8A4F7D" stroke-width="3" stroke-dasharray="7 5" stroke-linejoin="round"/><text x="50" y="80" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="32" font-weight="600" fill="#8A4F7D">?</text>';}
function ssItems(items,cx,size){
  var gap=size*.94, x0=cx-(items.length-1)*gap/2, s='';
  items.forEach(function(it,i){
    var x=x0+i*gap, y=166-size*.9;
    s+=(it.tap?'<g class="ssit" data-k="'+it.key+'" tabindex="0" role="button" aria-label="'+esc(it.label)+'"><circle class="hit" cx="'+f2(x)+'" cy="'+f2(166-size/2)+'" r="'+f2(size*.58)+'" fill="#fff" fill-opacity="0"/>':'<g aria-hidden="true">')+nested(x-size/2,y,size,size,'0 0 100 100',it.html)+'</g>';
  });
  return s;
}
function seesawSVG(left,right,aria,size,ang){
  size=size||70;
  return '<svg class="sssvg" viewBox="0 0 400 250" role="group" aria-label="'+esc(aria)+'"><rect width="400" height="250" rx="18" fill="#EAF5FC"/><path d="M0 214 C120 206 280 220 400 212 V250 H0 Z" fill="#9FD283"/>' +
    '<path d="M200 166 L164 228 H236 Z" fill="url(#ironG)" stroke="#2E3440" stroke-width="3" stroke-linejoin="round"/>' +
    '<g class="plank" id="ss-plank" style="transform:rotate('+(ang||0)+'deg)"><rect x="30" y="166" width="340" height="14" rx="7" fill="url(#plankG)" stroke="#8A5A30" stroke-width="2"/>'+ssItems(left,100,size)+ssItems(right,300,size)+'</g>' +
    '<circle cx="200" cy="172" r="6" fill="url(#ggold)" stroke="#9A6A16" stroke-width="1.5"/></svg>';
}
function tiltFor(l,r){if(l===r)return 0;var d=(r-l)/(l+r)*40;return Math.max(7,Math.min(14,Math.abs(d)))*(d>0?1:-1);}
function setTilt(a){var p=$('#ss-plank');if(p)p.style.transform='rotate('+a+'deg)';}
function pzSeesaw(area,L){
  if(L===1){
    setSay('Heavy things push their end of the seesaw down. Look carefully, then tap the thing you are asked for.');
    var keys=Object.keys(HEFT);
    rounds(3,function(k,next){
      var a,b,g=0; do{a=pick(keys);b=pick(keys);g++;}while(Math.abs(HEFT[a]-HEFT[b])<3&&g<300);
      var heavy=k===0?true:k===1?false:pick([true,false]);
      var want=heavy?(HEFT[a]>HEFT[b]?a:b):(HEFT[a]<HEFT[b]?a:b), down=HEFT[a]>HEFT[b]?'left':'right';
      var q=heavy?'Tap the heavier thing.':'Tap the lighter thing.';
      area.innerHTML=roundNote(k,3)+'<div class="panel seesaw-wrap">'+seesawSVG([{key:a,html:pic2(a),label:'The '+HEFT_NAME[a]+', on the left',tap:true}],[{key:b,html:pic2(b),label:'The '+HEFT_NAME[b]+', on the right',tap:true}],'A seesaw with '+aOrAn(HEFT_NAME[a])+' '+HEFT_NAME[a]+' on the left and '+aOrAn(HEFT_NAME[b])+' '+HEFT_NAME[b]+' on the right. The '+down+' end goes down.',74)+'</div><p class="say-small">'+q+'</p>';
      speak(q);
      later(function(){setTilt(tiltFor(HEFT[a],HEFT[b]));},150);
      var busy=false;
      area.querySelectorAll('.ssit').forEach(function(el){
        function hit(){if(busy)return;busy=true;var ok=el.getAttribute('data-k')===want;el.classList.add(ok?'on':'bad');later(function(){next(ok);},ok?350:500);}
        el.addEventListener('click',hit);
        el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();hit();}});
      });
    });
    return;
  }
  setSay(L===2?'The seesaw isn’t balanced. Pick the weight that makes both sides the same, so the seesaw is level.':'Find the missing weight. Both sides of the seesaw must add up to the same number.');
  rounds(2,function(k,next){
    var left,right,ans;
    if(L===2){var tot=k===0?rnd(6,10):rnd(12,20), a=rnd(1,tot-1), c=rnd(1,tot-2); left=[a,tot-a]; right=[c]; ans=tot-c;}
    else if(k===0){var t5=rnd(8,20)*5, a5=rnd(2,t5/5-2)*5, c5=rnd(2,t5/5-2)*5; left=[a5,t5-a5]; right=[c5]; ans=t5-c5;}
    else {var a3=rnd(11,40),b3=rnd(11,30),c3=rnd(5,25),t3=a3+b3+c3,d3=rnd(10,t3-10); left=[a3,b3,c3]; right=[d3]; ans=t3-d3;}
    var sumL=left.reduce(function(x,y){return x+y;},0), size=left.length>2?54:66;
    function items(arr){return arr.map(function(v){return {html:weightPic(v)};});}
    var q=L===2?'Which weight will make the seesaw level?':'Which weight is missing?';
    var aria='Left side: '+left.join(', ')+'. Right side: '+right[0]+' and an empty space.';
    area.innerHTML=roundNote(k,2)+'<div class="panel seesaw-wrap" id="ss-box">'+seesawSVG(items(left),items(right).concat([{html:blankWeight()}]),aria,size,0)+'</div><p class="say-small">'+q+'</p><div class="opts" id="ss-opts"></div>';
    speak(q);
    var t0=tiltFor(sumL,right[0]); later(function(){setTilt(t0);},150);
    var busy=false;
    numberOptions(ans,L===2?[ans+1,ans-1,ans+2,sumL]:[ans+10,ans-10,ans+1,ans-1,ans+5]).forEach(function(v){
      var b=optBtn('<svg viewBox="0 0 100 100" aria-hidden="true">'+weightPic(v)+'</svg>','Weight '+v,'weightbtn');
      b.addEventListener('click',function(){
        if(busy)return; busy=true; $('#ss-opts').querySelectorAll('button').forEach(function(x){x.disabled=true;});
        $('#ss-box').innerHTML=seesawSVG(items(left),items(right.concat([v])),'Left side: '+left.join(', ')+'. Right side: '+right[0]+' and '+v+'.',size,t0);
        tick(); later(function(){setTilt(tiltFor(sumL,right[0]+v));},80);
        later(function(){next(v===ans);},1300);
      });
      $('#ss-opts').appendChild(b);
    });
  });
}
/* 3. build a bridge from shapes */
var BCELL=46, BCOL={square:['#F8CF5A','#B8861E'],rectangle:['#B3A4F0','#6C5BC4'],circle:['#F28CB3','#B8467A'],triangle:['#7DBDE6','#3E7FB0']};
function bShape(t,x,y,fill,stroke,extra){
  var i=4,c=BCELL,a=' fill="'+fill+'" stroke="'+stroke+'" stroke-width="3" stroke-linejoin="round" '+(extra||'');
  if(t==='square')return '<rect x="'+(x+i)+'" y="'+(y+i)+'" width="'+(c-2*i)+'" height="'+(c-2*i)+'" rx="3"'+a+'/>';
  if(t==='rectangle')return '<rect x="'+(x+i)+'" y="'+(y+i)+'" width="'+(2*c-2*i)+'" height="'+(c-2*i)+'" rx="3"'+a+'/>';
  if(t==='circle')return '<circle cx="'+(x+c/2)+'" cy="'+(y+c/2)+'" r="'+(c/2-i-1)+'"'+a+'/>';
  return '<path d="M'+(x+i)+' '+(y+i)+' L'+(x+i)+' '+(y+c-i)+' L'+(x+c-i)+' '+(y+c-i)+' Z"'+a+'/>';
}
function pieceSVG(t){var w=t==='rectangle'?92:46;return '<svg viewBox="0 0 '+w+' 46" width="'+(w*1.2)+'" height="55" aria-hidden="true">'+bShape(t,0,0,BCOL[t][0],BCOL[t][1])+'</svg>';}
/* a truss bridge seen from the side: warren (zigzag triangles), squares, or braced squares. Every beam is drawn on its own so it can be counted */
function beam(x1,y1,x2,y2){
  var dx=x2-x1,dy=y2-y1,l=Math.hypot(dx,dy),ux=dx/l,uy=dy/l,a=[x1+ux*6,y1+uy*6],b=[x2-ux*6,y2-uy*6];
  var d='M'+f2(a[0])+' '+f2(a[1])+' L'+f2(b[0])+' '+f2(b[1]);
  return '<path d="'+d+'" stroke="#7A4E2A" stroke-width="9" stroke-linecap="round"/><path d="'+d+'" stroke="#E2B47E" stroke-width="4.5" stroke-linecap="round"/>';
}
function trussParts(kind,n,x0,y0,w,h,braced){
  var beams=[],nodes=[];
  if(kind==='warren'){
    for(var i=0;i<n+2;i++)nodes.push([x0+i*w/2,i%2?y0:y0+h]);
    for(i=0;i<n+1;i++)beams.push([nodes[i],nodes[i+1]]);
    for(i=0;i<n;i++)beams.push([nodes[i],nodes[i+2]]);
  } else {
    for(i=0;i<=n;i++){nodes.push([x0+i*w,y0]);nodes.push([x0+i*w,y0+h]);beams.push([[x0+i*w,y0],[x0+i*w,y0+h]]);}
    for(i=0;i<n;i++){beams.push([[x0+i*w,y0],[x0+(i+1)*w,y0]]);beams.push([[x0+i*w,y0+h],[x0+(i+1)*w,y0+h]]);if(braced&&braced[i])beams.push(i%2?[[x0+i*w,y0],[x0+(i+1)*w,y0+h]]:[[x0+i*w,y0+h],[x0+(i+1)*w,y0]]);}
  }
  var s='';beams.forEach(function(b){s+=beam(b[0][0],b[0][1],b[1][0],b[1][1]);});
  nodes.forEach(function(p){s+='<circle cx="'+f2(p[0])+'" cy="'+f2(p[1])+'" r="4.5" fill="#5E6878" stroke="#3E4656" stroke-width="1.5"/>';});
  return {svg:s,beams:beams.length,width:kind==='warren'?(n+1)*w/2:n*w};
}
/* banks, a stream and a bridge between the banks; deckY is the road the cart rolls on */
function bridgeScene(inner,x0,x1,deckY,W,H){
  return '<rect width="'+W+'" height="'+H+'" rx="16" fill="#EAF5FC"/><path d="M0 '+(H-34)+' C'+(W*.3)+' '+(H-42)+' '+(W*.7)+' '+(H-28)+' '+W+' '+(H-36)+' V'+H+' H0 Z" fill="#4FA9DE" opacity=".85"/>' +
    '<path d="M0 '+deckY+' H'+(x0+4)+' L'+(x0-18)+' '+H+' H0 Z" fill="#9FD283" stroke="#6DAE55" stroke-width="2"/><path d="M'+W+' '+deckY+' H'+(x1-4)+' L'+(x1+18)+' '+H+' H'+W+' Z" fill="#9FD283" stroke="#6DAE55" stroke-width="2"/>'+inner;
}
function cartSVG(x,y){return '<g class="cart" id="br-cart"><rect x="'+(x-2)+'" y="'+(y-22)+'" width="34" height="16" rx="4" fill="#E8574C" stroke="#9C241C" stroke-width="2"/><rect x="'+(x+2)+'" y="'+(y-30)+'" width="26" height="10" rx="3" fill="#F8CF5A" stroke="#B8861E" stroke-width="2"/><circle cx="'+(x+6)+'" cy="'+(y-5)+'" r="5" fill="#3B2A4A"/><circle cx="'+(x+24)+'" cy="'+(y-5)+'" r="5" fill="#3B2A4A"/></g>';}
function rollCart(dist){var c=$('#br-cart');if(!c)return;c.style.transition='transform 1.7s ease-in-out';requestAnimationFrame(function(){c.style.transform='translateX('+dist+'px)';});if(mem.sound)[0,.4,.8,1.2].forEach(function(t){tone(330,t,.12,'triangle',.05);});}
function pzBridge(area,L){
  if(L===1){
    var all=shuffle(['square','triangle','circle','rectangle']), gaps=[{r:0,c:1},{r:1,c:3},{r:0,c:5}].map(function(p,i){return {r:p.r,c:p.c,t:all[i],piece:null};});
    var pieces=shuffle(all).map(function(t,i){return {id:i,t:t,at:null};}), sel=null, busy=false;
    setSay('Rivet’s stone bridge has holes in it. Tap a shape, then tap the hole it fits. When every hole is filled, tap Roll the cart.');
    area.innerHTML='<div class="panel bridge-wrap" id="br-box"></div><div class="bpieces" id="br-pieces"></div><button class="btn" id="br-go" disabled>Roll the cart</button>';
    var X0=39,Y0=92,COLS=7;
    function cellBusy(r,c){return gaps.some(function(g){return g.r===r&&(g.c===c||(g.t==='rectangle'&&g.c+1===c));});}
    function draw(){
      var s='',W=400,H=250;
      /* stones and pillars */
      for(var r=0;r<2;r++)for(var c=0;c<COLS;c++){var x=X0+c*BCELL,y=Y0+r*BCELL;s+='<rect x="'+(x+1)+'" y="'+(y+1)+'" width="'+(BCELL-2)+'" height="'+(BCELL-2)+'" rx="5" fill="'+((r+c)%3?'#CFC8BA':'#C2BBAC')+'" stroke="#8C8578" stroke-width="2"/>';}
      [0,COLS-1].forEach(function(c){var x=X0+c*BCELL;s+='<rect x="'+(x+3)+'" y="'+(Y0+2*BCELL)+'" width="'+(BCELL-6)+'" height="'+(H-Y0-2*BCELL)+'" fill="#BDB6A7" stroke="#8C8578" stroke-width="2"/>';});
      s+='<rect x="'+(X0-4)+'" y="'+(Y0-8)+'" width="'+(COLS*BCELL+8)+'" height="10" rx="4" fill="#8A7E6E"/>';
      /* holes, and whatever piece is in each one */
      gaps.forEach(function(g,i){
        var x=X0+g.c*BCELL,y=Y0+g.r*BCELL,w=g.t==='rectangle'?2*BCELL:BCELL;
        s+='<g class="bgap" data-g="'+i+'" tabindex="0" role="button" aria-label="Hole '+(i+1)+(g.piece!==null?', filled with a '+pieces[g.piece].t:', empty')+'"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+BCELL+'" fill="#fff" fill-opacity="0"/>';
        s+=bShape(g.t,x,y,'#EAF5FC','#6C5BC4','stroke-dasharray="5 4"');
        if(g.piece!==null){var t=pieces[g.piece].t;s+=bShape(t,x,y,BCOL[t][0],BCOL[t][1]);}
        s+='</g>';
      });
      s+=cartSVG(X0+4,Y0-8);
      $('#br-box').innerHTML='<svg class="brsvg" viewBox="0 0 '+W+' '+H+'" role="group" aria-label="A stone bridge with '+gaps.length+' holes">'+bridgeScene(s,X0,X0+COLS*BCELL,Y0-8,W,H)+'</svg>';
      $('#br-box').querySelectorAll('.bgap').forEach(function(el){
        function hit(){
          if(busy)return; var g=gaps[+el.getAttribute('data-g')];
          if(sel!==null){if(g.piece!==null)pieces[g.piece].at=null;pieces[sel].at=gaps.indexOf(g);g.piece=sel;sel=null;}
          else if(g.piece!==null){pieces[g.piece].at=null;g.piece=null;}
          else return;
          tick();draw();
        }
        el.addEventListener('click',hit);
        el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();hit();}});
      });
      var tray=$('#br-pieces');tray.innerHTML='';
      pieces.forEach(function(p){
        var b=document.createElement('button');b.type='button';b.className='bpiece';b.innerHTML=pieceSVG(p.t);b.setAttribute('aria-label','A '+p.t);b.setAttribute('aria-pressed',String(sel===p.id));
        if(p.at!==null)b.disabled=true;
        b.addEventListener('click',function(){if(busy)return;sel=sel===p.id?null:p.id;tick();draw();});
        tray.appendChild(b);
      });
      $('#br-go').disabled=!gaps.every(function(g){return g.piece!==null;});
    }
    $('#br-go').addEventListener('click',function(){
      if(busy)return; busy=true; this.disabled=true;
      var ok=gaps.every(function(g){return pieces[g.piece].t===g.t;});
      if(ok){rollCart(COLS*BCELL-36);later(function(){finish(true);},1900);}
      else {var c=$('#br-cart');if(c)c.classList.add('wobble');later(function(){finish(false);},1000);}
    });
    draw();
    return;
  }
  if(L===2){
    setSay('A square frame can squash flat, but a triangle stays strong. Make this bridge strong, then count some triangles.');
    rounds(2,function(k,next){
      if(k===0){
        var n=rnd(4,6), braced=[], bw=52, bh=52, W=400, H=230, x0=(W-n*bw)/2, y0=74, busy=false;
        for(var i=0;i<n;i++)braced.push(false);
        braced[rnd(0,n-1)]=true;
        var q='Tap each square to add a beam across it and make two triangles. Then tap Test the bridge.';
        area.innerHTML=roundNote(0,2)+'<div class="panel bridge-wrap" id="br-box"></div><p class="say-small">'+esc(q)+'</p><button class="btn" id="br-go">Test the bridge</button>';
        speak(q);
        function draw(){
          var tp=trussParts('square',n,x0,y0,bw,bh,braced), s='<g class="frame" id="br-frame">'+tp.svg;
          for(var b=0;b<n;b++)s+='<g class="bay" data-b="'+b+'" tabindex="0" role="button" aria-label="Part '+(b+1)+(braced[b]?', has a beam across it, made of triangles':', a square')+'"><rect x="'+(x0+b*bw+6)+'" y="'+(y0+6)+'" width="'+(bw-12)+'" height="'+(bh-12)+'" fill="#fff" fill-opacity="0"/></g>';
          s+='</g>'+cartSVG(x0-40,y0+bh-4);
          $('#br-box').innerHTML='<svg class="brsvg" viewBox="0 0 '+W+' '+H+'" role="group" aria-label="A bridge frame with '+n+' parts">'+bridgeScene(s,x0,x0+n*bw,y0+bh,W,H)+'</svg>';
          $('#br-box').querySelectorAll('.bay').forEach(function(el){
            function hit(){if(busy)return;var b=+el.getAttribute('data-b');braced[b]=!braced[b];tick();draw();}
            el.addEventListener('click',hit);
            el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();hit();}});
          });
        }
        draw();
        $('#br-go').addEventListener('click',function(){
          if(busy)return; busy=true; this.disabled=true;
          if(braced.every(Boolean)){rollCart(n*bw+80);later(function(){next(true);},1900);}
          else {$('#br-frame').classList.add('sway');if(mem.sound)tone(160,0,.5,'triangle',.08);later(function(){next(false);},1500);}
        });
        return;
      }
      var t=rnd(5,9), w2=Math.min(68,320/((t+1)/2)), W2=400, H2=200, x2=(W2-(t+1)*w2/2)/2, tp2=trussParts('warren',t,x2,52,w2,60);
      var q2='How many triangles can you see in this bridge?';
      area.innerHTML=roundNote(1,2)+'<div class="panel bridge-wrap"><svg class="brsvg" viewBox="0 0 '+W2+' '+H2+'" role="img" aria-label="A bridge made of triangles">'+bridgeScene(tp2.svg,x2,x2+tp2.width,112,W2,H2)+'</svg></div><p class="say-small">'+q2+'</p><div class="opts" id="br-opts"></div>';
      speak(q2);
      numOpts($('#br-opts'),t,[t+1,t-1,t+2,2*t],next);
    });
    return;
  }
  setSay('Rivet builds bridges from wooden beams joined into triangles. Count the beams carefully.');
  rounds(2,function(k,next){
    if(k===0){
      var N=rnd(6,10), s='', x=26;
      [1,2,3].forEach(function(t){var tp=trussParts('warren',t,x,34,60,52);s+=tp.svg+'<text x="'+f2(x+tp.width/2)+'" y="122" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="17" font-weight="600" fill="#3B2A4A">'+t+' triangle'+(t>1?'s':'')+'</text><text x="'+f2(x+tp.width/2)+'" y="144" text-anchor="middle" font-family="Nunito, sans-serif" font-size="15" font-weight="800" fill="#8A4F7D">'+(2*t+1)+' beams</text>';x+=tp.width+38;});
      var q='How many beams would Rivet need for a bridge with '+N+' triangles in a row, like this one?';
      var bwN=Math.min(60,340/((N+1)/2)), tpN=trussParts('warren',N,0,0,bwN,46), xN=(400-tpN.width)/2;
      var big='<svg class="brsvg" viewBox="0 0 400 96" role="img" aria-label="A bridge with '+N+' triangles in a row"><rect width="400" height="96" rx="16" fill="#FFF8EC"/><g transform="translate('+f2(xN)+' 14)">'+tpN.svg+'</g><text x="200" y="88" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="16" font-weight="600" fill="#3B2A4A">'+N+' triangles</text></svg>';
      area.innerHTML=roundNote(0,2)+'<div class="panel bridge-wrap"><svg class="brsvg" viewBox="0 0 400 160" role="img" aria-label="Bridges with 1, 2 and 3 triangles use 3, 5 and 7 beams"><rect width="400" height="160" rx="16" fill="#EAF5FC"/>'+s+'</svg></div><p class="say-small">'+esc(q)+'</p><div class="panel bridge-wrap">'+big+'</div><div class="opts" id="br-opts"></div>';
      speak(q);
      numOpts($('#br-opts'),2*N+1,[2*N,2*N+2,3*N,2*N-1],next);
      return;
    }
    var t=rnd(4,6), B=2*t+1+rnd(0,1), sq=Math.max(2,Math.floor((B-1)/3));
    var designs=shuffle([{kind:'warren',n:t,ok:true},{kind:'warren',n:t+2,ok:false},{kind:'square',n:sq,ok:false}]);
    var q2='Rivet has '+B+' beams. Which bridge can she build with them that will be strong?';
    area.innerHTML=roundNote(1,2)+'<p class="say-small">'+esc(q2)+'</p><div class="opts col" id="br-opts"></div>';
    speak(q2);
    designs.forEach(function(d,i){
      var w=d.kind==='warren'?44:52, tp=trussParts(d.kind,d.n,0,0,w,40), W=tp.width+60;
      var svg='<svg viewBox="-30 -14 '+f2(W)+' 70" aria-hidden="true">'+tp.svg+'</svg>';
      var b=optBtn('<span class="brlab">Bridge '+(i+1)+'</span>'+svg,'Bridge '+(i+1),'bropt');
      b.addEventListener('click',function(){$('#br-opts').querySelectorAll('button').forEach(function(x){x.disabled=true;});next(d.ok);});
      $('#br-opts').appendChild(b);
    });
  });
}
/* 4. label the tools */
function pzTools(area,L){ multi(area,L,3,function(R){pzTools1(area,L,R);}); }
function pzTools1(area,L,R){
  if(L===1){
    var all4=['hammer','saw','nut','nail','bolt','screw','drill','ruler'], target=R.fresh(all4), pool=[target].concat(shuffle(all4.filter(function(x){return x!==target;})).slice(0,2));
    setSay('Which picture goes with this word? Tap the word to hear it.');
    area.innerHTML='<button class="bigword wordbtn" id="tw-word" aria-label="The word '+target+'. Tap to hear it.">'+target+'</button><div class="opts" id="tw-opts"></div>';
    $('#tw-word').addEventListener('click',function(){speak(target,true);});
    picOpts($('#tw-opts'),pool,target,function(ok){finish(ok);},function(k){return 'Picture: '+k;});
    return;
  }
  if(L===3){
    var w=R.fresh(['hammer','spanner','pliers','screw','ruler','chisel','drill','anvil','bolt','nail']), all=[];for(var i=0;i<w.length;i++)all.push(i);
    setSay('Spell the name of this tool. Tap the letters in order.');
    area.innerHTML='<div class="pic">'+picSVG2(w,'A tool')+'</div>';
    speller(area,w,all,extraLetters(w,2),function(ok){finish(ok);});
    return;
  }
  var tools=[], toolPool=['hammer','saw','nut','bolt','nail','ruler','drill','spanner','screw','pliers','chisel','anvil'], at={}, sel=null;
  for(var ti=0;ti<3;ti++)tools.push(R.fresh(toolPool));
  setSay('Hang a label under each tool. Tap a word, then tap the space under its tool. Tap Check when every tool has a label.');
  area.innerHTML='<div class="wchips" id="tl-chips" aria-label="Labels"></div><div class="pegboard" id="tl-board"></div><button class="btn" id="tl-check" disabled>Check</button>';
  function used(w){return tools.some(function(t){return at[t]===w;});}
  function render(){
    var chips=$('#tl-chips');chips.innerHTML='';
    var left=shuffleOnce.filter(function(w){return !used(w);});
    if(!left.length)chips.innerHTML='<span class="tray-empty">Every tool has a label. Tap Check.</span>';
    left.forEach(function(w){var b=document.createElement('button');b.type='button';b.className='wchip';b.textContent=w;b.setAttribute('aria-pressed',String(sel===w));b.addEventListener('click',function(){sel=sel===w?null:w;tick();render();});chips.appendChild(b);});
    var board=$('#tl-board');board.innerHTML='';
    tools.forEach(function(t,i){
      var c=document.createElement('div');c.className='tcard';c.innerHTML=picSVG2(t,'Tool '+(i+1));
      var s=document.createElement('button');s.type='button';s.className='tslot'+(at[t]?' fill':'');s.textContent=at[t]||'';s.setAttribute('aria-label','Label for tool '+(i+1)+(at[t]?', says '+at[t]+'. Tap to take it off.':', empty'));
      s.addEventListener('click',function(){if(sel){at[t]=sel;sel=null;}else if(at[t]){delete at[t];}else return;tick();render();});
      c.appendChild(s);board.appendChild(c);
    });
    $('#tl-check').disabled=!tools.every(function(t){return !!at[t];});
  }
  var shuffleOnce=shuffle(tools);
  $('#tl-check').addEventListener('click',function(){this.disabled=true;finish(tools.every(function(t){return at[t]===t;}));});
  render();
}
/* 5. building site jigsaw */
function pzBuildJig(area,L){ jigsawSet(area,L,'rivet',[{key:'build',fn:buildPicture,what:'the building site'}]); }
/* her puzzle pictures (100 x 100), added to the shared picture list; any fairy can use them by name */
Object.assign(PICS2,{
  /* ---------- puzzle pictures (100 x 100) ---------- */
  hammer:'<g transform="rotate(30 50 54)"><rect x="44" y="34" width="12" height="60" rx="5" fill="#C98E5A" stroke="#6A3F22" stroke-width="3"/><path d="M20 16 H78 V38 H20 L12 30 L20 27 L12 22 Z" fill="url(#steelG)" stroke="#4E5868" stroke-width="3" stroke-linejoin="round"/><rect x="40" y="38" width="20" height="8" fill="#6E7888"/></g>',
  saw:'<g transform="rotate(-12 50 50)"><path d="M8 52 L66 38 V66 H8 Z" fill="url(#steelG)" stroke="#4E5868" stroke-width="3" stroke-linejoin="round"/><path d="M8 66 l4 6 l4 -6 l4 6 l4 -6 l4 6 l4 -6 l4 6 l4 -6 l4 6 l4 -6 l4 6 l4 -6 l4 6 l4 -6" stroke="#4E5868" stroke-width="2.5" fill="#AEB7C4" stroke-linejoin="round"/><path d="M64 30 H86 C96 30 96 74 86 74 H64 Z" fill="#C98E5A" stroke="#6A3F22" stroke-width="3"/><ellipse cx="80" cy="52" rx="6" ry="12" fill="#fff"/></g>',
  nut:'<path d="'+ptsPath(regPts(50,50,38,6,0))+'" fill="url(#steelG)" stroke="#4E5868" stroke-width="4" stroke-linejoin="round"/><circle cx="50" cy="50" r="16" fill="#fff" stroke="#4E5868" stroke-width="4"/><path d="M36 50 A14 14 0 0 1 50 36" stroke="#AEB7C4" stroke-width="3" fill="none"/>',
  bolt:'<rect x="28" y="10" width="44" height="22" rx="4" fill="url(#steelG)" stroke="#4E5868" stroke-width="3"/><path d="M42 12 V30 M58 12 V30" stroke="#4E5868" stroke-width="2" opacity=".5"/><rect x="40" y="32" width="20" height="58" rx="3" fill="url(#steelG)" stroke="#4E5868" stroke-width="3"/><path d="M40 44 L60 38 M40 54 L60 48 M40 64 L60 58 M40 74 L60 68 M40 84 L60 78" stroke="#4E5868" stroke-width="2.5"/>',
  nail:'<ellipse cx="50" cy="16" rx="20" ry="6" fill="url(#steelG)" stroke="#4E5868" stroke-width="3"/><path d="M46 22 H54 V78 L50 94 L46 78 Z" fill="url(#steelG)" stroke="#4E5868" stroke-width="3" stroke-linejoin="round"/>',
  drill:'<rect x="14" y="26" width="60" height="30" rx="12" fill="#F7A055" stroke="#B8661E" stroke-width="3"/><rect x="72" y="32" width="12" height="18" rx="3" fill="url(#steelG)" stroke="#4E5868" stroke-width="3"/><path d="M84 41 H97" stroke="#4E5868" stroke-width="4" stroke-linecap="round"/><path d="M30 54 L24 88 H46 L48 54 Z" fill="#3B2A4A" stroke="#1E1428" stroke-width="3" stroke-linejoin="round"/><rect x="47" y="56" width="8" height="12" rx="3" fill="#E8574C"/><circle cx="26" cy="38" r="5" fill="#fff" opacity=".5"/>',
  ruler:'<g transform="rotate(-20 50 50)"><rect x="6" y="38" width="88" height="24" rx="3" fill="#F8CF5A" stroke="#B8861E" stroke-width="3"/><path d="M14 38 V50 M22 38 V45 M30 38 V50 M38 38 V45 M46 38 V50 M54 38 V45 M62 38 V50 M70 38 V45 M78 38 V50 M86 38 V45" stroke="#7A5A10" stroke-width="2"/></g>',
  spanner:'<path d="M26 78 L68 34" stroke="#4E5868" stroke-width="16" stroke-linecap="round"/><path d="M26 78 L68 34" stroke="#C9CFD8" stroke-width="10" stroke-linecap="round"/><circle cx="74" cy="27" r="19" fill="url(#steelG)" stroke="#4E5868" stroke-width="3"/><rect x="67" y="-2" width="14" height="30" rx="2" fill="#fff" transform="rotate(45 74 27)"/><circle cx="24" cy="80" r="13" fill="url(#steelG)" stroke="#4E5868" stroke-width="3"/><circle cx="24" cy="80" r="6" fill="#fff" stroke="#4E5868" stroke-width="2"/>',
  screw:'<path d="M26 12 H74 L62 28 H38 Z" fill="url(#steelG)" stroke="#4E5868" stroke-width="3" stroke-linejoin="round"/><path d="M38 14 H62" stroke="#4E5868" stroke-width="3"/><path d="M40 28 H60 L56 80 L50 94 L44 80 Z" fill="url(#steelG)" stroke="#4E5868" stroke-width="3" stroke-linejoin="round"/><path d="M40 38 L60 32 M41 48 L59 42 M42 58 L58 52 M43 68 L57 62 M44 78 L56 72" stroke="#4E5868" stroke-width="2.5"/>',
  pliers:'<path d="M48 48 L30 92 M52 48 L70 92" stroke="#E8574C" stroke-width="13" stroke-linecap="round"/><path d="M48 48 L30 92 M52 48 L70 92" stroke="#F28C80" stroke-width="5" stroke-linecap="round" opacity=".6"/><path d="M50 48 L38 10 L46 8 L54 46 Z M50 48 L62 10 L54 8 L46 46 Z" fill="url(#steelG)" stroke="#4E5868" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="48" r="7" fill="url(#ggold)" stroke="#9A6A16" stroke-width="2"/>',
  chisel:'<rect x="38" y="52" width="24" height="42" rx="9" fill="#C98E5A" stroke="#6A3F22" stroke-width="3"/><rect x="40" y="46" width="20" height="8" rx="2" fill="#B8861E"/><path d="M43 46 V16 L50 6 L57 16 V46 Z" fill="url(#steelG)" stroke="#4E5868" stroke-width="3" stroke-linejoin="round"/>',
  anvil:'<path d="M10 30 H72 C82 30 90 26 96 20 V36 C90 42 82 46 72 46 L64 58 H70 L76 82 H26 L32 58 H38 L30 46 C20 44 10 40 10 30 Z" fill="url(#ironG)" stroke="#2E3440" stroke-width="3" stroke-linejoin="round"/><path d="M14 32 H70" stroke="#C9CFD8" stroke-width="3" opacity=".6"/>',
  brick:'<path d="M12 44 L30 30 H90 L72 44 Z" fill="#E8907A" stroke="#7A2E1C" stroke-width="3" stroke-linejoin="round"/><path d="M72 44 L90 30 V62 L72 76 Z" fill="#A9432C" stroke="#7A2E1C" stroke-width="3" stroke-linejoin="round"/><rect x="12" y="44" width="60" height="32" fill="url(#brickG)" stroke="#7A2E1C" stroke-width="3"/><ellipse cx="34" cy="37" rx="6" ry="3" fill="#7A2E1C" opacity=".6"/><ellipse cx="56" cy="37" rx="6" ry="3" fill="#7A2E1C" opacity=".6"/>'
});
/* petal icons for her flower (72 x 72) */
Object.assign(PZICON,{
  /* ---------- petal icons (72 x 72) ---------- */
  gears:'<path transform="translate(26 40)" d="'+gearD(10,16,0,5,4)+'" fill="url(#cogCopper)" stroke="#7A3E1A" stroke-width="2" stroke-linejoin="round"/><circle cx="26" cy="40" r="5" fill="#7A3E1A"/><path transform="translate(50.7 25.7)" d="'+gearD(7,11.2,9,5,4)+'" fill="url(#steelG)" stroke="#4E5868" stroke-width="2" stroke-linejoin="round"/><circle cx="50.7" cy="25.7" r="3.5" fill="#4E5868"/>',
  seesaw:'<path d="M36 46 L26 62 H46 Z" fill="url(#ironG)"/><g transform="rotate(-14 36 46)"><rect x="6" y="40" width="60" height="7" rx="3.5" fill="url(#plankG)" stroke="#8A5A30" stroke-width="1.5"/><g transform="translate(46 20) scale(.2)">'+weightPic(5).replace(/<text[^]*<\/text>/,'')+'</g><g transform="translate(10 30) scale(.12)">'+PICS2.feather+'</g></g>',
  bridge:'<rect x="2" y="56" width="68" height="12" rx="4" fill="#4FA9DE" opacity=".7"/>'+trussParts('warren',4,8,26,22,24).svg.replace(/stroke-width="9"/g,'stroke-width="6"').replace(/stroke-width="4.5"/g,'stroke-width="3"').replace(/r="4.5"/g,'r="3"'),
  tools:'<g transform="translate(-4 2) scale(.72)">'+PICS2.hammer+'</g><g transform="translate(22 6) scale(.6)">'+PICS2.spanner.replace(/fill="#fff"/g,'fill="#fff"')+'</g>',
  buildjig:'<path d="M12 22 h14 a6 6 0 1 1 12 0 h14 v14 a6 6 0 1 0 0 12 v14 h-14 a6 6 0 1 1 -12 0 h-14 Z" fill="#E8A23A" stroke="#B8661E" stroke-width="3" stroke-linejoin="round"/><path transform="translate(32 41)" d="'+gearD(8,9,0,4,3)+'" fill="#fff" stroke="#B8661E" stroke-width="1.5"/>'
});
/* ---------- Rivet ---------- */
FAIRIES.rivet={id:'rivet',name:'Rivet',kind:'Engineer fairy',place:"Rivet's cog mill",art:rivetArt,body:cogBody,houseLabel:"Rivet's cog-wheel cottage",tapClass:'whirring',tapMs:2600,onTap:houseWhirr,
  facts:[
    'When one gear turns, the gear touching it turns the other way.',
    'A big gear turning a little gear makes the little gear spin faster.',
    'A waterwheel is pushed round by moving water. Long ago, waterwheels turned heavy stones that ground wheat into flour.',
    'Triangles are very strong shapes, so engineers use lots of them to build bridges and cranes.',
    'A seesaw is a lever. A lever can help you lift something heavy by pushing down on the other end.'
  ],
  scene:millScene,base:'#94CC76',foundBg:'#FBEEDF',
  foundGround:'<ellipse cx="170" cy="340" rx="150" ry="20" fill="#B9E49C"/><path d="M44 346 C100 338 240 354 296 344" stroke="#7DBDE6" stroke-width="8" fill="none" stroke-linecap="round"/>',
  thanks:'Thank you for getting my mill wheel turning again.',jigThings:['hammer','saw','spanner','drill','ruler','nut'],
  icon:'<path transform="translate(50 52)" d="'+gearD(10,25,0,8,4)+'" fill="#fff"/><circle cx="50" cy="52" r="9" fill="#D4825A"/>',
  flowerBase:function(){
    return '<ellipse cx="340" cy="676" rx="300" ry="42" fill="#7DBDE6" opacity=".6"/><path d="M90 676 q30 -10 60 0 t60 0 M420 690 q30 -10 60 0 t60 0" stroke="#fff" stroke-width="4" fill="none" opacity=".55"/>' +
      '<path d="M340 380 C330 460 352 540 340 606" stroke="#2F6B2C" stroke-width="18" fill="none" stroke-linecap="round"/>' +
      '<path d="M340 380 C330 460 352 540 340 606" stroke="#4E9F45" stroke-width="11" fill="none" stroke-linecap="round"/>' +
      '<path d="M342 560 C382 524 432 528 452 546 C420 582 372 584 342 560 Z" fill="url(#ptleaf)" stroke="#2F6B2C" stroke-width="2.5"/>' +
      '<rect x="272" y="598" width="136" height="74" rx="6" fill="url(#plankG)" stroke="#8A5A30" stroke-width="3"/><path d="M272 622 H408 M272 646 H408" stroke="#8A5A30" stroke-width="2" opacity=".6"/><path d="M280 604 L400 666 M400 604 L280 666" stroke="#8A5A30" stroke-width="5" opacity=".7"/>' +
      '<g transform="translate(442 640)"><path d="'+gearD(10,26,0,7,4)+'" fill="url(#cogBrass)" stroke="#8A5E14" stroke-width="2.5" stroke-linejoin="round"/><circle r="8" fill="#8A5E14"/></g>' +
      '<g transform="translate(236 654)"><path d="'+gearD(8,16,10,6,3)+'" fill="url(#steelG)" stroke="#4E5868" stroke-width="2" stroke-linejoin="round"/><circle r="5" fill="#4E5868"/></g>';
  },
  puz:[
    {id:'gears',titles:['Turn the waterwheel','Which way?','Gear chains'],run:pzGears},
    {id:'seesaw',titles:['Heavy or light','Balance the seesaw','Missing weights'],run:pzSeesaw},
    {id:'bridge',titles:['Fill the bridge','Strong triangles','Beam builder'],run:pzBridge},
    {id:'tools',titles:['Tool words','Label the tools','Spell the tools'],run:pzTools},
    {id:'buildjig',titles:['Building jigsaw','Building jigsaw','Building jigsaw'],run:pzBuildJig}
  ]};
FAIRY_ORDER.push('rivet');
