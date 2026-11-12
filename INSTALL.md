# Installing Reelsmith (any agent)

Get it: `git clone https://github.com/SoujanyaDasRoy/ReelSmith reelsmith`. Update later with `git pull`.

Requirements: Node 18+, ffmpeg + ffprobe on PATH (ffmpeg with libass for burned captions), internet for Edge TTS voices, a Chrome / Edge / Chromium for rendering the motion-graphic styles (system Chrome or Edge is auto-detected; otherwise ask the user before `npx playwright install chromium`, ~150 MB).

## Where the folder goes
The folder is a plain `SKILL.md` skill (frontmatter + markdown) with scripts, so it works anywhere that reads that format, and anywhere else if you simply point the agent at it.
| Agent | Put `reelsmith/` here |
|---|---|
| Claude Code | `~/.claude/skills/reelsmith` (all projects) or `<project>/.claude/skills/reelsmith` |
| Antigravity | workspace: `<workspace>/.agents/skills/reelsmith` (official docs spelling; older guides say `.agent/skills`, check which your version reads). Global: `~/.gemini/config/skills/reelsmith` (documented), legacy `~/.gemini/antigravity/skills/` still appears to work. Sources: [Antigravity skills docs](https://antigravity.google/docs/skills), [Google codelab](https://codelabs.developers.google.com/getting-started-with-antigravity-skills). These paths came from search results that disagree with each other and were NOT tested on an Antigravity install. |
| Codex, Cursor, others | anywhere in the workspace, then tell the agent: "Read reelsmith/AGENTS.md and reelsmith/SKILL.md, then make a reel about ..." |

## First checks (any agent, 10 seconds, offline)
```
node reelsmith/scripts/selftest.mjs
```
19 checks (voice timings, data build, music, mix loudness, QA gate, footage editor, logo placement, sound-effect guard and placement) must pass; exit code 0. If it fails, the install or ffmpeg is the problem, not your reel. `node reelsmith/scripts/engines.mjs doctor` lists what else (Python, uv, Chrome) the optional engines need.

## Start a project
```
node reelsmith/scripts/init.mjs my-reel --with-styles --install
cd my-reel
node tts.mjs && node compose.mjs && node audio.mjs && node build_sd.mjs
INDEX=index_vox__explainer-collage.html node render.mjs stills 2,10,20 && node sheet.mjs
INDEX=index_vox__explainer-collage.html node render.mjs full out/reel.mp4
node qa.mjs --video out/reel.mp4
```
`script.json` in the new project is a complete English example (voice, cues, captions, `visual` blocks, music): replace its scenes with yours. More: GUIDE.md.

## Same result in every agent
The agent only orchestrates; quality is decided by scripts (`qa.mjs` exit code, `selftest.mjs`). Two agents given the same script.json produce the same timings, music, mix and QA numbers; the parts that differ are the agent's writing (script, plan) and its judgement calls, which is why the plan/script are shown to the user first.
