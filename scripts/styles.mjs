// Style browser for the whole skill (145 styles from every engine).
//   node styles.mjs menu [--write]      situation -> shortlist (writes references/style-menu.md with --write)
//   node styles.mjs search <keyword...> keyword search over names, categories and descriptions
//   node styles.mjs list [engine|category]
//   node styles.mjs show <id>           record + first lines of the vendored style doc (+ our recipe card if any)
//   node styles.mjs validate            check every id in situations.json exists
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
const [cmd = 'menu', ...args] = process.argv.slice(2);

const line = s => `${s.id.padEnd(40)} ${s.name.slice(0, 34).padEnd(35)} ${s.engine}`;

if (cmd === 'menu') {
  let md = '# Style menu: pick by situation\n\nOffer the user the situation that matches their topic, then 3-4 styles from it. Each pick: `id` - why. Effort and engine are in `all-styles.md`.\n\n';
  sit.forEach((s, i) => {
    md += `## ${i + 1}. ${s.situation}\n`;
    for (const [id, why] of s.picks) { const st = byId[id]; md += `- **${st ? st.name : id}** (\`${id}\`, ${st ? st.engine : '?'}) - ${why}\n`; }
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
} else if (cmd === 'validate') {
  let bad = 0;
  for (const s of sit) for (const [id] of s.picks) if (!byId[id]) { console.log('MISSING', id, 'in', s.situation); bad++; }
  console.log(bad ? `${bad} missing ids` : `ok: ${sit.length} situations, all picks exist`);
  process.exit(bad ? 1 : 0);
} else console.log('commands: menu [--write] | search <kw> | list [engine|category] | show <id> | validate');
