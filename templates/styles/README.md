# Ready style renderers (own renderer, Tatkal example content)

Fifty-two styles implemented from the recipe cards, all driven by ONE style-agnostic data file, so the same reel renders in each:
- `styles_data.js`: scene content (head lines, text/cmd/value/meter items with cue-based timing and state changes). **Edit this for a new topic**; every style picks it up.
- `index_lemo__ascii-crt.html` ASCII / CRT terminal (pure ASCII characters on a 40-column grid, amber phosphor, scanlines, vignette, power-on flicker, LOG caption strip)
- `index_lemo__art-deco.html` Art Deco (gold banded gradients, stepped frame, centre axis, bulb counting, symmetric door transitions)
- `index_lemo__swiss-motion.html` Swiss Motion (6-column grid, one family, one signal colour carried by one item, snap wipes with cubic-bezier(.7,0,.2,1))
- `index_lemo__dark-keynote.html` Dark Tech Keynote (dark stage + hairline grid, UI cards, one lime accent, UI expand/collapse transitions, toast captions)
- `index_lemo__caption-news.html` Caption News (huge captions slammed in chunks, keyword on a yellow block, channel bug, source tag, 2-frame flash on the turns)
- `index_lemo__countdown.html` Live Countdown split-screen (ticking mission clock, cells multiply as events arrive, orange = now/synced, live transcript)
- `index_lemo__pictogram-motion.html` Pictogram Motion (five-tone square-grid pattern with rows sliding sideways, geometric hero pictograms on a sun disc, mono HUD chips)
- `index_lemo__blueprint.html` Blueprint (cyanotype sheet, drafting-order line drawings that draw on, numbered notes, drawing-note captions, one red rubber stamp)
- `index_lemo__chalkboard.html` Chalkboard (green slate, chalk text revealed at hand speed, one orange accent chalk, damp-cloth wipe with a wet streak between scenes, chalk tray)
- `index_lemo__whiteboard.html` Whiteboard (marker lettering written slow-fast-slow, floating marker prop with shadow, hand-drawn circles/underlines, ghost marks, eraser wipe)
- `index_lemo__risograph.html` Risograph (two translucent inks on warm paper, multiply overprint, fixed misregistration, halftone disc, roller-sweep plate arrival, paper-knockout captions)
- `index_lemo__halftone-dossier.html` Halftone Dossier (cream case file, dot halftone, misregistered slab headlines, numbered exhibit cards, rubber-stamp slam, dot-grid wipes)
- `index_lemo__hologram-hud.html` Hologram HUD (rotating scanned wireframe on a projector pad, target-lock brackets, glyph-scramble values that lock in orange, voiceprint captions)
- `index_lemo__silent-film.html` Silent Film (silver print with flicker, gate weave, scratches and dust, iris in/out, ledger sheets, intertitle-card captions, 16 fps hand-cranked motion)
- `index_lemo__pixel-rpg.html` 16-bit Pixel RPG (180x320 native pixels scaled x6, indexed palette, Bayer dither, typed dialog boxes with a portrait, HP-style bars, dither fades)
- `index_lemo__game-show.html` Game Show Flat (candy sets with scrolling stripes/dots/sunbursts, hard offset shadows, ink-stroke telops, judgement bursts, a mascot hopping on a 120 bpm grid)
- `index_lemo__news-package.html` Broadcast News Package (ink cards with accent top edge, split-flap value tiles, strap with category tab and flipping headline, source line, channel bug and a slam-in sting)
- `index_lemo__stained-glass.html` Stained Glass (jittered quarry lattice in jewel glass, lead cames, a backlight band that sweeps the window, word panes that light up, blurred mirrored floor projection)
- `index_lemo__woodcut.html` Woodcut (black block, white carving: tapered rays that grow stroke by stroke, rough-edged lettering, one orange colour plate, ragged print edge, caption in the paper margin)
- `index_lemo__circuit-board.html` Circuit Board (top-down PCB: copper pour, traces with light pulses, gold pads, silkscreen footprints and designators, LED-bar meters)
- `index_lemo__spy-titles.html` Spy Titles (four flat inks, scissor-cut displacement edges, giant circle, strips sliding on beats, hard cuts between coloured grounds)

- `index_lemo__watercolor.html` Watercolor (wet-on-paper washes behind Cormorant text, pigment blooms)
- `index_lemo__crayon-book.html` Crayon Book (wax-crayon hatch boxes, wobbly outlines boiling at 12 fps, page-turn exits)
- `index_lemo__ukiyoe.html` Ukiyo-e (washi sheet, Prussian-blue bokashi sky, red sun, seigaiha water, tanzaku strips, TK seal)
- `index_lemo__one-line.html` One Line (a single ink line snakes row to row, outlined numerals, one red segment at the crash)
- `index_lemo__transit-map.html` Transit Map (metro line per scene, stations = items, train runs the track, network thumbnail)
- `index_lemo__iso-infographic.html` Iso Infographic (isometric slabs on a dot lattice, text on top faces, colour-coded tones)

Batch-5 notes: NEVER render two styles in parallel: render.mjs writes to the shared build/frames, outputs get mixed. Render sequentially. Fonts: cormorant-garamond, caveat, gaegu, patrick-hand. Simplified: no real brush physics in watercolor (blurred radial blooms); transit-map routes are fixed 4-column octilinear jogs; iso-infographic has no plinth and slabs shrink for dense scenes (small text).

- `index_lemo__paper-lantern.html` Paper Lantern (night-blue paper layers, amber backlit text, flickering light, hill silhouettes)
- `index_lemo__ink-wash.html` Ink Wash (rice paper, five ink tones, mist mountains, vermilion TK seal, ink-bloom reveals)
- `index_lemo__shadow-puppet.html` Shadow Puppet (lit cloth screen, dyed hide plaques with carved lattice, press-on blur-to-sharp entries)
- `index_lemo__engraving.html` Copperplate Engraving (laid paper, ruled plate, swelling hatch rules, numbered roundels, transparent hand-colour washes)
- `index_lemo__papercut-red.html` Red Paper-cut (red paper tags with punched edge holes on cream, lattice corner motifs)
- `index_lemo__silkscreen-poster.html` Silkscreen Poster (four flat inks, stepped sun bands and hills, offset-ink drop titles)

Batch-6 notes: these six share one generator (`skill/gen_batch6.mjs` in the project: a shared canvas prelude plus per-style bg/title/row/end/cap hooks), so adding another list-style canvas look is ~40 lines. Simplified: no real brush bristle simulation (ink-wash uses blur reveals and stroked rules); shadow-puppet has no puppets, only hide plaques; engraving hatching is rule-based, not form-following; paper-lantern is 2D layers, no depth of field.

- `index_lemo__briefing-board.html` Briefing Board (enamel whiteboard wall, marker headings, paper cards that land with weight)
- `index_lemo__telestrator.html` Sports Telestrator (striped pitch, broadcast bars, yellow marker arrows and a ring round the big number)
- `index_lemo__newsreel.html` 1920s Newsreel (silver-nitrate grain, flicker, scratches, gate jitter, intertitle plates)
- `index_lemo__midcentury-toon.html` Mid-century Cartoon (flat colour printed off-register from a wobbly ink line, pop-in bounce)
- `index_lemo__memphis-diorama.html` Memphis Diorama (hand-drawn organic frame, flat Memphis shapes, hard-shadow chunky cards)
- `index_lemo__glass-product.html` Glass Product (dark studio field, frosted glass slabs, light sweeps, RGB edge dispersion)

Batch-7 notes: generated by gen_batch7.mjs (same prelude as gen_batch6.mjs). Simplified: briefing-board has no photographs/erased-marker ghosts beyond smudges; telestrator has no real footage or rewind; newsreel has no ident/spinning newspaper; glass has no refraction or caustics (gradient fakes); memphis is a frame + props, not a modelled diorama.

- `index_vox__explainer-collage.html` Vox editorial collage (accent field, cream paper panel, sticker-bordered paper cards, washi tape, halftone, push-in, outlined captions); see references/styles/vox-explainer.md

- `index_bang__explainer-visual-journalism.html` Bang explainer: visual journalism (black ground, yellow highlighter titles, FIG. tags, dashed annotation lines)
- `index_bang__explainer-white-catalog.html` Bang explainer: white catalog (white grid, numbered product cards, mixed serif/heavy sans, red scribble circles)
- `index_bang__explainer-vintage-sketch.html` Bang explainer: vintage sketch (sepia plate, deckled paper strips, rust "!" annotations, double-rule titles)
- `index_bang__explainer-cartoon-collage.html` Bang explainer: cartoon collage (cream paper, numbered colour pills, flat star/cloud/squiggle doodles)
- `index_lemo__dataviz.html` Data Storytelling (graph-paper axis, dotted leader lines, handwritten notes, red/blue pencil bars, circled numbers)
- `index_lemo__urban-sketch.html` Urban Sketch (fineliner overshoot boxes, watercolour washes, hatching, washi tape)

Batch-9 notes: generated by gen_batch9.mjs. Bang explainer renderers imitate each style's README description only (no upstream code was run, no real photos/cutouts/characters); the white-catalog circle can overlap a meter's number; dataviz draws no real chart, it is the card list restyled as annotated data.

- `index_own__kinetic-type.html` Kinetic Type (Near-black stage with a drifting violet spotlight; huge heavy type blurs in line by line, gradient headline, one accent per tone)
- `index_own__system-diagram.html` System Diagram (Navy blueprint grid; each item is a boxed node with a type tag (NODE/CLI/KPI/METRIC) and dashed connectors carrying travelling dots: made for system-design reels)
- `index_own__clay-toy.html` Clay Toy (Claymorphism: pastel gradient, puffy gradient cards with inner gloss and soft double shadows, floating clay balls, bouncy pop-in)
- `index_own__receipt.html` Receipt (Thermal-paper till receipt with zig-zag edges, mono type, dotted leaders, red boxed flags, barcode footer)
- `index_own__sticker-collage.html` Sticker Collage (Kraft paper with die-cut vinyl stickers: white borders, gloss, slight tilt, outlined sticker headline)
- `index_own__lab-notebook.html` Lab Notebook (Graph-paper notebook with spiral holes, pencil handwriting, red ticks and crosses in checkboxes, marker highlight on key lines)

Batch-10 notes (Reelsmith originals, id `own/<slug>`): drawn natively on our shared data model; the looks were inspired by genres seen while researching public skills (system diagrams and kinetic type in PHANTOMTONYT/motion-design-skills and IskakovDamir/apple-motion; sticker x receipt and lab notebook x stickers in cloveric/claude-drawing-skill). No code, images or text from those repos were used. Simplified: system-diagram draws a vertical chain only (no branching graph); receipt flags rows with a red box rather than printing a real total; kinetic-type has no per-word timing beyond a line-level blur-in.

Use: copy these files next to `index.html` in a project that has `build/timings.json` + `build/audio.wav`; fonts: `npm i @fontsource/inter @fontsource/inter-tight @fontsource/jetbrains-mono @fontsource/architects-daughter @fontsource/b612 @fontsource/vt323 @fontsource/limelight @fontsource/poiret-one @fontsource/josefin-sans @fontsource/league-gothic @fontsource/league-spartan`;
render: `INDEX=index_lemo__spy-titles.html node render.mjs full out/lemo__spy-titles.mp4`. The scene ids and cue names in `styles_data.js` must match your `script.json`.
Known simplifications vs the upstream specs: ASCII/CRT has no true barrel distortion or phosphor afterglow; Art Deco has no airbrushed volumes or Busby-Berkeley overhead; Spy Titles has no silhouette figures and no stop-time freeze.

Lessons baked in (all hit while building): append a scene root to the page BEFORE measuring text for fit-to-width (detached elements measure 0); use `getBoundingClientRect` on an inline span, not `scrollWidth` of a block; size big numerals from cell width, not only height; never let an "alert" colour flood whole cells (flag text events only); keep captions out of the content zone (y>=1290); reserve stable layout for items that appear later.
Known simplifications: Swiss has no rotate/pull-out camera moves; Keynote has no 2.5D depth blur; Caption News has no real footage (tinted data cards instead); Countdown has no video cells or sync badges; Pictogram has no human figure and no beat-locked pose cycles; Blueprint has no paper-fold shader, ink bleed or one-time 3D "real thing".

Batch-2 notes: when two blend layers (risograph plates) show the same row, give both layers identical row heights (invisible twin text) or they drift apart; fit headline width only after the node is attached; text on small board/plate styles needs >= 44px to read on a phone; avoid animating clip-path on elements whose width depends on their own content without measuring first.
Simplifications vs upstream: Chalkboard has no per-stroke chalk engine (text is revealed left to right with a grain filter); Whiteboard has no travelling camera across a big board; Risograph uses CSS dot masks instead of per-plate channel canvases; Hologram uses a generic rotating wireframe, not the real subject; Silent Film has no inked 2.5D figures.

Batch-3 notes: canvas styles (pixel-rpg, stained-glass, circuit-board) draw every frame from scratch: keep per-frame work small (pre-render static layers once); pixel fonts need drawing at their native size on a low-res canvas scaled with image-rendering:pixelated; plates/panels must reserve stable heights when later states are longer; use text halos (stacked dark text-shadows) when bright decoration passes behind lettering.
Simplifications vs upstream: Pixel RPG has no overworld/battle scenes or colour-depth tables; Game Show is not locked to a (bar, beat) event grid for item entrances (only the mascot hops on beat); News Package has no rundown, maps or charts; Stained Glass has no painted grisaille figures or a real lit-room model; Woodcut has no form-following hatching engine; Circuit Board has no depth of field, zooming between board scales or routed Chinese/Devanagari silkscreen.
