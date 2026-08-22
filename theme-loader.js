(function() {
  const storageKey = 'me0wberry_theme';
  const themeIds = ['main', 'strawberry-milk', 'matcha-cream', 'cyberpunk'];
  let savedTheme = 'main';

  try {
    const storedTheme = window.localStorage.getItem(storageKey);
    if (themeIds.includes(storedTheme)) savedTheme = storedTheme;
  } catch (error) {
    // Direct-file previews can restrict storage; the default skin still works.
  }

  document.documentElement.dataset.theme = savedTheme;
  window.me0wberryTheme = { storageKey, themeIds, initialTheme: savedTheme };
})();
