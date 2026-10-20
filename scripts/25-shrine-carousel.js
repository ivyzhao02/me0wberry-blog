    const shrineCarousels = new WeakMap();

    function loadShrineCarouselPanel(panel) {
      if (!panel || panel.dataset.carouselLoaded === 'true') return;

      const videos = new Set();
      panel.querySelectorAll('[data-carousel-src]').forEach((asset) => {
        asset.src = asset.dataset.carouselSrc;
        asset.removeAttribute('data-carousel-src');
        const video = asset.closest('video');
        if (video) videos.add(video);
      });
      videos.forEach((video) => video.load());
      panel.dataset.carouselLoaded = 'true';
    }

    function makeShrineCarouselControls(root, count, options) {
      let controls = root.querySelector('[data-shrine-carousel-controls]');
      if (controls) return controls;

      controls = document.createElement('div');
      const previous = document.createElement('button');
      const status = document.createElement('span');
      const next = document.createElement('button');

      controls.className = 'shrine-carousel-controls';
      controls.dataset.shrineCarouselControls = '';
      previous.type = 'button';
      previous.dataset.shrineCarouselPrev = '';
      previous.setAttribute('aria-label', options.previousLabel || 'previous image');
      previous.textContent = '←';
      status.className = 'shrine-carousel-status';
      status.dataset.shrineCarouselStatus = '';
      status.setAttribute('aria-live', 'polite');
      next.type = 'button';
      next.dataset.shrineCarouselNext = '';
      next.setAttribute('aria-label', options.nextLabel || 'next image');
      next.textContent = '→';

      controls.append(previous, status, next);
      controls.hidden = count <= 1;
      root.appendChild(controls);
      return controls;
    }

    function createShrineCarousel(root, options = {}) {
      if (!root) return null;
      if (shrineCarousels.has(root)) return shrineCarousels.get(root);

      const panels = Array.from(root.querySelectorAll('[data-shrine-carousel-panel]'));
      if (!panels.length) return null;

      const controls = makeShrineCarouselControls(root, panels.length, options);
      const previous = controls.querySelector('[data-shrine-carousel-prev]');
      const next = controls.querySelector('[data-shrine-carousel-next]');
      const status = controls.querySelector('[data-shrine-carousel-status]');
      const counterWidth = Math.max(2, String(panels.length).length);
      let current = Math.min(Math.max(Number(options.initialIndex) || 0, 0), panels.length - 1);

      root.setAttribute('role', 'region');
      root.setAttribute('aria-roledescription', 'carousel');
      if (!root.hasAttribute('aria-label')) root.setAttribute('aria-label', options.label || 'image gallery');

      function show(index) {
        current = (index + panels.length) % panels.length;
        panels.forEach((panel, panelIndex) => {
          const active = panelIndex === current;
          panel.hidden = !active;
          panel.classList.toggle('is-active', active);
          panel.setAttribute('role', 'group');
          panel.setAttribute('aria-roledescription', 'slide');
          panel.setAttribute('aria-label', `${panelIndex + 1} of ${panels.length}`);
          panel.setAttribute('aria-hidden', String(!active));
          if (!active) panel.querySelectorAll('video').forEach((video) => video.pause());
        });

        loadShrineCarouselPanel(panels[current]);
        if (status) {
          status.textContent = `${String(current + 1).padStart(counterWidth, '0')} / ${String(panels.length).padStart(counterWidth, '0')}`;
        }
        root.dispatchEvent(new CustomEvent('shrinecarouselchange', {
          detail: { index: current, count: panels.length }
        }));
      }

      previous?.addEventListener('click', () => show(current - 1));
      next?.addEventListener('click', () => show(current + 1));
      root.addEventListener('keydown', (event) => {
        if (event.target.closest('video, input, select, textarea')) return;
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          show(current - 1);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          show(current + 1);
        }
      });

      const api = {
        show,
        next: () => show(current + 1),
        previous: () => show(current - 1),
        get index() { return current; },
        get count() { return panels.length; }
      };
      shrineCarousels.set(root, api);
      show(current);
      return api;
    }

    window.createShrineCarousel = createShrineCarousel;
