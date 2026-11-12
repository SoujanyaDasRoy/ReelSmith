// Scaffold a new reel project:  node init.mjs <target-dir> [--install] [--with-vendor] [--with-styles]
// --with-vendor also copies the 4 MB docs-only upstream snapshots (style specs) into <target>/vendor
// Copies scripts + template into <target-dir>, and (optionally) runs npm install for the dependencies.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const target = path.resolve(process.argv[2] || 'reel');
fs.mkdirSync(path.join(target, 'build'), { recursive: true });

for (const f of ['tts.mjs', 'audio.mjs', 'render.mjs', 'voices.mjs', 'voices.json', 'engines.mjs', 'engines.json', 'export_cues.mjs', 'mux.mjs', 'manim_scaffold.mjs', 'styles.mjs', 'render_all.mjs', 'qa.mjs', 'qa_rules.json', 'build_sd.mjs', 'compose.mjs', 'edit.mjs', 'sheet.mjs', 'brand.mjs', 'sfx.mjs']) fs.copyFileSync(path.join(here, f), path.join(target, f));
fs.copyFileSync(path.join(root, 'templates', 'index.html'), path.join(target, 'index.html'));
if (!fs.existsSync(path.join(target, 'script.json')))
  fs.copyFileSync(path.join(root, 'templates', 'script.example.json'), path.join(target, 'script.json'));
if (!fs.existsSync(path.join(target, 'package.json')))
  fs.writeFileSync(path.join(target, 'package.json'), JSON.stringify({
    name: path.basename(target),
    private: true,
    type: 'module',
    scripts: {
      "tts": "node tts.mjs",
      "compose": "node compose.mjs",
      "audio": "node audio.mjs",
      "build-sd": "node build_sd.mjs",
      "stills": "node render.mjs stills 2.0,8.0,16.0,24.0,36.0,48.0",
      "render": "node render.mjs full reel.mp4",
      "qa": "node qa.mjs --video reel.mp4",
      "sheet": "node sheet.mjs"
    }
  }, null, 2));

// style index + situation menu (small) so `node styles.mjs menu|search|show` works inside the project
fs.mkdirSync(path.join(target, 'references'), { recursive: true });
for (const f of ['all-styles.json', 'all-styles.md', 'situations.json', 'style-menu.md'])
  fs.copyFileSync(path.join(root, 'references', f), path.join(target, 'references', f));
if (process.argv.includes('--with-styles')) { const sd = path.join(root, 'templates', 'styles'); for (const f of fs.readdirSync(sd)) if (/^index_.*.html$/.test(f) || f === 'styles_core.js' || f === 'NEW_REEL.md') fs.copyFileSync(path.join(sd, f), path.join(target, f)); }
if (process.argv.includes('--with-vendor')) fs.cpSync(path.join(root, 'vendor'), path.join(target, 'vendor'), { recursive: true });
console.log('scaffolded', target);
if (process.argv.includes('--install')) {
  execSync('npm i playwright node-edge-tts @fontsource/inter @fontsource/instrument-serif @fontsource/jetbrains-mono @fontsource/inter-tight @fontsource/architects-daughter @fontsource/b612 @fontsource/schoolbell @fontsource/alfa-slab-one @fontsource/cormorant-garamond @fontsource/caveat @fontsource/gaegu @fontsource/poppins @fontsource/playfair-display-sc @fontsource/instrument-serif @fontsource/architects-daughter @fontsource/league-gothic @fontsource/rajdhani @fontsource/baloo-2 @fontsource/fredoka @fontsource/caveat @fontsource/old-standard-tt @fontsource/josefin-sans @fontsource/league-gothic @fontsource/patrick-hand @fontsource/rajdhani @fontsource/share-tech-mono @fontsource/playfair-display-sc @fontsource/old-standard-tt @fontsource/bricolage-grotesque @fontsource/jost @fontsource/press-start-2p @fontsource/fredoka @fontsource/vt323 @fontsource/limelight @fontsource/poiret-one @fontsource/josefin-sans @fontsource/league-gothic @fontsource/league-spartan', { cwd: target, stdio: 'inherit' });
}
console.log('next: edit script.json + scene functions in index.html, pick voices: node voices.mjs list / sample all; then: node tts.mjs && node audio.mjs && node render.mjs stills 1,5,9');
