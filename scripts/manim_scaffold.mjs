// Generate a vertical (9:16) Manim Community scene skeleton whose waits line up with our narration cues.
//   node manim_scaffold.mjs        -> manim_reel.py     then:  python -m manim -r 1080,1920 --fps 30 manim_reel.py ReelScene
//   node mux.mjs media/videos/manim_reel/1920p30/ReelScene.mp4          (path may differ; check manim's output line)
// UNTESTED: Python/Manim were not installed where this was written. Treat the output as a starting skeleton and verify.
import fs from 'fs';

const C = JSON.parse(fs.readFileSync('build/cues.json', 'utf8'));
let py = `# Auto-generated from build/cues.json. Fill each scene's body; keep the hold_until() calls so visuals land on spoken words.
from manim import *

config.pixel_width = 1080
config.pixel_height = 1920
config.frame_height = 16   # 16 x 9 units = 9:16
config.frame_width = 9
config.frame_rate = 30
config.background_color = "#F1F1F4"

INK = "#17171F"; CORAL = "#D9604C"; BLUE = "#3B6EF5"; GREEN = "#1FA463"; RED = "#D93B3B"

class ReelScene(Scene):
    def now(self):
        return getattr(self, "time", None) if getattr(self, "time", None) is not None else self.renderer.time

    def hold_until(self, t):
        """Wait (without drawing) until absolute time t seconds, so the next animation starts exactly on a cue."""
        dt = t - self.now()
        if dt > 1 / 60:
            self.wait(dt)

    def construct(self):
`;
for (const s of C.scenes) {
  py += `\n        # ---- ${s.id}  ${s.start}s -> ${s.end}s ----\n        # VO: ${s.narration}\n`;
  for (const [k, v] of Object.entries(s.cues)) py += `        # cue ${k} = ${v}\n`;
  py += `        self.hold_until(${s.start})\n`;
  for (const [k, v] of Object.entries(s.cues)) {
    if (k === 'start') continue;
    py += `        self.hold_until(${v})   # cue: ${k}\n        # TODO: self.play(..., run_time=0.6)   # keep run_time 0.5-1.0 for a calm look\n`;
  }
  py += `        self.hold_until(${s.end})\n`;
}
py += `        self.wait(0.5)\n`;
fs.writeFileSync('manim_reel.py', py);
console.log('wrote manim_reel.py');
