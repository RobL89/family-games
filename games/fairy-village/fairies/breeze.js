/* Breeze, the Weather fairy: her art, cloud house, cloud tops, rainbow jigsaw picture, pictures, facts,
   puzzles (weather count, seasons, rainbow jigsaw, cloud shapes, weather words) and her FAIRIES entry. */
'use strict';
/* her gradients (added to the shared defs; any fairy can use them) */
addDefs(
'<radialGradient id="cloudG" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#F4F8FE"/><stop offset="1" stop-color="#DCE6F5"/></radialGradient>' +
'<radialGradient id="bzDress" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#D3E5F8"/><stop offset="1" stop-color="#8AABD8"/></radialGradient>' +
'<radialGradient id="bzWing" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".6" stop-color="#E4ECFF" stop-opacity=".75"/><stop offset="1" stop-color="#9DB3E6" stop-opacity=".9"/></radialGradient>' +
'<linearGradient id="bzLegs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9DB8E2"/><stop offset="1" stop-color="#4E6BA8"/></linearGradient>' +
'<radialGradient id="bootSky" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FFF5D4"/><stop offset=".5" stop-color="#F8CF5A"/><stop offset="1" stop-color="#C9961E"/></radialGradient>' +
'<linearGradient id="stalkG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9ADB7E"/><stop offset=".5" stop-color="#5FA34D"/><stop offset="1" stop-color="#2F6B2C"/></linearGradient>'
);
/* ---------- Breeze, the Weather fairy (240 x 320 box) ---------- */
function breezeArt(noShadow){
  var skin='url(#skinE)', flat='#86502F';
  return (noShadow?'':'<ellipse cx="120" cy="308" rx="44" ry="7" fill="#4E6BA8" opacity=".22" filter="url(#fshadow)"/>') +
  '<g class="wings">' +
  '<path d="M112 150 C90 96 42 92 40 126 C38 158 86 166 112 158 Z" fill="url(#bzWing)" stroke="#fff" stroke-opacity=".9" stroke-width="1.5"/>' +
  '<path d="M112 166 C84 170 60 196 72 216 C86 234 112 202 116 174 Z" fill="url(#bzWing)" stroke="#fff" stroke-opacity=".9" stroke-width="1.5"/>' +
  '<path d="M128 150 C150 96 198 92 200 126 C202 158 154 166 128 158 Z" fill="url(#bzWing)" stroke="#fff" stroke-opacity=".9" stroke-width="1.5"/>' +
  '<path d="M128 166 C156 170 180 196 168 216 C154 234 128 202 124 174 Z" fill="url(#bzWing)" stroke="#fff" stroke-opacity=".9" stroke-width="1.5"/>' +
  '<path d="M112 152 C94 130 70 118 52 122 M112 156 C92 152 70 150 52 146 M114 172 C100 186 88 200 80 212 M128 152 C146 130 170 118 188 122 M128 156 C148 152 170 150 188 146 M126 172 C140 186 152 200 160 212" stroke="#fff" stroke-width="1" fill="none" opacity=".6"/>' +
  '</g>' +
  '<rect x="106" y="230" width="11" height="36" rx="5.5" fill="url(#bzLegs)"/><rect x="123" y="230" width="11" height="36" rx="5.5" fill="url(#bzLegs)"/>' +
  '<path d="M101 260 H118 V270 C118 276 112 279 104 279 C97 279 95 271 101 260 Z" fill="url(#bootSky)"/>' +
  '<path d="M122 260 H139 C145 271 143 279 136 279 C128 279 122 276 122 270 Z" fill="url(#bootSky)"/>' +
  /* cloud dress with a puffy hem */
  '<path d="M104 152 C100 152 98 160 98 168 C92 188 86 210 82 226 C74 234 82 246 92 240 C98 248 110 248 114 240 C120 248 132 248 136 240 C142 248 156 246 154 238 C162 238 164 230 158 226 C154 210 148 188 142 168 C142 160 140 152 136 152 Z" fill="url(#bzDress)"/>' +
  '<ellipse cx="102" cy="202" rx="7" ry="22" fill="#fff" opacity=".35" filter="url(#fsoft)"/>' +
  /* rainbow sash */
  '<path d="M99 172 Q120 180 141 172" stroke="#E8574C" stroke-width="3" fill="none"/><path d="M98.5 175 Q120 183 141.5 175" stroke="#F7A055" stroke-width="3" fill="none"/><path d="M98.3 178 Q120 186 141.7 178" stroke="#F8CF5A" stroke-width="3" fill="none"/><path d="M98 181 Q120 189 142 181" stroke="#6DBE5A" stroke-width="3" fill="none"/><path d="M98 184 Q120 192 142 184" stroke="#6FB3DE" stroke-width="3" fill="none"/>' +
  /* left arm down */
  '<path d="M104 164 C94 176 90 188 88 198" stroke="'+flat+'" stroke-width="10" fill="none" stroke-linecap="round"/>' +
  '<circle cx="88" cy="200" r="6" fill="'+skin+'"/>' +
  /* right arm up holding a little cloud on a string */
  '<g class="arm"><path d="M136 164 C150 158 158 148 162 138" stroke="'+flat+'" stroke-width="10" fill="none" stroke-linecap="round"/>' +
  '<path d="M163 134 C170 120 176 112 184 104" stroke="#8AABD8" stroke-width="1.6" fill="none"/>' +
  '<circle cx="163" cy="136" r="6" fill="'+skin+'"/>' +
  '<g transform="translate(186 92)"><circle cx="-10" cy="4" r="9" fill="url(#cloudG)" stroke="#C3D2EA" stroke-width="1.2"/><circle cx="2" cy="-2" r="12" fill="url(#cloudG)" stroke="#C3D2EA" stroke-width="1.2"/><circle cx="13" cy="5" r="8" fill="url(#cloudG)" stroke="#C3D2EA" stroke-width="1.2"/><rect x="-12" y="4" width="26" height="9" rx="4.5" fill="url(#cloudG)"/></g></g>' +
  '<rect x="114" y="138" width="12" height="16" rx="4" fill="#714226"/>' +
  /* curly hair: a big puff on top and curls at the sides */
  '<g fill="url(#hairBlack)"><circle cx="120" cy="56" r="26"/><circle cx="84" cy="96" r="14"/><circle cx="156" cy="96" r="14"/><circle cx="82" cy="118" r="12"/><circle cx="158" cy="118" r="12"/></g>' +
  '<circle cx="120" cy="108" r="40" fill="'+skin+'"/>' +
  '<g fill="url(#hairBlack)"><circle cx="90" cy="84" r="11"/><circle cx="104" cy="75" r="11"/><circle cx="120" cy="72" r="11"/><circle cx="136" cy="75" r="11"/><circle cx="150" cy="84" r="11"/></g>' +
  '<path d="M106 44 C114 38 126 37 134 42" stroke="#fff" stroke-width="3" opacity=".25" stroke-linecap="round" fill="none"/>' +
  /* tiny cloud hair band */
  '<g transform="translate(120 80)"><circle cx="-22" cy="0" r="7" fill="url(#cloudG)"/><circle cx="-10" cy="-4" r="8" fill="url(#cloudG)"/><circle cx="2" cy="-5" r="8" fill="url(#cloudG)"/><circle cx="14" cy="-3" r="7" fill="url(#cloudG)"/><circle cx="24" cy="1" r="6" fill="url(#cloudG)"/></g>' +
  '<path d="M99 102 Q105 98 111 101 M129 101 Q135 98 141 102" stroke="#1E120C" stroke-width="2" fill="none" stroke-linecap="round"/>' +
  '<ellipse cx="106" cy="115" rx="5.5" ry="7" fill="#1E120C"/><ellipse cx="134" cy="115" rx="5.5" ry="7" fill="#1E120C"/>' +
  '<circle cx="108" cy="112" r="2" fill="#fff"/><circle cx="136" cy="112" r="2" fill="#fff"/>' +
  '<ellipse cx="95" cy="127" rx="7" ry="4.5" fill="#E8708F" opacity=".35"/><ellipse cx="145" cy="127" rx="7" ry="4.5" fill="#E8708F" opacity=".35"/>' +
  '<path d="M112 128 Q120 135 128 128" stroke="#4A1E14" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
}
function cloudHouseBody(){
  var s='';
  /* tall stalk with leaves and a little door at its foot */
  s+='<path d="M96 183 C100 160 94 140 101 106 H121 C126 140 120 160 126 183 Z" fill="url(#stalkG)"/>' +
    '<path d="M104 150 C90 140 78 142 74 148 C84 156 96 156 104 150 Z M118 128 C132 116 144 118 148 124 C138 134 126 134 118 128 Z" fill="#6DBE5A" stroke="#357A31" stroke-width="1.5"/>' +
    '<path d="M101 183 V170 A10 10 0 0 1 121 170 V183 Z" fill="#4E2E1B"/><path d="M104 183 V171 A7 7 0 0 1 118 171 V183 Z" fill="url(#gwood)"/><circle cx="115" cy="177" r="1.6" fill="url(#ggold)"/>';
  /* the cloud house */
  s+=cloudPuffs(110,80,.66,'url(#cloudG)');
  s+='<circle cx="84" cy="80" r="9" fill="#9AB0D6"/><circle cx="84" cy="80" r="6.5" fill="url(#gglass)"/>' +
    '<circle cx="136" cy="80" r="9" fill="#9AB0D6"/><circle cx="136" cy="80" r="6.5" fill="url(#gglass)"/>' +
    '<path d="M100 104 V90 A10 10 0 0 1 120 90 V104 Z" fill="#9AB0D6"/><path d="M103 104 V91 A7 7 0 0 1 117 91 V104 Z" fill="#F5C842"/>';
  /* rainbow that appears when tapped */
  s+='<g class="rbow"><path d="M150 76 A34 34 0 0 1 206 60" stroke="#E8574C" stroke-width="4" fill="none"/><path d="M152 81 A30 30 0 0 1 204 66" stroke="#F8CF5A" stroke-width="4" fill="none"/><path d="M154 86 A26 26 0 0 1 202 72" stroke="#6DBE5A" stroke-width="4" fill="none"/><path d="M156 91 A22 22 0 0 1 200 78" stroke="#6FB3DE" stroke-width="4" fill="none"/></g>';
  /* weathervane */
  s+='<path d="M112 46 V12" stroke="#7A5A30" stroke-width="2.5"/><circle cx="112" cy="46" r="3" fill="url(#ggold)"/>' +
    '<g class="vane"><path d="M94 14 H128" stroke="#C9961E" stroke-width="2.5" stroke-linecap="round"/><path d="M128 14 L121 8 V20 Z" fill="url(#ggold)"/><path d="M94 14 L88 7 L98 7 L101 14 L98 21 L88 21 Z" fill="url(#ggold)"/></g>' +
    '<circle cx="112" cy="10" r="3.4" fill="url(#ggold)"/>' +
    '<text x="112" y="34" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="9" font-weight="600" fill="#7A5A30">N</text>';
  return s;
}
/* ---------- Breeze's world: the cloud tops ---------- */
function cloudScene(){
  function ri(i,a){var x=Math.sin(i*12.9898+a*78.233)*43758.5453;return x-Math.floor(x);}
  var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMax slice"><defs>' +
  '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8CC2EE"/><stop offset=".55" stop-color="#CFE6F8"/><stop offset="1" stop-color="#FCEFE0"/></linearGradient>' +
  '<radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF6C8"/><stop offset=".4" stop-color="#FFE98A" stop-opacity=".8"/><stop offset="1" stop-color="#FFE98A" stop-opacity="0"/></radialGradient>' +
  '<radialGradient id="c1" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#DCE6F5"/></radialGradient>' +
  '<radialGradient id="c2" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#F4F8FE"/><stop offset="1" stop-color="#C9D7EE"/></radialGradient>' +
  '<radialGradient id="c3" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#E7EEF9"/><stop offset="1" stop-color="#B7C8E6"/></radialGradient>' +
  '<filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>' +
  '</defs>';
  s+='<rect width="1200" height="900" fill="url(#sky)"/><circle cx="960" cy="150" r="230" fill="url(#sun)"/><circle cx="960" cy="150" r="52" fill="#FFF3B0"/>';
  /* a soft rainbow far behind */
  var rb=['#F2A3A0','#F8C99A','#F7E4A0','#B9E0A6','#A9CDEE','#C7B8EC'];
  rb.forEach(function(c,i){s+='<path d="M120 640 A480 420 0 0 1 1080 640" stroke="'+c+'" stroke-width="22" fill="none" opacity=".55" transform="translate(0 '+(i*22)+')"/>';});
  /* three banks of cloud, back to front */
  function bank(y,r,grad,seed,step){
    var t='';
    for(var x=-60;x<1280;x+=step){t+='<circle cx="'+f2(x+ri(x,seed)*30)+'" cy="'+f2(y+ri(x,seed+1)*40)+'" r="'+f2(r+ri(x,seed+2)*r*.5)+'" fill="'+grad+'"/>';}
    return t+'<rect x="0" y="'+f2(y+20)+'" width="1200" height="'+f2(900-y)+'" fill="'+grad+'"/>';
  }
  s+=bank(560,80,'url(#c3)',1,110)+bank(660,90,'url(#c2)',4,120)+bank(780,100,'url(#c1)',7,130);
  /* floating cloud islands at the sides */
  [[130,300,1],[1070,380,.9],[230,520,.7]].forEach(function(c){
    s+='<g transform="translate('+c[0]+' '+c[1]+') scale('+c[2]+')"><ellipse cx="0" cy="40" rx="110" ry="12" fill="#7E95BE" opacity=".18"/><circle cx="-60" cy="10" r="40" fill="url(#c1)"/><circle cx="-10" cy="-14" r="54" fill="url(#c1)"/><circle cx="50" cy="4" r="44" fill="url(#c1)"/><rect x="-96" y="10" width="190" height="34" rx="17" fill="url(#c1)"/></g>';
  });
  /* birds and a kite */
  [[400,220],[440,200],[470,236],[760,300],[792,284]].forEach(function(b){s+='<path d="M'+b[0]+' '+b[1]+' q10 -10 18 0 q8 -10 18 0" stroke="#5E6C8C" stroke-width="3" fill="none" stroke-linecap="round"/>';});
  s+='<g transform="translate(820 420) rotate(12)"><path d="M0 -40 L28 0 L0 46 L-28 0 Z" fill="#E8574C" stroke="#9C241C" stroke-width="2"/><path d="M0 -40 V46 M-28 0 H28" stroke="#fff" stroke-width="2" opacity=".7"/><path d="M0 46 C10 80 -14 110 6 150" stroke="#5E6C8C" stroke-width="2" fill="none"/><path d="M4 76 l10 -4 l-6 10 Z M2 104 l10 -4 l-6 10 Z" fill="#F8CF5A"/></g>';
  /* sparkles */
  [[300,420],[620,360],[900,560],[480,600],[700,520],[1000,640]].forEach(function(f,i){s+='<circle cx="'+f[0]+'" cy="'+f[1]+'" r="12" fill="#FFF8D0" opacity=".6" filter="url(#bl)"/><circle cx="'+f[0]+'" cy="'+f[1]+'" r="'+(3+i%2)+'" fill="#FFF8D0"/>';});
  s+='</svg>';
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
}
/* the rainbow jigsaw picture (an image, so it carries its own gradients) */
function rainbowPicture(){
  var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">'+allDefs() +
    '<linearGradient id="rsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7DB6E8"/><stop offset="1" stop-color="#DDEFFB"/></linearGradient>' +
    '<rect width="600" height="600" fill="url(#rsky)"/>' +
    '<circle cx="90" cy="90" r="46" fill="#F8CF5A" stroke="#E0A42A" stroke-width="4"/>' +
    '<g stroke="#F0B43A" stroke-width="7" stroke-linecap="round"><path d="M90 18v16M90 146v16M18 90h16M146 90h16M38 38l12 12M130 130l12 12M142 38l-12 12M50 130l-12 12"/></g>';
  var cols=['#E8574C','#F7A055','#F8CF5A','#6DBE5A','#6FB3DE','#6C5BC4','#B3A4F0'];
  cols.forEach(function(c,i){s+='<path d="M60 470 A'+(250-i*22)+' '+(250-i*22)+' 0 0 1 '+(560-i*44)+' 470" transform="translate('+(i*22)+' 0)" stroke="'+c+'" stroke-width="23" fill="none"/>';});
  s+='<path d="M0 520 C120 470 240 500 300 510 C400 470 500 480 600 510 V600 H0 Z" fill="#9FD283"/><rect y="540" width="600" height="60" fill="#8CC46E"/>';
  s+=cloudPuffs(80,470,.9,'url(#cloudG)')+cloudPuffs(520,470,.9,'url(#cloudG)');
  s+='<g transform="translate(250 90) scale(.9)">'+cloudHouseBody()+'</g>';
  s+='<g transform="translate(420 160) scale(.7)">'+cloudPuffs(0,0,1,'url(#cloudG)')+'</g>';
  [[380,80],[410,64],[440,84]].forEach(function(b){s+='<path d="M'+b[0]+' '+b[1]+' q8 -8 14 0 q6 -8 14 0" stroke="#3B4A6C" stroke-width="3" fill="none" stroke-linecap="round"/>';});
  s+='<g transform="translate(330 470)"><path d="M0 0 V60" stroke="#3F8A3A" stroke-width="4"/>'+flowerG(0,0,18,'yellow',6)+'</g><g transform="translate(250 500)"><path d="M0 0 V40" stroke="#3F8A3A" stroke-width="4"/>'+flowerG(0,0,14,'pink',5)+'</g>';
  s+='</svg>';
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
}
/* ---------- small puzzle pictures (100 x 100) ---------- */
function cloudIcon(x,y,k,fill,stroke){
  return '<g transform="translate('+x+' '+y+') scale('+k+')"><path d="M-30 12 A14 14 0 0 1 -26 -10 A18 18 0 0 1 4 -20 A16 16 0 0 1 30 -6 A12 12 0 0 1 30 18 H-24 A12 12 0 0 1 -30 12 Z" fill="'+fill+'" stroke="'+stroke+'" stroke-width="3" stroke-linejoin="round"/></g>';
}
/* ================= Breeze's cloud-top puzzles ================= */
var WX={
  sunny:{name:'sunny',pic:'sun',col:'#F8CF5A'},
  rainy:{name:'rainy',pic:'rain',col:'#6FB3DE'},
  cloudy:{name:'cloudy',pic:'cloud',col:'#B7C4D8'},
  windy:{name:'windy',pic:'wind',col:'#7FD3B5'},
  snowy:{name:'snowy',pic:'snow',col:'#C9B8F5'}
};
function tallyMarks(n,x,y,h){
  var s='', gx=x;
  for(var g=0;g<Math.ceil(n/5);g++){
    var inG=Math.min(5,n-g*5);
    for(var i=0;i<Math.min(4,inG);i++){s+='<path d="M'+(gx+i*12)+' '+y+' V'+(y+h)+'" stroke="#3B2A4A" stroke-width="4" stroke-linecap="round"/>';}
    if(inG===5)s+='<path d="M'+(gx-6)+' '+(y+h-4)+' L'+(gx+42)+' '+(y+4)+'" stroke="#B8467A" stroke-width="4" stroke-linecap="round"/>';
    gx+=66;
  }
  return s;
}
/* 1. weather tally */
function pzTally(area,L){
  if(L===1){
    /* Weather count: count one kind of weather picture, then tap the right number */
    var names={cloud:'clouds',sun:'suns',snowflake:'snowflakes',umbrella:'umbrellas'}, kinds=['cloud','sun','snowflake'];
    multi(area,L,3,function(R){
      var tgt=R.fresh(kinds), others=Object.keys(names).filter(function(x){return x!==tgt;});
      var n=rnd(2,6);
      var things=[]; for(var i=0;i<n;i++)things.push(tgt); for(var j=0;j<rnd(2,3);j++)things.push(pick(others));
      things=shuffle(things);
      var rowsN=Math.ceil(things.length/5), skyH=rowsN*92+16;
      var sky='<svg class="skypanel" viewBox="0 0 480 '+skyH+'" role="img" aria-label="A sky with '+things.length+' weather pictures"><rect width="480" height="'+skyH+'" rx="20" fill="#CFE6F8"/>';
      things.forEach(function(t,i){var col=i%5,row=Math.floor(i/5);sky+='<svg x="'+(12+col*92)+'" y="'+(8+row*92)+'" width="86" height="86" viewBox="0 0 100 100">'+pic2(t)+'</svg>';});
      sky+='</svg>';
      setSay('How many '+names[tgt]+' can you see? Tap the number.');
      area.innerHTML='<div class="panel">'+sky+'</div><div class="countwhat"><span class="pic">'+picSVG2(tgt,names[tgt])+'</span><span>How many '+names[tgt]+'?</span></div><div class="opts" id="ty-opts"></div>';
      var c=[n-1,n+1,n+2,n-2].filter(function(v){return v>=1&&v<=9;}).slice(0,2);
      shuffle([n].concat(c)).forEach(function(v){var b=optBtn(String(v),null,'num');b.addEventListener('click',function(){finish(v===n);});$('#ty-opts').appendChild(b);});
    });
    return;
  }
  var ks=shuffle(Object.keys(WX)).slice(0,4), vals=shuffle([3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].slice(L===2?0:0)).slice(0,4);
  var data=ks.map(function(k,i){return {k:k,v:vals[i]};});
  var most=data.slice().sort(function(a,b){return b.v-a.v;})[0], least=data.slice().sort(function(a,b){return a.v-b.v;})[0];
  var chart;
  if(L===2){
    chart='<svg class="chartsvg" viewBox="0 0 560 '+(data.length*64+44)+'" role="img" aria-label="Tally chart of weather">';
    chart+='<rect width="560" height="'+(data.length*64+44)+'" rx="16" fill="#fff"/><text x="20" y="30" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="20" font-weight="600" fill="#3B2A4A">Weather</text><text x="190" y="30" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="20" font-weight="600" fill="#3B2A4A">Tally</text><path d="M12 42 H548 M178 12 V'+(data.length*64+36)+'" stroke="#E4DAF0" stroke-width="2"/>';
    data.forEach(function(d,i){var y=44+i*64;chart+='<svg x="16" y="'+(y+6)+'" width="50" height="50" viewBox="0 0 100 100">'+pic2(WX[d.k].pic)+'</svg><text x="72" y="'+(y+40)+'" font-family="Nunito, sans-serif" font-size="19" font-weight="800" fill="#3B2A4A">'+WX[d.k].name+'</text>'+tallyMarks(d.v,196,y+12,40)+(i<data.length-1?'<path d="M12 '+(y+62)+' H548" stroke="#F0EAF6" stroke-width="2"/>':'');});
    chart+='</svg>';
  } else {
    var cw=520, chh=300, x0=64, y0=250, top=20, scale=(y0-top)/20, bw=70;
    chart='<svg class="chartsvg" viewBox="0 0 '+cw+' '+chh+'" role="img" aria-label="Bar chart of weather, from 0 to 20 days">';
    chart+='<rect width="'+cw+'" height="'+chh+'" rx="16" fill="#fff"/>';
    for(var v=0;v<=20;v++){var yy=y0-v*scale;chart+='<path d="M'+x0+' '+f2(yy)+' H'+(cw-16)+'" stroke="'+(v%2?'#F3EEF8':'#E4DAF0')+'" stroke-width="'+(v%2?1:1.6)+'"/>';if(v%2===0)chart+='<text x="'+(x0-8)+'" y="'+f2(yy+7)+'" text-anchor="end" font-family="Nunito, sans-serif" font-size="20" font-weight="800" fill="#5E4E6C" style="font-variant-numeric:tabular-nums">'+v+'</text>';}
    data.forEach(function(d,i){var bx=x0+20+i*((cw-x0-36)/4), bh=d.v*scale;chart+='<rect x="'+f2(bx)+'" y="'+f2(y0-bh)+'" width="'+bw+'" height="'+f2(bh)+'" rx="6" fill="'+WX[d.k].col+'" stroke="#3B2A4A" stroke-width="2"/><svg x="'+f2(bx+bw/2-20)+'" y="'+(y0+4)+'" width="40" height="40" viewBox="0 0 100 100">'+pic2(WX[d.k].pic)+'</svg>';});
    chart+='<path d="M'+x0+' '+top+' V'+y0+' H'+(cw-16)+'" stroke="#3B2A4A" stroke-width="2.5" fill="none"/>';
    chart+='<text x="16" y="'+(top+100)+'" transform="rotate(-90 16 '+(top+100)+')" text-anchor="middle" font-family="Nunito, sans-serif" font-size="17" font-weight="800" fill="#5E4E6C">Days</text></svg>';
  }
  setSay(L===2?'Breeze counted the weather each day. Read her tally chart to answer the questions.':'Breeze made a bar chart of the weather. Read it to answer the questions.');
  var pickOpts=function(box,ans,done){
    data.forEach(function(d){var b=optBtn(picSVG2(WX[d.k].pic)+'<span class="optlab">'+WX[d.k].name+'</span>',WX[d.k].name,'picword');b.addEventListener('click',function(){done(d.k===ans.k);});box.appendChild(b);});
  };
  rounds(2,function(k,next){
    var q, box;
    area.innerHTML=roundNote(k,2)+'<div class="panel chart-wrap">'+chart+'</div><p class="say-small" id="ty-q"></p><div class="opts" id="ty-opts"></div>';
    box=$('#ty-opts');
    if(L===2){
      if(k===0){var d=pick(data);q='How many '+WX[d.k].name+' days did Breeze count?';numOpts(box,d.v,[d.v+1,d.v-1,d.v+5,d.v-5],next);}
      else {q='Which weather did Breeze count most often?';pickOpts(box,most,next);}
    } else {
      if(k===0){var m=Math.random()<.5;q=m?'Which weather happened most often?':'Which weather happened least often?';pickOpts(box,m?most:least,next);}
      else {var two=shuffle(data).slice(0,2).sort(function(a,b){return b.v-a.v;});var diff=two[0].v-two[1].v;q='How many more '+WX[two[0].k].name+' days than '+WX[two[1].k].name+' days were there?';numOpts(box,diff,[diff+1,diff-1,diff+2,two[0].v,two[1].v],next);}
    }
    $('#ty-q').textContent=q; speak(q);
  });
}
/* 2. seasons */
var SEASONS=['spring','summer','autumn','winter'];
var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
function seasonOf(m){return m===11||m<=1?'winter':m<=4?'spring':m<=7?'summer':'autumn';}
var SEASON_WX={spring:'Blossom on the trees, showers and sunny spells',summer:'Long, warm days and lots of sunshine',autumn:'Windy days and falling leaves',winter:'Frosty mornings, ice and maybe snow'};
function pzSeasons(area,L){
  if(L===1){
    var s0=rnd(0,3), ans=[0,1,2,3].map(function(i){return SEASONS[(s0+i)%4];});
    setSay(cap(ans[0])+' comes first. Tap the other seasons in order.');
    orderer(area,{answer:ans,fixed:1,show:function(k){return picSVG2(k);},label:function(k){return k;}},function(ok){finish(ok);});
    return;
  }
  if(L===2){
    var ms=[]; SEASONS.forEach(function(se){var inS=[];for(var m=0;m<12;m++)if(seasonOf(m)===se)inS.push(m);shuffle(inS).slice(0,2).forEach(function(m){ms.push(m);});});
    var items=shuffle(ms).map(function(m,i){return {id:i,text:MONTHS[m],label:MONTHS[m],want:seasonOf(m)};});
    setSay('Which season is each month in? Tap a month, then tap its season. Tap Check when they are all sorted.');
    sorter(area,items,SEASONS.map(function(se){return {id:se,label:cap(se),icon:pic2(se)};}),{zoneWord:'Season'});
    return;
  }
  var start=rnd(0,11), run=[0,1,2,3,4].map(function(i){return MONTHS[(start+i)%12];});
  setSay('Put these months in order, starting with '+run[0]+'.');
  rounds(2,function(k,next){
    if(k===0){
      area.innerHTML=roundNote(0,2)+'<div id="or-box" class="or-box"></div>';
      orderer($('#or-box'),{answer:run,fixed:1,text:true,show:function(x){return esc(x);},label:function(x){return x;}},next);
    } else {
      var m=rnd(0,11), se=seasonOf(m), q='What weather is most likely in '+MONTHS[m]+' in the UK?';
      area.innerHTML=roundNote(1,2)+'<p class="say-small">'+esc(q)+'</p><div class="opts col" id="se-opts"></div>';
      speak(q);
      shuffle(SEASONS).forEach(function(x){var b=optBtn(esc(SEASON_WX[x]),null,'txt');b.addEventListener('click',function(){next(x===se);});$('#se-opts').appendChild(b);});
    }
  });
}
/* 3. rainbow jigsaw */
function pzRainbow(area,L){ pzJigsaw(area,L,'rainbow',rainbowPicture,'the rainbow'); }
/* 4. what shape is that cloud */
function cloudShapeSVG(k,label){
  var p=shapePoints(k), s='<svg class="cloudshape" viewBox="-14 -14 128 128" role="img" aria-label="'+esc(label)+'">', puffs=[];
  for(var i=0;i<p.length;i++){
    var a=p[i], b=p[(i+1)%p.length], len=Math.hypot(b[0]-a[0],b[1]-a[1]), steps=Math.max(1,Math.round(len/8));
    for(var j=0;j<steps;j++){puffs.push([a[0]+(b[0]-a[0])*j/steps,a[1]+(b[1]-a[1])*j/steps]);}
  }
  var poly='M'+p.map(function(q){return f2(q[0])+' '+f2(q[1]);}).join(' L')+' Z';
  s+='<g transform="translate(2 4)" opacity=".35">'; puffs.forEach(function(q){s+='<circle cx="'+f2(q[0])+'" cy="'+f2(q[1])+'" r="7" fill="#8AABD8"/>';}); s+='<path d="'+poly+'" fill="#8AABD8"/></g>';
  puffs.forEach(function(q){s+='<circle cx="'+f2(q[0])+'" cy="'+f2(q[1])+'" r="7" fill="#fff"/>';});
  s+='<path d="'+poly+'" fill="#fff"/>';
  return s+'</svg>';
}
var SYM=[
  {k:'heart',pts:null,axis:[[50,-6],[50,106]],wrong:[[[2,50],[98,50]],[[6,6],[94,94]],[[26,-6],[26,106]]]},
  {k:'tri',pts:[[50,10],[86,88],[14,88]],axis:[[50,-4],[50,104]],wrong:[[[0,62],[100,62]],[[8,8],[92,92]],[[74,-4],[74,104]]]},
  {k:'arrow',pts:[[8,36],[56,36],[56,14],[94,50],[56,86],[56,64],[8,64]],axis:[[-4,50],[104,50]],wrong:[[[50,-4],[50,104]],[[6,6],[94,94]],[[-4,34],[104,34]]]},
  {k:'kite',pts:[[50,6],[80,38],[50,94],[20,38]],axis:[[50,-4],[50,104]],wrong:[[[0,38],[100,38]],[[10,4],[92,96]],[[72,-4],[72,104]]]},
  {k:'house',pts:[[50,8],[88,40],[88,92],[12,92],[12,40]],axis:[[50,-4],[50,104]],wrong:[[[0,52],[100,52]],[[4,4],[96,96]],[[26,-4],[26,104]]]},
  {k:'trap',pts:[[30,24],[70,24],[92,80],[8,80]],axis:[[50,-4],[50,104]],wrong:[[[0,52],[100,52]],[[6,4],[94,98]],[[74,-4],[74,104]]]},
  {k:'rect',pts:[[4,26],[96,26],[96,74],[4,74]],axis:[[50,-4],[50,104]],wrong:[[[4,26],[96,74]],[[24,-4],[24,104]],[[-4,40],[104,40]]]}
];
function pzClouds(area,L){
  if(L===3){
    setSay('A line of symmetry splits a shape into two halves that match like a mirror. Which line is a line of symmetry?');
    var picks=shuffle(SYM).slice(0,3);
    rounds(3,function(k,next){
      var sh=picks[k], pts=sh.pts||shapePoints('heart');
      var lines=shuffle([{l:sh.axis,ok:true}].concat(shuffle(sh.wrong).slice(0,2).map(function(w){return {l:w,ok:false};})));
      var letters=['A','B','C'], cols=['#B8467A','#2E6290','#357A31'];
      var s='<svg class="symsvg" viewBox="-20 -20 140 140" role="img" aria-label="A cloud shape with three dashed lines, A, B and C"><rect x="-20" y="-20" width="140" height="140" rx="14" fill="#CFE6F8"/>';
      s+='<path d="M'+pts.map(function(q){return f2(q[0])+' '+f2(q[1]);}).join(' L')+' Z" fill="#fff" stroke="#8AABD8" stroke-width="2.5" stroke-linejoin="round"/>';
      lines.forEach(function(ln,i){
        var a=ln.l[0], b=ln.l[1];
        s+='<path d="M'+a[0]+' '+a[1]+' L'+b[0]+' '+b[1]+'" stroke="'+cols[i]+'" stroke-width="2.6" stroke-dasharray="6 4" stroke-linecap="round"/>';
        var lx=b[0]+(b[0]>=100?6:b[0]<=0?-6:0), ly=b[1]+(b[1]>=100?6:b[1]<=0?-6:0);
        s+='<circle cx="'+f2(lx)+'" cy="'+f2(ly)+'" r="8" fill="'+cols[i]+'"/><text x="'+f2(lx)+'" y="'+f2(ly+4)+'" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="11" font-weight="600" fill="#fff">'+letters[i]+'</text>';
      });
      s+='</svg>';
      area.innerHTML=roundNote(k,3)+'<div class="panel">'+s+'</div><div class="opts" id="cl-opts"></div>';
      lines.forEach(function(ln,i){var b=optBtn(letters[i],'Line '+letters[i],'word');b.style.color=cols[i];b.addEventListener('click',function(){next(ln.ok);});$('#cl-opts').appendChild(b);});
    });
    return;
  }
  var set1=['circle','square','triangle','heart','star'], set2=['rectangle','pentagon','hexagon','octagon','oval','semicircle','circle','triangle','square','star'];
  var targets = L===1 ? shuffle(set1).slice(0,3) : shuffle(set2).slice(0,3);
  setSay(L===1?'Breeze made a cloud in the shape of something. Which shape is it?':'What is the name of this cloud’s shape?');
  rounds(3,function(k,next){
    var t=targets[k];
    area.innerHTML=roundNote(k,3)+'<div class="panel cloud-panel">'+cloudShapeSVG(t,'A cloud shaped like something')+'</div><div class="opts" id="cl-opts"></div>';
    if(L===1){
      var o=shuffle([t].concat(shuffle(set1.filter(function(x){return x!==t;})).slice(0,2)));
      o.forEach(function(x){var b=optBtn(iconShape(x),'A '+x);b.addEventListener('click',function(){next(x===t);});$('#cl-opts').appendChild(b);});
    } else {
      var near={hexagon:['pentagon','octagon'],pentagon:['hexagon','octagon'],octagon:['hexagon','pentagon'],oval:['circle','semicircle'],circle:['oval','semicircle'],semicircle:['circle','oval'],rectangle:['square','pentagon'],square:['rectangle','triangle'],triangle:['pentagon','square'],star:['pentagon','hexagon']}[t];
      var others=near.concat(shuffle(set2.filter(function(x){return x!==t&&near.indexOf(x)<0;})).slice(0,1));
      wordOpts($('#cl-opts'),[t].concat(others),t,next);
    }
  });
}
/* 5. weather words */
function pzWeatherWords(area,L){ multi(area,L,3,function(R){pzWeatherWords1(area,L,R);}); }
function pzWeatherWords1(area,L,R){
  if(L===3){
    var w=R.fresh(['rainbow','thunder','lightning','sunshine','snowflake','umbrella']), all=[];for(var i=0;i<w.length;i++)all.push(i);
    setSay('Spell the word for this picture. Tap the letters in order.');
    area.innerHTML='<div class="pic">'+picSVG2(w==='sunshine'?'sun':w)+'</div>';
    speller(area,w,all,extraLetters(w,2),function(ok){finish(ok);});
    return;
  }
  var pool = L===1 ? ['sun','rain','snow'] : ['fog','wind','storm','rain','snow','cloud','rainbow'];
  var target = L===1 ? R.fresh(pool) : R.fresh(['fog','wind','storm','cloud','rainbow']);
  var opts = L===1 ? pool.slice() : [target].concat(shuffle(pool.filter(function(x){return x!==target;})).slice(0,3));
  setSay(L===1?'Which picture goes with this word? Tap the word to hear it.':'Read the word. Then tap its picture.');
  area.innerHTML=(L===1?'<button class="bigword wordbtn" id="ww-word" aria-label="The word '+target+'. Tap to hear it.">'+target+'</button>':'<div class="bigword">'+target+'</div>')+'<div class="opts" id="ww-opts"></div>';
  if(L===1)$('#ww-word').addEventListener('click',function(){speak(target,true);});
  picOpts($('#ww-opts'),opts,target,function(ok){finish(ok);},L===1?function(k){return 'Picture: '+k;}:null);
}
var FACTS_BREEZE=[
  'A rainbow appears when sunlight shines through raindrops. The light splits into seven colours.',
  'Clouds are made of tiny drops of water or bits of ice floating in the air.',
  'Snowflakes come in lots of patterns, but almost every one has six points.',
  'Thunder is the sound lightning makes. Light travels faster than sound, so you see the flash first.',
  'Wind is moving air. The sun warms the air, and warm air rises and moves around.'
];
/* her puzzle pictures (100 x 100), added to the shared picture list; any fairy can use them by name */
Object.assign(PICS2,{
  rain:cloudIcon(45,38,1.15,'#E6EDF7','#7E92B8')+'<g stroke="#4E9BC9" stroke-width="5" stroke-linecap="round"><path d="M30 68 l-4 10 M50 68 l-4 10 M70 68 l-4 10 M40 84 l-3 8 M60 84 l-3 8"/></g>',
  snow:cloudIcon(45,36,1.15,'#F4F8FE','#7E92B8')+'<g stroke="#7FB8E0" stroke-width="3" stroke-linecap="round"><path d="M30 64 v12 M24 70 h12 M26 66 l8 8 M34 66 l-8 8 M64 72 v12 M58 78 h12 M60 74 l8 8 M68 74 l-8 8"/></g><circle cx="48" cy="80" r="3" fill="#7FB8E0"/>',
  cloud:cloudIcon(44,54,1.25,'#F4F8FE','#7E92B8'),
  fog:'<g stroke="#9AA4B2" stroke-width="7" stroke-linecap="round"><path d="M14 30 H70 M30 46 H88 M12 62 H66 M26 78 H84"/></g>',
  wind:'<g stroke="#6E9BC8" stroke-width="6" fill="none" stroke-linecap="round"><path d="M10 36 H62 A10 10 0 1 0 52 26"/><path d="M10 54 H78 A10 10 0 1 1 68 64"/><path d="M18 72 H44"/></g><path d="M72 22 C82 18 90 24 86 32 C78 34 72 30 72 22 Z" fill="#7CCB6A" stroke="#3F8A3A" stroke-width="2"/>',
  storm:cloudIcon(45,36,1.15,'#8C96A6','#5E6878')+'<path d="M50 54 L38 76 H50 L44 94 L66 66 H54 L60 54 Z" fill="#F8CF5A" stroke="#C9961E" stroke-width="2.5" stroke-linejoin="round"/><g stroke="#4E9BC9" stroke-width="4" stroke-linecap="round"><path d="M24 64 l-3 8 M78 64 l-3 8"/></g>',
  rainbow:'<g fill="none" stroke-width="7"><path d="M12 76 A38 38 0 0 1 88 76" stroke="#E8574C"/><path d="M19 76 A31 31 0 0 1 81 76" stroke="#F7A055"/><path d="M26 76 A24 24 0 0 1 74 76" stroke="#F8CF5A"/><path d="M33 76 A17 17 0 0 1 67 76" stroke="#6DBE5A"/><path d="M40 76 A10 10 0 0 1 60 76" stroke="#6FB3DE"/></g>'+cloudIcon(16,80,.55,'#fff','#9AB0D6')+cloudIcon(84,80,.55,'#fff','#9AB0D6'),
  lightning:'<path d="M58 8 L26 54 H48 L36 92 L76 40 H54 L66 8 Z" fill="#F8CF5A" stroke="#C9961E" stroke-width="3" stroke-linejoin="round"/>',
  thunder:cloudIcon(45,42,1.15,'#8C96A6','#5E6878')+'<g stroke="#5E6878" stroke-width="4" fill="none" stroke-linecap="round"><path d="M28 70 q4 6 0 12 M42 70 q4 6 0 12 M56 70 q4 6 0 12 M70 70 q4 6 0 12"/></g>',
  umbrella:'<path d="M10 52 C10 26 30 12 50 12 C70 12 90 26 90 52 C84 46 76 46 70 52 C64 46 56 46 50 52 C44 46 36 46 30 52 C24 46 16 46 10 52 Z" fill="#E8574C" stroke="#9C241C" stroke-width="3" stroke-linejoin="round"/><path d="M50 52 V82 A8 8 0 0 1 34 82" stroke="#5E4E6C" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M50 12 C42 26 40 40 40 50 M50 12 C58 26 60 40 60 50" stroke="#9C241C" stroke-width="2" fill="none"/>',
  snowflake:'<g stroke="#5FA0D6" stroke-width="5" stroke-linecap="round"><path d="M50 10 V90 M15 30 L85 70 M15 70 L85 30"/><path d="M50 22 l-8 -8 M50 22 l8 -8 M50 78 l-8 8 M50 78 l8 8 M25 36 l-11 2 M25 36 l-4 -10 M75 64 l11 -2 M75 64 l4 10 M25 64 l-4 10 M25 64 l-11 -2 M75 36 l4 -10 M75 36 l11 2"/></g>',
  spring:'<rect x="0" y="0" width="100" height="100" rx="14" fill="#DDF1FB"/><path d="M0 74 C30 66 70 66 100 74 V86 A14 14 0 0 1 86 100 H14 A14 14 0 0 1 0 86 Z" fill="#9FD283"/><rect x="45" y="44" width="10" height="34" fill="#8A5A30"/><circle cx="50" cy="36" r="24" fill="#B9E49C"/><g fill="#F7B8CF"><circle cx="38" cy="30" r="5"/><circle cx="56" cy="22" r="5"/><circle cx="62" cy="40" r="5"/><circle cx="44" cy="46" r="5"/><circle cx="50" cy="32" r="4"/></g>'+flowerG(20,82,6,'yellow',5)+flowerG(80,84,6,'pink',5),
  summer:'<rect x="0" y="0" width="100" height="100" rx="14" fill="#BFE3F8"/><circle cx="82" cy="18" r="11" fill="#F8CF5A"/><path d="M0 74 C30 66 70 66 100 74 V86 A14 14 0 0 1 86 100 H14 A14 14 0 0 1 0 86 Z" fill="#7CC363"/><rect x="45" y="44" width="10" height="34" fill="#8A5A30"/><circle cx="50" cy="34" r="26" fill="#4E9F45"/><circle cx="40" cy="26" r="9" fill="#6DBE5A"/><circle cx="62" cy="40" r="5" fill="#E8574C"/><circle cx="40" cy="44" r="5" fill="#E8574C"/>',
  autumn:'<rect x="0" y="0" width="100" height="100" rx="14" fill="#F7E6CF"/><path d="M0 74 C30 66 70 66 100 74 V86 A14 14 0 0 1 86 100 H14 A14 14 0 0 1 0 86 Z" fill="#C9A15C"/><rect x="45" y="44" width="10" height="34" fill="#8A5A30"/><circle cx="50" cy="34" r="24" fill="#E8843A"/><circle cx="38" cy="28" r="9" fill="#F2B04A"/><circle cx="62" cy="40" r="8" fill="#C9502E"/><g fill="#E8843A"><ellipse cx="20" cy="60" rx="4" ry="2.5" transform="rotate(30 20 60)"/><ellipse cx="82" cy="54" rx="4" ry="2.5" transform="rotate(-20 82 54)"/><ellipse cx="72" cy="80" rx="4" ry="2.5"/><ellipse cx="28" cy="84" rx="4" ry="2.5" fill="#C9502E"/></g>',
  winter:'<rect x="0" y="0" width="100" height="100" rx="14" fill="#D8E2F0"/><path d="M0 72 C30 64 70 64 100 72 V86 A14 14 0 0 1 86 100 H14 A14 14 0 0 1 0 86 Z" fill="#fff"/><path d="M50 78 V40 M50 56 L34 40 M50 50 L66 34 M50 44 L44 26 M66 34 L72 26 M34 40 L26 36" stroke="#7A5A3A" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M28 34 h8 M62 30 h10 M42 24 h6" stroke="#fff" stroke-width="4" stroke-linecap="round"/><g fill="#fff"><circle cx="16" cy="18" r="2.5"/><circle cx="84" cy="22" r="2.5"/><circle cx="76" cy="50" r="2"/><circle cx="20" cy="48" r="2"/><circle cx="60" cy="14" r="2"/></g>'
});
/* petal icons for her flower (72 x 72) */
Object.assign(PZICON,{
  tally:'<rect x="6" y="12" width="60" height="48" rx="10" fill="#fff" stroke="#8AABD8" stroke-width="3"/><path d="M18 22 V50 M26 22 V50 M34 22 V50 M42 22 V50" stroke="#3B2A4A" stroke-width="3.5" stroke-linecap="round"/><path d="M14 46 L48 26" stroke="#B8467A" stroke-width="3.5" stroke-linecap="round"/>',
  seasons:'<svg x="4" y="4" width="30" height="30" viewBox="0 0 100 100">'+PICS2.spring+'</svg><svg x="38" y="4" width="30" height="30" viewBox="0 0 100 100">'+PICS2.summer+'</svg><svg x="4" y="38" width="30" height="30" viewBox="0 0 100 100">'+PICS2.autumn+'</svg><svg x="38" y="38" width="30" height="30" viewBox="0 0 100 100">'+PICS2.winter+'</svg>',
  rbjig:'<path d="M12 22 h14 a6 6 0 1 1 12 0 h14 v14 a6 6 0 1 0 0 12 v14 h-14 a6 6 0 1 1 -12 0 h-14 Z" fill="#B3A4F0" stroke="#6C5BC4" stroke-width="3" stroke-linejoin="round"/><path d="M18 56 A18 18 0 0 1 46 40" stroke="#E8574C" stroke-width="4" fill="none"/><path d="M22 58 A14 14 0 0 1 44 46" stroke="#F8CF5A" stroke-width="4" fill="none"/>',
  cshapes:'<g transform="translate(6 10) scale(.6)">'+'<circle cx="20" cy="40" r="18" fill="#fff" stroke="#8AABD8" stroke-width="4"/><circle cx="46" cy="28" r="22" fill="#fff" stroke="#8AABD8" stroke-width="4"/><circle cx="76" cy="40" r="18" fill="#fff" stroke="#8AABD8" stroke-width="4"/><rect x="16" y="36" width="64" height="24" fill="#fff"/></g><path d="M44 48 L56 66 H32 Z" fill="#7DBDE6" stroke="#3B2A4A" stroke-width="2.5" stroke-linejoin="round"/>',
  wwords:'<rect x="6" y="16" width="60" height="40" rx="12" fill="#fff" stroke="#4E6BA8" stroke-width="3"/><text x="36" y="45" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="21" font-weight="600" fill="#4E6BA8">rain</text>'
});
/* ---------- Breeze ---------- */
FAIRIES.breeze={id:'breeze',name:'Breeze',kind:'Weather fairy',place:"Breeze's cloud tops",art:breezeArt,body:cloudHouseBody,houseLabel:"Breeze's cloud house on a tall stalk",tapClass:'gust',tapMs:2700,
  facts:FACTS_BREEZE,scene:cloudScene,base:'#D6E7F7',foundBg:'#E6EEFA',
  foundGround:'<g transform="translate(170 336) scale(1.1)"><ellipse cx="0" cy="10" rx="120" ry="14" fill="#C3D2EA"/><circle cx="-70" cy="0" r="22" fill="url(#cloudG)"/><circle cx="-30" cy="-6" r="28" fill="url(#cloudG)"/><circle cx="20" cy="-8" r="30" fill="url(#cloudG)"/><circle cx="66" cy="0" r="22" fill="url(#cloudG)"/><rect x="-96" y="0" width="190" height="16" rx="8" fill="url(#cloudG)"/></g>',
  thanks:'Thank you for helping me tidy the sky.',
  icon:cloudIcon(50,54,1.3,'#fff','#4E6BA8'),
  flowerBase:function(){
    return '<path d="M340 380 C330 460 352 540 340 610" stroke="#2F6B2C" stroke-width="18" fill="none" stroke-linecap="round"/>' +
      '<path d="M340 380 C330 460 352 540 340 610" stroke="#4E9F45" stroke-width="11" fill="none" stroke-linecap="round"/>' +
      cloudPuffs(340,640,1.5,'url(#cloudG)');
  },
  puz:[
    {id:'tally',titles:['Weather count','Weather tally','Weather chart'],run:pzTally},
    {id:'seasons',titles:['Seasons in order','Months and seasons','Months in order'],run:pzSeasons},
    {id:'rbjig',titles:['Rainbow jigsaw','Rainbow jigsaw','Rainbow jigsaw'],run:pzRainbow},
    {id:'cshapes',titles:['Cloud shapes','Name the cloud','Mirror lines'],run:pzClouds},
    {id:'wwords',titles:['Weather words','Read the weather','Spell the weather'],run:pzWeatherWords}
  ]};
FAIRY_ORDER.push('breeze');
