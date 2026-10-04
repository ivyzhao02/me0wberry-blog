(function () {
  const list = document.getElementById('league-post-list');

  async function renderRelatedPosts() {
    if (!list) return;
    const posts = typeof window.loadMe0wberrySearchPosts === 'function'
      ? await window.loadMe0wberrySearchPosts()
      : window.me0wberrySearchIndex?.posts;
    if (!Array.isArray(posts)) return;

    const matches = posts.filter((post) => {
      const searchable = `${post.title || ''} ${post.text || ''}`;
      return /league of legends|riot games|\bsona\b|\bnami\b|\bsoraka\b|\bseraphine\b/i.test(searchable);
    });

    list.innerHTML = '';
    if (!matches.length) {
      list.innerHTML = '<li>no match notes yet ♡</li>';
      return;
    }

    matches.forEach((post) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      const date = document.createElement('small');
      link.href = new URL(`../../${post.url.replace(/^\//, '')}`, window.location.href).href;
      link.textContent = `${post.title} ↗`;
      date.textContent = `${post.category} / ${post.date}`;
      item.append(link, date);
      list.appendChild(item);
    });
  }

  renderRelatedPosts();
})();
