# Editing playbook (short-form vertical video)

Written from established editing craft (Walter Murch's priorities, continuity editing, standard short-form practice), paraphrased. The numbers are working heuristics, NOT measured against real reel performance; `scripts/qa_rules.json` holds the same numbers and `scripts/qa.mjs` enforces them. Where a rule and a good reason disagree, keep the reason and say so in the script.

## 1. What a cut is for
A cut should be motivated: new information, a change of idea, a reaction, or a rhythm beat. Murch's order of priority for choosing a cut point: emotion > story > rhythm > eye-trace (where the viewer is looking) > planarity > 3D space. For motion-graphic reels the "cut" is the scene change and every on-screen entrance, so the same order applies: change screens when the idea changes, not when the clock says so.
- Cut on the cue word, not after it: the visual lands as the word is spoken (our cues do this).
- Cut on action / movement: end a scene while something is moving so the eye carries across (a bar finishing filling, a pointer arriving).
- Hold the last beat: let the final state of a scene be readable for >= 0.4s before leaving.

## 2. Cut vocabulary (names to use in the shot plan)
| Cut | What it does | Use for |
|---|---|---|
| Hard cut | instant change | new idea, energy |
| Match cut | two shots share shape/position/motion | "this is the same thing as that" transitions |
| Jump cut | same subject, skipped time | talking-head tightening, comedic compression |
| J-cut | next scene's audio starts before its picture | smooth, "pulling" the viewer forward |
| L-cut | previous audio continues over the next picture | reaction shots, keeping a voice going |
| Smash cut | silence/quiet to loud (or reverse) | punchline, shock |
| Cutaway | brief insert, then back | evidence, example, joke visual |
| Dissolve / fade | time passes, soft mood | calm styles only; costs rhythm in fast ones |
Continuity (live footage): keep the 180-degree line; shift angle >= 30 degrees or size one step between cuts on the same subject; match eyelines; keep screen direction consistent.

## 3. Rhythm and pace
- Hook (0-2.5s): the first frame is already the topic or a question; voice starts <= 0.8s; first caption <= 1.2s. Hook must work with sound off.
- Something new on screen at least every 3-5s (pattern interrupt: new caption, number, cut, zoom, colour flip, sound hit). `qa.mjs` measures the longest stretch with nothing new.
- Shot length follows content: setup shots longer, reveals shorter; vary lengths (a run of identical lengths feels mechanical). Typical scene 3-8s for explainers, 1.5-4s for hype, 4-10s for calm.
- Build and release: tension cuts get faster, then one longer shot lets the payoff breathe.
- Speech pace: explainers run about 4-7.5 syllables/s with the peak line no more than ~1.7x the slowest. Add a half-second of air before a joke or key number and after it. Voice never rushes the number the viewer needs to read.
- Pauses are tools: under 0.55s is breathing, 0.55-1.1s is a deliberate beat (note it), over 1.1s reads as a stall unless the picture is doing something and the script says `allow_gap`.
- Captions: <= 2 lines, <= ~19 characters/second reading speed, on screen >= 1.1s; keep emphasis (*word*) on the one word that matters.
- Ending: end on the strongest line, then a call-to-action under 3s. A loop (last frame resembles first) lifts replays; set it up in the last caption.

## 4. Sound and music in the edit
- Voice is king: music sits ~12-18 dB under speech and rises in pauses; sound effects are punctuation, not wallpaper.
- Real recorded effects beat synthesised ones for transitions and UI sounds (`scripts/sfx.mjs`, references/sound-effects.md).
- Hit points: a sound or music accent on every reveal/crash; silence for one beat before the biggest reveal.
- Loudness: about -16 to -13 LUFS integrated, true peak <= -1 dBFS (the `qa.mjs` defaults).
- Music tempo should divide the scene lengths: place bar lines on scene starts or cue words where possible (`scripts/compose.mjs` searches tempo and phase for this and lands accents on the exact cue times).
- Cuts land on the beat or exactly off it with intent; never "near" the beat.

## 5. Footage edits (when real clips are used; `scripts/edit.mjs` does the mechanics, see references/footage-editing.md)
- Remove the first and last half-second of dead air in every clip; cut ums and false starts; use a jump cut with a 5-10% punch-in on alternate cuts to hide the jump.
- Reframe for 9:16 around the subject's eyes at the upper third; keep faces out of the bottom caption band (y 1290-1430 of 1920).
- Add a graphic or caption change at every jump so cuts feel designed.
- Colour: match shots (exposure, white balance) before style; keep skin tones natural.

## 6. Pre-publish checklist (the QA gate plus a human)
1. `node scripts/qa.mjs --video out/reel.mp4` has 0 FAIL; each WARN is fixed or justified in the script.
2. A human listens to the voice track once (the checklist qa.mjs prints) and watches once on a phone with sound off.
3. Cover frame readable at thumbnail size; first caption inside the safe area (nothing above y250 or below y1500).
4. Hook sentence, payoff and call-to-action each pass the "would I stay for this?" test.

## What this playbook does not give you
Taste, comedy timing and audience knowledge. Treat the numbers as a floor for craft, not a guarantee of reach.
