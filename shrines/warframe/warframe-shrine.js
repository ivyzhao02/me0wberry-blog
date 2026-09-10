(function () {
  const imageRoot = '../../images/warframe';
  const galleryGroups = [
    {
      container: 'warframe-captura-groups',
      title: 'yareli prime',
      look: 'default prime skin',
      date: 'may 2025',
      source: 'Warframe0005–0008',
      preview: '0008',
      files: ['0005', '0006', '0007', '0008'],
      alt: 'Yareli Prime in a forest Captura scene',
      viewer: 'captura viewer'
    },
    {
      container: 'warframe-captura-groups',
      title: 'harrow prime',
      look: 'gabriel from ultrakill inspired',
      date: 'march 2026',
      source: 'Warframe0099–0102',
      preview: '0099',
      files: ['0099', '0100', '0101', '0102'],
      alt: 'Harrow Prime fashionframe inspired by Gabriel from Ultrakill',
      viewer: 'captura viewer'
    },
    {
      container: 'warframe-captura-groups',
      title: 'khora prime',
      look: 'urushu skin',
      date: 'april 2026',
      source: 'Warframe0106–0111',
      preview: '0106',
      files: ['0106', '0107', '0108', '0109', '0110', '0111'],
      alt: 'Khora Prime wearing the Urushu skin in pink and green',
      viewer: 'captura viewer'
    },
    {
      container: 'warframe-backroom-groups',
      title: 'khora prime',
      look: 'default prime skin',
      date: 'july 2025',
      source: 'Warframe0054–0057',
      preview: '0055',
      files: ['0054', '0055', '0056', '0057'],
      alt: 'Khora Prime wearing her default Prime skin in the Backroom',
      viewer: 'backroom viewer'
    },
    {
      container: 'warframe-backroom-groups',
      title: 'valkyr prime',
      look: 'heirloom skin',
      date: 'july 2025',
      source: 'Warframe0058–0061',
      preview: '0060',
      files: ['0058', '0059', '0060', '0061'],
      alt: 'Valkyr Prime wearing her Heirloom skin in the Backroom',
      viewer: 'backroom viewer'
    },
    {
      container: 'warframe-backroom-groups',
      title: 'citrine',
      look: 'aphrodita skin',
      date: 'july 2025',
      source: 'Warframe0063–0064',
      preview: '0063',
      files: ['0063', '0064'],
      alt: 'Citrine wearing her Aphrodita skin in the Backroom',
      viewer: 'backroom viewer'
    },
    {
      container: 'warframe-backroom-groups',
      title: 'ivara prime',
      look: 'default prime skin',
      date: 'july 2025',
      source: 'Warframe0065–0066',
      preview: '0065',
      files: ['0065', '0066'],
      alt: 'Ivara Prime wearing her default Prime skin in the Backroom',
      viewer: 'backroom viewer'
    },
    {
      container: 'warframe-backroom-groups',
      title: 'jade',
      look: 'default skin ♡',
      date: 'july 2025',
      source: 'Warframe0067–0069',
      preview: '0067',
      files: ['0067', '0068', '0069'],
      alt: 'Jade wearing her default skin in pink and green in the Backroom',
      viewer: 'backroom viewer'
    },
    {
      container: 'warframe-backroom-groups',
      title: 'wisp prime',
      look: 'default prime skin',
      date: 'july 2025',
      source: 'Warframe0070–0071',
      preview: '0070',
      files: ['0070', '0071'],
      alt: 'Wisp Prime wearing her default Prime skin in the Backroom',
      viewer: 'backroom viewer'
    },
    {
      container: 'warframe-backroom-groups',
      title: 'gara prime / bunny girl prime',
      look: 'default prime skin + virago helmet',
      date: 'august 2025',
      source: 'Warframe0084 / 0085 / 0088',
      preview: '0084',
      files: ['0084', '0085', '0088'],
      alt: 'Gara Prime wearing her default Prime skin and Virago helmet in the Backroom',
      viewer: 'backroom viewer'
    },
    {
      container: 'warframe-dormizone-groups',
      title: 'aoi / first set',
      look: 'mag prime protoframe',
      date: 'march 2025',
      source: 'Warframe0001–0004',
      preview: '0001',
      files: ['0001', '0002', '0003', '0004'],
      alt: 'Aoi, the Mag Prime protoframe, in a pink and green outfit',
      viewer: 'dormizone viewer'
    },
    {
      container: 'warframe-dormizone-groups',
      title: 'aoi / portrait set',
      look: 'mag prime protoframe',
      date: 'july 2025',
      source: 'Warframe0035–0036',
      preview: '0036',
      files: ['0035', '0036'],
      alt: 'Aoi, the Mag Prime protoframe, in a pink and green portrait',
      viewer: 'dormizone viewer'
    },
    {
      container: 'warframe-dormizone-groups',
      title: 'my drifter / gold set',
      look: 'drifter',
      date: 'december 2025',
      source: 'Warframe0096–0098',
      preview: '0097',
      files: ['0096', '0097', '0098'],
      alt: 'Drifter portrait in white and gold',
      viewer: 'dormizone viewer'
    },
    {
      container: 'warframe-dormizone-groups',
      title: 'companion moments',
      look: 'aoi + my drifter with their companions',
      date: '2025',
      source: 'Warframe0012 / 0076',
      preview: '0012',
      files: [
        {
          id: '0012',
          title: 'aoi + kubrow',
          alt: 'Aoi, the Mag Prime protoframe, sitting beside a Kubrow companion'
        },
        {
          id: '0076',
          title: 'my drifter + duviri kexat',
          alt: 'An older version of my Drifter beside a Kavat using a Duviri Kexat skin'
        }
      ],
      viewer: 'dormizone viewer'
    },
    {
      container: 'warframe-dormizone-groups',
      title: 'shared scenes',
      look: 'tenno together across old looks',
      date: 'may 2025',
      source: 'Warframe0009 / 0011',
      preview: '0011',
      files: [
        {
          id: '0009',
          title: 'chroma prime + yareli prime',
          alt: "My Yareli Prime with my boyfriend's Chroma Prime in focus"
        },
        {
          id: '0011',
          title: 'my drifter + aoi',
          alt: 'An older version of my Drifter pictured with Aoi, the Mag Prime protoframe'
        }
      ],
      viewer: 'dormizone viewer'
    }
  ];

  function fullImagePath(id) {
    return `${imageRoot}/warframe${id}.webp`;
  }

  function previewImagePath(id) {
    return `${imageRoot}/previews/warframe${id}.webp`;
  }

  function makeCaptureCard(group, file, index) {
    const capture = typeof file === 'string' ? { id: file } : file;
    const id = capture.id;
    const button = document.createElement('button');
    const bar = document.createElement('span');
    const barLabel = document.createElement('span');
    const controls = document.createElement('span');
    const image = document.createElement('img');
    const caption = document.createElement('span');
    const title = document.createElement('strong');
    const count = document.createElement('small');
    const imageLabel = capture.alt || `${group.alt}, image ${index + 1} of ${group.files.length}`;
    const captureTitle = capture.title || `capture ${String(index + 1).padStart(2, '0')}`;

    button.className = 'warframe-captura-card';
    button.type = 'button';
    button.dataset.warframeFull = fullImagePath(id);
    button.dataset.warframeCaption = `${capture.title || group.title} · Warframe${id} · ${group.date}`;
    bar.className = 'warframe-viewer-bar';
    barLabel.textContent = `◉ ${group.viewer}`;
    controls.textContent = '•••';
    image.dataset.src = fullImagePath(id);
    image.alt = imageLabel;
    image.loading = 'lazy';
    image.decoding = 'async';
    caption.className = 'warframe-shot-caption';
    title.textContent = captureTitle;
    count.textContent = id;

    bar.append(barLabel, controls);
    caption.append(title, count);
    button.append(bar, image, caption);
    return button;
  }

  function makeGallery(group) {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    const preview = document.createElement('span');
    const previewImage = document.createElement('img');
    const info = document.createElement('span');
    const status = document.createElement('small');
    const title = document.createElement('strong');
    const look = document.createElement('span');
    const source = document.createElement('span');
    const action = document.createElement('span');
    const openLabel = document.createElement('span');
    const closeLabel = document.createElement('span');
    const grid = document.createElement('div');

    details.className = 'warframe-frame-shelf';
    summary.className = 'warframe-frame-summary';
    preview.className = 'warframe-frame-preview';
    previewImage.src = previewImagePath(group.preview);
    previewImage.alt = `${group.title} gallery preview`;
    previewImage.loading = 'lazy';
    previewImage.decoding = 'async';
    info.className = 'warframe-frame-info';
    status.textContent = `${group.files.length} captures / ${group.date}`;
    title.textContent = group.title;
    look.className = 'warframe-frame-look';
    look.textContent = group.look || '';
    source.className = 'warframe-frame-source';
    source.textContent = group.source;
    action.className = 'warframe-frame-action';
    openLabel.className = 'warframe-action-open';
    openLabel.textContent = 'open all ♡';
    closeLabel.className = 'warframe-action-close';
    closeLabel.textContent = 'close folder';
    grid.className = 'warframe-captura-grid warframe-expanded-grid';
    group.files.forEach((file, index) => grid.appendChild(makeCaptureCard(group, file, index)));

    preview.appendChild(previewImage);
    action.append(openLabel, closeLabel);
    info.append(status, title);
    if (group.look) info.appendChild(look);
    info.append(source, action);
    summary.append(preview, info);
    details.append(summary, grid);
    details.addEventListener('toggle', () => {
      if (!details.open || details.dataset.loaded) return;
      details.querySelectorAll('img[data-src]').forEach((image) => {
        image.src = image.dataset.src;
        image.removeAttribute('data-src');
      });
      details.dataset.loaded = 'true';
    });
    return details;
  }

  galleryGroups.forEach((group) => {
    document.getElementById(group.container)?.appendChild(makeGallery(group));
  });

  const list = document.getElementById('warframe-post-list');
  const posts = window.me0wberrySearchIndex?.posts;

  if (list && Array.isArray(posts)) {
    const matches = posts.filter((post) => {
      const searchable = `${post.title || ''} ${post.text || ''}`;
      return /warframe/i.test(searchable);
    });

    list.innerHTML = '';
    if (!matches.length) list.innerHTML = '<li>no tenno logs yet ♡</li>';
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

  const dialog = document.getElementById('warframe-memory-dialog');
  const largeImage = document.getElementById('warframe-memory-large');
  const caption = document.getElementById('warframe-memory-caption');
  if (!dialog || !largeImage || !caption) return;

  document.addEventListener('click', (event) => {
    const imageButton = event.target.closest('[data-warframe-full]');
    if (!imageButton) return;
    largeImage.src = imageButton.dataset.warframeFull;
    largeImage.alt = imageButton.querySelector('img')?.alt || imageButton.dataset.warframeCaption;
    caption.textContent = imageButton.dataset.warframeCaption;
    dialog.showModal();
  });

  dialog.querySelector('.stubby-memory-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
})();
