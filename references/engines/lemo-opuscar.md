# Engine: lemo-opuscar  (github.com/lemomo-ai/lemo-opuscar, MIT; demo films CC BY 4.0)

Notes from the repo's README, `styles/*/STYLE.md`, `DIRECTOR.md` summary and `setup.sh` (read 2026-11-12). Not vendored. Credit: LemoLab.
(The plugin lives at `plugin/skills/lemo-opuscar/SKILL.md`; `.claude-plugin/plugin.json` returned 404 when checked; `core/` and `tools/` were not read.)

## What it is
"66 film styles for Claude Code, made in code": each style is a style prompt (`STYLE.md`) plus a demo write-up (`DEMO.md`), demo source (`demo/`) and a poster; no video model.
Rendering: Canvas 2D, three.js r170 (WebGL), WebGL2 shaders; deterministic `window.render(t)`, headless Chrome frame capture via playwright-core, ffmpeg for mux/loudnorm (-14 LUFS)/grain.
Defaults: 30-60 s, 1920x1080 at 24 fps; vertical via `--size 1080x1920`. Needs Node 20+, ffmpeg 7+, Python 3.11+ or uv; on Windows use Git Bash or WSL.

## The 66 styles (folder names)
- Edit & documentary: caption-news, newsreel, countdown, city-symphony, visual-investigation, kino-montage, telestrator, news-package
- Evidence films: satellite-briefing, briefing-board, lidar-survey, **white-model**, data-physical, teardown, **microscope**, **archive-lighttable**
- Hand-drawn: crayon-book, watercolor, **ink-wash**, impasto, one-line, whiteboard, urban-sketch, chalkboard
- East Asian: **shadow-puppet**, ukiyoe, papercut-red, **paper-lantern**
- Print: risograph, halftone-dossier, woodcut, **engraving**, silkscreen-poster, printed-long-take
- Graphic: swiss-motion, **spy-titles**, **art-deco**, blueprint, stained-glass, pictogram-motion, **ascii-crt**
- Information: dataviz, iso-infographic, dark-keynote, living-screencast, hologram-hud, transit-map, isometric-picture-book, circuit-board
- Cartoon: rubber-hose, cel-anime-80s, scifi-toon, midcentury-toon
- Games: pixel-rpg, hd-2d, microgame, game-show
- Cinema: silent-film, backrooms
- Materials: brick-toy, paper-popup, tilt-shift, lowpoly-island, glass-product, memphis-diorama, desktop-flythrough
(Bold = the ten with full recipe cards in `../styles/`. Any other style: read its `STYLE.md` after installing.)

## How to use it with this skill
1. `node engines.mjs install lemo-opuscar` (shallow clone only). Read `styles/<folder>/STYLE.md` and `DEMO.md`.
2. Write our `script.json`, run `tts.mjs`, `audio.mjs`, `export_cues.mjs`; give `build/cues.json` to the engine as the timing source; set size 1080x1920.
3. Render silent video with the engine's own tools, then `node mux.mjs <video.mp4> reel_final.mp4`.
4. Do not use its narration (Kokoro/Edge/Doubao) or its sample libraries: our voice is `tts.mjs`; the audio mix is `audio.mjs`.

## Cautions (important)
- **`setup.sh` auto-pulls and hard-resets its managed clone to `main` on every run** (unpinned supply-chain risk) and downloads npm packages, Playwright Chromium, pip packages, an optional Kokoro model and 70-400 MB sample libraries. Do not run it blindly; read it, pin a commit, and ask the user before any large download.
- The agent installs per-style packages itself and may call the network at render time (edge-tts voices, data portals, Google Fonts, Whisper model). Review before allowing.
- `.claude-plugin/plugin.json`, `plugin/` hooks, `core/` and `tools/` were not audited here.
- Licences: code/docs MIT; demo films/stills CC BY 4.0 (credit LemoLab); six demo narration tracks excluded; third-party demo assets keep their own licences. Demo end cards carry a LemoLab sign-off that belongs to the library demo, not to your film.
- Do not copy its demo stories, characters or shots; use the style specs.

Vendored docs: `vendor/lemo-opuscar/styles/<slug>/STYLE.md + DEMO.md for all 66 styles, DIRECTOR.md, TECHNIQUE.md` (documentation snapshot, reference data; see THIRD_PARTY.md).
