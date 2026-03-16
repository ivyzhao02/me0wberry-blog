# me0wberry — Fix & Addition Prompt
Read this file carefully and apply every fix and addition to index.html. Also reference ivyzhao-reference.html for panel sizing, drag/resize/close behaviour, and pixel square button style.

---

## Fix 1 — Colour palette

Revert CSS variables to match ivyzhao.ca's original palette. The dark red was too dominant — use it only as a subtle accent. Use these exact values:

```css
:root {
  --pink:           #e07090;
  --pink-light:     #f4a8b8;
  --pink-pale:      #ffd0de;
  --green:          #5aaa6a;
  --green-light:    #a8d8a0;
  --cream:          #fdf6f0;

  --heading:        #8b3a5a;
  --body:           #4a3a42;
  --muted:          #a09098;

  --pixel-label:    #b05a7a;
  --pixel-label2:   #c07090;

  --frosted-bg:     rgba(255, 255, 255, 0.42);
  --frosted-border: rgba(255, 255, 255, 0.68);

  --bow-pink:       #e07090;
  --stem-green:     #5aaa6a;
}
```

Background gradient — revert to ivyzhao.ca's original:
```css
background: linear-gradient(135deg,
  #a8e6a3 0%,
  #c9e8c5 25%,
  #e8ddd5 50%,
  #f2c4ce 75%,
  #f4a8b8 100%
);
```

---

## Fix 2 — Panel default state and sizing

Reference ivyzhao-reference.html for exact panel behaviour.

- **Only `panel-bio` should be open/visible on load.** All other panels start hidden/closed.
- Panels open when their sidebar nav item is clicked.
- Default panel height: 480px
- Default panel width: 420px for bio, 380px for blog category panels, 340px for lately, 280px for music player
- Copy drag, resize, z-index stacking, and close button JS logic exactly from ivyzhao-reference.html

---

## Fix 3 — Spotify embed

Replace the broken Spotify user profile embed in the music panel with this playlist embed:

```html
<iframe
  style="border-radius:3px; border:1px solid var(--frosted-border); display:block;"
  src="https://open.spotify.com/embed/playlist/3KhEMQN1OT78s1M8m3MeAj?utm_source=generator&theme=0"
  width="100%"
  height="352"
  frameBorder="0"
  allowfullscreen=""
  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
  loading="lazy">
</iframe>
```

---

## Fix 4 — Steam embed

Replace the plain fallback card in the games panel with this embed. If it fails to load, keep the fallback card visible underneath:

```html
<iframe
  src="https://steam-card.vercel.app/api?steamid=berrymeowy&theme=light"
  width="100%"
  height="130"
  frameBorder="0"
  scrolling="no"
  style="border:1px solid var(--frosted-border); border-radius:3px; display:block;">
</iframe>
```

---

## Fix 5 — Discord button size

In the find me tab, make the discord button exactly the same width, height, padding, and font size as the other four social buttons. It sits on its own row below the 2×2 grid but must match the other buttons visually.

---

## Fix 6 — Text size increase

- Base body font size: 14px
- Press Start 2P nav section labels: 9px
- Press Start 2P panel titlebars: 9px
- Press Start 2P pixel tags: 7px
- Press Start 2P tab buttons: 8px minimum
- Press Start 2P `currently` labels: 8px
- Press Start 2P topbar text: 9px
- Sidebar name header: 10px
- Nav item font size: 14px
- Panel body general text: 14px
- Do NOT change Lora italic heading sizes

---

## Fix 7 — Topbar window buttons

Replace the macOS-style coloured circle buttons in the topbar with pixel square buttons exactly matching ivyzhao-reference.html's `.tb-btn` style: small squares with a border, no border-radius, muted colour, containing `_`, `□`, `✕`.

---

## Fix 8 — Likes list update

In the bio panel Tab 2 (likes), remove `cheese`, `boba`, and `salmon` from the likes list (they are moving to the favs panel). Add `plushies / stuffies / stuffed animals` to the likes list.

---

## Fix 9 — Background scatter density

Increase the number of background scatter elements to ~25–30 total. Make sure to include:
- At least 4–5 kaomoji cats: `=^･ω･^=` and `(=^･^=)` scattered at varying positions, 8px font, opacity 0.25
- Mix of `✦` `✧` `♡` `✿` `˚` at varying sizes (8px–20px) and slight rotations
- 2–3 faint pixel bow SVGs

---

## Addition 1 — Floating music player panel (`panel-player`)

Create a new floating panel styled exactly like the other panels (frosted glass, pixel corners, pixel titlebar, close button) but:
- **Not resizable** (no resize handle)
- **Open by default on load** alongside `panel-bio`
- Default position: bottom-right area of `#main`, e.g. `bottom: 20px; right: 20px` (use fixed-ish positioning or explicit top/left that places it bottom-right)
- Default size: ~280px wide, auto height
- Titlebar: `♪ now playing`
- No close-forever behaviour — closing just hides it, reopening from sidebar restores it

**Sidebar entry:** Add to a new `✿ extras` section (or append to `✿ pinned`):
- Nav item: `♪ player` — clicking opens/focuses `panel-player`

**Player UI (inside panel body):**

```
[ song title — artist ]         ← scrolling marquee if long, Press Start 2P 7px
[ progress bar — thin, pink, shows current time / total ]

[ |◀  ▶/❚❚  ▶| ]               ← prev / play-pause / next buttons, pixel style
[ 🔊 ──●────── ]                ← volume slider

track X / 3                     ← muted small text
```

**Playlist (3 tracks, files in `audio/` folder):**
```
1. audio/please-dont-stop.mp3   — Please don't stop being sweet to me · lace
2. audio/forever-and.mp3        — forever & · EJEAN
3. audio/huayuan-meteor-rain.mp3 — 花园裡的流星雨 · Karencici
```

Behaviour:
- Plays through tracks in order, loops back to track 1 after track 3
- Play/pause toggles current track
- Prev goes to previous track (or restarts current if >3s in)
- Next goes to next track
- Volume slider controls audio volume (0–1)
- Progress bar updates in real time; clicking it seeks
- Does NOT autoplay on load (browser restriction) — shows paused state by default
- All button icons are pixel SVG rects or simple Unicode: `◀` `▶` `❚❚` `▶|` — styled in `--pixel-label` colour

---

## Addition 2 — Favs panel (`panel-favs`)

Create a new panel with:
- Titlebar: `✦ favs`
- Add to sidebar under a new `✿ about` section (which also contains the existing `hello!` and `lately` nav items — move those from `✿ pinned` into `✿ about`)

**Panel content:**

```
/ favs                            ← pixel tag
favourites                        ← Lora italic heading

★ game mains:
  league of legends: sona, nami
  apex legends: lifeline, conduit
  warframe: mag, khora, yareli, harrow
    (sub-note in muted italic: yes mostly healers/supports (=^･^=))

★ fav games:
  warframe / league of legends / lord of the rings online / the sims 4

★ sanrio & plushies ♡:
  pochacco / cinnamoroll
  (placeholder note: "always looking for more (˶ᵔ ᵕ ᵔ˶)")

★ fav media:
  lord of the rings (full stop)
  [comfort shows/movies — ivy fills in]

★ fav foods & drinks:
  homestyle shanghainese food / dim sum / katsu / musubi / grapes / mangoes
```

Section headers (`★ game mains:` etc.) in Press Start 2P 8px `--pixel-label2`.
Content in body text 14px, mostly lowercase.
Use `♡ · ♡ · ♡` dividers between sections.

---

## Addition 3 — Sidebar restructure

Restructure the sidebar nav sections as follows:

```
✿ about
  ♡  hello!       ← bio panel (opens by default)
  ✦  lately
  ★  favs         ← new

✿ the blog
  🎮 games
  🎵 music
  🍜 food
  🐱 stubby
  💄 beauty

✿ extras
  ♪  player       ← new music player panel

✿ elsewhere
  twitch / discord / instagram / spotify / steam
```

---

## Fix 10 — Bio panel stat block nationality line

In Tab 1 (about), update the stat block to display nationality as two separate flag emojis on their own line, with the language line below it:

```
she/her
23 · aries · 🐴
🇨🇦 🇨🇳
eng / 中文
INFP-T
```

Make sure the flag emojis render at a reasonable size — they should be on their own line with no extra text crowding them.

---

## Notes

- All new SVG icons (player, favs) must be hand-coded rect elements only — no paths, no external files
- The `audio/` folder and files are placeholders — the player should handle missing files gracefully (show track name, stay paused, no JS errors)
- Do not change anything about the existing post template structure or the posts/ folder
