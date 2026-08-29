const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { buildSiteData } = require('./build-site-data');

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
const errors = [];

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
  const source = fs.readFileSync(path.join(ROOT, file), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const ids = [...source.matchAll(/\bid=["']([^"']+)["']/gi)].map(match => match[1]);
  const seenIds = new Set();

  for (const id of ids) {
    if (seenIds.has(id)) errors.push(`${file}: duplicate id ${id}`);
    seenIds.add(id);
  }

  for (const match of source.matchAll(/\b(?:src|href|data-src)=["']([^"']+)["']/gi)) {
    const reference = match[1];
    if (reference.startsWith('/') && !reference.startsWith('//')) {
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

for (const file of relativeFiles.filter(file => /^images\/.*\.(?:heic|heif)$/i.test(file))) {
  errors.push(`${file}: HEIC/HEIF photos must be converted to a browser-safe format`);
}

for (const file of relativeFiles.filter(file => /^images\/.*\.(?:jpe?g|png|webp)$/i.test(file))) {
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
    } else if (fs.readFileSync(filePath, 'utf8') !== output.contents) {
      errors.push(`${output.file}: generated content is stale (run node tools/build-site-data.js)`);
    }
  }
} catch (error) {
  errors.push(`generated site data could not be checked (${error.message})`);
}

if (errors.length) {
  console.error(`site check found ${errors.length} problem${errors.length === 1 ? '' : 's'}:\n`);
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`site check passed: ${relativeFiles.filter(file => file.endsWith('.html')).length} HTML pages, ${relativeFiles.filter(file => file.endsWith('.json')).length} JSON indexes, and ${relativeFiles.filter(file => file.endsWith('.js')).length} scripts checked.`);
}
