const path = require('path');

const CATEGORIES = new Set(['games', 'music', 'food', 'stubby', 'beauty', 'lately']);
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
</div>
<div id="panel-player" style="position:fixed;width:280px;bottom:20px;right:20px;z-index:9000;background:rgba(255,255,255,0.42);backdrop-filter:blur(10px);border:2px solid rgba(255,255,255,0.68);display:flex;flex-direction:column;">
  <div class="panel-titlebar" style="height:26px;background:rgba(255,255,255,0.55);border-bottom:2px solid rgba(255,255,255,0.6);display:flex;align-items:center;justify-content:space-between;padding:0 8px;cursor:default;flex-shrink:0;">
    <span style="font-family:'Press Start 2P',monospace;font-size:9px;color:#b05a7a;letter-spacing:0.4px;">♪ now playing</span>
  </div>
  <div style="padding:12px 14px 10px;">
    <div style="overflow:hidden;white-space:nowrap;margin-bottom:10px;padding-bottom:2px;border-bottom:1px dashed rgba(160,144,152,0.3);">
      <div class="marquee-wrap" id="player-marquee">
        <span id="player-title" style="font-family:'Quicksand','Nunito Sans',sans-serif;font-weight:600;font-size:12px;color:#b05a7a;display:inline-block;">♪ loading...</span>
      </div>
    </div>
    <div class="player-time-row" style="display:flex;align-items:center;gap:6px;margin-bottom:10px;font-family:'Press Start 2P',monospace;font-size:6px;color:#a09098;">
      <span id="player-current-time">0:00</span>
      <input type="range" id="player-progress" class="player-range" min="0" max="100" value="0" step="0.1" style="flex:1;height:4px;background:rgba(224,112,144,0.2);cursor:pointer;outline:none;-webkit-appearance:none;appearance:none;">
      <span id="player-total-time">0:00</span>
    </div>
    <div style="display:flex;justify-content:center;gap:8px;margin-bottom:10px;">
      <button class="player-btn" onclick="playerPrev()" style="font-family:'Press Start 2P',monospace;font-size:9px;color:#b05a7a;background:rgba(255,255,255,0.55);border:2px solid rgba(200,150,170,0.55);width:32px;height:28px;cursor:pointer;">◀</button>
      <button class="player-btn player-btn-main" id="player-playpause" onclick="playerToggle()" style="font-family:'Press Start 2P',monospace;font-size:9px;color:#b05a7a;background:rgba(255,255,255,0.55);border:2px solid rgba(200,150,170,0.55);width:40px;height:28px;cursor:pointer;">▶</button>
      <button class="player-btn" onclick="playerNext()" style="font-family:'Press Start 2P',monospace;font-size:9px;color:#b05a7a;background:rgba(255,255,255,0.55);border:2px solid rgba(200,150,170,0.55);width:32px;height:28px;cursor:pointer;">▶|</button>
    </div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
      <span style="font-size:13px;line-height:1;">🔊</span>
      <input type="range" id="player-volume" class="player-range" min="0" max="1" value="0.75" step="0.01" style="flex:1;height:4px;background:rgba(224,112,144,0.2);cursor:pointer;outline:none;-webkit-appearance:none;appearance:none;">
    </div>
    <div id="player-counter" style="font-family:'Press Start 2P',monospace;font-size:6px;color:#a09098;text-align:right;">track 1 / 5</div>
    <audio id="player-audio" preload="none"></audio>
  </div>
</main>
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
  createPostRecord,
  slugify,
};
