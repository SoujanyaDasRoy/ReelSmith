# Style: Chinese Ink Wash  - source folder `ink-wash`

Paraphrased from lemo-opuscar `styles/ink-wash/STYLE.md` + `DEMO.md` (MIT). Not copied verbatim. (huashu-art-motion also has a Chinese ink-wash recipe, #17; anidoodle has sumi-e and ink & line-wash.)

**One-liner:** xieyi ink painting on rice paper, animated: blank paper is space (liubai), black ink in five tones plus one vermilion seal, forms made by loaded brushstrokes, wet washes that bleed and dry strokes with flying white.
**Good for:** philosophy, calm explainers, journeys, mythic stories, "one decisive action" narratives; Indian parallels: sumi/ink-and-brush looks work for Ramayana/Panchatantra mood pieces.

## Palette
Paper `#F2ECDE`. Ink from cool grey rgb(.52,.55,.58) (low density) to warm black rgb(.075,.068,.062). Vermilion `#B02E22` for the seal and at most one story accent. Five tones as opacity multiplied on paper: jiao ~.96 (calligraphy, sharpest lines, moss dots), nong ~.82 (contours, dark stroke edges), zhong ~.60 (secondary lines, folds), dan ~.34 (mountain bodies, robe washes), qing ~.16 (far mountains, faces, mist). Never a red wash or red type.

## Build recipe
- Paper is procedural in the compositor (cloud mottling +-7%, long fibres in three directions, pulp flecks, grain that fades when zoomed out, vignette ~.22), anchored to the world. Ink is multiplied onto paper, never an overlay.
- Brushstroke = centreline x pressure profile x width noise + 4-60 bristles whose ink load drops along the stroke and breaks on long-scale noise (`dry` 0 = wet solid, 1 = flying white). Loaded stroke: bristles darker on one side so the stroke carries its own contour.
- Two layers: wet layer bleeds in the compositor (noisy ~5 px blur, edge pigment accumulation, granulation); dry layer gets only fibre jitter and paper tooth.
- Masses are soft jittered polygons with gradients, never flat fills. Mountains dissolve downward into mist; texture strokes and moss dots only on near ranges. Water is blank paper with faint dry streaks and open ink rings. Figures: one pale body mass + two loaded strokes, burnt-ink limbs, 3-5 stroke features.
- Calligraphy: use an OFL brush font only as a skeleton; trace centrelines in stroke order, hidden-tip entry, tapered exits.

## Type
Subtitles are inscriptions: classical italic serif (Cormorant Garamond italic ~46 px), ink-coloured, no box, <=2 lines, placed in empty paper, tiny vermilion square before each line. Titles in vertical columns with a code-drawn vermilion seal. Draw subtitles outside the world camera transform. Hold >= max(1.8 s, speech+0.6 s).

## Motion
Figures on twos (12 fps), everything else on ones (24 fps). Seed strokes by index and compute bristle breaks along normalised arc length so flying white does not crawl; only a small width-noise boil (5-drawing cycle). Things are painted into existence in drawing order, or bloom or dissolve into mist; never tweened like vectors. Stillness before action: hold with at most ~5% push-in, then the decisive stroke crosses the frame in ~4 frames; consequences begin after it ends.
Camera: locked frame on paper; right-to-left handscroll pan; vertical tilt for hanging scroll; lateral tracking with slow far parallax; high wide with tiny figure; low angle dark mass; hard cut to extreme close-up is the style's only hard cut. Transitions: ink bloom (noisy radial mask with a dark tide-line), scroll pans, mist; never a generic dissolve or wipe. Framing 60-80% empty paper.

## Avoid
Watercolour (no colour washes), vector art with a brush texture (flat fills/closed outlines), calligraphy title sequences.

## Pitfalls
Dry brush looks dashed unless breaks come from long-scale noise + dropping ink load; parallel semi-transparent strokes look like organ pipes; big side strokes look like a hairbrush; splitting a stroke body between wet and dry layers loses density (full body in dry + wet halo); clipping with a font outline notches junctions; heavy per-pixel scenes may exceed screenshot timeout (retry).

## Sound palette
Guqin-led (or sitar/sarod for an Indian reading), low breathy flute, big drum for mass, small gong for the seal; pentatonic mode; cue to the picture, never loop. Silence is literal (zero the whole bus) with at most one sound inside. Foley: ink drop, brush air (band-passed noise), seal thump.
