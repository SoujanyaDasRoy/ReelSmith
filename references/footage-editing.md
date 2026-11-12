# Footage editing (`scripts/edit.mjs`)

For reels made from REAL clips (talking head, screen recording, b-roll, event footage). Node + ffmpeg only. The motion-graphic styles are separate; this is the "edit video" path.

## Commands
```
node edit.mjs probe a.mp4 b.mp4                       size, fps, length, audio, loudness; warns about landscape clips
node edit.mjs plan talking a.mp4 --target 50          silence-based cut list (dead air removed, alternate 1.0x/1.1x punch-in jump cuts)
node edit.mjs plan talking a.mp4 --transcript a.json --cut-fillers     also removes um/uh/er/hmm (needs a word transcript)
node edit.mjs plan montage a.mp4 b.mp4 --beats 2 --seconds 20          cuts on the beat of build/music.json (run compose.mjs first)
node edit.mjs render edit/edit.json out/reel.mp4 [--preview]            --preview = half size, fast, for checking cuts
node qa.mjs --timings build/edit/timings.json --audio build/edit/out_audio.wav --video out/reel.mp4
```
`plan` writes `edit/edit.json`; the agent (or you) then edits it: reorder, trim in/out, `focus`, `zoom`, `speed`, `grade`, `transition`, `jcut/lcut`, `caption`. Re-render is cheap (a 25 s reel takes ~10-40 s).

## edit.json
Top: `size [1080,1920]`, `fps 30`, `reframe "fill" | "fit-blur"` (fill = crop to 9:16 around `focus`; fit-blur = clip fitted to width over a blurred copy of itself, best for 16:9 clips with the subject too wide to crop), `grade none|clean|warm|punchy|cool|bw`, `keepAudio`, `music {file, gain, duck}`, `transcript`, `captions {style vox|box, font, size}`.
Segment: `src, in, out` (seconds in the source), `focus 0..1` (horizontal crop position: 0 left, 0.5 centre, 1 right), `zoom` (1.0-1.2 punch-in), `speed` (0.5-2, audio is pitch-preserved), `grade`, `stabilize` (two-pass vidstab), `transition cut|fade|wipeleft|slideleft|circleopen|...` (any ffmpeg xfade name) + `tdur`, `jcut` / `lcut` seconds, `caption` (text with `*accent*`).
J-cut: this segment's AUDIO starts `jcut` seconds before its picture. L-cut: its audio continues `lcut` seconds after its picture ends.

## Cut rules this tool applies for you (see references/editing-playbook.md for why)
- Dead air and long silences are removed (default: silence below -32 dB for 0.35 s; 80 ms of padding kept so breaths and word edges are not clipped).
- Jump cuts alternate 1.0x/1.1x so a cut reads as a deliberate punch-in, not a glitch.
- Montage cuts fall on the beat; with music the picture rhythm and the sound rhythm are the same grid.
- Dialogue audio is faded 30 ms at every cut (no clicks); music is ducked under dialogue with a sidechain compressor; final loudness -14 LUFS / -1.5 dBTP.

## Captions
Burned in with libass: bold white, thick black outline, bottom centre inside the safe band (about y 1290-1430), `*word*` in gold. Source: a transcript (word-timed JSON or SRT) mapped to output time, or per-segment `caption` text. The default font is Arial Black (Windows/macOS); set `captions.font` to any installed bold font. Devanagari captions need a font with those glyphs (e.g. Nirmala UI): our reels use Roman Hinglish captions.
Transcript JSON: `{"words":[{"w":"hello","t0":1.2,"t1":1.5}]}` in SOURCE time. No speech-to-text is bundled and none is downloaded; bring one from any tool, or run Whisper yourself (ask the user first: it is a model download).

## QA
`edit.mjs render` writes `build/edit/timings.json` (segments as scenes, transcript words mapped to output time) so `qa.mjs` can judge it: cut rhythm, longest stretch with nothing new, caption speed/hold, loudness, true peak, dead air, video format. Without a transcript the pace and gap checks are skipped with a warning.

## Honest limits
- Tested on synthetic footage only (a test pattern with real spoken Hindi lines and silences): cuts, silence detection, captions, fit-blur, transitions, J-cut, speed, stabilise, ducked music and the beat montage all rendered and measured; it has NOT been tried on real camera footage with noise, music in the background or several speakers.
- No face or subject tracking: `focus` is set by you or the agent from stills. No scene detection, no auto b-roll choice, no colour matching between clips, no audio denoise.
- Silence detection needs clean audio; noisy rooms need a higher threshold (`--noise -25dB`) and a human check.
- Preview a cut list with `--preview` and look at frames from the output before the full render. The agent cannot hear: loudness is measured, dialogue clarity is not.
