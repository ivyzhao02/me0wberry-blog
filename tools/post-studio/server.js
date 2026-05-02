const fs = require('fs');
const http = require('http');
const path = require('path');
const {
  CATEGORIES,
  GALLERY_CATEGORIES,
  buildPostHtml,
  createPostRecord,
  slugify,
} = require('./post-generator');

const PORT = Number(process.env.PORT || 8124);
const ROOT = path.resolve(__dirname, '..', '..');
const PUBLIC_FILES = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'application/javascript; charset=utf-8']],
]);

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function safeImageName(name) {
  const ext = path.extname(name).toLowerCase();
  const base = path.basename(name, path.extname(name))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'image';

  return `${base}${ext || '.jpg'}`;
}

function uniqueName(dir, desiredName) {
  const ext = path.extname(desiredName);
  const base = path.basename(desiredName, ext);
  let candidate = desiredName;
  let count = 2;

  while (fs.existsSync(path.join(dir, candidate))) {
    candidate = `${base}-${count}${ext}`;
    count += 1;
  }

  return candidate;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 250 * 1024 * 1024) {
        reject(new Error('Request is too large.'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function writeUploadedImages(category, uploadedImages) {
  const targetCategory = GALLERY_CATEGORIES.has(category) ? category : 'misc';
  const targetDir = path.join(ROOT, 'images', targetCategory);
  fs.mkdirSync(targetDir, { recursive: true });

  return uploadedImages.map((image) => {
    const desiredName = safeImageName(image.name);
    const finalName = uniqueName(targetDir, desiredName);
    const base64 = String(image.data || '').split(',').pop();
    fs.writeFileSync(path.join(targetDir, finalName), Buffer.from(base64, 'base64'));
    return { fileName: finalName, sitePath: `/images/${targetCategory}/${finalName}` };
  });
}

function createPost(payload) {
  const category = String(payload.category || '').trim();
  const title = String(payload.title || '').trim();
  const date = String(payload.date || '').trim();

  if (!CATEGORIES.has(category)) throw new Error('Choose a valid category.');
  if (!title) throw new Error('Title is required.');
  if (!date) throw new Error('Date is required.');

  const isLately = category === 'lately';
  const content = String(payload.content || '').trim();
  const lately = {
    whereAt: String(payload.whereAt || '').trim(),
    intoText: String(payload.intoText || '').trim(),
    note: String(payload.note || '').trim(),
  };

  if (!isLately && !content) throw new Error('Content is required.');
  if (isLately && (!lately.whereAt || !lately.intoText)) {
    throw new Error('Lately posts need both "where I am at" and "what I am into".');
  }

  const uploadedImages = Array.isArray(payload.images) ? payload.images : [];
  const writtenImages = writeUploadedImages(category, uploadedImages);
  const galleryImages = GALLERY_CATEGORIES.has(category)
    ? writtenImages.map((image) => image.fileName)
    : [];
  const uploadedHeroImage = !GALLERY_CATEGORIES.has(category) && writtenImages[0]
    ? writtenImages[0].sitePath
    : '';
  const imageUrl = String(payload.imageUrl || '').trim() || uploadedHeroImage;
  const slug = slugify(title);
  const today = new Date().toISOString().slice(0, 10);
  const postRelPath = path.join('posts', category, `${today}-${slug}.html`);
  const postAbsPath = path.join(ROOT, postRelPath);

  if (fs.existsSync(postAbsPath)) {
    throw new Error(`A post already exists at ${postRelPath}. Adjust the title or date before generating.`);
  }

  const postHtml = buildPostHtml({
    category,
    title,
    date,
    content,
    imageUrl,
    images: galleryImages,
    lately,
  });

  fs.mkdirSync(path.dirname(postAbsPath), { recursive: true });
  fs.writeFileSync(postAbsPath, postHtml, 'utf8');

  const indexPath = path.join(ROOT, 'posts', category, 'index.json');
  const posts = fs.existsSync(indexPath)
    ? JSON.parse(fs.readFileSync(indexPath, 'utf8'))
    : [];
  const record = createPostRecord(postRelPath, title, date, slug, galleryImages);
  posts.unshift(record);
  fs.writeFileSync(indexPath, `${JSON.stringify(posts, null, 2)}\n`, 'utf8');

  return {
    post: postRelPath.split(path.sep).join('/'),
    index: path.relative(ROOT, indexPath).split(path.sep).join('/'),
    images: writtenImages.map((image) => image.sitePath),
  };
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && PUBLIC_FILES.has(req.url)) {
      const [fileName, contentType] = PUBLIC_FILES.get(req.url);
      const filePath = path.join(__dirname, fileName);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(fs.readFileSync(filePath));
      return;
    }

    if (req.method === 'POST' && req.url === '/api/create-post') {
      const payload = JSON.parse(await readBody(req));
      sendJson(res, 200, createPost(payload));
      return;
    }

    sendJson(res, 404, { error: 'Not found.' });
  } catch (err) {
    sendJson(res, 400, { error: err.message });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`me0wberry post studio running at http://127.0.0.1:${PORT}`);
});
