const assert = require('node:assert/strict');
const test = require('node:test');
const { renderGiftShelf, validateGiftShelf } = require('./gift-shelf');
const publicShelf = require('../data/gift-shelf.json');

const fixture = () => ({ batches: [{
  id: 'example-parcel', state: 'sealed', revealAt: '2030-12-24T00:05:00-05:00',
  summary: [{ kind: 'plush', quantity: 1 }],
}] });
const approvedFixture = () => {
  const shelf = fixture();
  Object.assign(shelf.batches[0], {
    state: 'revealed', recipient: 'a friend',
    items: [{ id: 'example-plush', group: 'example character', details: 'small plush', kind: 'plush', quantity: 1 }],
  });
  return shelf;
};

test('the public gift manifest validates and every published batch is rendered', () => {
  validateGiftShelf(publicShelf);
  const html = renderGiftShelf(publicShelf);
  for (const batch of publicShelf.batches) assert.ok(html.includes(`data-gift-batch-id="${batch.id}"`));
});

test('sealed gifts contain only anonymous quantities and a planned reveal date', () => {
  const html = renderGiftShelf(fixture());
  assert.match(html, /data-gift-state="sealed"/);
  assert.match(html, /1 little surprise \/ planned reveal/);
  assert.doesNotMatch(html, /data-pokemon-merch-item|<img|<script|<template/);
});

test('sealed gifts reject identity fields and hidden payloads at every supported level', () => {
  for (const key of ['recipient', 'items', 'image', 'encodedPayload', 'note', 'privateSource']) {
    const shelf = fixture();
    shelf.batches[0][key] = 'private detail';
    assert.throws(() => validateGiftShelf(shelf), /unsupported fields/);
  }
  const shelf = fixture();
  shelf.batches[0].summary[0].name = 'private detail';
  assert.throws(() => validateGiftShelf(shelf), /unsupported fields/);
});

test('a passing date alone never reveals a sealed parcel', () => {
  assert.match(renderGiftShelf(fixture(), new Date('2031-01-01T00:00:00Z')), /data-gift-state="sealed"/);
});

test('publication is rejected before the approved instant, including at the timezone boundary', () => {
  assert.throws(() => renderGiftShelf(approvedFixture(), new Date('2030-12-24T05:04:59Z')), /before the reveal time/);
  const html = renderGiftShelf(approvedFixture(), new Date('2030-12-24T05:05:00Z'));
  assert.match(html, /gifts for a friend/);
  assert.match(html, /example character/);
});

test('revealed quantities, unique ids, timestamps and text safety are validated', () => {
  const now = new Date('2031-01-01T00:00:00Z');
  const shelf = approvedFixture();
  shelf.batches[0].recipient = '<script>alert(1)</script>';
  shelf.batches[0].items[0].details = '<img src=x onerror=alert(1)>';
  const html = renderGiftShelf(shelf, now);
  assert.doesNotMatch(html, /<script>|<img/);
  assert.match(html, /&lt;script&gt;/);
  shelf.batches[0].items[0].quantity = 2;
  assert.throws(() => validateGiftShelf(shelf, now), /do not match/);
  assert.throws(() => validateGiftShelf({ batches: [fixture().batches[0], fixture().batches[0]] }), /duplicate gift batch/);
  assert.throws(() => validateGiftShelf(fixture(), 'not a date'), /valid current time/);
  const missingId = fixture();
  delete missingId.batches[0].id;
  assert.throws(() => validateGiftShelf(missingId), /Invalid or duplicate gift batch/);
});

test('separate batches may gift the same product without allowing duplicate entries within one batch', () => {
  const now = new Date('2031-01-01T00:00:00Z');
  const shelf = approvedFixture();
  const other = structuredClone(shelf.batches[0]);
  other.id = 'another-parcel';
  shelf.batches.push(other);
  assert.doesNotThrow(() => validateGiftShelf(shelf, now));
  shelf.batches[0].items.push(structuredClone(shelf.batches[0].items[0]));
  assert.throws(() => validateGiftShelf(shelf, now), /duplicate gift item/);
});
