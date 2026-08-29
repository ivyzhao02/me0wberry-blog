const form = document.getElementById('post-form');
const categoryEl = document.getElementById('category');
const dateEl = document.getElementById('date');
const statusEl = document.getElementById('status');
const normalFields = document.getElementById('normal-fields');
const latelyFields = document.getElementById('lately-fields');
const imageHelp = document.getElementById('image-help');
const existingImageHelp = document.getElementById('existing-image-help');
const imageList = document.getElementById('image-list');
const imageInput = document.getElementById('images');
const optimizeImagesEl = document.getElementById('optimize-images');
const MAX_IMAGE_DIMENSION = 2560;
const WEBP_QUALITY = 0.9;

function defaultDateLabel() {
  const now = new Date();
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  return `${months[now.getMonth()]} ${now.getFullYear()}`;
}

function setStatus(message, kind = '') {
  statusEl.textContent = message;
  statusEl.className = `studio-status${kind ? ` is-${kind}` : ''}`;
}

function updateCategoryFields() {
  const category = categoryEl.value;
  const isLately = category === 'lately';

  normalFields.hidden = isLately;
  latelyFields.hidden = !isLately;
  existingImageHelp.textContent = `use files already in images/${category}/ , one filename per line - these will appear before any new uploads`;
  imageHelp.textContent = `selected files will be copied into images/${category}/ without overwriting existing ones , and you can mix them with existing filenames in one gallery`;
}

function updateImageList() {
  imageList.innerHTML = '';
  Array.from(imageInput.files).forEach((file) => {
    const item = document.createElement('li');
    const isHeic = /\.(?:heic|heif)$/i.test(file.name) || /image\/hei[cf]/i.test(file.type);
    const willOptimize = optimizeImagesEl.checked && /image\/(?:jpeg|png)/i.test(file.type);
    const conversionNote = isHeic ? ' → converted webp' : (willOptimize ? ' → optimized webp' : '');
    item.textContent = `${file.name}${conversionNote}`;
    imageList.appendChild(item);
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function optimizeImage(file) {
  if (!optimizeImagesEl.checked || !/image\/(?:jpeg|png)/i.test(file.type)) return file;

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await canvasToBlob(canvas, 'image/webp', WEBP_QUALITY);
    if (!blob || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
    return new File([blob], `${baseName}.webp`, {
      type: 'image/webp',
      lastModified: file.lastModified,
    });
  } catch (error) {
    return file;
  } finally {
    if (bitmap) bitmap.close();
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, data: reader.result });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function buildPayload() {
  const selectedFiles = Array.from(imageInput.files);
  if (selectedFiles.length && optimizeImagesEl.checked) setStatus('optimizing images...');
  const preparedFiles = await Promise.all(selectedFiles.map(optimizeImage));
  const files = await Promise.all(preparedFiles.map(readFileAsDataUrl));
  const formData = new FormData(form);

  return {
    category: formData.get('category'),
    title: formData.get('title'),
    date: formData.get('date'),
    content: formData.get('content'),
    imageUrl: formData.get('imageUrl'),
    existingImages: formData.get('existingImages'),
    whereAt: formData.get('whereAt'),
    intoText: formData.get('intoText'),
    note: formData.get('note'),
    images: files,
  };
}

dateEl.value = defaultDateLabel();
updateCategoryFields();

categoryEl.addEventListener('change', updateCategoryFields);
imageInput.addEventListener('change', updateImageList);
optimizeImagesEl.addEventListener('change', updateImageList);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus('generating post...');

  try {
    const res = await fetch('/api/create-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(await buildPayload()),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not create post.');

    const images = data.images.length ? `\nImages:\n${data.images.join('\n')}` : '';
    setStatus(`Post created:\n${data.post}\n\nIndex updated:\n${data.index}${images}`, 'success');
  } catch (err) {
    setStatus(err.message, 'error');
  }
});
