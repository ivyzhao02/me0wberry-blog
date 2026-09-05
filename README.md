# me0wberry-blog

Personal static site and blog for [me0wberry.com](https://me0wberry.com).

## Local tools

- Create monthly posts with `tools/post-studio/server.js`.
- Refresh the homepage now panel, `/now/`, archive pages, search data, RSS, and shared CSS/JavaScript bundles with `node tools/build-site-data.js`.
- Check local links, generated files, image privacy, browser behavior, themes, mobile controls, and direct-file previews with `pnpm check`.
- Keep the visual appearance and existing interactions unchanged during maintenance unless something is intentionally being fixed.
- The build shown in `/system/` is generated as `v0.<repository commit count>` and advances automatically with the next pending commit.

Post Studio writes posts into `posts/<category>/`, updates the matching `index.json`, stores new gallery images in `images/<category>/`, and refreshes all generated site data automatically. The internal `lately` category name is retained for existing paths, but its visitor-facing name is `now`.

`tools/google-tag.js` owns the site's Google Analytics tag. The build adds it to new visitor-facing HTML files, Post Studio includes it in future posts, and `tools/check-site.js` requires exactly one copy per public page. The local Post Studio interface is intentionally excluded from analytics.

Post Studio's recommended image option converts new JPEG/PNG uploads to quality-90 WebP files no larger than 2560px on the longest edge. Uploaded still images and historically optimized photos have private EXIF/XMP metadata removed; `tools/check-site.js` rejects public images containing GPS coordinates and keeps JPEG, PNG, and WebP assets under 2 MB. GIFs and videos retain their original formats and loading behavior.

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

The fixed-choice poll below `/now/` uses anonymous shared counters from CounterAPI. Its visible month and `data-poll-id` are generated from the latest Now post date, so publishing a new monthly Now entry creates a fresh result set while preserving older totals.

The four-stamp desktop passport stores progress only in the visitor's browser under `me0wberry_passport_v1`. `passport.js` owns stamp collection, Welcome progress, and the reward postcard; discovery targets use `data-passport-stamp`, while Surprise Me records its stamp from `script.js` before navigating.

Shared JavaScript adds skip navigation, page landmarks, keyboard-operable tabs and window controls, focus restoration, dialog behavior, and accessible player labels to the desktop shell and historical posts. `tools/check-site.js` also guards image descriptions and embedded-frame titles.

Post pages share `post.css`; Post Studio links new posts to the same file so post formatting stays consistent without copying the stylesheet into every page.

The maintainable shared styles live in `styles/`, and shared browser behavior lives in `scripts/`. The build joins them into the stable public files `style.css` and `script.js`, so existing page paths and loading order do not change. Category archive pages are generated from `tools/templates/archive-category.html` using `tools/site-config.js`; edit those sources rather than individual files under `archive/<category>/`.
