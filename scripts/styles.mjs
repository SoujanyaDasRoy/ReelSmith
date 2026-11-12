// Style browser for the whole skill (145 styles from every engine).
//   node styles.mjs menu [--write]      situation -> shortlist (writes references/style-menu.md with --write)
//   node styles.mjs search <keyword...> keyword search over names, categories and descriptions
//   node styles.mjs list [engine|category]
//   node styles.mjs show <id>           record + first lines of the vendored style doc (+ our recipe card if any)
//   node styles.mjs recommend "<topic>" [--json]   best READY style + one alternative (keyword rules)
//   node styles.mjs preview <id> <id> [--t 3]   one still of YOUR script in each style, side by side (run in a project)
//   node styles.mjs validate            tables sane: ids exist, first pick ready, >=2 ready per situation
// Run from the skill root (or a project scaffolded by init.mjs, which copies references/all-styles.json and situations.json).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = fs.existsSync('references/all-styles.json') ? '.' : path.resolve(here, '..');
const R = p => path.join(root, p);
const styles = JSON.parse(fs.readFileSync(R('references/all-styles.json'), 'utf8'));
const sit = JSON.parse(fs.readFileSync(R('references/situations.json'), 'utf8')).situations;
const byId = Object.fromEntries(styles.map(s => [s.id, s]));
const SK = path.resolve(here, '..'), idxFile = id => 'index_' + id.replace('/', '__') + '.html';
const isReady = id => id === 'ui-cards/clean-ui' || [path.join(SK, 'templates/styles', idxFile(id)), R('templates/styles/' + idxFile(id)), idxFile(id)].some(p => fs.existsSync(p));
const tag = id => isReady(id) ? '[ready]' : '[recipe: ' + ((byId[id] || {}).effort || 'needs build').slice(0, 40) + ']';
const [cmd = 'menu', ...args] = process.argv.slice(2);

const line = s => `${s.id.padEnd(40)} ${s.name.slice(0, 34).padEnd(35)} ${s.engine}`;

if (cmd === 'menu') {
  let md = '# Style menu: pick by situation\n\nOffer the user the situation that matches their topic, then 3-4 styles from it. Each pick: `id` - why. Effort and engine are in `all-styles.md`.\n\n';
  sit.forEach((s, i) => {
    md += `## ${i + 1}. ${s.situation}\n`;
    for (const [id, why, tone] of s.picks) { const st = byId[id]; md += `- **${st ? st.name : id}** (\`${id}\`, ${st ? st.engine : '?'}) ${tag(id)}${tone ? ' ' + tone : ''} - ${why}\n`; }
    if (s.also && s.also.length) md += `  Also see: ${s.also.map(k => sit[k].situation.split(',')[0]).join('; ')}\n`;
    md += '\n';
  });
  if (args.includes('--write')) { fs.writeFileSync(R('references/style-menu.md'), md); console.log('wrote references/style-menu.md'); }
  else console.log(md);
} else if (cmd === 'search') {
  const kws = args.map(a => a.toLowerCase());
  const hits = styles.filter(s => kws.every(k => `${s.id} ${s.name} ${s.category} ${s.how} ${s.engine}`.toLowerCase().includes(k)));
  hits.forEach(s => console.log(line(s)));
  console.log(hits.length, 'matches');
} else if (cmd === 'list') {
  const f = (args[0] || '').toLowerCase();
  styles.filter(s => !f || s.engine.toLowerCase() === f || s.category.toLowerCase().includes(f)).forEach(s => console.log(line(s)));
} else if (cmd === 'show') {
  const s = byId[args[0]];
  if (!s) { console.log('unknown id; try: node styles.mjs search <keyword>'); process.exit(1); }
  console.log(JSON.stringify(s, null, 2));
  for (const p of [s.card, s.doc]) {
    if (p && p.startsWith('vendor/') && !fs.existsSync(R(p))) { const nm = p.split('/')[1]; console.log('(upstream spec ' + p + ' is not in the core skill: node scripts/vendor.mjs fetch ' + nm + ')'); }
    if (p && fs.existsSync(R(p))) { console.log(`\n--- ${p} (first 40 lines) ---`); console.log(fs.readFileSync(R(p), 'utf8').split('\n').slice(0, 40).join('\n')); }
  }
} else if (cmd === 'recommend') {
  // keyword rules, not intelligence: scores situations by topic words, returns best READY pick + one alternative from the runner-up (or a related) situation.
  // The agent still decides; this makes the table testable. node styles.mjs recommend "how UPI avoids double payment" [--json]
  const topic = args.filter(a => !a.startsWith('--')).join(' ').toLowerCase(), words = new Set(topic.split(/[^a-z0-9]+/).filter(Boolean));
  const scored = sit.map((s, i) => ({ i, score: (s.keywords || '').split(/\s+/).filter(k => words.has(k)).length })).filter(x => x.score > 0).sort((a, b) => b.score - a.score || a.i - b.i);
  const firstReady = (si, skip) => sit[si].picks.find(p => isReady(p[0]) && p[0] !== skip);
  const top = scored[0] ? scored[0].i : 0, second = scored[1] ? scored[1].i : (sit[top].also || [])[0];
  const best = firstReady(top), alt = (second !== undefined && firstReady(second, best[0])) || sit[top].picks.find(p => isReady(p[0]) && p[0] !== best[0]);
  const res = { situation: sit[top].situation, pick: best[0], tone: best[2], alternative: alt && alt[0], alt_tone: alt && alt[2], alt_situation: second !== undefined ? sit[second].situation : null, ask_tone: !!(alt && alt[2] !== best[2]), matched: !!scored[0] };
  console.log(args.includes('--json') ? JSON.stringify(res) : `${res.matched ? '' : '(no keyword match, default situation) '}${res.situation}\n  suggest: ${res.pick} (${res.tone})\n  alternative: ${res.alternative} (${res.alt_tone}) from ${res.alt_situation}\n  ask about tone: ${res.ask_tone ? 'yes, the two differ in mood' : 'no'}`);
} else if (cmd === 'preview') {
  // one still of the user's real script in each style, side by side. Run inside a project (script.json, build/timings.json, styles_data.js via build_sd.mjs).
  //   node styles.mjs preview own/system-diagram lemo/spy-titles [--t 3]      output: build/preview.jpg
  const ids = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1] === '--t')), ti = args.indexOf('--t'), t = ti >= 0 ? args[ti + 1] : '3';
  if (!ids.length) { console.error('give 1-6 ready style ids'); process.exit(2); }
  const { spawnSync } = await import('child_process'); fs.rmSync('build/preview_all', { recursive: true, force: true }); fs.mkdirSync('build/preview_all', { recursive: true });
  let k = 0; for (const id of ids) {
    if (!isReady(id)) { console.error(id + ' is a recipe, not a ready renderer: cannot preview'); continue; }
    const file = id === 'ui-cards/clean-ui' ? 'index.html' : 'index_' + id.replace('/', '__') + '.html', local = file; if (!fs.existsSync(file)) { fs.copyFileSync(path.join(SK, id === 'ui-cards/clean-ui' ? 'templates/index.html' : 'templates/styles/' + file), file); if (!fs.existsSync('styles_core.js') && id !== 'ui-cards/clean-ui') fs.copyFileSync(path.join(SK, 'templates/styles/styles_core.js'), 'styles_core.js'); }
    const rr = fs.existsSync('render.mjs') ? 'render.mjs' : path.join(here, 'render.mjs');
    const r = spawnSync('node', [rr, 'stills', t], { env: { ...process.env, INDEX: local }, encoding: 'utf8' }); if (r.status !== 0) { console.error(id + ' failed: ' + (r.stderr || r.stdout).slice(-300)); continue; }
    const f = fs.readdirSync('build/stills').filter(x => /\.jpg$/.test(x)).sort().pop(); fs.copyFileSync('build/stills/' + f, `build/preview_all/${String(++k).padStart(2, '0')}_${id.replace('/', '__')}.jpg`); console.log(`${k}. ${id}`);
  }
  if (k) { const sh = fs.existsSync('sheet.mjs') ? 'sheet.mjs' : path.join(here, 'sheet.mjs'); const r = spawnSync('node', [sh, 'build/preview_all', 'build/preview.jpg', '--cols', String(Math.min(k, 3)), '--w', '360'], { encoding: 'utf8' }); console.log(r.status === 0 ? 'sheet: build/preview.jpg (left to right = the numbers above)' : r.stderr); }
} else if (cmd === 'validate') {
  let bad = 0;
  for (const s of sit) { const rdy = s.picks.filter(p => isReady(p[0])); if (rdy.length < 2) { console.log('FEW READY', s.situation, rdy.length); bad++; } if (!isReady(s.picks[0][0])) { console.log('FIRST PICK NOT READY', s.situation); bad++; } if (!s.keywords) { console.log('NO KEYWORDS', s.situation); bad++; } }
  for (const s of sit) for (const [id] of s.picks) if (!byId[id]) { console.log('MISSING', id, 'in', s.situation); bad++; }
  console.log(bad ? `${bad} missing ids` : `ok: ${sit.length} situations, all picks exist`);
  process.exit(bad ? 1 : 0);
} else console.log('commands: menu [--write] | recommend | preview | search <kw> | list [engine|category] | show <id> | validate');
