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
