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
    ['nickit no. 1', '../../images/pokemon/shinies/go-shiny-nickit-01.jpg', 'pokémon go'],
    ['nickit no. 2', '../../images/pokemon/shinies/go-shiny-nickit-02.jpg', 'pokémon go'],
    ['thievul', '../../images/pokemon/shinies/go-shiny-thievul.jpg', 'pokémon go'],
    ['nickit no. 3', '../../images/pokemon/shinies/go-shiny-nickit-03.jpg', 'pokémon go'],
    ['annihilape', '../../images/pokemon/shinies/scarlet-shiny-annihilape.png', 'pokémon scarlet'],
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
    ['jangmo-o', '../../images/games/img-6903.png', 'pokémon go'],
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

  const lookbook = [
    { name: 'sprigatito', artwork: 'sprigatito-artwork.png', model: 'sprigatito-home.png' },
    { name: 'snivy', artwork: 'snivy-artwork.png', model: 'snivy-home.png' },
    { name: 'leafeon', artwork: 'leafeon-artwork.png', model: 'leafeon-home.png' },
    { name: 'sylveon', artwork: 'sylveon-artwork.png', model: 'sylveon-home.png' }
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
      ['official artwork', favourite.artwork],
      ['pokémon home', favourite.model]
    ].forEach(([label, file]) => {
      const button = document.createElement('button');
      const image = document.createElement('img');
      const caption = document.createElement('span');
      const source = `../../images/pokemon/favourites/${file}`;
      button.type = 'button';
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
