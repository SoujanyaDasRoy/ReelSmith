// Usage:
//   node render.mjs stills 1.5,8.2,30        -> build/stills/s_XXX.X.jpg   (quick visual checks)
//   node render.mjs full [out.mp4]            -> renders all frames (4 parallel pages) and muxes build/audio.wav
// Env: INDEX=index_other.html (render a different style file), CHROME=/path/to/chrome-or-headless-shell  (use when Playwright's bundled browser version doesn't match)
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { execSync } from 'child_process';

const T = JSON.parse(fs.readFileSync('build/timings.json', 'utf8'));
const FPS = 30;
const mode = process.argv[2] || 'stills';

// Index file resolution: CLI --index/-i flag, or any .html in argv, else env INDEX, else index.html
function resolveIndexFile() {
  const iIdx = process.argv.findIndex(a => a === '--index' || a === '-i');
  if (iIdx !== -1 && process.argv[iIdx + 1]) return process.argv[iIdx + 1];
  for (const a of process.argv.slice(2)) {
    if (a.endsWith('.html') && fs.existsSync(a)) return a;
  }
  return process.env.INDEX || 'index.html';
}
const indexFile = resolveIndexFile();
const file = url.pathToFileURL(path.resolve(indexFile)).href;

// Browser: CHROME=/path env, else system Chrome/Edge, else Playwright's own, else cached chromium
async function launchBrowser() {
  const tries = [];
  if (process.env.CHROME) tries.push({ executablePath: process.env.CHROME });
  
  // Standard installed browser locations across OSes
  const sysPaths = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium'
  ];
  for (const p of sysPaths) {
    if (fs.existsSync(p)) tries.push({ executablePath: p });
  }

  tries.push({}, { channel: 'chrome' }, { channel: 'msedge' });
  const roots = [process.env.PLAYWRIGHT_BROWSERS_PATH, process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'ms-playwright'), path.join(process.env.HOME || process.env.USERPROFILE || '', 'Library/Caches/ms-playwright'), path.join(process.env.HOME || '', '.cache/ms-playwright')].filter(Boolean);
  for (const r of roots) { if (!fs.existsSync(r)) continue; for (const d of fs.readdirSync(r).sort().reverse()) { if (!/^chromium(_headless_shell)?-/.test(d)) continue; for (const rel of ['chrome-headless-shell-win64/chrome-headless-shell.exe', 'chrome-win/chrome.exe', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium', 'chrome-linux/chrome', 'chrome-headless-shell-linux64/chrome-headless-shell']) { const p = path.join(r, d, rel); if (fs.existsSync(p)) tries.push({ executablePath: p }); } } }
  let last; for (const o of tries) { try { const b = await chromium.launch(o); if (o.executablePath || o.channel) console.log('browser: ' + (o.executablePath || o.channel)); return b; } catch (e) { last = e; } }
  console.error('No usable Chromium/Chrome/Edge found. Install Chrome, or ask the user before running: npx playwright install chromium (about 150 MB). Last error: ' + String(last && last.message).split(String.fromCharCode(10))[0]); process.exit(3);
}
const browser = await launchBrowser();

async function newPage() {
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 } });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('PAGE ERROR', e.message));
  await p.addInitScript(`window.T=${JSON.stringify(T)}`);
  await p.goto(file);
  await p.evaluate(() => window.ready);
  return p;
}

if (mode === 'stills') {
  fs.mkdirSync('build/stills', { recursive: true });
  const p = await newPage();
  const ts = (process.argv[3] || '').split(',').filter(Boolean).map(Number);
  if (!ts.length) throw new Error('give comma-separated times in seconds');
  for (const t of ts) {
    await p.evaluate(t => renderAt(t), t);
    await p.screenshot({ path: `build/stills/s_${t.toFixed(1).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 85 });
  }
  console.log('stills', ts.length);
} else {
  const out = process.argv[3] || 'reel.mp4';
  const total = Math.floor(T.total * FPS), W = 4;
  fs.mkdirSync('build/frames', { recursive: true });
  await Promise.all([...Array(W)].map(async (_, w) => {
    const p = await newPage();
    for (let f = w; f < total; f += W) {
      await p.evaluate(t => renderAt(t), f / FPS);
      await p.screenshot({ path: `build/frames/f${String(f).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92 });
    }
  }));
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  execSync(`ffmpeg -y -loglevel error -framerate ${FPS} -i build/frames/f%05d.jpg -i build/audio.wav -c:v libx264 -preset medium -crf 18 -vf "scale=in_range=pc:out_range=tv:out_color_matrix=bt709:flags=accurate_rnd,format=yuv420p" -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv -c:a aac -b:a 192k -shortest -movflags +faststart "${out}"`);
  console.log('done', out);
}
await browser.close();
