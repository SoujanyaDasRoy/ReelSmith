# Engine: earshot (Leonxlnx/earshot, MIT) - ears for the agent

Source: vendor/earshot/ (README, docs/LIMITS, SFX, INTEGRATION, VALIDATION, skills/earshot, skills/real-sound licences + process; LICENSE kept; no code vendored). Not installed here.
**Why it matters to Reelsmith:** our biggest honest gap is "the agent cannot hear". earshot is a CPU-only toolkit (two open models, CLAP and an AudioSet tagger) that lets an agent describe a sound in words, score it against a description, rank candidate files, find moments, measure loudness/tempo/key, check whether sound events line up with picture cuts and cue frames, tell real recordings from code-synthesised sounds, and print a listening transcript with timestamps. It also ships a bank of 252 synthesised sound effects and a "kit" renderer.

## Install (only after the user says yes)
Needs uv (or Python 3.10+) and ffmpeg/ffprobe. About 1.1 GB of models are downloaded on first use. Per its README:
`uv tool install "earshot[mcp] @ git+https://github.com/Leonxlnx/earshot"` then `earshot doctor --fetch`. On this Windows machine plain `python` is a Store stub but `py -3` (3.14) exists; check `node scripts/engines.mjs doctor`. Each CLI call loads the models (20-40 s): for several calls use its MCP server.

## Where it plugs in
- After `audio.mjs`: `earshot timeline build/audio.wav --video out/reel.mp4` (events, sections, beat grid, sync to cuts) and `earshot critique`; read the numbers into the QA report.
- Sound effects: `earshot rank "soft whoosh" build/sfx/*.wav` to pick among downloaded candidates; `earshot match FILE "success chime"`.
- Music: `earshot measure build/music_composed.wav` (tempo/key) as a second opinion on compose.mjs; `earshot realness` shows our music is synthesised (expected).
- Never `earshot llm`: it sends audio to Gemini with the user's own key and needs explicit consent.

## Limits (its own docs)
Trustworthy: loudness, timing and sync to picture, "is this the kind of sound I asked for" on single sounds, picking among candidates. Hints only: events inside a busy mix, genre/mood. Cannot judge taste, emotion, licences or speech content. Its launch-film scorecard reflects 7 films, not all good films.
Status here: documented, NOT installed or run. Treat any claim about what it hears as unverified until the user installs it and we run it on a reel.
