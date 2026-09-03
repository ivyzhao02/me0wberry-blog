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
