const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const shared = fs.readFileSync(path.join(root, 'styles/05-typography.css'), 'utf8').trim();

test('desktop and post bundles use the same single typography source', () => {
  for (const file of ['style.css', 'post.css']) {
    const bundle = fs.readFileSync(path.join(root, file), 'utf8');
    assert.ok(bundle.includes(shared), `${file} is missing the shared scale`);
    for (const token of ['font-body', 'text-body', 'text-small', 'text-meta', 'leading-body']) {
      assert.equal([...bundle.matchAll(new RegExp(`--${token}\\s*:`, 'g'))].length, 1, `${file} redefines ${token}`);
    }
  }
});

test('reading sizes respect browser font preferences and remain distinct from pixel chrome', () => {
  for (const [token, value] of Object.entries({ 'text-body': '0.875rem', 'text-ui': '0.8125rem', 'text-small': '0.75rem', 'text-meta': '0.6875rem' })) {
    assert.ok(shared.includes(`--${token}: ${value};`), `${token} left the shared relative scale`);
  }
  assert.match(shared, /html\s*\{\s*font-size:\s*100%;/);
  assert.match(shared, /--leading-body:\s*1\.75;/);
  assert.match(shared, /--font-micro:\s*7px;/);
});
