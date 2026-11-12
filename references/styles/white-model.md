# Style: White Model (Projection on White Model)  - source folder `white-model`

Paraphrased from lemo-opuscar `styles/white-model/STYLE.md` + `DEMO.md` (MIT). Not copied verbatim.

**One-liner:** a pure white massing model of a real place on a plinth in a dark room; a projector paints open data onto it as light, one layer at a time.
**Good for:** cities, floods, population, pollution, transport, "how X grew" explainers using real open data.

## Rules that define it
- Geometry is real (footprints + heights from open data at a stated scale, e.g. 1:1000). Never invent a year layer; never use a generated image for the place.
- Material: matte white `#F3F3F1`, roughness ~0.9; water = darker satin inlay; plinth `#17181A`; neutral studio environment (warm HDRIs turn the model beige); AO on close shots only.
- Projection is a shader term, never a texture: `colour * (0.42 + 0.58*max(N.toProjector,0)) * throwMask`, scaled by albedo, reduced on water. Per-building attributes (year, height, rank) live in vertex data.
- Sun (if used): a real directional light with shadow maps from real latitude/date/time; projector may trace the shadow, never fakes it.
- Post: physical DoF (more on close shots), bloom only above projection highlights, vignette, light grain.
- 2D overlays (readouts, pins) use the camera's world-to-screen function.

## Colour logic
Neutral ground (white model, near-black room). One hue family per layer, never more than two layer palettes on screen. Demo age layers: pre-1940 `#FFA13D`, 1940-64 `#2A46FF`, 1965-89 `#2F98FF`, 1990-2009 `#6FDCFF`, 2010-25 `#E6FBFF`; height ramp `#1A1440 -> #5A35D6 -> #E2509A -> #FFE7C4`; projected shade `#1C2C66`; sun `#FFD9AD`. A colour returns only with the same meaning.

## Type
Figure: Inter Tight 200, 120-140 px. Labels 20-36 px, instruments/years IBM Plex Mono 18-22 px; nothing under 18 px. Readout in the left third, one per layer (index, name, one figure, one label, source line, legend bar). Pins: hairline to a dark tag, never over the readout. Subtitles bottom centre on a soft dark gradient, no box. Holds: subtitles >= max(1.8 s, speech+0.6 s); labels >= letters/15 + 1.5 s.

## Motion
Light is the actor; model and plinth never move. Camera moves continuously and slowly. House lights cut fast (0.25 s) and return slowly (1 s); the projector strikes with a flicker; counters roll while light moves and land when it lands; measured lines grow A to B with ticks; buildings switch on one by one with a short flash. Camera grammar: macro glide at roof height (the model is an object), crane up/back (pattern seen from above), slow orbit with a rise (growth), boom down to low angle (skyline), side-on track (measured distance), pull back as house lights return (ending).
Transitions are light changes inside one take, not cuts or fades.

## Avoid
Isometric infographic (diorama/icons), low-poly invented terrain, sci-fi hologram HUD (wireframes), satellite imagery, laser-scan look (hairline scan lines: give fronts a wide soft edge), generated imagery for the place.

## Pitfalls
Wrong wall winding shows inside faces (derive outward normals from ring orientation); shared walls z-fight; GTAO on wide grazing views makes wedge bands; low sun lights facades not roofs; anchor pins on the tallest part not the centroid; say which source a number comes from ("roof", "measured"). Data licences: CC BY / CC0 fine with credit; ODbL/CC BY-SA need terms agreed first.

## Indian-audience ideas (our suggestion)
Mumbai flooding layers, Delhi AQI by ward, Bengaluru growth by decade, metro lines opening year by year (use official open data; check licence).
