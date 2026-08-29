const fs = require('fs');
const http = require('http');
const path = require('path');
const decodeHeic = require('heic-decode');
const sharp = require('sharp');
const {
  CATEGORIES,
  buildPostHtml,
  createPostRecord,
  slugify,
} = require('./post-generator');
const { buildSiteData } = require('../build-site-data');

const PORT = Number(process.env.PORT || 8124);
const ROOT = path.resolve(__dirname, '..', '..');
const IMAGE_EXTENSIONS = new Set(['.gif', '.jpeg', '.jpg', '.png', '.webp']);
const HEIC_EXTENSIONS = new Set(['.heic', '.heif']);
const MAX_IMAGE_DIMENSION = 2560;
const WEBP_QUALITY = 90;
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

function readExistingImages(category, value) {
  const targetDir = path.join(ROOT, 'images', category);
  const requestedNames = String(value || '')
    .split(/[\r\n,]+/)
    .map((name) => name.trim())
    .filter(Boolean);

  if (!requestedNames.length) return [];
  if (!fs.existsSync(targetDir)) {
    throw new Error(`No image folder exists yet for ${category}.`);
  }

  const availableNames = fs.readdirSync(targetDir);
  const resolvedNames = requestedNames.map((requestedName) => {
    if (path.basename(requestedName) !== requestedName) {
      throw new Error(`Use a filename only, not a path: ${requestedName}`);
    }
    if (!IMAGE_EXTENSIONS.has(path.extname(requestedName).toLowerCase())) {
      throw new Error(`Use a supported image filename: ${requestedName}`);
    }

    const actualName = availableNames.find((name) => name === requestedName)
      || availableNames.find((name) => name.toLowerCase() === requestedName.toLowerCase());
    const filePath = actualName ? path.join(targetDir, actualName) : '';

    if (!actualName || !fs.statSync(filePath).isFile()) {
      throw new Error(`Image not found in images/${category}/: ${requestedName}`);
    }

    return actualName;
  });

  return [...new Set(resolvedNames)];
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

async function convertHeicToWebp(buffer) {
  const decoded = await decodeHeic({ buffer });
  return sharp(Buffer.from(decoded.data), {
    raw: {
      width: decoded.width,
      height: decoded.height,
      channels: 4,
    },
  })
    .resize({
      width: MAX_IMAGE_DIMENSION,
      height: MAX_IMAGE_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

async function writeUploadedImages(category, uploadedImages) {
  const targetDir = path.join(ROOT, 'images', category);
  fs.mkdirSync(targetDir, { recursive: true });
  const writtenImages = [];

  try {
    for (const image of uploadedImages) {
      const sourceName = safeImageName(image.name);
      const sourceExtension = path.extname(sourceName).toLowerCase();
      const base64 = String(image.data || '').split(',').pop();
      const sourceBuffer = Buffer.from(base64, 'base64');
      const isHeic = HEIC_EXTENSIONS.has(sourceExtension);
      const desiredName = isHeic
        ? `${path.basename(sourceName, sourceExtension)}.webp`
        : sourceName;
      const finalName = uniqueName(targetDir, desiredName);
      const outputBuffer = isHeic ? await convertHeicToWebp(sourceBuffer) : sourceBuffer;
      const sitePath = `/images/${category}/${finalName}`;

      fs.writeFileSync(path.join(targetDir, finalName), outputBuffer);
      writtenImages.push({ fileName: finalName, sitePath });
    }

    return writtenImages;
  } catch (error) {
    writtenImages.forEach((image) => {
      removeFileIfExists(path.join(ROOT, image.sitePath.replace(/^\//, '').replace(/\//g, path.sep)));
    });
    throw error;
  }
}

function removeFileIfExists(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

function writeTextFileAtomic(filePath, contents) {
  const tempPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tempPath, contents, 'utf8');
  fs.renameSync(tempPath, filePath);
}

async function createPost(payload) {
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
    throw new Error('Now posts need both "where I am at" and "what I am into".');
  }

  const uploadedImages = Array.isArray(payload.images) ? payload.images : [];
  const existingImages = readExistingImages(category, payload.existingImages);
  const imageUrl = String(payload.imageUrl || '').trim();
  const slug = slugify(title);
  const today = new Date().toISOString().slice(0, 10);
  const postRelPath = path.join('posts', category, `${today}-${slug}.html`);
  const postAbsPath = path.join(ROOT, postRelPath);
  const indexPath = path.join(ROOT, 'posts', category, 'index.json');

  if (fs.existsSync(postAbsPath)) {
    throw new Error(`A post already exists at ${postRelPath}. Adjust the title or date before generating.`);
  }

  const posts = fs.existsSync(indexPath)
    ? JSON.parse(fs.readFileSync(indexPath, 'utf8'))
    : [];
  const originalIndex = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : null;

  let writtenImages = [];
  try {
    writtenImages = await writeUploadedImages(category, uploadedImages);
    const galleryImages = [...existingImages, ...writtenImages.map((image) => image.fileName)];
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
    writeTextFileAtomic(postAbsPath, postHtml);
    const record = createPostRecord(postRelPath, title, date, slug, galleryImages);
    posts.unshift(record);
    writeTextFileAtomic(indexPath, `${JSON.stringify(posts, null, 2)}\n`);
    buildSiteData();

    return {
      post: postRelPath.split(path.sep).join('/'),
      index: path.relative(ROOT, indexPath).split(path.sep).join('/'),
      images: galleryImages.map((fileName) => `/images/${category}/${fileName}`),
    };
  } catch (error) {
    writtenImages.forEach((image) => {
      removeFileIfExists(path.join(ROOT, image.sitePath.replace(/^\//, '').replace(/\//g, path.sep)));
    });
    removeFileIfExists(postAbsPath);
    if (originalIndex === null) removeFileIfExists(indexPath);
    else writeTextFileAtomic(indexPath, originalIndex);
    try {
      buildSiteData();
    } catch (refreshError) {
      console.error('Could not restore generated site data after a failed post.', refreshError);
    }
    throw error;
  }
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
      sendJson(res, 200, await createPost(payload));
      return;
    }

    sendJson(res, 404, { error: 'Not found.' });
  } catch (err) {
    sendJson(res, 400, { error: err.message });
  }
});

if (require.main === module) {
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`me0wberry post studio running at http://127.0.0.1:${PORT}`);
  });
}

module.exports = {
  createPost,
  convertHeicToWebp,
  readExistingImages,
  writeUploadedImages,
};
