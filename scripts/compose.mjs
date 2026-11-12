// Reelsmith music composer: writes a music bed that fits THIS reel's cuts. Node + ffmpeg only, no samples, no downloads.
//   node compose.mjs [--mood curious_tech] [--scale dorian|bhairavi|yaman|...] [--root D] [--bpm 100] [--seed 1] [--variants 3] [--pick 1] [--list]
// Reads build/timings.json (+ optional script.json "music" block), writes build/music_v1..vN.wav (stereo, already ducked under the voice),
// build/music_composed.wav (the picked variant; audio.mjs mixes it) and build/music.json (tempo, key, alignment of cuts to the beat grid).
// What it cannot do: judge whether it SOUNDS good. It checks grid alignment, loudness and clipping; a human picks the variant by ear.
//
// script.json "music": { "mood":"curious_tech", "scale":"dorian", "root":"D", "bpm":104, "seed":3,
//    "energy":[.7,.5,.55,...]  (0..1 per scene; default curve if omitted),
//    "hits": {"crash":"drop", "follow":"chime"}  (cue label -> impact|drop|chime|riser) }
import fs from 'fs'; import { spawnSync } from 'child_process';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const SC = { major: [0,2,4,5,7,9,11], minor: [0,2,3,5,7,8,10], dorian: [0,2,3,5,7,9,10], mixolydian: [0,2,4,5,7,9,10], phrygian: [0,1,3,5,7,8,10],
  bhairavi: [0,1,3,5,7,8,10], yaman: [0,2,4,6,7,9,11], bilawal: [0,2,4,5,7,9,11], kafi: [0,2,3,5,7,9,10], todi: [0,1,3,6,7,8,11], bhairav: [0,1,4,5,7,8,11], khamaj: [0,2,4,5,7,9,10] };
// layers: which instruments exist; groove: 'four' (kick/snare/hat), 'keherwa' (tabla), 'sparse' (clicks/pulse)
const MOODS = {
  curious_tech:   { scale: 'dorian',     root: 'D', bpm: [96, 112], prog: [[0,5,3,4],[0,3,5,4],[0,4,5,3]], groove: 'four',    L: 'pad bass pluck kick hat tabla bell', note: 'light, clever, tech explainer' },
  deadpan_comedy: { scale: 'mixolydian', root: 'G', bpm: [100,116], prog: [[0,3,0,4],[0,4,3,4]],         groove: 'sparse',  L: 'bass pluck click bell',             note: 'staccato, dry, wink-wink' },
  warm_devotional:{ scale: 'bhairavi',   root: 'D', bpm: [68, 84],  prog: [[0,5,3,4],[0,3,4,0]],         groove: 'keherwa', L: 'tanpura pad flute tabla bell',      note: 'drone, bansuri-style flute, slow keherwa' },
  festive:        { scale: 'bilawal',    root: 'C', bpm: [112,128], prog: [[0,3,4,0],[0,4,5,3]],         groove: 'keherwa', L: 'pad bass pluck kick snare tabla bell', note: 'bright, dhol-ish kick + tabla' },
  tense:          { scale: 'todi',       root: 'E', bpm: [88, 104], prog: [[0,0,5,4],[0,5,0,1]],         groove: 'sparse',  L: 'tanpura pad bass hat click',        note: 'low drones, ticking, impacts' },
  calm_lofi:      { scale: 'major',      root: 'F', bpm: [72, 84],  prog: [[0,5,3,4],[0,2,3,4]],         groove: 'four',    L: 'pad bass kick hat flute bell',      note: 'soft, warm, spacious' },
  epic_build:     { scale: 'minor',      root: 'A', bpm: [100,120], prog: [[0,5,2,6],[0,6,5,4]],         groove: 'four',    L: 'pad bass pluck kick snare hat bell', note: 'big, driving, risers' },
  sad_reflective: { scale: 'minor',      root: 'D', bpm: [60, 76],  prog: [[0,5,2,6],[0,3,5,4]],         groove: 'sparse',  L: 'pad flute bell pluck tanpura',      note: 'sparse, wistful' },
};
if (process.argv.includes('--list')) { for (const [k, m] of Object.entries(MOODS)) console.log(k.padEnd(16), m.scale.padEnd(11), 'bpm ' + m.bpm.join('-'), '  ' + m.note); console.log('\nscales:', Object.keys(SC).join(' ')); process.exit(0); }

const T = JSON.parse(fs.readFileSync('build/timings.json', 'utf8'));
let S = { scenes: [] }; try { S = JSON.parse(fs.readFileSync('script.json', 'utf8')); } catch {}
const B = S.music || {};
const moodName = arg('mood', B.mood || 'curious_tech'); const M = MOODS[moodName]; if (!M) { console.error('unknown mood ' + moodName + ' (--list)'); process.exit(2); }
const scaleName = arg('scale', B.scale || M.scale), scale = SC[scaleName]; if (!scale) { console.error('unknown scale ' + scaleName); process.exit(2); }
const rootName = arg('root', B.root || M.root); const PC = { C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11 };
const rootMidi = 48 + (PC[rootName] ?? 2);                     // octave 3
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const deg = (d, oct = 0) => rootMidi + scale[((d % 7) + 7) % 7] + 12 * (Math.floor(d / 7) + oct);
const layers = new Set((B.layers || M.L).split(/\s+/));
const SR = 44100, total = T.total, N = Math.ceil((total + 1.5) * SR);
const nVar = parseInt(arg('variants', '3')), baseSeed = parseInt(arg('seed', B.seed ?? 1)), pick = parseInt(arg('pick', '1'));
const scenes = T.scenes;
// ---- energy per scene (0..1)
const n = scenes.length;
const energy = scenes.map((s, i) => { const e = (B.energy || [])[i]; if (typeof e === 'number') return e; const p = n > 1 ? i / (n - 1) : 0; return p < .12 ? .72 : p < .25 ? .5 : p < .85 ? .55 + .32 * ((p - .25) / .6) : .55; });
const sceneAt = t => { for (let i = n - 1; i >= 0; i--) if (t >= scenes[i].start) return i; return 0; };
const eAt = t => { const i = sceneAt(t), nx = scenes[i + 1]; if (!nx) return energy[i]; const u = Math.max(0, Math.min(1, (t - (nx.start - .6)) / .6)); return energy[i] + (energy[i + 1] - energy[i]) * u; };
// ---- voice activity for ducking (same idea as audio.mjs)
const act = new Float32Array(Math.ceil(total + 2) * 100); for (const s of scenes) for (const w of s.words) for (let k = Math.floor((w.t0 - .05) * 100); k < (w.t1 + .15) * 100; k++) if (k >= 0 && k < act.length) act[k] = 1;
const duck = t => { let a = 0; const k = Math.floor(t * 100); for (let j = -12; j <= 12; j++) a += act[Math.min(Math.max(k + j, 0), act.length - 1)]; return 1 - 0.42 * (a / 25); };
// ---- tempo: pick bpm + phase so scene starts fall on the beat grid
const cuts = scenes.slice(1).map(s => s.start);
const hitMap = B.hits || { crash: 'drop', follow: 'chime' };
function gridCandidates() {
  const out = [];
  for (let bpm = M.bpm[0]; bpm <= M.bpm[1]; bpm += .25) { const beat = 60 / bpm; let best = { err: 9, phi: 0 };
    for (let phi = 0; phi < beat; phi += .01) { let e = 0; for (const c of cuts) { const k = (c - phi) / beat; e += Math.abs(k - Math.round(k)) * beat; } e /= Math.max(1, cuts.length); if (e < best.err) best = { err: e, phi }; }
    out.push({ bpm, beat, ...best }); }
  out.sort((a, b) => a.err - b.err); const picked = []; for (const c of out) if (picked.every(p => Math.abs(p.bpm - c.bpm) >= 3)) picked.push(c); return picked;
}
const cands = B.bpm ? [(() => { const beat = 60 / B.bpm; let best = { err: 9, phi: 0 }; for (let phi = 0; phi < beat; phi += .01) { let e = 0; for (const c of cuts) { const k = (c - phi) / beat; e += Math.abs(k - Math.round(k)) * beat; } e /= Math.max(1, cuts.length); if (e < best.err) best = { err: e, phi }; } return { bpm: B.bpm, beat, ...best }; })()] : gridCandidates();
if (arg('bpm', null)) { const bpm = +arg('bpm'); const beat = 60 / bpm; let best = { err: 9, phi: 0 }; for (let phi = 0; phi < beat; phi += .01) { let e = 0; for (const c of cuts) { const k = (c - phi) / beat; e += Math.abs(k - Math.round(k)) * beat; } e /= Math.max(1, cuts.length); if (e < best.err) best = { err: e, phi }; } cands.splice(0, cands.length, { bpm, beat, ...best }); }

function render(v) {
  const g = cands[Math.min(v, cands.length - 1)], beat = g.beat, step = beat / 4, phi = g.phi;
  let sd = (baseSeed * 7919 + v * 104729) >>> 0; const rnd = () => { sd |= 0; sd = sd + 0x6D2B79F5 | 0; let t = Math.imul(sd ^ sd >>> 15, 1 | sd); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const prog = M.prog[v % M.prog.length];
  const Lc = new Float32Array(N), Rc = new Float32Array(N), SEND = new Float32Array(N);
  const mutes = []; const muted = t => mutes.some(m => t >= m[0] && t < m[1]);
  // emit: sample-by-sample note rendering with pan and reverb send
  const emit = (t, len, fn, gain, pan = 0, send = .15) => { const s0 = Math.floor(t * SR); if (s0 >= N) return; const l = Math.cos((pan + 1) * Math.PI / 4), r = Math.sin((pan + 1) * Math.PI / 4); const n2 = Math.min(Math.floor(len * SR), N - s0); for (let i = 0; i < n2; i++) { const x = fn(i / SR, i) * gain; Lc[s0 + i] += x * l; Rc[s0 + i] += x * r; SEND[s0 + i] += x * send; } };
  const env = (x, len, a, r) => Math.min(1, x / a) * Math.min(1, Math.max(0, (len - x) / r));
  const pluck = (t, f, gain, pan, decay = 1.8, len = 1.4) => { const nn = Math.max(2, Math.round(SR / f)), buf = Float32Array.from({ length: nn }, () => rnd() * 2 - 1); let p = 0; emit(t, len, (x) => { const o = buf[p]; buf[p] = .5 * (buf[p] + buf[(p + 1) % nn]) * .997; p = (p + 1) % nn; return o * Math.exp(-x * decay); }, gain, pan, .25); };
  const pad = (t, notes, len, e, gain) => { for (const [k, m] of notes.entries()) { const f = mtof(m); let lp = 0; const fc = .02 + .05 * e; emit(t, len + .6, (x) => { const e1 = env(x, len + .6, .5, .6); let s = 0; for (const d of [.996, 1, 1.004]) s += 2 * ((x * f * d) % 1) - 1; lp += (s / 3 - lp) * fc; return lp * e1; }, gain, (k - 1) * .5, .5); } };
  const bass = (t, m, len, gain) => { const f = mtof(m); emit(t, len, (x) => (Math.sin(2 * Math.PI * f * x) + .25 * Math.sin(4 * Math.PI * f * x)) * env(x, len, .01, .08), gain, 0, .02); };
  const bell = (t, m, gain, pan = 0) => { const f = mtof(m); emit(t, 1.6, (x) => Math.sin(2 * Math.PI * f * x + 1.6 * Math.sin(2 * Math.PI * f * 3.5 * x) * Math.exp(-x * 5)) * Math.exp(-x * 2.6), gain, pan, .5); };
  const flute = (t, m, len, gain, pan) => { const f = mtof(m + 12); let nz = 0; emit(t, len + .15, (x) => { const vib = 1 + .006 * Math.sin(2 * Math.PI * 5.2 * x) * Math.min(1, x * 2); nz += ((rnd() * 2 - 1) - nz) * .3; return (Math.sin(2 * Math.PI * f * vib * x) + .3 * Math.sin(4 * Math.PI * f * vib * x) + .15 * nz) * env(x, len + .15, .09, .15); }, gain, pan, .4); };
  const tanpura = (t, m, gain) => pluck(t, mtof(m), gain, 0, .55, 4);
  const kick = (t, gain) => emit(t, .4, (x) => Math.sin(2 * Math.PI * (45 * x + 75 * (1 - Math.exp(-x * 26)) / 26)) * Math.exp(-x * 9), gain, 0, 0);
  const snare = (t, gain) => emit(t, .25, (x) => ((rnd() * 2 - 1) * .7 + Math.sin(2 * Math.PI * 190 * x) * .5) * Math.exp(-x * 17), gain, .1, .15);
  const hat = (t, gain, open = false, pan = .3) => emit(t, open ? .3 : .07, (x) => (rnd() * 2 - 1) * Math.exp(-x * (open ? 14 : 75)), gain, pan, .05);
  const tabla = (bol, t, gain) => { const sp = { dha: [92, 11, 1.4], ge: [110, 14, 1], na: [430, 28, .9], ti: [640, 55, .6], ka: [0, 70, .5], dhi: [330, 22, 1] }[bol]; if (!sp) return; const [f, d, gg] = sp;
    emit(t, .35, (x) => { const body = f ? Math.sin(2 * Math.PI * f * (1 + .45 * Math.exp(-x * 40)) * x) * Math.exp(-x * d) : (rnd() * 2 - 1) * Math.exp(-x * d); const ring = (bol === 'dha' || bol === 'dhi') ? Math.sin(2 * Math.PI * 140 * x) * Math.exp(-x * 9) * .6 : 0; return (body + ring) * gg; }, gain, -.15, .12); };
  const click = (t, gain, f = 1300) => emit(t, .08, (x) => Math.sin(2 * Math.PI * f * x) * Math.exp(-x * 80), gain, .2, .1);
  const impact = (t, gain) => { kick(t, gain); emit(t, 1.4, (x) => (rnd() * 2 - 1) * Math.exp(-x * 4) * .5, gain * .5, 0, .5); };
  const riser = (t0, t1, gain) => { let lp = 0; emit(t0, t1 - t0, (x) => { const u = x / (t1 - t0); lp += ((rnd() * 2 - 1) - lp) * (.01 + .5 * u * u); return lp * u * u * 3; }, gain, 0, .3); };
  const Lon = n => layers.has(n);
  // ---- hits: cue label -> action
  const hits = []; for (const s of scenes) for (const [k, t] of Object.entries(s.cues || {})) if (k !== 'start' && hitMap[k]) hits.push({ cue: k, t, type: hitMap[k] });
  for (const h of hits) if (h.type === 'drop') mutes.push([h.t - beat * .9, h.t - .01]);
  // ---- melody motif (pentatonic-ish subset of the scale), varied by seed
  const sub = [0, 1, 2, 4, 5].map(d => d % 7); const motif = Array.from({ length: 6 }, () => sub[Math.floor(rnd() * sub.length)] + (rnd() < .3 ? 7 : 0));
  const arpPat = Array.from({ length: 8 }, () => Math.floor(rnd() * 3));
  const firstStep = -16, lastStep = Math.ceil((total + 1 - phi) / step);
  for (let q = firstStep; q <= lastStep; q++) {
    const t = phi + q * step; if (t < 0 || t > total + 1) continue;
    const bar = Math.floor(q / 16), sInBar = ((q % 16) + 16) % 16, chordIdx = ((bar % prog.length) + prog.length) % prog.length, cd = prog[chordIdx];
    const e = eAt(t), mu = muted(t), triad = [deg(cd, -1), deg(cd + 2, -1), deg(cd + 4, -1)];
    // pad: once per bar
    if (sInBar === 0 && Lon('pad')) pad(t, [triad[0], triad[1] + 0, triad[2]].map(m => m + 12), beat * 4, e, .05 + .03 * e);
    if (sInBar === 0 && Lon('tanpura')) { for (const [i, d] of [[0, 4], [1, 0], [2, 0], [3, -7]]) tanpura(t + i * beat, deg(d, -2), .1); }
    if (sInBar === 0 && Lon('bell') && e > .3 && chordIdx === 0) bell(t, deg(cd + 4, 1), .05, .3);
    if (mu) continue;
    // bass: beat 1 and a syncopated pickup
    if (Lon('bass') && e > .3 && (sInBar === 0 || (sInBar === 10 && e > .55))) bass(t, deg(cd, -2), step * (sInBar === 0 ? 7 : 3), .2);
    // pluck arp on eighths
    if (Lon('pluck') && e > .42 && sInBar % 2 === 0) { const i = arpPat[(sInBar / 2) % 8]; const m = [deg(cd, 0), deg(cd + 2, 0), deg(cd + 4, 0)][i] + (sInBar % 8 === 6 ? 12 : 0); pluck(t, mtof(m), .09 + .05 * e, (sInBar % 4 ? .35 : -.35), moodName === 'deadpan_comedy' ? 6 : 2, moodName === 'deadpan_comedy' ? .3 : 1.2); }
    // melody (flute) every other bar when the bed is not too busy
    if (Lon('flute') && e > .15 && e < .85 && bar % 2 === 0 && sInBar % 4 === 0 && sInBar / 4 < motif.length / 1.5) { const k = Math.floor(sInBar / 4) + (bar % 4 === 2 ? 2 : 0); if (rnd() < .8) flute(t, deg(motif[k % motif.length], 0), beat * (rnd() < .5 ? 1.5 : 1), .11, -.2); }
    // drums by groove
    if (M.groove === 'four') {
      if (Lon('kick') && e > .5 && (sInBar === 0 || sInBar === 8 || (sInBar === 10 && e > .7))) kick(t, .42 * (e > .75 ? 1 : .8));
      if (Lon('snare') && e > .6 && (sInBar === 4 || sInBar === 12)) snare(t, .22);
      if (Lon('hat') && e > .45 && sInBar % 2 === 0) hat(t, .045 + .02 * e, sInBar === 14 && e > .6, (sInBar % 4) ? .3 : -.3);
      if (Lon('tabla') && e > .55 && (sInBar === 6 || sInBar === 11 || sInBar === 14)) tabla(sInBar === 6 ? 'na' : 'ti', t, .22);
    } else if (M.groove === 'keherwa') {
      if (Lon('tabla') && e > .25 && sInBar % 2 === 0) { const bols = ['dha', 'ge', 'na', 'ti', 'na', 'ka', 'dhi', 'na'], b = bols[(sInBar / 2) % 8]; if (e > .45 || b === 'dha' || b === 'na') tabla(b, t, .2 + .1 * e); }
      if (Lon('kick') && e > .6 && sInBar === 0) kick(t, .35);
      if (Lon('snare') && e > .7 && (sInBar === 4 || sInBar === 12)) snare(t, .16);
    } else { // sparse
      if (Lon('click') && e > .3 && (sInBar === 0 || sInBar === 6 || sInBar === 10)) click(t, .09 + .05 * e, sInBar === 0 ? 1500 : 1100);
      if (Lon('hat') && e > .35 && sInBar % 4 === 2) hat(t, .035 + .02 * e);
    }
  }
  // ---- section boundaries: riser into a louder scene, impact on the downbeat; scripted hits
  for (let i = 1; i < n; i++) { const t = scenes[i].start, d = energy[i] - energy[i - 1]; if (d > .12) riser(t - beat * 1.5, t, .1 + .1 * d); if (Math.abs(d) > .15) impact(t, .25 + .2 * Math.abs(d)); else if (Lon('bell')) bell(t, deg(0, 1), .04, -.2); }
  for (const h of hits) { if (h.type === 'impact' || h.type === 'drop') impact(h.t, .4); else if (h.type === 'chime') { bell(h.t, deg(4, 1), .09); bell(h.t + .08, deg(0, 2), .07, .3); } else if (h.type === 'riser') riser(h.t - 1.2, h.t, .18); }
  // ---- reverb (Schroeder-lite) on the send bus, duck under the voice, normalise
  const combs = [[1687, .78], [1931, .76], [2203, .74], [2477, .72]]; const wet = new Float32Array(N);
  for (const [dl, fb] of combs) { const buf = new Float32Array(dl); let p = 0; for (let i = 0; i < N; i++) { const o = buf[p]; buf[p] = SEND[i] + o * fb; p = (p + 1) % dl; wet[i] += o * .25; } }
  let peak = 0; for (let i = 0; i < N; i++) { const t = i / SR, d = duck(t); const sw = wet[i]; Lc[i] = Math.tanh(1.7 * (Lc[i] + sw * .8)) * d; Rc[i] = Math.tanh(1.7 * (Rc[i] + wet[(i + 211) % N] * .8)) * d; const a = Math.max(Math.abs(Lc[i]), Math.abs(Rc[i])); if (a > peak) peak = a; }
  const gn = .89 / (peak || 1), buf = Buffer.alloc(44 + N * 4); buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
  for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, Lc[i] * gn)) * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, Rc[i] * gn)) * 32767), 46 + i * 4); }
  // alignment of scene cuts to the grid
  const errs = cuts.map(c => { const k = (c - phi) / beat; return Math.abs(k - Math.round(k)) * beat * 1000; });
  const barErrs = cuts.map(c => { const k = (c - phi) / (beat * 4); return Math.abs(k - Math.round(k)) * beat * 4 * 1000; });
  return { buf, info: { variant: v + 1, bpm: g.bpm, phi: +phi.toFixed(3), progression: prog, align_mean_ms: Math.round(errs.reduce((a, b) => a + b, 0) / Math.max(1, errs.length)), align_max_ms: Math.round(Math.max(0, ...errs)), on_bar_mean_ms: Math.round(barErrs.reduce((a, b) => a + b, 0) / Math.max(1, barErrs.length)) } };
}
fs.mkdirSync('build', { recursive: true });
const infos = [];
for (let v = 0; v < nVar; v++) {
  const r = render(v); const f = `build/music_v${v + 1}.wav`; fs.writeFileSync(f, r.buf);
  const e = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', f, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' }).stderr; const sum = e.slice(e.lastIndexOf('Summary:'));
  const gg = re => { const m = sum.match(re); return m ? +m[1] : null; }; r.info.lufs = gg(/I:\s+(-?[\d.]+) LUFS/); r.info.true_peak = gg(/Peak:\s+(-?[\d.]+) dBFS/); infos.push(r.info);
  console.log(`variant ${v + 1}: ${r.info.bpm} bpm, cuts off the beat by ${r.info.align_mean_ms} ms avg (max ${r.info.align_max_ms}), ${r.info.lufs} LUFS (before the mix), peak ${r.info.true_peak} dBFS -> ${f}`);
}
const chosen = infos[Math.min(pick, infos.length) - 1];
fs.copyFileSync(`build/music_v${chosen.variant}.wav`, 'build/music_composed.wav');
fs.writeFileSync('build/music.json', JSON.stringify({ composer: true, mood: moodName, scale: scaleName, root: rootName, seed: baseSeed, picked: chosen.variant, energy, hits: Object.entries(hitMap), variants: infos }, null, 1));
console.log(`mood ${moodName} (${scaleName} on ${rootName}); picked variant ${chosen.variant} -> build/music_composed.wav. Listen to the others (build/music_v*.wav) and rerun with --pick N. Then: node audio.mjs`);
