// Build references/all-styles.json + references/all-styles.md from the vendored docs.
//   node build_style_index.mjs            (run from the skill root; rerun after vendor_sync.mjs)
import fs from 'fs';
import path from 'path';

const V = 'vendor';
if (!fs.existsSync('vendor/lemo-opuscar') || !fs.existsSync('vendor/anidoodle')) { console.error('The index is built from the upstream docs, which are not in the core skill. Run: node scripts/vendor.mjs fetch all   then rerun this, then delete vendor/<name> folders again (keep vendor/README.md and VENDOR.json). Refusing to overwrite references/all-styles.json with a partial index.'); process.exit(3); }
const out = [];
const add = e => out.push(e);

// ---- built in -------------------------------------------------------------
add({ id: 'ui-cards/clean-ui', engine: 'ui-cards', name: 'Clean UI cards', category: 'Explainer', how: 'Light grid, white UI cards, coral serif-italic accent, deadpan Hinglish captions', doc: 'references/engines/ui-cards.md', effort: 'built in (easy)' });
add({ id: 'manim/3b1b', engine: 'manim', name: 'Manim / 3Blue1Brown math', category: 'Explainer', how: 'Shapes transform into shapes, MathTex, graphs, progressive reveal (Python Manim Community)', doc: 'references/engines/manim.md', effort: 'needs Python + Manim' });
add({ id: 'claude-animation-base/painted-cartoon', engine: 'claude-animation-base', name: 'Painted 2D cartoon', category: 'Hand-drawn', how: 'p5.brush washes + ink outlines, 31 acted emotions, no on-screen text, brush-wipe/iris transitions', doc: 'references/engines/claude-animation-base.md', effort: 'hard (needs Chrome, p5)' });

// ---- anidoodle: README table (32 hand-made styles) ---------------------------
{
  const f = path.join(V, 'anidoodle/README.md');
  if (fs.existsSync(f)) {
    const lines = fs.readFileSync(f, 'utf8').split('\n');
    const i = lines.findIndex(l => /^\| Style \| How it's made \|/.test(l));
    for (let k = i + 2; k < lines.length && /^\|/.test(lines[k]); k++) {
      const m = lines[k].match(/^\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|/);
      if (m) add({ id: 'anidoodle/' + m[1].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), engine: 'anidoodle', name: m[1], category: 'Hand-made marks', how: m[2], doc: 'vendor/anidoodle/skills/anidoodle/references/styles.md', effort: 'medium-hard (anidoodle engine)' });
    }
  }
}

// ---- huashu-art-motion: 36 implemented art styles --------------------------
const HUASHU = {
  '01': 'Cave painting', '02': 'Egyptian mural', '03': 'Attic black-figure', '04': 'Pompeii mosaic', '05': 'Gothic manuscript (gold leaf)', '06': 'Renaissance sfumato',
  '08': 'Impressionism dabs', '09': 'Van Gogh flow-field strokes', '10': 'Art Nouveau', '11': 'Analytic Cubism', '12': 'Bauhaus', '13': 'Lichtenstein pop (Ben-Day dots)',
  '14': '8-bit pixel', '15': 'Early raytraced CGI', '16': 'Contemporary flat illustration', '17': 'Chinese ink wash', '18': 'Klimt', '19': 'Munch', '20': 'Dunhuang mural',
  '21': 'Kusama dots', '22': 'Constructivism (halftone, red wedge)', '23': 'Dali', '24': 'Hopper', '25': 'Ghibli-style watercolour background', '26': 'Vaporwave / neon',
  '27': 'Marvel-era comics', '28': 'Monet', '29': 'Seurat dot colour mixing', '30': 'Matisse cut-paper', '31': 'Keith Haring', '32': 'Rembrandt chiaroscuro',
  '33': '1930s rubber-hose', '34': 'Shadow puppetry', '35': 'Shinkai clouds and light shafts', '36': 'Picasso Blue Period', '37': 'Rick & Morty (SVG pipeline)',
};
{
  const dir = path.join(V, 'huashu-art-motion/references/风格配方');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  for (const [n, name] of Object.entries(HUASHU)) {
    const card = files.find(x => x.startsWith(n + '_'));
    add({ id: 'huashu/' + n, engine: 'huashu-art-motion', name, category: Number(n) <= 7 || [10, 18, 19, 20, 21, 23, 24, 27, 28, 31, 33, 34, 36, 37].includes(Number(n)) ? 'Art history (era/artist)' : 'Art history (material)', how: 'Canvas scene + style card from huashu-art-motion', doc: card ? `vendor/huashu-art-motion/references/风格配方/${card}` : 'vendor/huashu-art-motion/references/风格配方/INDEX.md', effort: 'hard (Python/uv + Chromium)' });
  }
}
const GRAMMARS = [['y1', 'Kurzgesagt grammar', 'One concrete object in a glowing world; scale zoom'], ['y2', 'Vox grammar', 'Real-material collage, red lines, highlighter'], ['y3', 'Whiteboard grammar', 'Draws as the narrator speaks'], ['y4', 'Storytime grammar', 'Character reactions with punchline pauses'], ['y5', 'Kinetic type grammar', 'Keywords slam in, one focus word'], ['t1', '3Blue1Brown grammar', 'Math morphing on black'], ['t2', 'Keynote UI grammar', 'One point per screen, big numbers'], ['t3', 'Finance chart grammar', 'Axes first, data grows, one highlight']];
for (const [id, name, how] of GRAMMARS) add({ id: 'grammar/' + id, engine: 'huashu-art-motion', name, category: 'Narration grammar', how, doc: 'references/narration-grammars.md', effort: 'pattern (any engine)' });

// ---- lemo-opuscar: 66 film styles ------------------------------------------
const LEMO_CAT = {
  'Edit & documentary': 'caption-news newsreel countdown city-symphony visual-investigation kino-montage telestrator news-package',
  'Evidence films': 'satellite-briefing briefing-board lidar-survey white-model data-physical teardown microscope archive-lighttable',
  'Hand-drawn': 'crayon-book watercolor ink-wash impasto one-line whiteboard urban-sketch chalkboard',
  'East Asian': 'shadow-puppet ukiyoe papercut-red paper-lantern',
  'Print': 'risograph halftone-dossier woodcut engraving silkscreen-poster printed-long-take',
  'Graphic': 'swiss-motion spy-titles art-deco blueprint stained-glass pictogram-motion ascii-crt',
  'Information': 'dataviz iso-infographic dark-keynote living-screencast hologram-hud transit-map isometric-picture-book circuit-board',
  'Cartoon': 'rubber-hose cel-anime-80s scifi-toon midcentury-toon',
  'Games': 'pixel-rpg hd-2d microgame game-show',
  'Cinema': 'silent-film backrooms',
  'Materials': 'brick-toy paper-popup tilt-shift lowpoly-island glass-product memphis-diorama desktop-flythrough',
};
const catOf = {};
for (const [c, s] of Object.entries(LEMO_CAT)) for (const x of s.split(' ')) catOf[x] = c;
{
  const dir = path.join(V, 'lemo-opuscar/styles');
  if (fs.existsSync(dir)) for (const slug of fs.readdirSync(dir).sort()) {
    const f = path.join(dir, slug, 'STYLE.md');
    if (slug.startsWith('_') || !fs.existsSync(f)) continue;
    const txt = fs.readFileSync(f, 'utf8').split('\n');
    const title = (txt.find(l => l.startsWith('# ')) || '# ' + slug).slice(2).replace(/:?\s*Style Prompt\s*$/i, '').replace(/[\s\u2014:-]+$/, '').trim();
    const tag = (txt.find(l => l.startsWith('> ')) || '').slice(2).replace(/\*\*/g, '').trim();
    add({ id: 'lemo/' + slug, engine: 'lemo-opuscar', name: title, category: catOf[slug] || 'Film style', how: tag.slice(0, 240), doc: `vendor/lemo-opuscar/styles/${slug}/STYLE.md`, card: fs.existsSync(`references/styles/${slug}.md`) ? `references/styles/${slug}.md` : (slug === 'shadow-puppet' ? 'references/styles/shadow-puppet.md' : undefined), effort: 'medium-hard (lemo-opuscar engine or own canvas)' });
  }
}

// ---- bang-motion (MIT): 10 style directions, 6 explainer styles, 19 opener concepts ------------------------------
{
  const f = 'vendor/bang-motion/README.md';
  if (fs.existsSync(f)) {
    const L = fs.readFileSync(f, 'utf8').split('\n'), sl = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const rows = (startRe) => { const i = L.findIndex(l => startRe.test(l)); if (i < 0) return []; const r = []; for (let k = i + 1; k < L.length && !/<\/details>/.test(L[k]); k++) if (/^\|/.test(L[k]) && !/^\|\s*(-|Direction|Style|#)/.test(L[k])) r.push(L[k].split('|').slice(1, -1).map(x => x.trim())); return r; };
    for (const c of rows(/10 style directions/)) add({ id: 'bang/' + sl(c[0]), engine: 'bang-motion', name: c[0], category: 'Motion design', how: (c[1] + '; type: ' + c[2] + '; motion: ' + c[3] + '. Good for ' + c[4]).slice(0, 240), doc: 'vendor/bang-motion/README.md', effort: 'medium (own canvas renderer or the bang-motion engine)' });
    for (const c of rows(/6 explainer styles/)) add({ id: 'bang/explainer-' + sl(c[0]), engine: 'bang-motion', name: 'Bang explainer: ' + c[0], category: 'Explainer', how: (c[1] + '. Best for ' + c[2]).slice(0, 240), doc: 'vendor/bang-motion/references/explainer.md', effort: 'medium (own canvas renderer or the bang-motion engine)' });
    for (const c of rows(/19 opener concepts/)) add({ id: 'grammar/bang-' + sl(c[1]), engine: 'bang-motion', name: 'Bang concept: ' + c[1], category: 'Opener structure', how: 'A structure for the whole film (not a look); good for ' + c[2], doc: 'vendor/bang-motion/references/opener-konsep.md' });
  }
}
// ---- vox-explainer (MIT): one look + one narration arc; its Atlas Cloud image/video API pipeline is NOT used ----------
add({ id: 'vox/explainer-collage', engine: 'vox-explainer', name: 'Vox editorial collage', category: 'Explainer', how: 'Cream paper panel on one saturated accent field, paper cutouts with white sticker borders, halftone dots, washi tape, flat geometric accents, bold condensed type, bold outlined captions', doc: 'vendor/vox-explainer-skill/references/vox-style-guide.md', card: 'references/styles/vox-explainer.md', effort: 'easy-medium (own canvas renderer; real cutout images optional)' });
add({ id: 'grammar/vox-arc', engine: 'vox-explainer', name: 'Vox narrative arc', category: 'Narration', how: 'Cold open, turn to context, escalating explanation, complication, reframe; 150 wpm beat budgets', doc: 'vendor/vox-explainer-skill/references/vox-style-guide.md', card: 'references/styles/vox-explainer.md' });
// ---- claude-drawing (MIT): 83 procedural painting styles (Python numpy + Pillow) ----------------------------------------
{
  const f = 'vendor/claude-drawing-skill/docs/STYLES.md';
  if (fs.existsSync(f)) for (const l of fs.readFileSync(f, 'utf8').split('\n')) {
    const m = l.match(/^\|\s*\*\*(.+?)\*\*\s*\|\s*`lib\/([a-z0-9_]+)\.py`[^|]*\|\s*(.+?)\s*\|?\s*$/);
    if (m) add({ id: 'draw/' + m[2], engine: 'claude-drawing', name: m[1].replace(/\s*[(（][^)）]*[)）]\s*$/, ''), category: 'Procedural painting', how: m[3].replace(/[*`]/g, '').replace(/\|/g, '/').slice(0, 240), doc: 'vendor/claude-drawing-skill/docs/STYLES.md', effort: 'hard (needs Python + numpy + Pillow; draw-on GIF frames then mux)' });
  }
}
// ---- reelsmith originals (own renderers in templates/styles) ----
for (const [slug, name, how] of [
  ['kinetic-type', 'Kinetic Type', 'Dark stage, huge heavy type blurring in, gradient headline, spotlight drift'],
  ['system-diagram', 'System Diagram', 'Blueprint-grid node boxes with type tags and dashed connectors carrying dots (system design)'],
  ['clay-toy', 'Clay Toy', 'Claymorphism: pastel puffy cards, soft shadows, clay balls, bouncy pop-in'],
  ['receipt', 'Receipt', 'Thermal till receipt, mono type, dotted leaders, red boxed flags, barcode'],
  ['sticker-collage', 'Sticker Collage', 'Kraft paper, die-cut vinyl stickers with white borders and gloss'],
  ['lab-notebook', 'Lab Notebook', 'Graph-paper notebook, pencil handwriting, tick/cross checkboxes, marker highlights']])
  add({ id: 'own/' + slug, engine: 'reelsmith', name, category: 'Reelsmith original', how, doc: 'templates/styles/README.md', effort: 'built in (ready renderer)' });
fs.writeFileSync('references/all-styles.json', JSON.stringify(out, null, 1));
const byEngine = {};
for (const e of out) (byEngine[e.engine] ||= []).push(e);
let md = `# All styles (${out.length}) - generated by scripts/build_style_index.mjs\n\nSearch: \`node scripts/styles.mjs search <keyword>\`; show one: \`node scripts/styles.mjs show <id>\`.\nSituation-based shortlist: \`references/style-menu.md\`.\n`;
for (const [eng, list] of Object.entries(byEngine)) {
  md += `\n## ${eng} (${list.length})\n\n| id | style | category | how it looks / is made |\n|---|---|---|---|\n`;
  for (const e of list) md += `| ${e.id} | ${e.name} | ${e.category} | ${String(e.how).replace(/\|/g, '/').slice(0, 160)} |\n`;
}
fs.writeFileSync('references/all-styles.md', md);
console.log('styles', out.length, Object.fromEntries(Object.entries(byEngine).map(([k, v]) => [k, v.length])));
