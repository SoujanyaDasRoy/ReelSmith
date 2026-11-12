# Engine: Bang Motion (bangtutorial/bang-motion, MIT)

Source: vendor/bang-motion/ (README, SKILL.md, references, six explainer starters, two scripts; licence kept). Agent skill for browser motion graphics: one `index.html` that plays like video. Works with Claude Code, Codex, Gemini CLI, Cursor. Its SKILL.md and references are written in Indonesian; I read the README, the section headings and the style tables, NOT every reference file, so treat detail below as a map, not a full spec.

## What it offers (from the README)
- **10 style directions:** cinematic dark, poster colour-block, editorial light, paper and print, retro/analog, brutalist mono, pastel playful, luxury dark, flat pop with photos, grainy gradient (each with background, typography, signature motion, good-for).
- **19 opener concepts** (structures): one continuous shot, pure typography, problem-then-gone, before/after, journey inside the UI, product macro, object metaphor, living number, one feature fully demoed, diegetic question-answer, rhythmic collage, logo as stage, object relay, brand system showcase, claim-how-result, living UI ecosystem, flat pop with photos, through the gradient shapes, product tour with claims.
- **6 explainer styles with starters:** continuous action, cartoon collage, visual journalism, white catalog, vintage sketch, cartoon stage (starters in `vendor/bang-motion/assets/`).
- Also: 11 background motions, 6 surfaces, 9 transitions, 6 highlight shapes; an After Effects bridge (not used here).

## Its rules worth adopting (any style)
- "It is video, not slides": mechanical anti-PPT tests (see `references/anti-ppt.md`): no static layouts that merely fade; something is always in motion.
- Deterministic timeline: every frame is a pure function of time (same as our `renderAt(t)` contract).
- Style comes from the theme, not from a starter; text is alive, the background yields to it.
- Workflow: a style brief first with three concept candidates and one recommended pick; a checklist before hand-over. Two openers in a row using the same concept row is a smell.

## How we use it
Index entries: `bang/<direction>` (10), `bang/explainer-*` (6), `grammar/bang-*` (19 structures to combine with any visual style). Everything is `needs-install` (clone, Node + Chromium) or can be re-implemented in our canvas renderer from the style tables. Render its output SILENT and mux our own voice/music (`mux.mjs`); keep our captions and QA gate. Its HTML is 16:9 by default for some starters: set 1080x1920 explicitly.
Not done: no Bang Motion style has been rendered here yet; no upstream script was run.
