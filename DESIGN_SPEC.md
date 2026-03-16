# me0wberry.blog — DESIGN SPEC
*Personal/anonymous blog site. Separate from ivyzhao.ca. No real name, no IRL contact info.*

---

## Overview

A personal blog and "about me" site in the spirit of early 2000s–2010s personal pages (Carrd, Neocities, old Tumblr). Desktop OS metaphor — frosted glass panels that open like windows, draggable, resizable. Same core architecture as ivyzhao.ca but warmer, more saturated, more "messy" and alive. Blogging-focused with live embeds for Steam and Spotify.

**Domain:** me0wberry.com
**Stack:** Vanilla HTML/CSS/JS, single `index.html`, no frameworks, no build step
**Hosting:** GitHub Pages
**Fonts:** `Press Start 2P` (pixel labels, titlebars, nav section headers) + `Lora` italic (panel headings) — same as ivyzhao.ca

### Copy / tone rules
- Body text, bio content, bullet points: **mostly lowercase**
- Panel titles, tab labels, section headings: **normal capitalisation**
- Kaomoji are encouraged as flavor throughout
- Slashes ( / ) preferred over commas in list-style inline content

---

## Colour Palette

Warmer, more saturated version of ivyzhao.ca's pink-green. Strawberry + green apple fruit energy.

```css
:root {
  /* Core */
  --pink:           #e05878;   /* warmer/deeper — strawberry */
  --pink-light:     #f4a0b8;
  --pink-pale:      #fdd8e0;
  --green:          #5ab86a;   /* apple green */
  --green-light:    #a8d8a0;
  --cream:          #fdf6f0;   /* warm off-white */

  /* Text */
  --heading:        #8b2a4a;
  --body:           #4a3040;
  --muted:          #a08090;

  /* Pixel labels */
  --pixel-label:    #b04060;
  --pixel-label2:   #c05878;

  /* Frosted glass */
  --frosted-bg:     rgba(253, 246, 240, 0.45);
  --frosted-border: rgba(255, 255, 255, 0.70);

  /* Accents */
  --bow-pink:       #e8708a;
  --stem-green:     #6ab870;
}
```

**Background gradient:**
```css
background: linear-gradient(135deg,
  #9ad898 0%,
  #c8e8b8 20%,
  #f0e0d0 45%,
  #f5c0cc 70%,
  #f090a8 100%
);
```

---

## Background Decoration

More alive than ivyzhao.ca. All elements: fixed position, pointer-events none, z-index 0, low opacity (0.25–0.55).

**Scatter ~18–22 elements total, varying size and rotation:**
- `✦` `✧` — sparkle stars, various sizes 8–20px
- `♡` — hearts
- `✿` — flowers
- `˚` — tiny dots
- Kaomoji cats: `=^･ω･^=` and `(=^･^=)` — 8px font, opacity 0.25
- Small pixel bow SVGs — 2–3 instances, very faint

---

## Top Bar

```
[ © me0wberry 2026 ]     [ (=^･^=) · me0wberry.com ]     [ _ □ ✕ ]
```

- Left: Press Start 2P, 8px, `--pixel-label`
- Center: pill tag, kaomoji + site name
- Right: three fake OS window control buttons

---

## Layout

`topbar` (34px fixed) → `#layout` (flex row) → `#sidebar` (270px) + `#main` (flex: 1).

---

## Sidebar

### Header
```
me0wberry
  ₍ᐢ. .ᐢ₎ · toronto-ish · she/her
```
- Name: Press Start 2P, 9px, `--pixel-label`
- Sub-line: Lora italic, 12px, muted

### Navigation

```
✿ pinned
  ♡  hello!       ← bio panel, opens by default on load
  ✦  lately

✿ the blog
  🎮 games
  🎵 music
  🍜 food
  🐱 stubby
  💄 beauty

✿ elsewhere
  twitch / discord / instagram / spotify / steam
```

- Section labels: Press Start 2P, 8px, `--pixel-label2`
- Nav items: pink left border + frosted bg on hover/active
- Custom pixel SVG icons per item (see Assets)
- "elsewhere" items are nav-style links mirroring the find me tab

---

## Panels — General

- Frosted glass, pixel corners, draggable titlebar, close button, resize handle
- Same mechanics as ivyzhao.ca
- On load: `panel-bio` opens automatically

---

## Panel: Bio (`panel-bio`)

**Titlebar:** `hello! (=^･^=)`

Old Windows-style tabs along the top of the panel body (below titlebar). Active tab: white bg, lifted appearance, pink bottom accent. Inactive: slightly muted bg.

---

### Tab 1 — `✦ about`

Stat block (stacked lines) on the left. Pixel kitten SVG floating in the corner (top-right or bottom-right, not overlapping text). Kaomoji accent somewhere on the tab, e.g. `ฅ^•ﻌ•^ฅ` near the kitten.

**Stat block:**
```
she/her
23 · aries · 🐴
🇨🇦🇨🇳 eng / 中文
INFP-T
```

Dashed divider, then **Currently** section (labels Press Start 2P 7px, values body text):
```
playing    slay the spire / the sims 4 / marathon
listening  karencici / jay chou / cpop
reading    marathon lore
```

**Pixel kitten SVG (~60×60, hand-coded rects):**
- Rounded square face, cream/pink
- Dot eyes, small nose, whisker rects
- Pointed ears in `--green-light`, pink inner ears

---

### Tab 2 — `♡ likes`

Two columns, dashed divider between them:

```
likes ♡                    dislikes ✗
──────────                 ──────────
cats                       loud/crowded spaces
pink & green               certain individuals
cheese                     maga/trumpies
boba                       raw onions
gaming                     dill pickles
salmon
dreaming & planning
```

Dashed divider below, then:
```
you'll fit right in if...
– you like close-knit circles and trying new games :3
```

---

### Tab 3 — `✿ dni`

Pixel tag at top: `/ dni`

**Hard DNI:**
```
– minors (under 18)
– racists / homophobes / transphobes / sexists
– maga / far right / fascists
– pro-harassment / drama & callout culture
– NFT/crypto people
– AI art promoters / anti-artist
– aggressively negative or cynical people
– people who can't handle differing opinions on games/media
```

Dashed divider, then softer section (slightly smaller/muted text):
```
also please don't:
– be weird about me being in a relationship
– only interact to argue
```

---

### Tab 4 — `★ find me`

Pixel buttons (`.pixel-btn` style), roughly two per row:

```
[ twitch ↗ ]      [ instagram ↗ ]
[ spotify ↗ ]     [ steam ↗ ]
[ discord ]
```

**Discord button:** clicking opens a tiny mini-panel styled as a Windows error dialog.
- Width ~180px, centered or slightly offset in `#main`
- Pixel titlebar: `discord`
- Body: `ask! (=^･^=)`
- One button: `ok` — closes the mini-panel, does nothing else
- Draggable if feasible

Muted italic note below all buttons:
```
i don't give out my discord right away — say hi somewhere else first (˶ᵔ ᵕ ᵔ˶)
```

**Social URLs:**
```
TWITCH:    https://www.twitch.tv/me0wberry_
INSTAGRAM: https://www.instagram.com/z._ivy/
SPOTIFY:   https://open.spotify.com/user/_no_need_for_names_?si=b15417a7b9884f96
STEAM:     https://steamcommunity.com/id/berrymeowy/
DISCORD:   no URL — popup only
```

---

## Panel: Lately (`panel-lately`)

```
/ lately                          ← pixel tag
in the lately...                  ← Lora italic heading
last updated [month year]         ← muted italic

where i'm at (ᐢ. .ᐢ):
– [ivy fills in]

────── ♡ · ♡ · ♡ ──────

what i'm into:
– [ivy fills in]

──────

♡ a note:
[ivy fills in — freeform short paragraph]
```

---

## Panel: Blog Category

Structure for `panel-games`, `panel-music`, `panel-food`, `panel-stubby`, `panel-beauty`:

```
/ [category]                      ← pixel tag
[category name]                   ← Lora italic heading

[ embed if applicable ]

──────────────────────────────────

posts:
– [post title] · [date]           ← link to posts/[category]/slug.html
```

**Games panel embed:** Steam profile widget iframe from `https://steamcommunity.com/id/berrymeowy/` — recent activity / miniprofile. Falls back gracefully.

**Music panel embed:** Spotify iframe:
`https://open.spotify.com/embed/user/_no_need_for_names_`
Light theme (`theme=0`). Fall back to a specific public playlist embed if profile doesn't render.

**Food / Stubby / Beauty:** posts list only, no embed.
Stubby panel titlebar gets a `🐾` accent.

---

## Blog Post Files

**Path:** `posts/[category]/YYYY-MM-slug.html`

Each post is standalone HTML:
- Same fonts + CSS variables as `index.html`
- Centered content, max-width 680px
- Single frosted panel container
- Titlebar: `[category] · [post title]`
- Footer: `← back to me0wberry.com` + date

`post-template.html` at repo root — copy for every new post. Comments mark everywhere to edit.

---

## Assets — Custom SVGs (hand-coded rects only, no paths, no external files)

All icons viewbox 18×18 unless noted. Same pixel-rect method as ivyzhao.ca.

### Pixel bow (decorative, ~18×12)
Symmetrical wings + center knot in `--bow-pink`. Used in background scatter and accents.

### Pixel cat face — bio avatar (~60×60)
Rounded square face, cream/pink. Dot eyes, nose, whisker rects. Pointed ears in `--green-light`, pink inner ears.

### Nav icons (18×18):
| Item | Icon |
|---|---|
| hello/bio | small pixel cat face |
| lately | pixel ✦ sparkle star |
| games | pixel controller (D-pad + 2 buttons) |
| music | pixel music note |
| food | pixel rice bowl |
| stubby | pixel cat silhouette (different pose) |
| beauty | pixel lipstick |

---

## Decorative Details (vs ivyzhao.ca)

1. Denser background scatter with kaomoji cats
2. Small pixel bows as accents in nav or headings
3. Kaomoji in section headings: `where i'm at (ᐢ. .ᐢ):`
4. Divider variety: `♡ · ♡ · ♡` or `✦ · ✦ · ✦` mixed with plain dashes
5. Active bio tab gets a small `✦` prefix

---

## Mobile

Same as ivyzhao.ca:
- Sidebar → full-width nav
- Panels stack, lose drag/resize
- Mobile back button when panel open
- Bio panel tabs work via tap

---

## What's Different from ivyzhao.ca

| ivyzhao.ca | me0wberry.com |
|---|---|
| Real name, email, LinkedIn | Handle only, no IRL info |
| Portfolio / work focus | Blog / personal life focus |
| Resume + projects panels | Bio (tabbed) + blog categories |
| Cooler professional pink-green | Warmer strawberry-apple palette |
| Minimal background scatter | Dense scatter with kaomoji cats |
| Clean hello :) intro | Tabbed bio (about / likes / dni / find me) |
| No embeds | Steam + Spotify embeds |
| Single index.html | index.html + posts/[category]/slug.html |

---

## File Structure

```
index.html
post-template.html
README.md
posts/
  games/
  music/
  food/
  stubby/
  beauty/
```

---

## Claude Code Prompt

Paste this alongside the spec file when starting Claude Code:

```
Read DESIGN_SPEC.md and build index.html and post-template.html from scratch.
Do not reference or copy ivyzhao.ca's index.html — build fresh using the spec.
All SVG icons must be hand-coded using rect elements only (no paths, no external files).
All CSS must use the variables defined in the spec.
Body text and bio content should be mostly lowercase per the copy tone rules in the spec.
Build the Discord "ask!" mini popup panel as described in Tab 4 of the bio panel.
Build the bio panel with old Windows-style tabs (about / likes / dni / find me).
Create the posts/ folder structure with empty placeholder files.
```
