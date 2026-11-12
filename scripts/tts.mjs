// Generates the voice for every scene part and build/timings.json (word timestamps, cue times, captions).
// Part voice: "v" may be a preset name from voices.json (see `node voices.mjs list`), a key of script.json "voices",
// or a raw Edge voice id such as "hi-IN-MadhurNeural". Per-part "r" (rate) and "p" (pitch) override the preset.
// Cache: build/parts/<scene>_<n>_<hash>.mp3 where hash covers voice+rate+pitch+text, so edits never reuse stale audio.
import { EdgeTTS } from 'node-edge-tts';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const S = JSON.parse(fs.readFileSync('script.json', 'utf8'));
const vfile = fs.existsSync('voices.json') ? 'voices.json' : path.join(here, 'voices.json');
const presets = JSON.parse(fs.readFileSync(vfile, 'utf8')).presets;
fs.mkdirSync('build/parts', { recursive: true });

const LEAD = 0.3, GAP = 0.12, TAIL = 0.3;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const dur = f => parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${f}"`).toString());
const norm = s => s.replace(/[।?!.,]/g, '');

function resolve(p) {
  let key = p.v;
  if (S.voices && S.voices[key]) key = S.voices[key];            // legacy alias map (M/S -> voice or preset)
  const pre = presets[key] || { voice: key, rate: '+20%', pitch: 'default' };
  return { voice: pre.voice, rate: p.r || pre.rate || '+20%', pitch: p.p || pre.pitch || 'default' };
}
// Edge voices pause ~0.9s at sentence ends; commas pause far less. Captions/cues still use the original words.
const spoken = t => t.replace(/[।?!.…]+/g, ',').replace(/\s*,\s*/g, ', ').replace(/(,\s*)+$/, '');

let T = 0;
const out = { scenes: [], audio: [] };
for (const sc of S.scenes) {
  let t = T + LEAD;
  const words = [];
  for (const [i, p] of sc.parts.entries()) {
    const v = resolve(p);
    const hash = crypto.createHash('md5').update(JSON.stringify([v, p.t])).digest('hex').slice(0, 8);
    const f = `build/parts/${sc.id}_${i}_${hash}.mp3`;
    if (!fs.existsSync(f + '.json')) {
      const e = new EdgeTTS({
        voice: v.voice, lang: v.voice.slice(0, 5), outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
        saveSubtitles: true, rate: v.rate, pitch: v.pitch,
      });
      for (let k = 0; ; k++) {                                   // service answers HTTP 429 when called too fast
        try { await e.ttsPromise(spoken(p.t), f); break; }
        catch (err) { if (k > 6) throw err; await sleep(4000 * (k + 1)); }
      }
      await sleep(1500);
    }
    const orig = p.t.split(/\s+/).filter(Boolean);
    const sub = JSON.parse(fs.readFileSync(f + '.json', 'utf8'));
    if (sub.length !== orig.length) console.log('WARN word count', sc.id, i, sub.length, 'vs', orig.length);
    out.audio.push({ f, t });
    sub.forEach((w, k) => words.push({ w: orig[k] || w.part.trim(), t0: t + w.start / 1000, t1: t + w.end / 1000, part: i }));
    t = (words.length ? words[words.length - 1].t1 : t + dur(f)) + GAP;
  }
  const end = t - GAP + TAIL + (sc.tail || 0);
  const cues = { start: T + LEAD };
  for (const [lab, key] of sc.cues || []) {
    const w = words.find(x => norm(x.w).includes(norm(key)));
    if (!w) throw new Error(`${sc.id}: cue "${lab}" word "${key}" not found in narration`);
    cues[lab] = w.t0;
  }
  const caps = (sc.caps || []).map(([k, x]) => ({ t: (cues[k] !== undefined ? cues[k] : T + LEAD) - (k === 'start' ? 0 : 0.04), text: x }));
  out.scenes.push({ id: sc.id, start: T, dur: end - T, words, cues, caps });
  T = end;
}
out.total = T;
fs.writeFileSync('build/timings.json', JSON.stringify(out, null, 1));
console.log(out.scenes.map(s => `${s.id.padEnd(10)} ${s.start.toFixed(1).padStart(5)} +${s.dur.toFixed(1)}`).join('\n'), '\nTOTAL', T.toFixed(1));
