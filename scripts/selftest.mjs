// Offline regression test: replays examples/upi-english (cached voice + timings) through music, mix, data build, QA and the footage editor, and checks the
// numbers against examples/upi-english/expected.json. Needs only Node 18+ and ffmpeg (no network, no npm install, no browser).
//   node scripts/selftest.mjs [--keep]      exit code 0 = all good. Run it after installing the skill in any agent, and after changing any script.
import fs from 'fs'; import os from 'os'; import path from 'path'; import url from 'url'; import { spawnSync } from 'child_process';
const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..'), ex = path.join(root, 'examples/upi-english'), EXP = JSON.parse(fs.readFileSync(path.join(ex, 'expected.json'), 'utf8'));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'reelsmith-selftest-')); const results = []; const ok = (name, pass, detail = '') => { results.push({ name, pass, detail }); console.log((pass ? ' ok  ' : 'FAIL ') + name + (detail ? '  ' + detail : '')); };
const sh = (cmd, args, o = {}) => spawnSync(cmd, args, { cwd: tmp, encoding: 'utf8', maxBuffer: 1 << 28, ...o });
const script = n => path.join(root, 'scripts', n);
const inr = (v, [a, b]) => v >= a && v <= b;
try {
  if (sh('ffmpeg', ['-version']).status !== 0) { console.error('ffmpeg not found on PATH'); process.exit(2); }
  fs.cpSync(ex, tmp, { recursive: true });                                                  // script.json + build/parts + build/timings.json
  const T = JSON.parse(fs.readFileSync(path.join(tmp, 'build/timings.json'), 'utf8'));
  ok('timings: scene count', T.scenes.length === EXP.scenes, String(T.scenes.length)); ok('timings: total length', inr(T.total, EXP.total_s), T.total.toFixed(2) + 's');
  let r = sh('node', [script('build_sd.mjs')]); ok('build_sd: styles_data.js from script visual blocks', r.status === 0 && /(\d+) warnings/.exec(r.stdout)?.[1] == EXP.build_sd_warnings && fs.existsSync(path.join(tmp, 'styles_data.js')), r.stdout.trim().split('\n').pop() + (r.stderr ? ' ' + r.stderr.trim() : ''));
  r = sh('node', [script('compose.mjs'), '--variants', '1']); const mj = fs.existsSync(path.join(tmp, 'build/music.json')) ? JSON.parse(fs.readFileSync(path.join(tmp, 'build/music.json'), 'utf8')) : null; const v = mj && mj.variants[0];
  ok('compose: music written', r.status === 0 && !!v && fs.existsSync(path.join(tmp, 'build/music_composed.wav')), r.status ? r.stderr.slice(-200) : `${v?.bpm} bpm`);
  if (v) { ok('compose: cuts near the beat grid', v.align_mean_ms <= EXP.compose.align_mean_ms_max, v.align_mean_ms + ' ms'); ok('compose: loudness / peak sane', inr(v.lufs, EXP.compose.lufs) && v.true_peak <= EXP.compose.true_peak_max, `${v.lufs} LUFS, ${v.true_peak} dBFS`); }
  r = sh('node', [script('audio.mjs')]); ok('audio: mix rendered', r.status === 0 && fs.existsSync(path.join(tmp, 'build/audio.wav')), r.status ? r.stderr.slice(-200) : r.stdout.trim());
  r = sh('node', [script('qa.mjs'), '--json', 'build/qa_report.json']); const q = fs.existsSync(path.join(tmp, 'build/qa_report.json')) ? JSON.parse(fs.readFileSync(path.join(tmp, 'build/qa_report.json'), 'utf8')) : null;
  if (q) { const au = q.audio || {}; ok('mix: loudness in range', inr(au.lufs, EXP.mix.lufs), au.lufs + ' LUFS'); ok('mix: true peak', au.tp <= EXP.mix.true_peak_max, au.tp + ' dBFS'); ok('qa: no FAIL checks', q.summary.fail === EXP.qa.fails, `${q.summary.pass} ok, ${q.summary.warn} warn, ${q.summary.fail} fail`); ok('qa: warnings within budget', q.summary.warn <= EXP.qa.max_warnings, q.summary.warn + ' warn'); } else ok('qa: report written', false, r.stderr.slice(-200));
  // size guard: the core skill must stay small (heavy engines and upstream docs are fetched on demand, never bundled)
  let total = 0, biggest = { n: '', s: 0 }; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else { const s = fs.statSync(p).size; total += s; if (s > biggest.s) biggest = { n: path.relative(root, p), s }; } } })(root);
  ok('size: core skill stays small (< 4 MB total, no file > 1 MB)', total < 4 * 1048576 && biggest.s < 1048576, `${(total / 1048576).toFixed(2)} MB, largest ${biggest.n} ${(biggest.s / 1024) | 0} KB`);
  // footage editor on a synthetic clip: tone bursts with silences, plain test pattern video
  r = sh('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc2=s=1280x720:r=30:d=14', '-f', 'lavfi', '-i', "aevalsrc='sin(2*PI*330*t)*(lt(mod(t,4.5),2.6))':s=44100:d=14", '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', 'clip.mp4']);
  r = sh('node', [script('edit.mjs'), 'plan', 'talking', 'clip.mp4', '--noise', '-40dB']); const e = fs.existsSync(path.join(tmp, 'edit/edit.json')) ? JSON.parse(fs.readFileSync(path.join(tmp, 'edit/edit.json'), 'utf8')) : null;
  ok('edit: silence-based plan', !!e && inr(e.segments.length, EXP.edit.segments), e ? e.segments.length + ' segments' : r.stderr.slice(-200));
  if (e) { r = sh('node', [script('edit.mjs'), 'render', 'edit/edit.json', 'out/t.mp4', '--preview']); const pr = r.status === 0 && fs.existsSync(path.join(tmp, 'out/t.mp4')) ? sh('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', 'out/t.mp4']).stdout : ''; ok('edit: preview render', !!pr && inr(parseFloat(pr), EXP.edit.out_s), pr ? parseFloat(pr).toFixed(1) + 's' : r.stderr.slice(-300)); }
  // brand layer: solid-colour test logo (no alpha) on a 6 s 1080x1920 clip; checks it runs, keeps the length and the video format
  sh('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc2=s=1080x1920:r=30:d=6', '-f', 'lavfi', '-i', 'sine=f=220:d=6', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', 'v.mp4']);
  sh('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=0x2b2f77:s=300x100', '-frames:v', '1', 'logo.png']);
  r = sh('node', [script('brand.mjs'), 'v.mp4', '--logo', 'logo.png', '--closing', '1.5', '--out', 'out/v_branded.mp4']); const bd = r.status === 0 && fs.existsSync(path.join(tmp, 'out/v_branded.mp4')) ? sh('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=pix_fmt,color_range', '-of', 'default=nw=1', 'out/v_branded.mp4']).stdout : '';
  const dur = parseFloat(((/duration=([0-9.]+)/).exec(bd) || [])[1]);
  ok('brand: logo placed, length and format kept', !!bd && /pix_fmt=yuv420p/.test(bd) && /color_range=tv/.test(bd) && Math.abs(dur - 6) < .3, r.status ? r.stderr.slice(-200) : String(r.stdout || '').split(String.fromCharCode(10))[1]?.trim());
  // real sound effects (offline): the download guard refuses without --yes; a local wav is placed at scene starts and a cue by audio.mjs
  r = sh('node', [script('sfx.mjs'), 'get', '00000000', '--name', 'x']); ok('sfx: refuses to download without the user\'s --yes', r.status === 2 && /Ask the user/.test(r.stderr), 'exit ' + r.status);
  fs.mkdirSync(path.join(tmp, 'build/sfx'), { recursive: true }); sh('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'sine=f=880:d=0.4', 'build/sfx/ding.wav']);
  const sj = JSON.parse(fs.readFileSync(path.join(tmp, 'script.json'), 'utf8')); sj.sfx_scene_start = 'file:build/sfx/ding.wav@0.4'; sj.scenes[2].sfx = { once: 'file:build/sfx/ding.wav@0.9' }; fs.writeFileSync(path.join(tmp, 'script.json'), JSON.stringify(sj));
  fs.copyFileSync(path.join(tmp, 'build/audio.wav'), path.join(tmp, 'without_sfx.wav')); r = sh('node', [script('audio.mjs')]);
  const differs = r.status === 0 && !/sfx file missing/.test(r.stderr) && fs.statSync(path.join(tmp, 'build/audio.wav')).size === fs.statSync(path.join(tmp, 'without_sfx.wav')).size && Buffer.compare(fs.readFileSync(path.join(tmp, 'build/audio.wav')), fs.readFileSync(path.join(tmp, 'without_sfx.wav'))) !== 0;
  ok('sfx: real sound files placed by audio.mjs', differs, r.status ? r.stderr.slice(-200) : 'mix changed');
} finally { if (!process.argv.includes('--keep')) fs.rmSync(tmp, { recursive: true, force: true }); else console.log('kept ' + tmp); }
const bad = results.filter(x => !x.pass).length; console.log(`\n${results.length - bad}/${results.length} checks passed` + (bad ? ` (${bad} FAILED)` : '')); process.exit(bad ? 1 : 0);
