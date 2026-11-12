# Reelsmith

All-in-one skill for making 9:16 Instagram/Shorts reels in code (Hindi or English voice-over, Edge TTS), with a style picker.

```
reelsmith/
  SKILL.md           the skill itself (Step 0 style offer, workflow, language, voices, safety)
  README.md          this file
  INSTALL.md         install for Claude Code / Antigravity / others + first checks (selftest)
  references/safe-zones.md   safe areas for reels and why the logo goes top-right
  GUIDE.md           idea-to-reel walkthrough: stages, prompts, files, troubleshooting
  THIRD_PARTY.md     licences for the vendored upstream snapshots
  scripts/           edit (footage), compose (music), init, tts, audio, render, render_all, voices (+voices.json), build_sd, export_cues, mux, engines, styles...
  templates/
    index.html, script.example.json      the built-in clean "ui-cards" style
    styles/                              52 ready renderers (index_lemo__*.html), styles_core.js, NEW_REEL.md, README.md
                                         styles_data.js = the Tatkal example content (build_sd.mjs regenerates it per reel)
  references/        271-style index, situations menu, style cards, engine docs, storyboard + narration grammars
  vendor/            empty by default; upstream docs are fetched on demand: node scripts/vendor.mjs fetch <name> --clone
```

## Install
Clone straight into your agent's skills folder (see INSTALL.md for Antigravity, Codex, Cursor):
```
git clone https://github.com/SoujanyaDasRoy/ReelSmith ~/.claude/skills/reelsmith
node ~/.claude/skills/reelsmith/scripts/selftest.mjs
```
Then ask for a reel.

## Quick start (manual)
1. `node scripts/init.mjs <project>` scaffolds a project (installs deps and fonts).
2. Write `script.json` (scenes, parts, cues, captions, and a `visual` block per scene; see `templates/styles/NEW_REEL.md`).
3. `node tts.mjs && node audio.mjs`, then `node build_sd.mjs`.
4. `INDEX=index_lemo__<style>.html node render.mjs full out/reel.mp4` (render styles one at a time).
5. `node qa.mjs --video out/reel.mp4` (pace, rhythm, captions, loudness, format; exit 1 on any FAIL). Craft rules: `references/editing-playbook.md`.

Agent-neutral: SKILL.md + AGENTS.md (+ ANTIGRAVITY.md) tell any agent to obey the QA scripts instead of its own impression.

Languages: Hindi (default) or English; `node scripts/voices.mjs list` shows all presets, `sample <preset|all>` writes audio to listen to.
