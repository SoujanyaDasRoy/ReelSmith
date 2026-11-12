# Engine: Claude Drawing (cloveric/claude-drawing-skill, MIT)

Source: vendor/claude-drawing-skill/ (README, docs/STYLES.md, PRINCIPLES.md, USAGE.md, GIFS.md, GALLERY.md; licence kept). The upstream SKILL.md (~740 KB) and the Chinese docs/thumbnails were NOT vendored.

## What it is
A Claude Code skill plus a small painting library: "Claude paints with code, no image model". 83 procedural styles written with numpy + Pillow on a CPU (ink wash, watercolour, paper collage, coloured pencil, anime, risograph editorial, impasto oil, ukiyo-e, pixel art, clay, cyanotype, cross-stitch, chalkboard, cyberpunk, isometric, continuous line art, soft 3D, newspaper collage, aurora, Bauhaus, synthwave, perler beads, petroglyph, ...). Each style simulates the real medium (paper tooth, wet edges, registration drift, bristle flow fields, ray-traced balls...). It can output draw-on GIFs, i.e. the picture appears stroke by stroke.

## Index entries
`draw/<module>` for all 83 (see `references/all-styles.md`, engine `claude-drawing`). Several overlap our own canvas styles (ink wash, watercolour, ukiyo-e, chalkboard, risograph, pixel art, stained glass...); the upstream versions are far more physical but need Python.

## How it would fit a reel
Python is NOT installed on this machine, so every `draw/*` style is **blocked** until Python 3.10+, numpy and Pillow exist (ask before installing). Then: draw one painting per scene (or one long scene), export draw-on frames at 1080x1920, assemble silent video with ffmpeg, mux our voice/music, run `scripts/qa.mjs`. Our text/caption layer should be composited by our renderer, not painted. Read `vendor/claude-drawing-skill/docs/USAGE.md` and `PRINCIPLES.md` (drawing principles: composition, value, layering) before the first one; they are good general art direction even without the code.
Not done: nothing from this engine was installed or run.
