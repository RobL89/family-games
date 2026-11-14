/* ================================================================
   FLOWER CATCH - Bloom's game (phase 9)
   Bloom carries a basket through her garden. Move it left and right to catch the falling flowers.
   They fall faster over time. Three missed flowers end the game (three petals in the top bar wilt).
   Score: flowers caught. Move by dragging or moving the mouse over the garden, or with the arrow keys.
   Names in this file start with fc so they don't clash with other files.
   ================================================================ */
var FC_SET={
  fall:{start:[100,130,160],grow:[.013,.017,.021],max:[240,310,380]},   /* how fast flowers fall, game units a second */
  gap:{start:[1.6,1.3,1.1],min:[.85,.66,.52]},                         /* seconds between flowers */
  basket:[124,108,96], flower:[54,48,44], keys:[470,520,560],
  narrow:.7                                                            /* basket width on a tall phone (360 wide), times the above */
};
function fcFlowerSVG(col){
  var c=FC[col];
  return '<ellipse cx="52" cy="56" rx="34" ry="30" fill="#2F3A4A" opacity=".16"/>'+flowerG(50,50,44,col,5) +
    '<circle cx="44" cy="44" r="6" fill="#fff" opacity=".55"/>' +
    '<g opacity=".35" fill="#fff">'+[0,72,144,216,288].map(function(a){return '<ellipse cx="44" cy="20" rx="5" ry="9" transform="rotate('+a+' 50 50)"/>';}).join('')+'</g>';
}
function fcHowArt(k){
  if(k==='move') return '<path d="M8 32 H56 M16 24 L8 32 L16 40 M48 24 L56 32 L48 40" stroke="#B8467A" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  if(k==='catch') return '<g transform="translate(20 2) scale(.24)">'+flowerG(50,50,44,'pink',5)+'</g><path d="M12 38 H52 L47 58 H17 Z" fill="#E2B977" stroke="#9A6A34" stroke-width="2.5"/><path d="M16 46 H48 M18 52 H46" stroke="#9A6A34" stroke-width="2" opacity=".6"/><path d="M14 38 C14 24 50 24 50 38" stroke="#9A6A34" stroke-width="3" fill="none"/>';
  return '<path d="M32 58 C32 50 32 44 32 38" stroke="#9A8F6A" stroke-width="4" stroke-linecap="round"/><ellipse cx="40" cy="38" rx="9" ry="14" transform="rotate(48 40 38)" fill="#C9B28E" stroke="#8C7556" stroke-width="2.5"/>' ;
}
GAMES.petal={
  name:'Flower catch',
  intro:function(L){return 'Move Bloom’s basket to catch the falling flowers. Three missed flowers and the game ends. They fall faster as you go!';},
  how:[{art:fcHowArt('move'),text:'Move'},{art:fcHowArt('catch'),text:'Catch'},{art:fcHowArt('miss'),text:'3 misses'}],
  lives:3,
  keys:{ArrowLeft:'left',ArrowRight:'right',a:'left',d:'right',A:'left',D:'right'},
  hud:function(n){return String(n);},
  unit:function(n){return n+' flower'+(n===1?'':'s');},
  said:function(n){return n===0?'No flowers this time.':'You caught '+n+' flower'+(n===1?'':'s')+'!';},
  make:function(K){
    var i=K.L-1, narrow=K.W<500, bw=Math.round(FC_SET.basket[i]*(narrow?FC_SET.narrow:1)), fs=FC_SET.flower[i];   /* a phone held upright is only 360 wide, so the basket is slimmer there */
    var bx=K.W/2, target=null, held={left:false,right:false};
    var flowers=[], fx=[], wilts=[], caught=0, nextIn=.6, lastX=.5, sway=0, dead=false;
    var bloom=K.img('fc-bloom',K.F.art(true),'0 0 240 320',84,112), bg=gmScene('petal');
    var spr={}; FCOL.forEach(function(c){spr[c]=K.img('fc-'+c,fcFlowerSVG(c),'0 0 100 100',fs,fs);});
    function gap(){var g=FC_SET.gap;return Math.max(g.min[i],g.start[i]/(1+FC_SET.fall.grow[i]*K.t));}
    function basketY(){return K.H-62;}
    function spawn(){
      /* the next flower lands within reach of the last one, so it can always be caught with the keys too */
      var reach=FC_SET.keys[i]*gap()*.85/K.W, m=(fs/2+8)/K.W;
      var x=lastX+(Math.random()*2-1)*Math.min(reach,.9);
      x=Math.max(m,Math.min(1-m,x)); lastX=x;
      flowers.push({x:x,y:-fs,col:pick(FCOL),rot:Math.random()*6,vr:(Math.random()-.5)*2,ph:Math.random()*6});
    }
    function drawBasket(c,x,y){
      var w=bw, h=50, top=y-h/2;
      gmShadow(c,x,y+h/2+8,w*.5,8,.2);
      /* back rim, then any caught flowers peeping out, then the front */
      c.fillStyle='#B98A4E'; c.beginPath(); c.ellipse(x,top,w/2,9,0,Math.PI,0); c.fill();
      var show=Math.min(6,caught);
      for(var k=0;k<show;k++){var sx=x+(k-(show-1)/2)*(w/7),sy=top-4-(k%2)*6;var im=spr[FCOL[k%FCOL.length]];if(gmReady(im))c.drawImage(im,sx-fs*.32,sy-fs*.32,fs*.64,fs*.64);}
      var g=c.createLinearGradient(x-w/2,0,x+w/2,0); g.addColorStop(0,'#F0CF95'); g.addColorStop(.45,'#E2B977'); g.addColorStop(1,'#B98A4E');
      c.fillStyle=g; c.beginPath(); c.moveTo(x-w/2,top); c.lineTo(x+w/2,top); c.lineTo(x+w/2-10,top+h); c.quadraticCurveTo(x,top+h+6,x-w/2+10,top+h); c.closePath(); c.fill();
      c.strokeStyle='#9A6A34'; c.lineWidth=2.5; c.stroke();
      c.save(); c.clip(); c.strokeStyle='rgba(122,78,36,.45)'; c.lineWidth=2;
      for(var r=1;r<4;r++){c.beginPath();c.moveTo(x-w/2,top+r*h/4);c.lineTo(x+w/2,top+r*h/4);c.stroke();}
      for(var q=-w/2;q<w/2;q+=12){c.beginPath();c.moveTo(x+q,top);c.lineTo(x+q+6,top+h);c.stroke();}
      c.restore();
      c.fillStyle='#F5DAA6'; c.strokeStyle='#9A6A34'; c.lineWidth=2.5; gmRound(c,x-w/2-4,top-6,w+8,12,6); c.fill(); c.stroke();
      /* Bloom flies at the side of the basket, holding its handle */
      c.strokeStyle='#9A6A34'; c.lineWidth=4; c.beginPath(); c.moveTo(x-w/2+8,top-4); c.bezierCurveTo(x-w/2+8,top-46,x+w/2-8,top-46,x+w/2-8,top-4); c.stroke();
    }
    return {
      peek:function(){return {flowers:flowers,bx:bx,bw:bw};},   /* for testing */
      input:function(n,down){held[n]=down;if(down)target=null;},
      pointer:function(t,x){if(t!=='up')target=x;},
      update:function(dt){
        sway+=dt;
        for(var w=wilts.length-1;w>=0;w--){wilts[w].t+=dt;if(wilts[w].t>2.2)wilts.splice(w,1);}
        for(var p=fx.length-1;p>=0;p--){fx[p].t+=dt;if(fx[p].t>.8)fx.splice(p,1);}
        if(dead)return;
        var sp=FC_SET.keys[i];
        if(held.left)bx-=sp*dt; if(held.right)bx+=sp*dt;
        if(target!=null){var d=target-bx;bx+=Math.sign(d)*Math.min(Math.abs(d),Math.max(sp*1.8,Math.abs(d)*14)*dt);}
        bx=Math.max(bw/2+6,Math.min(K.W-bw/2-6,bx));
        nextIn-=dt; if(nextIn<=0){spawn();nextIn=gap();}
        var v=K.rate(FC_SET.fall), by=basketY()-25;
        for(var f=flowers.length-1;f>=0;f--){
          var o=flowers[f], y0=o.y; o.y+=v*dt; o.rot+=o.vr*dt;
          var x=o.x*K.W+Math.sin(sway*1.6+o.ph)*6;
          if(y0<by&&o.y>=by&&Math.abs(x-bx)<bw/2+fs*.15){
            flowers.splice(f,1); caught++; K.score(caught); K.sfx('catch'); fx.push({x:x,y:by,t:0}); continue;
          }
          if(o.y>K.H-18){
            flowers.splice(f,1); wilts.push({x:x,col:o.col,t:0}); K.sfx('miss');
            if(K.lose()<=0){dead=true;K.end();}
          }
        }
      },
      draw:function(c){
        var W=K.W,H=K.H;
        if(!gmCover(c,bg,W,H)){c.fillStyle='#DCEFD0';c.fillRect(0,0,W,H);}
        c.fillStyle='rgba(255,255,255,.34)'; c.fillRect(0,0,W,H);
        /* missed flowers droop on the grass and fade */
        wilts.forEach(function(m){var a=Math.max(0,1-m.t/2.2);c.save();c.globalAlpha=a;c.translate(m.x,H-16);c.rotate(Math.min(1.1,m.t*2));c.filter='grayscale(.7) brightness(.9)';var im=spr[m.col];if(gmReady(im))c.drawImage(im,-fs/2,-fs/2,fs,fs);c.restore();});
        var y=basketY();
        if(gmReady(bloom)){var bob=Math.sin(sway*3)*3;c.drawImage(bloom,bx-bw/2-70,y-122+bob,84,112);}
        drawBasket(c,bx,y);
        flowers.forEach(function(o){var im=spr[o.col];if(!gmReady(im))return;var x=o.x*W+Math.sin(sway*1.6+o.ph)*6;c.save();c.translate(x,o.y);c.rotate(o.rot);c.shadowColor='rgba(255,255,255,.95)';c.shadowBlur=12;c.drawImage(im,-fs/2,-fs/2,fs,fs);c.restore();});
        fx.forEach(function(p){var k=p.t/.8;c.save();c.globalAlpha=1-k;c.fillStyle='#F5C842';for(var s=0;s<6;s++){var a=s*Math.PI/3;c.beginPath();c.arc(p.x+Math.cos(a)*(14+30*k),p.y+Math.sin(a)*(10+22*k),4*(1-k)+1,0,Math.PI*2);c.fill();}c.restore();gmText(c,'+1',p.x,p.y-24-40*k,30,'#B8467A',1-k);});
      }
    };
  }
};
