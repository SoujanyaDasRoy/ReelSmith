# Style: Paper Lantern (Paper-cut Lightbox)  - source folder `paper-lantern`

Paraphrased from lemo-opuscar `styles/paper-lantern/STYLE.md` + `DEMO.md` (MIT, LemoLab). Not copied verbatim.

**One-liner:** every shot is a shallow backlit paper box (about 0.56 x 0.33 m, 0.16 m deep) holding 6-9 parallel sheets of cut card; light glows through the paper, soft shadows fall between layers.
**Good for:** night journeys, festivals (Diwali, Lohri), folk tales, quiet emotional stories, lullaby-like explainers.

## Look
- Colour ladder back to front: pale/cool at the back, nearly black at the front; warm light (amber to gold) is the only saturated colour plus ONE accent (a seal red or one object colour). One temperature per stack; a new ladder means a new place.
- Example ladders: night village `#0a1330` sky, `#6a86c2` far, `#3f5a92` mid, `#0e1532` front, windows `#ffb862`; desert dusk `#f0c890`, `#c07850`, `#6a3020`, `#1e0e08`, fires `#ffd080`; winter forest `#dfe6ee`, `#9aaec4`, `#4a6078`, `#101820`, one red scarf.
- Light points `#ffc46a` / `#ffc070` / headlight `#ffd590`; bloom strength ~0.3, threshold ~1.15.
- Every element is a paper layer, light through paper (holes that bloom), or a soft cast shadow from a top spot. Text is paper too (cut strips).

## Build recipe
- Paper layer: flat colour + fibre grain, warm rim light on the top edge, dark band on the bottom edge (a few px offset).
- Backlight: emissive += albedo x lightColour x translucency x lit x falloff x (base + cloud). Translucency ~0.9 far to ~0.05 front. Gaussian falloff around a per-shot light point. Windows live on a separate canvas gated by a 0->1 switch-on.
- Soft shadows from a top spot onto layers behind: never off. Shallow depth of field, bloom, gentle vignette, 2x supersample.
- Light-on cue: source first, then each layer's translucency staggered ~0.4 s, then windows, then flicker `1 + 0.06*sin(7.3t)*sin(3.1t)`.
- Motion is "paper on a stick": slide, rotate about a pivot, scale in along one axis (text "written out"), or light up. No squash/stretch/morph/bend. Figures (optional) are jointed silhouettes, rotation only.
- Camera: slow dolly in/out, rack focus between layers, lateral travel with parallax, top-down stack, near-plane curtain wipe (halves must meet exactly), ~0.6 mm hand-held drift. No whip pans, no digital zoom. Transitions: 0.5-1.2 s dissolves, iris, light off/on, curtain.
- Render on ones at 30 fps (never step). Hard actions land on spoken word timestamps (our cues).

## Type and captions
Serif 500, ~40 px (Latin ~38 px), ~64-74 px above the bottom on the darkest front band, never over a lit window or figure. Hold >= max(1.8 s, speech + 0.6 s). For our reel keep captions Roman Hinglish, one line (split at the comma near the middle if >~42 characters), inside our safe area.

## Sound (we use our own mix, so only the palette of sounds)
Felt piano, music box, celesta, harp, plucked zither, bamboo flute; no drum kit (single woodblock/gong strokes only). Foley: switch click + rising shimmer, paper rustle, chime on reveals. Silence = lamp off, room tone drops.

## Avoid
Flat paper-cut animation (this one has depth, backlight and shadow); shadow puppetry (no single screen, no rods); 3D diorama (everything is a flat sheet parallel to the box); copying any real lamp, film frame or character.

## Pitfalls
`destination-out` cut-outs need an opaque fill first or the hole is half-cut; non-participating layers need shadow off AND receive off (halo); use analytic falloff not a transparent radial texture (square edge glow); sheets must not exceed the cavity; reset grade state each frame; glare over name boards washes letters; headless Chrome needs GPU flags (SwiftShader ~6x slower).

## Indian-audience ideas (our suggestion)
Diwali diya street at night, a Mumbai local train's last run, Rann of Kutch caravan, Ganga aarti, Ramlila at dusk (accent colour = vermilion/sindoor red).
