(function () {
  const imageRoot = '../../images/splatoon';
  const smallfryPhotos = [
    {
      file: 'smallfry-photo-mode-wide.webp',
      title: 'smallfry reporting for duty',
      note: 'october 8 / camera ui included',
      alt: 'My Inkling posing beside Smallfry in Splatsville with the photo-mode controls visible'
    },
    {
      file: 'smallfry-photo-mode-portrait.webp',
      title: 'portrait mode experiment',
      note: 'october 8 / camera ui included',
      alt: 'A portrait-oriented photo-mode shot of my Inkling and Smallfry in Splatsville'
    },
    {
      file: 'green-inkling-amiibo-smallfry.webp',
      title: 'amiibo guest appearance',
      note: 'green inkling amiibo from my bf ♡',
      alt: 'My Inkling posing with Smallfry and a green Inkling amiibo character in Splatsville'
    },
    {
      file: 'smallfry-splatsville-2026-10-20-01.webp',
      title: 'smallfry on the platform',
      note: 'october 20 / splatsville',
      alt: 'My Inkling and Smallfry posing together on a metal platform in Splatsville'
    },
    {
      file: 'smallfry-splatsville-2026-10-20-02.webp',
      title: 'smallfry on the platform 2',
      note: 'october 20 / splatsville',
      alt: 'Smallfry looking upward while posing with my Inkling in Splatsville'
    }
  ];

  const plazaRolls = [
    {
      date: 'october 8 , 2026',
      title: 'first splatsville pictures',
      note: 'our first screenshots together :3',
      preview: 'plaza-together-2026-10-08-04.webp',
      files: [
        'plaza-together-2026-10-08-01.webp',
        'plaza-together-2026-10-08-02.webp',
        'plaza-together-2026-10-08-03.webp',
        'plaza-together-2026-10-08-04.webp'
      ]
    },
    {
      date: 'october 18 , 2026',
      title: 'another plaza corner',
      note: 'sitting + standing beside the lobby',
      preview: 'plaza-together-2026-10-18-01.webp',
      files: [
        'plaza-together-2026-10-18-01.webp',
        'plaza-together-2026-10-18-02.webp'
      ]
    },
    {
      date: 'october 20 , 2026',
      title: 'warehouse corner',
      note: 'we found another place to pose ♡',
      preview: 'plaza-together-2026-10-20-02.webp',
      files: [
        'plaza-together-2026-10-20-01.webp',
        'plaza-together-2026-10-20-02.webp',
        'plaza-together-2026-10-20-03.webp'
      ]
    }
  ];

  function imagePath(file) {
    return `${imageRoot}/${file}`;
  }

  function setDeferredImage(image, source) {
    if (typeof window.deferSiteImage === 'function') {
      window.deferSiteImage(image, source);
    } else {
      image.src = source;
    }
  }

  function makePhotoButton(photo, index, group, options = {}) {
    const button = document.createElement('button');
    const bar = document.createElement('span');
    const image = document.createElement('img');
    const caption = document.createElement('span');
    const title = document.createElement('strong');
    const note = document.createElement('small');
    const source = imagePath(photo.file);

    button.type = 'button';
    button.className = 'splatoon-shot';
    button.dataset.splatoonFull = source;
    button.dataset.splatoonCaption = `${photo.title} · ${photo.note}`;
    bar.className = 'splatoon-shot-bar';
    bar.innerHTML = `<b>◉ ${group}</b><i>${String(index + 1).padStart(2, '0')}</i>`;
    image.alt = photo.alt;
    image.loading = 'lazy';
    image.decoding = 'async';
    if (options.defer === false) {
      image.dataset.rollSrc = source;
    } else {
      setDeferredImage(image, source);
    }
    caption.className = 'splatoon-shot-caption';
    title.textContent = photo.title;
    note.textContent = photo.note;
    caption.append(title, note);
    button.append(bar, image, caption);
    return button;
  }

  const smallfryGrid = document.getElementById('splatoon-smallfry-grid');
  if (smallfryGrid) {
    smallfryPhotos.forEach((photo, index) => {
      smallfryGrid.appendChild(makePhotoButton(photo, index, 'smallfry cam'));
    });
  }

  function makeRollPhoto(file, index, roll) {
    return makePhotoButton({
      file,
      title: `${roll.title} / photo ${index + 1}`,
      note: roll.date,
      alt: `My Inkling and my bf's Inkling posing together in Splatsville on ${roll.date}`
    }, index, 'plaza cam', { defer: false });
  }

  function makePhotoRoll(roll) {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    const preview = document.createElement('span');
    const previewImage = document.createElement('img');
    const info = document.createElement('span');
    const date = document.createElement('small');
    const title = document.createElement('strong');
    const note = document.createElement('span');
    const action = document.createElement('span');
    const grid = document.createElement('div');

    details.className = 'splatoon-photo-roll';
    summary.className = 'splatoon-roll-summary';
    preview.className = 'splatoon-roll-preview';
    setDeferredImage(previewImage, imagePath(roll.preview));
    previewImage.alt = `${roll.title} gallery preview`;
    previewImage.loading = 'lazy';
    previewImage.decoding = 'async';
    info.className = 'splatoon-roll-info';
    date.textContent = `${roll.files.length} pictures / ${roll.date}`;
    title.textContent = roll.title;
    note.textContent = roll.note;
    action.className = 'splatoon-roll-action';
    action.innerHTML = '<i class="splatoon-action-open">open roll ♡</i><i class="splatoon-action-close">close roll</i>';
    grid.className = 'splatoon-roll-grid';
    roll.files.forEach((file, index) => grid.appendChild(makeRollPhoto(file, index, roll)));

    preview.appendChild(previewImage);
    info.append(date, title, note, action);
    summary.append(preview, info);
    details.append(summary, grid);
    details.addEventListener('toggle', () => {
      if (!details.open || details.dataset.loaded) return;
      details.querySelectorAll('img[data-roll-src]').forEach((image) => {
        image.loading = 'eager';
        image.src = image.dataset.rollSrc;
        image.removeAttribute('data-roll-src');
      });
      details.dataset.loaded = 'true';
    });
    return details;
  }

  const plazaRollContainer = document.getElementById('splatoon-plaza-rolls');
  if (plazaRollContainer) {
    plazaRolls.forEach((roll) => plazaRollContainer.appendChild(makePhotoRoll(roll)));
  }

  const rankedGallery = document.querySelector('[data-ranked-gallery]');
  if (rankedGallery) {
    const panels = Array.from(rankedGallery.querySelectorAll('[data-ranked-panel]'));
    const dots = Array.from(rankedGallery.querySelectorAll('[data-ranked-dot]'));
    const status = rankedGallery.querySelector('[data-ranked-status]');
    let currentPanel = 0;

    function showRankedPanel(index) {
      currentPanel = ((index % panels.length) + panels.length) % panels.length;
      panels.forEach((panel, panelIndex) => {
        const active = panelIndex === currentPanel;
        panel.hidden = !active;
        panel.classList.toggle('is-active', active);
        panel.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      dots.forEach((dot, dotIndex) => {
        dot.setAttribute('aria-current', dotIndex === currentPanel ? 'true' : 'false');
      });
      if (status) status.textContent = `${String(currentPanel + 1).padStart(2, '0')} / ${String(panels.length).padStart(2, '0')}`;
    }

    rankedGallery.querySelector('[data-ranked-prev]')?.addEventListener('click', () => showRankedPanel(currentPanel - 1));
    rankedGallery.querySelector('[data-ranked-next]')?.addEventListener('click', () => showRankedPanel(currentPanel + 1));
    dots.forEach((dot, index) => dot.addEventListener('click', () => showRankedPanel(index)));
    rankedGallery.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      showRankedPanel(currentPanel + (event.key === 'ArrowRight' ? 1 : -1));
    });
    showRankedPanel(0);
  }

  const list = document.getElementById('splatoon-post-list');
  async function renderRelatedPosts() {
    if (!list) return;
    const posts = typeof window.loadMe0wberrySearchPosts === 'function'
      ? await window.loadMe0wberrySearchPosts()
      : window.me0wberrySearchIndex?.posts;
    if (!Array.isArray(posts)) return;

    const matches = posts.filter((post) => /splatoon/i.test(`${post.title || ''} ${post.text || ''}`));
    list.innerHTML = '';
    if (!matches.length) list.innerHTML = '<li>no squid notes yet ♡</li>';
    matches.forEach((post) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      const date = document.createElement('small');
      link.href = new URL(`../../${post.url.replace(/^\//, '')}`, window.location.href).href;
      link.textContent = `${post.title} ↗`;
      date.textContent = `${post.category} / ${post.date}`;
      item.append(link, date);
      list.appendChild(item);
    });
  }
  renderRelatedPosts();

  const dialog = document.getElementById('splatoon-photo-dialog');
  const largeImage = document.getElementById('splatoon-photo-large');
  const caption = document.getElementById('splatoon-photo-caption');
  if (!dialog || !largeImage || !caption) return;

  document.addEventListener('click', (event) => {
    const imageButton = event.target.closest('[data-splatoon-full]');
    if (!imageButton) return;
    largeImage.src = imageButton.dataset.splatoonFull;
    largeImage.alt = imageButton.querySelector('img')?.alt || imageButton.dataset.splatoonCaption;
    caption.textContent = imageButton.dataset.splatoonCaption;
    dialog.showModal();
  });

  dialog.querySelector('.stubby-memory-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
})();
