    // ── Site Config ──
    const SITE_ROOT = document.currentScript && document.currentScript.dataset.siteRoot;
    function sitePath(value) {
      if (!SITE_ROOT || !value.startsWith('/')) return value;
      return new URL(value.slice(1), new URL(`${SITE_ROOT}/`, window.location.href)).href;
    }

    const PASSPORT_STORAGE_KEY = 'me0wberry_passport_v1';
    const PASSPORT_STAMP_IDS = ['wander', 'naranya', 'love-ball', 'pixel-cat'];

    function recordPassportStamp(stampId, options = {}) {
      if (!PASSPORT_STAMP_IDS.includes(stampId)) return false;
      if (window.me0wberryPassport?.stamp) {
        return window.me0wberryPassport.stamp(stampId, options);
      }

      try {
        const saved = JSON.parse(window.localStorage.getItem(PASSPORT_STORAGE_KEY) || '{}');
        const stamps = Array.isArray(saved.stamps)
          ? saved.stamps.filter((stamp) => PASSPORT_STAMP_IDS.includes(stamp))
          : [];
        if (stamps.includes(stampId)) return false;
        stamps.push(stampId);
        window.localStorage.setItem(PASSPORT_STORAGE_KEY, JSON.stringify({ stamps }));
        return true;
      } catch (error) {
        return false;
      }
    }

    function loadPassportScript() {
      if (window.me0wberryPassport || document.querySelector('script[data-site-passport]')) return;
      const passportScript = document.createElement('script');
      passportScript.src = sitePath('/passport.js');
      passportScript.dataset.sitePassport = '';
      document.head.appendChild(passportScript);
    }

    loadPassportScript();

    const THEME_STATE = window.me0wberryTheme || {
      storageKey: 'me0wberry_theme',
      themeIds: ['main', 'strawberry-milk', 'matcha-cream', 'cyberpunk'],
      initialTheme: 'main'
    };
    const THEME_LABELS = {
      main: 'me0wberry main',
      'strawberry-milk': 'strawberry milk',
      'matcha-cream': 'matcha cream',
      cyberpunk: 'cyberpunk'
    };

    function readSavedTheme() {
      try {
        const savedTheme = window.localStorage.getItem(THEME_STATE.storageKey);
        return THEME_STATE.themeIds.includes(savedTheme) ? savedTheme : THEME_STATE.initialTheme;
      } catch (error) {
        return THEME_STATE.initialTheme;
      }
    }

    function ensureThemeStylesheet() {
      if (document.querySelector('link[data-site-themes]')) return;
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = sitePath('/themes.css');
      stylesheet.dataset.siteThemes = '';
      document.head.appendChild(stylesheet);
    }

    function updateThemeControls(themeId) {
      document.querySelectorAll('[data-theme-choice]').forEach((button) => {
        const selected = button.dataset.themeChoice === themeId;
        button.classList.toggle('is-active', selected);
        button.setAttribute('aria-pressed', selected ? 'true' : 'false');
      });

      const currentTheme = document.getElementById('current-theme-name');
      if (currentTheme) currentTheme.textContent = THEME_LABELS[themeId];

      const status = document.getElementById('theme-picker-status');
      if (status) status.textContent = `${THEME_LABELS[themeId]} selected`;
    }

    function applySiteTheme(themeId, persist = true) {
      const nextTheme = THEME_STATE.themeIds.includes(themeId) ? themeId : 'main';
      document.documentElement.dataset.theme = nextTheme;
      if (persist) {
        try { window.localStorage.setItem(THEME_STATE.storageKey, nextTheme); } catch (error) {}
      }
      updateThemeControls(nextTheme);
      return nextTheme;
    }

    ensureThemeStylesheet();
    applySiteTheme(document.documentElement.dataset.theme || readSavedTheme(), false);
    window.setSiteTheme = applySiteTheme;

    document.addEventListener('DOMContentLoaded', function() {
      updateThemeControls(document.documentElement.dataset.theme || 'main');
      document.querySelectorAll('[data-theme-choice]').forEach((button) => {
        button.addEventListener('click', () => applySiteTheme(button.dataset.themeChoice));
      });
    });

    function initAccessibility() {
      const main = document.getElementById('main') || document.querySelector('.post-container');
      if (main) {
        if (!main.id) main.id = 'main';
        main.setAttribute('role', 'main');
        main.setAttribute('tabindex', '-1');

        if (!document.querySelector('.skip-link')) {
          const skipLink = document.createElement('a');
          skipLink.className = 'skip-link';
          skipLink.href = '#main';
          skipLink.textContent = 'skip to content';
          document.body.prepend(skipLink);
        }
      }

      const topbar = document.getElementById('topbar');
      if (topbar) topbar.setAttribute('role', 'banner');

      const sidebar = document.getElementById('sidebar');
      if (sidebar) {
        sidebar.setAttribute('role', 'navigation');
        sidebar.setAttribute('aria-label', 'site navigation');
      }

      const updateSkipTarget = () => {
        const skipLink = document.querySelector('.skip-link');
        const sidebarNav = document.getElementById('sidebar-nav');
        if (!skipLink || !main) return;
        const useNavigation = sidebarNav && sidebar && getComputedStyle(sidebar).display !== 'none' && getComputedStyle(main).display === 'none';
        const target = useNavigation ? sidebarNav : main;
        target.setAttribute('tabindex', '-1');
        skipLink.href = `#${target.id}`;
        skipLink.textContent = useNavigation ? 'skip to navigation' : 'skip to content';
      };
      updateSkipTarget();
      document.querySelector('.skip-link')?.addEventListener('focus', updateSkipTarget);
      window.addEventListener('resize', updateSkipTarget);

      const taskbar = document.getElementById('bottom-taskbar');
      if (taskbar) {
        taskbar.setAttribute('role', 'navigation');
        taskbar.setAttribute('aria-label', 'desktop taskbar');
      }

      document.querySelectorAll('.panel').forEach((panel) => {
        panel.setAttribute('role', 'region');
        const title = panel.querySelector('.panel-title')?.textContent.trim();
        if (title && !panel.hasAttribute('aria-label')) panel.setAttribute('aria-label', title);
      });

      document.querySelectorAll('.panel-close[onclick]').forEach((control) => {
        if (control instanceof HTMLButtonElement) return;
        const title = control.closest('.panel, #discord-popup')?.querySelector('.panel-title, .discord-titlebar span')?.textContent.trim();
        control.setAttribute('role', 'button');
        control.setAttribute('tabindex', '0');
        control.setAttribute('aria-label', `close ${title || 'window'}`);
        control.addEventListener('keydown', (event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          control.click();
        });
      });

      document.querySelectorAll('.player-btn[title], .taskbar-start[title], .taskbar-app[title], #cat-toggle[title]').forEach((control) => {
        if (control.hasAttribute('aria-label')) return;
        const labels = { prev: 'previous track', next: 'next track' };
        control.setAttribute('aria-label', labels[control.title] || control.title);
      });

      document.querySelectorAll('.player-range').forEach((control) => {
        if (control.hasAttribute('aria-label')) return;
        control.setAttribute('aria-label', control.id.includes('volume') ? 'volume' : 'track progress');
      });

      const playerTitle = document.getElementById('player-title');
      if (playerTitle) playerTitle.setAttribute('aria-live', 'polite');

      const postHeading = document.querySelector('.post-heading');
      if (postHeading && postHeading.tagName !== 'H1') {
        postHeading.setAttribute('role', 'heading');
        postHeading.setAttribute('aria-level', '1');
      } else if (!document.querySelector('h1, [role="heading"][aria-level="1"]') && main) {
        const pageHeading = document.createElement('h1');
        pageHeading.className = 'sr-only';
        pageHeading.textContent = document.title.replace(/\s+[—-]\s+me0wberry.*$/i, '') || 'me0wberry.com';
        main.prepend(pageHeading);
      }
    }

    document.addEventListener('DOMContentLoaded', initAccessibility);

    function surpriseMe() {
      if (recordPassportStamp('wander', { toast: false })) {
        try { window.sessionStorage.setItem('me0wberry_passport_pending_toast', '1'); } catch (error) {}
      }
      const posts = window.me0wberrySearchIndex?.posts;
      const places = [
        '/info/index.html',
        '/persona/index.html',
        '/now/index.html',
        '/archive/index.html',
        '/system/index.html',
        '/webgarden/index.html',
        '/toybox/index.html',
        '/shrines/index.html',
        '/shrines/stubby/index.html',
        '/shrines/pokemon/index.html',
      ];
      const destinations = places.concat(Array.isArray(posts) ? posts.map((post) => post.url) : []);

      const currentPath = decodeURIComponent(window.location.pathname).replace(/\\/g, '/');
      const choices = destinations.filter((url) => !currentPath.endsWith(url));
      const pool = choices.length ? choices : ['/archive/index.html'];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      window.location.href = sitePath(pick);
    }

    window.surpriseMe = surpriseMe;
