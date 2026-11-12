# Reelsmith

**Make a finished 9:16 Instagram Reel from a topic, in code, with one prompt to your AI coding agent.**

You say what the reel is about. Your agent writes the script, records the voice-over, composes music, animates it in a visual style you pick, mixes the sound, burns in captions, adds your logo, and checks the result before handing you an MP4.

Works with **Claude Code**, **Antigravity**, **Codex**, **Cursor**, and any agent that can read files and run commands.

> Example prompt: *"Use reelsmith. Make a 45-second English reel explaining how UPI avoids double payments. Style: blueprint diagram. Add my logo."*

---

## What you get

| Feature | What it does |
|---|---|
| **Voice-over** | Hindi (Hinglish captions) or English (US, UK, Australian, Indian accents). 14+ English presets plus Hindi presets, via free Edge TTS. A picker lets you hear and choose. |
| **271 visual styles** | Clean UI cards, hand-drawn looks, art-history looks, cinematic film looks (paper lantern, ink wash, shadow puppets, spy titles, ASCII/CRT, art deco, engraving...), explainer collages, math animation. 52 are ready to render today. The rest are recipes the agent builds. |
| **Style recommender** | Before anything is built, the agent suggests a style that fits your topic and tone (ready-to-render styles first, labelled), offers one alternative, and can show a one-frame preview of your own script in each option side by side. |
| **Music composer** | Writes original music in 8 moods (curious tech, deadpan comedy, warm devotional, festive, tense, calm lo-fi, epic build, sad reflective). Beats line up with scene cuts. No stock-music licensing. |
| **Real sound effects** | Searches open-licence sounds (CC0 / public domain by default) and places them at cue points. It asks before any download and keeps a credits file. |
| **Audio mix** | Voice ducks the music. Loudness is set to about -14 LUFS with a safe true-peak. |
| **Captions** | Word-timed captions with highlighted keywords, sized for phone screens. |
| **Footage editing** | Cuts your own clips: removes silences, adds transitions and captions, ducks music. |
| **Logo branding** | You give a logo each time. It is placed top-right inside the Reels safe zone, with an optional closing card. |
| **QA gate** | Checks speaking pace, gaps, caption readability, loudness, dead air, music alignment and video format. It fails loudly instead of shipping a bad reel. |
| **Self-test** | One offline command proves your install works. |

## How a reel gets made

```
idea -> pick style -> script.json -> voice -> music -> mix -> render -> logo -> QA -> reel.mp4
```

1. You give a topic, a language, and (optionally) a style.
2. The agent shows you a plan and script first. You approve or edit.
3. Scripts do the repeatable work (voice, music, mix, render, QA), so results are the same in every agent.
4. The QA gate must pass before the reel is called done.

---

## Install

### Requirements
- **Node.js 18+**
- **ffmpeg and ffprobe** on your PATH (with libass if you want burned-in captions)
- **Chrome or Edge** (auto-detected; if missing, the agent asks before downloading Chromium, about 150 MB)
- Internet (for the Edge TTS voices)

### Claude Code

**macOS / Linux / Git Bash**
```bash
git clone https://github.com/SoujanyaDasRoy/ReelSmith ~/.claude/skills/reelsmith
```

**Windows PowerShell**
```powershell
git clone https://github.com/SoujanyaDasRoy/ReelSmith "$env:USERPROFILE\.claude\skills\reelsmith"
```

For one project only, clone into `<project>/.claude/skills/reelsmith` instead. Then start Claude Code and ask for a reel.

### Antigravity

**Global (all workspaces)**
```bash
git clone https://github.com/SoujanyaDasRoy/ReelSmith ~/.gemini/config/skills/reelsmith
```

**One workspace**
```bash
git clone https://github.com/SoujanyaDasRoy/ReelSmith <workspace>/.agents/skills/reelsmith
```

Windows PowerShell global path: `"$env:USERPROFILE\.gemini\config\skills\reelsmith"`.

> Antigravity's skill folder name has changed between versions (`.agents/skills`, `.agent/skills`, `~/.gemini/antigravity/skills`). These paths come from its docs but have **not been tested** by this project. If the skill is not picked up, use the "any other agent" method below.

### Codex, Cursor, or any other agent
Clone anywhere in your workspace:
```bash
git clone https://github.com/SoujanyaDasRoy/ReelSmith reelsmith
```
Then tell the agent:
> Read reelsmith/AGENTS.md and reelsmith/SKILL.md, then make a reel about ...

### Check the install (10 seconds, offline)
```bash
node reelsmith/scripts/selftest.mjs
```
All 19 checks should pass (exit code 0). If one fails, the problem is the install or ffmpeg, not your reel. Use your real folder path if you cloned somewhere else.

### Update
```bash
git -C <path-to>/reelsmith pull
```

---

## Using it

### Easiest: ask your agent
Copy a ready-made prompt from [PROMPTS.md](PROMPTS.md) and change the topic, language and style. For example:

> Use the reelsmith skill. Topic: how a train ticket booking system survives the Tatkal rush. Language: Hindi voice, Hinglish captions. Show me 4 style options first. About 45 seconds. Apply my logo (attached).

### Manual route
```bash
node reelsmith/scripts/init.mjs my-reel --with-styles --install
cd my-reel
# edit script.json (a complete English example is already there)
node tts.mjs && node compose.mjs && node audio.mjs && node build_sd.mjs
INDEX=index_own__system-diagram.html node render.mjs full out/reel.mp4
node qa.mjs --video out/reel.mp4
```
Add your logo:
```bash
node brand.mjs out/reel.mp4 --logo logo.png --closing 1.5 --out out/reel_branded.mp4
```
Preview a few frames of a style: `INDEX=<style file> node render.mjs stills 2,10,20 && node sheet.mjs`.

### Handy commands (run from the skill folder)
| Command | Purpose |
|---|---|
| `node scripts/styles.mjs menu` | Styles grouped by situation |
| `node scripts/styles.mjs recommend "your topic"` | Best ready style plus one alternative |
| `node scripts/styles.mjs preview own/system-diagram lemo/spy-titles` | Side-by-side still of your script in each style (run inside a project) |
| `node scripts/styles.mjs search blueprint` | Find a style by keyword |
| `node scripts/voices.mjs list` | List voice presets |
| `node scripts/voices.mjs sample all` | Write audio samples to listen to |
| `node scripts/sfx.mjs search "whoosh"` | Find open-licence sound effects |
| `node scripts/edit.mjs plan talking clip.mp4` | Plan an edit of your own footage |
| `node scripts/engines.mjs doctor` | Check what optional engines still need |
| `node scripts/vendor.mjs list` | See which upstream docs can be fetched |

---

## Logo placement
The logo goes **top-right, just below y=284 px on the 1080x1920 frame, at least 65 px from the edge**. Top-left is the fallback. The bottom is only used if you ask. Reasons and caveats are in [references/safe-zones.md](references/safe-zones.md). The zone numbers come from third-party guides, not from Meta, so check them before paid ads.

## Honest limits
- Music, voice and mix are checked by numbers, not by ears. Listen to each reel once.
- The footage editor was tested on synthetic clips only.
- QA thresholds are sensible defaults, not proven predictors of reach.
- Antigravity install paths are untested.
- Some styles are recipes, not finished renderers; the agent will say which.

## Folder map
```
SKILL.md            the skill the agent reads (workflow, rules)
AGENTS.md           same instructions for non-Claude agents
ANTIGRAVITY.md      Antigravity notes
INSTALL.md          install and first checks
GUIDE.md            idea-to-reel walkthrough and troubleshooting
PROMPTS.md          ready-made prompts
THIRD_PARTY.md      credits and licences
scripts/            voice, music, mix, render, QA, edit, brand, sfx tools
templates/          ready-to-render styles and an example script
references/         style catalogue, music, editing and safe-zone guides
examples/           offline test data used by the self-test
vendor/             empty; upstream docs are fetched on demand
```
The core is about 2 MB. Heavy upstream docs and engines are not bundled. Fetch one with `node scripts/vendor.mjs fetch <name> --clone` when a style needs it.

## Credits and licence
MIT, see [LICENSE](LICENSE). Style ideas draw on public open-source skills (see [THIRD_PARTY.md](THIRD_PARTY.md)); the original styles were drawn natively without copying their code.
