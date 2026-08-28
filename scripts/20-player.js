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
        const resume = function() {
          audio.play().then(function() {
            setPlayPauseState(true);
          }).catch(function() {
            setPlayPauseState(false);
          });
        };
        if (audio.readyState >= 2) resume();
        else audio.addEventListener('canplay', resume, { once: true });
      }
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

    function playerPlayTrack(trackId) {
      const trackIndex = tracks.findIndex(track => track.id === trackId);
      if (trackIndex < 0) return;
      loadTrack(trackIndex);
      openPanel('panel-player');
      audio.play().then(function() {
        setPlayPauseState(true);
      }).catch(function() {
        setPlayPauseState(false);
      });
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
