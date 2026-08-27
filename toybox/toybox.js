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

  document.querySelectorAll('.toybox-kaomoji').forEach((button) => {
    const value = button.querySelector('.toybox-kaomoji-value').textContent;
    button.setAttribute('aria-label', `${value} — copy`);

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
  const randomizedButtons = [...collectedButtons];
  for (let index = randomizedButtons.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [randomizedButtons[index], randomizedButtons[swapIndex]] = [randomizedButtons[swapIndex], randomizedButtons[index]];
  }
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

  const initialFilter = filters.find((button) => button.classList.contains('is-active')) || filters[0];
  if (initialFilter) selectFilter(initialFilter);
})();
