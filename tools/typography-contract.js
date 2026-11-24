const TYPOGRAPHY_ROLES = [
  {
    name: 'body', size: 14, leading: 1.75,
    selectors: [
      '.text-body', '.welcome-copy', '.panel-section-body', '.stat-block', '.currently-row',
      '.likes-col li', '.dni-list li', '.project-card-copy', '.favs-entry:not([style])',
      '.info-profile-copy', '.webgarden-intro', '.webgarden-card-note', '.toybox-intro',
      '.rss-reader-intro', '.rss-reader-summary', '.site-history-copy p', '.changelog-month-list li',
      '.rights-intro > p', '.rights-section > p:not(.rights-small-note)', '.rights-law-notes p',
      '.persona-intro', '.persona-profile p', '.persona-profile-notes dd', '.persona-piece-details p',
      '.persona-private-copy p:not(.persona-private-credit)', '.persona-dialog-description',
      '.now-post-content p', '.now-post-content li', '.post-content p', '.post-content li',
      '.monthly-poll-question', '.shrine-intro', '.shrine-door-copy', '.shrine-room-copy',
      '.posts-list a', '.stubby-everyday-closing',
      '.shrine-cabinet-card p', '.stubby-year-copy', '.stubby-everyday-grid p', '.stubby-facts-grid dd',
      '.pokemon-section-heading > p', '.warframe-section-heading > p', '.league-section-heading > p',
      '.league-champion-notes li', '.sanrio-section-heading > p', '.sanrio-shelf-note p',
      '.splatoon-section-heading > p', '.splatoon-match-receipt > p', '.splatoon-smallfry-intro p',
      '.splatoon-gear-showcase-copy p', '.splatoon-amiibo-note p', '.stuffies-letter p',
    ],
  },
  {
    name: 'small', size: 12, leading: 1.6,
    selectors: [
      '.text-small', '.rights-small-note', '.rights-credit-links span', '.info-art-credit',
      '.persona-private-credit', '.toybox-source-note', '.trinket-credit-bubble',
      '.toybox-collection-hint', '.monthly-poll-note', '.pokemon-merch-group li',
      '.splatoon-shot-caption small', '.splatoon-credit-note p', '.league-credit-note p',
    ],
  },
  {
    name: 'meta', size: 11, leading: 1.6,
    selectors: ['.text-meta', '.panel-updated', '.posts-list .post-date', '.post-date', '.persona-collection-date', '.rss-reader-meta'],
  },
];

module.exports = { TYPOGRAPHY_ROLES };
