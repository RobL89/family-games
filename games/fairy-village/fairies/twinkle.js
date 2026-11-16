/* Twinkle, the Star fairy: her art, observatory, night meadow, night sky jigsaw picture, moons, pictures,
   facts, puzzles (join the stars, space words, hidden shapes, letter stars, night sky jigsaw) and her FAIRIES entry. */
'use strict';
/* her gradients (added to the shared defs; any fairy can use them) */
addDefs(
'<radialGradient id="twDress" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#8E9AE8"/><stop offset=".55" stop-color="#3E4A98"/><stop offset="1" stop-color="#1F2660"/></radialGradient>' +
'<radialGradient id="twWing" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".6" stop-color="#FFF3B8" stop-opacity=".75"/><stop offset="1" stop-color="#C9A6F0" stop-opacity=".9"/></radialGradient>' +
'<linearGradient id="twLegs" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5A66C4"/><stop offset="1" stop-color="#1F2660"/></linearGradient>' +
'<linearGradient id="domeG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5A66C4"/><stop offset=".6" stop-color="#2A3170"/><stop offset="1" stop-color="#171C48"/></linearGradient>' +
'<linearGradient id="towerG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E4DDF0"/><stop offset=".55" stop-color="#BDB3D3"/><stop offset="1" stop-color="#8A80A6"/></linearGradient>' +
'<linearGradient id="brassG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBE38A"/><stop offset=".5" stop-color="#D9A52E"/><stop offset="1" stop-color="#9A6A16"/></linearGradient>'
);
/* ---------- Twinkle, the Star fairy ---------- */
function twinkleArt(noShadow){
  var skin='url(#skinF)', flat='#583522';
  var stars=''; [[100,196],[132,206],[114,222],[146,226],[94,224],[124,190]].forEach(function(p){stars+='<path d="'+STAR+'" transform="translate('+p[0]+' '+p[1]+') scale(.42) translate(-182 -146)" fill="#FFE07A"/>';});
  return (noShadow?'':'<ellipse cx="120" cy="308" rx="44" ry="7" fill="#1F2660" opacity=".25" filter="url(#fshadow)"/>') +
  '<g class="wings">' +
  '<path d="M112 150 C92 92 38 90 36 126 C34 162 88 168 112 158 Z" fill="url(#twWing)" stroke="#fff" stroke-opacity=".9" stroke-width="1.5"/>' +
  '<path d="M112 166 C84 172 60 198 72 218 C86 236 112 202 116 174 Z" fill="url(#twWing)" stroke="#fff" stroke-opacity=".9" stroke-width="1.5"/>' +
  '<path d="M128 150 C148 92 202 90 204 126 C206 162 152 168 128 158 Z" fill="url(#twWing)" stroke="#fff" stroke-opacity=".9" stroke-width="1.5"/>' +
  '<path d="M128 166 C156 172 180 198 168 218 C154 236 128 202 124 174 Z" fill="url(#twWing)" stroke="#fff" stroke-opacity=".9" stroke-width="1.5"/>' +
  '<g fill="#fff"><circle cx="58" cy="118" r="2"/><circle cx="74" cy="136" r="1.6"/><circle cx="184" cy="118" r="2"/><circle cx="168" cy="138" r="1.6"/></g>' +
  '</g>' +
  /* long lilac hair behind */
  '<path d="M74 108 C70 60 98 50 120 50 C142 50 170 60 166 108 C170 140 172 170 168 196 C156 204 146 198 144 188 L96 188 C94 198 84 204 72 196 C68 170 70 140 74 108 Z" fill="url(#hairLilac)"/>' +
  '<rect x="106" y="228" width="11" height="38" rx="5.5" fill="url(#twLegs)"/><rect x="123" y="228" width="11" height="38" rx="5.5" fill="url(#twLegs)"/>' +
  '<path d="M101 260 H118 V270 C118 276 112 279 104 279 C97 279 95 271 101 260 Z" fill="url(#silverG)"/>' +
  '<path d="M122 260 H139 C145 271 143 279 136 279 C128 279 122 276 122 270 Z" fill="url(#silverG)"/>' +
  '<path d="M104 152 C100 152 98 160 98 168 C92 188 84 214 82 234 C98 242 142 242 158 234 C156 214 148 188 142 168 C142 160 140 152 136 152 Z" fill="url(#twDress)"/>' +
  stars +
  '<path d="M82 234 Q92 240 102 236 Q112 242 122 236 Q132 242 142 236 Q150 240 158 234" stroke="#FFE07A" stroke-width="2" fill="none" opacity=".7"/>' +
  '<path d="M99 174 Q120 182 141 174 L142 181 Q120 189 98 181 Z" fill="url(#silverG)"/>' +
  '<path d="M104 164 C94 176 90 188 88 198" stroke="'+flat+'" stroke-width="10" fill="none" stroke-linecap="round"/>' +
  '<circle cx="88" cy="200" r="6" fill="'+skin+'"/>' +
  '<g class="arm"><path d="M136 164 C150 158 158 148 162 138" stroke="'+flat+'" stroke-width="10" fill="none" stroke-linecap="round"/>' +
  '<path d="M164 136 L178 108" stroke="url(#silverG)" stroke-width="3.5" stroke-linecap="round"/>' +
  '<circle cx="163" cy="136" r="6" fill="'+skin+'"/>' +
  '<circle cx="182" cy="100" r="16" fill="#FFF3B0" opacity=".55" filter="url(#fsoft)"/>' +
  '<path d="'+STAR+'" transform="translate(182 100) scale(1.5) translate(-182 -146)" fill="url(#ggold)" stroke="#B8861E" stroke-width=".8"/></g>' +
  '<rect x="114" y="138" width="12" height="16" rx="4" fill="#47291A"/>' +
  '<circle cx="120" cy="108" r="40" fill="'+skin+'"/>' +
  '<path d="M80 104 C78 70 100 58 120 58 C140 58 162 70 160 104 C156 90 146 84 138 90 C130 80 114 80 108 90 C100 84 86 90 80 104 Z" fill="url(#hairLilac)"/>' +
  '<path d="M98 70 C108 64 124 63 136 68" stroke="#fff" stroke-width="4" opacity=".35" stroke-linecap="round" fill="none"/>' +
  /* crescent moon clip */
  '<path d="M150 70 A12 12 0 1 0 160 88 A9 9 0 1 1 150 70 Z" fill="url(#ggold)"/>' +
  '<path d="M99 102 Q105 98 111 101 M129 101 Q135 98 141 102" stroke="#1E120C" stroke-width="2" fill="none" stroke-linecap="round"/>' +
  '<ellipse cx="106" cy="115" rx="5.5" ry="7" fill="#1E120C"/><ellipse cx="134" cy="115" rx="5.5" ry="7" fill="#1E120C"/>' +
  '<circle cx="108" cy="112" r="2" fill="#fff"/><circle cx="136" cy="112" r="2" fill="#fff"/>' +
  '<ellipse cx="95" cy="127" rx="7" ry="4.5" fill="#E8708F" opacity=".35"/><ellipse cx="145" cy="127" rx="7" ry="4.5" fill="#E8708F" opacity=".35"/>' +
  '<path d="M112 128 Q120 135 128 128" stroke="#3A120C" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
}
/* ---------- houses ---------- */
function observatoryBody(){
  var s='';
  s+='<path d="M66 96 H154 V180 C130 186 90 186 66 180 Z" fill="url(#towerG)" stroke="#8A80A6" stroke-width="1.5"/>';
  for(var r=0;r<5;r++){var y=110+r*15; s+='<path d="M66 '+y+' H154" stroke="#A398BE" stroke-width="1.2" opacity=".6"/>'; for(var x=74+(r%2)*10;x<150;x+=20)s+='<path d="M'+x+' '+(y-15)+' V'+y+'" stroke="#A398BE" stroke-width="1.2" opacity=".5"/>';}
  s+='<path d="M98 182 V158 A12 12 0 0 1 122 158 V182 Z" fill="#3A2A5A"/><path d="M101 182 V159 A9 9 0 0 1 119 159 V182 Z" fill="url(#gwood)"/><circle cx="115" cy="172" r="1.8" fill="url(#ggold)"/>' +
    '<circle cx="134" cy="128" r="9" fill="#5E4E6C"/><circle cx="134" cy="128" r="6.5" fill="#FFE59A"/>';
  /* dome with sliding stars, slit and telescope */
  s+='<defs><clipPath id="domeclip"><path d="M56 98 A54 54 0 0 1 164 98 Z"/></clipPath></defs>';
  s+='<path d="M56 98 A54 54 0 0 1 164 98 Z" fill="url(#domeG)" stroke="#C9D4FF" stroke-width="3"/>';
  s+='<g clip-path="url(#domeclip)"><g class="dstars">';
  [[64,86],[80,60],[98,80],[122,54],[140,76],[156,90],[110,92],[176,70],[196,86],[214,60],[30,70],[44,90]].forEach(function(p,i){s+='<path d="'+STAR+'" transform="translate('+p[0]+' '+p[1]+') scale('+(i%2?.55:.75)+') translate(-182 -146)" fill="#FFE07A"/>';});
  s+='</g></g>';
  s+='<path d="M102 46 C104 60 104 80 102 98 H118 C116 80 116 60 118 46 Z" fill="#171C48" opacity=".7"/>';
  s+='<rect x="52" y="94" width="116" height="8" rx="4" fill="#8A80A6"/>';
  s+='<g transform="translate(110 64) rotate(-34)"><rect x="-6" y="-7" width="62" height="14" rx="4" fill="url(#brassG)" stroke="#9A6A16" stroke-width="1.2"/><rect x="50" y="-9" width="10" height="18" rx="3" fill="url(#brassG)" stroke="#9A6A16" stroke-width="1.2"/></g>';
  /* shooting star that streaks past when tapped */
  s+='<g class="shoot"><path d="M150 26 L196 8" stroke="#FFF3B0" stroke-width="3" stroke-linecap="round" opacity=".8"/><path d="'+STAR+'" transform="translate(198 8) scale(.8) translate(-182 -146)" fill="#FFE07A"/></g>';
  return s;
}
/* ---------- Twinkle's world: the night meadow ---------- */
function nightScene(){
  function ri(i,a){var x=Math.sin(i*12.9898+a*78.233)*43758.5453;return x-Math.floor(x);}
  var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMax slice"><defs>' +
  '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141A44"/><stop offset=".6" stop-color="#2E3A86"/><stop offset="1" stop-color="#5B5FA8"/></linearGradient>' +
  '<radialGradient id="mw" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#C9B8F5" stop-opacity=".35"/><stop offset="1" stop-color="#C9B8F5" stop-opacity="0"/></radialGradient>' +
  '<radialGradient id="moonglow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF6D0" stop-opacity=".6"/><stop offset="1" stop-color="#FFF6D0" stop-opacity="0"/></radialGradient>' +
  '<linearGradient id="hill1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F4C6E"/><stop offset="1" stop-color="#22385A"/></linearGradient>' +
  '<linearGradient id="hill2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E5E5A"/><stop offset="1" stop-color="#1E3E3E"/></linearGradient>' +
  '<filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>' +
  '</defs>';
  s+='<rect width="1200" height="900" fill="url(#sky)"/>';
  s+='<ellipse cx="600" cy="260" rx="700" ry="110" transform="rotate(-14 600 260)" fill="url(#mw)"/>';
  for(var i=0;i<220;i++){var x=ri(i,1)*1200, y=ri(i,2)*640, r=.8+ri(i,3)*1.8; s+='<circle cx="'+f2(x)+'" cy="'+f2(y)+'" r="'+f2(r)+'" fill="#fff" opacity="'+f2(.4+ri(i,4)*.6)+'"/>';}
  /* a few bright stars and a little constellation */
  [[200,130],[260,100],[320,140],[300,200],[230,210]].forEach(function(p,i,a){var q=a[(i+1)%a.length];s+='<path d="M'+p[0]+' '+p[1]+' L'+q[0]+' '+q[1]+'" stroke="#C9D4FF" stroke-width="1.5" opacity=".5"/>';});
  [[200,130],[260,100],[320,140],[300,200],[230,210],[900,80],[1040,160],[760,180]].forEach(function(p){s+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="12" fill="#FFF6D0" opacity=".5" filter="url(#bl)"/><path d="'+STAR+'" transform="translate('+p[0]+' '+p[1]+') scale(.9) translate(-182 -146)" fill="#FFF3B0"/>';});
  /* crescent moon */
  s+='<circle cx="980" cy="160" r="110" fill="url(#moonglow)"/><path d="M960 100 A60 60 0 1 0 1030 200 A48 48 0 1 1 960 100 Z" fill="#FFF3C4"/>';
  /* hills and meadow */
  s+='<path d="M0 540 C220 470 460 490 640 520 C840 470 1040 480 1200 520 V900 H0 Z" fill="url(#hill1)"/>';
  s+='<path d="M0 620 C300 570 700 590 1200 600 V900 H0 Z" fill="url(#hill2)"/>';
  /* glowing night flowers and grass in front */
  for(var g=0;g<40;g++){var gx=ri(g,6)*1200, gy=660+ri(g,7)*230; if(gx>380&&gx<820&&gy<760)continue; s+='<path d="M'+f2(gx)+' '+f2(gy+30)+' q-4 -16 -2 -30" stroke="#3E7A5A" stroke-width="3" fill="none"/><circle cx="'+f2(gx-2)+'" cy="'+f2(gy)+'" r="9" fill="'+(g%3?'#C9B8F5':'#8FE3E8')+'" opacity=".35" filter="url(#bl)"/><circle cx="'+f2(gx-2)+'" cy="'+f2(gy)+'" r="4" fill="'+(g%3?'#E4DDFC':'#CFF6F8')+'"/>';}
  /* fireflies */
  for(var k=0;k<24;k++){var fx=ri(k,8)*1200, fy=420+ri(k,9)*400; s+='<circle cx="'+f2(fx)+'" cy="'+f2(fy)+'" r="7" fill="#FFF3A0" opacity=".45" filter="url(#bl)"/><circle cx="'+f2(fx)+'" cy="'+f2(fy)+'" r="2.2" fill="#FFF8D0"/>';}
  /* tall grass framing the sides */
  for(var j=0;j<26;j++){var x0=(j<13?j*16:1200-(j-13)*16), h=140+ri(j,10)*160, d=j<13?1:-1; s+='<path d="M'+x0+' 900 Q'+(x0+d*10)+' '+f2(900-h/2)+' '+f2(x0+d*ri(j,11)*30)+' '+f2(900-h)+'" stroke="#2F5E4E" stroke-width="6" fill="none" stroke-linecap="round"/>';}
  s+='</svg>';
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
}
/* jigsaw pictures */
function nightPicture(){
  var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">'+allDefs() +
    '<linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141A44"/><stop offset="1" stop-color="#4A4F9A"/></linearGradient>' +
    '<rect width="600" height="600" fill="url(#nsky)"/>';
  for(var i=0;i<80;i++){var x=(i*97)%600, y=(i*53)%380; s+='<circle cx="'+x+'" cy="'+y+'" r="'+(1+(i%3)*.7)+'" fill="#fff" opacity=".8"/>';}
  s+='<path d="M90 60 A50 50 0 1 0 150 150 A40 40 0 1 1 90 60 Z" fill="#FFF3C4"/>';
  [[380,80],[440,60],[500,100],[470,160],[400,150]].forEach(function(p,i,a){var q=a[(i+1)%a.length];s+='<path d="M'+p[0]+' '+p[1]+' L'+q[0]+' '+q[1]+'" stroke="#C9D4FF" stroke-width="2"/><path d="'+STAR+'" transform="translate('+p[0]+' '+p[1]+') translate(-182 -146)" fill="#FFE07A"/>';});
  s+='<path d="M0 420 C150 380 300 390 600 410 V600 H0 Z" fill="#2E5E5A"/>';
  s+='<g transform="translate(200 230) scale(1.5)">'+houseGround()+observatoryBody().replace('id="domeclip"','id="domeclip2"').replace('url(#domeclip)','url(#domeclip2)')+'</g>';
  for(var g=0;g<14;g++){var gx=20+g*42, gy=500+(g%3)*30; s+='<circle cx="'+gx+'" cy="'+gy+'" r="6" fill="'+(g%2?'#E4DDFC':'#CFF6F8')+'"/><path d="M'+gx+' '+(gy+6)+' v24" stroke="#3E7A5A" stroke-width="3"/>';}
  s+='<path d="M420 300 L560 250" stroke="#FFF3B0" stroke-width="4" stroke-linecap="round"/><path d="'+STAR+'" transform="translate(562 250) scale(1.4) translate(-182 -146)" fill="#FFE07A"/>';
  s+='</svg>';
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
}
/* ---------- moon shapes ---------- */
var MOON_NAMES=['new moon','waxing crescent','first quarter','waxing gibbous','full moon','waning gibbous','last quarter','waning crescent'];
function moonInner(i){
  var s='<circle cx="50" cy="50" r="40" fill="#2A3170" stroke="#5A66C4" stroke-width="2"/>';
  if(i===0)return s;
  if(i===4)return s+'<circle cx="50" cy="50" r="40" fill="#FFF3C4"/><circle cx="38" cy="40" r="6" fill="#EADBA0"/><circle cx="60" cy="62" r="8" fill="#EADBA0"/>';
  var waning=i>4, k=waning?8-i:i, rx=f2(Math.abs(Math.cos(k/8*2*Math.PI))*40), sweep=k<2?0:1;
  if(k===2)return s+'<path d="M50 10 A40 40 0 0 1 50 90 Z" fill="#FFF3C4" '+(waning?'transform="translate(100 0) scale(-1 1)"':'')+'/>';
  var d='M50 10 A40 40 0 0 1 50 90 A'+rx+' 40 0 0 '+sweep+' 50 10 Z';
  return s+'<path d="'+d+'" fill="#FFF3C4" '+(waning?'transform="translate(100 0) scale(-1 1)"':'')+'/>';
}
function moonSVG(i,label){return '<svg viewBox="0 0 100 100" '+(label?'role="img" aria-label="'+esc(label)+'"':'aria-hidden="true"')+'>'+moonInner(i)+'</svg>';}
/* ================= Twinkle's night-meadow puzzles ================= */
function perimeterPts(poly,n){
  var segs=[],L=0;for(var i=0;i<poly.length;i++){var a=poly[i],b=poly[(i+1)%poly.length],d=Math.hypot(b[0]-a[0],b[1]-a[1]);segs.push([a,b,d]);L+=d;}
  var out=[];for(var k=0;k<n;k++){var t=k*L/n;for(var j=0;j<segs.length;j++){if(t<=segs[j][2]){var s=segs[j];out.push([s[0][0]+(s[1][0]-s[0][0])*t/s[2],s[0][1]+(s[1][1]-s[0][1])*t/s[2]]);break;}t-=segs[j][2];}}
  return out;
}
var CONSTEL={
  star:function(){return shapePoints('star');},
  heart:function(){return shapePoints('heart');},
  house:function(){return [[18,92],[18,44],[50,12],[82,44],[82,92]];},
  fish:function(){return [[6,50],[26,28],[58,26],[78,44],[96,26],[96,74],[78,56],[58,74],[26,72]];},
  kite:function(){return [[50,6],[86,40],[50,94],[14,40]];},
  /* these four use their corners as the stars, so the picture keeps its shape */
  rocket:function(){return [[50,4],[68,28],[68,68],[86,94],[14,94],[32,68],[32,28]];},
  crown:function(){return [[8,92],[8,26],[30,54],[50,12],[70,54],[92,26],[92,92]];},
  boat:function(){return [[8,62],[46,62],[46,6],[86,56],[94,62],[78,92],[22,92]];},
  tree:function(){return [[50,4],[80,46],[64,46],[88,82],[56,82],[56,96],[44,96],[44,82],[12,82],[36,46],[20,46]];}
};
var CONSTEL_CORNERS={star:1,rocket:1,crown:1,boat:1,tree:1};
/* 1. join the constellation dots */
function pzDots(area,L){ multi(area,L,3,function(R){pzDots1(area,L,R);}); }
function pzDots1(area,L,R){
  var shape=R.fresh(Object.keys(CONSTEL)), n=rnd(8,10), base=CONSTEL[shape]();
  var pts=CONSTEL_CORNERS[shape]?base.slice():perimeterPts(base,n); n=pts.length;
  var step=L===1?1:L===2?pick([2,5,10]):pick([6,8,9,12,15,20,25,30,40,50]), start=L===1?1:step;
  var nums=[];for(var i=0;i<n;i++)nums.push(start+i*step);
  var dots=pts.map(function(p,i){return {x:30+p[0]*3,y:20+p[1]*2.6,v:nums[i],real:true};});
  /* Clever Pixie also has two stars that aren't in the count; Nimble Nymph's harder steps are enough on their own */
  if(L===2){
    var decoys=[nums[n-1]+step,start+Math.round(step/2)*(rnd(1,n-1)*2+1)];
    if(decoys[1]%step===0)decoys[1]+=Math.max(1,Math.round(step/2));
    var cx=dots.reduce(function(a,d){return a+d.x;},0)/n, cy=dots.reduce(function(a,d){return a+d.y;},0)/n;
    /* put each extra star in the clearest spot near the middle, so it never sits on top of another star or its number */
    decoys.forEach(function(v){
      var best=null, bs=-1e9;
      for(var gx=40;gx<=320;gx+=10){for(var gy=34;gy<=256;gy+=10){
        var md=1e9; dots.forEach(function(d){md=Math.min(md,Math.hypot(d.x-gx,(d.y-gy)*1.15));});
        var sc=Math.min(md,64)-0.08*Math.hypot(gx-cx,gy-cy);
        if(sc>bs){bs=sc;best=[gx,gy];}
      }}
      dots.push({x:best[0],y:best[1],v:v,real:false});
    });
  }
  setSay(L===1?'Join the stars to make a picture. Tap them from 1 to '+n+'.':(L===2?'Join the stars by counting in '+step+'s. Start at '+start+'. Some stars are not in the count.':'Join the stars by counting in '+step+'s. Start at '+start+'.'));
  var s='<svg class="skysvg" id="dt-svg" viewBox="0 0 360 300" role="group" aria-label="Stars with numbers"><rect width="360" height="300" rx="18" fill="#1E2660"/>';
  for(var k=0;k<40;k++){s+='<circle cx="'+f2((k*83)%360)+'" cy="'+f2((k*47)%300)+'" r="'+(k%3?0.8:1.4)+'" fill="#fff" opacity=".5"/>';}
  s+='<g id="dt-lines"></g>';
  dots.forEach(function(d,i){
    var cx=180, cy=150, ang=Math.atan2(d.y-cy,d.x-cx), lx=d.x+Math.cos(ang)*20, ly=d.y+Math.sin(ang)*18+5;
    s+='<g class="dot" data-i="'+i+'" tabindex="0" role="button" aria-label="Star number '+d.v+'"><circle cx="'+f2(d.x)+'" cy="'+f2(d.y)+'" r="20" fill="#fff" fill-opacity="0"/><circle class="dglow" cx="'+f2(d.x)+'" cy="'+f2(d.y)+'" r="11" fill="#FFF3B0" opacity=".35"/><circle cx="'+f2(d.x)+'" cy="'+f2(d.y)+'" r="5.5" fill="#FFF3B0"/>' +
      '<text x="'+f2(lx)+'" y="'+f2(ly)+'" text-anchor="middle" font-family="Nunito, sans-serif" font-size="'+(d.v>=1000?14:d.v>=100?15:16)+'" font-weight="800" fill="#fff" stroke="#1E2660" stroke-width="3" paint-order="stroke">'+d.v+'</text></g>';
  });
  s+='</svg>';
  area.innerHTML='<div class="panel sky-wrap">'+s+'</div>';
  var pos=0, busy=false, lines='';
  area.querySelectorAll('.dot').forEach(function(g){
    function hit(){
      if(busy)return; var d=dots[+g.getAttribute('data-i')];
      if(!d.real||d.v!==nums[pos]){busy=true;g.classList.add('bad');later(function(){finish(false);},500);return;}
      g.classList.add('on'); tick();
      if(pos>0){var a=dots[pos-1];lines+='<path d="M'+f2(a.x)+' '+f2(a.y)+' L'+f2(d.x)+' '+f2(d.y)+'" stroke="#FFE07A" stroke-width="3" stroke-linecap="round"/>';}
      pos++;
      if(pos===n){var f0=dots[0];lines+='<path d="M'+f2(d.x)+' '+f2(d.y)+' L'+f2(f0.x)+' '+f2(f0.y)+'" stroke="#FFE07A" stroke-width="3" stroke-linecap="round"/>';busy=true;later(function(){finish(true);},900);}
      $('#dt-lines').innerHTML=lines;
    }
    g.addEventListener('click',hit);
    g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();hit();}});
  });
}
/* 2. space words: match the word to the picture (Clever Pixie: more words; Nimble Nymph: name the picture from tricky words) */
var SPACE_NAME={moon:'moon',star:'star',sun:'sun',planet:'planet',rocket:'rocket',comet:'comet',earth:'Earth',astronaut:'astronaut',telescope:'telescope',satellite:'satellite',fullmoon:'full moon',halfmoon:'half moon',crescent:'crescent moon'};
/* pairs that are both right (the Earth is a planet, the Sun is a star), so they never appear together */
var SPACE_CLASH={planet:['earth'],earth:['planet'],star:['sun'],sun:['star']};
function spaceOK(t){return function(x){return x!==t&&(SPACE_CLASH[t]||[]).indexOf(x)<0;};}
function spacePic(k,label){return '<svg viewBox="0 0 100 100" '+(label?'role="img" aria-label="'+esc(label)+'"':'aria-hidden="true"')+'><rect width="100" height="100" rx="22" fill="#1E2660"/><circle cx="14" cy="16" r="1.5" fill="#fff" opacity=".7"/><circle cx="86" cy="82" r="1.5" fill="#fff" opacity=".7"/><circle cx="84" cy="14" r="1" fill="#fff" opacity=".6"/><g transform="translate(8 8) scale(.84)">'+pic2(k)+'</g></svg>';}
function pzSpaceWords(area,L){
  var pools=[['moon','star','sun','planet','rocket'],['moon','star','sun','planet','rocket','comet','earth','astronaut','telescope'],['astronaut','telescope','satellite','comet','planet','rocket','earth','fullmoon','halfmoon','crescent']];
  var pool=pools[L-1];
  multi(area,L,3,function(R){
    var target=R.fresh(pool), word=SPACE_NAME[target];
    if(L===3){
      /* look at the picture, then pick its name from four words */
      var near={fullmoon:['halfmoon','crescent'],halfmoon:['fullmoon','crescent'],crescent:['fullmoon','halfmoon'],planet:['star','comet'],earth:['fullmoon','planet'],comet:['rocket','star'],rocket:['satellite','comet'],satellite:['telescope','rocket'],telescope:['satellite','astronaut'],astronaut:['rocket','satellite']}[target]||[];
      var opts=[target].concat(near.filter(spaceOK(target))); shuffle(pool).forEach(function(x){if(opts.length<4&&opts.indexOf(x)<0&&spaceOK(target)(x))opts.push(x);});
      setSay('What is this? Read the words and tap the right name.');
      area.innerHTML='<div class="pic spacepic">'+spacePic(target,'A picture of something in space')+'</div><div class="opts col" id="sw-opts"></div>';
      shuffle(opts).forEach(function(x){var b=optBtn(esc(SPACE_NAME[x]),null,'txt');b.addEventListener('click',function(){finish(x===target);});$('#sw-opts').appendChild(b);});
      return;
    }
    var opts2=[target].concat(shuffle(pool.filter(spaceOK(target))).slice(0,L===1?2:3));
    setSay(L===1?'Which picture goes with this word? Tap the word to hear it.':'Read the word. Then tap its picture.');
    area.innerHTML=(L===1?'<button class="bigword wordbtn" id="sw-word" aria-label="The word '+word+'. Tap to hear it.">'+word+'</button>':'<div class="bigword">'+word+'</div>')+'<div class="opts" id="sw-opts"></div>';
    if(L===1)$('#sw-word').addEventListener('click',function(){speak(word,true);});
    shuffle(opts2).forEach(function(x){var b=optBtn(spacePic(x),L===1?'Picture: '+SPACE_NAME[x]:'A picture');b.addEventListener('click',function(){finish(x===target);});$('#sw-opts').appendChild(b);});
  });
}
/* 3. hidden shapes in the sky */
var SKYSHAPE={
  circle:{sides:0,d:function(){return 'M50 14 A36 36 0 1 1 49.9 14 Z';}},
  triangle:{sides:3,d:function(){return ptsPath(regPts(50,56,40,3));}},
  square:{sides:4,d:function(){return 'M20 20 H80 V80 H20 Z';}},
  rectangle:{sides:4,d:function(){return 'M8 32 H92 V68 H8 Z';}},
  pentagon:{sides:5,d:function(){return ptsPath(regPts(50,53,40,5));}},
  hexagon:{sides:6,d:function(){return ptsPath(regPts(50,50,40,6,0));}},
  star:{sides:10,d:function(){return ptsPath(shapePoints('star'));}}
};
function skyShapes(types,count,plural){
  var cells=shuffle([0,1,2,3,4,5,6,7,8,9,10,11]).slice(0,count), list=[];
  cells.forEach(function(c,i){list.push({t:types[i%types.length],x:20+(c%4)*95+rnd(0,20),y:14+Math.floor(c/4)*92+rnd(0,14),k:.62+Math.random()*.18,rot:pick([0,0,15,-15])});});
  return list;
}
function skySVG(list){
  var s='<svg class="skysvg" id="hs-svg" viewBox="0 0 400 300" role="group" aria-label="Shapes hidden in the night sky"><rect width="400" height="300" rx="18" fill="#1E2660"/>';
  for(var k=0;k<50;k++){s+='<circle cx="'+f2((k*79)%400)+'" cy="'+f2((k*41)%300)+'" r="'+(k%3?0.8:1.4)+'" fill="#fff" opacity=".45"/>';}
  list.forEach(function(it,i){
    s+='<g class="hshape" data-i="'+i+'" tabindex="0" role="button" aria-label="A shape in the sky" transform="translate('+it.x+' '+it.y+') scale('+f2(it.k)+') rotate('+it.rot+' 50 50)"><path d="'+SKYSHAPE[it.t].d()+'" fill="#C9D4FF" fill-opacity=".14" stroke="#C9D4FF" stroke-width="4" stroke-linejoin="round" stroke-dasharray="2 7" stroke-linecap="round"/></g>';
  });
  return s+'</svg>';
}
function pzHidden(area,L){
  var plural={circle:'circles',triangle:'triangles',square:'squares',rectangle:'rectangles',pentagon:'pentagons',hexagon:'hexagons',star:'stars'};
  if(L===3){
    setSay('Look at the shapes in the sky. Count their sides and corners carefully.');
    var list=skyShapes(shuffle(['triangle','square','pentagon','hexagon']).concat(['triangle','square']),10);
    var present=shuffle(['triangle','square','pentagon','hexagon'].filter(function(t){return list.some(function(x){return x.t===t;});}));
    rounds(3,function(k,next){
      var q,ans,t;
      if(k===0){t=present[0]; ans=list.filter(function(x){return x.t===t;}).length*SKYSHAPE[t].sides; q='How many sides do all the '+plural[t]+' have altogether?';}
      else if(k===1){ans=list.reduce(function(a,x){return a+(x.t==='triangle'||x.t==='square'?SKYSHAPE[x.t].sides:0);},0); q='How many corners do all the triangles and squares have altogether?';}
      else {t=present[1]||present[0]; ans=list.filter(function(x){return x.t===t;}).length*SKYSHAPE[t].sides; q='How many corners do all the '+plural[t]+' have altogether?';}
      area.innerHTML=roundNote(k,3)+'<div class="panel sky-wrap">'+skySVG(list)+'</div><p class="say-small">'+esc(q)+'</p><div class="opts" id="hs-opts"></div>';
      speak(q);
      numOpts($('#hs-opts'),ans,[ans+1,ans-1,ans+3,ans-3,ans+4],next);
    });
    return;
  }
  multi(area,L,3,function(R){pzHidden1(area,L,R,plural);});
}
function pzHidden1(area,L,R,plural){
  var types=L===1?['circle','triangle','square']:['star','rectangle','pentagon','hexagon'];
  var target=L===1?R.fresh(['circle','triangle','square']):R.fresh(['star','rectangle','pentagon']);
  var list2, nT=rnd(3,4);
  do{list2=skyShapes(shuffle(types),9);}while(false);
  var others=types.filter(function(t){return t!==target;}); list2.forEach(function(it,i){it.t=i<nT?target:others[i%others.length];});
  list2=shuffle(list2);
  setSay('Some shapes are hiding in the sky. Tap all the '+plural[target]+'.');
  area.innerHTML='<div class="panel sky-wrap">'+skySVG(list2)+'</div><p class="count-note" id="hs-note">Found 0</p>';
  var found=0, busy=false;
  area.querySelectorAll('.hshape').forEach(function(g){
    function hit(){
      if(busy||g.classList.contains('on'))return; var it=list2[+g.getAttribute('data-i')];
      if(it.t!==target){busy=true;g.classList.add('bad');later(function(){finish(false);},500);return;}
      g.classList.add('on'); tick(); found++; $('#hs-note').textContent='Found '+found;
      if(found===nT){busy=true;later(function(){finish(true);},700);}
    }
    g.addEventListener('click',hit);
    g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();hit();}});
  });
}
/* 4. letter stars */
function starBtn(ch,id){return '<button type="button" class="lstar" id="'+id+'" aria-label="Star with the letter '+ch+'"><span>'+ch+'</span></button>';}
function pzLetterStars(area,L){ multi(area,L,3,function(R){pzLetterStars1(area,L,R);}); }
function pzLetterStars1(area,L,R){
  if(L===1){
    var tgt=R.fresh(['s','a','t','m','o','p','n','e','r','c','d','g']), n=rnd(3,4), others='samtonrepcdg'.split('').filter(function(c){return c!==tgt;}), letters=[];
    for(var i=0;i<n;i++)letters.push(tgt); for(var j=0;j<10-n;j++)letters.push(pick(others));
    letters=shuffle(letters);
    setSay('Tap every star with the letter '+tgt+' on it.');
    area.innerHTML='<div class="bigletter" aria-hidden="true">'+tgt+'</div><div class="starfield">'+letters.map(function(c,i){return starBtn(c,'ls-'+i);}).join('')+'</div><p class="count-note" id="ls-note">Found 0</p>';
    var found=0, busy=false;
    letters.forEach(function(c,i){$('#ls-'+i).addEventListener('click',function(){
      if(busy||this.classList.contains('on'))return;
      if(c!==tgt){busy=true;this.classList.add('bad');later(function(){finish(false);},500);return;}
      this.classList.add('on');tick();found++;$('#ls-note').textContent='Found '+found;
      if(found===n){busy=true;later(function(){finish(true);},700);}
    });});
    return;
  }
  if(L===2){
    var w=R.fresh(['moon','star','sun','comet','rocket','planet','earth']), all=[];for(var k=0;k<w.length;k++)all.push(k);
    setSay('Spell the word for this picture. Tap the stars in order.');
    area.innerHTML='<div class="pic">'+picSVG2(w)+'</div><div class="starry or-box" id="sp-wrap"></div>';
    speller($('#sp-wrap'),w,all,extraLetters(w,3),function(ok){finish(ok);});
    return;
  }
  /* word search */
  var SKYWORDS=['moon','star','comet','orbit','planet','rocket','mars','sun','venus','night','space','glow','dark','sky'];
  var words=[R.fresh(SKYWORDS)]; words.push(R.fresh(SKYWORDS)); var N=6, grid=[], placed=[], tries=0;
  function attempt(){
    grid=[];for(var r=0;r<N;r++){grid.push([]);for(var c=0;c<N;c++)grid[r].push('');}
    placed=[];
    for(var wi=0;wi<words.length;wi++){
      var w2=words[wi], ok=false;
      for(var t=0;t<80&&!ok;t++){
        var dir=pick([[0,1],[1,0]]), r0=rnd(0,N-1-(dir[0]?w2.length-1:0)), c0=rnd(0,N-1-(dir[1]?w2.length-1:0)), fits=true;
        for(var q=0;q<w2.length;q++){var cell=grid[r0+dir[0]*q][c0+dir[1]*q];if(cell&&cell!==w2[q])fits=false;}
        if(fits){for(q=0;q<w2.length;q++)grid[r0+dir[0]*q][c0+dir[1]*q]=w2[q];placed.push({w:w2,a:[r0,c0],b:[r0+dir[0]*(w2.length-1),c0+dir[1]*(w2.length-1)]});ok=true;}
      }
      if(!ok)return false;
    }
    return true;
  }
  while(!attempt()&&tries<50)tries++;
  var fill='abcdefghijklmnoprstuvwy';
  for(var r=0;r<N;r++)for(var c=0;c<N;c++)if(!grid[r][c])grid[r][c]=fill[rnd(0,fill.length-1)];
  setSay('Find the two space words. Tap the first letter of a word, then its last letter.');
  var h='<div class="wlist">'+words.map(function(x){return '<span id="wl-'+x+'">'+x+'</span>';}).join('')+'</div><div class="wgrid" style="grid-template-columns:repeat('+N+',1fr)">';
  for(r=0;r<N;r++)for(c=0;c<N;c++)h+='<button type="button" class="wcell" id="wc-'+r+'-'+c+'" data-r="'+r+'" data-c="'+c+'" aria-label="Row '+(r+1)+', column '+(c+1)+', letter '+grid[r][c]+'">'+grid[r][c]+'</button>';
  area.innerHTML=h+'</div>';
  var first=null, done=0, busy=false;
  area.querySelectorAll('.wcell').forEach(function(b){b.addEventListener('click',function(){
    if(busy)return; var p=[+b.getAttribute('data-r'),+b.getAttribute('data-c')];
    if(!first){first=p;b.classList.add('sel');tick();return;}
    var hitW=placed.filter(function(x){return !x.found&&x.a[0]===first[0]&&x.a[1]===first[1]&&x.b[0]===p[0]&&x.b[1]===p[1];})[0];
    $('#wc-'+first[0]+'-'+first[1]).classList.remove('sel'); first=null;
    if(!hitW){busy=true;b.classList.add('bad');later(function(){finish(false);},500);return;}
    hitW.found=true; done++; chime();
    for(var q=0;q<hitW.w.length;q++){var rr=hitW.a[0]+(hitW.b[0]>hitW.a[0]?q:0), cc=hitW.a[1]+(hitW.b[1]>hitW.a[1]?q:0);$('#wc-'+rr+'-'+cc).classList.add('found');}
    $('#wl-'+hitW.w).classList.add('found');
    if(done===words.length){busy=true;later(function(){finish(true);},700);}
  });});
}
/* 5. night sky jigsaw */
function pzNightJig(area,L){ jigsawSet(area,L,'twinkle',[{key:'night',fn:nightPicture,what:'the night sky'}]); }
/* her puzzle pictures (100 x 100), added to the shared picture list; any fairy can use them by name */
Object.assign(PICS2,{
  /* ---------- puzzle pictures (100 x 100) ---------- */
  moon:'<path d="M42 12 A40 40 0 1 0 88 66 A32 32 0 1 1 42 12 Z" fill="#FFF3C4" stroke="#C9A64A" stroke-width="3"/>',
  comet:'<path d="M14 86 L58 42" stroke="#C9B8F5" stroke-width="14" stroke-linecap="round" opacity=".5"/><path d="M24 90 L60 50 M10 76 L50 38" stroke="#FFE07A" stroke-width="4" stroke-linecap="round" opacity=".7"/><circle cx="66" cy="34" r="18" fill="url(#ggold)" stroke="#B8861E" stroke-width="3"/>',
  rocket:'<path d="M50 6 C66 18 70 40 68 66 H32 C30 40 34 18 50 6 Z" fill="#fff" stroke="#3E4A98" stroke-width="3"/><circle cx="50" cy="36" r="9" fill="#7DBDE6" stroke="#3E4A98" stroke-width="3"/><path d="M32 50 L18 70 H32 Z M68 50 L82 70 H68 Z" fill="#E8574C" stroke="#9C241C" stroke-width="2.5" stroke-linejoin="round"/><path d="M40 68 C40 82 50 94 50 94 C50 94 60 82 60 68 Z" fill="#F7A055"/>',
  planet:'<ellipse cx="50" cy="52" rx="44" ry="13" fill="none" stroke="#C9A64A" stroke-width="6" transform="rotate(-16 50 52)"/><circle cx="50" cy="50" r="25" fill="#F7A055" stroke="#B8661E" stroke-width="3"/><path d="M28 42 C40 46 60 46 73 42 M26 54 C40 58 62 58 74 54" stroke="#FBC28E" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M6 52 A44 13 0 0 0 94 52" stroke="#C9A64A" stroke-width="6" fill="none" transform="rotate(-16 50 52)"/>',
  earth:'<circle cx="50" cy="50" r="38" fill="#4FA9DE" stroke="#2E6290" stroke-width="3"/><path d="M30 26 C40 22 50 30 46 40 C42 48 30 46 26 54 C20 46 22 32 30 26 Z M56 52 C66 46 80 52 78 64 C74 76 62 82 56 74 C52 66 50 58 56 52 Z M60 18 C68 18 74 24 70 30 C64 32 58 26 60 18 Z" fill="#6DBE5A" stroke="#357A31" stroke-width="2"/><ellipse cx="38" cy="34" rx="8" ry="4" fill="#fff" opacity=".35"/>',
  astronaut:'<path d="M18 96 C18 72 32 64 50 64 C68 64 82 72 82 96 Z" fill="#F4F6FA" stroke="#6E7888" stroke-width="3"/><rect x="40" y="72" width="20" height="14" rx="3" fill="#7DBDE6" stroke="#3E7FB0" stroke-width="2"/><circle cx="50" cy="38" r="28" fill="#F4F6FA" stroke="#6E7888" stroke-width="3"/><rect x="30" y="26" width="40" height="26" rx="12" fill="#3E4A98" stroke="#2A3170" stroke-width="2"/><path d="M36 32 C40 28 46 28 48 30" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>',
  telescope:'<path d="M50 60 L32 94 M50 60 L68 94 M50 60 V94" stroke="#6A3F20" stroke-width="5" stroke-linecap="round"/><g transform="rotate(-30 50 54)"><rect x="12" y="44" width="70" height="20" rx="5" fill="#7DBDE6" stroke="#2E6290" stroke-width="3"/><rect x="78" y="40" width="12" height="28" rx="3" fill="#3E7FB0" stroke="#2E6290" stroke-width="3"/><rect x="4" y="48" width="10" height="12" rx="2" fill="#3E7FB0" stroke="#2E6290" stroke-width="2"/></g><circle cx="50" cy="58" r="5" fill="#2E6290"/>',
  satellite:'<g transform="rotate(-20 50 50)"><rect x="4" y="38" width="28" height="24" rx="2" fill="#3E4A98" stroke="#C9D4FF" stroke-width="2"/><path d="M11 38 V62 M18 38 V62 M25 38 V62 M4 50 H32" stroke="#C9D4FF" stroke-width="1.5"/><rect x="68" y="38" width="28" height="24" rx="2" fill="#3E4A98" stroke="#C9D4FF" stroke-width="2"/><path d="M75 38 V62 M82 38 V62 M89 38 V62 M68 50 H96" stroke="#C9D4FF" stroke-width="1.5"/><path d="M32 50 H68" stroke="#9AA6B8" stroke-width="4"/><rect x="38" y="36" width="24" height="28" rx="4" fill="url(#ggold)" stroke="#B8861E" stroke-width="2.5"/><path d="M50 36 V24 M44 20 C48 26 52 26 56 20" stroke="#9AA6B8" stroke-width="3" fill="none" stroke-linecap="round"/></g>',
  crescent:'<path d="M42 12 A40 40 0 1 0 88 66 A32 32 0 1 1 42 12 Z" fill="#FFF3C4" stroke="#C9A64A" stroke-width="3"/>',
  fullmoon:'<circle cx="50" cy="50" r="38" fill="#FFF3C4" stroke="#C9A64A" stroke-width="3"/><circle cx="38" cy="40" r="6" fill="#EADBA0"/><circle cx="60" cy="62" r="8" fill="#EADBA0"/><circle cx="62" cy="34" r="4" fill="#EADBA0"/>',
  halfmoon:'<circle cx="50" cy="50" r="38" fill="#3A4384" opacity=".6"/><path d="M50 12 A38 38 0 0 1 50 88 Z" fill="#FFF3C4" stroke="#C9A64A" stroke-width="3" stroke-linejoin="round"/>'
});
/* petal icons for her flower (72 x 72) */
Object.assign(PZICON,{
  /* ---------- petal icons ---------- */
  dots:'<rect x="4" y="8" width="64" height="56" rx="10" fill="#1E2660"/><path d="M14 50 L26 20 L42 34 L58 16" stroke="#FFE07A" stroke-width="3" fill="none"/><g fill="#FFF3B0"><circle cx="14" cy="50" r="4"/><circle cx="26" cy="20" r="4"/><circle cx="42" cy="34" r="4"/><circle cx="58" cy="16" r="4"/><circle cx="56" cy="50" r="4"/></g>',
  moons:'<g transform="translate(2 22) scale(.3)">'+moonInner(1)+'</g><g transform="translate(22 22) scale(.3)">'+moonInner(2)+'</g><g transform="translate(42 22) scale(.3)">'+moonInner(4)+'</g>',
  hidden:'<rect x="4" y="8" width="64" height="56" rx="10" fill="#1E2660"/><path d="M22 20 L34 42 H10 Z" fill="none" stroke="#C9D4FF" stroke-width="3" stroke-dasharray="2 4"/><circle cx="50" cy="40" r="11" fill="none" stroke="#FFE07A" stroke-width="3"/>',
  lstars:'<path d="'+STAR+'" transform="translate(24 36) scale(2.1) translate(-182 -146)" fill="url(#ggold)"/><path d="'+STAR+'" transform="translate(52 30) scale(1.6) translate(-182 -146)" fill="url(#ggold)"/><text x="24" y="42" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="13" font-weight="600" fill="#3B2A4A">s</text>',
  nightjig:'<path d="M12 22 h14 a6 6 0 1 1 12 0 h14 v14 a6 6 0 1 0 0 12 v14 h-14 a6 6 0 1 1 -12 0 h-14 Z" fill="#3E4A98" stroke="#1F2660" stroke-width="3" stroke-linejoin="round"/><path d="'+STAR+'" transform="translate(32 40) scale(1.2) translate(-182 -146)" fill="#FFE07A"/>'
});
/* ---------- Twinkle ---------- */
FAIRIES.twinkle={id:'twinkle',name:'Twinkle',kind:'Star fairy',place:"Twinkle's night meadow",art:twinkleArt,body:observatoryBody,houseLabel:"Twinkle's little observatory",tapClass:'starry-turn',tapMs:2600,
  onTap:function(){if(!mem.sound)return;[1567.98,1318.5,1046.5,1318.5,1567.98,2093].forEach(function(f,i){bellTone(f,i*.11,.6,.08);});},
  facts:[
    'The Sun is a star. It looks bigger and brighter than the others because it is much closer to us.',
    'The Moon does not make its own light. It shines because sunlight bounces off it.',
    'A constellation is a group of stars that people join up to make a picture, like a hunter or a bear.',
    'It takes about a month for the Moon to go through all its shapes.',
    'A shooting star is not really a star. It is a tiny bit of space rock burning up as it falls through the air.'
  ],
  scene:nightScene,base:'#2E3A86',foundBg:'#DCDFF5',
  foundGround:'<ellipse cx="170" cy="340" rx="150" ry="20" fill="#2E5E5A"/><g fill="#E4DDFC"><circle cx="70" cy="334" r="4"/><circle cx="120" cy="344" r="4"/><circle cx="236" cy="340" r="4"/><circle cx="280" cy="334" r="4"/></g>',
  thanks:'Thank you for helping me light up the sky.',jigThings:['moon','comet','rocket','planet','telescope','astronaut'],
  icon:'<path d="'+STAR+'" transform="translate(50 54) scale(3.2) translate(-182 -146)" fill="#FFE07A" stroke="#fff" stroke-width=".6"/>',
  flowerBase:function(){
    return '<ellipse cx="340" cy="672" rx="290" ry="44" fill="#2E5E5A" opacity=".75"/>' +
      '<path d="M340 380 C330 470 352 580 340 676" stroke="#2F6B2C" stroke-width="18" fill="none" stroke-linecap="round"/>' +
      '<path d="M340 380 C330 470 352 580 340 676" stroke="#4E9F45" stroke-width="11" fill="none" stroke-linecap="round"/>' +
      '<path d="M340 640 C300 600 250 600 226 620 C258 658 306 660 340 640 Z" fill="url(#ptleaf)" stroke="#2F6B2C" stroke-width="2.5"/>' +
      '<g fill="#FFF3B0"><circle cx="180" cy="660" r="5"/><circle cx="230" cy="684" r="4"/><circle cx="460" cy="668" r="5"/><circle cx="500" cy="684" r="4"/><circle cx="420" cy="690" r="3"/></g>';
  },
  puz:[
    {id:'dots',titles:['Join the stars','Count the stars','Big star counts'],run:pzDots},
    {id:'moons',titles:['Space words','Space words','Name it'],run:pzSpaceWords},
    {id:'hidden',titles:['Hidden shapes','Hidden shapes','Count the sides'],run:pzHidden},
    {id:'lstars',titles:['Letter stars','Spell with stars','Star word search'],run:pzLetterStars},
    {id:'nightjig',titles:['Night sky jigsaw','Night sky jigsaw','Night sky jigsaw'],run:pzNightJig}
  ]};
FAIRY_ORDER.push('twinkle');
