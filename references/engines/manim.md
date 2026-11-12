# Engine: Manim (guidance from github.com/adithya-s-k/manim_skill, MIT)

Notes from README and SKILL.md of `manimce-best-practices` and `manim-composer` plus rules cli/config/scenes/timing (read 2026-11-12).
Not vendored. Credit: Adithya S Kolavi. Manim Community itself has its own license. Use **Manim Community (`manim`)**, not ManimGL.

## Use for
Math, algorithms, graphs, data structures, ML/finance charts: anything that is "shapes transforming" rather than UI. 3Blue1Brown style.

## Setup (not tested here: Python was missing on the build machine)
`pip install manim` (or `uv pip install manim`), ffmpeg on PATH, LaTeX (MiKTeX/TeX Live) for `MathTex`. On Windows, if `manim` is not found use
`python -m manim`; `manimpango`/`pycairo` wheels can fail, check `manim checkhealth`.

## Workflow with this skill
1. Plan with the composer method (below), then `node export_cues.mjs && node manim_scaffold.mjs` -> `manim_reel.py` (vertical 1080x1920 skeleton with
   `hold_until(t)` helpers aligned to spoken cues).
2. Fill each `TODO` with `self.play(...)`. Render: `python -m manim -r 1080,1920 --fps 30 manim_reel.py ReelScene` (add `-ql` for fast previews).
3. `node mux.mjs <path to ReelScene.mp4>` to attach our Hindi voice + music.
4. Captions: Manim has no caption layer; either use `Text` objects or burn captions afterwards with ffmpeg `drawtext`/`subtitles`.
   Hindi text in Manim needs a font that has Devanagari; we keep captions in Roman Hinglish to avoid that.

## Best-practice rules (paraphrased)
- All code in `Scene.construct()`; `self.add` is instant, `self.play` animates, `self.wait` pauses. Scene types: `Scene`, `ThreeDScene`, `MovingCameraScene`.
- Several animations in one `play()`; `AnimationGroup` / `LaggedStart` / `Succession` for staging; `lag_ratio` controls stagger (not speed).
- Keep `run_time` 0.5-3 s (default 1). Default rate function `smooth`; others: `linear`, `rush_into`, `rush_from`, `there_and_back`, `ease_*`.
- Config precedence: CLI args > local `manim.cfg` > global > defaults. Verify keys with `manim cfg show`.
- Common mistakes: mixing `manim` and `manimgl` imports; following outdated tutorials; text failing because of `manimpango`; Windows PATH.
- 9:16: not covered by that repo. Our scaffold sets `frame_height=16, frame_width=9` and pixel size 1080x1920 (verify output; layouts need re-check).

## manim-composer planning method (paraphrased)
Plan before code. Phases: (1) research the topic and find the "aha moment" and likely misconceptions; (2) clarify audience, length, standalone vs series,
intuition vs proof, colours, narration style, visual metaphors (ask in stages); (3) write `scenes.md`: Overview, Narrative Arc, per-scene blocks
(Duration, Purpose, Visual Elements, Content, Narration Notes, Technical Notes), Transitions, Colour Palette, Math Content, Implementation Order.
Principles: show don't tell, progressive revelation, deliberate pacing. Use `../storyboard-template.md`.

Vendored docs: `vendor/manim_skill/skills/ (manimce-best-practices, manim-composer)` (documentation snapshot, reference data; see THIRD_PARTY.md).
