/* ================================================================
   METEOR SPARKLER - Twinkle's game (phase 10)
   Twinkle floats in the middle of the night sky. Space rocks drift in from every side and curve
   towards her. Touch or click where you want her to zap: a star bolt flies that way and turns the
   first rock it meets into sparkles. Big rocks break into two middle rocks, middle rocks into two
   small ones, and small ones sparkle away. On a computer she also follows the mouse, and the arrow
   keys turn her with Space (or Enter or up arrow) to zap; hold it to keep zapping.
   Little Sprite gets no big rocks. More rocks come, a little faster, over time.
   Three rocks reaching Twinkle end the game. Score: rocks sparkled (every piece counts).
   Names in this file start with ms or MS so they don't clash with other files.
   ================================================================ */
var MS_SET={
  speed:{start:[34,42,52],grow:[.008,.01,.012],max:[70,85,100]},     /* how fast rocks drift, game units a second */
  gap:{start:[2.8,2.5,2.2],grow:[.0067,.0057,.0042],min:[1.4,1.35,1.35]}, /* seconds between new rocks */
  mix:[[.55,.45,0],[.4,.45,.15],[.3,.45,.25]],                         /* chance of a small, middle or big rock */
  crowd:[10,16,24],        /* most zaps' worth of rocks in the sky at once (small 1, middle 3, big 7) */
  turn:[.5,.6,.7],         /* how fast rocks curve back towards Twinkle, radians a second */
  size:[18,28,40],         /* rock sizes: small, middle, big */
  slow:[1.2,1,.8],         /* small rocks drift a little faster, big ones slower */
  cool:.2, hold:.38,       /* seconds between zaps (tapping / holding a key) */
  bolt:950, spin:3.6       /* star bolt speed; how fast the arrow keys turn Twinkle, radians a second */
};
var MS_ROCKC=[['#E6E0F0','#A79CC0','#5E5478','#463E5E'],['#F0E2CC','#BFA07E','#7A5E40','#5A4430'],['#DDE6F0','#98A8C0','#56647E','#3E4A60']];
var MS_SPARK=['#FFE07A','#FFF3B0','#F49DBE','#8FE3E8','#C9B8F5'];
function msStarPath(c,x,y,r,rot){
  c.beginPath();
  for(var k=0;k<10;k++){var a=rot-Math.PI/2+k*Math.PI/5, rr=k%2?r*.45:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}
  c.closePath();
}
function msSfx(name){
  if(!mem.sound)return;
  if(name==='zap'){var c=ctx();if(!c)return;var t=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(1500,t);o.frequency.exponentialRampToValueAtTime(700,t+.12);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.05,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.14);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+.16);}
  else if(name==='sparkle'){var f=pick([1046.5,1174.7,1318.5,1568,1760]);tone(f,0,.22,'sine',.09);tone(f*1.5,.05,.3,'sine',.05);}
  else if(name==='bump'){noiseHit(0,'lowpass',700,.3,.25);tone(220,0,.3,'triangle',.08);}
}
function msHowArt(k){
  var sky='<circle cx="32" cy="32" r="29" fill="#2E3A86"/><circle cx="14" cy="22" r="1.4" fill="#fff"/><circle cx="48" cy="14" r="1.2" fill="#fff"/><circle cx="50" cy="48" r="1.4" fill="#fff"/>';
  var rock=function(x,y,r){return '<path d="M'+(x-r)+' '+y+' C'+(x-r)+' '+(y-r*.8)+' '+(x-r*.3)+' '+(y-r)+' '+x+' '+(y-r*.95)+' C'+(x+r*.8)+' '+(y-r)+' '+(x+r)+' '+(y-r*.4)+' '+(x+r*.95)+' '+(y+r*.1)+' C'+(x+r)+' '+(y+r*.9)+' '+(x+r*.2)+' '+(y+r)+' '+(x-r*.3)+' '+(y+r*.9)+' C'+(x-r*.9)+' '+(y+r*.8)+' '+(x-r)+' '+(y+r*.4)+' '+(x-r)+' '+y+' Z" fill="#A79CC0" stroke="#463E5E" stroke-width="2"/><circle cx="'+(x+r*.25)+'" cy="'+(y+r*.2)+'" r="'+(r*.25)+'" fill="#5E5478" opacity=".6"/>';};
  if(k==='tap') return sky+'<g fill="none" stroke="#FFE07A" stroke-width="3"><circle cx="40" cy="26" r="11"/><path d="M40 10 V18 M40 34 V42 M24 26 H32 M48 26 H56"/></g><path d="M14 52 L34 30" stroke="#FFF3B0" stroke-width="3" stroke-dasharray="4 4" stroke-linecap="round"/>';
  if(k==='burst') return sky+rock(22,34,11)+'<path d="M34 34 H40 M37 31 L40 34 L37 37" stroke="#FFE07A" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'+rock(48,24,6)+rock(48,44,6);
  return sky+rock(22,28,12)+'<text x="44" y="52" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="18" font-weight="600" fill="#FFE07A">×3</text>';
}
GAMES.twinkle={
  name:'Meteor sparkler',
  intro:function(L){return 'Space rocks are drifting towards Twinkle! Tap where you want her to zap, and the rocks turn into sparkles.'+(L>1?' Big rocks break into smaller ones.':' Rocks break into smaller ones.')+' If three rocks bump into Twinkle, the game ends.';},
  how:[{art:msHowArt('tap'),text:'Tap to zap'},{art:msHowArt('burst'),text:'Rocks break'},{art:msHowArt('hit'),text:'3 bumps'}],
  lives:3,
  keys:{ArrowLeft:'left',ArrowRight:'right',a:'left',d:'right',A:'left',D:'right',' ':'zap',Enter:'zap',ArrowUp:'zap',w:'zap',W:'zap'},
  hud:function(n){return String(n);},
  unit:function(n){return n+' rock'+(n===1?'':'s');},
  said:function(n){return n===0?'No rocks sparkled this time.':'You sparkled '+n+' rock'+(n===1?'':'s')+'!';},
  make:function(K){
    var i=K.L-1, rocks=[], bolts=[], fx=[], zapped=0, dead=false, nextIn=1.2, t2=0, cool=0;
    var aim=-Math.PI/2, held={left:false,right:false,zap:false}, hurt=-1;
    var tw=K.img('ms-twinkle',K.F.art(true),'0 0 240 320',78,104), bg=gmScene('twinkle');
    function mid(){return {x:K.W/2,y:K.H/2};}
    function base(){return K.rate(MS_SET.speed);}
    function gap(){var g=MS_SET.gap;return Math.max(g.min[i],g.start[i]/(1+g.grow[i]*K.t));}
    function crowd(){return rocks.reduce(function(s,r){return s+[1,3,7][r.size];},0);}
    function makeRock(size,x,y,dir,col){
      var n=9, pts=[], cr=[];
      for(var k=0;k<n;k++)pts.push(.8+Math.random()*.26);
      for(var q=0;q<(size?3:2);q++)cr.push({a:Math.random()*6.28,d:Math.random()*.5,s:.14+Math.random()*.12});
      return {size:size,r:MS_SET.size[size],x:x,y:y,dir:dir,rot:Math.random()*6.28,vr:(Math.random()-.5)*1.4,pts:pts,cr:cr,col:col==null?Math.floor(Math.random()*MS_ROCKC.length):col,born:0};
    }
    function spawn(){
      var m=mid(), mix=MS_SET.mix[i], u=Math.random(), size=u<mix[0]?0:u<mix[0]+mix[1]?1:2;
      var r=MS_SET.size[size], th=Math.random()*Math.PI*2, cx=Math.cos(th), sy=Math.sin(th);
      var R=Math.min(Math.abs(cx)>1e-3?(K.W/2)/Math.abs(cx):1e9,Math.abs(sy)>1e-3?(K.H/2)/Math.abs(sy):1e9)+r+8;
      rocks.push(makeRock(size,m.x+cx*R,m.y+sy*R,th+Math.PI+(Math.random()-.5)*.6));
    }
    function sight(){var m=mid();return {x:m.x+Math.cos(aim)*62,y:m.y+Math.sin(aim)*62};}
    function zap(){
      if(dead||cool>0)return false;
      var s=sight(); cool=MS_SET.cool;
      bolts.push({x:s.x,y:s.y,vx:Math.cos(aim)*MS_SET.bolt,vy:Math.sin(aim)*MS_SET.bolt,t:0});
      msSfx('zap'); return true;
    }
    function burst(x,y,n,grey){
      for(var k=0;k<n;k++){var a=Math.random()*6.28, v=60+Math.random()*160;
        fx.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,life:.6+Math.random()*.5,col:grey?'#B9B3C9':pick(MS_SPARK),s:grey?5+Math.random()*4:4+Math.random()*5,star:!grey&&Math.random()<.6,rot:Math.random()*6});}
    }
    function hitRock(q){
      var o=rocks[q]; rocks.splice(q,1);
      zapped++; K.score(zapped); msSfx('sparkle'); burst(o.x,o.y,8+o.size*5,false);
      if(o.size>0){
        /* two smaller rocks fly apart, then curve back towards Twinkle */
        for(var s=-1;s<=1;s+=2){var d=o.dir+s*(.9+Math.random()*.4), off=o.r*.5;
          var kid=makeRock(o.size-1,o.x+Math.cos(d)*off,o.y+Math.sin(d)*off,d,o.col); rocks.push(kid);}
      }
    }
    function drawRock(c,o){
      var col=MS_ROCKC[o.col], r=o.r, n=o.pts.length;
      c.save(); c.translate(o.x,o.y); c.rotate(o.rot);
      c.shadowColor='rgba(201,212,255,.55)'; c.shadowBlur=12;
      var g=c.createRadialGradient(-r*.35,-r*.4,r*.1,0,0,r*1.05); g.addColorStop(0,col[0]); g.addColorStop(.55,col[1]); g.addColorStop(1,col[2]);
      /* a lumpy outline: a smooth curve through points at slightly different distances */
      var P=o.pts.map(function(f,k){var a=k/n*Math.PI*2;return [Math.cos(a)*r*f,Math.sin(a)*r*f];});
      function midP(a,b){return [(a[0]+b[0])/2,(a[1]+b[1])/2];}
      c.fillStyle=g; c.beginPath(); var s0=midP(P[n-1],P[0]); c.moveTo(s0[0],s0[1]);
      for(var k=0;k<n;k++){var e=midP(P[k],P[(k+1)%n]);c.quadraticCurveTo(P[k][0],P[k][1],e[0],e[1]);}
      c.closePath(); c.fill(); c.shadowBlur=0; c.strokeStyle=col[3]; c.lineWidth=2.5; c.stroke();
      o.cr.forEach(function(k){var x=Math.cos(k.a)*k.d*r, y=Math.sin(k.a)*k.d*r, s=k.s*r;
        c.fillStyle=col[2]; c.globalAlpha=.55; c.beginPath(); c.arc(x,y,s,0,Math.PI*2); c.fill();
        c.globalAlpha=.5; c.strokeStyle=col[0]; c.lineWidth=1.5; c.beginPath(); c.arc(x+s*.15,y+s*.15,s,.2,1.9); c.stroke(); c.globalAlpha=1;});
      c.restore();
    }
    return {
      peek:function(){return {rocks:rocks,aim:aim,mid:mid(),cool:cool,bolt:MS_SET.bolt};},   /* for testing */
      setAim:function(a){aim=a;},                                                         /* for testing */
      input:function(n,down){held[n]=down;if(n==='zap'&&down){zap();cool=Math.max(cool,MS_SET.cool);}},
      pointer:function(t,x,y,kind){
        var m=mid(); if(Math.hypot(x-m.x,y-m.y)<4)return;
        if(t==='down'){aim=Math.atan2(y-m.y,x-m.x);zap();}
        else if(t==='move'&&kind==='mouse')aim=Math.atan2(y-m.y,x-m.x);
      },
      update:function(dt){
        t2+=dt; cool=Math.max(0,cool-dt); if(hurt>=0){hurt+=dt;if(hurt>.7)hurt=-1;}
        for(var e=fx.length-1;e>=0;e--){var p=fx[e];p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=1-1.8*dt;p.vy*=1-1.8*dt;p.rot+=dt*3;if(p.t>p.life)fx.splice(e,1);}
        var m=mid();
        if(!dead){
          if(held.left)aim-=MS_SET.spin*dt; if(held.right)aim+=MS_SET.spin*dt;
          if(held.zap&&cool<=0){zap();cool=MS_SET.hold;}
        }
        /* star bolts fly straight on; each one sparkles the first rock it touches */
        for(var b=bolts.length-1;b>=0;b--){
          var o=bolts[b], x0=o.x, y0=o.y; o.t+=dt; o.x+=o.vx*dt; o.y+=o.vy*dt;
          var hit=-1, bestT=2;
          for(var q=0;q<rocks.length;q++){
            var R=rocks[q], dx=o.x-x0, dy=o.y-y0, L2=dx*dx+dy*dy||1, tt=Math.max(0,Math.min(1,((R.x-x0)*dx+(R.y-y0)*dy)/L2));
            var px=x0+dx*tt, py=y0+dy*tt;
            if(Math.hypot(R.x-px,R.y-py)<R.r+10&&tt<bestT){bestT=tt;hit=q;}
          }
          if(hit>=0){bolts.splice(b,1);hitRock(hit);continue;}
          if(o.x<-40||o.y<-40||o.x>K.W+40||o.y>K.H+40)bolts.splice(b,1);
        }
        /* rocks drift and slowly turn towards Twinkle */
        var v=base(), tr=MS_SET.turn[i];
        for(var r=rocks.length-1;r>=0;r--){
          var k=rocks[r]; k.born+=dt; k.rot+=k.vr*dt;
          var want=Math.atan2(m.y-k.y,m.x-k.x), d=want-k.dir; while(d>Math.PI)d-=Math.PI*2; while(d<-Math.PI)d+=Math.PI*2;
          k.dir+=Math.max(-tr*dt,Math.min(tr*dt,d));
          var sp=v*MS_SET.slow[k.size]*(k.born<.5?1.6-k.born*1.2:1);
          k.x+=Math.cos(k.dir)*sp*dt; k.y+=Math.sin(k.dir)*sp*dt;
          if(!dead&&Math.hypot(k.x-m.x,k.y-m.y)<30+k.r*.6){
            rocks.splice(r,1); burst(k.x,k.y,10,true); msSfx('bump'); hurt=0;
            if(K.lose()<=0){dead=true;K.end();}
          }
        }
        if(dead)return;
        nextIn-=dt;
        if(nextIn<=0){if(crowd()<MS_SET.crowd[i]){spawn();nextIn=gap();}else nextIn=.3;}
      },
      draw:function(c){
        var W=K.W,H=K.H,m=mid();
        if(!gmCover(c,bg,W,H)){c.fillStyle='#2E3A86';c.fillRect(0,0,W,H);}
        c.fillStyle='rgba(20,26,68,.22)'; c.fillRect(0,0,W,H);
        /* Twinkle's glow */
        var gl=c.createRadialGradient(m.x,m.y,10,m.x,m.y,110); gl.addColorStop(0,'rgba(255,243,176,.45)'); gl.addColorStop(1,'rgba(255,243,176,0)');
        c.fillStyle=gl; c.beginPath(); c.arc(m.x,m.y,110,0,Math.PI*2); c.fill();
        c.save(); c.strokeStyle='rgba(255,243,176,.35)'; c.lineWidth=2; c.setLineDash([3,9]); c.beginPath(); c.arc(m.x,m.y,62,0,Math.PI*2); c.stroke(); c.restore();
        /* Twinkle, facing the way she zaps, wobbling when a rock bumps her */
        if(gmReady(tw)){
          var wob=hurt>=0?Math.sin(hurt*40)*.18*(1-hurt/.7):0, bob=Math.sin(t2*2.2)*3, flip=Math.cos(aim)<-.15?-1:1;
          c.save(); c.translate(m.x,m.y+bob); c.rotate(wob); c.scale(flip,1);
          if(hurt>=0&&Math.sin(hurt*30)>0)c.globalAlpha=.55;
          c.drawImage(tw,-39,-56,78,104); c.restore();
        }
        /* the aiming star on the ring, with a short dotted line showing the way */
        var s=sight(), pulse=1+Math.sin(t2*6)*.08;
        c.save(); c.strokeStyle='rgba(255,243,176,.75)'; c.lineWidth=3; c.lineCap='round'; c.setLineDash([2,10]);
        c.beginPath(); c.moveTo(s.x+Math.cos(aim)*16,s.y+Math.sin(aim)*16); c.lineTo(s.x+Math.cos(aim)*64,s.y+Math.sin(aim)*64); c.stroke(); c.restore();
        c.save(); c.shadowColor='rgba(255,224,122,.95)'; c.shadowBlur=16; c.fillStyle='#FFE07A'; c.strokeStyle='#B8861E'; c.lineWidth=1.5;
        msStarPath(c,s.x,s.y,13*pulse,aim+Math.PI/2); c.fill(); c.shadowBlur=0; c.stroke(); c.restore();
        rocks.forEach(function(o){drawRock(c,o);});
        /* star bolts with a short glowing tail */
        bolts.forEach(function(o){
          var tx=o.x-o.vx*.05, ty=o.y-o.vy*.05, g=c.createLinearGradient(tx,ty,o.x,o.y);
          g.addColorStop(0,'rgba(255,243,176,0)'); g.addColorStop(1,'rgba(255,243,176,.95)');
          c.save(); c.strokeStyle=g; c.lineWidth=7; c.lineCap='round'; c.beginPath(); c.moveTo(tx,ty); c.lineTo(o.x,o.y); c.stroke();
          c.shadowColor='rgba(255,224,122,1)'; c.shadowBlur=14; c.fillStyle='#FFF3B0'; msStarPath(c,o.x,o.y,9,o.t*14); c.fill(); c.restore();
        });
        fx.forEach(function(p){var k=p.t/p.life;c.save();c.globalAlpha=Math.max(0,1-k);c.fillStyle=p.col;
          if(p.star){msStarPath(c,p.x,p.y,p.s*(1-k*.4)+1.5,p.rot);c.fill();} else {c.beginPath();c.arc(p.x,p.y,p.s*(1-k*.5),0,Math.PI*2);c.fill();}
          c.restore();});
      }
    };
  }
};
