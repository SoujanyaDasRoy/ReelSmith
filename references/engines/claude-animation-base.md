# Engine: ClaudeAnimationBase  (github.com/JohnHeibel/ClaudeAnimationBase, MIT)

Notes from README, `ANIMATION_GUIDE.md`, `render.mjs`, `package.json` (read 2026-11-12). Not vendored. Credit: John Heibel.
(No SKILL.md/CLAUDE.md exists in that repo; `ANIMATION_GUIDE.md` is the rulebook.)

## What it is
A starter kit for hand-painted 2D cartoon animation: p5.js + p5.brush on a 1920x1080 canvas, scenes are JS files where every frame is a
pure function of time `t`, rendered in headless Chrome via puppeteer-core and encoded by ffmpeg. Ships a character ("Clawd", Anthropic's
mascot) with 31 acted emotions, a timeline/shot system, transitions (brush wipe, iris) and a render CLI with contact sheets.

## How to use it with this skill
1. `node engines.mjs install claude-animation-base`; read `ANIMATION_GUIDE.md`; `npm install` (prefer `--ignore-scripts` first); needs Google Chrome.
2. It renders 16:9 by default. For reels change the canvas size and `src/config.js` (width 1080, height 1920) and re-check every layout.
3. Write `STORYBOARD.md` first (see `../storyboard-template.md`), using times from `build/cues.json`.
4. Render silent (`node render.mjs --clip --out=out/video.mp4`), then `node mux.mjs out/video.mp4`.
5. Use **your own character**, not Clawd, for anything public (mascot artwork is Anthropic's, not covered by the MIT code license).

## Rules worth keeping (paraphrased from the guide)
- Medium is solid: painted washes + ink outlines; no raw p5 rect/ellipse; no 3D projection; ink and cream instead of pure black/white; lines "boil" ~12x/sec.
- No text on screen in that style (no captions, labels, bubbles); emotions are painted. (Our captions are a separate overlay if needed.)
- Something happens in every shot; one focal action per shot; write what the viewer "reads" per shot, one read at a time, with holds.
- Nothing is ever perfectly still; use emotion changes instead of swapping eyes/mouth by hand.
- Transition at every seam including start and end; plain cut only on action or a deliberate smash cut.
- Storyboard before any scene code. Review loop: contact sheets, strips and crops before the final render.

## Cautions
- Chrome is launched with `--allow-file-access-from-files` (and `--no-sandbox` on Linux); `studio.html` loads a Google Fonts stylesheet at render time.
- `src/` was not audited. Review scene code you generate before rendering.

Vendored docs: `vendor/ClaudeAnimationBase/ANIMATION_GUIDE.md` (documentation snapshot, reference data; see THIRD_PARTY.md).
