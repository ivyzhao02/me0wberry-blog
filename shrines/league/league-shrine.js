(function () {
  const list = document.getElementById('league-post-list');
  const collection = window.me0wberryLeagueCollection;

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function hydrateImages(container) {
    container.querySelectorAll('img[data-src]').forEach((image) => {
      image.src = image.dataset.src;
      image.removeAttribute('data-src');
    });
  }

  function chromaStateLabel(chroma) {
    const labels = [chroma.owned ? 'owned' : 'missing'];
    if (chroma.availability) labels.push(chroma.availability);
    return labels.join(' · ');
  }

  function renderChroma(chroma) {
    const card = createElement('figure', `league-chroma-card ${chroma.owned ? 'is-owned' : 'is-missing'}`);
    if (chroma.description) card.title = chroma.description;

    const visual = createElement('div', 'league-chroma-visual');
    if (chroma.image) {
      const image = document.createElement('img');
      image.dataset.src = chroma.image;
      image.alt = '';
      image.loading = 'lazy';
      image.decoding = 'async';
      visual.appendChild(image);
    } else {
      const swatch = createElement('span', 'league-chroma-swatch');
      const colors = chroma.colors.length ? chroma.colors : ['#e58ba5', '#c7dfbd'];
      swatch.style.background = `linear-gradient(135deg, ${colors.join(', ')})`;
      visual.appendChild(swatch);
    }
    visual.appendChild(createElement('b', 'league-chroma-check', chroma.owned ? '✓' : '×'));

    const caption = document.createElement('figcaption');
    caption.appendChild(createElement('strong', '', chroma.name));
    caption.appendChild(createElement('small', '', chromaStateLabel(chroma)));
    card.append(visual, caption);
    return card;
  }

  function renderSkin(skin) {
    const card = createElement('article', `league-skin-card ${skin.owned ? 'is-owned' : 'is-missing'}`);
    const splash = createElement('div', 'league-skin-splash');
    const image = document.createElement('img');
    image.dataset.src = skin.image;
    image.alt = `${skin.name} splash art`;
    image.loading = 'lazy';
    image.decoding = 'async';
    splash.append(image, createElement('span', 'league-skin-state', skin.owned ? 'owned' : 'missing'));

    const body = createElement('div', 'league-skin-body');
    const heading = createElement('div', 'league-skin-heading');
    heading.appendChild(createElement('h4', '', skin.name));
    if (skin.chromas.length) {
      const owned = skin.chromas.filter((chroma) => chroma.owned).length;
      heading.appendChild(createElement('span', '', `${owned} / ${skin.chromas.length} chromas`));
    } else {
      heading.appendChild(createElement('span', '', 'no chromas'));
    }
    body.appendChild(heading);

    if (skin.note) body.appendChild(createElement('p', 'league-skin-note', skin.note));
    if (skin.chromas.length) {
      const grid = createElement('div', 'league-chroma-grid');
      grid.setAttribute('aria-label', `${skin.name} chromas`);
      skin.chromas.forEach((chroma) => grid.appendChild(renderChroma(chroma)));
      body.appendChild(grid);
    } else {
      body.appendChild(createElement('p', 'league-no-chromas', 'base look only ♡'));
    }

    card.append(splash, body);
    return card;
  }

  function renderWardrobe(details, champion) {
    const summary = details.querySelector('summary');
    const status = summary.querySelector('[data-league-summary]');
    const totals = summary.querySelector('[data-league-totals]');
    const body = details.querySelector('.league-wardrobe-body');
    status.textContent = champion.counts.ownedSkins === champion.counts.skins
      ? 'complete skin shelf'
      : 'collection in progress';
    totals.textContent = `${champion.summary.skins} · ${champion.summary.chromas}`;

    body.textContent = '';
    const overview = createElement('div', 'league-wardrobe-overview');
    const overviewCopy = createElement('div', 'league-wardrobe-overview-copy');
    overviewCopy.append(
      createElement('span', '', `${champion.counts.ownedSkins} owned skins`),
      createElement('span', '', `${champion.counts.ownedChromas} owned chromas`),
    );
    overview.append(overviewCopy, createElement('p', '', champion.summary.note));

    const legend = createElement('div', 'league-collection-legend');
    legend.append(
      createElement('span', 'is-owned', '✓ owned'),
      createElement('span', 'is-missing', '× missing'),
      createElement('span', 'is-special', 'event / bundle / ranked'),
    );

    const catalog = createElement('div', 'league-skin-catalog');
    champion.skins.forEach((skin) => catalog.appendChild(renderSkin(skin)));
    body.append(overview, legend, catalog);
  }

  function initializeCollection() {
    if (!collection) return;
    const skinTotal = document.querySelector('[data-league-account-skins]');
    const chromaTotal = document.querySelector('[data-league-account-chromas]');
    if (skinTotal) skinTotal.textContent = collection.accountTotals.skins;
    if (chromaTotal) chromaTotal.textContent = collection.accountTotals.chromas;

    document.querySelectorAll('.league-wardrobe[data-league-champion]').forEach((details) => {
      const champion = collection.champions[details.dataset.leagueChampion];
      if (!champion) return;
      renderWardrobe(details, champion);
      details.addEventListener('toggle', () => {
        if (details.open) hydrateImages(details);
      });
      if (details.open) hydrateImages(details);
    });
  }

  async function renderRelatedPosts() {
    if (!list) return;
    const posts = typeof window.loadMe0wberrySearchPosts === 'function'
      ? await window.loadMe0wberrySearchPosts()
      : window.me0wberrySearchIndex?.posts;
    if (!Array.isArray(posts)) return;

    const matches = posts.filter((post) => {
      const searchable = `${post.title || ''} ${post.text || ''}`;
      return /league of legends|riot games|\bsona\b|\bnami\b|\bsoraka\b|\bseraphine\b/i.test(searchable);
    });

    list.innerHTML = '';
    if (!matches.length) {
      list.innerHTML = '<li>no match notes yet ♡</li>';
      return;
    }

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

  initializeCollection();
  renderRelatedPosts();
})();
