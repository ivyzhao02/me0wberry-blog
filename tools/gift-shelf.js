const START = '<!-- generated-pokemon-gifts:start -->';
const END = '<!-- generated-pokemon-gifts:end -->';
const KINDS = Object.freeze({ plush: ['plushie', 'plushies'], keychain: ['plush keychain', 'plush keychains'], pin: ['pin', 'pins'] });

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function onlyKeys(value, allowed, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).some((key) => !allowed.includes(key))) {
    throw new Error(`${label} contains unsupported fields. Keep sealed details outside the public repository.`);
  }
}

function validQuantity(value) {
  return Object.hasOwn(KINDS, value.kind) && Number.isSafeInteger(value.quantity) && value.quantity > 0;
}

function validateGiftShelf(shelf, now = new Date()) {
  onlyKeys(shelf, ['batches'], 'Gift shelf');
  if (!Array.isArray(shelf.batches)) throw new Error('Gift shelf needs a batches array.');
  const ids = new Set();
  const currentTime = new Date(now).getTime();
  if (!Number.isFinite(currentTime)) throw new Error('Gift publication needs a valid current time.');

  for (const batch of shelf.batches) {
    const sealed = batch?.state === 'sealed';
    onlyKeys(batch, ['id', 'state', 'revealAt', 'summary', ...(sealed ? [] : ['recipient', 'items'])], 'Gift batch');
    if (!['sealed', 'revealed'].includes(batch.state)) throw new Error('Gift state must be sealed or revealed.');
    if (typeof batch.id !== 'string' || !/^[a-z][a-z0-9-]*$/.test(batch.id) || ids.has(batch.id)) throw new Error('Invalid or duplicate gift batch id.');
    ids.add(batch.id);
    if (typeof batch.revealAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(batch.revealAt)
      || !Number.isFinite(Date.parse(batch.revealAt))) throw new Error('Gift reveal needs an explicit ISO timestamp and timezone.');
    if (!Array.isArray(batch.summary) || !batch.summary.length) throw new Error('Gift summary needs anonymous item-type quantities.');
    const kinds = new Set();
    for (const count of batch.summary) {
      onlyKeys(count, ['kind', 'quantity'], 'Gift summary');
      if (!validQuantity(count) || kinds.has(count.kind)) throw new Error('Invalid or duplicate gift summary quantity.');
      kinds.add(count.kind);
    }
    // A date never unlocks browser data. Private details enter this file only when publication is authorized.
    if (sealed) continue;
    if (currentTime < Date.parse(batch.revealAt)) throw new Error('Gift details cannot be published before the reveal time.');
    if (typeof batch.recipient !== 'string' || !batch.recipient.trim() || batch.recipient.length > 120) {
      throw new Error('Revealed gifts need a recipient label.');
    }
    if (!Array.isArray(batch.items) || !batch.items.length) throw new Error('Revealed gifts need approved items.');
    const totals = {};
    const itemIds = new Set();
    for (const item of batch.items) {
      onlyKeys(item, ['id', 'group', 'details', 'kind', 'quantity'], 'Gift item');
      if (typeof item.id !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(item.id) || itemIds.has(item.id)) {
        throw new Error('Invalid or duplicate gift item id.');
      }
      itemIds.add(item.id);
      if (!validQuantity(item) || ['group', 'details'].some((key) => typeof item[key] !== 'string' || !item[key].trim())) {
        throw new Error('Gift items need a name, description and positive typed quantity.');
      }
      totals[item.kind] = (totals[item.kind] || 0) + item.quantity;
    }
    if (Object.keys(totals).length !== kinds.size || batch.summary.some((count) => totals[count.kind] !== count.quantity)) {
      throw new Error('Revealed items do not match the anonymous gift quantities.');
    }
  }
}

function renderGiftShelf(shelf, now = new Date()) {
  validateGiftShelf(shelf, now);
  const dateLabel = (value) => new Intl.DateTimeFormat('en-CA', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Toronto',
  }).format(new Date(value)).toLowerCase();
  return [
    START,
    '            <section class="gift-shelf" id="pokemon-gifts" aria-labelledby="pokemon-gifts-title">',
    '              <div class="pokemon-collection-preview-heading"><h3 class="shrine-cabinet-heading" id="pokemon-gifts-title">gift drawer</h3><p>a few little surprises / separate from my collection</p></div>',
    ...shelf.batches.map((batch) => {
      const total = batch.summary.reduce((sum, count) => sum + count.quantity, 0);
      const sealed = batch.state === 'sealed';
      return [
        `              <article class="gift-batch" data-gift-batch-id="${escapeHtml(batch.id)}" data-gift-state="${batch.state}">`,
        `                <header><span class="shrine-cabinet-status">${sealed ? 'under wraps' : 'opened'}</span><h4>${sealed ? 'a little mystery parcel' : `gifts for ${escapeHtml(batch.recipient)}`}</h4></header>`,
        '                <dl class="gift-summary">',
        ...batch.summary.map((count) => `                  <div data-gift-kind="${count.kind}"><dt>${KINDS[count.kind][count.quantity === 1 ? 0 : 1]}</dt><dd>${count.quantity}</dd></div>`),
        '                </dl>',
        ...(sealed ? [
          `                <p class="gift-note">${total} little surprise${total === 1 ? '' : 's'} / planned reveal <time datetime="${escapeHtml(batch.revealAt)}">${dateLabel(batch.revealAt)}</time></p>`,
          '                <p class="gift-note">the names + who they are for stay tucked away until then &#9825;</p>',
        ] : [
          '                <ul class="gift-items">',
          ...batch.items.map((item) => `                  <li data-pokemon-merch-item="${escapeHtml(item.id)}"><strong>${escapeHtml(item.group)}</strong><span>${escapeHtml(item.details)}${item.quantity > 1 ? ` / ${item.quantity} pieces` : ''}</span></li>`),
          '                </ul>',
        ]),
        '              </article>',
      ].join('\n');
    }),
    '            </section>',
    END,
  ].join('\n');
}

module.exports = { START, END, renderGiftShelf, validateGiftShelf };
