# Storyboard template (write this BEFORE any scene code; all four upstream methods agree on storyboard-first)

Merge of: ClaudeAnimationBase "STORYBOARD.md before scene code", Manim composer `scenes.md`, huashu 镜头表 (shot list), anidoodle "story in three sentences + look still".

```md
# <Reel title>
Format: 1080x1920, 30fps, <45-65>s. Engine: <ui-cards|anidoodle|huashu|claude-animation-base|manim>. Style: <one id from style-catalog.md>.
Audience / tone: <who> / <subtle deadpan | earnest | ...>. Voice presets: narrator=<preset>, other=<preset>.

## Story in three sentences
1. Setup:  2. Turn:  3. Payoff + returning token (a visual or line that comes back at the end):

## Look still (approve ONE frame before building everything)
<describe or attach the still>. Palette: <hex list>. Fonts: <...>. Safe area: nothing above y250 / below y1500.

## Scenes
### <id>  (target <s>s, from build/cues.json after tts)
- Purpose: one sentence.
- VO (Hindi, Devanagari):
- Cues (label -> word): 
- Caption(s) (Hinglish, one line each):
- Visual: what the viewer "reads", in order (one read at a time) + hold time per read (>= 1.2 s).
- Motion: enter on <cue>, ease, what exits.
- Transition out:
- Risk / fact-check:

## Implementation order
1. tts + audio, 2. look still, 3. hardest scene first, 4. rest, 5. contact sheet review, 6. final render + frames-from-mp4 review.
```
Rules: every scene has a point; something happens in every shot; one focal action per shot; transitions at every seam; nothing perfectly static;
no dead air; claims about sound/motion must be measured or listened to by a human.
