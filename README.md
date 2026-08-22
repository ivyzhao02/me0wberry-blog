# me0wberry-blog

Personal static site and blog for [me0wberry.com](https://me0wberry.com).

## Local tools

- Create monthly posts with `tools/post-studio/server.js`.
- Refresh the homepage now panel, `/now/`, the archive search index, and RSS with `node tools/build-site-data.js`.
- Check local links, image paths, JSON indexes, duplicate IDs, and JavaScript syntax with `node tools/check-site.js`.
- Keep the visual appearance and existing interactions unchanged during maintenance unless something is intentionally being fixed.

Post Studio writes posts into `posts/<category>/`, updates the matching `index.json`, stores new gallery images in `images/<category>/`, and refreshes all generated site data automatically. The internal `lately` category name is retained for existing paths, but its visitor-facing name is `now`.

## Public pages

- `/info/` is the me0wberry profile, social links, commissioned-art space, and projects page.
- `/system/` holds the colophon, credits, resources, old-version notes, and changelog.
- `/archive/` provides category browsing and keyword search; `/feed.xml` provides the RSS feed.
