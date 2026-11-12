# Reelsmith guide: from idea to finished reel

## 0. What you need (once; full install notes in INSTALL.md)
- Node 18+ and ffmpeg/ffprobe on PATH; internet (Edge TTS voices). No Python needed (only the `draw/*` styles and Manim need it).
- Put the skill where your agent reads skills, or just point the agent at the folder:
  - **Claude Code:** copy `reelsmith/` to `~/.claude/skills/reelsmith` (or `<project>/.claude/skills/`).
  - **Antigravity / Codex / Cursor / anything else:** open the workspace that contains `reelsmith/` and tell the agent: "Read reelsmith/AGENTS.md and reelsmith/SKILL.md, then make a reel about ...". (I have not verified Antigravity's own skills-folder convention; the pointer files make the folder usable without it.)
- First run in a project: `node reelsmith/scripts/init.mjs my-reel --install --with-styles` (scaffolds the project, installs playwright + fonts, copies the style renderers).

## 1. The 8 stages (what you do, what the agent does)
| # | Stage | You | The agent |
|---|---|---|---|
| 1 | **Idea** | One sentence: topic, audience, language (Hindi/English), length (default 55-65s), tone | Asks only what is missing |
| 2 | **Pick a style** | Choose from the offer (it recommends one, 2-3 alternatives, "browse all 271"). Also choose render scope: one style (recommended), the shortlist, or more | Matches the topic to the situation menu, checks feasibility (`engines.mjs doctor`), warns if a style needs Python/assets |
| 3 | **Plan** | Approve the plan | Shows problem, a fact-checked solution, 8-10 scenes (one idea + one visual each), hook, cue words. Reads `references/editing-playbook.md` |
| 4 | **Script + voice** | Pick a voice (listen to samples: `node voices.mjs sample all`) | Writes `script.json` (scenes, voice text, cues, captions, a `visual` block per scene), runs `tts.mjs` (word timestamps) and trims over-length |
| 5 | **Music + mix** | Say the mood (curious_tech, deadpan_comedy, warm_devotional, festive, tense, calm_lofi, epic_build, sad_reflective); LISTEN to the 3 variants `build/music_v*.wav` and pick | `compose.mjs`: music that fits your cuts; `audio.mjs`: mix + soft effects + voice ducking + loudness; `export_cues.mjs` |
| 6 | **Look test** | Approve ONE still | Builds `styles_data.js` (`build_sd.mjs`), renders stills at every cue, makes a contact sheet, fixes overflow/clipping |
| 7 | **Render** | Wait | `INDEX=index_lemo__<style>.html node render.mjs full out/reel.mp4` (one style at a time). Reviews frames sampled from the final mp4 |
| 7b | **Logo** | Give the logo file path (transparent PNG best; JPG with white/black background and SVG also work) | `brand.mjs` places it top-right (or top-left if busier) just inside the safe zone (references/safe-zones.md), plate if needed, optional closing logo; shows you a still |
| 8 | **QA gate + review** | Listen once (checklist printed), watch once muted on your phone | `node qa.mjs --video out/reel.mp4`: any FAIL must be fixed and re-rendered; WARNs fixed or justified |

## 1b. Reels from your own footage
Give the agent your clips: "Use reelsmith to edit these clips into a 40-second reel: remove dead air, jump cuts, captions, music on the beat". It runs `edit.mjs probe -> plan -> render --preview`, shows you stills, adjusts `edit/edit.json`, renders full, then `qa.mjs`. Details and limits: `references/footage-editing.md`.

## 2. A prompt that works (copy, change the bold parts)
> Use the reelsmith skill. Make a **60-second Instagram reel** on **why UPI payments rarely fail even at 10 am on Diwali**, for **Indian college students**, in **Hindi voice with Roman-Hinglish captions**, tone **subtle deadpan comedy**, CTA **follow for part 2**. Offer me style options first. Run the QA gate before you call it done.

Variants: "in English with an Indian-accent voice (en_in_prabhat_m)", "use the Vox editorial collage style", "make the same reel in the shortlist styles so I can compare".

## 3. Files in your project
`script.json` (the source of truth) -> `build/timings.json` + `build/parts/*.mp3` (voice) -> `build/audio.wav` (mix) -> `styles_data.js` (what every style draws) -> `index_lemo__<style>.html` (the style) -> `out/<style>.mp4` -> `build/qa_report.json`.
Change the words: edit `script.json`, rerun `tts.mjs` (cached by hash, only changed lines are re-voiced), `audio.mjs`, `build_sd.mjs`, render.

## 4. `script.json` essentials
Per scene: `id`, `parts[{v: voicePreset, t: text}]`, `cues[[label, wordSubstring]]` (time of that spoken word), `caps[[cueLabel, "text with *accent*"]]`, `visual{head:[small,big], items:[...]}` (item kinds in `templates/styles/NEW_REEL.md`), optional `tail`, optional `allow_gap` (seconds, excuses a deliberate pause). Everything on screen appears on a cue word, not after it.

## 5. Quality rules the agent must follow (so every agent gives the same result)
1. Scripts decide quality: `qa.mjs` exit code 1 = not done.
2. The agent cannot hear: it reports numbers (pace, LUFS, peak) and hands YOU the listening checklist; it never claims music "sounds good".
3. Only ask for large downloads / installs / paid APIs when needed; never use a third-party generation API without asking.
4. Never render two styles at once (shared `build/frames`).
5. Facts: system-design reels are labelled "a proposed design", not "how the company does it".

## 6. Troubleshooting
- Text clipped or overlapping: the style autoshrinks; if an item is still too long, shorten it in `visual` (about 45 characters) or split the scene.
- QA says caption reading speed too high: lengthen the scene's cue spacing or shorten the caption (target <= 19 characters/second, >= 1.1 s on screen).
- Voice too fast/slow: change the voice preset or `r` (rate) per part; `qa.mjs` shows syllables/second per scene.
- 429 from Edge TTS: retried automatically; just wait.
- A style is `blocked`/`needs-install`: `node scripts/render_all.mjs plan --all` shows why; pick the nearest ready style (52 are ready).

## 7. Honest limits
Tested end-to-end on one story (the IRCTC Tatkal reel) across 40 styles; a brand-new topic exercises `build_sd.mjs` and the same renderers but has not yet been run through all stages. Music is composed by code from synthesised instruments (clean, not a recorded band); a SoundFont upgrade is planned. Footage editing (`edit.mjs`) is verified on synthetic footage only, with no face tracking or bundled speech-to-text. Pace targets are heuristics, not measured against reel performance.
