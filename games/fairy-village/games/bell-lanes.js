/* ================================================================
   BELL LANES - Jingle's game (phase 10; songs added in phase 11)
   Notes slide down the lanes towards a row of bluebell bells. Tap a lane (or press its number,
   or A S D F G) as its note reaches the bell, and the bell rings, so a good run plays the song.
   3 lanes for Little Sprite, 4 for Clever Pixie, 5 for Nimble Nymph.
   The notes play well-known old songs and nursery rhymes (all out of copyright), one after another,
   with the song's name shown as it starts. Like a guitar game, a song's many notes are squeezed onto
   the few lanes: higher notes go to lanes further right, and a note higher than the one before is
   always to its right (lower: to its left; the same note: the same lane). Each hit rings the song's
   real note, so the tune is recognisable. Quick notes are left out for Little Sprite (and for
   Clever Pixie at first), so the songs are a little simpler there.
   The tune speeds up over time. Tapping when no note is there just rings softly (no penalty).
   A tap a little early counts more generously than a tap a little late.
   A note that slides past its bell is missed; three missed notes end the game.
   Score: notes hit. The bells ring even when Sounds is off, as in Jingle's music puzzles.
   Names in this file start with bn or BN so they don't clash with other files.
   ================================================================ */
var BN_SET={
  lanes:[3,4,5],
  fall:{start:[150,180,215],grow:[.010,.013,.016],max:[260,310,360]},  /* how fast notes slide down, game units a second */
  beat:{start:[1.05,.85,.72],grow:[.012,.015,.018],min:[.6,.48,.4]},   /* seconds between notes */
  halvesFrom:[999,25,15],                                               /* seconds before quick half-beat notes are kept in songs */
  win:[.24,.2,.17],                                                     /* seconds late that still count as a hit */
  early:1.3                                                             /* a tap this many times further ahead still counts, as early taps are easy to make */
};
/* the songs: note (letter, # for sharp, octave) and length in beats (1 if left out); r = a rest.
   All traditional or long out of copyright. Lengths only space the notes out; each hit rings its note. */
var BN_SONGS=[
  {name:'Twinkle, Twinkle, Little Star',m:'C5 C5 G5 G5 A5 A5 G5:2 F5 F5 E5 E5 D5 D5 C5:2 G5 G5 F5 F5 E5 E5 D5:2 G5 G5 F5 F5 E5 E5 D5:2 C5 C5 G5 G5 A5 A5 G5:2 F5 F5 E5 E5 D5 D5 C5:2'},
  {name:'Mary Had a Little Lamb',m:'E5:1.5 D5:.5 C5 D5 E5 E5 E5:2 D5 D5 D5:2 E5 G5 G5:2 E5:1.5 D5:.5 C5 D5 E5 E5 E5 E5 D5 D5 E5 D5 C5:3'},
  {name:'Old MacDonald Had a Farm',m:'C5 C5 C5 G4 A4 A4 G4:2 E5 E5 D5 D5 C5:3 G4 C5 C5 C5 G4 A4 A4 G4:2 E5 E5 D5 D5 C5:3'},
  {name:'Frère Jacques',m:'C5 D5 E5 C5 C5 D5 E5 C5 E5 F5 G5:2 E5 F5 G5:2 G5:.5 A5:.5 G5:.5 F5:.5 E5 C5 G5:.5 A5:.5 G5:.5 F5:.5 E5 C5 C5 G4 C5:2 C5 G4 C5:2'},
  {name:'London Bridge Is Falling Down',m:'G5:1.5 A5:.5 G5 F5 E5 F5 G5:2 D5 E5 F5:2 E5 F5 G5:2 G5:1.5 A5:.5 G5 F5 E5 F5 G5:2 D5:2 G5:2 E5 C5:2'},
  {name:'Row, Row, Row Your Boat',m:'C5:1.5 C5:1.5 C5 D5:.5 E5:1.5 E5 D5:.5 E5 F5:.5 G5:3 C6:.5 C6:.5 C6:.5 G5:.5 G5:.5 G5:.5 E5:.5 E5:.5 E5:.5 C5:.5 C5:.5 C5:.5 G5 F5:.5 E5 D5:.5 C5:3'},
  {name:'Jingle Bells',m:'E5 E5 E5:2 E5 E5 E5:2 E5 G5 C5:1.5 D5:.5 E5:4 F5 F5 F5:1.5 F5:.5 F5 E5 E5 E5:.5 E5:.5 E5 D5 D5 E5 D5:2 G5:2 E5 E5 E5:2 E5 E5 E5:2 E5 G5 C5:1.5 D5:.5 E5:4 F5 F5 F5:1.5 F5:.5 F5 E5 E5 E5:.5 E5:.5 G5 G5 F5 D5 C5:3'},
  {name:'Happy Birthday',m:'G4:.5 G4:.5 A4 G4 C5 B4:2 G4:.5 G4:.5 A4 G4 D5 C5:2 G4:.5 G4:.5 G5 E5 C5 B4 A4:2 F5:.5 F5:.5 E5 C5 D5 C5:3'},
  {name:'Hot Cross Buns',m:'E5 D5 C5:2 E5 D5 C5:2 C5:.5 C5:.5 C5:.5 C5:.5 D5:.5 D5:.5 D5:.5 D5:.5 E5 D5 C5:3'},
  {name:'Three Blind Mice',m:'E5 D5 C5:2 E5 D5 C5:2 G5 F5:.5 F5:.5 E5:2 G5 F5:.5 F5:.5 E5:3'},
  {name:'Ode to Joy',m:'E5 E5 F5 G5 G5 F5 E5 D5 C5 C5 D5 E5 E5:1.5 D5:.5 D5:2 E5 E5 F5 G5 G5 F5 E5 D5 C5 C5 D5 E5 D5:1.5 C5:.5 C5:3'},
  {name:'We Wish You a Merry Christmas',m:'G4 C5 C5:.5 D5:.5 C5:.5 B4:.5 A4 A4 A4 D5 D5:.5 E5:.5 D5:.5 C5:.5 B4 G4 G4 E5 E5:.5 F5:.5 E5:.5 D5:.5 C5 A4 G4:.5 G4:.5 A4 D5 B4 C5:3'}
];
var BN_SEMI={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
/* a song as notes: [{p: beat it starts on, f: frequency, s: semitone number}], plus its length in beats */
function bnParse(m){
  var out=[], p=0;
  m.trim().split(/\s+/).forEach(function(tok){
    var parts=tok.split(':'), len=parts[1]?parseFloat(parts[1]):1, nm=parts[0];
    if(nm!=='r'){
      var semi=BN_SEMI[nm[0]]+(nm[1]==='#'?1:0)+12*(parseInt(nm[nm.length-1],10)+1);   /* MIDI number */
      out.push({p:p,s:semi,f:440*Math.pow(2,(semi-69)/12)});
    }
    p+=len;
  });
  return {notes:out,len:p};
}
/* squeeze a song's notes onto n lanes, a phrase at a time: each note is placed by how high it is among the notes
   near it (four either side), so a tune that climbs or falls uses all the lanes; then every step up moves right,
   every step down moves left, and a repeated note stays in its lane */
function bnLanes(notes,n){
  var prev=null;
  notes.forEach(function(o,j){
    var dist=[];
    for(var q=Math.max(0,j-4);q<=Math.min(notes.length-1,j+4);q++)if(dist.indexOf(notes[q].s)<0)dist.push(notes[q].s);
    dist.sort(function(a,b){return a-b;});
    var r=dist.indexOf(o.s), lane=dist.length>1?Math.round(r*(n-1)/(dist.length-1)):Math.floor(n/2);
    if(prev){
      if(o.s===prev.s)lane=prev.lane;
      else if(o.s>prev.s&&lane<=prev.lane)lane=Math.min(n-1,prev.lane+1);
      else if(o.s<prev.s&&lane>=prev.lane)lane=Math.max(0,prev.lane-1);
    }
    o.lane=lane; prev=o;
  });
  return notes;
}
/* leave out notes that come too soon after the one kept before them (for simpler songs) */
function bnThin(notes,gap){var out=[],last=-99;notes.forEach(function(o){if(o.p-last>=gap-1e-6){out.push(o);last=o.p;}});return out;}
var BN_LANENOTES={3:[0,2,3],4:[0,1,2,3],5:[0,1,2,3,4]};   /* which of Jingle's BELL_NOTES each lane plays */
function bnBellSVG(b){
  return '<path d="M-40 100 C-40 50 -30 18 0 14 C30 18 40 50 40 100 L50 112 L32 106 L20 116 L8 106 L0 118 L-8 106 L-20 116 L-32 106 L-50 112 Z" fill="'+b.c+'" stroke="'+b.s+'" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M-24 40 C-28 56 -28 74 -26 90" stroke="#fff" stroke-width="6" opacity=".45" fill="none" stroke-linecap="round"/>' +
    '<circle cx="0" cy="124" r="8" fill="'+b.s+'"/><circle cx="0" cy="10" r="6" fill="'+b.s+'"/>';
}
function bnNoteSVG(b){
  return '<path d="M54 64 V14 C62 20 74 24 72 40 C70 30 64 28 58 28" stroke="'+b.s+'" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<ellipse cx="40" cy="68" rx="17" ry="13" transform="rotate(-22 40 68)" fill="'+b.c+'" stroke="'+b.s+'" stroke-width="3.5"/>' +
    '<ellipse cx="34" cy="63" rx="6" ry="3.5" transform="rotate(-22 34 63)" fill="#fff" opacity=".6"/>';
}
function bnHowArt(k){
  if(k==='slide') return '<rect x="20" y="2" width="24" height="60" rx="10" fill="#E4DDFC"/><g transform="translate(14 0) scale(.48)">'+bnNoteSVG(BELLC[2])+'</g><path d="M32 46 V58 M26 53 L32 59 L38 53" stroke="#6C5BC4" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  if(k==='tap') return '<g transform="translate(32 6) scale(.42)">'+bnBellSVG(BELLC[0])+'</g><path d="M10 14 L4 8 M54 14 L60 8 M8 30 H2 M56 30 H62" stroke="#F5C842" stroke-width="3.5" stroke-linecap="round"/>';
  return '<g opacity=".5"><g transform="translate(10 6) scale(.5)">'+bnNoteSVG({c:'#CDB896',s:'#8C7556'})+'</g></g><text x="44" y="58" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="22" font-weight="600" fill="#8C7556">×3</text>';
}
GAMES.jingle={
  name:'Bell lanes',
  intro:function(L){return 'Notes slide down to Jingle’s bluebells. Tap each bell just as its note reaches it, and the bells play songs you know. Higher notes are to the right. Three missed notes and the music stops. It gets faster as you go!';},
  how:[{art:bnHowArt('slide'),text:'Watch'},{art:bnHowArt('tap'),text:'Tap the bell'},{art:bnHowArt('miss'),text:'3 misses'}],
  lives:3,
  keys:{'1':'b0','2':'b1','3':'b2','4':'b3','5':'b4',a:'b0',s:'b1',d:'b2',f:'b3',g:'b4',A:'b0',S:'b1',D:'b2',F:'b3',G:'b4',ArrowLeft:'aL',ArrowDown:'aM',ArrowUp:'aM',ArrowRight:'aR'},
  hud:function(n){return String(n);},
  unit:function(n){return n+' note'+(n===1?'':'s');},
  said:function(n){return n===0?'No notes this time.':'You rang '+n+' note'+(n===1?'':'s')+'!';},
  make:function(K){
    var i=K.L-1, n=BN_SET.lanes[i], laneNotes=BN_LANENOTES[n];
    var notes=[], queue=[], fx=[], ring=[], hits=0, dead=false, t2=0;
    var pos=-2.5, songEnd=0, order=[], banner=null, songs=[];   /* pos: where the music is, in beats; the first song starts after a short count-in */
    var jingle=K.img('bn-jingle',K.F.art(),'0 0 240 320',72,96), bg=gmScene('jingle');
    var bellIm=[], noteIm=[];
    for(var k0=0;k0<n;k0++){var col=BELLC[k0];bellIm.push(K.img('bn-bell-'+k0,bnBellSVG(col),'-56 -4 112 132',86,101));noteIm.push(K.img('bn-note-'+k0,bnNoteSVG(col),'0 0 80 90',46,52));ring.push(-1);}
    function lay(){
      var W=K.W,H=K.H, g=8, lw=Math.min(108,(W-24)/n-g), tot=n*lw+(n-1)*g, x0=(W-tot)/2, hy=H-96, bs=Math.min(lw*.86,86), ns=Math.min(46,lw*.52);
      return {W:W,H:H,lw:lw,g:g,x0:x0,tot:tot,hy:hy,bs:bs,ns:ns,lx:function(k){return x0+k*(lw+g)+lw/2;}};
    }
    function speed(){return K.rate(BN_SET.fall);}
    function beat(){var b=BN_SET.beat;return Math.max(b.min[i],b.start[i]/(1+b.grow[i]*K.t));}
    /* songs in a shuffled order, a new shuffle once all have been played; the next starts two beats after the last ends */
    function addSong(){
      if(!order.length){order=shuffle(BN_SONGS.slice());if(songs.length&&order[0]===songs[songs.length-1])order.push(order.shift());}
      var song=order.shift(), P=bnParse(song.m), start=Math.max(songEnd,0)+(songs.length?2:0);
      var gap=K.t>=BN_SET.halvesFrom[i]?.5:1;
      bnLanes(bnThin(P.notes,gap),n).forEach(function(o){queue.push({lane:o.lane,f:o.f,p:start+o.p,state:'wait',t:0,y:-999});});
      songs.push(song); banner={name:song.name,p:start}; songEnd=start+P.len;
    }
    function ahead(o,b){return (o.p-pos)*b;}   /* seconds until a note reaches its bell (less than 0 once past) */
    function freq(k){return BELL_NOTES[laneNotes[k]];}
    function tap(k){
      if(dead||k<0||k>=n)return;
      var g=lay(), b=beat(), win=BN_SET.win[i], best=null, bd=0;
      notes.forEach(function(o){if(o.lane===k&&o.state==='fall'){var a=ahead(o,b), ok=a>=0?a<=win*BN_SET.early:-a<=win;if(ok&&(!best||Math.abs(a)<bd)){best=o;bd=Math.abs(a);}}});
      ring[k]=0;
      if(best){
        best.state='hit'; best.t=0; best.y=g.hy; hits++; K.score(hits);
        bellTone(best.f,0,1.1,.2);   /* the song's own note, so the tune can be heard */
        fx.push({x:g.lx(k),y:g.hy,t:0,k:k});
      } else bellTone(freq(k),0,.5,.05);   /* a soft ring when there's no note: no harm done */
    }
    function drawLane(c,g,k){
      var x=g.lx(k), lw=g.lw, top=12, bot=g.hy+g.bs*.62, col=BELLC[k];
      c.save(); c.fillStyle='rgba(255,255,255,.5)'; gmRound(c,x-lw/2,top,lw,bot-top,Math.min(26,lw/2)); c.fill();
      c.globalAlpha=.28; c.fillStyle=col.c; gmRound(c,x-5,top+28,10,bot-top-50,5); c.fill(); c.restore();
      /* a bluebell flower at the top of each lane, where its notes come from */
      c.save(); c.translate(x,top+16); c.fillStyle=col.c; c.strokeStyle=col.s; c.lineWidth=2;
      c.beginPath(); c.moveTo(-10,-4); c.quadraticCurveTo(-10,-12,0,-12); c.quadraticCurveTo(10,-12,10,-4); c.lineTo(12,4); c.lineTo(6,1); c.lineTo(0,5); c.lineTo(-6,1); c.lineTo(-12,4); c.closePath(); c.fill(); c.stroke(); c.restore();
    }
    function drawBell(c,g,k){
      var x=g.lx(k), bs=g.bs, h=bs*132/112, r=ring[k], sw=r>=0?Math.sin(r*18)*.32*Math.max(0,1-r/.7):0;
      /* the target: a soft ring where notes should be when you tap */
      var b=beat(), win=BN_SET.win[i], near=notes.some(function(o){if(o.lane!==k||o.state!=='fall')return false;var a=ahead(o,b);return a>=0?a<=win*BN_SET.early:-a<=win;});
      c.save(); c.globalAlpha=near?.9:.45; c.strokeStyle=near?'#F5C842':'#fff'; c.lineWidth=near?6:4;
      c.beginPath(); c.ellipse(x,g.hy,bs*.56,bs*.56,0,0,Math.PI*2); c.stroke(); c.restore();
      gmShadow(c,x,g.hy+h*.58,bs*.36,6,.18);
      var im=bellIm[k]; if(!gmReady(im))return;
      c.save(); c.translate(x,g.hy-h*.5); c.rotate(sw);
      if(r>=0&&r<.25){c.shadowColor='rgba(245,200,66,.95)';c.shadowBlur=26;}
      c.drawImage(im,-bs/2,0,bs,h); c.restore();
    }
    return {
      peek:function(){var g=lay();return {notes:notes,queue:queue,pos:pos,beat:beat(),hy:g.hy,win:BN_SET.win[i],n:n,lay:g,songs:songs.map(function(x){return x.name;})};},   /* for testing */
      input:function(nm,down){
        if(!down)return;
        if(nm[0]==='b')tap(+nm[1]);
        else if(nm==='aL')tap(0); else if(nm==='aR')tap(n-1); else if(nm==='aM')tap(Math.floor(n/2));
      },
      pointer:function(t,x,y){
        if(t!=='down')return;
        var g=lay(), k=Math.floor((x-g.x0+g.g/2)/(g.lw+g.g));
        if(x<g.x0-24||x>g.x0+g.tot+24)return;
        tap(Math.max(0,Math.min(n-1,k)));
      },
      update:function(dt){
        t2+=dt; var g=lay();
        for(var r=0;r<n;r++)if(ring[r]>=0){ring[r]+=dt;if(ring[r]>.8)ring[r]=-1;}
        for(var e=fx.length-1;e>=0;e--){fx[e].t+=dt;if(fx[e].t>.8)fx.splice(e,1);}
        var v=speed(), b=beat(), win=BN_SET.win[i];
        pos+=dt/b;
        if(!dead&&queue.length<8&&songEnd-pos<12)addSong();
        /* notes join the lanes once they would be on screen */
        while(queue.length&&ahead(queue[0],b)*v<g.hy+g.ns){var o0=queue.shift();o0.state='fall';notes.push(o0);}
        for(var q=notes.length-1;q>=0;q--){
          var o=notes[q];
          if(o.state==='fall'){o.y=g.hy-ahead(o,b)*v;
            if(!dead&&ahead(o,b)<-win){o.state='miss';o.t=0;K.sfx('miss');if(K.lose()<=0){dead=true;K.end();}}}
          else {o.t+=dt;if(o.state==='miss')o.y+=v*.5*dt;if(o.t>.7)notes.splice(q,1);}
        }
        if(banner)banner.age=(pos-banner.p)*b;
      },
      draw:function(c){
        var g=lay(), W=g.W, H=g.H;
        if(!gmCover(c,bg,W,H)){c.fillStyle='#E4DDFC';c.fillRect(0,0,W,H);}
        c.fillStyle='rgba(255,255,255,.3)'; c.fillRect(0,0,W,H);
        if(g.x0>110&&gmReady(jingle)){var bob=Math.sin(t2*2.6)*4;c.drawImage(jingle,g.x0-96,g.hy-150+bob,72,96);}
        for(var k=0;k<n;k++)drawLane(c,g,k);
        for(var b=0;b<n;b++)drawBell(c,g,b);
        notes.forEach(function(o){
          var im=noteIm[o.lane]; if(!gmReady(im))return;
          var x=g.lx(o.lane), s=g.ns, a=1, y=o.y;
          c.save();
          if(o.state==='hit'){var k2=o.t/.7;a=1-k2;s*=1+k2*.6;y=g.hy-g.bs*.4-k2*70;}
          if(o.state==='miss'){a=Math.max(0,1-o.t/.7);c.filter='grayscale(1) brightness(1.05)';}
          c.globalAlpha=a; if(o.state==='fall'){c.shadowColor='rgba(255,255,255,.95)';c.shadowBlur=12;}
          c.drawImage(im,x-s/2,y-s*.62,s,s*90/80); c.restore();
        });
        /* the song's name as it starts */
        if(banner&&banner.age>-2.5&&banner.age<3){
          var ba=Math.min(1,(banner.age+2.5)/.4,(3-banner.age)/.6);
          c.save(); c.globalAlpha=Math.max(0,ba); c.font='600 22px Fredoka, Trebuchet MS, sans-serif';
          var tw=Math.min(W-24,c.measureText('♪ '+banner.name).width+36), fs=tw<c.measureText('♪ '+banner.name).width+36?Math.floor(22*(W-60)/c.measureText('♪ '+banner.name).width):22;
          c.fillStyle='rgba(255,255,255,.92)'; gmRound(c,W/2-tw/2,H*.2-24,tw,48,24); c.fill();
          c.strokeStyle='#B3A4F0'; c.lineWidth=3; c.stroke();
          c.font='600 '+fs+'px Fredoka, Trebuchet MS, sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillStyle='#6C5BC4';
          c.fillText('♪ '+banner.name,W/2,H*.2+1); c.restore();
        }
        fx.forEach(function(p){var k=p.t/.8;c.save();c.globalAlpha=1-k;c.fillStyle='#F5C842';for(var s=0;s<8;s++){var a=s*Math.PI/4+.3;c.beginPath();c.arc(p.x+Math.cos(a)*(18+40*k),p.y-20+Math.sin(a)*(14+30*k),4*(1-k)+1.5,0,Math.PI*2);c.fill();}c.restore();});
      }
    };
  }
};
