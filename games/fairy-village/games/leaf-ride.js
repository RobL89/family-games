/* ================================================================
   LEAF RIDE - Breeze's game (phase 10)
   Breeze rides a big leaf across the sky, seen from the side. Hold down (anywhere on the sky,
   the Blow button, Space or the up arrow) and Breeze blows the leaf up; let go and it drifts
   gently down. Branches hang from the trees above, treetops grow up from below, and rain clouds
   float in the middle. It speeds up over time: single branches first, then rain clouds, then
   gaps between a branch and a treetop.
   The ride ends when the leaf touches the ground or bumps a branch, treetop or rain cloud.
   Score: time in the air, in whole seconds.
   Every gap is placed within reach of the one before, so there is always a way through.
   Names in this file start with lf or LF so they don't clash with other files.
   ================================================================ */
var LF_SET={
  speed:{start:[115,140,165],grow:[.010,.013,.016],max:[210,255,300]},  /* how fast the sky goes by, game units a second */
  space:{start:[380,340,300],min:[290,260,235]},                        /* distance between things in the sky */
  passage:[260,225,195],                                                 /* height of the way through */
  fall:[115,135,155], rise:[230,250,270],                                /* top speeds drifting down and blowing up */
  cloudsFrom:[7,5,3], gatesFrom:[16,11,7]                                /* seconds before rain clouds, then branch-and-treetop gaps */
};
var LF_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 15l7-7 7 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 20 C8 18 10 22 14 20 C17 18.5 18 21 20 20" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".55"/></svg>';
function lfLeafPath(c,k){
  /* a big pointed leaf, nose to the right, about 80 x 36 at k=1 */
  c.beginPath(); c.moveTo(-40*k,0);
  c.bezierCurveTo(-30*k,-22*k,18*k,-24*k,42*k,-2*k);
  c.bezierCurveTo(18*k,20*k,-28*k,20*k,-40*k,0); c.closePath();
}
function lfHowArt(k){
  if(k==='up') return '<path d="M14 46 C20 34 44 32 52 40 C44 50 22 54 14 46 Z" fill="#8CCB5A" stroke="#3F7F34" stroke-width="2.5"/><path d="M16 46 C28 44 40 42 50 40" stroke="#3F7F34" stroke-width="1.6" fill="none"/><path d="M32 30 V8 M22 17 L32 7 L42 17" stroke="#3E7FB0" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 58 C14 54 18 60 24 56" stroke="#7DBDE6" stroke-width="3" fill="none" stroke-linecap="round"/>';
  if(k==='down') return '<path d="M14 24 C20 12 44 10 52 18 C44 28 22 32 14 24 Z" fill="#8CCB5A" stroke="#3F7F34" stroke-width="2.5"/><path d="M16 24 C28 22 40 20 50 18" stroke="#3F7F34" stroke-width="1.6" fill="none"/><path d="M32 36 V56 M24 49 L32 57 L40 49" stroke="#3E7FB0" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".6"/>';
  return '<path d="M12 28 A10 10 0 0 1 16 12 A13 13 0 0 1 38 6 A12 12 0 0 1 54 16 A9 9 0 0 1 52 32 H18 A9 9 0 0 1 12 28 Z" fill="#9AA6B8" stroke="#5E6A80" stroke-width="2.5"/><path d="M20 40 L17 48 M32 40 L29 48 M44 40 L41 48" stroke="#5FA0D6" stroke-width="3" stroke-linecap="round"/><path d="M6 56 C20 50 32 60 58 54" stroke="#7A4E2A" stroke-width="6" stroke-linecap="round" fill="none"/>';
}
GAMES.breeze={
  name:'Leaf ride',
  intro:function(L){return 'Breeze rides a leaf across the sky. Hold down to blow the leaf up, and let go to drift down. Keep off the ground and miss the branches and rain clouds. It gets faster as you go!';},
  how:[{art:lfHowArt('up'),text:'Hold'},{art:lfHowArt('down'),text:'Let go'},{art:lfHowArt('miss'),text:'Miss them'}],
  lives:0,
  timed:true,
  pad:[{id:'blow',label:'Blow',icon:LF_ICON}],
  keys:{' ':'blow',ArrowUp:'blow',w:'blow',W:'blow',Enter:'blow'},
  hud:function(n){return Math.floor(n)+' s';},
  unit:function(n){return n+' second'+(n===1?'':'s');},
  said:function(n){return n<1?'Oops! That was a short ride.':'You stayed in the air for '+n+' second'+(n===1?'':'s')+'!';},
  make:function(K){
    var i=K.L-1, dead=false, deadT=0, vy=0, ptr=false, held=false, wasHolding=false, t2=0;
    var things=[], puffs=[], tufts=[], wisps=[], dist=0, nextSpace=220;
    var breeze=K.img('lf-breeze',K.F.art(),'0 0 240 320',48,64), bg=gmScene('breeze');
    function f(){return Math.max(.65,Math.min(1,K.W/700));}        /* narrow phones: a little slower, things closer together */
    function gy(){return K.H-56;}
    function vs(){return Math.max(.7,Math.min(1,K.H/600));}          /* a short sky (a phone held sideways): slower up and down */                                    /* the ground line */
    function px(){return Math.max(90,K.W*.26);}                      /* where the leaf flies across */
    var y=K.H*.36, prevC=y;
    /* the body: the leaf (y) with Breeze standing on it, from 46 above to 20 below */
    var TOP=46, BOT=20;
    for(var p0=0;p0<7;p0++)puffs.push({x:Math.random()*K.W*1.4,y:30+Math.random()*K.H*.45,s:.6+Math.random()*.8});
    for(var t0=0;t0<22;t0++)tufts.push({x:Math.random()*K.W*1.2,k:Math.floor(Math.random()*3)});
    function minC(){return TOP+34;}
    function maxC(){return gy()-BOT-34;}
    function spawn(v){
      var t=K.t, P=Math.min(LF_SET.passage[i],(gy()-14)*.62), T=nextSpace/v;
      var reach=Math.max(40,LF_SET.fall[i]*vs()*(T-.4)*.8);
      var c=prevC+(Math.random()*2-1)*reach; c=Math.max(minC(),Math.min(maxC(),c));
      var r=Math.random(), type;
      if(t>=LF_SET.gatesFrom[i]) type=r<.4?'gate':r<.62?'cloud':r<.81?'top':'bottom';
      else if(t>=LF_SET.cloudsFrom[i]) type=r<.36?'cloud':r<.68?'top':'bottom';
      else type=r<.5?'top':'bottom';
      var slack=(P-TOP-BOT)/2, p0=c-TOP-slack, p1=c+BOT+slack, o={x:K.W+80,c:c,ph:Math.random()*6};
      if(type==='cloud'){
        /* a cloud just above the way through, or just below it, whichever fits */
        var above=p0-38, below=p1+42, okA=above-40>10, okB=below+36<gy()-10;
        if(okA&&(!okB||Math.random()<.5)){o.type='cloud';o.cy=above;}
        else if(okB){o.type='cloud';o.cy=below;}
        else type='top';
      }
      if(type==='top'&&p0<56)type='bottom';
      if(type==='bottom'&&p1>gy()-48)type=p0>=56?'top':'none';
      if(type==='gate'&&(p0<56||p1>gy()-48))type=p0>=56?'top':'bottom';
      if(type==='top'){o.type='top';o.tip=p0;}
      else if(type==='bottom'){o.type='bottom';o.tip=p1;}
      else if(type==='gate'){o.type='gate';o.tip=p0;o.tip2=p1;}
      if(o.type)things.push(o);
      prevC=c;
    }
    /* ---- hits: the leaf and Breeze are two circles ---- */
    function circles(){var x=px();return [[x,y,22],[x-2,y-30,16]];}
    function hitRect(cs,x0,y0,x1,y1){return cs.some(function(q){var nx=Math.max(x0,Math.min(x1,q[0])),ny=Math.max(y0,Math.min(y1,q[1]));return (q[0]-nx)*(q[0]-nx)+(q[1]-ny)*(q[1]-ny)<q[2]*q[2];});}
    function hitCloud(cs,o){return cs.some(function(q){var dx=(q[0]-o.x)/(54+q[2]*.8),dy=(q[1]-o.cy)/(26+q[2]*.8);return dx*dx+dy*dy<1;});}
    function hit(o){
      var cs=circles();
      if(o.type==='cloud')return hitCloud(cs,o);
      var top=(o.type==='top'||o.type==='gate')&&hitRect(cs,o.x-20,-20,o.x+20,o.tip-8);
      var tipT=(o.type==='top'||o.type==='gate')&&cs.some(function(q){return Math.hypot(q[0]-o.x,q[1]-(o.tip-16))<q[2]+17;});
      var lo=o.type==='bottom'?o.tip:o.type==='gate'?o.tip2:null;
      var bot=lo!=null&&(hitRect(cs,o.x-14,lo+28,o.x+14,gy()+10)||cs.some(function(q){return Math.hypot(q[0]-o.x,q[1]-(lo+28))<q[2]+25;}));
      return top||tipT||bot;
    }
    function crash(){dead=true;K.sfx('crash');K.end();}
    function holding(){return ptr||held;}
    function whoosh(){if(mem.sound)noiseHit(0,'bandpass',900,.32,.1);}
    /* ---- drawing ---- */
    function drawSky(c){
      var W=K.W,H=K.H;
      if(!gmCover(c,bg,W,H)){var sg=c.createLinearGradient(0,0,0,H);sg.addColorStop(0,'#BFE3F6');sg.addColorStop(1,'#EAF6FB');c.fillStyle=sg;c.fillRect(0,0,W,H);}
      c.fillStyle='rgba(255,255,255,.38)'; c.fillRect(0,0,W,H);
      puffs.forEach(function(p){c.save();c.globalAlpha=.75;c.fillStyle='#fff';[[0,0,30],[26,6,24],[-24,8,20],[8,-14,22]].forEach(function(q){c.beginPath();c.arc(p.x+q[0]*p.s,p.y+q[1]*p.s,q[2]*p.s,0,Math.PI*2);c.fill();});c.restore();});
    }
    function drawGround(c){
      var W=K.W,H=K.H,g=gy();
      var gg=c.createLinearGradient(0,g,0,H); gg.addColorStop(0,'#9ED67C'); gg.addColorStop(1,'#5FA84A');
      c.fillStyle=gg; c.beginPath(); c.moveTo(0,g+6);
      for(var x=0;x<=W+20;x+=40)c.quadraticCurveTo(x+20,g-4,x+40,g+6);
      c.lineTo(W,H); c.lineTo(0,H); c.closePath(); c.fill();
      tufts.forEach(function(t){
        c.save(); c.translate(t.x,g+8);
        if(t.k===0){c.strokeStyle='#3F7F34';c.lineWidth=3;c.lineCap='round';for(var q=-1;q<=1;q++){c.beginPath();c.moveTo(q*4,6);c.quadraticCurveTo(q*6,-4,q*9,-14);c.stroke();}}
        else if(t.k===1){[['#F28CB3',-8],['#F8CF5A',6]].forEach(function(fl){c.fillStyle=fl[0];c.beginPath();c.arc(fl[1],-4,6,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(fl[1],-4,2,0,Math.PI*2);c.fill();});}
        else {gmBall(c,0,0,10,'#C2E8A4','#7BBF5B','#428536');}
        c.restore();
      });
    }
    function leafCluster(c,x,y,r){
      [[0,0,1],[-r*.7,r*.25,.75],[r*.7,r*.2,.8],[r*.15,-r*.55,.7]].forEach(function(q){gmBall(c,x+q[0],y+q[1],r*q[2],'#C6EBA4','#6FB357','#3E8436');});
    }
    function drawTop(c,o){
      /* a bough hanging down from the treetops, with leaves along it and a leafy tip */
      var x=o.x, tip=o.tip, sw=Math.sin(t2*1.4+o.ph)*3;
      c.save(); c.lineCap='round';
      c.strokeStyle='#6E4424'; c.lineWidth=18; c.beginPath(); c.moveTo(x-6,-20); c.quadraticCurveTo(x+10,tip*.5,x+sw,tip-18); c.stroke();
      c.strokeStyle='#A06A3A'; c.lineWidth=6; c.beginPath(); c.moveTo(x-10,-20); c.quadraticCurveTo(x+4,tip*.5,x-4+sw,tip-22); c.stroke();
      for(var k=1;k<5;k++){var ky=(tip-30)*k/5, kx=x+6*Math.sin(k)+sw*k/5, dir=k%2?1:-1;c.strokeStyle='#7A4E2A';c.lineWidth=4;c.beginPath();c.moveTo(kx,ky);c.lineTo(kx+dir*22,ky+10);c.stroke();leafCluster(c,kx+dir*26,ky+12,11);}
      leafCluster(c,x+sw,tip-16,18);
      c.restore();
    }
    function drawBottom(c,lo,o){
      /* a treetop growing up from the ground: trunk, then a round leafy crown at the top */
      var x=o.x, g=gy();
      gmShadow(c,x+6,g+8,40,8,.2);
      var tg=c.createLinearGradient(x-14,0,x+14,0); tg.addColorStop(0,'#A06A3A'); tg.addColorStop(.5,'#8A5A30'); tg.addColorStop(1,'#5E3B1C');
      c.fillStyle=tg; c.beginPath(); c.moveTo(x-12,g+10); c.lineTo(x-9,lo+38); c.lineTo(x+9,lo+38); c.lineTo(x+12,g+10); c.closePath(); c.fill();
      c.strokeStyle='#6E4424'; c.lineWidth=6; c.lineCap='round'; c.beginPath(); c.moveTo(x,lo+80); c.lineTo(x+20,lo+60); c.stroke();
      gmBall(c,x+24,lo+58,10,'#C6EBA4','#6FB357','#3E8436');
      gmBall(c,x-16,lo+38,22,'#B9E39A','#62A84C','#357A31');
      gmBall(c,x+16,lo+40,22,'#B9E39A','#62A84C','#357A31');
      gmBall(c,x,lo+26,26,'#CDEDA6','#6FB357','#3E8436');
      c.fillStyle='rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(x-8,lo+14,8,4,-.5,0,Math.PI*2); c.fill();
    }
    function drawCloud(c,o){
      var x=o.x, cy=o.cy, bob=Math.sin(t2*1.6+o.ph)*2;
      c.save(); c.strokeStyle='rgba(95,160,214,.85)'; c.lineWidth=3; c.lineCap='round';
      for(var d=-2;d<=2;d++){var dy=((t2*120+d*37+o.ph*50)%46);c.beginPath();c.moveTo(x+d*18,cy+26+dy);c.lineTo(x+d*18-3,cy+34+dy);c.stroke();}
      c.restore();
      [[0,-6,30],[-30,4,24],[30,4,24],[-14,-18,22],[16,-16,24],[0,10,26]].forEach(function(q){gmBall(c,x+q[0],cy+q[1]+bob,q[2],'#D9E0EA','#A4B0C2','#6F7C92');});
      c.fillStyle='#4E5A6E'; c.beginPath(); c.arc(x-10,cy+2+bob,2.6,0,Math.PI*2); c.arc(x+10,cy+2+bob,2.6,0,Math.PI*2); c.fill();
      c.strokeStyle='#4E5A6E'; c.lineWidth=2; c.beginPath(); c.arc(x,cy+14+bob,6,Math.PI*1.15,Math.PI*1.85); c.stroke();
    }
    function drawRider(c){
      var x=px(), tilt=Math.max(-.35,Math.min(.35,vy*.0016));
      if(dead) tilt=Math.min(2.4,deadT*3);
      gmShadow(c,x,gy()+6,Math.max(10,30-(gy()-y)*.06),6,.18);
      c.save(); c.translate(x,y); c.rotate(tilt);
      if(dead) c.globalAlpha=Math.max(.3,1-deadT*.6);
      var lg=c.createLinearGradient(0,-18,0,18); lg.addColorStop(0,'#B6E07E'); lg.addColorStop(.55,'#7CBF4E'); lg.addColorStop(1,'#4A8A33');
      c.fillStyle=lg; lfLeafPath(c,1); c.fill(); c.strokeStyle='#3F7F34'; c.lineWidth=2.5; c.stroke();
      /* the middle vein and side veins, kept inside the leaf so none poke past its edge near the point */
      c.save(); lfLeafPath(c,.94); c.clip();
      c.strokeStyle='rgba(47,107,44,.55)'; c.lineWidth=2; c.lineCap='round'; c.beginPath(); c.moveTo(-40,0); c.lineTo(38,-2); c.stroke();
      [[-24,10],[-8,10],[8,9],[22,6]].forEach(function(q){var v=q[0],l=q[1];c.beginPath();c.moveTo(v,-1);c.lineTo(v+l,-1-l);c.moveTo(v,-1);c.lineTo(v+l,l-1);c.stroke();});
      c.restore(); c.lineCap='butt';
      c.strokeStyle='#6E4424'; c.lineWidth=3; c.lineCap='round'; c.beginPath(); c.moveTo(-40,0); c.quadraticCurveTo(-50,2,-54,10); c.stroke();
      c.fillStyle='rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-6,-9,14,3.5,-.15,0,Math.PI*2); c.fill();
      if(gmReady(breeze)) c.drawImage(breeze,-26,-60,48,64);
      c.restore();
      /* puffs of wind under the leaf while Breeze blows */
      if(holding()&&!dead){
        c.save(); c.strokeStyle='rgba(255,255,255,.95)'; c.lineCap='round'; c.lineWidth=4;
        for(var w=0;w<3;w++){var k=((t2*3+w/3)%1), wx=x-18+w*14, wy=y+26+k*30;c.globalAlpha=1-k;c.beginPath();c.moveTo(wx-10,wy);c.quadraticCurveTo(wx,wy-7,wx+10,wy);c.stroke();}
        c.restore();
      }
    }
    return {
      peek:function(){return {y:y,vy:vy,things:things,px:px(),gy:gy(),top:TOP,bot:BOT,dead:dead};},   /* for testing */
      input:function(n,down){if(n==='blow')held=down;},
      pointer:function(t){if(t==='down')ptr=true;else if(t==='up')ptr=false;},
      update:function(dt){
        if(dt===0){ptr=false;held=false;}   /* just after a pause: nothing is still held down */
        t2+=dt;
        if(dead){deadT+=dt;vy=Math.min(260,vy+500*dt);y=Math.min(gy()-6,y+vy*dt);return;}
        var v=K.rate(LF_SET.speed)*f(), H=holding();
        if(H&&!wasHolding)whoosh();
        wasHolding=H;
        /* a gentle start: for the first few seconds the leaf only floats down slowly */
        var ease=Math.min(1,.15+K.t/5);
        if(H) vy-=(vy>0?1500:650)*dt; else vy+=(vy<0?700:300*ease)*dt;
        vy=Math.max(-LF_SET.rise[i]*vs(),Math.min(LF_SET.fall[i]*vs()*ease,vy));
        y+=vy*dt;
        if(y-TOP<8){y=8+TOP;if(vy<0)vy=0;}
        K.score(K.t);
        puffs.forEach(function(p){p.x-=v*.3*dt;if(p.x<-90){p.x=K.W+90+Math.random()*60;p.y=30+Math.random()*K.H*.45;}});
        tufts.forEach(function(t){t.x-=v*dt;if(t.x<-30){t.x+=K.W+60+Math.random()*40;t.k=Math.floor(Math.random()*3);}});
        dist+=v*dt;
        var sp=LF_SET.space, space=Math.max(sp.min[i],sp.start[i]/(1+LF_SET.speed.grow[i]*K.t))*f();
        if(dist>=nextSpace){dist=0;nextSpace=space;spawn(v);}
        for(var k=things.length-1;k>=0;k--){
          var o=things[k]; o.x-=v*dt;
          if(hit(o)){crash();return;}
          if(o.x<-120)things.splice(k,1);
        }
        if(y+BOT-6>gy()){y=gy()-BOT+6;crash();}
      },
      draw:function(c){
        drawSky(c);
        things.forEach(function(o){if(o.type==='cloud')drawCloud(c,o);else if(o.type==='top')drawTop(c,o);});
        drawGround(c);
        things.forEach(function(o){if(o.type==='bottom')drawBottom(c,o.tip,o);else if(o.type==='gate'){drawTop(c,o);drawBottom(c,o.tip2,o);}});
        drawRider(c);
      }
    };
  }
};
