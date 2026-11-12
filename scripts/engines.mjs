// Engine manager.
//   node engines.mjs list                     show engines, best use, license
//   node engines.mjs info <name>              requirements + warnings + doc path
//   node engines.mjs doctor                   check which required tools exist on this machine
//   node engines.mjs install <name> [--ref X] shallow git clone into ./engines/<name>, record commit in engines/engines.lock.json
// Safety: install only clones. It never runs npm/pip/uv/shell scripts from the cloned repo; do that yourself after reading it
// (for npm use `npm install --ignore-scripts` first).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawnSync } from 'child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const regFile = fs.existsSync('engines.json') ? 'engines.json' : path.join(here, 'engines.json');
const { engines } = JSON.parse(fs.readFileSync(regFile, 'utf8'));
const [cmd = 'list', name, ...rest] = process.argv.slice(2);

const has = c => { const flag = /^(ffmpeg|ffprobe|latex)$/.test(c) ? '-version' : '--version'; const r = spawnSync(c, [flag], { encoding: 'utf8' }); return r.status === 0 ? (r.stdout || r.stderr).split('\n')[0].trim() : null; };

if (cmd === 'list') {
  for (const [k, e] of Object.entries(engines)) console.log(`${k.padEnd(22)} ${String(e.license).slice(0, 20).padEnd(21)} ${e.best_for}`);
} else if (cmd === 'info') {
  const e = engines[name]; if (!e) throw new Error('unknown engine ' + name);
  console.log(JSON.stringify(e, null, 2));
} else if (cmd === 'doctor') {
  const checks = { node: 'node', ffmpeg: 'ffmpeg', ffprobe: 'ffprobe', git: 'git', python: 'python', python3: 'python3', py: 'py', uv: 'uv', manim: 'manim', latex: 'latex', chrome: null };
  for (const [k, c] of Object.entries(checks)) if (c) console.log(k.padEnd(9), has(c) || 'NOT FOUND');
  console.log('\nengine readiness (rough):');
  const ok = n => !!has(n);
  console.log('ui-cards              ', ok('node') && ok('ffmpeg') ? 'ready (needs playwright + chromium via npm)' : 'missing node/ffmpeg');
  console.log('anidoodle             ', ok('node') && ok('ffmpeg') ? 'likely (needs Node 20+, playwright-core chromium)' : 'missing node/ffmpeg');
  console.log('claude-animation-base ', ok('node') && ok('ffmpeg') ? 'likely (needs Google Chrome installed)' : 'missing node/ffmpeg');
  console.log('huashu-art-motion     ', (ok('uv') || ok('python') || ok('python3') || ok('py')) && ok('ffmpeg') ? 'possible' : 'missing uv/python and/or ffmpeg');
  console.log('earshot (optional ears)', (ok('uv') || ok('python') || ok('python3') || ok('py')) && ok('ffmpeg') ? 'possible (needs uv or Python 3.10+; ~1.1 GB model download: ask the user first)' : 'missing uv/python and/or ffmpeg');
  console.log('manim                 ', (ok('manim') || ok('python') || ok('python3') || ok('py')) && ok('ffmpeg') ? 'possible (LaTeX needed for MathTex)' : 'missing python/manim and/or ffmpeg');
} else if (cmd === 'install') {
  const e = engines[name]; if (!e) throw new Error('unknown engine ' + name);
  if (!e.repo) { console.log(name, 'is built in; nothing to install'); process.exit(0); }
  const dir = path.join('engines', name);
  if (fs.existsSync(dir)) { console.log('already present:', dir); process.exit(0); }
  fs.mkdirSync('engines', { recursive: true });
  const ri = rest.indexOf('--ref'); const ref = ri >= 0 ? rest[ri + 1] : null;
  execSync(`git clone --depth 1 ${ref ? `--branch ${ref} ` : ''}${e.repo} "${dir}"`, { stdio: 'inherit' });
  const sha = execSync('git rev-parse HEAD', { cwd: dir }).toString().trim();
  const lockFile = path.join('engines', 'engines.lock.json');
  const lock = fs.existsSync(lockFile) ? JSON.parse(fs.readFileSync(lockFile, 'utf8')) : {};
  lock[name] = { repo: e.repo, commit: sha, license: e.license, fetched: new Date().toISOString() };
  fs.writeFileSync(lockFile, JSON.stringify(lock, null, 2));
  console.log(`\ncloned ${name} @ ${sha.slice(0, 10)}  (license: ${e.license})`);
  console.log('NOT executed: any install/setup script. Read the repo first.');
  for (const w of e.warnings || []) console.log(' !', w);
  console.log('docs:', e.doc);
} else console.log('commands: list | info <name> | doctor | install <name> [--ref X]');
