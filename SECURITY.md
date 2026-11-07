# Security and Privacy Maintenance

Reviewed: November 6, 2026. This is a scoped source, dependency, and browser review, not a penetration-test certification or a guarantee that every possible issue has been found.

## Architecture and Findings

- The public site is static HTML, CSS, JavaScript, and media on GitHub Pages. There is no public authoring endpoint, account system, visitor upload service, or database to compromise through a form.
- Archive search already rendered query text through `textContent`; malicious search text was not an identified injection path. Other inputs include URL parameters, downloaded post indexes, third-party code, and pasted authoring content, not just text fields.
- Home and archive post lists formerly interpolated index titles and destinations into HTML. They now create DOM nodes, render text as text, and accept only known internal post paths. Shared shrine post loading uses the same link validation.
- Post Studio previously allowed unrestricted HTML blocks and did not escape its optional image URL. New posts now sanitize basic formatting, reject executable link/image schemes, and escape image attributes. Existing published post bodies are not rewritten by the sanitizer.
- Post Studio remains bound to loopback with a random per-session token, strict Host and Origin checks, JSON-only writes, no CORS permission, no caching, and framing protection. It now also sends a restrictive CSP, validates the actual format of uploaded images including GIFs, and rejects overlapping authoring writes.
- A dependency audit reported no known advisories on this review date. Re-run `pnpm check:security` rather than relying on this dated result.

## Generated Browser Policy

`tools/site-security.js` owns crawler/referrer metadata and the per-page Content Security Policy. `pnpm build` applies it to all public HTML after generating page content. `pnpm check` rejects stale generated policies; new Post Studio pages get the same protection through the existing build.

Shared bundles and archive scripts receive automatic content-fingerprint queries, keeping newly generated policies paired with the intended code rather than cached legacy handlers.

- Arbitrary inline JavaScript and `eval` are not allowed. Inline scripts are identified by exact SHA-256 hashes. Existing inline controls use separately hashed event-handler allowances, not a blanket `unsafe-inline` script permission. Do not add untrusted markup before hashing; hashing authenticates reviewed source, it does not sanitize it.
- Scripts may load from this site and the existing Google Analytics loader only. Fonts, the existing Steam/Spotify frames, and anonymous CounterAPI requests have explicit destinations. External images remain allowed over HTTPS to preserve collected graphics; they are not allowed to execute as scripts. The Steam and Spotify frames are sandboxed without parent-navigation permission.
- Plugin objects, workers, and public form submissions are disabled. Base URLs are disabled except on the 404 page, where a same-origin base is needed for nested missing routes.
- Styles still allow inline declarations to preserve the existing desktop and themes. Future work can remove inline handlers and eventually simplify the policy, without a framework migration.
- Referrers are suppressed. Existing analytics and embeds still contact their third-party providers; this review does not make those services private or trusted beyond their necessary roles.

GitHub Pages currently serves the site without configurable per-site security response headers in this repository's deployment. A meta CSP cannot enforce `frame-ancestors`, HSTS, Permissions-Policy, or an `X-Robots-Tag` for raw media/feed responses. Do not put fake header equivalents in HTML or claim they work. Stronger response-header and edge controls require a separately approved hosting/proxy change.

## Crawling and Public Content

Ivy chose to discourage all crawlers, including ordinary search engines. `robots.txt` requests no crawling anywhere; HTML also requests `noindex`, `nofollow`, `noimageindex`, and `nosnippet` if fetched. These are cooperative requests, not authentication, a firewall, or reliable protection from scraping.

A crawler blocked by robots.txt may not fetch an HTML page to see its noindex instruction. Existing search listings may therefore persist; removal of old results may require search-engine removal tools or a deliberate period of allowing crawling with noindex. No automatic de-indexing is promised.

Public HTML, images, audio, feeds, and the browser search index remain downloadable. The public GitHub repository and its history also remain copyable. Excluding development files from Pages deployment reduces the hosted surface, not their visibility in a public repository. Do not put private material into either place. Right-click blocks, hidden source URLs, and obfuscation are not security controls and are intentionally absent.

For stronger practical bot resistance, evaluate an edge proxy with rate limits, bot rules, challenge exceptions, and response headers. That decision needs DNS/account access and testing for ordinary visitors, accessibility, RSS, shared webgarden content, and direct image links. A login/access gate is necessary for content that must actually be private.

## Follow-Up Refactoring

Keep the static architecture. The useful future work is incremental: shared desktop-chrome templates to reduce repeated HTML, removing remaining inline event attributes in favor of listeners, and splitting the large browser suite into feature groups. Preserve stable URLs, no-JavaScript reading, direct-file previews, all four themes, and current content while doing that work.

## Verification and Maintenance

- `pnpm build` refreshes bundles, generated pages, security metadata, and robots.txt.
- `pnpm check` runs static checks, authoring/sanitization tests, and functional desktop/mobile browser tests. Public-page smoke tests also report CSP violations.
- `pnpm check:security` runs focused security regressions and a current dependency audit.
- Before publishing, exercise injected scripts/handlers and malicious metadata in a local browser, check direct-file previews, and verify the deployed policy. Review new third-party script/embed destinations rather than broadly allowing all HTTPS scripts.
- Keep deployment protected through the GitHub account: use MFA or a passkey, minimal app/token permissions, and branch/deployment protections where available. Account settings were not changed or audited in this review.

Primary references: [MDN CSP guidance](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/CSP), [MDN meta-policy limitations](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP), [Google robots.txt limitations](https://developers.google.com/search/docs/crawling-indexing/robots/intro), [Google robots metadata](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag), and [sanitize-html options](https://github.com/apostrophecms/sanitize-html).
