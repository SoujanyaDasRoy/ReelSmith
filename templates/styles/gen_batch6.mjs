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

// ---------- paper-lantern ----------
pages['paper-lantern'] = page('Paper Lantern', ff('CG', 600, 'cormorant-garamond') + ff('CG', 500, 'cormorant-garamond'), '#0a1330', `
const TN={normal:'#ffc46a',ok:'#ffd590',accent:'#fff0b8',alert:'#ff6a4a',dim:'#a08a64'};
const ST={fam:'CG',fonts:['600 40px CG','500 40px CG'],fade:'rgba(10,19,48,',
 bg(t,idx,ls){const gr=g.createLinearGradient(0,0,0,1920);gr.addColorStop(0,'#0a1330');gr.addColorStop(.7,'#16254d');gr.addColorStop(1,'#0a1330');g.fillStyle=gr;g.fillRect(0,0,1080,1920);
  const fl=1+.06*Math.sin(7.3*t)*Math.sin(3.1*t);const lg=g.createRadialGradient(850,330,0,850,330,520);lg.addColorStop(0,'rgba(255,184,98,'+.45*fl+')');lg.addColorStop(1,'rgba(255,184,98,0)');g.fillStyle=lg;g.fillRect(0,0,1080,1500);
  [['#6a86c2',.35,980,70],['#3f5a92',.55,1090,60],['#1c2a58',.8,1190,50]].forEach(([c,a,y,amp],k)=>{g.globalAlpha=a;g.fillStyle=c;g.beginPath();g.moveTo(0,1290);for(let x=0;x<=1080;x+=30)g.lineTo(x,y-amp*Math.abs(Math.sin(x*.004+k*2+ (t*.03)*(k+1))));g.lineTo(1080,1290);g.fill();});g.globalAlpha=1;
  for(let k=0;k<26;k++){g.fillStyle='rgba(255,230,180,'+(.35+.3*Math.sin(t*2+k))+')';g.fillRect(rnd(k)*1080,200+rnd(k+9)*500,3,3);}},
 title(s,t,ls){g.fillStyle='#ffc46a';g.shadowColor='rgba(255,184,98,.8)';g.shadowBlur=22;g.font='500 32px CG';g.fillText(s.head[0].replace(/,$/,'').toUpperCase(),64,238);let f=120;g.font='600 '+f+'px CG';while(g.measureText(s.head[1]).width>940&&f>40){f-=2;g.font='600 '+f+'px CG';}g.fillText(s.head[1],60,238+f*.9);g.shadowBlur=0;},
 row(row,x,t,i){const age=t-x.ta,on=EZ.out(P(age,0,.5)),fl=1+.06*Math.sin(7.3*t+i)*Math.sin(3.1*t),X=60,W=960,Y=row.y+(1-on)*14;
  g.fillStyle='rgba(0,0,0,.35)';g.fillRect(X+6,Y+10,W,row.h);g.globalAlpha=x.tone==='dim'?.6:1;g.fillStyle='#0e1532';g.fillRect(X,Y,W,row.h);g.fillStyle='rgba(255,196,106,.55)';g.fillRect(X,Y,W,3);g.fillStyle='rgba(255,196,106,'+(.10*on*fl)+')';g.fillRect(X,Y,W,row.h);
  g.globalAlpha=on*(x.tone==='dim'?.7:1);g.shadowColor='rgba(255,184,98,.9)';g.shadowBlur=14*fl;const tc=TN[x.tone]||TN.normal;
  const r2={...row,y:Y};content(r2,x,X,W,t,{fam:'CG',w:600,bw:600,fg:tc,bar:tc,barBg:'rgba(255,196,106,.18)'});g.shadowBlur=0;g.globalAlpha=1;},
 end(ec,t,a,p){const X=60,W=960,Y=480-(1-p)*80;g.globalAlpha=a;g.fillStyle='#0e1532';g.fillRect(X,Y,W,420);g.fillStyle='rgba(255,196,106,.6)';g.fillRect(X,Y,W,4);g.shadowColor='rgba(255,184,98,.9)';g.shadowBlur=26;g.fillStyle='#ffd590';g.textAlign='center';g.font='600 170px CG';g.fillText(ec.lines[0],540,Y+190);g.font='600 48px CG';g.fillText(ec.lines[1],540,Y+280);g.font='500 30px CG';g.fillText(ec.lines[2],540,Y+340);g.shadowBlur=0;g.textAlign='left';g.globalAlpha=1;},
 cap(cap,a,t){g.globalAlpha=a;g.fillStyle='#070c20';g.fillRect(40,1296,1000,112);g.fillStyle='rgba(255,196,106,.5)';g.fillRect(40,1296,1000,3);g.font='600 46px CG';capParts(cap,540,1354,'#f4e6c4','#ffc46a');g.globalAlpha=1;}};
`);

// ---------- ink-wash ----------
pages['ink-wash'] = page('Ink Wash', ff('CG', 600, 'cormorant-garamond') + ff('CG', 600, 'cormorant-garamond', 'italic'), '#F2ECDE', `
const TN={normal:'rgba(20,17,16,.86)',ok:'rgba(20,17,16,.86)',accent:'#B02E22',alert:'#B02E22',dim:'rgba(20,17,16,.34)'};
const ST={fam:'CG',fonts:['600 40px CG','italic 600 40px CG'],fade:'rgba(242,236,222,',
 bg(t,idx,ls){g.fillStyle='#F2ECDE';g.fillRect(0,0,1080,1920);for(let k=0;k<70;k++){g.fillStyle='rgba(120,100,70,'+.03*rnd(k+3)+')';g.beginPath();g.ellipse(rnd(k)*1080,rnd(k+5)*1500,60+rnd(k+8)*160,30+rnd(k+2)*90,rnd(k)*3,0,7);g.fill();}
  // mountains dissolving into mist: far (qing) then near (dan), blank paper kept above
  const sh=(c,y,amp,seed,a)=>{g.fillStyle=c;g.beginPath();g.moveTo(0,1290);for(let x=0;x<=1080;x+=20)g.lineTo(x,y-amp*Math.pow(Math.abs(Math.sin(x*.0045+seed)),1.4)-amp*.4*Math.sin(x*.013+seed*3));g.lineTo(1080,1290);g.closePath();g.globalAlpha=a;g.fill();g.globalAlpha=1;};
  sh('rgba(60,66,72,.16)',1000,130,1,1);sh('rgba(40,42,46,.30)',1110,120,3,1);sh('rgba(20,18,18,.5)',1230,80,5,1);
  const mg=g.createLinearGradient(0,1060,0,1290);mg.addColorStop(0,'rgba(242,236,222,0)');mg.addColorStop(.5,'rgba(242,236,222,.75)');mg.addColorStop(1,'rgba(242,236,222,0)');g.fillStyle=mg;g.fillRect(0,1060,1080,230);},
 title(s,t,ls){g.fillStyle='rgba(20,17,16,.55)';g.font='italic 600 34px CG';g.fillText(s.head[0].replace(/,$/,''),70,236);let f=124;g.font='italic 600 '+f+'px CG';while(g.measureText(s.head[1]).width>800&&f>40){f-=2;g.font='italic 600 '+f+'px CG';}g.fillStyle='rgba(20,17,16,.9)';g.filter='blur('+(8*(1-EZ.out(P(ls,.1,.9))))+'px)';g.fillText(s.head[1],66,236+f*.92);g.filter='none';
  g.fillStyle='#B02E22';g.fillRect(900,200,84,84);g.fillStyle='#F2ECDE';g.font='600 52px CG';g.fillText('TK',912,262);},
 row(row,x,t,i){const age=t-x.ta,on=EZ.out(P(age,0,.5)),X=70,W=940;g.filter='blur('+(7*(1-on))+'px)';g.globalAlpha=on;
  const tc=TN[x.tone]||TN.normal;g.fillStyle='rgba(20,17,16,.7)';g.beginPath();g.ellipse(X+8,row.y+row.h/2,7,7,0,0,7);g.fill();
  // dry-brush stroke under the item, with flying white
  g.strokeStyle='rgba(20,17,16,.22)';g.lineWidth=4;for(let k=0;k<5;k++){g.beginPath();g.moveTo(X+30,row.y+row.h-6+k*1.4);g.lineTo(X+30+(W-60)*on*(.7+.3*rnd(k+i)),row.y+row.h-6+k*1.4);g.stroke();}
  content(row,x,X+14,W-14,t,{fam:'CG',w:600,bw:600,fg:tc,bar:'rgba(20,17,16,.78)',barBg:'rgba(20,17,16,.10)'});g.filter='none';g.globalAlpha=1;},
 end(ec,t,a,p){g.globalAlpha=a;g.filter='blur('+(8*(1-a))+'px)';g.textAlign='center';g.fillStyle='rgba(20,17,16,.92)';g.font='italic 600 190px CG';g.fillText(ec.lines[0],540,640);g.font='italic 600 54px CG';g.fillText(ec.lines[1],540,740);g.font='italic 600 32px CG';g.fillStyle='rgba(20,17,16,.6)';g.fillText(ec.lines[2],540,800);g.fillStyle='#B02E22';g.fillRect(480,860,90,90);g.fillStyle='#F2ECDE';g.font='600 58px CG';g.fillText('TK',525,925);g.textAlign='left';g.filter='none';g.globalAlpha=1;},
 cap(cap,a,t){g.globalAlpha=a;g.fillStyle='#B02E22';g.fillRect(70,1340,14,14);g.font='italic 600 52px CG';capParts(cap,560,1352,'rgba(20,17,16,.9)','#B02E22');g.globalAlpha=1;}};
`);

// ---------- shadow-puppet ----------
pages['shadow-puppet'] = page('Shadow Puppet', ff('CG', 600, 'cormorant-garamond') + ff('IB', 800, 'inter') + ff('IB', 700, 'inter'), '#1a0e08', `
const DY={normal:['#dc9d1e','#1a100a'],ok:['#4aa574','#1a100a'],accent:['#e8b43c','#1a100a'],alert:['#b8211a','#fbe7c2'],dim:['#e2bd80','#3a2a18']};
const ST={fam:'IB',fonts:['700 40px IB','800 40px IB','600 40px CG'],fade:'rgba(26,14,8,',
 bg(t,idx,ls){g.fillStyle='#1a0e08';g.fillRect(0,0,1080,1920);const fl=1+.06*Math.sin(7*t)+.03*Math.sin(17*t);
  const gr=g.createRadialGradient(540,700,60,540,700,900);gr.addColorStop(0,'rgba(255,226,160,'+(.95*Math.min(1,fl))+')');gr.addColorStop(.35,'rgba(240,196,120,.88)');gr.addColorStop(1,'rgba(110,60,24,.95)');g.fillStyle=gr;g.fillRect(30,170,1020,1130);
  g.strokeStyle='rgba(120,70,30,.10)';g.lineWidth=1;for(let x=30;x<1050;x+=6){g.beginPath();g.moveTo(x,170);g.lineTo(x,1300);g.stroke();}for(let y=170;y<1300;y+=6){g.beginPath();g.moveTo(30,y);g.lineTo(1050,y);g.stroke();}
  g.strokeStyle='#2a1608';g.lineWidth=14;g.strokeRect(30,170,1020,1130);},
 title(s,t,ls){g.fillStyle='#1a100a';g.beginPath();g.roundRect(56,196,968,200,10);g.fill();g.fillStyle='rgba(255,226,160,.7)';g.font='700 24px IB';g.fillText(s.head[0].replace(/,$/,'').toUpperCase(),84,234);let f=108;g.font='800 '+f+'px IB';while(g.measureText(s.head[1]).width>900&&f>40){f-=2;g.font='800 '+f+'px IB';}g.shadowColor='rgba(255,200,100,.9)';g.shadowBlur=16;g.fillStyle='#ffe6a8';g.fillText(s.head[1],80,234+f*.95);g.shadowBlur=0;},
 row(row,x,t,i){const age=t-x.ta,sc=1+1.6*(1-EZ.out(P(age,0,.5))),bl=30*(1-EZ.out(P(age,0,.5))),[dye,fg]=DY[x.tone]||DY.normal,X=60,W=960,Y=row.y;
  g.save();g.translate(540,Y+row.h/2);g.scale(sc,sc);g.translate(-540,-(Y+row.h/2));g.filter='blur('+bl+'px)';g.globalAlpha=Math.min(1,age*6);
  g.fillStyle=dye;g.globalCompositeOperation='multiply';g.beginPath();g.roundRect(X,Y,W,row.h,12);g.fill();g.globalCompositeOperation='source-over';
  g.strokeStyle='#1a100a';g.lineWidth=3;g.stroke();
  // carved lattice at both ends: holes shine through
  g.fillStyle='rgba(255,236,190,.9)';for(let k=0;k<Math.floor(row.h/16);k++){for(const hx of[X+10,X+W-26]){g.save();g.translate(hx+8,Y+12+k*16);g.rotate(Math.PI/4);g.fillRect(-4,-4,8,8);g.restore();}}
  content(row,x,X+20,W-40,t,{fam:'IB',w:700,fg:fg,bar:fg,barBg:'rgba(26,16,10,.2)'});g.restore();g.filter='none';g.globalAlpha=1;},
 end(ec,t,a,p){g.globalAlpha=a;g.fillStyle='#1a100a';g.beginPath();g.roundRect(80,480,920,440,16);g.fill();g.shadowColor='rgba(255,200,100,.9)';g.shadowBlur=24;g.fillStyle='#ffe6a8';g.textAlign='center';g.font='800 170px IB';g.fillText(ec.lines[0],540,680);g.font='700 46px IB';g.fillText(ec.lines[1],540,770);g.font='700 28px IB';g.fillText(ec.lines[2],540,830);g.shadowBlur=0;g.textAlign='left';g.globalAlpha=1;},
 cap(cap,a,t){g.globalAlpha=a;g.fillStyle='#1a100a';g.fillRect(56,1322,968,96);g.fillStyle='#c98a26';g.fillRect(56,1322,968,3);g.fillRect(56,1415,968,3);g.font='600 44px CG';capParts(cap,540,1370,'#f3e2bf','#ff9a5a');g.globalAlpha=1;}};
`);

// ---------- engraving ----------
pages['engraving'] = page('Engraving', ff('OS', 400, 'old-standard-tt') + ff('OS', 700, 'old-standard-tt') + ff('OS', 400, 'old-standard-tt', 'italic') + ff('CG', 600, 'cormorant-garamond', 'italic'), '#f1e8d2', `
const WASH={normal:'#d9962a',ok:'#7aa27e',accent:'#d9962a',alert:'#b4452e',dim:'#a89a80'};
const INK='#1c1510';
function hatch(x,y,w,h,dens,a){g.save();g.beginPath();g.rect(x,y,w,h);g.clip();g.strokeStyle='rgba(28,21,16,'+a+')';for(let k=-h;k<w;k+=Math.max(3,dens)){const u=(k+h)/(w+h);g.lineWidth=.4+1.6*Math.pow(Math.sin(Math.PI*u),.7);g.beginPath();g.moveTo(x+k,y+h);g.lineTo(x+k+h,y);g.stroke();}g.restore();}
const ST={fam:'OS',fonts:['400 40px OS','700 40px OS','italic 600 40px CG'],fade:'rgba(241,232,210,',
 bg(t,idx,ls){g.fillStyle='#f1e8d2';g.fillRect(0,0,1080,1920);for(let k=0;k<90;k++){g.fillStyle='rgba(154,106,52,'+.05*rnd(k)+')';g.beginPath();g.arc(rnd(k+1)*1080,rnd(k+2)*1500,3+rnd(k+3)*14,0,7);g.fill();}
  g.strokeStyle=INK;g.lineWidth=3;g.strokeRect(34,170,1012,1130);g.lineWidth=1;g.strokeRect(44,180,992,1110);
  g.fillStyle='#e8ddc2';g.fillRect(48,184,984,1102);g.globalCompositeOperation='multiply';g.fillStyle='#f1e8d2';g.fillRect(48,184,984,1102);g.globalCompositeOperation='source-over';},
 title(s,t,ls){const u=EZ.out(P(ls,0,.9));g.fillStyle=INK;g.font='400 24px OS';g.fillText(s.head[0].replace(/,$/,'').toUpperCase().split('').join(' '),84,240);let f=96;g.font='700 '+f+'px OS';while(g.measureText(s.head[1].toUpperCase()).width>900&&f>36)f-=2,g.font='700 '+f+'px OS';
  g.save();g.beginPath();g.rect(0,0,84+u*940,1920);g.clip();g.fillText(s.head[1].toUpperCase(),80,240+f*.95);g.restore();g.fillRect(84,240+f*.95+20,u*912,3);g.fillRect(84,240+f*.95+28,u*912,1);},
 row(row,x,t,i){const age=t-x.ta,u=EZ.out(P(age,0,.5)),wu=EZ.out(P(age,.25,1.4)),X=84,W=912,Y=row.y;g.globalAlpha=x.tone==='dim'?.6:1;
  // hand colour blooms over the plate, 2px off register
  g.globalCompositeOperation='multiply';g.globalAlpha*=.38*wu;g.fillStyle=WASH[x.tone]||WASH.normal;g.fillRect(X+2,Y+3,W*Math.min(1,wu*1.1),row.h-6);g.globalCompositeOperation='source-over';g.globalAlpha=x.tone==='dim'?.6:1;
  g.save();g.beginPath();g.rect(X,Y,W*u,row.h+4);g.clip();hatch(X,Y+row.h-14,W,12,5,.8);g.restore();
  g.strokeStyle=INK;g.lineWidth=1.6;g.beginPath();g.arc(X+26,Y+row.h/2-6,16,0,7);g.stroke();g.lineWidth=.8;g.beginPath();g.arc(X+26,Y+row.h/2-6,20,0,7);g.stroke();g.fillStyle=INK;g.font='700 20px OS';g.textAlign='center';g.fillText(String(i+1),X+26,Y+row.h/2);g.textAlign='left';
  g.globalAlpha*=P(age,.1,.4);content(row,x,X+50,W-50,t,{fam:'OS',w:700,bw:700,fg:x.tone==='alert'?'#7a1a0c':INK,bar:INK,barBg:'rgba(28,21,16,.12)'});g.globalAlpha=1;},
 end(ec,t,a,p){g.globalAlpha=a;g.strokeStyle=INK;g.lineWidth=3;g.beginPath();g.arc(540,700,260,0,7);g.stroke();g.lineWidth=1;g.beginPath();g.arc(540,700,272,0,7);g.stroke();g.fillStyle=INK;g.textAlign='center';g.font='700 130px OS';g.fillText(ec.lines[0],540,720);g.font='400 40px OS';g.fillText(ec.lines[1],540,790);g.font='italic 400 26px OS';g.fillText(ec.lines[2],540,840);g.textAlign='left';g.globalAlpha=1;},
 cap(cap,a,t){g.globalAlpha=a;g.fillStyle='#f6eedb';g.beginPath();for(let k=0;k<=40;k++){const x=70+k*23.5;g.lineTo(x,1306+(k%2?3:-2)*rnd(k));}for(let k=40;k>=0;k--){g.lineTo(70+k*23.5,1410+(k%2?-3:2)*rnd(k+9));}g.closePath();g.fill();g.strokeStyle='rgba(28,21,16,.3)';g.lineWidth=1;g.stroke();g.font='italic 600 52px CG';capParts(cap,540,1358,INK,'#a53a22');g.globalAlpha=1;}};
`);

// ---------- papercut-red ----------
pages['papercut-red'] = page('Papercut Red', ff('IB', 800, 'inter') + ff('IB', 700, 'inter'), '#f6ead2', `
const PC={normal:['#c8201a','#fbeed3'],ok:['#c8201a','#fbeed3'],accent:['#e0a526','#3a0d0a'],alert:['#7d0d10','#fbeed3'],dim:['#c8201a','#fbeed3']};
function corner(x,y,sx,sy){g.save();g.translate(x,y);g.scale(sx,sy);g.fillStyle='#c8201a';for(let r=90;r>10;r-=18){g.beginPath();g.arc(0,0,r,0,Math.PI/2);g.lineTo(0,0);g.fill();g.fillStyle=r%36===0?'#f6ead2':'#c8201a';}g.restore();}
const ST={fam:'IB',fonts:['700 40px IB','800 40px IB'],fade:'rgba(246,234,210,',
 bg(t,idx,ls){g.fillStyle='#f6ead2';g.fillRect(0,0,1080,1920);for(let k=0;k<60;k++){g.fillStyle='rgba(150,110,60,'+.04*rnd(k)+')';g.fillRect(rnd(k+1)*1080,rnd(k+2)*1500,20+rnd(k+4)*90,1);}
  g.strokeStyle='#c8201a';g.lineWidth=6;g.strokeRect(30,170,1020,1130);g.lineWidth=2;g.strokeRect(42,182,996,1106);corner(30,170,1,1);corner(1050,170,-1,1);corner(30,1300,1,-1);corner(1050,1300,-1,-1);},
 title(s,t,ls){const u=BACK(P(ls,0,.5),1.3);g.fillStyle='#8a2a22';g.font='700 26px IB';g.fillText(s.head[0].replace(/,$/,'').toUpperCase(),130,240);let f=108;g.font='800 '+f+'px IB';while(g.measureText(s.head[1]).width>800&&f>40)f-=2,g.font='800 '+f+'px IB';g.fillStyle='rgba(60,20,10,.15)';g.fillText(s.head[1],136,246+f*.9);g.fillStyle='#c8201a';g.save();g.translate(130,240+f*.9);g.scale(1,Math.max(.01,u));g.fillText(s.head[1],0,0);g.restore();},
 row(row,x,t,i){const age=t-x.ta,sl=1-EZ.out(P(age,0,.4)),[fill,fg]=PC[x.tone]||PC.normal,X=110+sl*-60,W=860,Y=row.y;g.globalAlpha=(x.tone==='dim'?.55:1)*Math.min(1,age*8);
  g.fillStyle='rgba(80,20,10,.22)';g.fillRect(X+5,Y+6,W,row.h);g.fillStyle=fill;g.fillRect(X,Y,W,row.h);
  // paper-cut: a row of round holes along top and bottom edges shows the paper behind
  g.fillStyle='#f6ead2';for(let k=0;k<W/26-1;k++){g.beginPath();g.arc(X+22+k*26,Y+6,4,0,7);g.fill();g.beginPath();g.arc(X+22+k*26,Y+row.h-6,4,0,7);g.fill();}
  if(x.tone==='ok'){g.beginPath();g.arc(X+W-34,Y+row.h/2,12,0,7);g.fill();}
  content(row,x,X+10,W-10,t,{fam:'IB',w:700,fg:fg,bar:fg,barBg:'rgba(255,255,255,.22)'});g.globalAlpha=1;},
 end(ec,t,a,p){g.globalAlpha=a;g.fillStyle='rgba(80,20,10,.22)';g.fillRect(125,505,830,430);g.fillStyle='#c8201a';g.fillRect(120,500,830,430);g.fillStyle='#f6ead2';for(let k=0;k<30;k++){g.beginPath();g.arc(140+k*27,515,5,0,7);g.fill();g.beginPath();g.arc(140+k*27,915,5,0,7);g.fill();}g.textAlign='center';g.font='800 170px IB';g.fillText(ec.lines[0],535,700);g.font='700 44px IB';g.fillText(ec.lines[1],535,780);g.font='700 28px IB';g.fillText(ec.lines[2],535,830);g.textAlign='left';g.globalAlpha=1;},
 cap(cap,a,t){g.globalAlpha=a;g.fillStyle='#c8201a';g.fillRect(56,1318,968,100);g.fillStyle='#f6ead2';g.fillRect(64,1326,952,84);g.fillStyle='#c8201a';g.fillRect(68,1330,944,76);g.fillStyle='#f6ead2';g.font='700 42px IB';capParts(cap,540,1368,'#fbeed3','#ffd36a');g.globalAlpha=1;}};
`);

// ---------- silkscreen-poster ----------
pages['silkscreen-poster'] = page('Silkscreen Poster', ff('JS', 700, 'josefin-sans') + ff('LG', 400, 'league-gothic'), '#f2e8d0', `
const INKS={navy:'#1c2b4a',orange:'#e8602c',teal:'#1f8a8a',mustard:'#e9b030',paper:'#f2e8d0'};
const BX={normal:[INKS.navy,INKS.paper],ok:[INKS.teal,INKS.paper],accent:[INKS.mustard,INKS.navy],alert:[INKS.orange,INKS.navy],dim:[INKS.paper,INKS.navy]};
const ST={fam:'JS',fonts:['700 40px JS','400 40px LG'],fade:'rgba(242,232,208,',
 bg(t,idx,ls){g.fillStyle=INKS.paper;g.fillRect(0,0,1080,1920);
  // stepped colour bands, paper-white gap between each band
  const cols=[INKS.mustard,INKS.orange,INKS.teal,INKS.navy];const r0=[340,270,200,130];
  g.save();g.beginPath();g.rect(30,170,1020,1130);g.clip();
  g.fillStyle=INKS.mustard;g.beginPath();g.arc(860,640,300,Math.PI,0);g.lineTo(1160,640);g.lineTo(560,640);g.fill();
  cols.forEach((c,k)=>{if(k===0)return;g.fillStyle=INKS.paper;g.beginPath();g.arc(860,640,r0[k]+10,Math.PI,0);g.fill();g.fillStyle=c;g.beginPath();g.arc(860,640,r0[k],Math.PI,0);g.fill();});
  [[INKS.teal,1020],[INKS.navy,1100],[INKS.orange,1180]].forEach(([c,y],k)=>{g.fillStyle=INKS.paper;g.fillRect(30,y-6,1020,1300);g.fillStyle=c;g.beginPath();g.moveTo(30,y);for(let x=30;x<=1050;x+=30)g.lineTo(x,y-40*Math.abs(Math.sin(x*.006+k*2)));g.lineTo(1050,1300);g.lineTo(30,1300);g.fill();});
  g.restore();g.strokeStyle=INKS.navy;g.lineWidth=6;g.strokeRect(30,170,1020,1130);},
 title(s,t,ls){const u=EZ.out(P(ls,0,.4));g.fillStyle=INKS.navy;g.font='700 28px JS';g.fillText(s.head[0].replace(/,$/,'').toUpperCase(),70,244);let f=150;g.font='400 '+f+'px LG';while(g.measureText(s.head[1].toUpperCase()).width>940&&f>50)f-=4,g.font='400 '+f+'px LG';g.fillStyle=INKS.orange;g.fillText(s.head[1].toUpperCase(),70+5*(1-u)+5,244+f*.85+5);g.fillStyle=INKS.navy;g.fillText(s.head[1].toUpperCase(),70+5*(1-u),244+f*.85);},
 row(row,x,t,i){const age=t-x.ta,u=EZ.out(P(age,0,.3)),[bg,fg]=BX[x.tone]||BX.normal,X=60,W=960,Y=row.y;g.save();g.beginPath();g.rect(X,Y,W*u,row.h);g.clip();
  g.fillStyle=INKS.orange;if(bg!==INKS.orange)g.fillRect(X+5,Y+5,W,row.h);g.fillStyle=bg;g.fillRect(X,Y,W,row.h);if(bg===INKS.paper){g.strokeStyle=INKS.navy;g.lineWidth=4;g.strokeRect(X,Y,W,row.h);}
  content(row,x,X,W,t,{fam:'JS',w:700,bw:700,fg:fg,bar:fg===INKS.paper?INKS.mustard:INKS.orange,barBg:'rgba(255,255,255,.2)'});g.restore();},
 end(ec,t,a,p){g.globalAlpha=a;g.fillStyle=INKS.orange;g.fillRect(85,505,920,430);g.fillStyle=INKS.navy;g.fillRect(80,500,920,430);g.fillStyle=INKS.paper;g.textAlign='center';g.font='400 240px LG';g.fillText(ec.lines[0],540,700);g.fillStyle=INKS.mustard;g.font='700 46px JS';g.fillText(ec.lines[1],540,780);g.fillStyle=INKS.paper;g.font='700 28px JS';g.fillText(ec.lines[2],540,835);g.textAlign='left';g.globalAlpha=1;},
 cap(cap,a,t){g.globalAlpha=a;g.fillStyle=INKS.navy;g.fillRect(56,1318,968,100);g.fillStyle=INKS.orange;g.fillRect(56,1318,968,6);g.font='700 40px JS';capParts(cap,540,1372,INKS.paper,INKS.mustard);g.globalAlpha=1;}};
`);

for (const [k, v] of Object.entries(pages)) fs.writeFileSync(R + `index_lemo__${k}.html`, v);
console.log(Object.keys(pages).join(', '));
