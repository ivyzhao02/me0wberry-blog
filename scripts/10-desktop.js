    const MOBILE_BREAKPOINT = 768;
    const UTILITY_PANEL_BOTTOM_OFFSET = 72;
    const PINNED_Z_INDEX_BASE = 9000;
    const PLAYER_HANDOFF_KEY = 'me0wberry_player_handoff_v1';
    const PERSISTENT_PANEL_IDS = new Set(['panel-player']);
    const GIFYPET_PANEL_IDS = new Set(['panel-gifypet']);
    const UTILITY_POPOUT_META = {
      gifypets: { panelId: 'panel-gifypet', width: 370, rightOffset: 310, popupWidth: 410, popupHeight: 560 },
      player: { panelId: 'panel-player', width: 280, rightOffset: 20, popupWidth: 340, popupHeight: 330 },
    };
    const utilityPopouts = new Map();
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

      if (kind === 'player') writePlayerHandoff();
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
      });
      panel.querySelectorAll('[data-gifypet-stage]').forEach(stage => {
        stage.classList.toggle('is-active', stage.dataset.gifypetStage === pet);
      });
    }

    function openGifypetPanel(pet = 'stubby') {
      const panel = document.getElementById('panel-gifypet');
      if (!panel) return;

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
    function openPanel(id) {
      const panel = document.getElementById(id);
      if (!panel) return;

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
        panel.style.top  = id === 'panel-cactus' ? '60px' : '20px';
        panel.style.left = id === 'panel-cactus' ? '60px' : '18px';
        if (id !== 'panel-bio') panel.style.width = '';
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
      panel.classList.remove('open');
      // restore bio highlight if needed
      const wasActive = document.querySelector(`.nav-item[data-opens="${id}"].active`);
      if (wasActive) {
        wasActive.classList.remove('active');
        const bio = document.querySelector('.nav-item[data-opens="panel-bio"]');
        if (bio) bio.classList.add('active');
      }
      updateTaskbar();
    }

    function mobileBack() {
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('open'));
      document.body.classList.remove('mobile-panel');
      updateTaskbar();
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

    document.addEventListener('DOMContentLoaded', initKeyboardControls);

    // ── Drag (from reference) ──
    (function() {
      let dragging = null, ox = 0, oy = 0, dragFrame = null;

      document.addEventListener('mousedown', function(e) {
        const tb = e.target.closest('.panel-titlebar');
        if (!tb || e.target.closest('.panel-window-actions')) return;
        if (isMobileViewport()) return;

        const panel = tb.closest('.panel');
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
      tabbar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const body = tabbar.nextElementSibling; // .panel-body
      body.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
      document.getElementById(targetId).classList.add('active');
    }

    // ── Discord popup ──
    function showDiscordPopup() {
      const popup = document.getElementById('discord-popup');
      popup.classList.add('open');
      popup.style.zIndex = ++zTop;
    }
    function hideDiscordPopup() {
      document.getElementById('discord-popup').classList.remove('open');
    }

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
