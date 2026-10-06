const ARCHIVE_CATEGORIES = Object.freeze([
  { id: 'games', label: 'games' },
  { id: 'music', label: 'music' },
  { id: 'food', label: 'food' },
  { id: 'stubby', label: 'stubby', titlebarLabel: 'stubby 🐾' },
  { id: 'beauty', label: 'beauty' },
  { id: 'lately', label: 'now' },
]);

const CATEGORY_IDS = Object.freeze(ARCHIVE_CATEGORIES.map((category) => category.id));

// Advance a timestamp only when a visitor-facing page receives a meaningful content update.
const PAGE_LAST_EDITED = Object.freeze({
  'archive/index.html': '2026-08-29T16:34:46-04:00',
  'archive/beauty/index.html': '2026-08-29T16:34:46-04:00',
  'archive/food/index.html': '2026-08-29T16:34:46-04:00',
  'archive/games/index.html': '2026-08-29T16:34:46-04:00',
  'archive/lately/index.html': '2026-08-29T16:34:46-04:00',
  'archive/music/index.html': '2026-08-29T16:34:46-04:00',
  'archive/stubby/index.html': '2026-08-29T16:34:46-04:00',
  'info/index.html': '2026-10-06T13:28:41-04:00',
  'now/index.html': '2026-10-03T16:07:27-04:00',
  'persona/index.html': '2026-10-06T13:28:41-04:00',
  'shrines/index.html': '2026-10-06T13:28:41-04:00',
  'shrines/league/index.html': '2026-10-06T13:28:41-04:00',
  'shrines/pokemon/index.html': '2026-10-06T13:28:41-04:00',
  'shrines/sanrio/index.html': '2026-10-06T13:28:41-04:00',
  'shrines/stubby/index.html': '2026-10-06T13:28:41-04:00',
  'shrines/warframe/index.html': '2026-10-06T13:28:41-04:00',
  'toybox/index.html': '2026-10-06T13:28:41-04:00',
  'webgarden/index.html': '2026-10-06T13:28:41-04:00',
});

module.exports = {
  ARCHIVE_CATEGORIES,
  CATEGORY_IDS,
  PAGE_LAST_EDITED,
};
