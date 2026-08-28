(function() {
  const PLAYER_HANDOFF_KEY = 'me0wberry_player_handoff_v1';
  const app = new URLSearchParams(window.location.search).get('app');
  const supportedApps = new Set(['gifypets', 'player']);
  const activeApp = supportedApps.has(app) ? app : 'gifypets';
  const title = document.getElementById('popout-title');

  document.querySelectorAll('[data-popout-app]').forEach(section => {
    section.hidden = section.dataset.popoutApp !== activeApp;
  });
  title.textContent = activeApp === 'player' ? '♪ popped out player' : '🐾 popped out gifypets';
  document.title = `${activeApp} · me0wberry.com`;

  function showGifypet(pet) {
    document.querySelectorAll('[data-popout-gifypet-tab]').forEach(tab => {
      const isActive = tab.dataset.popoutGifypetTab === pet;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    document.querySelectorAll('[data-popout-gifypet-stage]').forEach(stage => {
      stage.classList.toggle('is-active', stage.dataset.popoutGifypetStage === pet);
    });
  }

  document.querySelectorAll('[data-popout-gifypet-tab]').forEach(tab => {
    tab.addEventListener('click', () => showGifypet(tab.dataset.popoutGifypetTab));
  });
  window.me0wberryShowGifypet = showGifypet;
  showGifypet(new URLSearchParams(window.location.search).get('pet') === 'cactus' ? 'cactus' : 'stubby');

  function resolveTrackSource(source) {
    if (!source.startsWith('/')) return source;
    return new URL(`../${source.slice(1)}`, window.location.href).href;
  }

  function readPlayerState() {
    try {
      return JSON.parse(window.localStorage.getItem(PLAYER_HANDOFF_KEY) || 'null');
    } catch (error) {
      return null;
    }
  }

  function initPlayer() {
    const tracks = (window.me0wberryTrackCatalog || []).map(track => ({
      ...track,
      src: resolveTrackSource(track.src),
    }));
    if (!tracks.length) return;

    const audio = document.getElementById('popout-player-audio');
    const titleEl = document.getElementById('popout-player-title');
    const progress = document.getElementById('popout-player-progress');
    const currentTime = document.getElementById('popout-player-current-time');
    const totalTime = document.getElementById('popout-player-total-time');
    const volume = document.getElementById('popout-player-volume');
    const counter = document.getElementById('popout-player-counter');
    const playPause = document.getElementById('popout-player-playpause');
    let currentTrack = 0;

    function fmtTime(seconds) {
      if (!seconds || Number.isNaN(seconds)) return '0:00';
      const minutes = Math.floor(seconds / 60);
      const remainder = Math.floor(seconds % 60);
      return `${minutes}:${remainder < 10 ? '0' : ''}${remainder}`;
    }

    function setPlaying(playing) {
      playPause.classList.toggle('is-playing', playing);
      playPause.textContent = playing ? '❚❚' : '▶';
    }

    function playerState() {
      return {
        trackId: tracks[currentTrack].id,
        currentTime: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
        volume: audio.volume,
        playing: !audio.paused,
        updatedAt: Date.now(),
      };
    }

    function persistState() {
      try {
        window.localStorage.setItem(PLAYER_HANDOFF_KEY, JSON.stringify(playerState()));
      } catch (error) {}
    }

    function loadTrack(index, options = {}) {
      currentTrack = (index + tracks.length) % tracks.length;
      const track = tracks[currentTrack];
      titleEl.textContent = track.title;
      audio.src = track.src;
      counter.textContent = `track ${currentTrack + 1} / ${tracks.length}`;
      progress.value = 0;
      currentTime.textContent = '0:00';
      totalTime.textContent = '0:00';
      setPlaying(false);

      const seekTo = Number(options.time) || 0;
      if (seekTo > 0) {
        audio.addEventListener('loadedmetadata', function seekOnce() {
          audio.currentTime = audio.duration ? Math.min(seekTo, audio.duration) : seekTo;
        }, { once: true });
      }
      if (options.playing) {
        audio.addEventListener('canplay', function resumeOnce() {
          audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
        }, { once: true });
      }
    }

    function changeTrack(step) {
      const wasPlaying = !audio.paused;
      loadTrack(currentTrack + step, { playing: wasPlaying });
    }

    playPause.addEventListener('click', () => {
      if (audio.paused) audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      else {
        audio.pause();
        setPlaying(false);
      }
    });
    document.getElementById('popout-player-prev').addEventListener('click', () => {
      if (audio.currentTime > 3) audio.currentTime = 0;
      else changeTrack(-1);
    });
    document.getElementById('popout-player-next').addEventListener('click', () => changeTrack(1));
    progress.addEventListener('input', () => {
      if (audio.duration) audio.currentTime = (Number(progress.value) / 100) * audio.duration;
    });
    volume.addEventListener('input', () => {
      audio.volume = Number(volume.value);
      persistState();
    });
    audio.addEventListener('loadedmetadata', () => {
      totalTime.textContent = fmtTime(audio.duration);
    });
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) progress.value = (audio.currentTime / audio.duration) * 100;
      currentTime.textContent = fmtTime(audio.currentTime);
      persistState();
    });
    audio.addEventListener('play', () => {
      setPlaying(true);
      persistState();
    });
    audio.addEventListener('pause', () => {
      setPlaying(false);
      persistState();
    });
    audio.addEventListener('ended', () => changeTrack(1));

    const saved = readPlayerState();
    const savedTrack = saved ? tracks.findIndex(track => track.id === saved.trackId) : 0;
    const savedVolume = Number(saved?.volume);
    audio.volume = Number.isFinite(savedVolume) ? Math.min(1, Math.max(0, savedVolume)) : 0.75;
    volume.value = audio.volume;
    loadTrack(savedTrack >= 0 ? savedTrack : 0, {
      time: saved?.currentTime,
      playing: !!saved?.playing,
    });

    window.addEventListener('beforeunload', persistState);
  }

  if (activeApp === 'player') initPlayer();

  document.getElementById('popout-close').addEventListener('click', () => window.close());
  document.getElementById('popout-return').addEventListener('click', () => {
    if (window.opener && !window.opener.closed && typeof window.opener.me0wberryDockUtility === 'function') {
      window.opener.me0wberryDockUtility(activeApp);
      return;
    }
    window.location.href = '../index.html?entered=1';
  });
})();
