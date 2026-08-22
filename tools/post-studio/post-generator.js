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

function galleryStyles(images) {
  if (images.length <= 1) return '';

  return `.stubby-slideshow{position:relative;margin:12px 0;}
.slide-track-wrapper{overflow:hidden;width:100%;max-height:400px;border:1px solid var(--frosted-border);border-radius:3px;}
.slide-track{display:flex;transition:transform 0.4s ease;}
.slide-img{min-width:100%;width:100%;height:auto;max-height:400px;object-fit:contain;object-position:center;background:rgba(0,0,0,0.03);flex-shrink:0;display:block;}
.slide-btn{position:absolute;top:50%;transform:translateY(-50%);z-index:2;background:rgba(255,255,255,0.6);border:1px solid var(--frosted-border);color:var(--pixel-label);font-size:10px;width:24px;height:24px;display:flex;align-items:center;justify-content:center;cursor:pointer;}
.slide-prev{left:4px;}
.slide-next{right:4px;}
.slide-dots{display:flex;justify-content:center;gap:5px;margin-top:6px;}
.slide-dot{display:block;width:6px;height:6px;padding:0;border-radius:50%;background:var(--pink-pale);border:1px solid var(--pink);cursor:pointer;}
.slide-dot.active{background:var(--pink);}
`;
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
<style>
:root{--pink:#e07090;--pink-light:#f4a8b8;--pink-pale:#ffd0de;--green:#5aaa6a;--green-light:#a8d8a0;--cream:#fdf6f0;--heading:#8b3a5a;--body:#4a3a42;--muted:#a09098;--pixel-label:#b05a7a;--pixel-label2:#c07090;--frosted-bg:rgba(255,255,255,0.42);--frosted-border:rgba(255,255,255,0.68);}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{font-family:'Nunito Sans',system-ui,sans-serif;font-size:14px;color:var(--body);line-height:1.7;min-height:100%;}
body{background:linear-gradient(135deg,#a8e6a3 0%,#c9e8c5 25%,#e8ddd5 50%,#f2c4ce 75%,#f4a8b8 100%);padding:20px;}
.post-container{max-width:680px;margin:0 auto;background:var(--frosted-bg);backdrop-filter:blur(10px);border:2px solid var(--frosted-border);}
.post-titlebar{background:rgba(255,255,255,0.55);border-bottom:2px solid var(--frosted-border);padding:6px 10px;}
.post-titlebar-text{font-family:'Press Start 2P',monospace;font-size:8px;color:var(--pixel-label);}
.post-body{padding:16px 18px;}
.post-pixel-tag{font-family:'Press Start 2P',monospace;font-size:6px;color:var(--pixel-label2);background:rgba(255,255,255,0.5);border:1px solid rgba(192,112,144,0.4);padding:3px 7px;display:inline-block;margin-bottom:8px;}
.post-heading{font-family:'Quicksand','Nunito Sans',sans-serif;font-weight:600;font-size:22px;color:var(--heading);margin-bottom:4px;}
.post-date{font-style:italic;font-size:11px;color:var(--muted);margin-bottom:16px;}
.post-content{font-size:14px;line-height:1.75;}
.post-content p{margin-bottom:12px;}
.post-content img{max-width:100%;border:1px solid var(--frosted-border);margin:8px 0;display:block;}
.post-content a{color:var(--pink);text-decoration:underline dotted;}
.post-list{list-style:none;padding:0;margin-bottom:14px;}
.post-list li{margin-bottom:4px;}
.post-list-lately{font-size:14px;line-height:1.75;}
.post-lately-title{font-family:'Press Start 2P',monospace;font-size:8px;color:var(--pixel-label2);margin-bottom:16px;}
.post-section-label{font-family:'Press Start 2P',monospace;font-size:7px;color:var(--pixel-label2);margin-bottom:8px;}
.post-heart-divider{text-align:center;color:var(--muted);margin:14px 0;letter-spacing:4px;}
.post-note-divider{border-top:1px dashed rgba(160,144,152,0.45);margin:14px 0 10px;}
.post-note{font-style:italic;color:var(--muted);}
.post-image{max-width:100%;margin:12px 0;display:block;border:1px solid var(--frosted-border);}
.post-footer{margin-top:18px;padding-top:12px;border-top:1px dashed rgba(160,144,152,0.45);display:flex;justify-content:space-between;align-items:center;}
.post-back{font-size:12px;color:var(--muted);text-decoration:none;}
.post-back:hover{color:var(--pink);}
${galleryStyles(images)}#cat-strip{position:fixed;bottom:0;left:0;width:100%;height:48px;pointer-events:none;z-index:9990;overflow:hidden;}
.cat-walker{position:absolute;bottom:6px;font-family:'Press Start 2P',monospace;font-size:9px;color:rgba(139,58,90,0.55);pointer-events:none;user-select:none;white-space:nowrap;}
#cat-toggle{font-family:'Press Start 2P',monospace;font-size:9px;background:none;border:none;cursor:pointer;padding:0 4px;color:#a09098;opacity:0.7;line-height:1;}
#cat-toggle:hover{opacity:1;}
.bg-deco{position:fixed;pointer-events:none;z-index:0;user-select:none;line-height:1;color:white;}
.player-range::-webkit-slider-thumb{-webkit-appearance:none;width:10px;height:10px;background:#e07090;cursor:pointer;border-radius:0;}
.player-range::-moz-range-thumb{width:10px;height:10px;background:#e07090;cursor:pointer;border-radius:0;border:none;}
.marquee-wrap{display:inline-block;}
@keyframes marquee{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}
.marquee-wrap.scrolling{animation:marquee 9s linear infinite;}
:where(a,button,input,[role="button"]):focus-visible{outline:2px solid rgba(90,170,106,0.78);outline-offset:3px;}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:0.01ms!important;animation-iteration-count:1!important;transition-duration:0.01ms!important;}.marquee-wrap.scrolling{animation:none!important;}}
@media(max-width:1240px) and (min-width:769px){#panel-player{position:static!important;width:min(280px,calc(100vw - 40px))!important;margin:16px auto 0!important;}}
@media(max-width:768px){#panel-player:not(.open){display:none!important;}}</style>
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
