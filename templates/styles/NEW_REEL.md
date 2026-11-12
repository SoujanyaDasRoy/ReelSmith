# Using these styles on a new reel

1. Write script.json as usual (scenes, parts, cues, caps).
2. Add to every scene a `visual` block: `{ "head": ["small line,", "big headline."], "items": [ ... ] }`.
   Items (order = top to bottom on screen; keep <= 7 per scene, text <= ~45 chars):
   - `{"k":"text","at":"cue+0.4","text":"..."}`  or states `"text":[["start","OK","ok"],["crash","DOWN","alert"]]` (tones: normal ok accent alert dim; a 4th value "strike" strikes it through)
   - `{"k":"cmd","at":"cue","text":"> typed line"}`
   - `{"k":"val","at":"cue","label":"USERS","count":{"from":0,"to":1000000,"dur":1,"fmt":"intl"}}`  (fmt: indian | intl | int | pct; also prefix, suffix, alertAbove)
   - `{"k":"meter","at":"cue","label":"CPU","bar":{"from":0,"to":100,"fmt":"pct","alertAbove":90}}`
   - `{"k":"endcard","at":"cue","lines":["FOLLOW","next line","small line"]}` (last item of last scene)
3. `node scripts/build_sd.mjs` writes styles_data.js (it warns about cue labels that do not exist in the scene).
4. Run tts.mjs + audio.mjs (timings/audio), copy a style file + node_modules fonts (see README), then `INDEX=index_lemo__<style>.html node render.mjs full out/<style>.mp4`.
Never render two styles at the same time (shared build/frames).
Limits: the 33 list-style renderers show this card layout in each look; styles that need their own scenography (puppets, characters, 3D) are not generic and stay in the engine queue.
