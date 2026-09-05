const fs = require('fs');
const path = require('path');

const MEASUREMENT_ID = 'G-2R8SRC1EFS';
const GOOGLE_TAG_SNIPPET = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${MEASUREMENT_ID}');
</script>`;
const SKIP_DIRECTORIES = new Set(['.git', 'codex-notes', 'node_modules', 'tools']);

function normalizeNewlines(value = '') {
  return String(value).replace(/\r\n?/g, '\n');
}

function matches(source, pattern) {
  return [...String(source).matchAll(pattern)];
}

function inspectGoogleTag(source) {
  const normalized = normalizeNewlines(source);
  return {
    canonicalCount: normalized.split(GOOGLE_TAG_SNIPPET).length - 1,
    markerCount: matches(source, /<!--\s*Google tag \(gtag\.js\)\s*-->/gi).length,
    loaderIds: matches(
      source,
      /https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=([^"'&\s>]+)/gi,
    ).map((match) => match[1]),
    configIds: matches(
      source,
      /\bgtag\s*\(\s*['"]config['"]\s*,\s*['"]([^'"]+)['"]/gi,
    ).map((match) => match[1]),
  };
}

function googleTagErrors(source) {
  const details = inspectGoogleTag(source);
  const errors = [];

  if (details.canonicalCount !== 1) {
    errors.push(`expected exactly one canonical Google tag, found ${details.canonicalCount}`);
  }
  if (details.markerCount !== 1) {
    errors.push(`expected exactly one Google tag marker, found ${details.markerCount}`);
  }
  if (details.loaderIds.length !== 1 || details.loaderIds[0] !== MEASUREMENT_ID) {
    errors.push(`expected one Google tag loader for ${MEASUREMENT_ID}`);
  }
  if (details.configIds.length !== 1 || details.configIds[0] !== MEASUREMENT_ID) {
    errors.push(`expected one Google tag config for ${MEASUREMENT_ID}`);
  }

  return errors;
}

function addGoogleTag(source, fileName = 'HTML document') {
  const details = inspectGoogleTag(source);
  const existingPieces = details.markerCount + details.loaderIds.length + details.configIds.length;

  if (existingPieces) {
    const errors = googleTagErrors(source);
    if (errors.length) throw new Error(`${fileName}: ${errors.join('; ')}`);
    return source;
  }

  const head = /<head\b[^>]*>/i.exec(source);
  if (!head) throw new Error(`${fileName}: missing <head> element for Google tag insertion`);

  const newline = source.includes('\r\n') ? '\r\n' : '\n';
  const snippet = GOOGLE_TAG_SNIPPET.replace(/\n/g, newline);
  const insertAt = head.index + head[0].length;
  const remainder = source.slice(insertAt);
  const trailingNewline = remainder.startsWith('\r\n') || remainder.startsWith('\n') ? '' : newline;

  return `${source.slice(0, insertAt)}${newline}${snippet}${trailingNewline}${remainder}`;
}

function listPublicHtmlFiles(root) {
  const files = [];

  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && SKIP_DIRECTORIES.has(entry.name)) continue;
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(absolutePath);
      else if (entry.name.toLowerCase().endsWith('.html')) files.push(absolutePath);
    }
  }

  walk(root);
  return files.sort();
}

function tagPublicHtmlFiles(root, { write = true } = {}) {
  const files = listPublicHtmlFiles(root);
  const changed = [];
  const updates = [];

  for (const filePath of files) {
    const relativeFile = path.relative(root, filePath).split(path.sep).join('/');
    const source = fs.readFileSync(filePath, 'utf8');
    const tagged = addGoogleTag(source, relativeFile);
    if (tagged === source) continue;
    changed.push(relativeFile);
    updates.push({ filePath, tagged });
  }

  if (write) updates.forEach(({ filePath, tagged }) => fs.writeFileSync(filePath, tagged, 'utf8'));

  return { files: files.map((file) => path.relative(root, file).split(path.sep).join('/')), changed };
}

module.exports = {
  GOOGLE_TAG_SNIPPET,
  MEASUREMENT_ID,
  addGoogleTag,
  googleTagErrors,
  inspectGoogleTag,
  listPublicHtmlFiles,
  tagPublicHtmlFiles,
};
