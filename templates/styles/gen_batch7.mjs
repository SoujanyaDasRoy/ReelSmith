import fs from 'fs';
const R = (process.env.REEL_DIR || '.') + '/';
const ff = (fam, w, pkg, style = 'normal') => `@font-face{font-family:${fam};font-weight:${w};font-style:${style};src:url(node_modules/@fontsource/${pkg}/files/${pkg}-latin-${w}-${style}.woff2)}`;
// shared prelude: rows layout + content drawing; each style supplies S = {fam, bg(), title(), box(), tone(), cap(), end(), post()}
const PRE = `
const T=window.T,cv=document.getElementById('cv'),g=cv.getContext('2d');
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
function wrapC(t,maxW){const words=String(t).split(' '),out=[];let cur='';for(const x of words){const tt=cur?cur+' '+x:x;if(g.measureText(tt).width>maxW&&cur){out.push(cur);cur=x;}else cur=tt;}out.push(cur);return out;}
const Y0=450,GAP=14;
function rowsOf(s){let y=Y0;const a=[];s.items.forEach(it=>{if(it.k==='endcard')return;const h=it.k==='val'?170:98;a.push({it,y,h});y+=h+GAP;});return a;}
// draw an item's content inside the box (X,Y,W,H): o={fam,w,fg,bar,barBg,sz}
function content(row,x,X,W,t,o){const it=row.it,Y=row.y,H=row.h,age=t-x.ta,fam=o.fam,wt=o.w||700;g.textBaseline='alphabetic';g.fillStyle=o.fg;
 if(it.k==='val'){g.font=wt+' 24px '+fam;g.fillText(it.label,X+26,Y+38);let f=118;g.font=(o.bw||800)+' '+f+'px '+fam;while(g.measureText(x.text).width>W-52&&f>40){f-=4;g.font=(o.bw||800)+' '+f+'px '+fam;}g.fillText(x.text,X+26,Y+H-22);}
 else if(it.k==='meter'){g.font=wt+' 32px '+fam;g.fillText(it.label,X+26,Y+H/2+11);const bx=X+W*.44,bw=W*.36;g.fillStyle=o.barBg;g.fillRect(bx,Y+H/2-13,bw,26);g.fillStyle=o.bar;g.fillRect(bx,Y+H/2-13,Math.max(4,bw*clamp(x.ratio)),26);g.fillStyle=o.fg;g.font=wt+' 30px '+fam;g.fillText(x.text,bx+bw+14,Y+H/2+10);}
 else if(it.k==='cmd'){const n=Math.max(0,Math.floor(age/.04));let f=34;g.font=wt+' '+f+'px '+fam;while(g.measureText(it.text).width>W-52&&f>20){f-=2;g.font=wt+' '+f+'px '+fam;}g.fillText(it.text.slice(0,n),X+26,Y+H/2+11);}
 else{let f=38;g.font=wt+' '+f+'px '+fam;let L=wrapC(x.text||'',W-52);while(L.length>2&&f>22){f-=2;g.font=wt+' '+f+'px '+fam;L=wrapC(x.text||'',W-52);}L.forEach((l,k)=>g.fillText(l,X+26,Y+H/2+11+(k-(L.length-1)/2)*f*1.16));if(x.flag==='strike')g.fillRect(X+26,Y+H/2+5,Math.min(g.measureText(L[0]).width,W-52),3);}
}
function capParts(cap,cx,y,fg,acc){const parts=cap.text.split(/(\\*[^*]+\\*)/).filter(Boolean);let tw=0;const ms=parts.map(p=>{const v=p.replace(/\\*/g,'');const m=g.measureText(v).width;tw+=m;return[v,m,p.startsWith('*')];});let px=cx-tw/2;g.textBaseline='middle';for(const [v,m,a] of ms){g.fillStyle=a?acc:fg;g.fillText(v,px,y);px+=m;}g.textBaseline='alphabetic';}
function frame(t,sc,s,idx){const c=sc.cues,ls=t-sc.start;g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.filter='none';
 const ec=s.items.find(i=>i.k==='endcard'),endOn=ec&&t>=AT(ec.at,c);
 ST.bg(t,idx,ls);ST.title(s,t,ls,idx);
 if(endOn){const a=AT(ec.at,c);ST.end(ec,t,P(t,a,a+.5),BACK(P(t,a,a+.45),1.4));}
 else rowsOf(s).forEach((row,i)=>{const x=RESOLVE(row.it,t,c);if(!x.vis)return;ST.row(row,x,t,i);});
 const cap=CAP(t,T.scenes);if(cap)ST.cap(cap,P(t,cap.t0,cap.t0+.18),t);
 g.globalAlpha=1;g.filter='none';ST.post&&ST.post(t);
 const f=Math.max(1-P(ls,0,.2),P(ls,sc.dur-.2,sc.dur));if(f>0){g.fillStyle=ST.fade+f+')';g.fillRect(0,0,1080,1920);}
}
window.renderAt=function(t){const idx=T.scenes.indexOf(SCENE_AT(t,T.scenes)),sc=T.scenes[idx];frame(t,sc,SD[sc.id],idx);};
window.ready=Promise.all(ST.fonts.map(f=>document.fonts.load(f,'A').catch(()=>[])));
`;
function page(title, fonts, bodyBg, st) {
  return `<!doctype html>\n<html><head><meta charset="utf-8"><title>Tatkal - ${title}</title>\n<style>\n${fonts}\n*{margin:0}html,body{width:1080px;height:1920px;overflow:hidden;background:${bodyBg}}canvas{position:absolute;left:0;top:0}\n</style></head><body>\n<canvas id="cv" width="1080" height="1920"></canvas>\n<script src="styles_data.js"></script>\n<script>\n${st}\n${PRE}\n</script></body></html>\n`;
}
const pages = {};
// ---------- briefing-board ----------
pages['briefing-board'] = page('Briefing Board', ff('CV', 600, 'caveat') + ff('IB', 700, 'inter') + ff('IB', 800, 'inter'), '#d9dcde', `
const MG={normal:'#2f6fd0',ok:'#2a9d5c',accent:'#e0a526',alert:'#d9362b',dim:'#8d9399'};
function idxSeed(x){return Math.floor(x.ta*10);}
const ST={fam:'IB',fonts:['600 40px CV','700 40px IB','800 40px IB'],fade:'rgba(238,240,238,',
 bg(t,idx,ls){g.fillStyle='#b9bcc0';g.fillRect(0,0,1080,1920);const gr=g.createLinearGradient(0,170,1080,1300);gr.addColorStop(0,'#f4f6f5');gr.addColorStop(.5,'#e8ebea');gr.addColorStop(1,'#f1f3f2');g.fillStyle=gr;g.fillRect(40,180,1000,1100);
  g.globalAlpha=.07;g.fillStyle='#1a1a1a';for(let k=0;k<14;k++){g.save();g.translate(rnd(k)*1000+40,rnd(k+3)*1000+200);g.rotate(rnd(k+5)*.6-.3);g.fillRect(0,0,120+rnd(k+8)*200,14+rnd(k+9)*30);g.restore();}g.globalAlpha=1;
  g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.moveTo(600,180);g.lineTo(840,180);g.lineTo(540,1280);g.lineTo(300,1280);g.fill();
  g.fillStyle='#8f9296';g.fillRect(40,1274,1000,14);g.fillStyle='#6b6e72';g.fillRect(40,1286,1000,6);g.fillStyle='#2f6fd0';g.fillRect(120,1262,70,12);g.fillStyle='#d9362b';g.fillRect(210,1262,60,12);g.fillStyle='#1d1d1d';g.fillRect(290,1262,64,12);},
 title(s,t,ls){const u=EZ.out(P(ls,.05,.9));g.fillStyle='#8d9399';g.font='600 38px CV';g.fillText(s.head[0].replace(/,$/,''),84,246);let f=132;g.font='600 '+f+'px CV';while(g.measureText(s.head[1]).width>900&&f>50)f-=2,g.font='600 '+f+'px CV';g.save();g.beginPath();g.rect(0,0,84+u*940,1920);g.clip();g.fillStyle='#1d1d1d';g.fillText(s.head[1],80,246+f*.75);g.restore();g.strokeStyle='#d9362b';g.lineWidth=6;g.lineCap='round';g.beginPath();g.moveTo(84,246+f*.75+22);g.quadraticCurveTo(300,246+f*.75+30,84+u*560,246+f*.75+18);g.stroke();},
 row(row,x,t,i){const age=t-x.ta,d=EZ.out(P(age,0,.3)),X=70+(i%2?10:0),W=900,Y=row.y-(1-d)*40,rot=(rnd(i+idxSeed(x))-.5)*.014,tc=MG[x.tone]||MG.normal;
  g.save();g.translate(X+W/2,Y+row.h/2);g.rotate(rot);g.scale(1+.06*(1-d),1+.06*(1-d));g.translate(-W/2,-row.h/2);g.globalAlpha=Math.min(1,age*7)*(x.tone==='dim'?.7:1);
  g.fillStyle='rgba(0,0,0,'+(.12+.1*d)+')';g.fillRect(6,8+8*(1-d),W,row.h);g.fillStyle='#fff';g.fillRect(0,0,W,row.h);g.fillStyle='#f0f0ee';g.fillRect(0,row.h-6,W,6);
  g.fillStyle=tc;g.beginPath();g.arc(26,22,11,0,7);g.fill();g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.arc(23,19,4,0,7);g.fill();
  const r2={...row,y:0};content(r2,x,16,W-16,t,{fam:'IB',w:700,fg:x.tone==='alert'?'#b4261c':'#1d1d1d',bar:tc,barBg:'#e5e7e8'});g.restore();g.globalAlpha=1;},
 end(ec,t,a,p){g.save();g.translate(540,700);g.rotate(-.02);g.globalAlpha=a;g.fillStyle='rgba(0,0,0,.15)';g.fillRect(-440,-190,900,420);g.fillStyle='#fff';g.fillRect(-450,-200,900,420);g.fillStyle='#d9362b';g.textAlign='center';g.font='600 190px CV';g.fillText(ec.lines[0],0,30);g.fillStyle='#1d1d1d';g.font='700 40px IB';g.fillText(ec.lines[1],0,100);g.font='700 24px IB';g.fillStyle='#6b6e72';g.fillText(ec.lines[2],0,150);g.restore();g.textAlign='left';g.globalAlpha=1;},
 cap(cap,a,t){g.globalAlpha=a;g.fillStyle='rgba(0,0,0,.15)';g.fillRect(66,1330,950,84);g.fillStyle='#fff';g.fillRect(60,1322,950,84);g.fillStyle='#2f6fd0';g.fillRect(60,1322,10,84);g.font='700 40px IB';capParts(cap,540,1364,'#1d1d1d','#d9362b');g.globalAlpha=1;}};
`);

// ---------- telestrator ----------
pages['telestrator'] = page('Telestrator', ff('RJ', 700, 'rajdhani') + ff('RJ', 600, 'rajdhani'), '#1d6b3a', `
const FILL={normal:'rgba(8,24,52,.88)',ok:'rgba(10,70,48,.9)',accent:'rgba(80,60,0,.9)',alert:'rgba(110,12,12,.92)',dim:'rgba(8,24,52,.55)'};
const ST={fam:'RJ',fonts:['700 40px RJ','600 40px RJ'],fade:'rgba(29,107,58,',
 bg(t,idx,ls){for(let k=0;k<12;k++){g.fillStyle=k%2?'#1f7a40':'#246b3a';g.fillRect(0,170+k*95,1080,95);}
  g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=5;g.strokeRect(70,260,940,980);g.beginPath();g.moveTo(70,750);g.lineTo(1010,750);g.stroke();g.beginPath();g.arc(540,750,150,0,7);g.stroke();g.strokeRect(300,260,480,170);g.strokeRect(300,1070,480,170);
  const v=g.createRadialGradient(540,740,200,540,740,900);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,10,0,.5)');g.fillStyle=v;g.fillRect(0,170,1080,1130);},
 title(s,t,ls){const u=EZ.out(P(ls,0,.4));g.save();g.beginPath();g.rect(0,0,60+u*960,1920);g.clip();g.fillStyle='#ffd400';g.fillRect(40,196,14,150);g.fillStyle='rgba(8,24,52,.92)';g.fillRect(54,196,960,150);g.fillStyle='#ffd400';g.font='600 30px RJ';g.fillText(s.head[0].replace(/,$/,'').toUpperCase(),84,236);let f=104;g.font='700 '+f+'px RJ';while(g.measureText(s.head[1].toUpperCase()).width>900&&f>40)f-=2,g.font='700 '+f+'px RJ';g.fillStyle='#fff';g.fillText(s.head[1].toUpperCase(),82,236+f*.78);g.restore();},
 row(row,x,t,i){const age=t-x.ta,d=EZ.out(P(age,0,.25)),X=60,W=960,Y=row.y;g.save();g.beginPath();g.rect(X,Y,W*d,row.h);g.clip();
  g.fillStyle=FILL[x.tone]||FILL.normal;g.fillRect(X,Y,W,row.h);g.fillStyle=x.tone==='alert'?'#ff4a3a':'#ffd400';g.fillRect(X,Y,12,row.h);
  content(row,x,X+14,W-14,t,{fam:'RJ',w:700,bw:700,fg:'#fff',bar:'#ffd400',barBg:'rgba(255,255,255,.18)'});g.restore();
  const a=P(age,.05,.55);if(a>0&&a<1.01){g.strokeStyle='#ffd400';g.lineWidth=6;g.lineCap='round';g.beginPath();g.moveTo(20,Y+row.h/2);g.lineTo(20+34*a,Y+row.h/2);g.stroke();if(a>.9){g.beginPath();g.moveTo(46,Y+row.h/2-9);g.lineTo(56,Y+row.h/2);g.lineTo(46,Y+row.h/2+9);g.stroke();}}
  if(row.it.k==='val'&&age>.4){const r=EZ.out(P(age,.4,1));g.strokeStyle='#ffd400';g.lineWidth=5;g.beginPath();g.ellipse(X+W*.34,Y+row.h-60,W*.3,70,-.04,-Math.PI/2,-Math.PI/2+Math.PI*2*r);g.stroke();}},
 end(ec,t,a,p){g.globalAlpha=a;g.fillStyle='rgba(8,24,52,.94)';g.fillRect(60,480,960,440);g.fillStyle='#ffd400';g.fillRect(60,480,960,10);g.textAlign='center';g.font='700 200px RJ';g.fillText(ec.lines[0],540,700);g.fillStyle='#fff';g.font='700 52px RJ';g.fillText(ec.lines[1],540,780);g.font='600 30px RJ';g.fillText(ec.lines[2],540,840);g.textAlign='left';g.globalAlpha=1;},
 cap(cap,a,t){g.globalAlpha=a;g.fillStyle='#ffd400';g.fillRect(40,1318,1000,6);g.fillStyle='rgba(8,24,52,.95)';g.fillRect(40,1324,1000,92);g.font='700 44px RJ';capParts(cap,540,1370,'#fff','#ffd400');g.globalAlpha=1;}};
`);

// ---------- newsreel ----------
pages['newsreel'] = page('Newsreel', ff('OS', 700, 'old-standard-tt') + ff('OS', 400, 'old-standard-tt'), '#cfc7b3', `
const ST={fam:'OS',fonts:['700 40px OS','400 40px OS'],fade:'rgba(20,18,16,',
 bg(t,idx,ls){const f=Math.floor(t*24),jx=(rnd(f)-.5)*4,jy=(rnd(f+9)-.5)*4;g.setTransform(1,0,0,1,jx,jy);const fl=.9+.1*rnd(f+3);g.fillStyle='rgb('+Math.round(214*fl)+','+Math.round(206*fl)+','+Math.round(184*fl)+')';g.fillRect(-10,-10,1100,1940);
  g.fillStyle='rgba(20,18,16,.9)';g.fillRect(0,0,1080,170);g.fillRect(0,1300,1080,620);g.strokeStyle='rgba(20,18,16,.85)';g.lineWidth=6;g.strokeRect(24,180,1032,1112);},
 title(s,t,ls){g.fillStyle='#e9dfc8';g.font='400 26px OS';g.fillText(s.head[0].replace(/,$/,'').toUpperCase().split('').join(' '),84,232);let f=100;g.font='700 '+f+'px OS';while(g.measureText(s.head[1].toUpperCase()).width>900&&f>36)f-=2,g.font='700 '+f+'px OS';g.fillStyle='#141210';g.fillText(s.head[1].toUpperCase(),80,232+f*.95);g.fillRect(84,232+f*.95+18,900,3);},
 row(row,x,t,i){const age=t-x.ta,X=70,W=940,Y=row.y;g.globalAlpha=Math.min(1,age*8)*(x.tone==='dim'?.6:1);g.fillStyle='#141210';g.fillRect(X,Y,W,row.h);g.strokeStyle='#e9dfc8';g.lineWidth=2;g.strokeRect(X+7,Y+7,W-14,row.h-14);
  content(row,x,X+8,W-16,t,{fam:'OS',w:700,bw:700,fg:x.tone==='alert'?'#ffb8a0':'#efe5cc',bar:'#efe5cc',barBg:'rgba(239,229,204,.2)'});g.globalAlpha=1;},
 end(ec,t,a,p){g.globalAlpha=a;g.fillStyle='#141210';g.fillRect(70,480,940,440);g.strokeStyle='#e9dfc8';g.lineWidth=3;g.strokeRect(84,494,912,412);g.fillStyle='#efe5cc';g.textAlign='center';g.font='700 150px OS';g.fillText(ec.lines[0],540,690);g.font='400 44px OS';g.fillText(ec.lines[1],540,770);g.font='400 26px OS';g.fillText(ec.lines[2],540,830);g.textAlign='left';g.globalAlpha=1;},
 cap(cap,a,t){g.globalAlpha=a;g.font='400 46px OS';capParts(cap,540,1358,'#e9dfc8','#ffd38a');g.globalAlpha=1;},
 post(t){g.setTransform(1,0,0,1,0,0);const f=Math.floor(t*24);const v=g.createRadialGradient(540,740,300,540,740,900);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');g.fillStyle=v;g.fillRect(0,0,1080,1920);
  for(let k=0;k<3;k++)if(rnd(f*3+k)>.55){g.fillStyle='rgba(255,255,255,'+(.25+.3*rnd(f+k))+')';g.fillRect(rnd(f+k*7)*1080,170,2,1130);}
  for(let k=0;k<70;k++){g.fillStyle=rnd(f+k+100)>.5?'rgba(255,255,255,.35)':'rgba(0,0,0,.35)';g.fillRect(rnd(f*7+k)*1080,170+rnd(f*3+k+50)*1130,2+rnd(k)*3,2+rnd(k+1)*3);}}};
`);

// ---------- midcentury-toon ----------
pages['midcentury-toon'] = page('Midcentury Toon', ff('B2', 700, 'baloo-2') + ff('B2', 600, 'baloo-2'), '#f3e6c8', `
const FL={normal:'#2a9d8f',ok:'#6aa84f',accent:'#e9c46a',alert:'#e2553b',dim:'#c9bfa5'};
function wob(x,y,w,h,s){g.beginPath();const j=(i)=>(rnd(s+i)-.5)*5;g.moveTo(x+j(1),y+j(2));g.lineTo(x+w/2+j(3),y+j(4));g.lineTo(x+w+j(5),y+j(6));g.lineTo(x+w+j(7),y+h/2+j(8));g.lineTo(x+w+j(9),y+h+j(10));g.lineTo(x+w/2+j(11),y+h+j(12));g.lineTo(x+j(13),y+h+j(14));g.lineTo(x+j(15),y+h/2+j(16));g.closePath();}
const ST={fam:'B2',fonts:['700 40px B2','600 40px B2'],fade:'rgba(243,230,200,',
 bg(t,idx,ls){g.fillStyle='#f3e6c8';g.fillRect(0,0,1080,1920);g.fillStyle='rgba(226,85,59,.18)';g.beginPath();g.ellipse(180,900,260,200,.4,0,7);g.fill();g.fillStyle='rgba(42,157,143,.16)';g.beginPath();g.ellipse(900,1120,300,170,-.3,0,7);g.fill();
  g.strokeStyle='#2a2320';g.lineWidth=4;for(let k=0;k<7;k++){const x=960+((k*53+t*10)%100)-50;g.beginPath();g.moveTo(x,230+k*20);g.lineTo(x+30,230+k*20);g.stroke();}},
 title(s,t,ls){const u=BACK(P(ls,0,.4),1.4);g.fillStyle='#2a2320';g.font='600 34px B2';g.fillText(s.head[0].replace(/,$/,''),80,240);let f=130;g.font='700 '+f+'px B2';while(g.measureText(s.head[1]).width>900&&f>50)f-=2,g.font='700 '+f+'px B2';g.save();g.translate(76,240+f*.8);g.scale(1,Math.max(.01,u));g.fillStyle='#e2553b';g.fillText(s.head[1],6,5);g.fillStyle='#2a2320';g.fillText(s.head[1],0,0);g.restore();},
 row(row,x,t,i){const age=t-x.ta,d=BACK(P(age,0,.3),1.5),X=60,W=960,Y=row.y;g.save();g.translate(540,Y+row.h/2);g.scale(Math.max(.01,d),Math.max(.01,d));g.translate(-540,-(Y+row.h/2));g.globalAlpha=x.tone==='dim'?.7:1;
  g.fillStyle=FL[x.tone]||FL.normal;wob(X+5,Y+5,W,row.h,i*3);g.fill();g.strokeStyle='#2a2320';g.lineWidth=5;g.lineJoin='round';wob(X,Y,W,row.h,i*3+50);g.stroke();
  content(row,x,X+8,W-8,t,{fam:'B2',w:700,bw:700,fg:x.tone==='accent'||x.tone==='dim'?'#2a2320':'#fffaf0',bar:'#2a2320',barBg:'rgba(0,0,0,.18)'});g.restore();g.globalAlpha=1;},
 end(ec,t,a,p){g.globalAlpha=a;g.fillStyle='#e9c46a';wob(100,495,890,430,7);g.fill();g.strokeStyle='#2a2320';g.lineWidth=6;wob(90,485,890,430,70);g.stroke();g.fillStyle='#2a2320';g.textAlign='center';g.font='700 190px B2';g.fillText(ec.lines[0],535,700);g.font='700 50px B2';g.fillText(ec.lines[1],535,780);g.font='600 30px B2';g.fillText(ec.lines[2],535,840);g.textAlign='left';g.globalAlpha=1;},
 cap(cap,a,t){g.globalAlpha=a;g.fillStyle='#fffaf0';g.strokeStyle='#2a2320';g.lineWidth=5;g.beginPath();g.roundRect(56,1316,968,100,40);g.fill();g.stroke();g.font='700 44px B2';capParts(cap,540,1366,'#2a2320','#e2553b');g.globalAlpha=1;}};
`);

// ---------- memphis-diorama ----------
pages['memphis-diorama'] = page('Memphis Diorama', ff('FR', 600, 'fredoka') + ff('FR', 700, 'fredoka'), '#fbf4e8', `
const FL={normal:'#ffffff',ok:'#2ec4b6',accent:'#ffd23f',alert:'#ff7aa8',dim:'#efe6d6'};
const ST={fam:'FR',fonts:['600 40px FR','700 40px FR'],fade:'rgba(251,244,232,',
 bg(t,idx,ls){g.fillStyle='#fbf4e8';g.fillRect(0,0,1080,1920);for(let k=0;k<400;k++){g.fillStyle='rgba(60,40,20,'+.05*rnd(k)+')';g.fillRect(rnd(k+1)*1080,rnd(k+2)*1920,2,2);}
  const dr=Math.sin(t*.6)*6;const cols=['#ff7aa8','#ffd23f','#3a86ff','#2ec4b6'];
  for(let k=0;k<9;k++){const x=rnd(k+30)<.5?30+rnd(k)*70:960+rnd(k)*70,y=200+rnd(k+5)*1050+dr*(k%2?1:-1);g.fillStyle=cols[k%4];g.strokeStyle='#1d1a2e';g.lineWidth=4;g.beginPath();if(k%3===0){g.arc(x,y,22,0,7);}else if(k%3===1){g.moveTo(x-22,y+18);g.lineTo(x+22,y+18);g.lineTo(x,y-22);g.closePath();}else{g.arc(x,y,22,Math.PI,0);g.closePath();}g.fill();g.stroke();}
  g.strokeStyle='#1d1a2e';g.lineWidth=10;g.lineJoin='round';g.beginPath();const w=(a,b)=>(rnd(a)-.5)*b;g.moveTo(44+w(1,10),184+w(2,10));g.bezierCurveTo(400,168+w(3,14),700,196+w(4,14),1036+w(5,10),182+w(6,10));g.bezierCurveTo(1050,500,1030,900,1040+w(7,10),1250+w(8,10));g.bezierCurveTo(700,1262,400,1240,40+w(9,10),1256);g.bezierCurveTo(32,900,52,500,44+w(1,10),184+w(2,10));g.stroke();},
 title(s,t,ls){const u=BACK(P(ls,0,.4),1.4);g.fillStyle='#ff7aa8';g.font='600 32px FR';g.fillText(s.head[0].replace(/,$/,'').toUpperCase(),84,244);let f=116;g.font='700 '+f+'px FR';while(g.measureText(s.head[1]).width>900&&f>50)f-=2,g.font='700 '+f+'px FR';g.save();g.translate(80,244+f*.8);g.scale(Math.max(.01,u),Math.max(.01,u));g.fillStyle='#3a86ff';g.fillText(s.head[1],6,6);g.fillStyle='#1d1a2e';g.fillText(s.head[1],0,0);g.restore();},
 row(row,x,t,i){const age=t-x.ta,d=BACK(P(age,0,.3),1.5),X=90,W=900,Y=row.y;g.save();g.translate(540,Y+row.h/2);g.scale(Math.max(.01,d),Math.max(.01,d));g.translate(-540,-(Y+row.h/2));g.globalAlpha=x.tone==='dim'?.75:1;
  g.fillStyle='#1d1a2e';g.beginPath();g.roundRect(X+8,Y+8,W,row.h,22);g.fill();g.fillStyle=FL[x.tone]||FL.normal;g.beginPath();g.roundRect(X,Y,W,row.h,22);g.fill();g.strokeStyle='#1d1a2e';g.lineWidth=4;g.stroke();
  content(row,x,X+6,W-6,t,{fam:'FR',w:600,bw:700,fg:'#1d1a2e',bar:'#3a86ff',barBg:'rgba(29,26,46,.15)'});g.restore();g.globalAlpha=1;},
 end(ec,t,a,p){g.globalAlpha=a;g.fillStyle='#1d1a2e';g.beginPath();g.roundRect(108,508,880,420,30);g.fill();g.fillStyle='#ffd23f';g.beginPath();g.roundRect(100,500,880,420,30);g.fill();g.strokeStyle='#1d1a2e';g.lineWidth=5;g.stroke();g.fillStyle='#1d1a2e';g.textAlign='center';g.font='700 180px FR';g.fillText(ec.lines[0],540,700);g.font='700 48px FR';g.fillText(ec.lines[1],540,780);g.font='600 28px FR';g.fillText(ec.lines[2],540,840);g.textAlign='left';g.globalAlpha=1;},
 cap(cap,a,t){g.globalAlpha=a;g.fillStyle='#1d1a2e';g.beginPath();g.roundRect(68,1334,950,92,26);g.fill();g.fillStyle='#fff';g.beginPath();g.roundRect(60,1326,950,92,26);g.fill();g.strokeStyle='#1d1a2e';g.lineWidth=4;g.stroke();g.font='700 42px FR';capParts(cap,535,1372,'#1d1a2e','#ff4f8a');g.globalAlpha=1;}};
`);

// ---------- glass-product ----------
pages['glass-product'] = page('Glass Product', ff('IB', 600, 'inter') + ff('IB', 700, 'inter') + ff('IB', 800, 'inter'), '#05070b', `
const TINT={normal:[200,220,255],ok:[110,240,200],accent:[255,215,120],alert:[255,110,100],dim:[160,170,190]};
const ST={fam:'IB',fonts:['600 40px IB','700 40px IB','800 40px IB'],fade:'rgba(5,7,11,',
 bg(t,idx,ls){g.fillStyle='#05070b';g.fillRect(0,0,1080,1920);const r=g.createRadialGradient(540,760,40,540,760,760);r.addColorStop(0,'rgba(40,60,90,.55)');r.addColorStop(1,'rgba(5,7,11,0)');g.fillStyle=r;g.fillRect(0,170,1080,1130);
  const sw=((t*.35)%1.6-.3)*1500;g.save();g.beginPath();g.rect(0,170,1080,1130);g.clip();const lg=g.createLinearGradient(sw-150,0,sw+150,300);lg.addColorStop(0,'rgba(255,255,255,0)');lg.addColorStop(.5,'rgba(255,255,255,.07)');lg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=lg;g.fillRect(0,170,1080,1130);g.restore();
  g.strokeStyle='rgba(255,255,255,.08)';g.lineWidth=1;g.beginPath();g.moveTo(0,1290);g.lineTo(1080,1290);g.stroke();},
 title(s,t,ls){const u=EZ.out(P(ls,0,.9));g.fillStyle='rgba(180,200,230,.6)';g.font='600 28px IB';g.fillText(s.head[0].replace(/,$/,'').toUpperCase().split('').join(' '),84,240);let f=104;g.font='800 '+f+'px IB';while(g.measureText(s.head[1]).width>900&&f>40)f-=2,g.font='800 '+f+'px IB';g.globalAlpha=u;g.fillStyle='#f3f7ff';g.shadowColor='rgba(120,180,255,.7)';g.shadowBlur=24;g.fillText(s.head[1],80,240+f*.9);g.shadowBlur=0;g.globalAlpha=1;},
 row(row,x,t,i){const age=t-x.ta,d=EZ.out(P(age,0,.4)),X=70,W=940,Y=row.y+(1-d)*30,tn=TINT[x.tone]||TINT.normal,c=(a)=>'rgba('+tn[0]+','+tn[1]+','+tn[2]+','+a+')';g.globalAlpha=d*(x.tone==='dim'?.65:1);
  const fg=g.createLinearGradient(X,Y,X,Y+row.h);fg.addColorStop(0,'rgba(255,255,255,.18)');fg.addColorStop(.5,c(.07));fg.addColorStop(1,'rgba(255,255,255,.05)');g.fillStyle=fg;g.beginPath();g.roundRect(X,Y,W,row.h,18);g.fill();
  const sweep=((t*.5+i*.13)%1.5-.25)*W;g.save();g.beginPath();g.roundRect(X,Y,W,row.h,18);g.clip();const sg=g.createLinearGradient(X+sweep-90,Y,X+sweep+90,Y+row.h);sg.addColorStop(0,'rgba(255,255,255,0)');sg.addColorStop(.5,'rgba(255,255,255,.22)');sg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=sg;g.fillRect(X,Y,W,row.h);g.restore();
  g.lineWidth=1.5;g.strokeStyle='rgba(255,90,90,.45)';g.beginPath();g.roundRect(X-1,Y,W,row.h,18);g.stroke();g.strokeStyle='rgba(90,160,255,.45)';g.beginPath();g.roundRect(X+1,Y,W,row.h,18);g.stroke();g.strokeStyle='rgba(255,255,255,.5)';g.beginPath();g.roundRect(X,Y,W,row.h,18);g.stroke();
  g.shadowColor=c(.8);g.shadowBlur=12;const r2={...row,y:Y};content(r2,x,X+6,W-6,t,{fam:'IB',w:700,bw:800,fg:'rgb('+Math.min(255,tn[0]+30)+','+Math.min(255,tn[1]+30)+','+Math.min(255,tn[2]+30)+')',bar:c(.95),barBg:'rgba(255,255,255,.12)'});g.shadowBlur=0;g.globalAlpha=1;},
 end(ec,t,a,p){g.globalAlpha=a;g.fillStyle='rgba(255,255,255,.07)';g.beginPath();g.roundRect(70,480,940,440,26);g.fill();g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=2;g.stroke();g.fillStyle='#f3f7ff';g.shadowColor='rgba(120,180,255,.8)';g.shadowBlur=30;g.textAlign='center';g.font='800 190px IB';g.fillText(ec.lines[0],540,700);g.font='700 48px IB';g.fillText(ec.lines[1],540,780);g.font='600 28px IB';g.fillText(ec.lines[2],540,840);g.shadowBlur=0;g.textAlign='left';g.globalAlpha=1;},
 cap(cap,a,t){g.globalAlpha=a;g.fillStyle='rgba(255,255,255,.08)';g.beginPath();g.roundRect(60,1316,960,100,50);g.fill();g.strokeStyle='rgba(255,255,255,.45)';g.lineWidth=1.5;g.stroke();g.font='700 42px IB';capParts(cap,540,1366,'#e8f0ff','#ffd778');g.globalAlpha=1;}};
`);

for (const [k, v] of Object.entries(pages)) fs.writeFileSync(R + 'index_lemo__' + k + '.html', v);
console.log(Object.keys(pages).join(', '));
