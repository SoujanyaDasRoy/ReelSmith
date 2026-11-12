// Engine-neutral timeline contract.
//   node export_cues.mjs        -> build/cues.json
// Any engine (anidoodle, huashu-art-motion, ClaudeAnimationBase, Manim, ui-cards) should place its beats at these times,
// then the final video is muxed with build/audio.wav (see mux.mjs). Times are absolute seconds from the start of the reel.
import fs from 'fs';

const T = JSON.parse(fs.readFileSync('build/timings.json', 'utf8'));
const out = {
  fps: 30, width: 1080, height: 1920, total: +T.total.toFixed(3), audio: 'build/audio.wav',
  scenes: T.scenes.map(s => ({
    id: s.id, start: +s.start.toFixed(3), end: +(s.start + s.dur).toFixed(3), dur: +s.dur.toFixed(3),
    cues: Object.fromEntries(Object.entries(s.cues).map(([k, v]) => [k, +v.toFixed(3)])),
    captions: s.caps.map(c => ({ t: +c.t.toFixed(3), text: c.text.replace(/\*/g, '') })),
    narration: s.words.map(w => w.w).join(' '),
    words: s.words.map(w => ({ w: w.w, t0: +w.t0.toFixed(3), t1: +w.t1.toFixed(3) })),
  })),
};
fs.writeFileSync('build/cues.json', JSON.stringify(out, null, 1));
console.log('wrote build/cues.json', out.scenes.length, 'scenes,', out.total, 's');
