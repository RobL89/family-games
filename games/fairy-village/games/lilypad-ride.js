/* ================================================================
   LILYPAD RIDE - Ripple's game (phase 9; rebuilt in 3D in phase 11)
   Ripple rides her lilypad up the river, seen from just behind her like other endless runners:
   the river runs away to the far hills and things come towards her out of the distance, growing
   as they come. Steer left and right round rocks, jump over logs that float on the water, and
   duck under branches and bridges that hang over it. Logs carry a green Jump sign (an up arrow)
   and branches and bridges a purple Duck sign (a down arrow) with water showing under them,
   matching the Jump and Duck buttons. It speeds up and gets busier:
   rocks first, then logs, then branches and bridges, then pairs of rocks.
   Hitting anything ends the ride. Score: time on the lilypad, in whole seconds.
   Controls: swipe (left, right, up to jump, down to duck), tap beside Ripple to steer or on her to jump,
   arrow keys or WASD (Space jumps), or the four big buttons under the river.
   The view: a point a distance z ahead (in lane widths) is drawn D/(z+D) of its full size,
   shrinking towards the horizon. Ripple is drawn from behind (lrBackArt).
   Names in this file start with lr so they don't clash with other files.
   ================================================================ */
var LR_SET={
  speed:{start:[2.4,2.9,3.4],grow:[.012,.015,.018],max:[4.8,5.8,6.9]},  /* river speed, lane widths a second */
  gap:{start:[2.0,1.7,1.45],min:[1.1,.9,.75]},                          /* seconds between things in the river */
  logsFrom:[9,6,4], overFrom:[18,12,8], pairsFrom:[32,22,14],             /* seconds before logs, branches and bridges, two rocks at once */
  jump:[.95,.82,.74], duck:[1.0,.88,.8],                                  /* how long a jump and a duck last */
  far:15, D:4.6                                                           /* how far ahead things appear, and the camera distance behind Ripple */
};
/* Ripple from behind: wavy hair over the back of her head, her wings in front of her back, the wand held up */
function lrBackArt(){
  var flat='#EDBB98';
  return '<rect x="106" y="228" width="11" height="38" rx="5.5" fill="url(#rpLegs)"/><rect x="123" y="228" width="11" height="38" rx="5.5" fill="url(#rpLegs)"/>' +
  '<path d="M100 262 H118 V269 C118 275 112 278 104 278 C96 278 94 272 100 262 Z" fill="url(#shellG)" stroke="#C9826E" stroke-width="1.2"/>' +
  '<path d="M122 262 H140 C146 272 144 278 136 278 C128 278 122 275 122 269 Z" fill="url(#shellG)" stroke="#C9826E" stroke-width="1.2"/>' +
  '<path d="M104 152 C100 152 98 160 98 168 C92 188 84 214 80 232 Q90 244 100 234 Q110 246 120 236 Q130 246 140 234 Q150 244 160 232 C156 214 148 188 142 168 C142 160 140 152 136 152 Z" fill="url(#rpDress)"/>' +
  '<path d="M90 214 Q98 207 106 214 T122 214 T138 214 T154 214" stroke="#fff" stroke-width="2.5" fill="none" opacity=".6" stroke-linecap="round"/>' +
  '<path d="M99 174 Q120 182 141 174 L142 181 Q120 189 98 181 Z" fill="url(#shellG)"/>' +
  '<circle cx="120" cy="104" r="40" fill="url(#rpHair)" stroke="#2A7E98" stroke-width="2.5"/>' +
  '<path d="M76 108 C72 60 98 50 120 50 C142 50 168 60 164 108 C166 128 168 146 170 162 C162 170 152 168 148 162 C146 172 134 176 128 170 L112 170 C106 176 94 172 92 162 C88 168 78 170 70 162 C72 146 74 128 76 108 Z" fill="url(#rpHair)" stroke="#2A7E98" stroke-width="2.5" stroke-linejoin="round"/>' +
  '<path d="M98 70 C93 100 94 130 98 160 M120 60 C119 100 119 130 120 164 M142 70 C147 100 146 130 142 160" stroke="#fff" stroke-width="3" opacity=".3" fill="none" stroke-linecap="round"/>' +
  '<path d="M136 164 C126 176 122 188 120 196" transform="translate(-32 0)" stroke="'+flat+'" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="88" cy="198" r="6" fill="url(#skinB)"/>' +
  '<path d="M136 164 C150 158 158 148 162 138" stroke="'+flat+'" stroke-width="10" fill="none" stroke-linecap="round"/>' +
  '<path d="M164 136 L178 112" stroke="#C9826E" stroke-width="3" stroke-linecap="round"/><circle cx="163" cy="136" r="6" fill="url(#skinB)"/>' +
  '<circle cx="181" cy="104" r="14" fill="#BFEAF8" opacity=".5"/>' +
  '<path d="M181 88 C187 98 191 104 191 109 A10 10 0 0 1 171 109 C171 104 175 98 181 88 Z" fill="url(#waterG)" stroke="#fff" stroke-width="1.5"/>' +

  '<g transform="translate(92 78) rotate(-20)"><path d="M0 8 L-9 -2 C-9 -10 9 -10 9 -2 Z" fill="url(#shellG)" stroke="#C9826E" stroke-width="1.2" stroke-linejoin="round"/></g>' +
  '<g opacity=".78">' +
  '<path d="M112 150 C78 112 28 104 28 126 C28 148 80 156 112 158 Z" fill="url(#rpWing)" stroke="#fff" stroke-opacity=".9" stroke-width="2"/>' +
  '<path d="M112 164 C82 170 46 188 52 206 C60 222 100 196 116 172 Z" fill="url(#rpWing)" stroke="#fff" stroke-opacity=".9" stroke-width="2"/>' +
  '<path d="M128 150 C162 112 212 104 212 126 C212 148 160 156 128 158 Z" fill="url(#rpWing)" stroke="#fff" stroke-opacity=".9" stroke-width="2"/>' +
  '<path d="M128 164 C158 170 194 188 188 206 C180 222 140 196 124 172 Z" fill="url(#rpWing)" stroke="#fff" stroke-opacity=".9" stroke-width="2"/>' +
  '<path d="M112 152 C88 132 60 122 38 124 M112 156 C86 152 62 146 40 136 M114 170 C96 184 74 196 60 204 M128 152 C152 132 180 122 202 124 M128 156 C154 152 178 146 200 136 M126 170 C144 184 166 196 180 204" stroke="#fff" stroke-width="1" fill="none" opacity=".6"/>' +
  '</g>';
}
function lrHowArt(k){
  if(k==='rock') return '<ellipse cx="22" cy="40" rx="16" ry="5" fill="#fff" opacity=".8"/><circle cx="22" cy="32" r="13" fill="#A3ADB8" stroke="#6C7684" stroke-width="2.5"/><circle cx="18" cy="28" r="4" fill="#fff" opacity=".5"/><path d="M40 52 C54 44 54 22 40 12" stroke="#2E6E8E" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M34 14 L41 11 L42 19" stroke="#2E6E8E" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  if(k==='log') return '<rect x="4" y="38" width="56" height="16" rx="8" fill="#8A5A30" stroke="#5E3B1C" stroke-width="2.5"/><ellipse cx="54" cy="46" rx="5" ry="8" fill="#E2B98A" stroke="#5E3B1C" stroke-width="2"/><path d="M32 30 V8 M22 17 L32 7 L42 17" stroke="#2E6E8E" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  return '<path d="M2 14 C22 18 42 12 62 18" stroke="#7A4E2A" stroke-width="6" stroke-linecap="round" fill="none"/><ellipse cx="18" cy="22" rx="9" ry="5" fill="#6FAE55"/><ellipse cx="46" cy="22" rx="9" ry="5" fill="#6FAE55"/><path d="M32 32 V56 M22 47 L32 57 L42 47" stroke="#2E6E8E" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
}
var LR_ICON={
  left:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  right:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  jump:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 15l7-7 7 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 20h14" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".4"/></svg>',
  duck:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".4"/><path d="M5 9l7 7 7-7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
GAMES.ripple={
  name:'Lilypad ride',
  intro:function(L){return 'Ripple rides her lilypad up the river. Steer round rocks, jump over logs with a green up arrow, and duck under branches and bridges with a purple down arrow. Swipe, or use the buttons. It gets faster as you go!';},
  how:[{art:lrHowArt('rock'),text:'Steer'},{art:lrHowArt('log'),text:'Jump'},{art:lrHowArt('branch'),text:'Duck'}],
  lives:0,
  timed:true,
  pad:[{id:'left',label:'Left',icon:LR_ICON.left},{id:'jump',label:'Jump',icon:LR_ICON.jump},{id:'duck',label:'Duck',icon:LR_ICON.duck},{id:'right',label:'Right',icon:LR_ICON.right}],
  keys:{ArrowLeft:'left',ArrowRight:'right',ArrowUp:'jump',ArrowDown:'duck',a:'left',d:'right',w:'jump',s:'duck',A:'left',D:'right',W:'jump',S:'duck',' ':'jump'},
  hud:function(n){return Math.floor(n)+' s';},
  unit:function(n){return n+' second'+(n===1?'':'s');},
  said:function(n){return n<1?'Splash! That was a quick ride.':'You rode the river for '+n+' second'+(n===1?'':'s')+'!';},
  make:function(K){
    var i=K.L-1, lane=1, lx=0, jumpT=-1, duckT=-1, dead=false, deadT=0, nextIn=1.4, count=0, last=null, lastJD=-9, t2=0, sway=0;
    var things=[], decor=[], waves=[], splash=[], down=null, RIV=1.75, D=LR_SET.D, FAR=LR_SET.far;
    var ripple=K.img('lr-ripple-back',lrBackArt(),'0 0 240 320',90,120);
    /* the view: lane width at Ripple (ls pixels), the horizon, Ripple's water line */
    function geo(){
      var ls=Math.min(116,K.W*.24), hz=Math.max(K.H*.3,80), ry=K.H-92;
      return {ls:ls,cx:K.W/2,hz:hz,ry:ry,W:K.W,H:K.H};
    }
    function k(z){return D/Math.max(.05,z+D);}                                         /* how big things are at distance z */
    function P(g,x,z,y){var f=k(z);return {x:g.cx+x*g.ls*f,y:g.hz+(g.ry-g.hz)*f-(y||0)*g.ls*f,s:g.ls*f};}   /* a point x across, z ahead, y up */
    function zBottom(g){return D*(g.ry-g.hz)/(g.H-g.hz)-D;}                             /* the nearest z still on screen */
    function hgt(){return jumpT<0?0:Math.sin(Math.PI*Math.min(1,jumpT/LR_SET.jump[i]));}
    function ducking(){return duckT>=0;}
    function air(){var q=jumpT/LR_SET.jump[i];return jumpT>=0&&q>.05&&q<.95;}   /* off the water almost as soon as jump is pressed */
    /* things on the banks and sparkles on the water, spread out along the river */
    for(var d0=0;d0<44;d0++)decor.push({z:-1+Math.random()*(FAR+4),side:d0%2?1:-1,k:Math.floor(Math.random()*5),o:Math.random()});
    for(var w0=0;w0<26;w0++)waves.push({z:-1+Math.random()*(FAR+4),x:(Math.random()*2-1)*(RIV-.25),s:.6+Math.random()*.6});
    function spawn(){
      var t=K.t, r=Math.random(), type='rock';
      if(t>=LR_SET.overFrom[i]){type=r<.45?'rock':r<.72?'log':r<.88?'branch':'bridge';}
      else if(t>=LR_SET.logsFrom[i]){type=r<.62?'rock':'log';}
      if(type!=='rock'&&last&&last!=='rock'&&Math.random()<.5)type='rock';   /* not too many jump-and-duck in a row */
      if(type!=='rock'&&t-lastJD<1.2)type='rock';                            /* and always time to land or stand up first */
      if(type!=='rock')lastJD=t;
      if(type==='rock'){
        var lanes=[0,1,2];
        if(count===0)lanes=lanes.filter(function(n){return n!==lane;});       /* the first rock is never straight ahead */
        var a=pick(lanes);
        things.push({type:'rock',lane:a,z:FAR,r:.34+Math.random()*.06,sp:Math.random()*6});
        if(t>=LR_SET.pairsFrom[i]&&Math.random()<.35){var b=pick([0,1,2].filter(function(n){return n!==a;}));things.push({type:'rock',lane:b,z:FAR,r:.34+Math.random()*.06,sp:Math.random()*6});}
      } else things.push({type:type,z:FAR,side:Math.random()<.5?-1:1});
      last=type; count++;
    }
    function hit(o){
      if(Math.abs(o.z)>.22)return false;
      if(o.type==='rock')return Math.abs((o.lane-1)-lx)<.62&&hgt()<.95;
      if(o.type==='log')return !air();
      return !ducking();   /* branch or bridge */
    }
    function steer(n){if(dead)return;var to=Math.max(0,Math.min(2,lane+n));if(to!==lane){lane=to;K.sfx('step');}}
    function jump(){if(dead||jumpT>=0)return;duckT=-1;jumpT=0;K.sfx('jump');}   /* a jump can start from a duck */
    function duck(){if(dead||jumpT>=0||duckT>=0)return;duckT=0;K.sfx('duck');}
    /* ---- drawing ---- */
    function fadeIn(z){return Math.max(0,Math.min(1,(FAR-z)/1.6));}
    function drawWorld(c,g){
      var W=g.W,H=g.H,hz=g.hz;
      var sky=c.createLinearGradient(0,0,0,hz); sky.addColorStop(0,'#9FD6F2'); sky.addColorStop(1,'#E2F4FB');
      c.fillStyle=sky; c.fillRect(0,0,W,hz+2);
      /* soft clouds and far hills with trees on them */
      c.fillStyle='rgba(255,255,255,.85)'; [[.18,.3,1],[.7,.18,1.3],[.9,.42,.8]].forEach(function(q){var x=((q[0]*W+t2*6*q[2])%(W+160))-80,y=hz*q[1];c.beginPath();c.ellipse(x,y,34*q[2],12*q[2],0,0,Math.PI*2);c.ellipse(x+22*q[2],y-6*q[2],22*q[2],12*q[2],0,0,Math.PI*2);c.fill();});
      c.fillStyle='#A8D88C'; c.beginPath(); c.moveTo(0,hz); for(var x=0;x<=W;x+=W/8){c.quadraticCurveTo(x+W/16,hz-26-((x*7)%19),x+W/8,hz);} c.lineTo(W,hz+2); c.lineTo(0,hz+2); c.fill();
      c.fillStyle='#7CBF63'; for(var tx=8;tx<W;tx+=34){var th=10+((tx*13)%14);c.beginPath();c.ellipse(tx,hz-th*.6,9,th*.7,0,0,Math.PI*2);c.fill();}
      /* the grass and the river running away to the horizon */
      var gr=c.createLinearGradient(0,hz,0,H); gr.addColorStop(0,'#9BD27A'); gr.addColorStop(1,'#78BC58');
      c.fillStyle=gr; c.fillRect(0,hz,W,H-hz);
      var zb=zBottom(g)-.2, a1=P(g,-RIV-.12,60), b1=P(g,RIV+.12,60), a2=P(g,-RIV-.12,zb), b2=P(g,RIV+.12,zb);
      c.fillStyle='#C9A86E'; c.beginPath(); c.moveTo(a1.x,a1.y); c.lineTo(b1.x,b1.y); c.lineTo(b2.x,b2.y); c.lineTo(a2.x,a2.y); c.closePath(); c.fill();
      var a3=P(g,-RIV,60), b3=P(g,RIV,60), a4=P(g,-RIV,zb), b4=P(g,RIV,zb);
      var wg=c.createLinearGradient(0,hz,0,H); wg.addColorStop(0,'#A9DCF2'); wg.addColorStop(.35,'#7CC2E8'); wg.addColorStop(1,'#4C9FD2');
      c.fillStyle=wg; c.beginPath(); c.moveTo(a3.x,a3.y); c.lineTo(b3.x,b3.y); c.lineTo(b4.x,b4.y); c.lineTo(a4.x,a4.y); c.closePath(); c.fill();
      /* darker water along each bank */
      c.save(); c.globalAlpha=.25; c.fillStyle='#2E6E9E';
      [[-RIV,-RIV+.3],[RIV-.3,RIV]].forEach(function(e){var p1=P(g,e[0],60),p2=P(g,e[1],60),p3=P(g,e[1],zb),p4=P(g,e[0],zb);c.beginPath();c.moveTo(p1.x,p1.y);c.lineTo(p2.x,p2.y);c.lineTo(p3.x,p3.y);c.lineTo(p4.x,p4.y);c.closePath();c.fill();});
      c.restore();
      /* ripples on the water, flowing past */
      c.strokeStyle='rgba(255,255,255,.6)'; c.lineCap='round';
      waves.forEach(function(w){if(w.z<zb)return;var p=P(g,w.x,w.z), s=p.s*.22*w.s;c.lineWidth=Math.max(1,p.s*.025);c.globalAlpha=fadeIn(w.z);c.beginPath();c.moveTo(p.x-s,p.y);c.quadraticCurveTo(p.x,p.y-s*.35,p.x+s,p.y);c.stroke();});
      c.globalAlpha=1;
    }
    function drawDecor(c,g,d){
      var x=d.side*(RIV+.45+d.o*2.4), p=P(g,x,d.z), s=p.s;
      if(p.x<-s*1.2||p.x>g.W+s*1.2)return;
      c.save(); c.globalAlpha=fadeIn(d.z); c.translate(p.x,p.y);
      if(d.k===0){c.strokeStyle='#4E8A3A';c.lineWidth=Math.max(1,s*.03);c.lineCap='round';for(var q=-2;q<=2;q++){c.beginPath();c.moveTo(q*s*.03,0);c.quadraticCurveTo(q*s*.05,-s*.2,q*s*.07,-s*.4);c.stroke();}c.fillStyle='#7A4E2A';gmRound(c,-s*.03,-s*.5,s*.06,s*.14,s*.03);c.fill();}
      else if(d.k===1){FCOL.slice(0,3).forEach(function(col,j){c.fillStyle=FC[col].fill;c.beginPath();c.arc((-1+j)*s*.1,-s*.04-(j%2)*s*.05,s*.05,0,Math.PI*2);c.fill();});}
      else if(d.k===2){gmShadow(c,s*.03,0,s*.16,s*.05,.18);gmBall(c,0,-s*.1,s*.13,'#E6E9EE','#B6BEC8','#7F8894');}
      else if(d.k===3){gmShadow(c,0,0,s*.3,s*.07,.18);gmBall(c,-s*.1,-s*.14,s*.17,'#B9E39A','#72B653','#3F7F34');gmBall(c,s*.1,-s*.16,s*.19,'#C2E8A4','#7BBF5B','#428536');}
      else {gmShadow(c,0,0,s*.4,s*.09,.2);c.fillStyle='#7A4E2A';c.fillRect(-s*.05,-s*.5,s*.1,s*.5);gmBall(c,0,-s*.75,s*.38,'#A9DC86','#5FA84A','#2F6F2C');gmBall(c,-s*.14,-s*.88,s*.2,'#C6EBA4','#7DC062','#4A8A3C');}
      c.restore();
    }
    /* the Jump and Duck signs: a round badge with an arrow, like the buttons */
    function badge(c,x,y,r,up,a){
      if(a<=0||r<5)return;
      c.save(); c.globalAlpha=a;
      c.fillStyle='rgba(255,255,255,.95)'; c.beginPath(); c.arc(x,y,r*1.12,0,Math.PI*2); c.fill();
      c.fillStyle=up?'#3E9E5A':'#7A5BC8'; c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill();
      c.strokeStyle='#fff'; c.lineWidth=Math.max(2,r*.22); c.lineCap='round'; c.lineJoin='round'; c.beginPath();
      if(up){c.moveTo(x-r*.45,y+r*.18);c.lineTo(x,y-r*.3);c.lineTo(x+r*.45,y+r*.18);c.moveTo(x,y-r*.3);c.lineTo(x,y+r*.5);}
      else {c.moveTo(x-r*.45,y-r*.18);c.lineTo(x,y+r*.3);c.lineTo(x+r*.45,y-r*.18);c.moveTo(x,y+r*.3);c.lineTo(x,y-r*.5);}
      c.stroke(); c.restore();
    }
    function drawRock(c,g,o){
      var p=P(g,o.lane-1,o.z), r=o.r*p.s, x=p.x, y=p.y;
      c.save(); c.globalAlpha=fadeIn(o.z);
      c.fillStyle='rgba(255,255,255,.75)'; c.beginPath(); c.ellipse(x,y,r*1.25,r*.32,0,0,Math.PI*2); c.fill();
      gmBall(c,x,y-r*.62,r,'#E4E8ED','#A3ADB8','#68727F');
      gmBall(c,x+r*.5,y-r*.3,r*.58,'#D9DEE4','#9AA4B0','#646E7A');
      c.fillStyle='#7FB35F'; c.beginPath(); c.ellipse(x-r*.25,y-r*1.4,r*.34,r*.14,-.2,0,Math.PI*2); c.fill();
      c.fillStyle='rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(x-r*.38,y-r*.95,r*.18,r*.1,-.6,0,Math.PI*2); c.fill();
      c.restore();
    }
    function drawLog(c,g,o){
      var a=P(g,-RIV-.1,o.z), b=P(g,RIV+.1,o.z), s=a.s, h=s*.3, y=a.y-h*.5, fa=fadeIn(o.z);
      c.save(); c.globalAlpha=fa;
      c.strokeStyle='rgba(255,255,255,.75)'; c.lineWidth=Math.max(1.5,s*.03); c.beginPath();
      for(var x=a.x;x<b.x;x+=s*.3){c.moveTo(x,a.y+h*.05);c.quadraticCurveTo(x+s*.15,a.y+h*.35,x+s*.3,a.y+h*.05);} c.stroke();
      var lg=c.createLinearGradient(0,y-h/2,0,y+h/2); lg.addColorStop(0,'#C99462'); lg.addColorStop(.45,'#9A6638'); lg.addColorStop(1,'#5E3B1C');
      c.fillStyle=lg; gmRound(c,a.x,y-h/2,b.x-a.x,h,h/2); c.fill();
      c.strokeStyle='rgba(60,36,16,.45)'; c.lineWidth=Math.max(1,s*.02);
      for(var q=a.x+s*.3;q<b.x-s*.2;q+=s*.42){c.beginPath();c.moveTo(q,y-h/2+h*.2);c.quadraticCurveTo(q+s*.12,y,q+s*.04,y+h/2-h*.15);c.stroke();}
      c.fillStyle='#7FB35F'; c.beginPath(); c.ellipse(a.x+(b.x-a.x)*.3,y-h*.45,s*.16,h*.18,0,0,Math.PI*2); c.ellipse(a.x+(b.x-a.x)*.72,y-h*.45,s*.12,h*.16,0,0,Math.PI*2); c.fill();
      c.fillStyle='#E7C08F'; c.strokeStyle='#5E3B1C'; c.lineWidth=Math.max(1,s*.025); c.beginPath(); c.ellipse(b.x-h*.2,y,h*.24,h/2-1,0,0,Math.PI*2); c.fill(); c.stroke();
      c.restore();
      badge(c,g.cx,y-h*.5-s*.42,Math.max(9,s*.2),true,fa*Math.min(1,Math.max(0,(o.z-.6)/1.2)));
    }
    /* branches and bridges hang over the river with water showing underneath, at about Ripple's head height */
    function drawOver(c,g,o){
      var fa=fadeIn(o.z), L=P(g,-RIV,o.z), R=P(g,RIV,o.z), s=L.s, lowY=.8, topY=1.18;
      var yLow=L.y-lowY*s, yTop=L.y-topY*s;
      c.save(); c.globalAlpha=fa;
      /* its shadow on the water */
      c.fillStyle='rgba(30,60,90,.2)'; c.beginPath(); c.ellipse(g.cx,L.y,(R.x-L.x)*.5,s*.08,0,0,Math.PI*2); c.fill();
      if(o.type==='bridge'){
        var x0=L.x-s*.5, x1=R.x+s*.5, deck=yLow-(yLow-yTop)*.45;
        c.fillStyle='#8A5A30'; [L.x-s*.32,R.x+s*.2].forEach(function(px){gmRound(c,px,yTop-s*.12,s*.12,L.y-yTop+s*.12,s*.04);c.fill();});
        /* an arch under the deck so the gap shows clearly */
        var bg=c.createLinearGradient(0,deck,0,yLow); bg.addColorStop(0,'#D6A86E'); bg.addColorStop(1,'#9A6638');
        c.fillStyle=bg; c.beginPath(); c.moveTo(x0,deck); c.lineTo(x1,deck); c.lineTo(x1,yLow+s*.1); c.lineTo(R.x,yLow+s*.1); c.quadraticCurveTo(g.cx,yLow-s*.1,L.x,yLow+s*.1); c.lineTo(x0,yLow+s*.1); c.closePath(); c.fill();
        var dg=c.createLinearGradient(0,yTop,0,deck); dg.addColorStop(0,'#F0CB92'); dg.addColorStop(1,'#C9955C');
        c.fillStyle=dg; c.fillRect(x0,yTop+s*.1,x1-x0,deck-yTop-s*.1);
        c.strokeStyle='rgba(94,59,28,.55)'; c.lineWidth=Math.max(1,s*.02); for(var px2=x0+s*.18;px2<x1;px2+=s*.2){c.beginPath();c.moveTo(px2,yTop+s*.1);c.lineTo(px2,deck);c.stroke();}
        c.fillStyle='#7A4E2A'; gmRound(c,x0-s*.04,yTop,x1-x0+s*.08,s*.1,s*.04); c.fill();
        for(var rp=x0+s*.1;rp<x1;rp+=s*.36){c.fillRect(rp,yTop-s*.2,s*.05,s*.22);} gmRound(c,x0,yTop-s*.24,x1-x0,s*.06,s*.03); c.fill();
      } else {
        /* a leafy branch growing out from one bank right across the river */
        var from=o.side<0?P(g,-RIV-1.6,o.z):P(g,RIV+1.6,o.z), to=o.side<0?R:L, dir=o.side<0?1:-1, ym=(yLow+yTop)/2;
        c.fillStyle='#6E4424'; c.fillRect(from.x-s*.09,ym,s*.18,from.y-ym);
        c.strokeStyle='#6E4424'; c.lineCap='round'; c.lineWidth=s*.16; c.beginPath(); c.moveTo(from.x,ym-s*.05); c.quadraticCurveTo((from.x+to.x)/2,ym+s*.06,to.x+dir*s*.3,ym); c.stroke();
        c.strokeStyle='#A06A3A'; c.lineWidth=s*.05; c.beginPath(); c.moveTo(from.x,ym-s*.09); c.quadraticCurveTo((from.x+to.x)/2,ym+s*.02,to.x+dir*s*.3,ym-s*.04); c.stroke();
        var n=9;
        for(var q=0;q<n;q++){
          var tq=.15+q*(.85/n), bx=from.x+(to.x+dir*s*.3-from.x)*tq, by=ym+Math.sin(tq*Math.PI)*s*.05;
          [[0,s*.1,s*.18,s*.1],[-dir*s*.12,s*.02,s*.14,s*.08],[dir*s*.12,s*.04,s*.13,s*.07],[0,-s*.12,s*.15,s*.08]].forEach(function(l){
            var ex=bx+l[0], ey=by+l[1], lg2=c.createRadialGradient(ex-l[2]*.3,ey-l[3]*.4,1,ex,ey,l[2]);
            lg2.addColorStop(0,'#CDEDA6'); lg2.addColorStop(.6,'#6FB357'); lg2.addColorStop(1,'#3E8436'); c.fillStyle=lg2;
            c.beginPath(); c.ellipse(ex,ey,l[2],l[3],dir*.4,0,Math.PI*2); c.fill();
          });
        }
      }
      c.restore();
      /* the Duck sign floats in the gap under it, over the water */
      badge(c,g.cx,(L.y+yLow)/2+s*.04,Math.max(9,s*.17),false,fa*Math.min(1,Math.max(0,(o.z-.6)/1.2)));
    }
    function drawPad(c,x,y,s){
      gmShadow(c,x+s*.03,y+s*.06,s*.42,s*.1,.25);
      c.save(); c.translate(x,y); c.scale(s/80,s/80*.45);
      var pg=c.createRadialGradient(-12,-14,4,0,0,40); pg.addColorStop(0,'#A8E084'); pg.addColorStop(.6,'#5FAF4C'); pg.addColorStop(1,'#357A31');
      c.fillStyle=pg; c.beginPath(); c.moveTo(0,0); c.arc(0,0,40,Math.PI/2+.32,Math.PI/2-.32+Math.PI*2); c.closePath(); c.fill();
      c.strokeStyle='#2F6B2C'; c.lineWidth=2.5; c.stroke();
      c.strokeStyle='rgba(47,107,44,.45)'; c.lineWidth=1.5; for(var a=0;a<7;a++){var an=Math.PI/2+.6+a*.8;c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(an)*34,Math.sin(an)*34);c.stroke();}
      c.restore();
    }
    function drawRipple(c,g){
      var p=P(g,lx,0), s=p.s, h=hgt(), up=h*s*.85, x=p.x, ry=p.y;
      if(h>0)gmShadow(c,x,ry,s*.36*(1-.3*h),s*.08*(1-.3*h),.22);
      else {c.save();c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=2.5;for(var w=0;w<2;w++){var q=(t2*1.4+w*.5)%1;c.globalAlpha=1-q;c.beginPath();c.ellipse(x,ry+s*.02,s*(.44+q*.3),s*(.1+q*.06),0,0,Math.PI*2);c.stroke();}c.restore();}
      c.save();
      if(dead){c.translate(x,ry);c.rotate(Math.min(.6,deadT*2));c.translate(-x,-ry);c.globalAlpha=Math.max(.35,1-deadT*.8);}
      var tilt=Math.max(-.18,Math.min(.18,((lane-1)-lx)*.25));
      c.translate(x,ry-up); c.rotate(tilt); c.translate(-x,-(ry-up));
      drawPad(c,x,ry-up,s*(1+.15*h));
      if(gmReady(ripple)){
        var w2=s*1.0*(1+.12*h), hh=w2*4/3, bob=h>0?0:Math.sin(t2*3)*s*.015;
        if(ducking()){var dk=Math.sin(Math.PI*Math.min(1,duckT/LR_SET.duck[i]));var sq=1-.45*Math.min(1,dk*1.6);c.drawImage(ripple,x-w2*.56,ry-up-hh*sq*.86+bob,w2*1.12,hh*sq);}
        else c.drawImage(ripple,x-w2/2,ry-up-hh*.86+bob,w2,hh);
      }
      c.restore();
    }
    return {
      peek:function(){return {things:things,lane:lane,lx:lx,g:geo(),jumping:jumpT>=0,ducking:duckT>=0,dead:dead};},   /* for testing */
      input:function(n,down){if(!down)return;if(n==='left')steer(-1);else if(n==='right')steer(1);else if(n==='jump')jump();else if(n==='duck')duck();},
      pointer:function(t,x,y){
        if(t==='down'){down={x:x,y:y};return;}
        if(t!=='up'||!down)return;
        var dx=x-down.x, dy=y-down.y; down=null;
        if(Math.max(Math.abs(dx),Math.abs(dy))>28){if(Math.abs(dx)>Math.abs(dy))steer(dx<0?-1:1);else if(dy<0)jump();else duck();return;}
        var g=geo(), rx=g.cx+lx*g.ls; if(x<rx-g.ls*.42)steer(-1);else if(x>rx+g.ls*.42)steer(1);else jump();
      },
      update:function(dt){
        t2+=dt;
        for(var s0=splash.length-1;s0>=0;s0--){splash[s0].t+=dt;if(splash[s0].t>1.2)splash.splice(s0,1);}
        if(dead){deadT+=dt;return;}
        var g=geo(), v=K.rate(LR_SET.speed), zb=zBottom(g);
        K.score(K.t);
        lx+=((lane-1)-lx)*Math.min(1,dt*14);
        if(jumpT>=0){jumpT+=dt;if(jumpT>=LR_SET.jump[i]){jumpT=-1;K.sfx('splash');splash.push({x:lx,t:.5});}}
        if(duckT>=0){duckT+=dt;if(duckT>=LR_SET.duck[i])duckT=-1;}
        decor.forEach(function(d){d.z-=v*dt;if(d.z<zb-.5){d.z+=FAR+4;d.o=Math.random();d.k=Math.floor(Math.random()*5);}});
        waves.forEach(function(w){w.z-=v*dt;if(w.z<zb-.2){w.z+=FAR+4;w.x=(Math.random()*2-1)*(RIV-.25);}});
        nextIn-=dt; if(nextIn<=0){spawn();nextIn=Math.max(LR_SET.gap.min[i],LR_SET.gap.start[i]/(1+LR_SET.speed.grow[i]*K.t));}
        for(var q=things.length-1;q>=0;q--){
          var o=things[q], z0=o.z; o.z-=v*dt;
          /* check as it passes Ripple, even if it moved past in one step */
          if((Math.abs(o.z)<=.22||(z0>.22&&o.z<-.22))&&hit({type:o.type,lane:o.lane,z:0})){dead=true;K.sfx('crash');splash.push({x:lx,t:0});K.end();return;}
          if(o.z<zb-1.5)things.splice(q,1);
        }
      },
      draw:function(c){
        var g=geo();
        drawWorld(c,g);
        /* far to near: bank things and river things, with Ripple at z=0 */
        var list=[];
        decor.forEach(function(d){if(d.z<FAR+1)list.push({z:d.z,f:function(){drawDecor(c,g,d);}});});
        things.forEach(function(o){list.push({z:o.z+(o.type==='branch'||o.type==='bridge'?-.25:0),f:function(){if(o.type==='rock')drawRock(c,g,o);else if(o.type==='log')drawLog(c,g,o);else drawOver(c,g,o);}});});
        list.push({z:0,f:function(){drawRipple(c,g);}});
        list.sort(function(a,b){return b.z-a.z;});
        list.forEach(function(e){e.f();});
        splash.forEach(function(sp){var p=P(g,sp.x,0),k2=sp.t/1.2,s=p.s;c.save();c.globalAlpha=1-k2;c.strokeStyle='#fff';c.lineWidth=4;c.beginPath();c.ellipse(p.x,p.y,s*(.3+.6*k2),s*(.08+.14*k2),0,0,Math.PI*2);c.stroke();c.fillStyle='#fff';for(var d=0;d<7;d++){var a=-Math.PI*(d/6);c.beginPath();c.arc(p.x+Math.cos(a)*s*(.2+.4*k2),p.y-Math.sin(a)*s*.3*k2-s*.1*Math.sin(k2*Math.PI),4,0,Math.PI*2);c.fill();}c.restore();});
      }
    };
  }
};
