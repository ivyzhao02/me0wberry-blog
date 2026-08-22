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

  const filters = [...document.querySelectorAll('.toybox-filter')];
  const stickers = [...document.querySelectorAll('.toybox-sticker')];
  const status = document.getElementById('toybox-filter-status');

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filters.forEach((item) => item.classList.toggle('is-active', item === button));
      stickers.forEach((item) => {
        item.hidden = filter !== 'all' && item.dataset.toyboxKind !== filter;
      });
      if (status) status.textContent = filter === 'all' ? 'showing all' : `showing ${button.textContent.trim()}`;
    });
  });
})();
