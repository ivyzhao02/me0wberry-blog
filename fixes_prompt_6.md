# me0wberry — Fixes Prompt 6
Read this file and apply every fix to index.html.

---

## Fix 1 — Bio panel cat avatar (about tab): face only

The current sitting cat body is not working. Replace it entirely with a face-only cat, same concept as the sidebar icon but larger and more detailed. ViewBox="0 0 60 60", all rects only.

The small sidebar cat icon came out well — scale that concept up to 60×60 with more detail. Do not attempt a body or sitting pose.

**Colour palette:**
- Face: `#fdd8e0`
- Ear outer: `#a8d8a0`
- Ear inner: `#f4a8b8`
- Eyes: `#4a3040`
- Eye shine: `#fdf6f0`
- Nose: `#e07090`
- Blush: `#f4a8b8` opacity 0.4
- Whiskers: `#a09098`

**Structure — follow this exactly:**

Ears — two tall narrow pointed triangles, clearly separated by a gap of at least 10 units between them:
- Left ear outer: build upward from row 14 to row 2, starting 6 units wide and narrowing to 2 units at the top. Centered around col 12.
  - row 14: cols 8–14
  - row 12: cols 9–13
  - row 10: cols 10–13
  - row 8: cols 10–12
  - row 6: cols 10–11
  - row 4: col 11 only
  - row 2: col 11 only
- Left ear inner: `#f4a8b8`, narrower, same center:
  - row 12: cols 10–12
  - row 10: cols 10–12
  - row 8: cols 10–11
  - row 6: col 11
- Right ear outer: exact mirror of left, centered around col 48
  - row 14: cols 46–52
  - row 12: cols 47–51
  - row 10: cols 47–50
  - row 8: cols 48–50
  - row 6: cols 48–49
  - row 4: col 49 only
  - row 2: col 49 only
- Right ear inner: mirror of left inner, centered col 48

Face body — wide round rect:
- cols 6–54, rows 14–54
- Round corners by omitting: (6,14), (54,14), (6,54), (54,54)
- Add: cols 8–52 row 12 (top curve), cols 8–52 row 55 (bottom)

Eyes — 4×4 with 2×2 shine:
- Left eye: cols 16–20, rows 22–26, fill `#4a3040`
- Left shine: cols 16–17, rows 22–23, fill `#fdf6f0`
- Right eye: cols 40–44, rows 22–26, fill `#4a3040`
- Right shine: cols 40–41, rows 22–23, fill `#fdf6f0`

Nose:
- cols 27–33, rows 33–35, fill `#e07090`

Mouth:
- col 23–24, row 37 (left side of mouth)
- col 36–37, row 37 (right side of mouth)

Blush cheeks:
- Left: cols 10–17, rows 30–33, fill `#f4a8b8` opacity 0.4
- Right: cols 43–50, rows 30–33, fill `#f4a8b8` opacity 0.4

Whiskers — short, 3 lines each side:
- Left top: cols 2–12, row 28
- Left mid: cols 2–12, row 31
- Left bottom: cols 2–12, row 34
- Right top: cols 48–58, row 28
- Right mid: cols 48–58, row 31
- Right bottom: cols 48–58, row 34

After the SVG, place the kaomoji on its own line below, centered:
```html
<div style="text-align:center; font-size:11px; color:var(--muted); margin-top:4px;">ฅ^•ﻌ•^ฅ</div>
```

The `.kitten-corner` div should float to the top-right of the tab content, same as before.

---

## Fix 2 — Heart icon symmetry (favs nav item)

The current heart icon is asymmetrical. Redraw it from scratch on an 18×18 viewbox. All rects only, colour `#e07090`, highlight `#f4a8b8`.

Use this EXACT pixel layout — each row is a single rect:

```
row 4:  cols 2–6   AND cols 12–16  (two separate rects — the two top lobes, with gap at cols 7–11)
row 5:  cols 2–6   AND cols 12–16  (same, second row of lobes)
row 6:  cols 2–16  (full width, lobes merge)
row 7:  cols 2–16
row 8:  cols 3–15
row 9:  cols 4–14
row 10: cols 5–13
row 11: cols 6–12
row 12: cols 7–11
row 13: cols 8–10
row 14: cols 9 (single unit, bottom point)
```

Highlight (top left lobe only):
- cols 3–4, rows 4–5, fill `#f4a8b8`

This produces a perfectly symmetrical heart: two equal lobes at top (separated by a centered gap at cols 7–11), merging at row 6, tapering to a point at row 14.

---

## Notes
- Do not touch any other icons, panels, embeds, or JS
- Do not modify posts/ folder
- All SVGs must use rect elements only — no path, no polygon, no circle
- The key requirement for Fix 1: ears must be visibly pointed and separated by a clear gap — not merged, not rounded, not bunny-like
