(() => {
  let bubble;
  let active;
  let pinned = false;
  let closeTimer;
  let skipFocus;

  function safeUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value, window.location.href);
      return ['http:', 'https:', 'file:'].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  }

  function cancelClose() { window.clearTimeout(closeTimer); }

  function closeCredits() {
    cancelClose();
    if (active?.hasAttribute('aria-expanded')) active.setAttribute('aria-expanded', 'false');
    active?.removeAttribute('aria-describedby');
    if (bubble) {
      if (bubble.hasAttribute('popover') && bubble.matches(':popover-open')) bubble.hidePopover();
      bubble.hidden = true;
    }
    active = null;
    pinned = false;
  }

  function scheduleClose() {
    cancelClose();
    if (pinned) return;
    closeTimer = window.setTimeout(() => {
      if (bubble?.matches(':hover, :focus-within') || active?.matches(':hover, :focus-within')) return;
      closeCredits();
    }, 240);
  }

  function positionBubble() {
    if (!bubble || bubble.hidden || !active) return;
    const target = active.getBoundingClientRect();
    if (!active.getClientRects().length || target.bottom < 0 || target.top > innerHeight) {
      closeCredits();
      return;
    }
    const bounds = bubble.getBoundingClientRect();
    const left = Math.max(12, Math.min(target.left, innerWidth - bounds.width - 12));
    const below = target.bottom + 8;
    const top = below + bounds.height <= innerHeight - 12 ? below : target.top - bounds.height - 8;
    bubble.style.left = `${left}px`;
    bubble.style.top = `${Math.max(12, Math.min(top, innerHeight - bounds.height - 12))}px`;
  }

  function ensureBubble() {
    if (bubble) return;
    bubble = document.createElement('section');
    bubble.id = 'trinket-credit-bubble';
    bubble.className = 'trinket-credit-bubble';
    bubble.hidden = true;
    bubble.setAttribute('role', 'region');
    bubble.setAttribute('aria-label', 'item credits');
    if (typeof bubble.showPopover === 'function') bubble.setAttribute('popover', 'auto');
    bubble.addEventListener('pointerenter', cancelClose);
    bubble.addEventListener('pointerleave', scheduleClose);
    bubble.addEventListener('focusout', scheduleClose);
    bubble.addEventListener('toggle', event => {
      if (event.newState === 'closed' && !bubble.hidden) closeCredits();
    });
    document.body.appendChild(bubble);
    window.addEventListener('resize', positionBubble);
    document.addEventListener('scroll', positionBubble, { capture: true, passive: true });
    document.addEventListener('toyboxfilterchange', closeCredits);
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || bubble.hidden) return;
      const opener = active;
      const returnFocus = bubble.contains(document.activeElement);
      closeCredits();
      if (returnFocus) {
        skipFocus = opener;
        opener?.focus({ preventScroll: true });
      }
    });
    document.addEventListener('pointerdown', event => {
      if (bubble.hidden || bubble.contains(event.target) || active?.contains(event.target)) return;
      closeCredits();
    });
  }

  function showCredits(trigger, credit, pin) {
    cancelClose();
    if (pinned && !pin) return;
    ensureBubble();
    if (active?.hasAttribute('aria-expanded')) active.setAttribute('aria-expanded', 'false');
    active?.removeAttribute('aria-describedby');
    active = trigger;
    pinned = pin;
    const heading = document.createElement('h3');
    const close = document.createElement('button');
    const list = document.createElement('dl');
    heading.textContent = credit.title;
    close.type = 'button';
    close.className = 'trinket-credit-close';
    close.textContent = 'close';
    close.addEventListener('click', () => {
      const opener = active;
      closeCredits();
      skipFocus = opener;
      opener?.focus({ preventScroll: true });
    });
    for (const row of credit.rows) {
      const label = document.createElement('dt');
      const value = document.createElement('dd');
      label.textContent = row.label;
      const url = safeUrl(row.url);
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = row.text;
        value.appendChild(link);
      } else value.textContent = row.text;
      list.append(label, value);
    }
    bubble.replaceChildren(close, heading, list);
    if (credit.note) {
      const note = document.createElement('p');
      note.className = 'trinket-credit-note';
      note.textContent = credit.note;
      bubble.appendChild(note);
    }
    bubble.hidden = false;
    if (bubble.hasAttribute('popover') && !bubble.matches(':popover-open')) bubble.showPopover();
    trigger.setAttribute('aria-describedby', bubble.id);
    if (pin) trigger.setAttribute('aria-expanded', 'true');
    positionBubble();
    if (pin) close.focus({ preventScroll: true });
  }

  window.attachTrinketCredits = (trigger, credit, { hover = false } = {}) => {
    if (!trigger || !credit) return;
    ensureBubble();
    if (hover) {
      trigger.addEventListener('pointerenter', event => {
        if (event.pointerType !== 'touch') showCredits(trigger, credit, false);
      });
      trigger.addEventListener('pointerleave', scheduleClose);
      trigger.addEventListener('focus', () => {
        if (skipFocus === trigger) { skipFocus = null; return; }
        if (trigger.matches(':focus-visible')) showCredits(trigger, credit, false);
      });
      trigger.addEventListener('blur', scheduleClose);
    } else {
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-controls', 'trinket-credit-bubble');
      trigger.addEventListener('click', () => {
        if (active === trigger && pinned) closeCredits();
        else showCredits(trigger, credit, true);
      });
    }
  };

  document.querySelectorAll('[data-credit-source]').forEach(trigger => {
    window.attachTrinketCredits(trigger, {
      title: trigger.dataset.creditTitle,
      rows: [
        { label: 'original creator', text: 'not listed in the archive' },
        { label: 'source', text: trigger.dataset.creditSourceLabel, url: trigger.dataset.creditSource },
        { label: 'source file', text: 'original file recorded by Luna Town', url: trigger.dataset.creditFile },
        { label: 'collection', text: trigger.dataset.creditCollection },
        { label: 'archive', text: 'Luna Town item record', url: trigger.dataset.creditArchive }
      ]
    });
  });
})();
