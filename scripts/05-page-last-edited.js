(() => {
  const pageDates = window.me0wberryPageLastEdited;
  if (!pageDates) return;

  function currentPageKey() {
    let pathname = decodeURIComponent(window.location.pathname).replace(/\\/g, '/');
    if (pathname.endsWith('/')) pathname += 'index.html';
    return Object.keys(pageDates)
      .sort((left, right) => right.length - left.length)
      .find((key) => pathname === key || pathname.endsWith(`/${key}`));
  }

  function formatLastEdited(timestamp) {
    const date = new Date(timestamp);
    const dateParts = new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
      timeZone: 'America/Toronto',
      year: 'numeric',
    }).formatToParts(date);
    const part = (type) => dateParts.find((entry) => entry.type === type)?.value || '';
    const time = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: true,
      minute: '2-digit',
      timeZone: 'America/Toronto',
    }).format(date).toLowerCase();

    return `last edited: ${part('month').toLowerCase()} ${part('day')} , ${part('year')} / ${time}`;
  }

  function addLastEditedLabel() {
    const pageKey = currentPageKey();
    const navigation = document.querySelector('.page-nav-row');
    if (!pageKey || !navigation || document.querySelector('.page-last-edited')) return;

    const label = document.createElement('div');
    const time = document.createElement('time');
    label.className = 'pixel-tag page-last-edited';
    time.dateTime = pageDates[pageKey];
    time.textContent = formatLastEdited(pageDates[pageKey]);
    label.append(time);
    navigation.insertAdjacentElement('afterend', label);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addLastEditedLabel, { once: true });
  } else {
    addLastEditedLabel();
  }
})();
