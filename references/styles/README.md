# Ten film-style recipes (from lemo-opuscar, MIT)

| Your name | Card | Source folder | Needs | Effort in our pipeline |
|---|---|---|---|---|
| Paper lantern | [paper-lantern.md](paper-lantern.md) | `paper-lantern` | Canvas + WebGL light/shadow, or three.js | medium-hard |
| White model | [white-model.md](white-model.md) | `white-model` | three.js + real open data (footprints/heights) | hard |
| Spy titles | [spy-titles.md](spy-titles.md) | `spy-titles` | Canvas 2D cut-paper silhouettes | medium |
| Ink wash | [ink-wash.md](ink-wash.md) | `ink-wash` | Canvas brush engine (bristle strokes) | hard |
| Shadow puppetry | [shadow-puppet.md](shadow-puppet.md) | `shadow-puppet` | Canvas + WebGL lamp/hide/cloth shader | hard |
| Microscope | [microscope.md](microscope.md) | `microscope` | Real licensed specimen scan (tiles) + zoom compositor | hard |
| ASCII / CRT | [ascii-crt.md](ascii-crt.md) | `ascii-crt` | Canvas 2D bitmap font grid + CRT shader | easy-medium |
| Engraving | [engraving.md](engraving.md) | `engraving` | Canvas line engine with swelling strokes | hard |
| Archive lighttable | [archive-lighttable.md](archive-lighttable.md) | `archive-lighttable` | Real licensed archive scans + loupe shader | hard |
| Art deco | [art-deco.md](art-deco.md) | `art-deco` | Canvas 2D gold gradients, symmetry | medium |

Each card is a **recipe** (palette, type, timing numbers, motion vocabulary, avoid list, pitfalls) paraphrased from that style's `STYLE.md`/`DEMO.md`.
It is not the implementation. Two ways to use a card:
1. **Fast path (recommended for hard styles):** `node engines.mjs install lemo-opuscar`, read that repo's own `styles/<folder>/STYLE.md` and demo source, let its engine render the
   silent video at `--size 1080x1920`, then `node mux.mjs` to put our Hindi mix on it. Do NOT run its `setup.sh` blindly (see `engines/lemo-opuscar.md`).
2. **Our renderer:** implement the recipe as scene functions in `index.html` (a pure function of time), take cue times from `build/cues.json`, and render with `render.mjs`.
   Easy/medium styles (ASCII-CRT, spy-titles, art-deco) are realistic this way; the hard ones need real images, 3D or a brush engine.

## Adapting any card to a Hindi 9:16 reel
- Voice, music and timing come from this skill (`tts.mjs`, `audio.mjs`, `build/cues.json`), not from the upstream narration or sound packs.
- Upstream defaults are 1920x1080 at 24 fps (some 30/60). We render 1080x1920 at 30 fps: re-lay out every shot for portrait; keep text inside x 60-1020, y 250-1500.
- Captions stay Roman Hinglish, one short line, held >= max(1.8 s, speech + 0.6 s). Use the card's caption plate/typography idea, but swap fonts for ones with the glyphs you need
  (Devanagari captions need a Devanagari font such as Noto Sans/Serif Devanagari; we avoid this by default).
- Upstream rules shared by all ten: one idea per film, ~30-60 s, a point and a returning token, at least two true silences, at least four camera moves, subject >= one third of frame
  height at key moments, transitions made *inside* the style (never generic crossfades/wipes), deterministic frames (pure function of time).
- Licence hygiene: the upstream demo films are CC BY 4.0; we use only the style specs. Do not copy demo stories/shots, do not name reference works inside a film,
  and use only real, licensed imagery for microscope/archive/white-model; credit data and image sources on the end card.
- Indian-audience ideas on each card are our suggestions, not from upstream.
