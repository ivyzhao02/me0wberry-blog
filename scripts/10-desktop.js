    const MOBILE_BREAKPOINT = 768;
    const UTILITY_PANEL_BOTTOM_OFFSET = 72;
    const PERSISTENT_PANEL_IDS = new Set(['panel-player']);
    const GIFYPET_PANEL_IDS = new Set(['panel-gifypet', 'panel-josh']);
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
      'panel-gifypet': { label: 'stubby pet', icon: sitePath('/images/ui-icons/gifypets.png'), order: 90 },
      'panel-josh': { label: 'cactus pet', icon: sitePath('/images/ui-icons/gifypets.png'), order: 100 },
      'panel-player': { label: 'player', icon: sitePath('/images/ui-icons/player.png'), order: 110 }
    };

    // ── Z-index ──
    let zTop = 10;

    function bringToFront(panel) {
      zTop++;
      panel.style.zIndex = zTop;
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

    function openGifypetPanel(id, options = {}) {
      const panel = document.getElementById(id);
      if (!panel) return;

      closeTransientPanels({ keepGifypets: true });
      panel.classList.add('open');
      bringToFront(panel);
      positionUtilityPanel(panel, {
        width: 330,
        rightOffset: options.rightOffset || 310,
        bottomOffset: UTILITY_PANEL_BOTTOM_OFFSET
      });
      updateTaskbar();
    }

    // ── Panel widths ──
    // ── Open / Close ──
    function openPanel(id) {
      const panel = document.getElementById(id);
      if (!panel) return;

      if (isMobileViewport()) {
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

      if (panel.classList.contains('open')) {
        bringToFront(panel);
        updateTaskbar();
        return;
      }

      if (isGifypetPanel(panel)) {
        openGifypetPanel(id, { rightOffset: id === 'panel-josh' ? 650 : 310 });
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

    const STUBBY_GIFYPET_URL = 'https://me0wberry.com/gifypet/pet.html?name=Stubby&dob=1775770472&gender=f&element=Fire&pet=https%3A%2F%2Fme0wberry.com%2Fimages%2Fstubby-gifypet.png&map=https%3A%2F%2Fme0wberry.com%2Fimages%2Fgrass-map-200.jpg&background=&tablecolor=%23ffffff&textcolor=%234a3a42';
    const CACTUS_GIFYPET_URL = 'https://me0wberry.com/gifypet/pet.html?name=Cactus&dob=1775772452&gender=m&element=Earth&pet=https%3A%2F%2Fme0wberry.com%2Fimages%2Fcactus-gifypet.png&map=https%3A%2F%2Fme0wberry.com%2Fimages%2Fgingham-map-200.jpg&background=&tablecolor=%23ffffff&textcolor=%234a3a42';

    function openStubbyGifypet() {
      if (isMobileViewport()) {
        window.open(STUBBY_GIFYPET_URL, '_blank');
        return;
      }

      openGifypetPanel('panel-gifypet');
    }

    function openCactusGifypet() {
      if (isMobileViewport()) {
        window.open(CACTUS_GIFYPET_URL, '_blank');
        return;
      }

      openGifypetPanel('panel-josh');
    }

    function openGifypetsExperience() {
      if (isMobileViewport()) {
        window.open(STUBBY_GIFYPET_URL, '_blank');
        return;
      }

      openGifypetPanel('panel-gifypet', { rightOffset: 310 });
      openGifypetPanel('panel-josh', { rightOffset: 650 });
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
        if (!tb || e.target.closest('.panel-close')) return;
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
