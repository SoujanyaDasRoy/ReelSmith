// Reelsmith real sound effects: find openly licensed recordings (Openverse API, no key needed) and put them at cue times. Node + ffmpeg only.
//   node sfx.mjs suggest                         read script.json + build/timings.json and propose a search for each cue / scene start
//   node sfx.mjs search "whoosh" [--license cc0,pdm] [--maxdur 3] [--n 8]      list candidates (title, length, licence, creator, provider, page)
//   node sfx.mjs local "<dir>" "whoosh"          search your own sound library folder by file name
//   node sfx.mjs get <openverse-id> --name whoosh --yes     download + convert to build/sfx/<name>.wav, record the licence in build/sfx/index.json + CREDITS.md
//   node sfx.mjs credits                         credit lines you MUST put in the post for attribution-required (CC BY) sounds
// RULES: (1) ASK THE USER before any download, then pass --yes. (2) Default licences are CC0 and public domain (no credit needed); CC BY is allowed
// only if you pass --license cc0,pdm,by and then use `credits`. Never use NC (non-commercial) or ND licences for a branded/commercial reel.
// (3) Openverse says it cannot guarantee licence data is complete or correct: open the landing page (shown in `search`) before keeping a sound for a company reel.
// Use a downloaded sound by naming it in script.json:  scene "sfx": {"cueLabel": "file:build/sfx/whoosh.wav@0.6"}  or top level "sfx_scene_start": "file:build/sfx/whoosh.wav@0.5"
import fs from 'fs'; import path from 'path'; import { spawnSync } from 'child_process';
const A = process.argv.slice(2), cmd = A[0]; const opt = (k, d) => { const i = A.indexOf('--' + k); return i >= 0 && A[i + 1] && !A[i + 1].startsWith('--') ? A[i + 1] : d; };
const pos = A.slice(1).filter((x, i, a) => !x.startsWith('--') && !(i > 0 && a[i - 1].startsWith('--')));
const API = 'https://api.openverse.org/v1', UA = { 'User-Agent': 'reelsmith-sfx/1.0' };
const num = x => Math.round(x * 100) / 100;
const KEYWORDS = { crash: 'impact hit boom', dup: 'error buzz', fail: 'error buzzer', block: 'denied buzzer', unique: 'success ding', fast: 'success chime', ok: 'success ding', follow: 'notification chime', pending: 'tick clock', once: 'success ding', breaker: 'electric switch off', later: 'soft pop', record: 'pen click', rush: 'crowd murmur', clock: 'clock tick', start: 'soft whoosh' };
async function search(q, lic, maxdur, n) {
  const url = `${API}/audio/?q=${encodeURIComponent(q)}&license=${encodeURIComponent(lic)}&page_size=20`; const r = await fetch(url, { headers: UA }); if (!r.ok) { console.error('Openverse error ' + r.status); process.exit(1); }
  const j = await r.json(); return (j.results || []).map(x => ({ id: x.id, title: x.title, dur: (x.duration || 0) / 1000, license: x.license, ver: x.license_version, creator: x.creator, provider: x.provider, ext: x.filetype, url: x.url, page: x.foreign_landing_url, attribution: x.attribution, license_url: x.license_url })).filter(x => x.dur > 0 && x.dur <= maxdur).slice(0, n);
}
const table = rows => rows.forEach(r => console.log(`${r.id}  ${String(num(r.dur)).padStart(5)}s  ${(r.license + ' ' + (r.ver || '')).trim().padEnd(8)} ${String(r.title).slice(0, 44).padEnd(44)} ${String(r.creator || '?').slice(0, 18).padEnd(18)} ${r.provider}\n      ${r.page}`));
async function main() {
if (cmd === 'search') { const q = pos[0]; if (!q) { console.error('give a search word'); { process.exitCode = 2; return; } } const rows = await search(q, opt('license', 'cc0,pdm'), +opt('maxdur', 3), +opt('n', 8)); if (!rows.length) console.log('no results (try another word, a longer --maxdur, or add ,by to --license and keep the credits)'); else table(rows); return; }
if (cmd === 'local') { const dir = pos[0], q = (pos[1] || '').toLowerCase().split(/\s+/); const hits = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(wav|mp3|flac|ogg|aif|aiff|m4a)$/i.test(e.name) && q.every(w => p.toLowerCase().includes(w))) hits.push(p); } })(dir); console.log(hits.slice(0, 30).join('\n') || 'no matches'); console.log('Use: "file:<path>@0.6" in script.json sfx (check the licence of your own library before publishing).'); return; }
if (cmd === 'get') {
  const id = pos[0], name = opt('name', ''); if (!id || !name) { console.error('usage: sfx.mjs get <id> --name <short-name> --yes'); { process.exitCode = 2; return; } }
  if (!A.includes('--yes')) { console.error('This downloads a file from the internet. Ask the user first, then rerun with --yes.'); { process.exitCode = 2; return; } }
  const r = await fetch(`${API}/audio/${id}/`, { headers: UA }); if (!r.ok) { console.error('Openverse error ' + r.status); { process.exitCode = 1; return; } } const x = await r.json();
  if (/nc|nd/.test(String(x.license))) { console.error(`licence ${x.license} (non-commercial / no-derivatives) is not allowed for reels; pick another sound.`); { process.exitCode = 2; return; } }
  fs.mkdirSync('build/sfx', { recursive: true }); const raw = `build/sfx/${name}.src.${(x.filetype || 'mp3').replace(/[^a-z0-9]/gi, '')}`; const d = await fetch(x.url, { headers: UA }); if (!d.ok) { console.error('download failed ' + d.status); { process.exitCode = 1; return; } }
  fs.writeFileSync(raw, Buffer.from(await d.arrayBuffer()));
  const out = `build/sfx/${name}.wav`, c = spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', raw, '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,loudnorm=I=-20:TP=-3:LRA=7', '-ac', '1', '-ar', '44100', out], { encoding: 'utf8' }); if (c.status !== 0) { console.error(c.stderr); { process.exitCode = 1; return; } } fs.unlinkSync(raw);
  const idxf = 'build/sfx/index.json', idx = fs.existsSync(idxf) ? JSON.parse(fs.readFileSync(idxf, 'utf8')) : {}; const needCredit = !/^(cc0|pdm)$/i.test(x.license);
  idx[name] = { file: out, openverse_id: id, title: x.title, creator: x.creator, license: x.license, license_version: x.license_version, license_url: x.license_url, landing_page: x.foreign_landing_url, provider: x.provider, attribution: x.attribution, attribution_required: needCredit, retrieved: new Date().toISOString().slice(0, 10) };
  fs.writeFileSync(idxf, JSON.stringify(idx, null, 1)); fs.writeFileSync('build/sfx/CREDITS.md', '# Sound credits\n\n' + Object.values(idx).map(e => `- ${e.attribution || `"${e.title}" by ${e.creator || 'unknown'}, ${e.license} ${e.license_version || ''}`} (${e.landing_page})${e.attribution_required ? '  **CREDIT REQUIRED IN THE POST**' : ''}`).join('\n') + '\n');
  console.log(`saved ${out} (${x.license}${needCredit ? ', credit required' : ', no credit needed'}). Landing page to verify the licence: ${x.foreign_landing_url}`); return;
}
if (cmd === 'credits') { if (!fs.existsSync('build/sfx/index.json')) { console.log('no downloaded sounds'); return; } const idx = JSON.parse(fs.readFileSync('build/sfx/index.json', 'utf8')); const req = Object.values(idx).filter(e => e.attribution_required); console.log(req.length ? 'Put these in the post caption / description:\n' + req.map(e => '  ' + (e.attribution || `"${e.title}" by ${e.creator}, ${e.license}`)).join('\n') : 'No credits required (all CC0 / public domain). build/sfx/CREDITS.md still lists sources.'); return; }
if (cmd === 'suggest') {
  const T = JSON.parse(fs.readFileSync('build/timings.json', 'utf8')); let S = { scenes: [] }; try { S = JSON.parse(fs.readFileSync('script.json', 'utf8')); } catch {}
  console.log('Suggested searches (run `node sfx.mjs search "<words>"`, ask the user, then `get` + reference in script.json):');
  console.log('  scene starts (a soft transition sound): search "soft whoosh"  ->  top-level "sfx_scene_start": "file:build/sfx/whoosh.wav@0.4"');
  for (const s of T.scenes) { const own = (S.scenes.find(x => x.id === s.id) || {}).sfx || {}; for (const [k, t] of Object.entries(s.cues || {})) { if (k === 'start') continue; console.log(`  ${s.id}.${k} @${num(t)}s ${own[k] ? '(already: ' + own[k] + ')' : '  search "' + (KEYWORDS[k] || 'soft pop click') + '"'}`); } }
  return;
}
console.error('usage: sfx.mjs suggest | search "<q>" | local <dir> "<q>" | get <id> --name <n> --yes | credits'); { process.exitCode = 2; return; }
}
await main().catch(e => { console.error(String(e.message || e)); process.exitCode = 1; });
