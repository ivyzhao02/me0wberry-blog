const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { ARCHIVE_CATEGORIES, CATEGORY_IDS } = require('./site-config');
const { tagPublicHtmlFiles } = require('./google-tag');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://me0wberry.com';
const CATEGORIES = CATEGORY_IDS;
const ARCHIVE_TEMPLATE = path.join(ROOT, 'tools', 'templates', 'archive-category.html');
const STYLE_SOURCES = [
  'styles/00-welcome.css',
  'styles/10-shell.css',
  'styles/20-panels.css',
  'styles/30-now.css',
  'styles/40-secondary-pages.css',
  'styles/50-archive-responsive.css',
];
const SCRIPT_SOURCES = [
  'scripts/00-core.js',
  'scripts/10-desktop.js',
  'scripts/15-player-catalog.js',
  'scripts/20-player.js',
  'scripts/30-content.js',
  'scripts/40-atmosphere.js',
];
const HOME_START = '<!-- generated-now-summary:start -->';
const HOME_END = '<!-- generated-now-summary:end -->';
const NOW_START = '<!-- generated-now-entry:start -->';
const NOW_END = '<!-- generated-now-entry:end -->';
const POLL_START = '<!-- generated-monthly-poll:start -->';
const POLL_END = '<!-- generated-monthly-poll:end -->';
const BUILD_START = '<!-- generated-build:start -->';
const BUILD_END = '<!-- generated-build:end -->';
const STATIC_HOME_NOTE = "hi ! if you're reading this , thank you for checking out my site (˶ᵔ ᵕ ᵔ˶) i hope you'll enjoy visiting & reading the rest ( ˘ ³˘)♡";

function displayCategory(category) {
  return category === 'lately' ? 'now' : category;
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeXml(value = '') {
  return escapeHtml(value).replace(/'/g, '&apos;');
}

function decodeHtml(value = '') {
  const named = {
    amp: '&', apos: "'", gt: '>', lt: '<', nbsp: ' ', quot: '"',
  };

  return String(value).replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code) => {
    if (code[0] === '#') {
      const radix = code[1].toLowerCase() === 'x' ? 16 : 10;
      const number = parseInt(code.slice(radix === 16 ? 2 : 1), radix);
      return Number.isFinite(number) ? String.fromCodePoint(number) : entity;
    }
    return Object.prototype.hasOwnProperty.call(named, code.toLowerCase())
      ? named[code.toLowerCase()]
      : entity;
  });
}

function htmlToText(value = '') {
  return decodeHtml(String(value)
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(?:div|h[1-6]|li|p|ul|ol)>/gi, '\n')
    .replace(/<[^>]+>/g, ' '))
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function extractDivInnerHtml(html, className) {
  const openPattern = new RegExp(`<div\\b[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>`, 'i');
  const opening = openPattern.exec(html);
  if (!opening) return '';

  const contentStart = opening.index + opening[0].length;
  const divPattern = /<\/?div\b[^>]*>/gi;
  divPattern.lastIndex = contentStart;
  let depth = 1;
  let match;

  while ((match = divPattern.exec(html))) {
    if (/^<\/div/i.test(match[0])) depth -= 1;
    else depth += 1;
    if (depth === 0) return html.slice(contentStart, match.index).trim();
  }

  return '';
}

function postDateFromPath(file) {
  const match = String(file).match(/(?:^|\/)(\d{4})-(\d{2})-(\d{2})-/);
  if (!match) return new Date(0);
  return new Date(`${match[1]}-${match[2]}-${match[3]}T12:00:00Z`);
}

function excerpt(text, maxLength = 260) {
  const singleLine = String(text).replace(/\s+/g, ' ').trim();
  if (singleLine.length <= maxLength) return singleLine;
  return `${singleLine.slice(0, maxLength - 1).trimEnd()}…`;
}

function readPosts() {
  const posts = [];

  CATEGORIES.forEach((category, categoryOrder) => {
    const indexPath = path.join(ROOT, 'posts', category, 'index.json');
    const records = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

    records.forEach((record, recordOrder) => {
      const htmlPath = path.join(ROOT, record.file.split('/').join(path.sep));
      const html = fs.readFileSync(htmlPath, 'utf8');
      const contentHtml = extractDivInnerHtml(html, 'post-content');
      const text = htmlToText(contentHtml);
      const published = postDateFromPath(record.file);

      posts.push({
        ...record,
        category,
        displayCategory: displayCategory(category),
        contentHtml,
        text,
        summary: excerpt(text),
        published,
        categoryOrder,
        recordOrder,
        url: `/${record.file.replace(/\\/g, '/')}`,
      });
    });
  });

  return posts.sort((a, b) => (
    b.published - a.published
    || a.recordOrder - b.recordOrder
    || a.categoryOrder - b.categoryOrder
  ));
}

function buildSearchIndex(posts) {
  const output = posts.map((post) => ({
    title: post.title,
    date: post.date,
    category: post.displayCategory,
    url: post.url,
    summary: post.summary,
    text: post.text,
  }));

  return `${JSON.stringify({ posts: output }, null, 2)}\n`;
}

function buildSearchDataScript(posts) {
  return `window.me0wberrySearchIndex = ${buildSearchIndex(posts).trim()};\n`;
}

function buildRss(posts) {
  const latestDate = posts.length ? posts[0].published : new Date(0);
  const items = posts.map((post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}${escapeXml(post.url)}</link>
      <guid isPermaLink="true">${SITE_URL}${escapeXml(post.url)}</guid>
      <pubDate>${post.published.toUTCString()}</pubDate>
      <category>${escapeXml(post.displayCategory)}</category>
      <description>${escapeXml(post.summary)}</description>
    </item>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="feed.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>me0wberry.com</title>
    <link>${SITE_URL}/</link>
    <description>monthly updates from me0wberry.com ♡</description>
    <language>en-ca</language>
    <lastBuildDate>${latestDate.toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}

function extractListItems(contentHtml) {
  return [...contentHtml.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((match) => htmlToText(match[1]).replace(/^[–—-]\s*/, '').trim())
    .filter(Boolean);
}

function buildHomeSummary(post) {
  const items = extractListItems(post.contentHtml);
  const firstListCount = (post.contentHtml.match(/<li\b/gi) || []).length;
  const listBlocks = [...post.contentHtml.matchAll(/<ul\b[^>]*>([\s\S]*?)<\/ul>/gi)]
    .map((match) => extractListItems(match[1]));
  const whereItems = listBlocks[0] || items.slice(0, Math.min(3, firstListCount));
  const intoItems = listBlocks[1] || [];
  const renderItems = (values) => values.map((value) => `            <li>${escapeHtml(value)}</li>`).join('\n');

  return `${HOME_START}
          <div class="panel-updated">${escapeHtml(post.date)}</div>
          <div class="now-summary-title">${escapeHtml(post.title)}</div>
          <div class="panel-px-label">where i'm at (ᐢ. .ᐢ) ₊˚⊹</div>
          <div class="panel-section-body"><ul>
${renderItems(whereItems)}
          </ul></div>
          <div class="hearts-divider">────── ♡ · ♡ · ♡ ──────</div>
          <div class="panel-px-label">what i'm into ˖°</div>
          <div class="panel-section-body"><ul>
${renderItems(intoItems)}
          </ul></div>
          <hr class="plain-divider"/>
          <div class="now-note-label">♡ a note ₓ˚.</div>
          <div class="panel-section-body now-fixed-note">${escapeHtml(STATIC_HOME_NOTE)}</div>
          <hr class="dashed-divider"/>
          <div class="panel-px-label" style="margin-top:4px;">archive:</div>
          <ul class="posts-list" id="posts-lately">
            <!-- populated by JS -->
          </ul>
          <div class="now-summary-actions">
            <a href="now/index.html" class="pixel-btn">open now ↗</a>
            <a href="archive/lately/index.html" class="pixel-btn">view all posts ↗</a>
          </div>
${HOME_END}`;
}

function buildNowEntry(post) {
  const images = Array.isArray(post.images) ? post.images : [];
  const gallery = images.length ? `
            <div class="now-gallery${images.length === 1 ? ' is-single' : ''}">
${images.map((name) => `              <img src="../images/lately/${escapeHtml(name)}" alt="${escapeHtml(post.title)}" loading="lazy" decoding="async">`).join('\n')}
            </div>` : '';

  return `${NOW_START}
          <article class="now-entry">
            <div class="pixel-tag">/ now</div>
            <h1 class="panel-heading">${escapeHtml(post.title)}</h1>
            <div class="panel-updated">${escapeHtml(post.date)}</div>
            <div class="now-post-content">
${post.contentHtml}
            </div>${gallery}
            <div class="now-entry-actions">
              <a href="..${escapeHtml(post.url)}" class="pixel-btn">open this post ↗</a>
              <a href="../archive/lately/index.html" class="pixel-btn">past updates ↗</a>
              <a href="../feed.xml" class="pixel-btn">rss feed ↗</a>
            </div>
          </article>
${NOW_END}`;
}

function buildMonthlyPoll(post) {
  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december',
  ];
  const match = /^([a-z]+)\s+(\d{4})$/i.exec(String(post.date).trim());
  const monthName = match ? match[1].toLowerCase() : '';
  const monthIndex = months.indexOf(monthName);
  if (!match || monthIndex < 0) {
    throw new Error('The latest Now date must use the format "month year" to build the monthly poll.');
  }

  const pollId = match[2] + '-' + String(monthIndex + 1).padStart(2, '0');
  const options = ['now', 'games', 'music', 'food', 'stubby', 'beauty']
    .map((option) => '              <button class="monthly-poll-option" type="button" data-poll-option="' + option + '"><span class="monthly-poll-label">' + option + '</span><span class="monthly-poll-count" data-poll-count>...</span><span class="monthly-poll-bar" aria-hidden="true"><span data-poll-fill></span></span></button>')
    .join('\n');

  return [
    POLL_START,
    '          <section class="monthly-poll" data-monthly-poll data-poll-id="' + pollId + '" aria-labelledby="monthly-poll-title">',
    '            <div class="pixel-tag">/ tiny poll</div>',
    '            <h2 id="monthly-poll-title">' + monthName + ' question ♡</h2>',
    '            <p class="monthly-poll-question">what do you like reading most on me0wberry.com ?</p>',
    '            <div class="monthly-poll-options">',
    options,
    '            </div>',
    '            <p class="monthly-poll-status" data-poll-status aria-live="polite">counting votes . . .</p>',
    '            <p class="monthly-poll-note">one choice per browser · anonymous counts by <a href="https://counterapi.com/" target="_blank" rel="noopener">counterapi ↗</a></p>',
    '          </section>',
    POLL_END,
  ].join('\n');
}

function replaceMarkedContent(source, start, end, replacement, fileName) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end);
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error(`Missing generated content markers in ${fileName}.`);
  }

  return `${source.slice(0, startIndex)}${replacement}${source.slice(endIndex + end.length)}`;
}

function writeAtomic(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tempPath, contents, 'utf8');
  fs.renameSync(tempPath, filePath);
}

function buildSourceBundle(files, label) {
  const sections = files.map((file) => {
    const filePath = path.join(ROOT, file);
    if (!fs.existsSync(filePath)) throw new Error(`Missing ${label} source ${file}.`);
    return fs.readFileSync(filePath, 'utf8').trimEnd();
  });
  return `${sections.join('\n\n')}\n`;
}

function buildArchiveCategoryPage(category, template) {
  const replacements = {
    PAGE_TITLE: category.label,
    CATEGORY_ID: category.id,
    CATEGORY_LABEL: category.label,
    TITLEBAR_LABEL: category.titlebarLabel || category.label,
  };

  const output = template.replace(/\{\{([A-Z_]+)\}\}/g, (token, key) => {
    if (!(key in replacements)) throw new Error(`Unknown archive template token ${token}.`);
    return replacements[key];
  });
  if (/\{\{[A-Z_]+\}\}/.test(output)) throw new Error(`Unresolved archive template token for ${category.id}.`);
  return output;
}

function repositoryBuildLabel() {
  const countResult = spawnSync('git', ['rev-list', '--count', 'HEAD'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  if (countResult.status !== 0) {
    throw new Error(`Could not read the repository build number (${countResult.stderr.trim() || 'git failed'}).`);
  }

  const statusResult = spawnSync('git', ['status', '--porcelain', '--untracked-files=normal'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  if (statusResult.status !== 0) {
    throw new Error(`Could not inspect repository changes (${statusResult.stderr.trim() || 'git failed'}).`);
  }

  const committedCount = Number.parseInt(countResult.stdout.trim(), 10);
  const pendingCommit = statusResult.stdout.trim() ? 1 : 0;
  return `v0.${committedCount + pendingCommit}`;
}

function buildSiteData({ write = true } = {}) {
  if (write) tagPublicHtmlFiles(ROOT);

  const posts = readPosts();
  const latestNow = posts.find((post) => post.category === 'lately');
  if (!latestNow) throw new Error('No now post is available to build the current page.');

  const indexPath = path.join(ROOT, 'index.html');
  const nowPath = path.join(ROOT, 'now', 'index.html');
  const systemPath = path.join(ROOT, 'system', 'index.html');
  const indexSource = fs.readFileSync(indexPath, 'utf8');
  const nowSource = fs.readFileSync(nowPath, 'utf8');
  const systemSource = fs.readFileSync(systemPath, 'utf8');
  const archiveTemplate = fs.readFileSync(ARCHIVE_TEMPLATE, 'utf8');
  const nowWithEntry = replaceMarkedContent(nowSource, NOW_START, NOW_END, buildNowEntry(latestNow), 'now/index.html');
  const builtNowPage = replaceMarkedContent(
    nowWithEntry,
    POLL_START,
    POLL_END,
    buildMonthlyPoll(latestNow),
    'now/index.html',
  );
  const outputs = [
    {
      file: 'style.css',
      contents: buildSourceBundle(STYLE_SOURCES, 'stylesheet'),
    },
    {
      file: 'script.js',
      contents: buildSourceBundle(SCRIPT_SOURCES, 'script'),
    },
    {
      file: 'data/search-index.json',
      contents: buildSearchIndex(posts),
    },
    {
      file: 'data/search-index.js',
      contents: buildSearchDataScript(posts),
    },
    {
      file: 'feed.xml',
      contents: buildRss(posts),
    },
    {
      file: 'index.html',
      contents: replaceMarkedContent(indexSource, HOME_START, HOME_END, buildHomeSummary(latestNow), 'index.html'),
    },
    {
      file: 'now/index.html',
      contents: builtNowPage,
    },
    {
      file: 'system/index.html',
      contents: replaceMarkedContent(systemSource, BUILD_START, BUILD_END, `${BUILD_START}${repositoryBuildLabel()}${BUILD_END}`, 'system/index.html'),
    },
    ...ARCHIVE_CATEGORIES.map((category) => ({
      file: `archive/${category.id}/index.html`,
      contents: buildArchiveCategoryPage(category, archiveTemplate),
    })),
  ];

  if (write) {
    outputs.forEach((output) => writeAtomic(path.join(ROOT, output.file), output.contents));
  }

  return outputs;
}

if (require.main === module) {
  const outputs = buildSiteData();
  console.log(`updated ${outputs.map((output) => output.file).join(', ')}`);
}

module.exports = {
  buildSiteData,
  displayCategory,
  extractDivInnerHtml,
  htmlToText,
  repositoryBuildLabel,
};
