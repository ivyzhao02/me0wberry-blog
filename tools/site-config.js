const ARCHIVE_CATEGORIES = Object.freeze([
  { id: 'games', label: 'games' },
  { id: 'music', label: 'music' },
  { id: 'food', label: 'food' },
  { id: 'stubby', label: 'stubby', titlebarLabel: 'stubby 🐾' },
  { id: 'beauty', label: 'beauty' },
  { id: 'lately', label: 'now' },
]);

const CATEGORY_IDS = Object.freeze(ARCHIVE_CATEGORIES.map((category) => category.id));

module.exports = {
  ARCHIVE_CATEGORIES,
  CATEGORY_IDS,
};
