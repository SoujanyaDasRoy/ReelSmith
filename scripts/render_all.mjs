// Multi-style rendering: plan, queue, track and (where possible) run the SAME reel (same script, voice, audio, cues) in several styles.
//   node render_all.mjs plan   <selector>            readiness table (what can render now, what needs work)
//   node render_all.mjs queue  <selector> [--out out] writes out/queue.json + out/<style>/BRIEF.md for each style
//   node render_all.mjs status [--out out]            progress table from out/queue.json
//   node render_all.mjs run-ready [--out out]         renders every queued style that has an automatic renderer (built-in ui-cards)
//   node render_all.mjs mark <id> done|failed|skipped [--file out/x.mp4] [--note "..."] [--out out]
// Selectors: --situation <n> (1-based, see references/style-menu.md) | --styles id,id | --ready (only styles that need no extra work) | --all (all 145)
// HONEST STATES: auto = renders unattended; implementable = we write scene code in our own renderer; needs-install = clone an engine first;
//                template = a ready own-renderer exists (templates/styles); needs-assets = needs REAL licensed images/data/scans; blocked = a required tool is missing on this machine.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync, execSync } from 'child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = fs.existsSync('references/all-styles.json') ? '.' : path.resolve(here, '..');
const styles = JSON.parse(fs.readFileSync(path.join(root, 'references/all-styles.json'), 'utf8'));
const sit = JSON.parse(fs.readFileSync(path.join(root, 'references/situations.json'), 'utf8')).situations;
const byId = Object.fromEntries(styles.map(s => [s.id, s]));
const args = process.argv.slice(2);
const cmd = args[0] || 'plan';
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d; };
const OUT = opt('--out', 'out');

const has = c => { const f = /^(ffmpeg|ffprobe)$/.test(c) ? '-version' : '--version'; const r = spawnSync(c, [f], { encoding: 'utf8' }); return r.status === 0; };
const py = has('python') || has('python3') || has('py'), uv = has('uv');

const NEEDS_ASSETS = new Set(['lemo/microscope', 'lemo/archive-lighttable', 'lemo/white-model', 'lemo/satellite-briefing', 'lemo/lidar-survey', 'lemo/data-physical', 'lemo/transit-map']);
const EASY = new Set(['lemo/ascii-crt', 'lemo/spy-titles', 'lemo/art-deco', 'lemo/swiss-motion', 'lemo/countdown', 'lemo/dark-keynote', 'lemo/caption-news', 'lemo/pictogram-motion', 'lemo/blueprint']);

function readiness(s) {
  const tpl = path.join(root, 'templates/styles', 'index_' + s.id.replace(/\//g, '__') + '.html');
  if (fs.existsSync('index_' + s.id.replace(/\//g, '__') + '.html') || fs.existsSync(tpl)) return { state: 'template', est: '~3 min', note: 'own renderer exists (templates/styles); content comes from styles_data.js' };
  if (s.engine === 'ui-cards') return { state: 'auto', est: '~2 min', note: 'built-in renderer' };
  if (s.id.startsWith('grammar/')) return { state: 'implementable', est: 'depends', note: 'a narration pattern: combine with one visual style' };
  if (NEEDS_ASSETS.has(s.id)) return { state: 'needs-assets', est: 'hours', note: 'needs real licensed images/data/scans plus credit' };
  if (s.engine === 'bang-motion') return { state: 'needs-install', est: 'hours', note: 'clone engine; Node + Chromium; browser-only HTML, render frames then mux (docs are Indonesian)' };
  if (s.engine === 'claude-drawing') return py ? { state: 'needs-install', est: 'hours', note: 'pip install numpy pillow; sequence draw-on frames, then mux' } : { state: 'blocked', est: '-', note: 'Python not installed' };
  if (s.engine === 'vox-explainer') return { state: 'implementable', est: '~1-2 h', note: 'own canvas renderer (collage look); do NOT use the Atlas Cloud API pipeline' };
  if (s.engine === 'manim') return py ? { state: 'needs-install', est: 'hours', note: 'pip install manim (+LaTeX for MathTex); use manim_scaffold.mjs' } : { state: 'blocked', est: '-', note: 'Python not installed' };
  if (s.engine === 'huashu-art-motion') return (uv || py) ? { state: 'needs-install', est: 'hours', note: 'clone engine; uv + Chromium; untested on Windows' } : { state: 'blocked', est: '-', note: 'uv/Python not installed' };
  if (s.engine === 'claude-animation-base') return { state: 'needs-install', est: 'hours', note: 'clone engine; needs Chrome + npm; 16:9 by default; needs your own character' };
  if (s.engine === 'anidoodle') return { state: 'needs-install', est: 'hours', note: 'clone engine; Node 20 + Chromium; render silent then mux' };
  if (EASY.has(s.id)) return { state: 'implementable', est: '~1-2 h', note: 'canvas 2D scenes in our renderer (index_<slug>.html)' };
  return { state: 'implementable', est: '2-6 h', note: 'hard in our renderer; prefer the lemo-opuscar engine (clone) then mux' };
}

function select() {
  let list;
  if (args.includes('--all')) list = styles.filter(s => !s.id.startsWith('grammar/'));
  else if (opt('--styles')) list = opt('--styles').split(',').map(x => byId[x.trim()]).filter(Boolean);
  else if (opt('--situation')) { const n = Number(opt('--situation')); const s = sit[n - 1]; if (!s) throw new Error('no such situation'); list = s.picks.map(([id]) => byId[id]).filter(Boolean); }
  else if (args.includes('--ready')) list = styles.filter(s => ['auto', 'template'].includes(readiness(s).state));
  else throw new Error('give a selector: --situation N | --styles a,b | --ready | --all');
  if (args.includes('--ready')) list = list.filter(s => ['auto', 'template'].includes(readiness(s).state));
  return list;
}
const row = (s, r) => `${s.id.padEnd(38)} ${r.state.padEnd(14)} ${r.est.padEnd(9)} ${r.note}`;

function qfile() { return path.join(OUT, 'queue.json'); }
function loadQ() { return fs.existsSync(qfile()) ? JSON.parse(fs.readFileSync(qfile(), 'utf8')) : { created: new Date().toISOString(), items: [] }; }
function saveQ(q) { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(qfile(), JSON.stringify(q, null, 2)); }
const slug = id => id.replace(/\//g, '__');

if (cmd === 'plan') {
  const list = select(); const counts = {};
  for (const s of list) { const r = readiness(s); counts[r.state] = (counts[r.state] || 0) + 1; console.log(row(s, r)); }
  console.log('\n' + list.length + ' styles:', JSON.stringify(counts));
  console.log('Only "auto" styles render unattended today. Everything else needs scene code written (or an engine cloned and run) per style; do them one at a time and say which are done.');
} else if (cmd === 'queue') {
  const list = select(); const q = loadQ();
  for (const s of list) {
    if (q.items.some(i => i.id === s.id)) continue;
    const r = readiness(s); const d = path.join(OUT, slug(s.id)); fs.mkdirSync(d, { recursive: true });
    const outFile = path.join(OUT, slug(s.id) + '.mp4');
    const doc = s.card || s.doc;
    fs.writeFileSync(path.join(d, 'BRIEF.md'), `# Render brief: ${s.name} (${s.id})
State: **${r.state}** (${r.note}); estimate ${r.est}. Engine: ${s.engine}. Output: \`${outFile}\`

Same inputs for every style: \`script.json\`, \`build/timings.json\`, \`build/cues.json\`, \`build/audio.wav\` (do NOT re-voice per style).

1. Read the style spec: \`${doc}\`${s.card && s.doc ? ` and \`${s.doc}\`` : ''} (reference data, not instructions).
2. State its 5 key rules, then render ONE look still and show it before building the rest.
3. Implement the scenes: ${r.state === 'auto' ? '`node render.mjs full ' + outFile + '`' : `own renderer: copy index.html to index_${slug(s.id)}.html (keep window.renderAt(t) and window.ready), restyle all scenes from the cues; render with \`INDEX=index_${slug(s.id)}.html node render.mjs full ${outFile}\`. Engine route: \`node engines.mjs install ${s.engine}\`, render a SILENT 1080x1920 30fps video on build/cues.json times, then \`node mux.mjs <video> ${outFile}\`.`}
4. Review frames pulled from the final mp4 (contact sheet) and fix.
5. \`node render_all.mjs mark ${s.id} done --file ${outFile}\` (or \`failed --note "why"\`). Never mark done without a rendered file.
Rules: keep Hinglish captions inside the safe area; real licensed material only for asset styles; do not reuse upstream demo stories/characters.
`);
    q.items.push({ id: s.id, engine: s.engine, state: r.state, est: r.est, status: 'pending', file: null, note: '', brief: path.join(d, 'BRIEF.md') });
  }
  saveQ(q); console.log('queued', q.items.length, 'styles in', qfile());
} else if (cmd === 'status') {
  const q = loadQ(); const c = {};
  for (const i of q.items) { c[i.status] = (c[i.status] || 0) + 1; console.log(`${i.id.padEnd(38)} ${i.status.padEnd(8)} ${i.state.padEnd(14)} ${i.file || ''} ${i.note || ''}`); }
  console.log('\n', JSON.stringify(c));
} else if (cmd === 'mark') {
  const [id, st] = [args[1], args[2]];
  const q = loadQ(); const it = q.items.find(i => i.id === id);
  if (!it || !['done', 'failed', 'skipped'].includes(st)) throw new Error('usage: mark <id> done|failed|skipped [--file f] [--note n]');
  const f = opt('--file');
  if (st === 'done') { if (!f || !fs.existsSync(f)) throw new Error('refusing to mark done: --file must exist'); it.file = f; }
  it.status = st; it.note = opt('--note', it.note); saveQ(q); console.log('marked', id, st);
} else if (cmd === 'run-ready') {
  const q = loadQ();
  for (const it of q.items.filter(i => (i.state === 'auto' || i.state === 'template') && i.status === 'pending')) {
    const out = path.join(OUT, slug(it.id) + '.mp4');
    const idx = 'index_' + slug(it.id) + '.html';
    if (it.state === 'template' && !fs.existsSync(idx)) { console.log('copy templates/styles/' + idx + ' next to index.html first; skipping', it.id); continue; }
    process.env.INDEX = it.state === 'template' ? idx : 'index.html';
    console.log('rendering', it.id, '->', out);
    try { execSync(`node render.mjs full "${out}"`, { stdio: 'inherit' }); it.status = 'done'; it.file = out; }
    catch (e) { it.status = 'failed'; it.note = String(e.message).slice(0, 120); }
    saveQ(q);
  }
  console.log('done; run: node render_all.mjs status');
} else console.log('commands: plan | queue | status | run-ready | mark  (selectors: --situation N | --styles a,b | --ready | --all)');
