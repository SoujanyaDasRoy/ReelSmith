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
// ---------- bang explainer: visual journalism ----------
pages['bang__explainer-visual-journalism'] = page('Visual Journalism', ff('IB', 700, 'inter') + ff('IB', 800, 'inter') + ff('JM', 500, 'jetbrains-mono') + ff('JM', 700, 'jetbrains-mono'), '#0b0b0c', `
const HL='#ffd400';
const ST={fam:'IB',fonts:['700 40px IB','800 40px IB','500 24px JM','700 24px JM'],fade:'rgba(11,11,12,',
 bg(t,idx,ls){g.fillStyle='#0b0b0c';g.fillRect(0,0,1080,1920);g.strokeStyle='rgba(255,255,255,.05)';g.lineWidth=1;for(let x=0;x<1080;x+=54){g.beginPath();g.moveTo(x,170);g.lineTo(x,1300);g.stroke();}
  g.fillStyle='rgba(255,255,255,.05)';g.fillRect(0,170,1080,2);g.font='500 20px JM';g.fillStyle='rgba(255,255,255,.4)';g.fillText('FILE '+String(idx+1).padStart(2,'0')+' / REPORT',60,160);},
 title(s,t,ls){const u=EZ.out(P(ls,.05,.7));g.fillStyle='rgba(255,255,255,.55)';g.font='500 26px JM';g.fillText(s.head[0].replace(/,$/,'').toUpperCase(),60,236);let f=104;g.font='800 '+f+'px IB';while(g.measureText(s.head[1]).width>930&&f>40)f-=2,g.font='800 '+f+'px IB';const w=g.measureText(s.head[1]).width;g.fillStyle=HL;g.fillRect(52,236+f*.22,w*u+16,f*.82);g.save();g.beginPath();g.rect(0,0,60+(w+30)*u,1920);g.clip();g.fillStyle='#0b0b0c';g.fillText(s.head[1],60,236+f*.9);g.restore();},
 row(row,x,t,i){const age=t-x.ta,d=EZ.out(P(age,0,.3)),X=60,W=960,Y=row.y;g.globalAlpha=Math.min(1,age*8)*(x.tone==='dim'?.55:1);
  g.fillStyle='#17171a';g.fillRect(X,Y,W,row.h);g.fillStyle=x.tone==='alert'?'#ff4a3a':(x.tone==='ok'?'#37d67a':'#fff');g.fillRect(X,Y,6,row.h);
  g.font='500 18px JM';g.fillStyle='rgba(255,255,255,.45)';g.fillText('FIG.'+String(i+1).padStart(2,'0'),X+W-90,Y+24);
  g.setLineDash([8,8]);g.strokeStyle='rgba(255,212,0,.6)';g.lineWidth=2;g.beginPath();g.moveTo(X+W-100,Y+row.h-10);g.lineTo(X+W-100+90*d,Y+row.h-10);g.stroke();g.setLineDash([]);
  if(x.tone==='accent'||x.tone==='alert'){g.fillStyle='rgba(255,212,0,.28)';g.fillRect(X+22,Y+row.h/2-26,W*.55*d,44);}
  content(row,x,X+8,W-8,t,{fam:'IB',w:700,bw:800,fg:'#fff',bar:HL,barBg:'rgba(255,255,255,.14)'});g.globalAlpha=1;},
 end(ec,t,a,p){g.globalAlpha=a;g.fillStyle=HL;g.fillRect(60,480,960,430);g.fillStyle='#0b0b0c';g.textAlign='center';g.font='800 200px IB';g.fillText(ec.lines[0],540,700);g.font='700 46px IB';g.fillText(ec.lines[1],540,780);g.font='500 26px JM';g.fillText(ec.lines[2],540,840);g.textAlign='left';g.globalAlpha=1;},
 cap(cap,a,t){g.globalAlpha=a;g.fillStyle='#fff';g.fillRect(40,1318,1000,100);g.fillStyle=HL;g.fillRect(40,1318,10,100);g.font='700 44px IB';capParts(cap,540,1368,'#0b0b0c','#c2410c');g.globalAlpha=1;}};
`);

// ---------- bang explainer: white catalog ----------
pages['bang__explainer-white-catalog'] = page('White Catalog', ff('PP', 700, 'poppins') + ff('PP', 800, 'poppins') + ff('IS', 400, 'instrument-serif', 'italic') + ff('JM', 500, 'jetbrains-mono'), '#ffffff', `
const CT={normal:'#111',ok:'#0a7d4f',accent:'#c2410c',alert:'#d4161c',dim:'#8a8a8a'};
const ST={fam:'PP',fonts:['700 40px PP','800 40px PP','italic 400 40px IS','500 24px JM'],fade:'rgba(255,255,255,',
 bg(t,idx,ls){g.fillStyle='#fff';g.fillRect(0,0,1080,1920);g.strokeStyle='#e7e7e7';g.lineWidth=1;for(let x=0;x<=1080;x+=60){g.beginPath();g.moveTo(x,170);g.lineTo(x,1300);g.stroke();}for(let y=170;y<=1300;y+=60){g.beginPath();g.moveTo(0,y);g.lineTo(1080,y);g.stroke();}
  g.fillStyle='#111';g.font='500 18px JM';g.fillText('CATALOG / VOL.'+String(idx+1).padStart(2,'0'),60,160);},
 title(s,t,ls){const u=EZ.out(P(ls,0,.6));g.fillStyle='#8a8a8a';g.font='italic 400 40px IS';g.fillText(s.head[0].replace(/,$/,''),60,240);let f=112;g.font='800 '+f+'px PP';while(g.measureText(s.head[1]).width>940&&f>40)f-=2,g.font='800 '+f+'px PP';g.save();g.beginPath();g.rect(0,0,60+950*u,1920);g.clip();g.fillStyle='#111';g.fillText(s.head[1],60,240+f*.9);g.restore();
  g.strokeStyle='#d4161c';g.lineWidth=6;g.lineCap='round';g.beginPath();g.moveTo(64,240+f+12);g.bezierCurveTo(200,240+f+26,360,240+f+2,64+u*480,240+f+16);g.stroke();},
 row(row,x,t,i){const age=t-x.ta,d=EZ.out(P(age,0,.3)),X=60,W=960,Y=row.y+(1-d)*20;g.globalAlpha=Math.min(1,age*8)*(x.tone==='dim'?.6:1);
  g.fillStyle='rgba(0,0,0,.07)';g.fillRect(X+4,Y+6,W,row.h);g.fillStyle='#fff';g.fillRect(X,Y,W,row.h);g.strokeStyle='#111';g.lineWidth=2;g.strokeRect(X,Y,W,row.h);
  g.fillStyle='#111';g.fillRect(X,Y,70,26);g.fillStyle='#fff';g.font='500 16px JM';g.fillText('No.'+String(i+1).padStart(2,'0'),X+8,Y+18);
  content({...row,y:Y+12},x,X+6,W-6,t,{fam:'PP',w:700,bw:800,fg:CT[x.tone]||'#111',bar:'#111',barBg:'#ececec'});
  if(x.tone==='accent'||x.tone==='alert'){g.strokeStyle='#d4161c';g.lineWidth=4;g.beginPath();g.ellipse(X+W-70,Y+row.h/2,40,row.h*.36,-.15,0,Math.PI*2*d);g.stroke();}g.globalAlpha=1;},
 end(ec,t,a,p){g.globalAlpha=a;g.fillStyle='#111';g.fillRect(60,480,960,430);g.fillStyle='#fff';g.textAlign='center';g.font='800 200px PP';g.fillText(ec.lines[0],540,690);g.font='italic 400 56px IS';g.fillText(ec.lines[1],540,780);g.font='500 24px JM';g.fillText(ec.lines[2],540,840);g.textAlign='left';g.globalAlpha=1;},
 cap(cap,a,t){g.globalAlpha=a;g.fillStyle='#111';g.beginPath();g.roundRect(60,1322,960,92,46);g.fill();g.font='700 42px PP';capParts(cap,540,1368,'#fff','#ffd400');g.globalAlpha=1;}};
`);

// ---------- bang explainer: vintage sketch ----------
pages['bang__explainer-vintage-sketch'] = page('Vintage Sketch', ff('PF', 700, 'playfair-display-sc') + ff('OS', 400, 'old-standard-tt') + ff('OS', 700, 'old-standard-tt') + ff('CV', 600, 'caveat'), '#e6d5b0', `
const RUST='#9a3b1c';
const ST={fam:'OS',fonts:['700 40px PF','400 40px OS','700 40px OS','600 40px CV'],fade:'rgba(230,213,176,',
 bg(t,idx,ls){g.fillStyle='#e6d5b0';g.fillRect(0,0,1080,1920);for(let k=0;k<160;k++){g.fillStyle='rgba(120,80,30,'+.06*rnd(k)+')';g.beginPath();g.arc(rnd(k+1)*1080,rnd(k+2)*1920,4+rnd(k+3)*26,0,7);g.fill();}
  const v=g.createRadialGradient(540,740,300,540,740,980);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(90,50,10,.35)');g.fillStyle=v;g.fillRect(0,0,1080,1920);
  g.strokeStyle='rgba(70,40,15,.7)';g.lineWidth=3;g.strokeRect(36,176,1008,1118);g.lineWidth=1;g.strokeRect(46,186,988,1098);},
 title(s,t,ls){const u=EZ.out(P(ls,0,.9));g.fillStyle=RUST;g.font='600 40px CV';g.fillText(s.head[0].replace(/,$/,''),84,246);let f=96;g.font='700 '+f+'px PF';while(g.measureText(s.head[1]).width>900&&f>36)f-=2,g.font='700 '+f+'px PF';g.save();g.beginPath();g.rect(0,0,84+u*940,1920);g.clip();g.fillStyle='#2a1a0e';g.fillText(s.head[1],80,246+f*.9);g.restore();g.strokeStyle='rgba(42,26,14,.8)';g.lineWidth=2;g.beginPath();g.moveTo(84,246+f+14);g.lineTo(84+u*900,246+f+14);g.stroke();g.beginPath();g.moveTo(84,246+f+20);g.lineTo(84+u*900,246+f+20);g.stroke();},
 row(row,x,t,i){const age=t-x.ta,d=EZ.out(P(age,0,.4)),X=84,W=912,Y=row.y;g.globalAlpha=Math.min(1,age*7)*(x.tone==='dim'?.6:1);
  g.fillStyle='rgba(250,238,205,.8)';g.beginPath();g.moveTo(X,Y+3);for(let k=0;k<=24;k++)g.lineTo(X+k*W/24,Y+(k%2?-2:3)*rnd(k+i));g.lineTo(X+W,Y+row.h);for(let k=24;k>=0;k--)g.lineTo(X+k*W/24,Y+row.h+(k%2?3:-2)*rnd(k+i+9));g.closePath();g.fill();
  g.strokeStyle='rgba(42,26,14,.55)';g.lineWidth=1.5;g.stroke();
  content(row,x,X+8,W-8,t,{fam:'OS',w:700,bw:700,fg:x.tone==='alert'?RUST:'#2a1a0e',bar:RUST,barBg:'rgba(42,26,14,.15)'});
  if(x.tone==='alert'||x.tone==='accent'){g.strokeStyle=RUST;g.lineWidth=3;g.beginPath();g.ellipse(X+W-42,Y+row.h/2,26,26,0,0,Math.PI*2*d);g.stroke();g.fillStyle=RUST;g.font='600 44px CV';g.fillText('!',X+W-47,Y+row.h/2+14);}g.globalAlpha=1;},
 end(ec,t,a,p){g.globalAlpha=a;g.strokeStyle='#2a1a0e';g.lineWidth=4;g.strokeRect(100,480,880,430);g.lineWidth=1;g.strokeRect(112,492,856,406);g.fillStyle='#2a1a0e';g.textAlign='center';g.font='700 150px PF';g.fillText(ec.lines[0],540,690);g.font='400 44px OS';g.fillText(ec.lines[1],540,770);g.fillStyle=RUST;g.font='600 44px CV';g.fillText(ec.lines[2],540,840);g.textAlign='left';g.globalAlpha=1;},
 cap(cap,a,t){g.globalAlpha=a;g.fillStyle='rgba(250,238,205,.9)';g.fillRect(60,1322,960,92);g.strokeStyle='rgba(42,26,14,.5)';g.lineWidth=1.5;g.strokeRect(60,1322,960,92);g.font='600 54px CV';capParts(cap,540,1366,'#2a1a0e',RUST);g.globalAlpha=1;}};
`);

// ---------- bang explainer: cartoon collage ----------
pages['bang__explainer-cartoon-collage'] = page('Cartoon Collage', ff('B2', 700, 'baloo-2') + ff('GG', 700, 'gaegu'), '#f6ecd6', `
const PILL=['#ff8a5c','#35b6a7','#ffd25a','#a78bfa','#6bb6ff'];
const ST={fam:'B2',fonts:['700 40px B2','700 40px GG'],fade:'rgba(246,236,214,',
 bg(t,idx,ls){g.fillStyle='#f6ecd6';g.fillRect(0,0,1080,1920);for(let k=0;k<300;k++){g.fillStyle='rgba(120,90,50,'+.05*rnd(k)+')';g.fillRect(rnd(k+1)*1080,rnd(k+2)*1920,2,2);}
  const dr=Math.sin(t*.7)*8;g.fillStyle='#ffd25a';g.beginPath();for(let k=0;k<10;k++){const a=k*Math.PI/5-Math.PI/2,r=k%2?18:40;g.lineTo(940+Math.cos(a)*r,240+dr+Math.sin(a)*r);}g.closePath();g.fill();
  g.fillStyle='#35b6a7';g.beginPath();g.arc(90,1230-dr,34,0,7);g.arc(130,1240-dr,26,0,7);g.arc(60,1244-dr,22,0,7);g.fill();g.strokeStyle='#ff8a5c';g.lineWidth=7;g.lineCap='round';g.beginPath();g.moveTo(900,1200);g.quadraticCurveTo(940,1160+dr,980,1200);g.quadraticCurveTo(1020,1240-dr,1040,1190);g.stroke();},
 title(s,t,ls){const u=BACK(P(ls,0,.4),1.4);g.fillStyle='#35b6a7';g.font='700 46px GG';g.fillText(s.head[0].replace(/,$/,''),70,240);let f=124;g.font='700 '+f+'px B2';while(g.measureText(s.head[1]).width>860&&f>44)f-=2,g.font='700 '+f+'px B2';g.save();g.translate(66,240+f*.82);g.scale(Math.max(.01,u),Math.max(.01,u));g.fillStyle='#2a2036';g.fillText(s.head[1],0,0);g.restore();},
 row(row,x,t,i){const age=t-x.ta,d=BACK(P(age,0,.32),1.6),X=70,W=940,Y=row.y,col=PILL[i%5],rot=(i%2?.008:-.008);g.save();g.translate(540,Y+row.h/2);g.rotate(rot);g.scale(Math.max(.01,d),Math.max(.01,d));g.translate(-540,-(Y+row.h/2));g.globalAlpha=x.tone==='dim'?.6:1;
  g.fillStyle='rgba(0,0,0,.12)';g.beginPath();g.roundRect(X+5,Y+7,W,row.h,30);g.fill();g.fillStyle='#fffaf0';g.beginPath();g.roundRect(X,Y,W,row.h,30);g.fill();
  g.fillStyle=col;g.beginPath();g.roundRect(X+12,Y+12,64,row.h-24,22);g.fill();g.fillStyle='#fff';g.font='700 38px B2';g.textAlign='center';g.fillText(String(i+1),X+44,Y+row.h/2+13);g.textAlign='left';
  content(row,x,X+70,W-70,t,{fam:'B2',w:700,bw:700,fg:x.tone==='alert'?'#d6282c':'#2a2036',bar:col,barBg:'rgba(42,32,54,.12)'});g.restore();g.globalAlpha=1;},
 end(ec,t,a,p){g.globalAlpha=a;g.fillStyle='#ffd25a';g.beginPath();g.roundRect(80,490,920,420,60);g.fill();g.strokeStyle='#2a2036';g.lineWidth=6;g.stroke();g.fillStyle='#2a2036';g.textAlign='center';g.font='700 200px B2';g.fillText(ec.lines[0],540,700);g.font='700 50px B2';g.fillText(ec.lines[1],540,780);g.font='700 40px GG';g.fillText(ec.lines[2],540,840);g.textAlign='left';g.globalAlpha=1;},
 cap(cap,a,t){g.globalAlpha=a;g.fillStyle='#fffaf0';g.strokeStyle='#2a2036';g.lineWidth=5;g.beginPath();g.roundRect(60,1318,960,100,50);g.fill();g.stroke();g.font='700 44px B2';capParts(cap,540,1368,'#2a2036','#ff6a3a');g.globalAlpha=1;}};
`);

// ---------- dataviz ----------
pages['dataviz'] = page('Data Storytelling', ff('CV', 600, 'caveat') + ff('IB', 700, 'inter') + ff('IB', 800, 'inter'), '#f6efe0', `
const RED='#d63a2f',BLUE='#2d5fb0',GRAPH='#3a3a3a';
const ST={fam:'IB',fonts:['600 40px CV','700 40px IB','800 40px IB'],fade:'rgba(246,239,224,',
 bg(t,idx,ls){g.fillStyle='#f6efe0';g.fillRect(0,0,1080,1920);g.strokeStyle='rgba(60,50,30,.10)';g.lineWidth=1;for(let y=170;y<1300;y+=40){g.beginPath();g.moveTo(40,y);g.lineTo(1040,y);g.stroke();}
  g.strokeStyle=GRAPH;g.lineWidth=3;g.beginPath();g.moveTo(96,430);g.lineTo(96,1280);g.lineTo(1040,1280);g.stroke();},
 title(s,t,ls){const u=EZ.out(P(ls,0,.8));g.fillStyle='#777';g.font='600 40px CV';g.fillText(s.head[0].replace(/,$/,''),70,240);let f=108;g.font='800 '+f+'px IB';while(g.measureText(s.head[1]).width>940&&f>40)f-=2,g.font='800 '+f+'px IB';g.save();g.beginPath();g.rect(0,0,70+950*u,1920);g.clip();g.fillStyle='#1b1b1b';g.fillText(s.head[1],66,240+f*.9);g.restore();},
 row(row,x,t,i){const age=t-x.ta,d=EZ.out(P(age,0,.5)),Y=row.y,cy=Y+row.h/2,col=(x.tone==='alert'||x.tone==='accent')?RED:BLUE;g.globalAlpha=x.tone==='dim'?.55:1;
  g.fillStyle=col;g.beginPath();g.arc(96,cy,9,0,7);g.fill();g.strokeStyle=col;g.lineWidth=3;g.setLineDash([2,8]);g.lineCap='round';g.beginPath();g.moveTo(112,cy);g.lineTo(112+60*d,cy);g.stroke();g.setLineDash([]);
  g.globalAlpha*=P(age,.1,.4);const r2={...row,y:Y};content(r2,x,150,860,t,{fam:'CV',w:600,bw:700,fg:col===RED?RED:'#1b1b1b',bar:col,barBg:'rgba(0,0,0,.08)'});
  if(row.it.k==='val'){g.strokeStyle=RED;g.lineWidth=4;g.beginPath();g.ellipse(430,Y+row.h-62,250,62,-.03,-Math.PI*.9,-Math.PI*.9+Math.PI*2.05*d);g.stroke();}g.globalAlpha=1;},
 end(ec,t,a,p){g.globalAlpha=a;g.fillStyle='#1b1b1b';g.textAlign='center';g.font='800 200px IB';g.fillText(ec.lines[0],540,700);g.strokeStyle=RED;g.lineWidth=7;g.lineCap='round';g.beginPath();g.moveTo(200,730);g.quadraticCurveTo(540,760,880,722);g.stroke();g.font='700 46px IB';g.fillText(ec.lines[1],540,820);g.font='600 44px CV';g.fillStyle='#777';g.fillText(ec.lines[2],540,880);g.textAlign='left';g.globalAlpha=1;},
 cap(cap,a,t){g.globalAlpha=a;g.font='600 56px CV';capParts(cap,540,1360,'#1b1b1b',RED);g.fillStyle=BLUE;g.fillRect(260,1396,560,4);g.globalAlpha=1;}};
`);

// ---------- urban sketch ----------
pages['urban-sketch'] = page('Urban Sketch', ff('AD', 400, 'architects-daughter') + ff('IB', 800, 'inter'), '#f3eee2', `
const WASH={normal:'#7fb7d9',ok:'#9bc98a',accent:'#f0c05a',alert:'#e8806e',dim:'#c8c0b0'};
function pen(x0,y0,x1,y1,s,w){g.lineWidth=w||2;g.beginPath();g.moveTo(x0+(rnd(s)-.5)*6,y0+(rnd(s+1)-.5)*6);const mx=(x0+x1)/2+(rnd(s+2)-.5)*5,my=(y0+y1)/2+(rnd(s+3)-.5)*5;g.quadraticCurveTo(mx,my,x1+(rnd(s+4)-.5)*8,y1+(rnd(s+5)-.5)*8);g.stroke();}
const ST={fam:'AD',fonts:['400 40px AD','800 40px IB'],fade:'rgba(243,238,226,',
 bg(t,idx,ls){g.fillStyle='#f3eee2';g.fillRect(0,0,1080,1920);for(let k=0;k<200;k++){g.fillStyle='rgba(110,90,60,'+.05*rnd(k)+')';g.fillRect(rnd(k+1)*1080,rnd(k+2)*1920,2,2);}
  g.strokeStyle='#2b2b2b';g.lineCap='round';pen(70,1270,1010,1262,3,2.5);pen(120,1284,900,1280,7,1.5);g.fillStyle='rgba(200,170,110,.7)';g.save();g.translate(110,200);g.rotate(-.4);g.fillRect(-50,-12,110,26);g.restore();},
 title(s,t,ls){const u=EZ.out(P(ls,0,.8));g.fillStyle='#8a7f6a';g.font='400 34px AD';g.fillText(s.head[0].replace(/,$/,''),90,244);let f=96;g.font='400 '+f+'px AD';while(g.measureText(s.head[1]).width>900&&f>40)f-=2,g.font='400 '+f+'px AD';g.save();g.beginPath();g.rect(0,0,90+u*930,1920);g.clip();g.fillStyle='#2b2b2b';g.fillText(s.head[1],86,244+f*.85);g.restore();g.strokeStyle='#2b2b2b';pen(90,244+f+8,90+u*880,244+f+12,11,3);},
 row(row,x,t,i){const age=t-x.ta,d=EZ.out(P(age,0,.4)),X=84,W=912,Y=row.y;g.globalAlpha=x.tone==='dim'?.6:1;
  g.globalCompositeOperation='multiply';g.fillStyle=WASH[x.tone]||WASH.normal;g.globalAlpha*=.55;g.beginPath();g.moveTo(X+10,Y+14);g.lineTo(X+10+(W-30)*d,Y+8);g.lineTo(X+10+(W-30)*d,Y+row.h-6);g.lineTo(X+16,Y+row.h-10);g.closePath();g.fill();g.globalCompositeOperation='source-over';g.globalAlpha=x.tone==='dim'?.6:1;
  g.strokeStyle='#2b2b2b';const e=(a)=>a*d;pen(X,Y+4,X+e(W),Y+2,i*7+1,2.4);pen(X+e(W),Y+2,X+e(W)+3,Y+row.h,i*7+2,2.4);pen(X+e(W)+4,Y+row.h,X,Y+row.h+3,i*7+3,2.4);pen(X-2,Y+row.h,X+1,Y,i*7+4,2.4);
  g.strokeStyle='rgba(43,43,43,.35)';for(let k=0;k<6;k++)pen(X+W-90+k*12,Y+row.h-4,X+W-70+k*12,Y+row.h-28,i*3+k,1.2);
  g.globalAlpha*=P(age,.15,.45);content(row,x,X+8,W-8,t,{fam:'AD',w:400,bw:400,fg:'#2b2b2b',bar:'#2b2b2b',barBg:'rgba(43,43,43,.12)'});g.globalAlpha=1;},
 end(ec,t,a,p){g.globalAlpha=a;g.globalCompositeOperation='multiply';g.fillStyle='#f0c05a';g.beginPath();g.ellipse(540,700,420,220,-.04,0,7);g.fill();g.globalCompositeOperation='source-over';g.strokeStyle='#2b2b2b';pen(130,500,950,490,21,3);pen(130,910,950,905,22,3);g.fillStyle='#2b2b2b';g.textAlign='center';g.font='400 170px AD';g.fillText(ec.lines[0],540,710);g.font='400 46px AD';g.fillText(ec.lines[1],540,790);g.font='400 28px AD';g.fillText(ec.lines[2],540,840);g.textAlign='left';g.globalAlpha=1;},
 cap(cap,a,t){g.globalAlpha=a;g.font='400 50px AD';capParts(cap,540,1360,'#2b2b2b','#d2493a');g.globalAlpha=1;}};
`);

for (const [k, v] of Object.entries(pages)) fs.writeFileSync(R + (k.includes('__') ? 'index_' : 'index_lemo__') + k + '.html', v);
console.log(Object.keys(pages).join(', '));
