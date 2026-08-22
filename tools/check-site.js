const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { buildSiteData } = require('./build-site-data');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['.git', 'codex-notes']);

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
    checkReference(file, match[1]);
  }
}

for (const file of relativeFiles.filter(file => file.endsWith('.css') && !file.startsWith('tools/'))) {
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
