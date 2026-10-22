const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');
const { createStudioServer } = require('./server');

// This fixed fixture is never used by a running authoring session.
const TEST_TOKEN = 'a'.repeat(64);
const PAYLOAD = { category: 'games', title: 'HTTP regression fixture', content: 'Test only.' };

test('Post Studio protects authoring requests without exposing its session token', async (t) => {
  const calls = [];
  const result = { post: 'posts/games/test.html', index: 'posts/games/index.json', images: [] };
  const server = createStudioServer({
    token: TEST_TOKEN,
    createPostHandler: async (payload) => {
      calls.push(payload);
      return result;
    },
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject);
      resolve();
    });
  });
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const port = server.address().port;
  const authority = `127.0.0.1:${port}`;
  const otherPort = port === 65535 ? 1 : port + 1;
  const authorizedHeaders = () => ({
    Host: authority,
    Origin: `http://${authority}`,
    'Content-Type': 'application/json',
    'X-Post-Studio-Token': TEST_TOKEN,
  });

  function request({ method = 'GET', path = '/', headers = { Host: authority }, body } = {}) {
    return new Promise((resolve, reject) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port,
        method,
        path,
        headers,
        setHost: false,
        agent: false,
      }, (res) => {
        let text = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { text += chunk; });
        res.on('error', reject);
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, text }));
      });
      req.setTimeout(5000, () => req.destroy(new Error('Local test request timed out.')));
      req.on('error', reject);
      req.end(body);
    });
  }

  async function rejectedPost(headers, expectedStatus, body = JSON.stringify(PAYLOAD)) {
    const previousCalls = calls.length;
    const response = await request({ method: 'POST', path: '/api/create-post', headers, body });
    assert.equal(response.status, expectedStatus);
    assert.equal(calls.length, previousCalls, 'rejected requests must not invoke the post writer');
    assert.equal(typeof JSON.parse(response.text).error, 'string');
    assert.equal(response.text.includes(TEST_TOKEN), false);
    assert.equal(response.headers['access-control-allow-origin'], undefined);
  }

  await t.test('public shell and assets do not disclose the token and discourage caching or framing', async () => {
    for (const path of ['/', '/index.html', '/app.js', '/style.css']) {
      const response = await request({ path });
      assert.equal(response.status, 200, `${path} should remain available without authoring credentials`);
      assert.equal(response.text.includes(TEST_TOKEN), false);
      assert.equal(response.headers['cache-control'], 'no-store');
      assert.equal(response.headers['referrer-policy'], 'no-referrer');
      assert.equal(response.headers['x-frame-options'], 'DENY');
      assert.equal(response.headers['access-control-allow-origin'], undefined);
      assert.equal(response.headers['set-cookie'], undefined);
    }
    assert.equal(calls.length, 0);
  });

  await t.test('rejects untrusted or wrong-port Host headers for reads and writes', async () => {
    for (const Host of [
      `attacker.invalid:${port}`,
      `localhost.attacker.invalid:${port}`,
      `127.0.0.1.attacker.invalid:${port}`,
      `127.0.0.1:${otherPort}`,
      '127.0.0.1',
    ]) {
      const response = await request({ headers: { Host } });
      assert.equal(response.status, 403);
      await rejectedPost({ ...authorizedHeaders(), Host, Origin: `http://${Host}` }, 403);
    }
  });

  await t.test('requires a matching non-null HTTP Origin even with a valid token', async () => {
    const withoutOrigin = authorizedHeaders();
    delete withoutOrigin.Origin;
    await rejectedPost(withoutOrigin, 403);
    for (const Origin of [
      'null',
      'https://attacker.invalid',
      `http://127.0.0.1:${otherPort}`,
      `https://${authority}`,
      `http://localhost:${port}`,
    ]) {
      await rejectedPost({ ...authorizedHeaders(), Origin }, 403);
    }
  });

  await t.test('rejects simple browser content types before processing their JSON-looking bodies', async () => {
    const withoutContentType = authorizedHeaders();
    delete withoutContentType['Content-Type'];
    await rejectedPost(withoutContentType, 415);
    for (const contentType of [
      'text/plain',
      'application/x-www-form-urlencoded',
      'multipart/form-data; boundary=fixture',
      'application/jsonp',
    ]) {
      await rejectedPost({ ...authorizedHeaders(), 'Content-Type': contentType }, 415);
    }
  });

  await t.test('requires the exact session token in its request header', async () => {
    const withoutToken = authorizedHeaders();
    delete withoutToken['X-Post-Studio-Token'];
    await rejectedPost(withoutToken, 401);
    for (const token of ['', 'wrong-length', 'b'.repeat(64), 'A'.repeat(64)]) {
      await rejectedPost({ ...authorizedHeaders(), 'X-Post-Studio-Token': token }, 401);
    }
  });

  await t.test('malformed authenticated JSON does not reach the writer', async () => {
    await rejectedPost(authorizedHeaders(), 400, '{');
  });

  await t.test('does not grant cross-origin permission through a preflight request', async () => {
    const response = await request({
      method: 'OPTIONS',
      path: '/api/create-post',
      headers: {
        Host: authority,
        Origin: 'https://attacker.invalid',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,x-post-studio-token',
      },
    });
    assert.equal(response.status, 404);
    assert.equal(response.headers['access-control-allow-origin'], undefined);
    assert.equal(response.headers['access-control-allow-headers'], undefined);
    assert.equal(calls.length, 0);
  });

  await t.test('authorized JSON requests reach the injected writer and return its result', async () => {
    for (const Host of [authority, `localhost:${port}`]) {
      const previousCalls = calls.length;
      const response = await request({
        method: 'POST',
        path: '/api/create-post',
        headers: {
          ...authorizedHeaders(),
          Host,
          Origin: `http://${Host}`,
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(PAYLOAD),
      });
      assert.equal(response.status, 200);
      assert.deepEqual(JSON.parse(response.text), result);
      assert.equal(calls.length, previousCalls + 1);
      assert.deepEqual(calls.at(-1), PAYLOAD);
      assert.equal(response.text.includes(TEST_TOKEN), false);
    }
  });
});
