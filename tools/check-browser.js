const fs = require('fs');
const http = require('http');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright-core');
const { ARCHIVE_CATEGORIES } = require('./site-config');

const ROOT = path.resolve(__dirname, '..');
const CONTENT_TYPES = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.mp3', 'audio/mpeg'],
  ['.mp4', 'video/mp4'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp'],
  ['.xml', 'application/xml; charset=utf-8'],
  ['.xsl', 'application/xml; charset=utf-8'],
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function localFileForRequest(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, 'http://127.0.0.1').pathname);
  const relativePath = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
  const filePath = path.resolve(ROOT, `.${relativePath}`);
  return filePath.startsWith(ROOT) ? filePath : null;
}

function startServer() {
  const server = http.createServer((request, response) => {
    const filePath = localFileForRequest(request.url);
    if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found.');
      return;
    }

    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Type': CONTENT_TYPES.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream',
    });
    fs.createReadStream(filePath).pipe(response);
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function browserOptions() {
  const options = { headless: true };
  const configuredPath = process.env.ME0WBERRY_BROWSER_PATH;
  const edgePaths = process.platform === 'win32' ? [
    configuredPath,
    path.join(process.env['PROGRAMFILES(X86)'] || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    path.join(process.env.PROGRAMFILES || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  ].filter(Boolean) : [configuredPath].filter(Boolean);
  const executablePath = edgePaths.find((candidate) => fs.existsSync(candidate));

  if (executablePath) options.executablePath = executablePath;
  else options.channel = 'msedge';
  return options;
}

async function openCheckedPage(browser, url, viewport) {
  const page = await browser.newPage({ viewport });
  const problems = [];
  page.on('pageerror', (error) => problems.push(error.message));
  page.on('response', (response) => {
    if (response.url().startsWith('http://127.0.0.1') && response.status() >= 400) {
      problems.push(`${response.status()} ${response.url()}`);
    }
  });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(250);
  assert(problems.length === 0, `${url} reported browser problems:\n${problems.join('\n')}`);
  return page;
}

async function run() {
  const server = await startServer();
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const browser = await chromium.launch(browserOptions());

  try {
    const desktop = await openCheckedPage(browser, `${baseUrl}/?entered=1`, { width: 1440, height: 900 });
    assert(await desktop.locator('#topbar').isVisible(), 'desktop topbar is not visible');
    assert(await desktop.locator('#sidebar').isVisible(), 'desktop sidebar is not visible');
    await desktop.locator('#sidebar [data-opens="panel-player"]').click();
    assert(await desktop.locator('#panel-player').isVisible(), 'desktop player did not open');
    await desktop.close();

    const mobile = await openCheckedPage(browser, `${baseUrl}/?entered=1`, { width: 390, height: 844 });
    await mobile.locator('#sidebar [data-opens="panel-player"]').click();
    assert(await mobile.locator('#panel-player').isVisible(), 'mobile player did not open');
    await mobile.close();

    const themed = await openCheckedPage(browser, `${baseUrl}/system/`, { width: 1280, height: 900 });
    await themed.locator('[data-theme-choice="matcha-cream"]').click();
    assert(await themed.evaluate(() => document.documentElement.dataset.theme) === 'matcha-cream', 'theme control did not apply');
    await themed.goto(`${baseUrl}/info/`, { waitUntil: 'domcontentloaded' });
    assert(await themed.evaluate(() => document.documentElement.dataset.theme) === 'matcha-cream', 'theme did not persist');
    await themed.evaluate(() => window.setSiteTheme('main'));
    await themed.close();

    const archive = await openCheckedPage(browser, `${baseUrl}/archive/`, { width: 1280, height: 900 });
    await archive.locator('#archive-search').fill('stubby');
    await archive.waitForTimeout(100);
    assert(await archive.locator('.archive-search-result').count() > 0, 'archive search returned no Stubby results');
    await archive.close();

    for (const category of ARCHIVE_CATEGORIES) {
      const categoryArchive = await openCheckedPage(
        browser,
        `${baseUrl}/archive/${category.id}/`,
        { width: 1280, height: 900 },
      );
      assert(
        await categoryArchive.locator(`body[data-archive-category="${category.id}"]`).count() === 1,
        `${category.id} archive has the wrong category configuration`,
      );
      assert(
        (await categoryArchive.locator('.panel-heading').textContent()).trim() === `${category.label} archive`,
        `${category.id} archive has the wrong visible heading`,
      );
      assert(await categoryArchive.locator('#archive-list > div').count() > 0, `${category.id} archive loaded no posts`);
      await categoryArchive.close();
    }

    const post = await openCheckedPage(
      browser,
      `${baseUrl}/posts/beauty/2026-07-29-july-update.html`,
      { width: 1280, height: 900 },
    );
    assert(await post.locator('link[href="../../post.css"]').count() === 1, 'post.css is not linked once');
    assert(await post.locator('#panel-player .player-controls').isVisible(), 'modern post player controls are not visible');
    assert(
      await post.locator('.post-container').evaluate((element) => parseFloat(getComputedStyle(element).borderRadius) >= 14),
      'post window did not receive the rounded chrome',
    );
    const postWindow = await post.locator('.post-container').boundingBox();
    const postPlayer = await post.locator('#panel-player').boundingBox();
    assert(postWindow && postPlayer && postWindow.x + postWindow.width < postPlayer.x, 'desktop post player overlaps the post window');
    await post.locator('.slide-next').click();
    assert((await post.locator('#post-slide-track').getAttribute('style') || '').includes('-100%'), 'post gallery did not advance');
    await post.close();

    const mobilePost = await openCheckedPage(
      browser,
      `${baseUrl}/posts/beauty/2026-07-29-july-update.html`,
      { width: 390, height: 844 },
    );
    assert(await mobilePost.locator('#panel-player').isVisible(), 'mobile post player is not accessible');
    assert(
      await mobilePost.locator('#panel-player').evaluate((element) => getComputedStyle(element).position === 'static'),
      'mobile post player did not join the page flow',
    );
    await mobilePost.close();

    const persona = await openCheckedPage(browser, `${baseUrl}/persona/`, { width: 1440, height: 900 });
    assert(
      await persona.locator('.persona-page-panel').evaluate((element) => getComputedStyle(element).position === 'relative'),
      'persona panel is still using floating-window sizing',
    );
    assert(
      await persona.locator('.persona-page-panel > .panel-body').evaluate((element) => element.scrollHeight <= element.clientHeight + 2),
      'persona panel still clips its content into an inner scroller',
    );
    await persona.close();

    const toybox = await openCheckedPage(browser, `${baseUrl}/toybox/`, { width: 1280, height: 900 });
    assert(await toybox.locator('.toybox-kaomoji').count() === 129, 'complete kaomoji catalogue did not render');
    const expectedKaomojiCounts = { cats: 12, happy: 50, sweet: 30, moods: 37 };
    for (const [group, expectedCount] of Object.entries(expectedKaomojiCounts)) {
      const shelf = toybox.locator(`[data-kaomoji-group="${group}"]`);
      assert(await shelf.locator('.toybox-kaomoji').count() === expectedCount, `${group} kaomoji shelf count drifted`);
      assert(await shelf.locator('.toybox-kaomoji:visible').count() === 8, `${group} kaomoji preview is not compact`);
    }
    const sweetFaces = await toybox.locator('[data-kaomoji-group="sweet"] .toybox-kaomoji-value').allTextContents();
    const catFaces = await toybox.locator('[data-kaomoji-group="cats"] .toybox-kaomoji-value').allTextContents();
    const allFaces = await toybox.locator('.toybox-kaomoji-value').allTextContents();
    const removedFaces = ['₍⸍⸌̣ʷ̣̫⸍̣⸌₎', '꒰(ू•‧̫•ू )꒱', 'Ꮚ♡ꈊ♡Ꮚ', 'ʜîʚ₍⑅ᐢ.ˬ.ᐢ₎♡', '⧫(◕ ˑ̫ ◕)⧫'];
    assert(removedFaces.every((face) => !allFaces.includes(face)), 'removed kaomojis are still present');
    assert(allFaces.includes('( •́ ω•́ )✧') && !allFaces.includes('( • ̀ω•́ )✧'), 'corrected happy kaomoji is missing');
    assert(sweetFaces.includes('𐔌՞ ܸ.ˬ.ܸ՞𐦯') && sweetFaces.includes('𐔌՞. .՞𐦯') && sweetFaces.includes('₍⑅ᐢ..ᐢ₎♡'), 'sweet kaomoji moves are missing');
    assert(!catFaces.includes('𐔌՞ ܸ.ˬ.ܸ՞𐦯') && !catFaces.includes('𐔌՞. .՞𐦯') && !catFaces.includes('₍⑅ᐢ..ᐢ₎♡'), 'moved sweet kaomojis remain in cats');
    await toybox.locator('[data-kaomoji-group="sweet"] .toybox-kaomoji-toggle').click();
    assert(await toybox.locator('[data-kaomoji-group="sweet"] .toybox-kaomoji:visible').count() === 30, 'sweet kaomoji shelf did not expand');
    await toybox.locator('[data-kaomoji-group="sweet"] .toybox-kaomoji-toggle').click();
    assert(await toybox.locator('[data-kaomoji-group="sweet"] .toybox-kaomoji:visible').count() === 8, 'sweet kaomoji shelf did not collapse');
    assert(
      await toybox.locator('body').evaluate((element) => getComputedStyle(element).cursor.includes('luna-heart.gif')),
      'Luna Town heart cursor did not load',
    );
    assert(
      await toybox.locator('a').first().evaluate((element) => getComputedStyle(element).cursor.includes('luna-cake-slice.gif')),
      'Luna Town cake cursor did not load for links',
    );
    assert(
      await toybox.locator('.toybox-kaomoji').first().evaluate((element) => getComputedStyle(element).cursor.includes('luna-cake-slice.gif')),
      'copyable kaomoji still overrides the Luna Town cake cursor',
    );
    assert(
      await toybox.locator('#toybox-blinkie-shelf .toybox-collected-graphic:visible').count() === 6,
      'default trinkets view did not keep the blinkie preview compact',
    );
    await toybox.locator('[data-filter="blinkie"]').click();
    assert(
      await toybox.locator('#toybox-blinkie-shelf .toybox-collected-graphic:visible').count() === 12,
      'blinkie filter did not reveal the full collection',
    );
    await toybox.close();

    const media = await openCheckedPage(browser, `${baseUrl}/?entered=1`, { width: 1280, height: 900 });
    const representativeMedia = [
      '/images/food/img-6863.webp',
      '/images/stubby/img-6485.webp',
      '/images/games/IMG_1943.webp',
      '/images/music/img-6109.webp',
      '/images/lately/screenshot-2026-05-18-164501.webp',
      '/images/pokemon/shinies/scarlet-shiny-annihilape.webp',
    ];
    const decodedMedia = await media.evaluate(async (urls) => Promise.all(urls.map((url) => new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image.naturalWidth > 0 && image.naturalHeight > 0);
      image.onerror = () => resolve(false);
      image.src = url;
    }))), representativeMedia);
    assert(decodedMedia.every(Boolean), 'representative optimized media did not decode in Edge');
    await media.close();

    const directFile = await openCheckedPage(
      browser,
      `${pathToFileURL(path.join(ROOT, 'index.html')).href}?entered=1`,
      { width: 1280, height: 900 },
    );
    await directFile.waitForTimeout(150);
    assert(await directFile.locator('#posts-games li').count() > 0, 'direct-file homepage did not load bundled post data');
    await directFile.close();

    const directToybox = await openCheckedPage(
      browser,
      pathToFileURL(path.join(ROOT, 'toybox', 'index.html')).href,
      { width: 1280, height: 900 },
    );
    assert(await directToybox.locator('.toybox-kaomoji').count() >= 80, 'direct-file trinkets did not load its kaomoji data');
    await directToybox.close();
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }

  console.log('browser check passed: desktop, mobile, themes, archives, post chrome, persona layout, optimized media, and direct-file preview.');
}

run().catch((error) => {
  console.error(`browser check failed: ${error.message}`);
  process.exitCode = 1;
});
