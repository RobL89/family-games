/* ================================================================
   PIPE RUSH - Rivet's game (phase 10; endless boards added in phase 11)
   Rivet's mill has a board of 7 by 5 squares (5 by 7 on a tall phone), a brass tap on one side and an
   exit pipe on the far side, on a row picked at random.
   Tap a square to lay the next pipe from the queue there; tap a pipe again to swap it for the next
   one, as long as the water hasn't reached it. After a countdown the tap opens (tap the tap to open
   it early) and the water flows through the pipes one square at a time, faster as time goes on.
   Each pipe the water fills scores one; a cross pipe filled both ways scores twice.
   When the water reaches an open end, the edge of the board or a pipe that doesn't join, it spills
   and the game ends. But water that flows out through the exit pipe goes on to a new board: the old
   board slides away, the exit becomes the new board's tap on the same row, and after a shorter
   countdown the water flows on, so a good player can keep going for ever (the speed keeps growing).
   Score: pipes filled. Clever Pixie has 2 boulders to build round on each board, Nimble Nymph 4.
   Keyboard: arrow keys move a frame over the board, Space or Enter lays the pipe.
   The board is the same 35 squares on every screen, so best scores compare fairly.
   Names in this file start with pr or PR so they don't clash with other files.
   ================================================================ */
var PR_SET={
  delay:[16,13,10],                                                  /* seconds before the tap opens */
  delayNext:[12,10,8],                                               /* seconds before the water flows on, on each new board */
  slide:1,                                                           /* seconds for one board to slide away and the next to arrive */
  flow:{start:[7,5.5,4.2],grow:[.004,.005,.006],min:[3.5,2.8,2.2]},     /* seconds for the water to fill one pipe */
  rocks:[0,2,4],                                                    /* boulders on the board */
  queue:3                                                           /* pipes shown in the queue */
};
/* pipe sides, as in Ripple's pipe puzzle: N=1 E=2 S=4 W=8. The water comes in from the W side of the first square. */
var PR_N=1,PR_E=2,PR_S=4,PR_W=8, PR_COLS=7, PR_ROWS=5;
var PR_STEP={1:[-1,0],2:[0,1],4:[1,0],8:[0,-1]};
var PR_OPP={1:4,2:8,4:1,8:2};
var PR_PIECES=[{m:10,w:3},{m:5,w:3},{m:3,w:2},{m:6,w:2},{m:12,w:2},{m:9,w:2},{m:15,w:1.5}];
function prFlip(m){return (m&1?8:0)|(m&8?1:0)|(m&2?4:0)|(m&4?2:0);}   /* swap rows and columns (tall boards) */
function prHowArt(k){
  var pipe=function(d,wet){return '<path d="'+d+'" stroke="#7A3E1A" stroke-width="15" fill="none" stroke-linejoin="round"/><path d="'+d+'" stroke="#D4825A" stroke-width="11" fill="none" stroke-linejoin="round"/><path d="'+d+'" stroke="'+(wet?'#4FA9DE':'#F6EBDD')+'" stroke-width="6" fill="none" stroke-linejoin="round"/>';};
  if(k==='lay') return '<rect x="6" y="6" width="52" height="52" rx="8" fill="#F7E7C8" stroke="#9A6234" stroke-width="2.5"/>'+pipe('M6 32 H32 V58')+'<circle cx="48" cy="18" r="8" fill="#fff" stroke="#B8467A" stroke-width="2.5"/><circle cx="48" cy="18" r="3" fill="#B8467A"/>';
  if(k==='exit') return pipe('M4 22 H30 V44 H48',true)+'<path d="M48 44 H60" stroke="#7A3E1A" stroke-width="15"/><path d="M48 44 H60" stroke="#D4825A" stroke-width="11"/><path d="M48 44 H60" stroke="#4FA9DE" stroke-width="6"/><path d="M50 26 L58 32 L50 38" stroke="#2E8A3A" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  if(k==='flow') return pipe('M4 22 H30 V44 H60',true)+'<path d="M38 54 L46 54 M42 50 L46 54 L42 58" stroke="#3E7FB0" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  return pipe('M4 32 H36',true)+'<g fill="#4FA9DE"><circle cx="44" cy="26" r="4"/><circle cx="50" cy="36" r="3.5"/><circle cx="46" cy="46" r="4.5"/><circle cx="56" cy="24" r="3"/><circle cx="56" cy="48" r="3"/></g>';
}
GAMES.rivet={
  name:'Pipe rush',
  intro:function(L){return 'Water is coming through Rivet’s mill! Tap the board to lay the next pipe, and build a path for the water to follow. You can swap a pipe until the water reaches it.'+(L>1?' Build round the boulders.':'')+' Lead the water to the green exit pipe and it flows on to a new board, so you can keep going and going. Tap the tap to start the water early. If the water reaches an open end, it spills and the game ends.';},
  how:[{art:prHowArt('lay'),text:'Lay pipes'},{art:prHowArt('exit'),text:'Reach the exit'},{art:prHowArt('spill'),text:'Don’t spill'}],
  lives:0,
  keys:{ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',' ':'lay',Enter:'lay'},
  hud:function(n){return String(n);},
  unit:function(n){return n+' pipe'+(n===1?'':'s');},
  said:function(n){return n===0?'No pipes filled this time.':'You filled '+n+' pipe'+(n===1?'':'s')+'!';},
  make:function(K){
    var i=K.L-1, grid=[], queue=[], filled=0, dead=false, t2=0, wait=PR_SET.delay[i], water=null, spill=null;
    var drops=[], poofs=[], shakes={}, kb=false, cur={r:2,c:0}, lastM=-1, sameM=0, tapSpin=0, rvJump=-1;
    var entryR=2, exitR=2, board=1, slide=null, outFlow=0;   /* the tap's row, the exit's row, which board this is, the board change */
    var rv=K.img('pr-rivet',K.F.art(),'0 0 240 320',72,96), bg=gmScene('rivet');
    /* a fresh board: the exit on a random row, and boulders away from the tap and the exit and not touching each other */
    function makeBoard(){
      var gr=[];
      for(var r=0;r<PR_ROWS;r++){gr.push([]);for(var c=0;c<PR_COLS;c++)gr[r].push({m:0,rock:false,wet:0});}
      exitR=Math.floor(Math.random()*PR_ROWS);
      var tries=0, placed=0;
      while(placed<PR_SET.rocks[i]&&tries<500){
        tries++; var rr=Math.floor(Math.random()*PR_ROWS), cc=1+Math.floor(Math.random()*(PR_COLS-1));
        if(rr===entryR&&cc<3)continue;
        if(rr===exitR&&cc>PR_COLS-3)continue;
        var near=false; for(var dr=-1;dr<=1;dr++)for(var dc=-1;dc<=1;dc++){var g0=gr[rr+dr]&&gr[rr+dr][cc+dc];if(g0&&g0.rock)near=true;}
        if(near)continue; gr[rr][cc].rock=true; placed++;
      }
      return gr;
    }
    grid=makeBoard();
    function newPiece(){
      var tot=0, p, m;
      do{tot=PR_PIECES.reduce(function(s,q){return s+q.w;},0);var u=Math.random()*tot;
        for(var k=0;k<PR_PIECES.length;k++){u-=PR_PIECES[k].w;if(u<=0){m=PR_PIECES[k].m;break;}} if(m==null)m=10;
      }while(m===lastM&&sameM>=1);
      sameM=m===lastM?sameM+1:0; lastM=m; return m;
    }
    for(var q0=0;q0<PR_SET.queue;q0++)queue.push(newPiece());
    function flowTime(){var f=PR_SET.flow;return Math.max(f.min[i],f.start[i]/(1+f.grow[i]*K.t));}
    /* ---- layout: a wide board (tap on the left, queue on the right) or a tall one (tap at the top, queue below) ---- */
    function lay(){
      var W=K.W, H=K.H;
      var csA=Math.min(104,(W-44)/9.6,(H-36)/PR_ROWS), csB=Math.min(104,(W-28)/PR_ROWS,(H-40)/(PR_COLS+2.8));
      var tall=csB>csA, cs=tall?csB:csA, g={W:W,H:H,cs:cs,tall:tall};
      /* room is left on the far side of the board for the exit pipe */
      if(!tall){
        var tot=cs*(PR_COLS+.75)+cs*.55+cs*1.35;
        g.gx=(W-tot)/2+cs*.75; g.gy=(H-cs*PR_ROWS)/2+6;
        g.qx=g.gx+cs*PR_COLS+cs*.55; g.qw=cs*1.35; g.qy=g.gy; g.qh=cs*PR_ROWS;
      } else {
        g.gx=(W-cs*PR_ROWS)/2; g.gy=Math.max(14+cs*.7,(H-cs*(PR_COLS+2.8))/2+cs*.75);
        g.qx=g.gx; g.qw=cs*PR_ROWS; g.qy=g.gy+cs*PR_COLS+cs*.55; g.qh=cs*1.4;
      }
      /* the top left corner of a board square, and the square under a point */
      g.at=function(r,c){return tall?{x:g.gx+r*cs,y:g.gy+c*cs}:{x:g.gx+c*cs,y:g.gy+r*cs};};
      g.cell=function(x,y){var a=Math.floor((x-g.gx)/cs), b=Math.floor((y-g.gy)/cs), r=tall?a:b, c=tall?b:a;
        return (r>=0&&r<PR_ROWS&&c>=0&&c<PR_COLS)?{r:r,c:c}:null;};
      g.sm=function(m){return tall?prFlip(m):m;};
      var e=g.at(entryR,0); g.tap=tall?{x:e.x+cs/2,y:e.y}:{x:e.x,y:e.y+cs/2};
      var x2=g.at(exitR,PR_COLS-1); g.exit=tall?{x:x2.x+cs/2,y:x2.y+cs}:{x:x2.x+cs,y:x2.y+cs/2};
      g.bw=(tall?PR_ROWS:PR_COLS)*cs; g.bh=(tall?PR_COLS:PR_ROWS)*cs;
      return g;
    }
    function edgePt(g,r,c,side){var p=g.at(r,c),s=g.sm(side),h=g.cs/2;return {x:p.x+h+(s===2?h:s===8?-h:0),y:p.y+h+(s===4?h:s===1?-h:0)};}
    function doSpill(g,pt){
      if(dead)return; dead=true; water=null; spill={x:pt.x,y:pt.y,t:0}; rvJump=0;
      for(var k=0;k<26;k++){var a=-Math.PI/2+(Math.random()-.5)*2.6, v=80+Math.random()*180;drops.push({x:pt.x,y:pt.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,s:3+Math.random()*4});}
      K.sfx('splash'); K.sfx('miss'); K.end();
    }
    /* the water arrives at square r,c through its side `from` */
    function enter(r,c,from){
      var g=lay(), o=grid[r]&&grid[r][c];
      var ok=o&&!o.rock&&o.m&&(o.m&from)&&(o.m===15?!(o.wet&from):!o.wet);
      if(!ok){
        var pr=PR_STEP[from], pt=(o?edgePt(g,r,c,from):edgePt(g,r+pr[0],c+pr[1],PR_OPP[from]));
        doSpill(g,pt); return;
      }
      water={r:r,c:c,from:from,to:o.m===15?PR_OPP[from]:(o.m&~from),p:0};
    }
    function lay1(r,c){
      if(dead||slide)return;
      var o=grid[r][c], busy=water&&water.r===r&&water.c===c;
      if(o.rock||o.wet||busy){shakes[r+','+c]=0;if(mem.sound)tone(220,0,.14,'triangle',.06);return;}
      if(o.m)poofs.push({r:r,c:c,m:o.m,t:0});
      o.m=queue.shift(); queue.push(newPiece());
      if(mem.sound){tone(392,0,.08,'square',.035);tone(523,.05,.1,'triangle',.05);}
    }
    function openTap(){if(!dead&&!slide&&wait>0){wait=0;}}
    /* the water went out through the exit: on to a new board, with the exit's row as the new tap's row */
    function nextBoard(){
      slide={t:0,old:grid,oldExit:exitR,oldEntry:entryR};
      entryR=exitR; grid=makeBoard(); board++; water=null; wait=PR_SET.delayNext[i]; outFlow=0;
      cur={r:entryR,c:0}; poofs=[]; shakes={};
      rvJump=0;
      if(mem.sound){tone(659.25,0,.14,'sine',.09);tone(783.99,.1,.14,'sine',.09);tone(1046.5,.2,.3,'sine',.1);}
    }
    /* ---- drawing ---- */
    function pipeStrokes(c,x,y,cs,sm,w,col){
      c.strokeStyle=col; c.lineWidth=w; c.lineCap='butt'; c.lineJoin='round';
      var h=cs/2, cx=x+h, cy=y+h;
      if(sm===15){c.beginPath();c.moveTo(x,cy);c.lineTo(x+cs,cy);c.moveTo(cx,y);c.lineTo(cx,y+cs);c.stroke();return;}
      var ends=[]; [1,2,4,8].forEach(function(s){if(sm&s)ends.push(s);});
      function ep(s){return [cx+(s===2?h:s===8?-h:0),cy+(s===4?h:s===1?-h:0)];}
      c.beginPath(); var a=ep(ends[0]); c.moveTo(a[0],a[1]); c.lineTo(cx,cy); if(ends[1]){var b=ep(ends[1]);c.lineTo(b[0],b[1]);} c.stroke();
    }
    function waterSeg(c,cx,cy,h,s,k){var ex=cx+(s===2?h:s===8?-h:0), ey=cy+(s===4?h:s===1?-h:0);c.beginPath();c.moveTo(ex,ey);c.lineTo(ex+(cx-ex)*k,ey+(cy-ey)*k);c.stroke();}
    function drawPipe(c,x,y,cs,m,sm,wetSm,part){
      var h=cs/2, cx=x+h, cy=y+h;
      pipeStrokes(c,x,y,cs,sm,cs*.38,'#7A3E1A');
      pipeStrokes(c,x,y,cs,sm,cs*.32,'#D4825A');
      /* brass bands where the pipe meets the next square */
      c.fillStyle='#E0AE3E'; c.strokeStyle='#8A5E14'; c.lineWidth=1.5;
      [1,2,4,8].forEach(function(s){if(!(sm&s))return;var bw=cs*.44, bd=cs*.09, bx=s===2?x+cs-bd:s===8?x:cx-bw/2, by=s===4?y+cs-bd:s===1?y:cy-bw/2;
        var w2=s&10?bd:bw, h2=s&10?bw:bd; c.fillRect(bx,by,w2,h2); c.strokeRect(bx,by,w2,h2);});
      pipeStrokes(c,x,y,cs,sm,cs*.14,'#F6EBDD');
      /* a shine along the copper */
      c.save(); c.globalAlpha=.35; c.translate(-cs*.05,-cs*.05); pipeStrokes(c,x,y,cs,sm,cs*.04,'#FFE3CC'); c.restore();
      /* water: full sides, then the square the water is filling now */
      c.strokeStyle='#4FA9DE'; c.lineWidth=cs*.14; c.lineCap='butt';
      [1,2,4,8].forEach(function(s){if(wetSm&s)waterSeg(c,cx,cy,h,s,1);});
      if(wetSm&&sm!==15){c.fillStyle='#4FA9DE';c.beginPath();c.arc(cx,cy,cs*.085,0,Math.PI*2);c.fill();}
      if(part){
        var k=part.p, a=part.from, b=part.to;
        c.strokeStyle='#4FA9DE'; c.lineWidth=cs*.14;
        if(k<.5)waterSeg(c,cx,cy,h,a,k*2);
        else {waterSeg(c,cx,cy,h,a,1); c.fillStyle='#4FA9DE'; c.beginPath(); c.arc(cx,cy,cs*.085,0,Math.PI*2); c.fill();
          var ex=cx+(b===2?h:b===8?-h:0), ey=cy+(b===4?h:b===1?-h:0), f=(k-.5)*2; c.beginPath(); c.moveTo(cx,cy); c.lineTo(cx+(ex-cx)*f,cy+(ey-cy)*f); c.stroke();}
        /* a bright front where the water is moving */
        var fp=k<.5?{x:cx+((a===2?h:a===8?-h:0))*(1-k*2),y:cy+((a===4?h:a===1?-h:0))*(1-k*2)}:{x:cx+((b===2?h:b===8?-h:0))*(k-.5)*2,y:cy+((b===4?h:b===1?-h:0))*(k-.5)*2};
        c.fillStyle='#BFE6FA'; c.beginPath(); c.arc(fp.x,fp.y,cs*.07+Math.sin(t2*18)*cs*.015,0,Math.PI*2); c.fill();
      }
      c.save(); c.globalAlpha=.4; c.strokeStyle='#BFE6FA'; c.lineWidth=cs*.04; c.translate(-cs*.03,-cs*.03);
      [1,2,4,8].forEach(function(s){if(wetSm&s)waterSeg(c,cx,cy,h,s,1);}); c.restore();
    }
    function drawRock(c,x,y,cs){
      gmShadow(c,x+cs/2,y+cs*.8,cs*.36,cs*.08,.22);
      var g=c.createRadialGradient(x+cs*.38,y+cs*.36,cs*.05,x+cs/2,y+cs/2,cs*.42); g.addColorStop(0,'#E4DED2'); g.addColorStop(.6,'#A39C8E'); g.addColorStop(1,'#6E675C');
      c.fillStyle=g; c.strokeStyle='#5A544A'; c.lineWidth=2.5; c.beginPath();
      c.moveTo(x+cs*.16,y+cs*.7); c.quadraticCurveTo(x+cs*.1,y+cs*.36,x+cs*.36,y+cs*.22); c.quadraticCurveTo(x+cs*.6,y+cs*.12,x+cs*.78,y+cs*.3);
      c.quadraticCurveTo(x+cs*.92,y+cs*.5,x+cs*.82,y+cs*.74); c.quadraticCurveTo(x+cs*.5,y+cs*.86,x+cs*.16,y+cs*.7); c.fill(); c.stroke();
      c.fillStyle='rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(x+cs*.38,y+cs*.34,cs*.1,cs*.05,-.5,0,Math.PI*2); c.fill();
    }
    function drawTap(c,g){
      var cs=g.cs, t=g.tap, len=cs*.62, tall=g.tall;
      c.save(); c.translate(t.x,t.y); if(tall)c.rotate(Math.PI/2);
      /* a pipe coming out of the mill wall into the first square, with a wheel tap on top */
      c.lineCap='butt';
      c.strokeStyle='#7A3E1A'; c.lineWidth=cs*.38; c.beginPath(); c.moveTo(-len,0); c.lineTo(0,0); c.stroke();
      c.strokeStyle='#D4825A'; c.lineWidth=cs*.32; c.beginPath(); c.moveTo(-len,0); c.lineTo(0,0); c.stroke();
      c.strokeStyle=wait>0?'#F6EBDD':'#4FA9DE'; c.lineWidth=cs*.14; c.beginPath(); c.moveTo(-len,0); c.lineTo(0,0); c.stroke();
      c.fillStyle='#E0AE3E'; c.strokeStyle='#8A5E14'; c.lineWidth=1.5; c.fillRect(-len,-cs*.22,cs*.09,cs*.44); c.strokeRect(-len,-cs*.22,cs*.09,cs*.44); c.fillStyle='#8A5E14'; c.fillRect(-len*.5-cs*.03,-cs*.3,cs*.06,cs*.12);
      c.translate(-len*.5,-cs*.34); c.rotate(tapSpin);
      c.strokeStyle='#9C241C'; c.lineWidth=cs*.06; c.beginPath(); c.arc(0,0,cs*.15,0,Math.PI*2); c.stroke();
      c.strokeStyle='#E8574C'; c.lineWidth=cs*.035; c.beginPath(); c.arc(0,0,cs*.15,0,Math.PI*2); c.moveTo(-cs*.15,0); c.lineTo(cs*.15,0); c.moveTo(0,-cs*.15); c.lineTo(0,cs*.15); c.stroke();
      c.fillStyle='#E0AE3E'; c.beginPath(); c.arc(0,0,cs*.045,0,Math.PI*2); c.fill();
      c.restore();
      if(wait>0&&!slide){
        /* how long until the water comes */
        var txt='Water in '+Math.ceil(wait), fs=Math.max(15,Math.min(22,cs*.24)), px=tall?t.x+cs*.78:t.x-len*.5, py=tall?t.y-cs*.42:t.y-cs*.78;
        c.save(); c.font='600 '+fs+'px Fredoka, Trebuchet MS, sans-serif'; var tw=c.measureText(txt).width+fs*1.2;
        if(tall)px=Math.min(g.W-tw/2-6,px+tw/2-cs*.2); else px=Math.max(tw/2+6,Math.min(px,g.gx-14-tw/2));
        c.fillStyle='rgba(255,255,255,.94)'; gmRound(c,px-tw/2,py-fs*.8,tw,fs*1.6,fs*.8); c.fill(); c.strokeStyle='#3E7FB0'; c.lineWidth=2; c.stroke();
        c.fillStyle='#2F5E86'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(txt,px,py+1); c.restore();
      }
    }
    /* the exit pipe on the far side: water that reaches it flows on to a new board */
    function drawExit(c,g,ex,wet){
      var cs=g.cs, len=cs*.5, pulse=.5+Math.sin(t2*4)*.5;
      c.save(); c.translate(ex.x,ex.y); if(g.tall)c.rotate(Math.PI/2);
      c.save(); c.globalAlpha=.25+.25*pulse; c.fillStyle='#8EE07A'; c.beginPath(); c.ellipse(len*.5,0,len*.75,cs*.34,0,0,Math.PI*2); c.fill(); c.restore();
      c.lineCap='butt';
      c.strokeStyle='#7A3E1A'; c.lineWidth=cs*.38; c.beginPath(); c.moveTo(0,0); c.lineTo(len,0); c.stroke();
      c.strokeStyle='#D4825A'; c.lineWidth=cs*.32; c.beginPath(); c.moveTo(0,0); c.lineTo(len,0); c.stroke();
      c.strokeStyle=wet?'#4FA9DE':'#F6EBDD'; c.lineWidth=cs*.14; c.beginPath(); c.moveTo(0,0); c.lineTo(len,0); c.stroke();
      c.fillStyle='#E0AE3E'; c.strokeStyle='#8A5E14'; c.lineWidth=1.5; c.fillRect(len-cs*.09,-cs*.22,cs*.09,cs*.44); c.strokeRect(len-cs*.09,-cs*.22,cs*.09,cs*.44);
      /* a green arrow pointing out */
      c.strokeStyle='#2E8A3A'; c.lineWidth=cs*.05; c.lineCap='round'; c.lineJoin='round';
      var ax=len*.42+pulse*cs*.04; c.beginPath(); c.moveTo(ax-cs*.08,-cs*.33); c.lineTo(ax+cs*.02,-cs*.25); c.lineTo(ax-cs*.08,-cs*.17); c.stroke();
      c.restore();
    }
    function drawCells(c,g,gr,dx,dy,live){
      var cs=g.cs;
      for(var r=0;r<PR_ROWS;r++)for(var cc=0;cc<PR_COLS;cc++){
        var p=g.at(r,cc), o=gr[r][cc], sh=live?shakes[r+','+cc]:null, sx=sh!=null?Math.sin(sh*40)*4*(1-sh/.4):0, x=p.x+dx, y=p.y+dy;
        c.fillStyle=(r+cc)%2?'#F3DFBC':'#F7E7C8'; gmRound(c,x+2,y+2,cs-4,cs-4,cs*.12); c.fill();
        if(o.rock){drawRock(c,x+sx,y,cs);continue;}
        if(o.m){var part=live&&water&&water.r===r&&water.c===cc?{p:water.p,from:g.sm(water.from),to:g.sm(water.to)}:null;
          drawPipe(c,x+sx,y,cs,o.m,g.sm(o.m),g.sm(o.wet),part);}
      }
    }
    function drawQueue(c,g){
      var cs=g.cs, tall=g.tall;
      c.save(); c.fillStyle='rgba(255,255,255,.78)'; gmRound(c,g.qx,g.qy,g.qw,g.qh,cs*.2); c.fill(); c.restore();
      var big=cs*.92, small=cs*.66, pos=[];
      if(!tall){var y=g.qy+cs*.42; pos.push({x:g.qx+(g.qw-big)/2,y:y,s:big}); y+=big+cs*.14; for(var k=1;k<queue.length;k++){pos.push({x:g.qx+(g.qw-small)/2,y:y,s:small});y+=small+cs*.1;}}
      else {var x=g.qx+cs*.18; pos.push({x:x,y:g.qy+(g.qh-big)/2+cs*.1,s:big}); x+=big+cs*.16; for(var k2=1;k2<queue.length;k2++){pos.push({x:x,y:g.qy+(g.qh-small)/2+cs*.1,s:small});x+=small+cs*.1;}}
      gmText(c,'Next',pos[0].x+big/2,pos[0].y-cs*.2,Math.max(13,Math.min(20,cs*.22)),'#8A4A22');
      queue.forEach(function(m,k){var p=pos[k]; if(!p)return;
        c.save(); c.fillStyle=k?'#FBF2E2':'#FFF8EC'; c.strokeStyle=k?'#D9BC8C':'#B8467A'; c.lineWidth=k?2:3.5; gmRound(c,p.x,p.y,p.s,p.s,p.s*.16); c.fill(); c.stroke(); c.restore();
        drawPipe(c,p.x,p.y,p.s,m,g.sm(m),0,null);});
      /* Rivet keeps an eye on the water beside the queue */
      if(gmReady(rv)){
        var rw=Math.min(cs*1.05,90), rh=rw*4/3, rx, ry, bob=Math.sin(t2*2.4)*3, jump=rvJump>=0?Math.abs(Math.sin(rvJump*12))*12*(1-Math.min(1,rvJump/1.2)):0;
        if(!tall){rx=g.qx+(g.qw-rw)/2; ry=g.qy+g.qh-rh-cs*.08;} else {rx=g.qx+g.qw-rw-cs*.06; ry=g.qy+(g.qh-rh)/2;}
        var spaceOK=!tall?(ry>pos[pos.length-1].y+small+4):(rx>pos[pos.length-1].x+small+4);
        if(spaceOK)c.drawImage(rv,rx,ry+bob-jump,rw,rh);
      }
    }
    return {
      peek:function(){return {grid:grid,queue:queue,water:water,wait:wait,dead:dead,lay:lay(),entryR:entryR,exitR:exitR,board:board,slide:slide,setWait:function(v){wait=v;}};},   /* for testing */
      input:function(n,down){
        if(!down)return; kb=true;
        var g=lay(), dr=0, dc=0;
        /* arrow keys move the frame the way they point on screen */
        if(n==='left'){if(g.tall)dr=-1;else dc=-1;} if(n==='right'){if(g.tall)dr=1;else dc=1;}
        if(n==='up'){if(g.tall)dc=-1;else dr=-1;} if(n==='down'){if(g.tall)dc=1;else dr=1;}
        cur.r=Math.max(0,Math.min(PR_ROWS-1,cur.r+dr)); cur.c=Math.max(0,Math.min(PR_COLS-1,cur.c+dc));
        if(n==='lay')lay1(cur.r,cur.c);
      },
      pointer:function(t,x,y){
        if(t!=='down')return;
        var g=lay(), cell=g.cell(x,y);
        if(cell){kb=false;cur=cell;lay1(cell.r,cell.c);return;}
        var tp=g.tap, tx=g.tall?tp.x:tp.x-g.cs*.35, ty=g.tall?tp.y-g.cs*.35:tp.y-g.cs*.15;
        if(Math.hypot(x-tx,y-ty)<g.cs*.6)openTap();
      },
      update:function(dt){
        t2+=dt; var g=lay();
        for(var key in shakes){shakes[key]+=dt;if(shakes[key]>.4)delete shakes[key];}
        for(var p=poofs.length-1;p>=0;p--){poofs[p].t+=dt;if(poofs[p].t>.35)poofs.splice(p,1);}
        for(var d=drops.length-1;d>=0;d--){var o=drops[d];o.t+=dt;o.x+=o.vx*dt;o.y+=o.vy*dt;o.vy+=520*dt;if(o.t>1.4)drops.splice(d,1);}
        if(spill)spill.t+=dt; if(rvJump>=0)rvJump+=dt;
        if(dead)return;
        if(slide){slide.t+=dt;if(slide.t>=PR_SET.slide+.6)slide=null;else return;}
        if(outFlow>0){outFlow+=dt;if(outFlow>.5){nextBoard();return;}}
        if(wait>0){wait-=dt;if(wait<=0){wait=0;}}
        if(wait<=0&&!water&&!outFlow){tapSpin+=dt*6;enter(entryR,0,PR_W);if(mem.sound&&water)tone(523,0,.15,'sine',.07);return;}
        if(water){
          tapSpin+=dt*3;
          water.p+=dt/flowTime();
          if(water.p>=1){
            var o2=grid[water.r][water.c]; o2.wet|=water.from|water.to; filled++; K.score(filled);
            if(mem.sound)tone(pick([523.25,587.33,659.25,783.99]),0,.12,'sine',.06);
            var st=PR_STEP[water.to], nr=water.r+st[0], nc=water.c+st[1], from=PR_OPP[water.to];
            if(water.to===PR_E&&water.r===exitR&&nc===PR_COLS){water=null;outFlow=.001;}   /* out through the exit pipe */
            else if(nr<0||nr>=PR_ROWS||nc<0||nc>=PR_COLS){var pt=edgePt(g,water.r,water.c,water.to);doSpill(g,pt);}
            else enter(nr,nc,from);
          }
        }
      },
      draw:function(c){
        var g=lay(), W=g.W, H=g.H, cs=g.cs;
        if(!gmCover(c,bg,W,H)){c.fillStyle='#FFF1DC';c.fillRect(0,0,W,H);}
        c.fillStyle='rgba(255,255,255,.35)'; c.fillRect(0,0,W,H);
        /* the wooden board */
        var bw=(g.tall?PR_ROWS:PR_COLS)*cs, bh=(g.tall?PR_COLS:PR_ROWS)*cs;
        c.save(); c.shadowColor='rgba(59,42,74,.25)'; c.shadowOffsetY=5; c.shadowBlur=8; c.fillStyle='#C99A62';
        gmRound(c,g.gx-8,g.gy-8,bw+16,bh+16,cs*.18); c.fill(); c.restore();
        c.strokeStyle='#8A5A30'; c.lineWidth=3; gmRound(c,g.gx-8,g.gy-8,bw+16,bh+16,cs*.18); c.stroke();
        /* the squares: while the boards change, the old one slides away and the new one slides in after it */
        if(slide){
          var k=Math.min(1,slide.t/PR_SET.slide), e2=k*k*(3-2*k), along=g.tall?g.bh:g.bw, ox=g.tall?0:-e2*along, oy=g.tall?-e2*along:0, nx=g.tall?0:(1-e2)*along, ny=g.tall?(1-e2)*along:0;
          c.save(); c.beginPath(); c.rect(g.gx-2,g.gy-2,g.bw+4,g.bh+4); c.clip();
          drawCells(c,g,slide.old,ox,oy,false); drawCells(c,g,grid,nx,ny,true); c.restore();
        } else drawCells(c,g,grid,0,0,true);
        /* the first square: a little arrow until a pipe is laid there */
        if(!slide&&!grid[entryR][0].m){var e=g.at(entryR,0);c.save();c.globalAlpha=.5+Math.sin(t2*4)*.25;c.strokeStyle='#3E7FB0';c.lineWidth=cs*.06;c.lineCap='round';c.lineJoin='round';
          c.translate(e.x+cs/2,e.y+cs/2); if(g.tall)c.rotate(Math.PI/2); c.beginPath(); c.moveTo(-cs*.3,0); c.lineTo(cs*.22,0); c.moveTo(cs*.06,-cs*.16); c.lineTo(cs*.24,0); c.lineTo(cs*.06,cs*.16); c.stroke(); c.restore();}
        poofs.forEach(function(o){var p=g.at(o.r,o.c),k=o.t/.35;c.save();c.globalAlpha=1-k;c.translate(p.x+cs/2,p.y+cs/2);c.scale(1+k*.4,1+k*.4);c.translate(-cs/2,-cs/2);drawPipe(c,0,0,cs,o.m,g.sm(o.m),0,null);c.restore();});
        if(kb&&!dead){var q=g.at(cur.r,cur.c);c.save();c.strokeStyle='#B8467A';c.lineWidth=4;c.setLineDash([10,6]);c.lineDashOffset=-t2*20;gmRound(c,q.x+3,q.y+3,cs-6,cs-6,cs*.12);c.stroke();c.restore();}
        drawTap(c,g);
        if(!slide)drawExit(c,g,g.exit,outFlow>0);
        drawQueue(c,g);
        /* which board this is, and a banner as a new one arrives */
        if(board>1&&!slide){var bfs=Math.max(14,Math.min(20,cs*.2));if(!g.tall&&g.gy>bfs*1.6)gmText(c,'Board '+board,g.gx+g.bw/2,g.gy-bfs*1.05,bfs,'#8A4A22');}
        if(slide){var a2=Math.min(1,slide.t/.25,(PR_SET.slide+.6-slide.t)/.3);gmText(c,'Board '+board+'!',W/2,g.gy+g.bh/2,Math.max(34,Math.min(60,cs*.6)),'#2E8A3A',Math.max(0,a2));}
        if(spill){var k=Math.min(1,spill.t/.5);c.save();c.globalAlpha=Math.max(0,1-spill.t/1.6);c.fillStyle='#7DC4EC';c.beginPath();c.ellipse(spill.x,spill.y+cs*.1,cs*(.2+.45*k),cs*(.1+.2*k),0,0,Math.PI*2);c.fill();c.restore();}
        drops.forEach(function(o){c.save();c.globalAlpha=Math.max(0,1-o.t/1.4);c.fillStyle='#4FA9DE';c.beginPath();c.arc(o.x,o.y,o.s,0,Math.PI*2);c.fill();c.fillStyle='#BFE6FA';c.beginPath();c.arc(o.x-o.s*.3,o.y-o.s*.3,o.s*.35,0,Math.PI*2);c.fill();c.restore();});
      }
    };
  }
};
