const assert = require('node:assert/strict');
const test = require('node:test');
const { createHash } = require('node:crypto');
const { securePublicHtml, scriptHashes, ROBOTS_TXT } = require('./site-security');
const { sanitizePostContent, safeImageUrl } = require('./post-studio/content-safety');
const { buildPostHtml } = require('./post-studio/post-generator');
const { sanitizeUploadedImage } = require('./post-studio/server');
const { versionAssetLinks } = require('./public-assets');

test('security metadata is first, idempotent and preserves a UTF-8 declaration', () => {
  const source = '<!doctype html>\r\n<html><head>\r\n<meta charset="UTF-8">\r\n<script>window.test = 1;</script></head><body></body></html>';
  const secured = securePublicHtml(source);
  assert.equal(securePublicHtml(secured), secured);
  assert.match(secured, /<head>\r\n<!-- generated-security:start -->\r\n<meta charset="UTF-8">/);
  assert.equal((secured.match(/<meta charset=/g) || []).length, 1);
  assert.match(secured, /noindex, nofollow, noimageindex, nosnippet/);
  assert.match(secured, /object-src 'none'; base-uri 'none'; form-action 'none'/);
  assert.doesNotMatch(secured, /script-src[^;]*'unsafe-inline'|unsafe-eval|frame-ancestors/);
  assert.match(ROBOTS_TXT, /User-agent: \*\nDisallow: \/\n/);
});

test('script hashes match browser-normalized source and entity-decoded event handlers', () => {
  const source = '<script>\r\nhello();\r\n</script><script src="site.js"></script><button onclick="openPanel(&#39;panel-bio&#39;)">hello</button>';
  const hashed = scriptHashes(source);
  const hash = (value) => `'sha256-${createHash('sha256').update(value).digest('base64')}'`;
  assert.deepEqual(hashed.scripts, [hash('\nhello();\n')]);
  assert.deepEqual(hashed.handlers, [hash("openPanel('panel-bio')")]);
});

test('pasted post HTML cannot introduce executable code, frames, forms or clobbering ids', () => {
  const safe = sanitizePostContent('<script>alert(1)</script><p id="main" onclick="alert(1)">hello <strong>world</strong></p><iframe src="https://example.com"></iframe><form action="https://example.com"><input name="x"></form><svg onload="alert(1)"></svg><img src="x" onerror="alert(1)" alt="photo">');
  assert.match(safe, /<p>hello <strong>world<\/strong><\/p>/);
  assert.doesNotMatch(safe, /script|alert\(|iframe|form|input|svg|onerror|onclick|id="main"/);
  assert.match(safe, /<img src="x" alt="photo" loading="lazy" decoding="async"/);
});

test('sanitization rejects obfuscated executable URLs and unsafe styling, preserving basic formatting', () => {
  for (const href of ['javascript:alert(1)', 'jav&#x61;script:alert(1)', 'java&#10;script:alert(1)', 'data:text/html,test', '//evil.invalid/']) {
    const safe = sanitizePostContent(`<a href="${href}">link</a>`);
    assert.doesNotMatch(safe, /href=/, href);
  }
  const safe = sanitizePostContent('<p class="post-section-label" style="color:#e07090;position:fixed;background-image:url(https://evil.invalid)">hello</p><a href="https://example.com">link</a>');
  assert.match(safe, /class="post-section-label"/);
  assert.match(safe, /color:#e07090/);
  assert.doesNotMatch(safe, /position|background-image|evil.invalid/);
  assert.match(safe, /rel="noopener noreferrer"/);
});

test('post generation rejects unsafe image URLs and escapes attribute delimiters', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,hello', 'file:///private', '//evil.invalid/x', 'https://user:password@example.com/x']) {
    assert.throws(() => safeImageUrl(value), /Image URLs/);
  }
  const page = buildPostHtml({ category: 'games', title: 'test', date: 'November 6, 2026',
    content: '[unsafe](javascript:alert(1))\n\n<p onclick="alert(1)">safe text</p>',
    imageUrl: 'https://example.com/photo"onerror="alert(1)', images: [], lately: {} });
  assert.doesNotMatch(page, /href="javascript:|src="[^"]*"onerror=|<p onclick=/);
  assert.match(page, /photo&quot;onerror=&quot;alert\(1\)/);
});

test('an SVG or HTML file renamed as a GIF is not accepted as an uploaded animation', async () => {
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>');
  await assert.rejects(sanitizeUploadedImage(svg, '.gif'), /does not match/);
  await assert.rejects(sanitizeUploadedImage(Buffer.from('<html>not a gif</html>'), '.gif'));
  const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  assert.deepEqual(await sanitizeUploadedImage(gif, '.gif'), gif);
});

test('shared asset fingerprints update consistently without rewriting external or unrelated resources', () => {
  const versions = new Map([['script.js', '123'], ['archive/search.js', '456']]);
  const source = '<script src="../script.js?v=old"></script><script src="search.js"></script><script src="https://example.com/script.js"></script><link rel="icon" href="../favicon.ico">';
  const versioned = versionAssetLinks(source, 'archive/index.html', versions);
  assert.match(versioned, /src="\.\.\/script.js\?v=123"/);
  assert.match(versioned, /src="search.js\?v=456"/);
  assert.match(versioned, /src="https:\/\/example.com\/script.js"/);
  assert.match(versioned, /href="\.\.\/favicon.ico"/);
  assert.equal(versionAssetLinks(versioned, 'archive/index.html', versions), versioned);
});
