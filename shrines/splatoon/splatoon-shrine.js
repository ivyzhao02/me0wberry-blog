(function () {
  const imageRoot = '../../images/splatoon';
  const iconRoot = `${imageRoot}/icons`;
  const amiiboIconFiles = [
    'comeback.webp',
    'ninja-squid.webp',
    'ink-saver-sub.webp',
    'swim-speed.webp',
    'run-speed-up.webp',
    'drop-roller.webp',
    'sub-power-up.webp'
  ];
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
    },
    {
      date: 'october 22 , 2026',
      title: 'plaza outfit check',
      note: 'more pictures with my bf + more corners :3',
      preview: 'plaza-together-2026-10-22-02.webp',
      files: [
        'plaza-together-2026-10-22-01.webp',
        'plaza-together-2026-10-22-02.webp',
        'plaza-together-2026-10-22-03.webp',
        'plaza-together-2026-10-22-04.webp'
      ]
    }
  ];

  const amiiboEras = [
    {
      id: 'splatoon',
      code: 'S1',
      icon: 'comeback.webp',
      title: 'original splatoon',
      note: 'first-wave colours + the squid sisters',
      open: true,
      figures: [
        { name: 'inkling girl — orange', status: 'hand' },
        { name: 'inkling boy — blue', status: 'hand' },
        { name: 'inkling squid — green', status: 'hand' },
        { name: 'callie', status: 'hand' },
        { name: 'marie', status: 'hand' },
        { name: 'inkling girl — lime green', status: 'hand' },
        { name: 'inkling boy — purple', status: 'missing' },
        { name: 'inkling squid — orange', status: 'missing' }
      ]
    },
    {
      id: 'splatoon-2',
      code: 'S2',
      icon: 'ability-doubler.webp',
      title: 'splatoon 2',
      note: 'neon inklings , off the hook + octolings',
      figures: [
        { name: 'inkling girl — neon pink', status: 'hand' },
        { name: 'inkling boy — neon green', status: 'hand' },
        { name: 'inkling squid — neon purple', status: 'hand' },
        { name: 'pearl — original', status: 'missing' },
        { name: 'marina — original', status: 'missing' },
        { name: 'octoling girl', status: 'hand' },
        { name: 'octoling boy', status: 'hand' },
        { name: 'octoling octopus', status: 'hand' }
      ]
    },
    {
      id: 'splatoon-3',
      code: 'S3',
      icon: 'intensify-action.webp',
      title: 'splatoon 3',
      note: 'launch trio , deep cut , alterna + side order',
      figures: [
        { name: 'inkling — yellow', status: 'hand' },
        { name: 'octoling — blue', status: 'hand' },
        { name: 'smallfry', status: 'hand' },
        { name: 'shiver — original', status: 'hand' },
        { name: 'frye — original', status: 'hand' },
        { name: 'big man — original', status: 'hand' },
        { name: 'callie — alterna', status: 'hand' },
        { name: 'marie — alterna', status: 'hand' },
        { name: 'pearl — side order', status: 'hand' },
        { name: 'marina — side order', status: 'hand' }
      ]
    },
    {
      id: 'raiders',
      code: 'SR',
      icon: 'quick-super-jump.webp',
      title: 'splatoon raiders',
      note: 'the new deep cut trio',
      figures: [
        { name: 'shiver — splatoon raiders', status: 'hand' },
        { name: 'frye — splatoon raiders', status: 'hand' },
        { name: 'big man — splatoon raiders', status: 'hand' }
      ]
    }
  ];

  const securedGearGroups = [
    { name: 'original inkling girl', figures: 'lime green + orange at home · shared rewards', status: 'hand', obtained: 5, total: 5 },
    { name: 'original inkling boy', figures: 'blue at home + purple on my wishlist · shared rewards', status: 'hand', obtained: 3, total: 3 },
    { name: 'original inkling squid', figures: 'green at home + orange on my wishlist · shared rewards', status: 'hand', obtained: 3, total: 3 },
    { name: 'callie', figures: 'original figure at home', status: 'hand', obtained: 1, total: 3 },
    { name: 'marie', figures: 'original figure at home', status: 'hand', obtained: 1, total: 3 },
    { name: 'neon pink inkling girl', figures: 'figure at home', status: 'hand', obtained: 1, total: 5 },
    { name: 'neon green inkling boy', figures: 'figure at home', status: 'hand', obtained: 1, total: 4 },
    { name: 'neon purple inkling squid', figures: 'figure at home', status: 'hand', obtained: 1, total: 3 },
    { name: 'octoling girl', figures: 'figure at home', status: 'hand', obtained: 1, total: 4 },
    { name: 'octoling boy', figures: 'figure at home', status: 'hand', obtained: 1, total: 3 },
    { name: 'octoling octopus', figures: 'figure at home', status: 'hand', obtained: 1, total: 3 },
    { name: 'yellow inkling', figures: 'splatoon 3 figure at home', status: 'hand', obtained: 1, total: 3 },
    { name: 'blue octoling', figures: 'splatoon 3 figure at home', status: 'hand', obtained: 1, total: 3 },
    { name: 'smallfry', figures: 'splatoon 3 figure at home', status: 'hand', obtained: 1, total: 3 },
    { name: 'original shiver', figures: 'original + raiders figures at home · shared rewards', status: 'hand', obtained: 1, total: 3 },
    { name: 'original frye', figures: 'original + raiders figures at home · shared rewards', status: 'hand', obtained: 1, total: 3 },
    { name: 'original big man', figures: 'original + raiders figures at home · shared rewards', status: 'hand', obtained: 1, total: 3 },
    { name: 'alterna callie', figures: 'alterna figure at home', status: 'hand', obtained: 1, total: 3 },
    { name: 'alterna marie', figures: 'alterna figure at home', status: 'hand', obtained: 1, total: 3 },
    { name: 'side order pearl', figures: 'side order figure at home', status: 'hand', obtained: 1, total: 3 },
    { name: 'side order marina', figures: 'side order figure at home', status: 'hand', obtained: 1, total: 3 }
  ];

  const missingGearGroups = [
    { name: 'original pearl', figures: 'figure on my wishlist', status: 'missing', obtained: 0, total: 4 },
    { name: 'original marina', figures: 'figure on my wishlist', status: 'missing', obtained: 0, total: 3 }
  ];

  const raidersOutfits = [
    { name: 'bite waders', source: 'any ordinary splatoon amiibo · ready with lime green inkling girl', status: 'hand', obtained: 0, total: 1, icon: 'swim-speed.webp' },
    { name: 'hohojiro fighting gear', source: 'raiders shiver at home', status: 'hand', obtained: 0, total: 1, icon: 'quick-super-jump.webp' },
    { name: 'onaga fighting gear', source: 'raiders frye at home', status: 'hand', obtained: 0, total: 1, icon: 'run-speed-up.webp' },
    { name: 'manta fighting gear', source: 'raiders big man at home', status: 'hand', obtained: 0, total: 1, icon: 'intensify-action.webp' }
  ];

  const statusLabels = {
    hand: 'at home',
    incoming: 'on the way',
    missing: 'on my wishlist'
  };

  function imagePath(file) {
    return `${imageRoot}/${file}`;
  }

  function iconPath(file) {
    return `${iconRoot}/${file}`;
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

  function makeCollectionMeter(label, value, total, note) {
    const meter = document.createElement('div');
    const heading = document.createElement('div');
    const title = document.createElement('span');
    const count = document.createElement('b');
    const track = document.createElement('span');
    const fill = document.createElement('i');
    const description = document.createElement('p');

    meter.className = 'splatoon-collection-meter';
    meter.setAttribute('role', 'progressbar');
    meter.setAttribute('aria-label', label);
    meter.setAttribute('aria-valuemin', '0');
    meter.setAttribute('aria-valuemax', String(total));
    meter.setAttribute('aria-valuenow', String(value));
    heading.className = 'splatoon-meter-heading';
    title.textContent = label;
    count.textContent = `${value} / ${total}`;
    track.className = 'splatoon-meter-track';
    fill.style.width = `${(value / total) * 100}%`;
    description.textContent = note;
    heading.append(title, count);
    track.appendChild(fill);
    meter.append(heading, track, description);
    return meter;
  }

  function makeAmiiboFigure(figure, code, index) {
    const card = document.createElement('article');
    const token = document.createElement('span');
    const tokenIcon = document.createElement('img');
    const tokenCode = document.createElement('b');
    const tokenNumber = document.createElement('i');
    const copy = document.createElement('div');
    const status = document.createElement('small');
    const name = document.createElement('strong');

    card.className = `splatoon-amiibo-figure is-${figure.status}`;
    card.dataset.amiiboStatus = figure.status;
    token.className = 'splatoon-amiibo-token';
    token.setAttribute('aria-hidden', 'true');
    tokenIcon.src = iconPath(amiiboIconFiles[index % amiiboIconFiles.length]);
    tokenIcon.alt = '';
    tokenIcon.width = 58;
    tokenIcon.height = 58;
    tokenIcon.decoding = 'async';
    tokenCode.textContent = code;
    tokenNumber.textContent = String(index + 1).padStart(2, '0');
    copy.className = 'splatoon-amiibo-copy';
    status.textContent = statusLabels[figure.status];
    name.textContent = figure.name;
    token.append(tokenIcon, tokenCode, tokenNumber);
    copy.append(status, name);
    card.append(token, copy);
    return card;
  }

  function makeAmiiboEra(era) {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    const badge = document.createElement('span');
    const badgeIcon = document.createElement('img');
    const badgeCode = document.createElement('b');
    const copy = document.createElement('span');
    const title = document.createElement('strong');
    const note = document.createElement('small');
    const count = document.createElement('span');
    const securedCount = document.createElement('b');
    const securedLabel = document.createElement('small');
    const toggle = document.createElement('i');
    const grid = document.createElement('div');
    const secured = era.figures.filter((figure) => figure.status !== 'missing').length;

    details.className = 'splatoon-amiibo-era';
    details.dataset.amiiboEra = era.id;
    details.open = Boolean(era.open);
    summary.className = 'splatoon-amiibo-era-summary';
    badge.className = 'splatoon-era-badge';
    badgeIcon.src = iconPath(era.icon);
    badgeIcon.alt = '';
    badgeIcon.width = 46;
    badgeIcon.height = 46;
    badgeIcon.decoding = 'async';
    badgeCode.textContent = era.code;
    copy.className = 'splatoon-era-copy';
    title.textContent = era.title;
    note.textContent = era.note;
    count.className = 'splatoon-era-count';
    securedCount.textContent = `${secured} / ${era.figures.length}`;
    securedLabel.textContent = 'home + on the way';
    toggle.className = 'splatoon-era-toggle';
    toggle.setAttribute('aria-hidden', 'true');
    grid.className = 'splatoon-amiibo-grid';
    era.figures.forEach((figure, index) => grid.appendChild(makeAmiiboFigure(figure, era.code, index)));

    copy.append(title, note);
    count.append(securedCount, securedLabel);
    badge.append(badgeIcon, badgeCode);
    summary.append(badge, copy, count, toggle);
    details.append(summary, grid);
    return details;
  }

  function makeGearCard(group) {
    const card = document.createElement('article');
    const heading = document.createElement('div');
    const status = document.createElement('small');
    const count = document.createElement('b');
    const name = document.createElement('strong');
    const figures = document.createElement('p');
    const pieces = document.createElement('div');

    card.className = `splatoon-gear-card is-${group.status}`;
    card.dataset.gearSource = group.name;
    heading.className = 'splatoon-gear-card-heading';
    status.textContent = statusLabels[group.status];
    count.textContent = `${group.obtained} / ${group.total}`;
    name.textContent = group.name;
    figures.textContent = group.figures;
    pieces.className = 'splatoon-gear-pieces';
    pieces.setAttribute('role', 'img');
    pieces.setAttribute('aria-label', `${group.obtained} of ${group.total} gear gifts acquired`);
    for (let index = 0; index < group.total; index += 1) {
      const piece = document.createElement('span');
      piece.className = index < group.obtained ? 'is-obtained' : '';
      piece.setAttribute('aria-hidden', 'true');
      pieces.appendChild(piece);
    }
    heading.append(status, count);
    card.append(heading, name, figures, pieces);
    return card;
  }

  function makeRaidersOutfit(outfit) {
    const card = document.createElement('article');
    const icon = document.createElement('img');
    const status = document.createElement('small');
    const name = document.createElement('strong');
    const source = document.createElement('p');
    const count = document.createElement('span');

    card.className = `splatoon-raiders-outfit is-${outfit.status}`;
    icon.className = 'splatoon-raiders-icon';
    icon.src = iconPath(outfit.icon);
    icon.alt = '';
    icon.width = 54;
    icon.height = 54;
    icon.decoding = 'async';
    status.textContent = outfit.status === 'hand' ? 'ready to scan' : statusLabels[outfit.status];
    name.textContent = outfit.name;
    source.textContent = outfit.source;
    count.textContent = `${outfit.obtained} / ${outfit.total}`;
    card.append(icon, status, name, source, count);
    return card;
  }

  function renderAmiiboTracker() {
    const erasContainer = document.getElementById('splatoon-amiibo-eras');
    const summary = document.getElementById('splatoon-amiibo-summary');
    const gearOverview = document.getElementById('splatoon-gear-overview');
    const securedGearContainer = document.getElementById('splatoon-gear-secured');
    const missingGearContainer = document.getElementById('splatoon-gear-missing');
    const raidersContainer = document.getElementById('splatoon-raiders-outfits');
    if (!erasContainer || !summary || !gearOverview || !securedGearContainer || !missingGearContainer || !raidersContainer) return;

    const figures = amiiboEras.flatMap((era) => era.figures);
    const inHand = figures.filter((figure) => figure.status === 'hand').length;
    const incoming = figures.filter((figure) => figure.status === 'incoming').length;
    const missing = figures.filter((figure) => figure.status === 'missing').length;
    const secured = inHand + incoming;
    const securedGearTotal = securedGearGroups.reduce((total, group) => total + group.total, 0);
    const missingGearTotal = missingGearGroups.reduce((total, group) => total + group.total, 0);
    const allGearTotal = securedGearTotal + missingGearTotal;
    const gearObtained = [...securedGearGroups, ...missingGearGroups]
      .reduce((total, group) => total + group.obtained, 0);

    const summaryItems = [
      { label: `home + on the way · ${(secured / figures.length * 100).toFixed(1)}%`, value: `${secured} / ${figures.length}`, className: 'is-secured' },
      { label: statusLabels.hand, value: inHand, className: 'is-hand' },
      { label: statusLabels.incoming, value: incoming, className: 'is-incoming' },
      { label: statusLabels.missing, value: missing, className: 'is-missing' },
      { label: 'gear gifts acquired', value: `${gearObtained} / ${allGearTotal}`, className: 'is-gear' }
    ];
    summary.innerHTML = '';
    summaryItems.forEach((item) => {
      const block = document.createElement('div');
      const label = document.createElement('small');
      const value = document.createElement('strong');
      block.className = item.className;
      label.textContent = item.label;
      value.textContent = item.value;
      block.append(label, value);
      summary.appendChild(block);
    });

    erasContainer.replaceChildren(...amiiboEras.map(makeAmiiboEra));
    gearOverview.replaceChildren(
      makeCollectionMeter('gear gifts acquired', gearObtained, allGearTotal, 'school , samurai + power sets complete · shoes from all my other reward sets at home ♡'),
      makeCollectionMeter('gifts i can acquire', securedGearTotal, allGearTotal, `the figures at home + on the way can give me ${securedGearTotal} unique gear pieces`)
    );
    securedGearContainer.replaceChildren(...securedGearGroups.map(makeGearCard));
    missingGearContainer.replaceChildren(...missingGearGroups.map(makeGearCard));
    raidersContainer.replaceChildren(...raidersOutfits.map(makeRaidersOutfit));

    const indexStatus = document.getElementById('splatoon-amiibo-index-status');
    if (indexStatus) indexStatus.textContent = `${secured} / ${figures.length} home + on the way`;
    const futureGearCount = document.getElementById('splatoon-future-gear-count');
    if (futureGearCount) futureGearCount.textContent = `${missingGearGroups.length} sources / ${missingGearTotal} pieces`;
  }

  renderAmiiboTracker();

  const photoCount = document.getElementById('splatoon-photo-count');
  if (photoCount) {
    const photos = new Set(Array.from(document.querySelectorAll('[data-splatoon-full]'), (button) => button.dataset.splatoonFull));
    photoCount.textContent = `${photos.size} pictures`;
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
    if (!matches.length) list.innerHTML = '<li>no briny scrolls yet ♡</li>';
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
