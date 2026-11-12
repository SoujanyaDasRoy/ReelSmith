import fs from 'fs'; import {execSync,spawnSync} from 'child_process';
const T=JSON.parse(fs.readFileSync('build/timings.json','utf8'));
// composed music (compose.mjs) replaces the built-in synth bed; sfx stay. --synth forces the old bed; --music-gain 0.6 sets the composed level
const COMPOSED=fs.existsSync('build/music_composed.wav')&&!process.argv.includes('--synth');
const mg=process.argv.indexOf('--music-gain'),MGAIN=mg>0?parseFloat(process.argv[mg+1]):0.6;
let SCR={scenes:[]};try{SCR=JSON.parse(fs.readFileSync('script.json','utf8'));}catch{}
const SR=44100, N=Math.ceil((T.total+1)*SR), L=new Float32Array(N);
let seed=7; const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const add=(t,fn,len,g=1)=>{const s=Math.floor(t*SR);for(let i=0;i<len*SR&&s+i<N;i++)L[s+i]+=g*fn(i/SR,i);};
// voice activity -> duck
const act=new Float32Array(Math.ceil(T.total+1)*100);
for(const s of T.scenes)for(const w of s.words)for(let k=Math.floor((w.t0-.05)*100);k<(w.t1+.15)*100;k++)if(k>=0)act[k]=1;
const duck=t=>{let a=0;const k=Math.floor(t*100);for(let j=-10;j<=10;j++)a+=act[Math.min(Math.max(k+j,0),act.length-1)];return 1-0.62*(a/21);};
// music
const BPM=104,B=60/BPM, scale=[0,1,4,5,7,8,11].map(x=>x), D=146.83;
const kick=(t,g)=>add(t,(x)=>Math.sin(2*Math.PI*(48*x+ 90*(1-Math.exp(-x*30))/30*0+ 70*Math.exp(-x*25)/25*0+ 0))*0,0);
const kick2=(t,g)=>add(t,(x)=>{const f=45+80*Math.exp(-x*28);return Math.sin(2*Math.PI*f*x)*Math.exp(-x*9)},0.35,g);
const tabla=(t,g,f)=>add(t,(x)=>Math.sin(2*Math.PI*f*(1+.5*Math.exp(-x*40))*x)*Math.exp(-x*22),0.25,g);
const hat=(t,g)=>add(t,(x)=>(rnd()*2-1)*Math.exp(-x*70),0.08,g);
const pluck=(t,f,g)=>{const n=Math.round(SR/f),buf=Float32Array.from({length:n},()=>rnd()*2-1);let p=0;add(t,(x,i)=>{const o=buf[p];buf[p]=.5*(buf[p]+buf[(p+1)%n])*.996;p=(p+1)%n;return o*Math.exp(-x*1.6)},1.6,g)};
const bass=(t,f,len,g)=>add(t,(x)=>Math.sin(2*Math.PI*f*x)*Math.min(1,x*40)*Math.exp(-x*1.2),len,g);
const bars=Math.ceil((T.total+1)/(B*4));
const arp=[0,2,3,4,3,2,4,6, 0,1,2,4,2,1,0,3];
for(let b=0;b<bars;b++)for(let s=0;s<16;s++){
  const t=b*4*B+s*B/4, intro=b==0?.5:1;
  if(s%4==0&&(s%8==0||b>1))kick2(t,.5*intro);
  if(s%8==4)tabla(t,.28,210); if(s==10||s==14)tabla(t,.16,320);
  if(s%2==0)hat(t,.07); if(s%4==2)hat(t,.05);
  if(s%2==0&&b>=1){const i=arp[(s/2+b*3)%16];pluck(t,D*Math.pow(2,scale[i%7]/12)*(i>=4?2:1),.16)}
  if(s==0)bass(t,D/2,B*3.5,.28);
}
for(let i=0;i<N;i++)L[i]*=(COMPOSED?0:0.34)*duck(i/SR);
// sfx
const whoosh=(t,g=.5)=>{let lp=0;add(t-.18,(x)=>{const e=Math.sin(Math.PI*Math.min(1,x/.4));lp+=(((rnd()*2-1)-lp)*(.02+.5*x));return lp*e*3},.4,g)};
const pop=(t,g=.45)=>add(t,(x)=>Math.sin(2*Math.PI*(500+900*x*4)*x)*Math.exp(-x*30),.18,g);
const ding=(t,g=.4)=>{for(const f of[1318,1976])add(t,(x)=>Math.sin(2*Math.PI*f*x)*Math.exp(-x*7),.7,g*.6)};
const hit=(t,g=.7)=>{add(t,(x)=>Math.sin(2*Math.PI*(60+120*Math.exp(-x*20))*x)*Math.exp(-x*6),.6,g);add(t,x=>(rnd()*2-1)*Math.exp(-x*30),.2,g*.5)};
const crash=(t,g=.7)=>{hit(t,g);add(t,x=>(rnd()*2-1)*Math.exp(-x*5)*.6,.9,g*.6);};
const buzz=(t,g=.4)=>add(t,(x)=>(Math.sign(Math.sin(2*Math.PI*110*x))*.5+Math.sin(2*Math.PI*115*x)*.5)*Math.min(1,x*50)*Math.exp(-x*4),.5,g);
const womp=(t,g=.5)=>{[[330,0],[311,.32],[294,.64],[262,.96]].forEach(([f,o],i)=>add(t+o,x=>(Math.sign(Math.sin(2*Math.PI*f*x*(1-.03*x)))*.35+Math.sin(2*Math.PI*f*x)*.65)*Math.exp(-x*(i==3?2.2:6)),i==3?1.1:.34,g))};
const tick=(t,g=.4)=>add(t,x=>Math.sin(2*Math.PI*1800*x)*Math.exp(-x*90),.05,g);
const thud=(t)=>hit(t,.3),err=(t)=>buzz(t,.14),ok=(t)=>ding(t,.2),pp=(t)=>pop(t,.2),no=()=>{};
const M={crash:thud,dup:err,fail:err,block:err,unique:ok,fast:ok,refund:ok,rumaal:ok,clock:no,wl:no,follow:ok,kismat:no,cry:no,msg:no,q:no};
// per-scene sfx map in script.json: "sfx": {"cueLabel":"thud|err|ok|pop|ding|crash|womp|tick|none"}; unknown cues fall back to the Tatkal map, then a soft pop
// real recorded sounds (node sfx.mjs get ...): "file:build/sfx/whoosh.wav@0.6" = path, @gain (default 0.6). Decoded with ffmpeg to mono 44.1 kHz.
const SAMPLES={};
const addSample=(t,spec)=>{const m=String(spec).match(/^file:(.+?)(?:@([0-9.]+))?$/);if(!m||!fs.existsSync(m[1])){console.error('sfx file missing: '+spec);return;}let b=SAMPLES[m[1]];if(!b){const r=spawnSync('ffmpeg',['-v','error','-i',m[1],'-f','f32le','-ac','1','-ar',String(SR),'-'],{maxBuffer:1<<28});b=SAMPLES[m[1]]=new Float32Array(r.stdout.buffer,r.stdout.byteOffset,Math.floor(r.stdout.length/4));}const g=m[2]?parseFloat(m[2]):0.6,s0=Math.floor(t*SR);for(let i=0;i<b.length&&s0+i<N;i++)L[s0+i]+=b[i]*g;};
const SFX={thud,err,ok,pop:pp,ding:(t)=>ding(t,.2),crash:(t)=>crash(t,.5),womp:(t)=>womp(t,.4),tick:(t)=>tick(t,.2),none:no};
for(const s of T.scenes){ const own=(SCR.scenes.find(x=>x.id===s.id)||{}).sfx||{}; if(s.start>0){if(SCR.sfx_scene_start)addSample(s.start+.05,SCR.sfx_scene_start);else whoosh(s.start+.2,.12);} for(const[k,t]of Object.entries(s.cues)){if(k==='start')continue;if(typeof own[k]==='string'&&own[k].startsWith('file:'))addSample(t,own[k]);else((SFX[own[k]])||(own[k]===undefined?(M[k]||pp):no))(t);} }
// clock ticks in hook
if(T.scenes[0].cues.clock!==undefined)for(let i=0;i<6;i++)tick(T.scenes[0].cues.clock-.8+i*.14,.12);
// to wav
const buf=Buffer.alloc(44+N*2);buf.write('RIFF',0);buf.writeUInt32LE(36+N*2,4);buf.write('WAVEfmt ',8);buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(1,22);buf.writeUInt32LE(SR,24);buf.writeUInt32LE(SR*2,28);buf.writeUInt16LE(2,32);buf.writeUInt16LE(16,34);buf.write('data',36);buf.writeUInt32LE(N*2,40);
for(let i=0;i<N;i++)buf.writeInt16LE(Math.max(-32767,Math.min(32767,Math.tanh(L[i])*32767*.9)),44+i*2);
fs.writeFileSync('build/music.wav',buf);
const OFF=COMPOSED?2:1;
const ins=(COMPOSED?'-i build/music_composed.wav ':'')+T.audio.map(a=>`-i ${a.f}`).join(' ');
const fl=T.audio.map((a,i)=>`[${i+OFF}:a]adelay=${Math.round(a.t*1000)}|${Math.round(a.t*1000)},volume=1.9[v${i}]`).join(';');
const mix=`${fl};[0:a]volume=1[m];${COMPOSED?`[1:a]volume=${MGAIN}[mc];`:''}[m]${COMPOSED?'[mc]':''}${T.audio.map((_,i)=>`[v${i}]`).join('')}amix=inputs=${T.audio.length+1+(COMPOSED?1:0)}:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=7[o]`;
fs.writeFileSync('build/mix.txt',mix);
execSync(`ffmpeg -y -loglevel error -i build/music.wav ${ins} -/filter_complex build/mix.txt -map "[o]" -t ${T.total.toFixed(2)} build/audio.wav`);
console.log('audio ok'+(COMPOSED?' (composed music, gain '+MGAIN+')':' (built-in synth bed)'));
