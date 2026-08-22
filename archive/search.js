(() => {
  const input = document.getElementById('archive-search');
  const clearButton = document.getElementById('archive-search-clear');
  const status = document.getElementById('archive-search-status');
  const results = document.getElementById('archive-search-results');

  if (!input || !clearButton || !status || !results) return;

  let posts = [];

  function normalize(value) {
    return String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  function makeExcerpt(post, tokens) {
    const text = String(post.text || post.summary || '').replace(/\s+/g, ' ').trim();
    if (!text) return '';
    const normalized = normalize(text);
    const positions = tokens.map((token) => normalized.indexOf(token)).filter((index) => index >= 0);
    const firstMatch = positions.length ? Math.min(...positions) : 0;
    const start = Math.max(0, firstMatch - 70);
    const end = Math.min(text.length, start + 210);
    return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`;
  }

  function renderPost(post, tokens) {
    const item = document.createElement('article');
    item.className = 'archive-search-result';

    const link = document.createElement('a');
    link.className = 'archive-search-result-title';
    link.href = post.url;
    link.textContent = post.title;

    const meta = document.createElement('div');
    meta.className = 'archive-search-result-meta';
    meta.textContent = `${post.category} · ${post.date}`;

    const summary = document.createElement('p');
    summary.className = 'archive-search-result-summary';
    summary.textContent = makeExcerpt(post, tokens);

    item.append(link, meta, summary);
    return item;
  }

  function runSearch() {
    const query = input.value.trim();
    const tokens = normalize(query).split(/\s+/).filter(Boolean);
    results.replaceChildren();

    if (!tokens.length) {
      results.hidden = true;
      status.textContent = 'searches titles , categories & the words inside posts';
      return;
    }

    const matches = posts.filter((post) => {
      const searchable = normalize(`${post.title} ${post.date} ${post.category} ${post.text}`);
      return tokens.every((token) => searchable.includes(token));
    });

    status.textContent = `${matches.length} post${matches.length === 1 ? '' : 's'} found for “${query}”`;
    results.hidden = false;
    matches.slice(0, 30).forEach((post) => results.appendChild(renderPost(post, tokens)));
  }

  async function loadSearch() {
    try {
      const response = await fetch('/data/search-index.json');
      if (!response.ok) throw new Error(`search index returned ${response.status}`);
      const data = await response.json();
      posts = Array.isArray(data.posts) ? data.posts : [];
      input.disabled = false;
      clearButton.disabled = false;
      status.textContent = 'searches titles , categories & the words inside posts';
      if (input.value.trim()) runSearch();
    } catch (error) {
      status.textContent = 'search is taking a little nap right now (ᐢ. .ᐢ)';
      console.error('Could not load the archive search index.', error);
    }
  }

  input.addEventListener('input', runSearch);
  clearButton.addEventListener('click', () => {
    input.value = '';
    runSearch();
    input.focus();
  });

  loadSearch();
})();
