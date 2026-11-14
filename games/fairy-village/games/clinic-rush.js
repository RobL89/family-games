/* ================================================================
   CLINIC RUSH - Ginger's game (phase 10; doctor's kit added in phase 11)
   Little woodland patients (a bunny, a mouse, a hedgehog, a bear cub and a fox cub) come into
   Ginger's clinic and sit on the leaf cushions. You can see what's wrong on the patient, and a
   bubble shows it close up; a patience flower beside it loses its petals while they wait.
   Ginger's doctor's kit lies along the bottom. Drag the right thing from the kit onto the patient
   (or tap it, then tap the patient). Some problems take two steps, in order:
     a cut knee     -> clean it, then a plaster
     spots all over -> a bottle of medicine
     a fever        -> take their temperature with the thermometer, then send them to bed
     a broken arm   -> an X-ray, then a bandage
   After the first step the bubble changes to show what was found (a clean cut, the X-ray, a hot
   thermometer), and the patient's flower gets a little patience back.
   The wrong thing on a patient makes Ginger shake her head and costs that patient some patience,
   so guessing doesn't pay. Things dropped on nobody just go back in the kit.
   A wooden sign hangs above the patients showing each problem and what it needs, in order, as a guide.
   Patients walk in and out along a path behind the cushions (drawn smaller and further back) and can
   only be treated once sitting down, so a moving patient never gets in the way of a tap or a drop.
   Keyboard: 1 to 7 picks up a thing from the kit, the arrow keys choose a patient, Space or Enter gives it.
   Patients arrive faster over time and get a little less patient.
   Three wilted flowers end the game. Score: patients helped (fully better).
   Names in this file start with ck or CK so they don't clash with other files.
   ================================================================ */
var CK_SET={
  probs:[4,4,4],                                                   /* how many problems at each level (all four everywhere; Little Sprite is slower) */
  patience:{start:[24,20,16],shrink:[.006,.008,.01],min:[15,12.5,10]},   /* seconds a patient will wait */
  gap:{start:[5.6,4.8,4.0],grow:[.02,.025,.03],min:[3.0,2.6,2.2]},        /* seconds between arrivals */
  wrong:.25,                                                       /* share of patience a patient loses when given the wrong thing */
  boost:.3                                                         /* share of patience given back after a right first step */
};
/* the problems, in the order they join by level, and the steps that make each one better */
var CK_PROB=[
  {id:'cut',say:'a cut knee',steps:['clean','plaster']},
  {id:'spots',say:'spots',steps:['medicine']},
  {id:'fever',say:'a fever',steps:['thermo','bed']},
  {id:'bone',say:'a broken arm',steps:['xray','bandage']}
];
/* the doctor's kit, in the order it lies along the bottom; the X-ray and bandage only come with the broken arm */
var CK_TOOLS=[
  {id:'clean',label:'Clean'},{id:'plaster',label:'Plaster'},{id:'medicine',label:'Medicine'},
  {id:'thermo',label:'Thermometer'},{id:'bed',label:'Bed'},{id:'xray',label:'X-ray'},{id:'bandage',label:'Bandage'}
];
var CK_ANIMALS={
  bunny:{fur:['#FFFFFF','#F2EDE8','#CFC4BA'],line:'#9E8F84',inner:'#F6B8C8',belly:'#FFFFFF',nose:'#F28CB3'},
  mouse:{fur:['#E4E0E8','#C9C3CF','#A39BAA'],line:'#6F6678',inner:'#F6B8C8',belly:'#EEEAF2',nose:'#F28CB3'},
  hedgehog:{fur:['#F7DDBA','#E9C9A3','#C9A47A'],line:'#8C6A44',inner:'#E9C9A3',belly:'#FBEBD4',nose:'#3B2A2A',spikes:'#8A5A30'},
  bear:{fur:['#D6A472','#B98552','#8A5A30'],line:'#5E3B1C',inner:'#E8C9A0',belly:'#E8C9A0',nose:'#3B2A2A',muzzle:'#E8C9A0'},
  fox:{fur:['#F7B46E','#F09A4A','#C96A24'],line:'#8A4316',inner:'#7A3A14',belly:'#FFF6EC',nose:'#3B2A2A',muzzle:'#FFF6EC'}
};
function ckAnimalSVG(sp,happy){
  var a=CK_ANIMALS[sp], L=a.line, s='';
  s+='<defs><radialGradient id="ckF" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="'+a.fur[0]+'"/><stop offset=".6" stop-color="'+a.fur[1]+'"/><stop offset="1" stop-color="'+a.fur[2]+'"/></radialGradient></defs>';
  /* ears and spikes sit behind the head */
  if(sp==='bunny') s+='<g stroke="'+L+'" stroke-width="2.5"><ellipse cx="44" cy="22" rx="10" ry="27" transform="rotate(-10 44 22)" fill="url(#ckF)"/><ellipse cx="76" cy="22" rx="10" ry="27" transform="rotate(10 76 22)" fill="url(#ckF)"/></g><ellipse cx="44" cy="24" rx="4.5" ry="18" transform="rotate(-10 44 24)" fill="'+a.inner+'"/><ellipse cx="76" cy="24" rx="4.5" ry="18" transform="rotate(10 76 24)" fill="'+a.inner+'"/>';
  if(sp==='mouse') s+='<g stroke="'+L+'" stroke-width="2.5" fill="url(#ckF)"><circle cx="28" cy="34" r="18"/><circle cx="92" cy="34" r="18"/></g><circle cx="29" cy="35" r="11" fill="'+a.inner+'"/><circle cx="91" cy="35" r="11" fill="'+a.inner+'"/>';
  if(sp==='bear') s+='<g stroke="'+L+'" stroke-width="2.5" fill="url(#ckF)"><circle cx="32" cy="30" r="13"/><circle cx="88" cy="30" r="13"/></g><circle cx="32" cy="31" r="7" fill="'+a.inner+'"/><circle cx="88" cy="31" r="7" fill="'+a.inner+'"/>';
  if(sp==='fox') s+='<g stroke="'+L+'" stroke-width="2.5" stroke-linejoin="round" fill="url(#ckF)"><path d="M26 44 L30 6 L54 30 Z"/><path d="M94 44 L90 6 L66 30 Z"/></g><path d="M32 36 L33 16 L46 30 Z M88 36 L87 16 L74 30 Z" fill="'+a.inner+'"/>';
  if(sp==='hedgehog'){
    var sp2=''; for(var k=0;k<11;k++){var an=Math.PI*(1.05+k*.09), x1=60+Math.cos(an)*30, y1=60+Math.sin(an)*30, x2=60+Math.cos(an+.045)*52, y2=60+Math.sin(an+.045)*50, x3=60+Math.cos(an+.12)*30, y3=60+Math.sin(an+.12)*30; sp2+='M'+x1.toFixed(1)+' '+y1.toFixed(1)+' L'+x2.toFixed(1)+' '+y2.toFixed(1)+' L'+x3.toFixed(1)+' '+y3.toFixed(1)+' Z ';}
    s+='<path d="'+sp2+'" fill="'+a.spikes+'" stroke="#5E3B1C" stroke-width="2" stroke-linejoin="round"/><ellipse cx="60" cy="96" rx="44" ry="34" fill="'+a.spikes+'" stroke="#5E3B1C" stroke-width="2"/>';
  }
  /* body, arms and feet */
  s+='<ellipse cx="60" cy="112" rx="34" ry="27" fill="url(#ckF)" stroke="'+L+'" stroke-width="2.5"/>';
  s+='<ellipse cx="60" cy="117" rx="20" ry="17" fill="'+a.belly+'" opacity=".9"/>';
  s+='<g fill="url(#ckF)" stroke="'+L+'" stroke-width="2.5"><ellipse cx="30" cy="110" rx="8" ry="13" transform="rotate(20 30 110)"/><ellipse cx="90" cy="110" rx="8" ry="13" transform="rotate(-20 90 110)"/><ellipse cx="44" cy="134" rx="12" ry="6"/><ellipse cx="76" cy="134" rx="12" ry="6"/></g>';
  if(sp==='fox') s+='<path d="M92 124 C112 120 116 100 108 92 C104 106 98 114 88 116 Z" fill="url(#ckF)" stroke="'+L+'" stroke-width="2.5"/><path d="M108 92 C104 98 104 104 106 106 C110 102 110 96 108 92 Z" fill="#FFF6EC"/>';
  /* head and face */
  s+='<circle cx="60" cy="60" r="34" fill="url(#ckF)" stroke="'+L+'" stroke-width="2.5"/>';
  if(a.muzzle||sp==='hedgehog') s+='<ellipse cx="60" cy="73" rx="17" ry="12" fill="'+(a.muzzle||'#FBEBD4')+'"/>';
  if(sp==='fox') s+='<path d="M36 64 C44 74 52 80 60 80 C68 80 76 74 84 64 C80 84 70 92 60 92 C50 92 40 84 36 64 Z" fill="#FFF6EC"/>';
  s+='<ellipse cx="60" cy="'+(a.muzzle||sp==='hedgehog'?66:67)+'" rx="'+(sp==='bunny'||sp==='mouse'?4.5:6)+'" ry="'+(sp==='bunny'||sp==='mouse'?3.5:4.5)+'" fill="'+a.nose+'"/>';
  if(sp==='bunny'||sp==='mouse') s+='<path d="M48 70 H30 M48 74 L32 78 M72 70 H90 M72 74 L88 78" stroke="'+L+'" stroke-width="1.6" stroke-linecap="round" opacity=".6"/>';
  if(happy){
    s+='<path d="M42 56 Q48 49 54 56 M66 56 Q72 49 78 56" stroke="#2A1E1A" stroke-width="3.2" fill="none" stroke-linecap="round"/>';
    s+='<path d="M50 77 Q60 88 70 77" stroke="#7A3428" stroke-width="3" fill="none" stroke-linecap="round"/>';
    s+='<ellipse cx="38" cy="68" rx="6" ry="4" fill="#F28CB3" opacity=".55"/><ellipse cx="82" cy="68" rx="6" ry="4" fill="#F28CB3" opacity=".55"/>';
  } else {
    s+='<circle cx="48" cy="56" r="4.6" fill="#2A1E1A"/><circle cx="72" cy="56" r="4.6" fill="#2A1E1A"/><circle cx="49.5" cy="54.5" r="1.6" fill="#fff"/><circle cx="73.5" cy="54.5" r="1.6" fill="#fff"/>';
    s+='<path d="M40 47 L51 43 M80 47 L69 43" stroke="#2A1E1A" stroke-width="2.6" stroke-linecap="round"/>';
    s+='<path d="M53 82 Q60 77 67 82" stroke="#7A3428" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
  }
  s+='<ellipse cx="46" cy="38" rx="9" ry="5" fill="#fff" opacity=".35" transform="rotate(-20 46 38)"/>';
  return s;
}
/* the kit: pictures in a 100 x 100 box (no red cross anywhere: hearts and leaves instead) */
var CK_TOOLART={
  clean:'<path d="M20 30 H74 L84 40 V84 C84 88 82 90 78 90 H24 C20 90 18 88 18 84 V34 C18 32 19 30 20 30 Z" fill="#fff" stroke="#7DBDE6" stroke-width="3" stroke-linejoin="round"/><path d="M74 30 V40 H84" fill="#DCEEFA" stroke="#7DBDE6" stroke-width="3" stroke-linejoin="round"/><path d="M28 50 H66 M28 62 H72 M28 74 H60" stroke="#DCEEFA" stroke-width="4" stroke-linecap="round"/><g fill="#5FA0D6"><path d="M70 6 C74 12 77 16 77 19 A7 7 0 0 1 63 19 C63 16 66 12 70 6 Z"/><path d="M88 22 C91 26 92 28 92 30 A4 4 0 0 1 84 30 C84 28 85 26 88 22 Z"/></g><g fill="none" stroke="#9FD9F0" stroke-width="2.5"><circle cx="30" cy="16" r="6"/><circle cx="44" cy="10" r="4"/><circle cx="16" cy="26" r="3.5"/></g>',
  plaster:'<g transform="rotate(-28 50 50)"><rect x="6" y="34" width="88" height="32" rx="16" fill="#F3DCB8" stroke="#C9A77A" stroke-width="3"/><rect x="34" y="38" width="32" height="24" rx="4" fill="#fff"/><path d="M50 58 C42 54 40 44 50 40 C60 44 58 54 50 58 Z" fill="#7FD3B5" stroke="#357A31" stroke-width="1.6"/><path d="M50 57 V43" stroke="#357A31" stroke-width="1.2"/><g fill="#C9A77A"><circle cx="16" cy="44" r="2"/><circle cx="22" cy="56" r="2"/><circle cx="80" cy="44" r="2"/><circle cx="86" cy="56" r="2"/></g></g>',
  medicine:'<rect x="36" y="8" width="24" height="14" rx="3" fill="#F7F3EA" stroke="#8C7556" stroke-width="2.5"/><path d="M32 22 H64 V30 C74 36 76 44 76 54 V84 C76 89 72 92 67 92 H29 C24 92 20 89 20 84 V54 C20 44 22 36 32 30 Z" fill="#E86FA0" stroke="#9C2A5A" stroke-width="3" stroke-linejoin="round"/><rect x="26" y="50" width="44" height="28" rx="5" fill="#fff" stroke="#9C2A5A" stroke-width="2"/><path d="M48 72 C38 66 38 56 44 56 C47 56 48 59 48 59 C48 59 49 56 52 56 C58 56 58 66 48 72 Z" fill="#E8574C"/><path d="M28 40 C26 48 26 54 27 60" stroke="#fff" stroke-width="4" opacity=".5" fill="none" stroke-linecap="round"/><path d="M78 64 L94 48" stroke="#B8BCC8" stroke-width="5" stroke-linecap="round"/><ellipse cx="96" cy="45" rx="7" ry="5" transform="rotate(-45 96 45)" fill="#D5D9E2" stroke="#8C93A3" stroke-width="2"/>',
  thermo:'<g transform="rotate(-38 50 50)"><rect x="42" y="2" width="16" height="76" rx="8" fill="#F4FAFD" stroke="#5E7A9A" stroke-width="3"/><rect x="47" y="34" width="6" height="48" rx="3" fill="#E8574C"/><circle cx="50" cy="84" r="12" fill="#E8574C" stroke="#9C241C" stroke-width="3"/><path d="M58 14 H52 M58 24 H54 M58 34 H52 M58 44 H54 M58 54 H52" stroke="#5E7A9A" stroke-width="2"/><circle cx="46" cy="80" r="3.5" fill="#fff" opacity=".6"/></g>',
  bed:'<path d="M10 40 V88 M90 58 V88" stroke="#8A5A30" stroke-width="7" stroke-linecap="round"/><path d="M10 74 H90" stroke="#8A5A30" stroke-width="7" stroke-linecap="round"/><rect x="14" y="56" width="74" height="16" rx="6" fill="#FFF6EC" stroke="#C9A77A" stroke-width="2"/><ellipse cx="28" cy="52" rx="14" ry="9" fill="#fff" stroke="#9AB0D6" stroke-width="2.5"/><path d="M38 54 C50 48 76 48 88 56 V70 H38 Z" fill="#7DBDE6" stroke="#3E7FB0" stroke-width="2.5" stroke-linejoin="round"/><path d="M48 54 V70 M62 52 V70 M76 53 V70" stroke="#fff" stroke-width="3" opacity=".55"/><text x="64" y="34" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="20" font-weight="600" fill="#6C5BC4">z</text><text x="76" y="22" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="15" font-weight="600" fill="#6C5BC4">z</text>',
  xray:'<rect x="10" y="12" width="80" height="76" rx="10" fill="#26385E" stroke="#121C33" stroke-width="3"/><rect x="16" y="18" width="68" height="64" rx="6" fill="#3A5585"/><path d="M34 70 L66 30" stroke="#EAF2FF" stroke-width="9" stroke-linecap="round"/><g fill="#EAF2FF"><circle cx="29" cy="70" r="7"/><circle cx="37" cy="77" r="7"/><circle cx="63" cy="23" r="7"/><circle cx="71" cy="30" r="7"/></g><circle cx="80" cy="22" r="3" fill="#8EE07A"/>',
  bandage:'<path d="M58 66 C70 70 86 66 94 76 L90 90 C80 82 66 86 54 80 Z" fill="#fff" stroke="#A8B4C8" stroke-width="2.5" stroke-linejoin="round"/><ellipse cx="40" cy="56" rx="28" ry="30" fill="#fff" stroke="#A8B4C8" stroke-width="3"/><ellipse cx="40" cy="56" rx="17" ry="18" fill="none" stroke="#DCE3EE" stroke-width="3"/><ellipse cx="40" cy="56" rx="7" ry="8" fill="#E9EDF4" stroke="#A8B4C8" stroke-width="2.5"/><path d="M60 72 L88 78 M58 78 L86 84" stroke="#DCE3EE" stroke-width="2"/>'
};
/* what's wrong, close up, for the bubbles: [problem id][step reached] (100 x 100) */
var CK_LEG='<path d="M30 6 L56 50 L34 94" stroke="#B57650" stroke-width="28" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 6 L56 50 L34 94" stroke="#F3CBB0" stroke-width="22" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
var CK_FACE='<circle cx="50" cy="54" r="36" fill="#F3CBB0" stroke="#B57650" stroke-width="3"/>';
var CK_STAGEART={
  cut:[
    CK_LEG+'<ellipse cx="57" cy="50" rx="11" ry="9" fill="#F49DBE" opacity=".85"/><path d="M50 44 L56 49 L52 52 L62 57" stroke="#C8283A" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><g fill="#8A6A44"><circle cx="48" cy="56" r="2.6"/><circle cx="63" cy="45" r="2.2"/><circle cx="60" cy="60" r="2.8"/><circle cx="46" cy="44" r="2"/><circle cx="66" cy="53" r="2"/></g><path d="M58 60 C60 64 61 66 61 68 A3 3 0 0 1 55 68 C55 66 56 64 58 60 Z" fill="#C8283A"/><path d="M78 30 L86 24 M80 46 L90 44 M76 62 L86 66" stroke="#E8574C" stroke-width="3" stroke-linecap="round"/><text x="74" y="94" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="15" font-weight="600" fill="#E8574C">knee</text>',
    CK_LEG+'<ellipse cx="57" cy="50" rx="10" ry="8" fill="#F8C4D6" opacity=".9"/><path d="M50 44 L56 49 L52 52 L62 57" stroke="#C8283A" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><g fill="#F5C842" stroke="#B8861E" stroke-width="1.2"><path d="M80 26 l2.4 4.8 4.8 .8 -4 3.2 .8 4.8 -4 -2.4 -4 2.4 .8 -4.8 -4 -3.2 4.8 -.8 Z"/><path d="M84 58 l2 4 4 .6 -3.2 2.6 .6 4 -3.4 -2 -3.4 2 .6 -4 -3.2 -2.6 4 -.6 Z"/></g><g fill="none" stroke="#9FD9F0" stroke-width="2.2"><circle cx="72" cy="42" r="4"/><circle cx="76" cy="74" r="3"/></g>'
  ],
  spots:[CK_FACE+'<g fill="#E8574C"><circle cx="30" cy="44" r="4.5"/><circle cx="44" cy="30" r="3.5"/><circle cx="64" cy="28" r="4"/><circle cx="74" cy="46" r="4.5"/><circle cx="68" cy="72" r="4"/><circle cx="30" cy="68" r="3.5"/><circle cx="50" cy="80" r="3"/><circle cx="56" cy="44" r="2.5"/></g><circle cx="40" cy="52" r="3.5" fill="#2A1E1A"/><circle cx="60" cy="52" r="3.5" fill="#2A1E1A"/><path d="M42 68 Q50 63 58 68" stroke="#7A3428" stroke-width="2.6" fill="none" stroke-linecap="round"/>'],
  fever:[
    CK_FACE.replace('#F3CBB0','#F7A88F')+'<ellipse cx="30" cy="62" rx="8" ry="5" fill="#E8574C" opacity=".6"/><ellipse cx="70" cy="62" rx="8" ry="5" fill="#E8574C" opacity=".6"/><path d="M34 50 Q40 54 46 50 M54 50 Q60 54 66 50" stroke="#2A1E1A" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="50" cy="70" rx="5" ry="4" fill="#7A3428"/><g fill="#7DBDE6"><path d="M84 40 C87 45 89 48 89 51 A5 5 0 0 1 79 51 C79 48 81 45 84 40 Z"/><path d="M14 36 C16 40 18 42 18 44 A4 4 0 0 1 10 44 C10 42 12 40 14 36 Z"/></g><path d="M34 14 C30 10 38 6 34 2 M50 14 C46 10 54 6 50 2 M66 14 C62 10 70 6 66 2" stroke="#E8574C" stroke-width="3" fill="none" stroke-linecap="round"/>',
    CK_FACE.replace('#F3CBB0','#F7A88F')+'<path d="M28 52 Q34 56 40 52 M46 52 Q52 56 58 52" stroke="#2A1E1A" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="44" cy="70" rx="6" ry="5" fill="#7A3428"/><g transform="translate(66 4) scale(.34)"><rect x="42" y="2" width="16" height="76" rx="8" fill="#F4FAFD" stroke="#5E7A9A" stroke-width="5"/><rect x="47" y="8" width="6" height="74" rx="3" fill="#E8574C"/><circle cx="50" cy="84" r="12" fill="#E8574C" stroke="#9C241C" stroke-width="5"/></g><path d="M84 8 L92 2 M88 18 L98 16" stroke="#E8574C" stroke-width="3" stroke-linecap="round"/><text x="22" y="22" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="18" font-weight="600" fill="#E8574C">Hot!</text>'
  ],
  bone:[
    '<g fill="#fff" stroke="#8C96AA" stroke-width="2.5" stroke-linejoin="round"><g transform="translate(9 58) rotate(-24) scale(1.2)"><path d="M0 -5 L30 -5 L34 -1 L29 2 L33 5 L0 5 Z"/><circle cx="0" cy="-6" r="7"/><circle cx="0" cy="6" r="7"/><path d="M-3 -5 H30 M-3 5 H31" stroke="none"/></g><g transform="translate(92 62) rotate(206) scale(1.2)"><path d="M0 -5 L30 -5 L34 -1 L29 2 L33 5 L0 5 Z"/><circle cx="0" cy="-6" r="7"/><circle cx="0" cy="6" r="7"/><path d="M-3 -5 H30 M-3 5 H31" stroke="none"/></g></g>'+
    '<path d="M51 40 L55 46 L50 50 L54 56" stroke="#C8283A" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M34 26 L30 16 M50 24 V14 M66 26 L70 16" stroke="#E8574C" stroke-width="3" stroke-linecap="round"/><text x="50" y="92" text-anchor="middle" font-family="Fredoka, Trebuchet MS, sans-serif" font-size="17" font-weight="600" fill="#E8574C">Snap!</text>',
    '<rect x="8" y="10" width="84" height="80" rx="10" fill="#26385E" stroke="#121C33" stroke-width="3"/><path d="M22 74 L46 40" stroke="#EAF2FF" stroke-width="8" stroke-linecap="round"/><path d="M52 44 L80 62" stroke="#EAF2FF" stroke-width="8" stroke-linecap="round"/><circle cx="48" cy="38" r="7" fill="#EAF2FF"/><path d="M64 46 L67 52 L62 55 L66 61" stroke="#FF8A7A" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="18" cy="78" r="5" fill="#EAF2FF"/><circle cx="84" cy="66" r="5" fill="#EAF2FF"/>'
  ]
};
function ckHowArt(k){
  if(k==='look') return '<rect x="6" y="6" width="52" height="40" rx="14" fill="#fff" stroke="#3E9E7E" stroke-width="2.5"/><path d="M18 46 L14 58 L28 46" fill="#fff" stroke="#3E9E7E" stroke-width="2.5" stroke-linejoin="round"/><g transform="translate(14 8) scale(.36)">'+CK_STAGEART.cut[0]+'</g>';
  if(k==='drag') return '<g transform="translate(2 22) scale(.4)">'+CK_TOOLART.clean+'</g><path d="M30 34 C38 22 46 18 54 18 M48 12 L55 18 L48 23" stroke="#B8467A" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><g transform="translate(34 30) scale(.3)">'+CK_TOOLART.plaster+'</g>';
  return '<circle cx="32" cy="34" r="7" fill="#C9A47A"/><g fill="#CDB896" stroke="#8C7556" stroke-width="2">'+[0,72,144,216,288].map(function(a){return '<ellipse cx="32" cy="18" rx="6" ry="10" transform="rotate('+(a+(a>100?30:0))+' 32 34)"/>';}).join('')+'</g><path d="M32 42 V60" stroke="#8C7556" stroke-width="3"/>';
}
GAMES.ginger={
  name:'Clinic rush',
  intro:function(L){
    var s='Patients are coming to Ginger’s clinic! Look at what’s wrong, then drag the right thing from the doctor’s kit onto the patient before their flower wilts. A cut knee needs cleaning, then a plaster. Spots need medicine. A fever needs the thermometer, then bed.';
    s+=' A broken arm needs an X-ray, then a bandage.';
    return s+' The sign at the top shows what each problem needs. The wrong thing makes a patient less patient. Three wilted flowers and the clinic closes.';
  },
  how:[{art:ckHowArt('look'),text:'Look'},{art:ckHowArt('drag'),text:'Drag from the kit'},{art:ckHowArt('wilt'),text:'3 wilted'}],
  lives:3,
  keys:{'1':'t0','2':'t1','3':'t2','4':'t3','5':'t4','6':'t5','7':'t6',ArrowLeft:'left',ArrowRight:'right',' ':'give',Enter:'give'},
  hud:function(n){return String(n);},
  unit:function(n){return n+' patient'+(n===1?'':'s');},
  said:function(n){return n===0?'No patients helped this time.':'You helped '+n+' patient'+(n===1?'':'s')+' get better!';},
  make:function(K){
    var i=K.L-1, probs=CK_PROB.slice(0,CK_SET.probs[i]), need={};
    probs.forEach(function(p){p.steps.forEach(function(s){need[s]=1;});});
    var tools=CK_TOOLS.filter(function(t){return need[t.id];}), nt=tools.length;
    var pats=[], helped=0, dead=false, nextIn=.9, lastProb=null, t2=0, gingerNo=-1, toolShake=[];
    var held=null, sel=-1, kb=false, kbSeat=0, msg=null;
    var gin=K.img('ck-ginger',K.F.art(),'0 0 240 320',60,80), bg=gmScene('ginger');
    var spr={}; Object.keys(CK_ANIMALS).forEach(function(a){spr[a]=K.img('ck-'+a,ckAnimalSVG(a,false),'0 0 120 140',120,140);spr[a+'+']=K.img('ck-'+a+'+',ckAnimalSVG(a,true),'0 0 120 140',120,140);});
    var tArt={}; tools.forEach(function(t,k){tArt[t.id]=K.img('ck-t-'+t.id,CK_TOOLART[t.id],'0 0 100 100',80,80);toolShake.push(-1);});
    var sArt={}; probs.forEach(function(p){sArt[p.id]=CK_STAGEART[p.id].map(function(a,k){return K.img('ck-s-'+p.id+k,a,'0 0 100 100',70,70);});});
    function patience(){var p=CK_SET.patience;return Math.max(p.min[i],p.start[i]/(1+p.shrink[i]*K.t));}
    function gap(){var g=CK_SET.gap;return Math.max(g.min[i],g.start[i]/(1+g.grow[i]*K.t));}
    /* ---- layout: the kit along the bottom (two rows on a narrow screen), the patients above ---- */
    function lay(){
      var W=K.W,H=K.H, cols=(W-24)/nt>=74?nt:Math.ceil(nt/2), rows=Math.ceil(nt/cols);
      var cw=(W-24)/cols, r=Math.min(44,(cw-12)/2), fs=Math.max(11,Math.min(16,r*.34)), rowH=r*2+fs+14, kitH=rows*rowH+14, kitTop=H-kitH-8;
      /* on a wide screen the help sign stands on the right, one problem per row, and the cushions move left to make room */
      var side=W>=760, np=probs.length, sic=Math.max(30,Math.min(62,(kitTop-26-12)/np-12)), sideW=side?sic*4.1+28:0;
      var left=W-sideW-(side?14:0), S=W>=600?4:3, slotW=Math.min(170,(left-16)/S), base=kitTop-16, midX=left/2;
      var pw=Math.min(118,slotW*.84,(base-14)/(140/120+.66));
      /* the help sign hanging above the patients: each problem, then what it needs, in order */
      var sign;
      if(side){sign={x:W-sideW-10,y:14,w:sideW,h:np*(sic+12)+14,cols:1,ew:sideW,ic:sic,gap:12};}
      else {
        var scol=(W-92)/np>=170?np:2, srow=Math.ceil(np/scol), sx0=80, sw=W-sx0-10, ew=sw/scol;
        var room=base-pw*140/120-pw*.78-14-16, ic=Math.max(18,Math.min(54,ew/4.3,(room-16)/srow-10));
        sign={x:sx0,y:14,w:sw,h:srow*(ic+10)+12,cols:scol,ew:ew,ic:ic,gap:10};
      }
      return {W:W,H:H,r:r,fs:fs,cols:cols,rowH:rowH,kitTop:kitTop,kitH:kitH,S:S,slotW:slotW,pw:pw,ph:pw*140/120,base:base,sign:sign,
        tx:function(k){var row=Math.floor(k/cols), inRow=Math.min(cols,nt-row*cols), col=k-row*cols;return W/2+(col-(inRow-1)/2)*cw;},
        ty:function(k){return kitTop+10+r+Math.floor(k/cols)*rowH;},
        sx:function(s){return (side?midX:W/2)+(s-(S-1)/2)*slotW;}};
    }
    function seated(p){return p.state==='walk'||p.state==='wait';}
    function ready(p){return p.state==='wait';}   /* only a patient sitting on their cushion can be treated */
    /* how far back a patient is: walking in and out happens along a path behind the cushions (1), sitting is at the front (0) */
    function backOf(g,p){
      if(p.state==='walk')return Math.max(0,Math.min(1,(p.x-g.sx(p.seat))/(g.slotW*.45)));
      if(p.state==='leave'||p.state==='sad')return Math.min(1,p.t/.3);
      return 0;
    }
    function freeSeats(g){var used={};pats.forEach(function(p){if(seated(p)||p.state==='busy')used[p.seat]=1;});var f=[];for(var s=0;s<g.S;s++)if(!used[s])f.push(s);return f;}
    function arrive(g,seat){
      var opts=probs.filter(function(p){return p!==lastProb||probs.length<2;});
      var pr=pick(opts); lastProb=pr;
      var max=patience();
      pats.push({sp:pick(Object.keys(CK_ANIMALS)),prob:pr,step:0,seat:seat,x:g.W+g.pw,state:'walk',pat:max,max:max,t:0,hop:Math.random()*6,anim:null,shake:-1});
    }
    /* the patient under a point, if any */
    function patAt(g,x,y){
      var best=null;
      pats.forEach(function(p){if(!ready(p))return;var top=g.base-g.ph-g.pw*.66;if(Math.abs(x-p.x)<g.slotW*.5&&y>top&&y<g.base+16)best=p;});
      return best;
    }
    function say(t){msg={text:t,t:0};}
    /* give kit thing k to patient p */
    function give(k,p){
      if(dead||!p||!ready(p)||k<0||k>=nt)return;
      var tool=tools[k].id, want=p.prob.steps[p.step];
      if(tool===want){
        p.step++; p.anim={tool:tool,t:0};
        if(mem.sound){tone(659.25,0,.1,'sine',.09);tone(880,.07,.14,'sine',.08);}
        if(p.step>=p.prob.steps.length){p.state='busy';p.t=0;}   /* the last step plays out, then they are better */
        else p.pat=Math.min(p.max,p.pat+p.max*CK_SET.boost);
      } else {
        /* the wrong thing: Ginger shakes her head and this patient gets less patient */
        p.shake=0; gingerNo=0; toolShake[k]=0;
        if(mem.sound)tone(220,0,.18,'triangle',.07);
        p.pat=Math.max(.01,p.pat-p.max*CK_SET.wrong);
        say(pick(['Not that one!','Hmm, not quite.','Look again!']));
      }
    }
    /* ---- drawing ---- */
    function drawFlower(c,x,y,frac,r){
      var n=Math.ceil(frac*5-1e-6), blink=frac<.22&&Math.sin(t2*12)>0;
      for(var k=0;k<5;k++){
        var a=-Math.PI/2+k*Math.PI*2/5, ok=k<n;
        c.save(); c.translate(x+Math.cos(a)*r*.62,y+Math.sin(a)*r*.62+(ok?0:r*.25)); c.rotate(a+Math.PI/2+(ok?0:.5));
        c.fillStyle=ok?(blink&&k===n-1?'#FFD5E5':'#F49DBE'):'#CDB896'; c.strokeStyle=ok?'#B8467A':'#8C7556'; c.lineWidth=1.6;
        c.beginPath(); c.ellipse(0,0,r*.36,r*.56,0,0,Math.PI*2); c.fill(); c.stroke(); c.restore();
      }
      gmBall(c,x,y,r*.34,'#FFE9A0','#F5C842','#C99A1E');
    }
    function drawBubble(c,x,y,w,h){
      c.save(); c.shadowColor='rgba(59,42,74,.18)'; c.shadowOffsetY=3; c.fillStyle='#fff';
      gmRound(c,x-w/2,y-h/2,w,h,h*.35); c.fill(); c.restore();
      c.fillStyle='#fff'; c.beginPath(); c.moveTo(x-8,y+h/2-2); c.lineTo(x-2,y+h/2+12); c.lineTo(x+10,y+h/2-2); c.closePath(); c.fill();
      c.strokeStyle='#3E9E7E'; c.lineWidth=2.5; gmRound(c,x-w/2,y-h/2,w,h,h*.35); c.stroke();
    }
    var SPOTS=[[46,44],[74,46],[60,32],[38,64],[82,66],[52,100],[70,108],[44,118],[78,122],[60,124],[30,104],[90,100]];
    /* what's wrong (and what's been done), drawn on the patient in the animal picture's 120 x 140 box */
    function drawCondition(c,p){
      var id=p.prob.id, st=p.step, an=p.anim, at=an?an.t:9;
      if(id==='cut'){
        var kx=40,ky=126; c.save(); c.translate(kx,ky); c.scale(1.35,1.35); c.translate(-kx,-ky);
        if(st>=2&&!(an&&an.tool==='plaster'&&at<.15)){c.save();c.translate(kx,ky);c.rotate(-.4);var sc=an&&an.tool==='plaster'?Math.min(1,at/.3):1;c.scale(sc,sc);
          c.fillStyle='#F3DCB8';c.strokeStyle='#C9A77A';c.lineWidth=1.5;gmRound(c,-16,-6,32,12,6);c.fill();c.stroke();c.fillStyle='#fff';c.fillRect(-6,-4,12,8);c.fillStyle='#7FD3B5';c.beginPath();c.ellipse(0,0,2.2,3.4,0,0,Math.PI*2);c.fill();c.restore();}
        else {c.fillStyle='rgba(244,157,190,.9)';c.beginPath();c.ellipse(kx,ky,10,7,0,0,Math.PI*2);c.fill();
          c.strokeStyle='#C8283A';c.lineWidth=2.6;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(kx-7,ky-4);c.lineTo(kx-1,ky);c.lineTo(kx-4,ky+2);c.lineTo(kx+6,ky+5);c.stroke();
          if(st===0){c.fillStyle='#8A6A44';[[-6,4],[5,-3],[7,4],[-3,-5]].forEach(function(d){c.beginPath();c.arc(kx+d[0],ky+d[1],1.7,0,Math.PI*2);c.fill();});}}
        c.restore();
      }
      if(id==='spots'){
        var a=st>=1?(an&&an.tool==='medicine'?Math.max(0,1-(at-.35)/.5):0):1;
        if(a>0){c.save();c.globalAlpha=a;c.fillStyle='#E8574C';SPOTS.forEach(function(q,k){c.beginPath();c.arc(q[0],q[1],k<5?3.6:3.2,0,Math.PI*2);c.fill();});c.restore();}
      }
      if(id==='fever'){
        if(st<2){c.fillStyle='rgba(232,87,76,.55)';c.beginPath();c.ellipse(38,70,8,5,0,0,Math.PI*2);c.ellipse(82,70,8,5,0,0,Math.PI*2);c.fill();
          c.fillStyle='#7DBDE6';[[22,44],[98,46]].forEach(function(q){var y=q[1]+((t2*20)%10);c.beginPath();c.moveTo(q[0],y-6);c.quadraticCurveTo(q[0]+4,y,q[0],y+3);c.quadraticCurveTo(q[0]-4,y,q[0],y-6);c.fill();});
          c.strokeStyle='rgba(232,87,76,.8)';c.lineWidth=2.4;c.lineCap='round';for(var w=0;w<3;w++){var hx=44+w*16, k2=(t2*1.2+w*.33)%1;c.save();c.globalAlpha=1-k2;c.beginPath();c.moveTo(hx,22-k2*14);c.quadraticCurveTo(hx-4,17-k2*14,hx,12-k2*14);c.quadraticCurveTo(hx+4,7-k2*14,hx,2-k2*14);c.stroke();c.restore();}}
      }
      if(id==='bone'){
        var ax=90,ay=110;
        if(st>=2){var sb=an&&an.tool==='bandage'?Math.min(1,at/.35):1;c.save();c.translate(ax,ay);c.rotate(-.35);c.scale(1,sb);c.fillStyle='#fff';c.strokeStyle='#A8B4C8';c.lineWidth=1.6;gmRound(c,-10,-12,20,24,8);c.fill();c.stroke();c.beginPath();c.moveTo(-10,-4);c.lineTo(10,-6);c.moveTo(-10,4);c.lineTo(10,2);c.stroke();c.restore();}
        else {c.fillStyle='rgba(140,110,220,.55)';c.beginPath();c.ellipse(ax,ay,9,11,-.35,0,Math.PI*2);c.fill();c.strokeStyle='#C8283A';c.lineWidth=2.6;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(ax-5,ay-6);c.lineTo(ax+2,ay-2);c.lineTo(ax-3,ay+2);c.lineTo(ax+5,ay+6);c.stroke();
          c.strokeStyle='#E8574C';c.lineWidth=2.2;c.beginPath();c.moveTo(ax+12,ay-12);c.lineTo(ax+18,ay-18);c.moveTo(ax+14,ay);c.lineTo(ax+22,ay-1);c.stroke();}
      }
    }
    /* the moment a kit thing is used: the thing itself at work on the patient */
    function drawAction(c,p){
      var an=p.anim; if(!an||an.t>1.1)return;
      var t=an.t, im=tArt[an.tool];
      if(an.tool==='clean'){var a=Math.max(0,1-Math.max(0,t-.6)/.3);c.save();c.globalAlpha=a;c.translate(40+Math.sin(t*22)*8,120);if(gmReady(im))c.drawImage(im,-14,-14,28,28);c.restore();
        c.save();c.strokeStyle='rgba(159,217,240,'+a+')';c.lineWidth=1.6;for(var b=0;b<4;b++){var bt=(t*1.6+b*.25)%1;c.beginPath();c.arc(30+b*8,124-bt*24,2+b%2,0,Math.PI*2);c.stroke();}c.restore();}
      if(an.tool==='medicine'){var mx=60+(1-Math.min(1,t/.35))*40, a2=t<.8?1:Math.max(0,1-(t-.8)/.3);c.save();c.globalAlpha=a2;if(gmReady(im))c.drawImage(im,mx-2,48,30,30);c.restore();}
      if(an.tool==='thermo'){var a3=t<.85?1:Math.max(0,1-(t-.85)/.25);c.save();c.globalAlpha=a3;c.translate(70,80);c.rotate(-.5);c.fillStyle='#F4FAFD';c.strokeStyle='#5E7A9A';c.lineWidth=1.5;gmRound(c,0,-3,30,6,3);c.fill();c.stroke();
        var fill=Math.min(1,t/.7);c.fillStyle='#E8574C';gmRound(c,26-24*fill,-1.5,24*fill+3,3,1.5);c.fill();c.beginPath();c.arc(30,0,4.5,0,Math.PI*2);c.fill();c.restore();}
      if(an.tool==='xray'){var a4=t<.15?t/.15:t<.8?1:Math.max(0,1-(t-.8)/.3);c.save();c.globalAlpha=a4*.88;c.fillStyle='#26385E';gmRound(c,10,18,100,122,12);c.fill();c.globalAlpha=a4;c.strokeStyle='#EAF2FF';c.lineCap='round';c.lineWidth=4;
        c.beginPath();c.arc(60,58,22,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(60,82);c.lineTo(60,128);c.moveTo(44,96);c.lineTo(76,96);c.moveTo(46,106);c.lineTo(74,106);c.moveTo(48,116);c.lineTo(72,116);c.moveTo(60,92);c.lineTo(32,108);c.moveTo(60,92);c.lineTo(80,100);c.lineTo(94,114);c.stroke();
        c.strokeStyle='#FF8A7A';c.lineWidth=2.5;c.beginPath();c.moveTo(84,100);c.lineTo(88,105);c.lineTo(84,108);c.stroke();c.restore();}
    }
    function drawPatient(c,g,p){
      var bk=backOf(g,p), x=p.x, base=g.base-bk*g.pw*.34, pw=g.pw*(1-.3*bk), ph=pw*140/120, a=1-.18*bk, jump=0;
      if(p.state==='walk'||p.state==='leave'||p.state==='sad')jump=Math.abs(Math.sin(p.t*9+p.hop))*8;
      if(p.state==='happy')jump=Math.abs(Math.sin(p.t*10))*14;
      if(p.state==='sad')a*=Math.max(0,1-p.t*.7);
      if(p.shake>=0)x+=Math.sin(p.shake*40)*5*(1-p.shake/.4);
      var bedded=p.prob.id==='fever'&&p.step>=2&&(p.state!=='busy'||p.anim.t>.25);
      c.save(); c.globalAlpha=a;
      gmShadow(c,x,base+2,pw*.36,7*(1-.4*bk),.2);
      if(bedded){c.save();c.translate(x-pw*.62,base-pw*.5);c.scale(pw/80,pw/80);
        c.fillStyle='#8A5A30';c.fillRect(2,2,6,40);c.fillRect(90,20,6,22);c.fillRect(2,30,94,6);c.restore();}
      var happy=p.state==='happy'||p.state==='leave';
      var im=spr[p.sp+(happy?'+':'')], top=base-ph-jump+6;
      if(gmReady(im))c.drawImage(im,x-pw/2,top,pw,ph);
      c.save(); c.translate(x-pw/2,top); c.scale(pw/120,pw/120);
      drawCondition(c,p);
      if(bedded){c.fillStyle='#7DBDE6';c.strokeStyle='#3E7FB0';c.lineWidth=2.5;c.beginPath();c.moveTo(14,96);c.quadraticCurveTo(60,84,106,96);c.lineTo(110,142);c.lineTo(10,142);c.closePath();c.fill();c.stroke();
        c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=4;c.beginPath();c.moveTo(40,92);c.lineTo(40,140);c.moveTo(60,90);c.lineTo(60,140);c.moveTo(80,92);c.lineTo(80,140);c.stroke();
        gmText(c,'z',100,30+Math.sin(t2*3)*3,18,'#6C5BC4');gmText(c,'z',110,16+Math.sin(t2*3+1)*3,13,'#6C5BC4');}
      drawAction(c,p);
      c.restore();
      if(ready(p)){
        var bw=pw*.66, bh=pw*.58, by=base-ph-bh/2-8, st=Math.min(p.step,CK_STAGEART[p.prob.id].length-1);
        drawBubble(c,x-6,by,bw,bh);
        var pi=sArt[p.prob.id][st]; if(gmReady(pi))c.drawImage(pi,x-6-bh*.42,by-bh*.42,bh*.84,bh*.84);
        drawFlower(c,x+bw/2-2,by-bh/2+2,p.pat/p.max,Math.max(13,pw*.15));
        if(p.prob.steps.length>1){for(var d=0;d<p.prob.steps.length;d++){c.fillStyle=d<p.step?'#3E9E7E':'#fff';c.strokeStyle='#3E9E7E';c.lineWidth=1.6;c.beginPath();c.arc(x-6-6+d*12,by+bh/2-8,3.6,0,Math.PI*2);c.fill();c.stroke();}}
      }
      if(happy){
        var k=Math.min(1,p.t/.9);
        c.globalAlpha=a*(1-k); c.fillStyle='#E8574C';
        var hx=x, hy=base-ph-10-k*40, s=10+6*k;
        c.beginPath(); c.moveTo(hx,hy+s*.9); c.bezierCurveTo(hx-s*1.6,hy-s*.2,hx-s*.7,hy-s*1.3,hx,hy-s*.4); c.bezierCurveTo(hx+s*.7,hy-s*1.3,hx+s*1.6,hy-s*.2,hx,hy+s*.9); c.fill();
      }
      c.restore();
    }
    function drawSign(c,g){
      var sg=g.sign, ic=sg.ic;
      c.save();
      c.strokeStyle='#8A6A44'; c.lineWidth=2.5; c.beginPath(); c.moveTo(sg.x+sg.w*.12,0); c.lineTo(sg.x+sg.w*.12,sg.y+4); c.moveTo(sg.x+sg.w*.88,0); c.lineTo(sg.x+sg.w*.88,sg.y+4); c.stroke();
      c.shadowColor='rgba(59,42,74,.2)'; c.shadowOffsetY=3; c.shadowBlur=6;
      var wg=c.createLinearGradient(0,sg.y,0,sg.y+sg.h); wg.addColorStop(0,'#F6E3C2'); wg.addColorStop(1,'#E2C18E');
      c.fillStyle=wg; gmRound(c,sg.x,sg.y,sg.w,sg.h,14); c.fill(); c.restore();
      c.strokeStyle='#A8763E'; c.lineWidth=2.5; gmRound(c,sg.x,sg.y,sg.w,sg.h,14); c.stroke();
      probs.forEach(function(pr,n){
        var col=n%sg.cols, row=Math.floor(n/sg.cols), steps=pr.steps.length;
        var w=ic+steps*(ic*.88+ic*.5)+ic*.3, x=sg.x+col*sg.ew+(sg.cols===1?14:(sg.ew-w)/2)+ic/2, y=sg.y+6+row*(ic+sg.gap)+(ic+sg.gap)/2;
        c.fillStyle='#fff'; c.strokeStyle='#E8574C'; c.lineWidth=2; c.beginPath(); c.arc(x,y,ic/2,0,Math.PI*2); c.fill(); c.stroke();
        var pi=sArt[pr.id][0]; if(gmReady(pi))c.drawImage(pi,x-ic*.42,y-ic*.42,ic*.84,ic*.84);
        var tx=x+ic/2;
        pr.steps.forEach(function(st){
          var ax=tx+ic*.08, aw=ic*.32;
          c.strokeStyle='#8A5A30'; c.lineWidth=2.4; c.lineCap='round'; c.lineJoin='round'; c.beginPath(); c.moveTo(ax,y); c.lineTo(ax+aw,y); c.moveTo(ax+aw-5,y-4); c.lineTo(ax+aw,y); c.lineTo(ax+aw-5,y+4); c.stroke();
          var cx=ax+aw+ic*.1+ic*.44;
          c.fillStyle='#fff'; c.strokeStyle='#3E9E7E'; c.lineWidth=2; c.beginPath(); c.arc(cx,y,ic*.44,0,Math.PI*2); c.fill(); c.stroke();
          var ti=tArt[st]; if(gmReady(ti))c.drawImage(ti,cx-ic*.34,y-ic*.34,ic*.68,ic*.68);
          tx=cx+ic*.44;
        });
      });
    }
    function drawKit(c,g){
      var W=g.W, r=g.r;
      /* the doctor's bag, open along the bottom: a leaf-green bag with a heart clasp */
      c.save(); c.shadowColor='rgba(59,42,74,.22)'; c.shadowOffsetY=4; c.shadowBlur=8;
      var bg2=c.createLinearGradient(0,g.kitTop,0,g.kitTop+g.kitH); bg2.addColorStop(0,'#6FBF8E'); bg2.addColorStop(1,'#3E8E5E');
      c.fillStyle=bg2; gmRound(c,8,g.kitTop,W-16,g.kitH,22); c.fill(); c.restore();
      c.strokeStyle='#2B6B45'; c.lineWidth=3; gmRound(c,8,g.kitTop,W-16,g.kitH,22); c.stroke();
      c.fillStyle='rgba(255,255,255,.88)'; gmRound(c,16,g.kitTop+7,W-32,g.kitH-14,16); c.fill();
      c.fillStyle='#F5C842'; c.strokeStyle='#B8861E'; c.lineWidth=2; c.beginPath(); var hx=W/2, hy=g.kitTop-2; c.moveTo(hx,hy+8); c.bezierCurveTo(hx-14,hy-2,hx-7,hy-12,hx,hy-5); c.bezierCurveTo(hx+7,hy-12,hx+14,hy-2,hx,hy+8); c.fill(); c.stroke();
      for(var k=0;k<nt;k++){
        var x=g.tx(k), y=g.ty(k), t=tools[k], out=held&&held.k===k&&held.drag;
        if(toolShake[k]>=0)x+=Math.sin(toolShake[k]*40)*5*(1-toolShake[k]/.4);
        c.save();
        if(sel===k){c.fillStyle='#FFE58A';c.beginPath();c.arc(x,y,r+6,0,Math.PI*2);c.fill();}
        c.fillStyle='#fff'; c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill();
        c.strokeStyle=sel===k?'#B8467A':'#3E9E7E'; c.lineWidth=sel===k?4:2.5; c.stroke();
        if(out)c.globalAlpha=.3;
        var im=tArt[t.id]; if(gmReady(im))c.drawImage(im,x-r*.74,y-r*.74,r*1.48,r*1.48);
        c.restore();
        gmText(c,t.label,x,y+r+g.fs*.75,g.fs,'#2F6B5A');
        if(kb)gmText(c,String(k+1),x-r*.78,y-r*.72,Math.max(11,g.fs*.85),'#6C5BC4');
      }
    }
    return {
      peek:function(){var g=lay();return {pats:pats.filter(seated).map(function(p){return {id:p.prob.id,step:p.step,need:p.prob.steps[p.step],frac:p.pat/p.max,x:p.x,state:p.state,seat:p.seat};}),tools:tools.map(function(t){return t.id;}),lay:g,give:function(k,seat){give(k,pats.filter(function(p){return seated(p)&&p.seat===seat;})[0]);}};},   /* for testing */
      input:function(n,down){
        if(!down||dead)return; kb=true; var g=lay();
        if(/^t\d$/.test(n)){var k=+n[1];if(k<nt){sel=sel===k?-1:k;if(sel>=0&&mem.sound)tone(587.33,0,.06,'sine',.06);}return;}
        if(n==='left')kbSeat=Math.max(0,kbSeat-1);
        if(n==='right')kbSeat=Math.min(g.S-1,kbSeat+1);
        if(n==='give'&&sel>=0){var p=pats.filter(function(q){return ready(q)&&q.seat===kbSeat;})[0];if(p){give(sel,p);sel=-1;}}
      },
      pointer:function(t,x,y){
        if(dead)return;
        var g=lay();
        if(t==='down'){
          kb=false;
          for(var k=0;k<nt;k++){if(Math.hypot(x-g.tx(k),y-g.ty(k))<g.r+8){held={k:k,x:x,y:y,sx:x,sy:y,drag:false};return;}}
          var p=patAt(g,x,y);
          if(p&&sel>=0){give(sel,p);sel=-1;}
          return;
        }
        if(!held)return;
        if(t==='move'){held.x=x;held.y=y;if(!held.drag&&Math.hypot(x-held.sx,y-held.sy)>g.r*.4){held.drag=true;sel=-1;if(mem.sound)tone(587.33,0,.06,'sine',.06);}return;}
        if(t==='up'){
          var h=held; held=null;
          if(!h.drag){sel=sel===h.k?-1:h.k;return;}   /* a tap picks the thing up; then tap a patient */
          var p2=patAt(g,x,y); if(p2)give(h.k,p2);
        }
      },
      update:function(dt){
        t2+=dt; var g=lay();
        for(var b=0;b<nt;b++)if(toolShake[b]>=0){toolShake[b]+=dt;if(toolShake[b]>.4)toolShake[b]=-1;}
        if(gingerNo>=0){gingerNo+=dt;if(gingerNo>.6)gingerNo=-1;}
        if(msg){msg.t+=dt;if(msg.t>1.6)msg=null;}
        for(var q=pats.length-1;q>=0;q--){
          var p=pats[q], sx=g.sx(p.seat); p.t+=dt;
          if(p.anim){p.anim.t+=dt;if(p.anim.t>1.2&&p.state!=='busy')p.anim=null;}
          if(p.shake>=0){p.shake+=dt;if(p.shake>.4)p.shake=-1;}
          if(p.state==='walk'){p.x-=Math.max(260,(p.x-sx)*3)*dt;if(p.x<=sx){p.x=sx;p.state='wait';}}
          else if(p.state==='wait'&&!dead){p.x=sx;p.pat-=dt;
            if(p.pat<=0){p.state='sad';p.t=0;K.sfx('miss');if(K.lose()<=0){dead=true;K.end();}}}
          else if(p.state==='busy'){p.x=sx;if(p.t>(p.prob.id==='spots'?.9:.6)){p.state='happy';p.t=0;helped++;K.score(helped);K.sfx('catch');}}
          else if(p.state==='happy'){if(p.t>.7){p.state='leave';p.t=0;}}
          else if(p.state==='leave'){if(p.t>.3)p.x-=300*dt;if(p.x<-g.pw*1.2)pats.splice(q,1);}
          else if(p.state==='sad'){if(p.t>.3)p.x+=120*dt;if(p.t>1.5)pats.splice(q,1);}
        }
        if(dead)return;
        nextIn-=dt;
        if(nextIn<=0){var fs=freeSeats(g);if(fs.length){arrive(g,pick(fs));nextIn=gap();}else nextIn=.4;}
      },
      draw:function(c){
        var g=lay(), W=g.W, H=g.H;
        if(!gmCover(c,bg,W,H)){c.fillStyle='#EAF7F1';c.fillRect(0,0,W,H);}
        c.fillStyle='rgba(255,255,255,.4)'; c.fillRect(0,0,W,H);
        /* leaf cushions for the patients to sit on */
        for(var s=0;s<g.S;s++){var x=g.sx(s);c.save();c.translate(x,g.base-2);gmShadow(c,0,6,g.pw*.42,8,.18);
          var lg=c.createRadialGradient(-10,-6,4,0,0,g.pw*.42);lg.addColorStop(0,'#C6EBA4');lg.addColorStop(1,'#4E9A3E');
          c.fillStyle=lg;c.beginPath();c.ellipse(0,0,g.pw*.42,11,0,0,Math.PI*2);c.fill();c.strokeStyle='#357A31';c.lineWidth=2;c.stroke();
          c.beginPath();c.moveTo(-g.pw*.36,0);c.lineTo(g.pw*.36,0);c.strokeStyle='rgba(53,122,49,.5)';c.stroke();c.restore();
          if(kb&&s===kbSeat){c.save();c.strokeStyle='#B8467A';c.lineWidth=4;c.setLineDash([10,6]);c.lineDashOffset=-t2*20;gmRound(c,x-g.slotW*.46,g.base-g.ph-g.pw*.7,g.slotW*.92,g.ph+g.pw*.7+18,18);c.stroke();c.restore();}}
        /* Ginger watches from the top corner and shakes her head at the wrong thing */
        if(gmReady(gin)){var sh=gingerNo>=0?Math.sin(gingerNo*30)*.12:0, bob=Math.sin(t2*2.4)*3;c.save();c.translate(42,58+bob);c.rotate(sh);c.drawImage(gin,-30,-44,60,80);c.restore();}
        drawSign(c,g);
        /* patients on the path behind the cushions first, so the ones sitting down are always in front */
        pats.slice().sort(function(a,b){return backOf(g,b)-backOf(g,a);}).forEach(function(p){drawPatient(c,g,p);});
        /* while dragging, the patient under the thing glows */
        if(held&&held.drag){var hp=patAt(g,held.x,held.y);if(hp){c.save();c.globalAlpha=.35+Math.sin(t2*8)*.12;c.fillStyle='#FFE58A';c.beginPath();c.ellipse(hp.x,g.base-g.ph*.45,g.pw*.55,g.ph*.6,0,0,Math.PI*2);c.fill();c.restore();}}
        drawKit(c,g);
        if(held&&held.drag){var im=tArt[tools[held.k].id], s2=g.r*1.9;gmShadow(c,held.x,held.y+s2*.55,s2*.3,6,.2);if(gmReady(im))c.drawImage(im,held.x-s2/2,held.y-s2/2-10,s2,s2);}
        if(msg){var a=msg.t<.15?msg.t/.15:msg.t>1.2?Math.max(0,(1.6-msg.t)/.4):1;gmText(c,msg.text,W/2,Math.max(30,g.base-g.ph-g.pw*.8-18),Math.max(20,Math.min(30,W*.05)),'#B8467A',a);}
      }
    };
  }
};
