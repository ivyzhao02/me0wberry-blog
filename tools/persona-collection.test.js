const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const { renderCollection, validateCollection } = require('./persona-collection');
const published = require('../persona/collection.json');

const fixture = () => ({ featured: 'minecraft-skin', works: [structuredClone(published.works.find((work) => work.id === 'minecraft-skin'))] });

test('published Persona artwork validates and includes its credit in static HTML', () => {
  const html = renderCollection(published, path.resolve(__dirname, '..'));
  assert.ok(html.includes(`collection folder / ${published.works.length} pieces`));
  assert.match(html, /art by <a class="persona-artist"/);
  assert.match(html, /href="\.\.\/images\/persona\/me0wberry-minecraft-skin-yoursleepywitch.webp"/);
  assert.match(html, /width="960" height="540"/);
  assert.match(html, /datetime="2026-07">july 2026/);
  assert.match(html, /persona-piece-card--wide/);
  assert.match(html, /kailynvrse/);
});

test('the reference sheet is an optimized, uncropped export without private image metadata', async () => {
  const sharp = require('sharp');
  const fs = require('node:fs');
  const work = published.works.find((entry) => entry.id === 'character-reference');
  const file = path.resolve(__dirname, '..', work.image);
  const metadata = await sharp(file).metadata();
  assert.equal(metadata.width, work.width);
  assert.equal(metadata.height, work.height);
  assert.equal(metadata.width / metadata.height, 9000 / 3150);
  assert.ok(fs.statSync(file).size < 2 * 1024 * 1024);
  assert.equal(metadata.exif, undefined);
  assert.equal(metadata.icc, undefined);
  assert.equal(work.artist.url, 'https://www.instagram.com/kailynvrse');
});

test('the approved portrait and bonus exports preserve transparency and adjacent credit', async () => {
  const sharp = require('sharp');
  const html = renderCollection(published, path.resolve(__dirname, '..'));
  for (const id of ['full-body', 'bonus-doodle']) {
    const work = published.works.find((entry) => entry.id === id);
    const metadata = await sharp(path.resolve(__dirname, '..', work.image)).metadata();
    assert.equal(metadata.width, work.width);
    assert.equal(metadata.height, work.height);
    assert.equal(metadata.hasAlpha, true);
    assert.equal(metadata.exif, undefined);
    assert.equal(metadata.icc, undefined);
    assert.equal(work.artist.name, 'kailynvrse');
    const card = html.slice(html.indexOf(`id="work-${id}"`)).split('</li>')[0];
    assert.match(card, /art by <a class="persona-artist" href="https:\/\/www.instagram.com\/kailynvrse"/);
  }
});

test('the private reference teaser contains colour only, not a readable sheet or access link', async () => {
  const fs = require('node:fs');
  const sharp = require('sharp');
  const file = path.resolve(__dirname, '../images/persona/me0wberry-private-reference-frosted.webp');
  const metadata = await sharp(file).metadata();
  assert.equal(metadata.width, 520);
  assert.equal(metadata.height, 200);
  assert.equal(metadata.hasAlpha, false);
  assert.equal(metadata.exif, undefined);
  assert.equal(metadata.icc, undefined);
  assert.ok(fs.statSync(file).size < 4096);
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const rowSize = info.width * info.channels;
  const firstRow = data.subarray(0, rowSize);
  for (let row = 1; row < info.height; row += 1) {
    assert.deepEqual(data.subarray(row * rowSize, (row + 1) * rowSize), firstRow, 'no vertical drawing detail may survive in the public colour field');
  }
  assert.ok(!published.works.some((work) => /tattoo|private-reference/.test(work.id + work.image)));
  const page = fs.readFileSync(path.resolve(__dirname, '../persona/index.html'), 'utf8');
  const section = /<section class="persona-private-shelf"[\s\S]*?<\/section>/.exec(page)?.[0];
  assert.ok(section);
  assert.match(section, /private-reference-frosted\.webp/);
  assert.match(section, /info\/index\.html#find-me-title/);
  assert.doesNotMatch(section, /data-persona-open|drive\.google\.com|data-src=|srcset=|\.png/);
});

test('new portrait or square pieces can be added without changing the page', () => {
  const collection = fixture();
  collection.works.push({ ...collection.works[0], id: 'portrait', title: 'portrait', width: 600, height: 900 });
  collection.featured = 'portrait';
  const html = renderCollection(collection);
  assert.match(html, /collection folder \/ 2 pieces/);
  assert.match(html, /class="persona-piece-title">portrait/);
  assert.match(html, /id="work-minecraft-skin"/);
  assert.match(html, /id="work-portrait"/);
  assert.match(html, /width="600" height="900"/);
});

test('text and attributes are escaped rather than interpreted as markup', () => {
  const collection = fixture();
  collection.works[0].title = '<script>"art" & more</script>';
  collection.works[0].description = '" onmouseover="alert(1)';
  collection.works[0].artist.name = '<b>artist</b>';
  const html = renderCollection(collection);
  assert.doesNotMatch(html, /<script>|<b>artist| onmouseover="/);
  assert.match(html, /&lt;script&gt;&quot;art&quot; &amp; more/);
  assert.match(html, /&lt;b&gt;artist&lt;\/b&gt;/);
});

test('unknown features, duplicate ids, unsafe paths and missing credits fail the build', () => {
  const mutations = [
    (value) => { value.featured = 'unpublished'; },
    (value) => { value.works.push(value.works[0]); },
    (value) => { value.works[0].id = '../private'; },
    (value) => { value.works[0].image = 'images/persona/../../private.png'; },
    (value) => { value.works[0].image = 'https://example.com/art.png'; },
    (value) => { value.works[0].artist.name = ''; },
    (value) => { value.works[0].artist.url = 'javascript:alert(1)'; },
    (value) => { value.works[0].showcaseUrl = 'http://example.com'; },
    (value) => { value.works[0].date = '2026-13'; },
    (value) => { value.works[0].width = 0; },
    (value) => { value.works[0].alt = ''; },
    (value) => { value.works = []; },
  ];
  for (const mutate of mutations) {
    const collection = fixture();
    mutate(collection);
    assert.throws(() => validateCollection(collection));
  }
  const missing = fixture();
  missing.works[0].image = 'images/persona/no-such-artwork.png';
  assert.throws(() => validateCollection(missing, path.resolve(__dirname, '..')), /not found/);
});

test('artist names without public profile URLs still have a visible credit', () => {
  const collection = fixture();
  delete collection.works[0].artist.url;
  delete collection.works[0].showcaseUrl;
  const html = renderCollection(collection);
  assert.match(html, /art by <span class="persona-artist">yoursleepywitch<\/span>/);
  assert.doesNotMatch(html, /href="undefined"|artist showcase/);
});
