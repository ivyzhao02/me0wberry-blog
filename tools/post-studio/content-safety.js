const sanitizeHtml = require('sanitize-html');

function safeImageUrl(value) {
  const source = String(value || '').trim();
  if (!source) return '';
  let url;
  try { url = new URL(source, 'https://me0wberry.com/'); } catch { /* Reject below. */ }
  if (!url || !['https:', 'http:'].includes(url.protocol) || url.username || url.password
    || source.startsWith('//') || /[\u0000-\u001f\u007f\\]/.test(source)) {
    throw new Error('Image URLs must use HTTP(S) or a relative site path.');
  }
  return source;
}

function sanitizePostContent(html) {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'del', 's']),
    allowedAttributes: {
      '*': ['title', 'lang', 'style'],
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'loading', 'decoding'],
      ol: ['start'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan', 'scope'],
    },
    allowedClasses: { '*': ['post-*', 'copy-kaomoji', 'heading-flourish'] },
    allowedStyles: {
      '*': {
        color: [/^#[0-9a-f]{3,8}$/i, /^var\(--(?:pink|heading|body|muted|green)\)$/],
        'text-align': [/^(?:left|center|right)$/],
        'font-weight': [/^(?:normal|bold|[1-9]00)$/],
        'font-style': [/^(?:normal|italic)$/],
        'text-decoration': [/^(?:none|underline|line-through)$/],
      },
    },
    allowedSchemes: ['https', 'http', 'mailto'],
    allowedSchemesByTag: { img: ['https', 'http'] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attributes) => ({
        tagName,
        attribs: { ...attributes, target: '_blank', rel: 'noopener noreferrer' },
      }),
      img: (tagName, attributes) => ({
        tagName,
        attribs: { ...attributes, loading: 'lazy', decoding: 'async' },
      }),
    },
  });
}

module.exports = { safeImageUrl, sanitizePostContent };
