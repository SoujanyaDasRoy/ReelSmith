// Upstream documentation snapshots are NOT shipped in the core skill (keeps it small). Fetch only what a reel needs.
//   node vendor.mjs list                       what exists, what is present, pinned commits, sizes
//   node vendor.mjs fetch <name|all> [--from <dir>]    copy from a local archive folder (default: $REELSMITH_VENDOR, ../reelsmith-vendor, ../../reelsmith-vendor)
//   node vendor.mjs fetch <name> --clone       no archive? shallow-clone the upstream repo into vendor/<name> (asks nothing: only run it after the user agreed to a download)
// Names: anidoodle huashu-art-motion ClaudeAnimationBase manim_skill lemo-opuscar bang-motion vox-explainer-skill claude-drawing-skill earshot
import fs from 'fs'; import path from 'path'; import url from 'url'; import { spawnSync } from 'child_process';
const here = path.dirname(url.fileURLToPath(import.meta.url)), root = path.resolve(here, '..'), V = path.join(root, 'vendor');
const REPOS = { anidoodle: 'https://github.com/alexgreensh/anidoodle', 'huashu-art-motion': 'https://github.com/alchaincyf/huashu-art-motion', ClaudeAnimationBase: 'https://github.com/JohnHeibel/ClaudeAnimationBase', manim_skill: 'https://github.com/adithya-s-k/manim_skill', 'lemo-opuscar': 'https://github.com/lemomo-ai/lemo-opuscar', 'bang-motion': 'https://github.com/bangtutorial/bang-motion', 'vox-explainer-skill': 'https://github.com/CK42BB/vox-explainer-skill', 'claude-drawing-skill': 'https://github.com/cloveric/claude-drawing-skill', earshot: 'https://github.com/Leonxlnx/earshot' };
const meta = JSON.parse(fs.readFileSync(path.join(V, 'VENDOR.json'), 'utf8')); const A = process.argv.slice(2), cmd = A[0], opt = (k, d) => { const i = A.indexOf('--' + k); return i >= 0 ? A[i + 1] : d; };
const archives = [opt('from', ''), process.env.REELSMITH_VENDOR, path.join(root, '..', 'reelsmith-vendor'), path.join(root, '..', '..', 'reelsmith-vendor')].filter(Boolean).map(p => path.resolve(p));
const have = n => fs.existsSync(path.join(V, n)) && fs.readdirSync(path.join(V, n)).length > 0;
if (cmd === 'list' || !cmd) { for (const n of Object.keys(REPOS)) { const m = meta[n] || {}; console.log(n.padEnd(22), have(n) ? 'present ' : 'not here ', String(m.files || '?').padStart(4) + ' files', (Math.round((m.bytes || 0) / 1024) + ' KB').padStart(8), (m.commit || '').slice(0, 8), REPOS[n]); } console.log('\narchive folders checked:', archives.join(' | ')); process.exit(0); }
if (cmd === 'fetch') {
  const names = A[1] === 'all' ? Object.keys(REPOS) : [A[1]]; let bad = 0;
  for (const n of names) { if (!REPOS[n]) { console.error('unknown name ' + n); bad++; continue; } if (have(n)) { console.log(n + ': already present'); continue; }
    const arc = archives.find(a => fs.existsSync(path.join(a, n))); if (arc) { fs.cpSync(path.join(arc, n), path.join(V, n), { recursive: true }); console.log(`${n}: copied from ${arc}`); continue; }
    if (A.includes('--clone')) { const r = spawnSync('git', ['clone', '--depth', '1', REPOS[n], path.join(V, n)], { stdio: 'inherit' }); if (r.status !== 0) bad++; else { fs.rmSync(path.join(V, n, '.git'), { recursive: true, force: true }); console.log(`${n}: cloned the CURRENT upstream head (pinned snapshot was ${(meta[n] || {}).commit || '?'}); read its LICENSE before using`); } continue; }
    console.error(`${n}: no local archive found. Ask the user, then: node vendor.mjs fetch ${n} --clone   (shallow git clone of ${REPOS[n]})`); bad++; }
  process.exit(bad ? 1 : 0);
}
console.error('usage: vendor.mjs list | fetch <name|all> [--from dir] [--clone]'); process.exit(2);
