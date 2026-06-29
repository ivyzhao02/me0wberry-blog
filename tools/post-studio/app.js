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

function defaultDateLabel() {
  const now = new Date();
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  return `last updated ${months[now.getMonth()]} ${now.getDate()} ${now.getFullYear()}`;
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
  existingImageHelp.textContent = `use files already in images/${category}/ , one filename per line`;
  imageHelp.textContent = `selected files will be copied into images/${category}/ without overwriting existing ones , and multiple images will render as a gallery`;
}

function updateImageList() {
  imageList.innerHTML = '';
  Array.from(imageInput.files).forEach((file) => {
    const item = document.createElement('li');
    item.textContent = file.name;
    imageList.appendChild(item);
  });
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
  const files = await Promise.all(Array.from(imageInput.files).map(readFileAsDataUrl));
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
