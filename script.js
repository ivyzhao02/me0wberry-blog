    // ── GitHub API Config ──
    let githubToken = '';
    const GITHUB_REPO = 'ivyzhao02/me0wberry-blog';
    const GITHUB_BRANCH = 'main';
    const POST_PASSWORD = '15meowoofCactus';

    // ── Z-index ──
    let zTop = 10;

    function bringToFront(panel) {
      zTop++;
      panel.style.zIndex = zTop;
    }

    // ── Panel widths ──
    // ── Open / Close ──
    function openPanel(id) {
      const panel = document.getElementById(id);
      if (!panel) return;

      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('open'));
        panel.classList.add('open');
        document.body.classList.add('mobile-panel');
        return;
      }

      // Close all open panels before opening the new one
      // Exception: panel-player and panel-cactus stay open regardless
      document.querySelectorAll('.panel.open').forEach(p => {
        if (p.id !== 'panel-player' && p.id !== 'panel-cactus') {
          p.classList.remove('open');
        }
      });

      // Desktop: reset position (not for player/cactus — they keep their position)
      if (id !== 'panel-player' && id !== 'panel-cactus') {
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
        if (window.innerWidth <= 768) return;

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
        if (window.innerWidth <= 768) return;
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
      if (window.innerWidth > 768) document.body.classList.remove('mobile-panel');
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

    loadTrack(0);

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
    if (window.innerWidth > 768) {
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
    // ── Post Overlay ──
    function openPostOverlay() {
      document.getElementById('post-overlay').style.display = 'block';
      document.getElementById('post-password-input').value = '';
      document.getElementById('post-auth-error').style.display = 'none';
      document.getElementById('post-auth').style.display = 'block';
      document.getElementById('post-token-screen').style.display = 'none';
      document.getElementById('post-form').style.display = 'none';
      // Auto-fill today's date
      const now = new Date();
      const months = ['january','february','march','april','may','june','july','august','september','october','november','december'];
      document.getElementById('post-date').value = months[now.getMonth()] + ' ' + now.getFullYear();
    }

    function closePostOverlay() {
      document.getElementById('post-overlay').style.display = 'none';
    }

    function checkPostPassword() {
      const input = document.getElementById('post-password-input').value;
      if (input === POST_PASSWORD) {
        document.getElementById('post-auth').style.display = 'none';
        document.getElementById('post-token-screen').style.display = 'block';
        document.getElementById('post-token-input').value = '';
        document.getElementById('post-token-error').style.display = 'none';
      } else {
        document.getElementById('post-auth-error').style.display = 'block';
      }
    }

    function checkPostToken() {
      const token = document.getElementById('post-token-input').value.trim();
      if (token) {
        githubToken = token;
        document.getElementById('post-token-screen').style.display = 'none';
        document.getElementById('post-form').style.display = 'block';
      } else {
        document.getElementById('post-token-error').style.display = 'block';
      }
    }

    // ── Simple markdown to HTML converter ──
    function markdownToHtml(md) {
      return md.split('\n\n').map(block => {
        const trimmed = block.trim();
        if (!trimmed) return '';
        // Raw HTML passthrough — leave unchanged
        if (trimmed.startsWith('<')) return trimmed;
        // Markdown block — escape then apply inline formatting
        const escaped = trimmed
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
          .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1"/>');
        return `<p>${escaped.replace(/\n/g, '<br>')}</p>`;
      }).join('\n');
    }

    // ── Toggle lately fields ──
    function toggleLatelyFields() {
      const category = document.getElementById('post-category').value;
      const isLately = category === 'lately';
      const showGallery = category === 'food' || category === 'stubby';
      document.getElementById('post-content-wrap').style.display  = isLately ? 'none' : '';
      document.getElementById('post-lately-fields').style.display = isLately ? '' : 'none';
      document.getElementById('post-images-wrap').style.display   = (!isLately && showGallery) ? '' : 'none';
    }

    // ── Build lately post content HTML ──
    function buildLatelyContent(title, whereAt, intoText, note, imageUrl) {
      const toBullets = text => text.split('\n')
        .map(l => l.trim()).filter(Boolean)
        .map(l => `<li style="margin-bottom:4px;">– ${l}</li>`).join('\n        ');

      const noteHtml = note ? `
      <div style="border-top:1px dashed rgba(160,144,152,0.45); margin:14px 0 10px;"></div>
      <p style="font-family:'Press Start 2P',monospace; font-size:7px; color:var(--pixel-label2); margin-bottom:8px;">♡ a note:</p>
      <p style="font-style:italic; color:var(--muted);">${note}</p>` : '';

      return `<div class="post-content">
      <div style="font-family:'Press Start 2P',monospace; font-size:8px; color:var(--pixel-label2); margin-bottom:16px;">${title}</div>
      <p style="font-family:'Press Start 2P',monospace; font-size:7px; color:var(--pixel-label2); margin-bottom:8px;">where i'm at (ᐢ. .ᐢ):</p>
      <ul style="list-style:none; padding:0; margin-bottom:14px; font-size:14px; line-height:1.75;">
        ${toBullets(whereAt)}
      </ul>
      <div style="text-align:center; color:var(--muted); margin:14px 0; letter-spacing:4px;">♡ · ♡ · ♡</div>
      <p style="font-family:'Press Start 2P',monospace; font-size:7px; color:var(--pixel-label2); margin-bottom:8px;">what i'm into:</p>
      <ul style="list-style:none; padding:0; margin-bottom:14px; font-size:14px; line-height:1.75;">
        ${toBullets(intoText)}
      </ul>${noteHtml}
      ${imageUrl ? `<img src="${imageUrl}" alt="${title}" style="max-width:100%;margin:12px 0;display:block;border:1px solid rgba(255,255,255,0.68);"/>` : ''}
    </div>`;
    }

    // ── Build post image gallery HTML ──
    function buildPostGallery(images, basePath) {
      if (images.length === 0) return '';
      if (images.length === 1) {
        return `<img src="${basePath}${images[0]}" alt="" style="max-width:100%;border:1px solid var(--frosted-border);margin:10px 0;display:block;"/>`;
      }
      const total = images.length;
      const slideImgs = images.map(f => `<img class="slide-img" src="${basePath}${f}" alt=""/>`).join('\n        ');
      return `<style>
.stubby-slideshow{position:relative;margin-bottom:12px;}
.slide-track-wrapper{overflow:hidden;width:100%;max-height:400px;border:1px solid var(--frosted-border);border-radius:3px;}
.slide-track{display:flex;transition:transform 0.4s ease;}
.slide-img{min-width:100%;width:100%;height:auto;max-height:400px;object-fit:contain;object-position:center;background:rgba(0,0,0,0.03);flex-shrink:0;display:block;}
.slide-btn{position:absolute;top:50%;transform:translateY(-50%);z-index:2;background:rgba(255,255,255,0.6);border:1px solid var(--frosted-border);color:var(--pixel-label);font-size:10px;width:24px;height:24px;display:flex;align-items:center;justify-content:center;cursor:pointer;}
.slide-prev{left:4px;}
.slide-next{right:4px;}
.slide-dots{display:flex;justify-content:center;gap:5px;margin-top:6px;}
.slide-dot{width:6px;height:6px;border-radius:50%;background:var(--pink-pale);border:1px solid var(--pink);cursor:pointer;}
.slide-dot.active{background:var(--pink);}
</style>
<div class="stubby-slideshow" style="position:relative;margin:12px 0;">
  <button class="slide-btn slide-prev" onclick="postSlidePrev()">◀</button>
  <div class="slide-track-wrapper"><div class="slide-track" id="post-slide-track">
        ${slideImgs}
  </div></div>
  <button class="slide-btn slide-next" onclick="postSlideNext()">▶</button>
  <div class="slide-dots" id="post-slide-dots"></div>
</div>
<script>
(function(){
  const total=${total};
  let cur=0;
  function goTo(n){cur=(n+total)%total;document.getElementById('post-slide-track').style.transform='translateX(-'+cur*100+'%)';document.querySelectorAll('#post-slide-dots .slide-dot').forEach((d,i)=>d.classList.toggle('active',i===cur));}
  window.postSlideNext=function(){goTo(cur+1);};
  window.postSlidePrev=function(){goTo(cur-1);};
  document.addEventListener('DOMContentLoaded',function(){
    const dotsEl=document.getElementById('post-slide-dots');
    for(let i=0;i<total;i++){const d=document.createElement('div');d.className='slide-dot'+(i===0?' active':'');d.onclick=()=>goTo(i);dotsEl.appendChild(d);}
    goTo(0);
  });
})();
<\/script>`;
    }

    // ── Publish post via GitHub API ──
    async function publishPost() {
      const category   = document.getElementById('post-category').value;
      const title      = document.getElementById('post-title').value.trim();
      const date       = document.getElementById('post-date').value.trim();
      const imageUrl   = document.getElementById('post-image').value.trim();
      const imagesRaw  = document.getElementById('post-images').value.trim();
      const images     = imagesRaw ? imagesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
      const imgBasePath = `/images/${category}/`;
      const status     = document.getElementById('post-status');

      const isLately = category === 'lately';
      const content  = isLately ? '' : document.getElementById('post-content').value.trim();
      const whereAt  = isLately ? document.getElementById('post-lately-whereat').value.trim() : '';
      const intoText = isLately ? document.getElementById('post-lately-intotext').value.trim() : '';
      const note     = isLately ? document.getElementById('post-lately-note').value.trim() : '';

      if (!title || (!isLately && !content) || (isLately && (!whereAt || !intoText))) {
        status.textContent = isLately
          ? 'title, where i\'m at, and what i\'m into are required (˘･_･˘)'
          : 'title and content are required (˘･_･˘)';
        status.style.color = 'var(--pink)';
        return;
      }

      // Generate filename: YYYY-MM-DD-slug.html
      const now = new Date();
      const dateStr = now.toISOString().slice(0,10);
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      const filename = `posts/${category}/${dateStr}-${slug}.html`;

      // Generate image HTML (single fallback when no gallery images)
      const imageHtml = imageUrl
        ? `<img src="${imageUrl}" alt="${title}" style="max-width:100%;margin:12px 0;display:block;border:1px solid rgba(255,255,255,0.68);"/>`
        : '';

      // Generate gallery HTML
      const galleryHtml = images.length > 0 ? buildPostGallery(images, imgBasePath) : imageHtml;

      // Generate post HTML
      const postHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — me0wberry</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Lora:ital,wght@1,400&display=swap" rel="stylesheet">
<style>
:root{--pink:#e07090;--pink-light:#f4a8b8;--pink-pale:#ffd0de;--green:#5aaa6a;--green-light:#a8d8a0;--cream:#fdf6f0;--heading:#8b3a5a;--body:#4a3a42;--muted:#a09098;--pixel-label:#b05a7a;--pixel-label2:#c07090;--frosted-bg:rgba(255,255,255,0.42);--frosted-border:rgba(255,255,255,0.68);}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{font-family:system-ui,sans-serif;font-size:14px;color:var(--body);line-height:1.7;min-height:100%;}
body{background:linear-gradient(135deg,#a8e6a3 0%,#c9e8c5 25%,#e8ddd5 50%,#f2c4ce 75%,#f4a8b8 100%);padding:20px;}
.post-container{max-width:680px;margin:0 auto;background:var(--frosted-bg);backdrop-filter:blur(10px);border:2px solid var(--frosted-border);}
.post-titlebar{background:rgba(255,255,255,0.55);border-bottom:2px solid var(--frosted-border);padding:6px 10px;}
.post-titlebar-text{font-family:'Press Start 2P',monospace;font-size:8px;color:var(--pixel-label);}
.post-body{padding:16px 18px;}
.post-pixel-tag{font-family:'Press Start 2P',monospace;font-size:6px;color:var(--pixel-label2);background:rgba(255,255,255,0.5);border:1px solid rgba(192,112,144,0.4);padding:3px 7px;display:inline-block;margin-bottom:8px;}
.post-heading{font-family:'Lora',serif;font-style:italic;font-size:22px;color:var(--heading);margin-bottom:4px;}
.post-date{font-style:italic;font-size:11px;color:var(--muted);margin-bottom:16px;}
.post-content{font-size:14px;line-height:1.75;}
.post-content p{margin-bottom:12px;}
.post-content img{max-width:100%;border:1px solid var(--frosted-border);margin:8px 0;display:block;}
.post-content a{color:var(--pink);text-decoration:underline dotted;}
.post-footer{margin-top:18px;padding-top:12px;border-top:1px dashed rgba(160,144,152,0.45);display:flex;justify-content:space-between;align-items:center;}
.post-back{font-size:12px;color:var(--muted);text-decoration:none;}
.post-back:hover{color:var(--pink);}
</style>
</head>
<body>
<div class="post-container">
  <div class="post-titlebar"><span class="post-titlebar-text">${category} · ${title}</span></div>
  <div class="post-body">
    <div class="post-pixel-tag">/ ${category}</div>
    <div class="post-heading">${title}</div>
    <div class="post-date">${date}</div>
    ${isLately ? buildLatelyContent(title, whereAt, intoText, note, imageUrl) : `<div class="post-content">${markdownToHtml(content)}</div>`}
    ${isLately ? '' : galleryHtml}
    <div class="post-footer">
      <div style="display:flex;flex-direction:column;gap:4px;">
        <a href="/" class="post-back">← back to me0wberry.com</a>
        <a href="/archive" class="post-back">← back to archive</a>
      </div>
      <span style="font-size:11px;color:var(--muted)">${date}</span>
    </div>
  </div>
</div>
</body>
</html>`;

      // Also update the posts index JSON
      const indexPath = `posts/${category}/index.json`;

      status.textContent = 'publishing... ♡';
      status.style.color = 'var(--muted)';

      try {
        // 1. Create the post HTML file
        const postB64 = btoa(unescape(encodeURIComponent(postHtml)));
        const postRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${filename}`, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${githubToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `new post: ${title}`,
            content: postB64,
            branch: GITHUB_BRANCH
          })
        });
        if (!postRes.ok) throw new Error('failed to create post file');

        // 2. Read existing index.json or create new
        let posts = [];
        let indexSha = null;
        try {
          const indexRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${indexPath}`, {
            headers: { 'Authorization': `token ${githubToken}` }
          });
          if (indexRes.ok) {
            const indexData = await indexRes.json();
            indexSha = indexData.sha;
            posts = JSON.parse(atob(indexData.content.replace(/\n/g,'')));
          }
        } catch(e) { /* no index yet, start fresh */ }

        // 3. Prepend new post to index
        posts.unshift({ title, date, file: filename, slug, images });

        // 4. Save updated index.json
        const indexB64 = btoa(unescape(encodeURIComponent(JSON.stringify(posts, null, 2))));
        const indexBody = { message: `update index: ${title}`, content: indexB64, branch: GITHUB_BRANCH };
        if (indexSha) indexBody.sha = indexSha;
        await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${indexPath}`, {
          method: 'PUT',
          headers: { 'Authorization': `token ${githubToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(indexBody)
        });

        status.textContent = 'published! ✦ deploying in ~1 min';
        status.style.color = 'var(--green)';

        // Update UI immediately without reload
        updateCategoryPanel(category, posts);

        setTimeout(() => closePostOverlay(), 2000);

      } catch(err) {
        status.textContent = 'something went wrong (˘･_･˘) try again';
        status.style.color = 'var(--pink)';
        console.error(err);
      }
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
