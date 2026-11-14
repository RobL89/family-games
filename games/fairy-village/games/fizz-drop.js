/* ================================================================
   FIZZ DROP - Gizmo's game (phase 10)
   A calm puzzle with no timer. Gizmo's glass jar fills from the bottom with fizz balls that sit in
   a honeycomb (8 balls across, 7 in the rows between). Move the dropper along the top of the jar
   and drop the next ball when you're ready: it falls straight down and snaps into the honeycomb.
   Three or more of the same colour touching fizz away; any balls left with nothing joining them
   to the bottom of the jar fizz away too. Every few drops a new row of fizz bubbles up from the
   bottom and lifts everything (shown by the dots beside the jar); this comes a little more often
   as the game goes on. When a ball sits above the rim, the jar overflows and the game ends.
   Score: balls fizzed. Little Sprite has 3 colours, Clever Pixie and Nimble Nymph 4 (Nimble
   Nymph's rows come sooner). Each colour has its own symbol so it can be told apart without colour.
   Controls: touch or press, slide to aim, let go to drop (a mouse aims as it moves; click drops).
   Arrow keys or A and D move the dropper, Space, Enter or down arrow drops.
   A simulation picked the numbers: with 5 colours even a careful player lasted about 60 drops,
   with 3 a careful player could go on for ever unless the rows come more often over time.
   Names in this file start with fd or FD so they don't clash with other files.
   ================================================================ */
var FD_SET={
  colours:[3,4,4],
  rise:[10,10,8],       /* drops between new rows at the start */
  riseMin:[4,5,4],      /* ... and at the most often */
  riseStep:[25,30,25],  /* every this many drops, rows come one drop sooner */
  cols:8, rows:11,      /* balls across a wide row; rows inside the jar */
  start:3,              /* rows in the jar at the start */
  fall:42               /* how fast a dropped ball falls, in ball radii a second */
};
var FD_COL=[
  {n:'pink',l:'#FFD6E6',m:'#F27BAA',d:'#B83A70',sym:'heart'},
  {n:'blue',l:'#D2EEFF',m:'#5BB0E8',d:'#2668A8',sym:'drop'},
  {n:'green',l:'#DDF7D6',m:'#6CC95E',d:'#2F8A2C',sym:'leaf'},
  {n:'yellow',l:'#FFF4C2',m:'#F8C93A',d:'#B88A0E',sym:'star'},
  {n:'purple',l:'#EDE2FF',m:'#A584EA',d:'#6243B0',sym:'moon'}
];
var FD_S3=Math.sqrt(3);
/* a white symbol in the middle of a ball, so colours can be told apart without colour */
function fdSym(c,sym,x,y,r){
  c.save(); c.translate(x,y); c.scale(r/10,r/10); c.fillStyle='rgba(255,255,255,.92)'; c.beginPath();
  if(sym==='heart'){c.moveTo(0,4.5);c.bezierCurveTo(-6,0,-5.5,-5,-2.6,-5);c.bezierCurveTo(-1,-5,0,-3.6,0,-2.6);c.bezierCurveTo(0,-3.6,1,-5,2.6,-5);c.bezierCurveTo(5.5,-5,6,0,0,4.5);}
  else if(sym==='drop'){c.moveTo(0,-5.5);c.bezierCurveTo(3,-1.5,4.2,1,4.2,2.2);c.arc(0,2.2,4.2,0,Math.PI,false);c.bezierCurveTo(-4.2,1,-3,-1.5,0,-5.5);}
  else if(sym==='leaf'){c.moveTo(-4.5,4.5);c.bezierCurveTo(-5,-3,0,-5.5,5,-5);c.bezierCurveTo(5.5,0,3,5,-4.5,4.5);}
  else if(sym==='star'){for(var k=0;k<10;k++){var a=-Math.PI/2+k*Math.PI/5, rr=k%2?2.3:5.4;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr+.4);}}
  else {c.arc(0,0,5,0,Math.PI*2);c.arc(2.4,-1.4,4.2,0,Math.PI*2,true);}
  c.closePath(); c.fill(); c.restore();
}
function fdBall(c,x,y,r,k,a){
  var C=FD_COL[k]; if(a!=null){c.save();c.globalAlpha=a;}
  gmBall(c,x,y,r,C.l,C.m,C.d);
  c.strokeStyle=C.d; c.lineWidth=Math.max(1,r*.07); c.beginPath(); c.arc(x,y,r-c.lineWidth/2,0,Math.PI*2); c.stroke();
  fdSym(c,C.sym,x+r*.04,y+r*.08,r*.62);
  c.fillStyle='rgba(255,255,255,.7)'; c.beginPath(); c.ellipse(x-r*.36,y-r*.42,r*.22,r*.13,-.6,0,Math.PI*2); c.fill();
  if(a!=null)c.restore();
}
function fdHowArt(k){
  var ball=function(x,y,col,r){var C=FD_COL[col];r=r||7;return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+C.m+'" stroke="'+C.d+'" stroke-width="1.5"/><circle cx="'+(x-2.4)+'" cy="'+(y-2.6)+'" r="'+(r*.28)+'" fill="#fff" opacity=".75"/>';};
  var jar='<path d="M12 18 V54 C12 59 15 61 20 61 H44 C49 61 52 59 52 54 V18" fill="#EAF6FB" stroke="#7FA9BF" stroke-width="2.5"/><path d="M9 18 H55" stroke="#7FA9BF" stroke-width="3" stroke-linecap="round"/>';
  if(k==='drop') return jar+ball(19,53,0)+ball(33,53,1)+ball(45,53,2)+ball(26,41,1)+'<path d="M38 4 V10" stroke="#8C98A8" stroke-width="4" stroke-linecap="round"/>'+ball(38,16,0,6)+'<path d="M38 26 V34 M35 31 L38 34 L41 31" stroke="#B8467A" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  if(k==='fizz') return jar+ball(19,53,1)+ball(33,53,0)+ball(47,53,0)+ball(40,41,0)+'<g fill="#fff" stroke="#F27BAA" stroke-width="1.5"><circle cx="40" cy="26" r="3"/><circle cx="48" cy="30" r="2"/><circle cx="32" cy="30" r="2.5"/><circle cx="44" cy="20" r="2"/></g>';
  return jar+ball(19,53,0)+ball(33,53,1)+ball(45,53,2)+ball(26,41,2)+ball(40,41,0)+ball(19,29,1)+ball(33,29,2)+ball(45,29,1)+ball(26,17,0)+ball(40,17,1)+'<path d="M6 10 L10 6 M58 10 L54 6" stroke="#E8743A" stroke-width="2.5" stroke-linecap="round"/>';
}
function fdSfx(name,n){
  if(!mem.sound)return;
  if(name==='drop'){tone(659.25,0,.08,'sine',.06);}
  else if(name==='land'){tone(392,0,.07,'triangle',.07);noiseHit(0,'highpass',3500,.06,.05);}
  else if(name==='fizz'){noiseHit(0,'highpass',4000,.45,.16);var f=[784,880,988,1047,1175,1319][Math.min(5,Math.max(0,(n||3)-3))];tone(f,0,.18,'sine',.1);tone(f*1.25,.07,.22,'sine',.08);tone(f*1.5,.14,.3,'sine',.07);}
  else if(name==='rise'){var c=ctx();if(!c)return;var t=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(440,t+.35);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.08,t+.05);g.gain.exponentialRampToValueAtTime(.0001,t+.45);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+.5);}
  else if(name==='spill'){noiseHit(0,'bandpass',1500,.7,.3);tone(330,0,.3,'triangle',.08);tone(262,.15,.4,'triangle',.07);}
}
GAMES.gizmo={
  name:'Fizz drop',
  intro:function(L){return 'Gizmo is making fizz! Slide along the top of the jar and let go to drop a fizz ball. Three of the same colour touching fizz away. Every few drops a new row bubbles up from the bottom. Take your time, but don’t let the fizz go over the top!';},
  how:[{art:fdHowArt('drop'),text:'Drop'},{art:fdHowArt('fizz'),text:'Match three'},{art:fdHowArt('full'),text:'Don’t overflow'}],
  lives:0,
  keys:{ArrowLeft:'left',ArrowRight:'right',a:'left',d:'right',A:'left',D:'right',' ':'drop',Enter:'drop',ArrowDown:'drop',s:'drop',S:'drop'},
  hud:function(n){return String(n);},
  unit:function(n){return n+' ball'+(n===1?'':'s');},
  said:function(n){return n===0?'No balls fizzed this time.':'You fizzed '+n+' ball'+(n===1?'':'s')+'!';},
  make:function(K){
    var i=K.L-1, NC=FD_SET.colours[i], COLS=FD_SET.cols, ROWS=FD_SET.rows;
    var g={}, base=0, fizzed=0, drops=0, since=0, dead=false, t2=0;
    var aim=COLS, curB=0, nextB=0, falling=null, pops=[], drips=[], rise=0, spill=-1, aiming=false, held={left:false,right:false}, kbMoved=false, gzJump=-1, endWait=-1;
    var gz=K.img('fd-gizmo',K.F.art(),'0 0 240 320',84,112), bg=gmScene('gizmo');
    var fizz=[]; for(var f0=0;f0<26;f0++)fizz.push({x:Math.random(),y:Math.random(),s:.06+Math.random()*.1,v:.3+Math.random()*.5});
    /* ---- the honeycomb, in jar units: ball radius 1, x from the jar's left wall, y up from its floor ---- */
    function key(r,c){return r+','+c;}
    function wide(r){return ((r+base)&1)===0;}
    function ncol(r){return wide(r)?COLS:COLS-1;}
    function pos(r,c){return {x:(wide(r)?1:2)+2*c,y:1+r*FD_S3};}
    function nbs(r,c){
      var out=[[r,c-1],[r,c+1]];
      [r-1,r+1].forEach(function(rr){if(rr<0)return;if(wide(r)){out.push([rr,c-1]);out.push([rr,c]);}else{out.push([rr,c]);out.push([rr,c+1]);}});
      return out.filter(function(p){return p[0]>=0&&p[1]>=0&&p[1]<ncol(p[0]);});
    }
    function each(fn){for(var k in g){var p=k.split(',');fn(+p[0],+p[1],g[k]);}}
    function present(){var s={};each(function(r,c,v){s[v.k]=1;});var a=Object.keys(s).map(Number);return a.length?a:null;}
    function randCol(){var p=present();return p?pick(p):Math.floor(Math.random()*NC);}
    function group(r,c,G){
      var k=G[key(r,c)].k, seen={}, st=[[r,c]], out=[]; seen[key(r,c)]=1;
      while(st.length){var p=st.pop();out.push(p);nbs(p[0],p[1]).forEach(function(q){var kk=key(q[0],q[1]);if(!seen[kk]&&G[kk]&&G[kk].k===k){seen[kk]=1;st.push(q);}});}
      return out;
    }
    /* a new row of fizz bubbles up from the bottom; no three of a colour touching in it */
    function addRow(){
      var ng={}; each(function(r,c,v){ng[key(r+1,c)]=v;}); g=ng; base^=1;
      for(var c=0;c<ncol(0);c++){
        var tries=0, k;
        do{k=Math.floor(Math.random()*NC);g[key(0,c)]={k:k,pop:-1,sy:0};tries++;}while(tries<12&&group(0,c,g).length>=3);
      }
      for(var k2 in g)g[k2].sy=(g[k2].sy||0)-FD_S3;
    }
    for(var s0=0;s0<FD_SET.start;s0++)addRow();
    for(var k3 in g)g[k3].sy=0;
    curB=randCol(); nextB=randCol();
    function riseEvery(){return Math.max(FD_SET.riseMin[i],FD_SET.rise[i]-Math.floor(drops/FD_SET.riseStep[i]));}
    function topRow(){var t=-1;each(function(r){if(r>t)t=r;});return t;}
    /* where a ball dropped at x comes to rest: it falls until it meets a ball or the floor, then snaps into the nearest free spot */
    function landAt(x){
      var y=1;
      each(function(r,c){var p=pos(r,c),dx=Math.abs(p.x-x);if(dx<2)y=Math.max(y,p.y+Math.sqrt(4-dx*dx));});
      var best=null, r0=Math.max(0,Math.floor((y-1)/FD_S3)-1);
      for(var r=r0;r<=r0+3;r++)for(var c=0;c<ncol(r);c++){
        if(g[key(r,c)])continue;
        var held2=r===0||nbs(r,c).some(function(q){return !!g[key(q[0],q[1])];}); if(!held2)continue;
        var p=pos(r,c), d=(p.x-x)*(p.x-x)+(p.y-y)*(p.y-y);
        if(!best||d<best.d)best={d:d,r:r,c:c};
      }
      return {r:best.r,c:best.c,y:y};
    }
    /* ---- layout ---- */
    /* wide screens have the Next and New row boxes beside the jar; narrow ones have them above the dropper */
    function lay(){
      var W=K.W, H=K.H, jarU=2+(ROWS-1)*FD_S3, R=Math.min(26,(H-20)/(jarU+6.6),(W-20)/(2*COLS+1.4)), side=(W-2*COLS*R)/2>R*4.4;
      if(!side)R=Math.min(R,(H-20)/(jarU+10.4));
      var tot=R*(jarU+(side?6.6:10.4));
      var L={W:W,H:H,R:R,jw:2*COLS*R,side:side};
      L.x0=(W-L.jw)/2; L.floor=Math.min(H-12-R*.5,(H+tot)/2-R*.6); L.rimY=L.floor-jarU*R-R*.2; L.dropY=L.rimY-R*2.4;
      L.sx=function(x){return L.x0+x*R;}; L.sy=function(y){return L.floor-y*R;};
      L.jx=function(px){return (px-L.x0)/R;};
      return L;
    }
    function drop(){
      if(dead||falling||rise>0||pops.length)return;
      var d=landAt(aim), p=pos(d.r,d.c);
      var L=lay(); falling={k:curB,x:aim,sx:aim,y:(L.floor-L.dropY)/L.R,tx:p.x,ty:p.y,r:d.r,c:d.c};
      curB=nextB; nextB=randCol(); fdSfx('drop');
    }
    function settle(){
      var f=falling; falling=null;
      g[key(f.r,f.c)]={k:f.k,pop:-1,sy:0}; drops++; since++; fdSfx('land');
      var grp=group(f.r,f.c,g), n=0;
      if(grp.length>=3){
        grp.forEach(function(p){g[key(p[0],p[1])].pop=0;}); n=grp.length;
        /* anything no longer joined to the floor fizzes away as well */
        var gone={}; grp.forEach(function(p){gone[key(p[0],p[1])]=1;});
        var seen={}, st=[]; each(function(r,c){if(r===0&&!gone[key(r,c)]){seen[key(r,c)]=1;st.push([r,c]);}});
        while(st.length){var p=st.pop();nbs(p[0],p[1]).forEach(function(q){var kk=key(q[0],q[1]);if(g[kk]&&!gone[kk]&&!seen[kk]){seen[kk]=1;st.push(q);}});}
        each(function(r,c,v){var kk=key(r,c);if(!gone[kk]&&!seen[kk]){v.pop=0;v.loose=1;n++;}});
        pops=[]; each(function(r,c,v){if(v.pop>=0)pops.push(key(r,c));});
        fizzed+=n; K.score(fizzed); fdSfx('fizz',n); if(n>=5)gzJump=0;
      }
      if(!pops.length)afterDrop();
    }
    function afterDrop(){
      if(topRow()>=ROWS){overflow();return;}
      if(since>=riseEvery()){since=0;addRow();rise=.45;fdSfx('rise');}
      else {var p=present(); if(p&&p.indexOf(curB)<0)curB=pick(p); if(p&&p.indexOf(nextB)<0)nextB=pick(p);}
    }
    function overflow(){
      if(dead)return; dead=true; spill=0; endWait=.6; fdSfx('spill');
      var L=lay(); for(var k=0;k<34;k++){drips.push({x:L.x0+Math.random()*L.jw,y:L.rimY,vx:(Math.random()-.5)*160,vy:-60-Math.random()*160,t:0,k:pick(Object.keys(g).map(function(q){return g[q].k;}))||0});}
    }
    function setAim(px){var L=lay();aim=Math.max(1,Math.min(2*COLS-1,L.jx(px)));}
    return {
      peek:function(){return {g:g,base:base,drops:drops,since:since,dead:dead,aim:aim,cur:curB,next:nextB,busy:!!(falling||rise>0||pops.length),
        land:landAt,setAim:function(x){aim=x;},
        groupIf:function(x){var d=landAt(x),kk=key(d.r,d.c);g[kk]={k:curB};var n=group(d.r,d.c,g).length;delete g[kk];return {n:n,r:d.r};},drop:drop,riseEvery:riseEvery,top:topRow,lay:lay()};},   /* for testing */
      input:function(n,down){
        if(n==='left'||n==='right'){held[n]=down;if(down)kbMoved=true;return;}
        if(n==='drop'&&down)drop();
      },
      pointer:function(t,x,y,type){
        if(dead)return;
        if(t==='down'){aiming=true;setAim(x);kbMoved=false;return;}
        if(t==='move'){if(aiming||type==='mouse'){setAim(x);kbMoved=false;}return;}
        if(t==='up'&&aiming){aiming=false;setAim(x);drop();}
      },
      update:function(dt){
        t2+=dt;
        fizz.forEach(function(b){b.y-=b.v*dt*.12;if(b.y<0){b.y=1;b.x=Math.random();}});
        for(var d=drips.length-1;d>=0;d--){var o=drips[d];o.t+=dt;o.x+=o.vx*dt;o.y+=o.vy*dt;o.vy+=520*dt;if(o.t>2)drips.splice(d,1);}
        if(gzJump>=0){gzJump+=dt;if(gzJump>1.2)gzJump=-1;}
        if(spill>=0)spill+=dt;
        if(dead){if(endWait>0){endWait-=dt;if(endWait<=0)K.end();}return;}
        if(held.left)aim=Math.max(1,aim-dt*9); if(held.right)aim=Math.min(2*COLS-1,aim+dt*9);
        for(var k in g){var v=g[k];if(v.sy){v.sy=Math.min(0,v.sy+dt*FD_S3/.45);}}
        if(rise>0){rise-=dt;if(rise<=0){rise=0;afterDrop2();}}
        if(falling){
          var f=falling; f.y-=FD_SET.fall*dt;
          /* in the last stretch it slides sideways into its spot */
          var k1=Math.max(0,Math.min(1,(f.ty+1.6-f.y)/1.6)); f.x=f.sx+(f.tx-f.sx)*k1*k1*(3-2*k1);
          if(f.y<=f.ty){f.y=f.ty;f.x=f.tx;settle();}
        }
        if(pops.length){
          var done=true;
          pops.forEach(function(kk){var v=g[kk];if(!v)return;v.pop+=dt;if(v.pop<.38)done=false;});
          if(done){pops.forEach(function(kk){delete g[kk];});pops=[];afterDrop();}
        }
      },
      draw:function(c){
        var L=lay(), W=L.W, H=L.H, R=L.R;
        if(!gmCover(c,bg,W,H)){c.fillStyle='#EEF3F8';c.fillRect(0,0,W,H);}
        c.fillStyle='rgba(255,255,255,.4)'; c.fillRect(0,0,W,H);
        var jx=L.x0-R*.45, jw=L.jw+R*.9, top=L.rimY, bot=L.floor+R*.4;
        /* the jar's back: soft fizzy water with little rising bubbles */
        c.save(); var wg=c.createLinearGradient(0,top,0,bot); wg.addColorStop(0,'rgba(226,244,252,.75)'); wg.addColorStop(1,'rgba(196,230,246,.9)');
        c.fillStyle=wg; gmRound(c,jx,top,jw,bot-top,R*.9); c.fill();
        c.globalAlpha=.55; c.strokeStyle='#fff'; c.lineWidth=1.5;
        fizz.forEach(function(b){c.beginPath();c.arc(jx+b.x*jw,top+b.y*(bot-top),b.s*R,0,Math.PI*2);c.stroke();}); c.restore();
        /* the honeycomb of fizz balls */
        for(var kk in g){var p=kk.split(','), r=+p[0], cc=+p[1], v=g[kk], q=pos(r,cc), x=L.sx(q.x), y=L.sy(q.y+(v.sy||0));
          if(v.pop>=0){var k1=v.pop/.38; if(v.loose){y+=k1*k1*R*3;} fdBall(c,x,y,R*(1+k1*.35),v.k,Math.max(0,1-k1));
            c.save();c.globalAlpha=Math.max(0,1-k1);c.strokeStyle='#fff';c.lineWidth=2;for(var b=0;b<4;b++){var an=b*1.7+r;c.beginPath();c.arc(x+Math.cos(an)*R*(.6+k1*1.2),y+Math.sin(an)*R*(.6+k1*1.2)-k1*R,R*.18,0,Math.PI*2);c.stroke();}c.restore();
            continue;}
          fdBall(c,x,y,R*.97,v.k);
        }
        /* where the ball will land, while nothing is moving */
        var busy=falling||rise>0||pops.length||dead, dx=L.sx(aim);
        if(!busy){
          var d=landAt(aim), lp=pos(d.r,d.c), lx=L.sx(lp.x), ly=L.sy(lp.y);
          c.save(); c.setLineDash([6,8]); c.lineDashOffset=-t2*16; c.strokeStyle='rgba(98,67,176,.45)'; c.lineWidth=2.5; c.beginPath(); c.moveTo(dx,L.dropY+R); c.lineTo(dx,L.sy(d.y)-R); c.stroke(); c.restore();
          c.save(); c.globalAlpha=.6+Math.sin(t2*5)*.2; c.strokeStyle=FD_COL[curB].d; c.lineWidth=3; c.setLineDash([5,5]); c.beginPath(); c.arc(lx,ly,R*.9,0,Math.PI*2); c.stroke(); c.restore();
        }
        if(falling)fdBall(c,L.sx(falling.x),L.sy(falling.y),R*.97,falling.k);
        /* the glass: a rim and highlights in front of the balls */
        var warn=topRow()>=ROWS-2&&!dead;
        c.save(); c.strokeStyle='rgba(110,150,175,.9)'; c.lineWidth=3; gmRound(c,jx,top-R*.3,jw,bot-top+R*.3,R*.9); c.stroke();
        c.globalAlpha=.5; c.strokeStyle='#fff'; c.lineWidth=R*.25; c.lineCap='round'; c.beginPath(); c.moveTo(jx+R*.5,top+R*1.4); c.lineTo(jx+R*.5,bot-R*1.4); c.stroke();
        c.globalAlpha=.3; c.beginPath(); c.moveTo(jx+jw-R*.6,top+R*2); c.lineTo(jx+jw-R*.6,top+R*5); c.stroke(); c.restore();
        c.save(); c.lineCap='round'; c.strokeStyle=warn?'rgba(232,116,58,'+(.6+Math.sin(t2*6)*.35)+')':'#7FA9BF'; c.lineWidth=R*.32; c.beginPath(); c.moveTo(jx-R*.25,top-R*.3); c.lineTo(jx+jw+R*.25,top-R*.3); c.stroke(); c.restore();
        /* the dropper and the ball waiting in it */
        if(!dead){
          c.save(); var tube=c.createLinearGradient(dx-R*.45,0,dx+R*.45,0); tube.addColorStop(0,'#F4F7FA'); tube.addColorStop(.5,'#C9D2DC'); tube.addColorStop(1,'#8C98A8');
          c.fillStyle=tube; c.strokeStyle='#6E7A8A'; c.lineWidth=2; gmRound(c,dx-R*.42,L.dropY-R*2.6,R*.84,R*1.7,R*.2); c.fill(); c.stroke();
          c.fillStyle='#E0AE3E'; c.strokeStyle='#8A5E14'; gmRound(c,dx-R*.6,L.dropY-R*1.15,R*1.2,R*.32,R*.12); c.fill(); c.stroke(); c.restore();
          if(!falling)fdBall(c,dx,L.dropY,R*.97,curB);
          if(kbMoved||held.left||held.right){c.save();c.fillStyle='#B8467A';c.beginPath();c.moveTo(dx-R*1.6,L.dropY);c.lineTo(dx-R*1.15,L.dropY-R*.35);c.lineTo(dx-R*1.15,L.dropY+R*.35);c.fill();c.beginPath();c.moveTo(dx+R*1.6,L.dropY);c.lineTo(dx+R*1.15,L.dropY-R*.35);c.lineTo(dx+R*1.15,L.dropY+R*.35);c.fill();c.restore();}
        }
        /* next ball and how soon the next row comes */
        var fs=Math.max(13,Math.min(18,R*.7)), nx, ny, rx, ry;
        if(L.side){nx=jx-R*2.6; ny=L.dropY; rx=jx+jw+R*2.6; ry=L.dropY;}
        else {nx=jx+Math.max(R*2.6,fs*4.6)/2; ny=L.dropY-R*4.3; rx=jx+jw-Math.max(R*2.6,fs*4.6)/2; ry=ny;}
        var pw=Math.max(R*2.6,fs*4.6);
        c.save(); c.fillStyle='rgba(255,255,255,.92)'; gmRound(c,nx-pw/2,ny-R*1.3-fs*.7,pw,R*2.6+fs*.9,R*.6); c.fill(); c.strokeStyle='#C9B8F5'; c.lineWidth=2; c.stroke(); c.restore();
        gmText(c,'Next',nx,ny-R*1.05,fs,'#6243B0'); fdBall(c,nx,ny+R*.25,R*.72,nextB);
        var left=Math.max(0,riseEvery()-since), tot=riseEvery(), dotR=Math.max(3,R*.2), dw=Math.min(R*2.4,(tot-1)*dotR*2.8);
        c.save(); c.fillStyle='rgba(255,255,255,.92)'; gmRound(c,rx-pw/2,ry-R*1.3-fs*.7,pw,R*2.6+fs*.9,R*.6); c.fill(); c.strokeStyle='#C9B8F5'; c.lineWidth=2; c.stroke(); c.restore();
        gmText(c,'New row',rx,ry-R*1.05,fs,'#6243B0');
        for(var dd=0;dd<tot;dd++){var cols2=Math.ceil(tot/2), row=dd<cols2?0:1, ci=row?dd-cols2:dd, nrow=row?tot-cols2:cols2, ddx=rx+(ci-(nrow-1)/2)*dotR*2.6, ddy=ry+R*(row?.7:.05);
          c.beginPath(); c.arc(ddx,ddy,dotR,0,Math.PI*2); c.fillStyle=dd<left?'#A584EA':'rgba(165,132,234,.18)'; c.fill(); c.strokeStyle='#6243B0'; c.lineWidth=1.2; c.stroke();}
        /* Gizmo watches from the side on wide screens */
        if(L.side&&gmReady(gz)){var gw=Math.min(R*4,100), gh=gw*4/3, gxp=jx+jw+R*.9, bob=Math.sin(t2*2.2)*3, jump=gzJump>=0?Math.abs(Math.sin(gzJump*10))*14*(1-gzJump/1.2):0;
          if(gxp+gw<W)c.drawImage(gz,gxp,L.floor-gh+R*.4+bob-jump,gw,gh);}
        /* overflowing */
        if(spill>=0){var a=Math.min(1,spill/.4);c.save();c.globalAlpha=.85*a;c.fillStyle='#fff';
          for(var s=0;s<9;s++){c.beginPath();c.arc(jx+jw*(s+.5)/9,top-R*.3-Math.sin(s*1.3+spill*4)*R*.3,R*(.7+.25*Math.sin(s*2.1)),0,Math.PI*2);c.fill();}c.restore();
          drips.forEach(function(o){fdBall(c,o.x,o.y,R*.4,o.k,Math.max(0,1-o.t/2));});
          gmText(c,'Overflow!',W/2,top-R*2.4,Math.max(26,R*1.3),'#6243B0',Math.min(1,spill*3));}
      }
    };
    function afterDrop2(){var p=present(); if(p&&p.indexOf(curB)<0)curB=pick(p); if(p&&p.indexOf(nextB)<0)nextB=pick(p); if(topRow()>=ROWS)overflow();}
  }
};
