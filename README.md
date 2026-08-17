# me0wberry-blog

Personal static site and blog for [me0wberry.com](https://me0wberry.com).

## Local tools

- Create monthly posts with `tools/post-studio/server.js`.
- Check local links, image paths, JSON indexes, duplicate IDs, and JavaScript syntax with `node tools/check-site.js`.
- Keep the visual appearance and existing interactions unchanged during maintenance unless something is intentionally being fixed.

Post Studio writes posts into `posts/<category>/`, updates the matching `index.json`, and stores new gallery images in `images/<category>/`.
