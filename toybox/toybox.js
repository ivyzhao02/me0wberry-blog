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
      const button = document.createElement('button');
      const value = document.createElement('span');
      const label = document.createElement('span');
      button.className = 'toybox-kaomoji';
      button.type = 'button';
      button.dataset.kaomojiSource = face.source;
      button.hidden = index >= kaomojiPreviewLimit;
      value.className = 'toybox-kaomoji-value';
      value.textContent = face.value;
      label.className = 'toybox-copy-label';
      label.textContent = 'copy';
      button.append(value, label);
      return button;
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
    const sourceLabel = button.dataset.kaomojiSource === 'luna-town' ? ', from Luna Town' : '';
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
      const link = document.createElement('a');
      const image = document.createElement('img');
      link.className = 'toybox-collected-button';
      link.href = button.sourceAsset;
      link.target = '_blank';
      link.rel = 'noopener';
      link.role = 'listitem';
      link.title = `${button.name} · ${button.databaseDate}`;
      link.setAttribute('aria-label', `${button.name}, added to 88x31db on ${button.databaseDate}`);
      image.src = button.asset;
      image.alt = '';
      image.loading = 'lazy';
      image.decoding = 'async';
      link.appendChild(image);
      return link;
    });
    buttonShelf.replaceChildren(...buttonElements);
  }

  if (buttonCount) buttonCount.textContent = `${collectedButtons.length} saved ♡`;
  if (buttonPreviewCount) {
    buttonPreviewCount.textContent = `showing ${Math.min(buttonPreviewLimit, collectedButtons.length)} of ${collectedButtons.length}`;
  }

  document.querySelectorAll('[data-randomize-graphics]').forEach((shelf) => {
    shelf.replaceChildren(...shuffle(shelf.children));
  });

  const blinkiePreview = document.getElementById('toybox-blinkie-preview');
  const openAllBlinkies = document.getElementById('toybox-open-all-blinkies');
  const blinkieElements = [...document.querySelectorAll('#toybox-blinkie-shelf .toybox-collected-graphic')];
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
