# Engine: ui-cards (built in)

Default engine. Clean light UI cards, one idea per scene, Hinglish captions, Hindi voice. Full details: `../full-guide.md`.

Use when: system design, how-it-works, product/app/tech explainers, interview-style content, "Figma tutorial" look.
Do not use when: the user wants hand-drawn art, painted characters, math animation, or era/art-history looks (pick another engine).

Pipeline: `script.json` -> `tts.mjs` -> `audio.mjs` -> `index.html` (scene functions) -> `render.mjs full` -> mp4. No mux step needed.
Tokens: Inter + Instrument Serif italic + JetBrains Mono; ink #17171F, coral #D9604C, blue #3B6EF5; cards white r30 w900.
