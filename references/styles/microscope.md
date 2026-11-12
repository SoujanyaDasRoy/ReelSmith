# Style: Microscope Story  - source folder `microscope`

Paraphrased from lemo-opuscar `styles/microscope/STYLE.md` + `DEMO.md` (MIT). Not copied verbatim.

**One-liner:** one continuous camera dives from a glass slide down into a stained specimen and back, measuring as it goes; instruments and readings sit on frosted panels.
**Good for:** health/biology/materials explainers, "what is inside X", measured claims ("2.4 times more"). Use only real, licensed (e.g. CC0) specimen images; never a generated image as a specimen; describe what was measured, never diagnose; never mix samples.

## Palette
Glass `#F4F1EC`; bench graphite gradient `#0B0D0F` to `#2A3036`; ink `#181B1F`; frosted panels rgba(12,14,17,0.74) with a 1 px light rim; accent mint rgb(120,240,205) on stain, rgb(0,122,99) on glass. Stains keep their true colour (e.g. trichrome red/blue): no grey grade, no false colour, no film emulation.

## Type
Light condensed grotesk for readings and the scale bar (40-72 px, Barlow Condensed); monospace for instruments and pixel counts (20 px, IBM Plex Mono); sans for labels (20-34 px); serif only for the title. Nothing below 20 px at 1080p. Label hold >= characters/4.5 + 1.5 s (CJK) (for Latin text use letters/15 + 1.5 s).

## Camera and motion
- The camera is a similarity transform interpolated as a log spiral between keys. Ease the moves; creep 2-5% during holds; "never a frozen frame longer than a second".
- Plates blend between ~2.2x and ~1.45x downsampling during zoom. A focus breath and a turret click at each real magnification change.
- Dimension lines grow from their centre; a reading lands with a small spring.
- Vocabulary: the dive (log zoom with a roll), locked frame with slow creep, truck at one magnification, pull back to frame two marks, focal-plane sweep, the climb back (scale bar jumps backwards). Transitions are scale changes, trucks and focus: no cuts or crossfades between samples.
- Counted pixels appear as a mask revealed behind a scan front. Subject fills >= a third of frame height at key moments.

## Layout
Instruments (scale bar, field of view, magnification) in one frosted panel in a corner; source credit in a small panel in the opposite corner; readings beside their marks with a leader; subtitles bottom centre on a frosted strip.

## Effects
Screen-space Gaussian blur on a margin-extended frame, light vignette, 1.5-2.5 px hairlines with a halo, soft shadow under the slide on the bench.

## Avoid
Satellite grey grade, sci-fi HUD (glowing crosshairs/wireframes), chart paper, keynote slides/header bars, false colour, generated "specimens", reusing another film's layouts/typefaces/music or naming it, diagnosing.

## Sound
Audio target -14 LUFS; voice ~10 dB over music (we do our own ducking in `audio.mjs`). Foley: soft turret click, focus breath.

## Indian-audience ideas (our suggestion)
Haldi/turmeric under a lens, adulterated vs pure spice (only with real licensed micrographs), a mosquito wing, a strand of Khadi cotton fibre, a chai leaf.
