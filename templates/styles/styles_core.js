// styles_core.js: shared helpers for every style renderer. build_sd.mjs prepends this to the SD built from script.json "visual" blocks.
// Style-agnostic scene data for the Tatkal reel. Every style renderer (ascii-crt, art-deco, spy-titles, ...) draws the SAME content on the SAME cue times.
// Item kinds: text | cmd (typed) | val (big value from FN) | meter (bar from FN) | endcard.
// "at": a cue label with optional offset, e.g. "start+0.5", "crash", "idem+0.9". text may be a string or states [[atExpr, string, tone, flag], ...].
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), P = (t, a, b) => clamp((t - a) / (b - a)), lerp = (a, b, u) => a + (b - a) * u;
const EZ = { out: x => 1 - Math.pow(1 - x, 3), io: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2 };
const indian = n => { let s = String(Math.max(0, Math.round(n))); if (s.length <= 3) return s; return s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + s.slice(-3); };
const mmss = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');

const FN = {
  clock: (t, c) => ({ text: t >= c.clock ? '10:00:00' : '09:59:' + (57 + Math.min(2, Math.floor(P(t, .3, c.clock) * 3))), tone: t >= c.clock ? 'alert' : 'ok' }),
  users: (t, c) => ({ text: indian(1200000 * EZ.out(P(t, c.users, c.users + .9))), tone: 'accent' }),
  req: (t, c) => { const u = EZ.out(P(t, c.rush, c.rush + 1.2)); return { ratio: u, text: indian(1200000 * u), tone: t >= c.crash ? 'alert' : 'ok' }; },
  cpu: (t, c) => { const u = EZ.out(P(t, c.rush, c.rush + 1.2)); const v = t >= c.crash ? 1 : .12 + .88 * u * .97; return { ratio: v, text: Math.round(v * 100) + '%', tone: v > .9 ? 'alert' : 'ok' }; },
  position: (t, c) => ({ text: '#' + indian(481203 - Math.max(0, t - c.token) * 14000), tone: 'accent' }),
  waitprog: (t, c) => { const r = clamp(.06 + Math.max(0, t - c.token) * .14); return { ratio: r, text: Math.round(r * 100) + '%', tone: 'ok' }; },
  lock: (t, c) => ({ text: mmss(Math.max(0, 120 - (t - c.rumaal))) }),
  s0: (t, c) => { const u = EZ.out(P(t, c.hot, c.hot + 1)), d = EZ.out(P(t, c.replica, c.replica + .9)); const w = .22 + .72 * u - .46 * d; return { ratio: w, text: Math.round(w * 100) + '%', tone: w > .7 ? 'alert' : (d > 0 ? 'ok' : 'accent') }; },
  s1: (t) => { const w = .2 + .05 * Math.sin(t * 2 + 2); return { ratio: w, text: Math.round(w * 100) + '%', tone: 'ok' }; },
  s2: (t) => { const w = .22 + .05 * Math.sin(t * 2 + 4); return { ratio: w, text: Math.round(w * 100) + '%', tone: 'ok' }; },
  s3: (t) => { const w = .24 + .05 * Math.sin(t * 2 + 6); return { ratio: w, text: Math.round(w * 100) + '%', tone: 'ok' }; },
};

// time of an "at" expression for scene cues c
function AT(expr, c) { const m = String(expr).match(/^([a-zA-Z0-9_]+)([+-][0-9.]+)?$/); if (!m) return 0; return (c[m[1]] ?? c.start) + (m[2] ? parseFloat(m[2]) : 0); }

// resolve one item at time t -> {vis, p(0..1 since appear), text, tone, flag, ratio}
function RESOLVE(it, t, c) {
  const ta = AT(it.at, c); const r = { vis: t >= ta, p: P(t, ta, ta + .35), ta, tone: it.tone || 'normal', flag: '' };
  if (!r.vis) return r;
  if (it.count || it.bar) { const s = it.count || it.bar, a = AT(s.at || it.at, c), u = EZ.out(P(t, a, a + (s.dur || 1))), v = lerp(s.from ?? 0, s.to, u); const fm = s.fmt === 'intl' ? Math.round(v).toLocaleString('en-US') : s.fmt === 'pct' ? Math.round(v) + '%' : s.fmt === 'int' ? String(Math.round(v)) : indian(v); r.text = (s.prefix || '') + fm + (s.suffix || ''); r.label = it.label || ''; if (it.bar) r.ratio = clamp((v - (s.from ?? 0)) / ((s.max ?? s.to) - (s.from ?? 0))); r.tone = s.alertAbove !== undefined && v >= s.alertAbove ? 'alert' : (s.tone || r.tone); return r; }
  if (it.fn) { const f = FN[it.fn](t, c); Object.assign(r, f); r.tone = f.tone || r.tone; r.label = it.label || ''; return r; }
  let text = it.text;
  if (Array.isArray(text)) { let cur = text[0]; for (const s of text) if (t >= AT(s[0], c)) cur = s; r.text = cur[1]; r.tone = cur[2] || r.tone; r.flag = cur[3] || ''; }
  else r.text = text;
  if (r.text && r.text.includes('{lock}')) r.text = r.text.replace('{lock}', FN.lock(t, c).text);
  return r;
}
// cubic-bezier easing (CSS style) and a back-ease, shared by styles
function BZ(x1, y1, x2, y2) { return x => { if (x <= 0) return 0; if (x >= 1) return 1; let a = x; for (let i = 0; i < 8; i++) { const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx; const f = ((ax * a + bx) * a + cx) * a - x; const d = (3 * ax * a + 2 * bx) * a + cx; if (Math.abs(d) < 1e-6) break; a -= f / d; } const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by; return ((ay * a + by) * a + cy) * a; }; }
const BACK = (x, s = 1.3) => { x = clamp(x); return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
function CAP(t, scenes) { for (const s of scenes) { for (let i = 0; i < s.caps.length; i++) { const t0 = s.caps[i].t, t1 = i + 1 < s.caps.length ? s.caps[i + 1].t : s.start + s.dur - .05; if (t >= t0 && t < t1) return { text: s.caps[i].text, t0, t1 }; } } return null; }
function SCENE_AT(t, scenes) { for (const s of scenes) if (t >= s.start && t < s.start + s.dur) return s; return scenes[scenes.length - 1]; }

