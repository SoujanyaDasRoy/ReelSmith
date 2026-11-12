# Safe zones and the best place for the logo (1080 x 1920 reels)

## The numbers (third-party guides, NOT Meta's own page: confirm against Meta's current Ads Guide before paid use)
- **Ads (most cited, from Meta guidance):** keep text and logos out of the top 14% (about 269 px), the bottom 35% (about 672 px, i.e. y > 1248) and 6% on each side (about 65 px). Safe box about 950 x 979 px: x 65..1015, y 269..1248.
- **Organic Reels:** more permissive but sources disagree (bottom overlay anywhere from about 320 to 422 px, top about 108 to 297 px, sides about 49 px). The like/comment/share column covers the lower right, from about y 1150 down.
Sources: [Lilach Bullock](https://www.lilachbullock.com/instagram-reels-safe-zone/), [Outfy](https://www.outfy.com/blog/instagram-safe-zone/), [Reap](https://reap.video/blog/instagram-reels-size), [AdChecklab](https://adchecklab.com/articles/instagram-reels-safe-zone-template), [Kreatli](https://kreatli.com/guides/instagram-reel-safe-zone).

## Where Reelsmith puts the logo
**Top-right, just below y = 284, 65 px from the right edge, about 150 px wide** (top-left as the automatic alternative when the title there is busier). Reasons: it is inside both the ad and the organic safe boxes; the top corners are the one place nothing in the Reels interface sits on top of it during playback of the content area; the lower right is covered by the action buttons; the bottom is covered by the account name and caption; and viewers read top-left to right so a small mark in a top corner reads as a signature without competing with the captions (y 1290-1430).
`brand.mjs` samples the finished video and picks the calmer of the two top corners, adds a backing plate if the logo would disappear into the background, and keeps it clear of titles when it can. Override with `--pos top-left|top-right` (or `bottom-*` knowingly) and `--size`.
Closing logo (`--closing 2.5`): centred at y about 780, the middle of the safe box.

## What this means for our own layouts
Titles start at about y 190-250 and captions sit at y 1290-1430. For ORGANIC Reels that is fine. If the same file is run as an AD, the top 269 px and the bottom 672 px are covered: titles would be clipped and captions hidden. For ad use, ask for an "ad-safe" variant (re-layout needed; not built yet) rather than uploading the organic file as an ad.
