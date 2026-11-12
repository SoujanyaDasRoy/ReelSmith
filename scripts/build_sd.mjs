// Builds styles_data.js (what every style renderer draws) from script.json: each scene gets a "visual" block.
//   node build_sd.mjs            -> writes styles_data.js, warns about unknown cue labels
// scene.visual = { head: ["small line,", "big headline."], items: [ item, ... ] }
// item kinds: {k:'text', at:'cue+0.4', text:'..' | [[atExpr,'text','tone','strike'],...], tone}  (tones: normal ok accent alert dim)
//             {k:'cmd', at, text}  typed out;   {k:'endcard', at, lines:[big, mid, small]}
//             {k:'val', at, label, count:{from,to,at?,dur?,fmt:'indian'|'int'|'pct',prefix?,suffix?,alertAbove?}}   big counting number
//             {k:'meter', at, label, bar:{from,to,max?,dur?,fmt,alertAbove?}}                                      filling bar
// "at" and count.at/bar.at are cue labels from the scene's "cues" ([name, word] pairs; "start" always exists), optionally +/- seconds.
import fs from 'fs'; import path from 'path'; import url from 'url';
const here = path.dirname(url.fileURLToPath(import.meta.url));
const coreFile = [ 'styles_core.js', path.join(here, '../templates/styles/styles_core.js') ].find(f => fs.existsSync(f));
if (!coreFile) { console.error('styles_core.js not found'); process.exit(1); }
const S = JSON.parse(fs.readFileSync('script.json', 'utf8')), SD = {};
let warn = 0;
for (const sc of S.scenes) {
  if (!sc.visual) { console.error('scene "' + sc.id + '" has no "visual" block'); process.exit(1); }
  const labels = new Set(['start', ...(sc.cues || []).map(c => c[0])]);
  const chk = e => { const m = String(e).match(/^([a-zA-Z0-9_]+)/); if (m && !labels.has(m[1])) { console.warn('  [' + sc.id + '] unknown cue "' + m[1] + '" in "' + e + '"'); warn++; } };
  for (const it of sc.visual.items) { chk(it.at); if (Array.isArray(it.text)) it.text.forEach(s => chk(s[0])); for (const k of ['count', 'bar']) if (it[k] && it[k].at) chk(it[k].at); }
  SD[sc.id] = sc.visual;
}
fs.writeFileSync('styles_data.js', fs.readFileSync(coreFile, 'utf8') + 'const SD = ' + JSON.stringify(SD, null, 1) + ';' + String.fromCharCode(10));
console.log('styles_data.js written for', Object.keys(SD).length, 'scenes;', warn, 'warnings');
