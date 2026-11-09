const fs = require('fs');
const path = require('path');

const START = '<!-- generated-persona-collection:start -->';
const END = '<!-- generated-persona-collection:end -->';

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function validateCollection(collection, root) {
  if (!Array.isArray(collection.works) || !collection.works.length) {
    throw new Error('Persona collection needs at least one published work.');
  }
  const ids = new Set();
  for (const work of collection.works) {
    if (!/^[a-z][a-z0-9-]*$/.test(work.id) || ids.has(work.id)) {
      throw new Error(`Invalid or duplicate Persona work id: ${work.id}`);
    }
    ids.add(work.id);
    for (const field of ['title', 'kind', 'view', 'description', 'alt']) {
      if (typeof work[field] !== 'string' || !work[field].trim()) {
        throw new Error(`Persona ${work.id} needs ${field}.`);
      }
    }
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(work.date)) {
      throw new Error(`Persona ${work.id} needs a YYYY-MM date.`);
    }
    if (!Number.isInteger(work.width) || work.width < 1 || !Number.isInteger(work.height) || work.height < 1) {
      throw new Error(`Persona ${work.id} needs positive image dimensions.`);
    }
    if (typeof work.image !== 'string' || !/^images\/persona\/[a-zA-Z0-9_-]+\.(webp|png|jpe?g|gif)$/.test(work.image)) {
      throw new Error(`Persona ${work.id} needs a local images/persona/ file.`);
    }
    if (root && !fs.existsSync(path.join(root, work.image))) {
      throw new Error(`Persona artwork not found: ${work.image}`);
    }
    if (typeof work.artist?.name !== 'string' || !work.artist.name.trim()) {
      throw new Error(`Persona ${work.id} needs an artist credit.`);
    }
    for (const url of [work.artist.url, work.showcaseUrl].filter((value) => value !== undefined)) {
      let parsed;
      try { parsed = new URL(url); } catch { /* Report one actionable validation error below. */ }
      if (!parsed || parsed.protocol !== 'https:' || parsed.username || parsed.password) {
        throw new Error(`Persona ${work.id} credit links must use HTTPS.`);
      }
    }
  }
  if (!ids.has(collection.featured)) throw new Error('Persona featured work is not in the collection.');
}

function renderCollection(collection, root) {
  validateCollection(collection, root);
  const featured = collection.works.find((work) => work.id === collection.featured);
  const dateLabel = (date) => new Intl.DateTimeFormat('en', {
    month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${date}-01T00:00:00Z`)).toLowerCase();
  const artistLink = (work) => work.artist.url
    ? `<a class="persona-artist" href="${escapeHtml(work.artist.url)}" target="_blank" rel="noopener">${escapeHtml(work.artist.name)} ↗</a>`
    : `<span class="persona-artist">${escapeHtml(work.artist.name)}</span>`;
  const image = (work, lazy = false) => `<img src="../${escapeHtml(work.image)}" alt="${escapeHtml(work.alt)}" width="${work.width}" height="${work.height}"${lazy ? ' loading="lazy"' : ''} decoding="async">`;
  const count = collection.works.length;
  const openLink = `href="../${escapeHtml(featured.image)}" data-persona-open="${featured.id}"`;
  return [
    START,
    '          <section class="persona-gallery" aria-labelledby="persona-gallery-title">',
    '            <h2 class="persona-section-title" id="persona-gallery-title">featured artwork <span aria-hidden="true">✧˖°</span></h2>',
    `            <article class="persona-piece-card${featured.width / featured.height > 2.2 ? ' persona-piece-card--wide' : ''}">`,
    '              <div class="persona-art-window">',
    '                <div class="persona-window-bar"><span>image viewer</span><span aria-hidden="true">♡</span></div>',
    `                <a class="persona-piece-art" ${openLink} aria-label="enlarge ${escapeHtml(featured.title)}">${image(featured)}</a>`,
    `                <div class="persona-window-status"><span>${featured.width} × ${featured.height} / full image</span><a ${openLink}>open artwork ↗</a></div>`,
    '              </div>',
    '              <div class="persona-piece-details">',
    `                <span class="persona-piece-kicker">${escapeHtml(featured.kind)} / <time datetime="${featured.date}">${dateLabel(featured.date)}</time></span>`,
    `                <h3 class="persona-piece-title">${escapeHtml(featured.title)}</h3>`,
    `                <p>${escapeHtml(featured.description)}</p>`,
    '                <dl class="persona-piece-meta">',
    `                  <div><dt>artist</dt><dd>${artistLink(featured)}</dd></div>`,
    `                  <div><dt>view</dt><dd>${escapeHtml(featured.view)}</dd></div>`,
    '                </dl>',
    '                <div class="persona-piece-actions">',
    `                  <a class="pixel-btn" ${openLink}>enlarge artwork ↗</a>`,
    ...(featured.showcaseUrl ? [`                  <a class="pixel-btn" href="${escapeHtml(featured.showcaseUrl)}" target="_blank" rel="noopener">artist showcase ↗</a>`] : []),
    '                </div>',
    '              </div>',
    '            </article>',
    '          </section>',
    '          <section class="persona-collection" aria-labelledby="persona-collection-title">',
    `            <h2 class="persona-section-title" id="persona-collection-title">collection folder / ${count} ${count === 1 ? 'piece' : 'pieces'}</h2>`,
    '            <p class="persona-collection-hint">open a piece for a closer look . artist credits stay with the artwork ♡</p>',
    '            <ul class="persona-collection-list">',
    ...collection.works.map((work) => [
      `              <li class="persona-collection-item" id="work-${work.id}" data-persona-description="${escapeHtml(work.description)}">`,
      `                <a class="persona-collection-open" href="../${escapeHtml(work.image)}" data-persona-open="${work.id}">`,
      `                  ${image(work, true)}`,
      `                  <span><strong class="persona-collection-title">${escapeHtml(work.title)}</strong><span class="persona-collection-date">${escapeHtml(work.kind)} / <time datetime="${work.date}">${dateLabel(work.date)}</time></span></span>`,
      '                  <span class="persona-collection-arrow" aria-hidden="true">↗</span>',
      '                </a>',
      `                <span class="persona-collection-credit">art by ${artistLink(work)}</span>`,
      ...(work.showcaseUrl ? [`                <a class="persona-showcase" href="${escapeHtml(work.showcaseUrl)}" target="_blank" rel="noopener">artist showcase ↗</a>`] : []),
      '              </li>',
    ].join('\n')),
    '            </ul>',
    '          </section>',
    `          ${END}`,
  ].join('\n');
}

module.exports = { START, END, renderCollection, validateCollection };
