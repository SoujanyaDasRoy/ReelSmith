# Style: Shadow Puppetry  - source folder `shadow-puppet`

Paraphrased from lemo-opuscar `styles/shadow-puppet/STYLE.md` + `DEMO.md` (MIT). Not copied verbatim. (huashu-art-motion has #34 shadow puppetry too.)
Indian relevance: Tholu Bommalata (Andhra), Togalu Gombeyaata (Karnataka), Ravanachhaya (Odisha) are Indian leather-shadow traditions; this recipe's light/hide model fits them. Do not reuse specific historical puppets, melodies or recordings.

**One-liner:** a white cotton screen lit from behind by oil lamps; jointed puppets cut from translucent dyed hide glow in colour, carved holes shine brightest, overlaps go darker, rods show as faint grey lines.

## Rendering model
Image = tonemap(lampLight x hideTransmission x clothTexture).
- hideTransmission: a canvas that starts white; every piece is drawn with multiply; holes stay white, overlaps darken.
- lampLight: per lamp a broad lobe + tight hotspot (~6:1; demo sigma ~700 px / ~120 px), each flickering independently (value noise ~7 Hz, +-6%, plus a faster sine). Light colour warm (1, .77, .46).
- tonemap `1 - exp(-hdr)`; exposure ~1.75/sqrt(lamps lit): brightness comes from lamp count, not grading; night = fewer lamps, never added blue.
- Cloth: procedural weave, fibre speckle, density blotches, darker edges. Post: warm-tinted bloom (threshold ~0.72), warm vignette toward brown, slight saturation, soft S-curve, light grain. Heat haze only when the story burns.

## Dyes
Vermilion `#b8211a`, flame `#d9541c`, ochre `#dc9d1e`, gold `#c98a26`, malachite `#236e3a`, jade `#2f8a5c`, indigo `#22647e`, raw hide `#e2bd80` (neutral), ink `#1a100a` (outlines, hair, boots). Sets: court (vermilion, ochre, malachite), river (indigo, jade, one ochre), harvest (flame, gold, one green). Overlap is darkness: plan crossings.

## Hide and carving
Multiply a tileable hide texture into each piece, then restore alpha with destination-in so holes survive. Carving = density: thin strips left, most area cut. Vocabulary: crescent rows (scales), diamond lattice, coin holes, cloud collars/scrolls, tapered slits, strata, leaf holes. 1.5-2.4 px dark carved outline on every region.

## Figures and scenery
8-12 jointed pieces, head ~1.2x natural with large headwear (about a quarter of the figure), sleeves in a different dye, round joint lobes with a visible rivet, arms by 2-bone IK from hand targets, held objects separate pieces. Sympathetic figures: open-cut faces; antagonists: solid faces. Scenery: carved set pieces on mostly empty lit cloth; fire, smoke and water are carved pieces swapped and shaken (12 fps), never particles. Puppets in profile.

## Motion
24 fps continuous; hand tremor ~3 px / 0.018 rad on every puppet (x1.8 under tension). Legs/plumes/tassels simulated by damped pendulums or spring chains driven by body acceleration (pre-simulate at 120 Hz). Operatic phrasing: shuffling run, hop, crouch, freeze on a percussion accent (~1 s; only loose parts quiver), head turn. Faces never change; attitude = head angle + body tilt. Press on: arrive large and blurred onto the cloth and snap sharp (scale 2.6 to 1, blur 34 to 0 over 0.55 s); lift off: grow, blur, fade (~0.9 s). New lamp flares with overshoot (~1.5x); a snuffed lamp gutters 0.35 s. Cloth and frame never move; nothing morphs.
Camera: audience seat (whole stage), push through the frame onto the cloth, lateral pan, follow a puppet, crash zoom of a few frames on a percussion hit, whip pan along a moving piece, locked wide, medium-close with empty cloth between two pieces, close on carved detail, tilt up the cloth, truck to the back (mirror view reveals the trick), pull back into the dark room. Clamp the camera to the screen rectangle; push on frame centre. Transitions: lamps dimming, blurred pillar wipe, a piece lifting off in light, flash to warm white. Never crossfade.

## Type
Subtitles belong to the theatre: a narrow dark-lacquer placard with a thin gold line and small seal, or letters carved in hide. Classical serif 40-50 px (demo 46 px, `#f3e2bf`), slides up 18 px in 0.22 s, held to speech + 0.8 s (>= 1.8 s). Titles are dark hide plaques with letters cut out so words glow, carried on rods.

## Sound palette
Percussion first: barrel drum, clapper (woodblock), cymbals, small gong rising, big gong falling; bamboo clapper, pellet drum, plucked lute, bamboo flute for quiet; nasal bowed fiddle with slides. Hard stop (<= 30 ms, tails included) for silence. One big gong per decisive hit.

## Avoid
Black silhouette film (colour is the second protagonist), paper-cut (here the light comes through), stained glass (no lead lines; pieces move), flat vector cut-out animation.

## Pitfalls
Clip-art look (add hide texture, denser openwork, deeper dyes, carved outlines); unreadable profiles (bigger head, fuller lower body, collar, contrasting sleeves); radiating shapes read as saw blades (flame tongues with fat base and hooked tip); grey corners when overexposed (warm vignette); thin pale pieces vanish (make them dark); mirrored view flips pieces if x scale is used for both axes; dark smoke only (light smoke invisible on bright cloth).
