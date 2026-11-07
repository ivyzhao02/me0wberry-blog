const { createHash } = require('node:crypto');
const { Parser } = require('htmlparser2');

const START = '<!-- generated-security:start -->';
const END = '<!-- generated-security:end -->';
const ROBOTS = 'noindex, nofollow, noimageindex, nosnippet';
const ROBOTS_TXT = '# Requests for cooperative crawlers only; this is not access control.\nUser-agent: *\nDisallow: /\n';

function hash(value) {
  return `'sha256-${createHash('sha256').update(value).digest('base64')}'`;
}

function scriptHashes(source) {
  const scripts = new Set();
  const handlers = new Set();
  let inlineScript = null;
  const parser = new Parser({
    onopentag(name, attributes) {
      for (const [key, value] of Object.entries(attributes)) {
        if (/^on[a-z]+$/.test(key)) handlers.add(hash(value));
      }
      if (name === 'script' && !attributes.src
        && (!attributes.type || /^(?:text|application)\/javascript$/.test(attributes.type))) inlineScript = '';
    },
    ontext(value) { if (inlineScript !== null) inlineScript += value; },
    onclosetag(name) {
      if (name !== 'script' || inlineScript === null) return;
      if (inlineScript.trim()) scripts.add(hash(inlineScript));
      inlineScript = null;
    },
  });
  // HTML parsing normalizes line endings before a browser checks an inline hash.
  parser.end(source.replace(/\r\n?/g, '\n'));
  return { scripts: [...scripts].sort(), handlers: [...handlers].sort() };
}

function contentSecurityPolicy(source) {
  const { scripts, handlers } = scriptHashes(source);
  return [
    "default-src 'self'",
    `script-src 'self' https://www.googletagmanager.com/gtag/js ${scripts.join(' ')}`.trim(),
    `script-src-attr ${handlers.length ? "'unsafe-hashes' " + handlers.join(' ') : "'none'"}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "media-src 'self'",
    "connect-src 'self' https://counterapi.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://www.googletagmanager.com https://www.google.com",
    "frame-src 'self' https://me0wberry.com/gifypet/ https://gamer2810.github.io/steam-miniprofile/ https://open.spotify.com/embed/",
    "object-src 'none'",
    /<base\b/i.test(source) ? "base-uri 'self'" : "base-uri 'none'",
    "form-action 'none'",
    "worker-src 'none'",
  ].join('; ');
}

function securePublicHtml(source) {
  const newline = source.includes('\r\n') ? '\r\n' : '\n';
  const clean = source
    .replace(/\s*<!-- generated-security:start -->[\s\S]*?<!-- generated-security:end -->/g, '')
    .replace(/\s*<meta\b[^>]*\bcharset\s*=\s*["']?utf-8["']?\s*\/?\s*>/gi, '');
  const policy = contentSecurityPolicy(clean).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const block = [START, '<meta charset="UTF-8">',
    `<meta http-equiv="Content-Security-Policy" content="${policy}">`,
    '<meta name="referrer" content="no-referrer">',
    `<meta name="robots" content="${ROBOTS}">`, END].join(newline);
  if (!/<head\b[^>]*>/i.test(clean)) throw new Error('Missing head for security metadata.');
  return clean.replace(/<head\b[^>]*>/i, (head) => `${head}${newline}${block}`);
}

module.exports = { contentSecurityPolicy, ROBOTS, ROBOTS_TXT, scriptHashes, securePublicHtml };
