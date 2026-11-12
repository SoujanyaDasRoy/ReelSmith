// Reelsmith brand layer: put the user's logo inside a finished reel. Node + ffmpeg only. Run AFTER the final render and BEFORE the QA gate.
//   node brand.mjs <video.mp4> --logo <logo.png|jpg|svg> [--pos auto|top-right|top-left|bottom-right|bottom-left] [--size 150] [--opacity 0.92]
//                  [--closing 2.5] [--plate auto|none|light|dark] [--knockout auto|white|black|none] [--margin 40] [--out out/reel_branded.mp4]
// What it does:
//  * logo: transparent PNG is best. A JPG/PNG without transparency and with a white or black background gets that background keyed out (--knockout).
//    SVG: ffmpeg builds without librsvg cannot read it, so it is rasterised with the project's Playwright browser when available; otherwise export a PNG.
//  * position (auto): samples the finished video and picks the calmest of the TWO top spots (top-right preferred, then top-left) just inside the safe area
//    (nothing above y250 or below y1500, never in the caption band y1290-1430, and clear of Instagram's right-hand button column for bottom spots), so it avoids titles, cards and captions.
//  * plate: if the logo's brightness is close to the background behind it, a light or dark backing plate is added so it stays readable.
//  * --closing N: for the last N seconds the video dims and the logo shows large in the centre (no extra length, QA length unchanged).
// Cannot do: judge whether the logo looks good or is the right file; the agent must show the user a still (node sheet.mjs --video <out>) and ask.
import fs from 'fs'; import path from 'path'; import { spawnSync } from 'child_process'; import { pathToFileURL } from 'url';
const A = process.argv.slice(2); const opt = (k, d) => { const i = A.indexOf('--' + k); return i >= 0 && A[i + 1] && !A[i + 1].startsWith('--') ? A[i + 1] : d; };
const video = A[0] && !A[0].startsWith('--') ? A[0] : ''; const logoArg = opt('logo', ''); if (!video || !logoArg) { console.error('usage: node brand.mjs <video.mp4> --logo <file> [options]  (see header)'); process.exit(2); }
if (!fs.existsSync(video) || !fs.existsSync(logoArg)) { console.error('missing file: ' + (!fs.existsSync(video) ? video : logoArg)); process.exit(2); }
const sh = (c, a, o = {}) => spawnSync(c, a, { encoding: 'utf8', maxBuffer: 1 << 28, ...o });
const bin = (a) => spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', ...a], { maxBuffer: 1 << 28 });
const W = 1080, H = 1920, M = +opt('margin', 65), LW = +opt('size', 150), OP = +opt('opacity', .92), CLOSE = +opt('closing', 0), POS = opt('pos', 'auto'), PLATE = opt('plate', 'auto'), KO = opt('knockout', 'auto');
const out = opt('out', video.replace(/\.(\w+)$/, '_branded.$1')); fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
const info = f => { const j = JSON.parse(sh('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', f]).stdout || '{}'); const v = (j.streams || []).find(s => s.codec_type === 'video') || {}; return { w: v.width, h: v.height, pix: v.pix_fmt || '', dur: +(j.format || {}).duration, range: v.color_range || '' }; };
const V = info(video); if (V.w !== W || V.h !== H) console.log(`note: video is ${V.w}x${V.h}, expected ${W}x${H}; positions assume 1080x1920`);
// ---- logo: raster it if SVG, then normalise to a PNG
let logo = logoArg; const tmp = path.join(path.dirname(path.resolve(out)), '_brand_tmp'); fs.mkdirSync(tmp, { recursive: true });
if (/\.svg$/i.test(logo)) {
  let ok = false; try { const r = bin(['-y', '-i', logo, path.join(tmp, 'logo_svg.png')]); ok = r.status === 0 && fs.existsSync(path.join(tmp, 'logo_svg.png')); } catch {}
  if (!ok) { try { const { chromium } = await import('playwright'); const b = await chromium.launch({}).catch(() => chromium.launch({ channel: 'chrome' })); const p = await b.newPage({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 3 }); await p.goto(pathToFileURL(path.resolve(logo)).href); const el = await p.$('svg'); await el.screenshot({ path: path.join(tmp, 'logo_svg.png'), omitBackground: true }); await b.close(); ok = true; } catch {} }
  if (!ok) { console.error('Cannot read the SVG here. Export it as a transparent PNG (width 600+ px) and pass that.'); process.exit(2); }
  logo = path.join(tmp, 'logo_svg.png');
}
const L = info(logo); if (!L.w) { console.error('cannot read the logo file'); process.exit(2); }
const hasAlpha = /(rgba|bgra|argb|abgr|yuva|gbrap|ya8|ya16|pal8)/.test(L.pix);
const px = (f, vf, n) => { const r = bin(['-i', f, '-vf', vf, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', n, '-']); return r.stdout; };
let ko = 'none', keyChain = '';
if (!hasAlpha && KO !== 'none') { const c = px(logo, 'crop=4:4:0:0,scale=1:1', 'rgb24'); const [r, g, b] = c; ko = KO !== 'auto' ? KO : (r > 232 && g > 232 && b > 232 ? 'white' : (r < 24 && g < 24 && b < 24 ? 'black' : 'none')); if (ko === 'white') keyChain = ',colorkey=0xFFFFFF:0.14:0.06'; else if (ko === 'black') keyChain = ',colorkey=0x000000:0.14:0.06'; }
const LH = Math.max(8, Math.round(LW * L.h / L.w));
// logo luminance (opaque pixels only)
const lumLogo = (() => { const buf = px(logo, `format=rgba${keyChain},scale=16:16:flags=neighbor`, 'rgba'); let s = 0, n = 0; for (let i = 0; i + 3 < buf.length; i += 4) if (buf[i + 3] > 128) { s += .2126 * buf[i] + .7152 * buf[i + 1] + .0722 * buf[i + 2]; n++; } return n ? s / n : 128; })();
// ---- position: score candidate zones by how calm they are in the finished video
// Default spots are the TOP corners just below Meta's ad top margin (14% = 269 px) and inside the 6% side margins (65 px). Bottom spots are only used when asked for
// (--pos bottom-left|bottom-right): they fall in the bottom 35% (y>1248) that ads and the Reels caption/buttons cover, and bottom-right is under the like/comment/share column.
const capBand = [1290, 1430]; const TOPY = +opt('top', 284); const cands = {
  'top-right': [W - M - LW, TOPY], 'top-left': [M, TOPY], 'bottom-right': [W - 150 - LW, 1446], 'bottom-left': [M, 1446] };
const allowed = Object.entries(cands).filter(([k, [x, y]]) => y + LH <= 1500 && (y >= capBand[1] || y + LH <= capBand[0]) && ((POS === 'auto' && k.startsWith('top')) || POS === k));
if (!allowed.length) { console.error(`logo is ${LW}x${LH}: too tall for ${POS === 'auto' ? 'any safe spot' : POS}; use a smaller --size`); process.exit(2); }
const prefer = { 'top-right': 0, 'top-left': 6, 'bottom-right': 12, 'bottom-left': 14 }; const scores = [];
for (const [k, [x, y]] of allowed) {
  const raw = bin(['-i', video, '-vf', `fps=1/2.5,crop=${LW}:${LH}:${x}:${y},scale=24:24,format=gray`, '-f', 'rawvideo', '-']).stdout; const fr = 576, n = Math.floor(raw.length / fr); let sd = 0, mean = 0;
  for (let f = 0; f < n; f++) { let m = 0; for (let i = 0; i < fr; i++) m += raw[f * fr + i]; m /= fr; let v = 0; for (let i = 0; i < fr; i++) v += (raw[f * fr + i] - m) ** 2; sd += Math.sqrt(v / fr); mean += m; }
  scores.push({ k, x, y, busy: n ? sd / n : 0, lum: n ? mean / n : 128, score: (n ? sd / n : 0) + prefer[k] });
}
scores.sort((a, b) => a.score - b.score); const Z = scores[0];
// ---- plate decision
const plate = PLATE === 'auto' ? (Math.abs(lumLogo - Z.lum) < 70 || Z.busy > 38 ? (Z.lum > 140 || lumLogo > 150 ? 'dark' : 'light') : 'none') : PLATE; const pad = 14;
const plateCol = plate === 'dark' ? 'black@0.62' : 'white@0.88';
const lg = `format=rgba${keyChain},scale=${LW}:${LH}:flags=lanczos,colorchannelmixer=aa=${OP}`;
const fc = [];
const T = V.dur, ST = .3;
fc.push(`[1:v]${lg}[lg]`);
if (plate !== 'none') { fc.push(`color=c=${plateCol}:s=${LW + 2 * pad}x${LH + 2 * pad}:d=${T.toFixed(2)},format=rgba[pl]`); fc.push(`[pl][lg]overlay=${pad}:${pad}:format=auto[wm0]`); } else fc.push('[lg]null[wm0]');
fc.push(`[wm0]fade=t=in:st=${ST}:d=0.5:alpha=1[wm]`);
const pre = V.pix === 'yuvj420p' || V.range === 'pc' ? 'scale=in_range=pc:out_range=tv:out_color_matrix=bt709,' : '';
const wx = Z.x - (plate !== 'none' ? pad : 0), wy = Z.y - (plate !== 'none' ? pad : 0), wmEnd = CLOSE > 0 ? (T - CLOSE).toFixed(2) : T.toFixed(2);
fc.push(`[0:v]${pre}format=yuv420p[base]`);
fc.push(`[base][wm]overlay=${wx}:${wy}:enable='between(t,${ST},${wmEnd})':format=auto[v1]`);
let last = '[v1]';
if (CLOSE > 0) { const BW = 520, BH = Math.round(BW * L.h / L.w), needPlate = lumLogo < 170; const bpad = 30;
  fc.push(`[2:v]format=rgba${keyChain},scale=${BW}:${BH}:flags=lanczos[bg0]`);
  if (needPlate) { fc.push(`color=c=white@0.92:s=${BW + 2 * bpad}x${BH + 2 * bpad}:d=${T.toFixed(2)},format=rgba[bp]`); fc.push(`[bp][bg0]overlay=${bpad}:${bpad}:format=auto[bg1]`); } else fc.push('[bg0]null[bg1]');
  fc.push(`[bg1]fade=t=in:st=${(T - CLOSE).toFixed(2)}:d=0.5:alpha=1[bg]`);
  fc.push(`${last}drawbox=x=0:y=0:w=iw:h=ih:color=black@0.8:t=fill:enable='gte(t,${(T - CLOSE).toFixed(2)})'[v2]`);
  const bw = BW + (needPlate ? 2 * bpad : 0), bh = BH + (needPlate ? 2 * bpad : 0);
  fc.push(`[v2][bg]overlay=${Math.round((W - bw) / 2)}:${Math.round(780 - bh / 2)}:enable='gte(t,${(T - CLOSE).toFixed(2)})':format=auto[v3]`); last = '[v3]'; }
fs.writeFileSync(path.join(tmp, 'brand_filter.txt'), fc.join(';\n'));
const args = ['-y', '-hide_banner', '-loglevel', 'error', '-i', video, '-loop', '1', '-framerate', '30', '-t', T.toFixed(2), '-i', logo]; if (CLOSE > 0) args.push('-loop', '1', '-framerate', '30', '-t', T.toFixed(2), '-i', logo);
args.push('-/filter_complex', path.join(tmp, 'brand_filter.txt'), '-map', last, '-map', '0:a?', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv', '-c:a', 'copy', '-movflags', '+faststart', '-t', T.toFixed(2), out);
const r = sh('ffmpeg', args); if (r.status !== 0) { console.error('ffmpeg failed:\n' + r.stderr.slice(-1500)); process.exit(1); }
console.log(`branded -> ${out}\n  logo ${LW}x${LH}px at ${Z.k} (${Z.x},${Z.y}); calmness scores: ` + scores.map(s => `${s.k} ${s.busy.toFixed(1)}`).join(', ') + `\n  background keyed out: ${ko}; plate: ${plate}${CLOSE ? `; closing logo last ${CLOSE}s` : ''}`);
console.log('next: look at it (node sheet.mjs --video ' + out + '), confirm with the user, then node qa.mjs --video ' + out);
try { for (const f of fs.readdirSync(tmp)) fs.unlinkSync(path.join(tmp, f)); fs.rmdirSync(tmp); } catch {}
