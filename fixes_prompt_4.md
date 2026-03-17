# me0wberry — Fixes Prompt 4
Read this file and apply every fix and addition to index.html.

---

## Fix 1 — Stubby slideshow image sizing

The slideshow images are currently too tall and stretching to fill the full panel width at full photo height. Fix the image sizing so photos are constrained properly.

Apply these CSS changes to the slideshow:

```css
.slide-track-wrapper {
  overflow: hidden;
  width: 100%;
  border: 1px solid var(--frosted-border);
  border-radius: 3px;
}
.slide-img {
  min-width: 100%;
  width: 100%;
  height: 200px;
  max-height: 200px;
  object-fit: cover;
  object-position: center;
  flex-shrink: 0;
  display: block;
}
```

This caps every image at 200px tall regardless of the photo's original dimensions, cropping to center. Do not change anything else about the slideshow JS or structure.

---

## Fix 2 — Lately panel content

Replace all placeholder content in `panel-lately` with the following real content. 

**Heading:** Change `in the lately...` to `lately...`

**"last updated" line:** `last updated march 2026`

**Full panel body content:**

```
/ lately                                    ← pixel tag (keep as is)
lately...                                   ← Lora italic heading (was "in the lately...")
last updated march 2026                     ← muted italic

March Update                                ← new line, Press Start 2P, 8px, --pixel-label2, margin-top 14px

where i'm at (ᐢ. .ᐢ):
– balancing school, job searching and gaming (gaming is winning (ᐢ •ᴗ• ᐢ)↑)
– attempting to not make my already awful sleep schedule worse (failing (´• ω •`)zzz)
– stubby.. needs to go on a diet (=｀ω´=)

────── ♡ · ♡ · ♡ ──────

what i'm into:
– slay the spire modding - but only a bit! (•ᴗ•)⌒♡ i like the vanilla game as is i just want to get achievements more easily
– sims 4 CC.. how did i play without custom furniture before (⸝⸝> ᴗ <⸝⸝)
– editing and improving this site & my portfolio one! this is so fun (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧

──────

♡ a note:
hi! if you're reading this, thanks for checking out my site (˶ᵔ ᵕ ᵔ˶) this has been amazing to start and make.. and i highly recommend Claude, in a not weird-tech-billionaire way (¬‿¬) way better than ChatGPT and Anthropic has stood for their morals/ethics thus far lol. much love ♡
```

Style notes:
- "March Update" is a sub-heading: Press Start 2P, 8px, `--pixel-label2`, margin-top 14px, margin-bottom 8px
- All bullet content is lowercase per site tone rules
- The `♡ a note:` label stays in its existing style (small, `--heading` colour)
- The note paragraph is italic, muted colour, 13px
- Use the existing `.hearts-divider` class for the `♡ · ♡ · ♡` divider
- Use the existing `.plain-divider` or `<hr class="dashed-divider"/>` for the second divider

---

## Fix 3 — Kaomoji additions to bio panel and favs panel

Add the following kaomoji at the specified locations. Do not change any other copy.

### Bio panel — Tab 1 (about)
- After `INFP-T` in the stat block, add on the same line: `(´ ▽ ｀)`

### Bio panel — Tab 2 (likes)
- After `dreaming & planning` in the likes list, add on the same line: `(˘͈ᵕ˘͈)`

### Favs panel
- After `league of legends: sona, nami` add on the same line: `(งᵕ̣̣̣̣̣̣˘ᵕ̣̣̣̣̣̣)ง`
- After `apex legends: lifeline, conduit` add on the same line: `♡`
- After the fav games list `warframe / league of legends / lord of the rings online / the sims 4` add: `✦`
- After `lord of the rings (full stop)` add: `🌿`
- After the `★ fav foods & drinks:` section label add: `(￣﹃￣)`
- After the full foods list `homestyle shanghainese food / dim sum / katsu / musubi / grapes / mangoes` add: `♡`

---

## Notes
- Do not touch any other panels
- Do not modify the posts/ folder or any embeds
- Do not change the music player or cactus panel
