# Style: Vox editorial collage + Vox narrative arc  - source `vox-explainer-skill`

Paraphrased from CK42BB/vox-explainer-skill `references/vox-style-guide.md` (MIT). Not copied verbatim. Its paid Atlas Cloud pipeline (image/video/voice/music APIs) is NOT used; we adopt only the writing arc and the visual grammar, and draw the look in code (`templates/styles/index_vox__explainer-collage.html`).

**One-liner:** an editorial mixed-media collage: paper cutouts with white sticker borders on aged cream paper, halftone dots, washi tape, one or two flat geometric accents, ONE accent colour carried through the whole film.
**Good for:** history, economics, science, "how X really works" explainers; Indian topics (railways, UPI, monsoon, spice trade, Mughal cities).

## Narrative arc (use as the scene plan)
1. **Cold open (1 beat):** a concrete surprising fact, image or question; never "today we will talk about".
2. **Turn to context (1 beat):** the zoom-out line ("to understand this, go back to...", "but that is not the whole story").
3. **Escalating explanation (50-70% of beats):** one throughline; each beat makes the viewer feel a bit smarter; numbers, scale comparisons, named specifics.
4. **Complication (1-2 beats):** the cost, tension or irony.
5. **Resolution + reframe (1-2 beats):** return to the cold open with new meaning; last line quotable.
Sentence rules: present tense for history, second person sparingly, concrete over abstract, vary rhythm (long sentence, then three words), write numbers as they are SPOKEN, read aloud for stumbles.
Beat budget at ~150 wpm: 45-60s = 6-8 beats x 25-35 words (~200 words); 90s = 10-12 beats (~330 words); 3 min = 16-22 beats (~650 words). Over-writing is the top cause of rushed films. (For Hindi, budget by syllables: stay near 5-6 syl/s; `scripts/qa.mjs` checks it.)

## Visual grammar
- Cream paper panel inside a saturated accent field; subtle grain; palette = cream + charcoal ink + ONE accent set once and never drifting.
- Cutouts (people, buildings, objects) with 3-6 px white borders and soft drop shadows in shallow layers; washi-tape strips at panel corners; halftone dots as shadow/accent; one or two asymmetric flat shapes (triangle, circle, square) in the accent.
- Type: bold condensed sans for titles, small-caps labels, a stamp or seal motif for historical topics.
- NOT: photorealism, 3D renders, gradient meshes, glossy lighting, anime, washes without structure. "If a frame could be a magazine spread it is right; if it could be a movie still it is wrong."
- Adapt the SUBJECT to the topic, keep the grammar: Tang China = ink-wash mountains + seal stamps; Wall Street = ticker tape, engraved crosshatch; space = archival photo cutouts, blueprint grid. For India: railway tickets, rangoli-geometry accents, block-print borders, a vermilion or turmeric accent.

## Motion grammar
Slow 2D push-in (3-5% over a shot), layer parallax, one living element (clouds, smoke, water), elements slide in from an edge and settle, gentle texture shimmer. Never: 3D dolly/orbit, flying or detaching elements, face animation, morphing, camera shake, dissolves inside a shot.

## Captions
Vox burns narration: white fill, heavy black outline (3-4 px at 1080p; we use a 7 px stroke), bold sans (Inter ExtraBold / Archivo Black), bottom centre, max 2 lines (~42 chars per line), sentence case, chunk at clause boundaries, optionally highlight one key word in the accent (ours: gold).

## Our implementation and limits
`index_vox__explainer-collage.html` renders the SAME `styles_data.js` content as the other styles: items become paper cards (white sticker border, tape, halftone corner, tone stripe), titles in condensed type with an accent underline, slow push-in, outlined captions. It draws NO illustrated cutouts or archival photos; for real cutouts, supply licensed images (credit them) or draw simple flat shapes per scene.
