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
      container: 'warframe-captura-groups',
      title: 'trinity prime',
      look: 'knightess skin',
      date: 'september 2026',
      source: 'Warframe0112–0116',
      preview: '0115',
      files: ['0112', '0113', '0114', '0115', '0116'],
      alt: 'Trinity Prime wearing her Knightess skin in a luminous green Captura scene',
      viewer: 'captura viewer'
    },
    {
      container: 'warframe-captura-groups',
      title: 'dante',
      look: 'tytonis skin',
      date: 'september 2026',
      source: 'Warframe0117–0124',
      preview: '0120',
      files: ['0117', '0118', '0119', '0120', '0121', '0122', '0123', '0124'],
      alt: 'Dante wearing his Tytonis skin in blue, violet and gold',
      viewer: 'captura viewer'
    },
    {
      container: 'warframe-captura-groups',
      title: 'khora prime / green set',
      look: 'default prime skin',
      date: 'september 2026',
      source: 'Warframe0125–0129',
      preview: '0126',
      files: ['0125', '0126', '0127', '0128', '0129'],
      alt: 'Khora Prime wearing her default Prime skin in green and gold',
      viewer: 'captura viewer'
    },
    {
      container: 'warframe-captura-groups',
      title: 'koumei',
      look: 'default skin',
      date: 'september 2026',
      source: 'Warframe0130–0133',
      preview: '0130',
      files: ['0130', '0131', '0132', '0133'],
      alt: 'Koumei wearing her default skin in a cool green Captura scene',
      viewer: 'captura viewer'
    },
    {
      container: 'warframe-captura-groups',
      title: 'mesa prime',
      look: 'heirloom skin',
      date: 'september 2026',
      source: 'Warframe0134–0144',
      preview: '0138',
      files: ['0134', '0135', '0136', '0137', '0138', '0139', '0140', '0141', '0142', '0143', '0144'],
      alt: 'Mesa Prime wearing her Heirloom skin in a violet neon Captura scene',
      viewer: 'captura viewer'
    },
    {
      container: 'warframe-captura-groups',
      title: 'caliban prime',
      look: 'orfeo skin',
      date: 'september 2026',
      source: 'Warframe0145–0149',
      preview: '0146',
      files: ['0145', '0146', '0147', '0148', '0149'],
      alt: 'Caliban Prime wearing his Orfeo skin in green and gold',
      viewer: 'captura viewer'
    },
    {
      container: 'warframe-captura-groups',
      title: 'mag prime',
      look: 'pneuma skin',
      date: 'september 2026',
      source: 'Warframe0150–0153',
      preview: '0152',
      files: ['0150', '0151', '0152', '0153'],
      alt: 'Mag Prime wearing her Pneuma skin in white, black and blue',
      viewer: 'captura viewer'
    },
    {
      container: 'warframe-captura-groups',
      title: 'mag prime / green set',
      look: 'pneuma skin',
      date: 'september 2026',
      source: 'Warframe0154–0159',
      preview: '0154',
      files: ['0154', '0155', '0156', '0157', '0158', '0159'],
      alt: 'Mag Prime wearing her Pneuma skin in green, black and white',
      viewer: 'captura viewer'
    },
    {
      container: 'warframe-captura-groups',
      title: 'nova prime',
      look: 'aozakura skin',
      date: 'september 2026',
      source: 'Warframe0160–0164',
      preview: '0163',
      files: ['0160', '0161', '0162', '0163', '0164'],
      alt: 'Nova Prime wearing her Aozakura skin in pink and green',
      viewer: 'captura viewer'
    },
    {
      container: 'warframe-captura-groups',
      title: 'titania prime',
      look: 'default prime skin / green + pink sets',
      date: 'september 2026',
      source: 'Warframe0165–0175',
      preview: '0169',
      files: ['0165', '0166', '0167', '0168', '0169', '0170', '0171', '0172', '0173', '0174', '0175'],
      alt: 'Titania Prime wearing her default Prime skin in green and pink variations',
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
      look: 'aoi , my drifter + orbiter companions',
      date: '2025',
      source: 'Warframe0012 / 0048 / 0076',
      preview: '0012',
      files: [
        {
          id: '0012',
          title: 'aoi + kubrow',
          alt: 'Aoi, the Mag Prime protoframe, sitting beside a Kubrow companion'
        },
        {
          id: '0048',
          title: 'petting a smeeta kavat',
          alt: 'A Warframe petting a red and blue Smeeta Kavat aboard a pink and green Orbiter'
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
      date: '2025–2026',
      source: 'Warframe0009 / 0011 / 0105',
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
        },
        {
          id: '0105',
          title: 'left + right hands of eros',
          alt: "My boyfriend's Warframe and mine using the Left and Right Hands of Eros emotes to form a heart"
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
