# Reelsmith prompt pack

Copy a prompt, replace the **[BRACKETS]**, paste it into your agent (Claude Code, Antigravity, anything). Everything else is fixed on purpose: the agent then follows the skill's own workflow (research, style offer, plan, approval, voice, music, render, QA).
Fill-ins you choose each time: **[TOPIC]**, **[LANGUAGE]**, **[STYLE]**. Languages: `Hindi voice with Roman-Hinglish captions`, `English with Indian-accent voice`, `English with US voice`, or mixed.

## 1. Master prompt (style not decided: the agent offers options)
```
Use the reelsmith skill. Read reelsmith/AGENTS.md and reelsmith/SKILL.md first.
Make a 55-60 second Instagram reel (1080x1920) about: [TOPIC].
Audience: Indian college students and early-career developers. Language: [LANGUAGE]. Logo: [PATH TO LOGO FILE, or "none"] (place it with brand.mjs after the final render, show me a still first). Tone: simple, curious, subtle deadpan comedy, no cringe. CTA: follow for part 2.
Work in this order and STOP at each gate for my reply:
 Gate 1: research the topic from official engineering blogs, talks or papers. Give me a source list (links) and split the facts into "confirmed by a source" and "my inference". If it is not publicly documented, say so and frame the reel as "a proposed design".
 Gate 2: offer me style options (recommend one, give 2-3 alternatives with effort/caveats) and ask me to pick. Ask only one question.
 Gate 3: show the scene plan (hook, naive idea, why it breaks, real mechanism, twist, reframe, CTA), the full script and the on-screen text. Wait for my OK.
Then build it: voice (let me hear samples first), 3 music variants, render, stills contact sheet, full render, and run qa.mjs with the video. Fix every FAIL and re-render. 
Finally report: output path, length, the QA summary, what you could NOT verify (you cannot hear audio), which files I should listen to, and a ready-to-post caption with hashtags.
```

## 2. Master prompt when I already know the style
```
Use the reelsmith skill (read reelsmith/AGENTS.md and SKILL.md first). Make a 55-60 second reel about [TOPIC] in the [STYLE] style (see references/all-styles.md for the id; if it is not renderable here, tell me and offer the nearest ready style, do not silently swap). Language: [LANGUAGE]. Audience, tone, CTA, gates and QA as in the usual reelsmith workflow: research with sources, show me the plan and script and wait for my OK, let me hear voice samples and music variants, render, run qa.mjs, fix FAILs, report what you could not verify.
```

## 3. Research only (pick a topic safely before building)
```
Use the reelsmith skill's rules for facts. I want to explain how [APP OR FEATURE] works in a reel. Find what is publicly documented (engineering blog, conference talk, paper, official docs). Return: (a) 5 bullet "confirmed" facts, each with a link; (b) what is NOT public and would be my inference; (c) the one-line mystery question for the hook; (d) the naive design, why it breaks, and the real mechanism in 4 steps; (e) risks of getting it wrong. Do not start building.
```

## 4. Approve and continue (after gate 3)
```
Plan and script approved. Continue: voice samples first (list the presets you are comparing), then compose 3 music variants for the [MOOD: curious_tech | deadpan_comedy | warm_devotional | festive | tense | calm_lofi | epic_build | sad_reflective] mood, render stills for one look test, then the full render and qa.mjs. Stop after the look test and show me the contact sheet.
```

## 5. Change something after I watched it
```
Changes to the reel at [PATH TO script.json]: [LIST: e.g. "scene 3 caption is too long", "make the hook a question", "voice slower in scene 5", "use music variant 2"]. Edit script.json only, rerun the minimum steps (tts, compose if the music changed, audio, build_sd, render), run qa.mjs on the new video and tell me what changed in the numbers. Do not change anything I did not list.
```

## 6. Same reel in other styles (compare)
```
Keep this reel's script.json, voice and music exactly as they are. Render the same content in these styles one at a time: [STYLE 1], [STYLE 2], [STYLE 3]. After each, run qa.mjs and sample frames from the mp4. Give me the three output paths and a one-line comparison (readability, mood, anything clipped). Never render two styles at once.
```

## 7. Part 2 / series (consistent look and voice)
```
Make part 2 of the reel at [PATH]. Reuse its style, voice preset, music mood and accent colour so the series looks consistent. New topic for part 2: [TOPIC]. Start from the CTA promise made at the end of part 1. Same gates: sources, then plan and script for my approval, then build and QA.
```

## 8. Reel from my own clips
```
Use the reelsmith skill's footage path (references/footage-editing.md). My clips: [FILES]. Goal: a [40-60]s vertical reel about [TOPIC]; language [LANGUAGE]. Run edit.mjs probe, plan (talking or montage), render --preview, show me frames, adjust edit.json, then the full render and qa.mjs with the footage timings. I will give you a transcript if captions are needed. Say clearly that the footage editor is only tested on synthetic clips.
```

## 9. Final check before posting
```
Run the pre-publish checklist from references/editing-playbook.md on [PATH TO MP4]: qa.mjs with the video, a contact sheet from the final mp4, the hook and the last 3 seconds. List every WARN with a keep-or-fix recommendation. Then write the post caption (hook line, 3 short bullets, CTA) and 8 relevant hashtags. Remind me to listen to the audio once and watch once on my phone with sound off.
```

## 10. Real sound effects
```
Use reelsmith's sound-effects workflow (references/sound-effects.md) on the reel at [PATH]. Run sfx.mjs suggest, then search Openverse for a soft scene-transition sound and for [CUES YOU CARE ABOUT]. Show me a short list (title, length, licence, creator, link) and wait for my OK before downloading anything. Use CC0/public-domain only unless I say credits are fine. Then place the files with sfx in script.json, rerun audio and the QA gate, and give me the credit lines if any are required.
```

## Tips
- Pick language and style once, then keep them for the series.
- If the agent skips a gate, reply: "Stop. Go back to Gate N; do not continue until I answer."
- The first run in a new workspace: `node reelsmith/scripts/selftest.mjs` (must say 19/19).
