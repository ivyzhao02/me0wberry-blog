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

async function openCheckedPage(browser, url, viewport, setup) {
  const page = await browser.newPage({ viewport });
  const problems = [];
  page.on('pageerror', (error) => problems.push(error.message));
  page.on('response', (response) => {
    if (response.url().startsWith('http://127.0.0.1') && response.status() >= 400) {
      problems.push(`${response.status()} ${response.url()}`);
    }
  });
  if (setup) await setup(page);
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
    const welcome = await openCheckedPage(browser, `${baseUrl}/`, { width: 1280, height: 800 });
    assert(new URL(welcome.url()).pathname === '/welcome/index.html', 'a fresh session did not begin on the welcome page');
    await welcome.evaluate(() => {
      localStorage.setItem('me0wberry_passport_v1', JSON.stringify({
        stamps: ['wander', 'naranya', 'love-ball', 'pixel-cat'],
      }));
    });
    await welcome.reload({ waitUntil: 'domcontentloaded' });
    assert(await welcome.locator('[data-passport-progress]').isVisible(), 'completed passport progress is hidden on welcome');
    assert(await welcome.locator('[data-passport-slot].is-stamped').count() === 4, 'passport did not render all saved stamps');
    await welcome.locator('[data-passport-reward]').click();
    assert(await welcome.locator('[data-passport-dialog]').evaluate((dialog) => dialog.open), 'passport reward did not open');
    await welcome.locator('[data-passport-envelope]').click();
    await welcome.locator('[data-passport-postcard-stage].is-revealed').waitFor({ state: 'visible' });
    await welcome.locator('[data-passport-postcard]').click();
    assert(await welcome.locator('[data-passport-postcard]').getAttribute('aria-pressed') === 'true', 'passport postcard did not flip');
    await welcome.locator('[data-passport-close]').click();
    await Promise.all([
      welcome.waitForURL(`${baseUrl}/`),
      welcome.locator('#welcome-enter').click(),
    ]);
    assert(
      await welcome.evaluate(() => sessionStorage.getItem('me0wberry_entered')) === '1',
      'entering the site did not persist for the current tab session',
    );
    await welcome.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
    await welcome.waitForTimeout(100);
    assert(new URL(welcome.url()).pathname === '/', 'an entered session was sent back to welcome');
    await welcome.close();

    const desktop = await openCheckedPage(browser, `${baseUrl}/?entered=1`, { width: 1440, height: 900 });
    assert(await desktop.locator('#topbar').isVisible(), 'desktop topbar is not visible');
    assert(await desktop.locator('#sidebar').isVisible(), 'desktop sidebar is not visible');
    const bioMetrics = await desktop.locator('#panel-bio').evaluate((panel) => {
      const panelRect = panel.getBoundingClientRect();
      const mainRect = panel.parentElement.getBoundingClientRect();
      return {
        widthGap: mainRect.width - panelRect.width,
        heightGap: mainRect.height - panelRect.height,
        resizeVisible: getComputedStyle(panel.querySelector('.panel-resize')).display !== 'none',
      };
    });
    assert(bioMetrics.widthGap <= 26, 'desktop Hello window does not fill the workspace width');
    assert(bioMetrics.heightGap <= 26, 'desktop Hello window does not fill the workspace height');
    assert(!bioMetrics.resizeVisible, 'full-sized Hello window still exposes its resize handle');
    await desktop.locator('#bio-tabbar .tab-btn').filter({ hasText: 'find me' }).click();
    assert(await desktop.locator('#bio-findme').isVisible(), 'Hello window tab did not switch');
    await desktop.locator('#bio-findme button').filter({ hasText: 'discord' }).click();
    assert(await desktop.locator('#discord-popup').isVisible(), 'Discord popup did not open');
    await desktop.locator('#discord-popup .discord-ok').click();
    assert(!await desktop.locator('#discord-popup').isVisible(), 'Discord popup did not close');
    await desktop.locator('#bio-tabbar .tab-btn').filter({ hasText: 'about' }).click();
    const gamesNav = desktop.locator('#sidebar [data-opens="panel-games"]');
    await gamesNav.focus();
    await gamesNav.press('Enter');
    assert(await desktop.locator('#panel-games').isVisible(), 'keyboard navigation did not open a content window');
    assert(!await desktop.locator('#panel-bio').isVisible(), 'opening a content window did not close the previous one');
    await desktop.locator('#panel-games .panel-close').click();
    assert(!await desktop.locator('#panel-games').isVisible(), 'content window did not close');
    await desktop.locator('.taskbar-start').click();
    assert(await desktop.locator('#panel-bio').isVisible(), 'taskbar Start did not restore the Hello window');
    for (const category of ['games', 'music', 'food', 'stubby', 'beauty']) {
      const categoryLinks = desktop.locator(`#latest-${category} a[href], #posts-${category} a[href]`);
      assert(await categoryLinks.count() > 0, `${category} homepage panel has no post links`);
      const hrefs = await categoryLinks.evaluateAll((links) => links.map((link) => link.href));
      assert(
        hrefs.every((href) => href && !href.includes('undefined') && href.includes(`/posts/${category}/`)),
        `${category} homepage panel contains an invalid post link`,
      );
    }
    const playerPanel = desktop.locator('#panel-player');
    await desktop.locator('#sidebar .nav-item').filter({ hasText: 'player' }).click();
    assert(await playerPanel.isVisible(), 'desktop player window did not come to the front');
    await playerPanel.locator('.panel-pin').click();
    assert(await playerPanel.locator('.panel-pin').getAttribute('aria-pressed') === 'true', 'player window did not pin');
    await desktop.locator('#sidebar .nav-item').filter({ hasText: 'gifypets' }).click();
    const gifypetsPanel = desktop.locator('#panel-gifypet');
    assert(await gifypetsPanel.isVisible(), 'desktop Gifypets window did not open');
    assert(await gifypetsPanel.locator('[data-gifypet-stage="stubby"]').isVisible(), 'Stubby GifyPet is not the default tab');
    await gifypetsPanel.locator('[data-gifypet-tab="cactus"]').click();
    assert(await gifypetsPanel.locator('[data-gifypet-stage="cactus"]').isVisible(), 'Cactus GifyPet tab did not open');
    await gifypetsPanel.locator('.panel-pin').click();
    assert(await gifypetsPanel.locator('.panel-pin').getAttribute('aria-pressed') === 'true', 'Gifypets window did not pin');
    await desktop.locator('#sidebar [data-opens="panel-games"]').click();
    assert(await gifypetsPanel.isVisible(), 'pinned Gifypets window closed behind a content panel');
    const gamePanelZ = Number(await desktop.locator('#panel-games').evaluate((panel) => getComputedStyle(panel).zIndex));
    const playerPanelZ = Number(await playerPanel.evaluate((panel) => getComputedStyle(panel).zIndex));
    const gifypetsPanelZ = Number(await gifypetsPanel.evaluate((panel) => getComputedStyle(panel).zIndex));
    assert(playerPanelZ > gamePanelZ && gifypetsPanelZ > gamePanelZ, 'pinned utility windows did not stay above normal panels');

    const [gifypetsPopup] = await Promise.all([
      desktop.waitForEvent('popup'),
      gifypetsPanel.locator('.panel-popout').click(),
    ]);
    await gifypetsPopup.waitForLoadState('domcontentloaded');
    assert(gifypetsPopup.url().includes('/popout/index.html?app=gifypets'), 'Gifypets popup opened the wrong page');
    assert(await gifypetsPopup.locator('body.popout-page').count() === 1, 'Gifypets popup is missing site theming');
    assert(await gifypetsPopup.locator('[data-popout-app="gifypets"]').isVisible(), 'Gifypets popup content is not visible');
    assert(await gifypetsPopup.locator('#popout-title').textContent() === 'gifypets', 'Gifypets popup title is incorrect');
    assert(await gifypetsPopup.locator('#popout-footer-note').textContent() === 'take good care of them ♡', 'Gifypets popup care note is incorrect');
    assert(await gifypetsPopup.locator('[data-popout-gifypet-stage="cactus"]').isVisible(), 'selected GifyPet did not carry into the popup');
    assert(await gifypetsPanel.locator('[data-popout-indicator="gifypets"]').isVisible(), 'Gifypets panel did not collapse into an indicator');
    await gifypetsPopup.close();
    await desktop.waitForTimeout(500);
    assert(await gifypetsPanel.locator('[data-utility-content="gifypets"]').isVisible(), 'Gifypets panel did not restore after its popup closed');

    await desktop.evaluate(() => window.me0wberryPlayer.applyState({
      trackId: 'forever-and',
      currentTime: 0,
      volume: 0.42,
      playing: false,
    }));
    const [playerPopup] = await Promise.all([
      desktop.waitForEvent('popup'),
      playerPanel.locator('.panel-popout').click(),
    ]);
    await playerPopup.waitForLoadState('domcontentloaded');
    assert(playerPopup.url().includes('/popout/index.html?app=player'), 'player popup opened the wrong page');
    assert(await playerPopup.locator('body.popout-page').count() === 1, 'player popup is missing site theming');
    assert(await playerPopup.locator('#popout-player-playpause').isVisible(), 'popped-out player controls are not visible');
    assert((await playerPopup.locator('#popout-player-title').textContent()).includes('forever &'), 'player track did not carry into the popup');
    assert(await playerPopup.locator('#popout-player-volume').inputValue() === '0.42', 'player volume did not carry into the popup');
    assert(await playerPanel.locator('[data-popout-indicator="player"]').isVisible(), 'player panel did not collapse into an indicator');
    await playerPanel.locator('[data-popout-indicator="player"] button').filter({ hasText: 'bring back' }).click();
    await desktop.waitForTimeout(100);
    assert(playerPopup.isClosed(), 'player popup did not close when docked');
    assert(await playerPanel.locator('[data-utility-content="player"]').isVisible(), 'player panel did not restore after docking');
    assert((await playerPanel.locator('#player-title').textContent()).includes('forever &'), 'player track did not return after docking');
    assert(await playerPanel.locator('#player-volume').inputValue() === '0.42', 'player volume did not return after docking');

    await playerPanel.locator('.panel-close').click();
    assert(!await playerPanel.isVisible(), 'player did not close');
    assert(
      await desktop.evaluate(() => sessionStorage.getItem('me0wberry_player_visibility_v1')) === 'closed',
      'closed player state was not saved for the current tab session',
    );
    await desktop.locator('#sidebar [data-opens="panel-games"]').click();
    assert(!await playerPanel.isVisible(), 'opening another desktop section reopened the player');

    const [closedStateGifypetsPopup] = await Promise.all([
      desktop.waitForEvent('popup'),
      gifypetsPanel.locator('.panel-popout').click(),
    ]);
    await closedStateGifypetsPopup.waitForLoadState('domcontentloaded');
    assert(!await playerPanel.isVisible(), 'opening a GifyPet popup reopened the player');
    await closedStateGifypetsPopup.close();
    await desktop.waitForTimeout(500);

    const [sessionPost] = await Promise.all([
      desktop.waitForEvent('popup'),
      desktop.evaluate((url) => window.open(url, '_blank'), `${baseUrl}/posts/beauty/2026-07-29-july-update.html`),
    ]);
    await sessionPost.waitForLoadState('domcontentloaded');
    await sessionPost.waitForTimeout(100);
    assert(!await sessionPost.locator('#panel-player').isVisible(), 'a new post tab ignored the closed player state');

    await desktop.locator('#sidebar [data-opens="panel-player"]').click();
    assert(await desktop.locator('#panel-player').isVisible(), 'desktop player did not open');
    await sessionPost.waitForTimeout(100);
    assert(await sessionPost.locator('#panel-player').isVisible(), 'reopening the player did not sync to another tab');
    await playerPanel.locator('.panel-close').click();
    await sessionPost.waitForTimeout(100);
    assert(!await sessionPost.locator('#panel-player').isVisible(), 'closing the player did not sync to another tab');
    await sessionPost.close();
    await desktop.locator('#sidebar [data-opens="panel-player"]').click();
    assert(await desktop.locator('#panel-player').isVisible(), 'desktop player did not reopen after a session close');
    await desktop.close();

    const mobile = await openCheckedPage(browser, `${baseUrl}/?entered=1`, { width: 390, height: 844 });
    const [mobileGifypetsPopup] = await Promise.all([
      mobile.waitForEvent('popup'),
      mobile.locator('#sidebar .nav-item').filter({ hasText: 'gifypets' }).click(),
    ]);
    await mobileGifypetsPopup.waitForLoadState('domcontentloaded');
    assert(await mobileGifypetsPopup.locator('body.popout-page').count() === 1, 'mobile Gifypets page is not themed');
    assert(await mobileGifypetsPopup.locator('[data-popout-app="gifypets"]').isVisible(), 'mobile Gifypets content is not visible');
    await mobileGifypetsPopup.close();
    await mobile.waitForTimeout(500);

    const [mobilePlayerPopup] = await Promise.all([
      mobile.waitForEvent('popup'),
      mobile.locator('#sidebar [data-opens="panel-player"]').click(),
    ]);
    await mobilePlayerPopup.waitForLoadState('domcontentloaded');
    assert(await mobilePlayerPopup.locator('body.popout-page').count() === 1, 'mobile player page is not themed');
    assert(await mobilePlayerPopup.locator('#popout-player-playpause').isVisible(), 'mobile popped-out player controls are not visible');
    await mobilePlayerPopup.close();
    await mobile.waitForTimeout(500);
    await mobile.locator('#sidebar [data-opens="panel-games"]').click();
    assert(await mobile.locator('#panel-games').isVisible(), 'mobile content window did not open');
    assert(!await mobile.locator('#sidebar').isVisible(), 'mobile sidebar stayed visible behind a content window');
    await mobile.locator('#panel-games .panel-close').click();
    assert(await mobile.locator('#sidebar').isVisible(), 'closing a mobile content window did not restore navigation');
    await mobile.locator('#sidebar [data-opens="panel-games"]').click();
    await mobile.locator('#mobile-back').click();
    assert(await mobile.locator('#sidebar').isVisible(), 'mobile Back did not restore navigation');
    await mobile.close();

    const directMobileInfo = await openCheckedPage(browser, `${baseUrl}/info/`, { width: 390, height: 844 });
    assert(await directMobileInfo.locator('#mobile-back').evaluate((element) => element.tagName === 'A'), 'mobile page Back is not a reliable link');
    assert(await directMobileInfo.locator('#mobile-back').getAttribute('href') === '../index.html', 'mobile page Back has the wrong fallback destination');
    await Promise.all([
      directMobileInfo.waitForURL('**/welcome/index.html'),
      directMobileInfo.locator('#mobile-back').click(),
    ]);
    assert(new URL(directMobileInfo.url()).pathname === '/welcome/index.html', 'direct-entry mobile Back did not return to the site entrance');
    await directMobileInfo.close();

    const themed = await openCheckedPage(browser, `${baseUrl}/system/`, { width: 1280, height: 900 });
    await themed.locator('[data-theme-choice="matcha-cream"]').click();
    assert(await themed.evaluate(() => document.documentElement.dataset.theme) === 'matcha-cream', 'theme control did not apply');
    await themed.goto(`${baseUrl}/info/`, { waitUntil: 'domcontentloaded' });
    assert(await themed.evaluate(() => document.documentElement.dataset.theme) === 'matcha-cream', 'theme did not persist');
    await themed.evaluate(() => window.setSiteTheme('main'));
    await themed.close();

    const archive = await openCheckedPage(browser, `${baseUrl}/archive/`, { width: 1280, height: 900 });
    assert(await archive.locator('.page-nav-link').count() === 1, 'archive does not use the shared page navigation bubble');
    assert(
      await archive.locator('.page-nav-link').evaluate((element) => getComputedStyle(element).borderRadius === '999px'),
      'archive page navigation bubble styling did not load',
    );
    await archive.locator('#archive-search').fill('stubby');
    await archive.waitForTimeout(100);
    assert(await archive.locator('.archive-search-result').count() > 0, 'archive search returned no Stubby results');
    await archive.locator('#archive-search').fill('a query that cannot match any post');
    assert((await archive.locator('#archive-search-status').textContent()).startsWith('0 posts found'), 'archive search did not report no results');
    await archive.locator('#archive-search-clear').click();
    assert(await archive.locator('#archive-search-results').isHidden(), 'archive clear did not hide old results');
    assert(await archive.locator('#archive-search').evaluate((input) => input === document.activeElement), 'archive clear did not return focus to search');
    await archive.close();

    const pollValues = new Map();
    const poll = await openCheckedPage(
      browser,
      `${baseUrl}/now/`,
      { width: 1280, height: 900 },
      async (page) => {
        await page.route('https://counterapi.com/**', async (route) => {
          const url = new URL(route.request().url());
          const key = decodeURIComponent(url.pathname.split('/').pop());
          let value = pollValues.get(key) || 1;
          if (!url.searchParams.has('readOnly')) {
            value += 1;
            pollValues.set(key, value);
          }
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ value }),
          });
        });
      },
    );
    await poll.waitForFunction(() => document.querySelector('[data-poll-status]')?.textContent.includes('pick one answer'));
    const gamesPollOption = poll.locator('[data-poll-option="games"]');
    await gamesPollOption.click();
    await poll.waitForFunction(() => document.querySelector('[data-poll-status]')?.textContent.includes('you picked games'));
    assert(await gamesPollOption.getAttribute('class').then((value) => value.includes('is-selected')), 'monthly poll did not mark the saved choice');
    assert(await poll.locator('[data-poll-option]:not(:disabled)').count() === 0, 'monthly poll allowed a second vote');
    assert(
      await poll.evaluate(() => localStorage.getItem('me0wberry_poll_2026-08')) === 'games',
      'monthly poll did not save the vote locally',
    );
    await poll.reload({ waitUntil: 'domcontentloaded' });
    await poll.waitForFunction(() => document.querySelector('[data-poll-status]')?.textContent.includes('you picked games'));
    assert(await poll.locator('[data-poll-option="games"].is-selected').count() === 1, 'monthly poll choice did not survive a reload');
    await poll.close();

    const feed = await openCheckedPage(browser, `${baseUrl}/feed.xml`, { width: 1000, height: 900 });
    assert(await feed.locator('.feed-entry').count() > 0, 'RSS reading view did not render entries');
    await feed.locator('[data-feed-filter="stubby"]').click();
    const visibleFeedCategories = await feed.locator('.feed-entry:visible').evaluateAll((entries) => entries.map((entry) => entry.dataset.category));
    assert(visibleFeedCategories.length > 0 && visibleFeedCategories.every((category) => category === 'stubby'), 'RSS category filter showed the wrong posts');
    assert((await feed.locator('#feed-filter-status').textContent()).includes('in stubby'), 'RSS category filter did not update its status');
    await feed.close();

    const wanderer = await openCheckedPage(browser, `${baseUrl}/?entered=1`, { width: 1280, height: 800 });
    await wanderer.evaluate(() => { Math.random = () => 0; });
    await Promise.all([
      wanderer.waitForURL(`${baseUrl}/info/index.html`),
      wanderer.locator('#sidebar button').filter({ hasText: 'surprise me' }).click(),
    ]);
    assert(
      await wanderer.evaluate(() => JSON.parse(localStorage.getItem('me0wberry_passport_v1') || '{}').stamps?.includes('wander')),
      'Surprise Me did not record its passport stamp',
    );
    await wanderer.close();

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
      assert(await categoryArchive.locator('.page-nav-link').count() === 2, `${category.id} archive navigation is inconsistent`);
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
    assert(
      await post.locator('.post-back').first().evaluate((element) => getComputedStyle(element).borderRadius === '999px'),
      'post footer navigation did not receive the shared bubble shape',
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
    assert(await toybox.locator('.page-nav-link').count() === 1, 'trinkets does not use the shared page navigation bubble');
    assert(
      await toybox.locator('.page-nav-link').evaluate((element) => getComputedStyle(element).borderRadius === '999px'),
      'trinkets page navigation bubble styling did not load',
    );
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
    const directPostHref = await directFile.locator('#latest-games a[href]').first().evaluate((link) => link.href);
    assert(
      directPostHref.startsWith('file:') && !directPostHref.includes('undefined'),
      'direct-file homepage generated an invalid post link',
    );
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

  console.log('browser check passed: welcome, stateful desktop/mobile journeys, themes, archives, poll, RSS, passport, post chrome, persona layout, optimized media, and direct-file preview.');
}

run().catch((error) => {
  console.error(`browser check failed: ${error.message}`);
  process.exitCode = 1;
});
