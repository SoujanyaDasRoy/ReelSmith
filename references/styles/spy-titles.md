# Style: 60s Spy Titles  - source folder `spy-titles`

Paraphrased from lemo-opuscar `styles/spy-titles/STYLE.md` + `DEMO.md` (MIT). Not copied verbatim.

**One-liner:** an opening title sequence for a film that never existed: flat four-ink cut paper, hand-cut edges, silhouettes in profile, type as picture structure, music cutting the picture.
**Good for:** teasers, "how a heist/scam/hack works" stories, trailers for a series, playful mystery explainers (UPI fraud, SIM swap).

## Palette (four flat inks, no gradients)
Ink black `#1b1714`, paper cream `#efe4c9`, signal red `#d23a22` (hero accent and danger only), mustard `#e2a52a` (the chased object). Shadow-paper variants for depth only: `#9a2a18`, `#b07e1c`, distant city `#3a322b`. Alternates: ink `#161a22` / bone `#ece6d6` / teal `#1f8a8a` / orange `#f07a28`. One dominant ground per scene; background props are a darker ground colour, never black.

## Materials
- Scissor-cut edges: resample every polygon each ~9-10 px, displace along the normal by low-frequency noise (1.2-2.2 px), rare 1-2 px notch; cut once in piece-local space and cache so moving pieces keep the same edge.
- Layers: ~2.4 px cut gap in ground colour + paper shadow (offset ~3 px, blur ~5, alpha ~0.3). Full-frame multiply paper texture, sparse ink-void speckle, faint squeegee streaks, film grain in the mux.
- Silhouettes: ~7 heads tall; identity = hat, coat, shoes, one accent (a tie that streams when running). Merge pieces into one outline; only thin joint slits (~1.7 px). Hands as sharp wedges. No faces except an eye slit in close-ups.
- The chased object sits on a black backing so it reads on any ground.

## Type
Credits: League Gothic re-cut per letter (edge noise, +-0.8 degrees, +-1.5 px baseline jitter). Title: custom geometric cut glyphs, never a real title's lettering. Subtitles: League Spartan 600 ~44 px on a narrow scissor-cut paper strip, bottom-left, tilted -1 degree, slides in 60 px in 0.18 s; light strip on dark scenes, dark strip on light. Credits are fictional roles only, one line per location, each readable in full at some moment. Hold >= max(1.8 s, speech+0.6 s).

## Motion
Puppets on twos (12 fps); camera, credit slides, grid growth on ones (24 fps). Run cycle 8 drawings, one step per beat. Credits slide on grid lines and stop dead on the beat (ease-out ~0.2 s); letters land with a paper slap. **Stop-time:** at a stab the whole picture freezes for two beats in true silence. Shatter: a scene sliced into strips sliding off along the diagonal. Strong ~30 degree diagonals, big flat grounds, small figures against type. No dissolves.
Camera table: wide on a full credit then truck in; lateral tracking in one direction (pursuit); hard cut on a brass stab; graphic match cut (same circle centre and size across the cut); locked single shape (cold open); silhouette against a giant circle; diagonal split into a grid; vertical pan down a column of type; push into a letter until it is a place.

## Sound palette (for our own mix)
1960s big-band: staccato stacked brass stabs (edit points, placed ~8 ms early), surf-guitar twang, walking bass, brushes, bongos, vibraphone, harpsichord. Minor keys, chromatic lines. Original motifs only; avoid the famous chromatic crawl and its ending chord. True zero silence in stop-time.

## Avoid
Flat vector motion graphics, halftone dots, Swiss grid, gadget/gun-barrel parody, copying any real title's logo, lettering, characters or shots, real people's names in credits.

## Pitfalls
Outlining every internal piece looks like a mannequin diagram; a `clear()` that resets the transform kills the camera; a figure hidden behind a letter reads as nobody; a stiff streamer looks like a tongue (use a travelling-sine ribbon); a credit seen partially is uncomfortable; an object in the same ink as its ground vanishes; flat inks + grain make huge files at low CRF (CRF 24 looks the same as 19).

## Indian-audience ideas (our suggestion)
A "Bollywood-era" 60s-70s agent-and-vamp teaser for a cyber-fraud explainer, a "CID-style" mystery title card, a heist titled "Chai Cipher".
