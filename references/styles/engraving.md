# Style: Copperplate Engraving  - source folder `engraving`

Paraphrased from lemo-opuscar `styles/engraving/STYLE.md` + `DEMO.md` (MIT). Not copied verbatim. (anidoodle has "single-line engraving" and woodcut; this is the plate-printing recipe.)

**One-liner:** a museum natural-history plate: lines are cut by a burin one stroke at a time, a proof is pulled, then transparent hand-colouring blooms over it. The cutting order is the animation.
**Good for:** natural history, anatomy, objects, "museum label" explainers, instruments, plants/animals (Indian flora/fauna plates), historical devices.

## Palette
Paper `#f1e8d2` (laid paper), ink `#1c1510` (no grey fills), plate tone `#e8ddc2`, foxing `#9a6a34`. Hand-colour washes are muted earth/mineral and transparent only (demo set: `#d9962a`, `#a8743e`, `#8a6242`, `#6e4a3c`, wings `#a9c3cf` at alpha .5, `#7a5a3c`, pollen `#eaa21a`). Copper base `#5e2a12` to `#94502c` for the "raking view across the plate".

## Line craft
- Swell law: width x (0.2 + 0.8*sin(pi*u)^0.7), tapered over the first/last ~22% of each stroke. Uniform-width lines read as pen/vector and are forbidden.
- Tone by hatching: thresholds on 0-1 about 0.14, 0.5, 0.75; widths: outlines 0.45-1.35 swell, first hatch 0.18-2 px, cross x0.8, third x0.6; burin tilt <= 15 degrees. Hatching follows the form; darks, hair and stipple come last.
- Light from upper left, direction about (-0.55, -0.62, 0.56).
- Hand colour multiplies over paper: ~3.5 px spill, 1.5-2 px misregistration, tide-line at the wet edge, low-frequency density lift ~0.55, backruns, granulation. Colour only inside the figure (never on lettering, rules or paper outside).

## Layout
1920x1080 sheet (re-layout for 9:16: one plate fills the frame, roundels/labels below), pressed plate mark, ruled border ~9 px inside, subject centred. Double-ruled roundels in the margins (radius ~120) show magnified details; leaders ~0.95 px from a dot on the part to the rim with >= 34 px clearance (never hugging the subject).

## Type
Bodoni Moda roman capitals for titles (44-56 px, wide tracking ~0.16), labels 15-19 px, scientific names italic 20-24 px, notes in Pinyon Script (~29 px); subtitles in Pinyon Script ~38 px on a deckled paper slip.

## Motion and timing
Cut order: outline, first hatching, crossing, darks/hair/stipple. Loupe over the sheet; log-zoom pull-out; push to a part and ride with its roundel; locked frame with <= 2% breathing push; raking view across the copper. Colour regions bloom over 1.25-1.6 s starting ~0.42 s apart, after ~1.25 s of true silence. Transitions are printmaking only: proof pulled, tissue guard laid over, a region burnished out and re-cut. No dissolves or wipes.
Demo pacing: hook 0-2.5 s, proof pulled 2.5-3.2 s, build 3.2-6.2 s, details to ~24 s.

## Avoid
Uniform line widths, any grey fill in the ink, woodcut look (black block with gouges), pen sketch, blueprint, sepia filter, opaque colour, colour on lettering/rules, dissolves/wipes, burin skew above 15 degrees, leaders hugging the subject.

## Indian-audience ideas (our suggestion)
A plate of a Bengal tiger, banyan, mango leaf, a Mughal-era astrolabe, a spice (cardamom) cross-section.
