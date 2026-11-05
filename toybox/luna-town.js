(() => {
  const items = window.MEOWBERRY_LUNA_GRAPHICS || [];
  const container = document.getElementById('toybox-luna-shelves');
  if (!container || !items.length) return;
  const labels = {
    stamp: 'stamps', background: 'backgrounds', icon: 'icons', pixel: 'pixels + kaoani',
    divider: 'dividers', frame: 'frames', blinkie: 'blinkies', button: 'buttons'
  };
  const prefix = '../images/trinkets/luna-town/';
  const previewLimit = 6;
  const filters = Array.from(document.querySelectorAll('.toybox-filter'));

  function creditFor(item) {
    return {
      title: item.name,
      rows: [
        item.author || { label: 'original creator', text: 'not listed in the archive' },
        ...item.credits,
        { label: 'archive', text: 'Luna Town item record', url: item.archive },
        { label: item.flashWarning ? 'original / flashing animation' : 'original graphic', text: 'open saved original', url: new URL(prefix + item.file, window.location.href).href }
      ],
      note: item.flashWarning
        ? 'flashing-content warning from the source. only a still preview is shown here.'
        : 'source links record where the archive found this item; they are not automatically creator credits.'
    };
  }

  for (const [kind, label] of Object.entries(labels)) {
    const group = items.filter(item => item.kind === kind);
    if (!group.length) continue;
    const article = document.createElement('article');
    article.className = 'toybox-sticker toybox-graphic-collection toybox-luna-collection';
    article.dataset.toyboxKind = kind;
    article.dataset.lunaKind = kind;
    const heading = document.createElement('div');
    heading.className = 'toybox-button-collection-heading';
    const title = document.createElement('h3');
    title.className = 'toybox-sticker-name';
    title.textContent = label;
    const count = document.createElement('span');
    count.className = 'toybox-button-count';
    count.textContent = `${group.length} saved`;
    heading.append(title, count);
    const hint = document.createElement('p');
    hint.className = 'toybox-collection-hint';
    hint.textContent = 'click to open / credits + original';
    if (group.some(item => item.flashWarning)) hint.textContent += ' · flashing items use still previews';
    const shelf = document.createElement('div');
    shelf.className = `toybox-luna-shelf is-${kind}`;
    shelf.setAttribute('role', 'list');
    shelf.setAttribute('aria-label', `selected ${label} from Luna Town`);
    group.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'toybox-luna-card';
      card.setAttribute('role', 'listitem');
      card.hidden = index >= previewLimit;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'toybox-luna-graphic';
      button.dataset.lunaId = item.id;
      button.setAttribute('aria-label', `credits for ${item.name}`);
      const image = document.createElement('img');
      image.alt = item.name;
      image.width = item.width;
      image.height = item.height;
      image.loading = 'lazy';
      image.decoding = 'async';
      const original = prefix + item.file;
      const animated = Object.hasOwn(window.MEOWBERRY_TRINKET_STILLS || {}, original);
      window.trinketAnimations.register(image, animated || item.flashWarning || !item.stillOnly ? original : prefix + item.preview, {
        still: prefix + item.preview,
        flashWarning: item.flashWarning
      });
      button.appendChild(image);
      window.attachTrinketCredits(button, creditFor(item));
      card.appendChild(button);
      shelf.appendChild(card);
    });
    const preview = document.createElement('div');
    preview.className = 'toybox-button-preview';
    const status = document.createElement('span');
    status.textContent = `showing ${Math.min(previewLimit, group.length)} of ${group.length}`;
    const more = document.createElement('button');
    more.type = 'button';
    more.textContent = `open all ${label}`;
    more.addEventListener('click', () => {
      filters.find(button => button.dataset.filter === kind)?.click();
      article.scrollIntoView({ block: 'start' });
      shelf.querySelector('button')?.focus({ preventScroll: true });
    });
    preview.append(status, more);
    preview.hidden = group.length <= previewLimit;
    article.append(heading, hint, shelf, preview);
    article.updatePreview = filter => {
      const expanded = filter === kind;
      Array.from(shelf.children).forEach((card, index) => { card.hidden = !expanded && index >= previewLimit; });
      preview.hidden = expanded || group.length <= previewLimit;
    };
    container.appendChild(article);
  }
  document.addEventListener('toyboxfilterchange', event => {
    container.querySelectorAll('.toybox-luna-collection').forEach(article => article.updatePreview(event.detail.filter));
  });
  const count = document.getElementById('toybox-luna-count');
  if (count) count.textContent = `${items.length} graphics added to the shelves`;
})();
