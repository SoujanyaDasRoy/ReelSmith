// Reelsmith QA gate: judges pace, rhythm, captions and audio of a reel from its own data. Node + ffmpeg only (no Python).
//   node qa.mjs [--profile explainer|hype|calm] [--timings build/timings.json] [--audio build/audio.wav] [--video out/reel.mp4] [--json build/qa_report.json]
// Exit code 1 if any check FAILs, so an agent (Claude, Antigravity, anything) must fix and re-run. WARN = fix if cheap, or say why you kept it.
// What it cannot do: hear the audio, judge comedy timing or taste. It prints a "listen here" checklist for the human for that.
import fs from 'fs'; import path from 'path'; import url from 'url'; import { spawnSync } from 'child_process';
const here = path.dirname(url.fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const rulesAll = JSON.parse(fs.readFileSync(fs.existsSync('qa_rules.json') ? 'qa_rules.json' : path.join(here, 'qa_rules.json'), 'utf8'));
const profile = arg('profile', rulesAll.default);
const R = { ...rulesAll.profiles.explainer, ...(rulesAll.profiles[profile] || {}) };
const tfile = arg('timings', 'build/timings.json');
if (!fs.existsSync(tfile)) { console.error('missing ' + tfile + ' (run tts.mjs first)'); process.exit(2); }
const T = JSON.parse(fs.readFileSync(tfile, 'utf8'));
const checks = []; const listen = [];
const num = x => Math.round(x * 100) / 100;
// judge a value against {warn_above, fail_above, warn_below, fail_below}
function judge(id, what, value, rule, unit = '', where = '') {
  let st = 'PASS', limit = '';
  if (rule) {
    if (rule.fail_above !== undefined && value > rule.fail_above) { st = 'FAIL'; limit = '> ' + rule.fail_above; }
    else if (rule.fail_below !== undefined && value < rule.fail_below) { st = 'FAIL'; limit = '< ' + rule.fail_below; }
    else if (rule.warn_above !== undefined && value > rule.warn_above) { st = 'WARN'; limit = '> ' + rule.warn_above; }
    else if (rule.warn_below !== undefined && value < rule.warn_below) { st = 'WARN'; limit = '< ' + rule.warn_below; }
  }
  checks.push({ id, what, value: num(value), unit, status: st, limit, where });
}
// ---- syllable estimate (Devanagari + Latin); heuristic, good enough for relative pace
function syl(w) {
  const cs = [...w]; let n = 0, lastCons = false;
  for (let i = 0; i < cs.length; i++) {
    const c = cs[i].codePointAt(0);
    if (c >= 0x0904 && c <= 0x0914) { n++; lastCons = false; }
    else if ((c >= 0x0915 && c <= 0x0939) || (c >= 0x0958 && c <= 0x095F)) { if (cs[i + 1] !== '\u094D') n++; lastCons = cs[i + 1] === undefined || /[^\u093E-\u094D\u0901-\u0903]/.test(cs[i + 1]); }
    else if ((c >= 0x093E && c <= 0x094C) || (c >= 0x0901 && c <= 0x0903)) lastCons = false;
  }
  if (n) return (n > 1 && lastCons) ? n - 1 : n;           // schwa deletion at word end ("baarah" = baa-rah)
  const m = w.toLowerCase().replace(/[^a-z]/g, '').replace(/e$/, '').match(/[aeiouy]+/g);
  return m ? m.length : (/\d/.test(w) ? 2 : 0);
}
let SC = {}; try { for (const s of JSON.parse(fs.readFileSync(arg('script', 'script.json'), 'utf8')).scenes) SC[s.id] = s; } catch {}
const S = T.scenes, total = T.total || (S.at(-1).start + S.at(-1).dur);
const allWords = S.flatMap(s => s.words.map(w => ({ ...w, scene: s.id })));

// ---- 1. length and hook
judge('length', 'Total length', total, R.length_s, 's');
if (allWords.length) judge('first_word', 'Voice starts at', allWords[0].t0, R.first_word_s, 's', 'hook'); else checks.push({ id: 'words', what: 'No word timings (footage without a transcript): voice pace and gap checks skipped; give edit.json a transcript to enable them', value: 0, unit: '', status: 'WARN', limit: '', where: '' });
const firstCap = S[0].caps?.[0]?.t ?? 0; judge('first_caption', 'First caption at', firstCap, R.first_caption_s, 's', 'hook');

// ---- 2. speech pace per scene
const rates = [];
for (const s of S) {
  if (!s.words.length) continue;
  const n = s.words.reduce((a, w) => a + syl(w.w), 0), span = s.words.at(-1).t1 - s.words[0].t0;
  const r = n / Math.max(.5, span); rates.push({ id: s.id, r, wpm: s.words.length / span * 60 });
  judge('pace:' + s.id, 'Speech rate', r, R.speech_syl_per_s, 'syl/s', s.id);
}
if (rates.length > 1) { const mx = Math.max(...rates.map(x => x.r)), mn = Math.min(...rates.map(x => x.r)); judge('pace_ratio', 'Fastest vs slowest scene', mx / mn, R.scene_rate_ratio, 'x', rates.find(x => x.r === mx).id + ' vs ' + rates.find(x => x.r === mn).id); }
const allSyl = allWords.reduce((a, w) => a + syl(w.w), 0);
const avgRate = allWords.length ? allSyl / (allWords.at(-1).t1 - allWords[0].t0) : 0;

// ---- 3. gaps between words (dead air in the voice track)
// a deliberate beat: script.json scene {"allow_gap": 1.6} (seconds) excuses the pause BEFORE that scene's words; say why in the script
let worst = { g: 0, at: 0 };
for (let i = 1; i < allWords.length; i++) { const g = allWords[i].t0 - allWords[i - 1].t1 - 0; const ag = SC[allWords[i].scene]?.allow_gap; if (ag && g <= ag) continue; if (g > worst.g) worst = { g, at: allWords[i - 1].t1, scene: allWords[i].scene }; }
judge('gap', 'Longest silence between words', worst.g, R.gap_s, 's', 'at ' + num(worst.at) + 's (' + worst.scene + ')');
const bigGaps = []; for (let i = 1; i < allWords.length; i++) { const g = allWords[i].t0 - allWords[i - 1].t1; if (g > (R.gap_s.warn_above ?? .55)) bigGaps.push(num(allWords[i - 1].t1)); }
if (bigGaps.length) listen.push('Pauses over ' + (R.gap_s.warn_above ?? .55) + 's at ' + bigGaps.slice(0, 8).join('s, ') + 's: confirm each is a deliberate beat, not a stall.');

// ---- 4. scene rhythm and visual events
for (const s of S) judge('scene_len:' + s.id, 'Scene length', s.dur, R.scene_len_s, 's', s.id);
judge('cuts_per_min', 'Scene changes per minute', (S.length - 1) / (total / 60), R.cuts_per_min, '/min');
const ev = [0, total]; for (const s of S) { ev.push(s.start); for (const c of s.caps || []) ev.push(c.t); for (const [k, v] of Object.entries(s.cues || {})) if (k !== 'start' && typeof v === 'number') ev.push(v); }
ev.sort((a, b) => a - b); let eg = { g: 0, at: 0 }; for (let i = 1; i < ev.length; i++) if (ev[i] - ev[i - 1] > eg.g) eg = { g: ev[i] - ev[i - 1], at: ev[i - 1] };
judge('event_gap', 'Longest stretch with nothing new on screen', eg.g, R.event_gap_s, 's', 'from ' + num(eg.at) + 's');

// ---- 5. captions
for (const s of S) (s.caps || []).forEach((c, i) => {
  const next = s.caps[i + 1] ? s.caps[i + 1].t : s.start + s.dur - .05, hold = next - c.t, chars = c.text.replace(/\*/g, '').length;
  const id = s.id + '#' + i; judge('cap_hold:' + id, 'Caption on screen', hold, R.caption_hold_s, 's', '"' + c.text.replace(/\*/g, '').slice(0, 30) + '"');
  judge('cap_cps:' + id, 'Caption reading speed', chars / hold, R.caption_cps, 'chars/s', id); judge('cap_len:' + id, 'Caption length', chars, R.caption_chars, 'chars', id);
});

// ---- 6. audio (ffmpeg): loudness, true peak, dead air, voice-vs-gap level
const afile = arg('audio', 'build/audio.wav'); let audio = null;
const ff = (args) => spawnSync('ffmpeg', ['-hide_banner', '-nostats', ...args], { encoding: 'utf8', maxBuffer: 1 << 28 });
if (fs.existsSync(afile) && ff(['-version']).status === 0) {
  const e = ff(['-i', afile, '-af', 'ebur128=peak=true:framelog=verbose', '-f', 'null', '-']).stderr;
  const sum = e.slice(e.lastIndexOf('Summary:'));
  const g = re => { const m = sum.match(re); return m ? parseFloat(m[1]) : NaN; };
  audio = { lufs: g(/I:\s+(-?[\d.]+) LUFS/), lra: g(/LRA:\s+(-?[\d.]+) LU/), tp: g(/Peak:\s+(-?[\d.]+) dBFS/) };
  if (!isNaN(audio.lufs)) judge('lufs', 'Integrated loudness', audio.lufs, R.lufs, 'LUFS');
  if (!isNaN(audio.tp)) judge('true_peak', 'True peak', audio.tp, R.true_peak_db, 'dBFS');
  if (!isNaN(audio.lra)) judge('lra', 'Loudness range', audio.lra, R.lra_lu, 'LU');
  // momentary loudness vs. word windows: how far the bed sits under the voice
  const M = [...e.matchAll(/t:\s*([\d.]+)\s+TARGET:[^M]*M:\s*(-?[\d.]+|-inf)/g)].map(m => [parseFloat(m[1]), parseFloat(m[2])]).filter(x => isFinite(x[1]));
  const inW = t => allWords.some(w => t >= w.t0 && t <= w.t1), gapT = t => !inW(t) && allWords.every(w => Math.abs(t - w.t0) > .15 && Math.abs(t - w.t1) > .15);
  const a = M.filter(x => inW(x[0])).map(x => x[1]), b = M.filter(x => gapT(x[0])).map(x => x[1]);
  if (a.length && b.length) { const va = a.reduce((x, y) => x + y) / a.length, vb = b.reduce((x, y) => x + y) / b.length; audio.voice_vs_gap_db = num(va - vb); checks.push({ id: 'duck', what: 'Level while voice speaks vs in pauses (info)', value: num(va - vb), unit: 'dB', status: 'INFO', limit: '', where: 'positive = voice louder than the pause bed' }); }
  const sd = ff(['-i', afile, '-af', 'silencedetect=noise=-50dB:d=0.4', '-f', 'null', '-']).stderr;
  const sil = [...sd.matchAll(/silence_end:\s*([\d.]+)\s*\|\s*silence_duration:\s*([\d.]+)/g)].map(m => ({ end: +m[1], dur: +m[2] })).filter(x => x.end < total - .6);
  const worstSil = sil.reduce((a, x) => x.dur > a.dur ? x : a, { dur: 0, end: 0 }); judge('dead_air', 'Digital silence (everything silent)', worstSil.dur, R.dead_air_s, 's', worstSil.dur ? 'ends ' + num(worstSil.end) + 's' : '');
} else checks.push({ id: 'audio', what: 'Audio analysis skipped (no ' + afile + ' or no ffmpeg)', value: 0, unit: '', status: 'WARN', limit: '', where: '' });

// ---- 6b. music composer report (optional): how far the scene cuts sit from the beat grid
try { const mj = JSON.parse(fs.readFileSync('build/music.json', 'utf8')); if (mj.composer) { const v = mj.variants.find(x => x.variant === mj.picked) || mj.variants[0]; judge('music_align', 'Scene cuts vs music beat grid (mean)', v.align_mean_ms, R.music_align_ms, 'ms', mj.mood + ' ' + v.bpm + ' bpm'); listen.push('Music (' + mj.mood + ', variant ' + mj.picked + '): does it fit the mood and stay out of the voice? If not, listen to build/music_v*.wav and rerun compose.mjs --pick N.'); } } catch {}
// ---- 6c. real sound effects: licence reminders
try { const idx = JSON.parse(fs.readFileSync('build/sfx/index.json', 'utf8')); const req = Object.values(idx).filter(e => e.attribution_required); if (req.length) listen.push('Sound credits REQUIRED in the post (CC BY): ' + req.map(e => e.attribution || e.title).join(' | ') + '  (node sfx.mjs credits)'); listen.push(Object.keys(idx).length + ' real sound file(s) used: confirm each licence on its landing page (build/sfx/CREDITS.md).'); } catch {}
// ---- 7. video file (optional)
const vfile = arg('video', '');
if (vfile) {
  const pr = spawnSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', vfile], { encoding: 'utf8' });
  if (pr.status !== 0) checks.push({ id: 'video', what: 'Cannot read video ' + vfile, value: 0, unit: '', status: 'FAIL', limit: '', where: '' });
  else {
    const j = JSON.parse(pr.stdout), v = j.streams.find(s => s.codec_type === 'video'), a = j.streams.find(s => s.codec_type === 'audio'), d = parseFloat(j.format.duration);
    const fps = v.avg_frame_rate.split('/').reduce((x, y) => x / y);
    const bad = []; if (v.width !== 1080 || v.height !== 1920) bad.push(v.width + 'x' + v.height); if (v.codec_name !== 'h264') bad.push(v.codec_name); if (v.pix_fmt !== 'yuv420p') bad.push(v.pix_fmt); if (Math.abs(fps - 30) > .1) bad.push(num(fps) + 'fps'); if (!a) bad.push('no audio');
    checks.push({ id: 'video_format', what: 'Video format (1080x1920 h264 yuv420p 30fps + audio)', value: 0, unit: '', status: bad.length ? 'FAIL' : 'PASS', limit: bad.join(', '), where: vfile });
    judge('av_sync', 'Video vs timings length difference', Math.abs(d - total), { warn_above: .35, fail_above: 1.2 }, 's');
  }
}
// ---- human listening checklist (the part a script cannot judge)
const peak = rates.length ? rates.reduce((a, x) => x.r > a.r ? x : a, rates[0]) : null;
listen.unshift('Listen once at the start: does the first 2 seconds make you want to stay? (hook: "' + (S[0].caps?.[0]?.text || '').replace(/\*/g, '') + '")');
if (peak) listen.push('Fastest scene "' + peak.id + '" (' + num(peak.r) + ' syl/s): intelligible, or too rushed for the jargon in it?');
listen.push('Each joke or reveal: is there a half-second beat before it and does the music stay out of its way?');
listen.push('Listen to the last 3 seconds: does the ending land clean (no cut-off word, no abrupt music stop)?');
listen.push('Technical Hindi/English words (names, numbers): pronounced acceptably by the TTS voice?');

const count = s => checks.filter(c => c.status === s).length, fails = count('FAIL'), warns = count('WARN');
const report = { profile, total: num(total), avg_syl_per_s: num(avgRate), scenes: S.length, audio, summary: { pass: count('PASS'), warn: warns, fail: fails }, checks, listen };
fs.mkdirSync('build', { recursive: true }); fs.writeFileSync(arg('json', 'build/qa_report.json'), JSON.stringify(report, null, 1));
const tag = { PASS: ' ok ', WARN: 'WARN', FAIL: 'FAIL', INFO: 'info' };
console.log('Reelsmith QA  profile=' + profile + '  length=' + num(total) + 's  scenes=' + S.length + '  avg pace=' + num(avgRate) + ' syl/s');
for (const c of checks) if (c.status !== 'PASS') console.log('[' + tag[c.status] + '] ' + c.what + (c.where ? ' (' + c.where + ')' : '') + ': ' + c.value + c.unit + (c.limit ? '  limit ' + c.limit : ''));
console.log('\n' + checks.filter(c => c.status === 'PASS').length + ' checks ok, ' + warns + ' warnings, ' + fails + ' failures.  Full report: build/qa_report.json');
console.log('\nHuman listening checklist (a script cannot judge these):'); listen.forEach((l, i) => console.log(' ' + (i + 1) + '. ' + l));
process.exit(fails ? 1 : 0);
