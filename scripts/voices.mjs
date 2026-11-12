// Voice picker.
//   node voices.mjs list                         show presets
//   node voices.mjs sample <preset|all> [text]   write build/voicetest/<preset>.mp3 so you can listen
//   node voices.mjs catalog [locale-prefix]      list every voice the Edge service offers (e.g. hi-IN, en-IN)
// Presets live in voices.json next to this script (copied into the project by init.mjs).
import { EdgeTTS } from 'node-edge-tts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const vfile = fs.existsSync('voices.json') ? 'voices.json' : path.join(here, 'voices.json');
const { presets } = JSON.parse(fs.readFileSync(vfile, 'utf8'));
const [cmd = 'list', arg, ...rest] = process.argv.slice(2);

const SAMPLE = {
  devanagari: 'सुबह दस बजे, बारह लाख लोग, और सीट सिर्फ़ एक।',
  roman: 'Subah das baje, baarah lakh log, aur seat sirf ek.',
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function synth(preset, text, out) {
  const e = new EdgeTTS({
    voice: preset.voice, lang: preset.voice.slice(0, 5), outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
    saveSubtitles: true, rate: preset.rate || '+0%', pitch: preset.pitch || 'default',
  });
  for (let k = 0; ; k++) {
    try { await e.ttsPromise(text, out); return; }
    catch (err) { if (k > 5) throw err; await sleep(4000 * (k + 1)); }
  }
}

if (cmd === 'list') {
  for (const [name, p] of Object.entries(presets))
    console.log(name.padEnd(22), p.voice.padEnd(34), p.script.padEnd(11), `${p.rate} ${p.pitch}`.padEnd(14), p.desc);
} else if (cmd === 'sample') {
  fs.mkdirSync('build/voicetest', { recursive: true });
  const names = arg === 'all' || !arg ? Object.keys(presets) : [arg];
  for (const n of names) {
    const p = presets[n];
    if (!p) { console.log('unknown preset', n); continue; }
    const text = rest.join(' ') || SAMPLE[p.script];
    const out = `build/voicetest/${n}.mp3`;
    try { await synth(p, text, out); console.log('wrote', out); }
    catch (err) { console.log('FAIL', n, String(err.message || err).slice(0, 80)); }
    await sleep(1800);
  }
} else if (cmd === 'catalog') {
  const url = 'https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list?trustedclienttoken=6A5AA1D4EAFF4E9FB37E23D68491D6F4';
  const v = await (await fetch(url)).json();
  const f = v.filter(x => !arg || x.Locale.startsWith(arg));
  for (const x of f) console.log(x.ShortName.padEnd(38), x.Gender.padEnd(7), x.Locale);
  console.log(f.length, 'voices');
} else {
  console.log('commands: list | sample <preset|all> [text] | catalog [locale-prefix]');
}
