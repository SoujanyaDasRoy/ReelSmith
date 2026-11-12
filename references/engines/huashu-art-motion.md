# Engine: huashu-art-motion  (github.com/alchaincyf/huashu-art-motion, MIT + asset exceptions)

Notes from the repo's README, SKILL.md, style index and grammar card (read 2026-11-12). Not vendored. Credit: alchaincyf (花叔).
Its docs are largely Chinese: 镜头表 = shot list/storyboard, 口播 = spoken narration, 风格配方 = style recipe, 审片 = independent review.

## What it is
JS Canvas scenes rendered headless (Playwright) with Python tooling (uv) and ffmpeg. ~36 implemented art styles and 9 explainer
"grammars" (see `../style-catalog.md` and `../narration-grammars.md`). Clips are max ~8 s each, one style and one theme across a film.

## How to use it with this skill
1. `node engines.mjs install huashu-art-motion`; read its `SKILL.md`, `references/09-视频动画语法.md`, `references/风格配方/INDEX.md`.
2. Pick **one** style card and **one** grammar. Write its storyboard (镜头表) against our `build/cues.json` so shot cuts land on cue words.
3. Keep clips <= 8 s: split a long scene into several shots on the same style.
4. Render silent, then `node mux.mjs`. Do not use its voice-cloning or Volcengine voice path (third-party API).

## Rules worth keeping (paraphrased)
- Storyboard first; lint it. One style, one palette, one character approach per film.
- Real material full-frame; code only annotates. Avoid PPT-looking pages, dead backgrounds, abstract visuals with no concrete object.
- Ease transitions; fast moves only as accents; do not repeat zoom-ins. Avoid blue-purple gradients unless asked (looks "AI-made").
- Independent reviewer agent writes findings; film gate flags too much fast motion (>6% yellow, >3.5% red) and blue-purple >30%.
- Three-direction gate when inventing a new character/style direction: show three options, user picks.

## Cautions
- Its agent is told to **write lessons back into its own reference files** and log a CHANGELOG: review diffs, don't let it silently rewrite itself.
- Version check runs `git ls-remote` and writes `.last-update-check` inside the skill folder; `capabilities.py` writes config under `%APPDATA%\huashu`.
- Optional voice cloning (off by default) calls a third-party API with credentials from env; leave it off.
- Not MIT: Huashu character art, Clawd mascot (Anthropic), some fonts/stroke assets (see its README). Do not reuse in public videos.
- No Windows setup guide; Python/uv was not available where this was written, so nothing from it was run.

Vendored docs: `vendor/huashu-art-motion/SKILL.md and references/ (09-视频动画语法.md, 风格配方/INDEX.md + cards)` (documentation snapshot, reference data; see THIRD_PARTY.md).
