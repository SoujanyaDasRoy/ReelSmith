# Style catalog (pick ONE look per reel)

Sources: this skill, anidoodle (32 styles), huashu-art-motion (~36 art styles), ClaudeAnimationBase (painted cartoon), Manim (math).
Descriptions are paraphrased. Ask the user which family they want; if unsure show 3 options (three-direction gate) and let them pick.

## A. Clean UI explainer (engine: ui-cards) - default for tech topics
Light grid, white UI cards, coral serif-italic accent line, deadpan comedy. One idea per scene.

## B. Hand-made marks (engine: anidoodle, 32)
Drawing media: ballpoint, charcoal erasure, coloured pencil, crayon, chalkboard, scratchboard, stipple, single-line engraving, sumi-e brush.
Paint/ink: broken colour (impressionist dabs), painted oil (impasto), mid-century gouache, ink & line-wash, pencil & watercolour, dream glaze, folk-tale storybook, storybook.
Print/craft: risograph, newsprint halftone, woodcut/ukiyo-e, cyanotype blueprint, embroidery, cut-paper collage, paper-craft, vintage scrapbook, toy brick.
Digital/cartoon: flat vector, isometric cutaway, low-poly 3D, pixel art (16-colour), marker comic, rubber-hose 1930s cartoon.

## C. Art-history looks (engine: huashu-art-motion, implemented)
Material: Van Gogh flow-field strokes, Impressionism dabs, Seurat dot mixing, Ghibli watercolour background, Chinese ink wash, Lichtenstein pop Ben-Day,
8-bit pixel, vaporwave neon, Shinkai clouds and light shafts, Rembrandt chiaroscuro, analytic Cubism, Matisse cut-paper, contemporary flat illustration,
Constructivism halftone, Bauhaus, Pompeii mosaic, early raytraced CGI.
Era/artist: cave painting, Egyptian mural, Attic black-figure, Gothic manuscript (gold leaf), Renaissance sfumato, Art Nouveau, Klimt, Munch, Dunhuang mural,
Kusama dots, Dali, Hopper, Marvel-era comics, Monet, Keith Haring, 1930s rubber-hose, shadow puppetry, Picasso Blue Period, Rick & Morty (SVG pipeline).
Recipes only (not finished by that repo): Giotto, Piero, Raphael, Michelangelo, Renoir, Gauguin, Chagall, Ma Yuan, Persian miniature, South Park, Pixar.
Indian-audience ideas to map onto these (our suggestion, not from the repos): Madhubani / Warli line art -> anidoodle ink or single-line styles;
truck-art / Bollywood poster -> huashu pop-art or Lichtenstein; miniature painting -> Persian miniature recipe; chalk-and-board classroom -> chalkboard.

## D. Painted cartoon (engine: claude-animation-base)
Watercolour wash + ink outline characters, boiling lines, acted emotions, brush-wipe and iris transitions, no on-screen text. 16:9 by default.

## E. Math / algorithm (engine: manim)
Dark or light flat background, shapes transform into shapes, MathTex, graphs, one idea revealed progressively (3Blue1Brown).

## F. Film styles (engine: lemo-opuscar; recipe cards in styles/)
Ten recipes ready to use: **paper lantern** (backlit paper-cut box), **white model** (data projected on a white city model), **spy titles** (60s cut-paper title sequence),
**ink wash** (xieyi ink painting), **shadow puppetry** (lamp-lit hide on a cloth screen), **microscope** (dive into a measured specimen), **ASCII / CRT** (phosphor terminal),
**engraving** (copperplate with hand colour), **archive lighttable** (loupe over real archive scans), **art deco** (gold, lacquer, symmetry). See styles/README.md.
The upstream repo has 56 more (watercolor, ukiyoe, papercut-red, risograph, swiss-motion, dark-keynote, living-screencast, blueprint, pixel-rpg...): list in engines/lemo-opuscar.md.

## Choosing quickly
| Topic | Pick |
|---|---|
| System design, apps, APIs, product | A |
| Story, folklore, kids, festival, culture | B (storybook, gouache, woodcut) or D |
| History, art, philosophy, "era" topics | C |
| Math, DSA, ML, finance charts | E (or huashu grammar t1/t3) |
| Brand/launch teaser | A or B flat vector |
| Night journey, Diwali, folk tale, lullaby mood | F paper lantern |
| City/flood/growth with open data | F white model |
| Fraud/heist/mystery teaser | F spy titles |
| Philosophy, myth, calm one-action story | F ink wash (or C #17) |
| Epic folk tale with lamps and rods | F shadow puppetry (Tholu Bommalata feel) |
| Health/biology/measured claim | F microscope (real specimen scan only) |
| Retro tech, logs, security, systems | F ASCII / CRT |
| Natural history, museum plate | F engraving |
| History, records, fact-check | F archive lighttable (real scans only) |
| Luxury, cinema palace, grand reveal | F art deco |
