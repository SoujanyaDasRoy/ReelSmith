# Real sound effects (Openverse + your own library)

Synthesised effects (the built-in whoosh/pop/ding) are fine for rhythm but sound generic. Real recordings sound better. Reelsmith finds openly licensed ones with `scripts/sfx.mjs` (Openverse API, no key) and places them at cue times in `audio.mjs`.

## Workflow
1. `node sfx.mjs suggest` lists every cue and scene start with a suggested search phrase.
2. `node sfx.mjs search "soft whoosh"` shows candidates (length, licence, creator, provider, landing page). Default licences: CC0 and public domain (no credit needed). Add `--license cc0,pdm,by` only if the user accepts credits.
3. Ask the user: "Download <title> (<licence>, ~<n>s) from <provider>?" Only then `node sfx.mjs get <id> --name whoosh --yes` (converts to build/sfx/whoosh.wav, trims leading silence, normalises, records licence + source in `build/sfx/index.json` and `CREDITS.md`).
4. Open the landing page once for any sound used in a company reel (Openverse warns its licence data may be incomplete).
5. Reference it in `script.json`: top level `"sfx_scene_start": "file:build/sfx/whoosh.wav@0.4"` (plays at every scene start instead of the synth whoosh) and per scene `"sfx": {"cueLabel": "file:build/sfx/ding.wav@0.9"}`. `@gain` is optional (default 0.6). Then `node audio.mjs`.
6. `node sfx.mjs credits` prints the lines to paste into the post for any CC BY sound. QA adds this to the listening checklist.
Your own library: `node sfx.mjs local "<folder>" "whoosh"` finds files by name; reference them the same way (you are responsible for their licences).

## Rules
- Never download without the user's OK. Never use NC (non-commercial) or ND (no-derivatives) sounds: `sfx.mjs get` refuses them.
- Prefer short sounds (<= 3 s). Level every sound against the voice: SFX are punctuation, voice stays on top (audio.mjs ducks the bed; sample gain is yours).
- You cannot hear: choose by title/length/licence, then ask the user to listen. If earshot is installed (references/engines/earshot.md), `earshot match <file> "<description>"` can score how well a downloaded sound fits its description; that is a hint, not a taste judgement.

## Sources named by the user
Openverse (built in), Real SFX by Clipwing (link only, see references/engines/real-sfx.md), earshot (optional ears + a bank of synthesised sounds, references/engines/earshot.md).
