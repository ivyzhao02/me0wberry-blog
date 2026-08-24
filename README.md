# me0wberry-blog

Personal static site and blog for [me0wberry.com](https://me0wberry.com).

## Local tools

- Create monthly posts with `tools/post-studio/server.js`.
- Refresh the homepage now panel, `/now/`, the archive search index, and RSS with `node tools/build-site-data.js`.
- Check local links, generated files, browser behavior, themes, mobile controls, and direct-file previews with `pnpm check`.
- Keep the visual appearance and existing interactions unchanged during maintenance unless something is intentionally being fixed.
- The build shown in `/system/` is generated as `v0.<repository commit count>` and advances automatically with the next pending commit.

Post Studio writes posts into `posts/<category>/`, updates the matching `index.json`, stores new gallery images in `images/<category>/`, and refreshes all generated site data automatically. The internal `lately` category name is retained for existing paths, but its visitor-facing name is `now`.

## Public pages

- `/welcome/` is the first-visit entrance into the desktop; the root URL remains the desktop itself.
- `/info/` is the me0wberry profile, social links, commissioned-art space, projects page, and visible resource shelf.
- `/persona/` is the growing gallery for commissioned art of me0wberry, with artist credit beside every piece.
- `/system/` holds the colophon, themes, credits, site map, old-version notes, and changelog.
- `/webgarden/` holds saved handmade sites, the growing button shelf, and Surprise Me.
- `/toybox/` keeps its stable address while appearing to visitors as Trinkets; it holds copyable kaomoji, saved graphics, and desktop resources.
- `/shrines/` is the entrance to growing subject rooms; Stubby and Pokémon are the first two.
- `/archive/` provides category browsing and keyword search; `/feed.xml` provides one complete RSS feed with browser-only category filters from `/feed.xsl`.
- `/404.html` gives lost links a themed route back to the Welcome screen or desktop.

Visitor desktop skins are selected in `/system/` and saved in the browser. New public pages should load `theme-loader.js` before the main stylesheet and `themes.css` after it; Post Studio adds both files to future posts automatically.

The fixed-choice poll below `/now/` uses anonymous shared counters from CounterAPI. Change both its visible month and `data-poll-id` in `now/index.html` when starting a new poll; the new ID creates a fresh result set while preserving older totals.

The four-stamp desktop passport stores progress only in the visitor's browser under `me0wberry_passport_v1`. `passport.js` owns stamp collection, Welcome progress, and the reward postcard; discovery targets use `data-passport-stamp`, while Surprise Me records its stamp from `script.js` before navigating.

Shared JavaScript adds skip navigation, page landmarks, keyboard-operable window controls, and accessible player labels to the desktop shell and historical posts. `tools/check-site.js` also guards image descriptions and embedded-frame titles.

Post pages share `post.css`; Post Studio links new posts to the same file so post formatting stays consistent without copying the stylesheet into every page.
