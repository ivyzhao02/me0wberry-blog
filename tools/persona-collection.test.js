const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const { renderCollection, validateCollection } = require('./persona-collection');
const published = require('../persona/collection.json');

const fixture = () => structuredClone(published);

test('published Persona artwork validates and includes its credit in static HTML', () => {
  const html = renderCollection(published, path.resolve(__dirname, '..'));
  assert.match(html, /collection folder \/ 1 piece/);
  assert.match(html, /art by <a class="persona-artist"/);
  assert.match(html, /href="\.\.\/images\/persona\/me0wberry-minecraft-skin-yoursleepywitch.webp"/);
  assert.match(html, /width="960" height="540"/);
  assert.match(html, /datetime="2026-07">july 2026/);
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
