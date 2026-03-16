# me0wberry — Fixes Prompt 2: Electric Boogaloo
Read this file and apply every fix and addition to index.html. Reference ivyzhao-reference.html where needed.

---

## Fix 1 — Background decoration colour

The background scatter elements (sparkles, hearts, kaomoji, etc.) are currently rendering grey. Revert them to white semi-opaque, exactly like ivyzhao.ca's sparkles. All `.bg-deco` elements should be:
- `color: white` or `color: rgba(255,255,255,0.6)`
- opacity between 0.35–0.55 for most, 0.25 for kaomoji cats
- No grey, no pink, no coloured tints — white only

---

## Fix 2 — "listening" label spacing

In the bio panel Tab 1 (about), the `listening` currently-label is running directly into the value text `karencici / jay chou / cpop` with no space. Add a gap between the label and value — either via padding-right on the label, a min-width, or a gap property on the row. Should match the spacing of the `playing` and `reading` rows visually.

---

## Fix 3 — Panel default sizing

Panels are still opening too small. Reference ivyzhao-reference.html's hello panel as the correct default size — it opens large and fills a meaningful portion of the screen.

Apply these default sizes:
- `panel-bio`: 420px wide, 480px tall
- `panel-lately`: 360px wide, 480px tall
- `panel-favs`: 400px wide, 480px tall
- All blog category panels (games, music, food, stubby, beauty): 380px wide, 480px tall
- `panel-player`: 280px wide, auto height — keep as is
- `panel-cactus` (new, see Addition 3): 220px wide, auto height

Make sure the CSS `.panel` default height is 480px and width is set per panel via inline style or specific ID rules.

---

## Fix 4 — Steam embed

Replace the current broken Steam embed in the games panel with this working miniprofile iframe:

```html
<iframe
  src="https://gamer2810.github.io/steam-miniprofile/?accountId=76561198848752958&appId=230410&interactive=true&vanityId=berrymeowy"
  width="100%"
  height="200"
  frameBorder="0"
  scrolling="no"
  style="border:none; display:block; margin-bottom:10px;">
</iframe>
```

Remove the old steam-card.vercel.app iframe and the fallback card entirely. Place this at the top of the games panel body before the posts list.

---

## Fix 5 — Music player song title font

The song title line in the `panel-player` currently uses Press Start 2P which does not support CJK characters, making Chinese song titles unreadably small. Change the song title display element to use Lora at 12px instead. This applies to all three tracks — English and Chinese titles should both render cleanly in Lora italic. Do not change the font of any other element in the player (track counter, time stamps, buttons etc. stay in Press Start 2P).

---

## Addition 1 — Custom ♡ cursor

Apply a custom heart cursor site-wide using an SVG data URI. The cursor should be a hollow ♡ shape with white fill and pink stroke (`#e07090`).

```css
body {
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath d='M10 17 C10 17 2 11 2 6 C2 3 4 1 7 1 C8.5 1 9.5 2 10 3 C10.5 2 11.5 1 13 1 C16 1 18 3 18 6 C18 11 10 17 10 17Z' fill='white' stroke='%23e07090' stroke-width='1.5'/%3E%3C/svg%3E") 10 10, auto;
}
```

Also apply pointer cursor override for all clickable elements so the heart cursor is preserved but interactive elements still feel clickable:
```css
a, button, [onclick], .nav-item, .tab-btn, .panel-close, .panel-resize {
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cpath d='M10 17 C10 17 2 11 2 6 C2 3 4 1 7 1 C8.5 1 9.5 2 10 3 C10.5 2 11.5 1 13 1 C16 1 18 3 18 6 C18 11 10 17 10 17Z' fill='white' stroke='%23e07090' stroke-width='1.5'/%3E%3C/svg%3E") 10 10, pointer;
}
```

---

## Addition 2 — ilmbf mentions as cactus panel triggers

Add two clickable triggers that open the secret cactus panel (`panel-cactus`) when clicked. Both should call `openPanel('panel-cactus')`.

**Trigger A — sidebar sub-line:**
Update the sidebar sub-line (currently `₍ᐢ. .ᐢ₎ · toronto-ish · she/her`) to:
```
₍ᐢ. .ᐢ₎ · toronto-ish · she/her · <span class="ilmbf-trigger" onclick="openPanel('panel-cactus')">ilmbf ♡</span>
```
Style `.ilmbf-trigger`:
- No underline
- Same colour as the rest of the sub-line (muted/italic)
- `cursor` inherits the custom heart cursor
- No obvious hover indicator — subtle, rewards curiosity
- On hover: very slight colour shift to `--pink` only, no underline

**Trigger B — favs panel:**
At the very bottom of the favs panel body, after the fav foods & drinks section, add:
```html
<hr class="dashed-divider"/>
<div class="ilmbf-trigger him-trigger" onclick="openPanel('panel-cactus')" style="text-align:center; padding:8px 0; font-size:13px; color:var(--muted);">
  ♡ him
</div>
```
Same subtle hover behaviour — slight pink colour shift, no underline, no obvious "this is a button" visual.

---

## Addition 3 — Secret cactus easter egg panel (`panel-cactus`)

Create a new hidden panel with id `panel-cactus`. It does NOT appear in the sidebar nav — it can only be opened via the two triggers above.

**Panel specs:**
- Width: ~220px
- Height: auto (fits content)
- Not resizable (no resize handle)
- Draggable via titlebar as normal
- Starts hidden/closed on load
- Titlebar: `🌵` (just the emoji, no text)
- Close button: normal ✕

**Panel body content:**

A pixel cactus SVG centered in the panel, ~80×100px, hand-coded rect elements only. Design:
- Main cactus body: tall chunky green rect (`#5aaa6a`) center
- Two arms: shorter rects branching left and right, slightly above midpoint
- Spines: tiny 2px wide white rects poking out from the body and arms at intervals
- Pot: a small trapezoid-ish shape at the bottom in terracotta/muted pink (`#c07090` or `#d4896a`)

Scattered around the cactus (absolutely positioned or inline), 5–7 small hearts in varying sizes and pinks:
- Use `♡` characters at font sizes 10px–16px
- Colours: `#e07090`, `#f4a8b8`, `#ffd0de` — vary them
- Slight rotations on some: `transform: rotate(-15deg)` etc.
- Positioned to feel scattered/floating around the cactus, not in a grid

Below the cactus, centered text in Press Start 2P, 7px, `--pixel-label`:
```
ilmbf ♡ j
```

Full panel body layout:
```
[ scattered hearts + pixel cactus SVG + scattered hearts ]

         ilmbf ♡ j
```

No other text, no dividers, no pixel tags. Just the cactus, the hearts, and the text. Cozy and secret.
