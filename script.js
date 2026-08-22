    // ── Site Config ──
    const SITE_ROOT = document.currentScript && document.currentScript.dataset.siteRoot;
    function sitePath(value) {
      if (!SITE_ROOT || !value.startsWith('/')) return value;
      return new URL(value.slice(1), new URL(`${SITE_ROOT}/`, window.location.href)).href;
    }

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

    function surpriseMe() {
      const posts = window.me0wberrySearchIndex?.posts;
      if (!Array.isArray(posts) || posts.length === 0) {
        window.location.href = sitePath('/archive/index.html');
        return;
      }

      const currentPath = decodeURIComponent(window.location.pathname).replace(/\\/g, '/');
      const choices = posts.filter((post) => !currentPath.endsWith(post.url));
      const pool = choices.length ? choices : posts;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      window.location.href = sitePath(pick.url);
    }

    window.surpriseMe = surpriseMe;

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

    // ── Audio Player ──
    const tracks = [
      { src: sitePath('/audio/please-dont-stop.mp3'),    title: "please don't stop being sweet to me · lace" },
      { src: sitePath('/audio/forever-and.mp3'),          title: 'forever & · EJEAN' },
      { src: sitePath('/audio/huayuan-meteor-rain.mp3'),  title: '花园裡的流星雨 · Karencici' },
      { src: sitePath('/audio/tianshi-jiazaizhong.mp3'),  title: '天使加载中...^_−☆ · Angels of Delusion' },
      { src: sitePath('/audio/redreaming-angel.mp3'),     title: 'ReDreaming Angel · Angels of Delusion' },
    ];
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

    function playerToggle() {
      if (audio.paused) {
        audio.play().catch(function() {}); // handle missing file gracefully
        setPlayPauseState(true);
      } else {
        audio.pause();
        setPlayPauseState(false);
      }
    }

    function playerNext() {
      const wasPlaying = !audio.paused;
      loadTrack((currentTrack + 1) % tracks.length);
      if (wasPlaying) { audio.play().catch(function(){}); setPlayPauseState(true); }
    }

    function playerPrev() {
      if (audio.currentTime > 3) { audio.currentTime = 0; return; }
      const wasPlaying = !audio.paused;
      loadTrack((currentTrack - 1 + tracks.length) % tracks.length);
      if (wasPlaying) { audio.play().catch(function(){}); setPlayPauseState(true); }
    }

    audio.addEventListener('timeupdate', function() {
      if (!audio.duration) return;
      progressEl.value = (audio.currentTime / audio.duration) * 100;
      currentTimeEl.textContent = fmtTime(audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', function() {
      totalTimeEl.textContent = fmtTime(audio.duration);
    });

    audio.addEventListener('ended', playerNext);

    progressEl.addEventListener('input', function() {
      if (audio.duration) audio.currentTime = (progressEl.value / 100) * audio.duration;
    });

    volumeEl.addEventListener('input', function() {
      audio.volume = parseFloat(volumeEl.value);
    });

    audio.volume = 0.75;

    (function() {
      const savedTrack   = parseInt(sessionStorage.getItem('player_track') || '0');
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

      // player opens at bottom-right of #main (or viewport if #main absent)
      (function() {
        const player  = document.getElementById('panel-player');
        const mainEl  = document.getElementById('main');
        const playerW = 280;
        player.style.width = playerW + 'px';
        player.classList.add('open');
        bringToFront(player);
        // measure rendered height then position
        const playerH   = player.offsetHeight;
        const isInMain  = mainEl && mainEl.contains(player);
        const mainRect  = isInMain ? mainEl.getBoundingClientRect() : null;
        const refWidth  = mainRect ? mainRect.width  : window.innerWidth;
        const refHeight = mainRect ? mainRect.height : window.innerHeight;
        if (!isInMain) player.style.position = 'fixed';
        player.style.left = Math.max(12, refWidth  - playerW - 20) + 'px';
        player.style.top  = Math.max(12, refHeight - playerH - UTILITY_PANEL_BOTTOM_OFFSET) + 'px';
      })();
      updateTaskbar();
    }

    // ── Update category panel after post ──
    function updateCategoryPanel(category, posts) {
      if (!posts.length) return;

      const latest = posts[0];
      const latestEl = document.getElementById(`latest-${category}`);
      const postsEl  = document.getElementById(`posts-${category}`);

      if (latestEl) {
        latestEl.innerHTML = `
          <div class="panel-px-label" style="margin-bottom:6px;">latest ✦</div>
          <div style="font-size:13px;font-weight:500;color:var(--heading);margin-bottom:2px;">${latest.title}</div>
          <div style="font-size:11px;color:var(--muted);font-style:italic;margin-bottom:10px;">${latest.date}</div>
          <a href="${latest.file}" class="pixel-btn" style="font-size:11px;">read ↗</a>
        `;
      }

      if (postsEl && posts.length > 1) {
        postsEl.innerHTML = posts.slice(1).map(p =>
          `<li><a href="${p.file}" style="color:var(--pink);font-size:13px;text-decoration:none;border-bottom:1px dotted rgba(224,112,144,0.4);">${p.title}</a> <span style="color:var(--muted);font-size:11px;">· ${p.date}</span></li>`
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
        dot.style.padding = '0';
        dot.style.display = 'block';
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

      const cacheBust = Date.now();
      await Promise.all(categories.map(async (cat) => {
        try {
          const res = await fetch(`/posts/${cat}/index.json?t=${cacheBust}`);
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
