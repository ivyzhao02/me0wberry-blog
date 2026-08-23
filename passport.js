(function() {
  const STORAGE_KEY = 'me0wberry_passport_v1';
  const STAMP_IDS = ['wander', 'naranya', 'love-ball', 'pixel-cat'];
  let toastTimer = 0;

  function readState() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
      const stamps = Array.isArray(saved.stamps)
        ? saved.stamps.filter((stamp) => STAMP_IDS.includes(stamp))
        : [];
      return { stamps: Array.from(new Set(stamps)) };
    } catch (error) {
      return { stamps: [] };
    }
  }

  function writeState(state) {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) {}
  }

  function showToast(count) {
    if (!document.querySelector('link[href$="style.css"]') && !document.querySelector('style[data-passport-toast-style]')) {
      const style = document.createElement('style');
      style.dataset.passportToastStyle = '';
      style.textContent = '.passport-toast{position:fixed;z-index:10000;top:20px;right:20px;max-width:calc(100% - 40px);padding:10px 13px;color:var(--heading,#8b3a5a);border:1px solid rgba(192,112,144,.34);border-radius:12px;background:rgba(255,246,248,.96);box-shadow:inset 0 1px 0 rgba(255,255,255,.88),0 12px 28px rgba(91,68,81,.16);font-family:"Press Start 2P",monospace;font-size:6px;line-height:1.7;opacity:0;transform:translateY(10px);transition:opacity .18s ease,transform .18s ease;pointer-events:none}.passport-toast.is-visible{opacity:1;transform:translateY(0)}';
      document.head.appendChild(style);
    }

    let toast = document.querySelector('[data-passport-toast]');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'passport-toast';
      toast.dataset.passportToast = '';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }

    toast.textContent = `passport stamp found ♡ ${count} / ${STAMP_IDS.length}`;
    toast.classList.remove('is-visible');
    window.requestAnimationFrame(() => toast.classList.add('is-visible'));
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  function renderProgress() {
    const state = readState();
    const count = state.stamps.length;
    const complete = count === STAMP_IDS.length;

    document.querySelectorAll('[data-passport-progress]').forEach((passport) => {
      passport.hidden = count === 0;
      passport.classList.toggle('is-complete', complete);

      passport.querySelectorAll('[data-passport-slot]').forEach((slot, index) => {
        const found = state.stamps.includes(STAMP_IDS[index]);
        slot.textContent = found ? '✓' : '?';
        slot.classList.toggle('is-stamped', found);
        slot.setAttribute('aria-label', `stamp ${index + 1} ${found ? 'found' : 'not found'}`);
      });

      const status = passport.querySelector('[data-passport-status]');
      if (status) {
        status.textContent = complete
          ? '4 / 4 stamps found · something arrived for you ♡'
          : `${count} / ${STAMP_IDS.length} stamps found`;
      }

      const rewardButton = passport.querySelector('[data-passport-reward]');
      if (rewardButton) rewardButton.hidden = !complete;
    });
  }

  function stamp(stampId, options = {}) {
    if (!STAMP_IDS.includes(stampId)) return false;
    const state = readState();
    if (state.stamps.includes(stampId)) return false;

    state.stamps.push(stampId);
    writeState(state);
    renderProgress();
    if (options.toast !== false) showToast(state.stamps.length);
    window.dispatchEvent(new CustomEvent('me0wberry:passport-change', { detail: { count: state.stamps.length } }));
    return true;
  }

  function bindStampTriggers() {
    document.querySelectorAll('[data-passport-stamp]').forEach((trigger) => {
      if (trigger.dataset.passportBound) return;
      trigger.dataset.passportBound = 'true';

      if (!(trigger instanceof HTMLButtonElement) && !(trigger instanceof HTMLAnchorElement)) {
        trigger.setAttribute('role', 'button');
        trigger.setAttribute('tabindex', '0');
        if (!trigger.hasAttribute('aria-label')) trigger.setAttribute('aria-label', 'inspect this tiny detail');
        trigger.addEventListener('keydown', (event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          trigger.click();
        });
      }

      trigger.addEventListener('click', () => stamp(trigger.dataset.passportStamp));
    });
  }

  function initReward() {
    const dialog = document.querySelector('[data-passport-dialog]');
    if (!dialog) return;

    const envelope = dialog.querySelector('[data-passport-envelope]');
    const postcardStage = dialog.querySelector('[data-passport-postcard-stage]');
    const postcard = dialog.querySelector('[data-passport-postcard]');
    const instruction = dialog.querySelector('[data-passport-instruction]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resetReward() {
      envelope.classList.remove('is-open');
      envelope.disabled = false;
      postcardStage.classList.remove('is-revealed');
      postcard.classList.remove('is-flipped');
      postcard.setAttribute('aria-pressed', 'false');
      postcard.setAttribute('tabindex', '-1');
      instruction.textContent = 'open the envelope ♡';
    }

    document.querySelectorAll('[data-passport-reward]').forEach((button) => {
      button.addEventListener('click', () => {
        resetReward();
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');
        envelope.focus();
      });
    });

    dialog.querySelector('[data-passport-close]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });

    envelope.addEventListener('click', () => {
      if (envelope.classList.contains('is-open')) return;
      envelope.classList.add('is-open');
      envelope.disabled = true;
      instruction.textContent = 'your postcard is here . . .';
      window.setTimeout(() => {
        postcardStage.classList.add('is-revealed');
        postcard.setAttribute('tabindex', '0');
        instruction.textContent = 'flip the postcard over ↻';
        postcard.focus();
      }, reducedMotion ? 0 : 650);
    });

    postcard.addEventListener('click', () => {
      const flipped = !postcard.classList.contains('is-flipped');
      postcard.classList.toggle('is-flipped', flipped);
      postcard.setAttribute('aria-pressed', flipped ? 'true' : 'false');
      instruction.textContent = flipped ? 'rest complete ♡' : 'flip the postcard over ↻';
    });
  }

  function init() {
    bindStampTriggers();
    renderProgress();
    initReward();
    try {
      if (window.sessionStorage.getItem('me0wberry_passport_pending_toast')) {
        window.sessionStorage.removeItem('me0wberry_passport_pending_toast');
        window.setTimeout(() => showToast(readState().stamps.length), 180);
      }
    } catch (error) {}
  }

  window.me0wberryPassport = { stamp, read: readState, render: renderProgress };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
