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
// ---------- kinetic type ----------
pages['own__kinetic-type'] = page('Kinetic Type', ff('IB', 800, 'inter') + ff('IB', 700, 'inter') + ff('IB', 500, 'inter'), '#050507', `
const KC={normal:'#ffffff',ok:'#7cf0b4',accent:'#ffd24a',alert:'#ff5a4d',dim:'#6b6b73'};
const ST={fam:'IB',fonts:['500 40px IB','700 40px IB','800 40px IB'],fade:'rgba(5,5,7,',
 bg(t,idx,ls){g.fillStyle='#050507';g.fillRect(0,0,1080,1920);const gx=540+Math.sin(t*.5)*140,gr=g.createRadialGradient(gx,640,0,gx,640,820);gr.addColorStop(0,'rgba(90,70,255,.22)');gr.addColorStop(1,'rgba(90,70,255,0)');g.fillStyle=gr;g.fillRect(0,170,1080,1130);},
 title(s,t,ls){const u=EZ.out(P(ls,0,.7));g.globalAlpha=u;g.fillStyle='#8c8c96';g.font='500 28px IB';g.fillText(s.head[0].replace(/,$/,'').toUpperCase().split('').join(' '),70,238+(1-u)*20);let f=112;g.font='800 '+f+'px IB';while(g.measureText(s.head[1]).width>940&&f>40)f-=2,g.font='800 '+f+'px IB';const w=g.measureText(s.head[1]).width,gr=g.createLinearGradient(66,0,66+w,0);gr.addColorStop(0,'#fff');gr.addColorStop(1,'#a99bff');g.fillStyle=gr;g.fillText(s.head[1],66,238+f*.92+(1-u)*20);g.globalAlpha=1;},
 row(row,x,t,i){const age=t-x.ta,d=EZ.out(P(age,0,.45)),X=70,W=940,Y=row.y+(1-d)*26;const col=KC[x.tone]||KC.normal;g.save();g.globalAlpha=d*(x.tone==='dim'?.7:1);g.filter='blur('+(10*(1-d))+'px)';
  const r2={...row,y:Y};g.fillStyle=col;content(r2,x,X-26,W+26,t,{fam:'IB',w:800,bw:800,fg:col,bar:col,barBg:'rgba(255,255,255,.12)'});g.restore();g.filter='none';
  g.fillStyle='rgba(255,255,255,.08)';g.fillRect(X,row.y+row.h-1,W*d,2);},
 end(ec,t,a,p){g.globalAlpha=a;g.textAlign='center';const gr=g.createLinearGradient(200,0,880,0);gr.addColorStop(0,'#fff');gr.addColorStop(1,'#ffd24a');g.fillStyle=gr;g.font='800 220px IB';g.fillText(ec.lines[0],540,700);g.fillStyle='#fff';g.font='700 52px IB';g.fillText(ec.lines[1],540,790);g.fillStyle='#8c8c96';g.font='500 30px IB';g.fillText(ec.lines[2],540,850);g.textAlign='left';g.globalAlpha=1;},
 cap(cap,a,t){g.globalAlpha=a;g.font='700 44px IB';capParts(cap,540,1366,'#f2f2f5','#ffd24a');g.globalAlpha=1;}};
`);

// ---------- system diagram ----------
pages['own__system-diagram'] = page('System Diagram', ff('JM', 500, 'jetbrains-mono') + ff('JM', 700, 'jetbrains-mono') + ff('IB', 700, 'inter') + ff('IB', 800, 'inter'), '#0a1224', `
const DC={normal:'#6fd3ff',ok:'#52e0a0',accent:'#ffd166',alert:'#ff6b6b',dim:'#5d6f94'};
const TAGS={text:'NODE',cmd:'CLI',val:'KPI',meter:'METRIC'};
const ST={fam:'IB',fonts:['500 24px JM','700 24px JM','700 40px IB','800 40px IB'],fade:'rgba(10,18,36,',
 bg(t,idx,ls){g.fillStyle='#0a1224';g.fillRect(0,0,1080,1920);g.strokeStyle='rgba(111,211,255,.07)';g.lineWidth=1;for(let x=0;x<=1080;x+=40){g.beginPath();g.moveTo(x,170);g.lineTo(x,1300);g.stroke();}for(let y=170;y<=1300;y+=40){g.beginPath();g.moveTo(0,y);g.lineTo(1080,y);g.stroke();}
  g.fillStyle='rgba(111,211,255,.5)';g.font='500 18px JM';g.fillText('ARCH / SCENE '+String(idx+1).padStart(2,'0'),60,160);},
 title(s,t,ls){const u=EZ.out(P(ls,0,.6));g.fillStyle='#6fd3ff';g.font='500 24px JM';g.fillText('// '+s.head[0].replace(/,$/,'').toLowerCase(),66,236);let f=96;g.font='800 '+f+'px IB';while(g.measureText(s.head[1]).width>940&&f>40)f-=2,g.font='800 '+f+'px IB';g.save();g.beginPath();g.rect(0,0,66+960*u,1920);g.clip();g.fillStyle='#f2f7ff';g.fillText(s.head[1],66,236+f*.95);g.restore();},
 row(row,x,t,i){const age=t-x.ta,d=EZ.out(P(age,0,.35)),X=110,W=860,Y=row.y,col=DC[x.tone]||DC.normal;g.save();g.globalAlpha=Math.min(1,age*8)*(x.tone==='dim'?.65:1);
  // connector from the previous node, with a dot travelling along it
  if(i>0){const cx=X+60,y0=Y-GAP-2,y1=Y;g.strokeStyle=col;g.globalAlpha*=.8;g.lineWidth=3;g.setLineDash([6,6]);g.beginPath();g.moveTo(cx,y0);g.lineTo(cx,y1);g.stroke();g.setLineDash([]);const k=((t*1.1+i*.37)%1);g.fillStyle='#fff';g.beginPath();g.arc(cx,y0+(y1-y0)*k,5,0,7);g.fill();g.globalAlpha=Math.min(1,age*8)*(x.tone==='dim'?.65:1);}
  g.fillStyle='rgba(111,211,255,.07)';g.beginPath();g.roundRect(X,Y,W,row.h,14);g.fill();g.strokeStyle=col;g.lineWidth=2.5;g.stroke();
  g.fillStyle=col;g.beginPath();g.roundRect(X+W-118,Y-13,110,26,6);g.fill();g.fillStyle='#0a1224';g.font='700 16px JM';g.textAlign='center';g.fillText(TAGS[row.it.k]||'NODE',X+W-63,Y+5);g.textAlign='left';
  content(row,x,X+8,W-8,t,{fam:'JM',w:700,bw:700,fg:'#e8f4ff',bar:col,barBg:'rgba(255,255,255,.1)'});g.restore();g.globalAlpha=1;},
 end(ec,t,a,p){g.globalAlpha=a;g.strokeStyle='#6fd3ff';g.lineWidth=3;g.beginPath();g.roundRect(100,480,880,420,24);g.stroke();g.fillStyle='rgba(111,211,255,.08)';g.fill();g.textAlign='center';g.fillStyle='#f2f7ff';g.font='800 190px IB';g.fillText(ec.lines[0],540,690);g.fillStyle='#6fd3ff';g.font='700 34px JM';g.fillText(ec.lines[1],540,770);g.font='500 22px JM';g.fillText(ec.lines[2],540,830);g.textAlign='left';g.globalAlpha=1;},
 cap(cap,a,t){g.globalAlpha=a;g.fillStyle='rgba(111,211,255,.1)';g.fillRect(40,1318,1000,96);g.fillStyle='#6fd3ff';g.fillRect(40,1318,6,96);g.font='700 42px IB';capParts(cap,540,1366,'#f2f7ff','#ffd166');g.globalAlpha=1;}};
`);

// ---------- clay toy ----------
pages['own__clay-toy'] = page('Clay Toy', ff('B2', 700, 'baloo-2') + ff('B2', 600, 'baloo-2'), '#ffe9f0', `
const CL={normal:['#ffffff','#ffd6e4'],ok:['#c6f5d9','#8fe0b2'],accent:['#ffe9a8','#ffd166'],alert:['#ffc2c2','#ff8f8f'],dim:['#f1e6ee','#dccfda']};
const ST={fam:'B2',fonts:['600 40px B2','700 40px B2'],fade:'rgba(255,233,240,',
 bg(t,idx,ls){const gr=g.createLinearGradient(0,0,1080,1920);gr.addColorStop(0,'#ffe3ee');gr.addColorStop(.5,'#e8e1ff');gr.addColorStop(1,'#d9f3ff');g.fillStyle=gr;g.fillRect(0,0,1080,1920);
  [['#ffb3d1',160,420,150],['#b9a8ff',930,610,120],['#9fe3ff',210,1180,130],['#ffe08a',900,1210,90]].forEach(([c,x,y,r],k)=>{const dy=Math.sin(t*.8+k)*10;const rg=g.createRadialGradient(x-r*.3,y+dy-r*.3,r*.1,x,y+dy,r);rg.addColorStop(0,'#ffffff');rg.addColorStop(.35,c);rg.addColorStop(1,c);g.globalAlpha=.55;g.fillStyle=rg;g.beginPath();g.arc(x,y+dy,r,0,7);g.fill();g.globalAlpha=1;});},
 title(s,t,ls){const u=BACK(P(ls,0,.45),1.5);g.fillStyle='#b05a86';g.font='600 36px B2';g.fillText(s.head[0].replace(/,$/,''),80,240);let f=126;g.font='700 '+f+'px B2';while(g.measureText(s.head[1]).width>880&&f>44)f-=2,g.font='700 '+f+'px B2';g.save();g.translate(78,240+f*.8);g.scale(Math.max(.01,u),Math.max(.01,u));g.fillStyle='rgba(120,60,100,.18)';g.fillText(s.head[1],4,6);g.fillStyle='#5a2d4f';g.fillText(s.head[1],0,0);g.restore();},
 row(row,x,t,i){const age=t-x.ta,d=BACK(P(age,0,.4),1.7),X=70,W=940,Y=row.y,[hi,lo]=CL[x.tone]||CL.normal;g.save();g.translate(540,Y+row.h/2);g.scale(Math.max(.01,d),Math.max(.01,d));g.translate(-540,-(Y+row.h/2));g.globalAlpha=x.tone==='dim'?.75:1;
  g.shadowColor='rgba(120,60,100,.28)';g.shadowBlur=26;g.shadowOffsetY=14;const gr=g.createLinearGradient(0,Y,0,Y+row.h);gr.addColorStop(0,hi);gr.addColorStop(1,lo);g.fillStyle=gr;g.beginPath();g.roundRect(X,Y,W,row.h,44);g.fill();g.shadowColor='transparent';
  g.fillStyle='rgba(255,255,255,.65)';g.beginPath();g.roundRect(X+14,Y+8,W-28,row.h*.34,26);g.fill();
  content(row,x,X+6,W-6,t,{fam:'B2',w:700,bw:700,fg:'#5a2d4f',bar:'#ff7aa8',barBg:'rgba(90,45,79,.14)'});g.restore();g.globalAlpha=1;},
 end(ec,t,a,p){g.globalAlpha=a;g.shadowColor='rgba(120,60,100,.3)';g.shadowBlur=30;g.shadowOffsetY=16;g.fillStyle='#ffe9a8';g.beginPath();g.roundRect(90,490,900,420,80);g.fill();g.shadowColor='transparent';g.fillStyle='#5a2d4f';g.textAlign='center';g.font='700 200px B2';g.fillText(ec.lines[0],540,700);g.font='700 50px B2';g.fillText(ec.lines[1],540,780);g.font='600 30px B2';g.fillText(ec.lines[2],540,840);g.textAlign='left';g.globalAlpha=1;},
 cap(cap,a,t){g.globalAlpha=a;g.shadowColor='rgba(120,60,100,.25)';g.shadowBlur=18;g.shadowOffsetY=8;g.fillStyle='#fff';g.beginPath();g.roundRect(60,1318,960,100,50);g.fill();g.shadowColor='transparent';g.font='700 44px B2';capParts(cap,540,1368,'#5a2d4f','#ff5c93');g.globalAlpha=1;}};
`);

// ---------- receipt ----------
pages['own__receipt'] = page('Receipt', ff('JM', 500, 'jetbrains-mono') + ff('JM', 700, 'jetbrains-mono'), '#d8d2c4', `
const ST={fam:'JM',fonts:['500 24px JM','700 24px JM'],fade:'rgba(216,210,196,',
 bg(t,idx,ls){g.fillStyle='#d8d2c4';g.fillRect(0,0,1080,1920);for(let k=0;k<300;k++){g.fillStyle='rgba(80,70,50,'+.05*rnd(k)+')';g.fillRect(rnd(k+1)*1080,rnd(k+2)*1920,2,2);}
  const X=110,W=860,top=184,bot=1290;g.fillStyle='rgba(0,0,0,.18)';g.fillRect(X+10,top+12,W,bot-top);g.fillStyle='#fbfaf6';g.beginPath();g.moveTo(X,top);for(let x=0;x<=W;x+=20)g.lineTo(X+x,top+(Math.floor(x/20)%2?0:12));g.lineTo(X+W,bot);for(let x=W;x>=0;x-=20)g.lineTo(X+x,bot-(Math.floor(x/20)%2?0:12));g.closePath();g.fill();
  g.fillStyle='rgba(0,0,0,.06)';for(let y=top+30;y<bot-20;y+=6)g.fillRect(X,y,W,1);
  g.fillStyle='#222';for(let k=0;k<46;k++){const w=2+Math.floor(rnd(k)*5);g.fillRect(X+110+k*14,bot-86,w,56);}},
 title(s,t,ls){const u=EZ.out(P(ls,0,.5));g.fillStyle='#222';g.font='500 20px JM';g.fillText('RECEIPT No. '+String(Math.floor(ls*0)+1).padStart(4,'0'),150,236);g.fillText('------------------------------------------',150,258);g.textAlign='left';let f=62;g.font='700 '+f+'px JM';while(g.measureText(s.head[1].toUpperCase()).width>780&&f>28)f-=2,g.font='700 '+f+'px JM';g.save();g.beginPath();g.rect(0,0,150+u*800,1920);g.clip();g.fillText(s.head[1].toUpperCase(),150,258+f+10);g.restore();g.font='500 20px JM';g.fillText(s.head[0].replace(/,$/,'').toUpperCase(),150,258+f+40);},
 row(row,x,t,i){const age=t-x.ta,d=EZ.out(P(age,0,.3)),X=150,W=780,Y=row.y-40;g.globalAlpha=Math.min(1,age*8)*(x.tone==='dim'?.5:1);g.save();g.beginPath();g.rect(X-10,Y-4,(W+20)*d,row.h+8);g.clip();
  g.strokeStyle='rgba(0,0,0,.35)';g.setLineDash([3,5]);g.beginPath();g.moveTo(X,Y+row.h-2);g.lineTo(X+W,Y+row.h-2);g.stroke();g.setLineDash([]);
  content({...row,y:Y},x,X-20,W+20,t,{fam:'JM',w:700,bw:700,fg:x.tone==='alert'?'#b3261e':'#1e1e1e',bar:'#1e1e1e',barBg:'rgba(0,0,0,.1)'});
  if(x.tone==='alert'||x.tone==='accent'){g.strokeStyle='#b3261e';g.lineWidth=3;g.strokeRect(X-6,Y+2,W+12,row.h-8);}g.restore();g.globalAlpha=1;},
 end(ec,t,a,p){g.globalAlpha=a;g.fillStyle='#222';g.textAlign='center';g.font='500 22px JM';g.fillText('============================',540,540);g.font='700 150px JM';g.fillText(ec.lines[0],540,700);g.font='700 34px JM';g.fillText(ec.lines[1],540,780);g.font='500 22px JM';g.fillText(ec.lines[2],540,830);g.fillText('THANK YOU',540,890);g.textAlign='left';g.globalAlpha=1;},
 cap(cap,a,t){g.globalAlpha=a;g.fillStyle='#fbfaf6';g.fillRect(60,1318,960,96);g.fillStyle='#222';g.fillRect(60,1318,960,5);g.font='700 40px JM';capParts(cap,540,1368,'#222','#b3261e');g.globalAlpha=1;}};
`);

// ---------- sticker collage ----------
pages['own__sticker-collage'] = page('Sticker Collage', ff('PP', 800, 'poppins') + ff('PP', 700, 'poppins'), '#c9a874', `
const SK={normal:'#3a86ff',ok:'#2ec4b6',accent:'#ffbe0b',alert:'#ff4d6d',dim:'#a89c8c'};
const ST={fam:'PP',fonts:['700 40px PP','800 40px PP'],fade:'rgba(201,168,116,',
 bg(t,idx,ls){g.fillStyle='#c9a874';g.fillRect(0,0,1080,1920);for(let k=0;k<700;k++){g.fillStyle='rgba(90,60,20,'+.07*rnd(k)+')';g.fillRect(rnd(k+1)*1080,rnd(k+2)*1920,3,1);}
  g.fillStyle='rgba(0,0,0,.12)';g.fillRect(0,170,1080,2);},
 title(s,t,ls){const u=BACK(P(ls,0,.45),1.5);g.save();g.translate(70,240);g.rotate(-.02);g.scale(Math.max(.01,u),Math.max(.01,u));g.fillStyle='#fff';g.font='700 30px PP';g.fillText(s.head[0].replace(/,$/,'').toUpperCase(),0,0);let f=108;g.font='800 '+f+'px PP';while(g.measureText(s.head[1]).width>900&&f>40)f-=2,g.font='800 '+f+'px PP';g.lineJoin='round';g.lineWidth=18;g.strokeStyle='#fff';g.strokeText(s.head[1],0,f*.95);g.fillStyle='#1d1b26';g.fillText(s.head[1],0,f*.95);g.restore();},
 row(row,x,t,i){const age=t-x.ta,d=BACK(P(age,0,.35),1.8),X=76,W=928,Y=row.y,rot=(i%2?.013:-.012),col=SK[x.tone]||SK.normal;g.save();g.translate(540,Y+row.h/2);g.rotate(rot*(2-d));g.scale(Math.max(.01,d),Math.max(.01,d));g.translate(-540,-(Y+row.h/2));g.globalAlpha=x.tone==='dim'?.8:1;
  g.shadowColor='rgba(0,0,0,.3)';g.shadowBlur=12;g.shadowOffsetY=7;g.fillStyle='#fff';g.beginPath();g.roundRect(X-12,Y-12,W+24,row.h+24,34);g.fill();g.shadowColor='transparent';
  g.fillStyle=col;g.beginPath();g.roundRect(X,Y,W,row.h,24);g.fill();g.fillStyle='rgba(255,255,255,.28)';g.beginPath();g.roundRect(X+10,Y+6,W-20,row.h*.3,16);g.fill();
  content(row,x,X+6,W-6,t,{fam:'PP',w:700,bw:800,fg:x.tone==='accent'?'#1d1b26':'#fff',bar:'#fff',barBg:'rgba(0,0,0,.2)'});g.restore();g.globalAlpha=1;},
 end(ec,t,a,p){g.globalAlpha=a;g.save();g.translate(540,700);g.rotate(-.03);g.shadowColor='rgba(0,0,0,.35)';g.shadowBlur=18;g.shadowOffsetY=10;g.fillStyle='#fff';g.beginPath();g.roundRect(-440,-230,880,460,60);g.fill();g.shadowColor='transparent';g.fillStyle='#ffbe0b';g.beginPath();g.roundRect(-420,-210,840,420,44);g.fill();g.fillStyle='#1d1b26';g.textAlign='center';g.font='800 190px PP';g.fillText(ec.lines[0],0,30);g.font='700 44px PP';g.fillText(ec.lines[1],0,100);g.font='700 26px PP';g.fillText(ec.lines[2],0,150);g.restore();g.textAlign='left';g.globalAlpha=1;},
 cap(cap,a,t){g.globalAlpha=a;g.shadowColor='rgba(0,0,0,.3)';g.shadowBlur=10;g.shadowOffsetY=6;g.fillStyle='#fff';g.beginPath();g.roundRect(56,1318,968,100,40);g.fill();g.shadowColor='transparent';g.font='700 42px PP';capParts(cap,540,1368,'#1d1b26','#ff4d6d');g.globalAlpha=1;}};
`);

// ---------- lab notebook ----------
pages['own__lab-notebook'] = page('Lab Notebook', ff('PH', 400, 'patrick-hand') + ff('GG', 700, 'gaegu'), '#8a7a66', `
const INK='#23314d',RED='#c8312b';
const ST={fam:'PH',fonts:['400 40px PH','700 40px GG'],fade:'rgba(138,122,102,',
 bg(t,idx,ls){g.fillStyle='#8a7a66';g.fillRect(0,0,1080,1920);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(58,196,990,1112);g.fillStyle='#fbfaf2';g.fillRect(48,184,990,1112);
  g.strokeStyle='rgba(90,140,200,.22)';g.lineWidth=1;for(let x=48;x<=1038;x+=30){g.beginPath();g.moveTo(x,184);g.lineTo(x,1296);g.stroke();}for(let y=184;y<=1296;y+=30){g.beginPath();g.moveTo(48,y);g.lineTo(1038,y);g.stroke();}
  g.strokeStyle='rgba(220,90,90,.5)';g.lineWidth=2;g.beginPath();g.moveTo(138,184);g.lineTo(138,1296);g.stroke();
  for(let y=230;y<1296;y+=120){g.fillStyle='#8a7a66';g.beginPath();g.arc(70,y,12,0,7);g.fill();g.strokeStyle='#bfc4cc';g.lineWidth=6;g.beginPath();g.moveTo(40,y);g.lineTo(98,y);g.stroke();}
  g.fillStyle='rgba(255,200,90,.8)';g.save();g.translate(940,200);g.rotate(.4);g.fillRect(-60,-14,120,30);g.restore();},
 title(s,t,ls){const u=EZ.out(P(ls,0,.8));g.fillStyle=RED;g.font='700 40px GG';g.fillText(s.head[0].replace(/,$/,''),160,248);let f=104;g.font='700 '+f+'px GG';while(g.measureText(s.head[1]).width>840&&f>40)f-=2,g.font='700 '+f+'px GG';g.save();g.beginPath();g.rect(0,0,160+u*880,1920);g.clip();g.fillStyle=INK;g.fillText(s.head[1],156,248+f*.82);g.restore();g.strokeStyle=RED;g.lineWidth=4;g.lineCap='round';g.beginPath();g.moveTo(160,248+f*.82+16);g.quadraticCurveTo(360,248+f*.82+26,160+u*560,248+f*.82+12);g.stroke();},
 row(row,x,t,i){const age=t-x.ta,d=EZ.out(P(age,0,.5)),X=160,W=860,Y=row.y;g.globalAlpha=Math.min(1,age*7)*(x.tone==='dim'?.55:1);
  // checkbox: tick for ok, cross for alert, dot otherwise
  g.strokeStyle=INK;g.lineWidth=3;g.strokeRect(X-6,Y+row.h/2-18,34,34);const ck=EZ.out(P(age,.2,.6));g.strokeStyle=x.tone==='alert'?RED:'#1f8a5b';g.lineWidth=5;g.lineCap='round';
  if(x.tone==='ok'){g.beginPath();g.moveTo(X,Y+row.h/2);g.lineTo(X+10*ck,Y+row.h/2+12*ck);if(ck>.5)g.lineTo(X+10+22*(ck-.5)*2,Y+row.h/2+12-30*(ck-.5)*2);g.stroke();}else if(x.tone==='alert'){g.beginPath();g.moveTo(X,Y+row.h/2-12);g.lineTo(X+22*ck,Y+row.h/2+10*ck);g.moveTo(X+22,Y+row.h/2-12);g.lineTo(X+22-22*ck,Y+row.h/2+10*ck);g.stroke();}
  content(row,x,X+34,W-34,t,{fam:'PH',w:400,bw:700,fg:x.tone==='alert'?RED:INK,bar:INK,barBg:'rgba(35,49,77,.12)'});
  if(x.tone==='accent'){g.strokeStyle='rgba(255,210,70,.7)';g.lineWidth=18;g.beginPath();g.moveTo(X+40,Y+row.h/2+10);g.lineTo(X+40+(W-120)*d,Y+row.h/2+10);g.stroke();}g.globalAlpha=1;},
 end(ec,t,a,p){g.globalAlpha=a;g.fillStyle=INK;g.textAlign='center';g.font='700 200px GG';g.fillText(ec.lines[0],560,700);g.strokeStyle=RED;g.lineWidth=7;g.lineCap='round';g.beginPath();g.moveTo(200,730);g.quadraticCurveTo(560,770,920,722);g.stroke();g.font='400 52px PH';g.fillText(ec.lines[1],560,830);g.font='400 32px PH';g.fillStyle='#667';g.fillText(ec.lines[2],560,890);g.textAlign='left';g.globalAlpha=1;},
 cap(cap,a,t){g.globalAlpha=a;g.fillStyle='#fffbe0';g.fillRect(60,1330,960,86);g.strokeStyle='rgba(35,49,77,.4)';g.lineWidth=2;g.strokeRect(60,1330,960,86);g.font='400 50px PH';capParts(cap,540,1376,INK,RED);g.globalAlpha=1;}};
`);

for (const [k, v] of Object.entries(pages)) fs.writeFileSync(R + (k.includes('__') ? 'index_' : 'index_lemo__') + k + '.html', v);
console.log(Object.keys(pages).join(', '));
