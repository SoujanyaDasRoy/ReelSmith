// Reelsmith footage editor: real clips -> a 9:16 reel. Node + ffmpeg only (needs ffmpeg with libass; xfade/vidstab are used if present).
//   node edit.mjs probe <clip...>                                  size, fps, duration, audio, loudness
//   node edit.mjs plan talking <clip> [--target 50] [--noise -32dB] [--min 0.35] [--pad 0.08] [--transcript t.json|t.srt] [--cut-fillers]
//   node edit.mjs plan montage <clip...> [--beats 2] [--seconds 20]  (cuts every N beats of build/music.json, else 100 bpm)
//   node edit.mjs render [edit/edit.json] [out/reel.mp4] [--preview]
//   afterwards: node qa.mjs --timings build/edit/timings.json --audio build/edit/out_audio.wav --video out/reel.mp4
// edit.json (edit it by hand or let the agent): {
//   "size":[1080,1920], "fps":30, "reframe":"fill|fit-blur", "grade":"none|clean|warm|punchy|cool|bw", "keepAudio":true,
//   "music":{"file":"build/music_composed.wav","gain":0.5,"duck":true}, "transcript":"clip.json|clip.srt", "captions":{"style":"vox|box","font":"Arial Black","size":62},
//   "segments":[{"src":"a.mp4","in":1.2,"out":4.8,"focus":0.5,"zoom":1.0,"speed":1,"grade":"warm","stabilize":false,
//                "transition":"cut|fade|wipeleft|slideleft|circleopen","tdur":0.2,"jcut":0.0,"lcut":0.0,"caption":"optional *accent* text"}] }
// Transcript: JSON {"words":[{"w":"hello","t0":1.2,"t1":1.5}]} (source time), or SRT. No speech-to-text is bundled: bring a transcript from any tool,
// or run Whisper yourself (ask the user before installing it). Face tracking is NOT included: set "focus" (0 = left edge, 1 = right edge) per segment.
import fs from 'fs'; import path from 'path'; import { spawnSync } from 'child_process';
const A = process.argv.slice(2); const opt = (k, d) => { const i = A.indexOf('--' + k); return i >= 0 && A[i + 1] && !A[i + 1].startsWith('--') ? A[i + 1] : d; }; const flag = k => A.includes('--' + k);
const run = (c, a, o = {}) => spawnSync(c, a, { encoding: 'utf8', maxBuffer: 1 << 28, ...o });
const ffm = a => { const r = run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...a]); if (r.status !== 0) { console.error('ffmpeg failed:\n' + r.stderr.slice(-1500)); process.exit(1); } };
const num = x => Math.round(x * 1000) / 1000;
function probe(f) {
  const r = run('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', f]); if (r.status !== 0) { console.error('cannot read ' + f); process.exit(1); }
  const j = JSON.parse(r.stdout), v = j.streams.find(s => s.codec_type === 'video'), a = j.streams.find(s => s.codec_type === 'audio'); let w = v.width, h = v.height;
  const rot = Math.abs(((v.side_data_list || []).find(x => x.rotation !== undefined) || {}).rotation || +((v.tags || {}).rotate) || 0); if (rot === 90 || rot === 270) [w, h] = [h, w];
  return { file: f, w, h, fps: num(v.avg_frame_rate.split('/').reduce((x, y) => x / y)), dur: num(+j.format.duration), audio: !!a, rot };
}
function lufs(f) { const e = run('ffmpeg', ['-hide_banner', '-nostats', '-i', f, '-af', 'ebur128', '-f', 'null', '-']).stderr; const m = e.slice(e.lastIndexOf('Summary:')).match(/I:\s+(-?[\d.]+) LUFS/); return m ? +m[1] : null; }
// ---- speech segments from silence detection
function speech(f, noise, min, pad) {
  const p = probe(f), e = run('ffmpeg', ['-hide_banner', '-nostats', '-i', f, '-af', `silencedetect=noise=${noise}:d=${min}`, '-f', 'null', '-']).stderr;
  const sil = []; let st = null; for (const l of e.split('\n')) { let m = l.match(/silence_start:\s*(-?[\d.]+)/); if (m) st = Math.max(0, +m[1]); m = l.match(/silence_end:\s*([\d.]+)/); if (m && st !== null) { sil.push([st, +m[1]]); st = null; } } if (st !== null) sil.push([st, p.dur]);
  const sp = []; let cur = 0; for (const [a, b] of sil) { if (a > cur) sp.push([cur, a]); cur = b; } if (cur < p.dur) sp.push([cur, p.dur]);
  const out = []; for (const [a, b] of sp) { const s = [Math.max(0, a - pad), Math.min(p.dur, b + pad)]; if (out.length && s[0] - out.at(-1)[1] < pad) out.at(-1)[1] = s[1]; else out.push(s); }
  return { p, segs: out.filter(s => s[1] - s[0] >= .4) };
}
// ---- transcript
function loadTranscript(f) {
  if (!f || !fs.existsSync(f)) return { words: [], chunks: [] }; const t = fs.readFileSync(f, 'utf8');
  if (/\.srt$/i.test(f)) { const chunks = []; for (const b of t.replace(/\r/g, '').split(/\n\n+/)) { const l = b.split('\n'), i = l.findIndex(x => x.includes('-->')); if (i < 0) continue; const [a, c] = l[i].split('-->').map(s => { const m = s.trim().match(/(\d+):(\d+):(\d+)[,.](\d+)/); return +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000; }); chunks.push({ t0: a, t1: c, text: l.slice(i + 1).join(' ').trim() }); } return { words: [], chunks }; }
  const j = JSON.parse(t); const words = (j.words || (j.segments || []).flatMap(s => s.words || [])).map(w => ({ w: w.w || w.word || w.text, t0: w.t0 ?? w.start, t1: w.t1 ?? w.end })).filter(w => w.w);
  const chunks = []; let cur = null; for (const w of words) { const gap = cur ? w.t0 - cur.t1 : 0; if (!cur || gap > .45 || (cur.text + ' ' + w.w).length > 36 || /[.?!]$/.test(cur.text)) { if (cur) chunks.push(cur); cur = { t0: w.t0, t1: w.t1, text: w.w }; } else { cur.text += ' ' + w.w; cur.t1 = w.t1; } } if (cur) chunks.push(cur);
  return { words, chunks };
}
const FILLERS = new Set(['um', 'umm', 'uh', 'uhh', 'er', 'erm', 'ah', 'hmm', 'hm']);
// ---- plan
if (A[0] === 'probe') { for (const f of A.slice(1).filter(x => !x.startsWith('--'))) { const p = probe(f); console.log(`${f}: ${p.w}x${p.h} ${p.fps}fps ${p.dur}s audio=${p.audio}${p.audio ? ' ' + lufs(f) + ' LUFS' : ''}${p.w > p.h ? '  (landscape: use reframe fit-blur or fill with a focus)' : ''}`); } process.exit(0); }
if (A[0] === 'plan') {
  const mode = A[1], files = A.slice(2).filter((x, i, arr) => !x.startsWith('--') && !(i > 0 && arr[i - 1].startsWith('--'))); const edl = { size: [1080, 1920], fps: 30, reframe: 'fill', grade: 'clean', keepAudio: true, segments: [] };
  if (mode === 'talking') {
    const f = files[0], { p, segs } = speech(f, opt('noise', '-32dB'), +opt('min', .35), +opt('pad', .08)); let list = segs;
    const tr = opt('transcript', ''); if (tr) { edl.transcript = tr; if (flag('cut-fillers')) { const { words } = loadTranscript(tr); const bad = words.filter(w => FILLERS.has(w.w.toLowerCase().replace(/[^a-z]/g, ''))); const nl = []; for (const [a, b] of list) { let s = a; for (const w of bad) if (w.t0 > s && w.t1 < b) { if (w.t0 - s > .3) nl.push([s, w.t0 - .02]); s = w.t1 + .02; } if (b - s > .3) nl.push([s, b]); } list = nl; } }
    if (p.w > p.h) { edl.reframe = 'fill'; }
    list.forEach(([a, b], i) => edl.segments.push({ src: f, in: num(a), out: num(b), focus: .5, zoom: i % 2 ? 1.1 : 1, speed: 1, transition: 'cut', jcut: 0, lcut: 0 }));
    const tot = list.reduce((s, [a, b]) => s + b - a, 0); console.log(`${p.dur}s source -> ${list.length} segments, ${num(tot)}s of speech; jump-cut punch-in alternates 1.0x / 1.1x`); const target = +opt('target', 0); if (target && tot > target) console.log(`WARN: ${num(tot)}s is longer than the ${target}s target: cut segments or raise --noise`);
  } else if (mode === 'montage') {
    let bpm = 100, phi = 0; try { const m = JSON.parse(fs.readFileSync('build/music.json', 'utf8')); const v = m.variants.find(x => x.variant === m.picked); bpm = v.bpm; phi = v.phi; } catch {} const beat = 60 / bpm, beats = +opt('beats', 2), segd = beat * beats, total = +opt('seconds', 20), n = Math.max(1, Math.round(total / segd));
    const P = files.map(probe); edl.keepAudio = false; edl.music = { file: fs.existsSync('build/music_composed.wav') ? 'build/music_composed.wav' : '', gain: 1, duck: false }; if (!edl.music.file) delete edl.music;
    for (let i = 0; i < n; i++) { const c = P[i % P.length], k = Math.floor(i / P.length), room = Math.max(0, c.dur - segd - 1); edl.segments.push({ src: c.file, in: num(.5 + (room ? (k * segd * 1.7) % room : 0)), out: num(.5 + (room ? (k * segd * 1.7) % room : 0) + segd), focus: .5, zoom: i % 3 === 2 ? 1.12 : 1, speed: 1, transition: 'cut' }); }
    edl.musicStart = num(phi); console.log(`${n} cuts of ${beats} beat(s) @ ${bpm} bpm (${num(segd)}s each); put the music so its beat grid starts at 0 (the render starts the music at its first beat via musicStart)`);
  } else { console.error('plan talking|montage'); process.exit(2); }
  fs.mkdirSync('edit', { recursive: true }); fs.writeFileSync('edit/edit.json', JSON.stringify(edl, null, 1)); console.log('wrote edit/edit.json (review it, change focus/zoom/transition/captions, then: node edit.mjs render)'); process.exit(0);
}
if (A[0] !== 'render') { console.error('usage: edit.mjs probe|plan|render (see header)'); process.exit(2); }
// ---- render
const rest = A.slice(1).filter((x, i, arr) => !x.startsWith('--') && !(i > 0 && arr[i - 1].startsWith('--')));
const edlFile = rest[0] || 'edit/edit.json', outFile = rest[1] || 'out/reel.mp4'; const E = JSON.parse(fs.readFileSync(edlFile, 'utf8'));
const prev = flag('preview'); const [W0, H0] = E.size || [1080, 1920]; const sc = prev ? .5 : 1, W = Math.round(W0 * sc / 2) * 2, H = Math.round(H0 * sc / 2) * 2, FPS = prev ? 24 : (E.fps || 30), CRF = prev ? 28 : 17;
const GR = { none: '', clean: 'eq=contrast=1.05:saturation=1.08', warm: 'colorbalance=rs=.05:bs=-.06,eq=saturation=1.1:contrast=1.04', punchy: 'eq=contrast=1.15:saturation=1.25:gamma=0.97,unsharp=5:5:0.6', cool: 'colorbalance=rs=-.04:bs=.06,eq=saturation=1.05', bw: 'hue=s=0,eq=contrast=1.12' };
fs.mkdirSync('build/edit', { recursive: true }); fs.mkdirSync(path.dirname(outFile), { recursive: true });
const S = E.segments; if (!S.length) { console.error('no segments'); process.exit(2); }
const probes = {}; for (const s of S) probes[s.src] ||= probe(s.src);
const dur = S.map(s => (s.out - s.in) / (s.speed || 1)), td = S.map((s, i) => i > 0 && s.transition && s.transition !== 'cut' ? Math.min(s.tdur || .2, dur[i] / 2, dur[i - 1] / 2) : 0);
const start = []; let cur = 0; S.forEach((s, i) => { start.push(i ? cur - td[i] : 0); cur = i ? cur - td[i] + dur[i] : dur[0]; }); const total = cur;
// 1. per-segment video
const segFiles = [];
S.forEach((s, i) => {
  const f = `build/edit/seg${i}.mp4`, Z = s.zoom || 1, F = s.focus ?? .5, p = probes[s.src], grade = GR[s.grade ?? E.grade ?? 'none'] || '';
  const reframe = (E.reframe || 'fill') === 'fit-blur' && p.w > p.h
    ? `split=2[bg][fg];[bg]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},boxblur=40:6[b];[fg]scale=${W}:-2[f];[b][f]overlay=(W-w)/2:(H-h)/2`
    : `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}:(iw-${W})*${F}:(ih-${H})/2`;
  let chain = reframe; if (Z !== 1) chain += `,crop=iw/${Z}:ih/${Z}:(iw-iw/${Z})/2:(ih-ih/${Z})/2,scale=${W}:${H}`; if (grade) chain += ',' + grade; if ((s.speed || 1) !== 1) chain += `,setpts=PTS/${s.speed}`; chain += `,setsar=1,fps=${FPS},format=yuv420p`;
  let pre = ''; if (s.stabilize) { const trf = `build/edit/seg${i}.trf`; run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-ss', String(s.in), '-t', String(s.out - s.in), '-i', s.src, '-vf', `vidstabdetect=shakiness=5:result=${trf}`, '-f', 'null', '-']); if (fs.existsSync(trf)) pre = `vidstabtransform=input=${trf}:smoothing=10,`; }
  ffm(['-ss', String(s.in), '-t', String(num(s.out - s.in)), '-i', s.src, '-filter_complex', `[0:v]${pre}${chain}[v]`, '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', String(CRF), '-r', String(FPS), f]); segFiles.push(f);
});
// 2. captions (ASS) mapped from source time to output time
const tr = loadTranscript(E.transcript || ''); const capStyle = (E.captions || {}).style || (E.transcript || S.some(s => s.caption) ? 'vox' : 'none');
const toAss = t => { const h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = t % 60; return `${h}:${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`; };
const esc = t => t.replace(/\\/g, '').replace(/\{|\}/g, '').replace(/\*([^*]+)\*/g, '{\\c&H4ACFFF&}$1{\\c&HFFFFFF&}');
const lines = [], capsOut = [], wordsOut = [];
S.forEach((s, i) => {
  const sp = s.speed || 1, map = t => start[i] + (t - s.in) / sp;
  if (s.caption) { lines.push([start[i] + .05, start[i] + dur[i] - .05, s.caption]); capsOut.push({ t: num(start[i] + .05), text: s.caption, i }); }
  else for (const c of tr.chunks) if (c.t1 > s.in && c.t0 < s.out) { const a = Math.max(map(Math.max(c.t0, s.in)), start[i]), b = Math.min(map(Math.min(c.t1, s.out)) + .15, start[i] + dur[i]); if (b - a > .2) { lines.push([a, b, c.text]); capsOut.push({ t: num(a), text: c.text, i }); } }
  for (const w of tr.words) if (w.t1 > s.in && w.t0 < s.out) wordsOut.push({ w: w.w, t0: num(map(Math.max(w.t0, s.in))), t1: num(map(Math.min(w.t1, s.out))), scene: 'seg' + (i + 1) });
});
let assFile = ''; if (capStyle !== 'none' && lines.length) {
  const cs = E.captions || {}, font = cs.font || 'Arial Black', size = Math.round((cs.size || 62) * sc), box = capStyle === 'box'; const mv = Math.round((H0 - 1400) * sc);
  lines.sort((a, b) => a[0] - b[0]); for (let k = 0; k < lines.length - 1; k++) if (lines[k][1] > lines[k + 1][0]) lines[k][1] = lines[k + 1][0] - .02;
  const hdr = `[Script Info]\nScriptType: v4.00+\nPlayResX: ${W}\nPlayResY: ${H}\nWrapStyle: 0\n\n[V4+ Styles]\nFormat: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding\nStyle: Cap,${font},${size},&H00FFFFFF,&H00FFFFFF,&H00000000,${box ? '&H99000000' : '&H00000000'},0,0,0,0,100,100,0,0,${box ? 3 : 1},${Math.round(7 * sc)},0,2,${Math.round(60 * sc)},${Math.round(60 * sc)},${mv},1\n\n[Events]\nFormat: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text\n`;
  assFile = 'build/edit/caps.ass'; fs.writeFileSync(assFile, hdr + lines.map(([a, b, t]) => `Dialogue: 0,${toAss(a)},${toAss(b)},Cap,,0,0,0,,${esc(t)}`).join('\n') + '\n');
}
// 3. final: join video (cut/xfade), build audio timeline, music + ducking, captions, loudness
const inputs = [...segFiles]; const idx = f => { let i = inputs.indexOf(f); if (i < 0) { inputs.push(f); i = inputs.length - 1; } return i; };
let fc = [], cv = '[0:v]', cd = dur[0]; fc.push('[0:v]null[c0]');
for (let i = 1; i < S.length; i++) { const o = `[c${i}]`; if (td[i]) fc.push(`[c${i - 1}][${i}:v]xfade=transition=${S[i].transition}:duration=${td[i]}:offset=${num(cd - td[i])}${o}`); else fc.push(`[c${i - 1}][${i}:v]concat=n=2:v=1:a=0${o}`); cd = td[i] ? cd - td[i] + dur[i] : cd + dur[i]; }
fc.push(`[c${S.length - 1}]${assFile ? `subtitles=${assFile},` : ''}format=yuv420p[vfin]`);
const aLabels = []; if (E.keepAudio !== false) S.forEach((s, i) => { if (!probes[s.src].audio) return; const sp = s.speed || 1, p = probes[s.src], j = Math.min(s.jcut || 0, start[i], s.in), l = Math.min(s.lcut || 0, p.dur - s.out), a0 = s.in - j, a1 = s.out + l, ai = idx(s.src), len = (a1 - a0) / sp, fi = Math.min(Math.max(td[i], .03), len / 3), fo = Math.min(Math.max(td[i + 1] || 0, .03), len / 3);
  let at = ''; if (sp !== 1) { let r = sp; const ch = []; while (r > 2) { ch.push('atempo=2'); r /= 2; } while (r < .5) { ch.push('atempo=.5'); r /= .5; } ch.push('atempo=' + r); at = ',' + ch.join(','); }
  fc.push(`[${ai}:a]atrim=start=${num(a0)}:end=${num(a1)},asetpts=PTS-STARTPTS${at},aresample=48000,aformat=channel_layouts=stereo,afade=t=in:d=${num(fi)},afade=t=out:st=${num(Math.max(0, len - fo))}:d=${num(fo)},adelay=${Math.round((start[i] - j) * 1000)}|${Math.round((start[i] - j) * 1000)}[a${i}]`); aLabels.push(`[a${i}]`); });
let dial = ''; if (aLabels.length) { fc.push(`${aLabels.join('')}amix=inputs=${aLabels.length}:normalize=0:dropout_transition=0[dial]`); dial = '[dial]'; }
let last = dial; const M = E.music;
if (M && M.file && fs.existsSync(M.file)) { const mi = idx(M.file), gain = M.gain ?? .5, off = Math.max(0, E.musicStart || 0);
  fc.push(`[${mi}:a]atrim=start=${off},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,volume=${gain},afade=t=out:st=${num(Math.max(0, total - 1.2))}:d=1.2[mus0]`);
  if (dial && M.duck !== false) { fc.push('[dial]asplit=2[dm][ds]'); fc.push('[mus0][ds]sidechaincompress=threshold=0.03:ratio=10:attack=15:release=300:makeup=1[musd]'); fc.push('[dm][musd]amix=inputs=2:normalize=0:dropout_transition=0[mix]'); } else if (dial) fc.push('[dial][mus0]amix=inputs=2:normalize=0:dropout_transition=0[mix]'); else fc.push('[mus0]anull[mix]'); last = '[mix]'; }
if (!last) { fc.push(`anullsrc=r=48000:cl=stereo,atrim=0:${num(total)}[mix]`); last = '[mix]'; }
fc.push(`${last}loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[afin]`);
fs.writeFileSync('build/edit/filter.txt', fc.join(';\n'));
const args = []; for (const f of inputs) args.push('-i', f);
ffm([...args, '-/filter_complex', 'build/edit/filter.txt', '-map', '[vfin]', '-map', '[afin]', '-t', String(num(total)), '-c:v', 'libx264', '-preset', prev ? 'veryfast' : 'medium', '-crf', String(CRF), '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', outFile]);
ffm(['-i', outFile, '-vn', '-ac', '2', '-ar', '44100', 'build/edit/out_audio.wav']);
// 4. timings for qa.mjs (scenes = segments; words from the transcript when given)
const T = { total: num(total), scenes: S.map((s, i) => ({ id: 'seg' + (i + 1), start: num(start[i]), dur: num(dur[i]), words: wordsOut.filter(w => w.scene === 'seg' + (i + 1)), cues: { start: num(start[i]) }, caps: capsOut.filter(c => c.i === i).map(c => ({ t: c.t, text: c.text })) })), audio: [] };
fs.writeFileSync('build/edit/timings.json', JSON.stringify(T, null, 1));
console.log(`rendered ${outFile}: ${num(total)}s, ${S.length} segments${prev ? ' (PREVIEW: half size)' : ''}${assFile ? ', captions burned in' : ''}${E.music ? ', music' + (E.music.duck !== false && dial ? ' ducked under dialogue' : '') : ''}`);
console.log('next: node qa.mjs --timings build/edit/timings.json --audio build/edit/out_audio.wav --video ' + outFile);
