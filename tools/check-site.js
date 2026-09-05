const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { buildSiteData } = require('./build-site-data');
const { googleTagErrors } = require('./google-tag');
const { hasGpsCoordinatesInExif, imageHasGpsCoordinates } = require('./image-metadata');
const { ARCHIVE_CATEGORIES } = require('./site-config');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['.git', 'codex-notes', 'node_modules']);
const MAX_PUBLIC_IMAGE_BYTES = 2 * 1024 * 1024;

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(absolutePath, files);
    else files.push(absolutePath);
  }
  return files;
}

function relativePath(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join('/');
}

const files = walk(ROOT);
const relativeFiles = files.map(relativePath);
const exactFiles = new Set(relativeFiles);
const caseMap = new Map(relativeFiles.map(file => [file.toLowerCase(), file]));
const publicStillFiles = relativeFiles.filter(file =>
  /\.(?:jpe?g|png|webp)$/i.test(file) && !file.startsWith('tools/'));
const errors = [];
const gpsExifFixture = Buffer.from(
  '4d4d002a00000008000188250004000000010000001a00000000000100020005000000030000002c00000000',
  'hex',
);

function normalizeNewlines(value = '') {
  return String(value).replace(/\r\n?/g, '\n');
}

if (!hasGpsCoordinatesInExif(gpsExifFixture)) {
  errors.push('image metadata privacy detector failed its GPS fixture check');
}

function resolveLocalReference(sourceFile, reference) {
  const cleanReference = reference.split(/[?#]/)[0];
  if (!cleanReference || /^(?:https?:|mailto:|tel:|javascript:|data:|#)/i.test(reference)) return null;

  let target = cleanReference.startsWith('/')
    ? cleanReference.slice(1)
    : path.posix.normalize(path.posix.join(path.posix.dirname(sourceFile), cleanReference));

  if (!target) target = 'index.html';
  if (target.endsWith('/')) target += 'index.html';
  if (!path.posix.extname(target) && exactFiles.has(`${target}/index.html`)) target += '/index.html';
  return target;
}

function checkReference(sourceFile, reference) {
  const target = resolveLocalReference(sourceFile, reference);
  if (!target) return;
  if (exactFiles.has(target)) return;

  const caseMatch = caseMap.get(target.toLowerCase());
  if (caseMatch) errors.push(`${sourceFile}: path case mismatch for ${reference} (actual: ${caseMatch})`);
  else errors.push(`${sourceFile}: missing local reference ${reference}`);
}

for (const file of relativeFiles.filter(file => file.endsWith('.html') && !file.startsWith('tools/'))) {
  const rawSource = fs.readFileSync(path.join(ROOT, file), 'utf8');
  for (const error of googleTagErrors(rawSource)) errors.push(`${file}: ${error}`);
  const source = rawSource.replace(/<!--[\s\S]*?-->/g, '');
  const ids = [...source.matchAll(/\bid=["']([^"']+)["']/gi)].map(match => match[1]);
  const seenIds = new Set();

  for (const id of ids) {
    if (seenIds.has(id)) errors.push(`${file}: duplicate id ${id}`);
    seenIds.add(id);
  }

  for (const match of source.matchAll(/\b(?:src|href|data-src)=["']([^"']+)["']/gi)) {
    const reference = match[1];
    const tagStart = source.lastIndexOf('<', match.index);
    const tagEnd = source.indexOf('>', match.index);
    const containingTag = tagStart >= 0 && tagEnd >= 0 ? source.slice(tagStart, tagEnd + 1) : '';
    const isBaseReference = /^<base\b/i.test(containingTag);
    if (reference.startsWith('/') && !reference.startsWith('//') && !isBaseReference) {
      errors.push(`${file}: root-relative local reference ${reference} breaks direct file previews`);
    }
    checkReference(file, reference);
  }

  for (const match of source.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt=["'][^"']*["']/i.test(match[0])) errors.push(`${file}: image is missing alt text`);
  }

  for (const match of source.matchAll(/<iframe\b[^>]*>/gi)) {
    if (!/\btitle=["'][^"']+["']/i.test(match[0])) errors.push(`${file}: iframe is missing a title`);
  }

  if (file.startsWith('posts/')) {
    const postStyleLinks = [...source.matchAll(/<link\b[^>]*href=["']\.\.\/\.\.\/post\.css["'][^>]*>/gi)];
    if (postStyleLinks.length !== 1) errors.push(`${file}: expected exactly one shared post.css link`);
    if (source.includes(':root{--pink:#e07090;')) errors.push(`${file}: still contains the copied legacy post stylesheet`);
    if (source.includes('<div id="panel-player" style="position:fixed;')) errors.push(`${file}: still contains the legacy inline player`);
    if (!source.includes('<aside id="panel-player" aria-label="music player">')) errors.push(`${file}: shared post player is missing`);
    if (!source.includes('class="player-controls"')) errors.push(`${file}: modern post player controls are missing`);
  }

  if (/\b(?:page-back-link|info-home-link|shrine-back-link)\b/.test(source)) {
    errors.push(`${file}: legacy page navigation class is still present`);
  }
}

const archiveTemplateSource = fs.readFileSync(path.join(ROOT, 'tools', 'templates', 'archive-category.html'), 'utf8');
for (const error of googleTagErrors(archiveTemplateSource)) {
  errors.push(`tools/templates/archive-category.html: ${error}`);
}

const requiredPages = new Map([
  ['404.html', 'custom not-found page'],
  ['shrines/index.html', 'shrine'],
  ['shrines/stubby/index.html', 'Stubby shrine'],
  ['shrines/pokemon/index.html', 'Pokémon shrine'],
  ['persona/index.html', 'persona gallery'],
  ['post.css', 'shared post stylesheet'],
  ['style.css', 'generated shared stylesheet'],
  ['script.js', 'generated shared script'],
  ['tools/site-config.js', 'shared category configuration'],
  ['tools/templates/archive-category.html', 'archive category template'],
]);

for (const [file, label] of requiredPages) {
  if (!exactFiles.has(file)) errors.push(`${file}: required ${label} is missing`);
}

const pageNavigationRequirements = new Map([
  ['archive/index.html', 1],
  ...ARCHIVE_CATEGORIES.map(category => [`archive/${category.id}/index.html`, 2]),
  ['info/index.html', 1],
  ['now/index.html', 1],
  ['persona/index.html', 1],
  ['shrines/index.html', 1],
  ['shrines/pokemon/index.html', 1],
  ['shrines/stubby/index.html', 1],
  ['system/index.html', 1],
  ['toybox/index.html', 1],
  ['webgarden/index.html', 1],
]);

for (const [file, expectedLinks] of pageNavigationRequirements) {
  if (!exactFiles.has(file)) continue;
  const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const links = [...source.matchAll(/class=["'][^"']*\bpage-nav-link\b[^"']*["']/gi)];
  if (links.length !== expectedLinks) {
    errors.push(`${file}: expected ${expectedLinks} shared page navigation link${expectedLinks === 1 ? '' : 's'}, found ${links.length}`);
  }
}

for (const file of relativeFiles.filter(file => /^images\/.*\.(?:heic|heif)$/i.test(file))) {
  errors.push(`${file}: HEIC/HEIF photos must be converted to a browser-safe format`);
}

for (const file of publicStillFiles) {
  const size = fs.statSync(path.join(ROOT, file)).size;
  if (size > MAX_PUBLIC_IMAGE_BYTES) {
    errors.push(`${file}: public still image is over 2 MB (use Post Studio optimization or the media tool)`);
  }
}

const mediaReportFile = 'tools/media-optimization-report.json';
if (exactFiles.has(mediaReportFile)) {
  try {
    const report = JSON.parse(fs.readFileSync(path.join(ROOT, mediaReportFile), 'utf8'));
    for (const item of report.files || []) {
      if (exactFiles.has(item.source)) errors.push(`${item.source}: pre-optimization source still exists`);
      if (!exactFiles.has(item.output)) errors.push(`${item.output}: optimized media output is missing`);
      else if (fs.statSync(path.join(ROOT, item.output)).size !== item.optimized_bytes) {
        errors.push(`${item.output}: optimized media size no longer matches the verification report`);
      }
    }
  } catch (error) {
    errors.push(`${mediaReportFile}: invalid media verification report (${error.message})`);
  }
}

for (const file of relativeFiles.filter(file => file.endsWith('.css') && !file.startsWith('tools/') && !file.startsWith('styles/'))) {
  const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
  for (const match of source.matchAll(/url\(["']?([^"')]+)["']?\)/gi)) {
    checkReference(file, match[1]);
  }
}

for (const file of relativeFiles.filter(file => file.endsWith('.json'))) {
  try {
    JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
  } catch (error) {
    errors.push(`${file}: invalid JSON (${error.message})`);
  }
}

for (const file of relativeFiles.filter(file => file.endsWith('.js'))) {
  const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
  if (!file.startsWith('tools/') && /fetch\s*\(\s*[`"']\//.test(source)) {
    errors.push(`${file}: root-relative fetch breaks direct file previews`);
  }
  const result = spawnSync(process.execPath, ['--check', path.join(ROOT, file)], { encoding: 'utf8' });
  if (result.status !== 0) errors.push(`${file}: invalid JavaScript\n${result.stderr.trim()}`);
}

try {
  for (const output of buildSiteData({ write: false })) {
    const filePath = path.join(ROOT, output.file);
    if (!fs.existsSync(filePath)) {
      errors.push(`${output.file}: generated file is missing (run node tools/build-site-data.js)`);
    } else if (normalizeNewlines(fs.readFileSync(filePath, 'utf8')) !== normalizeNewlines(output.contents)) {
      errors.push(`${output.file}: generated content is stale (run node tools/build-site-data.js)`);
    }
  }
} catch (error) {
  errors.push(`generated site data could not be checked (${error.message})`);
}

async function checkImagePrivacy() {
  const metadataErrors = [];
  const batchSize = 16;

  for (let index = 0; index < publicStillFiles.length; index += batchSize) {
    const batch = publicStillFiles.slice(index, index + batchSize);
    await Promise.all(batch.map(async (file) => {
      try {
        if (await imageHasGpsCoordinates(path.join(ROOT, file))) {
          metadataErrors.push(file + ': public image contains GPS location metadata');
        }
      } catch (error) {
        metadataErrors.push(file + ': image metadata could not be inspected (' + error.message + ')');
      }
    }));
  }

  errors.push(...metadataErrors.sort());
}

checkImagePrivacy().then(() => {
  if (errors.length) {
    console.error(`site check found ${errors.length} problem${errors.length === 1 ? '' : 's'}:\n`);
    console.error(errors.map(error => `- ${error}`).join('\n'));
    process.exitCode = 1;
  } else {
    console.log(`site check passed: ${relativeFiles.filter(file => file.endsWith('.html')).length} HTML pages, ${relativeFiles.filter(file => file.endsWith('.json')).length} JSON indexes, and ${relativeFiles.filter(file => file.endsWith('.js')).length} scripts checked.`);
  }
}).catch((error) => {
  console.error(`site check could not finish (${error.message})`);
  process.exitCode = 1;
});
