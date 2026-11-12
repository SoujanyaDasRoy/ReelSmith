# Music composer (`scripts/compose.mjs`)

Node + ffmpeg only, no samples, no downloads. It writes music that fits THIS reel: tempo and phase are searched so scene cuts land on the beat grid, energy follows the story, and accents (risers, impacts, bell chimes, "drops") land on the exact cue times.

## Use
```
node compose.mjs --list                          moods and scales
node compose.mjs --mood curious_tech --variants 3
node audio.mjs                                   mixes build/music_composed.wav under the voice (--music-gain 0.6, --synth = old built-in bed)
node compose.mjs --pick 2 && node audio.mjs      choose another variant after listening to build/music_v*.wav
```
Optional `script.json` block:
`"music": {"mood":"warm_devotional","scale":"bhairavi","root":"D","bpm":80,"seed":3,"energy":[.7,.5,...],"hits":{"crash":"drop","follow":"chime"}}`
Hit types: `impact` (kick + noise), `drop` (bass/drums/pluck mute for one beat, then impact: the silence-before-the-reveal trick), `chime` (bell pair), `riser`.
Scene sound effects are separate: per scene `"sfx": {"cueLabel": "thud|err|ok|pop|ding|crash|womp|tick|none"}`.

## Moods (pick by the story's feeling, not the topic)
| mood | scale | bpm | groove | sounds |
|---|---|---|---|---|
| curious_tech | dorian on D | 96-112 | kick, hat, tabla accents | pad, bass, plucked arp, bell |
| deadpan_comedy | mixolydian on G | 100-116 | sparse clicks | dry staccato plucks, bass |
| warm_devotional | bhairavi on D | 68-84 | slow keherwa tabla | tanpura drone, bansuri-style flute, pad |
| festive | bilawal on C | 112-128 | keherwa + kick/snare | bright plucks, bells |
| tense | todi on E | 88-104 | ticks, hats | drones, bass, impacts |
| calm_lofi | major on F | 72-84 | soft kick, hat | warm pad, flute, bells |
| epic_build | minor on A | 100-120 | driving kick/snare | pad, bass, plucks, risers |
| sad_reflective | minor on D | 60-76 | sparse | pad, flute, bell, tanpura |
Scales available: major minor dorian mixolydian phrygian bhairavi yaman bilawal kafi todi bhairav khamaj (semitone sets; ragas are used as note sets only, not as full raga grammar with ornaments).

## What it checks and what it cannot
- Checks (printed per variant, and `build/music.json`): how far scene cuts sit from the beat grid (ms), loudness before the mix, true peak. `qa.mjs` warns if the mean cut-to-beat error is above 90 ms.
- Because accents are placed at the exact cue time, a cut can be a few tens of ms off the groove but the hits still land on the picture.
- It cannot hear. Instruments are synthesised (Karplus-Strong plucks, detuned-saw pads, FM bells, noisy flute, synthetic tabla/kick), so the result is clean and usable but not a recorded band. A human must pick the variant by ear, and the agent must say it could not judge the sound.
- Ducking under the voice is baked in (about 40% dip while words are spoken); audio.mjs then mixes at `--music-gain` and normalises loudness.
- Not done: no vocals, no stem export, no sidechain compressor, no swing, no key change, no MIDI export. Planned upgrade: optional SoundFont rendering for realistic instruments (needs a download; ask first).
