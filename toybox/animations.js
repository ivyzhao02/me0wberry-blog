(() => {
  const toggle = document.getElementById('toybox-animations');
  if (!toggle) return;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = 'me0wberry_trinket_animations';
  const stills = window.MEOWBERRY_TRINKET_STILLS || {};
  const images = new Map();
  let saved;
  try { saved = window.localStorage.getItem(storageKey); } catch {}
  let explicit = saved === 'on' || saved === 'off';
  let enabled = explicit ? saved === 'on' : !preference.matches;

  function update() {
    toggle.setAttribute('aria-checked', String(enabled));
    toggle.textContent = enabled ? 'on' : 'off';
    images.forEach((item, image) => {
      const source = enabled && !item.flashWarning ? item.original : item.still;
      if (image.getAttribute('src') !== source) image.src = source;
    });
  }

  window.trinketAnimations = {
    register(image, original, { still = stills[original] || original, flashWarning = false } = {}) {
      if (!image || !original) return;
      images.set(image, { original, still, flashWarning });
      image.dataset.trinketOriginal = original;
      if (flashWarning) image.dataset.trinketFlashWarning = 'true';
      image.src = enabled && !flashWarning ? original : still;
    },
    get enabled() { return enabled; }
  };

  document.querySelectorAll('[data-trinket-src]').forEach(image => {
    window.trinketAnimations.register(image, image.dataset.trinketSrc);
  });
  toggle.addEventListener('click', () => {
    enabled = !enabled;
    explicit = true;
    try { window.localStorage.setItem(storageKey, enabled ? 'on' : 'off'); } catch {}
    update();
  });
  preference.addEventListener('change', () => {
    if (explicit) return;
    enabled = !preference.matches;
    update();
  });
  update();
})();
