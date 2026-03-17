# me0wberry — Fixes Prompt 5
Read this file and apply every fix to index.html. This prompt focuses on redrawing SVG icons with very specific instructions.

---

## Fix 1 — Sidebar cat icon (hello! nav item)

Redraw the small cat SVG icon next to "hello!" in the sidebar nav. Current size is 18×18 viewbox. Keep the same size.

The goal is a simple pixel cat FACE (no body) that reads clearly as a cat, not a rabbit. Follow this pixel grid exactly (each unit = 1 SVG unit):

**Colour palette:**
- Face: `#fdd8e0` (pink-pale)
- Ear outer: `#a8d8a0` (green-light)
- Ear inner: `#f4a8b8` (pink-light)
- Eyes: `#4a3040` (dark)
- Nose: `#e07090` (pink)
- Whiskers: `#a09098` (muted), very short — 2 units long each side only

**Structure (on an 18×18 grid):**

Ears — tall narrow triangles, well separated:
- Left ear outer: column 2–4, rows 1–5 (narrowing: row1=cols3-4, row2=cols2-4, row3-5=cols2-5)
- Left ear inner: column 3, rows 2–4
- Right ear outer: column 14–16, rows 1–5 (mirror of left)
- Right ear inner: column 14–15, rows 2–4
- Gap between ears: cols 5–13 at row 1 should be empty — ears must look separated not merged

Face — wide rounded square:
- Main face body: cols 2–16, rows 5–16
- Round the corners by omitting the single corner pixels (col2 row5, col16 row5, col2 row16, col16 row16)

Eyes — small, dot-like, with shine:
- Left eye: 2×2 block at cols 5–6, rows 8–9
- Left eye shine: 1×1 at col5, row8 in `#fdf6f0`
- Right eye: 2×2 block at cols 12–13, rows 8–9
- Right eye shine: 1×1 at col12, row8 in `#fdf6f0`

Nose — tiny:
- 2×1 rect at cols 8–9, row 11

Mouth — simple:
- 1×1 at col7, row12
- 1×1 at col10, row12

Whiskers — SHORT, 2 units only:
- Left whisker top: cols 1–2, row 10
- Left whisker bottom: cols 1–2, row 11
- Right whisker top: cols 16–17, row 10
- Right whisker bottom: cols 16–17, row 11

Blush cheeks (optional, very subtle):
- Left: 2×1 at cols 4–5, row 11, fill `#f4a8b8` opacity 0.4
- Right: 2×1 at cols 13–14, row 11, fill `#f4a8b8` opacity 0.4

---

## Fix 2 — Bio panel cat avatar (about tab)

Redraw the large cat SVG in the bio panel Tab 1. Current size ~60×60. Keep same size, viewBox="0 0 60 60".

The goal is a sitting upright cat with a rounder, wider face and proper pointed ears. Use the sitting cat from the reference images as inspiration — round head, visible body/haunches, tail to one side.

**Colour palette:**
- Body/face: `#fdd8e0` (pink-pale)
- Ear outer: `#a8d8a0` (green-light)  
- Ear inner: `#f4a8b8` (pink-light)
- Eyes: `#4a3040`
- Eye shine: `#fdf6f0`
- Nose: `#e07090`
- Blush: `#f4a8b8` opacity 0.45
- Whiskers: `#a09098`, short

**Structure:**

Ears — tall pointed triangles, clearly separated with gap:
- Left ear: starts at col 8, peaks at col 10-11 around row 2, base at row 12
  - Outer: stacked rects getting narrower toward top (e.g. row2: 2wide, row3-4: 4wide, row5-8: 6wide)
  - Inner pink: centered inside, 2wide, rows 3–7
- Right ear: mirror at cols 42-50 area
- Gap between ear bases: at least 16 units of empty space

Head — wide and round:
- Main head: cols 8–52, rows 10–38, large rect
- Add corner rects to round it: small rects filling the curve at each corner

Body — sitting haunches:
- Two rounded lumps at bottom: left haunch cols 8–28, rows 38–54; right haunch cols 30–52, rows 38–54
- These should be the same pink-pale colour

Tail — curling to the right side:
- Simple L-shape or slight curve using 3–4 stacked rects going right then up at cols 50–58, rows 44–56

Eyes — round, expressive, with shine:
- Left eye: 4×4 block, cols 18–22, rows 18–22
- Left shine: 2×2 at cols 18–19, rows 18–19
- Right eye: 4×4 block, cols 36–40, rows 18–22
- Right shine: 2×2 at cols 36–37, rows 18–19

Nose:
- 4×2 rect at cols 28–32, rows 28–30

Mouth:
- 2×1 at cols 25–26, row 32
- 2×1 at cols 32–33, row 32

Blush:
- Left: 6×3 at cols 14–20, rows 26–28, opacity 0.4
- Right: 6×3 at cols 38–44, rows 26–28, opacity 0.4

Whiskers — short, 6 units each side:
- Left: cols 2–8, rows 26 and 29
- Right: cols 50–56, rows 26 and 29

Move the `ฅ^•ﻌ•^ฅ` kaomoji below the cat, not beside it, so it doesn't crowd the stat block. Place it in its own div below the SVG within `.kitten-corner`, centered, font-size 11px, color var(--muted).

---

## Fix 3 — Lately nav icon (teacup)

Replace the current sparkle/star icon next to "lately" in the sidebar with a pixel teacup SVG. Viewbox 18×18, all rects only.

**Colour palette:**
- Cup body: `#f4a8b8` (pink-light)
- Cup highlight: `#fdd8e0` (pale pink, 1px strip on left inner)
- Handle: `#e07090` (pink)
- Saucer: `#a8d8a0` (green-light)
- Steam: `#a09098` (muted), opacity 0.5

**Structure:**

Steam (top):
- 1×2 rect at col 7, rows 1–2
- 1×2 rect at col 10, rows 2–3
- (offset wavy steam lines)

Cup body:
- Main: cols 3–15, rows 5–13 (wide rectangle)
- Slightly wider at bottom: cols 3–15, rows 13–14

Handle (right side):
- Outer: cols 15–17, rows 7–11
- Inner gap: cols 15–16, rows 8–10 (make handle hollow — set these to transparent/background)
- Use two rects: top of handle col15-16 row7, bottom col15-16 row11, right col17 rows7-11

Saucer:
- Wide flat rect: cols 1–17, rows 14–15
- Slightly narrower: cols 2–16, rows 15–16

Cup highlight:
- 1×6 rect at col 4, rows 6–11, opacity 0.5

---

## Fix 4 — Favs nav icon (heart)

Replace the current star icon next to "favs" in the sidebar with a pixel heart SVG. Viewbox 18×18, all rects only.

The heart must be WIDER than tall, with a clear dip at the top center. Do NOT make it look like a shield or teardrop.

**Colour:** `#e07090` (pink), highlight `#f4a8b8`

**Pixel heart grid (on 18×18, each rect is 2×2 for chunkiness):**

Row 4: cols 2–5 filled, cols 7–8 empty (dip), cols 10–16 filled  
Row 5: cols 2–16 filled (full width, connecting over dip)  
Row 6: cols 2–16 filled  
Row 7: cols 3–15 filled  
Row 8: cols 4–14 filled  
Row 9: cols 5–13 filled  
Row 10: cols 6–12 filled  
Row 11: cols 7–11 filled  
Row 12: cols 8–10 filled  
Row 13: cols 9 only (bottom point)

Highlight (top-left lobe):
- 2×2 at cols 3–4, rows 4–5, fill `#f4a8b8`

This creates a proper wide heart shape with two rounded lobes at top and a point at the bottom.

---

## Notes
- Do not touch any other panels, embeds, or JS
- Do not modify posts/ folder
- All SVGs must use rect elements only — no path, no polygon, no circle
- After redrawing, double-check that ears on both cats look pointed/triangular and clearly separated, not merged or rounded
