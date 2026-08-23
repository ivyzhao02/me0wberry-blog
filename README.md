# me0wberry-blog

Personal static site and blog for [me0wberry.com](https://me0wberry.com).

## Local tools

- Create monthly posts with `tools/post-studio/server.js`.
- Refresh the homepage now panel, `/now/`, the archive search index, and RSS with `node tools/build-site-data.js`.
- Check local links, image paths, JSON indexes, duplicate IDs, and JavaScript syntax with `node tools/check-site.js`.
- Keep the visual appearance and existing interactions unchanged during maintenance unless something is intentionally being fixed.
- Bump the build shown in `/system/` with every published commit. The format is `v0.<repository commit count>`, so this pass targets `v0.211`.

Post Studio writes posts into `posts/<category>/`, updates the matching `index.json`, stores new gallery images in `images/<category>/`, and refreshes all generated site data automatically. The internal `lately` category name is retained for existing paths, but its visitor-facing name is `now`.

## Public pages

- `/welcome/` is the first-visit entrance into the desktop; the root URL remains the desktop itself.
- `/info/` is the me0wberry profile, social links, commissioned-art space, projects page, and visible resource shelf.
- `/system/` holds the colophon, themes, credits, site map, old-version notes, and changelog.
- `/webgarden/` holds saved handmade sites, the growing button shelf, and Surprise Me.
- `/toybox/` keeps its stable address while appearing to visitors as Trinkets; it holds copyable kaomoji, saved graphics, and desktop resources.
- `/shrines/` is the entrance to growing subject rooms; Stubby and Pokémon are the first two.
- `/archive/` provides category browsing and keyword search; `/feed.xml` provides the RSS feed with a browser-friendly view from `/feed.xsl`.
- `/404.html` gives lost links a themed route back to the Welcome screen or desktop.

Visitor desktop skins are selected in `/system/` and saved in the browser. New public pages should load `theme-loader.js` before the main stylesheet and `themes.css` after it; Post Studio adds both files to future posts automatically.

Shared JavaScript adds skip navigation, page landmarks, keyboard-operable window controls, and accessible player labels to the desktop shell and historical posts. `tools/check-site.js` also guards image descriptions and embedded-frame titles.
