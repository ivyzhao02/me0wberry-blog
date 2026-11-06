(() => {
  const dialog = document.getElementById('persona-art-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  const image = dialog.querySelector('.persona-dialog-image');
  const title = dialog.querySelector('#persona-dialog-title');
  const description = dialog.querySelector('.persona-dialog-description');
  const credit = dialog.querySelector('.persona-dialog-credit');
  const original = dialog.querySelector('.persona-dialog-original');
  const showcase = dialog.querySelector('.persona-dialog-showcase');
  const close = dialog.querySelector('.persona-dialog-close');
  const zoom = dialog.querySelector('.persona-dialog-zoom');
  const viewport = dialog.querySelector('.persona-dialog-viewport');
  let opener;

  function resetZoom() {
    viewport.classList.remove('is-actual-size');
    zoom.setAttribute('aria-pressed', 'false');
    zoom.textContent = 'actual size';
    viewport.scrollTop = 0;
    viewport.scrollLeft = 0;
  }

  document.querySelectorAll('[data-persona-open]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const work = document.getElementById(`work-${link.dataset.personaOpen}`);
      if (!work) return;
      const thumbnail = work.querySelector('img');
      const workLink = work.querySelector('[data-persona-open]');
      event.preventDefault();
      opener = link;
      image.src = thumbnail.src;
      image.alt = thumbnail.alt;
      image.width = Number(thumbnail.getAttribute('width'));
      image.height = Number(thumbnail.getAttribute('height'));
      title.textContent = work.querySelector('.persona-collection-title').textContent;
      description.textContent = work.dataset.personaDescription;
      credit.replaceChildren('art by ', work.querySelector('.persona-artist').cloneNode(true));
      original.href = workLink.href;
      const workShowcase = work.querySelector('.persona-showcase');
      showcase.hidden = !workShowcase;
      if (workShowcase) showcase.href = workShowcase.href;
      else showcase.removeAttribute('href');
      resetZoom();
      dialog.showModal();
    });
  });

  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right
      || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    resetZoom();
    image.removeAttribute('src');
    opener?.focus({ preventScroll: true });
  });
  zoom.addEventListener('click', () => {
    const actualSize = viewport.classList.toggle('is-actual-size');
    zoom.setAttribute('aria-pressed', String(actualSize));
    zoom.textContent = actualSize ? 'fit image' : 'actual size';
  });
})();
