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

    const MOBILE_BREAKPOINT = 768;
    const UTILITY_PANEL_BOTTOM_OFFSET = 72;
    const PINNED_Z_INDEX_BASE = 9000;
    const PLAYER_HANDOFF_KEY = 'me0wberry_player_handoff_v1';
    const PLAYER_VISIBILITY_KEY = 'me0wberry_player_visibility_v1';
    const PLAYER_VISIBILITY_CHANNEL = 'me0wberry_session_ui_v1';
    const PERSISTENT_PANEL_IDS = new Set(['panel-player']);
    const GIFYPET_PANEL_IDS = new Set(['panel-gifypet']);
    const UTILITY_POPOUT_META = {
      gifypets: { panelId: 'panel-gifypet', width: 370, rightOffset: 310, popupWidth: 410, popupHeight: 560 },
      player: { panelId: 'panel-player', width: 280, rightOffset: 20, popupWidth: 340, popupHeight: 330 },
    };
    const utilityPopouts = new Map();
    const panelOpeners = new Map();
    const playerVisibilitySubscribers = new Set();
    let discordPopupOpener = null;
    let playerVisibility = null;
    let playerVisibilityReady = false;
    let playerVisibilityChannel = null;
    let playerVisibilityFallbackTimer = null;
    const TASKBAR_PANEL_META = {
      'panel-bio': { label: 'hello', icon: sitePath('/images/ui-icons/hello.png'), order: 10 },
      'panel-lately': { label: 'now', icon: sitePath('/images/ui-icons/lately.png'), order: 20 },
      'panel-favs': { label: 'favs', icon: sitePath('/images/ui-icons/favs.png'), order: 30 },
      'panel-projects': { label: 'projects', icon: sitePath('/images/ui-icons/projects.png'), order: 35 },
      'panel-games': { label: 'games', icon: sitePath('/images/ui-icons/games.png'), order: 40 },
      'panel-music': { label: 'music', icon: sitePath('/images/ui-icons/music.png'), order: 50 },
      'panel-food': { label: 'food', icon: sitePath('/images/ui-icons/food.png'), order: 60 },
      'panel-stubby': { label: 'stubby', icon: sitePath('/images/ui-icons/stubby.png'), order: 70 },
      'panel-beauty': { label: 'beauty', icon: sitePath('/images/ui-icons/beauty.png'), order: 80 },
      'panel-gifypet': { label: 'gifypets', icon: sitePath('/images/ui-icons/gifypets.png'), order: 90 },
      'panel-player': { label: 'player', icon: sitePath('/images/ui-icons/player.png'), order: 110 }
    };

    // ── Z-index ──
    let zTop = 10;
    let pinnedZTop = PINNED_Z_INDEX_BASE;

    function readPlayerVisibility() {
      try {
        const value = window.sessionStorage.getItem(PLAYER_VISIBILITY_KEY);
        return value === 'open' || value === 'closed' ? value : null;
      } catch (error) {
        return null;
      }
    }

    function storePlayerVisibility(value) {
      try { window.sessionStorage.setItem(PLAYER_VISIBILITY_KEY, value); }
      catch (error) {}
    }

    function publishPlayerVisibility(value, options = {}) {
      playerVisibility = value;
      playerVisibilityReady = true;
      storePlayerVisibility(value);
      if (playerVisibilityFallbackTimer) {
        window.clearTimeout(playerVisibilityFallbackTimer);
        playerVisibilityFallbackTimer = null;
      }
      playerVisibilitySubscribers.forEach(callback => callback(value === 'open'));
      if (options.broadcast !== false) {
        try {
          playerVisibilityChannel?.postMessage({ type: 'player-visibility', value });
        } catch (error) {}
      }
    }

    function rememberPlayerVisibility(isOpen) {
      publishPlayerVisibility(isOpen ? 'open' : 'closed');
    }

    function subscribeToPlayerVisibility(callback) {
      playerVisibilitySubscribers.add(callback);
      if (playerVisibilityReady) callback(playerVisibility === 'open');
      return function unsubscribe() {
        playerVisibilitySubscribers.delete(callback);
      };
    }

    (function initPlayerVisibilitySession() {
      const savedVisibility = readPlayerVisibility();

      try {
        playerVisibilityChannel = new BroadcastChannel(PLAYER_VISIBILITY_CHANNEL);
        playerVisibilityChannel.addEventListener('message', event => {
          const message = event.data || {};
          if (message.type === 'request-player-visibility' && playerVisibilityReady) {
            playerVisibilityChannel.postMessage({
              type: 'player-visibility',
              value: playerVisibility,
            });
            return;
          }
          if (message.type === 'player-visibility' && (message.value === 'open' || message.value === 'closed')) {
            publishPlayerVisibility(message.value, { broadcast: false });
          }
        });
      } catch (error) {
        playerVisibilityChannel = null;
      }

      if (savedVisibility) {
        publishPlayerVisibility(savedVisibility, { broadcast: false });
        return;
      }

      if (!playerVisibilityChannel) {
        publishPlayerVisibility('open', { broadcast: false });
        return;
      }

      playerVisibilityChannel.postMessage({ type: 'request-player-visibility' });
      playerVisibilityFallbackTimer = window.setTimeout(() => {
        if (!playerVisibilityReady) publishPlayerVisibility('open', { broadcast: false });
      }, 80);
    })();

    function bringToFront(panel) {
      if (panel.classList.contains('is-pinned')) {
        panel.style.zIndex = ++pinnedZTop;
        return;
      }

      panel.style.zIndex = ++zTop;
    }

    function togglePanelPin(id) {
      const panel = document.getElementById(id);
      if (!panel) return;

      const isPinned = panel.classList.toggle('is-pinned');
      const pin = panel.querySelector('.panel-pin');
      if (pin) {
        pin.setAttribute('aria-pressed', isPinned ? 'true' : 'false');
        pin.setAttribute('aria-label', isPinned ? 'unpin window' : 'keep window on top');
        pin.title = isPinned ? 'unpin window' : 'keep window on top';
      }
      bringToFront(panel);
    }

    function isMobileViewport() {
      return window.innerWidth <= MOBILE_BREAKPOINT;
    }

    function isPersistentPanel(panel) {
      return PERSISTENT_PANEL_IDS.has(panel.id);
    }

    function isGifypetPanel(panel) {
      return GIFYPET_PANEL_IDS.has(panel.id);
    }

    function closeTransientPanels(options = {}) {
      const keepGifypets = options.keepGifypets || false;

      document.querySelectorAll('.panel.open').forEach(p => {
        if (p.hasAttribute('data-static-panel')) return;
        if (isPersistentPanel(p)) return;
        if (p.classList.contains('is-pinned')) return;
        if (keepGifypets && isGifypetPanel(p)) return;
        p.classList.remove('open');
      });
    }

    function positionUtilityPanel(panel, options) {
      const mainEl = document.getElementById('main');
      const isInMain = mainEl && mainEl.contains(panel);
      const mainRect = isInMain ? mainEl.getBoundingClientRect() : null;
      const refWidth = mainRect ? mainRect.width : window.innerWidth;
      const refHeight = mainRect ? mainRect.height : window.innerHeight;
      const width = options.width || panel.offsetWidth;
      const rightOffset = options.rightOffset || 20;
      const bottomOffset = options.bottomOffset || UTILITY_PANEL_BOTTOM_OFFSET;

      panel.style.width = width + 'px';
      if (!isInMain) panel.style.position = 'fixed';
      panel.style.left = Math.max(12, refWidth - width - rightOffset) + 'px';
      panel.style.top = Math.max(12, refHeight - panel.offsetHeight - bottomOffset) + 'px';
    }

    function utilityKindForPanel(panel) {
      if (!panel) return null;
      return Object.keys(UTILITY_POPOUT_META).find(kind => UTILITY_POPOUT_META[kind].panelId === panel.id) || null;
    }

    function liveUtilityPopout(kind) {
      const entry = utilityPopouts.get(kind);
      if (!entry || entry.popup.closed) return null;
      return entry;
    }

    function writePlayerHandoff() {
      const state = window.me0wberryPlayer?.getState();
      if (!state) return;
      try { window.localStorage.setItem(PLAYER_HANDOFF_KEY, JSON.stringify(state)); } catch (error) {}
    }

    function readPlayerHandoff() {
      try { return JSON.parse(window.localStorage.getItem(PLAYER_HANDOFF_KEY) || 'null'); }
      catch (error) { return null; }
    }

    function setUtilityPopoutState(kind, poppedOut) {
      const meta = UTILITY_POPOUT_META[kind];
      const panel = meta && document.getElementById(meta.panelId);
      if (!panel) return;

      panel.classList.toggle('is-popped-out', poppedOut);
      const control = panel.querySelector('.panel-popout');
      if (control) {
        control.setAttribute('aria-pressed', poppedOut ? 'true' : 'false');
        control.setAttribute('aria-label', poppedOut ? `bring ${kind} back` : `pop ${kind} out`);
        control.title = poppedOut ? `bring ${kind} back` : `pop ${kind} out`;
        control.textContent = poppedOut ? '↙' : '↗';
      }
    }

    function clearUtilityPopout(kind) {
      const entry = utilityPopouts.get(kind);
      if (entry?.timer) window.clearInterval(entry.timer);
      utilityPopouts.delete(kind);
      return entry;
    }

    function restoreUtilityPanel(kind, options = {}) {
      const meta = UTILITY_POPOUT_META[kind];
      const panel = meta && document.getElementById(meta.panelId);
      if (!panel) return;

      setUtilityPopoutState(kind, false);
      if (kind === 'player') {
        window.me0wberryPlayer?.applyState(readPlayerHandoff(), { resume: !!options.resume });
      }

      if (isMobileViewport()) {
        panel.classList.remove('open');
        document.body.classList.remove('mobile-panel');
        updateTaskbar();
        return;
      }

      if (options.open !== false) {
        panel.classList.add('open');
        positionUtilityPanel(panel, {
          width: meta.width,
          rightOffset: meta.rightOffset,
          bottomOffset: UTILITY_PANEL_BOTTOM_OFFSET,
        });
        bringToFront(panel);
      }
      updateTaskbar();
    }

    function focusUtilityPopout(kind) {
      const entry = liveUtilityPopout(kind);
      if (!entry) return false;
      entry.popup.focus();
      return true;
    }

    function watchUtilityPopout(kind, popup) {
      const timer = window.setInterval(() => {
        if (!popup.closed) return;
        const panel = document.getElementById(UTILITY_POPOUT_META[kind].panelId);
        const shouldReopen = !!panel?.classList.contains('open');
        clearUtilityPopout(kind);
        restoreUtilityPanel(kind, { open: shouldReopen, resume: false });
      }, 400);
      utilityPopouts.set(kind, { popup, timer });
    }

    function popoutUtility(kind) {
      const meta = UTILITY_POPOUT_META[kind];
      if (!meta) return false;
      if (focusUtilityPopout(kind)) return true;

      if (kind === 'player') {
        rememberPlayerVisibility(true);
        writePlayerHandoff();
      }
      const panel = document.getElementById(meta.panelId);
      const activePet = kind === 'gifypets'
        ? panel?.querySelector('[data-gifypet-tab].is-active')?.dataset.gifypetTab
        : null;
      const petQuery = activePet ? `&pet=${encodeURIComponent(activePet)}` : '';
      const url = `${sitePath('/popout/index.html')}?app=${encodeURIComponent(kind)}${petQuery}`;
      const popup = isMobileViewport()
        ? window.open(url, '_blank')
        : window.open(
          url,
          `me0wberry_${kind}`,
          `popup=yes,width=${meta.popupWidth},height=${meta.popupHeight},resizable=yes,scrollbars=yes`,
        );
      if (!popup) return false;

      if (kind === 'player') window.me0wberryPlayer?.pause();
      if (panel) {
        panel.classList.add('open');
        setUtilityPopoutState(kind, true);
        if (!isMobileViewport()) bringToFront(panel);
      }
      watchUtilityPopout(kind, popup);
      updateTaskbar();
      return true;
    }

    function dockUtilityPopout(kind) {
      if (kind === 'player') rememberPlayerVisibility(true);
      const entry = clearUtilityPopout(kind);
      if (entry && !entry.popup.closed) entry.popup.close();
      restoreUtilityPanel(kind, { open: !isMobileViewport(), resume: true });
      window.focus();
    }

    function toggleUtilityPopout(kind) {
      if (liveUtilityPopout(kind)) dockUtilityPopout(kind);
      else popoutUtility(kind);
    }

    window.me0wberryDockUtility = dockUtilityPopout;

    function showGifypet(pet) {
      const panel = document.getElementById('panel-gifypet');
      if (!panel) return;

      panel.querySelectorAll('[data-gifypet-tab]').forEach(tab => {
        const isActive = tab.dataset.gifypetTab === pet;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        tab.tabIndex = isActive ? 0 : -1;
      });
      panel.querySelectorAll('[data-gifypet-stage]').forEach(stage => {
        const isActive = stage.dataset.gifypetStage === pet;
        stage.classList.toggle('is-active', isActive);
        stage.hidden = !isActive;
      });
    }

    function openGifypetPanel(pet = 'stubby') {
      const panel = document.getElementById('panel-gifypet');
      if (!panel) return;
      rememberPanelOpener('panel-gifypet', panel);

      const popout = liveUtilityPopout('gifypets');
      if (popout) {
        panel.classList.add('open');
        focusUtilityPopout('gifypets');
        try { popout.popup.me0wberryShowGifypet?.(pet); } catch (error) {}
        if (!isMobileViewport()) bringToFront(panel);
        updateTaskbar();
        return;
      }

      showGifypet(pet);

      if (isMobileViewport()) {
        openPanel('panel-gifypet');
        return;
      }

      closeTransientPanels({ keepGifypets: true });
      panel.classList.add('open');
      bringToFront(panel);
      positionUtilityPanel(panel, {
        width: 370,
        rightOffset: 310,
        bottomOffset: UTILITY_PANEL_BOTTOM_OFFSET
      });
      updateTaskbar();
    }

    // ── Panel widths ──
    // ── Open / Close ──
    function rememberPanelOpener(id, panel) {
      const opener = document.activeElement;
      if (!opener || opener === document.body || panel.contains(opener) || typeof opener.focus !== 'function') return;
      panelOpeners.set(id, opener);
    }

    function restorePanelFocus(id) {
      let opener = panelOpeners.get(id);
      panelOpeners.delete(id);
      if (!opener?.isConnected || opener.getClientRects().length === 0) {
        opener = Array.from(document.querySelectorAll('[data-opens="' + id + '"]'))
          .find(element => element.getClientRects().length > 0);
      }
      if (!opener || typeof opener.focus !== 'function') return;
      opener.focus({ preventScroll: true });
    }

    function openPanel(id) {
      const panel = document.getElementById(id);
      if (!panel) return;
      rememberPanelOpener(id, panel);
      if (id === 'panel-player') rememberPlayerVisibility(true);
      panel.removeAttribute('hidden');

      const utilityKind = utilityKindForPanel(panel);
      if (utilityKind && liveUtilityPopout(utilityKind)) {
        panel.classList.add('open');
        focusUtilityPopout(utilityKind);
        if (!isMobileViewport()) bringToFront(panel);
        updateTaskbar();
        return;
      }

      if (isMobileViewport()) {
        if (utilityKind && popoutUtility(utilityKind)) return;
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('open'));
        panel.classList.add('open');
        document.body.classList.add('mobile-panel');
        updateTaskbar();
        return;
      }

      // Close temporary panels before opening the new one.
      // The music player is the only desktop panel that stays persistent.
      closeTransientPanels({ keepGifypets: isGifypetPanel(panel) });

      // Desktop: reset position for main content panels.
      if (!isPersistentPanel(panel)) {
        if (panel.classList.contains('panel-fullsize')) {
          panel.style.top = '';
          panel.style.right = '';
          panel.style.bottom = '';
          panel.style.left = '';
          panel.style.width = '';
          panel.style.height = '';
        } else {
          panel.style.top = id === 'panel-cactus' ? '60px' : '20px';
          panel.style.left = id === 'panel-cactus' ? '60px' : '18px';
          panel.style.width = '';
        }
      }
      panel.classList.add('open');
      bringToFront(panel);
      updateTaskbar();

      // sync nav highlight
      document.querySelectorAll('.nav-item[data-opens]').forEach(el => {
        el.classList.toggle('active', el.dataset.opens === id);
      });
    }

    function closePanel(id) {
      const panel = document.getElementById(id);
      if (!panel) return;
      if (id === 'panel-player') rememberPlayerVisibility(false);
      panel.classList.remove('open');
      if (isMobileViewport()) document.body.classList.remove('mobile-panel');
      // restore bio highlight if needed
      const wasActive = document.querySelector(`.nav-item[data-opens="${id}"].active`);
      if (wasActive) {
        wasActive.classList.remove('active');
        const bio = document.querySelector('.nav-item[data-opens="panel-bio"]');
        if (bio) bio.classList.add('active');
      }
      updateTaskbar();
      restorePanelFocus(id);
    }

    function mobileBack() {
      const openPanelIds = Array.from(document.querySelectorAll('.panel.open')).map(panel => panel.id);
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('open'));
      document.body.classList.remove('mobile-panel');
      updateTaskbar();
      const lastOpenedId = [...openPanelIds].reverse().find(id => panelOpeners.has(id));
      if (lastOpenedId) restorePanelFocus(lastOpenedId);
    }

    function focusTaskbarPanel(id) {
      const panel = document.getElementById(id);
      if (!panel) return;

      const utilityKind = utilityKindForPanel(panel);
      if (utilityKind && liveUtilityPopout(utilityKind)) {
        panel.classList.add('open');
        focusUtilityPopout(utilityKind);
        bringToFront(panel);
        updateTaskbar();
        return;
      }

      if (panel.classList.contains('open')) {
        rememberPanelOpener(id, panel);
        bringToFront(panel);
        updateTaskbar();
        return;
      }

      if (isGifypetPanel(panel)) {
        openGifypetPanel();
        return;
      }

      openPanel(id);
    }

    function updateTaskbar() {
      const openApps = document.getElementById('taskbar-open-apps');
      if (!openApps) return;

      document.querySelectorAll('.taskbar-app[data-opens]').forEach(btn => {
        const openedPanel = document.getElementById(btn.dataset.opens);
        btn.classList.toggle('is-active', !!openedPanel && openedPanel.classList.contains('open'));
      });

      if (isMobileViewport()) {
        openApps.innerHTML = '';
        return;
      }

      const openPanels = Array.from(document.querySelectorAll('.panel.open'))
        .filter(panel => TASKBAR_PANEL_META[panel.id])
        .sort((a, b) => TASKBAR_PANEL_META[a.id].order - TASKBAR_PANEL_META[b.id].order);

      openApps.innerHTML = openPanels.map(panel => {
        const meta = TASKBAR_PANEL_META[panel.id];
        return `<button class="taskbar-window" onclick="focusTaskbarPanel('${panel.id}')" title="${meta.label}"><img class="taskbar-window-icon" src="${meta.icon}" alt="" aria-hidden="true"></button>`;
      }).join('');
    }

    function openStubbyGifypet() {
      openGifypetPanel('stubby');
    }

    function openCactusGifypet() {
      openGifypetPanel('cactus');
    }

    function openGifypetsExperience() {
      openGifypetPanel('stubby');
    }

    // click panel → bring to front
    document.addEventListener('mousedown', function(e) {
      if (e.target.closest('a')) return;
      const panel = e.target.closest('.panel');
      if (panel) bringToFront(panel);
    });

    function initKeyboardControls() {
      const selector = [
        '.nav-item[onclick]',
        '.panel-close',
        '.ilmbf-trigger[onclick]',
        '.project-inline-link[onclick]',
        '#mobile-back'
      ].join(',');

      document.querySelectorAll(selector).forEach(element => {
        if (!element.hasAttribute('role')) element.setAttribute('role', 'button');
        if (!element.hasAttribute('tabindex')) element.tabIndex = 0;
        if (element.classList.contains('panel-close') && !element.hasAttribute('aria-label')) {
          element.setAttribute('aria-label', 'close window');
        }
        element.addEventListener('keydown', event => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          element.click();
        });
      });

      document.querySelectorAll('.slide-prev, .slide-next').forEach(button => {
        if (button.hasAttribute('aria-label')) return;
        button.setAttribute('aria-label', button.classList.contains('slide-prev') ? 'previous photo' : 'next photo');
      });
    }

    document.addEventListener('DOMContentLoaded', function() {
      initKeyboardControls();
      initTabLists();
      initDiscordDialog();
    });

    // ── Drag (from reference) ──
    (function() {
      let dragging = null, ox = 0, oy = 0, dragFrame = null;

      document.addEventListener('mousedown', function(e) {
        const tb = e.target.closest('.panel-titlebar');
        if (!tb || e.target.closest('.panel-window-actions')) return;
        if (isMobileViewport()) return;

        const panel = tb.closest('.panel');
        if (panel.classList.contains('panel-fullsize')) return;
        if (getComputedStyle(panel).position === 'relative') return;
        bringToFront(panel);
        dragging = panel;

        const rect = panel.getBoundingClientRect();
        const mainEl = document.getElementById('main');
        const isInMain = mainEl && mainEl.contains(panel);
        const mainRect = isInMain ? mainEl.getBoundingClientRect() : null;
        dragFrame = mainRect;
        ox = e.clientX - rect.left;
        oy = e.clientY - rect.top;

        if (!isInMain) panel.style.position = 'fixed';
        panel.style.left = (mainRect ? rect.left - mainRect.left : rect.left) + 'px';
        panel.style.top  = (mainRect ? rect.top - mainRect.top : rect.top) + 'px';
        panel.style.width = rect.width + 'px';
        panel.style.right  = '';
        panel.style.bottom = '';

        e.preventDefault();
      });

      document.addEventListener('mousemove', function(e) {
        if (!dragging) return;
        const frameLeft = dragFrame ? dragFrame.left : 0;
        const frameTop = dragFrame ? dragFrame.top : 0;
        let x = e.clientX - frameLeft - ox;
        let y = e.clientY - frameTop - oy;
        x = Math.max(-dragging.offsetWidth + 60, x);
        y = Math.max(0, y);
        dragging.style.left = x + 'px';
        dragging.style.top  = y + 'px';
      });

      document.addEventListener('mouseup', function() {
        dragging = null;
        dragFrame = null;
      });
    })();

    // ── Resize — vertical only (from reference) ──
    (function() {
      let resizing = null, startY = 0, startH = 0;

      document.addEventListener('mousedown', function(e) {
        const handle = e.target.closest('.panel-resize');
        if (!handle) return;
        if (isMobileViewport()) return;
        const panel = handle.closest('.panel');
        if (panel.classList.contains('panel-fullsize')) return;
        resizing = panel;
        startY = e.clientY;
        startH = panel.offsetHeight;
        e.preventDefault();
      });

      document.addEventListener('mousemove', function(e) {
        if (!resizing) return;
        const newH = Math.max(160, startH + (e.clientY - startY));
        resizing.style.height = newH + 'px';
      });

      document.addEventListener('mouseup', function() { resizing = null; });
    })();

    // ── Tab switching ──
    function switchTab(btn, targetId, tabbarId) {
      const tabbar = document.getElementById(tabbarId);
      if (!tabbar) return;
      tabbar.querySelectorAll('[role="tab"]').forEach(tab => {
        const isActive = tab === btn;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        tab.tabIndex = isActive ? 0 : -1;
      });
      const body = tabbar.nextElementSibling; // .panel-body
      if (!body) return;
      body.querySelectorAll('[role="tabpanel"]').forEach(panel => {
        const isActive = panel.id === targetId;
        panel.classList.toggle('active', isActive);
        panel.hidden = !isActive;
      });
    }

    function initTabLists() {
      document.querySelectorAll('[role="tablist"]').forEach(tablist => {
        tablist.addEventListener('keydown', event => {
          const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
          const currentIndex = tabs.indexOf(event.target.closest('[role="tab"]'));
          if (currentIndex < 0) return;

          let nextIndex = null;
          if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % tabs.length;
          if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
          if (event.key === 'Home') nextIndex = 0;
          if (event.key === 'End') nextIndex = tabs.length - 1;
          if (nextIndex === null) return;

          event.preventDefault();
          tabs[nextIndex].click();
          tabs[nextIndex].focus();
        });
      });
    }

    // ── Discord popup ──
    function initDiscordDialog() {
      const popup = document.getElementById('discord-popup');
      if (!popup) return;
      const title = popup.querySelector('.discord-titlebar span');
      if (title && !title.id) title.id = 'discord-popup-title';
      popup.setAttribute('role', 'dialog');
      popup.setAttribute('aria-modal', 'true');
      popup.setAttribute('aria-hidden', popup.classList.contains('open') ? 'false' : 'true');
      if (title) popup.setAttribute('aria-labelledby', title.id);
    }

    function showDiscordPopup() {
      const popup = document.getElementById('discord-popup');
      if (!popup) return;
      const opener = document.activeElement;
      if (opener && opener !== document.body && typeof opener.focus === 'function') {
        discordPopupOpener = opener;
      }
      popup.classList.add('open');
      popup.setAttribute('aria-hidden', 'false');
      popup.style.zIndex = ++zTop;
      requestAnimationFrame(() => {
        const initialFocus = popup.querySelector('.discord-ok') || popup.querySelector('.panel-close');
        initialFocus?.focus();
      });
    }

    function hideDiscordPopup() {
      const popup = document.getElementById('discord-popup');
      if (!popup) return;
      popup.classList.remove('open');
      popup.setAttribute('aria-hidden', 'true');
      const opener = discordPopupOpener;
      discordPopupOpener = null;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    }

    document.addEventListener('keydown', function(event) {
      const popup = document.getElementById('discord-popup');
      if (!popup?.classList.contains('open')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        hideDiscordPopup();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = Array.from(popup.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'))
        .filter(element => element.getClientRects().length > 0);
      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    // discord popup draggable
    (function() {
      let dragging = null, ox = 0, oy = 0;
      const handle = document.getElementById('discord-titlebar');
      const popup  = document.getElementById('discord-popup');
      if (!handle || !popup) return;

      handle.addEventListener('mousedown', function(e) {
        if (e.target.closest('.panel-close')) return;
        dragging = true;
        const rect = popup.getBoundingClientRect();
        ox = e.clientX - rect.left;
        oy = e.clientY - rect.top;
        popup.style.transform = 'none';
        popup.style.left = rect.left + 'px';
        popup.style.top  = rect.top  + 'px';
        e.preventDefault();
      });
      document.addEventListener('mousemove', function(e) {
        if (!dragging) return;
        popup.style.left = (e.clientX - ox) + 'px';
        popup.style.top  = (e.clientY - oy) + 'px';
      });
      document.addEventListener('mouseup', function() { dragging = false; });
    })();

    // ── Mobile resize handler ──
    window.addEventListener('resize', function() {
      if (!isMobileViewport()) document.body.classList.remove('mobile-panel');
      updateTaskbar();
    });

    window.me0wberryTrackCatalog = Object.freeze([
      { id: 'lace', src: '/audio/please-dont-stop.mp3', title: "please don't stop being sweet to me · lace" },
      { id: 'forever-and', src: '/audio/forever-and.mp3', title: 'forever & · EJEAN' },
      { id: 'meteor-rain', src: '/audio/huayuan-meteor-rain.mp3', title: '花园裡的流星雨 · Karencici' },
      { id: 'angel-loading', src: '/audio/tianshi-jiazaizhong.mp3', title: '天使加载中...^_−☆ · Angels of Delusion' },
      { id: 'redreaming-angel', src: '/audio/redreaming-angel.mp3', title: 'ReDreaming Angel · Angels of Delusion' },
      { id: 'national-park-gsc', src: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview117/v4/e9/06/f7/e906f78d-1e80-0e1b-e616-93a116c705cb/mzaf_6047781193972057181.plus.aac.p.m4a', title: 'national park (gold / silver) · GAME FREAK' },
      { id: 'national-park-hgss', src: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview127/v4/1e/9b/24/1e9b2416-0656-a1a7-8acf-7196022d36b6/mzaf_5043987050176404935.plus.aac.p.m4a', title: 'national park (heartgold / soulsilver) · GAME FREAK' },
    ]);

    // ── Audio Player ──
    const tracks = (window.me0wberryTrackCatalog || []).map(track => ({
      ...track,
      src: track.src.startsWith('/') ? sitePath(track.src) : track.src,
    }));
    let currentTrack = 0;
    const audio       = document.getElementById('player-audio');
    const progressEl  = document.getElementById('player-progress');
    const titleSpan   = document.getElementById('player-title');
    const marqueeWrap = document.getElementById('player-marquee');
    const counterEl   = document.getElementById('player-counter');
    const playPauseBtn = document.getElementById('player-playpause');
    const currentTimeEl = document.getElementById('player-current-time');
    const totalTimeEl   = document.getElementById('player-total-time');
    const volumeEl      = document.getElementById('player-volume');

    function fmtTime(s) {
      if (!s || isNaN(s)) return '0:00';
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60);
      return m + ':' + (sec < 10 ? '0' : '') + sec;
    }

    function setPlayPauseState(isPlaying) {
      playPauseBtn.classList.toggle('is-playing', isPlaying);
      playPauseBtn.textContent = isPlaying ? '❚❚' : '▶';
    }

    function tryPlay() {
      let playRequest;
      try {
        playRequest = audio.play();
      } catch (error) {
        setPlayPauseState(false);
        return Promise.resolve(false);
      }

      return Promise.resolve(playRequest).then(function() {
        setPlayPauseState(true);
        return true;
      }).catch(function() {
        setPlayPauseState(false);
        return false;
      });
    }

    function checkMarquee() {
      const container = marqueeWrap.parentElement;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        marqueeWrap.classList.remove('scrolling');
        return;
      }
      // duplicate text for seamless loop if overflowing
      if (titleSpan.offsetWidth > container.offsetWidth) {
        if (!titleSpan.dataset.doubled) {
          titleSpan.textContent = titleSpan.textContent + '\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0' + titleSpan.textContent;
          titleSpan.dataset.doubled = '1';
        }
        marqueeWrap.classList.add('scrolling');
      } else {
        marqueeWrap.classList.remove('scrolling');
      }
    }

    function loadTrack(idx) {
      currentTrack = idx;
      const t = tracks[idx];
      // reset title
      titleSpan.dataset.doubled = '';
      titleSpan.textContent = t.title;
      marqueeWrap.classList.remove('scrolling');
      audio.src = t.src;
      counterEl.textContent = 'track ' + (idx + 1) + ' / ' + tracks.length;
      progressEl.value = 0;
      currentTimeEl.textContent = '0:00';
      totalTimeEl.textContent = '0:00';
      setPlayPauseState(false);
      // check marquee after paint
      requestAnimationFrame(checkMarquee);
    }

    function seekPlayer(time) {
      const target = Number.isFinite(Number(time)) ? Math.max(0, Number(time)) : 0;
      const applySeek = function() {
        audio.currentTime = audio.duration ? Math.min(target, audio.duration) : target;
      };
      if (audio.readyState >= 1) applySeek();
      else audio.addEventListener('loadedmetadata', applySeek, { once: true });
    }

    function getPlayerState() {
      return {
        trackId: tracks[currentTrack]?.id || tracks[0]?.id || '',
        currentTime: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
        volume: audio.volume,
        playing: !audio.paused,
        updatedAt: Date.now(),
      };
    }

    function applyPlayerState(state, options = {}) {
      if (!state || !tracks.length) return;
      const trackIndex = tracks.findIndex(track => track.id === state.trackId);
      loadTrack(trackIndex >= 0 ? trackIndex : 0);

      const volume = Number(state.volume);
      if (Number.isFinite(volume)) {
        audio.volume = Math.min(1, Math.max(0, volume));
        volumeEl.value = audio.volume;
      }
      seekPlayer(state.currentTime);

      if (state.playing && options.resume) {
        const resume = function() { tryPlay(); };
        if (audio.readyState >= 2) resume();
        else audio.addEventListener('canplay', resume, { once: true });
      }
    }

    function playerToggle() {
      if (audio.paused) {
        tryPlay();
      } else {
        audio.pause();
        setPlayPauseState(false);
      }
    }

    function playerNext() {
      const wasPlaying = !audio.paused;
      loadTrack((currentTrack + 1) % tracks.length);
      if (wasPlaying) tryPlay();
    }

    function playerPrev() {
      if (audio.currentTime > 3) { audio.currentTime = 0; return; }
      const wasPlaying = !audio.paused;
      loadTrack((currentTrack - 1 + tracks.length) % tracks.length);
      if (wasPlaying) tryPlay();
    }

    function playerPlayTrack(trackId) {
      const trackIndex = tracks.findIndex(track => track.id === trackId);
      if (trackIndex < 0) return;
      loadTrack(trackIndex);
      openPanel('panel-player');
      tryPlay();
    }

    window.playerPlayTrack = playerPlayTrack;
    window.me0wberryPlayer = {
      applyState: applyPlayerState,
      getState: getPlayerState,
      pause: function() {
        audio.pause();
        setPlayPauseState(false);
      },
    };

    audio.addEventListener('timeupdate', function() {
      if (!audio.duration) return;
      progressEl.value = (audio.currentTime / audio.duration) * 100;
      currentTimeEl.textContent = fmtTime(audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', function() {
      totalTimeEl.textContent = fmtTime(audio.duration);
    });

    audio.addEventListener('play', function() { setPlayPauseState(true); });
    audio.addEventListener('pause', function() { setPlayPauseState(false); });
    audio.addEventListener('error', function() { setPlayPauseState(false); });
    audio.addEventListener('ended', playerNext);

    progressEl.addEventListener('input', function() {
      if (audio.duration) audio.currentTime = (progressEl.value / 100) * audio.duration;
    });

    volumeEl.addEventListener('input', function() {
      audio.volume = parseFloat(volumeEl.value);
    });

    audio.volume = 0.75;

    (function() {
      const savedTrackValue = parseInt(sessionStorage.getItem('player_track') || '0');
      const savedTrack = Number.isInteger(savedTrackValue) && savedTrackValue >= 0 && savedTrackValue < tracks.length ? savedTrackValue : 0;
      const savedTime    = parseFloat(sessionStorage.getItem('player_time') || '0');

      loadTrack(savedTrack);

      if (savedTime > 0) {
        audio.addEventListener('canplay', function seekOnce() {
          audio.currentTime = savedTime;
          audio.removeEventListener('canplay', seekOnce);
        });
      }
    })();

    window.addEventListener('beforeunload', function() {
      sessionStorage.setItem('player_track', currentTrack);
      sessionStorage.setItem('player_time', audio.currentTime);
      sessionStorage.removeItem('player_playing');
    });

    // ── Stubby Slideshow ──
    (function() {
      let current = 0;
      let timer = null;
      let images = [];
      let track = null;
      let dotsEl = null;

      function ensureLoaded(index) {
        if (!images.length) return;
        const normalized = ((index % images.length) + images.length) % images.length;
        const image = images[normalized];
        if (!image.getAttribute('src') && image.dataset.src) {
          image.setAttribute('src', image.dataset.src);
        }
      }

      function goTo(n) {
        if (!images.length || !track) return;
        current = (n + images.length) % images.length;
        ensureLoaded(current);
        ensureLoaded(current + 1);
        track.style.transform = `translateX(-${current * 100}%)`;
        dotsEl.querySelectorAll('.slide-dot').forEach((dot, index) => {
          const isActive = index === current;
          dot.classList.toggle('active', isActive);
          dot.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
      }

      function startTimer() {
        if (timer) clearInterval(timer);
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        timer = setInterval(() => goTo(current + 1), 8000);
      }

      window.stubbyNext = function() { goTo(current + 1); startTimer(); };
      window.stubbyPrev = function() { goTo(current - 1); startTimer(); };

      // Init dots
      document.addEventListener('DOMContentLoaded', function() {
        track = document.getElementById('stubby-track');
        dotsEl = document.getElementById('stubby-dots');
        if (!track || !dotsEl) return;

        images = Array.from(track.querySelectorAll('.slide-img'));
        if (!images.length) return;

        for (let i = 0; i < images.length; i++) {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'slide-dot' + (i === 0 ? ' active' : '');
          dot.setAttribute('aria-label', `show stubby photo ${i + 1}`);
          dot.setAttribute('aria-current', i === 0 ? 'true' : 'false');
          dot.onclick = () => { goTo(i); startTimer(); };
          dotsEl.appendChild(dot);
        }

        ensureLoaded(0);
        track.style.transform = 'translateX(0)';
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) startTimer();
      });
    })();

    // ── Init: open default panels ──
    if (!isMobileViewport()) {
      // bio opens at top-left
      openPanel('panel-bio');
    }

    // The player defaults open, but an explicit close remains in effect for this browser session.
    subscribeToPlayerVisibility(function(isOpen) {
      const player = document.getElementById('panel-player');
      document.documentElement.classList.add('player-visibility-ready');
      if (!player) return;

      player.toggleAttribute('hidden', !isOpen);
      if (!isOpen) {
        player.classList.remove('open');
        const popout = clearUtilityPopout('player');
        if (popout && !popout.popup.closed) popout.popup.close();
        updateTaskbar();
        return;
      }

      if (!isMobileViewport()) {
        player.classList.add('open');
        positionUtilityPanel(player, {
          width: 280,
          rightOffset: 20,
          bottomOffset: UTILITY_PANEL_BOTTOM_OFFSET,
        });
        bringToFront(player);
      }
      updateTaskbar();
    });

    // ── Update category panel after post ──
    function updateCategoryPanel(category, posts) {
      const linkedPosts = posts.map((post) => {
        const path = post.url || post.file;
        return path ? { ...post, href: sitePath(path) } : null;
      }).filter(Boolean);
      if (!linkedPosts.length) return;

      const latest = linkedPosts[0];
      const latestEl = document.getElementById(`latest-${category}`);
      const postsEl  = document.getElementById(`posts-${category}`);

      if (latestEl) {
        latestEl.innerHTML = `
          <div class="panel-px-label" style="margin-bottom:6px;">latest ✦</div>
          <div style="font-size:13px;font-weight:500;color:var(--heading);margin-bottom:2px;">${latest.title}</div>
          <div style="font-size:11px;color:var(--muted);font-style:italic;margin-bottom:10px;">${latest.date}</div>
          <a href="${latest.href}" class="pixel-btn" style="font-size:11px;">read ↗</a>
        `;
      }

      if (postsEl && linkedPosts.length > 1) {
        postsEl.innerHTML = linkedPosts.slice(1).map(p =>
          `<li><a href="${p.href}" style="color:var(--pink);font-size:13px;text-decoration:none;border-bottom:1px dotted rgba(224,112,144,0.4);">${p.title}</a> <span style="color:var(--muted);font-size:11px;">· ${p.date}</span></li>`
        ).join('');
      }
    }

    let postGalleryState = null;

    function ensurePostSlideLoaded(index) {
      if (!postGalleryState) return;
      const total = postGalleryState.images.length;
      if (!total) return;

      const normalized = ((index % total) + total) % total;
      const image = postGalleryState.images[normalized];
      if (image && !image.getAttribute('src')) {
        const deferredSrc = image.dataset.src;
        if (deferredSrc) {
          image.setAttribute('src', deferredSrc);
        }
      }
    }

    function syncPostSlideDots() {
      if (!postGalleryState) return;
      postGalleryState.dots.forEach((dot, index) => {
        const isActive = index === postGalleryState.current;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    }

    function goToPostSlide(index) {
      if (!postGalleryState) return;
      const total = postGalleryState.images.length;
      if (!total) return;

      postGalleryState.current = ((index % total) + total) % total;
      ensurePostSlideLoaded(postGalleryState.current);
      ensurePostSlideLoaded(postGalleryState.current + 1);
      ensurePostSlideLoaded(postGalleryState.current - 1);
      postGalleryState.track.style.transform = `translateX(-${postGalleryState.current * 100}%)`;
      syncPostSlideDots();
    }

    window.postSlideNext = function() {
      goToPostSlide((postGalleryState ? postGalleryState.current : 0) + 1);
    };

    window.postSlidePrev = function() {
      goToPostSlide((postGalleryState ? postGalleryState.current : 0) - 1);
    };

    function initPostGallery() {
      const track = document.getElementById('post-slide-track');
      const dotsEl = document.getElementById('post-slide-dots');
      if (!track || !dotsEl) return;

      const images = Array.from(track.querySelectorAll('.slide-img'));
      if (!images.length) return;

      postGalleryState = {
        current: 0,
        track,
        dots: [],
        images,
      };

      dotsEl.innerHTML = '';
      images.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'slide-dot';
        dot.setAttribute('aria-label', `show photo ${index + 1}`);
        dot.addEventListener('click', function() {
          goToPostSlide(index);
        });
        dotsEl.appendChild(dot);
        postGalleryState.dots.push(dot);
      });

      ensurePostSlideLoaded(0);
      ensurePostSlideLoaded(1);
      postGalleryState.track.style.transform = 'translateX(0)';
      syncPostSlideDots();
    }

    // ── Load posts from index.json on page load ──
    async function loadAllPosts() {
      const categories = ['games','music','food','stubby','beauty','lately'];
      const hasPostTargets = categories.some(category =>
        document.getElementById(`latest-${category}`) || document.getElementById(`posts-${category}`)
      );
      if (!hasPostTargets) return;

      const bundledPosts = window.me0wberrySearchIndex?.posts;
      if (Array.isArray(bundledPosts)) {
        categories.forEach((category) => {
          const displayCategory = category === 'lately' ? 'now' : category;
          updateCategoryPanel(category, bundledPosts.filter((post) => post.category === displayCategory));
        });
        return;
      }

      const cacheBust = Date.now();
      await Promise.all(categories.map(async (cat) => {
        try {
          const res = await fetch(sitePath(`/posts/${cat}/index.json?t=${cacheBust}`));
          if (!res.ok) return;
          const posts = await res.json();
          updateCategoryPanel(cat, posts);
        } catch(e) { /* no posts yet */ }
      }));
    }

    // Call on page load
    document.addEventListener('DOMContentLoaded', loadAllPosts);
    document.addEventListener('DOMContentLoaded', initPostGallery);

// ── Background Decorations ──
(function injectBgDecos() {
  const decos = [
    { char:'✦', l:4,  t:8,  s:21, o:0.48, r:12  },
    { char:'✧', l:15, t:22, s:14, o:0.43, r:0   },
    { char:'♡', l:28, t:5,  s:17, o:0.46, r:-8  },
    { char:'✦', l:43, t:14, s:24, o:0.43, r:5   },
    { char:'✿', l:59, t:7,  s:14, o:0.46, r:0   },
    { char:'✧', l:71, t:19, s:18, o:0.44, r:-15 },
    { char:'♡', l:86, t:11, s:19, o:0.48, r:22  },
    { char:'˚',  l:7,  t:42, s:13, o:0.43, r:0   },
    { char:'✿', l:21, t:57, s:22, o:0.45, r:-10 },
    { char:'✦', l:36, t:73, s:15, o:0.46, r:0   },
    { char:'˚',  l:51, t:63, s:12, o:0.43, r:0   },
    { char:'✧', l:66, t:81, s:18, o:0.46, r:8   },
    { char:'♡', l:79, t:47, s:16, o:0.48, r:0   },
    { char:'✦', l:91, t:69, s:23, o:0.43, r:-5  },
    { char:'✿', l:3,  t:65, s:15, o:0.45, r:18  },
    { char:'✦', l:38, t:42, s:20, o:0.43, r:0   },
    { char:'♡', l:62, t:52, s:17, o:0.48, r:-6  },
    { char:'⋆',  l:10, t:34, s:16, o:0.41, r:-7  },
    { char:'✩',  l:19, t:47, s:13, o:0.38, r:14  },
    { char:'★',  l:27, t:78, s:15, o:0.43, r:-3  },
    { char:'⋆',  l:44, t:53, s:14, o:0.40, r:-11 },
    { char:'✩',  l:48, t:36, s:18, o:0.37, r:8   },
    { char:'★',  l:54, t:77, s:17, o:0.44, r:9   },
    { char:'⋆',  l:63, t:27, s:12, o:0.38, r:-4  },
    { char:'✩',  l:75, t:66, s:19, o:0.42, r:17  },
    { char:'★',  l:83, t:38, s:13, o:0.46, r:-20 },
    { char:'⋆',  l:89, t:55, s:15, o:0.39, r:11  },
    { char:'✩',  l:16, t:91, s:14, o:0.41, r:6   },
    { char:'★',  l:57, t:93, s:17, o:0.36, r:-9  },
    { gif:sitePath('/images/cats/cat-0363.gif'), l:11, t:79, o:0.33 },
    { gif:sitePath('/images/cats/cat-0491.gif'), l:56, t:36, o:0.33 },
    { gif:sitePath('/images/cats/cat-0420.gif'), l:81, t:29, o:0.33 },
    { gif:sitePath('/images/cats/cat-0421.gif'), l:33, t:88, o:0.33 },
    { gif:sitePath('/images/cats/cat-0363.gif'), l:68, t:15, o:0.33 },
  ];

  // Don't inject if index.html already has bg-decos hardcoded
  if (document.querySelector('.bg-deco')) return;

  decos.forEach(d => {
    const el = document.createElement('span');
    el.className = 'bg-deco';
    if (d.gif) {
      const img = document.createElement('img');
      img.src = d.gif;
      img.style.height = '24px';
      img.style.width = 'auto';
      img.style.imageRendering = 'pixelated';
      el.appendChild(img);
    } else {
      el.textContent = d.char;
      el.style.fontSize = d.s + 'px';
      el.style.color = 'white';
      if (d.r) el.style.transform = 'rotate(' + d.r + 'deg)';
      if (d.mono) el.style.fontFamily = "'Press Start 2P', monospace";
    }
    el.style.left = d.l + '%';
    el.style.top  = d.t + '%';
    el.style.opacity = d.o;
    document.body.appendChild(el);
  });

  // Inject pixel bow SVGs
  const bows = [
    { l:47, t:89, r:0   },
    { l:23, t:31, r:-12 },
    { l:73, t:56, r:16  },
  ];

  bows.forEach(b => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('class','bg-deco');
    svg.setAttribute('viewBox','0 0 18 12');
    svg.style.left    = b.l + '%';
    svg.style.top     = b.t + '%';
    svg.style.width   = '28px';
    svg.style.height  = '18px';
    svg.style.opacity = '0.43';
    if (b.r) svg.style.transform = 'rotate(' + b.r + 'deg)';
    svg.innerHTML = '<rect x="0" y="3" width="2" height="6" fill="white"/><rect x="2" y="1" width="2" height="10" fill="white"/><rect x="4" y="0" width="2" height="12" fill="white"/><rect x="6" y="1" width="2" height="10" fill="white"/><rect x="10" y="1" width="2" height="10" fill="white"/><rect x="12" y="0" width="2" height="12" fill="white"/><rect x="14" y="1" width="2" height="10" fill="white"/><rect x="16" y="3" width="2" height="6" fill="white"/><rect x="8" y="4" width="2" height="4" fill="white"/>';
    document.body.appendChild(svg);
  });
})();

// ── Pixel Cat Strip ──
(function() {
  const SPEED_MIN = 0.5;
  const SPEED_MAX = 1.3;

  let cats = [];
  let animFrame = null;
  let enabled = true;
  let strip = null;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function createStrip() {
    strip = document.createElement('div');
    strip.id = 'cat-strip';
    document.body.appendChild(strip);
  }

  // Naranya was adopted from cinni.net/adopt; visitor-facing credit lives in System.
  const CAT_GIFS = [
    sitePath('/images/cats/cat-0363.gif'),
    sitePath('/images/cats/cat-0491.gif'),
    sitePath('/images/cats/cat-0420.gif'),
    sitePath('/images/cats/cat-0421.gif'),
    sitePath('/images/cats/naranya-walking.gif'),
  ];

  function createCat(index) {
    const el = document.createElement('div');
    el.className = 'cat-walker';
    const img = document.createElement('img');
    img.src = CAT_GIFS[index % CAT_GIFS.length];
    img.style.height = '32px';
    img.style.width = 'auto';
    img.style.imageRendering = 'pixelated';
    el.appendChild(img);
    strip.appendChild(el);

    const speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
    const dir = Math.random() < 0.5 ? 1 : -1;
    const startX = Math.random() * (window.innerWidth - 120);
    const bounceOffset = Math.random() * 10;
    const bounceSpeed = 0.02 + Math.random() * 0.02;
    let x = startX;
    let tick = Math.random() * Math.PI * 2;

    return { el, x, dir, speed, bounceOffset, bounceSpeed, tick };
  }

  function initCats() {
    if (!strip) return;
    strip.innerHTML = '';
    cats = [];
    for (let i = 0; i < CAT_GIFS.length; i++) {
      cats.push(createCat(i));
    }
  }

  function updateCats() {
    if (!enabled) return;
    const W = window.innerWidth;

    cats.forEach(cat => {
      cat.x += cat.speed * cat.dir;
      cat.tick += cat.bounceSpeed;
      const yOffset = Math.sin(cat.tick) * 5 + cat.bounceOffset;

      const elW = cat.el.offsetWidth || 80;

      if (cat.x <= 0) {
        cat.x = 0;
        cat.dir = 1;
        triggerBonk(cat, 'right');
      } else if (cat.x + elW >= W) {
        cat.x = W - elW;
        cat.dir = -1;
        triggerBonk(cat, 'left');
      }

      cat.el.style.left = cat.x + 'px';
      cat.el.style.bottom = (6 + yOffset) + 'px';
      cat.el.style.transform = cat.dir === -1 ? 'scaleX(-1)' : 'scaleX(1)';
    });

    animFrame = requestAnimationFrame(updateCats);
  }

  function triggerBonk(cat, side) {
    cat.el.classList.remove('bonk');
    void cat.el.offsetWidth;
    cat.el.style.animation = 'none';
    void cat.el.offsetWidth;
    cat.el.style.animation = side === 'left'
      ? 'cat-bonk 0.25s ease'
      : 'cat-bonk-right 0.25s ease';
    setTimeout(() => { cat.el.style.animation = ''; }, 260);
  }

  function setEnabled(val) {
    enabled = val;
    localStorage.setItem('cats_enabled', val ? '1' : '0');
    if (strip) strip.style.display = val ? '' : 'none';
    const btn = document.getElementById('cat-toggle');
    if (btn) {
      btn.title = val ? 'hide cats' : 'show cats';
      btn.setAttribute('aria-pressed', val ? 'true' : 'false');
    }
    if (val) {
      initCats();
      updateCats();
    } else {
      if (animFrame) cancelAnimationFrame(animFrame);
    }
  }

  window.toggleCats = function() {
    setEnabled(!enabled);
  };

  document.addEventListener('DOMContentLoaded', function() {
    createStrip();
    const saved = localStorage.getItem('cats_enabled');
    if (saved === null && prefersReducedMotion) {
      enabled = false;
      strip.style.display = 'none';
      const btn = document.getElementById('cat-toggle');
      if (btn) {
        btn.title = 'show cats';
        btn.setAttribute('aria-pressed', 'false');
      }
      return;
    }
    const startEnabled = saved === null ? true : saved === '1';
    setEnabled(startEnabled);
  });
})();
