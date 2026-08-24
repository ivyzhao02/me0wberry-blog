    // ── Audio Player ──
    const tracks = [
      { id: 'lace', src: sitePath('/audio/please-dont-stop.mp3'), title: "please don't stop being sweet to me · lace" },
      { id: 'forever-and', src: sitePath('/audio/forever-and.mp3'), title: 'forever & · EJEAN' },
      { id: 'meteor-rain', src: sitePath('/audio/huayuan-meteor-rain.mp3'), title: '花园裡的流星雨 · Karencici' },
      { id: 'angel-loading', src: sitePath('/audio/tianshi-jiazaizhong.mp3'), title: '天使加载中...^_−☆ · Angels of Delusion' },
      { id: 'redreaming-angel', src: sitePath('/audio/redreaming-angel.mp3'), title: 'ReDreaming Angel · Angels of Delusion' },
      { id: 'national-park-gsc', src: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview117/v4/e9/06/f7/e906f78d-1e80-0e1b-e616-93a116c705cb/mzaf_6047781193972057181.plus.aac.p.m4a', title: 'national park (gold / silver) · GAME FREAK' },
      { id: 'national-park-hgss', src: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview127/v4/1e/9b/24/1e9b2416-0656-a1a7-8acf-7196022d36b6/mzaf_5043987050176404935.plus.aac.p.m4a', title: 'national park (heartgold / soulsilver) · GAME FREAK' },
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
