    // ── Site Config ──
    const MOBILE_BREAKPOINT = 768;
    const PERSISTENT_PANEL_IDS = new Set(['panel-player', 'panel-cactus', 'panel-gifypet', 'panel-josh']);

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

    // ── Panel widths ──
    // ── Open / Close ──
    function openPanel(id) {
      const panel = document.getElementById(id);
      if (!panel) return;

      if (isMobileViewport()) {
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('open'));
        panel.classList.add('open');
        document.body.classList.add('mobile-panel');
        return;
      }

      // Close all open panels before opening the new one
      // Persistent utility panels stay open alongside the main content panels.
      document.querySelectorAll('.panel.open').forEach(p => {
        if (!isPersistentPanel(p)) {
          p.classList.remove('open');
        }
      });

      // Desktop: reset position for main content panels.
      if (!isPersistentPanel(panel)) {
        panel.style.top  = '20px';
        panel.style.left = '18px';
        if (id !== 'panel-bio') panel.style.width = '';
      } else if (id === 'panel-cactus' && !panel.classList.contains('open')) {
        panel.style.top  = '60px';
        panel.style.left = '60px';
      }
      panel.classList.add('open');
      bringToFront(panel);

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
    }

    function mobileBack() {
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('open'));
      document.body.classList.remove('mobile-panel');
    }

    const STUBBY_GIFYPET_URL = 'https://me0wberry.com/gifypet/pet.html?name=Stubby&dob=1775770472&gender=f&element=Fire&pet=https%3A%2F%2Fme0wberry.com%2Fimages%2Fstubby-gifypet.png&map=https%3A%2F%2Fme0wberry.com%2Fimages%2Fgrass-map-200.jpg&background=&tablecolor=%23ffffff&textcolor=%234a3a42';
    const CACTUS_GIFYPET_URL = 'https://me0wberry.com/gifypet/pet.html?name=Cactus&dob=1775772452&gender=m&element=Earth&pet=https%3A%2F%2Fme0wberry.com%2Fimages%2Fcactus-gifypet.png&map=https%3A%2F%2Fme0wberry.com%2Fimages%2Fgingham-map-200.jpg&background=&tablecolor=%23ffffff&textcolor=%234a3a42';

    function openStubbyGifypet() {
      if (isMobileViewport()) {
        window.open(STUBBY_GIFYPET_URL, '_blank');
        return;
      }

      openPanel('panel-gifypet');
    }

    function openCactusGifypet() {
      if (isMobileViewport()) {
        window.open(CACTUS_GIFYPET_URL, '_blank');
        return;
      }

      openPanel('panel-josh');
    }

    function openGifypetsExperience() {
      if (isMobileViewport()) {
        window.open(STUBBY_GIFYPET_URL, '_blank');
        return;
      }

      openPanel('panel-gifypet');
      openPanel('panel-josh');
    }

    // click panel → bring to front
    document.addEventListener('mousedown', function(e) {
      if (e.target.closest('a')) return;
      const panel = e.target.closest('.panel');
      if (panel) bringToFront(panel);
    });

    // ── Drag (from reference) ──
    (function() {
      let dragging = null, ox = 0, oy = 0;

      document.addEventListener('mousedown', function(e) {
        const tb = e.target.closest('.panel-titlebar');
        if (!tb || e.target.closest('.panel-close')) return;
        if (isMobileViewport()) return;

        const panel = tb.closest('.panel');
        bringToFront(panel);
        dragging = panel;

        const rect = panel.getBoundingClientRect();
        const mainRect = document.getElementById('main').getBoundingClientRect();
        ox = e.clientX - rect.left;
        oy = e.clientY - rect.top;

        panel.style.left  = (rect.left - mainRect.left) + 'px';
        panel.style.top   = (rect.top  - mainRect.top)  + 'px';
        panel.style.width = rect.width + 'px';
        panel.style.right  = '';
        panel.style.bottom = '';

        e.preventDefault();
      });

      document.addEventListener('mousemove', function(e) {
        if (!dragging) return;
        const mainRect = document.getElementById('main').getBoundingClientRect();
        let x = e.clientX - mainRect.left - ox;
        let y = e.clientY - mainRect.top  - oy;
        x = Math.max(-dragging.offsetWidth + 60, x);
        y = Math.max(0, y);
        dragging.style.left = x + 'px';
        dragging.style.top  = y + 'px';
      });

      document.addEventListener('mouseup', function() { dragging = null; });
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
    });

    // ── Audio Player ──
    const tracks = [
      { src: '/audio/please-dont-stop.mp3',    title: "please don't stop being sweet to me · lace" },
      { src: '/audio/forever-and.mp3',          title: 'forever & · EJEAN' },
      { src: '/audio/huayuan-meteor-rain.mp3',  title: '花园裡的流星雨 · Karencici' },
      { src: '/audio/tianshi-jiazaizhong.mp3',  title: '天使加载中...^_−☆ · Angels of Delusion' },
      { src: '/audio/redreaming-angel.mp3',     title: 'ReDreaming Angel · Angels of Delusion' },
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

    function checkMarquee() {
      const container = marqueeWrap.parentElement;
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
      playPauseBtn.textContent = '▶';
      // check marquee after paint
      requestAnimationFrame(checkMarquee);
    }

    function playerToggle() {
      if (audio.paused) {
        audio.play().catch(function() {}); // handle missing file gracefully
        playPauseBtn.textContent = '❚❚';
      } else {
        audio.pause();
        playPauseBtn.textContent = '▶';
      }
    }

    function playerNext() {
      const wasPlaying = !audio.paused;
      loadTrack((currentTrack + 1) % tracks.length);
      if (wasPlaying) { audio.play().catch(function(){}); playPauseBtn.textContent = '❚❚'; }
    }

    function playerPrev() {
      if (audio.currentTime > 3) { audio.currentTime = 0; return; }
      const wasPlaying = !audio.paused;
      loadTrack((currentTrack - 1 + tracks.length) % tracks.length);
      if (wasPlaying) { audio.play().catch(function(){}); playPauseBtn.textContent = '❚❚'; }
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

    const introOverlay = document.getElementById('intro-overlay');
    if (introOverlay) introOverlay.addEventListener('click', function() {
      this.classList.add('fade-out');
      setTimeout(() => this.remove(), 800);
      audio.play().catch(function(){});
      playPauseBtn.textContent = '❚❚';
    });

    (function() {
      const savedTrack   = parseInt(sessionStorage.getItem('player_track') || '0');
      const savedTime    = parseFloat(sessionStorage.getItem('player_time') || '0');
      const savedPlaying = sessionStorage.getItem('player_playing') === 'true';

      loadTrack(savedTrack);

      if (savedTime > 0) {
        audio.addEventListener('canplay', function seekOnce() {
          audio.currentTime = savedTime;
          audio.removeEventListener('canplay', seekOnce);
          if (savedPlaying) {
            audio.play().catch(function(){});
            playPauseBtn.textContent = '❚❚';
          }
        });
      }
    })();

    window.addEventListener('beforeunload', function() {
      sessionStorage.setItem('player_track', currentTrack);
      sessionStorage.setItem('player_time', audio.currentTime);
      sessionStorage.setItem('player_playing', (!audio.paused).toString());
    });

    // ── Stubby Slideshow ──
    (function() {
      const total = 3;
      let current = 0;
      let timer = null;

      function goTo(n) {
        current = (n + total) % total;
        const track = document.getElementById('stubby-track');
        if (track) track.style.transform = `translateX(-${current * 100}%)`;
        const dots = document.querySelectorAll('.slide-dot');
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
      }

      function startTimer() {
        if (timer) clearInterval(timer);
        timer = setInterval(() => goTo(current + 1), 8000);
      }

      window.stubbyNext = function() { goTo(current + 1); startTimer(); };
      window.stubbyPrev = function() { goTo(current - 1); startTimer(); };

      // Init dots
      document.addEventListener('DOMContentLoaded', function() {
        const dotsEl = document.getElementById('stubby-dots');
        if (dotsEl) {
          for (let i = 0; i < total; i++) {
            const d = document.createElement('div');
            d.className = 'slide-dot' + (i === 0 ? ' active' : '');
            d.onclick = () => { goTo(i); startTimer(); };
            dotsEl.appendChild(d);
          }
        }
        goTo(0);
        startTimer();
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
        player.style.top  = Math.max(12, refHeight - playerH - 20) + 'px';
      })();
    }

    // gifypet panel — opens to the left of the player
    (function() {
      const gifypet = document.getElementById('panel-gifypet');
      const mainEl  = document.getElementById('main');
      if (!gifypet) return;

      const gifypetW = 330;
      gifypet.style.width = gifypetW + 'px';
      gifypet.classList.add('open');
      bringToFront(gifypet);
    
      const isInMain  = mainEl && mainEl.contains(gifypet);
      const mainRect  = isInMain ? mainEl.getBoundingClientRect() : null;
      const refWidth  = mainRect ? mainRect.width  : window.innerWidth;
      const refHeight = mainRect ? mainRect.height : window.innerHeight;
      const playerW   = 280;
      const gifypetH  = gifypet.offsetHeight;
      if (!isInMain) gifypet.style.position = 'fixed';
      gifypet.style.left = Math.max(12, refWidth - playerW - gifypetW - 30) + 'px';
      gifypet.style.top  = Math.max(12, refHeight - gifypetH - 20) + 'px';
    })();

    // josh/cactus gifypet panel — to the left of stubby
    (function() {
      const josh    = document.getElementById('panel-josh');
      const mainEl  = document.getElementById('main');
      if (!josh) return;
    
      const joshW = 330;
      josh.style.width = joshW + 'px';
      josh.classList.add('open');
      bringToFront(josh);
    
      const isInMain  = mainEl && mainEl.contains(josh);
      const mainRect  = isInMain ? mainEl.getBoundingClientRect() : null;
      const refWidth  = mainRect ? mainRect.width  : window.innerWidth;
      const refHeight = mainRect ? mainRect.height : window.innerHeight;
      const playerW   = 280;
      const gifypetW  = 330;
      const joshH     = josh.offsetHeight;
      if (!isInMain) josh.style.position = 'fixed';
      josh.style.left = Math.max(12, refWidth - playerW - gifypetW - joshW - 40) + 'px';
      josh.style.top  = Math.max(12, refHeight - joshH - 20) + 'px';
    })();

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

    // ── Load posts from index.json on page load ──
    async function loadAllPosts() {
      const categories = ['games','music','food','stubby','beauty','lately'];
      for (const cat of categories) {
        try {
          const res = await fetch(`posts/${cat}/index.json?t=${Date.now()}`);
          if (!res.ok) continue;
          const posts = await res.json();
          updateCategoryPanel(cat, posts);
        } catch(e) { /* no posts yet */ }
      }
    }

    // Call on page load
    document.addEventListener('DOMContentLoaded', loadAllPosts);

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
    { gif:'/images/cats/cat-0363.gif', l:11, t:79, o:0.33 },
    { gif:'/images/cats/cat-0491.gif', l:56, t:36, o:0.33 },
    { gif:'/images/cats/cat-0420.gif', l:81, t:29, o:0.33 },
    { gif:'/images/cats/cat-0421.gif', l:33, t:88, o:0.33 },
    { gif:'/images/cats/cat-0363.gif', l:68, t:15, o:0.33 },
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
  const CAT_COUNT = 4;
  const SPEED_MIN = 0.5;
  const SPEED_MAX = 1.3;

  let cats = [];
  let animFrame = null;
  let enabled = true;
  let strip = null;

  function createStrip() {
    strip = document.createElement('div');
    strip.id = 'cat-strip';
    document.body.appendChild(strip);
  }

  const CAT_GIFS = [
    '/images/cats/cat-0363.gif',
    '/images/cats/cat-0491.gif',
    '/images/cats/cat-0420.gif',
    '/images/cats/cat-0421.gif',
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
    for (let i = 0; i < CAT_COUNT; i++) {
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
    if (btn) btn.title = val ? 'hide cats' : 'show cats';
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
    const startEnabled = saved === null ? true : saved === '1';
    setEnabled(startEnabled);
    updateCats();
  });
})();
