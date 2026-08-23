(function() {
  const poll = document.querySelector('[data-monthly-poll]');
  if (!poll) return;

  const pollId = poll.dataset.pollId;
  const namespace = 'me0wberry.com';
  const action = 'monthly-poll';
  const storageKey = `me0wberry_poll_${pollId}`;
  const buttons = Array.from(poll.querySelectorAll('[data-poll-option]'));
  const status = poll.querySelector('[data-poll-status]');
  const counts = new Map();
  let savedVote = '';

  try { savedVote = window.localStorage.getItem(storageKey) || ''; } catch (error) {}
  const validOptions = buttons.map(button => button.dataset.pollOption);
  if (!validOptions.includes(savedVote)) savedVote = '';

  function counterUrl(option, readOnly) {
    const key = `${pollId}-${option}`;
    const params = new URLSearchParams({ behavior: 'vote' });
    if (readOnly) params.set('readOnly', 'true');
    return `https://counterapi.com/api/${namespace}/${action}/${encodeURIComponent(key)}?${params}`;
  }

  async function readCounter(option, readOnly = true) {
    const response = await fetch(counterUrl(option, readOnly), { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`counter returned ${response.status}`);
    const data = await response.json();
    return Number(data.value) || 0;
  }

  function renderResults() {
    const total = Array.from(counts.values()).reduce((sum, value) => sum + value, 0);
    buttons.forEach(button => {
      const option = button.dataset.pollOption;
      const value = counts.get(option) || 0;
      const percent = total ? Math.round((value / total) * 100) : 0;
      const count = button.querySelector('[data-poll-count]');
      const fill = button.querySelector('[data-poll-fill]');
      count.textContent = `${value} ${value === 1 ? 'vote' : 'votes'} · ${percent}%`;
      fill.style.width = `${percent}%`;
      button.setAttribute('aria-label', `${option}: ${value} ${value === 1 ? 'vote' : 'votes'}, ${percent} percent`);
      button.classList.toggle('is-selected', option === savedVote);
      button.disabled = Boolean(savedVote);
    });
  }

  async function loadResults() {
    status.textContent = 'counting votes . . .';
    const results = await Promise.allSettled(buttons.map(async button => {
      const option = button.dataset.pollOption;
      counts.set(option, await readCounter(option));
    }));
    if (results.some(result => result.status === 'rejected')) {
      status.textContent = 'the poll results are taking a little nap right now (ᐢ. .ᐢ)';
      return;
    }
    renderResults();
    status.textContent = savedVote ? `you picked ${savedVote} ♡` : 'pick one answer ♡';
  }

  buttons.forEach(button => {
    button.addEventListener('click', async function() {
      if (savedVote) return;
      const option = button.dataset.pollOption;
      buttons.forEach(item => { item.disabled = true; });
      status.textContent = 'sending your vote . . .';
      try {
        counts.set(option, await readCounter(option, false));
        savedVote = option;
        try { window.localStorage.setItem(storageKey, option); } catch (error) {}
        renderResults();
        status.textContent = `you picked ${option} ♡`;
      } catch (error) {
        buttons.forEach(item => { item.disabled = false; });
        status.textContent = 'that vote did not make it through , please try again ˖°';
      }
    });
  });

  loadResults();
})();
