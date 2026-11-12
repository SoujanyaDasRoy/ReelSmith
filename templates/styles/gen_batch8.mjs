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
// ---------- vox editorial collage ----------
pages['explainer-collage'] = page('Vox Explainer Collage', ff('LG', 400, 'league-gothic') + ff('IB', 700, 'inter') + ff('IB', 800, 'inter'), '#c0392b', `
const ACC='#c0392b',INKC='#22201e',PAPER='#f1e6d0';
const TC={normal:INKC,ok:'#2f6b4f',accent:ACC,alert:ACC,dim:'#8a8174'};
function halftone(x,y,w,h,col,a,step){g.save();g.beginPath();g.rect(x,y,w,h);g.clip();g.fillStyle=col;g.globalAlpha=a;for(let j=0;j*step<h+step;j++)for(let i=0;i*step<w+step;i++){const d=(i/(w/step)+ (1-j/(h/step)))/2;const r=step*.5*Math.max(0,1-d*1.1);if(r>.4){g.beginPath();g.arc(x+i*step+(j%2)*step/2,y+j*step,r,0,7);g.fill();}}g.restore();}
const ST={fam:'IB',fonts:['400 40px LG','700 40px IB','800 40px IB'],fade:'rgba(192,57,43,',
 bg(t,idx,ls){const sc=1+.03*P(ls,0,SD_DUR(idx));g.setTransform(sc,0,0,sc,(1-sc)*540,(1-sc)*740);
  g.fillStyle=ACC;g.fillRect(-60,-60,1200,2040);
  g.fillStyle='rgba(0,0,0,.25)';g.fillRect(46,190,1000,1112);g.fillStyle=PAPER;g.fillRect(36,176,1000,1112);
  for(let k=0;k<500;k++){g.fillStyle='rgba(90,60,30,'+.05*rnd(k)+')';g.fillRect(36+rnd(k+1)*1000,176+rnd(k+2)*1112,2,2);}
  for(let k=0;k<5;k++){g.fillStyle='rgba(120,90,50,.05)';g.beginPath();g.ellipse(36+rnd(k+10)*1000,176+rnd(k+11)*1112,150,90,rnd(k),0,7);g.fill();}
  halftone(640,1010,380,260,INKC,.35,14);
  const dx=Math.sin(t*.4)*5;g.fillStyle=ACC;g.strokeStyle=INKC;g.lineWidth=3;
  [()=>{g.beginPath();g.moveTo(930+dx,200);g.lineTo(1000+dx,200);g.lineTo(965+dx,262);g.closePath();},()=>{g.beginPath();g.arc(90+dx,1240,34,0,7);},()=>{g.beginPath();g.rect(900+dx,1180,70,70);}][idx%3]();g.fill();g.stroke();
  g.fillStyle='rgba(200,170,110,.75)';g.save();g.translate(80,190);g.rotate(-.5);g.fillRect(-60,-14,130,30);g.restore();g.save();g.translate(1000,190);g.rotate(.5);g.fillRect(-60,-14,130,30);g.restore();},
 title(s,t,ls){g.fillStyle=INKC;g.font='700 24px IB';g.fillText(s.head[0].replace(/,$/,'').toUpperCase().split('').join(' '),84,252);let f=150;g.font='400 '+f+'px LG';const T1=s.head[1].toUpperCase();while(g.measureText(T1).width>880&&f>50)f-=4,g.font='400 '+f+'px LG';const u=EZ.out(P(ls,0,.5));g.save();g.beginPath();g.rect(0,0,80+u*940,1920);g.clip();g.fillText(T1,80,252+f*.82);g.restore();g.fillStyle=ACC;g.fillRect(84,252+f*.82+18,u*220,8);},
 row(row,x,t,i){const age=t-x.ta,d=EZ.out(P(age,0,.35)),X=84+(1-d)*-90,W=860,Y=row.y,rot=(i%2?.012:-.01)*(x.tone==='dim'?.5:1);g.save();g.translate(X+W/2,Y+row.h/2);g.rotate(rot);g.translate(-W/2,-row.h/2);g.globalAlpha=Math.min(1,age*9)*(x.tone==='dim'?.75:1);
  g.fillStyle='rgba(0,0,0,.22)';g.fillRect(8,10,W,row.h);g.fillStyle='#fff';g.fillRect(-5,-5,W+10,row.h+10);g.fillStyle='#fbf6ea';g.fillRect(0,0,W,row.h);
  g.fillStyle=TC[x.tone]||INKC;g.fillRect(0,0,10,row.h);
  g.fillStyle='rgba(200,170,110,.8)';g.fillRect(W-80,-12,66,22);halftone(W-120,row.h-34,110,30,INKC,.3,8);
  content({...row,y:0},x,16,W-16,t,{fam:'IB',w:700,bw:800,fg:TC[x.tone]||INKC,bar:ACC,barBg:'rgba(34,32,30,.12)'});g.restore();g.globalAlpha=1;},
 end(ec,t,a,p){g.globalAlpha=a;g.save();g.translate(540,720);g.rotate(-.015);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(-418,-208,860,430);g.fillStyle='#fff';g.fillRect(-430,-220,860,440);g.fillStyle=ACC;g.fillRect(-420,-210,840,420);g.fillStyle=PAPER;g.textAlign='center';g.font='400 270px LG';g.fillText(ec.lines[0],0,40);g.font='700 44px IB';g.fillText(ec.lines[1],0,110);g.font='700 24px IB';g.fillText(ec.lines[2],0,160);g.restore();g.textAlign='left';g.globalAlpha=1;},
 cap(cap,a,t){g.setTransform(1,0,0,1,0,0);g.globalAlpha=a;let cf=52;g.font='800 52px IB';g.lineJoin='round';const plain=cap.text.split('*').join('');while(g.measureText(plain).width>980&&cf>30){cf-=2;g.font='800 '+cf+'px IB';}const parts=cap.text.split(/(\\*[^*]+\\*)/).filter(Boolean).map(p=>[p.replace(/\\*/g,''),p.startsWith('*')]);const tw=parts.reduce((s,p)=>s+g.measureText(p[0]).width,0);let px=540-tw/2;g.textBaseline='middle';for(const [v,acc] of parts){g.lineWidth=14;g.strokeStyle='#000';g.strokeText(v,px,1354);g.fillStyle=acc?'#ffcf4a':'#fff';g.fillText(v,px,1354);px+=g.measureText(v).width;}g.textBaseline='alphabetic';g.globalAlpha=1;}};
function SD_DUR(idx){return T.scenes[idx].dur;}
`);

for (const [k, v] of Object.entries(pages)) fs.writeFileSync(R + 'index_vox__' + k + '.html', v);
console.log(Object.keys(pages).join(', '));
