# Make a clean, Hindi-voiced Instagram explainer reel with code (Antigravity guide)

This file describes the exact workflow used to build `tatkal_reel.mp4`: a ~64s, 1080x1920, 30fps reel
that explains an Indian-scale system design problem (IRCTC Tatkal booking) with a Hindi voice-over,
English/Hinglish on-screen text, and clean "real UI" visuals.

You can use it three ways:
1. **Paste it as the prompt** in an Antigravity agent session, then add your topic (see "Starter prompt").
2. **Save it as a workspace rule/skill** (for example `.agent/rules/reel.md` or `.agent/skills/reel/SKILL.md`).
   Check Antigravity's current docs for the exact folder names; they may differ by version.
3. **Copy the whole `reel/` folder** (index.html, script.json, tts.mjs, audio.mjs, render.mjs) and just edit `script.json`
   and the scene functions.

---

## 0. What the pipeline is

```
script.json  --tts.mjs-->  build/parts/*.mp3 + build/timings.json   (Hindi voice + word timestamps + cue times)
timings.json --audio.mjs-> build/audio.wav                          (voice + soft music + soft SFX, loudness-normalised)
timings.json + index.html --render.mjs--> frames (headless Chrome) --ffmpeg--> tatkal_reel.mp4
```

Key idea: **every visual is a pure function of time** `renderAt(t)`, and **every beat is anchored to a spoken word**
(a "cue"), so visuals and voice never drift. Nothing is hand-timed in seconds.

## 1. Prerequisites (Windows/macOS/Linux)

- Node 18+ and `ffmpeg` + `ffprobe` on PATH.
- `npm i playwright node-edge-tts @fontsource/inter @fontsource/instrument-serif @fontsource/jetbrains-mono`
- A Chromium for Playwright. If `npx playwright install` is not possible, point `CHROME` at an installed
  chromium/headless-shell with `executablePath`. A version mismatch between the npm package and the cached browser
  is the most common launch failure.
- Internet access: `node-edge-tts` calls Microsoft's online Edge TTS service. **The script text is sent to that service.**
  Do not put anything private in the narration.
- No Python needed.

## 2. Project layout

```
reel/
  script.json        # scenes, Hindi narration, cue words, English captions
  tts.mjs            # makes voice parts + build/timings.json
  audio.mjs          # music + sfx + voice mix -> build/audio.wav
  index.html         # all visuals (one file), exposes window.renderAt(t) and window.ready
  render.mjs         # stills | full render
  build/             # generated (parts, timings.json, audio.wav, stills)
```

## 3. `script.json` (the single source of truth)

```json
{
  "scenes": [
    {
      "id": "hook",
      "parts": [{ "v": "M", "t": "सुबह दस बजे। बारह लाख लोग। और सीट? सिर्फ़ एक।" }],
      "cues": [["clock", "दस"], ["users", "बारह"], ["seat", "सिर्फ़"]],
      "caps": [["start", "Subah 10 baje. *Baarah lakh* log."], ["seat", "Aur seat *sirf ek*."]],
      "tail": 0.3
    }
  ],
  "voices": { "M": "hi-IN-MadhurNeural", "S": "hi-IN-SwaraNeural" }
}
```

- `parts[].t` is **Devanagari Hindi** for the voice. Write tech terms phonetically in Devanagari
  (रेडिस, शार्डिंग, आइडेम्पोटेंसी). Optional per part: `r` rate (default `+20%`), `p` pitch (e.g. `+14Hz`).
- `cues`: `[label, wordSubstring]`. The first narration word containing that substring gives the label its timestamp.
  `start` is added automatically (scene start + 0.3s). Punctuation is ignored when matching.
- `caps`: on-screen captions in **Roman Hinglish/English**, each starts at a cue time. `*word*` is the coral serif accent.
  One short line at a time. It is a paraphrase of what is said, not a word-for-word transcript.
- `tail`: extra hold (seconds) at the end of a scene so the punchline can be read before the fade.

### TTS rules that matter
- Sentence-final `।` `?` `!` make the voice pause ~0.9s. `tts.mjs` replaces them with commas before sending (but captions/cues keep the original words).
- The service returns word boundaries in ms. Next part starts at `previous last word end + 0.12s`; a scene ends at
  `last word end + 0.3s (+tail)`. This removed ~13s of dead air.
- The service can answer **HTTP 429**. Retry with back-off (4s, 8s, ...) and sleep 1.5s between calls.
- Cache is keyed by `build/parts/<scene>_<part>.mp3` plus a `.json` sidecar. **If you change a part's text, delete that mp3 and its `.json`**, or you will reuse stale audio. A half-written mp3 without a `.json` must be deleted.

## 4. `tts.mjs` (core logic)

```js
import {EdgeTTS} from 'node-edge-tts'; import fs from 'fs'; import {execSync} from 'child_process';
const S = JSON.parse(fs.readFileSync('script.json','utf8'));
fs.mkdirSync('build/parts',{recursive:true});
const LEAD=0.3, GAP=0.12, TAIL=0.3;
let T=0; const out={scenes:[],audio:[]};
for (const sc of S.scenes) {
  let t=T+LEAD; const words=[];
  for (const [i,p] of sc.parts.entries()) {
    const f=`build/parts/${sc.id}_${i}.mp3`;
    if (!fs.existsSync(f+'.json')) {
      const e=new EdgeTTS({voice:S.voices[p.v],lang:'hi-IN',outputFormat:'audio-24khz-96kbitrate-mono-mp3',
                           saveSubtitles:true,rate:p.r||'+20%',pitch:p.p||'default'});
      const spoken=p.t.replace(/[।?!.…]+/g,',').replace(/\s*,\s*/g,', ').replace(/(,\s*)+$/,'');
      for (let k=0;;k++){ try{ await e.ttsPromise(spoken,f); break }catch(err){ if(k>6) throw err; await new Promise(r=>setTimeout(r,4000*(k+1))) } }
      await new Promise(r=>setTimeout(r,1500));
    }
    const orig=p.t.split(/\s+/).filter(Boolean), sub=JSON.parse(fs.readFileSync(f+'.json','utf8'));
    out.audio.push({f,t});
    sub.forEach((w,k)=>words.push({w:orig[k]||w.part.trim(),t0:t+w.start/1000,t1:t+w.end/1000}));
    t=words[words.length-1].t1+GAP;
  }
  const end=t-GAP+TAIL+(sc.tail||0);
  const cues={start:T+LEAD};
  for (const [lab,key] of sc.cues){
    const norm=s=>s.replace(/[।?!.,]/g,'');
    const w=words.find(x=>norm(x.w).includes(norm(key))); if(!w) throw new Error(sc.id+' cue '+key); cues[lab]=w.t0;
  }
  const caps=(sc.caps||[]).map(([k,x])=>({t:cues[k]-(k==='start'?0:.04),text:x}));
  out.scenes.push({id:sc.id,start:T,dur:end-T,words,cues,caps}); T=end;
}
out.total=T; fs.writeFileSync('build/timings.json',JSON.stringify(out,null,1));
```

## 5. Visual system (`index.html`)

Style target: calm, Figma-tutorial look. **One idea per scene, small real-looking UI cards, lots of whitespace.**

Design tokens
- Background `#F1F1F4` with a faint plus-grid and a soft white radial glow. No dark mode, no gradients on cards.
- Ink `#17171F`, muted `#7A7A8A`, coral accent `#D9604C`, blue `#3B6EF5`, green `#1FA463`, red `#D93B3B`, amber `#C98A0B`.
- Fonts (via `@fontsource`): **Inter** 500/600/700 for UI, **Instrument Serif italic** for the coral headline word, **JetBrains Mono** for code/numbers.
- Card: white, radius 30px, shadow `0 18px 50px rgba(20,20,40,.08)`, 1px `#E8E8EE` border, padding 34x40, width 900.
- Body text in cards 26-34px (never below 24px). Chips 26px. Seats/buttons small (button height ~68px).

Layout (1080x1920) - keep inside Instagram's safe area
- Headline: small Inter line (50px) at y≈330 + coral serif italic line (up to 112px, auto-shrunk to fit 880px) at y≈440.
- Content cards: y≈580-1250. Captions: y≈1290-1430, Inter 600 42px, accent word in serif italic 54px.
- Nothing important above y≈250 or below y≈1500.

Scene recipe (what worked)
| Beat | UI used instead of a cartoon |
|---|---|
| Hook | Booking card: train, "Seats left 1", counter "12,00,000 trying", small "Book now" |
| Question | Phone with interviewer chat bubbles (deadpan joke reply) |
| Naive design | DB metrics card: requests/sec, CPU bar to 100%, status chip -> "503", toast "Abhi aata hoon…" |
| Race condition | Booking log table, two rows same seat -> both chips flip to "Duplicate" |
| Waiting room | "You're in line" card with position counting down + gate log (batch admitted, bot blocked, CAPTCHA) |
| Seat lock | Seat row with seat 42 held, 2:00 timer, dark Redis CLI card, UNIQUE constraint chip |
| Sharding | 2x2 shard cards with load bars; hot shard gets "+2 replicas" |
| Payment | Order timeline: idempotency duplicate ignored -> success -> ticket failed -> refund (5-7 days struck out) -> "Done in 7s" |
| Outro | Ticket status card + small chat, then "Follow" end card |

Rules for the code
- Build a tiny scene function per scene: `S.id=(root,scene)=>(t,localT)=>{...}`; it only sets styles from `t` and `scene.cues`. No `setTimeout`, no CSS animations.
- Easing: only `easeOut` cubic and `easeInOut`. Enter = fade + rise 26px over 0.5s. No overshoot/bounce, no shake, no particles.
- Scene fade in/out 0.2s. Optional very slow push-in (`scale 1 -> 1.012`) over the scene.
- Text enters **on the cue word**, never before it is spoken. Max two things animate at once.
- Hold every readable element at least ~1.2s. Last payoff (e.g. "Done in 7s") needs `tail` so it is not cut by the fade.
- Show "pending" skeleton rows (greyed, "Pending") instead of empty white cards; activate them on cue.
- Keep card heights tight to their content. Give stacked cards equal gaps (~40px).

### Gotchas we hit (avoid them)
- **Never name a font family `Serif`/`Sans`/`Mono`-like generic keywords**: `font-family:Serif` is treated as the generic `serif` and silently falls back to Times. Name it `Instr`.
- Measure text for auto-fit only while the scene is `display:block`; hidden elements report width 0.
- Inline `<em>` inside a `display:flex` caption collapses spaces; wrap the caption content in one `<span>`.
- Build scenes **after** `document.fonts` loaded: `window.ready = fonts.ready.then(load...).then(build)`, and make the renderer `await window.ready`.
- Anything positioned with `translate(-50%,-50%)` is centred on `(x,y)`; cards that overflow x>1000 get clipped; check the grid width.
- Emoji and cartoon icons looked generic; use plain UI chips and simple SVG strokes instead.

## 6. `audio.mjs` (what it does)

1. Synthesise a quiet bed in JS (PCM -> WAV): ~104 BPM soft kick/tabla, light hat, Karplus-Strong sitar-style pluck arpeggio on a
   Bhairav-flavoured scale (D, Eb, F#, G, A, Bb, C#), low drone. Overall gain ~0.34, **ducked** to ~38% while any word is being spoken
   (voice-activity map built from `timings.json` word times, smoothed ±100ms).
2. SFX are tiny and sparse: soft pop on most cues, soft "ding" for success (`unique`, `refund`, `fast`), a quiet buzz for errors
   (`dup`, `fail`, `block`), a soft thud on `crash`. No whooshes louder than ~0.12 gain, no joke stingers.
3. Mix with ffmpeg: each voice part delayed to its absolute start time (`adelay`), `volume≈1.9`, `amix=normalize=0`,
   then `loudnorm=I=-14:TP=-1.5:LRA=7`. Target after render: peak ≤ -1 dBFS, ~-14 to -16 LUFS. (The first version peaked at +0.2 dBFS and clipped.)
4. Newer ffmpeg builds removed `-filter_complex_script`; use `-/filter_complex file.txt`.

## 7. `render.mjs`

```js
import {chromium} from 'playwright'; import fs from 'fs'; import path from 'path'; import url from 'url'; import {execSync} from 'child_process';
const T=JSON.parse(fs.readFileSync('build/timings.json','utf8')), FPS=30, mode=process.argv[2]||'stills';
const file=url.pathToFileURL(path.resolve('index.html')).href;
const b=await chromium.launch(process.env.CHROME?{executablePath:process.env.CHROME}:{});
async function page(){const p=await (await b.newContext({viewport:{width:1080,height:1920}})).newPage();
  await p.addInitScript(`window.T=${JSON.stringify(T)}`); await p.goto(file); await p.evaluate(()=>window.ready); return p}
if(mode==='stills'){            // node render.mjs stills 1.5,8.2,30
  fs.mkdirSync('build/stills',{recursive:true}); const p=await page();
  for(const t of process.argv[3].split(',').map(Number)){await p.evaluate(t=>renderAt(t),t);
    await p.screenshot({path:`build/stills/s_${t.toFixed(1).padStart(5,'0')}.jpg`,type:'jpeg',quality:85})}
}else{                           // full render, 4 parallel pages
  const total=Math.floor(T.total*FPS),W=4; fs.mkdirSync('build/frames',{recursive:true});
  await Promise.all([...Array(W)].map(async(_,w)=>{const p=await page();
    for(let f=w;f<total;f+=W){await p.evaluate(t=>renderAt(t),f/FPS);
      await p.screenshot({path:`build/frames/f${String(f).padStart(5,'0')}.jpg`,type:'jpeg',quality:92})}}));
  execSync(`ffmpeg -y -loglevel error -framerate ${FPS} -i build/frames/f%05d.jpg -i build/audio.wav -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart reel.mp4`);
}
await b.close();
```
Full render of ~64s takes about 80s. Frames are overwritten in place on each render.

## 8. Workflow for the agent (follow in order)

1. **Brief** (ask once if missing): topic, language of voice, on-screen language, length (aim 45-65s), tone (subtle comedy only), CTA.
2. **Plan before code**: problem, a *correct* solution, 8-10 scenes with one visual idea each, the spoken line and cue words per scene.
   Fact-check technical claims (e.g. a Redis lock alone is not enough; add a DB unique constraint; a hot shard needs replicas/smaller batches).
   Say clearly that it is a proposed design, not a claim about how the real company works.
3. Write `script.json`, run `node tts.mjs`, read the per-scene durations. If total > 65s, trim words, not pauses.
4. Build `index.html` scenes against `timings.json`. Render **stills at every cue** and review a contact sheet
   (`ffmpeg -framerate 1 -i sh/%02d.jpg -frames:v 1 -vf "scale=360:640,tile=6x3" sheet.jpg`).
5. Run `node audio.mjs`; measure with `ffmpeg -i build/audio.wav -af ebur128=peak=true -f null -`.
6. `node render.mjs full`, then extract frames from the **final mp4** (not only stills) at every scene and check again.
7. Review round (always do at least one): list defects honestly and fix them, then re-render.
8. Final report: file path, duration, loudness/peak, what was verified, and what was **not** (you cannot hear audio, so say
   the Hindi pronunciation of technical words is unchecked).

## 9. QA checklist

- [ ] Total length <= ~65s; no scene has >0.5s of silence mid-sentence; hook is clear with sound off in the first second.
- [ ] No text outside x 60-1020 or in the top 250px / bottom 400px; no overlapping cards; equal spacing between stacked cards.
- [ ] Body text >= 26px on a 1080-wide frame; max ~2 lines in any caption.
- [ ] Every number/claim on screen matches the narration (e.g. "waiting 24x7 / same halat" joke is not a number).
- [ ] Captions follow the meaning of the voice; accent word coral serif only.
- [ ] Audio peak <= -1 dBFS, ~-14 to -16 LUFS, music audibly ducks under voice.
- [ ] Final mp4: H.264, yuv420p, 1080x1920, 30fps, AAC, `+faststart`.

## 10. Safety / ethics notes

- Reference styles (e.g. someone else's reel) are for *look and structure only*. Do not copy their content, branding, or footage.
  Do not log in to Instagram or bypass login walls to grab frames; use the public cover/embed or ask the user for screenshots.
- Do not use real people's likenesses or voices (celebrity impersonation). Catchphrase name-drops are fine; keep jokes light.
- Narration text goes to Microsoft's TTS service; keep it non-sensitive.
- Avoid destructive shell commands (`rm -rf` on folders) in agent sessions; write to fresh output folders instead.

## 11. Starter prompt (paste into Antigravity)

> Read `ANTIGRAVITY.md` fully. Build an Instagram reel (1080x1920, 30fps, <=65s) about **<TOPIC>**.
> Hindi voice-over (hi-IN-MadhurNeural via node-edge-tts), Roman Hinglish on-screen captions, clean light UI-card style with a small
> Inter headline plus coral Instrument-Serif-italic accent line, subtle deadpan comedy only.
> First write the plan (problem, correct solution, scene list with spoken line + cue words + UI card per scene) and show it to me.
> Then implement `script.json`, `tts.mjs`, `audio.mjs`, `index.html`, `render.mjs`, review stills and the final mp4 frames,
> do one improvement round, render, and report duration, loudness, and anything you could not verify.
