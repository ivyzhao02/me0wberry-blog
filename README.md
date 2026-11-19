# me0wberry-blog

Personal static site and blog for [me0wberry.com](https://me0wberry.com).

## Planning and handover

The private `me0wberry` Google Drive folder holds the ongoing `me0wberry - Living Roadmap & Decisions` and `me0wberry - Independent Maintenance & Recovery Handbook` documents. The roadmap is the primary home for priorities, future ideas, and decisions; the handbook covers independent editing, testing, publishing, troubleshooting, and recovery. Keep the private gift ledger separate. `FUTURE.md` is a short pointer, not a second active checklist.

Update those existing documents as plans or procedures change rather than adding local-only planning files. Keep the technical instructions in this README, `SECURITY.md`, and the Post Studio README current with the code; update the handbook when those procedures change. Drive and Git do not synchronize automatically. Do not add private document links, unreleased plans, or gift details to this public repository.

## Local tools

- Create monthly posts with `tools/post-studio/server.js`.
- Refresh the homepage now panel, `/now/`, archive pages, search data, RSS, and shared CSS/JavaScript bundles with `node tools/build-site-data.js`.
- Check local links, generated files, image privacy, browser behavior, themes, mobile controls, and direct-file previews with `pnpm check`.
- Keep the visual appearance and existing interactions unchanged during maintenance unless something is intentionally being fixed.
- The build shown in `/system/` is generated as `v0.<repository commit count>` and advances automatically with the next pending commit.

Post Studio writes posts into `posts/<category>/`, updates the matching `index.json`, stores new gallery images in `images/<category>/`, and refreshes all generated site data automatically. The internal `lately` category name is retained for existing paths, but its visitor-facing name is `now`.

`tools/google-tag.js` owns the site's Google Analytics tag. The build adds it to new visitor-facing HTML files, Post Studio includes it in future posts, and `tools/check-site.js` requires exactly one copy per public page. The local Post Studio interface is intentionally excluded from analytics.

Post Studio's recommended image option converts new JPEG/PNG/WebP uploads to quality-84 WebP files no larger than 1920px on the longest edge. Uploaded still images and historically optimized photos have private EXIF/XMP metadata removed; `tools/check-site.js` rejects public images containing GPS coordinates and keeps JPEG, PNG, and WebP assets under 2 MB. GIFs and videos retain their original formats and loading behavior.

## Public pages

- `/welcome/` is the first-visit entrance into the desktop; the root URL remains the desktop itself.
- `/info/` is the me0wberry profile, social links, commissioned-art space, projects page, and visible resource shelf.
- `/persona/` is the growing gallery for commissioned art of me0wberry, with artist credit beside every piece.
- `/system/` holds the colophon, themes, credits, site map, old-version notes, and changelog.
- `/webgarden/` holds saved handmade sites, the growing button shelf, and Surprise Me.
- `/toybox/` keeps its stable address while appearing to visitors as Trinkets; it holds copyable kaomoji, saved graphics, and desktop resources.
- `/shrines/` is the entrance to growing subject rooms; Stubby, Stuffies, Pokémon, Warframe, League of Legends, and Splatoon are currently in the public roster. The Stuffies room is an intentionally text-only work in progress until its first whole-collection photo update. Sanrio remains a direct-preview draft until its room is ready for the public roster.
- `/archive/` provides category browsing and keyword search; `/rss/` is the browser-friendly reader, while `/feed.xml` remains the complete subscription feed with a fallback view from `/feed.xsl`.
- `/404.html` gives lost links a themed route back to the Welcome screen or desktop.

Visitor desktop skins are selected in `/system/` and saved in the browser. New public pages should load `theme-loader.js` before the main stylesheet and `themes.css` after it; Post Studio adds both files to future posts automatically.

The fixed-choice poll below `/now/` uses anonymous shared counters from CounterAPI. Its visible month and `data-poll-id` are generated from the latest Now post date, so publishing a new monthly Now entry creates a fresh result set while preserving older totals.

The four-stamp desktop passport stores progress only in the visitor's browser under `me0wberry_passport_v1`. `passport.js` owns stamp collection, Welcome progress, and the reward postcard; discovery targets use `data-passport-stamp`, while Surprise Me records its stamp from `script.js` before navigating.

Shared JavaScript adds skip navigation, page landmarks, keyboard-operable tabs and window controls, focus restoration, dialog behavior, and accessible player labels to the desktop shell and historical posts. `tools/check-site.js` also guards image descriptions and embedded-frame titles.

Post pages share `post.css`; Post Studio links new posts to the same file so post formatting stays consistent without copying the stylesheet into every page.

The maintainable shared styles live in `styles/`, and shared browser behavior lives in `scripts/`. The build joins them into the stable public files `style.css` and `script.js`, so existing page paths and loading order do not change. Category archive pages are generated from `tools/templates/archive-category.html` using `tools/site-config.js`; edit those sources rather than individual files under `archive/<category>/`.

## Security maintenance

`SECURITY.md` records the current review, threat boundaries, and follow-up work. `tools/site-security.js` generates per-page CSP hashes, no-referrer/noindex metadata, and robots.txt through the normal build; it runs after generated content is assembled. Do not edit those marked metadata blocks manually. The build also fingerprints the shared CSS/JavaScript and archive-script queries through `tools/public-assets.js`, so policy updates cannot be paired with stale pre-refactor bundles. `scripts/02-post-links.js` owns internal post-link validation. Post Studio's `content-safety.js` uses a maintained HTML sanitizer for future authoring content; basic Markdown/HTML remains supported, but executable content and unsafe URL schemes do not.

Run `pnpm check:security` for security regressions and a current dependency audit, and keep running the complete `pnpm check` before publishing. Crawling preferences are cooperative only; public pages, media, feeds, and the public repository are not private. Development documentation and authoring tools are excluded from the Pages deployment.

## Gift drawer

`data/gift-shelf.json` contains only public gift batches. A sealed batch accepts only an opaque id, state, reveal timestamp and anonymous item-type quantities. Keep all recipients, identities, product codes, links and media in private notes outside the repository until publication is approved. `tools/gift-shelf.js` generates the marked gift drawer in the Pokemon shrine during the normal build; it rejects identity-bearing fields in sealed batches and rejects revealed batches before their approved instant.

A passing date never reveals browser data. A separately confirmed publication task must retrieve the private record on or after the chosen time, add the approved recipient and items to the public batch, and run the build, checks and deployment. A planned reveal date is not proof that a publication task is active or that a gift has been delivered. Future sealed batches use the same anonymous schema; do not put private details into fixtures, HTML comments, generated files or public history.

## Persona artwork

`persona/collection.json` contains only finished, approved, publicly displayable artwork. Add a work with a unique stable `id`, title, kind, view description, `YYYY-MM` date, description, local `images/persona/` file, real image dimensions, descriptive alt text, artist name, and optional HTTPS artist/showcase URLs. Set `featured` to the published work to highlight, then run `pnpm build` and `pnpm check`. The build writes the featured card and collection index into the marked region of `persona/index.html`; edit the manifest rather than that generated region. A new piece needs no new HTML or JavaScript.

`persona/persona.js` enhances the generated image links with a native dialog, fit/actual-size controls, keyboard dismissal, and focus restoration. The full image and artist credit remain available without JavaScript and in direct-file previews. Keep originals intact and never place commission briefs, pending artwork, or private planning details in the manifest. The private living roadmap tracks asset-dependent gallery and mascot work.

## Trinket credits

`toybox/luna-town-data.js` records each selected graphic's exact Luna Town item URL, author when explicitly listed, source links, original local file, and preview. `selection` preserves the supplied screenshot page and one-based item position; later batches also include their category and date. Before adding a batch, compare both file hashes and decoded previews against existing graphics and the rest of the batch, since resized and re-encoded copies can be duplicates too. Do not promote a source collector into an author credit or guess missing makers. Assets and first-frame thumbnails live in `images/trinkets/luna-town/`.

`toybox/luna-town.js` renders compact category shelves with one opening hint per collection. `toybox/animations.js` owns the GIF switch for all Trinkets collections, including older 88x31 buttons, blinkies, and adopted pixels. Animation defaults on unless reduced motion is requested, and an explicit on/off choice is remembered in `me0wberry_trinket_animations`. The three flash-warning dividers always remain still previews. `toybox/trinket-motion-data.js` maps animated originals to first-frame alternatives; add a matching still when collecting a new animation. Other still previews live in `images/trinkets/stills/`.

`scripts/26-credits.js` owns the hoverable, dismissible credit bubble, including the existing cursor credits in System. Known makers and collection sources remain separate. Per Ivy's attribution, non-Luna kaomoji link to Emoji Combos; the faces themselves and their copy behavior are unchanged.

Trinkets and System use matching versioned asset queries so cached shared files cannot break newly published controls. The build now updates shared bundle versions automatically. Continue advancing trinket-specific standalone-script queries together when those files change, including when publishing multiple updates on the same day.
