(function () {
  const list = document.getElementById('pokemon-post-list');
  const posts = window.me0wberrySearchIndex?.posts;
  if (list && Array.isArray(posts)) {
    const matches = posts.filter((post) => {
      const searchable = `${post.title || ''} ${post.text || ''}`;
      return post.category === 'games' && /pok[eé]mon/i.test(searchable);
    });

    list.innerHTML = '';
    if (!matches.length) list.innerHTML = '<li>no trainer logs yet ♡</li>';
    matches.forEach((post) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      const date = document.createElement('small');
      link.href = new URL(`../../${post.url.replace(/^\//, '')}`, window.location.href).href;
      link.textContent = `${post.title} ↗`;
      date.textContent = post.date;
      item.append(link, date);
      list.appendChild(item);
    });
  }

  const newShinies = [
    ['skiddo', '../../images/games/img-7131.webp', 'pokémon legends z-a'],
    ['pikachu', '../../images/games/img-7169.webp', 'pokémon go'],
    ['drifloon', '../../images/games/img-7170.webp', 'pokémon go'],
    ['nickit no. 1', '../../images/pokemon/shinies/go-shiny-nickit-01.jpg', 'pokémon go'],
    ['nickit no. 2', '../../images/pokemon/shinies/go-shiny-nickit-02.jpg', 'pokémon go'],
    ['thievul', '../../images/pokemon/shinies/go-shiny-thievul.jpg', 'pokémon go'],
    ['nickit no. 3', '../../images/pokemon/shinies/go-shiny-nickit-03.jpg', 'pokémon go'],
    ['annihilape', '../../images/pokemon/shinies/scarlet-shiny-annihilape.webp', 'pokémon scarlet'],
    ['skiddo / mähikel', '../../images/pokemon/shinies/legends-za-shiny-skiddo.png', 'pokémon legends z-a'],
    ['dewpider', '../../images/pokemon/shinies/go-shiny-dewpider.jpg', 'pokémon go']
  ];

  const earlierShinies = [
    ['lechonk', '../../images/games/IMG_6412.JPG', 'pokémon scarlet'],
    ['female combee', '../../images/games/IMG_6372.JPG', 'pokémon go'],
    ['growlithe', '../../images/games/IMG_6547.JPG', 'pokémon go'],
    ['rhyhorn', '../../images/games/IMG_6548.JPG', 'pokémon go'],
    ['bulbasaur', '../../images/games/img-6663.jpg', 'pokémon go'],
    ['groudon', '../../images/games/img-6729.jpg', 'pokémon go'],
    ['wooper', '../../images/games/img-6730.jpg', 'pokémon go'],
    ['duskull', '../../images/games/img-6738.jpg', 'pokémon go'],
    ['pikachu', '../../images/games/img-6739.jpg', 'pokémon go'],
    ['poochyena', '../../images/games/img-6754.jpg', 'pokémon go'],
    ['flabébé', '../../images/games/img-6755.jpg', 'pokémon go'],
    ['scorbunny', '../../images/games/img-6857.jpg', 'pokémon go'],
    ['latios', '../../images/games/img-6870.jpg', 'pokémon go'],
    ['oinkologne', '../../images/games/img-6897.jpg', 'pokémon go'],
    ['dusclops', '../../images/games/img-6898.jpg', 'pokémon go'],
    ['tranquill', '../../images/games/img-6899.jpg', 'pokémon go'],
    ['numel', '../../images/games/img-6900.jpg', 'pokémon go'],
    ['roselia', '../../images/games/img-6901.jpg', 'pokémon go'],
    ['deino', '../../images/games/img-6902.jpg', 'pokémon go'],
    ['jangmo-o', '../../images/games/img-6903.webp', 'pokémon go'],
    ['lechonk', '../../images/games/img-6904.jpg', 'pokémon go'],
    ['woobat', '../../images/games/img-6905.jpg', 'pokémon go'],
    ['weedle', '../../images/games/img-6906.jpg', 'pokémon go'],
    ['magnemite', '../../images/games/img-6907.jpg', 'pokémon go'],
    ['rookidee', '../../images/games/img-6908.jpg', 'pokémon go'],
    ['combee', '../../images/games/img-6909.jpg', 'pokémon go'],
    ['galarian zigzagoon', '../../images/games/img-6910.jpg', 'pokémon go'],
    ['wooper', '../../images/games/img-6911.jpg', 'pokémon go'],
    ['lechonk', '../../images/games/img-6912.png', 'pokémon scarlet'],
    ['pawmo', '../../images/games/img-6913.png', 'pokémon scarlet'],
    ['deino', '../../images/games/img-6914.png', 'pokémon scarlet']
  ];

  function makeShinyCard(entry, lazy) {
    const card = document.createElement('button');
    const image = document.createElement('img');
    const label = document.createElement('span');
    const name = document.createElement('strong');
    const game = document.createElement('small');
    card.className = 'pokemon-shiny-card';
    card.type = 'button';
    card.dataset.pokemonFull = entry[1];
    card.dataset.pokemonCaption = `shiny ${entry[0]} · ${entry[2]}`;
    card.setAttribute('aria-label', `open shiny ${entry[0]} image`);
    image.alt = `Shiny ${entry[0]} in ${entry[2]}`;
    image.loading = lazy ? 'lazy' : 'eager';
    image.decoding = 'async';
    if (lazy) image.dataset.src = entry[1];
    else image.src = entry[1];
    name.textContent = entry[0];
    game.textContent = entry[2];
    label.append(name, game);
    card.append(image, label);
    return card;
  }

  const newGrid = document.getElementById('pokemon-new-shinies');
  const earlierGrid = document.getElementById('pokemon-earlier-shinies');
  newShinies.forEach((entry) => newGrid?.appendChild(makeShinyCard(entry, false)));
  earlierShinies.forEach((entry) => earlierGrid?.appendChild(makeShinyCard(entry, true)));

  const shinyArchive = document.getElementById('pokemon-shiny-archive');
  shinyArchive?.addEventListener('toggle', () => {
    if (!shinyArchive.open || shinyArchive.dataset.loaded) return;
    shinyArchive.querySelectorAll('img[data-src]').forEach((image) => {
      image.src = image.dataset.src;
      image.removeAttribute('data-src');
    });
    shinyArchive.dataset.loaded = 'true';
  });

  const collectionHighlights = [
    ['leafeon ex', 'terastal festival ex · 200/187 · japanese', 'leafeon-terastal-festival-ex-jp.webp'],
    ['leafeon', 'gem pack 2 · 0715/15 · chinese', 'leafeon-gem-pack-2-cn.webp'],
    ['leafeon ex', 'generations · 10', 'leafeon-generations-ex.webp'],
    ['sprigatito', 'paldea evolved · 196/193', 'sprigatito-paldea-evolved.webp'],
    ['sprigatito', 'triplet beat · 075/073 · japanese', 'sprigatito-triplet-beat-jp.webp'],
    ['sprigatito', 'svp black star promo · 191', 'sprigatito-svp-191.webp'],
    ['snivy', 'black bolt · 087/086', 'snivy-black-bolt.webp'],
    ['snivy', 'shiny collection · 001/020 · japanese', 'snivy-shiny-collection-jp.webp'],
    ['snivy', 'legendary treasures · rc1', 'snivy-radiant-collection.webp']
  ];
  const cardPreviewGrid = document.getElementById('pokemon-card-preview-grid');
  collectionHighlights.forEach(([name, details, file]) => {
    const button = document.createElement('button');
    const image = document.createElement('img');
    const label = document.createElement('span');
    const title = document.createElement('strong');
    const description = document.createElement('small');
    const source = `../../images/pokemon/cards/collectr/${file}`;
    button.className = 'pokemon-card-preview';
    button.type = 'button';
    button.dataset.pokemonFull = source;
    button.dataset.pokemonCaption = `${name} · ${details}`;
    button.setAttribute('aria-label', `open ${name} card image`);
    image.src = source;
    image.alt = `${name} card · ${details}`;
    image.loading = 'lazy';
    title.textContent = name;
    description.textContent = details;
    label.append(title, description);
    button.append(image, label);
    cardPreviewGrid?.appendChild(button);
  });

  const families = [
    { title: 'sprigatito family', species: ['sprigatito', 'floragato', 'meowscarada'] },
    { title: 'snivy family', species: ['snivy', 'servine', 'serperior'] },
    { title: 'leafeon', species: ['leafeon'] },
    { title: 'sylveon', species: ['sylveon'] }
  ];
  const familyGrid = document.getElementById('pokemon-family-grid');
  families.forEach((family) => {
    const card = document.createElement('article');
    const title = document.createElement('h3');
    const sprites = document.createElement('div');
    card.className = 'pokemon-family-card';
    title.textContent = family.title;
    sprites.className = 'pokemon-sprite-row';
    family.species.forEach((species) => {
      ['normal', 'shiny'].forEach((variant) => {
        const figure = document.createElement('figure');
        const image = document.createElement('img');
        const caption = document.createElement('figcaption');
        image.src = `../../images/pokemon/favourites/${species}${variant === 'shiny' ? '-shiny' : ''}.png`;
        image.alt = `${variant === 'shiny' ? 'Shiny ' : ''}${species} sprite`;
        image.loading = 'lazy';
        caption.textContent = `${species} · ${variant}`;
        figure.append(image, caption);
        sprites.appendChild(figure);
      });
    });
    card.append(title, sprites);
    familyGrid?.appendChild(card);
  });

  const honourableMentions = [
    {
      title: 'spheal',
      note: 'round friend comes first , always ♡',
      species: [
        { name: 'spheal', file: 'spheal.png', alt: 'Spheal sprite' },
        { name: 'spheal · shiny', file: 'spheal-shiny.png', alt: 'Shiny Spheal sprite' }
      ]
    },
    {
      title: 'lechonk + oinkologne',
      note: 'caught in pokémon scarlet ♡',
      species: [
        { name: 'lechonk', file: 'lechonk-shiny.png', alt: 'Shiny Lechonk sprite' },
        { name: 'oinkologne', file: 'oinkologne-shiny.png', alt: 'Shiny Oinkologne sprite' }
      ]
    },
    {
      title: 'marill + azumarill',
      note: 'caught in pokémon scarlet ♡',
      species: [
        { name: 'marill', file: 'marill-shiny.png', alt: 'Shiny Marill sprite' },
        { name: 'azumarill', file: 'azumarill-shiny.png', alt: 'Shiny Azumarill sprite' }
      ]
    },
    {
      title: 'chikorita → bayleef',
      note: 'my friend in pokémon legends z-a ♡',
      species: [
        { name: 'chikorita', file: 'chikorita.png', alt: 'Chikorita sprite' },
        { name: 'bayleef', file: 'bayleef.png', alt: 'Bayleef sprite' }
      ]
    }
  ];
  const honourableGrid = document.getElementById('pokemon-honourable-grid');
  honourableMentions.forEach((mention) => {
    const card = document.createElement('article');
    const title = document.createElement('h4');
    const sprites = document.createElement('div');
    const note = document.createElement('p');
    card.className = 'pokemon-honourable-card';
    title.textContent = mention.title;
    sprites.className = 'pokemon-honourable-sprite-row';
    mention.species.forEach((species) => {
      const figure = document.createElement('figure');
      const image = document.createElement('img');
      const caption = document.createElement('figcaption');
      image.src = `../../images/pokemon/favourites/${species.file}`;
      image.alt = species.alt;
      image.loading = 'lazy';
      caption.textContent = species.name;
      figure.append(image, caption);
      sprites.appendChild(figure);
    });
    note.textContent = mention.note;
    card.append(title, sprites, note);
    honourableGrid?.appendChild(card);
  });

  const lookbook = [
    { name: 'sprigatito', artwork: 'sprigatito-artwork.png', model: 'sprigatito-home.png', game: 'sprigatito-scarlet-violet.png', gameLabel: 'scarlet + violet' },
    { name: 'snivy', artwork: 'snivy-artwork.png', model: 'snivy-home.png', game: 'snivy-black-white.png', gameLabel: 'black + white' },
    { name: 'leafeon', artwork: 'leafeon-artwork.png', model: 'leafeon-home.png', game: 'leafeon-scarlet-violet.png', gameLabel: 'scarlet + violet' },
    { name: 'sylveon', artwork: 'sylveon-artwork.png', model: 'sylveon-home.png', game: 'sylveon-scarlet-violet.png', gameLabel: 'scarlet + violet' }
  ];
  const lookbookGrid = document.getElementById('pokemon-lookbook-grid');
  lookbook.forEach((favourite) => {
    const card = document.createElement('article');
    const title = document.createElement('h3');
    const images = document.createElement('div');
    card.className = 'pokemon-lookbook-card';
    title.textContent = favourite.name;
    images.className = 'pokemon-lookbook-pair';
    [
      ['official artwork', `../../images/pokemon/favourites/${favourite.artwork}`, 'render'],
      ['pokémon home', `../../images/pokemon/favourites/${favourite.model}`, 'render'],
      [favourite.gameLabel, `../../images/pokemon/game-appearances/${favourite.game}`, 'game']
    ].forEach(([label, source, kind]) => {
      const button = document.createElement('button');
      const image = document.createElement('img');
      const caption = document.createElement('span');
      button.type = 'button';
      if (kind === 'game') button.className = 'pokemon-lookbook-game';
      button.dataset.pokemonFull = source;
      button.dataset.pokemonCaption = `${favourite.name} · ${label}`;
      button.setAttribute('aria-label', `open ${favourite.name} ${label}`);
      image.src = source;
      image.alt = `${favourite.name} ${label}`;
      image.loading = 'lazy';
      caption.textContent = label;
      button.append(image, caption);
      images.appendChild(button);
    });
    card.append(title, images);
    lookbookGrid?.appendChild(card);
  });

  const histories = [
    {
      name: 'sprigatito',
      years: '2022 → now',
      entries: [
        ['2022', 'scarlet + violet', 'first partner / Cabo Poco', ['sprigatito-sweet-aroma.jpg', 'sprigatito-plants.jpg'], 'scene-duo']
      ]
    },
    {
      name: 'snivy',
      years: '2010 → 2023',
      entries: [
        ['2010', 'black + white', 'first partner / Nuvema Town', 'snivy-bw.png', 'sprite'],
        ['2012', 'black 2 + white 2', 'first partner / Aspertia City', 'snivy-b2w2.png', 'sprite'],
        ['2013', 'x + y', 'transfer or trade', 'snivy-xy.png', 'render'],
        ['2014', 'omega ruby + alpha sapphire', 'gift after the Delta Episode', 'snivy-xy.png', 'render'],
        ['2016', 'sun + moon', 'breed a transferred Serperior', 'snivy-sm.png', 'render'],
        ['2017', 'ultra sun + ultra moon', 'transfer or trade', 'snivy-sm.png', 'render'],
        ['2023', 'scarlet + violet', 'Savanna Biome / Indigo Disk', 'snivy-sv.png', 'scene']
      ]
    },
    {
      name: 'leafeon',
      years: '2006 → 2025',
      entries: [
        ['2006', 'diamond + pearl', 'evolve Eevee at Moss Rock', 'leafeon-dp.png', 'sprite'],
        ['2008', 'platinum', 'evolve Eevee at Moss Rock', 'leafeon-platinum.png', 'sprite'],
        ['2009', 'heartgold + soulsilver', 'trade from Sinnoh', 'leafeon-hgss.png', 'sprite'],
        ['2010', 'black + white', 'evolve a Dream World Eevee', 'leafeon-bw.png', 'sprite'],
        ['2012', 'black 2 + white 2', 'evolve Eevee at Moss Rock', 'leafeon-bw.png', 'sprite'],
        ['2013', 'x + y', 'evolve Eevee at Moss Rock', 'leafeon-xy.png', 'render'],
        ['2014', 'omega ruby + alpha sapphire', 'evolve Eevee at Moss Rock', 'leafeon-xy.png', 'render'],
        ['2016', 'sun + moon', 'evolve Eevee at Moss Rock', 'leafeon-sm.png', 'render'],
        ['2017', 'ultra sun + ultra moon', 'evolve Eevee at Moss Rock', 'leafeon-usum.png', 'render'],
        ['2019', 'sword + shield', 'Lake of Outrage / Leaf Stone', 'leafeon-swsh.png', 'render'],
        ['2021', 'brilliant diamond + shining pearl', 'evolve Eevee at Moss Rock', 'leafeon-bdsp.png', 'render'],
        ['2022', 'legends: arceus', 'space-time distortions', 'leafeon-la.png', 'render'],
        ['2022', 'scarlet + violet', 'wild / Leaf Stone', 'leafeon-scarlet-violet.png', 'scene'],
        ['2025', 'legends: z-a', 'Wild Zone 20', 'leafeon-za.png', 'scene']
      ]
    },
    {
      name: 'sylveon',
      years: '2013 → 2025',
      entries: [
        ['2013', 'x + y', 'evolve Eevee with affection', 'sylveon-xy.png', 'render'],
        ['2014', 'omega ruby + alpha sapphire', 'evolve Eevee with affection', 'sylveon-xy.png', 'render'],
        ['2016', 'sun + moon', 'evolve Eevee with affection', 'sylveon-sm.png', 'render'],
        ['2017', 'ultra sun + ultra moon', 'evolve Eevee with affection', 'sylveon-usum.png', 'render'],
        ['2019', 'sword + shield', 'Lake of Outrage / Max Raid', 'sylveon-swsh.png', 'render'],
        ['2022', 'legends: arceus', 'space-time distortions', 'sylveon-la.png', 'render'],
        ['2022', 'scarlet + violet', 'wild / Tera raids', 'sylveon-scarlet-violet.png', 'scene'],
        ['2025', 'legends: z-a', 'Wild Zone 20', 'sylveon-za.png', 'sprite']
      ]
    }
  ];

  const historyList = document.getElementById('pokemon-history-list');
  const historySpriteScale = {
    'snivy-bw.png': 0.8,
    'snivy-b2w2.png': 0.82,
    'snivy-xy.png': 3,
    'snivy-sm.png': 3,
    'leafeon-dp.png': 1,
    'leafeon-platinum.png': 1.05,
    'leafeon-hgss.png': 1.05,
    'leafeon-bw.png': 1,
    'leafeon-xy.png': 2.25,
    'leafeon-sm.png': 1.85,
    'leafeon-usum.png': 1.55,
    'leafeon-swsh.png': 1.65,
    'leafeon-bdsp.png': 0.68,
    'leafeon-la.png': 0.95,
    'sylveon-xy.png': 1.9,
    'sylveon-sm.png': 1.55,
    'sylveon-usum.png': 1.7,
    'sylveon-swsh.png': 1.35,
    'sylveon-la.png': 0.92,
    'sylveon-za.png': 0.68
  };
  histories.forEach((history) => {
    const section = document.createElement('section');
    const heading = document.createElement('div');
    const title = document.createElement('h4');
    const summary = document.createElement('span');
    const track = document.createElement('div');
    section.className = 'pokemon-history-row';
    if (history.entries.length === 1) section.classList.add('is-short');
    heading.className = 'pokemon-history-row-heading';
    title.textContent = history.name;
    summary.textContent = `${history.years} · ${history.entries.length} core-series stops`;
    heading.append(title, summary);
    track.className = 'pokemon-history-track';
    track.setAttribute('aria-label', `${history.name} core-series game history`);

    history.entries.forEach(([year, games, method, file, kind]) => {
      const files = Array.isArray(file) ? file : [file];
      const card = document.createElement(files.length > 1 ? 'article' : 'button');
      const date = document.createElement('span');
      const visual = document.createElement('span');
      const game = document.createElement('strong');
      const note = document.createElement('small');
      card.className = `pokemon-history-card is-${kind}`;
      if (card.tagName === 'BUTTON') card.type = 'button';
      if (historySpriteScale[file]) card.style.setProperty('--pokemon-sprite-scale', historySpriteScale[file]);
      date.className = 'pokemon-history-year';
      date.textContent = year;
      visual.className = 'pokemon-history-visual';
      files.forEach((imageFile, imageIndex) => {
        const source = `../../images/pokemon/game-appearances/${imageFile}`;
        const image = document.createElement('img');
        const imageLabel = files.length > 1 ? ` scene ${imageIndex + 1}` : '';
        image.src = source;
        image.alt = `${history.name} in ${games}${imageLabel}`;
        image.loading = history.entries.length === 1 ? 'eager' : 'lazy';
        image.decoding = 'async';

        if (files.length > 1) {
          const imageButton = document.createElement('button');
          imageButton.className = 'pokemon-history-scene-button';
          imageButton.type = 'button';
          imageButton.dataset.pokemonFull = source;
          imageButton.dataset.pokemonCaption = `${history.name} · ${games} · official scene ${imageIndex + 1}`;
          imageButton.setAttribute('aria-label', `open ${history.name} ${games} scene ${imageIndex + 1}`);
          imageButton.appendChild(image);
          visual.appendChild(imageButton);
          return;
        }

        card.dataset.pokemonFull = source;
        card.dataset.pokemonCaption = `${history.name} · ${games} · ${method}`;
        card.setAttribute('aria-label', `open ${history.name} in ${games}`);
        visual.appendChild(image);
      });
      game.textContent = games;
      note.textContent = method;
      card.append(date, visual, game, note);
      track.appendChild(card);
    });

    section.append(heading, track);
    historyList?.appendChild(section);
  });

  const dialog = document.getElementById('pokemon-memory-dialog');
  const largeImage = document.getElementById('pokemon-memory-large');
  const caption = document.getElementById('pokemon-memory-caption');
  if (!dialog || !largeImage || !caption) return;
  document.addEventListener('click', (event) => {
    const imageButton = event.target.closest('[data-pokemon-full]');
    if (!imageButton) return;
    largeImage.src = imageButton.dataset.pokemonFull;
    largeImage.alt = imageButton.dataset.pokemonCaption;
    caption.textContent = imageButton.dataset.pokemonCaption;
    dialog.showModal();
  });
  dialog.querySelector('.stubby-memory-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
})();
