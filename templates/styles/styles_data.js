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

const SD = {
  hook: { head: ['10:00 AM,', 'baarah lakh log. ek seat.'], items: [
    { k: 'val', fn: 'clock', at: 'start+0.15', label: 'TATKAL OPENS' },
    { k: 'text', at: 'start+0.5', text: '12951  MUMBAI RAJDHANI  NDLS > MMCT  3A', tone: 'dim' },
    { k: 'val', fn: 'users', at: 'users', label: 'TRYING RIGHT NOW' },
    { k: 'text', at: 'seat', text: 'SEATS LEFT: 1', tone: 'alert' } ] },
  question: { head: ['Sawal,', 'interview wala.'], items: [
    { k: 'text', at: 'start+0.5', text: 'INTERVIEWER> Design Tatkal booking.' },
    { k: 'text', at: 'q', text: 'INTERVIEWER> 12 lakh users. 1 seat. 10:00:00 sharp.' },
    { k: 'text', at: 'cry+0.1', text: 'YOU> Sir, pehle server ko chai pila doon?', tone: 'accent' } ] },
  naive: { head: ['Idea one,', 'ek database.'], items: [
    { k: 'text', at: 'start+0.3', text: 'DATABASE (primary)' },
    { k: 'text', at: 'start+0.5', text: [['start+0.5', 'STATUS: HEALTHY', 'ok'], ['crash', 'STATUS: 503 UNAVAILABLE', 'alert']] },
    { k: 'meter', fn: 'req', at: 'start+0.7', label: 'REQUESTS/SEC' },
    { k: 'meter', fn: 'cpu', at: 'start+0.9', label: 'CPU' },
    { k: 'text', at: 'msg', text: 'SERVER> Abhi aata hoon...', tone: 'dim' } ] },
  race: { head: ['Problem,', 'race condition.'], items: [
    { k: 'text', at: 'start+0.3', text: 'BOOKING LOG  SEAT 42' },
    { k: 'text', at: 'start+0.6', text: [['start+0.6', '10:00:00.412 sharma_a  CONFIRMED', 'ok'], ['dup', '10:00:00.412 sharma_a  DUPLICATE', 'alert']] },
    { k: 'text', at: 'start+0.8', text: [['start+0.8', '10:00:00.412 sharma_b  CONFIRMED', 'ok'], ['dup', '10:00:00.412 sharma_b  DUPLICATE', 'alert']] },
    { k: 'text', at: 'dup+0.1', text: '2 TICKETS / 1 SEAT', tone: 'alert' } ] },
  wait: { head: ['Ek,', 'waiting room.'], items: [
    { k: 'text', at: 'start+0.3', text: "YOU'RE IN LINE" },
    { k: 'val', fn: 'position', at: 'start+0.4', label: 'POSITION' },
    { k: 'meter', fn: 'waitprog', at: 'token', label: 'PROGRESS' },
    { k: 'text', at: 'batch', text: 'GATE  BATCH #1  1,000 ADMITTED  OPEN', tone: 'ok' },
    { k: 'text', at: 'bots', text: 'bot-7731  BLOCKED  RATE LIMIT', tone: 'alert' },
    { k: 'text', at: 'block', text: 'NEW SESSIONS  CAPTCHA REQUIRED', tone: 'accent' } ] },
  lock: { head: ['Do,', 'seat lock.'], items: [
    { k: 'text', at: 'start+0.3', text: 'COACH S4' },
    { k: 'text', at: 'start+0.5', text: [['start+0.5', 'SEAT 42  FREE', 'dim'], ['rumaal', 'SEAT 42  HELD  {lock}', 'accent'], ['unique', 'SEAT 42  BOOKED  {lock}', 'ok']] },
    { k: 'cmd', at: 'redis', text: '> SET seat:12951:42 sharma NX EX 120' },
    { k: 'text', at: 'rumaal', text: 'OK', tone: 'ok' },
    { k: 'text', at: 'unique', text: 'UNIQUE (train, date, seat)  OK', tone: 'ok' } ] },
  shard: { head: ['Teen,', 'sharding.'], items: [
    { k: 'cmd', at: 'hash-0.4', text: 'shard = hash(train, date) % N' },
    { k: 'meter', fn: 's0', at: 'hash+0.1', label: 'RAJDHANI' },
    { k: 'text', at: 'hot', text: [['hot', 'RAJDHANI: HOT SHARD', 'alert'], ['replica', 'RAJDHANI: +2 REPLICAS, SMALLER BATCHES', 'ok']] },
    { k: 'meter', fn: 's1', at: 'hash+0.2', label: 'HOWRAH MAIL' },
    { k: 'meter', fn: 's2', at: 'hash+0.3', label: 'SHATABDI' },
    { k: 'meter', fn: 's3', at: 'hash+0.4', label: 'DURONTO' } ] },
  pay: { head: ['Chaar,', 'payment.'], items: [
    { k: 'text', at: 'start+0.3', text: 'ORDER TK-48213   RS 1,245' },
    { k: 'text', at: 'start+0.5', text: [['start+0.5', 'IDEMPOTENCY-KEY 7f3a9c   PENDING', 'dim'], ['idem', 'IDEMPOTENCY-KEY 7f3a9c   DUPLICATE IGNORED', 'ok']] },
    { k: 'text', at: 'start+0.6', text: [['start+0.6', 'PAYMENT   PENDING', 'dim'], ['idem+0.9', 'PAYMENT   SUCCESS', 'ok']] },
    { k: 'text', at: 'start+0.7', text: [['start+0.7', 'TICKET    PENDING', 'dim'], ['fail', 'TICKET    FAILED', 'alert']] },
    { k: 'text', at: 'start+0.8', text: [['start+0.8', 'RECONCILER   PENDING', 'dim'], ['refund', 'RECONCILER   REFUND QUEUED', 'accent']] },
    { k: 'text', at: 'old', text: [['old', 'BANK REFUND: 5-7 WORKING DAYS', 'dim', 'strike'], ['fast', '', 'dim']] },
    { k: 'text', at: 'start+0.9', text: [['start+0.9', 'REFUND   PENDING', 'dim'], ['fast', 'REFUND   DONE IN 7s', 'ok']] } ] },
  outro: { head: ['Aakhir mein,', 'kismat.'], items: [
    { k: 'text', at: 'start+0.3', text: 'PNR 4521098873' },
    { k: 'text', at: 'start+0.4', text: '12951  MUMBAI RAJDHANI  3A', tone: 'dim' },
    { k: 'text', at: 'start+0.5', text: 'CURRENT STATUS: STILL WL', tone: 'alert' },
    { k: 'text', at: 'wl+0.4', text: 'FRIEND> Bhaiya, confirm hua?' },
    { k: 'text', at: 'wl+1.2', text: 'YOU> Humesha same halat.', tone: 'accent' },
    { k: 'endcard', at: 'follow', lines: ['FOLLOW', 'NEXT: UPI, RS 10 CHAI EDITION', 'COMMENT YOUR WORST TATKAL STORY'] } ] },
};
