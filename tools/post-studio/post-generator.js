const path = require('path');
const { CATEGORY_IDS } = require('../site-config');

const CATEGORIES = new Set(CATEGORY_IDS);
const GALLERY_CATEGORIES = CATEGORIES;

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'post';
}

function renderInline(text = '') {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1"/>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

function stripBulletPrefix(line = '') {
  return line.trim().replace(/^(?:[-*•–—]\s*)+/, '').trim();
}

function isBulletLine(line = '') {
  return /^(?:[-*•–—]\s*)+/.test(line.trim());
}

function renderStyledList(lines) {
  const items = lines
    .map(stripBulletPrefix)
    .filter(Boolean)
    .map((line) => `<li>– ${renderInline(line)}</li>`)
    .join('\n');

  if (!items) return '';
  return `<ul class="post-list">\n${items}\n</ul>`;
}

function renderTextBlock(block) {
  const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return '';

  if (lines.every(isBulletLine)) {
    return renderStyledList(lines);
  }

  const firstBulletIndex = lines.findIndex(isBulletLine);
  if (firstBulletIndex > 0) {
    const intro = lines.slice(0, firstBulletIndex).join(' ');
    const bullets = lines.slice(firstBulletIndex);
    return `<p>${renderInline(intro)}</p>\n${renderStyledList(bullets)}`;
  }

  return `<p>${renderInline(lines.join('\n')).replace(/\n/g, '<br>')}</p>`;
}

function markdownToHtml(markdown = '') {
  return markdown.split('\n\n').map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<')) return trimmed;
    return renderTextBlock(trimmed);
  }).join('\n');
}

function toBullets(text = '') {
  return text.split('\n')
    .map(stripBulletPrefix)
    .filter(Boolean)
    .map((line) => `<li>– ${escapeHtml(line)}</li>`)
    .join('\n        ');
}

function buildLatelyContent({ title, whereAt, intoText, note }) {
  const noteHtml = note ? `
      <div class="post-note-divider"></div>
      <p class="post-section-label">♡ a note:</p>
      <p class="post-note">${escapeHtml(note)}</p>` : '';

  return `<div class="post-content">
      <div class="post-lately-title">${escapeHtml(title)}</div>
      <p class="post-section-label">where i'm at (ᐢ. .ᐢ):</p>
      <ul class="post-list post-list-lately">
        ${toBullets(whereAt)}
      </ul>
      <div class="post-heart-divider">♡ · ♡ · ♡</div>
      <p class="post-section-label">what i'm into:</p>
      <ul class="post-list post-list-lately">
        ${toBullets(intoText)}
      </ul>${noteHtml}
    </div>`;
}

function toPostAssetPath(src) {
  const value = String(src || '');
  if (!value || /^(?:https?:)?\/\//i.test(value) || value.startsWith('data:')) return value;
  return value.startsWith('/') ? `../..${value}` : value;
}

function buildImageHtml(src, alt) {
  if (!src) return '';
  return `    <img class="post-image" src="${toPostAssetPath(src)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async"/>`;
}

function buildPostGallery(images, category, alt) {
  if (!images.length) return '';

  const basePath = `../../images/${category}/`;
  const imageSrc = (name) => name.startsWith('/') ? toPostAssetPath(name) : `${basePath}${name}`;

  if (images.length === 1) {
    return `    <img class="post-image" src="${imageSrc(images[0])}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async"/>`;
  }

  const slideImgs = images
    .map((name, index) => {
      const src = imageSrc(name);
      const attrs = index === 0
        ? `src="${src}" fetchpriority="high"`
        : `data-src="${src}"`;
      return `      <img class="slide-img" ${attrs} alt="${escapeHtml(alt)}" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async"/>`;
    })
    .join('\n');

  return `    <div class="stubby-slideshow">
  <button class="slide-btn slide-prev" onclick="postSlidePrev()" aria-label="previous photo">◀</button>
  <div class="slide-track-wrapper">
    <div class="slide-track" id="post-slide-track">
${slideImgs}
    </div>
  </div>
  <button class="slide-btn slide-next" onclick="postSlideNext()" aria-label="next photo">▶</button>
  <div class="slide-dots" id="post-slide-dots"></div>
</div>`;
}

function buildPlayerHtml() {
  return `<aside id="panel-player" aria-label="music player">
  <div class="panel-titlebar">
    <span class="panel-title">♪ now playing</span>
  </div>
  <div class="panel-body">
    <div class="player-track-title">
      <div class="marquee-wrap" id="player-marquee"><span id="player-title">♪ loading...</span></div>
    </div>
    <div class="player-time-row">
      <span id="player-current-time">0:00</span>
      <input type="range" id="player-progress" class="player-range" min="0" max="100" value="0" step="0.1" aria-label="track progress">
      <span id="player-total-time">0:00</span>
    </div>
    <div class="player-controls">
      <button class="player-btn" onclick="playerPrev()" title="prev" aria-label="previous track">◀</button>
      <button class="player-btn player-btn-main" id="player-playpause" onclick="playerToggle()" title="play/pause" aria-label="play or pause">▶</button>
      <button class="player-btn" onclick="playerNext()" title="next" aria-label="next track">▶|</button>
    </div>
    <div class="player-volume-row">
      <span class="player-vol-icon" aria-hidden="true">🔊</span>
      <input type="range" id="player-volume" class="player-range" min="0" max="1" value="0.75" step="0.01" aria-label="volume">
    </div>
    <div class="player-track-counter" id="player-counter">track 1 / 7</div>
    <audio id="player-audio" preload="none"></audio>
  </div>
</aside>`;
}

function buildPostHtml(post) {
  const { category, title, date, content, imageUrl, images, lately } = post;
  const safeTitle = escapeHtml(title);
  const safeCategory = escapeHtml(category === 'lately' ? 'now' : category);
  const safeDate = escapeHtml(date);
  const mainContent = category === 'lately'
    ? buildLatelyContent({ title, ...lately })
    : `<div class="post-content">${markdownToHtml(content)}</div>`;

  const mediaHtml = images.length
    ? buildPostGallery(images, category, title)
    : buildImageHtml(imageUrl, title);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${safeTitle} — me0wberry</title>
<link rel="alternate" type="application/rss+xml" title="me0wberry.com posts" href="../../feed.xml">
<script src="../../theme-loader.js"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Press+Start+2P&family=Quicksand:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../themes.css" data-site-themes>
<link rel="stylesheet" href="../../post.css">
</head>
<body>
<a class="skip-link" href="#main">skip to content</a>
<main class="post-container" id="main" tabindex="-1">
  <div class="post-titlebar" style="display:flex;align-items:center;justify-content:space-between;"><span class="post-titlebar-text">${safeCategory} · ${safeTitle}</span><button id="cat-toggle" onclick="toggleCats()" title="hide cats" style="cursor:pointer;">🐱</button></div>
  <div class="post-body">
    <div class="post-pixel-tag">/ ${safeCategory}</div>
    <h1 class="post-heading">${safeTitle}</h1>
    <div class="post-date">${safeDate}</div>
    ${mainContent}
${mediaHtml ? `${mediaHtml}\n` : ''}    <div class="post-footer">
      <div style="display:flex;flex-direction:column;gap:4px;">
        <a href="../../index.html" class="post-back">← back to me0wberry.com</a>
        <a href="../../archive/index.html" class="post-back">← back to archive</a>
      </div>
      <span style="font-size:11px;color:var(--muted)">${safeDate}</span>
    </div>
  </div>
</main>
${buildPlayerHtml()}
<script src="../../script.js" data-site-root="../.."></script>
</body>
</html>
`;
}

function createPostRecord(postPath, title, date, slug, images) {
  return {
    title,
    date,
    file: postPath.split(path.sep).join('/'),
    slug,
    images,
  };
}

module.exports = {
  CATEGORIES,
  GALLERY_CATEGORIES,
  buildPostHtml,
  buildPlayerHtml,
  createPostRecord,
  slugify,
};
