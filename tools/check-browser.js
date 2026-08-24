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
    await post.locator('.slide-next').click();
    assert((await post.locator('#post-slide-track').getAttribute('style') || '').includes('-100%'), 'post gallery did not advance');
    await post.close();

    const directFile = await openCheckedPage(
      browser,
      `${pathToFileURL(path.join(ROOT, 'index.html')).href}?entered=1`,
      { width: 1280, height: 900 },
    );
    await directFile.waitForTimeout(150);
    assert(await directFile.locator('#posts-games li').count() > 0, 'direct-file homepage did not load bundled post data');
    await directFile.close();
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }

  console.log('browser check passed: desktop, mobile, themes, archive search/categories, post gallery, and direct-file preview.');
}

run().catch((error) => {
  console.error(`browser check failed: ${error.message}`);
  process.exitCode = 1;
});
