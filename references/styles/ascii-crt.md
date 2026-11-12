# Style: ASCII / CRT Terminal  - source folder `ascii-crt`

Paraphrased from lemo-opuscar `styles/ascii-crt/STYLE.md` + `DEMO.md` (MIT). Not copied verbatim. (Other ASCII-video skills exist in public registries, but this is the recipe merged here.)

**One-liner:** the whole film is one monochrome phosphor terminal behind curved glass. Characters are drawn AS characters on a grid; the camera is only the grid's scale.
**Good for:** logs, systems, hacking/security explainers, retro tech, "a machine speaks" stories, programming and DevOps reels.

## Palette
Single phosphor: P3 amber (dim `#FF6605`, mid `#FFB000`, overexposed `#FFEBB8`) or P1 green. Unlit glass `#090604`. One soft second colour at most, used once (demo: Earth blue-white `#BFE4FF`). No RGB grille (monochrome tubes have none).

## Type and grid
One monospace bitmap font (VT323, OFL). Cell 0.4 em x 0.8 em (1:2). Grids: title ~20 columns, terminal ~80, picture 200+. Subtitles in a LOG strip at the bottom (~45 px, uppercase), outside the zooming grid; hold >= max(1.8 s, speech+0.6 s). Weights dim/normal/bold = 0.42 / 0.7 / 1.0.

## Pictures as text
Density ramp of ~20 levels from measured ink coverage with a small ordered+hash dither (amplitude ~0.7); cells below a threshold stay blank; local contrast `m + 0.9*(m - mean)`. Never fake it with an image plus an "ASCII filter": characters must be drawn as characters. Use a thin fill-only bitmap for masks (stroked atlas glyphs close counters in M, B).

## CRT post
3 px scanlines at ~0.3, barrel curvature ~0.045, multi-level bloom ~0.55, halo ~0.22, afterglow tau ~0.1-0.12 s, ~1% high-voltage flicker, faint reflection, fine noise.

## Motion
Typing ~10-40 ms per character (boot lines ~12 ms, commands ~38 ms, titles/replies 120-150 ms). The camera is the grid scale: push in (cells grow), pull out, push into one glyph, scroll, clear/hard redraw, text-becomes-image (grid shrinks as glyphs fall), power on/off, degauss. Characters never leave the grid except in a declared transformation moment (landing flash ~1.9x decaying over 0.12 s). Transitions happen on screen (clear, redraw, scroll, power); never a crossfade. Keep text inside the curvature safe area.

## Sound palette
Not chiptune. Low hums, relay clicks, a saw arpeggio that grows, ring-modulated voice optional. Silence is used throughout. Music ducked ~8 dB under voice.

## Avoid
Hacker-movie green rain, pixel-art sprites, sci-fi HUD vector lines or floating panels, decorative second hues, crossfades between screens, chiptune.

## Indian-audience ideas (our suggestion)
"IRCTC.LOG: Tatkal at 10:00:00", a UPI transaction trace typed line by line, an ISRO telemetry readout, a Y2K-era government terminal.
