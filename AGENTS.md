# Reelsmith: instructions for any coding agent (Claude Code, Antigravity, Codex, Cursor, ...)

Read `SKILL.md` first; it is the full workflow. This file only fixes the parts that must behave the same in every agent.

0. After installing or changing anything, run `node scripts/selftest.mjs` (offline, exit 0 = healthy). Install paths: INSTALL.md.
1. Quality is decided by scripts, not by your impression. After rendering, run:
   `node scripts/qa.mjs --video out/<reel>.mp4` (add `--profile hype|calm` if the brief says so).
   Exit code 1 = at least one FAIL: fix the script/timing/captions and re-render. Fix WARNs when cheap; otherwise say why you kept them.
1b. If the user supplies a logo, apply it with `node scripts/brand.mjs <video> --logo <file>` after the final render and run `qa.mjs` on the branded file. Default placement is top-right below y 284 (safe zones: references/safe-zones.md). Show the user a still; never choose or alter their logo.
1c. Real sound effects come from `scripts/sfx.mjs` (Openverse). Ask the user before any download (`get` needs `--yes`), keep CC0/public-domain by default, never NC/ND, and pass on required credits (`sfx.mjs credits`). earshot (optional ears) is a 1.1 GB install: ask first; never use its `llm` command.
2. Judging craft: read `references/editing-playbook.md` before planning scenes and before the review round.
3. You cannot hear audio. Never claim music or voice "sounds good". Report the numbers (LUFS, peak, pace) and hand the user the listening checklist that qa.mjs prints.
4. Only Node + ffmpeg are required (no Python). Render one style at a time (they share `build/frames`).
5. Ask before downloading anything large, installing system packages, or sending data to any service other than Edge TTS.
6. Paths in SKILL.md such as `scripts/...` are relative to this folder; run commands from the project folder that holds `script.json`.
