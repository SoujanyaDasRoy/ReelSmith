# Style: Archive Light Table  - source folder `archive-lighttable` (note: not `archive-light-table`)

Paraphrased from lemo-opuscar `styles/archive-lighttable/STYLE.md` + `DEMO.md` (MIT). Not copied verbatim.

**One-liner:** real archive objects (negatives, telegrams, clippings, rulers) lie on a glowing light table; a loupe lands on them, the camera falls into the scan, and evidence is read, measured and struck through in one signal colour.
**Good for:** documentary-style explainers, "the record vs the claim", history, RTI/records, fact checks. Use only real, licensed archive material (public-domain/CC0 scans); never a generated image standing in for an object.

## Palette
Table `#F7F9FB` (cool near-white, emissive ~0.97), ink `#15171A`, signal orange `#FF5A1F` for marks, readings and the verdict only, caption plates rgba(14,15,17,0.74), dark desk `#0E0F11`, brushed-aluminium frame, ambient with table off ~0.04. No colour-on-colour; no sepia, no halftone, no paper-ageing overlay ("the age is in the objects, not the grade"); do not regrade the archive into a scheme.

## Type
Monospace for identifiers, dates, readings (IBM Plex Mono 17-34 px; readings 74-120 px); sans for labels (21-36 px); serif for titles and one photograph name (60-76 px). Subtitles in a caption strip at bottom centre with a 3 px signal-colour edge; hold >= max(1.8 s, speech+0.6 s). Keep readings clear of the bottom ~140 px strip.

## Optics
- Light table: emissive with soft falloff and diffuser noise. Negatives render from scan transmission `T = 0.035 + 0.9*(1-pos)^1.25` so a negative "develops" to positive under a moving front.
- Loupe: ~2.5x magnification, pincushion k ~0.16 at the rim; lands with a fast ease-out ~0.4 s and lifts the same way; landing scales it ~1.35x. Keep the lens interior under ~1.5 screen px per scan px (do not over-magnify a weak scan).
- Light vignette + fine moving grain (heavier in photographs). No film damage.

## Motion
24 fps on ones. Camera parameters follow smooth monotone curves through keys (no overshoot). Table glide (pan and roll), loupe landing and push into the lens, tracking along a line inside the lens, photograph-space dolly with parallax, rise out of the lens, pull back to the whole table. Lines draw on in 0.3-0.6 s. Never glide the loupe over empty table; never let labels scroll off before they can be read. No cuts, fades to black or page turns between objects: the camera moves between them.
Layout: objects at true proportions; labels attach with an anchor dot and ring, a vertical leader, then text; subject >= a third of frame height at a reading moment.

## Avoid
Sepia/halftone/ageing overlays, regrading archives, colour on colour, cuts/fades/page-turns between objects, weak-scan over-magnification, floating loupe over nothing, generated stand-ins for real objects.

## Indian-audience ideas (our suggestion)
Partition-era telegram vs newspaper clipping, a railway ticket and timetable page, old ration card, a census sheet; always cite the archive and licence on the end card.
