// Contact sheet of stills: node sheet.mjs [stillsDir=build/stills] [out=build/sheet.jpg] [--cols 9] [--w 300]
// (or of a video: node sheet.mjs --video out/reel.mp4 [--every 4.5]). Look at the sheet before rendering the full film.
import fs from 'fs'; import path from 'path'; import { spawnSync } from 'child_process';
const A = process.argv.slice(2), opt = (k, d) => { const i = A.indexOf('--' + k); return i >= 0 ? A[i + 1] : d; };
const pos = A.filter((x, i) => !x.startsWith('--') && !(i > 0 && A[i - 1].startsWith('--')));
const w = +opt('w', 300), cols = +opt('cols', 9), out = (opt('video', '') ? pos[0] : pos[1]) || 'build/sheet.jpg';
fs.mkdirSync(path.dirname(out), { recursive: true });
const run = a => { const r = spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...a], { encoding: 'utf8' }); if (r.status !== 0) { console.error(r.stderr); process.exit(1); } };
if (opt('video', '')) { const v = opt('video'), ev = +opt('every', 4.5); const n = Math.ceil(+spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', v], { encoding: 'utf8' }).stdout / ev); run(['-i', v, '-vf', `fps=1/${ev},scale=${w}:-1,tile=${Math.min(cols, n)}x${Math.ceil(n / cols)}`, '-frames:v', '1', out]); }
else {
  const dir = pos[0] || 'build/stills', files = fs.readdirSync(dir).filter(f => /\.(jpg|png)$/i.test(f)).sort(); if (!files.length) { console.error('no images in ' + dir); process.exit(1); }
  const tmp = path.join(path.dirname(out), '_sheet_tmp'); fs.mkdirSync(tmp, { recursive: true }); files.forEach((f, i) => fs.copyFileSync(path.join(dir, f), path.join(tmp, String(i + 1).padStart(3, '0') + path.extname(f))));
  run(['-framerate', '1', '-i', path.join(tmp, '%03d' + path.extname(files[0])), '-vf', `scale=${w}:-1,tile=${Math.min(cols, files.length)}x${Math.ceil(files.length / cols)}`, '-frames:v', '1', out]);
  for (const f of fs.readdirSync(tmp)) fs.unlinkSync(path.join(tmp, f)); fs.rmdirSync(tmp);
}
console.log('contact sheet -> ' + out);
