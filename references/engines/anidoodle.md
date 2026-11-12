# Engine: anidoodle  (github.com/alexgreensh/anidoodle, Apache-2.0)

Notes distilled from the repo's README and `skills/anidoodle/SKILL.md` (read 2026-11-12). Not vendored. Credit: Alex Greenshpun.

## What it is
Code-drawn art and animation in 32 hand-made styles (ballpoint, charcoal, crayon, cut-paper, cyanotype, embroidery, flat vector, isometric,
low-poly 3D, marker comic, gouache, newsprint halftone, oil, paper-craft, pixel art, riso, rubber-hose, scratchboard, stipple, storybook,
sumi-e, toy brick, scrapbook, woodcut...). Same source renders identical pixels each run (pure function of frame + seeded RNG).
Outputs: PNG stills at any size, MP4/GIF/WebM/APNG via ffmpeg, a ~100 KB self-contained HTML player. 21 synthesised music genres, three.js 3D,
optional narration. Needs Node 20+, `npx playwright-core install chromium`, ffmpeg.

## How to use it with this skill
1. `node engines.mjs install anidoodle` (clone only), read `engines/anidoodle/skills/anidoodle/SKILL.md` and its `references/workflows/start-here.md`.
2. Run its own intake to choose a style, but **supply narration timing from our `build/cues.json`**: set film length = `total`, place
   beats on the cue times, and set bpm so one beat divides evenly into scene lengths if you want music-locked cuts (beat frames = 60*fps/bpm).
3. Do NOT use its narration providers or sound-pack download: our voice is `tts.mjs` + `audio.mjs`. (Pack is ~373 MB; asking first is mandatory.)
4. Render silent video with its tools, then `node mux.mjs <video.mp4> reel_final.mp4`.

## Rules worth keeping (paraphrased)
- Every piece has a point: one idea for a still; one transformation, a payoff and a returning token for a film.
- A style is a way of making marks, not a palette swap. Prove the look on ONE still before building the film.
- Determinism: frames are pure functions of frame number; seeded `rng(seed)` only; no wall clock.
- Reject: shapes built from plain ellipses, recoloured styles, fade-ins instead of drawn marks, inconsistent characters, dead air.
- Approval gates are capped (three). A fresh reviewer pass reads the output and logs findings.
- Honest limits: the model cannot hear or watch output. Claims about sound/motion need a measurement or a human.

## Cautions
- `.claude-plugin/plugin.json`, engine `package.json` and `scripts/*.sh` were not audited here. Read before `npm install` (use `--ignore-scripts` first).
- Grok install uses `--trust`; do not pass it blindly.

Vendored docs: `vendor/anidoodle/skills/anidoodle/SKILL.md and references/ (styles.md, workflows/, craft-bar.md)` (documentation snapshot, reference data; see THIRD_PARTY.md).
