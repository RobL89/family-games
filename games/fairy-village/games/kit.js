/* ================================================================
   FAIRY GAMES - the shared helper every mini-game uses (phase 9)
   ----------------------------------------------------------------
   A fairy's game is played with petals from her own petal pot (core.js: potOf). One petal buys one go.
   This file runs the game screen (#s-game): the start card, "Ready... Go!", the game loop, pause,
   keys, touch, mouse and the big buttons under the play area, speeding up by level, the end card,
   best scores and the "New best!" moment.

   A game file (games/<name>.js) adds GAMES[fairy id] = {
     name      'Flower catch'
     intro     function(L): what to do, said aloud on the start card
     how       [{art:'<svg inner, 0 0 64 64 box>', text:'Move'}, ...] small pictures on the start card
     lives     how many goes before it ends (shown as petals that wilt), or 0
     pad       optional big buttons under the play area: [{id:'left', label:'Left', icon:'<svg>'}]
     keys      {'ArrowLeft':'left', ...} keyboard keys and the input name each one sends
     hud       function(score): what the score box shows
     unit      function(n): '23 flowers'      said  function(n): 'You caught 23 flowers.'
     timed     true when the score is time (stored as whole seconds)
     make      function(K): returns {update(dt), draw(c), input(name,down), pointer(type,x,y)}
   }
   K gives the game: K.L (level 1-3), K.W and K.H (play area size: 600 tall, or 360 wide on a tall phone),
   K.t (seconds played), K.rate(spec) (a speed that grows with time, by level), K.score(n), K.lose()
   (one life gone; returns lives left), K.end() (game over after a short pause), K.sfx(name), K.img(...)
   and K.sprite(...) (art drawn from SVG), K.F (the fairy) and helpers for soft 3D shapes.
   Names in this file start with gm or GM so they don't clash with other files.
   ================================================================ */
var GM={w:null,G:null,g:null,K:null,state:'off',raf:0,last:0,dpr:1,lives:0,maxLives:0,score:0,endT:0,readyT:0,cw:0,ch:0,scale:1};
var GM_IMG={};
IC.pause='<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><rect x="6" y="5" width="4.2" height="14" rx="1.6" fill="currentColor"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.6" fill="currentColor"/></svg>';
$('#gm-pause').innerHTML=IC.pause;

/* a life petal in the top bar: fresh and pink, or wilted and brown */
function gmLifeSVG(ok){
  var leaf='M13 31 C3 22 4 7 13 2 C22 7 23 22 13 31 Z';
  return ok ? '<svg viewBox="0 0 26 34" aria-hidden="true"><path d="'+leaf+'" fill="url(#ptfront)" stroke="#B8467A" stroke-width="1.8"/><path d="M13 27 V9" stroke="#B8467A" stroke-width="1.2" opacity=".45"/><ellipse cx="9.5" cy="11" rx="2.2" ry="4.5" fill="#fff" opacity=".5"/></svg>'
    : '<svg viewBox="0 0 26 34" aria-hidden="true"><g transform="rotate(62 13 31) translate(0 3) scale(.92)"><path d="'+leaf+'" fill="#CDB896" stroke="#8C7556" stroke-width="1.8"/><path d="M13 27 C12 20 14 14 12 8" stroke="#8C7556" stroke-width="1.2" fill="none" opacity=".6"/></g></svg>';
}
function gmHud(){
  var L=$('#gm-lives'), s='';
  for(var i=0;i<GM.maxLives;i++) s+=gmLifeSVG(i<GM.lives);
  L.innerHTML=s; L.setAttribute('aria-label',GM.maxLives?GM.lives+' of '+GM.maxLives+' petals left':'');
  if(GM.maxLives) L.setAttribute('role','img'); else L.removeAttribute('role');
  $('#gm-score').textContent=GM.G.hud(GM.score);
}

/* art drawn from SVG into the canvas: made once, at twice the size it's drawn so it stays sharp */
function gmImg(key,inner,vb,w,h){
  var im=GM_IMG[key]; if(im)return im;
  im=new Image();
  var svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+Math.round(w*2)+'" height="'+Math.round(h*2)+'" viewBox="'+vb+'">'+allDefs()+inner+'</svg>';
  im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  GM_IMG[key]=im; return im;
}
function gmReady(im){return im&&im.complete&&im.naturalWidth>0;}

/* the play area fills the space under the bar; game units: 600 tall (or 360 wide on a tall, narrow screen) */
function gmFit(){
  var cv=$('#gm-canvas'), r=cv.getBoundingClientRect(), w=Math.max(1,r.width), h=Math.max(1,r.height), a=w/h, W, H;
  if(a>=.6){H=600;W=600*a;if(W>1100){W=1100;H=W/a;}} else {W=360;H=W/a;}
  GM.dpr=Math.min(2,window.devicePixelRatio||1); GM.cw=w; GM.ch=h; GM.scale=w/W;
  cv.width=Math.round(w*GM.dpr); cv.height=Math.round(h*GM.dpr);
  if(GM.K){GM.K.W=W;GM.K.H=H;}
  return {W:W,H:H};
}

function gmSfx(name){
  if(!mem.sound)return;
  if(name==='catch'){tone(784,0,.12,'sine',.13);tone(1175,.07,.18,'sine',.11);}
  else if(name==='miss'){tone(330,0,.25,'triangle',.08);tone(262,.12,.35,'triangle',.07);}
  else if(name==='crash'){noiseHit(0,'lowpass',900,.5,.5);thump(0,true);}
  else if(name==='splash'){noiseHit(0,'bandpass',1800,.25,.25);}
  else if(name==='jump'){var c=ctx();if(!c)return;var t=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(420,t);o.frequency.exponentialRampToValueAtTime(880,t+.18);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.12,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.25);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+.3);}
  else if(name==='duck'){tone(330,0,.14,'triangle',.1);tone(262,.06,.16,'triangle',.08);}
  else if(name==='step'){tone(660,0,.06,'sine',.05);}
  else if(name==='ready'){tone(523.25,0,.2,'sine',.1);}
  else if(name==='go'){tone(784,0,.25,'sine',.13);tone(1046.5,.1,.35,'sine',.12);}
}

function gmMakeK(){
  var ex=cur(), sz=gmFit();
  var K={L:ex.level||1,W:sz.W,H:sz.H,t:0,F:FAIRIES[GM.w],
    /* a speed or rate that starts gently and grows over time: spec={start:[L1,L2,L3], grow:[...], max:[...]} */
    rate:function(sp){var i=K.L-1;return Math.min(sp.max[i],sp.start[i]*(1+sp.grow[i]*K.t));},
    score:function(n){GM.score=n;gmHud();},
    lose:function(){if(GM.lives>0)GM.lives--;gmHud();return GM.lives;},
    end:function(){if(GM.state==='play'){GM.state='ending';GM.endT=1.1;}},
    sfx:gmSfx,
    img:gmImg,
    sprite:function(im,x,y,w,h){if(gmReady(im))GM.g.drawImage(im,x,y,w,h);},
    playing:function(){return GM.state==='play';}
  };
  return K;
}

function gmLoop(ts){
  if(GM.state==='off')return;
  var dt=GM.last?Math.min(.05,(ts-GM.last)/1000):0; GM.last=ts;
  var c=GM.g, s=GM.dpr*GM.scale;
  if(GM.state==='play'||GM.state==='ending'){
    if(GM.state==='play')GM.K.t+=dt;
    GM.run.update(dt);
    if(GM.state==='ending'){GM.endT-=dt;if(GM.endT<=0){gmOver();}}
  } else if(GM.state==='ready'){
    GM.readyT-=dt;
    if(GM.readyT<=.55&&!GM.saidGo){GM.saidGo=true;gmSfx('go');}
    if(GM.readyT<=0){GM.state='play';}
  }
  c.setTransform(s,0,0,s,0,0);
  c.clearRect(0,0,GM.K.W,GM.K.H);
  GM.run.draw(c);
  if(GM.state==='ready'){
    var word=GM.readyT>.55?'Ready…':'Go!';
    c.save(); c.font='600 64px Fredoka, Trebuchet MS, sans-serif'; c.textAlign='center'; c.textBaseline='middle';
    c.lineJoin='round'; c.lineWidth=12; c.strokeStyle='#fff'; c.fillStyle='#B8467A';
    c.strokeText(word,GM.K.W/2,GM.K.H*.42); c.fillText(word,GM.K.W/2,GM.K.H*.42); c.restore();
  }
  GM.raf=requestAnimationFrame(gmLoop);
}
function gmStopLoop(){cancelAnimationFrame(GM.raf);GM.raf=0;}

/* opened from the house menu: the game screen with its start card */
function playGame(w){
  var ex=cur(), G=GAMES[w], F=FAIRIES[w]; if(!ex||!G)return;
  GM.w=w; GM.G=G; GM.state='intro';
  $('#gm-title').textContent=G.name;
  var pad=$('#gm-pad'); pad.innerHTML=''; pad.hidden=!G.pad;
  (G.pad||[]).forEach(function(b){
    var el=document.createElement('button'); el.type='button'; el.innerHTML=b.icon+'<span></span>'; el.querySelector('span').textContent=b.label; el.setAttribute('aria-label',b.label);
    function down(e){e.preventDefault();el.classList.add('on');if(GM.state==='play')GM.run.input(b.id,true);}
    function up(){if(!el.classList.contains('on'))return;el.classList.remove('on');if(GM.run)GM.run.input(b.id,false);}
    el.addEventListener('pointerdown',down); el.addEventListener('pointerup',up); el.addEventListener('pointercancel',up); el.addEventListener('pointerleave',up);
    el.addEventListener('click',function(e){if(e.detail===0&&GM.state==='play'){GM.run.input(b.id,true);setTimeout(function(){GM.run.input(b.id,false);},120);}});
    el.addEventListener('contextmenu',function(e){e.preventDefault();});
    pad.appendChild(el);
  });
  show('s-game');
  GM.g=$('#gm-canvas').getContext('2d');
  gmNewRun();
  gmStopLoop(); GM.last=0; GM.raf=requestAnimationFrame(gmLoop);
  gmIntro();
}
function gmNewRun(){
  GM.K=gmMakeK(); GM.score=0; GM.maxLives=GM.G.lives||0; GM.lives=GM.maxLives;
  GM.run=GM.G.make(GM.K); gmHud();
  $('#gm-canvas').setAttribute('aria-label',GM.G.name+'. '+GM.G.intro(GM.K.L));
}
function gmPotLine(n){return '<div class="potline"><svg viewBox="0 0 64 64" aria-hidden="true">'+potArt(n,true)+'</svg><span>'+esc(petalWord(n)+' in '+FAIRIES[GM.w].name+"'s pot")+'</span></div>';}
function gmIntro(){
  var ex=cur(), G=GM.G, F=FAIRIES[GM.w], n=potOf(ex,GM.w), best=bestOf(ex,GM.w), say=G.intro(ex.level);
  var how='<ul class="gm-how">'+G.how.map(function(h){return '<li><svg viewBox="0 0 64 64" aria-hidden="true">'+h.art+'</svg>'+esc(h.text)+'</li>';}).join('')+'</ul>';
  ovClose=null;
  openOv('<svg class="art" viewBox="0 0 240 320" aria-hidden="true">'+F.art()+'</svg><h3 id="ov-h"></h3><p></p>'+how+(best?'<p class="gm-best"></p>':'')+gmPotLine(n)+
    '<div class="ov-actions"><button class="btn twoline" id="gm-go"><span>Start</span><small>uses 1 petal</small></button><button class="btn soft" id="gm-leave">Back to the village</button></div>',function(c){
    c.querySelector('h3').textContent=G.name; c.querySelector('p').textContent=say;
    if(best)c.querySelector('.gm-best').textContent='Your best: '+G.unit(best);
    c.querySelector('#gm-go').addEventListener('click',gmStart);
    c.querySelector('#gm-leave').addEventListener('click',gmLeave);
  });
  speak(G.name+'. '+say);
}
/* Start and Play again: one petal from her pot, then Ready... Go! */
function gmStart(){
  var ex=cur(); if(potOf(ex,GM.w)<1){gmIntro();return;}
  ex.pots[GM.w]=potOf(ex,GM.w)-1; save();
  closeOv(); stopTalk();
  gmNewRun();
  GM.state='ready'; GM.readyT=1.3; GM.saidGo=false; gmSfx('ready');
  if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
}
function gmLeave(){closeOv();GM.state='off';gmStopLoop();GM.run=null;enterVillage();}
function gmPause(){
  if(GM.state!=='play'&&GM.state!=='ready')return;
  GM.paused=GM.state; GM.state='paused';
  $('#gm-pad').querySelectorAll('.on').forEach(function(b){b.classList.remove('on');});
  ovClose=gmResume;
  openOv('<svg class="art" viewBox="0 0 240 320" aria-hidden="true">'+FAIRIES[GM.w].art()+'</svg><h3 id="ov-h">Paused</h3><p>Have a rest! The game waits for you.</p><div class="ov-actions"><button class="btn" id="gm-on">Keep playing</button><button class="btn soft" id="gm-stop">Stop the game</button></div>',function(c){
    c.querySelector('#gm-on').addEventListener('click',gmResume);
    c.querySelector('#gm-stop').addEventListener('click',function(){closeOv();gmOver();});
  });
}
function gmResume(){if(GM.state!=='paused')return;closeOv();GM.state=GM.paused==='ready'?'ready':'play';GM.last=0;if(GM.state==='ready'){GM.readyT=1.3;GM.saidGo=false;}}
/* the end card: the score, a best score for this explorer and fairy, and what next */
function gmOver(){
  if(GM.state==='over'||GM.state==='off')return;
  GM.state='over';
  var ex=cur(), G=GM.G, F=FAIRIES[GM.w], w=GM.w;
  var sc=G.timed?Math.floor(GM.score):GM.score, old=bestOf(ex,w), isBest=sc>old;
  if(isBest){if(!ex.best)ex.best={};ex.best[w]=sc;save();}
  var n=potOf(ex,w);
  var head=isBest?'New best!':pick(['Well played!','Great game!','Lovely playing!','Nice one!']);
  var body=G.said(sc)+' '+(isBest?(old>0?'Your old best was '+G.unit(old)+'.':'That is your first best score!'):(old>0?'Your best is '+G.unit(old)+'.':''));
  var art='<svg class="art" viewBox="0 0 240 320" aria-hidden="true">'+F.art()+(isBest?'<g class="sparkle"><path d="'+STAR+'" transform="translate(196 52) scale(1.8) translate(-182 -146)" fill="url(#ggold)" stroke="#B8861E" stroke-width="1.2"/><circle cx="30" cy="70" r="7" fill="#F5C842"/><circle cx="214" cy="240" r="6" fill="#F5C842"/><circle cx="36" cy="250" r="5" fill="#F5C842"/></g>':'')+'</svg>';
  var again = n>0 ? '<button class="btn twoline" id="gm-again"><span>Play again</span><small>uses 1 petal</small></button>' : '<button class="btn leaf" id="gm-puz">Play '+esc(F.name)+"'s puzzles</button>";
  ovClose=null;
  openOv(art+'<h3 id="ov-h"></h3><p></p>'+gmPotLine(n)+'<div class="ov-actions">'+again+'<button class="btn soft" id="gm-leave">Back to the village</button></div>',function(c){
    c.querySelector('h3').textContent=head; c.querySelector('p').textContent=body+(n>0?'':' '+F.name+"'s pot is empty. Turn five petals pink in her puzzles to fill it.");
    var a=c.querySelector('#gm-again'); if(a)a.addEventListener('click',gmStart);
    var pz=c.querySelector('#gm-puz'); if(pz)pz.addEventListener('click',function(){closeOv();GM.state='off';gmStopLoop();GM.run=null;openGarden(w);});
    c.querySelector('#gm-leave').addEventListener('click',gmLeave);
  });
  if(isBest)fanfare(); else chime();
  speak(head+' '+body);
}

/* controls */
$('#gm-pause').addEventListener('click',gmPause);
function gmKeyName(e){var G=GM.G;if(!G||!G.keys)return null;return G.keys[e.key]||G.keys[e.code]||null;}
document.addEventListener('keydown',function(e){
  if($('#s-game').hidden||!$('#ov').hidden)return;
  if(e.key==='Escape'||e.key==='p'||e.key==='P'){e.preventDefault();gmPause();return;}
  var n=gmKeyName(e); if(!n)return;
  e.preventDefault(); if(e.repeat)return;
  if(GM.state==='play')GM.run.input(n,true);
});
document.addEventListener('keyup',function(e){if($('#s-game').hidden)return;var n=gmKeyName(e);if(n&&GM.run)GM.run.input(n,false);});
(function(){
  var cv=$('#gm-canvas');
  function at(e){var r=cv.getBoundingClientRect();return [(e.clientX-r.left)/GM.scale,(e.clientY-r.top)/GM.scale];}
  ['pointerdown','pointermove','pointerup','pointercancel'].forEach(function(t){
    cv.addEventListener(t,function(e){
      if(!GM.run||GM.state!=='play')return;
      if(t==='pointerdown'){try{cv.setPointerCapture(e.pointerId);}catch(x){} e.preventDefault();}
      var p=at(e); if(GM.run.pointer)GM.run.pointer(t==='pointerdown'?'down':t==='pointermove'?'move':'up',p[0],p[1],e.pointerType);
    });
  });
  cv.addEventListener('contextmenu',function(e){e.preventDefault();});
})();
document.addEventListener('visibilitychange',function(){if(document.hidden&&!$('#s-game').hidden)gmPause();});
window.addEventListener('resize',function(){if(!$('#s-game').hidden&&GM.K)gmFit();});

/* ---- drawing helpers for games: soft, rounded, lit from the top left ---- */
function gmShadow(c,x,y,rx,ry,a){c.save();c.globalAlpha=a==null?.22:a;c.fillStyle='#2F3A4A';c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();c.restore();}
function gmBall(c,x,y,r,light,mid,dark){var g=c.createRadialGradient(x-r*.35,y-r*.4,r*.1,x,y,r);g.addColorStop(0,light);g.addColorStop(.55,mid);g.addColorStop(1,dark);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
function gmRound(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function gmText(c,t,x,y,size,fill,a){c.save();c.globalAlpha=a==null?1:a;c.font='600 '+size+'px Fredoka, Trebuchet MS, sans-serif';c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=size/4;c.strokeStyle='#fff';c.strokeText(t,x,y);c.fillStyle=fill||'#B8467A';c.fillText(t,x,y);c.restore();}
/* a scene picture (a fairy's world, as a data URL) drawn to cover the play area, lined up at the bottom */
function gmCover(c,im,W,H){if(!gmReady(im))return false;var iw=im.naturalWidth,ih=im.naturalHeight,k=Math.max(W/iw,H/ih);c.drawImage(im,(W-iw*k)/2,H-ih*k,iw*k,ih*k);return true;}
/* a fairy's world picture as an image of a known size (her scene is an SVG data URL with a viewBox only) */
function gmScene(w){
  var key='scene-'+w; if(GM_IMG[key])return GM_IMG[key];
  var url=sceneFor(w), i=url.indexOf(','), svg=decodeURIComponent(url.slice(i+1));
  var vb=(svg.match(/viewBox="([^"]+)"/)||[0,'0 0 1200 900'])[1].split(/\s+/);
  svg=svg.replace('<svg ','<svg width="'+vb[2]+'" height="'+vb[3]+'" ');
  var im=new Image(); im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  GM_IMG[key]=im; return im;
}
