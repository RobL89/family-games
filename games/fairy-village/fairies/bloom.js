/* Bloom, the Flower fairy: her art, tulip cottage, forest glade, facts, puzzles
   (jigsaw, petal pattern, plant the seeds, garden words, sort the flowers) and her FAIRIES entry.
   Her internal id is 'petal' (kept so saves still work). */
'use strict';
function tulipArt(){return houseGround()+tulipBody();}
function tulipBody(){
  return '<path d="M66 180 C44 160 38 120 50 96 C60 124 70 152 72 180 Z" fill="url(#ptleaf)"/>' +
  '<path d="M154 180 C176 160 182 120 170 96 C160 124 150 152 148 180 Z" fill="url(#ptleaf)"/>' +
  '<path d="M78 112 C76 72 92 46 110 40 C128 46 144 72 142 112 Z" fill="url(#ptback)"/>' +
  '<g class="bee"><ellipse cx="104" cy="58" rx="5" ry="3.5" fill="#fff" opacity=".9"/><ellipse cx="109" cy="66" rx="8" ry="6" fill="url(#ggold)"/><path d="M107 60.5 V71.5 M112 61 V71" stroke="#3B2A4A" stroke-width="2"/></g>' +
  '<path class="pl" d="M60 176 C52 140 54 100 66 76 C74 62 88 56 96 62 C104 72 108 110 106 176 Z" fill="url(#ptleft)"/>' +
  '<path class="pr" d="M160 176 C168 140 166 100 154 76 C146 62 132 56 124 62 C116 72 112 110 114 176 Z" fill="url(#ptright)"/>' +
  '<path d="M78 178 C70 140 72 98 86 74 C96 58 124 58 134 74 C148 98 150 140 142 178 A32 6 0 0 1 78 178 Z" fill="url(#ptfront)"/>' +
  '<path d="M78 178 C70 140 72 98 86 74 C96 58 124 58 134 74 C148 98 150 140 142 178" stroke="#B8467A" stroke-width="1.5" fill="none" opacity=".5"/>' +
  '<path d="M110 66 V150 M98 70 C92 96 90 124 92 150 M122 70 C128 96 130 124 128 150" stroke="#D45E8E" stroke-width="1" fill="none" opacity=".35"/>' +
  '<path d="M90 84 C82 104 80 130 82 160" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none" opacity=".35" filter="url(#fsoft)"/>' +
  '<circle cx="94" cy="122" r="10" fill="#B84677"/><circle cx="94" cy="122" r="7.5" fill="url(#gglass)"/>' +
  '<path d="M90 119 A5 5 0 0 1 94 116.5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>' +
  '<circle cx="126" cy="122" r="10" fill="#B84677"/><circle cx="126" cy="122" r="7.5" fill="url(#gglass)"/>' +
  '<path d="M122 119 A5 5 0 0 1 126 116.5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>' +
  '<path d="M97 180 V160 A13 13 0 0 1 123 160 V180 A13 3 0 0 1 97 180 Z" fill="#B8861E"/>' +
  '<path d="M100 180 V161 A10 10 0 0 1 120 161 V180 A10 2.5 0 0 1 100 180 Z" fill="url(#gdoorgold)"/>' +
  '<circle cx="116" cy="171" r="2" fill="#B84677"/>';
}
function petalArt(noShadow){
  return (noShadow?'':'<ellipse cx="120" cy="308" rx="44" ry="7" fill="#C24C7E" opacity=".22" filter="url(#fshadow)"/>') +
  '<g class="wings">' +
  '<path d="M112 150 C84 100 40 104 42 136 C44 166 88 168 112 158 Z" fill="url(#wingPetal)" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '<path d="M112 166 C82 172 60 200 72 220 C86 238 112 204 116 174 Z" fill="url(#wingPetal)" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '<path d="M128 150 C156 100 200 104 198 136 C196 166 152 168 128 158 Z" fill="url(#wingPetal)" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '<path d="M128 166 C158 172 180 200 168 220 C154 238 128 204 124 174 Z" fill="url(#wingPetal)" stroke="#fff" stroke-opacity=".85" stroke-width="1.5"/>' +
  '<path d="M112 152 C92 132 70 122 52 124 M112 156 C92 152 70 150 54 148 M114 172 C100 186 88 200 80 212 M128 152 C148 132 170 122 188 124 M128 156 C148 152 170 150 186 148 M126 172 C140 186 152 200 160 212" stroke="#fff" stroke-width="1" fill="none" opacity=".6"/>' +
  '</g>' +
  '<rect x="106" y="230" width="11" height="36" rx="5.5" fill="url(#leafLegs)"/><rect x="123" y="230" width="11" height="36" rx="5.5" fill="url(#leafLegs)"/>' +
  '<path d="M100 262 H118 V269 C118 275 112 278 104 278 C96 278 94 272 100 262 Z" fill="url(#slipperPink)"/>' +
  '<path d="M122 262 H140 C146 272 144 278 136 278 C128 278 122 275 122 269 Z" fill="url(#slipperPink)"/>' +
  '<path d="M104 152 C100 152 98 160 99 170 L101 182 Q120 188 139 182 L141 170 C142 160 140 152 136 152 Z" fill="url(#ptleaf)"/>' +
  '<path d="M104 152 C96 148 88 152 86 160 C94 162 100 160 104 156 Z M136 152 C144 148 152 152 154 160 C146 162 140 160 136 156 Z" fill="url(#ptleaf)"/>' +
  '<path d="M120 178 C96 178 84 196 84 216 C84 236 96 244 104 238 C112 230 114 200 120 178 Z" fill="url(#ptleft)"/>' +
  '<path d="M120 178 C144 178 156 196 156 216 C156 236 144 244 136 238 C128 230 126 200 120 178 Z" fill="url(#ptright)"/>' +
  '<path d="M120 178 C104 182 98 204 100 224 C102 240 112 248 120 248 C128 248 138 240 140 224 C142 204 136 182 120 178 Z" fill="url(#ptfront)"/>' +
  '<path d="M110 192 C106 204 106 220 110 234" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".35" filter="url(#fsoft)"/>' +
  '<path d="M104 164 C94 172 86 182 82 190" stroke="#B57650" stroke-width="10" fill="none" stroke-linecap="round"/>' +
  '<path d="M66 200 H88 V216 A3 3 0 0 1 85 219 H69 A3 3 0 0 1 66 216 Z" fill="url(#canBlue)"/>' +
  '<path d="M70 200 C70 189 84 189 84 200" stroke="#4E86B0" stroke-width="2.5" fill="none"/>' +
  '<path d="M88 206 L102 196 L104 199 L90 211 Z" fill="#4E86B0"/><circle cx="104" cy="197" r="3" fill="#4E86B0"/>' +
  '<circle cx="80" cy="192" r="6" fill="url(#skinD)"/>' +
  '<g class="arm"><path d="M136 164 C150 158 158 148 162 138" stroke="#B57650" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="163" cy="136" r="6" fill="url(#skinD)"/></g>' +
  '<rect x="114" y="138" width="12" height="16" rx="4" fill="#9E6442"/>' +
  '<g fill="url(#hairDark)"><circle cx="82" cy="106" r="16"/><circle cx="86" cy="132" r="14"/><circle cx="158" cy="106" r="16"/><circle cx="154" cy="132" r="14"/><circle cx="96" cy="76" r="18"/><circle cx="144" cy="76" r="18"/><circle cx="120" cy="68" r="20"/></g>' +
  '<circle cx="120" cy="108" r="40" fill="url(#skinD)"/>' +
  '<g fill="url(#hairDark)"><circle cx="94" cy="84" r="10"/><circle cx="108" cy="77" r="10"/><circle cx="122" cy="75" r="10"/><circle cx="136" cy="78" r="10"/><circle cx="147" cy="86" r="9"/></g>' +
  '<path d="M100 76 C108 70 118 68 128 69" stroke="#fff" stroke-width="3" opacity=".25" stroke-linecap="round" fill="none"/>' +
  '<g transform="rotate(-10 120 60)"><path d="M120 40 C121 32 126 26 132 24" stroke="#4E9F45" stroke-width="3" fill="none" stroke-linecap="round"/>' +
  '<path d="M104 62 C98 48 102 38 110 36 C108 46 108 54 112 62 Z" fill="url(#ptleft)"/>' +
  '<path d="M136 62 C142 48 138 38 130 36 C132 46 132 54 128 62 Z" fill="url(#ptright)"/>' +
  '<path d="M106 64 C102 48 110 36 120 36 C130 36 138 48 134 64 Z" fill="url(#ptfront)"/>' +
  '<path d="M110 46 C108 52 108 58 110 62" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".4"/></g>' +
  '<path d="M99 102 Q105 98 111 101 M129 101 Q135 98 141 102" stroke="#2A1810" stroke-width="2" fill="none" stroke-linecap="round"/>' +
  '<ellipse cx="106" cy="115" rx="5.5" ry="7" fill="#2A1810"/><ellipse cx="134" cy="115" rx="5.5" ry="7" fill="#2A1810"/>' +
  '<circle cx="108" cy="112" r="2" fill="#fff"/><circle cx="136" cy="112" r="2" fill="#fff"/>' +
  '<path d="M100 110 L97 107 M140 110 L143 107" stroke="#2A1810" stroke-width="1.5" stroke-linecap="round"/>' +
  '<ellipse cx="95" cy="127" rx="7" ry="4.5" fill="#E8708F" opacity=".4"/><ellipse cx="145" cy="127" rx="7" ry="4.5" fill="#E8708F" opacity=".4"/>' +
  '<path d="M112 128 Q120 135 128 128" stroke="#6E2E22" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
}
function picSVG(word){
  var inner = word==='flower' ? PICS.flower + flowerG(50,36,30,'pink',6) : PICS[word];
  return '<svg viewBox="0 0 100 100" role="img" aria-label="'+esc(word)+'">'+inner+'</svg>';
}
/* the garden picture used by the jigsaw (an image, so it carries its own gradients) */
function gardenPicture(){
  var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">' + DEFS +
  '<rect width="600" height="320" fill="url(#vsky)"/>' +
  '<g stroke="#F0B43A" stroke-width="8" stroke-linecap="round"><path d="M500 22v20M500 138v20M432 90h20M548 90h20M452 42l14 14M534 124l14 14M548 42l-14 14M466 124l-14 14"/></g>' +
  '<circle cx="500" cy="90" r="40" fill="#F8CF5A" stroke="#E0A42A" stroke-width="4"/>' +
  '<g fill="#fff"><ellipse cx="120" cy="70" rx="50" ry="20"/><ellipse cx="156" cy="56" rx="32" ry="22"/><ellipse cx="90" cy="62" rx="26" ry="16"/><ellipse cx="330" cy="120" rx="40" ry="15"/><ellipse cx="356" cy="108" rx="24" ry="16"/></g>' +
  '<path d="M0 280 C120 210 260 240 330 262 C430 220 520 228 600 260 V340 H0 Z" fill="#9FD283"/>' +
  '<rect y="300" width="600" height="300" fill="url(#vmeadow)"/>' +
  '<path d="M300 600 C300 520 250 470 190 430" stroke="#E6CC98" stroke-width="54" fill="none" stroke-linecap="round"/>' +
  '<path d="M300 600 C300 520 250 470 190 430" stroke="#F3E2BC" stroke-width="38" fill="none" stroke-linecap="round"/>';
  for(var x=330;x<600;x+=34){ s+='<path d="M'+x+' 382 V322 L'+(x+11)+' 308 L'+(x+22)+' 322 V382 Z" fill="#FFF8EE" stroke="#C9B48E" stroke-width="2"/>'; }
  s += '<rect x="322" y="334" width="278" height="9" fill="#F2E6CC"/><rect x="322" y="362" width="278" height="9" fill="#F2E6CC"/>';
  s += '<g transform="translate(40 150) scale(1.45)">' + tulipArt() + '</g>';
  var cols = ['red','yellow','purple','blue','orange','pink'];
  for(var i=0;i<7;i++){ var fx=360+i*36, fy=420+(i%2)*14; s+='<path d="M'+fx+' '+fy+' V'+(fy+46)+'" stroke="#3F8A3A" stroke-width="4"/>'+flowerG(fx,fy,17,cols[i%6],5+(i%3)); }
  for(var j=0;j<9;j++){ var gx=30+j*66, gy=540+(j%2)*18; s+='<path d="M'+gx+' '+gy+' V'+(gy+60)+'" stroke="#3F8A3A" stroke-width="4"/><path d="M'+gx+' '+(gy+34)+' C'+(gx-14)+' '+(gy+24)+' '+(gx-20)+' '+(gy+30)+' '+(gx-22)+' '+(gy+36)+' C'+(gx-12)+' '+(gy+42)+' '+(gx-4)+' '+(gy+40)+' '+gx+' '+(gy+34)+' Z" fill="#6DBE5A"/>'+flowerG(gx,gy,22,cols[(j+2)%6],6+(j%3)); }
  s += '<g transform="translate(410 230)"><ellipse cx="-14" cy="-8" rx="16" ry="11" fill="#B3A4F0" stroke="#6C5BC4" stroke-width="2" transform="rotate(-30 -14 -8)"/><ellipse cx="14" cy="-8" rx="16" ry="11" fill="#B3A4F0" stroke="#6C5BC4" stroke-width="2" transform="rotate(30 14 -8)"/><ellipse cx="-11" cy="10" rx="10" ry="7" fill="#F7A055" stroke="#B8661E" stroke-width="2"/><ellipse cx="11" cy="10" rx="10" ry="7" fill="#F7A055" stroke="#B8661E" stroke-width="2"/><rect x="-3" y="-14" width="6" height="30" rx="3" fill="#3B2A4A"/></g>';
  s += '<g transform="translate(420 470) scale(1.1)"><path d="M0 0 H44 V32 A4 4 0 0 1 40 36 H4 A4 4 0 0 1 0 32 Z" fill="url(#canBlue)"/><path d="M8 0 C8 -18 36 -18 36 0" stroke="#4E86B0" stroke-width="4" fill="none"/><path d="M44 10 L70 -8 L74 -3 L48 18 Z" fill="#4E86B0"/></g>';
  s += '</svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
}
var FACTS = [
  'Bees visit flowers to drink sweet nectar. They carry pollen from flower to flower, and that helps new seeds grow.',
  'Daisies close their petals at night and open them in the morning. Their name comes from "day\'s eye".',
  'Young sunflowers turn their faces to follow the sun across the sky.',
  'A tulip keeps growing a little taller even after it is picked and put in a vase.',
  'Seeds need water and warmth to start growing. Then the new plant needs light.'
];
/* Bloom's world: a sunny forest glade (used behind the garden and her puzzles). Drawn once as an image. */
function forestScene(){
  function ri(i,a,b){var x=Math.sin(i*12.9898+a*78.233)*43758.5453;return x-Math.floor(x);}
  var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMax slice"><defs>' +
  '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B7DFC0"/><stop offset=".5" stop-color="#E6F5DA"/><stop offset="1" stop-color="#D6EEC2"/></linearGradient>' +
  '<radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFFBE2"/><stop offset=".5" stop-color="#FFF7D0" stop-opacity=".6"/><stop offset="1" stop-color="#FFF7D0" stop-opacity="0"/></radialGradient>' +
  '<linearGradient id="ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
  '<radialGradient id="cfar" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#D2ECC0"/><stop offset="1" stop-color="#A5D19A"/></radialGradient>' +
  '<radialGradient id="cmid" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#B1E294"/><stop offset="1" stop-color="#66AD58"/></radialGradient>' +
  '<radialGradient id="cnear" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#93D577"/><stop offset="1" stop-color="#3B7B37"/></radialGradient>' +
  '<linearGradient id="trunk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B17E55"/><stop offset=".45" stop-color="#8A5A34"/><stop offset="1" stop-color="#55331B"/></linearGradient>' +
  '<linearGradient id="tmid" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C7A27C"/><stop offset="1" stop-color="#8F6C4A"/></linearGradient>' +
  '<linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C2E6A4"/><stop offset="1" stop-color="#84C467"/></linearGradient>' +
  '<radialGradient id="bush" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#A3DC88"/><stop offset="1" stop-color="#4A9343"/></radialGradient>' +
  '<radialGradient id="cap" cx=".35" cy=".25" r=".85"><stop offset="0" stop-color="#FF8F7A"/><stop offset=".45" stop-color="#E2463C"/><stop offset="1" stop-color="#9C241C"/></radialGradient>' +
  '<linearGradient id="stem" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFFCF4"/><stop offset="1" stop-color="#D9BE96"/></linearGradient>' +
  '<filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>' +
  '</defs>';
  s+='<rect width="1200" height="900" fill="url(#sky)"/><ellipse cx="620" cy="110" rx="380" ry="260" fill="url(#sun)"/>';
  // far trees
  for(var i=0;i<16;i++){
    var x=i*80+ri(i,1)*30-10, top=150+ri(i,2)*90, r=48+ri(i,3)*26;
    s+='<rect x="'+f2(x-7)+'" y="'+f2(top)+'" width="14" height="'+f2(620-top)+'" fill="#B7CDA6"/>' +
      '<circle cx="'+f2(x)+'" cy="'+f2(top)+'" r="'+f2(r)+'" fill="url(#cfar)"/><circle cx="'+f2(x-r*.6)+'" cy="'+f2(top+r*.5)+'" r="'+f2(r*.7)+'" fill="url(#cfar)"/><circle cx="'+f2(x+r*.6)+'" cy="'+f2(top+r*.45)+'" r="'+f2(r*.72)+'" fill="url(#cfar)"/>';
  }
  // sun rays
  [[540,600,330,180],[650,700,520,410],[760,800,720,630],[870,890,930,860]].forEach(function(r){s+='<polygon points="'+r[0]+',0 '+r[1]+',0 '+r[2]+',760 '+r[3]+',760" fill="url(#ray)" opacity=".7"/>';});
  // middle trees
  [[320,150,.95],[455,120,.8],[770,130,.85],[905,160,1]].forEach(function(t,k){
    var x=t[0], y=t[1], q=t[2];
    s+='<path d="M'+(x-20*q)+' 660 C'+(x-18*q)+' 520 '+(x-14*q)+' 360 '+(x-12*q)+' '+y+' H'+(x+12*q)+' C'+(x+14*q)+' 360 '+(x+18*q)+' 520 '+(x+20*q)+' 660 Q'+(x+34*q)+' 672 '+(x+44*q)+' 676 H'+(x-44*q)+' Q'+(x-34*q)+' 672 '+(x-20*q)+' 660 Z" fill="url(#tmid)"/>';
    [[0,0,92],[-70,40,64],[70,34,70],[-30,-50,60],[40,-44,58]].forEach(function(c){s+='<circle cx="'+f2(x+c[0]*q)+'" cy="'+f2(y+c[1]*q)+'" r="'+f2(c[2]*q)+'" fill="url(#cmid)"/>';});
    s+='<ellipse cx="'+f2(x-30*q)+'" cy="'+f2(y-34*q)+'" rx="'+f2(30*q)+'" ry="'+f2(16*q)+'" fill="#fff" opacity=".22"/>';
  });
  // ground and path into the glade
  s+='<path d="M0 640 C200 600 420 622 600 608 C800 596 1000 616 1200 600 V900 H0 Z" fill="url(#gnd)"/>' +
    '<path d="M448 900 C510 820 640 790 600 720 C574 674 604 640 650 616 L676 618 C640 642 628 676 656 722 C704 800 652 846 720 900 Z" fill="#F2E4C2" stroke="#DCC492" stroke-width="4"/>' +
    '<path d="M560 860 C590 830 630 812 630 790 M640 700 C632 680 640 660 660 640" stroke="#fff" stroke-width="5" opacity=".35" fill="none" stroke-linecap="round"/>';
  // glade flowers and a ring of tiny toadstools
  for(var g=0;g<14;g++){var gx=470+g*20+ri(g,4)*12, gy=628+ri(g,5)*30; s+='<path d="M'+f2(gx)+' '+f2(gy)+' v14" stroke="#4E9140" stroke-width="2"/>'+flowerG(f2(gx),f2(gy),8,FCOL[g%6],5);}
  [[540,668],[566,676],[598,680],[704,676],[732,668],[756,660]].forEach(function(m){s+='<path d="M'+(m[0]-3)+' '+m[1]+' v-10 h6 v10 Z" fill="url(#stem)"/><path d="M'+(m[0]-10)+' '+(m[1]-9)+' A10 8 0 0 1 '+(m[0]+10)+' '+(m[1]-9)+' Z" fill="url(#cap)"/><circle cx="'+(m[0]-3)+'" cy="'+(m[1]-13)+'" r="1.6" fill="#fff"/>';});
  // big framing trees, left and right
  function bigTree(flip){
    var t='<g'+(flip?' transform="translate(1200 0) scale(-1 1)"':'')+'>';
    t+='<path d="M20 900 C70 868 96 826 104 760 C112 600 112 300 120 0 H246 C252 300 252 600 258 760 C264 826 292 868 352 900 Z" fill="url(#trunk)"/>' +
      '<path d="M140 0 C138 260 136 520 132 780" stroke="#C99A6E" stroke-width="10" opacity=".45" fill="none" stroke-linecap="round"/>' +
      '<path d="M200 60 C198 120 204 170 200 230 M168 330 C170 380 164 430 168 470 M222 420 C224 480 218 540 222 600 M176 620 C178 660 172 700 176 730" stroke="#4E2E17" stroke-width="5" opacity=".45" fill="none" stroke-linecap="round"/>';
    if(!flip){
      t+='<path d="M150 820 V770 A28 28 0 0 1 206 770 V820 Z" fill="#4E2E1B"/><path d="M155 820 V772 A23 23 0 0 1 201 772 V820 Z" fill="#B87A48"/><path d="M178 752 V820" stroke="#8A5530" stroke-width="2.5"/><circle cx="194" cy="790" r="3.2" fill="url(#cap)"/>' +
        '<circle cx="178" cy="736" r="10" fill="#4E2E1B"/><circle cx="178" cy="736" r="7" fill="#FBE38A"/><path d="M140 822 H216" stroke="#7A4E2A" stroke-width="5" stroke-linecap="round"/>';
    }
    [[40,30,190],[250,10,160],[360,110,120],[160,200,140],[-20,230,130],[320,240,90]].forEach(function(c){t+='<circle cx="'+c[0]+'" cy="'+c[1]+'" r="'+c[2]+'" fill="url(#cnear)"/>';});
    t+='<ellipse cx="200" cy="70" rx="70" ry="30" fill="#fff" opacity=".18"/><ellipse cx="330" cy="150" rx="40" ry="18" fill="#fff" opacity=".18"/>';
    // bush, mushrooms and ferns at the roots
    t+='<circle cx="330" cy="830" r="54" fill="url(#bush)"/><circle cx="392" cy="846" r="42" fill="url(#bush)"/><circle cx="286" cy="860" r="40" fill="url(#bush)"/>';
    t+=flowerG(318,808,11,flip?'yellow':'pink',5)+flowerG(372,826,10,flip?'purple':'yellow',5)+flowerG(408,846,9,flip?'pink':'blue',6);
    t+='<path d="M420 896 v-30 h16 v30 Z" fill="url(#stem)"/><path d="M398 870 A30 22 0 0 1 458 870 Z" fill="url(#cap)"/><circle cx="414" cy="858" r="4" fill="#fff"/><circle cx="438" cy="862" r="3.5" fill="#fff"/><circle cx="428" cy="851" r="3" fill="#fff"/>';
    t+='<path d="M462 898 v-18 h10 v18 Z" fill="url(#stem)"/><path d="M450 882 A17 13 0 0 1 484 882 Z" fill="url(#cap)"/><circle cx="462" cy="875" r="2.5" fill="#fff"/>';
    return t+'</g>';
  }
  s+=bigTree(false)+bigTree(true);
  // front flowers and grass
  for(var j=0;j<18;j++){
    var fx=20+j*68+ri(j,6)*20, fy=850+ri(j,7)*24;
    if(fx>250&&fx<480||fx>720&&fx<950){continue;}
    s+='<path d="M'+f2(fx)+' '+f2(fy)+' V900" stroke="#3F8A3A" stroke-width="4"/><path d="M'+f2(fx)+' '+f2(fy+26)+' c-14 -10 -22 -4 -24 2 c10 6 18 4 24 -2 Z" fill="#6DBE5A"/>'+flowerG(f2(fx),f2(fy),16+ri(j,8)*6,FCOL[(j+1)%6],5+(j%3));
  }
  for(var k=0;k<26;k++){var gx2=ri(k,9)*1200, gy2=700+ri(k,10)*190; s+='<path d="M'+f2(gx2)+' '+f2(gy2)+' q-4 -14 -10 -20 M'+f2(gx2)+' '+f2(gy2)+' q1 -16 4 -24 M'+f2(gx2)+' '+f2(gy2)+' q6 -12 12 -16" stroke="#5FA34D" stroke-width="3" fill="none" stroke-linecap="round"/>';}
  // butterflies and sparkles
  [[520,420,1],[812,486,.8]].forEach(function(b){s+='<g transform="translate('+b[0]+' '+b[1]+') scale('+b[2]+') rotate(-12)"><ellipse cx="-12" cy="-7" rx="14" ry="10" fill="#B3A4F0" stroke="#6C5BC4" stroke-width="2" transform="rotate(-30 -12 -7)"/><ellipse cx="12" cy="-7" rx="14" ry="10" fill="#B3A4F0" stroke="#6C5BC4" stroke-width="2" transform="rotate(30 12 -7)"/><ellipse cx="-9" cy="9" rx="9" ry="6" fill="#F7A055" stroke="#B8661E" stroke-width="2"/><ellipse cx="9" cy="9" rx="9" ry="6" fill="#F7A055" stroke="#B8661E" stroke-width="2"/><rect x="-2.5" y="-12" width="5" height="26" rx="2.5" fill="#3B2A4A"/></g>';});
  [[420,560],[690,520],[880,600],[600,470],[380,700],[860,720],[520,560],[760,420]].forEach(function(f,i2){s+='<circle cx="'+f[0]+'" cy="'+f[1]+'" r="10" fill="#FFF3A0" opacity=".55" filter="url(#bl)"/><circle cx="'+f[0]+'" cy="'+f[1]+'" r="'+(3+i2%2)+'" fill="#FFF6B8"/>';});
  s+='</svg>';
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
}
/* 2. petal pattern */
function same(a,b){return a.c===b.c&&a.n===b.n;}
function pzPattern(area,L){
  var p=shuffle(FCOL), seq=[], miss, opts, ans;
  if(L===1){
    for(var i=0;i<7;i++)seq.push({c:i%2?p[1]:p[0],n:5});
    miss=6; ans=seq[6]; opts=[ans,{c:p[1],n:5},{c:p[2],n:5}];
  } else if(L===2){
    var t=pick(['ABC','AAB','ABB','AABB']), map={A:p[0],B:p[1],C:p[2]};
    for(var j=0;j<8;j++)seq.push({c:map[t[j%t.length]],n:5});
    miss=rnd(3,7); ans=seq[miss];
    opts=[{c:p[0],n:5},{c:p[1],n:5},{c:(t==='ABC'?p[2]:p[3]),n:5}];
  } else if(Math.random()<.5){
    var s=rnd(2,3), d=rnd(1,2);
    for(var k=0;k<5;k++)seq.push({c:k%2?p[1]:p[0],n:s+k*d});
    miss=pick([2,4]); ans=seq[miss];
    var cand=[ans.n+d,ans.n-d,ans.n+1,ans.n-1,ans.n+2].filter(function(x){return x>=2&&x!==ans.n;});
    var uniq=[]; cand.forEach(function(x){if(uniq.indexOf(x)<0)uniq.push(x);});
    opts=[ans].concat(shuffle(uniq).slice(0,3).map(function(x){return {c:ans.c,n:x};}));
  } else {
    var cyc=pick([[3,5,7],[4,5,6],[4,6,8]]);
    for(var m=0;m<8;m++)seq.push({c:m%2?p[1]:p[0],n:cyc[m%3]});
    miss=rnd(4,7); ans=seq[miss];
    var oc=ans.c===p[0]?p[1]:p[0], on=cyc.filter(function(x){return x!==ans.n;})[0];
    opts=[ans,{c:oc,n:ans.n},{c:ans.c,n:on},{c:oc,n:on}];
  }
  opts=shuffle(opts);
  var last=miss===seq.length-1;
  setSay(L===3?(last?'Look at the colours and the petals. Which flower comes next?':'Look at the colours and the petals. Which flower is missing?'):(last?'Which flower comes next?':'Which flower is missing?'));
  var h='<div class="seq" role="list" aria-label="Flower pattern">';
  seq.forEach(function(f,i){h+= i===miss?'<div class="cell q" role="listitem" aria-label="Missing flower">?</div>':'<div class="cell" role="listitem">'+flowerSVG(f)+'</div>';});
  h+='</div><div class="opts" id="pt-opts"></div>';
  area.innerHTML=h;
  var box=$('#pt-opts');
  opts.forEach(function(o){
    var b=document.createElement('button'); b.type='button'; b.className='opt'; b.innerHTML=flowerSVG(o);
    b.setAttribute('aria-label','Choose the '+flowerLabel(o));
    b.addEventListener('click',function(){finish(same(o,ans));});
    box.appendChild(b);
  });
}
/* 3. seeds */
function packetSVG(){
  return '<svg class="packet tap" id="sd-packet" viewBox="0 0 140 184" tabindex="0" role="button" aria-label="Seed packet. Tap to plant a seed.">' +
    '<ellipse cx="72" cy="176" rx="54" ry="6" fill="#2F4A2A" opacity=".2" filter="url(#fsoft)"/>' +
    '<path d="M14 28 H126 L122 168 Q70 176 18 168 Z" fill="url(#packetG)" stroke="#B8925C" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<path d="M14 28 L18 18 L24 28 L30 18 L36 28 L42 18 L48 28 L54 18 L60 28 L66 18 L72 28 L78 18 L84 28 L90 18 L96 28 L102 18 L108 28 L114 18 L120 28 L126 18 L126 34 H14 Z" fill="#EBD39C" stroke="#B8925C" stroke-width="2" stroke-linejoin="round"/>' +
    '<rect x="27" y="44" width="86" height="76" rx="12" fill="#DDF1F9" stroke="#8CC46E" stroke-width="3"/>' +
    '<path d="M29 100 C50 92 90 92 111 100 V108 A10 10 0 0 1 101 118 H39 A10 10 0 0 1 29 108 Z" fill="#9FD283"/>' +
    '<path d="M70 112 V78" stroke="#3F8A3A" stroke-width="4" stroke-linecap="round"/><path d="M70 100 C60 92 52 94 50 98 C56 104 64 104 70 100 Z M70 94 C80 86 88 88 90 92 C84 98 76 98 70 94 Z" fill="#6DBE5A"/>' +
    flowerG(70,72,22,'pink',6) +
    '<rect x="22" y="128" width="96" height="30" rx="8" fill="#B8467A"/>' +
    '<text x="70" y="150" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="20" font-weight="600" fill="#fff" letter-spacing="2">SEEDS</text>' +
    '<path d="M24 40 C22 80 22 130 26 160" stroke="#fff" stroke-width="7" opacity=".45" fill="none" stroke-linecap="round"/>' +
    '<path d="M118 36 L114 164" stroke="#8A6A3A" stroke-width="5" opacity=".18" fill="none" stroke-linecap="round"/>' +
    '</svg>';
}
function bedSVG(rows,cols){
  var sp=24, w=cols*sp+20, h=rows*sp+20, s='<svg class="bed" viewBox="0 0 '+w+' '+h+'" style="width:'+Math.min(cols*36+30,720)+'px" role="img" aria-label="'+rows+' rows of seeds with '+cols+' in each row">';
  s+='<rect x="1" y="1" width="'+(w-2)+'" height="'+(h-2)+'" rx="12" fill="#9A6A3E"/><rect x="6" y="6" width="'+(w-12)+'" height="'+(h-12)+'" rx="9" fill="#6E4626"/>';
  for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){var cx=10+sp/2+c*sp, cy=10+sp/2+r*sp; s+='<ellipse cx="'+cx+'" cy="'+cy+'" rx="5.5" ry="7.5" fill="#F3DCA0" stroke="#B8925C" stroke-width="1.5" transform="rotate(20 '+cx+' '+cy+')"/>';}
  return s+'</svg>';
}
function pzSeeds(area,L){
  if(L===1){
    var target=rnd(3,10), planted=[], lastAdd=-1;
    for(var q=0;q<12;q++)planted.push(false);
    setSay('Plant '+target+' seeds in the pot. Tap the seed packet to plant a seed. Tap a seed to put it back. Then tap Done.');
    var slots=[]; for(var i=0;i<12;i++){slots.push([f2(46+(i%6)*25.6),i<6?66:81]);}
    area.innerHTML='<div class="big-target" aria-hidden="true">'+target+'</div>' +
      '<div class="seedrow">'+packetSVG()+
      '<svg class="pot" viewBox="0 0 220 200" role="group" aria-label="A flower pot" id="sd-pot"><ellipse cx="114" cy="191" rx="80" ry="8" fill="#2F4A2A" opacity=".18" filter="url(#fsoft)"/><path d="M32 86 H188 L167 187 H53 Z" fill="url(#terracotta)"/><path d="M46 112 H174" stroke="#C26A48" stroke-width="3" opacity=".6"/><path d="M56 96 C52 130 56 160 62 180" stroke="#fff" stroke-width="6" opacity=".2" fill="none" stroke-linecap="round"/><rect x="20" y="60" width="180" height="34" rx="9" fill="#E9926A" stroke="#A9533A" stroke-width="3"/><ellipse cx="110" cy="73" rx="84" ry="17" fill="url(#soilG)"/><path d="M40 70 C70 62 140 61 176 68" stroke="#A97A4E" stroke-width="2" opacity=".5" fill="none"/><g id="sd-seeds"></g></svg>' +
      '</div><button class="btn" id="sd-done">Done</button>';
    function count(){return planted.filter(Boolean).length;}
    function draw(){
      var s='';
      planted.forEach(function(on,i){
        if(!on)return; var p=slots[i];
        s+='<g class="tap seed" data-i="'+i+'" tabindex="0" role="button" aria-label="Seed. Tap to put it back in the packet."><circle cx="'+p[0]+'" cy="'+p[1]+'" r="13" fill="#fff" fill-opacity="0"/><g class="'+(i===lastAdd?'pop':'')+'"><ellipse cx="'+p[0]+'" cy="'+p[1]+'" rx="7" ry="9.5" fill="#F3DCA0" stroke="#8A6A3A" stroke-width="1.6" transform="rotate(15 '+p[0]+' '+p[1]+')"/><path d="M'+(p[0]-2.5)+' '+(p[1]-4)+' q-1 4 1 8" stroke="#fff" stroke-width="1.8" fill="none" opacity=".7" stroke-linecap="round"/></g></g>';
      });
      var g=$('#sd-seeds'); g.innerHTML=s;
      g.querySelectorAll('.seed').forEach(function(el){
        function back(){planted[+el.getAttribute('data-i')]=false;lastAdd=-1;tick();shake();draw();}
        el.addEventListener('click',back);
        el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();back();}});
      });
      var n=count(); $('#sd-pot').setAttribute('aria-label','A flower pot with '+n+' seed'+(n===1?'':'s'));
    }
    var pk=$('#sd-packet');
    function shake(){pk.classList.remove('shake');void pk.getBoundingClientRect();pk.classList.add('shake');}
    function plant(){
      var i=planted.indexOf(false); shake();
      if(i<0){softTone();return;}
      planted[i]=true; lastAdd=i; tick(); draw();
    }
    pk.addEventListener('click',plant);
    pk.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();plant();}});
    $('#sd-done').addEventListener('click',function(){finish(count()===target);});
    draw();
    return;
  }
  var rows, cols, total, cands;
  if(L===2){
    var g=pick([2,5,10]); cols=g; rows = g===2?rnd(3,10):g===5?rnd(2,10):rnd(2,9);
    total=rows*cols; cands=[total-g,total+g,total+(Math.random()<.5?1:-1)];
    setSay('Each row has '+g+' seeds. Count in '+g+'s. How many seeds are there altogether?');
  } else {
    rows=rnd(3,12); cols=rnd(3,12); total=rows*cols; cands=[(rows-1)*cols,(rows+1)*cols,rows*(cols+1),total+rnd(1,3)];
    setSay('There are '+rows+' rows with '+cols+' seeds in each row. How many seeds are there?');
  }
  area.innerHTML=bedSVG(rows,cols)+'<div class="opts" id="sd-opts"></div>';
  numberOptions(total,cands).forEach(function(v){
    var b=document.createElement('button'); b.type='button'; b.className='opt num'; b.textContent=v;
    b.addEventListener('click',function(){finish(v===total);});
    $('#sd-opts').appendChild(b);
  });
}
/* 4. garden words */
var WORDS=['sun','bee','apple','leaf','tree','worm','pot','flower'];
function pzWords(area,L){
  if(L===1||L===2){
    var picks=shuffle(WORDS).slice(0,3), target=picks[0];
    if(L===1){
      var letter=target[0];
      setSay('Which picture starts with '+letter+'?');
      area.innerHTML='<div class="bigletter" aria-hidden="true">'+letter+'</div><div class="opts" id="wd-opts"></div>';
    } else {
      setSay('Read the word. Then tap its picture.');
      area.innerHTML='<div class="bigword">'+target+'</div><div class="opts" id="wd-opts"></div>';
    }
    shuffle(picks).forEach(function(w){
      var b=document.createElement('button'); b.type='button'; b.className='opt'; b.innerHTML=picSVG(w).replace(/role="img" aria-label="[^"]*"/,'aria-hidden="true"');
      b.setAttribute('aria-label',L===1?'Picture: '+w:'A picture');
      b.addEventListener('click',function(){finish(w===target);});
      $('#wd-opts').appendChild(b);
    });
    return;
  }
  var word=pick(['flower','apple','leaf','tree','worm']);
  var extra=shuffle('bcdghkmnpsu'.split('').filter(function(ch){return word.indexOf(ch)<0;})).slice(0,2);
  var letters=shuffle(word.split('').concat(extra)), built=[];
  setSay('Spell the word for this picture. Tap the letters in order.');
  area.innerHTML='<div class="pic">'+picSVG(word).replace(/role="img" aria-label="[^"]*"/,'aria-hidden="true"')+'</div><div class="slots" id="sp-slots" aria-live="polite"></div><div class="tiles" id="sp-tiles"></div><div class="row-btns"><button class="btn soft" id="sp-undo">Take back a letter</button></div>';
  function drawSlots(){var s='';for(var i=0;i<word.length;i++){s+='<span class="slot">'+(built[i]?built[i].ch:'')+'</span>';}$('#sp-slots').innerHTML=s;$('#sp-slots').setAttribute('aria-label','Your word so far: '+built.map(function(b){return b.ch;}).join(' '));}
  letters.forEach(function(ch){
    var t=document.createElement('button'); t.type='button'; t.className='tile'; t.textContent=ch; t.setAttribute('aria-label','Letter '+ch);
    t.addEventListener('click',function(){
      if(built.length>=word.length)return;
      built.push({ch:ch,el:t}); t.disabled=true; tick(); drawSlots();
      if(built.length===word.length){var made=built.map(function(b){return b.ch;}).join('');setTimeout(function(){finish(made===word);},450);}
    });
    $('#sp-tiles').appendChild(t);
  });
  $('#sp-undo').addEventListener('click',function(){var b=built.pop();if(b){b.el.disabled=false;drawSlots();}});
  drawSlots();
}
/* 5. sort the flowers */
function basketBack(){
  return '<path d="M26 106 C24 14 176 14 174 106" stroke="#8A5A2A" stroke-width="15" fill="none" stroke-linecap="round"/>' +
    '<path d="M26 106 C24 14 176 14 174 106" stroke="#D3A363" stroke-width="10" fill="none" stroke-linecap="round"/>' +
    '<path d="M26 106 C24 14 176 14 174 106" stroke="#F0CF97" stroke-width="4" fill="none" stroke-dasharray="9 8"/>' +
    '<ellipse cx="100" cy="104" rx="88" ry="20" fill="#6E4420"/><ellipse cx="100" cy="108" rx="78" ry="13" fill="#4E2E14"/>' +
    '<path d="M12 104 A88 20 0 0 1 188 104" stroke="#B8864A" stroke-width="10" fill="none"/><path d="M12 104 A88 20 0 0 1 188 104" stroke="#E8C38A" stroke-width="4" fill="none" stroke-dasharray="8 7"/>';
}
function basketFront(){
  var s='<ellipse cx="102" cy="187" rx="84" ry="6" fill="#3B2A4A" opacity=".18"/>' +
    '<path d="M12 104 C14 150 34 182 62 186 H138 C166 182 186 150 188 104 A88 20 0 0 1 12 104 Z" fill="url(#wickerB)"/><g clip-path="url(#bkclip)">';
  for(var r=0;r<6;r++){var y=118+r*13;for(var x=-14+(r%2)*15;x<210;x+=30){s+='<rect x="'+x+'" y="'+(y-5.5)+'" width="28" height="11" rx="5.5" fill="url(#wickerA)" stroke="#875628" stroke-width="1"/>';}}
  s+='</g><path d="M12 104 C14 150 34 182 62 186 H138 C166 182 186 150 188 104 A88 20 0 0 1 12 104 Z" fill="url(#bkshade)" stroke="#875628" stroke-width="2"/>';
  return s+'<path d="M12 104 A88 20 0 0 0 188 104" stroke="#9E6B36" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M12 104 A88 20 0 0 0 188 104" stroke="#D9AE6C" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M14 104 A86 20 0 0 0 186 104" stroke="#F3D9A6" stroke-width="3.5" fill="none" stroke-dasharray="9 7"/>';
}
function pzSort(area,L){
  var items=[], zones=[], venn=null, sel=null;
  var p=shuffle(FCOL);
  if(L===1){
    var a=p[0], b=p[1];
    var list=shuffle([a,a,a,b,b,b]);
    list.forEach(function(c,i){items.push({id:i,c:c,n:5,zone:null});});
    zones=[{id:a,label:FC[a].name+' flowers',icon:{c:a,n:5}},{id:b,label:FC[b].name+' flowers',icon:{c:b,n:5}}];
    items.forEach(function(it){it.want=it.c;});
    setSay('Sort the flowers by colour. Tap a flower, then tap the right basket. Tap Check when they are all sorted.');
  } else if(L===2){
    var ca=p[0], cb=p[1], pn=pick([[4,6],[5,8]]);
    var combos=[];[ca,cb].forEach(function(c){pn.forEach(function(n){combos.push({c:c,n:n});});});
    var l2=shuffle(combos.concat(combos));
    l2.forEach(function(f,i){items.push({id:i,c:f.c,n:f.n,zone:null,want:f.c+'-'+f.n});});
    zones=combos.map(function(f){return {id:f.c+'-'+f.n,label:FC[f.c].name+', '+f.n+' petals',icon:f};});
    setSay('Sort by colour and by number of petals. Tap a flower, then tap the right basket. Tap Check when they are all sorted.');
  } else {
    var X=p[0], others=[p[1],p[2]], P=pick([5,6]), Qs=P===5?[4,7]:[4,8];
    var base=[{c:X,n:P},{c:X,n:Qs[0]},{c:others[0],n:P},{c:others[1],n:Qs[1]}];
    for(var i=0;i<4;i++){base.push({c:pick([X,others[0],others[1]]),n:pick([P,Qs[0],Qs[1]])});}
    shuffle(base).forEach(function(f,i){var inA=f.c===X, inB=f.n===P; items.push({id:i,c:f.c,n:f.n,zone:null,want:inA&&inB?'both':inA?'a':inB?'b':'none'});});
    venn={X:X,P:P};
    setSay('The left circle is for '+FC[X].name+' flowers. The right circle is for flowers with '+P+' petals. Tap a flower, then tap where it belongs. Tap Check when you are done.');
  }
  area.innerHTML='<div class="tray" id="so-tray" aria-label="Flowers to sort"></div>'+(venn?'<svg class="venn" id="so-venn" viewBox="0 0 440 290" role="group" aria-label="Two overlapping circles"></svg>':'<div class="zones" id="so-zones"></div>')+'<button class="btn" id="so-check" disabled>Check</button>';
  function flBtn(it,small){
    var b=document.createElement('button'); b.type='button'; b.className='fl'; b.innerHTML=flowerSVG(it);
    b.setAttribute('aria-label',flowerLabel(it)+(small?', tap to take it out':''));
    if(!small)b.setAttribute('aria-pressed',String(sel===it.id));
    return b;
  }
  function place(zoneId,x,y){
    if(sel===null)return;
    var it=items[sel]; it.zone=zoneId; it.x=x; it.y=y; sel=null; tick(); render();
  }
  function render(){
    var tray=$('#so-tray'); tray.innerHTML='';
    var left=items.filter(function(it){return it.zone===null;});
    if(!left.length){tray.innerHTML='<span class="tray-empty">All sorted. Tap Check.</span>';}
    left.forEach(function(it){var b=flBtn(it,false);b.addEventListener('click',function(){sel=(sel===it.id?null:it.id);tick();render();});tray.appendChild(b);});
    $('#so-check').disabled=left.length>0;
    if(venn){ drawVenn(); return; }
    var zb=$('#so-zones'); zb.innerHTML='';
    zones.forEach(function(z){
      var d=document.createElement('div'); d.className='zone'; d.setAttribute('role','button'); d.tabIndex=0;
      d.setAttribute('aria-label','Basket for '+z.label);
      d.innerHTML='<div class="zl"><svg viewBox="0 0 100 100" aria-hidden="true">'+flowerG(50,50,44,z.icon.c,z.icon.n)+'</svg><span></span></div><div class="bk"><svg viewBox="0 0 200 190" aria-hidden="true">'+basketBack()+'</svg><div class="zin"></div><svg class="bk-front" viewBox="0 0 200 190" aria-hidden="true">'+basketFront()+'</svg></div>';
      d.querySelector('.zl span').textContent=z.label.charAt(0).toUpperCase()+z.label.slice(1);
      items.filter(function(it){return it.zone===z.id;}).forEach(function(it){
        var b=flBtn(it,true); b.addEventListener('click',function(e){if(sel!==null)return;e.stopPropagation();it.zone=null;render();}); d.querySelector('.zin').appendChild(b);
      });
      function go(){place(z.id);}
      d.addEventListener('click',go);
      d.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}});
      zb.appendChild(d);
    });
  }
  function drawVenn(){
    var v=$('#so-venn');
    var s='<rect x="4" y="34" width="432" height="252" rx="22" fill="#F3E2C4" stroke="#B8925C" stroke-width="3"/>' +
      '<circle cx="165" cy="160" r="105" fill="#FCEAF2" fill-opacity=".85" stroke="#B8467A" stroke-width="3"/>' +
      '<circle cx="275" cy="160" r="105" fill="#E2F1FB" fill-opacity=".7" stroke="#3E7FB0" stroke-width="3"/>' +
      '<text x="110" y="24" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="19" font-weight="600" fill="#86304F">'+esc(FC[venn.X].name)+' flowers</text>' +
      '<text x="330" y="24" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="19" font-weight="600" fill="#2E6290">'+venn.P+' petals</text>';
    items.filter(function(it){return it.zone!==null;}).forEach(function(it){
      s+='<g class="vf" data-id="'+it.id+'" tabindex="0" role="button" aria-label="'+esc(flowerLabel(it))+', tap to take it out">'+flowerG(it.x,it.y,17,it.c,it.n)+'</g>';
    });
    v.innerHTML=s;
    v.querySelectorAll('.vf').forEach(function(g){
      function back(e){e.stopPropagation();items[+g.getAttribute('data-id')].zone=null;render();}
      g.addEventListener('click',function(e){if(sel!==null)return;back(e);});
      g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();back(e);}});
    });
  }
  if(venn){
    $('#so-venn').addEventListener('click',function(e){
      if(sel===null)return;
      var v=$('#so-venn'), pt=v.createSVGPoint(); pt.x=e.clientX; pt.y=e.clientY;
      var m=v.getScreenCTM(); if(!m)return; var q=pt.matrixTransform(m.inverse());
      var x=Math.max(22,Math.min(418,q.x)), y=Math.max(54,Math.min(266,q.y));
      var inA=Math.hypot(q.x-165,q.y-160)<=105, inB=Math.hypot(q.x-275,q.y-160)<=105;
      place(inA&&inB?'both':inA?'a':inB?'b':'none',x,y);
    });
  }
  $('#so-check').addEventListener('click',function(){finish(items.every(function(it){return it.zone===it.want;}));});
  render();
}
/* her word pictures (the first picture list, PICS; pic2 checks PICS2 first, then PICS) */
Object.assign(PICS,{
  sun:'<circle cx="50" cy="50" r="21" fill="#F8CF5A" stroke="#C9961E" stroke-width="3"/><g stroke="#E9A92A" stroke-width="5" stroke-linecap="round"><path d="M50 8v12M50 80v12M8 50h12M80 50h12M20 20l8 8M72 72l8 8M80 20l-8 8M28 72l-8 8"/></g><circle cx="43" cy="46" r="2.5" fill="#6E4A1E"/><circle cx="57" cy="46" r="2.5" fill="#6E4A1E"/><path d="M43 56 Q50 62 57 56" stroke="#6E4A1E" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
  bee:'<ellipse cx="38" cy="34" rx="14" ry="10" fill="#E4F5FD" stroke="#9CC3E6" stroke-width="2" transform="rotate(-25 38 34)"/><ellipse cx="60" cy="32" rx="14" ry="10" fill="#E4F5FD" stroke="#9CC3E6" stroke-width="2" transform="rotate(25 60 32)"/><ellipse cx="50" cy="58" rx="28" ry="20" fill="#F8CF5A" stroke="#B8861E" stroke-width="3"/><path d="M42 40 V76 M56 40 V76" stroke="#3B2A4A" stroke-width="7"/><path d="M78 58 L90 58" stroke="#3B2A4A" stroke-width="3" stroke-linecap="round"/><circle cx="29" cy="54" r="3" fill="#3B2A4A"/>',
  apple:'<path d="M50 30 C34 18 14 30 16 54 C18 78 36 92 50 84 C64 92 82 78 84 54 C86 30 66 18 50 30 Z" fill="#E8574C" stroke="#9C241C" stroke-width="3"/><path d="M50 30 C50 22 52 14 56 10" stroke="#6E4626" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M54 20 C62 10 76 12 78 16 C72 24 60 24 54 20 Z" fill="#5FB15B" stroke="#3F8A3A" stroke-width="2"/><ellipse cx="34" cy="46" rx="5" ry="9" fill="#fff" opacity=".45"/>',
  leaf:'<path d="M18 82 C14 44 40 16 86 14 C86 58 60 86 18 82 Z" fill="#7CCB6A" stroke="#3F8A3A" stroke-width="3"/><path d="M18 82 L72 28 M40 60 L38 42 M52 48 L64 52 M30 70 L50 70" stroke="#3F8A3A" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
  tree:'<rect x="43" y="56" width="14" height="34" rx="3" fill="#8A5A30"/><circle cx="50" cy="40" r="28" fill="#6DBE5A" stroke="#3F8A3A" stroke-width="3"/><circle cx="34" cy="52" r="14" fill="#5FB15B" stroke="#3F8A3A" stroke-width="2.5"/><circle cx="66" cy="52" r="14" fill="#5FB15B" stroke="#3F8A3A" stroke-width="2.5"/><circle cx="42" cy="32" r="4" fill="#E8574C"/><circle cx="60" cy="40" r="4" fill="#E8574C"/>',
  worm:'<path d="M14 70 C24 50 36 50 44 66 C52 82 64 82 72 62 C76 52 82 48 86 50" stroke="#B8467A" stroke-width="18" fill="none" stroke-linecap="round"/><path d="M14 70 C24 50 36 50 44 66 C52 82 64 82 72 62 C76 52 82 48 86 50" stroke="#F49DBE" stroke-width="12" fill="none" stroke-linecap="round"/><circle cx="86" cy="47" r="2.6" fill="#3B2A4A"/>',
  pot:'<path d="M22 40 H78 L70 88 H30 Z" fill="url(#terracotta)" stroke="#8A3F22" stroke-width="3"/><rect x="16" y="32" width="68" height="14" rx="4" fill="#E9926A" stroke="#8A3F22" stroke-width="3"/><path d="M50 32 V14 M50 22 C42 14 36 16 34 20 C40 24 46 24 50 22 M50 18 C58 10 64 12 66 16 C60 20 54 20 50 18" stroke="#3F8A3A" stroke-width="3" fill="#7CCB6A" stroke-linecap="round"/>',
  flower:'<path d="M50 56 V92" stroke="#3F8A3A" stroke-width="5" stroke-linecap="round"/><path d="M50 78 C38 68 28 70 24 74 C32 82 42 82 50 78 Z" fill="#7CCB6A" stroke="#3F8A3A" stroke-width="2"/>'
});
/* petal icons for her flower (72 x 72) */
Object.assign(PZICON,{
  /* ---------------- a fairy's world: her flower, one petal per puzzle ---------------- */
  jigsaw:'<path d="M12 22 h14 a6 6 0 1 1 12 0 h14 v14 a6 6 0 1 0 0 12 v14 h-14 a6 6 0 1 1 -12 0 h-14 Z" fill="#F28CB3" stroke="#B8467A" stroke-width="3" stroke-linejoin="round"/>',
  pattern:flowerG(14,40,11,'pink',5)+flowerG(36,40,11,'yellow',5)+flowerG(58,40,11,'pink',5),
  seeds:'<path d="M16 34 H56 L50 64 H22 Z" fill="url(#terracotta)" stroke="#8A3F22" stroke-width="2.5"/><rect x="12" y="28" width="48" height="10" rx="3" fill="#E9926A" stroke="#8A3F22" stroke-width="2.5"/><path d="M36 28 V14 M36 20 C30 12 24 14 22 18 C28 22 32 22 36 20 M36 16 C42 8 48 10 50 14 C44 18 40 18 36 16" stroke="#3F8A3A" stroke-width="2.5" fill="#7CCB6A" stroke-linecap="round"/>',
  words:'<rect x="6" y="14" width="60" height="44" rx="12" fill="#fff" stroke="#8A4F7D" stroke-width="3"/><text x="36" y="46" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="26" font-weight="600" fill="#B8467A">abc</text>',
  sort:'<path d="M10 36 H62 L56 64 H16 Z" fill="#F3E2C4" stroke="#B8925C" stroke-width="3"/><path d="M14 46 H58 M18 56 H54" stroke="#B8925C" stroke-width="2"/><path d="M20 36 C20 18 52 18 52 36" stroke="#B8925C" stroke-width="3" fill="none"/>'+flowerG(26,32,9,'red',5)+flowerG(46,30,9,'blue',6)
});
/* ---------- Bloom ---------- */
FAIRIES.petal={id:'petal',name:'Bloom',kind:'Flower fairy',place:"Bloom's garden",art:petalArt,body:tulipBody,houseLabel:"Bloom's tulip cottage",tapClass:'bloom',tapMs:2600,
  facts:FACTS,scene:forestScene,base:'#DCEFD0',foundBg:'#E8F5DF',foundGround:'<ellipse cx="170" cy="340" rx="120" ry="16" fill="#9ED17F"/>',
  thanks:'Thank you for looking after my garden.',icon:flowerG(50,50,40,'pink',5),
  flowerBase:function(){
    return '<path d="M340 380 C330 470 352 580 340 700" stroke="#2F6B2C" stroke-width="20" fill="none" stroke-linecap="round"/>' +
      '<path d="M340 380 C330 470 352 580 340 700" stroke="#4E9F45" stroke-width="13" fill="none" stroke-linecap="round"/>' +
      '<path d="M340 642 C300 600 246 598 220 618 C254 660 306 664 340 642 Z" fill="url(#ptleaf)" stroke="#2F6B2C" stroke-width="2.5"/>' +
      '<path d="M342 596 C382 556 436 558 462 578 C428 618 376 620 342 596 Z" fill="url(#ptleaf)" stroke="#2F6B2C" stroke-width="2.5"/>' +
      '<path d="M240 626 C270 622 300 628 330 640 M444 582 C414 580 384 584 352 596" stroke="#fff" stroke-width="3" opacity=".35" fill="none" stroke-linecap="round"/>';
  },
  puz:[
    {id:'jigsaw',titles:['Garden jigsaw','Garden jigsaw','Garden jigsaw'],run:function(a,L){pzJigsaw(a,L,'garden',gardenPicture,'the garden');}},
    {id:'pattern',titles:['Petal pattern','Petal pattern','Petal pattern'],run:pzPattern},
    {id:'seeds',titles:['Plant the seeds','Seed rows','Seed patches'],run:pzSeeds},
    {id:'words',titles:['First sounds','Read the word','Spell it'],run:pzWords},
    {id:'sort',titles:['Sort the flowers','Sort the flowers','Flower circles'],run:pzSort}
  ]};
FAIRY_ORDER.push('petal');
