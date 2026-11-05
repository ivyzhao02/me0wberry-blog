(function() {
  function fallbackCopy(value) {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    return copied;
  }

  async function copyValue(value) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
    return fallbackCopy(value);
  }

  function shuffle(items) {
    const randomized = [...items];
    for (let index = randomized.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [randomized[index], randomized[swapIndex]] = [randomized[swapIndex], randomized[index]];
    }
    return randomized;
  }

  const kaomojiGroups = Array.isArray(window.MEOWBERRY_KAOMOJI_GROUPS)
    ? window.MEOWBERRY_KAOMOJI_GROUPS
    : [];
  const kaomojiPreviewLimit = 8;
  let kaomojiTotal = 0;

  kaomojiGroups.forEach((group) => {
    const container = document.querySelector(`[data-kaomoji-group="${group.id}"]`);
    if (!container) return;
    const grid = container.querySelector('.toybox-kaomoji-grid');
    const count = container.querySelector('.toybox-group-count');
    const toggle = container.querySelector('.toybox-kaomoji-toggle');
    const buttons = shuffle(group.faces).map((face, index) => {
      const card = document.createElement('div');
      const button = document.createElement('button');
      const credits = document.createElement('button');
      const value = document.createElement('span');
      const label = document.createElement('span');
      button.className = 'toybox-kaomoji';
      button.type = 'button';
      button.dataset.kaomojiSource = face.source;
      card.className = 'toybox-kaomoji-card';
      card.hidden = index >= kaomojiPreviewLimit;
      value.className = 'toybox-kaomoji-value';
      value.textContent = face.value;
      label.className = 'toybox-copy-label';
      label.textContent = 'copy';
      button.append(value, label);
      credits.type = 'button';
      credits.className = 'toybox-kaomoji-credits';
      credits.textContent = 'i';
      credits.setAttribute('aria-label', `credits for ${face.value}`);
      const credit = {
        title: face.value,
        rows: [
          { label: 'original creator', text: 'not recorded' },
          face.source === 'luna-town'
            ? { label: 'collection', text: 'Luna Town kaomoji shrine', url: 'https://thuvien.org/kaomojis' }
            : { label: 'collection', text: 'Emoji Combos kaomoji collection', url: 'https://emojicombos.com/kaomoji?showSensitive=1' }
        ]
      };
      window.attachTrinketCredits(button, credit, { hover: true });
      window.attachTrinketCredits(credits, credit);
      card.append(button, credits);
      return card;
    });
    if (grid) grid.replaceChildren(...buttons);
    if (count) count.textContent = `/ ${group.faces.length}`;
    if (toggle) {
      if (group.faces.length <= kaomojiPreviewLimit) {
        toggle.hidden = true;
      } else {
        toggle.addEventListener('click', () => {
          const expanded = toggle.getAttribute('aria-expanded') !== 'true';
          toggle.setAttribute('aria-expanded', String(expanded));
          toggle.textContent = expanded ? 'tuck away ↑' : 'open shelf ↓';
          buttons.forEach((button, index) => {
            button.hidden = !expanded && index >= kaomojiPreviewLimit;
          });
        });
      }
    }
    kaomojiTotal += group.faces.length;
  });

  const kaomojiCount = document.getElementById('toybox-kaomoji-count');
  if (kaomojiCount) kaomojiCount.textContent = `${kaomojiTotal} faces saved ♡`;

  document.querySelectorAll('.toybox-kaomoji').forEach((button) => {
    const value = button.querySelector('.toybox-kaomoji-value').textContent;
    const sourceLabel = button.dataset.kaomojiSource === 'luna-town' ? ', from Luna Town' : ', from Emoji Combos';
    button.setAttribute('aria-label', `${value} — copy${sourceLabel}`);

    button.addEventListener('click', async () => {
      const label = button.querySelector('.toybox-copy-label');
      try {
        const copied = await copyValue(value);
        if (!copied) throw new Error('copy failed');
        label.textContent = 'copied !';
        button.classList.add('is-copied');
        window.setTimeout(() => {
          label.textContent = 'copy';
          button.classList.remove('is-copied');
        }, 1200);
      } catch (error) {
        label.textContent = 'try again';
        button.classList.add('is-copy-error');
        window.setTimeout(() => {
          label.textContent = 'copy';
          button.classList.remove('is-copy-error');
        }, 1200);
      }
    });
  });

  const buttonShelf = document.getElementById('toybox-button-shelf');
  const buttonCount = document.getElementById('toybox-button-count');
  const buttonPreview = document.getElementById('toybox-button-preview');
  const buttonPreviewCount = document.getElementById('toybox-button-preview-count');
  const openAllButtons = document.getElementById('toybox-open-all-buttons');
  const buttonPreviewLimit = 12;
  const collectedButtons = Array.isArray(window.MEOWBERRY_TRINKET_BUTTONS)
    ? window.MEOWBERRY_TRINKET_BUTTONS
    : [];
  const randomizedButtons = shuffle(collectedButtons);
  let buttonElements = [];

  if (buttonShelf) {
    buttonElements = randomizedButtons.map((button) => {
      const item = document.createElement('span');
      const buttonControl = document.createElement('button');
      const image = document.createElement('img');
      item.className = 'toybox-button-item';
      item.setAttribute('role', 'listitem');
      buttonControl.className = 'toybox-collected-button';
      buttonControl.type = 'button';
      buttonControl.setAttribute('aria-label', `credits for ${button.name}`);
      image.alt = '';
      image.loading = 'lazy';
      image.decoding = 'async';
      window.trinketAnimations.register(image, button.asset);
      buttonControl.appendChild(image);
      window.attachTrinketCredits(buttonControl, {
        title: button.name,
        rows: [
          { label: 'collection', text: '88x31db', url: button.sourcePage },
          { label: 'database image', text: 'original file recorded by 88x31db', url: button.sourceAsset },
          { label: 'saved original', text: 'open image', url: new URL(button.asset, window.location.href).href }
        ],
        note: 'the original maker is not recorded in this saved entry.'
      });
      item.appendChild(buttonControl);
      return item;
    });
    buttonShelf.replaceChildren(...buttonElements);
  }

  if (buttonCount) buttonCount.textContent = `${collectedButtons.length} saved ♡`;
  if (buttonPreviewCount) {
    buttonPreviewCount.textContent = `showing ${Math.min(buttonPreviewLimit, collectedButtons.length)} of ${collectedButtons.length}`;
  }

  document.querySelectorAll('.toybox-collected-graphic').forEach(link => {
    const image = link.querySelector('img');
    const name = image.alt;
    const maker = link.getAttribute('aria-label')?.split(' by ').pop();
    const item = document.createElement('span');
    const button = document.createElement('button');
    item.className = 'toybox-graphic-item';
    item.setAttribute('role', 'listitem');
    button.className = link.className;
    button.type = 'button';
    button.setAttribute('aria-label', `credits for ${name}`);
    button.appendChild(image);
    window.attachTrinketCredits(button, {
      title: name,
      rows: [
        { label: 'maker', text: maker, url: link.href },
        { label: 'found through', text: 'Graphics Collective', url: 'https://graphics-collective.neocities.org/' },
        { label: 'saved original', text: 'open image', url: new URL(image.dataset.trinketOriginal || image.getAttribute('src'), window.location.href).href }
      ]
    });
    item.appendChild(button);
    link.replaceWith(item);
  });

  document.querySelectorAll('.toybox-sticker:not(.toybox-graphic-collection):not(.toybox-button-collection)').forEach(article => {
    const preview = article.querySelector('.toybox-sticker-preview');
    const source = article.querySelector('a.toybox-sticker-source');
    const image = preview?.querySelector('img');
    if (!preview || !source || !image) return;
    const credit = {
      title: article.querySelector('.toybox-sticker-name').textContent,
      rows: [
        { label: article.dataset.toyboxKind === 'adoption' ? 'adopted from' : 'source', text: source.textContent.replace('↗', '').replace(/^adopted from\s*/i, '').trim(), url: source.href },
        { label: 'saved original', text: 'open image', url: new URL(image.dataset.trinketOriginal || image.getAttribute('src'), window.location.href).href }
      ]
    };
    if (preview.hasAttribute('data-passport-stamp')) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'asset-credit-trigger';
      button.textContent = 'credits';
      window.attachTrinketCredits(button, credit);
      source.after(button);
    } else {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = preview.className;
      button.setAttribute('aria-label', `credits for ${credit.title}`);
      button.appendChild(image);
      window.attachTrinketCredits(button, credit);
      preview.replaceWith(button);
    }
  });

  document.querySelectorAll('[data-randomize-graphics]').forEach((shelf) => {
    shelf.replaceChildren(...shuffle(shelf.children));
  });

  const blinkiePreview = document.getElementById('toybox-blinkie-preview');
  const openAllBlinkies = document.getElementById('toybox-open-all-blinkies');
  const blinkieElements = [...document.querySelectorAll('#toybox-blinkie-shelf .toybox-graphic-item')];
  const blinkiePreviewLimit = 6;

  const filters = [...document.querySelectorAll('.toybox-filter')];
  const stickers = [...document.querySelectorAll('.toybox-sticker')];
  const status = document.getElementById('toybox-filter-status');

  function selectFilter(button) {
    const filter = button.dataset.filter;
    filters.forEach((item) => item.classList.toggle('is-active', item === button));
    stickers.forEach((item) => {
      item.hidden = filter !== 'all' && item.dataset.toyboxKind !== filter;
    });
    const showFullButtonDrawer = filter === 'button';
    buttonElements.forEach((item, index) => {
      item.hidden = !showFullButtonDrawer && index >= buttonPreviewLimit;
    });
    if (buttonPreview) buttonPreview.hidden = showFullButtonDrawer || collectedButtons.length <= buttonPreviewLimit;
    const showFullBlinkieDrawer = filter === 'blinkie';
    blinkieElements.forEach((item, index) => {
      item.hidden = !showFullBlinkieDrawer && index >= blinkiePreviewLimit;
    });
    if (blinkiePreview) blinkiePreview.hidden = showFullBlinkieDrawer || blinkieElements.length <= blinkiePreviewLimit;
    if (status) status.textContent = filter === 'all' ? 'showing all' : `showing ${button.textContent.trim()}`;
    document.dispatchEvent(new CustomEvent('toyboxfilterchange', { detail: { filter } }));
  }

  filters.forEach((button) => {
    button.addEventListener('click', () => selectFilter(button));
  });

  if (openAllButtons) {
    openAllButtons.addEventListener('click', () => {
      const buttonFilter = filters.find((button) => button.dataset.filter === 'button');
      if (buttonFilter) selectFilter(buttonFilter);
    });
  }

  if (openAllBlinkies) {
    openAllBlinkies.addEventListener('click', () => {
      const blinkieFilter = filters.find((button) => button.dataset.filter === 'blinkie');
      if (blinkieFilter) selectFilter(blinkieFilter);
    });
  }

  const initialFilter = filters.find((button) => button.classList.contains('is-active')) || filters[0];
  if (initialFilter) selectFilter(initialFilter);
})();
